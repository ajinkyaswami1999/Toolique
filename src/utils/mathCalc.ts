// 1. Equation Solver Typings and Functions
export interface EquationRoot {
  real: number;
  imag: number;
}

export interface QuadraticResult {
  roots: EquationRoot[];
  discriminant: number;
  steps: string[];
  equationText: string;
}

export interface LinearResult {
  root: number | null;
  steps: string[];
  equationText: string;
}

export interface SimultaneousResult {
  x: number | null;
  y: number | null;
  determinant: number;
  steps: string[];
}

export function solveLinear(a: number, b: number): LinearResult {
  const steps: string[] = [];
  steps.push(`Given equation: ${a}x + (${b}) = 0`);
  if (a === 0) {
    if (b === 0) {
      steps.push("Since a = 0 and b = 0, the equation has infinitely many solutions (0 = 0).");
      return { root: null, steps, equationText: "0 = 0 (infinite solutions)" };
    } else {
      steps.push(`Since a = 0 and b = ${b} != 0, the equation has no solution (contradiction).`);
      return { root: null, steps, equationText: `${b} = 0 (no solution)` };
    }
  }
  
  steps.push(`Isolate the x term: ${a}x = -(${b})`);
  steps.push(`Divide both sides by a: x = -(${b}) / ${a}`);
  const root = -b / a;
  steps.push(`Result: x = ${root.toFixed(4)}`);
  
  return { root, steps, equationText: `x = ${root.toFixed(4)}` };
}

export function solveQuadratic(a: number, b: number, c: number): QuadraticResult {
  const steps: string[] = [];
  steps.push(`Given quadratic equation: ${a}x² + (${b})x + (${c}) = 0`);
  
  if (a === 0) {
    steps.push("Since a = 0, this is a linear equation. Solving linearly...");
    const lin = solveLinear(b, c);
    return {
      roots: lin.root !== null ? [{ real: lin.root, imag: 0 }] : [],
      discriminant: 0,
      steps: [...steps, ...lin.steps],
      equationText: lin.equationText
    };
  }

  // Calculate Discriminant
  const discriminant = b * b - 4 * a * c;
  steps.push(`Compute discriminant (D = b² - 4ac):`);
  steps.push(`D = (${b})² - 4 * (${a}) * (${c})`);
  steps.push(`D = ${b*b} - ${4*a*c} = ${discriminant}`);

  const roots: EquationRoot[] = [];
  if (discriminant > 0) {
    steps.push("Since D > 0, the roots are real and distinct.");
    steps.push(`Formula: x = (-b ± √D) / 2a`);
    const sqrtD = Math.sqrt(discriminant);
    const r1 = (-b + sqrtD) / (2 * a);
    const r2 = (-b - sqrtD) / (2 * a);
    steps.push(`x1 = (-(${b}) + √${discriminant}) / (2 * ${a}) = ${(-b + sqrtD).toFixed(4)} / ${(2*a).toFixed(4)} = ${r1.toFixed(4)}`);
    steps.push(`x2 = (-(${b}) - √${discriminant}) / (2 * ${a}) = ${(-b - sqrtD).toFixed(4)} / ${(2*a).toFixed(4)} = ${r2.toFixed(4)}`);
    roots.push({ real: r1, imag: 0 }, { real: r2, imag: 0 });
  } else if (discriminant === 0) {
    steps.push("Since D = 0, the roots are real and equal.");
    steps.push(`Formula: x = -b / 2a`);
    const r = -b / (2 * a);
    steps.push(`x = -(${b}) / (2 * ${a}) = ${r.toFixed(4)}`);
    roots.push({ real: r, imag: 0 }, { real: r, imag: 0 });
  } else {
    steps.push("Since D < 0, the roots are complex conjugate pairs.");
    steps.push(`Formula: x = (-b ± i√|D|) / 2a`);
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-discriminant) / (2 * a);
    steps.push(`Real Part = -(${b}) / (2 * ${a}) = ${realPart.toFixed(4)}`);
    steps.push(`Imaginary Part = √${-discriminant} / (2 * ${a}) = ${imagPart.toFixed(4)}`);
    steps.push(`x1 = ${realPart.toFixed(4)} + ${imagPart.toFixed(4)}i`);
    steps.push(`x2 = ${realPart.toFixed(4)} - ${imagPart.toFixed(4)}i`);
    roots.push({ real: realPart, imag: imagPart }, { real: realPart, imag: -imagPart });
  }

  const eqText = roots.length === 2 
    ? (roots[0].imag !== 0 
        ? `x = ${roots[0].real.toFixed(2)} ± ${roots[0].imag.toFixed(2)}i` 
        : `x1 = ${roots[0].real.toFixed(2)}, x2 = ${roots[1].real.toFixed(2)}`)
    : "No roots";

  return { roots, discriminant, steps, equationText: eqText };
}

