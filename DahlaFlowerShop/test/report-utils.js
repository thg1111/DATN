const fs = require('fs');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMs(value) {
  const ms = Number(value) || 0;
  if (ms < 1000) {
    return `${ms} ms`;
  }

  return `${(ms / 1000).toFixed(2)} s`;
}

function renderStepRows(steps = []) {
  if (!steps.length) {
    return '<tr><td colspan="7" class="muted">No steps recorded.</td></tr>';
  }

  return steps.map((step) => `
    <tr>
      <td>${escapeHtml(step.stepOrder || '')}</td>
      <td><span class="pill ${escapeHtml(step.status)}">${escapeHtml(step.status)}</span></td>
      <td>${escapeHtml(step.keyword || '')}</td>
      <td><code>${escapeHtml(step.objectName || step.target || '')}</code></td>
      <td>${escapeHtml(step.testData || step.value || '')}</td>
      <td>${escapeHtml(step.description || step.detail || step.error || '')}</td>
      <td>${escapeHtml(formatMs(step.timeMs))}</td>
    </tr>`).join('');
}

function renderDetailRows(results = []) {
  return results.map((item) => {
    const detail = item.steps
      ? `<details><summary>${item.steps.length} step(s)</summary><table class="step-table"><thead><tr><th>#</th><th>Status</th><th>Keyword</th><th>Object</th><th>Data</th><th>Detail</th><th>Time</th></tr></thead><tbody>${renderStepRows(item.steps)}</tbody></table></details>`
      : `<pre>${escapeHtml(JSON.stringify(item.detail || item.error || '', null, 2))}</pre>`;

    return `
      <tr>
        <td>${escapeHtml(item.id)}</td>
        <td>${escapeHtml(item.group || '')}</td>
        <td>${escapeHtml(item.name)}</td>
        <td><span class="pill ${escapeHtml(item.status)}">${escapeHtml(item.status)}</span></td>
        <td>${escapeHtml(item.expected || '')}</td>
        <td>${escapeHtml(formatMs(item.timeMs))}</td>
        <td>${detail}</td>
      </tr>`;
  }).join('');
}

function writeHtmlReport(filePath, options) {
  const summary = options.summary;
  const title = options.title;
  const subtitle = options.subtitle || '';
  const total = Number(summary.total) || 0;
  const passed = Number(summary.passed) || 0;
  const failed = Number(summary.failed) || 0;
  const passRate = total ? Math.round((passed / total) * 100) : 0;
  const status = failed > 0 ? 'failed' : 'passed';

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { --bg:#f5f7fb; --panel:#fff; --ink:#1f2937; --muted:#667085; --line:#d9e2ec; --brand:#e44d69; --ok:#137333; --bad:#b3261e; --ok-bg:#e8f5ec; --bad-bg:#fdebea; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; background: var(--bg); color: var(--ink); font-family: Segoe UI, Arial, sans-serif; }
    .layout { max-width: 1280px; margin: 0 auto; display: grid; gap: 18px; }
    header, section { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; }
    header { padding: 24px; }
    h1 { margin: 10px 0 8px; font-size: 28px; }
    h2 { margin: 0 0 14px; font-size: 18px; }
    p { margin: 0; color: var(--muted); line-height: 1.5; }
    .status { display: inline-flex; padding: 6px 10px; border-radius: 999px; font-weight: 700; text-transform: uppercase; font-size: 12px; }
    .status.passed { color: var(--ok); background: var(--ok-bg); }
    .status.failed { color: var(--bad); background: var(--bad-bg); }
    .metrics { display: grid; grid-template-columns: repeat(4, minmax(140px, 1fr)); gap: 12px; margin-top: 18px; }
    .metric { border: 1px solid var(--line); border-radius: 8px; padding: 14px; background: #fcfdff; }
    .metric span { display: block; color: var(--muted); font-size: 12px; text-transform: uppercase; font-weight: 700; }
    .metric strong { display: block; font-size: 28px; margin-top: 6px; }
    section { padding: 18px; overflow: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { padding: 11px 10px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
    th { background: #f8fafc; color: #344054; font-size: 12px; text-transform: uppercase; letter-spacing: .03em; }
    code { background: #f1f5f9; padding: 2px 5px; border-radius: 4px; word-break: break-word; }
    pre { margin: 0; white-space: pre-wrap; word-break: break-word; }
    details summary { cursor: pointer; font-weight: 700; color: var(--brand); }
    .step-table { margin-top: 10px; font-size: 13px; }
    .pill { display: inline-flex; min-width: 64px; justify-content: center; padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .pill.passed { color: var(--ok); background: var(--ok-bg); }
    .pill.failed { color: var(--bad); background: var(--bad-bg); }
    .muted { color: var(--muted); }
    .env { display: grid; grid-template-columns: repeat(2, minmax(260px, 1fr)); gap: 8px 18px; margin-top: 14px; color: var(--muted); font-size: 13px; }
    @media (max-width: 800px) { body { padding: 16px; } .metrics, .env { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="layout">
    <header>
      <span class="status ${status}">${status}</span>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(subtitle)}</p>
      <div class="metrics">
        <div class="metric"><span>Total</span><strong>${total}</strong></div>
        <div class="metric"><span>Passed</span><strong>${passed}</strong></div>
        <div class="metric"><span>Failed</span><strong>${failed}</strong></div>
        <div class="metric"><span>Pass Rate</span><strong>${passRate}%</strong></div>
      </div>
      <div class="env">
        <div><strong>Generated:</strong> ${escapeHtml(summary.generatedAt)}</div>
        <div><strong>Frontend:</strong> ${escapeHtml(summary.frontendBaseUrl)}</div>
        <div><strong>API:</strong> ${escapeHtml(summary.apiBaseUrl)}</div>
        <div><strong>Framework:</strong> ${escapeHtml(summary.framework || options.framework || '')}</div>
      </div>
    </header>
    <section>
      <h2>Test Cases</h2>
      <table>
        <thead><tr><th>ID</th><th>Group</th><th>Name</th><th>Status</th><th>Expected</th><th>Time</th><th>Detail</th></tr></thead>
        <tbody>${renderDetailRows(summary.results || [])}</tbody>
      </table>
    </section>
  </div>
</body>
</html>`;

  fs.writeFileSync(filePath, html);
}

module.exports = {
  writeHtmlReport
};
