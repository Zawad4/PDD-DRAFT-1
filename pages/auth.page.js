import { By } from 'selenium-webdriver';
import { BasePage } from './base.page.js';

export class AuthPage extends BasePage {
  constructor(driver) {
    super(driver);

    // Locators
    this.authContainer = By.css('.glass-card');
    this.emailInput = By.css('input[type="email"]');
    this.passwordInput = By.css('input[type="password"]');
    this.submitButton = By.css('button[type="submit"]');
    this.toggleAuthModeBtn = By.xpath("//button[contains(text(), 'Create one') or contains(text(), 'Sign In')]");
    this.playerRoleCard = By.xpath("//h4[contains(text(), 'Player / Athlete')] | //button[contains(text(), \"I'm a Player\")]");
    this.ownerRoleCard = By.xpath("//h4[contains(text(), 'Venue Owner')] | //button[contains(text(), \"I'm a Venue Owner\")]");
    this.errorMessage = By.css('.text-rose-400, .text-red-500');
  }

  async isAuthPageDisplayed() {
    if (await this.elementHelper.isDisplayed(this.emailInput)) {
      return true;
    }
    // Check if user is logged in and attempt logout to reach Auth page
    const signOutBtn = By.xpath("//button[contains(text(), 'Sign Out')]");
    const userChip = By.css('.rounded-full.border.border-white\\/10');
    if (await this.elementHelper.isDisplayed(userChip)) {
      await this.elementHelper.click(userChip);
      await this.waitHelper.sleep(300);
    }
    if (await this.elementHelper.isDisplayed(signOutBtn)) {
      await this.elementHelper.click(signOutBtn);
      await this.waitHelper.sleep(500);
    }
    return await this.elementHelper.isDisplayed(this.emailInput);
  }

  async enterEmail(email) {
    await this.elementHelper.type(this.emailInput, email);
  }

  async enterPassword(password) {
    await this.elementHelper.type(this.passwordInput, password);
  }

  async submitAuthForm() {
    await this.elementHelper.click(this.submitButton);
  }

  async selectPlayerRole() {
    if (await this.elementHelper.isDisplayed(this.playerRoleCard)) {
      await this.elementHelper.click(this.playerRoleCard);
    }
  }

  async selectOwnerRole() {
    if (await this.elementHelper.isDisplayed(this.ownerRoleCard)) {
      await this.elementHelper.click(this.ownerRoleCard);
    }
  }

  async getErrorMessage() {
    if (await this.elementHelper.isDisplayed(this.errorMessage)) {
      return await this.elementHelper.getText(this.errorMessage);
    }
    return '';
  }
}
