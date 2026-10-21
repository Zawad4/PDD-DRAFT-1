import { By } from 'selenium-webdriver';
import { BasePage } from './base.page.js';

export class VenueManagerPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.addTurfBtn = By.xpath("//button[contains(text(), 'Add Venue') or contains(text(), 'Add New Turf') or contains(text(), 'Add Turf') or contains(text(), 'Add My First Venue')]");
    this.turfNameInput = By.css('input[placeholder*="Arena Football"]');
    this.addressInput = By.css('input[placeholder*="Anna Nagar"]');
    this.priceInput = By.css('input[placeholder*="1200"]');
    this.saveTurfSubmitBtn = By.xpath("//button[contains(text(), 'Save Turf Location')]");
  }

  async openAddTurfModal() {
    await this.elementHelper.click(this.addTurfBtn);
  }

  async fillVenueForm(venue) {
    if (venue.name) await this.elementHelper.type(this.turfNameInput, venue.name);
    if (venue.location) await this.elementHelper.type(this.addressInput, venue.location);
    if (venue.price) await this.elementHelper.type(this.priceInput, venue.price);
  }

  async submitVenueForm() {
    await this.elementHelper.click(this.saveTurfSubmitBtn);
  }
}
