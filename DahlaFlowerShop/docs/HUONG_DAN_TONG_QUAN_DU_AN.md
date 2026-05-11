# Huong dan tong quan du an Dahla Flower Shop

Tai lieu nay giai thich du an theo cach danh cho nguoi moi: du an gom nhung phan nao, moi phan lam gi, chay ra sao, test ra sao va Jenkins dung de tu dong hoa cong viec gi.

## 1. Du an nay la gi?

`DahlaFlowerShop` la website ban hoa truc tuyen. Nguoi dung co the xem san pham, tim kiem, xem danh muc, xem chi tiet san pham, them vao gio hang, dang ky, dang nhap va tao hoa don. Quan tri vien co trang dashboard de quan ly danh muc, san pham, tai khoan, nguoi dung, voucher va hoa don.

Ve ky thuat, du an chia thanh 5 phan lon:

| Phan | Thu muc | Vai tro |
|---|---|---|
| Frontend | `frontend/` | Giao dien website bang HTML, CSS, JavaScript, AngularJS va jQuery |
| Backend API | `backend/` | Cac Web API .NET xu ly du lieu va nghiep vu |
| Database | `database/` | File SQL tao bang, du lieu mau va stored procedure |
| CI | `ci/` va `Jenkinsfile` | Script tu dong build, chay web, chay test va dong goi bao cao |
| Test | `test/` va `ci/selenium`, `ci/newman` | Kiem thu website/API bang Selenium, Excel va Newman |

## 2. Giai thich cau truc thu muc

```text
DahlaFlowerShop/
|-- frontend/                 Giao dien website
|   |-- index.html            Trang chu
|   |-- css/                  File giao dien: mau sac, layout, form, admin
|   |-- js/                   Logic frontend
|   |-- pages/                Cac trang con
|   |-- assets/images/        Anh banner, san pham, blog, icon, khach hang
|
|-- backend/                  Ma nguon .NET
|   |-- API_Dahla/            API chinh/admin
|   |-- Dahla_NguoiDung/      API cho nguoi dung
|   |-- Dahla_GateWays/       API Gateway dung Ocelot
|
|-- database/
|   |-- API_Dahla.sql         Script tao database API_Dahla
|
|-- ci/                       Cong cu CI, smoke test, start/stop local web
|   |-- newman/               Postman collection de test API
|   |-- selenium/             Selenium smoke test
|   |-- jenkins-excel-tests/  Jenkinsfile rieng cho test Excel
|
|-- test/
|   |-- data-driven/          Test doc du lieu tu Excel
|   |-- keyword-driven/       Test doc keyword tu Excel
|   |-- reports/              Bao cao sinh ra sau khi chay test
|
|-- docs/                     Tai lieu do an
|-- run-local-web.bat         Lenh nhanh de start web local
|-- run-local-smoke.bat       Lenh nhanh de chay smoke test day du
|-- stop-local-web.bat        Lenh dung service local
|-- Jenkinsfile               Pipeline CI tong hop
```

## 3. Website frontend

Frontend nam trong `frontend/`. Day la website tinh: cac trang HTML duoc phuc vu bang static server, sau do JavaScript goi API de lay du lieu.

### 3.1 Cong nghe frontend

| Cong nghe | Dung de lam gi |
|---|---|
| HTML | Tao noi dung tung trang |
| CSS | Dinh dang giao dien |
| Bootstrap/Bootstrap Icons | Icon, modal, layout co san |
| AngularJS | Binding du lieu, goi API, controller tren trang |
| jQuery | Xu ly DOM, click, gio hang |
| localStorage | Luu tam session dang nhap, gio hang, wishlist tren trinh duyet |

### 3.2 Cac trang chinh

