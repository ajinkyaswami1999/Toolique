import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2,
  Sliders, ChevronDown, ChevronUp,
  Calculator, Layers, Flame, Scale,
  Activity, ShieldAlert, TrendingUp,
  Clock, ShieldCheck, Target
} from 'lucide-react';

type CalculationMode = 'lump_sum' | 'annuity_drag' | 'cash_vs_invest' | 'goal_target';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  initialAmount: number;
  inflationRate: number;
  years: number;
  // Annuity / Pension Mode
  pensionAnnual: number;
  pensionCola: number; // Cost of Living Adjustment %
  // Investment Mode
  investmentReturn: number; // Nominal return %
  // Goal Mode
  targetGoalToday: number;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'Fed/RBI Moderate Target',
    category: 'Central Bank',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    mode: 'lump_sum',
    initialAmount: 100000,
    inflationRate: 2.5,
    years: 30,
    pensionAnnual: 60000,
    pensionCola: 0,
    investmentReturn: 8.0,
    targetGoalToday: 250000
  },
  {
    name: 'India / EM Baseline',
    category: 'Emerging Market',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    mode: 'lump_sum',
    initialAmount: 1000000,
    inflationRate: 6.0,
    years: 20,
    pensionAnnual: 600000,
    pensionCola: 0,
    investmentReturn: 12.0,
    targetGoalToday: 5000000
  },
  {
    name: 'Fixed Pension Drag',
    category: 'Retirement Risk',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    mode: 'annuity_drag',
    initialAmount: 250000,
    inflationRate: 4.5,
    years: 25,
    pensionAnnual: 60000,
    pensionCola: 0,
    investmentReturn: 7.5,
    targetGoalToday: 500000
  },
  {
    name: '1970s High-Stagflation Squeeze',
    category: 'Historical Shock',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    mode: 'lump_sum',
    initialAmount: 100000,
    inflationRate: 8.5,
    years: 10,
    pensionAnnual: 50000,
    pensionCola: 2.0,
    investmentReturn: 9.0,
    targetGoalToday: 200000
  },
  {
    name: 'Cash Drag vs. Equities (7% Real)',
    category: 'Opportunity Cost',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    mode: 'cash_vs_invest',
    initialAmount: 100000,
    inflationRate: 3.0,
    years: 25,
    pensionAnnual: 48000,
    pensionCola: 1.0,
    investmentReturn: 10.0,
    targetGoalToday: 1000000
  },
  {
    name: 'College Tuition Horizon',
    category: 'Target Planning',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    mode: 'goal_target',
    initialAmount: 50000,
    inflationRate: 7.0,
    years: 15,
    pensionAnnual: 36000,
    pensionCola: 0,
    investmentReturn: 8.5,
    targetGoalToday: 100000
  }
];

