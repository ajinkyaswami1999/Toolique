import { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, Copy, Check, Download, Share2, Sparkles,
  Percent, BarChart2, Scale
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Indian Currency Formatting Helpers ---
function formatIndianCurrencyAbbr(value: number): string {
  const isNegative = value < 0;
  const abs = Math.abs(value);
  let result = '';
  if (abs >= 10000000) {
    result = `₹${(abs / 10000000).toFixed(2)} Cr`;
  } else if (abs >= 100000) {
    result = `₹${(abs / 100000).toFixed(2)} Lakh`;
  } else {
    result = `₹${Math.round(abs).toLocaleString('en-IN')}`;
  }
  return isNegative ? `-${result}` : result;
}

function formatIndianCurrencyExact(value: number): string {
  const isNegative = value < 0;
  const abs = Math.abs(value);
  const result = `₹${Math.round(abs).toLocaleString('en-IN')}`;
  return isNegative ? `-${result}` : result;
}

type CalculatorMode = 'point-to-point' | 'forward-projector' | 'reverse-cagr' | 'multi-year' | 'benchmark';
type DurationType = 'tenure' | 'dates';
type TaxRegime = 'none' | 'equity-ltcg' | 'debt-slab';

interface MultiYearPoint {
  id: string;
  year: number;
  value: number;
}

const PRESET_SCENARIOS = [
  {
    name: '📈 Mutual Fund (5Y)',
    desc: 'Equity largecap compounding over 5 years',
    initial: 100000,
    final: 195000,
    years: 5,
    mode: 'point-to-point' as const
  },
  {
    name: '🚀 Multibagger Stock (7Y)',
    desc: '5x growth in high-growth midcap equity',
    initial: 50000,
    final: 250000,
    years: 7,
    mode: 'point-to-point' as const
  },
  {
    name: '🏡 Real Estate Plot (10Y)',
    desc: 'Appreciation of residential land property',
    initial: 2000000,
    final: 5500000,
    years: 10,
    mode: 'point-to-point' as const
  },
  {
    name: '🥇 Gold SGB (8Y)',
    desc: 'Gold appreciation + 2.5% sovereign interest',
    initial: 250000,
    final: 580000,
    years: 8,
    mode: 'point-to-point' as const
  },
  {
    name: '🏦 Bank 5Y FD',
    desc: 'Safe quarterly compounding fixed deposit',
    initial: 500000,
    final: 700000,
    years: 5,
    mode: 'point-to-point' as const
  },
  {
    name: '🎯 Retirement ₹1 Crore Goal',
    desc: 'Grow ₹15 Lakhs to ₹1 Crore in 15 years',
    initial: 1500000,
    final: 10000000,
    years: 15,
    mode: 'point-to-point' as const
  }
];

const ASSET_BENCHMARKS = [
  { name: 'Nifty 50 Index (Equity)', cagr: 12.5, risk: 'Moderate-High', tag: 'Equities', color: 'text-indigo-500 bg-indigo-500/10' },
  { name: 'Sovereign Gold / Bullion', cagr: 9.5, risk: 'Low-Medium', tag: 'Precious Metals', color: 'text-amber-500 bg-amber-500/10' },
  { name: 'Indian Real Estate (Avg)', cagr: 8.2, risk: 'Medium', tag: 'Property', color: 'text-emerald-500 bg-emerald-500/10' },
  { name: 'Public Provident Fund (PPF)', cagr: 7.1, risk: 'Zero Risk (Govt)', tag: 'Tax-Free 80C', color: 'text-teal-500 bg-teal-500/10' },
  { name: 'Bank Fixed Deposit (FD)', cagr: 6.8, risk: 'Low (DICGC)', tag: 'Taxable', color: 'text-blue-500 bg-blue-500/10' },
  { name: 'Consumer Inflation (CPI)', cagr: 6.0, risk: 'Purchasing Power Loss', tag: 'Benchmark', color: 'text-rose-500 bg-rose-500/10' },
  { name: 'Savings Bank Account', cagr: 3.5, risk: 'Zero Risk', tag: 'Liquid Cash', color: 'text-zinc-500 bg-zinc-500/10' }
];

export default function CAGRCalculator() {
  const [activeTab, setActiveTab] = useState<CalculatorMode>('point-to-point');
  const [durationType, setDurationType] = useState<DurationType>('tenure');

  // --- MODE 1: Point-to-Point Inputs ---
  const [initialValue, setInitialValue] = useState<number>(100000);
  const [finalValue, setFinalValue] = useState<number>(250000);
  const [years, setYears] = useState<number>(5);
  const [months, setMonths] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('2021-01-01');
  const [endDate, setEndDate] = useState<string>('2026-01-01');
  
  // Advanced & Tax Settings
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [inflationRate, setInflationRate] = useState<number>(6.0);
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('equity-ltcg');
  const [incomeTaxSlab, setIncomeTaxSlab] = useState<number>(30); // for debt

  // --- MODE 2: Forward Projector Inputs ---
  const [projInitial, setProjInitial] = useState<number>(100000);
  const [projCagr, setProjCagr] = useState<number>(12.0);
  const [projYears, setProjYears] = useState<number>(10);

  // --- MODE 3: Reverse Goal Inputs ---
  const [revInitial, setRevInitial] = useState<number>(100000);
  const [revTarget, setRevTarget] = useState<number>(1000000);
  const [revYears, setRevYears] = useState<number>(10);

  // --- MODE 4: Multi-Year Inputs ---
  const [multiPoints, setMultiPoints] = useState<MultiYearPoint[]>([
    { id: '1', year: 0, value: 100000 },
    { id: '2', year: 1, value: 118000 },
    { id: '3', year: 2, value: 112000 },
    { id: '4', year: 3, value: 145000 },
    { id: '5', year: 4, value: 182000 },
    { id: '6', year: 5, value: 235000 }
  ]);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedTable, setCopiedTable] = useState<boolean>(false);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [activeScheduleView, setActiveScheduleView] = useState<'yearly' | 'chart'>('chart');
  const [hoveredScheduleIndex, setHoveredScheduleIndex] = useState<number | null>(null);

  // Load URL Search Parameters on initial render
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as CalculatorMode;
      const init = params.get('initial');
      const fin = params.get('final');
      const yrs = params.get('years');
      const inf = params.get('inf');
      const tax = params.get('tax') as TaxRegime;

      if (tab) setActiveTab(tab);
      if (init) setInitialValue(Number(init));
      if (fin) setFinalValue(Number(fin));
      if (yrs) setYears(Number(yrs));
      if (inf) setInflationRate(Number(inf));
      if (tax) setTaxRegime(tax);
    } catch (e) {}
  }, []);

  // Compute exact tenure in fractional years
  const effectiveTenureYears = useMemo(() => {
    if (durationType === 'tenure') {
      const total = years + months / 12;
      return total > 0 ? total : 0.0833; // min 1 month
    } else {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      if (isNaN(start) || isNaN(end) || end <= start) {
        return 1;
      }
      const diffDays = (end - start) / (1000 * 60 * 60 * 24);
      return diffDays / 365.25;
    }
  }, [durationType, years, months, startDate, endDate]);

  // ----------------------------------------------------
  // MODE 1: POINT-TO-POINT CAGR CALCULATION
  // ----------------------------------------------------
  const pointResults = useMemo(() => {
    const t = effectiveTenureYears;
    const init = Math.max(1, initialValue);
    const fin = Math.max(0.01, finalValue);

    // Standard CAGR formula: (Final / Initial) ^ (1 / t) - 1
    const cagrDecimal = Math.pow(fin / init, 1 / t) - 1;
    const cagrPercent = cagrDecimal * 100;

    // Absolute return
    const absoluteReturn = ((fin - init) / init) * 100;
    const wealthMultiple = fin / init;
    const totalProfit = fin - init;

    // Rules of thumb
    const doublingYears = cagrPercent > 0 ? 72 / cagrPercent : 0;
    const triplingYears = cagrPercent > 0 ? 114 / cagrPercent : 0;
    const quadruplingYears = cagrPercent > 0 ? 144 / cagrPercent : 0;

    // Real Inflation Adjusted CAGR (Fisher Equation: (1 + r_nominal)/(1 + i) - 1)
    const infDecimal = inflationRate / 100;
    const realCagrDecimal = (1 + cagrDecimal) / (1 + infDecimal) - 1;
    const realCagrPercent = realCagrDecimal * 100;
    const realPurchasingPower = fin / Math.pow(1 + infDecimal, t);

    // Taxation Calculation (Budget 2024 LTCG rules)
    let taxAmount = 0;
    let postTaxValue = fin;
    let postTaxCagrPercent = cagrPercent;

    if (totalProfit > 0) {
      if (taxRegime === 'equity-ltcg') {
        // Equity: ₹1.25 Lakh exemption, 12.5% on remainder
        const taxableGain = Math.max(0, totalProfit - 125000);
        taxAmount = taxableGain * 0.125;
      } else if (taxRegime === 'debt-slab') {
        // Debt/FD: Taxed at marginal income slab (e.g. 30% + 4% cess = 31.2%)
        const effectiveSlab = (incomeTaxSlab * 1.04) / 100;
        taxAmount = totalProfit * effectiveSlab;
      }
      postTaxValue = fin - taxAmount;
      if (postTaxValue > init) {
        postTaxCagrPercent = (Math.pow(postTaxValue / init, 1 / t) - 1) * 100;
      } else {
        postTaxCagrPercent = ((postTaxValue - init) / init / t) * 100;
      }
    }

    // Yearly Schedule Progression
    const yearlySchedule = [];
    const wholeYears = Math.ceil(t);
    for (let i = 0; i <= wholeYears; i++) {
      const yearFraction = Math.min(i, t);
      const val = init * Math.pow(1 + cagrDecimal, yearFraction);
      const prevVal = i === 0 ? init : init * Math.pow(1 + cagrDecimal, Math.min(i - 1, t));
      const yearGain = val - prevVal;
      const discountedVal = val / Math.pow(1 + infDecimal, yearFraction);

      yearlySchedule.push({
        year: i,
        yearLabel: i === 0 ? 'Start' : `Year ${i}`,
        value: val,
        gain: yearGain,
        multiple: val / init,
        realValue: discountedVal
      });
    }

    return {
      cagrPercent,
      absoluteReturn,
      wealthMultiple,
      totalProfit,
      doublingYears,
      triplingYears,
      quadruplingYears,
      realCagrPercent,
      realPurchasingPower,
      taxAmount,
      postTaxValue,
      postTaxCagrPercent,
      yearlySchedule
    };
  }, [initialValue, finalValue, effectiveTenureYears, inflationRate, taxRegime, incomeTaxSlab]);

  // ----------------------------------------------------
  // MODE 2: FORWARD CAGR PROJECTOR
  // ----------------------------------------------------
  const forwardResults = useMemo(() => {
    const init = Math.max(1, projInitial);
    const r = projCagr / 100;
    const t = Math.max(0.1, projYears);
    const infDecimal = inflationRate / 100;

    const projectedValue = init * Math.pow(1 + r, t);
    const totalGain = projectedValue - init;
    const absoluteReturn = (totalGain / init) * 100;
    const multiple = projectedValue / init;
    const realPurchasingPower = projectedValue / Math.pow(1 + infDecimal, t);
    const realCagr = ((1 + r) / (1 + infDecimal) - 1) * 100;

    // Schedule
    const schedule = [];
    const wholeYears = Math.ceil(t);
    for (let i = 0; i <= wholeYears; i++) {
      const yearFraction = Math.min(i, t);
      const val = init * Math.pow(1 + r, yearFraction);
      schedule.push({
        year: i,
        yearLabel: i === 0 ? 'Start' : `Year ${i}`,
        value: val,
        gain: i === 0 ? 0 : val - init * Math.pow(1 + r, i - 1),
        multiple: val / init,
        realValue: val / Math.pow(1 + infDecimal, yearFraction)
      });
    }

    return {
      projectedValue,
      totalGain,
      absoluteReturn,
      multiple,
      realPurchasingPower,
      realCagr,
      schedule
    };
  }, [projInitial, projCagr, projYears, inflationRate]);

  // ----------------------------------------------------
  // MODE 3: REVERSE GOAL CAGR
  // ----------------------------------------------------
  const reverseResults = useMemo(() => {
    const init = Math.max(1, revInitial);
    const target = Math.max(init + 1, revTarget);
    const t = Math.max(0.1, revYears);

    const requiredCagr = (Math.pow(target / init, 1 / t) - 1) * 100;
    const absoluteReturn = ((target - init) / init) * 100;
    const multiple = target / init;

    // Feasibility badge
    let feasibility = {
      level: 'Moderate Risk',
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
      desc: 'Achievable via standard diversified Indian Large & Flexicap Mutual Funds.',
      recommendedAsset: 'Flexicap / Large & Midcap Mutual Funds'
    };

    if (requiredCagr <= 7.5) {
      feasibility = {
        level: 'Low Risk (Guaranteed / Debt)',
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        desc: 'Comfortably achievable with Bank FDs, Sovereign Gold Bonds, or PPF with zero capital risk.',
        recommendedAsset: 'Fixed Deposits, SGBs, Corporate Bonds'
      };
    } else if (requiredCagr <= 12.5) {
      feasibility = {
        level: 'Balanced Growth',
        color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800',
        desc: 'Realistic target matching historical Nifty 50 Index returns (~12.5% CAGR).',
        recommendedAsset: 'Nifty 50 Index Funds, Aggressive Hybrid Funds'
      };
    } else if (requiredCagr <= 16.0) {
      feasibility = {
        level: 'High Growth (Equity Intensive)',
        color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
        desc: 'Requires aggressive Midcap and Smallcap equity allocation with disciplined long-term holding.',
        recommendedAsset: 'Midcap & Smallcap Mutual Funds'
      };
    } else {
      feasibility = {
        level: 'Very Aggressive / Speculative',
        color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
        desc: 'Extremely high return requirement (>16% p.a.). High probability of portfolio volatility and drawdown.',
        recommendedAsset: 'Direct High-Beta Stocks, Sectoral / Thematic Equity'
      };
    }

    // Monthly SIP Alternative (at 12% CAGR) to bridge target
    const monthlyRate = 0.12 / 12;
    const monthsTotal = t * 12;
    // FV = P*(1+r)^n + SIP * [((1+r)^n - 1)/r] * (1+r)
    const fvFromLumpsum = init * Math.pow(1 + monthlyRate, monthsTotal);
    const neededFromSIP = Math.max(0, target - fvFromLumpsum);
    const sipFactor = ((Math.pow(1 + monthlyRate, monthsTotal) - 1) / monthlyRate) * (1 + monthlyRate);
    const alternativeSIP = neededFromSIP > 0 ? neededFromSIP / sipFactor : 0;

    return {
      requiredCagr,
      absoluteReturn,
      multiple,
      feasibility,
      alternativeSIP
    };
  }, [revInitial, revTarget, revYears]);

  // ----------------------------------------------------
  // MODE 4: MULTI-YEAR POINT SERIES
  // ----------------------------------------------------
  const multiYearResults = useMemo(() => {
    if (multiPoints.length < 2) return null;

    const sorted = [...multiPoints].sort((a, b) => a.year - b.year);
    const startVal = sorted[0].value;
    const endVal = sorted[sorted.length - 1].value;
    const totalYears = sorted[sorted.length - 1].year - sorted[0].year;

    if (totalYears <= 0 || startVal <= 0 || endVal <= 0) return null;

    const overallCagr = (Math.pow(endVal / startVal, 1 / totalYears) - 1) * 100;
    const absoluteReturn = ((endVal - startVal) / startVal) * 100;

    // Compute YoY growth intervals
    const yoyList = [];
    let arithmeticSum = 0;
    let maxDrawdown = 0;
    let peakValue = sorted[0].value;

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const yoy = ((curr.value - prev.value) / prev.value) * 100;
      yoyList.push({
        fromYear: prev.year,
        toYear: curr.year,
        fromVal: prev.value,
        toVal: curr.value,
        growthPercent: yoy
      });
      arithmeticSum += yoy;

      if (curr.value > peakValue) {
        peakValue = curr.value;
      } else {
        const dd = ((peakValue - curr.value) / peakValue) * 100;
        if (dd > maxDrawdown) maxDrawdown = dd;
      }
    }

    const arithmeticAverage = yoyList.length > 0 ? arithmeticSum / yoyList.length : 0;
    const bestYear = yoyList.length > 0 ? [...yoyList].sort((a, b) => b.growthPercent - a.growthPercent)[0] : null;
    const worstYear = yoyList.length > 0 ? [...yoyList].sort((a, b) => a.growthPercent - b.growthPercent)[0] : null;

    return {
      overallCagr,
      absoluteReturn,
      arithmeticAverage,
      maxDrawdown,
      yoyList,
      bestYear,
      worstYear,
      startVal,
      endVal,
      totalYears
    };
  }, [multiPoints]);

  // Copy Summary Report to Clipboard
  const copyFormattedSummary = () => {
    let report = '';
    if (activeTab === 'point-to-point') {
      report = `📊 CAGR Investment Report — Toolique (https://www.toolique.in/calculators/cagr-calculator)
--------------------------------------------------
Initial Principal   : ${formatIndianCurrencyExact(initialValue)}
Final Valuation     : ${formatIndianCurrencyExact(finalValue)}
Investment Duration : ${effectiveTenureYears.toFixed(2)} Years
--------------------------------------------------
Compound Annual Growth (CAGR) : ${pointResults.cagrPercent.toFixed(2)}% p.a.
Total Absolute Return         : ${pointResults.absoluteReturn.toFixed(2)}%
Wealth Growth Factor          : ${pointResults.wealthMultiple.toFixed(2)}x
Net Profit Gained             : ${formatIndianCurrencyExact(pointResults.totalProfit)}
--------------------------------------------------
Inflation-Adjusted Real CAGR  : ${pointResults.realCagrPercent.toFixed(2)}% p.a.
Real Purchasing Power         : ${formatIndianCurrencyExact(pointResults.realPurchasingPower)}
Rule of 72 Doubling Horizon   : ~${pointResults.doublingYears.toFixed(1)} Years
${taxRegime !== 'none' ? `Post-Tax In-Hand Value        : ${formatIndianCurrencyExact(pointResults.postTaxValue)} (CAGR: ${pointResults.postTaxCagrPercent.toFixed(2)}%)` : ''}
--------------------------------------------------
100% Client-Side Computation · Powered by Toolique`;
    } else if (activeTab === 'forward-projector') {
      report = `🚀 Future Value Growth Projection — Toolique
--------------------------------------------------
Initial Investment : ${formatIndianCurrencyExact(projInitial)}
Expected CAGR Rate : ${projCagr.toFixed(2)}% p.a.
Horizon Duration   : ${projYears} Years
--------------------------------------------------
Projected Corpus   : ${formatIndianCurrencyExact(forwardResults.projectedValue)} (${formatIndianCurrencyAbbr(forwardResults.projectedValue)})
Net Profit Created : ${formatIndianCurrencyExact(forwardResults.totalGain)}
Growth Multiple    : ${forwardResults.multiple.toFixed(2)}x
Real Value (Inflation Adj) : ${formatIndianCurrencyExact(forwardResults.realPurchasingPower)}
--------------------------------------------------`;
    } else if (activeTab === 'reverse-cagr') {
      report = `🎯 Required CAGR Goal Target — Toolique
--------------------------------------------------
Current Capital : ${formatIndianCurrencyExact(revInitial)}
Target Goal     : ${formatIndianCurrencyExact(revTarget)}
Timeframe       : ${revYears} Years
--------------------------------------------------
Required CAGR   : ${reverseResults.requiredCagr.toFixed(2)}% p.a.
Feasibility     : ${reverseResults.feasibility.level}
Growth Multiple : ${reverseResults.multiple.toFixed(2)}x
Alternative SIP : ${formatIndianCurrencyExact(reverseResults.alternativeSIP)}/month at 12% CAGR
--------------------------------------------------`;
    } else {
      report = `📈 Multi-Year Portfolio Analysis — Toolique
--------------------------------------------------
Starting Value : ${formatIndianCurrencyExact(multiYearResults?.startVal || 0)}
Ending Value   : ${formatIndianCurrencyExact(multiYearResults?.endVal || 0)}
Duration       : ${multiYearResults?.totalYears || 0} Years
--------------------------------------------------
Overall CAGR   : ${multiYearResults?.overallCagr.toFixed(2)}% p.a.
Absolute Return: ${multiYearResults?.absoluteReturn.toFixed(2)}%
Max Drawdown   : ${multiYearResults?.maxDrawdown.toFixed(2)}%
Arithmetic Avg : ${multiYearResults?.arithmeticAverage.toFixed(2)}% p.a.
--------------------------------------------------`;
    }

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy Year-by-Year Table to Clipboard
  const copyYearlyTable = () => {
    const schedule = activeTab === 'forward-projector' ? forwardResults.schedule : pointResults.yearlySchedule;
    let csv = 'Year,Beginning Balance (INR),Gain in Year (INR),Ending Balance (INR),Multiple,Real Value (INR)\n';
    schedule.forEach(s => {
      csv += `${s.yearLabel},${Math.round(s.value - s.gain)},${Math.round(s.gain)},${Math.round(s.value)},${s.multiple.toFixed(2)}x,${Math.round(s.realValue)}\n`;
    });
    navigator.clipboard.writeText(csv);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  // Share link with URL params
  const handleShareLink = () => {
    const url = new URL(window.location.origin + '/calculators/cagr-calculator');
    url.searchParams.set('tab', activeTab);
    url.searchParams.set('initial', initialValue.toString());
    url.searchParams.set('final', finalValue.toString());
    url.searchParams.set('years', years.toString());
    url.searchParams.set('inf', inflationRate.toString());
    url.searchParams.set('tax', taxRegime);

    navigator.clipboard.writeText(url.toString());
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // ----------------------------------------------------
  // GENERATE PROFESSIONAL PDF REPORT (jspdf)
  // ----------------------------------------------------
  const generatePdfReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo
    const darkColor: [number, number, number] = [15, 23, 42]; // Slate 900
    const grayColor: [number, number, number] = [100, 116, 139]; // Slate 500

    // Header Banner
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Toolique Financial Studio', 14, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Compound Annual Growth Rate (CAGR) Analysis Report', 14, 21);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 196, 21, { align: 'right' });

    // Executive Summary Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 35, 182, 38, 3, 3, 'FD');

    doc.setTextColor(...darkColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Executive Investment Overview', 20, 44);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text(`Initial Principal: Rs. ${Math.round(initialValue).toLocaleString('en-IN')}`, 20, 52);
    doc.text(`Final Valuation: Rs. ${Math.round(finalValue).toLocaleString('en-IN')}`, 20, 59);
    doc.text(`Duration: ${effectiveTenureYears.toFixed(2)} Years`, 20, 66);

    // Primary CAGR Callout
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(120, 40, 70, 28, 2, 2, 'FD');
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Annual Compounded Rate', 155, 48, { align: 'center' });
    doc.setFontSize(16);
    doc.text(`${pointResults.cagrPercent.toFixed(2)}% p.a.`, 155, 58, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`(${pointResults.wealthMultiple.toFixed(2)}x Growth Multiple)`, 155, 64, { align: 'center' });

    // Key Performance Metrics Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkColor);
    doc.text('Key Performance & Return Metrics', 14, 82);

    const metricsData = [
      ['Metric Name', 'Calculated Value', 'Analytical Context'],
      ['Compound Annual Growth (CAGR)', `${pointResults.cagrPercent.toFixed(2)}%`, 'Geometric mean annualized compounding growth'],
      ['Absolute Total Return', `${pointResults.absoluteReturn.toFixed(2)}%`, 'Point-to-point unannualized profit ratio'],
      ['Net Capital Gain', `Rs. ${Math.round(pointResults.totalProfit).toLocaleString('en-IN')}`, 'Total monetary wealth created'],
      ['Real Inflation-Adjusted CAGR', `${pointResults.realCagrPercent.toFixed(2)}%`, `Adjusted for ${inflationRate}% annual inflation`],
      ['Purchasing Power Equivalent', `Rs. ${Math.round(pointResults.realPurchasingPower).toLocaleString('en-IN')}`, "True economic value in today's money"],
      ['Rule of 72 Doubling Time', `~${pointResults.doublingYears.toFixed(1)} Years`, 'Estimated time required to 2x initial principal'],
      ['Rule of 114 Tripling Time', `~${pointResults.triplingYears.toFixed(1)} Years`, 'Estimated time required to 3x initial principal'],
      ['Post-Tax In-Hand Value', `Rs. ${Math.round(pointResults.postTaxValue).toLocaleString('en-IN')}`, `${taxRegime === 'equity-ltcg' ? '12.5% LTCG (>1.25L)' : taxRegime === 'debt-slab' ? '30% Slab' : 'Exempt'}`]
    ];

    let startY = 88;
    metricsData.forEach((row, idx) => {
      const isHeader = idx === 0;
      doc.setFillColor(isHeader ? 241 : (idx % 2 === 0 ? 255 : 248), isHeader ? 245 : (idx % 2 === 0 ? 255 : 250), isHeader ? 249 : 252);
      doc.rect(14, startY, 182, 7, 'F');

      doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
      doc.setFontSize(8);
      doc.setTextColor(isHeader ? 15 : 51, isHeader ? 23 : 65, isHeader ? 42 : 85);

      doc.text(row[0], 18, startY + 5);
      doc.text(row[1], 85, startY + 5);
      doc.text(row[2], 130, startY + 5);

      startY += 7;
    });

    // Benchmark Comparison Table
    startY += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...darkColor);
    doc.text('Asset Class Benchmark Performance Over Same Horizon', 14, startY);

    startY += 6;
    const benchHeader = ['Asset Class', 'Benchmark CAGR', 'Estimated Value on Rs. ' + formatIndianCurrencyAbbr(initialValue)];
    doc.setFillColor(241, 245, 249);
    doc.rect(14, startY, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(benchHeader[0], 18, startY + 5);
    doc.text(benchHeader[1], 85, startY + 5);
    doc.text(benchHeader[2], 130, startY + 5);
    startY += 7;

    ASSET_BENCHMARKS.forEach((bm, i) => {
      const bVal = initialValue * Math.pow(1 + bm.cagr / 100, effectiveTenureYears);
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      doc.rect(14, startY, 182, 6.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);

      doc.text(bm.name, 18, startY + 4.5);
      doc.text(`${bm.cagr}% p.a.`, 85, startY + 4.5);
      doc.text(`Rs. ${Math.round(bVal).toLocaleString('en-IN')}`, 130, startY + 4.5);
      startY += 6.5;
    });

    // Footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Toolique India · Free Financial Tools & Investment Calculators · https://www.toolique.in/calculators/cagr-calculator', 105, 287, { align: 'center' });

    doc.save(`CAGR_Report_${Math.round(initialValue)}_to_${Math.round(finalValue)}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left animate-fadeIn">
      {/* Top Studio Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            { id: 'point-to-point', label: '📊 Calculate CAGR' },
            { id: 'forward-projector', label: '🚀 Future Value Projector' },
            { id: 'reverse-cagr', label: '🎯 Target Goal Feasibility' },
            { id: 'multi-year', label: '📈 Multi-Year Series' },
            { id: 'benchmark', label: '⚖️ Asset Class Benchmarks' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CalculatorMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyFormattedSummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-xs cursor-pointer"
            title="Copy Text Summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={generatePdfReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-xs cursor-pointer"
            title="Download PDF Investment Report"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>PDF Report</span>
          </button>

          <button
            onClick={handleShareLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-xs cursor-pointer"
            title="Share Calculation Link"
          >
            {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-indigo-500" />}
            <span>{shareCopied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* 1-Click Scenario Presets */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Scenarios & Asset Presets
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PRESET_SCENARIOS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveTab(preset.mode);
                setInitialValue(preset.initial);
                setFinalValue(preset.final);
                setYears(preset.years);
                setMonths(0);
                setDurationType('tenure');
              }}
              className="p-2.5 rounded-xl text-left border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-xs transition group cursor-pointer"
            >
              <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                {preset.name}
              </div>
              <div className="text-[10px] text-zinc-450 dark:text-zinc-500 line-clamp-1 mt-0.5">
                {formatIndianCurrencyAbbr(preset.initial)} → {formatIndianCurrencyAbbr(preset.final)} ({preset.years}Y)
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: POINT-TO-POINT CAGR */}
      {activeTab === 'point-to-point' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs Column */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Percent className="w-4 h-4 text-indigo-500" />
                <span>Investment Inputs</span>
              </h3>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {showAdvanced ? 'Hide Settings' : 'Advanced & Tax'}
              </button>
            </div>

            {/* Initial Value Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                  Initial Investment (Beginning Principal)
                </label>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatIndianCurrencyAbbr(initialValue)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-zinc-400">₹</span>
                <input
                  type="number"
                  min="1"
                  max="1000000000"
                  value={initialValue}
                  onChange={(e) => setInitialValue(Math.max(1, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[10000, 50000, 100000, 500000, 1000000, 2500000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setInitialValue(val)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    {formatIndianCurrencyAbbr(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Final Value Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                  Final Portfolio Value (Ending Balance)
                </label>
                <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400">
                  {formatIndianCurrencyAbbr(finalValue)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-zinc-400">₹</span>
                <input
                  type="number"
                  min="0.1"
                  max="10000000000"
                  value={finalValue}
                  onChange={(e) => setFinalValue(Math.max(0.1, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[25000, 100000, 250000, 1000000, 5000000, 10000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFinalValue(val)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    {formatIndianCurrencyAbbr(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Mode Switch */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Time Horizon Method</label>
                <div className="inline-flex p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setDurationType('tenure')}
                    className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition ${
                      durationType === 'tenure'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    Years & Months
                  </button>
                  <button
                    type="button"
                    onClick={() => setDurationType('dates')}
                    className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition ${
                      durationType === 'dates'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    Calendar Dates
                  </button>
                </div>
              </div>

              {durationType === 'tenure' ? (
                <div className="space-y-4 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80">
                  {/* Years Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-zinc-500">Duration (Years):</span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{years} Years</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                      <span>0Y</span>
                      <span>15Y</span>
                      <span>30 Years</span>
                    </div>
                  </div>

                  {/* Months Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-zinc-500">Additional Months:</span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{months} Months</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="11"
                      step="1"
                      value={months}
                      onChange={(e) => setMonths(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 text-right pt-1">
                    Total Elapsed Time: <strong className="text-zinc-900 dark:text-white">{effectiveTenureYears.toFixed(2)} Years</strong> ({Math.round(effectiveTenureYears * 12)} Months)
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="col-span-2 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 text-right">
                    Exact Span: <strong className="text-zinc-900 dark:text-white">{effectiveTenureYears.toFixed(2)} Years</strong> (~{Math.round(effectiveTenureYears * 365.25)} Days)
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Inflation & Taxation Panel */}
            {showAdvanced && (
              <div className="space-y-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 animate-fadeIn">
                <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Economic & Tax Assumptions
                </h4>

                {/* Inflation Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-500">Expected Inflation (% p.a.)</span>
                    <span className="font-bold text-rose-500">{inflationRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    step="0.5"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>2% (Low)</span>
                    <span>6% (India CPI Avg)</span>
                    <span>12%</span>
                  </div>
                </div>

                {/* Capital Gains Tax Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500">Capital Gains Tax Rule</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'equity-ltcg', label: 'Equity LTCG (12.5%)' },
                      { id: 'debt-slab', label: 'Debt / FD (Slab Rate)' },
                      { id: 'none', label: 'Tax-Free / None' }
                    ].map((tax) => (
                      <button
                        key={tax.id}
                        type="button"
                        onClick={() => setTaxRegime(tax.id as TaxRegime)}
                        className={`p-2 rounded-xl text-[10px] font-bold text-center border transition ${
                          taxRegime === tax.id
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        {tax.label}
                      </button>
                    ))}
                  </div>

                  {taxRegime === 'debt-slab' && (
                    <div className="pt-2">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-zinc-500">Income Tax Slab:</span>
                        <span className="font-bold text-zinc-800 dark:text-white">{incomeTaxSlab}% (+4% Cess)</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="5"
                        value={incomeTaxSlab}
                        onChange={(e) => setIncomeTaxSlab(Number(e.target.value))}
                        className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Hero Metric Banner */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-800/60 pb-5">
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                    Annualized Performance
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-1.5">
                    {pointResults.cagrPercent.toFixed(2)}% <span className="text-base font-semibold text-indigo-300">p.a. CAGR</span>
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-indigo-300 font-semibold block">Total Wealth Factor</span>
                  <span className="text-2xl font-black text-teal-400">
                    {pointResults.wealthMultiple.toFixed(2)}x
                  </span>
                </div>
              </div>

              {/* 4 Core Summary Stat Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
                <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
                  <span className="text-[11px] font-semibold text-indigo-200 block">Absolute Return</span>
                  <span className="text-lg font-extrabold text-white mt-0.5 block">
                    {pointResults.absoluteReturn.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-indigo-300">Unannualized total</span>
                </div>

                <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
                  <span className="text-[11px] font-semibold text-indigo-200 block">Net Profit Gain</span>
                  <span className="text-lg font-extrabold text-emerald-400 mt-0.5 block truncate">
                    {formatIndianCurrencyAbbr(pointResults.totalProfit)}
                  </span>
                  <span className="text-[10px] text-indigo-300">Monetary gain</span>
                </div>

                <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
                  <span className="text-[11px] font-semibold text-indigo-200 block">Real Return (Inflation)</span>
                  <span className="text-lg font-extrabold text-amber-300 mt-0.5 block">
                    {pointResults.realCagrPercent.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-indigo-300">At {inflationRate}% CPI</span>
                </div>

                <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
                  <span className="text-[11px] font-semibold text-indigo-200 block">Doubling Horizon</span>
                  <span className="text-lg font-extrabold text-teal-300 mt-0.5 block">
                    ~{pointResults.doublingYears.toFixed(1)} Yrs
                  </span>
                  <span className="text-[10px] text-indigo-300">Rule of 72</span>
                </div>
              </div>

              {/* Taxation Breakdown Tile if Applicable */}
              {taxRegime !== 'none' && (
                <div className="mt-4 p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-700/50 flex flex-wrap justify-between items-center text-xs">
                  <div>
                    <span className="text-indigo-300 font-semibold">Post-Tax In-Hand Value:</span>
                    <strong className="text-white ml-2 text-sm">{formatIndianCurrencyExact(pointResults.postTaxValue)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-indigo-300 font-semibold">Post-Tax CAGR:</span>
                    <strong className="text-teal-300 ml-1.5 font-bold">{pointResults.postTaxCagrPercent.toFixed(2)}% p.a.</strong>
                    <span className="text-[10px] text-indigo-400 block">(Est. Tax: {formatIndianCurrencyAbbr(pointResults.taxAmount)})</span>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Visual Compounding Growth Chart / Table */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div>
                  <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <span>Compounding Growth Trajectory</span>
                  </h4>
                  <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-0.5">
                    Year-by-year nominal valuation vs. inflation-adjusted real purchasing power
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs">
                    <button
                      onClick={() => setActiveScheduleView('chart')}
                      className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition ${
                        activeScheduleView === 'chart'
                          ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      Visual Chart
                    </button>
                    <button
                      onClick={() => setActiveScheduleView('yearly')}
                      className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition ${
                        activeScheduleView === 'yearly'
                          ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-zinc-500 hover:text-zinc-700'
                      }`}
                    >
                      Annual Table
                    </button>
                  </div>

                  {activeScheduleView === 'yearly' && (
                    <button
                      onClick={copyYearlyTable}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:border-indigo-400 transition"
                      title="Copy CSV to Clipboard"
                    >
                      {copiedTable ? 'Copied' : 'Export CSV'}
                    </button>
                  )}
                </div>
              </div>

              {activeScheduleView === 'chart' ? (
                <div className="space-y-4">
                  {/* SVG Compounding Bar Chart */}
                  <div className="h-56 w-full flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-1">
                    {pointResults.yearlySchedule.map((item, idx) => {
                      const maxVal = pointResults.yearlySchedule[pointResults.yearlySchedule.length - 1].value;
                      const heightPercent = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                      const realPercent = maxVal > 0 ? (item.realValue / maxVal) * 100 : 0;
                      const isHovered = hoveredScheduleIndex === idx;

                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredScheduleIndex(idx)}
                          onMouseLeave={() => setHoveredScheduleIndex(null)}
                          className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                        >
                          {/* Floating Tooltip */}
                          {isHovered && (
                            <div className="absolute -top-14 z-20 px-2.5 py-1.5 rounded-xl bg-zinc-900 text-white text-[10px] font-bold whitespace-nowrap shadow-xl border border-zinc-700 pointer-events-none animate-fadeIn">
                              <div>{item.yearLabel}: {formatIndianCurrencyAbbr(item.value)}</div>
                              <div className="text-zinc-400 font-medium">Real: {formatIndianCurrencyAbbr(item.realValue)} ({item.multiple.toFixed(2)}x)</div>
                            </div>
                          )}

                          {/* Stacked Growth Bar */}
                          <div className="w-full flex items-end justify-center relative h-full">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full rounded-t-lg transition-all duration-300 relative ${
                                isHovered
                                  ? 'bg-indigo-500 shadow-md shadow-indigo-500/30'
                                  : 'bg-gradient-to-t from-indigo-700 to-indigo-500/80 dark:from-indigo-900 dark:to-indigo-600'
                              }`}
                            >
                              {/* Real Value Indicator line */}
                              <div
                                style={{ height: `${(realPercent / heightPercent) * 100}%` }}
                                className="w-full border-t border-dashed border-amber-300/70"
                              />
                            </div>
                          </div>

                          <span className="text-[9px] sm:text-[10px] font-bold text-zinc-400 mt-2 truncate w-full text-center">
                            {idx === 0 ? '0Y' : `${idx}Y`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chart Legend */}
                  <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-500 dark:text-zinc-400 font-semibold pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-xs bg-indigo-600" />
                      <span>Nominal Portfolio Growth</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-0.5 border-t border-dashed border-amber-400" />
                      <span>Inflation-Adjusted Purchasing Power</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Annual Amortization Table */
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-500 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Timeline</th>
                        <th className="py-2.5 px-3">Portfolio Value</th>
                        <th className="py-2.5 px-3">Annual Gain</th>
                        <th className="py-2.5 px-3">Multiple</th>
                        <th className="py-2.5 px-3">Real Value ({inflationRate}% CPI)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium text-zinc-800 dark:text-zinc-200">
                      {pointResults.yearlySchedule.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">{row.yearLabel}</td>
                          <td className="py-2.5 px-3 font-bold">{formatIndianCurrencyExact(row.value)}</td>
                          <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                            {idx === 0 ? '-' : `+${formatIndianCurrencyExact(row.gain)}`}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-zinc-500">{row.multiple.toFixed(2)}x</td>
                          <td className="py-2.5 px-3 text-zinc-500">{formatIndianCurrencyExact(row.realValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FORWARD CAGR PROJECTOR */}
      {activeTab === 'forward-projector' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>Future Wealth Parameters</span>
            </h3>

            {/* Starting Principal */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Starting Capital</label>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{formatIndianCurrencyAbbr(projInitial)}</span>
              </div>
              <input
                type="number"
                min="1000"
                max="100000000"
                value={projInitial}
                onChange={(e) => setProjInitial(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Assumed CAGR */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-zinc-600 dark:text-zinc-300">Expected Annual CAGR (%)</label>
                <span className="font-extrabold text-teal-600 dark:text-teal-400">{projCagr}% p.a.</span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                step="0.5"
                value={projCagr}
                onChange={(e) => setProjCagr(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>7% (FD/Debt)</span>
                <span>12.5% (Nifty 50)</span>
                <span>20%+ (Midcap)</span>
              </div>
            </div>

            {/* Horizon Years */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-zinc-600 dark:text-zinc-300">Holding Period (Years)</label>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{projYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                step="1"
                value={projYears}
                onChange={(e) => setProjYears(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>1 Year</span>
                <span>15 Years</span>
                <span>35 Years</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white shadow-xl space-y-5">
              <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase tracking-wider">
                Maturity Wealth Projection
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-3xl md:text-4xl font-black text-white">
                  {formatIndianCurrencyExact(forwardResults.projectedValue)}
                </div>
                <div className="text-xl font-bold text-teal-300">
                  {formatIndianCurrencyAbbr(forwardResults.projectedValue)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-teal-800/50">
                <div className="bg-white/5 p-3 rounded-2xl">
                  <span className="text-[11px] text-teal-200 font-semibold block">Total Wealth Gain</span>
                  <span className="text-base font-extrabold text-emerald-400 mt-0.5 block truncate">
                    +{formatIndianCurrencyAbbr(forwardResults.totalGain)}
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl">
                  <span className="text-[11px] text-teal-200 font-semibold block">Growth Factor</span>
                  <span className="text-base font-extrabold text-white mt-0.5 block">
                    {forwardResults.multiple.toFixed(2)}x
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-2xl">
                  <span className="text-[11px] text-teal-200 font-semibold block">Real Value ({inflationRate}% CPI)</span>
                  <span className="text-base font-extrabold text-amber-300 mt-0.5 block truncate">
                    {formatIndianCurrencyAbbr(forwardResults.realPurchasingPower)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REVERSE GOAL CAGR */}
      {activeTab === 'reverse-cagr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <Scale className="w-4 h-4 text-indigo-500" />
              <span>Target Goal Inputs</span>
            </h3>

            {/* Starting Principal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Initial Capital Ready Today</label>
              <input
                type="number"
                min="1000"
                value={revInitial}
                onChange={(e) => setRevInitial(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Target Goal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Target Financial Goal Amount</label>
              <input
                type="number"
                min="1000"
                value={revTarget}
                onChange={(e) => setRevTarget(Math.max(Number(e.target.value), revInitial + 1))}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block text-right">
                Target: {formatIndianCurrencyAbbr(revTarget)}
              </span>
            </div>

            {/* Time Horizon */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-zinc-600 dark:text-zinc-300">Time Horizon to Achieve</label>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{revYears} Years</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={revYears}
                onChange={(e) => setRevYears(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Required Annual Growth Rate</span>
                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {reverseResults.requiredCagr.toFixed(2)}% <span className="text-base font-semibold text-zinc-500">p.a. CAGR</span>
                </div>
              </div>

              {/* Feasibility Card */}
              <div className={`p-4 rounded-2xl border ${reverseResults.feasibility.color}`}>
                <div className="font-black text-sm">{reverseResults.feasibility.level}</div>
                <p className="text-xs mt-1 leading-relaxed">{reverseResults.feasibility.desc}</p>
                <div className="mt-2 text-[11px] font-bold">
                  Recommended Asset Allocation: <span className="underline">{reverseResults.feasibility.recommendedAsset}</span>
                </div>
              </div>

              {/* Alternative SIP Suggestion */}
              {reverseResults.alternativeSIP > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-black uppercase text-zinc-450 dark:text-zinc-500">
                    💡 Lower-Risk Route (Monthly SIP)
                  </span>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed">
                    Instead of chasing high CAGR risks, you can achieve your target by investing{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400 font-black">{formatIndianCurrencyExact(reverseResults.alternativeSIP)}/month</strong>{' '}
                    via SIP at a standard 12% equity CAGR alongside your initial lump sum.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MULTI-YEAR SERIES & ROLLING RETURNS */}
      {activeTab === 'multi-year' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                <span>Multi-Year Portfolio Checkpoints</span>
              </h3>
              <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-0.5">
                Calculate YoY percentage returns, geometric CAGR, arithmetic average, and max drawdowns
              </p>
            </div>

            <button
              onClick={() => {
                const nextYear = multiPoints.length > 0 ? multiPoints[multiPoints.length - 1].year + 1 : 1;
                const lastVal = multiPoints.length > 0 ? multiPoints[multiPoints.length - 1].value * 1.12 : 100000;
                setMultiPoints([...multiPoints, { id: Math.random().toString(), year: nextYear, value: Math.round(lastVal) }]);
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
            >
              + Add Year Point
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Points Table */}
            <div className="lg:col-span-6 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                      <th className="py-2">Year Point</th>
                      <th className="py-2">Portfolio Valuation (₹)</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {multiPoints.map((pt, idx) => (
                      <tr key={pt.id}>
                        <td className="py-2">
                          <input
                            type="number"
                            value={pt.year}
                            onChange={(e) => {
                              const updated = [...multiPoints];
                              updated[idx].year = Number(e.target.value);
                              setMultiPoints(updated);
                            }}
                            className="w-16 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold bg-zinc-50 dark:bg-zinc-950"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={pt.value}
                            onChange={(e) => {
                              const updated = [...multiPoints];
                              updated[idx].value = Number(e.target.value);
                              setMultiPoints(updated);
                            }}
                            className="w-36 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold bg-zinc-50 dark:bg-zinc-950 text-indigo-600 dark:text-indigo-400"
                          />
                        </td>
                        <td className="py-2 text-right">
                          {multiPoints.length > 2 && (
                            <button
                              onClick={() => setMultiPoints(multiPoints.filter((p) => p.id !== pt.id))}
                              className="text-xs text-rose-500 font-bold hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Multi-Year Metrics */}
            {multiYearResults && (
              <div className="lg:col-span-6 space-y-4">
                <div className="p-5 rounded-2xl bg-indigo-950 text-white space-y-3">
                  <span className="text-[10px] font-black uppercase text-indigo-300">Overall Geometric CAGR</span>
                  <div className="text-3xl font-black text-white">
                    {multiYearResults.overallCagr.toFixed(2)}% <span className="text-sm font-semibold text-indigo-300">p.a.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-indigo-800/60 text-xs">
                    <div>
                      <span className="text-indigo-300 block">Arithmetic Mean</span>
                      <strong className="text-white font-bold">{multiYearResults.arithmeticAverage.toFixed(2)}%</strong>
                    </div>
                    <div>
                      <span className="text-indigo-300 block">Max Drawdown</span>
                      <strong className="text-rose-400 font-bold">-{multiYearResults.maxDrawdown.toFixed(2)}%</strong>
                    </div>
                  </div>
                </div>

                {/* YoY intervals list */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-zinc-500">Year-on-Year (YoY) Performance Breakdown:</span>
                  <div className="space-y-1">
                    {multiYearResults.yoyList.map((yoy, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 text-xs font-semibold">
                        <span>Year {yoy.fromYear} → Year {yoy.toYear}</span>
                        <span className={`font-bold ${yoy.growthPercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {yoy.growthPercent >= 0 ? `+${yoy.growthPercent.toFixed(2)}%` : `${yoy.growthPercent.toFixed(2)}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ASSET CLASS BENCHMARK MATRIX */}
      {activeTab === 'benchmark' && (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-500" />
              <span>Historical Asset Class Performance Matrix</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Comparison of how an initial capital of <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{formatIndianCurrencyExact(initialValue)}</strong> compounds across various asset classes over <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{effectiveTenureYears.toFixed(2)} Years</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ASSET_BENCHMARKS.map((bm, i) => {
              const bVal = initialValue * Math.pow(1 + bm.cagr / 100, effectiveTenureYears);
              const bProfit = bVal - initialValue;
              const isUserCagrBeating = pointResults.cagrPercent >= bm.cagr;

              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${bm.color}`}>
                      {bm.tag}
                    </span>
                    <span className="text-xs font-black text-zinc-900 dark:text-white">
                      {bm.cagr}% p.a.
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{bm.name}</h4>
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                      {formatIndianCurrencyExact(bVal)}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-medium">
                      Profit: +{formatIndianCurrencyAbbr(bProfit)} ({(bVal / initialValue).toFixed(2)}x)
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[10px] font-semibold flex items-center justify-between">
                    <span className="text-zinc-450">Your Portfolio:</span>
                    <span className={isUserCagrBeating ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                      {isUserCagrBeating ? `+${(pointResults.cagrPercent - bm.cagr).toFixed(1)}% vs. Benchmark` : `${(pointResults.cagrPercent - bm.cagr).toFixed(1)}% vs. Benchmark`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
