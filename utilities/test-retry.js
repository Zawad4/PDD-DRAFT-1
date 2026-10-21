import { logger } from './logger.js';
import config from '../config/config.json' with { type: 'json' };

export async function executeWithRetry(fn, maxRetries = config.retries || 2, delayMs = 1000) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      attempt++;
      return await fn();
    } catch (error) {
      if (attempt > maxRetries) {
        logger.error(`Exceeded maximum retry attempts (${maxRetries}): ${error.message}`);
        throw error;
      }
      logger.warn(`Retry attempt ${attempt}/${maxRetries} failed: ${error.message}. Retrying in ${delayMs}ms...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
}
