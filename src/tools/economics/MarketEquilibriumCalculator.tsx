import { useState, useMemo } from 'react';
import { ArrowLeftRight } from 'lucide-react';

export default function MarketEquilibriumCalculator() {
  const [demandIntercept, setDemandIntercept] = useState<number>(500);
  const [demandSlope, setDemandSlope] = useState<number>(4);
  const [supplyIntercept, setSupplyIntercept] = useState<number>(50);
  const [supplySlope, setSupplySlope] = useState<number>(2);

  const calc = useMemo(() => {
    const denom = demandSlope + supplySlope;
    if (denom === 0) return { eqP: 0, eqQ: 0, cs: 0, ps: 0, ts: 0 };

    const eqP = (demandIntercept - supplyIntercept) / denom;
    const eqQ = demandIntercept - (demandSlope * eqP);
    const pMaxDemand = demandSlope > 0 ? demandIntercept / demandSlope : 0;
    const pMinSupply = supplySlope > 0 ? -supplyIntercept / supplySlope : 0;
    const cs = Math.max(0, 0.5 * (pMaxDemand - eqP) * eqQ);
    const ps = Math.max(0, 0.5 * (eqP - Math.max(0, pMinSupply)) * eqQ);
    const ts = cs + ps;

    return { eqP, eqQ, cs, ps, ts };
  }, [demandIntercept, demandSlope, supplyIntercept, supplySlope]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">Microeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
          Supply & Demand Market Equilibrium Solver
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Solve simultaneous market clearing price, equilibrium quantity, and social surplus.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">Demand: Qd = a - bP</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Intercept (a)</label>
                <input type="number" value={demandIntercept} onChange={(e) => setDemandIntercept(parseFloat(e.target.value) || 0)} className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Slope (b)</label>
                <input type="number" value={demandSlope} onChange={(e) => setDemandSlope(parseFloat(e.target.value) || 0)} className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-sm" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">Supply: Qs = c + dP</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Intercept (c)</label>
                <input type="number" value={supplyIntercept} onChange={(e) => setSupplyIntercept(parseFloat(e.target.value) || 0)} className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Slope (d)</label>
                <input type="number" value={supplySlope} onChange={(e) => setSupplySlope(parseFloat(e.target.value) || 0)} className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border rounded-lg text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-5 text-white">
              <span className="text-xs uppercase font-semibold text-emerald-300">Equilibrium Price (P*)</span>
              <div className="text-4xl font-black font-mono my-2">{calc.eqP.toFixed(2)}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-2xl p-5 text-white">
              <span className="text-xs uppercase font-semibold text-blue-300">Equilibrium Quantity (Q*)</span>
              <div className="text-4xl font-black font-mono my-2">{calc.eqQ.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
              <div className="text-xs text-zinc-500">Consumer Surplus</div>
              <div className="text-base font-bold font-mono text-zinc-900 dark:text-white mt-1">{calc.cs.toFixed(1)}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
              <div className="text-xs text-zinc-500">Producer Surplus</div>
              <div className="text-base font-bold font-mono text-zinc-900 dark:text-white mt-1">{calc.ps.toFixed(1)}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
              <div className="text-xs text-zinc-500">Total Social Surplus</div>
              <div className="text-base font-bold font-mono text-emerald-600 mt-1">{calc.ts.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
