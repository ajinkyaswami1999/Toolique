export interface WorkflowStep {
  title: string;
  description: string;
  slug: string;
  id: string; // matches tool.id
}

export type WorkflowCategory = 
  | 'civil-architecture'
  | 'finance-tax'
  | 'developer-api'
  | 'qa-testing'
  | '3d-printing'
  | 'math-calculus'
  | 'economics-business';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  categoryLabel: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  highlightColor: string;
  steps: WorkflowStep[];
}

export const workflowCategories: { id: WorkflowCategory; name: string; icon: string; count?: number }[] = [
  { id: 'civil-architecture', name: 'Civil & Architecture', icon: 'Compass' },
  { id: 'finance-tax', name: 'Finance & Taxation', icon: 'IndianRupee' },
  { id: 'developer-api', name: 'Developer & APIs', icon: 'Code2' },
  { id: 'qa-testing', name: 'QA & Test Engineering', icon: 'ShieldCheck' },
  { id: '3d-printing', name: '3D Printing & Fabrication', icon: 'Printer' },
  { id: 'math-calculus', name: 'Math & Calculus', icon: 'Scale' },
  { id: 'economics-business', name: 'Economics & Business', icon: 'TrendingUp' },
];

export const workflows: Workflow[] = [
  // 1. Civil & Architecture
  {
    id: 'statutory-zoning-feasibility',
    name: 'Statutory Bye-Laws & Site Feasibility',
    description: 'Verify FAR, setbacks, high-rise fire norms, and municipal clearances from plot purchase to architectural approval.',
    category: 'civil-architecture',
    categoryLabel: 'Civil & Architecture',
    difficulty: 'Advanced',
    estimatedTime: '15-20 mins',
    highlightColor: 'from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
    steps: [
      { title: 'Site Feasibility & Bye-Laws', description: 'Check FAR, setbacks, and statutory approvals across NBC 2016 and 172+ state codes.', slug: 'building-feasibility-checker', id: 'BuildingFeasibilityChecker' },
      { title: 'Plot Area Converter', description: 'Estimate precise plot dimensions and unit conversions across Guntha, Sq Ft, and Acres.', slug: 'plot-area-calculator', id: 'PlotAreaCalculator' },
      { title: 'FAR & FSI Index', description: 'Calculate permissible built-up areas and road width limits.', slug: 'far-fsi-calculator', id: 'FARFSICalculator' },
      { title: 'Setback Clearances', description: 'Calculate front, rear, and side setback buffers for fire engine access.', slug: 'setback-calculator', id: 'SetbackCalculator' },
      { title: 'Ground Coverage', description: 'Plan ground footprint and open space percentages.', slug: 'plot-coverage-calculator', id: 'PlotCoverageCalculator' },
      { title: 'Building Height & Road Width', description: 'Verify max permissible height based on abutting road widths and clearances.', slug: 'building-height-calculator', id: 'BuildingHeightCalculator' }
    ]
  },
  {
    id: 'plot-to-material',
    name: 'Plot Development & Material BOQ Estimator',
    description: 'Track your project from buying a plot of land to full Bill of Quantities (BOQ) and structural material volumes.',
    category: 'civil-architecture',
    categoryLabel: 'Civil & Architecture',
    difficulty: 'Intermediate',
    estimatedTime: '20-25 mins',
    highlightColor: 'from-orange-500/20 to-red-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30',
    steps: [
      { title: 'Site Feasibility & Bye-Laws', description: 'Check FAR, setbacks, and statutory approvals across NBC 2016 and state codes.', slug: 'building-feasibility-checker', id: 'BuildingFeasibilityChecker' },
      { title: 'Plot Area', description: 'Estimate your plot dimensions and total land area.', slug: 'plot-area-calculator', id: 'PlotAreaCalculator' },
      { title: 'FSI & Clearance', description: 'Check municipal clearances and permissible built-up areas.', slug: 'far-fsi-calculator', id: 'FARFSICalculator' },
      { title: 'Built-up Area', description: 'Plan individual floor sizes and ground coverage.', slug: 'built-up-area-calculator', id: 'BuiltUpAreaCalculator' },
      { title: 'Carpet Area', description: 'Deduct wall thickness to find usable RERA carpet space.', slug: 'carpet-area-calculator', id: 'CarpetAreaCalculator' },
      { title: 'Floor Efficiency', description: 'Analyze your carpet area ratio to total built-up footprint.', slug: 'floor-efficiency-calculator', id: 'FloorEfficiencyCalculator' },
      { title: 'Construction Cost', description: 'Compute overall construction budget and labor costs.', slug: 'construction-cost-calculator', id: 'ConstructionCostCalculator' },
      { title: 'BOQ Estimation', description: 'Generate a Bill of Quantities (BOQ) for the project with rate analysis.', slug: 'advanced-boq-calculator-india', id: 'AdvancedBOQCalculatorIndia' },
      { title: 'Material Quantities', description: 'Estimate specific cement bags, sand tons, brick counts, and steel volumes.', slug: 'material-quantity-estimator', id: 'MaterialQuantityEstimator' }
    ]
  },
  {
    id: 'room-to-finish',
    name: 'Room Finishing & Interior Renovation Planner',
    description: 'Calculate finishing costs, wall painting, false ceiling frames, tiling, and modular kitchen woodwork for residential rooms.',
    category: 'civil-architecture',
    categoryLabel: 'Civil & Architecture',
    difficulty: 'Beginner',
    estimatedTime: '10-15 mins',
    highlightColor: 'from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400 border-violet-500/30',
    steps: [
      { title: 'Room Dimensions', description: 'Measure total floor and wall areas of your rooms.', slug: 'room-area-calculator', id: 'RoomAreaCalculator' },
      { title: 'Flooring & Tiles', description: 'Estimate tiles, grout, and installation costs with wastage buffer.', slug: 'flooring-cost-calculator', id: 'FlooringCostCalculator' },
      { title: 'Wall Paint', description: 'Calculate required paint volume, primer coats, and labor rates.', slug: 'paint-calculator', id: 'PaintCalculator' },
      { title: 'False Ceiling', description: 'Estimate Gypsum/POP materials and ceiling perimeter framing costs.', slug: 'false-ceiling-calculator', id: 'FalseCeilingCalculator' },
      { title: 'Door/Window Sizing', description: 'Plan clearance and custom opening sizing configurations.', slug: 'door-size-calculator', id: 'DoorSizeCalculator' },
      { title: 'Wardrobe Fitting', description: 'Estimate woodwork cost, plywood sheets, and shelf storage areas.', slug: 'wardrobe-cost-calculator', id: 'WardrobeCostCalculator' },
      { title: 'Modular Kitchen', description: 'Model U/L-shaped cabinetry, granite countertops, and hardware budgets.', slug: 'modular-kitchen-cost-calculator', id: 'ModularKitchenCostCalculator' }
    ]
  },
  {
    id: 'structural-rcc-concrete',
    name: 'Structural RCC & Concrete Estimation',
    description: 'Calculate concrete mix proportions, rebar steel weight, beam and column loads, and structural materials.',
    category: 'civil-architecture',
    categoryLabel: 'Civil & Architecture',
    difficulty: 'Advanced',
    estimatedTime: '15-20 mins',
    highlightColor: 'from-rose-500/20 to-pink-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
    steps: [
      { title: 'RCC Concrete Volume', description: 'Calculate M20/M25 concrete mix volume, cement bags, and aggregate ratios.', slug: 'rcc-calculator', id: 'RCCCalculator' },
      { title: 'Steel Rebar Weight', description: 'Compute TMT reinforcement steel rod weight and cutting schedules.', slug: 'steel-weight-calculator', id: 'SteelWeightCalculator' },
      { title: 'Cement Bag Estimator', description: 'Estimate cement bag requirements for plastering and masonry.', slug: 'cement-calculator', id: 'CementCalculator' },
      { title: 'Sand & Aggregate Volume', description: 'Calculate fine sand and coarse aggregate brass/cubic meter quantities.', slug: 'sand-calculator', id: 'SandCalculator' },
      { title: 'Brickwork Estimator', description: 'Compute standard fly ash / red clay brick counts and mortar requirements.', slug: 'brick-calculator', id: 'BrickCalculator' }
    ]
  },

  // 2. Finance & Taxation
  {
    id: 'salary-tax-planning',
    name: 'Salary, Tax Regimes & Deductions Planning',
    description: 'Calculate in-hand take-home pay, optimize HRA exemptions, verify TDS withholding rates, and compare Old vs. New Tax Regimes.',
    category: 'finance-tax',
    categoryLabel: 'Finance & Taxation',
    difficulty: 'Intermediate',
    estimatedTime: '10-15 mins',
    highlightColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    steps: [
      { title: 'Take-Home Pay', description: 'Compute net monthly in-hand pay from annual CTC after EPF and professional tax.', slug: 'in-hand-salary-calculator', id: 'InHandSalaryCalculator' },
      { title: 'HRA Exemption', description: 'Maximize Section 10(13A) house rent allowance tax relief based on metro status.', slug: 'hra-calculator', id: 'HRACalculator' },
      { title: 'TDS Rates', description: 'Verify withholding tax deductions across Indian statutory sections.', slug: 'tds-calculator', id: 'TDSCalculator' },
      { title: 'Income Tax Regime', description: 'Compare Old vs. New tax slabs with standard deduction and 87A rebate.', slug: 'income-tax-calculator', id: 'IncomeTaxCalculator' }
    ]
  },
  {
    id: 'wealth-investment-compounding',
    name: 'Wealth Building & Investment Compounding',
    description: 'Plan monthly mutual fund SIPs, evaluate CAGR returns, model compound interest, and lock in bank fixed/recurring deposits.',
    category: 'finance-tax',
    categoryLabel: 'Finance & Taxation',
    difficulty: 'Beginner',
    estimatedTime: '10-15 mins',
    highlightColor: 'from-teal-500/20 to-cyan-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30',
    steps: [
      { title: 'SIP Growth', description: 'Forecast mutual fund wealth creation and maturity corpus with step-up rates.', slug: 'sip-calculator', id: 'SIPCalculator' },
      { title: 'CAGR Returns', description: 'Calculate annualized compound growth rate on stocks, mutual funds, or real estate.', slug: 'cagr-calculator', id: 'CAGRCalculator' },
      { title: 'Compound Interest', description: 'Model multi-frequency exponential interest compounding over time.', slug: 'compound-interest-calculator', id: 'CompoundInterestCalculator' },
      { title: 'Fixed Deposit (FD)', description: 'Compute bank fixed deposit quarterly compounding interest and senior citizen perks.', slug: 'fd-calculator', id: 'FDCalculator' },
      { title: 'Recurring Deposit (RD)', description: 'Calculate disciplined monthly deposit maturity amounts and interest gains.', slug: 'rd-calculator', id: 'RDCalculator' }
    ]
  },
  {
    id: 'retirement-pension-planning',
    name: 'Retirement & Pension Security',
    description: 'Build an EEE tax-free PPF corpus, forecast NPS pension annuities, calculate statutory gratuity, and manage loan debt.',
    category: 'finance-tax',
    categoryLabel: 'Finance & Taxation',
    difficulty: 'Intermediate',
    estimatedTime: '10-15 mins',
    highlightColor: 'from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    steps: [
      { title: 'PPF Wealth', description: 'Calculate 15-year tax-free guaranteed returns under Section 80C.', slug: 'ppf-calculator', id: 'PPFCalculator' },
      { title: 'NPS Pension', description: 'Estimate retirement corpus and monthly annuity payout from Tier-1 contributions.', slug: 'nps-calculator', id: 'NPSCalculator' },
      { title: 'Gratuity Payout', description: 'Calculate statutory end-of-service gratuity entitlement under Gratuity Act 1972.', slug: 'gratuity-calculator', id: 'GratuityCalculator' },
      { title: 'Loan EMI Payoff', description: 'Model loan amortizations to eliminate liabilities before retirement.', slug: 'emi-calculator', id: 'EMICalculator' }
    ]
  },

  // 3. Developer & APIs
  {
    id: 'api-payload-inspection',
    name: 'API Development & Payload Inspection',
    description: 'Send HTTP requests, format JSON responses, compare API schemas, decode JWT auth tokens, and encode binary headers.',
    category: 'developer-api',
    categoryLabel: 'Developer & APIs',
    difficulty: 'Intermediate',
    estimatedTime: '10-15 mins',
    highlightColor: 'from-indigo-500/20 to-blue-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    steps: [
      { title: 'REST API Tester', description: 'Send GET, POST, PUT, DELETE requests with custom headers and auth tokens.', slug: 'api-tester', id: 'ApiTester' },
      { title: 'JSON Formatter', description: 'Prettify, validate, and repair structured JSON responses with 2-space indentation.', slug: 'json-formatter', id: 'JSONFormatter' },
      { title: 'JSON Validator', description: 'Verify JSON syntax validity and pinpoint parser errors.', slug: 'json-validator', id: 'JSONValidator' },
      { title: 'JSON Compare', description: 'Find semantic differences between expected and actual payload responses.', slug: 'json-compare', id: 'JSONCompare' },
      { title: 'JWT Decoder', description: 'Inspect token headers, claims, expiration, and signature validity.', slug: 'jwt-decoder', id: 'JWTDecoder' },
      { title: 'Base64 Encoder', description: 'Encode and decode authorization tokens and binary strings client-side.', slug: 'base64-encoder-decoder', id: 'Base64Tool' }
    ]
  },
  {
    id: 'sql-database-optimization',
    name: 'SQL & Database Engineering Pipeline',
    description: 'Format complex queries, minify SQL for migration scripts, generate primary key UUIDs, hash passwords, and convert Unix epoch timestamps.',
    category: 'developer-api',
    categoryLabel: 'Developer & APIs',
    difficulty: 'Intermediate',
    estimatedTime: '10-15 mins',
    highlightColor: 'from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    steps: [
      { title: 'SQL Formatter', description: 'Beautify queries across MySQL, Postgres, SQL Server, and Oracle dialects.', slug: 'sql-formatter', id: 'SQLFormatter' },
      { title: 'SQL Minifier', description: 'Strip comments and whitespace for compact production database migrations.', slug: 'sql-minifier', id: 'SQLMinifier' },
      { title: 'UUID Generator', description: 'Generate RFC 4122 compliant v4 primary key identifiers.', slug: 'uuid-generator', id: 'UUIDGenerator' },
      { title: 'Hash Generator', description: 'Compute cryptographic MD5, SHA-256, and SHA-512 hashes for secrets.', slug: 'hash-generator', id: 'HashGenerator' },
      { title: 'Timestamp Converter', description: 'Convert Unix epoch timestamps to human dates, UTC, and local timezones.', slug: 'timestamp-converter', id: 'TimestampConverter' }
    ]
  },
  {
    id: 'web-seo-engineering',
    name: 'Web Performance & Technical SEO Pipeline',
    description: 'Crawl site links, audit technical Core Web Vitals, generate robots.txt directives, compile sitemaps, and set canonical tags.',
    category: 'developer-api',
    categoryLabel: 'Developer & APIs',
    difficulty: 'Advanced',
    estimatedTime: '15-20 mins',
    highlightColor: 'from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
    steps: [
      { title: 'Website Crawler', description: 'Crawl internal links, extract HTTP status codes, and find broken URLs.', slug: 'website-crawler', id: 'WebsiteCrawler' },
      { title: 'Technical SEO Audit', description: 'Analyze meta tags, OpenGraph data, headings, and indexability signals.', slug: 'website-seo-audit', id: 'WebsiteSeoAudit' },
      { title: 'Robots.txt Builder', description: 'Create search engine crawler allow/disallow directives for Googlebot and AI crawlers.', slug: 'robots-txt-generator', id: 'RobotsTxtGenerator' },
      { title: 'Sitemap Generator', description: 'Compile XML sitemaps with change frequency and priority tags.', slug: 'sitemap-generator', id: 'SitemapGenerator' },
      { title: 'Canonical URL Tag', description: 'Generate self-referencing canonical tags to prevent duplicate content indexing.', slug: 'canonical-url-generator', id: 'CanonicalUrlGenerator' }
    ]
  },

  // 4. QA & Test Automation
  {
    id: 'manual-test-design',
    name: 'Manual Test Case & Scenario Synthesis',
    description: 'Plan test scenarios from requirements, compute boundary value limits, create equivalence partitions, generate mock data, and draft bug reports.',
    category: 'qa-testing',
    categoryLabel: 'QA & Testing',
    difficulty: 'Intermediate',
    estimatedTime: '15-20 mins',
    highlightColor: 'from-rose-500/20 to-red-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
    steps: [
      { title: 'Test Scenario Creator', description: 'Curate high-level end-to-end scenarios from raw user stories and PRDs.', slug: 'test-scenario-generator', id: 'TestScenarioGenerator' },
      { title: 'Test Case Writer', description: 'Draft structured test cases with preconditions, action steps, and expected results.', slug: 'test-case-generator', id: 'TestCaseGenerator' },
      { title: 'BVA Calculator', description: 'Define exact minimum, nominal, and maximum boundary test parameters.', slug: 'boundary-value-analysis', id: 'BoundaryValueAnalysis' },
      { title: 'Partitioning Planner', description: 'Group parameters into valid and invalid equivalence classes.', slug: 'equivalence-partitioning', id: 'EquivalencePartitioning' },
      { title: 'Test Data Creator', description: 'Generate realistic dummy datasets in JSON, CSV, or SQL format.', slug: 'test-data-generator', id: 'TestDataGenerator' },
      { title: 'Bug Report Draft', description: 'Write professional bug tickets with reproduction steps and severity levels.', slug: 'bug-report-generator', id: 'BugReportGenerator' }
    ]
  },
  {
    id: 'web-automation-locators',
    name: 'Web Test Automation & Locator Discovery',
    description: 'Evaluate DOM element locators, build robust XPath selectors, and validate regex test pattern expressions.',
    category: 'qa-testing',
    categoryLabel: 'QA & Testing',
    difficulty: 'Beginner',
    estimatedTime: '10 mins',
    highlightColor: 'from-red-500/20 to-orange-500/20 text-red-600 dark:text-red-400 border-red-500/30',
    steps: [
      { title: 'XPath Tester', description: 'Validate XPath axes, CSS selectors, and text-contains matches on HTML contexts.', slug: 'xpath-tester', id: 'XPathSelectorTester' },
      { title: 'Regex Tester', description: 'Test and debug validation pattern expressions with group capture analysis.', slug: 'regex-tester', id: 'RegexTester' },
      { title: 'Test Data Generator', description: 'Generate random names, email addresses, and UUIDs for test form inputs.', slug: 'test-data-generator', id: 'TestDataGenerator' }
    ]
  },

  // 5. 3D Printing & Fabrication
  {
    id: '3d-printing-job-pricing',
    name: '3D Print Job Pricing & Spool Costing Pipeline',
    description: 'Calculate 3D mesh volume, estimate filament gram weight, compute electricity and machine depreciation, and determine commercial selling price.',
    category: '3d-printing',
    categoryLabel: '3D Printing',
    difficulty: 'Intermediate',
    estimatedTime: '10-15 mins',
    highlightColor: 'from-cyan-500/20 to-teal-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    steps: [
      { title: 'STL Mesh Volume', description: 'Calculate exact 3D model volume (cm³) and weight in grams from STL files.', slug: 'stl-volume-calculator', id: 'STLVolumeCalculator' },
      { title: 'Filament Costing', description: 'Compute material cost based on spool weight, material density (PLA/PETG/ABS), and spool price.', slug: '3d-printing-cost-calculator', id: 'ThreeDPrintingCostCalculator' },
      { title: 'Print Profit & Pricing', description: 'Add labor time, machine depreciation, packaging, electricity, and markup percentage.', slug: 'print-profit-calculator', id: 'PrintProfitCalculator' },
      { title: 'Print Farm Revenue', description: 'Model monthly revenue, ROI payback period, and throughput across multiple 3D printers.', slug: 'print-farm-revenue-calculator', id: 'PrintFarmRevenueCalculator' }
    ]
  },
  {
    id: 'ams-multicolor-optimization',
    name: 'Multi-Color Print & AMS Purge Optimization',
    description: 'Optimize Bambu Lab AMS filament flushing volumes, calculate hotend volumetric flow limits, and generate multi-color filament art.',
    category: '3d-printing',
    categoryLabel: '3D Printing',
    difficulty: 'Advanced',
    estimatedTime: '15 mins',
    highlightColor: 'from-teal-500/20 to-emerald-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30',
    steps: [
      { title: 'Purge Waste Calculator', description: 'Calculate exact purge tower waste and tune dark-to-light filament transition flush volumes.', slug: 'purge-waste-calculator', id: 'PurgeWasteCalculator' },
      { title: 'Volumetric Flow Rate', description: 'Calculate maximum print speed capped by hotend melt zone capacity (mm³/s).', slug: 'volumetric-flow-rate-calculator', id: 'VolumetricFlowRateCalculator' },
      { title: 'Filament Art Maker', description: 'Convert 2D photographs into layer-by-layer filament swap HueForge-style 3D art.', slug: 'filament-art-maker', id: 'ImageToFilamentArtMaker' }
    ]
  },

  // 6. Mathematics & Calculus
  {
    id: 'calculus-analysis',
    name: 'Calculus & Function Analysis Journey',
    description: 'Solve limits, compute symbolic derivatives, find antiderivatives, and model initial value ODE differential equations.',
    category: 'math-calculus',
    categoryLabel: 'Math & Calculus',
    difficulty: 'Advanced',
    estimatedTime: '15-20 mins',
    highlightColor: 'from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
    steps: [
      { title: 'Limit Evaluation', description: 'Analyze one-sided and two-sided function limits and asymptotic behavior.', slug: 'limit-calculator', id: 'LimitCalculator' },
      { title: 'Derivative & Tangent', description: 'Find symbolic derivatives, tangent line slopes, inflection points, and concavity.', slug: 'derivative-calculator', id: 'DerivativeCalculator' },
      { title: 'Integral & Area', description: 'Compute definite/indefinite integrals and area bounded under curves.', slug: 'integral-calculator', id: 'IntegralCalculator' },
      { title: 'Differential Equations', description: 'Solve first-order and second-order ordinary differential equations (ODEs).', slug: 'differential-equation-solver', id: 'DifferentialEquationSolver' }
    ]
  },

  // 7. Economics & Business
  {
    id: 'micro-pricing-elasticity',
    name: 'Microeconomic Pricing & Elasticity Analysis',
    description: 'Calculate price elasticity of demand, marginal revenue, marginal cost, break-even unit sales, and profit maximization.',
    category: 'economics-business',
    categoryLabel: 'Economics & Business',
    difficulty: 'Intermediate',
    estimatedTime: '15 mins',
    highlightColor: 'from-blue-500/20 to-sky-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
    steps: [
      { title: 'Price Elasticity of Demand', description: 'Measure quantity responsiveness using the midpoint percentage formula.', slug: 'price-elasticity-demand-calculator', id: 'PriceElasticityDemandCalculator' },
      { title: 'Marginal Revenue', description: 'Calculate incremental revenue generated per additional unit sold.', slug: 'marginal-revenue-calculator', id: 'MarginalRevenueCalculator' },
      { title: 'Marginal Cost', description: 'Compute change in total production cost per additional unit produced.', slug: 'marginal-cost-calculator', id: 'MarginalCostCalculator' },
      { title: 'Break-Even Analysis', description: 'Calculate unit sales and gross revenue needed to cover fixed and variable costs.', slug: 'break-even-point-calculator', id: 'BreakEvenPointCalculator' }
    ]
  },
  {
    id: 'macro-economic-indicators',
    name: 'Macroeconomic Growth & Policy Multiplier',
    description: 'Calculate Gross Domestic Product (GDP) growth, annual inflation rate, and Keynesian fiscal spending multipliers.',
    category: 'economics-business',
    categoryLabel: 'Economics & Business',
    difficulty: 'Beginner',
    estimatedTime: '10 mins',
    highlightColor: 'from-sky-500/20 to-indigo-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30',
    steps: [
      { title: 'GDP Growth Calculator', description: 'Compute nominal and real GDP using consumption, investment, government spending, and net exports.', slug: 'gdp-calculator', id: 'GDPCalculator' },
      { title: 'Keynesian Multiplier', description: 'Calculate economic expansion impact based on Marginal Propensity to Consume (MPC).', slug: 'keynesian-national-income-calculator', id: 'KeynesianNationalIncomeCalculator' },
      { title: 'Inflation Rate', description: 'Calculate Consumer Price Index (CPI) changes and real purchasing power decline.', slug: 'inflation-calculator', id: 'InflationCalculator' }
    ]
  }
];

// Helper to find workflows a tool belongs to
export function getToolWorkflows(toolSlug: string): Workflow[] {
  return workflows.filter(w => w.steps.some(step => step.slug === toolSlug));
}
