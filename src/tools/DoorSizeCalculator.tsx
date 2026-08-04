import { useState } from 'react';
import { Copy, Check, Info, ShieldCheck, Ruler, Accessibility } from 'lucide-react';

type UnitType = 'mm' | 'in';
type OccupancyClass = 'residential' | 'office' | 'educational' | 'assembly' | 'hospital';

interface OccupancyConfig {
  label: string;
  minWidthM: number; // minimum width in meters
  egressFactorMM: number; // mm per person
  desc: string;
}

const OCCUPANCY_PRESETS: Record<OccupancyClass, OccupancyConfig> = {
  residential: {
    label: 'Residential (NBC Group A)',
    minWidthM: 0.9,
    egressFactorMM: 10,
    desc: 'Standard rooms require 0.9m width. External exit doors must be minimum 1.0m width.'
  },
  office: {
    label: 'Business / Office (Group E)',
    minWidthM: 1.0,
    egressFactorMM: 10,
    desc: 'Standard exit width of 1.0m applies. High capacity corridors require wider double doors.'
  },
  educational: {
    label: 'Educational / Schools (Group B)',
    minWidthM: 1.2,
    egressFactorMM: 10,
    desc: 'Classrooms require 1.2m doors to accommodate quick student evacuation and bag clearances.'
  },
  assembly: {
    label: 'Assembly / Auditoriums (Group D)',
    minWidthM: 1.5,
    egressFactorMM: 10,
    desc: 'Heavy crowd movement. Exit doors must be minimum 1.5m and open outwards.'
  },
  hospital: {
    label: 'Institutional / Hospitals (Group C)',
    minWidthM: 2.0,
    egressFactorMM: 10,
    desc: 'Requires 2.0m double-leaf doors for unobstructed rolling stretcher and bed passage.'
  }
};

