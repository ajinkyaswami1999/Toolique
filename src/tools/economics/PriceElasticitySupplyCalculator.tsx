import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2, Info,
  TrendingUp, Activity,
  ShieldCheck, Table,
  Sliders, ChevronDown, ChevronUp,
  Layers, DollarSign, Factory,
  Clock, Warehouse, ShieldAlert
} from 'lucide-react';

type CalculationMode = 'midpoint' | 'standard' | 'linear' | 'simulator';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  p1: number;
  p2: number;
  qs1: number;
  qs2: number;
  expectedPes: string;
  timeHorizon: string;
  notes: string;
}

export default function PriceElasticitySupplyCalculator() {
  // Mode state
  const [mode, setMode] = useState<CalculationMode>('midpoint');
  const [currency, setCurrency] = useState<string>('$');

  // Input states for Points Mode (Midpoint / Standard)
  const [p1, setP1] = useState<number>(40);
  const [p2, setP2] = useState<number>(50);
  const [qs1, setQs1] = useState<number>(300);
  const [qs2, setQs2] = useState<number>(420);

  // Input states for Linear Supply Equation: Q_s = c + d * P
  const [supplyInterceptC, setSupplyInterceptC] = useState<number>(-50); // negative means intercepts P-axis (elastic)
  const [supplySlopeD, setSupplySlopeD] = useState<number>(8.0);
  const [evalPrice, setEvalPrice] = useState<number>(40);

  // Input states for Time Horizon / What-If Simulator Mode
  const [simBaseP, setSimBaseP] = useState<number>(40);
  const [simBaseQs, setSimBaseQs] = useState<number>(300);
  const [simKnownPes, setSimKnownPes] = useState<number>(1.5);
  const [simPriceChangePct, setSimPriceChangePct] = useState<number>(20);

  // UI States
  const [copied, setCopied] = useState(false);
  const [showProof, setShowProof] = useState(true);
  const [showSensitivity, setShowSensitivity] = useState(true);

  // Real-world Presets
  const presets: PresetScenario[] = [
    {
      name: '🌾 Agricultural Grain & Fresh Produce',
      category: 'Inelastic Supply (PES < 1)',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      p1: 20,
      p2: 30,
      qs1: 1000,
      qs2: 1080,
      expectedPes: '+0.19 (Highly Inelastic)',
      timeHorizon: 'Momentary / Single Season',
      notes: 'Harvest sizes are fixed by seasonal planting; farmers cannot quickly manufacture more crops.'
    },
    {
      name: '🏗️ Housing & Urban Real Estate',
      category: 'Inelastic Supply (PES < 1)',
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      p1: 300000,
      p2: 390000,
      qs1: 500,
      qs2: 550,
      expectedPes: '+0.36 (Inelastic)',
      timeHorizon: 'Short-Run (1-2 Years)',
      notes: 'Zoning approvals, architectural permits, and construction lag limit rapid housing expansion.'
    },
    {
      name: '⛽ Crude Oil Extraction & Drilling',
      category: 'Capital-Constrained Supply (PES < 1)',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      p1: 70,
      p2: 95,
      qs1: 10000,
      qs2: 11200,
      expectedPes: '+0.38 (Inelastic)',
      timeHorizon: 'Short-Run',
      notes: 'Drilling new deepwater rigs and building pipeline infrastructure requires multi-year lead times.'
    },
    {
      name: '🚗 Automobile Assembly Lines',
      category: 'Elastic Supply (PES > 1)',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      p1: 25000,
      p2: 30000,
      qs1: 2000,
      qs2: 2500,
      expectedPes: '+1.22 (Elastic)',
      timeHorizon: 'Medium to Long-Run',
      notes: 'Manufacturers can add extra shifts, retool existing production lines, and activate spare factory capacity.'
    },
    {
      name: '👕 Fast Fashion & Apparel Textiles',
      category: 'Highly Elastic Supply (PES >> 1)',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      p1: 30,
      p2: 36,
      qs1: 5000,
      qs2: 7200,
      expectedPes: '+1.96 (Highly Elastic)',
      timeHorizon: 'Short to Medium-Run',
      notes: 'Textile factories maintain raw material buffers and can rapidly scale sewing lines on demand.'
    },
    {
      name: '💻 Cloud Software & Digital Subscriptions',
      category: 'Near Perfectly Elastic Supply (PES → ∞)',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      p1: 20,
      p2: 22,
      qs1: 10000,
      qs2: 18000,
      expectedPes: '+6.00 (Nearly Infinite)',
      timeHorizon: 'Instantaneous',
      notes: 'Zero marginal cost of digital replication allows instant scaling to millions of users worldwide.'
    }
  ];

  const handleApplyPreset = (preset: PresetScenario) => {
    setMode('midpoint');
    setP1(preset.p1);
    setP2(preset.p2);
    setQs1(preset.qs1);
    setQs2(preset.qs2);
  };

  // Main Elasticity Calculation Engine
  const calc = useMemo(() => {
    let effectiveP1 = p1;
    let effectiveP2 = p2;
    let effectiveQs1 = qs1;
    let effectiveQs2 = qs2;
    let rawPes = 0;
    let pctQs = 0;
    let pctP = 0;
    let avgQs = 0;
    let avgP = 0;
    let deltaQs = 0;
    let deltaP = 0;

    if (mode === 'midpoint') {
      deltaQs = qs2 - qs1;
      deltaP = p2 - p1;
      avgQs = (qs1 + qs2) / 2;
      avgP = (p1 + p2) / 2;
      pctQs = avgQs !== 0 ? (deltaQs / avgQs) * 100 : 0;
      pctP = avgP !== 0 ? (deltaP / avgP) * 100 : 0;
      rawPes = pctP !== 0 ? pctQs / pctP : 0;
    } else if (mode === 'standard') {
      deltaQs = qs2 - qs1;
      deltaP = p2 - p1;
      pctQs = qs1 !== 0 ? (deltaQs / qs1) * 100 : 0;
      pctP = p1 !== 0 ? (deltaP / p1) * 100 : 0;
      rawPes = pctP !== 0 ? pctQs / pctP : 0;
    } else if (mode === 'linear') {
      // Q_s = c + d * P
      effectiveP1 = evalPrice;
      effectiveQs1 = Math.max(0.001, supplyInterceptC + supplySlopeD * evalPrice);
      const nextP = evalPrice * 1.05; // 5% price increment
      effectiveP2 = nextP;
      effectiveQs2 = Math.max(0.001, supplyInterceptC + supplySlopeD * nextP);
      deltaP = nextP - evalPrice;
      deltaQs = effectiveQs2 - effectiveQs1;
      pctP = 5.0;
      pctQs = effectiveQs1 !== 0 ? (deltaQs / effectiveQs1) * 100 : 0;
      // Point PES = d * (P / Q_s)
      rawPes = effectiveQs1 > 0 ? supplySlopeD * (evalPrice / effectiveQs1) : 0;
    } else if (mode === 'simulator') {
      effectiveP1 = simBaseP;
      effectiveQs1 = simBaseQs;
      pctP = simPriceChangePct;
      pctQs = simKnownPes * pctP;
      effectiveP2 = effectiveP1 * (1 + pctP / 100);
      effectiveQs2 = Math.max(0, effectiveQs1 * (1 + pctQs / 100));
      deltaP = effectiveP2 - effectiveP1;
      deltaQs = effectiveQs2 - effectiveQs1;
      rawPes = simKnownPes;
    }

    const pes = isNaN(rawPes) || !isFinite(rawPes) ? 0 : Math.max(0, rawPes);

    // Classification & Typology
    let category = '';
    let categoryDesc = '';
    let flexibilityLevel: 'perfect_inelastic' | 'inelastic' | 'unitary' | 'elastic' | 'perfect_elastic' = 'inelastic';
    let badgeClass = '';
    let productionInsight = '';
    let supplyChainFactors = '';

    if (pes === 0) {
      flexibilityLevel = 'perfect_inelastic';
      category = 'Perfectlys Inelastic Supply (PES = 0)';
      categoryDesc = 'Output is completely fixed and cannot expand regardless of how high market prices climb.';
      badgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      productionInsight = 'Momentary Market Period: Fixed finite inventory, perishable goods, or unique non-reproducible assets (e.g., Picasso artwork, stadium seats).';
      supplyChainFactors = 'Zero spare capacity, impossible factor mobility, long multi-year gestation lag.';
    } else if (pes < 1.0) {
      flexibilityLevel = 'inelastic';
      category = 'Inelastic Supply (0 < PES < 1.0)';
      categoryDesc = 'Quantity supplied expands at a lower percentage rate than price increases due to capacity bottlenecks or production lags.';
      badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      productionInsight = 'Short-Run Production: Producers operate near maximum capacity and struggle to source immediate raw materials or skilled labor.';
      supplyChainFactors = 'High capital intensity, perishable stocks, strict regulatory barriers, high barriers to entry.';
    } else if (pes === 1.0) {
      flexibilityLevel = 'unitary';
      category = 'Unitary Elastic Supply (PES = 1.0)';
      categoryDesc = 'Quantity supplied changes in exact equal proportion to price movements (Linear curve passing directly through the origin).';
      badgeClass = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      productionInsight = 'Balanced Expansion: Production scales smoothly with revenue incentives at steady marginal cost.';
      supplyChainFactors = 'Moderate inventory buffers, flexible labor shifts, predictable supply chain.';
    } else if (pes <= 3.0) {
      flexibilityLevel = 'elastic';
      category = 'Elastic Supply (1.0 < PES ≤ 3.0)';
      categoryDesc = 'Producers are highly responsive and can rapidly ramp up production in response to rising market prices.';
      badgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      productionInsight = 'Long-Run Adaptability: Factories easily add extra shifts, retool production lines, or draw down abundant warehouse stocks.';
      supplyChainFactors = 'Substantial spare capacity (>20%), readily available raw materials, high factor mobility.';
    } else {
      flexibilityLevel = 'perfect_elastic';
      category = 'Highly / Near-Perfectly Elastic Supply (PES > 3.0)';
      categoryDesc = 'Producers can supply virtually unlimited quantities at or above the prevailing market price without cost increases.';
      badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      productionInsight = 'Hyper-Scalable Production: Negligible marginal cost of production and instant global distribution (e.g. software, streaming, standardized commodities).';
      supplyChainFactors = 'Zero marginal replication cost, infinite inventory liquidity, frictionless scaling.';
    }

    // Revenue Calculations
    const tr1 = effectiveP1 * effectiveQs1;
    const tr2 = effectiveP2 * effectiveQs2;
    const trDelta = tr2 - tr1;
    const trPct = tr1 > 0 ? (trDelta / tr1) * 100 : 0;

    // Spectrum Mapping (0.0 to 3.0) -> (0% to 100%)
    const clampedPes = Math.min(3.0, pes);
    const spectrumPercent = (clampedPes / 3.0) * 100;

    return {
      p1: effectiveP1,
      p2: effectiveP2,
      qs1: effectiveQs1,
      qs2: effectiveQs2,
      deltaP,
      deltaQs,
      pctP,
      pctQs,
      avgP,
      avgQs,
      pes,
      flexibilityLevel,
      category,
      categoryDesc,
      badgeClass,
      productionInsight,
      supplyChainFactors,
      tr1,
      tr2,
      trDelta,
      trPct,
      spectrumPercent
    };
  }, [mode, p1, p2, qs1, qs2, supplyInterceptC, supplySlopeD, evalPrice, simBaseP, simBaseQs, simKnownPes, simPriceChangePct]);

  // Sensitivity Matrix (Testing Market Price Shocks from -30% to +30%)
  const sensitivityTable = useMemo(() => {
    const shifts = [-30, -20, -15, -10, -5, 0, 5, 10, 15, 20, 30];
    const baseP = calc.p1;
    const baseQs = calc.qs1;
    const elasticity = calc.pes;

    return shifts.map((pctShift) => {
      const simP = baseP * (1 + pctShift / 100);
      const simPctQs = elasticity * pctShift;
      const simQs = Math.max(0, baseQs * (1 + simPctQs / 100));
      const simTr = simP * simQs;
      const deltaTr = simTr - calc.tr1;
      const pctTr = calc.tr1 > 0 ? (deltaTr / calc.tr1) * 100 : 0;

      return {
        pctShift,
        price: simP,
        quantitySupplied: simQs,
        pctQs: simPctQs,
        revenue: simTr,
        deltaTr,
        pctTr,
        isBase: pctShift === 0
      };
    });
  }, [calc.p1, calc.qs1, calc.pes, calc.tr1]);

  // Copy Full Proof Handler
  const handleCopyProof = () => {
    const text = `=========================================
Price Elasticity of Supply (PES) Analysis
=========================================
Calculation Method: ${mode.toUpperCase()}
Initial Price (P1): {currency}{calc.p1.toFixed(2)} | New Price (P2): {currency}{calc.p2.toFixed(2)} (ΔP = ${calc.deltaP >= 0 ? '+' : ''}{currency}{calc.deltaP.toFixed(2)}, ${calc.pctP.toFixed(2)}%)
Initial Supply (Qs1): ${calc.qs1.toFixed(1)} units | New Supply (Qs2): ${calc.qs2.toFixed(1)} units (ΔQs = ${calc.deltaQs >= 0 ? '+' : ''}${calc.deltaQs.toFixed(1)}, ${calc.pctQs.toFixed(2)}%)

RESULTS:
• PES Coefficient: ${calc.pes.toFixed(3)}
• Supply Elasticity Classification: ${calc.category}
• Producer Responsiveness: ${calc.categoryDesc}

PRODUCER REVENUE EXPANSION:
• Initial Total Revenue (TR1): ${currency}{calc.tr1.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• New Total Revenue (TR2): ${currency}{calc.tr2.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• Net Revenue Expansion: ${calc.trDelta >= 0 ? '+$' : '-$'}${Math.abs(calc.trDelta).toLocaleString(undefined, { minimumFractionDigits: 2 })} (${calc.trPct >= 0 ? '+' : ''}${calc.trPct.toFixed(2)}%)

PRODUCTION & SUPPLY CHAIN FLEXIBILITY INSIGHT:
• ${calc.productionInsight}
• Key Flexibility Drivers: ${calc.supplyChainFactors}

Generated via Toolique Economics Suite (https://www.toolique.in/economics/price-elasticity-supply-calculator)
=========================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setP1(40);
    setP2(50);
    setQs1(300);
    setQs2(420);
    setSupplyInterceptC(-50);
    setSupplySlopeD(8.0);
    setEvalPrice(40);
    setSimBaseP(40);
    setSimBaseQs(300);
    setSimKnownPes(1.5);
    setSimPriceChangePct(20);
    setMode('midpoint');
  };

  // SVG Supply Curve Graph Coordinate Math
  const svgWidth = 440;
  const svgHeight = 280;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;

  const graphWidth = svgWidth - padLeft - padRight;
  const graphHeight = svgHeight - padTop - padBottom;

  const maxPlotP = Math.max(calc.p1, calc.p2) * 1.35 || 100;
  const maxPlotQs = Math.max(calc.qs1, calc.qs2) * 1.35 || 500;

  const getSvgX = (qsVal: number) => padLeft + (Math.max(0, qsVal) / maxPlotQs) * graphWidth;
  const getSvgY = (pVal: number) => padTop + graphHeight - (Math.max(0, pVal) / maxPlotP) * graphHeight;

  const pt1X = getSvgX(calc.qs1);
  const pt1Y = getSvgY(calc.p1);
  const pt2X = getSvgX(calc.qs2);
  const pt2Y = getSvgY(calc.p2);

  // Generate continuous Supply curve path points
  const curvePoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const steps = 30;
    const baseP = calc.p1;
    const baseQs = calc.qs1;
    const pesVal = calc.pes;

    for (let i = 0; i <= steps; i++) {
      const curP = (maxPlotP * i) / steps;
      if (curP <= 0) {
        pts.push({ x: getSvgX(0), y: getSvgY(0) });
        continue;
      }
      let curQs = 0;
      if (mode === 'linear') {
        curQs = Math.max(0, supplyInterceptC + supplySlopeD * curP);
      } else {
        if (baseP > 0 && baseQs > 0) {
          if (pesVal === 0) {
            curQs = baseQs;
          } else {
            // Power curve: Q_s(P) = Q_s0 * (P / P0)^PES
            curQs = baseQs * Math.pow(curP / baseP, Math.min(4, pesVal));
          }
        }
      }
      pts.push({ x: getSvgX(curQs), y: getSvgY(curP) });
    }
    return pts;
  }, [maxPlotP, calc.p1, calc.qs1, calc.pes, mode, supplyInterceptC, supplySlopeD]);

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
            <Sparkles className="w-4 h-4 text-amber-500" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Industry Supply Benchmarks
              </span>
              <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                Click any real-world market to prefill capacity & price responsiveness
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
              className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 hover:border-amber-300 dark:hover:border-amber-800 text-left transition group cursor-pointer"
            >
              <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                {p.name}
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate font-mono">
                {p.expectedPes}
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
              ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
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
              ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Standard % Change</span>
        </button>

        <button
          onClick={() => setMode('linear')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'linear'
              ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Linear Supply Function</span>
        </button>

        <button
          onClick={() => setMode('simulator')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'simulator'
              ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>What-If Price Simulator</span>
        </button>
      </div>

      {/* 3. Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Input Parameters</span>
            </h2>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg">
              {mode.toUpperCase()} MODE
            </span>
          </div>

          {/* Conditional Input Fields Based on Selected Mode */}
          {(mode === 'midpoint' || mode === 'standard') && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                  Unit Market Price ({currency}P)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Initial Price (P₁)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={p1}
                      onChange={(e) => setP1(Math.max(0.01, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">New Price (P₂)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={p2}
                      onChange={(e) => setP2(Math.max(0.01, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Factory className="w-3.5 h-3.5 text-indigo-500" />
                  Quantity Supplied (Q_s Units)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Initial Supply (Q_s₁)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={qs1}
                      onChange={(e) => setQs1(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">New Supply (Q_s₂)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={qs2}
                      onChange={(e) => setQs2(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === 'linear' && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-3">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Supply Equation: Q_s = c + d · P
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Autonomous Intercept (c)</label>
                    <input
                      type="number"
                      step="any"
                      value={supplyInterceptC}
                      onChange={(e) => setSupplyInterceptC(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">Negative = Elastic (PES &gt; 1)</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                      Supply Slope (d: ΔQ_s/ΔP)
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={supplySlopeD}
                      onChange={(e) => setSupplySlopeD(Math.max(0.01, parseFloat(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Evaluation Market Price ({currency}P)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={evalPrice}
                  onChange={(e) => setEvalPrice(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {mode === 'simulator' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Baseline Price ({currency}P₁)</label>
                  <input
                    type="number"
                    min="0.01"
                    value={simBaseP}
                    onChange={(e) => setSimBaseP(Math.max(0.01, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Baseline Supply (Q_s₁)</label>
                  <input
                    type="number"
                    min="0"
                    value={simBaseQs}
                    onChange={(e) => setSimBaseQs(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Known Producer PES</label>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{simKnownPes.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3.0"
                  step="0.05"
                  value={simKnownPes}
                  onChange={(e) => setSimKnownPes(parseFloat(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5 font-mono">
                  <span>0.0 (Fixed)</span>
                  <span>0.5 (Inelastic)</span>
                  <span>1.0 (Unitary)</span>
                  <span>3.0 (Elastic)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Projected Price Movement (%ΔP)</label>
                  <span className={`text-xs font-mono font-bold ${simPriceChangePct >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {simPriceChangePct >= 0 ? '+' : ''}{simPriceChangePct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={simPriceChangePct}
                  onChange={(e) => setSimPriceChangePct(parseInt(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
            </div>
          )}

          {/* Quick Summary Card */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 text-xs">
            <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
              <span>Price Shift:</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">{currency}{calc.p1.toFixed(2)} → {currency}{calc.p2.toFixed(2)} ({calc.pctP >= 0 ? '+' : ''}{calc.pctP.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
              <span>Production Shift:</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                {calc.qs1.toFixed(1)} → {calc.qs2.toFixed(1)} units ({calc.pctQs >= 0 ? '+' : ''}{calc.pctQs.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-700 pt-2">
              <span>Producer Revenue Expansion:</span>
              <span className={`font-mono font-semibold ${calc.trDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {calc.trDelta >= 0 ? '+$' : '-$'}{Math.abs(calc.trDelta).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({calc.trPct >= 0 ? '+' : ''}{calc.trPct.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right Results & Visualizations Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Result Box */}
          <div className="bg-gradient-to-br from-amber-900 via-orange-950 to-zinc-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs uppercase font-black tracking-widest text-amber-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Price Elasticity of Supply (PES)
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md ${calc.badgeClass}`}>
                  {calc.category}
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                  +{calc.pes.toFixed(3)}
                </div>
                <div className="text-xs text-amber-200 font-mono">
                  {calc.flexibilityLevel === 'perfect_inelastic' && 'Fixed Output (Zero Flexibility)'}
                  {calc.flexibilityLevel === 'inelastic' && 'Constrained / Inelastic Output'}
                  {calc.flexibilityLevel === 'unitary' && 'Proportional Unitary Output'}
                  {calc.flexibilityLevel === 'elastic' && 'Flexible / Elastic Output'}
                  {calc.flexibilityLevel === 'perfect_elastic' && 'Hyper-Scalable Production'}
                </div>
              </div>

              {/* Elasticity Spectrum Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-amber-200">
                  <span>Fixed (0)</span>
                  <span>Inelastic (&lt;1)</span>
                  <span>Unitary (1)</span>
                  <span>Elastic (&gt;1)</span>
                  <span>Infinite (∞)</span>
                </div>
                <div className="relative h-3 rounded-full bg-white/10 overflow-hidden border border-white/10 p-0.5">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 opacity-70" />
                  {/* Marker Pin */}
                  <div
                    className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-md border border-zinc-900 transition-all duration-300"
                    style={{ left: `calc(${Math.min(97, Math.max(2, calc.spectrumPercent))}% - 5px)` }}
                  />
                </div>
              </div>

              {/* Production Diagnostics Box */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1.5">
                <div className="text-xs font-semibold text-amber-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Production Flexibility & Capacity Diagnosis</span>
                </div>
                <p className="text-xs text-amber-50 leading-relaxed">
                  {calc.productionInsight}
                </p>
                <div className="text-[11px] text-amber-200/90 pt-1 border-t border-white/10">
                  <strong>Supply Chain Factors:</strong> {calc.supplyChainFactors}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">Price Change (%ΔP)</div>
              <div className={`text-lg font-black font-mono mt-1 ${calc.pctP >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                {calc.pctP >= 0 ? '+' : ''}{calc.pctP.toFixed(2)}%
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">Supply Expansion (%ΔQ_s)</div>
              <div className={`text-lg font-black font-mono mt-1 ${calc.pctQs >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {calc.pctQs >= 0 ? '+' : ''}{calc.pctQs.toFixed(2)}%
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">Initial Revenue (TR₁ {currency})</div>
              <div className="text-lg font-black font-mono text-zinc-900 dark:text-white mt-1">{currency}{calc.tr1.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">New Revenue (TR₂ {currency})</div>
              <div className={`text-lg font-black font-mono mt-1 ${calc.trDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{currency}{calc.tr2.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Interactive SVG Supply Curve Graph */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Interactive Supply Curve (P vs Q_s)
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Slope: {calc.pes < 1 ? 'Steep (Inelastic)' : calc.pes === 1 ? '45° Origin (Unitary)' : 'Flat (Elastic)'}
              </span>
            </div>

            <div className="w-full flex justify-center bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl p-2 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[480px] h-auto select-none font-mono">
                <defs>
                  <linearGradient id="pesGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
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
                  Quantity Supplied (Q_s) →
                </text>
                <text transform={`rotate(-90 15 ${padTop + graphHeight / 2})`} x={15} y={padTop + graphHeight / 2} textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="bold">
                  Market Price ({currency}P) →
                </text>

                {/* Continuous Supply Curve Path */}
                {curvePathData && (
                  <path d={curvePathData} fill="none" stroke="url(#pesGrad)" strokeWidth="3" strokeLinecap="round" />
                )}

                {/* Point 1 Projections & Marker */}
                <line x1={padLeft} y1={pt1Y} x2={pt1X} y2={pt1Y} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity="0.6" />
                <line x1={pt1X} y1={padTop + graphHeight} x2={pt1X} y2={pt1Y} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity="0.6" />
                <circle cx={pt1X} cy={pt1Y} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <text x={pt1X + 8} y={pt1Y - 6} fill="#f59e0b" fontSize="10" fontWeight="bold">
                  (Q_s₁, P₁)
                </text>

                {/* Point 2 Projections & Marker */}
                <line x1={padLeft} y1={pt2Y} x2={pt2X} y2={pt2Y} stroke="#10b981" strokeDasharray="3 3" strokeOpacity="0.6" />
                <line x1={pt2X} y1={padTop + graphHeight} x2={pt2X} y2={pt2Y} stroke="#10b981" strokeDasharray="3 3" strokeOpacity="0.6" />
                <circle cx={pt2X} cy={pt2Y} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x={pt2X + 8} y={pt2Y - 6} fill="#10b981" fontSize="10" fontWeight="bold">
                  (Q_s₂, P₂)
                </text>
              </svg>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
              The upward-sloping Law of Supply indicates that higher market prices incentivize manufacturers to expand production output.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Production Flexibility Diagnostic Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white">
            <Warehouse className="w-4 h-4 text-amber-500" />
            <span>Spare Capacity & Inventories</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {calc.pes > 1.0
              ? 'High spare capacity allows the factory to ramp production quickly without driving up marginal costs.'
              : 'Near maximum utilization. Sourcing extra machinery and raw materials creates high friction.'}
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Time Horizon Dynamics</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Supply elasticity increases over time: Momentary (fixed output) → Short-run (variable shifts) → Long-run (building new plants).
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            <span>Barriers to Market Entry</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {calc.pes > 1.0
              ? 'Low capital barriers allow competitor entrants to supply the market when prices climb.'
              : 'High capital requirements, patents, or natural resource limits prevent new producers from entering quickly.'}
          </p>
        </div>
      </div>

      {/* 5. Step-by-Step Mathematical Derivation & Proof (Collapsible) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <button
          onClick={() => setShowProof(!showProof)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-amber-600 transition">
              Step-by-Step Mathematical Proof & PES Formulation
            </span>
          </div>
          {showProof ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showProof && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 font-mono text-xs">
            {/* Step 1 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 1: Identify Price & Supply Coordinates</span>
              <div className="text-zinc-900 dark:text-zinc-200">
                Initial: Price (P₁) = {currency}{calc.p1.toFixed(2)}, Quantity Supplied (Q_s₁) = {calc.qs1.toFixed(1)} units
              </div>
              <div className="text-zinc-900 dark:text-zinc-200">
                New: Price (P₂) = {currency}{calc.p2.toFixed(2)}, Quantity Supplied (Q_s₂) = {calc.qs2.toFixed(1)} units
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 2: Compute Absolute & Percentage Shifts</span>
              <div className="text-zinc-900 dark:text-zinc-200">
                ΔP = P₂ - P₁ = {currency}{calc.p2.toFixed(2)} - {currency}{calc.p1.toFixed(2)} = {calc.deltaP >= 0 ? '+' : ''}${calc.deltaP.toFixed(2)}
              </div>
              <div className="text-zinc-900 dark:text-zinc-200">
                ΔQ_s = Q_s₂ - Q_s₁ = {calc.qs2.toFixed(1)} - {calc.qs1.toFixed(1)} = {calc.deltaQs >= 0 ? '+' : ''}{calc.deltaQs.toFixed(1)} units
              </div>
              {mode === 'midpoint' ? (
                <div className="text-amber-700 dark:text-amber-300 font-semibold pt-1">
                  Midpoints: P(avg) = ${calc.avgP.toFixed(2)}, Q_s(avg) = {calc.avgQs.toFixed(2)} → %ΔP = {calc.pctP.toFixed(2)}%, %ΔQ_s = {calc.pctQs.toFixed(2)}%
                </div>
              ) : (
                <div className="text-amber-700 dark:text-amber-300 font-semibold pt-1">
                  Base Changes: %ΔP = ({calc.deltaP.toFixed(2)} / {calc.p1}) × 100 = {calc.pctP.toFixed(2)}%, %ΔQ_s = ({calc.deltaQs.toFixed(2)} / {calc.qs1}) × 100 = {calc.pctQs.toFixed(2)}%
                </div>
              )}
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 3: Supply Elasticity Formula Evaluation</span>
              <div className="text-zinc-900 dark:text-zinc-200 font-bold">
                PES = %ΔQ_s / %ΔP = ({calc.pctQs.toFixed(4)}%) / ({calc.pctP.toFixed(4)}%) = <span className="text-amber-600 dark:text-amber-400">+{calc.pes.toFixed(4)}</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 4: Supply Flexibility Diagnosis</span>
              <div className="text-zinc-900 dark:text-zinc-200 font-semibold">
                Result: <span className="text-amber-600 dark:text-amber-400">{calc.category}</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 font-sans text-xs">
                {calc.productionInsight}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 6. Market Price Sensitivity Matrix (Collapsible) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <button
          onClick={() => setShowSensitivity(!showSensitivity)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-amber-600 transition">
              Market Price Sensitivity Matrix (±30% Price Movement Projections)
            </span>
          </div>
          {showSensitivity ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showSensitivity && (
          <div className="overflow-x-auto pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-mono">
                  <th className="py-2.5 px-3">Price Move (%ΔP)</th>
                  <th className="py-2.5 px-3">Simulated Price ({currency}P)</th>
                  <th className="py-2.5 px-3">Projected Supply (Q_s)</th>
                  <th className="py-2.5 px-3">Output Shift (%ΔQ_s)</th>
                  <th className="py-2.5 px-3">Producer Revenue ({currency}TR)</th>
                  <th className="py-2.5 px-3">Revenue Delta (ΔTR {currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                {sensitivityTable.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${
                      row.isBase ? 'bg-amber-50/70 dark:bg-amber-950/30 font-bold' : ''
                    }`}
                  >
                    <td className={`py-2 px-3 ${row.pctShift > 0 ? 'text-amber-600' : row.pctShift < 0 ? 'text-rose-600' : 'text-zinc-600'}`}>
                      {row.pctShift > 0 ? `+${row.pctShift}%` : `${row.pctShift}%`} {row.isBase && '(Baseline)'}
                    </td>
                    <td className="py-2 px-3 text-zinc-800 dark:text-zinc-200">{currency}{row.price.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-zinc-900 dark:text-white font-bold">
                      {row.quantitySupplied.toFixed(1)} units
                    </td>
                    <td className={`py-2 px-3 ${row.pctQs > 0 ? 'text-emerald-600' : row.pctQs < 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
                      {row.pctQs > 0 ? `+${row.pctQs.toFixed(1)}%` : `${row.pctQs.toFixed(1)}%`}
                    </td>
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{currency}{row.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className={`py-2 px-3 ${row.deltaTr >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {row.deltaTr >= 0 ? '+$' : '-$'}{Math.abs(row.deltaTr).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({row.pctTr >= 0 ? '+' : ''}{row.pctTr.toFixed(1)}%)
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