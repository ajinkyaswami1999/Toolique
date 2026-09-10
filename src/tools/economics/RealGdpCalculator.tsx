import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2,
  Sliders, ChevronDown, ChevronUp,
  Calculator, TrendingUp,
  Layers, Flame, ShieldCheck, Scale
} from 'lucide-react';

type CalculationMode = 'deflator_mode' | 'two_period_decomp' | 'basket_aggregation' | 'trajectory_series';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  nominalGdp: number;
  gdpDeflator: number;
  nom1: number;
  nom2: number;
  def1: number;
  def2: number;
  // Multi-good basket
  p0_a: number; q0_a: number; pt_a: number; qt_a: number;
  p0_b: number; q0_b: number; pt_b: number; qt_b: number;
  p0_c: number; q0_c: number; pt_c: number; qt_c: number;
  p0_d: number; q0_d: number; pt_d: number; qt_d: number;
  annualNomGrowth: number;
  annualInflation: number;
  description: string;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'US Post-Inflation Deflation',
    category: 'Advanced Economy',
    badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    mode: 'deflator_mode',
    nominalGdp: 27360,
    gdpDeflator: 122.4,
    nom1: 25740, nom2: 27360,
    def1: 117.8, def2: 122.4,
    p0_a: 100, q0_a: 50, pt_a: 125, qt_a: 55,
    p0_b: 200, q0_b: 30, pt_b: 240, qt_b: 34,
    p0_c: 50, q0_c: 100, pt_c: 65, qt_c: 105,
    p0_d: 300, q0_d: 20, pt_d: 330, qt_d: 26,
    annualNomGrowth: 6.3,
    annualInflation: 3.9,
    description: 'US Nominal GDP of $27.36T deflated by Index 122.4 yields $22.35T in constant 2017 dollars.'
  },
  {
    name: 'India Constant vs Current Series',
    category: 'High-Growth Emerging',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
    mode: 'deflator_mode',
    nominalGdp: 295000,
    gdpDeflator: 172.5,
    nom1: 265000, nom2: 295000,
    def1: 162.0, def2: 172.5,
    p0_a: 50, q0_a: 1000, pt_a: 88, qt_a: 1200,
    p0_b: 120, q0_b: 600, pt_b: 205, qt_b: 750,
    p0_c: 30, q0_c: 2000, pt_c: 52, qt_c: 2150,
    p0_d: 250, q0_d: 300, pt_d: 410, qt_d: 420,
    annualNomGrowth: 11.3,
    annualInflation: 4.5,
    description: 'India base-year series (2011-12=100). Nominal ₹295T deflated yields ₹171T in real output.'
  },
  {
    name: '1970s Great Stagflation Shock',
    category: 'Inflationary Spiral',
    badgeColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800',
    mode: 'two_period_decomp',
    nominalGdp: 2500,
    gdpDeflator: 145.0,
    nom1: 2200, nom2: 2500,
    def1: 128.0, def2: 145.0,
    p0_a: 80, q0_a: 10, pt_a: 120, qt_a: 10,
    p0_b: 150, q0_b: 8, pt_b: 210, qt_b: 8.2,
    p0_c: 40, q0_c: 20, pt_c: 62, qt_c: 19.5,
    p0_d: 200, q0_d: 5, pt_d: 280, qt_d: 5.1,
    annualNomGrowth: 13.6,
    annualInflation: 11.2,
    description: 'Double-digit nominal growth (+13.6%) masked a sluggish +0.3% real volume growth due to oil price inflation.'
  },
  {
    name: 'Japan Deflationary Era',
    category: 'Deflationary Paradigm',
    badgeColor: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800',
    mode: 'two_period_decomp',
    nominalGdp: 500000,
    gdpDeflator: 94.5,
    nom1: 505000, nom2: 500000,
    def1: 98.0, def2: 94.5,
    p0_a: 100, q0_a: 1000, pt_a: 92, qt_a: 1030,
    p0_b: 200, q0_b: 500, pt_b: 190, qt_b: 515,
    p0_c: 50, q0_c: 2000, pt_c: 48, qt_c: 2020,
    p0_d: 300, q0_d: 400, pt_d: 285, qt_d: 420,
    annualNomGrowth: -0.99,
    annualInflation: -1.5,
    description: 'Falling price level (Deflator 94.5) caused Real GDP to exceed Nominal GDP (+2.6% real expansion).'
  },
  {
    name: '4-Sector National Basket',
    category: 'Micro-Macro Basket',
    badgeColor: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800',
    mode: 'basket_aggregation',
    nominalGdp: 10000,
    gdpDeflator: 125.0,
    nom1: 8500, nom2: 10000,
    def1: 110.0, def2: 125.0,
    p0_a: 10, q0_a: 200, pt_a: 14, qt_a: 240,
    p0_b: 25, q0_b: 150, pt_b: 32, qt_b: 180,
    p0_c: 15, q0_c: 100, pt_c: 20, qt_c: 110,
    p0_d: 50, q0_d: 80, pt_d: 65, qt_d: 100,
    annualNomGrowth: 8.5,
    annualInflation: 3.5,
    description: 'Bottom-up aggregation of Industry, Services, Agriculture, and Tech goods using base-year price weights.'
  },
  {
    name: 'Hyperinflation Paper Illusion',
    category: 'Monetary Distortion',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    mode: 'two_period_decomp',
    nominalGdp: 15000,
    gdpDeflator: 320.0,
    nom1: 5000, nom2: 15000,
    def1: 100.0, def2: 320.0,
    p0_a: 20, q0_a: 100, pt_a: 70, qt_a: 90,
    p0_b: 40, q0_b: 50, pt_b: 135, qt_b: 45,
    p0_c: 10, q0_c: 200, pt_c: 32, qt_c: 180,
    p0_d: 80, q0_d: 25, pt_d: 260, qt_d: 20,
    annualNomGrowth: 200.0,
    annualInflation: 220.0,
    description: '+200% nominal surge completely dissolved by 220% price inflation, resulting in a -6.25% real contraction.'
  }
];

