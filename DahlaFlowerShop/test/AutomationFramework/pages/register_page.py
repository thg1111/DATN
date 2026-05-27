"""
RegisterPage - Page Object cho trang dang ky.
URL: /pages/auth/register.html
"""
from __future__ import annotations

from selenium.webdriver.common.by import By

from pages.base_page import BasePage


class RegisterPage(BasePage):
    """Page Object dai dien trang dang ky tai khoan."""

    PATH = "/pages/auth/register.html"

    INPUT_USERNAME = (By.CSS_SELECTOR, "#tenTK")
    INPUT_PASSWORD = (By.CSS_SELECTOR, "#matKhau")
    INPUT_EMAIL = (By.CSS_SELECTOR, "#email")
    INPUT_FULLNAME = (By.CSS_SELECTOR, "#tenND")
    INPUT_BIRTHDAY = (By.CSS_SELECTOR, "#sinhNhat")
    INPUT_PHONE = (By.CSS_SELECTOR, "#sdt")
    INPUT_ADDRESS = (By.CSS_SELECTOR, "#diaChi")
    RADIO_MALE = (By.CSS_SELECTOR, "#Nam")
    RADIO_FEMALE = (By.CSS_SELECTOR, "#Nu")
    BTN_SUBMIT = (By.CSS_SELECTOR, '#registerForm button[type="submit"]')
    MESSAGE = (By.CSS_SELECTOR, '[ng-if="registerMessage"]')
    FORM_SELECTOR = "#registerForm"

    def navigate(self) -> None:
        self.open(self.PATH)
        self.configure_api()
        self.clear_storage()

    def fill_form(self, data: dict[str, str]) -> None:
        self.type_text(self.INPUT_USERNAME, data.get("tenTK", ""))
        self.type_text(self.INPUT_PASSWORD, data.get("matKhau", ""))
        self.type_text(self.INPUT_EMAIL, data.get("email", ""))
        self.type_text(self.INPUT_FULLNAME, data.get("tenND", ""))
        self.type_text(self.INPUT_BIRTHDAY, data.get("sinhNhat", ""))
        self.type_text(self.INPUT_PHONE, data.get("sdt", ""))
        self.type_text(self.INPUT_ADDRESS, data.get("diaChi", ""))

        gender = (data.get("gioiTinh") or "Nam").strip().lower()
        if gender in {"nu", "nữ", "female"}:
            self.js_click(self.RADIO_FEMALE)
        else:
            self.js_click(self.RADIO_MALE)

    def is_register_form_valid(self) -> bool:
        return self.is_form_valid(self.FORM_SELECTOR)

    def click_register(self) -> None:
        self.js_click(self.BTN_SUBMIT)

    def get_register_message(self) -> str:
        if self.is_element_visible(self.MESSAGE, timeout=3):
            return self.get_text(self.MESSAGE)
        return ""
