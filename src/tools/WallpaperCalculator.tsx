import { useState, useEffect } from 'react';
import { Compass, Copy, Check, RotateCcw } from 'lucide-react';

export default function WallpaperCalculator() {
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [wallWidth, setWallWidth] = useState<number>(15); // Width of the wall
  const [wallHeight, setWallHeight] = useState<number>(10); // Height of the wall
  const [rollPreset, setRollPreset] = useState<'standard' | 'large' | 'custom'>('standard');
  const [rollLength, setRollLength] = useState<number>(33); // feet
  const [rollWidth, setRollWidth] = useState<number>(21); // inches
  const [patternRepeat, setPatternRepeat] = useState<number>(12); // inches (0 for solid/no repeat)
  const [pricePerRoll, setPricePerRoll] = useState<number>(1500); // INR
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    wallArea: 0,
    rollArea: 0,
    netRolls: 0,
    wastePercentage: 0,
    totalRolls: 0,
    totalCost: 0,
  });

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
    const totalCost = totalRolls * pricePerRoll;

    setResults({
      wallArea: Number(wallArea.toFixed(2)),
      rollArea: Number(rollArea.toFixed(2)),
      netRolls: Number(netRolls.toFixed(2)),
      wastePercentage,
      totalRolls,
      totalCost,
    });
  }, [wallWidth, wallHeight, rollLength, rollWidth, patternRepeat, pricePerRoll, unit]);

  const copyReport = () => {
    const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';
    const dimUnit = unit === 'feet' ? 'ft' : 'm';
    const rollDimUnit = unit === 'feet' ? 'in/ft' : 'cm/m';

    const text = `Wallpaper Calculator Report (Toolique)
----------------------------------------
Wall Dimensions   : ${wallWidth} x ${wallHeight} ${dimUnit} = ${results.wallArea} ${areaUnit}
Roll Specification: ${rollLength} x ${rollWidth} ${rollDimUnit} Preset: ${rollPreset.toUpperCase()}
Pattern Repeat    : ${patternRepeat} ${unit === 'feet' ? 'inches' : 'cm'}
Price Per Roll    : ₹${pricePerRoll}
----------------------------------------
Net Rolls Needed  : ${results.netRolls}
Wastage Allowance : ${results.wastePercentage}%
Total Rolls Req   : ${results.totalRolls}
Estimated Cost    : ₹${results.totalCost.toLocaleString()}
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
    setPricePerRoll(1500);
  };

  const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';
  const dimUnit = unit === 'feet' ? 'ft' : 'm';
  const widthUnitLabel = unit === 'feet' ? 'inches' : 'cm';
  const lengthUnitLabel = unit === 'feet' ? 'feet' : 'meters';

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Wall & Wallpaper Details</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
              <button
                onClick={() => {
                  setUnit('feet');
                  setRollPreset('standard');
                }}
                className={`px-2 py-1 rounded-md transition ${unit === 'feet' ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
              >
                Feet/Inches
              </button>
              <button
                onClick={() => {
                  setUnit('meters');
                  setRollPreset('standard');
                }}
                className={`px-2 py-1 rounded-md transition ${unit === 'meters' ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
              >
                Meters/cm
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

        {/* Wall Dimensions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Wall Width ({dimUnit})
            </label>
            <input
              type="number"
              value={wallWidth || ''}
              onChange={(e) => setWallWidth(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Wall Height ({dimUnit})
            </label>
            <input
              type="number"
              value={wallHeight || ''}
              onChange={(e) => setWallHeight(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Roll Size Preset */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Wallpaper Roll Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setRollPreset('standard')}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition ${
                rollPreset === 'standard'
                  ? 'border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-855'
              }`}
            >
              Standard Roll
            </button>
            <button
              onClick={() => setRollPreset('large')}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition ${
                rollPreset === 'large'
                  ? 'border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-855'
              }`}
            >
              Large Roll
            </button>
            <button
              onClick={() => setRollPreset('custom')}
              className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition ${
                rollPreset === 'custom'
                  ? 'border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-855'
              }`}
            >
              Custom Size
            </button>
          </div>
        </div>

        {/* Custom roll fields */}
        {rollPreset === 'custom' && (
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Roll Length ({lengthUnitLabel})
              </label>
              <input
                type="number"
                value={rollLength || ''}
                onChange={(e) => setRollLength(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Roll Width ({widthUnitLabel})
              </label>
              <input
                type="number"
                value={rollWidth || ''}
                onChange={(e) => setRollWidth(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Pattern Repeat / Price */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Pattern Repeat ({widthUnitLabel})
            </label>
            <input
              type="number"
              value={patternRepeat || ''}
              onChange={(e) => setPatternRepeat(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-violet-500 focus:outline-none"
            />
            <p className="text-[9px] text-slate-400 mt-1">Set to 0 if wallpaper is a solid color/no pattern.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Price per Roll (₹)
            </label>
            <input
              type="number"
              value={pricePerRoll || ''}
              onChange={(e) => setPricePerRoll(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Wallpaper Roll Count
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
              <span className="text-xs font-semibold text-slate-400">Total Rolls Required</span>
              <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {results.totalRolls} Rolls
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Net: {results.netRolls} rolls. Added {results.wastePercentage}% pattern wastage buffer.
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Wall Area</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.wallArea.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Roll Coverage Area</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.rollArea.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-850 pt-2.5">
                <span className="text-slate-400 font-medium">Estimated Purchase Cost</span>
                <span className="font-extrabold text-violet-650 dark:text-violet-400 font-mono">
                  ₹{results.totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            A standard wallpaper roll is typically 33 feet (10m) long and 21 inches (53cm) wide, covering approximately 57 sq ft (5.3 sq m).
          </p>
        </div>
      </div>
    </div>
  );
}
