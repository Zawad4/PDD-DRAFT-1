/**
 * Navigation Bar & Tab Routing Page Object
 */

import BasePage from './base.page.js';

export class NavPage extends BasePage {
  constructor(driverManager) {
    super(driverManager);

    this.navHeader = 'header';
    this.mobileMenuBtn = 'button[aria-label="Toggle menu"], button.xl\\:hidden';
  }

  /**
   * Click top nav tab or mobile menu tab
   */
  async navigateToTab(tabId) {
    const tabSelector = `button[data-tab="${tabId}"], button:contains("${tabId}")`;
    if (await this.isVisible(tabSelector, 3000)) {
      await this.click(tabSelector);
    } else {
      // Try opening mobile menu if visible
      if (await this.isVisible(this.mobileMenuBtn)) {
        await this.click(this.mobileMenuBtn);
        await this.click(`button:contains("${tabId}")`);
      }
    }
  }
}

export default NavPage;
