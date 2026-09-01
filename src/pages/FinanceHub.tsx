import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  HelpCircle, 
  LayoutGrid, 
  Search, 
  Layers, 
  Info, 
  ShieldCheck,
  Landmark,
  PiggyBank,
  Receipt,
  TrendingUp
} from 'lucide-react';
import { toolsList } from '../data/tools';
import { workflows } from '../data/workflows';
import { getToolCanonicalPath } from '../routes/AppRoutes';
import ToolCard from '../components/ToolCard';
import SEO from '../components/SEO';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FinanceHub() {
  const [searchQuery, setSearchQuery] = useState('');

  // Target tools to include in the Finance workspace
  const targetSlugs = [
    'in-hand-salary-calculator', 'income-tax-calculator', 'hra-calculator',
    'tds-calculator', 'gst-calculator', 'sip-calculator', 'cagr-calculator',
    'compound-interest-calculator', 'fd-calculator', 'rd-calculator',
    'ppf-calculator', 'nps-calculator', 'gratuity-calculator', 'emi-calculator'
  ];

  const financeWorkspaceTools = toolsList.filter(t => targetSlugs.includes(t.slug));

  // Category grouping
  const groupTax = financeWorkspaceTools.filter(t => [
    'in-hand-salary-calculator', 'income-tax-calculator', 'hra-calculator', 'tds-calculator', 'gst-calculator'
  ].includes(t.slug));

  const groupInvestment = financeWorkspaceTools.filter(t => [
    'sip-calculator', 'cagr-calculator', 'compound-interest-calculator', 'fd-calculator', 'rd-calculator'
  ].includes(t.slug));

  const groupRetirement = financeWorkspaceTools.filter(t => [
    'ppf-calculator', 'nps-calculator', 'gratuity-calculator'
  ].includes(t.slug));

  const groupLoan = financeWorkspaceTools.filter(t => [
    'emi-calculator'
  ].includes(t.slug));

  const categoriesData = [
    { id: 'tax', name: 'Salary & Indian Tax Optimization', description: 'Compute in-hand pay, compare tax regimes, and calculate HRA/TDS/GST deductions', tools: groupTax, icon: Receipt },
    { id: 'investment', name: 'Investment & Wealth Accumulation', description: 'Project SIP growth, annualized CAGR, compound interest, and bank deposits', tools: groupInvestment, icon: TrendingUp },
    { id: 'retirement', name: 'Retirement & Pension Security', description: 'Plan tax-free PPF wealth, monthly NPS pension, and end-of-service gratuity', tools: groupRetirement, icon: PiggyBank },
    { id: 'loan', name: 'Loans & Debt Management', description: 'Model home, car, and personal loan monthly amortizations and total interest', tools: groupLoan, icon: Landmark }
  ];

  // Filter tools by search query
  const getFilteredTools = (toolsListForGroup: typeof toolsList) => {
    if (!searchQuery) return toolsListForGroup;
    return toolsListForGroup.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const hasMatches = categoriesData.some(cat => getFilteredTools(cat.tools).length > 0);

  // Financial FAQs for AEO & GEO
  const localFaqs: FAQItem[] = [
    {
      question: 'Which is better in India: Old Tax Regime or New Tax Regime?',
      answer: 'The New Tax Regime offers lower tax slab rates and an increased standard deduction of ₹75,000 for salaried employees with a tax rebate up to ₹7 Lakhs taxable income (making income up to ₹7.75 Lakhs effectively tax-free). However, the Old Tax Regime remains beneficial if you claim substantial deductions under Section 80C (₹1.5L), Section 80D health insurance (up to ₹75k), Section 24(b) home loan interest (up to ₹2L), and HRA exemption under Section 10(13A).'
    },
    {
      question: 'How is Systematic Investment Plan (SIP) mutual fund return calculated?',
      answer: 'SIP returns are calculated using the compound interest formula with periodic compounding: FV = P × [((1 + r)ⁿ - 1) / r] × (1 + r), where P is monthly deposit, r is the monthly expected rate of return (annual rate / 12), and n is total number of monthly installments.'
    },
    {
      question: 'What is the tax status of Public Provident Fund (PPF) in India?',
      answer: 'PPF enjoys Exempt-Exempt-Exempt (EEE) tax status in India. Contributions up to ₹1.5 Lakh per financial year qualify for deduction under Section 80C, annual interest accrued is 100% tax-free, and the entire maturity corpus after 15 years is exempt from income tax.'
    },
    {
      question: 'How is statutory gratuity calculated under the Payment of Gratuity Act 1972?',
      answer: 'For establishments covered under the Gratuity Act, the formula is: Gratuity = (15 × Last Drawn Salary × Tenure in Years) / 26, where Last Drawn Salary equals Basic Salary + Dearness Allowance (DA), and 26 represents working days in a month. Up to ₹20 Lakhs gratuity payout is exempt from income tax.'
    },
    {
      question: 'Are my financial details and salary figures saved or tracked?',
      answer: 'No. All calculations run 100% locally in your browser sandbox. Your salary, investments, loan amounts, and tax numbers are never transmitted to or stored on any server.'
    }
  ];

  const PILLARS = [
    { id: 'architecture', name: 'Architecture & Civil', description: 'Permissible FSI, plot clearances, and building estimates.', path: '/architecture' },
    { id: 'developer', name: 'Developer Utilities', description: 'SQL formatting, JSON diffing, regex, and API tester.', path: '/developer' },
    { id: 'qa', name: 'QA Engineering', description: 'Test cases, BVA, XPath selectors, and bug reports.', path: '/qa' },
    { id: 'calculators', name: 'General Calculators', description: 'Unit converters, math solvers, and date utilities.', path: '/calculators' }
  ];

  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://www.toolique.in/finance#collection',
        'name': 'Personal Finance, Tax & Investment Calculators | Toolique',
        'description': 'Free online financial calculators for Indian income tax, in-hand salary, mutual fund SIPs, loan EMIs, PPF, NPS, FD, and gratuity.',
        'url': 'https://www.toolique.in/finance'
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.toolique.in/finance#faq',
        'mainEntity': localFaqs.map(f => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.answer
          }
        }))
      }
    ]
  };

  return (
    <div className="space-y-12 text-left animate-fadeIn">
      <SEO 
        title="Personal Finance, Tax & Investment Calculators | Toolique"
        description="Calculate income tax, in-hand salary from CTC, mutual fund SIP growth, loan EMIs, PPF returns, NPS pensions, and FD interest with Indian tax code rules."
        schemaMarkup={schemaMarkup}
      />

      {/* Hero Panel */}
      <div className="p-8 md:p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] uppercase tracking-wider">
              Finance & Tax Suite
            </span>
            <span className="text-[10px] text-zinc-450 font-bold">14 Integrated Calculators</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-905 dark:text-white tracking-tight leading-none">
            Personal Finance & Tax Suite
          </h1>
          <p className="text-sm text-zinc-505 dark:text-zinc-400 leading-relaxed font-medium">
            Plan take-home salaries, compare Old vs. New income tax slabs, forecast mutual fund SIPs, evaluate bank fixed deposits, calculate loan EMIs, and model retirement pensions. 100% private, sandbox computation.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 hidden sm:block">
          <ShieldCheck className="w-10 h-10 animate-pulse" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-550 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search finance tools (e.g. SIP, Tax, Salary, EMI, PPF)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-255 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-900/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-semibold placeholder-zinc-400 dark:placeholder-zinc-650"
        />
      </div>

      {/* Curated Financial Journeys */}
      {!searchQuery && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Curated Financial Journeys
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {workflows.filter(w => ['salary-tax-planning', 'wealth-investment-compounding', 'retirement-pension-planning'].includes(w.id)).map((wf) => (
              <div 
                key={wf.id}
                className="p-5 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider">
                    {wf.id === 'salary-tax-planning' ? 'Tax Optimization' : wf.id === 'wealth-investment-compounding' ? 'Wealth Compounding' : 'Retirement Security'}
                  </h3>
                  <h4 className="text-sm font-extrabold text-zinc-905 dark:text-white">
                    {wf.name}
                  </h4>
                  <p className="text-[11px] text-zinc-450 dark:text-zinc-500 leading-relaxed font-semibold">
                    {wf.description}
                  </p>
                </div>

                {/* Steps Mini Timeline preview */}
                <div className="py-2.5 border-y border-zinc-100 dark:border-zinc-850 my-1">
                  <div className="flex flex-col gap-2">
                    {wf.steps.map((step, idx) => {
                      const stepTool = toolsList.find(t => t.id === step.id);
                      const path = stepTool ? getToolCanonicalPath(stepTool.category, stepTool.slug) : '#';
                      return (
                        <Link 
                          key={step.slug}
                          to={path}
                          className="flex items-center gap-2 hover:translate-x-0.5 transition-transform"
                        >
                          <span className="w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-emerald-500">
                            {step.title}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">{wf.steps.length} Steps</span>
                  <Link 
                    to={getToolCanonicalPath(
                      (toolsList.find(t => t.id === wf.steps[0].id))?.category || 'finance', 
                      wf.steps[0].slug
                    )}
                    className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    <span>Start Journey</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categorized Tools Grid */}
      <div className="space-y-12">
        {categoriesData.map((cat) => {
          const filtered = getFilteredTools(cat.tools);
          if (filtered.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-5">
              <div className="flex items-center gap-2.5 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-2.5">
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white leading-none">
                    {cat.name} ({filtered.length})
                  </h2>
                  <p className="text-[10px] text-zinc-455 dark:text-zinc-500 font-bold mt-1">
                    {cat.description}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          );
        })}

        {!hasMatches && (
          <div className="p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3">
            <Info className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">No financial tools match your query</h3>
            <p className="text-xs text-zinc-450 font-medium">Try searching for terms like "SIP", "salary", "tax", "PPF", or "EMI".</p>
          </div>
        )}
      </div>

      {/* Financial Guidelines & Tax Cheat Sheet Card */}
      {!searchQuery && (
        <section className="p-6 md:p-8 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 text-left space-y-5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              India Tax & Compliance Notes
            </span>
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Tax Exemptions & Regulatory Benchmarks
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed font-semibold text-zinc-500 dark:text-zinc-400">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 space-y-2">
              <h3 className="font-extrabold text-zinc-900 dark:text-white">Section 80C & 80CCD</h3>
              <p className="text-[11px] leading-relaxed text-zinc-450 font-medium">
                Claim up to ₹1.5 Lakhs across EPF, PPF, ELSS, and term insurance under Section 80C. An additional ₹50,000 deduction is available for Tier-1 NPS under Section 80CCD(1B).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 space-y-2">
              <h3 className="font-extrabold text-zinc-900 dark:text-white">New Tax Regime Standard Deduction</h3>
              <p className="text-[11px] leading-relaxed text-zinc-450 font-medium">
                For FY 2024-25 and FY 2025-26, salaried taxpayers enjoy an increased standard deduction of ₹75,000 under the New Tax Regime, making salary income up to ₹7.75 Lakhs 100% tax-free.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 space-y-2">
              <h3 className="font-extrabold text-zinc-900 dark:text-white">HRA Section 10(13A) Exemption</h3>
              <p className="text-[11px] leading-relaxed text-zinc-450 font-medium">
                HRA tax relief equals the lowest of: (1) Actual HRA received; (2) 50% of basic salary for metro cities (40% non-metro); or (3) Rent paid minus 10% of basic salary.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Double Column: FAQs + Side pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        
        {/* FAQs Panel */}
        <div className="lg:col-span-8 space-y-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-500" />
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="space-y-4">
            {localFaqs.map((faq, index) => (
              <div key={index} className="saas-card p-5 space-y-2 border border-zinc-200/60 dark:border-zinc-850/60 text-left">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-medium">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Related categories */}
        <div className="lg:col-span-4 space-y-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-teal-500" />
            <span>Core Suites</span>
          </h2>
          <div className="space-y-3">
            {PILLARS.map((c) => (
              <Link
                key={c.id}
                to={c.path}
                className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-850/40 cursor-pointer flex justify-between items-center transition duration-300 text-left"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white">{c.name}</h4>
                  <p className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-snug mt-1 font-medium max-w-[200px] truncate">
                    {c.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
