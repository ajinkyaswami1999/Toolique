import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2, Info,
  TrendingUp,
  ShieldCheck, Table, Activity,
  Sliders, ChevronDown, ChevronUp,
  Layers, ShoppingBag, DollarSign
} from 'lucide-react';

type CalculationMode = 'midpoint' | 'standard' | 'engel' | 'simulator';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  y1: number;
  y2: number;
  q1: number;
  q2: number;
  price: number;
  expectedYed: string;
  notes: string;
}

export default function IncomeElasticityDemandCalculator() {
  // Mode state
  const [mode, setMode] = useState<CalculationMode>('midpoint');
  const [currency, setCurrency] = useState<string>('$');

  // Input states for Points Mode (Midpoint / Standard)
  const [y1, setY1] = useState<number>(50000);
  const [y2, setY2] = useState<number>(65000);
  const [q1, setQ1] = useState<number>(20);
  const [q2, setQ2] = useState<number>(28);
  const [unitPrice, setUnitPrice] = useState<number>(50);

  // Input states for Engel Curve Mode: Q = a + b * sqrt(Y) or Q = a * Y^b
  const [engelForm, setEngelForm] = useState<'linear' | 'power'>('power');
  const [engelParamA, setEngelParamA] = useState<number>(0.05);
  const [engelParamB, setEngelParamB] = useState<number>(0.6); // exponent
  const [evalIncome, setEvalIncome] = useState<number>(60000);

  // Input states for What-If Simulator Mode
  const [simBaseIncome, setSimBaseIncome] = useState<number>(50000);
  const [simBaseQ, setSimBaseQ] = useState<number>(20);
  const [simKnownYed, setSimKnownYed] = useState<number>(1.4);
  const [simIncomeGrowthPct, setSimIncomeGrowthPct] = useState<number>(10);

  // UI States
  const [copied, setCopied] = useState(false);
  const [showProof, setShowProof] = useState(true);
  const [showSensitivity, setShowSensitivity] = useState(true);

  // Real-world Presets
  const presets: PresetScenario[] = [
    {
      name: '🍜 Instant Noodles & Cheap Staples',
      category: 'Inferior Good (YED < 0)',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      y1: 40000,
      y2: 55000,
      q1: 120,
      q2: 95,
      price: 2,
      expectedYed: '-0.66 (Inferior)',
      notes: 'As wages rise, consumers swap budget convenience carbs for healthier fresh foods and proteins.'
    },
    {
      name: '🍞 Staple Groceries, Milk & Bread',
      category: 'Inelastic Necessity (0 < YED ≤ 1)',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      y1: 50000,
      y2: 65000,
      q1: 52,
      q2: 57,
      price: 4,
      expectedYed: '+0.35 (Necessity)',
      notes: 'Demand expands slightly with household size and quality, but at a far slower rate than income.'
    },
    {
      name: '⚡ Electricity & Household Utilities',
      category: 'Normal Necessity (0 < YED ≤ 1)',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      y1: 50000,
      y2: 70000,
      q1: 600,
      q2: 710,
      price: 0.18,
      expectedYed: '+0.50 (Necessity)',
      notes: 'Higher income leads to more home appliances and climate control, showing steady inelastic expansion.'
    },
    {
      name: '📱 Consumer Electronics & Tech Gadgets',
      category: 'Moderate Luxury (YED > 1)',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      y1: 60000,
      y2: 75000,
      q1: 2,
      q2: 3,
      price: 800,
      expectedYed: '+1.80 (Luxury)',
      notes: 'Discretionary technology upgrades accelerate disproportionately during periods of wage growth.'
    },
    {
      name: '🚗 New Automobiles & EV Upgrades',
      category: 'Cyclical Luxury (YED > 1)',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      y1: 70000,
      y2: 90000,
      q1: 1,
      q2: 2,
      price: 35000,
      expectedYed: '+2.67 (Highly Elastic Luxury)',
      notes: 'Automotive purchases are highly cyclical and strongly boom during economic expansions.'
    },
    {
      name: '🏖️ Fine Dining & International Travel',
      category: 'Superior Luxury (YED >> 1)',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      y1: 80000,
      y2: 105000,
      q1: 4,
      q2: 8,
      price: 2500,
      expectedYed: '+2.47 (Superior Luxury)',
      notes: 'Premium leisure and travel command an increasing share of household wallets as disposable wealth climbs.'
    }
  ];

  const handleApplyPreset = (preset: PresetScenario) => {
    setMode('midpoint');
    setY1(preset.y1);
    setY2(preset.y2);
    setQ1(preset.q1);
    setQ2(preset.q2);
    setUnitPrice(preset.price);
  };

  // Main Calculation Engine
  const calc = useMemo(() => {
    let effectiveY1 = y1;
    let effectiveY2 = y2;
    let effectiveQ1 = q1;
    let effectiveQ2 = q2;
    let rawYed = 0;
    let pctQ = 0;
    let pctY = 0;
    let avgQ = 0;
    let avgY = 0;
    let deltaQ = 0;
    let deltaY = 0;

    if (mode === 'midpoint') {
      deltaQ = q2 - q1;
      deltaY = y2 - y1;
      avgQ = (q1 + q2) / 2;
      avgY = (y1 + y2) / 2;
      pctQ = avgQ !== 0 ? (deltaQ / avgQ) * 100 : 0;
      pctY = avgY !== 0 ? (deltaY / avgY) * 100 : 0;
      rawYed = pctY !== 0 ? pctQ / pctY : 0;
    } else if (mode === 'standard') {
      deltaQ = q2 - q1;
      deltaY = y2 - y1;
      pctQ = q1 !== 0 ? (deltaQ / q1) * 100 : 0;
      pctY = y1 !== 0 ? (deltaY / y1) * 100 : 0;
      rawYed = pctY !== 0 ? pctQ / pctY : 0;
    } else if (mode === 'engel') {
      // Engel Curve: evaluate at evalIncome and evalIncome + 1%
      effectiveY1 = evalIncome;
      const nextY = evalIncome * 1.01;
      effectiveY2 = nextY;
      deltaY = nextY - evalIncome;
      pctY = 1.0; // 1% change

      if (engelForm === 'power') {
        // Q = a * Y^b => Point YED = b
        effectiveQ1 = Math.max(0.001, engelParamA * Math.pow(evalIncome, engelParamB));
        effectiveQ2 = Math.max(0.001, engelParamA * Math.pow(nextY, engelParamB));
        deltaQ = effectiveQ2 - effectiveQ1;
        pctQ = effectiveQ1 !== 0 ? (deltaQ / effectiveQ1) * 100 : 0;
        rawYed = engelParamB;
      } else {
        // Linear: Q = a + b * Y => Point YED = b * (Y / Q)
        effectiveQ1 = Math.max(0.001, engelParamA + engelParamB * evalIncome);
        effectiveQ2 = Math.max(0.001, engelParamA + engelParamB * nextY);
        deltaQ = effectiveQ2 - effectiveQ1;
        pctQ = effectiveQ1 !== 0 ? (deltaQ / effectiveQ1) * 100 : 0;
        rawYed = effectiveQ1 > 0 ? engelParamB * (evalIncome / effectiveQ1) : 0;
      }
    } else if (mode === 'simulator') {
      effectiveY1 = simBaseIncome;
      effectiveQ1 = simBaseQ;
      pctY = simIncomeGrowthPct;
      pctQ = simKnownYed * pctY;
      effectiveY2 = effectiveY1 * (1 + pctY / 100);
      effectiveQ2 = Math.max(0, effectiveQ1 * (1 + pctQ / 100));
      deltaY = effectiveY2 - effectiveY1;
      deltaQ = effectiveQ2 - effectiveQ1;
      rawYed = simKnownYed;
    }

    const yed = isNaN(rawYed) || !isFinite(rawYed) ? 0 : rawYed;

    // Classification & Typology
    let category = '';
    let categoryDesc = '';
    let goodType: 'inferior' | 'zero' | 'necessity' | 'luxury' = 'necessity';
    let badgeClass = '';
    let engelsLawText = '';
    let macroSensitivity = '';

    if (yed < 0) {
      goodType = 'inferior';
      category = 'Inferior Good (YED < 0)';
      categoryDesc = 'Demand drops as consumer income rises because households substitute toward premium alternatives.';
      badgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      engelsLawText = 'Inverse Engel relationship: The budget share of this good shrinks aggressively as prosperity increases.';
      macroSensitivity = 'Counter-Cyclical: Sales typically surge during economic recessions and decline during economic booms.';
    } else if (yed === 0) {
      goodType = 'zero';
      category = 'Income Inelastic / Independent Good (YED = 0)';
      categoryDesc = 'Quantity demanded is entirely unresponsive to changes in household income (e.g., table salt, emergency basic items).';
      badgeClass = 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
      engelsLawText = 'Constant consumption regardless of wallet expansion; budget share drops inversely proportional to income.';
      macroSensitivity = 'Immune to business cycles; zero volume correlation with macroeconomic growth or slowdowns.';
    } else if (yed <= 1) {
      goodType = 'necessity';
      category = 'Normal Necessity (0 < YED ≤ 1)';
      categoryDesc = 'Demand increases with income, but at a slower percentage rate than the income expansion itself.';
      badgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      engelsLawText = "Engel's Law Confirmed: As household income rises, the proportion of income spent on this necessity decreases.";
      macroSensitivity = 'Resilient / Defensive: Volume holds steady during recessions with modest stable growth during expansions.';
    } else {
      goodType = 'luxury';
      category = 'Superior / Luxury Good (YED > 1)';
      categoryDesc = 'Demand grows at a significantly higher percentage rate than income expansion, commanding a growing budget share.';
      badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      engelsLawText = 'Expanding Budget Share: Consumes an increasing percentage of household disposable income as wealth expands.';
      macroSensitivity = 'Highly Pro-Cyclical: Extreme sensitivity to macroeconomic booms; severe volume contraction during downturns.';
    }

    // Budget Share Calculations
    const exp1 = effectiveQ1 * unitPrice;
    const exp2 = effectiveQ2 * unitPrice;
    const share1 = effectiveY1 > 0 ? (exp1 / effectiveY1) * 100 : 0;
    const share2 = effectiveY2 > 0 ? (exp2 / effectiveY2) * 100 : 0;
    const shareDelta = share2 - share1;

    // Spectrum meter position: mapping YED (-1.5 to +3.0) to (0% to 100%)
    const clampedYed = Math.max(-1.5, Math.min(3.0, yed));
    const spectrumPercent = ((clampedYed + 1.5) / 4.5) * 100;

    return {
      y1: effectiveY1,
      y2: effectiveY2,
      q1: effectiveQ1,
      q2: effectiveQ2,
      deltaY,
      deltaQ,
      pctY,
      pctQ,
      avgY,
      avgQ,
      yed,
      goodType,
      category,
      categoryDesc,
      badgeClass,
      engelsLawText,
      macroSensitivity,
      exp1,
      exp2,
      share1,
      share2,
      shareDelta,
      spectrumPercent
    };
  }, [mode, y1, y2, q1, q2, unitPrice, engelForm, engelParamA, engelParamB, evalIncome, simBaseIncome, simBaseQ, simKnownYed, simIncomeGrowthPct]);

  // Sensitivity Matrix Generator (What happens if household income shifts -30% to +30%)
  const sensitivityTable = useMemo(() => {
    const shifts = [-30, -20, -15, -10, -5, 0, 5, 10, 15, 20, 30];
    const baseY = calc.y1;
    const baseQ = calc.q1;
    const elasticity = calc.yed;

    return shifts.map((pctShift) => {
      const simY = baseY * (1 + pctShift / 100);
      const simPctQ = elasticity * pctShift;
      const simQ = Math.max(0, baseQ * (1 + simPctQ / 100));
      const simExp = simQ * unitPrice;
      const simShare = simY > 0 ? (simExp / simY) * 100 : 0;
      const deltaQ = simQ - baseQ;

      return {
        pctShift,
        income: simY,
        quantity: simQ,
        deltaQ,
        pctQ: simPctQ,
        expenditure: simExp,
        budgetShare: simShare,
        isBase: pctShift === 0
      };
    });
  }, [calc.y1, calc.q1, calc.yed, unitPrice]);

  // Copy Full Proof Handler
  const handleCopyProof = () => {
    const text = `=========================================
Income Elasticity of Demand (YED) Analysis
=========================================
Calculation Method: ${mode.toUpperCase()}
Initial Income (Y1): {currency}{calc.y1.toLocaleString(undefined, { minimumFractionDigits: 2 })} | New Income (Y2): {currency}{calc.y2.toLocaleString(undefined, { minimumFractionDigits: 2 })} (ΔY = ${calc.deltaY >= 0 ? '+' : ''}{currency}{calc.deltaY.toLocaleString(undefined, { minimumFractionDigits: 2 })}, ${calc.pctY.toFixed(2)}%)
Initial Demand (Q1): ${calc.q1.toFixed(1)} units | New Demand (Q2): ${calc.q2.toFixed(1)} units (ΔQ = ${calc.deltaQ >= 0 ? '+' : ''}${calc.deltaQ.toFixed(1)}, ${calc.pctQ.toFixed(2)}%)

RESULTS:
• YED Coefficient: ${calc.yed.toFixed(3)}
• Classification: ${calc.category}
• Economic Nature: ${calc.categoryDesc}

ENGEL'S LAW & BUDGET SHARE:
• Initial Budget Share: ${calc.share1.toFixed(3)}% of income
• New Budget Share: ${calc.share2.toFixed(3)}% of income (Δ = ${calc.shareDelta >= 0 ? '+' : ''}${calc.shareDelta.toFixed(3)}%)
• Engel Insight: ${calc.engelsLawText}

MACROECONOMIC BUSINESS CYCLE BEHAVIOR:
• ${calc.macroSensitivity}

Generated via Toolique Economics Suite (https://www.toolique.in/economics/income-elasticity-demand-calculator)
=========================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setY1(50000);
    setY2(65000);
    setQ1(20);
    setQ2(28);
    setUnitPrice(50);
    setEngelForm('power');
    setEngelParamA(0.05);
    setEngelParamB(0.6);
    setEvalIncome(60000);
    setSimBaseIncome(50000);
    setSimBaseQ(20);
    setSimKnownYed(1.4);
    setSimIncomeGrowthPct(10);
    setMode('midpoint');
  };

  // SVG Engel Curve Coordinates
  const svgWidth = 440;
  const svgHeight = 280;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;

  const graphWidth = svgWidth - padLeft - padRight;
  const graphHeight = svgHeight - padTop - padBottom;

  const maxPlotY = Math.max(calc.y1, calc.y2) * 1.35 || 100000;
  const maxPlotQ = Math.max(calc.q1, calc.q2) * 1.35 || 50;

  const getSvgX = (yVal: number) => padLeft + (Math.max(0, yVal) / maxPlotY) * graphWidth;
  const getSvgY = (qVal: number) => padTop + graphHeight - (Math.max(0, qVal) / maxPlotQ) * graphHeight;

  const pt1X = getSvgX(calc.y1);
  const pt1Y = getSvgY(calc.q1);
  const pt2X = getSvgX(calc.y2);
  const pt2Y = getSvgY(calc.q2);

  // Generate continuous Engel curve path points
  const curvePoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const steps = 30;
    const baseY = calc.y1;
    const baseQ = calc.q1;
    const yedVal = calc.yed;

    for (let i = 0; i <= steps; i++) {
      const curY = (maxPlotY * i) / steps;
      if (curY <= 0) {
        pts.push({ x: getSvgX(0), y: getSvgY(0) });
        continue;
      }
      let curQ = 0;
      if (mode === 'engel') {
        if (engelForm === 'power') {
          curQ = Math.max(0, engelParamA * Math.pow(curY, engelParamB));
        } else {
          curQ = Math.max(0, engelParamA + engelParamB * curY);
        }
      } else {
        // Approximate Engel curve using elasticity formula: Q(Y) = Q0 * (Y / Y0)^YED
        if (baseY > 0 && baseQ > 0) {
          if (yedVal >= 0) {
            curQ = baseQ * Math.pow(curY / baseY, Math.min(3, Math.max(0, yedVal)));
          } else {
            // Inferior good: declining with income
            curQ = Math.max(0, baseQ * (1 + yedVal * ((curY - baseY) / baseY)));
          }
        }
      }
      pts.push({ x: getSvgX(curY), y: getSvgY(curQ) });
    }
    return pts;
  }, [maxPlotY, calc.y1, calc.q1, calc.yed, mode, engelForm, engelParamA, engelParamB]);

  const curvePathData = useMemo(() => {
    if (curvePoints.length === 0) return '';
    return curvePoints.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }, '');
  }, [curvePoints]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* 1. Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Real-World Empirical Presets
              </span>
              <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                Click any scenario to prefill realistic market values
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
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Proof Copied' : 'Copy Proof'}</span>
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750 transition cursor-pointer shadow-2xs"
              title="Reset all inputs to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Preset Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(p)}
              className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-800 text-left transition group cursor-pointer"
            >
              <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                {p.name}
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate font-mono">
                {p.expectedYed}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Calculation Mode Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setMode('midpoint')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'midpoint'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Midpoint / Arc (Recommended)</span>
        </button>

        <button
          onClick={() => setMode('standard')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'standard'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Standard % Change</span>
        </button>

        <button
          onClick={() => setMode('engel')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'engel'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Engel Curve Function</span>
        </button>

        <button
          onClick={() => setMode('simulator')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'simulator'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>What-If Income Simulator</span>
        </button>
      </div>

      {/* 3. Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Input Parameters</span>
            </h2>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg">
              {mode.toUpperCase()} MODE
            </span>
          </div>

          {/* Conditional Input Fields Based on Selected Mode */}
          {(mode === 'midpoint' || mode === 'standard') && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  Household Income ({currency}/Year)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Initial Income (Y₁)</label>
                    <input
                      type="number"
                      min="1"
                      value={y1}
                      onChange={(e) => setY1(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">New Income (Y₂)</label>
                    <input
                      type="number"
                      min="1"
                      value={y2}
                      onChange={(e) => setY2(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
                  Quantity Demanded (Units/Period)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Initial Demand (Q₁)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={q1}
                      onChange={(e) => setQ1(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">New Demand (Q₂)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={q2}
                      onChange={(e) => setQ2(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Unit Price ({currency}/unit - For Budget Share calculation)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(0.01, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {mode === 'engel' && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-3">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">Engel Curve Equation Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEngelForm('power')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      engelForm === 'power'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    Q = a · Yᵇ (Power)
                  </button>
                  <button
                    onClick={() => setEngelForm('linear')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      engelForm === 'linear'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    Q = a + b · Y (Linear)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Coefficient (a)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={engelParamA}
                    onChange={(e) => setEngelParamA(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    {engelForm === 'power' ? 'Income Exponent (b)' : 'Income Slope (b)'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={engelParamB}
                    onChange={(e) => setEngelParamB(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Evaluation Household Income ({currency}Y)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={evalIncome}
                  onChange={(e) => setEvalIncome(Math.max(100, parseFloat(e.target.value) || 1000))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Unit Price ({currency}/unit)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(0.01, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {mode === 'simulator' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Baseline Income ({currency}Y₁)</label>
                  <input
                    type="number"
                    min="1000"
                    value={simBaseIncome}
                    onChange={(e) => setSimBaseIncome(Math.max(100, parseFloat(e.target.value) || 1000))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Baseline Demand (Q₁)</label>
                  <input
                    type="number"
                    min="0"
                    value={simBaseQ}
                    onChange={(e) => setSimBaseQ(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Known / Estimated YED</label>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{simKnownYed.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-1.5"
                  max="3.0"
                  step="0.05"
                  value={simKnownYed}
                  onChange={(e) => setSimKnownYed(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5 font-mono">
                  <span>-1.5 (Inferior)</span>
                  <span>0.0 (Zero)</span>
                  <span>+1.0 (Necessity)</span>
                  <span>+3.0 (Luxury)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Projected Income Shift (%ΔY)</label>
                  <span className={`text-xs font-mono font-bold ${simIncomeGrowthPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {simIncomeGrowthPct >= 0 ? '+' : ''}{simIncomeGrowthPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={simIncomeGrowthPct}
                  onChange={(e) => setSimIncomeGrowthPct(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Unit Price ({currency}/unit)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(0.01, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Quick Summary Card */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 text-xs">
            <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
              <span>Income Movement:</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">{currency}{calc.y1.toLocaleString(undefined, { maximumFractionDigits: 0 })} → {currency}{calc.y2.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({calc.pctY >= 0 ? '+' : ''}{calc.pctY.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
              <span>Demand Movement:</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                {calc.q1.toFixed(1)} → {calc.q2.toFixed(1)} units ({calc.pctQ >= 0 ? '+' : ''}{calc.pctQ.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-700 pt-2">
              <span>Budget Share:</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                {calc.share1.toFixed(2)}% → {calc.share2.toFixed(2)}% ({calc.shareDelta >= 0 ? '+' : ''}{calc.shareDelta.toFixed(2)}% pts)
              </span>
            </div>
          </div>
        </div>

        {/* Right Results & Visualizations Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Result Box */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-zinc-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs uppercase font-black tracking-widest text-emerald-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Income Elasticity Coefficient (YED)
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md ${calc.badgeClass}`}>
                  {calc.category}
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                  {calc.yed >= 0 ? `+${calc.yed.toFixed(3)}` : calc.yed.toFixed(3)}
                </div>
                <div className="text-xs text-emerald-200 font-mono">
                  {calc.goodType === 'inferior' && 'Negative Elasticity (Inferior)'}
                  {calc.goodType === 'zero' && 'Completely Inelastic (Zero)'}
                  {calc.goodType === 'necessity' && 'Inelastic (Normal Necessity)'}
                  {calc.goodType === 'luxury' && 'Elastic (Superior Luxury)'}
                </div>
              </div>

              {/* Elasticity Spectrum Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-emerald-200">
                  <span>Inferior (&lt;0)</span>
                  <span>Zero (0)</span>
                  <span>Necessity (0 to 1)</span>
                  <span>Luxury (&gt;1)</span>
                </div>
                <div className="relative h-3 rounded-full bg-white/10 overflow-hidden border border-white/10 p-0.5">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-sky-400 to-emerald-400 opacity-70" />
                  {/* Marker Pin */}
                  <div
                    className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-md border border-zinc-900 transition-all duration-300"
                    style={{ left: `calc(${Math.min(97, Math.max(2, calc.spectrumPercent))}% - 5px)` }}
                  />
                </div>
              </div>

              {/* Economic Diagnosis Text */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1.5">
                <div className="text-xs font-semibold text-emerald-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Consumer Behavior Insight</span>
                </div>
                <p className="text-xs text-emerald-50 leading-relaxed">
                  {calc.categoryDesc}
                </p>
                <div className="text-[11px] text-emerald-200/90 pt-1 border-t border-white/10">
                  <strong>Macro Cycle:</strong> {calc.macroSensitivity}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">Income Shift (%ΔY)</div>
              <div className={`text-lg font-black font-mono mt-1 ${calc.pctY >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {calc.pctY >= 0 ? '+' : ''}{calc.pctY.toFixed(2)}%
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">Demand Shift (%ΔQ)</div>
              <div className={`text-lg font-black font-mono mt-1 ${calc.pctQ >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {calc.pctQ >= 0 ? '+' : ''}{calc.pctQ.toFixed(2)}%
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">Old Budget Share</div>
              <div className="text-lg font-black font-mono text-zinc-900 dark:text-white mt-1">
                {calc.share1.toFixed(2)}%
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">New Budget Share</div>
              <div className={`text-lg font-black font-mono mt-1 ${calc.shareDelta >= 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                {calc.share2.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Interactive SVG Engel Curve Graph */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Interactive Engel Curve (Income vs Demand)
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Slope: {calc.yed < 0 ? 'Negative (Inferior)' : calc.yed > 1 ? 'Convex (Luxury)' : 'Concave (Necessity)'}
              </span>
            </div>

            <div className="w-full flex justify-center bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl p-2 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[480px] h-auto select-none font-mono">
                <defs>
                  <linearGradient id="engelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1={padLeft} y1={padTop} x2={padLeft + graphWidth} y2={padTop} stroke="#71717a" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1={padLeft} y1={padTop + graphHeight / 2} x2={padLeft + graphWidth} y2={padTop + graphHeight / 2} stroke="#71717a" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1={padLeft + graphWidth / 2} y1={padTop} x2={padLeft + graphWidth / 2} y2={padTop + graphHeight} stroke="#71717a" strokeOpacity="0.2" strokeDasharray="3 3" />

                {/* X & Y Axes */}
                <line x1={padLeft} y1={padTop + graphHeight} x2={padLeft + graphWidth} y2={padTop + graphHeight} stroke="#71717a" strokeWidth="1.5" />
                <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + graphHeight} stroke="#71717a" strokeWidth="1.5" />

                {/* Axis Labels */}
                <text x={padLeft + graphWidth / 2} y={svgHeight - 10} textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="bold">
                  Household Income ({currency}Y) →
                </text>
                <text transform={`rotate(-90 15 ${padTop + graphHeight / 2})`} x={15} y={padTop + graphHeight / 2} textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="bold">
                  Quantity Demanded (Q) →
                </text>

                {/* Continuous Engel Curve Path */}
                {curvePathData && (
                  <path d={curvePathData} fill="none" stroke="url(#engelGrad)" strokeWidth="3" strokeLinecap="round" />
                )}

                {/* Point 1 Projections & Marker */}
                <line x1={padLeft} y1={pt1Y} x2={pt1X} y2={pt1Y} stroke="#10b981" strokeDasharray="3 3" strokeOpacity="0.6" />
                <line x1={pt1X} y1={padTop + graphHeight} x2={pt1X} y2={pt1Y} stroke="#10b981" strokeDasharray="3 3" strokeOpacity="0.6" />
                <circle cx={pt1X} cy={pt1Y} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x={pt1X + 8} y={pt1Y - 6} fill="#10b981" fontSize="10" fontWeight="bold">
                  (Y₁, Q₁)
                </text>

                {/* Point 2 Projections & Marker */}
                <line x1={padLeft} y1={pt2Y} x2={pt2X} y2={pt2Y} stroke="#06b6d4" strokeDasharray="3 3" strokeOpacity="0.6" />
                <line x1={pt2X} y1={padTop + graphHeight} x2={pt2X} y2={pt2Y} stroke="#06b6d4" strokeDasharray="3 3" strokeOpacity="0.6" />
                <circle cx={pt2X} cy={pt2Y} r="5" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
                <text x={pt2X + 8} y={pt2Y - 6} fill="#06b6d4" fontSize="10" fontWeight="bold">
                  (Y₂, Q₂)
                </text>
              </svg>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
              The Engel Curve plots how consumer demand expands or contracts as family income shifts from {currency}{calc.y1.toLocaleString()} to {currency}{calc.y2.toLocaleString()}.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Step-by-Step Mathematical Derivation & Proof (Collapsible) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <button
          onClick={() => setShowProof(!showProof)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-emerald-600 transition">
              Step-by-Step Mathematical Proof & Engel Formulation
            </span>
          </div>
          {showProof ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showProof && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 font-mono text-xs">
            {/* Step 1 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 1: Identify Input Coordinates</span>
              <div className="text-zinc-900 dark:text-zinc-200">
                Initial State: Income (Y₁) = ${currency}{calc.y1.toLocaleString(undefined, { minimumFractionDigits: 2 })}, Quantity (Q₁) = {calc.q1.toFixed(1)} units
              </div>
              <div className="text-zinc-900 dark:text-zinc-200">
                New State: Income (Y₂) = ${currency}{calc.y2.toLocaleString(undefined, { minimumFractionDigits: 2 })}, Quantity (Q₂) = {calc.q2.toFixed(1)} units
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 2: Compute Absolute & Percentage Shifts</span>
              <div className="text-zinc-900 dark:text-zinc-200">
                ΔY = Y₂ - Y₁ = {currency}{calc.y2.toLocaleString()} - {currency}{calc.y1.toLocaleString()} = {calc.deltaY >= 0 ? '+' : ''}${calc.deltaY.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-zinc-900 dark:text-zinc-200">
                ΔQ = Q₂ - Q₁ = {calc.q2.toFixed(1)} - {calc.q1.toFixed(1)} = {calc.deltaQ >= 0 ? '+' : ''}{calc.deltaQ.toFixed(1)} units
              </div>
              {mode === 'midpoint' ? (
                <div className="text-emerald-700 dark:text-emerald-300 font-semibold pt-1">
                  Midpoints: Y_avg = ${(calc.avgY).toLocaleString()}, Q_avg = {calc.avgQ.toFixed(2)} → %ΔY = {calc.pctY.toFixed(2)}%, %ΔQ = {calc.pctQ.toFixed(2)}%
                </div>
              ) : (
                <div className="text-emerald-700 dark:text-emerald-300 font-semibold pt-1">
                  Base Changes: %ΔY = ({calc.deltaY.toFixed(2)} / {calc.y1}) × 100 = {calc.pctY.toFixed(2)}%, %ΔQ = ({calc.deltaQ.toFixed(2)} / {calc.q1}) × 100 = {calc.pctQ.toFixed(2)}%
                </div>
              )}
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 3: Income Elasticity Formula Evaluation</span>
              <div className="text-zinc-900 dark:text-zinc-200 font-bold">
                YED = %ΔQ / %ΔY = ({calc.pctQ.toFixed(4)}%) / ({calc.pctY.toFixed(4)}%) = <span className="text-emerald-600 dark:text-emerald-400">{calc.yed.toFixed(4)}</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 4: Economic Classification</span>
              <div className="text-zinc-900 dark:text-zinc-200 font-semibold">
                Result: <span className="text-emerald-600 dark:text-emerald-400">{calc.category}</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 font-sans text-xs">
                {calc.engelsLawText}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. Macroeconomic Shock & Sensitivity Matrix (Collapsible) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <button
          onClick={() => setShowSensitivity(!showSensitivity)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-emerald-600 transition">
              Household Income Sensitivity Matrix (±30% Macroeconomic Scenarios)
            </span>
          </div>
          {showSensitivity ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showSensitivity && (
          <div className="overflow-x-auto pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-mono">
                  <th className="py-2.5 px-3">Income Shock (%ΔY)</th>
                  <th className="py-2.5 px-3">Simulated Income ({currency})</th>
                  <th className="py-2.5 px-3">Projected Demand (Q)</th>
                  <th className="py-2.5 px-3">Demand Shift (%ΔQ)</th>
                  <th className="py-2.5 px-3">Household Spend ({currency})</th>
                  <th className="py-2.5 px-3">Budget Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                {sensitivityTable.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${
                      row.isBase ? 'bg-emerald-50/70 dark:bg-emerald-950/30 font-bold' : ''
                    }`}
                  >
                    <td className={`py-2 px-3 ${row.pctShift > 0 ? 'text-emerald-600' : row.pctShift < 0 ? 'text-rose-600' : 'text-zinc-600'}`}>
                      {row.pctShift > 0 ? `+${row.pctShift}%` : `${row.pctShift}%`} {row.isBase && '(Baseline)'}
                    </td>
                    <td className="py-2 px-3 text-zinc-800 dark:text-zinc-200">{currency}{Math.round(row.income).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-zinc-900 dark:text-white font-bold">
                      {row.quantity.toFixed(1)} units
                    </td>
                    <td className={`py-2 px-3 ${row.pctQ > 0 ? 'text-emerald-600' : row.pctQ < 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
                      {row.pctQ > 0 ? `+${row.pctQ.toFixed(1)}%` : `${row.pctQ.toFixed(1)}%`}
                    </td>
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{currency}{row.expenditure.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">
                      {row.budgetShare.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}