import { useState, useEffect } from 'react';
import { Percent, TrendingUp, IndianRupee, Clock } from 'lucide-react';

export default function ROICalculator() {
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [finalValue, setFinalValue] = useState<number>(15000);
  const [periodValue, setPeriodValue] = useState<number>(2);
  const [periodUnit, setPeriodUnit] = useState<'years' | 'months'>('years');

  const [roi, setRoi] = useState<number>(50);
  const [annualizedRoi, setAnnualizedRoi] = useState<number>(22.47);
  const [gain, setGain] = useState<number>(5000);

  useEffect(() => {
    if (initialInvestment <= 0) {
      setRoi(0);
      setAnnualizedRoi(0);
      setGain(0);
      return;
    }

    const netGain = finalValue - initialInvestment;
    const computedRoi = (netGain / initialInvestment) * 100;

    // Convert period to fractional years
    const years = periodUnit === 'years' ? periodValue : periodValue / 12;

    let computedAnnualizedRoi = 0;
    if (years > 0 && finalValue > 0) {
      computedAnnualizedRoi = (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100;
    }

    setGain(Math.round(netGain * 100) / 100);
    setRoi(Math.round(computedRoi * 100) / 100);
    setAnnualizedRoi(Math.round(computedAnnualizedRoi * 100) / 100);
  }, [initialInvestment, finalValue, periodValue, periodUnit]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      {/* Inputs Configuration */}
      <div className="md:col-span-2 saas-card p-6 space-y-6">
        <div className="pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <span>ROI Configurator</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate the efficiency and returns on an investment.</p>
        </div>

        <div className="space-y-4">
          {/* Initial Investment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Initial Capital Invested</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
              <input
                type="number"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Math.max(1, parseFloat(e.target.value) || 0))}
                className="saas-input saas-input-with-prefix w-full pl-8"
              />
            </div>
            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Final Value */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Ending Value (Amount Returned)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
              <input
                type="number"
                value={finalValue}
                onChange={(e) => setFinalValue(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input saas-input-with-prefix w-full pl-8"
              />
            </div>
            <input
              type="range"
              min={1000}
              max={150000}
              step={1000}
              value={finalValue}
              onChange={(e) => setFinalValue(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Investment Period */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Investment Duration</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={periodValue}
                onChange={(e) => setPeriodValue(Math.max(0.1, parseFloat(e.target.value) || 1))}
                className="saas-input flex-1"
              />
              <select
                value={periodUnit}
                onChange={(e) => setPeriodUnit(e.target.value as 'years' | 'months')}
                className="saas-select w-32 cursor-pointer"
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="saas-card p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
            Investment Summary
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-xl border border-indigo-500/15">
              <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Total Return (Gain/Loss)</span>
              <span className={`text-2xl font-black flex items-center mt-1 ${gain >= 0 ? 'text-indigo-700 dark:text-indigo-350' : 'text-rose-600 dark:text-rose-455'}`}>
                <IndianRupee className="w-5 h-5 shrink-0" />
                <span>{gain.toLocaleString()}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
                <span className="block text-[9px] text-zinc-450 dark:text-zinc-500 font-bold uppercase">Absolute ROI</span>
                <span className="text-lg font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-0.5 mt-1">
                  <span>{roi}%</span>
                  <Percent className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                </span>
              </div>
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
                <span className="block text-[9px] text-zinc-450 dark:text-zinc-500 font-bold uppercase">Annualized ROI</span>
                <span className="text-lg font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-0.5 mt-1">
                  <span>{annualizedRoi}%</span>
                  <Percent className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Investment duration info */}
        <div className="pt-4 border-t border-zinc-150 dark:border-zinc-850 flex gap-2">
          <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-normal">
            Annualized ROI represents the geometric average rate of return that would be compounded annually over the holding period if final returns match input.
          </p>
        </div>
      </div>
    </div>
  );
}
