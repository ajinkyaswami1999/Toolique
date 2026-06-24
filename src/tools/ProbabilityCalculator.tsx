import { useState, useMemo } from 'react';
import {
  getPermutation, getCombination, binomialProbability,
  getZScore, normalCDF
} from '../utils/mathCalc';

export default function ProbabilityCalculator() {
  const [probMode, setProbMode] = useState<'perm_comb' | 'binomial' | 'normal'>('perm_comb');

  // Perm/Comb Inputs
  const [nVal, setNVal] = useState<number>(10);
  const [rVal, setRVal] = useState<number>(3);

  // Binomial Inputs
  const [biN, setBiN] = useState<number>(10);
  const [biP, setBiP] = useState<number>(0.5);
  const [biK, setBiK] = useState<number>(5);

  // Normal Inputs
  const [normMean, setNormMean] = useState<number>(0);
  const [normSD, setNormSD] = useState<number>(1);
  const [normX, setNormX] = useState<number>(1);

  // Computations
  const permCombResult = useMemo(() => {
    return {
      permutation: getPermutation(nVal, rVal),
      combination: getCombination(nVal, rVal)
    };
  }, [nVal, rVal]);

  const binomialResult = useMemo(() => {
    const pmf = binomialProbability(biN, biK, biP);
    
    // Calculate cumulative sum P(X <= k)
    let cdf = 0;
    for (let i = 0; i <= biK; i++) {
      cdf += binomialProbability(biN, i, biP);
    }

    return { pmf, cdf };
  }, [biN, biK, biP]);

  const normalResult = useMemo(() => {
    const z = getZScore(normX, normMean, normSD);
    const p = normalCDF(z);
    return { z, p };
  }, [normX, normMean, normSD]);

  // Diagram details
  const svgWidth = 400;
  const svgHeight = 200;
  const padding = 20;

  const renderNormalCurve = () => {
    const z = normalResult.z;
    const points: string[] = [];

    // Map mathematical coordinates x: -4 to +4, y: 0 to 0.5 to SVG pixels
    const getX = (xVal: number) => padding + ((xVal + 4) / 8) * (svgWidth - 2 * padding);
    const getY = (yVal: number) => svgHeight - padding - (yVal / 0.45) * (svgHeight - 2 * padding);

    // Probability Density Function of standard normal distribution:
    // f(x) = (1 / sqrt(2pi)) * e^(-x^2 / 2)
    const normalPDF = (xVal: number) => {
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * xVal * xVal);
    };

    // Shaded Area coordinates (from -4 to Z)
    const shadePoints: string[] = [];
    shadePoints.push(`${getX(-4)},${getY(0)}`);
    for (let x = -4; x <= Math.min(z, 4); x += 0.1) {
      shadePoints.push(`${getX(x)},${getY(normalPDF(x))}`);
    }
    shadePoints.push(`${getX(Math.min(z, 4))},${getY(0)}`);

    // Complete curve coordinates
    for (let x = -4; x <= 4; x += 0.1) {
      points.push(`${getX(x)},${getY(normalPDF(x))}`);
    }

    return (
      <svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="border border-zinc-150 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
      >
        {/* Shaded Area under the curve */}
        {z > -4 && (
          <polygon
            points={shadePoints.join(' ')}
            className="fill-indigo-500/20"
          />
        )}

        {/* Normal Curve Line */}
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
        />

        {/* X axis line */}
        <line
          x1={padding}
          y1={svgHeight - padding}
          x2={svgWidth - padding}
          y2={svgHeight - padding}
          stroke="currentColor"
          className="text-zinc-300 dark:text-zinc-700"
          strokeWidth="1.5"
        />

        {/* Vertical line at Z-score */}
        {Math.abs(z) <= 4 && (
          <>
            <line
              x1={getX(z)}
              y1={getY(0)}
              x2={getX(z)}
              y2={getY(normalPDF(z))}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <circle cx={getX(z)} cy={getY(normalPDF(z))} r="4" fill="#ef4444" />
          </>
        )}

        {/* Labels */}
        <text x={getX(0)} y={svgHeight - 4} textAnchor="middle" className="text-[9px] fill-zinc-400 font-mono">Mean (μ)</text>
        <text x={getX(-3)} y={svgHeight - 4} textAnchor="middle" className="text-[9px] fill-zinc-400 font-mono">-3σ</text>
        <text x={getX(3)} y={svgHeight - 4} textAnchor="middle" className="text-[9px] fill-zinc-400 font-mono">+3σ</text>
        {Math.abs(z) <= 4 && (
          <text x={getX(z)} y={getY(normalPDF(z)) - 10} textAnchor="middle" className="text-[9px] fill-red-500 font-bold font-mono">
            Z: {z.toFixed(2)}
          </text>
        )}
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Configuration & Inputs */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-4">
            Select Probability Module
          </h3>
          <div className="flex gap-2 mb-6">
            {(['perm_comb', 'binomial', 'normal'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setProbMode(mode)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  probMode === mode
                    ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                }`}
              >
                {mode === 'perm_comb' ? 'nPr / nCr' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Form fields based on mode */}
          {probMode === 'perm_comb' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Total Items (n)
                </label>
                <input
                  type="number"
                  value={nVal}
                  min="0"
                  onChange={(e) => setNVal(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Selected (r)
                </label>
                <input
                  type="number"
                  value={rVal}
                  min="0"
                  onChange={(e) => setRVal(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {probMode === 'binomial' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Trials (n)
                </label>
                <input
                  type="number"
                  value={biN}
                  min="1"
                  onChange={(e) => setBiN(parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Prob (p)
                </label>
                <input
                  type="number"
                  value={biP}
                  min="0"
                  max="1"
                  step="0.05"
                  onChange={(e) => setBiP(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Success (k)
                </label>
                <input
                  type="number"
                  value={biK}
                  min="0"
                  onChange={(e) => setBiK(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                />
              </div>
            </div>
          )}

          {probMode === 'normal' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Mean (μ)
                </label>
                <input
                  type="number"
                  value={normMean}
                  onChange={(e) => setNormMean(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  StdDev (σ)
                </label>
                <input
                  type="number"
                  value={normSD}
                  min="0.1"
                  onChange={(e) => setNormSD(parseFloat(e.target.value) || 1)}
                  className="w-full px-2 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Value (x)
                </label>
                <input
                  type="number"
                  value={normX}
                  onChange={(e) => setNormX(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Calculations Results Badge */}
        <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-850 space-y-4">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Calculated Probability Metric
          </h4>
          <div className="space-y-3 text-xs font-mono">
            {probMode === 'perm_comb' && (
              <>
                <div className="flex justify-between border-b border-zinc-850 pb-1">
                  <span>Permutations P(n, r):</span>
                  <span className="font-bold text-emerald-450">{permCombResult.permutation.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Combinations C(n, r):</span>
                  <span className="font-bold text-emerald-450">{permCombResult.combination.toLocaleString()}</span>
                </div>
              </>
            )}

            {probMode === 'binomial' && (
              <>
                <div className="flex justify-between border-b border-zinc-850 pb-1">
                  <span>PMF P(X = k):</span>
                  <span className="font-bold text-emerald-450">{(binomialResult.pmf).toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CDF P(X ≤ k):</span>
                  <span className="font-bold text-emerald-450">{(binomialResult.cdf).toFixed(6)}</span>
                </div>
              </>
            )}

            {probMode === 'normal' && (
              <>
                <div className="flex justify-between border-b border-zinc-850 pb-1">
                  <span>Z-Score:</span>
                  <span className="font-bold text-emerald-450">{normalResult.z.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CDF P(X ≤ x):</span>
                  <span className="font-bold text-emerald-450">{(normalResult.p * 100).toFixed(4)}%</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Graphical curve visualization */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
            {probMode === 'normal' ? 'Normal Distribution Curve Shading' : 'Distribution Curves'}
          </h4>
          <div className="flex items-center justify-center">
            {probMode === 'normal' ? (
              renderNormalCurve()
            ) : (
              <div className="p-12 text-center text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                Standard distribution graph visualization is loaded for Continuous Normal distribution.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
