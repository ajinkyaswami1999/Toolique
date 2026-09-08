import { useState, useMemo } from 'react';
import { DollarSign } from 'lucide-react';

export default function MarginalRevenueCalculator() {
  const [tr1, setTr1] = useState<number>(20000);
  const [tr2, setTr2] = useState<number>(25000);
  const [q1, setQ1] = useState<number>(100);
  const [q2, setQ2] = useState<number>(120);

  const calc = useMemo(() => {
    const deltaTR = tr2 - tr1;
    const deltaQ = q2 - q1;
    const mr = deltaQ !== 0 ? deltaTR / deltaQ : 0;
    const ar = q2 > 0 ? tr2 / q2 : 0;
    return { deltaTR, deltaQ, mr, ar };
  }, [tr1, tr2, q1, q2]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">Microeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Marginal Revenue & Average Revenue Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate additional revenue per additional unit sold (MR = ΔTR / ΔQ).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Initial Revenue (TR₁)</label>
              <input type="number" value={tr1} onChange={(e) => setTr1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">New Revenue (TR₂)</label>
              <input type="number" value={tr2} onChange={(e) => setTr2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Initial Output (Q₁)</label>
              <input type="number" value={q1} onChange={(e) => setQ1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">New Output (Q₂)</label>
              <input type="number" value={q2} onChange={(e) => setQ2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-6 text-white shadow-lg">
            <span className="text-xs uppercase font-semibold text-emerald-300">Marginal Revenue (MR)</span>
            <div className="text-5xl font-black font-mono my-3">{calc.mr.toFixed(2)} <span className="text-sm font-normal text-emerald-200">per unit</span></div>
            <p className="text-xs text-emerald-100 border-t border-white/10 pt-3">Average Revenue (Price) = {calc.ar.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
