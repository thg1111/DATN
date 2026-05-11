"""
HomePage - Page Object cho trang chủ.
URL: /index.html
"""
from __future__ import annotations

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver

from pages.base_page import BasePage


class HomePage(BasePage):
    """Page Object đại diện trang chủ Dahla Flower Shop."""

    # ---- URL ----
    PATH = "/index.html"

    # ---- Locators ----
    HEADER = (By.CSS_SELECTOR, ".header")
    MENU = (By.CSS_SELECTOR, ".menu")
    SEARCH_INPUT = (By.CSS_SELECTOR, 'input[ng-model="searchQuery"]')
    CART_ICON = (By.CSS_SELECTOR, "#cart a")
    PRODUCT_CARDS = (By.CSS_SELECTOR, ".vlt")
    ADD_TO_CART_BTN = (By.CSS_SELECTOR, ".btn-cart")

    # ---- Actions ----
    def navigate(self) -> None:
        self.open(self.PATH)
        self.configure_api()

    def is_header_visible(self) -> bool:
        return self.is_element_visible(self.HEADER)

    def is_menu_visible(self) -> bool:
        return self.is_element_visible(self.MENU)

    def search_product(self, keyword: str) -> None:
        self.type_text(self.SEARCH_INPUT, keyword)
        self.log.info(f"Tìm kiếm sản phẩm: {keyword}")

    def go_to_cart(self) -> None:
        self.js_click(self.CART_ICON)
