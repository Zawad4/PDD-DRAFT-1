import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import config from '../config/config.json' with { type: 'json' };
import { logger } from './logger.js';

export class ExcelReporter {
  constructor() {
    this.results = [];
    this.failures = [];
    this.logs = [];
    this.startTime = new Date();
  }

  /**
   * Records a test execution result.
   */
  addTestResult(result) {
    this.results.push(result);
    if (result.status === 'FAILED') {
      this.failures.push({
        testName: result.scenarioName,
        failureReason: result.error || 'Assertion/Timeout Failure',
        screenshotPath: result.screenshotPath || 'N/A',
        browser: result.browser,
        url: result.url || 'N/A'
      });
    }
  }

  /**
   * Adds an execution log entry.
   */
  addLogEntry(testName, stepDescription, result, remarks = '') {
    this.logs.push({
      timestamp: new Date().toISOString(),
      testName,
      stepDescription,
      result,
      remarks
    });
  }

  /**
   * Generates the multi-sheet E2E Excel Report file.
   */
  async generateReport() {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'QA Automation Framework';
      workbook.lastModifiedBy = 'QA Automation Engine';
      workbook.created = new Date();

      const totalTests = this.results.length;
      const passed = this.results.filter(r => r.status === 'PASSED').length;
      const failed = this.results.filter(r => r.status === 'FAILED').length;
      const skipped = this.results.filter(r => r.status === 'SKIPPED').length;
      const passPercentage = totalTests > 0 ? ((passed / totalTests) * 100).toFixed(2) + '%' : '0%';
      const durationSeconds = Math.round((new Date() - this.startTime) / 1000);

      // ── SHEET 1: SUMMARY ──
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Execution Date', key: 'execDate', width: 22 },
        { header: 'Environment', key: 'env', width: 18 },
        { header: 'Total Tests', key: 'total', width: 14 },
        { header: 'Passed', key: 'passed', width: 12 },
        { header: 'Failed', key: 'failed', width: 12 },
        { header: 'Skipped', key: 'skipped', width: 12 },
        { header: 'Pass Percentage', key: 'passRate', width: 18 },
        { header: 'Execution Duration', key: 'duration', width: 22 }
      ];

      summarySheet.addRow({
        execDate: new Date().toLocaleString(),
        env: config.environment || 'QA',
        total: totalTests,
        passed,
        failed,
        skipped,
        passRate: passPercentage,
        duration: `${durationSeconds} seconds`
      });

      // Style Header Row
      summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F497D' } };

      // ── SHEET 2: TEST CASES ──
      const casesSheet = workbook.addWorksheet('Test Cases');
      casesSheet.columns = [
        { header: 'Test ID', key: 'testId', width: 14 },
        { header: 'Module', key: 'module', width: 20 },
        { header: 'Scenario Name', key: 'scenarioName', width: 45 },
        { header: 'Browser', key: 'browser', width: 14 },
        { header: 'Status', key: 'status', width: 14 },
        { header: 'Start Time', key: 'startTime', width: 22 },
        { header: 'End Time', key: 'endTime', width: 22 },
        { header: 'Duration', key: 'duration', width: 14 }
      ];

      this.results.forEach((r, idx) => {
        const row = casesSheet.addRow({
          testId: r.testId || `TC_${String(idx + 1).padStart(3, '0')}`,
          module: r.module || 'E2E',
          scenarioName: r.scenarioName,
          browser: r.browser || config.browser,
          status: r.status,
          startTime: r.startTime || '-',
          endTime: r.endTime || '-',
          duration: `${r.duration || 0} ms`
        });

        const statusCell = row.getCell('status');
        if (r.status === 'PASSED') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } };
          statusCell.font = { color: { argb: '006100' }, bold: true };
        } else if (r.status === 'FAILED') {
          statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } };
          statusCell.font = { color: { argb: '9C0006' }, bold: true };
        }
      });

      casesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      casesSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F497D' } };

      // ── SHEET 3: FAILED TESTS ──
      const failuresSheet = workbook.addWorksheet('Failed Tests');
      failuresSheet.columns = [
        { header: 'Test Name', key: 'testName', width: 40 },
        { header: 'Failure Reason', key: 'failureReason', width: 50 },
        { header: 'Screenshot Path', key: 'screenshotPath', width: 45 },
        { header: 'Browser', key: 'browser', width: 14 },
        { header: 'URL', key: 'url', width: 40 }
      ];

      this.failures.forEach(f => {
        failuresSheet.addRow(f);
      });

      failuresSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      failuresSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '9C0006' } };

      // ── SHEET 4: EXECUTION LOGS ──
      const logsSheet = workbook.addWorksheet('Execution Logs');
      logsSheet.columns = [
        { header: 'Timestamp', key: 'timestamp', width: 24 },
        { header: 'Test Name', key: 'testName', width: 35 },
        { header: 'Step Description', key: 'stepDescription', width: 50 },
        { header: 'Result', key: 'result', width: 14 },
        { header: 'Remarks', key: 'remarks', width: 35 }
      ];

      this.logs.forEach(l => {
        logsSheet.addRow(l);
      });

      logsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
      logsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F497D' } };

      // Save Report to Excel File
      const excelDir = path.resolve('reports/excel');
      if (!fs.existsSync(excelDir)) {
        fs.mkdirSync(excelDir, { recursive: true });
      }

      const reportPath = path.join(excelDir, 'E2E_Report.xlsx');
      await workbook.xlsx.writeFile(reportPath);
      logger.info(`Excel Report generated successfully: ${reportPath}`);
      return reportPath;
    } catch (error) {
      logger.error(`Failed to generate Excel report: ${error.message}`);
      throw error;
    }
  }
}

export const globalExcelReporter = new ExcelReporter();
export default globalExcelReporter;

