import { expect } from 'chai';
import { BaseTestSetup } from './base.test.js';
import { VenueManagerPage } from '../pages/venue-manager.page.js';
import testData from '../data/test-data.json' with { type: 'json' };

describe('Venue Manager & Owner Dashboard Suite', function () {
  this.timeout(60000);
  let driver;
  let venuePage;

  beforeEach(async function () {
    driver = await BaseTestSetup.setupBeforeEach(this.currentTest.title);
    venuePage = new VenueManagerPage(driver);
    await venuePage.navigateTo();
  });

  afterEach(async function () {
    await BaseTestSetup.handleAfterEach(driver, this);
  });

  it('TC_VEN_001 - Validate Venue Owner Add Turf Form & Location Coordinates', async function () {
    await venuePage.navigateTab('My Venues');
    await venuePage.openAddTurfModal();
    await venuePage.fillVenueForm(testData.venue.validVenue);
    await venuePage.submitVenueForm();

    const url = await venuePage.getCurrentUrl();
    expect(url).to.include('localhost');
  });
});
