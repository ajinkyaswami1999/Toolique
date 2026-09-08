import { useState, useMemo } from 'react';
import { DollarSign } from 'lucide-react';

export default function PurchasingPowerCalculator() {
  const [initialAmount, setInitialAmount] = useState<number>(100000);
  const [inflationRate, setInflationRate] = useState<number>(6);
  const [years, setYears] = useState<number>(10);

  const calc = useMemo(() => {
    const rateDecimal = inflationRate / 100;
    const futureRealValue = initialAmount / Math.pow(1 + rateDecimal, years);
    const neededToMatch = initialAmount * Math.pow(1 + rateDecimal, years);
    const lossPercentage = ((initialAmount - futureRealValue) / initialAmount) * 100;
    return { futureRealValue, neededToMatch, lossPercentage };
  }, [initialAmount, inflationRate, years]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">Macroeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-600" />
          Purchasing Power Loss Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Simulate purchasing power loss of cash savings over 1 to 50 years.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Current Cash Amount</label>
            <input type="number" value={initialAmount} onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Annual Inflation (%)</label>
              <input type="number" value={inflationRate} onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Time Horizon (Years)</label>
              <input type="number" value={years} onChange={(e) => setYears(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-amber-900 to-orange-950 rounded-2xl p-6 text-white shadow-lg">
            <span className="text-xs uppercase font-semibold text-amber-300">Future Real Purchasing Power</span>
            <div className="text-5xl font-black font-mono my-3">{Math.round(calc.futureRealValue).toLocaleString()}</div>
            <p className="text-xs text-amber-100 border-t border-white/10 pt-3">
              Loss: -{calc.lossPercentage.toFixed(1)}% ({years} yrs). Amount needed to match: {Math.round(calc.neededToMatch).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
