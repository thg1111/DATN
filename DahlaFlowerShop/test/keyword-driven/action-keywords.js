const path = require('path');

function requireDependency(name) {
  try {
    return require(name);
  }
  catch {
    return require(path.join(__dirname, '..', '..', 'ci', 'node_modules', name));
  }
}

const { By, until } = requireDependency('selenium-webdriver');

class ActionKeywords {
  constructor({ driver, frontendBaseUrl, apiBaseUrl, objectRepository }) {
    this.driver = driver;
    this.frontendBaseUrl = frontendBaseUrl;
    this.apiBaseUrl = apiBaseUrl;
    this.objectRepository = objectRepository;
  }

  resolveObject(objectNameOrTarget) {
    const key = String(objectNameOrTarget || '').trim();
    if (!key) {
      return { type: 'empty', value: '' };
    }

    return this.objectRepository[key] || { type: 'css', value: key };
  }

  pageUrl(relativePath) {
    return new URL(relativePath, this.frontendBaseUrl.endsWith('/') ? this.frontendBaseUrl : `${this.frontendBaseUrl}/`).toString();
  }

  async visibleElement(selector) {
    const element = await this.driver.wait(until.elementLocated(By.css(selector)), 10000);
    await this.driver.wait(until.elementIsVisible(element), 10000);
    return element;
  }

  async open(objectName) {
    const object = this.resolveObject(objectName);
    if (object.type !== 'url') {
      throw new Error(`Keyword open requires URL object, got "${objectName}".`);
    }

    await this.driver.get(this.pageUrl(object.value));
    return await this.driver.getCurrentUrl();
  }

  async configureApi() {
    await this.driver.executeScript(`
      window.APP_API_BASE_URL = arguments[0];
      window.alert = function () {};
      window.confirm = function () { return true; };
    `, this.apiBaseUrl);
    return this.apiBaseUrl;
  }

  async waitVisible(objectName) {
    const object = this.resolveObject(objectName);
    await this.visibleElement(object.value);
    return object.value;
  }

  async type(objectName, value) {
    const object = this.resolveObject(objectName);
    const element = await this.visibleElement(object.value);
    await element.clear();
    await element.sendKeys(value || '');
    return `${objectName}=${value || ''}`;
  }

  async click(objectName) {
    const object = this.resolveObject(objectName);
    const element = await this.visibleElement(object.value);
    await this.driver.executeScript('arguments[0].scrollIntoView({ block: "center", inline: "center" });', element);
    await this.driver.executeScript('arguments[0].click();', element);
    return object.value;
  }

  async assertValue(objectName, expectedValue) {
    const object = this.resolveObject(objectName);
    const actual = await this.driver.findElement(By.css(object.value)).getAttribute('value');
    if (actual !== expectedValue) {
      throw new Error(`Expected value "${expectedValue}", got "${actual}".`);
    }
    return actual;
  }

  async assertTextContains(objectName, expectedText) {
    const object = this.resolveObject(objectName || 'body');
    const selector = object.type === 'empty' ? 'body' : object.value;
    const text = await this.driver.findElement(By.css(selector)).getText();
    if (!text.includes(expectedText)) {
      throw new Error(`Expected text to contain "${expectedText}".`);
    }
    return expectedText;
  }

  async assertUrlContains(_objectName, expectedText) {
    const url = await this.driver.getCurrentUrl();
    if (!url.includes(expectedText)) {
      throw new Error(`Expected URL to contain "${expectedText}", got "${url}".`);
    }
    return url;
  }

  async assertLocalStorageObjectNotEmpty(objectName) {
    const object = this.resolveObject(objectName);
    const storageKey = object.value || objectName;
    await this.driver.wait(async () => {
      return this.driver.executeScript(`
        const raw = localStorage.getItem(arguments[0]);
        if (!raw) return false;
        try {
          return Object.keys(JSON.parse(raw)).length > 0;
        }
        catch {
          return false;
        }
      `, storageKey);
    }, 10000, `Expected localStorage object ${storageKey} to contain data.`);
    return storageKey;
  }

  async execute(step) {
    switch (step.keyword) {
      case 'open':
        return this.open(step.objectName);
      case 'configureApi':
        return this.configureApi();
      case 'waitVisible':
        return this.waitVisible(step.objectName);
      case 'type':
        return this.type(step.objectName, step.testData);
      case 'click':
        return this.click(step.objectName);
      case 'assertValue':
        return this.assertValue(step.objectName, step.testData);
      case 'assertTextContains':
        return this.assertTextContains(step.objectName, step.testData);
      case 'assertUrlContains':
        return this.assertUrlContains(step.objectName, step.testData);
      case 'assertLocalStorageObjectNotEmpty':
        return this.assertLocalStorageObjectNotEmpty(step.objectName);
      default:
        throw new Error(`Unsupported keyword: ${step.keyword}`);
    }
  }
}

module.exports = {
  ActionKeywords
};
