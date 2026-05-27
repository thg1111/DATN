"""
BasePage - Lớp cơ sở cho tất cả Page Object.
Cung cấp các thao tác chung: navigate, click, type, wait, ...
"""
from __future__ import annotations

import os
from typing import Any
from urllib.parse import urljoin

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from utils.logger import get_logger
from utils.wait_helper import WaitHelper


class BasePage:
    """Lớp cơ sở - mọi Page Object kế thừa từ đây."""

    FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://127.0.0.1:5500")
    API_BASE_URL = os.getenv("API_BASE_URL", "https://localhost:7114")

    def __init__(self, driver: WebDriver):
        self.driver = driver
        self.wait = WaitHelper(driver, timeout=15)
        self.log = get_logger(self.__class__.__name__)

    # ---------- Navigation ----------
    def page_url(self, relative_path: str) -> str:
        base = self.FRONTEND_BASE_URL.rstrip("/") + "/"
        return urljoin(base, relative_path.lstrip("/"))

    def open(self, relative_path: str) -> None:
        url = self.page_url(relative_path)
        self.log.info(f"Mở trang: {url}")
        self.driver.get(url)

    def get_current_url(self) -> str:
        return self.driver.current_url

    def get_title(self) -> str:
        return self.driver.title

    # ---------- Element interaction ----------
    def find(self, locator: tuple[str, str]) -> WebElement:
        return self.wait.wait_present(locator)

    def find_visible(self, locator: tuple[str, str]) -> WebElement:
        return self.wait.wait_visible(locator)

    def click(self, locator: tuple[str, str]) -> None:
        element = self.wait.wait_clickable(locator)
        self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
        element.click()
        self.log.debug(f"Click: {locator}")

    def js_click(self, locator: tuple[str, str]) -> None:
        element = self.find(locator)
        self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
        self.driver.execute_script("arguments[0].click();", element)
        self.log.debug(f"JS Click: {locator}")

    def type_text(self, locator: tuple[str, str], text: Any) -> None:
        element = self.find_visible(locator)
        element.clear()
        value = "" if text is None else str(text)
        if value:
            element.send_keys(value)
        self.log.debug(f"Nhập: {locator} = '{value}'")

    def get_text(self, locator: tuple[str, str]) -> str:
        return self.find_visible(locator).text

    def get_attribute(self, locator: tuple[str, str], attr: str) -> str | None:
        return self.find(locator).get_attribute(attr)

    def is_element_visible(self, locator: tuple[str, str], timeout: int = 5) -> bool:
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located(locator)
            )
            return True
        except Exception:
            return False

    # ---------- JavaScript ----------
    def execute_js(self, script: str, *args: Any) -> Any:
        return self.driver.execute_script(script, *args)

    def configure_api(self) -> None:
        """Cấu hình API URL và suppress alert/confirm trên frontend."""
        self.execute_js(
            """
            window.APP_API_BASE_URL = arguments[0];
            window.alert = function() {};
            window.confirm = function() { return true; };
            """,
            self.API_BASE_URL,
        )

    def clear_storage(self) -> None:
        self.execute_js("localStorage.clear(); sessionStorage.clear();")

    def set_local_storage(self, key: str, value: str) -> None:
        self.execute_js(f"localStorage.setItem('{key}', arguments[0]);", value)

    def get_local_storage(self, key: str) -> str | None:
        return self.execute_js(f"return localStorage.getItem('{key}');")

    # ---------- Alert ----------
    def accept_alert_if_present(self, timeout: int = 2) -> str:
        try:
            alert = self.wait.wait_alert_present(timeout=timeout)
            text = alert.text
            alert.accept()
            return text
        except Exception:
            return ""

    def is_form_valid(self, form_selector: str) -> bool:
        return bool(self.execute_js(
            "return document.querySelector(arguments[0]).checkValidity();",
            form_selector,
        ))
