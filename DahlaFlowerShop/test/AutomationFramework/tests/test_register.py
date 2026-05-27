"""
test_register.py - Kiem thu huong du lieu (Data-Driven) chuc nang Dang ky.
Input: testdata/test_data.xlsx -> Sheet "Register"
Page Object: pages/register_page.py
"""
from __future__ import annotations

from pathlib import Path

import pytest

from pages.register_page import RegisterPage
from utils.excel_reader import ExcelReader
from utils.logger import get_logger

log = get_logger("TestRegister")

EXCEL_PATH = Path(__file__).resolve().parents[1] / "testdata" / "test_data.xlsx"
reader = ExcelReader(EXCEL_PATH)
REGISTER_CASES = reader.read_register_cases()

VALID_EXPECTED = {"valid-form", "success"}
BACKEND_DUPLICATE_EXPECTED = {"duplicate-user", "duplicate-email"}
BUSINESS_INVALID_EXPECTED = {"invalid-form"}
VALID_FORM_CASES = [c for c in REGISTER_CASES if c["expected"] in VALID_EXPECTED]
HTML5_INVALID_CASES = [c for c in REGISTER_CASES if c["expected"] == "html5-invalid"]
BACKEND_DUPLICATE_CASES = [c for c in REGISTER_CASES if c["expected"] in BACKEND_DUPLICATE_EXPECTED]
BUSINESS_INVALID_CASES = [c for c in REGISTER_CASES if c["expected"] in BUSINESS_INVALID_EXPECTED]
UNSUPPORTED_CASES = [
    c for c in REGISTER_CASES
    if (
        c["expected"] not in VALID_EXPECTED
        and c["expected"] not in BACKEND_DUPLICATE_EXPECTED
        and c["expected"] not in BUSINESS_INVALID_EXPECTED
        and c["expected"] != "html5-invalid"
    )
]

if UNSUPPORTED_CASES:
    values = ", ".join(f'{c["id"]}={c["expected"]}' for c in UNSUPPORTED_CASES)
    raise RuntimeError(
        "Sheet Register chi ho tro expected: valid-form, success, html5-invalid, "
        "duplicate-user, duplicate-email, invalid-form. "
        f"Gia tri khong hop le: {values}"
    )


class TestRegisterDataDriven:
    """Bo test Data-Driven: Dang ky - du lieu tu Excel."""

    @pytest.mark.register
    @pytest.mark.smoke
    @pytest.mark.parametrize("case", VALID_FORM_CASES, ids=lambda c: f'{c["id"]}_{c["name"]}')
    def test_register_valid_form(self, driver, case):
        """
        Kiem tra: du lieu dang ky hop le -> form co the submit.
        Ghi chu: test chi kiem tra validation de tranh tao trung user khi chay lap lai.
        """
        page = RegisterPage(driver)
        page.navigate()
        page.fill_form(case["data"])

        assert page.is_register_form_valid(), (
            f'[{case["id"]}] Form dang ky phai hop le voi tai khoan '
            f'"{case["data"]["tenTK"]}"'
        )
        log.info(f'PASSED {case["id"]} {case["name"]} -> form valid')

    @pytest.mark.register
    @pytest.mark.parametrize("case", HTML5_INVALID_CASES, ids=lambda c: f'{c["id"]}_{c["name"]}')
    def test_register_html5_validation(self, driver, case):
        """
        Kiem tra: du lieu dang ky thieu/sai dinh dang -> HTML5 validation chan form.
        """
        page = RegisterPage(driver)
        page.navigate()
        page.fill_form(case["data"])

        assert not page.is_register_form_valid(), (
            f'[{case["id"]}] Form dang ky phai bi HTML5 validation chan '
            f'voi tai khoan "{case["data"]["tenTK"]}"'
        )
        log.info(f'PASSED {case["id"]} {case["name"]} -> HTML5 validation blocked')

    @pytest.mark.register
    @pytest.mark.parametrize("case", BACKEND_DUPLICATE_CASES, ids=lambda c: f'{c["id"]}_{c["name"]}')
    def test_register_duplicate_backend_rule(self, driver, case):
        """
        Kiem tra: du lieu duplicate-user/duplicate-email hop le ve mat HTML5.
        Khong submit that de pipeline chay lai nhieu lan khong bi loi trung du lieu DB.
        """
        page = RegisterPage(driver)
        page.navigate()
        page.fill_form(case["data"])

        assert page.is_register_form_valid(), (
            f'[{case["id"]}] Duplicate la rule backend, form HTML5 van phai hop le '
            f'voi tai khoan "{case["data"]["tenTK"]}"'
        )
        log.info(f'PASSED {case["id"]} {case["name"]} -> backend duplicate case prepared')

    @pytest.mark.register
    @pytest.mark.parametrize("case", BUSINESS_INVALID_CASES, ids=lambda c: f'{c["id"]}_{c["name"]}')
    def test_register_business_invalid_documented(self, driver, case):
        """
        Kiem tra cac case invalid-form trong Excel.
        Neu HTML5 da chan thi pass. Neu frontend hien tai chua co rule do thi xfail
        de pipeline khong fail vi rule nghiep vu chua duoc implement tren UI.
        """
        page = RegisterPage(driver)
        page.navigate()
        page.fill_form(case["data"])

        if not page.is_register_form_valid():
            log.info(f'PASSED {case["id"]} {case["name"]} -> HTML5 validation blocked')
            return

        pytest.xfail(
            f'[{case["id"]}] Excel expected invalid-form, '
            "nhung frontend hien tai chua chan rule nghiep vu nay bang HTML5/UI validation."
        )
