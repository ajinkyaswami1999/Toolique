import { useState, useMemo } from 'react';
import { solveTriangleSSS } from '../utils/mathCalc';

export default function GeometrySolver() {
  const [shape, setShape] = useState<'triangle' | 'circle' | 'rectangle' | 'polygon'>('triangle');
  const [triCriteria, setTriCriteria] = useState<'SSS' | 'SAS' | 'ASA' | 'AAS'>('SSS');

  // Triangle Inputs
  const [triA, setTriA] = useState<number>(3);
  const [triB, setTriB] = useState<number>(4);
  const [triC, setTriC] = useState<number>(5);
  const [triAngle1, setTriAngle1] = useState<number>(60);
  const [triAngle2, setTriAngle2] = useState<number>(50);

  // Other shapes inputs
  const [circleR, setCircleR] = useState<number>(5);
  const [rectW, setRectW] = useState<number>(8);
  const [rectH, setRectH] = useState<number>(4);
  const [polyN, setPolyN] = useState<number>(6);
  const [polyS, setPolyS] = useState<number>(4);

  // Solve Triangle math helper
  const solvedTriangle = useMemo(() => {
    if (shape !== 'triangle') return null;
    const rad = Math.PI / 180;
    const deg = 180 / Math.PI;

    try {
      if (triCriteria === 'SSS') {
        return solveTriangleSSS(triA, triB, triC);
      } else if (triCriteria === 'SAS') {
        const sideA = triA;
        const sideB = triB;
        const gamma = triAngle1; // Angle between A and B
        if (gamma <= 0 || gamma >= 180) return null;

        const sideC = Math.sqrt(sideA*sideA + sideB*sideB - 2*sideA*sideB*Math.cos(gamma * rad));
        const alpha = Math.acos((sideB*sideB + sideC*sideC - sideA*sideA) / (2*sideB*sideC)) * deg;
        const beta = 180 - alpha - gamma;
        const s = (sideA + sideB + sideC) / 2;
        const area = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));

        return { a: sideA, b: sideB, c: sideC, alpha, beta, gamma, area, perimeter: sideA+sideB+sideC, type: 'SAS Solved' };
      } else if (triCriteria === 'ASA') {
        const alpha = triAngle1;
        const sideC = triA;
        const beta = triAngle2;
        const gamma = 180 - alpha - beta;
        if (gamma <= 0 || gamma >= 180) return null;

        const sideA = (sideC * Math.sin(alpha * rad)) / Math.sin(gamma * rad);
        const sideB = (sideC * Math.sin(beta * rad)) / Math.sin(gamma * rad);
        const s = (sideA + sideB + sideC) / 2;
        const area = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));

        return { a: sideA, b: sideB, c: sideC, alpha, beta, gamma, area, perimeter: sideA+sideB+sideC, type: 'ASA Solved' };
      } else {
        // AAS: Angle alpha, Angle beta, Side a
        const alpha = triAngle1;
        const beta = triAngle2;
        const sideA = triA;
        const gamma = 180 - alpha - beta;
        if (gamma <= 0 || gamma >= 180 || alpha <= 0 || beta <= 0) return null;

        const sideB = (sideA * Math.sin(beta * rad)) / Math.sin(alpha * rad);
        const sideC = (sideA * Math.sin(gamma * rad)) / Math.sin(alpha * rad);
        const s = (sideA + sideB + sideC) / 2;
        const area = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));

        return { a: sideA, b: sideB, c: sideC, alpha, beta, gamma, area, perimeter: sideA+sideB+sideC, type: 'AAS Solved' };
      }
    } catch {
      return null;
    }
  }, [shape, triCriteria, triA, triB, triC, triAngle1, triAngle2]);

  // Diagram details
  const svgWidth = 350;
  const svgHeight = 250;
  const padding = 40;

  const renderSVGDiagram = () => {
    if (shape === 'triangle') {
      if (!solvedTriangle) {
        return (
          <text x={svgWidth / 2} y={svgHeight / 2} textAnchor="middle" className="text-xs fill-zinc-400 font-bold">
            Invalid Triangle Constraints
          </text>
        );
      }

      const { a, b, c, alpha } = solvedTriangle;
      const alphaRad = alpha * (Math.PI / 185);

      // Points of Triangle:
      // Point 1: (0, 0)
      // Point 2: (c, 0)
      // Point 3: (b * cos(alpha), b * sin(alpha))
      const x1 = 0;
      const y1 = 0;
      const x2 = c;
      const y2 = 0;
      const x3 = b * Math.cos(alphaRad);
      const y3 = b * Math.sin(alphaRad);

      const minX = Math.min(x1, x2, x3);
      const maxX = Math.max(x1, x2, x3);
      const minY = Math.min(y1, y2, y3);
      const maxY = Math.max(y1, y2, y3);

      const scaleX = (svgWidth - 2 * padding) / (maxX - minX || 1);
      const scaleY = (svgHeight - 2 * padding) / (maxY - minY || 1);
      const scale = Math.min(scaleX, scaleY);

      // Transform coordinate system to center triangle and flip Y axis
      const getX = (val: number) => padding + (val - minX) * scale;
      const getY = (val: number) => svgHeight - padding - (val - minY) * scale;

      const p1 = `${getX(x1)},${getY(y1)}`;
      const p2 = `${getX(x2)},${getY(y2)}`;
      const p3 = `${getX(x3)},${getY(y3)}`;

      return (
        <>
          <polygon
            points={`${p1} ${p2} ${p3}`}
            className="fill-indigo-500/10 stroke-indigo-500"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Label Nodes */}
          <circle cx={getX(x1)} cy={getY(y1)} r="4.5" className="fill-white stroke-indigo-500" strokeWidth="2" />
          <circle cx={getX(x2)} cy={getY(y2)} r="4.5" className="fill-white stroke-indigo-500" strokeWidth="2" />
          <circle cx={getX(x3)} cy={getY(y3)} r="4.5" className="fill-white stroke-indigo-500" strokeWidth="2" />
          {/* Labels */}
          <text x={getX(x1) - 10} y={getY(y1) + 12} className="text-[10px] font-bold fill-zinc-400">A</text>
          <text x={getX(x2) + 10} y={getY(y2) + 12} className="text-[10px] font-bold fill-zinc-400">B</text>
          <text x={getX(x3)} y={getY(y3) - 10} textAnchor="middle" className="text-[10px] font-bold fill-zinc-400">C</text>

          {/* Side length annotations */}
          <text x={(getX(x1)+getX(x2))/2} y={getY(y1)+15} textAnchor="middle" className="text-[9px] font-mono fill-zinc-500">c={c.toFixed(1)}</text>
          <text x={(getX(x1)+getX(x3))/2 - 15} y={(getY(y1)+getY(x3))/2} className="text-[9px] font-mono fill-zinc-500">b={b.toFixed(1)}</text>
          <text x={(getX(x2)+getX(x3))/2 + 15} y={(getY(y2)+getY(x3))/2} className="text-[9px] font-mono fill-zinc-500">a={a.toFixed(1)}</text>
        </>
      );
    }

    if (shape === 'circle') {
      const cx = svgWidth / 2;
      const cy = svgHeight / 2;
      const r = 70;

      return (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            className="fill-indigo-500/10 stroke-indigo-500"
            strokeWidth="2.5"
          />
          <line
            x1={cx}
            y1={cy}
            x2={cx + r}
            y2={cy}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
          <circle cx={cx} cy={cy} r="4" className="fill-zinc-800 dark:fill-white" />
          <text x={cx + r / 2} y={cy - 6} textAnchor="middle" className="text-[9px] font-mono fill-red-500">
            r={circleR}
          </text>
        </>
      );
    }

    if (shape === 'rectangle') {
      const w = 150;
      const h = 90;
      const x = (svgWidth - w) / 2;
      const y = (svgHeight - h) / 2;

      return (
        <>
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            className="fill-indigo-500/10 stroke-indigo-500"
            strokeWidth="2.5"
            rx="4"
          />
          <text x={x + w / 2} y={y - 8} textAnchor="middle" className="text-[10px] font-mono fill-zinc-400">
            Width = {rectW}
          </text>
          <text x={x - 12} y={y + h / 2} textAnchor="middle" className="text-[10px] font-mono fill-zinc-400" transform={`rotate(-90, ${x-12}, ${y+h/2})`}>
            Height = {rectH}
          </text>
        </>
      );
    }

    if (shape === 'polygon') {
      const cx = svgWidth / 2;
      const cy = svgHeight / 2;
      const R = 75;
      const points = [];

      for (let i = 0; i < polyN; i++) {
        const angle = (2 * Math.PI * i) / polyN - Math.PI / 2;
        points.push(`${cx + R * Math.cos(angle)},${cy + R * Math.sin(angle)}`);
      }

      return (
        <>
          <polygon
            points={points.join(' ')}
            className="fill-indigo-500/10 stroke-indigo-500"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Side length indicator */}
          {polyN > 2 && (
            <text x={cx} y={cy + R + 15} textAnchor="middle" className="text-[9px] font-mono fill-zinc-500">
              n={polyN} sides | s={polyS}
            </text>
          )}
        </>
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Inputs Form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-4">
            Select 2D Geometry Shape
          </h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {(['triangle', 'circle', 'rectangle', 'polygon'] as const).map((s) => (
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

          {/* Form fields based on Shape selection */}
          {shape === 'triangle' && (
            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl mb-4">
                {(['SSS', 'SAS', 'ASA', 'AAS'] as const).map((crit) => (
                  <button
                    key={crit}
                    onClick={() => setTriCriteria(crit)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border-none transition-colors ${
                      triCriteria === crit
                        ? 'bg-indigo-500/10 text-indigo-750 dark:text-indigo-400'
                        : 'text-zinc-500 hover:text-zinc-600'
                    }`}
                  >
                    {crit}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {triCriteria === 'SSS' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Side a</label>
                      <input type="number" value={triA} onChange={(e) => setTriA(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Side b</label>
                      <input type="number" value={triB} onChange={(e) => setTriB(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Side c</label>
                      <input type="number" value={triC} onChange={(e) => setTriC(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs" />
                    </div>
                  </>
                )}

                {triCriteria === 'SAS' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Side a</label>
                      <input type="number" value={triA} onChange={(e) => setTriA(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Side b</label>
                      <input type="number" value={triB} onChange={(e) => setTriB(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Included Angle gamma (°)</label>
                      <input type="number" value={triAngle1} onChange={(e) => setTriAngle1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs" />
                    </div>
                  </>
                )}

                {triCriteria === 'ASA' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Angle alpha (°)</label>
                      <input type="number" value={triAngle1} onChange={(e) => setTriAngle1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Angle beta (°)</label>
                      <input type="number" value={triAngle2} onChange={(e) => setTriAngle2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Bottom Side c</label>
                      <input type="number" value={triA} onChange={(e) => setTriA(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs" />
                    </div>
                  </>
                )}

                {triCriteria === 'AAS' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Angle alpha (°)</label>
                      <input type="number" value={triAngle1} onChange={(e) => setTriAngle1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Angle beta (°)</label>
                      <input type="number" value={triAngle2} onChange={(e) => setTriAngle2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Opposite Side a</label>
                      <input type="number" value={triA} onChange={(e) => setTriA(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs" />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {shape === 'circle' && (
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Circle Radius (r)
              </label>
              <input
                type="number"
                value={circleR}
                onChange={(e) => setCircleR(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
              />
            </div>
          )}

          {shape === 'rectangle' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Width (w)
                </label>
                <input
                  type="number"
                  value={rectW}
                  onChange={(e) => setRectW(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Height (h)
                </label>
                <input
                  type="number"
                  value={rectH}
                  onChange={(e) => setRectH(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {shape === 'polygon' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Number of Sides (n)
                </label>
                <input
                  type="number"
                  value={polyN}
                  min="3"
                  onChange={(e) => setPolyN(parseInt(e.target.value) || 3)}
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Side Length (s)
                </label>
                <input
                  type="number"
                  value={polyS}
                  onChange={(e) => setPolyS(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Overview */}
        <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-850 space-y-4">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Geometry Metrics Summary
          </h4>
          <div className="space-y-2 text-xs font-mono">
            {shape === 'triangle' && solvedTriangle && (
              <>
                <div className="flex justify-between border-b border-zinc-850 pb-1">
                  <span>Perimeter:</span>
                  <span className="font-bold text-emerald-450">{solvedTriangle.perimeter.toFixed(3)}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-850 pb-1">
                  <span>Surface Area:</span>
                  <span className="font-bold text-emerald-450">{solvedTriangle.area.toFixed(4)}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-850 pb-1">
                  <span>Angles (A, B, C):</span>
                  <span>{solvedTriangle.alpha.toFixed(1)}°, {solvedTriangle.beta.toFixed(1)}°, {solvedTriangle.gamma.toFixed(1)}°</span>
                </div>
                <div className="flex justify-between">
                  <span>Triangle Type:</span>
                  <span className="font-bold">{solvedTriangle.type}</span>
                </div>
              </>
            )}

            {shape === 'circle' && (
              <>
                <div className="flex justify-between border-b border-zinc-850 pb-1">
                  <span>Circumference:</span>
                  <span className="font-bold text-emerald-450">{(2 * Math.PI * circleR).toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Area:</span>
                  <span className="font-bold text-emerald-450">{(Math.PI * circleR * circleR).toFixed(4)}</span>
                </div>
              </>
            )}

            {shape === 'rectangle' && (
              <>
                <div className="flex justify-between border-b border-zinc-850 pb-1">
                  <span>Perimeter:</span>
                  <span className="font-bold text-emerald-450">{(2 * (rectW + rectH)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-850 pb-1">
                  <span>Diagonal:</span>
                  <span>{Math.sqrt(rectW*rectW + rectH*rectH).toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Area:</span>
                  <span className="font-bold text-emerald-450">{(rectW * rectH).toFixed(2)}</span>
                </div>
              </>
            )}

            {shape === 'polygon' && (
              <>
                <div className="flex justify-between border-b border-zinc-850 pb-1">
                  <span>Perimeter:</span>
                  <span className="font-bold text-emerald-450">{(polyN * polyS).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-850 pb-1">
                  <span>Interior Angle:</span>
                  <span>{(((polyN - 2) * 180) / polyN).toFixed(1)}°</span>
                </div>
                <div className="flex justify-between">
                  <span>Area:</span>
                  <span className="font-bold text-emerald-450">
                    {(polyN > 2 ? (polyN * polyS * polyS) / (4 * Math.tan(Math.PI / polyN)) : 0).toFixed(4)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Diagram Visualizer */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
            Dynamic Scaling Vector Diagram
          </h4>
          <div className="flex items-center justify-center">
            <svg
              width="100%"
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="border border-zinc-100 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
            >
              {renderSVGDiagram()}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
