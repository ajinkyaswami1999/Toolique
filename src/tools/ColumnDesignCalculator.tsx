import { useState, useEffect } from 'react';
import { Ruler, Copy, Check, RotateCcw } from 'lucide-react';

export default function ColumnDesignCalculator() {
  const [width, setWidth] = useState<number>(12); // inches
  const [depth, setDepth] = useState<number>(12); // inches
  const [height, setHeight] = useState<number>(10); // feet
  const [rebarsCount, setRebarsCount] = useState<number>(4);
  const [rebarsSize, setRebarsSize] = useState<number>(16); // mm
  const [stirrupSize, setStirrupSize] = useState<number>(8); // mm
  const [stirrupSpacing, setStirrupSpacing] = useState<number>(6); // inches
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    concreteVol: 0,
    mainSteelKg: 0,
    stirrupSteelKg: 0,
    totalSteelKg: 0,
    shutteringSqm: 0,
  });

  useEffect(() => {
    // 1. Convert dimensions to meters
    const wM = width * 0.0254;
    const dM = depth * 0.0254;
    const hM = height * 0.3048;

    // 2. Concrete Volume
    const concreteVol = wM * dM * hM;

    // 3. Main Rebars Steel Weight
    // Each bar length = column height + standard hook/lap expansion (~0.5m lap length per bar)
    const barLength = hM + 0.5;
    const mainWeightPerM = (rebarsSize * rebarsSize) / 162.2;
    const mainSteelKg = rebarsCount * barLength * mainWeightPerM;

    // 4. Stirrups (Ties) Calculation
    // Total stirrups count = (Height / Spacing) + 1
    const spacingM = stirrupSpacing * 0.0254;
    const stirrupCount = Math.floor(hM / spacingM) + 1;
    // Length of single stirrup = Perimeter of column - concrete cover (assume 40mm on each of 4 sides)
    const coverM = 0.04; // 40mm
    const stirrupLength = 2 * (wM - 2 * coverM) + 2 * (dM - 2 * coverM) + 0.15; // +15cm hooks
    const stirrupWeightPerM = (stirrupSize * stirrupSize) / 162.2;
    const stirrupSteelKg = stirrupCount * stirrupLength * stirrupWeightPerM;

    // 5. Shuttering Area (Perimeter * Height)
    const shutteringSqm = 2 * (wM + dM) * hM;

    setResults({
      concreteVol: Number(concreteVol.toFixed(3)),
      mainSteelKg: Math.round(mainSteelKg),
      stirrupSteelKg: Math.round(stirrupSteelKg),
      totalSteelKg: Math.round(mainSteelKg + stirrupSteelKg),
      shutteringSqm: Number(shutteringSqm.toFixed(1)),
    });
  }, [width, depth, height, rebarsCount, rebarsSize, stirrupSize, stirrupSpacing]);

  const copyReport = () => {
    const text = `Column Structural Estimate (Toolique)
----------------------------------------
Dimensions : ${width}" x ${depth}" (Height: ${height} ft)
Main Rebar : ${rebarsCount} Nos u/s ${rebarsSize} mm
Stirrups   : ${stirrupSize} mm u/s ${stirrupSpacing}" spacing
----------------------------------------
Concrete   : ${results.concreteVol} m³
Main Steel : ${results.mainSteelKg} kg
Stirrups   : ${results.stirrupSteelKg} kg
Total Steel: ${results.totalSteelKg} kg
Shuttering : ${results.shutteringSqm} m²
----------------------------------------
Estimated u/s standard IS-456 reinforcement concrete limits.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setWidth(12);
    setDepth(12);
    setHeight(10);
    setRebarsCount(4);
    setRebarsSize(16);
    setStirrupSize(8);
    setStirrupSpacing(6);
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
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Column Specifications</h3>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-855 hover:text-slate-650 dark:hover:text-slate-200 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Column Dimensions */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-405 mb-1.5">
              Width (inches)
            </label>
            <input
              type="number"
              value={width || ''}
              onChange={(e) => setWidth(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-405 mb-1.5">
              Depth (inches)
            </label>
            <input
              type="number"
              value={depth || ''}
              onChange={(e) => setDepth(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-405 mb-1.5">
              Height (feet)
            </label>
            <input
              type="number"
              value={height || ''}
              onChange={(e) => setHeight(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Main Rebars */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Main Rebars Quantity
            </label>
            <select
              value={rebarsCount}
              onChange={(e) => setRebarsCount(parseInt(e.target.value) || 4)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              {[4, 6, 8, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n} Bars
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Main Rebar Size
            </label>
            <select
              value={rebarsSize}
              onChange={(e) => setRebarsSize(parseInt(e.target.value) || 16)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              {[12, 16, 20, 25, 32].map((s) => (
                <option key={s} value={s}>
                  {s} mm
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stirrups Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Stirrup Bar Size
            </label>
            <select
              value={stirrupSize}
              onChange={(e) => setStirrupSize(parseInt(e.target.value) || 8)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              {[8, 10, 12].map((s) => (
                <option key={s} value={s}>
                  {s} mm
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Stirrup Spacing (inches)
            </label>
            <input
              type="number"
              value={stirrupSpacing || ''}
              onChange={(e) => setStirrupSpacing(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Required Column Materials
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
              <span className="text-xs font-semibold text-slate-400">Concrete Volume Required</span>
              <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {results.concreteVol} m³
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Main Rebar Steel</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  {results.mainSteelKg} kg
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Stirrups (Ties) Steel</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  {results.stirrupSteelKg} kg
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Total Steel Weight</span>
                <span className="font-black text-slate-850 dark:text-white font-mono">
                  {results.totalSteelKg} kg
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-50 dark:border-slate-850 pt-2.5">
                <span className="text-slate-400 font-medium">Shuttering Area</span>
                <span className="font-bold text-teal-650 dark:text-teal-400 font-mono">
                  {results.shutteringSqm} m²
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Main rebars calculate hook overlap allowance. Stirrups length assumes a standard 40mm concrete cover protection u/s code rules.
          </p>
        </div>
      </div>
    </div>
  );
}
