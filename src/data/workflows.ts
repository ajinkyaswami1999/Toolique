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
  }
];

// Helper to find workflows a tool belongs to
export function getToolWorkflows(toolSlug: string): Workflow[] {
  return workflows.filter(w => w.steps.some(step => step.slug === toolSlug));
}
