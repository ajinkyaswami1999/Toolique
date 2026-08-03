import { useState } from 'react';
import { Copy, Check, Info, Ruler, ArrowRightLeft, Landmark } from 'lucide-react';

type DirectionType = 'draw_to_real' | 'real_to_draw';
type SystemType = 'imperial' | 'metric';

interface ScalePreset {
  label: string;
  ratio: number; // multiplier (e.g. 1:48 means drawing * 48 = real world)
  system: SystemType;
}

const SCALE_PRESETS: Record<string, ScalePreset> = {
  // Imperial
  '1/16': { label: '1/16" = 1\'-0" (1:192)', ratio: 192, system: 'imperial' },
  '3/32': { label: '3/32" = 1\'-0" (1:128)', ratio: 128, system: 'imperial' },
  '1/8': { label: '1/8" = 1\'-0" (1:96)', ratio: 96, system: 'imperial' },
  '3/16': { label: '3/16" = 1\'-0" (1:64)', ratio: 64, system: 'imperial' },
  '1/4': { label: '1/4" = 1\'-0" (1:48)', ratio: 48, system: 'imperial' },
  '3/8': { label: '3/8" = 1\'-0" (1:32)', ratio: 32, system: 'imperial' },
  '1/2': { label: '1/2" = 1\'-0" (1:24)', ratio: 24, system: 'imperial' },
  '3/4': { label: '3/4" = 1\'-0" (1:16)', ratio: 16, system: 'imperial' },
  '1': { label: '1" = 1\'-0" (1:12)', ratio: 12, system: 'imperial' },
  '3': { label: '3" = 1\'-0" (1:4)', ratio: 4, system: 'imperial' },

  // Metric
  'm1': { label: '1:1 (Full Size)', ratio: 1, system: 'metric' },
  'm2': { label: '1:2', ratio: 2, system: 'metric' },
  'm5': { label: '1:5', ratio: 5, system: 'metric' },
  'm10': { label: '1:10', ratio: 10, system: 'metric' },
  'm20': { label: '1:20', ratio: 20, system: 'metric' },
  'm50': { label: '1:50', ratio: 5, system: 'metric' }, // standard detail
  'm100': { label: '1:100 (Standard Plan)', ratio: 100, system: 'metric' },
  'm200': { label: '1:200', ratio: 200, system: 'metric' },
  'm500': { label: '1:500', ratio: 500, system: 'metric' }
};

