import { useState, useEffect } from 'react';
import { Compass, Copy, Check, RotateCcw } from 'lucide-react';

export default function PaintCalculator() {
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [length, setLength] = useState<number>(15);
  const [width, setWidth] = useState<number>(12);
  const [height, setHeight] = useState<number>(10);
  const [includeCeiling, setIncludeCeiling] = useState<boolean>(true);
  const [numCoats, setNumCoats] = useState<number>(2);

  // Door/Window deductions
  const [numDoors, setNumDoors] = useState<number>(1);
  const [numWindows, setNumWindows] = useState<number>(2);

  // Coverage & Cost
  const [coveragePreset, setCoveragePreset] = useState<'premium' | 'standard' | 'economy' | 'custom'>('standard');
  const [coveragePerLiter, setCoveragePerLiter] = useState<number>(120); // sq ft per liter for 2 coats
  const [pricePerLiter, setPricePerLiter] = useState<number>(350); // INR
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    grossWallArea: 0,
    ceilingArea: 0,
    deductions: 0,
    netPaintArea: 0,
    paintRequired: 0,
    totalCost: 0,
  });

  // Adjust coverage preset
  useEffect(() => {
    if (coveragePreset === 'premium') {
      setCoveragePerLiter(unit === 'feet' ? 140 : 13);
      setPricePerLiter(550);
    } else if (coveragePreset === 'standard') {
      setCoveragePerLiter(unit === 'feet' ? 100 : 9);
      setPricePerLiter(350);
    } else if (coveragePreset === 'economy') {
      setCoveragePerLiter(unit === 'feet' ? 80 : 7.5);
      setPricePerLiter(220);
    }
  }, [coveragePreset, unit]);

  useEffect(() => {
    // Wall surface area = 2 * (L + W) * H
    const grossWallArea = 2 * (length + width) * height;
    const ceilingArea = includeCeiling ? length * width : 0;

    // Standard deductions in sq ft or sq m
    let doorArea = 0;
    let windowArea = 0;

    if (unit === 'feet') {
      doorArea = 21; // 3ft x 7ft
      windowArea = 16; // 4ft x 4ft
    } else {
      doorArea = 1.89; // 0.9m x 2.1m
      windowArea = 1.44; // 1.2m x 1.2m
    }

    const deductions = numDoors * doorArea + numWindows * windowArea;
    const grossTotal = grossWallArea + ceilingArea;
    const netPaintArea = Math.max(0, grossTotal - deductions);

    const coveragePerCoat = coveragePerLiter; 
    const paintRequired = (netPaintArea / (coveragePerCoat || 1)) * numCoats;
    const totalCost = paintRequired * pricePerLiter;

    setResults({
      grossWallArea: Number(grossWallArea.toFixed(1)),
      ceilingArea: Number(ceilingArea.toFixed(1)),
      deductions: Number(deductions.toFixed(1)),
      netPaintArea: Number(netPaintArea.toFixed(1)),
      paintRequired: Number(paintRequired.toFixed(2)),
      totalCost: Math.round(totalCost),
    });
  }, [length, width, height, includeCeiling, numCoats, numDoors, numWindows, coveragePerLiter, pricePerLiter, unit]);

  const copyReport = () => {
    const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';
    const dimUnit = unit === 'feet' ? 'ft' : 'm';

    const text = `Paint Estimation Report (Toolique)
----------------------------------------
Dimensions        : ${length} x ${width} x ${height} ${dimUnit} (L x W x H)
Include Ceiling   : ${includeCeiling ? 'YES' : 'NO'}
Number of Coats   : ${numCoats}
Deductions        : ${numDoors} Doors, ${numWindows} Windows
----------------------------------------
Gross Surface Area: ${(results.grossWallArea + results.ceilingArea).toLocaleString()} ${areaUnit}
Deductions Area   : ${results.deductions.toLocaleString()} ${areaUnit}
Net Paintable Area: ${results.netPaintArea.toLocaleString()} ${areaUnit}
Coverage / Lit / Ct: ${coveragePerLiter} ${areaUnit}
Paint Required    : ${results.paintRequired} Liters
Estimated Cost    : ₹${results.totalCost.toLocaleString()}
----------------------------------------
Calculated based on standard industrial coverage metrics.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setLength(15);
    setWidth(12);
    setHeight(10);
    setIncludeCeiling(true);
    setNumCoats(2);
    setNumDoors(1);
    setNumWindows(2);
    setCoveragePreset('standard');
    setPricePerLiter(350);
  };

  const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';
  const dimUnit = unit === 'feet' ? 'ft' : 'm';

  // Compute paint can sizes optimal distribution
  const computePaintCans = (liters: number) => {
    let rem = liters;
    const c20 = Math.floor(rem / 20);
    rem %= 20;
    const c10 = Math.floor(rem / 10);
    rem %= 10;
    const c4 = Math.floor(rem / 4);
    rem %= 4;
    const c1 = Math.ceil(rem);
    return { c20, c10, c4, c1 };
  };

  const cans = computePaintCans(results.paintRequired);

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-7 p-6 saas-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-805 dark:text-white text-sm">Room & Paint details</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-[10px] font-bold">
              <button
                onClick={() => setUnit('feet')}
                className={`px-2 py-1 rounded-md transition-all duration-200 ${unit === 'feet' ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-indigo-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-650'}`}
              >
                Feet
              </button>
              <button
                onClick={() => setUnit('meters')}
                className={`px-2 py-1 rounded-md transition-all duration-200 ${unit === 'meters' ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-indigo-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-650'}`}
              >
                Meters
              </button>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-655 dark:hover:text-zinc-200 transition"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Room Dimensions */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
              Length ({dimUnit})
            </label>
            <input
              type="number"
              value={length || ''}
              onChange={(e) => setLength(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
              Width ({dimUnit})
            </label>
            <input
              type="number"
              value={width || ''}
              onChange={(e) => setWidth(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
              Height ({dimUnit})
            </label>
            <input
              type="number"
              value={height || ''}
              onChange={(e) => setHeight(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Coats and Ceiling */}
        <div className="flex items-center justify-between border-t border-zinc-150 dark:border-zinc-800/60 pt-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeCeiling"
              checked={includeCeiling}
              onChange={(e) => setIncludeCeiling(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="includeCeiling" className="text-xs font-semibold text-zinc-650 dark:text-zinc-300 cursor-pointer select-none">
              Paint Ceiling / Roof Area
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">Coats:</span>
            <select
              value={numCoats}
              onChange={(e) => setNumCoats(parseInt(e.target.value) || 1)}
              className="px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-250 focus:outline-none"
            >
              <option value={1}>1 Coat</option>
              <option value={2}>2 Coats</option>
              <option value={3}>3 Coats</option>
            </select>
          </div>
        </div>

        {/* Deductions */}
        <div className="grid grid-cols-2 gap-4 border-t border-zinc-150 dark:border-zinc-800/60 pt-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
              Doors Count
            </label>
            <input
              type="number"
              value={numDoors || ''}
              onChange={(e) => setNumDoors(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
              Windows Count
            </label>
            <input
              type="number"
              value={numWindows || ''}
              onChange={(e) => setNumWindows(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Paint quality preset */}
        <div className="border-t border-zinc-150 dark:border-zinc-800/60 pt-4">
          <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
            Paint Quality Preset
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['premium', 'standard', 'economy', 'custom'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setCoveragePreset(preset)}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold border capitalize transition-all duration-200 ${
                  coveragePreset === preset
                    ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Coverage Parameters */}
        {coveragePreset === 'custom' && (
          <div className="grid grid-cols-2 gap-4 border-t border-zinc-150 dark:border-zinc-800/60 pt-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-550 mb-1.5">
                Coverage per Liter ({areaUnit})
              </label>
              <input
                type="number"
                value={coveragePerLiter || ''}
                onChange={(e) => setCoveragePerLiter(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-550 mb-1.5">
                Price per Liter (₹)
              </label>
              <input
                type="number"
                value={pricePerLiter || ''}
                onChange={(e) => setPricePerLiter(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 saas-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
              Paint Volume Estimation
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
              <span className="text-xs font-semibold text-zinc-400">Total Paint Required</span>
              <div className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white mt-0.5 font-mono">
                {results.paintRequired.toLocaleString()} Liters
              </div>
              <p className="text-[10px] text-zinc-450 mt-1 font-semibold">
                Based on {numCoats} coat(s) at coverage {coveragePerLiter} {areaUnit}/liter.
              </p>
            </div>

            <div className="border-t border-zinc-150 dark:border-zinc-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium font-semibold">Gross Paint Area</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                  {(results.grossWallArea + results.ceilingArea).toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Door/Window Deductions</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                  {results.deductions.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium font-semibold">Net Paint Area</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                  {results.netPaintArea.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-zinc-150 dark:border-zinc-800 pt-2.5 pb-2 border-b border-zinc-150 dark:border-zinc-800">
                <span className="text-zinc-400 font-semibold">Estimated Paint Cost</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                  ₹{results.totalCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Packaging splits visualizer */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">
                Required Paint Can splits
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800">
                  <div className="text-indigo-550 font-black font-mono text-xs">{cans.c20}</div>
                  <div className="text-[9px] text-zinc-400 uppercase mt-0.5">20 L</div>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800">
                  <div className="text-indigo-550 font-black font-mono text-xs">{cans.c10}</div>
                  <div className="text-[9px] text-zinc-400 uppercase mt-0.5">10 L</div>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800">
                  <div className="text-indigo-550 font-black font-mono text-xs">{cans.c4}</div>
                  <div className="text-[9px] text-zinc-400 uppercase mt-0.5">4 L</div>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800">
                  <div className="text-indigo-550 font-black font-mono text-xs">{cans.c1}</div>
                  <div className="text-[9px] text-zinc-400 uppercase mt-0.5">1 L</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-zinc-150 dark:border-zinc-800/60 text-[10px] text-zinc-450 dark:text-zinc-550 leading-relaxed">
          <p>
            Estimated coverage depends on wall roughness and paint thickness. Premium emulsions yield higher coverage per liter than economic distempers.
          </p>
        </div>
      </div>
    </div>
  );
}
