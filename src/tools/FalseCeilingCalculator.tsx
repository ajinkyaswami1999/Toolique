import { useState, useEffect } from 'react';
import { Palette, Copy, Check, RotateCcw } from 'lucide-react';

interface CeilingPreset {
  name: string;
  baseRate: number; // per sq ft (material + basic channel support)
}

const presets: Record<string, CeilingPreset> = {
  gypsum: { name: 'Gypsum Board Ceiling', baseRate: 85 },
  pop: { name: 'Plaster of Paris (POP)', baseRate: 110 },
  pvc: { name: 'PVC Panels', baseRate: 75 },
  wooden: { name: 'Wooden Paneling (MDF/Ply)', baseRate: 220 },
  custom: { name: 'Custom Setup', baseRate: 100 },
};

export default function FalseCeilingCalculator() {
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [length, setLength] = useState<number>(15);
  const [width, setWidth] = useState<number>(12);
  const [materialKey, setMaterialKey] = useState<string>('gypsum');
  const [customRate, setCustomRate] = useState<number>(100);
  const [complexity, setComplexity] = useState<'flat' | 'step' | 'designer'>('step');
  
  // Cove lighting details
  const [includeCove, setIncludeCove] = useState<boolean>(true);
  const [covePrice, setCovePrice] = useState<number>(150); // INR per running foot for LED strips + wiring
  
  const [wastage, setWastage] = useState<number>(5); // %
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    area: 0,
    coveLength: 0,
    baseCost: 0,
    complexityMarkup: 0,
    coveCost: 0,
    wastageCost: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    const area = length * width;
    const isCustom = materialKey === 'custom';
    const activePreset = presets[materialKey] || presets.gypsum;
    const baseRate = isCustom ? customRate : activePreset.baseRate;

    // Multiplier for metric to imperial area mapping
    const areaMultiplier = unit === 'meters' ? 10.764 : 1;
    const lenMultiplier = unit === 'meters' ? 3.28084 : 1; // 1 meter = 3.28084 feet for cove running lengths

    // Base area cost (scaled by unit area conversion)
    const baseCostVal = area * baseRate * areaMultiplier;

    // Complexity markups
    // Flat: 0%, Step: 15%, Designer: 35%
    let complexityFactor = 0;
    if (complexity === 'step') complexityFactor = 0.15;
    else if (complexity === 'designer') complexityFactor = 0.35;
    const complexityMarkup = baseCostVal * complexityFactor;

    // Cove lighting length = perimeter of ceiling roughly
    const coveLength = includeCove ? 2 * (length + width) : 0;
    // Cove cost = coveLength in feet * covePrice
    const coveCost = coveLength * lenMultiplier * covePrice;

    // Wastage calculation
    const wastageCost = (baseCostVal + complexityMarkup) * (wastage / 100);

    const grandTotal = baseCostVal + complexityMarkup + coveCost + wastageCost;

    setResults({
      area: Number(area.toFixed(1)),
      coveLength: Number((coveLength * lenMultiplier).toFixed(1)), // in running feet
      baseCost: Math.round(baseCostVal),
      complexityMarkup: Math.round(complexityMarkup),
      coveCost: Math.round(coveCost),
      wastageCost: Math.round(wastageCost),
      grandTotal: Math.round(grandTotal),
    });
  }, [length, width, materialKey, customRate, complexity, includeCove, covePrice, wastage, unit]);

  const copyReport = () => {
    const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';
    const dimUnit = unit === 'feet' ? 'ft' : 'm';
    const activePreset = presets[materialKey] || presets.gypsum;

    const text = `False Ceiling Project Estimation Report (Toolique)
----------------------------------------
Dimensions        : ${length} x ${width} ${dimUnit} = ${results.area} ${areaUnit}
Material Preset   : ${activePreset.name}
Complexity Level  : ${complexity.toUpperCase()}
Cove Lighting Included: ${includeCove ? 'YES' : 'NO'}
----------------------------------------
Base Material Cost: ₹${results.baseCost.toLocaleString()}
Complexity Markup : ₹${results.complexityMarkup.toLocaleString()}
Cove Strips & LED : ₹${results.coveCost.toLocaleString()} (for ${results.coveLength} Rft)
Wastage Component : ₹${results.wastageCost.toLocaleString()} (${wastage}%)
----------------------------------------
Grand Total Cost  : ₹${results.grandTotal.toLocaleString()}
----------------------------------------
Calculated according to Indian standard fit-out contractor rate indexes.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setLength(15);
    setWidth(12);
    setMaterialKey('gypsum');
    setCustomRate(100);
    setComplexity('step');
    setIncludeCove(true);
    setCovePrice(150);
    setWastage(5);
  };

  const dimUnit = unit === 'feet' ? 'ft' : 'm';

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <Palette className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Ceiling Scope</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
              <button
                onClick={() => setUnit('feet')}
                className={`px-2 py-1 rounded-md transition ${unit === 'feet' ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-sm' : 'text-slate-400'}`}
              >
                Feet
              </button>
              <button
                onClick={() => setUnit('meters')}
                className={`px-2 py-1 rounded-md transition ${unit === 'meters' ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-sm' : 'text-slate-400'}`}
              >
                Meters
              </button>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-650 dark:hover:text-slate-200 transition"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Room Area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Ceiling Length ({dimUnit})
            </label>
            <input
              type="number"
              value={length || ''}
              onChange={(e) => setLength(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Ceiling Width ({dimUnit})
            </label>
            <input
              type="number"
              value={width || ''}
              onChange={(e) => setWidth(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Material Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            Select Ceiling Material
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(presets).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setMaterialKey(key)}
                className={`px-2 py-2 rounded-xl text-left border transition ${
                  materialKey === key
                    ? 'border-pink-500 bg-pink-500/5 text-pink-600 dark:text-pink-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="text-xs font-bold truncate">{value.name}</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Est: ₹{value.baseRate}/sq ft
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom fields if custom selected */}
        {materialKey === 'custom' && (
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Custom Base Rate (₹ / sq ft)
              </label>
              <input
                type="number"
                value={customRate || ''}
                onChange={(e) => setCustomRate(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Complexity Selectors */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Design Complexity Tier
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'flat', label: 'Flat/Single Layer' },
              { id: 'step', label: 'Step/Dual Layer' },
              { id: 'designer', label: 'Designer/Custom CNC' },
            ].map((tier) => (
              <button
                key={tier.id}
                onClick={() => setComplexity(tier.id as any)}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition ${
                  complexity === tier.id
                    ? 'border-pink-500 bg-pink-500/5 text-pink-600 dark:text-pink-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cove details, Wastage */}
        <div className="grid grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4 items-center">
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="includeCove"
              checked={includeCove}
              onChange={(e) => setIncludeCove(e.target.checked)}
              className="w-4 h-4 rounded border-slate-350 dark:border-slate-800 text-pink-600 focus:ring-pink-500"
            />
            <label htmlFor="includeCove" className="text-xs font-semibold text-slate-650 dark:text-slate-300 cursor-pointer">
              Cove Lighting
            </label>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">
              LED Strip Rate (₹/ft)
            </label>
            <input
              type="number"
              disabled={!includeCove}
              value={covePrice || ''}
              onChange={(e) => setCovePrice(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">
              Wastage Buffer (%)
            </label>
            <input
              type="number"
              value={wastage || ''}
              onChange={(e) => setWastage(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              False Ceiling Cost Estimate
            </span>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400">Total Project Price</span>
              <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                ₹{results.grandTotal.toLocaleString()}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Base Board Area Cost</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.baseCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Complexity Layer Markup</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.complexityMarkup.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Cove lighting + Wiring</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.coveCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Material Waste ({wastage}%)</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.wastageCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            * Step layers and dual levels involve additional suspension channels and gypsum perimeter trims, thus escalating the labor/material indexes.
          </p>
        </div>
      </div>
    </div>
  );
}
