import { useState, useEffect, useRef } from 'react';
import { Check, Download, Share2, Info, AlertCircle, Sparkles } from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Indian Currency Formatting Helper ---
function formatIndianCurrencyAbbr(value: number): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  let result = '';
  if (absValue >= 10000000) {
    result = `₹${(absValue / 10000000).toFixed(2)} Crore`;
  } else if (absValue >= 100000) {
    result = `₹${(absValue / 100000).toFixed(2)} Lakh`;
  } else {
    result = `₹${absValue.toLocaleString('en-IN')}`;
  }
  return isNegative ? `-${result}` : result;
}

function formatIndianCurrencyExact(value: number): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const result = `₹${Math.round(absValue).toLocaleString('en-IN')}`;
  return isNegative ? `-${result}` : result;
}

export default function SIPCalculator() {
  // Mode selection: 'returns' (standard SIP) or 'goal' (target-based required SIP)
  const [mode, setMode] = useState<'returns' | 'goal'>('returns');

  // Input states
  const [monthlySIP, setMonthlySIP] = useState<number>(10000);
  const [targetCorpus, setTargetCorpus] = useState<number>(10000000); // 1 Crore default
  const [years, setYears] = useState<number>(20);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [stepUp, setStepUp] = useState<number>(0);
  const [lumpSum, setLumpSum] = useState<number>(0);
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'half-yearly' | 'yearly'>('monthly');
  const [inflationRate, setInflationRate] = useState<number>(6);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [hoveredYearIndex, setHoveredYearIndex] = useState<number | null>(null);

  // Result calculations cache
  const [results, setResults] = useState<{
    totalInvested: number;
    estimatedReturns: number;
    maturityValue: number;
    totalInvestedNoStepup: number;
    maturityValueNoStepup: number;
    inflationAdjustedPV: number;
    yearlySchedule: any[];
    scenarios: any[];
    milestones: any[];
    requiredStartingSIP: number;
    requiredStartingSIPNoStepup: number;
  }>({
    totalInvested: 0,
    estimatedReturns: 0,
    maturityValue: 0,
    totalInvestedNoStepup: 0,
    maturityValueNoStepup: 0,
    inflationAdjustedPV: 0,
    yearlySchedule: [],
    scenarios: [],
    milestones: [],
    requiredStartingSIP: 0,
    requiredStartingSIPNoStepup: 0
  });

  // URL Sharing input loader
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sip = params.get('sip');
      const target = params.get('target');
      const ret = params.get('return');
      const yrs = params.get('years');
      const step = params.get('stepup');
      const lump = params.get('lump');
      const freq = params.get('frequency');
      const inf = params.get('inflation');
      const m = params.get('mode');

      if (sip) setMonthlySIP(Number(sip));
      if (target) setTargetCorpus(Number(target));
      if (ret) setExpectedReturn(Number(ret));
      if (yrs) setYears(Number(yrs));
      if (step) setStepUp(Number(step));
      if (lump) setLumpSum(Number(lump));
      if (freq) setFrequency(freq as any);
      if (inf) setInflationRate(Number(inf));
      if (m) setMode(m as any);
    } catch (e) {}
  }, []);

  // Compute investment model simulation
  useEffect(() => {
    const totalMonths = years * 12;
    const monthlyRate = expectedReturn / 12 / 100;
    
    // Frequency division helper
    let freqMonths = 1;
    if (frequency === 'quarterly') freqMonths = 3;
    else if (frequency === 'half-yearly') freqMonths = 6;
    else if (frequency === 'yearly') freqMonths = 12;

    // Helper simulation function
    const simulate = (startSIP: number, sRate: number) => {
      let balance = lumpSum;
      let invested = 0;
      let currentSIP = startSIP;

      const scheduleSnapshots = [];
      let yearlyInvested = 0;
      let yearlyReturns = 0;

      // Define milestones to track
      const milestonesList = [
        { amount: 500000, label: '₹5 Lakh', year: 0, reached: false },
        { amount: 1000000, label: '₹10 Lakh', year: 0, reached: false },
        { amount: 2500000, label: '₹25 Lakh', year: 0, reached: false },
        { amount: 5000000, label: '₹50 Lakh', year: 0, reached: false },
        { amount: 10000000, label: '₹1 Crore', year: 0, reached: false },
        { amount: 20000000, label: '₹2 Crore', year: 0, reached: false },
        { amount: 50000000, label: '₹5 Crore', year: 0, reached: false }
      ];

      for (let m = 1; m <= totalMonths; m++) {
        // Apply annual step-up
        if (m > 1 && (m - 1) % 12 === 0) {
          currentSIP = currentSIP * (1 + sRate / 100);
        }

        // Apply SIP installment deposit
        if ((m - 1) % freqMonths === 0) {
          balance += currentSIP;
          invested += currentSIP;
          yearlyInvested += currentSIP;
        }

        // Apply monthly compounding growth
        const interest = balance * monthlyRate;
        balance += interest;
        yearlyReturns += interest;

        // Check milestones
        milestonesList.forEach((stone) => {
          if (!stone.reached && balance >= stone.amount) {
            stone.reached = true;
            stone.year = Math.ceil(m / 12);
          }
        });

        // Capture yearly snapshot
        if (m % 12 === 0) {
          const yearIndex = m / 12;
          scheduleSnapshots.push({
            year: yearIndex,
            monthlySIP: Math.round(currentSIP),
            annualInvestment: Math.round(yearlyInvested),
            totalInvested: Math.round(invested),
            estimatedReturns: Math.round(balance - invested),
            totalCorpus: Math.round(balance),
            growthPercent: Math.round(((balance - invested) / invested) * 100)
          });
        }
      }

      return {
        totalInvested: Math.round(invested),
        estimatedReturns: Math.round(balance - invested),
        maturityValue: Math.round(balance),
        yearlySnapshots: scheduleSnapshots,
        milestones: milestonesList.filter((stone) => stone.reached)
      };
    };

    // Calculate required SIP parameters for GOAL MODE
    // 1. Simulate starting SIP of 0 (lumpsum only)
    const lumpOnly = simulate(0, stepUp);
    // 2. Simulate starting SIP of 1 (SIP share indexer)
    const unitSIP = simulate(1, stepUp);
    const unitSIPNoStepup = simulate(1, 0);

    let reqSIP = 0;
    let reqSIPNoStep = 0;
    if (targetCorpus > lumpOnly.maturityValue) {
      reqSIP = (targetCorpus - lumpOnly.maturityValue) / unitSIP.maturityValue;
      reqSIPNoStep = (targetCorpus - lumpOnly.maturityValue) / unitSIPNoStepup.maturityValue;
    }
    const finalReqSIP = Math.max(0, Math.round(reqSIP));
    const finalReqSIPNoStep = Math.max(0, Math.round(reqSIPNoStep));

    // Execute core active simulation based on active mode
    const activeStartSIP = mode === 'returns' ? monthlySIP : finalReqSIP;
    const activeSimulation = simulate(activeStartSIP, stepUp);

    // Simulate without stepup for comparison
    const simNoStepup = simulate(activeStartSIP, 0);

    // Compute return rate scenarios (8%, 10%, 12%, 14%, 16%)
    const scenarioRates = [8, 10, 12, 14, 16];
    const scenarios = scenarioRates.map((rate) => {
      let bal = lumpSum;
      let currentSIP = activeStartSIP;
      let invested = 0;
      const rateMonthly = rate / 12 / 100;

      for (let m = 1; m <= totalMonths; m++) {
        if (m > 1 && (m - 1) % 12 === 0) {
          currentSIP = currentSIP * (1 + stepUp / 100);
        }
        if ((m - 1) % freqMonths === 0) {
          bal += currentSIP;
          invested += currentSIP;
        }
        bal += bal * rateMonthly;
      }
      return {
        rate,
        totalInvested: Math.round(invested),
        estimatedReturns: Math.round(bal - invested),
        totalCorpus: Math.round(bal)
      };
    });

    // Compute inflation adjusted present value
    const inflationAdjustedPV = Math.round(
      activeSimulation.maturityValue / Math.pow(1 + inflationRate / 100, years)
    );

    setResults({
      totalInvested: activeSimulation.totalInvested,
      estimatedReturns: activeSimulation.estimatedReturns,
      maturityValue: activeSimulation.maturityValue,
      totalInvestedNoStepup: simNoStepup.totalInvested,
      maturityValueNoStepup: simNoStepup.maturityValue,
      inflationAdjustedPV,
      yearlySchedule: activeSimulation.yearlySnapshots,
      scenarios,
      milestones: activeSimulation.milestones,
      requiredStartingSIP: finalReqSIP,
      requiredStartingSIPNoStepup: finalReqSIPNoStep
    });

  }, [mode, monthlySIP, targetCorpus, years, expectedReturn, stepUp, lumpSum, frequency, inflationRate]);

  // Share calculation query generator
  const getShareLink = () => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (mode === 'returns') {
      params.set('sip', monthlySIP.toString());
    } else {
      params.set('target', targetCorpus.toString());
    }
    params.set('years', years.toString());
    params.set('return', expectedReturn.toString());
    params.set('stepup', stepUp.toString());
    params.set('lump', lumpSum.toString());
    params.set('frequency', frequency);
    params.set('inflation', inflationRate.toString());

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(getShareLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // CSV Data Exporter
  const exportToCSV = () => {
    const headers = ['Year', 'Monthly SIP', 'Annual Investment', 'Total Invested', 'Estimated Returns', 'Total Corpus', 'Cumulative Gain %'];
    const rows = results.yearlySchedule.map((row) => [
      `Year ${row.year}`,
      row.monthlySIP,
      row.annualInvestment,
      row.totalInvested,
      row.estimatedReturns,
      row.totalCorpus,
      `${row.growthPercent}%`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Toolique_SIP_Projection_${years}Y.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF estimate builder via jsPDF
  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 15;
    let y = 15;

    // Header Banner
    doc.setFillColor(15, 23, 42); // dark-slate
    doc.rect(0, 0, 210, 38, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('SIP WEALTH PLANNING REPORT', margin, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated on ${new Date().toLocaleDateString()} | Toolique Wealth Management Suite`, margin, 22);

    y = 50;

    // Left Column: Investment Inputs
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, 85, 68, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229);
    doc.text('INVESTMENT INPUTS', margin + 5, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Starting SIP: ${formatIndianCurrencyExact(mode === 'returns' ? monthlySIP : results.requiredStartingSIP)} (${frequency})`, margin + 5, y + 18);
    doc.text(`Investment Tenure: ${years} Years`, margin + 5, y + 26);
    doc.text(`Expected Annual Return: ${expectedReturn}%`, margin + 5, y + 34);
    doc.text(`Annual Step-Up: ${stepUp}%`, margin + 5, y + 42);
    doc.text(`Initial Lump Sum: ${formatIndianCurrencyExact(lumpSum)}`, margin + 5, y + 50);
    doc.text(`Inflation Indexer: ${inflationRate}%`, margin + 5, y + 58);

    // Right Column: Value Projection Summary
    doc.setFillColor(240, 253, 250);
    doc.roundedRect(margin + 90, y, 90, 68, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(13, 148, 136);
    doc.text('WEALTH ACCUMULATION SUMMARY', margin + 95, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Total Investment: ${formatIndianCurrencyExact(results.totalInvested)}`, margin + 95, y + 18);
    doc.text(`Est. Wealth Gains: ${formatIndianCurrencyExact(results.estimatedReturns)}`, margin + 95, y + 26);
    doc.text(`Nominal Future Value: ${formatIndianCurrencyExact(results.maturityValue)}`, margin + 95, y + 34);
    doc.text(`Inflation Adjusted (PV): ${formatIndianCurrencyExact(results.inflationAdjustedPV)}`, margin + 95, y + 42);
    doc.text(`Wealth Multiplier: ${(results.maturityValue / results.totalInvested).toFixed(2)}x`, margin + 95, y + 50);

    y = 130;

    // Yearly Snapshot Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('YEARLY WEALTH GROWTH TIMELINE', margin, y);

    y += 6;
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, 180, 7, 'F');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Year', margin + 3, y + 5);
    doc.text('Monthly SIP', margin + 20, y + 5);
    doc.text('Ann. Invested', margin + 50, y + 5);
    doc.text('Total Invested', margin + 85, y + 5);
    doc.text('Est. Returns', margin + 120, y + 5);
    doc.text('Future Value', margin + 155, y + 5);

    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    results.yearlySchedule.slice(0, 15).forEach((row) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`Yr ${row.year}`, margin + 3, y + 5);
      doc.text(formatIndianCurrencyExact(row.monthlySIP), margin + 20, y + 5);
      doc.text(formatIndianCurrencyExact(row.annualInvestment), margin + 50, y + 5);
      doc.text(formatIndianCurrencyExact(row.totalInvested), margin + 85, y + 5);
      doc.text(formatIndianCurrencyExact(row.estimatedReturns), margin + 120, y + 5);
      doc.text(formatIndianCurrencyExact(row.totalCorpus), margin + 155, y + 5);
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 7, margin + 180, y + 7);
      y += 8;
    });

    if (results.yearlySchedule.length > 15) {
      doc.addPage();
      y = 20;
      doc.setFont('helvetica', 'bold');
      doc.text('YEARLY WEALTH GROWTH TIMELINE (CONTINUED)', margin, y);
      y += 8;
      
      doc.setFillColor(226, 232, 240);
      doc.rect(margin, y, 180, 7, 'F');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Year', margin + 3, y + 5);
      doc.text('Monthly SIP', margin + 20, y + 5);
      doc.text('Ann. Invested', margin + 50, y + 5);
      doc.text('Total Invested', margin + 85, y + 5);
      doc.text('Est. Returns', margin + 120, y + 5);
      doc.text('Future Value', margin + 155, y + 5);
      
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);

      results.yearlySchedule.slice(15).forEach((row) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`Yr ${row.year}`, margin + 3, y + 5);
        doc.text(formatIndianCurrencyExact(row.monthlySIP), margin + 20, y + 5);
        doc.text(formatIndianCurrencyExact(row.annualInvestment), margin + 50, y + 5);
        doc.text(formatIndianCurrencyExact(row.totalInvested), margin + 85, y + 5);
        doc.text(formatIndianCurrencyExact(row.estimatedReturns), margin + 120, y + 5);
        doc.text(formatIndianCurrencyExact(row.totalCorpus), margin + 155, y + 5);
        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y + 7, margin + 180, y + 7);
        y += 8;
      });
    }

    // Disclaimer
    y += 10;
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(margin, y, 180, 16, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(146, 64, 14);
    doc.text('IMPORTANT DISCLAIMER:', margin + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text('These calculations are illustrative estimates based on the assumptions entered. Mutual fund investments are market-linked', margin + 4, y + 10);
    doc.text('and actual returns may vary. This report does not constitute official investment advice or guaranteed results.', margin + 4, y + 13);

    doc.save(`Toolique_SIP_Wealth_Report_${years}Y.pdf`);
  };

  // Interactive line graph tooltip hover calculator
  const containerRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 40; // Subtract padding
    const graphWidth = rect.width - 60;
    const hoverPct = Math.max(0, Math.min(1, x / graphWidth));
    const yearIndex = Math.round(hoverPct * (years - 1));
    if (yearIndex >= 0 && yearIndex < results.yearlySchedule.length) {
      setHoveredYearIndex(yearIndex);
    }
  };

  const handleMouseLeave = () => {
    setHoveredYearIndex(null);
  };

  // Donut chart calculations
  const totalWealth = results.totalInvested + results.estimatedReturns;
  const pctInvested = totalWealth > 0 ? (results.totalInvested / totalWealth) * 100 : 0;
  const pctReturns = totalWealth > 0 ? (results.estimatedReturns / totalWealth) * 100 : 0;

  // Donut SVG constants
  const radius = 50;
  const circ = 2 * Math.PI * radius;
  const offsetInvested = 0;
  const offsetReturns = -(pctInvested / 100) * circ;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Dynamic Tabs / Modes */}
      <div className="flex flex-wrap gap-2.5 border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
        <button
          onClick={() => setMode('returns')}
          className={`px-4 py-2 text-xs font-extrabold rounded-xl transition duration-300 ${
            mode === 'returns'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
              : 'bg-zinc-100 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800/50'
          }`}
        >
          Grow Wealth (SIP Returns)
        </button>
        <button
          onClick={() => setMode('goal')}
          className={`px-4 py-2 text-xs font-extrabold rounded-xl transition duration-300 ${
            mode === 'goal'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
              : 'bg-zinc-100 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800/50'
          }`}
        >
          Plan for a Goal (Required SIP)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800/50">
            <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Planner Inputs</span>
            </h3>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>

          {/* Monthly SIP (Only in returns mode) */}
          {mode === 'returns' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Monthly SIP</label>
                <input
                  type="number"
                  min="100"
                  max="10000000"
                  value={monthlySIP}
                  onChange={(e) => setMonthlySIP(Math.max(100, Math.min(10000000, Number(e.target.value))))}
                  className="w-32 px-2 py-1 text-right font-bold text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-indigo-600 dark:text-indigo-400 focus:outline-none"
                />
              </div>
              <input
                type="range"
                min="500"
                max="250000"
                step="500"
                value={monthlySIP}
                onChange={(e) => setMonthlySIP(Number(e.target.value))}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>₹500</span>
                <span>₹2.5 Lakh</span>
              </div>
            </div>
          )}

          {/* Target Corpus (Only in goal mode) */}
          {mode === 'goal' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400 font-semibold">Target Corpus</label>
                <input
                  type="number"
                  min="10000"
                  max="1000000000"
                  value={targetCorpus}
                  onChange={(e) => setTargetCorpus(Math.max(10000, Math.min(1000000000, Number(e.target.value))))}
                  className="w-36 px-2 py-1 text-right font-bold text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-indigo-600 dark:text-indigo-400 focus:outline-none"
                />
              </div>
              <input
                type="range"
                min="100000"
                max="50000000"
                step="100000"
                value={targetCorpus}
                onChange={(e) => setTargetCorpus(Number(e.target.value))}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>₹1 Lakh</span>
                <span>₹5 Crore</span>
              </div>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold text-right">
                Selected Target: <strong className="text-zinc-700 dark:text-zinc-300">{formatIndianCurrencyAbbr(targetCorpus)}</strong>
              </p>
            </div>
          )}

          {/* Expected Annual Return */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Expected Return (% p.a.)</label>
              <input
                type="number"
                min="1"
                max="30"
                step="0.1"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Math.max(1, Math.min(30, Number(e.target.value))))}
                className="w-20 px-2 py-1 text-right font-bold text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-indigo-600 dark:text-indigo-400 focus:outline-none"
              />
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Investment Duration */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Duration (Years)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={years}
                onChange={(e) => setYears(Math.max(1, Math.min(50, Number(e.target.value))))}
                className="w-20 px-2 py-1 text-right font-bold text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-indigo-600 dark:text-indigo-400 focus:outline-none"
              />
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
              <span>1 Year</span>
              <span>50 Years</span>
            </div>
          </div>

          {/* Annual Step-Up */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400 flex items-center gap-1">
                <span>Annual Step-Up (%)</span>
                <span className="group relative cursor-pointer text-zinc-400">
                  <Info className="w-3.5 h-3.5" />
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-44 p-2 bg-zinc-950 text-white text-[9px] font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 shadow-xl z-20 leading-relaxed text-center font-normal">
                    Increase your monthly investment by this percentage every year.
                  </span>
                </span>
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={stepUp}
                onChange={(e) => setStepUp(Math.max(0, Math.min(25, Number(e.target.value))))}
                className="w-20 px-2 py-1 text-right font-bold text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-indigo-600 dark:text-indigo-400 focus:outline-none"
              />
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={stepUp}
              onChange={(e) => setStepUp(Number(e.target.value))}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
              <span>0% (Flat SIP)</span>
              <span>25%</span>
            </div>
          </div>

          {/* COLLAPSIBLE ADVANCED OPTIONS */}
          {showAdvanced && (
            <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 animate-fadeIn">
              {/* Initial Lumpsum */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Initial Lump Sum (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    max="100000000"
                    value={lumpSum}
                    onChange={(e) => setLumpSum(Math.max(0, Math.min(100000000, Number(e.target.value))))}
                    className="w-28 px-2 py-1 text-right font-bold text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-indigo-600 dark:text-indigo-400 focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="5000"
                  value={lumpSum}
                  onChange={(e) => setLumpSum(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                  <span>₹0</span>
                  <span>₹10 Lakh</span>
                </div>
              </div>

              {/* SIP Frequency */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400 block">Investment Frequency</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['monthly', 'quarterly', 'half-yearly', 'yearly'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq)}
                      className={`py-1.5 px-1 text-[10px] font-bold border rounded-lg transition duration-200 uppercase tracking-wider ${
                        frequency === freq
                          ? 'border-indigo-600 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-500'
                      }`}
                    >
                      {freq.split('-')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inflation Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Assumed Inflation Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Math.max(0, Math.min(15, Number(e.target.value))))}
                    className="w-16 px-2 py-1 text-right font-bold text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-indigo-600 dark:text-indigo-400 focus:outline-none"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                  <span>0% (No Inflation)</span>
                  <span>15%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RESULTS COLUMN */}
        <div className="lg:col-span-7 space-y-6">
          {/* PRIMARY RESULT METRICS */}
          <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-6 border border-zinc-900">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-zinc-900 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Projected Maturity Corpus</span>
                {mode === 'goal' && (
                  <p className="text-xs font-bold text-indigo-400 mt-1">
                    Goal Target: {formatIndianCurrencyAbbr(targetCorpus)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyShareLink}
                  className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-indigo-400 transition"
                  title="Share Calculation scenario"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:text-indigo-400 transition text-xs font-extrabold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Target starting SIP statement in goal-mode */}
            {mode === 'goal' && (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-400">Required Starting SIP</span>
                <div className="text-2xl font-black text-white">
                  {formatIndianCurrencyExact(results.requiredStartingSIP)}
                  <span className="text-xs font-normal text-zinc-400"> / month</span>
                </div>
                {stepUp > 0 && (
                  <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
                    With an annual step-up of {stepUp}%. Without step-up, you would require a starting SIP of{' '}
                    <strong className="text-white">{formatIndianCurrencyExact(results.requiredStartingSIPNoStepup)}/month</strong>.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-900">
                <span className="text-[10px] text-zinc-455 uppercase font-semibold">Future Corpus</span>
                <div className="text-lg font-black text-white mt-1">
                  {formatIndianCurrencyAbbr(results.maturityValue)}
                </div>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-900">
                <span className="text-[10px] text-zinc-455 uppercase font-semibold">Total Invested</span>
                <div className="text-lg font-black text-zinc-200 mt-1">
                  {formatIndianCurrencyAbbr(results.totalInvested)}
                </div>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-900">
                <span className="text-[10px] text-zinc-455 uppercase font-semibold">Est. Returns</span>
                <div className="text-lg font-black text-emerald-400 mt-1">
                  {formatIndianCurrencyAbbr(results.estimatedReturns)}
                </div>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-900">
                <span className="text-[10px] text-zinc-455 uppercase font-semibold">Multiplier</span>
                <div className="text-lg font-black text-indigo-400 mt-1">
                  {(results.maturityValue / Math.max(1, results.totalInvested)).toFixed(2)}×
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex gap-2 text-[10px] text-zinc-500 font-semibold leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                These calculations are illustrative estimates based on the assumptions entered. Mutual fund returns are market-linked and actual returns may vary. This does not constitute investment advice.
              </span>
            </div>
          </div>

          {/* VISUALIZATION BLOCKS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* SVG DONUT CHART CARD */}
            <div className="md:col-span-5 p-5 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between items-center text-center space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 self-start font-semibold">
                Wealth Composition
              </span>

              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Track ring */}
                  <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#f4f4f5" className="dark:stroke-zinc-850" strokeWidth="12" />
                  
                  {/* Invested Ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#6366f1"
                    strokeWidth="12"
                    strokeDasharray={circ}
                    strokeDashoffset={offsetInvested}
                    strokeLinecap="round"
                  />
                  {/* Returns Ring */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={circ}
                    strokeDashoffset={offsetReturns}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Multiplier</span>
                  <span className="text-sm font-black text-zinc-900 dark:text-white">
                    {(results.maturityValue / Math.max(1, results.totalInvested)).toFixed(2)}x
                  </span>
                </div>
              </div>

              <div className="w-full space-y-1.5 text-xs text-left">
                <div className="flex justify-between items-center text-zinc-655 dark:text-zinc-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <span>Invested</span>
                  </span>
                  <span className="font-extrabold text-zinc-855 dark:text-zinc-200">
                    {pctInvested.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-655 dark:text-zinc-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Est. Returns</span>
                  </span>
                  <span className="font-extrabold text-zinc-855 dark:text-zinc-200">
                    {pctReturns.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* SVG GROWTH CHART CARD */}
            <div
              ref={containerRef}
              className="md:col-span-7 p-5 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 font-semibold">
                  Corpus Growth Timeline
                </span>
                <span className="text-[10px] text-zinc-450 font-bold">
                  Hover to inspect
                </span>
              </div>

              {/* Render dynamic SVG Line chart */}
              <div className="relative w-full h-44 mt-3">
                {results.yearlySchedule.length > 0 && (
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 400 160"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  >
                    <defs>
                      <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Chart Paths */}
                    {(() => {
                      const maxVal = Math.max(...results.yearlySchedule.map((d) => d.totalCorpus));
                      const points = results.yearlySchedule.map((d, index) => {
                        const px = (index / (years - 1)) * 340 + 35;
                        const py = 140 - (d.totalCorpus / maxVal) * 110;
                        return { px, py, ...d };
                      });

                      const pathD = `M ${points[0].px} ${points[0].py} ` + points.slice(1).map((p) => `L ${p.px} ${p.py}`).join(' ');
                      const areaD = `${pathD} L ${points[points.length - 1].px} 140 L ${points[0].px} 140 Z`;

                      return (
                        <>
                          {/* Grid lines */}
                          <line x1="35" y1="30" x2="375" y2="30" stroke="#f4f4f5" className="dark:stroke-zinc-850/60" strokeDasharray="3 3" />
                          <line x1="35" y1="85" x2="375" y2="85" stroke="#f4f4f5" className="dark:stroke-zinc-850/60" strokeDasharray="3 3" />
                          <line x1="35" y1="140" x2="375" y2="140" stroke="#e4e4e7" className="dark:stroke-zinc-800" />

                          {/* Gradient fill */}
                          <path d={areaD} fill="url(#growthGrad)" />

                          {/* Main line */}
                          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />

                          {/* Hover indicator line & dot */}
                          {hoveredYearIndex !== null && points[hoveredYearIndex] && (
                            <>
                              <line
                                x1={points[hoveredYearIndex].px}
                                y1="15"
                                x2={points[hoveredYearIndex].px}
                                y2="140"
                                stroke="#a5b4fc"
                                strokeWidth="1"
                                strokeDasharray="2 2"
                              />
                              <circle
                                cx={points[hoveredYearIndex].px}
                                cy={points[hoveredYearIndex].py}
                                r="4"
                                fill="#ffffff"
                                stroke="#6366f1"
                                strokeWidth="2"
                              />
                            </>
                          )}
                        </>
                      );
                    })()}
                  </svg>
                )}
              </div>

              {/* Hover snapshot details */}
              <div className="min-h-8 text-[11px] font-semibold text-zinc-650 dark:text-zinc-400 mt-2 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-850 flex flex-wrap justify-between items-center gap-1">
                {hoveredYearIndex !== null && results.yearlySchedule[hoveredYearIndex] ? (
                  <>
                    <span className="text-indigo-650 dark:text-indigo-400">Year {results.yearlySchedule[hoveredYearIndex].year}</span>
                    <span>SIP: <strong className="text-zinc-800 dark:text-zinc-200">{formatIndianCurrencyAbbr(results.yearlySchedule[hoveredYearIndex].monthlySIP)}</strong></span>
                    <span>Invested: <strong className="text-zinc-800 dark:text-zinc-200">{formatIndianCurrencyAbbr(results.yearlySchedule[hoveredYearIndex].totalInvested)}</strong></span>
                    <span>Returns: <strong className="text-emerald-500">{formatIndianCurrencyAbbr(results.yearlySchedule[hoveredYearIndex].estimatedReturns)}</strong></span>
                    <span>Value: <strong className="text-indigo-650 dark:text-indigo-400">{formatIndianCurrencyAbbr(results.yearlySchedule[hoveredYearIndex].totalCorpus)}</strong></span>
                  </>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-500 italic mx-auto">Hover over the graph to inspect year-by-year value breakdowns</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYSIS MODULES PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* STEP UP IMPACT COMPARE */}
          {stepUp > 0 && (
            <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Power of Compounder</span>
                <h3 className="text-base font-black text-zinc-900 dark:text-white">See the Power of Step-Up SIP</h3>
                <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold">See how a periodic top-up increases your wealth compared to a flat SIP.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-850">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase">Regular Flat SIP</div>
                  <div className="text-lg font-black text-zinc-855 dark:text-zinc-200 mt-2">
                    {formatIndianCurrencyAbbr(results.maturityValueNoStepup)}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Total Invested: {formatIndianCurrencyAbbr(results.totalInvestedNoStepup)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                  <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase">Step-Up SIP ({stepUp}%)</div>
                  <div className="text-lg font-black text-indigo-650 dark:text-indigo-400 mt-2">
                    {formatIndianCurrencyAbbr(results.maturityValue)}
                  </div>
                  <div className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-1">
                    Total Invested: {formatIndianCurrencyAbbr(results.totalInvested)}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Additional Wealth Generated via Step-Up:
                </div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {formatIndianCurrencyAbbr(results.maturityValue - results.maturityValueNoStepup)}
                </div>
              </div>
            </div>
          )}

          {/* RETURN SCENARIOS ANALYSIS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 font-semibold">Simulation Scenarios</span>
              <h3 className="text-base font-black text-zinc-900 dark:text-white">What if returns are different?</h3>
              <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold">Market growth rates fluctuate. Check simulated values at standard return intervals.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800/60 text-[10px] uppercase font-bold text-zinc-400">
                    <th className="py-2.5 px-2">Expected Return</th>
                    <th className="py-2.5 px-2">Total Invested</th>
                    <th className="py-2.5 px-2">Estimated Returns</th>
                    <th className="py-2.5 px-2 text-right">Final Corpus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-855/60">
                  {results.scenarios.map((scen) => (
                    <tr
                      key={scen.rate}
                      className={`hover:bg-zinc-50 dark:hover:bg-zinc-850/20 ${
                        expectedReturn === scen.rate
                          ? 'bg-indigo-500/5 text-indigo-650 dark:text-indigo-400 font-extrabold'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-2 flex items-center gap-1.5 font-bold">
                        <span>{scen.rate}% p.a.</span>
                        {expectedReturn === scen.rate && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] bg-indigo-500/10 uppercase tracking-widest text-indigo-600 font-semibold">
                            Selected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">{formatIndianCurrencyAbbr(scen.totalInvested)}</td>
                      <td className="py-3 px-2 text-emerald-500">{formatIndianCurrencyAbbr(scen.estimatedReturns)}</td>
                      <td className="py-3 px-2 text-right text-zinc-800 dark:text-zinc-200 font-bold">
                        {formatIndianCurrencyAbbr(scen.totalCorpus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* WEALTH TIMELINE MILESTONES */}
          {results.milestones.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-500">Target Milestones</span>
                <h3 className="text-base font-black text-zinc-900 dark:text-white">Your Wealth Milestones</h3>
                <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold">Approximate timeline to reach major cash milestones based on projections.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {results.milestones.map((stone) => (
                  <div key={stone.label} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-850 flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">{stone.label}</span>
                    <div className="text-base font-black text-teal-650 dark:text-teal-400 mt-2">
                      Year {stone.year}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INFLATION VALUE DECORATOR */}
          <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 font-semibold">Purchasing Power Indexer</span>
              <h3 className="text-base font-black text-zinc-900 dark:text-white">What Will Your Money Be Worth?</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                Inflation reduces the purchasing power of money over time. It represents how much today\'s money would buy compared to the nominal future corpus.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-white dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-850 shadow-sm">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Future Nominal Corpus ({years} Yrs)</span>
                <div className="text-base font-black text-zinc-800 dark:text-zinc-200 mt-1">
                  {formatIndianCurrencyAbbr(results.maturityValue)}
                </div>
              </div>
              <div className="bg-rose-500/5 border border-rose-500/15 p-4 rounded-2xl shadow-sm">
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">Today\'s Purchasing Power ({inflationRate}% Inf.)</span>
                <div className="text-base font-black text-rose-700 dark:text-rose-455 mt-1">
                  {formatIndianCurrencyAbbr(results.inflationAdjustedPV)}
                </div>
              </div>
            </div>
          </div>

          {/* COLLAPSIBLE DETAILED PROJECT TABLES */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">Detailed Annual Projections</h3>
                <p className="text-[10px] text-zinc-455 dark:text-zinc-500 mt-0.5 font-semibold">Explore the schedule of yearly investment increments and compound yields.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={exportToCSV}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="px-3 py-1.5 text-xs font-extrabold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 hover:bg-zinc-100 rounded-xl transition"
                >
                  {showSchedule ? 'Collapse' : 'Expand Schedule'}
                </button>
              </div>
            </div>

            {showSchedule && (
              <div className="overflow-x-auto border border-zinc-200/50 dark:border-zinc-850 rounded-2xl max-h-80 overflow-y-auto animate-fadeIn">
                <table className="w-full text-left text-xs font-medium text-zinc-500">
                  <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200/60 dark:border-zinc-800 sticky top-0 z-10">
                    <tr className="text-[10px] font-bold uppercase text-zinc-400">
                      <th className="py-2.5 px-4">Year</th>
                      <th className="py-2.5 px-3">Monthly SIP</th>
                      <th className="py-2.5 px-3">Annual Deposit</th>
                      <th className="py-2.5 px-3">Total Invested</th>
                      <th className="py-2.5 px-3">Wealth Gain</th>
                      <th className="py-2.5 px-4 text-right">Total Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-850/60 text-zinc-655 dark:text-zinc-400">
                    {results.yearlySchedule.map((row) => (
                      <tr key={row.year} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/10">
                        <td className="py-2.5 px-4 font-bold text-zinc-900 dark:text-zinc-200">Yr {row.year}</td>
                        <td className="py-2.5 px-3">{formatIndianCurrencyAbbr(row.monthlySIP)}</td>
                        <td className="py-2.5 px-3">{formatIndianCurrencyAbbr(row.annualInvestment)}</td>
                        <td className="py-2.5 px-3">{formatIndianCurrencyAbbr(row.totalInvested)}</td>
                        <td className="py-2.5 px-3 text-emerald-500">{formatIndianCurrencyAbbr(row.estimatedReturns)}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-indigo-650 dark:text-indigo-400">
                          {formatIndianCurrencyAbbr(row.totalCorpus)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR COLUMNS */}
        <div className="lg:col-span-4 space-y-6">
          {/* SIP VS LUMPSUM COMPARISON MODULE */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 font-semibold">Method Comparison</span>
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">SIP vs Lump sum Comparison</h3>
              <p className="text-[10px] text-zinc-450 leading-relaxed font-semibold">
                Compare current systematic plan results against a hypothetical lump sum invested all at once at the start.
              </p>
            </div>

            <div className="space-y-4">
              {/* SIP summary */}
              <div className="space-y-1">
                <div className="text-[9px] font-bold uppercase text-zinc-400">Systematic Plan (SIP)</div>
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-zinc-500 font-semibold">Invested:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatIndianCurrencyAbbr(results.totalInvested)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-zinc-500 font-semibold">Corpus Value:</span>
                  <span className="font-bold text-indigo-650 dark:text-indigo-400">{formatIndianCurrencyAbbr(results.maturityValue)}</span>
                </div>
              </div>

              {/* Lumpsum equivalent summary */}
              <div className="space-y-1 border-t border-zinc-100 dark:border-zinc-850 pt-3">
                <div className="text-[9px] font-bold uppercase text-zinc-400">Lump Sum (Single Deposit)</div>
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-zinc-500 font-semibold">Invested at Year 0:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatIndianCurrencyAbbr(results.totalInvested)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-zinc-500 font-semibold">Future Value:</span>
                  <span className="font-bold text-indigo-650 dark:text-indigo-400">
                    {formatIndianCurrencyAbbr(
                      Math.round(results.totalInvested * Math.pow(1 + expectedReturn / 100, years))
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[9px] text-zinc-450 leading-relaxed font-medium bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-850 italic">
              *Note: A lump-sum investment generates higher returns because the entire amount compounds for the full duration, but it requires upfront capital and carries timing risk.
            </div>
          </div>

          {/* INTERNAL CONNECTIVITY CARDS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">Related Wealth Planners</h3>
            <div className="space-y-2">
              {[
                { name: 'Compound Interest Calculator', path: '/calculators/compound-interest-calculator' },
                { name: 'Income Tax Calculator', path: '/calculators/income-tax-calculator' },
                { name: 'EMI Calculator', path: '/calculators/emi-calculator' },
                { name: 'Plot Area Calculator', path: '/architecture/plot-area-calculator' },
                { name: 'BOQ Estimation Tool', path: '/civil/advanced-boq-calculator-india' }
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.path}
                  className="block p-3 text-xs font-bold text-zinc-650 dark:text-zinc-400 border border-zinc-150 dark:border-zinc-850 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/60 hover:bg-indigo-500/5 hover:border-indigo-500/20 hover:text-indigo-650 transition duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
