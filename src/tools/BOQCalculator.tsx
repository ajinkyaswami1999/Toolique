import { useState, useEffect } from 'react';
import { Layers, Copy, Check, RotateCcw } from 'lucide-react';
import { getStoredRates, saveStoredRates, DEFAULT_CIVIL_RATES } from '../data/civilRatesData';
import MaterialTrendGraph from '../components/MaterialTrendGraph';

export default function BOQCalculator() {
  const [area, setArea] = useState<number>(1200);
  const [floors, setFloors] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [prices, setPrices] = useState(getStoredRates());

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

  // Listen for storage events to sync rates across calculators in real-time
  useEffect(() => {
    const handleStorage = () => {
      setPrices(getStoredRates());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const totalBuiltArea = area * floors;

    // Rules of thumb for standard residential RCC construction u/s Indian conditions
    const cementBags = totalBuiltArea * 0.4;
    const sandCuft = totalBuiltArea * 1.8;
    const aggregateCuft = totalBuiltArea * 1.35;
    const steelKg = totalBuiltArea * 4.0;
    const bricksCount = totalBuiltArea * 1.4 * 8; // approx 8 bricks per sq ft wall area multiplier

    const cementCost = cementBags * (prices.cement || DEFAULT_CIVIL_RATES.cement);
    const sandCost = sandCuft * (prices.sand || DEFAULT_CIVIL_RATES.sand);
    const aggregateCost = aggregateCuft * (prices.aggregate || DEFAULT_CIVIL_RATES.aggregate);
    const steelCost = steelKg * (prices.steel || DEFAULT_CIVIL_RATES.steel);
    const bricksCost = bricksCount * (prices.bricks || DEFAULT_CIVIL_RATES.bricks);

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
  }, [area, floors, prices]);

  const handlePriceChange = (key: keyof typeof DEFAULT_CIVIL_RATES, val: number) => {
    const updatedPrices = { ...prices, [key]: val };
    setPrices(updatedPrices);
    saveStoredRates({ [key]: val });
  };

  const copyReport = () => {
    const text = `Bill of Quantities (BOQ) Estimate (Toolique)
----------------------------------------
Total Built-up Area: ${(area * floors).toLocaleString()} sq ft (${floors} Floor/s)
----------------------------------------
Cement     : ${materials.cementBags.toLocaleString()} Bags - ₹${materials.cementCost.toLocaleString('en-IN')} (at ₹${prices.cement}/bag)
Sand       : ${materials.sandCuft.toLocaleString()} Cu Ft - ₹${materials.sandCost.toLocaleString('en-IN')} (at ₹${prices.sand}/cu ft)
Aggregate  : ${materials.aggregateCuft.toLocaleString()} Cu Ft - ₹${materials.aggregateCost.toLocaleString('en-IN')} (at ₹${prices.aggregate}/cu ft)
Steel      : ${materials.steelKg.toLocaleString()} Kg - ₹${materials.steelCost.toLocaleString('en-IN')} (at ₹${prices.steel}/kg)
Bricks     : ${materials.bricksCount.toLocaleString()} Pcs - ₹${materials.bricksCost.toLocaleString('en-IN')} (at ₹${prices.bricks}/pcs)
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
    const defaults = DEFAULT_CIVIL_RATES;
    setPrices(defaults);
    saveStoredRates(defaults);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800/80 shadow-sm space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-650 dark:text-teal-400">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-zinc-800 dark:text-white text-sm">Structure Parameters</h3>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-650 dark:hover:text-zinc-200 transition"
              title="Reset Parameters & Price Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Plot Area */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Plot Area / Floor Area (Sq Ft)
            </label>
            <input
              type="number"
              min="100"
              value={area || ''}
              onChange={(e) => setArea(Math.max(0, parseInt(e.target.value) || 0))}
              className="saas-input font-semibold"
            />
          </div>

          {/* Number of Floors */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Number of Floors (G + N)
            </label>
            <select
              value={floors}
              onChange={(e) => setFloors(parseInt(e.target.value) || 1)}
              className="saas-select font-semibold"
            >
              {[1, 2, 3, 4, 5].map((f) => (
                <option key={f} value={f}>
                  {f === 1 ? '1 Floor (Ground Only)' : `${f} Floors`}
                </option>
              ))}
            </select>
          </div>

          {/* Editable Material Rates */}
          <div className="border-t border-zinc-100 dark:border-zinc-850 pt-4">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3">
              Edit Unit Rates (₹)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Cement (per bag)</label>
                <input
                  type="number"
                  value={prices.cement}
                  onChange={(e) => handlePriceChange('cement', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input py-2 font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Steel (per kg)</label>
                <input
                  type="number"
                  value={prices.steel}
                  onChange={(e) => handlePriceChange('steel', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input py-2 font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Sand (per cu ft)</label>
                <input
                  type="number"
                  value={prices.sand}
                  onChange={(e) => handlePriceChange('sand', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input py-2 font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Aggregate (per cu ft)</label>
                <input
                  type="number"
                  value={prices.aggregate}
                  onChange={(e) => handlePriceChange('aggregate', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input py-2 font-mono font-semibold"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Bricks (per piece)</label>
                <input
                  type="number"
                  value={prices.bricks}
                  onChange={(e) => handlePriceChange('bricks', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input py-2 font-mono font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                Estimated BOQ Materials
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-650 hover:bg-teal-700 text-white text-[11px] font-bold transition shadow-sm active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Cement */}
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Cement</span>
                  <span className="text-[10px] text-zinc-400">@ ₹{prices.cement}/bag</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">{materials.cementBags.toLocaleString()} Bags</span>
                  <span className="block font-black text-zinc-800 dark:text-white font-mono mt-0.5">₹{materials.cementCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Sand */}
              <div className="flex justify-between items-center text-xs border-t border-zinc-100 dark:border-zinc-850 pt-2.5">
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Sand</span>
                  <span className="text-[10px] text-zinc-400">@ ₹{prices.sand}/cu ft</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">{materials.sandCuft.toLocaleString()} Cu Ft</span>
                  <span className="block font-black text-zinc-800 dark:text-white font-mono mt-0.5">₹{materials.sandCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Aggregate */}
              <div className="flex justify-between items-center text-xs border-t border-zinc-100 dark:border-zinc-850 pt-2.5">
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Aggregate</span>
                  <span className="text-[10px] text-zinc-400">@ ₹{prices.aggregate}/cu ft</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">{materials.aggregateCuft.toLocaleString()} Cu Ft</span>
                  <span className="block font-black text-zinc-800 dark:text-white font-mono mt-0.5">₹{materials.aggregateCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Steel */}
              <div className="flex justify-between items-center text-xs border-t border-zinc-100 dark:border-zinc-850 pt-2.5">
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Steel</span>
                  <span className="text-[10px] text-zinc-400">@ ₹{prices.steel}/kg</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">{materials.steelKg.toLocaleString()} Kg</span>
                  <span className="block font-black text-zinc-800 dark:text-white font-mono mt-0.5">₹{materials.steelCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Bricks */}
              <div className="flex justify-between items-center text-xs border-t border-zinc-100 dark:border-zinc-850 pt-2.5">
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Bricks</span>
                  <span className="text-[10px] text-zinc-400">@ ₹{prices.bricks}/pcs</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">{materials.bricksCount.toLocaleString()} Pcs</span>
                  <span className="block font-black text-zinc-800 dark:text-white font-mono mt-0.5">₹{materials.bricksCost.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Total Material Cost</span>
                <span className="text-lg md:text-xl font-black text-teal-650 dark:text-teal-400 font-mono">
                  ₹{materials.totalEstimatedCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Trend Graph spanning full width */}
      <MaterialTrendGraph allowedMaterials={['cement', 'steel', 'sand', 'aggregate', 'bricks']} />
    </div>
  );
}
