import { useState, useEffect } from 'react';
import { Ruler, Copy, Check, RotateCcw } from 'lucide-react';

interface MixRatio {
  name: string;
  cement: number;
  sand: number;
  aggregate: number;
}

const mixRatios: Record<string, MixRatio> = {
  M5: { name: 'M5 (1:5:10)', cement: 1, sand: 5, aggregate: 10 },
  M75: { name: 'M7.5 (1:4:8)', cement: 1, sand: 4, aggregate: 8 },
  M10: { name: 'M10 (1:3:6)', cement: 1, sand: 3, aggregate: 6 },
  M15: { name: 'M15 (1:2:4)', cement: 1, sand: 2, aggregate: 4 },
  M20: { name: 'M20 (1:1.5:3)', cement: 1, sand: 1.5, aggregate: 3 },
  M25: { name: 'M25 (1:1:2)', cement: 1, sand: 1, aggregate: 2 },
};

export default function ConcreteCalculator() {
  const [length, setLength] = useState<number>(10);
  const [width, setWidth] = useState<number>(10);
  const [thickness, setThickness] = useState<number>(6); // in inches
  const [unit, setUnit] = useState<'ft' | 'm'>('ft');
  const [mix, setMix] = useState<string>('M20');
  const [wastage, setWastage] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    wetVolume: 0,
    dryVolume: 0,
    cementBags: 0,
    sandCuft: 0,
    aggregateCuft: 0,
    waterLiters: 0,
  });

  useEffect(() => {
    let volM3 = 0;
    
    // Calculate wet volume in cubic meters
    if (unit === 'ft') {
      const l = length * 0.3048;
      const w = width * 0.3048;
      const t = (thickness / 12) * 0.3048;
      volM3 = l * w * t;
    } else {
      volM3 = length * width * (thickness / 100); // thickness in cm for metric mode
    }

    // Add wastage
    const wetVolume = volM3 * (1 + wastage / 100);

    // Dry volume factor for concrete mix is typically 1.54
    const dryVolume = wetVolume * 1.54;

    const ratio = mixRatios[mix] || mixRatios.M20;
    const totalParts = ratio.cement + ratio.sand + ratio.aggregate;

    // Material volume shares
    const cementVol = (ratio.cement / totalParts) * dryVolume;
    const sandVol = (ratio.sand / totalParts) * dryVolume;
    const aggregateVol = (ratio.aggregate / totalParts) * dryVolume;

    // Conversions
    // 1 bag of cement = 50kg = 0.035 cubic meters
    const cementBags = cementVol / 0.0347;

    // Convert cubic meters to cubic feet for sand and aggregate
    const sandCuft = sandVol * 35.3147;
    const aggregateCuft = aggregateVol * 35.3147;

    // Water requirement is generally 22.5 to 25 liters per bag of cement
    const waterLiters = cementBags * 24;

    setResults({
      wetVolume: Number(wetVolume.toFixed(3)),
      dryVolume: Number(dryVolume.toFixed(3)),
      cementBags: Math.ceil(cementBags),
      sandCuft: Number(sandCuft.toFixed(2)),
      aggregateCuft: Number(aggregateCuft.toFixed(2)),
      waterLiters: Math.round(waterLiters),
    });
  }, [length, width, thickness, unit, mix, wastage]);

  const copyReport = () => {
    const text = `Concrete Material Estimate (Toolique)
----------------------------------------
Dimensions : ${length} x ${width} ${unit} (Thickness: ${thickness} ${unit === 'ft' ? 'inches' : 'cm'})
Mix Ratio  : ${mixRatios[mix].name}
Wastage    : ${wastage}%
----------------------------------------
Wet Volume : ${results.wetVolume} m³
Dry Volume : ${results.dryVolume} m³
----------------------------------------
Cement     : ${results.cementBags} Bags (50 kg)
Sand       : ${results.sandCuft} Cu Ft
Aggregate  : ${results.aggregateCuft} Cu Ft
Water Req. : ${results.waterLiters} Liters
----------------------------------------
Calculated based on standard 1.54 dry shrinkage volume coefficients.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setLength(10);
    setWidth(10);
    setThickness(6);
    setMix('M20');
    setWastage(5);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Ruler className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Concrete Dimensions</h3>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-650 dark:hover:text-slate-200 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Unit Selection */}
        <div className="flex justify-end">
          <div className="flex rounded-lg bg-slate-50 dark:bg-slate-950/40 p-1 border border-slate-200/60 dark:border-slate-800/80">
            <button
              onClick={() => { setUnit('ft'); setThickness(6); }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                unit === 'ft'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Imperial (Ft/In)
            </button>
            <button
              onClick={() => { setUnit('m'); setThickness(15); }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                unit === 'm'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Metric (M/Cm)
            </button>
          </div>
        </div>

        {/* Dimensions inputs */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-405 mb-1.5">
              Length ({unit})
            </label>
            <input
              type="number"
              value={length || ''}
              onChange={(e) => setLength(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-750 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-405 mb-1.5">
              Width ({unit})
            </label>
            <input
              type="number"
              value={width || ''}
              onChange={(e) => setWidth(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-750 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-405 mb-1.5">
              Thickness ({unit === 'ft' ? 'Inches' : 'Cm'})
            </label>
            <input
              type="number"
              value={thickness || ''}
              onChange={(e) => setThickness(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-750 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Mix Design */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Concrete Mix Grade
            </label>
            <select
              value={mix}
              onChange={(e) => setMix(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-750 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              {Object.keys(mixRatios).map((m) => (
                <option key={m} value={m}>
                  {mixRatios[m].name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Wastage Buffer (%)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              value={wastage || ''}
              onChange={(e) => setWastage(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-750 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Concrete Quantities
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
              <span className="text-xs font-semibold text-slate-400">Total Concrete Volume (Wet)</span>
              <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {results.wetVolume} m³
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Cement (50kg bags)</span>
                <span className="font-bold text-slate-750 dark:text-slate-350 font-mono">
                  {results.cementBags} Bags
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Sand (Fine Aggregate)</span>
                <span className="font-bold text-slate-750 dark:text-slate-350 font-mono">
                  {results.sandCuft} Cu Ft
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Aggregate (Coarse 20mm)</span>
                <span className="font-bold text-slate-750 dark:text-slate-350 font-mono">
                  {results.aggregateCuft} Cu Ft
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Estimated Water Needed</span>
                <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">
                  ~{results.waterLiters} Liters
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Dry volume is computed by scaling wet volume by 1.54 to account for compaction and voids when water is mixed.
          </p>
        </div>
      </div>
    </div>
  );
}
