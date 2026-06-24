import { useState, useMemo } from 'react';
import { ArrowLeft, RotateCcw, Download, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as math from 'mathjs';
import SEO from '../components/SEO';
import { solveEuler, solveImprovedEuler, solveRK4, type ODEStep } from '../utils/mathAdvanced';

export default function DifferentialEquationSolver() {
  const [expression, setExpression] = useState<string>('x - y');
  const [x0, setX0] = useState<number>(0);
  const [y0, setY0] = useState<number>(1);
  const [xEnd, setXEnd] = useState<number>(2);
  const [h, setH] = useState<number>(0.2);
  const [method, setMethod] = useState<'euler' | 'improved_euler' | 'rk4'>('rk4');
  const [error, setError] = useState<string | null>(null);

  // Examples helper
  const loadExample = (expr: string, initX: number, initY: number, endX: number, step: number, meth: 'euler' | 'improved_euler' | 'rk4') => {
    setExpression(expr);
    setX0(initX);
    setY0(initY);
    setXEnd(endX);
    setH(step);
    setMethod(meth);
    setError(null);
  };

  // Solve ODE
  const steps = useMemo<ODEStep[] | null>(() => {
    setError(null);
    if (!expression.trim()) return null;

    try {
      // Test compilation of expression
      const compiled = math.compile(expression);
      // Run dry evaluate to check for syntax
      compiled.evaluate({ x: x0, y: y0 });

      const f = (xVal: number, yVal: number): number => {
        const val = compiled.evaluate({ x: xVal, y: yVal });
        if (typeof val !== 'number' || isNaN(val)) {
          throw new Error('Equation evaluation did not yield a numerical result.');
        }
        return val;
      };

      if (h <= 0) {
        throw new Error('Step size (h) must be greater than zero.');
      }
      if (xEnd <= x0) {
        throw new Error('End X value must be greater than Initial X value.');
      }
      if ((xEnd - x0) / h > 1000) {
        throw new Error('Too many steps requested. Please increase step size (h) or reduce range.');
      }

      if (method === 'euler') {
        return solveEuler(f, x0, y0, xEnd, h);
      } else if (method === 'improved_euler') {
        return solveImprovedEuler(f, x0, y0, xEnd, h);
      } else {
        return solveRK4(f, x0, y0, xEnd, h);
      }
    } catch (e: any) {
      setError(e.message || 'Error processing differential equation solver.');
      return null;
    }
  }, [expression, x0, y0, xEnd, h, method]);

  // Export Steps as CSV
  const handleExportCSV = () => {
    if (!steps || steps.length === 0) return;
    const headers = ['Step', 'x', 'y'];
    const rows = steps.map(s => [s.step, s.x.toFixed(6), s.y.toFixed(6)]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ode_solution_${method}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setExpression('x - y');
    setX0(0);
    setY0(1);
    setXEnd(2);
    setH(0.2);
    setMethod('rk4');
    setError(null);
  };

  // Graph Bounds calculation
  const { pathD, minX, maxX, minY, maxY } = useMemo(() => {
    if (!steps || steps.length === 0) {
      return { pathD: '', minX: 0, maxX: 1, minY: 0, maxY: 1 };
    }

    const xs = steps.map(s => s.x);
    const ys = steps.map(s => s.y);

    const calculatedMinX = Math.min(...xs);
    const calculatedMaxX = Math.max(...xs);
    let calculatedMinY = Math.min(...ys);
    let calculatedMaxY = Math.max(...ys);

    // Ensure some padding in range
    const xRange = Math.max(calculatedMaxX - calculatedMinX, 0.1);
    const yRange = Math.max(calculatedMaxY - calculatedMinY, 0.1);

    const scaleMinX = calculatedMinX - xRange * 0.1;
    const scaleMaxX = calculatedMaxX + xRange * 0.1;
    const scaleMinY = calculatedMinY - yRange * 0.1;
    const scaleMaxY = calculatedMaxY + yRange * 0.1;

    // SVG parameters
    const svgW = 400;
    const svgH = 250;
    const pad = 30;

    const mapX = (xVal: number) => {
      const pct = (xVal - scaleMinX) / (scaleMaxX - scaleMinX);
      return pad + pct * (svgW - 2 * pad);
    };

    const mapY = (yVal: number) => {
      const pct = (yVal - scaleMinY) / (scaleMaxY - scaleMinY);
      return svgH - pad - pct * (svgH - 2 * pad);
    };

    const points = steps.map(s => `${mapX(s.x).toFixed(1)},${mapY(s.y).toFixed(1)}`);
    const pathStr = points.length > 1 ? `M ${points.join(' L ')}` : '';

    return {
      pathD: pathStr,
      minX: scaleMinX,
      maxX: scaleMaxX,
      minY: scaleMinY,
      maxY: scaleMaxY
    };
  }, [steps]);

  // Generate ticks for SVG grid
  const gridTicks = useMemo(() => {
    const ticksX: number[] = [];
    const ticksY: number[] = [];
    const stepsCount = 5;

    for (let i = 0; i <= stepsCount; i++) {
      ticksX.push(minX + (i / stepsCount) * (maxX - minX));
      ticksY.push(minY + (i / stepsCount) * (maxY - minY));
    }

    return { ticksX, ticksY };
  }, [minX, maxX, minY, maxY]);

  const svgWidth = 400;
  const svgHeight = 250;
  const padding = 30;

  const mapXCoordinate = (xVal: number) => {
    const pct = (xVal - minX) / (maxX - minX);
    return padding + pct * (svgWidth - 2 * padding);
  };

  const mapYCoordinate = (yVal: number) => {
    const pct = (yVal - minY) / (maxY - minY);
    return svgHeight - padding - pct * (svgHeight - 2 * padding);
  };

  return (
    <>
      <SEO
        title="Ordinary Differential Equation (ODE) Solver | Euler & RK4"
        description="Solve first-order ordinary differential equations numerically. Compares Euler, Heun (Improved Euler), and Runge-Kutta 4th Order methods with graphs."
        keywords={['ode solver', 'differential equations', 'runge kutta solver', 'euler method', 'rk4 calculator']}
      />

      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 mb-6">
        <Link
          to="/math-studio"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Math Studio</span>
        </Link>
        <div className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold flex items-center gap-1.5">
          <Link to="/" className="hover:text-indigo-500 transition-colors">Home</Link>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <Link to="/math-studio" className="hover:text-indigo-500 transition-colors">Math Studio</Link>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">ODE Solver</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Differential Equation (ODE) Solver
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
              Solve first-order initial value problems dy/dx = f(x, y) numerically using Euler, Improved Euler, and RK4.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left Column: inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  Equation dy/dx = f(x, y)
                </label>
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="e.g. x - y"
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                    Initial x0
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={x0}
                    onChange={(e) => setX0(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                    Initial y(x0) = y0
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={y0}
                    onChange={(e) => setY0(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                    Solve Until x
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={xEnd}
                    onChange={(e) => setXEnd(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                    Step Size (h)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={h}
                    onChange={(e) => setH(parseFloat(e.target.value) || 0.1)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  Solver Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['euler', 'improved_euler', 'rk4'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition ${
                        method === m
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
                      }`}
                    >
                      {m === 'euler' ? 'Euler' : m === 'improved_euler' ? 'Heun\'s' : 'RK4'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets */}
              <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">
                  Presets & System Models
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadExample('x - y', 0, 1, 2, 0.2, 'rk4')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    dy/dx = x - y
                  </button>
                  <button
                    onClick={() => loadExample('y', 0, 1, 3, 0.25, 'rk4')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    dy/dx = y (Exponential)
                  </button>
                  <button
                    onClick={() => loadExample('-0.1 * (y - 20)', 0, 100, 20, 1.0, 'rk4')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    Cooling Law
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-xs font-bold text-zinc-600 dark:text-zinc-400 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                {steps && steps.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 dark:bg-indigo-650 dark:hover:bg-indigo-550 text-white text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-450 text-xs font-semibold">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Graphs & Steps table */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Phase Path Graph Integration</span>
                <span className="text-[10px] font-mono text-zinc-450">
                  y vs x ({method.toUpperCase()})
                </span>
              </h4>
              <div className="flex items-center justify-center">
                <svg
                  width="100%"
                  height={svgHeight}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="border border-zinc-100 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
                >
                  {/* Grid Lines */}
                  {gridTicks.ticksX.map((val, i) => {
                    const lineX = mapXCoordinate(val);
                    return (
                      <g key={`x-${i}`}>
                        <line
                          x1={lineX}
                          y1={0}
                          x2={lineX}
                          y2={svgHeight}
                          stroke="currentColor"
                          className="text-zinc-200 dark:text-zinc-850/60"
                          strokeWidth={0.5}
                        />
                        <text
                          x={lineX}
                          y={svgHeight - 10}
                          textAnchor="middle"
                          className="text-[9px] font-bold fill-zinc-400 font-mono"
                        >
                          {val.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}
                  {gridTicks.ticksY.map((val, i) => {
                    const lineY = mapYCoordinate(val);
                    return (
                      <g key={`y-${i}`}>
                        <line
                          x1={0}
                          y1={lineY}
                          x2={svgWidth}
                          y2={lineY}
                          stroke="currentColor"
                          className="text-zinc-200 dark:text-zinc-850/60"
                          strokeWidth={0.5}
                        />
                        <text
                          x={10}
                          y={lineY + 3}
                          textAnchor="start"
                          className="text-[9px] font-bold fill-zinc-400 font-mono"
                        >
                          {val.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}

                  {/* ODE Path */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Draw Nodes */}
                  {steps && steps.map((s, idx) => (
                    <circle
                      key={`circle-${idx}`}
                      cx={mapXCoordinate(s.x)}
                      cy={mapYCoordinate(s.y)}
                      r={3}
                      className="fill-indigo-650 stroke-white dark:stroke-zinc-900"
                      strokeWidth={1}
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Steps Log */}
            {steps && steps.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                  Iterative Computational Log
                </h4>
                <div className="max-h-72 overflow-y-auto border border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-800 text-[10px] text-zinc-400 font-bold uppercase">
                        <th className="py-2.5 px-4">Step (i)</th>
                        <th className="py-2.5 px-4">x_i</th>
                        <th className="py-2.5 px-4 font-bold text-indigo-500">y_i</th>
                        <th className="py-2.5 px-4">dy/dx</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                      {steps.map((s, idx) => {
                        let derivativeAtStep = '-';
                        try {
                          const compiled = math.compile(expression);
                          const dVal = compiled.evaluate({ x: s.x, y: s.y });
                          if (typeof dVal === 'number') derivativeAtStep = dVal.toFixed(4);
                        } catch {}

                        return (
                          <tr key={idx} className="hover:bg-zinc-50/55 dark:hover:bg-zinc-850/20 text-zinc-700 dark:text-zinc-350">
                            <td className="py-2 px-4">{s.step}</td>
                            <td className="py-2 px-4">{s.x.toFixed(4)}</td>
                            <td className="py-2 px-4 font-bold text-zinc-900 dark:text-white">{s.y.toFixed(6)}</td>
                            <td className="py-2 px-4">{derivativeAtStep}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Educational Info */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Numerical ODE Integration Info
              </h4>
              <div className="text-xs text-zinc-650 dark:text-zinc-350 space-y-3 leading-relaxed">
                <p>
                  Euler methods and Runge-Kutta 4th Order solvers approximate values for ordinary differential equations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[10px] text-zinc-550 dark:text-zinc-450">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl space-y-1.5">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">Euler Method</span>
                    First-order solver. Fast but carries high global truncation error.
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl space-y-1.5">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">Heun's Method</span>
                    Predictor-corrector setup. Carries moderate accuracy with global error.
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl space-y-1.5">
                    <span className="font-bold text-indigo-650 dark:text-indigo-400 block text-xs">RK4 Method</span>
                    Industry standard using weighted intermediate slopes. High accuracy.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
