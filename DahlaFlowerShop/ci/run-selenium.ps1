param(
    [string]$FrontendBaseUrl = "http://127.0.0.1:5500",
    [string]$ApiBaseUrl = "https://localhost:7114"
)

$ErrorActionPreference = "Stop"

$reportsDir = Join-Path $PSScriptRoot "reports\selenium"
New-Item -ItemType Directory -Force -Path $reportsDir | Out-Null

$seleniumPackage = Join-Path $PSScriptRoot "node_modules\selenium-webdriver"
if (-not (Test-Path $seleniumPackage)) {
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

$env:FRONTEND_BASE_URL = $FrontendBaseUrl
$env:API_BASE_URL = $ApiBaseUrl

Push-Location $PSScriptRoot
try {
    & node .\selenium\dahla-web-smoke.js
}
finally {
    Pop-Location
}

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
