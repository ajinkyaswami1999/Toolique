import { useState, useEffect } from 'react';
import { Palette, Copy, Check, RotateCcw } from 'lucide-react';

interface FinishPreset {
  name: string;
  markupFactor: number; // multiplier on base cost
}

const finishPresets: Record<string, FinishPreset> = {
  matteLaminate: { name: 'Matte Laminate', markupFactor: 1.0 },
  glossLaminate: { name: 'High-Gloss Laminate', markupFactor: 1.15 },
  acrylic: { name: 'Acrylic / Glass Acrylic', markupFactor: 1.35 },
  veneer: { name: 'Veneer + Melamine Polish', markupFactor: 1.55 },
};

export default function WardrobeCostCalculator() {
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [width, setWidth] = useState<number>(6); // Width of wardrobe in feet
  const [height, setHeight] = useState<number>(7); // Height of wardrobe in feet (default 7ft)
  
  // Door mechanism
  const [doorType, setDoorType] = useState<'hinged' | 'sliding'>('hinged');

  // Finishes & Accessories
  const [finishKey, setFinishKey] = useState<string>('matteLaminate');
  const [accessoryLevel, setAccessoryLevel] = useState<'basic' | 'premium' | 'ultra'>('premium');

  // Lofts
  const [includeLoft, setIncludeLoft] = useState<boolean>(true);
  const [loftHeight, setLoftHeight] = useState<number>(2); // extra height in feet

  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    wardrobeArea: 0,
    loftArea: 0,
    baseCabinetCost: 0,
    loftCabinetCost: 0,
    finishMarkup: 0,
    accessoryCost: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    // Standard conversion factor for meters
    const lengthMultiplier = unit === 'meters' ? 3.28084 : 1;
    const widthInFt = width * lengthMultiplier;
    const heightInFt = height * lengthMultiplier;
    const loftHeightInFt = includeLoft ? loftHeight * lengthMultiplier : 0;

    // Base rates per sq foot:
    // Hinged wardrobes: ~₹1350/sq ft, Sliding wardrobes: ~₹1800/sq ft (due to sliding track mechanism cost and heavy board structure)
    const baseSqFtRate = doorType === 'hinged' ? 1400 : 1850;

    const wardrobeArea = widthInFt * heightInFt;
    const loftArea = includeLoft ? widthInFt * loftHeightInFt : 0;

    // Base costs
    const baseCabinetCost = wardrobeArea * baseSqFtRate;
    // Loft cabinets are usually cheaper (fewer internal drawers/hangers), costing ~70% of base rate
    const loftCabinetCost = loftArea * baseSqFtRate * 0.75;

    // Finish markup
    const finishPreset = finishPresets[finishKey] || finishPresets.matteLaminate;
    const totalBase = baseCabinetCost + loftCabinetCost;
    const finishMarkup = totalBase * (finishPreset.markupFactor - 1.0);

    // Accessories cost
    // Basic: 0% markup, Premium (profile handle, soft drawers): +12%, Ultra (tie rack, sensor lights): +25%
    let accessoryFactor = 0;
    if (accessoryLevel === 'premium') accessoryFactor = 0.12;
    else if (accessoryLevel === 'ultra') accessoryFactor = 0.25;
    const accessoryCost = totalBase * accessoryFactor;

    const grandTotal = totalBase + finishMarkup + accessoryCost;

    setResults({
      wardrobeArea: Number((wardrobeArea / (unit === 'meters' ? 10.764 : 1)).toFixed(1)),
      loftArea: Number((loftArea / (unit === 'meters' ? 10.764 : 1)).toFixed(1)),
      baseCabinetCost: Math.round(baseCabinetCost),
      loftCabinetCost: Math.round(loftCabinetCost),
      finishMarkup: Math.round(finishMarkup),
      accessoryCost: Math.round(accessoryCost),
      grandTotal: Math.round(grandTotal),
    });
  }, [width, height, doorType, finishKey, accessoryLevel, includeLoft, loftHeight, unit]);

  const copyReport = () => {
    const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';
    const dimUnit = unit === 'feet' ? 'ft' : 'm';
    const activeFinish = finishPresets[finishKey] || finishPresets.matteLaminate;

    const text = `Wardrobe Cost Estimation Report (Toolique)
----------------------------------------
Dimensions        : ${width} x ${height} ${dimUnit} (W x H)
Door Mechanism    : ${doorType.toUpperCase()}
Overhead Loft     : ${includeLoft ? `YES (${loftHeight} ${dimUnit})` : 'NO'}
Exterior Finish   : ${activeFinish.name}
Interior Fittings : ${accessoryLevel.toUpperCase()}
----------------------------------------
Cabinetry Area    : ${results.wardrobeArea} ${areaUnit}
Overhead Loft Area: ${results.loftArea} ${areaUnit}
----------------------------------------
Base Wardrobe Cost: ₹${results.baseCabinetCost.toLocaleString()}
Loft Cabinet Cost : ₹${results.loftCabinetCost.toLocaleString()}
Finish Polish Cost: ₹${results.finishMarkup.toLocaleString()}
Accessories Markup: ₹${results.accessoryCost.toLocaleString()}
----------------------------------------
Grand Total Price : ₹${results.grandTotal.toLocaleString()}
----------------------------------------
Calculated according to standard interior fitting rate indices.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setWidth(6);
    setHeight(7);
    setDoorType('hinged');
    setFinishKey('matteLaminate');
    setAccessoryLevel('premium');
    setIncludeLoft(true);
    setLoftHeight(2);
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
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Wardrobe Specifications</h3>
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

        {/* Main Cabinet Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Wardrobe Width ({dimUnit})
            </label>
            <input
              type="number"
              value={width || ''}
              onChange={(e) => setWidth(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Wardrobe Height ({dimUnit})
            </label>
            <input
              type="number"
              value={height || ''}
              onChange={(e) => setHeight(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Door type */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Door Mechanism
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'hinged', label: 'Hinged Doors (Standard)' },
              { id: 'sliding', label: 'Sliding Doors (Space Saver)' },
            ].map((door) => (
              <button
                key={door.id}
                onClick={() => setDoorType(door.id as any)}
                className={`px-2 py-2 rounded-lg text-xs font-bold border transition ${
                  doorType === door.id
                    ? 'border-pink-500 bg-pink-500/5 text-pink-600 dark:text-pink-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-50 dark:hover:bg-slate-855'
                }`}
              >
                {door.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loft Details */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeLoft"
              checked={includeLoft}
              onChange={(e) => setIncludeLoft(e.target.checked)}
              className="w-4 h-4 rounded border-slate-350 dark:border-slate-805 text-pink-650 focus:ring-pink-500"
            />
            <label htmlFor="includeLoft" className="text-xs font-semibold text-slate-650 dark:text-slate-300 cursor-pointer">
              Include Overhead Loft (Storage till Ceiling)
            </label>
          </div>

          {includeLoft && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Loft Height ({dimUnit})
              </label>
              <input
                type="number"
                value={loftHeight || ''}
                onChange={(e) => setLoftHeight(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full max-w-[200px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Finishing & Interior Fittings */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Exterior Finish & Laminate
            </label>
            <select
              value={finishKey}
              onChange={(e) => setFinishKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-pink-500 focus:outline-none"
            >
              {Object.entries(finishPresets).map(([key, value]) => (
                <option key={key} value={key} className="dark:bg-slate-900">
                  {value.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Interior Accessories Tier
            </label>
            <select
              value={accessoryLevel}
              onChange={(e) => setAccessoryLevel(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-pink-500 focus:outline-none"
            >
              <option value="basic" className="dark:bg-slate-900">Basic (Shelves + Hanger Rod)</option>
              <option value="premium" className="dark:bg-slate-900">Premium (Drawers + LED Sensor)</option>
              <option value="ultra" className="dark:bg-slate-900">Ultra (Glass Drawer + Pullouts)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Wardrobe Cost Quote
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
              <span className="text-xs font-semibold text-slate-400">Estimated Total Cost</span>
              <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                ₹{results.grandTotal.toLocaleString()}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Base Cabinet Area Cost</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.baseCabinetCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Overhead Loft Area Cost</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.loftCabinetCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Finish Polish Markup</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.finishMarkup.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Interior Fittings & Lights</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.accessoryCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Estimate utilizes standard ISI-grade commercial ply. Sliding wardrobes have sliding runner profiles which require a minimum 22-inch depth for optimal drawer clearances.
          </p>
        </div>
      </div>
    </div>
  );
}
