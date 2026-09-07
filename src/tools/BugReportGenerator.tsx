import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bug,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  Download,
  ExternalLink,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  FileCode,
  Share2,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  X,
  Zap,
  Layers,
  FileSpreadsheet,
  Layers3
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type SeverityLevel = 'Blocker (P0)' | 'Critical (P1)' | 'Major (P2)' | 'Minor (P3)' | 'Trivial (P4)';
type PriorityLevel = 'P0 - Urgent / Immediate' | 'P1 - High' | 'P2 - Medium' | 'P3 - Low';
type FrequencyLevel = 'Always (100%)' | 'Frequently (>75%)' | 'Intermittently (~50%)' | 'Rarely (<10%)' | 'Occurred Once';
type SingleExportFormat = 'github' | 'jira_wiki' | 'linear' | 'gitlab' | 'slack' | 'html' | 'json';
type BatchExportFormat = 'csv' | 'markdown_suite' | 'json_suite' | 'jira_suite' | 'html_suite';
type TabSection = 'editor' | 'logs' | 'attachments';

interface NetworkDiagnostic {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  statusCode: string;
  requestBody: string;
  responseBody: string;
  headers: string;
}

interface AttachmentItem {
  id: string;
  name: string;
  type: 'Screenshot' | 'Screen Recording' | 'HAR Network Log' | 'Figma Spec' | 'Error Trace';
  url: string;
}

export interface BugReportData {
  id: string;
  title: string;
  component: string;
  severity: SeverityLevel;
  priority: PriorityLevel;
  frequency: FrequencyLevel;
  environment: string;
  description: string;
  steps: string[];
  expected: string;
  actual: string;
  workaround: string;
  affectedVersion: string;
  assignedTeam: string;
  featureFlag: string;
  networkLog: NetworkDiagnostic;
  stackTrace: string;
  traceId: string;
  attachments: AttachmentItem[];
  tags: string[];
}

