import { useState, useMemo } from 'react';
import { ArrowLeft, RotateCcw, Calculator, Download } from 'lucide-react';
import * as math from 'mathjs';
import { solveBisection, solveNewtonRaphson, solveSecant } from '../utils/mathAdvanced';
import SEO from '../components/SEO';

export default function NumericalRootFinder() {
  const [expression, setExpression] = useState<string>('x^3 - x - 2');
  const [method, setMethod] = useState<'bisection' | 'newton' | 'secant'>('bisection');
  const [guessA, setGuessA] = useState<string>('1');
  const [guessB, setGuessB] = useState<string>('2');
  const [tolerance, setTolerance] = useState<number>(0.0001);
  const [maxIterations, setMaxIterations] = useState<number>(50);
  const [error, setError] = useState<string | null>(null);

  // Example templates
  const loadExample = (expr: string, meth: 'bisection' | 'newton' | 'secant', a: string, b: string) => {
    setExpression(expr);
    setMethod(meth);
    setGuessA(a);
    setGuessB(b);
    setError(null);
  };

  // Perform root finding
  const solverResult = useMemo(() => {
    setError(null);
    if (!expression.trim()) return null;

    try {
      // Construct mathematical evaluation function
      const f = (xVal: number) => {
        return math.evaluate(expression, { x: xVal });
      };

      const tol = parseFloat(tolerance.toString()) || 0.0001;
      const maxIter = parseInt(maxIterations.toString()) || 50;

      if (method === 'bisection') {
        const a = parseFloat(guessA);
        const b = parseFloat(guessB);
        if (isNaN(a) || isNaN(b)) {
          setError('Bisection requires valid numeric bounds for a and b.');
          return null;
        }
        return solveBisection(f, a, b, tol, maxIter);
      } else if (method === 'newton') {
        const x0 = parseFloat(guessA);
        if (isNaN(x0)) {
          setError('Newton-Raphson requires a valid initial guess x0.');
          return null;
        }
        return solveNewtonRaphson(f, x0, tol, maxIter);
      } else {
        const x0 = parseFloat(guessA);
        const x1 = parseFloat(guessB);
        if (isNaN(x0) || isNaN(x1)) {
          setError('Secant method requires two initial guesses, x0 and x1.');
          return null;
        }
        return solveSecant(f, x0, x1, tol, maxIter);
      }
    } catch (e: any) {
      setError(e.message || 'Invalid mathematical expression or parsing error.');
      return null;
    }
  }, [expression, method, guessA, guessB, tolerance, maxIterations]);

  // Export Iterations Table to CSV
  const handleExportCSV = () => {
    if (!solverResult || solverResult.iterations.length === 0) return;

    let csvContent = "Iteration,x,f(x),Error\n";
    solverResult.iterations.forEach((iter) => {
      csvContent += `${iter.iteration},${iter.x},${iter.fx},${iter.error}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `root_iterations_${method}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const svgWidth = 400;
  const svgHeight = 200;
  const padding = 25;
  const originY = svgHeight / 2;

  const graphGraphics = useMemo(() => {
    if (error || !expression.trim()) return null;

    const points: string[] = [];
    let minX = -4, maxX = 4;
    // Adapt limits around root if found
    if (solverResult && solverResult.root !== null) {
      minX = solverResult.root - 3;
      maxX = solverResult.root + 3;
    }

    const scaleX = (svgWidth - 2 * padding) / (maxX - minX);

    const getX = (val: number) => padding + (val - minX) * scaleX;
    const getY = (val: number) => originY - val * 10; // Y scale

    for (let xVal = minX; xVal <= maxX; xVal += 0.1) {
      try {
        const yVal = math.evaluate(expression, { x: xVal });
        if (typeof yVal === 'number' && !isNaN(yVal) && isFinite(yVal)) {
          const px = getX(xVal);
          const py = getY(yVal);
          if (py >= padding && py <= svgHeight - padding) {
            points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
          }
        }
      } catch {}
    }

    return {
      path: points.length > 1 ? `M ${points.join(' L ')}` : '',
      rootX: solverResult && solverResult.root !== null ? getX(solverResult.root) : null,
      rootY: getY(0),
      minX,
      maxX
    };
  }, [expression, solverResult, error]);

  const handleReset = () => {
    setExpression('x^3 - x - 2');
    setMethod('bisection');
    setGuessA('1');
    setGuessB('2');
    setTolerance(0.0001);
    setMaxIterations(50);
    setError(null);
  };

  return (
    <>
      <SEO
        title="Newton-Raphson and Bisection Method Calculator"
        description="Find roots of equations numerically using Bisection, Newton-Raphson, and Secant methods, with graphical highlight and iterations tables."
        keywords={['root finder calculator', 'bisection method solver', 'newton raphson online', 'secant iterations table']}
      />

      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 mb-6">
        <a
          href="/math-studio"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Math Studio</span>
        </a>
        <div className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold flex items-center gap-1.5">
          <a href="/" className="hover:text-indigo-500 transition-colors">Home</a>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <a href="/math-studio" className="hover:text-indigo-500 transition-colors">Math Studio</a>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">Numerical Root Finder</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Newton-Raphson and Bisection Method Calculator
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
              Solve roots for algebraic and transcendental equations numerically using standard mathematical iteration methods.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  Function expression f(x) = 0
                </label>
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="e.g. x^3 - x - 2"
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                  Numerical Approximation Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-850 rounded-lg p-2.5 focus:outline-none text-zinc-900 dark:text-zinc-100"
                >
                  <option value="bisection">Bisection Method</option>
                  <option value="newton">Newton-Raphson Method</option>
                  <option value="secant">Secant Method</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                    {method === 'newton' ? 'Initial Guess x0' : 'Bound a / Guess x0'}
                  </label>
                  <input
                    type="number"
                    value={guessA}
                    onChange={(e) => setGuessA(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono"
                  />
                </div>
                {method !== 'newton' && (
                  <div>
                    <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                      Bound b / Guess x1
                    </label>
                    <input
                      type="number"
                      value={guessB}
                      onChange={(e) => setGuessB(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                    Tolerance
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    value={tolerance}
                    onChange={(e) => setTolerance(parseFloat(e.target.value) || 0.0001)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                    Max Iterations
                  </label>
                  <input
                    type="number"
                    value={maxIterations}
                    onChange={(e) => setMaxIterations(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Examples */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  Try Examples
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadExample('x^3 - x - 2', 'bisection', '1', '2')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    Bisection: x³ - x - 2
                  </button>
                  <button
                    onClick={() => loadExample('cos(x) - x', 'newton', '0.5', '')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    Newton: cos(x) - x
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-xs font-bold text-zinc-655 dark:text-zinc-400 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-455 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Results Panel */}
            {solverResult && !error && (
              <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-850 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Root Finding Convergence Result
                  </h4>
                  {solverResult.converged && (
                    <button
                      onClick={handleExportCSV}
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export CSV</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] text-zinc-450 block uppercase tracking-wider">
                    Calculated Root Value
                  </div>
                  <div className="font-mono text-2xl font-black text-emerald-400">
                    {solverResult.root !== null ? solverResult.root.toFixed(6) : 'Did Not Converge'}
                  </div>
                  <span className={`text-[10px] border rounded px-2.5 py-0.5 font-semibold inline-block ${
                    solverResult.converged 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {solverResult.converged ? 'Converged Successfully' : 'Convergence Failed'}
                  </span>
                  <p className="text-[11px] text-zinc-300">
                    {solverResult.message}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Plot and Iterations Table */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual graph */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 flex justify-between items-center">
                <span>Curve Plot & Highlighted Root Intersection</span>
                {solverResult && solverResult.root !== null && (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500">
                    ● Root x ≈ {solverResult.root.toFixed(4)}
                  </span>
                )}
              </h4>
              <div className="flex items-center justify-center">
                <svg
                  width="100%"
                  height={svgHeight}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="border border-zinc-100 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
                >
                  {/* Grid Axis */}
                  <line x1={0} y1={originY} x2={svgWidth} y2={originY} stroke="currentColor" className="text-zinc-350 dark:text-zinc-700" strokeWidth="1.2" />
                  
                  {/* Curve path */}
                  {graphGraphics && graphGraphics.path && (
                    <path
                      d={graphGraphics.path}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Root marker */}
                  {graphGraphics && graphGraphics.rootX !== null && (
                    <circle
                      cx={graphGraphics.rootX}
                      cy={graphGraphics.rootY}
                      r="6.5"
                      className="fill-emerald-500 stroke-white dark:stroke-zinc-900 animate-pulse"
                      strokeWidth="2"
                    />
                  )}
                </svg>
              </div>
            </div>

            {/* Iterations Log Table */}
            {solverResult && solverResult.iterations.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/30">
                  <h4 className="text-xs font-bold text-zinc-650 dark:text-zinc-350 uppercase tracking-wider">
                    Iteration Convergence Trace Log
                  </h4>
                </div>
                <div className="max-h-72 overflow-y-auto text-xs font-mono">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        <th className="px-4 py-2">Iter</th>
                        <th className="px-4 py-2">x</th>
                        <th className="px-4 py-2">f(x)</th>
                        <th className="px-4 py-2 text-right">Error (delta)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
                      {solverResult.iterations.map((row) => (
                        <tr key={row.iteration} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                          <td className="px-4 py-2 text-zinc-450">{row.iteration}</td>
                          <td className="px-4 py-2 font-bold">{row.x.toFixed(6)}</td>
                          <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{row.fx.toFixed(6)}</td>
                          <td className="px-4 py-2 text-right text-indigo-500">{row.error.toFixed(6)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
