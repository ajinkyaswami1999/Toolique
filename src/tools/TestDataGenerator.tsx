import { useState, useMemo, useCallback } from 'react';
import { 
  Clipboard, 
  Check, 
  Download, 
  RefreshCw, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  Layers, 
  Table as TableIcon, 
  Code2, 
  Database, 
  Sparkles, 
  Sliders, 
  Hash, 
  ChevronRight, 
  Search, 
  Share2, 
  Lock, 
  Unlock, 
  Shuffle,
  X 
} from 'lucide-react';
import { Link } from 'react-router-dom';

// -------------------------------------------------------------
// DETERMINISTIC PSEUDO-RANDOM NUMBER GENERATOR (LCG / Mulberry32)
// -------------------------------------------------------------
class SeededRandom {
  private seed: number;

  constructor(seedStringOrNum: string | number) {
    if (typeof seedStringOrNum === 'number') {
      this.seed = seedStringOrNum;
    } else {
      let h = 2166136261;
      for (let i = 0; i < seedStringOrNum.length; i++) {
        h = Math.imul(h ^ seedStringOrNum.charCodeAt(i), 16777619);
      }
      this.seed = h >>> 0;
    }
  }

  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  boolean(probTrue = 0.5): boolean {
    return this.next() < probTrue;
  }
}

// -------------------------------------------------------------
// DATASETS & DICTIONARIES (Indian + Global)
// -------------------------------------------------------------
const FIRST_NAMES_IN = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Rohan', 'Amit', 'Rahul', 'Priya', 'Neha', 'Ananya', 'Diya', 'Ishaan', 'Kabir', 'Tanvi', 'Siddharth', 'Aditi', 'Vikram', 'Meera', 'Sneha', 'Deepak', 'Gaurav', 'Kavya', 'Pooja', 'Rajesh', 'Suresh', 'Manish', 'Karan'];
const FIRST_NAMES_GL = ['James', 'Emma', 'Michael', 'Emily', 'Sarah', 'David', 'Daniel', 'Sophia', 'Lucas', 'Olivia', 'Alexander', 'Mia', 'Benjamin', 'Charlotte', 'William', 'Amelia', 'Henry', 'Evelyn', 'Liam', 'Harper'];

const LAST_NAMES_IN = ['Swami', 'Sharma', 'Patel', 'Kumar', 'Singh', 'Joshi', 'Swamy', 'Gupta', 'Iyer', 'Reddy', 'Nair', 'Verma', 'Deshmukh', 'Kulkarni', 'Chopra', 'Malhotra', 'Bose', 'Chatterjee', 'Mishra', 'Agarwal', 'Shah', 'Mehta', 'Rao'];
const LAST_NAMES_GL = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'White', 'Harris', 'Clark'];

const DOMAINS_PERSONAL = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'proton.me'];
const DOMAINS_CORP = ['toolique.in', 'voxelique.com', 'techcorp.io', 'innovate.ai', 'enterprise-hub.com', 'cloudscale.net', 'finops.dev'];

const INDIAN_CITIES = ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat', 'Chandigarh', 'Indore', 'Kochi', 'Noida', 'Gurugram'];
const GLOBAL_CITIES = ['San Francisco', 'New York', 'London', 'Berlin', 'Singapore', 'Tokyo', 'Toronto', 'Sydney', 'Amsterdam', 'Dubai', 'Paris', 'Zurich'];

