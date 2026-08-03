import { useState } from 'react';
import { Copy, Check, ShieldAlert, DoorOpen, Flame } from 'lucide-react';

type UnitType = 'in' | 'cm';
type EgressComponent = 'stairways' | 'level';

export default function FireExitWidthCalculator() {
  const [unit, setUnit] = useState<UnitType>('in');
  const [componentType, setComponentType] = useState<EgressComponent>('level');
  const [occupants, setOccupants] = useState<number>(300);
  const [sprinklered, setSprinklered] = useState<boolean>(true);
  const [voiceAlarm, setVoiceAlarm] = useState<boolean>(true);
  const [numExits, setNumExits] = useState<number>(2);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    // Determine the egress width factor (inches per occupant)
    // IBC Section 1005.3.1 & 1005.3.2
    let factor = 0.2; // default level components
    
    if (componentType === 'stairways') {
      if (sprinklered && voiceAlarm) {
        factor = 0.2; // optimized stairs
      } else {
        factor = 0.3; // standard stairs
      }
    } else {
      if (sprinklered && voiceAlarm) {
        factor = 0.15; // optimized doors/corridors
      } else {
        factor = 0.2; // standard doors/corridors
      }
    }

    // Total required width across all exits
    const totalRequiredInches = occupants * factor;

    // Minimum width per single exit (assuming equal distribution)
    // IBC requires door openings to provide at least 32 inches of clear width
    const minClearWidthPerDoor = 32; 

    // Under emergency design guidelines, if 1 exit is blocked, the remaining exits must handle the load.
    // Proportional width per exit
    const widthPerExitInches = Math.max(minClearWidthPerDoor, totalRequiredInches / Math.max(1, numExits - 1));

    // Unit conversion
    const scale = unit === 'cm' ? 2.54 : 1;
    const finalTotalWidth = totalRequiredInches * scale;
    const finalWidthPerExit = widthPerExitInches * scale;

    // Graphics scaling factor (base 100% on 72 inches width)
    const doorVisualScale = Math.min(100, (widthPerExitInches / 72) * 100);

    return {
      factor,
      totalRequiredInches,
      widthPerExitInches,
      finalTotalWidth: Number(finalTotalWidth.toFixed(1)),
      finalWidthPerExit: Number(finalWidthPerExit.toFixed(1)),
      doorVisualScale,
      minClearWidthPerDoor: minClearWidthPerDoor * scale
    };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Fire Exit Egress Width Analysis
----------------------------------------
Egress Component: ${componentType === 'stairways' ? 'Stairways (Inclined)' : 'Level Components (Doors/Corridors)'}
Occupant Load: ${occupants} Persons
Sprinklers: ${sprinklered ? 'Yes' : 'No'} | Voice Alarm: ${voiceAlarm ? 'Yes' : 'No'}
Available Exit Doors: ${numExits} Exits

Egress Width Factor: ${results.factor}" per person
Total Required Capacity Width: ${results.finalTotalWidth} ${unit}
Design Width Per Exit Door: ${results.finalWidthPerExit} ${unit} (Accounting for 1 blocked exit)`;

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
            <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
            <span>Egress & Building Parameters</span>
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
                Egress Component Type
              </label>
              <select
                value={componentType}
                onChange={(e) => setComponentType(e.target.value as EgressComponent)}
                className="saas-input"
              >
                <option value="level">Level Components (Doors, Corridors)</option>
                <option value="stairways">Stairways (Inclined Egress)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Floor Occupant Load (Persons)
              </label>
              <input
                type="number"
                value={occupants}
                onChange={(e) => setOccupants(parseInt(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={sprinklered}
                id="sprinkler"
                onChange={(e) => setSprinklered(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500"
              />
              <label htmlFor="sprinkler" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Sprinklers Installed
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={voiceAlarm}
                id="voice"
                onChange={(e) => setVoiceAlarm(e.target.checked)}
                className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500"
              />
              <label htmlFor="voice" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Voice Emergency Alarm
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-zinc-450 dark:text-zinc-500 shrink-0">
                Total Exits:
              </label>
              <input
                type="number"
                value={numExits}
                min={2}
                max={6}
                onChange={(e) => setNumExits(parseInt(e.target.value) || 2)}
                className="w-16 saas-input py-1 text-center font-bold"
              />
            </div>
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Egress Doorway Blueprint</h3>
          <p className="text-xs text-zinc-400">
            Top-down blueprint view. The red line represents the structural fire barrier wall, and the green door represents the calculated exit width.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border-4 border-zinc-800 rounded-2xl flex items-center justify-center p-8 shadow-inner overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-25 pointer-events-none" />

            {/* Fire Wall (Red line across) */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-4 bg-rose-950/40 border-t border-b border-rose-500/50 flex items-center justify-between px-6 pointer-events-none">
              <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest">FIRE BARRIER WALL</span>
              <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest">FIRE BARRIER WALL</span>
            </div>

            {/* Glowing EXIT sign above the doorway */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-black text-[10px] px-3 py-1 rounded shadow-[0_0_15px_rgba(16,185,129,0.5)] uppercase tracking-widest flex items-center gap-1">
              <DoorOpen className="w-3.5 h-3.5" />
              <span>EXIT</span>
            </div>

            {/* Door swing openable gap (width scales dynamically) */}
            <div
              style={{
                width: `${Math.max(20, results.doorVisualScale * 0.8)}%`
              }}
              className="absolute h-10 border-l border-r border-dashed border-emerald-500/40 flex items-center justify-center transition-all duration-300 pointer-events-none"
            >
              {/* SVG door leaf swing */}
              <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 0 50 A 50 50 0 0 0 50 100" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="4" />
                <line x1="0" y1="50" x2="50" y2="50" stroke="currentColor" strokeWidth="5" />
              </svg>

              {/* Dimension label */}
              <span className="absolute bottom-12 text-[9px] font-black text-emerald-500 bg-slate-900 border border-emerald-500/20 px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                Door Clear: {results.finalWidthPerExit} {unit}
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
                Egress Safety Analysis
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
                <span className="text-xs text-zinc-400 font-semibold">Design Width (Per Exit)</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.finalWidthPerExit} {unit}
                </div>
                <div className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-1.5">
                  Accounting for redundancy if one exit door becomes blocked.
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                  <span className="font-semibold text-zinc-550 flex items-center gap-1.5">
                    <DoorOpen className="w-4 h-4 text-indigo-500" />
                    <span>Total Required Combined Width</span>
                  </span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.finalTotalWidth} {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Egress Factor Rate</span>
                  <span className="font-bold font-mono">{results.factor}" / occupant</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Outlets Count</span>
                  <span className="font-bold font-mono">{numExits} Exits</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <span className="text-zinc-400 font-semibold">Code Min Door Opening</span>
                  <span className="font-bold font-mono text-indigo-650 dark:text-indigo-400">
                    {results.minClearWidthPerDoor} {unit}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                <p>
                  Egress exit widths are mandated by building safety regulations to ensure continuous, unobstructed paths of travel. IBC requires a minimum 32" clear width per door leaf (nominally 36" wide door panel).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}