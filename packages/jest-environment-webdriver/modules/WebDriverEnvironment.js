const NodeEnvironment = require('jest-environment-node');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const { Builder, By, until, Capabilities } = require('selenium-webdriver');

class WebDriverEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
    const options = config.testEnvironmentOptions || {};
    this.browserName = options.browser || 'chrome';
    this.headless = options.headless;
    this.insecure = options.insecure;
    this.seleniumAddress = options.seleniumAddress || null;
  }

  async setup() {
    await super.setup();

    let driver = new Builder();
    if (this.seleniumAddress) {
      driver = driver.usingServer(this.seleniumAddress);
    }

    driver = driver.forBrowser(this.browserName);
    let chromeOptions = new chrome.Options();
    let firefoxOptions = new firefox.Options();
    if (this.headless) {
      chromeOptions = chromeOptions.headless();
      firefoxOptions = firefoxOptions.headless();
    }

    let caps = driver.getCapabilities();
    if (this.insecure) {
      caps.set('acceptInsecureCerts', true);
    }

    driver = await driver
      .setChromeOptions(chromeOptions)
      .setFirefoxOptions(firefoxOptions)
      .withCapabilities(caps)
      .build();

    this.driver = driver;

    this.global.by = By;
    this.global.browser = driver;
    this.global.element = locator => driver.findElement(locator);
    this.global.element.all = locator => driver.findElements(locator);
    this.global.until = until;
  }

  async teardown() {
    await this.driver.quit();
    await super.teardown();
  }
}

module.exports = WebDriverEnvironment;
