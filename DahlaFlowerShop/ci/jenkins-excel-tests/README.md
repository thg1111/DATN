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
3. Start local web bang `ci/run-local-web.ps1`.
4. Chay `test/data-driven/auth-data-driven.test.js`.
5. Chay `test/keyword-driven/website-keyword-driven.test.js`.
6. Archive Excel test data va JSON reports trong `test/reports`.
7. Stop local web services o `post`, tru khi `KEEP_SERVICES=true`.
