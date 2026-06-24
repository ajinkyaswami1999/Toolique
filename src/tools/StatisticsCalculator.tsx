import { useState, useMemo } from 'react';
import { calculateStatistics } from '../utils/mathCalc';

export default function StatisticsCalculator() {
  const [rawInput, setRawInput] = useState<string>("12, 15, 18, 22, 22, 25, 29, 34, 40, 45, 52");
  
  const parsedNumbers = useMemo(() => {
    return rawInput
      .split(/[\s,]+/)
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v));
  }, [rawInput]);

  const stats = useMemo(() => {
    if (parsedNumbers.length === 0) return null;
    return calculateStatistics(parsedNumbers);
  }, [parsedNumbers]);

  // Histogram Binning
  const histogramData = useMemo(() => {
    if (!stats || parsedNumbers.length === 0) return [];
    
    const count = parsedNumbers.length;
    const min = stats.min;
    const max = stats.max;
    const range = max - min;
    
    // Choose number of bins using Sturges' formula: k = Math.ceil(log2(n) + 1)
    const numBins = Math.max(3, Math.min(10, Math.ceil(Math.log2(count) + 1)));
    const binWidth = range === 0 ? 1 : range / numBins;
    
    const bins = Array(numBins).fill(0).map((_, idx) => ({
      binStart: min + idx * binWidth,
      binEnd: min + (idx + 1) * binWidth,
      count: 0
    }));

    parsedNumbers.forEach(n => {
      let binIdx = Math.floor((n - min) / binWidth);
      if (binIdx >= numBins) binIdx = numBins - 1; // edge case for maximum value
      if (binIdx >= 0 && binIdx < numBins) {
        bins[binIdx].count++;
      }
    });

    return bins;
  }, [stats, parsedNumbers]);

  // SVG Chart Dimensions
  const svgWidth = 450;
  const svgHeight = 200;
  const chartPadding = 30;

  // Box Plot Render Helper
  const renderBoxPlot = () => {
    if (!stats) return null;
    const { min, max, q1, median, q3 } = stats;
    const range = max - min === 0 ? 1 : max - min;

    const getX = (val: number) => {
      const pct = (val - min) / range;
      return chartPadding + pct * (svgWidth - 2 * chartPadding);
    };

    const boxHeight = 40;

    return (
      <svg
        width="100%"
        height={100}
        viewBox={`0 0 ${svgWidth} 100`}
        className="border border-zinc-150 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
      >
        {/* Whisker Line */}
        <line
          x1={getX(min)}
          y1={50}
          x2={getX(max)}
          y2={50}
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Min tick */}
        <line x1={getX(min)} y1={35} x2={getX(min)} y2={65} stroke="#6366f1" strokeWidth="2.5" />
        
        {/* Max tick */}
        <line x1={getX(max)} y1={35} x2={getX(max)} y2={65} stroke="#6366f1" strokeWidth="2.5" />

        {/* Q1-Q3 Box */}
        <rect
          x={getX(q1)}
          y={50 - boxHeight / 2}
          width={getX(q3) - getX(q1)}
          height={boxHeight}
          className="fill-indigo-500/20 stroke-indigo-500"
          strokeWidth="2"
          rx="4"
        />

        {/* Median line */}
        <line
          x1={getX(median)}
          y1={50 - boxHeight / 2}
          x2={getX(median)}
          y2={50 + boxHeight / 2}
          stroke="#ef4444"
          strokeWidth="3.5"
        />

        {/* Labels */}
        <text x={getX(min)} y={85} textAnchor="middle" className="text-[10px] fill-zinc-400 font-mono">Min: {min}</text>
        <text x={getX(q1)} y={22} textAnchor="middle" className="text-[10px] fill-zinc-400 font-mono">Q1: {q1.toFixed(1)}</text>
        <text x={getX(median)} y={85} textAnchor="middle" className="text-[10px] fill-red-500 font-bold font-mono">Med: {median.toFixed(1)}</text>
        <text x={getX(q3)} y={22} textAnchor="middle" className="text-[10px] fill-zinc-400 font-mono">Q3: {q3.toFixed(1)}</text>
        <text x={getX(max)} y={85} textAnchor="middle" className="text-[10px] fill-zinc-400 font-mono">Max: {max}</text>
      </svg>
    );
  };

  // Histogram Render Helper
  const renderHistogram = () => {
    if (histogramData.length === 0) return null;

    const maxCount = Math.max(...histogramData.map(b => b.count), 1);
    const numBins = histogramData.length;
    const plotWidth = svgWidth - 2 * chartPadding;
    const plotHeight = svgHeight - 2 * chartPadding;
    const barWidth = plotWidth / numBins - 4;

    return (
      <svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="border border-zinc-150 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
      >
        {/* Draw Bars */}
        {histogramData.map((bin, idx) => {
          const barHeight = (bin.count / maxCount) * plotHeight;
          const x = chartPadding + idx * (plotWidth / numBins) + 2;
          const y = svgHeight - chartPadding - barHeight;

          return (
            <g key={`bar-${idx}`} className="group">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                className="fill-violet-500/80 hover:fill-violet-500 transition-colors"
                rx="3"
              />
              {/* Count label */}
              {bin.count > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className="text-[9px] fill-zinc-600 dark:fill-zinc-300 font-mono"
                >
                  {bin.count}
                </text>
              )}
              {/* Bin label range on X axis */}
              <text
                x={x + barWidth / 2}
                y={svgHeight - 12}
                textAnchor="middle"
                className="text-[8px] fill-zinc-400 font-mono"
              >
                {bin.binStart.toFixed(0)}-{bin.binEnd.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Axis line */}
        <line
          x1={chartPadding}
          y1={svgHeight - chartPadding}
          x2={svgWidth - chartPadding}
          y2={svgHeight - chartPadding}
          stroke="currentColor"
          className="text-zinc-300 dark:text-zinc-700"
          strokeWidth="1.5"
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Input Console */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-3">
            Numerical Dataset Input
          </h3>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={4}
            placeholder="Type or paste values separated by commas or lines..."
            className="w-full p-4 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 mb-3"
          />
          <p className="text-[10px] text-zinc-400">
            * Supports integers, decimals, and negative values. Outliers are automatically retained.
          </p>
        </div>

        {/* Summary Stats Table */}
        {stats && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-850 pb-2">
              Descriptive Analytics
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850/60 pb-1">
                <span className="text-zinc-450">Sample Count (n):</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{stats.count}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850/60 pb-1">
                <span className="text-zinc-450">Mean (μ):</span>
                <span className="font-bold text-indigo-500">{stats.mean.toFixed(4)}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850/60 pb-1">
                <span className="text-zinc-450">Median (Q2):</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{stats.median.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850/60 pb-1">
                <span className="text-zinc-450">Modes:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">
                  {stats.modes.length > 0 ? stats.modes.join(', ') : 'None'}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850/60 pb-1">
                <span className="text-zinc-450">Std Deviation (σ):</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{stats.stdDev.toFixed(4)}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850/60 pb-1">
                <span className="text-zinc-450">Variance (σ²):</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{stats.variance.toFixed(4)}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850/60 pb-1">
                <span className="text-zinc-450">Min:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{stats.min}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850/60 pb-1">
                <span className="text-zinc-450">Max:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{stats.max}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850/60 pb-1">
                <span className="text-zinc-450">Range:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{stats.range}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850/60 pb-1">
                <span className="text-zinc-450">IQR (Q3 - Q1):</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{(stats.q3 - stats.q1).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visualizations Column */}
      <div className="lg:col-span-7 space-y-6">
        {stats ? (
          <>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Box-and-Whisker Plot
              </h4>
              {renderBoxPlot()}
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Frequency Distribution Histogram
              </h4>
              {renderHistogram()}
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 shadow-sm text-center text-zinc-400 dark:text-zinc-500 text-sm">
            Enter valid comma separated numbers to generate analytics graphs.
          </div>
        )}
      </div>
    </div>
  );
}
