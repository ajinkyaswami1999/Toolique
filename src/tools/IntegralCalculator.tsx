import { useState, useMemo } from 'react';
import { ArrowLeft, Copy, RotateCcw, Binary } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';
import { integrateSimpson13 } from '../utils/mathAdvanced';
import SEO from '../components/SEO';

export default function IntegralCalculator() {
  const [expression, setExpression] = useState<string>('x^2 - 2*x + 1');
  const [mode, setMode] = useState<'indefinite' | 'definite'>('definite');
  const [variable, setVariable] = useState<string>('x');
  const [lowerLimit, setLowerLimit] = useState<string>('0');
  const [upperLimit, setUpperLimit] = useState<string>('3');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Example inputs
  const loadExample = (expr: string, type: 'indefinite' | 'definite', lower: string = '0', upper: string = '3') => {
    setExpression(expr);
    setMode(type);
    setLowerLimit(lower);
    setUpperLimit(upper);
    setError(null);
  };

  // Perform Integration
  const calculation = useMemo(() => {
    setError(null);
    if (!expression.trim()) return null;

    let antiderivative: string | null = null;
    let definiteValue: number | null = null;
    let isNumericalFallback = false;

    // Try Symbolic integration first
    try {
      const parsedAntideriv = nerdamer.integrate(expression, variable).toString();
      antiderivative = nerdamer(parsedAntideriv).simplify().toString();
    } catch {
      // Symbolic fails
    }

    if (mode === 'definite') {
      const a = parseFloat(lowerLimit);
      const b = parseFloat(upperLimit);

      if (isNaN(a) || isNaN(b)) {
        setError('Please enter valid numeric lower and upper limits.');
        return null;
      }

      // If we have antiderivative, calculate definite value using F(b) - F(a)
      if (antiderivative) {
        try {
          const valB = math.evaluate(antiderivative, { [variable]: b });
          const valA = math.evaluate(antiderivative, { [variable]: a });
          definiteValue = valB - valA;
        } catch {
          // Fallback to numerical
        }
      }

      // Fallback to Simpson's rule if exact value is null
      if (definiteValue === null || isNaN(definiteValue)) {
        try {
          isNumericalFallback = true;
          // Parse expression into JS function
          const f = (xVal: number) => {
            return math.evaluate(expression, { [variable]: xVal });
          };
          // Compute using Simpson's rule with 100 intervals
          const numRes = integrateSimpson13(f, a, b, 100);
          definiteValue = numRes.value;
        } catch (e: any) {
          setError('Definite integration failed. Check expression for asymptotes or division by zero.');
          return null;
        }
      }
    }

    return {
      antiderivative: antiderivative || 'No exact symbolic antiderivative found.',
      definiteValue,
      isNumericalFallback
    };
  }, [expression, mode, variable, lowerLimit, upperLimit]);

  // Graph details
  const svgWidth = 400;
  const svgHeight = 220;
  const padding = 30;
  const originX = svgWidth / 2;
  const originY = svgHeight / 2;
  const scale = 25; // Scale mapping factor

  const mapX = (x: number) => originX + x * scale;
  const mapY = (y: number) => originY - y * scale;

  const graphGraphics = useMemo(() => {
    if (error || !expression.trim()) return null;

    const points: string[] = [];
    const shadePoints: string[] = [];

    const a = parseFloat(lowerLimit);
    const b = parseFloat(upperLimit);

    // Evaluate function from x = -5 to +5
    for (let xVal = -6; xVal <= 6; xVal += 0.1) {
      const px = mapX(xVal);
      if (px < padding || px > svgWidth - padding) continue;

      try {
        const yVal = math.evaluate(expression, { [variable]: xVal });
        if (typeof yVal === 'number' && !isNaN(yVal)) {
          const py = mapY(yVal);
          if (py >= padding && py <= svgHeight - padding) {
            points.push(`${px.toFixed(1)},${py.toFixed(1)}`);
          }

          // definite area shading points
          if (mode === 'definite' && !isNaN(a) && !isNaN(b)) {
            if (xVal >= a && xVal <= b) {
              shadePoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
            }
          }
        }
      } catch {}
    }

    // Add boundaries for shading Z-axis regions
    let shadePath = '';
    if (shadePoints.length > 0 && mode === 'definite' && !isNaN(a) && !isNaN(b)) {
      const startX = mapX(a);
      const endX = mapX(b);
      const zeroY = mapY(0);
      shadePath = `M ${startX.toFixed(1)},${zeroY.toFixed(1)} L ${shadePoints.join(' L ')} L ${endX.toFixed(1)},${zeroY.toFixed(1)} Z`;
    }

    return {
      linePath: points.length > 1 ? `M ${points.join(' L ')}` : '',
      shadePath
    };
  }, [expression, variable, mode, lowerLimit, upperLimit, error]);

  const handleCopy = () => {
    if (calculation) {
      const textToCopy = mode === 'indefinite' 
        ? `${calculation.antiderivative} + C` 
        : `${calculation.definiteValue}`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setExpression('x^2 - 2*x + 1');
    setMode('definite');
    setVariable('x');
    setLowerLimit('0');
    setUpperLimit('3');
    setError(null);
  };

  return (
    <>
      <SEO
        title="Integral Calculator with Graph | Definite & Indefinite Integral Solver"
        description="Free online integral calculator. Solve indefinite and definite integration with step-by-step antiderivatives, area graphs, and Simpson limits fallback."
        keywords={['integral calculator', 'indefinite integration', 'definite integral', 'area under curve plot']}
      />

      {/* Breadcrumbs & Navigation */}
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
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">Integral Calculator</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Binary className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Integral Calculator with Graph
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
              Solve definite and indefinite mathematical integration equations with area calculations under function curves.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('indefinite')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    mode === 'indefinite'
                      ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-650 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  Indefinite (Antiderivative)
                </button>
                <button
                  onClick={() => setMode('definite')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    mode === 'definite'
                      ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-650 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  Definite (Area)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  Function Expression to Integrate
                </label>
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="e.g. x^2 - 2*x + 1"
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-455 uppercase tracking-wider mb-1">
                    Variable
                  </label>
                  <input
                    type="text"
                    value={variable}
                    onChange={(e) => setVariable(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-center font-mono text-xs"
                  />
                </div>
                {mode === 'definite' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-455 uppercase tracking-wider mb-1">
                        Lower Bound
                      </label>
                      <input
                        type="text"
                        value={lowerLimit}
                        onChange={(e) => setLowerLimit(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-center font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-455 uppercase tracking-wider mb-1">
                        Upper Bound
                      </label>
                      <input
                        type="text"
                        value={upperLimit}
                        onChange={(e) => setUpperLimit(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-center font-mono text-xs"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Examples panel */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                  Try Examples
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadExample('x^2 - 2*x + 1', 'definite', '0', '3')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    x² - 2x + 1 (Definite)
                  </button>
                  <button
                    onClick={() => loadExample('cos(x)', 'indefinite')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    cos(x) (Indefinite)
                  </button>
                  <button
                    onClick={() => loadExample('1 / x', 'definite', '1', '4')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors"
                  >
                    1/x from [1, 4]
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
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
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-450 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Results Panel */}
            {calculation && !error && (
              <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-850 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    {mode === 'indefinite' ? 'Symbolic Antiderivative' : 'Definite Integral Area'}
                  </h4>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Result'}</span>
                  </button>
                </div>

                {mode === 'indefinite' ? (
                  <div className="font-mono text-base font-bold text-emerald-400 break-all select-all">
                    {calculation.antiderivative} + C
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="font-mono text-2xl font-black text-emerald-400">
                      {calculation.definiteValue !== null ? calculation.definiteValue.toFixed(6) : 'N/A'}
                    </div>
                    {calculation.isNumericalFallback ? (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-2 py-0.5 font-semibold">
                        ⚠️ Numerical Fallback (Simpson's 1/3 Rule active)
                      </span>
                    ) : (
                      <div className="text-[10px] text-zinc-400">
                        Exact antiderivative used: <span className="font-mono text-zinc-300">{calculation.antiderivative}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Visual area-under-curve grid graph */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Integral Area Visualization</span>
                {mode === 'definite' && (
                  <span className="flex items-center gap-1 text-xs text-indigo-500">
                    <span className="w-3.5 h-3.5 bg-indigo-500/20 border border-indigo-500 inline-block rounded" /> Area Region [a, b]
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

                  {/* Render Area Shading */}
                  {graphGraphics && graphGraphics.shadePath && (
                    <path
                      d={graphGraphics.shadePath}
                      className="fill-indigo-500/20 stroke-none"
                    />
                  )}

                  {/* Function Line */}
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

            {/* Explanation box */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Integration Principles
              </h4>
              <div className="text-xs text-zinc-650 dark:text-zinc-350 space-y-3 leading-relaxed">
                <p>
                  Integration finds the area between the function curve and the coordinate zero-line.
                </p>
                <ul className="list-disc pl-4 space-y-1 font-mono text-[11px] text-zinc-550 dark:text-zinc-450">
                  <li>Power Rule: ∫ xⁿ dx = (xⁿ⁺¹) / (n + 1)  (for n ≠ -1)</li>
                  <li>Log Rule: ∫ (1/x) dx = ln|x|</li>
                  <li>Definite Integral formula: ∫[a,b] f(x) dx = F(b) - F(a)</li>
                  <li>Simpson's 1/3 approximation computes parabolic boundaries over sub-intervals for exact numerical values.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
