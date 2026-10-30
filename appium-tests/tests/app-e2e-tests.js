/**
 * Turfington Appium Mobile Tests Spec Entrypoint
 * Re-exports and executes the comprehensive 310 test case suite.
 */

import { generate310AppiumTestCases, generateAppiumExcelReport } from '../appium-tests.js';

async function run() {
  console.log('[APPIUM SUITE] Executing 310 Automated Mobile E2E Test Cases...');
  const tests = generate310AppiumTestCases();
  await generateAppiumExcelReport(tests);
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('app-e2e-tests.js')) {
  run().catch(err => {
    console.error('Appium Test Run Failed:', err);
    process.exit(1);
  });
}

export { generate310AppiumTestCases, generateAppiumExcelReport };