export function solveSimultaneous(
  a1: number, b1: number, c1: number,
  a2: number, b2: number, c2: number
): SimultaneousResult {
  const steps: string[] = [];
  steps.push(`Equations:`);
  steps.push(`(1)  ${a1}x + ${b1}y = ${c1}`);
  steps.push(`(2)  ${a2}x + ${b2}y = ${c2}`);

  // Calculate Determinant using Cramer's rule
  const D = a1 * b2 - a2 * b1;
  steps.push(`Compute main determinant D = (a1 * b2 - a2 * b1):`);
  steps.push(`D = (${a1} * ${b2}) - (${a2} * ${b1}) = ${D}`);

  if (D === 0) {
    steps.push("Since D = 0, the system does not have a unique solution. (Either infinite or no solutions).");
    return { x: null, y: null, determinant: 0, steps };
  }

  const Dx = c1 * b2 - c2 * b1;
  const Dy = a1 * c2 - a2 * c1;

  steps.push(`Compute Dx = (c1 * b2 - c2 * b1) and Dy = (a1 * c2 - a2 * c1):`);
  steps.push(`Dx = (${c1} * ${b2}) - (${c2} * ${b1}) = ${Dx}`);
  steps.push(`Dy = (${a1} * ${c2}) - (${a2} * ${c1}) = ${Dy}`);

  const x = Dx / D;
  const y = Dy / D;

  steps.push(`Apply Cramer's Rule:`);
  steps.push(`x = Dx / D = ${Dx} / ${D} = ${x.toFixed(4)}`);
  steps.push(`y = Dy / D = ${Dy} / ${D} = ${y.toFixed(4)}`);

  return { x, y, determinant: D, steps };
}

// 2. Matrix Calculator functions
export type Matrix = number[][];

export function matrixAdd(A: Matrix, B: Matrix): Matrix {
  return A.map((row, i) => row.map((val, j) => val + B[i][j]));
}

export function matrixSubtract(A: Matrix, B: Matrix): Matrix {
  return A.map((row, i) => row.map((val, j) => val - B[i][j]));
}

export function matrixMultiply(A: Matrix, B: Matrix): Matrix {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const result: Matrix = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

export function matrixTranspose(A: Matrix): Matrix {
  return A[0].map((_, colIndex) => A.map(row => row[colIndex]));
}

export function getDeterminant(A: Matrix): number {
  const n = A.length;
  if (n === 1) return A[0][0];
  if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];

  let det = 0;
  for (let j = 0; j < n; j++) {
    const subMatrix = A.slice(1).map(row => row.filter((_, colIdx) => colIdx !== j));
    const sign = j % 2 === 0 ? 1 : -1;
    det += sign * A[0][j] * getDeterminant(subMatrix);
  }
  return det;
}

export function getMatrixInverse(A: Matrix): Matrix | null {
  const det = getDeterminant(A);
  if (Math.abs(det) < 1e-9) return null;

  const n = A.length;
  if (n === 1) return [[1 / A[0][0]]];

  const adj: Matrix = Array(n).fill(0).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const sub = A.filter((_, rIdx) => rIdx !== i)
                  .map(row => row.filter((_, cIdx) => cIdx !== j));
      const sign = (i + j) % 2 === 0 ? 1 : -1;
      adj[j][i] = sign * getDeterminant(sub); // Transposed cofactor
    }
  }

  return adj.map(row => row.map(val => val / det));
}

