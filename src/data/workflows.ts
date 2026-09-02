export interface WorkflowStep {
  title: string;
  description: string;
  slug: string;
  id: string; // matches tool.id
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export const workflows: Workflow[] = [
  {
    id: 'plot-to-material',
    name: 'Plot Development & Material Estimator',
    description: 'Track your project from buying a plot of land to buying building materials.',
    steps: [
      { title: 'Plot Area', description: 'Estimate your plot dimensions and total land area.', slug: 'plot-area-calculator', id: 'PlotAreaCalculator' },
      { title: 'FSI & Clearance', description: 'Check municipal clearances and permissible built-up areas.', slug: 'far-fsi-calculator', id: 'FARFSICalculator' },
      { title: 'Built-up Area', description: 'Plan individual floor sizes and ground coverage.', slug: 'built-up-area-calculator', id: 'BuiltUpAreaCalculator' },
      { title: 'Carpet Area', description: 'Deduct wall thickness to find usable RERA carpet space.', slug: 'carpet-area-calculator', id: 'CarpetAreaCalculator' },
      { title: 'Floor Efficiency', description: 'Analyze your carpet area ratio to total built-up footprint.', slug: 'floor-efficiency-calculator', id: 'FloorEfficiencyCalculator' },
      { title: 'Construction Cost', description: 'Compute overall construction budget and labor costs.', slug: 'construction-cost-calculator', id: 'ConstructionCostCalculator' },
      { title: 'BOQ Estimation', description: 'Generate a Bill of Quantities (BOQ) for the project.', slug: 'advanced-boq-calculator-india', id: 'AdvancedBOQCalculatorIndia' },
      { title: 'Material Quantities', description: 'Estimate specific cement, sand, brick, and steel volumes.', slug: 'material-quantity-estimator', id: 'MaterialQuantityEstimator' }
    ]
  },
  {
    id: 'room-to-finish',
    name: 'Room Finishing & Renovation Planner',
    description: 'Calculate finishing costs, painting, tiling, and woodwork for your rooms.',
    steps: [
      { title: 'Room Dimensions', description: 'Measure total floor and wall areas of your rooms.', slug: 'room-area-calculator', id: 'RoomAreaCalculator' },
      { title: 'Flooring & Tiles', description: 'Estimate tiles, grout, and installation costs.', slug: 'flooring-cost-calculator', id: 'FlooringCostCalculator' },
      { title: 'Wall Paint', description: 'Calculate required paint volume and labor coats.', slug: 'paint-calculator', id: 'PaintCalculator' },
      { title: 'False Ceiling', description: 'Estimate materials and ceiling framing costs.', slug: 'false-ceiling-calculator', id: 'FalseCeilingCalculator' },
      { title: 'Door/Window Sizing', description: 'Plan clearance and custom sizing configurations.', slug: 'door-size-calculator', id: 'DoorSizeCalculator' },
      { title: 'Wardrobe Fitting', description: 'Estimate woodwork cost and shelf storage areas.', slug: 'wardrobe-cost-calculator', id: 'WardrobeCostCalculator' },
      { title: 'Modular Kitchen', description: 'Model U/L-shaped cabinetry and countertop budgets.', slug: 'modular-kitchen-cost-calculator', id: 'ModularKitchenCostCalculator' }
    ]
  },
  {
    id: 'manual-test-design',
    name: 'Manual Test Case & Scenario Design',
    description: 'Plan test scenarios, compute parameters class partitions, generate test datasets, and draft bug reports.',
    steps: [
      { title: 'Test Scenario Creator', description: 'Curate high-level scenarios from raw requirements.', slug: 'test-scenario-generator', id: 'TestScenarioGenerator' },
      { title: 'Test Case Writer', description: 'Draft structured test cases and scenarios.', slug: 'test-case-generator', id: 'TestCaseGenerator' },
      { title: 'BVA Calculator', description: 'Define range limits and boundary test parameters.', slug: 'boundary-value-analysis', id: 'BoundaryValueAnalysis' },
      { title: 'Partitioning Planner', description: 'Group parameters into equivalence classes.', slug: 'equivalence-partitioning', id: 'EquivalencePartitioning' },
      { title: 'Test Data Creator', description: 'Generate dummy datasets in JSON, CSV, or SQL format.', slug: 'test-data-generator', id: 'TestDataGenerator' },
      { title: 'Bug Report Draft', description: 'Write professional bug tickets and markdown templates.', slug: 'bug-report-generator', id: 'BugReportGenerator' }
    ]
  },
  {
    id: 'api-json-validation',
    name: 'API Testing & Response Validation',
    description: 'Test API endpoints, format response outputs, and validate schema tokens.',
    steps: [
      { title: 'REST API Client', description: 'Send and test HTTP endpoint requests.', slug: 'api-tester', id: 'ApiTester' },
      { title: 'JSON Formatter', description: 'Beautify and parse raw JSON API responses.', slug: 'json-formatter', id: 'JSONFormatter' },
      { title: 'JSON Validator', description: 'Check syntax and validate JSON schemas.', slug: 'json-validator', id: 'JSONValidator' },
      { title: 'API Response Diff', description: 'Compare response differences between JSON outputs.', slug: 'api-response-comparator', id: 'APIResponseComparator' },
      { title: 'JWT Decoder', description: 'Inspect and decode authorization tokens.', slug: 'jwt-decoder', id: 'JWTDecoder' }
    ]
  },
  {
    id: 'web-automation-locators',
    name: 'Web Test Automation & Locators',
    description: 'Evaluate DOM element locators and build test expressions.',
    steps: [
      { title: 'XPath Tester', description: 'Validate XPath and CSS selectors on HTML contexts.', slug: 'xpath-tester', id: 'XPathSelectorTester' },
      { title: 'Regex Tester', description: 'Test and check validation pattern expressions.', slug: 'regex-tester', id: 'RegexTester' }
    ]
  },
  {
    id: 'calculus-analysis',
    name: 'Calculus & Function Analysis Journey',
    description: 'Solve limits, compute symbolic derivatives, find antiderivatives, and model ODE differential equations.',
    steps: [
      { title: 'Limit Evaluation', description: 'Analyze function limits and continuity bounds.', slug: 'limit-calculator', id: 'LimitCalculator' },
      { title: 'Derivative & Tangent', description: 'Find symbolic derivatives, tangent slopes, and concavity.', slug: 'derivative-calculator', id: 'DerivativeCalculator' },
      { title: 'Integral & Area', description: 'Compute definite/indefinite integrals and area under curve.', slug: 'integral-calculator', id: 'IntegralCalculator' },
      { title: 'Differential Equations', description: 'Solve initial value ODEs and rate systems.', slug: 'differential-equation-solver', id: 'DifferentialEquationSolver' }
    ]
  },
  {
    id: 'salary-tax-planning',
    name: 'Salary, Tax & Deductions Planning',
    description: 'Calculate in-hand salary, optimize HRA exemptions, verify TDS rates, and compare Old vs. New Tax Regimes.',
    steps: [
      { title: 'Take-Home Pay', description: 'Compute net monthly in-hand pay from annual CTC.', slug: 'in-hand-salary-calculator', id: 'InHandSalaryCalculator' },
      { title: 'HRA Exemption', description: 'Maximize Section 10(13A) house rent allowance tax relief.', slug: 'hra-calculator', id: 'HRACalculator' },
      { title: 'TDS Rates', description: 'Verify withholding tax deductions across Indian sections.', slug: 'tds-calculator', id: 'TDSCalculator' },
      { title: 'Income Tax Regime', description: 'Compare Old vs. New tax slabs with standard deduction.', slug: 'income-tax-calculator', id: 'IncomeTaxCalculator' }
    ]
  },
  {
    id: 'wealth-investment-compounding',
    name: 'Wealth Building & Investment Compounding',
    description: 'Plan monthly mutual fund SIPs, evaluate CAGR returns, model compound interest, and lock in bank fixed/recurring deposits.',
    steps: [
      { title: 'SIP Growth', description: 'Forecast mutual fund wealth creation and maturity corpus.', slug: 'sip-calculator', id: 'SIPCalculator' },
      { title: 'CAGR Returns', description: 'Calculate annualized compound growth on portfolios.', slug: 'cagr-calculator', id: 'CAGRCalculator' },
      { title: 'Compound Interest', description: 'Model multi-frequency exponential interest compounding.', slug: 'compound-interest-calculator', id: 'CompoundInterestCalculator' },
      { title: 'Fixed Deposit (FD)', description: 'Compute bank fixed deposit interest and senior citizen perks.', slug: 'fd-calculator', id: 'FDCalculator' },
      { title: 'Recurring Deposit (RD)', description: 'Calculate disciplined monthly deposit maturity amounts.', slug: 'rd-calculator', id: 'RDCalculator' }
    ]
  },
  {
    id: 'retirement-pension-planning',
    name: 'Retirement & Pension Security',
    description: 'Build an EEE tax-free PPF corpus, forecast NPS pension annuities, calculate statutory gratuity, and manage loan debt.',
    steps: [
      { title: 'PPF Wealth', description: 'Calculate 15-year tax-free guaranteed returns under 80C.', slug: 'ppf-calculator', id: 'PPFCalculator' },
      { title: 'NPS Pension', description: 'Estimate retirement corpus and monthly annuity payout.', slug: 'nps-calculator', id: 'NPSCalculator' },
      { title: 'Gratuity Payout', description: 'Calculate statutory end-of-service gratuity entitlement.', slug: 'gratuity-calculator', id: 'GratuityCalculator' },
      { title: 'Loan EMI Payoff', description: 'Model loan amortizations to achieve debt-free retirement.', slug: 'emi-calculator', id: 'EMICalculator' }
    ]
  },
  {
    id: 'api-payload-inspection',
    name: 'API Development & Payload Inspection',
    description: 'Send HTTP requests, format JSON responses, compare API schemas, decode JWT auth tokens, and encode binary headers.',
    steps: [
      { title: 'REST API Tester', description: 'Send GET, POST, PUT, DELETE requests with custom headers.', slug: 'api-tester', id: 'ApiTester' },
      { title: 'JSON Formatter', description: 'Prettify, validate, and repair structured JSON responses.', slug: 'json-formatter', id: 'JSONFormatter' },
      { title: 'JSON Compare', description: 'Find semantic differences between expected and actual payloads.', slug: 'json-compare', id: 'JSONCompare' },
      { title: 'JWT Decoder', description: 'Inspect token headers, claims, and signature validity.', slug: 'jwt-decoder', id: 'JWTDecoder' },
      { title: 'Base64 Encoder', description: 'Encode and decode authorization tokens and binary strings.', slug: 'base64-encoder-decoder', id: 'Base64Tool' }
    ]
  },
  {
    id: 'sql-database-optimization',
    name: 'SQL & Database Engineering',
    description: 'Format complex queries, minify SQL for migration scripts, generate primary key UUIDs, hash passwords, and convert Unix epoch timestamps.',
    steps: [
      { title: 'SQL Formatter', description: 'Beautify queries across MySQL, Postgres, SQL Server, and Oracle.', slug: 'sql-formatter', id: 'SQLFormatter' },
      { title: 'SQL Minifier', description: 'Strip comments and whitespace for compact database migrations.', slug: 'sql-minifier', id: 'SQLMinifier' },
      { title: 'UUID Generator', description: 'Generate RFC 4122 compliant v4 primary key identifiers.', slug: 'uuid-generator', id: 'UUIDGenerator' },
      { title: 'Hash Generator', description: 'Compute cryptographic MD5, SHA-256, and SHA-512 hashes.', slug: 'hash-generator', id: 'HashGenerator' },
      { title: 'Timestamp Converter', description: 'Convert Unix epoch timestamps to ISO dates and timezones.', slug: 'timestamp-converter', id: 'TimestampConverter' }
    ]
  },
  {
    id: 'web-seo-engineering',
    name: 'Web Performance & Technical SEO',
    description: 'Crawl site links, audit technical Core Web Vitals, generate robots.txt directives, compile sitemaps, and set canonical tags.',
    steps: [
      { title: 'Website Crawler', description: 'Crawl internal links, extract HTTP status codes, and find broken URLs.', slug: 'website-crawler', id: 'WebsiteCrawler' },
      { title: 'Technical SEO Audit', description: 'Analyze meta tags, OpenGraph data, headings, and indexability.', slug: 'website-seo-audit', id: 'WebsiteSeoAudit' },
      { title: 'Robots.txt Builder', description: 'Create search engine crawler allow/disallow directives.', slug: 'robots-txt-generator', id: 'RobotsTxtGenerator' },
      { title: 'Sitemap Generator', description: 'Compile XML sitemaps with change frequency and priority tags.', slug: 'sitemap-generator', id: 'SitemapGenerator' },
      { title: 'Canonical URL Tag', description: 'Generate self-referencing canonical tags to prevent duplicate content.', slug: 'canonical-url-generator', id: 'CanonicalUrlGenerator' }
    ]
  }
];

// Helper to find workflows a tool belongs to
export function getToolWorkflows(toolSlug: string): Workflow[] {
  return workflows.filter(w => w.steps.some(step => step.slug === toolSlug));
}
