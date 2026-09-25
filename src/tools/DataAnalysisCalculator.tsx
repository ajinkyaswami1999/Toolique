/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useRef } from 'react';
import {
  TrendingUp,
  BarChart2,
  Table as TableIcon,
  Upload,
  Download,
  Copy,
  Sparkles,
  Info,
  Sliders,
  Filter,
  Layers,
  AlertTriangle,
  Zap,
  FileSpreadsheet,
  Activity
} from 'lucide-react';

// --- Type Definitions ---
export type ActiveTab = 'regression' | 'descriptive' | 'outliers' | 'correlation' | 'predictor' | 'grid';
export type RegressionModelType = 'linear' | 'quadratic' | 'cubic' | 'exponential' | 'power' | 'logarithmic';
export type OutlierMethod = 'iqr' | 'zscore' | 'both';
export type MissingValueStrategy = 'drop' | 'mean' | 'median' | 'zero';

export interface DataPoint2D {
  x: number;
  y: number;
  rowIndex: number;
  label?: string;
  isOutlier?: boolean;
}

export interface RegressionFitResult {
  modelType: RegressionModelType;
  modelName: string;
  formula: string;
  formulaLatex: string;
  r: number;
  r2: number;
  adjR2: number;
  rmse: number;
  mae: number;
  slope?: number;
  intercept?: number;
  coefficients: number[];
  predict: (x: number) => number;
  inversePredict?: (y: number) => number | null;
  seSlope?: number;
  seIntercept?: number;
  tStat?: number;
  pValue?: number;
  fStat?: number;
  seEstimate?: number;
  ssTot?: number;
  ssReg?: number;
  ssRes?: number;
  dfReg?: number;
  dfRes?: number;
  isValid: boolean;
  errorMessage?: string;
}

export interface DescriptiveStats {
  column: string;
  count: number;
  validCount: number;
  missingCount: number;
  sum: number;
  sumSquares: number;
  mean: number;
  geomMean: number | null;
  harmonicMean: number | null;
  trimmedMean: number;
  median: number;
  modes: number[];
  min: number;
  max: number;
  range: number;
  variance: number;
  stdDev: number;
  popVariance: number;
  popStdDev: number;
  stdError: number;
  q1: number;
  q2: number;
  q3: number;
  iqr: number;
  p10: number;
  p90: number;
  skewness: number;
  kurtosis: number;
  mad: number;
  cv: number;
  ci95Lower: number;
  ci95Upper: number;
  ci99Lower: number;
  ci99Upper: number;
  outliersIqr: number[];
  outliersZscore: number[];
  sortedValues: number[];
}

export interface OutlierRowDetail {
  rowIndex: number;
  xVal: number;
  yVal: number;
  xZScore: number;
  yZScore: number;
  xIsIqr: boolean;
  yIsIqr: boolean;
  xIsZ: boolean;
  yIsZ: boolean;
  severity: 'Mild' | 'Severe' | 'Normal';
}

// --- Sample Datasets ---
const PRESET_DATASETS: { id: string; name: string; category: string; description: string; csv: string; colX?: string; colY?: string }[] = [
  {
    id: 'study_exam',
    name: 'Study Hours vs Exam Score',
    category: 'Education',
    description: 'Strong positive linear correlation between preparation hours and final test marks.',
    colX: 'Hours_Studied',
    colY: 'Exam_Score',
    csv: `Hours_Studied, Exam_Score, Sleep_Hours
1.5, 52, 8.0
2.0, 56, 7.5
3.0, 64, 7.0
3.5, 68, 7.5
4.0, 72, 6.5
4.5, 76, 7.0
5.0, 81, 6.0
5.5, 83, 6.5
6.0, 88, 6.0
7.0, 93, 5.5
7.5, 95, 5.0
8.5, 98, 5.5`
  },
  {
    id: 'house_prices',
    name: 'Real Estate Size vs Price',
    category: 'Economics',
    description: 'Living area (sq.ft) and bedrooms vs property sales price (in ₹ Lakhs).',
    colX: 'Area_SqFt',
    colY: 'Price_Lakhs',
    csv: `Area_SqFt, Price_Lakhs, Bedrooms, Age_Years
650, 42.5, 1, 5
850, 55.0, 2, 4
950, 63.0, 2, 6
1100, 75.2, 2, 3
1250, 84.0, 3, 2
1400, 92.5, 3, 5
1600, 108.0, 3, 1
1850, 126.0, 4, 3
2100, 142.5, 4, 2
2400, 165.0, 4, 1`
  },
  {
    id: 'temp_icecream_outliers',
    name: 'Temperature vs Sales (With Outliers)',
    category: 'Anomaly Testing',
    description: 'Daily ambient temperature (°C) vs ice cream shop revenue, featuring 2 distinct anomalies to test outlier detection.',
    colX: 'Temperature_C',
    colY: 'IceCream_Sales',
    csv: `Temperature_C, IceCream_Sales, Foot_Traffic
14.2, 215, 450
16.4, 325, 520
18.1, 410, 600
20.5, 530, 710
22.8, 620, 840
24.0, 180, 250
26.5, 780, 960
28.2, 850, 1020
30.4, 940, 1150
32.1, 1020, 1240
34.5, 1110, 1310
36.0, 1950, 2400`
  },
  {
    id: 'ad_revenue',
    name: 'Marketing Ad Spend vs Revenue',
    category: 'Business',
    description: 'Digital advertising budget ($k) vs sales revenue ($k) with diminishing returns.',
    colX: 'Ad_Spend_k',
    colY: 'Revenue_k',
    csv: `Ad_Spend_k, Revenue_k, Clicks_k
10, 45, 12
20, 85, 24
30, 120, 35
40, 150, 46
50, 175, 55
60, 195, 63
70, 210, 70
80, 222, 76
90, 230, 80
100, 236, 83`
  },
  {
    id: 'bacterial_growth',
    name: 'Bacterial Colony Growth',
    category: 'Biology',
    description: 'Time elapsed (hours) vs microbial cell count demonstrating exponential kinetics (y = a * e^(bx)).',
    colX: 'Time_Hours',
    colY: 'Cell_Count',
    csv: `Time_Hours, Cell_Count
1, 150
2, 280
3, 560
4, 1100
5, 2250
6, 4400
7, 8900
8, 17500`
  },
  {
    id: 'sensor_telemetry',
    name: 'Industrial Sensor Matrix',
    category: 'Engineering',
    description: 'Multi-variable machine telemetry with Temperature, Pressure, Vibration, and Defect Rate for correlation matrix testing.',
    colX: 'Temperature',
    colY: 'Defect_Rate',
    csv: `Temperature, Pressure, Vibration, Defect_Rate
65.2, 101.3, 0.42, 1.2
68.1, 102.1, 0.45, 1.4
72.4, 104.5, 0.58, 2.1
75.0, 105.2, 0.62, 2.8
78.6, 108.0, 0.74, 3.9
82.3, 111.4, 0.89, 5.2
85.1, 114.2, 1.05, 6.8
89.5, 118.0, 1.24, 8.9`
  }
];

// --- Math & Statistical Helper Algorithms ---

