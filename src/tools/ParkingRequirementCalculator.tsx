import { useState } from 'react';
import { Copy, Check, Info, ShieldCheck, Ruler, LayoutGrid } from 'lucide-react';

type UnitType = 'sqm' | 'sqft';
type BldgType = 'office' | 'retail' | 'residential' | 'hotel';
type ParkingAngle = '90' | '60' | '45' | '0'; // 0 is parallel

interface ParkingSpec {
  bayWidth: number; // meters
  bayLength: number; // meters
  aisleWidth: number; // meters
  label: string;
}

const PARKING_SPECS: Record<ParkingAngle, ParkingSpec> = {
  '90': { bayWidth: 2.5, bayLength: 5.0, aisleWidth: 6.0, label: '90° Perpendicular' },
  '60': { bayWidth: 2.5, bayLength: 5.4, aisleWidth: 4.5, label: '60° Angled' },
  '45': { bayWidth: 2.5, bayLength: 5.2, aisleWidth: 3.8, label: '45° Angled' },
  '0': { bayWidth: 2.4, bayLength: 6.0, aisleWidth: 3.5, label: 'Parallel' }
};

interface BldgConfig {
  label: string;
  ratioSqm: number; // 1 space per X sqm
  ratioSqft: number; // 1 space per X sqft
  desc: string;
}

const BLDG_PRESETS: Record<BldgType, BldgConfig> = {
  office: {
    label: 'Office / Business',
    ratioSqm: 100, // 1 ECS per 100 sqm (NBC India)
    ratioSqft: 300, // 1 spot per 300 sqft (US Zoning)
    desc: 'Bylaws mandate 1 ECS per 100 sqm of built-up area for commercial offices.'
  },
  retail: {
    label: 'Retail / Shopping Mall',
    ratioSqm: 50, // 1 ECS per 50 sqm (NBC India)
    ratioSqft: 250, // 1 spot per 250 sqft
    desc: 'High traffic commercial zones require denser parking allocations.'
  },
  residential: {
    label: 'Residential Apartment',
    ratioSqm: 75, // approx 1 per flat
    ratioSqft: 500, // dwelling unit factor
    desc: 'Based on tenement dimensions. Standard is 1 space per 2-bedroom unit.'
  },
  hotel: {
    label: 'Hotel / Hospitality',
    ratioSqm: 120,
    ratioSqft: 400,
    desc: 'Based on guest rooms. 1 space per 4 rooms plus banquet space factors.'
  }
};

