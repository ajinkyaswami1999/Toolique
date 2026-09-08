import { useState, useMemo } from 'react';
import { PieChart } from 'lucide-react';

export default function KeynesianNationalIncomeCalculator() {
  const [consumption, setConsumption] = useState<number>(2200);
  const [investment, setInvestment] = useState<number>(650);
  const [government, setGovernment] = useState<number>(800);
  const [exports, setExports] = useState<number>(450);
  const [imports, setImports] = useState<number>(550);

  const calc = useMemo(() => {
    const netExports = exports - imports;
    const gdp = consumption + investment + government + netExports;
    const cShare = gdp > 0 ? (consumption / gdp) * 100 : 0;
    const iShare = gdp > 0 ? (investment / gdp) * 100 : 0;
    const gShare = gdp > 0 ? (government / gdp) * 100 : 0;
    const nxShare = gdp > 0 ? (netExports / gdp) * 100 : 0;
    return { gdp, netExports, cShare, iShare, gShare, nxShare };
  }, [consumption, investment, government, exports, imports]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">Macroeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-indigo-600" />
          Keynesian National Income (Y = C + I + G + NX) Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Aggregate expenditure approach to national gross domestic product.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-3 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Consumption (C)</label>
            <input type="number" value={consumption} onChange={(e) => setConsumption(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Investment (I)</label>
            <input type="number" value={investment} onChange={(e) => setInvestment(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Government Spending (G)</label>
            <input type="number" value={government} onChange={(e) => setGovernment(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Exports (X)</label>
              <input type="number" value={exports} onChange={(e) => setExports(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Imports (M)</label>
              <input type="number" value={imports} onChange={(e) => setImports(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-blue-950 rounded-2xl p-6 text-white shadow-lg">
            <span className="text-xs uppercase font-semibold text-indigo-300">Total National Income (GDP Y)</span>
            <div className="text-5xl font-black font-mono my-3">{calc.gdp.toLocaleString()} <span className="text-sm font-normal text-indigo-200">Billion</span></div>
            <p className="text-xs text-indigo-100 border-t border-white/10 pt-3">Net Exports (NX = X - M): {calc.netExports >= 0 ? '+' : ''}{calc.netExports.toLocaleString()} Billion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
