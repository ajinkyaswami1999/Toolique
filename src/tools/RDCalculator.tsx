import { useState, useEffect } from 'react';
import { Landmark, Copy, Check } from 'lucide-react';

export default function RDCalculator() {
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(5000);
  const [rate, setRate] = useState<number>(6.8);
  const [tenure, setTenure] = useState<number>(5);
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    invested: 0,
    interest: 0,
    maturityValue: 0,
  });

  useEffect(() => {
    const P = monthlyDeposit;
    const r = rate;
    const totalMonths = tenureType === 'years' ? tenure * 12 : tenure;
    
    // In India, RD compounding is quarterly
    // Formula: M = P * [ (1 + i)^n - 1 ] / [ 1 - (1 + i)^(-1/3) ]
    // where i = quarterly rate = r / 400
    // and n = total quarters = totalMonths / 3
    const n = totalMonths / 3;
    const i = r / 400;

    let maturityValue = 0;
    if (i > 0) {
      maturityValue = P * ((Math.pow(1 + i, n) - 1) / (1 - Math.pow(1 + i, -1 / 3)));
    } else {
      maturityValue = P * totalMonths;
    }

    const invested = P * totalMonths;
    const interest = maturityValue - invested;

    setResults({
      invested: Math.round(invested),
      interest: Math.round(interest),
      maturityValue: Math.round(maturityValue),
    });
  }, [monthlyDeposit, rate, tenure, tenureType]);

  const copyReport = () => {
    const text = `RD Calculation Report (Toolique)
----------------------------------------
Monthly Deposit  : ₹${monthlyDeposit.toLocaleString('en-IN')}/mo
Interest Rate    : ${rate}% p.a. (Quarterly Compounding)
Tenure           : ${tenure} ${tenureType}
----------------------------------------
Invested Amount  : ₹${results.invested.toLocaleString('en-IN')}
Interest Earned  : ₹${results.interest.toLocaleString('en-IN')}
Maturity Value   : ₹${results.maturityValue.toLocaleString('en-IN')}
----------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Panel */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Deposit Settings</h3>

        {/* Monthly Deposit */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Monthly Deposit (₹)
            </label>
            <input
              type="number"
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(Math.max(100, Number(e.target.value)))}
              className="w-28 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="500"
            max="100000"
            step="500"
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <span>₹500</span>
            <span>₹1,00,000</span>
          </div>
        </div>

        {/* Rate of Interest */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Rate of Interest (% p.a.)
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Math.max(1, Math.min(25, Number(e.target.value))))}
              className="w-20 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="2"
            max="15"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <span>2%</span>
            <span>15%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Tenure
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={tenure}
                onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
                className="w-16 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
              />
              <select
                value={tenureType}
                onChange={(e) => setTenureType(e.target.value as any)}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-semibold text-slate-600 dark:text-slate-400 focus:outline-none"
              >
                <option value="years" className="dark:bg-slate-950">Years</option>
                <option value="months" className="dark:bg-slate-950">Months</option>
              </select>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max={tenureType === 'years' ? 10 : 120}
            step="1"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Recurring Deposit Summary</span>
              <h3 className="text-xl font-bold text-slate-200 mt-1">Maturity Returns</h3>
            </div>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Invested Principal</span>
              <div className="text-xl font-bold text-white mt-1">₹{results.invested.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Est. Interest Earned</span>
              <div className="text-xl font-bold text-teal-400 mt-1">₹{results.interest.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Maturity Value</span>
              <div className="text-xl font-bold text-indigo-400 mt-1">₹{results.maturityValue.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Total Invested</span>
              <span className="font-bold">₹{results.invested.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Total Accumulated Interest</span>
              <span className="font-bold text-teal-400">+ ₹{results.interest.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-5 rounded-2xl mt-8 flex justify-between items-center shadow-lg shadow-teal-500/10">
          <div>
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Total Maturity Value</span>
            <div className="text-3xl font-black text-white mt-0.5">₹{results.maturityValue.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <Landmark className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

