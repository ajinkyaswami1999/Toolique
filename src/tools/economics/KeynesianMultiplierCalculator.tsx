import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2,
  Sliders, ChevronDown, ChevronUp,
  Calculator, Layers, Scale,
  Activity, TrendingUp,
  Globe, ShieldCheck,
  Target, ArrowRight,
  Zap
} from 'lucide-react';

type MultiplierMode = 'simple_fiscal' | 'tax_balanced_budget' | 'open_economy_complex' | 'target_gdp_stimulus';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: MultiplierMode;
  mpc: number;
  deltaG: number;
  deltaT: number;
  taxRate: number;
  mpi: number;
  targetGdpGap: number;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'US ARRA 2009 Post-GFC Stimulus',
    category: 'Historical Stimulus',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    mode: 'open_economy_complex',
    mpc: 0.75,
    deltaG: 800,
    deltaT: -280,
    taxRate: 0.20,
    mpi: 0.12,
    targetGdpGap: 1500
  },
  {
    name: 'India Infrastructure Capex Push',
    category: 'Emerging Capex',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    mode: 'open_economy_complex',
    mpc: 0.82,
    deltaG: 120,
    deltaT: 0,
    taxRate: 0.15,
    mpi: 0.22,
    targetGdpGap: 250
  },
  {
    name: 'Germany High-Openness / Leakage',
    category: 'Open Trade Drag',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    mode: 'open_economy_complex',
    mpc: 0.70,
    deltaG: 50,
    deltaT: 0,
    taxRate: 0.35,
    mpi: 0.40,
    targetGdpGap: 100
  },
  {
    name: 'Textbook Closed Economy Benchmark',
    category: 'Academic Baseline',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    mode: 'simple_fiscal',
    mpc: 0.80,
    deltaG: 100,
    deltaT: 0,
    taxRate: 0,
    mpi: 0,
    targetGdpGap: 500
  },
  {
    name: 'Balanced Budget Stimulus (Haavelmo 1.0x)',
    category: 'Revenue Neutral',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    mode: 'tax_balanced_budget',
    mpc: 0.85,
    deltaG: 200,
    deltaT: 200,
    taxRate: 0,
    mpi: 0,
    targetGdpGap: 200
  },
  {
    name: 'Direct Household Stimulus Checks',
    category: 'Transfer Payments',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    mode: 'tax_balanced_budget',
    mpc: 0.90,
    deltaG: 0,
    deltaT: -400,
    taxRate: 0.18,
    mpi: 0.15,
    targetGdpGap: 800
  }
];

