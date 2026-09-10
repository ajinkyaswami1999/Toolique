import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2, Info,
  Sliders, ChevronDown, ChevronUp,
  Calculator, TrendingUp, Scale,
  DollarSign, Layers
} from 'lucide-react';

type CalculationMode = 'standard' | 'tax_subsidy' | 'price_controls' | 'market_shifts';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  demandA: number;
  demandB: number;
  supplyC: number;
  supplyD: number;
  taxOrSubsidy: number;
  isSubsidy: boolean;
  priceCeiling: number;
  priceFloor: number;
  controlType: 'none' | 'ceiling' | 'floor';
  deltaA: number;
  deltaC: number;
  description: string;
}

const PRESETS: PresetScenario[] = [
  {
    name: 'Craft Specialty Coffee',
    category: 'Competitive Market',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    mode: 'standard',
    demandA: 600,
    demandB: 40,
    supplyC: 100,
    supplyD: 60,
    taxOrSubsidy: 0,
    isSubsidy: false,
    priceCeiling: 0,
    priceFloor: 0,
    controlType: 'none',
    deltaA: 0,
    deltaC: 0,
    description: 'Perfect benchmark competitive equilibrium for retail coffee bags ($5.00/bag, 400 units).'
  },
  {
    name: 'Gasoline Carbon Excise Tax',
    category: 'Fiscal Policy',
    badgeColor: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800',
    mode: 'tax_subsidy',
    demandA: 800,
    demandB: 50,
    supplyC: 100,
    supplyD: 100,
    taxOrSubsidy: 1.50,
    isSubsidy: false,
    priceCeiling: 0,
    priceFloor: 0,
    controlType: 'none',
    deltaA: 0,
    deltaC: 0,
    description: 'A specific carbon tax of $1.50/gal on fuel creates buyer/seller price wedges, tax revenue, and DWL.'
  },
  {
    name: 'Urban Rent Control Cap',
    category: 'Price Regulation',
    badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800',
    mode: 'price_controls',
    demandA: 1200,
    demandB: 0.8,
    supplyC: 200,
    supplyD: 0.4,
    taxOrSubsidy: 0,
    isSubsidy: false,
    priceCeiling: 700,
    priceFloor: 0,
    controlType: 'ceiling',
    deltaA: 0,
    deltaC: 0,
    description: 'Mandated rent ceiling at $700/mo (below equilibrium) induces an acute rental housing shortage.'
  },
  {
    name: 'Agricultural Grain Support Floor',
    category: 'Price Regulation',
    badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
    mode: 'price_controls',
    demandA: 1000,
    demandB: 80,
    supplyC: 200,
    supplyD: 120,
    taxOrSubsidy: 0,
    isSubsidy: false,
    priceCeiling: 0,
    priceFloor: 5.50,
    controlType: 'floor',
    deltaA: 0,
    deltaC: 0,
    description: 'A statutory price floor of $5.50/bushel (above equilibrium) creates surplus grain requiring stockpiling.'
  },
  {
    name: 'EV Clean Energy Subsidy',
    category: 'Fiscal Policy',
    badgeColor: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800',
    mode: 'tax_subsidy',
    demandA: 2000,
    demandB: 15,
    supplyC: 200,
    supplyD: 25,
    taxOrSubsidy: 8,
    isSubsidy: true,
    priceCeiling: 0,
    priceFloor: 0,
    controlType: 'none',
    deltaA: 0,
    deltaC: 0,
    description: 'Government clean vehicle subsidy reduces buyer price, stimulates adoption, and expands volume.'
  },
  {
    name: 'Semiconductor Tech Shock',
    category: 'Market Shifts',
    badgeColor: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800',
    mode: 'market_shifts',
    demandA: 5000,
    demandB: 25,
    supplyC: 500,
    supplyD: 35,
    taxOrSubsidy: 0,
    isSubsidy: false,
    priceCeiling: 0,
    priceFloor: 0,
    controlType: 'none',
    deltaA: 500,
    deltaC: 800,
    description: 'Simultaneous AI demand boom (+500 intercept) and fab expansion supply shift (+800 intercept).'
  }
];

