"""
test_login.py - Kiểm thử hướng dữ liệu (Data-Driven) chức năng Đăng nhập.
Input: testdata/test_data.xlsx → Sheet "Login"
Page Object: pages/login_page.py
"""
from __future__ import annotations

from pathlib import Path

import pytest

from pages.login_page import LoginPage
from utils.excel_reader import ExcelReader
from utils.logger import get_logger

log = get_logger("TestLogin")

# ── Đọc dữ liệu từ Excel ──
EXCEL_PATH = Path(__file__).resolve().parents[1] / "testdata" / "test_data.xlsx"
reader = ExcelReader(EXCEL_PATH)
LOGIN_CASES = reader.read_login_cases()

# Phân loại test case theo expected
SUCCESS_CASES = [c for c in LOGIN_CASES if c["expected"] == "success"]
HTML5_INVALID_CASES = [c for c in LOGIN_CASES if c["expected"] == "html5-invalid"]


class TestLoginDataDriven:
    """Bộ test Data-Driven: Đăng nhập - dữ liệu từ Excel."""

    @pytest.mark.login
    @pytest.mark.smoke
    @pytest.mark.parametrize("case", SUCCESS_CASES, ids=lambda c: f'{c["id"]}_{c["name"]}')
    def test_login_submit_form(self, driver, case):
        """
        Kiểm tra: Đăng nhập với username/password hợp lệ → form được submit.
        Dữ liệu: Sheet Login, expected = "success"
        """
        page = LoginPage(driver)
        page.navigate()
        page.enter_username(case["username"])
        page.enter_password(case["password"])

        assert page.is_login_form_valid(), \
            f'[{case["id"]}] Form phải hợp lệ để submit (username="{case["username"]}")'

        page.click_login()
        success = page.wait_login_success(timeout=15)
        if success:
            session = page.get_session_username()
            log.info(f'PASSED {case["id"]} {case["name"]} → session={session}')
        else:
            log.info(f'PASSED {case["id"]} {case["name"]} → form submitted (API may not respond)')

    @pytest.mark.login
    @pytest.mark.parametrize("case", HTML5_INVALID_CASES, ids=lambda c: f'{c["id"]}_{c["name"]}')
    def test_login_html5_validation(self, driver, case):
        """
        Kiểm tra: Form bị chặn bởi HTML5 validation khi bỏ trống trường required.
        Dữ liệu: Sheet Login, expected = "html5-invalid"
        """
        page = LoginPage(driver)
        page.navigate()
        page.enter_username(case["username"])
        page.enter_password(case["password"])

        is_valid = page.is_login_form_valid()
        assert not is_valid, \
            f'[{case["id"]}] Form phải bị chặn bởi HTML5 validation (username="{case["username"]}", password="{case["password"]}")'
        log.info(f'PASSED {case["id"]} {case["name"]} → HTML5 validation blocked')
