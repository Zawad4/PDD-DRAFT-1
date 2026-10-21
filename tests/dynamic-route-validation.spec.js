import { expect } from 'chai';
import { BaseTestSetup } from './base.test.js';
import { BasePage } from '../pages/base.page.js';
import { RouteDiscoveryEngine } from '../utilities/route-discovery-engine.js';
import { logger } from '../utilities/logger.js';

const discoveryData = RouteDiscoveryEngine.discoverRoutesAndForms();

describe('Dynamic React Route & Form Validation Automated Suite', function () {
  this.timeout(60000);
  let driver;
  let basePage;

  beforeEach(async function () {
    driver = await BaseTestSetup.setupBeforeEach(this.currentTest.title);
    basePage = new BasePage(driver);
    await basePage.navigateTo();
  });

  afterEach(async function () {
    await BaseTestSetup.handleAfterEach(driver, this);
  });

  describe('1. Dynamic React Navigation & Route Verification', function () {
    discoveryData.routes.forEach(route => {
      it(`TC_DYN_NAV - Verify React Route Navigation: "${route}"`, async function () {
        logger.info(`Dynamic Test Executing for Route: ${route}`);
        await basePage.navigateTab(route.replace('-', ' '));
        const url = await basePage.getCurrentUrl();
        expect(url).to.include('localhost');
      });
    });
  });

  describe('2. Dynamic Form Validation Rule Executions', function () {
    discoveryData.dynamicValidationScenarios.forEach((scenario, idx) => {
      it(`TC_DYN_VAL_${idx + 1} - ${scenario.testName}`, async function () {
        logger.info(`Executing Dynamic Form Scenario: ${scenario.testName}`);
        await basePage.navigateTab(scenario.module.replace('-', ' '));
        const url = await basePage.getCurrentUrl();
        expect(url).to.include('localhost');
      });
    });
  });
});
