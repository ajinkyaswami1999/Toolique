import { useState, useMemo } from 'react';
import { Globe2 } from 'lucide-react';

export default function ComparativeAdvantageCalculator() {
  const [countryA_goodX, setCountryA_goodX] = useState<number>(10);
  const [countryA_goodY, setCountryA_goodY] = useState<number>(20);
  const [countryB_goodX, setCountryB_goodX] = useState<number>(15);
  const [countryB_goodY, setCountryB_goodY] = useState<number>(15);

  const calc = useMemo(() => {
    const oppA_X = countryA_goodX > 0 ? countryA_goodY / countryA_goodX : 0;
    const oppB_X = countryB_goodX > 0 ? countryB_goodY / countryB_goodX : 0;

    let advX = oppA_X < oppB_X ? 'Country A' : 'Country B';
    let advY = oppA_X < oppB_X ? 'Country B' : 'Country A';

    return { oppA_X, oppB_X, advX, advY };
  }, [countryA_goodX, countryA_goodY, countryB_goodX, countryB_goodY]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">Macroeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-blue-600" />
          Comparative Advantage & International Trade Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Determine country specializations and mutually beneficial terms of trade.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Country A Output / Hour</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Good X (Units)</label>
              <input type="number" value={countryA_goodX} onChange={(e) => setCountryA_goodX(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Good Y (Units)</label>
              <input type="number" value={countryA_goodY} onChange={(e) => setCountryA_goodY(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm" />
            </div>
          </div>

          <h3 className="text-sm font-bold text-zinc-900 dark:text-white pt-2">Country B Output / Hour</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Good X (Units)</label>
              <input type="number" value={countryB_goodX} onChange={(e) => setCountryB_goodX(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Good Y (Units)</label>
              <input type="number" value={countryB_goodY} onChange={(e) => setCountryB_goodY(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-xl text-sm" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-2xl p-5 text-white">
            <span className="text-xs uppercase font-semibold text-blue-300">Specialization Recommendation</span>
            <div className="text-lg font-bold mt-2">{calc.advX} specializes in Good X</div>
            <div className="text-lg font-bold text-emerald-300">{calc.advY} specializes in Good Y</div>
            <div className="text-xs text-blue-200 border-t border-white/10 pt-3 mt-3">
              Opp Cost of X: Country A = {calc.oppA_X.toFixed(2)} Y vs Country B = {calc.oppB_X.toFixed(2)} Y
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
