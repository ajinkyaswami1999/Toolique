import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2, Info,
  Sliders, ChevronDown, ChevronUp,
  Calculator, TrendingUp, Scale,
  DollarSign, Layers, Target, Zap
} from 'lucide-react';

type CalculationMode = 'tr_test' | 'linear_demand' | 'iso_elastic' | 'multi_tier';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  p1: number;
  p2: number;
  q1: number;
  q2: number;
  interceptA: number;
  slopeB: number;
  currentQ: number;
  isoA: number;
  isoEpsilon: number;
  tier1P: number;
  tier1Q: number;
  tier2P: number;
  tier2Q: number;
  tier3P: number;
  tier3Q: number;
  description: string;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'SaaS Plan Price Hike',
    category: 'Elastic Demand',
    badgeColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800',
    mode: 'tr_test',
    p1: 50,
    p2: 70,
    q1: 1000,
    q2: 600,
    interceptA: 100,
    slopeB: 0.05,
    currentQ: 800,
    isoA: 50000,
    isoEpsilon: 1.5,
    tier1P: 29,
    tier1Q: 500,
    tier2P: 79,
    tier2Q: 300,
    tier3P: 199,
    tier3Q: 80,
    description: 'Price raised from $50 to $70 causes 40% user churn. Demand is elastic (|Ed|=1.52) and Total Revenue drops.'
  },
  {
    name: 'Pharma Prescription Drug',
    category: 'Inelastic Demand',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
    mode: 'tr_test',
    p1: 120,
    p2: 160,
    q1: 5000,
    q2: 4700,
    interceptA: 300,
    slopeB: 0.03,
    currentQ: 3000,
    isoA: 600000,
    isoEpsilon: 0.22,
    tier1P: 40,
    tier1Q: 2000,
    tier2P: 120,
    tier2Q: 3000,
    tier3P: 250,
    tier3Q: 500,
    description: 'Essential medical therapy allows a price increase from $120 to $160 with minimal volume loss (|Ed|=0.21), boosting TR.'
  },
  {
    name: 'Black Friday Flash Sale',
    category: 'Elastic Discount',
    badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    mode: 'tr_test',
    p1: 100,
    p2: 75,
    q1: 2000,
    q2: 3500,
    interceptA: 150,
    slopeB: 0.025,
    currentQ: 2000,
    isoA: 200000,
    isoEpsilon: 1.95,
    tier1P: 49,
    tier1Q: 1200,
    tier2P: 89,
    tier2Q: 800,
    tier3P: 149,
    tier3Q: 200,
    description: '25% price discount triggers a 75% volume surge (|Ed|=1.93), expanding Total Revenue substantially.'
  },
  {
    name: 'Airline Dynamic Revenue Peak',
    category: 'Linear Demand Curve',
    badgeColor: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800',
    mode: 'linear_demand',
    p1: 300,
    p2: 250,
    q1: 400,
    q2: 500,
    interceptA: 500,
    slopeB: 0.5,
    currentQ: 350,
    isoA: 125000,
    isoEpsilon: 1.0,
    tier1P: 150,
    tier1Q: 300,
    tier2P: 350,
    tier2Q: 150,
    tier3P: 800,
    tier3Q: 40,
    description: 'Linear flight route demand P = 500 − 0.5Q. Peak revenue occurs at P* = $250, Q* = 500 ($125,000 max TR).'
  },
  {
    name: 'Luxury Designer Apparel',
    category: 'Linear Demand Curve',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    mode: 'linear_demand',
    p1: 1800,
    p2: 1200,
    q1: 300,
    q2: 600,
    interceptA: 2400,
    slopeB: 2.0,
    currentQ: 400,
    isoA: 720000,
    isoEpsilon: 1.2,
    tier1P: 450,
    tier1Q: 400,
    tier2P: 1200,
    tier2Q: 200,
    tier3P: 2800,
    tier3Q: 50,
    description: 'High-margin luxury fashion line P = 2400 − 2Q. Current pricing $1,600 operates in elastic zone.'
  },
  {
    name: 'Enterprise 3-Tier SaaS Mix',
    category: 'Multi-Tier Mix',
    badgeColor: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800',
    mode: 'multi_tier',
    p1: 49,
    p2: 69,
    q1: 1500,
    q2: 1200,
    interceptA: 200,
    slopeB: 0.1,
    currentQ: 1000,
    isoA: 150000,
    isoEpsilon: 1.0,
    tier1P: 29,
    tier1Q: 1200,
    tier2P: 99,
    tier2Q: 450,
    tier3P: 499,
    tier3Q: 60,
    description: '3-Tier SaaS product portfolio (Starter, Professional, Enterprise) analyzing aggregate blended revenue.'
  }
];

