import { useState } from 'react';
import { Copy, Check, Info, ShieldCheck, Ruler, Users, ShieldAlert, ArrowRight } from 'lucide-react';

type UnitType = 'sqm' | 'sqft';
type CategoryType = 'assembly_seat' | 'assembly_table' | 'classroom' | 'office' | 'retail' | 'residential' | 'storage';

interface LoadPreset {
  label: string;
  factorSqm: number; // sqm per person
  factorSqft: number; // sqft per person
  desc: string;
}

const OCCUPANT_PRESETS: Record<CategoryType, LoadPreset> = {
  assembly_seat: {
    label: 'Assembly (Chairs Only)',
    factorSqm: 0.65, // approx 7 sqft
    factorSqft: 7,
    desc: 'Theaters, auditoriums, and concentrated assembly rooms.'
  },
  assembly_table: {
    label: 'Assembly (Tables & Chairs)',
    factorSqm: 1.4, // approx 15 sqft
    factorSqft: 15,
    desc: 'Restaurants, banquet halls, and conference spaces.'
  },
  classroom: {
    label: 'Classroom (Educational)',
    factorSqm: 1.8, // 20 sqft
    factorSqft: 20,
    desc: 'School classrooms and standard study labs.'
  },
  office: {
    label: 'Business / Office',
    factorSqm: 9.3, // 100 sqft
    factorSqft: 100,
    desc: 'Standard commercial offices, meeting rooms, and cubicles.'
  },
  retail: {
    label: 'Mercantile / Retail',
    factorSqm: 2.8, // 30 sqft
    factorSqft: 30,
    desc: 'Shopping centers, department store showrooms, and markets.'
  },
  residential: {
    label: 'Residential Apartment',
    factorSqm: 18.6, // 200 sqft
    factorSqft: 200,
    desc: 'Living units, apartments, and hotel dormitories.'
  },
  storage: {
    label: 'Industrial / Storage',
    factorSqm: 28, // 300 sqft
    factorSqft: 300,
    desc: 'Warehouses, loading zones, and manufacturing floors.'
  }
};

