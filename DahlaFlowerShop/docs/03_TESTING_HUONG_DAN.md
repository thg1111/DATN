# Dahla Flower Shop - Huong Dan Testing

## 1. Tong quan cac loai test

Du an hien tai co 5 loai test, chia theo muc dich va cong cu:

| Loai test | Cong cu | Thu muc | Muc dich |
|-----------|---------|---------|----------|
| .NET Unit Test | dotnet test | `backend/*/` | Kiem tra code backend bien dich dung |
| API Contract Test | Newman (Postman) | `ci/newman/` | Test API endpoint qua Gateway |
| Web Smoke Test | Selenium WebDriver | `ci/selenium/` | Test giao dien web tren trinh duyet |
| Data-Driven Test | Python + Selenium + Excel | `test/AutomationFramework/` | Test dang nhap/dang ky/dat hang tu du lieu Excel |
| Keyword-Driven Test | Python + Selenium + Excel | `test/AutomationFramework/` | Test luong website bang tu khoa tu Excel |

Phan data-driven va keyword-driven da duoc gop chung vao folder `test/AutomationFramework/` theo mo hinh Page Object Model (POM), viet bang Python va chay bang Pytest.

## 2. Cau truc AutomationFramework

```
test/AutomationFramework/
|
|-- tests/                              File test case
|   |-- test_login.py                   Data-Driven: dang nhap (doc Excel)
|   |-- test_checkout.py                Data-Driven: dat hang (doc Excel)
|   |-- test_keyword_driven.py          Keyword-Driven: luong website (doc Excel)
|
|-- pages/                              Page Object Model
|   |-- base_page.py                    Lop co so (navigate, click, type, JS...)
|   |-- login_page.py                   Trang dang nhap
|   |-- home_page.py                    Trang chu
|   |-- checkout_page.py                Trang gio hang / dat hang
|
|-- utils/                              Tien ich
|   |-- driver_factory.py               Tao Chrome WebDriver (headless/headed)
|   |-- config_reader.py                Doc cau hinh tu bien moi truong
|   |-- excel_reader.py                 Doc file Excel test data
|   |-- action_keywords.py              Thu vien keyword (open, click, type, assert...)
|   |-- wait_helper.py                  Explicit Wait helper
|   |-- logger.py                       Ghi log ra console va file
|
|-- testdata/                           Du lieu test (file Excel)
|   |-- test_data.xlsx                  Data-Driven: Login (8 TC), Register (8 TC), Checkout (10 TC)
|   |-- keyword_steps.xlsx              Keyword-Driven: 28 steps, 5 test cases
|   |-- auth-test-data-styled.xlsx      File Excel goc (Login + Register)
|   |-- website-keywords-framework.xlsx File Excel goc keyword-driven
|   |-- object-repository.json          Anh xa ten object -> CSS/XPath selector
|
|-- reports/                            Bao cao test (tu dong tao khi chay)
|-- conftest.py                         Pytest fixtures (driver, base_url, api_url)
|-- pytest.ini                          Cau hinh pytest + markers
|-- requirements.txt                    Thu vien can cai (selenium, openpyxl, pytest)
|-- README.md                           Huong dan chi tiet
```

## 3. Data-Driven Testing (Kiem thu huong du lieu)

### Y tuong

Thay vi viet code cho tung truong hop test, ta viet du lieu test vao file Excel. Code Python tu doc Excel va chay tung dong. Moi dong la mot test case, gom cac cot: id, ten, du lieu dau vao, ket qua mong doi.

### File Excel: `test/AutomationFramework/testdata/test_data.xlsx`

File nay co 3 sheet:

**Sheet "Login"** - test dang nhap (8 test case):

| id | name | username | password | expected |
|----|------|----------|----------|----------|
| L01 | Admin dang nhap thanh cong | admin | 123 | success |
| L02 | Bo trong username | | 123 | html5-invalid |
| L03 | Bo trong password | admin | | html5-invalid |
| L04 | Sai mat khau | admin | wrongpassword | success |
| L05 | Username khong ton tai | nouser | 123 | success |
| L06 | Bo trong ca 2 truong | | | html5-invalid |
| L07 | Username co khoang trang | admin | 123 | success |
| L08 | Mat khau ky tu dac biet | admin | P@ss!123# | success |

**Sheet "Register"** - test dang ky (8 test case):