export default function DoorSizeCalculator() {
  const [unit, setUnit] = useState<UnitType>('mm');
  const [occupancy, setOccupancy] = useState<OccupancyClass>('residential');
  const [occupants, setOccupants] = useState<number>(80);
  const [doorHeightInput, setDoorHeightInput] = useState<number>(2100); // mm
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const preset = OCCUPANCY_PRESETS[occupancy];

    // Compute required width based on occupant load egress factor
    const calculatedWidthM = (occupants * preset.egressFactorMM) / 1000;
    
    // Choose the maximum between calculation, the minimum set by occupancy class, and the absolute ADA clearance (813mm)
    const rawWidthM = Math.max(calculatedWidthM, preset.minWidthM, 0.813);
    const finalWidthM = Math.round(rawWidthM * 100) / 100; // Round to nearest cm

    // Standard structural values
    const finalHeightM = doorHeightInput / 1000;
    const frameThicknessM = 0.05; // 50mm typical

    // Determine door style configuration
    const isDoubleDoor = finalWidthM > 1.2;

    // Conversions
    const scale = unit === 'in' ? 39.3701 : 1000;
    const dispWidth = Number((finalWidthM * scale).toFixed(0));
    const dispHeight = Number((finalHeightM * scale).toFixed(0));
    const dispFrame = Number((frameThicknessM * scale).toFixed(0));
    
    // Rough opening is typical clear opening + frame + 10mm tolerance shim gap on each side
    const roughWidth = Number(((finalWidthM + (frameThicknessM * 2) + 0.02) * scale).toFixed(0));
    const roughHeight = Number(((finalHeightM + frameThicknessM + 0.01) * scale).toFixed(0));

    // Exit count recommendation based on building safety rules
    let recommendedExits = 1;
    if (occupants > 500) recommendedExits = 3;
    else if (occupants > 50) recommendedExits = 2;

    return {
      width: dispWidth,
      height: dispHeight,
      frameThickness: dispFrame,
      roughWidth,
      roughHeight,
      isDoubleDoor,
      recommendedExits,
      adaCompliant: finalWidthM >= 0.813,
      calculatedWidthM
    };
  };

  const results = calculate();

  const handleUnitChange = (newUnit: UnitType) => {
    setUnit(newUnit);
    // Convert current height input representation
    if (newUnit === 'in' && unit === 'mm') {
      setDoorHeightInput(Number((doorHeightInput / 25.4).toFixed(0)));
    } else if (newUnit === 'mm' && unit === 'in') {
      setDoorHeightInput(Number((doorHeightInput * 25.4).toFixed(0)));
    }
  };

  const copyReport = () => {
    const text = `Door Size & Egress Clearance Audit (${OCCUPANCY_PRESETS[occupancy].label})
----------------------------------------
Occupant Load: ${occupants} Persons
Nominal Door Style: ${results.isDoubleDoor ? 'Double-Leaf Swing Door' : 'Single-Leaf Swing Door'}

Calculated Egress Specs:
- Clear Opening Width: ${results.width} ${unit}
- Clear Opening Height: ${results.height} ${unit}
- Frame Thickness: ${results.frameThickness} ${unit}

Rough Framing Openings (Min):
- Structural Rough Width: ${results.roughWidth} ${unit}
- Structural Rough Height: ${results.roughHeight} ${unit}
- Minimum Exits Required: ${results.recommendedExits} Door(s)
- ADA Accessibility Compliance: ${results.adaCompliant ? 'PASS' : 'FAIL'}`;

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
            <span>Evacuation & Framing Parameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Occupancy Class
              </label>
              <select
                value={occupancy}
                onChange={(e) => setOccupancy(e.target.value as OccupancyClass)}
                className="saas-input font-bold"
              >
                {Object.entries(OCCUPANCY_PRESETS).map(([k, config]) => (
                  <option key={k} value={k}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Scale Unit System
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {(['mm', 'in'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`flex-1 py-1 rounded-md text-xs font-bold transition ${
                      unit === u
                        ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-zinc-450 hover:text-zinc-650'
                    }`}
                  >
                    {u === 'mm' ? 'Millimeters' : 'Inches'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Occupant Load count
              </label>
              <input
                type="number"
                value={occupants}
                onChange={(e) => setOccupants(Math.max(1, parseInt(e.target.value) || 0))}
                className="saas-input font-bold"
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 italic leading-relaxed">
            {OCCUPANCY_PRESETS[occupancy].desc}
          </p>

          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
            <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
              Clear Framing Door Height ({unit})
            </label>
            <input
              type="number"
              value={doorHeightInput}
              onChange={(e) => setDoorHeightInput(parseFloat(e.target.value) || 0)}
              className="saas-input font-bold"
            />
          </div>
        </div>

        {/* Dynamic CAD Blueprint elevation rendering */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Front Elevation Blueprint</h3>
          <p className="text-xs text-zinc-450">
            Interactive engineering front elevation. Shows dynamic clearance guides and changes between Single-Leaf and Double-Leaf layout according to width requirement.
          </p>

          <div className="relative w-full aspect-[16/10] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none" />

            {/* Dynamic Door Vector */}
            <div className="relative w-56 h-72 flex flex-col justify-end items-center">
              {/* Outer frame */}
              <div className="absolute inset-x-0 bottom-0 top-8 border-4 border-slate-700/60 rounded-t bg-slate-900/10 flex">
                {results.isDoubleDoor ? (
                  <>
                    {/* Double Doors */}
                    <div className="flex-1 border-r-2 border-indigo-500/70 relative flex items-center justify-center">
                      <div className="w-1.5 h-6 bg-amber-500 rounded-full absolute right-2 top-1/2 -translate-y-1/2" />
                      <span className="text-[7px] text-zinc-550 select-none uppercase tracking-widest font-black rotate-90">Leaf A</span>
                    </div>
                    <div className="flex-1 relative flex items-center justify-center">
                      <div className="w-1.5 h-6 bg-amber-500 rounded-full absolute left-2 top-1/2 -translate-y-1/2" />
                      <span className="text-[7px] text-zinc-550 select-none uppercase tracking-widest font-black rotate-90">Leaf B</span>
                    </div>
                  </>
                ) : (
                  // Single Door
                  <div className="w-full relative flex items-center justify-center">
                    <div className="w-2 h-6 bg-amber-500 rounded-full absolute right-3 top-1/2 -translate-y-1/2" />
                    <span className="text-[7px] text-zinc-550 select-none uppercase tracking-widest font-black">Single Swing Leaf</span>
                  </div>
                )}
              </div>

              {/* Dimension indicators */}
              {/* Width dimension line */}
              <div className="absolute -bottom-4 inset-x-0 h-4 flex items-center justify-between border-x border-amber-500/30">
                <div className="w-full border-t border-amber-500/60 relative flex justify-center">
                  <span className="bg-zinc-950 px-1 text-[8px] font-black text-amber-500 -translate-y-1/2 font-mono">
                    W: {results.width} {unit}
                  </span>
                </div>
              </div>

              {/* Height dimension line */}
              <div className="absolute top-8 bottom-0 -right-6 w-4 flex flex-col items-center justify-between border-y border-amber-500/30">
                <div className="h-full border-l border-amber-500/60 relative flex items-center justify-center">
                  <span className="bg-zinc-950 py-0.5 text-[8px] font-black text-amber-500 font-mono rotate-90 whitespace-nowrap">
                    H: {results.height} {unit}
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
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Egress Schedule Code</span>
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
                <span className="text-xs text-zinc-400">Clear Opening Width</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.width} <span className="text-sm font-semibold">{unit}</span>
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border self-start ${
                    results.adaCompliant
                      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
                      : 'text-rose-500 bg-rose-500/10 border-rose-500/30'
                  }`}>
                    <Accessibility className="w-3.5 h-3.5" />
                    <span>ADA Accessible Open Space: {results.adaCompliant ? 'PASS' : 'FAIL (Min 32 in / 813mm)'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Required Exit Units</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.recommendedExits} Escape Exit(s)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Door Frame Style</span>
                  <span className="font-bold text-indigo-500">
                    {results.isDoubleDoor ? 'Double-Leaf Swing' : 'Single-Leaf Swing'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Recommended Structural Rough Opening</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Rough Width (Min)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.roughWidth} {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Rough Height (Min)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.roughHeight} {unit}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Egress exit dimensions prevent crowding bottlenecks. ADA clearance requires a minimum of 32 inches clear open width when measured with the door open at 90 degrees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}