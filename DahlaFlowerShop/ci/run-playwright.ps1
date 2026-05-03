param(
    [string]$FrontendBaseUrl = "http://127.0.0.1:5500",
    [string]$ApiBaseUrl = "https://localhost:7114",
    [switch]$SkipBrowserInstall
)

$ErrorActionPreference = "Stop"

$reportsDir = Join-Path $PSScriptRoot "reports\playwright"
New-Item -ItemType Directory -Force -Path $reportsDir | Out-Null

$localPlaywright = Join-Path $PSScriptRoot "node_modules\.bin\playwright.cmd"
if (-not (Test-Path $localPlaywright)) {
    Push-Location $PSScriptRoot
    try {
        if (Test-Path (Join-Path $PSScriptRoot "package-lock.json")) {
            & npm.cmd ci
        }
        else {
            & npm.cmd install
        }
    }
    finally {
        Pop-Location
    }

    if ($LASTEXITCODE -ne 0) {
        throw "npm dependency restore failed with exit code $LASTEXITCODE"
    }
}

if (-not $SkipBrowserInstall) {
    Push-Location $PSScriptRoot
    try {
        & $localPlaywright install chromium
    }
    finally {
        Pop-Location
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Playwright browser install failed with exit code $LASTEXITCODE"
    }
}

$env:FRONTEND_BASE_URL = $FrontendBaseUrl
$env:API_BASE_URL = $ApiBaseUrl

Push-Location $PSScriptRoot
try {
    & $localPlaywright test --config .\playwright.config.js
}
finally {
    Pop-Location
}

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
