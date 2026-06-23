import { useState, useEffect } from 'react';
import { IndianRupee, BarChart2, TrendingUp } from 'lucide-react';

export default function InventoryCalculator() {
  const [begInventory, setBegInventory] = useState<number>(20000);
  const [purchases, setPurchases] = useState<number>(80000);
  const [endInventory, setEndInventory] = useState<number>(15000);

  const [cogs, setCogs] = useState<number>(0);
  const [avgInventory, setAvgInventory] = useState<number>(0);
  const [turnover, setTurnover] = useState<number>(0);
  const [daysToSell, setDaysToSell] = useState<number>(0);

  useEffect(() => {
    const computedCogs = begInventory + purchases - endInventory;
    const computedAvg = (begInventory + endInventory) / 2;
    const computedTurnover = computedAvg > 0 ? computedCogs / computedAvg : 0;
    const computedDays = computedTurnover > 0 ? 365 / computedTurnover : 0;

    setCogs(Math.max(0, computedCogs));
    setAvgInventory(Math.max(0, computedAvg));
    setTurnover(Math.round(computedTurnover * 100) / 100);
    setDaysToSell(Math.round(computedDays * 10) / 10);
  }, [begInventory, purchases, endInventory]);

  let velocityClass = 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
  let velocityText = 'Inactive';
  if (turnover > 8) {
    velocityClass = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border border-emerald-500/20';
    velocityText = 'Fast-Moving (High Velocity)';
  } else if (turnover >= 4) {
    velocityClass = 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20';
    velocityText = 'Healthy Turnover (Moderate)';
  } else if (turnover > 0) {
    velocityClass = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20';
    velocityText = 'Slow-Moving (High Carrying Cost)';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      {/* Configuration Card */}
      <div className="md:col-span-2 saas-card p-6 space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" />
              <span>Inventory Inputs</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Input inventory parameters to evaluate turnover efficiency metrics.</p>
          </div>
          <button
            onClick={() => {
              setBegInventory(0);
              setPurchases(0);
              setEndInventory(0);
            }}
            className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition"
          >
            Reset
          </button>
        </div>

        <div className="space-y-4">
          {/* Beginning Inventory */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Beginning Inventory (Start of Period)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
              <input
                type="number"
                value={begInventory}
                onChange={(e) => setBegInventory(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input saas-input-with-prefix w-full pl-8"
              />
            </div>
            <input
              type="range"
              min={0}
              max={100000}
              step={1000}
              value={begInventory}
              onChange={(e) => setBegInventory(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Cost of Purchases */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Cost of New Purchases</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
              <input
                type="number"
                value={purchases}
                onChange={(e) => setPurchases(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input saas-input-with-prefix w-full pl-8"
              />
            </div>
            <input
              type="range"
              min={0}
              max={250000}
              step={1000}
              value={purchases}
              onChange={(e) => setPurchases(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Ending Inventory */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Ending Inventory (End of Period)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
              <input
                type="number"
                value={endInventory}
                onChange={(e) => setEndInventory(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input saas-input-with-prefix w-full pl-8"
              />
            </div>
            <input
              type="range"
              min={0}
              max={100000}
              step={1000}
              value={endInventory}
              onChange={(e) => setEndInventory(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Results Column */}
      <div className="saas-card p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-5">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
            Efficiency Results
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-xl border border-indigo-500/15">
              <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Cost of Goods Sold (COGS)</span>
              <span className="text-2xl font-black text-indigo-700 dark:text-indigo-350 flex items-center mt-1">
                <IndianRupee className="w-5 h-5 shrink-0" />
                <span>{cogs.toLocaleString()}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
                <span className="block text-[9px] text-zinc-450 dark:text-zinc-500 font-bold uppercase">Average Inventory</span>
                <span className="text-sm font-black text-zinc-800 dark:text-zinc-100 flex items-center mt-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{avgInventory.toLocaleString()}</span>
                </span>
              </div>
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
                <span className="block text-[9px] text-zinc-450 dark:text-zinc-500 font-bold uppercase">Turnover Ratio</span>
                <span className="text-sm font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-0.5 mt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-zinc-450" />
                  <span>{turnover}x</span>
                </span>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
              <span className="block text-[10px] text-zinc-450 dark:text-zinc-555 font-bold uppercase">Average Days to Sell</span>
              <span className="text-lg font-black text-zinc-800 dark:text-zinc-100 mt-1 block">
                {daysToSell} Days
              </span>
            </div>
          </div>
        </div>

        {/* Velocity Status */}
        {turnover > 0 && (
          <div className="pt-4 border-t border-zinc-150 dark:border-zinc-850 space-y-2">
            <span className="block text-[9px] text-zinc-450 dark:text-zinc-555 font-bold uppercase">Product Velocity Status</span>
            <div className={`p-2.5 rounded-lg text-xs font-bold text-center ${velocityClass}`}>
              {velocityText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
