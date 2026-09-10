import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2, Info,
  ShieldCheck,
  Sliders, ChevronDown, ChevronUp,
  Calculator,
  ArrowRight, Compass,
  Briefcase, Building2, Coins,
  Scale, AlertCircle, CheckCircle2
} from 'lucide-react';

type CalculationMode = 'simple' | 'itemized' | 'career_transition' | 'eva';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  revenue: number;
  explicitCosts: number;
  implicitCosts: number;
  forgoneSalary: number;
  forgoneRent: number;
  investedCapital: number;
  interestRate: number;
  notes: string;
  expectedVerdict: string;
}

export default function EconomicProfitCalculator() {
  // Mode state
  const [mode, setMode] = useState<CalculationMode>('simple');
  const [currency, setCurrency] = useState<string>('$');

  // Mode 1: Simple Inputs
  const [simpleRevenue, setSimpleRevenue] = useState<number>(350000);
  const [simpleExplicit, setSimpleExplicit] = useState<number>(200000);
  const [simpleImplicit, setSimpleImplicit] = useState<number>(110000);

  // Mode 2: Itemized Cost Inputs
  const [itemRevenue, setItemRevenue] = useState<number>(450000);
  // Explicit Breakdown
  const [itemWages, setItemWages] = useState<number>(120000);
  const [itemMaterials, setItemMaterials] = useState<number>(75000);
  const [itemRent, setItemRent] = useState<number>(36000);
  const [itemUtilitiesMarketing, setItemUtilitiesMarketing] = useState<number>(24000);
  const [itemTaxesInsurance, setItemTaxesInsurance] = useState<number>(15000);
  // Implicit Breakdown
  const [itemForgoneSalary, setItemForgoneSalary] = useState<number>(95000);
  const [itemForgoneRent, setItemForgoneRent] = useState<number>(18000);
  const [itemInvestedEquity, setItemInvestedEquity] = useState<number>(150000);
  const [itemEquityOpportunityRate, setItemEquityOpportunityRate] = useState<number>(8.0); // 8% market return
  const [itemNormalProfit, setItemNormalProfit] = useState<number>(10000);

  // Mode 3: Entrepreneurial Career Transition Inputs
  const [careerStartupRevenue, setCareerStartupRevenue] = useState<number>(280000);
  const [careerStartupExplicit, setCareerStartupExplicit] = useState<number>(130000);
  const [careerCorpBaseSalary, setCareerCorpBaseSalary] = useState<number>(120000);
  const [careerCorpBonusBenefits, setCareerCorpBonusBenefits] = useState<number>(25000);
  const [careerSavingsInvested, setCareerSavingsInvested] = useState<number>(100000);
  const [careerSavingsReturnRate, setCareerSavingsReturnRate] = useState<number>(7.5);

  // Mode 4: EVA (Economic Value Added) Inputs
  const [evaOperatingRevenue, setEvaOperatingRevenue] = useState<number>(2500000);
  const [evaOperatingExpenses, setEvaOperatingExpenses] = useState<number>(1700000);
  const [evaTaxRate, setEvaTaxRate] = useState<number>(25); // 25% tax
  const [evaTotalCapital, setEvaTotalCapital] = useState<number>(3000000);
  const [evaWacc, setEvaWacc] = useState<number>(9.5); // 9.5% WACC

  // UI States
  const [copied, setCopied] = useState(false);
  const [showProof, setShowProof] = useState(true);
  const [showSensitivity, setShowSensitivity] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // 6 Real-World Industry Presets
  const presets: PresetScenario[] = [
    {
      name: '💻 Tech Founder Leaving FAANG',
      category: 'High Opportunity Cost Trap',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      mode: 'career_transition',
      revenue: 400000,
      explicitCosts: 180000,
      implicitCosts: 240000,
      forgoneSalary: 210000,
      forgoneRent: 0,
      investedCapital: 200000,
      interestRate: 8.0,
      notes: 'Generates $220k in accounting profit, but suffers a -$20k economic loss due to high forgone corporate salary & equity returns.',
      expectedVerdict: 'Accounting Profit: +$220k | Economic Loss: -$20k'
    },
    {
      name: '☕ Specialty Coffee & Micro-Roastery',
      category: 'Supernormal Pure Profit',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      mode: 'itemized',
      revenue: 380000,
      explicitCosts: 210000,
      implicitCosts: 110000,
      forgoneSalary: 70000,
      forgoneRent: 24000,
      investedCapital: 120000,
      interestRate: 8.0,
      notes: 'Robust retail pricing covers all explicit supply/labor costs AND beats alternative career earnings by +$60k/yr.',
      expectedVerdict: 'Accounting Profit: +$170k | Economic Profit: +$60k'
    },
    {
      name: '🚜 Family Farm vs Solar Land Lease',
      category: 'Opportunity Asset Comparison',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      mode: 'itemized',
      revenue: 290000,
      explicitCosts: 180000,
      implicitCosts: 115000,
      forgoneSalary: 55000,
      forgoneRent: 45000,
      investedCapital: 150000,
      interestRate: 6.0,
      notes: 'Farming nets $110k accounting profit, but leasing the acres to solar panels and working a trade yields equal normal returns.',
      expectedVerdict: 'Economic Profit: -$5k (Near Normal Profit)'
    },
    {
      name: '🩺 Private Boutique Medical Clinic',
      category: 'High Capital & Professional Skill',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      mode: 'simple',
      revenue: 850000,
      explicitCosts: 420000,
      implicitCosts: 320000,
      forgoneSalary: 280000,
      forgoneRent: 0,
      investedCapital: 400000,
      interestRate: 10.0,
      notes: 'Generates substantial accounting profit ($430k) and solid supernormal economic returns ($110k) above hospital salary.',
      expectedVerdict: 'Accounting Profit: +$430k | Economic Profit: +$110k'
    },
    {
      name: '🚚 Owner-Operator Freight Logistics',
      category: 'Hidden Depreciation & Equity Loss',
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      mode: 'career_transition',
      revenue: 240000,
      explicitCosts: 155000,
      implicitCosts: 95000,
      forgoneSalary: 80000,
      forgoneRent: 0,
      investedCapital: 80000,
      interestRate: 7.0,
      notes: 'Diesel, insurance, and maintenance leave $85k accounting profit, but fleet driver salary ($80k) + rig capital interest reveals economic loss.',
      expectedVerdict: 'Accounting Profit: +$85k | Economic Loss: -$10k'
    },
    {
      name: '🏭 Corporate Manufacturing Unit (EVA)',
      category: 'Shareholder Value Creation',
      badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      mode: 'eva',
      revenue: 5000000,
      explicitCosts: 3600000,
      implicitCosts: 600000,
      forgoneSalary: 0,
      forgoneRent: 0,
      investedCapital: 6000000,
      interestRate: 10.0,
      notes: 'Calculates true Economic Value Added (EVA = NOPAT - Capital Charge). Exceeds hurdle rate to generate pure economic rent.',
      expectedVerdict: 'EVA: +$450,000 Pure Shareholder Value'
    }
  ];

  const handleApplyPreset = (preset: PresetScenario) => {
    setMode(preset.mode);
    if (preset.mode === 'simple') {
      setSimpleRevenue(preset.revenue);
      setSimpleExplicit(preset.explicitCosts);
      setSimpleImplicit(preset.implicitCosts);
    } else if (preset.mode === 'itemized') {
      setItemRevenue(preset.revenue);
      setItemWages(preset.explicitCosts * 0.55);
      setItemMaterials(preset.explicitCosts * 0.25);
      setItemRent(preset.explicitCosts * 0.12);
      setItemUtilitiesMarketing(preset.explicitCosts * 0.08);
      setItemForgoneSalary(preset.forgoneSalary);
      setItemForgoneRent(preset.forgoneRent);
      setItemInvestedEquity(preset.investedCapital);
      setItemEquityOpportunityRate(preset.interestRate);
    } else if (preset.mode === 'career_transition') {
      setCareerStartupRevenue(preset.revenue);
      setCareerStartupExplicit(preset.explicitCosts);
      setCareerCorpBaseSalary(preset.forgoneSalary);
      setCareerCorpBonusBenefits(preset.forgoneSalary * 0.15);
      setCareerSavingsInvested(preset.investedCapital);
      setCareerSavingsReturnRate(preset.interestRate);
    } else if (preset.mode === 'eva') {
      setEvaOperatingRevenue(preset.revenue);
      setEvaOperatingExpenses(preset.explicitCosts);
      setEvaTotalCapital(preset.investedCapital);
      setEvaWacc(preset.interestRate);
    }
  };

  // Comprehensive Calculation Engine
  const calc = useMemo(() => {
    let effectiveRevenue = 0;
    let effectiveExplicit = 0;
    let effectiveImplicit = 0;
    let explicitItems: { label: string; amount: number }[] = [];
    let implicitItems: { label: string; amount: number }[] = [];

    if (mode === 'simple') {
      effectiveRevenue = simpleRevenue;
      effectiveExplicit = simpleExplicit;
      effectiveImplicit = simpleImplicit;
      explicitItems = [
        { label: 'Explicit Operating Costs', amount: simpleExplicit }
      ];
      implicitItems = [
        { label: 'Implicit Opportunity Costs', amount: simpleImplicit }
      ];
    } else if (mode === 'itemized') {
      effectiveRevenue = itemRevenue;
      effectiveExplicit = itemWages + itemMaterials + itemRent + itemUtilitiesMarketing + itemTaxesInsurance;
      const equityOppCost = itemInvestedEquity * (itemEquityOpportunityRate / 100);
      effectiveImplicit = itemForgoneSalary + itemForgoneRent + equityOppCost + itemNormalProfit;

      explicitItems = [
        { label: 'Wages & Direct Labor', amount: itemWages },
        { label: 'Raw Materials & Inventory', amount: itemMaterials },
        { label: 'Physical Rent & Facilities', amount: itemRent },
        { label: 'Utilities & Marketing SaaS', amount: itemUtilitiesMarketing },
        { label: 'Taxes, Permits & Insurance', amount: itemTaxesInsurance }
      ];

      implicitItems = [
        { label: 'Forgone Entrepreneur Salary', amount: itemForgoneSalary },
        { label: 'Forgone Real Estate Rent', amount: itemForgoneRent },
        { label: `Invested Capital Return (${itemEquityOpportunityRate}%)`, amount: equityOppCost },
        { label: 'Normal Profit Premium', amount: itemNormalProfit }
      ];
    } else if (mode === 'career_transition') {
      effectiveRevenue = careerStartupRevenue;
      effectiveExplicit = careerStartupExplicit;
      const forgoneJobTotal = careerCorpBaseSalary + careerCorpBonusBenefits;
      const savingsOppCost = careerSavingsInvested * (careerSavingsReturnRate / 100);
      effectiveImplicit = forgoneJobTotal + savingsOppCost;

      explicitItems = [
        { label: 'Startup Operating Expenses', amount: careerStartupExplicit }
      ];

      implicitItems = [
        { label: 'Forgone Base Salary', amount: careerCorpBaseSalary },
        { label: 'Forgone Bonus & Benefits', amount: careerCorpBonusBenefits },
        { label: `Investment Opportunity Cost (${careerSavingsReturnRate}%)`, amount: savingsOppCost }
      ];
    } else if (mode === 'eva') {
      effectiveRevenue = evaOperatingRevenue;
      effectiveExplicit = evaOperatingExpenses;
      const operatingProfit = Math.max(0, evaOperatingRevenue - evaOperatingExpenses);
      const taxes = operatingProfit * (evaTaxRate / 100);
      const capitalCharge = evaTotalCapital * (evaWacc / 100);
      effectiveImplicit = capitalCharge + taxes;

      explicitItems = [
        { label: 'Operating Cost of Goods & SG&A', amount: evaOperatingExpenses }
      ];

      implicitItems = [
        { label: `Capital Charge (${evaWacc}% WACC on Invested Capital)`, amount: capitalCharge },
        { label: `Corporate Taxes (${evaTaxRate}%)`, amount: taxes }
      ];
    }

    const totalEconomicCost = effectiveExplicit + effectiveImplicit;
    const accountingProfit = effectiveRevenue - effectiveExplicit;
    const economicProfit = effectiveRevenue - totalEconomicCost;

    // Margins and Percentages
    const accountingMargin = effectiveRevenue > 0 ? (accountingProfit / effectiveRevenue) * 100 : 0;
    const economicMargin = effectiveRevenue > 0 ? (economicProfit / effectiveRevenue) * 100 : 0;
    const explicitShare = totalEconomicCost > 0 ? (effectiveExplicit / totalEconomicCost) * 100 : 50;
    const implicitShare = 100 - explicitShare;

    // Economic Diagnosis & Strategic Regime
    let regime: 'supernormal' | 'normal' | 'loss' = 'supernormal';
    let regimeTitle = '';
    let regimeDescription = '';
    let verdictClass = '';
    let badgeClass = '';

    if (economicProfit > 500) {
      regime = 'supernormal';
      regimeTitle = 'Supernormal Economic Profit (Pure Economic Rent)';
      regimeDescription = `The business creates net economic value over and above all explicit bills and owner opportunity costs. The entrepreneur earns ${currency}${economicProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} MORE than their best alternative. This signals sustainable competitive advantage and attracts industry entrants.`;
      verdictClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    } else if (Math.abs(economicProfit) <= 500) {
      regime = 'normal';
      regimeTitle = 'Normal Economic Profit (Zero Economic Rent / Long-Run Equilibrium)';
      regimeDescription = `Total revenue exactly covers all out-of-pocket costs and provides fair compensation for the entrepreneur's labor, risk, and invested capital (Economic Profit ≈ 0). The firm is in competitive long-run equilibrium.`;
      verdictClass = 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800';
      badgeClass = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    } else {
      regime = 'loss';
      regimeTitle = 'Subnormal Economic Loss (Hidden Opportunity Drain)';
      regimeDescription = `Even if accounting books show a positive profit of ${currency}${accountingProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}, the business yields ${currency}${Math.abs(economicProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })} LESS than the entrepreneur's next-best alternative. Resources are being sub-optimally deployed.`;
      verdictClass = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
      badgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }

    return {
      revenue: effectiveRevenue,
      explicitCosts: effectiveExplicit,
      implicitCosts: effectiveImplicit,
      totalEconomicCost,
      accountingProfit,
      economicProfit,
      accountingMargin,
      economicMargin,
      explicitShare,
      implicitShare,
      regime,
      regimeTitle,
      regimeDescription,
      verdictClass,
      badgeClass,
      explicitItems,
      implicitItems
    };
  }, [mode, simpleRevenue, simpleExplicit, simpleImplicit, itemRevenue, itemWages, itemMaterials, itemRent, itemUtilitiesMarketing, itemTaxesInsurance, itemForgoneSalary, itemForgoneRent, itemInvestedEquity, itemEquityOpportunityRate, itemNormalProfit, careerStartupRevenue, careerStartupExplicit, careerCorpBaseSalary, careerCorpBonusBenefits, careerSavingsInvested, careerSavingsReturnRate, evaOperatingRevenue, evaOperatingExpenses, evaTaxRate, evaTotalCapital, evaWacc, currency]);

  // Sensitivity Matrix: Revenue Variation vs Implicit Cost Variation
  const sensitivityMatrix = useMemo(() => {
    const revMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2];
    const impMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2];
    const baseRev = calc.revenue;
    const baseExplicit = calc.explicitCosts;
    const baseImp = calc.implicitCosts;

    return revMultipliers.map((rMult) => {
      const rowRev = baseRev * rMult;
      const rowCols = impMultipliers.map((iMult) => {
        const colImp = baseImp * iMult;
        const totalCost = baseExplicit + colImp;
        const acctProfit = rowRev - baseExplicit;
        const econProfit = rowRev - totalCost;
        return {
          rMult,
          iMult,
          rowRev,
          colImp,
          acctProfit,
          econProfit
        };
      });
      return { rMult, rowRev, cols: rowCols };
    });
  }, [calc.revenue, calc.explicitCosts, calc.implicitCosts]);

  // Copy Full Proof Handler
  const handleCopyProof = () => {
    const text = `=========================================
Economic Profit vs. Accounting Profit Analysis
=========================================
Total Revenue (TR): ${currency}${calc.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}

COST STRUCTURE BREAKDOWN:
• Explicit Costs (Out-of-Pocket): ${currency}${calc.explicitCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${calc.explicitShare.toFixed(1)}% of total cost)
• Implicit Costs (Opportunity Costs): ${currency}${calc.implicitCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${calc.implicitShare.toFixed(1)}% of total cost)
• Total Economic Cost (Explicit + Implicit): ${currency}${calc.totalEconomicCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}

PROFITABILITY METRICS:
• Accounting Profit (TR - Explicit): ${currency}${calc.accountingProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${calc.accountingMargin.toFixed(1)}% margin)
• Economic Profit (TR - Explicit - Implicit): ${currency}${calc.economicProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${calc.economicMargin.toFixed(1)}% margin)
• Opportunity Cost Gap (Acct Profit - Econ Profit): ${currency}${calc.implicitCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })}

ECONOMIC VERDICT & DIAGNOSIS:
• Status: ${calc.regimeTitle}
• Directive: ${calc.regimeDescription}

Generated via Toolique Economics Suite (https://www.toolique.in/economics/economic-profit-calculator)
=========================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setMode('simple');
    setSimpleRevenue(350000);
    setSimpleExplicit(200000);
    setSimpleImplicit(110000);
    setItemRevenue(450000);
    setItemWages(120000);
    setItemMaterials(75000);
    setItemRent(36000);
    setItemUtilitiesMarketing(24000);
    setItemTaxesInsurance(15000);
    setItemForgoneSalary(95000);
    setItemForgoneRent(18000);
    setItemInvestedEquity(150000);
    setItemEquityOpportunityRate(8.0);
    setItemNormalProfit(10000);
    setCareerStartupRevenue(280000);
    setCareerStartupExplicit(130000);
    setCareerCorpBaseSalary(120000);
    setCareerCorpBonusBenefits(25000);
    setCareerSavingsInvested(100000);
    setCareerSavingsReturnRate(7.5);
    setEvaOperatingRevenue(2500000);
    setEvaOperatingExpenses(1700000);
    setEvaTaxRate(25);
    setEvaTotalCapital(3000000);
    setEvaWacc(9.5);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* 1. Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Opportunity Cost & Business Presets
              </span>
              <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                Click any benchmark to evaluate true entrepreneurial returns
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <CurrencySelector value={currency} onChange={(sym) => setCurrency(sym)} />
            <button
              onClick={handleCopyProof}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750 transition cursor-pointer shadow-2xs"
              title="Copy full step-by-step mathematical proof"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
              <span>{copied ? 'Proof Copied' : 'Copy Analysis'}</span>
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750 transition cursor-pointer shadow-2xs"
              title="Reset all inputs to default baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-850/60 hover:border-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition text-left group cursor-pointer"
            >
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {p.name}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                {p.category}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="bg-zinc-100 dark:bg-zinc-800/70 p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap gap-1 border border-zinc-200 dark:border-zinc-700/80">
        <button
          onClick={() => setMode('simple')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'simple'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Standard Aggregate (TR, EC, IC)
        </button>

        <button
          onClick={() => setMode('itemized')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'itemized'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Itemized Cost Breakdown
        </button>

        <button
          onClick={() => setMode('career_transition')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'career_transition'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Career Transition Evaluator
        </button>

        <button
          onClick={() => setMode('eva')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'eva'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          EVA & Capital Charge
        </button>
      </div>

      {/* Main Grid: Inputs + Primary Output Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                {mode === 'simple' && 'Standard Revenue & Cost Inputs'}
                {mode === 'itemized' && 'Itemized Resource Allocation'}
                {mode === 'career_transition' && 'Founder vs. Job Comparison'}
                {mode === 'eva' && 'Corporate EVA Parameters'}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">Step 1 of 2</span>
            </div>

            {/* Mode 1: Simple */}
            {mode === 'simple' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Total Business Revenue ({currency}TR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                    <input
                      type="number"
                      step="any"
                      value={simpleRevenue}
                      onChange={(e) => setSimpleRevenue(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Explicit Out-of-Pocket Costs ({currency}EC)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                    <input
                      type="number"
                      step="any"
                      value={simpleExplicit}
                      onChange={(e) => setSimpleExplicit(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">Direct wages, supplier bills, commercial rent, utilities</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Implicit Opportunity Costs ({currency}IC)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                    <input
                      type="number"
                      step="any"
                      value={simpleImplicit}
                      onChange={(e) => setSimpleImplicit(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">Forgone salary, interest on owner savings, self-owned property rent</span>
                </div>
              </div>
            )}

            {/* Mode 2: Itemized */}
            {mode === 'itemized' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Annual Total Revenue ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={itemRevenue}
                    onChange={(e) => setItemRevenue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Explicit Subsection */}
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                    1. Explicit Book Expenses ({currency})
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-zinc-500 mb-0.5">Wages & Labor</label>
                      <input
                        type="number"
                        step="any"
                        value={itemWages}
                        onChange={(e) => setItemWages(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-500 mb-0.5">Raw Materials</label>
                      <input
                        type="number"
                        step="any"
                        value={itemMaterials}
                        onChange={(e) => setItemMaterials(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-zinc-500 mb-0.5">Rent</label>
                      <input
                        type="number"
                        step="any"
                        value={itemRent}
                        onChange={(e) => setItemRent(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-500 mb-0.5">Marketing/Util</label>
                      <input
                        type="number"
                        step="any"
                        value={itemUtilitiesMarketing}
                        onChange={(e) => setItemUtilitiesMarketing(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-500 mb-0.5">Tax/Insurance</label>
                      <input
                        type="number"
                        step="any"
                        value={itemTaxesInsurance}
                        onChange={(e) => setItemTaxesInsurance(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Implicit Subsection */}
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                    2. Implicit Opportunity Costs ({currency})
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-zinc-500 mb-0.5">Forgone Job Salary</label>
                      <input
                        type="number"
                        step="any"
                        value={itemForgoneSalary}
                        onChange={(e) => setItemForgoneSalary(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-500 mb-0.5">Forgone Own Rent</label>
                      <input
                        type="number"
                        step="any"
                        value={itemForgoneRent}
                        onChange={(e) => setItemForgoneRent(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-zinc-500 mb-0.5">Invested Equity ({currency})</label>
                      <input
                        type="number"
                        step="any"
                        value={itemInvestedEquity}
                        onChange={(e) => setItemInvestedEquity(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-500 mb-0.5">Market Return (%)</label>
                      <input
                        type="number"
                        step="any"
                        value={itemEquityOpportunityRate}
                        onChange={(e) => setItemEquityOpportunityRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Career Transition */}
            {mode === 'career_transition' && (
              <div className="space-y-3">
                <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300">
                  <strong>Career Opportunity Test:</strong> Compare starting a venture versus staying in your current corporate role + investing savings in the market.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Startup Revenue ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={careerStartupRevenue}
                      onChange={(e) => setCareerStartupRevenue(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Startup Costs ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={careerStartupExplicit}
                      onChange={(e) => setCareerStartupExplicit(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Corporate Base Salary ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={careerCorpBaseSalary}
                      onChange={(e) => setCareerCorpBaseSalary(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Bonus & Benefits ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={careerCorpBonusBenefits}
                      onChange={(e) => setCareerCorpBonusBenefits(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Personal Savings Invested ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={careerSavingsInvested}
                      onChange={(e) => setCareerSavingsInvested(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Passive Market Rate (%)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={careerSavingsReturnRate}
                      onChange={(e) => setCareerSavingsReturnRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode 4: EVA */}
            {mode === 'eva' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Operating Revenue ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={evaOperatingRevenue}
                      onChange={(e) => setEvaOperatingRevenue(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Operating Expenses ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={evaOperatingExpenses}
                      onChange={(e) => setEvaOperatingExpenses(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-0.5">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="any"
                      value={evaTaxRate}
                      onChange={(e) => setEvaTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-0.5">Capital ({currency})</label>
                    <input
                      type="number"
                      step="any"
                      value={evaTotalCapital}
                      onChange={(e) => setEvaTotalCapital(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-0.5">WACC (%)</label>
                    <input
                      type="number"
                      step="any"
                      value={evaWacc}
                      onChange={(e) => setEvaWacc(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Strategic Regime Directive Callout */}
          <div className={`p-4 rounded-2xl border transition-all ${calc.verdictClass}`}>
            <div className="flex items-center gap-2 mb-1">
              {calc.regime === 'supernormal' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />}
              {calc.regime === 'normal' && <Scale className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />}
              {calc.regime === 'loss' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />}
              <span className="text-xs font-bold uppercase tracking-wider">{calc.regimeTitle}</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {calc.regimeDescription}
            </p>
          </div>
        </div>

        {/* Right Output Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Dual Hero Profit Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Accounting Profit Card */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-lg border border-indigo-500/20 relative overflow-hidden">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-300 block">
                Accounting Profit
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono my-2 text-white">
                {currency}{calc.accountingProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[11px] text-indigo-200/80">
                Total Revenue − Explicit Costs ({currency}{calc.explicitCosts.toLocaleString(undefined, { maximumFractionDigits: 0 })})
              </p>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-indigo-200">
                <span>Book Profit Margin:</span>
                <span className="font-mono font-bold text-white">{calc.accountingMargin.toFixed(1)}%</span>
              </div>
            </div>

            {/* Economic Profit Card */}
            <div className={`bg-gradient-to-br rounded-3xl p-5 text-white shadow-lg border relative overflow-hidden ${
              calc.economicProfit >= 0
                ? 'from-emerald-950 via-teal-950 to-slate-900 border-emerald-500/30'
                : 'from-rose-950 via-slate-950 to-slate-900 border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-300 block">
                  Economic Profit (Pure Rent)
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${calc.badgeClass} bg-black/20`}>
                  {calc.regime.toUpperCase()}
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-black font-mono my-2 text-white">
                {currency}{calc.economicProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[11px] text-emerald-200/80">
                Accounting Profit − Implicit Costs ({currency}{calc.implicitCosts.toLocaleString(undefined, { maximumFractionDigits: 0 })})
              </p>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200">
                <span>True Economic Margin:</span>
                <span className="font-mono font-bold text-white">{calc.economicMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Value Waterfall & Cost Distribution */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
                Revenue to Economic Profit Waterfall Bridge
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">Microeconomic Visualizer</span>
            </div>

            {/* SVG Waterfall Chart */}
            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 540 180" className="w-full h-auto bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 select-none">
                {/* Defs */}
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id="explicitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id="implicitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#be185d" stopOpacity="0.7" />
                  </linearGradient>
                  <linearGradient id="econProfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="0.7" />
                  </linearGradient>
                </defs>

                {/* Grid baseline */}
                <line x1="30" y1="140" x2="510" y2="140" stroke="#71717a" strokeWidth="1" strokeOpacity="0.4" />

                {(() => {
                  const maxBarVal = Math.max(calc.revenue, calc.totalEconomicCost, 100);
                  const scaleY = (val: number) => (Math.min(val, maxBarVal) / maxBarVal) * 110;

                  const revH = scaleY(calc.revenue);
                  const expH = scaleY(calc.explicitCosts);
                  const impH = scaleY(calc.implicitCosts);
                  const econH = scaleY(Math.abs(calc.economicProfit));

                  return (
                    <g>
                      {/* Bar 1: Total Revenue */}
                      <rect x="45" y={140 - revH} width="85" height={revH} fill="url(#revGrad)" rx="6" />
                      <text x="87" y={130 - revH} fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle">
                        {currency}{calc.revenue >= 1000 ? `${(calc.revenue / 1000).toFixed(0)}k` : calc.revenue}
                      </text>
                      <text x="87" y="155" fill="#71717a" fontSize="8" fontWeight="bold" textAnchor="middle">
                        Total Revenue
                      </text>

                      {/* Bar 2: Explicit Costs */}
                      <rect x="165" y={140 - revH} width="85" height={expH} fill="url(#explicitGrad)" rx="6" />
                      <text x="207" y={130 - revH + expH * 0.5} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                        -{currency}{calc.explicitCosts >= 1000 ? `${(calc.explicitCosts / 1000).toFixed(0)}k` : calc.explicitCosts}
                      </text>
                      <text x="207" y="155" fill="#71717a" fontSize="8" fontWeight="bold" textAnchor="middle">
                        Explicit Costs
                      </text>

                      {/* Bar 3: Implicit Opportunity Costs */}
                      <rect x="285" y={140 - (revH - expH)} width="85" height={impH} fill="url(#implicitGrad)" rx="6" />
                      <text x="327" y={130 - (revH - expH) + impH * 0.5} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                        -{currency}{calc.implicitCosts >= 1000 ? `${(calc.implicitCosts / 1000).toFixed(0)}k` : calc.implicitCosts}
                      </text>
                      <text x="327" y="155" fill="#71717a" fontSize="8" fontWeight="bold" textAnchor="middle">
                        Implicit Costs
                      </text>

                      {/* Bar 4: Economic Profit Final */}
                      <rect
                        x="405"
                        y={calc.economicProfit >= 0 ? 140 - econH : 140}
                        width="85"
                        height={econH}
                        fill={calc.economicProfit >= 0 ? 'url(#econProfGrad)' : '#f43f5e'}
                        rx="6"
                      />
                      <text
                        x="447"
                        y={calc.economicProfit >= 0 ? 130 - econH : 155 + econH}
                        fill={calc.economicProfit >= 0 ? '#10b981' : '#f43f5e'}
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {calc.economicProfit >= 0 ? '+' : '-'}{currency}{Math.abs(calc.economicProfit) >= 1000 ? `${(Math.abs(calc.economicProfit) / 1000).toFixed(0)}k` : Math.abs(calc.economicProfit)}
                      </text>
                      <text x="447" y="155" fill="#71717a" fontSize="8" fontWeight="bold" textAnchor="middle">
                        Economic Profit
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Itemized Tables if present */}
            {(calc.explicitItems.length > 1 || calc.implicitItems.length > 1) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-3 border border-zinc-200/60 dark:border-zinc-750">
                  <span className="font-bold text-amber-600 dark:text-amber-400 block mb-2">
                    Explicit Out-of-Pocket Breakdown
                  </span>
                  <div className="space-y-1 font-mono text-[11px]">
                    {calc.explicitItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>{item.label}</span>
                        <span>{currency}{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="pt-1 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-bold text-zinc-900 dark:text-zinc-100">
                      <span>Total Explicit:</span>
                      <span>{currency}{calc.explicitCosts.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-3 border border-zinc-200/60 dark:border-zinc-750">
                  <span className="font-bold text-pink-600 dark:text-pink-400 block mb-2">
                    Implicit Opportunity Cost Breakdown
                  </span>
                  <div className="space-y-1 font-mono text-[11px]">
                    {calc.implicitItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-600 dark:text-zinc-400">
                        <span>{item.label}</span>
                        <span>{currency}{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="pt-1 border-t border-zinc-200 dark:border-zinc-700 flex justify-between font-bold text-zinc-900 dark:text-zinc-100">
                      <span>Total Implicit:</span>
                      <span>{currency}{calc.implicitCosts.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sensitivity Matrix Collapsible */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <button
          onClick={() => setShowSensitivity(!showSensitivity)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Sensitivity Matrix: Revenue Changes vs. Opportunity Cost Variations
            </span>
          </div>
          {showSensitivity ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showSensitivity && (
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Evaluates true Economic Profit across relative shifts in total revenue (Rows: ±20%) and implicit opportunity costs (Columns: ±20%).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                    <th className="p-2 text-left font-semibold text-zinc-500 dark:text-zinc-400">Revenue Shift \ Implicit Shift</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">-20% Opp Cost</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">-10% Opp Cost</th>
                    <th className="p-2 font-mono font-bold text-emerald-600 dark:text-emerald-400">Base Opp ({currency}{calc.implicitCosts.toLocaleString(undefined, { maximumFractionDigits: 0 })})</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">+10% Opp Cost</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">+20% Opp Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                  {sensitivityMatrix.map((row, rIdx) => (
                    <tr key={rIdx} className={row.rMult === 1.0 ? 'bg-emerald-500/5 font-semibold' : ''}>
                      <td className="p-2 text-left font-sans font-medium text-zinc-700 dark:text-zinc-300">
                        {row.rMult === 1.0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            Base Rev ({currency}{row.rowRev.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                          </span>
                        ) : (
                          `${row.rMult > 1.0 ? '+' : ''}${Math.round((row.rMult - 1.0) * 100)}% (${currency}${row.rowRev.toLocaleString(undefined, { maximumFractionDigits: 0 })})`
                        )}
                      </td>
                      {row.cols.map((col, cIdx) => (
                        <td
                          key={cIdx}
                          className={`p-2 ${
                            col.rMult === 1.0 && col.iMult === 1.0
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg'
                              : col.econProfit >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          <div>{col.econProfit >= 0 ? '+' : ''}{currency}{col.econProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                          <div className="text-[10px] text-zinc-400 font-sans">Acct: {currency}{col.acctProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Mathematical Proof & Formulas Collapsible */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <button
          onClick={() => setShowProof(!showProof)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Formal Economic Proof & Mathematical Derivations
            </span>
          </div>
          {showProof ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showProof && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                  1. Definitions of Profit
                </h4>
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 text-[11px] space-y-1">
                  <div>Accounting Profit = Total Revenue − Explicit Costs</div>
                  <div>Economic Cost = Explicit Costs + Implicit Costs</div>
                  <div>Economic Profit = Total Revenue − Economic Cost</div>
                </div>
                <p>
                  Accounting profit records historical, explicit ledger expenses. Economic profit accounts for the opportunity cost of all owner-supplied factors of production.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                  2. Long-Run Equilibrium Condition
                </h4>
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 text-[11px] space-y-1">
                  <div>Zero Economic Profit (π_econ = 0) ⇔ Normal Profit</div>
                  <div>Accounting Profit = Implicit Opportunity Costs</div>
                </div>
                <p>
                  In perfectly competitive markets, entry and exit forces long-run economic profit to zero, ensuring factors of production earn their exact opportunity return.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Active Calculation Verification Proof
              </h4>
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-800 dark:text-zinc-200 space-y-1.5">
                <div>• Total Revenue (TR): {currency}{calc.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div>• Explicit Costs (EC): {currency}{calc.explicitCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div>• Accounting Profit (TR - EC): {currency}{calc.accountingProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div>• Implicit Costs (IC): {currency}{calc.implicitCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div>• Total Economic Cost (EC + IC): {currency}{calc.totalEconomicCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className="pt-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  • Economic Profit (TR - EC - IC): {currency}{calc.economicProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Academic Guide & Educational FAQ */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-500" />
            Complete Guide: Economic Profit, Normal Profit & Entrepreneurial Decision-Making
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Why positive book profits can still mean losing money in real economic terms.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              1. Explicit vs Implicit Costs
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Explicit costs</strong> involve tangible cash leaving bank accounts (payroll, materials, rent). <strong>Implicit costs</strong> represent the value of forgone opportunities (such as the corporate salary the owner gave up or interest that invested capital could have earned in a safe fund).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              2. The Meaning of Normal Profit
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              When <strong>Economic Profit is zero</strong>, the business is actually doing fine! It means the entrepreneur is making exactly the same amount of total income as their next-best opportunity. Economists call this <em>Normal Profit</em>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              3. Supernormal Profit & Market Signals
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Supernormal profit</strong> (positive economic profit) signals that an industry generates above-average returns. In free competitive markets, this attracts new competitors, increasing industry supply and eroding profits back to normal equilibrium over time.
            </p>
          </div>
        </div>

        {/* Accordion FAQ */}
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3">
            Frequently Asked Questions (FAQ)
          </h3>

          {[
            {
              q: 'Can a company have positive accounting profit but negative economic profit?',
              a: 'Yes, very frequently! If a boutique business nets $70,000 in accounting profit, but the owner gave up a $110,000 corporate job and $10,000 in investment interest to run it, the economic profit is -$50,000. In real wealth terms, the founder is $50,000 poorer per year.'
            },
            {
              q: 'Why do accountants ignore implicit opportunity costs?',
              a: 'Accountants follow GAAP/IFRS standards designed for tax calculation and verifiable historical record-keeping. Opportunity costs are hypothetical, subjective, and lack invoices or bank statements, making them unsuitable for formal accounting audits.'
            },
            {
              q: 'What is the difference between Economic Profit and Economic Value Added (EVA)?',
              a: 'EVA is the corporate finance adaptation of economic profit developed by Stern Stewart & Co. EVA = NOPAT − (Invested Capital × WACC). It measures whether a corporate division generates returns above the weighted cost of equity and debt capital.'
            },
            {
              q: 'Should a business shut down if economic profit is zero?',
              a: 'No! Zero economic profit means all resources—including the owner’s labor, management time, and capital investment—are earning exactly their fair market alternative rate. It is the steady-state equilibrium of healthy competitive markets.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <span>{item.q}</span>
                {activeFaq === idx ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>
              {activeFaq === idx && (
                <div className="p-3.5 pt-0 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-800/20 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
