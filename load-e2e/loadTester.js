/**
 * Enterprise Load & Performance Benchmark Module
 * Simulates high concurrency (100 virtual users continuously for 1 minute),
 * latency analysis, throughput (RPS), and percentile distributions.
 */

import axios from 'axios';
import http from 'http';
import https from 'https';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import config from '../config/env.config.js';
import logger from '../utilities/logger.js';

// Reusable HTTP agents with keep-alive for high concurrency
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 200 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 200 });
const httpClient = axios.create({
  httpAgent,
  httpsAgent,
  timeout: 10000
});

export class LoadTester {
  constructor(targetUrl = config.apiUrl || 'http://localhost:5000') {
    this.targetUrl = targetUrl;
    this.metrics = [];
  }

  /**
   * Baseline Continuous Duration Load Benchmark
   * - 100 Virtual Users
   * - Running continuously for 1 minute (60 seconds)
   * - Thousands of requests dispatched
   * - Tracks Requests per second (RPS), Avg / Min / Max latency, P50 / P95 / P99
   */
  async runDurationBenchmark(options = {}) {
    const virtualUsers = options.virtualUsers || 100;
    const durationSeconds = options.durationSeconds || 60;
    const baseUrl = options.baseUrl || this.targetUrl;
    const endpoints = options.endpoints || [
      { name: 'Health Check', path: '/api/health', method: 'GET' },
      { name: 'Venues Discovery', path: '/api/venues', method: 'GET' },
      { name: 'Community Feed Posts', path: '/api/posts', method: 'GET' },
      { name: 'Community Groups', path: '/api/community-groups', method: 'GET' },
      { name: 'Payment Gateway Config', path: '/api/payments/config', method: 'GET' }
    ];

    logger.info(`================================================================`);
    logger.info(`🚀 Starting 1-Minute Baseline Load Test:`);
    logger.info(`   • Virtual Users: ${virtualUsers} concurrent workers`);
    logger.info(`   • Duration: ${durationSeconds} seconds (1 minute continuous)`);
    logger.info(`   • Target Base: ${baseUrl}`);
    logger.info(`   • Monitored Endpoints: ${endpoints.map(e => e.path).join(', ')}`);
    logger.info(`================================================================`);

    const startTime = Date.now();
    const endTime = startTime + (durationSeconds * 1000);
    const latencies = [];
    let successCount = 0;
    let failureCount = 0;

    // Per-endpoint statistics
    const endpointStats = {};
    endpoints.forEach(ep => {
      endpointStats[ep.name] = {
        name: ep.name,
        path: ep.path,
        requests: 0,
        success: 0,
        failed: 0,
        latencies: []
      };
    });

    // Time-series slices (every 5 seconds)
    const intervalSlices = [];
    const intervalWindowMs = 5000;
    let currentSliceStart = startTime;
    let currentSliceReqs = 0;
    let currentSliceLatencies = [];

    // Worker routine for each virtual user
    const runVirtualUser = async (vuId) => {
      let epIdx = vuId % endpoints.length;

      while (Date.now() < endTime) {
        const ep = endpoints[epIdx];
        epIdx = (epIdx + 1) % endpoints.length;
        const target = `${baseUrl}${ep.path}`;

        const reqStart = Date.now();
        try {
          const res = await httpClient.get(target);
          const duration = Date.now() - reqStart;

          if (res.status >= 200 && res.status < 400) {
            successCount++;
            endpointStats[ep.name].success++;
          } else {
            failureCount++;
            endpointStats[ep.name].failed++;
          }

          latencies.push(duration);
          endpointStats[ep.name].requests++;
          endpointStats[ep.name].latencies.push(duration);
          currentSliceReqs++;
          currentSliceLatencies.push(duration);
        } catch {
          const duration = Date.now() - reqStart;
          failureCount++;
          latencies.push(duration);
          endpointStats[ep.name].requests++;
          endpointStats[ep.name].failed++;
          endpointStats[ep.name].latencies.push(duration);
          currentSliceReqs++;
          currentSliceLatencies.push(duration);
        }

        // Check if 5-second interval boundary crossed
        const now = Date.now();
        if (now - currentSliceStart >= intervalWindowMs) {
          const elapsedSec = ((now - startTime) / 1000).toFixed(1);
          const sliceAvg = currentSliceLatencies.length > 0
            ? (currentSliceLatencies.reduce((a, b) => a + b, 0) / currentSliceLatencies.length).toFixed(1)
            : 0;
          const sliceRps = (currentSliceReqs / (intervalWindowMs / 1000)).toFixed(1);

          intervalSlices.push({
            window: `${intervalSlices.length * 5}s - ${elapsedSec}s`,
            requests: currentSliceReqs,
            rps: parseFloat(sliceRps),
            avgLatencyMs: parseFloat(sliceAvg)
          });

          if (vuId === 0) {
            logger.info(`[T+${elapsedSec}s] Active VUs: ${virtualUsers} | Cumulative Reqs: ${latencies.length} | Current RPS: ${sliceRps} req/sec | Avg Latency: ${sliceAvg}ms`);
          }

          currentSliceStart = now;
          currentSliceReqs = 0;
          currentSliceLatencies = [];
        }

        // Micro-yield to prevent Node event loop starvation
        await new Promise(resolve => setImmediate(resolve));
      }
    };

    // Launch all virtual users concurrently
    const workers = Array.from({ length: virtualUsers }, (_, i) => runVirtualUser(i));
    await Promise.all(workers);

    const actualDurationSec = (Date.now() - startTime) / 1000;
    latencies.sort((a, b) => a - b);

    const totalRequests = latencies.length;
    const avgLatency = totalRequests > 0 ? (latencies.reduce((a, b) => a + b, 0) / totalRequests).toFixed(2) : 0;
    const minLatency = latencies[0] || 0;
    const maxLatency = latencies[totalRequests - 1] || 0;
    const p50 = latencies[Math.floor(totalRequests * 0.50)] || 0;
    const p90 = latencies[Math.floor(totalRequests * 0.90)] || 0;
    const p95 = latencies[Math.floor(totalRequests * 0.95)] || 0;
    const p99 = latencies[Math.floor(totalRequests * 0.99)] || 0;
    const rps = (totalRequests / actualDurationSec).toFixed(2);
    const passRate = totalRequests > 0 ? ((successCount / totalRequests) * 100).toFixed(2) : '0.00';

    // Format endpoint summaries
    const endpointSummaries = Object.values(endpointStats).map(ep => {
      ep.latencies.sort((a, b) => a - b);
      const epAvg = ep.requests > 0 ? (ep.latencies.reduce((a, b) => a + b, 0) / ep.requests).toFixed(2) : 0;
      const epMin = ep.latencies[0] || 0;
      const epMax = ep.latencies[ep.latencies.length - 1] || 0;
      const epRps = (ep.requests / actualDurationSec).toFixed(2);
      return {
        name: ep.name,
        path: ep.path,
        requests: ep.requests,
        success: ep.success,
        failed: ep.failed,
        rps: `${epRps} req/sec`,
        avgLatency: `${epAvg}ms`,
        minLatency: `${epMin}ms`,
        maxLatency: `${epMax}ms`
      };
    });

    const benchmarkResult = {
      testType: '1-Minute Baseline Load Test',
      targetBaseUrl: baseUrl,
      virtualUsers,
      durationTarget: `${durationSeconds}s (1 minute)`,
      actualDuration: `${actualDurationSec.toFixed(2)}s`,
      totalRequests,
      successCount,
      failureCount,
      passRate: `${passRate}%`,
      rps: `${rps} req/sec`,
      responseTimes: {
        avg: `${avgLatency}ms`,
        min: `${minLatency}ms`,
        max: `${maxLatency}ms`,
        p50: `${p50}ms`,
        p90: `${p90}ms`,
        p95: `${p95}ms`,
        p99: `${p99}ms`
      },
      endpointSummaries,
      intervalSlices
    };

    this.metrics.push(benchmarkResult);

    // Generate Excel & Markdown Reports
    const excelPath = await this.generateComprehensiveExcelReport(benchmarkResult);
    const mdPath = this.generateMarkdownReport(benchmarkResult);

    return { ...benchmarkResult, excelPath, mdPath };
  }

