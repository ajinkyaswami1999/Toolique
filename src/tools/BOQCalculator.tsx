import { useState, useEffect } from 'react';
import { Layers, Copy, Check, RotateCcw } from 'lucide-react';

const prices = {
  cement: 420,    // per bag
  sand: 65,       // per cu ft
  aggregate: 70,  // per cu ft
  steel: 68,      // per kg
  bricks: 9,      // per brick
};

export default function BOQCalculator() {
  const [area, setArea] = useState<number>(1200);
  const [floors, setFloors] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const [materials, setMaterials] = useState({
    cementBags: 0,
    cementCost: 0,
    sandCuft: 0,
    sandCost: 0,
    aggregateCuft: 0,
    aggregateCost: 0,
    steelKg: 0,
    steelCost: 0,
    bricksCount: 0,
    bricksCost: 0,
    totalEstimatedCost: 0,
  });

  useEffect(() => {
    const totalBuiltArea = area * floors;

    // Rules of thumb for standard residential RCC construction u/s Indian conditions
    const cementBags = totalBuiltArea * 0.4;
    const sandCuft = totalBuiltArea * 1.8;
    const aggregateCuft = totalBuiltArea * 1.35;
    const steelKg = totalBuiltArea * 4.0;
    const bricksCount = totalBuiltArea * 1.4 * 8; // approx 8 bricks per sq ft wall area multiplier

    const cementCost = cementBags * prices.cement;
    const sandCost = sandCuft * prices.sand;
    const aggregateCost = aggregateCuft * prices.aggregate;
    const steelCost = steelKg * prices.steel;
    const bricksCost = bricksCount * prices.bricks;

    const totalCost = cementCost + sandCost + aggregateCost + steelCost + bricksCost;

    setMaterials({
      cementBags: Math.round(cementBags),
      cementCost: Math.round(cementCost),
      sandCuft: Math.round(sandCuft),
      sandCost: Math.round(sandCost),
      aggregateCuft: Math.round(aggregateCuft),
      aggregateCost: Math.round(aggregateCost),
      steelKg: Math.round(steelKg),
      steelCost: Math.round(steelCost),
      bricksCount: Math.round(bricksCount),
      bricksCost: Math.round(bricksCost),
      totalEstimatedCost: Math.round(totalCost),
    });
  }, [area, floors]);

  const copyReport = () => {
    const text = `Bill of Quantities (BOQ) Estimate (Toolique)
----------------------------------------
Total Built-up Area: ${(area * floors).toLocaleString()} sq ft (${floors} Floor/s)
----------------------------------------
Cement     : ${materials.cementBags.toLocaleString()} Bags - ₹${materials.cementCost.toLocaleString('en-IN')}
Sand       : ${materials.sandCuft.toLocaleString()} Cu Ft - ₹${materials.sandCost.toLocaleString('en-IN')}
Aggregate  : ${materials.aggregateCuft.toLocaleString()} Cu Ft - ₹${materials.aggregateCost.toLocaleString('en-IN')}
Steel      : ${materials.steelKg.toLocaleString()} Kg - ₹${materials.steelCost.toLocaleString('en-IN')}
Bricks     : ${materials.bricksCount.toLocaleString()} Pcs - ₹${materials.bricksCost.toLocaleString('en-IN')}
----------------------------------------
Total Material Cost: ₹${materials.totalEstimatedCost.toLocaleString('en-IN')}
----------------------------------------
Calculated using residential RCC construction standard norms.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setArea(1200);
    setFloors(1);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Structure Parameters</h3>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-650 dark:hover:text-slate-200 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Plot Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Plot Area / Floor Area (Sq Ft)
          </label>
          <input
            type="number"
            min="100"
            value={area || ''}
            onChange={(e) => setArea(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-750 dark:text-slate-200 font-semibold focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Number of Floors */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Number of Floors (G + N)
          </label>
          <select
            value={floors}
            onChange={(e) => setFloors(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-750 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
          >
            {[1, 2, 3, 4, 5].map((f) => (
              <option key={f} value={f}>
                {f === 1 ? '1 Floor (Ground Only)' : `${f} Floors`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Estimated BOQ Materials
            </span>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Cement */}
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-750 dark:text-slate-200 block">Cement</span>
                <span className="text-[10px] text-slate-400">@ ₹{prices.cement}/bag</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{materials.cementBags.toLocaleString()} Bags</span>
                <span className="block font-black text-slate-900 dark:text-white font-mono mt-0.5">₹{materials.cementCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Sand */}
            <div className="flex justify-between items-center text-xs border-t border-slate-50 dark:border-slate-850 pt-2.5">
              <div>
                <span className="font-bold text-slate-750 dark:text-slate-200 block">Sand</span>
                <span className="text-[10px] text-slate-400">@ ₹{prices.sand}/cu ft</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{materials.sandCuft.toLocaleString()} Cu Ft</span>
                <span className="block font-black text-slate-900 dark:text-white font-mono mt-0.5">₹{materials.sandCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Aggregate */}
            <div className="flex justify-between items-center text-xs border-t border-slate-50 dark:border-slate-850 pt-2.5">
              <div>
                <span className="font-bold text-slate-750 dark:text-slate-200 block">Aggregate</span>
                <span className="text-[10px] text-slate-400">@ ₹{prices.aggregate}/cu ft</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{materials.aggregateCuft.toLocaleString()} Cu Ft</span>
                <span className="block font-black text-slate-900 dark:text-white font-mono mt-0.5">₹{materials.aggregateCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Steel */}
            <div className="flex justify-between items-center text-xs border-t border-slate-50 dark:border-slate-850 pt-2.5">
              <div>
                <span className="font-bold text-slate-750 dark:text-slate-200 block">Steel</span>
                <span className="text-[10px] text-slate-400">@ ₹{prices.steel}/kg</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{materials.steelKg.toLocaleString()} Kg</span>
                <span className="block font-black text-slate-900 dark:text-white font-mono mt-0.5">₹{materials.steelCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Bricks */}
            <div className="flex justify-between items-center text-xs border-t border-slate-50 dark:border-slate-850 pt-2.5">
              <div>
                <span className="font-bold text-slate-750 dark:text-slate-200 block">Bricks</span>
                <span className="text-[10px] text-slate-400">@ ₹{prices.bricks}/pcs</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{materials.bricksCount.toLocaleString()} Pcs</span>
                <span className="block font-black text-slate-900 dark:text-white font-mono mt-0.5">₹{materials.bricksCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Material Cost</span>
              <span className="text-lg md:text-xl font-black text-teal-650 dark:text-teal-400 font-mono">
                ₹{materials.totalEstimatedCost.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