| Trang | File | Chuc nang |
|---|---|---|
| Trang chu | `frontend/index.html` | Banner, menu, danh sach san pham, tim kiem, nut gio hang/wishlist |
| Dang nhap | `frontend/pages/auth/login.html` | Nguoi dung nhap ten tai khoan/mat khau |
| Dang ky | `frontend/pages/auth/register.html` | Tao tai khoan va thong tin nguoi dung |
| Gio hang | `frontend/pages/cart.html` | Hien san pham da them, xoa san pham, tao hoa don |
| Chi tiet san pham | `frontend/pages/products/product-detail.html` | Xem mot san pham va them vao gio |
| Danh muc san pham | `frontend/pages/products/category.html`, `birthday.html`, `christmas.html`, `teddy-bear.html`, `chocolate.html` | Hien cac nhom san pham |
| Yeu thich | `frontend/pages/wishlist.html` | Luu san pham muon xem lai |
| Ho so ca nhan | `frontend/pages/account/profile.html` | Xem/sua thong tin tai khoan dang dang nhap |
| Admin dashboard | `frontend/pages/admin/dashboard.html` | Quan ly du lieu cua shop |
| Blog/Tin tuc/Gioi thieu/FAQ/Tuyen dung | `frontend/pages/blog/`, `about.html`, `news.html`, `faq.html`, `careers.html` | Noi dung thong tin phu |

### 3.3 Cac file JavaScript quan trong

| File | Giai thich |
|---|---|
| `frontend/js/config.js` | Xac dinh API base URL. Mac dinh local la `http://localhost:5075`; khi test co the gan `window.APP_API_BASE_URL` thanh `https://localhost:7114`. |
| `frontend/js/app.js` | AngularJS app `userApp`. Chua controller cho trang chu, dang nhap, dang ky, san pham, tao hoa don. |
| `frontend/js/site-auth.js` | Lop logic dung chung: session dang nhap, header, logout, wishlist, quick cart count, sua link menu, them san pham vao gio. |
| `frontend/js/cart.js` | Doc gio hang tu `localStorage.DatHang`, render bang gio hang, xoa san pham. |
| `frontend/js/product-detail.js` | Them san pham chi tiet vao gio hang. |
| `frontend/js/admin.js` | Xu ly UI admin: doi tab, menu sidebar, dark mode. |
| `frontend/js/admin-controllers.js` | AngularJS app `adminApp`. Goi API de CRUD danh muc, san pham, tai khoan, nguoi dung, voucher, hoa don. |
| `frontend/js/profile.js` | Xu ly trang ho so ca nhan. |
| `frontend/js/chatbot.js` | Logic chatbot neu trang co nhung thanh phan tuong ung. |

### 3.4 Luong nguoi dung binh thuong

1. Nguoi dung mo `index.html`.
2. `config.js` tinh API base URL.
3. `app.js` goi API lay danh muc/san pham.
4. `site-auth.js` tao header: nut dang nhap/dang ky neu chua login, avatar va dang xuat neu da login.
5. Khi bam them gio hang, san pham duoc luu vao `localStorage` key `DatHang`.
6. Khi vao gio hang, `cart.js` doc `DatHang` va hien bang san pham.
7. Khi tao hoa don, `InvoiceController` trong `app.js` gom gio hang thanh payload va goi API `HoaDon/hd-create`.

### 3.5 Luong dang nhap

1. Trang `login.html` co form username/password.
2. JavaScript goi API:

```text
POST /api-user/TaiKhoan/CheckLogin
```

3. Gateway chuyen request nay ve `API_Dahla`:

```text
/api-user/TaiKhoan/CheckLogin -> http://localhost:5003/api/TaiKhoan/CheckLogin
```

4. Neu dung tai khoan, frontend luu:

```text
localStorage.DahlaAuthSession
localStorage.MaND
```

5. Header doi sang trang thai da dang nhap.

### 3.6 Luong dang ky

1. Trang `register.html` dung `DangKyCtrl`.
2. Form kiem tra bat buoc: ten tai khoan, mat khau, email, ho ten, so dien thoai.
3. Frontend lay danh sach tai khoan/nguoi dung hien co de tao ID moi.
4. Goi API tao tai khoan:

```text
POST /api-admin/TaiKhoan/tk-create
```

5. Sau do goi API tao thong tin nguoi dung:

```text
POST /api-admin/NguoiDung/nd-create
```

6. Thanh cong thi chuyen ve trang dang nhap.

### 3.7 Admin dashboard