export default function MarketEquilibriumCalculator() {
  const [currency, setCurrency] = useState<string>('$');
  const [mode, setMode] = useState<CalculationMode>('standard');
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Demand parameters: Qd = a - bP
  const [demandA, setDemandA] = useState<number>(600);
  const [demandB, setDemandB] = useState<number>(40);

  // Supply parameters: Qs = c + dP
  const [supplyC, setSupplyC] = useState<number>(100);
  const [supplyD, setSupplyD] = useState<number>(60);

  // Tax & Subsidy parameters
  const [taxOrSubsidy, setTaxOrSubsidy] = useState<number>(1.50);
  const [isSubsidy, setIsSubsidy] = useState<boolean>(false);

  // Price Controls
  const [controlType, setControlType] = useState<'none' | 'ceiling' | 'floor'>('ceiling');
  const [priceCeiling, setPriceCeiling] = useState<number>(4.00);
  const [priceFloor, setPriceFloor] = useState<number>(6.00);

  // Market Shifts
  const [deltaA, setDeltaA] = useState<number>(100);
  const [deltaC, setDeltaC] = useState<number>(150);

  // Core Math Calculations
  const calc = useMemo(() => {
    const a = demandA;
    const b = demandB > 0 ? demandB : 0.0001;
    const c = supplyC;
    const d = supplyD > 0 ? supplyD : 0.0001;

    // Initial Equilibrium: Qd = Qs => a - bP = c + dP => P* = (a - c) / (b + d)
    const denom = b + d;
    const eqP = (a - c) / denom;
    const eqQ = a - (b * eqP);

    // Choke & Minimum supply price
    const pChokeDemand = a / b;
    const pMinSupply = -c / d; // price where Qs = 0

    // Surpluses
    const cs = Math.max(0, 0.5 * (pChokeDemand - eqP) * eqQ);
    const ps = Math.max(0, 0.5 * (eqP - Math.max(0, pMinSupply)) * eqQ);
    const totalWelfare = cs + ps;

    // Elasticities at equilibrium: Ed = -b * (P/Q), Es = d * (P/Q)
    const ed = eqQ > 0 ? -b * (eqP / eqQ) : 0;
    const es = eqQ > 0 ? d * (eqP / eqQ) : 0;
    const absEd = Math.abs(ed);

    // 1. Tax / Subsidy Mode
    let taxBuyerP = eqP;
    let taxSellerP = eqP;
    let taxQ = eqQ;
    let govRevenue = 0;
    let deadweightLoss = 0;
    let taxCS = cs;
    let taxPS = ps;
    let buyerTaxShare = 0;
    let sellerTaxShare = 0;

    const t = taxOrSubsidy;
    if (mode === 'tax_subsidy' && t > 0) {
      if (!isSubsidy) {
        // Specific Tax: Qs = c + d(P_b - t) => a - bP_b = c + dP_b - dt => (b + d)P_b = a - c + dt
        taxBuyerP = (a - c + (d * t)) / denom;
        taxSellerP = taxBuyerP - t;
        taxQ = Math.max(0, a - (b * taxBuyerP));
        govRevenue = t * taxQ;
        deadweightLoss = Math.max(0, 0.5 * t * (eqQ - taxQ));
        taxCS = Math.max(0, 0.5 * (pChokeDemand - taxBuyerP) * taxQ);
        taxPS = Math.max(0, 0.5 * (taxSellerP - Math.max(0, pMinSupply)) * taxQ);
        buyerTaxShare = t > 0 ? ((taxBuyerP - eqP) / t) * 100 : 50;
        sellerTaxShare = 100 - buyerTaxShare;
      } else {
        // Specific Subsidy: Qs = c + d(P_b + s) => a - bP_b = c + dP_b + ds => (b + d)P_b = a - c - ds
        taxBuyerP = (a - c - (d * t)) / denom;
        taxSellerP = taxBuyerP + t;
        taxQ = Math.max(0, a - (b * taxBuyerP));
        govRevenue = -(t * taxQ); // gov expenditure
        deadweightLoss = Math.max(0, 0.5 * t * (taxQ - eqQ)); // subsidy deadweight loss
        taxCS = Math.max(0, 0.5 * (pChokeDemand - taxBuyerP) * taxQ);
        taxPS = Math.max(0, 0.5 * (taxSellerP - Math.max(0, pMinSupply)) * taxQ);
      }
    }

    // 2. Price Controls Mode
    let controlActive = false;
    let controlState: 'equilibrium' | 'shortage' | 'surplus' = 'equilibrium';
    let controlledPrice = eqP;
    let controlQd = eqQ;
    let controlQs = eqQ;
    let controlQTransacted = eqQ;
    let controlExcess = 0;
    let controlDWL = 0;
    let controlCS = cs;
    let controlPS = ps;

    if (mode === 'price_controls') {
      if (controlType === 'ceiling') {
        controlledPrice = priceCeiling;
        if (controlledPrice < eqP) {
          controlActive = true;
          controlState = 'shortage';
          controlQd = Math.max(0, a - (b * controlledPrice));
          controlQs = Math.max(0, c + (d * controlledPrice));
          controlQTransacted = Math.min(controlQd, controlQs);
          controlExcess = controlQd - controlQs; // Shortage
          // Choke price for transacted quantity on demand curve
          const pWillingness = (a - controlQTransacted) / b;
          // DWL triangle between QTransacted and eqQ
          controlDWL = Math.max(0, 0.5 * (pWillingness - controlledPrice) * (eqQ - controlQTransacted));
          controlPS = Math.max(0, 0.5 * (controlledPrice - Math.max(0, pMinSupply)) * controlQTransacted);
          controlCS = Math.max(0, ((pChokeDemand - pWillingness) * 0.5 * controlQTransacted) + ((pWillingness - controlledPrice) * controlQTransacted));
        }
      } else if (controlType === 'floor') {
        controlledPrice = priceFloor;
        if (controlledPrice > eqP) {
          controlActive = true;
          controlState = 'surplus';
          controlQd = Math.max(0, a - (b * controlledPrice));
          controlQs = Math.max(0, c + (d * controlledPrice));
          controlQTransacted = Math.min(controlQd, controlQs);
          controlExcess = controlQs - controlQd; // Surplus
          // Minimum supply price for transacted quantity
          const pMarginalCost = (controlQTransacted - c) / d;
          controlDWL = Math.max(0, 0.5 * (controlledPrice - pMarginalCost) * (eqQ - controlQTransacted));
          controlCS = Math.max(0, 0.5 * (pChokeDemand - controlledPrice) * controlQTransacted);
          controlPS = Math.max(0, ((controlledPrice - pMarginalCost) * controlQTransacted) + (0.5 * (pMarginalCost - Math.max(0, pMinSupply)) * controlQTransacted));
        }
      }
    }

    // 3. Market Shifts Mode
    const shiftedA = a + deltaA;
    const shiftedC = c + deltaC;
    const shiftedEqP = (shiftedA - shiftedC) / denom;
    const shiftedEqQ = shiftedA - (b * shiftedEqP);
    const shiftedChoke = shiftedA / b;
    const shiftedPMin = -shiftedC / d;
    const shiftedCS = Math.max(0, 0.5 * (shiftedChoke - shiftedEqP) * shiftedEqQ);
    const shiftedPS = Math.max(0, 0.5 * (shiftedEqP - Math.max(0, shiftedPMin)) * shiftedEqQ);
    const deltaEqP = shiftedEqP - eqP;
    const deltaEqQ = shiftedEqQ - eqQ;
    const pctDeltaP = eqP > 0 ? (deltaEqP / eqP) * 100 : 0;
    const pctDeltaQ = eqQ > 0 ? (deltaEqQ / eqQ) * 100 : 0;

    return {
      a, b, c, d, denom,
      demandA: a, demandB: b, supplyC: c, supplyD: d,
      eqP, eqQ,
      pChokeDemand, pMinSupply,
      cs, ps, totalWelfare,
      ed, es, absEd,
      // Tax / Subsidy
      taxBuyerP, taxSellerP, taxQ, govRevenue, deadweightLoss,
      taxCS, taxPS, buyerTaxShare, sellerTaxShare,
      // Controls
      controlActive, controlState, controlledPrice, controlQd, controlQs,
      controlQTransacted, controlExcess, controlDWL, controlCS, controlPS,
      // Shifts
      shiftedA, shiftedC, shiftedEqP, shiftedEqQ, shiftedCS, shiftedPS,
      deltaEqP, deltaEqQ, pctDeltaP, pctDeltaQ
    };
  }, [demandA, demandB, supplyC, supplyD, taxOrSubsidy, isSubsidy, controlType, priceCeiling, priceFloor, deltaA, deltaC, mode]);

  // Load Preset
  const handleApplyPreset = (p: PresetScenario) => {
    setMode(p.mode);
    setDemandA(p.demandA);
    setDemandB(p.demandB);
    setSupplyC(p.supplyC);
    setSupplyD(p.supplyD);
    setTaxOrSubsidy(p.taxOrSubsidy);
    setIsSubsidy(p.isSubsidy);
    setPriceCeiling(p.priceCeiling);
    setPriceFloor(p.priceFloor);
    setControlType(p.controlType);
    setDeltaA(p.deltaA);
    setDeltaC(p.deltaC);
  };

  const handleReset = () => {
    handleApplyPreset(PRESETS[0]);
  };

  const copyLaTeX = () => {
    const latex = `\\begin{aligned}
\\text{Demand:} & \\quad Q_d = ${demandA} - ${demandB}P \\\\
\\text{Supply:} & \\quad Q_s = ${supplyC} + ${supplyD}P \\\\
\\text{Equilibrium Condition:} & \\quad Q_d = Q_s \\implies ${demandA} - ${demandB}P^* = ${supplyC} + ${supplyD}P^* \\\\
P^* & = \\frac{${demandA} - ${supplyC}}{${demandB} + ${supplyD}} = ${calc.eqP.toFixed(2)} \\\\
Q^* & = ${demandA} - (${demandB} \\times ${calc.eqP.toFixed(2)}) = ${calc.eqQ.toFixed(2)} \\\\
\\text{Consumer Surplus (CS)} & = \\frac{1}{2} (${calc.pChokeDemand.toFixed(2)} - ${calc.eqP.toFixed(2)}) \\times ${calc.eqQ.toFixed(2)} = ${calc.cs.toFixed(2)} \\\\
\\text{Producer Surplus (PS)} & = \\frac{1}{2} (${calc.eqP.toFixed(2)} - ${Math.max(0, calc.pMinSupply).toFixed(2)}) \\times ${calc.eqQ.toFixed(2)} = ${calc.ps.toFixed(2)} \\\\
\\text{Total Social Welfare (TSW)} & = CS + PS = ${calc.totalWelfare.toFixed(2)}
\\end{aligned}`;
    navigator.clipboard.writeText(latex);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  // SVG Chart Geometry Preparation
  const chartGeometry = useMemo(() => {
    const width = 600;
    const height = 340;
    const padding = { top: 30, right: 35, bottom: 45, left: 55 };

    const maxP = Math.max(calc.pChokeDemand * 1.15, calc.eqP * 1.6, mode === 'tax_subsidy' ? calc.taxBuyerP * 1.25 : 0, mode === 'price_controls' ? Math.max(priceCeiling, priceFloor) * 1.25 : 0, 10);
    const maxQ = Math.max(calc.demandA * 1.1, calc.eqQ * 1.6, 10);

    const scaleX = (q: number) => padding.left + (Math.max(0, Math.min(q, maxQ)) / maxQ) * (width - padding.left - padding.right);
    const scaleY = (p: number) => height - padding.bottom - (Math.max(0, Math.min(p, maxP)) / maxP) * (height - padding.top - padding.bottom);

    // Points for Demand: (0, Pchoke) to (a, 0)
    const dStart = { x: scaleX(0), y: scaleY(calc.pChokeDemand) };
    const dEnd = { x: scaleX(calc.demandA), y: scaleY(0) };

    // Points for Supply: (max(0, c), max(0, pMin)) to (c + d*maxP, maxP)
    const sStart = { x: scaleX(Math.max(0, calc.supplyC)), y: scaleY(Math.max(0, calc.pMinSupply)) };
    const sEnd = { x: scaleX(calc.supplyC + calc.supplyD * maxP), y: scaleY(maxP) };

    // Equilibrium Point
    const eqPoint = { x: scaleX(calc.eqQ), y: scaleY(calc.eqP) };

    // CS Polygon: (0, Pchoke) -> (Q*, P*) -> (0, P*)
    const csPoly = `${scaleX(0)},${scaleY(calc.pChokeDemand)} ${eqPoint.x},${eqPoint.y} ${scaleX(0)},${scaleY(calc.eqP)}`;

    // PS Polygon: (0, max(0, pMin)) -> (Q*, P*) -> (0, P*)
    const psPoly = `${scaleX(0)},${scaleY(Math.max(0, calc.pMinSupply))} ${eqPoint.x},${eqPoint.y} ${scaleX(0)},${scaleY(calc.eqP)}`;

    return { width, height, padding, maxP, maxQ, scaleX, scaleY, dStart, dEnd, sStart, sEnd, eqPoint, csPoly, psPoly };
  }, [calc, mode, priceCeiling, priceFloor]);

  // 10-Tier Price Sensitivity Schedule
  const priceSchedule = useMemo(() => {
    const baseP = calc.eqP > 0 ? calc.eqP : 10;
    const step = baseP * 0.1;
    const tiers = [];

    for (let i = -5; i <= 5; i++) {
      const p = Math.max(0.1, baseP + i * step);
      const qd = Math.max(0, demandA - demandB * p);
      const qs = Math.max(0, supplyC + supplyD * p);
      const diff = qs - qd;
      let state = 'Equilibrium';
      let stateColor = 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40';

      if (diff > 0.1) {
        state = 'Surplus (Excess Supply)';
        stateColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40';
      } else if (diff < -0.1) {
        state = 'Shortage (Excess Demand)';
        stateColor = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40';
      }

      const csVal = Math.max(0, 0.5 * Math.max(0, calc.pChokeDemand - p) * qd);
      const psVal = Math.max(0, 0.5 * Math.max(0, p - Math.max(0, calc.pMinSupply)) * qs);

      tiers.push({
        price: p,
        qd,
        qs,
        diff,
        state,
        stateColor,
        csVal,
        psVal
      });
    }
    return tiers;
  }, [calc.eqP, calc.pChokeDemand, calc.pMinSupply, demandA, demandB, supplyC, supplyD]);

  // 5x5 Matrix: Variations in Demand Intercept (a) vs Supply Intercept (c)
  const sensitivityMatrix = useMemo(() => {
    const dSteps = [-0.2, -0.1, 0, 0.1, 0.2];
    const sSteps = [-0.2, -0.1, 0, 0.1, 0.2];

    return dSteps.map(dPct => {
      const tempA = demandA * (1 + dPct);
      const row = sSteps.map(sPct => {
        const tempC = supplyC * (1 + sPct);
        const tempEqP = (tempA - tempC) / (demandB + supplyD);
        const tempEqQ = tempA - (demandB * tempEqP);
        return {
          dPct: Math.round(dPct * 100),
          sPct: Math.round(sPct * 100),
          eqP: tempEqP,
          eqQ: tempEqQ
        };
      });
      return { dPct: Math.round(dPct * 100), row };
    });
  }, [demandA, demandB, supplyC, supplyD]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Scale className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Market Equilibrium Suite</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Linear Demand/Supply Solver, Welfare & Government Intervention Analysis</p>
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

        {/* Industry Presets Carousel/Grid */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Select Market Scenario Preset:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleApplyPreset(p)}
                className={`p-2.5 rounded-2xl border text-left transition-all relative group flex flex-col justify-between ${
                  demandA === p.demandA && supplyC === p.supplyC && mode === p.mode
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
            onClick={() => setMode('standard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'standard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            1. Standard Equilibrium (Qd = Qs)
          </button>
          <button
            onClick={() => setMode('tax_subsidy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'tax_subsidy'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            2. Tax & Subsidy Policy (DWL)
          </button>
          <button
            onClick={() => setMode('price_controls')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'price_controls'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            3. Price Controls (Ceilings / Floors)
          </button>
          <button
            onClick={() => setMode('market_shifts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'market_shifts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            4. Demand & Supply Shifts (Δa, Δc)
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs vs Results & SVG Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Equation Inputs & Interventions (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Base Curves Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Demand & Supply Equations
              </h3>
              <span className="text-[11px] font-mono font-bold text-zinc-500">Qd = a − bP | Qs = c + dP</span>
            </div>

            {/* Demand Equation Inputs */}
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-300">
                <span>Demand Curve: Qd = a − b·P</span>
                <span className="text-[11px] font-mono">Choke Price = {currency}{calc.pChokeDemand.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Demand Intercept (a)
                  </label>
                  <input
                    type="number"
                    value={demandA}
                    onChange={(e) => setDemandA(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="text-[10px] text-zinc-400">Max quantity at P=0</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Demand Slope (b)
                  </label>
                  <input
                    type="number"
                    value={demandB}
                    onChange={(e) => setDemandB(parseFloat(e.target.value) || 0.1)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="text-[10px] text-zinc-400">Price sensitivity (ΔQ/ΔP)</span>
                </div>
              </div>
            </div>

            {/* Supply Equation Inputs */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span>Supply Curve: Qs = c + d·P</span>
                <span className="text-[11px] font-mono">Min Price = {currency}{Math.max(0, calc.pMinSupply).toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Supply Intercept (c)
                  </label>
                  <input
                    type="number"
                    value={supplyC}
                    onChange={(e) => setSupplyC(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-zinc-400">Base output at P=0</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Supply Slope (d)
                  </label>
                  <input
                    type="number"
                    value={supplyD}
                    onChange={(e) => setSupplyD(parseFloat(e.target.value) || 0.1)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-zinc-400">Producer responsiveness</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Mode Inputs */}
          {mode === 'tax_subsidy' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  Tax / Subsidy Intervention
                </h3>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setIsSubsidy(false)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${!isSubsidy ? 'bg-white dark:bg-zinc-700 text-rose-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Excise Tax (t)
                  </button>
                  <button
                    onClick={() => setIsSubsidy(true)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${isSubsidy ? 'bg-white dark:bg-zinc-700 text-emerald-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Subsidy (s)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                  Per-Unit Specific {isSubsidy ? 'Subsidy Amount (s)' : 'Tax Rate (t)'} ({currency}/unit)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 font-semibold text-sm">{currency}</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={taxOrSubsidy}
                    onChange={(e) => setTaxOrSubsidy(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-purple-300 dark:border-purple-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  {isSubsidy
                    ? 'Subsidies expand output beyond Q*, creating government fiscal outlay and Deadweight Loss from overproduction.'
                    : 'Taxes drive a wedge between buyer price (Pb) and seller price (Ps), generating revenue and Harberger DWL.'}
                </p>
              </div>
            </div>
          )}

          {mode === 'price_controls' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Statutory Price Controls
                </h3>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setControlType('ceiling')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${controlType === 'ceiling' ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Price Ceiling (Pmax)
                  </button>
                  <button
                    onClick={() => setControlType('floor')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${controlType === 'floor' ? 'bg-white dark:bg-zinc-700 text-emerald-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Price Floor (Pmin)
                  </button>
                </div>
              </div>

              {controlType === 'ceiling' ? (
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Price Ceiling / Maximum Legal Price ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-400 font-semibold text-sm">{currency}</span>
                    <input
                      type="number"
                      step="0.1"
                      value={priceCeiling}
                      onChange={(e) => setPriceCeiling(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Binding if &lt; {currency}{calc.eqP.toFixed(2)}. Causes shortage, rationing queues, and black market pressure.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Price Floor / Minimum Legal Price ({currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-400 font-semibold text-sm">{currency}</span>
                    <input
                      type="number"
                      step="0.1"
                      value={priceFloor}
                      onChange={(e) => setPriceFloor(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Binding if &gt; {currency}{calc.eqP.toFixed(2)}. Causes unsold excess supply (surplus) and minimum wage unemployment.
                  </p>
                </div>
              )}
            </div>
          )}

          {mode === 'market_shifts' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                Simultaneous Market Shifts
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Demand Shift (Δa)
                  </label>
                  <input
                    type="number"
                    value={deltaA}
                    onChange={(e) => setDeltaA(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-cyan-300 dark:border-cyan-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-[10px] text-zinc-400">Positive = Shift Right</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Supply Shift (Δc)
                  </label>
                  <input
                    type="number"
                    value={deltaC}
                    onChange={(e) => setDeltaC(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-cyan-300 dark:border-cyan-800 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="text-[10px] text-zinc-400">Positive = Shift Right</span>
                </div>
              </div>
            </div>
          )}

          {/* Elasticity Insights Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              Equilibrium Point Elasticities
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 text-[11px] block">Price Elasticity of Demand (Ed)</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {calc.ed.toFixed(2)} ({calc.absEd > 1 ? 'Elastic' : calc.absEd === 1 ? 'Unitary' : 'Inelastic'})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500 text-[11px] block">Price Elasticity of Supply (Es)</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {calc.es.toFixed(2)} ({calc.es > 1 ? 'Elastic' : calc.es === 1 ? 'Unitary' : 'Inelastic'})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero KPI Cards & Interactive Marshallian Cross SVG (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Dual Hero Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Equilibrium Price Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 shadow-md">
              <div className="flex items-center justify-between opacity-85 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Market Clearing Price (P*)</span>
                <Scale className="w-4 h-4" />
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight my-2">
                {currency}{calc.eqP.toFixed(2)}
              </div>
              <div className="text-xs text-emerald-100 flex items-center justify-between pt-2 border-t border-emerald-500/40">
                <span>Choke: {currency}{calc.pChokeDemand.toFixed(2)}</span>
                <span>Supply Min: {currency}{Math.max(0, calc.pMinSupply).toFixed(2)}</span>
              </div>
            </div>

            {/* Equilibrium Quantity Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-6 shadow-md">
              <div className="flex items-center justify-between opacity-85 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Market Clearing Output (Q*)</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight my-2">
                {calc.eqQ.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </div>
              <div className="text-xs text-blue-100 flex items-center justify-between pt-2 border-t border-blue-500/40">
                <span>Max Demand: {calc.demandA}</span>
                <span>Base Supply: {calc.supplyC}</span>
              </div>
            </div>
          </div>

          {/* Welfare Surplus & Policy Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                Consumer Surplus (CS)
              </span>
              <span className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
                {currency}{calc.cs.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </span>
              <span className="text-[10px] text-zinc-400">Buyer Welfare Area</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block">
                Producer Surplus (PS)
              </span>
              <span className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
                {currency}{calc.ps.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </span>
              <span className="text-[10px] text-zinc-400">Seller Economic Rent</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 block">
                Total Social Welfare
              </span>
              <span className="text-lg font-black font-mono text-purple-600 dark:text-purple-400 mt-1 block">
                {currency}{calc.totalWelfare.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </span>
              <span className="text-[10px] text-zinc-400">CS + PS Maximum</span>
            </div>
          </div>

          {/* Intervention Policy KPI Bar (When Tax, Subsidy, Controls or Shifts Active) */}
          {mode === 'tax_subsidy' && (
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-purple-800 dark:text-purple-300 font-medium block">Buyer Price (Pb)</span>
                <span className="text-base font-bold font-mono text-purple-900 dark:text-purple-100">
                  {currency}{calc.taxBuyerP.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-purple-800 dark:text-purple-300 font-medium block">Seller Price (Ps)</span>
                <span className="text-base font-bold font-mono text-purple-900 dark:text-purple-100">
                  {currency}{calc.taxSellerP.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-purple-800 dark:text-purple-300 font-medium block">
                  {isSubsidy ? 'Gov Outlay' : 'Gov Tax Revenue'}
                </span>
                <span className="text-base font-bold font-mono text-purple-900 dark:text-purple-100">
                  {currency}{Math.abs(calc.govRevenue).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </span>
              </div>
              <div>
                <span className="text-rose-700 dark:text-rose-300 font-medium block">Deadweight Loss (DWL)</span>
                <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                  {currency}{calc.deadweightLoss.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {mode === 'price_controls' && (
            <div className={`p-4 rounded-2xl border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs ${
              calc.controlState === 'shortage'
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                : calc.controlState === 'surplus'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
            }`}>
              <div>
                <span className="font-medium text-zinc-600 dark:text-zinc-300 block">Policy Status</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {calc.controlActive ? (calc.controlState === 'shortage' ? 'Binding Shortage' : 'Binding Surplus') : 'Non-Binding'}
                </span>
              </div>
              <div>
                <span className="font-medium text-zinc-600 dark:text-zinc-300 block">
                  {calc.controlState === 'shortage' ? 'Unmet Demand (Shortage)' : 'Unsold Goods (Surplus)'}
                </span>
                <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {calc.controlExcess.toFixed(1)} units
                </span>
              </div>
              <div>
                <span className="font-medium text-zinc-600 dark:text-zinc-300 block">Transacted Volume</span>
                <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {calc.controlQTransacted.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="font-medium text-rose-600 dark:text-rose-400 block">Deadweight Loss</span>
                <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
                  {currency}{calc.controlDWL.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {mode === 'market_shifts' && (
            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-cyan-800 dark:text-cyan-300 font-medium block">New Equilibrium Price</span>
                <span className="text-base font-bold font-mono text-cyan-900 dark:text-cyan-100">
                  {currency}{calc.shiftedEqP.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-cyan-800 dark:text-cyan-300 font-medium block">New Equilibrium Qty</span>
                <span className="text-base font-bold font-mono text-cyan-900 dark:text-cyan-100">
                  {calc.shiftedEqQ.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-cyan-800 dark:text-cyan-300 font-medium block">Price Shift (ΔP)</span>
                <span className={`text-base font-bold font-mono ${calc.deltaEqP >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {calc.deltaEqP >= 0 ? '+' : ''}{currency}{calc.deltaEqP.toFixed(2)} ({calc.pctDeltaP.toFixed(1)}%)
                </span>
              </div>
              <div>
                <span className="text-cyan-800 dark:text-cyan-300 font-medium block">Quantity Shift (ΔQ)</span>
                <span className={`text-base font-bold font-mono ${calc.deltaEqQ >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {calc.deltaEqQ >= 0 ? '+' : ''}{calc.deltaEqQ.toFixed(1)} ({calc.pctDeltaQ.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}

          {/* Interactive Marshallian Cross SVG Chart */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                Marshallian Supply & Demand Cross & Social Welfare Surpluses
              </h4>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-rose-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Demand (Qd)
                </span>
                <span className="flex items-center gap-1 text-emerald-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Supply (Qs)
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`} className="w-full h-auto max-h-[350px]">
                <defs>
                  <linearGradient id="csGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
                  </linearGradient>
                  <linearGradient id="psGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.08" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
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

                {/* Shaded Consumer Surplus Triangle */}
                <polygon points={chartGeometry.csPoly} fill="url(#csGradient)" />

                {/* Shaded Producer Surplus Triangle */}
                <polygon points={chartGeometry.psPoly} fill="url(#psGradient)" />

                {/* Demand Line */}
                <line
                  x1={chartGeometry.dStart.x}
                  y1={chartGeometry.dStart.y}
                  x2={chartGeometry.dEnd.x}
                  y2={chartGeometry.dEnd.y}
                  stroke="#f43f5e"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Supply Line */}
                <line
                  x1={chartGeometry.sStart.x}
                  y1={chartGeometry.sStart.y}
                  x2={chartGeometry.sEnd.x}
                  y2={chartGeometry.sEnd.y}
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Dashed Equilibrium Projection Lines */}
                <line
                  x1={chartGeometry.eqPoint.x}
                  y1={chartGeometry.eqPoint.y}
                  x2={chartGeometry.eqPoint.x}
                  y2={chartGeometry.height - chartGeometry.padding.bottom}
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <line
                  x1={chartGeometry.padding.left}
                  y1={chartGeometry.eqPoint.y}
                  x2={chartGeometry.eqPoint.x}
                  y2={chartGeometry.eqPoint.y}
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />

                {/* Equilibrium Point Marker */}
                <circle
                  cx={chartGeometry.eqPoint.x}
                  cy={chartGeometry.eqPoint.y}
                  r="6"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2"
                />

                {/* CS and PS Labels */}
                <text
                  x={chartGeometry.padding.left + (chartGeometry.eqPoint.x - chartGeometry.padding.left) * 0.3}
                  y={chartGeometry.eqPoint.y - (chartGeometry.eqPoint.y - chartGeometry.dStart.y) * 0.3}
                  fill="#059669"
                  fontSize="11"
                  fontWeight="bold"
                >
                  CS
                </text>
                <text
                  x={chartGeometry.padding.left + (chartGeometry.eqPoint.x - chartGeometry.padding.left) * 0.3}
                  y={chartGeometry.eqPoint.y + (chartGeometry.height - chartGeometry.padding.bottom - chartGeometry.eqPoint.y) * 0.4}
                  fill="#2563eb"
                  fontSize="11"
                  fontWeight="bold"
                >
                  PS
                </text>

                {/* Axis Labels */}
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
                  Price (P)
                </text>

                {/* Equilibrium Coordinate Callouts */}
                <text
                  x={chartGeometry.eqPoint.x}
                  y={chartGeometry.height - chartGeometry.padding.bottom + 15}
                  fill="#2563eb"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  Q* = {calc.eqQ.toFixed(1)}
                </text>
                <text
                  x={chartGeometry.padding.left - 8}
                  y={chartGeometry.eqPoint.y + 4}
                  fill="#2563eb"
                  fontSize="10"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  P* = {currency}{calc.eqP.toFixed(2)}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Tier Price Sensitivity Schedule Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">10-Price Market Clearing Schedule</h3>
              <p className="text-xs text-zinc-500">Evaluation of Quantity Demanded vs Supplied across Price Tiers</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg">
            Equilibrium: {currency}{calc.eqP.toFixed(2)} @ {calc.eqQ.toFixed(1)} units
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <th className="p-2.5 font-semibold">Price (P)</th>
                <th className="p-2.5 font-semibold text-rose-600 dark:text-rose-400">Qty Demanded (Qd)</th>
                <th className="p-2.5 font-semibold text-emerald-600 dark:text-emerald-400">Qty Supplied (Qs)</th>
                <th className="p-2.5 font-semibold">Market Condition</th>
                <th className="p-2.5 font-semibold">Excess Volume</th>
                <th className="p-2.5 font-semibold">Consumer Surplus</th>
                <th className="p-2.5 font-semibold">Producer Surplus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {priceSchedule.map((row, idx) => {
                const isEq = Math.abs(row.price - calc.eqP) < (calc.eqP * 0.05);
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isEq
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 font-bold text-blue-900 dark:text-blue-100'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <td className="p-2.5 font-bold">{currency}{row.price.toFixed(2)}</td>
                    <td className="p-2.5 text-rose-600 dark:text-rose-400">{row.qd.toFixed(1)}</td>
                    <td className="p-2.5 text-emerald-600 dark:text-emerald-400">{row.qs.toFixed(1)}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-sans font-semibold ${row.stateColor}`}>
                        {row.state}
                      </span>
                    </td>
                    <td className="p-2.5">
                      {row.diff > 0 ? `+${row.diff.toFixed(1)} (Surplus)` : row.diff < 0 ? `${row.diff.toFixed(1)} (Shortage)` : '0 (Cleared)'}
                    </td>
                    <td className="p-2.5">{currency}{row.csVal.toFixed(1)}</td>
                    <td className="p-2.5">{currency}{row.psVal.toFixed(1)}</td>
                  </tr>
                );
              })}
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
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">5×5 Sensitivity Matrix: Equilibrium Price (P*)</h3>
              <p className="text-xs text-zinc-500">Demand Shifts (Δa) vs Supply Shifts (Δc) Variations (±20%)</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left font-semibold text-zinc-500 dark:text-zinc-400">Demand Intercept \ Supply Intercept</th>
                {[-20, -10, 0, 10, 20].map(s => (
                  <th key={s} className="p-2 font-semibold text-zinc-700 dark:text-zinc-300">
                    Supply {s >= 0 ? `+${s}%` : `${s}%`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {sensitivityMatrix.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="p-2 text-left font-sans font-bold text-zinc-700 dark:text-zinc-300">
                    Demand {row.dPct >= 0 ? `+${row.dPct}%` : `${row.dPct}%`}
                  </td>
                  {row.row.map((cell, cIdx) => {
                    const isBase = cell.dPct === 0 && cell.sPct === 0;
                    return (
                      <td
                        key={cIdx}
                        className={`p-2.5 rounded-lg transition-all ${
                          isBase
                            ? 'bg-blue-100 dark:bg-blue-900/60 font-black text-blue-900 dark:text-blue-100 ring-2 ring-blue-500'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className="font-bold">{currency}{cell.eqP.toFixed(2)}</div>
                        <div className="text-[10px] text-zinc-400">Q={cell.eqQ.toFixed(0)}</div>
                      </td>
                    );
                  })}
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
              <p className="text-xs text-zinc-500">Mathematical derivation of market clearing conditions, consumer/producer surplus, and tax incidence</p>
            </div>
          </div>
          {showAdvanced ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
        </button>

        {showAdvanced && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">1. Market Clearing Condition</h4>
                <p>Equilibrium occurs where quantity demanded equals quantity supplied:</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"Qd = Qs => a - bP* = c + dP* => P* = (a - c) / (b + d)"}
                </div>
                <p>Substituting P* back into either demand or supply yields equilibrium quantity:</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"Q* = a - b[(a - c)/(b + d)] = (ad + bc) / (b + d)"}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">2. Social Welfare & Surplus Measures</h4>
                <p>Consumer Surplus is the triangle below demand and above P*:</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"CS = 0.5 * (P_choke - P*) * Q*, where P_choke = a / b"}
                </div>
                <p>Producer Surplus is the triangle above supply and below P*:</p>
                <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                  {"PS = 0.5 * (P* - P_min) * Q*, where P_min = max(0, -c / d)"}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">3. Tax Incidence & Deadweight Loss (Harberger Triangle)</h4>
              <p>
                A specific per-unit tax t creates a price wedge Pb - Ps = t. The economic burden is distributed according to relative elasticities:
              </p>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                {"Buyer Share = d / (b + d) = Es / (Es + |Ed|), Seller Share = b / (b + d) = |Ed| / (Es + |Ed|)"}
              </div>
              <p>
                The resulting Deadweight Loss (DWL) quantifies the lost gains from trade due to reduced output (Qtax &lt; Q*):
              </p>
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 font-mono text-zinc-800 dark:text-zinc-200">
                {"DWL = 0.5 * t * (Q* - Qtax)"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
