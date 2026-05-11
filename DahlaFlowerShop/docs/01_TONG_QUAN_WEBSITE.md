# 🌸 Dahla Flower Shop - Hướng Dẫn Tổng Quan Website

## 1. Giới thiệu dự án

**Dahla Flower Shop** là website thương mại điện tử bán hoa trực tuyến, được phát triển như đồ án tốt nghiệp. Website cho phép khách hàng xem, tìm kiếm, đặt mua hoa và quản trị viên quản lý toàn bộ cửa hàng.

## 2. Cấu trúc thư mục tổng quan

```
DahlaFlowerShop/
├── frontend/              → Giao diện người dùng (HTML/CSS/JS)
│   ├── index.html         → Trang chủ
│   ├── css/               → 6 file CSS (main, admin, auth, cart, category, product-detail)
│   ├── js/                → 13 file JS (AngularJS controllers, jQuery, auth, config...)
│   ├── pages/             → Các trang con (auth, admin, products, blog, cart...)
│   └── assets/images/     → Hình ảnh sản phẩm, banner, blog, icon
│
├── backend/               → 3 project ASP.NET Web API (.NET 8)
│   ├── API_Dahla/         → Admin API (port 5003/7079)
│   ├── Dahla_NguoiDung/   → User API (port 5193/7023)
│   └── Dahla_GateWays/    → API Gateway Ocelot (port 7114/5075)
│
├── database/              → SQL Server scripts
│   └── API_Dahla.sql      → Tạo DB, bảng, stored procedures, dữ liệu mẫu
│
├── ci/                    → CI/CD scripts, Newman, Selenium tests
├── test/                  → Test bổ sung (data-driven, keyword-driven)
├── docs/                  → Tài liệu đồ án
├── Jenkinsfile            → Pipeline CI/CD chính
├── setup-local-env.bat    → Script cài đặt môi trường
├── run-local-web.bat      → Khởi động website local
├── run-local-smoke.bat    → Chạy smoke test tự động
└── stop-local-web.bat     → Dừng website local
```

## 3. Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| **Frontend** | HTML5, CSS3, Bootstrap 5, AngularJS 1.x, jQuery, Slick Carousel |
| **Backend** | ASP.NET Web API (.NET 8), kiến trúc 3-Layer (BLL/DAL/Model) |
| **Gateway** | Ocelot API Gateway - điều hướng request tới đúng API |
| **Database** | SQL Server, Stored Procedures |
| **CI/CD** | Jenkins Pipeline, Newman (Postman), Selenium WebDriver |
| **Testing** | Data-driven (Excel), Keyword-driven (Excel), Smoke tests |

## 4. Frontend - Giao diện người dùng

### 4.1 Trang chủ (`index.html`)
- **Header**: Logo, ô tìm kiếm sản phẩm (AngularJS), nút Đăng nhập/Đăng ký, giỏ hàng
- **Menu điều hướng**: Danh mục SP, Chủ đề (sinh nhật, cưới, Giáng sinh...), Blog, FAQ
- **Banner carousel**: 3 ảnh banner xoay tự động (Bootstrap Carousel)
- **Sản phẩm**: Bán chạy, Mới, Tiêu biểu - mỗi SP có nút thêm giỏ hàng/xem chi tiết
- **Chatbot**: Bot chat đơn giản trả lời câu hỏi về hoa, giá, địa chỉ
- **Footer**: Thông tin cửa hàng, liên kết mạng xã hội, video YouTube

### 4.2 Các trang con (`pages/`)

| Trang | Mô tả |
|-------|-------|
| `auth/login.html` | Đăng nhập bằng tên TK + mật khẩu |
| `auth/register.html` | Đăng ký tài khoản mới |
| `products/category.html` | Danh sách sản phẩm theo danh mục, có nút thêm giỏ hàng |
| `products/product-detail.html` | Chi tiết 1 sản phẩm |
| `cart.html` | Giỏ hàng, tạo hóa đơn |
| `admin/dashboard.html` | Trang quản trị (CRUD danh mục, SP, tài khoản, người dùng, voucher, hóa đơn) |
| `account/profile.html` | Trang cá nhân người dùng |
| `blog/` | Blog & Tips về hoa |
| `about.html`, `faq.html`, `careers.html` | Giới thiệu, FAQ, Tuyển dụng |

