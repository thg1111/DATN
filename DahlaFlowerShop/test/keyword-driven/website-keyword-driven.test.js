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
const reportPath = path.join(reportsDir, 'keyword-driven-website-report.json');
const testDataPath = path.join(__dirname, 'website-keywords-styled.xlsx');

function readTestCases() {
  const workbook = XLSX.readFile(testDataPath);
  const sheet = workbook.Sheets.WebsiteKeywords;
  if (!sheet) {
    throw new Error(`Missing sheet "WebsiteKeywords" in ${testDataPath}`);
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const caseMap = new Map();

  for (const row of rows) {
    if (!caseMap.has(row.id)) {
      caseMap.set(row.id, {
        id: row.id,
        name: row.name,
        steps: []
      });
    }

    caseMap.get(row.id).steps.push({
      stepOrder: Number(row.stepOrder) || 0,
      keyword: row.keyword,
      target: row.target,
      value: row.value
    });
  }

  return Array.from(caseMap.values()).map((testCase) => ({
    ...testCase,
    steps: testCase.steps.sort((a, b) => a.stepOrder - b.stepOrder)
  }));
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

async function visibleElement(driver, selector) {
  const element = await driver.wait(until.elementLocated(By.css(selector)), 10000);
  await driver.wait(until.elementIsVisible(element), 10000);
  return element;
}

async function executeKeyword(driver, step) {
  switch (step.keyword) {
    case 'open':
      await driver.get(pageUrl(step.target));
      return await driver.getCurrentUrl();

    case 'configureApi':
      await driver.executeScript(`
        window.APP_API_BASE_URL = arguments[0];
        window.alert = function () {};
        window.confirm = function () { return true; };
      `, apiBaseUrl);
      return apiBaseUrl;

    case 'waitVisible':
      await visibleElement(driver, step.target);
      return step.target;

    case 'type': {
      const element = await visibleElement(driver, step.target);
      await element.clear();
      await element.sendKeys(step.value || '');
      return `${step.target}=${step.value || ''}`;
    }

    case 'click': {
      const element = await visibleElement(driver, step.target);
      await driver.executeScript('arguments[0].scrollIntoView({ block: "center", inline: "center" });', element);
      await driver.executeScript('arguments[0].click();', element);
      return step.target;
    }

    case 'assertValue': {
      const actual = await driver.findElement(By.css(step.target)).getAttribute('value');
      if (actual !== step.value) {
        throw new Error(`Expected value "${step.value}", got "${actual}".`);
      }
      return actual;
    }

    case 'assertTextContains': {
      const text = await driver.findElement(By.css(step.target || 'body')).getText();
      if (!text.includes(step.value)) {
        throw new Error(`Expected text to contain "${step.value}".`);
      }
      return step.value;
    }

    case 'assertUrlContains': {
      const url = await driver.getCurrentUrl();
      if (!url.includes(step.value)) {
        throw new Error(`Expected URL to contain "${step.value}", got "${url}".`);
      }
      return url;
    }

    case 'assertLocalStorageObjectNotEmpty': {
      await driver.wait(async () => {
        return driver.executeScript(`
          const raw = localStorage.getItem(arguments[0]);
          if (!raw) return false;
          try {
            return Object.keys(JSON.parse(raw)).length > 0;
          }
          catch {
            return false;
          }
        `, step.target);
      }, 10000, `Expected localStorage object ${step.target} to contain data.`);
      return step.target;
    }

    default:
      throw new Error(`Unsupported keyword: ${step.keyword}`);
  }
}

async function runCase(driver, testCase) {
  const startedAt = Date.now();
  const stepResults = [];

  try {
    await driver.get(pageUrl('/index.html'));
    await driver.executeScript('localStorage.clear(); sessionStorage.clear();');

    for (const step of testCase.steps) {
      const stepStartedAt = Date.now();
      const detail = await executeKeyword(driver, step);
      stepResults.push({
        keyword: step.keyword,
        target: step.target || '',
        value: step.value || '',
        status: 'passed',
        detail,
        timeMs: Date.now() - stepStartedAt
      });
    }

    return {
      id: testCase.id,
      name: testCase.name,
      status: 'passed',
      steps: stepResults,
      timeMs: Date.now() - startedAt
    };
  }
  catch (error) {
    stepResults.push({
      status: 'failed',
      error: error.message
    });

    return {
      id: testCase.id,
      name: testCase.name,
      status: 'failed',
      steps: stepResults,
      error: error.message,
      timeMs: Date.now() - startedAt
    };
  }
}

async function run() {
  fs.mkdirSync(reportsDir, { recursive: true });
  const testCases = readTestCases();
  const driver = await buildDriver();
  const results = [];

  try {
    for (const testCase of testCases) {
      const result = await runCase(driver, testCase);
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
