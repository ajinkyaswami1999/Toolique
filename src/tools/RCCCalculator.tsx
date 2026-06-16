import { useState, useEffect } from 'react';
import { Ruler, Copy, Check, RotateCcw } from 'lucide-react';

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

  const [results, setResults] = useState({
    concreteQty: 0,
    steelKg: 0,
    shutteringSqft: 0,
    shutteringSqm: 0,
  });

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

    setResults({
      concreteQty: Number(concreteQty.toFixed(2)),
      steelKg: Math.round(steelKg),
      shutteringSqm: Number(shutteringSqm.toFixed(1)),
      shutteringSqft: Math.round(shutteringSqft),
    });
  }, [member, volume, unit, steelRatio, wastage]);

  const copyReport = () => {
    const text = `RCC Structural Estimate (Toolique)
----------------------------------------
Member Type : ${member.toUpperCase()}
Concrete Vol: ${volume} ${unit === 'm3' ? 'm³' : 'cu ft'}
Steel Ratio : ${steelRatio}%
Wastage     : ${wastage}%
----------------------------------------
Concrete Qty: ${results.concreteQty} m³
Steel Weight: ${results.steelKg.toLocaleString()} Kg
Shuttering  : ${results.shutteringSqm} m² (${results.shutteringSqft.toLocaleString()} sq ft)
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
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">RCC Specifications</h3>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-855 hover:text-slate-650 dark:hover:text-slate-200 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Member Type Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Structural Member Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.keys(defaultsByMember).map((m) => (
              <button
                key={m}
                onClick={() => setMember(m)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition ${
                  member === m
                    ? 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-950/20 dark:border-teal-900/60 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
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
            <label className="block text-xs font-semibold text-slate-405 mb-1.5">
              Concrete Volume
            </label>
            <input
              type="number"
              value={volume || ''}
              onChange={(e) => setVolume(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 font-semibold focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Volume Unit
            </label>
            <div className="flex rounded-xl bg-slate-50 dark:bg-slate-950/40 p-1 border border-slate-200/60 dark:border-slate-850">
              <button
                onClick={() => setUnit('m3')}
                className={`flex-grow py-1.5 rounded-lg text-xs font-bold transition ${
                  unit === 'm3'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Cubic Meter (m³)
              </button>
              <button
                onClick={() => setUnit('ft3')}
                className={`flex-grow py-1.5 rounded-lg text-xs font-bold transition ${
                  unit === 'ft3'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500'
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
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Steel Ratio (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={steelRatio || ''}
              onChange={(e) => setSteelRatio(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Concrete Wastage (%)
            </label>
            <input
              type="number"
              value={wastage || ''}
              onChange={(e) => setWastage(Math.max(0, parseInt(e.target.value) || 0))}
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
              RCC Material Quantities
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
              <span className="text-xs font-semibold text-slate-400">Concrete Quantity (Wet)</span>
              <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {results.concreteQty} m³
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Steel Rebar Weight</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  {results.steelKg.toLocaleString()} Kg
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Shuttering (Metric)</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  {results.shutteringSqm} m²
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Shuttering (Imperial)</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  {results.shutteringSqft.toLocaleString()} Sq Ft
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Shuttering estimates are derived from structural contact ratios. Actual shuttering depends on spacing of wood/steel plates and supports.
          </p>
        </div>
      </div>
    </div>
  );
}
