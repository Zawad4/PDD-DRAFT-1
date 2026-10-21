/**
 * Screenshot & Failure Diagnostics Utility
 */

import fs from 'fs';
import path from 'path';
import config from '../config/env.config.js';
import logger from './logger.js';

export class ScreenshotUtility {
  /**
   * Ensures output directories exist.
   */
  static ensureDirectories() {
    [config.paths.screenshots, config.paths.failures].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Captures a failure screenshot and browser console logs.
   */
  static async captureFailure(driver, testName, error) {
    this.ensureDirectories();
    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `FAIL_${sanitizedTestName}_${timestamp}.png`;
    
    const screenshotPath = path.join(config.paths.failures, fileName);
    const relativePath = path.relative(config.paths.root, screenshotPath);

    let currentUrl = 'N/A';
    let consoleLogs = [];

    try {
      if (driver) {
        currentUrl = await driver.getCurrentUrl();
        const base64Png = await driver.takeScreenshot();
        fs.writeFileSync(screenshotPath, base64Png, 'base64');
        logger.info(`Screenshot captured successfully: [${relativePath}]`);

        // Fetch browser console logs if available
        try {
          const logEntries = await driver.manage().logs().get('browser');
          consoleLogs = logEntries.map(entry => `[${entry.level.name}] ${entry.message}`);
        } catch {
          // Log collection may not be supported by all drivers
        }
      }
    } catch (err) {
      logger.error(`Failed to capture screenshot: ${err.message}`);
    }

    return {
      testName,
      reason: error?.message || 'Unknown Failure',
      stack: error?.stack || '',
      screenshotPath: relativePath,
      currentUrl,
      consoleLogs,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * General purpose screenshot helper
   */
  static async captureScreenshot(driver, name = 'screenshot') {
    this.ensureDirectories();
    const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(config.paths.screenshots, `${sanitized}_${Date.now()}.png`);
    const base64Png = await driver.takeScreenshot();
    fs.writeFileSync(filePath, base64Png, 'base64');
    return filePath;
  }
}

export default ScreenshotUtility;
