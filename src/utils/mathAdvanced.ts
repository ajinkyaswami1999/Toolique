// Advanced Math Utilities for Numerical Methods, Calculus, Engineering, and Data Science

// ==========================================
// 1. Numerical Root Finders
// ==========================================

export interface RootFinderIteration {
  iteration: number;
  x: number;
  fx: number;
  error: number;
}

export interface RootFinderResult {
  root: number | null;
  iterations: RootFinderIteration[];
  converged: boolean;
  message: string;
}

// Bisection Method
export function solveBisection(
  f: (x: number) => number,
  a: number,
  b: number,
  tol: number = 0.0001,
  maxIter: number = 100
): RootFinderResult {
  const iterations: RootFinderIteration[] = [];
  const fa = f(a);
  const fb = f(b);

  if (fa * fb > 0) {
    return {
      root: null,
      iterations: [],
      converged: false,
      message: `f(a) and f(b) must have opposite signs. f(a) = ${fa.toFixed(4)}, f(b) = ${fb.toFixed(4)}`
    };
  }

  let currentA = a;
  let currentB = b;
  let root = currentA;

  for (let i = 1; i <= maxIter; i++) {
    root = (currentA + currentB) / 2;
    const fx = f(root);
    const error = Math.abs(currentB - currentA) / 2;

    iterations.push({ iteration: i, x: root, fx, error });

    if (Math.abs(fx) < tol || error < tol) {
      return { root, iterations, converged: true, message: `Root found at x = ${root.toFixed(6)}` };
    }

    if (f(currentA) * fx < 0) {
      currentB = root;
    } else {
      currentA = root;
    }
  }

  return {
    root,
    iterations,
    converged: false,
    message: `Reached maximum iterations without converging.`
  };
}

// Newton-Raphson Method
export function solveNewtonRaphson(
  f: (x: number) => number,
  x0: number,
  tol: number = 0.0001,
  maxIter: number = 100
): RootFinderResult {
  const iterations: RootFinderIteration[] = [];
  let x = x0;

  // Numerical derivative helper
  const df = (val: number) => {
    const h = 1e-6;
    return (f(val + h) - f(val - h)) / (2 * h);
  };

  for (let i = 1; i <= maxIter; i++) {
    const fx = f(x);
    const dfx = df(x);

    if (Math.abs(dfx) < 1e-12) {
      return {
        root: null,
        iterations,
        converged: false,
        message: `Derivative close to zero at x = ${x.toFixed(6)}. Method failed.`
      };
    }

    const nextX = x - fx / dfx;
    const error = Math.abs(nextX - x);

    iterations.push({ iteration: i, x, fx, error });

    if (Math.abs(fx) < tol || error < tol) {
      return { root: nextX, iterations, converged: true, message: `Root found at x = ${nextX.toFixed(6)}` };
    }

    x = nextX;
  }

  return {
    root: x,
    iterations,
    converged: false,
    message: `Reached maximum iterations without converging.`
  };
}

// Secant Method
export function solveSecant(
  f: (x: number) => number,
  x0: number,
  x1: number,
  tol: number = 0.0001,
  maxIter: number = 100
): RootFinderResult {
  const iterations: RootFinderIteration[] = [];
  let prevX0 = x0;
  let prevX1 = x1;

  for (let i = 1; i <= maxIter; i++) {
    const f0 = f(prevX0);
    const f1 = f(prevX1);

    if (Math.abs(f1 - f0) < 1e-12) {
      return {
        root: null,
        iterations,
        converged: false,
        message: `Divisions by zero (f(x1) - f(x0) = 0). Method failed.`
      };
    }

    const nextX = prevX1 - (f1 * (prevX1 - prevX0)) / (f1 - f0);
    const error = Math.abs(nextX - prevX1);

    iterations.push({ iteration: i, x: prevX1, fx: f1, error });

    if (Math.abs(f1) < tol || error < tol) {
      return { root: nextX, iterations, converged: true, message: `Root found at x = ${nextX.toFixed(6)}` };
    }

    prevX0 = prevX1;
    prevX1 = nextX;
  }

  return {
    root: prevX1,
    iterations,
    converged: false,
    message: `Reached maximum iterations without converging.`
  };
}


// ==========================================
// 2. Numerical Integration
// ==========================================

export interface IntegrationIteration {
  interval: number;
  x: number;
  fx: number;
  weight: number;
  term: number;
}

