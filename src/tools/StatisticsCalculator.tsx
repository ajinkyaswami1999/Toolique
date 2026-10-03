import React, { useState, useMemo, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Shuffle,
  ArrowDownAZ,
  ArrowUpAZ,
  Filter,
  Info,
  HelpCircle,
  Percent,
  Calculator,
  Sliders,
  FileSpreadsheet,
  Activity,
  Layers,
  Upload
} from 'lucide-react';

// Statistical Metric Data Model
interface OutlierInfo {
  mildOutliers: number[];
  extremeOutliers: number[];
  lowerInnerFence: number;
  upperInnerFence: number;
  lowerOuterFence: number;
  upperOuterFence: number;
}

interface HistogramBin {
  binIndex: number;
  binStart: number;
  binEnd: number;
  midpoint: number;
  count: number;
  relativeFreq: number;
  cumulativeCount: number;
  cumulativePercent: number;
}

type DistributionType = 'normal' | 'uniform' | 'exponential' | 'bimodal';

export default function StatisticsCalculator() {
  // Input State
  const [rawInput, setRawInput] = useState<string>(
    '24, 28, 31, 35, 36, 38, 40, 42, 42, 45, 48, 49, 52, 54, 55, 58, 62, 65, 71, 78, 96'
  );
  const [isSample, setIsSample] = useState<boolean>(true); // true = sample (n-1), false = population (N)
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'frequency' | 'zscore' | 'generator'>('overview');
  const [numBinsCustom, setNumBinsCustom] = useState<number>(7);
  const [showNormalCurve, setShowNormalCurve] = useState<boolean>(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [hoveredBin, setHoveredBin] = useState<HistogramBin | null>(null);
  const [hoveredBoxMetric, setHoveredBoxMetric] = useState<string | null>(null);

  // Probe / Z-score exploration state
  const [probeValue, setProbeValue] = useState<string>('50');
  const [probePercentile, setProbePercentile] = useState<string>('75');

  // Generator settings
  const [genCount, setGenCount] = useState<number>(30);
  const [genType, setGenType] = useState<DistributionType>('normal');
  const [genMean, setGenMean] = useState<number>(50);
  const [genStdDev, setGenStdDev] = useState<number>(12);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse Raw Input into Valid Numbers
  const { parsedNumbers, invalidTokensCount } = useMemo(() => {
    if (!rawInput.trim()) return { parsedNumbers: [], invalidTokensCount: 0 };
    
    // Split by commas, whitespace, semicolons, tabs, newlines
    const tokens = rawInput.trim().split(/[\s,;\n\t]+/);
    const nums: number[] = [];
    let invalidCount = 0;

    for (const token of tokens) {
      if (!token) continue;
      const num = Number(token);
      if (!isNaN(num) && isFinite(num)) {
        nums.push(num);
      } else {
        invalidCount++;
      }
    }

    return { parsedNumbers: nums, invalidTokensCount: invalidCount };
  }, [rawInput]);

  // Sorted Array
  const sortedNumbers = useMemo(() => {
    return [...parsedNumbers].sort((a, b) => a - b);
  }, [parsedNumbers]);

  // Comprehensive Statistical Calculations
  const stats = useMemo(() => {
    const n = parsedNumbers.length;
    if (n === 0) return null;

    const sum = parsedNumbers.reduce((acc, v) => acc + v, 0);
    const sumSquares = parsedNumbers.reduce((acc, v) => acc + v * v, 0);
    const mean = sum / n;

    // Minimum & Maximum
    const min = sortedNumbers[0];
    const max = sortedNumbers[n - 1];
    const range = max - min;
    const midrange = (min + max) / 2;

    // Median (Q2)
    let median: number;
    if (n % 2 === 1) {
      median = sortedNumbers[Math.floor(n / 2)];
    } else {
      median = (sortedNumbers[n / 2 - 1] + sortedNumbers[n / 2]) / 2;
    }

    // Quartiles using linear interpolation (R-7 / NumPy / Excel method)
    const getPercentile = (p: number): number => {
      if (n === 1) return sortedNumbers[0];
      const index = p * (n - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      return sortedNumbers[lower] + weight * (sortedNumbers[upper] - sortedNumbers[lower]);
    };

    const q1 = getPercentile(0.25);
    const q3 = getPercentile(0.75);
    const iqr = q3 - q1;

    // Mode Calculation
    const freqMap = new Map<number, number>();
    for (const num of parsedNumbers) {
      const rounded = Math.round(num * 1e6) / 1e6;
      freqMap.set(rounded, (freqMap.get(rounded) || 0) + 1);
    }

    let maxFreq = 0;
    freqMap.forEach((freq) => {
      if (freq > maxFreq) maxFreq = freq;
    });

    let modes: number[] = [];
    if (maxFreq > 1 && maxFreq < n) {
      freqMap.forEach((freq, val) => {
        if (freq === maxFreq) modes.push(val);
      });
      modes.sort((a, b) => a - b);
    }

    // Variance & Standard Deviation
    const sqDiffSum = parsedNumbers.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
    const divisor = isSample ? (n > 1 ? n - 1 : 1) : n;
    const variance = sqDiffSum / divisor;
    const stdDev = Math.sqrt(variance);
    const stdErrMean = n > 0 ? stdDev / Math.sqrt(n) : 0;

    // Mean Absolute Deviation (MAD from mean)
    const madSum = parsedNumbers.reduce((acc, v) => acc + Math.abs(v - mean), 0);
    const mad = madSum / n;

    // Median Absolute Deviation (MAD from median)
    const absDeviationsFromMedian = sortedNumbers.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
    let medianAbsoluteDev: number;
    if (n % 2 === 1) {
      medianAbsoluteDev = absDeviationsFromMedian[Math.floor(n / 2)];
    } else {
      medianAbsoluteDev = (absDeviationsFromMedian[n / 2 - 1] + absDeviationsFromMedian[n / 2]) / 2;
    }

    // Geometric Mean (for positive values)
    const allPositive = parsedNumbers.every((v) => v > 0);
    let geometricMean: number | null = null;
    if (allPositive) {
      const logSum = parsedNumbers.reduce((acc, v) => acc + Math.log(v), 0);
      geometricMean = Math.exp(logSum / n);
    }

    // Harmonic Mean (for non-zero positive values)
    let harmonicMean: number | null = null;
    if (allPositive) {
      const invSum = parsedNumbers.reduce((acc, v) => acc + 1 / v, 0);
      harmonicMean = n / invSum;
    }

    // 10% Trimmed Mean
    const trimCount = Math.floor(n * 0.1);
    let trimmedMean: number = mean;
    if (trimCount > 0 && n - 2 * trimCount > 0) {
      const trimmedSlice = sortedNumbers.slice(trimCount, n - trimCount);
      trimmedMean = trimmedSlice.reduce((acc, v) => acc + v, 0) / trimmedSlice.length;
    }

    // Coefficient of Variation (%)
    const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0;

    // Skewness (Fisher-Pearson)
    let skewness = 0;
    let kurtosis = 0;
    let excessKurtosis = 0;

    if (n >= 3 && stdDev > 0) {
      const m3 = parsedNumbers.reduce((acc, v) => acc + Math.pow(v - mean, 3), 0) / n;
      const m2 = parsedNumbers.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
      const g1 = m3 / Math.pow(m2, 1.5);
      if (isSample && n > 2) {
        skewness = (Math.sqrt(n * (n - 1)) / (n - 2)) * g1;
      } else {
        skewness = g1;
      }
    }

    // Kurtosis (Excess)
    if (n >= 4 && stdDev > 0) {
      const m4 = parsedNumbers.reduce((acc, v) => acc + Math.pow(v - mean, 4), 0) / n;
      const m2 = parsedNumbers.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
      const g2 = m4 / Math.pow(m2, 2) - 3;
      if (isSample && n > 3) {
        excessKurtosis = ((n - 1) / ((n - 2) * (n - 3))) * ((n + 1) * g2 + 6);
      } else {
        excessKurtosis = g2;
      }
      kurtosis = excessKurtosis + 3;
    }

    // Confidence Interval of Mean (95% and 99%)
    const tCrit95 = n < 30 ? getTCritical95(n - 1) : 1.95996;
    const tCrit99 = n < 30 ? getTCritical99(n - 1) : 2.57583;
    const ci95Lower = mean - tCrit95 * stdErrMean;
    const ci95Upper = mean + tCrit95 * stdErrMean;
    const ci99Lower = mean - tCrit99 * stdErrMean;
    const ci99Upper = mean + tCrit99 * stdErrMean;

    // Outlier Detection (Tukey's IQR Fences)
    const lowerInnerFence = q1 - 1.5 * iqr;
    const upperInnerFence = q3 + 1.5 * iqr;
    const lowerOuterFence = q1 - 3.0 * iqr;
    const upperOuterFence = q3 + 3.0 * iqr;

    const mildOutliers: number[] = [];
    const extremeOutliers: number[] = [];

    parsedNumbers.forEach((v) => {
      if (v < lowerOuterFence || v > upperOuterFence) {
        extremeOutliers.push(v);
      } else if (v < lowerInnerFence || v > upperInnerFence) {
        mildOutliers.push(v);
      }
    });

    const outlierInfo: OutlierInfo = {
      mildOutliers,
      extremeOutliers,
      lowerInnerFence,
      upperInnerFence,
      lowerOuterFence,
      upperOuterFence
    };

    return {
      count: n,
      sum,
      sumSquares,
      mean,
      median,
      modes,
      maxFreq,
      min,
      max,
      range,
      midrange,
      q1,
      q3,
      iqr,
      variance,
      stdDev,
      stdErrMean,
      mad,
      medianAbsoluteDev,
      geometricMean,
      harmonicMean,
      trimmedMean,
      cv,
      skewness,
      kurtosis,
      excessKurtosis,
      ci95Lower,
      ci95Upper,
      ci99Lower,
      ci99Upper,
      outlierInfo,
      getPercentile
    };
  }, [parsedNumbers, sortedNumbers, isSample]);

  // Frequency Distribution Histogram & Table Computation
  const histogramData = useMemo<HistogramBin[]>(() => {
    if (!stats || parsedNumbers.length === 0) return [];

    const n = parsedNumbers.length;
    const min = stats.min;
    const max = stats.max;
    const range = max - min;

    const numBins = Math.max(3, Math.min(30, numBinsCustom));
    const binWidth = range === 0 ? 1 : (range + 0.00001) / numBins;

    const bins: HistogramBin[] = [];
    let runningCumulative = 0;

    for (let i = 0; i < numBins; i++) {
      const binStart = min + i * binWidth;
      const binEnd = min + (i + 1) * binWidth;
      const midpoint = (binStart + binEnd) / 2;

      const count = parsedNumbers.filter((v) => {
        if (i === numBins - 1) {
          return v >= binStart && v <= binEnd + 0.00001;
        }
        return v >= binStart && v < binEnd;
      }).length;

      runningCumulative += count;
      const relativeFreq = n > 0 ? (count / n) * 100 : 0;
      const cumulativePercent = n > 0 ? (runningCumulative / n) * 100 : 0;

      bins.push({
        binIndex: i + 1,
        binStart,
        binEnd,
        midpoint,
        count,
        relativeFreq,
        cumulativeCount: runningCumulative,
        cumulativePercent
      });
    }

    return bins;
  }, [stats, parsedNumbers, numBinsCustom]);

  // Handle Preset Selection
  const applyPreset = (presetKey: string) => {
    switch (presetKey) {
      case 'exam':
        setRawInput('58, 62, 65, 68, 70, 72, 72, 74, 75, 77, 78, 80, 81, 82, 82, 84, 85, 87, 88, 90, 92, 95, 98, 42, 100');
        break;
      case 'latency':
        setRawInput('12, 14, 15, 15, 16, 17, 18, 18, 19, 21, 22, 24, 25, 29, 32, 35, 45, 68, 120, 310');
        break;
      case 'stock':
        setRawInput('-3.2, -2.1, -1.5, -0.8, -0.4, -0.1, 0.2, 0.4, 0.5, 0.7, 0.9, 1.1, 1.3, 1.6, 2.2, 2.8, 3.5, 4.2');
        break;
      case 'quality':
        setRawInput('25.02, 24.98, 25.00, 25.05, 24.95, 25.01, 25.03, 24.99, 25.04, 24.97, 25.02, 25.00, 24.96, 25.06, 24.94');
        break;
      case 'income':
        setRawInput('28, 32, 35, 40, 42, 45, 48, 52, 55, 60, 68, 75, 82, 95, 120, 145, 280, 450');
        break;
      default:
        break;
    }
  };

  // Generate Synthetic Distribution Data
  const generateSyntheticData = () => {
    const data: number[] = [];
    for (let i = 0; i < genCount; i++) {
      if (genType === 'normal') {
        const u1 = Math.max(1e-7, Math.random());
        const u2 = Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        data.push(Math.round((genMean + z0 * genStdDev) * 100) / 100);
      } else if (genType === 'uniform') {
        const val = genMean - genStdDev * 1.732 + Math.random() * (genStdDev * 3.464);
        data.push(Math.round(val * 100) / 100);
      } else if (genType === 'exponential') {
        const u = Math.max(1e-7, Math.random());
        const rate = 1 / (genStdDev || 1);
        const val = -Math.log(1 - u) / rate;
        data.push(Math.round(val * 100) / 100);
      } else if (genType === 'bimodal') {
        const group = Math.random() > 0.5 ? 1 : 2;
        const mean = group === 1 ? genMean - genStdDev : genMean + genStdDev;
        const u1 = Math.max(1e-7, Math.random());
        const u2 = Math.random();
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        data.push(Math.round((mean + z * (genStdDev * 0.4)) * 100) / 100);
      }
    }
    setRawInput(data.join(', '));
  };

  // Quick Action Utilities
  const handleSortAscending = () => {
    setRawInput(sortedNumbers.join(', '));
  };

  const handleSortDescending = () => {
    setRawInput([...sortedNumbers].reverse().join(', '));
  };

  const handleShuffle = () => {
    const shuffled = [...parsedNumbers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setRawInput(shuffled.join(', '));
  };

  const handleRemoveOutliers = () => {
    if (!stats) return;
    const { lowerInnerFence, upperInnerFence } = stats.outlierInfo;
    const filtered = parsedNumbers.filter((v) => v >= lowerInnerFence && v <= upperInnerFence);
    setRawInput(filtered.join(', '));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawInput(content);
      }
    };
    reader.readAsText(file);
  };

  const handleCopyReport = () => {
    if (!stats) return;
    const report = `STATISTICAL ANALYSIS REPORT
-----------------------------------------
Dataset Size (n): ${stats.count} (${isSample ? 'Sample Statistics' : 'Population Statistics'})
Sum (Sum x): ${stats.sum.toFixed(4)}
Sum of Squares (Sum x2): ${stats.sumSquares.toFixed(4)}

CENTRAL TENDENCY:
- Mean (Mean): ${stats.mean.toFixed(4)}
- Median (Q2): ${stats.median.toFixed(4)}
- Mode(s): ${stats.modes.length > 0 ? stats.modes.join(', ') : 'None'}
- Midrange: ${stats.midrange.toFixed(4)}
- Trimmed Mean (10%): ${stats.trimmedMean.toFixed(4)}
${stats.geometricMean !== null ? `- Geometric Mean: ${stats.geometricMean.toFixed(4)}\n` : ''}${stats.harmonicMean !== null ? `- Harmonic Mean: ${stats.harmonicMean.toFixed(4)}\n` : ''}
DISPERSION & SPREAD:
- Variance (${isSample ? 's2' : 'sigma2'}): ${stats.variance.toFixed(4)}
- Standard Deviation (${isSample ? 's' : 'sigma'}): ${stats.stdDev.toFixed(4)}
- Standard Error (SEM): ${stats.stdErrMean.toFixed(4)}
- Range: ${stats.range.toFixed(4)}
- Interquartile Range (IQR): ${stats.iqr.toFixed(4)}
- Mean Absolute Deviation (MAD): ${stats.mad.toFixed(4)}
- Coeff of Variation (CV%): ${stats.cv.toFixed(2)}%

5-NUMBER SUMMARY:
- Min: ${stats.min}
- Q1 (25th percentile): ${stats.q1.toFixed(4)}
- Median (50th percentile): ${stats.median.toFixed(4)}
- Q3 (75th percentile): ${stats.q3.toFixed(4)}
- Max: ${stats.max}

SHAPE & DISTRIBUTION:
- Skewness: ${stats.skewness.toFixed(4)} (${stats.skewness > 0.5 ? 'Right-skewed' : stats.skewness < -0.5 ? 'Left-skewed' : 'Approximately symmetric'})
- Excess Kurtosis: ${stats.excessKurtosis.toFixed(4)} (${stats.excessKurtosis > 0.5 ? 'Leptokurtic (Heavy tails)' : stats.excessKurtosis < -0.5 ? 'Platykurtic (Flat)' : 'Mesokurtic (Normal)'})
- 95% Confidence Interval for Mean: [${stats.ci95Lower.toFixed(4)}, ${stats.ci95Upper.toFixed(4)}]

OUTLIERS (Tukey's IQR Fences):
- Mild Outliers: ${stats.outlierInfo.mildOutliers.length > 0 ? stats.outlierInfo.mildOutliers.join(', ') : 'None'}
- Extreme Outliers: ${stats.outlierInfo.extremeOutliers.length > 0 ? stats.outlierInfo.extremeOutliers.join(', ') : 'None'}
-----------------------------------------
Generated via ToolStack Statistics Suite`;

    navigator.clipboard.writeText(report);
    setCopied('report');
    setTimeout(() => setCopied(null), 2500);
  };

  const handleExportCSV = () => {
    if (!stats) return;
    const csvContent = 'data:text/csv;charset=utf-8,Index,Value,ZScore\n' +
      parsedNumbers.map((v, i) => {
        const z = stats.stdDev !== 0 ? ((v - stats.mean) / stats.stdDev).toFixed(4) : '0';
        return `${i + 1},${v},${z}`;
      }).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `statistics_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Probe Evaluation (Z-Score & Percentile Calculator)
  const probeAnalysis = useMemo(() => {
    if (!stats || !probeValue) return null;
    const num = parseFloat(probeValue);
    if (isNaN(num)) return null;

    const zScore = stats.stdDev > 0 ? (num - stats.mean) / stats.stdDev : 0;
    const cdf = normalCDF(zScore);
    const normalPercentile = cdf * 100;

    const countBelow = parsedNumbers.filter((v) => v < num).length;
    const countEqual = parsedNumbers.filter((v) => v === num).length;
    const empiricalPercentile = ((countBelow + 0.5 * countEqual) / stats.count) * 100;

    const isMildOutlier = num < stats.outlierInfo.lowerInnerFence || num > stats.outlierInfo.upperInnerFence;
    const isExtremeOutlier = num < stats.outlierInfo.lowerOuterFence || num > stats.outlierInfo.upperOuterFence;

    return {
      value: num,
      zScore,
      normalPercentile,
      empiricalPercentile,
      isMildOutlier,
      isExtremeOutlier
    };
  }, [stats, probeValue, parsedNumbers]);

  const probePercentileResult = useMemo(() => {
    if (!stats || !probePercentile) return null;
    const p = parseFloat(probePercentile);
    if (isNaN(p) || p < 0 || p > 100) return null;

    const val = stats.getPercentile(p / 100);
    return { percentile: p, value: val };
  }, [stats, probePercentile]);

  // SVG Chart Dimensions
  const boxPlotWidth = 640;
  const boxPlotHeight = 150;
  const boxPadding = 45;

  const histWidth = 640;
  const histHeight = 240;
  const histPadding = 45;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Action Toolbar (No duplicate title banner) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Dataset Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets:
          </span>
          <button
            onClick={() => applyPreset('exam')}
            className="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-750 hover:border-indigo-500 dark:hover:border-indigo-500 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 transition-colors"
          >
            🎓 Exam Scores
          </button>
          <button
            onClick={() => applyPreset('latency')}
            className="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-750 hover:border-indigo-500 dark:hover:border-indigo-500 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 transition-colors"
          >
            ⏱️ Server Latency
          </button>
          <button
            onClick={() => applyPreset('stock')}
            className="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-750 hover:border-indigo-500 dark:hover:border-indigo-500 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 transition-colors"
          >
            📈 Stock Returns
          </button>
          <button
            onClick={() => applyPreset('quality')}
            className="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-750 hover:border-indigo-500 dark:hover:border-indigo-500 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 transition-colors"
          >
            🔬 Part Dimensions
          </button>
          <button
            onClick={() => applyPreset('income')}
            className="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-750 hover:border-indigo-500 dark:hover:border-indigo-500 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 transition-colors"
          >
            💰 Skewed Income
          </button>
        </div>

        {/* Right side: Sample vs Population Mode Toggle & Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
          {/* Sample vs Population Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setIsSample(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSample
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Sample (n - 1)
            </button>
            <button
              onClick={() => setIsSample(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isSample
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Population (N)
            </button>
          </div>

          <button
            onClick={handleCopyReport}
            disabled={!stats}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 transition-colors disabled:opacity-50"
          >
            {copied === 'report' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied === 'report' ? 'Copied!' : 'Copy Summary'}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!stats}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Grid: Data Editor (Left) & Analytics Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Data Input & Dataset Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                Data Input
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                n = {parsedNumbers.length}
              </span>
            </div>

            {/* Textarea Input */}
            <div className="relative">
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                rows={6}
                placeholder="Enter numbers separated by commas, spaces, or lines (e.g., 12, 15, 23.5, -4, 82)..."
                className="w-full p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-y"
              />
              {invalidTokensCount > 0 && (
                <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 flex-shrink-0" />
                  {invalidTokensCount} non-numeric token(s) skipped.
                </div>
              )}
            </div>

            {/* Quick Data Manipulation Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleSortAscending}
                disabled={parsedNumbers.length === 0}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40"
              >
                <ArrowUpAZ className="w-3.5 h-3.5 text-indigo-500" />
                Sort Asc
              </button>
              <button
                onClick={handleSortDescending}
                disabled={parsedNumbers.length === 0}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40"
              >
                <ArrowDownAZ className="w-3.5 h-3.5 text-indigo-500" />
                Sort Desc
              </button>
              <button
                onClick={handleShuffle}
                disabled={parsedNumbers.length === 0}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40"
              >
                <Shuffle className="w-3.5 h-3.5 text-purple-500" />
                Shuffle
              </button>
              <button
                onClick={handleRemoveOutliers}
                disabled={!stats || (stats.outlierInfo.mildOutliers.length === 0 && stats.outlierInfo.extremeOutliers.length === 0)}
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-40"
              >
                <Filter className="w-3.5 h-3.5" />
                Drop Outliers
              </button>
            </div>

            {/* File Upload & Clear */}
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.txt,.json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-750 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload CSV / File
              </button>
              <button
                onClick={() => setRawInput('')}
                className="px-3 py-2 text-xs font-medium rounded-lg text-zinc-500 hover:text-rose-500 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Outlier Detection Summary Card */}
          {stats && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-500" />
                  Outlier Analysis (Tukey&apos;s IQR)
                </h3>
                <span className="text-[11px] font-mono text-zinc-400">
                  IQR: {stats.iqr.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 space-y-1">
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400 text-[11px]">
                    <span>Inner Fences [1.5 × IQR]:</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                      [{stats.outlierInfo.lowerInnerFence.toFixed(2)}, {stats.outlierInfo.upperInnerFence.toFixed(2)}]
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-500 dark:text-zinc-400 text-[11px]">
                    <span>Outer Fences [3.0 × IQR]:</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                      [{stats.outlierInfo.lowerOuterFence.toFixed(2)}, {stats.outlierInfo.upperOuterFence.toFixed(2)}]
                    </span>
                  </div>
                </div>

                {stats.outlierInfo.mildOutliers.length === 0 && stats.outlierInfo.extremeOutliers.length === 0 ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-center font-medium">
                    ✓ No statistical outliers detected in dataset.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {stats.outlierInfo.mildOutliers.length > 0 && (
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 flex items-center justify-between">
                        <span>Mild Outliers:</span>
                        <span className="font-mono font-bold">
                          {stats.outlierInfo.mildOutliers.join(', ')}
                        </span>
                      </div>
                    )}
                    {stats.outlierInfo.extremeOutliers.length > 0 && (
                      <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 flex items-center justify-between">
                        <span>Extreme Outliers:</span>
                        <span className="font-mono font-bold">
                          {stats.outlierInfo.extremeOutliers.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Tabbed Analytics Dashboard */}
        <div className="lg:col-span-8 space-y-6">
          {/* Dashboard Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Descriptive Metrics
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'charts'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Visual Charts (Box &amp; Hist)
            </button>

            <button
              onClick={() => setActiveTab('frequency')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'frequency'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Frequency Table
            </button>

            <button
              onClick={() => setActiveTab('zscore')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'zscore'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Z-Score &amp; Percentile Probe
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'generator'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Data Generator
            </button>
          </div>

          {!stats ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-16 text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mx-auto flex items-center justify-center mb-3">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Awaiting Dataset Input
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Please enter numeric values into the left input console or choose a sample preset to generate real-time statistical reports.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: DESCRIPTIVE METRICS OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Hero Key Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                      <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                        Mean (μ / x̄)
                      </div>
                      <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                        {stats.mean.toFixed(4)}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Sum: {stats.sum.toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                      <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                        Median (Q2)
                      </div>
                      <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1">
                        {stats.median.toFixed(4)}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        50th Percentile
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                      <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                        Std Dev ({isSample ? 's' : 'σ'})
                      </div>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                        {stats.stdDev.toFixed(4)}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Var: {stats.variance.toFixed(3)}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
                      <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                        IQR (Q3 - Q1)
                      </div>
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400 font-mono mt-1">
                        {stats.iqr.toFixed(4)}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Range: {stats.range.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Grouped Detailed Tables */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Central Tendency Section */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center justify-between">
                        <span>Central Tendency</span>
                        <Percent className="w-3.5 h-3.5 text-indigo-500" />
                      </h3>

                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Arithmetic Mean:</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.mean.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Median (50th %):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.median.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Mode(s):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {stats.modes.length > 0 ? `${stats.modes.join(', ')} (freq: ${stats.maxFreq})` : 'No distinct mode'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">10% Trimmed Mean:</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.trimmedMean.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Midrange ((Min+Max)/2):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.midrange.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Geometric Mean:</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {stats.geometricMean !== null ? stats.geometricMean.toFixed(4) : 'N/A (requires x > 0)'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-zinc-500 dark:text-zinc-400">Harmonic Mean:</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {stats.harmonicMean !== null ? stats.harmonicMean.toFixed(4) : 'N/A (requires x > 0)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dispersion & Variance Section */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center justify-between">
                        <span>Dispersion &amp; Variation</span>
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      </h3>

                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Variance ({isSample ? 's²' : 'σ²'}):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.variance.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Std Deviation ({isSample ? 's' : 'σ'}):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.stdDev.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Std Error Mean (SEM):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.stdErrMean.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Range (Max - Min):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.range.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">IQR (Q3 - Q1):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.iqr.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Mean Abs Deviation (MAD):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.mad.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-zinc-500 dark:text-zinc-400">Coeff of Variation (CV):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.cv.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* 5-Number Summary & Quartiles */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center justify-between">
                        <span>5-Number Summary</span>
                        <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
                      </h3>

                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Minimum (0%):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.min}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">First Quartile (Q1 / 25%):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.q1.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Median (Q2 / 50%):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.median.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Third Quartile (Q3 / 75%):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.q3.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-zinc-500 dark:text-zinc-400">Maximum (100%):</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.max}</span>
                        </div>
                      </div>
                    </div>

                    {/* Shape, Skewness & Confidence Intervals */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center justify-between">
                        <span>Distribution Shape &amp; Inference</span>
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                      </h3>

                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Skewness:</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {stats.skewness.toFixed(4)}
                            <span className="text-[10px] text-zinc-400 font-sans ml-1">
                              ({stats.skewness > 0.5 ? 'Right' : stats.skewness < -0.5 ? 'Left' : 'Symmetric'})
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">Excess Kurtosis:</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {stats.excessKurtosis.toFixed(4)}
                            <span className="text-[10px] text-zinc-400 font-sans ml-1">
                              ({stats.excessKurtosis > 0.5 ? 'Lepto' : stats.excessKurtosis < -0.5 ? 'Platy' : 'Meso'})
                            </span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">95% CI of Mean:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            [{stats.ci95Lower.toFixed(3)}, {stats.ci95Upper.toFixed(3)}]
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-100 dark:border-zinc-850/60">
                          <span className="text-zinc-500 dark:text-zinc-400">99% CI of Mean:</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            [{stats.ci99Lower.toFixed(3)}, {stats.ci99Upper.toFixed(3)}]
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-zinc-500 dark:text-zinc-400">Degrees of Freedom:</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.count - 1}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: INTERACTIVE VISUAL CHARTS (BOX PLOT & HISTOGRAM) */}
              {activeTab === 'charts' && (
                <div className="space-y-6">
                  {/* Interactive Box and Whisker Plot */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-indigo-500" />
                          Box-and-Whisker Plot with Outliers
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Visualizes Min, Q1, Median, Mean (diamond), Q3, Max and Tukey&apos;s outlier fences.
                        </p>
                      </div>

                      {hoveredBoxMetric && (
                        <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono font-semibold self-start">
                          {hoveredBoxMetric}
                        </span>
                      )}
                    </div>

                    {/* SVG Box Plot Canvas */}
                    <div className="w-full overflow-x-auto py-2">
                      <svg
                        viewBox={`0 0 ${boxPlotWidth} ${boxPlotHeight}`}
                        className="w-full h-auto min-w-[500px] select-none"
                      >
                        {(() => {
                          const { min, max, q1, median, q3, mean } = stats;
                          const range = max - min === 0 ? 1 : max - min;
                          const getX = (val: number) => {
                            const pct = (val - min) / range;
                            return boxPadding + pct * (boxPlotWidth - 2 * boxPadding);
                          };

                          const boxY = 45;
                          const boxHeight = 45;
                          const centerY = boxY + boxHeight / 2;

                          // Non-outlier whisker bounds
                          const nonOutliers = parsedNumbers.filter(
                            (v) => v >= stats.outlierInfo.lowerInnerFence && v <= stats.outlierInfo.upperInnerFence
                          );
                          const whiskerMin = nonOutliers.length > 0 ? Math.min(...nonOutliers) : min;
                          const whiskerMax = nonOutliers.length > 0 ? Math.max(...nonOutliers) : max;

                          return (
                            <g>
                              {/* Background Grid Line */}
                              <line
                                x1={boxPadding}
                                y1={centerY}
                                x2={boxPlotWidth - boxPadding}
                                y2={centerY}
                                stroke="currentColor"
                                className="text-zinc-200 dark:text-zinc-800"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                              />

                              {/* Whisker Line */}
                              <line
                                x1={getX(whiskerMin)}
                                y1={centerY}
                                x2={getX(whiskerMax)}
                                y2={centerY}
                                stroke="#6366f1"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />

                              {/* Left Whisker End Cap */}
                              <line
                                x1={getX(whiskerMin)}
                                y1={centerY - 12}
                                x2={getX(whiskerMin)}
                                y2={centerY + 12}
                                stroke="#6366f1"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                onMouseEnter={() => setHoveredBoxMetric(`Lower Whisker: ${whiskerMin}`)}
                                onMouseLeave={() => setHoveredBoxMetric(null)}
                                className="cursor-pointer"
                              />

                              {/* Right Whisker End Cap */}
                              <line
                                x1={getX(whiskerMax)}
                                y1={centerY - 12}
                                x2={getX(whiskerMax)}
                                y2={centerY + 12}
                                stroke="#6366f1"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                onMouseEnter={() => setHoveredBoxMetric(`Upper Whisker: ${whiskerMax}`)}
                                onMouseLeave={() => setHoveredBoxMetric(null)}
                                className="cursor-pointer"
                              />

                              {/* Q1-Q3 Interquartile Box */}
                              <rect
                                x={getX(q1)}
                                y={boxY}
                                width={Math.max(2, getX(q3) - getX(q1))}
                                height={boxHeight}
                                className="fill-indigo-500/20 stroke-indigo-500 hover:fill-indigo-500/30 transition-all cursor-pointer"
                                strokeWidth="2"
                                rx="6"
                                onMouseEnter={() =>
                                  setHoveredBoxMetric(
                                    `IQR Box: Q1=${q1.toFixed(2)}, Q3=${q3.toFixed(2)} (Width=${(q3 - q1).toFixed(2)})`
                                  )
                                }
                                onMouseLeave={() => setHoveredBoxMetric(null)}
                              />

                              {/* Median Line (Red/Pink Accent) */}
                              <line
                                x1={getX(median)}
                                y1={boxY}
                                x2={getX(median)}
                                y2={boxY + boxHeight}
                                stroke="#ef4444"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                onMouseEnter={() => setHoveredBoxMetric(`Median (Q2): ${median.toFixed(2)}`)}
                                onMouseLeave={() => setHoveredBoxMetric(null)}
                                className="cursor-pointer"
                              />

                              {/* Mean Diamond Marker */}
                              <polygon
                                points={`${getX(mean)},${centerY - 8} ${getX(mean) + 6},${centerY} ${getX(mean)},${
                                  centerY + 8
                                } ${getX(mean) - 6},${centerY}`}
                                fill="#10b981"
                                stroke="#ffffff"
                                strokeWidth="1.5"
                                onMouseEnter={() => setHoveredBoxMetric(`Mean (Diamond): ${mean.toFixed(2)}`)}
                                onMouseLeave={() => setHoveredBoxMetric(null)}
                                className="cursor-pointer"
                              />

                              {/* Outlier Dots */}
                              {[...stats.outlierInfo.mildOutliers, ...stats.outlierInfo.extremeOutliers].map(
                                (outlierVal, oIdx) => (
                                  <circle
                                    key={`outlier-${oIdx}`}
                                    cx={getX(outlierVal)}
                                    cy={centerY}
                                    r={4.5}
                                    fill="#f43f5e"
                                    stroke="#ffffff"
                                    strokeWidth="1.5"
                                    className="cursor-pointer hover:r-6 transition-all"
                                    onMouseEnter={() => setHoveredBoxMetric(`Outlier Value: ${outlierVal}`)}
                                    onMouseLeave={() => setHoveredBoxMetric(null)}
                                  />
                                )
                              )}

                              {/* Axis Ticks & Labels */}
                              <text
                                x={getX(min)}
                                y={boxY + boxHeight + 22}
                                textAnchor="middle"
                                className="text-[10px] fill-zinc-400 font-mono"
                              >
                                Min {min}
                              </text>
                              <text
                                x={getX(q1)}
                                y={boxY - 10}
                                textAnchor="middle"
                                className="text-[10px] fill-indigo-600 dark:fill-indigo-400 font-mono font-bold"
                              >
                                Q1 {q1.toFixed(1)}
                              </text>
                              <text
                                x={getX(median)}
                                y={boxY + boxHeight + 22}
                                textAnchor="middle"
                                className="text-[10px] fill-rose-500 font-mono font-bold"
                              >
                                Med {median.toFixed(1)}
                              </text>
                              <text
                                x={getX(q3)}
                                y={boxY - 10}
                                textAnchor="middle"
                                className="text-[10px] fill-indigo-600 dark:fill-indigo-400 font-mono font-bold"
                              >
                                Q3 {q3.toFixed(1)}
                              </text>
                              <text
                                x={getX(max)}
                                y={boxY + boxHeight + 22}
                                textAnchor="middle"
                                className="text-[10px] fill-zinc-400 font-mono"
                              >
                                Max {max}
                              </text>
                            </g>
                          );
                        })()}
                      </svg>
                    </div>

                    {/* Box Plot Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-6 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-indigo-500/30 border border-indigo-500" />
                        <span>IQR Box (Q1 to Q3)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-1 bg-red-500 rounded" />
                        <span>Median Line</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rotate-45 bg-emerald-500" />
                        <span>Mean Indicator</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span>Outliers</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Frequency Histogram with Normal Curve Overlay */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-500" />
                          Frequency Histogram &amp; Normal Distribution
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Hover over bars to inspect bin ranges, frequency counts, and relative percentages.
                        </p>
                      </div>

                      {/* Bin Slider & Normal Curve Toggle */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-400 font-mono">Bins: {numBinsCustom}</span>
                          <input
                            type="range"
                            min={3}
                            max={20}
                            value={numBinsCustom}
                            onChange={(e) => setNumBinsCustom(Number(e.target.value))}
                            className="w-24 accent-indigo-600 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                          />
                        </div>

                        <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={showNormalCurve}
                            onChange={(e) => setShowNormalCurve(e.target.checked)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                          />
                          <span>Normal Curve</span>
                        </label>
                      </div>
                    </div>

                    {/* SVG Histogram Canvas */}
                    <div className="w-full overflow-x-auto py-2">
                      <svg
                        viewBox={`0 0 ${histWidth} ${histHeight}`}
                        className="w-full h-auto min-w-[500px] select-none"
                      >
                        {(() => {
                          const maxCount = Math.max(...histogramData.map((b) => b.count), 1);
                          const numBins = histogramData.length;
                          const plotWidth = histWidth - 2 * histPadding;
                          const plotHeight = histHeight - 2 * histPadding;
                          const barStep = plotWidth / numBins;
                          const barWidth = Math.max(2, barStep - 3);

                          // Generate Normal Distribution Curve Path
                          let normalPathData = '';
                          if (showNormalCurve && stats.stdDev > 0) {
                            const pointsCount = 60;
                            const pathCoords: { x: number; y: number }[] = [];
                            const { min, max, mean, stdDev, count } = stats;
                            const range = max - min === 0 ? 1 : max - min;
                            const binWidthVal = range / numBins;

                            for (let i = 0; i <= pointsCount; i++) {
                              const xVal = min + (i / pointsCount) * range;
                              const z = (xVal - mean) / stdDev;
                              const normalPdf = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
                              const expectedFreq = normalPdf * count * binWidthVal;
                              const svgX = histPadding + (i / pointsCount) * plotWidth;
                              const svgY = histHeight - histPadding - (expectedFreq / maxCount) * plotHeight;
                              pathCoords.push({ x: svgX, y: Math.max(histPadding, svgY) });
                            }

                            normalPathData = pathCoords.reduce(
                              (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`,
                              ''
                            );
                          }

                          return (
                            <g>
                              {/* Horizontal Grid lines */}
                              {[0, 0.25, 0.5, 0.75, 1].map((pct, gIdx) => {
                                const y = histHeight - histPadding - pct * plotHeight;
                                const countLabel = Math.round(pct * maxCount);
                                return (
                                  <g key={`grid-${gIdx}`}>
                                    <line
                                      x1={histPadding}
                                      y1={y}
                                      x2={histWidth - histPadding}
                                      y2={y}
                                      stroke="currentColor"
                                      className="text-zinc-150 dark:text-zinc-850"
                                      strokeWidth="1"
                                      strokeDasharray="2 2"
                                    />
                                    <text
                                      x={histPadding - 8}
                                      y={y + 3}
                                      textAnchor="end"
                                      className="text-[9px] fill-zinc-400 font-mono"
                                    >
                                      {countLabel}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* Bars */}
                              {histogramData.map((bin, idx) => {
                                const barHeight = (bin.count / maxCount) * plotHeight;
                                const x = histPadding + idx * barStep + 1.5;
                                const y = histHeight - histPadding - barHeight;

                                return (
                                  <g
                                    key={`hist-bar-${idx}`}
                                    onMouseEnter={() => setHoveredBin(bin)}
                                    onMouseLeave={() => setHoveredBin(null)}
                                    className="cursor-pointer group"
                                  >
                                    <rect
                                      x={x}
                                      y={y}
                                      width={barWidth}
                                      height={Math.max(barHeight, 2)}
                                      className="fill-indigo-500/80 group-hover:fill-indigo-500 transition-colors"
                                      rx="3"
                                    />
                                    {bin.count > 0 && (
                                      <text
                                        x={x + barWidth / 2}
                                        y={y - 5}
                                        textAnchor="middle"
                                        className="text-[9px] fill-zinc-700 dark:fill-zinc-300 font-mono font-bold"
                                      >
                                        {bin.count}
                                      </text>
                                    )}
                                    {/* X-axis bin interval label */}
                                    <text
                                      x={x + barWidth / 2}
                                      y={histHeight - histPadding + 14}
                                      textAnchor="middle"
                                      className="text-[8px] fill-zinc-400 font-mono"
                                    >
                                      {bin.binStart.toFixed(1)}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* Normal Distribution Curve Line Overlay */}
                              {showNormalCurve && normalPathData && (
                                <path
                                  d={normalPathData}
                                  fill="none"
                                  stroke="#f59e0b"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              )}

                              {/* Baseline Axis */}
                              <line
                                x1={histPadding}
                                y1={histHeight - histPadding}
                                x2={histWidth - histPadding}
                                y2={histHeight - histPadding}
                                stroke="currentColor"
                                className="text-zinc-300 dark:text-zinc-700"
                                strokeWidth="1.5"
                              />
                            </g>
                          );
                        })()}
                      </svg>
                    </div>

                    {/* Active Hover Tooltip Card */}
                    {hoveredBin ? (
                      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-700 dark:text-indigo-300">
                            Bin #{hoveredBin.binIndex}:
                          </span>
                          <span className="text-zinc-700 dark:text-zinc-200">
                            [{hoveredBin.binStart.toFixed(2)} - {hoveredBin.binEnd.toFixed(2)}]
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-300">
                          <span>
                            Count: <strong className="text-zinc-900 dark:text-white">{hoveredBin.count}</strong>
                          </span>
                          <span>
                            Relative Freq: <strong>{hoveredBin.relativeFreq.toFixed(1)}%</strong>
                          </span>
                          <span>
                            Cumulative: <strong>{hoveredBin.cumulativePercent.toFixed(1)}%</strong>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-[11px] text-zinc-400 font-sans py-1">
                        Hover over any histogram bar to view interval bounds, frequencies, and cumulative percentiles.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FREQUENCY DISTRIBUTION TABLE */}
              {activeTab === 'frequency' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-500" />
                        Grouped Frequency Distribution Table
                      </h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Grouped class intervals, midpoints, absolute frequencies (f), relative (%), and cumulative sums.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase text-[10px]">
                          <th className="py-2.5 px-3">Bin #</th>
                          <th className="py-2.5 px-3">Interval [Start - End)</th>
                          <th className="py-2.5 px-3">Midpoint (xm)</th>
                          <th className="py-2.5 px-3">Frequency (f)</th>
                          <th className="py-2.5 px-3">Relative %</th>
                          <th className="py-2.5 px-3">Cumulative f</th>
                          <th className="py-2.5 px-3">Cumulative %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                        {histogramData.map((bin) => (
                          <tr
                            key={`freq-row-${bin.binIndex}`}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                          >
                            <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                              {bin.binIndex}
                            </td>
                            <td className="py-2.5 px-3 text-zinc-800 dark:text-zinc-200">
                              {bin.binStart.toFixed(2)} - {bin.binEnd.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                              {bin.midpoint.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-zinc-900 dark:text-zinc-100">
                              {bin.count}
                            </td>
                            <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                              {bin.relativeFreq.toFixed(1)}%
                            </td>
                            <td className="py-2.5 px-3 text-zinc-800 dark:text-zinc-200">
                              {bin.cumulativeCount}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
                              {bin.cumulativePercent.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-zinc-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-zinc-100">
                          <td className="py-2.5 px-3" colSpan={3}>
                            Total:
                          </td>
                          <td className="py-2.5 px-3">{stats.count}</td>
                          <td className="py-2.5 px-3">100.0%</td>
                          <td className="py-2.5 px-3">{stats.count}</td>
                          <td className="py-2.5 px-3">100.0%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: Z-SCORE & PERCENTILE LOOKUP PROBE */}
              {activeTab === 'zscore' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Value to Z-Score / Percentile Converter */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-indigo-500" />
                          Value → Z-Score &amp; Rank Explorer
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Enter any value X to calculate its standardized Z-Score (z = (x - μ) / σ) and sample rank.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                          Test Value (X):
                        </label>
                        <input
                          type="number"
                          value={probeValue}
                          onChange={(e) => setProbeValue(e.target.value)}
                          step="any"
                          className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none"
                        />
                      </div>

                      {probeAnalysis && (
                        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs font-mono">
                          <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-850">
                            <span className="text-zinc-500">Z-Score (z):</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              {probeAnalysis.zScore.toFixed(4)}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-850">
                            <span className="text-zinc-500">Normal CDF Percentile:</span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {probeAnalysis.normalPercentile.toFixed(2)}th %
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-850">
                            <span className="text-zinc-500">Empirical Sample Rank:</span>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {probeAnalysis.empiricalPercentile.toFixed(2)}th %
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-zinc-500">Outlier Status:</span>
                            <span
                              className={`font-bold ${
                                probeAnalysis.isExtremeOutlier
                                  ? 'text-rose-500'
                                  : probeAnalysis.isMildOutlier
                                  ? 'text-amber-500'
                                  : 'text-emerald-500'
                              }`}
                            >
                              {probeAnalysis.isExtremeOutlier
                                ? 'Extreme Outlier'
                                : probeAnalysis.isMildOutlier
                                ? 'Mild Outlier'
                                : 'Typical Value'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Percentile to Value Lookup */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                          <Percent className="w-4 h-4 text-purple-500" />
                          Percentile → Estimated Value Lookup
                        </h3>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Query any percentile P (0 to 100) to find the interpolated cutoff score in this dataset.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                          Percentile (P, 0-100%):
                        </label>
                        <input
                          type="number"
                          value={probePercentile}
                          onChange={(e) => setProbePercentile(e.target.value)}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none"
                        />
                      </div>

                      {probePercentileResult && (
                        <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-center">
                            <div className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold uppercase">
                              Value at {probePercentileResult.percentile}th Percentile
                            </div>
                            <div className="text-2xl font-bold font-mono text-purple-900 dark:text-purple-100 mt-1">
                              {probePercentileResult.value.toFixed(4)}
                            </div>
                          </div>

                          <p className="text-[11px] text-zinc-500 text-center font-sans">
                            {probePercentileResult.percentile}% of the observations in this dataset fall at or below this value.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SYNTHETIC DATA GENERATOR */}
              {activeTab === 'generator' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-500" />
                      Synthetic Statistical Data Generator
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Synthesize random samples from various probability distributions to test statistical hypotheses and charts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                        Distribution Type:
                      </label>
                      <select
                        value={genType}
                        onChange={(e) => setGenType(e.target.value as DistributionType)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/50 outline-none"
                      >
                        <option value="normal">Normal (Gaussian)</option>
                        <option value="uniform">Uniform</option>
                        <option value="exponential">Exponential (Right-Skewed)</option>
                        <option value="bimodal">Bimodal Mixture</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                        Sample Size (n):
                      </label>
                      <input
                        type="number"
                        value={genCount}
                        onChange={(e) => setGenCount(Math.max(5, Math.min(500, Number(e.target.value))))}
                        min={5}
                        max={500}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                        Target Mean (μ):
                      </label>
                      <input
                        type="number"
                        value={genMean}
                        onChange={(e) => setGenMean(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1">
                        Target Std Dev (σ):
                      </label>
                      <input
                        type="number"
                        value={genStdDev}
                        onChange={(e) => setGenStdDev(Math.max(0.1, Number(e.target.value)))}
                        step="any"
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={generateSyntheticData}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Dataset &amp; Load Into Calculator
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Educational Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            Sample (n - 1) vs Population (N)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            When analyzing a sample subset from a broader universe, <strong>Bessel&apos;s correction</strong> (n - 1) is applied to avoid underestimating the true population variance and standard deviation.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            Tukey&apos;s Outlier Fences
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Values outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR] are designated as mild outliers, while points beyond 3.0×IQR represent extreme anomalies.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-2">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-500" />
            Empirical Rule (68-95-99.7)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            In approximately normal bell-curve distributions, 68.27% of observations fall within ±1σ, 95.45% within ±2σ, and 99.73% within ±3σ of the mean.
          </p>
        </div>
      </div>
    </div>
  );
}

// Approximation of Student's t critical values for 95% Confidence Level (two-tailed)
function getTCritical95(df: number): number {
  const tTable: Record<number, number> = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
    16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
    21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
    26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042
  };
  return tTable[df] || 1.96;
}

// Approximation of Student's t critical values for 99% Confidence Level (two-tailed)
function getTCritical99(df: number): number {
  const tTable: Record<number, number> = {
    1: 63.657, 2: 9.925, 3: 5.841, 4: 4.604, 5: 4.032,
    6: 3.707, 7: 3.499, 8: 3.355, 9: 3.250, 10: 3.169,
    11: 3.106, 12: 3.055, 13: 3.012, 14: 2.977, 15: 2.947,
    16: 2.921, 17: 2.898, 18: 2.878, 19: 2.861, 20: 2.845,
    21: 2.831, 22: 2.819, 23: 2.807, 24: 2.797, 25: 2.787,
    26: 2.779, 27: 2.771, 28: 2.763, 29: 2.756, 30: 2.750
  };
  return tTable[df] || 2.576;
}

// Standard normal cumulative distribution function approximation (Abramowitz and Stegun)
function normalCDF(z: number): number {
  const p = 0.2316419;
  const b1 = 0.31938153;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;

  const t = 1.0 / (1.0 + p * Math.abs(z));
  const expTerm = Math.exp((-z * z) / 2.0) / Math.sqrt(2.0 * Math.PI);
  const cdf = 1.0 - expTerm * (b1 * t + b2 * t * t + b3 * Math.pow(t, 3) + b4 * Math.pow(t, 4) + b5 * Math.pow(t, 5));

  return z >= 0 ? cdf : 1.0 - cdf;
}
