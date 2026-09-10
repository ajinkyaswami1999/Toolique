import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2, Info,
  TrendingUp,
  ShieldCheck, Table,
  Sliders, ChevronDown, ChevronUp,
  Target, Calculator,
  ArrowRight, Compass, LineChart, Zap
} from 'lucide-react';

type CalculationMode = 'discrete' | 'linear_demand' | 'amoroso' | 'schedule';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  p1: number;
  p2: number;
  q1: number;
  q2: number;
  tr1: number;
  tr2: number;
  chokePriceA: number;
  slopeB: number;
  evalQ: number;
  amorosoPrice: number;
  amorosoElasticity: number;
  marginalCost: number;
  expectedMr: string;
  notes: string;
}

export default function MarginalRevenueCalculator() {
  // Mode state
  const [mode, setMode] = useState<CalculationMode>('discrete');
  const [currency, setCurrency] = useState<string>('$');

  // Input states for Discrete Mode (Two-point output)
  const [inputMethod, setInputMethod] = useState<'total_revenue' | 'price_quantity'>('price_quantity');
  const [p1, setP1] = useState<number>(100);
  const [p2, setP2] = useState<number>(90);
  const [q1, setQ1] = useState<number>(200);
  const [q2, setQ2] = useState<number>(250);
  const [tr1, setTr1] = useState<number>(20000);
  const [tr2, setTr2] = useState<number>(22500);

  // Input states for Linear Inverse Demand Mode: P(Q) = a - b*Q
  const [chokePriceA, setChokePriceA] = useState<number>(500);
  const [slopeB, setSlopeB] = useState<number>(1.25);
  const [evalQ, setEvalQ] = useState<number>(120);

  // Input states for Amoroso-Robinson Mode: MR = P * (1 - 1 / |Ed|)
  const [amorosoPrice, setAmorosoPrice] = useState<number>(150);
  const [amorosoElasticity, setAmorosoElasticity] = useState<number>(2.5);
  const [amorosoQ, setAmorosoQ] = useState<number>(500);

  // Universal Profit Maximization Input: Marginal Cost (MC)
  const [marginalCost, setMarginalCost] = useState<number>(45);

  // Schedule Simulation Mode Inputs
  const [scheduleBasePrice, setScheduleBasePrice] = useState<number>(200);
  const [scheduleBaseQ, setScheduleBaseQ] = useState<number>(100);
  const [scheduleDiscountPerStep, setScheduleDiscountPerStep] = useState<number>(15);
  const [scheduleQIncrement, setScheduleQIncrement] = useState<number>(50);

  // UI States
  const [copied, setCopied] = useState(false);
  const [showProof, setShowProof] = useState(true);
  const [showSensitivity, setShowSensitivity] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // 6 Real-World Industry Presets
  const presets: PresetScenario[] = [
    {
      name: '📱 SaaS Enterprise Platform',
      category: 'Software Monopoly / Platform',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      mode: 'linear_demand',
      p1: 400,
      p2: 350,
      q1: 1000,
      q2: 1200,
      tr1: 400000,
      tr2: 420000,
      chokePriceA: 800,
      slopeB: 0.35,
      evalQ: 800,
      amorosoPrice: 520,
      amorosoElasticity: 2.8,
      marginalCost: 25,
      expectedMr: '$240.00 / seat',
      notes: 'Near-zero marginal cost allows aggressive price discrimination down the linear demand curve.'
    },
    {
      name: '🌾 Commodity Grain Farmer',
      category: 'Perfect Competition (Price Taker)',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      mode: 'discrete',
      p1: 8.50,
      p2: 8.50,
      q1: 10000,
      q2: 15000,
      tr1: 85000,
      tr2: 127500,
      chokePriceA: 8.50,
      slopeB: 0.000001,
      evalQ: 10000,
      amorosoPrice: 8.50,
      amorosoElasticity: 9999,
      marginalCost: 6.20,
      expectedMr: '$8.50 / bushel (MR = P)',
      notes: 'Under perfect competition, price is constant regardless of output volume, meaning MR = AR = P.'
    },
    {
      name: '⚡ EV Ultra-Fast Charging Station',
      category: 'Dynamic Peak-Load Pricing',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      mode: 'amoroso',
      p1: 0.48,
      p2: 0.40,
      q1: 25000,
      q2: 32000,
      tr1: 12000,
      tr2: 12800,
      chokePriceA: 0.85,
      slopeB: 0.000015,
      evalQ: 28000,
      amorosoPrice: 0.45,
      amorosoElasticity: 1.85,
      marginalCost: 0.18,
      expectedMr: '$0.21 / kWh',
      notes: 'Price elasticity of 1.85 produces positive MR; lowering off-peak rates captures grid capacity surpluses.'
    },
    {
      name: '✈️ Transcontinental Airline Route',
      category: 'Yield Management & Tiering',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      mode: 'linear_demand',
      p1: 380,
      p2: 310,
      q1: 120,
      q2: 160,
      tr1: 45600,
      tr2: 49600,
      chokePriceA: 650,
      slopeB: 2.20,
      evalQ: 140,
      amorosoPrice: 342,
      amorosoElasticity: 1.5,
      marginalCost: 85,
      expectedMr: '$34.00 / seat',
      notes: 'Seat yield algorithms balance high-fare business travelers against discounted leisure fliers to keep MR > MC.'
    },
    {
      name: '☕ Specialty Coffee & Micro-Roaster',
      category: 'Monopolistic Competition',
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      mode: 'discrete',
      p1: 5.50,
      p2: 4.80,
      q1: 800,
      q2: 1050,
      tr1: 4400,
      tr2: 5040,
      chokePriceA: 10.0,
      slopeB: 0.005,
      evalQ: 900,
      amorosoPrice: 5.20,
      amorosoElasticity: 2.1,
      marginalCost: 1.80,
      expectedMr: '$2.56 / cup',
      notes: 'Brand loyalty grants pricing power, but discounting coffee creates positive incremental revenue.'
    },
    {
      name: '💊 Specialty Biotech Drug Treatment',
      category: 'Patent Protected Monopoly',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      mode: 'amoroso',
      p1: 1800,
      p2: 1750,
      q1: 500,
      q2: 510,
      tr1: 900000,
      tr2: 892500,
      chokePriceA: 3500,
      slopeB: 3.2,
      evalQ: 520,
      amorosoPrice: 1850,
      amorosoElasticity: 0.65,
      marginalCost: 120,
      expectedMr: '-$996.15 / dose (Inelastic)',
      notes: 'Inelastic demand (|Ed| = 0.65 < 1) yields negative MR; cutting prices destroys total revenue.'
    }
  ];

  const handleApplyPreset = (preset: PresetScenario) => {
    setMode(preset.mode);
    setP1(preset.p1);
    setP2(preset.p2);
    setQ1(preset.q1);
    setQ2(preset.q2);
    setTr1(preset.tr1);
    setTr2(preset.tr2);
    setChokePriceA(preset.chokePriceA);
    setSlopeB(preset.slopeB);
    setEvalQ(preset.evalQ);
    setAmorosoPrice(preset.amorosoPrice);
    setAmorosoElasticity(preset.amorosoElasticity);
    setMarginalCost(preset.marginalCost);
  };

  // Main Comprehensive Calculation Engine
  const calc = useMemo(() => {
    let effectiveQ1 = q1;
    let effectiveQ2 = q2;
    let effectiveTr1 = tr1;
    let effectiveTr2 = tr2;
    let effectiveP1 = p1;
    let effectiveP2 = p2;
    let rawMr = 0;
    let rawAr1 = 0;
    let rawAr2 = 0;
    let deltaTR = 0;
    let deltaQ = 0;
    let priceElasticity = 0;
    let chokeA = chokePriceA;
    let slopeVal = slopeB;
    let revMaxQ = 0;
    let revMaxTR = 0;
    let profitMaxQ = 0;

    if (mode === 'discrete') {
      if (inputMethod === 'price_quantity') {
        effectiveTr1 = p1 * q1;
        effectiveTr2 = p2 * q2;
        effectiveP1 = p1;
        effectiveP2 = p2;
      } else {
        effectiveTr1 = tr1;
        effectiveTr2 = tr2;
        effectiveP1 = q1 > 0 ? tr1 / q1 : 0;
        effectiveP2 = q2 > 0 ? tr2 / q2 : 0;
      }
      effectiveQ1 = q1;
      effectiveQ2 = q2;
      deltaTR = effectiveTr2 - effectiveTr1;
      deltaQ = effectiveQ2 - effectiveQ1;
      rawMr = deltaQ !== 0 ? deltaTR / deltaQ : 0;
      rawAr1 = effectiveP1;
      rawAr2 = effectiveP2;

      // Calculate Arc Elasticity
      const avgP = (effectiveP1 + effectiveP2) / 2;
      const avgQ = (effectiveQ1 + effectiveQ2) / 2;
      const deltaP = effectiveP2 - effectiveP1;
      if (deltaP !== 0 && avgQ !== 0) {
        priceElasticity = Math.abs((deltaQ / avgQ) / (deltaP / avgP));
      } else {
        priceElasticity = 9999;
      }

      // Implied linear curve estimation
      if (deltaQ !== 0 && effectiveP1 !== effectiveP2) {
        slopeVal = Math.abs(deltaP / deltaQ);
        chokeA = effectiveP1 + slopeVal * effectiveQ1;
      } else {
        slopeVal = 0.001;
        chokeA = effectiveP2;
      }
      revMaxQ = slopeVal > 0 ? chokeA / (2 * slopeVal) : effectiveQ2;
      revMaxTR = chokeA * revMaxQ - slopeVal * Math.pow(revMaxQ, 2);
      profitMaxQ = slopeVal > 0 ? (chokeA - marginalCost) / (2 * slopeVal) : effectiveQ2;

    } else if (mode === 'linear_demand') {
      // P = a - bQ => TR = aQ - bQ^2 => MR = a - 2bQ
      chokeA = chokePriceA;
      slopeVal = slopeB;
      effectiveQ2 = evalQ;
      effectiveQ1 = Math.max(1, evalQ - 1);
      effectiveP2 = Math.max(0, chokeA - slopeVal * evalQ);
      effectiveP1 = Math.max(0, chokeA - slopeVal * effectiveQ1);
      effectiveTr2 = effectiveP2 * effectiveQ2;
      effectiveTr1 = effectiveP1 * effectiveQ1;
      deltaQ = 1;
      deltaTR = effectiveTr2 - effectiveTr1;
      rawMr = chokeA - 2 * slopeVal * evalQ;
      rawAr1 = effectiveP1;
      rawAr2 = effectiveP2;

      // Point Elasticity: Ed = (a - bQ) / (bQ)
      const denom = slopeVal * evalQ;
      priceElasticity = denom > 0 ? Math.abs((chokeA - denom) / denom) : 9999;

      revMaxQ = chokeA / (2 * slopeVal);
      revMaxTR = chokeA * revMaxQ - slopeVal * Math.pow(revMaxQ, 2);
      profitMaxQ = Math.max(0, (chokeA - marginalCost) / (2 * slopeVal));

    } else if (mode === 'amoroso') {
      // MR = P * (1 - 1 / |Ed|)
      effectiveP2 = amorosoPrice;
      effectiveP1 = amorosoPrice;
      effectiveQ2 = amorosoQ;
      effectiveQ1 = Math.max(1, amorosoQ - 1);
      priceElasticity = Math.max(0.01, amorosoElasticity);
      rawMr = effectiveP2 * (1 - (1 / priceElasticity));
      rawAr2 = effectiveP2;
      rawAr1 = effectiveP2;
      effectiveTr2 = effectiveP2 * effectiveQ2;
      deltaQ = 1;
      deltaTR = rawMr;
      effectiveTr1 = effectiveTr2 - deltaTR;

      // Reconstruct implied demand curve
      // At Q: Ed = P / (b * Q) => b = P / (Ed * Q)
      slopeVal = effectiveP2 / (priceElasticity * effectiveQ2);
      chokeA = effectiveP2 + slopeVal * effectiveQ2;
      revMaxQ = chokeA / (2 * slopeVal);
      revMaxTR = chokeA * revMaxQ - slopeVal * Math.pow(revMaxQ, 2);
      profitMaxQ = Math.max(0, (chokeA - marginalCost) / (2 * slopeVal));

    } else if (mode === 'schedule') {
      effectiveP1 = scheduleBasePrice;
      effectiveP2 = Math.max(1, scheduleBasePrice - scheduleDiscountPerStep);
      effectiveQ1 = scheduleBaseQ;
      effectiveQ2 = scheduleBaseQ + scheduleQIncrement;
      effectiveTr1 = effectiveP1 * effectiveQ1;
      effectiveTr2 = effectiveP2 * effectiveQ2;
      deltaQ = scheduleQIncrement;
      deltaTR = effectiveTr2 - effectiveTr1;
      rawMr = deltaQ !== 0 ? deltaTR / deltaQ : 0;
      rawAr1 = effectiveP1;
      rawAr2 = effectiveP2;

      const avgP = (effectiveP1 + effectiveP2) / 2;
      const avgQ = (effectiveQ1 + effectiveQ2) / 2;
      const deltaP = effectiveP2 - effectiveP1;
      priceElasticity = deltaP !== 0 && avgQ !== 0 ? Math.abs((deltaQ / avgQ) / (deltaP / avgP)) : 1;

      slopeVal = deltaQ !== 0 ? Math.abs(deltaP / deltaQ) : 0.1;
      chokeA = effectiveP1 + slopeVal * effectiveQ1;
      revMaxQ = chokeA / (2 * slopeVal);
      revMaxTR = chokeA * revMaxQ - slopeVal * Math.pow(revMaxQ, 2);
      profitMaxQ = Math.max(0, (chokeA - marginalCost) / (2 * slopeVal));
    }

    const mr = isNaN(rawMr) || !isFinite(rawMr) ? 0 : rawMr;
    const ar1 = isNaN(rawAr1) || !isFinite(rawAr1) ? 0 : rawAr1;
    const ar2 = isNaN(rawAr2) || !isFinite(rawAr2) ? 0 : rawAr2;

    // Elasticity Zone Diagnosis (Amoroso-Robinson Classification)
    let elasticityZone: 'elastic' | 'unitary' | 'inelastic' = 'elastic';
    let zoneTitle = '';
    let zoneDescription = '';
    let badgeClass = '';

    if (mr > 0.01) {
      elasticityZone = 'elastic';
      zoneTitle = 'Elastic Demand Zone (|Ed| > 1)';
      zoneDescription = 'Marginal Revenue is positive (MR > 0). Expanding output by lowering price yields a net increase in Total Revenue.';
      badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    } else if (Math.abs(mr) <= 0.01) {
      elasticityZone = 'unitary';
      zoneTitle = 'Unitary Elasticity Peak (|Ed| = 1)';
      zoneDescription = 'Marginal Revenue is exactly zero (MR = 0). Total Revenue is maximized at this exact quantity.';
      badgeClass = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    } else {
      elasticityZone = 'inelastic';
      zoneTitle = 'Inelastic Demand Zone (|Ed| < 1)';
      zoneDescription = 'Marginal Revenue is negative (MR < 0). Price cuts erode total revenue faster than volume gains. Raising prices increases Total Revenue.';
      badgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }

    // Profit Maximization Rule (MR vs MC)
    let profitDecisionTitle = '';
    let profitDecisionText = '';
    let profitBadgeClass = '';
    const mrDiffMc = mr - marginalCost;

    if (mrDiffMc > 0.5) {
      profitDecisionTitle = 'Expand Production (MR > MC)';
      profitDecisionText = `Selling an additional unit adds ${currency}${mr.toFixed(2)} to revenue while costing only ${currency}${marginalCost.toFixed(2)} (Net gain: +${currency}${mrDiffMc.toFixed(2)}/unit). Expansion increases total profit.`;
      profitBadgeClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    } else if (Math.abs(mrDiffMc) <= 0.5) {
      profitDecisionTitle = 'Profit Maximizing Optimum (MR = MC)';
      profitDecisionText = `Marginal Revenue equals Marginal Cost (${currency}${mr.toFixed(2)} ≈ ${currency}${marginalCost.toFixed(2)}). Total economic profit is maximized. Do not change output.`;
      profitBadgeClass = 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800';
    } else {
      profitDecisionTitle = 'Contract Production (MR < MC)';
      profitDecisionText = `Each incremental unit adds ${currency}${mr.toFixed(2)} to revenue but incurs ${currency}${marginalCost.toFixed(2)} in marginal cost (Net loss: -${currency}${Math.abs(mrDiffMc).toFixed(2)}/unit). Restricting output raises profit.`;
      profitBadgeClass = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    }

    // Lerner Index of Monopoly Power: L = (P - MC) / P = 1 / |Ed|
    const lernerIndex = effectiveP2 > 0 ? Math.max(0, Math.min(1, (effectiveP2 - marginalCost) / effectiveP2)) : 0;
    const markupFactor = mr > 0 ? (effectiveP2 / mr) : 1;

    return {
      q1: effectiveQ1,
      q2: effectiveQ2,
      p1: effectiveP1,
      p2: effectiveP2,
      tr1: effectiveTr1,
      tr2: effectiveTr2,
      deltaTR,
      deltaQ,
      mr,
      ar1,
      ar2,
      priceElasticity,
      chokeA,
      slopeVal,
      revMaxQ: Math.max(1, Math.round(revMaxQ)),
      revMaxTR: Math.max(0, revMaxTR),
      profitMaxQ: Math.max(1, Math.round(profitMaxQ)),
      elasticityZone,
      zoneTitle,
      zoneDescription,
      badgeClass,
      profitDecisionTitle,
      profitDecisionText,
      profitBadgeClass,
      mrDiffMc,
      lernerIndex,
      markupFactor
    };
  }, [mode, inputMethod, p1, p2, q1, q2, tr1, tr2, chokePriceA, slopeB, evalQ, amorosoPrice, amorosoElasticity, amorosoQ, marginalCost, scheduleBasePrice, scheduleBaseQ, scheduleDiscountPerStep, scheduleQIncrement, currency]);

  // Revenue Schedule Simulation (10 Output Tiers from 0.2*Q2 to 2.0*Q2)
  const revenueSchedule = useMemo(() => {
    const baseStep = Math.max(5, Math.round(calc.q2 / 5));
    const tiers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const chokeA = calc.chokeA;
    const slopeVal = calc.slopeVal;

    return tiers.map((tier) => {
      const curQ = baseStep * tier;
      const curPrice = Math.max(0, chokeA - slopeVal * curQ);
      const curTR = curPrice * curQ;
      const curMR = chokeA - 2 * slopeVal * curQ;
      const curAR = curPrice;

      const denom = slopeVal * curQ;
      const curEd = denom > 0 ? Math.abs((chokeA - denom) / denom) : 9999;
      const isCur = Math.abs(curQ - calc.q2) <= baseStep * 0.5;

      let zoneTag = 'Elastic (MR > 0)';
      let zoneTagColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

      if (curMR < -0.01) {
        zoneTag = 'Inelastic (MR < 0)';
        zoneTagColor = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
      } else if (Math.abs(curMR) <= 0.01) {
        zoneTag = 'Unitary (Max TR)';
        zoneTagColor = 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20';
      }

      return {
        tier,
        quantity: curQ,
        price: curPrice,
        tr: curTR,
        mr: curMR,
        ar: curAR,
        ed: curEd,
        isCurrentTier: isCur,
        zoneTag,
        zoneTagColor
      };
    });
  }, [calc.q2, calc.chokeA, calc.slopeVal]);

  // Sensitivity Matrix: Price Sensitivity vs Output Shifts
  const sensitivityMatrix = useMemo(() => {
    const qMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2];
    const pMultipliers = [0.8, 0.9, 1.0, 1.1, 1.2];
    const baseP = calc.p2;
    const baseQ = calc.q2;

    return pMultipliers.map((pMult) => {
      const rowP = baseP * pMult;
      const rowCols = qMultipliers.map((qMult) => {
        const colQ = baseQ * qMult;
        const totalRev = rowP * colQ;
        const impliedMR = calc.chokeA - 2 * calc.slopeVal * colQ;
        return {
          pMult,
          qMult,
          rowP,
          colQ,
          totalRev,
          impliedMR
        };
      });
      return { pMult, rowP, cols: rowCols };
    });
  }, [calc.p2, calc.q2, calc.chokeA, calc.slopeVal]);

  // Copy Full Proof Handler
  const handleCopyProof = () => {
    const text = `=========================================
Marginal Revenue (MR) & Average Revenue Analysis
=========================================
Operating Output (Q): ${calc.q2.toLocaleString()} units
Selling Price / Average Revenue (AR = P): ${currency}${calc.p2.toFixed(2)}
Total Revenue (TR = P × Q): ${currency}${calc.tr2.toLocaleString(undefined, { minimumFractionDigits: 2 })}
Marginal Revenue (MR = ΔTR/ΔQ): ${currency}${calc.mr.toFixed(2)} per unit

ELASTICITY & AMOROSO-ROBINSON DERIVATION:
• Price Elasticity of Demand (|Ed|): ${calc.priceElasticity > 100 ? '∞ (Perfect Elasticity)' : calc.priceElasticity.toFixed(2)}
• Amoroso-Robinson Formula: MR = P × (1 - 1/|Ed|)
• Check: ${currency}${calc.p2.toFixed(2)} × (1 - 1/${calc.priceElasticity.toFixed(2)}) = ${currency}${calc.mr.toFixed(2)}
• Revenue Elasticity Zone: ${calc.zoneTitle} (${calc.zoneDescription})

PROFIT MAXIMIZATION BENCHMARK (MR vs MC):
• Marginal Cost (MC): ${currency}${marginalCost.toFixed(2)} per unit
• Net Marginal Profit (MR - MC): ${currency}${calc.mrDiffMc.toFixed(2)} per unit
• Strategic Directive: ${calc.profitDecisionTitle} - ${calc.profitDecisionText}
• Revenue Maximizing Output (MR = 0): ${calc.revMaxQ.toLocaleString()} units (Peak TR: ${currency}${calc.revMaxTR.toLocaleString(undefined, { minimumFractionDigits: 2 })})
• Profit Maximizing Output (MR = MC): ${calc.profitMaxQ.toLocaleString()} units
• Lerner Index of Monopoly Power (L = (P - MC)/P): ${calc.lernerIndex.toFixed(3)}

Generated via Toolique Economics Suite (https://www.toolique.in/economics/marginal-revenue-calculator)
=========================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setMode('discrete');
    setInputMethod('price_quantity');
    setP1(100);
    setP2(90);
    setQ1(200);
    setQ2(250);
    setTr1(20000);
    setTr2(22500);
    setChokePriceA(500);
    setSlopeB(1.25);
    setEvalQ(120);
    setAmorosoPrice(150);
    setAmorosoElasticity(2.5);
    setAmorosoQ(500);
    setMarginalCost(45);
    setScheduleBasePrice(200);
    setScheduleBaseQ(100);
    setScheduleDiscountPerStep(15);
    setScheduleQIncrement(50);
  };

  // SVG Chart Dimensions & Computations
  const maxChartQ = Math.max(calc.revMaxQ * 1.5, calc.q2 * 1.4, 20);
  const maxChartP = Math.max(calc.chokeA * 1.15, calc.p2 * 1.25, 10);
  const maxChartTR = Math.max(calc.revMaxTR * 1.2, calc.tr2 * 1.2, 100);

  const getSvgX = (qVal: number) => {
    return 60 + (Math.min(qVal, maxChartQ) / maxChartQ) * 480;
  };

  const getSvgYPrice = (pVal: number) => {
    const clamped = Math.max(-maxChartP * 0.3, Math.min(pVal, maxChartP));
    return 240 - ((clamped + maxChartP * 0.3) / (maxChartP * 1.3)) * 200;
  };

  const getSvgYTR = (trVal: number) => {
    const clamped = Math.max(0, Math.min(trVal, maxChartTR));
    return 130 - (clamped / maxChartTR) * 105;
  };

  const zeroMrY = getSvgYPrice(0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* 1. Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Industry Market & Revenue Presets
              </span>
              <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                Click any scenario to load real-world market demand & pricing curves
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
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
              <span>{copied ? 'Proof Copied' : 'Copy Proof'}</span>
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750 transition cursor-pointer shadow-2xs"
              title="Reset all inputs to default baseline"
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
              onClick={() => handleApplyPreset(p)}
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

      {/* Mode Switcher Tabs */}
      <div className="bg-zinc-100 dark:bg-zinc-800/70 p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap gap-1 border border-zinc-200 dark:border-zinc-700/80">
        <button
          onClick={() => setMode('discrete')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'discrete'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Discrete Transition (ΔTR/ΔQ)
        </button>

        <button
          onClick={() => setMode('linear_demand')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'linear_demand'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <LineChart className="w-3.5 h-3.5" />
          Linear Demand (P = a - bQ)
        </button>

        <button
          onClick={() => setMode('amoroso')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'amoroso'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Amoroso-Robinson (P, |Ed|)
        </button>

        <button
          onClick={() => setMode('schedule')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'schedule'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          Volume Tier Schedule
        </button>
      </div>

      {/* Main Grid: Inputs + Primary Output Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                {mode === 'discrete' && 'Discrete Transition Inputs'}
                {mode === 'linear_demand' && 'Linear Inverse Demand Parameters'}
                {mode === 'amoroso' && 'Amoroso-Robinson Elasticity Inputs'}
                {mode === 'schedule' && 'Tier Discount Parameters'}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">Step 1 of 2</span>
            </div>

            {/* Mode 1: Discrete */}
            {mode === 'discrete' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                  <button
                    onClick={() => setInputMethod('price_quantity')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      inputMethod === 'price_quantity'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Price & Quantity (P, Q)
                  </button>
                  <button
                    onClick={() => setInputMethod('total_revenue')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      inputMethod === 'total_revenue'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    Total Revenue & Quantity (TR, Q)
                  </button>
                </div>

                {inputMethod === 'price_quantity' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Initial Price ({currency}P₁)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                          <input
                            type="number"
                            step="any"
                            value={p1}
                            onChange={(e) => setP1(parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Initial Quantity (Q₁)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={q1}
                          onChange={(e) => setQ1(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          New Price ({currency}P₂)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                          <input
                            type="number"
                            step="any"
                            value={p2}
                            onChange={(e) => setP2(parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          New Quantity (Q₂)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={q2}
                          onChange={(e) => setQ2(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Initial Revenue ({currency}TR₁)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                          <input
                            type="number"
                            step="any"
                            value={tr1}
                            onChange={(e) => setTr1(parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Initial Quantity (Q₁)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={q1}
                          onChange={(e) => setQ1(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          New Revenue ({currency}TR₂)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                          <input
                            type="number"
                            step="any"
                            value={tr2}
                            onChange={(e) => setTr2(parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          New Quantity (Q₂)
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={q2}
                          onChange={(e) => setQ2(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mode 2: Linear Demand P = a - bQ */}
            {mode === 'linear_demand' && (
              <div className="space-y-3">
                <div className="p-2.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] text-indigo-800 dark:text-indigo-300">
                  <strong>Linear Inverse Demand Equation:</strong> <span className="font-mono">P(Q) = a - bQ</span>
                  <br />
                  Total Revenue: <span className="font-mono">TR(Q) = aQ - bQ²</span> → Marginal Revenue: <span className="font-mono">MR(Q) = a - 2bQ</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Choke Price (Intercept a)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                      <input
                        type="number"
                        step="any"
                        value={chokePriceA}
                        onChange={(e) => setChokePriceA(parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Demand Slope Parameter (b)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={slopeB}
                      onChange={(e) => setSlopeB(parseFloat(e.target.value) || 0.001)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Evaluated Output Level (Q)
                    </label>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{evalQ} units</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={Math.max(200, Math.round((chokePriceA / Math.max(0.01, slopeB)) * 1.2))}
                    value={evalQ}
                    onChange={(e) => setEvalQ(parseFloat(e.target.value) || 1)}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-0.5">
                    <span>1 unit</span>
                    <span>Max TR Peak: {Math.round(chokePriceA / (2 * Math.max(0.001, slopeB)))} units</span>
                    <span>{Math.round((chokePriceA / Math.max(0.01, slopeB)) * 1.2)} units</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Amoroso-Robinson */}
            {mode === 'amoroso' && (
              <div className="space-y-3">
                <div className="p-2.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] text-indigo-800 dark:text-indigo-300">
                  <strong>Amoroso-Robinson Identity:</strong> <span className="font-mono">MR = P · (1 - 1 / |Ed|)</span>
                  <br />
                  Relates selling price directly to the customer price sensitivity coefficient.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Selling Price ({currency}P)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                      <input
                        type="number"
                        step="any"
                        value={amorosoPrice}
                        onChange={(e) => setAmorosoPrice(parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Price Elasticity (|Ed|)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={amorosoElasticity}
                      onChange={(e) => setAmorosoElasticity(parseFloat(e.target.value) || 0.01)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Operating Output Volume (Q)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={amorosoQ}
                    onChange={(e) => setAmorosoQ(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Mode 4: Volume Tier Schedule */}
            {mode === 'schedule' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Base Tier Price ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={scheduleBasePrice}
                      onChange={(e) => setScheduleBasePrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Base Output Volume (Q)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={scheduleBaseQ}
                      onChange={(e) => setScheduleBaseQ(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Price Discount per Step ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={scheduleDiscountPerStep}
                      onChange={(e) => setScheduleDiscountPerStep(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Volume Step Increment (+ΔQ)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={scheduleQIncrement}
                      onChange={(e) => setScheduleQIncrement(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Benchmark Marginal Cost (MC) Input */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  Benchmark Marginal Cost ({currency}MC)
                </span>
                <span className="text-[11px] text-zinc-400 font-normal">Profit Rule Check</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                <input
                  type="number"
                  step="any"
                  value={marginalCost}
                  onChange={(e) => setMarginalCost(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Used to evaluate whether expanding output increases or decreases total economic profit (<span className="font-mono">MR = MC</span>).
              </p>
            </div>
          </div>

          {/* Profit Maximization Directive Callout */}
          <div className={`p-4 rounded-2xl border transition-all ${calc.profitBadgeClass}`}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">{calc.profitDecisionTitle}</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {calc.profitDecisionText}
            </p>
          </div>
        </div>

        {/* Right Output Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Hero Marginal Revenue Card */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-500/20">
            <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Marginal Revenue (MR)
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${calc.badgeClass} bg-black/20`}>
                {calc.zoneTitle}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {currency}{calc.mr.toFixed(2)}
              </span>
              <span className="text-sm font-medium text-indigo-200">/ incremental unit</span>
            </div>

            <p className="text-xs text-indigo-200/90 leading-relaxed mb-4">
              {calc.zoneDescription}
            </p>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/10 text-left">
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-indigo-300 block">Average Revenue (AR)</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">{currency}{calc.ar2.toFixed(2)}</span>
                <span className="text-[10px] text-indigo-200/70">Price per unit</span>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-indigo-300 block">Total Revenue (TR)</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">{currency}{calc.tr2.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className="text-[10px] text-indigo-200/70">At Q = {calc.q2.toLocaleString()}</span>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-indigo-300 block">Price Elasticity (|Ed|)</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">{calc.priceElasticity > 100 ? '∞' : calc.priceElasticity.toFixed(2)}</span>
                <span className="text-[10px] text-indigo-200/70">{calc.priceElasticity >= 1 ? 'Elastic' : 'Inelastic'}</span>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-indigo-300 block">Monopoly Power (L)</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">{calc.lernerIndex.toFixed(2)}</span>
                <span className="text-[10px] text-indigo-200/70">Lerner Index</span>
              </div>
            </div>
          </div>

          {/* Interactive Dual SVG Curves Visualizer */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
                Total Revenue & Demand/MR Geometry
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">Continuous Visualizer</span>
            </div>

            {/* SVG Visualizer */}
            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 580 260" className="w-full h-auto max-h-[280px] bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 select-none">
                {/* Defs / Gradients */}
                <defs>
                  <linearGradient id="trAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="elasticZoneGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="inelasticZoneGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.02" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.12" />
                  </linearGradient>
                </defs>

                {/* Shaded Elastic vs Inelastic Zones */}
                <rect x="60" y="20" width={Math.max(0, getSvgX(calc.revMaxQ) - 60)} height="220" fill="url(#elasticZoneGrad)" />
                <rect x={getSvgX(calc.revMaxQ)} y="20" width={Math.max(0, 540 - getSvgX(calc.revMaxQ))} height="220" fill="url(#inelasticZoneGrad)" />

                {/* Axis Grid Lines */}
                <line x1="60" y1="20" x2="60" y2="240" stroke="#71717a" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="60" y1={zeroMrY} x2="540" y2={zeroMrY} stroke="#71717a" strokeWidth="1.5" strokeOpacity="0.5" />
                <line x1="60" y1="130" x2="540" y2="130" stroke="#71717a" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.2" />

                {/* Zero MR / Peak Revenue Vertical Divider */}
                <line
                  x1={getSvgX(calc.revMaxQ)}
                  y1="20"
                  x2={getSvgX(calc.revMaxQ)}
                  y2="240"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeOpacity="0.6"
                />
                <text x={getSvgX(calc.revMaxQ)} y="15" fill="#6366f1" fontSize="9" fontWeight="bold" textAnchor="middle">
                  Peak TR (MR=0) @ Q={calc.revMaxQ}
                </text>

                {/* Shaded TR Parabola */}
                {(() => {
                  const pts: string[] = [];
                  for (let i = 0; i <= 30; i++) {
                    const sampleQ = (maxChartQ / 30) * i;
                    const sampleTR = calc.chokeA * sampleQ - calc.slopeVal * Math.pow(sampleQ, 2);
                    pts.push(`${getSvgX(sampleQ)},${getSvgYTR(sampleTR)}`);
                  }
                  const pathD = `M 60,130 L ` + pts.join(' L ') + ` L ${getSvgX(maxChartQ)},130 Z`;
                  const lineD = `M ` + pts.join(' L ');
                  return (
                    <g>
                      <path d={pathD} fill="url(#trAreaGrad)" />
                      <path d={lineD} fill="none" stroke="#6366f1" strokeWidth="2.5" />
                    </g>
                  );
                })()}

                {/* Demand (AR) Curve: P = a - bQ */}
                <line
                  x1={getSvgX(0)}
                  y1={getSvgYPrice(calc.chokeA)}
                  x2={getSvgX(calc.chokeA / calc.slopeVal)}
                  y2={getSvgYPrice(0)}
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />

                {/* Marginal Revenue (MR) Curve: MR = a - 2bQ */}
                <line
                  x1={getSvgX(0)}
                  y1={getSvgYPrice(calc.chokeA)}
                  x2={getSvgX(maxChartQ)}
                  y2={getSvgYPrice(calc.chokeA - 2 * calc.slopeVal * maxChartQ)}
                  stroke="#ec4899"
                  strokeWidth="2.5"
                />

                {/* Marginal Cost (MC) Horizontal Line */}
                <line
                  x1="60"
                  y1={getSvgYPrice(marginalCost)}
                  x2="540"
                  y2={getSvgYPrice(marginalCost)}
                  stroke="#eab308"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <text x="542" y={getSvgYPrice(marginalCost) + 3} fill="#eab308" fontSize="8" fontWeight="bold">
                  MC = {currency}{marginalCost}
                </text>

                {/* Current Operating Point Markers */}
                {/* Operating Point on AR Curve */}
                <circle
                  cx={getSvgX(calc.q2)}
                  cy={getSvgYPrice(calc.p2)}
                  r="5"
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {/* Operating Point on MR Curve */}
                <circle
                  cx={getSvgX(calc.q2)}
                  cy={getSvgYPrice(calc.mr)}
                  r="5"
                  fill="#ec4899"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                {/* Operating Point on TR Curve */}
                <circle
                  cx={getSvgX(calc.q2)}
                  cy={getSvgYTR(calc.tr2)}
                  r="5"
                  fill="#6366f1"
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* Vertical Operating Q Guideline */}
                <line
                  x1={getSvgX(calc.q2)}
                  y1="20"
                  x2={getSvgX(calc.q2)}
                  y2="240"
                  stroke="#71717a"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text x={getSvgX(calc.q2)} y="252" fill="#71717a" fontSize="9" fontWeight="bold" textAnchor="middle">
                  Current Q = {calc.q2}
                </text>

                {/* Curve Labels */}
                <text x="70" y={getSvgYPrice(calc.chokeA) + 12} fill="#3b82f6" fontSize="9" fontWeight="bold">
                  Demand (AR = P)
                </text>
                <text x="70" y={getSvgYPrice(calc.chokeA) + 26} fill="#ec4899" fontSize="9" fontWeight="bold">
                  Marginal Revenue (MR)
                </text>
                <text x="70" y="45" fill="#6366f1" fontSize="9" fontWeight="bold">
                  Total Revenue (TR)
                </text>

                {/* Elastic / Inelastic Zone Labels */}
                <text x="90" y="235" fill="#10b981" fontSize="8" fontWeight="bold">
                  ◀ ELASTIC ZONE (MR &gt; 0)
                </text>
                <text x="480" y="235" fill="#f43f5e" fontSize="8" fontWeight="bold" textAnchor="end">
                  INELASTIC ZONE (MR &lt; 0) ▶
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Demand (<span className="font-mono">AR = P</span>)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
                  Marginal Revenue (<span className="font-mono">MR</span>)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                  Total Revenue (<span className="font-mono">TR</span>)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-yellow-500 inline-block" />
                  Marginal Cost (<span className="font-mono">MC</span>)
                </span>
              </div>
              <span className="text-zinc-400 italic">MR has exactly 2× the slope of Demand</span>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Tier Revenue & Elasticity Schedule Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-indigo-500" />
              10-Tier Output Revenue & Elasticity Schedule
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Simulated revenue schedule evaluating step changes in output from <span className="font-mono">0.2Q</span> to <span className="font-mono">2.0Q</span>.
            </p>
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            Highlighted Row: Current Operating Volume
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold bg-zinc-50/50 dark:bg-zinc-800/30">
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Quantity (Q)</th>
                <th className="py-2.5 px-3">Price / AR ({currency})</th>
                <th className="py-2.5 px-3">Total Revenue (TR)</th>
                <th className="py-2.5 px-3">Marginal Revenue (MR)</th>
                <th className="py-2.5 px-3">Elasticity (|Ed|)</th>
                <th className="py-2.5 px-3">Amoroso Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
              {revenueSchedule.map((row) => (
                <tr
                  key={row.tier}
                  className={`transition-colors ${
                    row.isCurrentTier
                      ? 'bg-indigo-500/10 font-bold text-indigo-900 dark:text-indigo-200'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <td className="py-2.5 px-3 font-sans">
                    {row.isCurrentTier ? (
                      <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                        ★ T{row.tier}
                      </span>
                    ) : (
                      `T${row.tier}`
                    )}
                  </td>
                  <td className="py-2.5 px-3">{row.quantity.toLocaleString()}</td>
                  <td className="py-2.5 px-3">{currency}{row.price.toFixed(2)}</td>
                  <td className="py-2.5 px-3">{currency}{row.tr.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                  <td className={`py-2.5 px-3 font-bold ${row.mr >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {currency}{row.mr.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3">{row.ed > 100 ? '∞' : row.ed.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${row.zoneTagColor}`}>
                      {row.zoneTag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensitivity Matrix Collapsible */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <button
          onClick={() => setShowSensitivity(!showSensitivity)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Sensitivity Matrix: Price Level vs Output Volume Matrix
            </span>
          </div>
          {showSensitivity ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showSensitivity && (
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Evaluates implied Total Revenue (<span className="font-mono">TR</span>) across relative shifts in pricing (Rows: ±20%) and output quantity (Columns: ±20%).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                    <th className="p-2 text-left font-semibold text-zinc-500 dark:text-zinc-400">Price Shift \ Q Shift</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">-20% Q</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">-10% Q</th>
                    <th className="p-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">Base Q ({calc.q2})</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">+10% Q</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">+20% Q</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                  {sensitivityMatrix.map((row, rIdx) => (
                    <tr key={rIdx} className={row.pMult === 1.0 ? 'bg-indigo-500/5 font-semibold' : ''}>
                      <td className="p-2 text-left font-sans font-medium text-zinc-700 dark:text-zinc-300">
                        {row.pMult === 1.0 ? (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            Base Price ({currency}{row.rowP.toFixed(2)})
                          </span>
                        ) : (
                          `${row.pMult > 1.0 ? '+' : ''}${Math.round((row.pMult - 1.0) * 100)}% (${currency}${row.rowP.toFixed(2)})`
                        )}
                      </td>
                      {row.cols.map((col, cIdx) => (
                        <td
                          key={cIdx}
                          className={`p-2 ${
                            col.pMult === 1.0 && col.qMult === 1.0
                              ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold rounded-lg'
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          <div>{currency}{col.totalRev.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                          <div className="text-[10px] text-zinc-400">MR: {currency}{col.impliedMR.toFixed(1)}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Mathematical Proof & Formulas Collapsible */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <button
          onClick={() => setShowProof(!showProof)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Formal Microeconomic Derivations & Formulas
            </span>
          </div>
          {showProof ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showProof && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                  1. Discrete & Calculus Formulations
                </h4>
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 text-[11px] space-y-1">
                  <div>Discrete: MR = ΔTR / ΔQ = (TR₂ - TR₁) / (Q₂ - Q₁)</div>
                  <div>Continuous: MR = d(TR)/dQ = d(P·Q)/dQ = P + Q·(dP/dQ)</div>
                </div>
                <p>
                  Because <span className="font-mono">dP/dQ &lt; 0</span> under downward-sloping demand, Marginal Revenue is strictly less than Average Revenue (<span className="font-mono">MR &lt; AR = P</span>) for all imperfectly competitive firms.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                  2. Amoroso-Robinson & Elasticity Link
                </h4>
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 text-[11px] space-y-1">
                  <div>MR = P · [ 1 - 1 / |Ed| ]</div>
                  <div>Lerner Index: L = (P - MC) / P = 1 / |Ed|</div>
                </div>
                <p>
                  At unitary elasticity (<span className="font-mono">|Ed| = 1</span>), <span className="font-mono">MR = 0</span> and Total Revenue is at its mathematical global maximum.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                Active Calculation Verification Proof
              </h4>
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-800 dark:text-zinc-200 space-y-1.5">
                <div>• Total Revenue 1: {currency}{calc.tr1.toLocaleString(undefined, { minimumFractionDigits: 2 })} (at Q₁ = {calc.q1})</div>
                <div>• Total Revenue 2: {currency}{calc.tr2.toLocaleString(undefined, { minimumFractionDigits: 2 })} (at Q₂ = {calc.q2})</div>
                <div>• ΔTR = {calc.deltaTR >= 0 ? '+' : ''}{currency}{calc.deltaTR.toLocaleString(undefined, { minimumFractionDigits: 2 })}, ΔQ = {calc.deltaQ >= 0 ? '+' : ''}{calc.deltaQ} units</div>
                <div className="pt-1 text-indigo-600 dark:text-indigo-400 font-bold">
                  • MR = ΔTR / ΔQ = {currency}{calc.mr.toFixed(2)} per unit
                </div>
                <div>• Amoroso Proof: {currency}{calc.p2.toFixed(2)} × (1 - 1/{calc.priceElasticity > 100 ? '∞' : calc.priceElasticity.toFixed(2)}) = {currency}{calc.mr.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Academic Guide & Educational FAQ */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-500" />
            Complete Microeconomic Theory: Marginal Revenue & Pricing Power
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Understanding how incremental revenue dictates market equilibrium, profit maximization, and price discrimination.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              1. Perfect Competition vs Monopoly
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              In a <strong>perfectly competitive</strong> market, individual firms cannot influence market price (<span className="font-mono">dP/dQ = 0</span>). Hence, <span className="font-mono">MR = AR = P</span>. In a <strong>monopoly</strong> or oligopoly, lowering price to sell more applies to all units, forcing <span className="font-mono">MR &lt; P</span>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              2. The Golden Profit Rule: MR = MC
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Profit is maximized when the revenue generated by the last unit sold exactly equals the cost to produce it (<span className="font-mono">MR = MC</span>). If <span className="font-mono">MR &gt; MC</span>, firms should expand; if <span className="font-mono">MR &lt; MC</span>, output must be contracted.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              3. The Twice-as-Steep Linear Slope Rule
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              For any linear downward-sloping demand curve <span className="font-mono">P = a - bQ</span>, the Marginal Revenue curve starts at the same intercept <span className="font-mono">a</span> and descends at exactly <strong>twice the slope</strong> (<span className="font-mono">MR = a - 2bQ</span>), crossing zero at half the quantity intercept.
            </p>
          </div>
        </div>

        {/* Accordion FAQ */}
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-3">
            Frequently Asked Questions (FAQ)
          </h3>

          {[
            {
              q: 'Can Marginal Revenue ever be negative? What does it signify?',
              a: 'Yes! When a firm operates in the inelastic segment of its demand curve (|Ed| < 1), cutting prices to sell extra volume loses more revenue on existing units than is gained from the new units. When MR < 0, total revenue strictly declines with higher volume.'
            },
            {
              q: 'What is the relationship between MR and Price Elasticity of Demand?',
              a: 'Through the Amoroso-Robinson theorem: MR = P(1 - 1/|Ed|). When demand is elastic (|Ed| > 1), MR is positive. When demand is unitary (|Ed| = 1), MR is zero and Total Revenue is maximized. When demand is inelastic (|Ed| < 1), MR is negative.'
            },
            {
              q: 'Why is Average Revenue always identically equal to Price?',
              a: 'Total Revenue is TR = P × Q. Average Revenue is defined as TR / Q = (P × Q) / Q = P. Therefore, the Average Revenue curve is mathematically identical to the firm’s demand curve.'
            },
            {
              q: 'What is the difference between Revenue Maximization and Profit Maximization?',
              a: 'Revenue is maximized where MR = 0 (peak of the TR parabola). Profit is maximized where MR = MC. Since marginal cost is almost always positive (MC > 0), the profit-maximizing output is always lower than the revenue-maximizing output.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <span>{item.q}</span>
                {activeFaq === idx ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>
              {activeFaq === idx && (
                <div className="p-3.5 pt-0 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-800/20 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
