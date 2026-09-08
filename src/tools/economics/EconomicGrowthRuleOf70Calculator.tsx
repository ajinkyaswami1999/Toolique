import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

export default function EconomicGrowthRuleOf70Calculator() {
  const [growthRate, setGrowthRate] = useState<number>(7);
  const [initialValue, setInitialValue] = useState<number>(2500);

  const calc = useMemo(() => {
    const ruleOf70 = growthRate > 0 ? 70 / growthRate : 0;
    const exactDoubling = growthRate > 0 ? Math.log(2) / Math.log(1 + growthRate / 100) : 0;
    const valueIn10 = initialValue * Math.pow(1 + growthRate / 100, 10);
    const valueIn20 = initialValue * Math.pow(1 + growthRate / 100, 20);
    return { ruleOf70, exactDoubling, valueIn10, valueIn20 };
  }, [growthRate, initialValue]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">Macroeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Economic Growth & Rule of 70 Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate GDP doubling time and long-term compound growth projections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Annual Growth Rate (g %)</label>
            <input type="number" value={growthRate} onChange={(e) => setGrowthRate(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Current Baseline GDP / Income</label>
            <input type="number" value={initialValue} onChange={(e) => setInitialValue(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-6 text-white shadow-lg">
            <span className="text-xs uppercase font-semibold text-emerald-300">Doubling Time (Rule of 70)</span>
            <div className="text-5xl font-black font-mono my-3">{calc.ruleOf70.toFixed(1)} <span className="text-sm font-normal text-emerald-200">years</span></div>
            <p className="text-xs text-emerald-100 border-t border-white/10 pt-3">Exact Doubling Time: {calc.exactDoubling.toFixed(2)} years</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <div className="text-xs text-zinc-500">Projected in 10 Years</div>
              <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1">{Math.round(calc.valueIn10).toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <div className="text-xs text-zinc-500">Projected in 20 Years</div>
              <div className="text-lg font-bold font-mono text-emerald-600 mt-1">{Math.round(calc.valueIn20).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
