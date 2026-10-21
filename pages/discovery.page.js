import { By } from 'selenium-webdriver';
import { BasePage } from './base.page.js';

export class DiscoveryPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.searchInput = By.css('input[placeholder*="Search activities"]');
    this.nearYouTab = By.xpath("//button[contains(text(), 'Near You')]");
    this.activitiesTab = By.xpath("//button[contains(text(), 'Activities')]");
    this.venuesTab = By.xpath("//button[contains(text(), 'Venues')]");
    this.allowLocationBtn = By.xpath("//button[contains(text(), 'Allow Location')]");
    this.bookNowButtons = By.xpath("//button[contains(text(), 'Select Slot & Book') or contains(text(), 'Book Now')]");
    this.payAndBookBtn = By.xpath("//button[contains(text(), 'Pay & Book') or contains(text(), 'Proceed to Pay')]");
    this.dealsModal = By.xpath("//h3[contains(text(), 'Deals & Memberships')]");
  }

  async searchActivity(query) {
    await this.elementHelper.type(this.searchInput, query);
    await this.waitHelper.sleep(400);
  }

  async selectRadius(radiusKm) {
    const radiusPill = By.xpath(`//button[contains(text(), '${radiusKm} km')]`);
    await this.elementHelper.click(radiusPill);
    await this.waitHelper.sleep(300);
  }

  async clickNearYouTab() {
    await this.elementHelper.click(this.nearYouTab);
  }

  async clickBookFirstTurf() {
    await this.elementHelper.click(this.bookNowButtons);
  }

  async clickPayAndBook() {
    await this.elementHelper.click(this.payAndBookBtn);
  }
}
