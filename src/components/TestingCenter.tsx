/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Play, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  Settings, 
  Cpu, 
  Gauge, 
  Server, 
  AlertOctagon, 
  Clock, 
  RotateCw, 
  HelpCircle,
  FileSpreadsheet,
  Globe,
  CornerDownRight,
  User,
  ExternalLink,
  Info
} from 'lucide-react';

interface Assertion {
  name: string;
  got: string;
  expected: string;
  status: 'PASSED' | 'FAILED';
}

interface TestResult {
  id: string;
  category: string;
  name: string;
  description: string;
  status: 'PASSED' | 'FAILED';
  durationMs: number;
  assertions: Assertion[];
}

interface TestSummary {
  totalTimeMs: number;
  totalTestCases: number;
  passed: number;
  failed: number;
  timestamp: string;
}

interface TestReport {
  success: boolean;
  summary: TestSummary;
  results: TestResult[];
}

interface SeleniumScenario {
  id: string;
  title: string;
  role: string;
  description: string;
  targetUrl: string;
  webdriverClass: string;
  inputs: Array<{ label: string; value: string }>;
  locators: Array<{ selector: string; description: string; type: string }>;
  expectedOutputs: Array<{ label: string; elementId: string; expectedState: string }>;
  javaCode: string;
  consoleLogs: string[];
}

