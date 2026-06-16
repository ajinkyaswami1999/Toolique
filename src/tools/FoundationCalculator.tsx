import { useState, useEffect } from 'react';
import { Ruler, Copy, Check, RotateCcw } from 'lucide-react';

export default function FoundationCalculator() {
  const [length, setLength] = useState<number>(5); // feet
  const [width, setWidth] = useState<number>(5);  // feet
  const [thickness, setThickness] = useState<number>(1.5); // feet
  const [excavationDepth, setExcavationDepth] = useState<number>(5); // feet
  const [pccThickness, setPccThickness] = useState<number>(3); // inches
  const [count, setCount] = useState<number>(12);
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    excavationVolM3: 0,
    excavationVolFt3: 0,
    pccVolM3: 0,
    rccVolM3: 0,
  });

  useEffect(() => {
    // 1. Excavation Volume
    // Rule of thumb: add 1 ft (30cm) extra clearance on all 4 sides for working space
    const excLength = length + 2;
    const excWidth = width + 2;
    const excVolFt3 = excLength * excWidth * excavationDepth * count;
    const excVolM3 = excVolFt3 * 0.0283168;

    // 2. PCC (Plain Cement Concrete) Volume
    // Layer of standard 3" or 4" thickness u/s bottom of footing size
    const pccThickFt = pccThickness / 12;
    const pccVolFt3 = length * width * pccThickFt * count;
    const pccVolM3 = pccVolFt3 * 0.0283168;

    // 3. RCC Footing Volume
    const rccVolFt3 = length * width * thickness * count;
    const rccVolM3 = rccVolFt3 * 0.0283168;

    setResults({
      excavationVolM3: Number(excVolM3.toFixed(2)),
      excavationVolFt3: Math.round(excVolFt3),
      pccVolM3: Number(pccVolM3.toFixed(2)),
      rccVolM3: Number(rccVolM3.toFixed(2)),
    });
  }, [length, width, thickness, excavationDepth, pccThickness, count]);

  const copyReport = () => {
    const text = `Foundation & Footing Estimate (Toolique)
----------------------------------------
Footing Size : ${length} ft x ${width} ft (Thickness: ${thickness} ft)
Excavation   : Depth: ${excavationDepth} ft (with 1ft working clearance)
PCC Thickness: ${pccThickness} inches
Quantity     : ${count} Nos
----------------------------------------
Excavation   : ${results.excavationVolM3} m³ (${results.excavationVolFt3.toLocaleString()} cu ft)
PCC Volume   : ${results.pccVolM3} m³
RCC Footing  : ${results.rccVolM3} m³
----------------------------------------
Calculated using standard foundation excavation safety clearance rules.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setLength(5);
    setWidth(5);
    setThickness(1.5);
    setExcavationDepth(5);
    setPccThickness(3);
    setCount(12);
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
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Footing Details</h3>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-650 dark:hover:text-slate-200 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Footing Size */}
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
              Thickness (ft)
            </label>
            <input
              type="number"
              value={thickness || ''}
              onChange={(e) => setThickness(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Excavation and PCC */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-405 mb-1.5">
              Excavation Depth (ft)
            </label>
            <input
              type="number"
              value={excavationDepth || ''}
              onChange={(e) => setExcavationDepth(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-405 mb-1.5">
              PCC Thickness (in)
            </label>
            <input
              type="number"
              value={pccThickness || ''}
              onChange={(e) => setPccThickness(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-755 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-455 mb-1.5">
              No. of Footings
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
              Foundation Quantities
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
              <span className="text-xs font-semibold text-slate-400">Total Excavation Volume</span>
              <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {results.excavationVolM3} m³
              </div>
              <span className="text-[10px] text-slate-400 font-semibold mt-1 block font-mono">
                = {results.excavationVolFt3.toLocaleString()} cu ft
              </span>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">PCC Volume (Mud Mat)</span>
                <span className="font-bold text-slate-755 dark:text-slate-350 font-mono">
                  {results.pccVolM3} m³
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">RCC Footing Volume</span>
                <span className="font-bold text-teal-650 dark:text-teal-400 font-mono">
                  {results.rccVolM3} m³
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Excavation calculation automatically includes an additional 1-foot buffer width on all sides of the footing for formwork installation workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
