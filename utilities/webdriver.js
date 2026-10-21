/**
 * Enterprise Selenium WebDriver Manager
 * Wrapper around Selenium WebDriver with explicit wait helpers, retries, and JS execution capabilities.
 */

import { Builder, By, until } from 'selenium-webdriver';
import config from '../config/env.config.js';
import { getChromeOptions, getFirefoxOptions, getEdgeOptions } from '../config/browser.config.js';
import logger from './logger.js';

export class WebDriverManager {
  constructor() {
    this.driver = null;
  }

  /**
   * Initializes the WebDriver instance based on config browser.
   */
  async createDriver(browserName = config.browser) {
    const targetBrowser = (browserName || 'chrome').toLowerCase();
    logger.info(`Initializing WebDriver instance for browser: [${targetBrowser}] (Headless: ${config.headless})`);

    let builder = new Builder();

    switch (targetBrowser) {
      case 'firefox':
        builder = builder.forBrowser('firefox').setFirefoxOptions(getFirefoxOptions());
        break;
      case 'edge':
        builder = builder.forBrowser('MicrosoftEdge').setEdgeOptions(getEdgeOptions());
        break;
      case 'chrome':
      default:
        builder = builder.forBrowser('chrome').setChromeOptions(getChromeOptions());
        break;
    }

    this.driver = await builder.build();

    await this.driver.manage().setTimeouts({
      implicit: config.timeouts.implicit,
      pageLoad: config.timeouts.pageLoad,
      script: config.timeouts.script
    });

    await this.driver.manage().window().maximize();
    return this.driver;
  }

  getDriver() {
    if (!this.driver) {
      throw new Error('WebDriver instance has not been initialized. Call createDriver() first.');
    }
    return this.driver;
  }

  /**
   * Navigate to target URL
   */
  async navigateTo(url) {
    logger.info(`Navigating to URL: ${url}`);
    await this.driver.get(url);
  }

  /**
   * Explicit Wait for Element to be Visible
   */
  async waitUntilVisible(locator, timeout = config.timeouts.explicit) {
    const byLocator = typeof locator === 'string' ? By.css(locator) : locator;
    return await this.driver.wait(until.elementLocated(byLocator), timeout)
      .then(element => this.driver.wait(until.elementIsVisible(element), timeout));
  }

  /**
   * Explicit Wait for Element to be Clickable
   */
  async waitUntilClickable(locator, timeout = config.timeouts.explicit) {
    const byLocator = typeof locator === 'string' ? By.css(locator) : locator;
    const element = await this.waitUntilVisible(byLocator, timeout);
    return await this.driver.wait(until.elementIsEnabled(element), timeout);
  }

  /**
   * Scroll Element into View via JavaScript
   */
  async scrollToElement(locator) {
    const byLocator = typeof locator === 'string' ? By.css(locator) : locator;
    const element = await this.driver.findElement(byLocator);
    await this.driver.executeScript('arguments[0].scrollIntoView({ behavior: "smooth", block: "center" });', element);
    await this.driver.sleep(300); // Allow scroll completion
  }

  /**
   * Execute JavaScript in browser
   */
  async executeScript(script, ...args) {
    return await this.driver.executeScript(script, ...args);
  }

  /**
   * Handle JavaScript Alert Dialog
   */
  async handleAlert(action = 'accept') {
    try {
      await this.driver.wait(until.alertIsPresent(), 3000);
      const alert = await this.driver.switchTo().alert();
      const alertText = await alert.getText();
      logger.info(`Alert present with text: "${alertText}". Action: ${action}`);
      if (action === 'accept') {
        await alert.accept();
      } else {
        await alert.dismiss();
      }
      return alertText;
    } catch (err) {
      logger.warn(`No alert present to handle: ${err.message}`);
      return null;
    }
  }

  /**
   * Switch Window / Tab by Handle or Title
   */
  async switchToWindow(targetWindowHandleOrTitle) {
    const handles = await this.driver.getAllWindowHandles();
    for (const handle of handles) {
      await this.driver.switchTo().window(handle);
      const title = await this.driver.getTitle();
      if (handle === targetWindowHandleOrTitle || title.includes(targetWindowHandleOrTitle)) {
        logger.info(`Switched to window: [${title}] (${handle})`);
        return true;
      }
    }
    return false;
  }

  /**
   * Close and Quit Driver safely
   */
  async quit() {
    if (this.driver) {
      logger.info('Closing WebDriver instance session.');
      try {
        await this.driver.quit();
      } catch (e) {
        logger.error(`Error during driver.quit(): ${e.message}`);
      } finally {
        this.driver = null;
      }
    }
  }
}

export default WebDriverManager;
