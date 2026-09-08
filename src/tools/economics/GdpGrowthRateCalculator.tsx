import { useState, useMemo } from 'react';
import { Globe } from 'lucide-react';

export default function GdpGrowthRateCalculator() {
  const [gdp1, setGdp1] = useState<number>(3100);
  const [gdp2, setGdp2] = useState<number>(3350);

  const calc = useMemo(() => {
    const growth = gdp1 > 0 ? ((gdp2 - gdp1) / gdp1) * 100 : 0;
    let cycle = '';
    if (growth > 3) cycle = 'Strong Expansion';
    else if (growth > 0) cycle = 'Moderate Growth';
    else if (growth === 0) cycle = 'Stagnation';
    else cycle = 'Economic Contraction';

    return { growth, cycle, delta: gdp2 - gdp1 };
  }, [gdp1, gdp2]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">Macroeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-600" />
          GDP Growth Rate Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate period-over-period national economic expansion and contraction rates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Previous Period GDP (Billions)</label>
            <input type="number" value={gdp1} onChange={(e) => setGdp1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Current Period GDP (Billions)</label>
            <input type="number" value={gdp2} onChange={(e) => setGdp2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-semibold text-emerald-300">GDP Growth Rate</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/20">{calc.cycle}</span>
            </div>
            <div className="text-5xl font-black font-mono my-3">{calc.growth >= 0 ? '+' : ''}{calc.growth.toFixed(2)}%</div>
            <p className="text-xs text-emerald-100 border-t border-white/10 pt-3">Net Expansion: {calc.delta >= 0 ? '+' : ''}{calc.delta.toLocaleString()} Billion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
