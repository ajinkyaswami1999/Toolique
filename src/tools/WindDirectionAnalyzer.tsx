import { useState } from 'react';
import { Copy, Check, Info, Wind, Compass } from 'lucide-react';

type UnitType = 'mph' | 'ms' | 'knots';
type WindowWall = 'north' | 'south' | 'east' | 'west';

export default function WindDirectionAnalyzer() {
  const [unit, setUnit] = useState<UnitType>('mph');
  const [prevailingWind, setPrevailingWind] = useState<number>(240); // azimuth direction sun/wind source
  const [velocity, setVelocity] = useState<number>(12); // wind speed
  const [buildingOrientation, setBuildingOrientation] = useState<number>(180); // building facing azimuth
  
  // Windows setup
  const [inletWall, setInletWall] = useState<WindowWall>('west');
  const [outletWall, setOutletWall] = useState<WindowWall>('east');
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    // 1. Calculate relative wind angle to the building orientation
    let relativeAngle = Math.abs(prevailingWind - buildingOrientation);
    if (relativeAngle > 180) {
      relativeAngle = 360 - relativeAngle;
    }

    // 2. Assess cross ventilation effectiveness
    // Cross vent is most effective when inlets and outlets are on opposite walls (180 deg difference)
    const isOpposite = 
      (inletWall === 'north' && outletWall === 'south') ||
      (inletWall === 'south' && outletWall === 'north') ||
      (inletWall === 'east' && outletWall === 'west') ||
      (inletWall === 'west' && outletWall === 'east');

    // Calculate angle of wind hitting the inlet wall
    // North wall faces 0 deg, East faces 90, South 180, West 270 relative to building facing
    const wallAngles: Record<WindowWall, number> = {
      north: 0,
      east: 90,
      south: 180,
      west: 270
    };

    // Inlet wall azimuth in world coordinates
    const inletWallAzimuth = (buildingOrientation + wallAngles[inletWall]) % 360;
    
    // Angle of incidence of wind on inlet wall (0 = perpendicular/best, 90 = parallel/no intake)
    let incidenceAngle = Math.abs(prevailingWind - inletWallAzimuth);
    if (incidenceAngle > 180) incidenceAngle = 360 - incidenceAngle;
    
    // Perpendicular is best (deviation from perpendicular)
    // A clean model for intake efficiency: cos(incidenceAngle)
    const incidenceEfficiency = Math.max(10, Math.cos(incidenceAngle * (Math.PI / 180)) * 100);

    // Final rating out of 100
    let score = incidenceEfficiency * 0.6;
    if (isOpposite) score += 40; // huge boost for opposite walls cross vent
    else if (inletWall !== outletWall) score += 15; // small boost for adjacent walls

    // Speed penalty: too slow (< 3 mph) or too fast (> 25 mph) reduces comfort index
    let speedAdjustment = 1.0;
    if (velocity < 3) speedAdjustment = 0.3;
    else if (velocity > 25) speedAdjustment = 0.5; // gale wind requires closing windows

    const finalScore = Math.min(100, Math.max(10, score * speedAdjustment));

    return {
      relativeAngle: Number(relativeAngle.toFixed(1)),
      incidenceAngle: Number(incidenceAngle.toFixed(1)),
      isOpposite,
      efficiencyScore: Number(finalScore.toFixed(0))
    };
  };

  const results = calculate();

  const getVentilationRating = (score: number) => {
    if (score >= 80) return { label: 'Excellent Cross-Ventilation (Optimal)', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 50) return { label: 'Good Ventilation (Fair convective cooling)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Poor Airflow (Stagnant zone or excessive draft)', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
  };

  const rating = getVentilationRating(results.efficiencyScore);

  const copyReport = () => {
    const text = `Prevailing Wind & Natural Ventilation Audit
----------------------------------------
Prevailing Wind Azimuth: ${prevailingWind}°
Wind Velocity: ${velocity} ${unit}
Building Orientation: ${buildingOrientation}°
Window Intake Wall: ${inletWall.toUpperCase()}
Window Exhaust Wall: ${outletWall.toUpperCase()}

Wind Incidence Angle on Inlet: ${results.incidenceAngle}°
Cross Ventilation Flow Path: ${results.isOpposite ? 'Opposite Walls (Ideal)' : 'Adjacent / Single Wall'}
Natural Ventilation Efficiency: ${results.efficiencyScore}%
Rating: ${rating.label}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Inline styles for custom wind animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes windFlow {
          0% { transform: translateY(-120px) scaleY(0.5); opacity: 0; }
          30% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateY(120px) scaleY(1); opacity: 0; }
        }
        .wind-particle {
          animation: windFlow 2.5s infinite linear;
        }
      `}} />

      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Parameters */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-500 animate-spin-slow" />
            <span>Wind & Building Orientation</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5 flex justify-between">
                <span>Prevailing Wind Direction ({prevailingWind}°)</span>
              </label>
              <input
                type="range"
                min={0}
                max={359}
                value={prevailingWind}
                onChange={(e) => setPrevailingWind(parseInt(e.target.value) || 0)}
                className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-650"
              />
              <div className="flex justify-between text-[8px] text-zinc-500 mt-1 font-bold">
                <span>N(0°)</span>
                <span>E(90°)</span>
                <span>S(180°)</span>
                <span>W(270°)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5 flex justify-between">
                <span>Building Orientation ({buildingOrientation}°)</span>
              </label>
              <input
                type="range"
                min={0}
                max={359}
                value={buildingOrientation}
                onChange={(e) => setBuildingOrientation(parseInt(e.target.value) || 0)}
                className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-650"
              />
              <div className="flex justify-between text-[8px] text-zinc-500 mt-1 font-bold">
                <span>N(0°)</span>
                <span>E(90°)</span>
                <span>S(180°)</span>
                <span>W(270°)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Wind Velocity
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={velocity}
                  onChange={(e) => setVelocity(parseFloat(e.target.value) || 0)}
                  className="saas-input pr-12 font-bold font-mono"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitType)}
                  className="absolute right-2 top-2 bg-transparent text-[10px] font-bold text-zinc-450 uppercase border-none focus:ring-0"
                >
                  <option value="mph">MPH</option>
                  <option value="ms">M/S</option>
                  <option value="knots">KTS</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Intake Window Placement (Inlet Wall)
              </label>
              <select
                value={inletWall}
                onChange={(e) => setInletWall(e.target.value as WindowWall)}
                className="saas-input"
              >
                <option value="north">North Wall</option>
                <option value="south">South Wall</option>
                <option value="east">East Wall</option>
                <option value="west">West Wall</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Exhaust Window Placement (Outlet Wall)
              </label>
              <select
                value={outletWall}
                onChange={(e) => setOutletWall(e.target.value as WindowWall)}
                className="saas-input"
              >
                <option value="north">North Wall</option>
                <option value="south">South Wall</option>
                <option value="east">East Wall</option>
                <option value="west">West Wall</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Micro-Airflow Tunnel</h3>
          <p className="text-xs text-zinc-400">
            Top-down blueprint simulation. The building rotates to match its orientation. Light blue vectors represent wind flow direction.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border-4 border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Wind Vector Stream Container (rotates based on prevailing wind) */}
            <div
              style={{
                transform: `rotate(${prevailingWind - 180}deg)`
              }}
              className="absolute inset-0 flex flex-col justify-around items-center pointer-events-none"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    animationDelay: `${i * 0.6}s`,
                    left: `${20 + i * 20}%`
                  }}
                  className="wind-particle absolute w-0.5 h-16 bg-sky-400/40 rounded-full"
                />
              ))}
            </div>

            {/* Rotated Building Box plan */}
            <div
              style={{
                transform: `rotate(${buildingOrientation}deg)`
              }}
              className="w-24 h-16 bg-slate-900 border-2 border-slate-700 rounded-lg flex items-center justify-center relative shadow-2xl z-10"
            >
              {/* Window Inlets/Outlets markings */}
              {/* North Wall window */}
              <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded ${inletWall === 'north' ? 'bg-sky-400 border border-sky-650' : outletWall === 'north' ? 'bg-indigo-500 border border-indigo-650' : 'bg-zinc-800'}`} />
              {/* South Wall window */}
              <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded ${inletWall === 'south' ? 'bg-sky-400 border border-sky-650' : outletWall === 'south' ? 'bg-indigo-500 border border-indigo-650' : 'bg-zinc-800'}`} />
              {/* East Wall window */}
              <div className={`absolute right-0.5 top-1/2 -translate-y-1/2 w-2 h-8 rounded ${inletWall === 'east' ? 'bg-sky-400 border border-sky-650' : outletWall === 'east' ? 'bg-indigo-500 border border-indigo-650' : 'bg-zinc-800'}`} />
              {/* West Wall window */}
              <div className={`absolute left-0.5 top-1/2 -translate-y-1/2 w-2 h-8 rounded ${inletWall === 'west' ? 'bg-sky-400 border border-sky-650' : outletWall === 'west' ? 'bg-indigo-500 border border-indigo-650' : 'bg-zinc-800'}`} />

              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest text-center leading-none">
                BUILDING PLAN
              </span>
            </div>

            {/* Compass label overlay */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500">NORTH</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500">SOUTH</div>
          </div>

          <div className="flex gap-4 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1.5 bg-sky-400 rounded" />
              <span>Intake Window (Inlet)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1.5 bg-indigo-500 rounded" />
              <span>Exhaust Window (Outlet)</span>
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
                Flow Results
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
                <span className="text-xs text-zinc-400 font-semibold">Ventilation Efficiency</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.efficiencyScore}%
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded mt-2 border ${rating.color}`}
                >
                  <Wind className="w-3.5 h-3.5 animate-pulse" />
                  <span>{rating.label}</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Wind-to-Inlet Incidence Angle</span>
                  <span className="font-bold font-mono">{results.incidenceAngle}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-semibold">Cross Ventilation Path</span>
                  <span className="font-bold font-mono text-indigo-650 dark:text-indigo-400">
                    {results.isOpposite ? 'Opposite (Optimal)' : 'Adjacent (Sub-optimal)'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <span className="text-zinc-400">Wind Velocity</span>
                  <span className="font-bold font-mono">
                    {velocity} {unit}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Wind tunnel vectors indicate that cross ventilation works best when window inlets face direct prevailing winds perpendicularly, creating positive pressure zones that draw air out through opposite-facing negative pressure outlets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}