export function getMatrixRank(A: Matrix): number {
  const rows = A.length;
  const cols = A[0].length;
  const mat = A.map(row => [...row]); // deep copy
  
  let rank = cols;
  for (let row = 0; row < rank; row++) {
    // Check if diagonal element is non-zero
    if (Math.abs(mat[row][row]) > 1e-9) {
      for (let col = 0; col < rows; col++) {
        if (col !== row) {
          const factor = mat[col][row] / mat[row][row];
          for (let i = 0; i < rank; i++) {
            mat[col][i] -= factor * mat[row][i];
          }
        }
      }
    } else {
      let reduce = true;
      for (let i = row + 1; i < rows; i++) {
        if (Math.abs(mat[i][row]) > 1e-9) {
          // Swap rows
          const temp = mat[row];
          mat[row] = mat[i];
          mat[i] = temp;
          reduce = false;
          break;
        }
      }
      if (reduce) {
        rank--;
        for (let i = 0; i < rows; i++) {
          mat[i][row] = mat[i][rank];
        }
      }
      row--;
    }
  }
  return rank;
}

// 3. Statistics functions
export interface StatsOutput {
  mean: number;
  median: number;
  modes: number[];
  range: number;
  variance: number;
  stdDev: number;
  q1: number;
  q3: number;
  min: number;
  max: number;
  count: number;
  frequencyTable: Record<string, number>;
}

export function calculateStatistics(numbers: number[]): StatsOutput {
  const count = numbers.length;
  const sorted = [...numbers].sort((a, b) => a - b);
  
  const min = sorted[0];
  const max = sorted[count - 1];
  const range = max - min;

  // Mean
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / count;

  // Median
  let median = 0;
  if (count % 2 === 0) {
    median = (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
  } else {
    median = sorted[Math.floor(count / 2)];
  }

  // Mode
  const frequencyTable: Record<string, number> = {};
  numbers.forEach(n => {
    frequencyTable[n] = (frequencyTable[n] || 0) + 1;
  });
  
  let maxFreq = 0;
  let modes: number[] = [];
  Object.entries(frequencyTable).forEach(([num, freq]) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      modes = [Number(num)];
    } else if (freq === maxFreq) {
      modes.push(Number(num));
    }
  });
  if (modes.length === count || maxFreq === 1) {
    modes = []; // No clear mode
  }

  // Variance & Standard Deviation
  const sqDiffsSum = numbers.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0);
  const variance = count > 1 ? sqDiffsSum / (count - 1) : 0; // Sample Variance
  const stdDev = Math.sqrt(variance);

  // Quartiles (percentile method)
  const getPercentile = (p: number) => {
    const idx = (count - 1) * p;
    const base = Math.floor(idx);
    const rest = idx - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  };

  const q1 = getPercentile(0.25);
  const q3 = getPercentile(0.75);

  return {
    mean,
    median,
    modes,
    range,
    variance,
    stdDev,
    q1,
    q3,
    min,
    max,
    count,
    frequencyTable
  };
}

// 4. Data Analysis functions
export interface RegressionResult {
  slope: number;
  intercept: number;
  r: number;
  r2: number;
}

