import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2, Info,
  ShieldCheck, Table, Activity,
  Sliders, ChevronDown, ChevronUp
} from 'lucide-react';

type CalculationMode = 'midpoint' | 'standard' | 'linear' | 'target';

interface PresetScenario {
  name: string;
  category: string;
  p1: number;
  p2: number;
  q1: number;
  q2: number;
  expectedPed: string;
  notes: string;
}

export default function PriceElasticityDemandCalculator() {
  // Mode state
  const [mode, setMode] = useState<CalculationMode>('midpoint');
  const [currency, setCurrency] = useState<string>('$');

  // Input states for Points Mode (Midpoint / Standard)
  const [p1, setP1] = useState<number>(100);
  const [p2, setP2] = useState<number>(120);
  const [q1, setQ1] = useState<number>(500);
  const [q2, setQ2] = useState<number>(400);

  // Input states for Linear Equation Mode (Q = a - bP)
  const [interceptA, setInterceptA] = useState<number>(1000);
  const [slopeB, setSlopeB] = useState<number>(5);
  const [evalPrice, setEvalPrice] = useState<number>(100);

  // Input states for Target / What-If Simulator Mode
  const [simBaseP, setSimBaseP] = useState<number>(100);
  const [simBaseQ, setSimBaseQ] = useState<number>(500);
  const [simKnownPed, setSimKnownPed] = useState<number>(-1.5);
  const [simPriceChangePct, setSimPriceChangePct] = useState<number>(10);

  // UI States
  const [copied, setCopied] = useState(false);
  const [showProof, setShowProof] = useState(true);
  const [showSensitivity, setShowSensitivity] = useState(true);

  // Real-world Presets
  const presets: PresetScenario[] = [
    {
      name: '⛽ Motor Fuel / Gasoline',
      category: 'Inelastic Necessity',
      p1: 100,
      p2: 120,
      q1: 1000,
      q2: 950,
      expectedPed: '-0.28 (Inelastic)',
      notes: 'Commuters still need to drive; price increases generate higher revenue.'
    },
    {
      name: '💊 Essential Prescription Medicine',
      category: 'Strongly Inelastic',
      p1: 50,
      p2: 75,
      q1: 500,
      q2: 490,
      expectedPed: '-0.05 (Nearly Perfect Inelastic)',
      notes: 'Life-saving necessities have virtually zero close substitutes.'
    },
    {
      name: '☕ Specialty Cafe Coffee',
      category: 'Moderately Inelastic',
      p1: 5,
      p2: 6,
      q1: 200,
      q2: 175,
      expectedPed: '-0.73 (Inelastic)',
      notes: 'Brand loyalty keeps volume drop smaller than percentage price hike.'
    },
    {
      name: '✈️ Leisure Airline Tickets',
      category: 'Highly Elastic',
      p1: 300,
      p2: 360,
      q1: 1000,
      q2: 700,
      expectedPed: '-1.94 (Elastic)',
      notes: 'Vacationers can delay trips, switch destinations, or pick competing airlines.'
    },
    {
      name: '🍕 Fast Food / Brand Switching',
      category: 'Elastic Luxury / Substitute',
      p1: 10,
      p2: 12,
      q1: 800,
      q2: 600,
      expectedPed: '-1.57 (Elastic)',
      notes: 'Plenty of quick substitutes exist; raising price hurts total revenue.'
    },
    {
      name: '⌚ Luxury Watches & Jewelry',
      category: 'Luxury Elastic',
      p1: 5000,
      p2: 6000,
      q1: 100,
      q2: 60,
      expectedPed: '-2.75 (Highly Elastic)',
      notes: 'High percentage of disposable income; large demand drop.'
    }
  ];

  const applyPreset = (preset: PresetScenario) => {
    setP1(preset.p1);
    setP2(preset.p2);
    setQ1(preset.q1);
    setQ2(preset.q2);
    if (mode === 'linear' || mode === 'target') {
      setMode('midpoint');
    }
  };

  // Main Elasticity Calculation Engine
  const calc = useMemo(() => {
    let effectiveP1 = p1;
    let effectiveP2 = p2;
    let effectiveQ1 = q1;
    let effectiveQ2 = q2;
    let rawPed = 0;
    let pctQ = 0;
    let pctP = 0;
    let avgQ = 0;
    let avgP = 0;
    let deltaQ = 0;
    let deltaP = 0;

    if (mode === 'midpoint') {
      deltaQ = q2 - q1;
      deltaP = p2 - p1;
      avgQ = (q1 + q2) / 2;
      avgP = (p1 + p2) / 2;
      pctQ = avgQ !== 0 ? (deltaQ / avgQ) * 100 : 0;
      pctP = avgP !== 0 ? (deltaP / avgP) * 100 : 0;
      rawPed = pctP !== 0 ? pctQ / pctP : 0;
    } else if (mode === 'standard') {
      deltaQ = q2 - q1;
      deltaP = p2 - p1;
      pctQ = q1 !== 0 ? (deltaQ / q1) * 100 : 0;
      pctP = p1 !== 0 ? (deltaP / p1) * 100 : 0;
      rawPed = pctP !== 0 ? pctQ / pctP : 0;
    } else if (mode === 'linear') {
      // Q = a - bP
      effectiveP1 = evalPrice;
      effectiveQ1 = Math.max(0, interceptA - slopeB * evalPrice);
      // Delta evaluation for 1 unit price increment
      const pNext = evalPrice + 1;
      effectiveP2 = pNext;
      effectiveQ2 = Math.max(0, interceptA - slopeB * pNext);
      deltaP = 1;
      deltaQ = -slopeB;
      pctP = (1 / effectiveP1) * 100;
      pctQ = effectiveQ1 !== 0 ? (deltaQ / effectiveQ1) * 100 : 0;
      // Point Elasticity = -b * (P / Q)
      rawPed = effectiveQ1 > 0 ? -slopeB * (effectiveP1 / effectiveQ1) : -Infinity;
    } else if (mode === 'target') {
      // Simulator: calculate new Q and P from base and known PED
      effectiveP1 = simBaseP;
      effectiveQ1 = simBaseQ;
      pctP = simPriceChangePct;
      pctQ = simKnownPed * pctP;
      effectiveP2 = effectiveP1 * (1 + pctP / 100);
      effectiveQ2 = Math.max(0, effectiveQ1 * (1 + pctQ / 100));
      deltaP = effectiveP2 - effectiveP1;
      deltaQ = effectiveQ2 - effectiveQ1;
      rawPed = simKnownPed;
    }

    const absPed = Math.abs(rawPed);
    let category = '';
    let categoryShort = '';
    let revenueAdvice = '';
    let badgeColor = '';
    let spectrumPos = 0; // 0 to 100% for spectrum bar

    if (absPed > 1.05) {
      category = 'Elastic Demand (|PED| > 1)';
      categoryShort = 'Elastic';
      revenueAdvice = 'Consumers are price sensitive (%ΔQ > %ΔP). Lowering price INCREASES Total Revenue; raising price reduces revenue.';
      badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      spectrumPos = Math.min(95, 65 + (absPed - 1) * 10);
    } else if (absPed >= 0.95 && absPed <= 1.05) {
      category = 'Unitary Elastic Demand (|PED| = 1)';
      categoryShort = 'Unitary';
      revenueAdvice = '% change in Quantity exactly offsets % change in Price. Total Revenue is currently MAXIMIZED at this price point.';
      badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      spectrumPos = 50;
    } else if (absPed > 0.05) {
      category = 'Inelastic Demand (|PED| < 1)';
      categoryShort = 'Inelastic';
      revenueAdvice = 'Consumers are relatively insensitive (%ΔQ < %ΔP). Raising price INCREASES Total Revenue because volume drop is smaller than price gain.';
      badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      spectrumPos = Math.max(10, absPed * 45);
    } else {
      category = 'Perfectly Inelastic Demand (|PED| = 0)';
      categoryShort = 'Perfect Inelastic';
      revenueAdvice = 'Quantity demanded is completely unaffected by price shifts (pure essential necessity with 0 substitutes).';
      badgeColor = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      spectrumPos = 2;
    }

    const tr1 = effectiveP1 * effectiveQ1;
    const tr2 = effectiveP2 * effectiveQ2;
    const trDelta = tr2 - tr1;
    const trPctChange = tr1 > 0 ? (trDelta / tr1) * 100 : 0;

    // Linear curve landmarks
    const chokePrice = slopeB > 0 ? interceptA / slopeB : 0;
    const maxRevenuePrice = chokePrice / 2;
    const maxRevenueQty = interceptA / 2;
    const maxTotalRevenue = maxRevenuePrice * maxRevenueQty;

    return {
      p1: effectiveP1,
      p2: effectiveP2,
      q1: effectiveQ1,
      q2: effectiveQ2,
      deltaP,
      deltaQ,
      avgP,
      avgQ,
      pctP,
      pctQ,
      ped: rawPed,
      absPed,
      category,
      categoryShort,
      revenueAdvice,
      badgeColor,
      spectrumPos,
      tr1,
      tr2,
      trDelta,
      trPctChange,
      chokePrice,
      maxRevenuePrice,
      maxRevenueQty,
      maxTotalRevenue
    };
  }, [p1, p2, q1, q2, mode, interceptA, slopeB, evalPrice, simBaseP, simBaseQ, simKnownPed, simPriceChangePct]);

  // Sensitivity Matrix Generator (What happens at -25% to +25% price adjustments)
  const sensitivityTable = useMemo(() => {
    const shifts = [-25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25];
    const baseP = calc.p1;
    const baseQ = calc.q1;
    const elasticity = calc.ped !== 0 ? calc.ped : -1.0;

    return shifts.map((pctShift) => {
      const simP = baseP * (1 + pctShift / 100);
      const simPctQ = elasticity * pctShift;
      const simQ = Math.max(0, baseQ * (1 + simPctQ / 100));
      const simTR = simP * simQ;
      const simTrDelta = simTR - calc.tr1;
      const simTrPct = calc.tr1 > 0 ? (simTrDelta / calc.tr1) * 100 : 0;

      return {
        pctShift,
        price: simP,
        quantity: simQ,
        revenue: simTR,
        revDelta: simTrDelta,
        revPct: simTrPct,
        isBase: pctShift === 0
      };
    });
  }, [calc.p1, calc.q1, calc.ped, calc.tr1]);

  // Copy Full Proof Handler
  const handleCopyProof = () => {
    const text = `=========================================
Price Elasticity of Demand (PED) Analysis
=========================================
Calculation Method: ${mode.toUpperCase()}
Initial Price (P1): {currency}{calc.p1.toFixed(2)} | New Price (P2): {currency}{calc.p2.toFixed(2)} (ΔP = ${calc.deltaP >= 0 ? '+' : ''}${calc.deltaP.toFixed(2)}, ${calc.pctP.toFixed(2)}%)
Initial Quantity (Q1): ${calc.q1.toFixed(0)} | New Quantity (Q2): ${calc.q2.toFixed(0)} (ΔQ = ${calc.deltaQ >= 0 ? '+' : ''}${calc.deltaQ.toFixed(0)}, ${calc.pctQ.toFixed(2)}%)

RESULTS:
• PED Coefficient: ${calc.ped.toFixed(3)}
• Absolute Elasticity |PED|: ${calc.absPed.toFixed(3)}
• Classification: ${calc.category}

TOTAL REVENUE TEST:
• Initial Total Revenue (TR1 ${currency}): ${currency}{calc.tr1.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• New Total Revenue (TR2 ${currency}): ${currency}{calc.tr2.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• Net Revenue Impact: ${calc.trDelta >= 0 ? '+$' : '-$'}${Math.abs(calc.trDelta).toLocaleString(undefined, { minimumFractionDigits: 2 })} (${calc.trPctChange >= 0 ? '+' : ''}${calc.trPctChange.toFixed(2)}%)

STRATEGIC PRICING INSIGHT:
${calc.revenueAdvice}

Generated via Toolique Economics Suite (https://www.toolique.in/economics/price-elasticity-demand-calculator)
=========================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setP1(100);
    setP2(120);
    setQ1(500);
    setQ2(400);
    setInterceptA(1000);
    setSlopeB(5);
    setEvalPrice(100);
    setSimBaseP(100);
    setSimBaseQ(500);
    setSimKnownPed(-1.5);
    setSimPriceChangePct(10);
    setMode('midpoint');
  };

  // SVG Graph Coordinate Calculations
  const svgWidth = 440;
  const svgHeight = 280;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;

  const graphWidth = svgWidth - padLeft - padRight;
  const graphHeight = svgHeight - padTop - padBottom;

  const maxPlotP = Math.max(calc.p1, calc.p2) * 1.35 || 150;
  const maxPlotQ = Math.max(calc.q1, calc.q2) * 1.35 || 600;

  const getSvgX = (q: number) => padLeft + (Math.max(0, q) / maxPlotQ) * graphWidth;
  const getSvgY = (p: number) => padTop + graphHeight - (Math.max(0, p) / maxPlotP) * graphHeight;

  const pt1X = getSvgX(calc.q1);
  const pt1Y = getSvgY(calc.p1);
  const pt2X = getSvgX(calc.q2);
  const pt2Y = getSvgY(calc.p2);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* 1. Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Real-World Benchmark Presets
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
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-850/60 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition text-left group cursor-pointer"
            >
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {p.name}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                {p.category}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Parameter Inputs & Mode Selector */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            
            {/* Mode Switcher Tabs */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                <span>Calculation Formula Mode</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-850 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('midpoint')}
                  className={`py-2 px-2.5 rounded-xl transition text-center ${
                    mode === 'midpoint'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Midpoint (Arc)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('standard')}
                  className={`py-2 px-2.5 rounded-xl transition text-center ${
                    mode === 'standard'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Standard Base %
                </button>
                <button
                  type="button"
                  onClick={() => setMode('linear')}
                  className={`py-2 px-2.5 rounded-xl transition text-center ${
                    mode === 'linear'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Demand Function (Q=a-bP)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('target')}
                  className={`py-2 px-2.5 rounded-xl transition text-center ${
                    mode === 'target'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  What-If Simulator
                </button>
              </div>
            </div>

            {/* Mode 1 & 2: Midpoint or Standard Point Inputs */}
            {(mode === 'midpoint' || mode === 'standard') && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Initial Price ($P_1$)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={p1}
                      onChange={(e) => setP1(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      New Price ($P_2$)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={p2}
                      onChange={(e) => setP2(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Initial Quantity ($Q_1$)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={q1}
                      onChange={(e) => setQ1(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      New Quantity ($Q_2$)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={q2}
                      onChange={(e) => setQ2(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-xs text-zinc-600 dark:text-zinc-300">
                  <div className="font-bold text-indigo-700 dark:text-indigo-300 mb-0.5">
                    {mode === 'midpoint' ? 'Midpoint (Arc) Method' : 'Standard Base Percentage'}
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {mode === 'midpoint'
                      ? 'Computes % changes relative to the average of initial and new values. Yields identical elasticity whether price increases or decreases.'
                      : 'Computes % changes relative to starting base (P1, Q1). Common in introductory business pricing.'}
                  </p>
                </div>
              </div>
            )}

            {/* Mode 3: Linear Demand Equation Inputs */}
            {mode === 'linear' && (
              <div className="space-y-4 pt-1">
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-xs text-zinc-700 dark:text-zinc-300 font-mono text-center">
                  Demand Equation: <strong>Qd = {interceptA} - {slopeB} × P</strong>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Quantity Intercept ($a$)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={interceptA}
                      onChange={(e) => setInterceptA(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Slope Factor ($b = \Delta Q/\Delta P$)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={slopeB}
                      onChange={(e) => setSlopeB(parseFloat(e.target.value) || 1)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Evaluate Point Price ($P$)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={evalPrice}
                    onChange={(e) => setEvalPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                    <span>Choke Price: ${calc.chokePrice.toFixed(2)}</span>
                    <span>Max TR Price: ${calc.maxRevenuePrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 4: Target Simulator Inputs */}
            {mode === 'target' && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Current Price ($P_0$)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={simBaseP}
                      onChange={(e) => setSimBaseP(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Current Quantity ($Q_0$)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={simBaseQ}
                      onChange={(e) => setSimBaseQ(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Known Elasticity ($PED$)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={simKnownPed}
                      onChange={(e) => setSimKnownPed(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Proposed Price Change (%ΔP)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={simPriceChangePct}
                      onChange={(e) => setSimPriceChangePct(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Elasticity Spectrum Gauge */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-zinc-800 dark:text-zinc-200">Elasticity Spectrum Bar</span>
              <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">|PED| = {calc.absPed.toFixed(3)}</span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 via-emerald-500 via-amber-500 to-rose-500 shadow-inner">
              {/* Needle Indicator */}
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-white border border-black shadow-md rounded-full transition-all duration-300 transform -translate-x-1/2"
                style={{ left: `${calc.spectrumPos}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
              <span>0 (Perfect Inelastic)</span>
              <span>&lt; 1 (Inelastic)</span>
              <span>1.0 (Unitary)</span>
              <span>&gt; 1 (Elastic)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Metrics, Revenue Test & Interactive SVG Graph */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Main Hero Results Banner */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 text-white shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
                Price Elasticity Coefficient
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${calc.badgeColor}`}>
                {calc.categoryShort}
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-1">
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {calc.ped.toFixed(3)}
              </div>
              <span className="text-sm font-semibold text-zinc-300">
                (|PED| = {calc.absPed.toFixed(3)})
              </span>
            </div>

            {/* Total Revenue Test Insight */}
            <div className="pt-3 border-t border-white/10 space-y-1">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Total Revenue Test Recommendation:</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                {calc.revenueAdvice}
              </p>
            </div>
          </div>

          {/* 4 Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs">
              <div className="text-[11px] font-semibold text-zinc-500">Δ Quantity (%ΔQ)</div>
              <div className={`text-base font-black font-mono mt-1 ${calc.pctQ >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {calc.pctQ >= 0 ? '+' : ''}{calc.pctQ.toFixed(2)}%
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs">
              <div className="text-[11px] font-semibold text-zinc-500">Δ Price (%ΔP)</div>
              <div className={`text-base font-black font-mono mt-1 ${calc.pctP >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                {calc.pctP >= 0 ? '+' : ''}{calc.pctP.toFixed(2)}%
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs">
              <div className="text-[11px] font-semibold text-zinc-500">Initial Revenue (TR₁)</div>
              <div className="text-base font-black font-mono text-zinc-900 dark:text-white mt-1">{currency}{calc.tr1.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs">
              <div className="text-[11px] font-semibold text-zinc-500">New Revenue (TR₂)</div>
              <div className={`text-base font-black font-mono mt-1 ${calc.trDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{currency}{calc.tr2.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                <span className="text-[10px] block font-normal text-zinc-400">
                  {calc.trDelta >= 0 ? '+' : ''}{calc.trPctChange.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Demand Curve & Revenue Box Visualizer */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Interactive Demand Curve & Revenue Area Comparison
                </h3>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="inline-flex items-center gap-1 text-blue-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/40 border border-blue-600" /> TR₁ Box
                </span>
                <span className="inline-flex items-center gap-1 text-purple-600">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-500/40 border border-purple-600" /> TR₂ Box
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden flex justify-center bg-zinc-50/70 dark:bg-zinc-950/60 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-2">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-lg h-auto">
                {/* Axes */}
                <line x1={padLeft} y1={padTop} x2={padLeft} y2={svgHeight - padBottom} stroke="#94a3b8" strokeWidth="1.5" />
                <line x1={padLeft} y1={svgHeight - padBottom} x2={svgWidth - padRight} y2={svgHeight - padBottom} stroke="#94a3b8" strokeWidth="1.5" />

                {/* Axis Labels */}
                <text x={padLeft - 10} y={padTop + 5} textAnchor="end" className="text-[10px] font-bold fill-zinc-500">Price (P)</text>
                <text x={svgWidth - padRight} y={svgHeight - padBottom + 20} textAnchor="end" className="text-[10px] font-bold fill-zinc-500">Quantity (Q)</text>

                {/* TR1 Shaded Box (P1 x Q1) */}
                <rect
                  x={padLeft}
                  y={pt1Y}
                  width={Math.max(0, pt1X - padLeft)}
                  height={Math.max(0, (svgHeight - padBottom) - pt1Y)}
                  fill="rgba(59, 130, 246, 0.18)"
                  stroke="#3b82f6"
                  strokeDasharray="2,2"
                  strokeWidth="1"
                />

                {/* TR2 Shaded Box (P2 x Q2) */}
                <rect
                  x={padLeft}
                  y={pt2Y}
                  width={Math.max(0, pt2X - padLeft)}
                  height={Math.max(0, (svgHeight - padBottom) - pt2Y)}
                  fill="rgba(168, 85, 247, 0.18)"
                  stroke="#a855f7"
                  strokeDasharray="3,3"
                  strokeWidth="1"
                />

                {/* Demand Curve Line */}
                <line
                  x1={getSvgX(calc.q1 * 1.35)}
                  y1={getSvgY(calc.p1 * 0.65)}
                  x2={getSvgX(calc.q2 * 0.65)}
                  y2={getSvgY(calc.p2 * 1.35)}
                  stroke="#6366f1"
                  strokeWidth="2.5"
                />

                {/* Dashed projections Point 1 */}
                <line x1={padLeft} y1={pt1Y} x2={pt1X} y2={pt1Y} stroke="#3b82f6" strokeDasharray="3,3" strokeWidth="1" />
                <line x1={pt1X} y1={pt1Y} x2={pt1X} y2={svgHeight - padBottom} stroke="#3b82f6" strokeDasharray="3,3" strokeWidth="1" />

                {/* Dashed projections Point 2 */}
                <line x1={padLeft} y1={pt2Y} x2={pt2X} y2={pt2Y} stroke="#a855f7" strokeDasharray="3,3" strokeWidth="1" />
                <line x1={pt2X} y1={pt2Y} x2={pt2X} y2={svgHeight - padBottom} stroke="#a855f7" strokeDasharray="3,3" strokeWidth="1" />

                {/* Point 1 Marker */}
                <circle cx={pt1X} cy={pt1Y} r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                <text x={pt1X + 8} y={pt1Y - 6} className="text-[10px] font-extrabold fill-blue-600 dark:fill-blue-400">
                  P1({calc.q1.toFixed(0)}, ${calc.p1.toFixed(0)})
                </text>

                {/* Point 2 Marker */}
                <circle cx={pt2X} cy={pt2Y} r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
                <text x={pt2X + 8} y={pt2Y - 6} className="text-[10px] font-extrabold fill-purple-600 dark:fill-purple-400">
                  P2({calc.q2.toFixed(0)}, ${calc.p2.toFixed(0)})
                </text>

                {/* Axis Tick Values */}
                <text x={padLeft - 6} y={pt1Y + 3} textAnchor="end" className="text-[9px] font-mono fill-zinc-500">${calc.p1.toFixed(0)}</text>
                <text x={padLeft - 6} y={pt2Y + 3} textAnchor="end" className="text-[9px] font-mono fill-zinc-500">${calc.p2.toFixed(0)}</text>
                <text x={pt1X} y={svgHeight - padBottom + 12} textAnchor="middle" className="text-[9px] font-mono fill-zinc-500">{calc.q1.toFixed(0)}</text>
                <text x={pt2X} y={svgHeight - padBottom + 12} textAnchor="middle" className="text-[9px] font-mono fill-zinc-500">{calc.q2.toFixed(0)}</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Dynamic Step-by-Step Mathematical Proof */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <button
          type="button"
          onClick={() => setShowProof(!showProof)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-black text-zinc-900 dark:text-white">
              Step-by-Step Mathematical Derivation & Proof
            </h2>
          </div>
          <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            {showProof ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showProof && (
          <div className="space-y-3 pt-2 text-xs text-zinc-700 dark:text-zinc-300 font-mono divide-y divide-zinc-100 dark:divide-zinc-800">
            
            {/* Step 1 */}
            <div className="pt-2 space-y-1">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block font-sans text-xs">
                Step 1: Compute Changes in Quantity (ΔQ) and Price (ΔP)
              </span>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850">
                ΔQ = Q₂ - Q₁ = {calc.q2.toFixed(2)} - {calc.q1.toFixed(2)} = <strong>{calc.deltaQ >= 0 ? '+' : ''}{calc.deltaQ.toFixed(2)}</strong><br />
                ΔP = P₂ - P₁ = {calc.p2.toFixed(2)} - {calc.p1.toFixed(2)} = <strong>{calc.deltaP >= 0 ? '+' : ''}{calc.deltaP.toFixed(2)}</strong>
              </div>
            </div>

            {/* Step 2 */}
            <div className="pt-3 space-y-1">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block font-sans text-xs">
                {mode === 'midpoint' ? 'Step 2: Calculate Midpoint Averages (Q_avg & P_avg)' : 'Step 2: Determine Base Denominators'}
              </span>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850">
                {mode === 'midpoint' ? (
                  <>
                    Q_avg = (Q₁ + Q₂) / 2 = ({calc.q1.toFixed(2)} + {calc.q2.toFixed(2)}) / 2 = <strong>{calc.avgQ.toFixed(2)}</strong><br />
                    P_avg = (P₁ + P₂) / 2 = ({calc.p1.toFixed(2)} + {calc.p2.toFixed(2)}) / 2 = <strong>{calc.avgP.toFixed(2)}</strong>
                  </>
                ) : (
                  <>
                    Base Quantity Q₁ = <strong>{calc.q1.toFixed(2)}</strong><br />
                    Base Price P₁ = <strong>{calc.p1.toFixed(2)}</strong>
                  </>
                )}
              </div>
            </div>

            {/* Step 3 */}
            <div className="pt-3 space-y-1">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block font-sans text-xs">
                Step 3: Compute Percentage Changes (%ΔQ & %ΔP)
              </span>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850">
                %ΔQ = ({calc.deltaQ.toFixed(2)} / {mode === 'midpoint' ? calc.avgQ.toFixed(2) : calc.q1.toFixed(2)}) × 100 = <strong>{calc.pctQ.toFixed(3)}%</strong><br />
                %ΔP = ({calc.deltaP.toFixed(2)} / {mode === 'midpoint' ? calc.avgP.toFixed(2) : calc.p1.toFixed(2)}) × 100 = <strong>{calc.pctP.toFixed(3)}%</strong>
              </div>
            </div>

            {/* Step 4 */}
            <div className="pt-3 space-y-1">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block font-sans text-xs">
                Step 4: Calculate Price Elasticity of Demand (PED = %ΔQ / %ΔP)
              </span>
              <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200">
                PED = ({calc.pctQ.toFixed(3)}%) / ({calc.pctP.toFixed(3)}%) = <strong>{calc.ped.toFixed(3)}</strong><br />
                Absolute Value |PED| = <strong>{calc.absPed.toFixed(3)}</strong> → Classified as <strong>{calc.category}</strong>
              </div>
            </div>

            {/* Step 5 */}
            <div className="pt-3 space-y-1">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 block font-sans text-xs">
                Step 5: Total Revenue Proof (TR = P × Q)
              </span>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850">
                Initial Total Revenue (TR₁) = {currency}{calc.p1.toFixed(2)} × {calc.q1.toFixed(0)} = <strong>${calc.tr1.toFixed(2)}</strong><br />
                New Total Revenue (TR₂) = {currency}{calc.p2.toFixed(2)} × {calc.q2.toFixed(0)} = <strong>${calc.tr2.toFixed(2)}</strong><br />
                Net Revenue Shift (ΔTR) = ${calc.tr2.toFixed(2)} - ${calc.tr1.toFixed(2)} = <strong className={calc.trDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{calc.trDelta >= 0 ? '+$' : '-$'}{Math.abs(calc.trDelta).toFixed(2)} ({calc.trPctChange >= 0 ? '+' : ''}{calc.trPctChange.toFixed(2)}%)</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Price Sensitivity Simulation Matrix */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <button
          type="button"
          onClick={() => setShowSensitivity(!showSensitivity)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-base font-black text-zinc-900 dark:text-white">
                Price Sensitivity Simulation Table (±25% Shifts)
              </h2>
              <p className="text-xs text-zinc-500">
                Simulated quantity and total revenue at different price variations based on current PED ({calc.ped.toFixed(2)}).
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            {showSensitivity ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showSensitivity && (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 font-bold text-zinc-700 dark:text-zinc-300">
                  <th className="p-2.5">Price Shift (%ΔP)</th>
                  <th className="p-2.5">Projected Price</th>
                  <th className="p-2.5">Projected Demand (Q)</th>
                  <th className="p-2.5">Total Revenue (TR)</th>
                  <th className="p-2.5">Revenue Impact (ΔTR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                {sensitivityTable.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition ${
                      row.isBase
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 font-black text-indigo-950 dark:text-indigo-200'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-850/50 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <td className="p-2.5 font-sans font-bold">
                      {row.pctShift > 0 ? `+${row.pctShift}%` : row.pctShift === 0 ? 'Current Base (0%)' : `${row.pctShift}%`}
                    </td>
                    <td className="p-2.5">${row.price.toFixed(2)}</td>
                    <td className="p-2.5">{row.quantity.toFixed(0)} units</td>
                    <td className="p-2.5 font-bold">${row.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td className={`p-2.5 font-bold ${row.revDelta > 0 ? 'text-emerald-600' : row.revDelta < 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
                      {row.isBase ? '—' : `${row.revDelta > 0 ? '+' : ''}${row.revPct.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Core Economic Determinants & Reference Guide */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <h2 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Core Determinants of Price Elasticity of Demand</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
              1. Availability of Close Substitutes
            </span>
            <p>
              Goods with plentiful substitutes (e.g. coffee brands, fast food) have <strong>higher elasticity</strong> because consumers can effortlessly switch brands if price rises.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
              2. Degree of Necessity vs Luxury
            </span>
            <p>
              Essential necessities (insulin, electricity, water) have <strong>inelastic demand (|PED| &lt; 1)</strong>, while luxury vacation travel and fine dining are <strong>highly elastic</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
              3. Proportion of Consumer Income Spent
            </span>
            <p>
              Inexpensive items (table salt, toothpicks) have <strong>inelastic demand</strong> because price hikes barely affect household budgets. Big-ticket purchases (cars, electronics) are elastic.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
              4. Time Horizon for Consumer Adaptation
            </span>
            <p>
              Demand becomes <strong>more elastic over the long run</strong> as consumers find alternative technologies, substitute fuels, or alter habits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}