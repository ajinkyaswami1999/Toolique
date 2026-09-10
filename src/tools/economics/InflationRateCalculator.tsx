import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2,
  Sliders, ChevronDown, ChevronUp,
  Calculator, Layers, Flame, Scale,
  Activity, ShieldAlert
} from 'lucide-react';

type CalculationMode = 'cpi_change' | 'weighted_basket' | 'time_machine' | 'wage_adjustment';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  cpi1: number;
  cpi2: number;
  periodInterval: 'annual' | 'monthly_annualized' | 'quarterly_annualized';
  baseAmount: number;
  // Category Inflation Rates (%)
  infHousing: number;
  infFood: number;
  infEnergy: number;
  infHealth: number;
  infServices: number;
  // Wage Adjustment
  salary1: number;
  salary2: number;
  description: string;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'US Post-Pandemic Spike (2021-22)',
    category: 'High Inflation Spike',
    badgeColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800',
    mode: 'cpi_change',
    cpi1: 270.97,
    cpi2: 296.31,
    periodInterval: 'annual',
    baseAmount: 10000,
    infHousing: 7.2,
    infFood: 10.4,
    infEnergy: 25.6,
    infHealth: 4.8,
    infServices: 6.1,
    salary1: 85000,
    salary2: 89000,
    description: 'Headline US CPI surged +9.35% YoY driven by supply chain snarls and energy commodities.'
  },
  {
    name: 'India Retail Food Surge',
    category: 'Emerging Market CPI',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
    mode: 'cpi_change',
    cpi1: 165.2,
    cpi2: 176.4,
    periodInterval: 'annual',
    baseAmount: 50000,
    infHousing: 4.2,
    infFood: 8.7,
    infEnergy: 6.5,
    infHealth: 5.5,
    infServices: 4.8,
    salary1: 600000,
    salary2: 645000,
    description: 'India consumer price index rose +6.78% led by monsoon-sensitive food & agricultural prices.'
  },
  {
    name: 'Central Bank 2.0% Target Stability',
    category: 'Monetary Target',
    badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    mode: 'cpi_change',
    cpi1: 100.0,
    cpi2: 102.0,
    periodInterval: 'annual',
    baseAmount: 10000,
    infHousing: 2.0,
    infFood: 2.1,
    infEnergy: 1.8,
    infHealth: 2.5,
    infServices: 2.0,
    salary1: 100000,
    salary2: 103000,
    description: 'Optimal central bank price stability benchmark (2.00% target rate, 35-year purchasing power half-life).'
  },
  {
    name: 'Eurozone Energy Shock Basket',
    category: 'Weighted Basket',
    badgeColor: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800',
    mode: 'weighted_basket',
    cpi1: 110.0,
    cpi2: 121.5,
    periodInterval: 'annual',
    baseAmount: 10000,
    infHousing: 8.5,
    infFood: 12.8,
    infEnergy: 34.0,
    infHealth: 3.2,
    infServices: 5.4,
    salary1: 45000,
    salary2: 46500,
    description: 'Weighted 5-category Laspeyres basket illustrating headline spike driven by +34% energy inflation.'
  },
  {
    name: 'Tech Worker Real Wage Cut',
    category: 'Wage Adjustment',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    mode: 'wage_adjustment',
    cpi1: 280.0,
    cpi2: 302.4,
    periodInterval: 'annual',
    baseAmount: 10000,
    infHousing: 6.5,
    infFood: 7.8,
    infEnergy: 12.0,
    infHealth: 4.5,
    infServices: 5.5,
    salary1: 120000,
    salary2: 126000,
    description: 'A 5% nominal pay raise ($120k → $126k) eclipsed by 8% CPI inflation results in a -2.78% real income cut.'
  },
  {
    name: '1979 Great US Stagflation',
    category: 'Galloping Inflation',
    badgeColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800',
    mode: 'cpi_change',
    cpi1: 72.6,
    cpi2: 82.4,
    periodInterval: 'annual',
    baseAmount: 10000,
    infHousing: 14.2,
    infFood: 11.5,
    infEnergy: 37.0,
    infHealth: 9.8,
    infServices: 10.2,
    salary1: 20000,
    salary2: 21500,
    description: 'Galloping +13.50% annual inflation eroding 11.9% of cash purchasing power in a single calendar year.'
  }
];

