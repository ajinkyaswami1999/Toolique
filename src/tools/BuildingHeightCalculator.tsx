import { useState } from 'react';
import { Copy, Check, Info, ShieldAlert, ShieldCheck } from 'lucide-react';

type UnitType = 'm' | 'ft';
type CityPreset = 'delhi' | 'mumbai' | 'bengaluru' | 'chennai';

interface CityConfig {
  label: string;
  desc: string;
  defaultRoadWidth: number; // meters
}

const CITY_PRESETS: Record<CityPreset, CityConfig> = {
  delhi: {
    label: 'Delhi (DDA Bylaws)',
    defaultRoadWidth: 12,
    desc: 'Height limit is generally based on road width + front setback, with a standard multiplier of 1.5x road width.'
  },
  mumbai: {
    label: 'Mumbai (MCGM / DP 2034)',
    defaultRoadWidth: 15,
    desc: 'Uses strict Sky Exposure Angular Planes (typically 63.43° or 45°) starting from the opposite edge of the road.'
  },
  bengaluru: {
    label: 'Bengaluru (BBMP Zoning)',
    defaultRoadWidth: 9,
    desc: 'Bylaw height limits are stepped: <9m roads allow 11.5m height, 9-12m roads allow 15m, and >12m roads allow 24m+.'
  },
  chennai: {
    label: 'Chennai (CMDA Rules)',
    defaultRoadWidth: 10,
    desc: 'Non-High Rise buildings are capped at 12m (for roads < 9m) or 18m (for roads >= 9m).'
  }
};

