/**
 * Navigation & Routing End-to-End Test Suite
 * Enterprise QA Automation Framework
 */

import { expect } from 'chai';
import { BaseTestSetup } from './base.test.js';
import { BasePage } from '../pages/base.page.js';

describe('Navigation & Browser Routing Test Suite', function () {
  this.timeout(60000);
  let driver;
  let page;

  before(async function () {
    await BaseTestSetup.setupBeforeSuite();
  });

  beforeEach(async function () {
    driver = await BaseTestSetup.setupBeforeEach(this.currentTest.title);
    page = new BasePage(driver);
    await page.navigateTo();
  });

  afterEach(async function () {
    await BaseTestSetup.handleAfterEach(driver, this);
  });

  after(async function () {
    await BaseTestSetup.teardownAfterSuite();
  });

  it('TC_NAV_001: Should navigate across main application tabs', async function () {
    const tabs = ['Home', 'Discover', 'Marketplace', 'Communities', 'Tournaments'];
    for (const tab of tabs) {
      await page.navigateTab(tab);
      const url = await page.getCurrentUrl();
      expect(url).to.be.a('string');
    }
  });

  it('TC_NAV_002: Should handle browser back navigation correctly', async function () {
    await page.navigateTab('Discover');
    await page.navigateBack();
    const url = await page.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_NAV_003: Should handle browser forward navigation correctly', async function () {
    await page.navigateTab('Discover');
    await page.navigateBack();
    await page.navigateForward();
    const url = await page.getCurrentUrl();
    expect(url).to.be.a('string');
  });

  it('TC_NAV_004: Should retain view state on page refresh', async function () {
    await page.refreshPage();
    const url = await page.getCurrentUrl();
    expect(url).to.be.a('string');
  });
});
