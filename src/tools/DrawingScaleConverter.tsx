import { useState } from 'react';
import { Copy, Check, Info, FileSpreadsheet, RefreshCw } from 'lucide-react';

type SystemType = 'imperial' | 'metric';

interface ScalePreset {
  label: string;
  ratio: number;
  system: SystemType;
  unit: string; // 'in' or 'cm' on paper
}

const SCALE_PRESETS: Record<string, ScalePreset> = {
  // Imperial presets
  '1/16': { label: '1/16" = 1\'-0" (1:192)', ratio: 192, system: 'imperial', unit: 'in' },
  '1/8': { label: '1/8" = 1\'-0" (1:96)', ratio: 96, system: 'imperial', unit: 'in' },
  '1/4': { label: '1/4" = 1\'-0" (1:48)', ratio: 48, system: 'imperial', unit: 'in' },
  '1/2': { label: '1/2" = 1\'-0" (1:24)', ratio: 24, system: 'imperial', unit: 'in' },
  '1': { label: '1" = 1\'-0" (1:12)', ratio: 12, system: 'imperial', unit: 'in' },

  // Metric presets
  'm20': { label: '1:20', ratio: 20, system: 'metric', unit: 'cm' },
  'm50': { label: '1:50', ratio: 50, system: 'metric', unit: 'cm' },
  'm100': { label: '1:100', ratio: 100, system: 'metric', unit: 'cm' },
  'm200': { label: '1:200', ratio: 200, system: 'metric', unit: 'cm' }
};