export default function ParkingRequirementCalculator() {
  const [unit, setUnit] = useState<UnitType>('sqft');
  const [bldgType, setBldgType] = useState<BldgType>('office');
  const [floorArea, setFloorArea] = useState<number>(25000);
  const [layoutAngle, setLayoutAngle] = useState<ParkingAngle>('90');
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const preset = BLDG_PRESETS[bldgType];
    const ratio = unit === 'sqm' ? preset.ratioSqm : preset.ratioSqft;
    
    // Total spaces required
    const totalSpaces = Math.max(1, Math.ceil(floorArea / ratio));

    // ADA Accessible parking ratio calculation
    // 1-25 spaces: 1 accessible, 26-50: 2, 51-75: 3, 76-100: 4, 101-150: 5, 151-200: 6
    let accessibleSpots = 1;
    if (totalSpaces > 150) {
      accessibleSpots = Math.ceil(totalSpaces * 0.02) + 2;
    } else if (totalSpaces > 100) {
      accessibleSpots = 5;
    } else if (totalSpaces > 75) {
      accessibleSpots = 4;
    } else if (totalSpaces > 50) {
      accessibleSpots = 3;
    } else if (totalSpaces > 25) {
      accessibleSpots = 2;
    }

    // Physical Dimension metrics
    const spec = PARKING_SPECS[layoutAngle];
    const factor = unit === 'sqft' ? 3.28084 : 1; // meter to feet

    const dBayWidth = spec.bayWidth * factor;
    const dBayLength = spec.bayLength * factor;
    const dAisleWidth = spec.aisleWidth * factor;

    // Estimate minimum parking lot footprint area (bay area + drive aisle share)
    // Area per bay + fractional share of driveway aisle
    const footprintPerBay = spec.bayWidth * (spec.bayLength + (spec.aisleWidth / 2));
    const totalFootprint = totalSpaces * footprintPerBay * (unit === 'sqft' ? 10.7639 : 1);

    return {
      totalSpaces,
      accessibleSpots,
      bayWidth: Number(dBayWidth.toFixed(1)),
      bayLength: Number(dBayLength.toFixed(1)),
      aisleWidth: Number(dAisleWidth.toFixed(1)),
      totalAreaNeeded: Number(totalFootprint.toFixed(0)),
      specName: spec.label
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
    const lenUnit = unit === 'sqm' ? 'm' : 'ft';
    const text = `Zoning Parking Bay Requirement Audit
----------------------------------------
Building Classification: ${BLDG_PRESETS[bldgType].label}
Gross Floor Area: ${floorArea} ${areaUnit}
Layout Pattern: ${results.specName}

Parking Stall Schedule:
- Total Parking Spots Required: ${results.totalSpaces} Spaces
- Accessible (ADA) Bays: ${results.accessibleSpots} Spaces
- Estimated Lot Footprint: ${results.totalAreaNeeded} ${areaUnit}

Stall Design Specifications:
- Individual Bay Size: ${results.bayWidth} x ${results.bayLength} ${lenUnit}
- Central Drive Aisle Clearance: ${results.aisleWidth} ${lenUnit}`;

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
            <span>Building & Zoning Parameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Building Type
              </label>
              <select
                value={bldgType}
                onChange={(e) => setBldgType(e.target.value as BldgType)}
                className="saas-input font-bold"
              >
                {Object.entries(BLDG_PRESETS).map(([k, preset]) => (
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
                Layout Angle
              </label>
              <select
                value={layoutAngle}
                onChange={(e) => setLayoutAngle(e.target.value as ParkingAngle)}
                className="saas-input font-bold"
              >
                <option value="90">90° Perpendicular</option>
                <option value="60">60° Angled</option>
                <option value="45">45° Angled</option>
                <option value="0">Parallel Parking</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed italic">
            {BLDG_PRESETS[bldgType].desc}
          </p>

          <div className="border-t pt-4">
            <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
              Gross Floor Area ({unit === 'sqm' ? 'Sq Meters' : 'Sq Feet'})
            </label>
            <input
              type="number"
              value={floorArea}
              onChange={(e) => setFloorArea(parseFloat(e.target.value) || 0)}
              className="saas-input font-bold"
            />
          </div>
        </div>

        {/* Dynamic CAD Parking Lot simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Interactive CAD Layout Simulator</h3>
          <p className="text-xs text-zinc-455">
            AutoCAD viewport simulation. Stripped markings update automatically based on layout angle. Red stalls indicate accessibility clearance bays.
          </p>

          <div className="relative w-full aspect-[16/10] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none" />

            {/* Scale proportional elevation vector */}
            <div className="w-[85%] h-[80%] border-2 border-slate-700/60 rounded bg-zinc-900/10 relative flex flex-col justify-between p-4">
              <span className="absolute top-2 left-2 text-[6.5px] font-black text-slate-500 tracking-widest uppercase">
                LOT PLAN VIEWPORT ({results.specName})
              </span>

              {/* Upper stalls line */}
              <div className="flex gap-3 justify-center w-full mt-4">
                {[1, 2, 3, 4, 5].map((idx) => {
                  let rotateClass = '';
                  if (layoutAngle === '60') rotateClass = 'transform -skew-x-[20deg]';
                  else if (layoutAngle === '45') rotateClass = 'transform -skew-x-[35deg]';
                  else if (layoutAngle === '0') rotateClass = 'w-16 h-6 border-b border-indigo-500/80'; // parallel
                  
                  return (
                    <div
                      key={idx}
                      className={`border-l border-r border-t border-indigo-500/80 w-8 h-12 relative flex items-center justify-center ${rotateClass} ${
                        idx === 1 ? 'border-sky-500 bg-sky-500/10' : ''
                      }`}
                    >
                      {idx === 1 ? (
                        <span className="text-[5px] text-sky-400 font-bold uppercase tracking-widest rotate-90 scale-75">ADA</span>
                      ) : (
                        <span className="text-[5px] text-indigo-500/50 rotate-90 scale-75">STALL</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Central drive aisle */}
              <div className="w-full border-t border-b border-dashed border-slate-700/40 py-2 flex items-center justify-center">
                <span className="text-[6.5px] font-mono text-slate-500 tracking-wider">
                  DRIVEWAY AISLE: {results.aisleWidth} {unit === 'sqm' ? 'm' : 'ft'}
                </span>
              </div>

              {/* Lower stalls line */}
              <div className="flex gap-3 justify-center w-full mb-2">
                {[1, 2, 3, 4, 5].map((idx) => {
                  let rotateClass = '';
                  if (layoutAngle === '60') rotateClass = 'transform -skew-x-[20deg]';
                  else if (layoutAngle === '45') rotateClass = 'transform -skew-x-[35deg]';
                  
                  return (
                    <div
                      key={idx}
                      className={`border-l border-r border-b border-indigo-500/80 w-8 h-12 relative flex items-center justify-center ${rotateClass}`}
                    >
                      <span className="text-[5px] text-indigo-500/50 rotate-90 scale-75">STALL</span>
                    </div>
                  );
                })}
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
                <span>Bylaw Registry</span>
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
                <span className="text-xs text-zinc-455">Total Mandatory Spaces</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.totalSpaces} <span className="text-sm font-semibold">Stalls</span>
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border border-indigo-500/30 text-indigo-500 bg-indigo-500/10 self-start">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ADA Accessible Stalls: {results.accessibleSpots} Bays</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Stall Dimensions</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Standard Bay Size</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.bayWidth} x {results.bayLength} {unit === 'sqm' ? 'm' : 'ft'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Driveway Clearance</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.aisleWidth} {unit === 'sqm' ? 'm' : 'ft'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <span className="text-zinc-400">Total Lot Footprint Area</span>
                  <span className="font-bold font-mono text-indigo-500">
                    ~ {results.totalAreaNeeded} {unit === 'sqm' ? 'sq m' : 'sq ft'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Bylaw Factor Details</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Regulatory Target Factor</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    1 space per {unit === 'sqm' ? BLDG_PRESETS[bldgType].ratioSqm : BLDG_PRESETS[bldgType].ratioSqft} {unit === 'sqm' ? 'sq m' : 'sq ft'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Zoning requirements balance floor area and accessibility needs. Perpendicular layouts maximize overall spot counts, whereas angled layouts require less driveway aisle clearance and support smoother flow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}