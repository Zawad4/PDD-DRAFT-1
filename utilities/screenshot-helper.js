import fs from 'fs';
import path from 'path';
import config from '../config/config.json' with { type: 'json' };
import { logger } from './logger.js';

export class ScreenshotHelper {
  /**
   * Captures a screenshot and saves to designated directory.
   * @param {WebDriver} driver
   * @param {string} testName
   * @param {boolean} [isFailure=false]
   */
  static async captureScreenshot(driver, testName, isFailure = false) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedTestName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${sanitizedTestName}_${timestamp}.png`;
      
      const targetDir = isFailure 
        ? path.resolve(config.paths.failures || 'reports/failures')
        : path.resolve(config.paths.screenshots || 'reports/screenshots');

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const screenshotData = await driver.takeScreenshot();
      const filePath = path.join(targetDir, fileName);

      fs.writeFileSync(filePath, screenshotData, 'base64');
      logger.info(`Screenshot captured: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error(`Failed to capture screenshot: ${error.message}`);
      return null;
    }
  }

  /**
   * Fetches browser console logs for diagnostic troubleshooting.
   * @param {WebDriver} driver
   */
  static async getBrowserLogs(driver) {
    try {
      const logs = await driver.manage().logs().get('browser');
      return logs.map(entry => `[${entry.level.name}] ${entry.message}`).join('\n');
    } catch {
      return 'Console logs unavailable or not supported by browser driver.';
    }
  }
}
