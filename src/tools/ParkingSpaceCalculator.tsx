import { useState } from 'react';
import { Copy, Check, Info, LayoutGrid, Car, CheckCircle } from 'lucide-react';

type UnitType = 'ft' | 'm';
type AngleType = '90' | '60' | '45' | '0'; // 0 is Parallel
type RowLayoutType = 'single' | 'double';

interface AngleConfig {
  label: string;
  defaultAisle: number; // feet
  curbMultiplier: number;
  projectionMultiplier: number;
}

const ANGLE_PRESETS: Record<AngleType, AngleConfig> = {
  '90': { label: '90° Perpendicular (Two-Way)', defaultAisle: 24, curbMultiplier: 1.0, projectionMultiplier: 1.0 },
  '60': { label: '60° Angled (One-Way)', defaultAisle: 18, curbMultiplier: 1.155, projectionMultiplier: 1.1 },
  '45': { label: '45° Angled (One-Way)', defaultAisle: 15, curbMultiplier: 1.414, projectionMultiplier: 1.04 },
  '0': { label: 'Parallel Parking (One-Way)', defaultAisle: 12, curbMultiplier: 2.44, projectionMultiplier: 0.5 }
};

export default function ParkingSpaceCalculator() {
  const [unit, setUnit] = useState<UnitType>('ft');
  const [angle, setAngle] = useState<AngleType>('90');
  const [layoutType, setLayoutType] = useState<RowLayoutType>('double');
  const [lotLength, setLotLength] = useState<number>(150); // feet
  const [lotWidth, setLotWidth] = useState<number>(60); // feet
  const [customStallWidth, setCustomStallWidth] = useState<number>(9.0); // feet
  const [customStallDepth, setCustomStallDepth] = useState<number>(18.0); // feet
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const preset = ANGLE_PRESETS[angle];
    
    // Normalize user-defined sizes based on unit (internally calculate in feet, then format outputs)
    const lengthInFt = lotLength * (unit === 'm' ? 3.28084 : 1);
    const widthInFt = lotWidth * (unit === 'm' ? 3.28084 : 1);
    const stallWidthInFt = customStallWidth * (unit === 'm' ? 3.28084 : 1);
    const stallDepthInFt = customStallDepth * (unit === 'm' ? 3.28084 : 1);

    // Calculate Curb Length (spacing along aisle curb per car)
    let curbLength = stallWidthInFt * preset.curbMultiplier;
    if (angle === '0') curbLength = 22.0; // standard parallel length

    // Calculate Stall Projection Depth (how far out the stall sticks)
    let stallProjection = stallDepthInFt * preset.projectionMultiplier;
    if (angle === '0') stallProjection = stallWidthInFt;

    // Aisle width
    const aisleWidth = preset.defaultAisle;

    // Number of cars along one length row
    let spotsPerRow = 0;
    if (angle === '90') {
      spotsPerRow = Math.floor(lengthInFt / curbLength);
    } else if (angle === '0') {
      spotsPerRow = Math.floor(lengthInFt / curbLength);
    } else {
      // For angled parking, first bay has a start offset because of triangles
      const startOffset = stallDepthInFt * Math.cos((parseInt(angle) * Math.PI) / 180);
      spotsPerRow = Math.max(0, Math.floor((lengthInFt - startOffset) / curbLength));
    }

    // Total spots based on rows (single row or double row)
    const multiplier = layoutType === 'double' ? 2 : 1;
    const totalSpots = spotsPerRow * multiplier;

    // Calculate required width
    const requiredWidthInFt = (stallProjection * multiplier) + aisleWidth;
    const isLotWidthSufficient = widthInFt >= requiredWidthInFt;

    // ADA Accessible parking spots requirement (IBC Table 1106.1)
    let adaSpots = 0;
    if (totalSpots >= 1 && totalSpots <= 25) adaSpots = 1;
    else if (totalSpots >= 26 && totalSpots <= 50) adaSpots = 2;
    else if (totalSpots >= 51 && totalSpots <= 75) adaSpots = 3;
    else if (totalSpots >= 76 && totalSpots <= 100) adaSpots = 4;
    else if (totalSpots > 100) adaSpots = Math.ceil(totalSpots * 0.02) + 2;

    // Output values converted to current unit
    const outputConv = (ft: number) => (unit === 'm' ? ft * 0.3048 : ft);

    return {
      totalSpots,
      spotsPerRow,
      aisleWidth: Number(outputConv(aisleWidth).toFixed(1)),
      stallWidth: Number(outputConv(stallWidthInFt).toFixed(1)),
      stallDepth: Number(outputConv(stallDepthInFt).toFixed(1)),
      curbLength: Number(outputConv(curbLength).toFixed(1)),
      stallProjection: Number(outputConv(stallProjection).toFixed(1)),
      requiredLotWidth: Number(outputConv(requiredWidthInFt).toFixed(1)),
      isLotWidthSufficient,
      adaSpots,
      widthDeficit: Number(Math.abs(outputConv(requiredWidthInFt - widthInFt)).toFixed(1))
    };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Parking Space Layout Audit
----------------------------------------
Lot Dimensions: ${lotLength} x ${lotWidth} ${unit}
Layout Type: ${layoutType === 'double' ? 'Double Row (Central Aisle)' : 'Single Row (Perimeter Aisle)'}
Parking Angle: ${ANGLE_PRESETS[angle].label}

Total Calculated Stalls: ${results.totalSpots} Spots (incl. ${results.adaSpots} ADA slots)
Stall Dimensions: ${customStallWidth} x ${customStallDepth} ${unit}
Required Driving Aisle Width: ${results.aisleWidth} ${unit}
Total Width Required: ${results.requiredLotWidth} ${unit}
Width Compliance: ${results.isLotWidthSufficient ? 'COMPLIANT' : 'NON-COMPLIANT (Deficit of ' + results.widthDeficit + ' ' + unit + ')'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Lot Specifications */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-500" />
            <span>Lot Specifications</span>
          </h3>

          <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-[200px]">
            {(['ft', 'm'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-1 rounded-md text-xs font-bold transition ${
                  unit === u
                    ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-650'
                }`}
              >
                {u === 'ft' ? 'Feet' : 'Meters'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Lot Length (Along Curb)
              </label>
              <input
                type="number"
                value={lotLength}
                onChange={(e) => setLotLength(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Lot Width (Across Stalls)
              </label>
              <input
                type="number"
                value={lotWidth}
                onChange={(e) => setLotWidth(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Parking Stall Angle
              </label>
              <select
                value={angle}
                onChange={(e) => setAngle(e.target.value as AngleType)}
                className="saas-input"
              >
                {Object.keys(ANGLE_PRESETS).map((k) => (
                  <option key={k} value={k}>
                    {ANGLE_PRESETS[k as AngleType].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Row Configuration
              </label>
              <select
                value={layoutType}
                onChange={(e) => setLayoutType(e.target.value as RowLayoutType)}
                className="saas-input"
              >
                <option value="single">Single Row (Perimeter Aisle)</option>
                <option value="double">Double Row (Central Aisle / Maximum)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Standard Stall Width
              </label>
              <input
                type="number"
                value={customStallWidth}
                step={0.5}
                onChange={(e) => setCustomStallWidth(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Standard Stall Depth
              </label>
              <input
                type="number"
                value={customStallDepth}
                step={0.5}
                onChange={(e) => setCustomStallDepth(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Parking Layout Blueprint</h3>
          <p className="text-xs text-zinc-400">
            Top-down blueprint simulation. Stalls rotate to match your layout angle. Yellow dashed lines represent driving lanes.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border-4 border-zinc-800 rounded-2xl p-6 shadow-inner flex flex-col justify-between overflow-hidden">
            {/* Driving Aisle in the middle */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-10 border-t border-b border-dashed border-amber-500/30 flex items-center justify-center pointer-events-none">
              <span className="text-[7px] font-black text-amber-500/50 uppercase tracking-widest">
                DRIVING AISLE ({results.aisleWidth} {unit})
              </span>
            </div>

            {/* Top row Stalls */}
            <div className="flex justify-around items-end w-full h-1/3 border-b border-zinc-800 relative z-10">
              {Array.from({ length: Math.min(8, results.spotsPerRow) }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    transform: `skewX(${angle === '90' ? 0 : angle === '60' ? -30 : angle === '45' ? -45 : 90}deg)`,
                    height: '80%',
                    width: '2.5rem'
                  }}
                  className="border-l border-r border-t border-zinc-700/60 flex items-center justify-center relative bg-zinc-900/40"
                >
                  <Car className="w-4 h-4 text-zinc-650 rotate-90" />
                </div>
              ))}
            </div>

            {/* Bottom row Stalls (only if double row) */}
            {layoutType === 'double' && (
              <div className="flex justify-around items-start w-full h-1/3 border-t border-zinc-800 relative z-10">
                {Array.from({ length: Math.min(8, results.spotsPerRow) }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      transform: `skewX(${angle === '90' ? 0 : angle === '60' ? 30 : angle === '45' ? 45 : 90}deg)`,
                      height: '80%',
                      width: '2.5rem'
                    }}
                    className="border-l border-r border-b border-zinc-700/60 flex items-center justify-center relative bg-zinc-900/40"
                  >
                    <Car className="w-4 h-4 text-zinc-650 -rotate-90" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Layout Results
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
                <span className="text-xs text-zinc-400">Total Parking Capacity</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.totalSpots} Bays
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded mt-2 border ${
                    results.isLotWidthSufficient
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>
                    {results.isLotWidthSufficient
                      ? 'LOT WIDTH ADEQUATE'
                      : 'WIDTH INSUFFICIENT (Deficit of ' + results.widthDeficit + ' ' + unit + ')'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                  <span className="font-semibold text-zinc-550">ADA Accessible Slots</span>
                  <span className="font-bold font-mono text-indigo-650 dark:text-indigo-400">
                    {results.adaSpots} Stalls
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Required Aisle Width</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.aisleWidth} {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-semibold">Total Width Required</span>
                  <span className="font-bold font-mono text-indigo-650 dark:text-indigo-400">
                    {results.requiredLotWidth} {unit}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <span className="text-zinc-400">Curb Length (Spacing/Car)</span>
                  <span className="font-bold font-mono">{results.curbLength} {unit}</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Calculations based on standard geometric parking layouts. Angled parking ($60^\circ$ and $45^\circ$) allows for narrower one-way driving aisles, whereas perpendicular $90^\circ$ stalls require wider two-way driveways.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}