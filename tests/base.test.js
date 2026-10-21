import { DriverFactory } from '../config/driver-factory.js';
import { globalExcelReporter } from '../utilities/excel-reporter.js';
import { ScreenshotHelper } from '../utilities/screenshot-helper.js';
import { logger } from '../utilities/logger.js';
import config from '../config/config.json' with { type: 'json' };

export class BaseTestSetup {
  static async setupBeforeSuite() {
    logger.info('=====================================================================');
    logger.info('   Starting E2E Selenium Test Automation Suite Execution');
    logger.info('=====================================================================');
  }

  static async setupBeforeEach(testTitle) {
    logger.info(`>>> Starting Test Scenario: "${testTitle}"`);
    const driver = await DriverFactory.createDriver();
    return driver;
  }

  static async handleAfterEach(driver, testCtx) {
    const testName = testCtx.currentTest.title;
    const duration = testCtx.currentTest.duration || 0;
    const status = testCtx.currentTest.state === 'passed' ? 'PASSED' 
      : testCtx.currentTest.state === 'failed' ? 'FAILED' 
      : 'SKIPPED';

    let screenshotPath = null;
    let currentUrl = 'N/A';
    let errorMsg = null;

    if (driver) {
      try {
        currentUrl = await driver.getCurrentUrl();
      } catch {}

      if (status === 'FAILED') {
        errorMsg = testCtx.currentTest.err ? testCtx.currentTest.err.message : 'Unknown Error';
        logger.error(`TEST FAILED: "${testName}" - Error: ${errorMsg}`);
        
        screenshotPath = await ScreenshotHelper.captureScreenshot(driver, testName, true);
        const logs = await ScreenshotHelper.getBrowserLogs(driver);
        logger.error(`Browser Console Logs on Failure:\n${logs}`);
      }

      try {
        await driver.quit();
        logger.info(`Closed browser driver session for "${testName}"`);
      } catch (qErr) {
        logger.warn(`Driver quit warning: ${qErr.message}`);
      }
    }

    // Record into Excel Reporter
    globalExcelReporter.addTestResult({
      testId: `TC_${Date.now()}`,
      module: testCtx.currentTest.parent ? testCtx.currentTest.parent.title : 'E2E Suite',
      scenarioName: testName,
      browser: process.env.BROWSER || config.browser,
      status,
      startTime: new Date(Date.now() - duration).toLocaleTimeString(),
      endTime: new Date().toLocaleTimeString(),
      duration,
      error: errorMsg,
      screenshotPath,
      url: currentUrl
    });

    globalExcelReporter.addLogEntry(
      testName,
      `Executed test scenario: "${testName}"`,
      status,
      errorMsg || 'Test completed successfully'
    );
  }

  static async teardownAfterSuite() {
    logger.info('Generating final multi-sheet Excel report...');
    try {
      const reportFile = await globalExcelReporter.generateReport();
      logger.info(`Excel Report saved at: ${reportFile}`);
    } catch (err) {
      logger.error(`Failed to output Excel report: ${err.message}`);
    }
    logger.info('=====================================================================');
    logger.info('   E2E Selenium Test Suite Execution Finished');
    logger.info('=====================================================================');
  }
}

export const driverManager = DriverFactory;
export default BaseTestSetup;

