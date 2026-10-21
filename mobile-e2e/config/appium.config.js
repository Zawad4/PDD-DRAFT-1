/**
 * Enterprise Appium 2.x & Mobile Driver Configuration
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const config = {
  appiumHost: process.env.APPIUM_HOST || '127.0.0.1',
  appiumPort: parseInt(process.env.APPIUM_PORT || '4723', 10),
  
  // Appium Drivers: 'uiautomator2' | 'flutter'
  automationName: process.env.AUTOMATION_NAME || 'UiAutomator2',

  // Application Launch Settings
  appPath: process.env.APK_PATH || path.join(rootDir, 'app', 'app-release.apk'),
  appPackage: process.env.APP_PACKAGE || 'com.turfington.app',
  appActivity: process.env.APP_ACTIVITY || 'com.turfington.app.MainActivity',
  useInstalledApp: process.env.USE_INSTALLED_APP === 'true',

  // Device & Platform Config
  platformName: 'Android',
  platformVersion: process.env.ANDROID_VERSION || '13.0',
  deviceName: process.env.DEVICE_NAME || 'Android Emulator',
  udid: process.env.DEVICE_UDID || 'emulator-5554',

  timeouts: {
    implicit: parseInt(process.env.IMPLICIT_WAIT || '10000', 10),
    explicit: parseInt(process.env.EXPLICIT_WAIT || '15000', 10),
    newCommandTimeout: 300,
    androidInstallTimeout: 90000
  },

  retryCount: parseInt(process.env.RETRY_COUNT || '2', 10),

  paths: {
    root: rootDir,
    reports: path.join(rootDir, 'reports'),
    failures: path.join(rootDir, 'reports', 'failures'),
    screenshots: path.join(rootDir, 'screenshots'),
    logs: path.join(rootDir, 'logs'),
    excel: path.join(rootDir, 'excel'),
    testdata: path.join(rootDir, 'testdata')
  }
};

export default config;
