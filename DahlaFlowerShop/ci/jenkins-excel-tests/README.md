# Jenkins Excel Selenium Tests

Thu muc nay chua Jenkinsfile rieng de chay bo test moi trong `test/`:

- Data-driven auth tests doc Excel `test/data-driven/auth-test-data-styled.xlsx`
- Keyword-driven website tests doc Excel `test/keyword-driven/website-keywords-framework.xlsx`

Trong Jenkins, tao Pipeline moi va tro `Script Path` toi:

```text
DahlaFlowerShop/ci/jenkins-excel-tests/Jenkinsfile
```

Pipeline se:

1. Clone source.
2. Cai dependency Node trong `ci`.
3. Start hoac reuse local web bang root wrapper `run-local-web.bat`.
4. Chay `test/data-driven/auth-data-driven.test.js`.
5. Chay `test/keyword-driven/website-keyword-driven.test.js`.
6. Archive Excel test data, HTML reports va JSON reports trong `test/reports`.
7. Giu local web services o `post` theo mac dinh `KEEP_SERVICES=true`.

## Luu y khi chay tren Jenkins

Jenkins chay non-interactive nen khong bam duoc popup `dotnet dev-certs https --trust`. Pipeline nay mac dinh:

- `SKIP_CERT_TRUST=true`
- `REUSE_RUNNING_WEB=true`
- `KEEP_SERVICES=true`

Neu ban da start web san bang `run-local-web.bat`, Jenkins se dung lai service dang chay tren port tuong ung thay vi stop/start lai tu dau.
Trong Jenkinsfile, `-SkipCertTrust -ReuseRunning` duoc truyen vao `run-local-web.bat` de dung dung cach start web cua du an va tranh loi popup trust certificate tren Jenkins.
