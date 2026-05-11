from __future__ import annotations

from typing import Any
from urllib.parse import urljoin

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class ActionKeywords:
    def __init__(self, driver, frontend_base_url: str, api_base_url: str, object_repository: dict[str, Any]):
        self.driver = driver
        self.frontend_base_url = frontend_base_url
        self.api_base_url = api_base_url
        self.object_repository = object_repository

    def resolve_object(self, object_name_or_target: str) -> dict[str, str]:
        key = str(object_name_or_target or "").strip()
        if not key:
            return {"type": "empty", "value": ""}
        return self.object_repository.get(key, {"type": "css", "value": key})

    def page_url(self, relative_path: str) -> str:
        return urljoin(self.frontend_base_url.rstrip("/") + "/", relative_path.lstrip("/"))

    def visible_element(self, selector: str):
        wait = WebDriverWait(self.driver, 10)
        return wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, selector)))

    def located_element(self, selector: str):
        wait = WebDriverWait(self.driver, 10)
        return wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))

    def open(self, object_name: str) -> str:
        target = self.resolve_object(object_name)
        if target["type"] != "url":
            raise RuntimeError(f'Keyword open requires URL object, got "{object_name}".')
        self.driver.get(self.page_url(target["value"]))
        return self.driver.current_url

    def configure_api(self) -> str:
        self.driver.execute_script(
            """
            window.APP_API_BASE_URL = arguments[0];
            window.alert = function () {};
            window.confirm = function () { return true; };
            """,
            self.api_base_url,
        )
        return self.api_base_url

    def wait_visible(self, object_name: str) -> str:
        target = self.resolve_object(object_name)
        self.visible_element(target["value"])
        return target["value"]

    def type(self, object_name: str, value: str) -> str:
        target = self.resolve_object(object_name)
        element = self.visible_element(target["value"])
        element.clear()
        if value:
            element.send_keys(value)
        return f"{object_name}={value or ''}"

    def click(self, object_name: str) -> str:
        target = self.resolve_object(object_name)
        element = self.located_element(target["value"])
        self.driver.execute_script("arguments[0].scrollIntoView({ block: 'center', inline: 'center' });", element)
        self.driver.execute_script("arguments[0].click();", element)
        self.accept_alert_if_present()
        return target["value"]

    def accept_alert_if_present(self) -> str:
        try:
            alert = WebDriverWait(self.driver, 1).until(EC.alert_is_present())
            text = alert.text
            alert.accept()
            return text
        except Exception:
            return ""

    def assert_value(self, object_name: str, expected_value: str) -> str:
        target = self.resolve_object(object_name)
        actual = self.driver.find_element(By.CSS_SELECTOR, target["value"]).get_attribute("value")
        if actual != expected_value:
            raise RuntimeError(f'Expected value "{expected_value}", got "{actual}".')
        return actual

    def assert_text_contains(self, object_name: str, expected_text: str) -> str:
        target = self.resolve_object(object_name or "body")
        selector = "body" if target["type"] == "empty" else target["value"]
        actual = self.driver.find_element(By.CSS_SELECTOR, selector).text
        if expected_text not in actual:
            raise RuntimeError(f'Expected text to contain "{expected_text}".')
        return expected_text

    def assert_url_contains(self, _object_name: str, expected_text: str) -> str:
        current_url = self.driver.current_url
        if expected_text not in current_url:
            raise RuntimeError(f'Expected URL to contain "{expected_text}", got "{current_url}".')
        return current_url

    def assert_local_storage_object_not_empty(self, object_name: str) -> str:
        target = self.resolve_object(object_name)
        storage_key = target["value"] or object_name

        def has_data(driver) -> bool:
            self.accept_alert_if_present()
            return bool(
                driver.execute_script(
                    """
                    const raw = localStorage.getItem(arguments[0]);
                    if (!raw) return false;
                    try {
                      const value = JSON.parse(raw);
                      if (Array.isArray(value)) return value.length > 0;
                      if (value && typeof value === 'object') return Object.keys(value).length > 0;
                      return Boolean(value);
                    } catch {
                      return raw.length > 0;
                    }
                    """,
                    storage_key,
                )
            )

        WebDriverWait(self.driver, 10).until(has_data)
        return storage_key

    def execute(self, step: dict[str, Any]) -> Any:
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
        raise RuntimeError(f"Unsupported keyword: {keyword}")
