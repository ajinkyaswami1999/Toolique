import { useState, useMemo } from 'react';
import { ArrowLeft, Copy, RotateCcw, Activity } from 'lucide-react';
import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';
import SEO from '../components/SEO';

export default function DerivativeCalculator() {
  const [expression, setExpression] = useState<string>('x^3 - 3*x^2 + 2*x');
  const [variable, setVariable] = useState<string>('x');
  const [order, setOrder] = useState<number>(1);
  const [evalX, setEvalX] = useState<string>('2');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form example helper
  const loadExample = (expr: string, variableName: string = 'x', ord: number = 1) => {
    setExpression(expr);
    setVariable(variableName);
    setOrder(ord);
    setError(null);
  };

  // Perform Differentiation
  const calculation = useMemo(() => {
    setError(null);
    if (!expression.trim()) return null;

    try {
      let resultExpr = expression;
      // Perform differentiation iteratively depending on the order
      for (let i = 0; i < order; i++) {
        resultExpr = nerdamer.diff(resultExpr, variable).toString();
      }

      // Simplify symbolic output
      const simplified = nerdamer(resultExpr).simplify().toString();

      // Numerical evaluation
      let evaluatedVal: number | null = null;
      const xNum = parseFloat(evalX);
      if (!isNaN(xNum)) {
        try {
          evaluatedVal = math.evaluate(simplified, { [variable]: xNum });
        } catch {
          // Fallback if numerical evaluation fails
        }
      }

      return {
        derivativeSymbolic: simplified,
        evaluatedVal
      };
    } catch (e: any) {
      setError(e.message || 'Invalid mathematical expression or differentiation rule.');
      return null;
    }
  }, [expression, variable, order, evalX]);

  // Graphing Details
  const svgWidth = 400;
  const svgHeight = 250;
  const padding = 30;
  const originX = svgWidth / 2;
  const originY = svgHeight / 2;
  const scale = 25; // 25 pixels = 1 coordinate unit

  const mapX = (x: number) => originX + x * scale;
  const mapY = (y: number) => originY - y * scale;

  const graphPaths = useMemo(() => {
    if (error || !calculation) return null;

    const originalPoints: string[] = [];
    const derivativePoints: string[] = [];

    // Evaluate both functions from x = -5 to +5 with step 0.1
    for (let xVal = -6; xVal <= 6; xVal += 0.1) {
      const px = mapX(xVal);
      if (px < padding || px > svgWidth - padding) continue;

      // Original
      try {
        const yValOrig = math.evaluate(expression, { [variable]: xVal });
        if (typeof yValOrig === 'number' && !isNaN(yValOrig)) {
          const py = mapY(yValOrig);
          if (py >= padding && py <= svgHeight - padding) {
            originalPoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
          }
        }
      } catch {}

      // Derivative
      try {
        const yValDeriv = math.evaluate(calculation.derivativeSymbolic, { [variable]: xVal });
        if (typeof yValDeriv === 'number' && !isNaN(yValDeriv)) {
          const py = mapY(yValDeriv);
          if (py >= padding && py <= svgHeight - padding) {
            derivativePoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
          }
        }
      } catch {}
    }

    return {
      originalPath: originalPoints.length > 1 ? `M ${originalPoints.join(' L ')}` : '',
      derivativePath: derivativePoints.length > 1 ? `M ${derivativePoints.join(' L ')}` : ''
    };
  }, [expression, variable, calculation, error]);

  const handleCopy = () => {
    if (calculation) {
      navigator.clipboard.writeText(calculation.derivativeSymbolic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setExpression('x^3 - 3*x^2 + 2*x');
    setVariable('x');
    setOrder(1);
    setEvalX('2');
    setError(null);
  };

  return (
    <>
      <SEO
        title="Derivative Calculator with Steps | Symbolic Derivative Solver"
        description="Free online derivative calculator. Solves first, second, and higher-order derivatives symbolically with graphs and evaluation."
        keywords={['derivative calculator', 'calculus solver', 'first derivative', 'nerdamer derivative']}
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
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">Derivative Calculator</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Derivative Calculator with Steps
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
              Solve symbolic first, second, and nth derivatives online with steps and interactive curves mapping.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left Column: Inputs Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  Function Expression f({variable})
                </label>
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="e.g. x^3 - 3*x"
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
                    Derivative Order
                  </label>
                  <select
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full text-xs bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-850 rounded-lg p-2 focus:outline-none text-center"
                  >
                    <option value={1}>1st Derivative (d/dx)</option>
                    <option value={2}>2nd Derivative (d²/dx²)</option>
                    <option value={3}>3rd Derivative (d³/dx³)</option>
                    <option value={4}>4th Derivative (d⁴/dx⁴)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                  Evaluate at {variable} = (Optional)
                </label>
                <input
                  type="number"
                  value={evalX}
                  onChange={(e) => setEvalX(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono"
                />
              </div>

              {/* Examples Buttons */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  Examples
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadExample('x^2 + 3*x', 'x', 1)}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    x² + 3x
                  </button>
                  <button
                    onClick={() => loadExample('sin(x)', 'x', 1)}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    sin(x)
                  </button>
                  <button
                    onClick={() => loadExample('e^x', 'x', 2)}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    e^x (2nd order)
                  </button>
                  <button
                    onClick={() => loadExample('log(x)', 'x', 1)}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    log(x)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-xs font-bold text-zinc-600 dark:text-zinc-400 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-450 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Result Panel */}
            {calculation && !error && (
              <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-850 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Symbolic Derivative Result
                  </h4>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="font-mono text-base font-bold text-emerald-400 break-all select-all">
                  {calculation.derivativeSymbolic}
                </div>

                {calculation.evaluatedVal !== null && (
                  <div className="pt-2 border-t border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block uppercase tracking-wider mb-1">
                      Evaluated Value at {variable} = {evalX}
                    </span>
                    <span className="font-mono text-lg font-bold text-white">
                      {calculation.evaluatedVal.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Graphs & Explanations */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Functions Graph Plane Overlay</span>
                <span className="flex gap-4 text-[9px] font-bold">
                  <span className="flex items-center gap-1 text-indigo-500">
                    <span className="w-2.5 h-0.5 bg-indigo-500 inline-block" /> Original f(x)
                  </span>
                  <span className="flex items-center gap-1 text-purple-500">
                    <span className="w-2.5 h-0.5 bg-purple-500 inline-block" /> Derivative f'(x)
                  </span>
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
                  {Array.from({ length: 17 }).map((_, i) => {
                    const lineX = mapX(-8 + i);
                    return (
                      <line
                        key={`x-${i}`}
                        x1={lineX}
                        y1={0}
                        x2={lineX}
                        y2={svgHeight}
                        stroke="currentColor"
                        className="text-zinc-200 dark:text-zinc-800/40"
                        strokeWidth={-8 + i === 0 ? 1.5 : 0.5}
                      />
                    );
                  })}
                  {Array.from({ length: 11 }).map((_, i) => {
                    const lineY = mapY(-5 + i);
                    return (
                      <line
                        key={`y-${i}`}
                        x1={0}
                        y1={lineY}
                        x2={svgWidth}
                        y2={lineY}
                        stroke="currentColor"
                        className="text-zinc-200 dark:text-zinc-800/40"
                        strokeWidth={-5 + i === 0 ? 1.5 : 0.5}
                      />
                    );
                  })}

                  {/* Render Curves */}
                  {graphPaths && (
                    <>
                      {graphPaths.originalPath && (
                        <path
                          d={graphPaths.originalPath}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      )}
                      {graphPaths.derivativePath && (
                        <path
                          d={graphPaths.derivativePath}
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      )}
                    </>
                  )}
                </svg>
              </div>
            </div>

            {/* Steps / Rules explanation section */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Differentiation Formulas & Help
              </h4>
              <div className="text-xs text-zinc-650 dark:text-zinc-350 space-y-3 leading-relaxed">
                <p>
                  To solve derivative equations symbolically, the calculator implements basic rules of differentiation:
                </p>
                <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-zinc-550 dark:text-zinc-450">
                  <li>Power Rule: d/dx [xⁿ] = n · xⁿ⁻¹</li>
                  <li>Product Rule: d/dx [u · v] = u' · v + u · v'</li>
                  <li>Chain Rule: d/dx [f(g(x))] = f'(g(x)) · g'(x)</li>
                  <li>Trig Rules: d/dx [sin(x)] = cos(x), d/dx [cos(x)] = -sin(x)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
