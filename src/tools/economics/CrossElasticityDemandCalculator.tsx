import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2, Info,
  TrendingUp, ArrowLeftRight,
  ShieldCheck, Table, Activity,
  Sliders, ChevronDown, ChevronUp,
  Layers, DollarSign, Package
} from 'lucide-react';

type CalculationMode = 'midpoint' | 'standard' | 'linear' | 'simulator';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  pb1: number;
  pb2: number;
  qa1: number;
  qa2: number;
  pa: number;
  goodAName: string;
  goodBName: string;
  expectedXed: string;
  notes: string;
}

export default function CrossElasticityDemandCalculator() {
  // Mode state
  const [mode, setMode] = useState<CalculationMode>('midpoint');
  const [currency, setCurrency] = useState<string>('$');

  // Custom Good Names for personalization
  const [goodAName, setGoodAName] = useState<string>('Good A (Coffee)');
  const [goodBName, setGoodBName] = useState<string>('Good B (Tea)');

  // Input states for Points Mode (Midpoint / Standard)
  const [pb1, setPb1] = useState<number>(50);
  const [pb2, setPb2] = useState<number>(60);
  const [qa1, setQa1] = useState<number>(200);
  const [qa2, setQa2] = useState<number>(240);
  const [unitPriceA, setUnitPriceA] = useState<number>(25);

  // Input states for Linear Cross-Demand Equation: Q_A = a + b * P_B
  const [linearA, setLinearA] = useState<number>(100);
  const [linearB, setLinearB] = useState<number>(2.5); // positive for substitute, negative for complement
  const [evalPb, setEvalPb] = useState<number>(50);

  // Input states for What-If Competitor Simulator Mode
  const [simBasePb, setSimBasePb] = useState<number>(50);
  const [simBaseQa, setSimBaseQa] = useState<number>(200);
  const [simKnownXed, setSimKnownXed] = useState<number>(0.85);
  const [simPriceBChangePct, setSimPriceBChangePct] = useState<number>(15);

  // UI States
  const [copied, setCopied] = useState(false);
  const [showProof, setShowProof] = useState(true);
  const [showSensitivity, setShowSensitivity] = useState(true);

  // Real-world Presets
  const presets: PresetScenario[] = [
    {
      name: '☕ Coffee (A) vs 🍵 Tea (B)',
      category: 'Close Substitutes (XED > 0)',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      goodAName: 'Coffee',
      goodBName: 'Tea',
      pb1: 4.0,
      pb2: 5.0,
      qa1: 500,
      qa2: 590,
      pa: 4.5,
      expectedXed: '+0.74 (Substitute)',
      notes: 'When tea prices rise +25%, caffeine consumers switch to coffee, lifting coffee sales.'
    },
    {
      name: '🍔 McDonald’s (A) vs 👑 Burger King (B)',
      category: 'Strong Brand Substitutes (XED >> 1)',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      goodAName: 'McDonald’s Meal',
      goodBName: 'Burger King Meal',
      pb1: 10.0,
      pb2: 12.0,
      qa1: 1000,
      qa2: 1300,
      pa: 10.0,
      expectedXed: '+1.44 (Strong Substitute)',
      notes: 'Close direct rivals experience sharp cross-brand switching whenever one brand raises prices.'
    },
    {
      name: '🎮 PS5 Console (A) vs 🕹️ Games/Controllers (B)',
      category: 'Strong Complements (XED < 0)',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      goodAName: 'Console Accessories',
      goodBName: 'Game Titles',
      pb1: 70.0,
      pb2: 50.0,
      qa1: 300,
      qa2: 410,
      pa: 65.0,
      expectedXed: '-0.93 (Complement)',
      notes: 'Cheaper AAA game titles motivate gamers to buy more controllers and premium accessories.'
    },
    {
      name: '🖨️ Printers (A) vs 🖋️ Ink Cartridges (B)',
      category: 'Razor & Blade Complements (XED << 0)',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      goodAName: 'Printers',
      goodBName: 'Ink Cartridges',
      pb1: 40.0,
      pb2: 55.0,
      qa1: 150,
      qa2: 100,
      pa: 120.0,
      expectedXed: '-1.27 (Strong Complement)',
      notes: 'Surging ink cartridge prices discourage consumers from purchasing compatible printers.'
    },
    {
      name: '⚡ Electric Cars (A) vs ⛽ Gasoline (B)',
      category: 'Energy Cross-Substitutes (XED > 0)',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      goodAName: 'Electric Vehicles',
      goodBName: 'Gasoline Fuel',
      pb1: 3.5,
      pb2: 4.8,
      qa1: 200,
      qa2: 245,
      pa: 42000,
      expectedXed: '+0.64 (Substitute)',
      notes: 'High fuel costs prompt car buyers to accelerate adoption of electric vehicles.'
    },
    {
      name: '📱 Smartphones (A) vs 🍌 Bananas (B)',
      category: 'Independent Goods (XED = 0)',
      badgeColor: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800',
      goodAName: 'Smartphones',
      goodBName: 'Bananas',
      pb1: 1.5,
      pb2: 2.2,
      qa1: 80,
      qa2: 80,
      pa: 799,
      expectedXed: '0.00 (Unrelated)',
      notes: 'Price fluctuations in unrelated commodities have zero measurable impact on smartphone demand.'
    }
  ];

  const handleApplyPreset = (preset: PresetScenario) => {
    setMode('midpoint');
    setGoodAName(preset.goodAName);
    setGoodBName(preset.goodBName);
    setPb1(preset.pb1);
    setPb2(preset.pb2);
    setQa1(preset.qa1);
    setQa2(preset.qa2);
    setUnitPriceA(preset.pa);
  };

  // Main Calculation Engine
  const calc = useMemo(() => {
    let effectivePb1 = pb1;
    let effectivePb2 = pb2;
    let effectiveQa1 = qa1;
    let effectiveQa2 = qa2;
    let rawXed = 0;
    let pctQa = 0;
    let pctPb = 0;
    let avgQa = 0;
    let avgPb = 0;
    let deltaQa = 0;
    let deltaPb = 0;

    if (mode === 'midpoint') {
      deltaQa = qa2 - qa1;
      deltaPb = pb2 - pb1;
      avgQa = (qa1 + qa2) / 2;
      avgPb = (pb1 + pb2) / 2;
      pctQa = avgQa !== 0 ? (deltaQa / avgQa) * 100 : 0;
      pctPb = avgPb !== 0 ? (deltaPb / avgPb) * 100 : 0;
      rawXed = pctPb !== 0 ? pctQa / pctPb : 0;
    } else if (mode === 'standard') {
      deltaQa = qa2 - qa1;
      deltaPb = pb2 - pb1;
      pctQa = qa1 !== 0 ? (deltaQa / qa1) * 100 : 0;
      pctPb = pb1 !== 0 ? (deltaPb / pb1) * 100 : 0;
      rawXed = pctPb !== 0 ? pctQa / pctPb : 0;
    } else if (mode === 'linear') {
      // Q_A = a + b * P_B
      effectivePb1 = evalPb;
      effectiveQa1 = Math.max(0.001, linearA + linearB * evalPb);
      const nextPb = evalPb * 1.05; // 5% shift for demonstration
      effectivePb2 = nextPb;
      effectiveQa2 = Math.max(0.001, linearA + linearB * nextPb);
      deltaPb = nextPb - evalPb;
      deltaQa = effectiveQa2 - effectiveQa1;
      pctPb = 5.0;
      pctQa = effectiveQa1 !== 0 ? (deltaQa / effectiveQa1) * 100 : 0;
      // Point XED = b * (P_B / Q_A)
      rawXed = effectiveQa1 > 0 ? linearB * (evalPb / effectiveQa1) : 0;
    } else if (mode === 'simulator') {
      effectivePb1 = simBasePb;
      effectiveQa1 = simBaseQa;
      pctPb = simPriceBChangePct;
      pctQa = simKnownXed * pctPb;
      effectivePb2 = effectivePb1 * (1 + pctPb / 100);
      effectiveQa2 = Math.max(0, effectiveQa1 * (1 + pctQa / 100));
      deltaPb = effectivePb2 - effectivePb1;
      deltaQa = effectiveQa2 - effectiveQa1;
      rawXed = simKnownXed;
    }

    const xed = isNaN(rawXed) || !isFinite(rawXed) ? 0 : rawXed;

    // Economic Relationship Typology
    let relationship: 'strong_substitute' | 'weak_substitute' | 'independent' | 'weak_complement' | 'strong_complement' = 'independent';
    let category = '';
    let categoryDesc = '';
    let badgeClass = '';
    let strategicAdvice = '';
    let pricingRecommendation = '';

    if (xed > 1.0) {
      relationship = 'strong_substitute';
      category = 'Strong Substitutes (XED > +1.0)';
      categoryDesc = `Consumers readily substitute between ${goodAName} and ${goodBName}. High cross-price elasticity indicates intense direct competition.`;
      badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      strategicAdvice = `Price Match Alert: If ${goodBName} lowers price, ${goodAName} will suffer heavy volume loss unless matched or differentiated by brand/quality.`;
      pricingRecommendation = 'Differentiate value proposition, build loyalty moats, or execute aggressive promotional counter-pricing.';
    } else if (xed > 0.1) {
      relationship = 'weak_substitute';
      category = 'Moderate Substitutes (0 < XED ≤ +1.0)';
      categoryDesc = `${goodAName} and ${goodBName} serve similar consumer needs with moderate cross-switching upon price adjustments.`;
      badgeClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      strategicAdvice = `Moderate competitive exposure: A price hike in ${goodBName} gives ${goodAName} an opportunity to capture spillover demand without aggressive discounting.`;
      pricingRecommendation = 'Optimize capacity to capture spillover demand during competitor price hikes; maintain steady premium margins.';
    } else if (xed < -1.0) {
      relationship = 'strong_complement';
      category = 'Strong Complements (XED < -1.0)';
      categoryDesc = `${goodAName} and ${goodBName} are heavily consumed together. A price hike in one sharply depresses demand for the other.`;
      badgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      strategicAdvice = `Tied Ecosystem Risk: High prices of ${goodBName} create a bottleneck on ${goodAName} sales.`;
      pricingRecommendation = 'Implement bundled pricing, joint promotional discounts, or subsidized entry-point (razor & blade) pricing.';
    } else if (xed < -0.1) {
      relationship = 'weak_complement';
      category = 'Weak Complements (-1.0 ≤ XED < 0)';
      categoryDesc = `${goodAName} and ${goodBName} enhance each other mildly. Demand shifts moderately in the opposite direction of cross-price moves.`;
      badgeClass = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      strategicAdvice = `Synergistic relationship: Promoting or discounting ${goodBName} creates positive indirect tailwinds for ${goodAName}.`;
      pricingRecommendation = 'Cross-merchandise, recommend companion bundles, and coordinate marketing campaigns.';
    } else {
      relationship = 'independent';
      category = 'Independent / Unrelated Goods (XED ≈ 0)';
      categoryDesc = `No meaningful economic link exists between ${goodAName} and ${goodBName}. Price fluctuations in one do not impact the other.`;
      badgeClass = 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
      strategicAdvice = 'Zero cross-price correlation. Set independent pricing without monitoring competitor actions for this product.';
      pricingRecommendation = 'Price strictly based on direct own-price elasticity (PED) and internal margin targets.';
    }

    // Revenue Calculations for Good A
    const trA1 = effectiveQa1 * unitPriceA;
    const trA2 = effectiveQa2 * unitPriceA;
    const trDeltaA = trA2 - trA1;
    const trPctA = trA1 > 0 ? (trDeltaA / trA1) * 100 : 0;

    // Spectrum Mapping (-2.0 to +2.0) -> (0% to 100%)
    const clampedXed = Math.max(-2.0, Math.min(2.0, xed));
    const spectrumPercent = ((clampedXed + 2.0) / 4.0) * 100;

    return {
      pb1: effectivePb1,
      pb2: effectivePb2,
      qa1: effectiveQa1,
      qa2: effectiveQa2,
      deltaPb,
      deltaQa,
      pctPb,
      pctQa,
      avgPb,
      avgQa,
      xed,
      relationship,
      category,
      categoryDesc,
      badgeClass,
      strategicAdvice,
      pricingRecommendation,
      trA1,
      trA2,
      trDeltaA,
      trPctA,
      spectrumPercent
    };
  }, [mode, goodAName, goodBName, pb1, pb2, qa1, qa2, unitPriceA, linearA, linearB, evalPb, simBasePb, simBaseQa, simKnownXed, simPriceBChangePct]);

  // Sensitivity Matrix (Testing Good B Price Shocks from -30% to +30%)
  const sensitivityTable = useMemo(() => {
    const shifts = [-30, -20, -15, -10, -5, 0, 5, 10, 15, 20, 30];
    const basePb = calc.pb1;
    const baseQa = calc.qa1;
    const elasticity = calc.xed;

    return shifts.map((pctShift) => {
      const simPb = basePb * (1 + pctShift / 100);
      const simPctQa = elasticity * pctShift;
      const simQa = Math.max(0, baseQa * (1 + simPctQa / 100));
      const simTrA = simQa * unitPriceA;
      const deltaTrA = simTrA - calc.trA1;
      const pctTrA = calc.trA1 > 0 ? (deltaTrA / calc.trA1) * 100 : 0;

      return {
        pctShift,
        priceB: simPb,
        quantityA: simQa,
        pctQa: simPctQa,
        revenueA: simTrA,
        deltaTrA,
        pctTrA,
        isBase: pctShift === 0
      };
    });
  }, [calc.pb1, calc.qa1, calc.xed, calc.trA1, unitPriceA]);

  // Copy Full Proof Handler
  const handleCopyProof = () => {
    const text = `=========================================
Cross Price Elasticity of Demand (XED) Analysis
=========================================
Products: ${goodAName} (Good A) vs ${goodBName} (Good B)
Calculation Method: ${mode.toUpperCase()}
Good B Initial Price (P_B1): {currency}{calc.pb1.toFixed(2)} | New Price (P_B2): {currency}{calc.pb2.toFixed(2)} (ΔP_B = ${calc.deltaPb >= 0 ? '+' : ''}{currency}{calc.deltaPb.toFixed(2)}, ${calc.pctPb.toFixed(2)}%)
Good A Initial Demand (Q_A1): ${calc.qa1.toFixed(1)} units | New Demand (Q_A2): ${calc.qa2.toFixed(1)} units (ΔQ_A = ${calc.deltaQa >= 0 ? '+' : ''}${calc.deltaQa.toFixed(1)}, ${calc.pctQa.toFixed(2)}%)

RESULTS:
• XED Coefficient: ${calc.xed.toFixed(3)}
• Relationship Classification: ${calc.category}
• Economic Meaning: ${calc.categoryDesc}

REVENUE IMPACT ON GOOD A (at ${currency}${unitPriceA.toFixed(2)}/unit):
• Initial Total Revenue (TR_A1): ${currency}{calc.trA1.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• New Total Revenue (TR_A2): ${currency}{calc.trA2.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• Net Revenue Impact: ${calc.trDeltaA >= 0 ? '+$' : '-$'}${Math.abs(calc.trDeltaA).toLocaleString(undefined, { minimumFractionDigits: 2 })} (${calc.trPctA >= 0 ? '+' : ''}${calc.trPctA.toFixed(2)}%)

STRATEGIC COMPETITIVE PRICING RECOMMENDATION:
• ${calc.strategicAdvice}
• Action Plan: ${calc.pricingRecommendation}

Generated via Toolique Economics Suite (https://www.toolique.in/economics/cross-elasticity-demand-calculator)
=========================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGoodAName('Good A (Coffee)');
    setGoodBName('Good B (Tea)');
    setPb1(50);
    setPb2(60);
    setQa1(200);
    setQa2(240);
    setUnitPriceA(25);
    setLinearA(100);
    setLinearB(2.5);
    setEvalPb(50);
    setSimBasePb(50);
    setSimBaseQa(200);
    setSimKnownXed(0.85);
    setSimPriceBChangePct(15);
    setMode('midpoint');
  };

  // SVG Cross-Demand Curve Coordinate Math
  const svgWidth = 440;
  const svgHeight = 280;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;

  const graphWidth = svgWidth - padLeft - padRight;
  const graphHeight = svgHeight - padTop - padBottom;

  const maxPlotPb = Math.max(calc.pb1, calc.pb2) * 1.35 || 100;
  const maxPlotQa = Math.max(calc.qa1, calc.qa2) * 1.35 || 300;

  const getSvgX = (qaVal: number) => padLeft + (Math.max(0, qaVal) / maxPlotQa) * graphWidth;
  const getSvgY = (pbVal: number) => padTop + graphHeight - (Math.max(0, pbVal) / maxPlotPb) * graphHeight;

  const pt1X = getSvgX(calc.qa1);
  const pt1Y = getSvgY(calc.pb1);
  const pt2X = getSvgX(calc.qa2);
  const pt2Y = getSvgY(calc.pb2);

  // Generate continuous Cross-Demand curve path points
  const curvePoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const steps = 30;
    const basePb = calc.pb1;
    const baseQa = calc.qa1;
    const xedVal = calc.xed;

    for (let i = 0; i <= steps; i++) {
      const curPb = (maxPlotPb * i) / steps;
      if (curPb <= 0) {
        pts.push({ x: getSvgX(0), y: getSvgY(0) });
        continue;
      }
      let curQa = 0;
      if (mode === 'linear') {
        curQa = Math.max(0, linearA + linearB * curPb);
      } else {
        if (basePb > 0 && baseQa > 0) {
          if (xedVal === 0) {
            curQa = baseQa;
          } else {
            // Linear approximation: Q_A(P_B) = Q_A0 * (1 + XED * (P_B - P_B0)/P_B0)
            curQa = Math.max(0, baseQa * (1 + xedVal * ((curPb - basePb) / basePb)));
          }
        }
      }
      pts.push({ x: getSvgX(curQa), y: getSvgY(curPb) });
    }
    return pts;
  }, [maxPlotPb, calc.pb1, calc.qa1, calc.xed, mode, linearA, linearB]);

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
            <Sparkles className="w-4 h-4 text-purple-500" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Empirical Market Presets
              </span>
              <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                Click any industry pair to prefill realistic market values
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
              className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 hover:border-purple-300 dark:hover:border-purple-800 text-left transition group cursor-pointer"
            >
              <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 truncate">
                {p.name}
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate font-mono">
                {p.expectedXed}
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
              ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs'
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
              ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs'
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
              ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Linear Cross-Demand Function</span>
        </button>

        <button
          onClick={() => setMode('simulator')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'simulator'
              ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Competitor Shock Simulator</span>
        </button>
      </div>

      {/* 3. Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              <span>Input Parameters</span>
            </h2>
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-lg">
              {mode.toUpperCase()} MODE
            </span>
          </div>

          {/* Product Label Names */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">Your Product (Good A)</label>
              <input
                type="text"
                value={goodAName}
                onChange={(e) => setGoodAName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-zinc-500 mb-1">Competitor / Cross Product (Good B)</label>
              <input
                type="text"
                value={goodBName}
                onChange={(e) => setGoodBName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {/* Conditional Inputs by Mode */}
          {(mode === 'midpoint' || mode === 'standard') && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-purple-500" />
                  Price of {goodBName} ({currency}P_B)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Initial Price (P_B₁)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={pb1}
                      onChange={(e) => setPb1(Math.max(0.01, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">New Price (P_B₂)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={pb2}
                      onChange={(e) => setPb2(Math.max(0.01, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-indigo-500" />
                  Quantity Demanded of {goodAName} (Q_A)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Initial Demand (Q_A₁)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={qa1}
                      onChange={(e) => setQa1(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">New Demand (Q_A₂)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={qa2}
                      onChange={(e) => setQa2(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Unit Price of {goodAName} ({currency}P_A - for revenue calculation)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={unitPriceA}
                  onChange={(e) => setUnitPriceA(Math.max(0.01, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {mode === 'linear' && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-3">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Cross-Demand Equation: Q_A = a + b · P_B
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Autonomous Demand (a)</label>
                    <input
                      type="number"
                      step="any"
                      value={linearA}
                      onChange={(e) => setLinearA(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                      Cross Slope (b: + for Sub, - for Comp)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={linearB}
                      onChange={(e) => setLinearB(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Evaluation Price of Good B ({currency}P_B)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={evalPb}
                  onChange={(e) => setEvalPb(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Unit Price of {goodAName} ({currency}P_A)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={unitPriceA}
                  onChange={(e) => setUnitPriceA(Math.max(0.01, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {mode === 'simulator' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Base Price {goodBName} ({currency}P_B₁)</label>
                  <input
                    type="number"
                    min="0.01"
                    value={simBasePb}
                    onChange={(e) => setSimBasePb(Math.max(0.01, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Base Demand {goodAName} (Q_A₁)</label>
                  <input
                    type="number"
                    min="0"
                    value={simBaseQa}
                    onChange={(e) => setSimBaseQa(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Known / Estimated XED</label>
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">{simKnownXed.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2.0"
                  max="2.0"
                  step="0.05"
                  value={simKnownXed}
                  onChange={(e) => setSimKnownXed(parseFloat(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-0.5 font-mono">
                  <span>-2.0 (Complement)</span>
                  <span>0.0 (Unrelated)</span>
                  <span>+2.0 (Substitute)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Competitor Price Change (%ΔP_B)</label>
                  <span className={`text-xs font-mono font-bold ${simPriceBChangePct >= 0 ? 'text-purple-600' : 'text-rose-600'}`}>
                    {simPriceBChangePct >= 0 ? '+' : ''}{simPriceBChangePct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={simPriceBChangePct}
                  onChange={(e) => setSimPriceBChangePct(parseInt(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Unit Price of {goodAName} ({currency}P_A)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={unitPriceA}
                  onChange={(e) => setUnitPriceA(Math.max(0.01, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Quick Summary Card */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 text-xs">
            <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
              <span>Price Movement (Good B):</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">{currency}{calc.pb1.toFixed(2)} → {currency}{calc.pb2.toFixed(2)} ({calc.pctPb >= 0 ? '+' : ''}{calc.pctPb.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
              <span>Demand Movement (Good A):</span>
              <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                {calc.qa1.toFixed(1)} → {calc.qa2.toFixed(1)} units ({calc.pctQa >= 0 ? '+' : ''}{calc.pctQa.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-700 pt-2">
              <span>Revenue Impact on {goodAName}:</span>
              <span className={`font-mono font-semibold ${calc.trDeltaA >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {calc.trDeltaA >= 0 ? '+$' : '-$'}{Math.abs(calc.trDeltaA).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({calc.trPctA >= 0 ? '+' : ''}{calc.trPctA.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right Results & Visualizations Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Result Box */}
          <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-zinc-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs uppercase font-black tracking-widest text-purple-300 flex items-center gap-1.5">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Cross-Price Elasticity (XED)
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md ${calc.badgeClass}`}>
                  {calc.category}
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                  {calc.xed >= 0 ? `+${calc.xed.toFixed(3)}` : calc.xed.toFixed(3)}
                </div>
                <div className="text-xs text-purple-200 font-mono">
                  {calc.relationship === 'strong_substitute' && 'Direct Brand Substitute'}
                  {calc.relationship === 'weak_substitute' && 'Moderate Substitute'}
                  {calc.relationship === 'independent' && 'Independent / Zero Elasticity'}
                  {calc.relationship === 'weak_complement' && 'Companion Complement'}
                  {calc.relationship === 'strong_complement' && 'Tied / System Complement'}
                </div>
              </div>

              {/* Elasticity Spectrum Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-purple-200">
                  <span>Complements (&lt;0)</span>
                  <span>Unrelated (0)</span>
                  <span>Substitutes (&gt;0)</span>
                </div>
                <div className="relative h-3 rounded-full bg-white/10 overflow-hidden border border-white/10 p-0.5">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-zinc-400 to-emerald-400 opacity-70" />
                  {/* Marker Pin */}
                  <div
                    className="absolute top-0 bottom-0 w-2.5 bg-white rounded-full shadow-md border border-zinc-900 transition-all duration-300"
                    style={{ left: `calc(${Math.min(97, Math.max(2, calc.spectrumPercent))}% - 5px)` }}
                  />
                </div>
              </div>

              {/* Strategic Insights Box */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1.5">
                <div className="text-xs font-semibold text-purple-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-300" />
                  <span>Strategic Competitive Action Plan</span>
                </div>
                <p className="text-xs text-purple-50 leading-relaxed">
                  {calc.strategicAdvice}
                </p>
                <div className="text-[11px] text-purple-200/90 pt-1 border-t border-white/10">
                  <strong>Recommended Move:</strong> {calc.pricingRecommendation}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">Price Shift (%ΔP_B)</div>
              <div className={`text-lg font-black font-mono mt-1 ${calc.pctPb >= 0 ? 'text-purple-600' : 'text-rose-600'}`}>
                {calc.pctPb >= 0 ? '+' : ''}{calc.pctPb.toFixed(2)}%
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">Demand Shift (%ΔQ_A)</div>
              <div className={`text-lg font-black font-mono mt-1 ${calc.pctQa >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {calc.pctQa >= 0 ? '+' : ''}{calc.pctQa.toFixed(2)}%
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">Old Revenue (TR_A₁ {currency})</div>
              <div className="text-lg font-black font-mono text-zinc-900 dark:text-white mt-1">{currency}{calc.trA1.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">New Revenue (TR_A₂ {currency})</div>
              <div className={`text-lg font-black font-mono mt-1 ${calc.trDeltaA >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{currency}{calc.trA2.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Interactive SVG Cross-Demand Curve Graph */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Interactive Cross-Demand Curve (P_B vs Q_A)
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Slope: {calc.xed > 0 ? 'Positive (Substitutes)' : calc.xed < 0 ? 'Negative (Complements)' : 'Vertical (Independent)'}
              </span>
            </div>

            <div className="w-full flex justify-center bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl p-2 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[480px] h-auto select-none font-mono">
                <defs>
                  <linearGradient id="xedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6366f1" />
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
                  Demand for {goodAName} (Q_A) →
                </text>
                <text transform={`rotate(-90 15 ${padTop + graphHeight / 2})`} x={15} y={padTop + graphHeight / 2} textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="bold">
                  Price of {goodBName} ({currency}P_B) →
                </text>

                {/* Continuous Cross-Demand Curve Path */}
                {curvePathData && (
                  <path d={curvePathData} fill="none" stroke="url(#xedGrad)" strokeWidth="3" strokeLinecap="round" />
                )}

                {/* Point 1 Projections & Marker */}
                <line x1={padLeft} y1={pt1Y} x2={pt1X} y2={pt1Y} stroke="#a855f7" strokeDasharray="3 3" strokeOpacity="0.6" />
                <line x1={pt1X} y1={padTop + graphHeight} x2={pt1X} y2={pt1Y} stroke="#a855f7" strokeDasharray="3 3" strokeOpacity="0.6" />
                <circle cx={pt1X} cy={pt1Y} r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
                <text x={pt1X + 8} y={pt1Y - 6} fill="#a855f7" fontSize="10" fontWeight="bold">
                  (Q_A₁, P_B₁)
                </text>

                {/* Point 2 Projections & Marker */}
                <line x1={padLeft} y1={pt2Y} x2={pt2X} y2={pt2Y} stroke="#6366f1" strokeDasharray="3 3" strokeOpacity="0.6" />
                <line x1={pt2X} y1={padTop + graphHeight} x2={pt2X} y2={pt2Y} stroke="#6366f1" strokeDasharray="3 3" strokeOpacity="0.6" />
                <circle cx={pt2X} cy={pt2Y} r="5" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
                <text x={pt2X + 8} y={pt2Y - 6} fill="#6366f1" fontSize="10" fontWeight="bold">
                  (Q_A₂, P_B₂)
                </text>
              </svg>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
              The Cross-Demand curve illustrates how price adjustments in {goodBName} directly expand or contract sales of {goodAName}.
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
            <Info className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-purple-600 transition">
              Step-by-Step Mathematical Proof & XED Formulation
            </span>
          </div>
          {showProof ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showProof && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 font-mono text-xs">
            {/* Step 1 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 1: Identify Price & Quantity Coordinates</span>
              <div className="text-zinc-900 dark:text-zinc-200">
                Initial: Price of {goodBName} (P_B₁) = {currency}{calc.pb1.toFixed(2)}, Demand for {goodAName} (Q_A₁) = {calc.qa1.toFixed(1)} units
              </div>
              <div className="text-zinc-900 dark:text-zinc-200">
                New: Price of {goodBName} (P_B₂) = {currency}{calc.pb2.toFixed(2)}, Demand for {goodAName} (Q_A₂) = {calc.qa2.toFixed(1)} units
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 2: Compute Absolute & Percentage Shifts</span>
              <div className="text-zinc-900 dark:text-zinc-200">
                ΔP_B = P_B₂ - P_B₁ = {currency}{calc.pb2.toFixed(2)} - {currency}{calc.pb1.toFixed(2)} = {calc.deltaPb >= 0 ? '+' : ''}${calc.deltaPb.toFixed(2)}
              </div>
              <div className="text-zinc-900 dark:text-zinc-200">
                ΔQ_A = Q_A₂ - Q_A₁ = {calc.qa2.toFixed(1)} - {calc.qa1.toFixed(1)} = {calc.deltaQa >= 0 ? '+' : ''}{calc.deltaQa.toFixed(1)} units
              </div>
              {mode === 'midpoint' ? (
                <div className="text-purple-700 dark:text-purple-300 font-semibold pt-1">
                  Midpoints: P_B(avg) = ${calc.avgPb.toFixed(2)}, Q_A(avg) = {calc.avgQa.toFixed(2)} → %ΔP_B = {calc.pctPb.toFixed(2)}%, %ΔQ_A = {calc.pctQa.toFixed(2)}%
                </div>
              ) : (
                <div className="text-purple-700 dark:text-purple-300 font-semibold pt-1">
                  Base Changes: %ΔP_B = ({calc.deltaPb.toFixed(2)} / {calc.pb1}) × 100 = {calc.pctPb.toFixed(2)}%, %ΔQ_A = ({calc.deltaQa.toFixed(2)} / {calc.qa1}) × 100 = {calc.pctQa.toFixed(2)}%
                </div>
              )}
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 3: Cross Elasticity Formula Evaluation</span>
              <div className="text-zinc-900 dark:text-zinc-200 font-bold">
                XED = %ΔQ_A / %ΔP_B = ({calc.pctQa.toFixed(4)}%) / ({calc.pctPb.toFixed(4)}%) = <span className="text-purple-600 dark:text-purple-400">{calc.xed.toFixed(4)}</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 4: Economic Relationship Diagnosis</span>
              <div className="text-zinc-900 dark:text-zinc-200 font-semibold">
                Result: <span className="text-purple-600 dark:text-purple-400">{calc.category}</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 font-sans text-xs">
                {calc.categoryDesc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. Competitor Shock & Sensitivity Matrix (Collapsible) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <button
          onClick={() => setShowSensitivity(!showSensitivity)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-purple-600 transition">
              Competitor Price Sensitivity Matrix (±30% Price Shocks of {goodBName})
            </span>
          </div>
          {showSensitivity ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showSensitivity && (
          <div className="overflow-x-auto pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-mono">
                  <th className="py-2.5 px-3">Price Move ({goodBName})</th>
                  <th className="py-2.5 px-3">Simulated Price ({currency}P_B)</th>
                  <th className="py-2.5 px-3">Projected Demand ({goodAName})</th>
                  <th className="py-2.5 px-3">Demand Shift (%ΔQ_A)</th>
                  <th className="py-2.5 px-3">Projected Revenue ({currency}TR_A)</th>
                  <th className="py-2.5 px-3">Revenue Impact (ΔTR_A {currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                {sensitivityTable.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${
                      row.isBase ? 'bg-purple-50/70 dark:bg-purple-950/30 font-bold' : ''
                    }`}
                  >
                    <td className={`py-2 px-3 ${row.pctShift > 0 ? 'text-purple-600' : row.pctShift < 0 ? 'text-rose-600' : 'text-zinc-600'}`}>
                      {row.pctShift > 0 ? `+${row.pctShift}%` : `${row.pctShift}%`} {row.isBase && '(Baseline)'}
                    </td>
                    <td className="py-2 px-3 text-zinc-800 dark:text-zinc-200">{currency}{row.priceB.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-zinc-900 dark:text-white font-bold">
                      {row.quantityA.toFixed(1)} units
                    </td>
                    <td className={`py-2 px-3 ${row.pctQa > 0 ? 'text-emerald-600' : row.pctQa < 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
                      {row.pctQa > 0 ? `+${row.pctQa.toFixed(1)}%` : `${row.pctQa.toFixed(1)}%`}
                    </td>
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{currency}{row.revenueA.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className={`py-2 px-3 ${row.deltaTrA >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {row.deltaTrA >= 0 ? '+$' : '-$'}{Math.abs(row.deltaTrA).toLocaleString(undefined, { maximumFractionDigits: 0 })} ({row.pctTrA >= 0 ? '+' : ''}{row.pctTrA.toFixed(1)}%)
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