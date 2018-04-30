const NodeEnvironment = require('jest-environment-node');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const { Builder, By, until } = require('selenium-webdriver');

class WebDriverEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
    const options = config.testEnvironmentOptions || {};
    this.browserName = options.browser || 'chrome';
    this.headless = options.headless;
    this.seleniumAddress = options.seleniumAddress || null;
  }

  async setup() {
    await super.setup();

    let driver = new Builder();
    if (this.seleniumAddress) {
      driver = driver.usingServer(this.seleniumAddress);
    }
    if (this.headless) {
      driver = await driver
        .forBrowser(this.browserName)
        .setChromeOptions(new chrome.Options().headless())
        .setFirefoxOptions(new firefox.Options().headless())
        .build();
    } else {
      driver = await driver.forBrowser(this.browserName).build();
    }

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
