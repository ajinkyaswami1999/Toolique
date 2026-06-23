import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';

const LUX_PRESETS = [
  { name: 'Bedroom / Restroom (100 Lux)', val: 100 },
  { name: 'Living Room / Dining (150 Lux)', val: 150 },
  { name: 'Kitchen / Retail Shop (250 Lux)', val: 250 },
  { name: 'Office Workspace / Study Room (500 Lux)', val: 500 },
  { name: 'Corridor / Stairs / Warehousing (80 Lux)', val: 80 },
  { name: 'Classroom / Library (300 Lux)', val: 300 },
  { name: 'Custom Target', val: 0 }
];

export default function LEDLightingCalculator() {
  const [length, setLength] = useState<number>(6); // 6 meters default
  const [width, setWidth] = useState<number>(4); // 4 meters default
  const [unit, setUnit] = useState<'meters' | 'feet'>('meters');
  
  const [presetIndex, setPresetIndex] = useState<number>(1); // Living Room by default
  const [targetLux, setTargetLux] = useState<number>(150);
  const [bulbLumens, setBulbLumens] = useState<number>(900); // 900 lm (approx 9W LED) default
  
  const [utilizationFactor, setUtilizationFactor] = useState<number>(0.6); // 0.6 standard
  const [maintenanceFactor, setMaintenanceFactor] = useState<number>(0.8); // 0.8 standard

  // Outputs
  const [areaSqM, setAreaSqM] = useState<number>(0);
  const [areaSqFt, setAreaSqFt] = useState<number>(0);
  const [totalLumens, setTotalLumens] = useState<number>(0);
  const [bulbsCount, setBulbsCount] = useState<number>(0);
  const [gridCols, setGridCols] = useState<number>(0);
  const [gridRows, setGridRows] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // 1. Calculate Areas
    
    const lMtrs = unit === 'feet' ? length * 0.3048 : length;
    const wMtrs = unit === 'feet' ? width * 0.3048 : width;
    const sM2 = lMtrs * wMtrs;
    const sFt2 = sM2 * 10.7639;

    setAreaSqM(sM2);
    setAreaSqFt(sFt2);

    // 2. Calculate Total Lumens Required
    // Formula: Lumens = Lux * Area (m2) / (UF * MF)
    const lumensRequired = (targetLux * sM2) / (utilizationFactor * maintenanceFactor);
    setTotalLumens(isNaN(lumensRequired) || lumensRequired < 0 ? 0 : lumensRequired);

    // 3. Bulbs Count
    const count = Math.ceil(lumensRequired / bulbLumens);
    const validCount = isNaN(count) || count < 0 ? 0 : count;
    setBulbsCount(validCount);

    // 4. Calculate Grid layout spacing (rows x cols)
    if (validCount > 0) {
      const ratio = lMtrs / wMtrs;
      let rows = Math.round(Math.sqrt(validCount * ratio));
      if (rows < 1) rows = 1;
      let cols = Math.ceil(validCount / rows);
      
      setGridRows(rows);
      setGridCols(cols);
    } else {
      setGridRows(0);
      setGridCols(0);
    }

  }, [length, width, unit, targetLux, bulbLumens, utilizationFactor, maintenanceFactor]);

  const handlePresetChange = (idx: number) => {
    setPresetIndex(idx);
    if (idx < LUX_PRESETS.length - 1) {
      setTargetLux(LUX_PRESETS[idx].val);
    }
  };

  const handleCopy = () => {
    const summary = `LED Lighting Calculator Report
--------------------------------------
Room Dimensions: ${length} x ${width} ${unit}
Calculated Floor Area: ${areaSqFt.toFixed(1)} sq ft (${areaSqM.toFixed(1)} m²)
Target Illuminance: ${targetLux} Lux
LED Bulb Luminous Output: ${bulbLumens} lm
--------------------------------------
Total Lumens Required: ${totalLumens.toFixed(0)} lm
Recommended LED Bulbs: ${bulbsCount} bulbs
Suggested Layout: ${gridRows} x ${gridCols} grid (Rows x Columns)`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setLength(6);
    setWidth(4);
    setUnit('meters');
    setPresetIndex(1);
    setTargetLux(150);
    setBulbLumens(900);
    setUtilizationFactor(0.6);
    setMaintenanceFactor(0.8);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Inputs (Left) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Lighting Parameters</h3>
            <button
              onClick={handleReset}
              className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition cursor-pointer"
              title="Reset Parameters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">ROOM LENGTH</label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(Math.max(1, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">ROOM WIDTH</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">DIMENSIONS UNIT</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="saas-select w-full"
              >
                <option value="meters">Meters</option>
                <option value="feet">Feet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">ILLUMINANCE PRESETS</label>
              <select
                value={presetIndex}
                onChange={(e) => handlePresetChange(Number(e.target.value))}
                className="saas-select w-full text-xs font-bold"
              >
                {LUX_PRESETS.map((preset, idx) => (
                  <option key={idx} value={idx}>{preset.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">TARGET ILLUMINANCE (LUX)</label>
              <input
                type="number"
                value={targetLux}
                onChange={(e) => {
                  setPresetIndex(LUX_PRESETS.length - 1); // Custom
                  setTargetLux(Math.max(1, Number(e.target.value)));
                }}
                className="saas-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">BULB LUMEN OUTPUT (lm)</label>
              <input
                type="number"
                value={bulbLumens}
                onChange={(e) => setBulbLumens(Math.max(1, Number(e.target.value)))}
                className="saas-input w-full"
                title="Standard 9W LED is ~800-900 lumens; 12W is ~1100 lumens"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">UTILIZATION FACTOR (UF)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="1.0"
                value={utilizationFactor}
                onChange={(e) => setUtilizationFactor(Math.min(1.0, Math.max(0.1, Number(e.target.value))))}
                className="saas-input w-full"
                title="Represents the ratio of light reaching the work plane (usually 0.5-0.7)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">MAINTENANCE FACTOR (MF)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="1.0"
                value={maintenanceFactor}
                onChange={(e) => setMaintenanceFactor(Math.min(1.0, Math.max(0.1, Number(e.target.value))))}
                className="saas-input w-full"
                title="Accounts for dust/aging depreciation of LED bulbs over time (usually 0.7-0.8)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Outputs (Right) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Lumen Sizing</h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-650 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center py-6 px-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
            <span className="block text-[10px] font-bold text-zinc-400">RECOMMENDED LED FIXTURES</span>
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {bulbsCount} <span className="text-xl">Bulbs</span>
            </span>
            <span className="block text-[10px] text-zinc-400 font-semibold mt-1">
              Suggested grid layout: {gridRows} Rows x {gridCols} Columns
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">TOTAL LUMENS</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100 font-mono">
                {totalLumens.toFixed(0)} lm
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">ROOM FLOOR AREA</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100">
                {areaSqFt.toFixed(0)} <span className="text-xs">sq ft</span>
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs border-t border-zinc-100 dark:border-zinc-850 pt-4">
            <div className="flex justify-between text-zinc-650 dark:text-zinc-400">
              <span>Room Area (in Metres):</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {areaSqM.toFixed(1)} m²
              </span>
            </div>
            <div className="flex justify-between text-zinc-650 dark:text-zinc-400">
              <span>Required Illuminance:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {targetLux} Lux (lm/m²)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
