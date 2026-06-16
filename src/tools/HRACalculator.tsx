import { useState, useEffect } from 'react';
import { Landmark, Copy, Check } from 'lucide-react';

export default function HRACalculator() {
  const [basicSalary, setBasicSalary] = useState<number>(45000);
  const [da, setDa] = useState<number>(5000);
  const [hraReceived, setHraReceived] = useState<number>(20000);
  const [rentPaid, setRentPaid] = useState<number>(15000);
  const [isMetro, setIsMetro] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    exemptMonthly: 0,
    exemptAnnual: 0,
    taxableMonthly: 0,
    taxableAnnual: 0,
  });

  useEffect(() => {
    const salary = basicSalary + da;
    
    // Conditions for HRA exemption (Rule 2A)
    // 1. Actual HRA received
    const cond1 = hraReceived;
    
    // 2. Rent paid minus 10% of salary
    const cond2 = Math.max(0, rentPaid - 0.10 * salary);
    
    // 3. 50% of salary for metro, 40% for non-metro
    const cond3 = isMetro ? salary * 0.50 : salary * 0.40;

    const exemptMonthly = Math.min(cond1, cond2, cond3);
    const taxableMonthly = Math.max(0, hraReceived - exemptMonthly);

    setResults({
      exemptMonthly: Math.round(exemptMonthly),
      exemptAnnual: Math.round(exemptMonthly * 12),
      taxableMonthly: Math.round(taxableMonthly),
      taxableAnnual: Math.round(taxableMonthly * 12),
    });
  }, [basicSalary, da, hraReceived, rentPaid, isMetro]);

  const copyReport = () => {
    const text = `HRA Exemption Report (Toolique)
----------------------------------------
Monthly Basic Salary : ₹${basicSalary.toLocaleString('en-IN')}
Monthly DA           : ₹${da.toLocaleString('en-IN')}
HRA Received (mo)    : ₹${hraReceived.toLocaleString('en-IN')}
Rent Paid (mo)       : ₹${rentPaid.toLocaleString('en-IN')}
City Classification  : ${isMetro ? 'Metro City' : 'Non-Metro City'}
----------------------------------------
Exempt HRA (Monthly) : ₹${results.exemptMonthly.toLocaleString('en-IN')}
Exempt HRA (Annual)  : ₹${results.exemptAnnual.toLocaleString('en-IN')}
Taxable HRA (Monthly): ₹${results.taxableMonthly.toLocaleString('en-IN')}
Taxable HRA (Annual) : ₹${results.taxableAnnual.toLocaleString('en-IN')}
----------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Panel */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Income & Rent details</h3>

        {/* Basic Salary */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Monthly Basic Salary (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">₹</span>
            <input
              type="number"
              value={basicSalary}
              onChange={(e) => setBasicSalary(Math.max(0, Number(e.target.value)))}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
            />
          </div>
        </div>

        {/* DA */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Monthly Dearness Allowance (DA - ₹ - Optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">₹</span>
            <input
              type="number"
              value={da}
              onChange={(e) => setDa(Math.max(0, Number(e.target.value)))}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
            />
          </div>
        </div>

        {/* HRA Received */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Monthly HRA Received (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">₹</span>
            <input
              type="number"
              value={hraReceived}
              onChange={(e) => setHraReceived(Math.max(0, Number(e.target.value)))}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
            />
          </div>
        </div>

        {/* Rent Paid */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Monthly Rent Paid (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">₹</span>
            <input
              type="number"
              value={rentPaid}
              onChange={(e) => setRentPaid(Math.max(0, Number(e.target.value)))}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
            />
          </div>
        </div>

        {/* Metro Option */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Resides in Metro City?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsMetro(true)}
              className={`py-2.5 rounded-xl border font-bold text-xs transition ${
                isMetro
                  ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Metro (50% Exemption)
            </button>
            <button
              onClick={() => setIsMetro(false)}
              className={`py-2.5 rounded-xl border font-bold text-xs transition ${
                !isMetro
                  ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Non-Metro (40%)
            </button>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-normal italic">
            Metro cities include: New Delhi, Mumbai, Kolkata, Chennai. All other locations are Non-Metro.
          </p>
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">HRA Exemption Status</span>
              <h3 className="text-xl font-bold text-slate-200 mt-1">Tax Saving Split</h3>
            </div>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Exempt HRA (Tax-free - Monthly)</span>
              <div className="text-2xl font-black text-teal-400 mt-1">₹{results.exemptMonthly.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Taxable HRA (Added to Income)</span>
              <div className="text-2xl font-black text-rose-400 mt-1">₹{results.taxableMonthly.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Exempt HRA (Annual)</span>
              <span className="font-bold text-teal-400">₹{results.exemptAnnual.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Taxable HRA (Annual)</span>
              <span className="font-bold text-rose-400">₹{results.taxableAnnual.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-5 rounded-2xl mt-8 flex justify-between items-center shadow-lg shadow-teal-500/10">
          <div>
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Annual Tax Exempted HRA</span>
            <div className="text-3xl font-black text-white mt-0.5">₹{results.exemptAnnual.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <Landmark className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

