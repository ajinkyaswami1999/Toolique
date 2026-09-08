import { useState, useMemo } from 'react';
import { Zap } from 'lucide-react';

export default function KeynesianMultiplierCalculator() {
  const [mpc, setMpc] = useState<number>(0.8);
  const [deltaG, setDeltaG] = useState<number>(50);

  const calc = useMemo(() => {
    const mps = 1 - mpc;
    const multiplier = mps > 0 ? 1 / mps : 0;
    const deltaY = multiplier * deltaG;
    return { mps, multiplier, deltaY };
  }, [mpc, deltaG]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300">Macroeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <Zap className="w-5 h-5 text-violet-600" />
          Keynesian Spending Multiplier (k = 1 / (1 - MPC)) Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate aggregate economic impact of fiscal stimulus injections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Marginal Propensity to Consume (MPC: 0 to 1)</label>
            <input type="number" min="0" max="1" step="0.05" value={mpc} onChange={(e) => setMpc(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Government Spending Injection (ΔG)</label>
            <input type="number" value={deltaG} onChange={(e) => setDeltaG(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-violet-900 to-purple-950 rounded-2xl p-6 text-white shadow-lg">
            <span className="text-xs uppercase font-semibold text-violet-300">Fiscal Multiplier (k)</span>
            <div className="text-5xl font-black font-mono my-3">{calc.multiplier.toFixed(2)}x</div>
            <p className="text-xs text-violet-100 border-t border-white/10 pt-3">
              Total National GDP Expansion (ΔY): +{calc.deltaY.toLocaleString()} Billion (MPS = {calc.mps.toFixed(2)})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
