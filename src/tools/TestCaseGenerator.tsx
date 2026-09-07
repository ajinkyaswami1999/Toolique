import { useState, useMemo } from 'react';
import {
  Check,
  Copy,
  Plus,
  Trash2,
  Play as StartIcon,
  FileSpreadsheet,
  Code2,
  Sparkles,
  Search,
  Layers,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  FileText,
  ShieldCheck,
  BookOpen,
  Filter,
  HelpCircle
} from 'lucide-react';

// --- TYPES ---
export type ExecutionStatus = 'Untested' | 'Pass' | 'Fail' | 'Blocked';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TestType =
  | 'Functional'
  | 'Negative'
  | 'Boundary'
  | 'Security'
  | 'Integration'
  | 'Performance'
  | 'Accessibility'
  | 'UI/UX';

export interface GherkinSpec {
  feature: string;
  scenario: string;
  given: string;
  when: string;
  then: string;
  and?: string;
}

export interface TestCase {
  id: string;
  title: string;
  type: TestType;
  priority: Priority;
  preconditions: string;
  steps: string[];
  testData: string;
  expectedResult: string;
  executionStatus: ExecutionStatus;
  notes: string;
  tags: string[];
  gherkin: GherkinSpec;
}

type TabMode = 'studio' | 'matrix' | 'gherkin' | 'code';
type CodeTarget = 'playwright' | 'cypress' | 'postman' | 'vitest';

