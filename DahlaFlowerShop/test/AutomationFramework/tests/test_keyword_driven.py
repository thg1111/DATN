"""
test_keyword_driven.py - Kiểm thử hướng từ khoá (Keyword-Driven).
Input: testdata/keyword_steps.xlsx → Sheet "TestSteps"
       testdata/object-repository.json
Keywords: utils/action_keywords.py

Mỗi bước test được mô tả bằng từ khoá trong Excel.
Không cần biết code, chỉ cần biết các keyword là viết được test.
"""
from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

import pytest

from utils.action_keywords import ActionKeywords
from utils.driver_factory import DriverFactory
from utils.excel_reader import ExcelReader
from utils.logger import get_logger

log = get_logger("TestKeywordDriven")

# ── Đường dẫn ──
BASE_DIR = Path(__file__).resolve().parents[1]
TESTDATA_DIR = BASE_DIR / "testdata"
KEYWORD_EXCEL = TESTDATA_DIR / "keyword_steps.xlsx"
OBJECT_REPO_PATH = TESTDATA_DIR / "object-repository.json"

# ── Đọc dữ liệu ──
reader = ExcelReader(KEYWORD_EXCEL)
TEST_CASES = reader.group_keyword_steps("TestSteps")

with open(OBJECT_REPO_PATH, "r", encoding="utf-8") as f:
    OBJECT_REPOSITORY = json.load(f)


class TestKeywordDriven:
    """Bộ test Keyword-Driven: các luồng website được mô tả bằng keyword từ Excel."""

    @pytest.mark.keyword
    @pytest.mark.parametrize("test_case", TEST_CASES, ids=lambda tc: f'{tc["id"]}_{tc["name"]}')
    def test_keyword_scenario(self, driver, base_url, api_url, test_case):
        """
        Chạy 1 test case keyword-driven.
        Mỗi test case gồm nhiều step, mỗi step là 1 keyword.
        """
        actions = ActionKeywords(driver, base_url, api_url, OBJECT_REPOSITORY)

        # Clear state trước mỗi test case
        driver.get(base_url + "/index.html")
        driver.execute_script("localStorage.clear(); sessionStorage.clear();")

        step_results: list[dict[str, Any]] = []

        for step in test_case["steps"]:
            step_start = time.time()
            try:
                detail = actions.execute(step)
                step_results.append({
                    "stepOrder": step["stepOrder"],
                    "keyword": step["keyword"],
                    "objectName": step["objectName"],
                    "status": "passed",
                    "detail": str(detail or ""),
                    "timeMs": int((time.time() - step_start) * 1000),
                })
                log.info(
                    f'  Step {step["stepOrder"]}: {step["keyword"]}({step["objectName"]}) '
                    f'→ PASSED ({step["description"]})'
                )
            except Exception as e:
                step_results.append({
                    "stepOrder": step["stepOrder"],
                    "keyword": step["keyword"],
                    "objectName": step["objectName"],
                    "status": "failed",
                    "error": str(e),
                    "timeMs": int((time.time() - step_start) * 1000),
                })
                log.error(
                    f'  Step {step["stepOrder"]}: {step["keyword"]}({step["objectName"]}) '
                    f'→ FAILED: {e}'
                )
                pytest.fail(
                    f'[{test_case["id"]}] Step {step["stepOrder"]} '
                    f'({step["keyword"]}) thất bại: {e}'
                )

        passed_count = sum(1 for s in step_results if s["status"] == "passed")
        log.info(
            f'PASSED {test_case["id"]} {test_case["name"]} '
            f'→ {passed_count}/{len(step_results)} steps'
        )
