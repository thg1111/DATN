param(
    [int]$FrontendPort = 5500,
    [switch]$SkipDbSetup,
    [switch]$SkipCertTrust,
    [switch]$NoBrowser,
    [switch]$ReuseRunning
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendRoot = Join-Path $repoRoot "frontend"
$reportsDir = Join-Path $PSScriptRoot "reports\local-web"
$pidFile = Join-Path $reportsDir "local-web-pids.json"

$processes = New-Object System.Collections.Generic.List[object]

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
        ReadyPort = 7114
        Ports = @(7114, 5075)
    }
)

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host $Message
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

function Wait-Url {
    param(
        [string]$Name,
        [string]$Url,
        [int]$TimeoutSeconds = 180
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-UrlReady -Url $Url) {
            Write-Host "$Name ready: $Url"
            return
        }
        Start-Sleep -Seconds 2
    }

    throw "$Name was not ready: $Url"
}

function Wait-Port {
    param(
        [string]$Name,
        [int]$Port,
        [int]$TimeoutSeconds = 180
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($listener) {
            Write-Host "$Name listening on port $Port"
            return
        }
        Start-Sleep -Seconds 2
    }

    throw "$Name was not listening on port $Port"
}

function Get-ListeningProcess {
    param([int]$Port)

    $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $listener) {
        return $null
    }

    $process = Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue
    [pscustomobject]@{
        Port = $Port
        ProcessId = $listener.OwningProcess
        ProcessName = if ($process) { $process.ProcessName } else { "" }
        Path = if ($process) { $process.Path } else { "" }
    }
}

function Add-ManagedProcess {
    param(
        [string]$Name,
        [int]$ProcessId,
        [int[]]$Ports
    )

    $processes.Add([pscustomobject]@{
        Name = $Name
        ProcessId = $ProcessId
        Ports = $Ports
        StartedAt = (Get-Date).ToString("s")
    }) | Out-Null
}

function Start-DotnetService {
    param([hashtable]$Service)

    if (-not [string]::IsNullOrWhiteSpace($Service.ReadyUrl) -and (Test-UrlReady -Url $Service.ReadyUrl)) {
        Write-Host "$($Service.Name) already running."
        return
    }

    if ([int]$Service.ReadyPort -gt 0) {
        $existing = Get-ListeningProcess -Port ([int]$Service.ReadyPort)
        if ($existing) {
            Write-Host "$($Service.Name) already listening on port $($Service.ReadyPort)."
            return
        }
    }

    foreach ($port in $Service.Ports) {
        $existing = Get-ListeningProcess -Port $port
        if ($existing) {
            throw "$($Service.Name) cannot start because port $port is used by PID $($existing.ProcessId) $($existing.ProcessName)."
        }
    }

    $safeName = ($Service.Name -replace "[^\w-]", "-").ToLowerInvariant()
    $stdout = Join-Path $reportsDir "$safeName.out.log"
    $stderr = Join-Path $reportsDir "$safeName.err.log"

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

    Add-ManagedProcess -Name $Service.Name -ProcessId $process.Id -Ports $Service.Ports
}

function Start-Frontend {
    $existing = Get-ListeningProcess -Port $FrontendPort
    if ($existing) {
        Write-Host "Frontend port $FrontendPort already used by PID $($existing.ProcessId). Reusing it."
        return
    }

    $stdout = Join-Path $reportsDir "frontend.out.log"
    $stderr = Join-Path $reportsDir "frontend.err.log"

    Write-Host "Starting frontend static server on http://127.0.0.1:$FrontendPort"
    $process = Start-Process -FilePath "python" `
        -ArgumentList @("-m", "http.server", "$FrontendPort", "--bind", "127.0.0.1") `
        -WorkingDirectory $frontendRoot `
        -RedirectStandardOutput $stdout `
        -RedirectStandardError $stderr `
        -PassThru `
        -WindowStyle Hidden

    Add-ManagedProcess -Name "Dahla Frontend" -ProcessId $process.Id -Ports @($FrontendPort)
}

New-Item -ItemType Directory -Force -Path $reportsDir | Out-Null
if ((-not $ReuseRunning) -and (Test-Path $pidFile)) {
    Write-Step "[0/6] Stopping previous local web session"
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "stop-local-web.ps1")
}

Get-ChildItem $reportsDir -File -ErrorAction SilentlyContinue | Remove-Item -Force

if (-not $SkipDbSetup) {
    Write-Step "[1/6] Preparing LocalDB"
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "setup-localdb.ps1")
}
else {
    Write-Step "[1/6] Skipping LocalDB setup"
}

Write-Step "[2/6] Checking ASP.NET HTTPS dev certificate"
if ($SkipCertTrust) {
    Write-Host "Skipping certificate trust check."
}
else {
    & dotnet dev-certs https --check --trust | Out-Host
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Trusting ASP.NET HTTPS dev certificate. Confirm the Windows prompt if it appears."
        & dotnet dev-certs https --trust
        if ($LASTEXITCODE -ne 0) {
            throw "Could not trust ASP.NET HTTPS dev certificate. Run 'dotnet dev-certs https --trust' manually."
        }
    }
}

Write-Step "[3/6] Starting backend services"
foreach ($service in $services) {
    Start-DotnetService -Service $service
}

Write-Step "[4/6] Starting frontend"
Start-Frontend

Write-Step "[5/6] Waiting until services are ready"
foreach ($service in $services) {
    if ([int]$service.ReadyPort -gt 0) {
        Wait-Port -Name $service.Name -Port ([int]$service.ReadyPort)
    }
    else {
        Wait-Url -Name $service.Name -Url $service.ReadyUrl
    }
}

$frontendUrl = "http://127.0.0.1:$FrontendPort/index.html"
Wait-Url -Name "Dahla Frontend" -Url $frontendUrl

$processes | ConvertTo-Json -Depth 4 | Set-Content -Path $pidFile -Encoding UTF8

Write-Step "[6/6] Local web is running"
Write-Host "Frontend : $frontendUrl"
Write-Host "Gateway  : https://localhost:7114"
Write-Host "Admin API: http://localhost:5003/swagger/index.html"
Write-Host "User API : http://localhost:5193/swagger/index.html"
Write-Host "Logs/PIDs: $reportsDir"
Write-Host ""
Write-Host "Stop later with: .\stop-local-web.bat"

if (-not $NoBrowser) {
    Start-Process $frontendUrl
}
