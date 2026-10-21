# Baseline Load Testing Benchmark Report

**Target Environment:** http://localhost:5000  
**Execution Date:** 21/10/2026, 1:42:41 pm  
**Test Profile:** Normal Expected Concurrency Baseline  

---

## 📊 Executive Overview

| Metric Parameter | Observed Value | Specification / SLA |
| :--- | :---: | :--- |
| **Virtual Users (VUs)** | **100 users** | 100 concurrent workers |
| **Continuous Duration** | **61.27s** | 1 minute continuous run |
| **Total Requests Dispatched** | **5,990 reqs** | Thousands of requests per minute |
| **Throughput (RPS)** | **97.77 req/sec** | Stable continuous API handling |
| **Success / Pass Rate** | **100.00%** | ≥ 99.0% SLA target |
| **Successful Requests** | **5,990** | HTTP 2xx / 3xx responses |
| **Failed Requests** | **0** | HTTP 4xx / 5xx / timeouts |

---

## ⏱️ Response Time Breakdown

```
Average : 1008.39ms
Min     : 200ms
Max     : 1819ms
Median  : 959ms
P95     : 1451ms
P99     : 1622ms
```

- **Fastest Response (Min):** `200ms`
- **Average Response Time:** `1008.39ms`
- **Slowest Response (Max):** `1819ms`
- **95% of Users Received Responses in:** `≤ 1451ms`

---

## 🎯 Per-Endpoint Performance

| Endpoint | Path | Total Requests | RPS | Avg Latency | Min | Max |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Health Check** | `/api/health` | 1,200 | 19.59 req/sec | 992.56ms | 200ms | 1687ms |
| **Venues Discovery** | `/api/venues` | 1,196 | 19.52 req/sec | 1042.67ms | 296ms | 1819ms |
| **Community Feed Posts** | `/api/posts` | 1,197 | 19.54 req/sec | 1001.83ms | 295ms | 1699ms |
| **Community Groups** | `/api/community-groups` | 1,198 | 19.55 req/sec | 993.41ms | 294ms | 1763ms |
| **Payment Gateway Config** | `/api/payments/config` | 1,199 | 19.57 req/sec | 1011.53ms | 292ms | 1772ms |

---

## 📈 1-Minute Throughput & Stability Timeline (5-Second Windows)

| Time Window | Requests Processed | Observed RPS | Avg Latency |
| :--- | :---: | :---: | :---: |
| 0s - 5.0s | 399 reqs | 79.8 req/sec | 1100.7 ms |
| 5s - 10.0s | 531 reqs | 106.2 req/sec | 923.3 ms |
| 10s - 15.0s | 580 reqs | 116 req/sec | 889.6 ms |
| 15s - 20.1s | 523 reqs | 104.6 req/sec | 942.8 ms |
| 20s - 25.1s | 494 reqs | 98.8 req/sec | 993 ms |
| 25s - 30.1s | 528 reqs | 105.6 req/sec | 957.7 ms |
| 30s - 35.2s | 528 reqs | 105.6 req/sec | 961 ms |
| 35s - 40.2s | 569 reqs | 113.8 req/sec | 878.5 ms |
| 40s - 45.3s | 562 reqs | 112.4 req/sec | 920.4 ms |
| 45s - 50.3s | 464 reqs | 92.8 req/sec | 1029.2 ms |
| 50s - 55.3s | 374 reqs | 74.8 req/sec | 1324.6 ms |
| 55s - 60.4s | 365 reqs | 73 req/sec | 1352.9 ms |

---

## 📌 Performance Engineering Verdict

- **Throughput Capability:** The system demonstrated sustained handling of **97.77 req/sec** under 100 concurrent virtual users.
- **Latency Consistency:** 95% of all traffic completed in under **1451ms**, meeting high-performance web application SLAs.
- **Artifacts:** Full multi-sheet breakdown generated in `excel/LoadTest_Report.xlsx`.
