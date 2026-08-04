import { useState } from 'react';
import { Copy, Check, Info, LayoutGrid, Ruler, Printer, Sliders } from 'lucide-react';

type ScaleSystem = 'metric' | 'imperial';

interface ScalePreset {
  label: string;
  factor: number;
  cadScale: string;
}

const METRIC_PRESETS: ScalePreset[] = [
  { label: '1:1 (Full Size)', factor: 1, cadScale: '1XP' },
  { label: '1:10 (Detail Planning)', factor: 10, cadScale: '0.1XP' },
  { label: '1:20 (Interior/Details)', factor: 20, cadScale: '0.05XP' },
  { label: '1:50 (Floor Plans)', factor: 50, cadScale: '0.02XP' },
  { label: '1:100 (Building Layout)', factor: 100, cadScale: '0.01XP' },
  { label: '1:200 (Site Layout)', factor: 200, cadScale: '0.005XP' },
  { label: '1:500 (Master Plan)', factor: 500, cadScale: '0.002XP' },
  { label: '1:1000 (Zoning/Mapping)', factor: 1000, cadScale: '0.001XP' }
];

const IMPERIAL_PRESETS: ScalePreset[] = [
  { label: '3" = 1\'-0" (1:4)', factor: 4, cadScale: '3/12XP' },
  { label: '1-1/2" = 1\'-0" (1:8)', factor: 8, cadScale: '1.5/12XP' },
  { label: '1" = 1\'-0" (1:12)', factor: 12, cadScale: '1/12XP' },
  { label: '3/4" = 1\'-0" (1:16)', factor: 16, cadScale: '0.75/12XP' },
  { label: '1/2" = 1\'-0" (1:24)', factor: 24, cadScale: '0.5/12XP' },
  { label: '3/8" = 1\'-0" (1:32)', factor: 32, cadScale: '0.375/12XP' },
  { label: '1/4" = 1\'-0" (1:48)', factor: 48, cadScale: '0.25/12XP' },
  { label: '3/16" = 1\'-0" (1:64)', factor: 64, cadScale: '0.1875/12XP' },
  { label: '1/8" = 1\'-0" (1:96)', factor: 96, cadScale: '0.125/12XP' },
  { label: '3/32" = 1\'-0" (1:128)', factor: 128, cadScale: '0.09375/12XP' }
];

