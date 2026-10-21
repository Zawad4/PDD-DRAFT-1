/**
 * Enterprise Appium 2.x Driver Factory & Device Manager
 * Supports Android UiAutomator2 and Flutter Drivers for Real Devices & Emulators.
 */

import { remote } from 'webdriverio';
import execa from 'execa';
import config from '../config/appium.config.js';
import logger from '../../utilities/logger.js';

export class AppiumDriverFactory {
  constructor() {
    this.driver = null;
  }

  /**
   * Dynamically detects connected Android devices via adb.
   */
  async detectConnectedDevices() {
    try {
      const { stdout } = await execa('adb', ['devices']);
      const lines = stdout.split('\n').filter(l => l.includes('\tdevice'));
      const devices = lines.map(l => l.split('\t')[0]);
      logger.info(`Detected ${devices.length} connected Android device(s): [${devices.join(', ')}]`);
      return devices;
    } catch (err) {
      logger.warn(`Could not run 'adb devices': ${err.message}. Defaulting to emulator-5554.`);
      return ['emulator-5554'];
    }
  }

  /**
   * Builds and returns WebdriverIO/Appium session options.
   */
  async getCapabilities() {
    const devices = await this.detectConnectedDevices();
    const targetUdid = devices[0] || config.udid;

    const capabilities = {
      platformName: config.platformName,
      'appium:automationName': config.automationName,
      'appium:deviceName': config.deviceName,
      'appium:udid': targetUdid,
      'appium:platformVersion': config.platformVersion,
      'appium:newCommandTimeout': config.timeouts.newCommandTimeout,
      'appium:noReset': false,
      'appium:fullReset': false
    };

    if (config.useInstalledApp) {
      capabilities['appium:appPackage'] = config.appPackage;
      capabilities['appium:appActivity'] = config.appActivity;
    } else {
      capabilities['appium:app'] = config.appPath;
    }

    return capabilities;
  }

  /**
   * Initializes Appium 2.x Session.
   */
  async createDriver() {
    const capabilities = await this.getCapabilities();
    logger.info(`Starting Appium 2.x session on ${config.appiumHost}:${config.appiumPort}`);

    this.driver = await remote({
      hostname: config.appiumHost,
      port: config.appiumPort,
      logLevel: 'error',
      capabilities
    });

    return this.driver;
  }

  getDriver() {
    if (!this.driver) {
      throw new Error('Appium driver is not initialized. Call createDriver() first.');
    }
    return this.driver;
  }

  async quit() {
    if (this.driver) {
      logger.info('Terminating Appium driver session.');
      try {
        await this.driver.deleteSession();
      } catch (err) {
        logger.error(`Error deleting Appium session: ${err.message}`);
      } finally {
        this.driver = null;
      }
    }
  }
}

export default AppiumDriverFactory;