export default function TotalRevenueCalculator() {
  const [currency, setCurrency] = useState<string>('$');
  const [mode, setMode] = useState<CalculationMode>('tr_test');
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Mode 1: TR Test Inputs (Two-point shift)
  const [p1, setP1] = useState<number>(50);
  const [p2, setP2] = useState<number>(70);
  const [q1, setQ1] = useState<number>(1000);
  const [q2, setQ2] = useState<number>(600);

  // Mode 2: Linear Demand Curve (P = a - bQ)
  const [interceptA, setInterceptA] = useState<number>(500);
  const [slopeB, setSlopeB] = useState<number>(0.5);
  const [currentQ, setCurrentQ] = useState<number>(350);

  // Mode 3: Iso-Elastic Constant Demand (Q = A * P^(-eps))
  const [isoA, setIsoA] = useState<number>(50000);
  const [isoEpsilon, setIsoEpsilon] = useState<number>(1.2);
  const [isoP, setIsoP] = useState<number>(50);

  // Mode 4: Multi-Tier Mix
  const [tier1P, setTier1P] = useState<number>(29);
  const [tier1Q, setTier1Q] = useState<number>(1200);
  const [tier2P, setTier2P] = useState<number>(99);
  const [tier2Q, setTier2Q] = useState<number>(450);
  const [tier3P, setTier3P] = useState<number>(499);
  const [tier3Q, setTier3Q] = useState<number>(60);

  // Core Math Calculations
  const calc = useMemo(() => {
    // 1. Two-Point TR Test
    const tr1 = p1 * q1;
    const tr2 = p2 * q2;
    const deltaP = p2 - p1;
    const deltaQ = q2 - q1;
    const deltaTR = tr2 - tr1;
    const pctDeltaP = p1 > 0 ? (deltaP / p1) * 100 : 0;
    const pctDeltaQ = q1 > 0 ? (deltaQ / q1) * 100 : 0;
    const pctDeltaTR = tr1 > 0 ? (deltaTR / tr1) * 100 : 0;

    // Midpoint Arc Elasticity
    const avgP = (p1 + p2) / 2;
    const avgQ = (q1 + q2) / 2;
    let arcEd = 0;
    if (avgP > 0 && avgQ > 0 && deltaP !== 0) {
      arcEd = (deltaQ / avgQ) / (deltaP / avgP);
    }
    const absArcEd = Math.abs(arcEd);

    // Decomposition: Price Effect vs Output Effect
    const priceEffect = q1 * deltaP;
    const outputEffect = p2 * deltaQ;

    // Total Revenue Test Verdict
    let elasticityRegime = 'Unitary Elastic';
    let regimeBadge = 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800';
    let pricingStrategy = 'Optimal Revenue Peak (|Ed| ≈ 1.0)';

    if (absArcEd > 1.05) {
      elasticityRegime = 'Elastic Demand (|Ed| > 1)';
      regimeBadge = 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800';
      if (deltaP > 0) {
        pricingStrategy = 'Price Increase Destroys Revenue. Recommended Action: Lower Price to Expand Volume.';
      } else {
        pricingStrategy = 'Price Cut Expanded Revenue! Volume Gains Exceeded Price Concessions.';
      }
    } else if (absArcEd < 0.95) {
      elasticityRegime = 'Inelastic Demand (|Ed| < 1)';
      regimeBadge = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
      if (deltaP > 0) {
        pricingStrategy = 'Price Increase Boosts Revenue! Customers are Inelastic; Revenue Gains Outweigh Volume Loss.';
      } else {
        pricingStrategy = 'Price Cut Reduced Revenue. Recommended Action: Raise Price to Maximize Top-Line.';
      }
    } else {
      elasticityRegime = 'Unitary Elastic (|Ed| ≈ 1)';
      pricingStrategy = 'Top-Line Revenue is Maximized. Marginal Revenue is Zero (MR ≈ 0).';
    }

    // 2. Linear Demand Mode (P = a - bQ => TR = aQ - bQ^2)
    const a = interceptA;
    const b = slopeB > 0 ? slopeB : 0.0001;
    const qMax = a / (2 * b);
    const pMax = a / 2;
    const trMax = (a * a) / (4 * b);

    // Current Operating Point
    const currentP = Math.max(0, a - b * currentQ);
    const currentTR = currentP * currentQ;
    const currentMR = a - 2 * b * currentQ;
    const currentEd = currentQ > 0 ? -(1 / b) * (currentP / currentQ) : 0;
    const currentAbsEd = Math.abs(currentEd);
    const revenueGap = Math.max(0, trMax - currentTR);

    // 3. Iso-Elastic Demand Mode (Q = A * P^(-eps))
    const isoQ = isoA * Math.pow(Math.max(0.01, isoP), -isoEpsilon);
    const isoTR = isoP * isoQ;

    // 4. Multi-Tier Mix
    const rev1 = tier1P * tier1Q;
    const rev2 = tier2P * tier2Q;
    const rev3 = tier3P * tier3Q;
    const totalMixRevenue = rev1 + rev2 + rev3;
    const totalMixVolume = tier1Q + tier2Q + tier3Q;
    const blendedPrice = totalMixVolume > 0 ? totalMixRevenue / totalMixVolume : 0;
    const tier1Share = totalMixRevenue > 0 ? (rev1 / totalMixRevenue) * 100 : 0;
    const tier2Share = totalMixRevenue > 0 ? (rev2 / totalMixRevenue) * 100 : 0;
    const tier3Share = totalMixRevenue > 0 ? (rev3 / totalMixRevenue) * 100 : 0;

    return {
      // Test Mode
      tr1, tr2, deltaP, deltaQ, deltaTR,
      pctDeltaP, pctDeltaQ, pctDeltaTR,
      arcEd, absArcEd,
      priceEffect, outputEffect,
      elasticityRegime, regimeBadge, pricingStrategy,
      // Linear Mode
      a, b, qMax, pMax, trMax,
      currentP, currentTR, currentMR,
      currentEd, currentAbsEd, revenueGap,
      // Iso-Elastic
      isoQ, isoTR,
      // Multi-Tier
      rev1, rev2, rev3, totalMixRevenue, totalMixVolume, blendedPrice,
      tier1Share, tier2Share, tier3Share
    };
  }, [p1, p2, q1, q2, interceptA, slopeB, currentQ, isoA, isoEpsilon, isoP, tier1P, tier1Q, tier2P, tier2Q, tier3P, tier3Q]);

  // Apply Preset
  const handleApplyPreset = (p: PresetScenario) => {
    setMode(p.mode);
    setP1(p.p1);
    setP2(p.p2);
    setQ1(p.q1);
    setQ2(p.q2);
    setInterceptA(p.interceptA);
    setSlopeB(p.slopeB);
    setCurrentQ(p.currentQ);
    setIsoA(p.isoA);
    setIsoEpsilon(p.isoEpsilon);
    setTier1P(p.tier1P);
    setTier1Q(p.tier1Q);
    setTier2P(p.tier2P);
    setTier2Q(p.tier2Q);
    setTier3P(p.tier3P);
    setTier3Q(p.tier3Q);
  };

  const handleReset = () => {
    handleApplyPreset(PRESETS[0]);
  };

  const copyLaTeX = () => {
    const latex = `\\begin{aligned}
\\text{Total Revenue 1:} & \\quad TR_1 = P_1 \\times Q_1 = ${p1} \\times ${q1} = ${calc.tr1.toLocaleString()} \\\\
\\text{Total Revenue 2:} & \\quad TR_2 = P_2 \\times Q_2 = ${p2} \\times ${q2} = ${calc.tr2.toLocaleString()} \\\\
\\Delta TR & = TR_2 - TR_1 = ${calc.deltaTR >= 0 ? '+' : ''}${calc.deltaTR.toLocaleString()} \\\\
\\text{Arc Elasticity of Demand (Midpoint):} & \\quad E_d = \\frac{\\Delta Q / \\bar{Q}}{\\Delta P / \\bar{P}} = \\frac{${calc.deltaQ} / ${((q1 + q2) / 2).toFixed(1)}}{${calc.deltaP} / ${((p1 + p2) / 2).toFixed(1)}} = ${calc.arcEd.toFixed(2)} \\\\
|E_d| & = ${calc.absArcEd.toFixed(2)} \\implies \\text{${calc.elasticityRegime}} \\\\
\\text{Price Effect:} & \\quad Q_1 \\times \\Delta P = ${q1} \\times (${calc.deltaP}) = ${calc.priceEffect.toLocaleString()} \\\\
\\text{Output Effect:} & \\quad P_2 \\times \\Delta Q = ${p2} \\times (${calc.deltaQ}) = ${calc.outputEffect.toLocaleString()}
\\end{aligned}`;
    navigator.clipboard.writeText(latex);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  // SVG Chart Geometry for Linear Demand Mode (Parabola TR Curve)
  const chartGeometry = useMemo(() => {
    const width = 600;
    const height = 300;
    const padding = { top: 25, right: 35, bottom: 40, left: 65 };

    const maxQ = Math.max(calc.a / calc.b, calc.qMax * 2, 10);
    const maxTR = Math.max(calc.trMax * 1.15, calc.currentTR * 1.2, 100);

    const scaleX = (q: number) => padding.left + (Math.max(0, Math.min(q, maxQ)) / maxQ) * (width - padding.left - padding.right);
    const scaleY = (tr: number) => height - padding.bottom - (Math.max(0, Math.min(tr, maxTR)) / maxTR) * (height - padding.top - padding.bottom);

    // Build SVG Path for TR Parabola: TR = a*q - b*q^2
    const numPoints = 80;
    let pathD = '';
    for (let i = 0; i <= numPoints; i++) {
      const q = (i / numPoints) * (calc.a / calc.b);
      const trVal = Math.max(0, calc.a * q - calc.b * q * q);
      const x = scaleX(q);
      const y = scaleY(trVal);
      if (i === 0) pathD += `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    }

    // Key points
    const peakPt = { x: scaleX(calc.qMax), y: scaleY(calc.trMax) };
    const curPt = { x: scaleX(currentQ), y: scaleY(calc.currentTR) };

    return { width, height, padding, maxQ, maxTR, scaleX, scaleY, pathD, peakPt, curPt };
  }, [calc, currentQ]);

  // 10-Tier Price & Revenue Schedule
  const revenueSchedule = useMemo(() => {
    if (mode === 'linear_demand') {
      const a = calc.a;
      const b = calc.b;
      const qCapacity = a / b;
      const step = qCapacity / 10;
      const tiers = [];

      for (let i = 1; i <= 10; i++) {
        const q = Math.round(i * step);
        const p = Math.max(0, a - b * q);
        const tr = p * q;
        const mr = a - 2 * b * q;
        const edVal = q > 0 ? (1 / b) * (p / q) : 0;
        let regime = 'Unitary';
        let badge = 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40';
        let rec = 'Peak Revenue';

        if (edVal > 1.05) {
          regime = 'Elastic';
          badge = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40';
          rec = 'Cut Price / Expand Q';
        } else if (edVal < 0.95) {
          regime = 'Inelastic';
          badge = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40';
          rec = 'Raise Price / Cut Q';
        }

        tiers.push({
          price: p,
          qty: q,
          tr,
          mr,
          ed: edVal,
          regime,
          badge,
          rec
        });
      }
      return tiers;
    } else {
      // For Two-Point Test Mode: create price sensitivity tiers around P1 and P2
      const baseP = p1 > 0 ? p1 : 50;
      const baseQ = q1 > 0 ? q1 : 1000;
      const elast = calc.absArcEd > 0 ? calc.absArcEd : 1.0;
      const tiers = [];

      for (let i = -4; i <= 5; i++) {
        const testP = Math.max(1, baseP * (1 + i * 0.1));
        const pctP = (testP - baseP) / baseP;
        const testQ = Math.max(0, baseQ * (1 - elast * pctP));
        const testTR = testP * testQ;
        const deltaFromBase = testTR - (baseP * baseQ);

        tiers.push({
          price: testP,
          qty: testQ,
          tr: testTR,
          mr: 0,
          ed: elast,
          regime: elast > 1 ? 'Elastic' : elast < 1 ? 'Inelastic' : 'Unitary',
          badge: elast > 1 ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50',
          rec: deltaFromBase >= 0 ? `+${deltaFromBase.toFixed(0)} TR` : `${deltaFromBase.toFixed(0)} TR`
        });
      }
      return tiers;
    }
  }, [mode, calc, p1, q1]);

  // 5x5 Matrix: Variations in Price (+-20%) vs Quantity (+-20%)
  const sensitivityMatrix = useMemo(() => {
    const pSteps = [-0.2, -0.1, 0, 0.1, 0.2];
    const qSteps = [-0.2, -0.1, 0, 0.1, 0.2];
    const baseP = mode === 'linear_demand' ? calc.currentP : p1;
    const baseQ = mode === 'linear_demand' ? currentQ : q1;

    return pSteps.map(pPct => {
      const tempP = baseP * (1 + pPct);
      const row = qSteps.map(qPct => {
        const tempQ = baseQ * (1 + qPct);
        const tempTR = tempP * tempQ;
        return {
          pPct: Math.round(pPct * 100),
          qPct: Math.round(qPct * 100),
          pVal: tempP,
          qVal: tempQ,
          trVal: tempTR
        };
      });
      return { pPct: Math.round(pPct * 100), row };
    });
  }, [mode, calc.currentP, currentQ, p1, q1]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Total Revenue & Elasticity Suite</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Revenue Test, Linear Demand Parabola & Multi-Tier Portfolio Maximization</p>
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

        {/* Industry Presets Carousel */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Revenue Strategy Preset:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleApplyPreset(p)}
                className={`p-2.5 rounded-2xl border text-left transition-all relative group flex flex-col justify-between ${
                  p1 === p.p1 && p2 === p.p2 && mode === p.mode
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
            onClick={() => setMode('tr_test')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'tr_test'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            1. Total Revenue Test (P1,Q1 → P2,Q2)
          </button>
          <button
            onClick={() => setMode('linear_demand')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'linear_demand'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            2. Linear Demand Parabola (P = a − bQ)
          </button>
          <button
            onClick={() => setMode('iso_elastic')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'iso_elastic'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            3. Constant Iso-Elasticity (Q = A·P^−ε)
          </button>
          <button
            onClick={() => setMode('multi_tier')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'multi_tier'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            4. Multi-Tier Product Portfolio
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results & Visual Graphics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Mode 1: TR Test Inputs */}
          {mode === 'tr_test' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" />
                  Two-Point Price & Volume Shift
                </h3>
                <span className="text-[11px] font-mono text-zinc-500 font-semibold">TR = P × Q</span>
              </div>

              {/* Initial Point (P1, Q1) */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Initial Baseline Point (1)</span>
                  <span className="font-mono text-blue-600">TR1 = {currency}{calc.tr1.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Initial Price (P1)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-zinc-400 font-semibold text-xs">{currency}</span>
                      <input
                        type="number"
                        min="0.01"
                        value={p1}
                        onChange={(e) => setP1(parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Initial Quantity (Q1)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={q1}
                      onChange={(e) => setQ1(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* New Point (P2, Q2) */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-blue-800 dark:text-blue-300">
                  <span>New Adjusted Point (2)</span>
                  <span className="font-mono text-blue-600">TR2 = {currency}{calc.tr2.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      New Price (P2)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-zinc-400 font-semibold text-xs">{currency}</span>
                      <input
                        type="number"
                        min="0.01"
                        value={p2}
                        onChange={(e) => setP2(parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      New Quantity (Q2)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={q2}
                      onChange={(e) => setQ2(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Price & Output Effect Decomposition Box */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  Revenue Shift Decomposition (ΔTR = Price Effect + Output Effect)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500 text-[11px] block">Price Effect (Q1 × ΔP)</span>
                    <span className={`font-mono font-bold ${calc.priceEffect >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {calc.priceEffect >= 0 ? '+' : ''}{currency}{calc.priceEffect.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500 text-[11px] block">Output Effect (P2 × ΔQ)</span>
                    <span className={`font-mono font-bold ${calc.outputEffect >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {calc.outputEffect >= 0 ? '+' : ''}{currency}{calc.outputEffect.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Linear Demand Inputs */}
          {mode === 'linear_demand' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Linear Demand Parameters
                </h3>
                <span className="text-[11px] font-mono text-zinc-500 font-semibold">P = a − b·Q</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Choke Price / Intercept (a)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-zinc-400 font-semibold text-xs">{currency}</span>
                    <input
                      type="number"
                      value={interceptA}
                      onChange={(e) => setInterceptA(parseFloat(e.target.value) || 1)}
                      className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-purple-300 dark:border-purple-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Demand Slope (b)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={slopeB}
                    onChange={(e) => setSlopeB(parseFloat(e.target.value) || 0.01)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-purple-300 dark:border-purple-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Current Operating Output (Q)
                </label>
                <input
                  type="number"
                  value={currentQ}
                  onChange={(e) => setCurrentQ(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-purple-300 dark:border-purple-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Max capacity where P=0 is {(calc.a / calc.b).toFixed(0)} units. Peak TR occurs at Q* = {calc.qMax.toFixed(0)}.
                </span>
              </div>
            </div>
          )}

          {/* Mode 3: Iso-Elastic Inputs */}
          {mode === 'iso_elastic' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Constant Elasticity Function
                </h3>
                <span className="text-[11px] font-mono text-zinc-500 font-semibold">Q = A·P^(−ε)</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Scale Factor (A)
                  </label>
                  <input
                    type="number"
                    value={isoA}
                    onChange={(e) => setIsoA(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Constant Elasticity (ε = |Ed|)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={isoEpsilon}
                    onChange={(e) => setIsoEpsilon(parseFloat(e.target.value) || 0.1)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Unit Price (P) ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-400 font-semibold text-xs">{currency}</span>
                  <input
                    type="number"
                    min="0.01"
                    value={isoP}
                    onChange={(e) => setIsoP(parseFloat(e.target.value) || 0.01)}
                    className="w-full pl-7 pr-3 py-2 bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mode 4: Multi-Tier Inputs */}
          {mode === 'multi_tier' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-600" />
                Product Tier Pricing & Volume
              </h3>

              {/* Tier 1 */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Tier 1 (Starter / Entry)</span>
                  <span className="font-mono text-cyan-600">{currency}{calc.rev1.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Price"
                    value={tier1P}
                    onChange={(e) => setTier1P(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder="Units"
                    value={tier1Q}
                    onChange={(e) => setTier1Q(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              {/* Tier 2 */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Tier 2 (Professional / Mid)</span>
                  <span className="font-mono text-cyan-600">{currency}{calc.rev2.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Price"
                    value={tier2P}
                    onChange={(e) => setTier2P(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder="Units"
                    value={tier2Q}
                    onChange={(e) => setTier2Q(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              {/* Tier 3 */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Tier 3 (Enterprise / Premium)</span>
                  <span className="font-mono text-cyan-600">{currency}{calc.rev3.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Price"
                    value={tier3P}
                    onChange={(e) => setTier3P(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder="Units"
                    value={tier3Q}
                    onChange={(e) => setTier3Q(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Hero Metric Cards & SVG Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Dual Hero Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Total Revenue Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-6 shadow-md">
              <div className="flex items-center justify-between opacity-85 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>
                  {mode === 'tr_test' ? 'Adjusted Revenue (TR2)' : mode === 'linear_demand' ? 'Current Operating TR' : mode === 'multi_tier' ? 'Total Portfolio Revenue' : 'Total Revenue (TR)'}
                </span>
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight my-2">
                {currency}{mode === 'tr_test' ? calc.tr2.toLocaleString() : mode === 'linear_demand' ? calc.currentTR.toLocaleString() : mode === 'multi_tier' ? calc.totalMixRevenue.toLocaleString() : calc.isoTR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-blue-100 flex items-center justify-between pt-2 border-t border-blue-500/40">
                <span>
                  {mode === 'tr_test' ? `Initial TR1: ${currency}${calc.tr1.toLocaleString()}` : mode === 'linear_demand' ? `Peak TR*: ${currency}${calc.trMax.toLocaleString()}` : mode === 'multi_tier' ? `Blended Price: ${currency}${calc.blendedPrice.toFixed(2)}` : `Demand Q: ${calc.isoQ.toFixed(0)} units`}
                </span>
                {mode === 'tr_test' && (
                  <span className={calc.deltaTR >= 0 ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                    {calc.deltaTR >= 0 ? '+' : ''}{calc.pctDeltaTR.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            {/* Elasticity Verdict Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 shadow-md">
              <div className="flex items-center justify-between opacity-85 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Price Elasticity & Verdict</span>
                <Target className="w-4 h-4" />
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight my-2">
                |Ed| = {mode === 'tr_test' ? calc.absArcEd.toFixed(2) : mode === 'linear_demand' ? calc.currentAbsEd.toFixed(2) : mode === 'iso_elastic' ? isoEpsilon.toFixed(2) : 'Portfolio'}
              </div>
              <div className="text-xs text-emerald-100 flex items-center justify-between pt-2 border-t border-emerald-500/40">
                <span className="font-bold">
                  {mode === 'tr_test' ? calc.elasticityRegime : mode === 'linear_demand' ? (calc.currentMR > 0 ? 'Elastic Zone (MR > 0)' : calc.currentMR === 0 ? 'Unitary Peak' : 'Inelastic Zone (MR < 0)') : mode === 'iso_elastic' ? (isoEpsilon > 1 ? 'Elastic Demand' : 'Inelastic Demand') : `${calc.totalMixVolume.toLocaleString()} Total Units`}
                </span>
              </div>
            </div>
          </div>

          {/* Strategic Action Banner */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-start gap-3">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
              <Info className="w-4 h-4" />
            </span>
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">Strategic Pricing Recommendation:</span>
              <p className="text-zinc-600 dark:text-zinc-400">
                {mode === 'tr_test'
                  ? calc.pricingStrategy
                  : mode === 'linear_demand'
                  ? (calc.currentMR > 0
                    ? `Current price (${currency}${calc.currentP.toFixed(2)}) is in the Elastic Region. Lowering price toward ${currency}${calc.pMax.toFixed(2)} will capture up to ${currency}${calc.revenueGap.toLocaleString()} in additional revenue.`
                    : `Current price (${currency}${calc.currentP.toFixed(2)}) is in the Inelastic Region. Raising price toward ${currency}${calc.pMax.toFixed(2)} will eliminate negative marginal revenue and boost total revenue.`)
                  : mode === 'multi_tier'
                  ? `Tier 2 (Professional) contributes ${calc.tier2Share.toFixed(1)}% of top-line revenue, while Enterprise accounts for ${calc.tier3Share.toFixed(1)}%.`
                  : `Constant elasticity ε = ${isoEpsilon}. Total revenue ${isoEpsilon > 1 ? 'decreases as price rises' : 'increases monotonically with price'}.`}
              </p>
            </div>
          </div>

          {/* Continuous Interactive SVG Parabola (Linear Demand Mode) */}
          {mode === 'linear_demand' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-purple-600" />
                  Total Revenue Parabola: TR(Q) = a·Q − b·Q²
                </h4>
                <span className="text-[11px] font-mono font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-lg">
                  Peak TR: {currency}{calc.trMax.toFixed(0)} @ Q={calc.qMax.toFixed(0)}
                </span>
              </div>

              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`} className="w-full h-auto max-h-[300px]">
                  <defs>
                    <linearGradient id="trFillGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
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

                  {/* Shaded Parabola Area */}
                  <path
                    d={`${chartGeometry.pathD} L ${chartGeometry.scaleX(calc.a / calc.b)} ${chartGeometry.scaleY(0)} Z`}
                    fill="url(#trFillGradient)"
                  />

                  {/* TR Parabola Line */}
                  <path
                    d={chartGeometry.pathD}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Peak Marker & Dashed Lines */}
                  <line
                    x1={chartGeometry.peakPt.x}
                    y1={chartGeometry.peakPt.y}
                    x2={chartGeometry.peakPt.x}
                    y2={chartGeometry.height - chartGeometry.padding.bottom}
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={chartGeometry.peakPt.x}
                    cy={chartGeometry.peakPt.y}
                    r="6"
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />

                  {/* Current Operating Point */}
                  <line
                    x1={chartGeometry.curPt.x}
                    y1={chartGeometry.curPt.y}
                    x2={chartGeometry.curPt.x}
                    y2={chartGeometry.height - chartGeometry.padding.bottom}
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={chartGeometry.curPt.x}
                    cy={chartGeometry.curPt.y}
                    r="6"
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />

                  {/* Text Labels */}
                  <text
                    x={chartGeometry.peakPt.x}
                    y={chartGeometry.peakPt.y - 10}
                    fill="#d97706"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    Peak TR: {currency}{calc.trMax.toFixed(0)} (|Ed|=1)
                  </text>
                  <text
                    x={chartGeometry.curPt.x}
                    y={chartGeometry.curPt.y - 10}
                    fill="#2563eb"
                    fontSize="11"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    Current: {currency}{calc.currentTR.toFixed(0)}
                  </text>

                  {/* Axis Titles */}
                  <text
                    x={chartGeometry.width - chartGeometry.padding.right}
                    y={chartGeometry.height - chartGeometry.padding.bottom + 25}
                    fill="#71717a"
                    fontSize="11"
                    textAnchor="end"
                    fontWeight="bold"
                  >
                    Quantity (Q)
                  </text>
                  <text
                    x={chartGeometry.padding.left - 10}
                    y={chartGeometry.padding.top}
                    fill="#71717a"
                    fontSize="11"
                    textAnchor="end"
                    fontWeight="bold"
                  >
                    Total Revenue ({currency})
                  </text>
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 10-Tier Price & Revenue Schedule Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">10-Tier Pricing & Revenue Schedule</h3>
              <p className="text-xs text-zinc-500">Evaluation of Revenue Maximization Across Alternative Price Points</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="p-2.5 font-semibold">Unit Price (P)</th>
                <th className="p-2.5 font-semibold">Quantity (Q)</th>
                <th className="p-2.5 font-semibold text-blue-600 dark:text-blue-400">Total Revenue (TR)</th>
                {mode === 'linear_demand' && <th className="p-2.5 font-semibold">Marginal Revenue (MR)</th>}
                <th className="p-2.5 font-semibold">Elasticity (|Ed|)</th>
                <th className="p-2.5 font-semibold">Regime</th>
                <th className="p-2.5 font-semibold">Strategic Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {revenueSchedule.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-2.5 font-bold">{currency}{row.price.toFixed(2)}</td>
                  <td className="p-2.5">{row.qty.toLocaleString()}</td>
                  <td className="p-2.5 font-bold text-blue-600 dark:text-blue-400">{currency}{row.tr.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  {mode === 'linear_demand' && <td className="p-2.5">{currency}{row.mr.toFixed(2)}</td>}
                  <td className="p-2.5">{row.ed.toFixed(2)}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-sans font-semibold ${row.badge}`}>
                      {row.regime}
                    </span>
                  </td>
                  <td className="p-2.5 font-sans font-medium text-zinc-600 dark:text-zinc-300">{row.rec}</td>
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
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">5×5 Sensitivity Matrix: Total Revenue (TR)</h3>
              <p className="text-xs text-zinc-500">Cross-Analysis of Price Variations (±20%) vs Quantity Variations (±20%)</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left font-semibold text-zinc-500 dark:text-zinc-400">Price Shift \ Volume Shift</th>
                {[-20, -10, 0, 10, 20].map(q => (
                  <th key={q} className="p-2 font-semibold text-zinc-700 dark:text-zinc-300">
                    Volume {q >= 0 ? `+${q}%` : `${q}%`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {sensitivityMatrix.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="p-2 text-left font-sans font-bold text-zinc-700 dark:text-zinc-300">
                    Price {row.pPct >= 0 ? `+${row.pPct}%` : `${row.pPct}%`}
                  </td>
                  {row.row.map((cell, cIdx) => {
                    const isBase = cell.pPct === 0 && cell.qPct === 0;
                    return (
                      <td
                        key={cIdx}
                        className={`p-2.5 rounded-lg transition-all ${
                          isBase
                            ? 'bg-blue-100 dark:bg-blue-900/60 font-black text-blue-900 dark:text-blue-100 ring-2 ring-blue-500'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className="font-bold">{currency}{cell.trVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <div className="text-[10px] text-zinc-400">P={cell.pVal.toFixed(1)}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formal Theoretical Proof & Mathematical Foundations Section */}
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
              <p className="text-xs text-zinc-500">Mathematical proof of the Total Revenue Test, Amoroso-Robinson relation, and revenue maximization</p>
            </div>
          </div>
          {showAdvanced ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
        </button>

        {showAdvanced && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">1. The Total Revenue Test Differential Proof</h4>
                <p>Differentiating Total Revenue with respect to price yields:</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"d(TR)/dP = d(P * Q)/dP = Q + P * (dQ/dP) = Q * [1 + (P/Q)*(dQ/dP)] = Q * [1 - |Ed|]"}
                </div>
                <p>Thus the direction of total revenue depends strictly on elasticity:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>{"If |Ed| > 1: (1 - |Ed|) < 0 => d(TR)/dP < 0 (Price & TR move in opposite directions)."}</li>
                  <li>{"If |Ed| < 1: (1 - |Ed|) > 0 => d(TR)/dP > 0 (Price & TR move in same direction)."}</li>
                  <li>{"If |Ed| = 1: d(TR)/dP = 0 => Total Revenue is maximized."}</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">2. Marginal Revenue & Amoroso-Robinson Relation</h4>
                <p>The relationship between Marginal Revenue ($MR$), Price ($P$), and Elasticity ($|E_d|$):</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"MR = d(TR)/dQ = P + Q * (dP/dQ) = P * [1 - 1/|Ed|]"}
                </div>
                <p>For a linear demand curve $P = a - bQ$, Total Revenue is a quadratic parabola:</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"TR = aQ - bQ^2 => MR = a - 2bQ = 0 => Q* = a / (2b), P* = a / 2, TR* = a^2 / (4b)"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
