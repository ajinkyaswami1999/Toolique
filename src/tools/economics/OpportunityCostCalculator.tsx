import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2, Info,
  ShieldCheck, Sliders, ChevronDown, ChevronUp,
  Calculator, ArrowRight, Compass,
  CheckCircle2, AlertCircle,
  GraduationCap, LineChart, Building
} from 'lucide-react';

type CalculationMode = 'simple' | 'compounded' | 'career_education' | 'multi_asset';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  chosenReturn: number;
  forgoneReturn: number;
  initialPrincipal: number;
  chosenRate: number;
  forgoneRate: number;
  years: number;
  upfrontCost: number;
  forgoneAnnualSalary: number;
  futureSalaryBoost: number;
  notes: string;
  expectedVerdict: string;
}

export default function OpportunityCostCalculator() {
  // Mode state
  const [mode, setMode] = useState<CalculationMode>('simple');
  const [currency, setCurrency] = useState<string>('$');

  // Mode 1: Simple Inputs
  const [simpleChosen, setSimpleChosen] = useState<number>(125000);
  const [simpleForgone, setSimpleForgone] = useState<number>(95000);

  // Mode 2: Multi-Year Compounded Investment Inputs
  const [compPrincipal, setCompPrincipal] = useState<number>(100000);
  const [compChosenRate, setCompChosenRate] = useState<number>(11.5); // 11.5% Chosen ROI
  const [compForgoneRate, setCompForgoneRate] = useState<number>(8.0); // 8.0% Benchmark (e.g. S&P 500)
  const [compYears, setCompYears] = useState<number>(10);
  const [compAnnualContribution, setCompAnnualContribution] = useState<number>(5000);

  // Mode 3: Career & Education Investment Evaluator
  const [eduUpfrontCost, setEduUpfrontCost] = useState<number>(120000);
  const [eduDurationYears, setEduDurationYears] = useState<number>(2);
  const [eduCurrentSalary, setEduCurrentSalary] = useState<number>(85000);
  const [eduProjectedSalary, setEduProjectedSalary] = useState<number>(155000);
  const [eduCareerHorizonYears, setEduCareerHorizonYears] = useState<number>(15);

  // Mode 4: Multi-Asset Capital Ranking
  const [asset1Name, setAsset1Name] = useState<string>('Option A: Growth Tech Fund');
  const [asset1Return, setAsset1Return] = useState<number>(145000);
  const [asset2Name, setAsset2Name] = useState<string>('Option B: Commercial Real Estate');
  const [asset2Return, setAsset2Return] = useState<number>(120000);
  const [asset3Name, setAsset3Name] = useState<string>('Option C: High-Yield Treasury Bond');
  const [asset3Return, setAsset3Return] = useState<number>(85000);
  const [asset4Name, setAsset4Name] = useState<string>('Option D: Retail Franchise Venture');
  const [asset4Return, setAsset4Return] = useState<number>(165000);
  const [selectedAssetIdx, setSelectedAssetIdx] = useState<number>(3); // Option D chosen

  // UI States
  const [copied, setCopied] = useState(false);
  const [showProof, setShowProof] = useState(true);
  const [showSensitivity, setShowSensitivity] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // 6 Real-World Industry Presets
  const presets: PresetScenario[] = [
    {
      name: '🎓 Full-Time MBA vs Staying at Job',
      category: 'Higher Education & Career',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      mode: 'career_education',
      chosenReturn: 0,
      forgoneReturn: 0,
      initialPrincipal: 0,
      chosenRate: 0,
      forgoneRate: 0,
      years: 15,
      upfrontCost: 140000,
      forgoneAnnualSalary: 90000,
      futureSalaryBoost: 75000,
      notes: '$140k tuition + 2 yrs of $90k forgone salary ($320k total cost) pays off via $75k annual post-grad salary uplift in ~4.3 years.',
      expectedVerdict: 'Net Career Payoff: +$655k over 15 yrs'
    },
    {
      name: '🏠 Real Estate Rental vs S&P 500',
      category: 'Long-Term Asset Compounding',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      mode: 'compounded',
      chosenReturn: 0,
      forgoneReturn: 0,
      initialPrincipal: 150000,
      chosenRate: 8.5,
      forgoneRate: 10.2,
      years: 15,
      upfrontCost: 0,
      forgoneAnnualSalary: 0,
      futureSalaryBoost: 0,
      notes: 'Active real estate yields 8.5% net of maintenance, whereas passive index fund compounding at 10.2% produces a $112k opportunity gap.',
      expectedVerdict: 'Opportunity Drag: -$112k vs Index Funds'
    },
    {
      name: '🚀 Startup Founder vs FAANG Director',
      category: 'Entrepreneurial Opportunity Cost',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      mode: 'simple',
      chosenReturn: 750000,
      forgoneReturn: 600000,
      initialPrincipal: 0,
      chosenRate: 0,
      forgoneRate: 0,
      years: 3,
      upfrontCost: 0,
      forgoneAnnualSalary: 0,
      futureSalaryBoost: 0,
      notes: 'Expected 3-year startup exit payout ($750k) outweighs 3 years of guaranteed director compensation ($600k total).',
      expectedVerdict: 'Net Opportunity Surplus: +$150,000'
    },
    {
      name: '🏭 Factory Automation vs Debt Paydown',
      category: 'Corporate Capital Allocation',
      badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      mode: 'compounded',
      chosenReturn: 0,
      forgoneReturn: 0,
      initialPrincipal: 500000,
      chosenRate: 14.0,
      forgoneRate: 6.5,
      years: 7,
      upfrontCost: 0,
      forgoneAnnualSalary: 0,
      futureSalaryBoost: 0,
      notes: 'Deploying $500k into robotic assembly lines (14% IRR) creates massive surplus over paying down 6.5% commercial debt.',
      expectedVerdict: 'Net Value Creation: +$476,000'
    },
    {
      name: '🚗 Buying New Luxury EV vs Index Fund',
      category: 'Consumer Lifestyle Tradeoff',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      mode: 'compounded',
      chosenReturn: 0,
      forgoneReturn: 0,
      initialPrincipal: 45000,
      chosenRate: -12.0, // 12% annual depreciation
      forgoneRate: 9.0, // 9% market return
      years: 8,
      upfrontCost: 0,
      forgoneAnnualSalary: 0,
      futureSalaryBoost: 0,
      notes: 'Spending an extra $45k on luxury car depreciation (-12%/yr) vs investing at 9% creates an $73k wealth disparity over 8 years.',
      expectedVerdict: 'Compounded Opportunity Loss: -$73,800'
    },
    {
      name: '💳 Mortgage Prepayment vs Market Return',
      category: 'Personal Finance Optimization',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      mode: 'compounded',
      chosenReturn: 0,
      forgoneReturn: 0,
      initialPrincipal: 80000,
      chosenRate: 4.0, // Guaranteed 4% interest saved
      forgoneRate: 8.5, // 8.5% expected stock market
      years: 12,
      upfrontCost: 0,
      forgoneAnnualSalary: 0,
      futureSalaryBoost: 0,
      notes: 'Prepaying low 4.0% mortgage guarantees peace of mind, but forgoes 8.5% market gains ($84k opportunity gap over 12 yrs).',
      expectedVerdict: 'Forgone Market Opportunity: -$84,600'
    }
  ];

  const handleApplyPreset = (preset: PresetScenario) => {
    setMode(preset.mode);
    if (preset.mode === 'simple') {
      setSimpleChosen(preset.chosenReturn);
      setSimpleForgone(preset.forgoneReturn);
    } else if (preset.mode === 'compounded') {
      setCompPrincipal(preset.initialPrincipal);
      setCompChosenRate(preset.chosenRate);
      setCompForgoneRate(preset.forgoneRate);
      setCompYears(preset.years);
      setCompAnnualContribution(0);
    } else if (preset.mode === 'career_education') {
      setEduUpfrontCost(preset.upfrontCost);
      setEduDurationYears(2);
      setEduCurrentSalary(preset.forgoneAnnualSalary);
      setEduProjectedSalary(preset.forgoneAnnualSalary + preset.futureSalaryBoost);
      setEduCareerHorizonYears(preset.years);
    }
  };

  // Comprehensive Calculation Engine
  const calc = useMemo(() => {
    let chosenVal = 0;
    let forgoneVal = 0;
    let netDifference = 0;
    let roiRatio = 0;

    if (mode === 'simple') {
      chosenVal = simpleChosen;
      forgoneVal = simpleForgone;
      netDifference = chosenVal - forgoneVal;
      roiRatio = forgoneVal > 0 ? ((chosenVal - forgoneVal) / forgoneVal) * 100 : 0;

    } else if (mode === 'compounded') {
      const rA = compChosenRate / 100;
      const rB = compForgoneRate / 100;
      const n = compYears;

      // Future value with annual contributions
      // FV = P * (1+r)^n + PMT * [((1+r)^n - 1) / r]
      const fvA = compPrincipal * Math.pow(1 + rA, n) + (rA !== 0 ? compAnnualContribution * ((Math.pow(1 + rA, n) - 1) / rA) : compAnnualContribution * n);
      const fvB = compPrincipal * Math.pow(1 + rB, n) + (rB !== 0 ? compAnnualContribution * ((Math.pow(1 + rB, n) - 1) / rB) : compAnnualContribution * n);

      chosenVal = fvA;
      forgoneVal = fvB;
      netDifference = chosenVal - forgoneVal;
      roiRatio = forgoneVal > 0 ? (netDifference / forgoneVal) * 100 : 0;

    } else if (mode === 'career_education') {
      // Total Investment = Tuition + (Duration * Forgone Salary)
      const totalInvestment = eduUpfrontCost + eduDurationYears * eduCurrentSalary;
      const annualUplift = Math.max(0, eduProjectedSalary - eduCurrentSalary);
      const activeWorkingYears = Math.max(1, eduCareerHorizonYears - eduDurationYears);
      const cumulativeUplift = annualUplift * activeWorkingYears;

      chosenVal = cumulativeUplift;
      forgoneVal = totalInvestment;
      netDifference = cumulativeUplift - totalInvestment;
      roiRatio = totalInvestment > 0 ? (netDifference / totalInvestment) * 100 : 0;

    } else if (mode === 'multi_asset') {
      const assets = [
        { id: 0, name: asset1Name, value: asset1Return },
        { id: 1, name: asset2Name, value: asset2Return },
        { id: 2, name: asset3Name, value: asset3Return },
        { id: 3, name: asset4Name, value: asset4Return },
      ];

      const chosenAsset = assets[selectedAssetIdx] || assets[0];
      chosenVal = chosenAsset.value;

      // Best forgone is the highest value among the non-selected options
      const otherAssets = assets.filter((_, idx) => idx !== selectedAssetIdx);
      const bestForgone = otherAssets.reduce((max, a) => (a.value > max.value ? a : max), otherAssets[0]);

      forgoneVal = bestForgone ? bestForgone.value : 0;
      netDifference = chosenVal - forgoneVal;
      roiRatio = forgoneVal > 0 ? (netDifference / forgoneVal) * 100 : 0;
    }

    const opportunityCost = forgoneVal;

    // Decision Verdict & Diagnostic Tone
    let verdictTitle = '';
    let verdictDescription = '';
    let verdictClass = '';
    let badgeClass = '';

    if (netDifference > 500) {
      verdictTitle = 'Economically Superior Choice (Positive Net Opportunity Value)';
      verdictDescription = `The chosen decision creates ${currency}${netDifference.toLocaleString(undefined, { maximumFractionDigits: 0 })} in surplus value above the best forgone alternative (+${roiRatio.toFixed(1)}% advantage). Capital and time are allocated efficiently.`;
      verdictClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    } else if (Math.abs(netDifference) <= 500) {
      verdictTitle = 'Opportunity Neutral (Economic Indifference)';
      verdictDescription = `Both the chosen option and the next-best alternative yield identical economic returns (Net Difference ≈ 0). Selection depends entirely on qualitative non-financial preferences.`;
      verdictClass = 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800';
      badgeClass = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    } else {
      verdictTitle = 'Sub-Optimal Opportunity Cost (Opportunity Drag)';
      verdictDescription = `The chosen option underperforms the best forgone alternative by ${currency}${Math.abs(netDifference).toLocaleString(undefined, { maximumFractionDigits: 0 })} (${roiRatio.toFixed(1)}% opportunity loss). Reallocating capital or time to the benchmark alternative generates higher wealth.`;
      verdictClass = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
      badgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }

    return {
      chosenVal,
      forgoneVal,
      opportunityCost,
      netDifference,
      roiRatio,
      verdictTitle,
      verdictDescription,
      verdictClass,
      badgeClass
    };
  }, [mode, simpleChosen, simpleForgone, compPrincipal, compChosenRate, compForgoneRate, compYears, compAnnualContribution, eduUpfrontCost, eduDurationYears, eduCurrentSalary, eduProjectedSalary, eduCareerHorizonYears, asset1Name, asset1Return, asset2Name, asset2Return, asset3Name, asset3Return, asset4Name, asset4Return, selectedAssetIdx, currency]);

  // Compounded Multi-Year Projection (Years 1 to 10/15)
  const projectionSchedule = useMemo(() => {
    const horizon = mode === 'compounded' ? Math.min(25, Math.max(5, compYears)) : (mode === 'career_education' ? Math.min(25, eduCareerHorizonYears) : 10);
    const yearsArr = Array.from({ length: horizon }, (_, i) => i + 1);

    const rA = mode === 'compounded' ? compChosenRate / 100 : (calc.roiRatio > 0 ? 0.10 : 0.06);
    const rB = mode === 'compounded' ? compForgoneRate / 100 : 0.08;
    const p0 = mode === 'compounded' ? compPrincipal : calc.forgoneVal;

    return yearsArr.map((yr) => {
      let valA = 0;
      let valB = 0;

      if (mode === 'compounded') {
        valA = p0 * Math.pow(1 + rA, yr) + (rA !== 0 ? compAnnualContribution * ((Math.pow(1 + rA, yr) - 1) / rA) : compAnnualContribution * yr);
        valB = p0 * Math.pow(1 + rB, yr) + (rB !== 0 ? compAnnualContribution * ((Math.pow(1 + rB, yr) - 1) / rB) : compAnnualContribution * yr);
      } else if (mode === 'career_education') {
        const annualUplift = Math.max(0, eduProjectedSalary - eduCurrentSalary);
        const activeYears = Math.max(0, yr - eduDurationYears);
        valA = activeYears * annualUplift;
        valB = eduUpfrontCost + Math.min(yr, eduDurationYears) * eduCurrentSalary;
      } else {
        // Mode 1 or 4 linear step
        valA = (calc.chosenVal / 10) * yr;
        valB = (calc.forgoneVal / 10) * yr;
      }

      const netGap = valA - valB;

      return {
        year: yr,
        chosenVal: valA,
        forgoneVal: valB,
        netGap,
        isAdvantage: netGap >= 0
      };
    });
  }, [mode, compYears, eduCareerHorizonYears, compChosenRate, compForgoneRate, compPrincipal, compAnnualContribution, eduProjectedSalary, eduCurrentSalary, eduDurationYears, eduUpfrontCost, calc.roiRatio, calc.forgoneVal, calc.chosenVal]);

  // Sensitivity Matrix: Chosen Return Shift vs Forgone Benchmark Shift
  const sensitivityMatrix = useMemo(() => {
    const chosenMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2];
    const forgoneMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2];
    const baseChosen = calc.chosenVal;
    const baseForgone = calc.forgoneVal;

    return chosenMultipliers.map((cMult) => {
      const rowChosen = baseChosen * cMult;
      const rowCols = forgoneMultipliers.map((fMult) => {
        const colForgone = baseForgone * fMult;
        const diff = rowChosen - colForgone;
        return {
          cMult,
          fMult,
          rowChosen,
          colForgone,
          diff
        };
      });
      return { cMult, rowChosen, cols: rowCols };
    });
  }, [calc.chosenVal, calc.forgoneVal]);

  // Copy Full Proof Handler
  const handleCopyProof = () => {
    const text = `=========================================
Opportunity Cost & Capital Tradeoff Analysis
=========================================
Value / Return of Chosen Option: ${currency}${calc.chosenVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Opportunity Cost (Best Forgone Alternative): ${currency}${calc.opportunityCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}

ECONOMIC TRADEOFF RESULTS:
• Net Opportunity Value (Chosen - Forgone): ${calc.netDifference >= 0 ? '+' : ''}${currency}${calc.netDifference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• Relative Advantage / Gap: ${calc.roiRatio >= 0 ? '+' : ''}${calc.roiRatio.toFixed(2)}%
• Decision Verdict: ${calc.verdictTitle}
• Directive: ${calc.verdictDescription}

Generated via Toolique Economics Suite (https://www.toolique.in/economics/opportunity-cost-calculator)
=========================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setMode('simple');
    setSimpleChosen(125000);
    setSimpleForgone(95000);
    setCompPrincipal(100000);
    setCompChosenRate(11.5);
    setCompForgoneRate(8.0);
    setCompYears(10);
    setCompAnnualContribution(5000);
    setEduUpfrontCost(120000);
    setEduDurationYears(2);
    setEduCurrentSalary(85000);
    setEduProjectedSalary(155000);
    setEduCareerHorizonYears(15);
    setSelectedAssetIdx(3);
  };

  // SVG Trajectory Graph Calculations
  const lastRow = projectionSchedule[projectionSchedule.length - 1] || { chosenVal: 100, forgoneVal: 100 };
  const maxPlotVal = Math.max(lastRow.chosenVal, lastRow.forgoneVal, 1000) * 1.15;
  const numSteps = projectionSchedule.length;

  const getSvgX = (stepIdx: number) => {
    return 60 + (stepIdx / Math.max(1, numSteps - 1)) * 460;
  };

  const getSvgY = (val: number) => {
    const clamped = Math.max(0, Math.min(val, maxPlotVal));
    return 200 - (clamped / maxPlotVal) * 170;
  };

  const chosenPath = projectionSchedule.reduce((acc, pt, idx) => {
    const x = getSvgX(idx);
    const y = getSvgY(pt.chosenVal);
    return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, '');

  const forgonePath = projectionSchedule.reduce((acc, pt, idx) => {
    const x = getSvgX(idx);
    const y = getSvgY(pt.forgoneVal);
    return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, '');

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* 1. Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Real-World Tradeoff & Opportunity Presets
              </span>
              <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                Click any scenario to load benchmark financial comparisons
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
              className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-850/60 hover:border-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-950/30 transition text-left group cursor-pointer"
            >
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
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
              ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Direct Option Pair (A vs B)
        </button>

        <button
          onClick={() => setMode('compounded')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'compounded'
              ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <LineChart className="w-3.5 h-3.5" />
          Compounded Investment Horizon
        </button>

        <button
          onClick={() => setMode('career_education')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'career_education'
              ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Education / Career Tradeoff
        </button>

        <button
          onClick={() => setMode('multi_asset')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'multi_asset'
              ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          Multi-Asset Capital Ranking
        </button>
      </div>

      {/* Main Grid: Inputs + Primary Output Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                {mode === 'simple' && 'Two-Option Payoff Comparison'}
                {mode === 'compounded' && 'Compounded Rates & Horizon'}
                {mode === 'career_education' && 'Degree & Career Parameters'}
                {mode === 'multi_asset' && 'Rank Competing Capital Assets'}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">Step 1 of 2</span>
            </div>

            {/* Mode 1: Simple Pair */}
            {mode === 'simple' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Value / Return of Chosen Option ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                    <input
                      type="number"
                      step="any"
                      value={simpleChosen}
                      onChange={(e) => setSimpleChosen(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Value / Return of Best Forgone Alternative ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                    <input
                      type="number"
                      step="any"
                      value={simpleForgone}
                      onChange={(e) => setSimpleForgone(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">This represents your Opportunity Cost.</span>
                </div>
              </div>
            )}

            {/* Mode 2: Compounded Investment */}
            {mode === 'compounded' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Initial Capital Invested ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={compPrincipal}
                    onChange={(e) => setCompPrincipal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Chosen Option Return (%)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={compChosenRate}
                      onChange={(e) => setCompChosenRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Benchmark Forgone (%)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={compForgoneRate}
                      onChange={(e) => setCompForgoneRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Time Horizon (Years)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={compYears}
                      onChange={(e) => setCompYears(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Annual Addition ({currency}/yr)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={compAnnualContribution}
                      onChange={(e) => setCompAnnualContribution(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Career & Education */}
            {mode === 'career_education' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Upfront Tuition / Costs ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={eduUpfrontCost}
                      onChange={(e) => setEduUpfrontCost(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Program Duration (Years)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={eduDurationYears}
                      onChange={(e) => setEduDurationYears(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Current Forgone Salary ({currency}/yr)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={eduCurrentSalary}
                      onChange={(e) => setEduCurrentSalary(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Projected Post-Degree ({currency}/yr)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={eduProjectedSalary}
                      onChange={(e) => setEduProjectedSalary(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Career Time Horizon (Years)
                  </label>
                  <input
                    type="number"
                    value={eduCareerHorizonYears}
                    onChange={(e) => setEduCareerHorizonYears(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Mode 4: Multi-Asset Ranking */}
            {mode === 'multi_asset' && (
              <div className="space-y-3">
                <p className="text-[11px] text-zinc-500">
                  Select which asset/project you decide to choose. The calculator will automatically evaluate it against the <strong>highest-yielding forgone option</strong>.
                </p>

                {[
                  { name: asset1Name, setName: setAsset1Name, ret: asset1Return, setRet: setAsset1Return, idx: 0 },
                  { name: asset2Name, setName: setAsset2Name, ret: asset2Return, setRet: setAsset2Return, idx: 1 },
                  { name: asset3Name, setName: setAsset3Name, ret: asset3Return, setRet: setAsset3Return, idx: 2 },
                  { name: asset4Name, setName: setAsset4Name, ret: asset4Return, setRet: setAsset4Return, idx: 3 }
                ].map((item) => (
                  <div
                    key={item.idx}
                    className={`p-2.5 rounded-xl border transition-all ${
                      selectedAssetIdx === item.idx
                        ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/30'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => item.setName(e.target.value)}
                        className="text-xs font-bold bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-amber-500 focus:outline-none w-2/3"
                      />
                      <button
                        onClick={() => setSelectedAssetIdx(item.idx)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                          selectedAssetIdx === item.idx
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-amber-400'
                        }`}
                      >
                        {selectedAssetIdx === item.idx ? '✓ Chosen Path' : 'Select'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Total Return:</span>
                      <input
                        type="number"
                        step="any"
                        value={item.ret}
                        onChange={(e) => item.setRet(parseFloat(e.target.value) || 0)}
                        className="flex-1 px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strategic Decision Verdict Directive Callout */}
          <div className={`p-4 rounded-2xl border transition-all ${calc.verdictClass}`}>
            <div className="flex items-center gap-2 mb-1">
              {calc.netDifference > 500 && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />}
              {Math.abs(calc.netDifference) <= 500 && <ShieldCheck className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />}
              {calc.netDifference < -500 && <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />}
              <span className="text-xs font-bold uppercase tracking-wider">{calc.verdictTitle}</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {calc.verdictDescription}
            </p>
          </div>
        </div>

        {/* Right Output Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Dual Hero Tradeoff Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Opportunity Cost (Best Forgone) Card */}
            <div className="bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 rounded-3xl p-5 text-white shadow-lg border border-amber-500/20 relative overflow-hidden">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-300 block">
                Opportunity Cost (Forgone)
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono my-2 text-white">
                {currency}{calc.opportunityCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[11px] text-amber-200/80">
                The total value of the best alternative given up
              </p>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-amber-200">
                <span>Chosen Return:</span>
                <span className="font-mono font-bold text-white">{currency}{calc.chosenVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {/* Net Opportunity Value Card */}
            <div className={`bg-gradient-to-br rounded-3xl p-5 text-white shadow-lg border relative overflow-hidden ${
              calc.netDifference >= 0
                ? 'from-emerald-950 via-teal-950 to-slate-900 border-emerald-500/30'
                : 'from-rose-950 via-slate-950 to-slate-900 border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-300 block">
                  Net Opportunity Value (ΔV)
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${calc.badgeClass} bg-black/20`}>
                  {calc.roiRatio >= 0 ? `+${calc.roiRatio.toFixed(1)}%` : `${calc.roiRatio.toFixed(1)}%`}
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-black font-mono my-2 text-white">
                {calc.netDifference >= 0 ? '+' : ''}{currency}{calc.netDifference.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[11px] text-emerald-200/80">
                Value Created Above Next-Best Benchmark
              </p>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200">
                <span>Decision Surplus:</span>
                <span className="font-mono font-bold text-white">
                  {calc.netDifference >= 0 ? 'Superior Allocation' : 'Opportunity Loss'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Continuous SVG Trajectory / Comparison Chart */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-amber-500" />
                Multi-Year Wealth Trajectory & Opportunity Gap
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">Comparative Projection</span>
            </div>

            {/* SVG Visualizer */}
            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 540 220" className="w-full h-auto max-h-[240px] bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 select-none">
                {/* Defs */}
                <defs>
                  <linearGradient id="oppSurplusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid baseline */}
                <line x1="60" y1="20" x2="60" y2="200" stroke="#71717a" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="60" y1="200" x2="520" y2="200" stroke="#71717a" strokeWidth="1.5" strokeOpacity="0.4" />

                {/* Forgone Benchmark Line (Amber / Pink) */}
                <path d={forgonePath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 2" />

                {/* Chosen Option Line (Emerald / Blue) */}
                <path d={chosenPath} fill="none" stroke="#10b981" strokeWidth="3" />

                {/* End Point Markers */}
                {projectionSchedule.length > 0 && (
                  <g>
                    <circle
                      cx={getSvgX(projectionSchedule.length - 1)}
                      cy={getSvgY(lastRow.chosenVal)}
                      r="5"
                      fill="#10b981"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <circle
                      cx={getSvgX(projectionSchedule.length - 1)}
                      cy={getSvgY(lastRow.forgoneVal)}
                      r="5"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {/* Labels */}
                <text x="70" y="35" fill="#10b981" fontSize="9" fontWeight="bold">
                  Chosen Decision: {currency}{lastRow.chosenVal >= 1000 ? `${(lastRow.chosenVal / 1000).toFixed(0)}k` : lastRow.chosenVal.toFixed(0)}
                </text>
                <text x="70" y="50" fill="#f59e0b" fontSize="9" fontWeight="bold">
                  Forgone Alternative (OC): {currency}{lastRow.forgoneVal >= 1000 ? `${(lastRow.forgoneVal / 1000).toFixed(0)}k` : lastRow.forgoneVal.toFixed(0)}
                </text>
                <text x="510" y="212" fill="#71717a" fontSize="8" fontWeight="bold" textAnchor="end">
                  Horizon End
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Chosen Option Trajectory
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  Best Forgone Benchmark (<span className="font-mono">OC</span>)
                </span>
              </div>
              <span className="text-zinc-400 italic">Opportunity Gap = Chosen − Forgone</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Year Timeline Schedule Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-amber-500" />
              Year-by-Year Opportunity Cost Projection Schedule
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Cumulative financial tracking comparing the chosen route against the forgone alternative.
            </p>
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
            {projectionSchedule.length} Timeline Steps Modeled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold bg-zinc-50/50 dark:bg-zinc-800/30">
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Chosen Option Value ({currency})</th>
                <th className="py-2.5 px-3">Forgone Alternative (OC) ({currency})</th>
                <th className="py-2.5 px-3">Net Opportunity Gap (ΔV)</th>
                <th className="py-2.5 px-3">Economic Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
              {projectionSchedule.map((row) => (
                <tr
                  key={row.year}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  <td className="py-2.5 px-3 font-sans font-bold">Year {row.year}</td>
                  <td className="py-2.5 px-3">{currency}{row.chosenVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="py-2.5 px-3">{currency}{row.forgoneVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className={`py-2.5 px-3 font-bold ${row.netGap >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {row.netGap >= 0 ? '+' : ''}{currency}{row.netGap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      row.isAdvantage
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
                    }`}>
                      {row.isAdvantage ? 'Surplus (+)' : 'Opportunity Drag (−)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensitivity Matrix Collapsible */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <button
          onClick={() => setShowSensitivity(!showSensitivity)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Sensitivity Matrix: Chosen Return vs. Forgone Alternative Return
            </span>
          </div>
          {showSensitivity ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showSensitivity && (
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Evaluates Net Opportunity Value (<span className="font-mono">ΔV</span>) across relative performance shifts in the chosen path (Rows: ±20%) vs alternative options (Columns: ±20%).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                    <th className="p-2 text-left font-semibold text-zinc-500 dark:text-zinc-400">Chosen Shift \ Forgone Shift</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">-20% Forgone</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">-10% Forgone</th>
                    <th className="p-2 font-mono font-bold text-amber-600 dark:text-amber-400">Base OC ({currency}{calc.forgoneVal.toLocaleString(undefined, { maximumFractionDigits: 0 })})</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">+10% Forgone</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">+20% Forgone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                  {sensitivityMatrix.map((row, rIdx) => (
                    <tr key={rIdx} className={row.cMult === 1.0 ? 'bg-amber-500/5 font-semibold' : ''}>
                      <td className="p-2 text-left font-sans font-medium text-zinc-700 dark:text-zinc-300">
                        {row.cMult === 1.0 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            Base Chosen ({currency}{row.rowChosen.toLocaleString(undefined, { maximumFractionDigits: 0 })})
                          </span>
                        ) : (
                          `${row.cMult > 1.0 ? '+' : ''}${Math.round((row.cMult - 1.0) * 100)}% (${currency}${row.rowChosen.toLocaleString(undefined, { maximumFractionDigits: 0 })})`
                        )}
                      </td>
                      {row.cols.map((col, cIdx) => (
                        <td
                          key={cIdx}
                          className={`p-2 ${
                            col.cMult === 1.0 && col.fMult === 1.0
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold rounded-lg'
                              : col.diff >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          <div>{col.diff >= 0 ? '+' : ''}{currency}{col.diff.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
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
            <Calculator className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Formal Opportunity Cost Proof & Derivations
            </span>
          </div>
          {showProof ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showProof && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  1. Fundamental Opportunity Cost Identity
                </h4>
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 text-[11px] space-y-1">
                  <div>Opportunity Cost (OC) = Return(Best Forgone Alternative)</div>
                  <div>Net Opportunity Value (ΔV) = Return(Chosen) − OC</div>
                </div>
                <p>
                  Opportunity cost measures only the single most valuable alternative given up—not the cumulative sum of all possible options.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                  2. Compound Time-Value Opportunity Formula
                </h4>
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 text-[11px] space-y-1">
                  <div>FV_Chosen = P₀(1 + r_A)ⁿ + PMT·[((1+r_A)ⁿ - 1)/r_A]</div>
                  <div>FV_Forgone = P₀(1 + r_B)ⁿ + PMT·[((1+r_B)ⁿ - 1)/r_B]</div>
                </div>
                <p>
                  Over long horizons, small differences in return percentages compound exponentially, creating substantial wealth gaps.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                Active Calculation Verification Proof
              </h4>
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-800 dark:text-zinc-200 space-y-1.5">
                <div>• Chosen Return: {currency}{calc.chosenVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div>• Opportunity Cost (Forgone Return): {currency}{calc.opportunityCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className="pt-1 text-amber-600 dark:text-amber-400 font-bold">
                  • Net Decision Surplus (ΔV): {calc.netDifference >= 0 ? '+' : ''}{currency}{calc.netDifference.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({calc.roiRatio >= 0 ? '+' : ''}${calc.roiRatio.toFixed(2)}%)
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
            <Info className="w-5 h-5 text-amber-500" />
            Complete Guide: Opportunity Cost, Sunk Cost Fallacy & Rational Decision Theory
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Why the cost of what you don't choose is the true foundation of economic rationality.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              1. Scarcity & Trade-Offs
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Because financial capital, human labor, and time are strictly finite resources, choosing one course of action automatically precludes all other simultaneous uses. Opportunity cost forces decision-makers to evaluate whether the chosen path exceeds the highest-value alternative.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              2. Sunk Costs vs Opportunity Costs
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <strong>Sunk costs</strong> are historical outlays that cannot be recovered and must be ignored in forward-looking decisions. <strong>Opportunity costs</strong> represent future benefits from available alternatives and must always be included in capital allocation models.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              3. The Unseen Costs in Business
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              French economist Frédéric Bastiat introduced the concept of <em>"What is Seen and What is Not Seen."</em> While accountants only record visible checks and invoices, economists insist that the invisible forgone profits are just as real in determining long-run wealth creation.
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
              q: 'Is Opportunity Cost the sum of all alternatives?',
              a: 'No! Opportunity Cost is strictly the value of the single BEST alternative forgone. If you choose between Option A ($100), Option B ($80), and Option C ($60), choosing Option A incurs an opportunity cost of $80 (Option B), not $140.'
            },
            {
              q: 'How does time factor into opportunity cost?',
              a: 'Time is the ultimate non-renewable resource. In education or business launches, the time invested could have generated active labor income (forgone salary) or passive investment compounding. Both must be factored into the true total cost.'
            },
            {
              q: 'What is the Sunk Cost Fallacy and how does it relate to opportunity cost?',
              a: 'The Sunk Cost Fallacy occurs when people continue pouring money into a failing project simply because they already invested heavily in it. Rational economics demands ignoring sunk money and comparing the forward-looking return against alternative investments.'
            },
            {
              q: 'How do corporations use Opportunity Cost (Hurdle Rate / WACC)?',
              a: 'Corporations set a minimum required return (Hurdle Rate, often based on WACC). Any capital expenditure project that fails to beat the hurdle rate is rejected because the company’s capital could earn higher returns elsewhere in financial markets or through share buybacks.'
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
