/**
 * Load & Performance Benchmark Test Spec
 */

import { expect } from 'chai';
import loadTester from './loadTester.js';

describe('High Concurrency Load & Performance Benchmark Suite', function () {
  this.timeout(180000);

  it('LOAD_TC_001: Should benchmark 300 concurrent requests and validate throughput SLA', async function () {
    const summary = await loadTester.runLoadBenchmark(300, 50);
    expect(summary).to.be.an('object');
    expect(summary.totalRequests).to.equal(300);

    const passPercentage = parseFloat(summary.passRate);
    expect(passPercentage).to.be.at.least(80.0);
  });

  it('LOAD_TC_002: Should benchmark 100 virtual users baseline load and verify latency SLA', async function () {
    const result = await loadTester.runDurationBenchmark({
      virtualUsers: 100,
      durationSeconds: 30 // 30-second CI run
    });
    expect(result).to.be.an('object');
    expect(result.totalRequests).to.be.greaterThan(500);

    const passPercentage = parseFloat(result.passRate);
    expect(passPercentage).to.be.at.least(90.0);
  });
});
