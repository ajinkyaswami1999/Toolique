import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2, Info,
  ShieldCheck, Sliders, ChevronDown, ChevronUp,
  Calculator, ArrowRight, Compass,
  Target, Layers, DollarSign,
  TrendingUp, Activity, CheckCircle2, AlertTriangle
} from 'lucide-react';

type CalculationMode = 'standard_units' | 'revenue_cmr' | 'multi_product' | 'target_tax';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  fixedCost: number;
  price: number;
  variableCost: number;
  plannedVolume: number;
  targetProfit: number;
  expectedVerdict: string;
  notes: string;
}

export default function BreakEvenPointCalculator() {
  // Mode state
  const [mode, setMode] = useState<CalculationMode>('standard_units');
  const [currency, setCurrency] = useState<string>('$');

  // Mode 1: Standard Unit Inputs
  const [fixedCost, setFixedCost] = useState<number>(45000);
  const [unitPrice, setUnitPrice] = useState<number>(120);
  const [unitVariableCost, setUnitVariableCost] = useState<number>(48);
  const [plannedVolume, setPlannedVolume] = useState<number>(900);
  const [targetProfit, setTargetProfit] = useState<number>(25000);

  // Mode 2: Revenue & CMR % Mode
  const [cmrFixedCost, setCmrFixedCost] = useState<number>(60000);
  const [cmrGrossMarginPct, setCmrGrossMarginPct] = useState<number>(65); // 65% CMR
  const [cmrTargetRevenue, setCmrTargetRevenue] = useState<number>(150000);
  const [cmrTargetProfit, setCmrTargetProfit] = useState<number>(30000);

  // Mode 3: Multi-Product 3-Tier Mix Mode
  const [multiFixedCost, setMultiFixedCost] = useState<number>(80000);
  // Product A (e.g. Standard)
  const [prodAPrice, setProdAPrice] = useState<number>(50);
  const [prodAVc, setProdAVc] = useState<number>(20);
  const [prodAMix, setProdAMix] = useState<number>(50); // 50% mix
  // Product B (e.g. Premium)
  const [prodBPrice, setProdBPrice] = useState<number>(120);
  const [prodBVc, setProdBVc] = useState<number>(45);
  const [prodBMix, setProdBMix] = useState<number>(35); // 35% mix
  // Product C (e.g. Enterprise / Luxury)
  const [prodCPrice, setProdCPrice] = useState<number>(300);
  const [prodCVc, setProdCVc] = useState<number>(100);
  const [prodCMix, setProdCMix] = useState<number>(15); // 15% mix

  // Mode 4: Target After-Tax Profit Mode
  const [taxFixedCost, setTaxFixedCost] = useState<number>(50000);
  const [taxUnitPrice, setTaxUnitPrice] = useState<number>(100);
  const [taxUnitVc, setTaxUnitVc] = useState<number>(40);
  const [taxTargetNetIncome, setTaxTargetNetIncome] = useState<number>(30000);
  const [taxRatePct, setTaxRatePct] = useState<number>(25); // 25% tax

  // UI States
  const [copied, setCopied] = useState(false);
  const [showProof, setShowProof] = useState(true);
  const [showSensitivity, setShowSensitivity] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // 6 Real-World Industry Presets
  const presets: PresetScenario[] = [
    {
      name: '☕ Specialty Cafe & Micro-Bakery',
      category: 'Food & Hospitality',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      mode: 'standard_units',
      fixedCost: 12000,
      price: 6.50,
      variableCost: 1.80,
      plannedVolume: 3500,
      targetProfit: 4500,
      expectedVerdict: '2,554 units/mo ($16,601)',
      notes: 'Rent and barista salaries create $12k fixed hurdle; $4.70 unit contribution achieves BEP at 85 cups/day.'
    },
    {
      name: '📱 B2B SaaS Platform (Per Seat)',
      category: 'High Operating Leverage Tech',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      mode: 'standard_units',
      fixedCost: 65000,
      price: 120,
      variableCost: 15,
      plannedVolume: 1200,
      targetProfit: 40000,
      expectedVerdict: '619 enterprise seats ($74,286)',
      notes: 'Heavy engineering payroll with negligible AWS variable costs creates massive 87.5% CM and rapid profitability above BEP.'
    },
    {
      name: '🚗 EV Battery Assembly Plant',
      category: 'Heavy Manufacturing Cap-Ex',
      badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      mode: 'standard_units',
      fixedCost: 450000,
      price: 850,
      variableCost: 520,
      plannedVolume: 2000,
      targetProfit: 150000,
      expectedVerdict: '1,364 battery modules ($1.16M)',
      notes: 'Heavy automated tooling requires 1,364 modules to clear factory amortization before generating positive operating income.'
    },
    {
      name: '👕 D2C E-Commerce Apparel',
      category: 'Retail & Consumer Goods',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      mode: 'standard_units',
      fixedCost: 15000,
      price: 48,
      variableCost: 26,
      plannedVolume: 1100,
      targetProfit: 8000,
      expectedVerdict: '682 hoodies/mo ($32,727)',
      notes: 'Unit variable cost includes garment manufacturing, pick-pack fulfillment, and targeted digital acquisition ad spend.'
    },
    {
      name: '🍕 Fast-Casual Pizza Delivery',
      category: 'Franchise Fast-Food',
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      mode: 'standard_units',
      fixedCost: 18500,
      price: 22,
      variableCost: 7.50,
      plannedVolume: 2200,
      targetProfit: 12000,
      expectedVerdict: '1,276 pizzas/mo ($28,072)',
      notes: 'Oven leases, delivery drivers, and retail storefront require 42 pizzas/day to break even.'
    },
    {
      name: '🩺 Private Dental & Ortho Clinic',
      category: 'Professional Medical Practice',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      mode: 'standard_units',
      fixedCost: 38000,
      price: 450,
      variableCost: 110,
      plannedVolume: 160,
      targetProfit: 25000,
      expectedVerdict: '112 procedures/mo ($50,400)',
      notes: 'High hygienist salaries and sterilized clinic space covered at 112 complex patient procedures monthly.'
    }
  ];

  const handleApplyPreset = (preset: PresetScenario) => {
    setMode(preset.mode);
    setFixedCost(preset.fixedCost);
    setUnitPrice(preset.price);
    setUnitVariableCost(preset.variableCost);
    setPlannedVolume(preset.plannedVolume);
    setTargetProfit(preset.targetProfit);
  };

  // Comprehensive Calculation Engine
  const calc = useMemo(() => {
    let effectiveFC = fixedCost;
    let effectiveP = unitPrice;
    let effectiveVC = unitVariableCost;
    let effectivePlannedQ = plannedVolume;
    let effectiveTargetProfit = targetProfit;
    let isMultiProd = false;

    if (mode === 'standard_units') {
      effectiveFC = fixedCost;
      effectiveP = unitPrice;
      effectiveVC = unitVariableCost;
      effectivePlannedQ = plannedVolume;
      effectiveTargetProfit = targetProfit;
    } else if (mode === 'revenue_cmr') {
      effectiveFC = cmrFixedCost;
      const cmrDecimal = Math.max(0.01, cmrGrossMarginPct / 100);
      effectiveP = 100;
      effectiveVC = 100 * (1 - cmrDecimal);
      effectivePlannedQ = cmrTargetRevenue > 0 ? cmrTargetRevenue / 100 : 1000;
      effectiveTargetProfit = cmrTargetProfit;
    } else if (mode === 'multi_product') {
      isMultiProd = true;
      effectiveFC = multiFixedCost;
      const totalMix = prodAMix + prodBMix + prodCMix || 100;
      const normA = prodAMix / totalMix;
      const normB = prodBMix / totalMix;
      const normC = prodCMix / totalMix;

      effectiveP = prodAPrice * normA + prodBPrice * normB + prodCPrice * normC;
      effectiveVC = prodAVc * normA + prodBVc * normB + prodCVc * normC;
      effectivePlannedQ = plannedVolume;
      effectiveTargetProfit = targetProfit;
    } else if (mode === 'target_tax') {
      effectiveFC = taxFixedCost;
      effectiveP = taxUnitPrice;
      effectiveVC = taxUnitVc;
      const taxRate = Math.min(0.99, Math.max(0, taxRatePct / 100));
      effectiveTargetProfit = taxTargetNetIncome / (1 - taxRate);
      effectivePlannedQ = plannedVolume;
    }

    const cm = effectiveP - effectiveVC;
    const cmr = effectiveP > 0 ? (cm / effectiveP) * 100 : 0;
    const cmrDecimal = cmr / 100;

    const rawBepUnits = cm > 0 ? effectiveFC / cm : 0;
    const bepUnits = Math.ceil(rawBepUnits);
    const bepRevenue = rawBepUnits * effectiveP;

    const rawTargetUnits = cm > 0 ? (effectiveFC + effectiveTargetProfit) / cm : 0;
    const targetUnits = Math.ceil(rawTargetUnits);
    const targetRevenue = rawTargetUnits * effectiveP;

    // Planned Volume Performance & Margin of Safety
    const plannedRevenue = effectivePlannedQ * effectiveP;
    const plannedTotalVC = effectivePlannedQ * effectiveVC;
    const plannedTotalCost = effectiveFC + plannedTotalVC;
    const plannedOperatingProfit = plannedRevenue - plannedTotalCost;

    const mosUnits = effectivePlannedQ - rawBepUnits;
    const mosRevenue = plannedRevenue - bepRevenue;
    const mosPct = effectivePlannedQ > 0 ? (mosUnits / effectivePlannedQ) * 100 : 0;

    // Degree of Operating Leverage (DOL) at Planned Volume
    // DOL = Total CM / Operating Profit = (Q * CM) / EBIT
    const plannedTotalCM = effectivePlannedQ * cm;
    const dol = plannedOperatingProfit > 0 ? plannedTotalCM / plannedOperatingProfit : 0;

    // Strategic BEP Health Diagnosis
    let healthTitle = '';
    let healthDescription = '';
    let verdictClass = '';
    let badgeClass = '';

    if (plannedOperatingProfit > 500) {
      healthTitle = 'Profitable Safety Cushion (Above BEP)';
      healthDescription = `Planned volume exceeds the Break-Even Point by ${Math.ceil(mosUnits).toLocaleString()} units (${mosPct.toFixed(1)}% Margin of Safety). Sales can decline by up to ${currency}${Math.abs(mosRevenue).toLocaleString(undefined, { maximumFractionDigits: 0 })} before the business incurs an operating loss.`;
      verdictClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    } else if (Math.abs(plannedOperatingProfit) <= 500) {
      healthTitle = 'Exact Break-Even Point (Zero Operating Income)';
      healthDescription = `Planned output exactly covers all fixed and variable overhead ($0 Operating Profit). The business is in exact operational equilibrium with zero margin of safety.`;
      verdictClass = 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800';
      badgeClass = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    } else {
      healthTitle = 'Operating Deficit Warning (Below BEP)';
      healthDescription = `Planned volume is ${Math.ceil(Math.abs(mosUnits)).toLocaleString()} units BELOW the Break-Even Point, resulting in an expected operating loss of ${currency}${Math.abs(plannedOperatingProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })}. Increase volume, raise prices, or cut fixed overhead.`;
      verdictClass = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
      badgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }

    return {
      fixedCost: effectiveFC,
      price: effectiveP,
      variableCost: effectiveVC,
      cm,
      cmr,
      cmrDecimal,
      bepUnits,
      rawBepUnits,
      bepRevenue,
      targetProfit: effectiveTargetProfit,
      targetUnits,
      rawTargetUnits,
      targetRevenue,
      plannedVolume: effectivePlannedQ,
      plannedRevenue,
      plannedTotalVC,
      plannedTotalCost,
      plannedOperatingProfit,
      mosUnits,
      mosRevenue,
      mosPct,
      dol,
      healthTitle,
      healthDescription,
      verdictClass,
      badgeClass,
      isMultiProd
    };
  }, [mode, fixedCost, unitPrice, unitVariableCost, plannedVolume, targetProfit, cmrFixedCost, cmrGrossMarginPct, cmrTargetRevenue, cmrTargetProfit, multiFixedCost, prodAPrice, prodAVc, prodAMix, prodBPrice, prodBVc, prodBMix, prodCPrice, prodCVc, prodCMix, taxFixedCost, taxUnitPrice, taxUnitVc, taxTargetNetIncome, taxRatePct, currency]);

  // 10-Tier Volume & Profit Simulation Schedule (from 0.2*BEP to 2.0*BEP)
  const volumeSchedule = useMemo(() => {
    const baseStep = Math.max(10, Math.round(calc.rawBepUnits / 5));
    const tiers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    return tiers.map((tier) => {
      const curQ = baseStep * tier;
      const curRev = curQ * calc.price;
      const curVC = curQ * calc.variableCost;
      const curTC = calc.fixedCost + curVC;
      const curProfit = curRev - curTC;
      const isCur = Math.abs(curQ - calc.plannedVolume) <= baseStep * 0.5;
      const isBepTier = Math.abs(curQ - calc.rawBepUnits) <= baseStep * 0.5;

      let statusBadge = 'Operating Loss';
      let badgeStyle = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';

      if (curProfit > 50) {
        statusBadge = 'Profitable';
        badgeStyle = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      } else if (Math.abs(curProfit) <= 50) {
        statusBadge = 'Break-Even';
        badgeStyle = 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20';
      }

      return {
        tier,
        quantity: curQ,
        revenue: curRev,
        vc: curVC,
        tc: curTC,
        profit: curProfit,
        isCurrentTier: isCur,
        isBepTier,
        statusBadge,
        badgeStyle
      };
    });
  }, [calc.rawBepUnits, calc.plannedVolume, calc.price, calc.variableCost, calc.fixedCost]);

  // Sensitivity Matrix: Price Changes vs. Fixed Overhead Changes
  const sensitivityMatrix = useMemo(() => {
    const pMultipliers = [0.85, 0.925, 1.0, 1.075, 1.15];
    const fcMultipliers = [0.85, 0.925, 1.0, 1.075, 1.15];
    const baseP = calc.price;
    const baseVC = calc.variableCost;
    const baseFC = calc.fixedCost;

    return pMultipliers.map((pMult) => {
      const rowP = baseP * pMult;
      const rowCols = fcMultipliers.map((fcMult) => {
        const colFC = baseFC * fcMult;
        const impliedCM = rowP - baseVC;
        const impliedBEP = impliedCM > 0 ? Math.ceil(colFC / impliedCM) : 0;
        const impliedRev = impliedBEP * rowP;
        return {
          pMult,
          fcMult,
          rowP,
          colFC,
          impliedBEP,
          impliedRev
        };
      });
      return { pMult, rowP, cols: rowCols };
    });
  }, [calc.price, calc.variableCost, calc.fixedCost]);

  // Copy Full Proof Handler
  const handleCopyProof = () => {
    const text = `=========================================
Break-Even Point (BEP) & CVP Analysis
=========================================
Unit Selling Price (P): ${currency}${calc.price.toFixed(2)}
Unit Variable Cost (VC): ${currency}${calc.variableCost.toFixed(2)}
Total Fixed Overhead (TFC): ${currency}${calc.fixedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}

CONTRIBUTION MARGIN METRICS:
• Unit Contribution Margin (CM = P - VC): ${currency}${calc.cm.toFixed(2)} per unit
• Contribution Margin Ratio (CMR = CM/P): ${calc.cmr.toFixed(2)}%

BREAK-EVEN RESULTS:
• Break-Even Volume (Q_BEP = TFC / CM): ${calc.bepUnits.toLocaleString()} units
• Break-Even Revenue (TR_BEP = Q_BEP × P): ${currency}${calc.bepRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}

TARGET PROFIT REQUIREMENTS:
• Target Profit Desired: ${currency}${calc.targetProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• Volume for Target Profit: ${calc.targetUnits.toLocaleString()} units
• Revenue for Target Profit: ${currency}${calc.targetRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}

PLANNED VOLUME PERFORMANCE (at ${calc.plannedVolume.toLocaleString()} units):
• Planned Total Revenue: ${currency}${calc.plannedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• Planned Operating Income: ${currency}${calc.plannedOperatingProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
• Margin of Safety: ${Math.ceil(calc.mosUnits).toLocaleString()} units (${currency}${calc.mosRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}, ${calc.mosPct.toFixed(1)}%)
• Degree of Operating Leverage (DOL): ${calc.dol.toFixed(2)}x
• Strategic Status: ${calc.healthTitle} - ${calc.healthDescription}

Generated via Toolique Economics Suite (https://www.toolique.in/economics/break-even-point-calculator)
=========================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setMode('standard_units');
    setFixedCost(45000);
    setUnitPrice(120);
    setUnitVariableCost(48);
    setPlannedVolume(900);
    setTargetProfit(25000);
    setCmrFixedCost(60000);
    setCmrGrossMarginPct(65);
    setCmrTargetRevenue(150000);
    setCmrTargetProfit(30000);
    setMultiFixedCost(80000);
    setProdAPrice(50);
    setProdAVc(20);
    setProdAMix(50);
    setProdBPrice(120);
    setProdBVc(45);
    setProdBMix(35);
    setProdCPrice(300);
    setProdCVc(100);
    setProdCMix(15);
    setTaxFixedCost(50000);
    setTaxUnitPrice(100);
    setTaxUnitVc(40);
    setTaxTargetNetIncome(30000);
    setTaxRatePct(25);
  };

  // SVG CVP Graph Parameters
  const maxChartQ = Math.max(calc.rawBepUnits * 1.8, calc.plannedVolume * 1.4, calc.rawTargetUnits * 1.3, 50);
  const maxChartRev = maxChartQ * calc.price;
  const maxChartCost = calc.fixedCost + maxChartQ * calc.variableCost;
  const maxChartY = Math.max(maxChartRev, maxChartCost, 1000) * 1.1;

  const getSvgX = (qVal: number) => {
    return 60 + (Math.min(qVal, maxChartQ) / maxChartQ) * 460;
  };

  const getSvgY = (amountVal: number) => {
    const clamped = Math.max(0, Math.min(amountVal, maxChartY));
    return 210 - (clamped / maxChartY) * 180;
  };

  const bepX = getSvgX(calc.rawBepUnits);
  const bepY = getSvgY(calc.bepRevenue);
  const fcY = getSvgY(calc.fixedCost);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* 1. Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Industry CVP & Break-Even Presets
              </span>
              <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                Click any business model to load real-world cost structures
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
              className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-850/60 hover:border-violet-400 hover:bg-violet-50/30 dark:hover:bg-violet-950/30 transition text-left group cursor-pointer"
            >
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400">
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
          onClick={() => setMode('standard_units')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'standard_units'
              ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Standard Unit CVP
        </button>

        <button
          onClick={() => setMode('revenue_cmr')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'revenue_cmr'
              ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Revenue & Margin Ratio %
        </button>

        <button
          onClick={() => setMode('multi_product')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'multi_product'
              ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Multi-Product Sales Mix
        </button>

        <button
          onClick={() => setMode('target_tax')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'target_tax'
              ? 'bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          After-Tax Target Profit
        </button>
      </div>

      {/* Main Grid: Inputs + Primary Output Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-violet-500" />
                {mode === 'standard_units' && 'Unit-Level Cost Parameters'}
                {mode === 'revenue_cmr' && 'Revenue & Contribution Ratio'}
                {mode === 'multi_product' && '3-Product Line Sales Mix'}
                {mode === 'target_tax' && 'Tax Rate & Net Income Goal'}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">Step 1 of 2</span>
            </div>

            {/* Mode 1: Standard Unit CVP */}
            {mode === 'standard_units' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Total Fixed Overhead Costs ({currency}TFC)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                    <input
                      type="number"
                      step="any"
                      value={fixedCost}
                      onChange={(e) => setFixedCost(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">Rent, permanent salaries, leases, insurance</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Unit Selling Price ({currency}P)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                      <input
                        type="number"
                        step="any"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Unit Variable Cost ({currency}VC)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                      <input
                        type="number"
                        step="any"
                        value={unitVariableCost}
                        onChange={(e) => setUnitVariableCost(parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Planned Sales Volume (Units)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={plannedVolume}
                      onChange={(e) => setPlannedVolume(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Target Profit Goal ({currency})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-zinc-400">{currency}</span>
                      <input
                        type="number"
                        step="any"
                        value={targetProfit}
                        onChange={(e) => setTargetProfit(parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Revenue & CMR % */}
            {mode === 'revenue_cmr' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Total Fixed Costs ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={cmrFixedCost}
                    onChange={(e) => setCmrFixedCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Contribution Margin Ratio (CMR %)
                    </label>
                    <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400">{cmrGrossMarginPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="99"
                    value={cmrGrossMarginPct}
                    onChange={(e) => setCmrGrossMarginPct(parseFloat(e.target.value) || 1)}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Target Revenue ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={cmrTargetRevenue}
                      onChange={(e) => setCmrTargetRevenue(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Target Profit ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={cmrTargetProfit}
                      onChange={(e) => setCmrTargetProfit(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Multi-Product Mix */}
            {mode === 'multi_product' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Combined Total Fixed Costs ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={multiFixedCost}
                    onChange={(e) => setMultiFixedCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                  />
                </div>

                {/* Product A */}
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                  <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 block">Product A (Standard Tier)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500">Price ({currency})</label>
                      <input
                        type="number"
                        step="any"
                        value={prodAPrice}
                        onChange={(e) => setProdAPrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">VC ({currency})</label>
                      <input
                        type="number"
                        step="any"
                        value={prodAVc}
                        onChange={(e) => setProdAVc(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">Sales Mix %</label>
                      <input
                        type="number"
                        step="any"
                        value={prodAMix}
                        onChange={(e) => setProdAMix(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border"
                      />
                    </div>
                  </div>
                </div>

                {/* Product B */}
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">Product B (Premium Tier)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500">Price ({currency})</label>
                      <input
                        type="number"
                        step="any"
                        value={prodBPrice}
                        onChange={(e) => setProdBPrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">VC ({currency})</label>
                      <input
                        type="number"
                        step="any"
                        value={prodBVc}
                        onChange={(e) => setProdBVc(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">Sales Mix %</label>
                      <input
                        type="number"
                        step="any"
                        value={prodBMix}
                        onChange={(e) => setProdBMix(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border"
                      />
                    </div>
                  </div>
                </div>

                {/* Product C */}
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">Product C (Enterprise Tier)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500">Price ({currency})</label>
                      <input
                        type="number"
                        step="any"
                        value={prodCPrice}
                        onChange={(e) => setProdCPrice(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">VC ({currency})</label>
                      <input
                        type="number"
                        step="any"
                        value={prodCVc}
                        onChange={(e) => setProdCVc(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500">Sales Mix %</label>
                      <input
                        type="number"
                        step="any"
                        value={prodCMix}
                        onChange={(e) => setProdCMix(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 4: Target After-Tax Profit */}
            {mode === 'target_tax' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Fixed Overhead ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={taxFixedCost}
                      onChange={(e) => setTaxFixedCost(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Corporate Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={taxRatePct}
                      onChange={(e) => setTaxRatePct(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Unit Price ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={taxUnitPrice}
                      onChange={(e) => setTaxUnitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Unit VC ({currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={taxUnitVc}
                      onChange={(e) => setTaxUnitVc(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Desired Net After-Tax Profit ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={taxTargetNetIncome}
                    onChange={(e) => setTaxTargetNetIncome(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                  />
                  <span className="text-[11px] text-zinc-400 mt-0.5 block">
                    Pre-Tax Operating Income Required: {currency}{Math.round(calc.targetProfit).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Strategic BEP Health Directive Callout */}
          <div className={`p-4 rounded-2xl border transition-all ${calc.verdictClass}`}>
            <div className="flex items-center gap-2 mb-1">
              {calc.plannedOperatingProfit > 500 && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />}
              {Math.abs(calc.plannedOperatingProfit) <= 500 && <Activity className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />}
              {calc.plannedOperatingProfit < -500 && <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />}
              <span className="text-xs font-bold uppercase tracking-wider">{calc.healthTitle}</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {calc.healthDescription}
            </p>
          </div>
        </div>

        {/* Right Output Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Hero BEP Summary Cards */}
          <div className="bg-gradient-to-br from-violet-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-violet-500/20">
            <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-violet-300 flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Break-Even Point (BEP)
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${calc.badgeClass} bg-black/20`}>
                {calc.mosPct >= 0 ? `+${calc.mosPct.toFixed(1)}% MoS` : `${calc.mosPct.toFixed(1)}% Deficit`}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {calc.bepUnits.toLocaleString()}
              </span>
              <span className="text-sm font-medium text-violet-200">units to break even</span>
            </div>

            <p className="text-xs text-violet-200/90 leading-relaxed mb-4">
              Required Break-Even Sales Revenue: <strong className="text-white font-mono">{currency}{calc.bepRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </p>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/10 text-left">
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-violet-300 block">Unit CM (P - VC)</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">{currency}{calc.cm.toFixed(2)}</span>
                <span className="text-[10px] text-violet-200/70">{calc.cmr.toFixed(1)}% CM Ratio</span>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-violet-300 block">Target Profit Units</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">{calc.targetUnits.toLocaleString()}</span>
                <span className="text-[10px] text-violet-200/70">{currency}{calc.targetRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-violet-300 block">Margin of Safety</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">{calc.mosPct.toFixed(1)}%</span>
                <span className="text-[10px] text-violet-200/70">{Math.ceil(calc.mosUnits).toLocaleString()} units</span>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-violet-300 block">Operating Leverage</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">{calc.dol > 0 ? `${calc.dol.toFixed(1)}x` : 'N/A'}</span>
                <span className="text-[10px] text-violet-200/70">DOL Multiplier</span>
              </div>
            </div>
          </div>

          {/* Interactive Continuous SVG CVP Curves Chart */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                Cost-Volume-Profit (CVP) Interactive Graph
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">Continuous Geometry</span>
            </div>

            {/* SVG Visualizer */}
            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 540 230" className="w-full h-auto max-h-[250px] bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 select-none">
                {/* Defs */}
                <defs>
                  <linearGradient id="profitZoneGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
                  </linearGradient>
                  <linearGradient id="lossZoneGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Shaded Loss & Profit Polygons */}
                {/* Loss Polygon: Between TR and TC from Q=0 to Q=BEP */}
                <polygon
                  points={`60,${fcY} ${bepX},${bepY} 60,210`}
                  fill="url(#lossZoneGrad)"
                />
                {/* Profit Polygon: Between TR and TC from Q=BEP to maxQ */}
                <polygon
                  points={`${bepX},${bepY} 520,${getSvgY(maxChartQ * calc.price)} 520,${getSvgY(calc.fixedCost + maxChartQ * calc.variableCost)}`}
                  fill="url(#profitZoneGrad)"
                />

                {/* Grid Lines */}
                <line x1="60" y1="20" x2="60" y2="210" stroke="#71717a" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="60" y1="210" x2="520" y2="210" stroke="#71717a" strokeWidth="1.5" strokeOpacity="0.4" />

                {/* Fixed Cost Line (Horizontal) */}
                <line x1="60" y1={fcY} x2="520" y2={fcY} stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="4 2" strokeOpacity="0.7" />
                <text x="65" y={fcY - 5} fill="#a1a1aa" fontSize="8" fontWeight="bold">
                  Fixed Costs: {currency}{calc.fixedCost >= 1000 ? `${(calc.fixedCost / 1000).toFixed(0)}k` : calc.fixedCost}
                </text>

                {/* Total Cost Line: TC = FC + VC*Q */}
                <line
                  x1="60"
                  y1={fcY}
                  x2="520"
                  y2={getSvgY(calc.fixedCost + maxChartQ * calc.variableCost)}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                />

                {/* Total Revenue Line: TR = P*Q */}
                <line
                  x1="60"
                  y1="210"
                  x2="520"
                  y2={getSvgY(maxChartQ * calc.price)}
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />

                {/* Vertical BEP Guideline */}
                <line x1={bepX} y1="20" x2={bepX} y2="210" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx={bepX} cy={bepY} r="6" fill="#8b5cf6" stroke="#ffffff" strokeWidth="2" />
                <text x={bepX} y={bepY - 10} fill="#8b5cf6" fontSize="9" fontWeight="bold" textAnchor="middle">
                  BEP ({calc.bepUnits} units)
                </text>

                {/* Vertical Planned Volume Guideline */}
                {(() => {
                  const planX = getSvgX(calc.plannedVolume);
                  const planRevY = getSvgY(calc.plannedRevenue);
                  return (
                    <g>
                      <line x1={planX} y1="20" x2={planX} y2="210" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
                      <circle cx={planX} cy={planRevY} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <text x={planX} y="222" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle">
                        Planned ({calc.plannedVolume}u)
                      </text>
                    </g>
                  );
                })()}

                {/* Labels */}
                <text x="522" y={getSvgY(maxChartQ * calc.price) + 4} fill="#3b82f6" fontSize="8" fontWeight="bold">
                  TR (Sales)
                </text>
                <text x="522" y={getSvgY(calc.fixedCost + maxChartQ * calc.variableCost) + 4} fill="#ef4444" fontSize="8" fontWeight="bold">
                  TC (Total Cost)
                </text>
                <text x="80" y="195" fill="#f43f5e" fontSize="8" fontWeight="bold">
                  LOSS ZONE
                </text>
                <text x="460" y="60" fill="#10b981" fontSize="8" fontWeight="bold">
                  PROFIT ZONE
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Total Revenue (<span className="font-mono">TR</span>)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  Total Cost (<span className="font-mono">TC</span>)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-zinc-400 inline-block" />
                  Fixed Overhead (<span className="font-mono">TFC</span>)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
                  Break-Even Intersection
                </span>
              </div>
              <span className="text-zinc-400 italic">Profit = TR − TC</span>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Tier Production & Profit Schedule Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-violet-500" />
              10-Tier Cost-Volume-Profit (CVP) Schedule
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Simulated revenue, variable cost scaling, and operating profit across sales volumes from <span className="font-mono">0.2× BEP</span> to <span className="font-mono">2.0× BEP</span>.
            </p>
          </div>
          <span className="text-xs text-violet-600 dark:text-violet-400 font-semibold">
            ★ Highlighted: Planned Volume Tier
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold bg-zinc-50/50 dark:bg-zinc-800/30">
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Quantity (Q)</th>
                <th className="py-2.5 px-3">Total Revenue ({currency})</th>
                <th className="py-2.5 px-3">Variable Costs ({currency})</th>
                <th className="py-2.5 px-3">Total Costs ({currency})</th>
                <th className="py-2.5 px-3">Operating Profit ({currency})</th>
                <th className="py-2.5 px-3">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
              {volumeSchedule.map((row) => (
                <tr
                  key={row.tier}
                  className={`transition-colors ${
                    row.isCurrentTier
                      ? 'bg-violet-500/10 font-bold text-violet-900 dark:text-violet-200'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <td className="py-2.5 px-3 font-sans">
                    {row.isCurrentTier ? (
                      <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-bold">
                        ★ T{row.tier}
                      </span>
                    ) : (
                      `T${row.tier}`
                    )}
                  </td>
                  <td className="py-2.5 px-3">{row.quantity.toLocaleString()}</td>
                  <td className="py-2.5 px-3">{currency}{row.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="py-2.5 px-3">{currency}{row.vc.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="py-2.5 px-3">{currency}{row.tc.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className={`py-2.5 px-3 font-bold ${row.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {row.profit >= 0 ? '+' : ''}{currency}{row.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${row.badgeStyle}`}>
                      {row.statusBadge}
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
            <Compass className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Sensitivity Matrix: Price Changes vs. Fixed Overhead Variations
            </span>
          </div>
          {showSensitivity ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showSensitivity && (
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Evaluates required Break-Even Units across shifts in unit selling price (Rows: ±15%) and fixed overhead expenses (Columns: ±15%).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                    <th className="p-2 text-left font-semibold text-zinc-500 dark:text-zinc-400">Price Shift \ FC Shift</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">-15% FC</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">-7.5% FC</th>
                    <th className="p-2 font-mono font-bold text-violet-600 dark:text-violet-400">Base FC ({currency}{calc.fixedCost.toLocaleString(undefined, { maximumFractionDigits: 0 })})</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">+7.5% FC</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">+15% FC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                  {sensitivityMatrix.map((row, rIdx) => (
                    <tr key={rIdx} className={row.pMult === 1.0 ? 'bg-violet-500/5 font-semibold' : ''}>
                      <td className="p-2 text-left font-sans font-medium text-zinc-700 dark:text-zinc-300">
                        {row.pMult === 1.0 ? (
                          <span className="text-violet-600 dark:text-violet-400 font-bold">
                            Base Price ({currency}{row.rowP.toFixed(2)})
                          </span>
                        ) : (
                          `${row.pMult > 1.0 ? '+' : ''}${Math.round((row.pMult - 1.0) * 100)}% (${currency}{row.rowP.toFixed(2)})`
                        )}
                      </td>
                      {row.cols.map((col, cIdx) => (
                        <td
                          key={cIdx}
                          className={`p-2 ${
                            col.pMult === 1.0 && col.fcMult === 1.0
                              ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300 font-bold rounded-lg'
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          <div className="font-bold">{col.impliedBEP.toLocaleString()} units</div>
                          <div className="text-[10px] text-zinc-400">{currency}{col.impliedRev.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
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
            <Calculator className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Formal Cost-Volume-Profit Mathematical Proofs & Formulas
            </span>
          </div>
          {showProof ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showProof && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-violet-500" />
                  1. Break-Even Volume Equations
                </h4>
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 text-[11px] space-y-1">
                  <div>Contribution Margin (CM) = P − VC</div>
                  <div>Q_BEP = Total Fixed Costs / CM</div>
                  <div>Sales_BEP = Total Fixed Costs / CMR</div>
                </div>
                <p>
                  Each unit sold contributes <span className="font-mono">{currency}{calc.cm.toFixed(2)}</span> toward liquidating the <span className="font-mono">{currency}{calc.fixedCost.toLocaleString()}</span> fixed overhead hurdle.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-violet-500" />
                  2. Operating Leverage & Margin of Safety
                </h4>
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 text-[11px] space-y-1">
                  <div>Margin of Safety % = (Q_actual − Q_BEP) / Q_actual</div>
                  <div>DOL = Total CM / Operating Income (EBIT)</div>
                </div>
                <p>
                  A DOL of <span className="font-mono">{calc.dol.toFixed(2)}x</span> means a 10% increase in sales volume will boost operating profit by <span className="font-mono">{(calc.dol * 10).toFixed(1)}%</span>.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-500" />
                Active Calculation Verification Proof
              </h4>
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-800 dark:text-zinc-200 space-y-1.5">
                <div>• Unit Contribution: {currency}{calc.price.toFixed(2)} − {currency}{calc.variableCost.toFixed(2)} = {currency}{calc.cm.toFixed(2)} ({calc.cmr.toFixed(2)}% CMR)</div>
                <div>• Break-Even Volume: {currency}{calc.fixedCost.toLocaleString()} / {currency}{calc.cm.toFixed(2)} = {calc.bepUnits.toLocaleString()} units</div>
                <div>• Break-Even Sales Revenue: {calc.bepUnits.toLocaleString()} × {currency}{calc.price.toFixed(2)} = {currency}{calc.bepRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className="pt-1 text-violet-600 dark:text-violet-400 font-bold">
                  • Target Profit Volume ({currency}{calc.targetProfit.toLocaleString()}): ({currency}{calc.fixedCost.toLocaleString()} + {currency}{calc.targetProfit.toLocaleString()}) / {currency}{calc.cm.toFixed(2)} = {calc.targetUnits.toLocaleString()} units
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Academic Guide & Educational FAQ */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Info className="w-5 h-5 text-violet-500" />
            Complete Guide: Cost-Volume-Profit (CVP) Analysis & Break-Even Strategy
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            How managers and financial planners use break-even analysis to price products, manage operating risk, and set production targets.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              1. The Power of Contribution Margin
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every unit sold first covers its own variable manufacturing and fulfillment cost. The remaining cash—the <strong>Contribution Margin</strong>—serves to pay down fixed overhead until the break-even threshold is crossed, after which 100% of CM converts straight to pre-tax operating profit.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              2. Operating Leverage as a Double-Edged Sword
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              High fixed-cost businesses (like software platforms or semiconductor fabs) feature huge Contribution Margin Ratios. Once past the break-even point, profits skyrocket. However, if sales drop slightly, they quickly plummet into deep operating deficits.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              3. Margin of Safety: Risk Management Buffer
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The <strong>Margin of Safety (MoS)</strong> quantifies the percentage buffer by which company sales can drop before the business loses money. Lenders and investors look for an MoS above 20-30% to ensure debt service sustainability during downturns.
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
              q: 'How do I calculate the Break-Even Point for a company with multiple products?',
              a: 'Use the Weighted Average Contribution Margin (WACM). Multiply each product’s unit CM by its proportion in the total sales mix to find the composite CM per bundle, then divide Total Fixed Costs by this composite CM.'
            },
            {
              q: 'What is the difference between Accounting Break-Even and Cash Break-Even?',
              a: 'Accounting Break-Even includes non-cash depreciation and amortization expenses in Total Fixed Costs. Cash Break-Even subtracts non-cash depreciation, showing the minimum sales required to avoid running out of cash.'
            },
            {
              q: 'How does inflation or price changes impact the Break-Even Point?',
              a: 'Raising prices increases unit Contribution Margin, which lowers the number of units required to break even. Conversely, rising supplier costs or higher fixed rent increases the break-even hurdle.'
            },
            {
              q: 'What is the Degree of Operating Leverage (DOL)?',
              a: 'DOL measures a firm’s profit sensitivity to sales fluctuations: DOL = Total Contribution Margin ÷ Operating Income. A DOL of 3.0x indicates that a 10% increase in revenue yields a 30% increase in EBIT.'
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