Admin dashboard nam o `frontend/pages/admin/dashboard.html`. Trang nay co cac tab:

| Tab | Controller | API chinh |
|---|---|---|
| Danh muc | `DanhMucCtrl` | `/api-admin/DanhMuc/get-all`, `/dm-create` |
| San pham | `SanPhamCtrl` | `/api-admin/SanPham/get-all-sp`, `/sp-create`, `/sp-update`, `/Delete/{id}` |
| Tai khoan | `TaiKhoanCtrl` | `/api-admin/TaiKhoan/get-all-tk`, `/tk-create`, `/tk-update`, `/Delete/{id}` |
| Nguoi dung | `NguoiDungCtrl` | `/api-admin/NguoiDung/get-all-nd`, `/nd-create`, `/nd-update`, `/nd-Delete/{id}` |
| Hoa don | `HoaDonCtrl` | `/api-admin/HoaDon/get-all-hd`, `/get-data-by-id/{id}` |
| Voucher | `VoucherCtrl` | `/api-admin/Voucher/get-all-voucher`, `/voucher-create`, `/voucher-update`, `/Delete/{id}` |

## 4. Backend .NET

Backend nam trong `backend/` va gom 3 solution/project lon.

### 4.1 `API_Dahla`

`backend/API_Dahla/` la API chinh, phuc vu phan admin va mot so API nguoi dung. Kien truc trong project nay chia theo 3 lop:

| Lop | Thu muc | Vai tro |
|---|---|---|
| Controller | `API_Dahla/API_Dahla/Controllers/` | Nhan request HTTP |
| BLL | `API_Dahla/BLL/` | Xu ly nghiep vu |
| DAL | `API_Dahla/DAL/` | Goi database/stored procedure |
| Model | `API_Dahla/Model/` | Lop du lieu: SanPham, TaiKhoan, NguoiDung, HoaDon... |

Controller chinh:

| Controller | Chuc nang |
|---|---|
| `DanhMucController` | Lay/tim/tao danh muc san pham |
| `SanPhamController` | Tao, sua, xoa, lay danh sach, tim san pham |
| `TaiKhoanConTroller` | Tao/sua/xoa/tim tai khoan, dang nhap, reset password |
| `NguoiDungController` | Tao/sua/xoa/lay nguoi dung |
| `HoaDonController` | Tao hoa don, lay danh sach, lay chi tiet, tim, update/delete |
| `VoucherController` | Tao/sua/xoa/tim voucher |

Port local thuong dung:

```text
http://localhost:5003
https://localhost:7079
```

### 4.2 `Dahla_NguoiDung`

`backend/Dahla_NguoiDung/` la API cho cac chuc nang nguoi dung. No cung chia thanh Controller/BLL/DAL/Model.

Controller chinh:

| Controller | Chuc nang |
|---|---|
| `SanPhamController` | Lay tat ca san pham, lay theo id, lay theo danh muc, tim kiem |
| `GioHangController` | Tao/sua/xoa/lay gio hang |
| `FeedbackController` | Tao/lay/xoa feedback |

Port local thuong dung:

```text
http://localhost:5193
https://localhost:7023
```

### 4.3 `Dahla_GateWays`

`backend/Dahla_GateWays/` la API Gateway dung Ocelot. Gateway la cua vao chung cho frontend va test. Thay vi frontend goi truc tiep tung API port 5003/5193, frontend goi gateway:

```text
https://localhost:7114
```

Sau do `ocelot.json` dieu huong request:

