import { useState } from 'react';
import { Copy, Check, Info, Ruler, Wind, Activity } from 'lucide-react';

type UnitType = 'm' | 'ft';
type RoomType = 'bedroom' | 'living' | 'kitchen' | 'bathroom' | 'classroom';

interface RoomConfig {
  label: string;
  minAch: number;
  minGlazingRatio: number; // percentage of floor area
  desc: string;
}

const ROOM_PRESETS: Record<RoomType, RoomConfig> = {
  bedroom: {
    label: 'Residential Bedroom',
    minAch: 5,
    minGlazingRatio: 0.10,
    desc: 'Bylaws require at least 5 air changes per hour (ACH) or 10% of floor space as openable ventilation.'
  },
  living: {
    label: 'Living Room / Lounge',
    minAch: 6,
    minGlazingRatio: 0.10,
    desc: 'High occupancy requires 6 ACH minimum for clean indoor air quality.'
  },
  kitchen: {
    label: 'Kitchen (Cooking Area)',
    minAch: 10,
    minGlazingRatio: 0.15,
    desc: 'Moisture and cooking exhaust demands 10 ACH and 15% openable window ratios.'
  },
  bathroom: {
    label: 'Bathroom / WC',
    minAch: 8,
    minGlazingRatio: 0.15,
    desc: 'High humidity zone. Requires 8 ACH or direct exhaust venting to prevent mold.'
  },
  classroom: {
    label: 'Educational Classroom',
    minAch: 8,
    minGlazingRatio: 0.12,
    desc: 'Densely populated. Requires 8 ACH for focus and CO2 mitigation compliance.'
  }
};