### 4.3 JavaScript quan trọng

- **`config.js`**: Xác định URL API base. Nếu chạy localhost → dùng `http://localhost:5075`, nếu không → dùng origin của trang
- **`app.js`**: AngularJS module `userApp` với các controller:
  - `trangchuCtrl`: Load danh mục, đăng nhập, tìm SP theo danh mục
  - `DangKyCtrl`: Đăng ký tài khoản + người dùng
  - `SanPhamCtrl`: Tìm kiếm sản phẩm real-time
  - `InvoiceController`: Tạo hóa đơn từ giỏ hàng
- **`site-auth.js`**: Quản lý phiên đăng nhập, hiển thị thông tin user trên header
- **`admin.js` + `admin-controllers.js`**: Controller cho trang admin dashboard

### 4.4 CSS

- `main.css`: Style chính cho toàn site (header, menu, banner, content, footer)
- `admin.css`: Style riêng cho trang quản trị
- `auth.css`: Style trang đăng nhập/đăng ký
- `cart.css`, `category.css`, `product-detail.css`: Style cho từng trang

## 5. Backend - ASP.NET Web API

### 5.1 Kiến trúc 3-Layer

Mỗi project backend đều có 3 tầng:

```
┌─────────────────────┐
│   API Controller    │  ← Nhận HTTP request, trả JSON
├─────────────────────┤
│   BLL (Business)    │  ← Xử lý logic nghiệp vụ
├─────────────────────┤
│   DAL (Data Access) │  ← Gọi Stored Procedure, thao tác DB
├─────────────────────┤
│   Model             │  ← Các class đối tượng (SanPham, TaiKhoan...)
└─────────────────────┘
```

### 5.2 Ba project backend

#### API_Dahla (Admin API) - Port 5003
Dành cho **quản trị viên**, cung cấp CRUD cho:
- Danh mục sản phẩm (`/api/DanhMuc/`)
- Sản phẩm (`/api/SanPham/`)
- Tài khoản (`/api/TaiKhoan/`)
- Người dùng (`/api/NguoiDung/`)
- Voucher (`/api/Voucher/`)
- Hóa đơn (`/api/HoaDon/`)

#### Dahla_NguoiDung (User API) - Port 5193
Dành cho **khách hàng**, cung cấp:
- Xem danh mục, sản phẩm
- Đăng nhập (`CheckLogin`)
- Giỏ hàng
- Tạo hóa đơn
- Gửi feedback

#### Dahla_GateWays (Gateway) - Port 7114
Sử dụng **Ocelot** làm API Gateway:
- Route `/api-admin/*` → Admin API (port 5003)
- Route `/api-user/*` → User API (port 5193)
- Frontend chỉ cần gọi 1 URL duy nhất (gateway), gateway tự chuyển tiếp

## 6. Database - SQL Server

### 6.1 Các bảng chính

| Bảng | Mô tả |
|------|-------|
| `TaiKhoan` | Tài khoản (MaTK, TenTK, MatKhau, Quyen, Email, TrangThai) |
| `NguoiDung` | Thông tin người dùng (MaND→MaTK, TenND, SinhNhat, DiaChi, SDT, Anh, GioiTinh) |
| `DanhMucSP` | Danh mục sản phẩm |
| `SanPham` | Sản phẩm (tên, mô tả, giá, ảnh, số lượng, danh mục, voucher) |
| `GioHang` | Giỏ hàng (MaSanPham + MaND → SoLuong) |
| `Voucher` | Mã giảm giá |
| `HoaDon` | Hóa đơn (ngày mua, tổng tiền, trạng thái, địa chỉ giao) |
| `ChiTietHD` | Chi tiết hóa đơn (SP, số lượng, giá, giảm giá) |
| `Feedback` | Đánh giá của khách hàng |

### 6.2 Stored Procedures
File `database/API_Dahla.sql` chứa ~30 stored procedures cho mọi thao tác CRUD: thêm/sửa/xóa/tìm kiếm cho tất cả các bảng.

### 6.3 Dữ liệu mẫu
Script tự tạo sẵn:
- 4 tài khoản (1 admin + 3 user)
- 5 người dùng
- 2 voucher mẫu