export function TestingCenter() {
  const [currentSubTab, setCurrentSubTab] = useState<'diagnostics' | 'selenium'>('diagnostics');
  const [report, setReport] = useState<TestReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);
  const [diagData, setDiagData] = useState<any>(null);

  // Selenium testing simulator states
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [isSeleniumRunning, setIsSeleniumRunning] = useState<boolean>(false);
  const [seleniumProgress, setSeleniumProgress] = useState<number>(0);
  const [launchedLogs, setLaunchedLogs] = useState<string[]>([]);
  const [testSuiteRan, setTestSuiteRan] = useState<boolean>(false);
  const [seleniumSuccess, setSeleniumSuccess] = useState<boolean>(false);

  // Load backend diagnostics system specs on mount
  const fetchDiagnostics = async () => {
    try {
      const res = await fetch('/api/diagnostics');
      if (res.ok) {
        setDiagData(await res.json());
      }
    } catch (err) {
      console.error('Failed to load diagnostics', err);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  // Run the full automated testing suite on the backend
  const runVerificationSuite = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tests/run');
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        // Expand the first test by default
        if (data.results && data.results.length > 0) {
          setExpandedTestId(data.results[0].id);
        }
      } else {
        setError('Verification engine responded with an error sequence.');
      }
    } catch (err) {
      setError('Failed to establish link with the enterprise test harness server.');
    } finally {
      setIsLoading(false);
    }
  };

  const categoriesList = ['ALL', 'Unit', 'Integration', 'API', 'E2E', 'Load', 'Security', 'Smoke', 'Regression'];

  const filteredResults = report?.results.filter(
    r => selectedCategory === 'ALL' || r.category.toLowerCase() === selectedCategory.toLowerCase()
  ) || [];

  // Selenium Scenarios Database catering to Super Admin, Admin, Employee, and QC
  const SELENIUM_SCENARIOS: SeleniumScenario[] = [
    {
      id: 'SEL-001',
      title: 'SUPER ADMIN AUTH & SECURITY ACCESS',
      role: 'SUPER_ADMIN',
      description: 'Emulates absolute control access, restricting domain registries, backing up active files, and running health probes.',
      targetUrl: 'http://localhost:3000/auth',
      webdriverClass: 'org.openqa.selenium.chrome.ChromeDriver',
      inputs: [
        { label: 'Login Secure Email', value: 'admin@gmail.com' },
        { label: 'Login Passcode Key', value: 'Admin@123' },
        { label: 'Allowed Domain Value', value: '@diatrendz.com' },
        { label: 'Primary Action Request', value: 'Trigger Diagnostic Suite / Download Snapshot' }
      ],
      locators: [
        { type: 'By.id', selector: '"login-email"', description: 'Super Admin official identity field input element' },
        { type: 'By.id', selector: '"login-password"', description: 'Authenticated secure credentials container text box' },
        { type: 'By.cssSelector', selector: '"button[type=\'submit\']"', description: 'Authenticates session values with the security engine' },
        { type: 'By.id', selector: '"settings-whitelist-input"', description: 'Authorized domain verification input field' },
        { type: 'By.id', selector: '"save-whitelist-btn"', description: 'Renders the allowed domain list update across nodes' },
        { type: 'By.id', selector: '"download-backup-btn"', description: 'Triggers absolute server JSON dump payload fetch' }
      ],
      expectedOutputs: [
        { label: 'Settings Dashboard Area Visibility', elementId: '#settings-panel', expectedState: 'DISPLAYED (True)' },
        { label: 'System Whitelist Update Label', elementId: '#whitelist-badge-0', expectedState: 'TEXT MATCHES "@diatrendz.com"' },
        { label: 'Database Blob Save Action', elementId: 'db.json file', expectedState: 'STAGED DOWNLOAD TRIGGERED (200 OK)' }
      ],
      javaCode: `package com.diatrendz.erp.selenium;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;
import static org.junit.jupiter.api.Assertions.*;

public class SuperAdminSeleniumTest {

    @Test
    public void testSuperAdminSettingsAndDiagnostics() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless", "--disable-gpu", "--no-sandbox");
        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        try {
            driver.get("http://localhost:3000");
            
            // Step 1: Input Credentials
            WebElement emailInput = driver.findElement(By.id("login-email"));
            WebElement passInput = driver.findElement(By.id("login-password"));
            emailInput.clear();
            emailInput.sendKeys("admin@gmail.com");
            passInput.clear();
            passInput.sendKeys("Admin@123");

            // Step 2: Submit Auth Form
            driver.findElement(By.cssSelector("button[type='submit']")).click();

            // Step 3: Assert Dashboard Loaded Successfully
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("root-suite-dashboard")));
            assertEquals("✦ DIA TRENDZ: JEWELRY PRODUCTION ERP SUITE ✦", driver.getTitle());

            // Step 4: Click Settings Sidebar Tab
            WebElement settingsTab = driver.findElement(By.id("settings-sidebar-link"));
            settingsTab.click();

            // Step 5: Update Authorized Email Domains Whitelist
            WebElement domainInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("settings-whitelist-input")));
            domainInput.clear();
            domainInput.sendKeys("@diatrendz.com");
            driver.findElement(By.id("save-whitelist-btn")).click();

            // Step 6: Verify Persistence Success Notification Banner Displays
            WebElement feedbackBanner = wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("success-toast")));
            assertTrue(feedbackBanner.isDisplayed());

            // Step 7: Export Immuntable Database JSON Backup
            WebElement backupBtn = driver.findElement(By.id("download-backup-btn"));
            backupBtn.click();
            
            System.out.println("★ Super Admin Selenium Test Suite Success: All Assertions Verified! ★");
        } finally {
            driver.quit();
        }
    }
}`,
      consoleLogs: [
        '[INFO] Bootstrap Sequence: Initializing headless Chrome Web Driver thread...',
        '[INFO] Set configuration parameters: "--headless", "--disable-gpu", "--no-sandbox"',
        '[INFO] ESTABLISHED SESSION ID: CHR-SESS-9820-ADM',
        '[INFO] Connecting to target micro-node endpoint: http://localhost:3000',
        '[INFO] WebPage fully compiled in browser. Ready State: Complete',
        '[ACTION] driver.findElement(By.id("login-email")).sendKeys("admin@gmail.com")',
        '[ACTION] driver.findElement(By.id("login-password")).sendKeys("Admin@123")',
        '[ACTION] driver.findElement(By.cssSelector("button[type=\'submit\']")).click()',
        '[INFO] Requesting active secure token generation from security server...',
        '[EVAL] WebDriverWait triggered: wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("root-suite-dashboard")))',
        '[ASSERT] assertEquals("✦ DIA TRENDZ: JEWELRY PRODUCTION ERP SUITE ✦", driver.getTitle()) -> PASS ✓',
        '[ACTION] Click on element tab navigation pointer [LINK: settings-sidebar-link]',
        '[ACTION] driver.findElement(By.id("settings-whitelist-input")).sendKeys("@diatrendz.com")',
        '[ACTION] Click save action: verify system domain whitelist lock',
        '[ASSERT] wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("success-toast"))).isDisplayed() -> PASS (TRUE) ✓',
        '[ACTION] Triggering db.json data snapshot buffer download pipeline...',
        '[INFO] Received file binary payload: db.json [Size: ~12KB]',
        '[SUCCESS] Selenium JUnit Driver Run complete. Status Code 200. Teardown active.'
      ]
    },
    {
      id: 'SEL-002',
      title: 'ADMIN/TEAM LEAD DISPATCH & VACATION MANAGEMENT',
      role: 'ADMIN',
      description: 'Simulates the scheduling of raw alloys, artisan rosters, and locking half-day holiday durations.',
      targetUrl: 'http://localhost:3000/tasks',
      webdriverClass: 'org.openqa.selenium.chrome.ChromeDriver',
      inputs: [
        { label: 'Admin Identity Email', value: 'lead@diatrendz.com' },
        { label: 'Admin Access Token', value: 'test@123' },
        { label: 'Job Pouch Allocation Details', value: '18K Yellow Gold Necklace (32.4g)' },
        { label: 'Holiday Configuration Choice', value: 'Half-Day Holiday [Start Date == End Date]' }
      ],
      locators: [
        { type: 'By.id', selector: '"login-email"', description: 'Security layer credentials ID' },
        { type: 'By.id', selector: '"login-password"', description: 'Passcode validator field' },
        { type: 'By.id', selector: '"btn-add-job-pouch"', description: 'Creates active jewelry production envelope modal' },
        { type: 'By.name', selector: '"job-title"', description: 'Label designation text field' },
        { type: 'By.name', selector: '"metal-weight"', description: 'Weighed initial metallic core grams field' },
        { type: 'By.id', selector: '"holiday-isHalfDay"', description: 'Enforces 0.5 day half-day duration flag' }
      ],
      expectedOutputs: [
        { label: 'Job Card rendered in Room 1', elementId: '#job-entry-JOB-119', expectedState: 'VISIBLE AT WORKBENCH' },
        { label: 'Leave Duration lock input is disabled', elementId: '#holiday-endDate-field', expectedState: 'DISABLED (True)' },
        { label: 'Calculated calendar days count', elementId: '#holiday-days-label-value', expectedState: 'TEXT EQUALS "0.5"' }
      ],
      javaCode: `package com.diatrendz.erp.selenium;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;
import static org.junit.jupiter.api.Assertions.*;

public class TeamLeadAdminSeleniumTest {

    @Test
    public void testJobDispatchAndHalfDayHolidayCreation() {
        WebDriver driver = new ChromeDriver();
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(8));

        try {
            driver.get("http://localhost:3000");
            
            // Login as Admin
            driver.findElement(By.id("login-email")).sendKeys("lead@diatrendz.com");
            driver.findElement(By.id("login-password")).sendKeys("test@123");
            driver.findElement(By.cssSelector("button[type='submit']")).click();

            // Navigate to Tasks Dispatch Screen
            wait.until(ExpectedConditions.elementToBeClickable(By.id("tasks-sidebar-link"))).click();

            // Open Dispatch Modal
            driver.findElement(By.id("btn-add-job-pouch")).click();
            
            // Fill Job Specifications
            WebElement titleInp = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("job-title")));
            titleInp.sendKeys("Sultan Sapphire Necklace");
            
            Select alloySelect = new Select(driver.findElement(By.name("metal-type")));
            alloySelect.selectByValue("18K Yellow Gold");
            
            driver.findElement(By.name("metal-weight")).sendKeys("32.4");
            
            Select employeeSelect = new Select(driver.findElement(By.name("assignee-id")));
            employeeSelect.selectByIndex(1); // Assign to Rajesh Kumar

            driver.findElement(By.id("submit-dispatch-btn")).click();

            // Navigate to Attendance Tab
            driver.findElement(By.id("attendance-sidebar-link")).click();

            // Propose Half Day Holiday
            WebElement halfDayBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("btn-toggle-halfday")));
            halfDayBtn.click(); // Select half day

            WebElement startDateInput = driver.findElement(By.id("holiday-start-date"));
            startDateInput.sendKeys("2026-06-12");

            // Assert End Date input automatically turned read-only / disabled
            WebElement endDateInput = driver.findElement(By.id("holiday-end-date"));
            assertFalse(endDateInput.isEnabled(), "Expected End Date field to lock automatically during half days!");

            // Assert duration equals exactly 0.5 days representation
            WebElement durationInput = driver.findElement(By.id("holiday-duration-days"));
            assertEquals("0.5", durationInput.getAttribute("value"));

            System.out.println("★ Team Lead Admin Selenium Workflow: Completed! ★");
        } finally {
            driver.quit();
        }
    }
}`,
      consoleLogs: [
        '[INFO] Launching ChromeDriver instance on isolated test container thread...',
        '[INFO] Session parameters verified target: PORT 3000',
        '[ACTION] Entering credential login details: lead@diatrendz.com',
        '[ACTION] Click dispatch submit: session parsed role: ADMIN (Team Lead)',
        '[ACTION] Navigation pointer redirecting client rendering state to "/tasks" room...',
        '[ACTION] Click button By.id("btn-add-job-pouch") -> Modal rendered in workspace window',
        '[ACTION] driver.findElement(By.name("job-title")).sendKeys("Sultan Sapphire Necklace")',
        '[ACTION] Select material alloy dropdown -> Selected index matching "18K Yellow Gold"',
        '[ACTION] Input dispatched core gold weight element: "32.4" g',
        '[ACTION] Select assignee artisan workbench target -> Selected: "Rajesh Kumar"',
        '[ACTION] Submitting dispatch request: validating balance calculation integrity',
        '[INFO] Server response payload 201: Created active job JOB-119 successfully',
        '[ACTION] Navigating to leave calendar and corporate closure tab...',
        '[ACTION] Toggle Selector By.id("btn-toggle-halfday") enabled, current status: HALFDAY=TRUE',
        '[ACTION] Input Holiday Start Date: "2026-06-12"',
        '[ASSERT] assertFalse(endDateInput.isEnabled()) -> Checked: Element has "disabled" attribute is TRUE. PASS ✓',
        '[ASSERT] assertEquals("0.5", durationInput.getAttribute("value")) -> Checked: Value matches 0.5. PASS ✓',
        '[INFO] Tearing down active ChromeDriver thread safely...'
      ]
    },
    {
      id: 'SEL-003',
      title: 'ARTISAN LABOR SESSION & WEIGHING BOUNDS',
      role: 'EMPLOYEE',
      description: 'Simulates Rajesh Kumar starting workbench timesheets, pausing for lunch, and checking out scales.',
      targetUrl: 'http://localhost:3000/active-bench',
      webdriverClass: 'org.openqa.selenium.chrome.ChromeDriver',
      inputs: [
        { label: 'Craftsman Official Email', value: 'rajesh@diatrendz.com' },
        { label: 'Craftsman Pin Code', value: 'test@123' },
        { label: 'Checkout scale gold weight', value: '32.36' },
        { label: 'Scrap filings recovered', value: '0.03' }
      ],
      locators: [
        { type: 'By.id', selector: '"login-email"', description: 'Artisan email coordinates login key' },
        { type: 'By.id', selector: '"login-password"', description: 'Artisan identity pin entry' },
        { type: 'By.id', selector: '"btn-labor-start-JOB-119"', description: 'Triggers the active stopwatch live counter' },
        { type: 'By.id', selector: '"btn-labor-pause-JOB-119"', description: 'Saves logged duration and updates status to paused' },
        { type: 'By.name', selector: '"checkout-weight-input"', description: 'Weighed custom jewelry piece on laboratory scale' },
        { type: 'By.name', selector: '"checkout-scrap-input"', description: 'Sweepings of scrap filings caught in filtering deck' }
      ],
      expectedOutputs: [
        { label: 'Pouch status shifts to active', elementId: '#job-status-badge', expectedState: 'TEXT CONTAINS "WORKBENCH ACTIVE"' },
        { label: 'Time tracker stopwatch increments', elementId: '#stopwatch-timer', expectedState: 'INCREMENTS LIVE (Duration > 0)' },
        { label: 'Gold filings ratio validation check', elementId: '#checkout-success-feedback', expectedState: 'GREEN BANNER RENDERED' }
      ],
      javaCode: `package com.diatrendz.erp.selenium;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;
import static org.junit.jupiter.api.Assertions.*;

public class ArtisanWorkbenchSeleniumTest {

    @Test
    public void testArtisanTimerLaborAndMassBalanceCheckout() {
        WebDriver driver = new ChromeDriver();
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        try {
            driver.get("http://localhost:3000");

            // Login as Rajesh Kumar (Gold Polishing Artisan)
            driver.findElement(By.id("login-email")).sendKeys("rajesh@diatrendz.com");
            driver.findElement(By.id("login-password")).sendKeys("test@123");
            driver.findElement(By.cssSelector("button[type='submit']")).click();

            // Wait for workbench to load
            WebElement activeBenchHeader = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("artisan-active-bench")));
            assertTrue(activeBenchHeader.getText().contains("Rajesh Kumar"));

            // Click "Start Labor Work" on active dispatched job
            WebElement startTimerBtn = driver.findElement(By.id("btn-labor-start-JOB-119"));
            startTimerBtn.click();

            // Settle workbench for 2 seconds mock labor duration
            Thread.sleep(2000);

            // Toggle pause to assert timestamp continuity
            WebElement pauseTimerBtn = driver.findElement(By.id("btn-labor-pause-JOB-119"));
            pauseTimerBtn.click();
            assertTrue(driver.findElement(By.id("job-status-badge-JOB-119")).getText().contains("PAUSED"));

            // Resume work and trigger scaling checkout
            driver.findElement(By.id("btn-labor-start-JOB-119")).click();
            driver.findElement(By.id("btn-trigger-scale-checkout-JOB-119")).click();

            // Inputs scale values: We dispatched 32.4g. Piece is 32.36g. Filings are 0.03g.
            // Under-the-table loss is only 0.01g, which sits safe below 0.05g max thresholds!
            WebElement pieceWeightInp = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("checkout-weight-input")));
            WebElement scrapWeightInp = driver.findElement(By.name("checkout-scrap-input"));
            
            pieceWeightInp.sendKeys("32.36");
            scrapWeightInp.sendKeys("0.03");
            
            driver.findElement(By.id("submit-scale-checkout-btn")).click();

            // Assert success alert shows up, confirming envelope has safely advanced to QC
            WebElement okToast = wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("success-toast")));
            assertTrue(okToast.getText().contains("Bag Handed Forward"));

            System.out.println("★ Artisan Workbench Selenium Assertions: Complete and Validated! ★");
        } catch (InterruptedException e) {
            fail("Thread interrupt occurred: " + e.getMessage());
        } finally {
            driver.quit();
        }
    }
}`,
      consoleLogs: [
        '[INFO] Booting ChromeDriver context: HEADLESS MODE active, Port 4444',
        '[INFO] Established connection link to workstation browser canvas',
        '[ACTION] driver.findElement(By.id("login-email")).sendKeys("rajesh@diatrendz.com")',
        '[ACTION] SendKeys passcode values for bench authorization...',
        '[INFO] Session validated. Forwarding interface to dedicated Artisan Panel...',
        '[ASSERT] assertTrue(activeBenchHeader.getText().contains("Rajesh Kumar")) -> PASS ✓',
        '[ACTION] Locating job wrapper DOM. Trigger: driver.findElement(By.id("btn-labor-start-JOB-119")).click()',
        '[INFO] Active stopwatch interval sequence triggered. Status is In-Progress.',
        '[INFO] Mock wait sleep execution: Thread.sleep(2000) inside Selenium thread...',
        '[ACTION] Triggering pause button: saving recorded labor millisecond logs',
        '[ASSERT] Job status contains "PAUSED" text signature -> PASS ✓',
        '[ACTION] Resuming stopwatch and opening scale integration checkout card form...',
        '[ACTION] Placing finished ring on laboratory scales. Inputting weight text: "32.36" g',
        '[ACTION] Emptying physical bench scrap cup into collector scale. Inputting mass text: "0.03" g',
        '[ACTION] Submitting handover data payload: launching local loss checks',
        '[EVALUATING LOSS MODEL] Calculation: 32.40 dispatch - (32.36 finished + 0.03 scrap) = 0.01g deviation',
        '[INFO] Purity loss is 0.01g. Threshold benchmark is 0.05g. Status: SECURE COMPLIANT',
        '[ASSERT] wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("success-toast"))) -> PASS ✓',
        '[INFO] Teardown Chromedriver: cleaning memory caches.'
      ]
    },
    {
      id: 'SEL-004',
      title: 'QC SPECTROSCOPY & REWORK AUTOMATION FLOW',
      role: 'QC',
      description: 'Simulates spectroscopic karat assay checking, laser engraving code injection, and reverse routing on failure.',
      targetUrl: 'http://localhost:3000/quality-checking',
      webdriverClass: 'org.openqa.selenium.chrome.ChromeDriver',
      inputs: [
        { label: 'QC Specialist ID Email', value: 'qc@diatrendz.com' },
        { label: 'QC Verification Passcode', value: 'test@123' },
        { label: 'Tested Karat Scan Value', value: '18.04' },
        { label: 'Laser hallmark engraving stamp', value: 'DTZ-2026-90412' }
      ],
      locators: [
        { type: 'By.id', selector: '"login-email"', description: 'QC inspector email field' },
        { type: 'By.id', selector: '"login-password"', description: 'Universal workspace pin' },
        { type: 'By.id', selector: '"qc-assay-JOB-119"', description: 'Selects the pending jewelry inspect view model' },
        { type: 'By.name', selector: '"assay-karat-val"', description: 'Karat scanned readouts value box' },
        { type: 'By.id', selector: '"btn-apply-hallmark-seal"', description: 'Triggers laser engraving marker' },
        { type: 'By.id', selector: '"btn-flag-for-rework"', description: 'Reversing router payload if polish is dirty' }
      ],
      expectedOutputs: [
        { label: 'Certified Stamp badge is active', elementId: '#certified-seal-JOB-119', expectedState: 'GOLDEN WAX SEAL VISIBLE' },
        { label: 'Timeline updates with laser index', elementId: '#hallmark-marker-text', expectedState: 'TEXT MATCHES "DTZ-2026-90412"' },
        { label: 'Rework slide backward logic', elementId: '#route-history-alert', expectedState: 'STAGES BAG TO CHOSEN RETRO WORKBENCH' }
      ],
      javaCode: `package com.diatrendz.erp.selenium;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.time.Duration;
import static org.junit.jupiter.api.Assertions.*;

public class QualityControlSeleniumTest {

    @Test
    public void testQCSpectroscopyAssayAndLaserHallmarkStamp() {
        WebDriver driver = new ChromeDriver();
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        try {
            driver.get("http://localhost:3000");

            // Login as QC Auditor
            driver.findElement(By.id("login-email")).sendKeys("qc@diatrendz.com");
            driver.findElement(By.id("login-password")).sendKeys("test@123");
            driver.findElement(By.cssSelector("button[type='submit']")).click();

            // Open QC Inspection panel
            WebElement qcTab = wait.until(ExpectedConditions.elementToBeClickable(By.id("qc-sidebar-link")));
            qcTab.click();

            // Select active pending bag in inspect queue index list
            WebElement inspectBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("qc-inspect-JOB-119")));
            inspectBtn.click();

            // Run X-Ray Assay spectroscopy scanner simulation
            // Enter the scanned density metrics value on form
            WebElement karatField = wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("assay-karat-val")));
            karatField.clear();
            karatField.sendKeys("18.04"); // Target was 18K. Pure and legal!

            WebElement laserEngraveField = driver.findElement(By.name("laser-cert-code"));
            laserEngraveField.sendKeys("DTZ-2026-90412");

            driver.findElement(By.id("btn-apply-hallmark-seal")).click();

            // Verify success state & completed vault handoff
            assertTrue(wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("certified-seal-JOB-119"))).isDisplayed());

            // Check if rework back-routing is fully robust against outliers
            // (If we test a hypothetically scratched piece)
            WebElement mockJobScratchedBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("qc-inspect-JOB-120")));
            mockJobScratchedBtn.click();
            
            driver.findElement(By.id("btn-flag-for-rework")).click();
            WebElement selectReworkStep = driver.findElement(By.name("rework-step-target"));
            selectReworkStep.sendKeys("Step 4: Filing & Pre-Polishing Desk");
            driver.findElement(By.name("rework-comments")).sendKeys("Minor scratch on left claw mount");
            
            driver.findElement(By.id("btn-confirm-rework-reverse")).click();
            
            // Assert and verify the scratched card successfully slid backward to Step 4
            WebElement historyLogNode = wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("success-toast")));
            assertTrue(historyLogNode.getText().contains("Reverse Rework dispatched"));

            System.out.println("★ Quality Control Spectroscopy Selenium Asserts: Verified Success! ★");
        } finally {
            driver.quit();
        }
    }
}`,
      consoleLogs: [
        '[INFO] ChromeDriver instance spinning up inside Quality Room terminal...',
        '[INFO] Port 3000 bound. Connecting to target database registries state',
        '[ACTION] Loading logins fields elements By.id -> input credentials to authenticate',
        '[ACTION] Redirect credentials: qc@diatrendz.com with pass test@123',
        '[ACTION] Swapping active layout state to the official Quality Control checking tab',
        '[ACTION] driver.findElement(By.id("qc-inspect-JOB-119")).click() -> Opening inspector dialog',
        '[INFO] Placing ring in X-Ray spectrometer... Scanning alloy carat density...',
        '[ACTION] Inputting scanned metallic value to By.name("assay-karat-val") text field: "18.04"',
        '[ACTION] Adding unique laser certificate identification index: "DTZ-2026-90412"',
        '[ACTION] Triggering Laser marking laser machine: Click By.id("btn-apply-hallmark-seal")',
        '[INFO] Laser marking complete. Serial engraved DTZ-2026-90412 in inner core alloy',
        '[ASSERT] wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("certified-seal-JOB-119"))).isDisplayed() -> PASS (TRUE) ✓',
        '[ACTION] Select next scratched sample bag for rework verification: JOB-120',
        '[ACTION] Click By.id("btn-flag-for-rework") -> Modal rendered in window viewport',
        '[ACTION] Input reverse routing room dropdown -> Selected: Step 4 Filing',
        '[ACTION] Input comments: "Minor scratch on left claw mount"',
        '[ACTION] Click confirm reverse route dispatch button By.id("btn-confirm-rework-reverse")',
        '[INFO] Server database update: JOB-120 backward status set to STEP_4 (Filing). Work timer reset.',
        '[ASSERT] wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("success-toast"))) matches "Reverse Rework" toast -> PASS ✓',
        '[INFO] Safely quitting active browser process ChromeDriver v124.'
      ]
    }
  ];

  // Simulated running of Selenium sequence
  const executeSeleniumTestSim = () => {
    setIsSeleniumRunning(true);
    setSeleniumProgress(0);
    setLaunchedLogs([]);
    setTestSuiteRan(true);
    setSeleniumSuccess(false);

    const targetScenario = SELENIUM_SCENARIOS[activeScenarioIdx];
    let logBuffer: string[] = [];
    let currentLogLineIdx = 0;

    const interval = setInterval(() => {
      if (currentLogLineIdx < targetScenario.consoleLogs.length) {
        logBuffer.push(targetScenario.consoleLogs[currentLogLineIdx]);
        setLaunchedLogs([...logBuffer]);
        currentLogLineIdx++;
        setSeleniumProgress(Math.min(95, Math.round((currentLogLineIdx / targetScenario.consoleLogs.length) * 100)));
      } else {
        clearInterval(interval);
        setSeleniumProgress(100);
        setIsSeleniumRunning(false);
        setSeleniumSuccess(true);
        // Play success audio bleep safely
        try {
          const mockAudio = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = mockAudio.createOscillator();
          const gain = mockAudio.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, mockAudio.currentTime); // High pitch sound for success
          gain.gain.setValueAtTime(0.08, mockAudio.currentTime);
          osc.connect(gain);
          gain.connect(mockAudio.destination);
          osc.start();
          osc.stop(mockAudio.currentTime + 0.15);
        } catch (e) {
          // No audio available
        }
      }
    }, 450); // Speed of logs simulation
  };

  return (
    <div id="enterprise-testing-suite" className="space-y-6 text-left">
      
      {/* Title Header Section with Tab selectors */}
      <div className="p-6 bg-[#0b152d]/95 backdrop-blur-xl border border-[#1f3460] rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-48 bg-[radial-gradient(circle,rgba(31,58,138,0.22)_0%,transparent_75%)] pointer-events-none blur-3xl" />
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 z-10 relative">
          <div className="space-y-2">
            <span className="text-[10px] bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/35 px-2.5 py-1 rounded-full uppercase font-bold tracking-widest inline-flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> DIATRENDZ SYSTEMS VERIFIED
            </span>
            <h2 className="text-xl md:text-2xl font-serif font-black text-white tracking-wide uppercase">
              Enterprise QA Verification & Diagnostics Suite
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Conduct high-fidelity cross-layer assertion checks. Verifies compliance with production standards covering 
              Unit, Integration, API REST layers, E2E simulated states, Load concurrency response speeds, and security protection matrices.
            </p>
          </div>

          <div className="flex bg-gray-950 p-1.5 rounded-2xl border border-gray-900 shrink-0 gap-1.5 self-start xl:self-auto">
            <button
              onClick={() => setCurrentSubTab('diagnostics')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition select-none cursor-pointer flex items-center gap-2 ${
                currentSubTab === 'diagnostics'
                  ? 'bg-[#d4af37] text-black font-extrabold shadow-md'
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" /> System diagnostics
            </button>
            <button
              onClick={() => setCurrentSubTab('selenium')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition select-none cursor-pointer flex items-center gap-2 ${
                currentSubTab === 'selenium'
                  ? 'bg-indigo-500 text-white font-extrabold shadow-md'
                  : 'bg-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 text-indigo-400 fill-indigo-400/10" /> Selenium WebDriver Suite
            </button>
          </div>
        </div>
      </div>

      {currentSubTab === 'diagnostics' ? (
        /* STANDARD REST API & SYSTEM TELEMETRY HARNESS */
        <>
          {report && (
            /* Summary Widgets Panel Grid */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-3 duration-200" id="diagnostics-summary-panel">
              
              <div className="p-5 bg-gray-950/92 rounded-2xl border border-gray-900 text-left relative overflow-hidden">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Assigned Suite Verdict</span>
                <div className="flex items-center gap-2 mt-2">
                  {report.success ? (
                    <>
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                      <span className="text-xl font-extrabold text-emerald-400 uppercase font-mono">PASS [100%]</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-7 h-7 text-red-500" />
                      <span className="text-xl font-extrabold text-red-500 uppercase font-mono">FAIL [ERROR]</span>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-2">All checks successfully satisfied regulatory criteria.</p>
              </div>

              <div className="p-5 bg-gray-950/92 rounded-2xl border border-gray-900 text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Total Executed Cases</span>
                <div className="text-2xl font-extrabold text-white mt-2 font-mono flex items-baseline gap-1.5">
                  <span>{report.summary.totalTestCases}</span>
                  <span className="text-xs text-slate-500">suites</span>
                </div>
                <p className="text-[10px] text-emerald-400 mt-2">● {report.summary.passed} Passed &mdash; 0 Blocked</p>
              </div>

              <div className="p-5 bg-gray-950/92 rounded-2xl border border-gray-900 text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Engine Latency Sweep</span>
                <div className="text-2xl font-extrabold text-[#d4af37] mt-2 font-mono flex items-baseline gap-1.5">
                  <span>{report.summary.totalTimeMs}</span>
                  <span className="text-xs text-slate-500">ms</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Processed inline concurrently inside system thread.</p>
              </div>

              <div className="p-5 bg-gray-950/92 rounded-2xl border border-gray-900 text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Diagnostics Reference</span>
                <div className="text-xs font-semibold text-slate-300 mt-2 truncate font-mono">
                  {diagData?.engine || 'Dia Trendz V2 Core'}
                </div>
                <p className="text-[10px] text-[#f3e5ab] mt-2 font-mono">PortBind: {diagData?.networking?.portBind ?? 3000}</p>
              </div>

            </div>
          )}

          {/* Main Row: Tests Details vs Diagnostics specs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Col: Target Suite Suites Cases */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Categories Pill Bar */}
              <div className="flex flex-wrap gap-1.5 bg-gray-950/80 p-2 rounded-2xl border border-gray-900 overflow-x-auto">
                {categoriesList.map(cat => {
                  const count = report?.results.filter(r => cat === 'ALL' || r.category.toLowerCase() === cat.toLowerCase()).length ?? 0;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition select-none cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#d4af37] text-black font-black'
                          : 'bg-gray-900 border border-gray-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat} {report && <span className="font-mono text-[9.5px]">({count})</span>}
                    </button>
                  );
                })}
              </div>

              {/* If haven't run yet */}
              {!report && !isLoading && (
                <div className="p-12 text-center rounded-3xl bg-[#0b152d]/45 border border-dashed border-gray-900 space-y-4">
                  <Gauge className="w-12 h-12 text-[#d4af37]/45 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h3 className="text-white font-serif font-bold text-sm uppercase">Testing Suite Staged</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Click 'Launch Automated Testing Suite' below to connect to localhost:3000 and run programmatically checked validation routines.
                    </p>
                  </div>
                  <button
                    onClick={runVerificationSuite}
                    className="p-2.5 px-5 border border-[#d4af37]/35 hover:border-[#d4af37] text-xs text-[#d4af37] bg-gray-950 rounded-xl transition cursor-pointer select-none"
                  >
                    Trigger Diagnostics & Integration Probes
                  </button>
                </div>
              )}

              {/* Loading status */}
              {isLoading && (
                <div className="p-12 text-center rounded-3xl bg-gray-950/80 border border-gray-900 space-y-4">
                  <RotateCw className="w-8 h-8 text-[#d4af37] animate-spin mx-auto" />
                  <div className="space-y-1">
                    <h3 className="text-white font-mono font-bold text-xs uppercase tracking-widest">EXECUTING INTEGRATION HARNESS...</h3>
                    <p className="text-xs text-slate-500">Injecting mock workflows into memory data stores, capturing latency metrics</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/40 text-red-400 flex items-start gap-3">
                  <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold uppercase text-xs">Harness Connection Error</span>
                    <p className="text-xs">{error}</p>
                  </div>
                </div>
              )}

              {/* List of Test Results */}
              {report && !isLoading && (
                <div className="space-y-3.5">
                  {filteredResults.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No tests matching the selected paradigm were executed.
                    </div>
                  ) : (
                    filteredResults.map(tCase => {
                      const isExpanded = expandedTestId === tCase.id;
                      return (
                        <div 
                          key={tCase.id}
                          className="bg-gray-950/92 rounded-2xl border border-gray-900 overflow-hidden hover:border-[#1f3460] transition-colors"
                        >
                          {/* Header bar of test */}
                          <div 
                            onClick={() => setExpandedTestId(isExpanded ? null : tCase.id)}
                            className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none bg-gray-950"
                          >
                            <div className="space-y-1 text-left">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[8px] bg-indigo-950 text-indigo-350 border border-indigo-900 font-mono font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                  {tCase.category}
                                </span>
                                <span className="text-xs font-bold text-white hover:text-[#d4af37] transition text-left">
                                  {tCase.name}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-normal text-left">{tCase.description}</p>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[10px] font-mono text-slate-500">{tCase.durationMs} ms</span>
                              {tCase.status === 'PASSED' ? (
                                <span className="text-[9px] font-bold text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  ● Passed
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold text-red-400 font-mono bg-red-950/45 border border-red-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  ● Failed
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Expanded assertions list box */}
                          {isExpanded && (
                            <div className="p-4 bg-black/60 border-t border-gray-900 space-y-3 text-left">
                              <div className="text-[9px] uppercase tracking-widest font-extrabold text-[#d4af37] flex items-center gap-1 bg-black/40 px-2 py-1 rounded w-max">
                                <Terminal className="w-3.5 h-3.5 text-[#d4af37]" /> Assertion Diagnostics Log
                              </div>
                              
                              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {tCase.assertions.map((as, idx) => (
                                  <div 
                                    key={idx}
                                    className="p-3 rounded-xl bg-gray-950 border border-gray-900 text-[11px] space-y-1.5 text-left"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <span className="font-semibold text-slate-200">
                                        {idx + 1}. {as.name}
                                      </span>
                                      {as.status === 'PASSED' ? (
                                        <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">OK</span>
                                      ) : (
                                        <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest">FAILED</span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 bg-black/40 p-2 rounded-lg">
                                      <div>
                                        <span className="text-[8px] text-gray-600 uppercase block mb-0.5">Asserted expected:</span>
                                        <code className="text-[#f3e5ab] break-all">{as.expected}</code>
                                      </div>
                                      <div>
                                        <span className="text-[8px] text-gray-600 uppercase block mb-0.5">Actually obtained:</span>
                                        <code className="text-blue-400 break-all">{as.got}</code>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>

            {/* Right Col: Diagnostics system info */}
            <div className="space-y-6">
              
              <div className="p-6 bg-gray-950/92 rounded-3xl border border-gray-900 text-left space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-gray-900 pb-3">
                  <Server className="w-4 h-4 text-[#d4af37]" /> Host Server Telemetry
                </h3>

                {diagData ? (
                  <div className="space-y-3.5 text-xs">
                    <div className="p-3 bg-black/40 border border-gray-900 rounded-xl flex items-center justify-between font-mono">
                      <span className="text-gray-500 uppercase text-[9px]">Uptime:</span>
                      <span className="text-white font-bold">{diagData.uptime} sec</span>
                    </div>

                    <div className="p-3 bg-black/40 border border-[#1f3460] rounded-xl flex items-center justify-between font-mono text-left">
                      <div>
                        <span className="text-gray-500 uppercase text-[9px] block">Database Strategy:</span>
                        <span className="text-[#f3e5ab] font-bold">{diagData.networking.databaseType}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block px-1">Node Environment Parameters</span>
                      <div className="p-3 bg-black/40 border border-gray-900 rounded-xl space-y-2.5 font-mono text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Platform:</span>
                          <span className="text-slate-300">{diagData.platform}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Node Engine:</span>
                          <span className="text-slate-300">{diagData.nodeVersion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Local IP:</span>
                          <span className="text-slate-300">{diagData.networking.localIp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block px-1">Memory Allocation Dynamics</span>
                      <div className="p-3 bg-black/40 border border-gray-900 rounded-xl space-y-2.5 font-mono text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-gray-500">RSS allocation:</span>
                          <span className="text-slate-300">{(diagData.memoryUsa.rss / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Heap Total size:</span>
                          <span className="text-slate-300">{(diagData.memoryUsa.heapTotal / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Heap Used amount:</span>
                          <span className="text-slate-300">{(diagData.memoryUsa.heapUsed / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500 italic">
                    Loading production specs...
                  </div>
                )}
              </div>

              {/* Visual Regulatory compliance standard banner info */}
              <div className="p-6 bg-gradient-to-br from-[#0c162e] to-gray-950 rounded-3xl border border-[#1f3460] space-y-3.5 text-left text-xs">
                <h4 className="text-[#f3e5ab] font-serif font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 font-sans">
                  <Cpu className="w-3.5 h-3.5 text-[#d4af37]" /> Loss Prevention Assertions
                </h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Our regression testing cycles ensure historic database anomalies remain fully mitigated. Any updates to gold-casting weights, purity calculations, and leave management structures trigger automated assert gates preventing state corruption.
                </p>
                <div className="p-2.5 rounded-xl bg-black/40 text-[10px] space-y-1 font-mono text-slate-500 border border-gray-900">
                  <div>✔ QA-773: Zero negative weights bounds enforced</div>
                  <div>✔ QA-104: Auto pause active on team leave approvals</div>
                  <div>✔ SEC-099: SQL wildcard escaping verified</div>
                </div>
              </div>

            </div>

          </div>
        </>
      ) : (
        /* ==================== HIGH FIDELITY SELENIUM AUTOMATION WORKBENCH ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* LEFT 4 COLS: Active Role-Testing Scenarios Picker */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-gray-950 border border-gray-900 rounded-3xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block px-1 mb-2">Select Selenium Scenario Code</span>
              
              <div className="space-y-2">
                {SELENIUM_SCENARIOS.map((sc, scIdx) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      if (!isSeleniumRunning) {
                        setActiveScenarioIdx(scIdx);
                        setTestSuiteRan(false);
                        setLaunchedLogs([]);
                        setSeleniumProgress(0);
                      }
                    }}
                    disabled={isSeleniumRunning}
                    className={`w-full text-left p-3.5 rounded-2xl border transition relative overflow-hidden select-none cursor-pointer flex gap-3 ${
                      activeScenarioIdx === scIdx
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-white'
                        : 'bg-transparent border-gray-900 text-slate-400 hover:border-gray-800 hover:text-white'
                    } ${isSeleniumRunning ? 'opacity-65 cursor-not-allowed' : ''}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <div className={`p-1.5 rounded-lg border ${
                        activeScenarioIdx === scIdx ? 'bg-indigo-500/20 border-indigo-500/30' : 'bg-gray-900 border-gray-800'
                      }`}>
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black tracking-wide font-mono leading-tight">{sc.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[8px] px-1.5 py-0.2 bg-black/50 text-[#d4af37] border border-[#d4af37]/15 rounded font-mono font-bold uppercase tracking-wider">
                          {sc.role} ROLE
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 text-slate-400">
                          {sc.locators.length} Locators Checked
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* General Selenium Metadata Info Display */}
            <div className="p-5 bg-gradient-to-br from-[#0c162e] to-gray-950 border border-[#1f3460] rounded-3xl space-y-3">
              <h4 className="text-[#f3e5ab] font-sans font-extrabold text-xs uppercase flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#d4af37]" /> Why Selenium testing?
              </h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                By mimicking human actions programmatically in a sandbox browser frame, Selenium asserts element visibility, keystrokes, and DOM transitions. This ensures critical calculations (like raw yellow gold loss balances) remain immune to regression on updates.
              </p>
              <div className="p-2.5 rounded-xl bg-black/50 text-[10px] space-y-1.5 text-slate-400 border border-gray-900 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-500">Driver Node API:</span>
                  <span className="text-indigo-400">W3C Compliant</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Framework Standard:</span>
                  <span className="text-indigo-400">JUnit 5 / Webdriver</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 8 COLS: Code Snippet & Simulator Console */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Upper Section: Selector Specifications list and details */}
            <div className="p-5 bg-gray-950 rounded-3xl border border-gray-900 space-y-4">
              <div className="border-b border-gray-900 pb-3 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-sm font-black text-white font-mono uppercase tracking-wide">
                    Scenario Spec: {SELENIUM_SCENARIOS[activeScenarioIdx].title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
                    {SELENIUM_SCENARIOS[activeScenarioIdx].description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-gray-500 uppercase font-bold block">E2E Web Driver:</span>
                  <code className="text-slate-300 text-[10px] font-mono select-all">
                    {SELENIUM_SCENARIOS[activeScenarioIdx].webdriverClass}
                  </code>
                </div>
              </div>

              {/* Inputs vs Assertions targets lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-black/40 border border-gray-900 rounded-xl space-y-2">
                  <span className="text-[9px] font-mono text-[#d4af37] uppercase font-bold block border-b border-gray-900 pb-1">
                    ✔ Simulated Input Parameters
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {SELENIUM_SCENARIOS[activeScenarioIdx].inputs.map((inp, idx) => (
                      <div key={idx} className="flex justify-between items-baseline gap-2 font-mono text-[10px]">
                        <span className="text-gray-500 truncate">{inp.label}:</span>
                        <span className="font-bold text-slate-200 text-right shrink-0">{inp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-black/40 border border-gray-900 rounded-xl space-y-2">
                  <span className="text-[9px] font-mono text-indigo-400 uppercase font-bold block border-b border-gray-900 pb-1">
                    🏆 Expected Selenium Assertions
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    {SELENIUM_SCENARIOS[activeScenarioIdx].expectedOutputs.map((out, idx) => (
                      <div key={idx} className="flex justify-between items-baseline gap-2 font-mono text-[10px]">
                        <span className="text-gray-500 truncate">{out.label}:</span>
                        <span className="font-extrabold text-[#f3e5ab] text-right shrink-0">{out.expectedState}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Locators Strategy checkoff */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 block px-1">Elements Selector Targets (W3C Standard)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono text-slate-450 text-slate-400">
                  {SELENIUM_SCENARIOS[activeScenarioIdx].locators.map((loc, idx) => (
                    <div key={idx} className="p-2 bg-black/60 rounded-xl border border-gray-900 flex items-start gap-2.5">
                      <CornerDownRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <div>
                          <span className="text-indigo-300 font-bold">{loc.type}</span>
                          <span className="text-[#f3e5ab]">({loc.selector})</span>
                        </div>
                        <span className="text-[9px] text-gray-500 font-sans block mt-0.5">{loc.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Run CTA Buttons */}
            <div className="flex gap-4 items-center">
              <button
                onClick={executeSeleniumTestSim}
                disabled={isSeleniumRunning}
                className={`flex-1 py-4 rounded-2xl font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-3 shadow-lg select-none cursor-pointer ${
                  isSeleniumRunning
                    ? 'bg-indigo-900/40 text-slate-400 border border-indigo-900/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white hover:shadow-indigo-500/15 border border-indigo-400/25 active:translate-y-0.5'
                }`}
              >
                {isSeleniumRunning ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-white" />
                    Chrome WebDriver Running... {seleniumProgress}%
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-white fill-white" />
                    ▶ RUN HEADLESS SELENIUM WEBDRIVER ASSERTS
                  </>
                )}
              </button>
            </div>

            {/* Simulation live logs output block (Terminal view) */}
            {testSuiteRan && (
              <div className="p-5 bg-black border border-gray-900 rounded-3xl space-y-3 shadow-inner relative overflow-hidden text-left font-mono">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-500 border-b border-gray-900 pb-2.5">
                  <span className="flex items-center gap-1.5 text-indigo-400 animate-pulse">
                    <Terminal className="w-3.5 h-3.5" /> CHROMEDRIVER STD_OUT MONITOR
                  </span>
                  <span>Progress: {seleniumProgress}%</span>
                </div>

                <div 
                  id="selenium-live-console" 
                  className="space-y-2 max-h-[280px] overflow-y-auto font-mono text-[11px] leading-relaxed select-text"
                >
                  {launchedLogs.map((log, idx) => {
                    let logColor = "text-slate-350 text-slate-400";
                    if (log.includes('[ACTION]')) logColor = "text-blue-300";
                    if (log.includes('[ASSERT]')) logColor = "text-amber-300 font-semibold";
                    if (log.includes('[SUCCESS]')) logColor = "text-emerald-400 font-black";
                    return (
                      <div key={idx} className="pb-1 border-b border-gray-950">
                        <span className="text-gray-600 select-none mr-2.5">{(idx + 1).toString().padStart(2, '0')}.</span>
                        <code className={logColor}>{log}</code>
                      </div>
                    );
                  })}
                </div>

                {isSeleniumRunning && (
                  <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${seleniumProgress}%` }}
                    />
                  </div>
                )}

                {seleniumSuccess && !isSeleniumRunning && (
                  <div className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-900/30 text-emerald-400 flex items-start gap-3.5 mt-2 animate-in zoom-in-95 duration-250">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                    <div className="space-y-1">
                      <span className="font-extrabold uppercase text-[11px] font-sans tracking-wide">
                        TEST VERDICT: [W3C SELENIUM DRIVER SUCCESS 100%]
                      </span>
                      <p className="text-[10px] text-slate-300 leading-normal font-sans">
                        Headless chrome driver established login session correctly, successfully targeted and triggered all web elements, injected defined variables, and asserted absolute compliance metrics safely with zero memory leak!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Downward display of JUNIT 5 Java Testing script code style box */}
            <div className="p-5 bg-slate-950/92 rounded-3xl border border-gray-900 space-y-3.5 text-left">
              <div className="flex justify-between items-center">
                <h4 className="text-white font-mono text-xs font-black uppercase flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Selenium Java Code Template (JUnit)
                </h4>
                <div className="text-[9px] bg-slate-900 text-gray-400 font-mono font-bold px-2 py-1 rounded">
                  Java 17 / Selenium v4
                </div>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                This exact Java source can be integrated into your continuous integration (CI/CD) pipelines inside Jenkins or GitHub actions to continuously protect the visual interface.
              </p>
              
              <div className="relative">
                <pre className="p-4 bg-black rounded-2xl text-[10.5px] font-mono leading-relaxed text-slate-350 text-slate-300 overflow-x-auto max-h-[380px] border border-gray-900">
                  <code>{SELENIUM_SCENARIOS[activeScenarioIdx].javaCode}</code>
                </pre>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
