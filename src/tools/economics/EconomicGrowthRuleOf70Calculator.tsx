import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2,
  Sliders, ChevronDown, ChevronUp,
  Calculator, Layers, Scale,
  Activity, TrendingUp,
  Clock, ShieldCheck, Target, Globe
} from 'lucide-react';

type CalculationMode = 'rule_of_70' | 'trajectory_projection' | 'convergence_catchup' | 'target_milestone';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  initialValue: number;
  growthRate: number;
  years: number;
  // Convergence Mode
  countryBInitial: number;
  countryBGrowth: number;
  // Target Mode
  targetGoal: number;
  targetHorizon: number;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'India $5T / Fast-Track Expansion',
    category: 'High Growth',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    mode: 'target_milestone',
    initialValue: 3800,
    growthRate: 7.0,
    years: 20,
    countryBInitial: 28000,
    countryBGrowth: 2.2,
    targetGoal: 5000,
    targetHorizon: 4
  },
  {
    name: 'China Miracle Era (1990–2010)',
    category: 'Historical Miracle',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    mode: 'rule_of_70',
    initialValue: 1200,
    growthRate: 9.5,
    years: 25,
    countryBInitial: 10000,
    countryBGrowth: 2.5,
    targetGoal: 10000,
    targetHorizon: 20
  },
  {
    name: 'US Mature Developed Economy',
    category: 'Mature Benchmark',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    mode: 'trajectory_projection',
    initialValue: 28000,
    growthRate: 2.2,
    years: 30,
    countryBInitial: 30000,
    countryBGrowth: 2.0,
    targetGoal: 40000,
    targetHorizon: 15
  },
  {
    name: 'Emerging vs. Developed Catch-Up',
    category: 'Convergence',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    mode: 'convergence_catchup',
    initialValue: 4000,
    growthRate: 6.5,
    years: 35,
    countryBInitial: 20000,
    countryBGrowth: 1.8,
    targetGoal: 20000,
    targetHorizon: 25
  },
  {
    name: 'Asian Tigers Hyper-Growth',
    category: 'Industrialization',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    mode: 'trajectory_projection',
    initialValue: 250,
    growthRate: 8.2,
    years: 25,
    countryBInitial: 3000,
    countryBGrowth: 2.0,
    targetGoal: 2000,
    targetHorizon: 25
  },
  {
    name: 'Low Growth / Secular Stagnation',
    category: 'Slow Compounding',
    badgeColor: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    mode: 'rule_of_70',
    initialValue: 5000,
    growthRate: 1.0,
    years: 50,
    countryBInitial: 15000,
    countryBGrowth: 2.0,
    targetGoal: 10000,
    targetHorizon: 40
  }
];

