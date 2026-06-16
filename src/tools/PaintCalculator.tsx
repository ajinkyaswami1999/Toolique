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

    // Paint required = (Net Paint Area / Coverage per Liter for 1 coat) * Coats
    // If coveragePerLiter is configured for 2 coats (as standard in presets), adjust math:
    // If user changes numCoats, scale coverage rate accordingly
    // Let's assume coveragePerLiter is for single coat (Standard single coat coverage: 350 sq ft / 32 sq m)
    // Actually, let's treat coveragePerLiter as single coat coverage and multiply/divide properly:
    // Standard coverage for single coat: 200 sq ft/liter.
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

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Room & Paint details</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
              <button
                onClick={() => setUnit('feet')}
                className={`px-2 py-1 rounded-md transition ${unit === 'feet' ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
              >
                Feet
              </button>
              <button
                onClick={() => setUnit('meters')}
                className={`px-2 py-1 rounded-md transition ${unit === 'meters' ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
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

        {/* Room Dimensions */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Length ({dimUnit})
            </label>
            <input
              type="number"
              value={length || ''}
              onChange={(e) => setLength(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Width ({dimUnit})
            </label>
            <input
              type="number"
              value={width || ''}
              onChange={(e) => setWidth(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Height ({dimUnit})
            </label>
            <input
              type="number"
              value={height || ''}
              onChange={(e) => setHeight(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Coats and Ceiling */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeCeiling"
              checked={includeCeiling}
              onChange={(e) => setIncludeCeiling(e.target.checked)}
              className="w-4 h-4 rounded border-slate-350 dark:border-slate-800 text-violet-600 focus:ring-violet-500"
            />
            <label htmlFor="includeCeiling" className="text-xs font-semibold text-slate-650 dark:text-slate-300 cursor-pointer">
              Paint Ceiling / Roof Area
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Coats:</span>
            <select
              value={numCoats}
              onChange={(e) => setNumCoats(parseInt(e.target.value) || 1)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-250 focus:outline-none"
            >
              <option value={1} className="dark:bg-slate-900">1 Coat</option>
              <option value={2} className="dark:bg-slate-900">2 Coats</option>
              <option value={3} className="dark:bg-slate-900">3 Coats</option>
            </select>
          </div>
        </div>

        {/* Deductions */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Doors Count
            </label>
            <input
              type="number"
              value={numDoors || ''}
              onChange={(e) => setNumDoors(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-violet-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Windows Count
            </label>
            <input
              type="number"
              value={numWindows || ''}
              onChange={(e) => setNumWindows(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Paint quality preset */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Paint Coverage & Quality Slabs
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['premium', 'standard', 'economy', 'custom'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => setCoveragePreset(preset)}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold border capitalize transition ${
                  coveragePreset === preset
                    ? 'border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-855'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Coverage Parameters */}
        {coveragePreset === 'custom' && (
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Coverage per Liter / Coat ({areaUnit})
              </label>
              <input
                type="number"
                value={coveragePerLiter || ''}
                onChange={(e) => setCoveragePerLiter(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
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
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Paint Volume Estimation
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
              <span className="text-xs font-semibold text-slate-400">Total Paint Required</span>
              <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {results.paintRequired.toLocaleString()} Liters
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Based on {numCoats} coat(s) at coverage {coveragePerLiter} {areaUnit}/liter.
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Gross Paint Area</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {(results.grossWallArea + results.ceilingArea).toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium font-mono">Door/Window Deductions</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  {results.deductions.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Net Paint Area</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.netPaintArea.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-850 pt-2.5">
                <span className="text-slate-400 font-medium">Estimated Material Cost</span>
                <span className="font-extrabold text-violet-650 dark:text-violet-400 font-mono">
                  ₹{results.totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Estimated coverage depends on wall roughness and paint thickness. Premium emulsions yield higher coverage per liter than economic distempers.
          </p>
        </div>
      </div>
    </div>
  );
}