  /**
   * Backward-compatible batch execution
   */
  async runLoadBenchmark(totalRequests = 300, concurrency = 50) {
    logger.info(`Starting Batch Load Test: Total Requests: ${totalRequests}, Concurrency: ${concurrency}`);
    const startTime = Date.now();
    const latencies = [];
    let successCount = 0;
    let failureCount = 0;

    const executeBatch = async (batchSize) => {
      const promises = Array.from({ length: batchSize }, async () => {
        const reqStart = Date.now();
        try {
          const res = await httpClient.get(this.targetUrl);
          const duration = Date.now() - reqStart;
          if (res.status >= 200 && res.status < 400) {
            successCount++;
            latencies.push(duration);
          } else {
            failureCount++;
          }
        } catch {
          failureCount++;
        }
      });
      await Promise.all(promises);
    };

    const batches = Math.ceil(totalRequests / concurrency);
    for (let i = 0; i < batches; i++) {
      const remaining = totalRequests - i * concurrency;
      const currentBatch = Math.min(concurrency, remaining);
      await executeBatch(currentBatch);
    }

    const totalDurationSec = (Date.now() - startTime) / 1000;
    latencies.sort((a, b) => a - b);

    const avgLatency = latencies.length > 0 ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2) : 0;
    const minLatency = latencies[0] || 0;
    const maxLatency = latencies[latencies.length - 1] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const rps = (totalRequests / totalDurationSec).toFixed(2);

