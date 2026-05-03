param(
    [switch]$AllOnKnownPorts
)

$ErrorActionPreference = "Stop"

$reportsDir = Join-Path $PSScriptRoot "reports\local-web"
$pidFile = Join-Path $reportsDir "local-web-pids.json"
$knownPorts = @(5500, 5003, 7079, 5193, 7023, 7114, 5075)

function Stop-Pid {
    param(
        [int]$ProcessId,
        [string]$Name
    )

    $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Stopping $Name PID $ProcessId"
        Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
    }
}

if (Test-Path $pidFile) {
    $entries = Get-Content $pidFile -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($entry in @($entries)) {
        Stop-Pid -ProcessId ([int]$entry.ProcessId) -Name $entry.Name

        foreach ($port in @($entry.Ports)) {
            $listeners = Get-NetTCPConnection -LocalPort ([int]$port) -State Listen -ErrorAction SilentlyContinue
            foreach ($listener in @($listeners)) {
                Stop-Pid -ProcessId ([int]$listener.OwningProcess) -Name "$($entry.Name) listener on port $port"
            }
        }
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}
else {
    Write-Host "No PID file found at $pidFile"
}

if ($AllOnKnownPorts) {
    foreach ($port in $knownPorts) {
        $listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($listener in @($listeners)) {
            $process = Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue
            Stop-Pid -ProcessId ([int]$listener.OwningProcess) -Name "port $port $($process.ProcessName)"
        }
    }
}

Write-Host "Local web stop completed."
