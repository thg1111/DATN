const fs = require('fs');
const path = require('path');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
const apiBaseUrl = process.env.API_BASE_URL || 'https://localhost:7114';
const reportsDir = path.join(__dirname, '..', 'reports', 'selenium');
const junitPath = path.join(reportsDir, 'selenium-junit.xml');
const htmlPath = path.join(reportsDir, 'selenium-report.html');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function pageUrl(relativePath) {
  return new URL(relativePath, frontendBaseUrl.endsWith('/') ? frontendBaseUrl : `${frontendBaseUrl}/`).toString();
}

async function buildDriver() {
  const options = new chrome.Options()
    .addArguments('--headless=new')
    .addArguments('--disable-gpu')
    .addArguments('--no-sandbox')
    .addArguments('--disable-dev-shm-usage')
    .addArguments('--ignore-certificate-errors')
    .windowSize({ width: 1366, height: 768 });

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

async function configureApp(driver) {
  await driver.executeScript(`
    window.APP_API_BASE_URL = arguments[0];
    window.alert = function () {};
    window.confirm = function () { return true; };
  `, apiBaseUrl);
}

async function seedSession(driver, overrides = {}) {
  const session = {
    maTK: 1,
    maND: 1,
    tenTK: 'admin',
    quyen: 'Admin',
    email: 'admin@dahla.local',
    tenND: 'CI Admin',
    ...overrides
  };

  await driver.executeScript(`
    localStorage.setItem('DahlaAuthSession', JSON.stringify(arguments[0]));
    localStorage.setItem('MaND', String(arguments[0].maND));
  `, session);
}

async function waitForElement(driver, locator, timeout = 10000) {
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

async function waitUntil(driver, condition, message, timeout = 10000) {
  await driver.wait(async () => Boolean(await condition()), timeout, message);
}

test('home page loads catalog and search UI', async (driver) => {
  await driver.get(pageUrl('/index.html'));
  await configureApp(driver);
  await waitUntil(driver, async () => /Dahla|Trang/i.test(await driver.getTitle()), 'Expected home page title');
  await waitForElement(driver, By.css('.header'));
  await waitForElement(driver, By.css('input[ng-model="searchQuery"]'));
  await waitForElement(driver, By.css('.btn-spc1'));
});

test('login page authenticates seeded admin', async (driver) => {
  await driver.get(pageUrl('/pages/auth/login.html'));
  await configureApp(driver);
  await driver.findElement(By.css('#tenTK')).sendKeys('admin');
  await driver.findElement(By.css('#matKhau')).sendKeys('123');
  await driver.findElement(By.css('button[type="submit"]')).click();
  await waitUntil(driver, async () => {
    return driver.executeScript(`
      const session = JSON.parse(localStorage.getItem('DahlaAuthSession') || 'null');
      return Boolean((session && session.tenTK) || localStorage.getItem('MaND'));
    `);
  }, 'Expected authenticated session');
});

test('cart page renders localStorage cart item', async (driver) => {
  await driver.get(pageUrl('/index.html'));
  await configureApp(driver);
  await driver.executeScript(`
    localStorage.setItem('DatHang', JSON.stringify({
      '9901': {
        id: '9901',
        photo: '/assets/images/products/hoahong.jpg',
        name: 'CI Cart Flower',
        price: 199000,
        quantity: 2
      }
    }));
  `);

  await driver.get(pageUrl('/pages/cart.html'));
  await waitUntil(driver, async () => {
    return driver.executeScript("return Object.keys(JSON.parse(localStorage.getItem('DatHang') || '{}')).length > 0;");
  }, 'Expected cart item in localStorage');
  await waitUntil(driver, async () => {
    const body = await driver.findElement(By.css('body')).getText();
    return /THÔNG TIN ĐƠN HÀNG|Tạo Hóa Đơn|THONG TIN DON HANG/i.test(body);
  }, 'Expected cart page text');
});

test('profile page accepts an existing session', async (driver) => {
  await driver.get(pageUrl('/index.html'));
  await configureApp(driver);
  await seedSession(driver);
  await driver.get(pageUrl('/pages/account/profile.html'));
  await waitUntil(driver, async () => !(await driver.getCurrentUrl()).includes('login.html'), 'Expected profile page without login redirect');
  await waitForElement(driver, By.css('form, #profileForm'));
});

test('admin dashboard loads major management tabs', async (driver) => {
  await driver.get(pageUrl('/index.html'));
  await configureApp(driver);
  await seedSession(driver);
  await driver.get(pageUrl('/pages/admin/dashboard.html'));
  await waitForElement(driver, By.css('#home'));
  for (const selector of ['#danhmuc', '#sanpham', '#taikhoan', '#nguoidung', '#hoadon', '#voucher']) {
    await driver.wait(until.elementLocated(By.css(selector)), 10000);
  }
});

async function run() {
  fs.mkdirSync(reportsDir, { recursive: true });
  const results = [];
  const startedAt = Date.now();
  let driver;

  try {
    driver = await buildDriver();
    for (const item of tests) {
      const testStartedAt = Date.now();
      try {
        await item.fn(driver);
        results.push({ name: item.name, status: 'passed', time: (Date.now() - testStartedAt) / 1000 });
        console.log(`PASS ${item.name}`);
      }
      catch (error) {
        const screenshotName = `${item.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
        const screenshotPath = path.join(reportsDir, screenshotName);
        try {
          fs.writeFileSync(screenshotPath, await driver.takeScreenshot(), 'base64');
        }
        catch {
          // Keep the original test failure as the primary error.
        }
        results.push({
          name: item.name,
          status: 'failed',
          time: (Date.now() - testStartedAt) / 1000,
          error,
          screenshotName
        });
        console.error(`FAIL ${item.name}`);
        console.error(error.stack || error.message || error);
      }
    }
  }
  finally {
    if (driver) {
      await driver.quit();
    }
  }

  const failures = results.filter((item) => item.status === 'failed').length;
  const totalTime = (Date.now() - startedAt) / 1000;
  const casesXml = results.map((item) => {
    const failureXml = item.status === 'failed'
      ? `<failure message="${escapeXml(item.error?.message || 'Selenium test failed')}">${escapeXml(item.error?.stack || item.error)}</failure>`
      : '';
    return `<testcase classname="Dahla Selenium Smoke" name="${escapeXml(item.name)}" time="${item.time.toFixed(3)}">${failureXml}</testcase>`;
  }).join('');

  fs.writeFileSync(
    junitPath,
    `<?xml version="1.0" encoding="UTF-8"?><testsuite name="Dahla Selenium Smoke" tests="${results.length}" failures="${failures}" errors="0" skipped="0" time="${totalTime.toFixed(3)}">${casesXml}</testsuite>`
  );

  const rows = results.map((item) => {
    const evidence = item.screenshotName ? `<a href="./${escapeXml(item.screenshotName)}">screenshot</a>` : '';
    return `<tr><td>${escapeXml(item.name)}</td><td class="${item.status}">${item.status}</td><td>${item.time.toFixed(3)}s</td><td>${evidence}</td></tr>`;
  }).join('');

  fs.writeFileSync(htmlPath, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Dahla Selenium Smoke Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #202124; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #dadce0; padding: 8px; text-align: left; }
    th { background: #f8f9fa; }
    .passed { color: #137333; font-weight: 700; }
    .failed { color: #b3261e; font-weight: 700; }
  </style>
</head>
<body>
  <h1>Dahla Selenium Smoke Report</h1>
  <p>Frontend: ${escapeXml(frontendBaseUrl)}<br>API: ${escapeXml(apiBaseUrl)}</p>
  <table>
    <thead><tr><th>Test</th><th>Status</th><th>Time</th><th>Evidence</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`);

  if (failures > 0) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