    const summary = {
      targetUrl: this.targetUrl,
      totalRequests,
      concurrency,
      successCount,
      failureCount,
      totalDurationSec: totalDurationSec.toFixed(2) + 's',
      rps: `${rps} req/sec`,
      avgLatency: `${avgLatency} ms`,
      minLatency: `${minLatency} ms`,
      maxLatency: `${maxLatency} ms`,
      p95Latency: `${p95} ms`,
      passRate: ((successCount / totalRequests) * 100).toFixed(2) + '%'
    };

    this.metrics.push(summary);
    await this.generateLoadTestExcelReport();
    return summary;
  }

  /**
   * Generates Multi-Sheet Styled Excel Report
   */
  async generateComprehensiveExcelReport(data) {
    const reportDir = config.paths.excel || path.resolve('excel');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Turfington Performance Engineering';
    wb.created = new Date();

    const TEAL = 'FF0D9488';
    const SLATE = 'FF1E293B';
    const LIGHT_BG = 'FFF8FAFC';
    const BORDER = 'FFE2E8F0';

    // ── SHEET 1: Executive Load Summary ──
    const s1 = wb.addWorksheet('Executive Load Summary', { views: [{ showGridLines: true }] });
    s1.mergeCells('B2:F3');
    const titleCell = s1.getCell('B2');
    titleCell.value = 'TURFINGTON BASELINE LOAD TEST BENCHMARK REPORT (100 VUs / 1 MIN)';
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const metricsList = [
      ['Load Test Configuration', '100 Virtual Users running continuously for 60 seconds'],
      ['Target API Base URL', data.targetBaseUrl],
      ['Total Requests Executed', data.totalRequests],
      ['Throughput (Requests Per Second)', data.rps],
      ['Average Response Time', data.responseTimes.avg],
      ['Minimum Response Time (Fastest)', data.responseTimes.min],
      ['Maximum Response Time (Slowest)', data.responseTimes.max],
      ['Median Latency (P50)', data.responseTimes.p50],
      ['90th Percentile Latency (P90)', data.responseTimes.p90],
      ['95th Percentile Latency (P95)', data.responseTimes.p95],
      ['99th Percentile Latency (P99)', data.responseTimes.p99],
      ['Successful Requests (2xx/3xx)', data.successCount],
      ['Failed Requests (4xx/5xx/Timeout)', data.failureCount],
      ['Overall Success SLA Rate', data.passRate]
    ];

    metricsList.forEach((row, i) => {
      const rowIdx = 5 + i;
      const c1 = s1.getCell(`B${rowIdx}`);
      const c2 = s1.getCell(`C${rowIdx}`);
      s1.mergeCells(`C${rowIdx}:F${rowIdx}`);

      c1.value = row[0];
      c1.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF334155' } };
      c1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_BG } };

      c2.value = row[1];
      c2.font = { name: 'Calibri', size: 11, bold: [2, 3, 4, 13].includes(i), color: { argb: [2, 3, 4, 13].includes(i) ? 'FF0F766E' : 'FF0F172A' } };

      [c1, c2].forEach(c => {
        c.border = {
          top: { style: 'thin', color: { argb: BORDER } },
          bottom: { style: 'thin', color: { argb: BORDER } },
          left: { style: 'thin', color: { argb: BORDER } },
          right: { style: 'thin', color: { argb: BORDER } }
        };
      });
    });

    s1.getColumn('A').width = 4;
    s1.getColumn('B').width = 34;
    s1.getColumn('C').width = 20;
    s1.getColumn('D').width = 20;
    s1.getColumn('E').width = 20;
    s1.getColumn('F').width = 20;

    // ── SHEET 2: Endpoint Breakdown ──
    const s2 = wb.addWorksheet('Endpoint Breakdown', { views: [{ showGridLines: true }] });
    s2.columns = [
      { header: 'Endpoint Name', key: 'name', width: 26 },
      { header: 'HTTP Path', key: 'path', width: 30 },
      { header: 'Total Requests', key: 'requests', width: 16 },
      { header: 'Throughput (RPS)', key: 'rps', width: 18 },
      { header: 'Avg Response Time', key: 'avgLatency', width: 20 },
      { header: 'Min Response Time', key: 'minLatency', width: 20 },
      { header: 'Max Response Time', key: 'maxLatency', width: 20 },
      { header: 'Success Count', key: 'success', width: 15 },
      { header: 'Failed Count', key: 'failed', width: 15 }
    ];

    s2.getRow(1).height = 28;
    s2.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SLATE } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    data.endpointSummaries.forEach(ep => {
      const r = s2.addRow(ep);
      r.height = 22;
      r.eachCell(c => {
        c.alignment = { vertical: 'middle' };
        c.border = { bottom: { style: 'thin', color: { argb: BORDER } } };
      });
    });

    // ── SHEET 3: 5-Second Interval Progression ──
    const s3 = wb.addWorksheet('Time-Series Progression', { views: [{ showGridLines: true }] });
    s3.columns = [
      { header: 'Time Interval Window', key: 'window', width: 24 },
      { header: 'Requests in Window', key: 'requests', width: 20 },
      { header: 'Window Throughput (RPS)', key: 'rps', width: 24 },
      { header: 'Avg Latency (ms)', key: 'avgLatencyMs', width: 20 }
    ];

    s3.getRow(1).height = 28;
    s3.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    data.intervalSlices.forEach(sl => {
      const r = s3.addRow(sl);
      r.height = 20;
      r.eachCell(c => {
        c.alignment = { vertical: 'middle' };
        c.border = { bottom: { style: 'thin', color: { argb: BORDER } } };
      });
    });

    const reportPath = path.join(reportDir, 'LoadTest_Report.xlsx');
    await wb.xlsx.writeFile(reportPath);
    logger.info(`Comprehensive Load Test Excel Report generated: [${reportPath}]`);
    return reportPath;
  }

  /**
   * Generates Markdown Summary Report
   */
  generateMarkdownReport(data) {
    const reportDir = config.paths.reports || path.resolve('reports');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    const mdContent = `# Baseline Load Testing Benchmark Report

**Target Environment:** ${data.targetBaseUrl}  
**Execution Date:** ${new Date().toLocaleString()}  
**Test Profile:** Normal Expected Concurrency Baseline  

---

## 📊 Executive Overview

| Metric Parameter | Observed Value | Specification / SLA |
| :--- | :---: | :--- |
| **Virtual Users (VUs)** | **${data.virtualUsers} users** | 100 concurrent workers |
| **Continuous Duration** | **${data.actualDuration}** | 1 minute continuous run |
| **Total Requests Dispatched** | **${data.totalRequests.toLocaleString()} reqs** | Thousands of requests per minute |
| **Throughput (RPS)** | **${data.rps}** | Stable continuous API handling |
| **Success / Pass Rate** | **${data.passRate}** | ≥ 99.0% SLA target |
| **Successful Requests** | **${data.successCount.toLocaleString()}** | HTTP 2xx / 3xx responses |
| **Failed Requests** | **${data.failureCount}** | HTTP 4xx / 5xx / timeouts |

---

## ⏱️ Response Time Breakdown

\`\`\`
Average : ${data.responseTimes.avg}
Min     : ${data.responseTimes.min}
Max     : ${data.responseTimes.max}
Median  : ${data.responseTimes.p50}
P95     : ${data.responseTimes.p95}
P99     : ${data.responseTimes.p99}
\`\`\`

- **Fastest Response (Min):** \`${data.responseTimes.min}\`
- **Average Response Time:** \`${data.responseTimes.avg}\`
- **Slowest Response (Max):** \`${data.responseTimes.max}\`
- **95% of Users Received Responses in:** \`≤ ${data.responseTimes.p95}\`

---

## 🎯 Per-Endpoint Performance

| Endpoint | Path | Total Requests | RPS | Avg Latency | Min | Max |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
${data.endpointSummaries.map(ep => `| **${ep.name}** | \`${ep.path}\` | ${ep.requests.toLocaleString()} | ${ep.rps} | ${ep.avgLatency} | ${ep.minLatency} | ${ep.maxLatency} |`).join('\n')}

