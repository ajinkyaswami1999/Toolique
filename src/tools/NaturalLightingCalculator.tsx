import { useState } from 'react';
import { Copy, Check, Info, Sun, Ruler, ShieldCheck } from 'lucide-react';

type UnitType = 'm' | 'ft';
type SkyCondition = 'clear' | 'partly' | 'overcast';

interface SkyConfig {
  label: string;
  outdoorLux: number;
  desc: string;
}

const SKY_PRESETS: Record<SkyCondition, SkyConfig> = {
  clear: {
    label: 'Clear Sunny Sky',
    outdoorLux: 15000,
    desc: 'Intense direct sunlight. High risk of glare; overhangs or blinds recommended.'
  },
  partly: {
    label: 'Partly Cloudy Sky',
    outdoorLux: 8000,
    desc: 'Comfortable diffused daylighting. Ideal for general office and residential use.'
  },
  overcast: {
    label: 'Overcast Sky',
    outdoorLux: 3500,
    desc: 'Diffused shadowless daylighting. Standard sky configuration for Daylight Factor audits.'
  }
};

export default function NaturalLightingCalculator() {
  const [unit, setUnit] = useState<UnitType>('m');
  const [sky, setSky] = useState<SkyCondition>('partly');
  const [roomW, setRoomW] = useState<number>(4); // meters or feet
  const [roomL, setRoomL] = useState<number>(5); // meters or feet
  const [roomH, setRoomH] = useState<number>(3); // meters or feet

  // Glazing attributes
  const [winW, setWinW] = useState<number>(1.8);
  const [winH, setWinH] = useState<number>(1.5);
  const [vlt, setVlt] = useState<number>(70); // % Visible Light Transmittance (clear double glass: ~70%)
  const [reflectance, setReflectance] = useState<number>(50); // % Interior wall reflection
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    // Normalise to meters for metric equation consistency
    const factorToM = unit === 'ft' ? 0.3048 : 1;
    const roomWM = roomW * factorToM;
    const roomLM = roomL * factorToM;
    const roomHM = roomH * factorToM;
    const winWM = winW * factorToM;
    const winHM = winH * factorToM;

    const floorAreaM2 = roomWM * roomLM;
    const glazingAreaM2 = winWM * winHM;

    // Total interior surface area (2*floor + 2*W*H + 2*L*H)
    const totalInteriorSurfaceAreaM2 = (2 * floorAreaM2) + (2 * roomWM * roomHM) + (2 * roomLM * roomHM);

    // VLT decimal
    const tVlt = vlt / 100;
    const maintenanceFactor = 0.85; // typical standard cleaning factor
    const netTransmittance = tVlt * maintenanceFactor;

    // Sky visible angle in degrees (unobstructed = 90 degrees)
    const skyAngleDeg = 90;
    const skyAngleRad = (skyAngleDeg * Math.PI) / 180;

    // Reflectance decimal
    const rReflectance = reflectance / 100;

    // Average Daylight Factor (DF) formula:
    // DF = (T * A_win * theta) / (A_total * (1 - R^2)) * 100%
    const divisor = totalInteriorSurfaceAreaM2 * (1 - Math.pow(rReflectance, 2));
    const df = divisor > 0 ? (netTransmittance * glazingAreaM2 * skyAngleRad) / divisor * 100 : 0;

    // Indoor lux level estimate
    const outdoorLux = SKY_PRESETS[sky].outdoorLux;
    const indoorLux = outdoorLux * (df / 100);

    // LEED / NBC recommends DF >= 2.0% for classrooms and office tasks
    const compliant = df >= 2.0;

    // Convert output representations
    const scaleArea = unit === 'ft' ? 10.7639 : 1;
    const dispFloorArea = floorAreaM2 * scaleArea;
    const dispGlazingArea = glazingAreaM2 * scaleArea;
    const displayLux = Math.round(indoorLux);
    const displayFc = Math.round(indoorLux * 0.092903); // lux to foot-candles

    return {
      floorArea: Number(dispFloorArea.toFixed(1)),
      glazingArea: Number(dispGlazingArea.toFixed(1)),
      daylightFactor: Number(df.toFixed(2)),
      indoorLux: displayLux,
      indoorFc: displayFc,
      compliant,
      // Visual gradient values
      lightStrength: Math.min(100, Math.max(10, df * 15)) // scale lighting overlay opacity
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
  };

  const copyReport = () => {
    const text = `Natural Daylighting & Lux Level Audit (${SKY_PRESETS[sky].label})
----------------------------------------
Floor Area: ${results.floorArea} sq ${unit} | Glazing Area: ${results.glazingArea} sq ${unit}
Glazing VLT Transmittance: ${vlt}% | Wall Reflectance: ${reflectance}%

Daylight Factor (DF) Analysis:
- Target Daylight Factor: >= 2.0%
- Average Daylight Factor: ${results.daylightFactor}%
- Lighting Code Compliance: ${results.compliant ? 'PASS' : 'FAIL (Insufficient daylight)'}

Estimated Indoor Lighting levels:
- Average Indoor Lux: ${results.indoorLux} Lux
- Average Indoor Foot-candles: ${results.indoorFc} fc
- Exterior reference: ${SKY_PRESETS[sky].outdoorLux} Lux`;

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
            <span>Volume, Glazing & Reflectance Parameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Sky Condition
              </label>
              <select
                value={sky}
                onChange={(e) => setSky(e.target.value as SkyCondition)}
                className="saas-input font-bold"
              >
                {Object.entries(SKY_PRESETS).map(([k, preset]) => (
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
                        : 'text-zinc-455 hover:text-zinc-650'
                    }`}
                  >
                    {u === 'm' ? 'Meters' : 'Feet'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Glass VLT Transmittance (%)
              </label>
              <input
                type="number"
                value={vlt}
                onChange={(e) => setVlt(Math.min(100, Math.max(1, parseInt(e.target.value) || 0)))}
                className="saas-input font-bold"
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-405 leading-relaxed italic">
            {SKY_PRESETS[sky].desc}
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
                Interior Reflectance (%)
              </label>
              <input
                type="number"
                value={reflectance}
                onChange={(e) => setReflectance(Math.min(95, Math.max(5, parseInt(e.target.value) || 0)))}
                className="saas-input font-bold"
              />
            </div>
          </div>
        </div>

        {/* Dynamic CAD Lighting Ray elevation simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Natural Daylighting Ray elevation Simulator</h3>
          <p className="text-xs text-zinc-455">
            Cross-sectional visual. Yellow daylight rays flow from the window cutout on the left. The room background brightness reflects the calculated daylight penetration.
          </p>

          <div className="relative w-full aspect-[16/10] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none" />

            {/* Room block container */}
            <div className="relative w-[85%] h-[80%] border-2 border-slate-700/60 rounded bg-zinc-900/10 flex items-center justify-end overflow-hidden">
              <span className="absolute bottom-2 right-2 text-[6.5px] font-black text-slate-500 tracking-widest uppercase">
                ROOM ELEVATION CROSS-SECTION
              </span>

              {/* Dynamic lighting overlay gradient matching daylight factor */}
              <div
                style={{
                  background: `linear-gradient(to right, rgba(234, 179, 8, ${results.lightStrength / 100}) 0%, rgba(234, 179, 8, 0.05) 85%)`
                }}
                className="absolute inset-0 transition-opacity duration-500"
              />

              {/* Window frame on left wall */}
              <div className="absolute left-0 w-1.5 h-20 bg-sky-500/20 border-r border-sky-400 flex items-center justify-center">
                <div className="w-1.5 h-16 bg-sky-400" />
              </div>

              {/* Visual Yellow lighting rays */}
              <svg className="absolute left-1.5 top-0 w-[80%] h-full pointer-events-none opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points="0,35 0,65 100,100 100,0" fill="url(#ray-gradient)" />
                <defs>
                  <linearGradient id="ray-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#eab308" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
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
                <Sun className="w-3.5 h-3.5 text-indigo-500" />
                <span>Daylight Audit</span>
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
                <span className="text-xs text-zinc-455">Average Daylight Factor (DF)</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.daylightFactor}%
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border self-start ${
                    results.compliant
                      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
                      : 'text-amber-500 bg-amber-500/10 border-amber-500/30'
                  }`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>LEED / NBC Target (min 2.0%): {results.compliant ? 'COMPLIANT' : 'LOW LIGHTING'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Estimated Indoor Illuminance</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Average Light Level</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.indoorLux} Lux
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Imperial Foot-candles</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.indoorFc} fc
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <span className="text-zinc-400">Exterior Reference Lux</span>
                  <span className="font-bold font-mono text-zinc-450">
                    {SKY_PRESETS[sky].outdoorLux} Lux
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Room Surfaces</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Net Floor Area</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.floorArea} sq {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Glazing Aperture Area</span>
                  <span className="font-bold font-mono text-sky-500">
                    {results.glazingArea} sq {unit}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Natural lighting calculations verify building compliance with daylight codes. Increasing window size and wall reflectance (lighter colors) increases indoor illumination levels without requiring artificial lighting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}