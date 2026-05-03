param(
    [string]$WorkspaceRoot
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($WorkspaceRoot)) {
    throw "WorkspaceRoot is required."
}

$reportsRoot = Join-Path $WorkspaceRoot "ci\reports"
$artifactsRoot = Join-Path $WorkspaceRoot "ci\artifacts"

if (-not (Test-Path $reportsRoot)) {
    Write-Host "ci\reports was not found in workspace. Skip packaging."
    exit 0
}

if (Test-Path $artifactsRoot) {
    Remove-Item -LiteralPath $artifactsRoot -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $artifactsRoot | Out-Null

function Format-Bytes {
    param([long]$Bytes)

    if ($Bytes -lt 1KB) { return "$Bytes B" }
    if ($Bytes -lt 1MB) { return ("{0:N1} KB" -f ($Bytes / 1KB)) }
    if ($Bytes -lt 1GB) { return ("{0:N1} MB" -f ($Bytes / 1MB)) }
    return ("{0:N1} GB" -f ($Bytes / 1GB))
}

function Encode-Html {
    param([AllowNull()][object]$Value)

    return [System.Net.WebUtility]::HtmlEncode([string]$Value)
}

function New-ReportZip {
    param(
        [string]$SourceFolder,
        [string]$ZipName
    )

    if (-not (Test-Path $SourceFolder)) {
        Write-Host "Skip missing folder: $SourceFolder"
        return
    }

    $items = Get-ChildItem -LiteralPath $SourceFolder -Force -ErrorAction SilentlyContinue
    if (-not $items) {
        Write-Host "Skip empty folder: $SourceFolder"
        return
    }

    $zipPath = Join-Path $artifactsRoot $ZipName
    if (Test-Path $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }

    $tempRoot = Join-Path $artifactsRoot ("tmp-" + [IO.Path]::GetFileNameWithoutExtension($ZipName))
    if (Test-Path $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }

    try {
        New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null
        Copy-Item -Path (Join-Path $SourceFolder "*") -Destination $tempRoot -Recurse -Force -ErrorAction SilentlyContinue

        $copiedItems = Get-ChildItem -LiteralPath $tempRoot -Force -ErrorAction SilentlyContinue
        if (-not $copiedItems) {
            Write-Host "Skip zip with no readable files: $SourceFolder"
            return
        }

        Compress-Archive -Path (Join-Path $tempRoot "*") -DestinationPath $zipPath -Force
        Write-Host "Created artifact zip: $zipPath"
    }
    catch {
        Write-Warning "Could not create zip '$ZipName': $($_.Exception.Message)"
        if (Test-Path $zipPath) {
            Remove-Item -LiteralPath $zipPath -Force -ErrorAction SilentlyContinue
        }
    }
    finally {
        if (Test-Path $tempRoot) {
            Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

function Copy-ArtifactFile {
    param(
        [string]$SourcePath,
        [string]$TargetName
    )

    if (-not (Test-Path $SourcePath)) {
        Write-Host "Skip missing file: $SourcePath"
        return
    }

    Copy-Item -LiteralPath $SourcePath -Destination (Join-Path $artifactsRoot $TargetName) -Force
}

function Get-ExecutionRoute {
    param([object]$Execution)

    $segments = @($Execution.request.url.path)
    if (-not $segments) {
        return "/"
    }

    return "/" + ($segments -join "/")
}

function Get-ExecutionGroup {
    param([object]$Execution)

    $segments = @($Execution.request.url.path)
    if ($segments.Count -ge 2) {
        return "$($segments[0])/$($segments[1])"
    }

    if ($segments.Count -eq 1) {
        return [string]$segments[0]
    }

    return ""
}

function New-LinkMarkup {
    param(
        [string]$FileName,
        [string]$Label
    )

    $target = Join-Path $artifactsRoot $FileName
    if (-not (Test-Path $target)) {
        return "<span class=""link-pill link-pill-muted"">$(Encode-Html $Label) unavailable</span>"
    }

    return "<a class=""link-pill"" href=""$(Encode-Html $FileName)"">$(Encode-Html $Label)</a>"
}

function Get-TestTypeClassification {
    param([object]$Execution)

    $name = ([string]$Execution.item.name).ToLowerInvariant()
    $route = (Get-ExecutionRoute -Execution $Execution).ToLowerInvariant()

    if ($name -match "login" -or $route -match "checklogin") {
        return "Login"
    }

    if ($route -match "giohang|hoadon|feedback" -or $name -match "cart|order|feedback") {
        return "Customer Function"
    }

    if ($route -match "sanpham|danhmuc" -or $name -match "product|category|search") {
        return "Catalog Function"
    }

    if ($route -match "taikhoan|nguoidung|voucher" -or $name -match "account|user|voucher") {
        return "Admin Function"
    }

    return "Gateway Health"
}

function New-TestTypeReport {
    $summaryPath = Join-Path $artifactsRoot "newman-summary.json"
    $jsonPath = Join-Path $artifactsRoot "test-types-report.json"
    $htmlPath = Join-Path $artifactsRoot "test-types-report.html"

    if (-not (Test-Path $summaryPath)) {
        @{
            status = "missing"
            message = "newman-summary.json was not found."
            generatedAt = (Get-Date).ToString("s")
        } | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $jsonPath -Encoding UTF8

        @"
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Dahla Test Types Report</title></head>
<body><h1>Dahla Test Types Report</h1><p>newman-summary.json was not found.</p></body>
</html>
"@ | Set-Content -LiteralPath $htmlPath -Encoding UTF8
        return
    }

    $summary = Get-Content -LiteralPath $summaryPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $executions = @($summary.run.executions)
    $failures = @($summary.run.failures)
    $failureKeys = @{}

    foreach ($failure in $failures) {
        $sourceName = if ($failure.source -and $failure.source.name) { [string]$failure.source.name } else { "" }
        if (-not [string]::IsNullOrWhiteSpace($sourceName)) {
            $failureKeys[$sourceName] = $true
        }
    }

    $details = foreach ($execution in $executions) {
        $name = [string]$execution.item.name
        $route = Get-ExecutionRoute -Execution $execution
        $method = [string]$execution.request.method
        $statusCode = if ($execution.response) { [int]$execution.response.code } else { 0 }
        $assertionCount = @($execution.assertions).Count
        $hasFailure = $failureKeys.ContainsKey($name) -or (-not $execution.response)

        [pscustomobject]@{
            type = Get-TestTypeClassification -Execution $execution
            name = $name
            method = $method
            route = $route
            statusCode = $statusCode
            assertions = $assertionCount
            result = if ($hasFailure) { "FAIL" } else { "PASS" }
        }
    }

    $typeOrder = @("Login", "Customer Function", "Catalog Function", "Admin Function", "Gateway Health")
    $groups = foreach ($type in $typeOrder) {
        $items = @($details | Where-Object { $_.type -eq $type })
        if ($items.Count -eq 0) {
            continue
        }

        [pscustomobject]@{
            type = $type
            requests = $items.Count
            assertions = ($items | Measure-Object -Property assertions -Sum).Sum
            passed = @($items | Where-Object { $_.result -eq "PASS" }).Count
            failed = @($items | Where-Object { $_.result -eq "FAIL" }).Count
        }
    }

    $report = [pscustomobject]@{
        generatedAt = (Get-Date).ToString("s")
        status = if (@($details | Where-Object { $_.result -eq "FAIL" }).Count -gt 0) { "FAIL" } else { "PASS" }
        summary = $groups
        tests = $details
    }

    $report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $jsonPath -Encoding UTF8

    $summaryRows = ($groups | ForEach-Object {
        $statusClass = if ($_.failed -eq 0) { "ok" } else { "bad" }
        "<tr><td>$(Encode-Html $_.type)</td><td>$($_.requests)</td><td>$($_.assertions)</td><td>$($_.passed)</td><td>$($_.failed)</td><td><span class=""pill $statusClass"">$(if ($_.failed -eq 0) { "PASS" } else { "FAIL" })</span></td></tr>"
    }) -join "`r`n"

    $detailRows = ($details | ForEach-Object {
        $statusClass = if ($_.result -eq "PASS") { "ok" } else { "bad" }
        "<tr><td>$(Encode-Html $_.type)</td><td>$(Encode-Html $_.name)</td><td>$(Encode-Html $_.method)</td><td><code>$(Encode-Html $_.route)</code></td><td>$($_.statusCode)</td><td>$($_.assertions)</td><td><span class=""pill $statusClass"">$($_.result)</span></td></tr>"
    }) -join "`r`n"

    @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dahla Test Types Report</title>
  <style>
    body { margin: 0; padding: 28px; background: #f6f8fb; color: #1f2430; font-family: Segoe UI, Arial, sans-serif; }
    .layout { max-width: 1280px; margin: 0 auto; display: grid; gap: 20px; }
    .panel { background: #fff; border: 1px solid #e4e7ec; border-radius: 18px; padding: 22px; box-shadow: 0 18px 40px rgba(16,24,40,.08); }
    h1, h2 { margin: 0 0 12px; }
    p { color: #667085; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { padding: 11px 10px; border-bottom: 1px solid #e4e7ec; text-align: left; vertical-align: top; }
    th { background: #fcfcfd; color: #344054; font-size: 12px; text-transform: uppercase; letter-spacing: .03em; }
    code { padding: 2px 6px; border-radius: 8px; background: #f5f7fa; color: #344054; font-size: 12px; word-break: break-word; }
    .pill { display: inline-flex; min-width: 64px; justify-content: center; padding: 5px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
    .ok { color: #18794e; background: #e8fff2; }
    .bad { color: #b42318; background: #fff2f0; }
  </style>
</head>
<body>
  <div class="layout">
    <section class="panel">
      <h1>Dahla Test Types Report</h1>
      <p>Grouped CI smoke results by business test type: login, customer features, catalog features, admin features, and gateway health.</p>
      <table>
        <thead><tr><th>Test Type</th><th>Requests</th><th>Assertions</th><th>Passed</th><th>Failed</th><th>Status</th></tr></thead>
        <tbody>$summaryRows</tbody>
      </table>
    </section>
    <section class="panel">
      <h2>Executed Tests</h2>
      <table>
        <thead><tr><th>Type</th><th>Test</th><th>Method</th><th>Route</th><th>Status</th><th>Assertions</th><th>Result</th></tr></thead>
        <tbody>$detailRows</tbody>
      </table>
    </section>
  </div>
</body>
</html>
"@ | Set-Content -LiteralPath $htmlPath -Encoding UTF8
}

function New-Dashboard {
    $summaryPath = Join-Path $artifactsRoot "newman-summary.json"
    $dashboardPath = Join-Path $artifactsRoot "jenkins-api-dashboard.html"

    $expectedRouteGroups = @(
        "api-admin/DanhMuc",
        "api-admin/SanPham",
        "api-admin/TaiKhoan",
        "api-admin/NguoiDung",
        "api-admin/Voucher",
        "api-admin/HoaDon",
        "api-user/DanhMuc",
        "api-user/TaiKhoan",
        "api-user/HoaDon",
        "api-user/SanPham",
        "api-user/GioHang",
        "api-user/Feedback"
    )

    $resourceLinks = @(
        (New-LinkMarkup -FileName "jenkins-api-dashboard.html" -Label "Dashboard"),
        (New-LinkMarkup -FileName "test-types-report.html" -Label "Test Types"),
        (New-LinkMarkup -FileName "test-types-report.json" -Label "Test Types JSON"),
        (New-LinkMarkup -FileName "newman-report.html" -Label "Newman HTML"),
        (New-LinkMarkup -FileName "newman-summary.json" -Label "Newman JSON"),
        (New-LinkMarkup -FileName "newman-junit.xml" -Label "JUnit XML"),
        (New-LinkMarkup -FileName "playwright-report.zip" -Label "Playwright Zip"),
        (New-LinkMarkup -FileName "playwright-junit.xml" -Label "Playwright JUnit"),
        (New-LinkMarkup -FileName "newman-report.zip" -Label "Newman Zip"),
        (New-LinkMarkup -FileName "service-logs.zip" -Label "Service Logs Zip"),
        (New-LinkMarkup -FileName "local-web-logs.zip" -Label "Local Web Logs Zip"),
        (New-LinkMarkup -FileName "ci-reports-all.zip" -Label "All Reports Zip")
    ) -join "`r`n"

    if (-not (Test-Path $summaryPath)) {
        @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dahla Jenkins API Dashboard</title>
  <style>
    body { font-family: Segoe UI, Arial, sans-serif; margin: 0; padding: 32px; background: #f7f8fb; color: #1f2430; }
    .card { background: #fff; border-radius: 18px; padding: 24px; box-shadow: 0 18px 40px rgba(16, 24, 40, 0.08); max-width: 960px; margin: 0 auto; }
    .link-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
    .link-pill { display: inline-flex; align-items: center; padding: 10px 14px; border-radius: 999px; background: #ec5a73; color: #fff; text-decoration: none; font-weight: 600; }
    .link-pill-muted { background: #d7dce5; color: #475467; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Dahla Jenkins API Dashboard</h1>
    <p>Newman summary was not found in <code>ci/reports/newman</code>. Raw artifact bundles may still be available.</p>
    <div class="link-grid">
      $resourceLinks
    </div>
  </div>
</body>
</html>
"@ | Set-Content -LiteralPath $dashboardPath -Encoding UTF8
        return
    }

    $summary = Get-Content -LiteralPath $summaryPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $stats = $summary.run.stats
    $timings = $summary.run.timings
    $executions = @($summary.run.executions)
    $failures = @($summary.run.failures)
    $startedAt = [DateTimeOffset]::FromUnixTimeMilliseconds([int64]$timings.started).ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss")
    $completedAt = [DateTimeOffset]::FromUnixTimeMilliseconds([int64]$timings.completed).ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss")
    $coveredGroups = @($executions | ForEach-Object { Get-ExecutionGroup $_ } | Where-Object { $_ } | Sort-Object -Unique)

    $coverageRows = foreach ($group in $expectedRouteGroups) {
        $requestCount = @($executions | Where-Object { (Get-ExecutionGroup $_) -eq $group }).Count
        [pscustomobject]@{
            Group = $group
            RequestCount = $requestCount
            Covered = $requestCount -gt 0
        }
    }

    $coveredCount = @($coverageRows | Where-Object { $_.Covered }).Count
    $coverageRowsHtml = ($coverageRows | ForEach-Object {
        $statusClass = if ($_.Covered) { "status-ok" } else { "status-miss" }
        $statusText = if ($_.Covered) { "Covered" } else { "Missing" }
        "<tr><td>$(Encode-Html $_.Group)</td><td>$($_.RequestCount)</td><td><span class=""status-chip $statusClass"">$statusText</span></td></tr>"
    }) -join "`r`n"

    $requestRowsHtml = ($executions | ForEach-Object {
        $method = [string]$_.request.method
        $route = Get-ExecutionRoute $_
        $name = [string]$_.item.name
        $statusCode = [int]$_.response.code
        $responseTime = [int]$_.response.responseTime
        $assertionCount = @($_.assertions).Count
        $statusClass = if ($statusCode -ge 200 -and $statusCode -lt 300) { "status-ok" } else { "status-bad" }
        "<tr><td>$(Encode-Html $name)</td><td>$(Encode-Html $method)</td><td><code>$(Encode-Html $route)</code></td><td><span class=""status-chip $statusClass"">$statusCode</span></td><td>$responseTime ms</td><td>$assertionCount</td></tr>"
    }) -join "`r`n"

    $failureRowsHtml = if ($failures.Count -gt 0) {
        ($failures | ForEach-Object {
            $sourceName = if ($_.source -and $_.source.name) { [string]$_.source.name } else { "Unknown request" }
            $failureName = if ($_.error -and $_.error.test) { [string]$_.error.test } elseif ($_.error -and $_.error.name) { [string]$_.error.name } else { "Failure" }
            $failureMessage = if ($_.error -and $_.error.message) { [string]$_.error.message } else { "" }
            "<tr><td>$(Encode-Html $sourceName)</td><td>$(Encode-Html $failureName)</td><td>$(Encode-Html $failureMessage)</td></tr>"
        }) -join "`r`n"
    } else {
        "<tr><td colspan=""3"">No failures recorded.</td></tr>"
    }

    $summaryCardsHtml = @(
        "<div class=""metric-card""><span class=""metric-label"">Requests</span><strong>$($stats.requests.total)</strong><span class=""metric-note"">failed: $($stats.requests.failed)</span></div>",
        "<div class=""metric-card""><span class=""metric-label"">Assertions</span><strong>$($stats.assertions.total)</strong><span class=""metric-note"">failed: $($stats.assertions.failed)</span></div>",
        "<div class=""metric-card""><span class=""metric-label"">Gateway Route Groups</span><strong>$coveredCount / $($expectedRouteGroups.Count)</strong><span class=""metric-note"">covered through Newman</span></div>",
        "<div class=""metric-card""><span class=""metric-label"">Response Time</span><strong>$([math]::Round($timings.responseAverage, 0)) ms</strong><span class=""metric-note"">min $($timings.responseMin) ms | max $($timings.responseMax) ms</span></div>"
    ) -join "`r`n"

    $overallStatusClass = if (($stats.assertions.failed -as [int]) -gt 0 -or ($stats.requests.failed -as [int]) -gt 0) { "status-bad" } else { "status-ok" }
    $overallStatusText = if ($overallStatusClass -eq "status-ok") { "PASS" } else { "FAIL" }

    @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dahla Jenkins API Dashboard</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f8fb;
      --panel: #ffffff;
      --ink: #1f2430;
      --muted: #667085;
      --line: #e4e7ec;
      --accent: #ec5a73;
      --accent-soft: #fff1f4;
      --ok: #18794e;
      --ok-soft: #e8fff2;
      --bad: #b42318;
      --bad-soft: #fff2f0;
      --warn: #b54708;
      --shadow: 0 18px 40px rgba(16, 24, 40, 0.08);
      --radius: 20px;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 28px;
      background: radial-gradient(circle at top left, #fff3f6 0%, var(--bg) 42%);
      color: var(--ink);
      font-family: Segoe UI, Arial, sans-serif;
    }
    .layout { max-width: 1320px; margin: 0 auto; display: grid; gap: 20px; }
    .hero, .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    .hero { padding: 28px; }
    .hero-top {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: flex-start;
      flex-wrap: wrap;
    }
    .hero h1 {
      margin: 0 0 8px;
      font-size: 30px;
      line-height: 1.1;
    }
    .hero p {
      margin: 0;
      color: var(--muted);
      max-width: 760px;
      line-height: 1.55;
    }
    .status-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 76px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .status-ok { color: var(--ok); background: var(--ok-soft); }
    .status-bad { color: var(--bad); background: var(--bad-soft); }
    .status-miss { color: var(--warn); background: #fff7ed; }
    .hero-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
      margin-top: 22px;
    }
    .metric-card {
      padding: 18px;
      border-radius: 16px;
      background: linear-gradient(180deg, #fff 0%, #fff8fa 100%);
      border: 1px solid #f5d7de;
    }
    .metric-label {
      display: block;
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .metric-card strong {
      display: block;
      font-size: 28px;
      line-height: 1;
      color: #9f2f49;
      margin-bottom: 6px;
    }
    .metric-note {
      color: var(--muted);
      font-size: 13px;
    }
    .link-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 20px;
    }
    .link-pill {
      display: inline-flex;
      align-items: center;
      padding: 10px 14px;
      border-radius: 999px;
      background: var(--accent);
      color: #fff;
      text-decoration: none;
      font-weight: 600;
      box-shadow: 0 10px 24px rgba(236, 90, 115, 0.18);
    }
    .link-pill-muted {
      background: #d7dce5;
      color: #475467;
      box-shadow: none;
    }
    .grid-two {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr);
      gap: 20px;
    }
    .panel { padding: 22px; }
    .panel h2 {
      margin: 0 0 14px;
      font-size: 20px;
    }
    .panel-subtitle {
      margin: -4px 0 16px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th, td {
      padding: 12px 10px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
    }
    th {
      color: #344054;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      background: #fcfcfd;
    }
    code {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 8px;
      background: #f5f7fa;
      color: #344054;
      font-family: Consolas, monospace;
      font-size: 12px;
      word-break: break-word;
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      margin-top: 12px;
      color: var(--muted);
      font-size: 13px;
    }
    @media (max-width: 980px) {
      body { padding: 18px; }
      .grid-two { grid-template-columns: 1fr; }
      .hero h1 { font-size: 24px; }
    }
  </style>
</head>
<body>
  <div class="layout">
    <section class="hero">
      <div class="hero-top">
        <div>
          <span class="status-chip $overallStatusClass">$overallStatusText</span>
          <h1>Dahla Gateway API Dashboard</h1>
          <p>Dashboard này gom nhanh kết quả Newman smoke qua gateway, cho thấy route group nào đã được cover, request nào đã chạy, response time, và link tải toàn bộ artifact/log của Jenkins.</p>
        </div>
        <div>
          <div class="meta-row">
            <span>Started: $(Encode-Html $startedAt)</span>
            <span>Completed: $(Encode-Html $completedAt)</span>
          </div>
        </div>
      </div>
      <div class="hero-meta">
        $summaryCardsHtml
      </div>
      <div class="link-grid">
        $resourceLinks
      </div>
    </section>

    <div class="grid-two">
      <section class="panel">
        <h2>Gateway Coverage</h2>
        <p class="panel-subtitle">Mỗi dòng là một route group upstream trong gateway. Mục tiêu là nhìn nhanh Jenkins build này đã chạm được bao nhiêu nhóm API.</p>
        <table>
          <thead>
            <tr>
              <th>Route Group</th>
              <th>Requests</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            $coverageRowsHtml
          </tbody>
        </table>
      </section>

      <section class="panel">
        <h2>Request Execution</h2>
        <p class="panel-subtitle">Từng request đã chạy qua Newman, gồm method, route, HTTP status, response time và số assertion gắn với request đó.</p>
        <table>
          <thead>
            <tr>
              <th>Request</th>
              <th>Method</th>
              <th>Route</th>
              <th>Status</th>
              <th>Time</th>
              <th>Assertions</th>
            </tr>
          </thead>
          <tbody>
            $requestRowsHtml
          </tbody>
        </table>
      </section>
    </div>

    <section class="panel">
      <h2>Failure Detail</h2>
      <p class="panel-subtitle">Nếu có assertion hoặc request fail, phần này giữ lại request nguồn, tên assertion và message để đọc ngay trên Jenkins mà không cần mở log console dài.</p>
      <table>
        <thead>
          <tr>
            <th>Request</th>
            <th>Assertion</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          $failureRowsHtml
        </tbody>
      </table>
    </section>
  </div>
</body>
</html>
"@ | Set-Content -LiteralPath $dashboardPath -Encoding UTF8
}

New-ReportZip -SourceFolder (Join-Path $reportsRoot "newman") -ZipName "newman-report.zip"
New-ReportZip -SourceFolder (Join-Path $reportsRoot "playwright") -ZipName "playwright-report.zip"
New-ReportZip -SourceFolder (Join-Path $reportsRoot "services") -ZipName "service-logs.zip"
New-ReportZip -SourceFolder (Join-Path $reportsRoot "local-web") -ZipName "local-web-logs.zip"
New-ReportZip -SourceFolder $reportsRoot -ZipName "ci-reports-all.zip"

Copy-ArtifactFile -SourcePath (Join-Path $reportsRoot "newman\newman-report.html") -TargetName "newman-report.html"
Copy-ArtifactFile -SourcePath (Join-Path $reportsRoot "newman\newman-summary.json") -TargetName "newman-summary.json"
Copy-ArtifactFile -SourcePath (Join-Path $reportsRoot "newman\newman-junit.xml") -TargetName "newman-junit.xml"
Copy-ArtifactFile -SourcePath (Join-Path $reportsRoot "playwright\playwright-junit.xml") -TargetName "playwright-junit.xml"

New-TestTypeReport
New-Dashboard

$createdFiles = Get-ChildItem -LiteralPath $artifactsRoot -File -ErrorAction SilentlyContinue | Sort-Object Name
if (-not $createdFiles) {
    Write-Host "No packaged artifacts were created."
    exit 0
}

$manifestPath = Join-Path $artifactsRoot "artifact-manifest.txt"
$createdFiles | ForEach-Object {
    "{0}`t{1}" -f $_.Name, (Format-Bytes $_.Length)
} | Set-Content -LiteralPath $manifestPath -Encoding UTF8

Write-Host "Artifact package summary:"
Get-Content -LiteralPath $manifestPath
