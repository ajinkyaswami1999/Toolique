import { useState, useEffect } from 'react';
import { Hammer, Copy, Check, RotateCcw } from 'lucide-react';

const cityMultipliers: Record<string, number> = {
  metro: 1.15, // Mumbai, Delhi, Bangalore, etc.
  tier1: 1.05,  // Pune, Ahmedabad, Hyderabad
  tier2: 0.95,  // Nagpur, Nashik, Jaipur
  tier3: 0.85,  // Small towns
};

const qualityRates: Record<string, number> = {
  basic: 1300,    // basic brick, low grade concrete
  standard: 1650, // standard brick, M20 concrete, standard tiles
  premium: 2150,  // premium fittings, branded materials, modular features
  luxury: 2800,   // custom design, top quality marble, automation
};

export default function ConstructionCostCalculator() {
  const [area, setArea] = useState<number>(1000);
  const [city, setCity] = useState<string>('tier1');
  const [quality, setQuality] = useState<string>('standard');
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    materialCost: 0,
    laborCost: 0,
    totalCost: 0,
  });

  useEffect(() => {
    const rate = qualityRates[quality] || 1500;
    const cityFactor = cityMultipliers[city] || 1.0;

    const baseCost = area * rate * cityFactor;
    const materialCost = baseCost * 0.60; // 60% standard material cost split
    const laborCost = baseCost * 0.40;    // 40% labor and execution cost split

    setResults({
      materialCost: Math.round(materialCost),
      laborCost: Math.round(laborCost),
      totalCost: Math.round(baseCost),
    });
  }, [area, city, quality]);

  const copyReport = () => {
    const text = `Construction Cost Estimate (Toolique)
----------------------------------------
Plot/Built Area  : ${area.toLocaleString()} sq ft
City Category    : ${city.toUpperCase()}
Quality Standard : ${quality.toUpperCase()}
----------------------------------------
Material Cost    : ₹${results.materialCost.toLocaleString('en-IN')} (60%)
Labor Cost       : ₹${results.laborCost.toLocaleString('en-IN')} (40%)
Total Est. Cost  : ₹${results.totalCost.toLocaleString('en-IN')}
----------------------------------------
Estimated u/s standard Indian construction schedules.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setArea(1000);
    setCity('tier1');
    setQuality('standard');
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Left Input Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Hammer className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Cost Parameters</h3>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-650 dark:hover:text-slate-200 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Built-up Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Built-up Area (Sq Ft)
          </label>
          <input
            type="number"
            min="100"
            max="100000"
            value={area || ''}
            onChange={(e) => setArea(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-750 dark:text-slate-200 font-semibold focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* City Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            City Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(cityMultipliers).map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition ${
                  city === c
                    ? 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-950/20 dark:border-teal-900/60 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                {c === 'tier1' ? 'Tier 1' : c === 'tier2' ? 'Tier 2' : c === 'tier3' ? 'Tier 3' : 'Metro'}
              </button>
            ))}
          </div>
        </div>

        {/* Construction Quality */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Construction Quality
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(qualityRates).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition ${
                  quality === q
                    ? 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-950/20 dark:border-teal-900/60 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Estimated Cost
            </span>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400">Total Construction Cost</span>
              <div className="text-2xl md:text-3xl font-black text-teal-650 dark:text-teal-400 mt-1 leading-tight font-mono">
                ₹{results.totalCost.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Material Cost (60%)</span>
                <span className="font-bold text-slate-650 dark:text-slate-300 font-mono">
                  ₹{results.materialCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Labor Cost (40%)</span>
                <span className="font-bold text-slate-650 dark:text-slate-300 font-mono">
                  ₹{results.laborCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Est. Cost per Sq Ft</span>
                <span className="font-bold text-slate-650 dark:text-slate-300 font-mono">
                  ₹{Math.round(results.totalCost / (area || 1))} / sq ft
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Note: These calculations are estimates based on standard Indian civil cost parameters. Actual construction rates vary u/s localized supplier quotes, steel price fluctuations, and contractor premiums.
          </p>
        </div>
      </div>
    </div>
  );
}
