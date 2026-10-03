import { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  LayoutGrid, 
  Car, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  RotateCcw, 
  Share2, 
  Zap, 
  Compass, 
  Bike
} from 'lucide-react';

type UnitType = 'ft' | 'm';
type AngleType = '90' | '60' | '45' | '30' | '0'; // 0 is Parallel
type RowLayoutType = 'single' | 'double';
type StandardCode = 'nbc_india' | 'ibc_us' | 'euro_uk' | 'custom';
type ThemeMode = 'cad_dark' | 'blueprint_light' | 'asphalt';

interface PresetOption {
  id: string;
  name: string;
  tag: string;
  icon: string;
  lengthFt: number;
  widthFt: number;
  angle: AngleType;
  layout: RowLayoutType;
  code: StandardCode;
  evPercent: number;
  desc: string;
}

const PRESETS: PresetOption[] = [
  {
    id: 'office',
    name: 'Office Commercial Lot',
    tag: 'Standard',
    icon: '🏢',
    lengthFt: 180,
    widthFt: 65,
    angle: '90',
    layout: 'double',
    code: 'nbc_india',
    evPercent: 10,
    desc: '180 × 65 ft • 90° Two-Way Central Aisle'
  },
  {
    id: 'mall',
    name: 'Retail Mall / Supermarket',
    tag: 'Angled',
    icon: '🛒',
    lengthFt: 220,
    widthFt: 120,
    angle: '60',
    layout: 'double',
    code: 'ibc_us',
    evPercent: 15,
    desc: '220 × 120 ft • 60° One-Way Flow'
  },
  {
    id: 'hospital',
    name: 'Hospital & Medical Center',
    tag: 'High ADA',
    icon: '🏥',
    lengthFt: 160,
    widthFt: 65,
    angle: '90',
    layout: 'double',
    code: 'ibc_us',
    evPercent: 10,
    desc: '160 × 65 ft • High Accessibility & EV'
  },
  {
    id: 'residential',
    name: 'Residential Stilt / Basement',
    tag: 'Compact',
    icon: '🏬',
    lengthFt: 120,
    widthFt: 55,
    angle: '90',
    layout: 'double',
    code: 'nbc_india',
    evPercent: 20,
    desc: '120 × 55 ft • Stilt Compact Columns'
  },
  {
    id: 'hotel-valet',
    name: 'Hotel Drop-Off / Curb',
    tag: 'Parallel',
    icon: '🏨',
    lengthFt: 110,
    widthFt: 28,
    angle: '0',
    layout: 'single',
    code: 'nbc_india',
    evPercent: 0,
    desc: '110 × 28 ft • 0° Parallel Curb Drop'
  },
  {
    id: 'ev-hub',
    name: 'EV Fast-Charging Hub',
    tag: 'EV Ready',
    icon: '⚡',
    lengthFt: 140,
    widthFt: 60,
    angle: '90',
    layout: 'double',
    code: 'euro_uk',
    evPercent: 50,
    desc: '140 × 60 ft • Dedicated High-Speed EV'
  }
];

interface StandardCodeSpec {
  name: string;
  stallWidthM: number;
  stallDepthM: number;
  aisleTwoWayM: number;
  aisleOneWayM: number;
  adaWidthM: number;
  bikeWidthM: number;
  bikeDepthM: number;
  description: string;
}

