/**
 * Browser Options Configuration
 * Supports Chrome, Firefox, and Edge in Headed / Headless modes.
 */

import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import edge from 'selenium-webdriver/edge.js';
import config from './env.config.js';

export function getChromeOptions() {
  const options = new chrome.Options();
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-notifications');
  options.addArguments('--disable-popup-blocking');
  
  if (config.headless) {
    options.addArguments('--headless=new');
  }
  return options;
}

export function getFirefoxOptions() {
  const options = new firefox.Options();
  options.addArguments('-width=1920');
  options.addArguments('-height=1080');
  
  if (config.headless) {
    options.addArguments('-headless');
  }
  return options;
}

export function getEdgeOptions() {
  const options = new edge.Options();
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  
  if (config.headless) {
    options.addArguments('--headless=new');
  }
  return options;
}
