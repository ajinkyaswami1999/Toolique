import { useState } from 'react';
import { Copy, Check, Info, LayoutGrid, FileText } from 'lucide-react';

type SystemType = 'imperial' | 'metric';
type ShapeType = 'rectangle' | 'direct';

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

export default function BlueprintAreaCalculator() {
  const [system, setSystem] = useState<SystemType>('imperial');
  const [scaleKey, setScaleKey] = useState<string>('1/4');
  const [shape, setShape] = useState<ShapeType>('rectangle');
  
  // Dimensions
  const [width, setWidth] = useState<number>(5.0); // inches or cm on paper
  const [length, setLength] = useState<number>(8.0); // inches or cm on paper
  const [directPaperArea, setDirectPaperArea] = useState<number>(40); // sq in or sq cm on paper

  const [copied, setCopied] = useState(false);

  const filteredPresets = Object.entries(SCALE_PRESETS).filter(
    ([_, p]) => p.system === system
  );

  const calculate = () => {
    const preset = SCALE_PRESETS[scaleKey] || SCALE_PRESETS['1/4'];
    const ratio = preset.ratio;

    let realAreaSqM = 0;
    let realAreaSqFt = 0;
    let realWidth = 0;
    let realLength = 0;

    if (shape === 'rectangle') {
      if (system === 'imperial') {
        // Width and length in inches.
        // Real dimension in feet = (val * ratio) / 12
        realWidth = (width * ratio) / 12;
        realLength = (length * ratio) / 12;
        realAreaSqFt = realWidth * realLength;
        realAreaSqM = realAreaSqFt * 0.092903;
      } else {
        // Width and length in cm.
        // Real dimension in meters = (val * ratio) / 100
        realWidth = (width * ratio) / 100;
        realLength = (length * ratio) / 100;
        realAreaSqM = realWidth * realLength;
        realAreaSqFt = realAreaSqM / 0.092903;
      }
    } else {
      // Direct Area: Area = PaperArea * (Ratio ^ 2)
      if (system === 'imperial') {
        // Paper area in sq inches
        // Real area in sq feet = (paperArea * ratio^2) / 144
        realAreaSqFt = (directPaperArea * Math.pow(ratio, 2)) / 144;
        realAreaSqM = realAreaSqFt * 0.092903;
      } else {
        // Paper area in sq cm
        // Real area in sq meters = (paperArea * ratio^2) / 10000
        realAreaSqM = (directPaperArea * Math.pow(ratio, 2)) / 10000;
        realAreaSqFt = realAreaSqM / 0.092903;
      }
    }

    // Indian Land Unit conversions
    // 1 Guntha = 1089 sq ft
    // 1 Cent = 435.6 sq ft
    const guntha = realAreaSqFt / 1089;
    const cent = realAreaSqFt / 435.6;

    return {
      realWidth: Number(realWidth.toFixed(2)),
      realLength: Number(realLength.toFixed(2)),
      realAreaSqFt: Number(realAreaSqFt.toFixed(1)),
      realAreaSqM: Number(realAreaSqM.toFixed(1)),
      guntha: Number(guntha.toFixed(3)),
      cent: Number(cent.toFixed(3))
    };
  };

  const results = calculate();

  const handleSystemChange = (sys: SystemType) => {
    setSystem(sys);
    if (sys === 'imperial') {
      setScaleKey('1/4');
      setWidth(5);
      setLength(8);
      setDirectPaperArea(40);
    } else {
      setScaleKey('m100');
      setWidth(10);
      setLength(15);
      setDirectPaperArea(150);
    }
  };

  const copyReport = () => {
    const preset = SCALE_PRESETS[scaleKey];
    const text = `Blueprint Area Analysis Report
----------------------------------------
Scale Setting: ${preset.label}
Shape Type: ${shape === 'rectangle' ? 'Rectangular Bay' : 'Direct Area Input'}
Measured Paper Space: ${shape === 'rectangle' ? `${width} x ${length} ${preset.unit}` : `${directPaperArea} sq ${preset.unit}`}

Real-World Dimension Results:
${shape === 'rectangle' ? `Actual Width: ${results.realWidth} ${system === 'imperial' ? 'ft' : 'm'}\nActual Length: ${results.realLength} ${system === 'imperial' ? 'ft' : 'm'}\n` : ''}Actual Area: ${results.realAreaSqFt} Sq Ft (${results.realAreaSqM} Sq M)
Indian regional land units: ${results.guntha} Gunthas | ${results.cent} Cents`;

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
            <LayoutGrid className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span>Blueprint Area Inputs</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
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

            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Calculation Mode
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <button
                  onClick={() => setShape('rectangle')}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition ${
                    shape === 'rectangle'
                      ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-650'
                  }`}
                >
                  Dimensions
                </button>
                <button
                  onClick={() => setShape('direct')}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition ${
                    shape === 'direct'
                      ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-650'
                  }`}
                >
                  Direct Area
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Ratio / Scale Selection
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
          </div>

          {shape === 'rectangle' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                  Width on Paper ({SCALE_PRESETS[scaleKey]?.unit})
                </label>
                <input
                  type="number"
                  value={width}
                  step={0.1}
                  onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                  className="saas-input font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                  Length on Paper ({SCALE_PRESETS[scaleKey]?.unit})
                </label>
                <input
                  type="number"
                  value={length}
                  step={0.1}
                  onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                  className="saas-input font-bold font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="border-t pt-4">
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Total Area on Paper (Sq {SCALE_PRESETS[scaleKey]?.unit})
              </label>
              <input
                type="number"
                value={directPaperArea}
                step={1}
                onChange={(e) => setDirectPaperArea(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold font-mono"
              />
            </div>
          )}
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Blueprint Plan View</h3>
          <p className="text-xs text-zinc-400">
            Conceptual architectural blueprint view. Top-down layout of the room representing both paper dimensions and real-world areas.
          </p>

          <div className="relative w-full aspect-[16/9] bg-indigo-950/20 border-4 border-indigo-900 rounded-2xl p-6 shadow-inner flex items-center justify-center overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-40 pointer-events-none" />

            {/* Room footprint (proportional size box) */}
            <div className="w-48 h-32 bg-indigo-900/10 border-2 border-indigo-400/80 rounded flex flex-col justify-center items-center shadow-lg relative">
              {/* Width dimension arrow top */}
              {shape === 'rectangle' && (
                <div className="absolute -top-6 left-0 right-0 flex justify-between items-center text-[8px] font-black text-indigo-400">
                  <span>◀</span>
                  <span>Paper Width: {width} {SCALE_PRESETS[scaleKey]?.unit}</span>
                  <span>▶</span>
                </div>
              )}

              {/* Length dimension arrow side */}
              {shape === 'rectangle' && (
                <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between items-center text-[8px] font-black text-indigo-400 [writing-mode:vertical-lr] rotate-180">
                  <span>◀</span>
                  <span>Paper Length: {length} {SCALE_PRESETS[scaleKey]?.unit}</span>
                  <span>▶</span>
                </div>
              )}

              {/* Center tags */}
              <span className="text-[7px] font-black text-indigo-500 uppercase tracking-widest text-center leading-none mb-1">
                BLUEPRINT ROOM
              </span>
              <span className="text-[11px] font-black text-indigo-400 font-mono">
                {results.realAreaSqFt} Sq Ft
              </span>
              <span className="text-[8px] font-bold text-slate-500 font-mono mt-0.5">
                ({results.realAreaSqM} Sq M)
              </span>
            </div>

            <div className="absolute top-2 left-3 bg-slate-900 border border-slate-800 px-3 py-1 rounded text-[7px] font-black uppercase tracking-widest text-indigo-400">
              Scale 1 : {SCALE_PRESETS[scaleKey]?.ratio}
            </div>
          </div>
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Area Analysis</span>
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
                <span className="text-xs text-zinc-400">Real-World Actual Area</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.realAreaSqFt} Sq Ft
                </div>
                <div className="text-sm font-bold font-mono text-indigo-650 dark:text-indigo-400 mt-1">
                  ({results.realAreaSqM} Sq M)
                </div>
              </div>

              {shape === 'rectangle' && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Actual Real Width</span>
                    <span className="font-bold font-mono">{results.realWidth} {system === 'imperial' ? 'ft' : 'm'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Actual Real Length</span>
                    <span className="font-bold font-mono">{results.realLength} {system === 'imperial' ? 'ft' : 'm'}</span>
                  </div>
                </div>
              )}

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-zinc-500 font-semibold">
                  <span>Indian Land Units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Gunthas</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{results.guntha} Gunthas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Cents</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{results.cent} Cents</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Blueprint area calculations map linear paper increments to actual model spaces by applying a squared area scale factor (Scale Ratio²).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}