import { useState, useEffect } from 'react';
import { Ruler, Copy, Check, RotateCcw } from 'lucide-react';
import { getStoredRates, saveStoredRates, DEFAULT_CIVIL_RATES } from '../data/civilRatesData';
import MaterialTrendGraph from '../components/MaterialTrendGraph';

const densitySteel = 7850; // kg per cubic meter

const defaultsByMember: Record<string, { steelPercent: number; shutteringFactor: number }> = {
  slab: { steelPercent: 1.0, shutteringFactor: 11.5 },   // 11.5 sq m shuttering u/s cubic meter concrete
  beam: { steelPercent: 1.8, shutteringFactor: 12.0 },   // beams have 3 exposed sides
  column: { steelPercent: 2.5, shutteringFactor: 13.5 }, // columns have 4 sides
  footing: { steelPercent: 0.8, shutteringFactor: 4.5 },  // footings require less shuttering
};

export default function RCCCalculator() {
  const [member, setMember] = useState<string>('slab');
  const [volume, setVolume] = useState<number>(15);
  const [unit, setUnit] = useState<'m3' | 'ft3'>('m3');
  const [steelRatio, setSteelRatio] = useState<number>(1.0);
  const [wastage, setWastage] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);
  const [prices, setPrices] = useState(getStoredRates());

  const [results, setResults] = useState({
    concreteQty: 0,
    steelKg: 0,
    shutteringSqft: 0,
    shutteringSqm: 0,
    concreteCost: 0,
    steelCost: 0,
    shutteringCost: 0,
    totalCost: 0,
  });

  // Sync rates via storage
  useEffect(() => {
    const handleStorage = () => {
      setPrices(getStoredRates());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Adjust defaults when member changes
  useEffect(() => {
    const def = defaultsByMember[member];
    if (def) {
      setSteelRatio(def.steelPercent);
    }
  }, [member]);

  useEffect(() => {
    let volM3 = volume;
    if (unit === 'ft3') {
      volM3 = volume * 0.0283168; // convert cu ft to cu m
    }

    const concreteQty = volM3 * (1 + wastage / 100);

    // Steel Weight = Concrete Volume * Steel Ratio % * Density of Steel
    const steelVol = volM3 * (steelRatio / 100);
    const steelKg = steelVol * densitySteel;

    // Estimated Shuttering Area (rule of thumb factor per cubic meter of concrete)
    const factor = defaultsByMember[member]?.shutteringFactor || 10;
    const shutteringSqm = volM3 * factor;
    const shutteringSqft = shutteringSqm * 10.7639;

    const roundedConcrete = Number(concreteQty.toFixed(2));
    const roundedSteel = Math.round(steelKg);
    const roundedShutteringSqft = Math.round(shutteringSqft);

    // Calculate Costs
    const concreteCost = roundedConcrete * (prices.concreteMix || DEFAULT_CIVIL_RATES.concreteMix);
    const steelCost = roundedSteel * (prices.steel || DEFAULT_CIVIL_RATES.steel);
    const shutteringCost = roundedShutteringSqft * (prices.shuttering || DEFAULT_CIVIL_RATES.shuttering);
    const totalCost = concreteCost + steelCost + shutteringCost;

    setResults({
      concreteQty: roundedConcrete,
      steelKg: roundedSteel,
      shutteringSqm: Number(shutteringSqm.toFixed(1)),
      shutteringSqft: roundedShutteringSqft,
      concreteCost: Math.round(concreteCost),
      steelCost: Math.round(steelCost),
      shutteringCost: Math.round(shutteringCost),
      totalCost: Math.round(totalCost),
    });
  }, [member, volume, unit, steelRatio, wastage, prices]);

  const handlePriceChange = (key: keyof typeof DEFAULT_CIVIL_RATES, val: number) => {
    const updatedPrices = { ...prices, [key]: val };
    setPrices(updatedPrices);
    saveStoredRates({ [key]: val });
  };

  const copyReport = () => {
    const text = `RCC Structural & Cost Estimate (Toolique)
----------------------------------------
Member Type : ${member.toUpperCase()}
Concrete Vol: ${volume} ${unit === 'm3' ? 'm³' : 'cu ft'}
Steel Ratio : ${steelRatio}%
Wastage     : ${wastage}%
----------------------------------------
Concrete Qty: ${results.concreteQty} m³ - ₹${results.concreteCost.toLocaleString('en-IN')} (at ₹${prices.concreteMix}/m³)
Steel Weight: ${results.steelKg.toLocaleString()} Kg - ₹${results.steelCost.toLocaleString('en-IN')} (at ₹${prices.steel}/kg)
Shuttering  : ${results.shutteringSqft.toLocaleString()} Sq Ft - ₹${results.shutteringCost.toLocaleString('en-IN')} (at ₹${prices.shuttering}/sq ft)
----------------------------------------
Total Cost  : ₹${results.totalCost.toLocaleString('en-IN')}
----------------------------------------
Estimated u/s standard Indian structural rules of thumb.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setMember('slab');
    setVolume(15);
    setUnit('m3');
    setWastage(5);
    const defaults = DEFAULT_CIVIL_RATES;
    setPrices(defaults);
    saveStoredRates(defaults);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Ruler className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-zinc-800 dark:text-white text-sm">RCC Specifications</h3>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-650 dark:hover:text-zinc-200 transition"
              title="Reset Parameters & Rates"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Member Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Structural Member Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.keys(defaultsByMember).map((m) => (
                <button
                  key={m}
                  onClick={() => setMember(m)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition ${
                    member === m
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-650 dark:text-indigo-400'
                      : 'border-zinc-250 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Volume Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-405 mb-1.5">
                Concrete Volume
              </label>
              <input
                type="number"
                value={volume || ''}
                onChange={(e) => setVolume(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
                Volume Unit
              </label>
              <div className="flex rounded-xl bg-zinc-55 dark:bg-zinc-950/40 p-1 border border-zinc-200/60 dark:border-zinc-800">
                <button
                  onClick={() => setUnit('m3')}
                  className={`flex-grow py-1.5 rounded-lg text-xs font-bold transition ${
                    unit === 'm3'
                      ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                      : 'text-zinc-450 dark:text-zinc-500'
                  }`}
                >
                  Cubic Meter (m³)
                </button>
                <button
                  onClick={() => setUnit('ft3')}
                  className={`flex-grow py-1.5 rounded-lg text-xs font-bold transition ${
                    unit === 'ft3'
                      ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-sm'
                      : 'text-zinc-450 dark:text-zinc-500'
                  }`}
                >
                  Cubic Feet (cu ft)
                </button>
              </div>
            </div>
          </div>

          {/* Steel Ratio & Wastage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1">
                Steel Ratio (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={steelRatio || ''}
                onChange={(e) => setSteelRatio(Math.max(0, parseFloat(e.target.value) || 0))}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1">
                Concrete Wastage (%)
              </label>
              <input
                type="number"
                value={wastage || ''}
                onChange={(e) => setWastage(Math.max(0, parseInt(e.target.value) || 0))}
                className="saas-input"
              />
            </div>
          </div>

          {/* Editable Material Rates */}
          <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4 mt-3">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">Edit Unit Rates (₹)</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] font-semibold text-zinc-450 dark:text-zinc-500 mb-1">Concrete (per m³)</label>
                <input
                  type="number"
                  value={prices.concreteMix}
                  onChange={(e) => handlePriceChange('concreteMix', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input py-1.5 px-2 text-xs font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold text-zinc-455 dark:text-zinc-500 mb-1">Steel (per kg)</label>
                <input
                  type="number"
                  value={prices.steel}
                  onChange={(e) => handlePriceChange('steel', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input py-1.5 px-2 text-xs font-mono font-semibold"
                />
              </div>
              <div>
                <label className="block text-[9px] font-semibold text-zinc-450 dark:text-zinc-500 mb-1">Shuttering (per sq ft)</label>
                <input
                  type="number"
                  value={prices.shuttering}
                  onChange={(e) => handlePriceChange('shuttering', Math.max(0, parseFloat(e.target.value) || 0))}
                  className="saas-input py-1.5 px-2 text-xs font-mono font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                RCC Material & Cost Splits
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-zinc-400">Total Estimated Cost</span>
                <div className="text-2xl md:text-3xl font-black text-indigo-650 dark:text-indigo-400 mt-1 leading-tight font-mono">
                  ₹{results.totalCost.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-zinc-400 font-medium block">Concrete Cost</span>
                    <span className="text-[10px] text-zinc-450 font-mono">{results.concreteQty} m³ @ ₹{prices.concreteMix}</span>
                  </div>
                  <span className="font-bold text-zinc-850 dark:text-zinc-200 font-mono">
                    ₹{results.concreteCost.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-zinc-50 dark:border-zinc-800/40 pt-2">
                  <div>
                    <span className="text-zinc-400 font-medium block">Steel Rebar Cost</span>
                    <span className="text-[10px] text-zinc-450 font-mono">{results.steelKg.toLocaleString()} Kg @ ₹{prices.steel}</span>
                  </div>
                  <span className="font-bold text-zinc-850 dark:text-zinc-200 font-mono">
                    ₹{results.steelCost.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-zinc-50 dark:border-zinc-800/40 pt-2">
                  <div>
                    <span className="text-zinc-400 font-medium block">Shuttering Cost</span>
                    <span className="text-[10px] text-zinc-455 font-mono">{results.shutteringSqft.toLocaleString()} Sq Ft @ ₹{prices.shuttering}</span>
                  </div>
                  <span className="font-bold text-zinc-850 dark:text-zinc-200 font-mono">
                    ₹{results.shutteringCost.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 text-[10px] text-zinc-450 dark:text-zinc-550 leading-relaxed">
            <p>
              Shuttering estimates are derived from structural contact ratios. Actual shuttering depends on spacing of support structures.
            </p>
          </div>
        </div>
      </div>

      {/* SVG Trend Graph spanning full width */}
      <MaterialTrendGraph allowedMaterials={['steel', 'concreteMix', 'shuttering']} />
    </div>
  );
}