| URL frontend/test goi | Gateway chuyen den |
|---|---|
| `/api-admin/DanhMuc/...` | `http://localhost:5003/api/DanhMuc/...` |
| `/api-admin/SanPham/...` | `http://localhost:5003/api/SanPham/...` |
| `/api-admin/TaiKhoan/...` | `http://localhost:5003/api/TaiKhoan/...` |
| `/api-admin/NguoiDung/...` | `http://localhost:5003/api/NguoiDung/...` |
| `/api-admin/Voucher/...` | `http://localhost:5003/api/Voucher/...` |
| `/api-admin/HoaDon/...` | `http://localhost:5003/api/HoaDon/...` |
| `/api-user/SanPham/...` | `http://localhost:5193/api/SanPham/...` |
| `/api-user/GioHang/...` | `http://localhost:5193/api/GioHang/...` |
| `/api-user/Feedback/...` | `http://localhost:5193/api/Feedback/...` |
| `/api-user/TaiKhoan/...` | `http://localhost:5003/api/TaiKhoan/...` |
| `/api-user/HoaDon/...` | `http://localhost:5003/api/HoaDon/...` |
| `/api-user/DanhMuc/...` | `http://localhost:5003/api/DanhMuc/...` |

## 5. Database

Database dung SQL Server/LocalDB. File chinh:

```text
database/API_Dahla.sql
```

File nay tao database `API_Dahla`, tao bang, insert du lieu mau va tao stored procedure.

### 5.1 Bang chinh

| Bang | Y nghia |
|---|---|
| `TaiKhoan` | Thong tin dang nhap: ma tai khoan, username, password, quyen, email, trang thai |
| `NguoiDung` | Ho so nguoi dung: ho ten, sinh nhat, dia chi, SDT, anh, gioi tinh |
| `DanhMucSP` | Danh muc san pham |
| `SanPham` | San pham: ten, mo ta, gia, anh, so luong, danh muc |
| `Voucher` | Ma giam gia |
| `GioHang` | Gio hang trong database |
| `HoaDon` | Hoa don/dat hang |
| `ChiTietHD` | Chi tiet tung san pham trong hoa don |
| `Feedback` | Phan hoi cua khach |
| `QC` | Quang cao |

### 5.2 Stored procedure

DAL khong viet SQL truc tiep o moi noi ma goi stored procedure. Vi du:

| Nhom | Stored procedure tieu bieu |
|---|---|
| San pham | `them_sp`, `sua_sp`, `sp_delete_san_pham`, `sp_san_pham_get_all`, `sp_TimSanPham` |
| Nguoi dung | `them_nguoidung`, `sua_nd`, `xoa_nd`, `sp_TimNguoiDung` |
| Danh muc | `sp_LayTatCaDanhMuc`, `tim_danh_muc_theo_ten` |
| Tai khoan | `sp_LayTatCaTaiKhoan`, `sp_ThemTK`, `sp_SuaTaiKhoan`, `sp_XoaTaiKhoan`, `sp_TimKiemTaiKhoan` |
| Voucher | `sp_ThemVoucher`, `sp_SuaVoucher`, `sp_XoaVoucher`, `sp_TimVoucher`, `sp_LayTatCaVoucher` |
| Hoa don | Tao hoa don va them `ChiTietHD` tu danh sach chi tiet |

### 5.3 Connection string

`API_Dahla` va `Dahla_NguoiDung` dung LocalDB:

```text
Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=API_Dahla;Integrated Security=True;TrustServerCertificate=True;
```

Gateway co connection string rieng trong `appsettings.json`, nhung vai tro chinh cua gateway la dieu huong request bang Ocelot.

## 6. Cach chay local

### 6.1 Cach nhanh nhat

Tu thu muc `DahlaFlowerShop`:

```powershell
.\run-local-web.bat
```

Lenh nay goi `ci/run-local-web.ps1` va se:

1. Chuan bi LocalDB neu khong skip.
2. Kiem tra/trust ASP.NET HTTPS dev certificate neu duoc yeu cau.
3. Start Admin API.
4. Start User API.
5. Start Gateway.
6. Start frontend static server o port `5500`.
7. In URL de mo website.

URL mac dinh:

```text
Frontend : http://127.0.0.1:5500/index.html
Gateway  : https://localhost:7114
Admin API: http://localhost:5003/swagger/index.html
User API : http://localhost:5193/swagger/index.html
```

Dung service:

```powershell
.\stop-local-web.bat
```

### 6.2 Neu chi muon chay frontend

Vao thu muc `frontend/` va start static server:

```powershell
python -m http.server 5500 --bind 127.0.0.1
```

Sau do mo:

```text
http://127.0.0.1:5500/index.html
```

