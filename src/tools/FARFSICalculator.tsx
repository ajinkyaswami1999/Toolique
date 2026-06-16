import { useState, useEffect } from 'react';
import { Compass, Copy, Check, RotateCcw } from 'lucide-react';

export default function FARFSICalculator() {
  const [plotArea, setPlotArea] = useState<number>(2500);
  const [fsiValue, setFsiValue] = useState<number>(1.8);
  const [builtupFloor, setBuiltupFloor] = useState<number>(1200);
  const [floors, setFloors] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    maxBuildableArea: 0,
    utilizedArea: 0,
    utilizedFsi: 0,
    remainingArea: 0,
    isOverLimit: false,
  });

  useEffect(() => {
    const maxBuildable = plotArea * fsiValue;
    const utilized = builtupFloor * floors;
    const remaining = maxBuildable - utilized;
    const utilizedFsi = utilized / (plotArea || 1);

    setResults({
      maxBuildableArea: Math.round(maxBuildable),
      utilizedArea: Math.round(utilized),
      utilizedFsi: Number(utilizedFsi.toFixed(3)),
      remainingArea: Math.round(remaining),
      isOverLimit: utilized > maxBuildable,
    });
  }, [plotArea, fsiValue, builtupFloor, floors]);

  const copyReport = () => {
    const text = `FAR / FSI Clearance Report (Toolique)
----------------------------------------
Plot Area     : ${plotArea.toLocaleString()} sq ft
FAR/FSI Limit : ${fsiValue}
Planned Floors: ${floors} (Floor Area: ${builtupFloor.toLocaleString()} sq ft/floor)
----------------------------------------
Max Buildable : ${results.maxBuildableArea.toLocaleString()} sq ft
Utilized Area : ${results.utilizedArea.toLocaleString()} sq ft
Utilized FSI  : ${results.utilizedFsi}
Remaining FSI : ${(fsiValue - results.utilizedFsi).toFixed(3)} (${results.remainingArea.toLocaleString()} sq ft)
Status        : ${results.isOverLimit ? 'EXCEEDED LIMIT' : 'WITHIN COMPLIANCE'}
----------------------------------------
Calculated u/s local municipal authority guidelines.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setPlotArea(2500);
    setFsiValue(1.8);
    setBuiltupFloor(1200);
    setFloors(2);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-808 dark:text-white text-sm">Plot & FSI details</h3>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-650 dark:hover:text-zinc-200 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Plot Area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Plot Area (Sq Ft)
            </label>
            <input
              type="number"
              value={plotArea || ''}
              onChange={(e) => setPlotArea(Math.max(0, parseInt(e.target.value) || 0))}
              className="saas-input font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Permissible FSI / FAR Value
            </label>
            <input
              type="number"
              step="0.01"
              value={fsiValue || ''}
              onChange={(e) => setFsiValue(Math.max(0, parseFloat(e.target.value) || 0))}
              className="saas-input font-semibold"
            />
          </div>
        </div>

        {/* Construction Plans */}
        <div className="grid grid-cols-2 gap-4 border-t border-zinc-150 dark:border-zinc-800/60 pt-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Built-up Area / Floor (Sq Ft)
            </label>
            <input
              type="number"
              value={builtupFloor || ''}
              onChange={(e) => setBuiltupFloor(Math.max(0, parseInt(e.target.value) || 0))}
              className="saas-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Total Floors
            </label>
            <input
              type="number"
              value={floors || ''}
              onChange={(e) => setFloors(Math.max(0, parseInt(e.target.value) || 0))}
              className="saas-input"
            />
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
              FSI Clearance
            </span>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-zinc-400">Total Built-up Area Planned</span>
              <div className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white mt-0.5 font-mono">
                {results.utilizedArea.toLocaleString()} sq ft
              </div>
              <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-2 ${
                results.isOverLimit
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {results.isOverLimit ? 'EXCEEDS PERMISSIBLE FSI' : 'COMPLIANT WITH FSI LIMIT'}
              </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Max Buildable Area</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                  {results.maxBuildableArea.toLocaleString()} sq ft
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">FSI Utilized</span>
                <span className={`font-bold font-mono ${results.isOverLimit ? 'text-rose-500' : 'text-zinc-800 dark:text-zinc-300'}`}>
                  {results.utilizedFsi} / {fsiValue}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-zinc-100 dark:border-zinc-800/40 pb-3">
                <span className="text-zinc-400 font-medium font-semibold">Remaining Area</span>
                <span className={`font-bold font-mono ${results.isOverLimit ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {results.remainingArea.toLocaleString()} sq ft
                </span>
              </div>
            </div>

            {/* Vector boundary layout map */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                Plot Coverage Visualization
              </span>
              <div className="relative w-full h-32 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden p-4">
                <span className="absolute top-2 left-2 text-[9px] font-bold text-zinc-400 uppercase">Plot Area ({plotArea.toLocaleString()} sq ft)</span>
                
                {plotArea > 0 && builtupFloor > 0 && (
                  <div 
                    className={`rounded-lg border-2 flex flex-col items-center justify-center p-1.5 text-center transition-all duration-300 ${
                      results.isOverLimit || builtupFloor > plotArea
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
                        : 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400'
                    }`}
                    style={{
                      width: `${Math.max(20, Math.min(100, Math.sqrt(builtupFloor / plotArea) * 100))}%`,
                      height: `${Math.max(20, Math.min(100, Math.sqrt(builtupFloor / plotArea) * 100))}%`,
                    }}
                  >
                    <span className="text-[9px] font-bold tracking-tight">Footprint</span>
                    <span className="text-[8px] font-bold font-mono">
                      {Math.round((builtupFloor / plotArea) * 100)}% coverage
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 text-[10px] text-zinc-450 dark:text-zinc-555 leading-relaxed">
          <p>
            FAR (Floor Area Ratio) or FSI (Floor Space Index) is the ratio of cumulative built-up area to the total plot area, governed by local bylaws.
          </p>
        </div>
      </div>
    </div>
  );
}
