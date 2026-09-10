import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2,
  Sliders, ChevronDown, ChevronUp,
  Calculator, Layers, Scale,
  Activity, TrendingUp, TrendingDown,
  Globe, PieChart, ShieldCheck,
  Target, ArrowRight,
  Zap
} from 'lucide-react';

type CalculationMode = 'aggregate_expenditure' | 'keynesian_cross' | 'fiscal_gap' | 'leakages_injections';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  consumption: number;
  investment: number;
  government: number;
  exports: number;
  imports: number;
  autonomousC: number;
  mpc: number;
  taxRate: number;
  lumpTax: number;
  mpi: number;
  potentialGdp: number;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'US Consumer-Driven Economy',
    category: 'Mature Consumer',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    mode: 'aggregate_expenditure',
    consumption: 19500,
    investment: 5100,
    government: 4800,
    exports: 3100,
    imports: 3900,
    autonomousC: 4500,
    mpc: 0.85,
    taxRate: 0.22,
    lumpTax: 500,
    mpi: 0.14,
    potentialGdp: 29000
  },
  {
    name: 'India High-Capex & Trade Deficit',
    category: 'Fast-Growing Emerging',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    mode: 'aggregate_expenditure',
    consumption: 2300,
    investment: 1250,
    government: 450,
    exports: 800,
    imports: 950,
    autonomousC: 400,
    mpc: 0.78,
    taxRate: 0.16,
    lumpTax: 50,
    mpi: 0.20,
    potentialGdp: 4200
  },
  {
    name: 'Germany Export-Led Powerhouse',
    category: 'Export Surplus',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    mode: 'leakages_injections',
    consumption: 2350,
    investment: 950,
    government: 1000,
    exports: 2150,
    imports: 1900,
    autonomousC: 550,
    mpc: 0.72,
    taxRate: 0.35,
    lumpTax: 100,
    mpi: 0.38,
    potentialGdp: 4600
  },
  {
    name: 'Post-Crisis Stimulus & Gap Solver',
    category: 'Keynesian Policy',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
    mode: 'fiscal_gap',
    consumption: 3200,
    investment: 800,
    government: 900,
    exports: 500,
    imports: 600,
    autonomousC: 700,
    mpc: 0.80,
    taxRate: 0.20,
    lumpTax: 100,
    mpi: 0.10,
    potentialGdp: 5600
  },
  {
    name: 'Nordic High-Tax / Welfare State',
    category: 'Public Sector Intensive',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    mode: 'keynesian_cross',
    consumption: 340,
    investment: 150,
    government: 175,
    exports: 310,
    imports: 275,
    autonomousC: 80,
    mpc: 0.74,
    taxRate: 0.44,
    lumpTax: 20,
    mpi: 0.35,
    potentialGdp: 720
  },
  {
    name: 'Developing Economy Capex Surge',
    category: 'High Investment',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
    mode: 'keynesian_cross',
    consumption: 620,
    investment: 420,
    government: 160,
    exports: 220,
    imports: 320,
    autonomousC: 120,
    mpc: 0.82,
    taxRate: 0.15,
    lumpTax: 15,
    mpi: 0.28,
    potentialGdp: 1200
  }
];