Luu y: neu backend/gateway chua chay thi cac chuc nang goi API se loi.

## 7. CI trong du an

CI la phan tu dong hoa: may tu clone code, cai dependency, build, start service, chay test, sinh report.

Du an co 2 pipeline Jenkins:

| Pipeline | File | Muc dich |
|---|---|---|
| Pipeline tong hop | `Jenkinsfile` | Chay smoke test API + Selenium, dong goi artifact |
| Pipeline Excel test | `ci/jenkins-excel-tests/Jenkinsfile` | Chay data-driven va keyword-driven test doc tu Excel |

## 8. Pipeline tong hop: `Jenkinsfile`

Pipeline o repo root duoc thiet ke de chay smoke test day du.

### 8.1 Tham so quan trong

| Tham so | Mac dinh | Y nghia |
|---|---|---|
| `GIT_URL` | GitHub repo | Repo de Jenkins clone |
| `GIT_BRANCH` | `dev` | Nhanh can test |
| `REPO_ROOT` | rong | Neu rong thi dung `%WORKSPACE%\DahlaFlowerShop` |
| `BASE_URL` | `https://localhost:7114` | Gateway URL de Newman/Selenium goi API |
| `FRONTEND_PORT` | `5500` | Port frontend static server |
| `PRODUCT_SEARCH_TERM` | `hoa` | Tu khoa test search san pham |
| `ACCOUNT_SEARCH_TERM` | `admin` | Tu khoa test search tai khoan |
| `STRICT_RESPONSE_TIME` | `false` | Neu true thi fail khi API cham hon nguong |
| `SKIP_DB_SETUP` | `false` | Bo qua tao LocalDB |
| `SKIP_DOTNET_VALIDATION` | `false` | Bo qua restore/build/test .NET |
| `SKIP_SELENIUM` | `false` | Bo qua Selenium |
| `KEEP_SERVICES` | `false` | Giu API/frontend chay sau pipeline |

### 8.2 Cac stage

| Stage | Lam gi |
|---|---|
| `Checkout Source` | Clone code tu Git |
| `Resolve Parameters` | Tinh gia tri thuc te cua repo root, base URL, timeout |
| `Check Source Path` | Kiem tra co `run-local-smoke.bat`, thu muc `ci` |
| `Show Parameters` | In tham so ra log de de debug |
| `Show Environment` | Kiem tra `dotnet`, `node` |
| `Run Local Smoke` | Goi `ci/run-local-smoke.ps1` |
| `Sync Reports` | Copy report tu repo ve workspace Jenkins neu can |
| `Archive Artifacts` | Dong goi `ci/artifacts/**/*`, publish JUnit |

### 8.3 `ci/run-local-smoke.ps1` lam gi?

Script nay la trai tim cua smoke pipeline:

1. Chay `run-dotnet-validation.ps1` de restore/build/test .NET.
2. Tao LocalDB smoke schema bang `setup-localdb.ps1`.
3. Cai Node dependency trong `ci` neu thieu.
4. Start Admin API, User API, Gateway va frontend.
5. Cho cac service ready.
6. Chay Newman API test.
7. Chay Selenium web smoke test.
8. Dong goi report bang `package-artifacts.ps1`.
9. Stop service neu khong co `-KeepServices`.

## 9. Pipeline Excel: `ci/jenkins-excel-tests/Jenkinsfile`

Pipeline nay tap trung vao 2 bo test nam trong `test/`.

### 9.1 Muc dich

Dung khi muon chung minh 2 ky thuat test:

| Ky thuat | Thu muc | Giai thich ngan |
|---|---|---|
| Data-driven testing | `test/data-driven/` | Du lieu test nam trong Excel, script lap qua tung dong |
| Keyword-driven testing | `test/keyword-driven/` | Moi dong Excel la mot buoc thao tac co keyword |

### 9.2 Cac stage