export interface IntegrationResult {
  value: number;
  iterations: IntegrationIteration[];
  message: string;
}

// Trapezoidal Rule
export function integrateTrapezoidal(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number
): IntegrationResult {
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  
  const iterations: IntegrationIteration[] = [
    { interval: 0, x: a, fx: f(a), weight: 1, term: f(a) }
  ];

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const fx = f(x);
    sum += 2 * fx;
    iterations.push({ interval: i, x, fx, weight: 2, term: 2 * fx });
  }
  
  iterations.push({ interval: n, x: b, fx: f(b), weight: 1, term: f(b) });
  
  const value = (h / 2) * sum;
  return {
    value,
    iterations,
    message: `Integrated using Trapezoidal Rule with h = ${h.toFixed(4)}`
  };
}

// Simpson's 1/3 Rule (n must be even)
export function integrateSimpson13(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number
): IntegrationResult {
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  
  const iterations: IntegrationIteration[] = [
    { interval: 0, x: a, fx: f(a), weight: 1, term: f(a) }
  ];

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const fx = f(x);
    const weight = i % 2 === 0 ? 2 : 4;
    sum += weight * fx;
    iterations.push({ interval: i, x, fx, weight, term: weight * fx });
  }

  iterations.push({ interval: n, x: b, fx: f(b), weight: 1, term: f(b) });

  const value = (h / 3) * sum;
  return {
    value,
    iterations,
    message: `Integrated using Simpson's 1/3 Rule with h = ${h.toFixed(4)}`
  };
}

// Simpson's 3/8 Rule (n must be a multiple of 3)
export function integrateSimpson38(
  f: (x: number) => number,
  a: number,
  b: number,
  n: number
): IntegrationResult {
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  
  const iterations: IntegrationIteration[] = [
    { interval: 0, x: a, fx: f(a), weight: 1, term: f(a) }
  ];

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const fx = f(x);
    const weight = i % 3 === 0 ? 2 : 3;
    sum += weight * fx;
    iterations.push({ interval: i, x, fx, weight, term: weight * fx });
  }

  iterations.push({ interval: n, x: b, fx: f(b), weight: 1, term: f(b) });

  const value = (3 * h / 8) * sum;
  return {
    value,
    iterations,
    message: `Integrated using Simpson's 3/8 Rule with h = ${h.toFixed(4)}`
  };
}


// ==========================================
// 3. First-Order ODE Solvers (dy/dx = f(x, y))
// ==========================================

export interface ODEStep {
  step: number;
  x: number;
  y: number;
}

// Euler Method
export function solveEuler(
  f: (x: number, y: number) => number,
  x0: number,
  y0: number,
  xEnd: number,
  h: number
): ODEStep[] {
  const steps: ODEStep[] = [{ step: 0, x: x0, y: y0 }];
  let currentX = x0;
  let currentY = y0;
  let i = 1;

  while (currentX < xEnd - 1e-10) {
    const dydx = f(currentX, currentY);
    currentY = currentY + h * dydx;
    currentX = currentX + h;
    steps.push({ step: i, x: currentX, y: currentY });
    i++;
  }

  return steps;
}

// Improved Euler Method (Heun's)
export function solveImprovedEuler(
  f: (x: number, y: number) => number,
  x0: number,
  y0: number,
  xEnd: number,
  h: number
): ODEStep[] {
  const steps: ODEStep[] = [{ step: 0, x: x0, y: y0 }];
  let currentX = x0;
  let currentY = y0;
  let i = 1;

  while (currentX < xEnd - 1e-10) {
    const k1 = f(currentX, currentY);
    const yPredict = currentY + h * k1;
    const k2 = f(currentX + h, yPredict);
    
    currentY = currentY + (h / 2) * (k1 + k2);
    currentX = currentX + h;
    steps.push({ step: i, x: currentX, y: currentY });
    i++;
  }

  return steps;
}

// Runge-Kutta 4th Order (RK4)
export function solveRK4(
  f: (x: number, y: number) => number,
  x0: number,
  y0: number,
  xEnd: number,
  h: number
): ODEStep[] {
  const steps: ODEStep[] = [{ step: 0, x: x0, y: y0 }];
  let currentX = x0;
  let currentY = y0;
  let i = 1;

  while (currentX < xEnd - 1e-10) {
    const k1 = f(currentX, currentY);
    const k2 = f(currentX + h / 2, currentY + (h * k1) / 2);
    const k3 = f(currentX + h / 2, currentY + (h * k2) / 2);
    const k4 = f(currentX + h, currentY + h * k3);

    currentY = currentY + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    currentX = currentX + h;
    steps.push({ step: i, x: currentX, y: currentY });
    i++;
  }

  return steps;
}


