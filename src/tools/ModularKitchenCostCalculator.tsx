import { useState, useEffect } from 'react';
import { Palette, Copy, Check, RotateCcw } from 'lucide-react';

interface FinishPreset {
  name: string;
  baseRate: number; // per running foot (base + wall cabinets combined)
}

const finishPresets: Record<string, FinishPreset> = {
  laminate: { name: 'Laminate Finish (Premium)', baseRate: 1600 },
  acrylic: { name: 'Acrylic Finish (High Gloss)', baseRate: 2200 },
  membrane: { name: 'Membrane Finish (Matte/Textured)', baseRate: 1900 },
  pu: { name: 'PU Paint / Duco Gloss', baseRate: 3200 },
};

export default function ModularKitchenCostCalculator() {
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [kitchenShape, setKitchenShape] = useState<'straight' | 'parallel' | 'lshape' | 'ushape'>('lshape');
  
  // Dimensions
  const [counterLength, setCounterLength] = useState<number>(14); // running feet
  const [includeLoft, setIncludeLoft] = useState<boolean>(true);
  const [loftLength, setLoftLength] = useState<number>(10); // running feet
  const [tallUnits, setTallUnits] = useState<number>(1); // count of 2-foot tall pantry units

  // Material & Trim
  const [finishKey, setFinishKey] = useState<string>('acrylic');
  const [hardwareQuality, setHardwareQuality] = useState<'basic' | 'premium' | 'luxury'>('premium');
  
  // Countertop
  const [countertopType, setCountertopType] = useState<'none' | 'granite' | 'quartz'>('granite');
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    baseCabinetCost: 0,
    wallCabinetCost: 0,
    loftCost: 0,
    tallUnitCost: 0,
    countertopCost: 0,
    hardwareMarkup: 0,
    grandTotal: 0,
  });

  // Automatically adjust default length based on shape selection
  useEffect(() => {
    if (kitchenShape === 'straight') {
      setCounterLength(8);
      setLoftLength(6);
    } else if (kitchenShape === 'parallel') {
      setCounterLength(16);
      setLoftLength(12);
    } else if (kitchenShape === 'lshape') {
      setCounterLength(14);
      setLoftLength(10);
    } else if (kitchenShape === 'ushape') {
      setCounterLength(20);
      setLoftLength(14);
    }
  }, [kitchenShape]);

  useEffect(() => {
    // Standard multipliers for metric
    const lenMultiplier = unit === 'meters' ? 3.28084 : 1; // 1 m = 3.28 ft
    const counterInFt = counterLength * lenMultiplier;
    const loftInFt = includeLoft ? loftLength * lenMultiplier : 0;

    const finish = finishPresets[finishKey] || finishPresets.acrylic;
    const baseRatePerFt = finish.baseRate;

    // Splits: Base cabinets are usually 60% of rates, Wall cabinets are 40%
    const baseCabinetCost = counterInFt * (baseRatePerFt * 0.60);
    const wallCabinetCost = counterInFt * (baseRatePerFt * 0.40) * 0.8; // Assume wall cabinets cover ~80% of counter length

    // Lofts are usually shallow, costing ~30% of base rate
    const loftCost = loftInFt * (baseRatePerFt * 0.35);

    // Tall pantry unit (typically 2 feet wide, costs around ₹25,000 to ₹35,000 per unit depending on finish)
    const tallUnitCost = tallUnits * (baseRatePerFt * 2 * 3.5); // Multiplied by width & height scaling factor

    // Countertop cost per running foot:
    // Granite: ₹400/ft, Quartz: ₹750/ft
    let countertopRate = 0;
    if (countertopType === 'granite') countertopRate = 400;
    else if (countertopType === 'quartz') countertopRate = 800;
    const countertopCost = countertopRate * counterInFt;

    // Hardware markup
    // Basic: 0%, Premium (Tandem drawer runners, soft close): +15% on cabinetry, Luxury (Hydraulics, wire organizers): +35%
    let hardwareFactor = 0;
    if (hardwareQuality === 'premium') hardwareFactor = 0.18;
    else if (hardwareQuality === 'luxury') hardwareFactor = 0.38;

    const totalCabinetsCost = baseCabinetCost + wallCabinetCost + loftCost + tallUnitCost;
    const hardwareMarkup = totalCabinetsCost * hardwareFactor;

    const grandTotal = totalCabinetsCost + countertopCost + hardwareMarkup;

    setResults({
      baseCabinetCost: Math.round(baseCabinetCost),
      wallCabinetCost: Math.round(wallCabinetCost),
      loftCost: Math.round(loftCost),
      tallUnitCost: Math.round(tallUnitCost),
      countertopCost: Math.round(countertopCost),
      hardwareMarkup: Math.round(hardwareMarkup),
      grandTotal: Math.round(grandTotal),
    });
  }, [counterLength, includeLoft, loftLength, tallUnits, finishKey, hardwareQuality, countertopType, unit]);

  const copyReport = () => {
    const activeFinish = finishPresets[finishKey] || finishPresets.acrylic;
    const lenUnit = unit === 'feet' ? 'ft' : 'm';

    const text = `Modular Kitchen Cost Estimation (Toolique)
----------------------------------------
Layout Shape      : ${kitchenShape.toUpperCase()}
Counter Length    : ${counterLength} ${lenUnit}
Include Loft      : ${includeLoft ? 'YES' : 'NO'} (${loftLength} ${lenUnit})
Tall Pantry Units : ${tallUnits} Unit(s)
Cabinet Finish    : ${activeFinish.name}
Hardware Quality  : ${hardwareQuality.toUpperCase()}
Countertop Material: ${countertopType.toUpperCase()}
----------------------------------------
Base Cabinets Cost: ₹${results.baseCabinetCost.toLocaleString()}
Wall Cabinets Cost: ₹${results.wallCabinetCost.toLocaleString()}
Loft Cabinets Cost: ₹${results.loftCost.toLocaleString()}
Tall Pantry Cost  : ₹${results.tallUnitCost.toLocaleString()}
Countertop Cost   : ₹${results.countertopCost.toLocaleString()}
Hardware & Fittings: ₹${results.hardwareMarkup.toLocaleString()}
----------------------------------------
Grand Total Price : ₹${results.grandTotal.toLocaleString()}
----------------------------------------
Calculated according to standard multi-brand modular kitchen rate matrixes.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setKitchenShape('lshape');
    setCounterLength(14);
    setIncludeLoft(true);
    setLoftLength(10);
    setTallUnits(1);
    setFinishKey('acrylic');
    setHardwareQuality('premium');
    setCountertopType('granite');
  };

  const lenUnit = unit === 'feet' ? 'ft' : 'm';

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <Palette className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Kitchen Configuration</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
              <button
                onClick={() => setUnit('feet')}
                className={`px-2 py-1 rounded-md transition ${unit === 'feet' ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-sm' : 'text-slate-400'}`}
              >
                Feet
              </button>
              <button
                onClick={() => setUnit('meters')}
                className={`px-2 py-1 rounded-md transition ${unit === 'meters' ? 'bg-white dark:bg-slate-700 text-pink-600 shadow-sm' : 'text-slate-400'}`}
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

        {/* Layout Shape */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Select Kitchen Layout Shape
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'straight', label: 'Straight' },
              { id: 'parallel', label: 'Parallel' },
              { id: 'lshape', label: 'L-Shape' },
              { id: 'ushape', label: 'U-Shape' },
            ].map((shape) => (
              <button
                key={shape.id}
                onClick={() => setKitchenShape(shape.id as any)}
                className={`px-1 py-1.5 rounded-lg text-xs font-bold border text-center transition ${
                  kitchenShape === shape.id
                    ? 'border-pink-500 bg-pink-500/5 text-pink-600 dark:text-pink-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                {shape.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Counter Length ({lenUnit})
            </label>
            <input
              type="number"
              value={counterLength || ''}
              onChange={(e) => setCounterLength(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Loft Length ({lenUnit})
            </label>
            <input
              type="number"
              disabled={!includeLoft}
              value={loftLength || ''}
              onChange={(e) => setLoftLength(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-pink-500 focus:outline-none disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Pantry Tall Units
            </label>
            <input
              type="number"
              value={tallUnits || ''}
              onChange={(e) => setTallUnits(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Checkbox for Loft */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includeLoft"
            checked={includeLoft}
            onChange={(e) => setIncludeLoft(e.target.checked)}
            className="w-4 h-4 rounded border-slate-350 dark:border-slate-805 text-pink-650 focus:ring-pink-500"
          />
          <label htmlFor="includeLoft" className="text-xs font-semibold text-slate-650 dark:text-slate-300 cursor-pointer">
            Include overhead loft cabinets (up to ceiling)
          </label>
        </div>

        {/* Finish & Hardware Presets */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Cabinet Finish
            </label>
            <select
              value={finishKey}
              onChange={(e) => setFinishKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-pink-500 focus:outline-none"
            >
              {Object.entries(finishPresets).map(([key, value]) => (
                <option key={key} value={key} className="dark:bg-slate-900">
                  {value.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Hardware & Organizers
            </label>
            <select
              value={hardwareQuality}
              onChange={(e) => setHardwareQuality(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-pink-500 focus:outline-none"
            >
              <option value="basic" className="dark:bg-slate-900">Basic Wire Baskets</option>
              <option value="premium" className="dark:bg-slate-900">Premium Soft-Close</option>
              <option value="luxury" className="dark:bg-slate-900">Luxury Hettich/Hafele</option>
            </select>
          </div>
        </div>

        {/* Countertop */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Kitchen Countertop Slab
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'none', label: 'None/By Builder' },
              { id: 'granite', label: 'Granite Countertop' },
              { id: 'quartz', label: 'Quartz Countertop' },
            ].map((cnt) => (
              <button
                key={cnt.id}
                onClick={() => setCountertopType(cnt.id as any)}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition ${
                  countertopType === cnt.id
                    ? 'border-pink-500 bg-pink-500/5 text-pink-600 dark:text-pink-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                {cnt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Modular Kitchen Quote
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
              <span className="text-xs font-semibold text-slate-400">Estimated Project Total</span>
              <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                ₹{results.grandTotal.toLocaleString()}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Base Cabinets (Drawers/Shutters)</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.baseCabinetCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Wall Overhead Cabinets</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.wallCabinetCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Lofts Overhead Area</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.loftCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Tall Pantry Cabinetry</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.tallUnitCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Countertop Material Slab</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.countertopCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Hardware Accessories Fee</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  ₹{results.hardwareMarkup.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Estimate excludes chimney, hob, sink, and electrical wiring work. Marine ply (BWR/BWP grade) is recommended for base cabinets to prevent water swelling.
          </p>
        </div>
      </div>
    </div>
  );
}
