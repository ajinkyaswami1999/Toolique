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
  Zap, RefreshCw, Clock
} from 'lucide-react';

type VelocityMode = 'solve_velocity' | 'solve_inflation_growth' | 'solve_money_target' | 'cambridge_k_portfolio';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: VelocityMode;
  moneySupply: number;
  priceLevel: number;
  realGdp: number;
  nominalGdp: number;
  moneyGrowthPct: number;
  velocityGrowthPct: number;
  realGdpGrowthPct: number;
  targetInflationPct: number;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'US Economy (Pre-COVID Benchmark 2019)',
    category: 'Mature Benchmark',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    mode: 'solve_velocity',
    moneySupply: 15400,
    priceLevel: 1.15,
    realGdp: 18600,
    nominalGdp: 21400,
    moneyGrowthPct: 6.0,
    velocityGrowthPct: -1.0,
    realGdpGrowthPct: 2.3,
    targetInflationPct: 2.0
  },
  {
    name: 'US Post-COVID M2 Surge & Velocity Drop (2020–21)',
    category: 'Velocity Collapse',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    mode: 'solve_velocity',
    moneySupply: 21500,
    priceLevel: 1.22,
    realGdp: 18850,
    nominalGdp: 23000,
    moneyGrowthPct: 25.0,
    velocityGrowthPct: -20.0,
    realGdpGrowthPct: 5.5,
    targetInflationPct: 2.0
  },
  {
    name: 'Weimar Germany Hyperinflation (1923)',
    category: 'Hyperinflation Flight',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
    mode: 'solve_inflation_growth',
    moneySupply: 50000,
    priceLevel: 1000,
    realGdp: 2500,
    nominalGdp: 2500000,
    moneyGrowthPct: 500.0,
    velocityGrowthPct: 250.0,
    realGdpGrowthPct: -10.0,
    targetInflationPct: 2.0
  },
  {
    name: 'Japan Liquidity Trap & Deflation Drag',
    category: 'Liquidity Trap',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    mode: 'cambridge_k_portfolio',
    moneySupply: 1200,
    priceLevel: 1.02,
    realGdp: 550,
    nominalGdp: 561,
    moneyGrowthPct: 3.5,
    velocityGrowthPct: -3.0,
    realGdpGrowthPct: 0.8,
    targetInflationPct: 2.0
  },
  {
    name: 'India High-Growth & Monetization Wave',
    category: 'Emerging Monetization',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    mode: 'solve_inflation_growth',
    moneySupply: 240,
    priceLevel: 1.35,
    realGdp: 222,
    nominalGdp: 300,
    moneyGrowthPct: 11.5,
    velocityGrowthPct: -0.5,
    realGdpGrowthPct: 7.0,
    targetInflationPct: 4.0
  },
  {
    name: 'Milton Friedman Constant k% Money Rule',
    category: 'Monetarist Rule',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    mode: 'solve_money_target',
    moneySupply: 10000,
    priceLevel: 1.00,
    realGdp: 10000,
    nominalGdp: 10000,
    moneyGrowthPct: 4.0,
    velocityGrowthPct: 0.0,
    realGdpGrowthPct: 3.0,
    targetInflationPct: 1.0
  }
];

