import { useState, useEffect } from 'react';
import { Hammer, Copy, Check, RotateCcw } from 'lucide-react';
import MaterialTrendGraph from '../components/MaterialTrendGraph';

const defaultCityMultipliers: Record<string, number> = {
  metro: 1.15, // Mumbai, Delhi, Bangalore, etc.
  tier1: 1.05,  // Pune, Ahmedabad, Hyderabad
  tier2: 0.95,  // Nagpur, Nashik, Jaipur
  tier3: 0.85,  // Small towns
};

const defaultQualityRates: Record<string, number> = {
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

  // Editable rates and multipliers
  const [qualityRates, setQualityRates] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('civil_quality_rates');
      return saved ? JSON.parse(saved) : defaultQualityRates;
    } catch {
      return defaultQualityRates;
    }
  });

  const [cityMultipliers, setCityMultipliers] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('civil_city_multipliers');
      return saved ? JSON.parse(saved) : defaultCityMultipliers;
    } catch {
      return defaultCityMultipliers;
    }
  });

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
  }, [area, city, quality, qualityRates, cityMultipliers]);

  const handleRateChange = (key: string, value: number) => {
    const updated = { ...qualityRates, [key]: value };
    setQualityRates(updated);
    try {
      localStorage.setItem('civil_quality_rates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMultiplierChange = (key: string, value: number) => {
    const updated = { ...cityMultipliers, [key]: value };
    setCityMultipliers(updated);
    try {
      localStorage.setItem('civil_city_multipliers', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const copyReport = () => {
    const text = `Construction Cost Estimate (Toolique)
----------------------------------------
Plot/Built Area  : ${area.toLocaleString()} sq ft
City Category    : ${city.toUpperCase()} (factor: ${cityMultipliers[city]})
Quality Standard : ${quality.toUpperCase()} (rate: ₹${qualityRates[quality]}/sq ft)
----------------------------------------
Material Cost    : ₹${results.materialCost.toLocaleString('en-IN')} (60%)
Labor Cost       : ₹${results.laborCost.toLocaleString('en-IN')} (40%)
Total Est. Cost  : ₹${results.totalCost.toLocaleString('en-IN')}
----------------------------------------
Estimated u/s custom/standard Indian construction schedules.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setArea(1000);
    setCity('tier1');
    setQuality('standard');
    setQualityRates(defaultQualityRates);
    setCityMultipliers(defaultCityMultipliers);
    try {
      localStorage.removeItem('civil_quality_rates');
      localStorage.removeItem('civil_city_multipliers');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Input Panel */}
        <div className="md:col-span-7 p-6 saas-card space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Hammer className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-zinc-800 dark:text-white text-sm">Cost Parameters</h3>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-650 dark:hover:text-zinc-200 transition"
              title="Reset Parameters & Rates"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Built-up Area */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Built-up Area (Sq Ft)
            </label>
            <input
              type="number"
              min="100"
              max="100000"
              value={area || ''}
              onChange={(e) => setArea(Math.max(0, parseInt(e.target.value) || 0))}
              className="saas-input font-semibold"
            />
          </div>

          {/* City Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              City Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(cityMultipliers).map((c) => (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all duration-200 ${
                    city === c
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400'
                      : 'border-zinc-250 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {c === 'tier1' ? 'Tier 1' : c === 'tier2' ? 'Tier 2' : c === 'tier3' ? 'Tier 3' : 'Metro'}
                </button>
              ))}
            </div>
          </div>

          {/* Construction Quality Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Construction Quality Grade
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(qualityRates).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all duration-200 ${
                    quality === q
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400'
                      : 'border-zinc-250 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Rates Section */}
          <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3">Edit Cost Settings</h4>
            
            <div className="space-y-4">
              {/* Quality Base Rates */}
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-2">
                  Quality Base Rates (₹ / Sq Ft)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(qualityRates).map((q) => (
                    <div key={q}>
                      <label className="block text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold mb-1 capitalize">
                        {q} Rate
                      </label>
                      <input
                        type="number"
                        value={qualityRates[q]}
                        onChange={(e) => handleRateChange(q, Math.max(0, parseInt(e.target.value) || 0))}
                        className="saas-input py-1.5 font-semibold font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* City Multipliers */}
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest mb-2">
                  City Multipliers (Factor)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(cityMultipliers).map((c) => (
                    <div key={c}>
                      <label className="block text-[9px] text-zinc-455 dark:text-zinc-500 font-bold mb-1 capitalize">
                        {c === 'metro' ? 'Metro' : c}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={cityMultipliers[c]}
                        onChange={(e) => handleMultiplierChange(c, Math.max(0, parseFloat(e.target.value) || 0))}
                        className="saas-input py-1.5 px-2 text-xs font-mono text-center font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                Estimated Cost
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-zinc-400">Total Construction Cost</span>
                <div className="text-2xl md:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 leading-tight font-mono">
                  ₹{results.totalCost.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Material Cost (60%)</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono">
                    ₹{results.materialCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Labor Cost (40%)</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono">
                    ₹{results.laborCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-zinc-100 dark:border-zinc-800/40 pb-3">
                  <span className="text-zinc-400 font-medium">Est. Cost per Sq Ft</span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 font-mono">
                    ₹{Math.round(results.totalCost / (area || 1))} / sq ft
                  </span>
                </div>
              </div>

              {/* Horizontal progress ratio visualizer */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                  Cost Allocation Map
                </span>
                <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
                  <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: '60%' }} />
                  <div className="bg-violet-500 h-full transition-all duration-300" style={{ width: '40%' }} />
                </div>
                <div className="flex flex-col gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 block"></span>
                      <span>Materials (Cement, Steel, Brick, Sand)</span>
                    </div>
                    <span className="font-bold font-mono">60%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-violet-500 block"></span>
                      <span>Labor & Contracting</span>
                    </div>
                    <span className="font-bold font-mono">40%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 text-[10px] text-zinc-450 dark:text-zinc-550 leading-relaxed">
            <p>
              Note: Costing incorporates local adjustments including the customized quality grade base and city multiplication values.
            </p>
          </div>
        </div>
      </div>

      {/* SVG Trend Graph spanning full width */}
      <MaterialTrendGraph 
        allowedMaterials={['constructionCost']} 
        defaultMaterial="constructionCost" 
        title="Residential Construction Cost Index Trends" 
      />
    </div>
  );
}