const INDIAN_STATES = ['Maharashtra', 'Karnataka', 'Delhi', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Haryana', 'Kerala'];
const GLOBAL_COUNTRIES = ['India', 'United States', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'Singapore', 'Japan', 'Netherlands', 'United Arab Emirates', 'France'];

const JOB_TITLES = [
  'Senior Full Stack Engineer', 'Lead QA Architect', 'DevOps Specialist', 'Product Manager', 
  'Frontend Developer', 'Data Scientist', 'Engineering Manager', 'Solutions Architect', 
  'UI/UX Designer', 'Security Analyst', 'Backend Node.js Developer', 'Database Administrator', 
  'Chief Technology Officer', 'VP of Product', 'Cloud Infrastructure Engineer'
];

const DEPARTMENTS = ['Engineering', 'Quality Assurance', 'Product Management', 'DevOps & SRE', 'Data & AI', 'Finance', 'Human Resources', 'Design', 'Marketing', 'Sales'];

const PRODUCT_NAMES = [
  'Ultra-Wide 4K Gaming Monitor', 'Ergonomic Standing Desk Pro', 'Mechanical Wireless Keyboard', 
  'Noise Cancelling Studio Headphones', 'Smart Dual-Zone Air Purifier', 'Thunderbolt 4 Docking Station', 
  'Precision 3D Printer Filament Spool', 'High-Speed NVMe SSD 2TB', 'Smart Watch Fitness Tracker', 
  'Ergonomic Mesh Chair', 'USB-C GaN Fast Charger 120W', 'Professional Condenser Microphone'
];

const HTTP_STATUS_CODES = [200, 200, 200, 201, 204, 400, 401, 403, 404, 422, 429, 500, 502, 503];
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const API_ENDPOINTS = ['/api/v1/users', '/api/v1/auth/login', '/api/v1/orders', '/api/v1/payments/verify', '/api/v1/products', '/api/v1/webhooks/stripe', '/api/v1/analytics/events', '/api/v1/settings'];

const INDIAN_BANKS_IFSC = ['HDFC0001234', 'SBIN0004567', 'ICIC0000890', 'UTIB0002345', 'KKBK0006789', 'PUNB0001122', 'BARB0MUMBAI'];
const PAYMENT_METHODS = ['UPI (GPay / PhonePe / Paytm)', 'Credit Card (Visa / Mastercard / RuPay)', 'Net Banking (NEFT/RTGS/IMPS)', 'Debit Card', 'Cash on Delivery', 'Corporate Wire Transfer'];

// -------------------------------------------------------------
// FIELD TYPE DEFINITIONS
// -------------------------------------------------------------
export type FieldCategory = 'identity' | 'personal' | 'contact' | 'india_kyc' | 'commerce' | 'tech' | 'datetime' | 'custom';

export interface FieldDefinition {
  type: string;
  name: string;
  category: FieldCategory;
  defaultLabel: string;
  description: string;
  sqlTypePostgres: string;
  sqlTypeMySQL: string;
  tsType: string;
}

export const AVAILABLE_FIELDS: FieldDefinition[] = [
  // Identity
  { type: 'uuid', name: 'UUID v4', category: 'identity', defaultLabel: 'id', description: 'Canonical RFC 4122 v4 UUID string', sqlTypePostgres: 'UUID PRIMARY KEY', sqlTypeMySQL: 'VARCHAR(36) PRIMARY KEY', tsType: 'string' },
  { type: 'auto_id', name: 'Auto-Increment ID', category: 'identity', defaultLabel: 'id', description: 'Sequentially increasing integer (1, 2, 3...)', sqlTypePostgres: 'SERIAL PRIMARY KEY', sqlTypeMySQL: 'INT AUTO_INCREMENT PRIMARY KEY', tsType: 'number' },
  { type: 'nanoid', name: 'NanoID / Short CUID', category: 'identity', defaultLabel: 'cuid', description: 'Compact URL-friendly collision-resistant ID', sqlTypePostgres: 'VARCHAR(21)', sqlTypeMySQL: 'VARCHAR(21)', tsType: 'string' },
  { type: 'mongodb_id', name: 'MongoDB ObjectId', category: 'identity', defaultLabel: '_id', description: '24-character hex timestamped ObjectId', sqlTypePostgres: 'VARCHAR(24)', sqlTypeMySQL: 'VARCHAR(24)', tsType: 'string' },

  // Personal
  { type: 'full_name', name: 'Full Name', category: 'personal', defaultLabel: 'name', description: 'First and last name (Indian & Global mixed)', sqlTypePostgres: 'VARCHAR(150)', sqlTypeMySQL: 'VARCHAR(150)', tsType: 'string' },
  { type: 'first_name', name: 'First Name', category: 'personal', defaultLabel: 'first_name', description: 'Individual given first name', sqlTypePostgres: 'VARCHAR(80)', sqlTypeMySQL: 'VARCHAR(80)', tsType: 'string' },
  { type: 'last_name', name: 'Last Name', category: 'personal', defaultLabel: 'last_name', description: 'Individual family last name', sqlTypePostgres: 'VARCHAR(80)', sqlTypeMySQL: 'VARCHAR(80)', tsType: 'string' },
  { type: 'username', name: 'Username', category: 'personal', defaultLabel: 'username', description: 'Lowercase handle with initials and digits', sqlTypePostgres: 'VARCHAR(60)', sqlTypeMySQL: 'VARCHAR(60)', tsType: 'string' },
  { type: 'gender', name: 'Gender', category: 'personal', defaultLabel: 'gender', description: 'Male, Female, Non-Binary, or Other', sqlTypePostgres: 'VARCHAR(20)', sqlTypeMySQL: 'VARCHAR(20)', tsType: 'string' },
  { type: 'avatar', name: 'Avatar URL', category: 'personal', defaultLabel: 'avatar_url', description: 'Dicebear SVG / Placeholder avatar link', sqlTypePostgres: 'VARCHAR(255)', sqlTypeMySQL: 'VARCHAR(255)', tsType: 'string' },
  { type: 'job_title', name: 'Job Title', category: 'personal', defaultLabel: 'job_title', description: 'Software, QA, PM, or Engineering role', sqlTypePostgres: 'VARCHAR(120)', sqlTypeMySQL: 'VARCHAR(120)', tsType: 'string' },
  { type: 'department', name: 'Department', category: 'personal', defaultLabel: 'department', description: 'Engineering, QA, Finance, Design, HR', sqlTypePostgres: 'VARCHAR(60)', sqlTypeMySQL: 'VARCHAR(60)', tsType: 'string' },
  { type: 'age', name: 'Age', category: 'personal', defaultLabel: 'age', description: 'Integer age in range (18 to 70)', sqlTypePostgres: 'INT', sqlTypeMySQL: 'INT', tsType: 'number' },

  // Contact
  { type: 'email', name: 'Email Address', category: 'contact', defaultLabel: 'email', description: 'Normalized work/personal email address', sqlTypePostgres: 'VARCHAR(255)', sqlTypeMySQL: 'VARCHAR(255)', tsType: 'string' },
  { type: 'phone_india', name: 'Indian Mobile (+91)', category: 'contact', defaultLabel: 'phone', description: '+91 with authentic 9/8/7/6 telecom prefixes', sqlTypePostgres: 'VARCHAR(20)', sqlTypeMySQL: 'VARCHAR(20)', tsType: 'string' },
  { type: 'phone_intl', name: 'International Phone', category: 'contact', defaultLabel: 'phone_intl', description: 'E.164 formatted international phone number', sqlTypePostgres: 'VARCHAR(25)', sqlTypeMySQL: 'VARCHAR(25)', tsType: 'string' },
  { type: 'city', name: 'City', category: 'contact', defaultLabel: 'city', description: 'Indian metropolitan or global tech hub city', sqlTypePostgres: 'VARCHAR(100)', sqlTypeMySQL: 'VARCHAR(100)', tsType: 'string' },
  { type: 'state', name: 'State / Province', category: 'contact', defaultLabel: 'state', description: 'State name (Maharashtra, Karnataka, etc.)', sqlTypePostgres: 'VARCHAR(100)', sqlTypeMySQL: 'VARCHAR(100)', tsType: 'string' },
  { type: 'country', name: 'Country', category: 'contact', defaultLabel: 'country', description: 'Country name (India, US, UK, Germany, etc.)', sqlTypePostgres: 'VARCHAR(100)', sqlTypeMySQL: 'VARCHAR(100)', tsType: 'string' },
  { type: 'pincode', name: 'Pincode / Postal Code', category: 'contact', defaultLabel: 'pincode', description: '6-digit Indian PIN or 5-digit US ZIP', sqlTypePostgres: 'VARCHAR(10)', sqlTypeMySQL: 'VARCHAR(10)', tsType: 'string' },
  { type: 'street_address', name: 'Street Address', category: 'contact', defaultLabel: 'address', description: 'Building, street, and suite address', sqlTypePostgres: 'VARCHAR(255)', sqlTypeMySQL: 'VARCHAR(255)', tsType: 'string' },

  // India KYC & Finance
  { type: 'pan_card', name: 'Indian PAN Card', category: 'india_kyc', defaultLabel: 'pan_number', description: '10-character alphanumeric PAN format (e.g. ABCDE1234F)', sqlTypePostgres: 'VARCHAR(10)', sqlTypeMySQL: 'VARCHAR(10)', tsType: 'string' },
  { type: 'gstin', name: 'GSTIN Number', category: 'india_kyc', defaultLabel: 'gstin', description: '15-digit Indian GST tax identification number', sqlTypePostgres: 'VARCHAR(15)', sqlTypeMySQL: 'VARCHAR(15)', tsType: 'string' },
  { type: 'aadhaar_masked', name: 'Masked Aadhaar', category: 'india_kyc', defaultLabel: 'aadhaar_masked', description: 'Masked 12-digit format (XXXX-XXXX-1234)', sqlTypePostgres: 'VARCHAR(14)', sqlTypeMySQL: 'VARCHAR(14)', tsType: 'string' },
  { type: 'ifsc_code', name: 'Bank IFSC Code', category: 'india_kyc', defaultLabel: 'ifsc_code', description: 'Indian 11-digit Bank Branch Code', sqlTypePostgres: 'VARCHAR(11)', sqlTypeMySQL: 'VARCHAR(11)', tsType: 'string' },
  { type: 'upi_id', name: 'UPI ID / VPA', category: 'india_kyc', defaultLabel: 'upi_id', description: 'Virtual Payment Address (user@okhdfcbank)', sqlTypePostgres: 'VARCHAR(80)', sqlTypeMySQL: 'VARCHAR(80)', tsType: 'string' },

  // Commerce & Financial
  { type: 'amount_inr', name: 'Amount (₹ INR)', category: 'commerce', defaultLabel: 'amount', description: 'Indian Rupee currency amount (e.g. ₹4,999.00)', sqlTypePostgres: 'DECIMAL(12,2)', sqlTypeMySQL: 'DECIMAL(12,2)', tsType: 'number' },
  { type: 'amount_usd', name: 'Amount ($ USD)', category: 'commerce', defaultLabel: 'price_usd', description: 'USD price amount (e.g. 49.99)', sqlTypePostgres: 'DECIMAL(10,2)', sqlTypeMySQL: 'DECIMAL(10,2)', tsType: 'number' },
  { type: 'payment_method', name: 'Payment Method', category: 'commerce', defaultLabel: 'payment_method', description: 'UPI, Credit Card, NetBanking, COD', sqlTypePostgres: 'VARCHAR(50)', sqlTypeMySQL: 'VARCHAR(50)', tsType: 'string' },
  { type: 'order_status', name: 'Order Status', category: 'commerce', defaultLabel: 'order_status', description: 'Completed, Processing, Shipped, Cancelled', sqlTypePostgres: 'VARCHAR(30)', sqlTypeMySQL: 'VARCHAR(30)', tsType: 'string' },
  { type: 'credit_card_mask', name: 'Masked Credit Card', category: 'commerce', defaultLabel: 'card_number', description: 'Masked 16-digit card number (4532 **** **** 8821)', sqlTypePostgres: 'VARCHAR(25)', sqlTypeMySQL: 'VARCHAR(25)', tsType: 'string' },
  { type: 'product_title', name: 'Product Name', category: 'commerce', defaultLabel: 'product_name', description: 'Realistic e-commerce product name', sqlTypePostgres: 'VARCHAR(200)', sqlTypeMySQL: 'VARCHAR(200)', tsType: 'string' },
  { type: 'sku_code', name: 'SKU Code', category: 'commerce', defaultLabel: 'sku', description: 'E-commerce item SKU (SKU-TECH-7892)', sqlTypePostgres: 'VARCHAR(30)', sqlTypeMySQL: 'VARCHAR(30)', tsType: 'string' },

  // Tech & Network
  { type: 'ipv4', name: 'IPv4 Address', category: 'tech', defaultLabel: 'ip_address', description: 'Dotted-quad IP address (192.168.1.10)', sqlTypePostgres: 'INET', sqlTypeMySQL: 'VARCHAR(45)', tsType: 'string' },
  { type: 'mac_address', name: 'MAC Address', category: 'tech', defaultLabel: 'mac_address', description: 'Hex hardware MAC address (00:1B:44:11:3A:B7)', sqlTypePostgres: 'MACADDR', sqlTypeMySQL: 'VARCHAR(17)', tsType: 'string' },
  { type: 'domain', name: 'Domain Name', category: 'tech', defaultLabel: 'domain', description: 'Internet domain name (toolique.in, api.io)', sqlTypePostgres: 'VARCHAR(100)', sqlTypeMySQL: 'VARCHAR(100)', tsType: 'string' },
  { type: 'url', name: 'API / Web URL', category: 'tech', defaultLabel: 'endpoint_url', description: 'HTTPS URL for web APIs', sqlTypePostgres: 'VARCHAR(255)', sqlTypeMySQL: 'VARCHAR(255)', tsType: 'string' },
  { type: 'http_status', name: 'HTTP Status Code', category: 'tech', defaultLabel: 'status_code', description: '200, 201, 400, 404, 500 integer code', sqlTypePostgres: 'INT', sqlTypeMySQL: 'INT', tsType: 'number' },
  { type: 'http_method', name: 'HTTP Method', category: 'tech', defaultLabel: 'http_method', description: 'GET, POST, PUT, DELETE, PATCH', sqlTypePostgres: 'VARCHAR(10)', sqlTypeMySQL: 'VARCHAR(10)', tsType: 'string' },
  { type: 'latency_ms', name: 'Latency (ms)', category: 'tech', defaultLabel: 'response_time_ms', description: 'Server response time in milliseconds (12 - 1200ms)', sqlTypePostgres: 'INT', sqlTypeMySQL: 'INT', tsType: 'number' },

  // DateTime
  { type: 'iso_timestamp', name: 'ISO Timestamp', category: 'datetime', defaultLabel: 'created_at', description: 'ISO 8601 UTC timestamp format', sqlTypePostgres: 'TIMESTAMPTZ DEFAULT NOW()', sqlTypeMySQL: 'DATETIME DEFAULT CURRENT_TIMESTAMP', tsType: 'string' },
  { type: 'unix_epoch', name: 'UNIX Epoch (ms)', category: 'datetime', defaultLabel: 'timestamp_epoch', description: '13-digit millisecond epoch timestamp', sqlTypePostgres: 'BIGINT', sqlTypeMySQL: 'BIGINT', tsType: 'number' },
  { type: 'date_past', name: 'Past Date (YYYY-MM-DD)', category: 'datetime', defaultLabel: 'date_joined', description: 'Calendar date within the past 12 months', sqlTypePostgres: 'DATE', sqlTypeMySQL: 'DATE', tsType: 'string' },

  // Custom
  { type: 'boolean', name: 'Boolean (True / False)', category: 'custom', defaultLabel: 'is_active', description: 'True / False flag with configurable probability', sqlTypePostgres: 'BOOLEAN', sqlTypeMySQL: 'TINYINT(1)', tsType: 'boolean' },
  { type: 'number_range', name: 'Custom Number Range', category: 'custom', defaultLabel: 'score', description: 'Random integer within custom Min & Max limits', sqlTypePostgres: 'INT', sqlTypeMySQL: 'INT', tsType: 'number' },
  { type: 'custom_options', name: 'Custom Picklist (Enum)', category: 'custom', defaultLabel: 'role', description: 'Select random value from comma-separated choices', sqlTypePostgres: 'VARCHAR(50)', sqlTypeMySQL: 'VARCHAR(50)', tsType: 'string' }
];

// -------------------------------------------------------------
// SCHEMA COLUMN CONFIG INTERFACE
// -------------------------------------------------------------
export interface ColumnConfig {
  id: string;
  key: string;
  type: string;
  active: boolean;
  options?: {
    min?: number;
    max?: number;
    probTrue?: number;
    choices?: string;
    nullPercent?: number;
  };
}

// -------------------------------------------------------------
// PRE-BUILT INDUSTRY SCHEMAS
// -------------------------------------------------------------
export interface SchemaPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  sqlTable: string;
  columns: ColumnConfig[];
}

