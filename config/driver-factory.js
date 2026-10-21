import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import edge from 'selenium-webdriver/edge.js';
import config from './config.json' with { type: 'json' };

export class DriverFactory {
  /**
   * Creates a Web Driver instance based on browser configuration.
   * @param {string} [browserName] - 'chrome' | 'firefox' | 'edge'
   * @param {boolean} [headless] - boolean
   */
  static async createDriver(browserName = config.browser, headless = config.headless) {
    const targetBrowser = (process.env.BROWSER || browserName).toLowerCase();
    const isHeadless = process.env.HEADLESS !== undefined 
      ? process.env.HEADLESS === 'true' 
      : headless;

    let builder = new Builder().forBrowser(targetBrowser);

    switch (targetBrowser) {
      case 'firefox': {
        const firefoxOptions = new firefox.Options();
        if (isHeadless) {
          firefoxOptions.addArguments('-headless');
        }
        firefoxOptions.addArguments('--width=1920');
        firefoxOptions.addArguments('--height=1080');
        builder.setFirefoxOptions(firefoxOptions);
        break;
      }

      case 'edge': {
        const edgeOptions = new edge.Options();
        if (isHeadless) {
          edgeOptions.addArguments('--headless=new');
        }
        edgeOptions.addArguments('--no-sandbox');
        edgeOptions.addArguments('--disable-gpu');
        edgeOptions.addArguments('--disable-dev-shm-usage');
        edgeOptions.addArguments('--window-size=1920,1080');
        builder.setEdgeOptions(edgeOptions);
        break;
      }

      case 'chrome':
      default: {
        const chromeOptions = new chrome.Options();
        if (isHeadless) {
          chromeOptions.addArguments('--headless=new');
        }
        chromeOptions.addArguments('--no-sandbox');
        chromeOptions.addArguments('--disable-gpu');
        chromeOptions.addArguments('--disable-dev-shm-usage');
        chromeOptions.addArguments('--disable-notifications');
        chromeOptions.addArguments('--ignore-certificate-errors');
        chromeOptions.addArguments('--window-size=1920,1080');
        builder.setChromeOptions(chromeOptions);
        break;
      }
    }

    const driver = await builder.build();

    // Set implicit timeouts
    await driver.manage().setTimeouts({
      implicit: config.timeouts.implicit,
      pageLoad: config.timeouts.pageLoad
    });

    // Maximize window
    try {
      await driver.manage().window().maximize();
    } catch {
      // In headless mode maximize can fail on some systems; window-size argument handles it
    }

    return driver;
  }
}
