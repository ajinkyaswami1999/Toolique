import { useState, useEffect } from 'react';
import { Ruler, Copy, Check, RotateCcw } from 'lucide-react';

const rates = {
  concrete: 6200, // per cu m (including delivery)
  steel: 68,     // per kg
};

export default function SlabCalculator() {
  const [length, setLength] = useState<number>(30);
  const [width, setWidth] = useState<number>(20);
  const [thickness, setThickness] = useState<number>(5); // inches
  const [steelRatio, setSteelRatio] = useState<number>(1.0); // % of concrete volume
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    concreteVol: 0,
    steelKg: 0,
    concreteCost: 0,
    steelCost: 0,
    totalCost: 0,
  });

  useEffect(() => {
    // Convert dimensions to meters
    const lM = length * 0.3048;
    const wM = width * 0.3048;
    const tM = (thickness / 12) * 0.3048;

    // Concrete volume in m3
    const concreteVol = lM * wM * tM;

    // Steel Weight = Concrete Volume * Ratio % * Density (7850 kg/m3)
    const steelVol = concreteVol * (steelRatio / 100);
    const steelKg = steelVol * 7850;

    const concreteCost = concreteVol * rates.concrete;
    const steelCost = steelKg * rates.steel;
    const totalCost = concreteCost + steelCost;

    setResults({
      concreteVol: Number(concreteVol.toFixed(2)),
      steelKg: Math.round(steelKg),
      concreteCost: Math.round(concreteCost),
      steelCost: Math.round(steelCost),
      totalCost: Math.round(totalCost),
    });
  }, [length, width, thickness, steelRatio]);

  const copyReport = () => {
    const text = `Slab Construction Estimate (Toolique)
----------------------------------------
Slab Size    : ${length} ft x ${width} ft (Thickness: ${thickness}")
Steel Ratio  : ${steelRatio}% of volume
----------------------------------------
Concrete Vol : ${results.concreteVol} m³
Steel Weight : ${results.steelKg.toLocaleString()} kg
----------------------------------------
Concrete Cost: ₹${results.concreteCost.toLocaleString('en-IN')}
Steel Cost   : ₹${results.steelCost.toLocaleString('en-IN')}
Total Cost   : ₹${results.totalCost.toLocaleString('en-IN')}
----------------------------------------
Estimated using standard M20/M25 concrete & structural steel pricing.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setLength(30);
    setWidth(20);
    setThickness(5);
    setSteelRatio(1.0);
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
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Slab Dimensions</h3>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-855 hover:text-slate-650 dark:hover:text-slate-200 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Slab Area */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-405 mb-1.5">
              Length (ft)
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
              Width (ft)
            </label>
            <input
              type="number"
              value={width || ''}
              onChange={(e) => setWidth(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-405 mb-1.5">
              Thickness (inches)
            </label>
            <select
              value={thickness}
              onChange={(e) => setThickness(parseFloat(e.target.value) || 5)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              {[4, 4.5, 5, 5.5, 6, 7, 8].map((t) => (
                <option key={t} value={t}>
                  {t} inches
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Steel Reinforcement Ratio */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Steel Reinforcement Ratio (% of concrete volume)
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="3"
            value={steelRatio || ''}
            onChange={(e) => setSteelRatio(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Slab Estimates
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
              <span className="text-xs font-semibold text-slate-400">Total Slab Cost</span>
              <div className="text-2xl md:text-3xl font-black text-teal-650 dark:text-teal-400 mt-1 leading-tight font-mono">
                ₹{results.totalCost.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Concrete Volume</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  {results.concreteVol} m³ (~₹{results.concreteCost.toLocaleString('en-IN')})
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Steel Reinforcement</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  {results.steelKg.toLocaleString()} kg (~₹{results.steelCost.toLocaleString('en-IN')})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Estimates include standard construction materials. Excludes local contractor shuttering labor fees, staging supports, and finishing works.
          </p>
        </div>
      </div>
    </div>
  );
}
