# 🧪 Dahla Flower Shop - Automation Framework

## Tổng quan

Framework kiểm thử tự động tích hợp **3 phương pháp test** trong 1 cấu trúc chuyên nghiệp:

| Phương pháp | Input | File test | Mô tả |
|-------------|-------|-----------|-------|
| **Data-Driven** (Đăng nhập) | `test_data.xlsx` → Sheet Login | `test_login.py` | Đọc username/password từ Excel |
| **Data-Driven** (Đăng ký) | `test_data.xlsx` → Sheet Register | `test_register.py` | Đọc thông tin đăng ký từ Excel |
| **Data-Driven** (Đặt hàng) | `test_data.xlsx` → Sheet Checkout | `test_checkout.py` | Đọc sản phẩm, KH từ Excel |
| **Keyword-Driven** | `keyword_steps.xlsx` → Sheet TestSteps | `test_keyword_driven.py` | Chạy từng bước theo keyword Excel |

**Công nghệ:** Python + Selenium WebDriver + Pytest + Openpyxl + Page Object Model

## Cấu trúc thư mục

```
AutomationFramework/
│
├── tests/                              # Test cases
│   ├── test_login.py                   # Data-Driven: đăng nhập (Excel)
│   ├── test_checkout.py                # Data-Driven: đặt hàng (Excel)
│   └── test_keyword_driven.py          # Keyword-Driven: luồng website (Excel)
│
├── pages/                              # Page Object Model (POM)
│   ├── base_page.py                    # Lớp cơ sở (navigate, click, type, JS...)
│   ├── login_page.py                   # Trang đăng nhập
│   ├── home_page.py                    # Trang chủ
│   └── checkout_page.py               # Trang giỏ hàng / đặt hàng
│
├── utils/                              # Tiện ích hỗ trợ
│   ├── driver_factory.py               # Tạo Chrome WebDriver
│   ├── config_reader.py                # Đọc cấu hình từ ENV
│   ├── excel_reader.py                 # Đọc Excel test data (Login/Register/Checkout/Steps)
│   ├── action_keywords.py              # Thư viện keyword (open, click, type, assert...)
│   ├── wait_helper.py                  # Explicit Wait helper
│   └── logger.py                       # Ghi log console + file
│
├── testdata/                           # Dữ liệu test (Excel)
│   ├── test_data.xlsx                  # Data-Driven: Login (8), Register (8), Checkout (10)
│   ├── keyword_steps.xlsx              # Keyword-Driven: 28 steps, 5 test cases
│   └── object-repository.json          # Ánh xạ tên object → CSS/XPath selector
│
├── reports/                            # Báo cáo test (tự động tạo)
│
├── conftest.py                         # Pytest fixtures (driver, base_url, api_url)
├── pytest.ini                          # Cấu hình pytest + markers
├── requirements.txt                    # Dependencies
└── README.md                           # File này
```

## Cài đặt

```powershell
cd test\AutomationFramework
pip install -r requirements.txt
```

## Cách chạy

```powershell
# 1. Khởi động website trước
..\..\run-local-web.bat -NoBrowser

# 2. Chạy tất cả test
pytest

# 3. Chạy theo phương pháp
pytest tests/test_login.py -v              # Data-Driven Login
pytest tests/test_checkout.py -v           # Data-Driven Checkout
pytest tests/test_keyword_driven.py -v     # Keyword-Driven

# 4. Chạy theo marker
pytest -m login                            # Chỉ test đăng nhập
pytest -m checkout                         # Chỉ test đặt hàng
pytest -m keyword                          # Chỉ keyword-driven
pytest -m smoke                            # Chỉ smoke test

# 5. Xuất báo cáo HTML
pytest --html=reports/report.html --self-contained-html
```

## Input Excel - Chi tiết

### Data-Driven Register

File Excel dùng cho đăng ký nằm tại:

`test/AutomationFramework/testdata/test_data.xlsx`

Thêm test case đăng ký vào sheet `Register`, không thêm vào folder `ci/jenkins-excel-tests`.

Cột bắt buộc: `id`, `name`, `tenTK`, `matKhau`, `email`, `tenND`, `sdt`, `expected`.

Cột tùy chọn: `sinhNhat`, `diaChi`, `gioiTinh`.

Giá trị `expected` hỗ trợ:

| expected | Ý nghĩa |
|----------|---------|
| `valid-form` | Dữ liệu hợp lệ, form có thể submit |
| `success` | Tương đương `valid-form` trong automation, không tạo user lặp lại |
| `html5-invalid` | Dữ liệu thiếu/sai, HTML5 validation phải chặn form |

Chạy riêng test đăng ký:

