import { useState, useMemo } from 'react';
import { ArrowLeft, RotateCcw, Grid, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';
import {
  integrateTrapezoidal,
  integrateSimpson13,
  integrateSimpson38
} from '../utils/mathAdvanced';
import SEO from '../components/SEO';

export default function NumericalIntegrationCalculator() {
  const [expression, setExpression] = useState<string>('x^3');
  const [lowerLimit, setLowerLimit] = useState<string>('0');
  const [upperLimit, setUpperLimit] = useState<string>('2');
  const [intervals, setIntervals] = useState<number>(6);
  const [method, setMethod] = useState<'trapezoidal' | 'simpson13' | 'simpson38'>('simpson13');
  const [error, setError] = useState<string | null>(null);

  // Example helper
  const loadExample = (expr: string, lower: string, upper: string, n: number, meth: 'trapezoidal' | 'simpson13' | 'simpson38') => {
    setExpression(expr);
    setLowerLimit(lower);
    setUpperLimit(upper);
    setIntervals(n);
    setMethod(meth);
    setError(null);
  };

  // Perform Numerical integration
  const integrationResult = useMemo(() => {
    setError(null);
    if (!expression.trim()) return null;

    const a = parseFloat(lowerLimit);
    const b = parseFloat(upperLimit);
    const n = parseInt(intervals.toString()) || 6;

    if (isNaN(a) || isNaN(b)) {
      setError('Please enter valid numerical bounds for a and b.');
      return null;
    }

    if (n <= 0) {
      setError('Number of intervals must be a positive integer.');
      return null;
    }

    // Validation for Simpson's methods
    if (method === 'simpson13' && n % 2 !== 0) {
      setError('Simpson\'s 1/3 Rule requires an even number of intervals.');
      return null;
    }
    if (method === 'simpson38' && n % 3 !== 0) {
      setError('Simpson\'s 3/8 Rule requires intervals to be a multiple of 3.');
      return null;
    }

    try {
      const f = (xVal: number) => {
        return math.evaluate(expression, { x: xVal });
      };

      let result = null;
      if (method === 'trapezoidal') {
        result = integrateTrapezoidal(f, a, b, n);
      } else if (method === 'simpson13') {
        result = integrateSimpson13(f, a, b, n);
      } else {
        result = integrateSimpson38(f, a, b, n);
      }

      // Compute exact value symbolically for comparison
      let exactValue: number | null = null;
      let percentError: number | null = null;
      try {
        const antideriv = nerdamer.integrate(expression, 'x').toString();
        const valB = math.evaluate(antideriv, { x: b });
        const valA = math.evaluate(antideriv, { x: a });
        exactValue = valB - valA;
        if (exactValue !== 0) {
          percentError = (Math.abs(result.value - exactValue) / Math.abs(exactValue)) * 100;
        }
      } catch {
        // Exact method fails
      }

      return {
        approxValue: result.value,
        iterations: result.iterations,
        exactValue,
        percentError,
        message: result.message
      };
    } catch (e: any) {
      setError(e.message || 'Invalid function expression or integration limits.');
      return null;
    }
  }, [expression, lowerLimit, upperLimit, intervals, method]);

  // Export intervals table to CSV
  const handleExportCSV = () => {
    if (!integrationResult || integrationResult.iterations.length === 0) return;

    let csvContent = "Interval,x,f(x),Weight,Term\n";
    integrationResult.iterations.forEach((row) => {
      csvContent += `${row.interval},${row.x},${row.fx},${row.weight},${row.term}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `numerical_integration_intervals_${method}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG coordinates details
  const svgWidth = 400;
  const svgHeight = 200;
  const padding = 25;
  const originX = svgWidth / 2;
  const originY = svgHeight / 2;
  const scale = 25;

  const mapX = (x: number) => originX + x * scale;
  const mapY = (y: number) => originY - y * 10;

  const graphGraphics = useMemo(() => {
    if (error || !expression.trim()) return null;

    const points: string[] = [];
    const shadePoints: string[][] = [];

    const a = parseFloat(lowerLimit);
    const b = parseFloat(upperLimit);
    const n = parseInt(intervals.toString()) || 6;
    const h = (b - a) / n;

    // Evaluate whole range from x = -5 to +5
    for (let xVal = -6; xVal <= 6; xVal += 0.1) {
      const px = mapX(xVal);
      if (px < padding || px > svgWidth - padding) continue;

      try {
        const yVal = math.evaluate(expression, { x: xVal });
        if (typeof yVal === 'number' && !isNaN(yVal) && isFinite(yVal)) {
          const py = mapY(yVal);
          if (py >= padding && py <= svgHeight - padding) {
            points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
          }
        }
      } catch {}
    }

    // Build shaded interval panels representing numerical columns
    if (!isNaN(a) && !isNaN(b) && n > 0) {
      for (let i = 0; i < n; i++) {
        const xl = a + i * h;
        const xr = a + (i + 1) * h;
        try {
          const yl = math.evaluate(expression, { x: xl });
          const yr = math.evaluate(expression, { x: xr });
          const pxL = mapX(xl);
          const pxR = mapX(xr);
          const pyL = mapY(yl);
          const pyR = mapY(yr);
          const zeroY = mapY(0);

          shadePoints.push([
            `${pxL.toFixed(1)},${zeroY.toFixed(1)}`,
            `${pxL.toFixed(1)},${pyL.toFixed(1)}`,
            `${pxR.toFixed(1)},${pyR.toFixed(1)}`,
            `${pxR.toFixed(1)},${zeroY.toFixed(1)}`
          ]);
        } catch {}
      }
    }

    return {
      linePath: points.length > 1 ? `M ${points.join(' L ')}` : '',
      shadePanels: shadePoints
    };
  }, [expression, lowerLimit, upperLimit, intervals, error]);

  const handleReset = () => {
    setExpression('x^3');
    setLowerLimit('0');
    setUpperLimit('2');
    setIntervals(6);
    setMethod('simpson13');
    setError(null);
  };

  return (
    <>
      <SEO
        title="Numerical Integration Calculator | Simpson's & Trapezoidal Rules"
        description="Free online numerical integration calculator. Compares Simpson's 1/3, Simpson's 3/8, and Trapezoidal rules with error details."
        keywords={['numerical integration', 'simpsons rule', 'trapezoidal rule', 'definite integral approximation']}
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
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">Numerical Integration</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Grid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Numerical Integration Calculator
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
              Estimate definite integral areas under curves using Trapezoidal and Simpson sub-interval rules.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  Function Expression f(x)
                </label>
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="e.g. x^3"
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-455 uppercase tracking-wider mb-1">
                    Lower a
                  </label>
                  <input
                    type="number"
                    value={lowerLimit}
                    onChange={(e) => setLowerLimit(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-center font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-455 uppercase tracking-wider mb-1">
                    Upper b
                  </label>
                  <input
                    type="number"
                    value={upperLimit}
                    onChange={(e) => setUpperLimit(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-center font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-455 uppercase tracking-wider mb-1">
                    Intervals (n)
                  </label>
                  <input
                    type="number"
                    value={intervals}
                    onChange={(e) => setIntervals(parseInt(e.target.value) || 2)}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-center font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                  Numerical Rule Selector
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-850 rounded-lg p-2.5 focus:outline-none text-zinc-900 dark:text-zinc-100"
                >
                  <option value="trapezoidal">Trapezoidal Rule</option>
                  <option value="simpson13">Simpson's 1/3 Rule (Even n)</option>
                  <option value="simpson38">Simpson's 3/8 Rule (n multiple of 3)</option>
                </select>
              </div>

              {/* Examples */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  Try Examples
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadExample('x^3', '0', '2', 6, 'simpson13')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    x³ from [0, 2] (n=6)
                  </button>
                  <button
                    onClick={() => loadExample('1 / (1 + x^2)', '0', '1', 4, 'trapezoidal')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    1/(1+x²) [0, 1]
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
            {integrationResult && !error && (
              <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-850 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Numerical Integral Result
                  </h4>
                  <button
                    onClick={handleExportCSV}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] text-zinc-450 block uppercase tracking-wider">
                    Approximated Area Value
                  </div>
                  <div className="font-mono text-2xl font-black text-emerald-400 animate-pulse">
                    {integrationResult.approxValue.toFixed(6)}
                  </div>
                  {integrationResult.exactValue !== null && (
                    <div className="pt-2 border-t border-zinc-850 text-xs space-y-1">
                      <div className="flex justify-between text-zinc-400">
                        <span>Exact Symbolic Value:</span>
                        <span className="font-mono text-zinc-200">{integrationResult.exactValue.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Relative Error %:</span>
                        <span className="font-mono text-rose-400">
                          {integrationResult.percentError !== null 
                            ? `${integrationResult.percentError.toFixed(4)}%` 
                            : '0.0000%'}
                        </span>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-400">
                    {integrationResult.message}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Graphs and Intervals table */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual plot */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
                Sub-intervals Area Decomposition
              </h4>
              <div className="flex items-center justify-center">
                <svg
                  width="100%"
                  height={svgHeight}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="border border-zinc-100 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
                >
                  {/* Axis Zero Line */}
                  <line x1={0} y1={originY} x2={svgWidth} y2={originY} stroke="currentColor" className="text-zinc-350 dark:text-zinc-700" strokeWidth="1.2" />

                  {/* Shaded Interval Panels */}
                  {graphGraphics && graphGraphics.shadePanels.map((pts, idx) => (
                    <polygon
                      key={`panel-${idx}`}
                      points={pts.join(' ')}
                      className="fill-indigo-500/10 stroke-indigo-500/40"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Function Curve */}
                  {graphGraphics && graphGraphics.linePath && (
                    <path
                      d={graphGraphics.linePath}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2.5"
                    />
                  )}
                </svg>
              </div>
            </div>

            {/* Intervals Table */}
            {integrationResult && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50/30">
                  <h4 className="text-xs font-bold text-zinc-650 dark:text-zinc-350 uppercase tracking-wider">
                    Sub-interval Weights Table
                  </h4>
                </div>
                <div className="max-h-72 overflow-y-auto text-xs font-mono">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        <th className="px-4 py-2">Index (i)</th>
                        <th className="px-4 py-2">x_i</th>
                        <th className="px-4 py-2">f(x_i)</th>
                        <th className="px-4 py-2">Weight</th>
                        <th className="px-4 py-2 text-right">Weighted Term</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
                      {integrationResult.iterations.map((row) => (
                        <tr key={row.interval} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                          <td className="px-4 py-2 text-zinc-450">{row.interval}</td>
                          <td className="px-4 py-2">{row.x.toFixed(4)}</td>
                          <td className="px-4 py-2">{row.fx.toFixed(6)}</td>
                          <td className="px-4 py-2 text-zinc-600 dark:text-zinc-405">{row.weight}</td>
                          <td className="px-4 py-2 text-right text-indigo-500 font-bold">{row.term.toFixed(6)}</td>
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