| Stage | Lam gi |
|---|---|
| `Checkout Source` | Clone repo |
| `Resolve Paths` | Tinh repo root, frontend URL, API URL |
| `Check Environment` | Kiem tra file bat buoc, `dotnet`, `node`, `npm` |
| `Install Node Dependencies` | Chay `npm install` trong `ci` |
| `Start Or Reuse Local Web` | Goi `run-local-web.bat` de start/reuse web |
| `Run Data Driven Auth Tests` | Chay `auth-data-driven.test.js` |
| `Run Keyword Driven Website Tests` | Chay `website-keyword-driven.test.js` |
| `Sync Test Reports` | Copy `test/reports` ve workspace |
| `post always` | Archive report va file Excel; stop service neu `KEEP_SERVICES=false` |

### 9.3 Vi sao pipeline nay co `SKIP_CERT_TRUST=true`?

Jenkins chay non-interactive, nghia la khong bam duoc popup Windows de trust HTTPS certificate. Vi vay pipeline mac dinh bo qua buoc trust certificate. Selenium/Newman dung tuy chon bo qua loi certificate khi can.

### 9.4 Vi sao `REUSE_RUNNING_WEB=true` va `KEEP_SERVICES=true`?

Khi da start web thu cong bang `run-local-web.bat`, Jenkins co the dung lai service dang chay thay vi stop/start lai. Dieu nay giam loi lien quan port, certificate va thoi gian chay.

## 10. Test trong du an

Du an co 4 nhom test:

| Nhom | Vi tri | Cong cu |
|---|---|---|
| Newman API smoke | `ci/newman/` | Newman/Postman |
| Selenium smoke | `ci/selenium/dahla-web-smoke.js` | Selenium WebDriver |
| Data-driven Excel | `test/data-driven/` | Excel + Selenium |
| Keyword-driven Excel | `test/keyword-driven/` | Excel + Selenium |

## 11. Newman API smoke test

Newman la cong cu chay Postman collection bang dong lenh.

File chinh:

```text
ci/newman/dahla-gateway.postman_collection.json
ci/newman/dahla-local.postman_environment.json
ci/run-newman.ps1
```

No test API thong qua gateway:

```text
https://localhost:7114
```

Report sinh ra:

```text
ci/reports/newman/newman-report.html
ci/reports/newman/newman-junit.xml
ci/reports/newman/newman-summary.json
```

Jenkins dung `newman-junit.xml` de hien thi ket qua test theo format JUnit.

## 12. Selenium smoke test

File:

```text
ci/selenium/dahla-web-smoke.js
```

Script nay mo Chrome headless va test cac luong lon:

| Test | Muc dich |
|---|---|
| Home catalog and search controls | Trang chu co header/menu/banner/nut san pham va search nhan keyword |
| Category product add-to-cart flow | Trang danh muc co san pham va them vao gio hang |
| Cart page renders stored order details | Trang gio hang hien du lieu da luu |
| Header cart navigation works | Link gio hang tren header di dung trang |
| Login page authenticates seeded admin | Dang nhap bang admin seed |
| Profile page accepts an existing session | Ho so mo duoc khi da co session |
| Admin dashboard exposes management tabs | Admin co cac tab quan ly va bang du lieu |

Report:

```text
ci/reports/selenium/selenium-report.html
ci/reports/selenium/selenium-junit.xml
```

## 13. Data-driven testing

Thu muc:

```text
test/data-driven/
```

File quan trong:

| File | Vai tro |
|---|---|
| `auth-test-data-styled.xlsx` | Excel chua du lieu test |
| `auth-data-driven.test.js` | Script doc Excel va chay Selenium |
| `README.md` | Huong dan them test case |

### 13.1 Data-driven la gi?

Data-driven testing nghia la logic test chi viet mot lan, con du lieu test nam trong bang Excel. Moi dong Excel la mot test case.

Vi du: form dang nhap co nhieu truong hop:

| username | password | expected |
|---|---|---|
| `admin` | `123` | `success` |
| rong | `123` | `html5-invalid` |
| `admin` | rong | `html5-invalid` |

Script se doc tung dong va tu dong nhap vao form.

### 13.2 Excel gom sheet nao?

`auth-test-data-styled.xlsx` co 2 sheet:

