import { By } from 'selenium-webdriver';
import { BasePage } from './base.page.js';

export class ProfilePage extends BasePage {
  constructor(driver) {
    super(driver);
    this.profileHeader = By.css('.font-display');
    this.editProfileBtn = By.xpath("//button[contains(text(), 'Edit Profile')]");
  }
}
