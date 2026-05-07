const fs = require('fs');
const path = require('path');
const { runKeywordDrivenTests } = require('./keyword-driver');

const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
const apiBaseUrl = process.env.API_BASE_URL || 'https://localhost:7114';
const reportsDir = path.join(__dirname, '..', 'reports');
const reportPath = path.join(reportsDir, 'keyword-driven-website-report.json');
const htmlReportPath = path.join(reportsDir, 'keyword-driven-website-report.html');
const testDataPath = path.join(__dirname, 'website-keywords-framework.xlsx');

async function run() {
  fs.mkdirSync(reportsDir, { recursive: true });
  await runKeywordDrivenTests({
    frontendBaseUrl,
    apiBaseUrl,
    reportsDir,
    reportPath,
    htmlReportPath,
    testDataPath
  });
}

run().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
