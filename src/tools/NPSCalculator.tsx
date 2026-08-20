import { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, Copy, Check, Info, Printer, Download, Sparkles, ArrowRightLeft
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Interfaces & Types ---
type SubscriberType = 'government' | 'corporate' | 'citizen';
type ExitType = 'normal' | 'premature' | 'death';
type TierType = 'tier1' | 'tier2';
type ChoiceType = 'active' | 'auto';
type AutoChoiceType = 'lc75' | 'lc50' | 'lc25';

interface ProjectionRow {
  age: number;
  annualContribution: number;
  totalInvested: number;
  estimatedCorpus: number;
  growth: number;
}

interface MilestoneRow {
  label: string;
  age: number;
}

export default function NPSCalculator() {
  // 1. Calculator Workspace settings
  const [calcMode, setCalcMode] = useState<'forward' | 'reverse_pension' | 'compare_scenarios'>('forward');
  const [tier, setTier] = useState<TierType>('tier1');
  const [subscriber, setSubscriber] = useState<SubscriberType>('corporate');
  const [exitType, setExitType] = useState<ExitType>('normal');
  const [choice, setChoice] = useState<ChoiceType>('active');
  const [autoChoice, setAutoChoice] = useState<AutoChoiceType>('lc50');

  // 2. Primary Inputs
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [existingCorpus, setExistingCorpus] = useState<number>(0);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(10000);
  const [annualContribution, setAnnualContribution] = useState<number>(120000);
  const [stepUpPct, setStepUpPct] = useState<number>(5); // step-up annual increase %
  const [expectedReturns, setExpectedReturns] = useState<number>(10);
  const [annuityPercent, setAnnuityPercent] = useState<number>(40);
  const [annuityRate, setAnnuityRate] = useState<number>(6);
  const [inflationRate, setInflationRate] = useState<number>(6);

  // 3. Asset Allocations (Active Choice)
  const [allocEquity, setAllocEquity] = useState<number>(60);
  const [allocCorpBond, setAllocCorpBond] = useState<number>(25);
  const [allocGovSec, setAllocGovSec] = useState<number>(15);
  const [allocAlt, setAllocAlt] = useState<number>(0);

  // 4. Reverse Solver inputs
  const [desiredPension, setDesiredPension] = useState<number>(50000);

  // 5. Scenario Comparison Inputs
  const [compScenarioA, setCompScenarioA] = useState({ contribution: 10000, stepUp: 5, returns: 10 });
  const [compScenarioB, setCompScenarioB] = useState({ contribution: 15000, stepUp: 5, returns: 10 });
  const [compScenarioC, setCompScenarioC] = useState({ contribution: 20000, stepUp: 10, returns: 10 });

  // 6. Tax Benefits Module inputs
  const [annualSalary, setAnnualSalary] = useState<number>(1200000); // 12 LPA
  const [taxSlabPct, setTaxSlabPct] = useState<number>(30); // 30% slab rate

  // UI state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // --- Two-Way Synchronization of Contributions ---
  const handleContributionChange = (val: number, type: 'monthly' | 'annual') => {
    if (type === 'monthly') {
      setMonthlyContribution(val);
      setAnnualContribution(val * 12);
    } else {
      setAnnualContribution(val);
      setMonthlyContribution(Math.round(val / 12));
    }
  };

  // Enforce exit rules and limits based on regulations updated on 20 July 2026
  useEffect(() => {
    if (exitType === 'premature') {
      // Premature exit: minimum 80% annuity is mandatory
      if (annuityPercent < 80) setAnnuityPercent(80);
    } else if (exitType === 'normal') {
      // Normal exit: minimum 40% annuity is mandatory
      if (annuityPercent < 40) setAnnuityPercent(40);
    } else {
      // Death exit: nominee gets 100% lump sum option
      setAnnuityPercent(0);
    }
  }, [exitType]);

  // Enforce asset allocation rules based on subscriber types
  useEffect(() => {
    if (choice === 'active') {
      const maxEquity = subscriber === 'government' ? 50 : 75;
      if (allocEquity > maxEquity) {
        const excess = allocEquity - maxEquity;
        setAllocEquity(maxEquity);
        setAllocGovSec((prev) => prev + excess);
      }
    }
  }, [subscriber, choice, allocEquity]);

  // Compute Auto Choice asset weights dynamically based on current age
  const autoAllocations = useMemo(() => {
    if (choice !== 'auto') return { equity: allocEquity, corp: allocCorpBond, gov: allocGovSec, alt: allocAlt };
    
    // Auto Choice allocation shifts with age
    let equity = 50;
    let corp = 30;
    let gov = 20;
    let alt = 0;

    if (autoChoice === 'lc75') {
      // Aggressive lifecycle
      if (currentAge <= 35) {
        equity = 75; corp = 10; gov = 15;
      } else if (currentAge >= 55) {
        equity = 15; corp = 10; gov = 75;
      } else {
        // Linear step down from 75% to 15% over 20 years
        const factor = (currentAge - 35) / 20;
        equity = Math.round(75 - factor * 60);
        corp = 10;
        gov = 90 - equity;
      }
    } else if (autoChoice === 'lc50') {
      // Moderate lifecycle
      if (currentAge <= 35) {
        equity = 50; corp = 30; gov = 20;
      } else if (currentAge >= 55) {
        equity = 10; corp = 10; gov = 80;
      } else {
        const factor = (currentAge - 35) / 20;
        equity = Math.round(50 - factor * 40);
        corp = Math.round(30 - factor * 20);
        gov = 100 - equity - corp;
      }
    } else {
      // Conservative lifecycle (LC25)
      if (currentAge <= 35) {
        equity = 25; corp = 25; gov = 50;
      } else if (currentAge >= 55) {
        equity = 5; corp = 5; gov = 90;
      } else {
        const factor = (currentAge - 35) / 20;
        equity = Math.round(25 - factor * 20);
        corp = Math.round(25 - factor * 20);
        gov = 100 - equity - corp;
      }
    }

    return { equity, corp, gov, alt };
  }, [choice, autoChoice, currentAge, allocEquity, allocCorpBond, allocGovSec, allocAlt]);

  // --- Dynamic Core Calculations ---
  const calculations = useMemo(() => {
    const investmentYears = Math.max(1, retirementAge - currentAge);
    
    // Accumulation engine with Step-Up increments
    let corpus = existingCorpus;
    let totalInvested = existingCorpus;
    let payment = monthlyContribution;
    const yearByYear: ProjectionRow[] = [];

    for (let yr = 1; yr <= investmentYears; yr++) {
      const startCorpus = corpus;
      const annualContribThisYear = payment * 12;
      let contributionsThisYear = 0;

      // Compounded monthly
      const rateMonthly = expectedReturns / 12 / 100;
      for (let m = 0; m < 12; m++) {
        corpus += payment;
        contributionsThisYear += payment;
        totalInvested += payment;
        corpus *= (1 + rateMonthly);
      }

      const endCorpus = corpus;
      const growth = endCorpus - startCorpus - contributionsThisYear;

      yearByYear.push({
        age: currentAge + yr,
        annualContribution: annualContribThisYear,
        totalInvested,
        estimatedCorpus: Math.round(corpus),
        growth: Math.round(growth)
      });

      // Apply annual step-up increment
      payment = payment * (1 + stepUpPct / 100);
    }

    // Split payouts based on Exit scenario rules
    const projectedCorpus = corpus;
    const annuityCorpus = (projectedCorpus * annuityPercent) / 100;
    const lumpSumCorpus = projectedCorpus - annuityCorpus;

    // Monthly pension payouts
    const estimatedMonthlyPension = (annuityCorpus * (annuityRate / 100)) / 12;

    // Inflation adjustments (Present Value)
    const inflationFactor = Math.pow(1 + inflationRate / 100, investmentYears);
    const inflationAdjustedCorpus = projectedCorpus / inflationFactor;
    const inflationAdjustedPension = estimatedMonthlyPension / inflationFactor;

    // Maturity Milestones
    const milestonesList: MilestoneRow[] = [];
    const milestoneTargets = [1000000, 5000000, 10000000, 20000000, 50000000];
    milestoneTargets.forEach((target) => {
      const found = yearByYear.find(row => row.estimatedCorpus >= target);
      if (found) {
        milestonesList.push({
          label: `₹${(target / 100000).toFixed(0)} Lakhs`,
          age: found.age
        });
      }
    });

    return {
      investmentYears,
      totalInvested: Math.round(totalInvested),
      projectedCorpus: Math.round(projectedCorpus),
      annuityCorpus: Math.round(annuityCorpus),
      lumpSumCorpus: Math.round(lumpSumCorpus),
      netPension: Math.round(estimatedMonthlyPension),
      pvCorpus: Math.round(inflationAdjustedCorpus),
      pvPension: Math.round(inflationAdjustedPension),
      yearByYear,
      milestonesList
    };
  }, [
    currentAge,
    retirementAge,
    existingCorpus,
    monthlyContribution,
    stepUpPct,
    expectedReturns,
    annuityPercent,
    annuityRate,
    inflationRate
  ]);

  // --- REVERSE SOLVER: Solve for Desired Pension ---
  const reverseSolverResults = useMemo(() => {
    if (calcMode !== 'reverse_pension') return null;

    // Solved Annuity Corpus required to yield target monthly pension
    const solvedAnnuityCorpus = (desiredPension * 12) / (annuityRate / 100);
    const solvedTotalCorpus = (solvedAnnuityCorpus * 100) / annuityPercent;

    // Binary search starting contribution to reach solvedTotalCorpus
    const investmentYears = Math.max(1, retirementAge - currentAge);
    let low = 1000;
    let high = 500000;
    let solvedMonthlyContrib = 1000;

    for (let iter = 0; iter < 45; iter++) {
      const mid = (low + high) / 2;
      let corpus = existingCorpus;
      let payment = mid;

      for (let yr = 1; yr <= investmentYears; yr++) {
        const rateMonthly = expectedReturns / 12 / 100;
        for (let m = 0; m < 12; m++) {
          corpus += payment;
          corpus *= (1 + rateMonthly);
        }
        payment = payment * (1 + stepUpPct / 100);
      }

      if (corpus < solvedTotalCorpus) {
        low = mid;
      } else {
        high = mid;
        solvedMonthlyContrib = mid;
      }
    }

    return {
      requiredAnnuity: Math.round(solvedAnnuityCorpus),
      requiredCorpus: Math.round(solvedTotalCorpus),
      requiredMonthlyContribution: Math.round(solvedMonthlyContrib)
    };
  }, [
    calcMode,
    desiredPension,
    annuityRate,
    annuityPercent,
    currentAge,
    retirementAge,
    existingCorpus,
    expectedReturns,
    stepUpPct
  ]);

  // --- Scenario Comparative Simulator ---
  const scenarioComparisons = useMemo(() => {
    if (calcMode !== 'compare_scenarios') return null;

    const computeMaturity = (startContrib: number, stepUp: number, returns: number) => {
      const investmentYears = Math.max(1, retirementAge - currentAge);
      let corpus = existingCorpus;
      let payment = startContrib;

      for (let yr = 1; yr <= investmentYears; yr++) {
        const rateMonthly = returns / 12 / 100;
        for (let m = 0; m < 12; m++) {
          corpus += payment;
          corpus *= (1 + rateMonthly);
        }
        payment = payment * (1 + stepUp / 100);
      }

      const annuityCorpus = (corpus * annuityPercent) / 100;
      const monthlyPension = (annuityCorpus * (annuityRate / 100)) / 12;

      return {
        totalCorpus: Math.round(corpus),
        monthlyPension: Math.round(monthlyPension)
      };
    };

    return {
      A: computeMaturity(compScenarioA.contribution, compScenarioA.stepUp, compScenarioA.returns),
      B: computeMaturity(compScenarioB.contribution, compScenarioB.stepUp, compScenarioB.returns),
      C: computeMaturity(compScenarioC.contribution, compScenarioC.stepUp, compScenarioC.returns)
    };
  }, [
    calcMode,
    currentAge,
    retirementAge,
    existingCorpus,
    annuityPercent,
    annuityRate,
    compScenarioA,
    compScenarioB,
    compScenarioC
  ]);

  // --- Tax Benefits Planning calculations ---
  const taxSavingsResults = useMemo(() => {
    // 80CCD(1) Employee contribution capped at ₹1,50,000 (part of 80C)
    // 80CCD(1B) Employee Tier I additional deduction capped at ₹50,005
    // Total maximum eligible deduction = ₹2,00,000
    const annualEmployeeContribution = monthlyContribution * 12;
    const eligibleEmployeeDeduction = Math.min(200000, annualEmployeeContribution);

    // 80CCD(2) Employer NPS contribution (up to 10% of basic + DA, basic is assumed to be 50% of annual salary)
    const basicPayEstimate = annualSalary * 0.5;
    const limitPct = subscriber === 'government' ? 0.14 : 0.10;
    const eligibleEmployerDeduction = Math.min(basicPayEstimate * limitPct, annualEmployeeContribution);

    const totalEligibleDeduction = eligibleEmployeeDeduction + (subscriber !== 'citizen' ? eligibleEmployerDeduction : 0);
    const estimatedTaxSaved = totalEligibleDeduction * (taxSlabPct / 100);

    return {
      eligibleEmployeeDeduction,
      eligibleEmployerDeduction,
      totalEligibleDeduction,
      estimatedTaxSaved
    };
  }, [monthlyContribution, taxSlabPct, annualSalary, subscriber]);

  // --- Export Actions handlers ---
  const copyBreakupReport = () => {
    const text = `National Pension System Planning Audit (Toolique)
----------------------------------------------
Subscriber Category : ${subscriber.toUpperCase()}
NPS Account Tier    : ${tier === 'tier1' ? 'Tier I (Retirement)' : 'Tier II (Voluntary)'}
Investment Period   : ${calculations.investmentYears} Years (Age ${currentAge} to ${retirementAge})
Expected Return     : ${expectedReturns}% p.a.
Annuity Reinvestment: ${annuityPercent}%
----------------------------------------------
Total Invested      : ₹${calculations.totalInvested.toLocaleString('en-IN')}
Projected Corpus    : ₹${calculations.projectedCorpus.toLocaleString('en-IN')}
Lump Sum Payout     : ₹${calculations.lumpSumCorpus.toLocaleString('en-IN')}
Annuity Value       : ₹${calculations.annuityCorpus.toLocaleString('en-IN')}
ESTIMATED PENSION   : ₹${calculations.netPension.toLocaleString('en-IN')}/month
----------------------------------------------
Inflation-Adjusted Present Value:
- Corpus Worth Today: ₹${calculations.pvCorpus.toLocaleString('en-IN')}
- Pension Worth Today: ₹${calculations.pvPension.toLocaleString('en-IN')}/mo`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const exportCSV = () => {
    const headers = ['Age', 'Annual Contribution (₹)', 'Total Cumulative Invested (₹)', 'Projected Maturity Value (₹)'];
    const rows = calculations.yearByYear.map(r => [r.age, r.annualContribution, r.totalInvested, r.estimatedCorpus]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NPS_Maturity_Accumulation_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>NPS Retirement Clearance - Toolique</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            h2 { border-bottom: 2px solid #555; padding-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 12px 0; font-size: 14px; }
            .total { font-weight: bold; font-size: 1.1em; border-top: 1px solid #333; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h2>NATIONAL PENSION SYSTEM REPORT</h2>
          <div class="row"><span>Subscriber Type</span><span>${subscriber.toUpperCase()}</span></div>
          <div class="row"><span>Total Contributions</span><span>₹${calculations.totalInvested.toLocaleString('en-IN')}</span></div>
          <div class="row"><span>Annuity Reinvestment (${annuityPercent}%)</span><span>₹${calculations.annuityCorpus.toLocaleString('en-IN')}</span></div>
          <div class="row"><span>Maturity Lump Sum Payout</span><span>₹${calculations.lumpSumCorpus.toLocaleString('en-IN')}</span></div>
          <div class="row total"><span>Monthly Pension</span><span>₹${calculations.netPension.toLocaleString('en-IN')}/mo</span></div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(30, 41, 59); // Slate-800 theme color
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('NATIONAL PENSION SYSTEM PLAN', 15, 22);
    doc.setFontSize(10);
    doc.text('PFRDA Compliance & Retirement Audit — Toolique.in', 15, 30);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Investment assumptions', 15, 52);

    doc.setFontSize(10);
    doc.text(`Current Age: ${currentAge} years | Target Retirement: ${retirementAge} years`, 15, 60);
    doc.text(`Starting monthly investment: Rs. ${monthlyContribution.toLocaleString('en-IN')}/mo`, 15, 66);
    doc.text(`Annual step-up increment: ${stepUpPct}%`, 15, 72);
    doc.text(`Expected asset return: ${expectedReturns}% p.a.`, 15, 78);

    doc.line(15, 84, 195, 84);

    doc.setFontSize(12);
    doc.text('Maturity Wealth Splits', 15, 94);

    doc.setFontSize(10);
    doc.text(`Total Projected Corpus: Rs. ${calculations.projectedCorpus.toLocaleString('en-IN')}`, 15, 102);
    doc.text(`Tax-Free Lump Sum (withdrawable): Rs. ${calculations.lumpSumCorpus.toLocaleString('en-IN')}`, 15, 108);
    doc.text(`Annuity Balance (for pension): Rs. ${calculations.annuityCorpus.toLocaleString('en-IN')}`, 15, 114);
    doc.text(`Guaranteed Monthly Pension: Rs. ${calculations.netPension.toLocaleString('en-IN')}/mo`, 15, 120);

    doc.save(`NPS_Retirement_Report_${Date.now()}.pdf`);
  };

  const getShareLink = () => {
    const params = new URLSearchParams();
    params.set('mode', calcMode);
    params.set('age', currentAge.toString());
    params.set('ret', retirementAge.toString());
    params.set('contrib', monthlyContribution.toString());
    params.set('rate', expectedReturns.toString());
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-500/10 text-slate-700 dark:text-slate-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm">NPS Retirement Planner</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium font-mono">PFRDA exits regulations updated: 20 July 2026</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              navigator.clipboard.writeText(getShareLink());
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className="text-[9px] font-bold text-slate-700 dark:text-slate-400 bg-slate-500/10 border border-slate-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Plan'}</span>
          </button>
        </div>
      </div>

      {/* CORE WORKSPACE TABS */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setCalcMode('forward')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'forward' ? 'bg-slate-700 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Corpus Projection Planner
        </button>
        <button
          onClick={() => setCalcMode('reverse_pension')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'reverse_pension' ? 'bg-slate-700 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Desired Pension Solver (Reverse)
        </button>
        <button
          onClick={() => setCalcMode('compare_scenarios')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            calcMode === 'compare_scenarios' ? 'bg-slate-700 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Compare Scenarios
        </button>
      </div>

      {/* TWO COLUMN INTERACTION LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CALCULATOR INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-3">
              <Sparkles className="w-4 h-4 text-slate-500" />
              <span>Investment parameters</span>
            </h3>

            {/* Subscriber type & Tier Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Subscriber Type</label>
                <select
                  value={subscriber}
                  onChange={(e) => setSubscriber(e.target.value as SubscriberType)}
                  className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-bold focus:outline-none"
                >
                  <option value="corporate">Private Sector</option>
                  <option value="government">Government Employee</option>
                  <option value="citizen">All Citizen (Self-Employed)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Tier Account</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as TierType)}
                  className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-bold focus:outline-none"
                >
                  <option value="tier1">Tier I (Retirement)</option>
                  <option value="tier2">Tier II (Voluntary)</option>
                </select>
              </div>
            </div>

            {/* Exit Scenario selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase block">Exit Scenario</label>
              <select
                value={exitType}
                onChange={(e) => setExitType(e.target.value as ExitType)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold bg-transparent text-zinc-700 dark:text-zinc-350 focus:outline-none"
              >
                <option value="normal">Normal Exit (At age 60+)</option>
                <option value="premature">Premature Exit (Withdraw before 60)</option>
                <option value="death">Exit due to Death (nominee split)</option>
              </select>
            </div>

            {/* Age Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-450 block uppercase">Current Age</label>
                <input
                  type="number"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Math.min(retirementAge - 1, Math.max(18, parseInt(e.target.value) || 30)))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-450 block uppercase">Retirement Age</label>
                <input
                  type="number"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(Math.max(currentAge + 1, Math.min(75, parseInt(e.target.value) || 60)))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Contribution Inputs */}
            {calcMode !== 'reverse_pension' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 block uppercase">Monthly Contribution</label>
                  <input
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => handleContributionChange(Math.max(0, parseInt(e.target.value) || 0), 'monthly')}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-855 rounded text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 block uppercase">Annual Contribution</label>
                  <input
                    type="number"
                    value={annualContribution}
                    onChange={(e) => handleContributionChange(Math.max(0, parseInt(e.target.value) || 0), 'annual')}
                    className="w-full px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-855 rounded text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* Reverse Mode: Desired Monthly pension */}
            {calcMode === 'reverse_pension' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-450 block uppercase">Desired Monthly Pension (₹)</label>
                <input
                  type="number"
                  value={desiredPension}
                  onChange={(e) => setDesiredPension(Math.max(1000, parseInt(e.target.value) || 50000))}
                  className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>
            )}

            {/* Existing corpus and Step-Up slider */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Existing NPS Corpus (₹)</label>
                <input
                  type="number"
                  value={existingCorpus}
                  onChange={(e) => setExistingCorpus(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2 border rounded-xl font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Annual Step-Up Increase (%)</label>
                <input
                  type="number"
                  value={stepUpPct}
                  onChange={(e) => setStepUpPct(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                  className="w-full p-2 border rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            {/* Expected Returns and Annuity percentage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Expected Return (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={expectedReturns}
                  onChange={(e) => setExpectedReturns(Math.max(1, parseFloat(e.target.value) || 10))}
                  className="w-full p-2 border rounded-xl font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Annuity Reinvestment (%)</label>
                <input
                  type="number"
                  value={annuityPercent}
                  onChange={(e) => setAnnuityPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 40)))}
                  className="w-full p-2 border rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            {/* Expected Annuity Rate and Inflation Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Expected Annuity Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={annuityRate}
                  onChange={(e) => setAnnuityRate(Math.max(1, parseFloat(e.target.value) || 6))}
                  className="w-full p-2 border rounded-xl font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Expected Inflation (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Math.max(0, parseFloat(e.target.value) || 6))}
                  className="w-full p-2 border rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            {/* Asset Allocation Chooser */}
            <div className="space-y-3 pt-3 border-t border-zinc-150 dark:border-zinc-850">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-zinc-650">Asset Allocation Strategy</label>
                <div className="flex gap-2">
                  <button onClick={() => setChoice('active')} className={`px-2 py-0.5 rounded text-[10px] font-bold ${choice === 'active' ? 'bg-slate-700 text-white' : 'bg-zinc-100 text-zinc-500'}`}>Active Choice</button>
                  <button onClick={() => setChoice('auto')} className={`px-2 py-0.5 rounded text-[10px] font-bold ${choice === 'auto' ? 'bg-slate-700 text-white' : 'bg-zinc-100 text-zinc-500'}`}>Auto Choice</button>
                </div>
              </div>

              {/* Active choice sliders */}
              {choice === 'active' && (
                <div className="space-y-2 pl-3 border-l border-slate-500/20 text-[10px]">
                  <div className="flex justify-between">
                    <span>Equity (E): {allocEquity}%</span>
                    <input type="range" min="0" max={subscriber === 'government' ? 50 : 75} value={allocEquity} onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setAllocEquity(val);
                      setAllocGovSec(100 - val - allocCorpBond - allocAlt);
                    }} className="w-24 h-1 cursor-pointer accent-slate-700" />
                  </div>
                  <div className="flex justify-between">
                    <span>Corporate Bonds (C): {allocCorpBond}%</span>
                    <input type="range" min="0" max="100" value={allocCorpBond} onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setAllocCorpBond(val);
                      setAllocGovSec(100 - allocEquity - val - allocAlt);
                    }} className="w-24 h-1 cursor-pointer accent-slate-700" />
                  </div>
                  {subscriber !== 'government' && (
                    <div className="flex justify-between">
                      <span>Alternatives (A): {allocAlt}%</span>
                      <input type="range" min="0" max="5" value={allocAlt} onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setAllocAlt(val);
                        setAllocGovSec(100 - allocEquity - allocCorpBond - val);
                      }} className="w-24 h-1 cursor-pointer accent-slate-700" />
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Govt Securities (G): {allocGovSec}%</span>
                    <span className="font-bold text-zinc-500">{allocGovSec}%</span>
                  </div>
                </div>
              )}

              {/* Auto choice lifecycle */}
              {choice === 'auto' && (
                <div className="grid grid-cols-3 gap-2 pl-3 border-l border-slate-500/20 text-[10px]">
                  <button onClick={() => setAutoChoice('lc75')} className={`p-1 border rounded font-bold ${autoChoice === 'lc75' ? 'border-slate-700 bg-slate-500/10' : 'border-zinc-200'}`}>LC75 Aggressive</button>
                  <button onClick={() => setAutoChoice('lc50')} className={`p-1 border rounded font-bold ${autoChoice === 'lc50' ? 'border-slate-700 bg-slate-500/10' : 'border-zinc-200'}`}>LC50 Moderate</button>
                  <button onClick={() => setAutoChoice('lc25')} className={`p-1 border rounded font-bold ${autoChoice === 'lc25' ? 'border-slate-700 bg-slate-500/10' : 'border-zinc-200'}`}>LC25 Conservative</button>
                </div>
              )}

              {/* Effective weights summary */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 rounded-xl text-[10px] space-y-1.5 mt-2">
                <span className="font-bold text-zinc-500 uppercase tracking-wider block">Effective Asset Allocation</span>
                <div className="grid grid-cols-4 gap-1 text-[9px] text-zinc-550 dark:text-zinc-400">
                  <div>E: <strong className="text-zinc-800 dark:text-zinc-200">{choice === 'auto' ? autoAllocations.equity : allocEquity}%</strong></div>
                  <div>C: <strong className="text-zinc-800 dark:text-zinc-200">{choice === 'auto' ? autoAllocations.corp : allocCorpBond}%</strong></div>
                  <div>G: <strong className="text-zinc-800 dark:text-zinc-200">{choice === 'auto' ? autoAllocations.gov : allocGovSec}%</strong></div>
                  {subscriber !== 'government' && (
                    <div>A: <strong className="text-zinc-800 dark:text-zinc-200">{choice === 'auto' ? autoAllocations.alt : allocAlt}%</strong></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CORE RETIREMENT HEALTH DASHBOARD */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">Estimated retirement wealth projection</span>
                <h3 className="text-sm font-black text-indigo-400 mt-0.5">Maturity summary</h3>
              </div>
              <button
                onClick={copyBreakupReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-350 hover:bg-slate-750 hover:text-white transition"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? 'Copied' : 'Copy Plan'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] font-bold text-indigo-300 uppercase block tracking-wider">Projected Maturity Corpus</span>
                <div className="text-2xl md:text-3xl font-black text-white mt-1 font-mono tracking-tight">
                  ₹{calculations.projectedCorpus.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-teal-300 font-extrabold uppercase block font-sans">Estimated Monthly Pension</span>
                <div className="text-2xl font-black font-mono text-teal-400 mt-1">₹{calculations.netPension.toLocaleString('en-IN')}/mo</div>
              </div>
            </div>

            {/* Calculations Splits Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left pt-2 border-t border-slate-800">
              <div className="bg-slate-850/50 p-3 rounded-xl border border-slate-800/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Lump Sum (Payout)</span>
                <span className="text-xs font-black font-mono text-white mt-1 block">₹{calculations.lumpSumCorpus.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-850/50 p-3 rounded-xl border border-slate-800/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Annuity Purchase</span>
                <span className="text-xs font-black font-mono text-teal-400 mt-1 block">₹{calculations.annuityCorpus.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-850/50 p-3 rounded-xl border border-slate-800/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Total Invested</span>
                <span className="text-xs font-black font-mono text-zinc-300 mt-1 block">₹{calculations.totalInvested.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-slate-850/50 p-3 rounded-xl border border-slate-800/40">
                <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Interest growth</span>
                <span className="text-xs font-black font-mono text-indigo-400 mt-1 block">₹{Math.max(0, calculations.projectedCorpus - calculations.totalInvested).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Inflation-Adjusted Present Value section */}
            <div className="p-4 rounded-xl bg-slate-850/40 border border-slate-800/45 text-xs text-zinc-400 space-y-2">
              <div className="font-bold text-white uppercase tracking-wider text-[9px]">Purchasing Power (Inflation adjusted at {inflationRate}%)</div>
              <div className="flex justify-between">
                <span>Present Value of Corpus today:</span>
                <span className="font-mono text-zinc-300 font-bold">₹{calculations.pvCorpus.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Present Value of monthly Pension today:</span>
                <span className="font-mono text-teal-400 font-bold">₹{calculations.pvPension.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>
          </div>

          {/* Reverse Solver Pension targets */}
          {calcMode === 'reverse_pension' && reverseSolverResults && (
            <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block">Solved NPS breakups for desired Monthly Pension</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl">
                  <span className="text-[8px] text-zinc-400 uppercase font-black block">Annuity Needed</span>
                  <span className="text-xs font-bold font-mono mt-1 block">₹{reverseSolverResults.requiredAnnuity.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl">
                  <span className="text-[8px] text-zinc-400 uppercase font-black block">Maturity Target</span>
                  <span className="text-xs font-bold font-mono mt-1 block">₹{reverseSolverResults.requiredCorpus.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-white dark:bg-zinc-950/40 border rounded-xl">
                  <span className="text-[8px] text-zinc-400 uppercase font-black block">Monthly Starting SIP</span>
                  <span className="text-xs font-bold font-mono mt-1 block text-teal-600">₹{reverseSolverResults.requiredMonthlyContribution.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACCUMULATION LEDGER TABLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Maturity Projections Ledger</h3>
        
        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold">
                <th className="py-2.5 pl-2">End Age</th>
                <th className="py-2.5 text-right">Annual Contribution (₹)</th>
                <th className="py-2.5 text-right">Total Invested (₹)</th>
                <th className="py-2.5 text-right">Est. Growth interest (₹)</th>
                <th className="py-2.5 text-right pr-2">Projected Corpus (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-semibold font-mono text-zinc-700 dark:text-zinc-350">
              {calculations.yearByYear.slice(0, 30).map((row) => (
                <tr key={row.age} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                  <td className="py-2.5 pl-2">{row.age} years</td>
                  <td className="py-2.5 text-right">₹{row.annualContribution.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right">₹{row.totalInvested.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right">₹{row.growth.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-right pr-2 text-slate-800 dark:text-white font-bold">₹{row.estimatedCorpus.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROADMAP TARGET MILESTONES */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Corpus Maturity Roadmaps</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {calculations.milestonesList.length > 0 ? (
            calculations.milestonesList.map((m, idx) => (
              <div key={idx} className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 rounded-xl text-center">
                <span className="text-[8px] text-zinc-400 uppercase font-black block">Target {m.label}</span>
                <span className="text-xs font-bold font-mono mt-1 block">Age {m.age} years</span>
              </div>
            ))
          ) : (
            <p className="col-span-full text-xs text-zinc-450 italic text-center py-2">Maturity targets exceed current investment horizon parameters.</p>
          )}
        </div>
      </div>

      {/* ANNUITY SENSITIVITY TABLE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">What If Annuity Rate Changes?</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-mono">
          {[5, 6, 7, 8, 9].map((rate) => {
            const monthlyPension = (calculations.annuityCorpus * (rate / 100)) / 12;
            return (
              <div key={rate} className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 rounded-xl text-center">
                <span className="text-[8px] text-zinc-400 uppercase font-black block">Annuity at {rate}%</span>
                <span className="text-xs font-bold text-teal-600 mt-1 block">₹{Math.round(monthlyPension).toLocaleString('en-IN')}/mo</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* NPS TAX BENEFIT MODULE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">NPS Tax Benefits Estimator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Annual Salary (₹)</label>
                <input
                  type="number"
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2 border rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Tax Slab Rate (%)</label>
                <select
                  value={taxSlabPct}
                  onChange={(e) => setTaxSlabPct(parseInt(e.target.value))}
                  className="w-full p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-transparent text-xs font-bold focus:outline-none"
                >
                  <option value="5">5% Slab</option>
                  <option value="10">10% Slab</option>
                  <option value="15">15% Slab</option>
                  <option value="20">20% Slab</option>
                  <option value="30">30% Slab</option>
                </select>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-4 rounded-2xl bg-slate-500/5 border border-slate-500/10 grid grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-[8px] text-zinc-400 uppercase font-black block">Employee Sec 80CCD(1B)</span>
              <span className="text-xs font-bold mt-1 block">₹{taxSavingsResults.eligibleEmployeeDeduction.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[8px] text-zinc-400 uppercase font-black block">Employer Sec 80CCD(2)</span>
              <span className="text-xs font-bold mt-1 block">₹{taxSavingsResults.eligibleEmployerDeduction.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[8px] text-zinc-400 uppercase font-black block">Estimated Tax Saved</span>
              <span className="text-xs font-bold text-emerald-600 mt-1 block">₹{Math.round(taxSavingsResults.estimatedTaxSaved).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* COMPARATIVE SCENARIOS DECK */}
      {calcMode === 'compare_scenarios' && scenarioComparisons && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Compare Investment Strategies</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20">
              <div className="text-xs font-bold text-zinc-800">Scenario A Settings</div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase font-bold">Monthly (₹)</label>
                  <input
                    type="number"
                    value={compScenarioA.contribution}
                    onChange={(e) => setCompScenarioA({ ...compScenarioA, contribution: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full p-1 border rounded font-mono text-[10px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase font-bold">Step-Up %</label>
                  <input
                    type="number"
                    value={compScenarioA.stepUp}
                    onChange={(e) => setCompScenarioA({ ...compScenarioA, stepUp: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full p-1 border rounded font-mono text-[10px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase font-bold">Return %</label>
                  <input
                    type="number"
                    value={compScenarioA.returns}
                    onChange={(e) => setCompScenarioA({ ...compScenarioA, returns: Math.max(1, parseFloat(e.target.value) || 10) })}
                    className="w-full p-1 border rounded font-mono text-[10px]"
                  />
                </div>
              </div>
              <div className="text-xs font-mono pt-2 border-t border-zinc-250/50 space-y-1">
                <div>Projected Corpus: <strong>₹{scenarioComparisons.A.totalCorpus.toLocaleString('en-IN')}</strong></div>
                <div>Monthly Pension: <strong>₹{scenarioComparisons.A.monthlyPension.toLocaleString('en-IN')}/mo</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-855 space-y-3 bg-zinc-50/50 dark:bg-zinc-955/20">
              <div className="text-xs font-bold text-zinc-800">Scenario B Settings</div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase font-bold">Monthly (₹)</label>
                  <input
                    type="number"
                    value={compScenarioB.contribution}
                    onChange={(e) => setCompScenarioB({ ...compScenarioB, contribution: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full p-1 border rounded font-mono text-[10px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase font-bold">Step-Up %</label>
                  <input
                    type="number"
                    value={compScenarioB.stepUp}
                    onChange={(e) => setCompScenarioB({ ...compScenarioB, stepUp: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full p-1 border rounded font-mono text-[10px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase font-bold">Return %</label>
                  <input
                    type="number"
                    value={compScenarioB.returns}
                    onChange={(e) => setCompScenarioB({ ...compScenarioB, returns: Math.max(1, parseFloat(e.target.value) || 10) })}
                    className="w-full p-1 border rounded font-mono text-[10px]"
                  />
                </div>
              </div>
              <div className="text-xs font-mono pt-2 border-t border-zinc-250/50 space-y-1">
                <div>Projected Corpus: <strong>₹{scenarioComparisons.B.totalCorpus.toLocaleString('en-IN')}</strong></div>
                <div>Monthly Pension: <strong>₹{scenarioComparisons.B.monthlyPension.toLocaleString('en-IN')}/mo</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-855 space-y-3 bg-zinc-50/50 dark:bg-zinc-955/20">
              <div className="text-xs font-bold text-zinc-800">Scenario C Settings</div>
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase font-bold">Monthly (₹)</label>
                  <input
                    type="number"
                    value={compScenarioC.contribution}
                    onChange={(e) => setCompScenarioC({ ...compScenarioC, contribution: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full p-1 border rounded font-mono text-[10px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase font-bold">Step-Up %</label>
                  <input
                    type="number"
                    value={compScenarioC.stepUp}
                    onChange={(e) => setCompScenarioC({ ...compScenarioC, stepUp: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full p-1 border rounded font-mono text-[10px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase font-bold">Return %</label>
                  <input
                    type="number"
                    value={compScenarioC.returns}
                    onChange={(e) => setCompScenarioC({ ...compScenarioC, returns: Math.max(1, parseFloat(e.target.value) || 10) })}
                    className="w-full p-1 border rounded font-mono text-[10px]"
                  />
                </div>
              </div>
              <div className="text-xs font-mono pt-2 border-t border-zinc-250/50 space-y-1">
                <div>Projected Corpus: <strong>₹{scenarioComparisons.C.totalCorpus.toLocaleString('en-IN')}</strong></div>
                <div>Monthly Pension: <strong>₹{scenarioComparisons.C.monthlyPension.toLocaleString('en-IN')}/mo</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPORTS DOCK ACTIONS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Export Retirement Plans</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyBreakupReport}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReport ? 'Report Copied' : 'Copy Maturity Breakup'}</span>
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Download CSV Ledger</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
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

      {/* Disclaimers & Bylaws notice */}
      <div className="p-5 rounded-3xl bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-800/80 space-y-4">
        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-2">
          <Info className="w-4 h-4 text-slate-605" />
          <span>Statutory Retirement Clearance Rules Notice</span>
        </h4>
        <p className="text-xs leading-relaxed text-zinc-550 dark:text-zinc-400">
          ⚠️ <strong>Regulatory Compliance Guidelines:</strong> Under current PFRDA exit regulations amended on <strong>20 July 2026</strong>, normal exits permit a maximum of 60% lump-sum tax-free payout, with the remaining 40% mandatory annuity purchase. Premature exits require a minimum 80% annuity allocation. Projections are informational estimates based on target return rates and do not represent guaranteed market returns.
        </p>
      </div>
    </div>
  );
}
