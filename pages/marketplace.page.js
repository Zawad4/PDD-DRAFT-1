import { By } from 'selenium-webdriver';
import { BasePage } from './base.page.js';

export class MarketplacePage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.browseGearTab = By.xpath("//button[contains(text(), 'Browse Gear')]");
    this.listGearTab = By.xpath("//button[contains(text(), 'List Your Gear')]");
    this.productTitleInput = By.css('input[placeholder*="English Willow"]');
    this.categorySelect = By.xpath("//select[contains(@class, 'bg-[#0d0d0d]')] | //select[1]");
    this.priceInput = By.css('input[type="number"]');
    this.descriptionArea = By.css('textarea[placeholder*="Describe your item"]');
    this.imageFileInput = By.css('input[type="file"]');
    this.photoConfirmCheckbox = By.xpath("//input[@type='checkbox'][1]");
    this.priceConfirmCheckbox = By.xpath("//input[@type='checkbox'][2]");
    this.listItemSubmitBtn = By.css('button[type="submit"]');
  }

  async clickListYourGearTab() {
    await this.elementHelper.click(this.listGearTab);
  }

  async fillListingForm(item) {
    if (item.name) await this.elementHelper.type(this.productTitleInput, item.name);
    if (item.price) await this.elementHelper.type(this.priceInput, item.price);
    if (item.description) await this.elementHelper.type(this.descriptionArea, item.description);
    
    await this.elementHelper.setCheckboxState(this.photoConfirmCheckbox, true);
    await this.elementHelper.setCheckboxState(this.priceConfirmCheckbox, true);
  }

  async submitListing() {
    await this.elementHelper.click(this.listItemSubmitBtn);
  }
}
