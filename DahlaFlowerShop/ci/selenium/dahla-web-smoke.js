const fs = require('fs');
const path = require('path');
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
const apiBaseUrl = process.env.API_BASE_URL || 'https://localhost:7114';
const reportsDir = path.join(__dirname, '..', 'reports', 'selenium');
const junitPath = path.join(reportsDir, 'selenium-junit.xml');
const htmlPath = path.join(reportsDir, 'selenium-report.html');

const tests = [];

function test(name, area, fn) {
  tests.push({ name, area, fn });
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

function slug(value) {
  return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
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

async function clearClientState(driver) {
  await driver.get(pageUrl('/index.html'));
  await configureApp(driver);
  await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
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

async function assert(condition, message) {
  if (!(await condition)) {
    throw new Error(message);
  }
}

async function waitForElement(driver, locator, timeout = 10000) {
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  return element;
}

async function waitForLocatedElement(driver, locator, timeout = 10000) {
  return driver.wait(until.elementLocated(locator), timeout);
}

async function waitUntil(driver, condition, message, timeout = 10000) {
  await driver.wait(async () => Boolean(await condition()), timeout, message);
}

async function countElements(driver, locator) {
  return (await driver.findElements(locator)).length;
}

async function bodyText(driver) {
  return driver.findElement(By.css('body')).getText();
}

async function captureScreenshot(driver, fileName) {
  const screenshotPath = path.join(reportsDir, fileName);
  const base64 = await driver.takeScreenshot();
  fs.writeFileSync(screenshotPath, base64, 'base64');
  return {
    fileName,
    dataUri: `data:image/png;base64,${base64}`
  };
}

function createStepRecorder(steps) {
  return async function step(name, action) {
    const startedAt = Date.now();
    try {
      const details = await action();
      steps.push({
        name,
        status: 'passed',
        details: details || '',
        time: (Date.now() - startedAt) / 1000
      });
    }
    catch (error) {
      steps.push({
        name,
        status: 'failed',
        details: error.message || String(error),
        time: (Date.now() - startedAt) / 1000
      });
      throw error;
    }
  };
}

test('Home catalog and search controls', 'Customer storefront', async (driver, step) => {
  await step('Open home page and inject CI API base URL', async () => {
    await driver.get(pageUrl('/index.html'));
    await configureApp(driver);
    return await driver.getCurrentUrl();
  });

  await step('Verify title, header, menu, carousel, and product action controls', async () => {
    await waitUntil(driver, async () => /Dahla|Trang/i.test(await driver.getTitle()), 'Expected home page title');
    await waitForElement(driver, By.css('.header'));
    await waitForElement(driver, By.css('.menu'));
    await waitForElement(driver, By.css('#carouselExampleControlsNoTouching'));
    await waitForLocatedElement(driver, By.css('.btn-spc1'));
    const productActionCount = await countElements(driver, By.css('.btn-spc1'));
    await assert(productActionCount >= 10, `Expected at least 10 product action buttons, got ${productActionCount}`);
    return `${productActionCount} product action buttons found`;
  });

  await step('Use search input with a product keyword', async () => {
    const input = await waitForElement(driver, By.css('input[ng-model="searchQuery"]'));
    await input.clear();
    await input.sendKeys('hoa', Key.TAB);
    const value = await input.getAttribute('value');
    await assert(value === 'hoa', `Expected search input value to be hoa, got ${value}`);
    return `Search keyword accepted: ${value}`;
  });
});

test('Category product add-to-cart flow', 'Customer shopping', async (driver, step) => {
  await step('Open category page', async () => {
    await driver.get(pageUrl('/pages/products/category.html'));
    await configureApp(driver);
    await waitForElement(driver, By.css('.header'));
    return await driver.getTitle();
  });

  await step('Verify category grid has product cards with prices and ids', async () => {
    const productCount = await countElements(driver, By.css('.vlt'));
    const priceCount = await countElements(driver, By.css('.product-price'));
    const idCount = await countElements(driver, By.css('.id-product'));
    await assert(productCount >= 8, `Expected at least 8 category products, got ${productCount}`);
    await assert(priceCount >= 8, `Expected prices for category products, got ${priceCount}`);
    await assert(idCount >= 8, `Expected product ids for category products, got ${idCount}`);
    return `${productCount} products, ${priceCount} prices, ${idCount} ids`;
  });

  await step('Click first add-to-cart button and verify localStorage cart', async () => {
    const cartButton = await waitForLocatedElement(driver, By.css('.btn-cart'));
    await driver.executeScript('arguments[0].scrollIntoView({ block: "center", inline: "center" });', cartButton);
    await driver.executeScript('arguments[0].click();', cartButton);
    await waitUntil(driver, async () => {
      return driver.executeScript("return Object.keys(JSON.parse(localStorage.getItem('DatHang') || '{}')).length > 0;");
    }, 'Expected category add-to-cart to create DatHang');
    const cartSize = await driver.executeScript("return Object.keys(JSON.parse(localStorage.getItem('DatHang') || '{}')).length;");
    return `Cart item count in localStorage: ${cartSize}`;
  });
});

test('Cart page renders stored order details', 'Checkout preparation', async (driver, step) => {
  await step('Seed cart data in browser storage', async () => {
    await driver.get(pageUrl('/index.html'));
    await configureApp(driver);
    await driver.executeScript(`
      localStorage.setItem('DatHang', JSON.stringify({
        '9901': {
          id: '9901',
          photo: '/assets/images/products/hoahong.jpg',
          name: 'CI Cart Flower',
          price: '199000 VND',
          quantity: 2
        }
      }));
    `);
    return 'Seeded DatHang with product 9901';
  });

  await step('Open cart page and verify table content', async () => {
    await driver.get(pageUrl('/pages/cart.html'));
    await waitForElement(driver, By.css('#cart-table'));
    await waitUntil(driver, async () => (await bodyText(driver)).includes('CI Cart Flower'), 'Expected seeded cart product name');
    const cartRows = await countElements(driver, By.css('#cart-table tbody tr'));
    await assert(cartRows >= 1, `Expected at least one cart row, got ${cartRows}`);
    return `${cartRows} cart row(s) rendered`;
  });

  await step('Verify checkout form area is available', async () => {
    await waitForLocatedElement(driver, By.css('textarea[ng-model="invoice.DiaChiGiao"]'));
    const text = await bodyText(driver);
    await assert(/THÔNG TIN ĐƠN HÀNG|Tạo Hóa Đơn|THONG TIN DON HANG/i.test(text), 'Expected order information section');
    return 'Order information section is present';
  });
});

test('Header cart navigation works', 'Navigation', async (driver, step) => {
  await step('Open home page', async () => {
    await driver.get(pageUrl('/index.html'));
    await configureApp(driver);
    await waitForLocatedElement(driver, By.css('a[href*="pages/cart.html"]'));
    return await driver.getCurrentUrl();
  });

  await step('Navigate to cart through the header cart destination', async () => {
    const cartHref = await driver.executeScript(`
      const link = document.querySelector('#cart a[href*="pages/cart.html"], a[href*="pages/cart.html"]');
      return link ? link.href : '';
    `);
    await assert(Boolean(cartHref), 'Expected a cart navigation href on the home page');
    await driver.get(cartHref);
    await waitUntil(driver, async () => (await driver.getCurrentUrl()).includes('/pages/cart.html'), 'Expected cart page URL');
    await waitForElement(driver, By.css('#content'));
    await waitUntil(driver, async () => {
      const tableCount = await countElements(driver, By.css('#cart-table'));
      const text = await bodyText(driver);
      return tableCount > 0 || /giỏ hàng.*trống|gio hang.*trong/i.test(text);
    }, 'Expected cart page to show either cart table or empty-cart message');
    return `${cartHref} -> ${await driver.getCurrentUrl()}`;
  });
});

test('Login page authenticates seeded admin', 'Authentication', async (driver, step) => {
  await step('Open login page', async () => {
    await driver.get(pageUrl('/pages/auth/login.html'));
    await configureApp(driver);
    await waitForElement(driver, By.css('#tenTK'));
    await waitForElement(driver, By.css('#matKhau'));
    return await driver.getTitle();
  });

  await step('Submit admin credentials', async () => {
    await driver.findElement(By.css('#tenTK')).sendKeys('admin');
    await driver.findElement(By.css('#matKhau')).sendKeys('123');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await waitUntil(driver, async () => {
      return driver.executeScript(`
        const session = JSON.parse(localStorage.getItem('DahlaAuthSession') || 'null');
        return Boolean((session && session.tenTK) || localStorage.getItem('MaND'));
      `);
    }, 'Expected authenticated session');
    const sessionName = await driver.executeScript(`
      const session = JSON.parse(localStorage.getItem('DahlaAuthSession') || 'null');
      return session && session.tenTK;
    `);
    return `Authenticated as ${sessionName || 'stored user'}`;
  });
});

test('Profile page accepts an existing session', 'Account profile', async (driver, step) => {
  await step('Seed authenticated session', async () => {
    await driver.get(pageUrl('/index.html'));
    await configureApp(driver);
    await seedSession(driver);
    return 'Seeded DahlaAuthSession for CI Admin';
  });

  await step('Open profile page without login redirect', async () => {
    await driver.get(pageUrl('/pages/account/profile.html'));
    await waitUntil(driver, async () => !(await driver.getCurrentUrl()).includes('login.html'), 'Expected profile page without login redirect');
    await waitForElement(driver, By.css('#profileForm'));
    await waitForElement(driver, By.css('#profileTenND'));
    return await driver.getCurrentUrl();
  });
});

test('Admin dashboard exposes management tabs', 'Admin management', async (driver, step) => {
  await step('Seed admin session and open dashboard', async () => {
    await driver.get(pageUrl('/index.html'));
    await configureApp(driver);
    await seedSession(driver);
    await driver.get(pageUrl('/pages/admin/dashboard.html'));
    await waitForElement(driver, By.css('#home'));
    return await driver.getTitle();
  });

  await step('Verify all major admin tab anchors exist', async () => {
    const selectors = ['#danhmuc', '#sanpham', '#taikhoan', '#nguoidung', '#hoadon', '#voucher'];
    for (const selector of selectors) {
      await driver.wait(until.elementLocated(By.css(selector)), 10000);
    }
    return selectors.join(', ');
  });
});

async function run() {
  fs.mkdirSync(reportsDir, { recursive: true });
  const results = [];
  const startedAt = Date.now();
  let driver;
  let browserName = 'unknown';
  let browserVersion = 'unknown';

  try {
    driver = await buildDriver();
    const capabilities = await driver.getCapabilities();
    browserName = capabilities.get('browserName') || browserName;
    browserVersion = capabilities.get('browserVersion') || browserVersion;

    for (const item of tests) {
      const steps = [];
      const step = createStepRecorder(steps);
      const testStartedAt = Date.now();
      let screenshotName = '';
      let screenshotDataUri = '';

      try {
        await clearClientState(driver);
        await item.fn(driver, step);
        const screenshot = await captureScreenshot(driver, `${slug(item.name)}-passed.png`);
        screenshotName = screenshot.fileName;
        screenshotDataUri = screenshot.dataUri;
        results.push({
          name: item.name,
          area: item.area,
          status: 'passed',
          time: (Date.now() - testStartedAt) / 1000,
          url: await driver.getCurrentUrl(),
          title: await driver.getTitle(),
          steps,
          screenshotName,
          screenshotDataUri
        });
        console.log(`PASS ${item.name}`);
      }
      catch (error) {
        try {
          const screenshot = await captureScreenshot(driver, `${slug(item.name)}-failed.png`);
          screenshotName = screenshot.fileName;
          screenshotDataUri = screenshot.dataUri;
        }
        catch {
          // Preserve the original failure if screenshot capture fails.
        }

        results.push({
          name: item.name,
          area: item.area,
          status: 'failed',
          time: (Date.now() - testStartedAt) / 1000,
          url: await driver.getCurrentUrl().catch(() => ''),
          title: await driver.getTitle().catch(() => ''),
          steps,
          error,
          screenshotName,
          screenshotDataUri
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
  const passed = results.length - failures;
  const totalTime = (Date.now() - startedAt) / 1000;
  const generatedAt = new Date().toISOString();

  const casesXml = results.map((item) => {
    const stepLog = item.steps.map((step) => `${step.status.toUpperCase()} ${step.name}: ${step.details}`).join('\n');
    const failureXml = item.status === 'failed'
      ? `<failure message="${escapeXml(item.error?.message || 'Selenium test failed')}">${escapeXml(`${item.error?.stack || item.error}\n\n${stepLog}`)}</failure>`
      : '';
    return `<testcase classname="${escapeXml(item.area)}" name="${escapeXml(item.name)}" time="${item.time.toFixed(3)}">${failureXml}<system-out>${escapeXml(stepLog)}</system-out></testcase>`;
  }).join('');

  fs.writeFileSync(
    junitPath,
    `<?xml version="1.0" encoding="UTF-8"?><testsuite name="Dahla Selenium Smoke" tests="${results.length}" failures="${failures}" errors="0" skipped="0" time="${totalTime.toFixed(3)}">${casesXml}</testsuite>`
  );

  const cards = results.map((item) => {
    const stepsHtml = item.steps.map((step) => `
      <li class="${step.status}">
        <span class="step-status">${escapeXml(step.status)}</span>
        <span class="step-name">${escapeXml(step.name)}</span>
        <span class="step-time">${step.time.toFixed(3)}s</span>
        ${step.details ? `<div class="step-details">${escapeXml(step.details)}</div>` : ''}
      </li>`).join('');
    const screenshot = item.screenshotDataUri
      ? `<a href="./${escapeXml(item.screenshotName)}"><img src="${item.screenshotDataUri}" alt="${escapeXml(item.name)} screenshot"></a>`
      : '<span class="muted">No screenshot</span>';
    const error = item.error ? `<pre>${escapeXml(item.error.stack || item.error.message || item.error)}</pre>` : '';

    return `
      <section class="test-card ${item.status}">
        <div class="test-card-header">
          <div>
            <div class="area">${escapeXml(item.area)}</div>
            <h2>${escapeXml(item.name)}</h2>
          </div>
          <div class="status-pill ${item.status}">${escapeXml(item.status)}</div>
        </div>
        <div class="meta-grid">
          <div><strong>Time</strong><span>${item.time.toFixed(3)}s</span></div>
          <div><strong>URL</strong><span>${escapeXml(item.url)}</span></div>
          <div><strong>Title</strong><span>${escapeXml(item.title)}</span></div>
        </div>
        <div class="evidence-grid">
          <div>
            <h3>Assertions</h3>
            <ol>${stepsHtml}</ol>
            ${error}
          </div>
          <div>
            <h3>Screenshot</h3>
            ${screenshot}
          </div>
        </div>
      </section>`;
  }).join('');

  fs.writeFileSync(htmlPath, `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Dahla Selenium Smoke Report</title>
  <style>
    :root { color-scheme: light; --border: #d7dce2; --muted: #5f6b7a; --pass: #137333; --fail: #b3261e; --ink: #1f2933; --panel: #ffffff; --soft: #f6f8fb; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 0; color: var(--ink); background: #eef2f6; }
    header { padding: 28px 32px; background: #ffffff; border-bottom: 1px solid var(--border); }
    h1 { margin: 0 0 12px; font-size: 32px; }
    .summary { display: grid; grid-template-columns: repeat(5, minmax(120px, 1fr)); gap: 12px; margin: 20px 0; }
    .metric { background: var(--soft); border: 1px solid var(--border); padding: 14px; }
    .metric strong { display: block; font-size: 24px; }
    .metric span { color: var(--muted); font-size: 13px; }
    .env { display: grid; grid-template-columns: repeat(2, minmax(240px, 1fr)); gap: 8px 20px; color: var(--muted); font-size: 14px; }
    main { padding: 24px 32px 40px; }
    .test-card { background: var(--panel); border: 1px solid var(--border); margin-bottom: 18px; }
    .test-card.failed { border-left: 5px solid var(--fail); }
    .test-card.passed { border-left: 5px solid var(--pass); }
    .test-card-header { display: flex; justify-content: space-between; gap: 16px; padding: 18px; border-bottom: 1px solid var(--border); }
    .area { color: var(--muted); font-size: 13px; text-transform: uppercase; letter-spacing: .04em; }
    h2 { margin: 4px 0 0; font-size: 20px; }
    h3 { margin: 0 0 10px; font-size: 15px; }
    .status-pill { align-self: start; padding: 6px 10px; font-weight: 700; border: 1px solid currentColor; text-transform: uppercase; font-size: 12px; }
    .status-pill.passed, li.passed .step-status { color: var(--pass); }
    .status-pill.failed, li.failed .step-status { color: var(--fail); }
    .meta-grid { display: grid; grid-template-columns: 120px 1fr 1fr; gap: 1px; background: var(--border); border-bottom: 1px solid var(--border); }
    .meta-grid div { background: #fff; padding: 10px 14px; min-width: 0; }
    .meta-grid strong { display: block; color: var(--muted); font-size: 12px; margin-bottom: 4px; }
    .meta-grid span { overflow-wrap: anywhere; }
    .evidence-grid { display: grid; grid-template-columns: minmax(320px, 1fr) minmax(320px, 520px); gap: 18px; padding: 18px; }
    ol { margin: 0; padding-left: 22px; }
    li { margin-bottom: 10px; }
    .step-status { display: inline-block; width: 58px; font-weight: 700; text-transform: uppercase; font-size: 12px; }
    .step-name { font-weight: 700; }
    .step-time { color: var(--muted); margin-left: 8px; font-size: 12px; }
    .step-details { color: var(--muted); margin-top: 3px; overflow-wrap: anywhere; }
    img { width: 100%; border: 1px solid var(--border); background: #fff; }
    pre { background: #111827; color: #f9fafb; padding: 12px; overflow: auto; white-space: pre-wrap; }
    .muted { color: var(--muted); }
    @media (max-width: 900px) { .summary, .env, .evidence-grid, .meta-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <h1>Dahla Selenium Smoke Report</h1>
    <div class="summary">
      <div class="metric"><strong>${results.length}</strong><span>Total tests</span></div>
      <div class="metric"><strong>${passed}</strong><span>Passed</span></div>
      <div class="metric"><strong>${failures}</strong><span>Failed</span></div>
      <div class="metric"><strong>${totalTime.toFixed(3)}s</strong><span>Total runtime</span></div>
      <div class="metric"><strong>${results.reduce((sum, item) => sum + item.steps.length, 0)}</strong><span>Assertions recorded</span></div>
    </div>
    <div class="env">
      <div><strong>Frontend:</strong> ${escapeXml(frontendBaseUrl)}</div>
      <div><strong>API:</strong> ${escapeXml(apiBaseUrl)}</div>
      <div><strong>Browser:</strong> ${escapeXml(browserName)} ${escapeXml(browserVersion)}</div>
      <div><strong>Generated:</strong> ${escapeXml(generatedAt)}</div>
      <div><strong>Node:</strong> ${escapeXml(process.version)}</div>
      <div><strong>Platform:</strong> ${escapeXml(`${process.platform} ${process.arch}`)}</div>
    </div>
  </header>
  <main>${cards}</main>
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
