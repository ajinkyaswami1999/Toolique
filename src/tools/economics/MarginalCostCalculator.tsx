import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2, Info,
  TrendingUp, Activity,
  ShieldCheck, Table,
  Sliders, ChevronDown, ChevronUp,
  Layers, DollarSign, Factory,
  Calculator, PieChart, AlertTriangle
} from 'lucide-react';

type CalculationMode = 'discrete' | 'components' | 'cubic' | 'batch';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  q1: number;
  q2: number;
  tc1: number;
  tc2: number;
  fc: number;
  unitPrice: number;
  expectedMc: string;
  notes: string;
}

export default function MarginalCostCalculator() {
  // Mode state
  const [mode, setMode] = useState<CalculationMode>('discrete');
  const [currency, setCurrency] = useState<string>('$');

  // Input states for Discrete Mode
  const [q1, setQ1] = useState<number>(100);
  const [q2, setQ2] = useState<number>(150);
  const [tc1, setTc1] = useState<number>(10000);
  const [tc2, setTc2] = useState<number>(13500);
  const [fixedCost, setFixedCost] = useState<number>(4000);
  const [sellingPrice, setSellingPrice] = useState<number>(90);

  // Input states for Component Breakdown Mode
  const [compQ, setCompQ] = useState<number>(120);
  const [compDirectLabor, setCompDirectLabor] = useState<number>(3500);
  const [compDirectMaterials, setCompDirectMaterials] = useState<number>(4200);
  const [compVariableOverhead, setCompVariableOverhead] = useState<number>(1300);
  const [compFixedRentEquipment, setCompFixedRentEquipment] = useState<number>(3000);
  const [compNextUnitLabor, setCompNextUnitLabor] = useState<number>(32);
  const [compNextUnitMaterial, setCompNextUnitMaterial] = useState<number>(38);

  // Input states for Cubic Cost Function Mode: TC = FC + a*Q - b*Q^2 + c*Q^3
  const [cubicFC, setCubicFC] = useState<number>(5000);
  const [cubicA, setCubicA] = useState<number>(60);
  const [cubicB, setCubicB] = useState<number>(0.4);
  const [cubicC, setCubicC] = useState<number>(0.003);
  const [cubicEvalQ, setCubicEvalQ] = useState<number>(100);

  // Input states for Batch Output Simulator
  const [simBaseQ, setSimBaseQ] = useState<number>(100);
  const [simBaseTC, setSimBaseTC] = useState<number>(10000);
  const [simBaseFC, setSimBaseFC] = useState<number>(4000);
  const [simBatchSize, setSimBatchSize] = useState<number>(25);
  const [simCostPerUnitAdded, setSimCostPerUnitAdded] = useState<number>(70);

  // UI States
  const [copied, setCopied] = useState(false);
  const [showProof, setShowProof] = useState(true);
  const [showSensitivity, setShowSensitivity] = useState(true);

  // Real-world Presets
  const presets: PresetScenario[] = [
    {
      name: '🚗 Automotive Assembly Plant',
      category: 'High Fixed Cap-Ex',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      q1: 500,
      q2: 650,
      tc1: 25000000,
      tc2: 29800000,
      fc: 15000000,
      unitPrice: 42000,
      expectedMc: '$32,000 / car',
      notes: 'Heavy robotic welding equipment drives high initial AFC; marginal costs stabilize at scale.'
    },
    {
      name: '☕ Artisan Coffee Roastery & Cafe',
      category: 'Variable Labor Intensive',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      q1: 1000,
      q2: 1500,
      tc1: 4500,
      tc2: 5800,
      fc: 1800,
      unitPrice: 5.50,
      expectedMc: '$2.60 / cup',
      notes: 'Low fixed lease overhead; costs scale predictably with milk, espresso beans, and barista shifts.'
    },
    {
      name: '👕 Apparel & Textile Factory',
      category: 'Piece-Rate Manufacturing',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      q1: 2000,
      q2: 3000,
      tc1: 28000,
      tc2: 39000,
      fc: 8000,
      unitPrice: 22.0,
      expectedMc: '$11.00 / shirt',
      notes: 'Fabric and sewing labor scale linearly until second-shift overtime kicks in.'
    },
    {
      name: '💊 Biotech & Sterile Pharma Batch',
      category: 'Ultra-High Fixed R&D',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      q1: 10000,
      q2: 25000,
      tc1: 1200000,
      tc2: 1380000,
      fc: 1000000,
      unitPrice: 120.0,
      expectedMc: '$12.00 / vial',
      notes: 'Clinical trials and cleanroom certification represent 85% of total cost; incremental vials cost pennies.'
    },
    {
      name: '🖥️ Semiconductor Fab Packaging',
      category: 'Extreme Economies of Scale',
      badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      q1: 50000,
      q2: 80000,
      tc1: 8500000,
      tc2: 11200000,
      fc: 6000000,
      unitPrice: 180.0,
      expectedMc: '$90.00 / wafer',
      notes: 'Photolithography yields improve dramatically with volume, slashing unit marginal costs.'
    },
    {
      name: '🍕 Commercial Bakery & Food Processing',
      category: 'Continuous Line Bottleneck',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      q1: 5000,
      q2: 6200,
      tc1: 16000,
      tc2: 21400,
      fc: 4500,
      unitPrice: 4.80,
      expectedMc: '$4.50 / loaf',
      notes: 'Oven throughput constraints create diminishing marginal returns when running above rated speed.'
    }
  ];

  const handleApplyPreset = (preset: PresetScenario) => {
    setMode('discrete');
    setQ1(preset.q1);
    setQ2(preset.q2);
    setTc1(preset.tc1);
    setTc2(preset.tc2);
    setFixedCost(preset.fc);
    setSellingPrice(preset.unitPrice);
  };

  // Main Calculation Engine
  const calc = useMemo(() => {
    let effectiveQ1 = q1;
    let effectiveQ2 = q2;
    let effectiveTc1 = tc1;
    let effectiveTc2 = tc2;
    let effectiveFC = fixedCost;
    let rawMc = 0;
    let deltaTC = 0;
    let deltaQ = 0;

    if (mode === 'discrete') {
      deltaTC = tc2 - tc1;
      deltaQ = q2 - q1;
      rawMc = deltaQ !== 0 ? deltaTC / deltaQ : 0;
      effectiveQ1 = q1;
      effectiveQ2 = q2;
      effectiveTc1 = tc1;
      effectiveTc2 = tc2;
      effectiveFC = fixedCost;
    } else if (mode === 'components') {
      effectiveQ2 = compQ;
      effectiveQ1 = Math.max(1, compQ - 10);
      effectiveFC = compFixedRentEquipment;
      const curVC = compDirectLabor + compDirectMaterials + compVariableOverhead;
      effectiveTc2 = effectiveFC + curVC;
      const nextUnitVar = compNextUnitLabor + compNextUnitMaterial;
      rawMc = nextUnitVar;
      deltaQ = 10;
      deltaTC = nextUnitVar * 10;
      effectiveTc1 = effectiveTc2 - deltaTC;
    } else if (mode === 'cubic') {
      // TC = FC + a*Q - b*Q^2 + c*Q^3
      effectiveQ2 = cubicEvalQ;
      effectiveQ1 = Math.max(1, cubicEvalQ - 1);
      effectiveFC = cubicFC;
      const getCubicTC = (qVal: number) => cubicFC + cubicA * qVal - cubicB * Math.pow(qVal, 2) + cubicC * Math.pow(qVal, 3);
      effectiveTc2 = getCubicTC(cubicEvalQ);
      effectiveTc1 = getCubicTC(effectiveQ1);
      deltaQ = 1;
      deltaTC = effectiveTc2 - effectiveTc1;
      // Derivative: MC = a - 2*b*Q + 3*c*Q^2
      rawMc = cubicA - 2 * cubicB * cubicEvalQ + 3 * cubicC * Math.pow(cubicEvalQ, 2);
    } else if (mode === 'batch') {
      effectiveQ1 = simBaseQ;
      effectiveQ2 = simBaseQ + simBatchSize;
      effectiveFC = simBaseFC;
      effectiveTc1 = simBaseTC;
      deltaQ = simBatchSize;
      deltaTC = simBatchSize * simCostPerUnitAdded;
      effectiveTc2 = effectiveTc1 + deltaTC;
      rawMc = simCostPerUnitAdded;
    }

    const mc = isNaN(rawMc) || !isFinite(rawMc) ? 0 : rawMc;
    const vc2 = Math.max(0, effectiveTc2 - effectiveFC);
    const vc1 = Math.max(0, effectiveTc1 - effectiveFC);
    const atc2 = effectiveQ2 > 0 ? effectiveTc2 / effectiveQ2 : 0;
    const afc2 = effectiveQ2 > 0 ? effectiveFC / effectiveQ2 : 0;
    const avc2 = effectiveQ2 > 0 ? vc2 / effectiveQ2 : 0;

    const atc1 = effectiveQ1 > 0 ? effectiveTc1 / effectiveQ1 : 0;
    const afc1 = effectiveQ1 > 0 ? effectiveFC / effectiveQ1 : 0;
    const avc1 = effectiveQ1 > 0 ? vc1 / effectiveQ1 : 0;

    // Production Phase & Returns Diagnosis
    let productionPhase: 'increasing_returns' | 'optimal_scale' | 'diminishing_returns' = 'increasing_returns';
    let phaseTitle = '';
    let phaseDescription = '';
    let badgeClass = '';

    if (mc < atc2 - 0.05 * atc2) {
      productionPhase = 'increasing_returns';
      phaseTitle = 'Economies of Scale (MC < ATC)';
      phaseDescription = 'Producing additional units pulls down the Average Total Cost. Expand production to maximize scale efficiencies.';
      badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    } else if (Math.abs(mc - atc2) <= 0.05 * atc2) {
      productionPhase = 'optimal_scale';
      phaseTitle = 'Minimum Efficient Scale (MC ≈ ATC)';
      phaseDescription = 'Operating at peak unit cost efficiency. Total average cost per unit is minimized.';
      badgeClass = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    } else {
      productionPhase = 'diminishing_returns';
      phaseTitle = 'Diseconomies of Scale (MC > ATC)';
      phaseDescription = 'Each additional unit costs more than the average, dragging up unit costs due to overtime, maintenance, or capacity congestion.';
      badgeClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }

    // Profitability & Shutdown Decision Rules
    let shutdownVerdict = '';
    let shutdownClass = '';
    if (sellingPrice >= atc2) {
      shutdownVerdict = 'Profitable Operation (P ≥ ATC): The business generates economic profit.';
      shutdownClass = 'text-emerald-600 dark:text-emerald-400';
    } else if (sellingPrice >= avc2) {
      shutdownVerdict = 'Short-Run Operation (AVC ≤ P < ATC): Operating covers variable costs and partially pays fixed rent.';
      shutdownClass = 'text-amber-600 dark:text-amber-400';
    } else {
      shutdownVerdict = 'Shutdown Condition (P < AVC): The factory should halt production immediately to minimize cash burn.';
      shutdownClass = 'text-rose-600 dark:text-rose-400';
    }

    // Cost Structure Breakdown (Fixed vs Variable %)
    const fixedPct = effectiveTc2 > 0 ? (effectiveFC / effectiveTc2) * 100 : 0;
    const variablePct = 100 - fixedPct;

    return {
      q1: effectiveQ1,
      q2: effectiveQ2,
      tc1: effectiveTc1,
      tc2: effectiveTc2,
      fc: effectiveFC,
      vc1,
      vc2,
      deltaTC,
      deltaQ,
      mc,
      atc1,
      atc2,
      afc1,
      afc2,
      avc1,
      avc2,
      productionPhase,
      phaseTitle,
      phaseDescription,
      badgeClass,
      shutdownVerdict,
      shutdownClass,
      fixedPct,
      variablePct
    };
  }, [mode, q1, q2, tc1, tc2, fixedCost, sellingPrice, compQ, compDirectLabor, compDirectMaterials, compVariableOverhead, compFixedRentEquipment, compNextUnitLabor, compNextUnitMaterial, cubicFC, cubicA, cubicB, cubicC, cubicEvalQ, simBaseQ, simBaseTC, simBaseFC, simBatchSize, simCostPerUnitAdded]);

  // Cost Schedule Simulation (1 to 10 Production Tiers)
  const costSchedule = useMemo(() => {
    const baseQ = Math.max(10, Math.round(calc.q2 / 5));
    const tiers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const fc = calc.fc;

    return tiers.map((tier) => {
      const curQ = baseQ * tier;
      let curTC = 0;
      let curMC = 0;

      if (mode === 'cubic') {
        curTC = cubicFC + cubicA * curQ - cubicB * Math.pow(curQ, 2) + cubicC * Math.pow(curQ, 3);
        curMC = cubicA - 2 * cubicB * curQ + 3 * cubicC * Math.pow(curQ, 2);
      } else {
        // Modeled U-shaped cost function calibrated around user's active baseline
        const baseUnitVC = calc.avc2 || 40;
        // Quadratic variable cost to capture diminishing returns
        const qRatio = curQ / (calc.q2 || 100);
        const curVC = baseUnitVC * curQ * (0.6 + 0.4 * Math.pow(qRatio, 1.3));
        curTC = fc + curVC;
        const prevQ = curQ - baseQ;
        const prevVC = prevQ > 0 ? baseUnitVC * prevQ * (0.6 + 0.4 * Math.pow(prevQ / (calc.q2 || 100), 1.3)) : 0;
        curMC = prevQ > 0 ? (curVC - prevVC) / baseQ : baseUnitVC * 0.7;
      }

      const curVC = Math.max(0, curTC - fc);
      const curATC = curQ > 0 ? curTC / curQ : 0;
      const curAFC = curQ > 0 ? fc / curQ : 0;
      const curAVC = curQ > 0 ? curVC / curQ : 0;

      return {
        tier,
        quantity: curQ,
        fc,
        vc: curVC,
        tc: curTC,
        afc: curAFC,
        avc: curAVC,
        atc: curATC,
        mc: curMC,
        isCurrentTier: Math.abs(curQ - calc.q2) <= baseQ * 0.5
      };
    });
  }, [calc.q2, calc.fc, calc.avc2, mode, cubicFC, cubicA, cubicB, cubicC]);

  // Copy Full Proof Handler
  const handleCopyProof = () => {
    const text = `=========================================
Marginal Cost & Production Cost Structure
=========================================
Output Transition: ${calc.q1} units → ${calc.q2} units (ΔQ = ${calc.deltaQ >= 0 ? '+' : ''}${calc.deltaQ} units)
Total Cost Transition: ${currency}${calc.tc1.toLocaleString(undefined, { minimumFractionDigits: 2 })} → ${currency}${calc.tc2.toLocaleString(undefined, { minimumFractionDigits: 2 })} (ΔTC = ${calc.deltaTC >= 0 ? '+' : ''}${currency}${calc.deltaTC.toLocaleString(undefined, { minimumFractionDigits: 2 })})
Fixed Overhead Cost (TFC): ${currency}${calc.fc.toLocaleString(undefined, { minimumFractionDigits: 2 })}

UNIT COST RESULTS (at Output Q = ${calc.q2}):
• Marginal Cost (MC = ΔTC/ΔQ): ${currency}${calc.mc.toFixed(2)} per unit
• Average Total Cost (ATC = TC/Q): ${currency}${calc.atc2.toFixed(2)} per unit
• Average Variable Cost (AVC = VC/Q): ${currency}${calc.avc2.toFixed(2)} per unit
• Average Fixed Cost (AFC = FC/Q): ${currency}${calc.afc2.toFixed(2)} per unit
• Identity Check: ${currency}${calc.afc2.toFixed(2)} (AFC) + ${currency}${calc.avc2.toFixed(2)} (AVC) = ${currency}${(calc.afc2 + calc.avc2).toFixed(2)} (ATC)

PRODUCTION SCALE DIAGNOSIS:
• Phase: ${calc.phaseTitle}
• Explanation: ${calc.phaseDescription}

PROFITABILITY & SHUTDOWN RULE (at Market Price ${currency}${sellingPrice.toFixed(2)}):
• ${calc.shutdownVerdict}

Generated via Toolique Economics Suite (https://www.toolique.in/economics/marginal-cost-calculator)
=========================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setQ1(100);
    setQ2(150);
    setTc1(10000);
    setTc2(13500);
    setFixedCost(4000);
    setSellingPrice(90);
    setCompQ(120);
    setCompDirectLabor(3500);
    setCompDirectMaterials(4200);
    setCompVariableOverhead(1300);
    setCompFixedRentEquipment(3000);
    setCompNextUnitLabor(32);
    setCompNextUnitMaterial(38);
    setCubicFC(5000);
    setCubicA(60);
    setCubicB(0.4);
    setCubicC(0.003);
    setCubicEvalQ(100);
    setSimBaseQ(100);
    setSimBaseTC(10000);
    setSimBaseFC(4000);
    setSimBatchSize(25);
    setSimCostPerUnitAdded(70);
    setMode('discrete');
  };

  // SVG Cost Curves Coordinates
  const svgWidth = 440;
  const svgHeight = 280;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;

  const graphWidth = svgWidth - padLeft - padRight;
  const graphHeight = svgHeight - padTop - padBottom;

  const maxPlotQ = Math.max(...costSchedule.map(s => s.quantity)) * 1.1 || 500;
  const maxPlotCost = Math.max(calc.atc2 * 1.8, calc.mc * 1.8, 100) || 150;

  const getSvgX = (qVal: number) => padLeft + (Math.max(0, qVal) / maxPlotQ) * graphWidth;
  const getSvgY = (costVal: number) => padTop + graphHeight - (Math.max(0, costVal) / maxPlotCost) * graphHeight;

  const ptMcX = getSvgX(calc.q2);
  const ptMcY = getSvgY(calc.mc);
  const ptAtcX = getSvgX(calc.q2);
  const ptAtcY = getSvgY(calc.atc2);

  const atcPath = useMemo(() => {
    return costSchedule.reduce((acc, pt, idx) => {
      const x = getSvgX(pt.quantity);
      const y = getSvgY(pt.atc);
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [costSchedule, maxPlotQ, maxPlotCost]);

  const mcPath = useMemo(() => {
    return costSchedule.reduce((acc, pt, idx) => {
      const x = getSvgX(pt.quantity);
      const y = getSvgY(pt.mc);
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [costSchedule, maxPlotQ, maxPlotCost]);

  const avcPath = useMemo(() => {
    return costSchedule.reduce((acc, pt, idx) => {
      const x = getSvgX(pt.quantity);
      const y = getSvgY(pt.avc);
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [costSchedule, maxPlotQ, maxPlotCost]);

  const afcPath = useMemo(() => {
    return costSchedule.reduce((acc, pt, idx) => {
      const x = getSvgX(pt.quantity);
      const y = getSvgY(pt.afc);
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
  }, [costSchedule, maxPlotQ, maxPlotCost]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* 1. Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Industry Cost Structure Presets
              </span>
              <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                Click any production scenario to load real-world factory overhead & variable scaling
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
              className="p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-800 text-left transition group cursor-pointer"
            >
              <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 truncate">
                {p.name}
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate font-mono">
                {p.expectedMc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Calculation Mode Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setMode('discrete')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'discrete'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Incremental ΔTC / ΔQ</span>
        </button>

        <button
          onClick={() => setMode('components')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'components'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Cost Components Breakdown</span>
        </button>

        <button
          onClick={() => setMode('cubic')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'cubic'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Cubic Cost Function (Calculus)</span>
        </button>

        <button
          onClick={() => setMode('batch')}
          className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'batch'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Batch Output Simulator</span>
        </button>
      </div>

      {/* 3. Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-500" />
              <span>Input Parameters</span>
            </h2>
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg">
              {mode.toUpperCase()} MODE
            </span>
          </div>

          {/* Conditional Input Fields */}
          {mode === 'discrete' && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Factory className="w-3.5 h-3.5 text-rose-500" />
                  Production Output Levels (Units Q)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Initial Output (Q₁)</label>
                    <input
                      type="number"
                      min="0"
                      value={q1}
                      onChange={(e) => setQ1(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">New Output (Q₂)</label>
                    <input
                      type="number"
                      min="1"
                      value={q2}
                      onChange={(e) => setQ2(Math.max(1, parseFloat(e.target.value) || 1))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  Total Production Costs ({currency}TC)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">Initial Cost (TC₁)</label>
                    <input
                      type="number"
                      min="0"
                      value={tc1}
                      onChange={(e) => setTc1(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">New Cost (TC₂)</label>
                    <input
                      type="number"
                      min="0"
                      value={tc2}
                      onChange={(e) => setTc2(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Total Fixed Cost ({currency}TFC)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={fixedCost}
                    onChange={(e) => setFixedCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Selling Price / Unit ({currency}P)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'components' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Total Output Batch (Units Q)</label>
                <input
                  type="number"
                  min="1"
                  value={compQ}
                  onChange={(e) => setCompQ(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white"
                />
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-3">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Variable Cost Items ({currency}TVC)</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Direct Labor</label>
                    <input
                      type="number"
                      value={compDirectLabor}
                      onChange={(e) => setCompDirectLabor(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Raw Materials</label>
                    <input
                      type="number"
                      value={compDirectMaterials}
                      onChange={(e) => setCompDirectMaterials(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Variable OH</label>
                    <input
                      type="number"
                      value={compVariableOverhead}
                      onChange={(e) => setCompVariableOverhead(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Fixed Plant Rent ({currency}FC)</label>
                  <input
                    type="number"
                    value={compFixedRentEquipment}
                    onChange={(e) => setCompFixedRentEquipment(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Next Unit Labor+Mat ({currency}MC)</label>
                  <input
                    type="number"
                    value={compNextUnitLabor + compNextUnitMaterial}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setCompNextUnitLabor(v * 0.45);
                      setCompNextUnitMaterial(v * 0.55);
                    }}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Selling Price ({currency}P)</label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold"
                />
              </div>
            </div>
          )}

          {mode === 'cubic' && (
            <div className="space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Cubic Cost: TC = FC + a·Q - b·Q² + c·Q³
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Fixed Cost ({currency}FC)</label>
                    <input
                      type="number"
                      value={cubicFC}
                      onChange={(e) => setCubicFC(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Linear (a)</label>
                    <input
                      type="number"
                      value={cubicA}
                      onChange={(e) => setCubicA(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Quadratic (b)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cubicB}
                      onChange={(e) => setCubicB(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">Cubic (c)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={cubicC}
                      onChange={(e) => setCubicC(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Evaluation Output (Q)</label>
                  <input
                    type="number"
                    min="1"
                    value={cubicEvalQ}
                    onChange={(e) => setCubicEvalQ(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Selling Price ({currency}P)</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'batch' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Base Output (Q₁)</label>
                  <input
                    type="number"
                    value={simBaseQ}
                    onChange={(e) => setSimBaseQ(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Base Total Cost ({currency}TC₁)</label>
                  <input
                    type="number"
                    value={simBaseTC}
                    onChange={(e) => setSimBaseTC(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Fixed Costs ({currency}FC)</label>
                  <input
                    type="number"
                    value={simBaseFC}
                    onChange={(e) => setSimBaseFC(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Batch Addition (ΔQ)</label>
                  <input
                    type="number"
                    min="1"
                    value={simBatchSize}
                    onChange={(e) => setSimBatchSize(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Cost Per Additional Unit ({currency}MC)</label>
                <input
                  type="number"
                  value={simCostPerUnitAdded}
                  onChange={(e) => setSimCostPerUnitAdded(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold"
                />
              </div>
            </div>
          )}

          {/* Fixed vs Variable Cost Proportional Bar */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
            <div className="flex justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <span>Cost Structure Breakdown</span>
              <span>Fixed {calc.fixedPct.toFixed(0)}% | Variable {calc.variablePct.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex">
              <div className="bg-indigo-500 h-full" style={{ width: `${calc.fixedPct}%` }} title={`Fixed Costs: ${currency}{calc.fc.toLocaleString()}`} />
              <div className="bg-rose-500 h-full" style={{ width: `${calc.variablePct}%` }} title={`Variable Costs: ${currency}{calc.vc2.toLocaleString()}`} />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>TFC: {currency}{calc.fc.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span>TVC: {currency}{calc.vc2.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>

        {/* Right Results & Visualizations Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Hero Result Box */}
          <div className="bg-gradient-to-br from-rose-900 via-pink-950 to-zinc-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs uppercase font-black tracking-widest text-rose-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Marginal Cost (MC)
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md ${calc.badgeClass}`}>
                  {calc.phaseTitle}
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">{currency}{calc.mc.toFixed(2)}
                </div>
                <div className="text-xs text-rose-200 font-mono">
                  per additional unit (ΔTC/ΔQ)
                </div>
              </div>

              {/* Economic Diagnosis Box */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1.5">
                <div className="text-xs font-semibold text-rose-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-300" />
                  <span>Production Scale Insight</span>
                </div>
                <p className="text-xs text-rose-50 leading-relaxed">
                  {calc.phaseDescription}
                </p>
                <div className="text-[11px] text-rose-200/90 pt-1 border-t border-white/10 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                  <span>{calc.shutdownVerdict}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Unit Cost Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">Average Total (ATC)</div>
              <div className="text-lg font-black font-mono text-zinc-900 dark:text-white mt-1">{currency}{calc.atc2.toFixed(2)}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">Avg Variable (AVC)</div>
              <div className="text-lg font-black font-mono text-rose-600 mt-1">{currency}{calc.avc2.toFixed(2)}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">Avg Fixed (AFC)</div>
              <div className="text-lg font-black font-mono text-indigo-600 mt-1">{currency}{calc.afc2.toFixed(2)}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="text-[11px] font-semibold text-zinc-500">Total Cost ({currency}TC₂)</div>
              <div className="text-lg font-black font-mono text-zinc-900 dark:text-white mt-1">{currency}{calc.tc2.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Interactive SVG Cost Curves Graph */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  Cost Curves: MC, ATC, AVC, AFC
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="text-rose-500 font-bold flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-rose-500 inline-block" /> MC
                </span>
                <span className="text-zinc-900 dark:text-white font-bold flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-zinc-900 dark:bg-white inline-block" /> ATC
                </span>
                <span className="text-amber-500 font-bold flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-amber-500 inline-block" /> AVC
                </span>
                <span className="text-indigo-400 font-bold flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-indigo-400 inline-block" /> AFC
                </span>
              </div>
            </div>

            <div className="w-full flex justify-center bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl p-2 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[480px] h-auto select-none font-mono">
                {/* Grid Lines */}
                <line x1={padLeft} y1={padTop} x2={padLeft + graphWidth} y2={padTop} stroke="#71717a" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1={padLeft} y1={padTop + graphHeight / 2} x2={padLeft + graphWidth} y2={padTop + graphHeight / 2} stroke="#71717a" strokeOpacity="0.2" strokeDasharray="3 3" />
                <line x1={padLeft + graphWidth / 2} y1={padTop} x2={padLeft + graphWidth / 2} y2={padTop + graphHeight} stroke="#71717a" strokeOpacity="0.2" strokeDasharray="3 3" />

                {/* X & Y Axes */}
                <line x1={padLeft} y1={padTop + graphHeight} x2={padLeft + graphWidth} y2={padTop + graphHeight} stroke="#71717a" strokeWidth="1.5" />
                <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + graphHeight} stroke="#71717a" strokeWidth="1.5" />

                {/* Axis Labels */}
                <text x={padLeft + graphWidth / 2} y={svgHeight - 10} textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="bold">
                  Output Quantity (Q) →
                </text>
                <text transform={`rotate(-90 15 ${padTop + graphHeight / 2})`} x={15} y={padTop + graphHeight / 2} textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="bold">
                  Cost Per Unit ({currency}) →
                </text>

                {/* Continuous Curves */}
                {afcPath && <path d={afcPath} fill="none" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 2" />}
                {avcPath && <path d={avcPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" />}
                {atcPath && <path d={atcPath} fill="none" stroke="#e4e4e7" strokeWidth="3" />}
                {mcPath && <path d={mcPath} fill="none" stroke="#f43f5e" strokeWidth="3.5" />}

                {/* Active MC Point Marker */}
                <circle cx={ptMcX} cy={ptMcY} r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                <text x={ptMcX + 8} y={ptMcY - 6} fill="#f43f5e" fontSize="10" fontWeight="bold">
                  MC (${calc.mc.toFixed(1)})
                </text>

                {/* Active ATC Point Marker */}
                <circle cx={ptAtcX} cy={ptAtcY} r="5" fill="#e4e4e7" stroke="#18181b" strokeWidth="2" />
                <text x={ptAtcX + 8} y={ptAtcY + 14} fill="#e4e4e7" fontSize="10" fontWeight="bold">
                  ATC (${calc.atc2.toFixed(1)})
                </text>
              </svg>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
              The Marginal Cost curve cuts through the bottom minimum of the Average Total Cost (ATC) curve at the Minimum Efficient Scale.
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
            <Info className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-rose-600 transition">
              Step-by-Step Mathematical Proof & Identity Check
            </span>
          </div>
          {showProof ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showProof && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 font-mono text-xs">
            {/* Step 1 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 1: Extract Production Output & Total Costs</span>
              <div className="text-zinc-900 dark:text-zinc-200">
                Initial: Q₁ = {calc.q1} units, TC₁ = ${calc.tc1.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-zinc-900 dark:text-zinc-200">
                New: Q₂ = {calc.q2} units, TC₂ = ${currency}{calc.tc2.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-zinc-500 text-[11px]">
                Total Fixed Costs (TFC) = ${currency}{calc.fc.toLocaleString(undefined, { minimumFractionDigits: 2 })} | Total Variable Cost (TVC₂) = ${currency}{calc.vc2.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 2: Compute Incremental Marginal Cost (MC)</span>
              <div className="text-zinc-900 dark:text-zinc-200">
                ΔTC = TC₂ - TC₁ = ${currency}{calc.tc2.toLocaleString()} - ${calc.tc1.toLocaleString()} = ${calc.deltaTC.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-zinc-900 dark:text-zinc-200">
                ΔQ = Q₂ - Q₁ = {calc.q2} - {calc.q1} = {calc.deltaQ} units
              </div>
              <div className="text-rose-600 dark:text-rose-400 font-bold pt-1">
                MC = ΔTC / ΔQ = (${calc.deltaTC.toLocaleString()}) / ({calc.deltaQ}) = ${calc.mc.toFixed(4)} per unit
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-1">
              <span className="text-zinc-500 text-[11px] font-bold">STEP 3: Evaluate Unit Average Costs at Q₂ = {calc.q2}</span>
              <div className="text-zinc-900 dark:text-zinc-200">
                • Average Fixed Cost: AFC = TFC / Q₂ = ${currency}{calc.fc.toLocaleString()} / {calc.q2} = ${calc.afc2.toFixed(4)}
              </div>
              <div className="text-zinc-900 dark:text-zinc-200">
                • Average Variable Cost: AVC = TVC / Q₂ = ${currency}{calc.vc2.toLocaleString()} / {calc.q2} = ${calc.avc2.toFixed(4)}
              </div>
              <div className="text-zinc-900 dark:text-zinc-200">
                • Average Total Cost: ATC = TC₂ / Q₂ = ${currency}{calc.tc2.toLocaleString()} / {calc.q2} = ${calc.atc2.toFixed(4)}
              </div>
              <div className="text-emerald-700 dark:text-emerald-300 font-bold pt-1">
                Identity Check: AFC ({currency}{calc.afc2.toFixed(2)}) + AVC ({currency}{calc.avc2.toFixed(2)}) = ATC (${(calc.afc2 + calc.avc2).toFixed(2)}) ✓
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Cost Schedule Simulation Table (Collapsible) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <button
          onClick={() => setShowSensitivity(!showSensitivity)}
          className="w-full flex items-center justify-between text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-rose-600 transition">
              Production Cost Schedule (10 Output Batches)
            </span>
          </div>
          {showSensitivity ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showSensitivity && (
          <div className="overflow-x-auto pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-mono">
                  <th className="py-2.5 px-3">Output (Q)</th>
                  <th className="py-2.5 px-3">Fixed Cost ({currency}FC)</th>
                  <th className="py-2.5 px-3">Variable Cost ({currency}VC)</th>
                  <th className="py-2.5 px-3">Total Cost ({currency}TC)</th>
                  <th className="py-2.5 px-3">AFC ({currency})</th>
                  <th className="py-2.5 px-3">AVC ({currency})</th>
                  <th className="py-2.5 px-3">ATC ({currency})</th>
                  <th className="py-2.5 px-3">Marginal Cost ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                {costSchedule.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition hover:bg-zinc-50 dark:hover:bg-zinc-800/40 ${
                      row.isCurrentTier ? 'bg-rose-50/70 dark:bg-rose-950/30 font-bold' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-zinc-900 dark:text-white font-bold">
                      {row.quantity.toLocaleString()} units {row.isCurrentTier && '(Active)'}
                    </td>
                    <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{currency}{row.fc.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{currency}{row.vc.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2 px-3 text-zinc-800 dark:text-zinc-200 font-semibold">{currency}{row.tc.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2 px-3 text-indigo-600">{currency}{row.afc.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-amber-600">{currency}{row.avc.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-zinc-900 dark:text-white font-bold">{currency}{row.atc.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-rose-600 font-bold">{currency}{row.mc.toFixed(2)}
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