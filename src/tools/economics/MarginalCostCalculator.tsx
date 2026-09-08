import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';

export default function MarginalCostCalculator() {
  const [tc1, setTc1] = useState<number>(10000);
  const [tc2, setTc2] = useState<number>(13500);
  const [q1, setQ1] = useState<number>(100);
  const [q2, setQ2] = useState<number>(150);
  const [fixedCost, setFixedCost] = useState<number>(4000);

  const calc = useMemo(() => {
    const deltaTC = tc2 - tc1;
    const deltaQ = q2 - q1;
    const mc = deltaQ !== 0 ? deltaTC / deltaQ : 0;
    const atc = q2 > 0 ? tc2 / q2 : 0;
    const afc = q2 > 0 ? fixedCost / q2 : 0;
    const avc = atc - afc;

    return { deltaTC, deltaQ, mc, atc, afc, avc };
  }, [tc1, tc2, q1, q2, fixedCost]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300">Microeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-rose-600" />
          Marginal Cost & Average Cost Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate incremental cost of producing one additional unit (MC = ΔTC / ΔQ).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Initial Total Cost (TC₁)</label>
              <input type="number" value={tc1} onChange={(e) => setTc1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">New Total Cost (TC₂)</label>
              <input type="number" value={tc2} onChange={(e) => setTc2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
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
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Total Fixed Cost (FC)</label>
            <input type="number" value={fixedCost} onChange={(e) => setFixedCost(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-rose-900 to-pink-950 rounded-2xl p-6 text-white shadow-lg">
            <span className="text-xs uppercase font-semibold text-rose-300">Marginal Cost (MC)</span>
            <div className="text-5xl font-black font-mono my-3">{calc.mc.toFixed(2)} <span className="text-sm font-normal text-rose-200">per unit</span></div>
            <p className="text-xs text-rose-100 border-t border-white/10 pt-3">ΔTC = {calc.deltaTC.toLocaleString()} across ΔQ = {calc.deltaQ.toLocaleString()} units.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
              <div className="text-xs text-zinc-500">Average Cost (ATC)</div>
              <div className="text-base font-bold font-mono text-zinc-900 dark:text-white mt-1">{calc.atc.toFixed(2)}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
              <div className="text-xs text-zinc-500">Avg Variable (AVC)</div>
              <div className="text-base font-bold font-mono text-zinc-900 dark:text-white mt-1">{calc.avc.toFixed(2)}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
              <div className="text-xs text-zinc-500">Avg Fixed (AFC)</div>
              <div className="text-base font-bold font-mono text-zinc-900 dark:text-white mt-1">{calc.afc.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
