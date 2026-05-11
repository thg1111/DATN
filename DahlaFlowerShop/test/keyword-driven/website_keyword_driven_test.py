from __future__ import annotations

import os
import sys
from pathlib import Path

from keyword_driver import run_keyword_driven_tests


BASE_DIR = Path(__file__).resolve().parent
TEST_DIR = BASE_DIR.parent
REPORTS_DIR = TEST_DIR / "reports"


def main() -> int:
    summary = run_keyword_driven_tests(
        {
            "frontendBaseUrl": os.getenv("FRONTEND_BASE_URL", "http://127.0.0.1:5500"),
            "apiBaseUrl": os.getenv("API_BASE_URL", "https://localhost:7114"),
            "reportsDir": REPORTS_DIR,
            "reportPath": REPORTS_DIR / "keyword-driven-website-report.json",
            "htmlReportPath": REPORTS_DIR / "keyword-driven-website-report.html",
            "testDataPath": BASE_DIR / "website-keywords-framework.xlsx",
        }
    )
    return 1 if summary["failed"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
