"""
Dahla Flower Shop - Automation Framework
Cấu hình chung cho toàn bộ test suite (pytest conftest).
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

import pytest

# Đảm bảo import được từ thư mục utils / pages
sys.path.insert(0, str(Path(__file__).resolve().parent))


def pytest_addoption(parser):
    parser.addoption("--base-url", default=os.getenv("FRONTEND_BASE_URL", "http://127.0.0.1:5500"), help="URL frontend")
    parser.addoption("--api-url", default=os.getenv("API_BASE_URL", "https://localhost:7114"), help="URL backend API")
    parser.addoption("--headless", action="store_true", default=True, help="Chạy trình duyệt ở chế độ headless")


@pytest.fixture(scope="session")
def base_url(request):
    return request.config.getoption("--base-url")


@pytest.fixture(scope="session")
def api_url(request):
    return request.config.getoption("--api-url")


@pytest.fixture(scope="session")
def headless(request):
    return request.config.getoption("--headless")


@pytest.fixture(scope="function")
def driver(base_url, api_url, headless):
    """Tạo WebDriver cho mỗi test function, tự động quit khi xong."""
    from utils.driver_factory import DriverFactory

    browser = DriverFactory.create_driver(headless=headless)
    browser.implicitly_wait(10)
    yield browser
    browser.quit()