export default function KeynesianMultiplierCalculator() {
  const [currency, setCurrency] = useState<string>('$');
  const [mode, setMode] = useState<MultiplierMode>('simple_fiscal');

  // Multiplier Inputs
  const [mpc, setMpc] = useState<number>(0.80);
  const [deltaG, setDeltaG] = useState<number>(100);
  const [deltaT, setDeltaT] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0.20);
  const [mpi, setMpi] = useState<number>(0.15);
  const [targetGdpGap, setTargetGdpGap] = useState<number>(500);

  // UI States
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);

  // Apply Preset
  const handleApplyPreset = (preset: PresetScenario) => {
    setMode(preset.mode);
    setMpc(preset.mpc);
    setDeltaG(preset.deltaG);
    setDeltaT(preset.deltaT);
    setTaxRate(preset.taxRate);
    setMpi(preset.mpi);
    setTargetGdpGap(preset.targetGdpGap);
  };

  // Reset to Defaults
  const handleReset = () => {
    handleApplyPreset(PRESETS[3]);
  };

  // Calculations
  const results = useMemo(() => {
    const mps = 1 - mpc;

    // 1. Simple Multiplier (Closed, no tax/import)
    const simpleSpendingMultiplier = mps > 0.001 ? 1 / mps : 0;
    const simpleTaxMultiplier = mps > 0.001 ? -mpc / mps : 0;
    const simpleBalancedBudgetMultiplier = 1.0;
    const simpleDeltaY = (deltaG * simpleSpendingMultiplier) + (deltaT * simpleTaxMultiplier);

    // 2. Open Economy Complex Multiplier (with t and m)
    // PE slope = c * (1 - t) - m
    const peSlope = Math.max(0, mpc * (1 - taxRate) - mpi);
    const marginalPropensityToLeak = 1 - peSlope; // s + c*t + m
    const openSpendingMultiplier = marginalPropensityToLeak > 0.001 ? 1 / marginalPropensityToLeak : 0;
    const openTaxMultiplier = marginalPropensityToLeak > 0.001 ? -mpc / marginalPropensityToLeak : 0;
    const openBalancedBudgetMultiplier = openSpendingMultiplier + openTaxMultiplier; // (1 - c) / (1 - c(1-t) + m)
    const openDeltaY = (deltaG * openSpendingMultiplier) + (deltaT * openTaxMultiplier);

    // Active Multipliers based on Selected Mode
    let activeSpendingMultiplier = simpleSpendingMultiplier;
    let activeTaxMultiplier = simpleTaxMultiplier;
    let activeBalancedMultiplier = simpleBalancedBudgetMultiplier;
    let activeDeltaY = simpleDeltaY;

    if (mode === 'open_economy_complex' || mode === 'target_gdp_stimulus') {
      activeSpendingMultiplier = openSpendingMultiplier;
      activeTaxMultiplier = openTaxMultiplier;
      activeBalancedMultiplier = openBalancedBudgetMultiplier;
      activeDeltaY = openDeltaY;
    } else if (mode === 'tax_balanced_budget') {
      activeSpendingMultiplier = simpleSpendingMultiplier;
      activeTaxMultiplier = simpleTaxMultiplier;
      activeBalancedMultiplier = simpleBalancedBudgetMultiplier;
      activeDeltaY = (deltaG * simpleSpendingMultiplier) + (deltaT * simpleTaxMultiplier);
    }

    // Target GDP Gap Solver
    const requiredDeltaG = activeSpendingMultiplier > 0 ? targetGdpGap / activeSpendingMultiplier : 0;
    const requiredDeltaT = activeTaxMultiplier !== 0 ? targetGdpGap / activeTaxMultiplier : 0;
    const requiredBalancedBudget = activeBalancedMultiplier > 0 ? targetGdpGap / activeBalancedMultiplier : 0;

    // Leakage decomposition percentages
    const savingLeakagePct = marginalPropensityToLeak > 0 ? (mps / marginalPropensityToLeak) * 100 : 0;
    const taxLeakagePct = marginalPropensityToLeak > 0 ? ((mpc * taxRate) / marginalPropensityToLeak) * 100 : 0;
    const importLeakagePct = marginalPropensityToLeak > 0 ? (mpi / marginalPropensityToLeak) * 100 : 0;

    return {
      mps,
      peSlope,
      marginalPropensityToLeak,
      simpleSpendingMultiplier,
      simpleTaxMultiplier,
      simpleBalancedBudgetMultiplier,
      simpleDeltaY,
      openSpendingMultiplier,
      openTaxMultiplier,
      openBalancedBudgetMultiplier,
      openDeltaY,
      activeSpendingMultiplier,
      activeTaxMultiplier,
      activeBalancedMultiplier,
      activeDeltaY,
      requiredDeltaG,
      requiredDeltaT,
      requiredBalancedBudget,
      savingLeakagePct,
      taxLeakagePct,
      importLeakagePct
    };
  }, [mpc, deltaG, deltaT, taxRate, mpi, targetGdpGap, mode]);

  // Multi-Round Geometric Progression Schedule (Rounds 1 to 10)
  const roundProgression = useMemo(() => {
    const rounds = [];
    const isComplex = mode === 'open_economy_complex' || mode === 'target_gdp_stimulus';
    const effectiveSpendRate = isComplex ? results.peSlope : mpc;
    const baseInjection = deltaG > 0 ? deltaG : Math.abs(deltaT * mpc);

    let cumulativeExpansion = 0;
    const totalTheoretical = results.activeSpendingMultiplier * (deltaG > 0 ? deltaG : Math.abs(deltaT * mpc));

    for (let r = 1; r <= 10; r++) {
      const roundInjection = baseInjection * Math.pow(effectiveSpendRate, r - 1);
      const inducedConsumption = roundInjection * (isComplex ? mpc * (1 - taxRate) : mpc);
      const inducedSavings = roundInjection * (1 - mpc);
      const inducedTaxes = isComplex ? roundInjection * taxRate : 0;
      const inducedImports = isComplex ? roundInjection * mpi : 0;
      
      cumulativeExpansion += roundInjection;
      const pctOfTotal = totalTheoretical > 0 ? (cumulativeExpansion / totalTheoretical) * 100 : 0;

      rounds.push({
        round: r,
        roundInjection,
        inducedConsumption,
        inducedSavings,
        inducedTaxes,
        inducedImports,
        cumulativeExpansion,
        pctOfTotal
      });
    }

    return rounds;
  }, [mode, results.peSlope, mpc, deltaG, deltaT, results.activeSpendingMultiplier, taxRate, mpi]);

  // 5x5 Sensitivity Matrix: MPC vs Government Spending Shock (delta G)
  const sensitivityMatrix = useMemo(() => {
    const mpcList = [0.60, 0.70, 0.75, 0.80, 0.90];
    const injectionList = [25, 50, 100, 200, 500];

    return mpcList.map((mVal) => {
      const row = injectionList.map((inj) => {
        const isComplex = mode === 'open_economy_complex';
        const slope = isComplex ? Math.max(0, mVal * (1 - taxRate) - mpi) : mVal;
        const leakage = 1 - slope;
        const mult = leakage > 0.001 ? 1 / leakage : 0;
        const totalExpansion = mult * inj;

        return {
          inj,
          totalExpansion,
          mult,
          isBaseline: Math.abs(mVal - mpc) < 0.03 && Math.abs(inj - deltaG) < 5
        };
      });
      return { mpc: mVal, cells: row };
    });
  }, [mpc, deltaG, taxRate, mpi, mode]);

  // SVG Chart Data: Wavelet Multi-Round Decay Bar/Line Chart
  const svgData = useMemo(() => {
    const width = 640;
    const height = 300;
    const padding = { top: 25, right: 35, bottom: 45, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxRoundVal = Math.max(...roundProgression.map(r => r.roundInjection), 10);
    const maxCumVal = Math.max(...roundProgression.map(r => r.cumulativeExpansion), 50);

    const xScale = (idx: number) => padding.left + (idx / (roundProgression.length - 1)) * chartW;
    const yScaleBar = (val: number) => padding.top + chartH - (val / maxRoundVal) * chartH;
    const yScaleCum = (val: number) => padding.top + chartH - (val / maxCumVal) * chartH;

    // Cumulative Path string
    const pathD = roundProgression.reduce((acc, r, i) => {
      const x = xScale(i);
      const y = yScaleCum(r.cumulativeExpansion);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');

    // Area Path
    const areaD = `${pathD} L ${xScale(roundProgression.length - 1)} ${padding.top + chartH} L ${xScale(0)} ${padding.top + chartH} Z`;

    return {
      width,
      height,
      padding,
      chartW,
      chartH,
      maxRoundVal,
      maxCumVal,
      xScale,
      yScaleBar,
      yScaleCum,
      pathD,
      areaD
    };
  }, [roundProgression]);

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
            <span className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl">
              <Zap className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Keynesian Fiscal Multiplier & Stimulus Expansion Suite
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Compute simple spending multipliers (k = 1 / (1-MPC)), tax cuts, Haavelmo balanced budget, open-economy leakages, and output gap solvers.
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
            Macroeconomic Presets & Historical Benchmarks
          </span>
          <span className="text-xs text-zinc-400">Load calibrated real-world scenario</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="p-3 text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${p.badgeColor}`}>
                  {p.category}
                </span>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
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
          onClick={() => setMode('simple_fiscal')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'simple_fiscal'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Simple Multiplier (1/MPS)</span>
        </button>

        <button
          onClick={() => setMode('tax_balanced_budget')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'tax_balanced_budget'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Tax & Balanced Budget</span>
        </button>

        <button
          onClick={() => setMode('open_economy_complex')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'open_economy_complex'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Open Economy & Leakages</span>
        </button>

        <button
          onClick={() => setMode('target_gdp_stimulus')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'target_gdp_stimulus'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Output Gap Solver</span>
        </button>
      </div>

      {/* Main Grid: Input Form + Hero Metric Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                Multiplier Parameters
              </span>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
              >
                {showAdvanced ? 'Hide Structural' : 'Show Structural'}
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Core Propensities & Primary Injections */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Marginal Propensity to Consume (MPC c)
                  </label>
                  <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    MPS (s) = {results.mps.toFixed(2)}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="0.99"
                  value={mpc}
                  onChange={(e) => setMpc(Math.min(0.99, Math.max(0.01, parseFloat(e.target.value) || 0)))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                  <span>0.0 (100% saved)</span>
                  <span>Baseline: 0.80</span>
                  <span>1.0 (100% consumed)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Government Spending Shock ({currency}ΔG)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-mono">{currency}</span>
                  <input
                    type="number"
                    value={deltaG}
                    onChange={(e) => setDeltaG(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {mode === 'tax_balanced_budget' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Lump-Sum Tax Change ({currency}ΔT, Negative for Tax Cut)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-mono">{currency}</span>
                    <input
                      type="number"
                      value={deltaT}
                      onChange={(e) => setDeltaT(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {mode === 'target_gdp_stimulus' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Target Output Expansion Required ({currency}ΔY Goal)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-mono">{currency}</span>
                    <input
                      type="number"
                      value={targetGdpGap}
                      onChange={(e) => setTargetGdpGap(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Structural Leakages */}
            {showAdvanced && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Open Economy & Fiscal Leakage Parameters
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Income Tax Rate (t) %
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="70"
                      value={+(taxRate * 100).toFixed(1)}
                      onChange={(e) => setTaxRate(Math.min(0.8, Math.max(0, (parseFloat(e.target.value) || 0) / 100)))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Import Propensity (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="0.8"
                      value={mpi}
                      onChange={(e) => setMpi(Math.min(0.8, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Hero Metric & Multiplier Overview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-800/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-indigo-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  {mode === 'target_gdp_stimulus'
                    ? 'Required Discretionary Stimulus (ΔG)'
                    : 'Fiscal Spending Multiplier (k)'}
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono my-2 tracking-tight text-white flex items-baseline gap-2">
                  {mode === 'target_gdp_stimulus' ? (
                    <span>{currency}{results.requiredDeltaG.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-sm font-normal text-indigo-200">Billion</span></span>
                  ) : (
                    <span>{results.activeSpendingMultiplier.toFixed(2)}<span className="text-2xl font-normal text-indigo-200">x</span></span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Total Expansion ΔY
                </span>
                <p className="text-lg font-bold font-mono text-emerald-300 mt-1">
                  +{currency}{results.activeDeltaY.toLocaleString(undefined, { maximumFractionDigits: 1 })} B
                </p>
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-white/10 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-indigo-300 block text-[10px] font-medium uppercase">Marginal Prop. to Save</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.mps.toFixed(2)}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-indigo-300 block text-[10px] font-medium uppercase">Tax Multiplier (k_T)</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.activeTaxMultiplier.toFixed(2)}x
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-indigo-300 block text-[10px] font-medium uppercase">Balanced Budget (k_BB)</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.activeBalancedMultiplier.toFixed(2)}x
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-indigo-300 block text-[10px] font-medium uppercase">Total Leakage Rate</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.marginalPropensityToLeak.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Leakage Source Distribution Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Macroeconomic Leakage Channels (Denominator Decomposition)
              </span>
              <span className="text-zinc-400 font-mono text-[11px]">Total Leakage = 100%</span>
            </div>

            <div className="w-full h-4 rounded-full overflow-hidden flex bg-zinc-100 dark:bg-zinc-800">
              <div
                style={{ width: `${Math.max(0, results.savingLeakagePct)}%` }}
                className="bg-blue-500 h-full transition-all"
                title={`Savings Leakage: ${results.savingLeakagePct.toFixed(1)}%`}
              />
              <div
                style={{ width: `${Math.max(0, results.taxLeakagePct)}%` }}
                className="bg-purple-500 h-full transition-all"
                title={`Tax Leakage: ${results.taxLeakagePct.toFixed(1)}%`}
              />
              <div
                style={{ width: `${Math.max(0, results.importLeakagePct)}%` }}
                className="bg-rose-500 h-full transition-all"
                title={`Import Leakage: ${results.importLeakagePct.toFixed(1)}%`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">Private Saving (MPS)</span>
                </div>
                <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                  {results.savingLeakagePct.toFixed(1)}%
                </span>
              </div>

              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">Tax Siphon (c·t)</span>
                </div>
                <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                  {results.taxLeakagePct.toFixed(1)}%
                </span>
              </div>

              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">Import Drain (m)</span>
                </div>
                <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                  {results.importLeakagePct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Multi-Round Wavelet Decay & Cumulative Expansion Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Multi-Round Geometric Progression & Ripple Decay Waveform
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Visualizes the sequential injection rounds converging asymptotically toward total output expansion ΔY.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500/80" />
              <span className="text-zinc-500">Round Injection (ΔY_r)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 font-bold" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Cumulative Output (ΣΔY)</span>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl p-2 border border-zinc-100 dark:border-zinc-800">
          <svg
            viewBox={`0 0 ${svgData.width} ${svgData.height}`}
            className="w-full h-auto max-h-[340px] font-sans select-none"
          >
            <defs>
              <linearGradient id="cumGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Shaded Cumulative Area */}
            <path d={svgData.areaD} fill="url(#cumGradient)" />

            {/* Bars for Individual Round Injections */}
            {roundProgression.map((r, idx) => {
              const xCenter = svgData.xScale(idx);
              const barW = 28;
              const yTop = svgData.yScaleBar(r.roundInjection);
              const barH = svgData.padding.top + svgData.chartH - yTop;

              return (
                <g key={`bar-${idx}`}>
                  <rect
                    x={xCenter - barW / 2}
                    y={yTop}
                    width={barW}
                    height={Math.max(2, barH)}
                    rx="4"
                    className="fill-indigo-500/80 dark:fill-indigo-600/80 hover:fill-indigo-600 transition-colors"
                  />
                  <text
                    x={xCenter}
                    y={svgData.padding.top + svgData.chartH + 16}
                    textAnchor="middle"
                    className="text-[10px] fill-zinc-500 font-mono"
                  >
                    R{r.round}
                  </text>
                  <text
                    x={xCenter}
                    y={yTop - 4}
                    textAnchor="middle"
                    className="text-[9px] fill-indigo-600 dark:fill-indigo-400 font-mono font-bold"
                  >
                    {r.roundInjection.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Cumulative Line */}
            <path
              d={svgData.pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Data Points on Cumulative Line */}
            {roundProgression.map((r, idx) => {
              const cx = svgData.xScale(idx);
              const cy = svgData.yScaleCum(r.cumulativeExpansion);

              return (
                <circle
                  key={`pt-${idx}`}
                  cx={cx}
                  cy={cy}
                  r="4"
                  className="fill-emerald-500 stroke-white dark:stroke-zinc-900 stroke-2"
                />
              );
            })}

            {/* Axis Titles */}
            <text
              x={svgData.padding.left + svgData.chartW / 2}
              y={svgData.height - 6}
              textAnchor="middle"
              className="text-xs font-semibold fill-zinc-600 dark:fill-zinc-400"
            >
              Sequential Spending Rounds (Geometric Progression)
            </text>
            <text
              transform={`rotate(-90) translate(-${svgData.padding.top + svgData.chartH / 2}, 16)`}
              textAnchor="middle"
              className="text-xs font-semibold fill-zinc-600 dark:fill-zinc-400"
            >
              Expansion Magnitude [{currency} Billions]
            </text>
          </svg>
        </div>
      </div>

      {/* 10-Round Cumulative Expansion Schedule Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              Round-by-Round Geometric Progression Schedule
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Detailed tracking of induced consumption and leakages at each iterative step of the multiplier wave.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-700">
                <th className="py-2.5 px-3">Round</th>
                <th className="py-2.5 px-3">Round Injection (ΔY_r)</th>
                <th className="py-2.5 px-3">Induced Cons. (C)</th>
                <th className="py-2.5 px-3">Saving Leakage (S)</th>
                <th className="py-2.5 px-3">Tax Leakage (T)</th>
                <th className="py-2.5 px-3">Import Leakage (M)</th>
                <th className="py-2.5 px-3">Cumulative GDP</th>
                <th className="py-2.5 px-3">% Realized</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {roundProgression.map((r) => (
                <tr key={r.round} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">Round {r.round}</td>
                  <td className="py-2 px-3 text-zinc-900 dark:text-zinc-100 font-bold">{currency}{r.roundInjection.toFixed(2)}</td>
                  <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{currency}{r.inducedConsumption.toFixed(2)}</td>
                  <td className="py-2 px-3 text-blue-600 dark:text-blue-400">{currency}{r.inducedSavings.toFixed(2)}</td>
                  <td className="py-2 px-3 text-purple-600 dark:text-purple-400">{currency}{r.inducedTaxes.toFixed(2)}</td>
                  <td className="py-2 px-3 text-rose-600 dark:text-rose-400">{currency}{r.inducedImports.toFixed(2)}</td>
                  <td className="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-400">{currency}{r.cumulativeExpansion.toFixed(2)}</td>
                  <td className="py-2 px-3 text-zinc-500">{r.pctOfTotal.toFixed(1)}%</td>
                </tr>
              ))}
              <tr className="bg-indigo-50/80 dark:bg-indigo-950/60 font-bold border-t-2 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200">
                <td className="py-2.5 px-3 font-sans uppercase text-[11px]">Infinite Limit (Σ)</td>
                <td className="py-2.5 px-3 font-sans text-xs">—</td>
                <td className="py-2.5 px-3 font-sans text-xs">—</td>
                <td className="py-2.5 px-3 font-sans text-xs">—</td>
                <td className="py-2.5 px-3 font-sans text-xs">—</td>
                <td className="py-2.5 px-3 font-sans text-xs">—</td>
                <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-300 text-sm">
                  {currency}{results.activeDeltaY.toFixed(2)} B
                </td>
                <td className="py-2.5 px-3 font-sans text-xs">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5x5 Sensitivity Matrix: MPC vs Initial Fiscal Injection */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-500" />
              5×5 Sensitivity Matrix: MPC vs Fiscal Injection Outlay (ΔG)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Total Economic GDP Expansion (ΔY) across combinations of consumer spending propensities and initial stimulus sizes.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <th className="p-2.5 text-left border border-zinc-200 dark:border-zinc-700 font-semibold">
                  MPC (c) \ Injection (ΔG)
                </th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">{currency}25 B</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">{currency}50 B</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700 font-bold text-indigo-600 dark:text-indigo-400">{currency}100 B</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">{currency}200 B</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">{currency}500 B</th>
              </tr>
            </thead>
            <tbody>
              {sensitivityMatrix.map((row) => (
                <tr key={row.mpc} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-2 text-left font-bold font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200">
                    c = {row.mpc.toFixed(2)} (MPS = {(1 - row.mpc).toFixed(2)})
                  </td>
                  {row.cells.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`p-2 border border-zinc-200 dark:border-zinc-700 font-mono ${
                        cell.isBaseline
                          ? 'bg-indigo-100 dark:bg-indigo-900/60 font-black text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="font-bold">{currency}{cell.totalExpansion.toFixed(0)} B</div>
                      <div className="text-[10px] text-zinc-400 font-sans">k = {cell.mult.toFixed(2)}x</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LaTeX Formal Proofs & Derivations */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Formal Keynesian Multiplier Derivations & Proofs
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Rigorous mathematical proofs formatted in LaTeX. Click any equation block to copy for research.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Proof 1: Geometric Series Derivation */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">1. Geometric Series Spending Multiplier Proof</span>
              <button
                onClick={() => copyToClipboard('\Delta Y = \Delta G \sum_{n=0}^{\infty} c^n = \frac{\Delta G}{1 - c} = \frac{\Delta G}{MPS}', 'geom_proof')}
                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'geom_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-indigo-900 dark:text-indigo-300 overflow-x-auto">
              {"\Delta Y = \Delta G + c\Delta G + c^2\Delta G + c^3\Delta G + \dots"}
              <br />
              {"\Delta Y = \Delta G \left( \sum_{n=0}^{\infty} c^n \right) = \frac{\Delta G}{1 - c}"}
              <br />
              {"\implies k_G = \frac{\Delta Y}{\Delta G} = \frac{1}{1 - MPC} = \frac{1}{MPS}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              For any 0 &lt; c &lt; 1, the infinite geometric series converges exactly to 1 / (1 - c).
            </p>
          </div>

          {/* Proof 2: Lump-Sum Tax Multiplier */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">2. Lump-Sum Tax Multiplier Derivation</span>
              <button
                onClick={() => copyToClipboard('k_T = \frac{\partial Y}{\partial T} = \frac{-c}{1 - c} = \frac{-MPC}{MPS}', 'tax_proof')}
                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'tax_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-indigo-900 dark:text-indigo-300 overflow-x-auto">
              {"\Delta Y_T = -c\Delta T - c^2\Delta T - c^3\Delta T - \dots"}
              <br />
              {"\Delta Y_T = -c\Delta T \left( \frac{1}{1 - c} \right)"}
              <br />
              {"\implies k_T = \frac{-c}{1 - c} = -\frac{MPC}{MPS}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              The tax multiplier is strictly smaller in magnitude than the spending multiplier because consumers save part of tax cuts.
            </p>
          </div>

          {/* Proof 3: Haavelmo Balanced Budget Multiplier */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">3. Haavelmo Balanced Budget Multiplier Theorem</span>
              <button
                onClick={() => copyToClipboard('k_{BB} = k_G + k_T = \frac{1}{1 - c} + \frac{-c}{1 - c} = \frac{1 - c}{1 - c} = 1.0', 'bb_proof')}
                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'bb_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-indigo-900 dark:text-indigo-300 overflow-x-auto">
              {"\text{Let } \Delta G = \Delta T"}
              <br />
              {"\Delta Y = k_G \Delta G + k_T \Delta T = (k_G + k_T)\Delta G"}
              <br />
              {"k_{BB} = \frac{1 - c}{1 - c} = 1.0 \implies \Delta Y = \Delta G"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Proves that a 100% tax-financed spending increase still expands national output by exactly the amount spent.
            </p>
          </div>

          {/* Proof 4: Open-Economy Complex Multiplier */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">4. Open-Economy Multiplier with Taxes & Imports</span>
              <button
                onClick={() => copyToClipboard('k_{\text{open}} = \frac{1}{1 - c(1 - t) + m} = \frac{1}{s + c\cdot t + m}', 'open_proof')}
                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'open_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-indigo-900 dark:text-indigo-300 overflow-x-auto">
              {"Y = C_0 + c(1 - t)Y + I_0 + G_0 + X_0 - (M_0 + mY)"}
              <br />
              {"Y[1 - c(1 - t) + m] = A_0"}
              <br />
              {"\implies k_{\text{open}} = \frac{1}{1 - c(1 - t) + m} = \frac{1}{\text{Marginal Propensity to Leak}}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Higher proportional taxes (t) and marginal import propensity (m) enlarge leakages and act as automatic stabilizers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
