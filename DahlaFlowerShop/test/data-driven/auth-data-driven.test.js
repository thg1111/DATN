const fs = require('fs');
const path = require('path');

function requireDependency(name) {
  try {
    return require(name);
  }
  catch {
    return require(path.join(__dirname, '..', '..', 'ci', 'node_modules', name));
  }
}

const { Builder, By, until } = requireDependency('selenium-webdriver');
const chrome = requireDependency('selenium-webdriver/chrome');
const XLSX = requireDependency('xlsx');

const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
const apiBaseUrl = process.env.API_BASE_URL || 'https://localhost:7114';
const reportsDir = path.join(__dirname, '..', 'reports');
const reportPath = path.join(reportsDir, 'data-driven-auth-report.json');
const testDataPath = path.join(__dirname, 'auth-test-data-styled.xlsx');
const loginRequiredColumns = ['id', 'name', 'username', 'password', 'expected'];
const registerRequiredColumns = ['id', 'name', 'tenTK', 'matKhau', 'email', 'tenND', 'sdt', 'expected'];
const validLoginExpected = new Set(['success', 'html5-invalid']);
const validRegisterExpected = new Set(['valid-form', 'html5-invalid']);

function cleanCell(value) {
  return String(value ?? '').trim();
}

function hasData(row) {
  return Object.values(row).some((value) => cleanCell(value) !== '');
}

function requireColumns(rows, sheetName, requiredColumns) {
  const availableColumns = new Set(rows.flatMap((row) => Object.keys(row)));
  const missingColumns = requiredColumns.filter((column) => !availableColumns.has(column));
  if (missingColumns.length > 0) {
    throw new Error(`Sheet "${sheetName}" is missing column(s): ${missingColumns.join(', ')}`);
  }
}

function validateExpected(row, sheetName, validExpected) {
  if (!validExpected.has(row.expected)) {
    throw new Error(`Sheet "${sheetName}" row "${row.id || row.name}" has invalid expected value "${row.expected}".`);
  }
}

function readSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Missing sheet "${sheetName}" in ${testDataPath}`);
  }

  return XLSX.utils.sheet_to_json(sheet, { defval: '' }).filter(hasData);
}

function readTestData() {
  const workbook = XLSX.readFile(testDataPath);
  const loginRows = readSheet(workbook, 'Login');
  const registerRows = readSheet(workbook, 'Register');

  requireColumns(loginRows, 'Login', loginRequiredColumns);
  requireColumns(registerRows, 'Register', registerRequiredColumns);

  const loginCases = loginRows.map((row) => ({
    id: cleanCell(row.id),
    name: cleanCell(row.name),
    username: cleanCell(row.username),
    password: cleanCell(row.password),
    expected: cleanCell(row.expected)
  }));

  const registerCases = registerRows.map((row) => ({
    id: cleanCell(row.id),
    name: cleanCell(row.name),
    data: {
      tenTK: cleanCell(row.tenTK),
      matKhau: cleanCell(row.matKhau),
      email: cleanCell(row.email),
      tenND: cleanCell(row.tenND),
      sdt: cleanCell(row.sdt),
      sinhNhat: cleanCell(row.sinhNhat),
      diaChi: cleanCell(row.diaChi),
      gioiTinh: cleanCell(row.gioiTinh)
    },
    expected: cleanCell(row.expected)
  }));

  for (const testCase of loginCases) {
    validateExpected(testCase, 'Login', validLoginExpected);
  }

  for (const testCase of registerCases) {
    validateExpected(testCase, 'Register', validRegisterExpected);
  }

  return { loginCases, registerCases };
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

  return new Builder().forBrowser('chrome').setChromeOptions(options).build();
}

async function configureApp(driver) {
  await driver.executeScript(`
    window.APP_API_BASE_URL = arguments[0];
    window.alert = function () {};
    window.confirm = function () { return true; };
  `, apiBaseUrl);
}

async function clearState(driver) {
  await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
}

async function waitVisible(driver, selector) {
  const element = await driver.wait(until.elementLocated(By.css(selector)), 10000);
  await driver.wait(until.elementIsVisible(element), 10000);
  return element;
}

async function setValue(driver, selector, value) {
  const element = await waitVisible(driver, selector);
  await element.clear();
  if (value) {
    await element.sendKeys(value);
  }
}

async function isFormValid(driver, formSelector) {
  return driver.executeScript('return document.querySelector(arguments[0]).checkValidity();', formSelector);
}

async function runLoginCase(driver, testCase) {
  await driver.get(pageUrl('/pages/auth/login.html'));
  await configureApp(driver);
  await clearState(driver);

  await setValue(driver, '#tenTK', testCase.username);
  await setValue(driver, '#matKhau', testCase.password);

  const formIsValid = await isFormValid(driver, 'form[ng-submit="Login()"]');
  if (testCase.expected === 'html5-invalid') {
    if (formIsValid) {
      throw new Error('Expected login form to be blocked by HTML5 validation.');
    }
    return { actual: 'html5-invalid' };
  }

  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.wait(async () => {
    return driver.executeScript(`
      const session = JSON.parse(localStorage.getItem('DahlaAuthSession') || 'null');
      return Boolean((session && session.tenTK) || localStorage.getItem('MaND'));
    `);
  }, 15000, 'Expected login to create an authenticated session.');

  const sessionName = await driver.executeScript(`
    const session = JSON.parse(localStorage.getItem('DahlaAuthSession') || 'null');
    return session && session.tenTK;
  `);

  return { actual: 'success', sessionName };
}

async function runRegisterCase(driver, testCase) {
  await driver.get(pageUrl('/pages/auth/register.html'));
  await configureApp(driver);
  await clearState(driver);

  const data = testCase.data;
  await setValue(driver, '#tenTK', data.tenTK || '');
  await setValue(driver, '#matKhau', data.matKhau || '');
  await setValue(driver, '#email', data.email || '');
  await setValue(driver, '#tenND', data.tenND || '');
  await setValue(driver, '#sdt', data.sdt || '');
  await setValue(driver, '#sinhNhat', data.sinhNhat || '');
  await setValue(driver, '#diaChi', data.diaChi || '');

  if (data.gioiTinh) {
    const genderSelector = data.gioiTinh === 'Nam' ? '#Nam' : '#Nu';
    await driver.findElement(By.css(genderSelector)).click();
  }

  const formIsValid = await isFormValid(driver, '#registerForm');
  if (testCase.expected === 'valid-form') {
    if (!formIsValid) {
      throw new Error('Expected register form to be valid for this data row.');
    }
    return { actual: 'valid-form' };
  }

  if (formIsValid) {
    throw new Error('Expected register form to be blocked by HTML5 validation.');
  }

  return { actual: 'html5-invalid' };
}

async function executeCase(driver, group, testCase, fn) {
  const startedAt = Date.now();
  try {
    const detail = await fn(driver, testCase);
    return {
      id: testCase.id,
      group,
      name: testCase.name,
      status: 'passed',
      expected: testCase.expected,
      detail,
      timeMs: Date.now() - startedAt
    };
  }
  catch (error) {
    return {
      id: testCase.id,
      group,
      name: testCase.name,
      status: 'failed',
      expected: testCase.expected,
      error: error.message,
      timeMs: Date.now() - startedAt
    };
  }
}

async function run() {
  fs.mkdirSync(reportsDir, { recursive: true });
  const { loginCases, registerCases } = readTestData();
  const driver = await buildDriver();
  const results = [];

  try {
    for (const testCase of loginCases) {
      const result = await executeCase(driver, 'login', testCase, runLoginCase);
      results.push(result);
      console.log(`${result.status.toUpperCase()} ${result.id} ${result.name}`);
    }

    for (const testCase of registerCases) {
      const result = await executeCase(driver, 'register', testCase, runRegisterCase);
      results.push(result);
      console.log(`${result.status.toUpperCase()} ${result.id} ${result.name}`);
    }
  }
  finally {
    await driver.quit();
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    frontendBaseUrl,
    apiBaseUrl,
    total: results.length,
    passed: results.filter((item) => item.status === 'passed').length,
    failed: results.filter((item) => item.status === 'failed').length,
    results
  };

  fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));

  if (summary.failed > 0) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exit(1);
});
