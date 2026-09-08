import { useState, useMemo } from 'react';
import { PiggyBank } from 'lucide-react';

export default function EconomicProfitCalculator() {
  const [revenue, setRevenue] = useState<number>(250000);
  const [explicitCosts, setExplicitCosts] = useState<number>(150000);
  const [implicitCosts, setImplicitCosts] = useState<number>(60000);

  const calc = useMemo(() => {
    const accountingProfit = revenue - explicitCosts;
    const economicProfit = revenue - explicitCosts - implicitCosts;
    return { accountingProfit, economicProfit };
  }, [revenue, explicitCosts, implicitCosts]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">Microeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-indigo-600" />
          Economic Profit vs Accounting Profit Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Account for opportunity costs of owner capital and labor.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Total Revenue (TR)</label>
            <input type="number" value={revenue} onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Explicit Costs (Direct Wages, Rent, Materials)</label>
            <input type="number" value={explicitCosts} onChange={(e) => setExplicitCosts(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Implicit Costs (Forgone Salary, Interest on Capital)</label>
            <input type="number" value={implicitCosts} onChange={(e) => setImplicitCosts(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-900 to-blue-950 rounded-2xl p-5 text-white">
              <span className="text-xs uppercase font-semibold text-indigo-300">Accounting Profit</span>
              <div className="text-3xl font-black font-mono my-2">{calc.accountingProfit.toLocaleString()}</div>
              <p className="text-xs text-indigo-200">TR - Explicit Costs</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-5 text-white">
              <span className="text-xs uppercase font-semibold text-emerald-300">Economic Profit</span>
              <div className="text-3xl font-black font-mono my-2">{calc.economicProfit.toLocaleString()}</div>
              <p className="text-xs text-emerald-200">TR - (Explicit + Implicit)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