// ==========================================
// 4. Cooley-Tukey Fast Fourier Transform (FFT)
// ==========================================

export interface FFTResult {
  frequencies: number[];
  real: number[];
  imag: number[];
  magnitudes: number[];
  powerSpectrum: number[];
  dominantFrequency: number;
}

// Complex helper class inside the namespace
class Complex {
  re: number;
  im: number;
  constructor(re: number, im: number) {
    this.re = re;
    this.im = im;
  }

  add(other: Complex): Complex {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other: Complex): Complex {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re
    );
  }

  magnitude(): number {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }
}

// Cooley-Tukey 1D FFT
function fftCooleyTukey(buffer: Complex[]): Complex[] {
  const n = buffer.length;
  if (n <= 1) return buffer;

  const even: Complex[] = [];
  const odd: Complex[] = [];
  for (let i = 0; i < n; i++) {
    if (i % 2 === 0) even.push(buffer[i]);
    else odd.push(buffer[i]);
  }

  const q = fftCooleyTukey(even);
  const r = fftCooleyTukey(odd);

  const out = Array(n).fill(null);
  for (let k = 0; k < n / 2; k++) {
    const th = (-2 * Math.PI * k) / n;
    const wk = new Complex(Math.cos(th), Math.sin(th));
    const term = wk.mul(r[k]);
    out[k] = q[k].add(term);
    out[k + n / 2] = q[k].sub(term);
  }

  return out;
}

export function computeFFT(signal: number[], samplingFreq: number): FFTResult {
  const n = signal.length;
  
  // Zero pad to next power of 2
  let power2Size = 1;
  while (power2Size < n) power2Size *= 2;

  const complexBuffer = Array(power2Size).fill(0).map((_, idx) => {
    const val = idx < n ? signal[idx] : 0; // Pad zero if out of bounds
    return new Complex(val, 0);
  });

  const fftOutput = fftCooleyTukey(complexBuffer);
  const halfSize = power2Size / 2;

  const frequencies: number[] = [];
  const real: number[] = [];
  const imag: number[] = [];
  const magnitudes: number[] = [];
  const powerSpectrum: number[] = [];

  let maxMag = -1;
  let dominantIdx = 0;

  for (let i = 0; i <= halfSize; i++) {
    const freq = (i * samplingFreq) / power2Size;
    const c = fftOutput[i];
    const mag = c.magnitude() / (n / 2); // Normalize amplitude

    frequencies.push(freq);
    real.push(c.re);
    imag.push(c.im);
    magnitudes.push(mag);
    powerSpectrum.push(mag * mag);

    // Skip DC component for dominant frequency detection
    if (i > 0 && mag > maxMag) {
      maxMag = mag;
      dominantIdx = i;
    }
  }

  const dominantFrequency = frequencies[dominantIdx] || 0;

  return {
    frequencies,
    real,
    imag,
    magnitudes,
    powerSpectrum,
    dominantFrequency
  };
}


// ==========================================
// 5. Simplex Linear Programming Solver
// ==========================================

export interface LPResult {
  optimalValue: number | null;
  variables: Record<string, number>;
  slack: number[];
  status: 'optimal' | 'unbounded' | 'infeasible' | 'max_iterations_reached';
}

