# 🧪 Dahla Flower Shop - Hướng Dẫn Testing

## 1. Tổng quan các loại test trong dự án

Dự án có **4 loại test** khác nhau:

| Loại test | Công cụ | Thư mục | Mục đích |
|-----------|---------|---------|----------|
| **.NET Unit Test** | dotnet test | `backend/*/` | Kiểm tra code backend biên dịch đúng |
| **API Contract Test** | Newman (Postman) | `ci/newman/` | Test tất cả API endpoint qua Gateway |
| **Web Smoke Test** | Selenium WebDriver | `ci/selenium/` | Test giao diện web trên trình duyệt |
| **Data-Driven Test** | Selenium + Excel | `test/data-driven/` | Test đăng nhập/đăng ký với dữ liệu từ Excel |
| **Keyword-Driven Test** | Selenium + Excel | `test/keyword-driven/` | Test luồng website bằng từ khóa từ Excel |

## 2. Data-Driven Testing (Kiểm thử hướng dữ liệu)

### Ý tưởng
Thay vì viết code cho từng trường hợp test, ta **viết dữ liệu test vào file Excel**. Code tự đọc Excel và chạy từng dòng.

### File Excel: `test/data-driven/auth-test-data-styled.xlsx`

**Sheet "Login"** - test đăng nhập:

| id | name | username | password | expected |
|----|------|----------|----------|----------|
| L1 | Admin đăng nhập | admin | 123 | success |
| L2 | Bỏ trống username | | 123 | html5-invalid |
| L3 | Sai mật khẩu | admin | wrong | success |

**Sheet "Register"** - test đăng ký:

| id | name | tenTK | matKhau | email | tenND | sdt | expected |
|----|------|-------|---------|-------|-------|-----|----------|
| R1 | Đăng ký hợp lệ | testuser | pass123 | test@mail.com | Nguyễn A | 0123456789 | valid-form |
| R2 | Thiếu email | testuser | pass123 | | Nguyễn A | 0123456789 | html5-invalid |

### Cách chạy
```powershell
# Cần start web trước
.\run-local-web.bat -NoBrowser

# Chạy test
node .\test\data-driven\auth-data-driven.test.js
```

### Cách hoạt động (`auth-data-driven.test.js`)
1. Đọc file Excel bằng thư viện `xlsx`
2. Với mỗi dòng Login: mở trang login → điền username/password → kiểm tra kết quả
3. Với mỗi dòng Register: mở trang register → điền form → kiểm tra HTML5 validation
4. Xuất báo cáo: `test/reports/data-driven-auth-report.html` và `.json`

### Giá trị `expected`
- `success`: Đăng nhập thành công, session được tạo trong localStorage
- `html5-invalid`: Form bị chặn bởi HTML5 validation (trường required trống)
- `valid-form`: Form đăng ký hợp lệ, pass HTML5 validation

## 3. Keyword-Driven Testing (Kiểm thử hướng từ khóa)

### Ý tưởng
Mỗi bước test được mô tả bằng **từ khóa** (keyword) trong Excel. Không cần biết code, chỉ cần biết các từ khóa là viết được test.

### Các thành phần

#### a) File Excel: `test/keyword-driven/website-keywords-framework.xlsx`
Sheet "TestSteps" chứa:

| testCaseId | testCaseName | stepOrder | keyword | objectName | testData | description |
|------------|-------------|-----------|---------|------------|----------|-------------|
| TC01 | Trang chủ hiển thị | 1 | open | homePage | | Mở trang chủ |
| TC01 | Trang chủ hiển thị | 2 | configureApi | | | Cấu hình API URL |
| TC01 | Trang chủ hiển thị | 3 | waitVisible | siteHeader | | Chờ header hiện |
| TC02 | Thêm giỏ hàng | 1 | open | categoryPage | | Mở trang danh mục |
| TC02 | Thêm giỏ hàng | 2 | click | categoryAddToCartButton | | Click thêm giỏ hàng |

#### b) Object Repository: `object-repository.json`
Ánh xạ tên object → CSS selector thật:

```json
{
  "homePage": { "type": "url", "value": "/index.html" },
  "loginPage": { "type": "url", "value": "/pages/auth/login.html" },
  "siteHeader": { "type": "css", "value": ".header" },
  "loginUsernameInput": { "type": "css", "value": "#tenTK" },
  "categoryAddToCartButton": { "type": "css", "value": ".btn-cart" },
  "cartStorage": { "type": "storage", "value": "DatHang" }
}
```

