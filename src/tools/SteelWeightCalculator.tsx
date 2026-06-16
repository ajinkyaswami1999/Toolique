import { useState, useEffect } from 'react';
import { Ruler, Copy, Check, RotateCcw } from 'lucide-react';

export default function SteelWeightCalculator() {
  const [shape, setShape] = useState<string>('tmt');
  const [length, setLength] = useState<number>(12); // standard length of a TMT bar is 12m or 40ft
  const [unit, setUnit] = useState<'m' | 'ft'>('m');
  const [count, setCount] = useState<number>(10);
  const [copied, setCopied] = useState<boolean>(false);

  // Shape specific dimensions
  const [diameter, setDiameter] = useState<number>(12); // mm for TMT/Round
  const [width, setWidth] = useState<number>(50);       // mm for Flat/Angle/Channel
  const [thickness, setThickness] = useState<number>(6); // mm for Flat/Angle/Channel

  const [results, setResults] = useState({
    weightPerMeter: 0,
    totalWeight: 0,
  });

  useEffect(() => {
    let lenMeters = length;
    if (unit === 'ft') {
      lenMeters = length * 0.3048;
    }

    let wPerM = 0;

    if (shape === 'tmt' || shape === 'round') {
      // Standard TMT/Round bar formula: D^2 / 162
      wPerM = (diameter * diameter) / 162.2;
    } else if (shape === 'flat') {
      // Flat bar weight = Width * Thickness * Density (7.85g/cm3 or 7850kg/m3) / 10^6
      // Formula: W(mm) * T(mm) * 0.00785
      wPerM = width * thickness * 0.00785;
    } else if (shape === 'angle') {
      // Angle bar formula u/s average leg: (2 * Leg - Thickness) * Thickness * 0.00785
      wPerM = (2 * width - thickness) * thickness * 0.00785;
    } else if (shape === 'channel') {
      // Channel bar formula (approx u/s flanges): (Web + 2 * Flange - 2 * Thickness) * Thickness * 0.00785
      // width represents web, and thickness represents structural thickness. Flange is assumed to be 50% of web
      const flange = width * 0.5;
      wPerM = (width + 2 * flange - 2 * thickness) * thickness * 0.00785;
    }

    const totalWeight = wPerM * lenMeters * count;

    setResults({
      weightPerMeter: Number(wPerM.toFixed(4)),
      totalWeight: Number(totalWeight.toFixed(2)),
    });
  }, [shape, length, unit, count, diameter, width, thickness]);

  const copyReport = () => {
    const text = `Steel Weight Calculation (Toolique)
----------------------------------------
Section Type : ${shape.toUpperCase()}
Quantity     : ${count} Pcs
Length/Pc    : ${length} ${unit}
Dimensions   : ${shape === 'tmt' || shape === 'round' ? `Diameter: ${diameter} mm` : `Width: ${width} mm, Thickness: ${thickness} mm`}
----------------------------------------
Weight/Meter : ${results.weightPerMeter} kg/m
Total Weight : ${results.totalWeight.toLocaleString()} kg
----------------------------------------
Calculated using standard structural steel density parameters.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setShape('tmt');
    setLength(12);
    setUnit('m');
    setCount(10);
    setDiameter(12);
    setWidth(50);
    setThickness(6);
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
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Steel Section Parameters</h3>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-650 dark:hover:text-slate-200 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Section Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Section Type</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { id: 'tmt', name: 'TMT Bar' },
              { id: 'round', name: 'Round Bar' },
              { id: 'flat', name: 'Flat Bar' },
              { id: 'angle', name: 'Angle' },
              { id: 'channel', name: 'Channel' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setShape(s.id)}
                className={`py-2 px-1 rounded-xl border text-[11px] font-bold text-center transition ${
                  shape === s.id
                    ? 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-950/20 dark:border-teal-900/60 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Dimensions based on shape selection */}
        <div className="grid grid-cols-2 gap-4">
          {(shape === 'tmt' || shape === 'round') ? (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Bar Diameter (mm)
              </label>
              <select
                value={diameter}
                onChange={(e) => setDiameter(parseInt(e.target.value) || 12)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
              >
                {[6, 8, 10, 12, 16, 20, 25, 28, 32, 36, 40].map((d) => (
                  <option key={d} value={d}>
                    {d} mm
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-455 mb-1.5">
                  Width / Leg Size (mm)
                </label>
                <input
                  type="number"
                  value={width || ''}
                  onChange={(e) => setWidth(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-455 mb-1.5">
                  Thickness (mm)
                </label>
                <input
                  type="number"
                  value={thickness || ''}
                  onChange={(e) => setThickness(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Unit of Length
            </label>
            <div className="flex rounded-xl bg-slate-50 dark:bg-slate-950/40 p-1 border border-slate-200/60 dark:border-zinc-800">
              <button
                onClick={() => setUnit('m')}
                className={`flex-grow py-1.5 rounded-lg text-xs font-bold transition ${
                  unit === 'm'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Meter (m)
              </button>
              <button
                onClick={() => setUnit('ft')}
                className={`flex-grow py-1.5 rounded-lg text-xs font-bold transition ${
                  unit === 'ft'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Feet (ft)
              </button>
            </div>
          </div>
        </div>

        {/* Length & Count */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-405 mb-1.5">
              Length (per piece)
            </label>
            <input
              type="number"
              value={length || ''}
              onChange={(e) => setLength(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-405 mb-1.5">
              Quantity / Pieces
            </label>
            <input
              type="number"
              value={count || ''}
              onChange={(e) => setCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Weight Outputs
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
              <span className="text-xs font-semibold text-slate-400">Total Steel Weight</span>
              <div className="text-2xl md:text-3xl font-black text-teal-650 dark:text-teal-400 mt-1 leading-tight font-mono">
                {results.totalWeight.toLocaleString()} kg
              </div>
              <span className="text-[10px] text-slate-400 font-semibold mt-1.5 block">
                = {(results.totalWeight / 1000).toFixed(3)} Tonnes (MT)
              </span>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Weight per Meter</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  {results.weightPerMeter} kg/m
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Weight per Pc</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  {Number((results.weightPerMeter * (unit === 'ft' ? length * 0.3048 : length)).toFixed(3))} kg
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Total Running Length</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  {length * count} {unit}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Weight estimates assume a standardized density of steel at 7,850 kg/m³ (0.00785 g/mm³) u/s BIS/IS codes.
          </p>
        </div>
      </div>
    </div>
  );
}