| id | name | tenTK | matKhau | email | tenND | sdt | expected |
|----|------|-------|---------|-------|-------|-----|----------|
| R01 | Dang ky hop le day du | testuser01 | Pass123! | test01@mail.com | Nguyen Van A | 0123456789 | valid-form |
| R02 | Thieu email - invalid | testuser02 | Pass123! | | Nguyen Van B | 0123456789 | html5-invalid |
| ... | ... | ... | ... | ... | ... | ... | ... |

**Sheet "Checkout"** - test dat hang (10 test case):

| id | name | productId | productName | productPrice | loginMaND | customerName | expected |
|----|------|-----------|-------------|-------------|-----------|-------------|----------|
| C01 | Gio hang trong | | | | | | cart-empty |
| C05 | Dat hang chua login | 101 | Hoa hong do | 350000 | | Nguyen Test | invoice-blocked-no-login |
| C07 | Dat hang thanh cong | 101 | Hoa hong do | 350000 | 1 | Nguyen Hoa | invoice-success |

### Gia tri `expected`

- `success`: Dang nhap thanh cong, session duoc tao trong localStorage
- `html5-invalid`: Form bi chan boi HTML5 validation (truong required trong)
- `valid-form`: Form dang ky hop le, pass HTML5 validation
- `cart-empty`: Gio hang trong, hien thong bao
- `cart-has-items`: Gio hang co san pham
- `invoice-blocked-no-login`: Khong tao duoc hoa don vi chua dang nhap
- `invoice-blocked-empty-cart`: Khong tao duoc hoa don vi gio hang trong
- `invoice-success`: Tao hoa don thanh cong

### Cach chay

```powershell
# Can start web truoc
.\run-local-web.bat -NoBrowser

# Cai thu vien Python (lan dau)
cd test\AutomationFramework
pip install -r requirements.txt

# Chay test dang nhap
pytest tests/test_login.py -v

# Chay test dat hang
pytest tests/test_checkout.py -v

# Chay tat ca
pytest -v
```

### Cach hoat dong

1. `excel_reader.py` doc file Excel bang thu vien `openpyxl`
2. Moi sheet duoc parse thanh danh sach dict
3. Pytest parametrize tu dong tao test case tu moi dong Excel
4. Page Object (LoginPage, CheckoutPage) thuc hien thao tac tren trinh duyet
5. Ket qua hien trong terminal va co the xuat HTML report

## 4. Keyword-Driven Testing (Kiem thu huong tu khoa)

### Y tuong

Moi buoc test duoc mo ta bang mot tu khoa (keyword) trong file Excel. Nguoi viet test chi can biet cac keyword la viet duoc test, khong can sua code Python.

### Cac thanh phan

#### a) File Excel: `test/AutomationFramework/testdata/keyword_steps.xlsx`

Sheet "TestSteps" co 28 buoc, 5 test case:

| testCaseId | testCaseName | stepOrder | keyword | objectName | testData | description |
|------------|-------------|-----------|---------|------------|----------|-------------|
| TC01 | Trang chu hien thi | 1 | open | homePage | | Mo trang chu |
| TC01 | Trang chu hien thi | 2 | configureApi | | | Cau hinh API URL |
| TC01 | Trang chu hien thi | 3 | waitVisible | siteHeader | | Cho header hien |
| TC02 | Them gio hang | 1 | open | categoryPage | | Mo trang danh muc |
| TC02 | Them gio hang | 2 | click | categoryAddToCartButton | | Click them gio hang |
| TC03 | Dang nhap | 1 | open | loginPage | | Mo trang login |
| TC03 | Dang nhap | 3 | type | loginUsernameInput | admin | Nhap username |
| TC05 | Luong dat hang | 1 | open | loginPage | | Mo trang login |
| TC05 | Luong dat hang | 12 | click | createInvoiceButton | | Click tao hoa don |

#### b) Object Repository: `testdata/object-repository.json`

Anh xa ten object -> CSS/XPath selector that. Khi HTML thay doi selector, chi can sua file nay, khong can sua Excel:

```json
{
  "homePage": { "type": "url", "value": "/index.html" },
  "loginPage": { "type": "url", "value": "/pages/auth/login.html" },
  "cartPage": { "type": "url", "value": "/pages/cart.html" },
  "siteHeader": { "type": "css", "value": ".header" },
  "loginUsernameInput": { "type": "css", "value": "#tenTK" },
  "createInvoiceButton": { "type": "xpath", "value": "//button[contains(text(),'Tao Hoa Don')]" }
}
```