#### c) Action Keywords: `action-keywords.js`
Mỗi keyword tương ứng 1 hành động:

| Keyword | Hành động |
|---------|----------|
| `open` | Mở URL trong trình duyệt |
| `configureApi` | Cấu hình API base URL cho frontend |
| `waitVisible` | Chờ element hiện trên trang |
| `type` | Gõ text vào input |
| `click` | Click vào element |
| `assertValue` | Kiểm tra giá trị input |
| `assertTextContains` | Kiểm tra text có chứa chuỗi mong đợi |
| `assertUrlContains` | Kiểm tra URL có chứa chuỗi mong đợi |
| `assertLocalStorageObjectNotEmpty` | Kiểm tra localStorage có dữ liệu |

#### d) Keyword Driver: `keyword-driver.js`
- Đọc Excel → nhóm theo testCaseId → chạy từng step theo thứ tự stepOrder
- Mỗi step gọi ActionKeywords.execute(step)
- Xuất báo cáo HTML và JSON

### Cách chạy
```powershell
.\run-local-web.bat -NoBrowser
node .\test\keyword-driven\website-keyword-driven.test.js
```

### Báo cáo
- `test/reports/keyword-driven-website-report.html`
- `test/reports/keyword-driven-website-report.json`

## 4. Report Utils

File `test/report-utils.js` cung cấp hàm `writeHtmlReport()` tạo báo cáo HTML đẹp cho cả data-driven và keyword-driven tests, gồm:
- Tổng số test, pass, fail, tỷ lệ pass
- Bảng chi tiết từng test case
- Expandable steps cho keyword-driven

## 5. Jenkins Pipeline cho Excel Tests

File `ci/jenkins-excel-tests/Jenkinsfile` là pipeline **riêng** chạy 2 bộ test Excel:

```
Stage 1: Clone source
Stage 2: Cài Node dependencies
Stage 3: Start/Reuse local web
Stage 4: Chạy Data-Driven Auth Tests
Stage 5: Chạy Keyword-Driven Website Tests
Stage 6: Archive reports + Excel files
```

### Tạo Jenkins job cho Excel tests
1. Tạo Pipeline job mới trong Jenkins
2. Trỏ Script Path tới: `DahlaFlowerShop/ci/jenkins-excel-tests/Jenkinsfile`
3. Mặc định `KEEP_SERVICES=true` để tái sử dụng web đang chạy

## 6. Sơ đồ quan hệ giữa các test

```
                    ┌──────────────────┐
                    │   Jenkinsfile    │
                    │    (root)        │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌────────────┐  ┌─────────────┐  ┌──────────┐
     │ .NET Build │  │ Newman API  │  │ Selenium │
     │ & Test     │  │ Tests       │  │ Web Test │
     └────────────┘  └─────────────┘  └──────────┘
                                           │
                    ┌──────────────────────┘
                    │
     ┌──────────────────────────────┐
     │  Jenkins Excel Tests        │
     │  (Jenkinsfile riêng)        │
     ├──────────────┬───────────────┤
     │ Data-Driven  │ Keyword-Driven│
     │ (Excel Login │ (Excel Steps  │
     │  & Register) │  & Keywords)  │
     └──────────────┴───────────────┘
```

## 7. Tóm tắt các lệnh thường dùng

| Lệnh | Mục đích |
|-------|----------|
| `.\setup-local-env.bat` | Cài đặt môi trường lần đầu |
| `.\run-local-web.bat` | Khởi động website để xem |
| `.\stop-local-web.bat` | Dừng website |
| `.\run-local-smoke.bat` | Chạy toàn bộ CI test (API + Web) |
| `.\run-local-smoke.bat -KeepServices` | Chạy test, giữ services sau khi xong |
| `.\run-local-smoke.bat -OpenReport` | Chạy test, tự mở báo cáo |
| `.\run-local-smoke.bat -SkipSelenium` | Chạy test, bỏ qua Selenium |
| `node test\data-driven\auth-data-driven.test.js` | Chạy test data-driven |
| `node test\keyword-driven\website-keyword-driven.test.js` | Chạy test keyword-driven |
