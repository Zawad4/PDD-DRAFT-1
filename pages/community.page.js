import { By } from 'selenium-webdriver';
import { BasePage } from './base.page.js';

export class CommunityPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.postInput = By.css('textarea[placeholder*="What\'s on your mind"], input[placeholder*="post"]');
    this.createPostBtn = By.xpath("//button[contains(text(), 'Post') or contains(text(), 'Publish')]");
  }
}
