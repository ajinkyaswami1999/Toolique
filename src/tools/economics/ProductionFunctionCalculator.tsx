import { useState, useMemo } from 'react';
import CurrencySelector from '../../components/CurrencySelector';
import {
  Copy, Check, RotateCcw,
  Sparkles, BarChart2, Info,
  ShieldCheck, Sliders, ChevronDown, ChevronUp,
  Calculator, ArrowRight, Compass,
  TrendingUp, Users, Factory,
  Zap, Layers
} from 'lucide-react';

type CalculationMode = 'discrete' | 'cubic_s_curve' | 'cobb_douglas' | 'mrpl_hiring';

interface PresetScenario {
  name: string;
  category: string;
  badgeColor: string;
  mode: CalculationMode;
  l1: number;
  l2: number;
  q1: number;
  q2: number;
  cubicA: number;
  cubicB: number;
  evalL: number;
  cdA: number;
  cdK: number;
  cdL: number;
  cdAlpha: number;
  cdBeta: number;
  unitPrice: number;
  wageRate: number;
  notes: string;
  expectedVerdict: string;
}

export default function ProductionFunctionCalculator() {
  // Mode state
  const [mode, setMode] = useState<CalculationMode>('cubic_s_curve');
  const [currency, setCurrency] = useState<string>('$');

  // Mode 1: Discrete Transition Inputs
  const [l1, setL1] = useState<number>(5);
  const [l2, setL2] = useState<number>(6);
  const [q1, setQ1] = useState<number>(100);
  const [q2, setQ2] = useState<number>(128);

  // Mode 2: Classical S-Shaped Cubic Production Function: Q(L) = a*L^2 - b*L^3
  const [cubicA, setCubicA] = useState<number>(18);
  const [cubicB, setCubicB] = useState<number>(1.0);
  const [evalL, setEvalL] = useState<number>(8);

  // Mode 3: Cobb-Douglas Production Function: Q = A * K^alpha * L^beta
  const [cdA, setCdA] = useState<number>(10);
  const [cdK, setCdK] = useState<number>(50); // Capital Units
  const [cdL, setCdL] = useState<number>(20); // Labor Units
  const [cdAlpha, setCdAlpha] = useState<number>(0.4); // Capital share
  const [cdBeta, setCdBeta] = useState<number>(0.6); // Labor share

  // Universal Economics & Labor Inputs
  const [unitPrice, setUnitPrice] = useState<number>(25);
  const [wageRate, setWageRate] = useState<number>(180); // e.g. $180/day per worker

  // UI States
  const [copied, setCopied] = useState(false);
  const [showProof, setShowProof] = useState(true);
  const [showSensitivity, setShowSensitivity] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // 6 Real-World Industry Presets
  const presets: PresetScenario[] = [
    {
      name: '🍕 Artisan Pizzeria Kitchen',
      category: 'Fixed Capital Bottleneck',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      mode: 'cubic_s_curve',
      l1: 3,
      l2: 4,
      q1: 65,
      q2: 92,
      cubicA: 15,
      cubicB: 1.1,
      evalL: 6,
      cdA: 8,
      cdK: 2,
      cdL: 6,
      cdAlpha: 0.35,
      cdBeta: 0.65,
      unitPrice: 18,
      wageRate: 140,
      notes: '2 brick ovens (Fixed K). 1-4 workers specialize efficiently (Stage I); 5-8 workers face oven bottlenecks (Stage II); 10+ cause kitchen crowding (Stage III).',
      expectedVerdict: 'Operating in Stage II (Diminishing Returns)'
    },
    {
      name: '💻 Software Engineering Team',
      category: "Brooks' Law & Communication Drag",
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      mode: 'cubic_s_curve',
      l1: 4,
      l2: 6,
      q1: 80,
      q2: 110,
      cubicA: 24,
      cubicB: 1.6,
      evalL: 11,
      cdA: 12,
      cdK: 10,
      cdL: 8,
      cdAlpha: 0.25,
      cdBeta: 0.75,
      unitPrice: 120,
      wageRate: 650,
      notes: 'Communication paths scale as O(N^2). Beyond 10 engineers on a single feature branch, marginal product becomes negative (Stage III).',
      expectedVerdict: 'Stage III Negative Returns (Crowding Overload)'
    },
    {
      name: '🏭 Auto Assembly Stamping Line',
      category: 'Heavy Industrial Cobb-Douglas',
      badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      mode: 'cobb_douglas',
      l1: 50,
      l2: 60,
      q1: 1200,
      q2: 1380,
      cubicA: 30,
      cubicB: 0.5,
      evalL: 25,
      cdA: 15,
      cdK: 120,
      cdL: 45,
      cdAlpha: 0.45,
      cdBeta: 0.55,
      unitPrice: 450,
      wageRate: 280,
      notes: 'Automated stamping presses combined with line workers demonstrate Constant Returns to Scale (alpha + beta = 1.0).',
      expectedVerdict: 'CRS Constant Returns (alpha + beta = 1.0)'
    },
    {
      name: '🌾 Commercial Wheat Farm Harvest',
      category: 'Agricultural Land Constraint',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      mode: 'discrete',
      l1: 8,
      l2: 12,
      q1: 420,
      q2: 560,
      cubicA: 20,
      cubicB: 0.9,
      evalL: 9,
      cdA: 10,
      cdK: 25,
      cdL: 12,
      cdAlpha: 0.3,
      cdBeta: 0.7,
      unitPrice: 8.5,
      wageRate: 110,
      notes: 'Fixed 500-acre field. Adding seasonal harvesters yields positive but diminishing MP (35 bushels/worker).',
      expectedVerdict: 'MPL = 35.0 bu/worker (Stage II)'
    },
    {
      name: '👕 Apparel Garment Stitching Unit',
      category: 'Piece-Rate Manufacturing',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      mode: 'cubic_s_curve',
      l1: 10,
      l2: 15,
      q1: 300,
      q2: 410,
      cubicA: 22,
      cubicB: 1.0,
      evalL: 7,
      cdA: 14,
      cdK: 30,
      cdL: 18,
      cdAlpha: 0.3,
      cdBeta: 0.7,
      unitPrice: 22,
      wageRate: 120,
      notes: '30 sewing stations. 7 workers achieve peak average productivity (APL max) at Stage I/II transition.',
      expectedVerdict: 'Peak Average Product (APL = 105 units/worker)'
    },
    {
      name: '🔬 Biotech Diagnostic Testing Lab',
      category: 'High-Tech Cleanroom Capacity',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      mode: 'cobb_douglas',
      l1: 12,
      l2: 16,
      q1: 280,
      q2: 350,
      cubicA: 16,
      cubicB: 0.7,
      evalL: 8,
      cdA: 20,
      cdK: 40,
      cdL: 15,
      cdAlpha: 0.5,
      cdBeta: 0.6,
      unitPrice: 95,
      wageRate: 350,
      notes: 'Spectrometry machines and sterile hoods exhibit Increasing Returns to Scale (alpha + beta = 1.10).',
      expectedVerdict: 'IRS Increasing Returns to Scale (1.10)'
    }
  ];

  const handleApplyPreset = (preset: PresetScenario) => {
    setMode(preset.mode);
    setL1(preset.l1);
    setL2(preset.l2);
    setQ1(preset.q1);
    setQ2(preset.q2);
    setCubicA(preset.cubicA);
    setCubicB(preset.cubicB);
    setEvalL(preset.evalL);
    setCdA(preset.cdA);
    setCdK(preset.cdK);
    setCdL(preset.cdL);
    setCdAlpha(preset.cdAlpha);
    setCdBeta(preset.cdBeta);
    setUnitPrice(preset.unitPrice);
    setWageRate(preset.wageRate);
  };

  // Comprehensive Calculation Engine
  const calc = useMemo(() => {
    let effectiveL = evalL;
    let totalProduct = 0;
    let mpl = 0;
    let apl = 0;
    let stage: 'stage_1' | 'stage_2' | 'stage_3' = 'stage_2';
    let stageName = '';
    let stageDesc = '';
    let badgeClass = '';
    let stage1BoundL = 0;
    let stage2BoundL = 0;
    let mplPeakL = 0;
    let returnsToScale = 1.0;
    let returnsType = 'Constant Returns to Scale (CRS)';

    if (mode === 'discrete') {
      const deltaL = l2 - l1;
      const deltaQ = q2 - q1;
      mpl = deltaL !== 0 ? deltaQ / deltaL : 0;
      apl = l2 > 0 ? q2 / l2 : 0;
      totalProduct = q2;
      effectiveL = l2;

      // Approximate stage based on MPL vs APL
      if (mpl > apl) {
        stage = 'stage_1';
      } else if (mpl >= 0) {
        stage = 'stage_2';
      } else {
        stage = 'stage_3';
      }

      stage1BoundL = Math.max(1, Math.round(l2 * 0.7));
      stage2BoundL = Math.max(stage1BoundL + 2, Math.round(l2 * 1.5));
      mplPeakL = Math.max(1, Math.round(l2 * 0.4));

    } else if (mode === 'cubic_s_curve') {
      // Q(L) = a*L^2 - b*L^3
      // AP(L) = a*L - b*L^2  -> max at L = a / (2b)
      // MP(L) = 2a*L - 3b*L^2 -> max at L = a / (3b), zero at L = (2a) / (3b)
      const a = cubicA;
      const b = Math.max(0.001, cubicB);
      effectiveL = evalL;

      totalProduct = Math.max(0, a * Math.pow(evalL, 2) - b * Math.pow(evalL, 3));
      apl = evalL > 0 ? Math.max(0, a * evalL - b * Math.pow(evalL, 2)) : 0;
      mpl = 2 * a * evalL - 3 * b * Math.pow(evalL, 2);

      mplPeakL = Math.max(1, Math.round(a / (3 * b)));
      stage1BoundL = Math.max(1, Math.round(a / (2 * b))); // AP max
      stage2BoundL = Math.max(stage1BoundL + 1, Math.round((2 * a) / (3 * b))); // MP = 0 (TP max)

      if (evalL < stage1BoundL) {
        stage = 'stage_1';
      } else if (evalL <= stage2BoundL) {
        stage = 'stage_2';
      } else {
        stage = 'stage_3';
      }

    } else if (mode === 'cobb_douglas') {
      // Q = A * K^alpha * L^beta
      // MP_L = beta * (Q / L)
      // AP_L = Q / L
      effectiveL = cdL;
      const A = cdA;
      const K = cdK;
      const L = cdL;
      const alpha = cdAlpha;
      const beta = cdBeta;

      returnsToScale = alpha + beta;
      if (returnsToScale > 1.01) {
        returnsType = `Increasing Returns to Scale (IRS: ${(returnsToScale).toFixed(2)})`;
      } else if (returnsToScale < 0.99) {
        returnsType = `Decreasing Returns to Scale (DRS: ${(returnsToScale).toFixed(2)})`;
      } else {
        returnsType = `Constant Returns to Scale (CRS: ${(returnsToScale).toFixed(2)})`;
      }

      totalProduct = A * Math.pow(K, alpha) * Math.pow(L, beta);
      apl = L > 0 ? totalProduct / L : 0;
      mpl = beta * apl;

      // In Cobb-Douglas with beta < 1, MP_L is always positive and declining (Stage II throughout)
      stage = 'stage_2';
      stage1BoundL = Math.max(1, Math.round(cdL * 0.3));
      stage2BoundL = Math.max(cdL * 2, 50);
      mplPeakL = 1;

    } else if (mode === 'mrpl_hiring') {
      // Direct MRPL analysis
      effectiveL = evalL;
      const a = cubicA;
      const b = Math.max(0.001, cubicB);
      totalProduct = Math.max(0, a * Math.pow(evalL, 2) - b * Math.pow(evalL, 3));
      apl = evalL > 0 ? totalProduct / evalL : 0;
      mpl = 2 * a * evalL - 3 * b * Math.pow(evalL, 2);

      stage1BoundL = Math.max(1, Math.round(a / (2 * b)));
      stage2BoundL = Math.max(stage1BoundL + 1, Math.round((2 * a) / (3 * b)));
      mplPeakL = Math.max(1, Math.round(a / (3 * b)));

      if (evalL < stage1BoundL) {
        stage = 'stage_1';
      } else if (evalL <= stage2BoundL) {
        stage = 'stage_2';
      } else {
        stage = 'stage_3';
      }
    }

    // Stage Names & Pedagogical Diagnoses
    if (stage === 'stage_1') {
      stageName = 'Stage I: Increasing & High Returns (MPL > APL)';
      stageDesc = 'Fixed capital (machinery/space) is underutilized. Adding workers increases average productivity due to specialization. A rational firm will NEVER stop hiring in Stage I.';
      badgeClass = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
    } else if (stage === 'stage_2') {
      stageName = 'Stage II: Diminishing Positive Returns (Rational Economic Zone)';
      stageDesc = 'The Law of Diminishing Returns is active (MPL < APL, but MPL > 0). Output continues to expand. ALL rational profit-maximizing firms operate exclusively in Stage II.';
      badgeClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    } else {
      stageName = 'Stage III: Negative Marginal Returns (Crowding Overload)';
      stageDesc = 'Fixed capital is severely congested (MPL < 0). Extra workers create bottlenecks and reduce Total Output. Laying off workers will increase total production.';
      badgeClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }

    // Value of Marginal Product (VMPL) & Labor Hiring Rule
    const vmpl = mpl * unitPrice;
    const netLaborProfitPerWorker = vmpl - wageRate;

    let hiringDirective = '';
    let hiringClass = '';

    if (netLaborProfitPerWorker > 10) {
      hiringDirective = `Hire More Workers: The last worker generates ${currency}${vmpl.toFixed(2)} in revenue versus ${currency}${wageRate.toFixed(2)} wage cost (Net gain: +${currency}${netLaborProfitPerWorker.toFixed(2)}/worker).`;
      hiringClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    } else if (Math.abs(netLaborProfitPerWorker) <= 10) {
      hiringDirective = `Optimal Workforce Equilibrium: VMPL equals the Wage Rate (${currency}${vmpl.toFixed(2)} ≈ ${currency}${wageRate.toFixed(2)}). Labor allocation maximizes firm profit.`;
      hiringClass = 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800';
    } else {
      hiringDirective = `Workforce Excess (VMPL < Wage): The last worker generates only ${currency}${vmpl.toFixed(2)} in revenue but costs ${currency}${wageRate.toFixed(2)} (Net loss: -${currency}${Math.abs(netLaborProfitPerWorker).toFixed(2)}/worker). Reduce labor.`;
      hiringClass = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    }

    return {
      labor: effectiveL,
      totalProduct,
      mpl,
      apl,
      stage,
      stageName,
      stageDesc,
      badgeClass,
      stage1BoundL,
      stage2BoundL,
      mplPeakL,
      returnsToScale,
      returnsType,
      vmpl,
      wageRate,
      netLaborProfitPerWorker,
      hiringDirective,
      hiringClass
    };
  }, [mode, l1, l2, q1, q2, cubicA, cubicB, evalL, cdA, cdK, cdL, cdAlpha, cdBeta, unitPrice, wageRate, currency]);

  // 10-Worker Schedule Simulation
  const laborSchedule = useMemo(() => {
    const maxL = Math.max(12, Math.round(calc.stage2BoundL * 1.3));
    const step = Math.max(1, Math.round(maxL / 10));
    const workers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => i * step);

    return workers.map((wL) => {
      let curTP = 0;
      let curAPL = 0;
      let curMPL = 0;

      if (mode === 'cubic_s_curve' || mode === 'mrpl_hiring' || mode === 'discrete') {
        const a = cubicA;
        const b = Math.max(0.001, cubicB);
        curTP = Math.max(0, a * Math.pow(wL, 2) - b * Math.pow(wL, 3));
        curAPL = wL > 0 ? curTP / wL : 0;
        curMPL = 2 * a * wL - 3 * b * Math.pow(wL, 2);
      } else if (mode === 'cobb_douglas') {
        curTP = cdA * Math.pow(cdK, cdAlpha) * Math.pow(wL, cdBeta);
        curAPL = wL > 0 ? curTP / wL : 0;
        curMPL = cdBeta * curAPL;
      }

      const curVMPL = curMPL * unitPrice;
      const isCur = Math.abs(wL - calc.labor) <= step * 0.5;

      let stageBadge = 'Stage II (Diminishing)';
      let badgeStyle = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

      if (curMPL > curAPL) {
        stageBadge = 'Stage I (Increasing)';
        badgeStyle = 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      } else if (curMPL < 0) {
        stageBadge = 'Stage III (Negative)';
        badgeStyle = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';
      }

      return {
        labor: wL,
        tp: curTP,
        apl: curAPL,
        mpl: curMPL,
        vmpl: curVMPL,
        isCurrent: isCur,
        stageBadge,
        badgeStyle
      };
    });
  }, [calc.stage2BoundL, calc.labor, mode, cubicA, cubicB, cdA, cdK, cdAlpha, cdBeta, unitPrice]);

  // Sensitivity Matrix: Labor (L) vs Capital Scaling (K or Parameter A)
  const sensitivityMatrix = useMemo(() => {
    const lMultipliers = [0.6, 0.8, 1.0, 1.2, 1.4];
    const kMultipliers = [0.6, 0.8, 1.0, 1.2, 1.4];
    const baseL = calc.labor;

    return kMultipliers.map((kMult) => {
      const rowCols = lMultipliers.map((lMult) => {
        const simL = Math.max(1, Math.round(baseL * lMult));
        let simTP = 0;
        let simMPL = 0;

        if (mode === 'cobb_douglas') {
          const simK = cdK * kMult;
          simTP = cdA * Math.pow(simK, cdAlpha) * Math.pow(simL, cdBeta);
          simMPL = cdBeta * (simTP / simL);
        } else {
          const simA = cubicA * kMult;
          const b = Math.max(0.001, cubicB);
          simTP = Math.max(0, simA * Math.pow(simL, 2) - b * Math.pow(simL, 3));
          simMPL = 2 * simA * simL - 3 * b * Math.pow(simL, 2);
        }

        return {
          lMult,
          kMult,
          simL,
          simTP,
          simMPL
        };
      });
      return { kMult, cols: rowCols };
    });
  }, [calc.labor, mode, cdK, cdA, cdAlpha, cdBeta, cubicA, cubicB]);

  // Copy Full Proof Handler
  const handleCopyProof = () => {
    const text = `=========================================
Production Function & Diminishing Returns Analysis
=========================================
Operating Labor Input (L): ${calc.labor} workers
Total Output (TP / Q): ${calc.totalProduct.toFixed(1)} units
Marginal Product of Labor (MPL = dQ/dL): ${calc.mpl.toFixed(2)} units/worker
Average Product of Labor (APL = Q/L): ${calc.apl.toFixed(2)} units/worker

PRODUCTION STAGE CLASSIFICATION:
• Current Stage: ${calc.stageName}
• Stage Boundary I/II (APL Peak): ~${calc.stage1BoundL} workers
• Stage Boundary II/III (TP Max, MPL = 0): ~${calc.stage2BoundL} workers
• Explanation: ${calc.stageDesc}

LABOR VALUE & HIRING OPTIMIZATION:
• Product Price: ${currency}${unitPrice.toFixed(2)}
• Value of Marginal Product (VMPL = MPL × P): ${currency}${calc.vmpl.toFixed(2)} per worker
• Market Wage Rate (W): ${currency}${wageRate.toFixed(2)} per worker
• Net Labor Contribution: ${calc.netLaborProfitPerWorker >= 0 ? '+' : ''}${currency}${calc.netLaborProfitPerWorker.toFixed(2)} per worker
• Strategic Hiring Verdict: ${calc.hiringDirective}

Generated via Toolique Economics Suite (https://www.toolique.in/economics/production-function-calculator)
=========================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setMode('cubic_s_curve');
    setL1(5);
    setL2(6);
    setQ1(100);
    setQ2(128);
    setCubicA(18);
    setCubicB(1.0);
    setEvalL(8);
    setCdA(10);
    setCdK(50);
    setCdL(20);
    setCdAlpha(0.4);
    setCdBeta(0.6);
    setUnitPrice(25);
    setWageRate(180);
  };

  // SVG Dual Production Graph Coordinates
  const maxPlotL = Math.max(calc.stage2BoundL * 1.35, calc.labor * 1.4, 15);
  const maxPlotTP = Math.max(calc.totalProduct * 1.35, 100);
  const maxPlotUnit = Math.max(calc.apl * 1.5, calc.mpl * 1.5, 10);

  const getSvgX = (lVal: number) => {
    return 60 + (Math.min(lVal, maxPlotL) / maxPlotL) * 460;
  };

  const getSvgYTP = (tpVal: number) => {
    const clamped = Math.max(0, Math.min(tpVal, maxPlotTP));
    return 115 - (clamped / maxPlotTP) * 95;
  };

  const getSvgYUnit = (unitVal: number) => {
    const clamped = Math.max(-maxPlotUnit * 0.3, Math.min(unitVal, maxPlotUnit));
    return 220 - ((clamped + maxPlotUnit * 0.3) / (maxPlotUnit * 1.3)) * 95;
  };

  const stage1X = getSvgX(calc.stage1BoundL);
  const stage2X = getSvgX(calc.stage2BoundL);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left animate-fadeIn">
      {/* 1. Presets & Actions Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Production Function & Capacity Presets
              </span>
              <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                Click any industry scenario to load real-world capital/labor curves
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
              className="p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-850/60 hover:border-cyan-400 hover:bg-cyan-50/30 dark:hover:bg-cyan-950/30 transition text-left group cursor-pointer"
            >
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
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
          onClick={() => setMode('cubic_s_curve')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'cubic_s_curve'
              ? 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Classical S-Curve (Q = aL² - bL³)
        </button>

        <button
          onClick={() => setMode('cobb_douglas')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'cobb_douglas'
              ? 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Cobb-Douglas (Q = A·Kᵅ·Lᵝ)
        </button>

        <button
          onClick={() => setMode('discrete')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'discrete'
              ? 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Discrete Transition (ΔQ/ΔL)
        </button>

        <button
          onClick={() => setMode('mrpl_hiring')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            mode === 'mrpl_hiring'
              ? 'bg-white dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          VMPL / MRPL Hiring Rule
        </button>
      </div>

      {/* Main Grid: Inputs + Primary Output Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-500" />
                {mode === 'cubic_s_curve' && 'Cubic S-Curve Parameters'}
                {mode === 'cobb_douglas' && 'Cobb-Douglas Inputs'}
                {mode === 'discrete' && 'Discrete Transition Pairs'}
                {mode === 'mrpl_hiring' && 'Revenue & Wage Optimization'}
              </span>
              <span className="text-[11px] font-mono text-zinc-400">Step 1 of 2</span>
            </div>

            {/* Mode 1: Classical Cubic S-Curve */}
            {(mode === 'cubic_s_curve' || mode === 'mrpl_hiring') && (
              <div className="space-y-3">
                <div className="p-2.5 bg-cyan-50/60 dark:bg-cyan-950/30 rounded-xl border border-cyan-200/60 dark:border-cyan-800/60 text-[11px] text-cyan-800 dark:text-cyan-300">
                  <strong>Cubic Equation:</strong> <span className="font-mono">Q(L) = a·L² - b·L³</span>
                  <br />
                  <span className="font-mono">APL = a·L - b·L²</span> | <span className="font-mono">MPL = 2a·L - 3b·L²</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Synergy Parameter (a)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={cubicA}
                      onChange={(e) => setCubicA(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Congestion Factor (b)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={cubicB}
                      onChange={(e) => setCubicB(parseFloat(e.target.value) || 0.01)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Evaluated Labor Input (L)
                    </label>
                    <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">{evalL} workers</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={Math.max(20, Math.round((2 * cubicA) / (3 * Math.max(0.001, cubicB)) * 1.3))}
                    value={evalL}
                    onChange={(e) => setEvalL(parseInt(e.target.value) || 1)}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-0.5">
                    <span>1 worker</span>
                    <span>APL Max: {Math.round(cubicA / (2 * Math.max(0.001, cubicB)))}w</span>
                    <span>TP Max (MPL=0): {Math.round((2 * cubicA) / (3 * Math.max(0.001, cubicB)))}w</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Cobb-Douglas */}
            {mode === 'cobb_douglas' && (
              <div className="space-y-3">
                <div className="p-2.5 bg-cyan-50/60 dark:bg-cyan-950/30 rounded-xl border border-cyan-200/60 dark:border-cyan-800/60 text-[11px] text-cyan-800 dark:text-cyan-300">
                  <strong>Cobb-Douglas Model:</strong> <span className="font-mono">Q = A · Kᵅ · Lᵝ</span>
                  <br />
                  Returns to Scale = <span className="font-mono">α + β = {(cdAlpha + cdBeta).toFixed(2)}</span> ({calc.returnsType})
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-0.5">TFP (A)</label>
                    <input
                      type="number"
                      step="any"
                      value={cdA}
                      onChange={(e) => setCdA(parseFloat(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-0.5">Capital (K)</label>
                    <input
                      type="number"
                      step="any"
                      value={cdK}
                      onChange={(e) => setCdK(parseFloat(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-0.5">Labor (L)</label>
                    <input
                      type="number"
                      step="any"
                      value={cdL}
                      onChange={(e) => setCdL(parseFloat(e.target.value) || 1)}
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Capital Elasticity (α)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={cdAlpha}
                      onChange={(e) => setCdAlpha(parseFloat(e.target.value) || 0.1)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Labor Elasticity (β)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={cdBeta}
                      onChange={(e) => setCdBeta(parseFloat(e.target.value) || 0.1)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Discrete Transition */}
            {mode === 'discrete' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Initial Labor (L₁)
                    </label>
                    <input
                      type="number"
                      value={l1}
                      onChange={(e) => setL1(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      New Labor (L₂)
                    </label>
                    <input
                      type="number"
                      value={l2}
                      onChange={(e) => setL2(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Initial Output (Q₁)
                    </label>
                    <input
                      type="number"
                      value={q1}
                      onChange={(e) => setQ1(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      New Output (Q₂)
                    </label>
                    <input
                      type="number"
                      value={q2}
                      onChange={(e) => setQ2(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Universal Price & Wage Parameters */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-2">
                Revenue & Wage Optimization
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Output Unit Price ({currency}P)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Wage Rate ({currency}W / worker)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={wageRate}
                    onChange={(e) => setWageRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hiring Directive Callout */}
          <div className={`p-4 rounded-2xl border transition-all ${calc.hiringClass}`}>
            <div className="flex items-center gap-2 mb-1">
              <Factory className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">Labor Market Directive</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {calc.hiringDirective}
            </p>
          </div>
        </div>

        {/* Right Output Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Hero Marginal Product Card */}
          <div className="bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-cyan-500/20">
            <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-cyan-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Marginal Product of Labor (MPL)
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${calc.badgeClass} bg-black/20`}>
                {calc.stage.toUpperCase().replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {calc.mpl.toFixed(2)}
              </span>
              <span className="text-sm font-medium text-cyan-200">units / additional worker</span>
            </div>

            <p className="text-xs text-cyan-200/90 leading-relaxed mb-4">
              {calc.stageDesc}
            </p>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-white/10 text-left">
              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-cyan-300 block">Total Output (Q)</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">{calc.totalProduct.toFixed(0)}</span>
                <span className="text-[10px] text-cyan-200/70">at L = {calc.labor} workers</span>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-cyan-300 block">Average Product (APL)</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">{calc.apl.toFixed(2)}</span>
                <span className="text-[10px] text-cyan-200/70">units per worker</span>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-cyan-300 block">Value of MP (VMPL)</span>
                <span className="text-sm font-mono font-bold text-white mt-0.5 block">{currency}{calc.vmpl.toFixed(2)}</span>
                <span className="text-[10px] text-cyan-200/70">MPL × Price</span>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 backdrop-blur-xs">
                <span className="text-[10px] uppercase font-semibold text-cyan-300 block">Labor Net Margin</span>
                <span className={`text-sm font-mono font-bold mt-0.5 block ${calc.netLaborProfitPerWorker >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {calc.netLaborProfitPerWorker >= 0 ? '+' : ''}{currency}{calc.netLaborProfitPerWorker.toFixed(2)}
                </span>
                <span className="text-[10px] text-cyan-200/70">VMPL − Wage</span>
              </div>
            </div>
          </div>

          {/* Interactive Dual Production Curves SVG */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-cyan-500" />
                Total Product & 3 Stages of Production Curves
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">Continuous Geometry</span>
            </div>

            {/* SVG Visualizer */}
            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 540 230" className="w-full h-auto max-h-[250px] bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 select-none">
                {/* Defs */}
                <defs>
                  <linearGradient id="stage1Grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="stage2Grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
                  </linearGradient>
                  <linearGradient id="stage3Grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.02" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                {/* Shaded 3 Stages Background */}
                <rect x="60" y="20" width={Math.max(0, stage1X - 60)} height="195" fill="url(#stage1Grad)" />
                <rect x={stage1X} y="20" width={Math.max(0, stage2X - stage1X)} height="195" fill="url(#stage2Grad)" />
                <rect x={stage2X} y="20" width={Math.max(0, 520 - stage2X)} height="195" fill="url(#stage3Grad)" />

                {/* Stage Boundary Lines */}
                <line x1={stage1X} y1="20" x2={stage1X} y2="215" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.6" />
                <line x1={stage2X} y1="20" x2={stage2X} y2="215" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.6" />

                {/* Grid Baselines */}
                <line x1="60" y1="20" x2="60" y2="215" stroke="#71717a" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="60" y1="115" x2="520" y2="115" stroke="#71717a" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.3" />
                <line x1="60" y1={getSvgYUnit(0)} x2="520" y2={getSvgYUnit(0)} stroke="#71717a" strokeWidth="1.5" strokeOpacity="0.5" />

                {/* Render Curves */}
                {(() => {
                  const ptsTP: string[] = [];
                  const ptsAPL: string[] = [];
                  const ptsMPL: string[] = [];

                  for (let i = 0; i <= 30; i++) {
                    const sampleL = (maxPlotL / 30) * i;
                    let sTP = 0;
                    let sAPL = 0;
                    let sMPL = 0;

                    if (mode === 'cobb_douglas') {
                      sTP = cdA * Math.pow(cdK, cdAlpha) * Math.pow(Math.max(0.1, sampleL), cdBeta);
                      sAPL = sampleL > 0 ? sTP / sampleL : 0;
                      sMPL = cdBeta * sAPL;
                    } else {
                      const a = cubicA;
                      const b = Math.max(0.001, cubicB);
                      sTP = Math.max(0, a * Math.pow(sampleL, 2) - b * Math.pow(sampleL, 3));
                      sAPL = sampleL > 0 ? Math.max(0, a * sampleL - b * Math.pow(sampleL, 2)) : 0;
                      sMPL = 2 * a * sampleL - 3 * b * Math.pow(sampleL, 2);
                    }

                    ptsTP.push(`${getSvgX(sampleL)},${getSvgYTP(sTP)}`);
                    ptsAPL.push(`${getSvgX(sampleL)},${getSvgYUnit(sAPL)}`);
                    ptsMPL.push(`${getSvgX(sampleL)},${getSvgYUnit(sMPL)}`);
                  }

                  return (
                    <g>
                      <path d={'M ' + ptsTP.join(' L ')} fill="none" stroke="#06b6d4" strokeWidth="2.5" />
                      <path d={'M ' + ptsAPL.join(' L ')} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
                      <path d={'M ' + ptsMPL.join(' L ')} fill="none" stroke="#ec4899" strokeWidth="2.5" />
                    </g>
                  );
                })()}

                {/* Operating Point Markers */}
                <circle cx={getSvgX(calc.labor)} cy={getSvgYTP(calc.totalProduct)} r="5" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
                <circle cx={getSvgX(calc.labor)} cy={getSvgYUnit(calc.mpl)} r="5" fill="#ec4899" stroke="#ffffff" strokeWidth="2" />
                <circle cx={getSvgX(calc.labor)} cy={getSvgYUnit(calc.apl)} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />

                {/* Stage Zone Labels */}
                <text x={(60 + stage1X) / 2} y="15" fill="#6366f1" fontSize="8" fontWeight="bold" textAnchor="middle">
                  STAGE I (MPL &gt; APL)
                </text>
                <text x={(stage1X + stage2X) / 2} y="15" fill="#10b981" fontSize="8" fontWeight="bold" textAnchor="middle">
                  STAGE II (RATIONAL ZONE)
                </text>
                <text x={(stage2X + 520) / 2} y="15" fill="#f43f5e" fontSize="8" fontWeight="bold" textAnchor="middle">
                  STAGE III (MPL &lt; 0)
                </text>

                {/* Curve Labels */}
                <text x="65" y="32" fill="#06b6d4" fontSize="8" fontWeight="bold">
                  Total Product (TP)
                </text>
                <text x="65" y="145" fill="#3b82f6" fontSize="8" fontWeight="bold">
                  Average Product (APL)
                </text>
                <text x="65" y="160" fill="#ec4899" fontSize="8" fontWeight="bold">
                  Marginal Product (MPL)
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
                  Total Product (<span className="font-mono">TP</span>)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  Average Product (<span className="font-mono">APL</span>)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" />
                  Marginal Product (<span className="font-mono">MPL</span>)
                </span>
              </div>
              <span className="text-zinc-400 italic">MPL intersects APL at maximum APL</span>
            </div>
          </div>
        </div>
      </div>

      {/* 10-Worker Production Schedule Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-cyan-500" />
              10-Tier Labor Productivity & Returns Schedule
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Simulated labor scaling tracking Total Product, Average Product, Marginal Product, and Value of Marginal Product.
            </p>
          </div>
          <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
            ★ Highlighted: Current Labor Input
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold bg-zinc-50/50 dark:bg-zinc-800/30">
                <th className="py-2.5 px-3">Labor (L)</th>
                <th className="py-2.5 px-3">Total Product (TP)</th>
                <th className="py-2.5 px-3">Average Product (APL)</th>
                <th className="py-2.5 px-3">Marginal Product (MPL)</th>
                <th className="py-2.5 px-3">Value of MP (VMPL)</th>
                <th className="py-2.5 px-3">Production Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
              {laborSchedule.map((row) => (
                <tr
                  key={row.labor}
                  className={`transition-colors ${
                    row.isCurrent
                      ? 'bg-cyan-500/10 font-bold text-cyan-900 dark:text-cyan-200'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <td className="py-2.5 px-3 font-sans">
                    {row.isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-bold">
                        ★ {row.labor} workers
                      </span>
                    ) : (
                      `${row.labor} workers`
                    )}
                  </td>
                  <td className="py-2.5 px-3">{row.tp.toFixed(1)}</td>
                  <td className="py-2.5 px-3">{row.apl.toFixed(2)}</td>
                  <td className={`py-2.5 px-3 font-bold ${row.mpl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {row.mpl.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3">{currency}{row.vmpl.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${row.badgeStyle}`}>
                      {row.stageBadge}
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
            <Compass className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Sensitivity Matrix: Labor Input (L) vs. Capital Scale (K)
            </span>
          </div>
          {showSensitivity ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showSensitivity && (
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Evaluates Total Output (<span className="font-mono">TP</span>) and Marginal Product (<span className="font-mono">MPL</span>) across relative shifts in Capital Scale (Rows: ±40%) and Labor Input (Columns: ±40%).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                    <th className="p-2 text-left font-semibold text-zinc-500 dark:text-zinc-400">Capital Scale \ Labor (L)</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">-40% L</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">-20% L</th>
                    <th className="p-2 font-mono font-bold text-cyan-600 dark:text-cyan-400">Base L ({calc.labor}w)</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">+20% L</th>
                    <th className="p-2 font-mono text-zinc-600 dark:text-zinc-400">+40% L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                  {sensitivityMatrix.map((row, rIdx) => (
                    <tr key={rIdx} className={row.kMult === 1.0 ? 'bg-cyan-500/5 font-semibold' : ''}>
                      <td className="p-2 text-left font-sans font-medium text-zinc-700 dark:text-zinc-300">
                        {row.kMult === 1.0 ? (
                          <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                            Base Capital (100%)
                          </span>
                        ) : (
                          `${row.kMult > 1.0 ? '+' : ''}${Math.round((row.kMult - 1.0) * 100)}% Capital`
                        )}
                      </td>
                      {row.cols.map((col, cIdx) => (
                        <td
                          key={cIdx}
                          className={`p-2 ${
                            col.kMult === 1.0 && col.lMult === 1.0
                              ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold rounded-lg'
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          <div>{col.simTP.toFixed(0)} units</div>
                          <div className="text-[10px] text-zinc-400">MPL: {col.simMPL.toFixed(1)}</div>
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
            <Calculator className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Formal Microeconomic Production Derivations
            </span>
          </div>
          {showProof ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
        </button>

        {showProof && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
                  1. Short-Run Productivity Relations
                </h4>
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 text-[11px] space-y-1">
                  <div>Average Product (APL) = Q / L</div>
                  <div>Marginal Product (MPL) = dQ / dL</div>
                  <div>At Max APL: d(APL)/dL = 0 ⟹ MPL = APL</div>
                </div>
                <p>
                  When <span className="font-mono">MPL &gt; APL</span>, Average Product rises. When <span className="font-mono">MPL &lt; APL</span>, Average Product falls. Hence, the Marginal Product curve passes through the exact maximum of the Average Product curve.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-500" />
                  2. Value of Marginal Product & Hiring Rule
                </h4>
                <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-zinc-900 dark:text-zinc-100 text-[11px] space-y-1">
                  <div>VMPL = MPL × Price</div>
                  <div>MRPL = MPL × Marginal Revenue</div>
                  <div>Profit Max Hiring: VMPL = Wage (W)</div>
                </div>
                <p>
                  Firms hire labor up to the point where the revenue generated by the marginal worker equals the market wage rate.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                Active Calculation Verification Proof
              </h4>
              <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-800 dark:text-zinc-200 space-y-1.5">
                <div>• Labor Input: {calc.labor} workers | Total Output: {calc.totalProduct.toFixed(1)} units</div>
                <div>• Average Product (APL = Q/L): {calc.totalProduct.toFixed(1)} / {calc.labor} = {calc.apl.toFixed(2)} units/worker</div>
                <div>• Marginal Product (MPL): {calc.mpl.toFixed(2)} units/worker</div>
                <div className="pt-1 text-cyan-600 dark:text-cyan-400 font-bold">
                  • Value of MP (VMPL = MPL × {currency}{unitPrice.toFixed(2)}): {currency}{calc.vmpl.toFixed(2)} vs Wage {currency}{wageRate.toFixed(2)}
                </div>
                <div>• Net Marginal Profit: {calc.netLaborProfitPerWorker >= 0 ? '+' : ''}{currency}{calc.netLaborProfitPerWorker.toFixed(2)} per worker</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Academic Guide & Educational FAQ */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-500" />
            Complete Guide: Law of Diminishing Returns & The 3 Stages of Production
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Understanding short-run production dynamics, labor productivity, and optimal workforce capacity.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              1. Stage I: Increasing Returns
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              From 0 workers up to maximum <span className="font-mono">APL</span>. Fixed capital is plentiful relative to labor. Additional workers enable specialization and teamwork, causing average productivity to rise. Rational firms always expand through Stage I.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              2. Stage II: Diminishing Returns
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              From maximum <span className="font-mono">APL</span> to maximum Total Product (<span className="font-mono">MPL = 0</span>). Extra workers produce less additional output than prior workers, but total production grows. <strong>All rational firms operate in Stage II</strong>, stopping where <span className="font-mono">VMPL = Wage</span>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              3. Stage III: Negative Returns
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Beyond maximum <span className="font-mono">TP</span>. Fixed machinery and physical floor space are overwhelmed. Workers experience interference, waiting times, and communication bottlenecks (<span className="font-mono">MPL &lt; 0</span>). Laying off staff increases total output.
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
              q: 'What is the Law of Diminishing Marginal Returns?',
              a: 'The Law states that as successive units of a variable input (e.g. labor) are added to a fixed input (e.g. factory equipment), a point will eventually be reached where the addition to total output (Marginal Product) begins to decline.'
            },
            {
              q: 'Why does the Marginal Product curve intersect the Average Product curve at its peak?',
              a: 'Mathematically, whenever the marginal value is greater than the average, it pulls the average up. Whenever the marginal value is lower than the average, it pulls the average down. Therefore, when the average reaches its peak and transitions from rising to falling, Marginal Product must equal Average Product.'
            },
            {
              q: 'Why will a rational firm never produce in Stage I or Stage III?',
              a: 'In Stage I, fixed capital is underutilized; hiring more workers increases average productivity per worker, meaning unit costs are falling. In Stage III, Marginal Product is negative, meaning extra workers reduce total output while adding payroll expense.'
            },
            {
              q: 'What is the difference between Diminishing Marginal Returns and Returns to Scale?',
              a: 'Diminishing Marginal Returns is a short-run concept where at least one factor (like factory size) is fixed. Returns to Scale is a long-run concept where all factors of production (both labor and capital) can be scaled simultaneously.'
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