export default function ArchitecturalScaleCalculator() {
  const [direction, setDirection] = useState<DirectionType>('draw_to_real');
  const [system, setSystem] = useState<SystemType>('imperial');
  const [scaleKey, setScaleKey] = useState<string>('1/4');
  const [inputValue, setInputValue] = useState<number>(2.5); // 2.5 inches or meters depending on system
  const [copied, setCopied] = useState(false);

  // Filter presets based on current system
  const filteredPresets = Object.entries(SCALE_PRESETS).filter(
    ([_, p]) => p.system === system
  );

  const calculate = () => {
    const preset = SCALE_PRESETS[scaleKey] || SCALE_PRESETS['1/4'];
    const ratio = preset.ratio;

    let result = 0;
    let formattedResult = '';

    if (direction === 'draw_to_real') {
      // Convert Drawing to Real World
      if (system === 'imperial') {
        // Input in inches
        const realInches = inputValue * ratio;
        const totalFeet = realInches / 12;
        const feet = Math.floor(totalFeet);
        const inches = Math.round((totalFeet - feet) * 12);
        
        result = totalFeet;
        formattedResult = `${feet}' - ${inches}"`;
      } else {
        // Input in centimeters (standard metric drawing unit)
        const realCm = inputValue * ratio;
        const realMeters = realCm / 100;
        result = realMeters;
        formattedResult = `${realMeters.toFixed(2)} m`;
      }
    } else {
      // Convert Real World to Drawing
      if (system === 'imperial') {
        // Input in feet
        const realInches = inputValue * 12;
        const drawInches = realInches / ratio;
        result = drawInches;
        formattedResult = `${drawInches.toFixed(3)} inches on print`;
      } else {
        // Input in meters
        const realCm = inputValue * 100;
        const drawCm = realCm / ratio;
        result = drawCm;
        formattedResult = `${drawCm.toFixed(2)} cm on print`;
      }
    }

    // Graphics scale factor (limits drawing preview size to max 100%)
    const previewScale = Math.min(100, Math.max(10, (inputValue / 10) * 100));

    return {
      result: Number(result.toFixed(3)),
      formattedResult,
      ratio,
      previewScale
    };
  };

  const results = calculate();

  const handleSystemChange = (sys: SystemType) => {
    setSystem(sys);
    if (sys === 'imperial') {
      setScaleKey('1/4');
      setInputValue(2.5); // standard inches
    } else {
      setScaleKey('m100');
      setInputValue(10); // standard cm
    }
  };

  const copyReport = () => {
    const text = `Architectural Scale Conversion Plan
----------------------------------------
System: ${system === 'imperial' ? 'Imperial (US standard)' : 'Metric (SI)'}
Direction: ${direction === 'draw_to_real' ? 'Drawing to Real World Space' : 'Real World Space to Drawing'}
Selected Scale: ${SCALE_PRESETS[scaleKey].label}
Input Value: ${inputValue} ${system === 'imperial' ? (direction === 'draw_to_real' ? 'in' : 'ft') : (direction === 'draw_to_real' ? 'cm' : 'm')}

Calculated Equivalent: ${results.formattedResult}
Scaling Ratio Multiplier: 1 : ${results.ratio}`;

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
            <Ruler className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span>Scale & Conversion Inputs</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Conversion Direction
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <button
                  onClick={() => setDirection('draw_to_real')}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                    direction === 'draw_to_real'
                      ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-650'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Print ➔ Site</span>
                </button>
                <button
                  onClick={() => setDirection('real_to_draw')}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                    direction === 'real_to_draw'
                      ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-650'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 animate-reverse-spin" />
                  <span>Site ➔ Print</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Scale Unit System
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {(['imperial', 'metric'] as const).map((sys) => (
                  <button
                    key={sys}
                    onClick={() => handleSystemChange(sys)}
                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold capitalize transition ${
                      system === sys
                        ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {sys}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Standard Ratio / Scale Selection
              </label>
              <select
                value={scaleKey}
                onChange={(e) => setScaleKey(e.target.value)}
                className="saas-input"
              >
                {filteredPresets.map(([k, preset]) => (
                  <option key={k} value={k}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                {direction === 'draw_to_real'
                  ? `Length on Drawing (${system === 'imperial' ? 'Inches' : 'Centimeters'})`
                  : `Length in Real World (${system === 'imperial' ? 'Feet' : 'Meters'})`}
              </label>
              <input
                type="number"
                value={inputValue}
                step={0.1}
                onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold font-mono"
              />
            </div>
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Scale Dimension Blueprint</h3>
          <p className="text-xs text-zinc-400">
            Conceptual side-by-side view. The top drafting board represents your printed blueprint line, and the bottom building model represents the actual translated real-world space.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border-4 border-zinc-800 rounded-2xl p-6 shadow-inner flex flex-col justify-between overflow-hidden">
            {/* Top row: Blueprint drawing board */}
            <div className="h-1/3 bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between relative">
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest absolute top-1 left-2">
                PRINT DRAWING SPACE
              </span>
              <div
                style={{
                  width: `${results.previewScale}%`
                }}
                className="h-2 bg-indigo-500 rounded border border-indigo-650 transition-all duration-300 relative"
              >
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-indigo-400">
                  {direction === 'draw_to_real' ? `${inputValue} units` : 'DRAFTED'}
                </span>
              </div>
            </div>

            {/* Scale translation overlay */}
            <div className="flex justify-center items-center h-8 text-[9px] font-bold text-zinc-500 uppercase tracking-widest gap-2">
              <span>Ratio: 1 : {results.ratio}</span>
              <span>➔</span>
            </div>

            {/* Bottom row: Real World Space */}
            <div className="h-1/3 bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between relative">
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest absolute top-1 left-2">
                REAL WORLD FIELD SITE
              </span>
              <div className="w-full flex items-center gap-3">
                <Landmark className="w-8 h-8 text-indigo-500/80 shrink-0" />
                <div className="h-4 bg-emerald-500/10 border border-emerald-500 rounded flex-1 flex items-center justify-center">
                  <span className="text-[9px] font-black text-emerald-500 font-mono">
                    {results.formattedResult}
                  </span>
                </div>
              </div>
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
                Conversion Results
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
                <span className="text-xs text-zinc-400 font-semibold">Equivalent Distance</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.formattedResult}
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Scale Ratio</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    1 : {results.ratio}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Unit Type</span>
                  <span className="font-bold font-mono uppercase text-indigo-500">
                    {system}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Architectural scales translate physical print measurements back to actual real-world distances. Ensure that the scale printed on title blocks matches the drawing scale before taking manual takeoffs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}