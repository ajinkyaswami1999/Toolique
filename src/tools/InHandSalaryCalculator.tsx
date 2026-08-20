import { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, Copy, Check, Info, Printer, Download, Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Interfaces & Types ---
type UnitType = 'monthly' | 'annual';
type SalaryMode = 'ctc_to_inhand' | 'gross_to_inhand' | 'reverse_takehome';
type TaxRegime = 'new' | 'old';
type SalaryPreset = 'basic_employee' | 'high_basic' | 'low_basic' | 'custom';

interface TaxSlab {
  limit: number;
  rate: number;
}

interface TaxRegimeConfig {
  standardDeduction: number;
  rebateLimit: number;
  slabs: TaxSlab[];
}

interface FYTaxConfig {
  newRegime: TaxRegimeConfig;
  oldRegime: TaxRegimeConfig;
}

interface OfferScenario {
  id: string;
  name: string;
  ctc: number;
  fixed: number;
  variable: number;
  employerPf: number;
  gratuity: number;
}

// --- Centralized Indian Tax Rules Config ---
const IndianTaxRules: Record<string, FYTaxConfig> = {
  'FY 2025-26': {
    newRegime: {
      standardDeduction: 75000,
      rebateLimit: 700000,
      slabs: [
        { limit: 300000, rate: 0.0 },
        { limit: 700000, rate: 0.05 },
        { limit: 1000000, rate: 0.10 },
        { limit: 1200000, rate: 0.15 },
        { limit: 1500000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 }
      ]
    },
    oldRegime: {
      standardDeduction: 50000,
      rebateLimit: 500000,
      slabs: [
        { limit: 250000, rate: 0.0 },
        { limit: 500000, rate: 0.05 },
        { limit: 1000000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 }
      ]
    }
  },
  'FY 2026-27': {
    newRegime: {
      standardDeduction: 75000,
      rebateLimit: 700000,
      slabs: [
        { limit: 300000, rate: 0.0 },
        { limit: 700000, rate: 0.05 },
        { limit: 1000000, rate: 0.10 },
        { limit: 1200000, rate: 0.15 },
        { limit: 1500000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 }
      ]
    },
    oldRegime: {
      standardDeduction: 50000,
      rebateLimit: 500000,
      slabs: [
        { limit: 250000, rate: 0.0 },
        { limit: 500000, rate: 0.05 },
        { limit: 1000000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 }
      ]
    }
  },
  'FY 2027-28': {
    newRegime: {
      standardDeduction: 75000,
      rebateLimit: 700000,
      slabs: [
        { limit: 300000, rate: 0.0 },
        { limit: 700000, rate: 0.05 },
        { limit: 1000000, rate: 0.10 },
        { limit: 1200000, rate: 0.15 },
        { limit: 1500000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 }
      ]
    },
    oldRegime: {
      standardDeduction: 50000,
      rebateLimit: 500000,
      slabs: [
        { limit: 250000, rate: 0.0 },
        { limit: 500000, rate: 0.05 },
        { limit: 1000000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 }
      ]
    }
  }
};

// --- State-Wise Professional Tax Calculations ---
const PTaxRules: Record<string, { name: string; calc: (grossMonthly: number) => number }> = {
  maharashtra: {
    name: 'Maharashtra (₹200/mo)',
    calc: (gross) => (gross > 10000 ? 200 : gross > 7500 ? 175 : 0)
  },
  karnataka: {
    name: 'Karnataka (₹200/mo)',
    calc: (gross) => (gross > 25000 ? 200 : 0)
  },
  tamilnadu: {
    name: 'Tamil Nadu (₹200/mo)',
    calc: (gross) => (gross > 15000 ? 200 : 0)
  },
  west_bengal: {
    name: 'West Bengal (₹200/mo)',
    calc: (gross) => (gross > 40000 ? 200 : gross > 25000 ? 150 : gross > 15000 ? 130 : 0)
  },
  delhi: {
    name: 'Delhi (₹0/mo)',
    calc: () => 0
  }
};

// Helper: Progressive Tax Calculator
function calculateTax(taxableIncome: number, config: TaxRegimeConfig) {
  if (taxableIncome <= 0) return 0;
  
  if (taxableIncome <= config.rebateLimit) {
    return 0; // Section 87A rebate
  }

  let tax = 0;
  let prevLimit = 0;
  for (const slab of config.slabs) {
    if (taxableIncome > slab.limit) {
      tax += (slab.limit - prevLimit) * slab.rate;
      prevLimit = slab.limit;
    } else {
      tax += (taxableIncome - prevLimit) * slab.rate;
      break;
    }
  }
  return tax * 1.04; // Add 4% Health & Education Cess
}

export default function InHandSalaryCalculator() {
  // 1. Calculator settings
  const [mode, setMode] = useState<SalaryMode>('ctc_to_inhand');
  const [freq, setFreq] = useState<UnitType>('monthly');
  const [taxRegime, setTaxRegime] = useState<TaxRegime>('new');
  const [fy, setFy] = useState<string>('FY 2026-27');
  const [stateCode, setStateCode] = useState<string>('maharashtra');
  const [preset, setPreset] = useState<SalaryPreset>('basic_employee');
  const [showAssumptions, setShowAssumptions] = useState<boolean>(false);

  // 2. Primary Inputs
  const [annualCTC, setAnnualCTC] = useState<number>(1200000); // 12 LPA
  const [grossInput, setGrossInput] = useState<number>(1000000);
  const [desiredTakeHome, setDesiredTakeHome] = useState<number>(75000);

  // 3. Salary Breakup earnings (Custom mode edits)
  const [basicPct, setBasicPct] = useState<number>(50); // % of CTC/Gross
  const [hraPct, setHraPct] = useState<number>(20);
  const [specialAllowance, setSpecialAllowance] = useState<number>(150000);
  const [bonusVar, setBonusVar] = useState<number>(100000);
  const [isBonusInCTC, setIsBonusInCTC] = useState<boolean>(true);

  // 4. Employer Benefits & Deductions
  const [isEmployerPfInCTC, setIsEmployerPfInCTC] = useState<boolean>(true);
  const [isGratuityInCTC, setIsGratuityInCTC] = useState<boolean>(true);
  const [employerNps, setEmployerNps] = useState<number>(50000);
  const [otherBenefits, setOtherBenefits] = useState<number>(24000); // Insurance etc.

  // 5. Employee PF Settings
  const [pfApplicable, setPfApplicable] = useState<boolean>(true);
  const [pfType, setPfType] = useState<'standard' | 'actual'>('standard');
  const [voluntaryPf, setVoluntaryPf] = useState<number>(0);

  // 6. Old Tax Regime Deductions
  const [rentPaidMonthly, setRentPaidMonthly] = useState<number>(15000);
  const [rentExemptionCityMetro, setRentExemptionCityMetro] = useState<boolean>(true);
  const [deduction80c, setDeduction80c] = useState<number>(150000);
  const [deduction80d, setDeduction80d] = useState<number>(25000);
  const [deductionNps, setDeductionNps] = useState<number>(50000);

  // 7. Offer Comparer State
  const [offers, setOffers] = useState<OfferScenario[]>([
    { id: '1', name: 'Company A', ctc: 1000000, fixed: 900000, variable: 100000, employerPf: 48000, gratuity: 19231 },
    { id: '2', name: 'Company B', ctc: 1100000, fixed: 850000, variable: 250000, employerPf: 48000, gratuity: 19231 },
    { id: '3', name: 'Company C', ctc: 1200000, fixed: 950000, variable: 250000, employerPf: 48000, gratuity: 19231 }
  ]);

  // 8. Growth & Increment Simulator State
  const [incrementPct, setIncrementPct] = useState<number>(12);
  const [projectionYears, setProjectionYears] = useState<number>(5);

  // UI state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // --- Preset Manager ---
  useEffect(() => {
    if (preset === 'basic_employee') {
      setBasicPct(50);
      setHraPct(20);
      setSpecialAllowance(180000);
    } else if (preset === 'high_basic') {
      setBasicPct(60);
      setHraPct(25);
      setSpecialAllowance(100000);
    } else if (preset === 'low_basic') {
      setBasicPct(35);
      setHraPct(15);
      setSpecialAllowance(280000);
    }
  }, [preset]);

  // --- Dynamic Core Calculations ---
  const calculations = useMemo(() => {
    // 1. Establish Gross Salary base
    let activeGross = grossInput;
    let employerContributions = 0;

    const taxConfig = IndianTaxRules[fy] || IndianTaxRules['FY 2026-27'];

    // If Mode 1: CTC to Gross conversion
    if (mode === 'ctc_to_inhand') {
      const basic = annualCTC * (basicPct / 100);
      
      // Calculate Employer PF
      let empPf = 0;
      if (pfApplicable) {
        empPf = pfType === 'standard' ? Math.min(1800 * 12, basic * 0.12) : basic * 0.12;
      }

      // Calculate Gratuity (4.81% of basic)
      const gratuityAccrued = isGratuityInCTC ? basic * 0.0481 : 0;

      // Employer benefits inside CTC
      employerContributions = 
        (isEmployerPfInCTC ? empPf : 0) + 
        (isGratuityInCTC ? gratuityAccrued : 0) + 
        employerNps + 
        otherBenefits;

      const variableComponent = isBonusInCTC ? bonusVar : 0;

      activeGross = Math.max(0, annualCTC - employerContributions - variableComponent);
    }

    const monthlyGross = activeGross / 12;
    const basicAnnual = activeGross * (basicPct / 100);
    const basicMonthly = basicAnnual / 12;

    // 2. PF Deductions (Employee side)
    let pfMonthly = 0;
    if (pfApplicable) {
      pfMonthly = pfType === 'standard' ? Math.min(1800, basicMonthly * 0.12) : basicMonthly * 0.12;
    }
    const voluntaryPfMonthly = voluntaryPf;
    const totalPfMonthly = pfMonthly + voluntaryPfMonthly;
    const totalPfAnnual = totalPfMonthly * 12;

    // 3. Professional Tax (PT)
    const ptFunc = PTaxRules[stateCode]?.calc || PTaxRules.default.calc;
    const ptMonthly = ptFunc(monthlyGross);
    const ptAnnual = ptMonthly * 12;

    // 4. Tax deductions & HRA exemptions (Old Regime)
    let hraExemption = 0;
    if (taxRegime === 'old') {
      // HRA Exemption Math
      const hraReceived = activeGross * (hraPct / 100);
      const rentPaidAnnual = rentPaidMonthly * 12;
      const tenPercentBasic = basicAnnual * 0.10;
      const excessRent = Math.max(0, rentPaidAnnual - tenPercentBasic);
      const maxHraLimit = basicAnnual * (rentExemptionCityMetro ? 0.50 : 0.40);
      hraExemption = Math.min(hraReceived, excessRent, maxHraLimit);
    }

    // Determine taxable income
    const standardDed = taxRegime === 'new' ? taxConfig.newRegime.standardDeduction : taxConfig.oldRegime.standardDeduction;
    let netTaxableIncome = activeGross - standardDed;

    if (taxRegime === 'old') {
      const total80c = Math.min(150000, deduction80c + totalPfAnnual);
      netTaxableIncome = netTaxableIncome - hraExemption - total80c - deduction80d - deductionNps;
    }

    netTaxableIncome = Math.max(0, netTaxableIncome);

    // Compute Income Tax
    const annualTax = calculateTax(netTaxableIncome, taxRegime === 'new' ? taxConfig.newRegime : taxConfig.oldRegime);
    const monthlyTDS = annualTax / 12;

    // Final Net take-home
    const monthlyNetTakeHome = Math.max(0, monthlyGross - totalPfMonthly - ptMonthly - monthlyTDS);
    const annualNetTakeHome = monthlyNetTakeHome * 12;

    // Effective metrics
    const effectiveTaxRate = activeGross > 0 ? (annualTax / activeGross) * 100 : 0;
    const totalDeductions = totalPfAnnual + ptAnnual + annualTax;

    return {
      grossAnnual: activeGross,
      grossMonthly: monthlyGross,
      basicAnnual,
      basicMonthly,
      pfMonthly: totalPfMonthly,
      pfAnnual: totalPfAnnual,
      ptMonthly,
      ptAnnual,
      hraExemption,
      taxableIncome: netTaxableIncome,
      annualTax,
      monthlyTDS,
      netMonthly: monthlyNetTakeHome,
      netAnnual: annualNetTakeHome,
      effectiveTax: Number(effectiveTaxRate.toFixed(1)),
      totalDeductions,
      employerContributions
    };
  }, [
    mode,
    annualCTC,
    grossInput,
    fy,
    stateCode,
    preset,
    basicPct,
    hraPct,
    specialAllowance,
    bonusVar,
    isBonusInCTC,
    isEmployerPfInCTC,
    isGratuityInCTC,
    employerNps,
    otherBenefits,
    pfApplicable,
    pfType,
    voluntaryPf,
    taxRegime,
    rentPaidMonthly,
    rentExemptionCityMetro,
    deduction80c,
    deduction80d,
    deductionNps
  ]);

  // --- REVERSE SOLVER: Find required CTC for desired Monthly Net ---
  const reverseSolverResults = useMemo(() => {
    if (mode !== 'reverse_takehome') return null;
    const targetAnnual = desiredTakeHome * 12;
    const taxConfig = IndianTaxRules[fy] || IndianTaxRules['FY 2026-27'];

    // Binary search for Gross Salary
    let low = targetAnnual;
    let high = targetAnnual * 3.0;
    let solvedGross = targetAnnual;

    for (let iter = 0; iter < 45; iter++) {
      const mid = (low + high) / 2;
      const basic = mid * (basicPct / 100);

      // EPF deduction
      let midPf = 0;
      if (pfApplicable) {
        const basicMonthly = (basic / 12);
        midPf = pfType === 'standard' ? Math.min(1800, basicMonthly * 0.12) : basicMonthly * 0.12;
      }
      const midPfAnnual = (midPf + voluntaryPf) * 12;

      // PT
      const ptFunc = PTaxRules[stateCode]?.calc || PTaxRules.default.calc;
      const midPtAnnual = ptFunc(mid / 12) * 12;

      // Tax
      const standardDed = taxRegime === 'new' ? taxConfig.newRegime.standardDeduction : taxConfig.oldRegime.standardDeduction;
      let midTaxable = mid - standardDed;
      if (taxRegime === 'old') {
        const total80c = Math.min(150000, deduction80c + midPfAnnual);
        midTaxable = midTaxable - total80c - deduction80d - deductionNps;
      }
      midTaxable = Math.max(0, midTaxable);

      const midTax = calculateTax(midTaxable, taxRegime === 'new' ? taxConfig.newRegime : taxConfig.oldRegime);
      const constMidTakeHome = mid - midPfAnnual - midPtAnnual - midTax;

      if (constMidTakeHome < targetAnnual) {
        low = mid;
      } else {
        high = mid;
        solvedGross = mid;
      }
    }

    // Estimate CTC from solved Gross
    const basicSolved = solvedGross * (basicPct / 100);
    let employerPfSolved = 0;
    if (pfApplicable) {
      employerPfSolved = pfType === 'standard' ? Math.min(1800 * 12, basicSolved * 0.12) : basicSolved * 0.12;
    }
    const gratuitySolved = isGratuityInCTC ? basicSolved * 0.0481 : 0;
    const solvedCTC = solvedGross + employerPfSolved + gratuitySolved + employerNps + otherBenefits + (isBonusInCTC ? bonusVar : 0);

    let pfSolved = 0;
    if (pfApplicable) {
      pfSolved = pfType === 'standard' ? Math.min(1800, (basicSolved / 12) * 0.12) : (basicSolved / 12) * 0.12;
    }
    const pfAnnualSolved = (pfSolved + voluntaryPf) * 12;
    const ptFunc = PTaxRules[stateCode]?.calc || PTaxRules.default.calc;
    const ptAnnualSolved = ptFunc(solvedGross / 12) * 12;

    return {
      grossAnnual: solvedGross,
      ctcAnnual: solvedCTC,
      taxAnnual: Math.max(0, solvedGross - targetAnnual - pfAnnualSolved - ptAnnualSolved)
    };
  }, [
    desiredTakeHome,
    mode,
    fy,
    stateCode,
    basicPct,
    pfApplicable,
    pfType,
    voluntaryPf,
    taxRegime,
    deduction80c,
    deduction80d,
    deductionNps,
    isGratuityInCTC,
    employerNps,
    otherBenefits,
    isBonusInCTC,
    bonusVar
  ]);

  // --- Increment Simulator Calculations ---
  const incrementResults = useMemo(() => {
    const nextCTC = calculations.grossAnnual * (1 + incrementPct / 100);
    const increaseAmount = nextCTC - calculations.grossAnnual;
    return {
      newCTC: nextCTC,
      increaseAmount,
      monthlyIncrease: increaseAmount / 12
    };
  }, [calculations.grossAnnual, incrementPct]);

  // --- Job Offers Comparer Results ---
  const offerComparisonTable = useMemo(() => {
    const taxConfig = IndianTaxRules[fy] || IndianTaxRules['FY 2026-27'];
    
    return offers.map((off) => {
      // Basic is 50% of fixed
      const basic = off.fixed * 0.50;
      let pfVal = 0;
      if (pfApplicable) {
        pfVal = pfType === 'standard' ? Math.min(1800 * 12, basic * 0.12) : basic * 0.12;
      }
      
      const ptVal = 2400; // standard Pune/Mumbai PT
      const standardDed = taxRegime === 'new' ? taxConfig.newRegime.standardDeduction : taxConfig.oldRegime.standardDeduction;
      
      let taxable = off.fixed - standardDed;
      taxable = Math.max(0, taxable);
      const tax = calculateTax(taxable, taxRegime === 'new' ? taxConfig.newRegime : taxConfig.oldRegime);
      
      const monthlyTakehome = (off.fixed - pfVal - ptVal - tax) / 12;

      return {
        ...off,
        estimatedInHand: monthlyTakehome,
        annualInHand: monthlyTakehome * 12
      };
    });
  }, [offers, fy, taxRegime, pfApplicable, pfType]);

  // --- Growth forecast projection ---
  const growthProjection = useMemo(() => {
    const projections = [];
    let currentCTC = mode === 'ctc_to_inhand' ? annualCTC : calculations.grossAnnual;
    
    for (let yr = 1; yr <= projectionYears; yr++) {
      currentCTC = currentCTC * (1 + incrementPct / 100);
      // Rough takehome calculation estimate
      const gross = currentCTC * 0.85;
      projections.push({
        year: yr,
        ctc: currentCTC,
        inHand: gross / 12
      });
    }
    return projections;
  }, [annualCTC, calculations.grossAnnual, incrementPct, projectionYears, mode]);

  // --- Action exports handlers ---
  const copyBreakupText = () => {
    const text = `Salary Take-Home breakups (Toolique.in)
---------------------------------------------
Annual CTC           : ₹${annualCTC.toLocaleString('en-IN')}
Gross annual         : ₹${calculations.grossAnnual.toLocaleString('en-IN')}
Employee PF (Annual) : ₹${calculations.pfAnnual.toLocaleString('en-IN')}
Professional Tax     : ₹${calculations.ptAnnual.toLocaleString('en-IN')}
Estimated TDS Tax    : ₹${calculations.annualTax.toLocaleString('en-IN')}
---------------------------------------------
ESTIMATED IN-HAND    : ₹${Math.round(calculations.netMonthly).toLocaleString('en-IN')}/month
---------------------------------------------`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Salary Breakup Invoice - Toolique</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            h2 { border-bottom: 2px solid #555; padding-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 12px 0; font-size: 14px; }
            .total { font-weight: bold; font-size: 1.1em; border-top: 1px solid #333; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h2>SALARY BREAKUP REPORT</h2>
          <div class="row"><span>Gross annual Salary</span><span>₹${calculations.grossAnnual.toLocaleString('en-IN')}</span></div>
          <div class="row"><span>Employee PF (Annual)</span><span>₹${calculations.pfAnnual.toLocaleString('en-IN')}</span></div>
          <div class="row"><span>Professional Tax</span><span>₹${calculations.ptAnnual.toLocaleString('en-IN')}</span></div>
          <div class="row"><span>Income Tax TDS</span><span>₹${calculations.annualTax.toLocaleString('en-IN')}</span></div>
          <div class="row total"><span>Monthly Take-Home</span><span>₹${Math.round(calculations.netMonthly).toLocaleString('en-IN')}/mo</span></div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(13, 148, 136); // Teal theme accent
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('IN-HAND SALARY REPORT', 15, 22);
    doc.setFontSize(10);
    doc.text('CTC Structure & Net Take-Home — Toolique.in', 15, 30);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Compensation parameters', 15, 52);

    doc.setFontSize(10);
    doc.text(`Salary Offering Mode: ${mode.toUpperCase().replace(/_/g, ' ')}`, 15, 60);
    doc.text(`Financial Year: ${fy}`, 15, 66);
    doc.text(`Tax Regime Scheme: ${taxRegime.toUpperCase()}`, 15, 72);
    doc.text(`State jurisdiction: ${stateCode.toUpperCase()}`, 15, 78);

    doc.line(15, 84, 195, 84);

    doc.setFontSize(12);
    doc.text('Take-Home Breakup Breakdown', 15, 94);

    doc.setFontSize(10);
    doc.text(`Annual gross cash pay: Rs. ${calculations.grossAnnual.toLocaleString('en-IN')}`, 15, 102);
    doc.text(`Monthly EPF contribution: Rs. ${calculations.pfMonthly.toLocaleString('en-IN')}`, 15, 108);
    doc.text(`State Professional Tax: Rs. ${calculations.ptMonthly.toLocaleString('en-IN')}`, 15, 114);
    doc.text(`Estimated Income Tax TDS: Rs. ${calculations.monthlyTDS.toLocaleString('en-IN')}`, 15, 120);
    doc.text(`Final Net Take-Home: Rs. ${Math.round(calculations.netMonthly).toLocaleString('en-IN')}/mo`, 15, 126);

    doc.save(`Salary_Audit_Report_${Date.now()}.pdf`);
  };

  const getShareLink = () => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    params.set('ctc', annualCTC.toString());
    params.set('regime', taxRegime);
    params.set('fy', fy);
    params.set('state', stateCode);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const handleLpaPreset = (lpaVal: number) => {
    setAnnualCTC(lpaVal * 100000);
    setPreset('basic_employee');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm">Salary & CTC Breakup Workspace</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Plan take-home compensation after PF, Professional Tax, and Slabs TDS</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick LPA Dropdown/Presets */}
          <div className="flex flex-wrap gap-1.5 max-w-md">
            {[5, 7, 10, 12, 15, 20, 25].map((lpa) => (
              <button
                key={lpa}
                onClick={() => handleLpaPreset(lpa)}
                className="text-[9px] font-black text-teal-700 dark:text-teal-400 bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/10 px-2 py-1 rounded"
              >
                {lpa} LPA
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(getShareLink());
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className="text-[9px] font-bold text-teal-700 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Scenario'}</span>
          </button>
        </div>
      </div>

      {/* CORE WORKSPACE TABS */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setMode('ctc_to_inhand')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            mode === 'ctc_to_inhand' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          CTC to In-Hand
        </button>
        <button
          onClick={() => setMode('gross_to_inhand')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            mode === 'gross_to_inhand' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Gross to In-Hand
        </button>
        <button
          onClick={() => setMode('reverse_takehome')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            mode === 'reverse_takehome' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          In-Hand to Required CTC
        </button>
      </div>

      {/* TWO COLUMN INTERACTION LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CALCULATOR INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-3">
              <Sparkles className="w-4 h-4 text-teal-500" />
              <span>Input Parameters</span>
            </h3>

            {/* Financial Year selector */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Financial Year</label>
                <select
                  value={fy}
                  onChange={(e) => setFy(e.target.value)}
                  className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-bold focus:outline-none"
                >
                  <option value="FY 2025-26">FY 2025-26</option>
                  <option value="FY 2026-27">FY 2026-27</option>
                  <option value="FY 2027-28">FY 2027-28</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">State PT</label>
                <select
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-bold focus:outline-none"
                >
                  <option value="maharashtra">Maharashtra</option>
                  <option value="karnataka">Karnataka</option>
                  <option value="tamilnadu">Tamil Nadu</option>
                  <option value="west_bengal">West Bengal</option>
                  <option value="delhi">Delhi (No PT)</option>
                </select>
              </div>
            </div>

            {/* Mode Specific Inputs */}
            {mode === 'ctc_to_inhand' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-450 block uppercase">Annual CTC (₹)</label>
                <input
                  type="number"
                  value={annualCTC}
                  onChange={(e) => setAnnualCTC(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs font-bold focus:outline-none"
                />
              </div>
            )}

            {mode === 'gross_to_inhand' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-450 block uppercase">Gross Annual Salary (₹)</label>
                <input
                  type="number"
                  value={grossInput}
                  onChange={(e) => setGrossInput(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs font-bold focus:outline-none"
                />
              </div>
            )}

            {mode === 'reverse_takehome' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-450 block uppercase">Desired Monthly Net (₹)</label>
                <input
                  type="number"
                  value={desiredTakeHome}
                  onChange={(e) => setDesiredTakeHome(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs font-bold focus:outline-none"
                  placeholder="e.g. 100000"
                />
              </div>
            )}

            {/* Tax Regime Toggle */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Tax Regime Selection</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTaxRegime('new')}
                  className={`py-2 rounded-lg border font-bold text-xs transition ${
                    taxRegime === 'new'
                      ? 'border-teal-500 bg-teal-500/5 text-teal-600'
                      : 'border-zinc-200 dark:border-zinc-850 text-zinc-500'
                  }`}
                >
                  New Regime (FY 26-27)
                </button>
                <button
                  onClick={() => setTaxRegime('old')}
                  className={`py-2 rounded-lg border font-bold text-xs transition ${
                    taxRegime === 'old'
                      ? 'border-teal-500 bg-teal-500/5 text-teal-600'
                      : 'border-zinc-200 dark:border-zinc-850 text-zinc-500'
                  }`}
                >
                  Old Regime (Savings)
                </button>
              </div>
            </div>

            {/* Structuring assumptions & presets */}
            <div className="space-y-2 border-t border-zinc-150 dark:border-zinc-850 pt-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Salary Structure Preset</label>
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value as SalaryPreset)}
                  className="p-1 rounded border border-zinc-200 text-[9px] font-bold text-zinc-550 bg-transparent"
                >
                  <option value="basic_employee">Standard (50% Basic)</option>
                  <option value="high_basic">High Basic (60% Basic)</option>
                  <option value="low_basic">Low Basic (35% Basic)</option>
                </select>
              </div>
            </div>

            {/* EPF & Variable Bonus controls */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-650">EPF Deductions applicable?</span>
                <input
                  type="checkbox"
                  checked={pfApplicable}
                  onChange={(e) => setPfApplicable(e.target.checked)}
                  className="rounded border-zinc-300 text-teal-600"
                />
              </div>

              {pfApplicable && (
                <div className="grid grid-cols-2 gap-3 pl-3 border-l border-teal-500/20">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase">PF Calculation</label>
                    <select
                      value={pfType}
                      onChange={(e) => setPfType(e.target.value as any)}
                      className="w-full p-1.5 border rounded text-[10px] font-bold bg-transparent text-zinc-550"
                    >
                      <option value="standard">Capped (₹1,800/mo)</option>
                      <option value="actual">Actual (12% of basic)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase">Voluntary VPF (₹)</label>
                    <input
                      type="number"
                      value={voluntaryPf}
                      onChange={(e) => setVoluntaryPf(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-1 border rounded font-mono text-[10px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Old Regime Declarations */}
            {taxRegime === 'old' && (
              <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-850 space-y-3 pt-3 border-t">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Section Deductions (Old Regime)</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400">80C Investments</label>
                    <input type="number" value={deduction80c} onChange={(e) => setDeduction80c(Math.max(0, parseInt(e.target.value) || 0))} className="w-full p-1.5 border text-xs font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400">80D Health</label>
                    <input type="number" value={deduction80d} onChange={(e) => setDeduction80d(Math.max(0, parseInt(e.target.value) || 0))} className="w-full p-1.5 border text-xs font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400">HRA Rent paid/mo</label>
                    <input type="number" value={rentPaidMonthly} onChange={(e) => setRentPaidMonthly(Math.max(0, parseInt(e.target.value) || 0))} className="w-full p-1.5 border text-xs font-mono" />
                  </div>
                  <div className="space-y-1 flex items-end">
                    <label className="flex items-center gap-1 text-[9px] font-bold text-zinc-550">
                      <input type="checkbox" checked={rentExemptionCityMetro} onChange={(e) => setRentExemptionCityMetro(e.target.checked)} className="rounded" />
                      <span>Metro City</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Collapsible Assumptions panel */}
            <div className="border-t border-zinc-150 dark:border-zinc-850 pt-3">
              <button
                onClick={() => setShowAssumptions(!showAssumptions)}
                className="w-full flex justify-between items-center text-xs font-bold text-zinc-550 dark:text-zinc-300 py-1.5 focus:outline-none"
              >
                <span>Calculation Assumptions & CTC Elements</span>
                <span className="text-[10px] text-teal-600">{showAssumptions ? 'Hide ▲' : 'Show ▼'}</span>
              </button>

              {showAssumptions && (
                <div className="space-y-4 pt-3 border-l border-teal-500/10 pl-3 mt-1 animate-fadeIn">
                  
                  {/* Employer PF in CTC */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-550">Include Employer PF in CTC?</span>
                    <input
                      type="checkbox"
                      checked={isEmployerPfInCTC}
                      onChange={(e) => setIsEmployerPfInCTC(e.target.checked)}
                      className="rounded border-zinc-300 text-teal-600"
                    />
                  </div>

                  {/* Gratuity in CTC */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-550">Include Gratuity in CTC? (4.81%)</span>
                    <input
                      type="checkbox"
                      checked={isGratuityInCTC}
                      onChange={(e) => setIsGratuityInCTC(e.target.checked)}
                      className="rounded border-zinc-300 text-teal-600"
                    />
                  </div>

                  {/* Employer NPS Contribution */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block">Employer NPS Contribution (Annual ₹)</label>
                    <input
                      type="number"
                      value={employerNps}
                      onChange={(e) => setEmployerNps(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 border rounded-xl font-mono text-xs"
                    />
                  </div>

                  {/* Other Employer Benefits */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block">Other Employer Benefits/Insurance (Annual ₹)</label>
                    <input
                      type="number"
                      value={otherBenefits}
                      onChange={(e) => setOtherBenefits(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-2 border rounded-xl font-mono text-xs"
                    />
                  </div>

                  {/* Variable Bonus details */}
                  <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase block">Variable Bonus (Annual ₹)</label>
                      <input
                        type="number"
                        value={bonusVar}
                        onChange={(e) => setBonusVar(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full p-2 border rounded font-mono text-xs"
                      />
                    </div>
                    <div className="flex items-end pl-2">
                      <label className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-550">
                        <input
                          type="checkbox"
                          checked={isBonusInCTC}
                          onChange={(e) => setIsBonusInCTC(e.target.checked)}
                          className="rounded text-teal-600"
                        />
                        <span>Included in CTC</span>
                      </label>
                    </div>
                  </div>

                  {/* Old Regime NPS deduction */}
                  {taxRegime === 'old' && (
                    <div className="space-y-1 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                      <label className="text-[9px] font-bold text-zinc-400 uppercase block">Employee NPS Deduction (Sec 80CCD(1B) - max 50k)</label>
                      <input
                        type="number"
                        value={deductionNps}
                        onChange={(e) => setDeductionNps(Math.max(0, Math.min(50000, parseInt(e.target.value) || 0)))}
                        className="w-full p-2 border rounded font-mono text-xs"
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setBasicPct(50);
                        setHraPct(20);
                        setSpecialAllowance(150000);
                        setBonusVar(100000);
                        setIsBonusInCTC(true);
                        setIsEmployerPfInCTC(true);
                        setIsGratuityInCTC(true);
                        setEmployerNps(50000);
                        setOtherBenefits(24000);
                        setDeductionNps(50000);
                        setVoluntaryPf(0);
                        setPfApplicable(true);
                        setPfType('standard');
                        setRentPaidMonthly(15000);
                        setRentExemptionCityMetro(true);
                        setDeduction80c(150000);
                        setDeduction80d(25000);
                      }}
                      className="w-full py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-350 text-[10px] font-bold rounded-lg transition"
                    >
                      Reset to Default Assumptions
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CORE SALARY SPLIT RESULTS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase text-zinc-450 tracking-wider block">Estimated Compensation Split</span>
                <h3 className="text-sm font-black text-teal-400 mt-0.5">Take-home breakdown</h3>
              </div>
              
              <div className="flex gap-2 items-center">
                <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                  <button
                    onClick={() => setFreq('monthly')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded transition ${freq === 'monthly' ? 'bg-teal-600 text-white shadow-sm' : 'text-zinc-400'}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setFreq('annual')}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded transition ${freq === 'annual' ? 'bg-teal-600 text-white shadow-sm' : 'text-zinc-400'}`}
                  >
                    Annual
                  </button>
                </div>

                <button
                  onClick={copyBreakupText}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-350 hover:bg-zinc-850 hover:text-white transition"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReport ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] font-bold text-teal-300 uppercase block tracking-wider">
                  {freq === 'monthly' ? 'Net Monthly In-Hand' : 'Net Annual In-Hand'}
                </span>
                <div className="text-2xl md:text-3xl font-black text-white mt-1 font-mono tracking-tight">
                  ₹{Math.round(freq === 'monthly' ? calculations.netMonthly : calculations.netAnnual).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-zinc-450 font-extrabold uppercase block">
                  {freq === 'monthly' ? 'Net Annual In-Hand' : 'Net Monthly In-Hand'}
                </span>
                <div className="text-xl font-bold font-mono text-zinc-300 mt-1">
                  ₹{Math.round(freq === 'monthly' ? calculations.netAnnual : calculations.netMonthly).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Calculations Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left pt-2 border-t border-zinc-850">
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">
                  {freq === 'monthly' ? 'Monthly Gross' : 'Annual Gross'}
                </span>
                <span className="text-xs font-black font-mono text-white mt-1 block">
                  ₹{Math.round(freq === 'monthly' ? calculations.grossMonthly : calculations.grossAnnual).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">
                  {freq === 'monthly' ? 'EPF Deduction' : 'Annual EPF'}
                </span>
                <span className="text-xs font-black font-mono text-rose-450 mt-1 block">
                  -₹{Math.round(freq === 'monthly' ? calculations.pfMonthly : calculations.pfAnnual).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">
                  {freq === 'monthly' ? 'Estimated TDS' : 'Annual Tax'}
                </span>
                <span className="text-xs font-black font-mono text-rose-450 mt-1 block">
                  -₹{Math.round(freq === 'monthly' ? calculations.monthlyTDS : calculations.annualTax).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">
                  {freq === 'monthly' ? 'Professional Tax' : 'Annual PT'}
                </span>
                <span className="text-xs font-black font-mono text-rose-300 mt-1 block">
                  -₹{freq === 'monthly' ? calculations.ptMonthly : calculations.ptAnnual}
                </span>
              </div>
            </div>

            {/* Effective tax rate warning */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-850/40 text-xs text-zinc-400 flex justify-between items-center">
              <span>Effective Tax Rate: <strong>{calculations.effectiveTax}%</strong></span>
              <span>Standard Deduction applied: <strong>₹{taxRegime === 'new' ? '75,000' : '50,000'}</strong></span>
            </div>
          </div>

          {/* Reverse Solver estimates */}
          {mode === 'reverse_takehome' && reverseSolverResults && (
            <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">Solved Salary Breakup for Desired In-Hand</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl text-center">
                  <span className="text-[8px] text-zinc-400 uppercase font-black">Required Gross</span>
                  <div className="text-xs font-bold font-mono mt-1">₹{Math.round(reverseSolverResults.grossAnnual).toLocaleString('en-IN')}</div>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl text-center">
                  <span className="text-[8px] text-zinc-400 uppercase font-black">Estimated CTC</span>
                  <div className="text-xs font-bold font-mono mt-1 text-teal-600">₹{Math.round(reverseSolverResults.ctcAnnual).toLocaleString('en-IN')}</div>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl text-center">
                  <span className="text-[8px] text-zinc-400 uppercase font-black">Annual Tax</span>
                  <div className="text-xs font-bold font-mono mt-1">₹{Math.round(reverseSolverResults.taxAnnual).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SALARY BREAKDOWN TABLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Salary Breakup Ledger</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold">
                <th className="py-2.5 pl-2">Component Slip</th>
                <th className="py-2.5 text-right">Monthly (₹)</th>
                <th className="py-2.5 text-right pr-2">Annual (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold font-mono text-zinc-700 dark:text-zinc-350">
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                <td className="py-3 pl-2 text-zinc-900 dark:text-white font-bold">Basic Salary</td>
                <td className="py-3 text-right">₹{Math.round(calculations.basicMonthly).toLocaleString('en-IN')}</td>
                <td className="py-3 text-right pr-2">₹{Math.round(calculations.basicAnnual).toLocaleString('en-IN')}</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                <td className="py-3 pl-2">House Rent Allowance (HRA)</td>
                <td className="py-3 text-right">₹{Math.round((calculations.grossMonthly * (hraPct / 100))).toLocaleString('en-IN')}</td>
                <td className="py-3 text-right pr-2">₹{Math.round((calculations.grossAnnual * (hraPct / 100))).toLocaleString('en-IN')}</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                <td className="py-3 pl-2">Special Allowance</td>
                <td className="py-3 text-right">₹{Math.round(specialAllowance / 12).toLocaleString('en-IN')}</td>
                <td className="py-3 text-right pr-2">₹{specialAllowance.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 text-emerald-600 font-bold">
                <td className="py-3 pl-2">Gross Salary</td>
                <td className="py-3 text-right">₹{Math.round(calculations.grossMonthly).toLocaleString('en-IN')}</td>
                <td className="py-3 text-right pr-2">₹{Math.round(calculations.grossAnnual).toLocaleString('en-IN')}</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 text-rose-500">
                <td className="py-3 pl-2">Employee Provident Fund (EPF)</td>
                <td className="py-3 text-right">-₹{Math.round(calculations.pfMonthly).toLocaleString('en-IN')}</td>
                <td className="py-3 text-right pr-2">-₹{Math.round(calculations.pfAnnual).toLocaleString('en-IN')}</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 text-rose-500">
                <td className="py-3 pl-2">Professional Tax (PT)</td>
                <td className="py-3 text-right">-₹{calculations.ptMonthly}</td>
                <td className="py-3 text-right pr-2">-₹{calculations.ptAnnual}</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 text-rose-500">
                <td className="py-3 pl-2">Income Tax TDS</td>
                <td className="py-3 text-right">-₹{Math.round(calculations.monthlyTDS).toLocaleString('en-IN')}</td>
                <td className="py-3 text-right pr-2">-₹{Math.round(calculations.annualTax).toLocaleString('en-IN')}</td>
              </tr>
              <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 text-teal-600 font-bold text-sm">
                <td className="py-3 pl-2">Estimated In-Hand Salary</td>
                <td className="py-3 text-right">₹{Math.round(calculations.netMonthly).toLocaleString('en-IN')}</td>
                <td className="py-3 text-right pr-2">₹{Math.round(calculations.netAnnual).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* REGIME SIDE-BY-SIDE COMPARISON */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Old vs. New Tax Regime Comparison</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-450">
                  <th className="py-2 pl-2">Parameter</th>
                  <th className="py-2 text-right">Old Regime</th>
                  <th className="py-2 text-right pr-2">New Regime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono text-zinc-650">
                <tr className="py-2">
                  <td className="py-2 pl-2">Gross Income</td>
                  <td className="py-2 text-right">₹{Math.round(calculations.grossAnnual).toLocaleString('en-IN')}</td>
                  <td className="py-2 text-right pr-2">₹{Math.round(calculations.grossAnnual).toLocaleString('en-IN')}</td>
                </tr>
                <tr className="py-2">
                  <td className="py-2 pl-2">Standard Deduction</td>
                  <td className="py-2 text-right">₹50,000</td>
                  <td className="py-2 text-right pr-2">₹75,000</td>
                </tr>
                <tr className="py-2">
                  <td className="py-2 pl-2">Total Tax Slab TDS</td>
                  <td className="py-2 text-right">₹{Math.round(calculateTax(calculations.grossAnnual - 50000 - calculations.hraExemption - deduction80c, IndianTaxRules[fy]?.oldRegime || IndianTaxRules['FY 2026-27'].oldRegime)).toLocaleString('en-IN')}</td>
                  <td className="py-2 text-right pr-2">₹{Math.round(calculateTax(calculations.grossAnnual - 75000, IndianTaxRules[fy]?.newRegime || IndianTaxRules['FY 2026-27'].newRegime)).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/10 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-teal-600 block tracking-wider">Suggested Regime Choice</span>
              <p className="text-xs text-zinc-600 leading-relaxed pt-1">
                For most taxpayers with minimal savings profiles, the <strong>New Tax Regime</strong> yields optimal savings. Verify your eligible deductions under Section 80C and rent receipts before final filing choices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* JOB OFFERS COMPARER PANEL */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Compare Offer Letters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {offers.map((off) => (
            <div key={off.id} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
              <input
                type="text"
                value={off.name}
                onChange={(e) => {
                  const updated = offers.map(o => o.id === off.id ? { ...o, name: e.target.value } : o);
                  setOffers(updated);
                }}
                className="font-bold text-xs bg-transparent border-b border-transparent focus:border-teal-500"
              />
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[8px] text-zinc-400 font-bold block uppercase">CTC (₹)</label>
                  <input
                    type="number"
                    value={off.ctc}
                    onChange={(e) => {
                      const updated = offers.map(o => o.id === off.id ? { ...o, ctc: parseInt(e.target.value) || 0 } : o);
                      setOffers(updated);
                    }}
                    className="w-full p-1 border rounded text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[8px] text-zinc-400 font-bold block uppercase">Fixed Pay (₹)</label>
                  <input
                    type="number"
                    value={off.fixed}
                    onChange={(e) => {
                      const updated = offers.map(o => o.id === off.id ? { ...o, fixed: parseInt(e.target.value) || 0 } : o);
                      setOffers(updated);
                    }}
                    className="w-full p-1 border rounded text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Solved take home comparisons side by side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 font-mono text-xs text-zinc-650">
          {offerComparisonTable.map((off) => (
            <div key={off.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 space-y-2">
              <div className="font-extrabold uppercase text-zinc-400">{off.name} Estimates</div>
              <div>CTC: ₹{off.ctc.toLocaleString('en-IN')}</div>
              <div>Fixed Pay: ₹{off.fixed.toLocaleString('en-IN')}</div>
              <div className="text-teal-600 font-bold">Est. In-Hand: ₹{Math.round(off.estimatedInHand).toLocaleString('en-IN')}/mo</div>
            </div>
          ))}
        </div>
      </div>

      {/* GROW FORECASTS & HIKE SIMULATOR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Increment Hike panel */}
        <div className="md:col-span-6 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Hike Simulator</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Increment Percentage (%)</label>
                <input
                  type="number"
                  value={incrementPct}
                  onChange={(e) => setIncrementPct(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full p-2 border rounded-xl font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Projection Years</label>
                <input
                  type="number"
                  value={projectionYears}
                  onChange={(e) => setProjectionYears(Math.max(1, Math.min(10, parseInt(e.target.value) || 5)))}
                  className="w-full p-2 border rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Old Gross CTC:</span>
                <span className="font-mono">₹{Math.round(calculations.grossAnnual).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>New Gross CTC:</span>
                <span className="font-mono text-teal-600 font-bold">₹{Math.round(incrementResults.newCTC).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Hike Addition:</span>
                <span className="font-mono text-emerald-600">+₹{Math.round(incrementResults.increaseAmount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Addition:</span>
                <span className="font-mono text-emerald-600 font-bold">+₹{Math.round(incrementResults.monthlyIncrease).toLocaleString('en-IN')}/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth forecasts stack */}
        <div className="md:col-span-6 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">5-Year Growth Projections</h3>
          
          <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
            {growthProjection.map((proj) => (
              <div key={proj.year} className="flex justify-between items-center p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 text-xs">
                <span className="font-bold">Year {proj.year}</span>
                <div className="text-right">
                  <div className="font-mono font-bold text-zinc-800 dark:text-white">CTC: ₹{Math.round(proj.ctc).toLocaleString('en-IN')}</div>
                  <div className="font-mono text-[10px] text-teal-600">Est. In-Hand: ₹{Math.round(proj.inHand).toLocaleString('en-IN')}/mo</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EXPORTS DOCK ACTIONS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Export Compensation Plans</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyBreakupText}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReport ? 'Report Copied' : 'Copy Salary Breakup'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Breakup</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Smart Assumptions / Bylaws disclaimers */}
      <div className="p-5 rounded-3xl bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/80 space-y-4">
        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-2">
          <Info className="w-4 h-4 text-teal-605" />
          <span>Statutory Calculation Disclaimer</span>
        </h4>
        <p className="text-xs leading-relaxed text-zinc-550 dark:text-zinc-400">
          ⚠️ <strong>Accuracy & Trust Guidelines:</strong> Salary structure formats, Employee Provident Fund (EPF) calculations, and state professional taxes slab thresholds vary based on individual employer policy, CTC declarations, and specific payroll cycles. Tax computations are based on official guidelines for the selected financial year and should be verified independently before filing.
        </p>
      </div>
    </div>
  );
}
