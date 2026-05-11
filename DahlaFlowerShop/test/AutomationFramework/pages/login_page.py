"""
LoginPage - Page Object cho trang đăng nhập.
URL: /pages/auth/login.html
"""
from __future__ import annotations

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support.ui import WebDriverWait

from pages.base_page import BasePage


class LoginPage(BasePage):
    """Page Object đại diện trang đăng nhập của Dahla Flower Shop."""

    # ---- URL ----
    PATH = "/pages/auth/login.html"

    # ---- Locators ----
    INPUT_USERNAME = (By.CSS_SELECTOR, "#tenTK")
    INPUT_PASSWORD = (By.CSS_SELECTOR, "#matKhau")
    BTN_SUBMIT = (By.CSS_SELECTOR, 'button[type="submit"]')
    FORM = (By.CSS_SELECTOR, 'form[ng-submit="Login()"]')

    # ---- Actions ----
    def navigate(self) -> None:
        self.open(self.PATH)
        self.configure_api()
        self.clear_storage()

    def enter_username(self, username: str) -> None:
        self.type_text(self.INPUT_USERNAME, username)

    def enter_password(self, password: str) -> None:
        self.type_text(self.INPUT_PASSWORD, password)

    def click_login(self) -> None:
        self.js_click(self.BTN_SUBMIT)

    def login(self, username: str, password: str) -> None:
        """Thực hiện đầy đủ luồng đăng nhập."""
        self.navigate()
        self.enter_username(username)
        self.enter_password(password)
        self.click_login()
        self.log.info(f"Đăng nhập với tài khoản: {username}")

    def is_login_form_valid(self) -> bool:
        return self.is_form_valid('form[ng-submit="Login()"]')

    def wait_login_success(self, timeout: int = 15) -> bool:
        """Chờ localStorage có session sau khi đăng nhập."""
        try:
            WebDriverWait(self.driver, timeout).until(
                lambda d: d.execute_script(
                    """
                    const s = JSON.parse(localStorage.getItem('DahlaAuthSession') || 'null');
                    return Boolean((s && s.tenTK) || localStorage.getItem('MaND'));
                    """
                )
            )
            return True
        except Exception:
            return False

    def get_session_username(self) -> str | None:
        return self.execute_js(
            """
            const s = JSON.parse(localStorage.getItem('DahlaAuthSession') || 'null');
            return s && s.tenTK;
            """
        )