export function calculateLinearRegression(x: number[], y: number[]): RegressionResult {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
    sumYY += y[i] * y[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Correlation coefficient (r)
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  const r = den !== 0 ? num / den : 0;
  const r2 = r * r;

  return { slope, intercept, r, r2 };
}

export function detectOutliers(numbers: number[]): number[] {
  const count = numbers.length;
  if (count < 4) return [];
  const sorted = [...numbers].sort((a, b) => a - b);
  
  const getPercentile = (p: number) => {
    const idx = (count - 1) * p;
    const base = Math.floor(idx);
    const rest = idx - base;
    return sorted[base + 1] !== undefined
      ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
      : sorted[base];
  };

  const q1 = getPercentile(0.25);
  const q3 = getPercentile(0.75);
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return numbers.filter(n => n < lowerBound || n > upperBound);
}

// 5. Geometry functions
export interface TriangleOutput {
  a: number;
  b: number;
  c: number;
  alpha: number; // degrees, opposite side a
  beta: number;  // degrees, opposite side b
  gamma: number; // degrees, opposite side c
  area: number;
  perimeter: number;
  type: string;
}

export function solveTriangleSSS(a: number, b: number, c: number): TriangleOutput | null {
  // Check triangle inequality
  if (a + b <= c || a + c <= b || b + c <= a) return null;

  const rad2deg = 180 / Math.PI;
  // Law of Cosines: cos(A) = (b² + c² - a²) / 2bc
  const alpha = Math.acos((b*b + c*c - a*a) / (2*b*c)) * rad2deg;
  const beta = Math.acos((a*a + c*c - b*b) / (2*a*c)) * rad2deg;
  const gamma = 180 - alpha - beta;

  // Semi-perimeter & Heron's Formula
  const s = (a + b + c) / 2;
  const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

  let type = "Scalene";
  if (a === b && b === c) type = "Equilateral";
  else if (a === b || b === c || a === c) type = "Isosceles";

  return { a, b, c, alpha, beta, gamma, area, perimeter: a+b+c, type };
}

// 6. Probability functions
export function factorial(n: number): number {
  if (n < 0) return 0;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

export function getPermutation(n: number, r: number): number {
  if (n < r || n < 0 || r < 0) return 0;
  let res = 1;
  for (let i = n; i > n - r; i--) res *= i;
  return res;
}

export function getCombination(n: number, r: number): number {
  if (n < r || n < 0 || r < 0) return 0;
  const limit = Math.max(r, n - r);
  const min = Math.min(r, n - r);
  let numer = 1;
  for (let i = n; i > limit; i--) numer *= i;
  return numer / factorial(min);
}

export function binomialProbability(n: number, k: number, p: number): number {
  if (n < k || n < 0 || k < 0 || p < 0 || p > 1) return 0;
  return getCombination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

export function getZScore(x: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (x - mean) / stdDev;
}

// Approximation of standard normal cumulative distribution function (error < 7.5e-8)
export function normalCDF(z: number): number {
  const p = 0.2316419;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;

  const t = 1.0 / (1.0 + p * Math.abs(z));
  const expTerm = Math.exp(-z * z / 2.0) / Math.sqrt(2.0 * Math.PI);
  const cdf = 1.0 - expTerm * (b1 * t + b2 * t*t + b3 * Math.pow(t, 3) + b4 * Math.pow(t, 4) + b5 * Math.pow(t, 5));
  
  return z >= 0 ? cdf : 1.0 - cdf;
}

// 7. Coordinate Geometry functions
export interface Point {
  x: number;
  y: number;
}

export interface LineEquation {
  A: number; // Ax + By + C = 0
  B: number;
  C: number;
  slopeInterceptText: string;
  generalText: string;
}

export function calculateCoordinateMetrics(p1: Point, p2: Point) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  const distance = Math.sqrt(dx * dx + dy * dy);
  const midpoint: Point = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  
  const slope = dx !== 0 ? dy / dx : null;

  // Calculate equations: Ax + By + C = 0
  // y - y1 = m(x - x1) => mx - y + (y1 - mx1) = 0
  let A = 0, B = 0, C = 0;
  let slopeInterceptText = "";
  let generalText = "";

  if (slope !== null) {
    A = slope;
    B = -1;
    C = p1.y - slope * p1.x;
    
    const mStr = slope === 0 ? "" : `${slope.toFixed(2)}x`;
    const cSign = C >= 0 ? "+" : "";
    const cStr = C === 0 && slope !== 0 ? "" : ` ${cSign} ${C.toFixed(2)}`;
    slopeInterceptText = `y = ${mStr}${cStr}`.replace("= +", "=").trim();
    generalText = `${A.toFixed(2)}x + (${B.toFixed(2)})y + (${C.toFixed(2)}) = 0`;
  } else {
    // Vertical line: x = x1 => 1x + 0y - x1 = 0
    A = 1;
    B = 0;
    C = -p1.x;
    slopeInterceptText = `x = ${p1.x.toFixed(2)}`;
    generalText = `1x + 0y + (${C.toFixed(2)}) = 0`;
  }

  return {
    distance,
    midpoint,
    slope,
    equation: { A, B, C, slopeInterceptText, generalText }
  };
}

export function pointToLineDistance(p: Point, A: number, B: number, C: number): number {
  const den = Math.sqrt(A * A + B * B);
  if (den === 0) return 0;
  return Math.abs(A * p.x + B * p.y + C) / den;
}