// --- 10 ENTERPRISE PRESET SUITES ---
const PRESET_SUITES: Record<string, { name: string; category: string; description: string; cases: Omit<TestCase, 'id'>[] }> = {
  ecommerce_checkout: {
    name: 'E-Commerce Checkout & UPI/Card Gateway',
    category: 'Fintech & E-Commerce',
    description: 'Cart validation, order discount limits, Indian UPI intent flow, 3DS OTP verification, and webhook idempotency.',
    cases: [
      {
        title: 'Verify Happy Path Checkout with Saved UPI ID',
        type: 'Functional',
        priority: 'Critical',
        preconditions: 'User has 2 items in cart totaling ₹1,499. User is logged in with KYC verified account.',
        steps: [
          'Navigate to Cart and click "Proceed to Checkout".',
          'Select "UPI / QR" payment method and choose saved VPA "customer@okhdfcbank".',
          'Click "Pay ₹1,499" and accept the collect request in the UPI mobile app within 3 minutes.',
          'Wait for webhook callback confirmation.'
        ],
        testData: 'Cart Total: ₹1499.00 | VPA: customer@okhdfcbank | Timeout: 180s',
        expectedResult: 'Payment status transitions from PENDING to SUCCESS. Order confirmation page renders with Order ID and tax invoice download.',
        executionStatus: 'Untested',
        notes: 'Check webhook HMAC signature in backend logs.',
        tags: ['Payment', 'UPI', 'HappyPath', 'Checkout'],
        gherkin: {
          feature: 'UPI Payment Checkout',
          scenario: 'Successful order payment using saved UPI VPA',
          given: 'a customer with ₹1,499 worth of items in cart and saved VPA "customer@okhdfcbank"',
          when: 'the customer initiates UPI payment and approves the prompt on their phone',
          then: 'the transaction is marked SUCCESS and an order confirmation with invoice is displayed'
        }
      },
      {
        title: 'Verify UPI Payment Expiry / Timeout Handling',
        type: 'Negative',
        priority: 'High',
        preconditions: 'User is on UPI QR / collect modal with active 3-minute countdown timer.',
        steps: [
          'Trigger payment collect request.',
          'Do NOT approve the payment on the mobile bank app for 185 seconds.',
          'Observe checkout UI state after timer expires.'
        ],
        testData: 'Expiry: 180s | Poll Interval: 3s',
        expectedResult: 'Timer expires. System displays "Payment Request Expired" message and offers "Retry Payment" without losing cart items.',
        executionStatus: 'Untested',
        notes: 'Ensure inventory is not permanently locked on timeout.',
        tags: ['UPI', 'Timeout', 'Resilience'],
        gherkin: {
          feature: 'UPI Payment Checkout',
          scenario: 'Handle UPI collect request timeout gracefully',
          given: 'a customer on the UPI collect screen with a 180s timeout timer',
          when: 'the countdown reaches zero without approval',
          then: 'the modal shows "Payment Request Expired" and unlocks the cart for retry'
        }
      },
      {
        title: 'Verify Coupon Discount Maximum Cap Boundary',
        type: 'Boundary',
        priority: 'High',
        preconditions: 'Active promo coupon "FLAT20" (20% off up to max discount of ₹500). Cart total is ₹4,000.',
        steps: [
          'Apply promo code "FLAT20" on cart of ₹4,000.',
          'Observe calculated discount amount.',
          'Add additional item worth ₹2,000 (total ₹6,000) and re-verify discount.'
        ],
        testData: 'Coupon: FLAT20 | Max Cap: ₹500.00 | Raw 20% of 4000 = ₹800',
        expectedResult: 'Discount is strictly capped at ₹500.00 instead of ₹800.00. Total payable is ₹3,500.00.',
        executionStatus: 'Untested',
        notes: 'Verify precision rounding to 2 decimal places.',
        tags: ['Discounts', 'Boundary', 'Billing'],
        gherkin: {
          feature: 'Promotional Discounts',
          scenario: 'Discount calculation adheres to upper boundary cap',
          given: 'a promotional coupon offering 20% discount capped at max ₹500',
          when: 'a user applies the coupon to an order of ₹4,000',
          then: 'the applied discount is exactly ₹500 and not ₹800'
        }
      },
      {
        title: 'Verify Idempotency of Webhook Payment Confirmations',
        type: 'Integration',
        priority: 'Critical',
        preconditions: 'Payment gateway triggers duplicate webhook notifications for same transaction ID "TXN_99812".',
        steps: [
          'Send initial payment success webhook payload for TXN_99812.',
          'Immediately resend duplicate webhook payload for TXN_99812 with identical body 50ms later.',
          'Inspect database ledger balance and user order status.'
        ],
        testData: 'TransactionID: TXN_99812 | Gateway: Razorpay/Stripe | Duplicate count: 2',
        expectedResult: 'Order is created exactly once. Inventory is deducted once. Second webhook returns HTTP 200 OK (idempotent duplicate acknowledged).',
        executionStatus: 'Untested',
        notes: 'Crucial for double-charge prevention.',
        tags: ['Idempotency', 'Webhooks', 'Backend'],
        gherkin: {
          feature: 'Payment Webhooks',
          scenario: 'Duplicate webhooks do not double-process orders',
          given: 'an incoming payment confirmation webhook for TXN_99812',
          when: 'a duplicate webhook payload with the same event ID is received',
          then: 'the backend recognizes the duplicate event and processes inventory only once'
        }
      },
      {
        title: 'Verify Payment Form Input Injection & XSS Sanitization',
        type: 'Security',
        priority: 'High',
        preconditions: 'User is on checkout billing address and notes field.',
        steps: [
          'Input payload `<script>alert("XSS")</script>` in the Delivery Instructions field.',
          'Input SQL snippet `\' OR 1=1 --` in Billing Address Line 2.',
          'Submit order form.'
        ],
        testData: 'Payloads: <script>alert(1)</script>, \' OR 1=1 --',
        expectedResult: 'Payloads are HTML-escaped and parameterized in queries. No script executes in confirmation email or admin portal.',
        executionStatus: 'Untested',
        notes: 'Verify both frontend React DOM escaping and backend ORM sanitization.',
        tags: ['Security', 'XSS', 'SQLi'],
        gherkin: {
          feature: 'Checkout Security',
          scenario: 'Sanitize malicious input in order notes and billing fields',
          given: 'a checkout form with custom note and address text fields',
          when: 'a user submits XSS and SQL injection payloads',
          then: 'the server safely escapes all input and renders them as plain harmless text'
        }
      },
      {
        title: 'Verify Screen Reader & Keyboard Navigation on Checkout Flow',
        type: 'Accessibility',
        priority: 'Medium',
        preconditions: 'User is on checkout page without a mouse using NVDA/VoiceOver and Tab key only.',
        steps: [
          'Navigate through all payment option radio buttons using arrow keys.',
          'Ensure focus rings are clearly visible on inputs and submit button.',
          'Trigger form submission with invalid inputs and verify aria-live error announcements.'
        ],
        testData: 'WCAG 2.1 AA | Focus Indicator: 2px solid #4F46E5',
        expectedResult: 'All interactive elements are reachable via Tab. Error summaries are announced to screen readers via aria-live="polite".',
        executionStatus: 'Untested',
        notes: 'Compliance requirement for WCAG 2.1 Level AA.',
        tags: ['A11y', 'WCAG', 'Keyboard'],
        gherkin: {
          feature: 'Checkout Accessibility',
          scenario: 'Full keyboard navigation and ARIA error announcements',
          given: 'a visually impaired user navigating via screen reader',
          when: 'validation errors occur during checkout form submission',
          then: 'aria-live containers announce the specific validation errors to assistive technology'
        }
      }
    ]
  },
  kyc_verification: {
    name: 'Aadhaar / PAN KYC & OCR Document Verification',
    category: 'Identity & Compliance',
    description: 'Document image uploads, PAN format checksum, Aadhaar masking (first 8 digits), and OCR confidence threshold.',
    cases: [
      {
        title: 'Verify Successful PAN Card OCR Extraction & Validation',
        type: 'Functional',
        priority: 'Critical',
        preconditions: 'User is on the KYC verification step. Clean image of valid PAN card ready.',
        steps: [
          'Upload front image of PAN card (JPEG, 1.2MB).',
          'Wait for OCR engine to process document.',
          'Verify auto-filled PAN number, full name, and DOB.'
        ],
        testData: 'PAN: ABCDE1234F | DOB: 14/08/1995 | OCR Confidence: > 92%',
        expectedResult: 'System extracts PAN string matching regex ^[A-Z]{5}[0-9]{4}[A-Z]{1}$, matches 4th char with entity type, and unlocks next step.',
        executionStatus: 'Untested',
        notes: 'Check NSDL verification API integration.',
        tags: ['KYC', 'PAN', 'OCR', 'Regex'],
        gherkin: {
          feature: 'PAN KYC Verification',
          scenario: 'Accurate OCR extraction from valid PAN card image',
          given: 'a user uploading a clear JPEG image of a valid PAN card',
          when: 'the OCR worker inspects the image',
          then: 'the PAN number and full name are extracted and validated against regex ^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
        }
      },
      {
        title: 'Verify Aadhaar Masking Compliance (UIDAI Guideline)',
        type: 'Security',
        priority: 'Critical',
        preconditions: 'User uploads 12-digit Aadhaar card document.',
        steps: [
          'Upload 12-digit Aadhaar document.',
          'Inspect server storage and frontend preview display.',
          'Inspect generated PDF copy.'
        ],
        testData: 'Aadhaar: 1234 5678 9012 -> Expected: XXXX XXXX 9012',
        expectedResult: 'First 8 digits of Aadhaar number are blacked out / masked automatically. Only last 4 digits remain legible per UIDAI mandate.',
        executionStatus: 'Untested',
        notes: 'Regulatory compliance: Non-masked Aadhaar storage is illegal.',
        tags: ['Aadhaar', 'UIDAI', 'Masking', 'Compliance'],
        gherkin: {
          feature: 'Aadhaar Data Protection',
          scenario: 'Ensure first 8 digits of Aadhaar are masked before persistence',
          given: 'an unmasked Aadhaar card image uploaded by a customer',
          when: 'the KYC processing pipeline ingests the document',
          then: 'the first 8 digits are securely masked and stored as XXXX-XXXX-9012'
        }
      },
      {
        title: 'Verify Blur / Low Quality Document Rejection',
        type: 'Negative',
        priority: 'High',
        preconditions: 'User uploads intentionally blurred or low-resolution image (< 300 DPI).',
        steps: [
          'Upload blurred document photograph.',
          'Click Submit for Verification.'
        ],
        testData: 'Resolution: 320x240 | Laplacian Blur Variance: < 100',
        expectedResult: 'System rejects image before calling paid external APIs. Alert displays: "Image is too blurry. Please upload a crisp, well-lit photo."',
        executionStatus: 'Untested',
        notes: 'Saves API costs on external verification partners.',
        tags: ['Validation', 'BlurDetection', 'UX'],
        gherkin: {
          feature: 'Document Quality Check',
          scenario: 'Reject blurry document images before OCR API call',
          given: 'a user uploading a photograph with blur variance below threshold',
          when: 'client-side document pre-validation runs',
          then: 'the upload is rejected with a message asking for a well-lit picture'
        }
      },
      {
        title: 'Verify Minimum Age Restriction for KYC Compliance (18 Years)',
        type: 'Boundary',
        priority: 'Critical',
        preconditions: 'KYC requires user to be at least 18 years old on the day of verification.',
        steps: [
          'Test Date of Birth representing exactly 17 years 364 days old.',
          'Test Date of Birth representing exactly 18 years 0 days old.',
          'Test Date of Birth representing 18 years 1 day old.'
        ],
        testData: 'Current Date: Today | Underage: Today - 17y 364d | Valid: Today - 18y 0d',
        expectedResult: '17y 364d fails with "Applicant must be 18 years or older." Exactly 18y 0d passes validation.',
        executionStatus: 'Untested',
        notes: 'BVA edge case for KYC onboarding.',
        tags: ['AgeLimit', 'BVA', 'Compliance'],
        gherkin: {
          feature: 'KYC Eligibility',
          scenario: 'Age boundary check on applicant date of birth',
          given: 'a customer entering their date of birth',
          when: 'their calculated age is 17 years and 364 days',
          then: 'the KYC submission is blocked with an underage warning'
        }
      }
    ]
  },
  mfa_auth: {
    name: 'Multi-Factor Authentication (OTP, SMS & TOTP)',
    category: 'Security & Auth',
    description: 'SMS OTP rate limiting, TOTP authenticator clock drift (+/- 1 step), brute force lockout, and recovery backup codes.',
    cases: [
      {
        title: 'Verify 6-Digit TOTP Authenticator App Verification (RFC 6238)',
        type: 'Functional',
        priority: 'Critical',
        preconditions: 'User has paired Google Authenticator / Authy with SHA-1 30-second token secret.',
        steps: [
          'Enter current valid 6-digit TOTP code generated by Google Authenticator.',
          'Click "Verify & Continue".'
        ],
        testData: 'Code: 584920 | Window: 30 seconds',
        expectedResult: 'Code verified successfully. User is issued an authenticated JWT session cookie with MFA claim set to true.',
        executionStatus: 'Untested',
        notes: 'Verify clock tolerance of +/- 1 window (60s total).',
        tags: ['TOTP', 'MFA', 'Auth'],
        gherkin: {
          feature: 'TOTP Authentication',
          scenario: 'User logs in successfully with valid authenticator code',
          given: 'a user with 2FA enabled on their account',
          when: 'they enter the current 6-digit code from Google Authenticator',
          then: 'they are granted access with a signed MFA-verified JWT token'
        }
      },
      {
        title: 'Verify Brute-Force Lockout on 5 Consecutive Incorrect OTPs',
        type: 'Security',
        priority: 'Critical',
        preconditions: 'Active OTP session created for user account.',
        steps: [
          'Enter incorrect 6-digit OTP 5 times consecutively.',
          'Attempt to enter the correct OTP on the 6th attempt.'
        ],
        testData: 'Attempts: [000000, 111111, 222222, 333333, 444444]',
        expectedResult: 'Account is temporarily locked for 15 minutes. 6th attempt returns HTTP 429 Too Many Requests with retry-after header.',
        executionStatus: 'Untested',
        notes: 'Redis rate limiting key `otp_attempts:{userId}`.',
        tags: ['Security', 'BruteForce', 'RateLimit'],
        gherkin: {
          feature: 'MFA Security',
          scenario: 'Lock OTP verification after 5 failed attempts',
          given: 'an active OTP prompt for a user session',
          when: '5 consecutive incorrect codes are entered',
          then: 'the account is throttled for 15 minutes and all subsequent inputs are rejected'
        }
      },
      {
        title: 'Verify Resend OTP Cooldown Timer & SMS Throttling',
        type: 'Boundary',
        priority: 'High',
        preconditions: 'User clicked "Send OTP via SMS".',
        steps: [
          'Verify that "Resend OTP" button is disabled with a 60-second visual countdown.',
          'Attempt to call `/api/auth/resend-otp` via direct API script before 60 seconds expire.',
          'Wait until 60 seconds reach 0 and click "Resend OTP".'
        ],
        testData: 'Cooldown: 60s | Max SMS per day: 5',
        expectedResult: 'Direct API call returns 429 Cooldown Active. UI button enables at 0s and successfully sends second SMS.',
        executionStatus: 'Untested',
        notes: 'Protects telecom SMS gateway billing from runaway spam.',
        tags: ['SMS', 'RateLimit', 'Cooldown'],
        gherkin: {
          feature: 'SMS OTP Throttling',
          scenario: 'Enforce 60-second cooldown between SMS OTP requests',
          given: 'a customer who just requested an SMS OTP',
          when: 'they attempt to request another OTP after 10 seconds',
          then: 'the request is blocked and the UI displays a remaining 50s cooldown'
        }
      }
    ]
  },
  rbac_security: {
    name: 'Role-Based Access Control (RBAC) Permissions',
    category: 'Security & Enterprise',
    description: 'Tenant isolation, privilege escalation checks, SuperAdmin vs OrgAdmin vs Member permission matrices.',
    cases: [
      {
        title: 'Verify Member Cannot Delete Organization Workspace',
        type: 'Security',
        priority: 'Critical',
        preconditions: 'User authenticated with role "MEMBER" in organization "Acme Corp".',
        steps: [
          'Ensure "Delete Workspace" button is hidden in UI settings.',
          'Send direct HTTP DELETE request to `/api/v1/organizations/acme-org` with Member JWT.'
        ],
        testData: 'Role: MEMBER | Endpoint: DELETE /api/v1/organizations/acme-org',
        expectedResult: 'Server returns HTTP 403 Forbidden with `{ error: "INSUFFICIENT_PERMISSIONS", requiredRole: "ORG_ADMIN" }`.',
        executionStatus: 'Untested',
        notes: 'Zero Trust API authorization middleware validation.',
        tags: ['RBAC', 'AuthZ', 'Security'],
        gherkin: {
          feature: 'RBAC Authorization',
          scenario: 'Regular members cannot delete workspaces',
          given: 'an authenticated user with role "MEMBER"',
          when: 'they execute a DELETE call to the organization endpoint',
          then: 'the API returns HTTP 403 Forbidden'
        }
      },
      {
        title: 'Verify Cross-Tenant Data Isolation (Multi-Tenancy Leak Test)',
        type: 'Security',
        priority: 'Critical',
        preconditions: 'User is Admin of Org A (ID: 1001). Org B (ID: 1002) has sensitive invoices.',
        steps: [
          'Send HTTP GET request to `/api/v1/invoices?orgId=1002` using Org A Admin credentials.',
          'Send HTTP GET request to `/api/v1/invoices/INV-9999` (belonging to Org B).'
        ],
        testData: 'Caller Org: 1001 | Target Org: 1002 | Invoice: INV-9999',
        expectedResult: 'Server returns HTTP 404 Not Found or HTTP 403 Forbidden. No data from Org B is leaked.',
        executionStatus: 'Untested',
        notes: 'Validate SQL WHERE org_id = current_tenant in query builder.',
        tags: ['MultiTenancy', 'Security', 'DataIsolation'],
        gherkin: {
          feature: 'Tenant Isolation',
          scenario: 'Prevent cross-tenant data access between organizations',
          given: 'an admin belonging to Organization A',
          when: 'they attempt to query invoices belonging to Organization B',
          then: 'the request returns 404 Not Found without leaking any record existence'
        }
      }
    ]
  },
  rest_api: {
    name: 'High-Frequency REST API CRUD & Pagination Endpoint',
    category: 'Backend & APIs',
    description: 'Query parameters, cursor-based pagination, sorting, ISO date filters, schema validation, and SQL/NoSQL injection protection.',
    cases: [
      {
        title: 'Verify Cursor-Based Pagination on `/api/v1/products`',
        type: 'Functional',
        priority: 'High',
        preconditions: 'Database contains 150 product records ordered by `created_at DESC`.',
        steps: [
          'Send GET `/api/v1/products?limit=20`. Capture `next_cursor` from response.',
          'Send GET `/api/v1/products?limit=20&cursor={next_cursor}`.',
          'Verify no overlapping products between page 1 and page 2.'
        ],
        testData: 'Limit: 20 | Page 1 items: 20 | Next Cursor: eyJpZCI6MTAxfQ==',
        expectedResult: 'Each page returns exactly 20 distinct records. `has_more` boolean is true until the final page.',
        executionStatus: 'Untested',
        notes: 'Verify cursor decoding and index performance.',
        tags: ['API', 'Pagination', 'CRUD'],
        gherkin: {
          feature: 'API Pagination',
          scenario: 'Cursor pagination returns non-overlapping contiguous records',
          given: 'a database table with 150 items',
          when: 'the client requests two consecutive pages using cursor pagination',
          then: 'page 2 contains the next 20 items with zero duplicate IDs from page 1'
        }
      },
      {
        title: 'Verify Negative Boundary on `limit` Query Parameter',
        type: 'Boundary',
        priority: 'Medium',
        preconditions: 'API limit accepts values between 1 and 100.',
        steps: [
          'Send GET `/api/v1/products?limit=0`.',
          'Send GET `/api/v1/products?limit=101`.',
          'Send GET `/api/v1/products?limit=-5`.'
        ],
        testData: 'Limits tested: [0, 101, -5]',
        expectedResult: 'API returns HTTP 400 Bad Request with structured validation schema error: "Limit must be an integer between 1 and 100".',
        executionStatus: 'Untested',
        notes: 'Protects backend from memory exhaustion attacks.',
        tags: ['API', 'Boundary', 'Validation'],
        gherkin: {
          feature: 'API Validation',
          scenario: 'Reject invalid limit parameter values outside allowed range',
          given: 'an API endpoint requiring limit between 1 and 100',
          when: 'a client submits limit=101 or limit=-5',
          then: 'the API responds with HTTP 400 Bad Request and validation details'
        }
      }
    ]
  },
  file_upload: {
    name: 'Document Upload & MIME/Malware Sniffing',
    category: 'Security & Storage',
    description: 'File size limits, multi-part form data, magic byte inspection (preventing `.exe` renamed as `.jpg`), and S3 presigned URLs.',
    cases: [
      {
        title: 'Verify Magic Bytes MIME Type Sniffing (Spoofed Extension Test)',
        type: 'Security',
        priority: 'Critical',
        preconditions: 'Upload allows only JPEG, PNG, and PDF documents.',
        steps: [
          'Take a binary executable (.exe) and rename filename to "profile_picture.jpg".',
          'Upload the file via the profile avatar form.',
          'Inspect server validation response.'
        ],
        testData: 'File: malware.exe -> renamed to fake.jpg | Magic Bytes: 4D 5A (MZ header)',
        expectedResult: 'Backend inspects initial binary magic bytes (identifies MZ / PE header) and rejects file with HTTP 415 Unsupported Media Type.',
        executionStatus: 'Untested',
        notes: 'Never rely on client `Content-Type` header or file extension alone.',
        tags: ['Security', 'MIME', 'MagicBytes', 'Malware'],
        gherkin: {
          feature: 'Upload Security',
          scenario: 'Detect and block executable files disguised with image extensions',
          given: 'an executable binary file renamed to "avatar.jpg"',
          when: 'the user attempts to upload it as a profile picture',
          then: 'the server detects the magic byte signature and rejects the file as invalid'
        }
      },
      {
        title: 'Verify File Size Limit Boundary (Exact 10 MB Cutoff)',
        type: 'Boundary',
        priority: 'High',
        preconditions: 'Max upload size is 10 MB (10,485,760 bytes).',
        steps: [
          'Upload PDF of exactly 10,485,760 bytes (10 MB).',
          'Upload PDF of 10,485,761 bytes (10 MB + 1 byte).'
        ],
        testData: 'Valid: 10,485,760 bytes | Invalid: 10,485,761 bytes',
        expectedResult: 'Exact 10 MB file uploads successfully. 10 MB + 1 byte file is rejected with "File exceeds 10 MB limit".',
        executionStatus: 'Untested',
        notes: 'Boundary Value Analysis for file sizes.',
        tags: ['Boundary', 'Upload', 'BVA'],
        gherkin: {
          feature: 'File Size Enforcement',
          scenario: 'Exact binary cutoff at 10 megabytes',
          given: 'a maximum file size policy of 10 MB',
          when: 'a file of 10 MB + 1 byte is uploaded',
          then: 'the upload is blocked with a clear file size error message'
        }
      }
    ]
  },
  realtime_chat: {
    name: 'Real-Time Chat & WebSocket Notifications',
    category: 'Real-Time & WebSockets',
    description: 'Connection reconnection backoff, typing indicators, message deduplication, offline message queue, and read receipts.',
    cases: [
      {
        title: 'Verify WebSocket Auto-Reconnect with Exponential Backoff',
        type: 'Integration',
        priority: 'High',
        preconditions: 'User is active in a chat room. Internet connection is abruptly disconnected.',
        steps: [
          'Simulate network offline state.',
          'Observe UI showing "Reconnecting..." badge.',
          'Restore network after 15 seconds.',
          'Verify automatic re-establishment of WebSocket handshake and receipt of missed messages.'
        ],
        testData: 'Backoff intervals: 1s, 2s, 4s, 8s | Max Retry: 5',
        expectedResult: 'Client reconnects automatically without full page reload. Missed messages sync from server backlog.',
        executionStatus: 'Untested',
        notes: 'Check WS close event code 1006 handling.',
        tags: ['WebSocket', 'Resilience', 'RealTime'],
        gherkin: {
          feature: 'WebSocket Connection',
          scenario: 'Client automatically recovers from unexpected disconnection',
          given: 'an active chat session with WebSocket connectivity',
          when: 'the network drops temporarily and is restored',
          then: 'the client reconnects with exponential backoff and syncs unread messages'
        }
      }
    ]
  },
  multistep_wizard: {
    name: 'Multi-Step Form Wizard & Draft Persistence',
    category: 'UI/UX & Forms',
    description: '4-step onboarding wizard, local storage auto-save draft, step validation blocking, back navigation preserving filled data.',
    cases: [
      {
        title: 'Verify Unsaved Draft Recovery on Unexpected Browser Refresh',
        type: 'Functional',
        priority: 'High',
        preconditions: 'User fills out Step 1 (Personal Info) and Step 2 (Employment Details) of 4-step wizard.',
        steps: [
          'Enter full details on Step 2.',
          'Hard reload the browser tab (F5 / Cmd+R).',
          'Observe loaded state.'
        ],
        testData: 'Storage: localStorage / IndexedDB draft key `onboarding_draft_v1`',
        expectedResult: 'System restores wizard at Step 2 with all previously entered fields populated without loss.',
        executionStatus: 'Untested',
        notes: 'Verify draft expiration timestamp (e.g. 7 days).',
        tags: ['Wizard', 'DraftSave', 'LocalStorage', 'UX'],
        gherkin: {
          feature: 'Form Auto-Save',
          scenario: 'Restore draft form state after browser reload',
          given: 'a user who has completed Step 2 of a 4-step onboarding wizard',
          when: 'the browser tab is refreshed unexpectedly',
          then: 'the wizard reloads at Step 2 with all filled inputs intact'
        }
      }
    ]
  },
  stripe_billing: {
    name: 'Subscription Billing & Stripe Webhooks',
    category: 'Billing & Subscriptions',
    description: 'Proration calculation, trial period expiration, invoice failure grace period, and subscription cancellation at period end.',
    cases: [
      {
        title: 'Verify Immediate Upgrade Proration Calculation',
        type: 'Functional',
        priority: 'High',
        preconditions: 'User on Pro Plan ($30/mo) with 15 days remaining in billing cycle. Upgrades to Enterprise ($90/mo).',
        steps: [
          'Select Enterprise Plan on pricing page.',
          'Confirm upgrade mid-cycle (Day 15 of 30).'
        ],
        testData: 'Unused Pro Credit: -$15.00 | New Enterprise Cost: +$45.00 | Net Charge: $30.00',
        expectedResult: 'Invoice reflects credit of -$15.00 and prorated charge of +$45.00. User is immediately billed net $30.00.',
        executionStatus: 'Untested',
        notes: 'Validate Stripe invoice preview API calculations.',
        tags: ['Billing', 'Proration', 'Subscriptions'],
        gherkin: {
          feature: 'Subscription Proration',
          scenario: 'Calculate fair proration credit on mid-month plan upgrade',
          given: 'a customer on a $30/mo plan upgrading halfway through their billing month',
          when: 'they switch to a $90/mo plan',
          then: 'they are credited $15 for unused time and charged exactly $30 net for the remainder'
        }
      }
    ]
  },
  password_reset: {
    name: 'Password Reset & Magic Link Token Expiry',
    category: 'Security & Auth',
    description: 'Cryptographic token entropy (256-bit), 15-minute token TTL, single-use token invalidation, and session termination on password reset.',
    cases: [
      {
        title: 'Verify Password Reset Token Invalidation After First Use',
        type: 'Security',
        priority: 'Critical',
        preconditions: 'User received password reset link with token `tok_98a7fbc...`.',
        steps: [
          'Open reset link and successfully change password to "NewP@ssw0rd2026!".',
          'Press browser back button or re-open the same reset link.',
          'Attempt to change password again with the same token.'
        ],
        testData: 'Token: 32-byte hex string | TTL: 900s (15 min)',
        expectedResult: 'Second attempt fails with "This password reset link has already been used or has expired." Form is blocked.',
        executionStatus: 'Untested',
        notes: 'Prevents replay attacks.',
        tags: ['Security', 'TokenReplay', 'Auth'],
        gherkin: {
          feature: 'Password Reset Security',
          scenario: 'Password reset token cannot be reused',
          given: 'a valid password reset token that was just used to update credentials',
          when: 'an attacker or user attempts to submit the form again using the same link',
          then: 'the request is rejected as an expired or consumed token'
        }
      }
    ]
  }
};

