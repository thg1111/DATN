"""
ActionKeywords - Thư viện hành động cho Keyword-Driven Testing.
Mỗi keyword tương ứng 1 hành động trên trình duyệt.

Bảng keyword:
  open                              → Mở URL (từ object repository)
  configureApi                      → Cấu hình API base URL
  waitVisible                       → Chờ element hiện trên trang
  type                              → Gõ text vào input
  click                             → Click vào element
  assertValue                       → Kiểm tra giá trị input
  assertTextContains                → Kiểm tra text chứa chuỗi
  assertUrlContains                 → Kiểm tra URL chứa chuỗi
  assertLocalStorageObjectNotEmpty  → Kiểm tra localStorage có dữ liệu
  setLocalStorage                   → Gán giá trị vào localStorage
  clearStorage                      → Xoá localStorage + sessionStorage
"""
from __future__ import annotations

from typing import Any
from urllib.parse import urljoin

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class ActionKeywords:
    """Thực thi các keyword từ Excel test steps."""

    SUPPORTED_KEYWORDS = {
        "open", "configureApi", "waitVisible", "type", "click",
        "assertValue", "assertTextContains", "assertUrlContains",
        "assertLocalStorageObjectNotEmpty", "setLocalStorage", "clearStorage",
    }

    def __init__(self, driver: WebDriver, frontend_base_url: str, api_base_url: str, object_repository: dict[str, Any]):
        self.driver = driver
        self.frontend_base_url = frontend_base_url
        self.api_base_url = api_base_url
        self.object_repository = object_repository

    def resolve_object(self, name: str) -> dict[str, str]:
        key = str(name or "").strip()
        if not key:
            return {"type": "empty", "value": ""}
        return self.object_repository.get(key, {"type": "css", "value": key})

    def page_url(self, relative_path: str) -> str:
        return urljoin(self.frontend_base_url.rstrip("/") + "/", relative_path.lstrip("/"))

    def _find_element(self, obj: dict[str, str]):
        if obj["type"] == "xpath":
            by = By.XPATH
        else:
            by = By.CSS_SELECTOR
        return WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((by, obj["value"]))
        )

    def _visible_element(self, obj: dict[str, str]):
        if obj["type"] == "xpath":
            by = By.XPATH
        else:
            by = By.CSS_SELECTOR
        return WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((by, obj["value"]))
        )

    # ──────────── Keywords ────────────

    def open(self, object_name: str) -> str:
        obj = self.resolve_object(object_name)
        if obj["type"] != "url":
            raise RuntimeError(f'Keyword "open" yêu cầu URL object, nhận "{object_name}".')
        self.driver.get(self.page_url(obj["value"]))
        return self.driver.current_url

    def configure_api(self) -> str:
        self.driver.execute_script(
            """
            window.APP_API_BASE_URL = arguments[0];
            window.alert = function() {};
            window.confirm = function() { return true; };
            """,
            self.api_base_url,
        )
        return self.api_base_url

    def wait_visible(self, object_name: str) -> str:
        obj = self.resolve_object(object_name)
        self._visible_element(obj)
        return obj["value"]

    def type(self, object_name: str, value: str) -> str:
        obj = self.resolve_object(object_name)
        element = self._visible_element(obj)
        element.clear()
        if value:
            element.send_keys(value)
        return f"{object_name}={value or ''}"

    def click(self, object_name: str) -> str:
        obj = self.resolve_object(object_name)
        element = self._find_element(obj)
        self.driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
        self.driver.execute_script("arguments[0].click();", element)
        self._accept_alert_if_present()
        return obj["value"]

    def assert_value(self, object_name: str, expected: str) -> str:
        obj = self.resolve_object(object_name)
        actual = self._find_element(obj).get_attribute("value")
        if actual != expected:
            raise RuntimeError(f'Mong đợi giá trị "{expected}", nhận "{actual}".')
        return actual

    def assert_text_contains(self, object_name: str, expected: str) -> str:
        obj = self.resolve_object(object_name or "body")
        selector = "body" if obj["type"] == "empty" else obj["value"]
        by = By.XPATH if obj["type"] == "xpath" else By.CSS_SELECTOR
        text = self.driver.find_element(by, selector).text
        if expected not in text:
            raise RuntimeError(f'Mong đợi text chứa "{expected}".')
        return expected

    def assert_url_contains(self, _object_name: str, expected: str) -> str:
        url = self.driver.current_url
        if expected not in url:
            raise RuntimeError(f'Mong đợi URL chứa "{expected}", nhận "{url}".')
        return url

    def assert_local_storage_object_not_empty(self, object_name: str) -> str:
        obj = self.resolve_object(object_name)
        storage_key = obj["value"] or object_name

        def has_data(d):
            self._accept_alert_if_present()
            return bool(d.execute_script(
                """
                const raw = localStorage.getItem(arguments[0]);
                if (!raw) return false;
                try {
                    const v = JSON.parse(raw);
                    if (Array.isArray(v)) return v.length > 0;
                    if (v && typeof v === 'object') return Object.keys(v).length > 0;
                    return Boolean(v);
                } catch { return raw.length > 0; }
                """,
                storage_key,
            ))

        WebDriverWait(self.driver, 10).until(has_data)
        return storage_key

    def set_local_storage(self, object_name: str, value: str) -> str:
        obj = self.resolve_object(object_name)
        key = obj["value"] or object_name
        self.driver.execute_script("localStorage.setItem(arguments[0], arguments[1]);", key, value)
        return f"{key}={value}"

    def clear_storage(self) -> str:
        self.driver.execute_script("localStorage.clear(); sessionStorage.clear();")
        return "cleared"

    def _accept_alert_if_present(self) -> str:
        try:
            alert = WebDriverWait(self.driver, 1).until(EC.alert_is_present())
            text = alert.text
            alert.accept()
            return text
        except Exception:
            return ""

    # ──────────── Dispatcher ────────────

    def execute(self, step: dict[str, Any]) -> Any:
        """Thực thi 1 step keyword."""
        keyword = step["keyword"]
        if keyword == "open":
            return self.open(step["objectName"])
        if keyword == "configureApi":
            return self.configure_api()
        if keyword == "waitVisible":
            return self.wait_visible(step["objectName"])
        if keyword == "type":
            return self.type(step["objectName"], step["testData"])
        if keyword == "click":
            return self.click(step["objectName"])
        if keyword == "assertValue":
            return self.assert_value(step["objectName"], step["testData"])
        if keyword == "assertTextContains":
            return self.assert_text_contains(step["objectName"], step["testData"])
        if keyword == "assertUrlContains":
            return self.assert_url_contains(step["objectName"], step["testData"])
        if keyword == "assertLocalStorageObjectNotEmpty":
            return self.assert_local_storage_object_not_empty(step["objectName"])
        if keyword == "setLocalStorage":
            return self.set_local_storage(step["objectName"], step["testData"])
        if keyword == "clearStorage":
            return self.clear_storage()
        raise RuntimeError(f'Keyword không được hỗ trợ: "{keyword}"')
