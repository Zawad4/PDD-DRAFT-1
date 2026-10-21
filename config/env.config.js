/**
 * Environment & Framework Configuration Module
 * Enterprise QA Automation Framework
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  browser: process.env.BROWSER || 'chrome', // 'chrome' | 'firefox' | 'edge'
  headless: process.env.HEADLESS === 'true' || process.env.CI === 'true',
  environment: process.env.ENV || 'local',
  
  timeouts: {
    implicit: parseInt(process.env.IMPLICIT_WAIT || '10000', 10),
    explicit: parseInt(process.env.EXPLICIT_WAIT || '15000', 10),
    pageLoad: parseInt(process.env.PAGE_LOAD_TIMEOUT || '30000', 10),
    script: 15000
  },

  retryCount: parseInt(process.env.RETRY_COUNT || '2', 10),

  paths: {
    root: rootDir,
    reports: path.join(rootDir, 'reports'),
    failures: path.join(rootDir, 'reports', 'failures'),
    screenshots: path.join(rootDir, 'screenshots'),
    logs: path.join(rootDir, 'logs'),
    excel: path.join(rootDir, 'excel'),
    data: path.join(rootDir, 'data')
  }
};

export default config;
