param(
    [string]$RepoRoot = "",
    [switch]$SkipStopServices
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
    $RepoRoot = Split-Path -Parent $PSScriptRoot
}

$solutions = @(
    "backend\API_Dahla\API_Dahla.sln",
    "backend\Dahla_NguoiDung\Dahla_NguoiDung.sln",
    "backend\Dahla_GateWays\Dahla_GateWays.sln"
)

$servicePorts = @(5003, 7079, 5193, 7023, 7114, 5075)

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host $Message
}

function Stop-ServicesOnPorts {
    param([int[]]$Ports)

    $listeners = foreach ($port in $Ports) {
        Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    }

    $processIds = @($listeners | Select-Object -ExpandProperty OwningProcess -Unique | Where-Object { $_ -gt 0 })
    foreach ($processId in $processIds) {
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if (-not $process) {
            continue
        }

        if ($process.ProcessName -notmatch "dotnet|API_Dahla|Dahla_NguoiDung|Dahla_GateWays") {
            Write-Host "Skipping non-Dahla listener PID $processId ($($process.ProcessName))."
            continue
        }

        Write-Host "Stopping service PID $processId ($($process.ProcessName)) before build."
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
}

if (-not (Test-Path $RepoRoot)) {
    throw "RepoRoot was not found: $RepoRoot"
}

if (-not $SkipStopServices) {
    Write-Step "[1/3] Stopping local Dahla services that can lock build outputs"
    Stop-ServicesOnPorts -Ports $servicePorts
}
else {
    Write-Step "[1/3] Skipping service stop"
}

Write-Step "[2/3] Restoring .NET solutions"
foreach ($solution in $solutions) {
    $solutionPath = Join-Path $RepoRoot $solution
    Write-Host "dotnet restore $solution"
    & dotnet restore $solutionPath --nologo --verbosity quiet "/clp:ErrorsOnly;NoSummary"
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet restore failed for $solution with exit code $LASTEXITCODE"
    }
}

Write-Step "[3/3] Building and running .NET tests"
foreach ($solution in $solutions) {
    $solutionPath = Join-Path $RepoRoot $solution
    Write-Host "dotnet build --no-restore $solution"
    & dotnet build $solutionPath --no-restore --nologo --verbosity quiet "/clp:ErrorsOnly;NoSummary"
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet build failed for $solution with exit code $LASTEXITCODE"
    }

    Write-Host "dotnet test --no-build $solution"
    & dotnet test $solutionPath --no-build --nologo --verbosity quiet --logger "trx;LogFileName=$([IO.Path]::GetFileNameWithoutExtension($solution)).trx"
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet test failed for $solution with exit code $LASTEXITCODE"
    }
}