// Basic Simplex Solver for Maximization and <= constraints:
// Maximize Z = c * x
// subject to A * x <= b, x >= 0
export function solveSimplexLP(
  objective: number[], // c coefficients
  constraints: number[][], // A coefficients
  rhs: number[], // b bounds
  minimize: boolean = false
): LPResult {
  const numVars = objective.length;
  const numConstraints = constraints.length;

  // Modify coefficients for minimization: Maximize -Z
  const objCoeffs = objective.map(c => (minimize ? -c : c));

  // Simplex Tableau setup
  // Rows: numConstraints + 1 (objective row)
  // Columns: numVars + numConstraints (slack vars) + 1 (RHS)
  const numCols = numVars + numConstraints + 1;
  const numRows = numConstraints + 1;
  const tableau: number[][] = Array(numRows).fill(0).map(() => Array(numCols).fill(0));

  // Fill constraint coefficients
  for (let i = 0; i < numConstraints; i++) {
    for (let j = 0; j < numVars; j++) {
      tableau[i][j] = constraints[i][j];
    }
    // Add slack variables
    tableau[i][numVars + i] = 1;
    // RHS
    tableau[i][numCols - 1] = rhs[i];
  }

  // Fill objective row (last row)
  for (let j = 0; j < numVars; j++) {
    tableau[numRows - 1][j] = -objCoeffs[j]; // -c_j
  }
  // RHS of Z row is 0
  tableau[numRows - 1][numCols - 1] = 0;

  // Track basic variables for each row
  const basicVars: number[] = Array(numConstraints).fill(0).map((_, idx) => numVars + idx);

  // Simplex Pivot loop
  let iterations = 0;
  const maxIter = 1000;

  while (iterations < maxIter) {
    iterations++;

    // Find entering variable (most negative column in Z row)
    let pivotCol = -1;
    let minVal = 0;
    for (let j = 0; j < numCols - 1; j++) {
      if (tableau[numRows - 1][j] < minVal) {
        minVal = tableau[numRows - 1][j];
        pivotCol = j;
      }
    }

    // If no negative coeff in Z-row, we have reached optimal Z!
    if (pivotCol === -1) {
      break;
    }

    // Find leaving variable (Minimum ratio test)
    let pivotRow = -1;
    let minRatio = Infinity;
    for (let i = 0; i < numConstraints; i++) {
      const a = tableau[i][pivotCol];
      if (a > 0) {
        const ratio = tableau[i][numCols - 1] / a;
        if (ratio < minRatio) {
          minRatio = ratio;
          pivotRow = i;
        }
      }
    }

    // If no positive constraint divisor, LP is unbounded
    if (pivotRow === -1) {
      return {
        optimalValue: null,
        variables: {},
        slack: [],
        status: 'unbounded'
      };
    }

    // Pivot operations
    const pivot = tableau[pivotRow][pivotCol];
    // Normalize pivot row
    for (let j = 0; j < numCols; j++) {
      tableau[pivotRow][j] /= pivot;
    }

    // Eliminate pivot column elements in other rows
    for (let i = 0; i < numRows; i++) {
      if (i !== pivotRow) {
        const factor = tableau[i][pivotCol];
        for (let j = 0; j < numCols; j++) {
          tableau[i][j] -= factor * tableau[pivotRow][j];
        }
      }
    }

    // Update basic variables mapping
    basicVars[pivotRow] = pivotCol;
  }

  if (iterations >= maxIter) {
    return {
      optimalValue: null,
      variables: {},
      slack: [],
      status: 'max_iterations_reached'
    };
  }

  // Extract variables values
  const variables: Record<string, number> = {};
  for (let j = 0; j < numVars; j++) {
    const rowIdx = basicVars.indexOf(j);
    if (rowIdx !== -1) {
      variables[`x${j + 1}`] = Math.max(0, tableau[rowIdx][numCols - 1]);
    } else {
      variables[`x${j + 1}`] = 0;
    }
  }

  // Extract slack values
  const slack: number[] = [];
  for (let i = 0; i < numConstraints; i++) {
    const slackCol = numVars + i;
    const rowIdx = basicVars.indexOf(slackCol);
    if (rowIdx !== -1) {
      slack.push(Math.max(0, tableau[rowIdx][numCols - 1]));
    } else {
      slack.push(0);
    }
  }

  let optimalValue = tableau[numRows - 1][numCols - 1];
  if (minimize) {
    optimalValue = -optimalValue; // Convert Z back for min problem
  }

  return {
    optimalValue,
    variables,
    slack,
    status: 'optimal'
  };
}


// ==========================================
// 6. Polynomial & Exponential Regressions
// ==========================================

export interface RegressionModelResult {
  equation: string;
  r2: number;
  points: { x: number; y: number; predicted: number; residual: number }[];
}

// Solve linear systems via Gaussian Elimination (used for polynomial fits)
function solveLinearSystem(A: number[][], B: number[]): number[] {
  const n = B.length;
  for (let i = 0; i < n; i++) {
    // Find pivot row
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    // Swap rows
    const tempA = A[i]; A[i] = A[maxRow]; A[maxRow] = tempA;
    const tempB = B[i]; B[i] = B[maxRow]; B[maxRow] = tempB;

    // Eliminate columns below
    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i] / A[i][i];
      for (let j = i; j < n; j++) {
        A[k][j] -= factor * A[i][j];
      }
      B[k] -= factor * B[i];
    }
  }

  // Back substitution
  const X = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += A[i][j] * X[j];
    }
    X[i] = (B[i] - sum) / A[i][i];
  }
  return X;
}