export default function BuildingHeightCalculator() {
  const [unit, setUnit] = useState<UnitType>('m');
  const [city, setCity] = useState<CityPreset>('delhi');
  const [roadWidth, setRoadWidth] = useState<number>(12); // meters or feet
  const [setback, setSetback] = useState<number>(3); // meters or feet
  const [proposedHeight, setProposedHeight] = useState<number>(15); // meters or feet
  const [angularPlaneAngle, setAngularPlaneAngle] = useState<number>(63.43); // degrees (typical MCGM 63.43 deg)
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    // Normalize to meters for bylaw calculations
    const factor = unit === 'ft' ? 0.3048 : 1;
    const roadM = roadWidth * factor;
    const setbackM = setback * factor;
    const proposedM = proposedHeight * factor;

    let maxBylawHeightM = 15; // default fallback

    // 1. City-Specific Bylaw height limit
    if (city === 'delhi') {
      // Delhi: 1.5 * Road Width + Setback (with standard caps depending on area)
      maxBylawHeightM = (roadM * 1.5) + setbackM;
    } else if (city === 'mumbai') {
      // Mumbai: Restricted by angular plane projection from opposite side of road
      // Max height = (RoadWidth + Setback) * tan(angle)
      const rad = (angularPlaneAngle * Math.PI) / 180;
      maxBylawHeightM = (roadM + setbackM) * Math.tan(rad);
    } else if (city === 'bengaluru') {
      if (roadM < 9) maxBylawHeightM = 11.5;
      else if (roadM <= 12) maxBylawHeightM = 15.0;
      else maxBylawHeightM = 24.0;
    } else if (city === 'chennai') {
      if (roadM < 9) maxBylawHeightM = 12.0;
      else maxBylawHeightM = 18.0;
    }

    // 2. National Building Code (NBC) India Angular Plane check
    // standard plane is 63.43 degrees (1:2 ratio)
    const nbcAngleRad = (63.43 * Math.PI) / 180;
    const maxNbcHeightM = (roadM + setbackM) * Math.tan(nbcAngleRad);

    // Final permissible height is the lower of bylaw or angular plane limits
    const permissibleHeightM = Math.min(maxBylawHeightM, maxNbcHeightM);
    const permissibleHeight = unit === 'ft' ? permissibleHeightM / 0.3048 : permissibleHeightM;
    const nbcLimit = unit === 'ft' ? maxNbcHeightM / 0.3048 : maxNbcHeightM;

    const isCompliant = proposedM <= permissibleHeightM;
    const deviation = proposedHeight - permissibleHeight;

    // Visual scale factor
    // Building height is scaled relative to permissible height
    const scaleFactor = Math.min(100, (proposedHeight / Math.max(1, permissibleHeight)) * 100);

    return {
      permissibleHeight: Number(permissibleHeight.toFixed(1)),
      nbcLimit: Number(nbcLimit.toFixed(1)),
      isCompliant,
      deviation: Number(Math.abs(deviation).toFixed(1)),
      scaleFactor
    };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Building Height Bylaw Compliance Report
----------------------------------------
City Rules: ${CITY_PRESETS[city].label}
Road Width: ${roadWidth} ${unit}
Front Setback: ${setback} ${unit}
Proposed Building Height: ${proposedHeight} ${unit}

Max Permissible Height: ${results.permissibleHeight} ${unit}
NBC Angular Plane Limit (63.43°): ${results.nbcLimit} ${unit}
Compliance Status: ${results.isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT (Exceeds limit by ' + results.deviation + ' ' + unit + ')'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Site specs */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <span>Site Bylaw Parameters</span>
          </h3>

          <div className="flex gap-4">
            <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-[150px] flex-1">
              {(['m', 'ft'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
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

            <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex-1">
              {Object.keys(CITY_PRESETS).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setCity(k as CityPreset);
                    const preset = CITY_PRESETS[k as CityPreset];
                    setRoadWidth(unit === 'ft' ? Math.round(preset.defaultRoadWidth / 0.3048) : preset.defaultRoadWidth);
                  }}
                  className={`flex-1 py-1 rounded-md text-[10px] font-bold capitalize transition ${
                    city === k
                      ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-650'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed italic">
            {CITY_PRESETS[city].desc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Front Road Width ({unit})
              </label>
              <input
                type="number"
                value={roadWidth}
                onChange={(e) => setRoadWidth(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Front Setback ({unit})
              </label>
              <input
                type="number"
                value={setback}
                onChange={(e) => setSetback(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Proposed Height ({unit})
              </label>
              <input
                type="number"
                value={proposedHeight}
                onChange={(e) => setProposedHeight(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
          </div>

          {city === 'mumbai' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Sky Exposure Plane Angle (Degrees)
              </label>
              <select
                value={angularPlaneAngle}
                onChange={(e) => setAngularPlaneAngle(parseFloat(e.target.value) || 63.43)}
                className="saas-input font-mono font-bold"
              >
                <option value={63.43}>63.43° (1:2 Ratio - Standard Commercial)</option>
                <option value={45.00}>45.00° (1:1 Ratio - Narrow Streets)</option>
              </select>
            </div>
          )}
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Side-Elevation Plan</h3>
          <p className="text-xs text-zinc-400">
            Side-cut section view showing the access road on the left, setback width, building envelope, and the angular sky exposure plane (dotted yellow/red line).
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border-4 border-zinc-800 rounded-2xl p-6 shadow-inner flex items-end justify-between overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-25 pointer-events-none" />

            {/* Road representation (left) */}
            <div className="absolute bottom-0 left-6 w-16 h-4 bg-zinc-800 border-t border-zinc-700 flex items-center justify-center text-[7px] font-black text-zinc-500 tracking-widest uppercase">
              ROAD
            </div>

            {/* Setback Area */}
            <div className="absolute bottom-0 left-24 w-12 h-1 border-b border-zinc-700 flex items-center justify-center text-[7px] text-zinc-550 font-bold" />

            {/* Building Outline box (height adjusts) */}
            <div
              style={{
                height: `${Math.min(90, results.scaleFactor * 0.7)}%`,
                left: '9rem',
                width: '10rem'
              }}
              className={`absolute bottom-0 border-2 rounded-t-lg transition-all duration-300 flex flex-col justify-center items-center shadow-lg ${
                results.isCompliant
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                  : 'bg-rose-500/15 border-rose-500 text-rose-500'
              }`}
            >
              <span className="text-[9px] font-black uppercase tracking-wider">
                Proposed Building
              </span>
              <span className="text-[10px] font-bold font-mono mt-1">
                {proposedHeight} {unit}
              </span>
            </div>

            {/* Angular plane dotted line extending from the opposite side of road (from left=6px, bottom=0px) */}
            {roadWidth > 0 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line
                  x1="6"
                  y1="100"
                  x2="90"
                  y2="30"
                  stroke={results.isCompliant ? '#10b981' : '#ef4444'}
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
              </svg>
            )}

            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest text-slate-500">
              Sky Exposure Plane
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
                Compliance Results
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
                <span className="text-xs text-zinc-400">Max Permissible Height</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.permissibleHeight} {unit}
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded mt-2 border ${
                    results.isCompliant
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}
                >
                  {results.isCompliant ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>COMPLIANT WITH BYLAWS</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>EXCEEDS BYLAW LIMIT (by {results.deviation} {unit})</span>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">NBC Angular Plane Limit</span>
                  <span className="font-bold font-mono">{results.nbcLimit} {unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Road Width</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{roadWidth} {unit}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <span className="text-zinc-400">Front Setback Width</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {setback} {unit}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Building height limits are strictly enforced under Indian municipal laws to guarantee street ventilation, prevent daylight overshadowing, and ensure adequate fire engine ladder accessibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}