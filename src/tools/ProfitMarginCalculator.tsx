import { useState, useEffect } from 'react';
import { Percent, TrendingUp, IndianRupee } from 'lucide-react';

export default function ProfitMarginCalculator() {
  const [cost, setCost] = useState<number>(100);
  const [revenue, setRevenue] = useState<number>(150);
  const [margin, setMargin] = useState<number>(33.33);
  const [markup, setMarkup] = useState<number>(50);
  const [profit, setProfit] = useState<number>(50);
  const [calculationMode, setCalculationMode] = useState<'revenue' | 'margin'>('revenue');

  useEffect(() => {
    if (calculationMode === 'revenue') {
      const computedProfit = revenue - cost;
      const computedMargin = revenue > 0 ? (computedProfit / revenue) * 100 : 0;
      const computedMarkup = cost > 0 ? (computedProfit / cost) * 100 : 0;

      setProfit(Math.round(computedProfit * 100) / 100);
      setMargin(Math.round(computedMargin * 100) / 100);
      setMarkup(Math.round(computedMarkup * 100) / 100);
    } else {
      // Calculate revenue based on cost and target margin
      // Formula: Revenue = Cost / (1 - Margin/100)
      if (margin >= 100) {
        setRevenue(0);
        setProfit(0);
        setMarkup(0);
        return;
      }
      const computedRevenue = cost / (1 - margin / 100);
      const computedProfit = computedRevenue - cost;
      const computedMarkup = cost > 0 ? (computedProfit / cost) * 100 : 0;

      setRevenue(Math.round(computedRevenue * 100) / 100);
      setProfit(Math.round(computedProfit * 100) / 100);
      setMarkup(Math.round(computedMarkup * 100) / 100);
    }
  }, [cost, revenue, margin, calculationMode]);

  const costPercentage = revenue > 0 ? Math.min(100, Math.max(0, (cost / revenue) * 100)) : 0;
  const profitPercentage = Math.max(0, 100 - costPercentage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      {/* Configuration Card */}
      <div className="md:col-span-2 saas-card p-6 space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <span>Profit Margin Configuration</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Determine product profit margins and markup percentages.</p>
          </div>
          <div className="flex bg-zinc-150 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/30 dark:border-zinc-700/30">
            <button
              onClick={() => setCalculationMode('revenue')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                calculationMode === 'revenue' ? 'bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-50 shadow-sm' : 'text-zinc-500'
              }`}
            >
              Cost & Revenue
            </button>
            <button
              onClick={() => setCalculationMode('margin')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                calculationMode === 'margin' ? 'bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-50 shadow-sm' : 'text-zinc-500'
              }`}
            >
              Cost & Margin %
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Cost Price (Buying Price)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input saas-input-with-prefix w-full pl-8"
              />
            </div>
            <input
              type="range"
              min={1}
              max={10000}
              value={cost}
              onChange={(e) => setCost(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {calculationMode === 'revenue' ? (
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Selling Price (Revenue)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input saas-input-with-prefix w-full pl-8"
                />
              </div>
              <input
                type="range"
                min={1}
                max={15000}
                value={revenue}
                onChange={(e) => setRevenue(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Target Profit Margin (%)</label>
              <div className="relative">
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">%</span>
                <input
                  type="number"
                  value={margin}
                  max={99.9}
                  onChange={(e) => setMargin(Math.min(99.9, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="saas-input saas-input-with-suffix w-full pr-8"
                />
              </div>
              <input
                type="range"
                min={1}
                max={99}
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Visual Graph Cost vs Profit */}
        {revenue > 0 && (
          <div className="space-y-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-zinc-400 dark:bg-zinc-650" /> Cost (Buying Price): {costPercentage.toFixed(1)}%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Gross Profit: {profitPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden flex">
              <div className="h-full bg-zinc-350 dark:bg-zinc-600 transition-all duration-300" style={{ width: `${costPercentage}%` }} />
              <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${profitPercentage}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Calculations Outputs */}
      <div className="saas-card p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
            Margin Details
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-xl border border-indigo-500/15">
              <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Gross Profit</span>
              <span className="text-2xl font-black text-indigo-700 dark:text-indigo-350 flex items-center mt-1">
                <IndianRupee className="w-5 h-5 shrink-0" />
                <span>{profit.toLocaleString()}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
                <span className="block text-[9px] text-zinc-450 dark:text-zinc-500 font-bold uppercase">Gross Margin</span>
                <span className="text-lg font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-0.5 mt-1">
                  <span>{margin}%</span>
                  <Percent className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                </span>
              </div>
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
                <span className="block text-[9px] text-zinc-450 dark:text-zinc-500 font-bold uppercase">Markup %</span>
                <span className="text-lg font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-0.5 mt-1">
                  <span>{markup}%</span>
                  <Percent className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Industry Benchmarks */}
        <div className="pt-4 border-t border-zinc-150 dark:border-zinc-850 space-y-2">
          <span className="block text-[9px] text-zinc-450 dark:text-zinc-550 font-bold uppercase">Industry Benchmarks</span>
          <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex justify-between"><span>Retail Products:</span> <span className="font-bold">10% - 20%</span></div>
            <div className="flex justify-between"><span>SaaS Software:</span> <span className="font-bold">70% - 80%</span></div>
            <div className="flex justify-between"><span>Consulting Services:</span> <span className="font-bold">40% - 60%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
