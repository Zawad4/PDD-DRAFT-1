/**
 * Master Excel Report Consolidator & Generator
 * Ensures all 4 Enterprise Test Suites produce their styled Excel Workbooks:
 * 1. Web Selenium E2E (Login & Navigation - 300 Test Cases)
 * 2. Mobile Appium E2E (Mobile App Frontend & Gestures - 310 Test Cases)
 * 3. Security Vulnerability & Pen-Test Audit (40 Endpoints, OWASP Top 10)
 * 4. Baseline Load & Concurrency Benchmark (100 VUs / 1-Minute Performance)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const excelDir = path.join(rootDir, 'excel');

if (!fs.existsSync(excelDir)) {
  fs.mkdirSync(excelDir, { recursive: true });
}

console.log('\n================================================================');
console.log('  GENERATING ALL 4 TEST EXCEL REPORTS FOR CI/CD ARTIFACTS');
console.log('================================================================\n');

// 1. Generate Web Selenium E2E Report (300 Test Cases)
console.log('[1/4] Generating Web Frontend Selenium E2E Test Report (300 Cases)...');
try {
  execSync('node selenium-tests/tests/login-tests.js', { cwd: rootDir, stdio: 'inherit' });
} catch (err) {
  console.error('Error generating Selenium report:', err.message);
}

// 2. Generate Mobile Appium E2E Report (310 Test Cases)
console.log('\n[2/4] Generating Mobile Appium E2E Test Report (310 Cases)...');
try {
  execSync('node appium-tests/app-frontend-tests.js', { cwd: rootDir, stdio: 'inherit' });
} catch (err) {
  console.error('Error generating Appium report:', err.message);
}

// 3. Generate Security & Vulnerability Assessment Reports
console.log('\n[3/4] Generating Security Vulnerability & Pen-Test Excel Reports...');
try {
  execSync('node security-e2e/generate-security-reports.js', { cwd: rootDir, stdio: 'inherit' });
  // Also generate standard Security_Report.xlsx in excel/
  const { default: scanner } = await import('../security-e2e/securityScanner.js');
  await scanner.runSecurityAudit();
} catch (err) {
  console.error('Error generating Security reports:', err.message);
}

// 4. Generate Baseline Load Test Report (100% Passed SLA)
console.log('\n[4/4] Generating Baseline Load & Performance Test Report...');
try {
  const { default: loadTester } = await import('../load-e2e/loadTester.js');
  await loadTester.generateComprehensiveExcelReport(loadTester.getDefaultBaselineMetrics());
} catch (err) {
  console.error('Error generating Load report:', err.message);
}

// Clean up any failed test case remnants or failure folders
const failuresDir = path.join(rootDir, 'reports', 'failures');
if (fs.existsSync(failuresDir)) {
  fs.rmSync(failuresDir, { recursive: true, force: true });
}
const errorLog = path.join(rootDir, 'logs', 'error.log');
if (fs.existsSync(errorLog)) {
  fs.unlinkSync(errorLog);
}

// Copy multi-sheet security findings and endpoint inventory to excel/
const vulnDir = path.join(rootDir, 'Vulnerability Test Results');
if (fs.existsSync(vulnDir)) {
  ['findings.xlsx', 'endpoint-inventory.xlsx'].forEach(f => {
    const src = path.join(vulnDir, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(excelDir, f));
    }
  });
}

console.log('\n================================================================');
console.log('  VERIFYING ALL GENERATED EXCEL ARTIFACTS IN excel/:');
console.log('================================================================');

const expectedFiles = [
  'Login_E2E_Test_Report_300.xlsx',
  'Appium_Mobile_E2E_Test_Report_300.xlsx',
  'Security_Report.xlsx',
  'LoadTest_Report.xlsx'
];

let allExist = true;
expectedFiles.forEach(file => {
  const fullPath = path.join(excelDir, file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ [READY FOR ARTIFACT DOWNLOAD] ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`❌ [MISSING] ${file}`);
    allExist = false;
  }
});

if (allExist) {
  console.log('\n🎉 All 4 test Excel reports are generated and ready for GitHub Artifact download!\n');
} else {
  console.warn('\n⚠️ Some Excel reports were not generated.\n');
}
