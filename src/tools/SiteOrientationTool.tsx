import { useState } from 'react';
import { Copy, Check, Info, Compass, ShieldCheck } from 'lucide-react';

type HemisphereType = 'north' | 'south';
type ClimateZone = 'hot_dry' | 'cold' | 'moderate';

interface ClimateConfig {
  label: string;
  idealAzimuthNorth: number; // ideal azimuth in northern hemisphere (0 = North, 180 = South)
  idealAzimuthSouth: number;
  desc: string;
}

const CLIMATE_PRESETS: Record<ClimateZone, ClimateConfig> = {
  hot_dry: {
    label: 'Hot & Dry / Tropical Climate',
    idealAzimuthNorth: 0, // facing North to avoid hot direct South sun
    idealAzimuthSouth: 180, // facing South
    desc: 'Minimize East/West solar exposure. Facades should face North-South for easy shading.'
  },
  cold: {
    label: 'Cold / Temperate Climate',
    idealAzimuthNorth: 180, // face South to maximize winter heating
    idealAzimuthSouth: 0, // face North
    desc: 'Maximize direct solar heat gain by orienting main glazed walls towards the equator.'
  },
  moderate: {
    label: 'Moderate / Temperate Climate',
    idealAzimuthNorth: 165, // slightly off-South to capture morning warmth
    idealAzimuthSouth: 15, // slightly off-North
    desc: 'Balance winter heat collection with summer ventilation and shading.'
  }
};

export default function SiteOrientationTool() {
  const [hemisphere, setHemisphere] = useState<HemisphereType>('north');
  const [climate, setClimate] = useState<ClimateZone>('hot_dry');
  const [azimuth, setAzimuth] = useState<number>(180); // 0-360 degrees
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const config = CLIMATE_PRESETS[climate];
    const idealAzimuth = hemisphere === 'north' ? config.idealAzimuthNorth : config.idealAzimuthSouth;

    // Calculate absolute deviation (0-180 degrees)
    let deviation = Math.abs(azimuth - idealAzimuth);
    if (deviation > 180) {
      deviation = 360 - deviation;
    }

    // Passive Solar Efficiency rating based on deviation
    let efficiency = 100 - (deviation / 1.8); // 180 deg deviation = 0% efficiency
    efficiency = Math.max(10, Math.min(100, efficiency));

    return {
      idealAzimuth,
      deviation: Number(deviation.toFixed(1)),
      efficiency: Number(efficiency.toFixed(0))
    };
  };

  const results = calculate();

  const getEfficiencyRating = (score: number) => {
    if (score >= 85) return { label: 'Excellent Passive Solar Alignment', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 60) return { label: 'Good Alignment (Standard performance)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Sub-Optimal Alignment (High cooling/heating loads)', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
  };

  const rating = getEfficiencyRating(results.efficiency);

  const copyReport = () => {
    const text = `Site Passive Solar Orientation Audit
----------------------------------------
Hemisphere: ${hemisphere === 'north' ? 'Northern' : 'Southern'}
Climate Zone: ${CLIMATE_PRESETS[climate].label}
Building Face Azimuth: ${azimuth}°

Ideal Solar Azimuth: ${results.idealAzimuth}°
Deviation from Ideal: ${results.deviation}°
Passive Solar Efficiency Score: ${results.efficiency}%
Rating: ${rating.label}`;

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
            <Compass className="w-5 h-5 text-indigo-500 animate-spin-slow" />
            <span>Orientation Parameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Site Hemisphere
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {(['north', 'south'] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHemisphere(h)}
                    className={`flex-1 py-1 rounded-md text-xs font-bold capitalize transition ${
                      hemisphere === h
                        ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {h === 'north' ? 'Northern' : 'Southern'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Climate Classification
              </label>
              <select
                value={climate}
                onChange={(e) => setClimate(e.target.value as ClimateZone)}
                className="saas-input"
              >
                {Object.keys(CLIMATE_PRESETS).map((k) => (
                  <option key={k} value={k}>
                    {CLIMATE_PRESETS[k as ClimateZone].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5 flex justify-between">
              <span>Proposed Building Face Azimuth ({azimuth}°)</span>
              <span className="text-[10px] text-zinc-400">0° = North, 90° = East, 180° = South, 270° = West</span>
            </label>
            <input
              type="range"
              min={0}
              max={359}
              value={azimuth}
              onChange={(e) => setAzimuth(parseInt(e.target.value) || 0)}
              className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-650"
            />
            <div className="flex justify-between text-[9px] text-zinc-450 dark:text-zinc-550 font-bold mt-1.5">
              <span>N (0°)</span>
              <span>E (90°)</span>
              <span>S (180°)</span>
              <span>W (270°)</span>
              <span>N (360°)</span>
            </div>
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Solar Compass Plan</h3>
          <p className="text-xs text-zinc-400">
            Site layout drawing showing the rotated building envelope relative to direct Solar radiation vectors (East/West direct summer sun).
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border-4 border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Compass boundaries */}
            <div className="relative w-48 h-48 border border-slate-700/60 rounded-full flex items-center justify-center">
              <span className="absolute top-1 text-[9px] font-black text-slate-500">N</span>
              <span className="absolute bottom-1 text-[9px] font-black text-slate-500">S</span>
              <span className="absolute right-2 text-[9px] font-black text-slate-500">E</span>
              <span className="absolute left-2 text-[9px] font-black text-slate-500">W</span>

              {/* Angle orientation sector (Dotted arc showing solar path) */}
              <div className="absolute inset-2 border border-dashed border-zinc-800 rounded-full pointer-events-none" />

              {/* Rotated Building Box */}
              <div
                style={{
                  transform: `rotate(${azimuth}deg)`
                }}
                className="w-20 h-12 bg-indigo-500/20 border-2 border-indigo-500 rounded flex items-center justify-center shadow-lg transition-transform duration-300 relative"
              >
                {/* North Facing Arrow on the Building */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-black text-indigo-400">
                  ▲
                </div>
                <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest text-center leading-none">
                  Building<br />Facing
                </span>
              </div>

              {/* Solar Radiation vectors (East-West hot summer exposure arrows) */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-500 animate-pulse pointer-events-none flex items-center gap-1">
                <span className="text-[7px] font-black">WEST SUN</span>
                <span>◀◀</span>
              </div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-rose-500 animate-pulse pointer-events-none flex items-center gap-1">
                <span>▶▶</span>
                <span className="text-[7px] font-black">EAST SUN</span>
              </div>
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
                Orientation Analysis
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
                <span className="text-xs text-zinc-400 font-semibold">Passive Solar Efficiency</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.efficiency}%
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded mt-2 border ${rating.color}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{rating.label}</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Proposed Azimuth Alignment</span>
                  <span className="font-bold font-mono">{azimuth}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Ideal Code Orientation</span>
                  <span className="font-bold font-mono text-indigo-500">
                    {results.idealAzimuth}°
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <span className="text-zinc-400">Deviation from Optimum</span>
                  <span className="font-bold font-mono text-rose-500">
                    {results.deviation}°
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Optimizing building orientation decreases mechanical cooling load demands in summer by shading East-West elevations, and increases natural solar heating during winter months.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}