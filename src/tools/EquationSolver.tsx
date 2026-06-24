import { useState, useMemo } from 'react';
import { solveLinear, solveQuadratic, solveSimultaneous } from '../utils/mathCalc';

export default function EquationSolver() {
  const [eqType, setEqType] = useState<'linear' | 'quadratic' | 'simultaneous'>('quadratic');

  // Linear inputs (ax + b = 0)
  const [linA, setLinA] = useState<number>(2);
  const [linB, setLinB] = useState<number>(-4);

  // Quadratic inputs (ax^2 + bx + c = 0)
  const [quadA, setQuadA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(-5);
  const [quadC, setQuadC] = useState<number>(6);

  // Simultaneous inputs
  // a1 x + b1 y = c1
  // a2 x + b2 y = c2
  const [simA1, setSimA1] = useState<number>(1);
  const [simB1, setSimB1] = useState<number>(1);
  const [simC1, setSimC1] = useState<number>(5);
  const [simA2, setSimA2] = useState<number>(1);
  const [simB2, setSimB2] = useState<number>(-1);
  const [simC2, setSimC2] = useState<number>(1);

  // Solutions
  const linearSolution = useMemo(() => solveLinear(linA, linB), [linA, linB]);
  const quadraticSolution = useMemo(() => solveQuadratic(quadA, quadB, quadC), [quadA, quadB, quadC]);
  const simultaneousSolution = useMemo(() => solveSimultaneous(simA1, simB1, simC1, simA2, simB2, simC2), [
    simA1, simB1, simC1, simA2, simB2, simC2
  ]);

  // Graph rendering variables
  const svgWidth = 400;
  const svgHeight = 250;
  const originX = svgWidth / 2;
  const originY = svgHeight / 2;
  const scale = 20; // 20 pixels = 1 coordinate unit

  const mapX = (x: number) => originX + x * scale;
  const mapY = (y: number) => originY - y * scale;

  // Render SVG content based on active equation
  const renderSVGGraph = () => {
    // Generate grid lines
    const gridLines = [];
    const minVal = -10;
    const maxVal = 10;

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

    if (eqType === 'linear') {
      // Plot y = ax + b (actually plotting function line to show the root)
      // Since ax + b = 0, the equation line we visualize is y = ax + b, crossing x-axis at root.
      const points = [];
      for (let x = -10; x <= 10; x += 0.5) {
        points.push(`${mapX(x)},${mapY(linA * x + linB)}`);
      }
      const rootX = linearSolution.root;

      return (
        <>
          {gridLines}
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
          />
          {rootX !== null && !isNaN(rootX) && (
            <circle
              cx={mapX(rootX)}
              cy={mapY(0)}
              r="6"
              className="fill-indigo-500 stroke-white dark:stroke-zinc-900"
              strokeWidth="2"
            />
          )}
        </>
      );
    } else if (eqType === 'quadratic') {
      // Plot y = ax^2 + bx + c
      const points = [];
      for (let x = -10; x <= 10; x += 0.25) {
        const y = quadA * x * x + quadB * x + quadC;
        points.push(`${mapX(x)},${mapY(y)}`);
      }

      return (
        <>
          {gridLines}
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="#a855f7"
            strokeWidth="2.5"
          />
          {/* Real roots */}
          {quadraticSolution.roots.map((root, idx) => {
            if (root.imag === 0 && !isNaN(root.real) && Math.abs(root.real) <= 10) {
              return (
                <circle
                  key={`root-${idx}`}
                  cx={mapX(root.real)}
                  cy={mapY(0)}
                  r="6"
                  className="fill-purple-500 stroke-white dark:stroke-zinc-900"
                  strokeWidth="2"
                />
              );
            }
            return null;
          })}
        </>
      );
    } else {
      // Plot:
      // Line 1: y = (c1 - a1*x)/b1 or vertical if b1 = 0
      // Line 2: y = (c2 - a2*x)/b2 or vertical if b2 = 0
      const points1 = [];
      const points2 = [];

      for (let x = -10; x <= 10; x += 1) {
        if (simB1 !== 0) {
          points1.push(`${mapX(x)},${mapY((simC1 - simA1 * x) / simB1)}`);
        }
        if (simB2 !== 0) {
          points2.push(`${mapX(x)},${mapY((simC2 - simA2 * x) / simB2)}`);
        }
      }

      return (
        <>
          {gridLines}
          {simB1 !== 0 ? (
            <polyline
              points={points1.join(' ')}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
            />
          ) : (
            <line
              x1={mapX(simC1 / simA1)}
              y1={0}
              x2={mapX(simC1 / simA1)}
              y2={svgHeight}
              stroke="#ef4444"
              strokeWidth="2"
            />
          )}

          {simB2 !== 0 ? (
            <polyline
              points={points2.join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          ) : (
            <line
              x1={mapX(simC2 / simA2)}
              y1={0}
              x2={mapX(simC2 / simA2)}
              y2={svgHeight}
              stroke="#3b82f6"
              strokeWidth="2"
            />
          )}

          {/* Intersection point */}
          {simultaneousSolution.x !== null && simultaneousSolution.y !== null && (
            <circle
              cx={mapX(simultaneousSolution.x)}
              cy={mapY(simultaneousSolution.y)}
              r="6"
              className="fill-emerald-500 stroke-white dark:stroke-zinc-900"
              strokeWidth="2"
            />
          )}
        </>
      );
    }
  };

  const activeSteps = useMemo(() => {
    if (eqType === 'linear') return linearSolution.steps;
    if (eqType === 'quadratic') return quadraticSolution.steps;
    return simultaneousSolution.steps;
  }, [eqType, linearSolution, quadraticSolution, simultaneousSolution]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Inputs Form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
            Select Equation Type
          </h3>
          <div className="flex gap-2 mb-6">
            {(['linear', 'quadratic', 'simultaneous'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setEqType(t)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  eqType === t
                    ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Input fields based on type */}
          {eqType === 'linear' && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Equation: <span className="font-mono text-indigo-500">{linA}x + ({linB}) = 0</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    Coefficient a
                  </label>
                  <input
                    type="number"
                    value={linA}
                    onChange={(e) => setLinA(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    Constant b
                  </label>
                  <input
                    type="number"
                    value={linB}
                    onChange={(e) => setLinB(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {eqType === 'quadratic' && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Equation: <span className="font-mono text-purple-500">{quadA}x² + ({quadB})x + ({quadC}) = 0</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    a (x²)
                  </label>
                  <input
                    type="number"
                    value={quadA}
                    onChange={(e) => setQuadA(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    b (x)
                  </label>
                  <input
                    type="number"
                    value={quadB}
                    onChange={(e) => setQuadB(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    c (const)
                  </label>
                  <input
                    type="number"
                    value={quadC}
                    onChange={(e) => setQuadC(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {eqType === 'simultaneous' && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Equations: <br />
                <span className="font-mono text-red-500">1) {simA1}x + {simB1}y = {simC1}</span> <br />
                <span className="font-mono text-blue-500">2) {simA2}x + {simB2}y = {simC2}</span>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      a1
                    </label>
                    <input
                      type="number"
                      value={simA1}
                      onChange={(e) => setSimA1(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      b1
                    </label>
                    <input
                      type="number"
                      value={simB1}
                      onChange={(e) => setSimB1(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      c1
                    </label>
                    <input
                      type="number"
                      value={simC1}
                      onChange={(e) => setSimC1(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      a2
                    </label>
                    <input
                      type="number"
                      value={simA2}
                      onChange={(e) => setSimA2(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      b2
                    </label>
                    <input
                      type="number"
                      value={simB2}
                      onChange={(e) => setSimB2(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                      c2
                    </label>
                    <input
                      type="number"
                      value={simC2}
                      onChange={(e) => setSimC2(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Badge */}
        <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-800">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
            Solved Answer Summary
          </h4>
          <div className="font-mono text-xl font-bold text-emerald-400">
            {eqType === 'linear' && (linearSolution.root !== null ? `x = ${linearSolution.root.toFixed(4)}` : 'No unique root')}
            {eqType === 'quadratic' && quadraticSolution.equationText}
            {eqType === 'simultaneous' && (
              simultaneousSolution.x !== null 
                ? `x = ${simultaneousSolution.x.toFixed(4)}, y = ${simultaneousSolution.y?.toFixed(4)}` 
                : 'No unique solution'
            )}
          </div>
        </div>
      </div>

      {/* Visual Graph & Calculations Steps */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
            Coordinate Plane Preview (-10 to 10)
          </h4>
          <div className="overflow-hidden flex items-center justify-center">
            <svg
              width="100%"
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="border border-zinc-100 dark:border-zinc-800 rounded-xl bg-zinc-50/40 dark:bg-zinc-950/20"
            >
              {renderSVGGraph()}
            </svg>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
            Detailed Step-by-Step Solution
          </h4>
          <div className="font-mono text-xs text-zinc-650 dark:text-zinc-350 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl space-y-2 border border-zinc-100 dark:border-zinc-800/60 max-h-72 overflow-y-auto">
            {activeSteps.map((step, idx) => (
              <div key={idx} className="border-l-2 border-indigo-500/40 pl-3 py-0.5">
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
