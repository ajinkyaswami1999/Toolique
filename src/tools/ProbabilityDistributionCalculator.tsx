import { useState, useMemo } from 'react';
import { ArrowLeft, RotateCcw, Copy, Activity } from 'lucide-react';
import SEO from '../components/SEO';
import { poissonPMF, poissonCDF, exponentialPDF, exponentialCDF } from '../utils/mathAdvanced';

// Erf function for normal distribution CDF calculations
function erf(x: number): number {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = (x < 0) ? -1 : 1;
  const t = Math.abs(x);

  const tVal = 1.0 / (1.0 + p * t);
  const y = 1.0 - (((((a5 * tVal + a4) * tVal) + a3) * tVal + a2) * tVal + a1) * tVal * Math.exp(-t * t);

  return sign * y;
}

function normalCDF(x: number, mean: number, stdDev: number): number {
  return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
}

function normalPDF(x: number, mean: number, stdDev: number): number {
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
}

// Binomial helpers
function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let res = 1;
  const targetK = k > n / 2 ? n - k : k;
  for (let i = 1; i <= targetK; i++) {
    res = res * (n - i + 1) / i;
  }
  return res;
}

function binomialPMF(k: number, n: number, p: number): number {
  return choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function binomialCDF(k: number, n: number, p: number): number {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += binomialPMF(i, n, p);
  }
  return sum;
}