| Sheet | Muc dich |
|---|---|
| `Login` | Test form dang nhap |
| `Register` | Test form dang ky |

Cot bat buoc sheet `Login`:

```text
id, name, username, password, expected
```

Gia tri `expected` hop le:

```text
success
html5-invalid
```

Cot bat buoc sheet `Register`:

```text
id, name, tenTK, matKhau, email, tenND, sdt, expected
```

Gia tri `expected` hop le:

```text
valid-form
html5-invalid
```

### 13.3 Chay data-driven test

Can start web truoc, sau do chay:

```powershell
node .\test\data-driven\auth-data-driven.test.js
```

Co the truyen URL:

```powershell
$env:FRONTEND_BASE_URL="http://127.0.0.1:5500"
$env:API_BASE_URL="https://localhost:7114"
node .\test\data-driven\auth-data-driven.test.js
```

Report:

```text
test/reports/data-driven-auth-report.html
test/reports/data-driven-auth-report.json
```

## 14. Keyword-driven testing

Thu muc:

```text
test/keyword-driven/
```

File quan trong:

| File | Vai tro |
|---|---|
| `website-keywords-framework.xlsx` | Excel chua cac buoc test |
| `object-repository.json` | Dat ten cho selector/URL |
| `action-keywords.js` | Thu vien keyword, moi keyword la mot ham |
| `keyword-driver.js` | Doc Excel, gom step va goi keyword |
| `website-keyword-driven.test.js` | Entry point de chay test |

### 14.1 Keyword-driven la gi?

Keyword-driven testing nghia la nguoi test mo ta kich ban bang cac tu khoa hanh dong, vi du:

```text
open
type
click
assertUrlContains
```

Nguoi viet test khong can sua code Selenium neu chi them luong thao tac moi. Ho chi can them dong trong Excel.

### 14.2 File Excel keyword hoat dong ra sao?

Sheet `TestSteps` co cac cot:

| Cot | Y nghia |
|---|---|
| `testCaseId` | Ma test case, vi du `KWD_001` |
| `testCaseName` | Ten test case |
| `stepOrder` | Thu tu buoc |
| `keyword` | Hanh dong can lam |
| `objectName` | Ten doi tuong trong `object-repository.json` |
| `testData` | Du lieu nhap/du lieu can verify |
| `description` | Mo ta buoc |
| `runFlag` | `Y` de chay, `N` de bo qua |

Keyword dang ho tro:

| Keyword | Lam gi |
|---|---|
| `open` | Mo mot URL da khai bao |
| `configureApi` | Gan API base URL cho trang test |
| `waitVisible` | Cho phan tu hien thi |
| `type` | Nhap du lieu vao input |
| `click` | Bam nut/link |
| `assertValue` | Kiem tra gia tri input |
| `assertTextContains` | Kiem tra text tren trang |
| `assertUrlContains` | Kiem tra URL co chua chuoi mong doi |
| `assertLocalStorageObjectNotEmpty` | Kiem tra localStorage co du lieu |

### 14.3 Object Repository

`object-repository.json` la noi dat ten cho selector. Thay vi trong Excel viet:

```text
#tenTK
```

co the viet:

```text
loginUsernameInput
```

Neu sau nay HTML doi id/class, chi can sua `object-repository.json`, khong can sua tat ca dong Excel.

### 14.4 Chay keyword-driven test

```powershell
node .\test\keyword-driven\website-keyword-driven.test.js
```

Report:

```text
test/reports/keyword-driven-website-report.html
test/reports/keyword-driven-website-report.json
```

## 15. Report va artifact

Sau khi chay test, du an tao nhieu loai report:

| Noi sinh | File |
|---|---|
| Newman | `ci/reports/newman/newman-report.html` |
| Newman JUnit | `ci/reports/newman/newman-junit.xml` |
| Selenium | `ci/reports/selenium/selenium-report.html` |
| Selenium JUnit | `ci/reports/selenium/selenium-junit.xml` |
| Data-driven | `test/reports/data-driven-auth-report.html` |
| Keyword-driven | `test/reports/keyword-driven-website-report.html` |
| Artifact dong goi | `ci/artifacts/` |

