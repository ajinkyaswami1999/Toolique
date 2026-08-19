import { useState, useEffect } from 'react';
import { Clipboard, Check } from 'lucide-react';

export default function IncomeTaxCalculator() {
  const [salary, setSalary] = useState<number>(1000000); // 10 Lakhs
  const [otherIncome, setOtherIncome] = useState<number>(50000);
  const [ded80c, setDed80c] = useState<number>(150000); // max 1.5L in old regime
  const [ded80d, setDed80d] = useState<number>(250000 / 10); // max 25k in old
  const [hra, setHra] = useState<number>(50000);

  // Outputs
  const [oldTaxable, setOldTaxable] = useState(0);
  const [newTaxable, setNewTaxable] = useState(0);
  const [oldTax, setOldTax] = useState(0);
  const [newTax, setNewTax] = useState(0);
  const [copied, setCopied] = useState(false);

  // Calculation function
  const calculateTaxOld = (taxableIncome: number) => {
    if (taxableIncome <= 250000) return 0;
    
    let tax = 0;
    let temp = taxableIncome;

    // Slabs for Old Regime (General category < 60 years)
    // Up to 2.5L: Nil
    // 2.5L to 5L: 5%
    // 5L to 10L: 20%
    // Above 10L: 30%
    if (temp > 1000000) {
      tax += (temp - 1000000) * 0.30;
      temp = 1000000;
    }
    if (temp > 50000) {
      // wait, next slab is 5L to 10L (diff 5L)
      if (temp > 500000) {
        tax += (temp - 500000) * 0.20;
        temp = 500000;
      }
    }
    if (temp > 250000) {
      tax += (temp - 250000) * 0.05;
    }

    // Rebate u/s 87A: If taxable income <= 5 Lakhs, rebate up to 12,500 (fully offset tax)
    if (taxableIncome <= 500000) {
      tax = 0;
    }

    return tax;
  };

  const calculateTaxNew = (taxableIncome: number) => {
    // Slabs for New Regime (FY 2024-25 / AY 2025-26)
    // Up to 3L: Nil
    // 3L to 6L: 5%
    // 6L to 9L: 10%
    // 9L to 12L: 15%
    // 12L to 15L: 20%
    // Above 15L: 30%
    if (taxableIncome <= 300000) return 0;

    let tax = 0;
    let temp = taxableIncome;

    if (temp > 1500000) {
      tax += (temp - 1500000) * 0.30;
      temp = 1500000;
    }
    if (temp > 1200000) {
      tax += (temp - 1200000) * 0.20;
      temp = 1200000;
    }
    if (temp > 900000) {
      tax += (temp - 900000) * 0.15;
      temp = 900000;
    }
    if (temp > 600000) {
      tax += (temp - 600000) * 0.10;
      temp = 600000;
    }
    if (temp > 300000) {
      tax += (temp - 300000) * 0.05;
    }

    // Rebate u/s 87A (New Regime): If taxable income <= 7 Lakhs, rebate up to 25,000 (fully offset tax)
    if (taxableIncome <= 700000) {
      tax = 0;
    }

    return tax;
  };

  useEffect(() => {
    const grossIncome = salary + otherIncome;

    // 1. Old Regime
    // Standard Deduction: 50,000
    // Max 80C deduction limit: 1,500,000 max -> capped to 150,000
    const oldC = Math.min(ded80c, 150000);
    // Max 80D limit: 25,000
    const oldD = Math.min(ded80d, 25000);
    const oldTotalDeductions = 50000 + oldC + oldD + hra;
    const oldTaxableVal = Math.max(grossIncome - oldTotalDeductions, 0);
    const oldBaseTax = calculateTaxOld(oldTaxableVal);
    // Add Health & Education Cess @ 4%
    const oldFinalTax = Math.round(oldBaseTax * 1.04);

    // 2. New Regime
    // Standard Deduction: 50,000 (other deductions like 80C, 80D, HRA are NOT allowed)
    const newTaxableVal = Math.max(grossIncome - 50000, 0);
    const newBaseTax = calculateTaxNew(newTaxableVal);
    const newFinalTax = Math.round(newBaseTax * 1.04);

    setOldTaxable(oldTaxableVal);
    setNewTaxable(newTaxableVal);
    setOldTax(oldFinalTax);
    setNewTax(newFinalTax);
  }, [salary, otherIncome, ded80c, ded80d, hra]);

  const handleCopy = () => {
    let text = `Indian Income Tax Estimate (FY 2024-25)\n`;
    text += `Old Regime Tax: ₹${oldTax.toLocaleString('en-IN')}\n`;
    text += `New Regime Tax: ₹${newTax.toLocaleString('en-IN')}\n`;
    text += `Preferred Regime: ${oldTax < newTax ? 'Old Regime' : 'New Regime'} (Saves ₹${Math.abs(oldTax - newTax).toLocaleString('en-IN')})\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="saas-card p-5 space-y-4 text-left">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">
              Income Details & Deductions
            </h3>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Gross Annual Salary (₹)</label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Other Sources Income (e.g. Interest, Rent)</label>
                <input
                  type="number"
                  value={otherIncome}
                  onChange={(e) => setOtherIncome(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="border-t border-zinc-200/20 pt-3.5 space-y-3">
                <h4 className="text-[10.5px] font-black uppercase text-zinc-450 tracking-wider">
                  Old Regime Deductions
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-black uppercase text-zinc-400">Section 80C (Max 1.5L)</label>
                    <input
                      type="number"
                      value={ded80c}
                      onChange={(e) => setDed80c(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-black uppercase text-zinc-400">Section 80D (Max 25k)</label>
                    <input
                      type="number"
                      value={ded80d}
                      onChange={(e) => setDed80d(Number(e.target.value))}
                      className="saas-input text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-zinc-400">HRA / Other Exemptions (₹)</label>
                  <input
                    type="number"
                    value={hra}
                    onChange={(e) => setHra(Number(e.target.value))}
                    className="saas-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Comparison */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-6 space-y-5 text-left font-semibold">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                Regime Comparison (FY 2024-25)
              </h3>
              <button
                type="button"
                onClick={handleCopy}
                className="saas-button-secondary py-1 px-3 text-[10px] inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Old Regime Card */}
              <div className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-2">
                <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Old Tax Regime</div>
                <div className="text-xs text-zinc-450 dark:text-zinc-500">Taxable Income: ₹{oldTaxable.toLocaleString('en-IN')}</div>
                <div className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
                  ₹{oldTax.toLocaleString('en-IN')}
                </div>
                <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 block">Includes 4% Health & Education Cess</span>
              </div>

              {/* New Regime Card */}
              <div className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-950/20 space-y-2 relative overflow-hidden">
                <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">New Tax Regime</div>
                <div className="text-xs text-zinc-450 dark:text-zinc-500">Taxable Income: ₹{newTaxable.toLocaleString('en-IN')}</div>
                <div className="text-2xl font-black text-indigo-650 dark:text-indigo-400 mt-2">
                  ₹{newTax.toLocaleString('en-IN')}
                </div>
                <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 block">Includes 4% Health & Education Cess</span>
              </div>
            </div>

            {/* Recommendation Alert */}
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-800 dark:text-emerald-400 font-semibold flex items-center justify-between">
              <div>
                💡 Recommended Regime: <strong className="uppercase">{oldTax < newTax ? 'Old Regime' : 'New Regime'}</strong>
              </div>
              <div>
                Saves ₹{Math.abs(oldTax - newTax).toLocaleString('en-IN')}
              </div>
            </div>

            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold leading-relaxed border-t border-zinc-200/20 pt-3">
              📌 <strong>Note:</strong> Standard Deduction of ₹50,000 is automatically applied to both regimes. Section 87A rebate offers complete tax relief for taxable incomes up to ₹5L in the Old Regime and ₹7L in the New Regime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
