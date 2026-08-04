import { useState } from 'react';
import { Copy, Check, Info, ShieldCheck, Ruler, Plus, Trash2 } from 'lucide-react';

type UnitType = 'm' | 'ft';
type CodePreset = 'ecbc' | 'ashrae' | 'igbc';

interface WindowItem {
  id: string;
  width: number;
  height: number;
  qty: number;
}

const DEFAULT_WINDOWS: WindowItem[] = [
  { id: 'win-1', width: 1.8, height: 1.5, qty: 2 },
  { id: 'win-2', width: 2.4, height: 1.2, qty: 1 }
];

export default function WindowToWallRatioCalculator() {
  const [unit, setUnit] = useState<UnitType>('m');
  const [codePreset, setCodePreset] = useState<CodePreset>('ecbc');
  const [wallWidth, setWallWidth] = useState<number>(12); // meters or feet
  const [wallHeight, setWallHeight] = useState<number>(3.5); // meters or feet
  const [windows, setWindows] = useState<WindowItem[]>(DEFAULT_WINDOWS);
  const [copied, setCopied] = useState(false);

  // Form input states for adding a window
  const [newWidth, setNewWidth] = useState<number>(1.5);
  const [newHeight, setNewHeight] = useState<number>(1.2);
  const [newQty, setNewQty] = useState<number>(1);

  const addWindow = () => {
    if (newWidth > 0 && newHeight > 0 && newQty > 0) {
      setWindows((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          width: newWidth,
          height: newHeight,
          qty: newQty
        }
      ]);
    }
  };

  const removeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  };

  const calculate = () => {
    const grossWallArea = wallWidth * wallHeight;
    
    // Sum of all window areas
    const glazingArea = windows.reduce((acc, curr) => acc + (curr.width * curr.height * curr.qty), 0);
    const opaqueWallArea = Math.max(0, grossWallArea - glazingArea);
    
    // WWR percentage
    const wwr = grossWallArea > 0 ? (glazingArea / grossWallArea) * 100 : 0;

    // ECBC and ASHRAE recommend WWR <= 40% for optimal HVAC load and thermal efficiency
    const compliant = wwr <= 40;

    // Daylight penetration depth estimate is typically 1.5 to 2.0 times the window head height
    // (assuming window head height is close to wall height)
    const daylightDepth = wallHeight * 1.5;

    return {
      grossWallArea: Number(grossWallArea.toFixed(1)),
      glazingArea: Number(glazingArea.toFixed(1)),
      opaqueWallArea: Number(opaqueWallArea.toFixed(1)),
      wwr: Number(wwr.toFixed(1)),
      compliant,
      daylightDepth: Number(daylightDepth.toFixed(1))
    };
  };

  const results = calculate();

  const handleUnitChange = (newUnit: UnitType) => {
    const factor = newUnit === 'ft' ? 3.28084 : 1 / 3.28084;
    setUnit(newUnit);
    setWallWidth(Number((wallWidth * factor).toFixed(1)));
    setWallHeight(Number((wallHeight * factor).toFixed(1)));
    setWindows((prev) =>
      prev.map((w) => ({
        ...w,
        width: Number((w.width * factor).toFixed(1)),
        height: Number((w.height * factor).toFixed(1))
      }))
    );
    setNewWidth(Number((newWidth * factor).toFixed(1)));
    setNewHeight(Number((newHeight * factor).toFixed(1)));
  };

  const copyReport = () => {
    const text = `Window-to-Wall Ratio (WWR) Energy Report
----------------------------------------
Target Energy Code: ${codePreset.toUpperCase()}
Gross Wall Area: ${results.grossWallArea} sq ${unit}
Total Glazing Area: ${results.glazingArea} sq ${unit}
Net Opaque Wall Area: ${results.opaqueWallArea} sq ${unit}

Calculated WWR: ${results.wwr}%
Compliance Status: ${results.compliant ? 'PASS (<= 40% prescriptive limit)' : 'WARN (> 40% limit - Higher cooling loads)'}
Est. Daylight Evacuation Depth: ${results.daylightDepth} ${unit}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Parameter Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Ruler className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span>Wall & Glazing Parameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Target Energy Code
              </label>
              <select
                value={codePreset}
                onChange={(e) => setCodePreset(e.target.value as CodePreset)}
                className="saas-input font-bold"
              >
                <option value="ecbc">ECBC India (Office)</option>
                <option value="ashrae">ASHRAE 90.1 (US/Intl)</option>
                <option value="igbc">IGBC Green Bldg</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Scale Unit System
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {(['m', 'ft'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`flex-1 py-1 rounded-md text-xs font-bold transition ${
                      unit === u
                        ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {u === 'm' ? 'Meters' : 'Feet'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Opaque Wall Width ({unit})
              </label>
              <input
                type="number"
                value={wallWidth}
                onChange={(e) => setWallWidth(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Opaque Wall Height ({unit})
              </label>
              <input
                type="number"
                value={wallHeight}
                onChange={(e) => setWallHeight(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
          </div>

          {/* Glazing Windows Builder */}
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 space-y-4">
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Glazing Windows Builder</span>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold mb-1">Width ({unit})</label>
                <input
                  type="number"
                  value={newWidth}
                  onChange={(e) => setNewWidth(parseFloat(e.target.value) || 0)}
                  className="saas-input"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold mb-1">Height ({unit})</label>
                <input
                  type="number"
                  value={newHeight}
                  onChange={(e) => setNewHeight(parseFloat(e.target.value) || 0)}
                  className="saas-input"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold mb-1">Quantity</label>
                <input
                  type="number"
                  value={newQty}
                  onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
                  className="saas-input"
                />
              </div>
              <button
                onClick={addWindow}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Glazing</span>
              </button>
            </div>

            {/* List of active windows */}
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {windows.map((w) => (
                <div
                  key={w.id}
                  className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs"
                >
                  <div className="flex gap-4">
                    <span className="font-bold text-zinc-700 dark:text-zinc-350">
                      Window Size: {w.width} x {w.height} {unit}
                    </span>
                    <span className="text-zinc-450 font-bold">Qty: {w.qty}</span>
                  </div>
                  <button
                    onClick={() => removeWindow(w.id)}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic CAD Elevation blueprint */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Wall Elevation Blueprint</h3>
          <p className="text-xs text-zinc-450">
            Proportional structural elevation drawing showing window openings inside the opaque wall area.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none" />

            {/* Scale proportional wall box representation */}
            <div className="w-[85%] h-[80%] border-2 border-slate-700/60 rounded bg-zinc-900/10 relative flex flex-wrap gap-4 p-4 items-center justify-center">
              <span className="absolute top-2 left-2 text-[6.5px] font-black text-slate-500 tracking-widest uppercase">
                WALL ELEVATION ({wallWidth}x{wallHeight} {unit})
              </span>

              {/* Render dynamic visual window panes */}
              {windows.map((w, idx) => (
                <div
                  key={w.id || idx}
                  className="bg-sky-500/10 border border-sky-400/80 rounded flex flex-col justify-center items-center shadow-lg relative p-2"
                  style={{
                    width: `${Math.min(100, (w.width / wallWidth) * 80)}%`,
                    height: `${Math.min(100, (w.height / wallHeight) * 80)}%`
                  }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:0.5rem_0.5rem] opacity-20" />
                  <span className="text-[6.5px] text-sky-400 font-bold uppercase tracking-wider">GLAZING</span>
                  <span className="text-[7.5px] font-mono text-sky-500 font-bold">
                    {w.width}x{w.height} (x{w.qty})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results details panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Thermal Audit</span>
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-xs text-zinc-455">Window-to-Wall Ratio</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.wwr}%
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border self-start ${
                    results.compliant
                      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
                      : 'text-amber-500 bg-amber-500/10 border-amber-500/30'
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ECBC / ASHRAE Prescriptive limit (max 40%): {results.compliant ? 'COMPLIANT' : 'EXCEEDS LIMIT'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-550 font-black uppercase tracking-wider block">Areas Breakdown</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Gross Wall Surface Area</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.grossWallArea} sq {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Net Glazing Surface Area</span>
                  <span className="font-bold font-mono text-sky-500">
                    {results.glazingArea} sq {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Opaque Wall Surface Area</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.opaqueWallArea} sq {unit}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-550 font-black uppercase tracking-wider block">Daylighting Estimates</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Daylight Penetration Depth</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    ~ {results.daylightDepth} {unit}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Window-to-Wall ratio regulates solar heat gains inside buildings. Higher ratios permit more natural lighting but increase air conditioning loads. Keep WWR less than or equal to 40% to satisfy standard green building bylaws.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}