/**
 * CLI Runner: Baseline / Load Testing Suite
 * Simulates 100 virtual users running continuously for 1 minute
 */

import loadTester from './loadTester.js';
import config from '../config/env.config.js';

// Parse command line arguments
const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue;
}

const virtualUsers = parseInt(getArg('--users', '100'), 10);
const durationSeconds = parseInt(getArg('--duration', '60'), 10);
const baseUrl = getArg('--url', config.apiUrl || 'http://localhost:5000');

async function main() {
  console.log(`\n================================================================`);
  console.log(`  BASELINE / LOAD TESTING: 100 CONCURRENT VIRTUAL USERS (1 MIN)`);
  console.log(`================================================================`);
  console.log(`• Virtual Users: ${virtualUsers} concurrent users`);
  console.log(`• Duration     : ${durationSeconds} seconds (1 minute continuous)`);
  console.log(`• Target Host  : ${baseUrl}`);
  console.log(`• Goal         : Test normal, expected concurrent load and ensure fast response times\n`);

  try {
    const result = await loadTester.runDurationBenchmark({
      virtualUsers,
      durationSeconds,
      baseUrl
    });

    console.log(`\n================================================================`);
    console.log(`  BASELINE LOAD TEST EXECUTION RESULTS`);
    console.log(`================================================================\n`);

    console.log(`Requests per second (RPS)`);
    console.log(`-------------------------`);
    console.log(`Total Requests Processed : ${result.totalRequests.toLocaleString()}`);
    console.log(`Observed Throughput      : ${result.rps}`);
    console.log(`Meaning: Your API handled ${result.rps.split(' ')[0]} requests every second under ${virtualUsers} concurrent users.\n`);

    console.log(`Response Time`);
    console.log(`-------------`);
    console.log(`Average : ${result.responseTimes.avg}`);
    console.log(`Min     : ${result.responseTimes.min}`);
    console.log(`Max     : ${result.responseTimes.max}`);
    console.log(`P95     : ${result.responseTimes.p95}`);
    console.log(`Meaning:`);
    console.log(`• Fastest response = ${result.responseTimes.min}`);
    console.log(`• Average          = ${result.responseTimes.avg}`);
    console.log(`• Slowest (Peak)   = ${result.responseTimes.max}`);
    console.log(`• 95% of requests  = completed under ${result.responseTimes.p95}\n`);

    console.log(`Success SLA`);
    console.log(`-----------`);
    console.log(`• Passed Requests  : ${result.successCount.toLocaleString()}`);
    console.log(`• Failed Requests  : ${result.failureCount.toLocaleString()}`);
    console.log(`• Overall Pass Rate: ${result.passRate}\n`);

    console.log(`Per-Endpoint Performance Breakdown:`);
    console.table(result.endpointSummaries.map(ep => ({
      'Endpoint': ep.name,
      'Path': ep.path,
      'Requests': ep.requests,
      'Throughput': ep.rps,
      'Avg Latency': ep.avgLatency,
      'Min': ep.minLatency,
      'Max': ep.maxLatency
    })));

    console.log(`\nGenerated Artifacts:`);
    console.log(`1. Excel Workbook : ${result.excelPath}`);
    console.log(`2. Markdown Report: ${result.mdPath}\n`);

  } catch (error) {
    console.error(`❌ Load Test Encountered An Error:`, error.message);
    process.exit(1);
  }
}

main();
