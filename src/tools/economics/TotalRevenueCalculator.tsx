import { useState, useMemo } from 'react';
import { DollarSign } from 'lucide-react';

export default function TotalRevenueCalculator() {
  const [price, setPrice] = useState<number>(75);
  const [quantity, setQuantity] = useState<number>(1200);

  const calc = useMemo(() => {
    const tr = price * quantity;
    return { tr };
  }, [price, quantity]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">Microeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Total Revenue & Price Elasticity Test Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate Total Revenue (TR = P × Q) and simulate pricing sensitivity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Unit Price (P)</label>
            <input type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Quantity Sold (Q)</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg">
            <span className="text-xs uppercase font-semibold text-blue-300">Total Revenue (TR)</span>
            <div className="text-5xl font-black font-mono my-3">{calc.tr.toLocaleString()}</div>
            <p className="text-xs text-blue-100 border-t border-white/10 pt-3">Formula: Total Revenue = Price × Quantity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
