import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';

export default function VelocityOfMoneyCalculator() {
  const [moneySupply, setMoneySupply] = useState<number>(2000);
  const [priceLevel, setPriceLevel] = useState<number>(1.25);
  const [realGdp, setRealGdp] = useState<number>(8000);

  const calc = useMemo(() => {
    const nominalGdp = priceLevel * realGdp;
    const velocity = moneySupply > 0 ? nominalGdp / moneySupply : 0;
    return { nominalGdp, velocity };
  }, [moneySupply, priceLevel, realGdp]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">Macroeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-amber-600" />
          Velocity of Money (M × V = P × Y) Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate circulation turnover of money in the economy (Quantity Theory of Money).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Money Supply (M - Billions)</label>
            <input type="number" value={moneySupply} onChange={(e) => setMoneySupply(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Average Price Level (P)</label>
            <input type="number" value={priceLevel} onChange={(e) => setPriceLevel(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Real Output / GDP (Y - Billions)</label>
            <input type="number" value={realGdp} onChange={(e) => setRealGdp(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-amber-900 to-orange-950 rounded-2xl p-6 text-white shadow-lg">
            <span className="text-xs uppercase font-semibold text-amber-300">Velocity of Circulation (V)</span>
            <div className="text-5xl font-black font-mono my-3">{calc.velocity.toFixed(2)}x</div>
            <p className="text-xs text-amber-100 border-t border-white/10 pt-3">Nominal GDP (P × Y): {calc.nominalGdp.toLocaleString()} Billion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
