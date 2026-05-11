from __future__ import annotations

import html
import json
from pathlib import Path
from typing import Any


def write_json_report(path: Path, summary: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")


def write_html_report(path: Path, title: str, subtitle: str, framework: str, summary: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    results = summary.get("results", [])
    rows = []
    for item in results:
        status = html.escape(str(item.get("status", "")))
        status_class = "passed" if status == "passed" else "failed"
        detail = item.get("error") or item.get("detail") or item.get("steps") or ""
        if not isinstance(detail, str):
            detail = json.dumps(detail, ensure_ascii=False)
        rows.append(
            "<tr>"
            f"<td>{html.escape(str(item.get('id', '')))}</td>"
            f"<td>{html.escape(str(item.get('group', framework)))}</td>"
            f"<td>{html.escape(str(item.get('name', '')))}</td>"
            f"<td class='{status_class}'>{status}</td>"
            f"<td>{html.escape(str(item.get('expected', '')))}</td>"
            f"<td>{html.escape(detail)}</td>"
            f"<td>{html.escape(str(item.get('timeMs', '')))}</td>"
            "</tr>"
        )

    document = f"""<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>{html.escape(title)}</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 24px; color: #222; }}
    h1 {{ color: #9f2f49; }}
    .summary {{ display: flex; gap: 12px; margin: 16px 0; }}
    .card {{ border: 1px solid #eee; border-radius: 8px; padding: 12px 18px; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th, td {{ border: 1px solid #ddd; padding: 8px; vertical-align: top; }}
    th {{ background: #f6cbd4; text-align: left; }}
    .passed {{ color: #157347; font-weight: 700; }}
    .failed {{ color: #bb2d3b; font-weight: 700; }}
  </style>
</head>
<body>
  <h1>{html.escape(title)}</h1>
  <p>{html.escape(subtitle)}</p>
  <div class="summary">
    <div class="card"><b>Total</b><br>{summary.get('total', 0)}</div>
    <div class="card"><b>Passed</b><br>{summary.get('passed', 0)}</div>
    <div class="card"><b>Failed</b><br>{summary.get('failed', 0)}</div>
    <div class="card"><b>Framework</b><br>{html.escape(framework)}</div>
  </div>
  <table>
    <thead>
      <tr><th>ID</th><th>Group</th><th>Name</th><th>Status</th><th>Expected</th><th>Detail</th><th>Time ms</th></tr>
    </thead>
    <tbody>
      {''.join(rows)}
    </tbody>
  </table>
</body>
</html>
"""
    path.write_text(document, encoding="utf-8")