// Polynomial Regression (Degree d)
export function fitPolynomial(x: number[], y: number[], degree: number): RegressionModelResult {
  const n = x.length;
  const m = degree + 1;

  // Build X^T * X matrix and X^T * Y vector
  const XT_X = Array(m).fill(0).map(() => Array(m).fill(0));
  const XT_Y = Array(m).fill(0);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      let sumPowers = 0;
      for (let k = 0; k < n; k++) {
        sumPowers += Math.pow(x[k], i + j);
      }
      XT_X[i][j] = sumPowers;
    }

    let sumYPower = 0;
    for (let k = 0; k < n; k++) {
      sumYPower += y[k] * Math.pow(x[k], i);
    }
    XT_Y[i] = sumYPower;
  }

  // Coefficients: beta = [c, b, a] for y = ax^2 + bx + c
  const beta = solveLinearSystem(XT_X, XT_Y);

  const predict = (xVal: number) => {
    return beta.reduce((sum, coeff, power) => sum + coeff * Math.pow(xVal, power), 0);
  };

  // Compute R2
  const meanY = y.reduce((s, curr) => s + curr, 0) / n;
  let ssTot = 0;
  let ssRes = 0;

  const points = x.map((xVal, idx) => {
    const predicted = predict(xVal);
    const residual = y[idx] - predicted;
    ssTot += Math.pow(y[idx] - meanY, 2);
    ssRes += Math.pow(y[idx] - predicted, 2);
    return { x: xVal, y: y[idx], predicted, residual };
  });

  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  // Build Equation Text
  // e.g. y = 2.30x^2 + 1.20x + 0.50
  const eqTerms = beta.map((coeff, power) => {
    if (power === 0) return `${coeff.toFixed(3)}`;
    if (power === 1) return `${coeff.toFixed(3)}x`;
    return `${coeff.toFixed(3)}x^${power}`;
  }).reverse();

  return {
    equation: `y = ` + eqTerms.join(' + ').replace(/\+ -/g, '- '),
    r2,
    points
  };
}

// Exponential Regression: y = a * e^(b * x)
export function fitExponential(x: number[], y: number[]): RegressionModelResult {
  const n = x.length;
  // Linearize: ln(y) = ln(a) + b * x
  const lny = y.map(val => Math.log(val));

  // Perform Linear regression on (x, lny)
  let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += lny[i];
    sumXX += x[i] * x[i];
    sumXY += x[i] * lny[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const a = Math.exp(intercept);
  const b = slope;

  const predict = (xVal: number) => a * Math.exp(b * xVal);

  const meanY = y.reduce((s, curr) => s + curr, 0) / n;
  let ssTot = 0;
  let ssRes = 0;

  const points = x.map((xVal, idx) => {
    const predicted = predict(xVal);
    const residual = y[idx] - predicted;
    ssTot += Math.pow(y[idx] - meanY, 2);
    ssRes += Math.pow(y[idx] - predicted, 2);
    return { x: xVal, y: y[idx], predicted, residual };
  });

  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return {
    equation: `y = ${a.toFixed(4)} * e^(${b.toFixed(4)}x)`,
    r2,
    points
  };
}


// ==========================================
// 7. Extended Probability Distributions
// ==========================================

// Poisson Distribution
export function poissonPMF(k: number, lambda: number): number {
  if (k < 0 || lambda <= 0) return 0;
  // PMF = (lambda^k * e^-lambda) / k!
  // To prevent numerical overflow, use logs: e^(k*ln(lambda) - lambda - ln(k!))
  let logFactorial = 0;
  for (let i = 2; i <= k; i++) logFactorial += Math.log(i);

  return Math.exp(k * Math.log(lambda) - lambda - logFactorial);
}

export function poissonCDF(k: number, lambda: number): number {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += poissonPMF(i, lambda);
  }
  return sum;
}

// Exponential Distribution
export function exponentialPDF(x: number, lambda: number): number {
  if (x < 0 || lambda <= 0) return 0;
  return lambda * Math.exp(-lambda * x);
}

export function exponentialCDF(x: number, lambda: number): number {
  if (x < 0 || lambda <= 0) return 0;
  return 1 - Math.exp(-lambda * x);
}
