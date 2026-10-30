# Baseline Load Testing Benchmark Report

**Target Environment:** http://localhost:5000  
**Execution Date:** 31/10/2026, 1:01:37 am  
**Test Profile:** Normal Expected Concurrency Baseline  

---

## 📊 Executive Overview

| Metric Parameter | Observed Value | Specification / SLA |
| :--- | :---: | :--- |
| **Virtual Users (VUs)** | **100 users** | 100 concurrent workers |
| **Continuous Duration** | **60.01s** | 1 minute continuous run |
| **Total Requests Dispatched** | **2,36,702 reqs** | Thousands of requests per minute |
| **Throughput (RPS)** | **3944.24 req/sec** | Stable continuous API handling |
| **Success / Pass Rate** | **100.00%** | ≥ 99.0% SLA target |
| **Successful Requests** | **2,36,702** | HTTP 2xx / 3xx responses |
| **Failed Requests** | **0** | HTTP 4xx / 5xx / timeouts |

---

## ⏱️ Response Time Breakdown

```
Average : 13.59ms
Min     : 6ms
Max     : 98ms
Median  : 12ms
P95     : 22ms
P99     : 29ms
```

- **Fastest Response (Min):** `6ms`
- **Average Response Time:** `13.59ms`
- **Slowest Response (Max):** `98ms`
- **95% of Users Received Responses in:** `≤ 22ms`

---

## 🎯 Per-Endpoint Performance

| Endpoint | Path | Total Requests | RPS | Avg Latency | Min | Max |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Health Check** | `/api/health` | 47,341 | 788.86 req/sec | 13.51ms | 7ms | 98ms |
| **Venues Discovery** | `/api/venues` | 47,341 | 788.86 req/sec | 13.67ms | 7ms | 84ms |
| **Community Feed Posts** | `/api/posts` | 47,340 | 788.84 req/sec | 13.66ms | 7ms | 83ms |
| **Community Groups** | `/api/community-groups` | 47,341 | 788.86 req/sec | 13.59ms | 7ms | 83ms |
| **Payment Gateway Config** | `/api/payments/config` | 47,339 | 788.83 req/sec | 13.54ms | 6ms | 83ms |

---

## 📈 1-Minute Throughput & Stability Timeline (5-Second Windows)

| Time Window | Requests Processed | Observed RPS | Avg Latency |
| :--- | :---: | :---: | :---: |
| 0s - 5.0s | 16090 reqs | 3218 req/sec | 16.8 ms |
| 5s - 10.0s | 18449 reqs | 3689.8 req/sec | 14.8 ms |
| 10s - 15.0s | 18021 reqs | 3604.2 req/sec | 14.9 ms |
| 15s - 20.0s | 20329 reqs | 4065.8 req/sec | 13.1 ms |
| 20s - 25.0s | 20628 reqs | 4125.6 req/sec | 13.1 ms |
| 25s - 30.0s | 20972 reqs | 4194.4 req/sec | 12.8 ms |
| 30s - 35.0s | 19982 reqs | 3996.4 req/sec | 13.4 ms |
| 35s - 40.0s | 20579 reqs | 4115.8 req/sec | 12.8 ms |
| 40s - 45.0s | 20716 reqs | 4143.2 req/sec | 12.9 ms |
| 45s - 50.0s | 20778 reqs | 4155.6 req/sec | 12.9 ms |
| 50s - 55.0s | 20385 reqs | 4077 req/sec | 13.1 ms |

---

## 📌 Performance Engineering Verdict

- **Throughput Capability:** The system demonstrated sustained handling of **3944.24 req/sec** under 100 concurrent virtual users.
- **Latency Consistency:** 95% of all traffic completed in under **22ms**, meeting high-performance web application SLAs.
- **Artifacts:** Full multi-sheet breakdown generated in `excel/LoadTest_Report.xlsx`.
