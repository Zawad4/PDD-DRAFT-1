# Enterprise Selenium WebDriver & Node.js E2E Test Automation Framework

A production-ready, scalable, and maintainable **End-to-End (E2E) Test Automation Framework** for React applications using **Node.js, Selenium WebDriver, Mocha, Chai, ExcelJS, Mochawesome, Winston Logger**, and **GitHub Actions**.

---

## 🏗️ Framework Architecture

```text
PDD-DRAFT-1/
├── config/
│   ├── config.json              # Centralized environment, browser & timeout settings
│   └── driver-factory.js        # Multi-browser Factory (Chrome, Firefox, Edge, Headed/Headless)
├── utilities/
│   ├── logger.js                # Winston logger (Console + execution.log + error.log)
│   ├── wait-helper.js           # Reusable explicit waits (visibility, clickability, text, url)
│   ├── element-helper.js        # Advanced DOM interaction (click, type, scroll, JS click, selects)
│   ├── screenshot-helper.js     # Automatic failure screenshot & browser log capture
│   ├── excel-reporter.js        # ExcelJS 4-Sheet Report Generator (E2E_Report.xlsx)
│   ├── test-retry.js            # Flaky test retry mechanism
│   └── route-discovery-engine.js# Dynamic React Code Parser (discovers routes, forms & validation rules)
├── pages/                       # Page Object Model (POM) Classes
│   ├── base.page.js             # Base Page Object Class
│   ├── auth.page.js             # Auth, Login, Signup & Role Selection Page Object
│   ├── discovery.page.js        # Discover, Search, Radius Pills (5-50km) & Booking Page Object
│   ├── marketplace.page.js      # Marketplace Browse & List Your Gear Form Page Object
│   ├── venue-manager.page.js    # Owner Dashboard & Add Venue Form Page Object
│   ├── community.page.js        # Sports Feed & Communities Page Object
│   └── profile.page.js          # User Profile Page Object
├── tests/                       # Spec Test Suites
│   ├── base.test.js             # Root Hooks (driver creation, failure screenshots, report generation)
│   ├── auth.spec.js             # Authentication & Form Validation Specs
│   ├── discovery.spec.js        # Discover & Radius Filter Specs
│   ├── marketplace.spec.js      # Marketplace Listing Specs
│   ├── venue-manager.spec.js    # Venue Manager Specs
│   └── dynamic-route-validation.spec.js # Automatically generated dynamic route & form tests
├── data/
│   └── test-data.json           # Data-Driven Test Inputs
├── reports/                     # Generated Mochawesome HTML & JSON Reports
│   ├── excel/
│   │   └── E2E_Report.xlsx      # 4-Sheet Multi-Tab Excel Report
│   └── failures/                # Failure Screenshots & Logs
├── logs/                        # Winston Log Files
├── .github/workflows/
│   └── selenium-e2e.yml         # GitHub Actions CI/CD Pipeline
├── .mocharc.json                # Mocha Test Runner Configuration
├── package.json                 # Node.js dependencies & execution scripts
└── README.md                    # Framework Documentation
```

---

## 🚀 Key Features

1. **Page Object Model (POM)**: Decouples test specs from page locators and DOM interactions for clean maintainability.
2. **Multi-Browser & Dual Execution Mode**: Supports Google Chrome, Firefox, and Microsoft Edge in both **Headed** and **Headless** modes.
3. **Dynamic React Code Discovery Engine**: Scans React codebase (`App.jsx` & `pages/`) at runtime to automatically discover routes, forms, input fields, and validation constraints without needing manual test writing.
4. **4-Sheet Multi-Tab Excel Report (`E2E_Report.xlsx`)**:
   - **Sheet 1: Summary** (Date, Env, Total, Passed, Failed, Skipped, Pass %, Execution Duration)
   - **Sheet 2: Test Cases** (Test ID, Module, Scenario Name, Browser, Status, Duration)
   - **Sheet 3: Failed Tests** (Test Name, Failure Reason, Screenshot Path, Browser, URL)
   - **Sheet 4: Execution Logs** (Timestamp, Test Name, Step Description, Result, Remarks)
5. **Mochawesome HTML Dashboard**: Interactive visual HTML test reports.
6. **Automatic Failure Diagnostics**: On test failure, automatically captures screenshots into `reports/failures/` alongside browser console log diagnostics.
7. **CI/CD Integration**: Pre-configured **GitHub Actions Workflow** (`.github/workflows/selenium-e2e.yml`) to automatically execute tests on push and upload reports as artifacts.

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- Google Chrome / Firefox / Edge browser installed

### 2. Install Dependencies
```bash
npm install
```

---

## 🏃 Test Execution Commands

### Run Full E2E Selenium Test Suite
```bash
npm run test:e2e
```

### Run Cross-Browser Tests (Chrome / Firefox / Edge)
```bash
# Run on Google Chrome
BROWSER=chrome npm run test:e2e

# Run on Firefox
BROWSER=firefox npm run test:e2e

# Run on Microsoft Edge
BROWSER=edge npm run test:e2e
```

### Run in Headed (Visible Browser) Mode
```bash
HEADLESS=false npm run test:e2e
```

---

## 📊 Report Generation

After test execution completes:
- **Excel Report**: Open `reports/excel/E2E_Report.xlsx` in Microsoft Excel.
- **HTML Report**: Open `reports/index.html` in any browser.
- **Failure Screenshots**: View saved images under `reports/failures/`.
- **Log Files**: Check `logs/execution.log` and `logs/error.log`.
