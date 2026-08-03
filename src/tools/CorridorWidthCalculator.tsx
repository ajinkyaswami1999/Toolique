import { useState } from 'react';
import { Copy, Check, Info, Shield, Construction } from 'lucide-react';

type UnitType = 'in' | 'cm';
type UseType = 'business' | 'residential' | 'educational' | 'healthcare';

interface UseConfig {
  label: string;
  baseWidth: number; // inches
  baseWidthUnder50: number; // inches
}

const USE_PRESETS: Record<UseType, UseConfig> = {
  business: { label: 'Business / Commercial Office (IBC 1020)', baseWidth: 44, baseWidthUnder50: 36 },
  residential: { label: 'Residential Apartments / Hotels', baseWidth: 44, baseWidthUnder50: 36 },
  educational: { label: 'Educational (Schools / Academies)', baseWidth: 72, baseWidthUnder50: 72 },
  healthcare: { label: 'Healthcare (Hospitals / Care Facilities)', baseWidth: 96, baseWidthUnder50: 96 }
};

export default function CorridorWidthCalculator() {
  const [unit, setUnit] = useState<UnitType>('in');
  const [useType, setUseType] = useState<UseType>('business');
  const [occupants, setOccupants] = useState<number>(120);
  const [sprinklered, setSprinklered] = useState<boolean>(true);
  const [doorProjection, setDoorProjection] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const preset = USE_PRESETS[useType];
    
    // 1. Determine baseline code minimum based on occupant threshold
    const baselineMin = occupants >= 50 ? preset.baseWidth : preset.baseWidthUnder50;

    // 2. Capacity-based calculation (inches per occupant)
    // IBC Section 1005.3.2: 0.2 inches/occupant (0.15 inches if sprinklered)
    const factor = sprinklered ? 0.15 : 0.2;
    const capacityMin = occupants * factor;

    // 3. Door projection adjustment
    // IBC requires that door swings cannot encroach more than 7 inches into required clear width
    const doorBuffer = doorProjection ? 7 : 0;

    // Final clear width
    const finalInches = Math.max(baselineMin, capacityMin) + doorBuffer;

    // Unit conversion
    const finalWidth = unit === 'cm' ? finalInches * 2.54 : finalInches;
    const codeMin = unit === 'cm' ? baselineMin * 2.54 : baselineMin;

    // Interactive graphics scale factor
    const visualScale = Math.min(100, (finalInches / 96) * 100);

    return {
      codeMin: Number(codeMin.toFixed(1)),
      finalWidth: Number(finalWidth.toFixed(1)),
      finalInches,
      visualScale
    };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Corridor Egress & Accessibility Width Audit
----------------------------------------
Occupancy Classification: ${USE_PRESETS[useType].label}
Occupant Load: ${occupants} Persons
Sprinkler System: ${sprinklered ? 'Yes' : 'No'}
Door Encroachment Buffer: ${doorProjection ? 'Yes (7" added)' : 'No'}

Base Code Minimum Width: ${results.codeMin} ${unit}
Required Clear Egress Width: ${results.finalWidth} ${unit}`;

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
            <Construction className="w-5 h-5 text-indigo-500" />
            <span>Design Parameters</span>
          </h3>

          <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-[200px]">
            {(['in', 'cm'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-1 rounded-md text-xs font-bold transition ${
                  unit === u
                    ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-650'
                }`}
              >
                {u === 'in' ? 'Inches' : 'Centimeters'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Occupancy Category
              </label>
              <select
                value={useType}
                onChange={(e) => setUseType(e.target.value as UseType)}
                className="saas-input"
              >
                {Object.keys(USE_PRESETS).map((k) => (
                  <option key={k} value={k}>
                    {USE_PRESETS[k as UseType].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Design Occupant Load
              </label>
              <input
                type="number"
                value={occupants}
                onChange={(e) => setOccupants(parseInt(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={sprinklered}
                id="sprinkler"
                onChange={(e) => setSprinklered(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500"
              />
              <label htmlFor="sprinkler" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Sprinkler System Present
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={doorProjection}
                id="door"
                onChange={(e) => setDoorProjection(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500"
              />
              <label htmlFor="door" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Include Door Swing Projection (+7")
              </label>
            </div>
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Corridor Egress Blueprint</h3>
          <p className="text-xs text-zinc-400">
            Top-down blueprint. Double structural wall linings enclose the clear egress corridor path. Renders wheelchair clearance limits and active doors encroachment.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border-4 border-zinc-800 rounded-2xl flex items-center justify-center p-8 shadow-inner overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-25 pointer-events-none" />

            {/* Left Corridor Boundary Wall */}
            <div className="absolute top-0 bottom-0 left-12 w-4 bg-zinc-800 border-r border-zinc-700 flex flex-col justify-around text-[7px] text-zinc-600 font-bold overflow-hidden pointer-events-none">
              <span>WALL</span>
              <span>WALL</span>
              <span>WALL</span>
            </div>

            {/* Right Corridor Boundary Wall (scaled width) */}
            <div
              style={{
                left: `${12 + Math.max(25, results.visualScale * 0.7)}%`
              }}
              className="absolute top-0 bottom-0 w-4 bg-zinc-800 border-l border-zinc-700 flex flex-col justify-around text-[7px] text-zinc-600 font-bold overflow-hidden transition-all duration-300 pointer-events-none"
            >
              <span>WALL</span>
              <span>WALL</span>
              <span>WALL</span>
            </div>

            {/* ADA 36-inch wheelchair clearance path indicator (underlay) */}
            <div
              style={{
                left: '4.5rem',
                width: '3.5rem'
              }}
              className="absolute top-4 bottom-4 border border-dashed border-indigo-500/20 bg-indigo-500/5 rounded flex items-center justify-center pointer-events-none"
            >
              <span className="text-[7px] font-black text-indigo-550 uppercase tracking-widest -rotate-90">
                ADA Wheelchair Path (36")
              </span>
            </div>

            {/* SVG Door swing encroachment (if checked) */}
            {doorProjection && (
              <div
                style={{
                  left: `${12 + Math.max(25, results.visualScale * 0.7) - 1.5}%`
                }}
                className="absolute top-1/4 w-8 h-8 pointer-events-none z-10 transition-all duration-300"
              >
                <svg className="w-8 h-8 text-rose-500" viewBox="0 0 100 100">
                  {/* Swing line */}
                  <path d="M 0 50 A 50 50 0 0 0 50 100" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="6 6" />
                  {/* Door leaf */}
                  <line x1="0" y1="50" x2="50" y2="50" stroke="currentColor" strokeWidth="6" />
                </svg>
                <span className="absolute -top-4 left-0 text-[6px] text-rose-500 font-black uppercase">
                  DOOR SWING
                </span>
              </div>
            )}

            {/* Centerline Egress direction arrow */}
            <div
              style={{
                left: `${12 + Math.max(25, results.visualScale * 0.7) / 2}%`
              }}
              className="absolute top-1/2 -translate-y-1/2 h-0.5 w-12 border-t border-dashed border-zinc-500 flex items-center justify-end pointer-events-none transition-all duration-300"
            >
              <span className="text-[8px] font-bold text-zinc-500 mr-2 uppercase bg-zinc-950 px-1">
                EGRESS DIRECTION
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
                Egress Analysis
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
                <span className="text-xs text-zinc-400 font-semibold">Required Clear Width</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.finalWidth} {unit}
                </div>
                {results.finalInches < 44 && (
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 mt-2 border border-amber-500/20">
                    <Info className="w-3.5 h-3.5" />
                    <span>Wheelchair passing restrictions may apply</span>
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                  <span className="font-semibold text-zinc-550 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span>Base Code Minimum Width</span>
                  </span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.codeMin} {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Occupant Load Threshold</span>
                  <span className="font-bold font-mono">{occupants} Persons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Capacity Load Factor</span>
                  <span className="font-bold font-mono">
                    {sprinklered ? '0.15' : '0.20'}" / person
                  </span>
                </div>
                {doorProjection && (
                  <div className="flex justify-between text-rose-500">
                    <span>Door Swing Buffer Added</span>
                    <span className="font-bold font-mono">+7 inches</span>
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Corridor widths are regulated by life safety code guidelines to prevent structural bottlenecks during emergency panic evacuations. ADA mandates a minimum of 36 inches for general wheelchair passage, with 60-inch passing alcoves every 200 feet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}