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

const { Builder } = requireDependency('selenium-webdriver');
const chrome = requireDependency('selenium-webdriver/chrome');
const XLSX = requireDependency('xlsx');
const { ActionKeywords } = require('./action-keywords');
const objectRepository = require('./object-repository.json');

const supportedKeywords = new Set([
  'open',
  'configureApi',
  'waitVisible',
  'type',
  'click',
  'assertValue',
  'assertTextContains',
  'assertUrlContains',
  'assertLocalStorageObjectNotEmpty'
]);

function clean(value) {
  return String(value ?? '').trim();
}

function hasData(row) {
  return Object.values(row).some((value) => clean(value) !== '');
}

function readSteps(testDataPath) {
  const workbook = XLSX.readFile(testDataPath);
  const sheet = workbook.Sheets.TestSteps || workbook.Sheets.WebsiteKeywords;
  if (!sheet) {
    throw new Error(`Missing sheet "TestSteps" in ${testDataPath}`);
  }

  return XLSX.utils.sheet_to_json(sheet, { defval: '' }).filter(hasData).map((row) => {
    const objectName = clean(row.objectName || row.target);
    const testData = clean(row.testData || row.value);
    return {
      testCaseId: clean(row.testCaseId || row.id),
      testCaseName: clean(row.testCaseName || row.name),
      stepOrder: Number(row.stepOrder) || 0,
      keyword: clean(row.keyword),
      objectName,
      testData,
      description: clean(row.description),
      runFlag: clean(row.runFlag || 'Y').toUpperCase()
    };
  }).filter((step) => step.runFlag !== 'N');
}

function validateSteps(steps) {
  for (const step of steps) {
    if (!step.testCaseId) {
      throw new Error('Keyword Excel has a row without testCaseId.');
    }
    if (!step.keyword) {
      throw new Error(`Test case ${step.testCaseId} has a row without keyword.`);
    }
    if (!supportedKeywords.has(step.keyword)) {
      throw new Error(`Test case ${step.testCaseId} uses unsupported keyword "${step.keyword}".`);
    }
    if (['open', 'waitVisible', 'type', 'click', 'assertValue', 'assertLocalStorageObjectNotEmpty'].includes(step.keyword) && !step.objectName) {
      throw new Error(`Test case ${step.testCaseId}, keyword ${step.keyword} requires objectName.`);
    }
  }
}

function groupSteps(steps) {
  const caseMap = new Map();
  for (const step of steps) {
    if (!caseMap.has(step.testCaseId)) {
      caseMap.set(step.testCaseId, {
        id: step.testCaseId,
        name: step.testCaseName || step.testCaseId,
        steps: []
      });
    }

    caseMap.get(step.testCaseId).steps.push(step);
  }

  return Array.from(caseMap.values()).map((testCase) => ({
    ...testCase,
    steps: testCase.steps.sort((a, b) => a.stepOrder - b.stepOrder)
  }));
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

async function runCase(driver, actionKeywords, frontendBaseUrl, testCase) {
  const startedAt = Date.now();
  const stepResults = [];

  try {
    await driver.get(new URL('/index.html', frontendBaseUrl.endsWith('/') ? frontendBaseUrl : `${frontendBaseUrl}/`).toString());
    await driver.executeScript('localStorage.clear(); sessionStorage.clear();');

    for (const step of testCase.steps) {
      const stepStartedAt = Date.now();
      const detail = await actionKeywords.execute(step);
      stepResults.push({
        stepOrder: step.stepOrder,
        keyword: step.keyword,
        objectName: step.objectName,
        testData: step.testData,
        description: step.description,
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

async function runKeywordDrivenTests(options) {
  fs.mkdirSync(options.reportsDir, { recursive: true });
  const steps = readSteps(options.testDataPath);
  validateSteps(steps);
  const testCases = groupSteps(steps);
  const driver = await buildDriver();
  const actionKeywords = new ActionKeywords({
    driver,
    frontendBaseUrl: options.frontendBaseUrl,
    apiBaseUrl: options.apiBaseUrl,
    objectRepository
  });
  const results = [];

  try {
    for (const testCase of testCases) {
      const result = await runCase(driver, actionKeywords, options.frontendBaseUrl, testCase);
      results.push(result);
      console.log(`${result.status.toUpperCase()} ${result.id} ${result.name}`);
    }
  }
  finally {
    await driver.quit();
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    framework: 'keyword-driven',
    components: {
      excel: path.relative(process.cwd(), options.testDataPath),
      objectRepository: path.relative(process.cwd(), path.join(__dirname, 'object-repository.json')),
      functionLibrary: path.relative(process.cwd(), path.join(__dirname, 'action-keywords.js')),
      driverScript: path.relative(process.cwd(), path.join(__dirname, 'keyword-driver.js')),
      selenium: 'selenium-webdriver'
    },
    frontendBaseUrl: options.frontendBaseUrl,
    apiBaseUrl: options.apiBaseUrl,
    total: results.length,
    passed: results.filter((item) => item.status === 'passed').length,
    failed: results.filter((item) => item.status === 'failed').length,
    results
  };

  fs.writeFileSync(options.reportPath, JSON.stringify(summary, null, 2));

  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

module.exports = {
  runKeywordDrivenTests
};