export default function RealGdpCalculator() {
  const [currency, setCurrency] = useState<string>('$');
  const [mode, setMode] = useState<CalculationMode>('deflator_mode');
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Mode 1: Deflator Inputs
  const [nominalGdp, setNominalGdp] = useState<number>(27360);
  const [gdpDeflator, setGdpDeflator] = useState<number>(122.4);

  // Mode 2: Two-Period Decomposition
  const [nom1, setNom1] = useState<number>(25740);
  const [nom2, setNom2] = useState<number>(27360);
  const [def1, setDef1] = useState<number>(117.8);
  const [def2, setDef2] = useState<number>(122.4);

  // Mode 3: 4-Good Basket Aggregation
  const [p0_a, setP0_a] = useState<number>(100);
  const [q0_a, setQ0_a] = useState<number>(50);
  const [pt_a, setPt_a] = useState<number>(125);
  const [qt_a, setQt_a] = useState<number>(55);

  const [p0_b, setP0_b] = useState<number>(200);
  const [q0_b, setQ0_b] = useState<number>(30);
  const [pt_b, setPt_b] = useState<number>(240);
  const [qt_b, setQt_b] = useState<number>(34);

  const [p0_c, setP0_c] = useState<number>(50);
  const [q0_c, setQ0_c] = useState<number>(100);
  const [pt_c, setPt_c] = useState<number>(65);
  const [qt_c, setQt_c] = useState<number>(105);

  const [p0_d, setP0_d] = useState<number>(300);
  const [q0_d, setQ0_d] = useState<number>(20);
  const [pt_d, setPt_d] = useState<number>(330);
  const [qt_d, setQt_d] = useState<number>(26);

  // Mode 4: Trajectory Series Projections
  const [annualNomGrowth, setAnnualNomGrowth] = useState<number>(6.3);
  const [annualInflation, setAnnualInflation] = useState<number>(3.9);

  // Core Math Engine
  const calc = useMemo(() => {
    // 1. Single-Period Deflation
    const deflator = gdpDeflator > 0 ? gdpDeflator : 100;
    const realGdp = (nominalGdp / deflator) * 100;
    const inflationImpact = nominalGdp - realGdp;
    const priceChangeFromBase = deflator - 100;

    // 2. Two-Period Decomposition
    const real1 = def1 > 0 ? (nom1 / def1) * 100 : 0;
    const real2 = def2 > 0 ? (nom2 / def2) * 100 : 0;
    const nominalGrowthRate = nom1 > 0 ? ((nom2 - nom1) / nom1) * 100 : 0;
    const realGrowthRate = real1 > 0 ? ((real2 - real1) / real1) * 100 : 0;
    const deflatorInflationRate = def1 > 0 ? ((def2 - def1) / def1) * 100 : 0;
    const growthDiff = nominalGrowthRate - realGrowthRate;

    // 3. Basket Aggregation
    const baseGdp_Basket = (p0_a * q0_a) + (p0_b * q0_b) + (p0_c * q0_c) + (p0_d * q0_d);
    const nominalGdp_Basket = (pt_a * qt_a) + (pt_b * qt_b) + (pt_c * qt_c) + (pt_d * qt_d);
    const realGdp_Basket = (p0_a * qt_a) + (p0_b * qt_b) + (p0_c * qt_c) + (p0_d * qt_d);
    const implicitDeflator_Basket = realGdp_Basket > 0 ? (nominalGdp_Basket / realGdp_Basket) * 100 : 100;
    const realExpansion_Basket = baseGdp_Basket > 0 ? ((realGdp_Basket - baseGdp_Basket) / baseGdp_Basket) * 100 : 0;
    const nominalExpansion_Basket = baseGdp_Basket > 0 ? ((nominalGdp_Basket - baseGdp_Basket) / baseGdp_Basket) * 100 : 0;

    // 4. Trajectory Projections
    const exactRealTrajectoryGrowth = ((1 + annualNomGrowth / 100) / (1 + annualInflation / 100) - 1) * 100;

    return {
      realGdp, inflationImpact, priceChangeFromBase,
      // Two Period
      real1, real2, nominalGrowthRate, realGrowthRate, deflatorInflationRate, growthDiff,
      // Basket
      baseGdp_Basket, nominalGdp_Basket, realGdp_Basket, implicitDeflator_Basket,
      realExpansion_Basket, nominalExpansion_Basket,
      // Trajectory
      exactRealTrajectoryGrowth
    };
  }, [nominalGdp, gdpDeflator, nom1, nom2, def1, def2, p0_a, q0_a, pt_a, qt_a, p0_b, q0_b, pt_b, qt_b, p0_c, q0_c, pt_c, qt_c, p0_d, q0_d, pt_d, qt_d, annualNomGrowth, annualInflation]);

  // Load Preset
  const handleApplyPreset = (p: PresetScenario) => {
    setMode(p.mode);
    setNominalGdp(p.nominalGdp);
    setGdpDeflator(p.gdpDeflator);
    setNom1(p.nom1);
    setNom2(p.nom2);
    setDef1(p.def1);
    setDef2(p.def2);
    setP0_a(p.p0_a); setQ0_a(p.q0_a); setPt_a(p.pt_a); setQt_a(p.qt_a);
    setP0_b(p.p0_b); setQ0_b(p.q0_b); setPt_b(p.pt_b); setQt_b(p.qt_b);
    setP0_c(p.p0_c); setQ0_c(p.q0_c); setPt_c(p.pt_c); setQt_c(p.qt_c);
    setP0_d(p.p0_d); setQ0_d(p.q0_d); setPt_d(p.pt_d); setQt_d(p.qt_d);
    setAnnualNomGrowth(p.annualNomGrowth);
    setAnnualInflation(p.annualInflation);
  };

  const handleReset = () => {
    handleApplyPreset(PRESETS[0]);
  };

  const copyLaTeX = () => {
    const latex = `\\begin{aligned}
\\text{Nominal GDP } (Y_{\\text{nominal}}) & = ${nominalGdp.toLocaleString()} \\text{ Billion} \\\\
\\text{GDP Deflator } (P) & = ${gdpDeflator} \\\\
\\text{Real GDP } (Y_{\\text{real}}) & = \\left(\\frac{Y_{\\text{nominal}}}{\\text{GDP Deflator}}\\right) \\times 100 = \\left(\\frac{${nominalGdp}}{${gdpDeflator}}\\right) \\times 100 = ${calc.realGdp.toFixed(2)} \\text{ Billion} \\\\
\\text{Inflation Price Premium} & = Y_{\\text{nominal}} - Y_{\\text{real}} = ${calc.inflationImpact.toFixed(2)} \\text{ Billion} \\\\
\\text{Fisher Decomposition:} & \\quad 1 + g_{\\text{nominal}} = (1 + g_{\\text{real}})(1 + \\pi) \\implies g_{\\text{real}} = \\frac{1 + g_{\\text{nominal}}}{1 + \\pi} - 1
\\end{aligned}`;
    navigator.clipboard.writeText(latex);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  // 10-Year Trajectory Schedule
  const trajectorySchedule = useMemo(() => {
    const baseNom = mode === 'basket_aggregation' ? calc.nominalGdp_Basket : mode === 'two_period_decomp' ? nom2 : nominalGdp;
    const baseReal = mode === 'basket_aggregation' ? calc.realGdp_Basket : mode === 'two_period_decomp' ? calc.real2 : calc.realGdp;
    const nomR = annualNomGrowth / 100;
    const infR = annualInflation / 100;
    const realR = ((1 + nomR) / (1 + infR)) - 1;

    const schedule = [];
    for (let yr = 0; yr <= 10; yr++) {
      const nomVal = baseNom * Math.pow(1 + nomR, yr);
      const realVal = baseReal * Math.pow(1 + realR, yr);
      const deflatorVal = realVal > 0 ? (nomVal / realVal) * 100 : 100;
      const inflationWedge = nomVal - realVal;

      schedule.push({
        year: yr,
        nomGdp: nomVal,
        realGdp: realVal,
        deflator: deflatorVal,
        wedge: inflationWedge
      });
    }
    return schedule;
  }, [mode, calc, nom2, nominalGdp, annualNomGrowth, annualInflation]);

  // SVG Chart Geometry
  const chartGeometry = useMemo(() => {
    const width = 600;
    const height = 280;
    const padding = { top: 30, right: 30, bottom: 40, left: 65 };

    const maxVal = Math.max(...trajectorySchedule.map(s => s.nomGdp)) * 1.1;
    const minVal = Math.min(...trajectorySchedule.map(s => s.realGdp)) * 0.9;

    const scaleX = (yr: number) => padding.left + (yr / 10) * (width - padding.left - padding.right);
    const scaleY = (v: number) => height - padding.bottom - ((v - minVal) / (maxVal - minVal)) * (height - padding.top - padding.bottom);

    let nomPath = '';
    let realPath = '';
    let wedgeArea = '';

    trajectorySchedule.forEach((pt, idx) => {
      const x = scaleX(pt.year);
      const yNom = scaleY(pt.nomGdp);
      const yReal = scaleY(pt.realGdp);

      if (idx === 0) {
        nomPath += `M ${x} ${yNom}`;
        realPath += `M ${x} ${yReal}`;
      } else {
        nomPath += ` L ${x} ${yNom}`;
        realPath += ` L ${x} ${yReal}`;
      }
    });

    // Wedge Area Polygon
    const revReal = [...trajectorySchedule].reverse();
    wedgeArea = nomPath;
    revReal.forEach(pt => {
      wedgeArea += ` L ${scaleX(pt.year)} ${scaleY(pt.realGdp)}`;
    });
    wedgeArea += ' Z';

    return { width, height, padding, minVal, maxVal, scaleX, scaleY, nomPath, realPath, wedgeArea };
  }, [trajectorySchedule]);

  // 5x5 Matrix: Nominal Growth (2% to 10%) vs Inflation Rate (1% to 9%)
  const sensitivityMatrix = useMemo(() => {
    const nomRates = [2.0, 4.0, 6.0, 8.0, 10.0];
    const infRates = [1.0, 3.0, 5.0, 7.0, 9.0];

    return nomRates.map(n => {
      const row = infRates.map(i => {
        const exactR = ((1 + n / 100) / (1 + i / 100) - 1) * 100;
        return {
          nomRate: n,
          infRate: i,
          realRate: exactR
        };
      });
      return { nomRate: n, row };
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Real GDP vs Nominal GDP Suite</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">GDP Deflator Deflation, Price Level Indices & Output Decomposition</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={copyLaTeX}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copiedFormula ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFormula ? 'Copied LaTeX!' : 'Copy Proof'}
            </button>
            <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 font-medium">Currency:</span>
              <CurrencySelector value={currency} onChange={setCurrency} />
            </div>
          </div>
        </div>

        {/* Macro Scenarios Carousel */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Macroeconomic Economy Preset:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleApplyPreset(p)}
                className={`p-2.5 rounded-2xl border text-left transition-all relative group flex flex-col justify-between ${
                  nominalGdp === p.nominalGdp && gdpDeflator === p.gdpDeflator && mode === p.mode
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${p.badgeColor}`}>
                      {p.category}
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">{p.name}</div>
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                  {p.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setMode('deflator_mode')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'deflator_mode'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            1. Single-Period Deflator Deflation
          </button>
          <button
            onClick={() => setMode('two_period_decomp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'two_period_decomp'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            2. Two-Period Output vs Inflation Decomposition
          </button>
          <button
            onClick={() => setMode('basket_aggregation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'basket_aggregation'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            3. Multi-Good Basket Aggregation (P×Q)
          </button>
          <button
            onClick={() => setMode('trajectory_series')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'trajectory_series'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            4. 10-Year Inflation Wedge Trajectory
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Output Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Mode 1: Deflator Inputs */}
          {mode === 'deflator_mode' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Nominal GDP & Deflator Index
              </h3>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Nominal GDP (Current Market Prices) ({currency} Billions)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 font-semibold text-sm">{currency}</span>
                  <input
                    type="number"
                    min="1"
                    value={nominalGdp}
                    onChange={(e) => setNominalGdp(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  GDP Deflator Index (Base Year = 100)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={gdpDeflator}
                  onChange={(e) => setGdpDeflator(parseFloat(e.target.value) || 100)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-indigo-300 dark:border-indigo-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Price level has shifted by {calc.priceChangeFromBase >= 0 ? '+' : ''}{calc.priceChangeFromBase.toFixed(1)}% relative to the base year benchmark.
                </span>
              </div>
            </div>
          )}

          {/* Mode 2: Two Period Decomposition */}
          {mode === 'two_period_decomp' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Two-Period Shift Parameters
              </h3>

              {/* Period 1 */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">Base Period (1)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400">Nominal GDP 1</label>
                    <input
                      type="number"
                      value={nom1}
                      onChange={(e) => setNom1(parseFloat(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400">Deflator 1</label>
                    <input
                      type="number"
                      value={def1}
                      onChange={(e) => setDef1(parseFloat(e.target.value) || 100)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Period 2 */}
              <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 space-y-2">
                <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 block">Current Period (2)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400">Nominal GDP 2</label>
                    <input
                      type="number"
                      value={nom2}
                      onChange={(e) => setNom2(parseFloat(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400">Deflator 2</label>
                    <input
                      type="number"
                      value={def2}
                      onChange={(e) => setDef2(parseFloat(e.target.value) || 100)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: 4-Good Basket Aggregation */}
          {mode === 'basket_aggregation' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-600" />
                4-Sector Micro-Macro Basket
              </h3>
              <div className="space-y-2 text-xs">
                {/* Sector A */}
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border grid grid-cols-4 gap-1.5">
                  <div><span className="text-[10px] text-zinc-400">P0 (Ind)</span><input type="number" value={p0_a} onChange={(e) => setP0_a(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                  <div><span className="text-[10px] text-zinc-400">Q0</span><input type="number" value={q0_a} onChange={(e) => setQ0_a(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                  <div><span className="text-[10px] text-zinc-400">Pt</span><input type="number" value={pt_a} onChange={(e) => setPt_a(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                  <div><span className="text-[10px] text-zinc-400">Qt</span><input type="number" value={qt_a} onChange={(e) => setQt_a(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                </div>
                {/* Sector B */}
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border grid grid-cols-4 gap-1.5">
                  <div><span className="text-[10px] text-zinc-400">P0 (Svc)</span><input type="number" value={p0_b} onChange={(e) => setP0_b(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                  <div><span className="text-[10px] text-zinc-400">Q0</span><input type="number" value={q0_b} onChange={(e) => setQ0_b(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                  <div><span className="text-[10px] text-zinc-400">Pt</span><input type="number" value={pt_b} onChange={(e) => setPt_b(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                  <div><span className="text-[10px] text-zinc-400">Qt</span><input type="number" value={qt_b} onChange={(e) => setQt_b(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                </div>
                {/* Sector C */}
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border grid grid-cols-4 gap-1.5">
                  <div><span className="text-[10px] text-zinc-400">P0 (Agri)</span><input type="number" value={p0_c} onChange={(e) => setP0_c(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                  <div><span className="text-[10px] text-zinc-400">Q0</span><input type="number" value={q0_c} onChange={(e) => setQ0_c(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                  <div><span className="text-[10px] text-zinc-400">Pt</span><input type="number" value={pt_c} onChange={(e) => setPt_c(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                  <div><span className="text-[10px] text-zinc-400">Qt</span><input type="number" value={qt_c} onChange={(e) => setQt_c(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                </div>
                {/* Sector D */}
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border grid grid-cols-4 gap-1.5">
                  <div><span className="text-[10px] text-zinc-400">P0 (Tech)</span><input type="number" value={p0_d} onChange={(e) => setP0_d(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                  <div><span className="text-[10px] text-zinc-400">Q0</span><input type="number" value={q0_d} onChange={(e) => setQ0_d(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                  <div><span className="text-[10px] text-zinc-400">Pt</span><input type="number" value={pt_d} onChange={(e) => setPt_d(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                  <div><span className="text-[10px] text-zinc-400">Qt</span><input type="number" value={qt_d} onChange={(e) => setQt_d(parseFloat(e.target.value) || 0)} className="w-full px-1.5 py-1 bg-white dark:bg-zinc-900 border rounded text-xs" /></div>
                </div>
              </div>
            </div>
          )}

          {/* Mode 4: Trajectory Series Inputs */}
          {mode === 'trajectory_series' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                Annual Trajectory Inflation Drivers
              </h3>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Expected Annual Nominal GDP Growth (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={annualNomGrowth}
                  onChange={(e) => setAnnualNomGrowth(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Expected Annual GDP Deflator Inflation (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={annualInflation}
                  onChange={(e) => setAnnualInflation(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Hero KPI Cards & SVG Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Dual Hero Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Real GDP Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white p-6 shadow-md">
              <div className="flex items-center justify-between opacity-85 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>
                  {mode === 'basket_aggregation' ? 'Real GDP (Base Prices)' : mode === 'two_period_decomp' ? 'Real GDP (Period 2)' : 'Real GDP (Constant Prices)'}
                </span>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight my-2">
                {currency}{mode === 'basket_aggregation' ? calc.realGdp_Basket.toLocaleString(undefined, { maximumFractionDigits: 1 }) : mode === 'two_period_decomp' ? calc.real2.toLocaleString(undefined, { maximumFractionDigits: 1 }) : calc.realGdp.toLocaleString(undefined, { maximumFractionDigits: 1 })}B
              </div>
              <div className="text-xs text-indigo-100 flex items-center justify-between pt-2 border-t border-indigo-500/40">
                <span>
                  Nominal: {currency}{mode === 'basket_aggregation' ? calc.nominalGdp_Basket.toLocaleString() : mode === 'two_period_decomp' ? nom2.toLocaleString() : nominalGdp.toLocaleString()}B
                </span>
                <span className="font-bold">
                  {mode === 'two_period_decomp' ? `Real: +${calc.realGrowthRate.toFixed(2)}%` : `Deflator: ${mode === 'basket_aggregation' ? calc.implicitDeflator_Basket.toFixed(1) : gdpDeflator}`}
                </span>
              </div>
            </div>

            {/* Inflation Wedge / Price Premium Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 text-white p-6 shadow-md">
              <div className="flex items-center justify-between opacity-85 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Inflation Price Premium / Wedge</span>
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight my-2">
                {currency}{mode === 'basket_aggregation' ? (calc.nominalGdp_Basket - calc.realGdp_Basket).toLocaleString(undefined, { maximumFractionDigits: 1 }) : mode === 'two_period_decomp' ? (nom2 - calc.real2).toLocaleString(undefined, { maximumFractionDigits: 1 }) : calc.inflationImpact.toLocaleString(undefined, { maximumFractionDigits: 1 })}B
              </div>
              <div className="text-xs text-rose-100 flex items-center justify-between pt-2 border-t border-rose-500/40">
                <span>Paper Valuation Gap</span>
                <span className="font-bold">
                  {mode === 'two_period_decomp' ? `Price Inflation: +${calc.deflatorInflationRate.toFixed(2)}%` : `${calc.priceChangeFromBase >= 0 ? '+' : ''}${calc.priceChangeFromBase.toFixed(1)}% vs Base`}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Continuous SVG Nominal vs Real Divergence Chart */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                10-Year Nominal GDP vs Real Constant-Price Output Divergence
              </h4>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-rose-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Nominal GDP
                </span>
                <span className="flex items-center gap-1 text-indigo-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Real GDP
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`} className="w-full h-auto max-h-[280px]">
                <defs>
                  <linearGradient id="wedgeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Axes */}
                <line
                  x1={chartGeometry.padding.left}
                  y1={chartGeometry.height - chartGeometry.padding.bottom}
                  x2={chartGeometry.width - chartGeometry.padding.right}
                  y2={chartGeometry.height - chartGeometry.padding.bottom}
                  stroke="#71717a"
                  strokeWidth="1.5"
                />
                <line
                  x1={chartGeometry.padding.left}
                  y1={chartGeometry.padding.top}
                  x2={chartGeometry.padding.left}
                  y2={chartGeometry.height - chartGeometry.padding.bottom}
                  stroke="#71717a"
                  strokeWidth="1.5"
                />

                {/* Shaded Inflation Wedge */}
                <path d={chartGeometry.wedgeArea} fill="url(#wedgeFill)" />

                {/* Nominal Curve */}
                <path
                  d={chartGeometry.nomPath}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Real Curve */}
                <path
                  d={chartGeometry.realPath}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Axis Labels */}
                <text
                  x={chartGeometry.width - chartGeometry.padding.right}
                  y={chartGeometry.height - chartGeometry.padding.bottom + 25}
                  fill="#71717a"
                  fontSize="11"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  Horizon (Years)
                </text>
                <text
                  x={chartGeometry.padding.left - 10}
                  y={chartGeometry.padding.top}
                  fill="#71717a"
                  fontSize="11"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  Output ({currency}B)
                </text>

                {/* Coordinates */}
                <text
                  x={chartGeometry.scaleX(10)}
                  y={chartGeometry.scaleY(trajectorySchedule[10]?.nomGdp) - 6}
                  fill="#f43f5e"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  Nom: {currency}{trajectorySchedule[10]?.nomGdp.toFixed(0)}B
                </text>
                <text
                  x={chartGeometry.scaleX(10)}
                  y={chartGeometry.scaleY(trajectorySchedule[10]?.realGdp) + 14}
                  fill="#6366f1"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  Real: {currency}{trajectorySchedule[10]?.realGdp.toFixed(0)}B
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Year Deflation & Compounding Schedule Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">10-Year Macroeconomic Deflation Schedule</h3>
              <p className="text-xs text-zinc-500">Tracking Nominal GDP vs Constant-Price Real GDP and Cumulative Price Indices</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="p-2.5 font-semibold">Year</th>
                <th className="p-2.5 font-semibold text-rose-600 dark:text-rose-400">Nominal GDP</th>
                <th className="p-2.5 font-semibold text-indigo-600 dark:text-indigo-400">Real GDP</th>
                <th className="p-2.5 font-semibold">GDP Deflator</th>
                <th className="p-2.5 font-semibold">Inflation Wedge ({currency})</th>
                <th className="p-2.5 font-semibold">Valuation Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {trajectorySchedule.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-2.5 font-bold">Year {row.year}</td>
                  <td className="p-2.5 font-bold text-rose-600 dark:text-rose-400">{currency}{row.nomGdp.toLocaleString(undefined, { maximumFractionDigits: 1 })}B</td>
                  <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">{currency}{row.realGdp.toLocaleString(undefined, { maximumFractionDigits: 1 })}B</td>
                  <td className="p-2.5">{row.deflator.toFixed(1)}</td>
                  <td className="p-2.5">{currency}{row.wedge.toLocaleString(undefined, { maximumFractionDigits: 1 })}B</td>
                  <td className="p-2.5 font-sans">
                    {row.deflator > 140 ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        High Price Dilution
                      </span>
                    ) : row.deflator < 100 ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                        Deflationary Premium
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-[11px]">Stable Price Deflation</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5x5 Sensitivity Matrix */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">5×5 Sensitivity Matrix: Real GDP Growth Rate (%)</h3>
              <p className="text-xs text-zinc-500">Nominal GDP Growth Rate vs Deflator Inflation Rate Matrix</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left font-semibold text-zinc-500 dark:text-zinc-400">Nominal Growth \ Inflation</th>
                {[1, 3, 5, 7, 9].map(i => (
                  <th key={i} className="p-2 font-semibold text-zinc-700 dark:text-zinc-300">
                    Infl +{i}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {sensitivityMatrix.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="p-2 text-left font-sans font-bold text-zinc-700 dark:text-zinc-300">
                    Nominal +{row.nomRate.toFixed(1)}%
                  </td>
                  {row.row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all"
                    >
                      <div className={`font-bold ${cell.realRate >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {cell.realRate >= 0 ? '+' : ''}{cell.realRate.toFixed(2)}%
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal Theoretical & Mathematical Proof Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Calculator className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Macroeconomic Theory, Formulas & Proofs</h3>
              <p className="text-xs text-zinc-500">Mathematical derivations of Real GDP, Paasche deflator index, and Fisher decomposition</p>
            </div>
          </div>
          {showAdvanced ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
        </button>

        {showAdvanced && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">1. The GDP Deflator Index</h4>
                <p>The GDP Deflator is a comprehensive measure of national price inflation covering all domestically produced goods and services:</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"GDP Deflator = (Nominal GDP / Real GDP) * 100 = (sum(Pt * Qt) / sum(P0 * Qt)) * 100"}
                </div>
                <p>Because current quantities (Qt) are used as weights, the GDP deflator functions as an implicit Paasche price index.</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">2. Deflating Nominal GDP into Constant Prices</h4>
                <p>Real GDP isolates genuine volume changes from price-level distortions:</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"Real GDP = (Nominal GDP / GDP Deflator) * 100"}
                </div>
                <p>Inflation Premium / Wedge = Nominal GDP − Real GDP.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">3. Exact Fisher Multiplicative Growth Decomposition</h4>
              <p>
                The relationship between nominal growth (g_nom), real growth (g_real), and price inflation (π):
              </p>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                {"1 + g_nom = (1 + g_real) * (1 + pi) => g_real = [(1 + g_nom) / (1 + pi) - 1] * 100%"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