```powershell
cd test\AutomationFramework
pytest tests\test_register.py -v
```

### 📊 test_data.xlsx

**Sheet "Login"** - 8 test cases:

| id | name | username | password | expected |
|----|------|----------|----------|----------|
| L01 | Admin đăng nhập thành công | admin | 123 | success |
| L02 | Bỏ trống username | | 123 | html5-invalid |
| L03 | Bỏ trống password | admin | | html5-invalid |
| ... | ... | ... | ... | ... |

**Sheet "Register"** - 8 test cases:

| id | name | tenTK | matKhau | email | tenND | sdt | expected |
|----|------|-------|---------|-------|-------|-----|----------|
| R01 | Đăng ký hợp lệ | testuser01 | Pass123! | test@mail.com | Nguyễn A | 0123456789 | valid-form |
| R02 | Thiếu email | testuser02 | Pass123! | | Nguyễn B | 0123456789 | html5-invalid |
| ... | ... | ... | ... | ... | ... | ... | ... |

**Sheet "Checkout"** - 10 test cases:

| id | name | productId | productName | productPrice | productQuantity | loginMaND | loginTenTK | customerName | customerPhone | expected |
|----|------|-----------|-------------|-------------|-----------------|-----------|-----------|-------------|--------------|----------|
| C01 | Giỏ hàng trống | | | | | | | | | cart-empty |
| C05 | Chưa đăng nhập | 101 | Hoa hồng đỏ | 350000 | 1 | | | Nguyễn Test | 0364239807 | invoice-blocked-no-login |
| C07 | Đặt hàng OK | 101 | Hoa hồng đỏ | 350000 | 2 | 1 | admin | Nguyễn Hoa | 0364239807 | invoice-success |

### 📊 keyword_steps.xlsx

**Sheet "TestSteps"** - 28 steps, 5 test cases:

| testCaseId | testCaseName | stepOrder | keyword | objectName | testData | description |
|------------|-------------|-----------|---------|------------|----------|-------------|
| TC01 | Trang chủ hiển thị | 1 | open | homePage | | Mở trang chủ |
| TC01 | Trang chủ hiển thị | 2 | configureApi | | | Cấu hình API |
| TC01 | Trang chủ hiển thị | 3 | waitVisible | siteHeader | | Chờ header hiện |
| TC05 | Luồng đặt hàng | 1 | open | loginPage | | Mở trang login |
| TC05 | Luồng đặt hàng | ... | type | checkoutNameInput | Nguyễn Test | Nhập họ tên |
| TC05 | Luồng đặt hàng | 12 | click | createInvoiceButton | | Click tạo hoá đơn |

## Bảng Keyword hỗ trợ

| Keyword | Hành động | Ví dụ |
|---------|----------|-------|
| `open` | Mở URL từ object repository | open → homePage |
| `configureApi` | Cấu hình API base URL | configureApi |
| `waitVisible` | Chờ element hiện | waitVisible → siteHeader |
| `type` | Gõ text vào input | type → loginUsernameInput, admin |
| `click` | Click vào element | click → loginSubmitButton |
| `assertValue` | Kiểm tra giá trị input | assertValue → input, expected |
| `assertTextContains` | Kiểm tra text chứa chuỗi | assertTextContains → body, text |
| `assertUrlContains` | Kiểm tra URL chứa chuỗi | assertUrlContains → , /cart |
| `assertLocalStorageObjectNotEmpty` | Kiểm tra localStorage | assert → cartStorage |
| `setLocalStorage` | Gán localStorage | setLocalStorage → key, value |
| `clearStorage` | Xoá localStorage | clearStorage |

## Biến môi trường

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `FRONTEND_BASE_URL` | `http://127.0.0.1:5500` | URL frontend |
| `API_BASE_URL` | `https://localhost:7114` | URL backend API |
| `HEADLESS` | `true` | Chạy Chrome headless |

## Kiến trúc

```
                    ┌──────────────┐
                    │   BasePage   │
                    │  (base_page) │
                    └──────┬───────┘
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌───────────┐  ┌───────────┐  ┌──────────────┐
     │ LoginPage │  │ HomePage  │  │ CheckoutPage │
     └─────┬─────┘  └───────────┘  └──────┬───────┘
           │                               │
    ┌──────┴───────┐               ┌───────┴────────┐
    │  test_login  │               │ test_checkout   │
    │ (Excel Data) │               │ (Excel Data)    │
    └──────────────┘               └────────────────┘
                          │
               ┌──────────┴───────────┐
               │ test_keyword_driven   │
               │ (Excel Steps +        │
               │  ActionKeywords +     │
               │  Object Repository)   │
               └───────────────────────┘
```
