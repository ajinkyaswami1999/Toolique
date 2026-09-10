import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2,
  Sliders, ChevronDown, ChevronUp,
  Calculator, Layers, Scale,
  Activity, TrendingUp, TrendingDown,
  Globe, ShieldCheck,
  Target, ArrowRight,
  Zap, Percent, DollarSign, Clock
} from 'lucide-react';

type FisherMode = 'fisher_exact_vs_approx' | 'after_tax_real_yield' | 'borrower_lender_shock' | 'multi_year_compounding';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: FisherMode;
  nominalRate: number;
  inflationRate: number;
  expectedInflation: number;
  taxRate: number;
  principal: number;
  years: number;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'US 10-Year Treasury Benchmark',
    category: 'Sovereign Bond',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    mode: 'fisher_exact_vs_approx',
    nominalRate: 4.30,
    inflationRate: 2.80,
    expectedInflation: 2.50,
    taxRate: 24.0,
    principal: 10000,
    years: 10
  },
  {
    name: 'India Bank Fixed Deposit (FD)',
    category: 'Retail Savings',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    mode: 'after_tax_real_yield',
    nominalRate: 7.25,
    inflationRate: 5.10,
    expectedInflation: 5.00,
    taxRate: 30.0,
    principal: 500000,
    years: 5
  },
  {
    name: 'High-Inflation Emerging Economy',
    category: 'Inflation Crisis',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    mode: 'fisher_exact_vs_approx',
    nominalRate: 45.0,
    inflationRate: 38.0,
    expectedInflation: 35.0,
    taxRate: 15.0,
    principal: 100000,
    years: 3
  },
  {
    name: 'Post-COVID Real Negative Shock (2021–22)',
    category: 'Negative Real Shock',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    mode: 'fisher_exact_vs_approx',
    nominalRate: 1.50,
    inflationRate: 8.50,
    expectedInflation: 2.50,
    taxRate: 20.0,
    principal: 50000,
    years: 5
  },
  {
    name: 'Paul Volcker Fed Shock (1981)',
    category: 'Peak Real Yield',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    mode: 'fisher_exact_vs_approx',
    nominalRate: 19.0,
    inflationRate: 10.5,
    expectedInflation: 11.0,
    taxRate: 28.0,
    principal: 10000,
    years: 10
  },
  {
    name: 'Fixed-Rate Mortgage Borrower Windfall',
    category: 'Debt Deflation Hedge',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
    mode: 'borrower_lender_shock',
    nominalRate: 3.50,
    inflationRate: 7.00,
    expectedInflation: 2.50,
    taxRate: 0.0,
    principal: 300000,
    years: 30
  }
];

