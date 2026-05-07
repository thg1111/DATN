# Dahla Flower Shop - Test Suite

Thu muc nay chua cac kich ban kiem thu bo sung cho website Dahla Flower Shop.

## Cau truc

- `data-driven/`: kiem thu huong du lieu cho chuc nang dang nhap va dang ky, doc tu Excel.
- `keyword-driven/`: kiem thu huong tu khoa cho cac luong thao tac tren website, doc tu Excel.
- `reports/`: noi sinh bao cao JSON sau khi chay test.

## Dieu kien chay

Chay local web truoc:

```powershell
.\run-local-web.bat -NoBrowser
```

Neu chua cai Node dependency trong `ci`, chay:

```powershell
cd .\ci
npm install
cd ..
```

Script can package `xlsx` trong `ci/package.json` de doc file Excel.

## Lenh chay

Data-driven:

```powershell
node .\test\data-driven\auth-data-driven.test.js
```

Keyword-driven:

```powershell
node .\test\keyword-driven\website-keyword-driven.test.js
```

Co the doi URL bang bien moi truong:

```powershell
$env:FRONTEND_BASE_URL="http://127.0.0.1:5500"
$env:API_BASE_URL="https://localhost:7114"
```
