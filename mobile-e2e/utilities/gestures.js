/**
 * Mobile Gesture Automation Utility (Appium W3C Actions API)
 */

import logger from '../../utilities/logger.js';

export class MobileGestures {
  constructor(driver) {
    this.driver = driver;
  }

  /**
   * Tap on element or coordinates
   */
  async tap(elementOrX, y) {
    if (typeof elementOrX === 'object' && elementOrX.elementId) {
      await elementOrX.click();
    } else {
      await this.driver.performActions([
        {
          type: 'pointer',
          id: 'finger1',
          parameters: { pointerType: 'touch' },
          actions: [
            { type: 'pointerMove', duration: 0, x: elementOrX, y },
            { type: 'pointerDown', button: 0 },
            { type: 'pause', duration: 100 },
            { type: 'pointerUp', button: 0 }
          ]
        }
      ]);
    }
  }

  /**
   * Long Press on Element or Screen Coordinate
   */
  async longPress(x, y, durationMs = 1500) {
    logger.info(`Performing long press at (${x}, ${y}) for ${durationMs}ms`);
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: durationMs },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }

  /**
   * Swipe directional gesture
   */
  async swipe(direction = 'up', distanceRatio = 0.6) {
    const { width, height } = await this.driver.getWindowSize();
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height / 2);

    let endX = startX;
    let endY = startY;

    switch (direction.toLowerCase()) {
      case 'up':
        endY = Math.floor(startY - height * distanceRatio * 0.5);
        break;
      case 'down':
        endY = Math.floor(startY + height * distanceRatio * 0.5);
        break;
      case 'left':
        endX = Math.floor(startX - width * distanceRatio * 0.5);
        break;
      case 'right':
        endX = Math.floor(startX + width * distanceRatio * 0.5);
        break;
    }

    logger.info(`Swiping ${direction} from (${startX}, ${startY}) to (${endX}, ${endY})`);

    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerMove', duration: 500, x: endX, y: endY },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }

  /**
   * Scroll down until element with selector is visible
   */
  async scrollUntilVisible(selector, maxSwipes = 10) {
    let swipes = 0;
    while (swipes < maxSwipes) {
      try {
        const el = await this.driver.$(selector);
        if (await el.isDisplayed()) {
          return el;
        }
      } catch {}
      await this.swipe('up', 0.5);
      swipes++;
    }
    throw new Error(`Element [${selector}] not visible after ${maxSwipes} scroll attempts.`);
  }

  /**
   * Pinch / Zoom Gesture Simulation
   */
  async zoom(scale = 1.5) {
    const { width, height } = await this.driver.getWindowSize();
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX - 20, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 400, x: centerX - 150, y: centerY },
          { type: 'pointerUp', button: 0 }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX + 20, y: centerY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 400, x: centerX + 150, y: centerY },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
  }
}

export default MobileGestures;