export default function OccupantLoadCalculator() {
  const [unit, setUnit] = useState<UnitType>('sqft');
  const [category, setCategory] = useState<CategoryType>('office');
  const [floorArea, setFloorArea] = useState<number>(5000);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const preset = OCCUPANT_PRESETS[category];
    const factor = unit === 'sqm' ? preset.factorSqm : preset.factorSqft;

    // Occupant load = Area / Factor
    const occupantLoad = Math.max(1, Math.ceil(floorArea / factor));

    // Exit Egress count rules (IBC / NBC)
    // 1-49: 1 exit, 50-500: 2 exits, 501-1000: 3 exits, >1000: 4 exits
    let requiredExits = 1;
    if (occupantLoad > 1000) requiredExits = 4;
    else if (occupantLoad > 500) requiredExits = 3;
    else if (occupantLoad >= 50) requiredExits = 2;

    // Exit Width factors (5mm [0.2"] per person for doors; 7.5mm [0.3"] for stairs)
    const factorDoor = unit === 'sqm' ? 5 : 0.2; // mm or inches
    const factorStairs = unit === 'sqm' ? 7.5 : 0.3; // mm or inches

    const minDoorWidth = occupantLoad * factorDoor;
    const minStairWidth = occupantLoad * factorStairs;

    return {
      occupantLoad,
      requiredExits,
      minDoorWidth: Number(minDoorWidth.toFixed(0)),
      minStairWidth: Number(minStairWidth.toFixed(0)),
      factor,
      // visual elements
      avatarCount: Math.min(24, Math.ceil(occupantLoad / 2))
    };
  };

  const results = calculate();

  const handleUnitChange = (newUnit: UnitType) => {
    const factor = newUnit === 'sqft' ? 10.7639 : 1 / 10.7639;
    setUnit(newUnit);
    setFloorArea(Number((floorArea * factor).toFixed(0)));
  };

  const copyReport = () => {
    const areaUnit = unit === 'sqm' ? 'sq m' : 'sq ft';
    const lenUnit = unit === 'sqm' ? 'mm' : 'in';
    const text = `Fire Code Occupant Load & Egress Audit
----------------------------------------
Building Classification: ${OCCUPANT_PRESETS[category].label}
Gross Floor Area: ${floorArea} ${areaUnit}
Occupant Load Factor: ${results.factor} ${areaUnit} per person

Egress Clearance Schedule:
- Calculated Occupant Load: ${results.occupantLoad} People
- Minimum Required Fire Exits: ${results.requiredExits} Exits
- Minimum Egress Width (Doors/Ramps): ${results.minDoorWidth} ${lenUnit}
- Minimum Egress Width (Stairways): ${results.minStairWidth} ${lenUnit}`;

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
            <span>Occupancy & Egress Parameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Assembly Classification
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="saas-input font-bold"
              >
                {Object.entries(OCCUPANT_PRESETS).map(([k, preset]) => (
                  <option key={k} value={k}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Scale Unit System
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {(['sqm', 'sqft'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                      unit === u
                        ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {u === 'sqm' ? 'Sq Meters' : 'Sq Feet'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Gross Floor Area ({unit === 'sqm' ? 'sq m' : 'sq ft'})
              </label>
              <input
                type="number"
                value={floorArea}
                onChange={(e) => setFloorArea(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed italic">
            {OCCUPANT_PRESETS[category].desc}
          </p>
        </div>

        {/* Dynamic CAD Floor Plan Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Interactive CAD Occupancy Simulator</h3>
          <p className="text-xs text-zinc-455">
            AutoCAD viewport simulation. Silhouettes represent occupant load. Green wall gaps indicate active fire exit doors required by fire code.
          </p>

          <div className="relative w-full aspect-[16/10] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none" />

            {/* Scale proportional elevation vector */}
            <div className="w-[85%] h-[80%] border-2 border-slate-700/60 rounded bg-zinc-900/10 relative flex flex-wrap gap-4 p-6 items-center justify-center">
              <span className="absolute top-2 left-2 text-[6.5px] font-black text-slate-500 tracking-widest uppercase">
                ROOM PLAN VIEWPORT ({floorArea} {unit === 'sqm' ? 'sqm' : 'sqft'})
              </span>

              {/* Dynamic exit doors on left/right walls */}
              {Array.from({ length: results.requiredExits }).map((_, idx) => (
                <div
                  key={idx}
                  className={`absolute bg-emerald-500 border border-emerald-400 w-1.5 h-10 flex items-center justify-center ${
                    idx === 0
                      ? 'left-0 top-1/4 -translate-x-1/2'
                      : idx === 1
                      ? 'right-0 top-1/4 translate-x-1/2'
                      : idx === 2
                      ? 'left-0 top-2/3 -translate-x-1/2'
                      : 'right-0 top-2/3 translate-x-1/2'
                  }`}
                >
                  <span className="text-[4px] text-white font-bold uppercase rotate-90">EXIT</span>
                </div>
              ))}

              {/* Occupant avatars grid */}
              {Array.from({ length: results.avatarCount }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/50 flex items-center justify-center shadow-lg relative"
                >
                  <Users className="w-3 h-3 text-indigo-400" />
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
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Fire Code Egress</span>
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
                <span className="text-xs text-zinc-455">Total Occupant Load</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.occupantLoad} <span className="text-sm font-semibold">People</span>
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border self-start ${
                    results.occupantLoad >= 50
                      ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
                      : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
                  }`}>
                    {results.occupantLoad >= 50 ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>Code Category: {results.occupantLoad >= 50 ? 'HIGH DENSITY ASSEMBLY' : 'LOW DENSITY SPACE'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Required Exit Hardware</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Minimum Exit Doors</span>
                  <span className="font-bold text-zinc-950 dark:text-white flex items-center gap-1">
                    <span>{results.requiredExits} doors</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Door/Ramp Clear Width</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.minDoorWidth} {unit === 'sqm' ? 'mm' : 'in'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Stairway Clear Width</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.minStairWidth} {unit === 'sqm' ? 'mm' : 'in'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Bylaw Factor Details</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Occupant Load Factor</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.factor} {unit === 'sqm' ? 'sq m' : 'sq ft'} / person
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Occupant loads dictate the width of corridors, doors, and stairs. If an auditorium holds 300 people, the exit hardware must sustain rapid evacuation. Ensure exit widths meet IBC prescriptive factors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}