function solveLinearSystem(A: number[][], B: number[]): number[] | null {
  const n = B.length;
  const M: number[][] = A.map((row, i) => [...row, B[i]]);

  for (let i = 0; i < n; i++) {
    let maxEl = Math.abs(M[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > maxEl) {
        maxEl = Math.abs(M[k][i]);
        maxRow = k;
      }
    }

    for (let k = i; k < n + 1; k++) {
      const tmp = M[maxRow][k];
      M[maxRow][k] = M[i][k];
      M[i][k] = tmp;
    }

    if (Math.abs(M[i][i]) < 1e-12) return null;

    for (let k = i + 1; k < n; k++) {
      const c = -M[k][i] / M[i][i];
      for (let j = i; j < n + 1; j++) {
        if (i === j) {
          M[k][j] = 0;
        } else {
          M[k][j] += c * M[i][j];
        }
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = M[i][n] / M[i][i];
    for (let k = i - 1; k >= 0; k--) {
      M[k][n] -= M[k][i] * x[i];
    }
  }
  return x;
}

function getTCritical(df: number, alpha = 0.05): number {
  if (df <= 0) return 1.96;
  if (alpha === 0.01) {
    if (df === 1) return 63.66;
    if (df === 2) return 9.925;
    if (df === 3) return 5.841;
    if (df === 4) return 4.604;
    if (df === 5) return 4.032;
    if (df === 10) return 3.169;
    if (df === 20) return 2.845;
    if (df === 30) return 2.750;
    if (df > 120) return 2.576;
    return 2.576 + 2.0 / df;
  }
  if (df === 1) return 12.706;
  if (df === 2) return 4.303;
  if (df === 3) return 3.182;
  if (df === 4) return 2.776;
  if (df === 5) return 2.571;
  if (df === 6) return 2.447;
  if (df === 7) return 2.365;
  if (df === 8) return 2.306;
  if (df === 9) return 2.262;
  if (df === 10) return 2.228;
  if (df === 15) return 2.131;
  if (df === 20) return 2.086;
  if (df === 30) return 2.042;
  if (df === 60) return 2.000;
  if (df > 120) return 1.960;
  return 1.96 + 1.25 / df;
}

function getPValueFromT(t: number, df: number): number {
  const absT = Math.abs(t);
  if (isNaN(absT) || df <= 0) return 1;
  const z = absT;
  if (df > 30) {
    const p = 1 - 0.5 * (1 + Math.sign(z) * Math.sqrt(1 - Math.exp(-2 * z * z / Math.PI)));
    return Math.max(0.00001, Math.min(1, 2 * p));
  }
  const x = df / (df + z * z);
  const p = 0.5 * Math.pow(x, df / 2);
  return Math.max(0.00001, Math.min(1, 2 * p));
}

function getPercentile(sorted: number[], p: number): number {
  const n = sorted.length;
  if (n === 0) return 0;
  if (n === 1) return sorted[0];
  const idx = (n - 1) * p;
  const base = Math.floor(idx);
  const rest = idx - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

function computeColumnStatistics(values: number[], colName: string): DescriptiveStats {
  const count = values.length;
  const valid = values.filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v));
  const validCount = valid.length;
  const missingCount = count - validCount;

  if (validCount === 0) {
    return {
      column: colName,
      count,
      validCount: 0,
      missingCount,
      sum: 0,
      sumSquares: 0,
      mean: 0,
      geomMean: null,
      harmonicMean: null,
      trimmedMean: 0,
      median: 0,
      modes: [],
      min: 0,
      max: 0,
      range: 0,
      variance: 0,
      stdDev: 0,
      popVariance: 0,
      popStdDev: 0,
      stdError: 0,
      q1: 0,
      q2: 0,
      q3: 0,
      iqr: 0,
      p10: 0,
      p90: 0,
      skewness: 0,
      kurtosis: 0,
      mad: 0,
      cv: 0,
      ci95Lower: 0,
      ci95Upper: 0,
      ci99Lower: 0,
      ci99Upper: 0,
      outliersIqr: [],
      outliersZscore: [],
      sortedValues: []
    };
  }

  const sorted = [...valid].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / validCount;
  const sumSquares = sorted.reduce((acc, curr) => acc + curr * curr, 0);

  const allPositive = sorted.every(v => v > 0);
  const geomMean = allPositive
    ? Math.exp(sorted.reduce((acc, v) => acc + Math.log(v), 0) / validCount)
    : null;

  const harmonicMean = allPositive
    ? validCount / sorted.reduce((acc, v) => acc + 1 / v, 0)
    : null;

  const median = getPercentile(sorted, 0.5);
  const q1 = getPercentile(sorted, 0.25);
  const q2 = median;
  const q3 = getPercentile(sorted, 0.75);
  const iqr = q3 - q1;
  const p10 = getPercentile(sorted, 0.1);
  const p90 = getPercentile(sorted, 0.9);

  const trimCount = Math.floor(validCount * 0.05);
  const trimmed = sorted.slice(trimCount, validCount - trimCount);
  const trimmedMean = trimmed.reduce((a, b) => a + b, 0) / (trimmed.length || 1);

  const freqMap: Record<number, number> = {};
  let maxFreq = 0;
  sorted.forEach(v => {
    const rounded = Number(v.toFixed(4));
    freqMap[rounded] = (freqMap[rounded] || 0) + 1;
    if (freqMap[rounded] > maxFreq) maxFreq = freqMap[rounded];
  });
  let modes: number[] = [];
  if (maxFreq > 1) {
    modes = Object.keys(freqMap)
      .filter(k => freqMap[Number(k)] === maxFreq)
      .map(Number);
  }

  const sqDiffSum = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const variance = validCount > 1 ? sqDiffSum / (validCount - 1) : 0;
  const stdDev = Math.sqrt(variance);
  const popVariance = sqDiffSum / validCount;
  const popStdDev = Math.sqrt(popVariance);
  const stdError = validCount > 0 ? stdDev / Math.sqrt(validCount) : 0;

  const mad = sorted.reduce((acc, v) => acc + Math.abs(v - mean), 0) / validCount;
  const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0;

  let skewness = 0;
  let kurtosis = 0;
  if (validCount > 2 && stdDev > 1e-9) {
    const m3 = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 3), 0) / validCount;
    const m4 = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 4), 0) / validCount;
    const s3 = Math.pow(popStdDev, 3);
    const s4 = Math.pow(popStdDev, 4);
    skewness = (validCount * Math.sqrt(validCount - 1) / (validCount - 2)) * (m3 / s3);
    kurtosis = ((validCount - 1) / ((validCount - 2) * (validCount - 3))) *
      ((validCount + 1) * (m4 / s4) - 3 * (validCount - 1));
  }

  const df = validCount - 1;
  const t95 = getTCritical(df, 0.05);
  const t99 = getTCritical(df, 0.01);
  const ci95Lower = mean - t95 * stdError;
  const ci95Upper = mean + t95 * stdError;
  const ci99Lower = mean - t99 * stdError;
  const ci99Upper = mean + t99 * stdError;

  const iqrLowerFence = q1 - 1.5 * iqr;
  const iqrUpperFence = q3 + 1.5 * iqr;
  const outliersIqr = sorted.filter(v => v < iqrLowerFence || v > iqrUpperFence);

  const outliersZscore = stdDev > 1e-9
    ? sorted.filter(v => Math.abs((v - mean) / stdDev) > 2.5)
    : [];

  return {
    column: colName,
    count,
    validCount,
    missingCount,
    sum,
    sumSquares,
    mean,
    geomMean,
    harmonicMean,
    trimmedMean,
    median,
    modes,
    min: sorted[0],
    max: sorted[validCount - 1],
    range: sorted[validCount - 1] - sorted[0],
    variance,
    stdDev,
    popVariance,
    popStdDev,
    stdError,
    q1,
    q2,
    q3,
    iqr,
    p10,
    p90,
    skewness,
    kurtosis,
    mad,
    cv,
    ci95Lower,
    ci95Upper,
    ci99Lower,
    ci99Upper,
    outliersIqr,
    outliersZscore,
    sortedValues: sorted
  };
}

function computeLinearRegressionFit(points: { x: number; y: number }[], prec = 4): RegressionFitResult {
  const n = points.length;
  if (n < 2) {
    return {
      modelType: 'linear',
      modelName: 'Linear Fit',
      formula: 'Insufficient Data',
      formulaLatex: '\\text{N/A}',
      r: 0,
      r2: 0,
      adjR2: 0,
      rmse: 0,
      mae: 0,
      coefficients: [],
      predict: () => 0,
      isValid: false,
      errorMessage: 'At least 2 data points required for linear regression.'
    };
  }

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
  for (let i = 0; i < n; i++) {
    const { x, y } = points[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
    sumYY += y * y;
  }

  const denomX = n * sumXX - sumX * sumX;
  if (Math.abs(denomX) < 1e-12) {
    return {
      modelType: 'linear',
      modelName: 'Linear Fit',
      formula: 'x = constant (Vertical line)',
      formulaLatex: 'x = c',
      r: 0,
      r2: 0,
      adjR2: 0,
      rmse: 0,
      mae: 0,
      coefficients: [],
      predict: () => sumY / n,
      isValid: false,
      errorMessage: 'Zero variance in independent variable X.'
    };
  }

  const slope = (n * sumXY - sumX * sumY) / denomX;
  const intercept = (sumY - slope * sumX) / n;

  const denomY = n * sumYY - sumY * sumY;
  const r = denomY > 0 ? (n * sumXY - sumX * sumY) / Math.sqrt(denomX * denomY) : 0;
  const r2 = r * r;
  const adjR2 = n > 2 ? 1 - ((1 - r2) * (n - 1)) / (n - 2) : r2;

  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;
  let absErrorSum = 0;

  for (let i = 0; i < n; i++) {
    const { x, y } = points[i];
    const yHat = slope * x + intercept;
    const residual = y - yHat;
    ssTot += Math.pow(y - meanY, 2);
    ssRes += residual * residual;
    absErrorSum += Math.abs(residual);
  }

  const ssReg = ssTot - ssRes;
  const rmse = Math.sqrt(ssRes / n);
  const mae = absErrorSum / n;
  const dfRes = n - 2;
  const seEstimate = dfRes > 0 ? Math.sqrt(ssRes / dfRes) : 0;

  const sxx = sumXX - (sumX * sumX) / n;
  const seSlope = sxx > 0 && seEstimate > 0 ? seEstimate / Math.sqrt(sxx) : 0;
  const seIntercept = seEstimate > 0 ? seEstimate * Math.sqrt(1 / n + (sumX / n) * (sumX / n) / (sxx || 1)) : 0;

  const tStat = seSlope > 0 ? slope / seSlope : 0;
  const pValue = getPValueFromT(tStat, dfRes);
  const fStat = dfRes > 0 && ssRes > 0 ? (ssReg / 1) / (ssRes / dfRes) : 0;

  const sign = intercept >= 0 ? '+' : '-';
  const formula = `y = ${slope.toFixed(prec)}x ${sign} ${Math.abs(intercept).toFixed(prec)}`;
  const formulaLatex = `y = ${slope.toFixed(prec)}x ${sign} ${Math.abs(intercept).toFixed(prec)}`;

  const predict = (xVal: number) => slope * xVal + intercept;
  const inversePredict = (yVal: number) => Math.abs(slope) > 1e-12 ? (yVal - intercept) / slope : null;

  return {
    modelType: 'linear',
    modelName: 'Linear Model',
    formula,
    formulaLatex,
    r,
    r2,
    adjR2,
    rmse,
    mae,
    slope,
    intercept,
    coefficients: [intercept, slope],
    predict,
    inversePredict,
    seSlope,
    seIntercept,
    tStat,
    pValue,
    fStat,
    seEstimate,
    ssTot,
    ssReg,
    ssRes,
    dfReg: 1,
    dfRes,
    isValid: true
  };
}

function computePolynomialRegressionFit(points: { x: number; y: number }[], degree: 2 | 3, prec = 4): RegressionFitResult {
  const n = points.length;
  const reqPoints = degree + 1;
  const name = degree === 2 ? 'Quadratic (Degree 2)' : 'Cubic (Degree 3)';
  const modelType: RegressionModelType = degree === 2 ? 'quadratic' : 'cubic';

  if (n < reqPoints) {
    return {
      modelType,
      modelName: name,
      formula: `Requires ≥ ${reqPoints} data points`,
      formulaLatex: '\\text{N/A}',
      r: 0,
      r2: 0,
      adjR2: 0,
      rmse: 0,
      mae: 0,
      coefficients: [],
      predict: () => 0,
      isValid: false,
      errorMessage: `At least ${reqPoints} distinct data points required.`
    };
  }

  const m = degree + 1;
  const A: number[][] = Array(m).fill(0).map(() => Array(m).fill(0));
  const B: number[] = Array(m).fill(0);

  const sumXPow: number[] = Array(2 * degree + 1).fill(0);
  for (let k = 0; k <= 2 * degree; k++) {
    sumXPow[k] = points.reduce((acc, p) => acc + Math.pow(p.x, k), 0);
  }

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      A[i][j] = sumXPow[i + j];
    }
    B[i] = points.reduce((acc, p) => acc + Math.pow(p.x, i) * p.y, 0);
  }

  const coeffs = solveLinearSystem(A, B);
  if (!coeffs) {
    return {
      modelType,
      modelName: name,
      formula: 'Singular Matrix (Collinear Data)',
      formulaLatex: '\\text{N/A}',
      r: 0,
      r2: 0,
      adjR2: 0,
      rmse: 0,
      mae: 0,
      coefficients: [],
      predict: () => 0,
      isValid: false,
      errorMessage: 'Could not solve polynomial system (singular matrix).'
    };
  }

  const predict = (xVal: number) => {
    return coeffs.reduce((acc, c, idx) => acc + c * Math.pow(xVal, idx), 0);
  };

  const meanY = points.reduce((acc, p) => acc + p.y, 0) / n;
  let ssTot = 0;
  let ssRes = 0;
  let absErrorSum = 0;

  for (let i = 0; i < n; i++) {
    const { x, y } = points[i];
    const yHat = predict(x);
    const residual = y - yHat;
    ssTot += Math.pow(y - meanY, 2);
    ssRes += residual * residual;
    absErrorSum += Math.abs(residual);
  }

  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  const adjR2 = n > m ? 1 - ((1 - r2) * (n - 1)) / (n - m) : r2;
  const r = Math.sqrt(Math.max(0, r2));
  const rmse = Math.sqrt(ssRes / n);
  const mae = absErrorSum / n;

  let formula = 'y = ';
  let formulaLatex = 'y = ';
  for (let i: number = degree; i >= 0; i--) {
    const c = coeffs[i];
    const absC = Math.abs(c).toFixed(prec);
    const sign = c >= 0 ? (i === degree ? '' : '+ ') : '- ';
    if (i === 0) {
      formula += `${sign}${absC}`;
      formulaLatex += `${sign}${absC}`;
    } else if (i === 1) {
      formula += `${sign}${absC}x `;
      formulaLatex += `${sign}${absC}x `;
    } else {
      formula += `${sign}${absC}x^${i} `;
      formulaLatex += `${sign}${absC}x^{${i}} `;
    }
  }

  return {
    modelType,
    modelName: name,
    formula: formula.trim(),
    formulaLatex: formulaLatex.trim(),
    r,
    r2,
    adjR2,
    rmse,
    mae,
    coefficients: coeffs,
    predict,
    ssTot,
    ssReg: ssTot - ssRes,
    ssRes,
    dfReg: degree,
    dfRes: n - m,
    isValid: true
  };
}

