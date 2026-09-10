import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2,
  Sliders, ChevronDown, ChevronUp,
  Calculator, TrendingUp,
  Layers, Globe, Users, Activity,
  Flame
} from 'lucide-react';

type CalculationMode = 'period_growth' | 'expenditure_components' | 'real_vs_nominal' | 'per_capita';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  gdp1: number;
  gdp2: number;
  periodType: 'annual' | 'quarterly_saar';
  c1: number;
  c2: number;
  i1: number;
  i2: number;
  g1: number;
  g2: number;
  nx1: number;
  nx2: number;
  nominalGrowth: number;
  inflationRate: number;
  realGdpGrowth: number;
  populationGrowth: number;
  currentPopulation: number;
  description: string;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'India Real GDP Surge',
    category: 'High-Growth Emerging',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
    mode: 'period_growth',
    gdp1: 3500,
    gdp2: 3750,
    periodType: 'annual',
    c1: 2100, c2: 2250,
    i1: 1100, i2: 1210,
    g1: 400, g2: 430,
    nx1: -100, nx2: -140,
    nominalGrowth: 11.5,
    inflationRate: 4.5,
    realGdpGrowth: 7.14,
    populationGrowth: 0.8,
    currentPopulation: 1420,
    description: 'Rapid industrialization and digital infrastructure yielding +7.14% real annual expansion.'
  },
  {
    name: 'United States SAAR Expansion',
    category: 'Advanced Economy',
    badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    mode: 'period_growth',
    gdp1: 26800,
    gdp2: 27360,
    periodType: 'quarterly_saar',
    c1: 18200, c2: 18600,
    i1: 4800, i2: 4950,
    g1: 4700, g2: 4780,
    nx1: -900, nx2: -970,
    nominalGrowth: 5.5,
    inflationRate: 2.7,
    realGdpGrowth: 2.8,
    populationGrowth: 0.5,
    currentPopulation: 335,
    description: 'US quarterly QoQ annualized growth (SAAR +2.09% quarterly, +8.6% SAAR) powered by consumer spending.'
  },
  {
    name: 'Eurozone Stagnation / Sluggish',
    category: 'Sluggish Growth',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    mode: 'period_growth',
    gdp1: 14500,
    gdp2: 14540,
    periodType: 'annual',
    c1: 7800, c2: 7810,
    i1: 3200, i2: 3190,
    g1: 3100, g2: 3120,
    nx1: 400, nx2: 420,
    nominalGrowth: 2.8,
    inflationRate: 2.5,
    realGdpGrowth: 0.28,
    populationGrowth: 0.1,
    currentPopulation: 345,
    description: 'High energy prices and tight monetary policy slowing real GDP growth to +0.28%.'
  },
  {
    name: 'Expenditure Components Boom',
    category: 'Component Analysis',
    badgeColor: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800',
    mode: 'expenditure_components',
    gdp1: 1000,
    gdp2: 1065,
    periodType: 'annual',
    c1: 600, c2: 635,
    i1: 200, i2: 225,
    g1: 180, g2: 190,
    nx1: 20, nx2: 15,
    nominalGrowth: 8.0,
    inflationRate: 3.0,
    realGdpGrowth: 6.5,
    populationGrowth: 1.2,
    currentPopulation: 100,
    description: 'Full decomposition of consumption, private investment, government budget, and net exports.'
  },
  {
    name: 'Japan Demographic Transition',
    category: 'Per Capita Focus',
    badgeColor: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800',
    mode: 'per_capita',
    gdp1: 4200,
    gdp2: 4250,
    periodType: 'annual',
    c1: 2350, c2: 2380,
    i1: 1050, i2: 1060,
    g1: 850, g2: 860,
    nx1: -50, nx2: -50,
    nominalGrowth: 2.2,
    inflationRate: 1.0,
    realGdpGrowth: 1.19,
    populationGrowth: -0.5,
    currentPopulation: 125,
    description: 'Shrinking population (-0.5%) amplifies per-capita prosperity despite modest aggregate output expansion.'
  },
  {
    name: 'Global Financial Crisis Shock',
    category: 'Economic Contraction',
    badgeColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800',
    mode: 'period_growth',
    gdp1: 14720,
    gdp2: 14410,
    periodType: 'annual',
    c1: 10000, c2: 9800,
    i1: 2400, i2: 2050,
    g1: 2900, g2: 3100,
    nx1: -580, nx2: -540,
    nominalGrowth: -1.5,
    inflationRate: 0.5,
    realGdpGrowth: -2.11,
    populationGrowth: 0.8,
    currentPopulation: 305,
    description: 'Credit crunch causing a -2.11% severe recession contraction in national gross domestic product.'
  }
];

