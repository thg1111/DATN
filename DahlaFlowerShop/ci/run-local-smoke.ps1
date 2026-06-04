param(
    [string]$BaseUrl = "https://localhost:7114",
    [string]$AdminUsername = "",
    [string]$AdminPassword = "",
    [int]$WaitTimeoutSeconds = 180,
    [int]$MaxResponseTimeMs = 5000,
    [int]$FrontendPort = 5500,
    [string]$ProductSearchTerm = "",
    [string]$AccountSearchTerm = "",
    [switch]$SkipDbSetup,
    [switch]$SkipDotnetValidation,
    [switch]$SkipSelenium,
    [switch]$DisablePerfAssertion,
    [switch]$KeepServices,
    [switch]$OpenReport,
    [string]$PythonExe = ""
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendRoot = Join-Path $repoRoot "frontend"
$reportsRoot = Join-Path $PSScriptRoot "reports"
$newmanReportsDir = Join-Path $reportsRoot "newman"
$serviceReportsDir = Join-Path $reportsRoot "services"

$services = @(
    @{
        Name = "Dahla Admin API"
        Project = Join-Path $repoRoot "backend\API_Dahla\API_Dahla\API_Dahla.csproj"
        Profile = "https"
        ReadyUrl = "http://localhost:5003/swagger/index.html"
        Ports = @(5003, 7079)
    },
    @{
        Name = "Dahla User API"
        Project = Join-Path $repoRoot "backend\Dahla_NguoiDung\Dahla_NguoiDung\Dahla_NguoiDung.csproj"
        Profile = "https"
        ReadyUrl = "http://localhost:5193/swagger/index.html"
        Ports = @(5193, 7023)
    },
    @{
        Name = "Dahla Gateway"
        Project = Join-Path $repoRoot "backend\Dahla_GateWays\Dahla_GateWays\Dahla_GateWays.csproj"
        Profile = "https"
        ReadyUrl = ""
        ReadyPort = 7114
        Ports = @(7114, 5075)
    }
)

$startedProcesses = New-Object System.Collections.Generic.List[System.Diagnostics.Process]

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host $Message
}

function Enable-LocalHttps {
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
}

function Test-UrlReady {
    param([string]$Url)

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
        return ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500)
    }
    catch {
        return $false
    }
}

function Resolve-PythonExecutable {
    param([string]$PreferredPythonExe = "")

    $candidates = New-Object System.Collections.Generic.List[string]

    if (-not [string]::IsNullOrWhiteSpace($PreferredPythonExe)) {
        $candidates.Add($PreferredPythonExe) | Out-Null
    }

    $pythonCommands = @(Get-Command python.exe -All -ErrorAction SilentlyContinue)
    foreach ($command in $pythonCommands) {
        if ($command.Source -and $command.Source -notlike "*\WindowsApps\*") {
            $candidates.Add($command.Source) | Out-Null
        }
    }

    $pyLauncher = Get-Command py.exe -ErrorAction SilentlyContinue
    if ($pyLauncher) {
        $launcherPython = & $pyLauncher.Source -3 -c "import sys; print(sys.executable)" 2>$null
        if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($launcherPython)) {
            $candidates.Add($launcherPython.Trim()) | Out-Null
        }
    }

    $patterns = @(
        "C:\Users\*\AppData\Local\Programs\Python\Python*\python.exe",
        "C:\Python*\python.exe",
        "C:\Program Files\Python*\python.exe",
        "C:\Program Files (x86)\Python*\python.exe"
    )

    foreach ($pattern in $patterns) {
        Get-ChildItem -Path $pattern -File -ErrorAction SilentlyContinue |
            ForEach-Object { $candidates.Add($_.FullName) | Out-Null }
    }

    foreach ($candidate in ($candidates | Where-Object { $_ } | Select-Object -Unique)) {
        if ((Test-Path -LiteralPath $candidate) -and (& $candidate --version 2>$null)) {
            return $candidate
        }
    }

    throw "Python executable was not found. Install Python, add python.exe to PATH, or run this script with -PythonExe <full path to python.exe>."
}

function Wait-Url {
    param(
        [string]$Name,
        [string]$Url,
        [int]$TimeoutSeconds
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-UrlReady -Url $Url) {
            Write-Host "$Name is ready: $Url"
            return
        }
        Start-Sleep -Seconds 2
    }

    throw "$Name was not ready after $TimeoutSeconds seconds: $Url"
}

function Wait-Port {
    param(
        [string]$Name,
        [int]$Port,
        [int]$TimeoutSeconds
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($listener) {
            Write-Host "$Name is listening on port $Port"
            return
        }
        Start-Sleep -Seconds 2
    }

    throw "$Name was not listening on port $Port after $TimeoutSeconds seconds"
}

