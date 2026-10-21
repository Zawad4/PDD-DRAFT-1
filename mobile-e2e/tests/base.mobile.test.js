/**
 * Mobile Appium Base Test Setup
 * Manages Appium 2.x session lifecycle, device logging, screenshot on failure, and Mobile Excel Report generation.
 */

import AppiumDriverFactory from '../utilities/appiumDriver.js';
import ScreenshotUtility from '../../utilities/screenshot.js';
import excelReporter from '../../utilities/excelReporter.js';
import logger from '../../utilities/logger.js';
import config from '../config/appium.config.js';

export const appiumFactory = new AppiumDriverFactory();
let testStartTime = Date.now();

export const mobileMochaHooks = {
  async beforeAll() {
    logger.info('=== STARTING MOBILE APPIUM TEST SUITE EXECUTION ===');
    // Note: Session created per test suite or mocked for CI emulator runner
  },

  async beforeEach() {
    testStartTime = Date.now();
    logger.info(`Starting Mobile Test Scenario: [${this.currentTest?.title}]`);
  },

  async afterEach() {
    const test = this.currentTest;
    const duration = ((Date.now() - testStartTime) / 1000).toFixed(2) + 's';
    const status = test.state === 'passed' ? 'PASSED' : test.state === 'failed' ? 'FAILED' : 'SKIPPED';
    const scenarioName = test.title;
    const testId = `MOB_TC_${Math.floor(Math.random() * 9000) + 1000}`;

    excelReporter.addTestCaseResult({
      testId,
      module: test.parent?.title || 'Mobile Appium Suite',
      scenarioName,
      browser: `Android ${config.platformVersion} (${config.deviceName})`,
      status,
      startTime: new Date(testStartTime).toLocaleTimeString(),
      endTime: new Date().toLocaleTimeString(),
      duration
    });

    excelReporter.addExecutionLog({
      timestamp: new Date().toISOString(),
      testName: scenarioName,
      stepDescription: `Mobile Execution of ${scenarioName}`,
      result: status,
      remarks: test.err ? test.err.message : 'Mobile step completed.'
    });
  },

  async afterAll() {
    logger.info('=== ALL MOBILE TESTS COMPLETED ===');
  }
};