// --- INTELLIGENT SCENARIO SYNTHESIS ENGINE ---
function synthesizeTestCases(featureName: string, description: string): TestCase[] {
  const name = featureName.trim() || 'Custom Feature';
  const desc = description.trim().toLowerCase();

  const isAuth = desc.includes('login') || desc.includes('auth') || desc.includes('password') || desc.includes('token') || desc.includes('jwt') || desc.includes('role');
  const isPayment = desc.includes('pay') || desc.includes('card') || desc.includes('upi') || desc.includes('checkout') || desc.includes('money') || desc.includes('price');
  const isUpload = desc.includes('upload') || desc.includes('file') || desc.includes('image') || desc.includes('pdf') || desc.includes('doc');
  const isApi = desc.includes('api') || desc.includes('endpoint') || desc.includes('rest') || desc.includes('crud') || desc.includes('get') || desc.includes('post');

  const generated: TestCase[] = [];

  // 1. Happy Path / Positive
  generated.push({
    id: `TC-${101 + generated.length}`,
    title: `Verify successful happy-path execution of ${name}`,
    type: 'Functional',
    priority: 'Critical',
    preconditions: `User is authenticated with appropriate role and navigates to ${name}.`,
    steps: [
      `Navigate to ${name} module.`,
      `Provide valid, well-formed input parameters (${description ? description.slice(0, 80) : 'standard valid parameters'}).`,
      `Submit the action and observe system state.`
    ],
    testData: `Valid input payload matching schema specifications for ${name}.`,
    expectedResult: `Operation completes successfully with status 200/201. UI updates immediately and backend state is persisted.`,
    executionStatus: 'Untested',
    notes: 'Verify success telemetry and toast notifications.',
    tags: ['HappyPath', 'Functional', name.replace(/\s+/g, '')],
    gherkin: {
      feature: `${name} Functionality`,
      scenario: `Execute ${name} with valid inputs`,
      given: `the user is on the ${name} interface`,
      when: `they submit valid required data`,
      then: `the action succeeds and confirmation is displayed`
    }
  });

  // 2. Negative / Empty Input Validation
  generated.push({
    id: `TC-${101 + generated.length}`,
    title: `Verify field-level validation and error prompts on empty/missing inputs in ${name}`,
    type: 'Negative',
    priority: 'High',
    preconditions: `User is on the ${name} interface.`,
    steps: [
      `Leave all mandatory fields blank.`,
      `Attempt to submit the form/action.`,
      `Verify error styling and descriptive guidance messages.`
    ],
    testData: `Empty strings, null values, unselected mandatory dropdowns.`,
    expectedResult: `Submission is blocked. Clear validation messages appear under each required input with aria-invalid="true".`,
    executionStatus: 'Untested',
    notes: 'Verify focus shifts to the first invalid field.',
    tags: ['Validation', 'Negative', 'Forms'],
    gherkin: {
      feature: `${name} Validation`,
      scenario: `Block submission when mandatory fields are missing`,
      given: `the ${name} form has empty required fields`,
      when: `the user attempts submission`,
      then: `validation error badges highlight every missing field and block execution`
    }
  });

  // 3. Boundary & Edge Cases
  generated.push({
    id: `TC-${101 + generated.length}`,
    title: `Verify extreme boundary limits (Min - 1, Max, Max + 1) for ${name}`,
    type: 'Boundary',
    priority: 'High',
    preconditions: `Boundary constraints defined for numeric, text, or file parameters in ${name}.`,
    steps: [
      `Input values at the exact minimum allowed limit (Min).`,
      `Input values at the exact maximum allowed limit (Max).`,
      `Attempt to input values exceeding maximum limit (Max + 1) or below minimum (Min - 1).`
    ],
    testData: `Min limit, Max limit, and Max + 1 overflow string/numbers.`,
    expectedResult: `Exact boundary limits (Min, Max) are accepted smoothly. Out-of-bound inputs (Min-1, Max+1) are rejected with clear boundary feedback.`,
    executionStatus: 'Untested',
    notes: 'Mathematical BVA boundary test design.',
    tags: ['Boundary', 'BVA', 'EdgeCases'],
    gherkin: {
      feature: `${name} Boundary Conditions`,
      scenario: `Verify boundary values and overflow prevention`,
      given: `input parameters with upper and lower thresholds`,
      when: `inputs at Min, Max, and Max+1 are submitted`,
      then: `valid boundaries pass and overflow triggers validation warnings`
    }
  });

  // 4. Security & Access Control
  generated.push({
    id: `TC-${101 + generated.length}`,
    title: isAuth
      ? `Verify rate limiting and brute-force protection on ${name}`
      : `Verify XSS sanitization and authorization enforcement in ${name}`,
    type: 'Security',
    priority: 'Critical',
    preconditions: `Unauthenticated visitor or low-privilege user attempting unauthorized action in ${name}.`,
    steps: [
      `Attempt to invoke ${name} API endpoint directly without valid session token.`,
      `Inject script tag payloads \`<img src=x onerror=alert(1)>\` into text inputs.`,
      `Submit request and inspect response headers and sanitized output.`
    ],
    testData: `Payloads: <script>alert(1)</script>, \' OR 1=1 --, Unauthorized JWT`,
    expectedResult: `Unauthorized calls return HTTP 401/403. Injected characters are HTML-escaped and stored safely without script execution.`,
    executionStatus: 'Untested',
    notes: 'Zero Trust security audit.',
    tags: ['Security', 'XSS', 'AuthZ'],
    gherkin: {
      feature: `${name} Security`,
      scenario: `Prevent injection attacks and enforce authorization`,
      given: `a request containing XSS payloads or unauthenticated credentials`,
      when: `the server processes the request for ${name}`,
      then: `unauthorized access is denied and all payloads are safely neutralized`
    }
  });

  // 5. Network Timeout / Error Recovery
  generated.push({
    id: `TC-${101 + generated.length}`,
    title: `Verify network timeout, server 500 error handling, and offline resilience in ${name}`,
    type: 'Integration',
    priority: 'Medium',
    preconditions: `Server is simulating network degradation (5000ms latency) or HTTP 503 Service Unavailable.`,
    steps: [
      `Trigger action in ${name}.`,
      `Simulate socket timeout or gateway 504 error.`,
      `Observe UI loading spinner, retry button, and error alert.`
    ],
    testData: `HTTP 500 / 503 / 504 simulated responses | 10s timeout`,
    expectedResult: `Application does not crash or freeze. A friendly error alert displays with a "Try Again" retry trigger without losing input state.`,
    executionStatus: 'Untested',
    notes: 'Verify circuit breaker or retry mechanism.',
    tags: ['Resilience', 'ErrorHandling', 'Network'],
    gherkin: {
      feature: `${name} Resilience`,
      scenario: `Handle upstream server downtime gracefully`,
      given: `an upstream server failure or network drop during ${name}`,
      when: `the client encounters a timeout`,
      then: `a user-friendly retry banner is shown and form state is preserved`
    }
  });

  // 6. Accessibility (WCAG 2.1 AA)
  generated.push({
    id: `TC-${101 + generated.length}`,
    title: `Verify keyboard navigation (Tab/Enter/Space) and screen reader accessibility for ${name}`,
    type: 'Accessibility',
    priority: 'Medium',
    preconditions: `User navigates ${name} using keyboard only and NVDA / VoiceOver screen reader.`,
    steps: [
      `Navigate through all interactive controls in ${name} using Tab and Shift+Tab.`,
      `Verify visible focus indicators (outline >= 2px).`,
      `Verify that dynamic status changes and validation alerts are announced via ARIA live regions.`
    ],
    testData: `WCAG 2.1 Level AA Compliance | Contrast Ratio >= 4.5:1`,
    expectedResult: `Every control is reachable and actionable without mouse. Screen readers announce input names, states, and errors accurately.`,
    executionStatus: 'Untested',
    notes: 'Section 508 / ADA / WCAG compliance.',
    tags: ['A11y', 'WCAG', 'Keyboard'],
    gherkin: {
      feature: `${name} Accessibility`,
      scenario: `Complete flow using keyboard and assistive tools`,
      given: `a keyboard-only user on ${name}`,
      when: `they navigate and interact with all form elements`,
      then: `focus order is logical and ARIA attributes convey all state changes`
    }
  });

  // 7. Domain Specific: Payment or Upload or Performance
  if (isPayment) {
    generated.push({
      id: `TC-${101 + generated.length}`,
      title: `Verify payment idempotency and duplicate charge prevention in ${name}`,
      type: 'Integration',
      priority: 'Critical',
      preconditions: `User double-clicks the Pay button rapidly within 100ms.`,
      steps: [
        `Click submit button twice in rapid succession.`,
        `Inspect client button state and backend idempotency key header.`
      ],
      testData: `Header: Idempotency-Key: uuid-v4`,
      expectedResult: `Button is disabled on first click. Only one transaction is initiated; duplicate charge is strictly prevented.`,
      executionStatus: 'Untested',
      notes: 'Fintech compliance requirement.',
      tags: ['Payment', 'Idempotency', 'Fintech'],
      gherkin: {
        feature: `${name} Idempotency`,
        scenario: 'Rapid double click does not double charge',
        given: 'a customer at the payment step',
        when: 'they double click the submit button rapidly',
        then: 'only a single payment transaction is created'
      }
    });
  } else if (isUpload) {
    generated.push({
      id: `TC-${101 + generated.length}`,
      title: `Verify MIME sniffing and oversized file rejection in ${name}`,
      type: 'Security',
      priority: 'High',
      preconditions: `File size limit 10MB. Allowed formats: PDF, PNG.`,
      steps: [
        `Attempt to upload an 11MB file.`,
        `Attempt to upload an .exe file renamed to .pdf.`
      ],
      testData: `11MB payload, Fake binary header`,
      expectedResult: `Oversized and fake MIME files are rejected before processing with informative error prompts.`,
      executionStatus: 'Untested',
      notes: 'Magic byte check verification.',
      tags: ['Upload', 'MIME', 'Security'],
      gherkin: {
        feature: `${name} File Upload`,
        scenario: 'Reject invalid extensions and oversized uploads',
        given: 'an oversized or disguised file',
        when: 'uploaded to the system',
        then: 'it is rejected with a validation error'
      }
    });
  } else if (isApi) {
    generated.push({
      id: `TC-${101 + generated.length}`,
      title: `Verify concurrent request handling and race condition safety in ${name}`,
      type: 'Performance',
      priority: 'High',
      preconditions: `50 parallel asynchronous requests modifying the same resource ID.`,
      steps: [
        `Send 50 parallel PUT / PATCH requests simultaneously.`,
        `Verify database atomic row locking or optimistic concurrency versioning.`
      ],
      testData: `Concurrency: 50 | Resource: Entity-101`,
      expectedResult: `State remains consistent without data corruption. Optimistic lock exceptions (HTTP 409 Conflict) handled cleanly.`,
      executionStatus: 'Untested',
      notes: 'Database concurrency test.',
      tags: ['Concurrency', 'RaceCondition', 'API'],
      gherkin: {
        feature: `${name} Concurrency`,
        scenario: 'Handle simultaneous write requests safely',
        given: '50 concurrent update requests',
        when: 'processed simultaneously',
        then: 'data integrity is preserved via atomic locking'
      }
    });
  }

  return generated;
}