export default function InflationRateCalculator() {
  const [currency, setCurrency] = useState<string>('$');
  const [mode, setMode] = useState<CalculationMode>('cpi_change');
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Mode 1: CPI Period Inputs
  const [cpi1, setCpi1] = useState<number>(270.97);
  const [cpi2, setCpi2] = useState<number>(296.31);
  const [periodInterval, setPeriodInterval] = useState<'annual' | 'monthly_annualized' | 'quarterly_annualized'>('annual');
  const [baseAmount, setBaseAmount] = useState<number>(10000);

  // Mode 2: Multi-Category Basket Inputs
  const [infHousing, setInfHousing] = useState<number>(7.2); // 33% weight
  const [infFood, setInfFood] = useState<number>(10.4);      // 14% weight
  const [infEnergy, setInfEnergy] = useState<number>(25.6);   // 16% weight
  const [infHealth, setInfHealth] = useState<number>(4.8);    // 9% weight
  const [infServices, setInfServices] = useState<number>(6.1);// 28% weight

  // Mode 3: Time Machine Inputs
  const [historicalYear, setHistoricalYear] = useState<number>(1990);
  const [historicalAmount, setHistoricalAmount] = useState<number>(10000);
  const [historicalCPI, setHistoricalCPI] = useState<number>(130.7);
  const [currentCPI, setCurrentCPI] = useState<number>(314.5);

  // Mode 4: Wage Adjustment Inputs
  const [salary1, setSalary1] = useState<number>(85000);
  const [salary2, setSalary2] = useState<number>(89000);
  const [wageCPI1, setWageCPI1] = useState<number>(270.97);
  const [wageCPI2, setWageCPI2] = useState<number>(296.31);

  // Core Math Calculations
  const calc = useMemo(() => {
    // 1. Period CPI Inflation
    const deltaCPI = cpi2 - cpi1;
    const periodInflation = cpi1 > 0 ? (deltaCPI / cpi1) * 100 : 0;

    // Annualized calculation
    let annualizedInflation = periodInflation;
    if (periodInterval === 'monthly_annualized') {
      annualizedInflation = cpi1 > 0 ? (Math.pow(1 + deltaCPI / cpi1, 12) - 1) * 100 : 0;
    } else if (periodInterval === 'quarterly_annualized') {
      annualizedInflation = cpi1 > 0 ? (Math.pow(1 + deltaCPI / cpi1, 4) - 1) * 100 : 0;
    }

    const effectiveRate = periodInterval === 'annual' ? periodInflation : annualizedInflation;

    // Purchasing Power Loss on Base Amount: Loss = M * (1 - CPI1/CPI2)
    const purchasingPowerLoss = cpi2 > 0 ? baseAmount * (1 - (cpi1 / cpi2)) : 0;
    const realValueRemaining = baseAmount - purchasingPowerLoss;
    const futureEquivalentNeeded = cpi1 > 0 ? baseAmount * (cpi2 / cpi1) : baseAmount;

    // Rule of 70 Halving Time: 70 / rate
    const halvingYears = effectiveRate > 0 ? 70 / effectiveRate : 0;

    // Inflation Regime Classification
    let regime = 'Moderate Inflation';
    let regimeColor = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
    if (effectiveRate < 0) {
      regime = 'Price Deflation (Contracting Prices)';
      regimeColor = 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800';
    } else if (effectiveRate <= 2.5) {
      regime = 'Low / Central Bank Target Stability';
      regimeColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    } else if (effectiveRate <= 5.0) {
      regime = 'Moderate Creeping Inflation';
      regimeColor = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
    } else if (effectiveRate <= 10.0) {
      regime = 'Elevated / High Inflation';
      regimeColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    } else if (effectiveRate <= 50.0) {
      regime = 'Galloping Double-Digit Inflation';
      regimeColor = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    } else {
      regime = 'Severe Hyperinflation Spiral';
      regimeColor = 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700';
    }

    // 2. Weighted Basket Aggregation (Laspeyres)
    // Weights: Housing=0.33, Food=0.14, Energy=0.16, Health=0.09, Services=0.28
    const wH = 0.33; const wF = 0.14; const wE = 0.16; const wM = 0.09; const wS = 0.28;
    const contribH = wH * infHousing;
    const contribF = wF * infFood;
    const contribE = wE * infEnergy;
    const contribM = wM * infHealth;
    const contribS = wS * infServices;
    const headlineBasketRate = contribH + contribF + contribE + contribM + contribS;
    // Core CPI excludes Food and Energy: Weights sum to 0.33 + 0.09 + 0.28 = 0.70
    const coreBasketRate = (contribH + contribM + contribS) / 0.70;

    // 3. Time Machine Purchasing Power
    const timeMultiplier = historicalCPI > 0 ? currentCPI / historicalCPI : 1;
    const adjustedCurrentValue = historicalAmount * timeMultiplier;
    const cumulativePriceInflation = historicalCPI > 0 ? ((currentCPI - historicalCPI) / historicalCPI) * 100 : 0;

    // 4. Wage Adjustment Calculations
    const nominalWageGrowth = salary1 > 0 ? ((salary2 - salary1) / salary1) * 100 : 0;
    const wagePeriodInflation = wageCPI1 > 0 ? ((wageCPI2 - wageCPI1) / wageCPI1) * 100 : 0;
    const exactRealWageGrowth = ((1 + nominalWageGrowth / 100) / (1 + wagePeriodInflation / 100) - 1) * 100;
    const approxRealWageGrowth = nominalWageGrowth - wagePeriodInflation;
    const salary2InPeriod1Dollars = wageCPI2 > 0 ? salary2 / (wageCPI2 / wageCPI1) : salary2;
    const realNetPayChange = salary2InPeriod1Dollars - salary1;

    return {
      deltaCPI, periodInflation, annualizedInflation, effectiveRate,
      purchasingPowerLoss, realValueRemaining, futureEquivalentNeeded, halvingYears,
      regime, regimeColor,
      // Basket
      wH, wF, wE, wM, wS,
      contribH, contribF, contribE, contribM, contribS,
      headlineBasketRate, coreBasketRate,
      // Time Machine
      timeMultiplier, adjustedCurrentValue, cumulativePriceInflation,
      // Wage Adjustment
      nominalWageGrowth, wagePeriodInflation, exactRealWageGrowth, approxRealWageGrowth,
      salary2InPeriod1Dollars, realNetPayChange
    };
  }, [cpi1, cpi2, periodInterval, baseAmount, infHousing, infFood, infEnergy, infHealth, infServices, historicalAmount, historicalCPI, currentCPI, salary1, salary2, wageCPI1, wageCPI2]);

  // Apply Preset
  const handleApplyPreset = (p: PresetScenario) => {
    setMode(p.mode);
    setCpi1(p.cpi1);
    setCpi2(p.cpi2);
    setPeriodInterval(p.periodInterval);
    setBaseAmount(p.baseAmount);
    setInfHousing(p.infHousing);
    setInfFood(p.infFood);
    setInfEnergy(p.infEnergy);
    setInfHealth(p.infHealth);
    setInfServices(p.infServices);
    setSalary1(p.salary1);
    setSalary2(p.salary2);
  };

  const handleReset = () => {
    handleApplyPreset(PRESETS[0]);
  };

  const copyLaTeX = () => {
    const latex = `\\begin{aligned}
\\text{Prior CPI } (CPI_1) & = ${cpi1} \\\\
\\text{Current CPI } (CPI_2) & = ${cpi2} \\\\
\\Delta CPI & = CPI_2 - CPI_1 = ${calc.deltaCPI >= 0 ? '+' : ''}${calc.deltaCPI.toFixed(2)} \\text{ points} \\\\
\\text{Inflation Rate } (\\pi) & = \\left(\\frac{CPI_2 - CPI_1}{CPI_1}\\right) \\times 100\\% = \\left(\\frac{${calc.deltaCPI.toFixed(2)}}{${cpi1}}\\right) \\times 100\\% = ${calc.periodInflation.toFixed(2)}\\% \\\\
\\text{Purchasing Power Loss} & = M_0 \\times \\left(1 - \\frac{CPI_1}{CPI_2}\\right) = ${baseAmount.toLocaleString()} \\times \\left(1 - \\frac{${cpi1}}{${cpi2}}\\right) = ${calc.purchasingPowerLoss.toFixed(2)} \\\\
\\text{Rule of 70 Halving Time} & = \\frac{70}{\\pi\\%} = \\frac{70}{${calc.effectiveRate.toFixed(2)}} = ${calc.halvingYears.toFixed(1)} \\text{ Years}
\\end{aligned}`;
    navigator.clipboard.writeText(latex);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  // 10-Year Purchasing Power Degradation Trajectory
  const decaySchedule = useMemo(() => {
    const base = baseAmount;
    const rate = mode === 'weighted_basket' ? calc.headlineBasketRate : mode === 'wage_adjustment' ? calc.wagePeriodInflation : calc.effectiveRate;
    const r = Math.max(0, rate) / 100;
    const schedule = [];

    for (let yr = 0; yr <= 10; yr++) {
      const realVal = base / Math.pow(1 + r, yr);
      const lostVal = base - realVal;
      const cumInfl = (Math.pow(1 + r, yr) - 1) * 100;
      const futureNeeded = base * Math.pow(1 + r, yr);

      schedule.push({
        year: yr,
        realVal,
        lostVal,
        cumInfl,
        futureNeeded
      });
    }
    return schedule;
  }, [baseAmount, mode, calc.headlineBasketRate, calc.wagePeriodInflation, calc.effectiveRate]);

  // SVG Chart Geometry
  const chartGeometry = useMemo(() => {
    const width = 600;
    const height = 280;
    const padding = { top: 30, right: 30, bottom: 40, left: 65 };

    const maxVal = baseAmount;

    const scaleX = (yr: number) => padding.left + (yr / 10) * (width - padding.left - padding.right);
    const scaleY = (v: number) => height - padding.bottom - (v / maxVal) * (height - padding.top - padding.bottom);

    let pathD = '';
    decaySchedule.forEach((pt, idx) => {
      const x = scaleX(pt.year);
      const y = scaleY(pt.realVal);
      if (idx === 0) pathD += `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    });

    // Area under real value
    let areaD = pathD;
    areaD += ` L ${scaleX(10)} ${scaleY(0)} L ${scaleX(0)} ${scaleY(0)} Z`;

    return { width, height, padding, maxVal, scaleX, scaleY, pathD, areaD };
  }, [decaySchedule, baseAmount]);

  // 5x5 Matrix: Cash Balance ($10k to $100k) vs Inflation Rate (2% to 10%)
  const sensitivityMatrix = useMemo(() => {
    const balances = [10000, 25000, 50000, 75000, 100000];
    const infRates = [2.0, 4.0, 6.0, 8.0, 10.0];

    return balances.map(b => {
      const row = infRates.map(r => {
        // 5-year purchasing power loss
        const loss5Yr = b * (1 - (1 / Math.pow(1 + r / 100, 5)));
        const pctLoss = (loss5Yr / b) * 100;
        return {
          balance: b,
          infRate: r,
          loss5Yr,
          pctLoss
        };
      });
      return { balance: b, row };
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Flame className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Consumer Inflation & Purchasing Power Suite</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">CPI Index Shifts, Laspeyres Multi-Category Baskets & Real Wage Adjustments</p>
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

        {/* Inflation Scenario Presets Carousel */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Macroeconomic Inflation Preset:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleApplyPreset(p)}
                className={`p-2.5 rounded-2xl border text-left transition-all relative group flex flex-col justify-between ${
                  cpi1 === p.cpi1 && cpi2 === p.cpi2 && mode === p.mode
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20'
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
            onClick={() => setMode('cpi_change')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'cpi_change'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            1. Period CPI & Purchasing Power Loss
          </button>
          <button
            onClick={() => setMode('weighted_basket')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'weighted_basket'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            2. Multi-Category Basket (Headline vs Core)
          </button>
          <button
            onClick={() => setMode('time_machine')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'time_machine'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            3. Historical Purchasing Power Time-Machine
          </button>
          <button
            onClick={() => setMode('wage_adjustment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'wage_adjustment'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            4. Salary vs Inflation (Real Wage Change)
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Mode 1: Period CPI Inputs */}
          {mode === 'cpi_change' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-600" />
                  Consumer Price Index (CPI) Values
                </h3>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setPeriodInterval('annual')}
                    className={`px-2 py-1 rounded-lg transition-all ${periodInterval === 'annual' ? 'bg-white dark:bg-zinc-700 text-rose-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Annual
                  </button>
                  <button
                    onClick={() => setPeriodInterval('monthly_annualized')}
                    className={`px-2 py-1 rounded-lg transition-all ${periodInterval === 'monthly_annualized' ? 'bg-white dark:bg-zinc-700 text-rose-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Monthly (Ann)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Prior Period CPI Index (CPI₁)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={cpi1}
                  onChange={(e) => setCpi1(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Current Period CPI Index (CPI₂)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={cpi2}
                  onChange={(e) => setCpi2(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Cash Savings / Fixed Capital Baseline ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 font-semibold text-sm">{currency}</span>
                  <input
                    type="number"
                    min="1"
                    value={baseAmount}
                    onChange={(e) => setBaseAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Multi-Category Basket Inputs */}
          {mode === 'weighted_basket' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Category Inflation Rates (%)
                </h3>
                <span className="text-[11px] font-mono text-zinc-500">Laspeyres Weights</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Housing */}
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Housing & Shelter (33% wt)</span>
                    <span className="text-[10px] text-zinc-400">Rent, mortgages, utility bills</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={infHousing}
                    onChange={(e) => setInfHousing(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold text-right"
                  />
                </div>

                {/* Food */}
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Food & Beverages (14% wt)</span>
                    <span className="text-[10px] text-zinc-400">Groceries, dining out</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={infFood}
                    onChange={(e) => setInfFood(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold text-right"
                  />
                </div>

                {/* Energy */}
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Transport & Energy (16% wt)</span>
                    <span className="text-[10px] text-zinc-400">Gasoline, electricity, auto fares</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={infEnergy}
                    onChange={(e) => setInfEnergy(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold text-right"
                  />
                </div>

                {/* Healthcare */}
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Medical & Healthcare (9% wt)</span>
                    <span className="text-[10px] text-zinc-400">Pharma, doctor visits, health plans</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={infHealth}
                    onChange={(e) => setInfHealth(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold text-right"
                  />
                </div>

                {/* Services & Other */}
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Education, Apparel & Other (28% wt)</span>
                    <span className="text-[10px] text-zinc-400">Tuition, clothing, recreation</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    value={infServices}
                    onChange={(e) => setInfServices(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold text-right"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Time Machine Inputs */}
          {mode === 'time_machine' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                Historical Purchasing Power Converter
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Historical Year
                  </label>
                  <input
                    type="number"
                    value={historicalYear}
                    onChange={(e) => setHistoricalYear(parseInt(e.target.value) || 1990)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-purple-300 dark:border-purple-700 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Historical Dollar Amount ({currency})
                  </label>
                  <input
                    type="number"
                    value={historicalAmount}
                    onChange={(e) => setHistoricalAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-purple-300 dark:border-purple-700 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Historical Year CPI
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={historicalCPI}
                    onChange={(e) => setHistoricalCPI(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Current Year CPI
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentCPI}
                    onChange={(e) => setCurrentCPI(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border rounded-xl text-sm font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 4: Wage Adjustment Inputs */}
          {mode === 'wage_adjustment' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                Salary & CPI Shift Parameters
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Previous Salary (W₁) ({currency})
                  </label>
                  <input
                    type="number"
                    value={salary1}
                    onChange={(e) => setSalary1(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    New Salary (W₂) ({currency})
                  </label>
                  <input
                    type="number"
                    value={salary2}
                    onChange={(e) => setSalary2(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Period 1 CPI Index
                  </label>
                  <input
                    type="number"
                    value={wageCPI1}
                    onChange={(e) => setWageCPI1(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Period 2 CPI Index
                  </label>
                  <input
                    type="number"
                    value={wageCPI2}
                    onChange={(e) => setWageCPI2(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border rounded-xl text-sm font-bold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Hero Metric Cards & SVG Graphic (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Dual Hero Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Headline Inflation Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 text-white p-6 shadow-md">
              <div className="flex items-center justify-between opacity-85 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>
                  {mode === 'weighted_basket' ? 'Headline Basket Inflation' : mode === 'time_machine' ? 'Today\'s Purchasing Value' : mode === 'wage_adjustment' ? 'Real Purchasing Wage Growth' : 'Headline CPI Inflation'}
                </span>
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight my-2">
                {mode === 'time_machine'
                  ? `${currency}${calc.adjustedCurrentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : mode === 'wage_adjustment'
                  ? `${calc.exactRealWageGrowth >= 0 ? '+' : ''}${calc.exactRealWageGrowth.toFixed(2)}%`
                  : `${calc.effectiveRate >= 0 ? '+' : ''}${mode === 'weighted_basket' ? calc.headlineBasketRate.toFixed(2) : calc.effectiveRate.toFixed(2)}%`}
              </div>
              <div className="text-xs text-rose-100 flex items-center justify-between pt-2 border-t border-rose-500/40">
                <span>
                  {mode === 'time_machine' ? `Cumulative Price Inflation: +${calc.cumulativePriceInflation.toFixed(1)}%` : mode === 'wage_adjustment' ? `Nominal Pay: +${calc.nominalWageGrowth.toFixed(1)}% | CPI: +${calc.wagePeriodInflation.toFixed(1)}%` : `CPI Shift: ${calc.deltaCPI >= 0 ? '+' : ''}${calc.deltaCPI.toFixed(2)} pts`}
                </span>
                {mode === 'weighted_basket' && (
                  <span className="font-bold">Core: +{calc.coreBasketRate.toFixed(2)}%</span>
                )}
              </div>
            </div>

            {/* Purchasing Power Loss / Real Impact Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white p-6 shadow-md">
              <div className="flex items-center justify-between opacity-85 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>
                  {mode === 'wage_adjustment' ? 'Net Real Annual Pay Shift' : 'Purchasing Power Destruction'}
                </span>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight my-2">
                {mode === 'wage_adjustment'
                  ? `${calc.realNetPayChange >= 0 ? '+' : ''}${currency}${calc.realNetPayChange.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : `${currency}${calc.purchasingPowerLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              </div>
              <div className="text-xs text-amber-100 flex items-center justify-between pt-2 border-t border-amber-500/40">
                <span>
                  {mode === 'wage_adjustment' ? (calc.realNetPayChange >= 0 ? 'Real Standard of Living Expanded' : 'Inflation Subtracted Purchasing Power') : `Remaining Value: ${currency}${calc.realValueRemaining.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                </span>
                {calc.halvingYears > 0 && mode !== 'wage_adjustment' && (
                  <span className="font-bold">Halves in {calc.halvingYears.toFixed(1)}y</span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Continuous SVG Purchasing Power Erosion Decay Graphic */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-rose-600" />
                10-Year Real Purchasing Power Decay ({currency}{baseAmount.toLocaleString()} Base Cash)
              </h4>
              <span className="text-[11px] font-mono font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-lg">
                Year 10 Value: {currency}{decaySchedule[10]?.realVal.toFixed(0)} (−{((1 - decaySchedule[10]?.realVal / baseAmount) * 100).toFixed(1)}%)
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`} className="w-full h-auto max-h-[280px]">
                <defs>
                  <linearGradient id="decayAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.30" />
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

                {/* Shaded Area */}
                <path d={chartGeometry.areaD} fill="url(#decayAreaGrad)" />

                {/* Decay Curve */}
                <path
                  d={chartGeometry.pathD}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Points */}
                {decaySchedule.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={chartGeometry.scaleX(pt.year)}
                    cy={chartGeometry.scaleY(pt.realVal)}
                    r={idx === 0 || idx === 10 ? '5' : '3'}
                    fill={idx === 0 || idx === 10 ? '#e11d48' : '#f43f5e'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Axis Titles */}
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
                  Real Value ({currency})
                </text>

                {/* Coordinates */}
                <text
                  x={chartGeometry.scaleX(0)}
                  y={chartGeometry.scaleY(baseAmount) - 8}
                  fill="#71717a"
                  fontSize="10"
                  textAnchor="start"
                  fontWeight="bold"
                >
                  Y0: {currency}{baseAmount.toLocaleString()}
                </text>
                <text
                  x={chartGeometry.scaleX(10)}
                  y={chartGeometry.scaleY(decaySchedule[10]?.realVal) - 8}
                  fill="#e11d48"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  Y10: {currency}{decaySchedule[10]?.realVal.toFixed(0)}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Year Purchasing Power Degradation Schedule Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">10-Year Purchasing Power Degradation Schedule</h3>
              <p className="text-xs text-zinc-500">Compounding Erosion of Fixed Cash Balances Under Sustained CPI Inflation</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="p-2.5 font-semibold">Year</th>
                <th className="p-2.5 font-semibold">Nominal Cash</th>
                <th className="p-2.5 font-semibold text-rose-600 dark:text-rose-400">Real Purchasing Power</th>
                <th className="p-2.5 font-semibold">Cumulative Loss ({currency})</th>
                <th className="p-2.5 font-semibold">Purchasing Loss (%)</th>
                <th className="p-2.5 font-semibold">Equivalent Future Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {decaySchedule.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-2.5 font-bold">Year {row.year}</td>
                  <td className="p-2.5">{currency}{baseAmount.toLocaleString()}</td>
                  <td className="p-2.5 font-bold text-rose-600 dark:text-rose-400">{currency}{row.realVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="p-2.5 text-rose-600">−{currency}{row.lostVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="p-2.5">{((row.lostVal / baseAmount) * 100).toFixed(1)}%</td>
                  <td className="p-2.5 font-bold text-zinc-700 dark:text-zinc-300">{currency}{row.futureNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5x5 Sensitivity Matrix: Capital vs Inflation Rate */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">5×5 Sensitivity Matrix: 5-Year Cumulative Purchasing Power Loss ({currency})</h3>
              <p className="text-xs text-zinc-500">Cash Balance vs Annual Inflation Rate Matrix</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left font-semibold text-zinc-500 dark:text-zinc-400">Cash Balance \ Inflation Rate</th>
                {[2, 4, 6, 8, 10].map(r => (
                  <th key={r} className="p-2 font-semibold text-zinc-700 dark:text-zinc-300">
                    +{r}% / yr
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {sensitivityMatrix.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="p-2 text-left font-sans font-bold text-zinc-700 dark:text-zinc-300">
                    {currency}{row.balance.toLocaleString()}
                  </td>
                  {row.row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="p-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all"
                    >
                      <div className="font-bold text-rose-600 dark:text-rose-400">−{currency}{cell.loss5Yr.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      <div className="text-[10px] text-zinc-400">−{cell.pctLoss.toFixed(1)}%</div>
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
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Economic Theory, Formulas & Proofs</h3>
              <p className="text-xs text-zinc-500">Mathematical derivations of Laspeyres CPI index, purchasing power loss, and real wage adjustments</p>
            </div>
          </div>
          {showAdvanced ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
        </button>

        {showAdvanced && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">1. Discrete CPI Inflation Formula</h4>
                <p>The headline percentage change in the Consumer Price Index is calculated as:</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"pi = ((CPI_t - CPI_{t-1}) / CPI_{t-1}) * 100%"}
                </div>
                <p>Monthly annualized rate: {"pi_{annualized} = [(1 + (CPI_t - CPI_{t-1})/CPI_{t-1})^12 - 1] * 100%"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">2. Purchasing Power Destruction</h4>
                <p>The monetary degradation of nominal cash balance M over inflation period:</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"Loss = M * [1 - (CPI_1 / CPI_2)] = M * [1 - 1/(1 + pi/100)]"}
                </div>
                <p>Rule of 70 Halving Time: {"T_{half} = 70 / pi%"}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">3. Real Wage Growth Adjustment</h4>
              <p>
                Real purchasing wage growth measures living standard gains net of price increases:
              </p>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                {"1 + g_{real wage} = (1 + g_{nominal wage}) / (1 + pi) => g_{real wage} = [(1 + g_{nom}) / (1 + pi) - 1] * 100%"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