function computeExponentialRegressionFit(points: { x: number; y: number }[], prec = 4): RegressionFitResult {
  const n = points.length;
  const validPoints = points.filter(p => p.y > 0);

  if (validPoints.length < 2 || validPoints.length < n * 0.8) {
    return {
      modelType: 'exponential',
      modelName: 'Exponential Fit (y = a·e^(bx))',
      formula: 'Requires strictly positive Y values (Y > 0)',
      formulaLatex: '\\text{N/A}',
      r: 0,
      r2: 0,
      adjR2: 0,
      rmse: 0,
      mae: 0,
      coefficients: [],
      predict: () => 0,
      isValid: false,
      errorMessage: 'Exponential regression requires positive Y values.'
    };
  }

  const transformed = validPoints.map(p => ({ x: p.x, y: Math.log(p.y) }));
  const lin = computeLinearRegressionFit(transformed);

  if (!lin.isValid || lin.slope === undefined || lin.intercept === undefined) {
    return {
      modelType: 'exponential',
      modelName: 'Exponential Fit',
      formula: 'Calculation Error',
      formulaLatex: '\\text{N/A}',
      r: 0,
      r2: 0,
      adjR2: 0,
      rmse: 0,
      mae: 0,
      coefficients: [],
      predict: () => 0,
      isValid: false,
      errorMessage: 'Failed fitting transformed data.'
    };
  }

  const b = lin.slope;
  const a = Math.exp(lin.intercept);
  const predict = (xVal: number) => a * Math.exp(b * xVal);
  const inversePredict = (yVal: number) => {
    if (yVal <= 0 || a <= 0 || Math.abs(b) < 1e-12) return null;
    return Math.log(yVal / a) / b;
  };

  const meanY = validPoints.reduce((acc, p) => acc + p.y, 0) / validPoints.length;
  let ssTot = 0;
  let ssRes = 0;
  let absErrorSum = 0;

  for (let i = 0; i < validPoints.length; i++) {
    const { x, y } = validPoints[i];
    const yHat = predict(x);
    const residual = y - yHat;
    ssTot += Math.pow(y - meanY, 2);
    ssRes += residual * residual;
    absErrorSum += Math.abs(residual);
  }

  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  const adjR2 = validPoints.length > 2 ? 1 - ((1 - r2) * (validPoints.length - 1)) / (validPoints.length - 2) : r2;
  const r = Math.sqrt(Math.max(0, r2));
  const rmse = Math.sqrt(ssRes / validPoints.length);
  const mae = absErrorSum / validPoints.length;

  const formula = `y = ${a.toFixed(prec)} · e^(${b.toFixed(prec)}x)`;
  const formulaLatex = `y = ${a.toFixed(prec)} \\cdot e^{${b.toFixed(prec)}x}`;

  return {
    modelType: 'exponential',
    modelName: 'Exponential Fit (y = a·e^(bx))',
    formula,
    formulaLatex,
    r,
    r2,
    adjR2,
    rmse,
    mae,
    coefficients: [a, b],
    predict,
    inversePredict,
    ssTot,
    ssReg: ssTot - ssRes,
    ssRes,
    dfReg: 1,
    dfRes: validPoints.length - 2,
    isValid: true
  };
}

function computePowerRegressionFit(points: { x: number; y: number }[], prec = 4): RegressionFitResult {
  const n = points.length;
  const validPoints = points.filter(p => p.x > 0 && p.y > 0);

  if (validPoints.length < 2 || validPoints.length < n * 0.8) {
    return {
      modelType: 'power',
      modelName: 'Power Law Fit (y = a·x^b)',
      formula: 'Requires strictly positive X & Y values (X > 0, Y > 0)',
      formulaLatex: '\\text{N/A}',
      r: 0,
      r2: 0,
      adjR2: 0,
      rmse: 0,
      mae: 0,
      coefficients: [],
      predict: () => 0,
      isValid: false,
      errorMessage: 'Power law regression requires positive X and Y values.'
    };
  }

  const transformed = validPoints.map(p => ({ x: Math.log(p.x), y: Math.log(p.y) }));
  const lin = computeLinearRegressionFit(transformed);

  if (!lin.isValid || lin.slope === undefined || lin.intercept === undefined) {
    return {
      modelType: 'power',
      modelName: 'Power Law Fit',
      formula: 'Calculation Error',
      formulaLatex: '\\text{N/A}',
      r: 0,
      r2: 0,
      adjR2: 0,
      rmse: 0,
      mae: 0,
      coefficients: [],
      predict: () => 0,
      isValid: false,
      errorMessage: 'Failed to fit log-log transformation.'
    };
  }

  const b = lin.slope;
  const a = Math.exp(lin.intercept);
  const predict = (xVal: number) => xVal > 0 ? a * Math.pow(xVal, b) : 0;
  const inversePredict = (yVal: number) => {
    if (yVal <= 0 || a <= 0 || Math.abs(b) < 1e-12) return null;
    return Math.pow(yVal / a, 1 / b);
  };

  const meanY = validPoints.reduce((acc, p) => acc + p.y, 0) / validPoints.length;
  let ssTot = 0;
  let ssRes = 0;
  let absErrorSum = 0;

  for (let i = 0; i < validPoints.length; i++) {
    const { x, y } = validPoints[i];
    const yHat = predict(x);
    const residual = y - yHat;
    ssTot += Math.pow(y - meanY, 2);
    ssRes += residual * residual;
    absErrorSum += Math.abs(residual);
  }

  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  const adjR2 = validPoints.length > 2 ? 1 - ((1 - r2) * (validPoints.length - 1)) / (validPoints.length - 2) : r2;
  const r = Math.sqrt(Math.max(0, r2));
  const rmse = Math.sqrt(ssRes / validPoints.length);
  const mae = absErrorSum / validPoints.length;

  const formula = `y = ${a.toFixed(prec)} · x^(${b.toFixed(prec)})`;
  const formulaLatex = `y = ${a.toFixed(prec)} \\cdot x^{${b.toFixed(prec)}}`;

  return {
    modelType: 'power',
    modelName: 'Power Law Fit (y = a·x^b)',
    formula,
    formulaLatex,
    r,
    r2,
    adjR2,
    rmse,
    mae,
    coefficients: [a, b],
    predict,
    inversePredict,
    ssTot,
    ssReg: ssTot - ssRes,
    ssRes,
    dfReg: 1,
    dfRes: validPoints.length - 2,
    isValid: true
  };
}