export default function RealInterestRateCalculator() {
  const [currency, setCurrency] = useState<string>('$');
  const [mode, setMode] = useState<FisherMode>('fisher_exact_vs_approx');

  // Primary Inputs
  const [nominalRate, setNominalRate] = useState<number>(4.30);       // i %
  const [inflationRate, setInflationRate] = useState<number>(2.80);   // π %
  const [expectedInflation, setExpectedInflation] = useState<number>(2.50); // π^e %
  const [taxRate, setTaxRate] = useState<number>(24.0);               // t %
  const [principal, setPrincipal] = useState<number>(10000);          // PV
  const [years, setYears] = useState<number>(10);                     // t years

  // UI States
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);

  // Apply Preset
  const handleApplyPreset = (preset: PresetScenario) => {
    setMode(preset.mode);
    setNominalRate(preset.nominalRate);
    setInflationRate(preset.inflationRate);
    setExpectedInflation(preset.expectedInflation);
    setTaxRate(preset.taxRate);
    setPrincipal(preset.principal);
    setYears(preset.years);
  };

  // Reset to Defaults
  const handleReset = () => {
    handleApplyPreset(PRESETS[0]);
  };

  // Calculations
  const results = useMemo(() => {
    const i = nominalRate / 100;
    const pi = inflationRate / 100;
    const pi_e = expectedInflation / 100;
    const t = taxRate / 100;

    // 1. Exact Fisher Real Rate: r = (1 + i) / (1 + pi) - 1 = (i - pi) / (1 + pi)
    const exactReal = pi !== -1 ? ((1 + i) / (1 + pi) - 1) * 100 : 0;

    // 2. Linear Approximation: r ≈ i - pi
    const approxReal = (nominalRate - inflationRate);

    // 3. Approximation Distortion Gap
    const errorGap = approxReal - exactReal;
    const interactionTerm = (exactReal / 100) * pi * 100; // r * pi

    // 4. After-Tax Nominal & Real Return
    const nominalAfterTax = nominalRate * (1 - t);
    const exactAfterTaxReal = pi !== -1 ? ((1 + (nominalAfterTax / 100)) / (1 + pi) - 1) * 100 : 0;
    const approxAfterTaxReal = nominalAfterTax - inflationRate;
    const taxDragPct = exactReal - exactAfterTaxReal;

    // 5. Ex-Ante Expected vs Ex-Post Realized Rates
    const exAnteReal = pi_e !== -1 ? ((1 + i) / (1 + pi_e) - 1) * 100 : 0;
    const exPostReal = exactReal;
    const unexpectedInflationShock = inflationRate - expectedInflation;
    const lenderRealGainLoss = exPostReal - exAnteReal; // Negative means lender lost purchasing power
    const borrowerAdvantage = -lenderRealGainLoss;       // Positive means borrower gained

    // 6. Multi-Year Wealth Compounding
    const futureNominal = principal * Math.pow(1 + i, years);
    const cumulativeInflationFactor = Math.pow(1 + pi, years);
    const futureReal = futureNominal / cumulativeInflationFactor;
    const realGainLoss = futureReal - principal;
    const realGrowthMultiplier = principal > 0 ? futureReal / principal : 0;

    return {
      exactReal,
      approxReal,
      errorGap,
      interactionTerm,
      nominalAfterTax,
      exactAfterTaxReal,
      approxAfterTaxReal,
      taxDragPct,
      exAnteReal,
      exPostReal,
      unexpectedInflationShock,
      lenderRealGainLoss,
      borrowerAdvantage,
      futureNominal,
      cumulativeInflationFactor,
      futureReal,
      realGainLoss,
      realGrowthMultiplier
    };
  }, [nominalRate, inflationRate, expectedInflation, taxRate, principal, years]);

  // 10-Milestone Schedule: Compounding over Time (Years 1 to 30)
  const scheduleRows = useMemo(() => {
    const i = nominalRate / 100;
    const pi = inflationRate / 100;
    const milestones = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30];

    return milestones.map((yr) => {
      const nomFV = principal * Math.pow(1 + i, yr);
      const inflFactor = Math.pow(1 + pi, yr);
      const realFV = nomFV / inflFactor;
      const netGain = realFV - principal;
      const purchasingPowerPct = principal > 0 ? (realFV / principal) * 100 : 100;

      return {
        yr,
        nomFV,
        inflFactor,
        realFV,
        netGain,
        purchasingPowerPct,
        isTargetYear: yr === years
      };
    });
  }, [nominalRate, inflationRate, principal, years]);

  // 5x5 Sensitivity Matrix: Nominal Rate (i) vs Inflation Rate (pi) -> Exact Real Rate (r)
  const sensitivityMatrix = useMemo(() => {
    const nominalRates = [2.0, 4.0, 6.0, 8.0, 12.0];
    const inflationRates = [1.0, 3.0, 5.0, 7.0, 10.0];

    return nominalRates.map((nom) => {
      const cells = inflationRates.map((inf) => {
        const iVal = nom / 100;
        const piVal = inf / 100;
        const rExact = ((1 + iVal) / (1 + piVal) - 1) * 100;
        return {
          nom,
          inf,
          rExact,
          isBaseline: Math.abs(nom - nominalRate) < 1.2 && Math.abs(inf - inflationRate) < 1.2
        };
      });
      return { nom, cells };
    });
  }, [nominalRate, inflationRate]);

  // SVG Geometry for Real Rate vs Inflation Curve
  const svgData = useMemo(() => {
    const width = 640;
    const height = 300;
    const padding = { top: 25, right: 35, bottom: 45, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxInf = Math.max(inflationRate * 2.2, 15.0);
    const minReal = -10.0;
    const maxReal = Math.max(nominalRate * 1.5, 10.0);

    const xScale = (infVal: number) => padding.left + (Math.max(0, Math.min(infVal, maxInf)) / maxInf) * chartW;
    const yScale = (rVal: number) => padding.top + chartH - ((rVal - minReal) / (maxReal - minReal)) * chartH;

    // Zero Real Rate line Y coordinate
    const yZero = yScale(0);

    // Curve Points for Exact Fisher
    const pointsExact = [];
    const pointsApprox = [];
    const numSteps = 40;
    const step = maxInf / numSteps;

    for (let s = 0; s <= numSteps; s++) {
      const infVal = s * step;
      const iVal = nominalRate / 100;
      const piVal = infVal / 100;
      const rEx = ((1 + iVal) / (1 + piVal) - 1) * 100;
      const rAp = nominalRate - infVal;

      pointsExact.push({ x: xScale(infVal), y: yScale(rEx) });
      pointsApprox.push({ x: xScale(infVal), y: yScale(rAp) });
    }

    const exactPath = pointsExact.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const approxPath = pointsApprox.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const currentPt = {
      x: xScale(inflationRate),
      y: yScale(results.exactReal)
    };

    return {
      width,
      height,
      padding,
      chartW,
      chartH,
      maxInf,
      minReal,
      maxReal,
      xScale,
      yScale,
      yZero,
      exactPath,
      approxPath,
      currentPt
    };
  }, [nominalRate, inflationRate, results.exactReal]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-16">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl">
              <Percent className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Fisher Equation & Real Interest Rate Suite
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Calculate exact inflation-adjusted real yields (r = (1+i)/(1+π) - 1), tax drags, debtor/creditor wealth shifts, and purchasing power compounding.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Currency:</span>
            <CurrencySelector value={currency} onChange={(sym) => setCurrency(sym)} />
          </div>
          <button
            onClick={handleReset}
            className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            title="Reset to benchmark"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Interest Rate & Inflation Regimes
          </span>
          <span className="text-xs text-zinc-400">Select calibrated market benchmark</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="p-3 text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-600 rounded-xl transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${p.badgeColor}`}>
                  {p.category}
                </span>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {p.name}
                </p>
              </div>
              <span className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1">
                Apply <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-zinc-100 dark:bg-zinc-800/60 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setMode('fisher_exact_vs_approx')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'fisher_exact_vs_approx'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Fisher Exact vs Approx</span>
        </button>

        <button
          onClick={() => setMode('after_tax_real_yield')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'after_tax_real_yield'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>After-Tax Real Yield</span>
        </button>

        <button
          onClick={() => setMode('borrower_lender_shock')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'borrower_lender_shock'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Borrower vs Lender Shock</span>
        </button>

        <button
          onClick={() => setMode('multi_year_compounding')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'multi_year_compounding'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Wealth Compounding (1-30Y)</span>
        </button>
      </div>

      {/* Main Grid: Inputs (5 cols) + Hero Card (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                Interest & Inflation Inputs
              </span>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
              >
                {showAdvanced ? 'Hide Additional' : 'Show Additional'}
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Core Rates */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nominal Interest Rate (i % / year)
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-2 text-xs text-zinc-400 font-mono">%</span>
                  <input
                    type="number"
                    step="0.05"
                    value={nominalRate}
                    onChange={(e) => setNominalRate(parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Inflation Rate (π % / year)
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-2 text-xs text-zinc-400 font-mono">%</span>
                  <input
                    type="number"
                    step="0.05"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {mode === 'borrower_lender_shock' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Ex-Ante Expected Inflation (πᵉ % / year)
                  </label>
                  <div className="relative">
                    <span className="absolute right-3 top-2 text-xs text-zinc-400 font-mono">%</span>
                    <input
                      type="number"
                      step="0.05"
                      value={expectedInflation}
                      onChange={(e) => setExpectedInflation(parseFloat(e.target.value) || 0)}
                      className="w-full pl-3 pr-8 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Tax & Portfolio Parameters */}
            {showAdvanced && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Tax & Wealth Horizon Parameters
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Marginal Tax Rate (t %)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="60"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Time Horizon (Years)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={years}
                      onChange={(e) => setYears(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Initial Investment / Loan Principal ({currency}PV)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-zinc-400 font-mono">{currency}</span>
                    <input
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full pl-7 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Hero Card & Yield Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-emerald-800/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-300 flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-emerald-400" />
                  {mode === 'after_tax_real_yield'
                    ? 'After-Tax Real Interest Rate (r_net)'
                    : mode === 'borrower_lender_shock'
                    ? 'Ex-Post Realized Return (r_actual)'
                    : 'Exact Real Interest Rate (Fisher Eq.)'}
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono my-2 tracking-tight text-white flex items-baseline gap-2">
                  <span>{mode === 'after_tax_real_yield' ? (results.exactAfterTaxReal >= 0 ? '+' : '') + results.exactAfterTaxReal.toFixed(2) : (results.exactReal >= 0 ? '+' : '') + results.exactReal.toFixed(2)}%</span>
                  <span className="text-sm font-normal text-emerald-200">/ year</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  results.exactReal >= 0 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {results.exactReal >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {results.exactReal >= 0 ? 'Purchasing Power Gain' : 'Negative Real Drag'}
                </span>
                <p className="text-[11px] font-mono text-emerald-200 mt-1">
                  Approx r ≈ {results.approxReal >= 0 ? '+' : ''}{results.approxReal.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-white/10 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-300 block text-[10px] font-medium uppercase">Approximation Error</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.errorGap >= 0 ? '+' : ''}{results.errorGap.toFixed(3)}%
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-300 block text-[10px] font-medium uppercase">After-Tax Real</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.exactAfterTaxReal >= 0 ? '+' : ''}{results.exactAfterTaxReal.toFixed(2)}%
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-300 block text-[10px] font-medium uppercase">Inflation Tax Drag</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  -{results.taxDragPct.toFixed(2)}%
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-emerald-300 block text-[10px] font-medium uppercase">{years}Y Real Multiplier</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.realGrowthMultiplier.toFixed(2)}x
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown / Comparison Cards */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-500" />
                Purchasing Power & Real Wealth Metrics
              </span>
              <span className="text-zinc-400 font-mono text-[11px]">{years} Year Horizon</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block uppercase font-semibold">
                  Real Purchasing Power ({years} Years)
                </span>
                <span className="text-lg font-bold font-mono text-emerald-800 dark:text-emerald-300">
                  {currency}{results.futureReal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  Nominal Capital: {currency}{results.futureNominal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block uppercase font-semibold">
                  Net Real Wealth {results.realGainLoss >= 0 ? 'Gain' : 'Loss'}
                </span>
                <span className={`text-lg font-bold font-mono ${results.realGainLoss >= 0 ? 'text-teal-800 dark:text-teal-300' : 'text-rose-600 dark:text-rose-400'}`}>
                  {results.realGainLoss >= 0 ? '+' : ''}{currency}{results.realGainLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[11px] text-zinc-500 block mt-0.5">
                  Inflation deflates capital by {results.cumulativeInflationFactor.toFixed(2)}x
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Real Rate vs Inflation Curve Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Real Rate Trajectory: Exact Fisher Curve vs Linear Approximation
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              The divergence widens at higher inflation rates due to the cross-product interaction term r · π.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Exact Fisher r(π)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-zinc-400 border-dashed" />
              <span className="text-zinc-500">Approx (i - π)</span>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl p-2 border border-zinc-100 dark:border-zinc-800">
          <svg
            viewBox={`0 0 ${svgData.width} ${svgData.height}`}
            className="w-full h-auto max-h-[340px] font-sans select-none"
          >
            {/* Zero Real Rate Baseline */}
            <line
              x1={svgData.padding.left}
              y1={svgData.yZero}
              x2={svgData.padding.left + svgData.chartW}
              y2={svgData.yZero}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <text
              x={svgData.padding.left + svgData.chartW - 10}
              y={svgData.yZero - 5}
              textAnchor="end"
              className="text-[9px] font-bold fill-rose-500 font-mono"
            >
              Zero Real Threshold (r = 0%)
            </text>

            {/* Approximate Line */}
            <path
              d={svgData.approxPath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="6 4"
            />

            {/* Exact Fisher Curve */}
            <path
              d={svgData.exactPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Current Coordinate Point */}
            <circle
              cx={svgData.currentPt.x}
              cy={svgData.currentPt.y}
              r="6"
              className="fill-emerald-600 stroke-white dark:stroke-zinc-900 stroke-2"
            />
            <circle
              cx={svgData.currentPt.x}
              cy={svgData.currentPt.y}
              r="12"
              className="fill-emerald-500/20 animate-ping pointer-events-none"
            />

            <g transform={`translate(${svgData.currentPt.x + 10}, ${svgData.currentPt.y - 25})`}>
              <rect
                x="0"
                y="0"
                width="135"
                height="32"
                rx="6"
                className="fill-zinc-900/90 dark:fill-zinc-800/90 shadow-md"
              />
              <text x="8" y="14" className="text-[10px] font-bold fill-white">
                π = {inflationRate.toFixed(1)}% | i = {nominalRate.toFixed(1)}%
              </text>
              <text x="8" y="25" className="text-[9px] font-mono fill-emerald-300">
                Exact r = {results.exactReal.toFixed(2)}% (Gap: {results.errorGap.toFixed(2)}%)
              </text>
            </g>

            {/* Axis Titles */}
            <text
              x={svgData.padding.left + svgData.chartW / 2}
              y={svgData.height - 10}
              textAnchor="middle"
              className="text-xs font-semibold fill-zinc-600 dark:fill-zinc-400"
            >
              Inflation Rate (π %)
            </text>
            <text
              transform={`rotate(-90) translate(-${svgData.padding.top + svgData.chartH / 2}, 16)`}
              textAnchor="middle"
              className="text-xs font-semibold fill-zinc-600 dark:fill-zinc-400"
            >
              Real Interest Rate (r %)
            </text>
          </svg>
        </div>
      </div>

      {/* 10-Milestone Wealth Compounding Schedule Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-500" />
              Multi-Year Purchasing Power Compounding Schedule
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tracks how nominal compound capital translates into constant-purchasing-power real wealth over 1 to 30 years.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-700">
                <th className="py-2.5 px-3">Horizon</th>
                <th className="py-2.5 px-3">Nominal Future Capital</th>
                <th className="py-2.5 px-3">Price Inflation Deflator</th>
                <th className="py-2.5 px-3">Real Purchasing Power</th>
                <th className="py-2.5 px-3">Net Real Gain/Loss</th>
                <th className="py-2.5 px-3">Real Wealth %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {scheduleRows.map((r) => (
                <tr
                  key={r.yr}
                  className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                    r.isTargetYear ? 'bg-emerald-50/70 dark:bg-emerald-950/40 font-bold' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-zinc-900 dark:text-zinc-100 font-bold">
                    Year {r.yr}
                    {r.isTargetYear && (
                      <span className="ml-1.5 text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-full font-sans">
                        Target
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{currency}{r.nomFV.toFixed(0)}</td>
                  <td className="py-2 px-3 text-zinc-500">{r.inflFactor.toFixed(3)}x</td>
                  <td className="py-2 px-3 font-bold text-emerald-700 dark:text-emerald-300">{currency}{r.realFV.toFixed(0)}</td>
                  <td className={`py-2 px-3 ${r.netGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {r.netGain >= 0 ? '+' : ''}{currency}{r.netGain.toFixed(0)}
                  </td>
                  <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{r.purchasingPowerPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5x5 Sensitivity Matrix: Nominal Rate vs Inflation Rate */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-500" />
              5×5 Sensitivity Matrix: Nominal Interest (i) vs Inflation (π)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Exact Real Interest Rate (r_exact %) across combinations of nominal yields and inflation environments.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <th className="p-2.5 text-left border border-zinc-200 dark:border-zinc-700 font-semibold">
                  Nominal (i) \ Inflation (π)
                </th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">1.0% Inflation</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">3.0% Inflation</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">5.0% Inflation</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">7.0% Inflation</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">10.0% Inflation</th>
              </tr>
            </thead>
            <tbody>
              {sensitivityMatrix.map((row) => (
                <tr key={row.nom} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-2 text-left font-bold font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200">
                    i = {row.nom.toFixed(1)}%
                  </td>
                  {row.cells.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`p-2 border border-zinc-200 dark:border-zinc-700 font-mono ${
                        cell.isBaseline
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 font-black text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500'
                          : cell.rExact > 0
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-rose-600 dark:text-rose-400 font-semibold bg-rose-50/40 dark:bg-rose-950/20'
                      }`}
                    >
                      <div className="font-bold">{cell.rExact >= 0 ? '+' : ''}{cell.rExact.toFixed(2)}%</div>
                      <div className="text-[10px] text-zinc-400 font-sans">
                        {cell.rExact > 0 ? 'Real Gain' : 'Real Drag'}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LaTeX Formal Mathematical Proofs */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Formal Fisher Equation Derivations & Mathematical Proofs
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Rigorous economic formulas formatted in LaTeX. Click any equation block to copy for research.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Proof 1: Exact Fisher Equation */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">1. Exact Fisher Real Rate Derivation</span>
              <button
                onClick={() => copyToClipboard('1 + i = (1 + r)(1 + \pi) \implies r = \frac{1 + i}{1 + \pi} - 1 = \frac{i - \pi}{1 + \pi}', 'exact_proof')}
                className="text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'exact_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-emerald-900 dark:text-emerald-300 overflow-x-auto">
              {"(1 + i) = (1 + r)(1 + \pi) = 1 + r + \pi + r\pi"}
              <br />
              {"\implies r = \frac{1 + i}{1 + \pi} - 1 = \frac{i - \pi}{1 + \pi}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              The exact formula accounts for the erosion of the real interest earned by price inflation (the cross term r·π).
            </p>
          </div>

          {/* Proof 2: Linear Approximation & Error Gap */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">2. Linear Approximation Error Wedge</span>
              <button
                onClick={() => copyToClipboard('r_{\text{approx}} - r_{\text{exact}} = (i - \pi) - \frac{i - \pi}{1 + \pi} = \frac{\pi(i - \pi)}{1 + \pi} = r_{\text{exact}} \cdot \pi', 'error_proof')}
                className="text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'error_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-emerald-900 dark:text-emerald-300 overflow-x-auto">
              {"r_{\text{approx}} = i - \pi"}
              <br />
              {"\text{Error } \Delta = (i - \pi) - \frac{i - \pi}{1 + \pi} = \pi \cdot r_{\text{exact}}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              At low inflation, π·r is negligible, but in high-inflation regimes the linear shortcut overstates real returns.
            </p>
          </div>

          {/* Proof 3: After-Tax Real Rate (Feldstein Drag) */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">3. After-Tax Real Return & Tax Drag</span>
              <button
                onClick={() => copyToClipboard('r_{\text{after-tax}} = \frac{1 + i(1 - t)}{1 + \pi} - 1 \approx i(1 - t) - \pi', 'tax_proof')}
                className="text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'tax_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-emerald-900 dark:text-emerald-300 overflow-x-auto">
              {"i_{\text{net}} = i \cdot (1 - t)"}
              <br />
              {"r_{\text{after-tax}} = \frac{1 + i(1 - t)}{1 + \pi} - 1"}
              <br />
              {"\text{Tax Drag} = r_{\text{exact}} - r_{\text{after-tax}}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Because taxes are levied on nominal (not real) income, inflation acts as an unlegislated capital tax.
            </p>
          </div>

          {/* Proof 4: Ex-Post Unexpected Inflation Wealth Shift */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">4. Unexpected Inflation Wealth Redistribution</span>
              <button
                onClick={() => copyToClipboard('r_{\text{actual}} - r_{\text{expected}} = \frac{(1 + i)(\pi^e - \pi)}{(1 + \pi)(1 + \pi^e)}', 'shock_proof')}
                className="text-zinc-400 hover:text-emerald-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'shock_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-emerald-900 dark:text-emerald-300 overflow-x-auto">
              {"r_{\text{ex-post}} - r_{\text{ex-ante}} = \frac{1 + i}{1 + \pi} - \frac{1 + i}{1 + \pi^e}"}
              <br />
              {"\implies \text{When } \pi > \pi^e: \text{ Borrower Gains, Lender Loses}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Unanticipated inflation redistributes real wealth from creditors/savers to fixed-rate borrowers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
