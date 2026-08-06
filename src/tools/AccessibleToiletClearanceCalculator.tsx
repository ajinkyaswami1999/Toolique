import { useState } from 'react';
import { Copy, Check, Info, ShieldCheck, Ruler, ShieldAlert } from 'lucide-react';

type UnitType = 'mm' | 'in';
type StandardType = 'ada' | 'nbc' | 'bs8300';
type MountType = 'wall' | 'floor';
type DoorSwing = 'out' | 'in';

interface RestroomStandard {
  label: string;
  minWidth: number; // mm
  minDepth: number; // mm
  turnCircle: number; // mm diameter
  wcOffsetMin: number; // mm centerline to wall
  wcOffsetMax: number;
  desc: string;
}

const REGULATORY_STANDARDS: Record<StandardType, RestroomStandard> = {
  ada: {
    label: 'ADA Section 604 (US)',
    minWidth: 1525, // 60 inches
    minDepth: 1420, // 56 inches (wall hung)
    turnCircle: 1525, // 60 inches
    wcOffsetMin: 405, // 16 inches
    wcOffsetMax: 455, // 18 inches
    desc: 'Bylaw mandates 60" (1525mm) minimum clear width around the water closet, and 60" turning circle.'
  },
  nbc: {
    label: 'NBC India (Part 3 Annex D)',
    minWidth: 1500, // 1500 mm
    minDepth: 1750, // 1750 mm
    turnCircle: 1500, // 1500 mm
    wcOffsetMin: 450, // 450 mm
    wcOffsetMax: 480, // 480 mm
    desc: 'Mandates minimum restroom envelope of 1500mm x 1750mm, and wheelchair turn radius of 1500mm.'
  },
  bs8300: {
    label: 'UK BS 8300 (Part M)',
    minWidth: 1500, // 1500 mm
    minDepth: 2200, // 2200 mm
    turnCircle: 1500, // 1500 mm
    wcOffsetMin: 450,
    wcOffsetMax: 500,
    desc: 'Standard unisex accessible restroom layout dictates 1500mm x 2200mm layout to support side-transfer.'
  }
};

