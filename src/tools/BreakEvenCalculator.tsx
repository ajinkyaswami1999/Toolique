import { useState } from 'react';
import { IndianRupee, AlertCircle, Percent, BarChart3, HelpCircle } from 'lucide-react';

export default function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState<number>(20000);
  const [variableCost, setVariableCost] = useState<number>(50);
  const [sellingPrice, setSellingPrice] = useState<number>(100);

  const contributionMargin = sellingPrice - variableCost;
  const contributionMarginRatio = sellingPrice > 0 ? (contributionMargin / sellingPrice) * 100 : 0;

  const isValid = sellingPrice > variableCost;
  const breakEvenUnits = isValid ? Math.ceil(fixedCosts / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * sellingPrice;

  // Generate projections matrix for visualization
  const projectionSteps = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const projections = projectionSteps.map(step => {
    const units = Math.ceil(breakEvenUnits * step) || 10;
    const totalVar = units * variableCost;
    const totalCost = fixedCosts + totalVar;
    const revenue = units * sellingPrice;
    const netProfit = revenue - totalCost;

    return {
      units,
      totalCost,
      revenue,
      netProfit,
      isBreakEven: Math.abs(step - 1) < 0.01
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      {/* Inputs Configuration */}
      <div className="md:col-span-2 saas-card p-6 space-y-6">
        <div className="pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <span>Break-even Cost Builder</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Determine the exact sales volume needed to cover overheads.</p>
        </div>

        <div className="space-y-5">
          {/* Fixed Costs */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-500 uppercase">Fixed Costs (Overhead, Rent, Salaries)</label>
              <span className="text-xs text-zinc-400 font-medium">Monthly / Annual</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
              <input
                type="number"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input saas-input-with-prefix w-full pl-8"
              />
            </div>
            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={fixedCosts}
              onChange={(e) => setFixedCosts(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Variable Cost per Unit */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Variable Cost per Unit (Production, Shipping)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
              <input
                type="number"
                value={variableCost}
                onChange={(e) => setVariableCost(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input saas-input-with-prefix w-full pl-8"
              />
            </div>
            <input
              type="range"
              min={1}
              max={500}
              value={variableCost}
              onChange={(e) => setVariableCost(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Selling Price per Unit */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Selling Price per Unit</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">₹</span>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input saas-input-with-prefix w-full pl-8"
              />
            </div>
            <input
              type="range"
              min={1}
              max={1000}
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseInt(e.target.value, 10))}
              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Validation Warning */}
        {!isValid && (
          <div className="p-4 rounded-xl border bg-rose-50/50 dark:bg-rose-950/10 border-rose-500/20 text-rose-800 dark:text-rose-350 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Pricing Mismatch</h4>
              <p className="text-xs mt-0.5">Selling Price per unit must exceed Variable Cost per unit to achieve break-even.</p>
            </div>
          </div>
        )}
      </div>

      {/* Output Panel */}
      <div className="saas-card p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
            Break-even Analysis
          </h3>

          {isValid ? (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-xl border border-indigo-500/15">
                <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Break-even Units</span>
                <span className="text-2xl font-black text-indigo-700 dark:text-indigo-350 flex items-center mt-1">
                  <span>{breakEvenUnits.toLocaleString()}</span>
                  <span className="text-xs font-semibold text-zinc-450 ml-1.5 font-sans">Units sold</span>
                </span>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
                <span className="block text-[10px] text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider">Break-even Sales Revenue</span>
                <span className="text-xl font-black text-zinc-805 dark:text-zinc-150 flex items-center mt-1">
                  <IndianRupee className="w-4.5 h-4.5 shrink-0" />
                  <span>{breakEvenRevenue.toLocaleString()}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
                  <span className="block text-[9px] text-zinc-450 dark:text-zinc-500 font-bold uppercase">Contribution Margin</span>
                  <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 flex items-center mt-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>{contributionMargin}</span>
                  </span>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-850">
                  <span className="block text-[9px] text-zinc-450 dark:text-zinc-500 font-bold uppercase">Margin Ratio</span>
                  <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-0.5 mt-1">
                    <span>{contributionMarginRatio.toFixed(1)}%</span>
                    <Percent className="w-3 h-3 text-zinc-400" />
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center rounded-xl bg-zinc-50 dark:bg-zinc-950 border text-xs text-zinc-400 border-zinc-100 dark:border-zinc-850">
              Awaiting valid cost definitions to compute parameters.
            </div>
          )}
        </div>

        {/* Quick Help Tip */}
        <div className="pt-4 border-t border-zinc-150 dark:border-zinc-850 flex gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-normal">
            <strong>What is Break-even?</strong> It represents the point where your business incurs zero net profit or loss, meaning all operational and manufacturing overheads are covered.
          </p>
        </div>
      </div>

      {/* Projection Table row */}
      {isValid && breakEvenUnits > 0 && (
        <div className="md:col-span-3 saas-card p-6 space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Sales Revenue Projection Matrix</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-450 dark:text-zinc-500">
                  <th className="py-2.5 font-bold">Sales Volume</th>
                  <th className="py-2.5 font-bold">Total Costs</th>
                  <th className="py-2.5 font-bold">Gross Revenue</th>
                  <th className="py-2.5 font-bold text-right">Net Profit / Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {projections.map((p, idx) => (
                  <tr
                    key={idx}
                    className={`transition ${p.isBreakEven ? 'bg-indigo-500/5 font-semibold text-indigo-650 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'}`}
                  >
                    <td className="py-3 flex items-center gap-1.5">
                      <span>{p.units} Units</span>
                      {p.isBreakEven && <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.5 rounded font-black uppercase">BEP</span>}
                    </td>
                    <td className="py-3">₹{p.totalCost.toLocaleString()}</td>
                    <td className="py-3">₹{p.revenue.toLocaleString()}</td>
                    <td className={`py-3 text-right font-black ${p.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-455'}`}>
                      {p.netProfit >= 0 ? '+' : ''}₹{p.netProfit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