function computeLogarithmicRegressionFit(points: { x: number; y: number }[], prec = 4): RegressionFitResult {
  const n = points.length;
  const validPoints = points.filter(p => p.x > 0);

  if (validPoints.length < 2 || validPoints.length < n * 0.8) {
    return {
      modelType: 'logarithmic',
      modelName: 'Logarithmic Fit (y = a·ln(x) + b)',
      formula: 'Requires strictly positive X values (X > 0)',
      formulaLatex: '\\text{N/A}',
      r: 0,
      r2: 0,
      adjR2: 0,
      rmse: 0,
      mae: 0,
      coefficients: [],
      predict: () => 0,
      isValid: false,
      errorMessage: 'Logarithmic regression requires strictly positive X values.'
    };
  }

  const transformed = validPoints.map(p => ({ x: Math.log(p.x), y: p.y }));
  const lin = computeLinearRegressionFit(transformed);

  if (!lin.isValid || lin.slope === undefined || lin.intercept === undefined) {
    return {
      modelType: 'logarithmic',
      modelName: 'Logarithmic Fit',
      formula: 'Calculation Error',
      formulaLatex: '\\text{N/A}',
      r: 0,
      r2: 0,
      adjR2: 0,
      rmse: 0,
      mae: 0,
      coefficients: [],
      predict: () => 0,
      isValid: false,
      errorMessage: 'Failed to fit semi-log transformation.'
    };
  }

  const a = lin.slope;
  const b = lin.intercept;
  const predict = (xVal: number) => xVal > 0 ? a * Math.log(xVal) + b : 0;
  const inversePredict = (yVal: number) => {
    if (Math.abs(a) < 1e-12) return null;
    return Math.exp((yVal - b) / a);
  };

  const meanY = validPoints.reduce((acc, p) => acc + p.y, 0) / validPoints.length;
  let ssTot = 0;
  let ssRes = 0;
  let absErrorSum = 0;

  for (let i = 0; i < validPoints.length; i++) {
    const { x, y } = validPoints[i];
    const yHat = predict(x);
    const residual = y - yHat;
    ssTot += Math.pow(y - meanY, 2);
    ssRes += residual * residual;
    absErrorSum += Math.abs(residual);
  }

  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  const adjR2 = validPoints.length > 2 ? 1 - ((1 - r2) * (validPoints.length - 1)) / (validPoints.length - 2) : r2;
  const r = Math.sqrt(Math.max(0, r2));
  const rmse = Math.sqrt(ssRes / validPoints.length);
  const mae = absErrorSum / validPoints.length;

  const sign = b >= 0 ? '+' : '-';
  const formula = `y = ${a.toFixed(prec)} · ln(x) ${sign} ${Math.abs(b).toFixed(prec)}`;
  const formulaLatex = `y = ${a.toFixed(prec)} \\cdot \\ln(x) ${sign} ${Math.abs(b).toFixed(prec)}`;

  return {
    modelType: 'logarithmic',
    modelName: 'Logarithmic Fit (y = a·ln(x) + b)',
    formula,
    formulaLatex,
    r,
    r2,
    adjR2,
    rmse,
    mae,
    coefficients: [b, a],
    predict,
    inversePredict,
    ssTot,
    ssReg: ssTot - ssRes,
    ssRes,
    dfReg: 1,
    dfRes: validPoints.length - 2,
    isValid: true
  };
}

function evaluateAllRegressionModels(points: { x: number; y: number }[], prec = 4): RegressionFitResult[] {
  return [
    computeLinearRegressionFit(points, prec),
    computePolynomialRegressionFit(points, 2, prec),
    computePolynomialRegressionFit(points, 3, prec),
    computeExponentialRegressionFit(points, prec),
    computePowerRegressionFit(points, prec),
    computeLogarithmicRegressionFit(points, prec)
  ];
}