export default function RoomVentilationCalculator() {
  const [unit, setUnit] = useState<UnitType>('m');
  const [roomType, setRoomType] = useState<RoomType>('bedroom');
  const [roomW, setRoomW] = useState<number>(4); // meters or feet
  const [roomL, setRoomL] = useState<number>(5); // meters or feet
  const [roomH, setRoomH] = useState<number>(3); // meters or feet
  
  // Window parameters
  const [winW, setWinW] = useState<number>(1.5);
  const [winH, setWinH] = useState<number>(1.2);
  const [openPct, setOpenPct] = useState<number>(50); // sliding: 50%, casement: 100%
  const [windSpeed, setWindSpeed] = useState<number>(1.5); // m/s typical breeze
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const preset = ROOM_PRESETS[roomType];

    // Conversion factor for physical dimensions
    const factorToM = unit === 'ft' ? 0.3048 : 1;
    const roomWM = roomW * factorToM;
    const roomLM = roomL * factorToM;
    const roomHM = roomH * factorToM;
    const winWM = winW * factorToM;
    const winHM = winH * factorToM;

    // Room metrics
    const floorAreaM2 = roomWM * roomLM;
    const volumeM3 = floorAreaM2 * roomHM;

    // Openable glazing area (provided)
    const totalWinAreaM2 = winWM * winHM;
    const openableAreaM2 = totalWinAreaM2 * (openPct / 100);

    // Required openable area (by code ratio)
    const requiredOpenableAreaM2 = floorAreaM2 * preset.minGlazingRatio;

    // Standard Wind-Driven Ventilation Formula: Q = Cv * A * v
    // Cv (effectiveness coefficient) is typically 0.5 to 0.6 for perpendicular wind
    const cv = 0.55;
    const airflowM3s = cv * openableAreaM2 * windSpeed;
    const airflowM3h = airflowM3s * 3600; // cubic meters per hour

    // Calculate provided Air Changes per Hour (ACH)
    const providedAch = volumeM3 > 0 ? airflowM3h / volumeM3 : 0;

    // Compliance audits
    const glazingCompliant = openableAreaM2 >= requiredOpenableAreaM2;
    const achCompliant = providedAch >= preset.minAch;

    // Outputs scaled to selected unit system
    const scaleArea = unit === 'ft' ? 10.7639 : 1;
    const scaleVol = unit === 'ft' ? 35.3147 : 1;

    return {
      floorArea: Number((floorAreaM2 * scaleArea).toFixed(1)),
      volume: Number((volumeM3 * scaleVol).toFixed(1)),
      requiredOpenableArea: Number((requiredOpenableAreaM2 * scaleArea).toFixed(2)),
      providedOpenableArea: Number((openableAreaM2 * scaleArea).toFixed(2)),
      airflowRate: Number((airflowM3h * scaleVol).toFixed(0)), // CFM if imperial, m3/h if metric
      providedAch: Number(providedAch.toFixed(1)),
      glazingCompliant,
      achCompliant,
      requiredAch: preset.minAch,
      // visual variables
      openPctRatio: Math.min(100, (openableAreaM2 / requiredOpenableAreaM2) * 100)
    };
  };

  const results = calculate();

  const handleUnitChange = (newUnit: UnitType) => {
    const factor = newUnit === 'ft' ? 3.28084 : 1 / 3.28084;
    setUnit(newUnit);
    setRoomW(Number((roomW * factor).toFixed(1)));
    setRoomL(Number((roomL * factor).toFixed(1)));
    setRoomH(Number((roomH * factor).toFixed(1)));
    setWinW(Number((winW * factor).toFixed(1)));
    setWinH(Number((winH * factor).toFixed(1)));
    setWindSpeed(newUnit === 'ft' ? Number((windSpeed * 3.28084).toFixed(1)) : Number((windSpeed / 3.28084).toFixed(1)));
  };

  const copyReport = () => {
    const airflowUnit = unit === 'ft' ? 'CFM' : 'm³/h';
    const text = `Room Ventilation & Air Change (ACH) Audit (${ROOM_PRESETS[roomType].label})
----------------------------------------
Floor Area: ${results.floorArea} sq ${unit} | Room Volume: ${results.volume} cu ${unit}
Average External Wind Speed: ${windSpeed} ${unit === 'ft' ? 'fps' : 'm/s'}

Air Change Rate (ACH) Analysis:
- Target Evacuation ACH: ${results.requiredAch} ACH
- Provided Airflow Rate: ${results.airflowRate} ${airflowUnit}
- Actual Natural ACH: ${results.providedAch} ACH
- Egress Capacity Compliance: ${results.achCompliant ? 'PASS' : 'FAIL (Under-ventilated)'}

Openable Glazing Area:
- Minimum Glazing Area Required: ${results.requiredOpenableArea} sq ${unit}
- Net Openable Glazing Provided: ${results.providedOpenableArea} sq ${unit}
- Window Ventilation Ratio Compliance: ${results.glazingCompliant ? 'PASS' : 'FAIL (Increase window size)'}`;

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
            <Ruler className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span>Room Volume & Window Specifications</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Room Classification
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomType)}
                className="saas-input font-bold"
              >
                {Object.entries(ROOM_PRESETS).map(([k, preset]) => (
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
                {(['m', 'ft'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`flex-1 py-1 rounded-md text-xs font-bold transition ${
                      unit === u
                        ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {u === 'm' ? 'Meters' : 'Feet'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Avg Wind Speed ({unit === 'ft' ? 'fps' : 'm/s'})
              </label>
              <input
                type="number"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed italic">
            {ROOM_PRESETS[roomType].desc}
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
                Room Length ({unit})
              </label>
              <input
                type="number"
                value={roomL}
                onChange={(e) => setRoomL(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Ceiling Height ({unit})
              </label>
              <input
                type="number"
                value={roomH}
                onChange={(e) => setRoomH(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Window Width ({unit})
              </label>
              <input
                type="number"
                value={winW}
                onChange={(e) => setWinW(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Window Height ({unit})
              </label>
              <input
                type="number"
                value={winH}
                onChange={(e) => setWinH(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Window Openable Ratio (%)
              </label>
              <input
                type="number"
                value={openPct}
                onChange={(e) => setOpenPct(Math.min(100, Math.max(1, parseInt(e.target.value) || 0)))}
                className="saas-input font-bold"
              />
            </div>
          </div>
        </div>

        {/* 3D Isometric Viewport Representation */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">3D Ventilation Viewport</h3>
          <p className="text-xs text-zinc-450">
            3D room schematic showing external wind driven airflow. The blue vector arrows represent fresh air change volume entering the open window frame.
          </p>

          <div className="relative w-full aspect-[16/10] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none" />

            {/* 3D Room Box Layout */}
            <div className="relative w-64 h-64 flex justify-center items-center select-none transform rotateX(60deg) rotateZ(-30deg)">
              {/* Room floor sheet */}
              <div className="absolute w-44 h-44 bg-indigo-500/10 border-2 border-indigo-500/30 rounded flex items-center justify-center">
                <span className="text-[6px] text-zinc-500 uppercase tracking-widest font-black -rotate-45">
                  Floor Area: {results.floorArea} sq {unit}
                </span>
              </div>

              {/* Side wall containing the window cutout */}
              <div className="absolute w-44 h-24 border-l-2 border-t-2 border-slate-700/60 bg-slate-900/10 origin-bottom bottom-1/2 left-0 -translate-x-1/2 -rotate-90 flex items-center justify-center">
                {/* Window opening */}
                <div className="w-16 h-12 bg-sky-500/15 border border-sky-400 rounded relative flex items-center justify-center">
                  <span className="text-[5px] text-sky-400 font-bold uppercase tracking-widest">Glazing</span>
                </div>
              </div>

              {/* Pulsing Airflow Wind Lines passing through the window */}
              <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-48 flex flex-col gap-2 pointer-events-none">
                <div className="h-0.5 w-full bg-sky-500/80 rounded animate-pulse shadow-[0_0_8px_#0ea5e9]" style={{ animationDelay: '0s' }} />
                <div className="h-0.5 w-full bg-sky-500/80 rounded animate-pulse shadow-[0_0_8px_#0ea5e9]" style={{ animationDelay: '0.2s' }} />
                <div className="h-0.5 w-full bg-sky-500/80 rounded animate-pulse shadow-[0_0_8px_#0ea5e9]" style={{ animationDelay: '0.4s' }} />
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
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                <span>Ventilation Schedule</span>
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
                <span className="text-xs text-zinc-455">Provided Natural Ventilation</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.providedAch} <span className="text-sm font-semibold">ACH</span>
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border self-start ${
                    results.achCompliant
                      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
                      : 'text-amber-500 bg-amber-500/10 border-amber-500/30'
                  }`}>
                    <Wind className="w-3.5 h-3.5" />
                    <span>Target Rate ({results.requiredAch} ACH): {results.achCompliant ? 'COMPLIANT' : 'INSUFFICIENT'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-550 font-black uppercase tracking-wider block">Glazing Area Compliance</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Min Egress Area Required</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.requiredOpenableArea} sq {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Net Open Area Provided</span>
                  <span className="font-bold font-mono text-indigo-500">
                    {results.providedOpenableArea} sq {unit}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <span className="text-zinc-450 font-semibold">Glazing Compliance</span>
                  <span className={`font-bold ${results.glazingCompliant ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {results.glazingCompliant ? 'PASS' : 'FAIL (Increase Openings)'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-550 font-black uppercase tracking-wider block">Volumetric Airflow Estimate</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Fresh Air Delivery Rate</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.airflowRate} {unit === 'ft' ? 'CFM (cu ft/min)' : 'm³/h'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Room Total Volume</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.volume} cu {unit}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Natural ventilation calculations balance building volume and window opening apertures. Keeping air change rates compliant prevents CO2 accumulation and ensures high indoor environmental quality (IEQ).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}