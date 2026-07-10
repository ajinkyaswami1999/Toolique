import { useState, useMemo } from 'react';
import { ArrowLeft, Copy, RotateCcw, TrendingUp } from 'lucide-react';
import * as math from 'mathjs';
import SEO from '../components/SEO';

interface LimitRow {
  h: number;
  xLeft: number;
  yLeft: number | string;
  xRight: number;
  yRight: number | string;
}

export default function LimitCalculator() {
  const [expression, setExpression] = useState<string>('sin(x) / x');
  const [variable, setVariable] = useState<string>('x');
  const [limitPoint, setLimitPoint] = useState<string>('0');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Example inputs
  const loadExample = (expr: string, pt: string) => {
    setExpression(expr);
    setLimitPoint(pt);
    setError(null);
  };

  // Perform Limit Approximation
  const limitAnalysis = useMemo(() => {
    setError(null);
    if (!expression.trim()) return null;

    const rows: LimitRow[] = [];
    const hSteps = [0.1, 0.01, 0.001, 0.0001, 0.00001];

    const isInf = limitPoint.trim().toLowerCase() === 'inf' || limitPoint.trim().toLowerCase() === 'infinity';
    const isNegInf = limitPoint.trim().toLowerCase() === '-inf' || limitPoint.trim().toLowerCase() === '-infinity';

    let leftLimitVal: number | string = 'Undefined';
    let rightLimitVal: number | string = 'Undefined';
    let overallLimitVal: number | string = 'Undefined';
    let existsMessage = '';

    const safeEval = (expr: string, xVal: number) => {
      try {
        const val = math.evaluate(expr, { [variable]: xVal });
        if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
          return val;
        }
        return 'Undefined';
      } catch {
        return 'Undefined';
      }
    };

    if (isInf) {
      // Evaluate for large positive values: 10, 100, 1000, 10000, 100000
      const steps = [10, 100, 1000, 10000, 100000];
      const vals = steps.map(x => safeEval(expression, x));
      
      const lastVal = vals[vals.length - 1];
      overallLimitVal = lastVal;
      leftLimitVal = 'N/A';
      rightLimitVal = 'N/A';
      existsMessage = typeof lastVal === 'number' 
        ? `Approaches ${lastVal.toFixed(6)} as x ➔ ➔ +∞` 
        : `Diverges or is undefined.`;

      // Build mock rows for the table
      steps.forEach((x, idx) => {
        rows.push({
          h: x,
          xLeft: x,
          yLeft: vals[idx],
          xRight: 0,
          yRight: 'N/A'
        });
      });

    } else if (isNegInf) {
      // Evaluate for large negative values
      const steps = [-10, -100, -1000, -10000, -100000];
      const vals = steps.map(x => safeEval(expression, x));
      
      const lastVal = vals[vals.length - 1];
      overallLimitVal = lastVal;
      leftLimitVal = 'N/A';
      rightLimitVal = 'N/A';
      existsMessage = typeof lastVal === 'number' 
        ? `Approaches ${lastVal.toFixed(6)} as x ➔ -∞` 
        : `Diverges or is undefined.`;

      steps.forEach((x, idx) => {
        rows.push({
          h: x,
          xLeft: x,
          yLeft: vals[idx],
          xRight: 0,
          yRight: 'N/A'
        });
      });

    } else {
      const c = parseFloat(limitPoint);
      if (isNaN(c)) {
        setError('Please enter a valid numeric limit point or "inf" / "-inf".');
        return null;
      }

      hSteps.forEach((h) => {
        const xL = c - h;
        const xR = c + h;
        rows.push({
          h,
          xLeft: xL,
          yLeft: safeEval(expression, xL),
          xRight: xR,
          yRight: safeEval(expression, xR)
        });
      });

      // Analyze convergence from last rows
      const lastRow = rows[rows.length - 1];
      leftLimitVal = lastRow.yLeft;
      rightLimitVal = lastRow.yRight;

      if (typeof leftLimitVal === 'number' && typeof rightLimitVal === 'number') {
        const diff = Math.abs(leftLimitVal - rightLimitVal);
        if (diff < 1e-4) {
          overallLimitVal = (leftLimitVal + rightLimitVal) / 2;
          existsMessage = `Limit exists. Both sides converge to ≈ ${overallLimitVal.toFixed(6)}`;
        } else {
          overallLimitVal = 'Does Not Exist';
          existsMessage = `Limit DNE. Left-hand converges to ${leftLimitVal.toFixed(4)}, right-hand converges to ${rightLimitVal.toFixed(4)}.`;
        }
      } else {
        // Divergence checking
        if (leftLimitVal === 'Undefined' || rightLimitVal === 'Undefined') {
          existsMessage = `Undefined or diverges to infinity.`;
        }
      }
    }

    return {
      rows,
      leftLimitVal,
      rightLimitVal,
      overallLimitVal,
      existsMessage
    };
  }, [expression, variable, limitPoint]);

  const svgWidth = 400;
  const svgHeight = 200;
  const padding = 20;
  const originY = svgHeight / 2;

  const graphPath = useMemo(() => {
    if (error || !expression.trim()) return null;

    const points: string[] = [];
    const isInf = limitPoint.trim().toLowerCase() === 'inf' || limitPoint.trim().toLowerCase() === 'infinity';
    const isNegInf = limitPoint.trim().toLowerCase() === '-inf' || limitPoint.trim().toLowerCase() === '-infinity';

    let minX = -5, maxX = 5;
    if (!isInf && !isNegInf) {
      const c = parseFloat(limitPoint);
      if (!isNaN(c)) {
        minX = c - 5;
        maxX = c + 5;
      }
    }

    const scaleX = (svgWidth - 2 * padding) / (maxX - minX);

    const getX = (xVal: number) => padding + (xVal - minX) * scaleX;
    const getY = (yVal: number) => originY - yVal * 15; // fixed scale for Y

    for (let xVal = minX; xVal <= maxX; xVal += 0.05) {
      try {
        const yVal = math.evaluate(expression, { [variable]: xVal });
        if (typeof yVal === 'number' && !isNaN(yVal) && isFinite(yVal)) {
          const px = getX(xVal);
          const py = getY(yVal);
          if (py >= padding && py <= svgHeight - padding) {
            points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
          }
        }
      } catch {}
    }

    return points.length > 1 ? `M ${points.join(' L ')}` : '';
  }, [expression, variable, limitPoint, error]);

  const handleCopy = () => {
    if (limitAnalysis) {
      const res = typeof limitAnalysis.overallLimitVal === 'number' 
        ? limitAnalysis.overallLimitVal.toFixed(6) 
        : limitAnalysis.overallLimitVal;
      navigator.clipboard.writeText(`${res}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setExpression('sin(x) / x');
    setVariable('x');
    setLimitPoint('0');
    setError(null);
  };

  return (
    <>
      <SEO
        title="Limit Calculator Online | Left, Right, & Two-Sided Limit Solver"
        description="Free online limit calculator. Evaluate limits from the left, right, or two-sided, with numerical approximation convergence tables."
        keywords={['limit calculator', 'two sided limit', 'limit online', 'calculus limit solver']}
      />

      {/* Breadcrumbs & Navigation */}
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
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">Limit Calculator</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Limit Calculator Online
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
              Analyze left, right, and double limits numerically with step-by-step convergence iterations tables.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                  Function Expression f({variable})
                </label>
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="e.g. sin(x)/x"
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                    Variable
                  </label>
                  <input
                    type="text"
                    value={variable}
                    onChange={(e) => setVariable(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-center font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                    Approach Point (c)
                  </label>
                  <input
                    type="text"
                    value={limitPoint}
                    onChange={(e) => setLimitPoint(e.target.value)}
                    placeholder="0 or inf"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-center font-mono text-xs"
                  />
                </div>
              </div>

              {/* Examples */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  Quick Examples
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadExample('sin(x) / x', '0')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    sin(x)/x as x➔0
                  </button>
                  <button
                    onClick={() => loadExample('(x^2 - 1) / (x - 1)', '1')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    (x²-1)/(x-1) as x➔1
                  </button>
                  <button
                    onClick={() => loadExample('(1 + 1/x)^x', 'inf')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    (1+1/x)ˣ as x➔∞
                  </button>
                </div>
              </div>

              {/* Reset */}
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

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-455 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Results Panel */}
            {limitAnalysis && !error && (
              <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-850 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Limit Analysis Output
                  </h4>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Value'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] text-zinc-450 block uppercase tracking-wider">
                    Overall Two-Sided Limit
                  </div>
                  <div className="font-mono text-2xl font-black text-emerald-400">
                    {typeof limitAnalysis.overallLimitVal === 'number' 
                      ? limitAnalysis.overallLimitVal.toFixed(6) 
                      : limitAnalysis.overallLimitVal}
                  </div>
                  <p className="text-[11px] text-zinc-300 font-medium">
                    {limitAnalysis.existsMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Convergence Table & Graph */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual graph */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
                Local Graph Zoom Preview
              </h4>
              <div className="flex items-center justify-center">
                <svg
                  width="100%"
                  height={svgHeight}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="border border-zinc-100 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
                >
                  {/* Grid Lines */}
                  {Array.from({ length: 17 }).map((_, i) => {
                    const lineX = padding + (i * (svgWidth - 2 * padding)) / 16;
                    return (
                      <line
                        key={`x-${i}`}
                        x1={lineX}
                        y1={0}
                        x2={lineX}
                        y2={svgHeight}
                        stroke="currentColor"
                        className="text-zinc-200 dark:text-zinc-800/40"
                        strokeWidth={i === 8 ? 1.5 : 0.5}
                      />
                    );
                  })}
                  {Array.from({ length: 9 }).map((_, i) => {
                    const lineY = padding + (i * (svgHeight - 2 * padding)) / 8;
                    return (
                      <line
                        key={`y-${i}`}
                        x1={0}
                        y1={lineY}
                        x2={svgWidth}
                        y2={lineY}
                        stroke="currentColor"
                        className="text-zinc-200 dark:text-zinc-800/40"
                        strokeWidth={i === 4 ? 1.5 : 0.5}
                      />
                    );
                  })}

                  {/* Draw curve path */}
                  {graphPath && (
                    <path
                      d={graphPath}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2.5"
                    />
                  )}
                </svg>
              </div>
            </div>

            {/* Convergence Table */}
            {limitAnalysis && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30">
                  <h4 className="text-xs font-bold text-zinc-650 dark:text-zinc-350 uppercase tracking-wider">
                    Numerical Convergence Table
                  </h4>
                </div>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left font-mono">
                    <thead>
                      <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        <th className="px-4 py-2">Offset (h)</th>
                        <th className="px-4 py-2">x (Left)</th>
                        <th className="px-4 py-2">f(x) (Left)</th>
                        <th className="px-4 py-2">x (Right)</th>
                        <th className="px-4 py-2">f(x) (Right)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
                      {limitAnalysis.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                          <td className="px-4 py-2 text-zinc-450">{row.h.toString()}</td>
                          <td className="px-4 py-2">{row.xLeft.toFixed(5)}</td>
                          <td className="px-4 py-2 font-bold text-indigo-500">
                            {typeof row.yLeft === 'number' ? row.yLeft.toFixed(6) : row.yLeft}
                          </td>
                          <td className="px-4 py-2">{row.xRight.toFixed(5)}</td>
                          <td className="px-4 py-2 font-bold text-purple-500">
                            {typeof row.yRight === 'number' ? row.yRight.toFixed(6) : row.yRight}
                          </td>
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
