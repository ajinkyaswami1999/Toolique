import { useState } from 'react';
import { Copy, Check, Info, Users, DoorOpen, ArrowDown } from 'lucide-react';

type UnitType = 'sqft' | 'sqm';

interface OccupancyPreset {
  label: string;
  factor: number; // sq ft per person
  type: 'net' | 'gross';
}

const OCCUPANCY_PRESETS: Record<string, OccupancyPreset> = {
  assembly_chairs: { label: 'Assembly, Concentrated (Chairs Only - e.g., Auditoriums)', factor: 7, type: 'net' },
  assembly_standing: { label: 'Assembly, Standing Space (e.g., Dance Floors, Night Clubs)', factor: 5, type: 'net' },
  assembly_tables: { label: 'Assembly, Unconcentrated (Tables & Chairs - e.g., Restaurants)', factor: 15, type: 'net' },
  business: { label: 'Business (Standard Offices / Cubicles)', factor: 150, type: 'gross' },
  classroom: { label: 'Classrooms (Schools / Education)', factor: 20, type: 'net' },
  mercantile: { label: 'Mercantile (Retail Shops / Stores)', factor: 60, type: 'gross' },
  residential: { label: 'Residential Dwelling Units', factor: 200, type: 'gross' },
  storage: { label: 'Storage / Warehouses (Low Load)', factor: 300, type: 'gross' }
};

