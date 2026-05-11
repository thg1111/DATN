"""
DriverFactory - Quản lý tạo WebDriver instance.
Hỗ trợ Chrome headless / headed.
"""
from __future__ import annotations

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service


class DriverFactory:
    """Factory tạo Chrome WebDriver với các tuỳ chọn phổ biến."""

    @staticmethod
    def create_driver(headless: bool = True) -> webdriver.Chrome:
        options = Options()
        if headless:
            options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--ignore-certificate-errors")
        options.add_argument("--window-size=1366,768")
        return webdriver.Chrome(options=options)
