# 🌸 Dahla Flower Shop

Website thương mại điện tử bán hoa - Đồ án 2

## 📁 Cấu trúc project

```
DahlaFlowerShop/
├── frontend/          → Giao diện web (HTML, CSS, JS)
│   ├── index.html     → Trang chủ
│   ├── css/           → Stylesheets
│   ├── js/            → JavaScript (AngularJS, jQuery)
│   ├── pages/         → Các trang con
│   │   ├── products/  → Sản phẩm (danh mục, chi tiết, sinh nhật, cưới...)
│   │   ├── auth/      → Đăng nhập, Đăng ký
│   │   ├── admin/     → Dashboard quản trị
│   │   └── blog/      → Blog & Tips
│   └── assets/images/ → Hình ảnh (products, banners, blogs, icons)
│
├── backend/           → ASP.NET Web API (.NET 8)
│   ├── API_Dahla/     → Admin API (CRUD sản phẩm, tài khoản, voucher...)
│   ├── Dahla_GateWays/→ API Gateway (Ocelot)
│   └── Dahla_NguoiDung/→ User API (sản phẩm, giỏ hàng, feedback)
│
├── database/          → SQL Server scripts
│   └── API_Dahla.sql  → Tạo DB + Stored Procedures
│
└── docs/              → Tài liệu đồ án
```

## 🚀 Hướng dẫn chạy

### 1. Database
- Mở SQL Server Management Studio (SSMS)
- Chạy file `database/API_Dahla.sql` để tạo database

### 2. Backend
- Mở `backend/API_Dahla/API_Dahla.sln` bằng Visual Studio 2022
- Mở `backend/Dahla_GateWays/Dahla_GateWays.sln`
- Mở `backend/Dahla_NguoiDung/Dahla_NguoiDung.sln`
- Chạy cả 3 project

### 3. Frontend
- Mở terminal tại thư mục `frontend/`
- Chạy: `python -m http.server 8080`
- Truy cập: http://localhost:8080

## 🛠️ Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| Frontend | HTML5, CSS3, Bootstrap 5, AngularJS, jQuery |
| Backend | ASP.NET Web API (.NET 8), 3-Layer (BLL/DAL/Model) |
| Gateway | Ocelot API Gateway |
| Database | SQL Server, Stored Procedures |

## 👤 Tác giả
- Lưu Hoài Thương
