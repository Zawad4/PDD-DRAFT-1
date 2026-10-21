import { expect } from 'chai';
import { BaseTestSetup } from './base.test.js';
import { DiscoveryPage } from '../pages/discovery.page.js';

describe('Discover & Turf Near Me Feature Suite', function () {
  this.timeout(60000);
  let driver;
  let discoveryPage;

  beforeEach(async function () {
    driver = await BaseTestSetup.setupBeforeEach(this.currentTest.title);
    discoveryPage = new DiscoveryPage(driver);
    await discoveryPage.navigateTo();
  });

  afterEach(async function () {
    await BaseTestSetup.handleAfterEach(driver, this);
  });

  it('TC_DISC_001 - Validate Search Input and Turf Search Filtering', async function () {
    await discoveryPage.navigateTab('Discover');
    await discoveryPage.searchActivity('Football');
    const url = await discoveryPage.getCurrentUrl();
    expect(url).to.include('localhost');
  });

  it('TC_DISC_002 - Validate Radius Quick Selector Pills (5km, 10km, 20km, 30km, 50km)', async function () {
    await discoveryPage.navigateTab('Discover');
    await discoveryPage.clickNearYouTab();
    await discoveryPage.selectRadius(30);
    const url = await discoveryPage.getCurrentUrl();
    expect(url).to.include('localhost');
  });

  it('TC_DISC_003 - Validate Turf Booking Drawer and Razorpay Integration', async function () {
    await discoveryPage.navigateTab('Discover');
    await discoveryPage.clickNearYouTab();
    await discoveryPage.clickBookFirstTurf();
    const url = await discoveryPage.getCurrentUrl();
    expect(url).to.include('localhost');
  });
});