export const PRESET_SCHEMAS: SchemaPreset[] = [
  {
    id: 'users',
    name: 'User & Authentication Profiles',
    description: 'Universal developer auth dataset with UUIDs, usernames, Indian/Global names, emails, and roles.',
    icon: 'ShieldCheck',
    sqlTable: 'users',
    columns: [
      { id: '1', key: 'id', type: 'uuid', active: true },
      { id: '2', key: 'full_name', type: 'full_name', active: true },
      { id: '3', key: 'username', type: 'username', active: true },
      { id: '4', key: 'email', type: 'email', active: true },
      { id: '5', key: 'phone', type: 'phone_india', active: true },
      { id: '6', key: 'role', type: 'custom_options', active: true, options: { choices: 'Admin, Member, Viewer, Manager, Superadmin' } },
      { id: '7', key: 'is_verified', type: 'boolean', active: true, options: { probTrue: 0.85 } },
      { id: '8', key: 'created_at', type: 'iso_timestamp', active: true }
    ]
  },
  {
    id: 'ecommerce_india',
    name: 'Indian E-Commerce Orders & GST',
    description: 'Realistic e-commerce transactions with Indian GSTIN, payment gateways, SKU, and status.',
    icon: 'CreditCard',
    sqlTable: 'orders',
    columns: [
      { id: '1', key: 'order_id', type: 'nanoid', active: true },
      { id: '2', key: 'customer_name', type: 'full_name', active: true },
      { id: '3', key: 'customer_email', type: 'email', active: true },
      { id: '4', key: 'product_name', type: 'product_title', active: true },
      { id: '5', key: 'sku', type: 'sku_code', active: true },
      { id: '6', key: 'amount_inr', type: 'amount_inr', active: true },
      { id: '7', key: 'payment_mode', type: 'payment_method', active: true },
      { id: '8', key: 'order_status', type: 'order_status', active: true },
      { id: '9', key: 'shipping_city', type: 'city', active: true },
      { id: '10', key: 'pincode', type: 'pincode', active: true },
      { id: '11', key: 'order_date', type: 'date_past', active: true }
    ]
  },
  {
    id: 'kyc_banking',
    name: 'Banking & Indian KYC Records',
    description: 'Fintech dummy KYC database with PAN cards, masked Aadhaar, IFSC codes, and UPI IDs.',
    icon: 'Database',
    sqlTable: 'kyc_records',
    columns: [
      { id: '1', key: 'account_id', type: 'uuid', active: true },
      { id: '2', key: 'account_holder', type: 'full_name', active: true },
      { id: '3', key: 'pan_number', type: 'pan_card', active: true },
      { id: '4', key: 'masked_aadhaar', type: 'aadhaar_masked', active: true },
      { id: '5', key: 'ifsc_code', type: 'ifsc_code', active: true },
      { id: '6', key: 'upi_vpa', type: 'upi_id', active: true },
      { id: '7', key: 'city', type: 'city', active: true },
      { id: '8', key: 'kyc_status', type: 'custom_options', active: true, options: { choices: 'VERIFIED, PENDING_REVIEW, REJECTED, EXPIRED' } },
      { id: '9', key: 'verified_at', type: 'iso_timestamp', active: true }
    ]
  },
  {
    id: 'api_telemetry',
    name: 'DevOps & API Telemetry Logs',
    description: 'High-throughput HTTP microservice logs with IP addresses, endpoints, latency ms, and HTTP codes.',
    icon: 'Terminal',
    sqlTable: 'access_logs',
    columns: [
      { id: '1', key: 'trace_id', type: 'nanoid', active: true },
      { id: '2', key: 'client_ip', type: 'ipv4', active: true },
      { id: '3', key: 'http_method', type: 'http_method', active: true },
      { id: '4', key: 'endpoint', type: 'url', active: true },
      { id: '5', key: 'status_code', type: 'http_status', active: true },
      { id: '6', key: 'latency_ms', type: 'latency_ms', active: true },
      { id: '7', key: 'timestamp', type: 'iso_timestamp', active: true }
    ]
  },
  {
    id: 'qa_bug_tracker',
    name: 'QA Test Run & Bug Reports',
    description: 'Automated test execution suites with test cases, execution timings, and pass/fail states.',
    icon: 'Database',
    sqlTable: 'test_executions',
    columns: [
      { id: '1', key: 'test_run_id', type: 'auto_id', active: true },
      { id: '2', key: 'test_case_name', type: 'custom_options', active: true, options: { choices: 'TC_AUTH_01_LOGIN, TC_CHECKOUT_03_UPI, TC_CART_05_DISCOUNT, TC_PROFILE_02_UPDATE, TC_EXPORT_08_CSV' } },
      { id: '3', key: 'tester_name', type: 'full_name', active: true },
      { id: '4', key: 'test_status', type: 'custom_options', active: true, options: { choices: 'PASSED, FAILED, BLOCKED, SKIPPED' } },
      { id: '5', key: 'execution_duration_ms', type: 'number_range', active: true, options: { min: 45, max: 4800 } },
      { id: '6', key: 'browser_env', type: 'custom_options', active: true, options: { choices: 'Chromium 124, WebKit Safari 17, Firefox 126, Edge 124' } },
      { id: '7', key: 'executed_at', type: 'iso_timestamp', active: true }
    ]
  }
];

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export default function TestDataGenerator() {
  // Config States
  const [activeTab, setActiveTab] = useState<'schema' | 'presets' | 'preview' | 'code' | 'ddl'>('schema');
  const [format, setFormat] = useState<'json' | 'ndjson' | 'csv' | 'sql' | 'typescript' | 'markdown' | 'xml' | 'yaml'>('json');
  const [rows, setRows] = useState<number>(50);
  const [sqlDialect, setSqlDialect] = useState<'postgres' | 'mysql' | 'sqlite' | 'mssql'>('postgres');
  const [sqlTableName, setSqlTableName] = useState<string>('users');
  const [sqlBatchMode, setSqlBatchMode] = useState<boolean>(true);
  const [csvDelimiter, setCsvDelimiter] = useState<',' | ';' | '\t' | '|'>(',');
  const [includeHeaders, setIncludeHeaders] = useState<boolean>(true);

  // Reproducibility Seed
  const [seed, setSeed] = useState<string>('toolique-seed-42');
  const [freezeSeed, setFreezeSeed] = useState<boolean>(false);

  // Active Columns
  const [columns, setColumns] = useState<ColumnConfig[]>(PRESET_SCHEMAS[0].columns);
  
  // Custom Column Adder State
  const [selectedFieldToAdd, setSelectedFieldToAdd] = useState<string>('full_name');
  const [customKeyName, setCustomKeyName] = useState<string>('');

  // Live Output & UI states
  const [output, setOutput] = useState<string>('');
  const [generatedRows, setGeneratedRows] = useState<any[]>([]);
  const [generationTimeMs, setGenerationTimeMs] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [previewPage, setPreviewPage] = useState<number>(1);
  const previewPageSize = 8;

  // -------------------------------------------------------------
  // GENERATOR FUNCTION
  // -------------------------------------------------------------
  const generateSingleRowValue = useCallback((col: ColumnConfig, rng: SeededRandom, index: number): any => {
    // Nullable injection if configured
    if (col.options?.nullPercent && rng.next() * 100 < col.options.nullPercent) {
      return null;
    }

    const isIndian = rng.boolean(0.65);
    const fName = isIndian ? rng.pick(FIRST_NAMES_IN) : rng.pick(FIRST_NAMES_GL);
    const lName = isIndian ? rng.pick(LAST_NAMES_IN) : rng.pick(LAST_NAMES_GL);

    switch (col.type) {
      case 'uuid':
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.floor(rng.next() * 16);
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });

      case 'auto_id':
        return index + 1;

      case 'nanoid': {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_';
        let res = 'cly';
        for (let i = 0; i < 18; i++) res += chars[Math.floor(rng.next() * chars.length)];
        return res;
      }

      case 'mongodb_id': {
        const hex = '0123456789abcdef';
        let res = '';
        for (let i = 0; i < 24; i++) res += hex[Math.floor(rng.next() * hex.length)];
        return res;
      }

      case 'full_name':
        return `${fName} ${lName}`;

      case 'first_name':
        return fName;

      case 'last_name':
        return lName;

      case 'username': {
        const handles = [
          `${fName.toLowerCase()}_${lName.toLowerCase()}`,
          `${fName.toLowerCase()}${rng.nextInt(10, 99)}`,
          `dev.${lName.toLowerCase()}${rng.nextInt(1, 999)}`,
          `${fName.toLowerCase()}.${lName.toLowerCase()}`
        ];
        return rng.pick(handles);
      }

      case 'gender':
        return rng.pick(['Male', 'Female', 'Non-Binary', 'Prefer not to say']);

      case 'avatar':
        return `https://api.dicebear.com/7.x/bottts/svg?seed=${fName}${index}`;

      case 'job_title':
        return rng.pick(JOB_TITLES);

      case 'department':
        return rng.pick(DEPARTMENTS);

      case 'age':
        return rng.nextInt(col.options?.min || 20, col.options?.max || 65);

      case 'email': {
        const domain = rng.boolean(0.5) ? rng.pick(DOMAINS_PERSONAL) : rng.pick(DOMAINS_CORP);
        return `${fName.toLowerCase()}.${lName.toLowerCase()}${rng.nextInt(1, 99)}@${domain}`;
      }

      case 'phone_india':
        return `+91 ${rng.pick(['98', '99', '97', '96', '91', '88', '70', '80'])}${rng.nextInt(10000000, 99999999)}`;

      case 'phone_intl':
        return `+1 (${rng.nextInt(200, 999)}) ${rng.nextInt(100, 999)}-${rng.nextInt(1000, 9999)}`;

      case 'city':
        return isIndian ? rng.pick(INDIAN_CITIES) : rng.pick(GLOBAL_CITIES);

      case 'state':
        return rng.pick(INDIAN_STATES);

      case 'country':
        return isIndian ? 'India' : rng.pick(GLOBAL_COUNTRIES);

      case 'pincode':
        return isIndian ? `${rng.nextInt(110001, 700099)}` : `${rng.nextInt(10001, 99950)}`;

      case 'street_address':
        return `${rng.nextInt(101, 999)}, ${rng.pick(['MG Road', 'Indiranagar 100ft Rd', 'FC Road', 'Park Street', 'Connaught Place', 'Silicon Valley Blvd', 'Market Street'])}`;

      case 'pan_card': {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let pan = '';
        for (let i = 0; i < 5; i++) pan += letters[Math.floor(rng.next() * letters.length)];
        pan += `${rng.nextInt(1000, 9999)}`;
        pan += letters[Math.floor(rng.next() * letters.length)];
        return pan;
      }

      case 'gstin': {
        const stateCode = rng.pick(['27', '29', '07', '36', '33', '19', '24']);
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let pan = '';
        for (let i = 0; i < 5; i++) pan += letters[Math.floor(rng.next() * letters.length)];
        pan += `${rng.nextInt(1000, 9999)}`;
        pan += letters[Math.floor(rng.next() * letters.length)];
        return `${stateCode}${pan}1Z${rng.nextInt(1, 9)}`;
      }

      case 'aadhaar_masked':
        return `XXXX-XXXX-${rng.nextInt(1000, 9999)}`;

      case 'ifsc_code':
        return rng.pick(INDIAN_BANKS_IFSC);

      case 'upi_id':
        return `${fName.toLowerCase()}.${lName.toLowerCase()}@${rng.pick(['okhdfcbank', 'oksbi', 'okicici', 'paytm', 'ybl'])}`;

      case 'amount_inr':
        return Number((rng.nextInt(199, 49999) + rng.next()).toFixed(2));

      case 'amount_usd':
        return Number((rng.nextInt(9, 999) + rng.next()).toFixed(2));

      case 'payment_method':
        return rng.pick(PAYMENT_METHODS);

      case 'order_status':
        return rng.pick(['COMPLETED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'REFUNDED']);

      case 'credit_card_mask':
        return `${rng.pick(['4532', '5425', '6071', '3782'])} **** **** ${rng.nextInt(1000, 9999)}`;

      case 'product_title':
        return rng.pick(PRODUCT_NAMES);

      case 'sku_code':
        return `SKU-${rng.pick(['TECH', 'HARD', 'DESK', 'AUDIO'])}-${rng.nextInt(1000, 9999)}`;

      case 'ipv4':
        return `${rng.nextInt(10, 192)}.${rng.nextInt(0, 255)}.${rng.nextInt(0, 255)}.${rng.nextInt(1, 254)}`;

      case 'mac_address': {
        const hex = '0123456789ABCDEF';
        return Array.from({ length: 6 }, () => hex[Math.floor(rng.next() * 16)] + hex[Math.floor(rng.next() * 16)]).join(':');
      }

      case 'domain':
        return rng.pick(DOMAINS_CORP);

      case 'url':
        return `https://${rng.pick(DOMAINS_CORP)}${rng.pick(API_ENDPOINTS)}`;

      case 'http_status':
        return rng.pick(HTTP_STATUS_CODES);

      case 'http_method':
        return rng.pick(HTTP_METHODS);

      case 'latency_ms':
        return rng.nextInt(15, 1250);

      case 'iso_timestamp': {
        const now = Date.now();
        const pastOffset = rng.nextInt(0, 90 * 24 * 3600 * 1000);
        return new Date(now - pastOffset).toISOString();
      }

      case 'unix_epoch':
        return Date.now() - rng.nextInt(0, 30 * 24 * 3600 * 1000);

      case 'date_past': {
        const date = new Date(Date.now() - rng.nextInt(1, 365) * 24 * 3600 * 1000);
        return date.toISOString().split('T')[0];
      }

      case 'boolean':
        return rng.boolean(col.options?.probTrue !== undefined ? col.options.probTrue : 0.5);

      case 'number_range':
        return rng.nextInt(col.options?.min !== undefined ? col.options.min : 1, col.options?.max !== undefined ? col.options.max : 1000);

      case 'custom_options': {
        const choices = (col.options?.choices || 'Standard, Premium, Enterprise')
          .split(',')
          .map(c => c.trim())
          .filter(Boolean);
        return choices.length > 0 ? rng.pick(choices) : 'Option';
      }

      default:
        return `Value ${index + 1}`;
    }
  }, []);

  // -------------------------------------------------------------
  // GENERATE FULL DATASET
  // -------------------------------------------------------------
  const handleGenerate = useCallback(() => {
    const startTime = performance.now();
    const activeCols = columns.filter(c => c.active);

    if (activeCols.length === 0) {
      setOutput('// Error: Please select or activate at least one column in the Schema Builder.');
      setGeneratedRows([]);
      return;
    }

    const activeSeed = freezeSeed ? seed : `${seed}-${Date.now()}`;
    const rng = new SeededRandom(activeSeed);

    const rawData = Array.from({ length: rows }, (_, idx) => {
      const rowObj: Record<string, any> = {};
      activeCols.forEach(col => {
        rowObj[col.key] = generateSingleRowValue(col, rng, idx);
      });
      return rowObj;
    });

    setGeneratedRows(rawData);

    let resultText = '';

    if (format === 'json') {
      resultText = JSON.stringify(rawData, null, 2);
    } 
    else if (format === 'ndjson') {
      resultText = rawData.map(r => JSON.stringify(r)).join('\n');
    }
    else if (format === 'csv') {
      const headers = activeCols.map(c => c.key).join(csvDelimiter);
      const csvRows = rawData.map(row => {
        return activeCols.map(col => {
          const val = row[col.key];
          if (val === null || val === undefined) return '';
          if (typeof val === 'string') {
            if (val.includes(csvDelimiter) || val.includes('"') || val.includes('\n')) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          }
          return val;
        }).join(csvDelimiter);
      }).join('\n');

      resultText = includeHeaders ? `${headers}\n${csvRows}` : csvRows;
    }
    else if (format === 'sql') {
      const tbl = sqlTableName.trim() || 'users';
      const colList = activeCols.map(c => `"${c.key}"`).join(', ');

      if (sqlBatchMode && rawData.length > 0) {
        const valueTuples = rawData.map(row => {
          const rowVals = activeCols.map(col => {
            const val = row[col.key];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number') return val;
            if (typeof val === 'boolean') return sqlDialect === 'postgres' ? (val ? 'TRUE' : 'FALSE') : (val ? '1' : '0');
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');
          return `  (${rowVals})`;
        }).join(',\n');

        resultText = `-- Generated by Toolique Test Data Generator (${rawData.length} rows)\nINSERT INTO "${tbl}" (${colList})\nVALUES\n${valueTuples};`;
      } else {
        const inserts = rawData.map(row => {
          const rowVals = activeCols.map(col => {
            const val = row[col.key];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'number') return val;
            if (typeof val === 'boolean') return sqlDialect === 'postgres' ? (val ? 'TRUE' : 'FALSE') : (val ? '1' : '0');
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');
          return `INSERT INTO "${tbl}" (${colList}) VALUES (${rowVals});`;
        }).join('\n');

        resultText = `-- Generated by Toolique Test Data Generator (${rawData.length} rows)\n${inserts}`;
      }
    }
    else if (format === 'typescript') {
      const interfaceName = (sqlTableName.charAt(0).toUpperCase() + sqlTableName.slice(1).replace(/s$/, '')) || 'MockRecord';
      const typeFields = activeCols.map(col => {
        const def = AVAILABLE_FIELDS.find(f => f.type === col.type);
        const ts = def?.tsType || 'any';
        return `  ${col.key}: ${ts};`;
      }).join('\n');

      resultText = `// TypeScript Interface & Mock Array\nexport interface ${interfaceName} {\n${typeFields}\n}\n\nexport const mock${interfaceName}List: ${interfaceName}[] = ${JSON.stringify(rawData, null, 2)};`;
    }
    else if (format === 'markdown') {
      const headerRow = `| ${activeCols.map(c => c.key).join(' | ')} |`;
      const separatorRow = `| ${activeCols.map(() => '---').join(' | ')} |`;
      const dataRows = rawData.slice(0, Math.min(rows, 100)).map(row => {
        return `| ${activeCols.map(col => String(row[col.key] ?? '')).join(' | ')} |`;
      }).join('\n');

      resultText = `${headerRow}\n${separatorRow}\n${dataRows}${rows > 100 ? `\n\n*(Truncated in Markdown preview: Showing first 100 of ${rows} rows)*` : ''}`;
    }
    else if (format === 'xml') {
      const recordTag = sqlTableName.replace(/s$/, '') || 'record';
      const recordsXml = rawData.map(row => {
        const fields = activeCols.map(col => `    <${col.key}>${String(row[col.key] ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${col.key}>`).join('\n');
        return `  <${recordTag}>\n${fields}\n  </${recordTag}>`;
      }).join('\n');
      resultText = `<?xml version="1.0" encoding="UTF-8"?>\n<dataset total="${rawData.length}">\n${recordsXml}\n</dataset>`;
    }
    else if (format === 'yaml') {
      const yamlRecords = rawData.map(row => {
        const fields = activeCols.map(col => `  - ${col.key}: ${typeof row[col.key] === 'string' ? `"${row[col.key]}"` : row[col.key]}`).join('\n  ');
        return fields;
      }).join('\n\n');
      resultText = `# Generated by Toolique Test Data Generator\nrecords:\n${yamlRecords}`;
    }

    const endTime = performance.now();
    setGenerationTimeMs(Math.round(endTime - startTime));
    setOutput(resultText);
  }, [columns, rows, format, seed, freezeSeed, sqlTableName, sqlBatchMode, sqlDialect, csvDelimiter, includeHeaders, generateSingleRowValue]);

  useMemo(() => {
    if (!output) {
      handleGenerate();
    }
  }, []);

  // -------------------------------------------------------------
  // COLUMN MANAGEMENT HANDLERS
  // -------------------------------------------------------------
  const toggleColumnActive = (id: string) => {
    setColumns(cols => cols.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const removeColumn = (id: string) => {
    setColumns(cols => cols.filter(c => c.id !== id));
  };

  const updateColumnKey = (id: string, newKey: string) => {
    setColumns(cols => cols.map(c => c.id === id ? { ...c, key: newKey.replace(/\s+/g, '_') } : c));
  };

  const updateColumnType = (id: string, newType: string) => {
    const fieldDef = AVAILABLE_FIELDS.find(f => f.type === newType);
    setColumns(cols => cols.map(c => c.id === id ? { 
      ...c, 
      type: newType, 
      key: c.key || fieldDef?.defaultLabel || 'field' 
    } : c));
  };

  const updateColumnOptions = (id: string, newOpts: Partial<ColumnConfig['options']>) => {
    setColumns(cols => cols.map(c => c.id === id ? { ...c, options: { ...c.options, ...newOpts } } : c));
  };

  const addNewColumn = () => {
    const fieldDef = AVAILABLE_FIELDS.find(f => f.type === selectedFieldToAdd);
    const key = customKeyName.trim() || fieldDef?.defaultLabel || `field_${columns.length + 1}`;
    
    const newCol: ColumnConfig = {
      id: String(Date.now() + Math.random()),
      key: key.replace(/\s+/g, '_'),
      type: selectedFieldToAdd,
      active: true,
      options: selectedFieldToAdd === 'custom_options' ? { choices: 'Option A, Option B, Option C' } : {}
    };

    setColumns([...columns, newCol]);
    setCustomKeyName('');
  };

  const loadPreset = (preset: SchemaPreset) => {
    setColumns(preset.columns);
    setSqlTableName(preset.sqlTable);
    setActiveTab('schema');
  };

  // -------------------------------------------------------------
  // COPY & DOWNLOAD HANDLERS
  // -------------------------------------------------------------
  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const extMap: Record<string, string> = {
      json: 'json',
      ndjson: 'ndjson',
      csv: 'csv',
      sql: 'sql',
      typescript: 'ts',
      markdown: 'md',
      xml: 'xml',
      yaml: 'yaml'
    };

    const mimeMap: Record<string, string> = {
      json: 'application/json',
      ndjson: 'application/x-ndjson',
      csv: 'text/csv',
      sql: 'application/sql',
      typescript: 'text/plain',
      markdown: 'text/markdown',
      xml: 'application/xml',
      yaml: 'text/yaml'
    };

    const ext = extMap[format] || 'txt';
    const mime = mimeMap[format] || 'text/plain';

    const blob = new Blob([output], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sqlTableName || 'test_data'}_${rows}_records.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  // -------------------------------------------------------------
  // SQL DDL GENERATOR
  // -------------------------------------------------------------
  const sqlDdlStatement = useMemo(() => {
    const tbl = sqlTableName.trim() || 'users';
    const activeCols = columns.filter(c => c.active);

    const colDefinitions = activeCols.map(col => {
      const def = AVAILABLE_FIELDS.find(f => f.type === col.type);
      const sqlType = sqlDialect === 'postgres' 
        ? (def?.sqlTypePostgres || 'VARCHAR(255)') 
        : (def?.sqlTypeMySQL || 'VARCHAR(255)');
      return `  "${col.key}" ${sqlType}`;
    }).join(',\n');

    return `-- Table DDL for ${sqlDialect.toUpperCase()}\nCREATE TABLE IF NOT EXISTS "${tbl}" (\n${colDefinitions}\n);`;
  }, [columns, sqlTableName, sqlDialect]);

  // Filtered Preview Records
  const activeCols = columns.filter(c => c.active);
  const filteredPreviewRows = useMemo(() => {
    if (!searchTerm.trim()) return generatedRows;
    const query = searchTerm.toLowerCase();
    return generatedRows.filter(row => 
      Object.values(row).some(v => String(v).toLowerCase().includes(query))
    );
  }, [generatedRows, searchTerm]);

  const totalPreviewPages = Math.ceil(filteredPreviewRows.length / previewPageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (previewPage - 1) * previewPageSize;
    return filteredPreviewRows.slice(start, start + previewPageSize);
  }, [filteredPreviewRows, previewPage]);

  // Output Stats
  const outputByteSize = useMemo(() => {
    return new Blob([output]).size;
  }, [output]);

  const formattedByteSize = useMemo(() => {
    if (outputByteSize < 1024) return `${outputByteSize} B`;
    if (outputByteSize < 1024 * 1024) return `${(outputByteSize / 1024).toFixed(1)} KB`;
    return `${(outputByteSize / (1024 * 1024)).toFixed(2)} MB`;
  }, [outputByteSize]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Mode Tabs */}
      <div className="saas-card p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-pastel-indigo/25 text-indigo-700 dark:text-indigo-400 border border-pastel-indigo/40">
                <Database className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white">
                Mock & Test Data Generator Studio
              </h2>
              <span className="saas-badge bg-pastel-emerald/30 text-emerald-800 dark:text-emerald-300 border-pastel-emerald/40 text-[10px] font-black uppercase">
                45+ Field Types
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              Create deterministic, high-entropy test datasets with Indian + Global localized fields, custom schemas, and instant multi-dialect exports.
            </p>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              className="saas-button-primary py-2 px-4 shadow-sm flex items-center gap-2 text-xs cursor-pointer font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate ({rows} Rows)</span>
            </button>
          </div>
        </div>

        {/* Studio Tabs Navigation */}
        <div className="flex items-center gap-1.5 pt-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'schema'
                ? 'bg-pastel-indigo/30 text-indigo-800 dark:text-indigo-300 border border-pastel-indigo/50 font-extrabold shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span>Schema Builder ({columns.filter(c => c.active).length} Cols)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'presets'
                ? 'bg-pastel-indigo/30 text-indigo-800 dark:text-indigo-300 border border-pastel-indigo/50 font-extrabold shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Quick Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'preview'
                ? 'bg-pastel-indigo/30 text-indigo-800 dark:text-indigo-300 border border-pastel-indigo/50 font-extrabold shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Live Data Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'code'
                ? 'bg-pastel-indigo/30 text-indigo-800 dark:text-indigo-300 border border-pastel-indigo/50 font-extrabold shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Generated Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ddl')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'ddl'
                ? 'bg-pastel-indigo/30 text-indigo-800 dark:text-indigo-300 border border-pastel-indigo/50 font-extrabold shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span>SQL DDL Schema</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Generation Controls & Format Settings */}
        <div className="lg:col-span-4 space-y-5">
          <div className="saas-card p-5 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Dataset Controls</span>
              </h3>
              <span className="text-[10px] font-bold text-zinc-500">
                {generationTimeMs > 0 ? `${generationTimeMs}ms` : ''}
              </span>
            </div>

            {/* Target Output Format */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">
                Export Target Format
              </label>
              <select
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value as any);
                  setTimeout(handleGenerate, 50);
                }}
                className="saas-select text-xs font-semibold"
              >
                <option value="json">JSON Array ([ &#123; ... &#125; ])</option>
                <option value="ndjson">NDJSON (Newline-Delimited JSON)</option>
                <option value="csv">CSV Spreadsheet</option>
                <option value="sql">SQL INSERT Statements</option>
                <option value="typescript">TypeScript Interface + Data</option>
                <option value="markdown">Markdown Table (GitHub PR)</option>
                <option value="yaml">YAML Document</option>
                <option value="xml">XML Dataset</option>
              </select>
            </div>

            {/* Row Count & Batch Size */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">
                  Record Count
                </label>
                <select
                  value={rows}
                  onChange={(e) => {
                    setRows(Number(e.target.value));
                    setTimeout(handleGenerate, 50);
                  }}
                  className="saas-select text-xs font-semibold"
                >
                  <option value={10}>10 Records</option>
                  <option value={25}>25 Records</option>
                  <option value={50}>50 Records</option>
                  <option value={100}>100 Records</option>
                  <option value={250}>250 Records</option>
                  <option value={500}>500 Records</option>
                  <option value={1000}>1,000 Records</option>
                  <option value={2500}>2,500 Records</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400">
                  Table / Object Key
                </label>
                <input
                  type="text"
                  value={sqlTableName}
                  onChange={(e) => setSqlTableName(e.target.value)}
                  placeholder="users"
                  className="saas-input text-xs font-semibold"
                />
              </div>
            </div>

            {/* Format-Specific Configuration */}
            {format === 'sql' && (
              <div className="p-3 rounded-xl border border-indigo-200/50 dark:border-zinc-800 bg-pastel-indigo/10 dark:bg-zinc-950/40 space-y-3">
                <div className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400">
                  SQL Dialect Options
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={sqlDialect}
                    onChange={(e) => setSqlDialect(e.target.value as any)}
                    className="saas-select text-xs"
                  >
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL / MariaDB</option>
                    <option value="sqlite">SQLite</option>
                    <option value="mssql">MS SQL Server</option>
                  </select>

                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sqlBatchMode}
                      onChange={(e) => setSqlBatchMode(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                    />
                    <span>Multi-row Batch</span>
                  </label>
                </div>
              </div>
            )}

            {format === 'csv' && (
              <div className="p-3 rounded-xl border border-indigo-200/50 dark:border-zinc-800 bg-pastel-indigo/10 dark:bg-zinc-950/40 space-y-2.5">
                <div className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400">
                  CSV Formatting
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={csvDelimiter}
                    onChange={(e) => setCsvDelimiter(e.target.value as any)}
                    className="saas-select text-xs"
                  >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="	">Tab (\t)</option>
                    <option value="|">Pipe (|)</option>
                  </select>

                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeHeaders}
                      onChange={(e) => setIncludeHeaders(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                    />
                    <span>Header Row</span>
                  </label>
                </div>
              </div>
            )}

            {/* Deterministic Seed Engine */}
            <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Hash className="w-3 h-3 text-indigo-500" />
                  <span>Deterministic Seed</span>
                </label>
                <button
                  type="button"
                  onClick={() => setFreezeSeed(!freezeSeed)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                    freezeSeed 
                      ? 'bg-pastel-amber/30 text-amber-800 dark:text-amber-300 border-pastel-amber/50' 
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'
                  }`}
                  title={freezeSeed ? 'Seed is locked for deterministic reproducibility' : 'Seed changes randomly per generation'}
                >
                  {freezeSeed ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                  <span>{freezeSeed ? 'Seed Locked' : 'Random Seed'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="custom-seed-key"
                  className="saas-input text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setSeed(`seed-${Math.floor(Math.random() * 100000)}`)}
                  className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
                  title="Generate Random Seed"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Primary Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              className="saas-button-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate Dataset ({rows} Records)</span>
            </button>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/40">
                <div className="text-[10px] text-zinc-450 font-bold uppercase">Rows</div>
                <div className="text-xs font-black text-zinc-900 dark:text-white">{generatedRows.length}</div>
              </div>
              <div className="p-2 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/40">
                <div className="text-[10px] text-zinc-450 font-bold uppercase">Payload</div>
                <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">{formattedByteSize}</div>
              </div>
              <div className="p-2 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/40">
                <div className="text-[10px] text-zinc-450 font-bold uppercase">Latency</div>
                <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">{generationTimeMs}ms</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Tab Viewports */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* TAB 1: SCHEMA BUILDER */}
          {activeTab === 'schema' && (
            <div className="saas-card p-5 space-y-5 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                    <span>Schema Columns Configuration</span>
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Toggle, rename, customize types, or add new data fields to your schema.
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {columns.filter(c => c.active).length} of {columns.length} Active
                </span>
              </div>

              {/* Column List Editor */}
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {columns.map((col, idx) => {
                  const fieldDef = AVAILABLE_FIELDS.find(f => f.type === col.type);
                  return (
                    <div
                      key={col.id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        col.active
                          ? 'border-indigo-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-2xs'
                          : 'border-zinc-200/40 dark:border-zinc-855 bg-zinc-50/40 dark:bg-zinc-950/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={col.active}
                          onChange={() => toggleColumnActive(col.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer shrink-0"
                          title="Enable/Disable field"
                        />
                        <span className="text-[11px] font-mono text-zinc-400 font-bold shrink-0 w-5">
                          #{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <input
                            type="text"
                            value={col.key}
                            onChange={(e) => updateColumnKey(col.id, e.target.value)}
                            placeholder="field_key"
                            className="text-xs font-bold text-zinc-900 dark:text-white bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 outline-none w-36 sm:w-44 py-0.5"
                          />
                          <div className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium truncate mt-0.5">
                            {fieldDef?.description || 'Custom generator field'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Type Selector */}
                        <select
                          value={col.type}
                          onChange={(e) => updateColumnType(col.id, e.target.value)}
                          className="saas-select py-1 px-2.5 text-xs font-semibold max-w-[170px]"
                        >
                          <optgroup label="Identity & Keys">
                            <option value="uuid">UUID v4</option>
                            <option value="auto_id">Auto-Increment ID</option>
                            <option value="nanoid">NanoID / CUID</option>
                            <option value="mongodb_id">MongoDB ObjectId</option>
                          </optgroup>
                          <optgroup label="Personal">
                            <option value="full_name">Full Name</option>
                            <option value="first_name">First Name</option>
                            <option value="last_name">Last Name</option>
                            <option value="username">Username</option>
                            <option value="gender">Gender</option>
                            <option value="job_title">Job Title</option>
                            <option value="department">Department</option>
                            <option value="age">Age</option>
                            <option value="avatar">Avatar URL</option>
                          </optgroup>
                          <optgroup label="Contact">
                            <option value="email">Email</option>
                            <option value="phone_india">Indian Mobile (+91)</option>
                            <option value="phone_intl">International Phone</option>
                            <option value="city">City</option>
                            <option value="state">State</option>
                            <option value="country">Country</option>
                            <option value="pincode">Pincode / ZIP</option>
                            <option value="street_address">Street Address</option>
                          </optgroup>
                          <optgroup label="India KYC & Tax">
                            <option value="pan_card">PAN Card</option>
                            <option value="gstin">GSTIN Number</option>
                            <option value="aadhaar_masked">Masked Aadhaar</option>
                            <option value="ifsc_code">Bank IFSC Code</option>
                            <option value="upi_id">UPI ID / VPA</option>
                          </optgroup>
                          <optgroup label="Commerce & Finance">
                            <option value="amount_inr">Amount (₹ INR)</option>
                            <option value="amount_usd">Amount ($ USD)</option>
                            <option value="payment_method">Payment Method</option>
                            <option value="order_status">Order Status</option>
                            <option value="credit_card_mask">Masked Card</option>
                            <option value="product_title">Product Name</option>
                            <option value="sku_code">SKU Code</option>
                          </optgroup>
                          <optgroup label="Tech & DevOps">
                            <option value="ipv4">IPv4 Address</option>
                            <option value="mac_address">MAC Address</option>
                            <option value="domain">Domain Name</option>
                            <option value="url">API URL</option>
                            <option value="http_status">HTTP Status</option>
                            <option value="http_method">HTTP Method</option>
                            <option value="latency_ms">Latency ms</option>
                          </optgroup>
                          <optgroup label="DateTime">
                            <option value="iso_timestamp">ISO Timestamp</option>
                            <option value="unix_epoch">UNIX Epoch</option>
                            <option value="date_past">Past Date</option>
                          </optgroup>
                          <optgroup label="Custom Rules">
                            <option value="boolean">Boolean</option>
                            <option value="number_range">Number Range</option>
                            <option value="custom_options">Custom Enum List</option>
                          </optgroup>
                        </select>

                        {/* Extra Options for Enum or Numbers */}
                        {col.type === 'custom_options' && (
                          <input
                            type="text"
                            value={col.options?.choices || ''}
                            onChange={(e) => updateColumnOptions(col.id, { choices: e.target.value })}
                            placeholder="Choice 1, Choice 2, Choice 3"
                            className="saas-input text-[11px] py-1 px-2 w-36 font-semibold"
                            title="Comma-separated choices"
                          />
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeColumn(col.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                          title="Delete column"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Column Bar */}
              <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-4">
                <div className="p-3.5 rounded-2xl border border-dashed border-indigo-300 dark:border-zinc-700 bg-pastel-indigo/5 dark:bg-zinc-950/30 flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-grow w-full sm:w-auto">
                    <input
                      type="text"
                      value={customKeyName}
                      onChange={(e) => setCustomKeyName(e.target.value)}
                      placeholder="New column key (e.g. loyalty_points)"
                      className="saas-input text-xs font-semibold w-full"
                    />
                  </div>

                  <div className="w-full sm:w-auto">
                    <select
                      value={selectedFieldToAdd}
                      onChange={(e) => setSelectedFieldToAdd(e.target.value)}
                      className="saas-select text-xs font-semibold w-full"
                    >
                      {AVAILABLE_FIELDS.map(f => (
                        <option key={f.type} value={f.type}>
                          {f.name} ({f.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={addNewColumn}
                    className="saas-button-secondary py-2 px-4 text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Add Column</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUICK PRESETS */}
          {activeTab === 'presets' && (
            <div className="saas-card p-5 space-y-4 text-left">
              <div className="border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>One-Click Industry Schema Templates</span>
                </h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Select a tailored schema blueprint designed for common testing workflows.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {PRESET_SCHEMAS.map(preset => (
                  <div
                    key={preset.id}
                    className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {preset.name}
                        </span>
                        <span className="saas-badge bg-pastel-indigo/25 text-indigo-800 dark:text-indigo-300 border-pastel-indigo/40 text-[9px] font-black">
                          {preset.columns.length} Fields
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                      <span className="text-[10px] font-mono font-bold text-zinc-400">
                        table: {preset.sqlTable}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          loadPreset(preset);
                          setTimeout(handleGenerate, 50);
                        }}
                        className="saas-button-primary py-1 px-3 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Load Schema</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE DATA GRID PREVIEW */}
          {activeTab === 'preview' && (
            <div className="saas-card p-5 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <TableIcon className="w-4 h-4 text-indigo-500" />
                    <span>Live Interactive Data Grid</span>
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Review generated mock records with live search and pagination.
                  </p>
                </div>

                {/* Search in generated records */}
                <div className="relative w-full sm:w-64 flex items-center">
                  <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPreviewPage(1);
                    }}
                    placeholder="Search records..."
                    className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/60 text-xs font-semibold text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300/25 focus:outline-none transition shadow-2xs"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setPreviewPage(1);
                      }}
                      className="absolute right-2.5 p-0.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 max-h-[380px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/90 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-wider sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-2.5 pl-3">#</th>
                      {activeCols.map(col => (
                        <th key={col.id} className="p-2.5 whitespace-nowrap">
                          {col.key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 font-medium">
                    {paginatedRows.length > 0 ? (
                      paginatedRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-pastel-indigo/5 dark:hover:bg-zinc-900/40 transition">
                          <td className="p-2.5 pl-3 text-zinc-400 font-mono text-[10px]">
                            {(previewPage - 1) * previewPageSize + rIdx + 1}
                          </td>
                          {activeCols.map(col => {
                            const val = row[col.key];
                            return (
                              <td key={col.id} className="p-2.5 text-zinc-800 dark:text-zinc-200 whitespace-nowrap max-w-xs truncate text-xs">
                                {typeof val === 'boolean' ? (
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${val ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'}`}>
                                    {String(val)}
                                  </span>
                                ) : val === null || val === undefined ? (
                                  <span className="text-zinc-400 italic text-[10px]">null</span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={activeCols.length + 1} className="text-center py-8 text-zinc-400 text-xs">
                          No matching records found. Click "Regenerate Dataset" to populate rows.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                <span className="text-[11px] text-zinc-500 font-semibold">
                  Showing {paginatedRows.length} of {filteredPreviewRows.length} records
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={previewPage <= 1}
                    onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                    className="saas-button-secondary py-1 px-2.5 text-xs cursor-pointer disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-mono font-bold px-2 text-zinc-700 dark:text-zinc-300">
                    {previewPage} / {totalPreviewPages}
                  </span>
                  <button
                    type="button"
                    disabled={previewPage >= totalPreviewPages}
                    onClick={() => setPreviewPage(p => Math.min(totalPreviewPages, p + 1))}
                    className="saas-button-secondary py-1 px-2.5 text-xs cursor-pointer disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GENERATED CODE / OUTPUT */}
          {activeTab === 'code' && (
            <div className="saas-card p-5 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-indigo-500" />
                    <span>Formatted Export Output ({format.toUpperCase()})</span>
                  </h3>
                  <div className="text-[11px] text-zinc-500 font-semibold">
                    {rows} records generated • {formattedByteSize} payload
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!output}
                    className="saas-button-secondary py-1.5 px-3.5 text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 font-bold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5 text-zinc-500" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!output}
                    className="saas-button-primary py-1.5 px-3.5 text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 font-bold"
                  >
                    {downloadSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{downloadSuccess ? 'Downloaded!' : 'Download File'}</span>
                  </button>
                </div>
              </div>

              {output ? (
                <textarea
                  readOnly
                  value={output}
                  className="w-full h-[380px] font-mono text-[11px] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-emerald-400 focus:outline-none resize-none leading-relaxed selection:bg-indigo-600 selection:text-white"
                />
              ) : (
                <div className="w-full h-[380px] rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/10 dark:bg-zinc-950/20 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                  <FileSpreadsheet className="w-10 h-10 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-semibold">Click "Generate Dataset" to output records</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SQL DDL SCHEMA */}
          {activeTab === 'ddl' && (
            <div className="saas-card p-5 space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-3">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-500" />
                    <span>Auto-Generated SQL Table DDL</span>
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Inferred data types matching your schema configuration.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sqlDialect}
                    onChange={(e) => setSqlDialect(e.target.value as any)}
                    className="saas-select py-1 px-2.5 text-xs font-semibold"
                  >
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="sqlite">SQLite</option>
                    <option value="mssql">MS SQL</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sqlDdlStatement);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="saas-button-secondary py-1 px-3 text-xs inline-flex items-center gap-1 cursor-pointer font-bold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy DDL'}</span>
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={sqlDdlStatement}
                className="w-full h-[320px] font-mono text-[11px] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-indigo-300 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          {/* Quick Workflow Navigation Banner */}
          <div className="p-4 rounded-2xl border border-indigo-200/50 dark:border-zinc-800 bg-gradient-to-r from-pastel-indigo/15 via-pastel-purple/10 to-pastel-rose/15 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Connected Toolique Workflows</span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                Pass your generated test data directly into API Tester, JSON Formatter, or SQL Formatter.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/developer/json-formatter"
                className="saas-button-secondary py-1.5 px-3 text-[11px] font-bold"
              >
                JSON Formatter
              </Link>
              <Link
                to="/developer/api-tester"
                className="saas-button-secondary py-1.5 px-3 text-[11px] font-bold"
              >
                API Tester
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
