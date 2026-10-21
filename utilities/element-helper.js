import { By } from 'selenium-webdriver';
import { WaitHelper } from './wait-helper.js';
import { logger } from './logger.js';

export class ElementHelper {
  constructor(driver) {
    this.driver = driver;
    this.waitHelper = new WaitHelper(driver);
  }

  /**
   * Clicks an element with automatic explicit wait and JS scroll fallback.
   */
  async click(locator) {
    try {
      const element = await this.waitHelper.waitForElementClickable(locator);
      await this.scrollIntoView(locator);
      await element.click();
      logger.info(`Clicked element: ${locator}`);
    } catch (error) {
      logger.warn(`Standard click failed on ${locator}, attempting JS click fallback: ${error.message}`);
      try {
        const element = await this.waitHelper.waitForElementVisible(locator);
        await this.driver.executeScript('arguments[0].click();', element);
        logger.info(`JS Clicked element successfully: ${locator}`);
      } catch (jsErr) {
        logger.error(`JS Click failed on ${locator}: ${jsErr.message}`);
        throw jsErr;
      }
    }
  }

  /**
   * Clears existing text and types text into input field.
   */
  async type(locator, text, clear = true) {
    try {
      const element = await this.waitHelper.waitForElementVisible(locator);
      if (clear) {
        await element.clear();
      }
      await element.sendKeys(text);
      logger.info(`Typed text into ${locator}`);
    } catch (error) {
      logger.error(`Failed to type in ${locator}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gets visible text content of element.
   */
  async getText(locator) {
    try {
      const element = await this.waitHelper.waitForElementVisible(locator);
      const text = await element.getText();
      logger.info(`Retrieved text from ${locator}: "${text}"`);
      return text;
    } catch (error) {
      logger.error(`Failed to get text from ${locator}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Checks if element is displayed on page.
   */
  async isDisplayed(locator) {
    try {
      const elements = await this.driver.findElements(locator);
      if (elements.length === 0) return false;
      return await elements[0].isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Smoothly scrolls element into viewport.
   */
  async scrollIntoView(locator) {
    try {
      const element = await this.waitHelper.waitForElementVisible(locator);
      await this.driver.executeScript('arguments[0].scrollIntoView({ block: "center", behavior: "smooth" });', element);
      await this.waitHelper.sleep(200);
    } catch (error) {
      logger.warn(`Could not scroll element into view: ${error.message}`);
    }
  }

  /**
   * Selects option in HTML select dropdown by value or text.
   */
  async selectDropdownByValue(locator, value) {
    try {
      const selectElement = await this.waitHelper.waitForElementVisible(locator);
      const option = await selectElement.findElement(By.xpath(`.//option[@value='${value}' or contains(text(),'${value}')]`));
      await option.click();
      logger.info(`Selected dropdown option "${value}" for ${locator}`);
    } catch (error) {
      logger.error(`Failed to select dropdown option "${value}": ${error.message}`);
      throw error;
    }
  }

  /**
   * Toggles checkbox to desired state.
   */
  async setCheckboxState(locator, shouldBeChecked) {
    try {
      const checkbox = await this.waitHelper.waitForElementVisible(locator);
      const isChecked = await checkbox.isSelected();
      if (isChecked !== shouldBeChecked) {
        await checkbox.click();
      }
      logger.info(`Set checkbox ${locator} to state: ${shouldBeChecked}`);
    } catch (error) {
      logger.error(`Failed to set checkbox state for ${locator}: ${error.message}`);
      throw error;
    }
  }
}