#### c) Action Keywords: `utils/action_keywords.py`

Moi keyword tuong ung 1 hanh dong:

| Keyword | Hanh dong |
|---------|----------|
| `open` | Mo URL trong trinh duyet |
| `configureApi` | Cau hinh API base URL |
| `waitVisible` | Cho element hien tren trang |
| `type` | Go text vao input |
| `click` | Click vao element |
| `assertValue` | Kiem tra gia tri input |
| `assertTextContains` | Kiem tra text co chua chuoi mong doi |
| `assertUrlContains` | Kiem tra URL co chua chuoi mong doi |
| `assertLocalStorageObjectNotEmpty` | Kiem tra localStorage co du lieu |
| `setLocalStorage` | Gan gia tri vao localStorage |
| `clearStorage` | Xoa localStorage va sessionStorage |

#### d) Keyword Driver: `tests/test_keyword_driven.py`

- Doc Excel bang `excel_reader.py` -> nhom theo testCaseId -> chay tung step
- Moi step goi `ActionKeywords.execute(step)`
- Ket qua duoc log chi tiet tung buoc

### Cach chay

```powershell
.\run-local-web.bat -NoBrowser
cd test\AutomationFramework
pytest tests/test_keyword_driven.py -v
```

## 5. Page Object Model (POM)

Framework su dung POM de tach biet logic test va thao tac tren trang web:

```
                    BasePage
                       |
          +------------+------------+
          |            |            |
      LoginPage    HomePage   CheckoutPage
          |                        |
     test_login              test_checkout
                  test_keyword_driven
```

- `BasePage`: Cac ham dung chung (navigate, click, type, JavaScript, localStorage, alert)
- `LoginPage`: Thao tac tren trang dang nhap (nhap username/password, submit, kiem tra session)
- `HomePage`: Thao tac tren trang chu (search, header, menu)
- `CheckoutPage`: Thao tac tren trang gio hang (them SP, dien form, tao hoa don)

## 6. Cach cai dat va chay

```powershell
# 1. Cai Python dependencies
cd test\AutomationFramework
pip install -r requirements.txt

# 2. Start website
cd ..\..
.\run-local-web.bat -NoBrowser

# 3. Chay test
cd test\AutomationFramework
pytest -v                                # Tat ca test
pytest -m login -v                       # Chi test dang nhap
pytest -m checkout -v                    # Chi test dat hang
pytest -m keyword -v                     # Chi keyword-driven
pytest -m smoke -v                       # Chi smoke test

# 4. Xuat bao cao HTML
pytest --html=reports/report.html --self-contained-html
```

## 7. Bien moi truong

| Bien | Mac dinh | Mo ta |
|------|----------|-------|
| `FRONTEND_BASE_URL` | `http://127.0.0.1:5500` | URL frontend |
| `API_BASE_URL` | `https://localhost:7114` | URL backend API |
| `HEADLESS` | `true` | Chay Chrome an (khong hien cua so) |

## 8. So do quan he giua cac test

```
                    +------------------+
                    |   Jenkinsfile    |
                    |    (root)        |
                    +--------+---------+
                             |
               +-------------+-------------+
               v             v             v
      +------------+  +-------------+  +----------+
      | .NET Build |  | Newman API  |  | Selenium |
      | & Test     |  | Tests       |  | Web Test |
      +------------+  +-------------+  +----------+

      +--------------------------------------------+
      |         AutomationFramework (Python)        |
      +--------------------------------------------+
      |  Data-Driven     |  Data-Driven  | Keyword |
      |  Login/Register  |  Checkout     | Driven  |
      |  (Excel)         |  (Excel)      | (Excel) |
      +------------------+--------------+---------+
```

## 9. Tom tat cac lenh thuong dung

| Lenh | Muc dich |
|------|----------|
| `.\setup-local-env.bat` | Cai dat moi truong lan dau |
| `.\run-local-web.bat` | Khoi dong website |
| `.\stop-local-web.bat` | Dung website |
| `.\run-local-smoke.bat` | Chay smoke test (API + Web) |
| `pytest -v` | Chay tat ca test trong AutomationFramework |
| `pytest tests/test_login.py -v` | Chay test dang nhap |
| `pytest tests/test_checkout.py -v` | Chay test dat hang |
| `pytest tests/test_keyword_driven.py -v` | Chay keyword-driven test |
| `pytest -m smoke -v` | Chay chi cac smoke test |
