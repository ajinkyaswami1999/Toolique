import { useState, useMemo } from 'react';
import { calculateCoordinateMetrics, pointToLineDistance } from '../utils/mathCalc';

export default function CoordinateGeometryCalculator() {
  // Point 1
  const [x1, setX1] = useState<number>(-2);
  const [y1, setY1] = useState<number>(-1);

  // Point 2
  const [x2, setX2] = useState<number>(4);
  const [y2, setY2] = useState<number>(3);

  // Point 3 (For Clearance calculations)
  const [x3, setX3] = useState<number>(1);
  const [y3, setY3] = useState<number>(4);

  // Calculate coordinates metrics
  const metrics = useMemo(() => {
    const p1 = { x: x1, y: y1 };
    const p2 = { x: x2, y: y2 };
    return calculateCoordinateMetrics(p1, p2);
  }, [x1, y1, x2, y2]);

  const clearanceDist = useMemo(() => {
    const eq = metrics.equation;
    const p3 = { x: x3, y: y3 };
    return pointToLineDistance(p3, eq.A, eq.B, eq.C);
  }, [x3, y3, metrics]);

  // SVG coordinate layout
  const svgWidth = 400;
  const svgHeight = 250;
  const originX = svgWidth / 2;
  const originY = svgHeight / 2;
  const scale = 20; // 20 pixels = 1 coordinate unit

  const mapX = (xVal: number) => originX + xVal * scale;
  const mapY = (yVal: number) => originY - yVal * scale;

  const renderCoordinateGrid = () => {
    const gridLines = [];
    const minVal = -10;
    const maxVal = 10;

    // Draw grid lines
    for (let i = minVal; i <= maxVal; i++) {
      gridLines.push(
        <line
          key={`x-${i}`}
          x1={mapX(i)}
          y1={0}
          x2={mapX(i)}
          y2={svgHeight}
          stroke="currentColor"
          className="text-zinc-200 dark:text-zinc-800/40"
          strokeWidth={i === 0 ? 1.5 : 0.5}
        />
      );
      gridLines.push(
        <line
          key={`y-${i}`}
          x1={0}
          y1={mapY(i)}
          x2={svgWidth}
          y2={mapY(i)}
          stroke="currentColor"
          className="text-zinc-200 dark:text-zinc-800/40"
          strokeWidth={i === 0 ? 1.5 : 0.5}
        />
      );
    }

    return (
      <>
        {gridLines}
        {/* Draw Line connecting P1 and P2 */}
        <line
          x1={mapX(x1)}
          y1={mapY(y1)}
          x2={mapX(x2)}
          y2={mapY(y2)}
          stroke="#6366f1"
          strokeWidth="3.5"
        />

        {/* Draw Midpoint */}
        <circle
          cx={mapX(metrics.midpoint.x)}
          cy={mapY(metrics.midpoint.y)}
          r="5"
          className="fill-emerald-500 stroke-white dark:stroke-zinc-950"
          strokeWidth="2"
        />

        {/* Plot Point 1 */}
        <circle
          cx={mapX(x1)}
          cy={mapY(y1)}
          r="6"
          className="fill-indigo-500 stroke-white dark:stroke-zinc-950"
          strokeWidth="2.5"
        />
        {/* Plot Point 2 */}
        <circle
          cx={mapX(x2)}
          cy={mapY(y2)}
          r="6"
          className="fill-indigo-500 stroke-white dark:stroke-zinc-950"
          strokeWidth="2.5"
        />

        {/* Plot Point 3 */}
        <circle
          cx={mapX(x3)}
          cy={mapY(y3)}
          r="6"
          className="fill-rose-500 stroke-white dark:stroke-zinc-950"
          strokeWidth="2.5"
        />

        {/* Text Labels */}
        <text x={mapX(x1) + 8} y={mapY(y1) - 8} className="text-[9px] font-bold font-mono fill-zinc-650 dark:fill-zinc-350">
          P1({x1}, {y1})
        </text>
        <text x={mapX(x2) + 8} y={mapY(y2) - 8} className="text-[9px] font-bold font-mono fill-zinc-650 dark:fill-zinc-350">
          P2({x2}, {y2})
        </text>
        <text x={mapX(x3) + 8} y={mapY(y3) - 8} className="text-[9px] font-bold font-mono fill-rose-500">
          P3({x3}, {y3})
        </text>
      </>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Inputs Form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Point Coordinates
          </h3>

          <div className="space-y-4">
            {/* Point 1 inputs */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Point 1 (P1)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={x1}
                  onChange={(e) => setX1(parseFloat(e.target.value) || 0)}
                  placeholder="X1"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-205 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                />
                <input
                  type="number"
                  value={y1}
                  onChange={(e) => setY1(parseFloat(e.target.value) || 0)}
                  placeholder="Y1"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-205 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                />
              </div>
            </div>

            {/* Point 2 inputs */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Point 2 (P2)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={x2}
                  onChange={(e) => setX2(parseFloat(e.target.value) || 0)}
                  placeholder="X2"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-205 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                />
                <input
                  type="number"
                  value={y2}
                  onChange={(e) => setY2(parseFloat(e.target.value) || 0)}
                  placeholder="Y2"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-205 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                />
              </div>
            </div>

            {/* Point 3 inputs */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider">
                Point 3 (Clearance Target P3)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={x3}
                  onChange={(e) => setX3(parseFloat(e.target.value) || 0)}
                  placeholder="X3"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-205 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                />
                <input
                  type="number"
                  value={y3}
                  onChange={(e) => setY3(parseFloat(e.target.value) || 0)}
                  placeholder="Y3"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-205 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Math Results summary */}
        <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-850 space-y-4">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Plotted Coordinate Metrics
          </h4>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-zinc-850 pb-1">
              <span>Distance (P1➔P2):</span>
              <span className="font-bold text-emerald-450">{metrics.distance.toFixed(4)}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-850 pb-1">
              <span>Midpoint:</span>
              <span className="font-bold text-emerald-450">({metrics.midpoint.x.toFixed(1)}, {metrics.midpoint.y.toFixed(1)})</span>
            </div>
            <div className="flex justify-between border-b border-zinc-850 pb-1">
              <span>Slope (m):</span>
              <span>{metrics.slope !== null ? metrics.slope.toFixed(4) : 'Undefined (Vertical)'}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-850 pb-1">
              <span>Slope-Intercept Line:</span>
              <span className="font-bold">{metrics.equation.slopeInterceptText}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-850 pb-1">
              <span>General Equation:</span>
              <span className="font-bold">{metrics.equation.generalText}</span>
            </div>
            <div className="flex justify-between">
              <span>P3 Clearance to line:</span>
              <span className="font-bold text-rose-400">{clearanceDist.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Canvas Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
            Cartesian Coordinate Plot (-10 to 10)
          </h4>
          <div className="flex items-center justify-center">
            <svg
              width="100%"
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="border border-zinc-100 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
            >
              {renderCoordinateGrid()}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
