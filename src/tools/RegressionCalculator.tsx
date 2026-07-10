import { useState, useMemo } from 'react';
import { ArrowLeft, RotateCcw, Download, Copy, LineChart } from 'lucide-react';
import * as math from 'mathjs';
import SEO from '../components/SEO';
import { fitPolynomial, fitExponential, type RegressionModelResult } from '../utils/mathAdvanced';

export default function RegressionCalculator() {
  const [rawX, setRawX] = useState<string>('1, 2, 3, 4, 5, 6');
  const [rawY, setRawY] = useState<string>('2.1, 3.9, 6.2, 8.0, 10.5, 12.1');
  const [modelType, setModelType] = useState<'linear' | 'quadratic' | 'cubic' | 'exponential'>('linear');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Examples helper
  const loadExample = (type: 'linear' | 'quadratic' | 'exponential') => {
    if (type === 'linear') {
      setRawX('1, 2, 3, 4, 5, 6');
      setRawY('2.1, 3.9, 6.2, 8.0, 10.5, 12.1');
      setModelType('linear');
    } else if (type === 'quadratic') {
      setRawX('-3, -2, -1, 0, 1, 2, 3');
      setRawY('9.2, 4.1, 1.2, 0.1, 0.9, 3.8, 9.1');
      setModelType('quadratic');
    } else {
      setRawX('1, 2, 3, 4, 5');
      setRawY('2.7, 7.3, 20.1, 54.2, 148.0');
      setModelType('exponential');
    }
    setError(null);
  };

  const handleReset = () => {
    setRawX('1, 2, 3, 4, 5, 6');
    setRawY('2.1, 3.9, 6.2, 8.0, 10.5, 12.1');
    setModelType('linear');
    setError(null);
  };

  // Perform regression fitting
  const calculation = useMemo<RegressionModelResult | null>(() => {
    setError(null);
    try {
      const xs = rawX.split(/[\s,]+/).map(v => parseFloat(v)).filter(v => !isNaN(v));
      const ys = rawY.split(/[\s,]+/).map(v => parseFloat(v)).filter(v => !isNaN(v));

      if (xs.length < 3 || ys.length < 3) {
        throw new Error('Please enter at least 3 valid coordinates for both X and Y arrays.');
      }
      if (xs.length !== ys.length) {
        throw new Error(`Array length mismatch. X has ${xs.length} values and Y has ${ys.length} values.`);
      }

      if (modelType === 'linear') {
        return fitPolynomial(xs, ys, 1);
      } else if (modelType === 'quadratic') {
        return fitPolynomial(xs, ys, 2);
      } else if (modelType === 'cubic') {
        return fitPolynomial(xs, ys, 3);
      } else {
        // Exponential fitting: y = a * e^(bx), requires positive y values
        if (ys.some(y => y <= 0)) {
          throw new Error('Exponential regression requires all Y values to be strictly positive (> 0).');
        }
        return fitExponential(xs, ys);
      }
    } catch (e: any) {
      setError(e.message || 'Regression mathematical calculation failed.');
      return null;
    }
  }, [rawX, rawY, modelType]);

  const handleCopy = () => {
    if (calculation) {
      navigator.clipboard.writeText(calculation.equation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Export residuals
  const handleExportCSV = () => {
    if (!calculation) return;
    const headers = ['x', 'y_observed', 'y_predicted', 'residual'];
    const rows = calculation.points.map(p => [
      p.x.toFixed(4),
      p.y.toFixed(4),
      p.predicted.toFixed(4),
      p.residual.toFixed(4)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `regression_${modelType}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Scaling and Path Plotting
  const svgWidth = 400;
  const svgHeight = 250;
  const padding = 35;

  const graphData = useMemo(() => {
    if (!calculation || calculation.points.length === 0) return null;

    const xs = calculation.points.map(p => p.x);
    const ys = calculation.points.map(p => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys, ...calculation.points.map(p => p.predicted));
    const maxY = Math.max(...ys, ...calculation.points.map(p => p.predicted));

    const xRange = Math.max(maxX - minX, 0.1);
    const yRange = Math.max(maxY - minY, 0.1);

    const scaleMinX = minX - xRange * 0.15;
    const scaleMaxX = maxX + xRange * 0.15;
    const scaleMinY = minY - yRange * 0.15;
    const scaleMaxY = maxY + yRange * 0.15;

    // Helper functions inside useMemo
    const getX = (val: number) => {
      const pct = (val - scaleMinX) / (scaleMaxX - scaleMinX);
      return padding + pct * (svgWidth - 2 * padding);
    };

    const getY = (val: number) => {
      const pct = (val - scaleMinY) / (scaleMaxY - scaleMinY);
      return svgHeight - padding - pct * (svgHeight - 2 * padding);
    };

    // Calculate curve points
    const curvePoints: string[] = [];
    const steps = 60;
    const stepSize = (scaleMaxX - scaleMinX) / steps;

    for (let i = 0; i <= steps; i++) {
      const curX = scaleMinX + i * stepSize;
      let curY = 0;

      // Extract model parameters to evaluate curY
      if (modelType === 'exponential') {
        // equation format: y = a * e^(b * x)
        // Let's parse coefficients from equation if possible, or recalculate.
        // To be safe and clean, we can fit a polynomial/exponential using a miniature dry run:
        try {
          const fit = fitExponential(xs, ys);
          // parse equation e.g. y = 2.100 * e^(1.200x)
          const match = fit.equation.match(/y = ([\d\.\-]+) \* e\^\(([\d\.\-]+)x\)/);
          if (match) {
            const aVal = parseFloat(match[1]);
            const bVal = parseFloat(match[2]);
            curY = aVal * Math.exp(bVal * curX);
          }
        } catch {}
      } else {
        // Polynomial
        try {
          const deg = modelType === 'linear' ? 1 : modelType === 'quadratic' ? 2 : 3;
          const fit = fitPolynomial(xs, ys, deg);
          // Evaluate regression equation. We can evaluate it numerically using math.evaluate
          // e.g. equation is: y = 2.30x^2 + 1.20x + 0.50
          const expr = fit.equation.replace('y =', '').replace(/x\^/g, '*x^').replace(/x/g, '*x').replace(/\+ -/g, '-').replace(/\*+/g, '*');
          curY = math.evaluate(expr, { x: curX });
        } catch {}
      }

      if (!isNaN(curY)) {
        const sx = getX(curX);
        const sy = getY(curY);
        if (sy >= 0 && sy <= svgHeight) {
          curvePoints.push(`${sx.toFixed(1)},${sy.toFixed(1)}`);
        }
      }
    }

    return {
      points: calculation.points.map(p => ({
        cx: getX(p.x),
        cy: getY(p.y),
        predCy: getY(p.predicted),
        label: `(${p.x}, ${p.y})`
      })),
      curvePath: curvePoints.length > 1 ? `M ${curvePoints.join(' L ')}` : '',
      minX: scaleMinX,
      maxX: scaleMaxX,
      minY: scaleMinY,
      maxY: scaleMaxY
    };
  }, [calculation, modelType]);

  const mapXCoordinate = (xVal: number) => {
    if (!graphData) return 0;
    const pct = (xVal - graphData.minX) / (graphData.maxX - graphData.minX);
    return padding + pct * (svgWidth - 2 * padding);
  };

  const mapYCoordinate = (yVal: number) => {
    if (!graphData) return 0;
    const pct = (yVal - graphData.minY) / (graphData.maxY - graphData.minY);
    return svgHeight - padding - pct * (svgHeight - 2 * padding);
  };

  const gridTicks = useMemo(() => {
    if (!graphData) return { ticksX: [], ticksY: [] };
    const ticksX: number[] = [];
    const ticksY: number[] = [];
    const steps = 4;

    for (let i = 0; i <= steps; i++) {
      ticksX.push(graphData.minX + (i / steps) * (graphData.maxX - graphData.minX));
      ticksY.push(graphData.minY + (i / steps) * (graphData.maxY - graphData.minY));
    }

    return { ticksX, ticksY };
  }, [graphData]);

  return (
    <>
      <SEO
        title="Least Squares Regression Calculator | Curve Fitter"
        description="Calculate linear, polynomial, and exponential regression equations with R-squared indicators. Plots scattered data points with fit curves."
        keywords={['regression calculator', 'least squares regression', 'polynomial regression', 'curve fitting calculator', 'correlation coefficient']}
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
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">Regression Calculator</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Regression & Curve Fitter
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
              Fit linear, polynomial, and exponential regression equations to observational coordinates using least squares.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Inputs Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              {/* Regression Model Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  Regression Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { type: 'linear', label: 'Linear' },
                    { type: 'quadratic', label: 'Quadratic (Deg 2)' },
                    { type: 'cubic', label: 'Cubic (Deg 3)' },
                    { type: 'exponential', label: 'Exponential' }
                  ] as const).map((model) => (
                    <button
                      key={model.type}
                      onClick={() => setModelType(model.type)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                        modelType === model.type
                          ? 'border-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-450 hover:bg-zinc-50'
                      }`}
                    >
                      {model.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* X Array */}
              <div>
                <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                  X Values (independent, comma/space-separated)
                </label>
                <textarea
                  rows={2}
                  value={rawX}
                  onChange={(e) => setRawX(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-250 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              {/* Y Array */}
              <div>
                <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                  Y Values (dependent, comma/space-separated)
                </label>
                <textarea
                  rows={2}
                  value={rawY}
                  onChange={(e) => setRawY(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-250 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              {/* Examples */}
              <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">
                  Observational Data Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadExample('linear')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    Linear Scatter
                  </button>
                  <button
                    onClick={() => loadExample('quadratic')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    Quadratic parabola
                  </button>
                  <button
                    onClick={() => loadExample('exponential')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    Exponential growth
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
                {calculation && (
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export residuals CSV</span>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-455 text-xs font-semibold">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Graphs & Residual lists details */}
          <div className="lg:col-span-7 space-y-6">
            {graphData && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Scatter Plot & Regression Curve</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Curve Fit Overlay</span>
                </h4>
                <div className="flex items-center justify-center">
                  <svg
                    width="100%"
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="border border-zinc-100 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
                  >
                    {/* Grid Ticks */}
                    {gridTicks.ticksX.map((val, idx) => {
                      const sx = mapXCoordinate(val);
                      return (
                        <g key={`x-${idx}`}>
                          <line x1={sx} y1={0} x2={sx} y2={svgHeight - padding} stroke="currentColor" className="text-zinc-200 dark:text-zinc-850/40" strokeWidth={0.5} />
                          <text x={sx} y={svgHeight - 15} textAnchor="middle" className="text-[9px] fill-zinc-450 font-mono font-bold">{val.toFixed(1)}</text>
                        </g>
                      );
                    })}

                    {gridTicks.ticksY.map((val, idx) => {
                      const sy = mapYCoordinate(val);
                      return (
                        <g key={`y-${idx}`}>
                          <line x1={padding} y1={sy} x2={svgWidth} y2={sy} stroke="currentColor" className="text-zinc-200 dark:text-zinc-850/40" strokeWidth={0.5} />
                          <text x={10} y={sy + 3} textAnchor="start" className="text-[9px] fill-zinc-455 font-mono font-bold">{val.toFixed(1)}</text>
                        </g>
                      );
                    })}

                    {/* Curve Fit path */}
                    {graphData.curvePath && (
                      <path
                        d={graphData.curvePath}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth={2}
                      />
                    )}

                    {/* Scatter observations */}
                    {graphData.points.map((pt, idx) => (
                      <g key={`obs-${idx}`}>
                        {/* Dashed vertical residual line from point to curve prediction */}
                        <line
                          x1={pt.cx}
                          y1={pt.cy}
                          x2={pt.cx}
                          y2={pt.predCy}
                          stroke="#ef4444"
                          strokeWidth={1}
                          strokeDasharray="2,2"
                          className="opacity-70"
                        />
                        <circle
                          cx={pt.cx}
                          cy={pt.cy}
                          r={4}
                          className="fill-indigo-600 stroke-white dark:stroke-zinc-950"
                          strokeWidth={1}
                        />
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            )}

            {/* Regression Model Info */}
            {calculation && !error && (
              <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-800 space-y-4 font-mono text-sm">
                <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Model Equation Results
                  </h4>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Equation'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-zinc-450 block uppercase tracking-wider mb-1">
                      Regression Equation
                    </span>
                    <span className="text-sm font-black text-emerald-400 break-all">
                      {calculation.equation}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-450 block uppercase tracking-wider mb-1">
                      Coefficient of Determination (R²)
                    </span>
                    <span className="text-sm font-black text-indigo-400">
                      {calculation.r2.toFixed(5)}
                    </span>
                    <span className="text-[9px] text-zinc-500 block mt-1">
                      Correlation: {(calculation.r2 * 100).toFixed(2)}% variance explained.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Residuals Table details */}
            {calculation && !error && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider mb-3">
                  Prediction Residual Analysis Table
                </h4>
                <div className="max-h-60 overflow-y-auto border border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-800 text-[9px] text-zinc-400 font-bold uppercase">
                        <th className="py-2 px-3">X</th>
                        <th className="py-2 px-3">Observed Y</th>
                        <th className="py-2 px-3">Predicted Y</th>
                        <th className="py-2 px-3 text-red-500">Residual (error)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                      {calculation.points.map((p, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 text-zinc-700 dark:text-zinc-350">
                          <td className="py-2 px-3">{p.x}</td>
                          <td className="py-2 px-3">{p.y}</td>
                          <td className="py-2 px-3">{p.predicted.toFixed(4)}</td>
                          <td className={`py-2 px-3 font-bold ${p.residual >= 0 ? 'text-emerald-650' : 'text-rose-500'}`}>
                            {p.residual >= 0 ? '+' : ''}{p.residual.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Curve Fitting Theory */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-wider">
                Curve Fitting Theory
              </h4>
              <div className="text-xs text-zinc-650 dark:text-zinc-350 space-y-3 leading-relaxed">
                <p>
                  Regression utilizes the method of least squares to minimize the sum of squared differences (residuals) between observing data coordinates and predictions from the model curve.
                </p>
                <ul className="list-disc pl-4 space-y-1 font-mono text-[10px] text-zinc-550 dark:text-zinc-400">
                  <li>Linear: fits a straight line y = ax + b.</li>
                  <li>Polynomial: degree d uses Gaussian elimination to fit polynomials like parabolas or cubics.</li>
                  <li>Exponential: linearized via natural logs ln(y) = ln(a) + bx, fitting models of type y = a e^(bx).</li>
                  <li>R²: range 0 to 1. Closer to 1 indicates a superior fit.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