// --- 12 PRESET DEFECTS FOR SAMPLE SUITE GENERATION ---
const SAMPLE_12_BUGS_SUITE: BugReportData[] = [
  {
    id: 'bug_01',
    title: 'Checkout modal CTA overflows outside viewport on mobile Safari',
    component: 'Frontend / Checkout Flow',
    severity: 'Major (P2)',
    priority: 'P1 - High',
    frequency: 'Always (100%)',
    environment: 'Production (iOS 17.4 / Mobile Safari / iPhone 15 Pro, Viewport: 393x852)',
    description: 'When users on mobile viewports (<400px) open the checkout summary modal, the "Complete Purchase" primary CTA button is pushed below the fold and cannot be tapped due to missing sticky safe-area insets.',
    steps: [
      'Open the web application on iPhone Safari or simulated mobile viewport (375x812px)',
      'Add 3 or more products to the cart to ensure the order summary list scrolls',
      'Click on the "Proceed to Checkout" floating drawer trigger',
      'Attempt to reach and tap the "Complete Purchase" primary button'
    ],
    expected: 'The "Complete Purchase" CTA should remain fixed or smoothly scrollable within safe-area bounds (env(safe-area-inset-bottom)).',
    actual: 'The CTA button is clipped off-screen by ~45px; tapping the bottom area triggers the Safari navigation bar instead of checkout.',
    workaround: 'Rotate device to landscape mode or zoom out to 85% in browser page settings.',
    affectedVersion: 'v2.14.0-rc2',
    assignedTeam: 'Checkout & Core Web UI',
    featureFlag: 'feature.checkout_modal_v2: true',
    stackTrace: '',
    traceId: '',
    networkLog: {
      method: 'GET',
      url: 'https://app.example.com/checkout/summary',
      statusCode: '200 OK',
      requestBody: '',
      responseBody: '{\n  "cartTotal": 4500,\n  "itemsCount": 3,\n  "currency": "INR"\n}',
      headers: 'user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)'
    },
    attachments: [],
    tags: ['ui', 'mobile', 'safari', 'checkout', 'p1']
  },
  {
    id: 'bug_02',
    title: 'POST /api/v2/orders/checkout returns HTTP 500 on valid promo code',
    component: 'Backend / Order Processing API',
    severity: 'Critical (P1)',
    priority: 'P0 - Urgent / Immediate',
    frequency: 'Frequently (>75%)',
    environment: 'Production & Staging (Node.js 20.11 / PostgreSQL 16 / Kubernetes)',
    description: 'Submitting an order payload with discount coupon "FESTIVE20" triggers an unhandled NullPointerException in DiscountCalculationService, aborting the SQL transaction and throwing HTTP 500.',
    steps: [
      'Authenticate user via Bearer JWT token in Authorization header',
      'Send HTTP POST request to /api/v2/orders/checkout with cartId and couponCode: "FESTIVE20"',
      'Observe HTTP 500 response status with error code DB_TXN_ABORTED',
      'Verify database order status remains stuck in PENDING_PAYMENT without price deduction'
    ],
    expected: 'API returns HTTP 200 OK with calculated discount object and generated orderId confirmation.',
    actual: 'API returns HTTP 500 Internal Server Error with error body {"code": "INTERNAL_SERVER_ERROR", "message": "Cannot read property discount_type of null"}.',
    workaround: 'Proceeding to checkout without entering the coupon code processes successfully.',
    affectedVersion: 'v3.2.1-api',
    assignedTeam: 'Platform Backend & Payments',
    featureFlag: 'api.tiered_discounts_v3: true',
    stackTrace: `TypeError: Cannot read properties of null (reading 'discount_type')\n    at DiscountEngine.calculate (src/services/discount.ts:142:19)\n    at OrderController.checkout (src/controllers/order.ts:88:31)`,
    traceId: 'sentry-trace-8f7b2c9a10-2026',
    networkLog: {
      method: 'POST',
      url: 'https://api.example.com/v2/orders/checkout',
      statusCode: '500 Internal Server Error',
      requestBody: '{\n  "cartId": "crt_88921_in",\n  "couponCode": "FESTIVE20",\n  "paymentMethod": "UPI_INTENT"\n}',
      responseBody: '{\n  "success": false,\n  "errorCode": "INTERNAL_SERVER_ERROR",\n  "traceId": "req_8f7b2c9a10",\n  "timestamp": "2026-09-07T09:30:00Z"\n}',
      headers: 'Content-Type: application/json\nAuthorization: Bearer eyJhbGciOi...'
    },
    attachments: [],
    tags: ['backend', 'api', '500-error', 'postgres', 'checkout', 'p0']
  },
  {
    id: 'bug_03',
    title: 'App fatal crash on scanner screen when Camera permission is denied',
    component: 'Mobile / QR Scanner Module',
    severity: 'Critical (P1)',
    priority: 'P0 - Urgent / Immediate',
    frequency: 'Always (100%)',
    environment: 'Android 14 (Samsung Galaxy S24, Build #482, React Native 0.74)',
    description: 'Revoking camera permissions from device OS settings and subsequently tapping the "Scan QR Code" button causes an immediate unhandled native exception and application force close.',
    steps: [
      'Open Android App Settings -> Apps -> Toolique -> Permissions',
      'Set Camera Permission to "Don\'t allow"',
      'Launch the Toolique mobile app',
      'Tap the floating "Scan QR / Document" camera icon on the home dashboard'
    ],
    expected: 'App gracefully catches permission denial and displays "Camera permission required" prompt with link to OS settings.',
    actual: 'App crashes immediately back to device home screen with "Toolique has stopped responding" OS dialog.',
    workaround: 'Grant camera permission manually in Android Settings prior to opening the app.',
    affectedVersion: 'Build 4.8.2 (2048)',
    assignedTeam: 'Mobile Core Engineering',
    featureFlag: 'mobile.native_camera_v2: true',
    stackTrace: `java.lang.NullPointerException: Attempt to invoke virtual method on a null object reference\n    at com.toolique.scanner.CameraViewManager.initializeCamera(CameraViewManager.java:184)`,
    traceId: 'crashlytics-session-a9b8c7',
    networkLog: {
      method: 'POST',
      url: 'https://telemetry.example.com/v1/crashes',
      statusCode: '204 No Content',
      requestBody: '{"session": "a9b8c7", "exception": "NullPointerException"}',
      responseBody: '',
      headers: 'Content-Type: application/json'
    },
    attachments: [],
    tags: ['android', 'crash', 'react-native', 'camera-permission', 'p0']
  },
  {
    id: 'bug_04',
    title: 'Reflected XSS in search query parameter "q" on search results page',
    component: 'Security / Search Breadcrumbs',
    severity: 'Blocker (P0)',
    priority: 'P0 - Urgent / Immediate',
    frequency: 'Always (100%)',
    environment: 'Production (All Browsers: Chrome, Firefox, Edge, Safari)',
    description: 'The search query string parameter "?q=" is rendered directly into the DOM using innerHTML without HTML entity encoding or DOMPurify sanitization, enabling arbitrary JavaScript execution in user session.',
    steps: [
      'Navigate to https://app.example.com/search?q=%3Cimg%20src=x%20onerror=alert(document.domain)%3E',
      'Wait for the search results page to load',
      'Observe immediate JavaScript alert modal showing document domain'
    ],
    expected: 'Search parameter should be sanitized and rendered as plain text in the breadcrumb header.',
    actual: 'The script payload executes immediately in the client context.',
    workaround: 'WAF rule configured to block inline script tags in query strings.',
    affectedVersion: 'v2.12.0+',
    assignedTeam: 'Product Security & Frontend Core',
    featureFlag: 'security.sanitizer_v1: false',
    stackTrace: '',
    traceId: 'sec-audit-finding-2026-08',
    networkLog: {
      method: 'GET',
      url: 'https://app.example.com/search?q=%3Cimg%20src=x%20onerror=alert(1)%3E',
      statusCode: '200 OK',
      requestBody: '',
      responseBody: '<html>...<h1>Search for <img src=x onerror=alert(1)></h1>...</html>',
      headers: 'Content-Type: text/html; charset=utf-8'
    },
    attachments: [],
    tags: ['security', 'cwe-79', 'xss', 'cvss-8.1', 'p0']
  },
  {
    id: 'bug_05',
    title: 'UPI payment webhook timeout causes order state mismatch on payment retry',
    component: 'FinTech / Payment Webhook Processor',
    severity: 'Critical (P1)',
    priority: 'P0 - Urgent / Immediate',
    frequency: 'Intermittently (~50%)',
    environment: 'Production (Razorpay / UPI Gateway / Redis Queue)',
    description: 'When bank UPI gateways experience >5000ms latency, the webhook callback drops. If user clicks "Retry Payment", a second charge is initiated while the first webhook eventually confirms, causing double debit.',
    steps: [
      'Initiate checkout with UPI payment intent for INR 1,999',
      'Approve payment in UPI App (GPay / PhonePe / Paytm)',
      'Simulate 6-second latency on gateway webhook dispatch',
      'Observe browser shows "Payment Pending" with active "Retry Payment" button',
      'Click "Retry Payment" and complete second transaction'
    ],
    expected: 'Idempotency key prevents duplicate transaction; system locks payment intent during pending verification.',
    actual: 'Two distinct payment IDs are created for the single order ID, charging customer twice.',
    workaround: 'Customer support must trigger manual refund via Razorpay dashboard.',
    affectedVersion: 'v4.1.0',
    assignedTeam: 'FinTech Payments Squad',
    featureFlag: 'payment.idempotent_v2: false',
    stackTrace: '',
    traceId: 'pay_txn_8921b782c',
    networkLog: {
      method: 'POST',
      url: 'https://api.example.com/v1/webhooks/razorpay',
      statusCode: '504 Gateway Timeout',
      requestBody: '{\n  "event": "payment.captured",\n  "paymentId": "pay_OqW19kL28",\n  "orderId": "order_77192",\n  "amount": 199900\n}',
      responseBody: '{"error": "Webhook processing deadline exceeded"}',
      headers: 'x-razorpay-signature: 89fba710c...'
    },
    attachments: [],
    tags: ['payments', 'fintech', 'upi', 'webhook', 'idempotency', 'p0']
  },
  {
    id: 'bug_06',
    title: 'Navigation hamburger drawer lacks aria-expanded and keyboard focus trap',
    component: 'UI / Navigation Header (a11y)',
    severity: 'Minor (P3)',
    priority: 'P2 - Medium',
    frequency: 'Always (100%)',
    environment: 'Web (Chrome / NVDA / VoiceOver / Keyboard Navigation)',
    description: 'Opening the mobile navigation sidebar menu does not trap keyboard focus (Tab key escapes behind backdrop to inactive background DOM) and lacks aria-expanded / aria-controls attributes for screen readers.',
    steps: [
      'Navigate to homepage using only keyboard (Tab / Shift+Tab)',
      'Focus on the mobile menu hamburger button and press Enter / Space',
      'Press Tab key 5 times to navigate through drawer items'
    ],
    expected: 'Focus should be trapped inside drawer; hamburger button should have aria-expanded="true" and role="dialog".',
    actual: 'Focus moves behind the backdrop to invisible footer links; screen reader announces "button" without expanded state.',
    workaround: 'Using mouse or touch gestures closes the menu normally.',
    affectedVersion: 'v2.14.0',
    assignedTeam: 'Design System & Accessibility',
    featureFlag: 'a11y.wcag_compliance_v1: true',
    stackTrace: '',
    traceId: '',
    networkLog: {
      method: 'GET',
      url: 'https://app.example.com/',
      statusCode: '200 OK',
      requestBody: '',
      responseBody: '',
      headers: ''
    },
    attachments: [],
    tags: ['accessibility', 'wcag', 'keyboard-nav', 'aria', 'p2']
  },
  {
    id: 'bug_07',
    title: 'Memory heap climbs past 1.2 GB on infinite scroll table without cleanup',
    component: 'Frontend / Data Grid Component',
    severity: 'Major (P2)',
    priority: 'P1 - High',
    frequency: 'Always (100%)',
    environment: 'Chrome 128 (Windows 11 / 16GB RAM / DevTools Memory Profiler)',
    description: 'Scrolling past 500 rows in the analytics data table creates unreleased closure listeners on unmounted row elements, resulting in a 1.2 GB JS heap runaway and 15 FPS frame drops.',
    steps: [
      'Open Chrome DevTools -> Memory tab -> Take Heap Snapshot 1',
      'Navigate to /analytics/events and scroll down continuously to load 500+ items',
      'Take Heap Snapshot 2 and observe detached DOM nodes'
    ],
    expected: 'Row virtualizer cleans up unmounted listeners; JS heap remains stable under 80 MB.',
    actual: 'Heap size increases by ~250 MB per 100 rows; garbage collector fails to reclaim detached event listener closures.',
    workaround: 'Hard refreshing (Ctrl+F5) clears browser tab memory.',
    affectedVersion: 'v3.0.0',
    assignedTeam: 'Analytics & Performance Squad',
    featureFlag: 'table.virtual_scroll_v1: false',
    stackTrace: '',
    traceId: 'devtools-profile-2026',
    networkLog: {
      method: 'GET',
      url: 'https://app.example.com/api/analytics/events?page=5&limit=100',
      statusCode: '200 OK',
      requestBody: '',
      responseBody: '{"recordsCount": 100, "total": 12000}',
      headers: 'cache-control: no-store'
    },
    attachments: [],
    tags: ['performance', 'memory-leak', 'virtual-scroll', 'devtools', 'p1']
  },
  {
    id: 'bug_08',
    title: 'JWT Refresh Token race condition triggers infinite 401 redirect loop',
    component: 'Auth / Token Interceptor',
    severity: 'Major (P2)',
    priority: 'P1 - High',
    frequency: 'Frequently (>75%)',
    environment: 'Web & Mobile (Axios HTTP Client / React Query)',
    description: 'When 4 concurrent background API calls expire at the same time, all 4 simultaneously trigger /api/auth/refresh with the same single-use token, invalidating the refresh token family and logging user out.',
    steps: [
      'Log into application and let access token expire (15 min elapsed)',
      'Trigger page load that fires 4 parallel queries (profile, notifications, stats, orders)',
      'Inspect Network tab for 4 parallel /auth/refresh calls'
    ],
    expected: 'Axios interceptor locks pending requests, issues 1 refresh call, and replays queued requests with new token.',
    actual: 'The second refresh call fails with 401 INVALID_TOKEN_REUSE, forcing hard redirect to login screen.',
    workaround: 'Users must manually enter password and log back in.',
    affectedVersion: 'v2.10.0',
    assignedTeam: 'Identity & Authentication',
    featureFlag: 'auth.single_flight_refresh: false',
    stackTrace: 'Error: Refresh Token Reuse Detected\n  at TokenService.verifyRefreshToken (src/auth/token.ts:89)',
    traceId: 'auth-err-99a0b1',
    networkLog: {
      method: 'POST',
      url: 'https://api.example.com/api/auth/refresh',
      statusCode: '401 Unauthorized',
      requestBody: '{"refreshToken": "rt_987654321"}',
      responseBody: '{"error": "TOKEN_REUSED_COMPROMISED"}',
      headers: ''
    },
    attachments: [],
    tags: ['auth', 'jwt', 'security', 'race-condition', 'p1']
  },
  {
    id: 'bug_09',
    title: 'PostgreSQL row-level deadlock during concurrent flash-sale stock reservation',
    component: 'Database / Inventory Service',
    severity: 'Blocker (P0)',
    priority: 'P0 - Urgent / Immediate',
    frequency: 'Frequently (>75%)',
    environment: 'PostgreSQL 16.2 / AWS RDS Multi-AZ (500 req/sec load)',
    description: 'Concurrent transactions updating inventory table without consistent order of item IDs result in SQLSTATE 40P01 (deadlock detected), rolling back 12% of legitimate checkout requests.',
    steps: [
      'Simulate 100 parallel buyers purchasing combo items (Item A + Item B)',
      'Execute load test using k6 / Artillery',
      'Inspect Postgres error logs for Deadlock detected statements'
    ],
    expected: 'Transactions acquire locks in deterministic ascending ID order without deadlocks.',
    actual: 'PostgreSQL terminates transactions with "ERROR: deadlock detected - Process 1234 waits for ExclusiveLock".',
    workaround: 'Add retry exponential backoff on client side.',
    affectedVersion: 'v3.4.0',
    assignedTeam: 'Platform Database & Infrastructure',
    featureFlag: 'inventory.ordered_locking_v1: false',
    stackTrace: 'ERROR: deadlock detected\nDETAIL: Process 28192 waits for ExclusiveLock on tuple (14,8) of relation "inventory"',
    traceId: 'pg-deadlock-40p01',
    networkLog: {
      method: 'POST',
      url: 'https://api.example.com/v2/inventory/reserve',
      statusCode: '500 Internal Server Error',
      requestBody: '{"items": [{"id": 102}, {"id": 88}]}',
      responseBody: '{"error": "DB_DEADLOCK_ROLLBACK"}',
      headers: ''
    },
    attachments: [],
    tags: ['database', 'postgres', 'deadlock', 'concurrency', 'p0']
  },
  {
    id: 'bug_10',
    title: 'Redis cache invalidation miss leaves outdated GST tax rate in cart totals',
    component: 'Backend / Pricing & Cache Layer',
    severity: 'Major (P2)',
    priority: 'P1 - High',
    frequency: 'Frequently (>75%)',
    environment: 'Production (Redis 7.2 Cluster / Go Microservices)',
    description: 'Updating tax slab rates in admin console publishes event to Kafka, but Redis cluster key pattern `tax:hsn:*` fails to invalidate due to wildcard matching bug in cluster node 2.',
    steps: [
      'Update GST tax rate for HSN 8471 from 18% to 12% in Admin portal',
      'Add HSN 8471 product to cart as a regular customer',
      'Check calculated tax on checkout page'
    ],
    expected: 'Cart fetches fresh 12% tax slab rate immediately after admin save.',
    actual: 'Cart continues calculating tax at 18% from stale Redis cache until 24h TTL expires.',
    workaround: 'Flush Redis keys manually via admin CLI tool.',
    affectedVersion: 'v2.18.1',
    assignedTeam: 'Pricing & Catalog Squad',
    featureFlag: 'cache.pubsub_invalidation: true',
    stackTrace: '',
    traceId: 'tax_cache_miss_88',
    networkLog: {
      method: 'GET',
      url: 'https://api.example.com/v1/tax/calculate?hsn=8471',
      statusCode: '200 OK',
      requestBody: '',
      responseBody: '{"hsn": "8471", "rate": 0.18, "source": "redis_cached"}',
      headers: ''
    },
    attachments: [],
    tags: ['cache', 'redis', 'pricing', 'tax', 'p1']
  }
];

