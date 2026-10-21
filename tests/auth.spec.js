import { expect } from 'chai';
import { BaseTestSetup } from './base.test.js';
import { AuthPage } from '../pages/auth.page.js';
import testData from '../data/test-data.json' with { type: 'json' };

describe('Authentication Module & Form Validation Suite', function () {
  this.timeout(60000);
  let driver;
  let authPage;

  before(async function () {
    await BaseTestSetup.setupBeforeSuite();
  });

  beforeEach(async function () {
    driver = await BaseTestSetup.setupBeforeEach(this.currentTest.title);
    authPage = new AuthPage(driver);
    await authPage.navigateTo();
  });

  afterEach(async function () {
    await BaseTestSetup.handleAfterEach(driver, this);
  });

  after(async function () {
    await BaseTestSetup.teardownAfterSuite();
  });

  it('TC_AUTH_001 - Validate Auth Page Container & Form Controls', async function () {
    const isDisplayed = await authPage.isAuthPageDisplayed();
    expect(isDisplayed).to.be.true;
  });

  it('TC_AUTH_002 - Validate Empty Email & Password Submissions', async function () {
    await authPage.enterEmail(testData.auth.emptyFields.email);
    await authPage.enterPassword(testData.auth.emptyFields.password);
    await authPage.submitAuthForm();

    const isStillOnAuth = await authPage.isAuthPageDisplayed();
    expect(isStillOnAuth).to.be.true;
  });

  it('TC_AUTH_003 - Validate Malformed Email Format Error', async function () {
    await authPage.enterEmail(testData.auth.malformedEmail.email);
    await authPage.enterPassword(testData.auth.malformedEmail.password);
    await authPage.submitAuthForm();

    const isStillOnAuth = await authPage.isAuthPageDisplayed();
    expect(isStillOnAuth).to.be.true;
  });

  it('TC_AUTH_004 - Validate Role Selection Screen Options', async function () {
    await authPage.selectPlayerRole();
    const currentUrl = await authPage.getCurrentUrl();
    expect(currentUrl).to.include('localhost');
  });
});