// --- MAIN COMPONENT ---
export default function TestCaseGenerator() {
  const [suiteKey, setSuiteKey] = useState<string>('ecommerce_checkout');
  const [activeTab, setActiveTab] = useState<TabMode>('studio');
  const [codeTarget, setCodeTarget] = useState<CodeTarget>('playwright');

  // Custom Generator State
  const [customFeature, setCustomFeature] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');

  // Test Suite List
  const [testCases, setTestCases] = useState<TestCase[]>(() =>
    PRESET_SUITES.ecommerce_checkout.cases.map((c, i) => ({
      ...c,
      id: `TC-${101 + i}`
    }))
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Copy/Download feedback
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // --- HANDLERS ---
  const handleLoadPreset = (key: string) => {
    setSuiteKey(key);
    if (PRESET_SUITES[key]) {
      const cases = PRESET_SUITES[key].cases.map((c, i) => ({
        ...c,
        id: `TC-${101 + i}`
      }));
      setTestCases(cases);
    }
  };

  const handleGenerateCustom = () => {
    if (!customFeature.trim()) return;
    const generated = synthesizeTestCases(customFeature, customDescription);
    setTestCases(generated);
    setSuiteKey('custom');
  };

  const handleUpdateStatus = (id: string, status: ExecutionStatus) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, executionStatus: status } : tc))
    );
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, notes } : tc))
    );
  };

  const handleBulkStatus = (status: ExecutionStatus) => {
    setTestCases((prev) =>
      prev.map((tc) => ({ ...tc, executionStatus: status }))
    );
  };

  const handleDeleteCase = (id: string) => {
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
  };

  const handleDuplicateCase = (tc: TestCase) => {
    const newCase: TestCase = {
      ...tc,
      id: `TC-${100 + testCases.length + 1}`,
      title: `${tc.title} (Copy)`,
      executionStatus: 'Untested'
    };
    setTestCases((prev) => [...prev, newCase]);
  };

  const handleAddNewCase = () => {
    const newCase: TestCase = {
      id: `TC-${100 + testCases.length + 1}`,
      title: 'New Custom Test Case',
      type: 'Functional',
      priority: 'High',
      preconditions: 'User is logged in on the staging environment.',
      steps: [
        'Navigate to the designated target page.',
        'Perform the action under test with valid parameters.',
        'Verify UI response and backend records.'
      ],
      testData: 'Standard valid input payload',
      expectedResult: 'System updates correctly and displays confirmation toast.',
      executionStatus: 'Untested',
      notes: '',
      tags: ['Custom', 'QA'],
      gherkin: {
        feature: 'Custom Feature',
        scenario: 'Verify custom scenario behavior',
        given: 'prerequisites are satisfied',
        when: 'the user performs the steps',
        then: 'expected outcome is achieved'
      }
    };
    setTestCases((prev) => [newCase, ...prev]);
  };

  // --- STATS METRICS ---
  const stats = useMemo(() => {
    const total = testCases.length;
    const passed = testCases.filter((tc) => tc.executionStatus === 'Pass').length;
    const failed = testCases.filter((tc) => tc.executionStatus === 'Fail').length;
    const blocked = testCases.filter((tc) => tc.executionStatus === 'Blocked').length;
    const untested = testCases.filter((tc) => tc.executionStatus === 'Untested').length;
    const executed = passed + failed + blocked;
    const passRate = executed > 0 ? Math.round((passed / executed) * 100) : 0;
    const progress = total > 0 ? Math.round((executed / total) * 100) : 0;

    return { total, passed, failed, blocked, untested, executed, passRate, progress };
  }, [testCases]);

  // --- FILTERED CASES ---
  const filteredCases = useMemo(() => {
    return testCases.filter((tc) => {
      const matchesSearch =
        tc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tc.notes.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || tc.executionStatus === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || tc.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [testCases, searchQuery, statusFilter, priorityFilter]);

  // --- EXPORT STRINGS GENERATOR ---
  const gherkinFeatureContent = useMemo(() => {
    const suiteTitle = suiteKey === 'custom' ? (customFeature || 'Custom Suite') : PRESET_SUITES[suiteKey]?.name || 'Test Suite';
    let str = `@suite @automated\nFeature: ${suiteTitle}\n`;
    str += `  As a Quality Assurance Engineer\n`;
    str += `  I want to verify end-to-end specifications for ${suiteTitle}\n`;
    str += `  So that zero regressions reach production\n\n`;

    testCases.forEach((tc) => {
      str += `  @${tc.priority.toLowerCase()} @${tc.type.toLowerCase().replace(/[^a-z0-9]/g, '')}\n`;
      str += `  Scenario: ${tc.id} - ${tc.title}\n`;
      str += `    Given ${tc.gherkin.given}\n`;
      str += `    When ${tc.gherkin.when}\n`;
      str += `    Then ${tc.gherkin.then}\n\n`;
    });

    return str;
  }, [testCases, suiteKey, customFeature]);

  const playwrightCode = useMemo(() => {
    const suiteTitle = suiteKey === 'custom' ? (customFeature || 'Custom Suite') : PRESET_SUITES[suiteKey]?.name || 'Test Suite';
    let code = `import { test, expect } from '@playwright/test';\n\n`;
    code += `/**\n * Automated Test Suite: ${suiteTitle}\n * Generated via Toolique QA Studio\n */\n`;
    code += `test.describe('${suiteTitle}', () => {\n`;
    code += `  test.beforeEach(async ({ page }) => {\n`;
    code += `    // Set up standard staging session or mock headers\n`;
    code += `    await page.goto('/');\n`;
    code += `  });\n\n`;

    testCases.forEach((tc) => {
      code += `  test('${tc.id}: ${tc.title.replace(/'/g, "\\'")}', async ({ page }) => {\n`;
      code += `    // Type: ${tc.type} | Priority: ${tc.priority}\n`;
      code += `    // Preconditions: ${tc.preconditions.replace(/\n/g, ' ')}\n`;
      tc.steps.forEach((step, idx) => {
        code += `    // Step ${idx + 1}: ${step.replace(/\n/g, ' ')}\n`;
      });
      code += `    // Expected: ${tc.expectedResult.replace(/\n/g, ' ')}\n`;
      code += `    // TODO: Connect page locators for your UI\n`;
      code += `    await expect(page).toHaveURL(/.*dashboard/);\n`;
      code += `  });\n\n`;
    });

    code += `});\n`;
    return code;
  }, [testCases, suiteKey, customFeature]);

  const cypressCode = useMemo(() => {
    const suiteTitle = suiteKey === 'custom' ? (customFeature || 'Custom Suite') : PRESET_SUITES[suiteKey]?.name || 'Test Suite';
    let code = `describe('${suiteTitle}', () => {\n`;
    code += `  beforeEach(() => {\n`;
    code += `    cy.visit('/');\n`;
    code += `  });\n\n`;

    testCases.forEach((tc) => {
      code += `  it('${tc.id}: ${tc.title.replace(/'/g, "\\'")}', () => {\n`;
      code += `    // Priority: ${tc.priority} | Type: ${tc.type}\n`;
      tc.steps.forEach((step, idx) => {
        code += `    // ${idx + 1}. ${step}\n`;
      });
      code += `    // Assertion: ${tc.expectedResult}\n`;
      code += `    cy.get('body').should('be.visible');\n`;
      code += `  });\n\n`;
    });

    code += `});\n`;
    return code;
  }, [testCases, suiteKey, customFeature]);

  const postmanCollectionJson = useMemo(() => {
    const suiteTitle = suiteKey === 'custom' ? (customFeature || 'Custom Suite') : PRESET_SUITES[suiteKey]?.name || 'Test Suite';
    const postman = {
      info: {
        name: `QA Suite - ${suiteTitle}`,
        _postman_id: `suite-${Date.now()}`,
        description: `Automated QA Test Suite exported from Toolique Studio with ${testCases.length} assertions.`,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: testCases.map((tc) => ({
        name: `${tc.id}: ${tc.title}`,
        request: {
          method: 'POST',
          header: [
            { key: 'Content-Type', value: 'application/json' },
            { key: 'X-QA-Test-ID', value: tc.id }
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify({ testId: tc.id, testData: tc.testData, priority: tc.priority }, null, 2)
          },
          url: {
            raw: '{{baseUrl}}/api/v1/test-endpoint',
            host: ['{{baseUrl}}'],
            path: ['api', 'v1', 'test-endpoint']
          },
          description: `Preconditions: ${tc.preconditions}\nSteps:\n${tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\nExpected: ${tc.expectedResult}`
        },
        response: []
      }))
    };
    return JSON.stringify(postman, null, 2);
  }, [testCases, suiteKey, customFeature]);

  // --- DOWNLOAD ACTIONS ---
  const handleDownloadCSV = () => {
    const suiteTitle = suiteKey === 'custom' ? (customFeature || 'Custom_Suite') : suiteKey;
    let csv = 'Test Case ID,Title,Type,Priority,Execution Status,Preconditions,Steps,Test Data,Expected Result,QA Notes,Tags\n';

    testCases.forEach((tc) => {
      const escape = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
      const stepsFormatted = tc.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');

      csv += [
        escape(tc.id),
        escape(tc.title),
        escape(tc.type),
        escape(tc.priority),
        escape(tc.executionStatus),
        escape(tc.preconditions),
        escape(stepsFormatted),
        escape(tc.testData),
        escape(tc.expectedResult),
        escape(tc.notes),
        escape(tc.tags.join(', '))
      ].join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qa_test_suite_${suiteTitle.replace(/\s+/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('CSV');
    setTimeout(() => setDownloadSuccess(null), 2000);
  };

  const handleDownloadGherkin = () => {
    const suiteTitle = suiteKey === 'custom' ? (customFeature || 'custom_suite') : suiteKey;
    const blob = new Blob([gherkinFeatureContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${suiteTitle.replace(/\s+/g, '_')}.feature`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('Feature');
    setTimeout(() => setDownloadSuccess(null), 2000);
  };

  const handleDownloadHTMLReport = () => {
    const suiteTitle = suiteKey === 'custom' ? (customFeature || 'Custom Suite') : PRESET_SUITES[suiteKey]?.name || 'Test Suite';
    const casesJson = JSON.stringify(testCases);

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>QA Test Run Report - ${suiteTitle}</title>
  <style>
    :root { --bg: #f8fafc; --card: #ffffff; --text: #0f172a; --border: #e2e8f0; --primary: #4f46e5; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); padding: 32px 16px; margin: 0; }
    .container { max-width: 1100px; margin: 0 auto; }
    .header { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .title { font-size: 24px; font-weight: 800; margin: 0 0 8px 0; }
    .subtitle { color: #64748b; font-size: 14px; margin: 0 0 16px 0; }
    .metrics { display: flex; gap: 12px; flex-wrap: wrap; }
    .badge { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; }
    .badge-pass { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .badge-fail { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    .badge-blocked { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .badge-untested { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
    .card-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .tc-id { font-family: monospace; font-size: 12px; font-weight: 800; background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 6px; }
    .tc-title { font-size: 16px; font-weight: 700; margin: 6px 0 0 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 12px 0; font-size: 13px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .box-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    ol { margin: 8px 0; padding-left: 20px; font-size: 13px; line-height: 1.6; }
    .status-btn { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; border: 1px solid #cbd5e1; cursor: pointer; background: white; margin-right: 4px; }
    .status-btn.active-Pass { background: #22c55e; color: white; border-color: #16a34a; }
    .status-btn.active-Fail { background: #ef4444; color: white; border-color: #dc2626; }
    .status-btn.active-Blocked { background: #f59e0b; color: white; border-color: #d97706; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">📋 QA Test Run Report: ${suiteTitle}</h1>
      <p class="subtitle">Generated on ${new Date().toLocaleString()} via Toolique QA Studio. Fully executable offline test suite.</p>
      <div class="metrics" id="metrics-bar">
        <span class="badge badge-pass" id="cnt-pass">Passed: ${stats.passed}</span>
        <span class="badge badge-fail" id="cnt-fail">Failed: ${stats.failed}</span>
        <span class="badge badge-blocked" id="cnt-blocked">Blocked: ${stats.blocked}</span>
        <span class="badge badge-untested" id="cnt-untested">Untested: ${stats.untested}</span>
        <span class="badge" style="background:#e0e7ff; color:#3730a3; border:1px solid #c7d2fe;" id="cnt-rate">Pass Rate: ${stats.passRate}%</span>
      </div>
    </div>
    <div id="test-cases-root"></div>
  </div>

  <script>
    let cases = ${casesJson};

    function render() {
      const root = document.getElementById('test-cases-root');
      root.innerHTML = cases.map(tc => \`
        <div class="card" id="card-\${tc.id}">
          <div class="card-head">
            <div>
              <span class="tc-id">\${tc.id}</span>
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; margin-left: 8px; color: #64748b;">\${tc.type} • \${tc.priority} Priority</span>
              <div class="tc-title">\${tc.title}</div>
            </div>
            <div>
              <button class="status-btn \${tc.executionStatus === 'Pass' ? 'active-Pass' : ''}" onclick="setStatus('\${tc.id}', 'Pass')">Pass</button>
              <button class="status-btn \${tc.executionStatus === 'Fail' ? 'active-Fail' : ''}" onclick="setStatus('\${tc.id}', 'Fail')">Fail</button>
              <button class="status-btn \${tc.executionStatus === 'Blocked' ? 'active-Blocked' : ''}" onclick="setStatus('\${tc.id}', 'Blocked')">Blocked</button>
              <button class="status-btn \${tc.executionStatus === 'Untested' ? 'badge-untested' : ''}" onclick="setStatus('\${tc.id}', 'Untested')">Reset</button>
            </div>
          </div>
          <div class="grid">
            <div class="box">
              <div class="box-title">Preconditions</div>
              <div>\${tc.preconditions}</div>
              <div class="box-title" style="margin-top: 8px;">Test Data</div>
              <div style="font-family: monospace; color: #4338ca;">\${tc.testData || 'None'}</div>
            </div>
            <div class="box">
              <div class="box-title">Expected Result</div>
              <div>\${tc.expectedResult}</div>
            </div>
          </div>
          <div class="box-title">Test Steps</div>
          <ol>
            \${tc.steps.map(s => \`<li>\${s}</li>\`).join('')}
          </ol>
        </div>
      \`).join('');

      updateMetrics();
    }

    function setStatus(id, st) {
      const item = cases.find(c => c.id === id);
      if (item) {
        item.executionStatus = st;
        render();
      }
    }

    function updateMetrics() {
      const p = cases.filter(c => c.executionStatus === 'Pass').length;
      const f = cases.filter(c => c.executionStatus === 'Fail').length;
      const b = cases.filter(c => c.executionStatus === 'Blocked').length;
      const u = cases.filter(c => c.executionStatus === 'Untested').length;
      const total = cases.length;
      const exec = p + f + b;
      const rate = exec > 0 ? Math.round((p / exec) * 100) : 0;

      document.getElementById('cnt-pass').innerText = 'Passed: ' + p;
      document.getElementById('cnt-fail').innerText = 'Failed: ' + f;
      document.getElementById('cnt-blocked').innerText = 'Blocked: ' + b;
      document.getElementById('cnt-untested').innerText = 'Untested: ' + u;
      document.getElementById('cnt-rate').innerText = 'Pass Rate: ' + rate + '%';
    }

    render();
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qa_test_report_${suiteKey}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('HTML');
    setTimeout(() => setDownloadSuccess(null), 2000);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* --- TOP CONTROL BAR & RUN STATS --- */}
      <div className="saas-card p-5 space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Enterprise QA Test Case & Execution Studio</span>
              </h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                Live Execution
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Design, execute, and export comprehensive multi-dimension QA test suites. Runs 100% locally in your browser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAddNewCase}
              className="saas-button-primary py-2 px-3.5 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Test Case</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="saas-button-secondary py-2 px-3.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              {downloadSuccess === 'CSV' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
              <span>{downloadSuccess === 'CSV' ? 'Exported!' : 'Export CSV'}</span>
            </button>

            <button
              onClick={handleDownloadHTMLReport}
              className="saas-button-secondary py-2 px-3.5 text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              {downloadSuccess === 'HTML' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
              <span>Interactive HTML</span>
            </button>
          </div>
        </div>

        {/* --- LIVE EXECUTION METRICS DASHBOARD --- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40">
            <div className="text-[10px] font-black uppercase text-zinc-400">Total Cases</div>
            <div className="text-lg font-black text-zinc-900 dark:text-white mt-0.5">{stats.total}</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
            <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Passed</span>
            </div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.passed}</div>
          </div>

          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
            <div className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              <span>Failed</span>
            </div>
            <div className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">{stats.failed}</div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
            <div className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Blocked</span>
            </div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">{stats.blocked}</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-500/5 border border-zinc-500/15">
            <div className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Untested</span>
            </div>
            <div className="text-lg font-black text-zinc-600 dark:text-zinc-400 mt-0.5">{stats.untested}</div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
            <div className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">Pass Rate</div>
            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{stats.passRate}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-zinc-500">
            <span>Test Run Progress ({stats.executed} / {stats.total} Executed)</span>
            <span>{stats.progress}%</span>
          </div>
          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
            <div style={{ width: `${stats.total > 0 ? (stats.passed / stats.total) * 100 : 0}%` }} className="bg-emerald-500 transition-all duration-300" title={`Passed: ${stats.passed}`} />
            <div style={{ width: `${stats.total > 0 ? (stats.failed / stats.total) * 100 : 0}%` }} className="bg-rose-500 transition-all duration-300" title={`Failed: ${stats.failed}`} />
            <div style={{ width: `${stats.total > 0 ? (stats.blocked / stats.total) * 100 : 0}%` }} className="bg-amber-500 transition-all duration-300" title={`Blocked: ${stats.blocked}`} />
          </div>
        </div>
      </div>

      {/* --- WORKSPACE GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* --- LEFT SIDEBAR: PRESETS & AI GENERATOR --- */}
        <div className="lg:col-span-4 space-y-5">
          {/* Preset Suites */}
          <div className="saas-card p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Enterprise QA Presets</span>
              </h3>
              <span className="text-[10px] font-bold text-zinc-400">10 Templates</span>
            </div>

            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
              {Object.entries(PRESET_SUITES).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => handleLoadPreset(key)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-0.5 ${
                    suiteKey === key
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400 shadow-xs'
                      : 'bg-white/40 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-850/40 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold">{item.name}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {item.cases.length} cases
                    </span>
                  </div>
                  <span className="text-[10.5px] text-zinc-450 dark:text-zinc-500 line-clamp-1">
                    {item.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AI / Heuristic Custom Generator */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Scenario Synthesizer</span>
              </h3>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                8 Dimensions
              </span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Feature or User Story</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Split Payment, Reset Password, PDF Exporter"
                  value={customFeature}
                  onChange={(e) => setCustomFeature(e.target.value)}
                  className="saas-input text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Acceptance Criteria / Notes (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Describe inputs, business rules, limits, or security considerations..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="saas-input resize-none text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateCustom}
                disabled={!customFeature.trim()}
                className="saas-button-primary w-full cursor-pointer py-2.5 text-xs flex items-center justify-center gap-2"
              >
                <StartIcon className="w-3.5 h-3.5" />
                <span>Synthesize Multi-Dimension Suite</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- RIGHT MAIN VIEW AREA --- */}
        <div className="lg:col-span-8 space-y-5">
          {/* Main Navigation Tabs */}
          <div className="saas-card p-4 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('studio')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'studio'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Studio Cards</span>
                </button>

                <button
                  onClick={() => setActiveTab('matrix')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'matrix'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Execution Matrix</span>
                </button>

                <button
                  onClick={() => setActiveTab('gherkin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'gherkin'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>BDD Gherkin</span>
                </button>

                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'code'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Automation Specs</span>
                </button>
              </div>

              {/* Bulk Status Actions */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  onClick={() => handleBulkStatus('Pass')}
                  className="px-2 py-1 text-[10px] font-black uppercase rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  title="Mark all test cases as Passed"
                >
                  Pass All
                </button>
                <button
                  onClick={() => handleBulkStatus('Untested')}
                  className="px-2 py-1 text-[10px] font-black uppercase rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:bg-zinc-200 transition-colors cursor-pointer"
                  title="Reset all execution statuses to Untested"
                >
                  Reset All
                </button>
              </div>
            </div>

            {/* Search & Filters Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search title, ID, tag, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="saas-input pl-8 py-1.5 text-xs"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="saas-input py-1.5 text-xs"
                >
                  <option value="ALL">Status: All</option>
                  <option value="Untested">Untested</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="saas-input py-1.5 text-xs"
                >
                  <option value="ALL">Priority: All</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* --- TAB 1: STUDIO CARD VIEW --- */}
          {activeTab === 'studio' && (
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {filteredCases.length === 0 ? (
                <div className="saas-card p-10 text-center space-y-2">
                  <Filter className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
                  <p className="text-xs font-bold text-zinc-500">No test cases match the applied search and filter criteria.</p>
                </div>
              ) : (
                filteredCases.map((tc) => (
                  <div
                    key={tc.id}
                    className={`saas-card p-5 space-y-3.5 transition-all border ${
                      tc.executionStatus === 'Pass'
                        ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
                        : tc.executionStatus === 'Fail'
                        ? 'border-rose-500/30 bg-rose-500/[0.02]'
                        : tc.executionStatus === 'Blocked'
                        ? 'border-amber-500/30 bg-amber-500/[0.02]'
                        : 'border-zinc-200/60 dark:border-zinc-800/60'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10.5px] font-black font-mono text-indigo-700 dark:text-indigo-350 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {tc.id}
                        </span>
                        <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded border bg-zinc-100 dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {tc.type}
                        </span>
                        <span
                          className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border ${
                            tc.priority === 'Critical' || tc.priority === 'High'
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                              : tc.priority === 'Medium'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {tc.priority}
                        </span>

                        {tc.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-850 text-zinc-500 border border-zinc-200/40 dark:border-zinc-800/40"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Status Toggle Radio Buttons */}
                      <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                        {(['Pass', 'Fail', 'Blocked', 'Untested'] as ExecutionStatus[]).map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateStatus(tc.id, st)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                              tc.executionStatus === st
                                ? st === 'Pass'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : st === 'Fail'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : st === 'Blocked'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-zinc-700 text-white shadow-xs'
                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white">
                      {tc.title}
                    </h4>

                    {/* Preconditions & Expected Results Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Preconditions</div>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200/30 dark:border-zinc-800/30 text-xs">
                          {tc.preconditions}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Expected Result</div>
                        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200/30 dark:border-zinc-800/30 text-xs">
                          {tc.expectedResult}
                        </p>
                      </div>
                    </div>

                    {/* Test Steps */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Test Steps & Actions</div>
                      <ol className="list-decimal pl-5 space-y-1 text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed bg-white/50 dark:bg-zinc-950/30 p-3 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                        {tc.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Test Data Payload */}
                    {tc.testData && (
                      <div className="flex items-center gap-2 text-xs bg-indigo-500/5 p-2 rounded-xl border border-indigo-500/10">
                        <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 shrink-0">Test Data:</span>
                        <code className="text-[11px] font-mono text-zinc-700 dark:text-zinc-300 truncate">{tc.testData}</code>
                      </div>
                    )}

                    {/* Bottom Actions: QA Notes / Defect Link & CRUD */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
                      <div className="flex items-center gap-2 w-full sm:w-2/3">
                        <input
                          type="text"
                          placeholder="Add QA Notes / Defect Link (e.g. BUG-102: Timeout on slow 3G)..."
                          value={tc.notes}
                          onChange={(e) => handleUpdateNotes(tc.id, e.target.value)}
                          className="saas-input py-1 text-xs w-full"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => handleDuplicateCase(tc)}
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Duplicate Test Case"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCase(tc.id)}
                          className="p-1.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Test Case"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* --- TAB 2: EXECUTION MATRIX GRID --- */}
          {activeTab === 'matrix' && (
            <div className="saas-card overflow-hidden border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="overflow-x-auto max-h-[70vh]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100/70 dark:bg-zinc-900/80 sticky top-0 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                    <tr>
                      <th className="p-3 w-16">ID</th>
                      <th className="p-3">Title & Scenario</th>
                      <th className="p-3 w-28">Type</th>
                      <th className="p-3 w-24">Priority</th>
                      <th className="p-3 w-36">Status</th>
                      <th className="p-3 w-20 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                    {filteredCases.map((tc) => (
                      <tr key={tc.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/30 transition-colors">
                        <td className="p-3 font-mono font-black text-indigo-600 dark:text-indigo-400">{tc.id}</td>
                        <td className="p-3 space-y-0.5">
                          <div className="font-bold text-zinc-900 dark:text-white">{tc.title}</div>
                          <div className="text-[10.5px] text-zinc-450 dark:text-zinc-500 line-clamp-1">{tc.expectedResult}</div>
                        </td>
                        <td className="p-3">
                          <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded border bg-zinc-100 dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {tc.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border ${
                              tc.priority === 'Critical' || tc.priority === 'High'
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                                : tc.priority === 'Medium'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {tc.priority}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={tc.executionStatus}
                            onChange={(e) => handleUpdateStatus(tc.id, e.target.value as ExecutionStatus)}
                            className={`saas-input py-1 text-xs font-bold rounded-lg ${
                              tc.executionStatus === 'Pass'
                                ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30'
                                : tc.executionStatus === 'Fail'
                                ? 'text-rose-600 bg-rose-500/10 border-rose-500/30'
                                : tc.executionStatus === 'Blocked'
                                ? 'text-amber-600 bg-amber-500/10 border-amber-500/30'
                                : 'text-zinc-500'
                            }`}
                          >
                            <option value="Untested">Untested</option>
                            <option value="Pass">Passed</option>
                            <option value="Fail">Failed</option>
                            <option value="Blocked">Blocked</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteCase(tc.id)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- TAB 3: BDD GHERKIN FEATURE VIEW --- */}
          {activeTab === 'gherkin' && (
            <div className="saas-card p-5 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Gherkin / Cucumber .feature Specification
                  </h3>
                  <p className="text-[11px] text-zinc-450 mt-0.5">
                    Standard BDD Given-When-Then syntax ready for Cucumber, Behave, or SpecFlow execution.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyCode(gherkinFeatureContent)}
                    className="saas-button-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Gherkin'}</span>
                  </button>

                  <button
                    onClick={handleDownloadGherkin}
                    className="saas-button-primary py-1.5 px-3 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .feature</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto max-h-[60vh] leading-relaxed border border-zinc-800">
                {gherkinFeatureContent}
              </pre>
            </div>
          )}

          {/* --- TAB 4: AUTOMATION CODE VIEW --- */}
          {activeTab === 'code' && (
            <div className="saas-card p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <div className="flex items-center gap-1.5">
                  {(['playwright', 'cypress', 'postman', 'vitest'] as CodeTarget[]).map((target) => (
                    <button
                      key={target}
                      onClick={() => setCodeTarget(target)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        codeTarget === target
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      {target === 'playwright'
                        ? 'Playwright TS'
                        : target === 'cypress'
                        ? 'Cypress JS'
                        : target === 'postman'
                        ? 'Postman Collection v2.1'
                        : 'Vitest / Jest'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    handleCopyCode(
                      codeTarget === 'playwright'
                        ? playwrightCode
                        : codeTarget === 'cypress'
                        ? cypressCode
                        : codeTarget === 'postman'
                        ? postmanCollectionJson
                        : playwrightCode
                    )
                  }
                  className="saas-button-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto max-h-[60vh] leading-relaxed border border-zinc-800">
                {codeTarget === 'playwright' && playwrightCode}
                {codeTarget === 'cypress' && cypressCode}
                {codeTarget === 'postman' && postmanCollectionJson}
                {codeTarget === 'vitest' && playwrightCode}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info Callout */}
      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs font-medium text-zinc-600 dark:text-zinc-400 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <strong>Enterprise QA Best Practice:</strong> Combine positive happy paths with negative boundary validation, security authorization checks, accessibility testing, and idempotency tests for full test matrix coverage. Export results to Jira, Playwright, or download the interactive offline HTML report.
        </div>
      </div>
    </div>
  );
}
