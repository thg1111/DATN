"""
WaitHelper - Hàm tiện ích cho Explicit Wait.
"""
from __future__ import annotations

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class WaitHelper:
    """Cung cấp explicit wait tiện lợi cho các Page Object."""

    def __init__(self, driver: WebDriver, timeout: int = 15):
        self.driver = driver
        self.timeout = timeout

    def wait_visible(self, locator: tuple[str, str]) -> WebElement:
        """Chờ element xuất hiện và visible trên trang."""
        return WebDriverWait(self.driver, self.timeout).until(
            EC.visibility_of_element_located(locator)
        )

    def wait_clickable(self, locator: tuple[str, str]) -> WebElement:
        """Chờ element có thể click."""
        return WebDriverWait(self.driver, self.timeout).until(
            EC.element_to_be_clickable(locator)
        )

    def wait_present(self, locator: tuple[str, str]) -> WebElement:
        """Chờ element có mặt trong DOM."""
        return WebDriverWait(self.driver, self.timeout).until(
            EC.presence_of_element_located(locator)
        )

    def wait_url_contains(self, text: str) -> bool:
        """Chờ URL chứa chuỗi mong muốn."""
        return WebDriverWait(self.driver, self.timeout).until(
            EC.url_contains(text)
        )

    def wait_alert_present(self, timeout: int = 5):
        """Chờ alert xuất hiện."""
        return WebDriverWait(self.driver, timeout).until(
            EC.alert_is_present()
        )