function Get-ListeningProcess {
    param([int[]]$Ports)

    $listeners = @()
    foreach ($port in $Ports) {
        $listeners += Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    }

    $listeners |
        Sort-Object OwningProcess -Unique |
        ForEach-Object {
            $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
            [pscustomobject]@{
                Port = $_.LocalPort
                ProcessId = $_.OwningProcess
                ProcessName = if ($process) { $process.ProcessName } else { "" }
                Path = if ($process) { $process.Path } else { "" }
            }
        }
}

function Start-SmokeService {
    param([hashtable]$Service)

    if (-not [string]::IsNullOrWhiteSpace($Service.ReadyUrl) -and (Test-UrlReady -Url $Service.ReadyUrl)) {
        Write-Host "$($Service.Name) already running: $($Service.ReadyUrl)"
        return
    }

    if ([int]$Service.ReadyPort -gt 0) {
        $readyListener = Get-NetTCPConnection -LocalPort ([int]$Service.ReadyPort) -State Listen -ErrorAction SilentlyContinue
        if ($readyListener) {
            Write-Host "$($Service.Name) already listening on port $($Service.ReadyPort)"
            return
        }
    }

    $listeners = @(Get-ListeningProcess -Ports $Service.Ports)
    if ($listeners.Count -gt 0) {
        $details = ($listeners | ForEach-Object { "$($_.Port): PID $($_.ProcessId) $($_.ProcessName) $($_.Path)" }) -join "; "
        throw "$($Service.Name) cannot start because one of its ports is already in use: $details"
    }

    $safeName = ($Service.Name -replace "[^\w-]", "-").ToLowerInvariant()
    $stdout = Join-Path $serviceReportsDir "$safeName.out.log"
    $stderr = Join-Path $serviceReportsDir "$safeName.err.log"

    $arguments = @(
        "run",
        "--launch-profile", $Service.Profile,
        "--project", "`"$($Service.Project)`""
    )

    Write-Host "Starting $($Service.Name)"
    $process = Start-Process -FilePath "dotnet" `
        -ArgumentList $arguments `
        -WorkingDirectory $repoRoot `
        -RedirectStandardOutput $stdout `
        -RedirectStandardError $stderr `
        -PassThru `
        -WindowStyle Hidden

    $startedProcesses.Add($process) | Out-Null
}

function Start-Frontend {
    $frontendUrl = "http://127.0.0.1:$FrontendPort/index.html"
    if (Test-UrlReady -Url $frontendUrl) {
        Write-Host "Frontend already running: $frontendUrl"
        return
    }

    $listener = Get-NetTCPConnection -LocalPort $FrontendPort -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        throw "Frontend cannot start because port $FrontendPort is already in use."
    }

    $stdout = Join-Path $serviceReportsDir "frontend.out.log"
    $stderr = Join-Path $serviceReportsDir "frontend.err.log"

    Write-Host "Starting frontend static server on $frontendUrl"
    $resolvedPythonExe = Resolve-PythonExecutable -PreferredPythonExe $PythonExe
    Write-Host "Using Python executable: $resolvedPythonExe"

    $process = Start-Process -FilePath $resolvedPythonExe `
        -ArgumentList @("-m", "http.server", "$FrontendPort", "--bind", "127.0.0.1") `
        -WorkingDirectory $frontendRoot `
        -RedirectStandardOutput $stdout `
        -RedirectStandardError $stderr `
        -PassThru `
        -WindowStyle Hidden

    $startedProcesses.Add($process) | Out-Null
}

function Stop-StartedServices {
    if ($KeepServices) {
        Write-Host "Keeping smoke services running because -KeepServices was specified."
        return
    }

    foreach ($process in $startedProcesses) {
        try {
            if ($process -and -not $process.HasExited) {
                Write-Host "Stopping PID $($process.Id)"
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
        }
        catch {
            Write-Warning "Could not stop PID $($process.Id): $($_.Exception.Message)"
        }
    }
}

try {
    Enable-LocalHttps

    New-Item -ItemType Directory -Force -Path $newmanReportsDir, $serviceReportsDir | Out-Null
    Get-ChildItem $serviceReportsDir -File -ErrorAction SilentlyContinue | Remove-Item -Force

    if ($SkipDotnetValidation) {
        Write-Step "[1/9] Skipping .NET restore/build/test validation"
    }
    else {
        Write-Step "[1/9] Running .NET restore/build/test validation"
        & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "run-dotnet-validation.ps1") -RepoRoot $repoRoot
        if ($LASTEXITCODE -ne 0) {
            throw ".NET validation failed with exit code $LASTEXITCODE"
        }
    }

    if ($SkipDbSetup) {
        Write-Step "[2/9] Skipping LocalDB smoke schema setup"
    }
    else {
        Write-Step "[2/9] Preparing LocalDB smoke schema"
        & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "setup-localdb.ps1")
    }

    Write-Step "[3/9] Restoring Node/Newman/Selenium dependencies"
    $localNewman = Join-Path $PSScriptRoot "node_modules\.bin\newman.cmd"
    if (-not (Test-Path $localNewman)) {
        Push-Location $PSScriptRoot
        try {
            if (Test-Path (Join-Path $PSScriptRoot "package-lock.json")) {
                & npm.cmd ci --no-audit --no-fund --loglevel=error
            }
            else {
                & npm.cmd install --no-audit --no-fund --loglevel=error
            }
        }
        finally {
            Pop-Location
        }

        if ($LASTEXITCODE -ne 0) {
            throw "npm dependency restore failed with exit code $LASTEXITCODE"
        }
    }
    else {
        Write-Host "Newman dependencies already installed."
    }

    Write-Step "[4/9] Starting APIs and frontend"
    foreach ($service in $services) {
        Start-SmokeService -Service $service
    }
    Start-Frontend

    Write-Step "[5/9] Waiting for APIs and frontend"
    foreach ($service in $services) {
        if ([int]$service.ReadyPort -gt 0) {
            Wait-Port -Name $service.Name -Port ([int]$service.ReadyPort) -TimeoutSeconds $WaitTimeoutSeconds
        }
        else {
            Wait-Url -Name $service.Name -Url $service.ReadyUrl -TimeoutSeconds $WaitTimeoutSeconds
        }
    }
    $frontendUrl = "http://127.0.0.1:$FrontendPort/index.html"
    Wait-Url -Name "Dahla Frontend" -Url $frontendUrl -TimeoutSeconds $WaitTimeoutSeconds

    Write-Step "[6/9] Running Newman API contract tests"
    $newmanArgs = @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", (Join-Path $PSScriptRoot "run-newman.ps1"),
        "-BaseUrl", $BaseUrl,
        "-ReportsDir", $newmanReportsDir,
        "-MaxResponseTimeMs", $MaxResponseTimeMs
    )

    if (-not [string]::IsNullOrWhiteSpace($AdminUsername)) {
        $newmanArgs += @("-AdminUsername", $AdminUsername)
    }

    if (-not [string]::IsNullOrWhiteSpace($AdminPassword)) {
        $newmanArgs += @("-AdminPassword", $AdminPassword)
    }

    if (-not [string]::IsNullOrWhiteSpace($ProductSearchTerm)) {
        $newmanArgs += @("-ProductSearchTerm", $ProductSearchTerm)
    }

    if (-not [string]::IsNullOrWhiteSpace($AccountSearchTerm)) {
        $newmanArgs += @("-AccountSearchTerm", $AccountSearchTerm)
    }

    if ($DisablePerfAssertion) {
        $newmanArgs += "-DisablePerfAssertion"
    }

    & powershell @newmanArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Newman smoke tests failed with exit code $LASTEXITCODE"
    }

    if ($SkipSelenium) {
        Write-Step "[7/9] Skipping Selenium web smoke tests"
    }
    else {
        Write-Step "[7/9] Running Selenium web smoke tests"
        & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "run-selenium.ps1") -FrontendBaseUrl "http://127.0.0.1:$FrontendPort" -ApiBaseUrl $BaseUrl
        if ($LASTEXITCODE -ne 0) {
            throw "Selenium web smoke tests failed with exit code $LASTEXITCODE"
        }
    }

    Write-Step "[8/9] CI test artifacts"
    Write-Host "HTML report : $(Join-Path $newmanReportsDir 'newman-report.html')"
    Write-Host "JUnit report: $(Join-Path $newmanReportsDir 'newman-junit.xml')"
    Write-Host "JSON report : $(Join-Path $newmanReportsDir 'newman-summary.json')"
    Write-Host "Service logs: $serviceReportsDir"

    Write-Step "[9/9] Packaging CI reports"
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "package-artifacts.ps1") -WorkspaceRoot $repoRoot
    if ($LASTEXITCODE -ne 0) {
        throw "CI report packaging failed with exit code $LASTEXITCODE"
    }

    $artifactsDir = Join-Path $PSScriptRoot "artifacts"
    Write-Host "Dashboard report : $(Join-Path $artifactsDir 'jenkins-api-dashboard.html')"
    Write-Host "Test type report: $(Join-Path $artifactsDir 'test-types-report.html')"

    if ($OpenReport) {
        $htmlReport = Join-Path $artifactsDir "test-types-report.html"
        if (Test-Path $htmlReport) {
            Start-Process $htmlReport
        }
    }
}
finally {
    Stop-StartedServices
}
