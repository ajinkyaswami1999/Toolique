import { useState, useEffect } from 'react';
import { Wallet, Copy, Check, Info } from 'lucide-react';

export default function InHandSalaryCalculator() {
  const [ctc, setCtc] = useState<number>(1200000); // 12 LPA default
  const [variablePay, setVariablePay] = useState<number>(100000);
  const [pfType, setPfType] = useState<'standard' | 'actual' | 'none'>('standard');
  const [taxRegime, setTaxRegime] = useState<'new' | 'old'>('new');
  const [deductions80c, setDeductions80c] = useState<number>(150000); // 1.5L max under 80C
  const [otherDeductions, setOtherDeductions] = useState<number>(50000); // HRA, 80D, etc.
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    monthlyGross: 0,
    annualGross: 0,
    pfAnnual: 0,
    pfMonthly: 0,
    ptAnnual: 0,
    ptMonthly: 0,
    taxAnnual: 0,
    taxMonthly: 0,
    takeHomeAnnual: 0,
    takeHomeMonthly: 0,
  });

  const calculateTax = (taxableIncome: number, regime: 'new' | 'old') => {
    if (taxableIncome <= 0) return 0;
    let tax = 0;

    if (regime === 'new') {
      // New Regime Slabs (FY 2024-25 / FY 2025-26 guidelines)
      // Standard deduction is 75,000 (deducted before this function is called)
      // Slabs:
      // Up to 3,00,000 : Nil
      // 3L to 7L : 5%
      // 7L to 10L : 10%
      // 10L to 12L : 15%
      // 12L to 15L : 20%
      // Above 15L : 30%
      
      // Rebate under 87A: Taxable income up to 7,00,000 gets full rebate (tax = 0)
      if (taxableIncome <= 700000) {
        return 0;
      }

      if (taxableIncome > 1500000) {
        tax += (taxableIncome - 1500000) * 0.30;
        tax += 300000 * 0.20; // 12L to 15L
        tax += 200000 * 0.15; // 10L to 12L
        tax += 300000 * 0.10; // 7L to 10L
        tax += 400000 * 0.05; // 3L to 7L
      } else if (taxableIncome > 1200000) {
        tax += (taxableIncome - 1200000) * 0.20;
        tax += 200000 * 0.15;
        tax += 300000 * 0.10;
        tax += 400000 * 0.05;
      } else if (taxableIncome > 1000000) {
        tax += (taxableIncome - 1000000) * 0.15;
        tax += 300000 * 0.10;
        tax += 400000 * 0.05;
      } else if (taxableIncome > 700000) {
        tax += (taxableIncome - 700000) * 0.10;
        tax += 400000 * 0.05;
      } else if (taxableIncome > 300000) {
        tax += (taxableIncome - 300000) * 0.05;
      }
    } else {
      // Old Regime Slabs (FY 2024-25)
      // Standard deduction is 50,000
      // Slabs:
      // Up to 2,50,000 : Nil
      // 2.5L to 5L : 5%
      // 5L to 10L : 20%
      // Above 10L : 30%
      
      // Rebate under 87A: Taxable income up to 5,00,000 gets full rebate
      if (taxableIncome <= 500000) {
        return 0;
      }

      if (taxableIncome > 1000000) {
        tax += (taxableIncome - 1000000) * 0.30;
        tax += 500000 * 0.20; // 5L to 10L
        tax += 250000 * 0.05; // 2.5L to 5L
      } else if (taxableIncome > 500000) {
        tax += (taxableIncome - 500000) * 0.20;
        tax += 250000 * 0.05;
      } else if (taxableIncome > 250000) {
        tax += (taxableIncome - 250000) * 0.05;
      }
    }

    // Add 4% Health & Education Cess
    return tax * 1.04;
  };

  useEffect(() => {
    // 1. Annual Gross Salary (CTC minus variable component)
    const annualGross = ctc - variablePay;
    const monthlyGross = annualGross / 12;

    // Basic is typically 50% of CTC
    const basicAnnual = ctc * 0.5;
    const basicMonthly = basicAnnual / 12;

    // PF Calculations
    let pfMonthly = 0;
    if (pfType === 'standard') {
      // 12% of basic, capped at ₹15,000 basic limit (12% of 15,000 = ₹1,800/mo)
      pfMonthly = Math.min(1800, basicMonthly * 0.12);
    } else if (pfType === 'actual') {
      // 12% of actual basic pay
      pfMonthly = basicMonthly * 0.12;
    }
    const pfAnnual = pfMonthly * 12;

    // Professional Tax (Standard is ₹200/mo, ₹2400/yr)
    const ptMonthly = annualGross > 150000 ? 200 : 0;
    const ptAnnual = ptMonthly * 12;

    // Tax calculation
    let standardDeduction = taxRegime === 'new' ? 75000 : 50000;
    let netTaxableIncome = annualGross - standardDeduction;

    if (taxRegime === 'old') {
      // Deduct 80C (max 1.5L), employee PF (is covered under 80C), other deductions
      const total80c = Math.min(150000, deductions80c + pfAnnual);
      netTaxableIncome = netTaxableIncome - total80c - otherDeductions;
    }

    // Make sure taxable income is positive
    netTaxableIncome = Math.max(0, netTaxableIncome);

    const taxAnnual = calculateTax(netTaxableIncome, taxRegime);
    const taxMonthly = taxAnnual / 12;

    // Take-home salary calculation (Monthly Gross minus PF, PT, Tax)
    const takeHomeMonthly = monthlyGross - pfMonthly - ptMonthly - taxMonthly;
    const takeHomeAnnual = takeHomeMonthly * 12;

    setResults({
      monthlyGross: Math.round(monthlyGross),
      annualGross,
      pfAnnual: Math.round(pfAnnual),
      pfMonthly: Math.round(pfMonthly),
      ptAnnual: Math.round(ptAnnual),
      ptMonthly: Math.round(ptMonthly),
      taxAnnual: Math.round(taxAnnual),
      taxMonthly: Math.round(taxMonthly),
      takeHomeAnnual: Math.round(takeHomeAnnual),
      takeHomeMonthly: Math.round(takeHomeMonthly),
    });
  }, [ctc, variablePay, pfType, taxRegime, deductions80c, otherDeductions]);

  const copyReport = () => {
    const text = `In-Hand Salary Report (Toolique)
----------------------------------------
Annual CTC        : ₹${ctc.toLocaleString('en-IN')}
Variable Pay      : ₹${variablePay.toLocaleString('en-IN')}
Tax Regime        : ${taxRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}
----------------------------------------
Monthly Gross     : ₹${results.monthlyGross.toLocaleString('en-IN')}
PF Deduction (mo) : ₹${results.pfMonthly.toLocaleString('en-IN')}
PT Deduction (mo) : ₹${results.ptMonthly.toLocaleString('en-IN')}
Income Tax (mo)   : ₹${results.taxMonthly.toLocaleString('en-IN')}
----------------------------------------
EST. TAKE HOME    : ₹${results.takeHomeMonthly.toLocaleString('en-IN')}/month
----------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Column */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Salary details</h3>

        {/* Annual CTC */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Annual Gross CTC (₹)
          </label>
          <input
            type="number"
            value={ctc}
            onChange={(e) => setCtc(Math.max(0, Number(e.target.value)))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
            placeholder="e.g. 1200000"
          />
        </div>

        {/* Variable pay */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Annual Variable Pay / Bonus (₹)
          </label>
          <input
            type="number"
            value={variablePay}
            onChange={(e) => setVariablePay(Math.max(0, Number(e.target.value)))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
            placeholder="e.g. 100000"
          />
        </div>

        {/* EPF contribution */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Provident Fund (EPF) Contribution
          </label>
          <select
            value={pfType}
            onChange={(e) => setPfType(e.target.value as any)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium text-sm"
          >
            <option value="standard" className="dark:bg-slate-950">Standard (Capped @ 1,800/mo)</option>
            <option value="actual" className="dark:bg-slate-950">Actual (12% of actual basic)</option>
            <option value="none" className="dark:bg-slate-950">No PF deduction</option>
          </select>
        </div>

        {/* Tax Regime Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Tax Regime
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTaxRegime('new')}
              className={`py-2.5 rounded-xl border font-bold text-xs transition ${
                taxRegime === 'new'
                  ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              New Regime (FY 24-25)
            </button>
            <button
              onClick={() => setTaxRegime('old')}
              className={`py-2.5 rounded-xl border font-bold text-xs transition ${
                taxRegime === 'old'
                  ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Old Regime
            </button>
          </div>
        </div>

        {/* Old Regime deductions */}
        {taxRegime === 'old' && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50/20">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Old Regime Deductions</h4>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Section 80C (PPF, ELSS, Insurance - max 1.5L)
              </label>
              <input
                type="number"
                value={deductions80c}
                onChange={(e) => setDeductions80c(Math.max(0, Math.min(150000, Number(e.target.value))))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Other Exemptions (HRA, 80D medical, etc.)
              </label>
              <input
                type="number"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-800 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Column */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl">
        <div className="space-y-5">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Monthly Salary Structure</span>
              <h3 className="text-xl font-bold text-slate-200 mt-1">Take-Home Split</h3>
            </div>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Monthly Gross (Base)</span>
              <span className="font-bold">₹{results.monthlyGross.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Employee PF Deduction</span>
              <span className="font-bold text-rose-450">- ₹{results.pfMonthly.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Professional Tax (PT)</span>
              <span className="font-bold text-rose-450">- ₹{results.ptMonthly.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Estimated Income Tax (TDS)</span>
              <span className="font-bold text-rose-450">- ₹{results.taxMonthly.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/40 text-xs text-slate-400 space-y-1">
            <div className="font-bold text-white uppercase tracking-wide flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-teal-400" />
              Tax Regime Calculations
            </div>
            <div>regime chosen: <span className="font-semibold text-slate-200">{taxRegime.toUpperCase()}</span></div>
            <div>Standard Deduction applied: <span className="font-semibold text-slate-200">₹{taxRegime === 'new' ? '75,000' : '50,000'}</span></div>
            <div>Annual Income Tax (with 4% cess): <span className="font-semibold text-slate-200">₹{results.taxAnnual.toLocaleString('en-IN')}</span></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-5 rounded-2xl mt-8 flex justify-between items-center shadow-lg shadow-teal-500/10">
          <div>
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Estimated Monthly Take-Home (In-Hand)</span>
            <div className="text-3xl font-black text-white mt-0.5">₹{results.takeHomeMonthly.toLocaleString('en-IN')}/mo</div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