export default function KeynesianNationalIncomeCalculator() {
  const [currency, setCurrency] = useState<string>('$');
  const [mode, setMode] = useState<CalculationMode>('aggregate_expenditure');

  // Expenditure Direct Inputs
  const [consumption, setConsumption] = useState<number>(19500);
  const [investment, setInvestment] = useState<number>(5100);
  const [government, setGovernment] = useState<number>(4800);
  const [exportsVal, setExportsVal] = useState<number>(3100);
  const [importsVal, setImportsVal] = useState<number>(3900);

  // Keynesian Cross & Structural Inputs
  const [autonomousC, setAutonomousC] = useState<number>(4500);
  const [mpc, setMpc] = useState<number>(0.85);
  const [taxRate, setTaxRate] = useState<number>(0.22);
  const [lumpTax, setLumpTax] = useState<number>(500);
  const [mpi, setMpi] = useState<number>(0.14);

  // Policy & Gap Inputs
  const [potentialGdp, setPotentialGdp] = useState<number>(29000);

  // UI States
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);
  const [hoverIncome, setHoverIncome] = useState<number | null>(null);

  // Apply Preset
  const handleApplyPreset = (preset: PresetScenario) => {
    setMode(preset.mode);
    setConsumption(preset.consumption);
    setInvestment(preset.investment);
    setGovernment(preset.government);
    setExportsVal(preset.exports);
    setImportsVal(preset.imports);
    setAutonomousC(preset.autonomousC);
    setMpc(preset.mpc);
    setTaxRate(preset.taxRate);
    setLumpTax(preset.lumpTax);
    setMpi(preset.mpi);
    setPotentialGdp(preset.potentialGdp);
  };

  // Reset to Defaults
  const handleReset = () => {
    handleApplyPreset(PRESETS[0]);
  };

  // Calculations
  const results = useMemo(() => {
    // Mode 1: Core Aggregate Expenditure (Accounting Identity)
    const netExports = exportsVal - importsVal;
    const gdpAccounting = consumption + investment + government + netExports;
    const absorption = consumption + investment + government; // Domestic Demand

    const cShare = gdpAccounting > 0 ? (consumption / gdpAccounting) * 100 : 0;
    const iShare = gdpAccounting > 0 ? (investment / gdpAccounting) * 100 : 0;
    const gShare = gdpAccounting > 0 ? (government / gdpAccounting) * 100 : 0;
    const xShare = gdpAccounting > 0 ? (exportsVal / gdpAccounting) * 100 : 0;
    const mShare = gdpAccounting > 0 ? (importsVal / gdpAccounting) * 100 : 0;
    const nxShare = gdpAccounting > 0 ? (netExports / gdpAccounting) * 100 : 0;
    const opennessRatio = gdpAccounting > 0 ? ((exportsVal + importsVal) / gdpAccounting) * 100 : 0;

    // Mode 2: Keynesian Cross Equilibrium
    // C = C0 + c * (Y - (T0 + t*Y)) = C0 - c*T0 + c(1-t)*Y
    // NX = X0 - (M0 + m*Y) => Net exports autonomous: NX0 = exportsVal - importsVal
    // AE(Y) = [C0 - c*T0 + I + G + X - M0] + [c(1 - t) - m] * Y
    // Slope of PE line: slope = c * (1 - t) - m
    const mps = 1 - mpc;
    const peSlope = Math.max(0, mpc * (1 - taxRate) - mpi);
    const marginalPropensityToLeak = 1 - peSlope; // (1 - c) + c*t + m

    // Autonomous Expenditure Intercept (A0)
    const autonomousExp = autonomousC - (mpc * lumpTax) + investment + government + exportsVal - (importsVal * 0.2);
    
    // Equilibrium GDP: Y* = A0 / (1 - slope)
    const equilibriumGdp = marginalPropensityToLeak > 0.001 
      ? Math.max(0, autonomousExp / marginalPropensityToLeak)
      : 0;

    // Keynesian Multipliers
    const spendingMultiplier = marginalPropensityToLeak > 0.001 ? 1 / marginalPropensityToLeak : 0;
    const taxMultiplier = marginalPropensityToLeak > 0.001 ? (-mpc) / marginalPropensityToLeak : 0;
    const balancedBudgetMultiplier = spendingMultiplier + taxMultiplier; // (1 - c) / (1 - c(1-t) + m)

    // Induced values at equilibrium
    const totalTaxesAtEq = lumpTax + (taxRate * equilibriumGdp);
    const disposableIncomeAtEq = Math.max(0, equilibriumGdp - totalTaxesAtEq);
    const consumptionAtEq = autonomousC + (mpc * disposableIncomeAtEq);
    const privateSavingsAtEq = disposableIncomeAtEq - consumptionAtEq;
    const importsAtEq = (importsVal * 0.2) + (mpi * equilibriumGdp);
    const netExportsAtEq = exportsVal - importsAtEq;
    const governmentDeficitAtEq = government - totalTaxesAtEq;

    // Mode 3: Fiscal Policy & Output Gap
    const activeCurrentGdp = mode === 'aggregate_expenditure' ? gdpAccounting : equilibriumGdp;
    const outputGap = activeCurrentGdp - potentialGdp;
    const outputGapPct = potentialGdp > 0 ? (outputGap / potentialGdp) * 100 : 0;
    const gapType = Math.abs(outputGap) < 0.1 
      ? 'Full Employment' 
      : outputGap < 0 
        ? 'Recessionary Gap' 
        : 'Inflationary Gap';

    // Required stimulus/contraction to close gap
    const deltaYNeeded = potentialGdp - activeCurrentGdp;
    const deltaGNeeded = spendingMultiplier > 0 ? deltaYNeeded / spendingMultiplier : 0;
    const deltaTNeeded = taxMultiplier !== 0 ? deltaYNeeded / taxMultiplier : 0;
    const deltaG_BB_Needed = balancedBudgetMultiplier > 0 ? deltaYNeeded / balancedBudgetMultiplier : 0;

    // Mode 4: Leakages and Injections
    const totalInjections = investment + government + exportsVal;
    const totalLeakages = privateSavingsAtEq + totalTaxesAtEq + importsAtEq;
    const leakagesInjectionsGap = totalInjections - totalLeakages;

    const privateSurplus = privateSavingsAtEq - investment;
    const fiscalBalance = totalTaxesAtEq - government;
    const foreignLending = netExportsAtEq;

    return {
      netExports,
      gdpAccounting,
      absorption,
      cShare,
      iShare,
      gShare,
      xShare,
      mShare,
      nxShare,
      opennessRatio,
      mps,
      peSlope,
      marginalPropensityToLeak,
      autonomousExp,
      equilibriumGdp,
      spendingMultiplier,
      taxMultiplier,
      balancedBudgetMultiplier,
      totalTaxesAtEq,
      disposableIncomeAtEq,
      consumptionAtEq,
      privateSavingsAtEq,
      importsAtEq,
      netExportsAtEq,
      governmentDeficitAtEq,
      activeCurrentGdp,
      outputGap,
      outputGapPct,
      gapType,
      deltaYNeeded,
      deltaGNeeded,
      deltaTNeeded,
      deltaG_BB_Needed,
      totalInjections,
      totalLeakages,
      leakagesInjectionsGap,
      privateSurplus,
      fiscalBalance,
      foreignLending
    };
  }, [
    consumption, investment, government, exportsVal, importsVal,
    autonomousC, mpc, taxRate, lumpTax, mpi, potentialGdp, mode
  ]);

  // 10-Milestone National Income Schedule (Keynesian Cross Trajectory)
  const scheduleRows = useMemo(() => {
    const centerGdp = results.equilibriumGdp > 0 ? results.equilibriumGdp : results.gdpAccounting;
    const base = Math.max(100, centerGdp);
    const steps = 10;
    const minVal = base * 0.4;
    const maxVal = base * 1.6;
    const stepSize = (maxVal - minVal) / (steps - 1);

    const rows = [];
    for (let i = 0; i < steps; i++) {
      const yVal = minVal + i * stepSize;
      const taxes = lumpTax + taxRate * yVal;
      const yd = Math.max(0, yVal - taxes);
      const cVal = autonomousC + mpc * yd;
      const mVal = (importsVal * 0.2) + mpi * yVal;
      const nxVal = exportsVal - mVal;
      const aeVal = cVal + investment + government + nxVal;
      const unplannedInventory = yVal - aeVal;
      
      let tendency = 'Equilibrium';
      let tendencyColor = 'text-emerald-600 dark:text-emerald-400 font-bold';
      if (unplannedInventory > 1) {
        tendency = 'Contraction (Cut Output)';
        tendencyColor = 'text-rose-600 dark:text-rose-400';
      } else if (unplannedInventory < -1) {
        tendency = 'Expansion (Boost Output)';
        tendencyColor = 'text-blue-600 dark:text-blue-400';
      }

      rows.push({
        yVal,
        taxes,
        yd,
        cVal,
        nxVal,
        aeVal,
        unplannedInventory,
        tendency,
        tendencyColor,
        isClosestToEq: Math.abs(yVal - results.equilibriumGdp) < (stepSize / 2)
      });
    }
    return rows;
  }, [
    results.equilibriumGdp, results.gdpAccounting, lumpTax, taxRate,
    autonomousC, mpc, importsVal, mpi, exportsVal, investment, government
  ]);

  // 5x5 Sensitivity Matrix: MPC vs Government Spending Shock (delta G)
  const sensitivityMatrix = useMemo(() => {
    const mpcValues = [0.60, 0.70, 0.75, 0.80, 0.90];
    const gShockMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2];

    return mpcValues.map(mVal => {
      const row = gShockMultipliers.map(gMult => {
        const testG = government * gMult;
        const testA0 = autonomousC - (mVal * lumpTax) + investment + testG + exportsVal - (importsVal * 0.2);
        const testSlope = Math.max(0, mVal * (1 - taxRate) - mpi);
        const testLeakage = 1 - testSlope;
        const eqY = testLeakage > 0.001 ? testA0 / testLeakage : 0;
        const mult = testLeakage > 0.001 ? 1 / testLeakage : 0;
        return {
          gMult,
          testG,
          eqY,
          mult,
          isBaseline: Math.abs(mVal - mpc) < 0.03 && Math.abs(gMult - 1.0) < 0.01
        };
      });
      return { mpc: mVal, cells: row };
    });
  }, [government, autonomousC, lumpTax, investment, exportsVal, importsVal, taxRate, mpi, mpc]);

  // SVG Geometry for Keynesian Cross (AE vs Y)
  const svgData = useMemo(() => {
    const width = 640;
    const height = 340;
    const padding = { top: 30, right: 40, bottom: 50, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxDomain = Math.max(
      results.equilibriumGdp * 1.5,
      potentialGdp * 1.3,
      results.gdpAccounting * 1.4,
      1000
    );

    const xScale = (val: number) => padding.left + (Math.max(0, Math.min(val, maxDomain)) / maxDomain) * chartW;
    const yScale = (val: number) => padding.top + chartH - (Math.max(0, Math.min(val, maxDomain)) / maxDomain) * chartH;

    // 45 degree line: (0,0) to (maxDomain, maxDomain)
    const line45Start = { x: xScale(0), y: yScale(0) };
    const line45End = { x: xScale(maxDomain), y: yScale(maxDomain) };

    // AE line: AE(0) = A0, AE(maxDomain) = A0 + slope * maxDomain
    const ae0 = Math.max(0, results.autonomousExp);
    const aeMax = Math.max(0, results.autonomousExp + results.peSlope * maxDomain);
    const aeLineStart = { x: xScale(0), y: yScale(ae0) };
    const aeLineEnd = { x: xScale(maxDomain), y: yScale(aeMax) };

    // Points of interest
    const eqPoint = {
      x: xScale(results.equilibriumGdp),
      y: yScale(results.equilibriumGdp)
    };

    const potPoint = {
      x: xScale(potentialGdp),
      y: yScale(potentialGdp)
    };

    // Shaded gap region between eq and pot on X-axis
    const gapLeft = Math.min(eqPoint.x, potPoint.x);
    const gapRight = Math.max(eqPoint.x, potPoint.x);
    const gapWidth = Math.max(0, gapRight - gapLeft);

    // Ticks
    const numTicks = 5;
    const xTicks = Array.from({ length: numTicks + 1 }, (_, i) => (maxDomain / numTicks) * i);
    const yTicks = Array.from({ length: numTicks + 1 }, (_, i) => (maxDomain / numTicks) * i);

    return {
      width,
      height,
      padding,
      chartW,
      chartH,
      maxDomain,
      xScale,
      yScale,
      line45Start,
      line45End,
      aeLineStart,
      aeLineEnd,
      eqPoint,
      potPoint,
      gapLeft,
      gapRight,
      gapWidth,
      xTicks,
      yTicks
    };
  }, [results.equilibriumGdp, potentialGdp, results.gdpAccounting, results.autonomousExp, results.peSlope]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl">
              <PieChart className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Keynesian National Income & Expenditure Suite
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Solve GDP (Y = C + I + G + NX), Keynesian Cross equilibrium, fiscal multipliers, output gap stimulus, and leakages.
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
            title="Reset to default benchmark"
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
            Real-World Macroeconomic & Policy Presets
          </span>
          <span className="text-xs text-zinc-400">Select an economy to prefill data</span>
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
                Load preset <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-zinc-100 dark:bg-zinc-800/60 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setMode('aggregate_expenditure')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'aggregate_expenditure'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Expenditure (Y=C+I+G+NX)</span>
        </button>

        <button
          onClick={() => setMode('keynesian_cross')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'keynesian_cross'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Keynesian Cross & Multiplier</span>
        </button>

        <button
          onClick={() => setMode('fiscal_gap')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'fiscal_gap'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Fiscal Gap & Stimulus</span>
        </button>

        <button
          onClick={() => setMode('leakages_injections')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            mode === 'leakages_injections'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Leakages & Twin Deficits</span>
        </button>
      </div>

      {/* Main Grid: Control Inputs + Primary Result Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Parameter Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                Expenditure & Structural Inputs
              </span>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
              >
                {showAdvanced ? 'Hide Structural' : 'Show Structural'}
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Core Expenditure Components */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Private Consumption ({currency}C)
                  </label>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {results.cShare.toFixed(1)}% of GDP
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-mono">{currency}</span>
                  <input
                    type="number"
                    value={consumption}
                    onChange={(e) => setConsumption(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Gross Private Investment ({currency}I)
                  </label>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {results.iShare.toFixed(1)}% of GDP
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-mono">{currency}</span>
                  <input
                    type="number"
                    value={investment}
                    onChange={(e) => setInvestment(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Government Purchases ({currency}G)
                  </label>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {results.gShare.toFixed(1)}% of GDP
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-mono">{currency}</span>
                  <input
                    type="number"
                    value={government}
                    onChange={(e) => setGovernment(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Exports ({currency}X)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-mono">{currency}</span>
                    <input
                      type="number"
                      value={exportsVal}
                      onChange={(e) => setExportsVal(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Imports ({currency}M)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-mono">{currency}</span>
                    <input
                      type="number"
                      value={importsVal}
                      onChange={(e) => setImportsVal(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Structural / Keynesian Parameters */}
            {showAdvanced && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Keynesian Cross & Policy Parameters
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Autonomous Cons. (C₀)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs text-zinc-400 font-mono">{currency}</span>
                      <input
                        type="number"
                        value={autonomousC}
                        onChange={(e) => setAutonomousC(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full pl-7 pr-2 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        MPC (c)
                      </label>
                      <span className="text-[10px] text-zinc-400 font-mono">MPS: {(1 - mpc).toFixed(2)}</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="0.99"
                      value={mpc}
                      onChange={(e) => setMpc(Math.min(0.99, Math.max(0.01, parseFloat(e.target.value) || 0)))}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Tax Rate (t) %
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

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Potential Full-Employment Output (Yₚ)
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-zinc-400 font-mono">{currency}</span>
                    <input
                      type="number"
                      value={potentialGdp}
                      onChange={(e) => setPotentialGdp(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-7 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Primary Hero KPI + Dynamic Analytics (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Card */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-800/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-indigo-300 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  {mode === 'aggregate_expenditure'
                    ? 'Total Gross Domestic Product (GDP Y)'
                    : mode === 'keynesian_cross'
                    ? 'Equilibrium National Income (Y*)'
                    : mode === 'fiscal_gap'
                    ? 'Macroeconomic Output Gap (Y - Yₚ)'
                    : 'Open Economy Leakages vs Injections'}
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono my-2 tracking-tight text-white flex items-baseline gap-2">
                  <span>{currency}{results.activeCurrentGdp.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                  <span className="text-xs font-normal text-indigo-200">Billion</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  results.netExports >= 0 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {results.netExports >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  Trade {results.netExports >= 0 ? 'Surplus' : 'Deficit'}
                </span>
                <p className="text-[11px] font-mono text-indigo-200 mt-1">
                  NX: {results.netExports >= 0 ? '+' : ''}{currency}{results.netExports.toLocaleString()} B
                </p>
              </div>
            </div>

            {/* Sub-Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-white/10 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-indigo-300 block text-[10px] font-medium uppercase">Spending Multiplier (k)</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.spendingMultiplier.toFixed(2)}x
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-indigo-300 block text-[10px] font-medium uppercase">Domestic Demand</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {currency}{results.absorption.toLocaleString()} B
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-indigo-300 block text-[10px] font-medium uppercase">Trade Openness</span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">
                  {results.opennessRatio.toFixed(1)}%
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-indigo-300 block text-[10px] font-medium uppercase">Output Status</span>
                <span className={`text-xs font-bold font-mono mt-1 block ${
                  results.outputGap < -10 ? 'text-amber-300' : results.outputGap > 10 ? 'text-rose-300' : 'text-emerald-300'
                }`}>
                  {results.gapType}
                </span>
              </div>
            </div>
          </div>

          {/* Component Share Stack Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Aggregate Expenditure Sector Shares
              </span>
              <span className="text-zinc-400 font-mono text-[11px]">Total = 100%</span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-zinc-100 dark:bg-zinc-800">
              <div
                style={{ width: `${Math.max(0, results.cShare)}%` }}
                className="bg-blue-500 h-full transition-all"
                title={`Consumption: ${results.cShare.toFixed(1)}%`}
              />
              <div
                style={{ width: `${Math.max(0, results.iShare)}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Investment: ${results.iShare.toFixed(1)}%`}
              />
              <div
                style={{ width: `${Math.max(0, results.gShare)}%` }}
                className="bg-purple-500 h-full transition-all"
                title={`Government: ${results.gShare.toFixed(1)}%`}
              />
              <div
                style={{ width: `${Math.max(0, results.nxShare > 0 ? results.nxShare : 0)}%` }}
                className="bg-cyan-500 h-full transition-all"
                title={`Net Exports: ${results.nxShare.toFixed(1)}%`}
              />
            </div>

            {/* Legend & Breakdown Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">Consumption (C)</span>
                  <span className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">
                    {results.cShare.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">Investment (I)</span>
                  <span className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">
                    {results.iShare.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">Govt. (G)</span>
                  <span className="text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">
                    {results.gShare.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">Net Exports (NX)</span>
                  <span className={`text-xs font-bold font-mono ${results.nxShare >= 0 ? 'text-zinc-800 dark:text-zinc-200' : 'text-rose-600 dark:text-rose-400'}`}>
                    {results.nxShare.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Continuous SVG Chart: Keynesian Cross Graphic (AE vs 45° Line) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              The Keynesian Cross: Aggregate Expenditure vs. 45° Output Line
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Equilibrium occurs at intersection Y = AE. Gaps illustrate recessionary shortfall or inflationary overheating.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-zinc-400 border-dashed" />
              <span className="text-zinc-500">45° Line (Y = AE)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Planned AE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Potential Yₚ</span>
            </div>
          </div>
        </div>

        {/* SVG Container */}
        <div className="relative w-full overflow-x-auto bg-zinc-50/50 dark:bg-zinc-950/50 rounded-xl p-2 border border-zinc-100 dark:border-zinc-800">
          <svg
            viewBox={`0 0 ${svgData.width} ${svgData.height}`}
            className="w-full h-auto max-h-[380px] font-sans select-none"
            onMouseLeave={() => setHoverIncome(null)}
          >
            <defs>
              <linearGradient id="recessionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="inflationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {svgData.xTicks.map((tick, i) => (
              <g key={`xtick-${i}`}>
                <line
                  x1={svgData.xScale(tick)}
                  y1={svgData.padding.top}
                  x2={svgData.xScale(tick)}
                  y2={svgData.padding.top + svgData.chartH}
                  stroke="currentColor"
                  className="text-zinc-200 dark:text-zinc-800"
                  strokeDasharray="3 3"
                />
                <text
                  x={svgData.xScale(tick)}
                  y={svgData.padding.top + svgData.chartH + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-zinc-400 font-mono"
                >
                  {tick.toFixed(0)}
                </text>
              </g>
            ))}

            {svgData.yTicks.map((tick, i) => (
              <g key={`ytick-${i}`}>
                <line
                  x1={svgData.padding.left}
                  y1={svgData.yScale(tick)}
                  x2={svgData.padding.left + svgData.chartW}
                  y2={svgData.yScale(tick)}
                  stroke="currentColor"
                  className="text-zinc-200 dark:text-zinc-800"
                  strokeDasharray="3 3"
                />
                <text
                  x={svgData.padding.left - 8}
                  y={svgData.yScale(tick) + 3}
                  textAnchor="end"
                  className="text-[10px] fill-zinc-400 font-mono"
                >
                  {tick.toFixed(0)}
                </text>
              </g>
            ))}

            {/* Output Gap Shading between Eq and Potential */}
            {svgData.gapWidth > 2 && (
              <rect
                x={svgData.gapLeft}
                y={svgData.padding.top}
                width={svgData.gapWidth}
                height={svgData.chartH}
                fill={results.outputGap < 0 ? 'url(#recessionGradient)' : 'url(#inflationGradient)'}
              />
            )}

            {/* 45-Degree Equilibrium Line (Y = AE) */}
            <line
              x1={svgData.line45Start.x}
              y1={svgData.line45Start.y}
              x2={svgData.line45End.x}
              y2={svgData.line45End.y}
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <text
              x={svgData.line45End.x - 30}
              y={svgData.line45End.y + 15}
              className="text-[11px] font-bold fill-zinc-400"
            >
              Y = AE (45°)
            </text>

            {/* Aggregate Expenditure (AE) Line */}
            <line
              x1={svgData.aeLineStart.x}
              y1={svgData.aeLineStart.y}
              x2={svgData.aeLineEnd.x}
              y2={svgData.aeLineEnd.y}
              stroke="#4f46e5"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <text
              x={svgData.aeLineEnd.x - 10}
              y={svgData.aeLineEnd.y - 10}
              textAnchor="end"
              className="text-[11px] font-bold fill-indigo-600 dark:fill-indigo-400"
            >
              AE = A₀ + {results.peSlope.toFixed(2)}Y
            </text>

            {/* Autonomous Intercept Marker (A0) */}
            <circle
              cx={svgData.xScale(0)}
              cy={svgData.yScale(results.autonomousExp)}
              r="4"
              className="fill-indigo-600 dark:fill-indigo-400"
            />
            <text
              x={svgData.xScale(0) + 8}
              y={svgData.yScale(results.autonomousExp) - 6}
              className="text-[10px] font-mono font-bold fill-indigo-600 dark:fill-indigo-400"
            >
              A₀ = {currency}{results.autonomousExp.toFixed(0)}
            </text>

            {/* Potential GDP Line (Yp) */}
            <line
              x1={svgData.potPoint.x}
              y1={svgData.padding.top}
              x2={svgData.potPoint.x}
              y2={svgData.padding.top + svgData.chartH}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <text
              x={svgData.potPoint.x}
              y={svgData.padding.top - 8}
              textAnchor="middle"
              className="text-[11px] font-bold fill-emerald-600 dark:fill-emerald-400 font-mono"
            >
              Yₚ ({currency}{potentialGdp.toLocaleString()})
            </text>

            {/* Equilibrium Intersection Point (Y*) */}
            <line
              x1={svgData.eqPoint.x}
              y1={svgData.eqPoint.y}
              x2={svgData.eqPoint.x}
              y2={svgData.padding.top + svgData.chartH}
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <circle
              cx={svgData.eqPoint.x}
              cy={svgData.eqPoint.y}
              r="7"
              className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-zinc-900 stroke-2"
            />
            <circle
              cx={svgData.eqPoint.x}
              cy={svgData.eqPoint.y}
              r="12"
              className="fill-indigo-500/20 animate-ping pointer-events-none"
            />

            <g transform={`translate(${svgData.eqPoint.x + 10}, ${svgData.eqPoint.y - 25})`}>
              <rect
                x="0"
                y="0"
                width="135"
                height="32"
                rx="6"
                className="fill-zinc-900/90 dark:fill-zinc-800/90 shadow-md"
              />
              <text x="8" y="14" className="text-[10px] font-bold fill-white">
                Equilibrium Y* = {currency}{results.equilibriumGdp.toFixed(0)}
              </text>
              <text x="8" y="25" className="text-[9px] font-mono fill-indigo-300">
                AE* = {currency}{results.equilibriumGdp.toFixed(0)} | k = {results.spendingMultiplier.toFixed(2)}x
              </text>
            </g>

            {/* Interactive Cursor Tracking Overlay */}
            {hoverIncome !== null && (
              <g>
                <line
                  x1={svgData.xScale(hoverIncome)}
                  y1={svgData.padding.top}
                  x2={svgData.xScale(hoverIncome)}
                  y2={svgData.padding.top + svgData.chartH}
                  stroke="#3b82f6"
                  strokeWidth="1"
                />
              </g>
            )}

            {/* Invisible interaction layer */}
            <rect
              x={svgData.padding.left}
              y={svgData.padding.top}
              width={svgData.chartW}
              height={svgData.chartH}
              fill="transparent"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
                setHoverIncome(ratio * svgData.maxDomain);
              }}
            />

            {/* Axis Titles */}
            <text
              x={svgData.padding.left + svgData.chartW / 2}
              y={svgData.height - 10}
              textAnchor="middle"
              className="text-xs font-semibold fill-zinc-600 dark:fill-zinc-400"
            >
              National Income / Output (Y) [{currency} Billions]
            </text>
            <text
              transform={`rotate(-90) translate(-${svgData.padding.top + svgData.chartH / 2}, 16)`}
              textAnchor="middle"
              className="text-xs font-semibold fill-zinc-600 dark:fill-zinc-400"
            >
              Aggregate Expenditure (AE) [{currency} Billions]
            </text>
          </svg>
        </div>
      </div>

      {/* Output Gap & Fiscal Policy Intervention Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg">
              <Target className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Macroeconomic Policy Decision: Output Gap & Stimulus Calibrator
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Required fiscal policy injections or tax adjustments to eliminate output disequilibrium.
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            results.outputGap < -0.1 
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' 
              : results.outputGap > 0.1 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' 
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
          }`}>
            {results.gapType} ({results.outputGapPct > 0 ? '+' : ''}{results.outputGapPct.toFixed(1)}%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Output Gap (Y* - Yₚ)
            </span>
            <div className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {results.outputGap >= 0 ? '+' : ''}{currency}{results.outputGap.toLocaleString(undefined, { maximumFractionDigits: 1 })} B
            </div>
            <p className="text-[11px] text-zinc-500">
              {results.outputGap < 0 ? 'Under-utilized capacity & cyclical unemployment' : 'Overheating with inflationary demand pull'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-1">
            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
              Required Spending Change (ΔG)
              <Zap className="w-3.5 h-3.5" />
            </span>
            <div className="text-xl font-bold font-mono text-indigo-900 dark:text-indigo-200">
              {results.deltaGNeeded >= 0 ? '+' : ''}{currency}{results.deltaGNeeded.toLocaleString(undefined, { maximumFractionDigits: 1 })} B
            </div>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
              Via government multiplier k = {results.spendingMultiplier.toFixed(2)}x
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-1">
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300 flex items-center justify-between">
              Required Lump-Sum Tax Cut (ΔT)
              <Scale className="w-3.5 h-3.5" />
            </span>
            <div className="text-xl font-bold font-mono text-purple-900 dark:text-purple-200">
              {results.deltaTNeeded >= 0 ? '+' : ''}{currency}{results.deltaTNeeded.toLocaleString(undefined, { maximumFractionDigits: 1 })} B
            </div>
            <p className="text-[11px] text-purple-600 dark:text-purple-400">
              Via tax multiplier k_T = {results.taxMultiplier.toFixed(2)}x
            </p>
          </div>
        </div>
      </div>

      {/* 10-Milestone National Income Schedule */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              National Income Schedule & Inventory Disequilibrium
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              How unplanned inventory changes (ΔInv = Y - AE) force the macroeconomy back toward equilibrium.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-700">
                <th className="py-2.5 px-3">Output (Y)</th>
                <th className="py-2.5 px-3">Taxes (T)</th>
                <th className="py-2.5 px-3">Disp. Inc (Y_d)</th>
                <th className="py-2.5 px-3">Consumption (C)</th>
                <th className="py-2.5 px-3">Net Exp. (NX)</th>
                <th className="py-2.5 px-3">Planned AE</th>
                <th className="py-2.5 px-3">Unplanned Inv. (Y - AE)</th>
                <th className="py-2.5 px-3">Macro Direction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {scheduleRows.map((r, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                    r.isClosestToEq ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-bold' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-zinc-900 dark:text-zinc-100">
                    {currency}{r.yVal.toFixed(0)}
                    {r.isClosestToEq && (
                      <span className="ml-1.5 text-[10px] bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.5 rounded-full font-sans">
                        Y* Eq
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{currency}{r.taxes.toFixed(0)}</td>
                  <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{currency}{r.yd.toFixed(0)}</td>
                  <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{currency}{r.cVal.toFixed(0)}</td>
                  <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{currency}{r.nxVal.toFixed(0)}</td>
                  <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-bold">{currency}{r.aeVal.toFixed(0)}</td>
                  <td className={`py-2 px-3 ${r.unplannedInventory > 0 ? 'text-rose-600 dark:text-rose-400' : r.unplannedInventory < 0 ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600'}`}>
                    {r.unplannedInventory >= 0 ? '+' : ''}{currency}{r.unplannedInventory.toFixed(0)}
                  </td>
                  <td className={`py-2 px-3 font-sans text-[11px] ${r.tendencyColor}`}>
                    {r.tendency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5x5 Sensitivity Matrix: MPC vs Government Spending Shock */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-500" />
              5×5 Sensitivity Matrix: MPC vs Government Spending Shocks (ΔG)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Equilibrium National Income Y* under varying marginal propensities to consume and fiscal spending adjustments.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <th className="p-2.5 text-left border border-zinc-200 dark:border-zinc-700 font-semibold">
                  MPC (c) \ Spending (G)
                </th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">-20% G ({currency}{(government * 0.8).toFixed(0)})</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">-10% G ({currency}{(government * 0.9).toFixed(0)})</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700 font-bold text-indigo-600 dark:text-indigo-400">Baseline G ({currency}{government.toFixed(0)})</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">+10% G ({currency}{(government * 1.1).toFixed(0)})</th>
                <th className="p-2.5 border border-zinc-200 dark:border-zinc-700">+20% G ({currency}{(government * 1.2).toFixed(0)})</th>
              </tr>
            </thead>
            <tbody>
              {sensitivityMatrix.map((row) => (
                <tr key={row.mpc} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="p-2 text-left font-bold font-mono border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200">
                    c = {row.mpc.toFixed(2)}
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
                      <div className="font-bold">{currency}{cell.eqY.toFixed(0)}</div>
                      <div className="text-[10px] text-zinc-400 font-sans">k = {cell.mult.toFixed(2)}x</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LaTeX Formal Mathematical Proofs & Multiplier Derivations */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Formal Keynesian Mathematical Framework & Multiplier Proofs
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Rigorous economic derivations formatted in LaTeX. Click any equation block to copy for research.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Proof 1: Equilibrium Output Solver */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">1. Keynesian Equilibrium Output Derivation</span>
              <button
                onClick={() => copyToClipboard('Y = \\frac{C_0 - c T_0 + I_0 + G_0 + X_0 - M_0}{1 - c(1 - t) + m}', 'eq_proof')}
                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'eq_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-indigo-900 dark:text-indigo-300 overflow-x-auto">
              {"Y = C_0 + c(Y - T_0 - tY) + I_0 + G_0 + X_0 - (M_0 + mY)"}
              <br />
              {"Y[1 - c(1 - t) + m] = C_0 - cT_0 + I_0 + G_0 + X_0 - M_0"}
              <br />
              {"\\implies Y^* = \\frac{A_0}{1 - c(1 - t) + m}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Where A₀ is total autonomous aggregate expenditure, and the denominator represents the marginal propensity to leak.
            </p>
          </div>

          {/* Proof 2: Fiscal Spending & Tax Multipliers */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">2. Fiscal Spending & Tax Multipliers</span>
              <button
                onClick={() => copyToClipboard('k_G = \\frac{1}{1 - c(1 - t) + m}, \\quad k_T = \\frac{-c}{1 - c(1 - t) + m}', 'mult_proof')}
                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'mult_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-indigo-900 dark:text-indigo-300 overflow-x-auto">
              {"k_G = \\frac{\\partial Y}{\\partial G} = \\frac{1}{1 - c(1 - t) + m}"}
              <br />
              {"k_T = \\frac{\\partial Y}{\\partial T_0} = \\frac{-c}{1 - c(1 - t) + m}"}
              <br />
              {"k_{BB} = k_G + k_T = \\frac{1 - c}{1 - c(1 - t) + m}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              The balanced budget multiplier equals 1.0 when taxes and imports are purely lump-sum without leakages (t=0, m=0).
            </p>
          </div>

          {/* Proof 3: Twin Deficits & National Savings */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">3. Leakages = Injections & Twin Deficits</span>
              <button
                onClick={() => copyToClipboard('S + T + M = I + G + X \\iff (S - I) + (T - G) = NX', 'leak_proof')}
                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'leak_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-indigo-900 dark:text-indigo-300 overflow-x-auto">
              {"\\text{Injections} = I + G + X"}
              <br />
              {"\\text{Leakages} = S + T + M"}
              <br />
              {"\\implies (S - I) + (T - G) = NX"}
            </div>
            <p className="text-[11px] text-zinc-500">
              A fiscal deficit (G &gt; T) must be financed either by domestic private surplus (S &gt; I) or foreign borrowing (NX &lt; 0).
            </p>
          </div>

          {/* Proof 4: Output Gap & Policy Prescription */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">4. Output Gap Elimination Solvers</span>
              <button
                onClick={() => copyToClipboard('\\Delta G^* = \\frac{Y_p - Y^*}{k_G}, \\quad \\Delta T^* = \\frac{Y_p - Y^*}{k_T}', 'gap_proof')}
                className="text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Copy LaTeX"
              >
                {copiedFormula === 'gap_proof' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-400" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg border font-mono text-[11px] text-indigo-900 dark:text-indigo-300 overflow-x-auto">
              {"\\Delta Y = Y_p - Y^*"}
              <br />
              {"\\Delta G_{\\text{req}} = \\frac{\\Delta Y}{k_G} = \\Delta Y \\cdot [1 - c(1 - t) + m]"}
              <br />
              {"\\Delta T_{\\text{req}} = \\frac{-\\Delta Y}{c \\cdot k_G}"}
            </div>
            <p className="text-[11px] text-zinc-500">
              Prescribes exact counter-cyclical discretionary fiscal policy required to return real output to potential capacity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
