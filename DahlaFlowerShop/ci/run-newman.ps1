param(
    [string]$BaseUrl = "https://localhost:44384",
    [string]$CollectionPath = "",
    [string]$EnvironmentPath = "",
    [string]$ReportsDir = "",
    [string]$AdminUsername = "",
    [string]$AdminPassword = "",
    [int]$MaxResponseTimeMs = 5000,
    [switch]$DisablePerfAssertion,
    [string]$ProductSearchTerm = "",
    [string]$AccountSearchTerm = "",
    [switch]$Insecure = $true
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($CollectionPath)) {
    $CollectionPath = Join-Path $PSScriptRoot "newman\dahla-gateway.postman_collection.json"
}

if ([string]::IsNullOrWhiteSpace($EnvironmentPath)) {
    $EnvironmentPath = Join-Path $PSScriptRoot "newman\dahla-local.postman_environment.json"
}

if ([string]::IsNullOrWhiteSpace($ReportsDir)) {
    $ReportsDir = Join-Path $PSScriptRoot "reports\newman"
}

$newmanCommand = Get-Command newman -ErrorAction SilentlyContinue
$npxCommand = Get-Command npx -ErrorAction SilentlyContinue
$localNewmanCmd = Join-Path $PSScriptRoot "node_modules\.bin\newman.cmd"

if (-not (Test-Path $localNewmanCmd) -and -not $newmanCommand -and -not $npxCommand) {
    throw "Node.js/Newman is not installed. Install Node.js, then run 'npm install' inside the ci directory."
}

New-Item -ItemType Directory -Force -Path $ReportsDir | Out-Null

$junitReport = Join-Path $ReportsDir "newman-junit.xml"
$jsonReport = Join-Path $ReportsDir "newman-summary.json"
$htmlReport = Join-Path $ReportsDir "newman-report.html"

$commonArgs = @(
    "run", $CollectionPath,
    "-e", $EnvironmentPath,
    "--env-var", "baseUrl=$BaseUrl",
    "--env-var", "maxResponseTimeMs=$MaxResponseTimeMs",
    "--env-var", ("strictResponseTime=" + ($(if ($DisablePerfAssertion) { "false" } else { "true" }))),
    "--reporters", "cli,junit,json,htmlextra",
    "--reporter-junit-export", $junitReport,
    "--reporter-json-export", $jsonReport,
    "--reporter-htmlextra-export", $htmlReport,
    "--reporter-htmlextra-title", "Dahla Gateway API Validation Report",
    "--reporter-htmlextra-browserTitle", "Dahla Gateway API Validation Report"
)

if ($Insecure) {
    $commonArgs += "--insecure"
}

if (-not [string]::IsNullOrWhiteSpace($AdminUsername)) {
    $commonArgs += @("--env-var", "adminUsername=$AdminUsername")
}

if (-not [string]::IsNullOrWhiteSpace($AdminPassword)) {
    $commonArgs += @("--env-var", "adminPassword=$AdminPassword")
}

if (-not [string]::IsNullOrWhiteSpace($ProductSearchTerm)) {
    $commonArgs += @("--env-var", "productSearchTerm=$ProductSearchTerm")
}

if (-not [string]::IsNullOrWhiteSpace($AccountSearchTerm)) {
    $commonArgs += @("--env-var", "accountSearchTerm=$AccountSearchTerm")
}

Write-Host "Running Newman against $BaseUrl"

Push-Location $PSScriptRoot
try {
    if (Test-Path $localNewmanCmd) {
        & $localNewmanCmd @commonArgs
    }
    elseif ($newmanCommand) {
        & $newmanCommand.Source @commonArgs
    }
    else {
        & $npxCommand.Source "newman" @commonArgs
    }
}
finally {
    Pop-Location
}

if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "JUnit report: $junitReport"
Write-Host "HTML report : $htmlReport"
Write-Host "JSON report : $jsonReport"
