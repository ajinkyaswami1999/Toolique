import { useState, useMemo } from 'react';
import { Layers } from 'lucide-react';

export default function RealGdpCalculator() {
  const [nominalGdp, setNominalGdp] = useState<number>(3750);
  const [gdpDeflator, setGdpDeflator] = useState<number>(115);

  const calc = useMemo(() => {
    const realGdp = gdpDeflator > 0 ? (nominalGdp / gdpDeflator) * 100 : 0;
    const inflationImpact = nominalGdp - realGdp;
    return { realGdp, inflationImpact };
  }, [nominalGdp, gdpDeflator]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300">Macroeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Real GDP vs Nominal GDP (GDP Deflator) Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Deflate current-price GDP using the GDP Deflator to find constant-price Real GDP.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nominal GDP (Current Prices - Billions)</label>
            <input type="number" value={nominalGdp} onChange={(e) => setNominalGdp(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">GDP Deflator Index (Base Year = 100)</label>
            <input type="number" value={gdpDeflator} onChange={(e) => setGdpDeflator(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-blue-950 rounded-2xl p-6 text-white shadow-lg">
            <span className="text-xs uppercase font-semibold text-indigo-300">Real GDP (Constant Prices)</span>
            <div className="text-5xl font-black font-mono my-3">{calc.realGdp.toFixed(2)} <span className="text-sm font-normal text-indigo-200">Billion</span></div>
            <p className="text-xs text-indigo-100 border-t border-white/10 pt-3">Inflation Premium: {calc.inflationImpact.toFixed(2)} Billion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
