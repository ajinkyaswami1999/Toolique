import { useState, useMemo } from 'react';
import { Flame } from 'lucide-react';

export default function InflationRateCalculator() {
  const [cpi1, setCpi1] = useState<number>(140);
  const [cpi2, setCpi2] = useState<number>(148.5);

  const calc = useMemo(() => {
    const inflation = cpi1 > 0 ? ((cpi2 - cpi1) / cpi1) * 100 : 0;
    return { inflation, deltaCPI: cpi2 - cpi1 };
  }, [cpi1, cpi2]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300">Macroeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-600" />
          Inflation Rate Calculator (CPI Based)
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate headline inflation rate from Consumer Price Index changes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Previous CPI Index (CPI₁)</label>
            <input type="number" value={cpi1} onChange={(e) => setCpi1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Current CPI Index (CPI₂)</label>
            <input type="number" value={cpi2} onChange={(e) => setCpi2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-rose-900 to-red-950 rounded-2xl p-6 text-white shadow-lg">
            <span className="text-xs uppercase font-semibold text-rose-300">Headline Inflation Rate</span>
            <div className="text-5xl font-black font-mono my-3">{calc.inflation >= 0 ? '+' : ''}{calc.inflation.toFixed(2)}%</div>
            <p className="text-xs text-rose-100 border-t border-white/10 pt-3">CPI Change: +{calc.deltaCPI.toFixed(2)} points</p>
          </div>
        </div>
      </div>
    </div>
  );
}
