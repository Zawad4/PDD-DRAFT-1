import { By } from 'selenium-webdriver';
import { ElementHelper } from '../utilities/element-helper.js';
import { WaitHelper } from '../utilities/wait-helper.js';
import { logger } from '../utilities/logger.js';
import config from '../config/config.json' with { type: 'json' };

export class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.elementHelper = new ElementHelper(driver);
    this.waitHelper = new WaitHelper(driver);
  }

  /**
   * Navigates to application URL.
   * @param {string} [path='']
   */
  async navigateTo(path = '') {
    const url = `${config.baseUrl}${path}`;
    logger.info(`Navigating to URL: ${url}`);
    await this.driver.get(url);
    await this.waitHelper.sleep(500);
  }

  /**
   * Gets current URL.
   */
  async getCurrentUrl() {
    const currentUrl = await this.driver.getCurrentUrl();
    logger.info(`Current URL: ${currentUrl}`);
    return currentUrl;
  }

  /**
   * Gets page title.
   */
  async getTitle() {
    return await this.driver.getTitle();
  }

  /**
   * Clicks navigation bar tab button by tab name.
   */
  async navigateTab(tabName) {
    logger.info(`Navigating to header tab: ${tabName}`);
    try {
      const locator = By.xpath(`//button[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${tabName.toLowerCase()}')] | //a[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${tabName.toLowerCase()}')]`);
      if (await this.elementHelper.isDisplayed(locator)) {
        await this.elementHelper.click(locator);
      } else {
        // Direct URL fallback
        const formattedTab = tabName.toLowerCase().replace(/\s+/g, '-');
        await this.driver.get(`${config.baseUrl}/#${formattedTab}`);
      }
    } catch {
      const formattedTab = tabName.toLowerCase().replace(/\s+/g, '-');
      await this.driver.get(`${config.baseUrl}/#${formattedTab}`);
    }
    await this.waitHelper.sleep(300);
  }

  /**
   * Refreshes page.
   */
  async refreshPage() {
    logger.info('Refreshing page');
    await this.driver.navigate().refresh();
    await this.waitHelper.sleep(500);
  }

  /**
   * Navigates browser back.
   */
  async navigateBack() {
    logger.info('Navigating browser back');
    await this.driver.navigate().back();
  }

  /**
   * Navigates browser forward.
   */
  async navigateForward() {
    logger.info('Navigating browser forward');
    await this.driver.navigate().forward();
  }
}
