import { useState, useMemo } from 'react';
import { Target } from 'lucide-react';

export default function BreakEvenPointCalculator() {
  const [fixedCost, setFixedCost] = useState<number>(50000);
  const [price, setPrice] = useState<number>(100);
  const [variableCost, setVariableCost] = useState<number>(40);
  const [targetProfit, setTargetProfit] = useState<number>(20000);

  const calc = useMemo(() => {
    const cm = price - variableCost;
    const cmRatio = price > 0 ? (cm / price) * 100 : 0;
    const bepUnits = cm > 0 ? fixedCost / cm : 0;
    const bepRevenue = bepUnits * price;
    const targetUnits = cm > 0 ? (fixedCost + targetProfit) / cm : 0;
    const targetRevenue = targetUnits * price;
    return { cm, cmRatio, bepUnits, bepRevenue, targetUnits, targetRevenue };
  }, [fixedCost, price, variableCost, targetProfit]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300">Microeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-600" />
          Break-Even Point (BEP) & CVP Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate sales volume needed to cover costs and achieve target profit.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Total Fixed Costs (FC)</label>
            <input type="number" value={fixedCost} onChange={(e) => setFixedCost(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Unit Price (P)</label>
              <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Unit Variable Cost (VC)</label>
              <input type="number" value={variableCost} onChange={(e) => setVariableCost(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Target Profit (Optional)</label>
            <input type="number" value={targetProfit} onChange={(e) => setTargetProfit(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-violet-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg">
            <span className="text-xs uppercase font-semibold text-violet-300">Break-Even Units</span>
            <div className="text-5xl font-black font-mono my-3">{Math.ceil(calc.bepUnits).toLocaleString()} <span className="text-sm font-normal text-violet-200">units</span></div>
            <p className="text-xs text-violet-100 border-t border-white/10 pt-3">Break-Even Sales Revenue: {calc.bepRevenue.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <div className="text-xs text-zinc-500">Contribution Margin</div>
              <div className="text-lg font-bold font-mono text-zinc-900 dark:text-white mt-1">{calc.cm.toFixed(2)} ({calc.cmRatio.toFixed(1)}%)</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <div className="text-xs text-zinc-500">Units for Target Profit</div>
              <div className="text-lg font-bold font-mono text-emerald-600 mt-1">{Math.ceil(calc.targetUnits).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
