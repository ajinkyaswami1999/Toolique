import { useState, useMemo } from 'react';
import { Factory } from 'lucide-react';

export default function ProductionFunctionCalculator() {
  const [l1, setL1] = useState<number>(5);
  const [l2, setL2] = useState<number>(6);
  const [q1, setQ1] = useState<number>(100);
  const [q2, setQ2] = useState<number>(125);

  const calc = useMemo(() => {
    const deltaL = l2 - l1;
    const deltaQ = q2 - q1;
    const mpl = deltaL !== 0 ? deltaQ / deltaL : 0;
    const apl = l2 > 0 ? q2 / l2 : 0;
    return { deltaL, deltaQ, mpl, apl };
  }, [l1, l2, q1, q2]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300">Microeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <Factory className="w-5 h-5 text-cyan-600" />
          Production Function & Marginal Product (MPL/APL) Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Analyze marginal product of labor and law of diminishing returns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Labor L₁</label>
              <input type="number" value={l1} onChange={(e) => setL1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Labor L₂</label>
              <input type="number" value={l2} onChange={(e) => setL2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Total Output Q₁</label>
              <input type="number" value={q1} onChange={(e) => setQ1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Total Output Q₂</label>
              <input type="number" value={q2} onChange={(e) => setQ2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-cyan-900 to-blue-950 rounded-2xl p-6 text-white shadow-lg">
            <span className="text-xs uppercase font-semibold text-cyan-300">Marginal Product of Labor (MPL)</span>
            <div className="text-5xl font-black font-mono my-3">{calc.mpl.toFixed(2)} <span className="text-sm font-normal text-cyan-200">units/worker</span></div>
            <p className="text-xs text-cyan-100 border-t border-white/10 pt-3">Average Product of Labor (APL) = {calc.apl.toFixed(2)} units/worker</p>
          </div>
        </div>
      </div>
    </div>
  );
}
