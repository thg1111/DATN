"""
CheckoutPage - Page Object cho trang giỏ hàng / đặt hàng.
URL: /pages/cart.html
"""
from __future__ import annotations

import json

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support.ui import WebDriverWait

from pages.base_page import BasePage


class CheckoutPage(BasePage):
    """Page Object đại diện trang giỏ hàng & thanh toán."""

    # ---- URL ----
    PATH = "/pages/cart.html"

    # ---- Locators ----
    CART_TABLE = (By.CSS_SELECTOR, "#cart-table")
    CART_CONTENT = (By.CSS_SELECTOR, "#content")
    CART_EMPTY_MSG = (By.XPATH, "//*[contains(text(),'Giỏ hàng của bạn trống')]")
    TOTAL_AMOUNT = (By.CSS_SELECTOR, ".total-amount")
    DELETE_BTN = (By.CSS_SELECTOR, ".btn-delete")

    # Form thông tin khách hàng
    RADIO_MALE = (By.CSS_SELECTOR, 'input[name="gender"][value="male"]')
    RADIO_FEMALE = (By.CSS_SELECTOR, 'input[name="gender"][value="female"]')
    INPUT_FULLNAME = (By.XPATH, '//input[@placeholder="Họ tên( Bắt buộc)"]')
    INPUT_PHONE = (By.XPATH, '//input[@placeholder="Số điện thoại (Bắt buộc)"]')
    INPUT_EMAIL = (By.XPATH, '//input[@placeholder="Email"]')
    INPUT_DELIVERY_TIME = (By.XPATH, '//input[@placeholder="Thời gian giao hàng"]')
    TEXTAREA_MESSAGE = (By.XPATH, '//textarea[@placeholder="Lời nhắn cho người nhận"]')
    TEXTAREA_ADDRESS = (By.CSS_SELECTOR, 'textarea[ng-model="invoice.DiaChiGiao"]')

    # Nút tạo hoá đơn
    BTN_CREATE_INVOICE = (By.XPATH, '//button[contains(text(),"Tạo Hóa Đơn")]')

    # ---- Actions ----
    def navigate(self) -> None:
        self.open(self.PATH)
        self.configure_api()

    def add_product_to_cart_via_storage(self, product_id: str, name: str, price: int, quantity: int = 1, photo: str = "") -> None:
        """Thêm sản phẩm vào giỏ hàng thông qua localStorage (DatHang)."""
        cart = self.get_local_storage("DatHang")
        try:
            cart_data = json.loads(cart) if cart else {}
        except (json.JSONDecodeError, TypeError):
            cart_data = {}

        cart_data[product_id] = {
            "id": product_id,
            "name": name,
            "price": price,
            "quantity": quantity,
            "photo": photo,
        }
        self.set_local_storage("DatHang", json.dumps(cart_data))
        self.log.info(f"Thêm SP vào giỏ: {name} (x{quantity}) - {price} VND")

    def set_login_session(self, ma_nd: int, ten_tk: str = "testuser") -> None:
        """Giả lập session đăng nhập trong localStorage."""
        session = json.dumps({"maND": ma_nd, "tenTK": ten_tk, "quyen": "User"})
        self.set_local_storage("DahlaAuthSession", session)
        self.set_local_storage("MaND", str(ma_nd))
        self.log.info(f"Giả lập đăng nhập: MaND={ma_nd}, tenTK={ten_tk}")

    def reload_page(self) -> None:
        self.driver.refresh()
        self.configure_api()

    def is_cart_empty(self) -> bool:
        try:
            WebDriverWait(self.driver, 5).until(
                lambda d: d.execute_script(
                    """
                    const content = document.querySelector('#content');
                    const rows = document.querySelectorAll('#cart-table tbody tr').length;
                    const raw = localStorage.getItem('DatHang');
                    let cart = {};
                    try {
                        cart = raw ? JSON.parse(raw) : {};
                    } catch (e) {
                        cart = {};
                    }
                    return Boolean(content) && rows === 0 && Object.keys(cart || {}).length === 0;
                    """
                )
            )
        except Exception:
            return False

        content_text = self.execute_js(
            "return (document.querySelector('#content') || {}).innerText || '';"
        )
        if "trống" in str(content_text).lower():
            return True

        return not self.is_cart_table_visible(timeout=1) and self.get_cart_item_count() == 0

    def is_cart_table_visible(self) -> bool:
        return self.is_element_visible(self.CART_TABLE, timeout=5)

    def get_total_amount_text(self) -> str:
        return self.get_text(self.TOTAL_AMOUNT)

    def get_cart_item_count(self) -> int:
        """Đếm số dòng sản phẩm trong bảng giỏ hàng."""
        try:
            rows = self.driver.find_elements(By.CSS_SELECTOR, "#cart-table tbody tr")
            return len(rows)
        except Exception:
            return 0

    def delete_first_item(self) -> None:
        self.js_click(self.DELETE_BTN)
        self.log.info("Xoá sản phẩm đầu tiên khỏi giỏ hàng")

    # ---- Điền form thông tin khách hàng ----
    def select_gender_male(self) -> None:
        self.js_click(self.RADIO_MALE)

    def select_gender_female(self) -> None:
        self.js_click(self.RADIO_FEMALE)

    def enter_fullname(self, name: str) -> None:
        self.type_text(self.INPUT_FULLNAME, name)

    def enter_phone(self, phone: str) -> None:
        self.type_text(self.INPUT_PHONE, phone)

    def enter_email(self, email: str) -> None:
        self.type_text(self.INPUT_EMAIL, email)

    def enter_delivery_time(self, time_str: str) -> None:
        self.type_text(self.INPUT_DELIVERY_TIME, time_str)

    def enter_message(self, message: str) -> None:
        self.type_text(self.TEXTAREA_MESSAGE, message)

    def enter_address(self, address: str) -> None:
        self.type_text(self.TEXTAREA_ADDRESS, address)

    def fill_customer_info(
        self,
        fullname: str,
        phone: str,
        email: str = "",
        address: str = "",
        message: str = "",
        gender: str = "male",
    ) -> None:
        """Điền đầy đủ form thông tin khách hàng."""
        if gender == "female":
            self.select_gender_female()
        else:
            self.select_gender_male()
        self.enter_fullname(fullname)
        self.enter_phone(phone)
        if email:
            self.enter_email(email)
        if address:
            self.enter_address(address)
        if message:
            self.enter_message(message)
        self.log.info(f"Điền thông tin KH: {fullname}, {phone}")

    def click_create_invoice(self) -> None:
        self.js_click(self.BTN_CREATE_INVOICE)
        self.log.info("Click: Tạo Hóa Đơn")

    def wait_order_success(self, timeout: int = 15) -> bool:
        """Chờ đặt hàng thành công (URL chuyển sang orders hoặc localStorage cập nhật)."""
        try:
            WebDriverWait(self.driver, timeout).until(
                lambda d: "orders" in d.current_url.lower()
                or d.execute_script("return localStorage.getItem('DahlaRecentOrders') !== null")
            )
            return True
        except Exception:
            return False

    def get_recent_orders_count(self) -> int:
        """Đếm số đơn hàng lưu trong localStorage."""
        raw = self.get_local_storage("DahlaRecentOrders")
        if not raw:
            return 0
        try:
            orders = json.loads(raw)
            return len(orders) if isinstance(orders, list) else 0
        except (json.JSONDecodeError, TypeError):
            return 0
