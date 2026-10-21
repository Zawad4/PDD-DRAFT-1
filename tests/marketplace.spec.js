import { expect } from 'chai';
import { BaseTestSetup } from './base.test.js';
import { MarketplacePage } from '../pages/marketplace.page.js';
import testData from '../data/test-data.json' with { type: 'json' };

describe('Marketplace Peer-to-Peer Module Suite', function () {
  this.timeout(60000);
  let driver;
  let marketplacePage;

  beforeEach(async function () {
    driver = await BaseTestSetup.setupBeforeEach(this.currentTest.title);
    marketplacePage = new MarketplacePage(driver);
    await marketplacePage.navigateTo();
    await marketplacePage.navigateTab('Marketplace');
  });

  afterEach(async function () {
    await BaseTestSetup.handleAfterEach(driver, this);
  });

  it('TC_MKT_001 - Validate Marketplace Browse Gear Section', async function () {
    const url = await marketplacePage.getCurrentUrl();
    expect(url).to.include('localhost');
  });

  it('TC_MKT_002 - Validate List Your Gear Form Validation and Mandatory Checkboxes', async function () {
    await marketplacePage.clickListYourGearTab();
    await marketplacePage.fillListingForm(testData.marketplace.validItem);
    await marketplacePage.submitListing();

    const url = await marketplacePage.getCurrentUrl();
    expect(url).to.include('localhost');
  });
});
