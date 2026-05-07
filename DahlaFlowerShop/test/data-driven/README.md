# Kiem Thu Huong Du Lieu - Dang Nhap, Dang Ky

Bo test nay doc du lieu tu file Excel:

- `auth-test-data-styled.xlsx`

Workbook co 2 sheet:

- `Login`: du lieu kiem thu dang nhap.
- `Register`: du lieu kiem thu dang ky.

Moi dong trong Excel la mot test case. Script se lap qua tung dong, nhap du lieu vao form, va so sanh ket qua mong doi.

## Cach them test case moi

Mo `auth-test-data-styled.xlsx`, them mot dong moi vao dung sheet:

Sheet `Login` can cac cot:

- `id`: ma test case, vi du `LGN_004`.
- `name`: ten mo ta test case.
- `username`: ten tai khoan.
- `password`: mat khau.
- `expected`: ket qua mong doi, chi nhan `success` hoac `html5-invalid`.

Sheet `Register` can cac cot:

- `id`: ma test case, vi du `REG_004`.
- `name`: ten mo ta test case.
- `tenTK`: ten dang nhap.
- `matKhau`: mat khau.
- `email`: email.
- `tenND`: ho ten nguoi dung.
- `sdt`: so dien thoai.
- `sinhNhat`: ngay sinh, co the de trong.
- `diaChi`: dia chi, co the de trong.
- `gioiTinh`: `Nam` hoac `Nu`, co the de trong.
- `expected`: ket qua mong doi, chi nhan `valid-form` hoac `html5-invalid`.

Co the them bao nhieu dong tuy y. Script tu dong doc tat ca dong co du lieu va bo qua dong trong.

Chay:

```powershell
node .\test\data-driven\auth-data-driven.test.js
```

Bao cao JSON duoc ghi vao:

```text
test/reports/data-driven-auth-report.json
```
