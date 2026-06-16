import { useState, useEffect } from 'react';
import { Palette, Copy, Check, RotateCcw } from 'lucide-react';

interface MaterialPreset {
  name: string;
  materialCost: number; // per sq ft
  laborCost: number; // per sq ft
}

const presets: Record<string, MaterialPreset> = {
  ceramic: { name: 'Ceramic Tiles', materialCost: 50, laborCost: 20 },
  vitrified: { name: 'Vitrified Tiles', materialCost: 80, laborCost: 25 },
  marbleIndian: { name: 'Indian Marble (incl. Polish)', materialCost: 150, laborCost: 75 },
  marbleItalian: { name: 'Italian Marble (incl. Polish)', materialCost: 450, laborCost: 150 },
  granite: { name: 'Granite Flooring', materialCost: 180, laborCost: 60 },
  hardwood: { name: 'Hardwood Flooring', materialCost: 350, laborCost: 50 },
  laminate: { name: 'Laminate Wooden Flooring', materialCost: 100, laborCost: 25 },
  custom: { name: 'Custom Material', materialCost: 100, laborCost: 30 },
};

export default function FlooringCostCalculator() {
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [floorArea, setFloorArea] = useState<number>(500);
  const [materialKey, setMaterialKey] = useState<string>('vitrified');
  const [customMaterialRate, setCustomMaterialRate] = useState<number>(100);
  const [customLaborRate, setCustomLaborRate] = useState<number>(30);
  const [wastage, setWastage] = useState<number>(8); // %
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    materialCostTotal: 0,
    laborCostTotal: 0,
    wastageArea: 0,
    wastageCost: 0,
    grossArea: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    const isCustom = materialKey === 'custom';
    const matPreset = presets[materialKey] || presets.vitrified;

    // Determine rates based on selection
    const matRate = isCustom ? customMaterialRate : matPreset.materialCost;
    const labRate = isCustom ? customLaborRate : matPreset.laborCost;

    // Scale rate if using metric (sq meters instead of sq feet)
    // 1 sq meter = 10.764 sq feet
    const multiplier = unit === 'meters' ? 10.764 : 1;
    const finalMatRate = matRate * multiplier;
    const finalLabRate = labRate * multiplier;

    const netArea = floorArea;
    const wastageArea = netArea * (wastage / 100);
    const grossArea = netArea + wastageArea;

    const materialCostTotal = grossArea * finalMatRate;
    const laborCostTotal = netArea * finalLabRate; // Labor usually charged on actual area laid
    const wastageCost = wastageArea * finalMatRate;
    const grandTotal = materialCostTotal + laborCostTotal;

    setResults({
      materialCostTotal: Math.round(materialCostTotal),
      laborCostTotal: Math.round(laborCostTotal),
      wastageArea: Number(wastageArea.toFixed(1)),
      wastageCost: Math.round(wastageCost),
      grossArea: Number(grossArea.toFixed(1)),
      grandTotal: Math.round(grandTotal),
    });
  }, [floorArea, materialKey, customMaterialRate, customLaborRate, wastage, unit]);

  const copyReport = () => {
    const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';
    const activePreset = presets[materialKey] || presets.vitrified;

    const text = `Flooring Project Estimation Report (Toolique)
----------------------------------------
Floor Area        : ${floorArea.toLocaleString()} ${areaUnit}
Material Choice   : ${activePreset.name}
Wastage Buffer    : ${wastage}%
----------------------------------------
Gross Area (Mat)  : ${results.grossArea.toLocaleString()} ${areaUnit}
Wastage Area (Mat): ${results.wastageArea.toLocaleString()} ${areaUnit}
----------------------------------------
Material Cost     : ₹${results.materialCostTotal.toLocaleString()}
Labor & Polish    : ₹${results.laborCostTotal.toLocaleString()}
Wastage Cost Component: ₹${results.wastageCost.toLocaleString()}
----------------------------------------
Grand Total       : ₹${results.grandTotal.toLocaleString()}
----------------------------------------
Project cost estimation calculated u/s current market base rates.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFloorArea(500);
    setMaterialKey('vitrified');
    setCustomMaterialRate(100);
    setCustomLaborRate(30);
    setWastage(8);
  };

  const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <Palette className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Flooring Materials</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
              <button
                onClick={() => setUnit('feet')}
                className={`px-2 py-1 rounded-md transition ${unit === 'feet' ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-sm' : 'text-slate-400'}`}
              >
                Sq Ft
              </button>
              <button
                onClick={() => setUnit('meters')}
                className={`px-2 py-1 rounded-md transition ${unit === 'meters' ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-sm' : 'text-slate-400'}`}
              >
                Sq M
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

        {/* Floor Area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Floor Area ({areaUnit})
            </label>
            <input
              type="number"
              value={floorArea || ''}
              onChange={(e) => setFloorArea(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Wastage Buffer (%)
            </label>
            <input
              type="number"
              value={wastage || ''}
              onChange={(e) => setWastage(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Material Presets Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            Select Flooring Material
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(presets).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setMaterialKey(key)}
                className={`px-2 py-2 rounded-xl text-left border transition ${
                  materialKey === key
                    ? 'border-pink-500 bg-pink-500/5 text-pink-600 dark:text-pink-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="text-xs font-bold truncate">{value.name}</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Mat: ₹{value.materialCost}/sq ft
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom fields if custom selected */}
        {materialKey === 'custom' && (
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Material Rate (₹ / sq ft)
              </label>
              <input
                type="number"
                value={customMaterialRate || ''}
                onChange={(e) => setCustomMaterialRate(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Labor & Polish Rate (₹ / sq ft)
              </label>
              <input
                type="number"
                value={customLaborRate || ''}
                onChange={(e) => setCustomLaborRate(Math.max(0, parseInt(e.target.value) || 0))}
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
              Estimated Project Cost
            </span>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400">Total Project Cost</span>
              <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                ₹{results.grandTotal.toLocaleString()}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Material Cost</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  ₹{results.materialCostTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium font-mono">Labor & Polish Cost</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.laborCostTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Wastage Buffer Area</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.wastageArea.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Wastage Cost Value</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono text-rose-500">
                  ₹{results.wastageCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            * **Rates scale dynamically** if you toggle units.
            * Materials like Italian Marble require high labor charges for professional diamond polishing (typically ₹100-150/sq ft).
          </p>
        </div>
      </div>
    </div>
  );
}