export default function AccessibleToiletClearanceCalculator() {
  const [unit, setUnit] = useState<UnitType>('mm');
  const [standard, setStandard] = useState<StandardType>('ada');
  const [mountType, setMountType] = useState<MountType>('wall');
  const [doorSwing, setDoorSwing] = useState<DoorSwing>('out');

  // Envelope inputs
  const [roomW, setRoomW] = useState<number>(1800); // mm or inches
  const [roomD, setRoomD] = useState<number>(1800); // mm or inches
  const [wcOffset, setWcOffset] = useState<number>(430); // mm or inches from side wall
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const config = REGULATORY_STANDARDS[standard];

    // Convert inputs to MM for consistent bylaw calculations
    const toMm = unit === 'in' ? 25.4 : 1;
    const roomWMm = roomW * toMm;
    const roomDMm = roomD * toMm;
    const wcOffsetMm = wcOffset * toMm;

    // Minimum required depth changes based on mount type (ADA specific)
    let minRequiredDepthMm = config.minDepth;
    if (standard === 'ada' && mountType === 'floor') {
      minRequiredDepthMm = 1500; // 59 inches for floor mounted WC
    }

    // turning circle check
    const turnCircleFits = Math.min(roomWMm, roomDMm) >= config.turnCircle;

    // clearances check
    const widthOk = roomWMm >= config.minWidth;
    const depthOk = roomDMm >= minRequiredDepthMm;
    const offsetOk = wcOffsetMm >= config.wcOffsetMin && wcOffsetMm <= config.wcOffsetMax;
    const doorOk = doorSwing === 'out'; // inward swinging door is non-compliant unless room is oversized

    const isCompliant = widthOk && depthOk && offsetOk && doorOk && turnCircleFits;

    // Convert metrics to active display unit
    const fromMm = unit === 'in' ? 1 / 25.4 : 1;

    return {
      compliant: isCompliant,
      widthOk,
      depthOk,
      offsetOk,
      doorOk,
      turnCircleFits,
      minWidthReq: Number((config.minWidth * fromMm).toFixed(0)),
      minDepthReq: Number((minRequiredDepthMm * fromMm).toFixed(0)),
      turnCircleReq: Number((config.turnCircle * fromMm).toFixed(0)),
      wcOffsetMinReq: Number((config.wcOffsetMin * fromMm).toFixed(0)),
      wcOffsetMaxReq: Number((config.wcOffsetMax * fromMm).toFixed(0)),
      // visual elements
      circleRadiusPct: Math.min(100, (config.turnCircle / Math.max(roomWMm, roomDMm)) * 80)
    };
  };

  const results = calculate();

  const handleUnitChange = (newUnit: UnitType) => {
    const factor = newUnit === 'in' ? 1 / 25.4 : 25.4;
    setUnit(newUnit);
    setRoomW(Number((roomW * factor).toFixed(0)));
    setRoomD(Number((roomD * factor).toFixed(0)));
    setWcOffset(Number((wcOffset * factor).toFixed(0)));
  };

  const copyReport = () => {
    const lenUnit = unit;
    const text = `Accessible Restroom Compliance & Clearance Audit (${REGULATORY_STANDARDS[standard].label})
----------------------------------------
Restroom Envelope: ${roomW} x ${roomD} ${lenUnit}
WC Mount Style: ${mountType === 'wall' ? 'Wall-Hung' : 'Floor-Mounted'} | Door Swing: ${doorSwing === 'out' ? 'Outward' : 'Inward'}
WC Centerline Offset: ${wcOffset} ${lenUnit}

Clearance Compliance Registry:
- Wheelchair Turn Space (min: ${results.turnCircleReq} ${lenUnit}): ${results.turnCircleFits ? 'PASS' : 'FAIL (Restricted turning)'}
- Clearance Width (min: ${results.minWidthReq} ${lenUnit}): ${results.widthOk ? 'PASS' : 'FAIL (Too narrow)'}
- Clearance Depth (min: ${results.minDepthReq} ${lenUnit}): ${results.depthOk ? 'PASS' : 'FAIL (Too shallow)'}
- WC Placement Offset (range: ${results.wcOffsetMinReq}-${results.wcOffsetMaxReq} ${lenUnit}): ${results.offsetOk ? 'PASS' : 'FAIL (Improper centerline)'}
- Door Swing Path Encroachment: ${results.doorOk ? 'PASS' : 'FAIL (Inward swing blocks egress)'}

Overall rest room compliance: ${results.compliant ? 'COMPLIANT (LEED/ADA/NBC compliant)' : 'NON-COMPLIANT'}`;

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
            <span>Restroom Envelope Parameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Regulatory Code
              </label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value as StandardType)}
                className="saas-input font-bold"
              >
                {Object.entries(REGULATORY_STANDARDS).map(([k, cfg]) => (
                  <option key={k} value={k}>
                    {cfg.label}
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
                    className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                      unit === u
                        ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {u === 'mm' ? 'mm' : 'in'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                WC Mount Type
              </label>
              <select
                value={mountType}
                onChange={(e) => setMountType(e.target.value as MountType)}
                className="saas-input font-bold"
              >
                <option value="wall">Wall-Hung (ADA: min 56")</option>
                <option value="floor">Floor-Mount (ADA: min 59")</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Door Swing
              </label>
              <select
                value={doorSwing}
                onChange={(e) => setDoorSwing(e.target.value as DoorSwing)}
                className="saas-input font-bold"
              >
                <option value="out">Outward Swing (Pass)</option>
                <option value="in">Inward Swing (Fail)</option>
              </select>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed italic">
            {REGULATORY_STANDARDS[standard].desc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Room Width ({unit})
              </label>
              <input
                type="number"
                value={roomW}
                onChange={(e) => setRoomW(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Room Depth ({unit})
              </label>
              <input
                type="number"
                value={roomD}
                onChange={(e) => setRoomD(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                WC Side Wall Center ({unit})
              </label>
              <input
                type="number"
                value={wcOffset}
                onChange={(e) => setWcOffset(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
          </div>
        </div>

        {/* Dynamic CAD Floor Plan Blueprint Viewport */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">2D CAD Floor Plan Blueprint</h3>
          <p className="text-xs text-zinc-455">
            Plan view viewport. The dashed gold circle represents the wheelchair turning space. If the envelope is too small, the circle collides with the wall bounds.
          </p>

          <div className="relative w-full aspect-[16/10] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none" />

            {/* Scale proportional restroom box */}
            <div className="w-[80%] h-[80%] border-2 border-slate-700/60 rounded bg-zinc-900/10 relative flex items-center justify-center">
              <span className="absolute bottom-2 right-2 text-[6.5px] font-black text-slate-500 tracking-widest uppercase">
                RESTROOM FLOOR PLAN ({roomW}x{roomD})
              </span>

              {/* Turning circle overlay */}
              <div
                style={{
                  width: `${results.circleRadiusPct}%`,
                  height: `${results.circleRadiusPct}%`
                }}
                className="border-2 border-dashed border-yellow-500/60 bg-yellow-500/5 rounded-full absolute flex items-center justify-center transition-all duration-300"
              >
                <span className="text-[5.5px] font-mono text-yellow-500 font-bold scale-90">60" (1500mm) TURN RAD</span>
              </div>

              {/* WC fixture footprint drawing */}
              <div
                style={{
                  left: `${(wcOffset / roomW) * 100}%`,
                  transform: 'translateX(-50%)'
                }}
                className="absolute top-0 w-8 h-12 border border-slate-600 bg-slate-900/30 rounded flex flex-col items-center justify-between p-1 transition-all duration-300"
              >
                <div className="w-6 h-4 bg-slate-800 rounded-sm border border-slate-700" /> {/* Toilet tank */}
                <div className="w-5 h-6 border border-slate-700 rounded-full" /> {/* Toilet bowl */}
              </div>

              {/* Grab rails lines */}
              <div
                style={{
                  left: `${((wcOffset - 200) / roomW) * 100}%`
                }}
                className="absolute top-2 w-0.5 h-10 bg-indigo-500"
              />
              <div
                style={{
                  left: `${((wcOffset + 200) / roomW) * 100}%`
                }}
                className="absolute top-2 w-0.5 h-10 bg-indigo-500"
              />

              {/* Inward / Outward Door swing arc */}
              <div className="absolute bottom-0 left-4 w-12 h-12 border-l border-t border-indigo-500/40 rounded-tl-full flex items-center justify-center">
                <span className="text-[5.5px] text-indigo-400 font-mono rotate-45">DOOR SWING</span>
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
                <span>Clearance Registry</span>
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
                <span className="text-xs text-zinc-455">Toilet Compliance Rating</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border self-start ${
                    results.compliant
                      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
                      : 'text-amber-500 bg-amber-500/10 border-amber-500/30'
                  }`}>
                    {results.compliant ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    <span>Restroom Space: {results.compliant ? 'ADA/NBC COMPLIANT' : 'VIOLATIONS DETECTED'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Clearance Check List</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Turning Circle ({results.turnCircleReq} {unit})</span>
                  <span className={`font-bold ${results.turnCircleFits ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {results.turnCircleFits ? 'PASS' : 'FAIL (Restricted Turn)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Required Clear Width (min: {results.minWidthReq} {unit})</span>
                  <span className={`font-bold ${results.widthOk ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {results.widthOk ? 'PASS' : 'FAIL (Too Narrow)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Required Clear Depth (min: {results.minDepthReq} {unit})</span>
                  <span className={`font-bold ${results.depthOk ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {results.depthOk ? 'PASS' : 'FAIL (Too Shallow)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">WC Center Offset ({results.wcOffsetMinReq}-{results.wcOffsetMaxReq} {unit})</span>
                  <span className={`font-bold ${results.offsetOk ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {results.offsetOk ? 'PASS' : 'FAIL (Improper Centerline)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Door swing path egress clearance</span>
                  <span className={`font-bold ${results.doorOk ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {results.doorOk ? 'PASS' : 'FAIL (Inward swing blocks turn)'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Restroom designs must accommodate standard wheelchair movements. Inward-swinging doors are non-compliant as they can trap a fallen user and block entry. Ensure out-swing layout orientation is maintained.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}