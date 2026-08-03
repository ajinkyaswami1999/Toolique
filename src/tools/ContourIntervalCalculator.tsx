import { useState } from 'react';
import { Copy, Check, Info, Layers, Compass } from 'lucide-react';

type UnitType = 'ft' | 'm';

export default function ContourIntervalCalculator() {
  const [unit, setUnit] = useState<UnitType>('ft');
  const [highIndex, setHighIndex] = useState<number>(500); // index contour high
  const [lowIndex, setLowIndex] = useState<number>(400); // index contour low
  const [intermediates, setIntermediates] = useState<number>(4); // intermediate lines
  const [horizontalDistance, setHorizontalDistance] = useState<number>(300); // run distance
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    // Number of spaces between index contours = intermediates + 1
    const spaces = intermediates + 1;
    const verticalRise = Math.max(0, highIndex - lowIndex);
    
    // Contour Interval = Rise / Spaces
    const interval = spaces > 0 ? verticalRise / spaces : 0;

    // Slope math
    // Slope % = (Rise / Run) * 100
    const slopePct = horizontalDistance > 0 ? (verticalRise / horizontalDistance) * 100 : 0;
    
    // Angle in degrees = arctan(Rise / Run) * (180 / PI)
    const slopeAngleRad = horizontalDistance > 0 ? Math.atan(verticalRise / horizontalDistance) : 0;
    const slopeAngleDeg = slopeAngleRad * (180 / Math.PI);

    // Gradient Ratio = 1 : (Run / Rise)
    const gradientRatio = verticalRise > 0 ? horizontalDistance / verticalRise : 0;

    // Generate individual contour line values
    const contourLines: number[] = [];
    for (let i = 0; i <= spaces; i++) {
      contourLines.push(lowIndex + i * interval);
    }

    return {
      verticalRise,
      interval: Number(interval.toFixed(1)),
      slopePct: Number(slopePct.toFixed(1)),
      slopeAngle: Number(slopeAngleDeg.toFixed(1)),
      gradientRatio: Number(gradientRatio.toFixed(1)),
      contourLines
    };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Topographic Contour & Slope Audit
----------------------------------------
Index Contour (High): ${highIndex} ${unit}
Index Contour (Low): ${lowIndex} ${unit}
Intermediate Lines: ${intermediates}
Horizontal Run Distance: ${horizontalDistance} ${unit}

Calculated Contour Interval: ${results.interval} ${unit}
Total Vertical Elevation Rise: ${results.verticalRise} ${unit}
Site Slope: ${results.slopePct}% (${results.slopeAngle}°)
Gradient Ratio: 1 : ${results.gradientRatio}`;

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
            <Layers className="w-5 h-5 text-indigo-500" />
            <span>Contour Parameters</span>
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
                High Index Contour Elevation
              </label>
              <input
                type="number"
                value={highIndex}
                onChange={(e) => setHighIndex(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Low Index Contour Elevation
              </label>
              <input
                type="number"
                value={lowIndex}
                onChange={(e) => setLowIndex(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Intermediate Lines Count
              </label>
              <select
                value={intermediates}
                onChange={(e) => setIntermediates(parseInt(e.target.value) || 1)}
                className="saas-input"
              >
                <option value={1}>1 Line (2 spaces)</option>
                <option value={2}>2 Lines (3 spaces)</option>
                <option value={3}>3 Lines (4 spaces)</option>
                <option value={4}>4 Lines (5 spaces - Standard USGS)</option>
                <option value={9}>9 Lines (10 spaces)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Horizontal Run Distance (Run)
              </label>
              <input
                type="number"
                value={horizontalDistance}
                onChange={(e) => setHorizontalDistance(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Topographic Elevation Profile</h3>
          <p className="text-xs text-zinc-400">
            Side-elevation cutaway representing the slope profile. Horizontal lines represent contour elevation levels.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border-4 border-zinc-800 rounded-2xl p-8 shadow-inner overflow-hidden flex items-end justify-between">
            {/* Slope Line Pattern */}
            <svg className="absolute inset-0 w-full h-full text-indigo-500/20" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Sloped ground line */}
              <line x1="10" y1="90" x2="90" y2="20" stroke="#6366f1" strokeWidth="4" />
              {/* Ground shading beneath slope */}
              <polygon points="10,90 90,20 90,90" fill="currentColor" />
            </svg>

            {/* Contour Lines Elevation Markers */}
            <div className="absolute inset-y-8 left-12 right-12 flex flex-col justify-between pointer-events-none select-none z-10 text-[8px] font-bold text-slate-500">
              {results.contourLines.slice().reverse().map((elev, idx) => (
                <div key={idx} className="w-full flex items-center justify-between border-b border-dashed border-slate-700/60 pb-0.5">
                  <span className="bg-slate-900 px-1 text-slate-400">INDEX: {elev.toFixed(0)} {unit}</span>
                  <span className="text-[7px] text-slate-600">▲ RISE</span>
                </div>
              ))}
            </div>

            {/* Scale/Run dimensions arrow */}
            <div className="absolute bottom-2 left-12 right-12 flex justify-between text-[8px] font-bold text-zinc-500 pointer-events-none">
              <span>Low Point</span>
              <span className="text-zinc-650 bg-slate-900 px-2 rounded border border-zinc-800">
                HORIZONTAL DISTANCE: {horizontalDistance} {unit}
              </span>
              <span>High Point</span>
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
                Elevation Results
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
                <span className="text-xs text-zinc-400 font-semibold">Contour Interval</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.interval} {unit}
                </div>
              </div>

              <div>
                <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                  <Compass className="w-4 h-4 text-indigo-500" />
                  <span>Site Slope Analysis</span>
                </span>
                <div className="text-3xl font-black mt-1 font-mono text-indigo-650 dark:text-indigo-400">
                  {results.slopePct}%
                </div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 mt-2 border border-zinc-200 dark:border-zinc-700">
                  <span>Slope Angle: {results.slopeAngle}°</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Vertical Rise</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.verticalRise} {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Gradient Ratio</span>
                  <span className="font-bold font-mono text-indigo-500">
                    1 : {results.gradientRatio}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Contour intervals represent the vertical elevation increment between successive lines on maps. A smaller interval indicates flatter terrains, while larger intervals represent steep hillsides.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}