export default function VelocityOfMoneyCalculator() {
  const [currency, setCurrency] = useState<string>('$');
  const [mode, setMode] = useState<VelocityMode>('solve_velocity');

  // Core Level Inputs
  const [moneySupply, setMoneySupply] = useState<number>(15400); // M
  const [priceLevel, setPriceLevel] = useState<number>(1.15);    // P
  const [realGdp, setRealGdp] = useState<number>(18600);         // Y
  const [nominalGdpInput, setNominalGdpInput] = useState<number>(21400);
  const [useDirectNominal, setUseDirectNominal] = useState<boolean>(false);

  // Dynamic Growth Rates Inputs (% per annum)
  const [moneyGrowthPct, setMoneyGrowthPct] = useState<number>(6.0);       // %ΔM
  const [velocityGrowthPct, setVelocityGrowthPct] = useState<number>(-1.0); // %ΔV
  const [realGdpGrowthPct, setRealGdpGrowthPct] = useState<number>(2.3);    // %ΔY
  const [targetInflationPct, setTargetInflationPct] = useState<number>(2.0); // π*

  // UI States
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);
  const [hoverMoney, setHoverMoney] = useState<number | null>(null);

  // Apply Preset
  const handleApplyPreset = (preset: PresetScenario) => {
    setMode(preset.mode);
    setMoneySupply(preset.moneySupply);
    setPriceLevel(preset.priceLevel);
    setRealGdp(preset.realGdp);
    setNominalGdpInput(preset.nominalGdp);
    setMoneyGrowthPct(preset.moneyGrowthPct);
    setVelocityGrowthPct(preset.velocityGrowthPct);
    setRealGdpGrowthPct(preset.realGdpGrowthPct);
    setTargetInflationPct(preset.targetInflationPct);
  };

  // Reset to Defaults
  const handleReset = () => {
    handleApplyPreset(PRESETS[0]);
  };

  // Calculations
  const results = useMemo(() => {
    // 1. Nominal Output
    const computedNominalGdp = useDirectNominal ? nominalGdpInput : priceLevel * realGdp;

    // 2. Velocity of Circulation: V = PY / M
    const velocity = moneySupply > 0 ? computedNominalGdp / moneySupply : 0;

    // 3. Cambridge Cash-Balance Coefficient: k = 1 / V = M / PY
    const cambridgeK = velocity > 0 ? 1 / velocity : 0;
    const holdingDays = velocity > 0 ? (365 / velocity) : 0;
    const monetizationRatio = computedNominalGdp > 0 ? (moneySupply / computedNominalGdp) * 100 : 0;

    // 4. Dynamic Inflation Solver: π = %ΔM + %ΔV - %ΔY
    const calculatedInflationPct = moneyGrowthPct + velocityGrowthPct - realGdpGrowthPct;
    const nominalGdpGrowthPct = realGdpGrowthPct + calculatedInflationPct;

    // 5. Money Supply Target Solver for Target Inflation: %ΔM* = π* + %ΔY - %ΔV
    const requiredMoneyGrowthPct = targetInflationPct + realGdpGrowthPct - velocityGrowthPct;

    // 6. Desired Cash Balance for Cambridge k mode
    const desiredMoneyDemand = cambridgeK * computedNominalGdp;

    return {
      computedNominalGdp,
      velocity,
      cambridgeK,
      holdingDays,
      monetizationRatio,
      calculatedInflationPct,
      nominalGdpGrowthPct,
      requiredMoneyGrowthPct,
      desiredMoneyDemand
    };
  }, [
    moneySupply, priceLevel, realGdp, nominalGdpInput, useDirectNominal,
    moneyGrowthPct, velocityGrowthPct, realGdpGrowthPct, targetInflationPct
  ]);

  // 10-Milestone Schedule: Varying Money Supply and Velocity Trajectory
  const scheduleRows = useMemo(() => {
    const baseM = Math.max(100, moneySupply);
    const minM = baseM * 0.5;
    const maxM = baseM * 2.0;
    const steps = 10;
    const stepSize = (maxM - minM) / (steps - 1);

    const rows = [];
    for (let i = 0; i < steps; i++) {
      const testM = minM + i * stepSize;
      const testV = testM > 0 ? results.computedNominalGdp / testM : 0;
      const testK = testV > 0 ? 1 / testV : 0;
      const testDays = testV > 0 ? 365 / testV : 0;
      const testMonetization = results.computedNominalGdp > 0 ? (testM / results.computedNominalGdp) * 100 : 0;

      rows.push({
        testM,
        testV,
        testK,
        testDays,
        testMonetization,
        isBaseline: Math.abs(testM - moneySupply) < (stepSize / 2)
      });
    }
    return rows;
  }, [moneySupply, results.computedNominalGdp]);

  // 5x5 Sensitivity Matrix: Money Growth (%ΔM) vs Velocity Growth (%ΔV) -> Inflation (π)
  const sensitivityMatrix = useMemo(() => {
    const mGrowthValues = [2.0, 5.0, 8.0, 12.0, 20.0];
    const vGrowthValues = [-5.0, -2.0, 0.0, 2.0, 5.0];

    return mGrowthValues.map((mg) => {
      const cells = vGrowthValues.map((vg) => {
        const infl = mg + vg - realGdpGrowthPct;
        return {
          mg,
          vg,
          infl,
          isBaseline: Math.abs(mg - moneyGrowthPct) < 2.0 && Math.abs(vg - velocityGrowthPct) < 1.5
        };
      });
      return { mg, cells };
    });
  }, [realGdpGrowthPct, moneyGrowthPct, velocityGrowthPct]);

  // SVG Chart: Velocity Curve V(M) = Nominal GDP / M
  const svgData = useMemo(() => {
    const width = 640;
    const height = 300;
    const padding = { top: 25, right: 35, bottom: 45, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxM = Math.max(moneySupply * 2.2, 1000);
    const maxV = Math.max(results.velocity * 2.0, 3.0);

    const xScale = (mVal: number) => padding.left + (Math.max(0, Math.min(mVal, maxM)) / maxM) * chartW;
    const yScale = (vVal: number) => padding.top + chartH - (Math.max(0, Math.min(vVal, maxV)) / maxV) * chartH;

    // Generate curve points
    const points = [];
    const numPoints = 40;
    const step = maxM / numPoints;
    for (let i = 1; i <= numPoints; i++) {
      const mVal = i * step;
      const vVal = results.computedNominalGdp / mVal;
      points.push({ x: xScale(mVal), y: yScale(vVal) });
    }

    const curvePath = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const currentPt = {
      x: xScale(moneySupply),
      y: yScale(results.velocity)
    };

    return {
      width,
      height,
      padding,
      chartW,
      chartH,
      maxM,
      maxV,
      xScale,
      yScale,
      curvePath,
      currentPt
    };
  }, [moneySupply, results.velocity, results.computedNominalGdp]);

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
            <span className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Velocity of Money (M × V = P × Y) & Quantity Theory Suite
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Calculate money circulation turnover speed (V = PY/M), Cambridge cash balance (k = 1/V), dynamic inflation rates, and monetary targeting rules.
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
            Monetary Regimes & Historical Benchmarks
          </span>
          <span className="text-xs text-zinc-400">Select calibrated macroeconomic regime</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="p-3 text-left bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-xl transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
            >
              <div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${p.badgeColor}`}>
                  {p.category}
                </span>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
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
          onClick={() => setMode('solve_velocity')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'solve_velocity'
              ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Velocity Solver (V = PY/M)</span>
        </button>

        <button
          onClick={() => setMode('solve_inflation_growth')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'solve_inflation_growth'
              ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dynamic Inflation (π = ΔM+ΔV-ΔY)</span>
        </button>

        <button
          onClick={() => setMode('solve_money_target')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'solve_money_target'
              ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Targeting Rule (%ΔM*)</span>
        </button>

        <button
          onClick={() => setMode('cambridge_k_portfolio')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'cambridge_k_portfolio'
              ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Cambridge k Cash Balance</span>
        </button>
      </div>

      {/* Main Grid: Control Inputs (5 cols) + Hero Metric Card (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                Monetary & Output Variables
              </span>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
              >
                {showAdvanced ? 'Hide Dynamic Rates' : 'Show Dynamic Rates'}
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Money Supply M */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Money Supply ({currency}M - Stock)
                </label>
                <span className="text-[11px] font-mono text-zinc-500">
                  Monetization: {results.monetizationRatio.toFixed(1)}%
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-mono">{currency}</span>
                <input
                  type="number"
                  value={moneySupply}
                  onChange={(e) => setMoneySupply(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Output Mode Switcher: Price Level & Real Output vs Direct Nominal */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Input Method for Output:
                </label>
                <button
                  onClick={() => setUseDirectNominal(!useDirectNominal)}
                  className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                >
                  {useDirectNominal ? 'Switch to P × Y Breakdown' : 'Switch to Direct Nominal GDP'}
                </button>
              </div>

              {useDirectNominal ? (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nominal GDP ({currency}P × Y)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-mono">{currency}</span>
                    <input
                      type="number"
                      value={nominalGdpInput}
                      onChange={(e) => setNominalGdpInput(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Price Level (P - Deflator)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={priceLevel}
                      onChange={(e) => setPriceLevel(Math.max(0.01, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Real GDP ({currency}Y)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-mono">{currency}</span>
                      <input
                        type="number"
                        value={realGdp}
                        onChange={(e) => setRealGdp(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Growth Rates Parameters */}
            {showAdvanced && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Dynamic Percentage Growth Rates (% Per Annum)
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Money (%ΔM)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={moneyGrowthPct}
                      onChange={(e) => setMoneyGrowthPct(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Velocity (%ΔV)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={velocityGrowthPct}
                      onChange={(e) => setVelocityGrowthPct(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Real GDP (%ΔY)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={realGdpGrowthPct}
                      onChange={(e) => setRealGdpGrowthPct(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {mode === 'solve_money_target' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Target Inflation Goal (π* %/yr)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      value={targetInflationPct}
                      onChange={(e) => setTargetInflationPct(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Hero Card & Monetization Analytics (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-orange-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-amber-800/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-amber-300 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  {mode === 'solve_inflation_growth'
                    ? 'Implied Price Inflation Rate (π)'
                    : mode === 'solve_money_target'
                    ? 'Target Money Supply Growth (%ΔM*)'
                    : 'Velocity of Money Circulation (V)'}
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono my-2 tracking-tight text-white flex items-baseline gap-2">
                  {mode === 'solve_inflation_growth' ? (
                    <span>{results.calculatedInflationPct.toFixed(2)}% <span className="text-sm font-normal text-amber-200">/ year</span></span>
                  ) : mode === 'solve_money_target' ? (
                    <span>{results.requiredMoneyGrowthPct.toFixed(2)}% <span className="text-sm font-normal text-amber-200">/ year</span></span>
                  ) : (
                    <span>{results.velocity.toFixed(2)}<span className="text-2xl font-normal text-amber-200">x / year</span></span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  Holding Period
                </span>
                <p className="text-base font-bold font-mono text-amber-200 mt-1">
                  {results.holdingDays.toFixed(0)} Days
                </p>
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-white/10 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-amber-300 block text-[10px] font-medium uppercase">Nominal GDP (P×Y)</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {currency}{results.computedNominalGdp.toLocaleString(undefined, { maximumFractionDigits: 1 })} B
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-amber-300 block text-[10px] font-medium uppercase">Cambridge k (M/PY)</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.cambridgeK.toFixed(3)}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-amber-300 block text-[10px] font-medium uppercase">Monetization Depth</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.monetizationRatio.toFixed(1)}%
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-amber-300 block text-[10px] font-medium uppercase">Nominal GDP Growth</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.nominalGdpGrowthPct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Cash Holding & Cambridge Balance Visual Breakdown */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-500" />
                Cambridge Cash Balance & Turnover Dynamics
              </span>
              <span className="text-zinc-400 font-mono text-[11px]">k = 1 / V = {results.cambridgeK.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block uppercase font-semibold">
                  Average Currency Holding Period
                </span>
                <span className="text-lg font-bold font-mono text-amber-800 dark:text-amber-300">
                  {results.holdingDays.toFixed(0)} Days ({ (results.holdingDays / 30.4).toFixed(1) } Months)
                </span>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Time a unit of currency rests in wallets/bank accounts before being spent on final output.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block uppercase font-semibold">
                  Desired Money Demand (Mᵈ = k · PY)
                </span>
                <span className="text-lg font-bold font-mono text-orange-800 dark:text-orange-300">
                  {currency}{results.desiredMoneyDemand.toLocaleString(undefined, { maximumFractionDigits: 1 })} B
                </span>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Volume of cash balances households and enterprises choose to maintain relative to total economic income.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Velocity vs Money Supply Curve Chart */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              Velocity Curve: V(M) = Nominal GDP / M
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Hyperbolic relationship demonstrating how velocity decays as the money supply expands for a constant output level.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500" />
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Iso-GDP Curve (PY = {currency}{results.computedNominalGdp.toFixed(0)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Current State</span>
            </div>
          </div>
        </div>

        <div className="relative w-full overflow-x-auto bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl p-2 border border-zinc-100 dark:border-zinc-800">
          <svg
            viewBox={`0 0 ${svgData.width} ${svgData.height}`}
            className="w-full h-auto max-h-[340px] font-sans select-none"
          >
            {/* Axes */}
            <line
              x1={svgData.padding.left}
              y1={svgData.padding.top + svgData.chartH}
              x2={svgData.padding.left + svgData.chartW}
              y2={svgData.padding.top + svgData.chartH}
              stroke="currentColor"
              className="text-zinc-300 dark:text-zinc-700"
              strokeWidth="1.5"
            />
            <line
              x1={svgData.padding.left}
              y1={svgData.padding.top}
              x2={svgData.padding.left}
              y2={svgData.padding.top + svgData.chartH}
              stroke="currentColor"
              className="text-zinc-300 dark:text-zinc-700"
              strokeWidth="1.5"
            />

            {/* Velocity Hyperbola Curve */}
            <path
              d={svgData.curvePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Current Coordinate Point */}
            <line
              x1={svgData.currentPt.x}
              y1={svgData.currentPt.y}
              x2={svgData.currentPt.x}
              y2={svgData.padding.top + svgData.chartH}
              stroke="#d97706"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <line
              x1={svgData.padding.left}
              y1={svgData.currentPt.y}
              x2={svgData.currentPt.x}
              y2={svgData.currentPt.y}
              stroke="#d97706"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            <circle
              cx={svgData.currentPt.x}
              cy={svgData.currentPt.y}
              r="6"
              className="fill-amber-600 stroke-white dark:stroke-zinc-900 stroke-2"
            />
            <circle
              cx={svgData.currentPt.x}
              cy={svgData.currentPt.y}
              r="12"
              className="fill-amber-500/20 animate-ping pointer-events-none"
            />

            <g transform={`translate(${svgData.currentPt.x + 10}, ${svgData.currentPt.y - 25})`}>
              <rect
                x="0"
                y="0"
                width="145"
                height="32"
                rx="6"
                className="fill-zinc-900/90 dark:fill-zinc-800/90 shadow-md"
              />
              <text x="8" y="14" className="text-[10px] font-bold fill-white">
                M = {currency}{moneySupply.toLocaleString()} B
              </text>
              <text x="8" y="25" className="text-[9px] font-mono fill-amber-300">
                Velocity V = {results.velocity.toFixed(2)}x | k = {results.cambridgeK.toFixed(2)}
              </text>
            </g>

            {/* Axis Titles */}
            <text
              x={svgData.padding.left + svgData.chartW / 2}
              y={svgData.height - 10}
              textAnchor="middle"
              className="text-xs font-semibold fill-zinc-600 dark:fill-zinc-400"
            >
              Money Supply (M) [{currency} Billions]
            </text>
            <text
              transform={`rotate(-90) translate(-${svgData.padding.top + svgData.chartH / 2}, 16)`}
              textAnchor="middle"
              className="text-xs font-semibold fill-zinc-600 dark:fill-zinc-400"
            >
              Circulation Velocity (V) [Turnover / Year]
            </text>
          </svg>
        </div>
      </div>

      {/* 10-Milestone Money Supply Trajectory Schedule */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-500" />
              Money Stock & Velocity Sensitivity Schedule
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Simulates how differing money stock levels alter circulation velocity and cash holding duration for fixed nominal GDP.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-700">
                <th className="py-2.5 px-3">Money Supply (M)</th>
                <th className="py-2.5 px-3">Velocity (V)</th>
                <th className="py-2.5 px-3">Cambridge k (1/V)</th>
                <th className="py-2.5 px-3">Holding Period</th>
                <th className="py-2.5 px-3">Monetization Depth</th>
                <th className="py-2.5 px-3">Nominal Output (PY)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {scheduleRows.map((r, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                    r.isBaseline ? 'bg-amber-50/70 dark:bg-amber-950/40 font-bold' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-zinc-900 dark:text-zinc-100">
                    {currency}{r.testM.toFixed(0)} B
                    {r.isBaseline && (
                      <span className="ml-1.5 text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded-full font-sans">
                        Current
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-bold text-amber-600 dark:text-amber-400">{r.testV.toFixed(2)}x</td>
                  <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{r.testK.toFixed(3)}</td>
                  <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{r.testDays.toFixed(0)} Days</td>
                  <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{r.testMonetization.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-zinc-900 dark:text-zinc-100">{currency}{results.computedNominalGdp.toFixed(0)} B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5x5 Sensitivity Matrix: Money Growth vs Velocity Shift */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-500" />
              5×5 Sensitivity Matrix: Money Growth (%ΔM) vs Velocity Shift (%ΔV)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Resulting Equilibrium Inflation Rate (π) assuming Real Output Growth g_Y = {realGdpGrowthPct.toFixed(1)}%/yr.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <th className="p-2.5 text-left border border-zinc-200 dark:border-zinc-700 font-semibold">
                  Money (%ΔM) \ Velocity (%ΔV)
                </th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">-5.0% (Drag)</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">-2.0%</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700 font-bold text-amber-600 dark:text-amber-400">0.0% (Stable)</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">+2.0%</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">+5.0% (Surge)</th>
              </tr>
            </thead>
            <tbody>
              {sensitivityMatrix.map((row) => (
                <tr key={row.mg} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-2 text-left font-bold font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200">
                    %ΔM = +{row.mg.toFixed(1)}%
                  </td>
                  {row.cells.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`p-2 border border-zinc-200 dark:border-zinc-700 font-mono ${
                        cell.isBaseline
                          ? 'bg-amber-100 dark:bg-amber-900/60 font-black text-amber-900 dark:text-amber-200 ring-2 ring-amber-500'
                          : cell.infl > 10
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : cell.infl < 0
                          ? 'text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="font-bold">{cell.infl >= 0 ? '+' : ''}{cell.infl.toFixed(1)}% π</div>
                      <div className="text-[10px] text-zinc-400 font-sans">
                        {cell.infl > 5 ? 'High Inflation' : cell.infl < 0 ? 'Deflation' : 'Stable'}
                      </div>
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
            <span className="p-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Formal Monetary Proofs & Equation of Exchange Formulations
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Rigorous mathematical derivations formatted in LaTeX. Click any equation block to copy for research.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Proof 1: Equation of Exchange */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">1. Fisher Equation of Exchange</span>
              <button
                onClick={() => copyToClipboard('M \cdot V = P \cdot Y \implies V = \frac{P \cdot Y}{M}', 'fisher_proof')}
                className="text-zinc-400 hover:text-amber-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'fisher_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-amber-900 dark:text-amber-300 overflow-x-auto">
              {"M \cdot V = P \cdot Y"}
              <br />
              {"\implies V = \frac{\text{Nominal GDP}}{M} = \frac{P \cdot Y}{M}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Establishes that the total value of monetary transactions equals nominal output produced in the economy.
            </p>
          </div>

          {/* Proof 2: Logarithmic Inflation Derivation */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">2. Dynamic Inflation Rate Derivation</span>
              <button
                onClick={() => copyToClipboard('\ln M + \ln V = \ln P + \ln Y \implies \frac{\Delta P}{P} = \frac{\Delta M}{M} + \frac{\Delta V}{V} - \frac{\Delta Y}{Y}', 'infl_proof')}
                className="text-zinc-400 hover:text-amber-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'infl_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-amber-900 dark:text-amber-300 overflow-x-auto">
              {"\ln(M) + \ln(V) = \ln(P) + \ln(Y)"}
              <br />
              {"\implies \%\Delta M + \%\Delta V = \pi + g_Y"}
              <br />
              {"\implies \pi = \%\Delta M + \%\Delta V - g_Y"}
            </div>
            <p className="text-[11px] text-zinc-500">
              When velocity is stable (%ΔV = 0), inflation equals the excess of money supply growth over potential output growth.
            </p>
          </div>

          {/* Proof 3: Cambridge Cash-Balance Approach */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">3. Cambridge Cash-Balance Equivalence</span>
              <button
                onClick={() => copyToClipboard('M^d = k \cdot P \cdot Y, \quad k = \frac{1}{V}', 'camb_proof')}
                className="text-zinc-400 hover:text-amber-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'camb_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-amber-900 dark:text-amber-300 overflow-x-auto">
              {"M^d = k \cdot (P \cdot Y)"}
              <br />
              {"\text{In Equilibrium } M^d = M \implies M = k \cdot PY"}
              <br />
              {"\implies k = \frac{1}{V} \iff V = \frac{1}{k}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Cambridge k models money demand from microeconomic utility and liquidity preference rather than purely mechanical turnover.
            </p>
          </div>

          {/* Proof 4: Optimal Money Growth Rule */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">4. Friedman Monetary Targeting Rule</span>
              <button
                onClick={() => copyToClipboard('\%\Delta M^* = \pi^* + g_Y - \%\Delta V', 'rule_proof')}
                className="text-zinc-400 hover:text-amber-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'rule_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-amber-900 dark:text-amber-300 overflow-x-auto">
              {"\%\Delta M^* = \pi^* + g_Y - \%\Delta V"}
              <br />
              {"\text{For Price Stability (}\pi^* = 0, \%\Delta V = 0\text{):}"}
              <br />
              {"\%\Delta M^* = g_Y"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Prescribes exact central bank money growth required to accommodate real economic growth without generating price inflation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