export default function DataAnalysisCalculator() {
  // State Management
  const [activeTab, setActiveTab] = useState<ActiveTab>('regression');
  const [csvText, setCsvText] = useState<string>(PRESET_DATASETS[0].csv);
  const [colX, setColX] = useState<string>('Hours_Studied');
  const [colY, setColY] = useState<string>('Exam_Score');
  const [selectedColStats, setSelectedColStats] = useState<string>('Hours_Studied');
  const [selectedModel, setSelectedModel] = useState<RegressionModelType>('linear');
  const [outlierMethod, setOutlierMethod] = useState<OutlierMethod>('iqr');
  const [excludeOutliers, setExcludeOutliers] = useState<boolean>(false);
  const [missingStrategy, setMissingStrategy] = useState<MissingValueStrategy>('drop');
  const [precision, setPrecision] = useState<number>(3);
  
  // Predictor Inputs
  const [predictInputX, setPredictInputX] = useState<string>('6.5');
  const [predictInputY, setPredictInputY] = useState<string>('85');

  // Interactive Chart Options
  const [showConfidenceBand, setShowConfidenceBand] = useState<boolean>(true);
  const [showResidualStems, setShowResidualStems] = useState<boolean>(false);
  const [showOutlierGlow, setShowOutlierGlow] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint2D | null>(null);

  // Copy & Action Feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- CSV Parser ---
  const parsedDataset = useMemo(() => {
    const rawLines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    if (rawLines.length === 0) return null;

    const headerLine = rawLines[0];
    let sep = ',';
    if (headerLine.includes('\t')) sep = '\t';
    else if (headerLine.includes(';') && !headerLine.includes(',')) sep = ';';
    else if (headerLine.includes('|')) sep = '|';

    const rawHeaders = headerLine.split(sep).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const headers = rawHeaders.map((h, i) => h || `Col_${i + 1}`);

    const rawRows: Record<string, string>[] = [];
    const numericColumns: Set<string> = new Set(headers);

    for (let i = 1; i < rawLines.length; i++) {
      const parts = rawLines[i].split(sep).map(p => p.trim().replace(/^["']|["']$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        const valStr = parts[idx] ?? '';
        row[h] = valStr;
        if (valStr !== '') {
          const cleanVal = valStr.replace(/[$€₹£%,]/g, '');
          const num = parseFloat(cleanVal);
          if (isNaN(num)) {
            numericColumns.delete(h);
          }
        }
      });
      rawRows.push(row);
    }

    const numericHeaders = headers.filter(h => numericColumns.has(h));

    const parsedRows: Record<string, number | null>[] = [];
    rawRows.forEach(row => {
      const numRow: Record<string, number | null> = {};
      headers.forEach(h => {
        const rawVal = row[h];
        if (rawVal === undefined || rawVal === '') {
          numRow[h] = null;
        } else {
          const cleanVal = rawVal.replace(/[$€₹£%,]/g, '');
          const val = parseFloat(cleanVal);
          numRow[h] = isNaN(val) ? null : val;
        }
      });
      parsedRows.push(numRow);
    });

    return {
      headers,
      numericHeaders,
      rawRows,
      parsedRows,
      totalRows: rawRows.length
    };
  }, [csvText]);

  // Synchronize column selectors
  React.useEffect(() => {
    if (parsedDataset && parsedDataset.numericHeaders.length >= 2) {
      if (!parsedDataset.numericHeaders.includes(colX)) {
        setColX(parsedDataset.numericHeaders[0]);
      }
      if (!parsedDataset.numericHeaders.includes(colY) || colY === parsedDataset.numericHeaders[0]) {
        setColY(parsedDataset.numericHeaders[1] || parsedDataset.numericHeaders[0]);
      }
      if (!parsedDataset.numericHeaders.includes(selectedColStats)) {
        setSelectedColStats(parsedDataset.numericHeaders[0]);
      }
    } else if (parsedDataset && parsedDataset.numericHeaders.length === 1) {
      setColX(parsedDataset.numericHeaders[0]);
      setColY(parsedDataset.numericHeaders[0]);
      setSelectedColStats(parsedDataset.numericHeaders[0]);
    }
  }, [parsedDataset]);

  // Handle Preset Load
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_DATASETS.find(p => p.id === presetId);
    if (!preset) return;
    setCsvText(preset.csv);
    if (preset.colX) setColX(preset.colX);
    if (preset.colY) setColY(preset.colY);
    if (preset.colX) setSelectedColStats(preset.colX);
    setSelectedModel('linear');
    setExcludeOutliers(false);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvText(text);
        setExcludeOutliers(false);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Compute Univariate Statistics
  const allColumnStats = useMemo<Record<string, DescriptiveStats>>(() => {
    if (!parsedDataset || parsedDataset.numericHeaders.length === 0) return {};
    const statsMap: Record<string, DescriptiveStats> = {};

    parsedDataset.numericHeaders.forEach(col => {
      const values: number[] = [];
      parsedDataset.parsedRows.forEach(r => {
        const v = r[col];
        if (v !== null && typeof v === 'number' && !isNaN(v)) {
          values.push(v);
        }
      });
      statsMap[col] = computeColumnStatistics(values, col);
    });

    return statsMap;
  }, [parsedDataset]);

  // Outlier detection on 2D series (X & Y)
  const outlierDiagnostics = useMemo(() => {
    if (!parsedDataset || !colX || !colY || !allColumnStats[colX] || !allColumnStats[colY]) {
      return { rowDetails: [], xOutlierCount: 0, yOutlierCount: 0, totalOutlierRows: 0 };
    }

    const statsX = allColumnStats[colX];
    const statsY = allColumnStats[colY];

    const iqrLowerX = statsX.q1 - 1.5 * statsX.iqr;
    const iqrUpperX = statsX.q3 + 1.5 * statsX.iqr;
    const iqrLowerY = statsY.q1 - 1.5 * statsY.iqr;
    const iqrUpperY = statsY.q3 + 1.5 * statsY.iqr;

    const rowDetails: OutlierRowDetail[] = [];
    let xOutlierCount = 0;
    let yOutlierCount = 0;
    let totalOutlierRows = 0;

    parsedDataset.parsedRows.forEach((row, idx) => {
      const vx = row[colX];
      const vy = row[colY];
      if (vx === null || vy === null) return;

      const zx = statsX.stdDev > 1e-9 ? (vx - statsX.mean) / statsX.stdDev : 0;
      const zy = statsY.stdDev > 1e-9 ? (vy - statsY.mean) / statsY.stdDev : 0;

      const isIqrX = vx < iqrLowerX || vx > iqrUpperX;
      const isIqrY = vy < iqrLowerY || vy > iqrUpperY;
      const isZX = Math.abs(zx) > 2.0;
      const isZY = Math.abs(zy) > 2.0;

      if (isIqrX || isIqrY || isZX || isZY) {
        let severity: 'Mild' | 'Severe' | 'Normal' = 'Mild';
        if (Math.abs(zx) > 3.0 || Math.abs(zy) > 3.0 || vx < statsX.q1 - 3 * statsX.iqr || vx > statsX.q3 + 3 * statsX.iqr) {
          severity = 'Severe';
        }

        if (isIqrX || isZX) xOutlierCount++;
        if (isIqrY || isZY) yOutlierCount++;
        totalOutlierRows++;

        rowDetails.push({
          rowIndex: idx + 1,
          xVal: vx,
          yVal: vy,
          xZScore: zx,
          yZScore: zy,
          xIsIqr: isIqrX,
          yIsIqr: isIqrY,
          xIsZ: isZX,
          yIsZ: isZY,
          severity
        });
      }
    });

    return { rowDetails, xOutlierCount, yOutlierCount, totalOutlierRows };
  }, [parsedDataset, colX, colY, allColumnStats]);

  // Active 2D dataset
  const active2DPoints = useMemo<DataPoint2D[]>(() => {
    if (!parsedDataset || !colX || !colY) return [];

    const statsX = allColumnStats[colX];
    const statsY = allColumnStats[colY];
    const points: DataPoint2D[] = [];

    const outlierRowIndices = new Set(
      outlierDiagnostics.rowDetails
        .filter(d => {
          if (outlierMethod === 'iqr') return d.xIsIqr || d.yIsIqr;
          if (outlierMethod === 'zscore') return d.xIsZ || d.yIsZ;
          return d.xIsIqr || d.yIsIqr || d.xIsZ || d.yIsZ;
        })
        .map(d => d.rowIndex - 1)
    );

    parsedDataset.parsedRows.forEach((row, idx) => {
      let vx = row[colX];
      let vy = row[colY];

      if (vx === null || vy === null) {
        if (missingStrategy === 'drop') return;
        if (vx === null && statsX) {
          vx = missingStrategy === 'mean' ? statsX.mean : (missingStrategy === 'median' ? statsX.median : 0);
        }
        if (vy === null && statsY) {
          vy = missingStrategy === 'mean' ? statsY.mean : (missingStrategy === 'median' ? statsY.median : 0);
        }
      }

      if (vx !== null && vy !== null) {
        const isOutlier = outlierRowIndices.has(idx);
        if (excludeOutliers && isOutlier) {
          return;
        }
        points.push({
          x: vx,
          y: vy,
          rowIndex: idx + 1,
          isOutlier
        });
      }
    });

    return points;
  }, [parsedDataset, colX, colY, allColumnStats, outlierDiagnostics, outlierMethod, excludeOutliers, missingStrategy]);

  // Regression Suite Calculations
  const allRegressionFits = useMemo<RegressionFitResult[]>(() => {
    if (active2DPoints.length < 2) return [];
    return evaluateAllRegressionModels(active2DPoints, precision);
  }, [active2DPoints, precision]);

  const activeFit = useMemo<RegressionFitResult | null>(() => {
    if (allRegressionFits.length === 0) return null;
    return allRegressionFits.find(f => f.modelType === selectedModel) || allRegressionFits[0];
  }, [allRegressionFits, selectedModel]);

  const bestFitModel = useMemo<RegressionFitResult | null>(() => {
    const valid = allRegressionFits.filter(f => f.isValid && !isNaN(f.r2));
    if (valid.length === 0) return null;
    return [...valid].sort((a, b) => b.r2 - a.r2)[0];
  }, [allRegressionFits]);

  // Correlation Matrix
  const correlationMatrix = useMemo(() => {
    if (!parsedDataset || parsedDataset.numericHeaders.length < 2) return null;
    const headers = parsedDataset.numericHeaders;
    const n = headers.length;
    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1.0;
        } else {
          const colA = headers[i];
          const colB = headers[j];
          const pairs: { x: number; y: number }[] = [];
          parsedDataset.parsedRows.forEach(r => {
            const va = r[colA];
            const vb = r[colB];
            if (va !== null && vb !== null) pairs.push({ x: va, y: vb });
          });
          const fit = computeLinearRegressionFit(pairs);
          matrix[i][j] = fit.isValid ? fit.r : 0;
        }
      }
    }

    return { headers, matrix };
  }, [parsedDataset]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopiedLabel(label);
    setTimeout(() => {
      setCopied(false);
      setCopiedLabel(null);
    }, 2000);
  };

  const handleExportCSV = () => {
    if (!parsedDataset) return;
    const lines = [
      parsedDataset.headers.join(','),
      ...parsedDataset.rawRows.map(r => parsedDataset.headers.map(h => r[h] ?? '').join(','))
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `toolique_data_analysis_${colX}_vs_${colY}.csv`;
    link.click();
  };

  const handleExportMarkdown = () => {
    if (!activeFit || !allColumnStats[colX] || !allColumnStats[colY]) return;
    const sx = allColumnStats[colX];
    const sy = allColumnStats[colY];

    const md = `# Toolique Data Analysis Report
Generated: ${new Date().toLocaleString()}

## Bivariate Regression Summary (${colX} vs ${colY})
- **Best-fit Model**: ${activeFit.modelName}
- **Equation**: ${activeFit.formula}
- **Sample Size (N)**: ${active2DPoints.length}
- **Correlation (R)**: ${activeFit.r.toFixed(4)}
- **R-Squared (R²)**: ${(activeFit.r2 * 100).toFixed(2)}%
- **Adjusted R²**: ${(activeFit.adjR2 * 100).toFixed(2)}%
- **RMSE**: ${activeFit.rmse.toFixed(4)}
- **MAE**: ${activeFit.mae.toFixed(4)}

## Univariate Statistics: ${colX} (Independent Variable)
- **Mean**: ${sx.mean.toFixed(4)} ± ${sx.stdError.toFixed(4)} (SE)
- **Median**: ${sx.median.toFixed(4)}
- **Standard Deviation (s)**: ${sx.stdDev.toFixed(4)}
- **Min / Max**: ${sx.min.toFixed(4)} / ${sx.max.toFixed(4)}
- **IQR**: ${sx.iqr.toFixed(4)} (Q1: ${sx.q1.toFixed(4)}, Q3: ${sx.q3.toFixed(4)})
- **Skewness**: ${sx.skewness.toFixed(4)}

## Univariate Statistics: ${colY} (Dependent Variable)
- **Mean**: ${sy.mean.toFixed(4)} ± ${sy.stdError.toFixed(4)} (SE)
- **Median**: ${sy.median.toFixed(4)}
- **Standard Deviation (s)**: ${sy.stdDev.toFixed(4)}
- **Min / Max**: ${sy.min.toFixed(4)} / ${sy.max.toFixed(4)}
- **IQR**: ${sy.iqr.toFixed(4)} (Q1: ${sy.q1.toFixed(4)}, Q3: ${sy.q3.toFixed(4)})
- **Skewness**: ${sy.skewness.toFixed(4)}
`;

    handleCopy(md, 'Markdown Report');
  };

  // --- SVG Interactive Scatter Plot Coordinates ---
  const svgWidth = 640;
  const svgHeight = 380;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 50;

  const chartGeometry = useMemo(() => {
    if (active2DPoints.length === 0) return null;

    const xs = active2DPoints.map(p => p.x);
    const ys = active2DPoints.map(p => p.y);

    let rawMinX = Math.min(...xs);
    let rawMaxX = Math.max(...xs);
    let rawMinY = Math.min(...ys);
    let rawMaxY = Math.max(...ys);

    if (rawMinX === rawMaxX) {
      rawMinX -= 1;
      rawMaxX += 1;
    }
    if (rawMinY === rawMaxY) {
      rawMinY -= 1;
      rawMaxY += 1;
    }

    const marginX = (rawMaxX - rawMinX) * 0.08;
    const marginY = (rawMaxY - rawMinY) * 0.08;

    const minX = rawMinX - marginX;
    const maxX = rawMaxX + marginX;
    const minY = rawMinY - marginY;
    const maxY = rawMaxY + marginY;

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    const plotW = svgWidth - padLeft - padRight;
    const plotH = svgHeight - padTop - padBottom;

    const toSvgX = (xVal: number) => padLeft + ((xVal - minX) / rangeX) * plotW;
    const toSvgY = (yVal: number) => padTop + plotH - ((yVal - minY) / rangeY) * plotH;

    const xTicks = Array.from({ length: 6 }, (_, i) => minX + (i / 5) * rangeX);
    const yTicks = Array.from({ length: 6 }, (_, i) => minY + (i / 5) * rangeY);

    let curvePath = '';
    let confidenceBandPath = '';

    if (activeFit && activeFit.isValid) {
      const stepCount = 60;
      const pointsArray: { sx: number; sy: number; upperSy: number; lowerSy: number }[] = [];

      const seEst = activeFit.seEstimate || activeFit.rmse || 0.1;
      const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
      const ssX = xs.reduce((acc, x) => acc + Math.pow(x - meanX, 2), 0) || 1;
      const n = xs.length;
      const tVal = getTCritical(n - 2, 0.05);

      for (let i = 0; i <= stepCount; i++) {
        const currX = minX + (i / stepCount) * rangeX;
        const predY = activeFit.predict(currX);
        const sx = toSvgX(currX);
        const sy = toSvgY(predY);

        const intervalMargin = tVal * seEst * Math.sqrt(1 + 1 / n + Math.pow(currX - meanX, 2) / ssX);
        const upperSy = toSvgY(predY + intervalMargin);
        const lowerSy = toSvgY(predY - intervalMargin);

        pointsArray.push({ sx, sy, upperSy, lowerSy });
      }

      curvePath = pointsArray
        .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.sx.toFixed(1)} ${p.sy.toFixed(1)}`)
        .join(' ');

      const upperForward = pointsArray.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.sx.toFixed(1)} ${p.upperSy.toFixed(1)}`).join(' ');
      const lowerBackward = [...pointsArray].reverse().map(p => `L ${p.sx.toFixed(1)} ${p.lowerSy.toFixed(1)}`).join(' ');
      confidenceBandPath = `${upperForward} ${lowerBackward} Z`;
    }

    return {
      minX,
      maxX,
      minY,
      maxY,
      toSvgX,
      toSvgY,
      xTicks,
      yTicks,
      curvePath,
      confidenceBandPath,
      plotW,
      plotH
    };
  }, [active2DPoints, activeFit]);

  return (
    <div className="space-y-6">
      {/* AEO Quick Answer Card / Metric Chips (Zero Double Heading) */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/70 dark:from-indigo-950/30 dark:via-zinc-900/60 dark:to-blue-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white dark:bg-indigo-500 uppercase tracking-wider">
                AEO Instant Insights
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {active2DPoints.length} valid points analyzed
              </span>
              {excludeOutliers && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  Outliers Excluded
                </span>
              )}
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {activeFit && activeFit.isValid ? (
                <span className="flex items-center gap-2 flex-wrap">
                  <span>Model: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{activeFit.formula}</strong></span>
                  <span className="text-zinc-300 dark:text-zinc-700">|</span>
                  <span>R² = <strong className="font-mono">{(activeFit.r2 * 100).toFixed(1)}%</strong></span>
                  <span className="text-zinc-300 dark:text-zinc-700">|</span>
                  <span>r = <strong className="font-mono">{activeFit.r.toFixed(3)}</strong></span>
                </span>
              ) : (
                'Import data or select preset to start multivariate statistical analysis'
              )}
            </div>
          </div>

          {/* Precision & Fast Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-zinc-800/80 px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
              <Sliders className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Decimals:</span>
              <select
                value={precision}
                onChange={(e) => setPrecision(Number(e.target.value))}
                className="bg-transparent font-bold text-indigo-600 dark:text-indigo-400 text-xs focus:outline-none cursor-pointer"
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>

            <button
              onClick={handleExportMarkdown}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-500" />
              <span>{copied && copiedLabel === 'Markdown Report' ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Presets Pills */}
        <div className="mt-3 pt-3 border-t border-indigo-100/70 dark:border-indigo-900/30 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Presets:
          </span>
          {PRESET_DATASETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset.id)}
              className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium border border-zinc-200/80 dark:border-zinc-700/60 transition cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Studio Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
        {[
          { id: 'regression', label: '📈 Regression & Scatter', icon: TrendingUp },
          { id: 'descriptive', label: '📊 Descriptive Stats', icon: BarChart2 },
          { id: 'outliers', label: '🔍 Outlier Diagnostics', icon: AlertTriangle },
          { id: 'correlation', label: '🧮 Correlation Matrix', icon: Layers },
          { id: 'predictor', label: '🔮 What-If Predictor', icon: Zap },
          { id: 'grid', label: '📋 Data Grid & Editor', icon: TableIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200/50 dark:border-zinc-700/50'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Data Source Controls + Workspace Views */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Data Input & Variable Selection */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
                <span>Dataset Ingestion</span>
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.tsv,.txt"
                className="hidden"
              />
            </div>

            <div className="relative">
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={7}
                placeholder="X, Y, Z&#10;1, 2.5, 10&#10;2, 5.1, 20"
                className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1 px-1">
                <span>{parsedDataset?.totalRows || 0} rows parsed</span>
                <button
                  onClick={() => setCsvText('')}
                  className="hover:text-rose-500 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Variable Selectors */}
            {parsedDataset && parsedDataset.numericHeaders.length >= 2 && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                      X Variable (Indep.)
                    </label>
                    <select
                      value={colX}
                      onChange={(e) => setColX(e.target.value)}
                      className="w-full text-xs font-medium bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
                    >
                      {parsedDataset.numericHeaders.map(h => (
                        <option key={`x-${h}`} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                      Y Variable (Dep.)
                    </label>
                    <select
                      value={colY}
                      onChange={(e) => setColY(e.target.value)}
                      className="w-full text-xs font-medium bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
                    >
                      {parsedDataset.numericHeaders.map(h => (
                        <option key={`y-${h}`} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Missing Value Strategy & Outlier Exclude Toggle */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">Exclude Outliers:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={excludeOutliers}
                        onChange={(e) => setExcludeOutliers(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">Missing Values:</span>
                    <select
                      value={missingStrategy}
                      onChange={(e) => setMissingStrategy(e.target.value as MissingValueStrategy)}
                      className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                    >
                      <option value="drop">Drop Rows</option>
                      <option value="mean">Impute Mean</option>
                      <option value="median">Impute Median</option>
                      <option value="zero">Fill 0</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Statistical Snapshot Box */}
          {allColumnStats[colX] && allColumnStats[colY] && (
            <div className="bg-zinc-900 text-white rounded-2xl p-5 shadow-sm border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <span>Quick Metrics</span>
                <span className="text-indigo-400">{colX} vs {colY}</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400">Mean X (x̄):</span>
                  <span className="font-bold text-zinc-200">{allColumnStats[colX].mean.toFixed(precision)}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400">Mean Y (ȳ):</span>
                  <span className="font-bold text-zinc-200">{allColumnStats[colY].mean.toFixed(precision)}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400">Std Dev X (s_x):</span>
                  <span className="font-bold text-zinc-200">{allColumnStats[colX].stdDev.toFixed(precision)}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400">Std Dev Y (s_y):</span>
                  <span className="font-bold text-zinc-200">{allColumnStats[colY].stdDev.toFixed(precision)}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                  <span className="text-zinc-400">Pearson Correlation (r):</span>
                  <span className="font-bold text-emerald-400">{activeFit?.r.toFixed(precision) || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Anomalies Detected:</span>
                  <span className={`font-bold ${outlierDiagnostics.totalOutlierRows > 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
                    {outlierDiagnostics.totalOutlierRows} point(s)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Tab Viewports */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: REGRESSION & SCATTER PLOT */}
          {activeTab === 'regression' && (
            <div className="space-y-6">
              {/* Interactive SVG Scatter Plot Card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <span>Bivariate Scatter Plot & Curve Fitting</span>
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Independent: <strong>{colX}</strong> | Dependent: <strong>{colY}</strong>
                    </p>
                  </div>

                  {/* Chart Overlay Toggles */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      onClick={() => setShowConfidenceBand(!showConfidenceBand)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                        showConfidenceBand
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      95% CI Ribbon
                    </button>
                    <button
                      onClick={() => setShowResidualStems(!showResidualStems)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                        showResidualStems
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      Residual Stems
                    </button>
                    <button
                      onClick={() => setShowOutlierGlow(!showOutlierGlow)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                        showOutlierGlow
                          ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      Outlier Halo
                    </button>
                  </div>
                </div>

                {/* SVG Canvas */}
                {chartGeometry ? (
                  <div className="relative">
                    <svg
                      width="100%"
                      height={svgHeight}
                      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                      className="border border-zinc-150 dark:border-zinc-800/80 rounded-xl bg-zinc-50/70 dark:bg-zinc-950/40 select-none"
                    >
                      {/* Grid Ticks & Horizontal Lines */}
                      {chartGeometry.yTicks.map((val, idx) => {
                        const y = chartGeometry.toSvgY(val);
                        return (
                          <g key={`ytick-${idx}`}>
                            <line
                              x1={padLeft}
                              y1={y}
                              x2={svgWidth - padRight}
                              y2={y}
                              stroke="currentColor"
                              className="text-zinc-200 dark:text-zinc-800/80"
                              strokeDasharray="3 3"
                            />
                            <text
                              x={padLeft - 8}
                              y={y + 3}
                              textAnchor="end"
                              className="text-[9px] fill-zinc-400 dark:fill-zinc-500 font-mono"
                            >
                              {val.toFixed(val >= 100 || val <= -100 ? 0 : 1)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Grid Ticks & Vertical Lines */}
                      {chartGeometry.xTicks.map((val, idx) => {
                        const x = chartGeometry.toSvgX(val);
                        return (
                          <g key={`xtick-${idx}`}>
                            <line
                              x1={x}
                              y1={padTop}
                              x2={x}
                              y2={svgHeight - padBottom}
                              stroke="currentColor"
                              className="text-zinc-200 dark:text-zinc-800/80"
                              strokeDasharray="3 3"
                            />
                            <text
                              x={x}
                              y={svgHeight - padBottom + 15}
                              textAnchor="middle"
                              className="text-[9px] fill-zinc-400 dark:fill-zinc-500 font-mono"
                            >
                              {val.toFixed(val >= 100 || val <= -100 ? 0 : 1)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Main Coordinate Axes */}
                      <line
                        x1={padLeft}
                        y1={svgHeight - padBottom}
                        x2={svgWidth - padRight}
                        y2={svgHeight - padBottom}
                        stroke="currentColor"
                        className="text-zinc-400 dark:text-zinc-600"
                        strokeWidth="1.5"
                      />
                      <line
                        x1={padLeft}
                        y1={padTop}
                        x2={padLeft}
                        y2={svgHeight - padBottom}
                        stroke="currentColor"
                        className="text-zinc-400 dark:text-zinc-600"
                        strokeWidth="1.5"
                      />

                      {/* 95% Confidence Band Ribbon */}
                      {showConfidenceBand && chartGeometry.confidenceBandPath && (
                        <path
                          d={chartGeometry.confidenceBandPath}
                          fill="#6366f1"
                          fillOpacity="0.12"
                        />
                      )}

                      {/* Residual Stems */}
                      {showResidualStems && activeFit && activeFit.isValid && (
                        active2DPoints.map((pt, idx) => {
                          const sx = chartGeometry.toSvgX(pt.x);
                          const sy = chartGeometry.toSvgY(pt.y);
                          const fitY = chartGeometry.toSvgY(activeFit.predict(pt.x));
                          return (
                            <line
                              key={`res-stem-${idx}`}
                              x1={sx}
                              y1={sy}
                              x2={sx}
                              y2={fitY}
                              stroke="#f43f5e"
                              strokeWidth="1.5"
                              strokeDasharray="2 2"
                            />
                          );
                        })
                      )}

                      {/* Best-Fit Trendline Path */}
                      {activeFit && activeFit.isValid && chartGeometry.curvePath && (
                        <path
                          d={chartGeometry.curvePath}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      )}

                      {/* Scatter Points */}
                      {active2DPoints.map((pt, idx) => {
                        const cx = chartGeometry.toSvgX(pt.x);
                        const cy = chartGeometry.toSvgY(pt.y);
                        const isAnomalous = pt.isOutlier;

                        return (
                          <g
                            key={`scatter-pt-${idx}`}
                            className="cursor-pointer transition-transform duration-150"
                            onMouseEnter={() => setHoveredPoint(pt)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          >
                            {showOutlierGlow && isAnomalous && (
                              <circle
                                cx={cx}
                                cy={cy}
                                r="9"
                                fill="#f43f5e"
                                fillOpacity="0.25"
                                className="animate-pulse"
                              />
                            )}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={isAnomalous ? '5.5' : '4.5'}
                              className={`${
                                isAnomalous
                                  ? 'fill-rose-500 stroke-white dark:stroke-zinc-950'
                                  : 'fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-zinc-900'
                              }`}
                              strokeWidth="1.5"
                            />
                          </g>
                        );
                      })}

                      {/* Axis Labels */}
                      <text
                        x={padLeft + (svgWidth - padLeft - padRight) / 2}
                        y={svgHeight - 12}
                        textAnchor="middle"
                        className="text-[11px] font-bold fill-zinc-600 dark:fill-zinc-300 font-mono"
                      >
                        {colX} (X)
                      </text>
                      <text
                        x={18}
                        y={padTop + (svgHeight - padTop - padBottom) / 2}
                        textAnchor="middle"
                        className="text-[11px] font-bold fill-zinc-600 dark:fill-zinc-300 font-mono"
                        transform={`rotate(-90, 18, ${padTop + (svgHeight - padTop - padBottom) / 2})`}
                      >
                        {colY} (Y)
                      </text>
                    </svg>

                    {/* Hover Tooltip */}
                    {hoveredPoint && (
                      <div
                        className="absolute z-10 pointer-events-none bg-zinc-900/90 text-white text-xs rounded-xl px-3 py-2 shadow-lg border border-zinc-700 backdrop-blur-xs font-mono space-y-0.5"
                        style={{
                          left: `${Math.min(svgWidth - 140, Math.max(20, chartGeometry.toSvgX(hoveredPoint.x) - 40))}px`,
                          top: `${Math.max(10, chartGeometry.toSvgY(hoveredPoint.y) - 65)}px`
                        }}
                      >
                        <div className="font-bold text-indigo-300">Row #{hoveredPoint.rowIndex}</div>
                        <div>{colX}: <strong>{hoveredPoint.x.toFixed(precision)}</strong></div>
                        <div>{colY}: <strong>{hoveredPoint.y.toFixed(precision)}</strong></div>
                        {activeFit && activeFit.isValid && (
                          <div className="text-zinc-400 text-[10px]">
                            Residual: {(hoveredPoint.y - activeFit.predict(hoveredPoint.x)).toFixed(precision)}
                          </div>
                        )}
                        {hoveredPoint.isOutlier && (
                          <div className="text-rose-400 text-[10px] font-bold">⚠️ Anomaly / Outlier</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-zinc-400 text-xs">
                    Please paste or upload valid numeric data to render the regression scatter plot.
                  </div>
                )}
              </div>

              {/* Multi-Model Comparison & Selector Table */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    <span>Curve Fitting Model Comparison</span>
                  </h4>
                  {bestFitModel && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Best Fit: {bestFitModel.modelName} (R² = {(bestFitModel.r2 * 100).toFixed(1)}%)
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase text-[10px] font-bold">
                        <th className="pb-2">Model Type</th>
                        <th className="pb-2">Fitted Equation</th>
                        <th className="pb-2 text-right">R² (Variance)</th>
                        <th className="pb-2 text-right">Adj. R²</th>
                        <th className="pb-2 text-right">RMSE</th>
                        <th className="pb-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                      {allRegressionFits.map(fit => {
                        const isCurrent = selectedModel === fit.modelType;
                        const isBest = bestFitModel?.modelType === fit.modelType;
                        return (
                          <tr
                            key={fit.modelType}
                            className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition ${
                              isCurrent ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                            }`}
                          >
                            <td className="py-2.5 font-sans font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                              {fit.modelName}
                              {isBest && (
                                <span className="text-amber-500" title="Highest R²">⭐</span>
                              )}
                            </td>
                            <td className="py-2.5 text-zinc-600 dark:text-zinc-300 max-w-xs truncate">
                              {fit.isValid ? fit.formula : <span className="text-rose-500 font-sans">{fit.formula}</span>}
                            </td>
                            <td className="py-2.5 text-right font-bold text-zinc-900 dark:text-zinc-100">
                              {fit.isValid ? `${(fit.r2 * 100).toFixed(1)}%` : '—'}
                            </td>
                            <td className="py-2.5 text-right text-zinc-600 dark:text-zinc-400">
                              {fit.isValid ? `${(fit.adjR2 * 100).toFixed(1)}%` : '—'}
                            </td>
                            <td className="py-2.5 text-right text-zinc-600 dark:text-zinc-400">
                              {fit.isValid ? fit.rmse.toFixed(precision) : '—'}
                            </td>
                            <td className="py-2.5 text-center">
                              <button
                                onClick={() => setSelectedModel(fit.modelType)}
                                disabled={!fit.isValid}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer font-sans ${
                                  isCurrent
                                    ? 'bg-indigo-600 text-white'
                                    : fit.isValid
                                      ? 'bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 text-zinc-700 dark:text-zinc-300'
                                      : 'opacity-40 cursor-not-allowed bg-zinc-100 text-zinc-400'
                                }`}
                              >
                                {isCurrent ? 'Active' : 'Select'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ANOVA & Parameter Significance */}
              {activeFit && activeFit.isValid && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-500" />
                    <span>Regression ANOVA & Parameter Significance</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <div className="text-[10px] text-zinc-400 uppercase font-bold font-sans">Correlation (r)</div>
                      <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {activeFit.r.toFixed(precision)}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-sans">
                        {Math.abs(activeFit.r) > 0.8 ? 'Very Strong' : Math.abs(activeFit.r) > 0.5 ? 'Moderate' : 'Weak'}
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <div className="text-[10px] text-zinc-400 uppercase font-bold font-sans">Std Error (S_e)</div>
                      <div className="text-base font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                        {activeFit.seEstimate?.toFixed(precision) || activeFit.rmse.toFixed(precision)}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-sans">Residual Scatter</div>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <div className="text-[10px] text-zinc-400 uppercase font-bold font-sans">F-Statistic</div>
                      <div className="text-base font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                        {activeFit.fStat ? activeFit.fStat.toFixed(precision) : '—'}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-sans">Overall Fit</div>
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <div className="text-[10px] text-zinc-400 uppercase font-bold font-sans">p-Value (Slope)</div>
                      <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {activeFit.pValue !== undefined ? (activeFit.pValue < 0.001 ? '< 0.001' : activeFit.pValue.toFixed(precision)) : '—'}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-sans">
                        {activeFit.pValue && activeFit.pValue < 0.05 ? 'Statistically Significant (p<0.05)' : 'Not Significant'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UNIVARIATE DESCRIPTIVE STATISTICS */}
          {activeTab === 'descriptive' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Univariate Distribution & Statistical Summary
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Measures of central tendency, spread, shape, and 95% confidence intervals.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase">Variable:</span>
                  <select
                    value={selectedColStats}
                    onChange={(e) => setSelectedColStats(e.target.value)}
                    className="text-xs font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
                  >
                    {parsedDataset?.numericHeaders.map(h => (
                      <option key={`stat-col-${h}`} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              {allColumnStats[selectedColStats] && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Mean (μ / x̄)</span>
                      <div className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
                        {allColumnStats[selectedColStats].mean.toFixed(precision)}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Trimmed (5%): {allColumnStats[selectedColStats].trimmedMean.toFixed(precision)}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Median (Q2)</span>
                      <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                        {allColumnStats[selectedColStats].median.toFixed(precision)}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        IQR: {allColumnStats[selectedColStats].iqr.toFixed(precision)}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Std Deviation (s)</span>
                      <div className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
                        {allColumnStats[selectedColStats].stdDev.toFixed(precision)}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Var: {allColumnStats[selectedColStats].variance.toFixed(precision)}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Coeff. Variation (CV)</span>
                      <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                        {allColumnStats[selectedColStats].cv.toFixed(1)}%
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        SE: {allColumnStats[selectedColStats].stdError.toFixed(precision)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                      Five-Number Summary & Distribution Parameters
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                          <span className="text-zinc-500 font-sans">Minimum (Min):</span>
                          <span className="font-bold">{allColumnStats[selectedColStats].min.toFixed(precision)}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                          <span className="text-zinc-500 font-sans">1st Quartile (Q1 - 25%):</span>
                          <span className="font-bold">{allColumnStats[selectedColStats].q1.toFixed(precision)}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                          <span className="text-zinc-500 font-sans">Median (Q2 - 50%):</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">{allColumnStats[selectedColStats].median.toFixed(precision)}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                          <span className="text-zinc-500 font-sans">3rd Quartile (Q3 - 75%):</span>
                          <span className="font-bold">{allColumnStats[selectedColStats].q3.toFixed(precision)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 font-sans">Maximum (Max):</span>
                          <span className="font-bold">{allColumnStats[selectedColStats].max.toFixed(precision)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                          <span className="text-zinc-500 font-sans">Skewness (Asymmetry):</span>
                          <span className="font-bold">
                            {allColumnStats[selectedColStats].skewness.toFixed(precision)} (
                            {Math.abs(allColumnStats[selectedColStats].skewness) < 0.5 ? 'Symmetric' : allColumnStats[selectedColStats].skewness > 0 ? 'Right Skew' : 'Left Skew'}
                            )
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                          <span className="text-zinc-500 font-sans">Excess Kurtosis:</span>
                          <span className="font-bold">
                            {allColumnStats[selectedColStats].kurtosis.toFixed(precision)} (
                            {Math.abs(allColumnStats[selectedColStats].kurtosis) < 0.5 ? 'Mesokurtic' : allColumnStats[selectedColStats].kurtosis > 0 ? 'Leptokurtic' : 'Platykurtic'}
                            )
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                          <span className="text-zinc-500 font-sans">95% CI for Mean:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            [{allColumnStats[selectedColStats].ci95Lower.toFixed(precision)}, {allColumnStats[selectedColStats].ci95Upper.toFixed(precision)}]
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 font-sans">Mode(s):</span>
                          <span className="font-bold">
                            {allColumnStats[selectedColStats].modes.length > 0 ? allColumnStats[selectedColStats].modes.join(', ') : 'No unique mode'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: OUTLIER DIAGNOSTICS */}
          {activeTab === 'outliers' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Anomaly & Outlier Diagnostics</span>
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Dual method detection via Tukey's IQR Fences and Standardized Z-Scores (|z| &gt; 2.0).
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={outlierMethod}
                      onChange={(e) => setOutlierMethod(e.target.value as OutlierMethod)}
                      className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                    >
                      <option value="iqr">Tukey IQR Rule</option>
                      <option value="zscore">Z-Score (|z| &gt; 2.0)</option>
                      <option value="both">Both Rules (Union)</option>
                    </select>

                    <button
                      onClick={() => setExcludeOutliers(!excludeOutliers)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        excludeOutliers
                          ? 'bg-rose-600 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>{excludeOutliers ? 'Outliers Excluded' : 'Filter Outliers'}</span>
                    </button>
                  </div>
                </div>

                {outlierDiagnostics.rowDetails.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase text-[10px] font-bold">
                          <th className="pb-2">Row #</th>
                          <th className="pb-2">{colX} (X)</th>
                          <th className="pb-2">{colY} (Y)</th>
                          <th className="pb-2 text-right">Z-Score X</th>
                          <th className="pb-2 text-right">Z-Score Y</th>
                          <th className="pb-2 text-center">IQR Flag</th>
                          <th className="pb-2 text-center">Severity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
                        {outlierDiagnostics.rowDetails.map(detail => (
                          <tr key={`outlier-row-${detail.rowIndex}`} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                            <td className="py-2.5 font-bold text-zinc-900 dark:text-zinc-100">#{detail.rowIndex}</td>
                            <td className="py-2.5 text-zinc-800 dark:text-zinc-200">{detail.xVal.toFixed(precision)}</td>
                            <td className="py-2.5 text-zinc-800 dark:text-zinc-200">{detail.yVal.toFixed(precision)}</td>
                            <td className={`py-2.5 text-right font-bold ${Math.abs(detail.xZScore) > 2 ? 'text-rose-500' : 'text-zinc-500'}`}>
                              {detail.xZScore.toFixed(2)}
                            </td>
                            <td className={`py-2.5 text-right font-bold ${Math.abs(detail.yZScore) > 2 ? 'text-rose-500' : 'text-zinc-500'}`}>
                              {detail.yZScore.toFixed(2)}
                            </td>
                            <td className="py-2.5 text-center font-sans">
                              {detail.xIsIqr || detail.yIsIqr ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                  Outside Fence
                                </span>
                              ) : (
                                <span className="text-zinc-400 text-[10px]">Inside</span>
                              )}
                            </td>
                            <td className="py-2.5 text-center font-sans">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                detail.severity === 'Severe'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                              }`}>
                                {detail.severity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-zinc-400 text-xs">
                    ✅ No statistical anomalies or outliers detected under standard IQR and Z-Score rules.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CORRELATION MATRIX HEATMAP */}
          {activeTab === 'correlation' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>Multivariate Pearson Correlation Heatmap</span>
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Pairwise correlation coefficient matrix for all numerical dimensions in the dataset.
                  </p>
                </div>

                {correlationMatrix ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-xs font-mono">
                      <thead>
                        <tr>
                          <th className="p-2 text-left text-zinc-400 font-sans">Variable</th>
                          {correlationMatrix.headers.map(h => (
                            <th key={`head-heat-${h}`} className="p-2 text-zinc-600 dark:text-zinc-300 font-bold truncate max-w-[100px]">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {correlationMatrix.headers.map((rowHeader, rIdx) => (
                          <tr key={`heat-row-${rowHeader}`}>
                            <td className="p-2 text-left font-sans font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">
                              {rowHeader}
                            </td>
                            {correlationMatrix.matrix[rIdx].map((rVal, cIdx) => {
                              let cellBg = 'bg-zinc-100 dark:bg-zinc-800';
                              let textColor = 'text-zinc-800 dark:text-zinc-200';
                              if (rVal >= 0.8) {
                                cellBg = 'bg-emerald-500 text-white font-bold';
                                textColor = 'text-white';
                              } else if (rVal >= 0.4) {
                                cellBg = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300';
                                textColor = 'text-emerald-800 dark:text-emerald-300';
                              } else if (rVal <= -0.8) {
                                cellBg = 'bg-rose-500 text-white font-bold';
                                textColor = 'text-white';
                              } else if (rVal <= -0.4) {
                                cellBg = 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300';
                                textColor = 'text-rose-800 dark:text-rose-300';
                              }

                              return (
                                <td
                                  key={`cell-${rIdx}-${cIdx}`}
                                  className={`p-3 rounded-lg border border-white dark:border-zinc-900 transition-colors ${cellBg} ${textColor}`}
                                >
                                  {rVal.toFixed(2)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-zinc-400 text-xs">
                    Requires at least 2 numerical columns in dataset.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: WHAT-IF PREDICTOR */}
          {activeTab === 'predictor' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    <span>Interactive Forecasting & Value Estimator</span>
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Predict dependent variable <strong>{colY}</strong> from independent variable <strong>{colX}</strong> with 95% confidence intervals.
                  </p>
                </div>

                {activeFit && activeFit.isValid ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Forward Predictor */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-4">
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                        Forward Forecast (Given X → Find Y)
                      </h5>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                          Enter {colX} Value (X):
                        </label>
                        <input
                          type="number"
                          value={predictInputX}
                          onChange={(e) => setPredictInputX(e.target.value)}
                          className="w-full text-sm font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                      </div>

                      {predictInputX && !isNaN(parseFloat(predictInputX)) && (
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-indigo-500 uppercase">Estimated {colY} (Ŷ):</span>
                          <div className="text-xl font-bold font-mono text-indigo-700 dark:text-indigo-300">
                            {activeFit.predict(parseFloat(predictInputX)).toFixed(precision)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Inverse Predictor */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-4">
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                        Inverse Estimation (Given Y → Find X)
                      </h5>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                          Enter Target {colY} Value (Y):
                        </label>
                        <input
                          type="number"
                          value={predictInputY}
                          onChange={(e) => setPredictInputY(e.target.value)}
                          className="w-full text-sm font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                      </div>

                      {predictInputY && !isNaN(parseFloat(predictInputY)) && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">Required {colX} (X):</span>
                          <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">
                            {activeFit.inversePredict
                              ? activeFit.inversePredict(parseFloat(predictInputY))?.toFixed(precision) || 'Undefined'
                              : 'Nonlinear inversion requires numerical root solver'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-zinc-400 text-xs">
                    Please configure a valid regression model first.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: RAW DATA GRID */}
          {activeTab === 'grid' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <TableIcon className="w-4 h-4 text-indigo-500" />
                      <span>Tabular Dataset Viewer</span>
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {parsedDataset?.totalRows || 0} total rows across {parsedDataset?.headers.length || 0} attributes.
                    </p>
                  </div>
                </div>

                {parsedDataset && (
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-2.5">#</th>
                          {parsedDataset.headers.map(h => (
                            <th key={`tbl-head-${h}`} className="p-2.5">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                        {parsedDataset.rawRows.map((row, idx) => (
                          <tr key={`raw-row-${idx}`} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                            <td className="p-2.5 font-bold text-zinc-400">{idx + 1}</td>
                            {parsedDataset.headers.map(h => (
                              <td key={`raw-cell-${idx}-${h}`} className="p-2.5 text-zinc-800 dark:text-zinc-200">
                                {row[h] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
