import { useState, useEffect } from 'react';
import { Landmark, Copy, Check, AlertTriangle } from 'lucide-react';

export default function GratuityCalculator() {
  const [basicSalary, setBasicSalary] = useState<number>(50000);
  const [yearsOfService, setYearsOfService] = useState<number>(7);
  const [isCovered, setIsCovered] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const [gratuityAmount, setGratuityAmount] = useState<number>(0);

  useEffect(() => {
    // Covered under Gratuity Act: (15 * Basic + DA * Years) / 26
    // Not Covered: (15 * Basic + DA * Years) / 30 (often 15 days of salary for every year, based on 30 working days)
    const factor = isCovered ? 26 : 30;
    const amount = (15 * basicSalary * yearsOfService) / factor;
    setGratuityAmount(Math.round(amount));
  }, [basicSalary, yearsOfService, isCovered]);

  const copyReport = () => {
    const text = `Gratuity Calculation Report (Toolique)
----------------------------------------
Last Drawn Salary (Basic+DA): ₹${basicSalary.toLocaleString('en-IN')}/mo
Tenure of Service           : ${yearsOfService} Years
Act Coverage                : ${isCovered ? 'Covered under Gratuity Act' : 'Not Covered under Gratuity Act'}
----------------------------------------
EST. GRATUITY PAYOUT        : ₹${gratuityAmount.toLocaleString('en-IN')}
----------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Panel */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Gratuity Parameters</h3>

        {/* Basic Salary */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Last Drawn Salary (Basic + DA - ₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">₹</span>
            <input
              type="number"
              value={basicSalary}
              onChange={(e) => setBasicSalary(Math.max(0, Number(e.target.value)))}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
              placeholder="Enter monthly basic salary + DA"
            />
          </div>
        </div>

        {/* Years of Service */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Years of Continuous Service
            </label>
            <input
              type="number"
              value={yearsOfService}
              onChange={(e) => setYearsOfService(Math.max(1, Number(e.target.value)))}
              className="w-16 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="1"
            max="40"
            step="1"
            value={yearsOfService}
            onChange={(e) => setYearsOfService(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>

        {/* Covered Option */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Employer Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsCovered(true)}
              className={`py-2.5 rounded-xl border font-bold text-xs transition ${
                isCovered
                  ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Covered under Act
            </button>
            <button
              onClick={() => setIsCovered(false)}
              className={`py-2.5 rounded-xl border font-bold text-xs transition ${
                !isCovered
                  ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Not Covered
            </button>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
            - **Covered (15/26)**: Applicable to firms with 10+ employees. Uses 26 working days calculation.
            <br />
            - **Not Covered (15/30)**: Applicable to other firms. Uses 30 working days calendar calculation.
          </p>
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Gratuity Payout Estimate</span>
              <h3 className="text-xl font-bold text-slate-200 mt-1">Gratuity Balance</h3>
            </div>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
          </div>

          {yearsOfService < 5 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-start gap-2.5 text-xs font-semibold leading-normal">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <div className="font-bold text-amber-500 uppercase tracking-wide">Eligibility Warning</div>
                <div className="mt-0.5">
                  Under the Payment of Gratuity Act, a minimum of 5 years of continuous service is mandatory for gratuity entitlement (except in cases of death or disablement). Since the tenure is {yearsOfService} year(s), you may not be legally eligible for this payout.
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Last Drawn Salary (Basic+DA)</span>
              <span className="font-bold">₹{basicSalary.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Service Tenure</span>
              <span className="font-bold">{yearsOfService} Years</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Formula Factor</span>
              <span className="font-bold">{isCovered ? '15 / 26 days' : '15 / 30 days'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-5 rounded-2xl mt-8 flex justify-between items-center shadow-lg shadow-teal-500/10">
          <div>
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Estimated Gratuity Payout</span>
            <div className="text-3xl font-black text-white mt-0.5">₹{gratuityAmount.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <Landmark className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