export default function ProbabilityDistributionCalculator() {
  const [distType, setDistType] = useState<'normal' | 'binomial' | 'poisson' | 'exponential'>('normal');

  // Distribution Parameters
  const [normMean, setNormMean] = useState<number>(0);
  const [normStd, setNormStd] = useState<number>(1);

  const [binomN, setBinomN] = useState<number>(20);
  const [binomP, setBinomP] = useState<number>(0.5);

  const [poissonLambda, setPoissonLambda] = useState<number>(4);

  const [expLambda, setExpLambda] = useState<number>(1.5);

  // Interval query bounds: P(xMin <= X <= xMax)
  const [qMin, setQMin] = useState<string>('-1');
  const [qMax, setQMax] = useState<string>('1');

  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setDistType('normal');
    setNormMean(0);
    setNormStd(1);
    setBinomN(20);
    setBinomP(0.5);
    setPoissonLambda(4);
    setExpLambda(1.5);
    setQMin('-1');
    setQMax('1');
    setError(null);
  };

  const loadExample = (type: typeof distType) => {
    setDistType(type);
    setError(null);
    if (type === 'normal') {
      setNormMean(100);
      setNormStd(15);
      setQMin('85');
      setQMax('115');
    } else if (type === 'binomial') {
      setBinomN(30);
      setBinomP(0.3);
      setQMin('5');
      setQMax('12');
    } else if (type === 'poisson') {
      setPoissonLambda(5);
      setQMin('2');
      setQMax('6');
    } else {
      setExpLambda(0.5);
      setQMin('0');
      setQMax('2');
    }
  };

  // Perform probability calculations
  const calculation = useMemo(() => {
    setError(null);
    try {
      const x1 = parseFloat(qMin);
      const x2 = parseFloat(qMax);
      if (isNaN(x1) || isNaN(x2)) {
        throw new Error('Please enter valid query bounds X1 and X2.');
      }
      if (x2 < x1) {
        throw new Error('Upper bound X2 must be greater than or equal to lower bound X1.');
      }

      let cdf1 = 0;
      let cdf2 = 0;
      let intervalProb = 0;

      if (distType === 'normal') {
        if (normStd <= 0) throw new Error('Standard deviation must be greater than zero.');
        cdf1 = normalCDF(x1, normMean, normStd);
        cdf2 = normalCDF(x2, normMean, normStd);
        intervalProb = cdf2 - cdf1;
      } else if (distType === 'binomial') {
        if (binomN <= 0 || !Number.isInteger(binomN)) throw new Error('Binomial trials (n) must be a positive integer.');
        if (binomP < 0 || binomP > 1) throw new Error('Probability (p) must be between 0 and 1.');
        
        // For discrete: P(x1 <= X <= x2) = sum of PMF from ceil(x1) to floor(x2)
        const k1 = Math.ceil(x1);
        const k2 = Math.floor(x2);
        
        cdf1 = binomialCDF(k1 - 1, binomN, binomP);
        cdf2 = binomialCDF(k2, binomN, binomP);
        intervalProb = k2 >= k1 ? cdf2 - cdf1 : 0;
      } else if (distType === 'poisson') {
        if (poissonLambda <= 0) throw new Error('Mean (λ) must be greater than zero.');
        
        const k1 = Math.ceil(x1);
        const k2 = Math.floor(x2);
        
        cdf1 = poissonCDF(k1 - 1, poissonLambda);
        cdf2 = poissonCDF(k2, poissonLambda);
        intervalProb = k2 >= k1 ? cdf2 - cdf1 : 0;
      } else {
        if (expLambda <= 0) throw new Error('Rate parameter (λ) must be greater than zero.');
        cdf1 = exponentialCDF(x1, expLambda);
        cdf2 = exponentialCDF(x2, expLambda);
        intervalProb = cdf2 - cdf1;
      }

      return {
        cdf1,
        cdf2,
        intervalProb
      };
    } catch (e: any) {
      setError(e.message || 'Probability calculation failed.');
      return null;
    }
  }, [distType, normMean, normStd, binomN, binomP, poissonLambda, expLambda, qMin, qMax]);

  // SVG parameters
  const svgWidth = 400;
  const svgHeight = 200;
  const padding = 25;

  const graphPath = useMemo(() => {
    if (error) return null;

    let points: { x: number; y: number }[] = [];
    const isDiscrete = distType === 'binomial' || distType === 'poisson';

    let rangeXMin = 0;
    let rangeXMax = 10;
    let maxDensity = 0.5;

    // Define graph boundaries
    if (distType === 'normal') {
      rangeXMin = normMean - 4 * normStd;
      rangeXMax = normMean + 4 * normStd;
      maxDensity = normalPDF(normMean, normMean, normStd) * 1.1;

      // Plot continuous PDF
      const steps = 80;
      const stepSize = (rangeXMax - rangeXMin) / steps;
      for (let i = 0; i <= steps; i++) {
        const valX = rangeXMin + i * stepSize;
        const valY = normalPDF(valX, normMean, normStd);
        points.push({ x: valX, y: valY });
      }
    } else if (distType === 'binomial') {
      rangeXMin = 0;
      rangeXMax = binomN;
      
      // Calculate Binomial PMF values
      for (let i = 0; i <= binomN; i++) {
        const valY = binomialPMF(i, binomN, binomP);
        points.push({ x: i, y: valY });
        maxDensity = Math.max(maxDensity, valY);
      }
      maxDensity = maxDensity * 1.15;
    } else if (distType === 'poisson') {
      rangeXMin = 0;
      rangeXMax = Math.ceil(poissonLambda + 4 * Math.sqrt(poissonLambda));
      
      for (let i = 0; i <= rangeXMax; i++) {
        const valY = poissonPMF(i, poissonLambda);
        points.push({ x: i, y: valY });
        maxDensity = Math.max(maxDensity, valY);
      }
      maxDensity = maxDensity * 1.15;
    } else {
      // Exponential
      rangeXMin = 0;
      rangeXMax = 5 / expLambda;
      maxDensity = expLambda * 1.15;

      const steps = 85;
      const stepSize = rangeXMax / steps;
      for (let i = 0; i <= steps; i++) {
        const valX = i * stepSize;
        const valY = exponentialPDF(valX, expLambda);
        points.push({ x: valX, y: valY });
      }
    }

    const mapX = (v: number) => {
      const pct = (v - rangeXMin) / (rangeXMax - rangeXMin);
      return padding + pct * (svgWidth - 2 * padding);
    };

    const mapY = (v: number) => {
      const pct = v / maxDensity;
      return svgHeight - padding - pct * (svgHeight - 2 * padding);
    };

    // Construct curve or bars paths
    let mainPath = '';
    let shadedPath = '';

    const x1 = parseFloat(qMin);
    const x2 = parseFloat(qMax);

    if (!isDiscrete) {
      // Shaded continuous area (x1 to x2)
      const curveStr = points.map(pt => `${mapX(pt.x).toFixed(1)},${mapY(pt.y).toFixed(1)}`).join(' L ');
      mainPath = `M ${curveStr}`;

      const shadedPoints = points.filter(pt => pt.x >= x1 && pt.x <= x2);
      if (shadedPoints.length > 0) {
        const startX = mapX(Math.max(x1, rangeXMin));
        const endX = mapX(Math.min(x2, rangeXMax));
        const baselineY = svgHeight - padding;

        const pathStr = shadedPoints.map(pt => `${mapX(pt.x).toFixed(1)},${mapY(pt.y).toFixed(1)}`).join(' L ');
        shadedPath = `M ${startX.toFixed(1)},${baselineY.toFixed(1)} L ${pathStr} L ${endX.toFixed(1)},${baselineY.toFixed(1)} Z`;
      }
    }

    return {
      points,
      isDiscrete,
      mainPath,
      shadedPath,
      mapX,
      mapY,
      rangeXMin,
      rangeXMax,
      x1,
      x2
    };
  }, [distType, normMean, normStd, binomN, binomP, poissonLambda, expLambda, qMin, qMax, error]);

  const handleCopy = () => {
    if (calculation) {
      const text = `Interval probability P(${qMin} <= X <= ${qMax}) = ${(calculation.intervalProb * 100).toFixed(4)}%`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <SEO
        title="Probability Distribution Calculator | CDF Curve Generator"
        description="Solve Normal, Binomial, Poisson, and Exponential probabilities online. Includes interval range probabilities and shaded CDF curve overlays."
        keywords={['probability calculator', 'cdf calculator', 'normal distribution solver', 'poisson pmf', 'binomial cdf curve']}
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
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">Probability Distributions</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Probability Distribution Calculator
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
              Solve cumulative interval probabilities and plot shaded CDF graphs for discrete and continuous distributions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left Column: inputs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              {/* Distribution selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  Select Distribution
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['normal', 'binomial', 'poisson', 'exponential'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setDistType(type)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                        distType === type
                          ? 'border-indigo-655 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-450 hover:bg-zinc-50'
                      }`}
                    >
                      {type === 'normal' ? 'Normal' : type === 'binomial' ? 'Binomial' : type === 'poisson' ? 'Poisson' : 'Exponential'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Parameter Fields */}
              {distType === 'normal' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-450 uppercase mb-1">Mean (μ)</label>
                    <input
                      type="number"
                      step="any"
                      value={normMean}
                      onChange={(e) => setNormMean(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-455 uppercase mb-1">Std Dev (σ)</label>
                    <input
                      type="number"
                      step="any"
                      value={normStd}
                      onChange={(e) => setNormStd(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {distType === 'binomial' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-455 uppercase mb-1">Trials (n)</label>
                    <input
                      type="number"
                      min={1}
                      step="1"
                      value={binomN}
                      onChange={(e) => setBinomN(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-455 uppercase mb-1">Success Prob (p)</label>
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step="0.05"
                      value={binomP}
                      onChange={(e) => setBinomP(parseFloat(e.target.value) || 0.5)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono"
                    />
                  </div>
                </div>
              )}

              {distType === 'poisson' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-455 uppercase mb-1">Mean / Rate (λ)</label>
                  <input
                    type="number"
                    min={0.01}
                    step="any"
                    value={poissonLambda}
                    onChange={(e) => setPoissonLambda(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono"
                  />
                </div>
              )}

              {distType === 'exponential' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-455 uppercase mb-1">Rate Parameter (λ)</label>
                  <input
                    type="number"
                    min={0.01}
                    step="any"
                    value={expLambda}
                    onChange={(e) => setExpLambda(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono"
                  />
                </div>
              )}

              {/* Interval query parameters */}
              <div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-2">
                  Calculate Range Probability P(X1 ≤ X ≤ X2)
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-450 uppercase mb-1">Lower Bound X1</label>
                    <input
                      type="number"
                      step="any"
                      value={qMin}
                      onChange={(e) => setQMin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-455 uppercase mb-1">Upper Bound X2</label>
                    <input
                      type="number"
                      step="any"
                      value={qMax}
                      onChange={(e) => setQMax(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">
                  Standard Case Examples
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => loadExample('normal')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    IQ Scores (Mean 100)
                  </button>
                  <button
                    onClick={() => loadExample('binomial')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    Coin flips (30 trials)
                  </button>
                  <button
                    onClick={() => loadExample('poisson')}
                    className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 text-[10px] rounded hover:bg-zinc-100 transition-colors text-zinc-700 dark:text-zinc-300"
                  >
                    Poisson λ = 5
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-xs font-bold text-zinc-600 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset parameters</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-455 text-xs font-semibold">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Graphs & Stats results details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Probability Curves */}
            {graphPath && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Probability Distribution Graph</span>
                  <span className="text-[10px] text-zinc-400 font-mono">PDF / PMF Area Highlight</span>
                </h4>
                <div className="flex items-center justify-center">
                  <svg
                    width="100%"
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="border border-zinc-100 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
                  >
                    {/* Baseline axis */}
                    <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="currentColor" className="text-zinc-300 dark:text-zinc-800" strokeWidth={1} />

                    {/* Render Continuous Area */}
                    {!graphPath.isDiscrete && (
                      <>
                        {graphPath.shadedPath && (
                          <path
                            d={graphPath.shadedPath}
                            fill="#6366f1"
                            className="opacity-25 dark:opacity-35"
                          />
                        )}
                        {graphPath.mainPath && (
                          <path
                            d={graphPath.mainPath}
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth={2}
                          />
                        )}
                      </>
                    )}

                    {/* Render Discrete Bars */}
                    {graphPath.isDiscrete && graphPath.points.map((pt, idx) => {
                      const sx = graphPath.mapX(pt.x);
                      const sy = graphPath.mapY(pt.y);
                      const baselineY = svgHeight - padding;
                      const isHighlighted = pt.x >= graphPath.x1 && pt.x <= graphPath.x2;

                      return (
                        <g key={`bar-${idx}`}>
                          <line
                            x1={sx}
                            y1={baselineY}
                            x2={sx}
                            y2={sy}
                            stroke={isHighlighted ? '#6366f1' : '#cbd5e1'}
                            strokeWidth={Math.max(2, 300 / graphPath.points.length)}
                            className={isHighlighted ? 'opacity-100' : 'opacity-40 dark:opacity-20'}
                          />
                          <circle
                            cx={sx}
                            cy={sy}
                            r={2}
                            fill={isHighlighted ? '#6366f1' : '#94a3b8'}
                            className={isHighlighted ? 'opacity-100' : 'opacity-40 dark:opacity-25'}
                          />
                        </g>
                      );
                    })}

                    {/* Boundary ticks indicators */}
                    <line x1={graphPath.mapX(graphPath.x1)} y1={svgHeight - padding} x2={graphPath.mapX(graphPath.x1)} y2={svgHeight - padding - 6} stroke="#6366f1" strokeWidth={1.5} />
                    <line x1={graphPath.mapX(graphPath.x2)} y1={svgHeight - padding} x2={graphPath.mapX(graphPath.x2)} y2={svgHeight - padding - 6} stroke="#6366f1" strokeWidth={1.5} />
                    <text x={graphPath.mapX(graphPath.x1)} y={svgHeight - 12} textAnchor="middle" className="text-[9px] font-mono font-bold fill-indigo-600 dark:fill-indigo-400">X1</text>
                    <text x={graphPath.mapX(graphPath.x2)} y={svgHeight - 12} textAnchor="middle" className="text-[9px] font-mono font-bold fill-indigo-600 dark:fill-indigo-400">X2</text>
                  </svg>
                </div>
              </div>
            )}

            {/* Results summary panel */}
            {calculation && !error && (
              <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-850 space-y-4 font-mono text-sm">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Calculated Probability Limits
                  </h4>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Result'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase mb-1">
                      Interval Probability P(X1 ≤ X ≤ X2)
                    </span>
                    <span className="text-2xl font-black text-emerald-400">
                      {(calculation.intervalProb * 100).toFixed(4)}%
                    </span>
                    <span className="text-[10px] text-zinc-450 block mt-1">
                      Decimal representation: {calculation.intervalProb.toFixed(6)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase">Lower CDF P(X ≤ X1)</span>
                      <span className="text-xs font-bold text-white">{calculation.cdf1.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase">Upper CDF P(X ≤ X2)</span>
                      <span className="text-xs font-bold text-white">{calculation.cdf2.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Educational guide */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                Probability Distribution Reference
              </h4>
              <div className="text-xs text-zinc-650 dark:text-zinc-350 space-y-3 leading-relaxed">
                <p>
                  Probability distributions describe the likelihood of observing outcomes for random variables.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-mono text-zinc-550 dark:text-zinc-455">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl">
                    <strong className="text-zinc-900 dark:text-white block mb-0.5">Continuous curves</strong>
                    Includes Normal and Exponential. Probabilities represent areas under continuous PDF curves.
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl">
                    <strong className="text-zinc-900 dark:text-white block mb-0.5">Discrete maps</strong>
                    Includes Binomial and Poisson. Probabilities represent sums of individual bars PMFs.
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
