import { useState, useMemo } from 'react';

export default function VolumeCalculator3D() {
  const [shape, setShape] = useState<'cylinder' | 'cone' | 'sphere' | 'frustum' | 'pyramid' | 'pipe'>('cylinder');

  // Dimensional Inputs
  const [radius1, setRadius1] = useState<number>(3); // Radius r or R
  const [radius2, setRadius2] = useState<number>(2); // For frustum/pipe inner radius
  const [height, setHeight] = useState<number>(8); // Height or Length
  const [pyramidBaseW, setPyramidBaseW] = useState<number>(4);
  const [pyramidBaseL, setPyramidBaseL] = useState<number>(5);

  // Computations
  const results = useMemo(() => {
    let volume = 0;
    let surfaceArea = 0;
    let capacityLitres = 0;
    const PI = Math.PI;

    switch (shape) {
      case 'cylinder': {
        const r = radius1;
        const h = height;
        volume = PI * r * r * h;
        // Total surface area = 2 * PI * r * (r + h)
        surfaceArea = 2 * PI * r * (r + h);
        capacityLitres = volume * 1000; // 1 m³ = 1000 litres
        break;
      }
      case 'cone': {
        const r = radius1;
        const h = height;
        volume = (1 / 3) * PI * r * r * h;
        // Lateral height s = sqrt(r² + h²)
        const s = Math.sqrt(r * r + h * h);
        surfaceArea = PI * r * (r + s);
        capacityLitres = volume * 1000;
        break;
      }
      case 'sphere': {
        const r = radius1;
        volume = (4 / 3) * PI * r * r * r;
        surfaceArea = 4 * PI * r * r;
        capacityLitres = volume * 1000;
        break;
      }
      case 'frustum': {
        const R = radius1; // Larger radius
        const r = radius2; // Smaller radius
        const h = height;
        volume = (1 / 3) * PI * h * (R * R + r * r + R * r);
        const s = Math.sqrt((R - r) * (R - r) + h * h);
        surfaceArea = PI * (R * R + r * r + s * (R + r));
        capacityLitres = volume * 1000;
        break;
      }
      case 'pyramid': {
        const w = pyramidBaseW;
        const l = pyramidBaseL;
        const h = height;
        volume = (1 / 3) * w * l * h;
        // Slant heights
        const shW = Math.sqrt((l / 2) * (l / 2) + h * h);
        const shL = Math.sqrt((w / 2) * (w / 2) + h * h);
        surfaceArea = w * l + w * shW + l * shL;
        capacityLitres = volume * 1000;
        break;
      }
      case 'pipe': {
        const R = radius1; // Outer radius
        const r = radius2; // Inner radius (r < R)
        const h = height;
        const safeR = r >= R ? R * 0.9 : r;
        volume = PI * (R * R - safeR * safeR) * h;
        // Surface Area = Outer + Inner + 2 * ends ovals
        surfaceArea = 2 * PI * R * h + 2 * PI * safeR * h + 2 * PI * (R * R - safeR * safeR);
        capacityLitres = volume * 1000;
        break;
      }
      default:
        break;
    }

    return { volume, surfaceArea, capacityLitres };
  }, [shape, radius1, radius2, height, pyramidBaseW, pyramidBaseL]);

  // SVG Diagram dimensions
  const svgWidth = 300;
  const svgHeight = 220;
  const cx = svgWidth / 2;
  const cy = svgHeight / 2;

  const renderIsometricSVG = () => {
    switch (shape) {
      case 'cylinder':
        return (
          <>
            {/* Cylinder body */}
            <path
              d={`M ${cx - 50} 70 L ${cx - 50} 150 A 50 15 0 0 0 ${cx + 50} 150 L ${cx + 50} 70 Z`}
              className="fill-indigo-500/10 stroke-indigo-500"
              strokeWidth="2.5"
            />
            {/* Bottom dashed ellipse curve */}
            <path
              d={`M ${cx - 50} 150 A 50 15 0 0 1 ${cx + 50} 150`}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Top ellipse */}
            <ellipse
              cx={cx}
              cy={70}
              rx="50"
              ry="15"
              className="fill-indigo-500/20 stroke-indigo-500"
              strokeWidth="2.5"
            />
            {/* Radius & Height lines */}
            <line x1={cx} y1={70} x2={cx + 50} y2={70} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1={cx - 65} y1={70} x2={cx - 65} y2={150} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x={cx + 25} y={64} className="text-[9px] fill-red-500 font-bold font-mono">r</text>
            <text x={cx - 80} y={115} className="text-[9px] fill-emerald-500 font-bold font-mono">h</text>
          </>
        );
      case 'cone':
        return (
          <>
            {/* Cone body */}
            <path
              d={`M ${cx - 50} 150 L ${cx} 60 L ${cx + 50} 150 A 50 15 0 0 1 ${cx - 50} 150`}
              className="fill-indigo-500/10 stroke-indigo-500"
              strokeWidth="2.5"
            />
            {/* Bottom oval dashed line */}
            <path
              d={`M ${cx - 50} 150 A 50 15 0 0 1 ${cx + 50} 150`}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Height & Radius */}
            <line x1={cx} y1={60} x2={cx} y2={150} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1={cx} y1={150} x2={cx + 50} y2={150} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x={cx + 25} y={146} className="text-[9px] fill-red-500 font-bold font-mono">r</text>
            <text x={cx - 12} y={105} className="text-[9px] fill-emerald-500 font-bold font-mono">h</text>
          </>
        );
      case 'sphere':
        return (
          <>
            {/* Outer sphere boundary */}
            <circle
              cx={cx}
              cy={cy}
              r="60"
              className="fill-indigo-500/10 stroke-indigo-500"
              strokeWidth="2.5"
            />
            {/* Horizontal ellipse profile */}
            <ellipse
              cx={cx}
              cy={cy}
              rx="60"
              ry="18"
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {/* Radius line */}
            <line x1={cx} y1={cy} x2={cx + 60} y2={cy} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x={cx + 30} y={cy - 6} className="text-[9px] fill-red-500 font-bold font-mono">r</text>
          </>
        );
      case 'frustum':
        return (
          <>
            {/* Frustum sides */}
            <path
              d={`M ${cx - 30} 70 L ${cx - 55} 150 A 55 15 0 0 0 ${cx + 55} 150 L ${cx + 30} 70 Z`}
              className="fill-indigo-500/10 stroke-indigo-500"
              strokeWidth="2.5"
            />
            {/* Base dashed profile */}
            <path
              d={`M ${cx - 55} 150 A 55 15 0 0 1 ${cx + 55} 150`}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Top Ellipse */}
            <ellipse cx={cx} cy={70} rx="30" ry="10" className="fill-indigo-500/20 stroke-indigo-500" strokeWidth="2.5" />
            {/* Height & Radii labels */}
            <line x1={cx} y1={70} x2={cx + 30} y2={70} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1={cx} y1={150} x2={cx + 55} y2={150} stroke="#ea580c" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1={cx} y1={70} x2={cx} y2={150} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x={cx + 15} y={64} className="text-[9px] fill-red-500 font-bold font-mono">r</text>
            <text x={cx + 25} y={146} className="text-[9px] fill-orange-500 font-bold font-mono">R</text>
            <text x={cx - 12} y={115} className="text-[9px] fill-emerald-500 font-bold font-mono">h</text>
          </>
        );
      case 'pyramid':
        return (
          <>
            {/* Pyramid Base (Parallelogram) & slant faces */}
            <path
              d={`M ${cx - 50} 140 L ${cx + 20} 140 L ${cx + 50} 160 L ${cx - 20} 160 Z`}
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <path
              d={`M ${cx - 50} 140 L ${cx} 60 L ${cx + 20} 140 M ${cx} 60 L ${cx + 50} 160 M ${cx} 60 L ${cx - 20} 160`}
              className="fill-indigo-500/10 stroke-indigo-500"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Height */}
            <line x1={cx} y1={60} x2={cx + 5} y2={150} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x={cx + 10} y={105} className="text-[9px] fill-emerald-500 font-bold font-mono">h</text>
          </>
        );
      case 'pipe':
        return (
          <>
            {/* Outer Cylinder */}
            <path
              d={`M ${cx - 50} 70 L ${cx - 50} 150 A 50 15 0 0 0 ${cx + 50} 150 L ${cx + 50} 70 Z`}
              className="fill-indigo-500/10 stroke-indigo-500"
              strokeWidth="2"
            />
            {/* Top Outer Ellipse */}
            <ellipse cx={cx} cy={70} rx="50" ry="15" className="fill-indigo-500/20 stroke-indigo-500" strokeWidth="2.5" />
            {/* Top Inner Ellipse */}
            <ellipse cx={cx} cy={70} rx="30" ry="9" fill="none" stroke="#6366f1" strokeWidth="1.5" />
            {/* Bottom Inner Ellipse dashed */}
            <path
              d={`M ${cx - 30} 150 A 30 9 0 0 0 ${cx + 30} 150`}
              fill="none"
              stroke="#6366f1"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            {/* Radii labels */}
            <line x1={cx} y1={70} x2={cx + 30} y2={70} stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3 3" />
            <line x1={cx} y1={70} x2={cx + 50} y2={70} stroke="#ea580c" strokeWidth="1.2" strokeDasharray="3 3" />
            <text x={cx + 15} y={64} className="text-[8px] fill-red-500 font-bold font-mono">r</text>
            <text x={cx + 40} y={64} className="text-[8px] fill-orange-500 font-bold font-mono">R</text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Inputs Form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-4">
            Select 3D Shape
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {(['cylinder', 'cone', 'sphere', 'frustum', 'pyramid', 'pipe'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setShape(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  shape === s
                    ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Contextual form inputs */}
            {(shape === 'cylinder' || shape === 'cone' || shape === 'sphere') && (
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Radius (r)
                </label>
                <input
                  type="number"
                  value={radius1}
                  onChange={(e) => setRadius1(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                />
              </div>
            )}

            {(shape === 'frustum' || shape === 'pipe') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    {shape === 'frustum' ? 'Outer Radius R' : 'Outer Radius R'}
                  </label>
                  <input
                    type="number"
                    value={radius1}
                    onChange={(e) => setRadius1(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    {shape === 'frustum' ? 'Inner Radius r' : 'Inner Radius r'}
                  </label>
                  <input
                    type="number"
                    value={radius2}
                    onChange={(e) => setRadius2(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {shape === 'pyramid' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Base Width (w)
                  </label>
                  <input
                    type="number"
                    value={pyramidBaseW}
                    onChange={(e) => setPyramidBaseW(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    Base Length (l)
                  </label>
                  <input
                    type="number"
                    value={pyramidBaseL}
                    onChange={(e) => setPyramidBaseL(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {shape !== 'sphere' && (
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Height / Length (h)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Litre capacity and results */}
        <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-850 space-y-4">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            3D Volumetric Calculations Summary
          </h4>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-zinc-850 pb-1">
              <span>Volume:</span>
              <span className="font-bold text-emerald-450">{results.volume.toFixed(4)} cubic units</span>
            </div>
            <div className="flex justify-between border-b border-zinc-850 pb-1">
              <span>Litre Capacity:</span>
              <span className="font-bold text-emerald-450">{results.capacityLitres.toLocaleString(undefined, { maximumFractionDigits: 2 })} L</span>
            </div>
            <div className="flex justify-between">
              <span>Total Surface Area:</span>
              <span className="font-bold text-emerald-450">{results.surfaceArea.toFixed(4)} sq units</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Wireframe Canvas diagram */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
            3D Wireframe Isometric Vector Preview
          </h4>
          <div className="flex items-center justify-center">
            <svg
              width="100%"
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="border border-zinc-100 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
            >
              {renderIsometricSVG()}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