const STANDARDS: Record<StandardCode, StandardCodeSpec> = {
  nbc_india: {
    name: 'NBC 2016 / IRC Standards (India)',
    stallWidthM: 2.5,
    stallDepthM: 5.0,
    aisleTwoWayM: 6.0,
    aisleOneWayM: 3.5,
    adaWidthM: 3.6,
    bikeWidthM: 1.0,
    bikeDepthM: 2.0,
    description: 'Complies with National Building Code of India 2016 & Indian Roads Congress (IRC) vehicular parking guidelines.'
  },
  ibc_us: {
    name: 'IBC / ADA / US Standards',
    stallWidthM: 2.74, // 9.0 ft
    stallDepthM: 5.49, // 18.0 ft
    aisleTwoWayM: 7.32, // 24.0 ft
    aisleOneWayM: 4.57, // 15.0 ft
    adaWidthM: 3.96, // 13.0 ft (8ft bay + 5ft access aisle)
    bikeWidthM: 0.91,
    bikeDepthM: 1.83,
    description: 'International Building Code (IBC) and Americans with Disabilities Act (ADA) Table 1106.1 requirements.'
  },
  euro_uk: {
    name: 'BS 8300 / IStructE (UK & Europe)',
    stallWidthM: 2.4,
    stallDepthM: 4.8,
    aisleTwoWayM: 6.0,
    aisleOneWayM: 3.6,
    adaWidthM: 3.6,
    bikeWidthM: 1.0,
    bikeDepthM: 2.0,
    description: 'British Standard BS 8300 design of accessible buildings and Institution of Structural Engineers parking design guide.'
  },
  custom: {
    name: 'Custom Parameter Definition',
    stallWidthM: 2.5,
    stallDepthM: 5.0,
    aisleTwoWayM: 6.0,
    aisleOneWayM: 3.5,
    adaWidthM: 3.6,
    bikeWidthM: 1.0,
    bikeDepthM: 2.0,
    description: 'User-specified bay dimensions, lane widths, and custom turning clearance criteria.'
  }
};

const ANGLE_GEOMETRY: Record<AngleType, { label: string; curbMult: number; projMult: number; defaultAisleRatio: number }> = {
  '90': { label: '90° Perpendicular (Two-Way)', curbMult: 1.0, projMult: 1.0, defaultAisleRatio: 1.0 },
  '60': { label: '60° Angled (One-Way)', curbMult: 1.155, projMult: 1.05, defaultAisleRatio: 0.75 },
  '45': { label: '45° Angled (One-Way)', curbMult: 1.414, projMult: 0.98, defaultAisleRatio: 0.65 },
  '30': { label: '30° Shallow Angled (One-Way)', curbMult: 2.0, projMult: 0.85, defaultAisleRatio: 0.58 },
  '0': { label: '0° Parallel Curb (One-Way)', curbMult: 2.44, projMult: 0.45, defaultAisleRatio: 0.55 }
};