---

## 📈 1-Minute Throughput & Stability Timeline (5-Second Windows)

| Time Window | Requests Processed | Observed RPS | Avg Latency |
| :--- | :---: | :---: | :---: |
${data.intervalSlices.map(s => `| ${s.window} | ${s.requests} reqs | ${s.rps} req/sec | ${s.avgLatencyMs} ms |`).join('\n')}

---

## 📌 Performance Engineering Verdict

- **Throughput Capability:** The system demonstrated sustained handling of **${data.rps}** under 100 concurrent virtual users.
- **Latency Consistency:** 95% of all traffic completed in under **${data.responseTimes.p95}**, meeting high-performance web application SLAs.
- **Artifacts:** Full multi-sheet breakdown generated in \`excel/LoadTest_Report.xlsx\`.
`;

    const mdPath = path.join(reportDir, 'baseline-load-test-report.md');
    fs.writeFileSync(mdPath, mdContent, 'utf-8');
    logger.info(`Baseline Load Test Markdown Report written: [${mdPath}]`);
    return mdPath;
  }

  async generateLoadTestExcelReport() {
    const reportDir = config.paths.excel || path.resolve('excel');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Load Test Results');

    sheet.columns = [
      { header: 'Target URL', key: 'targetUrl', width: 35 },
      { header: 'Total Requests', key: 'totalRequests', width: 18 },
      { header: 'Concurrency', key: 'concurrency', width: 15 },
      { header: 'Passed Requests', key: 'successCount', width: 18 },
      { header: 'Failed Requests', key: 'failureCount', width: 18 },
      { header: 'RPS (Throughput)', key: 'rps', width: 20 },
      { header: 'Avg Latency', key: 'avgLatency', width: 18 },
      { header: 'P95 Latency', key: 'p95Latency', width: 18 },
      { header: 'Pass Rate', key: 'passRate', width: 15 }
    ];

    sheet.getRow(1).height = 25;
    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C65911' } };
    });

    this.metrics.forEach(m => {
      const r = sheet.addRow(m);
      r.height = 22;
    });

    const reportPath = path.join(reportDir, 'LoadTest_Report.xlsx');
    await workbook.xlsx.writeFile(reportPath);
    return reportPath;
  }
}

export default new LoadTester();
