import { useState, useEffect } from 'react';
import { TrendingUp, Copy, Check } from 'lucide-react';

export default function CAGRCalculator() {
  const [initialValue, setInitialValue] = useState<number>(10000);
  const [finalValue, setFinalValue] = useState<number>(25000);
  const [years, setYears] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    cagr: 0,
    absoluteReturn: 0,
    multiplier: 0,
  });

  useEffect(() => {
    if (initialValue <= 0 || finalValue <= 0 || years <= 0) return;

    // CAGR Formula: (Final / Initial) ^ (1 / Years) - 1
    const cagr = Math.pow(finalValue / initialValue, 1 / years) - 1;
    const absoluteReturn = ((finalValue - initialValue) / initialValue) * 100;
    const multiplier = finalValue / initialValue;

    setResults({
      cagr: Number((cagr * 100).toFixed(2)),
      absoluteReturn: Number(absoluteReturn.toFixed(2)),
      multiplier: Number(multiplier.toFixed(2)),
    });
  }, [initialValue, finalValue, years]);

  const copyReport = () => {
    const text = `CAGR Calculation Report (Toolique)
----------------------------------------
Initial Value : ₹${initialValue.toLocaleString('en-IN')}
Final Value   : ₹${finalValue.toLocaleString('en-IN')}
Period        : ${years} Years
----------------------------------------
Absolute Return: ${results.absoluteReturn}%
Growth Factor : ${results.multiplier}x
CAGR          : ${results.cagr}% p.a.
----------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Panel */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Investment Values</h3>

        {/* Initial Value */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Initial Value (Beginning Principal - ₹)
          </label>
          <input
            type="number"
            value={initialValue}
            onChange={(e) => setInitialValue(Math.max(1, Number(e.target.value)))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
          />
        </div>

        {/* Final Value */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Final Value (Ending Balance - ₹)
          </label>
          <input
            type="number"
            value={finalValue}
            onChange={(e) => setFinalValue(Math.max(1, Number(e.target.value)))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
          />
        </div>

        {/* Duration */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Duration / Years
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Math.max(0.1, Number(e.target.value)))}
              className="w-20 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="0.5"
            max="20"
            step="0.5"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <span>6 Months</span>
            <span>20 Years</span>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Growth Report Summary</span>
              <h3 className="text-xl font-bold text-slate-200 mt-1">Compound Growth</h3>
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
              <span className="text-xs text-slate-400 font-medium">Absolute Return</span>
              <div className="text-xl font-bold text-white mt-1">{results.absoluteReturn}%</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Growth Factor</span>
              <div className="text-xl font-bold text-teal-400 mt-1">{results.multiplier}x</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">CAGR Rate</span>
              <div className="text-xl font-bold text-indigo-400 mt-1">{results.cagr}%</div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Net Wealth Gained</span>
              <span className="font-bold">₹{Math.max(0, finalValue - initialValue).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Compounding Tenure</span>
              <span className="font-bold">{years} Years</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-5 rounded-2xl mt-8 flex justify-between items-center shadow-lg shadow-teal-500/10">
          <div>
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Compound Annual Growth Rate (CAGR)</span>
            <div className="text-3xl font-black text-white mt-0.5">{results.cagr}%</div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

