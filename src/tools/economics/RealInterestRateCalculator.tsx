import { useState, useMemo } from 'react';
import { Percent } from 'lucide-react';

export default function RealInterestRateCalculator() {
  const [nominalRate, setNominalRate] = useState<number>(7.5);
  const [inflationRate, setInflationRate] = useState<number>(5.2);

  const calc = useMemo(() => {
    const approxReal = nominalRate - inflationRate;
    const exactReal = ((1 + nominalRate / 100) / (1 + inflationRate / 100) - 1) * 100;
    return { approxReal, exactReal };
  }, [nominalRate, inflationRate]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">Macroeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <Percent className="w-5 h-5 text-emerald-600" />
          Fisher Equation & Real Interest Rate Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate inflation-adjusted real yield on savings, bonds, and loans.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nominal Interest Rate (i %)</label>
            <input type="number" value={nominalRate} onChange={(e) => setNominalRate(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Expected Inflation Rate (π %)</label>
            <input type="number" value={inflationRate} onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-6 text-white shadow-lg">
            <span className="text-xs uppercase font-semibold text-emerald-300">Exact Real Interest Rate (Fisher Eq.)</span>
            <div className="text-5xl font-black font-mono my-3">{calc.exactReal >= 0 ? '+' : ''}{calc.exactReal.toFixed(2)}%</div>
            <p className="text-xs text-emerald-100 border-t border-white/10 pt-3">Approximate Real Rate (r ≈ i - π): {calc.approxReal >= 0 ? '+' : ''}{calc.approxReal.toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