// Blank bug template generator
function createBlankBug(customTitle?: string): BugReportData {
  return {
    id: 'bug_' + Math.random().toString(36).substring(2, 9),
    title: customTitle || '',
    component: '',
    severity: 'Major (P2)',
    priority: 'P2 - Medium',
    frequency: 'Always (100%)',
    environment: 'Production (Web / Chrome 128 / Windows 11)',
    description: '',
    steps: ['Navigate to application dashboard', 'Click on...', 'Observe unexpected behavior...'],
    expected: '',
    actual: '',
    workaround: '',
    affectedVersion: 'v1.0.0',
    assignedTeam: 'QA & Engineering',
    featureFlag: '',
    networkLog: {
      method: 'GET',
      url: '',
      statusCode: '',
      requestBody: '',
      responseBody: '',
      headers: ''
    },
    stackTrace: '',
    traceId: '',
    attachments: [],
    tags: ['bug', 'qa-verified']
  };
}

export default function BugReportGenerator() {
  // --- MULTI-BUG SUITE STATE ---
  const [suiteTitle, setSuiteTitle] = useState('Sprint 42 QA Defect Suite');
  const [suite, setSuite] = useState<BugReportData[]>(() => {
    try {
      const saved = localStorage.getItem('toolique_bug_suite_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return [SAMPLE_12_BUGS_SUITE[0]];
  });

  const [activeBugIndex, setActiveBugIndex] = useState<number>(0);
  const activeBug = suite[activeBugIndex] || suite[0] || createBlankBug();

  const [activeTab, setActiveTab] = useState<TabSection>('editor');
  const [singleExportFormat, setSingleExportFormat] = useState<SingleExportFormat>('github');
  const [batchExportFormat, setBatchExportFormat] = useState<BatchExportFormat>('csv');
  const [copied, setCopied] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showBulkStepModal, setShowBulkStepModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [rawTextSteps, setRawTextSteps] = useState('');
  const [gitHubRepo, setGitHubRepo] = useState('organization/repository');
  const [tagInput, setTagInput] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentType, setAttachmentType] = useState<AttachmentItem['type']>('Screenshot');

  // Auto-save suite to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('toolique_bug_suite_draft', JSON.stringify(suite));
    } catch {
      // ignore
    }
  }, [suite]);

  // Update active bug
  const updateActiveBug = useCallback((updater: (prev: BugReportData) => BugReportData) => {
    setSuite(prevSuite => {
      const copy = [...prevSuite];
      const targetIdx = activeBugIndex < copy.length ? activeBugIndex : 0;
      copy[targetIdx] = updater(copy[targetIdx] || createBlankBug());
      return copy;
    });
  }, [activeBugIndex]);

  // --- SUITE ACTIONS ---
  const handleAddBugToSuite = () => {
    const newBug = createBlankBug(`Untitled Defect #${suite.length + 1}`);
    setSuite(prev => [...prev, newBug]);
    setActiveBugIndex(suite.length);
  };

  const handleDuplicateActiveBug = () => {
    const clone: BugReportData = {
      ...activeBug,
      id: 'bug_' + Math.random().toString(36).substring(2, 9),
      title: `${activeBug.title || 'Defect'} (Copy)`,
      steps: [...activeBug.steps],
      tags: [...activeBug.tags],
      attachments: [...activeBug.attachments],
      networkLog: { ...activeBug.networkLog }
    };
    setSuite(prev => [...prev, clone]);
    setActiveBugIndex(suite.length);
  };

  const handleRemoveBugFromSuite = (index: number) => {
    if (suite.length <= 1) {
      setSuite([createBlankBug()]);
      setActiveBugIndex(0);
      return;
    }
    const filtered = suite.filter((_, i) => i !== index);
    setSuite(filtered);
    if (activeBugIndex >= filtered.length) {
      setActiveBugIndex(filtered.length - 1);
    }
  };

  const handleLoadSample10Suite = () => {
    setSuite(SAMPLE_12_BUGS_SUITE);
    setActiveBugIndex(0);
    setSuiteTitle('Release v2.4 Regression Test Run (10 Defects)');
  };

  const handleClearSuite = () => {
    setSuite([createBlankBug()]);
    setActiveBugIndex(0);
  };

  // --- 1-CLICK SYSTEM DIAGNOSTICS DETECTION ---
  const autoDetectSystemInfo = useCallback(() => {
    try {
      const nav = window.navigator;
      const ua = nav.userAgent;
      let browser = 'Unknown Browser';
      if (ua.indexOf('Firefox') > -1) browser = 'Mozilla Firefox';
      else if (ua.indexOf('SamsungBrowser') > -1) browser = 'Samsung Internet';
      else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';
      else if (ua.indexOf('Trident') > -1) browser = 'Internet Explorer';
      else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) browser = 'Microsoft Edge';
      else if (ua.indexOf('Chrome') > -1) browser = 'Google Chrome';
      else if (ua.indexOf('Safari') > -1) browser = 'Apple Safari';

      let os = 'Unknown OS';
      if (ua.indexOf('Win') > -1) os = 'Windows OS';
      else if (ua.indexOf('Mac') > -1) os = 'macOS';
      else if (ua.indexOf('Linux') > -1) os = 'Linux OS';
      else if (ua.indexOf('Android') > -1) os = 'Android OS';
      else if (ua.indexOf('like Mac') > -1) os = 'iOS Device';

      const screenRes = `${window.screen.width}x${window.screen.height}`;
      const viewport = `${window.innerWidth}x${window.innerHeight}`;
      const dpr = window.devicePixelRatio || 1;
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const lang = nav.language || 'en-US';
      const online = nav.onLine ? 'Online' : 'Offline';
      const cpu = (nav as unknown as { hardwareConcurrency?: number }).hardwareConcurrency || 'N/A';
      const mem = (nav as unknown as { deviceMemory?: number }).deviceMemory ? `~${(nav as unknown as { deviceMemory?: number }).deviceMemory} GB` : 'N/A';

      const detected = `Web (${browser} / ${os}) | Viewport: ${viewport} (Screen: ${screenRes}, DPR: ${dpr}) | Cores: ${cpu}, RAM: ${mem} | Lang: ${lang}, TZ: ${timeZone}, Status: ${online}`;

      updateActiveBug(prev => ({
        ...prev,
        environment: detected
      }));
    } catch {
      // fallback
    }
  }, [updateActiveBug]);

  // --- STEP MANAGEMENT ---
  const handleStepChange = (index: number, val: string) => {
    updateActiveBug(prev => {
      const updated = [...prev.steps];
      updated[index] = val;
      return { ...prev, steps: updated };
    });
  };

  const handleAddStep = (presetText?: string) => {
    updateActiveBug(prev => ({
      ...prev,
      steps: [...prev.steps, presetText || '']
    }));
  };

  const handleRemoveStep = (index: number) => {
    updateActiveBug(prev => {
      if (prev.steps.length <= 1) {
        return { ...prev, steps: [''] };
      }
      return {
        ...prev,
        steps: prev.steps.filter((_, i) => i !== index)
      };
    });
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    updateActiveBug(prev => {
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.steps.length) return prev;
      const updated = [...prev.steps];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return { ...prev, steps: updated };
    });
  };

  const handleBulkImportSteps = () => {
    if (!rawTextSteps.trim()) return;
    const parsed = rawTextSteps
      .split('\n')
      .map(line => line.replace(/^(\d+[\.\)]|\-|\*|\>)\s*/, '').trim())
      .filter(line => line.length > 0);

    if (parsed.length > 0) {
      updateActiveBug(prev => ({ ...prev, steps: parsed }));
      setRawTextSteps('');
      setShowBulkStepModal(false);
    }
  };

  // --- TAGS MANAGEMENT ---
  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (clean && !activeBug.tags.includes(clean)) {
      updateActiveBug(prev => ({ ...prev, tags: [...prev.tags, clean] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    updateActiveBug(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  // --- ATTACHMENTS MANAGEMENT ---
  const handleAddAttachment = () => {
    if (!attachmentName.trim() || !attachmentUrl.trim()) return;
    const newItem: AttachmentItem = {
      id: 'att_' + Math.random().toString(36).substring(2, 9),
      name: attachmentName.trim(),
      url: attachmentUrl.trim(),
      type: attachmentType
    };
    updateActiveBug(prev => ({
      ...prev,
      attachments: [...prev.attachments, newItem]
    }));
    setAttachmentName('');
    setAttachmentUrl('');
  };

  const handleRemoveAttachment = (id: string) => {
    updateActiveBug(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== id)
    }));
  };

  // --- SUITE SEVERITY BREAKDOWN METRICS ---
  const suiteMetrics = useMemo(() => {
    const counts = {
      total: suite.length,
      blocker: 0,
      critical: 0,
      major: 0,
      minor: 0,
      trivial: 0
    };
    suite.forEach(b => {
      if (b.severity.includes('Blocker')) counts.blocker++;
      else if (b.severity.includes('Critical')) counts.critical++;
      else if (b.severity.includes('Major')) counts.major++;
      else if (b.severity.includes('Minor')) counts.minor++;
      else counts.trivial++;
    });
    return counts;
  }, [suite]);

  // --- SINGLE DEFECT GFM GENERATOR ---
  const generateSingleGitHubMarkdown = useCallback((bugItem: BugReportData) => {
    let md = `## 🐛 [BUG] ${bugItem.title || 'Untitled Defect'}\n\n`;
    md += `### 📋 Overview & Classification\n`;
    md += `| Attribute | Value |\n`;
    md += `| :--- | :--- |\n`;
    md += `| **Severity** | \`${bugItem.severity}\` |\n`;
    md += `| **Priority** | \`${bugItem.priority}\` |\n`;
    md += `| **Frequency** | \`${bugItem.frequency}\` |\n`;
    md += `| **Component** | ${bugItem.component || 'General'} |\n`;
    md += `| **Affected Version** | \`${bugItem.affectedVersion || 'N/A'}\` |\n`;
    if (bugItem.assignedTeam) md += `| **Assigned Team** | ${bugItem.assignedTeam} |\n`;
    if (bugItem.featureFlag) md += `| **Feature Flag** | \`${bugItem.featureFlag}\` |\n`;
    md += `\n`;

    md += `### 📝 Description\n${bugItem.description || '_No summary description provided._'}\n\n`;

    md += `### 👣 Steps to Reproduce\n`;
    const activeSteps = bugItem.steps.filter(s => s.trim());
    if (activeSteps.length > 0) {
      activeSteps.forEach((s, idx) => {
        md += `${idx + 1}. ${s.trim()}\n`;
      });
    } else {
      md += `1. _No steps recorded_\n`;
    }
    md += `\n`;

    md += `### 🎯 Expected vs Actual Behavior\n`;
    md += `#### 🟢 Expected Result\n> ${bugItem.expected || '_What should have occurred._'}\n\n`;
    md += `#### 🔴 Actual Result\n> ${bugItem.actual || '_What actually occurred._'}\n\n`;

    if (bugItem.workaround.trim()) {
      md += `### 💡 Workaround / Temporary Mitigation\n> ${bugItem.workaround.trim()}\n\n`;
    }

    md += `### 💻 Environment & System Specifications\n`;
    md += `<details>\n<summary><b>Click to expand system environment details</b></summary>\n\n`;
    md += `\`\`\`yaml\n`;
    md += `Environment: "${bugItem.environment || 'Not specified'}"\n`;
    md += `Timestamp: "${new Date().toISOString()}"\n`;
    if (bugItem.traceId) md += `TraceId: "${bugItem.traceId}"\n`;
    md += `\`\`\`\n</details>\n\n`;

    if (bugItem.networkLog.url.trim() || bugItem.networkLog.statusCode.trim() || bugItem.networkLog.requestBody.trim()) {
      md += `### 🌐 Network & API Telemetry\n`;
      md += `<details>\n<summary><b>API Request: ${bugItem.networkLog.method} ${bugItem.networkLog.url || '/api/endpoint'} (${bugItem.networkLog.statusCode || 'Status Unknown'})</b></summary>\n\n`;
      if (bugItem.networkLog.requestBody.trim()) {
        md += `**Request Payload:**\n\`\`\`json\n${bugItem.networkLog.requestBody.trim()}\n\`\`\`\n\n`;
      }
      if (bugItem.networkLog.responseBody.trim()) {
        md += `**Response Payload:**\n\`\`\`json\n${bugItem.networkLog.responseBody.trim()}\n\`\`\`\n\n`;
      }
      md += `**Reproducible cURL:**\n\`\`\`bash\ncurl -X ${bugItem.networkLog.method} "${bugItem.networkLog.url || 'https://api.example.com'}" \\\n  -H "Content-Type: application/json"`;
      if (bugItem.networkLog.requestBody.trim()) {
        md += ` \\\n  -d '${bugItem.networkLog.requestBody.trim().replace(/\n/g, '')}'`;
      }
      md += `\n\`\`\`\n</details>\n\n`;
    }

    if (bugItem.stackTrace.trim()) {
      md += `### 🪵 Console & Stack Trace Logs\n`;
      md += `<details>\n<summary><b>Stack Trace (${bugItem.traceId || 'Error Trace'})</b></summary>\n\n`;
      md += `\`\`\`text\n${bugItem.stackTrace.trim()}\n\`\`\`\n</details>\n\n`;
    }

    if (bugItem.attachments.length > 0) {
      md += `### 📎 Attachments & Evidence\n`;
      bugItem.attachments.forEach(att => {
        md += `- [${att.type}: ${att.name}](${att.url})\n`;
      });
      md += `\n`;
    }

    if (bugItem.tags.length > 0) {
      md += `---\n**Labels:** \`${bugItem.tags.join('`, `')}\`\n\n`;
    }

    return md;
  }, []);

  // --- BATCH EXPORTER 1: JIRA & EXCEL COMPATIBLE CSV ---
  const generateSuiteCSV = useCallback(() => {
    const headers = [
      'Issue Key',
      'Summary',
      'Issue Type',
      'Severity',
      'Priority',
      'Frequency',
      'Component',
      'Affected Version',
      'Environment',
      'Description',
      'Steps to Reproduce',
      'Expected Result',
      'Actual Result',
      'Workaround',
      'Trace ID',
      'API Method',
      'API URL',
      'API Status',
      'Labels'
    ];

    const escapeCsvField = (val: string | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = suite.map((b, idx) => {
      const stepsFormatted = b.steps
        .filter(s => s.trim())
        .map((s, i) => `${i + 1}. ${s.trim()}`)
        .join('\n');

      return [
        escapeCsvField(`BUG-${String(idx + 1).padStart(3, '0')}`),
        escapeCsvField(b.title || 'Untitled Defect'),
        escapeCsvField('Bug'),
        escapeCsvField(b.severity),
        escapeCsvField(b.priority),
        escapeCsvField(b.frequency),
        escapeCsvField(b.component || 'General'),
        escapeCsvField(b.affectedVersion || ''),
        escapeCsvField(b.environment || ''),
        escapeCsvField(b.description || ''),
        escapeCsvField(stepsFormatted),
        escapeCsvField(b.expected || ''),
        escapeCsvField(b.actual || ''),
        escapeCsvField(b.workaround || ''),
        escapeCsvField(b.traceId || ''),
        escapeCsvField(b.networkLog.method || ''),
        escapeCsvField(b.networkLog.url || ''),
        escapeCsvField(b.networkLog.statusCode || ''),
        escapeCsvField(b.tags.join(', '))
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }, [suite]);

  // --- BATCH EXPORTER 2: UNIFIED MULTI-BUG MARKDOWN DIGEST ---
  const generateSuiteMarkdown = useCallback(() => {
    let md = `# 📋 QA Test Run & Defect Suite: ${suiteTitle}\n\n`;
    md += `> **Generated Date:** ${new Date().toISOString().slice(0, 10)} | **Total Defects:** ${suite.length} | **Environment:** Toolique QA Studio\n\n`;

    md += `### 📊 Executive Triage Summary\n`;
    md += `| Metric | Count | Distribution |\n`;
    md += `| :--- | :--- | :--- |\n`;
    md += `| 🚨 **Blocker (P0)** | ${suiteMetrics.blocker} | ${Math.round((suiteMetrics.blocker / suite.length) * 100)}% |\n`;
    md += `| 🔴 **Critical (P1)** | ${suiteMetrics.critical} | ${Math.round((suiteMetrics.critical / suite.length) * 100)}% |\n`;
    md += `| 🟡 **Major (P2)** | ${suiteMetrics.major} | ${Math.round((suiteMetrics.major / suite.length) * 100)}% |\n`;
    md += `| 🟢 **Minor (P3)** | ${suiteMetrics.minor} | ${Math.round((suiteMetrics.minor / suite.length) * 100)}% |\n`;
    md += `| ⚪ **Trivial (P4)** | ${suiteMetrics.trivial} | ${Math.round((suiteMetrics.trivial / suite.length) * 100)}% |\n`;
    md += `\n`;

    md += `### 📑 Defect Index & Table of Contents\n`;
    md += `| # | Defect Summary | Severity | Priority | Component | Frequency |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    suite.forEach((b, idx) => {
      const anchor = (b.title || `bug-${idx + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      md += `| ${idx + 1} | [${b.title || 'Untitled Defect'}](#${anchor}) | \`${b.severity}\` | \`${b.priority}\` | ${b.component || 'General'} | ${b.frequency} |\n`;
    });
    md += `\n---\n\n`;

    md += `## 🐞 Detailed Defect Specifications\n\n`;
    suite.forEach((b, idx) => {
      md += `### Defect #${idx + 1}: ${b.title || 'Untitled Defect'}\n\n`;
      md += generateSingleGitHubMarkdown(b);
      md += `\n---\n\n`;
    });

    md += `_Defect Suite Compiled via [Toolique QA Studio](https://www.toolique.in/qa/bug-report-generator)_\n`;
    return md;
  }, [suite, suiteTitle, suiteMetrics, generateSingleGitHubMarkdown]);

  // --- BATCH EXPORTER 3: JSON SUITE SCHEMA ---
  const generateSuiteJson = useCallback(() => {
    return JSON.stringify(
      {
        suiteTitle: suiteTitle,
        schemaVersion: '2.0.0-suite',
        exportedAt: new Date().toISOString(),
        totalDefects: suite.length,
        metrics: suiteMetrics,
        defects: suite.map((b, idx) => ({
          key: `BUG-${String(idx + 1).padStart(3, '0')}`,
          title: b.title,
          component: b.component,
          severity: b.severity,
          priority: b.priority,
          frequency: b.frequency,
          environment: b.environment,
          description: b.description,
          stepsToReproduce: b.steps.filter(s => s.trim()),
          expectedResult: b.expected,
          actualResult: b.actual,
          workaround: b.workaround,
          version: b.affectedVersion,
          assignedTeam: b.assignedTeam,
          featureFlag: b.featureFlag,
          traceId: b.traceId,
          networkTelemetry: b.networkLog,
          stackTrace: b.stackTrace,
          attachments: b.attachments,
          labels: b.tags
        }))
      },
      null,
      2
    );
  }, [suite, suiteTitle, suiteMetrics]);

  // --- BATCH EXPORTER 4: JIRA SUITE DOCUMENT ---
  const generateSuiteJira = useCallback(() => {
    let jira = `h1. QA Test Run: ${suiteTitle}\n\n`;
    jira += `|| # || Summary || Severity || Priority || Component ||\n`;
    suite.forEach((b, idx) => {
      jira += `| ${idx + 1} | ${b.title || 'Untitled'} | {color:red}${b.severity}{color} | ${b.priority} | ${b.component || 'General'} |\n`;
    });
    jira += `\n----\n\n`;

    suite.forEach((b, idx) => {
      jira += `h2. #${idx + 1}: ${b.title || 'Untitled Defect'}\n\n`;
      jira += `*Component:* ${b.component || 'General'} | *Severity:* ${b.severity} | *Priority:* ${b.priority}\n\n`;
      jira += `h3. Description\n${b.description || 'N/A'}\n\n`;
      jira += `h3. Steps to Reproduce\n`;
      b.steps.filter(s => s.trim()).forEach(s => {
        jira += `# ${s.trim()}\n`;
      });
      jira += `\nh3. Expected\n{quote}${b.expected || 'N/A'}{quote}\n\n`;
      jira += `h3. Actual\n{quote}${b.actual || 'N/A'}{quote}\n\n`;
      if (b.workaround) jira += `h3. Workaround\n${b.workaround}\n\n`;
      jira += `----\n\n`;
    });
    return jira;
  }, [suite, suiteTitle]);

  // --- BATCH EXPORTER 5: EXECUTIVE HTML DIGEST ---
  const generateSuiteHtml = useCallback(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${suiteTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 0 auto; padding: 24px; }
    h1, h2, h3 { color: #0f172a; }
    .header { border-bottom: 3px solid #6366f1; padding-bottom: 12px; margin-bottom: 24px; }
    .stats-bar { display: flex; gap: 12px; margin-bottom: 24px; }
    .stat-pill { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-size: 13px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; }
    .badge-critical { background: #fee2e2; color: #991b1b; }
    .badge-major { background: #fef3c7; color: #92400e; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    .bug-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    blockquote { border-left: 4px solid #6366f1; margin: 0; padding-left: 12px; color: #475569; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 ${suiteTitle}</h1>
    <p>Total Defects: <b>${suite.length}</b> | Generated Date: ${new Date().toISOString().slice(0, 10)} | Toolique QA Studio</p>
  </div>

  <div class="stats-bar">
    <div class="stat-pill">🚨 Blockers: ${suiteMetrics.blocker}</div>
    <div class="stat-pill">🔴 Critical: ${suiteMetrics.critical}</div>
    <div class="stat-pill">🟡 Major: ${suiteMetrics.major}</div>
    <div class="stat-pill">🟢 Minor: ${suiteMetrics.minor}</div>
  </div>

  <h2>Defect Index</h2>
  <table>
    <tr><th>#</th><th>Summary</th><th>Severity</th><th>Priority</th><th>Component</th></tr>
    ${suite.map((b, i) => `<tr><td>${i + 1}</td><td><b>${b.title || 'Untitled'}</b></td><td><span class="badge ${b.severity.includes('Critical') || b.severity.includes('Blocker') ? 'badge-critical' : 'badge-major'}">${b.severity}</span></td><td>${b.priority}</td><td>${b.component || 'General'}</td></tr>`).join('')}
  </table>

  <h2>Detailed Specifications</h2>
  ${suite.map((b, i) => `
  <div class="bug-card">
    <h3>#${i + 1}: ${b.title || 'Untitled Defect'}</h3>
    <p><b>Component:</b> ${b.component || 'General'} | <b>Severity:</b> ${b.severity} | <b>Env:</b> ${b.environment}</p>
    <p>${b.description || 'No description provided.'}</p>
    <h4>Steps to Reproduce:</h4>
    <ol>${b.steps.filter(s => s.trim()).map(s => `<li>${s}</li>`).join('')}</ol>
    <h4>Expected Result:</h4>
    <blockquote>${b.expected || 'N/A'}</blockquote>
    <h4>Actual Result:</h4>
    <blockquote>${b.actual || 'N/A'}</blockquote>
  </div>`).join('')}
</body>
</html>`;
  }, [suite, suiteTitle, suiteMetrics]);

  // Active Output Text based on selected platform format (Single Ticket vs Batch Suite)
  const activeSingleOutputText = useMemo(() => {
    switch (singleExportFormat) {
      case 'github':
        return generateSingleGitHubMarkdown(activeBug);
      case 'jira_wiki':
        return `h2. [BUG] ${activeBug.title || 'Untitled Defect'}\n*Component:* ${activeBug.component || 'General'} | *Severity:* ${activeBug.severity}\n\nh3. Description\n${activeBug.description}\n\nh3. Steps\n${activeBug.steps.map(s => `# ${s}`).join('\n')}\n\nh3. Expected\n{quote}${activeBug.expected}{quote}\n\nh3. Actual\n{quote}${activeBug.actual}{quote}`;
      case 'linear':
        return `**${activeBug.title}**\n> Severity: ${activeBug.severity} | Priority: ${activeBug.priority}\n\n### Steps\n${activeBug.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n### Expected\n${activeBug.expected}\n\n### Actual\n${activeBug.actual}`;
      case 'gitlab':
        return `/title [BUG] ${activeBug.title}\n/label ~"bug"\n\n${generateSingleGitHubMarkdown(activeBug)}`;
      case 'slack':
        return `🚨 *[BUG] ${activeBug.title}*\n• Severity: \`${activeBug.severity}\` | Component: \`${activeBug.component}\`\n• Steps:\n${activeBug.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n• Actual: ${activeBug.actual}`;
      case 'html':
        return `<div style="font-family: sans-serif;"><h2>${activeBug.title}</h2><p><b>Severity:</b> ${activeBug.severity}</p><ol>${activeBug.steps.map(s => `<li>${s}</li>`).join('')}</ol></div>`;
      case 'json':
        return JSON.stringify({ defect: activeBug }, null, 2);
      default:
        return generateSingleGitHubMarkdown(activeBug);
    }
  }, [singleExportFormat, activeBug, generateSingleGitHubMarkdown]);

  // Active Batch Output Text
  const activeBatchOutputText = useMemo(() => {
    switch (batchExportFormat) {
      case 'csv':
        return generateSuiteCSV();
      case 'markdown_suite':
        return generateSuiteMarkdown();
      case 'json_suite':
        return generateSuiteJson();
      case 'jira_suite':
        return generateSuiteJira();
      case 'html_suite':
        return generateSuiteHtml();
      default:
        return generateSuiteCSV();
    }
  }, [batchExportFormat, generateSuiteCSV, generateSuiteMarkdown, generateSuiteJson, generateSuiteJira, generateSuiteHtml]);

  // --- ACTIONS ---
  const handleCopySingle = () => {
    navigator.clipboard.writeText(activeSingleOutputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBatch = () => {
    navigator.clipboard.writeText(activeBatchOutputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBatch = () => {
    const slug = (suiteTitle || 'defect-suite').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const ext = batchExportFormat === 'csv' ? 'csv' : batchExportFormat === 'json_suite' ? 'json' : batchExportFormat === 'html_suite' ? 'html' : 'md';
    const mime = batchExportFormat === 'csv' ? 'text/csv' : batchExportFormat === 'json_suite' ? 'application/json' : batchExportFormat === 'html_suite' ? 'text/html' : 'text/markdown';
    const blob = new Blob([activeBatchOutputText], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug}-${suite.length}-defects.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSingle = () => {
    const slug = (activeBug.title || 'bug-report').toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 35);
    const ext = singleExportFormat === 'json' ? 'json' : singleExportFormat === 'html' ? 'html' : 'md';
    const mime = singleExportFormat === 'json' ? 'application/json' : singleExportFormat === 'html' ? 'text/html' : 'text/markdown';
    const blob = new Blob([activeSingleOutputText], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug}-${new Date().toISOString().slice(0, 10)}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenGitHubDirect = () => {
    const titleParam = encodeURIComponent(activeBug.title ? `[BUG] ${activeBug.title}` : '[BUG] Defect Title');
    const bodyParam = encodeURIComponent(generateSingleGitHubMarkdown(activeBug));
    const targetUrl = `https://github.com/${gitHubRepo.trim() || 'facebook/react'}/issues/new?title=${titleParam}&body=${bodyParam}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setShowGitHubModal(false);
  };

  return (
    <div className="space-y-6">

      {/* --- TOP SUITE MANAGER & BATCH ACTIONS BAR --- */}
      <div className="saas-card p-4 space-y-3.5 bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-pink-500/5 border-indigo-200/80 dark:border-indigo-800/60">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={suiteTitle}
                  onChange={(e) => setSuiteTitle(e.target.value)}
                  placeholder="Test Run / Defect Suite Title..."
                  className="text-sm font-black bg-transparent border-none text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded px-1 -ml-1 w-64 sm:w-80"
                />
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {suite.length} Defects in Suite
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
                <span>Active Ticket: #{activeBugIndex + 1} of {suite.length}</span>
                <span>•</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">{suiteMetrics.blocker} Blockers</span>
                <span>•</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{suiteMetrics.critical} Critical</span>
                <span>•</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{suiteMetrics.major} Major</span>
              </div>
            </div>
          </div>

          {/* Quick Suite Generator & Batch Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample10Suite}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              title="Instantly populate a comprehensive 10-defect test run across UI, API, Mobile, Security, Payment, and Perf"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Generate 10 Sample QA Bugs Suite</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBatchModal(true)}
              className="saas-button-primary py-1.5 px-3.5 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Batch Download Suite ({suite.length} Bugs CSV/MD)</span>
            </button>

            <button
              type="button"
              onClick={handleAddBugToSuite}
              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition shadow-2xs flex items-center gap-1 text-xs font-bold"
              title="Add a new blank defect ticket to suite"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Add Bug</span>
            </button>

            <button
              type="button"
              onClick={handleClearSuite}
              className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-450 hover:text-rose-500 cursor-pointer transition shadow-2xs"
              title="Clear all bugs and reset to 1 blank defect"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrolling Defect Queue Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5">
          {suite.map((b, idx) => (
            <div
              key={b.id || idx}
              onClick={() => setActiveBugIndex(idx)}
              className={`group px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all duration-150 flex items-center gap-2 shrink-0 select-none ${
                activeBugIndex === idx
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white/80 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 border-zinc-200/90 dark:border-zinc-800 hover:border-indigo-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                b.severity.includes('Blocker') || b.severity.includes('Critical')
                  ? 'bg-rose-400'
                  : b.severity.includes('Major')
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`} />
              <span className="font-mono text-[10px] opacity-80">#{idx + 1}</span>
              <span className="max-w-[140px] truncate text-[11px]">
                {b.title || 'Untitled Defect'}
              </span>
              {suite.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveBugFromSuite(idx);
                  }}
                  className={`p-0.5 rounded opacity-50 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 ${
                    activeBugIndex === idx ? 'text-white' : 'text-zinc-400 hover:text-rose-500'
                  }`}
                  title="Remove from suite"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddBugToSuite}
            className="px-2.5 py-1.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 text-zinc-500 hover:text-indigo-600 text-[11px] font-bold shrink-0 flex items-center gap-1 cursor-pointer transition"
          >
            <Plus className="w-3 h-3" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* --- MAIN INTERACTIVE WORKSPACE (2-COLUMN GRID) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: ACTIVE DEFECT EDITOR */}
        <div className="lg:col-span-6 space-y-4">
          <div className="saas-card p-5 space-y-5">
            {/* Editor Header & Sub-Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'editor'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Bug className="w-3.5 h-3.5" />
                  <span>Bug #{activeBugIndex + 1} Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('logs')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'logs'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Logs & API ({activeBug.networkLog.url || activeBug.stackTrace ? 'Active' : 'Empty'})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('attachments')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'attachments'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Evidence ({activeBug.attachments.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDuplicateActiveBug}
                  className="text-[11px] font-bold text-zinc-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition"
                  title="Duplicate this bug as a new ticket in suite"
                >
                  <Layers3 className="w-3 h-3" />
                  <span>Clone Bug</span>
                </button>
              </div>
            </div>

            {/* TAB 1: DEFECT FIELDS */}
            {activeTab === 'editor' && (
              <div className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex justify-between">
                    <span>Defect Title *</span>
                    <span className="text-zinc-400 font-normal">{activeBug.title.length} characters</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. POST /api/v2/orders fails with HTTP 500 when coupon code is applied"
                    value={activeBug.title}
                    onChange={(e) => updateActiveBug(b => ({ ...b, title: e.target.value }))}
                    className="saas-input font-bold"
                  />
                </div>

                {/* Severity, Priority & Frequency Triad */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Severity</label>
                    <select
                      value={activeBug.severity}
                      onChange={(e) => updateActiveBug(b => ({ ...b, severity: e.target.value as SeverityLevel }))}
                      className="saas-select text-xs font-bold"
                    >
                      <option value="Blocker (P0)">🚨 Blocker (P0)</option>
                      <option value="Critical (P1)">🔴 Critical (P1)</option>
                      <option value="Major (P2)">🟡 Major (P2)</option>
                      <option value="Minor (P3)">🟢 Minor (P3)</option>
                      <option value="Trivial (P4)">⚪ Trivial (P4)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Priority</label>
                    <select
                      value={activeBug.priority}
                      onChange={(e) => updateActiveBug(b => ({ ...b, priority: e.target.value as PriorityLevel }))}
                      className="saas-select text-xs font-bold"
                    >
                      <option value="P0 - Urgent / Immediate">⚡ P0 - Immediate</option>
                      <option value="P1 - High">🔥 P1 - High</option>
                      <option value="P2 - Medium">📋 P2 - Medium</option>
                      <option value="P3 - Low">🌱 P3 - Low</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Frequency</label>
                    <select
                      value={activeBug.frequency}
                      onChange={(e) => updateActiveBug(b => ({ ...b, frequency: e.target.value as FrequencyLevel }))}
                      className="saas-select text-xs font-bold"
                    >
                      <option value="Always (100%)">100% (Always)</option>
                      <option value="Frequently (>75%)">&gt;75% (Frequently)</option>
                      <option value="Intermittently (~50%)">~50% (Intermittent)</option>
                      <option value="Rarely (<10%)">&lt;10% (Rare)</option>
                      <option value="Occurred Once">Occurred Once</option>
                    </select>
                  </div>
                </div>

                {/* Component, Affected Version & Team */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Component / Domain</label>
                    <input
                      type="text"
                      placeholder="e.g. Auth, Checkout, API"
                      value={activeBug.component}
                      onChange={(e) => updateActiveBug(b => ({ ...b, component: e.target.value }))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Affected Version</label>
                    <input
                      type="text"
                      placeholder="e.g. v2.14.0-rc2"
                      value={activeBug.affectedVersion}
                      onChange={(e) => updateActiveBug(b => ({ ...b, affectedVersion: e.target.value }))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Assigned Team</label>
                    <input
                      type="text"
                      placeholder="e.g. Checkout Squad"
                      value={activeBug.assignedTeam}
                      onChange={(e) => updateActiveBug(b => ({ ...b, assignedTeam: e.target.value }))}
                      className="saas-input text-xs"
                    />
                  </div>
                </div>

                {/* Environment with Auto-Detect */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Testing Environment & Specs
                    </label>
                    <button
                      type="button"
                      onClick={autoDetectSystemInfo}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>1-Click Auto-Detect System</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Production (Chrome 128 / macOS Sonoma / Viewport: 1920x1080)"
                    value={activeBug.environment}
                    onChange={(e) => updateActiveBug(b => ({ ...b, environment: e.target.value }))}
                    className="saas-input text-xs font-mono"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Defect Summary & Context
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide a concise summary explaining the defect scope, user impact, and observed failure..."
                    value={activeBug.description}
                    onChange={(e) => updateActiveBug(b => ({ ...b, description: e.target.value }))}
                    className="saas-input resize-none text-xs leading-relaxed"
                  />
                </div>

                {/* Steps to Reproduce */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                      <span>Steps to Reproduce</span>
                      <span className="text-zinc-400">({activeBug.steps.length} steps)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBulkStepModal(true)}
                        className="text-[10px] font-bold text-zinc-500 hover:text-indigo-600 cursor-pointer"
                      >
                        Paste List
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddStep()}
                        className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Step</span>
                      </button>
                    </div>
                  </div>

                  {/* Steps Input Rows */}
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {activeBug.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 group">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 w-5 text-right">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => handleStepChange(idx, e.target.value)}
                          placeholder={`Step ${idx + 1} action...`}
                          className="saas-input py-1.5 text-xs flex-1"
                        />
                        <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition">
                          <button
                            type="button"
                            onClick={() => handleMoveStep(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveStep(idx, 'down')}
                            disabled={idx === activeBug.steps.length - 1}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(idx)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected vs Actual Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Expected Behavior *</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Specify what should have correctly happened..."
                      value={activeBug.expected}
                      onChange={(e) => updateActiveBug(b => ({ ...b, expected: e.target.value }))}
                      className="saas-input resize-none text-xs border-emerald-200/80 dark:border-emerald-900/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Actual Behavior *</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Specify what broken result or error occurred..."
                      value={activeBug.actual}
                      onChange={(e) => updateActiveBug(b => ({ ...b, actual: e.target.value }))}
                      className="saas-input resize-none text-xs border-rose-200/80 dark:border-rose-900/40"
                    />
                  </div>
                </div>

                {/* Workaround */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Workaround / Temporary Mitigation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hard refreshing clears cached session"
                    value={activeBug.workaround}
                    onChange={(e) => updateActiveBug(b => ({ ...b, workaround: e.target.value }))}
                    className="saas-input text-xs"
                  />
                </div>

                {/* Tags & Labels */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Defect Labels & Tags
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50">
                    {activeBug.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-[10px] font-bold text-indigo-700 dark:text-indigo-300"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    <div className="flex items-center gap-1 flex-1 min-w-[120px]">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Add tag & Enter..."
                        className="bg-transparent border-none text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none w-full"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: NETWORK & LOGS */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/30 space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    HTTP Request / API Telemetry
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-3">
                      <select
                        value={activeBug.networkLog.method}
                        onChange={(e) => updateActiveBug(b => ({
                          ...b,
                          networkLog: { ...b.networkLog, method: e.target.value as NetworkDiagnostic['method'] }
                        }))}
                        className="saas-select text-xs font-bold"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        placeholder="https://api.example.com/v2/endpoint"
                        value={activeBug.networkLog.url}
                        onChange={(e) => updateActiveBug(b => ({
                          ...b,
                          networkLog: { ...b.networkLog, url: e.target.value }
                        }))}
                        className="saas-input text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        placeholder="500 Internal Error"
                        value={activeBug.networkLog.statusCode}
                        onChange={(e) => updateActiveBug(b => ({
                          ...b,
                          networkLog: { ...b.networkLog, statusCode: e.target.value }
                        }))}
                        className="saas-input text-xs font-bold text-rose-600 dark:text-rose-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-zinc-400">Request Body (JSON)</label>
                      <textarea
                        rows={3}
                        placeholder='{"cartId": "123"}'
                        value={activeBug.networkLog.requestBody}
                        onChange={(e) => updateActiveBug(b => ({
                          ...b,
                          networkLog: { ...b.networkLog, requestBody: e.target.value }
                        }))}
                        className="w-full font-mono text-[11px] p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-emerald-400 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-zinc-400">Response Body / Error</label>
                      <textarea
                        rows={3}
                        placeholder='{"errorCode": "FAIL"}'
                        value={activeBug.networkLog.responseBody}
                        onChange={(e) => updateActiveBug(b => ({
                          ...b,
                          networkLog: { ...b.networkLog, responseBody: e.target.value }
                        }))}
                        className="w-full font-mono text-[11px] p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-rose-400 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Stack Trace & Logs
                    </span>
                    <input
                      type="text"
                      placeholder="Trace ID: sentry-1234"
                      value={activeBug.traceId}
                      onChange={(e) => updateActiveBug(b => ({ ...b, traceId: e.target.value }))}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 w-36"
                    />
                  </div>
                  <textarea
                    rows={5}
                    placeholder="Paste unhandled exception stack trace here..."
                    value={activeBug.stackTrace}
                    onChange={(e) => updateActiveBug(b => ({ ...b, stackTrace: e.target.value }))}
                    className="w-full font-mono text-[11px] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-amber-300 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: ATTACHMENTS */}
            {activeTab === 'attachments' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/30 space-y-2.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    Add Evidence Link
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-3">
                      <select
                        value={attachmentType}
                        onChange={(e) => setAttachmentType(e.target.value as AttachmentItem['type'])}
                        className="saas-select text-xs font-bold"
                      >
                        <option value="Screenshot">🖼️ Screenshot</option>
                        <option value="Screen Recording">🎥 Video / Loom</option>
                        <option value="HAR Network Log">🌐 HAR Log</option>
                        <option value="Figma Spec">🎨 Figma Spec</option>
                      </select>
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="Label (e.g. Safari Overflow)"
                        value={attachmentName}
                        onChange={(e) => setAttachmentName(e.target.value)}
                        className="saas-input text-xs"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="URL (https://loom.com/...)"
                        value={attachmentUrl}
                        onChange={(e) => setAttachmentUrl(e.target.value)}
                        className="saas-input text-xs"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <button
                        type="button"
                        onClick={handleAddAttachment}
                        className="w-full h-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {activeBug.attachments.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-xs">
                      No attachments added for this defect.
                    </div>
                  ) : (
                    activeBug.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/40 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {att.type}
                          </span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{att.name}</span>
                          <span className="text-zinc-400 text-[11px] truncate">{att.url}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-zinc-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW & EXPORT STUDIO */}
        <div className="lg:col-span-6 space-y-4">
          <div className="saas-card p-5 h-full flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-indigo-500" />
                    <span>Single Defect #{activeBugIndex + 1} Export</span>
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopySingle}
                    className="saas-button-primary py-1 px-3 text-[11px] inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Ticket'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSingle}
                    className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition shadow-2xs"
                    title="Download This Bug"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGitHubModal(true)}
                    className="px-2.5 py-1 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                    title="Open in GitHub Issues"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Open GitHub</span>
                  </button>
                </div>
              </div>

              {/* Format Tabs */}
              <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60">
                {[
                  { id: 'github', label: 'GitHub (GFM)' },
                  { id: 'jira_wiki', label: 'Jira Wiki' },
                  { id: 'linear', label: 'Linear' },
                  { id: 'gitlab', label: 'GitLab' },
                  { id: 'slack', label: 'Slack/Teams' },
                  { id: 'html', label: 'HTML' },
                  { id: 'json', label: 'JSON' }
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSingleExportFormat(fmt.id as SingleExportFormat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
                      singleExportFormat === fmt.id
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              {/* Text Preview */}
              <textarea
                readOnly
                value={activeSingleOutputText}
                className="w-full h-[460px] font-mono text-[11px] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-emerald-400 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40 flex items-center justify-between text-[10px] text-zinc-400">
              <span>Client-side sandbox. Zero defect data leaves your device.</span>
              <span className="font-mono font-bold text-zinc-500">{activeSingleOutputText.length} bytes</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL: BATCH MULTI-BUG EXPORT MODAL --- */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                  Batch Download All {suite.length} Defect Tickets
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Download the entire suite of {suite.length} bugs as a single consolidated file. Compatible with Jira bulk CSV import, Excel, Google Sheets, GitHub, or API pipelines.
            </p>

            {/* Batch Format Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'csv', name: 'Jira / Excel CSV', desc: 'Spreadsheet import' },
                { id: 'markdown_suite', name: 'Unified Markdown', desc: 'All bugs + TOC' },
                { id: 'json_suite', name: 'JSON Suite', desc: 'REST API payload' },
                { id: 'jira_suite', name: 'Jira Wiki Doc', desc: 'Master triage page' },
                { id: 'html_suite', name: 'HTML Report', desc: 'Executive digest' }
              ].map((bFmt) => (
                <button
                  key={bFmt.id}
                  type="button"
                  onClick={() => setBatchExportFormat(bFmt.id as BatchExportFormat)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                    batchExportFormat === bFmt.id
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-[11px] font-black">{bFmt.name}</div>
                  <div className="text-[9px] text-zinc-400">{bFmt.desc}</div>
                </button>
              ))}
            </div>

            {/* Batch Output Preview */}
            <textarea
              readOnly
              value={activeBatchOutputText}
              rows={8}
              className="w-full font-mono text-[10px] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-emerald-400 focus:outline-none resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-bold text-zinc-500">
                {suite.length} tickets compiled ({activeBatchOutputText.length} bytes)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyBatch}
                  className="saas-button-secondary py-1.5 px-3 text-xs cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy Batch Content'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBatch}
                  className="saas-button-primary py-1.5 px-4 text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File ({batchExportFormat.toUpperCase()})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: BULK STEPS IMPORTER --- */}
      {showBulkStepModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Bulk Import Reproduction Steps</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBulkStepModal(false)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Paste numbered or bulleted lines. The tool strips prefix numbers/bullets and creates separate steps.
            </p>

            <textarea
              rows={6}
              placeholder={`1. Open https://app.example.com\n2. Log in with admin account\n3. Click on billing\n4. Observe 403 Forbidden error`}
              value={rawTextSteps}
              onChange={(e) => setRawTextSteps(e.target.value)}
              className="w-full font-mono text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 focus:outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkStepModal(false)}
                className="saas-button-secondary py-1.5 px-3 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImportSteps}
                className="saas-button-primary py-1.5 px-4 text-xs cursor-pointer"
              >
                Parse & Replace Steps
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: GITHUB ISSUE LAUNCHER --- */}
      {showGitHubModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>Open Pre-filled GitHub Issue</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowGitHubModal(false)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400">Repository (owner/repo)</label>
              <input
                type="text"
                placeholder="e.g. facebook/react or organization/repo"
                value={gitHubRepo}
                onChange={(e) => setGitHubRepo(e.target.value)}
                className="saas-input text-xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowGitHubModal(false)}
                className="saas-button-secondary py-1.5 px-3 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOpenGitHubDirect}
                className="saas-button-primary py-1.5 px-4 text-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Launch GitHub Issue</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