`ci/package-artifacts.ps1` gom cac report nay thanh dashboard/artifact de Jenkins archive.

## 16. Cac lenh hay dung

### Cai dependency Node cho test

```powershell
cd .\ci
npm install
cd ..
```

### Chay web local

```powershell
.\run-local-web.bat
```

### Chay web local nhung khong mo browser

```powershell
.\run-local-web.bat -NoBrowser
```

### Chay smoke test day du

```powershell
.\run-local-smoke.bat
```

### Chay smoke test va giu service sau khi xong

```powershell
.\run-local-smoke.bat -KeepServices
```

### Chay Newman rieng

```powershell
powershell -ExecutionPolicy Bypass -File .\ci\run-newman.ps1 -BaseUrl https://localhost:7114
```

### Chay Selenium smoke rieng

```powershell
powershell -ExecutionPolicy Bypass -File .\ci\run-selenium.ps1 -FrontendBaseUrl http://127.0.0.1:5500 -ApiBaseUrl https://localhost:7114
```

### Chay data-driven Excel test

```powershell
node .\test\data-driven\auth-data-driven.test.js
```

### Chay keyword-driven Excel test

```powershell
node .\test\keyword-driven\website-keyword-driven.test.js
```

### Dung local web

```powershell
.\stop-local-web.bat
```

## 17. Loi thuong gap

### 17.1 Port da bi chiem

Neu thay loi port 5003, 5193, 7114 hoac 5500 dang duoc dung, co the:

1. Chay:

```powershell
.\stop-local-web.bat
```

2. Hoac doi `FRONTEND_PORT` neu chi bi trung frontend.

### 17.2 Jenkins loi certificate

Tren Jenkins nen giu:

```text
SKIP_CERT_TRUST=true
```

Vi Jenkins khong bam duoc popup trust certificate.

### 17.3 Test login fail

Kiem tra:

1. LocalDB da tao database `API_Dahla` chua.
2. Co account seed `admin`/`123` chua.
3. Gateway `https://localhost:7114` co chay chua.
4. Frontend co nhan dung `API_BASE_URL` chua.

### 17.4 Excel test bao thieu cot

Script data-driven/keyword-driven kiem tra ten cot. Neu doi ten cot trong Excel, script se fail. Can giu dung ten cot trong README.

### 17.5 Frontend mo duoc nhung API loi

Co the chi frontend dang chay, con backend/gateway chua chay. Hay chay:

```powershell
.\run-local-web.bat
```

va kiem tra Swagger:

```text
http://localhost:5003/swagger/index.html
http://localhost:5193/swagger/index.html
```

## 18. Tom tat luong tong the

```text
Nguoi dung/Jenkins
        |
        v
Frontend static server http://127.0.0.1:5500
        |
        v
Gateway https://localhost:7114
        |
        |-- /api-admin/... -> API_Dahla http://localhost:5003
        |
        |-- /api-user/SanPham/GioHang/Feedback/... -> Dahla_NguoiDung http://localhost:5193
        |
        v
SQL Server LocalDB database API_Dahla
```

## 19. Nen doc file nao truoc neu moi vao du an?

Thu tu de hieu nhanh:

1. `README.md` de biet cau truc tong quan.
2. `frontend/index.html` de xem trang chu.
3. `frontend/js/config.js` de hieu API URL.
4. `frontend/js/app.js` de hieu luong user.
5. `frontend/js/admin-controllers.js` de hieu admin.
6. `backend/Dahla_GateWays/Dahla_GateWays/ocelot.json` de hieu routing.
7. `backend/API_Dahla/API_Dahla/Controllers/` de hieu API admin.
8. `backend/Dahla_NguoiDung/Dahla_NguoiDung/Controllers/` de hieu API user.
9. `database/API_Dahla.sql` de hieu bang va stored procedure.
10. `ci/run-local-web.ps1` de hieu cach start he thong.
11. `ci/run-local-smoke.ps1` va `Jenkinsfile` de hieu CI.
12. `test/data-driven/README.md` va `test/keyword-driven/README.md` de hieu test Excel.