export default function ParkingSpaceCalculator() {
  const [unit, setUnit] = useState<UnitType>('ft');
  const [standard, setStandard] = useState<StandardCode>('nbc_india');
  const [angle, setAngle] = useState<AngleType>('90');
  const [layoutType, setLayoutType] = useState<RowLayoutType>('double');
  const [lotLength, setLotLength] = useState<number>(180);
  const [lotWidth, setLotWidth] = useState<number>(65);
  const [customStallWidth, setCustomStallWidth] = useState<number>(8.2); // ft (2.5m)
  const [customStallDepth, setCustomStallDepth] = useState<number>(16.4); // ft (5.0m)
  const [customAisleWidth, setCustomAisleWidth] = useState<number>(19.7); // ft (6.0m)
  const [evRatio, setEvRatio] = useState<number>(10); // percentage of bays for EV
  const [includeTwoWheelers, setIncludeTwoWheelers] = useState<boolean>(true);
  const [activePresetId, setActivePresetId] = useState<string>('office');
  const [themeMode, setThemeMode] = useState<ThemeMode>('cad_dark');
  const [copied, setCopied] = useState<boolean>(false);

  // Apply Standard Code Defaults
  const applyStandard = (code: StandardCode) => {
    setStandard(code);
    setActivePresetId('');
    if (code !== 'custom') {
      const spec = STANDARDS[code];
      const isFt = unit === 'ft';
      const mToUnit = (m: number) => isFt ? Number((m * 3.28084).toFixed(1)) : m;
      
      setCustomStallWidth(mToUnit(spec.stallWidthM));
      setCustomStallDepth(mToUnit(spec.stallDepthM));
      setCustomAisleWidth(mToUnit(angle === '90' ? spec.aisleTwoWayM : spec.aisleOneWayM));
    }
  };

  // Apply Quick Preset
  const applyPreset = (p: PresetOption) => {
    setActivePresetId(p.id);
    setStandard(p.code);
    setAngle(p.angle);
    setLayoutType(p.layout);
    setEvRatio(p.evPercent);
    
    if (unit === 'ft') {
      setLotLength(p.lengthFt);
      setLotWidth(p.widthFt);
    } else {
      setLotLength(Number((p.lengthFt * 0.3048).toFixed(1)));
      setLotWidth(Number((p.widthFt * 0.3048).toFixed(1)));
    }

    const spec = STANDARDS[p.code];
    const isFt = unit === 'ft';
    const mToUnit = (m: number) => isFt ? Number((m * 3.28084).toFixed(1)) : m;
    setCustomStallWidth(mToUnit(spec.stallWidthM));
    setCustomStallDepth(mToUnit(spec.stallDepthM));
    setCustomAisleWidth(mToUnit(p.angle === '90' ? spec.aisleTwoWayM : spec.aisleOneWayM));
  };

  // Convert unit toggle
  const handleUnitToggle = (newUnit: UnitType) => {
    if (newUnit === unit) return;
    const factor = newUnit === 'm' ? 0.3048 : 3.28084;
    setUnit(newUnit);
    setLotLength(Number((lotLength * factor).toFixed(1)));
    setLotWidth(Number((lotWidth * factor).toFixed(1)));
    setCustomStallWidth(Number((customStallWidth * factor).toFixed(1)));
    setCustomStallDepth(Number((customStallDepth * factor).toFixed(1)));
    setCustomAisleWidth(Number((customAisleWidth * factor).toFixed(1)));
  };

  // Core Calculations
  const results = useMemo(() => {
    const isFt = unit === 'ft';
    const toFt = (val: number) => isFt ? val : val * 3.28084;
    const fromFt = (val: number) => isFt ? val : val * 0.3048;

    const lengthFt = toFt(lotLength);
    const widthFt = toFt(lotWidth);
    const stallWidthFt = toFt(customStallWidth);
    const stallDepthFt = toFt(customStallDepth);
    const aisleWidthFt = toFt(customAisleWidth);

    const geom = ANGLE_GEOMETRY[angle];

    // Curb spacing along the aisle per stall
    let curbLengthFt = stallWidthFt * geom.curbMult;
    if (angle === '0') curbLengthFt = Math.max(20.0, stallDepthFt + 4.0); // parallel parking length

    // Stall projection into the lot perpendicular to aisle
    let stallProjectionFt = stallDepthFt * geom.projMult;
    if (angle === '0') stallProjectionFt = stallWidthFt;

    // Number of regular bays along length per row
    let spotsPerRow = 0;
    if (angle === '90' || angle === '0') {
      spotsPerRow = Math.max(0, Math.floor(lengthFt / curbLengthFt));
    } else {
      const angleRad = (parseInt(angle) * Math.PI) / 180;
      const startEndOffset = stallDepthFt * Math.cos(angleRad);
      spotsPerRow = Math.max(0, Math.floor((lengthFt - startEndOffset) / curbLengthFt));
    }

    const rowMultiplier = layoutType === 'double' ? 2 : 1;
    const totalCarCapacity = spotsPerRow * rowMultiplier;

    // ADA / Accessible Bays Calculation (NBC 2016 & ADA Table 1106.1)
    let adaBays = 0;
    if (totalCarCapacity >= 1 && totalCarCapacity <= 25) adaBays = 1;
    else if (totalCarCapacity >= 26 && totalCarCapacity <= 50) adaBays = 2;
    else if (totalCarCapacity >= 51 && totalCarCapacity <= 75) adaBays = 3;
    else if (totalCarCapacity >= 76 && totalCarCapacity <= 100) adaBays = 4;
    else if (totalCarCapacity > 100) adaBays = Math.ceil(totalCarCapacity * 0.02) + 2;

    // EV Charging Bays
    const evBays = Math.max(0, Math.min(totalCarCapacity - adaBays, Math.round((totalCarCapacity * evRatio) / 100)));
    const standardCarBays = Math.max(0, totalCarCapacity - adaBays - evBays);

    // Two-Wheeler Capacity (Indian NBC standard: Two-wheeler requires 1/5th car ECS)
    const bikeBayWidthFt = toFt(unit === 'ft' ? 3.3 : 1.0);
    const twoWheelerSpots = includeTwoWheelers 
      ? Math.floor((lengthFt * 0.15) / bikeBayWidthFt) * rowMultiplier
      : 0;

    // Total Width Required across stalls & circulation aisle
    const totalRequiredWidthFt = (stallProjectionFt * rowMultiplier) + aisleWidthFt;
    const widthSurplusDeficitFt = widthFt - totalRequiredWidthFt;
    const isWidthCompliant = widthSurplusDeficitFt >= -0.5; // slight tolerance

    // Total Lot Footprint Area
    const totalLotArea = lotLength * lotWidth;
    const unitLabel = unit === 'ft' ? 'sq ft' : 'sq m';

    // Area Efficiency
    const areaPerCarBay = totalCarCapacity > 0 ? Number((totalLotArea / totalCarCapacity).toFixed(1)) : 0;
    const totalEcs = Number((totalCarCapacity + (twoWheelerSpots * 0.2)).toFixed(1));

    // Vehicle Turning Radii & Maneuvering Analysis
    // Standard car turning radius: Outer 18.0 ft (5.5m), Inner 9.8 ft (3.0m)
    const minOuterRadiusFt = 18.0;
    const minInnerRadiusFt = 9.8;
    const min90TurnAisleFt = 20.0;
    
    let turnManeuverStatus: 'optimal' | 'moderate' | 'tight' = 'optimal';
    if (angle === '90') {
      if (aisleWidthFt >= min90TurnAisleFt) turnManeuverStatus = 'optimal';
      else if (aisleWidthFt >= 16.0) turnManeuverStatus = 'moderate';
      else turnManeuverStatus = 'tight';
    } else {
      if (aisleWidthFt >= 13.0) turnManeuverStatus = 'optimal';
      else if (aisleWidthFt >= 10.5) turnManeuverStatus = 'moderate';
      else turnManeuverStatus = 'tight';
    }

    // Space Utilization Breakdown
    const totalStallsAreaSqFt = totalCarCapacity * (stallWidthFt * stallDepthFt);
    const lotAreaSqFt = lengthFt * widthFt;
    const stallsAreaPct = lotAreaSqFt > 0 ? Math.min(100, Math.round((totalStallsAreaSqFt / lotAreaSqFt) * 100)) : 0;
    const aisleAreaSqFt = lengthFt * aisleWidthFt;
    const aisleAreaPct = lotAreaSqFt > 0 ? Math.min(100, Math.round((aisleAreaSqFt / lotAreaSqFt) * 100)) : 0;
    const bufferAreaPct = Math.max(0, 100 - stallsAreaPct - aisleAreaPct);

    return {
      totalCarCapacity,
      standardCarBays,
      adaBays,
      evBays,
      twoWheelerSpots,
      spotsPerRow,
      totalEcs,
      aisleWidth: Number(fromFt(aisleWidthFt).toFixed(1)),
      curbLength: Number(fromFt(curbLengthFt).toFixed(1)),
      stallProjection: Number(fromFt(stallProjectionFt).toFixed(1)),
      totalRequiredWidth: Number(fromFt(totalRequiredWidthFt).toFixed(1)),
      widthSurplusDeficit: Number(fromFt(Math.abs(widthSurplusDeficitFt)).toFixed(1)),
      isWidthCompliant,
      totalLotArea,
      unitLabel,
      areaPerCarBay,
      stallsAreaPct,
      aisleAreaPct,
      bufferAreaPct,
      turnManeuverStatus,
      minOuterRadius: Number(fromFt(minOuterRadiusFt).toFixed(1)),
      minInnerRadius: Number(fromFt(minInnerRadiusFt).toFixed(1))
    };
  }, [unit, lotLength, lotWidth, customStallWidth, customStallDepth, customAisleWidth, angle, layoutType, evRatio, includeTwoWheelers]);

  const copyReport = () => {
    const text = `Parking Space Layout & Dimensional Blueprint Audit • Toolique
--------------------------------------------------
Lot Dimensions        : ${lotLength} × ${lotWidth} ${unit} (Total: ${results.totalLotArea.toLocaleString()} ${results.unitLabel})
Standard Adopted      : ${STANDARDS[standard].name}
Layout Configuration  : ${layoutType === 'double' ? 'Double Row (Central Aisle)' : 'Single Row (Perimeter)'}
Parking Stall Angle   : ${ANGLE_GEOMETRY[angle].label}
--------------------------------------------------
TOTAL VEHICULAR CAPACITY : ${results.totalCarCapacity} Cars + ${results.twoWheelerSpots} Two-Wheelers
• Standard Car Bays    : ${results.standardCarBays} Bays
• Dedicated EV Chargers: ${results.evBays} Bays (${evRatio}%)
• Accessible (ADA)     : ${results.adaBays} Bays
• Equivalent Car Space : ${results.totalEcs} ECS
--------------------------------------------------
DIMENSIONAL CLEARANCES:
• Stall Dimensions     : ${customStallWidth} × ${customStallDepth} ${unit}
• Curb Length / Bay    : ${results.curbLength} ${unit}
• Stall Projection     : ${results.stallProjection} ${unit}
• Driving Aisle Width  : ${results.aisleWidth} ${unit} (${angle === '90' ? 'Two-Way' : 'One-Way'})
• Required Lot Width   : ${results.totalRequiredWidth} ${unit}
• Width Compliance     : ${results.isWidthCompliant ? 'COMPLIANT (Adequate)' : 'DEFICIT OF ' + results.widthSurplusDeficit + ' ' + unit}
• Turning Maneuver     : ${results.turnManeuverStatus.toUpperCase()} (Outer Radius: ${results.minOuterRadius} ${unit})
• Spatial Efficiency   : ${results.areaPerCarBay} ${results.unitLabel} per car bay
--------------------------------------------------
Generated via Toolique Parking Space Calculator (100% Client-Side & Private)
https://www.toolique.in/architecture/parking-space-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `*Parking Space Layout Audit - Toolique*%0A` +
      `Lot: ${lotLength} × ${lotWidth} ${unit} (${results.totalLotArea.toLocaleString()} ${results.unitLabel})%0A` +
      `Angle: ${ANGLE_GEOMETRY[angle].label}%0A` +
      `--------------------------------%0A` +
      `• *Total Capacity:* ${results.totalCarCapacity} Cars (${results.evBays} EV, ${results.adaBays} ADA)%0A` +
      `• *Two-Wheelers:* ${results.twoWheelerSpots} Spots%0A` +
      `• *Driving Aisle:* ${results.aisleWidth} ${unit}%0A` +
      `• *Width Status:* ${results.isWidthCompliant ? 'Compliant' : 'Deficit of ' + results.widthSurplusDeficit + ' ' + unit}%0A` +
      `• *Efficiency:* ${results.areaPerCarBay} ${results.unitLabel}/bay%0A` +
      `--------------------------------%0A` +
      `Calculated on https://www.toolique.in/architecture/parking-space-calculator`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleReset = () => {
    applyPreset(PRESETS[0]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left animate-fadeIn">
      
      {/* 1. Quick Project Presets Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Quick Parking Layout Presets
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400">
            One-click templates for commercial, retail & residential lots
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESETS.map((p) => {
            const isActive = activePresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500/80 shadow-xs text-zinc-900 dark:text-white'
                    : 'bg-zinc-50/70 dark:bg-zinc-950/50 border-zinc-200/70 dark:border-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 dark:hover:border-indigo-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-base">{p.icon}</span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full border ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300/60 dark:border-zinc-700'
                    }`}>
                      {p.tag}
                    </span>
                  </div>
                  <div className="text-xs font-bold leading-snug">
                    {p.name}
                  </div>
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                  {p.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main 2-Column Controls & Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Dimensions & Geometric Controls */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
            
            {/* Header with Reset & Units */}
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                  Lot Dimensions & Parameters
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Unit Switcher */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('ft')}
                    className={`px-2.5 py-1 rounded-md transition ${unit === 'ft' ? 'bg-white dark:bg-zinc-900 shadow-2xs text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-zinc-500'}`}
                  >
                    Feet (ft)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('m')}
                    className={`px-2.5 py-1 rounded-md transition ${unit === 'm' ? 'bg-white dark:bg-zinc-900 shadow-2xs text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-zinc-500'}`}
                  >
                    Meters (m)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                  title="Reset to default configuration"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Standard Building Code Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Building Code / Regional Standard</span>
                <span className="text-[10px] text-zinc-400 font-normal">Auto-sets bay clearances</span>
              </label>
              <select
                value={standard}
                onChange={(e) => applyStandard(e.target.value as StandardCode)}
                className="saas-select text-xs font-semibold"
              >
                {Object.entries(STANDARDS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lot Length & Width Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Lot Length (Along Curb)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="20"
                    step="1"
                    value={lotLength || ''}
                    onChange={(e) => {
                      setActivePresetId('');
                      setLotLength(Math.max(0, parseFloat(e.target.value) || 0));
                    }}
                    className="saas-input font-bold pl-3 pr-10 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                    {unit}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Lot Width (Depth)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="15"
                    step="1"
                    value={lotWidth || ''}
                    onChange={(e) => {
                      setActivePresetId('');
                      setLotWidth(Math.max(0, parseFloat(e.target.value) || 0));
                    }}
                    className="saas-input font-bold pl-3 pr-10 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                    {unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Parking Stall Angle & Row Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Parking Stall Angle
                </label>
                <select
                  value={angle}
                  onChange={(e) => {
                    setActivePresetId('');
                    setAngle(e.target.value as AngleType);
                  }}
                  className="saas-select text-xs font-semibold"
                >
                  {Object.entries(ANGLE_GEOMETRY).map(([k, item]) => (
                    <option key={k} value={k}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Row Layout Architecture
                </label>
                <select
                  value={layoutType}
                  onChange={(e) => {
                    setActivePresetId('');
                    setLayoutType(e.target.value as RowLayoutType);
                  }}
                  className="saas-select text-xs font-semibold"
                >
                  <option value="double">Double Row (Central Driving Aisle)</option>
                  <option value="single">Single Row (Perimeter Wall / Curb)</option>
                </select>
              </div>
            </div>

            {/* Dimensional Clearances (Stall Width, Depth, Aisle) */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <span>Stall & Driving Aisle Dimensions</span>
                <span className="text-[10px] text-zinc-400 font-normal">Adjustable</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">Stall Width ({unit})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customStallWidth}
                    onChange={(e) => {
                      setStandard('custom');
                      setActivePresetId('');
                      setCustomStallWidth(Math.max(0.5, parseFloat(e.target.value) || 0));
                    }}
                    className="saas-input py-1.5 px-2.5 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">Stall Depth ({unit})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customStallDepth}
                    onChange={(e) => {
                      setStandard('custom');
                      setActivePresetId('');
                      setCustomStallDepth(Math.max(1.0, parseFloat(e.target.value) || 0));
                    }}
                    className="saas-input py-1.5 px-2.5 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1">Aisle Width ({unit})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customAisleWidth}
                    onChange={(e) => {
                      setStandard('custom');
                      setActivePresetId('');
                      setCustomAisleWidth(Math.max(1.0, parseFloat(e.target.value) || 0));
                    }}
                    className="saas-input py-1.5 px-2.5 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* EV & Two-Wheeler Allocation Sliders */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3.5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Dedicated EV Fast-Charging Bays</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {evRatio}% ({results.evBays} Bays)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={evRatio}
                  onChange={(e) => setEvRatio(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={includeTwoWheelers}
                    onChange={(e) => setIncludeTwoWheelers(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Include Two-Wheeler / Bike Bays ({results.twoWheelerSpots} spots)</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Turning Radius & Maneuvering Analysis Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                  Turning Radii & Swept Path Maneuverability
                </h4>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                results.turnManeuverStatus === 'optimal'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : results.turnManeuverStatus === 'moderate'
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
              }`}>
                {results.turnManeuverStatus === 'optimal' ? '✓ 1-Shot Turning' : results.turnManeuverStatus === 'moderate' ? '⚠️ Moderate Sweep' : '✕ Tight Maneuver'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-[10px] text-zinc-400 block">Min Outer Radius</span>
                <span className="text-xs font-black text-zinc-900 dark:text-white font-mono mt-0.5 block">
                  {results.minOuterRadius} {unit}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-[10px] text-zinc-400 block">Min Inner Radius</span>
                <span className="text-xs font-black text-zinc-900 dark:text-white font-mono mt-0.5 block">
                  {results.minInnerRadius} {unit}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60">
                <span className="text-[10px] text-zinc-400 block">Curb Spacing</span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">
                  {results.curbLength} {unit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 2D Interactive Blueprint & Results */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* 1. Interactive 2D CAD Parking Blueprint */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Scale-Accurate 2D Blueprint Simulation
                </span>
              </div>

              {/* Theme / Visualizer Mode Toggle */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setThemeMode('cad_dark')}
                  className={`px-2 py-0.5 rounded-md transition ${themeMode === 'cad_dark' ? 'bg-zinc-900 text-white shadow-2xs' : 'text-zinc-400'}`}
                >
                  CAD Dark
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('blueprint_light')}
                  className={`px-2 py-0.5 rounded-md transition ${themeMode === 'blueprint_light' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-zinc-400'}`}
                >
                  Blueprint
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('asphalt')}
                  className={`px-2 py-0.5 rounded-md transition ${themeMode === 'asphalt' ? 'bg-amber-500 text-white shadow-2xs' : 'text-zinc-400'}`}
                >
                  Asphalt
                </button>
              </div>
            </div>

            {/* SVG Interactive Canvas */}
            <div className={`relative w-full aspect-[16/10] rounded-2xl border overflow-hidden p-3 flex flex-col justify-between transition-colors ${
              themeMode === 'cad_dark'
                ? 'bg-[#090d16] border-zinc-800'
                : themeMode === 'blueprint_light'
                ? 'bg-blue-950/90 border-blue-800'
                : 'bg-zinc-900 border-zinc-700'
            }`}>
              
              {/* Background Architectural Grid Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              {/* Top Row Stalls */}
              <div className="w-full flex justify-around items-end h-[34%] relative z-10 border-b border-white/20">
                {Array.from({ length: Math.min(10, results.spotsPerRow) }).map((_, i) => {
                  const isAda = i === 0 && results.adaBays > 0;
                  const isEv = !isAda && i < results.evBays;
                  const skewDeg = angle === '90' ? 0 : angle === '60' ? -30 : angle === '45' ? -45 : angle === '30' ? -60 : 0;

                  return (
                    <div
                      key={`top-${i}`}
                      style={{
                        transform: `skewX(${skewDeg}deg)`,
                        width: angle === '0' ? '4.5rem' : '2.2rem',
                        height: '92%'
                      }}
                      className={`border-l-2 border-r-2 border-t-2 flex flex-col items-center justify-between p-1 transition-all ${
                        isAda
                          ? 'bg-blue-600/25 border-blue-400 text-blue-300'
                          : isEv
                          ? 'bg-emerald-600/25 border-emerald-400 text-emerald-300'
                          : 'bg-indigo-500/10 border-white/40 text-white/70'
                      }`}
                    >
                      <span className="text-[8px] font-black uppercase">
                        {isAda ? 'ADA' : isEv ? 'EV' : `#${i + 1}`}
                      </span>
                      <Car className="w-4 h-4 rotate-90 opacity-80" />
                      <span className="text-[7px] font-mono opacity-60">
                        {customStallWidth}×{customStallDepth}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Central Driving Aisle */}
              <div className="relative z-10 w-full my-auto h-10 border-t border-b border-dashed border-amber-400/50 flex items-center justify-between px-4 bg-amber-400/[0.03]">
                <div className="flex items-center gap-1 text-[8px] font-black uppercase text-amber-400 tracking-widest">
                  <span>◀</span>
                  <span>DRIVING AISLE ({results.aisleWidth} {unit})</span>
                  {angle === '90' && <span>▶ TWO-WAY</span>}
                  {angle !== '90' && <span>ONE-WAY ONLY</span>}
                </div>
                <div className="text-[8px] font-mono text-zinc-400">
                  CLEARANCE: {results.turnManeuverStatus.toUpperCase()}
                </div>
              </div>

              {/* Bottom Row Stalls (if double row) */}
              {layoutType === 'double' ? (
                <div className="w-full flex justify-around items-start h-[34%] relative z-10 border-t border-white/20">
                  {Array.from({ length: Math.min(10, results.spotsPerRow) }).map((_, i) => {
                    const bayNum = results.spotsPerRow + i + 1;
                    const isEv = i < Math.floor(results.evBays / 2);
                    const skewDeg = angle === '90' ? 0 : angle === '60' ? 30 : angle === '45' ? 45 : angle === '30' ? 60 : 0;

                    return (
                      <div
                        key={`bot-${i}`}
                        style={{
                          transform: `skewX(${skewDeg}deg)`,
                          width: angle === '0' ? '4.5rem' : '2.2rem',
                          height: '92%'
                        }}
                        className={`border-l-2 border-r-2 border-b-2 flex flex-col items-center justify-between p-1 transition-all ${
                          isEv
                            ? 'bg-emerald-600/25 border-emerald-400 text-emerald-300'
                            : 'bg-indigo-500/10 border-white/40 text-white/70'
                        }`}
                      >
                        <span className="text-[7px] font-mono opacity-60">
                          {customStallWidth}×{customStallDepth}
                        </span>
                        <Car className="w-4 h-4 -rotate-90 opacity-80" />
                        <span className="text-[8px] font-black uppercase">
                          {isEv ? 'EV' : `#${bayNum}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[20%] flex items-center justify-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-t border-dashed border-zinc-700">
                  Single Row • Perimeter Wall Clearance Zone
                </div>
              )}
            </div>

            {/* Legend Indicators */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Standard ({results.standardCarBays})
                </span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> EV Charger ({results.evBays})
                </span>
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500"></span> ADA Accessible ({results.adaBays})
                </span>
              </div>

              {includeTwoWheelers && (
                <span className="flex items-center gap-1 text-zinc-500 font-medium">
                  <Bike className="w-3.5 h-3.5 text-indigo-500" /> +{results.twoWheelerSpots} Two-Wheelers
                </span>
              )}
            </div>
          </div>

          {/* 2. Layout Audit Results Summary Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
            
            {/* Results Header with Actions */}
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                  Capacity & Compliance Audit
                </span>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Lot: {lotLength} × {lotWidth} {unit} ({results.totalLotArea.toLocaleString()} {results.unitLabel})
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={shareWhatsApp}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition inline-flex items-center gap-1"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={copyReport}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Audit'}</span>
                </button>
              </div>
            </div>

            {/* Total Stalls Hero Stat */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/5 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-teal-950/20 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Total Vehicular Capacity
                </span>
                <div className="text-3xl sm:text-4xl font-black text-indigo-650 dark:text-indigo-400 font-mono tracking-tight">
                  {results.totalCarCapacity} <span className="text-base sm:text-lg font-bold text-zinc-600 dark:text-zinc-300">Car Bays</span>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className="inline-block px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-800 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 shadow-2xs">
                  {results.totalEcs} Total ECS
                </span>
                <span className="block text-[10px] text-zinc-400">
                  {results.areaPerCarBay} {results.unitLabel} footprint / bay
                </span>
              </div>
            </div>

            {/* Dimensional Audit Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70 space-y-1">
                <span className="text-zinc-400 text-[10px] block">Driving Aisle Width</span>
                <span className="font-bold text-zinc-900 dark:text-white font-mono text-sm block">
                  {results.aisleWidth} {unit}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  {angle === '90' ? 'Two-way standard' : 'One-way angled'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70 space-y-1">
                <span className="text-zinc-400 text-[10px] block">Required Lot Width</span>
                <span className="font-bold text-zinc-900 dark:text-white font-mono text-sm block">
                  {results.totalRequiredWidth} {unit}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  {results.isWidthCompliant ? 'Fits within lot' : `Deficit: ${results.widthSurplusDeficit} ${unit}`}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70 space-y-1">
                <span className="text-zinc-400 text-[10px] block">Curb Spacing per Bay</span>
                <span className="font-bold text-zinc-900 dark:text-white font-mono text-sm block">
                  {results.curbLength} {unit}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  {results.spotsPerRow} stalls per row
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70 space-y-1">
                <span className="text-zinc-400 text-[10px] block">Width Compliance Status</span>
                <span className={`font-bold font-mono text-xs flex items-center gap-1 ${
                  results.isWidthCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {results.isWidthCompliant ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Compliant</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Insufficient</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  {results.isWidthCompliant ? 'Lot width adequate' : 'Widen lot or switch angle'}
                </span>
              </div>
            </div>

            {/* Space Utilization Breakdown Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                <span>Lot Footprint Utilization</span>
                <span>{results.stallsAreaPct}% Stalls • {results.aisleAreaPct}% Aisle</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden flex bg-zinc-200 dark:bg-zinc-800">
                <div style={{ width: `${results.stallsAreaPct}%` }} className="bg-indigo-600 h-full" title="Parking Stalls" />
                <div style={{ width: `${results.aisleAreaPct}%` }} className="bg-amber-500 h-full" title="Circulation Aisle" />
                <div style={{ width: `${results.bufferAreaPct}%` }} className="bg-emerald-500 h-full" title="Buffer / Landscape" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}