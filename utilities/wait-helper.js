import { until } from 'selenium-webdriver';
import config from '../config/config.json' with { type: 'json' };
import { logger } from './logger.js';

export class WaitHelper {
  constructor(driver) {
    this.driver = driver;
    this.defaultTimeout = config.timeouts.explicit || 10000;
  }

  /**
   * Waits for an element to be located in DOM and visible on UI.
   */
  async waitForElementVisible(locator, timeout = this.defaultTimeout) {
    try {
      logger.info(`Waiting for element visible: ${locator}`);
      const element = await this.driver.wait(until.elementLocated(locator), timeout);
      await this.driver.wait(until.elementIsVisible(element), timeout);
      return element;
    } catch (error) {
      logger.error(`Element not visible within ${timeout}ms: ${locator} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Waits for an element to be enabled and clickable.
   */
  async waitForElementClickable(locator, timeout = this.defaultTimeout) {
    try {
      logger.info(`Waiting for element clickable: ${locator}`);
      const element = await this.waitForElementVisible(locator, timeout);
      await this.driver.wait(until.elementIsEnabled(element), timeout);
      return element;
    } catch (error) {
      logger.error(`Element not clickable within ${timeout}ms: ${locator} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Waits for text content to be present in element.
   */
  async waitForTextPresent(locator, text, timeout = this.defaultTimeout) {
    try {
      logger.info(`Waiting for text "${text}" in element: ${locator}`);
      const element = await this.waitForElementVisible(locator, timeout);
      await this.driver.wait(until.elementTextContains(element, text), timeout);
      return element;
    } catch (error) {
      logger.error(`Text "${text}" not present within ${timeout}ms: ${locator} - ${error.message}`);
      throw error;
    }
  }

  /**
   * Waits for current URL to contain substring.
   */
  async waitForUrlContains(urlChunk, timeout = this.defaultTimeout) {
    try {
      logger.info(`Waiting for URL to contain: "${urlChunk}"`);
      await this.driver.wait(until.urlContains(urlChunk), timeout);
      return true;
    } catch (error) {
      logger.error(`URL did not contain "${urlChunk}" within ${timeout}ms - ${error.message}`);
      throw error;
    }
  }

  /**
   * Pauses execution safely.
   */
  async sleep(ms) {
    await this.driver.sleep(ms);
  }
}
