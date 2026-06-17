import { useState, useEffect } from 'react';
import { Compass, Copy, Check, RotateCcw } from 'lucide-react';
import { getStoredArchRates, saveStoredArchRates, DEFAULT_ARCH_RATES } from '../data/civilRatesData';
import MaterialTrendGraph from '../components/MaterialTrendGraph';

export default function WallpaperCalculator() {
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [wallWidth, setWallWidth] = useState<number>(15); // Width of the wall
  const [wallHeight, setWallHeight] = useState<number>(10); // Height of the wall
  const [rollPreset, setRollPreset] = useState<'standard' | 'large' | 'custom'>('standard');
  const [rollLength, setRollLength] = useState<number>(33); // feet
  const [rollWidth, setRollWidth] = useState<number>(21); // inches
  const [patternRepeat, setPatternRepeat] = useState<number>(12); // inches (0 for solid/no repeat)
  const [copied, setCopied] = useState<boolean>(false);
  const [prices, setPrices] = useState(getStoredArchRates());

  const [results, setResults] = useState({
    wallArea: 0,
    rollArea: 0,
    netRolls: 0,
    wastePercentage: 0,
    totalRolls: 0,
    materialCost: 0,
    laborCost: 0,
    totalCost: 0,
  });

  // Sync rates via storage
  useEffect(() => {
    const handleStorage = () => {
      setPrices(getStoredArchRates());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Manage Presets
  useEffect(() => {
    if (unit === 'feet') {
      if (rollPreset === 'standard') {
        setRollLength(33); // 33 feet
        setRollWidth(21); // 21 inches
        setPatternRepeat(12); // 12 inches
      } else if (rollPreset === 'large') {
        setRollLength(33); // 33 feet
        setRollWidth(41); // 41 inches
        setPatternRepeat(18); // 18 inches
      }
    } else {
      // Metric
      if (rollPreset === 'standard') {
        setRollLength(10); // 10 meters
        setRollWidth(53); // 53 cm
        setPatternRepeat(30); // 30 cm
      } else if (rollPreset === 'large') {
        setRollLength(10); // 10 meters
        setRollWidth(106); // 106 cm
        setPatternRepeat(45); // 45 cm
      }
    }
  }, [rollPreset, unit]);

  useEffect(() => {
    const wallArea = wallWidth * wallHeight; // sq ft or sq m
    let rollArea = 0; // sq ft or sq m
    let repeatWasteFactor = 0;

    if (unit === 'feet') {
      // rollLength is in feet, rollWidth is in inches
      rollArea = (rollLength * rollWidth) / 12; // sq ft
      // Pattern repeat waste: standard estimate
      repeatWasteFactor = patternRepeat > 0 ? (patternRepeat / 12) * 0.15 : 0.08;
    } else {
      // rollLength is in meters, rollWidth is in cm
      rollArea = (rollLength * rollWidth) / 100; // sq m
      repeatWasteFactor = patternRepeat > 0 ? (patternRepeat / 100) * 0.15 : 0.08;
    }

    if (rollArea <= 0 || wallArea <= 0) return;

    const netRolls = wallArea / rollArea;
    // Gross rolls required incorporates the waste factor for patterns
    const totalRolls = Math.ceil(netRolls * (1 + repeatWasteFactor));
    const wastePercentage = Math.round(repeatWasteFactor * 100);

    // Calculate costs
    const rollPrice = prices.wallpaper || DEFAULT_ARCH_RATES.wallpaper;
    const laborPrice = prices.wallpaperLabor || DEFAULT_ARCH_RATES.wallpaperLabor;
    const materialCost = totalRolls * rollPrice;
    const laborCost = totalRolls * laborPrice;
    const totalCost = materialCost + laborCost;

    setResults({
      wallArea: Number(wallArea.toFixed(2)),
      rollArea: Number(rollArea.toFixed(2)),
      netRolls: Number(netRolls.toFixed(2)),
      wastePercentage,
      totalRolls,
      materialCost: Math.round(materialCost),
      laborCost: Math.round(laborCost),
      totalCost: Math.round(totalCost),
    });
  }, [wallWidth, wallHeight, rollLength, rollWidth, patternRepeat, prices, unit]);

  const handlePriceChange = (key: keyof typeof DEFAULT_ARCH_RATES, val: number) => {
    const updatedPrices = { ...prices, [key]: val };
    setPrices(updatedPrices);
    saveStoredArchRates({ [key]: val });
  };

  const copyReport = () => {
    const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';
    const dimUnit = unit === 'feet' ? 'ft' : 'm';
    const rollDimUnit = unit === 'feet' ? 'in/ft' : 'cm/m';

    const text = `Wallpaper & Cost Calculator Report (Toolique)
----------------------------------------
Wall Dimensions   : ${wallWidth} x ${wallHeight} ${dimUnit} = ${results.wallArea} ${areaUnit}
Roll Specification: ${rollLength} x ${rollWidth} ${rollDimUnit} Preset: ${rollPreset.toUpperCase()}
Pattern Repeat    : ${patternRepeat} ${unit === 'feet' ? 'inches' : 'cm'}
----------------------------------------
Net Rolls Needed  : ${results.netRolls}
Wastage Allowance : ${results.wastePercentage}%
Total Rolls Req   : ${results.totalRolls}
----------------------------------------
Wallpaper Rolls   : ₹${results.materialCost.toLocaleString('en-IN')} (at ₹${prices.wallpaper}/roll)
Hanging Labor     : ₹${results.laborCost.toLocaleString('en-IN')} (at ₹${prices.wallpaperLabor}/roll)
Total Cost        : ₹${results.totalCost.toLocaleString('en-IN')}
----------------------------------------
Calculated based on standard wall pattern alignment norms.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setWallWidth(15);
    setWallHeight(10);
    setRollPreset('standard');
    const defaults = DEFAULT_ARCH_RATES;
    setPrices(defaults);
    saveStoredArchRates(defaults);
  };

  const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';
  const dimUnit = unit === 'feet' ? 'ft' : 'm';
  const widthUnitLabel = unit === 'feet' ? 'inches' : 'cm';
  const lengthUnitLabel = unit === 'feet' ? 'feet' : 'meters';

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-850 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-655 dark:text-violet-400">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-zinc-808 dark:text-white text-sm">Wall & Wallpaper Details</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-xs font-bold border border-zinc-200/40 dark:border-zinc-700/60">
                <button
                  onClick={() => {
                    setUnit('feet');
                    setRollPreset('standard');
                  }}
                  className={`px-2 py-1 rounded-md transition ${unit === 'feet' ? 'bg-white dark:bg-zinc-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Feet
                </button>
                <button
                  onClick={() => {
                    setUnit('meters');
                    setRollPreset('standard');
                  }}
                  className={`px-2 py-1 rounded-md transition ${unit === 'meters' ? 'bg-white dark:bg-zinc-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Meters
                </button>
              </div>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-650 dark:hover:text-zinc-200 transition"
                title="Reset Parameters & Rates"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Wall Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Wall Width ({dimUnit})
              </label>
              <input
                type="number"
                value={wallWidth || ''}
                onChange={(e) => setWallWidth(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Wall Height ({dimUnit})
              </label>
              <input
                type="number"
                value={wallHeight || ''}
                onChange={(e) => setWallHeight(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input"
              />
            </div>
          </div>

          {/* Roll Size Preset */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Wallpaper Roll Size Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRollPreset('standard')}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition ${
                  rollPreset === 'standard'
                    ? 'border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400'
                    : 'border-zinc-200 dark:border-zinc-805 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                Standard Roll
              </button>
              <button
                onClick={() => setRollPreset('large')}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition ${
                  rollPreset === 'large'
                    ? 'border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400'
                    : 'border-zinc-200 dark:border-zinc-850 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                Large Roll
              </button>
              <button
                onClick={() => setRollPreset('custom')}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition ${
                  rollPreset === 'custom'
                    ? 'border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400'
                    : 'border-zinc-200 dark:border-zinc-850 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                Custom Size
              </button>
            </div>
          </div>

          {/* Custom roll fields */}
          {rollPreset === 'custom' && (
            <div className="grid grid-cols-2 gap-4 border-t border-zinc-150 dark:border-zinc-850 pt-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-550 mb-1.5">
                  Roll Length ({lengthUnitLabel})
                </label>
                <input
                  type="number"
                  value={rollLength || ''}
                  onChange={(e) => setRollLength(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-550 mb-1.5">
                  Roll Width ({widthUnitLabel})
                </label>
                <input
                  type="number"
                  value={rollWidth || ''}
                  onChange={(e) => setRollWidth(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input"
                />
              </div>
            </div>
          )}

          {/* Pattern Repeat */}
          <div className="border-t border-zinc-150 dark:border-zinc-850 pt-4">
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Pattern Repeat Offset ({widthUnitLabel})
            </label>
            <input
              type="number"
              value={patternRepeat || ''}
              onChange={(e) => setPatternRepeat(Math.max(0, parseFloat(e.target.value) || 0))}
              className="saas-input"
            />
            <p className="text-[9px] text-zinc-450 dark:text-zinc-500 mt-1">Set to 0 if wallpaper is a solid color/no pattern.</p>
          </div>

          {/* Editable Wallpaper Rates */}
          <div className="border-t border-zinc-150 dark:border-zinc-850 pt-4 mt-3">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">Edit Unit Rates (₹)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-450 dark:text-zinc-500 mb-1">Wallpaper Price (₹ / roll)</label>
                <input
                  type="number"
                  value={prices.wallpaper}
                  onChange={(e) => handlePriceChange('wallpaper', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input py-2 font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-450 dark:text-zinc-500 mb-1">Hanging Labor (₹ / roll)</label>
                <input
                  type="number"
                  value={prices.wallpaperLabor}
                  onChange={(e) => handlePriceChange('wallpaperLabor', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input py-2 font-mono font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">
                Required Rolls & Cost
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-zinc-400">Total Wallpaper Budget</span>
                <div className="text-2xl md:text-3xl font-black text-violet-650 dark:text-violet-400 mt-1 leading-tight font-mono">
                  ₹{results.totalCost.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="border-t border-zinc-150 dark:border-zinc-805 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-zinc-400 font-medium block">Wallpaper Rolls</span>
                    <span className="text-[10px] text-zinc-450 font-mono">{results.totalRolls} Rolls @ ₹{prices.wallpaper}/roll</span>
                  </div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                    ₹{results.materialCost.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-zinc-50 dark:border-zinc-850 pt-2">
                  <div>
                    <span className="text-zinc-455 font-medium block">Hanging Labor</span>
                    <span className="text-[10px] text-zinc-450 font-mono">{results.totalRolls} Rolls @ ₹{prices.wallpaperLabor}/roll</span>
                  </div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                    ₹{results.laborCost.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-zinc-50 dark:border-zinc-850 pt-2 pb-2">
                  <span className="text-zinc-450 font-medium">Wall Area</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                    {results.wallArea.toLocaleString()} {areaUnit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-150 dark:border-zinc-800/60 text-[10px] text-zinc-450 dark:text-zinc-550 leading-relaxed">
            <p>
              A standard wallpaper roll covers approximately 57 sq ft. Wastage calculations accommodate standard repeats.
            </p>
          </div>
        </div>
      </div>

      {/* SVG Trend Graph spanning full width */}
      <MaterialTrendGraph allowedMaterials={['wallpaper', 'fitoutCost']} />
    </div>
  );
}
