import { useState, useEffect } from 'react';
import { Landmark, Copy, Check } from 'lucide-react';

type Frequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export default function FDCalculator() {
  const [principal, setPrincipal] = useState<number>(100000);
  const [rate, setRate] = useState<number>(7.1);
  const [tenure, setTenure] = useState<number>(5);
  const [tenureType, setTenureType] = useState<'years' | 'months' | 'days'>('years');
  const [frequency, setFrequency] = useState<Frequency>('quarterly');
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    invested: 0,
    interest: 0,
    maturityValue: 0,
  });

  useEffect(() => {
    const P = principal;
    const r = rate / 100;
    
    // Convert tenure to years
    let t = tenure;
    if (tenureType === 'months') {
      t = tenure / 12;
    } else if (tenureType === 'days') {
      t = tenure / 365;
    }

    // Determine compounding frequency
    let n = 4; // Quarterly default
    if (frequency === 'monthly') n = 12;
    else if (frequency === 'half-yearly') n = 2;
    else if (frequency === 'yearly') n = 1;

    // Formula: A = P * (1 + r/n)^(n*t)
    const maturityValue = P * Math.pow(1 + r / n, n * t);
    const interest = maturityValue - P;

    setResults({
      invested: Math.round(P),
      interest: Math.round(interest),
      maturityValue: Math.round(maturityValue),
    });
  }, [principal, rate, tenure, tenureType, frequency]);

  const copyReport = () => {
    const freqLabels: Record<Frequency, string> = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      'half-yearly': 'Half-Yearly',
      yearly: 'Yearly',
    };
    const text = `FD Calculation Report (Toolique)
----------------------------------------
Principal Amount : ₹${principal.toLocaleString('en-IN')}
Interest Rate    : ${rate}% p.a.
Tenure           : ${tenure} ${tenureType}
Compounding Freq : ${freqLabels[frequency]}
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

        {/* Principal */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Total Investment (Principal - ₹)
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
              className="w-32 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="1000"
            max="10000000"
            step="5000"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <span>₹1,000</span>
            <span>₹1 Crore</span>
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
              Tenure / Period
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
                <option value="days" className="dark:bg-slate-950">Days</option>
              </select>
            </div>
          </div>
          <input
            type="range"
            min="1"
            max={tenureType === 'years' ? 25 : tenureType === 'months' ? 120 : 365}
            step="1"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>

        {/* Compounding frequency */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Compounding Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium text-sm"
          >
            <option value="monthly" className="dark:bg-slate-950">Monthly compounding</option>
            <option value="quarterly" className="dark:bg-slate-950">Quarterly compounding (Standard)</option>
            <option value="half-yearly" className="dark:bg-slate-950">Half-Yearly compounding</option>
            <option value="yearly" className="dark:bg-slate-950">Yearly compounding</option>
          </select>
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Fixed Deposit Summary</span>
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
              <span className="text-slate-400 font-semibold">Principal Amount</span>
              <span className="font-bold">₹{results.invested.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Total Cumulative Interest</span>
              <span className="font-bold text-teal-400">+ ₹{results.interest.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-5 rounded-2xl mt-8 flex justify-between items-center shadow-lg shadow-teal-500/10">
          <div>
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Total Maturity Amount</span>
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