export default function ScaleFactorCalculator() {
  const [system, setSystem] = useState<ScaleSystem>('metric');
  const [selectedFactor, setSelectedFactor] = useState<number>(50); // 1:50 default
  const [customFactor, setCustomFactor] = useState<string>('50');
  const [paperWidth, setPaperWidth] = useState<number>(420); // A3 width mm
  const [copied, setCopied] = useState(false);

  const presets = system === 'metric' ? METRIC_PRESETS : IMPERIAL_PRESETS;

  // Sync preset selection with inputs
  const handlePresetSelect = (f: number) => {
    setSelectedFactor(f);
    setCustomFactor(f.toString());
  };

  const handleCustomChange = (val: string) => {
    setCustomFactor(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedFactor(parsed);
    }
  };

  const calculate = () => {
    const factor = selectedFactor;

    // AutoCAD settings
    const dimscale = factor;
    const ltscale = factor * 0.5; // typical standard recommendation
    const psltscale = 1; // standard recommendation to scale in viewport

    // Drawing coverage representation (Model size relative to Paper Size)
    const modelCoverageW = (paperWidth * factor) / 1000; // in meters

    // Viewport scaling representation percentage
    const scalePercent = (1 / factor) * 100;

    return {
      dimscale,
      ltscale,
      psltscale,
      modelCoverageW: Number(modelCoverageW.toFixed(1)),
      scalePercent: Number(scalePercent.toFixed(3)),
      zoomXp: `1/${factor}XP`
    };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `CAD Drafting Scale Factor Audit
----------------------------------------
System: ${system.toUpperCase()}
Scale Ratio: 1:${selectedFactor}
Plot Viewport Scale: ${results.scalePercent}%

AutoCAD System Variables:
- DIMSCALE: ${results.dimscale}
- LTSCALE: ${results.ltscale}
- PSLTSCALE: ${results.psltscale}
- Viewport Zoom Factor: ${results.zoomXp}

Print Boundaries:
- Paper layout width: ${paperWidth} mm
- Actual ground coverage width: ${results.modelCoverageW} meters`;

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
            <span>Ratio & Printing Presets</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Scale System
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {(['metric', 'imperial'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSystem(s);
                      const defaultPreset = s === 'metric' ? METRIC_PRESETS[3] : IMPERIAL_PRESETS[6];
                      handlePresetSelect(defaultPreset.factor);
                    }}
                    className={`flex-1 py-1.5 rounded-md text-xs font-bold capitalize transition ${
                      system === s
                        ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Custom Scale Factor (1:X)
              </label>
              <input
                type="number"
                value={customFactor}
                onChange={(e) => handleCustomChange(e.target.value)}
                className="saas-input font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-2">
              Select Standard Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p) => {
                const isActive = selectedFactor === p.factor;
                return (
                  <button
                    key={p.label}
                    onClick={() => handlePresetSelect(p.factor)}
                    className={`p-2.5 rounded-lg border text-center transition ${
                      isActive
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 font-bold'
                        : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs'
                    }`}
                  >
                    <div className="text-xs truncate">{p.label}</div>
                    <div className="text-[9px] text-zinc-400 mt-0.5 font-mono">Factor: {p.factor}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
            <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
              Paper Layout Sheet Width (mm)
            </label>
            <input
              type="number"
              value={paperWidth}
              onChange={(e) => setPaperWidth(parseFloat(e.target.value) || 0)}
              className="saas-input font-bold"
            />
          </div>
        </div>

        {/* CAD Layout Viewport Simulator */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm">CAD Layout Sheet Viewport (1:{selectedFactor})</h3>
            <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold">
              <Sliders className="w-3.5 h-3.5" />
              <span>Scaling Simulator</span>
            </div>
          </div>
          <p className="text-xs text-zinc-450">
            This visual simulates a paper layout sheet (A3 style). As you increase the scale factor (e.g. 1:100), the model fits larger ground dimensions, rendering the vector house smaller inside the viewport.
          </p>

          <div className="relative w-full aspect-[16/10] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none" />

            {/* Paper Sheet Representation */}
            <div className="w-[85%] h-[85%] border-2 border-slate-700/80 rounded bg-zinc-900/10 p-4 relative flex items-center justify-center shadow-lg border-dashed">
              <span className="absolute top-2 left-2 text-[6.5px] font-black text-slate-500 tracking-widest uppercase">
                DRAFTING LAYOUT SHEET BOUNDARY
              </span>

              {/* Viewport Frame */}
              <div className="w-[90%] h-[80%] border border-slate-800 relative flex items-center justify-center bg-zinc-950 overflow-hidden">
                <span className="absolute top-2 right-2 text-[6px] font-mono text-zinc-500">
                  VP: {results.zoomXp}
                </span>

                {/* Vector House scaling according to factor */}
                <div
                  style={{
                    transform: `scale(${Math.max(0.05, 50 / selectedFactor)})`,
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  className="w-32 h-32 flex flex-col justify-end items-center relative"
                >
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* House vector */}
                    <polygon points="50,15 15,45 85,45" fill="none" stroke="#6366f1" strokeWidth="2" />
                    <rect x="25" y="45" width="50" height="45" fill="none" stroke="#6366f1" strokeWidth="2" />
                    <rect x="42" y="60" width="16" height="30" fill="none" stroke="#eab308" strokeWidth="2" />
                  </svg>
                  <span className="absolute bottom-2 text-[6px] text-indigo-500 font-bold uppercase tracking-wider">
                    Model Geometry
                  </span>
                </div>
              </div>
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
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
                <span>CAD Scale Factors</span>
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
                <span className="text-xs text-zinc-455">CAD Viewport Zoom Factor</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.zoomXp}
                </div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded mt-2 border text-emerald-500 bg-emerald-500/10 border-emerald-500/30">
                  <Printer className="w-3.5 h-3.5" />
                  <span>Plot Scale Percentage: {results.scalePercent}%</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-550 font-black uppercase tracking-wider block">AutoCAD System Variables</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">DIMSCALE (Dimensions)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{results.dimscale}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">LTSCALE (Line Patterns)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{results.ltscale}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">PSLTSCALE (Paper Space lines)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{results.psltscale}</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-550 font-black uppercase tracking-wider block">Print Ground Coverage</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Paper Layout Sheet Size</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{paperWidth} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-semibold">Model Ground Width</span>
                  <span className="font-bold font-mono text-indigo-500">
                    {results.modelCoverageW} meters
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  CAD scale factors coordinate model space details to match paper printing boundary sizes (XP scale zooms). Ensuring standard variables avoids unreadable fonts or overlapping lines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}