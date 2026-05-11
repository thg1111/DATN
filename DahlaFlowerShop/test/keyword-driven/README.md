# Keyword-Driven Testing Framework - Website

Keyword-driven testing con duoc goi la table-driven testing hoac action-word based testing. Framework nay doc cac buoc tu Excel, mapping `keyword` voi ham da dinh nghia trong Function Library, sau do Driver Script thuc thi tren Selenium.

## Thanh phan

- `website-keywords-framework.xlsx`: Excel Test Steps, noi tester khai bao scenario bang bang.
- `object-repository.json`: Object Repository, luu ten doi tuong va locator/URL.
- `action_keywords.py`: Function Library, chua cac ham ung voi tung keyword.
- `keyword_driver.py`: Driver Script, doc Excel, gom step thanh test case, goi Action Keyword tuong ung.
- `website_keyword_driven_test.py`: entrypoint de Jenkins/local chay framework.
- Selenium WebDriver: mo browser va thao tac website.

## Cach Excel hoat dong

File Excel `website-keywords-framework.xlsx` dung sheet `TestSteps`. Moi dong la mot buoc trong scenario:

- `testCaseId`: ma test case, vi du `KWD_001`.
- `testCaseName`: ten test case.
- `stepOrder`: thu tu chay step.
- `keyword`: action word can thuc thi.
- `objectName`: ten doi tuong trong `object-repository.json`.
- `testData`: du lieu nhap vao hoac gia tri can verify.
- `description`: mo ta buoc test cho nguoi doc.
- `runFlag`: `Y` de chay, `N` de bo qua dong do.

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

Vi du scenario dang nhap co the viet theo dang:

```text
open            loginPage
type            loginUsernameInput        admin
type            loginPasswordInput        123
click           loginSubmitButton
assertUrlContains                         index.html
```

Tester co the them scenario moi bang cach them dong vao Excel va dung cac keyword/objectName da co. Neu website doi selector, chi can sua `object-repository.json`, khong can sua Excel test steps.

Chay:

```powershell
py .\test\keyword-driven\website_keyword_driven_test.py
```

Bao cao duoc ghi vao:

```text
test/reports/keyword-driven-website-report.html
test/reports/keyword-driven-website-report.json
```
