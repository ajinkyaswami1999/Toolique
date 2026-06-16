import { useState, useEffect } from 'react';
import { Compass, Copy, Check, RotateCcw } from 'lucide-react';

export default function CarpetAreaCalculator() {
  const [unit, setUnit] = useState<'feet' | 'meters'>('feet');
  const [inputType, setInputType] = useState<'carpet' | 'builtup' | 'super'>('super');
  const [inputValue, setInputValue] = useState<number>(1200);
  const [wallRatio, setWallRatio] = useState<number>(6); // % of carpet area for partition walls
  const [balconyRatio, setBalconyRatio] = useState<number>(8); // % of carpet area for balcony/utility
  const [loadingRatio, setLoadingRatio] = useState<number>(25); // % loading for common areas
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    carpetArea: 0,
    internalWalls: 0,
    reraCarpet: 0,
    balconyArea: 0,
    builtupArea: 0,
    superBuiltupArea: 0,
  });

  useEffect(() => {
    let carpet = 0;
    let builtup = 0;
    let superBuiltup = 0;

    if (inputType === 'carpet') {
      carpet = inputValue;
      // RERA carpet = inner carpet + partition walls
      // RERA carpet is standard usable area + partition walls.
      // Built up = RERA carpet + balcony + external walls (external walls around 5%)
      builtup = carpet * (1 + (wallRatio + balconyRatio + 5) / 100);
      superBuiltup = builtup * (1 + loadingRatio / 100);
    } else if (inputType === 'builtup') {
      builtup = inputValue;
      // Built up consists of: RERA carpet + balcony + external walls
      const factor = 1 + (wallRatio + balconyRatio + 5) / 100;
      carpet = builtup / factor;
      superBuiltup = builtup * (1 + loadingRatio / 100);
    } else {
      // Input is super built up
      superBuiltup = inputValue;
      builtup = superBuiltup / (1 + loadingRatio / 100);
      const factor = 1 + (wallRatio + balconyRatio + 5) / 100;
      carpet = builtup / factor;
    }

    const internalWalls = carpet * (wallRatio / 100);
    const reraCarpet = carpet + internalWalls;
    const balconyArea = carpet * (balconyRatio / 100);

    setResults({
      carpetArea: Math.round(carpet),
      internalWalls: Math.round(internalWalls),
      reraCarpet: Math.round(reraCarpet),
      balconyArea: Math.round(balconyArea),
      builtupArea: Math.round(builtup),
      superBuiltupArea: Math.round(superBuiltup),
    });
  }, [inputType, inputValue, wallRatio, balconyRatio, loadingRatio]);

  const copyReport = () => {
    const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';
    const text = `RERA Carpet Area Conversion Report (Toolique)
----------------------------------------
Input Type        : ${inputType.toUpperCase()} Area
Input Value       : ${inputValue.toLocaleString()} ${areaUnit}
Partition Walls % : ${wallRatio}%
Balcony Ratio %   : ${balconyRatio}%
Common Loading %  : ${loadingRatio}%
----------------------------------------
Calculated Splits:
Net Usable Carpet : ${results.carpetArea.toLocaleString()} ${areaUnit}
Internal Walls    : ${results.internalWalls.toLocaleString()} ${areaUnit}
RERA Carpet Area  : ${results.reraCarpet.toLocaleString()} ${areaUnit} (Usable + Walls)
Balcony & Utility : ${results.balconyArea.toLocaleString()} ${areaUnit}
Built-up Area     : ${results.builtupArea.toLocaleString()} ${areaUnit}
Super Built-up    : ${results.superBuiltupArea.toLocaleString()} ${areaUnit}
----------------------------------------
Calculated according to Real Estate Regulation Act (RERA) criteria.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInputType('super');
    setInputValue(1200);
    setWallRatio(6);
    setBalconyRatio(8);
    setLoadingRatio(25);
  };

  const areaUnit = unit === 'feet' ? 'sq ft' : 'sq m';

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">RERA Area Converter</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
              <button
                onClick={() => setUnit('feet')}
                className={`px-2 py-1 rounded-md transition ${unit === 'feet' ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
              >
                Sq Ft
              </button>
              <button
                onClick={() => setUnit('meters')}
                className={`px-2 py-1 rounded-md transition ${unit === 'meters' ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
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

        {/* Input Selectors */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Select Input Area Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setInputType('carpet');
                  if (inputValue === 1200) setInputValue(800);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  inputType === 'carpet'
                    ? 'border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                Carpet Area
              </button>
              <button
                onClick={() => {
                  setInputType('builtup');
                  if (inputValue === 800 || inputValue === 1200) setInputValue(1000);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  inputType === 'builtup'
                    ? 'border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                Built-Up Area
              </button>
              <button
                onClick={() => {
                  setInputType('super');
                  if (inputValue === 800 || inputValue === 1000) setInputValue(1200);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  inputType === 'super'
                    ? 'border-violet-500 bg-violet-500/5 text-violet-600 dark:text-violet-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
              >
                Super Built-up Area
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Area Value ({areaUnit})
            </label>
            <input
              type="number"
              value={inputValue || ''}
              onChange={(e) => setInputValue(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-violet-500 focus:outline-none"
            />
          </div>

          {/* Ratios */}
          <div className="grid grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Internal Walls (%)
              </label>
              <input
                type="number"
                value={wallRatio || ''}
                onChange={(e) => setWallRatio(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Balcony/Shafts (%)
              </label>
              <input
                type="number"
                value={balconyRatio || ''}
                onChange={(e) => setBalconyRatio(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                Loading Factor (%)
              </label>
              <input
                type="number"
                value={loadingRatio || ''}
                onChange={(e) => setLoadingRatio(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              RERA Area Breakdown
            </span>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400">RERA Carpet Area</span>
              <div className="text-xl md:text-2xl font-black text-teal-600 dark:text-teal-400 mt-0.5 font-mono">
                {results.reraCarpet.toLocaleString()} {areaUnit}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Includes net usable floor area + internal partition walls.
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Net Usable Carpet</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.carpetArea.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium font-mono">Internal Walls Area</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.internalWalls.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Balcony & Shafts</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.balconyArea.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Built-Up Area</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.builtupArea.toLocaleString()} {areaUnit}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Super Built-up Area</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.superBuiltupArea.toLocaleString()} {areaUnit}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Under RERA, developers must quote the Carpet Area instead of Super Built-Up area. Loading factor represents common amenities (lifts, staircases, lobbies) shared proportionally.
          </p>
        </div>
      </div>
    </div>
  );
}