export default function GdpGrowthRateCalculator() {
  const [currency, setCurrency] = useState<string>('$');
  const [mode, setMode] = useState<CalculationMode>('period_growth');
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Mode 1: Simple & SAAR Period Growth
  const [gdp1, setGdp1] = useState<number>(3500);
  const [gdp2, setGdp2] = useState<number>(3750);
  const [periodType, setPeriodType] = useState<'annual' | 'quarterly_saar'>('annual');

  // Mode 2: Expenditure Components (Y = C + I + G + NX)
  const [c1, setC1] = useState<number>(2100);
  const [c2, setC2] = useState<number>(2250);
  const [i1, setI1] = useState<number>(1100);
  const [i2, setI2] = useState<number>(1210);
  const [g1, setG1] = useState<number>(400);
  const [g2, setG2] = useState<number>(430);
  const [nx1, setNx1] = useState<number>(-100);
  const [nx2, setNx2] = useState<number>(-140);

  // Mode 3: Real vs Nominal & Deflator Inflation
  const [nominalGrowth, setNominalGrowth] = useState<number>(11.5);
  const [inflationRate, setInflationRate] = useState<number>(4.5);

  // Mode 4: Per Capita Dynamics
  const [realGdpGrowth, setRealGdpGrowth] = useState<number>(7.14);
  const [populationGrowth, setPopulationGrowth] = useState<number>(0.8);
  const [currentPopulation, setCurrentPopulation] = useState<number>(1420); // in Millions

  // Calculations Engine
  const calc = useMemo(() => {
    // 1. Period Growth Rate
    const deltaGdp = gdp2 - gdp1;
    const growthRate = gdp1 > 0 ? (deltaGdp / gdp1) * 100 : 0;

    // SAAR (Seasonally Adjusted Annual Rate for Quarterly data): SAAR = [(1 + g_quarter)^4 - 1] * 100%
    const quarterlyGrowth = growthRate;
    const saarGrowth = gdp1 > 0 ? (Math.pow(1 + deltaGdp / gdp1, 4) - 1) * 100 : 0;
    const effectiveGrowth = periodType === 'quarterly_saar' ? saarGrowth : growthRate;

    // Doubling Time (Rule of 70): 70 / g
    const doublingYears = effectiveGrowth > 0 ? 70 / effectiveGrowth : 0;

    // Business Cycle Phase
    let cyclePhase = 'Moderate Expansion';
    let cycleColor = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
    if (effectiveGrowth >= 6) {
      cyclePhase = 'Boom / Rapid Industrial Expansion';
      cycleColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    } else if (effectiveGrowth >= 3) {
      cyclePhase = 'Healthy Economic Expansion';
      cycleColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    } else if (effectiveGrowth > 0.5) {
      cyclePhase = 'Moderate Steady Growth';
      cycleColor = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
    } else if (effectiveGrowth >= 0) {
      cyclePhase = 'Economic Stagnation / Sluggish';
      cycleColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    } else if (effectiveGrowth > -2) {
      cyclePhase = 'Technical Recession (Contraction)';
      cycleColor = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    } else {
      cyclePhase = 'Severe Economic Depression';
      cycleColor = 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700';
    }

    // 2. Expenditure Components Approach
    const totalGdp1 = c1 + i1 + g1 + nx1;
    const totalGdp2 = c2 + i2 + g2 + nx2;
    const deltaTotalGdp = totalGdp2 - totalGdp1;
    const componentGrowthRate = totalGdp1 > 0 ? (deltaTotalGdp / totalGdp1) * 100 : 0;

    // Component Growth & Contributions (Percentage Points)
    const deltaC = c2 - c1;
    const deltaI = i2 - i1;
    const deltaG = g2 - g1;
    const deltaNX = nx2 - nx1;

    const contribC = totalGdp1 > 0 ? (deltaC / totalGdp1) * 100 : 0;
    const contribI = totalGdp1 > 0 ? (deltaI / totalGdp1) * 100 : 0;
    const contribG = totalGdp1 > 0 ? (deltaG / totalGdp1) * 100 : 0;
    const contribNX = totalGdp1 > 0 ? (deltaNX / totalGdp1) * 100 : 0;

    const pctGrowthC = c1 > 0 ? (deltaC / c1) * 100 : 0;
    const pctGrowthI = i1 > 0 ? (deltaI / i1) * 100 : 0;
    const pctGrowthG = g1 > 0 ? (deltaG / g1) * 100 : 0;
    const pctGrowthNX = nx1 !== 0 ? (deltaNX / Math.abs(nx1)) * 100 : 0;

    // 3. Real vs Nominal Decomposition
    // (1 + g_nom) = (1 + g_real) * (1 + inflation) => g_real = [(1 + g_nom)/(1 + inflation) - 1] * 100
    const exactRealGrowth = ((1 + nominalGrowth / 100) / (1 + inflationRate / 100) - 1) * 100;
    const approxRealGrowth = nominalGrowth - inflationRate;

    // 4. Per Capita Growth Dynamics
    // (1 + g_per_capita) = (1 + g_real) / (1 + g_pop)
    const exactPerCapitaGrowth = ((1 + realGdpGrowth / 100) / (1 + populationGrowth / 100) - 1) * 100;
    const approxPerCapitaGrowth = realGdpGrowth - populationGrowth;
    const baseGdpPerCapita = currentPopulation > 0 ? (gdp2 * 1_000_000_000) / (currentPopulation * 1_000_000) : 0;

    return {
      deltaGdp, growthRate, saarGrowth, effectiveGrowth, doublingYears,
      cyclePhase, cycleColor, quarterlyGrowth,
      // Expenditure
      totalGdp1, totalGdp2, deltaTotalGdp, componentGrowthRate,
      deltaC, deltaI, deltaG, deltaNX,
      contribC, contribI, contribG, contribNX,
      pctGrowthC, pctGrowthI, pctGrowthG, pctGrowthNX,
      // Real vs Nominal
      exactRealGrowth, approxRealGrowth,
      // Per Capita
      exactPerCapitaGrowth, approxPerCapitaGrowth, baseGdpPerCapita
    };
  }, [gdp1, gdp2, periodType, c1, c2, i1, i2, g1, g2, nx1, nx2, nominalGrowth, inflationRate, realGdpGrowth, populationGrowth, currentPopulation]);

  // Load Preset
  const handleApplyPreset = (p: PresetScenario) => {
    setMode(p.mode);
    setGdp1(p.gdp1);
    setGdp2(p.gdp2);
    setPeriodType(p.periodType);
    setC1(p.c1);
    setC2(p.c2);
    setI1(p.i1);
    setI2(p.i2);
    setG1(p.g1);
    setG2(p.g2);
    setNx1(p.nx1);
    setNx2(p.nx2);
    setNominalGrowth(p.nominalGrowth);
    setInflationRate(p.inflationRate);
    setRealGdpGrowth(p.realGdpGrowth);
    setPopulationGrowth(p.populationGrowth);
    setCurrentPopulation(p.currentPopulation);
  };

  const handleReset = () => {
    handleApplyPreset(PRESETS[0]);
  };

  const copyLaTeX = () => {
    const latex = `\\begin{aligned}
\\text{Prior GDP } (Y_1) & = ${gdp1.toLocaleString()} \\text{ Billion} \\\\
\\text{Current GDP } (Y_2) & = ${gdp2.toLocaleString()} \\text{ Billion} \\\\
\\Delta Y & = Y_2 - Y_1 = ${calc.deltaGdp >= 0 ? '+' : ''}${calc.deltaGdp.toLocaleString()} \\text{ Billion} \\\\
\\text{Percentage Growth } (g) & = \\left(\\frac{Y_2 - Y_1}{Y_1}\\right) \\times 100\\% = \\left(\\frac{${calc.deltaGdp}}{${gdp1}}\\right) \\times 100\\% = ${calc.growthRate.toFixed(2)}\\% \\\\
${periodType === 'quarterly_saar' ? `\\text{Annualized SAAR} & = \\left[(1 + g_q)^4 - 1\\right] \\times 100\\% = ${calc.saarGrowth.toFixed(2)}\\% \\\\` : ''}
\\text{Rule of 70 (Doubling Time)} & = \\frac{70}{g} = \\frac{70}{${calc.effectiveGrowth.toFixed(2)}} = ${calc.doublingYears.toFixed(1)} \\text{ Years}
\\end{aligned}`;
    navigator.clipboard.writeText(latex);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  // 10-Year Compounded Trajectory Schedule
  const compoundingSchedule = useMemo(() => {
    const base = mode === 'expenditure_components' ? calc.totalGdp2 : gdp2;
    const gRate = mode === 'real_vs_nominal' ? calc.exactRealGrowth : mode === 'per_capita' ? realGdpGrowth : calc.effectiveGrowth;
    const schedule = [];
    const r = gRate / 100;

    for (let yr = 0; yr <= 10; yr++) {
      const projGdp = base * Math.pow(1 + r, yr);
      const cumGrowth = ((projGdp - base) / base) * 100;
      const pop = currentPopulation * Math.pow(1 + populationGrowth / 100, yr);
      const perCapita = pop > 0 ? (projGdp * 1_000_000_000) / (pop * 1_000_000) : 0;

      schedule.push({
        year: yr,
        gdp: projGdp,
        cumGrowth,
        perCapita,
        pop
      });
    }
    return schedule;
  }, [mode, calc.totalGdp2, gdp2, calc.exactRealGrowth, realGdpGrowth, calc.effectiveGrowth, currentPopulation, populationGrowth]);

  // SVG Chart Geometry
  const chartGeometry = useMemo(() => {
    const width = 600;
    const height = 280;
    const padding = { top: 30, right: 30, bottom: 40, left: 65 };

    const minGdp = Math.min(...compoundingSchedule.map(s => s.gdp)) * 0.95;
    const maxGdp = Math.max(...compoundingSchedule.map(s => s.gdp)) * 1.05;

    const scaleX = (yr: number) => padding.left + (yr / 10) * (width - padding.left - padding.right);
    const scaleY = (g: number) => height - padding.bottom - ((g - minGdp) / (maxGdp - minGdp)) * (height - padding.top - padding.bottom);

    let pathD = '';
    compoundingSchedule.forEach((pt, idx) => {
      const x = scaleX(pt.year);
      const y = scaleY(pt.gdp);
      if (idx === 0) pathD += `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    });

    return { width, height, padding, minGdp, maxGdp, scaleX, scaleY, pathD };
  }, [compoundingSchedule]);

  // 5x5 Matrix: Real GDP Growth (1% to 8%) vs Population Growth (-0.5% to 2.0%)
  const sensitivityMatrix = useMemo(() => {
    const gRates = [2.0, 4.0, 6.0, 8.0, 10.0];
    const popRates = [-0.5, 0.0, 0.5, 1.0, 1.5];

    return gRates.map(g => {
      const row = popRates.map(p => {
        const pcGrowth = ((1 + g / 100) / (1 + p / 100) - 1) * 100;
        const doubleYrs = pcGrowth > 0 ? 70 / pcGrowth : 0;
        return {
          gRate: g,
          popRate: p,
          pcGrowth,
          doubleYrs
        };
      });
      return { gRate: g, row };
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">National GDP Growth Suite</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Gross Domestic Product Expansion, Expenditure Shares, SAAR & Per-Capita Intelligence</p>
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
                  gdp1 === p.gdp1 && gdp2 === p.gdp2 && mode === p.mode
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
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
            onClick={() => setMode('period_growth')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'period_growth'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            1. Period & SAAR Growth Rate
          </button>
          <button
            onClick={() => setMode('expenditure_components')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'expenditure_components'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            2. Expenditure Approach (C + I + G + NX)
          </button>
          <button
            onClick={() => setMode('real_vs_nominal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'real_vs_nominal'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            3. Real vs Nominal & Deflator
          </button>
          <button
            onClick={() => setMode('per_capita')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'per_capita'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            4. Per-Capita & Living Standards
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Mode 1: Period Growth Inputs */}
          {mode === 'period_growth' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Period GDP Quantities
                </h3>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setPeriodType('annual')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${periodType === 'annual' ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Annual YoY
                  </button>
                  <button
                    onClick={() => setPeriodType('quarterly_saar')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${periodType === 'quarterly_saar' ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Quarterly SAAR
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Prior Period GDP (Y1) ({currency} Billions)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 font-semibold text-sm">{currency}</span>
                  <input
                    type="number"
                    min="1"
                    value={gdp1}
                    onChange={(e) => setGdp1(parseFloat(e.target.value) || 1)}
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Current Period GDP (Y2) ({currency} Billions)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 font-semibold text-sm">{currency}</span>
                  <input
                    type="number"
                    min="1"
                    value={gdp2}
                    onChange={(e) => setGdp2(parseFloat(e.target.value) || 1)}
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 block">Rule of 70 Economic Doubling:</span>
                <p className="text-zinc-500">
                  {calc.effectiveGrowth > 0
                    ? `At a sustained growth rate of ${calc.effectiveGrowth.toFixed(2)}%, national real output doubles every ${calc.doublingYears.toFixed(1)} years.`
                    : 'Economy is stagnant or contracting; positive compounding doubling does not occur.'}
                </p>
              </div>
            </div>
          )}

          {/* Mode 2: Expenditure Approach */}
          {mode === 'expenditure_components' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  National Expenditure Inputs
                </h3>
                <span className="text-[11px] font-mono text-zinc-500 font-bold">Y = C + I + G + NX</span>
              </div>

              {/* Consumption C */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">1. Private Consumption (C)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Prior C1"
                    value={c1}
                    onChange={(e) => setC1(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder="Current C2"
                    value={c2}
                    onChange={(e) => setC2(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              {/* Investment I */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">2. Gross Private Investment (I)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Prior I1"
                    value={i1}
                    onChange={(e) => setI1(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder="Current I2"
                    value={i2}
                    onChange={(e) => setI2(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              {/* Government G */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">3. Government Consumption (G)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Prior G1"
                    value={g1}
                    onChange={(e) => setG1(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder="Current G2"
                    value={g2}
                    onChange={(e) => setG2(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              {/* Net Exports NX */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">4. Net Exports (NX = Exports − Imports)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Prior NX1"
                    value={nx1}
                    onChange={(e) => setNx1(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder="Current NX2"
                    value={nx2}
                    onChange={(e) => setNx2(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Real vs Nominal Inputs */}
          {mode === 'real_vs_nominal' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                Nominal Growth & GDP Deflator Inflation
              </h3>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Nominal GDP Growth Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={nominalGrowth}
                  onChange={(e) => setNominalGrowth(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  GDP Deflator Inflation Rate (π) (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs space-y-1">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 block">Fisher Identity Decomposition:</span>
                <p className="text-zinc-500">
                  {"Real Growth = [(1 + Nominal) / (1 + Inflation) - 1] * 100%"}
                </p>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                  Exact Real Expansion = {calc.exactRealGrowth.toFixed(2)}% (vs ~{calc.approxRealGrowth.toFixed(2)}% approx)
                </p>
              </div>
            </div>
          )}

          {/* Mode 4: Per Capita Inputs */}
          {mode === 'per_capita' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-600" />
                Real Output vs Population Dynamics
              </h3>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  National Real GDP Growth Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={realGdpGrowth}
                  onChange={(e) => setRealGdpGrowth(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-cyan-300 dark:border-cyan-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Population Growth Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={populationGrowth}
                  onChange={(e) => setPopulationGrowth(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-cyan-300 dark:border-cyan-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Current National Population (Millions)
                </label>
                <input
                  type="number"
                  value={currentPopulation}
                  onChange={(e) => setCurrentPopulation(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-cyan-300 dark:border-cyan-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Hero Metrics & SVG Graph (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Dual Hero Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary GDP Growth Rate Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 shadow-md">
              <div className="flex items-between justify-between opacity-85 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>
                  {mode === 'period_growth' ? (periodType === 'quarterly_saar' ? 'Quarterly SAAR Growth' : 'Annual GDP Growth Rate') : mode === 'expenditure_components' ? 'Aggregate GDP Growth' : mode === 'real_vs_nominal' ? 'Exact Real GDP Growth' : 'Per-Capita GDP Growth'}
                </span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight my-2">
                {mode === 'period_growth'
                  ? `${calc.effectiveGrowth >= 0 ? '+' : ''}${calc.effectiveGrowth.toFixed(2)}%`
                  : mode === 'expenditure_components'
                  ? `${calc.componentGrowthRate >= 0 ? '+' : ''}${calc.componentGrowthRate.toFixed(2)}%`
                  : mode === 'real_vs_nominal'
                  ? `${calc.exactRealGrowth >= 0 ? '+' : ''}${calc.exactRealGrowth.toFixed(2)}%`
                  : `${calc.exactPerCapitaGrowth >= 0 ? '+' : ''}${calc.exactPerCapitaGrowth.toFixed(2)}%`}
              </div>
              <div className="text-xs text-emerald-100 flex items-center justify-between pt-2 border-t border-emerald-500/40">
                <span>
                  {mode === 'period_growth' ? `Net Expansion: ${calc.deltaGdp >= 0 ? '+' : ''}${currency}${calc.deltaGdp.toLocaleString()}B` : mode === 'expenditure_components' ? `Total GDP: ${currency}${calc.totalGdp2.toLocaleString()}B` : mode === 'real_vs_nominal' ? `Nominal: ${nominalGrowth}% | Infl: ${inflationRate}%` : `Population: ${currentPopulation}M`}
                </span>
                {calc.doublingYears > 0 && (
                  <span className="font-bold">Doubles in {calc.doublingYears.toFixed(1)}y</span>
                )}
              </div>
            </div>

            {/* Economic Cycle Phase Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-6 shadow-md">
              <div className="flex items-center justify-between opacity-85 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Macro Business Cycle</span>
                <Activity className="w-4 h-4" />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight my-3 line-clamp-1">
                {calc.cyclePhase}
              </div>
              <div className="text-xs text-blue-100 flex items-center justify-between pt-2 border-t border-blue-500/40">
                <span>Standard of Living: {calc.effectiveGrowth > populationGrowth ? 'Expanding' : 'Contracting'}</span>
                <span>Rule of 70</span>
              </div>
            </div>
          </div>

          {/* Expenditure Contribution Breakdown Cards (Mode 2) */}
          {mode === 'expenditure_components' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <span className="text-[11px] font-semibold text-blue-600 block">Consumption (C)</span>
                <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
                  {calc.contribC >= 0 ? '+' : ''}{calc.contribC.toFixed(2)} pp
                </span>
                <span className="text-[10px] text-zinc-400">({calc.pctGrowthC >= 0 ? '+' : ''}{calc.pctGrowthC.toFixed(1)}% growth)</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <span className="text-[11px] font-semibold text-emerald-600 block">Investment (I)</span>
                <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
                  {calc.contribI >= 0 ? '+' : ''}{calc.contribI.toFixed(2)} pp
                </span>
                <span className="text-[10px] text-zinc-400">({calc.pctGrowthI >= 0 ? '+' : ''}{calc.pctGrowthI.toFixed(1)}% growth)</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <span className="text-[11px] font-semibold text-purple-600 block">Government (G)</span>
                <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
                  {calc.contribG >= 0 ? '+' : ''}{calc.contribG.toFixed(2)} pp
                </span>
                <span className="text-[10px] text-zinc-400">({calc.pctGrowthG >= 0 ? '+' : ''}{calc.pctGrowthG.toFixed(1)}% growth)</span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <span className="text-[11px] font-semibold text-rose-600 block">Net Exports (NX)</span>
                <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
                  {calc.contribNX >= 0 ? '+' : ''}{calc.contribNX.toFixed(2)} pp
                </span>
                <span className="text-[10px] text-zinc-400">({calc.deltaNX >= 0 ? '+' : ''}{currency}{calc.deltaNX}B shift)</span>
              </div>
            </div>
          )}

          {/* Interactive SVG 10-Year Compounding Trajectory Graphic */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                10-Year Compound GDP Expansion Trajectory ({currency} Billions)
              </h4>
              <span className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg">
                Year 10: {currency}{compoundingSchedule[10]?.gdp.toFixed(0)}B (+{compoundingSchedule[10]?.cumGrowth.toFixed(1)}%)
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`} className="w-full h-auto max-h-[280px]">
                <defs>
                  <linearGradient id="gdpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
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

                {/* Shaded Area */}
                <path
                  d={`${chartGeometry.pathD} L ${chartGeometry.scaleX(10)} ${chartGeometry.scaleY(chartGeometry.minGdp)} L ${chartGeometry.scaleX(0)} ${chartGeometry.scaleY(chartGeometry.minGdp)} Z`}
                  fill="url(#gdpFill)"
                />

                {/* Curve Line */}
                <path
                  d={chartGeometry.pathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {compoundingSchedule.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={chartGeometry.scaleX(pt.year)}
                    cy={chartGeometry.scaleY(pt.gdp)}
                    r={idx === 0 || idx === 10 ? '5' : '3'}
                    fill={idx === 0 || idx === 10 ? '#059669' : '#10b981'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}

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
                  GDP ({currency}B)
                </text>

                {/* Callout Coordinates */}
                <text
                  x={chartGeometry.scaleX(0)}
                  y={chartGeometry.scaleY(compoundingSchedule[0]?.gdp) - 8}
                  fill="#71717a"
                  fontSize="10"
                  textAnchor="start"
                  fontWeight="bold"
                >
                  Y0: {currency}{compoundingSchedule[0]?.gdp.toFixed(0)}B
                </text>
                <text
                  x={chartGeometry.scaleX(10)}
                  y={chartGeometry.scaleY(compoundingSchedule[10]?.gdp) - 8}
                  fill="#059669"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  Y10: {currency}{compoundingSchedule[10]?.gdp.toFixed(0)}B
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Year Compounding Schedule Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">10-Year Compound Macroeconomic Schedule</h3>
              <p className="text-xs text-zinc-500">Projected National Gross Domestic Product and Per-Capita Income Growth</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="p-2.5 font-semibold">Year</th>
                <th className="p-2.5 font-semibold text-emerald-600 dark:text-emerald-400">Gross Output (GDP)</th>
                <th className="p-2.5 font-semibold">Cumulative Growth (%)</th>
                <th className="p-2.5 font-semibold">Population (M)</th>
                <th className="p-2.5 font-semibold">GDP Per Capita ({currency})</th>
                <th className="p-2.5 font-semibold">Economic Milestone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {compoundingSchedule.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-2.5 font-bold">Year {row.year}</td>
                  <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">{currency}{row.gdp.toLocaleString(undefined, { maximumFractionDigits: 1 })} Billion</td>
                  <td className="p-2.5">{row.cumGrowth >= 0 ? '+' : ''}{row.cumGrowth.toFixed(1)}%</td>
                  <td className="p-2.5">{row.pop.toFixed(1)}M</td>
                  <td className="p-2.5 font-bold">{currency}{row.perCapita.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="p-2.5 font-sans">
                    {row.cumGrowth >= 100 ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Economy Doubled
                      </span>
                    ) : row.cumGrowth >= 50 ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        +50% Scale Expansion
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[11px]">Compounding</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5x5 Sensitivity Matrix: Real Growth vs Population Growth */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">5×5 Sensitivity Matrix: Per-Capita Income Growth Rate (%)</h3>
              <p className="text-xs text-zinc-500">Real GDP Growth Rate vs Population Growth Rate Matrix</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left font-semibold text-zinc-500 dark:text-zinc-400">Real GDP Growth \ Pop Growth</th>
                {[-0.5, 0.0, 0.5, 1.0, 1.5].map(p => (
                  <th key={p} className="p-2 font-semibold text-zinc-700 dark:text-zinc-300">
                    Pop {p >= 0 ? `+${p}%` : `${p}%`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {sensitivityMatrix.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="p-2 text-left font-sans font-bold text-zinc-700 dark:text-zinc-300">
                    GDP +{row.gRate.toFixed(1)}%
                  </td>
                  {row.row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all"
                    >
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">+{cell.pcGrowth.toFixed(2)}%</div>
                      <div className="text-[10px] text-zinc-400">{cell.doubleYrs > 0 ? `2x: ${cell.doubleYrs.toFixed(0)}y` : 'N/A'}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal Theoretical & Mathematical Foundations Section */}
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
              <p className="text-xs text-zinc-500">Mathematical derivations of national income growth, SAAR compounding, and Fisher decomposition</p>
            </div>
          </div>
          {showAdvanced ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
        </button>

        {showAdvanced && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">1. Period-over-Period & Annualized SAAR Growth</h4>
                <p>Simple discrete growth percentage between periods:</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"g = ((Y_t - Y_{t-1}) / Y_{t-1}) * 100%"}
                </div>
                <p>Quarterly Seasonally Adjusted Annual Rate (SAAR) compounding:</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"g_{SAAR} = [(1 + g_quarter)^4 - 1] * 100%"}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">2. Expenditure Component Contributions</h4>
                <p>Total national output is given by $Y = C + I + G + NX$. The percentage point contribution of each sector $i$ to total GDP growth is:</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"Contribution_i = (Delta Y_i / Y_{t-1}) * 100 pp"}
                </div>
                <p>The sum of all component percentage point contributions identically equals the total GDP growth rate.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">3. Real Output vs Living Standards (Per-Capita Growth)</h4>
              <p>
                Growth in average living standards requires real GDP growth ($g_Y$) to exceed population growth ($g_P$):
              </p>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                {"g_{per capita} = [(1 + g_Y) / (1 + g_P) - 1] * 100% ≈ g_Y - g_P"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
