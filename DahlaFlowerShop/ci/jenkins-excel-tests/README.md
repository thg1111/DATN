# Jenkins Excel Selenium Tests

Thu muc nay chua Jenkinsfile rieng de chay bo test trong `test/AutomationFramework`:

- Data-driven auth tests: `test/AutomationFramework/tests/test_login.py`
- Keyword-driven website tests: `test/AutomationFramework/tests/test_keyword_driven.py`
- Excel data: `test/AutomationFramework/testdata/*.xlsx`

Trong Jenkins, tao Pipeline moi va tro `Script Path` toi:

```text
DahlaFlowerShop/ci/jenkins-excel-tests/Jenkinsfile
```

Pipeline se:

1. Clone source.
2. Cai Python dependency trong `test/AutomationFramework/requirements.txt`.
3. Start hoac reuse local web bang root wrapper `run-local-web.bat`.
4. Chay Pytest data-driven auth va sinh `data-driven-auth-report.html`.
5. Chay Pytest keyword-driven va sinh `keyword-driven-website-report.html`.
6. Archive Excel test data va HTML reports.
7. Giu local web services o `post` theo mac dinh `KEEP_SERVICES=true`.

## Luu y khi chay tren Jenkins

Jenkins chay non-interactive nen khong bam duoc popup `dotnet dev-certs https --trust`. Pipeline nay mac dinh:

- `SKIP_CERT_TRUST=true`
- `REUSE_RUNNING_WEB=true`
- `KEEP_SERVICES=true`

Neu ban da start web san bang `run-local-web.bat`, Jenkins se dung lai service dang chay tren port tuong ung thay vi stop/start lai tu dau.
Trong Jenkinsfile, `-SkipCertTrust -ReuseRunning` duoc truyen vao `run-local-web.bat` de dung dung cach start web cua du an va tranh loi popup trust certificate tren Jenkins.

Pipeline nay khong publish JSON report. Artifact chinh la HTML:

```text
test/reports/data-driven-auth-report.html
test/reports/keyword-driven-website-report.html
```