export default function EconomicGrowthRuleOf70Calculator() {
  const [currency, setCurrency] = useState<string>('$');
  const [mode, setMode] = useState<CalculationMode>('rule_of_70');

  // Input states
  const [initialValue, setInitialValue] = useState<number>(3800); // e.g. GDP in Billions
  const [growthRate, setGrowthRate] = useState<number>(7.0); // %
  const [years, setYears] = useState<number>(20);

  // Convergence Mode states
  const [countryBInitial, setCountryBInitial] = useState<number>(28000);
  const [countryBGrowth, setCountryBGrowth] = useState<number>(2.2);

  // Target Milestone states
  const [targetGoal, setTargetGoal] = useState<number>(5000);
  const [targetHorizon, setTargetHorizon] = useState<number>(4);

  // UI state
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Formatter helpers
  const formatMoney = (val: number, maxFrac = 0) => {
    return `${currency}${val.toLocaleString(undefined, { maximumFractionDigits: maxFrac, minimumFractionDigits: maxFrac })}`;
  };

  // Load Preset
  const handleApplyPreset = (p: PresetScenario) => {
    setMode(p.mode);
    setInitialValue(p.initialValue);
    setGrowthRate(p.growthRate);
    setYears(p.years);
    setCountryBInitial(p.countryBInitial);
    setCountryBGrowth(p.countryBGrowth);
    setTargetGoal(p.targetGoal);
    setTargetHorizon(p.targetHorizon);
  };

  // Reset to Defaults
  const handleReset = () => {
    setMode('rule_of_70');
    setInitialValue(3800);
    setGrowthRate(7.0);
    setYears(20);
    setCountryBInitial(28000);
    setCountryBGrowth(2.2);
    setTargetGoal(5000);
    setTargetHorizon(4);
  };

  // Copy Formula Helper
  const handleCopyFormula = (latex: string, label: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedFormula(label);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  // Core Math Calculations
  const calc = useMemo(() => {
    const g = growthRate / 100;
    const t = Math.max(1, Math.min(50, years));

    // 1. Rule of 70, 72, 69.3 vs Exact Doubling
    const ruleOf70Years = growthRate > 0 ? 70 / growthRate : Infinity;
    const ruleOf72Years = growthRate > 0 ? 72 / growthRate : Infinity;
    const ruleOf693Years = growthRate > 0 ? 69.3 / growthRate : Infinity;
    const exactDoublingYears = g > 0 ? Math.log(2) / Math.log(1 + g) : Infinity;
    const exactTriplingYears = g > 0 ? Math.log(3) / Math.log(1 + g) : Infinity;
    const exact10xYears = g > 0 ? Math.log(10) / Math.log(1 + g) : Infinity;
    const rule70ErrorYears = ruleOf70Years - exactDoublingYears;

    // 2. Multi-Horizon Compounding Trajectory
    const futureValue = initialValue * Math.pow(1 + g, t);
    const cumulativeGrowthNominal = futureValue - initialValue;
    const cumulativeMultiplier = initialValue > 0 ? futureValue / initialValue : 1;
    const valueIn10 = initialValue * Math.pow(1 + g, 10);
    const valueIn20 = initialValue * Math.pow(1 + g, 20);
    const valueIn30 = initialValue * Math.pow(1 + g, 30);

    // 3. Two-Country Convergence Catch-Up
    const gB = countryBGrowth / 100;
    let convergenceYears = Infinity;
    if (g > gB && initialValue > 0 && countryBInitial > 0) {
      if (initialValue >= countryBInitial) {
        convergenceYears = 0;
      } else {
        convergenceYears = (Math.log(countryBInitial / initialValue)) / (Math.log(1 + g) - Math.log(1 + gB));
      }
    }
    const countryAFutureAtConvergence = initialValue * Math.pow(1 + g, Math.min(100, Math.max(0, convergenceYears)));
    const growthDifferential = growthRate - countryBGrowth;

    // 4. Target Milestone Required Growth Rate
    const tH = Math.max(1, targetHorizon);
    const requiredGrowthRate = initialValue > 0 && targetGoal > 0
      ? (Math.pow(targetGoal / initialValue, 1 / tH) - 1) * 100
      : 0;
    const targetSurgeMultiplier = initialValue > 0 ? targetGoal / initialValue : 1;

    return {
      t,
      g,
      ruleOf70Years,
      ruleOf72Years,
      ruleOf693Years,
      exactDoublingYears,
      exactTriplingYears,
      exact10xYears,
      rule70ErrorYears,
      futureValue,
      cumulativeGrowthNominal,
      cumulativeMultiplier,
      valueIn10,
      valueIn20,
      valueIn30,
      convergenceYears,
      countryAFutureAtConvergence,
      growthDifferential,
      requiredGrowthRate,
      targetSurgeMultiplier
    };
  }, [initialValue, growthRate, years, countryBInitial, countryBGrowth, targetGoal, targetHorizon]);

  // Year-by-Year Multi-Year Schedule
  const scheduleData = useMemo(() => {
    const horizon = calc.t;
    const g = calc.g;
    const base = initialValue;
    const gB = countryBGrowth / 100;
    const baseB = countryBInitial;

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
      const val = base * Math.pow(1 + g, yr);
      const added = val - base;
      const mult = val / base;
      const valB = baseB * Math.pow(1 + gB, yr);

      return {
        year: yr,
        val,
        added,
        mult,
        valB
      };
    });
  }, [calc.t, calc.g, initialValue, countryBGrowth, countryBInitial]);

  // SVG Chart Geometry
  const chartGeometry = useMemo(() => {
    const width = 620;
    const height = 280;
    const padding = { top: 30, right: 30, bottom: 40, left: 65 };

    const maxYears = calc.t;
    const pointsCount = Math.max(20, maxYears);
    const dataPoints: { yr: number; valA: number; valB: number }[] = [];

    const baseA = initialValue;
    const gA = calc.g;
    const baseB = countryBInitial;
    const gB = countryBGrowth / 100;

    for (let i = 0; i <= pointsCount; i++) {
      const yr = (i / pointsCount) * maxYears;
      const valA = baseA * Math.pow(1 + gA, yr);
      const valB = mode === 'convergence_catchup' ? baseB * Math.pow(1 + gB, yr) : 0;
      dataPoints.push({ yr, valA, valB });
    }

    const maxY = mode === 'convergence_catchup'
      ? Math.max(...dataPoints.map(d => Math.max(d.valA, d.valB))) * 1.1
      : Math.max(...dataPoints.map(d => d.valA)) * 1.1;

    const scaleX = (yr: number) => padding.left + (yr / maxYears) * (width - padding.left - padding.right);
    const scaleY = (v: number) => height - padding.bottom - (v / maxY) * (height - padding.top - padding.bottom);

    // Country A Curve
    let pathA = '';
    dataPoints.forEach((pt, idx) => {
      const x = scaleX(pt.yr);
      const y = scaleY(pt.valA);
      if (idx === 0) pathA += `M ${x} ${y}`;
      else pathA += ` L ${x} ${y}`;
    });

    // Area under Country A
    let areaA = pathA;
    areaA += ` L ${scaleX(maxYears)} ${scaleY(0)} L ${scaleX(0)} ${scaleY(0)} Z`;

    // Country B Curve
    let pathB = '';
    if (mode === 'convergence_catchup') {
      dataPoints.forEach((pt, idx) => {
        const x = scaleX(pt.yr);
        const y = scaleY(pt.valB);
        if (idx === 0) pathB += `M ${x} ${y}`;
        else pathB += ` L ${x} ${y}`;
      });
    }

    // Doubling Point
    const doublePt = calc.exactDoublingYears <= maxYears ? {
      x: scaleX(calc.exactDoublingYears),
      y: scaleY(baseA * 2)
    } : null;

    // Convergence Point
    const convPt = calc.convergenceYears <= maxYears ? {
      x: scaleX(calc.convergenceYears),
      y: scaleY(calc.countryAFutureAtConvergence)
    } : null;

    return {
      width,
      height,
      padding,
      scaleX,
      scaleY,
      pathA,
      areaA,
      pathB,
      doublePt,
      convPt,
      maxY
    };
  }, [calc.t, calc.g, calc.exactDoublingYears, calc.convergenceYears, calc.countryAFutureAtConvergence, initialValue, countryBInitial, countryBGrowth, mode]);

  // 5x5 Sensitivity Matrix: Growth Rate vs. Horizon
  const sensitivityMatrix = useMemo(() => {
    const growthSteps = [1.5, 3.0, 5.0, 7.0, 10.0]; // %
    const yearSteps = [5, 10, 20, 30, 50]; // Years
    const base = initialValue;

    return {
      growthSteps,
      yearSteps,
      rows: growthSteps.map((rate) => {
        const rDec = rate / 100;
        return {
          rate,
          cells: yearSteps.map((yr) => {
            const val = base * Math.pow(1 + rDec, yr);
            const mult = val / base;
            return {
              years: yr,
              val,
              mult
            };
          })
        };
      })
    };
  }, [initialValue]);

  // LaTeX Proofs
  const latexRule70 = `T_{70} = \\frac{70}{g} = \\frac{70}{${growthRate.toFixed(1)}} = ${calc.ruleOf70Years === Infinity ? '\\infty' : calc.ruleOf70Years.toFixed(2)} \\text{ Years}`;
  const latexExact = `T_{\\text{exact}} = \\frac{\\ln(2)}{\\ln(1 + g)} = \\frac{0.69315}{\\ln(1 + ${(growthRate/100).toFixed(3)})} = ${calc.exactDoublingYears === Infinity ? '\\infty' : calc.exactDoublingYears.toFixed(2)} \\text{ Years}`;
  const latexOutput = `Y(t) = Y_0 \\times (1 + g)^t = ${initialValue.toLocaleString()} \\times (1 + ${(growthRate/100).toFixed(3)})^{${calc.t}} = ${formatMoney(calc.futureValue, 1)}`;
  const latexConvergence = `t^* = \\frac{\\ln(Y_{B,0} / Y_{A,0})}{\\ln(1 + g_A) - \\ln(1 + g_B)} = \\frac{\\ln(${countryBInitial} / ${initialValue})}{\\ln(1 + ${(growthRate/100).toFixed(3)}) - \\ln(1 + ${(countryBGrowth/100).toFixed(3)})} = ${calc.convergenceYears === Infinity ? '\\infty' : calc.convergenceYears.toFixed(2)} \\text{ Years}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left pb-12">
      {/* Top Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Macroeconomic Presets & Mode Selector</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Simulate GDP doubling times, exponential compounding, and economic convergence</p>
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
              className="p-2.5 rounded-2xl text-left border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 bg-zinc-50/50 dark:bg-zinc-800/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className={`inline-block px-1.5 py-0.5 rounded-md text-[10px] font-bold ${preset.badgeColor} mb-1`}>
                  {preset.category}
                </span>
                <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-1">
                  {preset.name}
                </div>
              </div>
              <div className="text-[11px] text-zinc-500 mt-1 font-mono font-medium">
                {preset.growthRate}% g / {preset.years}y
              </div>
            </button>
          ))}
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setMode('rule_of_70')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'rule_of_70'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            1. Rule of 70 / 72 Doubling
          </button>
          <button
            onClick={() => setMode('trajectory_projection')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'trajectory_projection'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            2. Multi-Horizon Compounding
          </button>
          <button
            onClick={() => setMode('convergence_catchup')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'convergence_catchup'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            3. Two-Country Catch-Up
          </button>
          <button
            onClick={() => setMode('target_milestone')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'target_milestone'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            4. Required Growth Solver
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
                  {mode === 'rule_of_70' && 'Growth Rate & Baseline GDP'}
                  {mode === 'trajectory_projection' && 'Projection Horizon Parameters'}
                  {mode === 'convergence_catchup' && 'Two-Country Growth Parameters'}
                  {mode === 'target_milestone' && 'Milestone Target & Deadline'}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-bold">
                Solow / Compound
              </span>
            </div>

            {/* Primary Base Inputs */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Baseline Output / GDP ({currency} Billions or Per Capita)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatMoney(initialValue)}
                </span>
              </div>
              <input
                type="number"
                min="1"
                step="100"
                value={initialValue}
                onChange={(e) => setInitialValue(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Growth Rate Slider & Input (for modes other than reverse target) */}
            {mode !== 'target_milestone' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    Annual Compound Growth Rate (g %)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.1"
                      max="20"
                      step="0.1"
                      value={growthRate}
                      onChange={(e) => setGrowthRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                      className="w-16 px-2 py-1 text-right bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold"
                    />
                    <span className="text-xs font-bold text-zinc-500">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="14"
                  step="0.25"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(parseFloat(e.target.value) || 0.5)}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>1.0% (Mature/Slow)</span>
                  <span>4.0% (Moderate)</span>
                  <span>7.0% (Fast Expansion)</span>
                  <span>12.0% (Hyper Growth)</span>
                </div>
              </div>
            )}

            {/* Time Horizon Slider */}
            {mode !== 'target_milestone' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    Projection Horizon (Years)
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
            )}

            {/* Convergence Country B Inputs */}
            {mode === 'convergence_catchup' && (
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  Benchmark Developed Economy (Country B)
                </h4>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                      Country B Baseline GDP ({currency}B)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                      {formatMoney(countryBInitial)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="500"
                    value={countryBInitial}
                    onChange={(e) => setCountryBInitial(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                      Country B Annual Growth Rate (g_B %)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                      {countryBGrowth.toFixed(1)}% / yr
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6.0"
                    step="0.1"
                    value={countryBGrowth}
                    onChange={(e) => setCountryBGrowth(parseFloat(e.target.value) || 0.5)}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Target Milestone Inputs */}
            {mode === 'target_milestone' && (
              <div className="space-y-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Target Desired GDP Output ({currency} Billions)
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(targetGoal)}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="500"
                    value={targetGoal}
                    onChange={(e) => setTargetGoal(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Target Milestone Horizon (Years to Achieve)
                    </label>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {targetHorizon} Years
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={targetHorizon}
                    onChange={(e) => setTargetHorizon(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Mathematical Diagnostics Card */}
          <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              Doubling Rule Comparison
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-500 block">Rule of 70 Doubling</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {calc.ruleOf70Years === Infinity ? 'N/A' : `${calc.ruleOf70Years.toFixed(1)} Yrs`}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">70 ÷ {growthRate}%</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-500 block">Exact Logarithmic Doubling</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {calc.exactDoublingYears === Infinity ? 'N/A' : `${calc.exactDoublingYears.toFixed(2)} Yrs`}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">ln(2) ÷ ln(1+g)</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-500 block">Tripling Time (3×)</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {calc.exactTriplingYears === Infinity ? 'N/A' : `${calc.exactTriplingYears.toFixed(1)} Yrs`}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">Output reaches 3× base</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-500 block">Decupling Time (10×)</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm">
                  {calc.exact10xYears === Infinity ? 'N/A' : `${calc.exact10xYears.toFixed(1)} Yrs`}
                </span>
                <span className="text-[9px] text-zinc-400 block mt-0.5">10× Order of magnitude</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output & Visualization Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Gradient Result Card */}
          <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-emerald-300 backdrop-blur-md flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  {mode === 'rule_of_70' && 'Exact Doubling Time Horizon'}
                  {mode === 'trajectory_projection' && `Projected Output in Year ${calc.t}`}
                  {mode === 'convergence_catchup' && 'Economic Convergence Crossover'}
                  {mode === 'target_milestone' && `Required Annual Growth Rate`}
                </span>
                <span className="text-xs text-emerald-200/80 font-mono">
                  {mode === 'target_milestone'
                    ? `${targetHorizon} Years to reach ${formatMoney(targetGoal)}`
                    : `${calc.t} Yrs @ ${growthRate}% Growth`}
                </span>
              </div>

              {/* Primary Output Display */}
              <div>
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white flex items-baseline gap-2">
                  {mode === 'rule_of_70' && `${calc.exactDoublingYears.toFixed(1)} Years`}
                  {mode === 'trajectory_projection' && formatMoney(calc.futureValue, 1)}
                  {mode === 'convergence_catchup' && (calc.convergenceYears === Infinity ? 'No Catch-Up' : `${calc.convergenceYears.toFixed(1)} Years`)}
                  {mode === 'target_milestone' && `${calc.requiredGrowthRate.toFixed(2)}% / yr`}
                </div>

                <div className="text-xs sm:text-sm text-emerald-200 font-medium mt-1">
                  {mode === 'rule_of_70' && (
                    <>
                      Rule of 70: <span className="font-bold text-white">{calc.ruleOf70Years.toFixed(1)} yrs</span> (Approximation error: {calc.rule70ErrorYears >= 0 ? '+' : ''}{calc.rule70ErrorYears.toFixed(2)} yrs)
                    </>
                  )}
                  {mode === 'trajectory_projection' && (
                    <>
                      Cumulative Expansion: <span className="font-bold text-emerald-300">+{formatMoney(calc.cumulativeGrowthNominal, 1)}</span> ({calc.cumulativeMultiplier.toFixed(2)}× initial output)
                    </>
                  )}
                  {mode === 'convergence_catchup' && (
                    <>
                      Growth Advantage: <span className="font-bold text-emerald-300">+{calc.growthDifferential.toFixed(1)}% / yr</span> (Convergence Output: {formatMoney(calc.countryAFutureAtConvergence, 0)}B)
                    </>
                  )}
                  {mode === 'target_milestone' && (
                    <>
                      Target Expansion: <span className="font-bold text-emerald-300">{calc.targetSurgeMultiplier.toFixed(2)}×</span> from {formatMoney(initialValue)}B to {formatMoney(targetGoal)}B
                    </>
                  )}
                </div>
              </div>

              {/* Multi-Period Projection Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-emerald-300/80 block text-[10px] uppercase font-semibold">10-Year Projection</span>
                  <span className="font-mono font-bold text-white text-base">
                    {formatMoney(calc.valueIn10, 0)}
                  </span>
                  <span className="text-[10px] text-emerald-200/60 block mt-0.5">{(calc.valueIn10 / initialValue).toFixed(2)}× initial output</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-emerald-300/80 block text-[10px] uppercase font-semibold">20-Year Projection</span>
                  <span className="font-mono font-bold text-white text-base">
                    {formatMoney(calc.valueIn20, 0)}
                  </span>
                  <span className="text-[10px] text-emerald-200/60 block mt-0.5">{(calc.valueIn20 / initialValue).toFixed(2)}× initial output</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-emerald-300/80 block text-[10px] uppercase font-semibold">30-Year Projection</span>
                  <span className="font-mono font-bold text-emerald-300 text-base">
                    {formatMoney(calc.valueIn30, 0)}
                  </span>
                  <span className="text-[10px] text-emerald-200/60 block mt-0.5">{(calc.valueIn30 / initialValue).toFixed(2)}× initial output</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Continuous SVG Chart */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <BarChart2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {mode === 'convergence_catchup' ? 'Two-Country Growth Trajectory & Crossover' : 'Continuous Exponential Compounding Trajectory'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Growth path from Year 0 to Year {calc.t} compounding at {growthRate}% annually
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Country A / Base
                </span>
                {mode === 'convergence_catchup' && (
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Country B Benchmark
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
                  <linearGradient id="growthAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Grid Lines */}
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
                        {formatMoney(yVal, 0)}
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

                {/* Shaded Area for Country A */}
                <path
                  d={chartGeometry.areaA}
                  fill="url(#growthAreaGradient)"
                />

                {/* Continuous Curve A */}
                <path
                  d={chartGeometry.pathA}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Country B Curve (if in convergence mode) */}
                {mode === 'convergence_catchup' && chartGeometry.pathB && (
                  <path
                    d={chartGeometry.pathB}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Doubling Point Marker */}
                {chartGeometry.doublePt && (
                  <g>
                    <line
                      x1={chartGeometry.doublePt.x}
                      y1={chartGeometry.scaleY(0)}
                      x2={chartGeometry.doublePt.x}
                      y2={chartGeometry.doublePt.y}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={chartGeometry.doublePt.x}
                      cy={chartGeometry.doublePt.y}
                      r="5"
                      className="fill-emerald-500 stroke-white dark:stroke-zinc-900"
                      strokeWidth="2"
                    />
                    <text
                      x={chartGeometry.doublePt.x + 8}
                      y={chartGeometry.doublePt.y - 8}
                      className="text-[10px] font-bold fill-emerald-600 dark:fill-emerald-400 font-mono"
                    >
                      2× Doubled (Yr {calc.exactDoublingYears.toFixed(1)})
                    </text>
                  </g>
                )}

                {/* Convergence Intersection Point */}
                {mode === 'convergence_catchup' && chartGeometry.convPt && (
                  <g>
                    <circle
                      cx={chartGeometry.convPt.x}
                      cy={chartGeometry.convPt.y}
                      r="6"
                      className="fill-purple-500 stroke-white dark:stroke-zinc-900"
                      strokeWidth="2"
                    />
                    <text
                      x={chartGeometry.convPt.x + 8}
                      y={chartGeometry.convPt.y - 8}
                      className="text-[10px] font-bold fill-purple-600 dark:fill-purple-400 font-mono"
                    >
                      Crossover Parity (Yr {calc.convergenceYears.toFixed(1)})
                    </text>
                  </g>
                )}

                {/* End Point Dot */}
                <circle
                  cx={chartGeometry.scaleX(calc.t)}
                  cy={chartGeometry.scaleY(calc.futureValue)}
                  r="5"
                  className="fill-emerald-600 stroke-white dark:stroke-zinc-900"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  Compound Growth Power: Compounding at {growthRate}% expands output by {calc.cumulativeMultiplier.toFixed(2)}× over {calc.t} years.
                </span>
              </div>
              <span className="font-mono text-zinc-400">
                Formula: Y(t) = Y₀(1+g)ᵗ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Compounding Multi-Horizon Schedule Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Multi-Horizon Compound Economic Growth Schedule
              </h3>
              <p className="text-xs text-zinc-500">
                Milestone years, cumulative output addition, and expansion multipliers
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {scheduleData.length} Milestones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                <th className="py-2.5 px-3 font-semibold">Horizon</th>
                <th className="py-2.5 px-3 font-semibold">Projected Output</th>
                <th className="py-2.5 px-3 font-semibold">Cumulative Output Added</th>
                <th className="py-2.5 px-3 font-semibold">Expansion Multiplier</th>
                {mode === 'convergence_catchup' && <th className="py-2.5 px-3 font-semibold">Country B Benchmark</th>}
                <th className="py-2.5 px-3 font-semibold">Doubling Milestone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {scheduleData.map((row) => (
                <tr
                  key={row.year}
                  className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                    row.year === calc.t ? 'bg-emerald-500/5 font-bold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                    Year {row.year} {row.year === calc.t && '(Target)'}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {formatMoney(row.val, 1)}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                    +{formatMoney(row.added, 1)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      row.mult >= 4.0
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                        : row.mult >= 2.0
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {row.mult.toFixed(2)}× Initial
                    </span>
                  </td>
                  {mode === 'convergence_catchup' && (
                    <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                      {formatMoney(row.valB, 1)}
                    </td>
                  )}
                  <td className="py-2.5 px-3">
                    {row.mult >= 8.0 ? (
                      <span className="text-purple-600 dark:text-purple-400 font-bold">8× (Triple Doubled)</span>
                    ) : row.mult >= 4.0 ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">4× (Double Doubled)</span>
                    ) : row.mult >= 2.0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">2× (Doubled)</span>
                    ) : (
                      <span className="text-zinc-400">Initial Cycle</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5x5 Sensitivity Matrix: Growth Rate vs Horizon */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Scale className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                5×5 Sensitivity Matrix: Growth Rate vs. Compounding Horizon
              </h3>
              <p className="text-xs text-zinc-500">
                Cumulative output expansion multiplier (X×) on {formatMoney(initialValue)} base
              </p>
            </div>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            Green: 2–4× | Purple: 4–8× | Gold: &gt;8×
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2.5 px-3 text-left font-bold text-zinc-500">Growth Rate \\ Horizon</th>
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
                    const m = cell.mult;
                    let colorBg = 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
                    if (m >= 8.0) colorBg = 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300';
                    else if (m >= 4.0) colorBg = 'bg-purple-100 text-purple-900 dark:bg-purple-950/50 dark:text-purple-300';
                    else if (m >= 2.0) colorBg = 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300';

                    return (
                      <td key={cell.years} className="py-2 px-2">
                        <div className={`p-2 rounded-xl ${colorBg} font-bold transition-transform hover:scale-105`}>
                          <div>{m.toFixed(2)}×</div>
                          <div className="text-[10px] font-normal opacity-80 mt-0.5">
                            {formatMoney(cell.val, 0)}
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
                Formal Mathematical Proofs & Doubling Rule Derivations
              </h3>
              <p className="text-xs text-zinc-500">
                Mathematical origin of the Rule of 70 from the Taylor expansion of the natural logarithm
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
            {/* 1. Rule of 70 Proof */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">1. Rule of 70 Approximation</span>
                <button
                  onClick={() => handleCopyFormula(latexRule70, 'rule70')}
                  className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                  title="Copy LaTeX"
                >
                  {copiedFormula === 'rule70' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 font-mono text-xs overflow-x-auto text-purple-600 dark:text-purple-400">
                {latexRule70}
              </div>
              <p className="text-[11px] text-zinc-500">
                {"Approximates doubling time using 70 divided by annual growth percentage."}
              </p>
            </div>

            {/* 2. Exact Discrete Doubling */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">2. Exact Logarithmic Doubling</span>
                <button
                  onClick={() => handleCopyFormula(latexExact, 'exact')}
                  className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                  title="Copy LaTeX"
                >
                  {copiedFormula === 'exact' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 font-mono text-xs overflow-x-auto text-purple-600 dark:text-purple-400">
                {latexExact}
              </div>
              <p className="text-[11px] text-zinc-500">
                {"Exact discrete compounding doubling formula derived from ln(2) / ln(1+g)."}
              </p>
            </div>

            {/* 3. Output Projection Equation */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">3. Output Expansion Trajectory</span>
                <button
                  onClick={() => handleCopyFormula(latexOutput, 'output')}
                  className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                  title="Copy LaTeX"
                >
                  {copiedFormula === 'output' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 font-mono text-xs overflow-x-auto text-purple-600 dark:text-purple-400">
                {latexOutput}
              </div>
              <p className="text-[11px] text-zinc-500">
                {"Compounding output function Y(t) = Y_0 · (1 + g)^t."}
              </p>
            </div>

            {/* 4. Two-Country Convergence Horizon */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">4. Convergence Catch-Up Horizon</span>
                <button
                  onClick={() => handleCopyFormula(latexConvergence, 'convergence')}
                  className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"
                  title="Copy LaTeX"
                >
                  {copiedFormula === 'convergence' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 font-mono text-xs overflow-x-auto text-purple-600 dark:text-purple-400">
                {latexConvergence}
              </div>
              <p className="text-[11px] text-zinc-500">
                {"Time in years for fast-growing Country A to reach GDP parity with benchmark Country B."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
