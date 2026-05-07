# Kiem Thu Huong Tu Khoa - Website

Bo test nay doc cac buoc thao tac tu file Excel `website-keywords-styled.xlsx`, sheet `WebsiteKeywords`.

Moi dong trong Excel la mot step, gom:

- `id`: ma test case.
- `name`: ten test case.
- `stepOrder`: thu tu chay step.
- `keyword`: ten hanh dong.
- `target`: selector CSS hoac duong dan trang.
- `value`: du lieu nhap/du lieu can so sanh, neu keyword can.

Keyword dang ho tro:

- `open`
- `configureApi`
- `waitVisible`
- `type`
- `click`
- `assertValue`
- `assertTextContains`
- `assertUrlContains`
- `assertLocalStorageObjectNotEmpty`

Chay:

```powershell
node .\test\keyword-driven\website-keyword-driven.test.js
```

Bao cao JSON duoc ghi vao:

```text
test/reports/keyword-driven-website-report.json
```