export default function OccupancyLoadCalculator() {
  const [unit, setUnit] = useState<UnitType>('sqft');
  const [area, setArea] = useState<number>(3000);
  const [presetKey, setPresetKey] = useState<string>('business');
  const [sprinklered, setSprinklered] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const preset = OCCUPANCY_PRESETS[presetKey];
    
    // Normalize area to sqft for code limits calculations
    const areaInSqFt = unit === 'sqm' ? area * 10.7639 : area;
    
    // Calculate occupant load (rounded down to nearest whole person)
    const occupants = Math.max(1, Math.floor(areaInSqFt / preset.factor));

    // Calculate minimum required exits based on IBC Chapter 10
    let minExits = 1;
    if (occupants >= 50 && occupants <= 500) minExits = 2;
    else if (occupants >= 501 && occupants <= 1000) minExits = 3;
    else if (occupants > 1000) minExits = 4;

    // Calculate required exit width (in inches)
    const stairsFactor = sprinklered ? 0.2 : 0.3;
    const levelFactor = sprinklered ? 0.15 : 0.2;

    const stairWidth = Math.max(44, occupants * stairsFactor);
    const levelWidth = Math.max(36, occupants * levelFactor);

    // Density Ratio: square feet per occupant
    const densityRatio = areaInSqFt / occupants;

    return {
      occupants,
      minExits,
      stairWidth: Number(stairWidth.toFixed(1)),
      levelWidth: Number(levelWidth.toFixed(1)),
      areaInSqFt,
      loadType: preset.type,
      densityRatio
    };
  };

  const results = calculate();

  // Determine density crowding levels
  const getDensityStatus = (ratio: number) => {
    if (ratio < 8) return { label: 'Extreme Crowding (Concentrated assembly loads)', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
    if (ratio < 25) return { label: 'Moderate Density (Classrooms / Dining)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Low Density (Spacious Office / Residential)', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
  };

  const densityStatus = getDensityStatus(results.densityRatio);

  // Maximum occupant avatar rendering limit (to avoid viewport crashing)
  const dotCount = Math.min(80, results.occupants);

  const copyReport = () => {
    const text = `Occupant Load & Fire Safety Audit
----------------------------------------
Floor Area: ${area} ${unit === 'sqft' ? 'Sq. Ft' : 'm²'}
Occupancy Classification: ${OCCUPANCY_PRESETS[presetKey].label}
Load Factor Type: ${results.loadType.toUpperCase()}
Sprinklered Building: ${sprinklered ? 'Yes' : 'No'}

Max Safe Occupant Load: ${results.occupants} Persons
Crowd Density Status: ${densityStatus.label}
Minimum Required Exit Doors: ${results.minExits} Exits
Required Egress Width (Stairs): ${results.stairWidth} inches
Required Egress Width (Level/Doors): ${results.levelWidth} inches`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Specifications */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <span>Room Specifications</span>
          </h3>

          <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-[200px]">
            {(['sqft', 'sqm'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-1 rounded-md text-xs font-bold transition ${
                  unit === u
                    ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-650'
                }`}
              >
                {u === 'sqft' ? 'Sq. Feet' : 'Sq. Meters'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Total Floor Area
              </label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Occupancy Category (IBC)
              </label>
              <select
                value={presetKey}
                onChange={(e) => setPresetKey(e.target.value)}
                className="saas-input"
              >
                {Object.keys(OCCUPANCY_PRESETS).map((k) => (
                  <option key={k} value={k}>
                    {OCCUPANCY_PRESETS[k].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              checked={sprinklered}
              id="sprinkler"
              onChange={(e) => setSprinklered(e.target.checked)}
              className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500"
            />
            <label htmlFor="sprinkler" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Sprinkler System Installed (Reduces exit widths requirement)
            </label>
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Spatial Egress Simulator</h3>
          <p className="text-xs text-zinc-400">
            Top-down architectural blueprint showing building walls, exit door swing clearance, and occupant density grids.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border-4 border-zinc-800 rounded-2xl p-6 shadow-inner flex items-center justify-center overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />

            {/* ADA 60-inch Wheelchair Turning Space dashed circle */}
            <div className="absolute w-36 h-36 border-2 border-dashed border-indigo-500/30 rounded-full flex items-center justify-center pointer-events-none">
              <span className="text-[8px] font-black text-indigo-500/50 uppercase tracking-widest text-center">
                ADA 60"<br />Turning Circle
              </span>
            </div>

            {/* Visual Egress Door Swing Arc (Bottom Door) */}
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-12 h-12 pointer-events-none">
              <svg className="w-12 h-12 text-emerald-500" viewBox="0 0 100 100">
                {/* Swing path arc */}
                <path d="M 50 100 A 50 50 0 0 0 100 50" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="6 6" />
                {/* Door leaf */}
                <line x1="50" y1="100" x2="50" y2="50" stroke="currentColor" strokeWidth="6" />
              </svg>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-500/20">
                <span>EGRESS EXIT</span>
                <ArrowDown className="w-2.5 h-2.5" />
              </div>
            </div>

            {/* Occupants grid distribution */}
            <div className="w-full h-full max-h-[80%] max-w-[90%] grid grid-cols-6 sm:grid-cols-10 gap-2 overflow-y-auto p-4 relative z-10 justify-items-center items-center">
              {Array.from({ length: dotCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-indigo-400 shadow-sm transition hover:scale-125"
                  title="Occupant Person"
                >
                  <span className="text-[8px] font-black font-mono">P</span>
                </div>
              ))}
              {results.occupants > dotCount && (
                <div className="col-span-full text-center text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full mt-2">
                  + {results.occupants - dotCount} occupants not shown in simulator
                </div>
              )}
            </div>
          </div>

          {/* Legend and Density Status */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-[9px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-indigo-400 text-[6px]">P</span>
                <span>Occupant (1 Person)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 border border-dashed border-indigo-500/40 rounded-full" />
                <span>ADA Turning Circle</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500" />
                <span>Egress Exit Swing</span>
              </div>
            </div>

            {/* Density status badge */}
            <div className={`border rounded-xl px-4 py-2 text-xs font-semibold shrink-0 text-center ${densityStatus.color}`}>
              <span className="font-bold">{densityStatus.label}</span>
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
                Safety Load Audit
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
                <span className="text-xs text-zinc-400">Max Permissible Occupancy</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.occupants} Persons
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                  <span className="font-semibold text-zinc-550 flex items-center gap-1.5">
                    <DoorOpen className="w-4 h-4 text-indigo-500" />
                    <span>Minimum Required Exits</span>
                  </span>
                  <span className="font-bold font-mono text-indigo-650 dark:text-indigo-400">
                    {results.minExits} Doors
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                  <span className="font-semibold text-zinc-550">Exit Width (Stairs)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.stairWidth} inches
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                  <span className="font-semibold text-zinc-550">Exit Width (Level Doors)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.levelWidth} inches
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                  <span className="font-semibold text-zinc-550">Average Spatial Area Share</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.densityRatio.toFixed(1)} {unit}/person
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Occupant loads dictate the layout configuration of stairways, door sizing width clearances, and egress boundaries under local municipal fire protection safety guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}