export default function DrawingScaleConverter() {
  const [sourcePreset, setSourcePreset] = useState<string>('m100');
  const [targetPreset, setTargetPreset] = useState<string>('1/4');
  const [sourceValue, setSourceValue] = useState<number>(10); // paper distance (e.g. 10 cm or 10 in)
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const src = SCALE_PRESETS[sourcePreset] || SCALE_PRESETS['m100'];
    const tgt = SCALE_PRESETS[targetPreset] || SCALE_PRESETS['1/4'];

    // 1. Calculate Real World size in meters
    // If source is imperial (inches on paper), real size in inches = val * ratio. In meters = realIn * 0.0254
    // If source is metric (cm on paper), real size in cm = val * ratio. In meters = realCm / 100
    let realMeters = 0;
    if (src.system === 'imperial') {
      const realInches = sourceValue * src.ratio;
      realMeters = realInches * 0.0254;
    } else {
      const realCm = sourceValue * src.ratio;
      realMeters = realCm / 100;
    }

    // 2. Convert Real World size to Target Drawing Space
    let targetValue = 0;
    if (tgt.system === 'imperial') {
      // Real size in inches divided by target ratio
      const realInches = realMeters / 0.0254;
      targetValue = realInches / tgt.ratio;
    } else {
      // Real size in cm divided by target ratio
      const realCm = realMeters * 100;
      targetValue = realCm / tgt.ratio;
    }

    // 3. Compute scale conversion factor (ratio of ratios)
    const factor = src.ratio / tgt.ratio;

    // Visual preview size comparison
    // Base scale is 50% for source square, target scales relative to it
    const targetVisualScale = Math.min(100, Math.max(10, 50 * factor));

    return {
      realMeters: Number(realMeters.toFixed(2)),
      realFeet: Number((realMeters / 0.3048).toFixed(2)),
      targetValue: Number(targetValue.toFixed(3)),
      factor: Number(factor.toFixed(4)),
      targetVisualScale
    };
  };

  const results = calculate();

  const copyReport = () => {
    const src = SCALE_PRESETS[sourcePreset];
    const tgt = SCALE_PRESETS[targetPreset];
    const text = `Drawing Scale Conversion Matrix
----------------------------------------
Source Drawing Scale: ${src.label}
Target Drawing Scale: ${tgt.label}

Source Distance on Paper: ${sourceValue} ${src.unit}
Calculated Distance on Target Paper: ${results.targetValue} ${tgt.unit}

Real-World Distance Represented: ${results.realMeters} m (${results.realFeet} ft)
Scale Scaling Factor (Source to Target): ${results.factor}x`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-500 animate-spin-slow" />
            <span>Scale Conversion Settings</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Source Scale (Original Sheet)
              </label>
              <select
                value={sourcePreset}
                onChange={(e) => setSourcePreset(e.target.value)}
                className="saas-input"
              >
                {Object.entries(SCALE_PRESETS).map(([k, p]) => (
                  <option key={k} value={k}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Target Scale (New Sheet)
              </label>
              <select
                value={targetPreset}
                onChange={(e) => setTargetPreset(e.target.value)}
                className="saas-input"
              >
                {Object.entries(SCALE_PRESETS).map(([k, p]) => (
                  <option key={k} value={k}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
              Source Distance on Paper ({SCALE_PRESETS[sourcePreset]?.unit})
            </label>
            <input
              type="number"
              value={sourceValue}
              step={0.5}
              onChange={(e) => setSourceValue(parseFloat(e.target.value) || 0)}
              className="saas-input font-bold font-mono"
            />
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Scale Dimension Mapping</h3>
          <p className="text-xs text-zinc-400">
            Split drawing board showing how the physical size of a room layout expands or shrinks when moving from the source scale to the target scale.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border-4 border-zinc-800 rounded-2xl p-4 shadow-inner flex gap-4 overflow-hidden">
            {/* Source Sheet Block */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between items-center relative">
              <span className="text-[6.5px] font-black text-slate-500 uppercase tracking-widest absolute top-2 left-3">
                Source Sheet ({SCALE_PRESETS[sourcePreset]?.unit})
              </span>
              <div className="flex-1 flex items-center justify-center w-full">
                <div className="w-16 h-16 bg-indigo-500/20 border-2 border-indigo-500 rounded flex items-center justify-center">
                  <span className="text-[7.5px] font-black text-indigo-400">
                    {sourceValue} {SCALE_PRESETS[sourcePreset]?.unit}
                  </span>
                </div>
              </div>
              <span className="text-[8px] font-bold text-slate-450">
                Scale: {SCALE_PRESETS[sourcePreset]?.label.split(' ')[0]}
              </span>
            </div>

            {/* Conversion indicator arrow */}
            <div className="flex flex-col justify-center items-center text-zinc-550 text-[10px] font-bold">
              <span>➔</span>
              <span className="text-[8px] mt-1 font-mono">x{results.factor}</span>
            </div>

            {/* Target Sheet Block */}
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between items-center relative">
              <span className="text-[6.5px] font-black text-slate-500 uppercase tracking-widest absolute top-2 left-3">
                Target Sheet ({SCALE_PRESETS[targetPreset]?.unit})
              </span>
              <div className="flex-1 flex items-center justify-center w-full">
                <div
                  style={{
                    width: `${results.targetVisualScale * 0.8}%`,
                    height: `${results.targetVisualScale * 0.8}%`,
                    maxWidth: '80%',
                    maxHeight: '80%'
                  }}
                  className="bg-emerald-500/10 border-2 border-emerald-500 rounded flex items-center justify-center transition-all duration-300"
                >
                  <span className="text-[7.5px] font-black text-emerald-500">
                    {results.targetValue} {SCALE_PRESETS[targetPreset]?.unit}
                  </span>
                </div>
              </div>
              <span className="text-[8px] font-bold text-slate-450">
                Scale: {SCALE_PRESETS[targetPreset]?.label.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Target Output
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
                <span className="text-xs text-zinc-400">Equivalent Paper Length</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.targetValue} {SCALE_PRESETS[targetPreset]?.unit}
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                  <span className="font-semibold text-zinc-550 flex items-center gap-1">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                    <span>Real-world Equivalent</span>
                  </span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.realMeters} m / {results.realFeet} ft
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Scaling Ratio Factor</span>
                  <span className="font-bold font-mono">{results.factor}</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Switching between metric (1:50, 1:100) and imperial scales (1/4", 1/8") alters the physical footprint dimension on paper. Use this calculator to transcode dimensions without rebuilding models.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}