export default function PurchasingPowerCalculator() {
  const [currency, setCurrency] = useState<string>('$');
  const [mode, setMode] = useState<CalculationMode>('lump_sum');

  // Input states
  const [initialAmount, setInitialAmount] = useState<number>(100000);
  const [inflationRate, setInflationRate] = useState<number>(5.0);
  const [years, setYears] = useState<number>(20);

  // Annuity / Pension states
  const [pensionAnnual, setPensionAnnual] = useState<number>(60000);
  const [pensionCola, setPensionCola] = useState<number>(0);

  // Investment states
  const [investmentReturn, setInvestmentReturn] = useState<number>(10.0);

  // Goal Target states
  const [targetGoalToday, setTargetGoalToday] = useState<number>(250000);

  // UI state
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Currency Formatter Helper
  const formatMoney = (val: number, maxFrac = 0) => {
    return `${currency}${val.toLocaleString(undefined, { maximumFractionDigits: maxFrac, minimumFractionDigits: maxFrac })}`;
  };

  // Load Preset
  const handleApplyPreset = (preset: PresetScenario) => {
    setMode(preset.mode);
    setInitialAmount(preset.initialAmount);
    setInflationRate(preset.inflationRate);
    setYears(preset.years);
    setPensionAnnual(preset.pensionAnnual);
    setPensionCola(preset.pensionCola);
    setInvestmentReturn(preset.investmentReturn);
    setTargetGoalToday(preset.targetGoalToday);
  };

  // Reset to Defaults
  const handleReset = () => {
    setMode('lump_sum');
    setInitialAmount(100000);
    setInflationRate(5.0);
    setYears(20);
    setPensionAnnual(60000);
    setPensionCola(0);
    setInvestmentReturn(10.0);
    setTargetGoalToday(250000);
  };

  // Copy Formula Helper
  const handleCopyFormula = (latex: string, label: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedFormula(label);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  // Core Math Calculations
  const calc = useMemo(() => {
    const r = inflationRate / 100;
    const t = Math.max(1, Math.min(50, years));

    // 1. Lump Sum Compound Cash Decay
    const deflatorFactor = Math.pow(1 + r, t);
    const futureRealValue = initialAmount / deflatorFactor;
    const nominalPurchasingPowerLoss = Math.max(0, initialAmount - futureRealValue);
    const retainedPercent = initialAmount > 0 ? (futureRealValue / initialAmount) * 100 : 0;
    const lossPercentage = Math.max(0, 100 - retainedPercent);
    const neededToMatch = initialAmount * deflatorFactor;
    const inflationMultiplier = deflatorFactor;

    // Half-Life (Years to 50% loss)
    const halfLifeYears = r > 0 ? Math.log(2) / Math.log(1 + r) : Infinity;
    const quarterLifeYears = r > 0 ? Math.log(4) / Math.log(1 + r) : Infinity; // 75% loss
    const tenthLifeYears = r > 0 ? Math.log(10) / Math.log(1 + r) : Infinity; // 90% loss

    // 2. Annuity / Pension Drag
    const colaRate = pensionCola / 100;
    const yearNPensionNominal = pensionAnnual * Math.pow(1 + colaRate, t);
    const yearNPensionReal = yearNPensionNominal / Math.pow(1 + r, t);
    const pensionLossYearN = Math.max(0, pensionAnnual - yearNPensionReal);
    const pensionRetainedPercent = pensionAnnual > 0 ? (yearNPensionReal / pensionAnnual) * 100 : 0;

    // Cumulative Lifetime Pension Comparison
    let cumNominalPension = 0;
    let cumRealPension = 0;
    for (let k = 1; k <= t; k++) {
      const nomP = pensionAnnual * Math.pow(1 + colaRate, k);
      const realP = nomP / Math.pow(1 + r, k);
      cumNominalPension += nomP;
      cumRealPension += realP;
    }
    const cumPensionErosion = Math.max(0, cumNominalPension - cumRealPension);
    const cumPensionErosionPct = cumNominalPension > 0 ? (cumPensionErosion / cumNominalPension) * 100 : 0;

    // 3. Cash Drag vs Investment Real Return (Exact Fisher)
    const nominalAssetRate = investmentReturn / 100;
    const realAssetRate = (1 + nominalAssetRate) / (1 + r) - 1;
    const investmentNominalFuture = initialAmount * Math.pow(1 + nominalAssetRate, t);
    const investmentRealFuture = initialAmount * Math.pow(1 + realAssetRate, t);
    const cashRealFuture = futureRealValue;
    const netWealthOpportunityGap = Math.max(0, investmentRealFuture - cashRealFuture);
    const investmentMultiplier = Math.pow(1 + realAssetRate, t);

    // 4. Milestone Goal Deflator
    const futureNominalGoalNeeded = targetGoalToday * Math.pow(1 + r, t);
    const inflationGoalGap = futureNominalGoalNeeded - targetGoalToday;
    const goalInflationSurgeMultiplier = Math.pow(1 + r, t);

    return {
      t,
      r,
      deflatorFactor,
      futureRealValue,
      nominalPurchasingPowerLoss,
      retainedPercent,
      lossPercentage,
      neededToMatch,
      inflationMultiplier,
      halfLifeYears,
      quarterLifeYears,
      tenthLifeYears,
      // Annuity
      yearNPensionNominal,
      yearNPensionReal,
      pensionLossYearN,
      pensionRetainedPercent,
      cumNominalPension,
      cumRealPension,
      cumPensionErosion,
      cumPensionErosionPct,
      // Investment
      realAssetRate,
      investmentNominalFuture,
      investmentRealFuture,
      cashRealFuture,
      netWealthOpportunityGap,
      investmentMultiplier,
      // Goal Target
      futureNominalGoalNeeded,
      inflationGoalGap,
      goalInflationSurgeMultiplier
    };
  }, [initialAmount, inflationRate, years, pensionAnnual, pensionCola, investmentReturn, targetGoalToday]);

  // Year-by-Year Multi-Year Schedule
  const scheduleData = useMemo(() => {
    const horizon = calc.t;
    const r = calc.r;
    const base = initialAmount;
    const nomAsset = investmentReturn / 100;
    const realAsset = calc.realAssetRate;

    // Build milestones up to horizon
    const steps: number[] = [];
    if (horizon <= 10) {
      for (let i = 1; i <= horizon; i++) steps.push(i);
    } else if (horizon <= 25) {
      steps.push(1, 2, 3, 5, 7, 10, 15, 20, horizon);
    } else {
      steps.push(1, 2, 5, 10, 15, 20, 25, 30, 40, horizon);
    }
    const uniqueSteps = Array.from(new Set(steps)).sort((a, b) => a - b);

    return uniqueSteps.map((yr) => {
      const deflator = Math.pow(1 + r, yr);
      const realVal = base / deflator;
      const lossVal = base - realVal;
      const retainPct = (realVal / base) * 100;
      const matchNeeded = base * deflator;
      const investReal = base * Math.pow(1 + realAsset, yr);
      const investNom = base * Math.pow(1 + nomAsset, yr);

      return {
        year: yr,
        deflator,
        realVal,
        lossVal,
        retainPct,
        matchNeeded,
        investReal,
        investNom
      };
    });
  }, [calc.t, calc.r, calc.realAssetRate, initialAmount, investmentReturn]);

  // SVG Chart Geometry
  const chartGeometry = useMemo(() => {
    const width = 620;
    const height = 280;
    const padding = { top: 30, right: 30, bottom: 40, left: 65 };

    const maxYears = calc.t;
    const pointsCount = Math.max(20, maxYears);
    const dataPoints: { yr: number; realCash: number; investReal: number }[] = [];

    const base = initialAmount;
    const r = calc.r;
    const realAsset = calc.realAssetRate;

    for (let i = 0; i <= pointsCount; i++) {
      const yr = (i / pointsCount) * maxYears;
      const realCash = base / Math.pow(1 + r, yr);
      const investReal = mode === 'cash_vs_invest' ? base * Math.pow(1 + realAsset, yr) : 0;
      dataPoints.push({ yr, realCash, investReal });
    }

    const maxY = mode === 'cash_vs_invest'
      ? Math.max(base * 1.2, ...dataPoints.map(d => d.investReal))
      : base;

    const scaleX = (yr: number) => padding.left + (yr / maxYears) * (width - padding.left - padding.right);
    const scaleY = (v: number) => height - padding.bottom - (v / maxY) * (height - padding.top - padding.bottom);

    // Cash Curve
    let cashPathD = '';
    dataPoints.forEach((pt, idx) => {
      const x = scaleX(pt.yr);
      const y = scaleY(pt.realCash);
      if (idx === 0) cashPathD += `M ${x} ${y}`;
      else cashPathD += ` L ${x} ${y}`;
    });

    // Real Retained Area
    let cashAreaD = cashPathD;
    cashAreaD += ` L ${scaleX(maxYears)} ${scaleY(0)} L ${scaleX(0)} ${scaleY(0)} Z`;

    // Investment Curve (if cash_vs_invest mode)
    let investPathD = '';
    if (mode === 'cash_vs_invest') {
      dataPoints.forEach((pt, idx) => {
        const x = scaleX(pt.yr);
        const y = scaleY(pt.investReal);
        if (idx === 0) investPathD += `M ${x} ${y}`;
        else investPathD += ` L ${x} ${y}`;
      });
    }

    // Half life point
    const halfLifePt = calc.halfLifeYears <= maxYears ? {
      x: scaleX(calc.halfLifeYears),
      y: scaleY(base * 0.5)
    } : null;

    return {
      width,
      height,
      padding,
      scaleX,
      scaleY,
      cashPathD,
      cashAreaD,
      investPathD,
      halfLifePt,
      maxY
    };
  }, [calc.t, calc.r, calc.realAssetRate, calc.halfLifeYears, initialAmount, mode]);

  // 5x5 Sensitivity Matrix Data
  const sensitivityMatrix = useMemo(() => {
    const rateSteps = [2.0, 4.0, 6.0, 8.0, 10.0];
    const yearSteps = [5, 10, 20, 30, 50];
    const base = initialAmount;

    return {
      rateSteps,
      yearSteps,
      rows: rateSteps.map((rate) => {
        const rDec = rate / 100;
        return {
          rate,
          cells: yearSteps.map((yr) => {
            const realVal = base / Math.pow(1 + rDec, yr);
            const retainPct = (realVal / base) * 100;
            const lossPct = 100 - retainPct;
            return {
              years: yr,
              realVal,
              retainPct,
              lossPct
            };
          })
        };
      })
    };
  }, [initialAmount]);

  // LaTeX proofs
  const latexDecay = `V_{\\text{real}}(t) = \\frac{M_0}{(1 + \\pi)^t} = \\frac{${initialAmount.toLocaleString()}}{(1 + ${calc.r.toFixed(3)})^{${calc.t}}} = ${formatMoney(calc.futureRealValue, 2)}`;
  const latexLossPct = `\\text{Loss}\\% = \\left(1 - \\frac{1}{(1 + \\pi)^t}\\right) \\times 100\\% = \\left(1 - \\frac{1}{(1 + ${calc.r.toFixed(3)})^{${calc.t}}}\\right) \\times 100\\% = ${calc.lossPercentage.toFixed(2)}\\%`;
  const latexHalfLife = `t_{1/2} = \\frac{\\ln(2)}{\\ln(1 + \\pi)} = \\frac{0.69315}{\\ln(1 + ${calc.r.toFixed(3)})} = ${calc.halfLifeYears === Infinity ? '\\infty' : calc.halfLifeYears.toFixed(2)} \\text{ Years}`;
  const latexFisher = `r_{\\text{real}} = \\frac{1 + R_{\\text{nom}}}{1 + \\pi} - 1 = \\frac{1 + ${(investmentReturn/100).toFixed(3)}}{1 + ${calc.r.toFixed(3)}} - 1 = ${(calc.realAssetRate * 100).toFixed(2)}\\%`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left pb-12">
      {/* Top Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Scenario Presets & Mode Selector</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Simulate inflation decay, pension drag, and cash wealth preservation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs font-semibold text-zinc-500">Currency:</span>
              <CurrencySelector value={currency} onChange={(sym) => setCurrency(sym)} />
            </div>
            <button
              onClick={handleReset}
              className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preset Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset)}
              className="p-2.5 rounded-2xl text-left border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold ${preset.badgeColor} mb-1`}>
                  {preset.category}
                </span>
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-1">
                  {preset.name}
                </div>
              </div>
              <div className="text-[11px] text-zinc-500 mt-1 font-mono font-medium">
                {preset.inflationRate}% infl / {preset.years}y
              </div>
            </button>
          ))}
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setMode('lump_sum')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'lump_sum'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            1. Compound Cash Decay
          </button>
          <button
            onClick={() => setMode('annuity_drag')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'annuity_drag'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            2. Fixed Pension Drag
          </button>
          <button
            onClick={() => setMode('cash_vs_invest')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'cash_vs_invest'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            3. Cash Drag vs Investment
          </button>
          <button
            onClick={() => setMode('goal_target')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'goal_target'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            4. Milestone Goal Target
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Column */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <Sliders className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {mode === 'lump_sum' && 'Cash Principal & Horizon'}
                  {mode === 'annuity_drag' && 'Pension Payout & Inflation'}
                  {mode === 'cash_vs_invest' && 'Cash vs. Capital Growth'}
                  {mode === 'goal_target' && 'Milestone Goal Parameters'}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-bold">
                1–50 Yrs
              </span>
            </div>

            {/* Shared Primary Inputs */}
            {(mode === 'lump_sum' || mode === 'cash_vs_invest') && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Current Cash Principal ({currency})
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {formatMoney(initialAmount)}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {mode === 'annuity_drag' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Annual Fixed Pension / Annuity ({currency})
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      {formatMoney(pensionAnnual)}/yr ({formatMoney(pensionAnnual / 12)}/mo)
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={pensionAnnual}
                    onChange={(e) => setPensionAnnual(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold font-mono focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Annual Cost of Living Adjustment (COLA %)
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {pensionCola.toFixed(1)}% / yr
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    step="0.5"
                    value={pensionCola}
                    onChange={(e) => setPensionCola(parseFloat(e.target.value) || 0)}
                    className="w-full accent-emerald-500 mb-1"
                  />
                  <div className="text-[11px] text-zinc-500">
                    {pensionCola === 0 ? 'Fixed unindexed pension (0% COLA)' : `Partially indexed at ${pensionCola}% per year`}
                  </div>
                </div>
              </div>
            )}

            {mode === 'goal_target' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Target Goal in Today&apos;s Money ({currency})
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    {formatMoney(targetGoalToday)}
                  </span>
                </div>
                <input
                  type="number"
                  min="1000"
                  step="10000"
                  value={targetGoalToday}
                  onChange={(e) => setTargetGoalToday(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            {/* Inflation Slider & Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  Average Annual Inflation Rate (%)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0.1"
                    max="25"
                    step="0.1"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-16 px-2 py-1 text-right bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold"
                  />
                  <span className="text-xs font-bold text-zinc-500">%</span>
                </div>
              </div>
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.25"
                value={inflationRate}
                onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0.5)}
                className="w-full accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>0.5% (Disinflation)</span>
                <span>2.5% (Fed Target)</span>
                <span>6.0% (EM Average)</span>
                <span>15.0% (Stagflation)</span>
              </div>
            </div>

            {/* Time Horizon Slider & Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Holding Time Horizon (Years)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="1"
                    value={years}
                    onChange={(e) => setYears(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                    className="w-16 px-2 py-1 text-right bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold"
                  />
                  <span className="text-xs font-bold text-zinc-500">Yrs</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value) || 1)}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>1 Year</span>
                <span>10 Years</span>
                <span>25 Years</span>
                <span>50 Years</span>
              </div>
            </div>

            {/* Investment Return Slider (for cash_vs_invest mode) */}
            {mode === 'cash_vs_invest' && (
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    Asset Expected Nominal Return (%)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="25"
                      step="0.5"
                      value={investmentReturn}
                      onChange={(e) => setInvestmentReturn(parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-right bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold"
                    />
                    <span className="text-xs font-bold text-zinc-500">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="2"
                  max="18"
                  step="0.5"
                  value={investmentReturn}
                  onChange={(e) => setInvestmentReturn(parseFloat(e.target.value) || 2)}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>5% (Fixed Deposit)</span>
                  <span>10% (S&P/Nifty)</span>
                  <span>15% (Smallcap/Real Estate)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold">Real Fisher Return: </span>
                  <span className="font-mono font-bold">{(calc.realAssetRate * 100).toFixed(2)}%</span> per year after {(inflationRate).toFixed(1)}% inflation
                </div>
              </div>
            )}
          </div>

          {/* Quick Mathematical Diagnostics Card */}
          <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              Inflation Erosion Diagnostics
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-500 block">Half-Life (50% Loss)</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                  {calc.halfLifeYears === Infinity ? 'N/A' : `${calc.halfLifeYears.toFixed(1)} Yrs`}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">Rule of 70 horizon</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-500 block">Cumulative Deflator</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {calc.deflatorFactor.toFixed(2)}×
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">Price level multiplier</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-500 block">75% Loss Horizon</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                  {calc.quarterLifeYears === Infinity ? 'N/A' : `${calc.quarterLifeYears.toFixed(1)} Yrs`}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">1/4 buying power left</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-500 block">90% Loss Horizon</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-300 text-sm">
                  {calc.tenthLifeYears === Infinity ? 'N/A' : `${calc.tenthLifeYears.toFixed(1)} Yrs`}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">1/10 buying power left</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output & Visualization Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Gradient Result Card */}
          <div className="bg-gradient-to-br from-amber-900 via-stone-900 to-orange-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-amber-300 backdrop-blur-md flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  {mode === 'lump_sum' && 'Future Real Purchasing Power'}
                  {mode === 'annuity_drag' && `Year ${calc.t} Real Pension Payout`}
                  {mode === 'cash_vs_invest' && 'Net Real Wealth Opportunity Wedge'}
                  {mode === 'goal_target' && `Year ${calc.t} Nominal Cash Required`}
                </span>
                <span className="text-xs text-amber-200/80 font-mono">
                  {calc.t} Years @ {inflationRate}% Inflation
                </span>
              </div>

              {/* Primary Metric Output */}
              <div>
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white flex items-baseline gap-2">
                  {mode === 'lump_sum' && formatMoney(calc.futureRealValue)}
                  {mode === 'annuity_drag' && formatMoney(calc.yearNPensionReal)}
                  {mode === 'cash_vs_invest' && `+${formatMoney(calc.netWealthOpportunityGap)}`}
                  {mode === 'goal_target' && formatMoney(calc.futureNominalGoalNeeded)}
                </div>

                <div className="text-xs sm:text-sm text-amber-200 font-medium mt-1">
                  {mode === 'lump_sum' && (
                    <>
                      Cumulative Purchasing Power Loss: <span className="font-bold text-rose-300">-{calc.lossPercentage.toFixed(1)}%</span> (-{formatMoney(calc.nominalPurchasingPowerLoss)})
                    </>
                  )}
                  {mode === 'annuity_drag' && (
                    <>
                      Annual Purchasing Power Erosion: <span className="font-bold text-rose-300">-{calc.pensionLossYearN > 0 ? (100 - calc.pensionRetainedPercent).toFixed(1) : '0'}%</span> (-{formatMoney(calc.pensionLossYearN)}/yr)
                    </>
                  )}
                  {mode === 'cash_vs_invest' && (
                    <>
                      Equities Real: <span className="font-bold text-emerald-300">{formatMoney(calc.investmentRealFuture)}</span> vs Cash Real: <span className="font-bold text-amber-300">{formatMoney(calc.cashRealFuture)}</span>
                    </>
                  )}
                  {mode === 'goal_target' && (
                    <>
                      Inflation Funding Surge: <span className="font-bold text-rose-300">+{formatMoney(calc.inflationGoalGap)}</span> (+{((calc.goalInflationSurgeMultiplier - 1) * 100).toFixed(1)}% extra cash needed)
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar / Visual Ratio */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-300">
                    {mode === 'lump_sum' && `Retained Buying Power: ${calc.retainedPercent.toFixed(1)}%`}
                    {mode === 'annuity_drag' && `Retained Pension Value: ${calc.pensionRetainedPercent.toFixed(1)}%`}
                    {mode === 'cash_vs_invest' && `Cash Real: ${formatMoney(calc.cashRealFuture)} (${((calc.cashRealFuture / calc.investmentRealFuture) * 100).toFixed(1)}% of Equity)`}
                    {mode === 'goal_target' && `Today's Base: ${formatMoney(targetGoalToday)} (${((targetGoalToday / calc.futureNominalGoalNeeded) * 100).toFixed(1)}% of Future)`}
                  </span>
                  <span className="text-rose-300">
                    {mode === 'lump_sum' && `Eroded: ${calc.lossPercentage.toFixed(1)}%`}
                    {mode === 'annuity_drag' && `Eroded: ${(100 - calc.pensionRetainedPercent).toFixed(1)}%`}
                    {mode === 'cash_vs_invest' && `Equity Advantage: ${calc.investmentMultiplier.toFixed(2)}×`}
                    {mode === 'goal_target' && `Inflation Wedge: +${formatMoney(calc.inflationGoalGap)}`}
                  </span>
                </div>
                <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden flex border border-white/10">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{
                      width: `${Math.max(2, Math.min(98, mode === 'lump_sum' ? calc.retainedPercent : mode === 'annuity_drag' ? calc.pensionRetainedPercent : (calc.cashRealFuture / calc.investmentRealFuture) * 100))}%`
                    }}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{
                      width: `${Math.max(2, Math.min(98, mode === 'lump_sum' ? calc.lossPercentage : mode === 'annuity_drag' ? 100 - calc.pensionRetainedPercent : 100 - (calc.cashRealFuture / calc.investmentRealFuture) * 100))}%`
                    }}
                  />
                </div>
              </div>

              {/* 3 Secondary Metric Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-amber-300/80 block text-[10px] uppercase font-semibold">Future Match Needed</span>
                  <span className="font-mono font-bold text-white text-base">
                    {formatMoney(calc.neededToMatch)}
                  </span>
                  <span className="text-[10px] text-amber-200/60 block mt-0.5">To equal today&apos;s principal</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-amber-300/80 block text-[10px] uppercase font-semibold">Price Level Multiplier</span>
                  <span className="font-mono font-bold text-white text-base">
                    {calc.deflatorFactor.toFixed(2)}×
                  </span>
                  <span className="text-[10px] text-amber-200/60 block mt-0.5">Goods cost {calc.deflatorFactor.toFixed(2)}× more</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-amber-300/80 block text-[10px] uppercase font-semibold">50% Halving Horizon</span>
                  <span className="font-mono font-bold text-amber-400 text-base">
                    {calc.halfLifeYears === Infinity ? 'N/A' : `${calc.halfLifeYears.toFixed(1)} Yrs`}
                  </span>
                  <span className="text-[10px] text-amber-200/60 block mt-0.5">Cash value cut in half</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Continuous SVG Chart */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <BarChart2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {mode === 'cash_vs_invest' ? 'Cash Decay vs. Capital Investment Real Wedge' : 'Continuous Exponential Cash Purchasing Power Decay'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Compounding trajectory from Year 0 to Year {calc.t} at {inflationRate}% annual inflation
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Real Cash Value
                </span>
                {mode === 'cash_vs_invest' && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Investment Real Wealth
                  </span>
                )}
              </div>
            </div>

            {/* SVG Visual Canvas */}
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                className="w-full h-auto max-h-[300px] select-none font-mono"
              >
                <defs>
                  {/* Real Cash Gradient */}
                  <linearGradient id="cashAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
                  const yVal = chartGeometry.maxY * ratio;
                  const y = chartGeometry.scaleY(yVal);
                  return (
                    <g key={ratio}>
                      <line
                        x1={chartGeometry.padding.left}
                        y1={y}
                        x2={chartGeometry.width - chartGeometry.padding.right}
                        y2={y}
                        stroke="currentColor"
                        strokeDasharray="3 3"
                        className="text-zinc-200 dark:text-zinc-800"
                        strokeWidth="1"
                      />
                      <text
                        x={chartGeometry.padding.left - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] fill-zinc-400 font-mono"
                      >
                        {formatMoney(yVal)}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis Grid & Labels */}
                {[0, Math.round(calc.t * 0.25), Math.round(calc.t * 0.5), Math.round(calc.t * 0.75), calc.t].map((yr, idx) => {
                  const x = chartGeometry.scaleX(yr);
                  return (
                    <g key={idx}>
                      <line
                        x1={x}
                        y1={chartGeometry.padding.top}
                        x2={x}
                        y2={chartGeometry.height - chartGeometry.padding.bottom}
                        stroke="currentColor"
                        strokeDasharray="2 2"
                        className="text-zinc-100 dark:text-zinc-800"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={chartGeometry.height - chartGeometry.padding.bottom + 18}
                        textAnchor="middle"
                        className="text-[10px] fill-zinc-400 font-mono font-medium"
                      >
                        Yr {yr}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area for Real Cash */}
                <path
                  d={chartGeometry.cashAreaD}
                  fill="url(#cashAreaGradient)"
                />

                {/* Continuous Cash Curve */}
                <path
                  d={chartGeometry.cashPathD}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Investment Curve (if in cash_vs_invest mode) */}
                {mode === 'cash_vs_invest' && chartGeometry.investPathD && (
                  <path
                    d={chartGeometry.investPathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Half-Life Point Marker */}
                {chartGeometry.halfLifePt && (
                  <g>
                    <line
                      x1={chartGeometry.halfLifePt.x}
                      y1={chartGeometry.scaleY(0)}
                      x2={chartGeometry.halfLifePt.x}
                      y2={chartGeometry.halfLifePt.y}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={chartGeometry.halfLifePt.x}
                      cy={chartGeometry.halfLifePt.y}
                      r="5"
                      className="fill-rose-500 stroke-white dark:stroke-zinc-900"
                      strokeWidth="2"
                    />
                    <text
                      x={chartGeometry.halfLifePt.x + 8}
                      y={chartGeometry.halfLifePt.y - 8}
                      className="text-[10px] font-bold fill-rose-500 font-mono"
                    >
                      50% Halved (Yr {calc.halfLifeYears.toFixed(1)})
                    </text>
                  </g>
                )}

                {/* End Point Dot */}
                <circle
                  cx={chartGeometry.scaleX(calc.t)}
                  cy={chartGeometry.scaleY(calc.futureRealValue)}
                  r="5"
                  className="fill-amber-500 stroke-white dark:stroke-zinc-900"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                <span>
                  {calc.lossPercentage > 50
                    ? `Severe Capital Destruction: Over half of real purchasing power lost within ${calc.t} years.`
                    : `Moderate Erosion: ${calc.retainedPercent.toFixed(1)}% purchasing power retained over ${calc.t} years.`}
                </span>
              </div>
              <span className="font-mono text-zinc-400">
                Formula: V = M₀ / (1+r)ᵗ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Year Milestone Schedule Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Compounding Multi-Horizon Purchasing Power Schedule
              </h3>
              <p className="text-xs text-zinc-500">
                Year-by-year cash erosion, price deflator factors, and required replacement capital
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {scheduleData.length} Key Milestones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                <th className="py-2.5 px-3 font-semibold">Horizon</th>
                <th className="py-2.5 px-3 font-semibold">Deflator Factor</th>
                <th className="py-2.5 px-3 font-semibold">Real Buying Power</th>
                <th className="py-2.5 px-3 font-semibold">Cumulative Loss</th>
                <th className="py-2.5 px-3 font-semibold">Retained %</th>
                <th className="py-2.5 px-3 font-semibold">Needed to Match</th>
                {mode === 'cash_vs_invest' && <th className="py-2.5 px-3 font-semibold">Investment Real</th>}
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {scheduleData.map((row) => (
                <tr
                  key={row.year}
                  className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                    row.year === calc.t ? 'bg-amber-500/5 font-bold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                    Year {row.year} {row.year === calc.t && '(Target)'}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                    {row.deflator.toFixed(3)}×
                  </td>
                  <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">
                    {formatMoney(row.realVal)}
                  </td>
                  <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400">
                    -{formatMoney(row.lossVal)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      row.retainPct >= 75
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : row.retainPct >= 50
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}>
                      {row.retainPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-900 dark:text-zinc-200">
                    {formatMoney(row.matchNeeded)}
                  </td>
                  {mode === 'cash_vs_invest' && (
                    <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(row.investReal)}
                    </td>
                  )}
                  <td className="py-2.5 px-3">
                    {row.retainPct > 75 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Mild
                      </span>
                    ) : row.retainPct >= 50 ? (
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" /> Half-Life
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Severe
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5x5 Inflation vs. Horizon Sensitivity Matrix */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Scale className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                5×5 Sensitivity Matrix: Inflation Rate vs. Holding Horizon
              </h3>
              <p className="text-xs text-zinc-500">
                Remaining real purchasing power % of {formatMoney(initialAmount)} principal
              </p>
            </div>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            Green: &gt;70% | Amber: 40–70% | Rose: &lt;40%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2.5 px-3 text-left font-bold text-zinc-500">Inflation \ Horizon</th>
                {sensitivityMatrix.yearSteps.map((yr) => (
                  <th key={yr} className="py-2.5 px-3 font-bold text-zinc-700 dark:text-zinc-300">
                    {yr} Years
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {sensitivityMatrix.rows.map((row) => (
                <tr key={row.rate} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 px-3 text-left font-bold text-zinc-900 dark:text-zinc-100">
                    {row.rate.toFixed(1)}% / yr
                  </td>
                  {row.cells.map((cell) => {
                    const pct = cell.retainPct;
                    let colorBg = 'bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-300';
                    if (pct >= 70) colorBg = 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300';
                    else if (pct >= 40) colorBg = 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300';

                    return (
                      <td key={cell.years} className="py-2 px-2">
                        <div className={`p-2 rounded-xl ${colorBg} font-bold transition-transform hover:scale-105`}>
                          <div>{pct.toFixed(1)}%</div>
                          <div className="text-[10px] font-normal opacity-80 mt-0.5">
                            {formatMoney(cell.realVal)}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal LaTeX Proofs & Derivations */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Calculator className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Formal Mathematical Proofs & Compounding Derivations
              </h3>
              <p className="text-xs text-zinc-500">
                Rigorous financial mathematics of compounding discount factors and purchasing power decay
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
          >
            {showAdvanced ? 'Hide Derivations' : 'Show Derivations'}
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {/* 1. Real Value Decay Proof */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">1. Real Purchasing Power Decay</span>
                <button
                  onClick={() => handleCopyFormula(latexDecay, 'decay')}
                  className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                  title="Copy LaTeX"
                >
                  {copiedFormula === 'decay' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 font-mono text-xs overflow-x-auto text-purple-600 dark:text-purple-400">
                {latexDecay}
              </div>
              <p className="text-[11px] text-zinc-500">
                {"Discounts nominal principal by compounding inflation factor (1 + π)^t."}
              </p>
            </div>

            {/* 2. Half-Life Derivation */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">2. Half-Life Horizon (Rule of 70)</span>
                <button
                  onClick={() => handleCopyFormula(latexHalfLife, 'halflife')}
                  className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                  title="Copy LaTeX"
                >
                  {copiedFormula === 'halflife' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 font-mono text-xs overflow-x-auto text-purple-600 dark:text-purple-400">
                {latexHalfLife}
              </div>
              <p className="text-[11px] text-zinc-500">
                Exact log horizon required for purchasing power to decline by exactly 50%.
              </p>
            </div>

            {/* 3. Loss % Formula */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">3. Cumulative Destruction %</span>
                <button
                  onClick={() => handleCopyFormula(latexLossPct, 'loss')}
                  className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                  title="Copy LaTeX"
                >
                  {copiedFormula === 'loss' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 font-mono text-xs overflow-x-auto text-purple-600 dark:text-purple-400">
                {latexLossPct}
              </div>
              <p className="text-[11px] text-zinc-500">
                Measures proportional erosion of initial monetary purchasing power over time.
              </p>
            </div>

            {/* 4. Fisher Real Return Equation */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">4. Exact Fisher Real Return</span>
                <button
                  onClick={() => handleCopyFormula(latexFisher, 'fisher')}
                  className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                  title="Copy LaTeX"
                >
                  {copiedFormula === 'fisher' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 font-mono text-xs overflow-x-auto text-purple-600 dark:text-purple-400">
                {latexFisher}
              </div>
              <p className="text-[11px] text-zinc-500">
                {"The exact multiplicative Fisher relation: (1 + Nominal Return) = (1 + Real Return) × (1 + Inflation)."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
