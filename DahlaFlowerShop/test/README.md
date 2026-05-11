# Dahla Flower Shop - Test Suite

Thu muc nay chua cac kich ban kiem thu bo sung cho website Dahla Flower Shop.

## Cau truc

- `data-driven/`: kiem thu huong du lieu cho chuc nang dang nhap va dang ky, doc tu Excel.
- `keyword-driven/`: kiem thu huong tu khoa cho cac luong thao tac tren website, doc tu Excel.
- `reports/`: noi sinh bao cao HTML va JSON sau khi chay test.

## Dieu kien chay

Chay local web truoc:

```powershell
.\run-local-web.bat -NoBrowser
```

Neu chua cai Python dependency, chay:

```powershell
py -m pip install -r .\test\requirements.txt
```

Script Python dung `openpyxl` de doc Excel va `selenium` de dieu khien Chrome.

## Lenh chay

Data-driven:

```powershell
py .\test\data-driven\auth_data_driven_test.py
```

Keyword-driven:

```powershell
py .\test\keyword-driven\website_keyword_driven_test.py
```

Co the doi URL bang bien moi truong:

```powershell
$env:FRONTEND_BASE_URL="http://127.0.0.1:5500"
$env:API_BASE_URL="https://localhost:7114"
```
