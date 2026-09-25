/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Grid,
  Sparkles,
  Info,
  Download,
  Shuffle,
  Layers,
  ArrowRight,
  Eye,
  Sliders
} from 'lucide-react';
import * as math from 'mathjs';

// Available Operation Tabs
export type MatrixStudioMode = 'arithmetic' | 'unary' | 'advanced' | 'linearsystem' | 'visualizer';
export type DisplayFormat = 'decimal' | 'fraction';

// Binary Arithmetic operations
export type BinaryOp = 'add' | 'subtract' | 'multiply' | 'hadamard' | 'kronecker';

// Unary Matrix Transforms
export type UnaryOp = 'det' | 'inv' | 'transpose' | 'rank_nullity' | 'trace' | 'power' | 'scalar_mult' | 'norm_cond';

// Advanced Decompositions & Spectral
export type AdvancedOp = 'rref' | 'eigen' | 'lu' | 'qr' | 'cholesky';

// Helper: Convert decimal float to exact rational fraction string (Continued Fractions)
function toFractionString(val: number, tolerance = 1e-6): string {
  if (Math.abs(val) < 1e-11) return '0';
  if (Number.isInteger(val)) return val.toString();

  const sign = val < 0 ? '-' : '';
  const x = Math.abs(val);

  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = x;
  let iter = 0;
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    if (Math.abs(b - a) < 1e-12) break;
    b = 1 / (b - a);
    iter++;
  } while (Math.abs(x - h1 / k1) > x * tolerance && k1 < 10000 && iter < 15);

  if (k1 === 1) return `${sign}${h1}`;
  return `${sign}${h1}/${k1}`;
}

// Format single cell according to display format
function formatCell(val: number, fmt: DisplayFormat, decimals = 3): string {
  if (Math.abs(val) < 1e-11) return '0';
  if (fmt === 'fraction') {
    return toFractionString(val);
  }
  return Number.isInteger(val) ? val.toString() : parseFloat(val.toFixed(decimals)).toString();
}

// Matrix creator
function createEmptyMatrix(rows: number, cols: number, fill = 0): number[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}

// Deep clone matrix
function cloneMatrix(m: number[][]): number[][] {
  return m.map(row => [...row]);
}

// RREF with full step recording
function computeRREFWithSteps(matrix: number[][]): { rref: number[][]; rank: number; steps: string[] } {
  const steps: string[] = [];
  const m = matrix.length;
  const n = matrix[0].length;
  const A = cloneMatrix(matrix);
  let lead = 0;
  let rank = 0;

  steps.push(`Beginning Gauss-Jordan elimination on ${m}×${n} matrix.`);

  for (let r = 0; r < m; r++) {
    if (lead >= n) break;
    let i = r;
    while (Math.abs(A[i][lead]) < 1e-10) {
      i++;
      if (i === m) {
        i = r;
        lead++;
        if (lead === n) break;
      }
    }
    if (lead >= n) break;

    if (i !== r) {
      const temp = A[i];
      A[i] = A[r];
      A[r] = temp;
      steps.push(`Swap Row ${r + 1} ↔ Row ${i + 1}`);
    }

    const pivot = A[r][lead];
    if (Math.abs(pivot - 1) > 1e-9 && Math.abs(pivot) > 1e-9) {
      for (let j = 0; j < n; j++) {
        A[r][j] /= pivot;
      }
      steps.push(`Scale pivot Row ${r + 1}: R_${r + 1} = R_${r + 1} / (${parseFloat(pivot.toFixed(3))})`);
    }

    for (let rowIdx = 0; rowIdx < m; rowIdx++) {
      if (rowIdx !== r) {
        const factor = A[rowIdx][lead];
        if (Math.abs(factor) > 1e-9) {
          for (let colIdx = 0; colIdx < n; colIdx++) {
            A[rowIdx][colIdx] -= factor * A[r][colIdx];
          }
          steps.push(`Eliminate Row ${rowIdx + 1}: R_${rowIdx + 1} = R_${rowIdx + 1} - (${parseFloat(factor.toFixed(3))}) · R_${r + 1}`);
        }
      }
    }
    lead++;
    rank++;
  }

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (Math.abs(A[i][j]) < 1e-10) A[i][j] = 0;
    }
  }

  steps.push(`Gauss-Jordan completed. Final matrix is in Reduced Row Echelon Form (Rank = ${rank}).`);
  return { rref: A, rank, steps };
}

// Linear System Solver (Ax = b)
function solveLinearSystemWithSteps(
  A: number[][],
  b: number[]
): { status: 'unique' | 'infinite' | 'inconsistent'; solution: number[] | null; steps: string[]; freeVariablesCount: number } {
  const m = A.length;
  const n = A[0].length;
  const steps: string[] = [];

  steps.push(`Constructing Augmented Matrix [A | b] with ${m} equations and ${n} variables.`);

  // Build augmented matrix
  const aug: number[][] = [];
  for (let i = 0; i < m; i++) {
    aug.push([...A[i], b[i] ?? 0]);
  }

  const { rref: augRREF, rank: augRank, steps: rrefSteps } = computeRREFWithSteps(aug);
  steps.push(...rrefSteps);

  // Check coeff matrix rank vs augmented rank
  const coeffRREF = augRREF.map(row => row.slice(0, n));
  let coeffRank = 0;
  for (let r = 0; r < m; r++) {
    if (coeffRREF[r].some(val => Math.abs(val) > 1e-9)) {
      coeffRank++;
    }
  }

  // Rouché–Capelli theorem:
  if (coeffRank < augRank) {
    steps.push(`Inconsistent System: rank(A) = ${coeffRank} < rank([A|b]) = ${augRank}. A row of the form [0 0 ... 0 | c] exists with c ≠ 0.`);
    return { status: 'inconsistent', solution: null, steps, freeVariablesCount: 0 };
  }

  if (coeffRank < n) {
    const freeVars = n - coeffRank;
    steps.push(`Indeterminate System: rank(A) = rank([A|b]) = ${coeffRank} < ${n} variables. There are ${freeVars} free parameter(s) and infinitely many solutions.`);
    return { status: 'infinite', solution: null, steps, freeVariablesCount: freeVars };
  }

  // Unique solution
  const solution: number[] = [];
  for (let i = 0; i < n; i++) {
    solution.push(augRREF[i][n]);
  }

  steps.push(`Consistent & Independent System: rank(A) = ${coeffRank} = ${n}. Unique solution vector found.`);
  return { status: 'unique', solution, steps, freeVariablesCount: 0 };
}

export default function MatrixCalculator() {
  // Navigation Studio Mode
  const [studioMode, setStudioMode] = useState<MatrixStudioMode>('arithmetic');
  const [displayFmt, setDisplayFmt] = useState<DisplayFormat>('decimal');

  // Matrix A Dimensions (Rows x Cols)
  const [rowsA, setRowsA] = useState<number>(3);
  const [colsA, setColsA] = useState<number>(3);

  // Matrix B Dimensions (Rows x Cols)
  const [rowsB, setRowsB] = useState<number>(3);
  const [colsB, setColsB] = useState<number>(3);

  // Matrix Values
  const [matrixA, setMatrixA] = useState<number[][]>(() => [
    [1, 2, 3],
    [0, 1, 4],
    [5, 6, 0]
  ]);

  const [matrixB, setMatrixB] = useState<number[][]>(() => [
    [2, 0, -1],
    [1, 3, 2],
    [0, -2, 1]
  ]);

  // Linear System Vector b
  const [vectorB, setVectorB] = useState<number[]>(() => [1, 2, 3]);

  // Operation Selectors
  const [binaryOp, setBinaryOp] = useState<BinaryOp>('multiply');
  const [unaryOp, setUnaryOp] = useState<UnaryOp>('det');
  const [advancedOp, setAdvancedOp] = useState<AdvancedOp>('rref');

  // Scalar multiplier & Matrix Power
  const [scalarK, setScalarK] = useState<number>(2);
  const [powerK, setPowerK] = useState<number>(2);

  // Feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  // Synchronize matrix grid dimensions when size changes
  const handleDimensionChangeA = (newRows: number, newCols: number) => {
    const r = Math.max(1, Math.min(6, newRows));
    const c = Math.max(1, Math.min(6, newCols));
    setRowsA(r);
    setColsA(c);
    setMatrixA(prev => {
      const next = createEmptyMatrix(r, c);
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          next[i][j] = prev[i]?.[j] ?? 0;
        }
      }
      return next;
    });
    // Also adjust vector b length if in linear system mode
    setVectorB(prev => {
      const nextB = Array(r).fill(0);
      for (let i = 0; i < r; i++) {
        nextB[i] = prev[i] ?? 0;
      }
      return nextB;
    });
  };

  const handleDimensionChangeB = (newRows: number, newCols: number) => {
    const r = Math.max(1, Math.min(6, newRows));
    const c = Math.max(1, Math.min(6, newCols));
    setRowsB(r);
    setColsB(c);
    setMatrixB(prev => {
      const next = createEmptyMatrix(r, c);
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          next[i][j] = prev[i]?.[j] ?? 0;
        }
      }
      return next;
    });
  };

  // Cell Updates
  const handleCellChangeA = (r: number, c: number, valStr: string) => {
    const num = parseFloat(valStr) || 0;
    setMatrixA(prev => {
      const copy = cloneMatrix(prev);
      if (copy[r]) copy[r][c] = num;
      return copy;
    });
  };

  const handleCellChangeB = (r: number, c: number, valStr: string) => {
    const num = parseFloat(valStr) || 0;
    setMatrixB(prev => {
      const copy = cloneMatrix(prev);
      if (copy[r]) copy[r][c] = num;
      return copy;
    });
  };

  const handleVectorBCellChange = (idx: number, valStr: string) => {
    const num = parseFloat(valStr) || 0;
    setVectorB(prev => {
      const copy = [...prev];
      copy[idx] = num;
      return copy;
    });
  };

  // Preset Loaders
  const loadPreset = (presetName: string) => {
    switch (presetName) {
      case 'identity_3':
        handleDimensionChangeA(3, 3);
        setMatrixA([
          [1, 0, 0],
          [0, 1, 0],
          [0, 0, 1]
        ]);
        break;
      case 'symmetric_3':
        handleDimensionChangeA(3, 3);
        setMatrixA([
          [4, 1, -2],
          [1, 2, 0],
          [-2, 0, 5]
        ]);
        break;
      case 'rotation_2d_45':
        handleDimensionChangeA(2, 2);
        handleDimensionChangeB(2, 2);
        {
          const cos45 = Math.cos(Math.PI / 4);
          const sin45 = Math.sin(Math.PI / 4);
          setMatrixA([
            [cos45, -sin45],
            [sin45, cos45]
          ]);
        }
        break;
      case 'shear_2d':
        handleDimensionChangeA(2, 2);
        setMatrixA([
          [1, 1.5],
          [0, 1]
        ]);
        break;
      case 'hilbert_3':
        handleDimensionChangeA(3, 3);
        setMatrixA([
          [1, 1 / 2, 1 / 3],
          [1 / 2, 1 / 3, 1 / 4],
          [1 / 3, 1 / 4, 1 / 5]
        ]);
        break;
      case 'magic_square_3':
        handleDimensionChangeA(3, 3);
        setMatrixA([
          [8, 1, 6],
          [3, 5, 7],
          [4, 9, 2]
        ]);
        break;
      case 'markov_transition_3':
        handleDimensionChangeA(3, 3);
        setMatrixA([
          [0.7, 0.2, 0.1],
          [0.1, 0.8, 0.1],
          [0.3, 0.3, 0.4]
        ]);
        break;
      case 'random_integers':
        setMatrixA(prev =>
          prev.map(row => row.map(() => Math.floor(Math.random() * 11) - 5))
        );
        setMatrixB(prev =>
          prev.map(row => row.map(() => Math.floor(Math.random() * 11) - 5))
        );
        break;
    }
  };

  // Active matrix slices based on row/col states
  const activeMatrixA = useMemo(() => {
    return matrixA.slice(0, rowsA).map(row => row.slice(0, colsA));
  }, [matrixA, rowsA, colsA]);

  const activeMatrixB = useMemo(() => {
    return matrixB.slice(0, rowsB).map(row => row.slice(0, colsB));
  }, [matrixB, rowsB, colsB]);

  const activeVectorB = useMemo(() => {
    return vectorB.slice(0, rowsA);
  }, [vectorB, rowsA]);

  // Main Computation Engine
  const computation = useMemo(() => {
    const steps: string[] = [];
    let error: string | null = null;
    let resultMatrix: number[][] | null = null;
    let resultScalar: number | null = null;
    let resultText: string | null = null;
    let extraData: any = null;

    try {
      // 1. ARITHMETIC MODE
      if (studioMode === 'arithmetic') {
        switch (binaryOp) {
          case 'add': {
            if (rowsA !== rowsB || colsA !== colsB) {
              throw new Error(`Matrix Addition requires identical dimensions. Matrix A is ${rowsA}×${colsA}, Matrix B is ${rowsB}×${colsB}.`);
            }
            steps.push(`Formula: C[i][j] = A[i][j] + B[i][j] for dimensions ${rowsA}×${colsA}`);
            const C = createEmptyMatrix(rowsA, colsA);
            for (let i = 0; i < rowsA; i++) {
              for (let j = 0; j < colsA; j++) {
                C[i][j] = activeMatrixA[i][j] + activeMatrixB[i][j];
              }
            }
            resultMatrix = C;
            steps.push(`Row 1 addition: ` + activeMatrixA[0].map((v, j) => `(${v} + ${activeMatrixB[0][j]} = ${C[0][j]})`).join(', '));
            break;
          }
          case 'subtract': {
            if (rowsA !== rowsB || colsA !== colsB) {
              throw new Error(`Matrix Subtraction requires identical dimensions. Matrix A is ${rowsA}×${colsA}, Matrix B is ${rowsB}×${colsB}.`);
            }
            steps.push(`Formula: C[i][j] = A[i][j] - B[i][j] for dimensions ${rowsA}×${colsA}`);
            const C = createEmptyMatrix(rowsA, colsA);
            for (let i = 0; i < rowsA; i++) {
              for (let j = 0; j < colsA; j++) {
                C[i][j] = activeMatrixA[i][j] - activeMatrixB[i][j];
              }
            }
            resultMatrix = C;
            steps.push(`Row 1 subtraction: ` + activeMatrixA[0].map((v, j) => `(${v} - ${activeMatrixB[0][j]} = ${C[0][j]})`).join(', '));
            break;
          }
          case 'multiply': {
            if (colsA !== rowsB) {
              throw new Error(`Matrix Multiplication A × B requires Columns of A (${colsA}) to equal Rows of B (${rowsB}).`);
            }
            steps.push(`Formula: C[i][j] = ∑ (A[i][k] · B[k][j]). Result dimension is ${rowsA}×${colsB}.`);
            const C = createEmptyMatrix(rowsA, colsB);
            for (let i = 0; i < rowsA; i++) {
              for (let j = 0; j < colsB; j++) {
                let sum = 0;
                for (let k = 0; k < colsA; k++) {
                  sum += activeMatrixA[i][k] * activeMatrixB[k][j];
                }
                C[i][j] = sum;
              }
            }
            resultMatrix = C;
            steps.push(`C[1][1] dot product: ` + activeMatrixA[0].map((v, k) => `(${v}·${activeMatrixB[k][0]})`).join(' + ') + ` = ${C[0][0]}`);
            break;
          }
          case 'hadamard': {
            if (rowsA !== rowsB || colsA !== colsB) {
              throw new Error(`Hadamard (element-wise) product requires identical dimensions (${rowsA}×${colsA} vs ${rowsB}×${colsB}).`);
            }
            steps.push(`Hadamard Product (A ⊙ B): C[i][j] = A[i][j] · B[i][j]`);
            const C = createEmptyMatrix(rowsA, colsA);
            for (let i = 0; i < rowsA; i++) {
              for (let j = 0; j < colsA; j++) {
                C[i][j] = activeMatrixA[i][j] * activeMatrixB[i][j];
              }
            }
            resultMatrix = C;
            break;
          }
          case 'kronecker': {
            steps.push(`Kronecker Tensor Product (A ⊗ B): Result dimension is (${rowsA}·${rowsB}) × (${colsA}·${colsB}) = ${rowsA * rowsB}×${colsA * colsB}.`);
            const kronM = math.kron(activeMatrixA, activeMatrixB) as any;
            resultMatrix = Array.isArray(kronM) ? kronM : (kronM.toArray ? kronM.toArray() : kronM);
            break;
          }
        }
      }

      // 2. UNARY PROPERTIES MODE
      else if (studioMode === 'unary') {
        const isSquare = rowsA === colsA;

        switch (unaryOp) {
          case 'det': {
            if (!isSquare) throw new Error('Determinant det(A) is only defined for square matrices (n×n).');
            const detVal = math.det(activeMatrixA);
            resultScalar = detVal;
            steps.push(`Determinant calculated via PLU Laplace expansion: det(A) = ${detVal}`);
            if (Math.abs(detVal) < 1e-10) {
              steps.push(`det(A) = 0: The matrix is SINGULAR (non-invertible, rank-deficient).`);
            } else {
              steps.push(`det(A) ≠ 0: The matrix is NON-SINGULAR (invertible, full rank).`);
            }
            break;
          }
          case 'inv': {
            if (!isSquare) throw new Error('Matrix Inverse A⁻¹ is only defined for square matrices (n×n).');
            const detVal = math.det(activeMatrixA);
            if (Math.abs(detVal) < 1e-10) {
              throw new Error('Matrix is singular (det(A) = 0), therefore no multiplicative inverse exists.');
            }
            const invM = math.inv(activeMatrixA) as any;
            resultMatrix = Array.isArray(invM) ? invM : invM.toArray();
            steps.push(`Inverse computed via Adjugate / Gaussian Elimination: A⁻¹ = (1/det(A)) · Adj(A).`);
            break;
          }
          case 'transpose': {
            steps.push(`Transpose (A^T): Swapping rows and columns. Dimensions change from ${rowsA}×${colsA} to ${colsA}×${rowsA}.`);
            const T = createEmptyMatrix(colsA, rowsA);
            for (let i = 0; i < rowsA; i++) {
              for (let j = 0; j < colsA; j++) {
                T[j][i] = activeMatrixA[i][j];
              }
            }
            resultMatrix = T;
            break;
          }
          case 'rank_nullity': {
            const { rank, steps: rrefSteps } = computeRREFWithSteps(activeMatrixA);
            const nullity = colsA - rank;
            resultText = `Rank = ${rank}, Nullity = ${nullity}`;
            extraData = { rank, nullity, totalColumns: colsA };
            steps.push(...rrefSteps);
            steps.push(`Rank-Nullity Theorem: Rank(${rank}) + Nullity(${nullity}) = Total Columns (${colsA}).`);
            break;
          }
          case 'trace': {
            if (!isSquare) throw new Error('Matrix Trace tr(A) is only defined for square matrices (n×n).');
            let tr = 0;
            const terms: string[] = [];
            for (let i = 0; i < rowsA; i++) {
              tr += activeMatrixA[i][i];
              terms.push(`A[${i + 1}][${i + 1}](${activeMatrixA[i][i]})`);
            }
            resultScalar = tr;
            steps.push(`Trace tr(A) = Sum of main diagonal elements: ${terms.join(' + ')} = ${tr}`);
            break;
          }
          case 'power': {
            if (!isSquare) throw new Error('Matrix Power A^k is only defined for square matrices (n×n).');
            let res = cloneMatrix(activeMatrixA);
            steps.push(`Computing A^${powerK} using successive matrix multiplications.`);
            for (let p = 1; p < powerK; p++) {
              const next = createEmptyMatrix(rowsA, colsA);
              for (let i = 0; i < rowsA; i++) {
                for (let j = 0; j < colsA; j++) {
                  let sum = 0;
                  for (let k = 0; k < colsA; k++) {
                    sum += res[i][k] * activeMatrixA[k][j];
                  }
                  next[i][j] = sum;
                }
              }
              res = next;
            }
            resultMatrix = res;
            break;
          }
          case 'scalar_mult': {
            steps.push(`Multiplying each element by scalar k = ${scalarK}: C[i][j] = ${scalarK} · A[i][j]`);
            const C = activeMatrixA.map(row => row.map(v => v * scalarK));
            resultMatrix = C;
            break;
          }
          case 'norm_cond': {
            const frob = math.norm(activeMatrixA, 'fro') as number;
            const norm1 = math.norm(activeMatrixA, 1) as number;
            const normInf = math.norm(activeMatrixA, Infinity) as number;
            let cond: number | null = null;
            if (isSquare && Math.abs(math.det(activeMatrixA)) > 1e-9) {
              const invNorm1 = math.norm(math.inv(activeMatrixA), 1) as number;
              cond = norm1 * invNorm1;
            }
            extraData = { frob, norm1, normInf, cond };
            resultText = `Frobenius Norm = ${frob.toFixed(4)}, 1-Norm = ${norm1.toFixed(4)}, ∞-Norm = ${normInf.toFixed(4)}`;
            steps.push(`Frobenius Norm ||A||_F = √(∑ |a_ij|²) = ${frob.toFixed(4)}`);
            steps.push(`1-Norm (Max absolute column sum) = ${norm1.toFixed(4)}`);
            steps.push(`∞-Norm (Max absolute row sum) = ${normInf.toFixed(4)}`);
            if (cond !== null) {
              steps.push(`Condition Number κ(A) = ||A||₁ · ||A⁻¹||₁ = ${cond.toFixed(4)}`);
            }
            break;
          }
        }
      }

      // 3. ADVANCED DECOMPOSITIONS & SPECTRAL
      else if (studioMode === 'advanced') {
        const isSquare = rowsA === colsA;

        switch (advancedOp) {
          case 'rref': {
            const { rref, rank, steps: rrefSteps } = computeRREFWithSteps(activeMatrixA);
            resultMatrix = rref;
            steps.push(...rrefSteps);
            extraData = { rank };
            break;
          }
          case 'eigen': {
            if (!isSquare) throw new Error('Eigenvalues & Eigenvectors are only defined for square matrices (n×n).');
            if (rowsA > 3) throw new Error('Spectral Eigendecomposition is supported for 2×2 and 3×3 matrices.');

            try {
              const eigResult: any = math.eigs(activeMatrixA);
              const valsRaw = eigResult.values;
              const valsFormatted: { re: number; im: number; valStr: string }[] = [];

              if (Array.isArray(valsRaw)) {
                valsRaw.forEach((v: any) => {
                  if (typeof v === 'number') {
                    valsFormatted.push({ re: v, im: 0, valStr: parseFloat(v.toFixed(4)).toString() });
                  } else if (v && typeof v.re === 'number') {
                    const imStr = v.im >= 0 ? `+ ${v.im.toFixed(3)}i` : `- ${Math.abs(v.im).toFixed(3)}i`;
                    valsFormatted.push({ re: v.re, im: v.im, valStr: `${v.re.toFixed(3)} ${imStr}` });
                  }
                });
              } else if (valsRaw && valsRaw.toArray) {
                const arr = valsRaw.toArray();
                arr.forEach((v: any) => {
                  if (typeof v === 'number') {
                    valsFormatted.push({ re: v, im: 0, valStr: parseFloat(v.toFixed(4)).toString() });
                  } else if (v && typeof v.re === 'number') {
                    const imStr = v.im >= 0 ? `+ ${v.im.toFixed(3)}i` : `- ${Math.abs(v.im).toFixed(3)}i`;
                    valsFormatted.push({ re: v.re, im: v.im, valStr: `${v.re.toFixed(3)} ${imStr}` });
                  }
                });
              }

              extraData = { eigenvalues: valsFormatted, vectors: eigResult.vectors };
              resultText = `Eigenvalues λ: ${valsFormatted.map(v => v.valStr).join(', ')}`;
              steps.push(`Characteristic equation: det(A - λI) = 0`);
              steps.push(`Computed ${valsFormatted.length} eigenvalue root(s).`);
            } catch (e: any) {
              throw new Error(`Eigen computation failed: ${e.message}`);
            }
            break;
          }
          case 'lu': {
            if (!isSquare) throw new Error('LU Decomposition requires a square matrix (n×n).');
            const lupResult: any = math.lup(activeMatrixA);
            const L = lupResult.L;
            const U = lupResult.U;
            const P = lupResult.P;
            extraData = { L, U, P };
            resultText = `LU Decomposition: P · A = L · U`;
            steps.push(`Computed Lower Triangular (L), Upper Triangular (U), and Permutation Vector (P).`);
            break;
          }
          case 'qr': {
            const qrResult: any = math.qr(activeMatrixA);
            const Q = qrResult.Q;
            const R = qrResult.R;
            extraData = { Q, R };
            resultText = `QR Decomposition: A = Q · R (Q is orthogonal, R is upper triangular)`;
            steps.push(`Gram-Schmidt orthogonalization performed. Q is ${rowsA}×${colsA}, R is ${colsA}×${colsA}.`);
            break;
          }
          case 'cholesky': {
            if (!isSquare) throw new Error('Cholesky decomposition requires a symmetric positive-definite square matrix.');
            // Verify symmetry
            for (let i = 0; i < rowsA; i++) {
              for (let j = 0; j < colsA; j++) {
                if (Math.abs(activeMatrixA[i][j] - activeMatrixA[j][i]) > 1e-7) {
                  throw new Error('Cholesky decomposition requires matrix A to be symmetric (A = A^T).');
                }
              }
            }

            // Cholesky Banachiewicz algorithm
            const n = rowsA;
            const L = createEmptyMatrix(n, n);
            for (let i = 0; i < n; i++) {
              for (let j = 0; j <= i; j++) {
                let sum = 0;
                for (let k = 0; k < j; k++) {
                  sum += L[i][k] * L[j][k];
                }
                if (i === j) {
                  const val = activeMatrixA[i][i] - sum;
                  if (val <= 0) {
                    throw new Error('Matrix is NOT positive-definite (leading principal minor ≤ 0). Cholesky factor undefined.');
                  }
                  L[i][j] = Math.sqrt(val);
                } else {
                  L[i][j] = (activeMatrixA[i][j] - sum) / L[j][j];
                }
              }
            }
            extraData = { L, LT: math.transpose(L) };
            resultMatrix = L;
            steps.push(`Cholesky Decomposition successful: A = L · L^T (L is lower triangular with positive diagonal elements).`);
            break;
          }
        }
      }

      // 4. LINEAR SYSTEM SOLVER (Ax = b)
      else if (studioMode === 'linearsystem') {
        const sysResult = solveLinearSystemWithSteps(activeMatrixA, activeVectorB);
        steps.push(...sysResult.steps);
        extraData = sysResult;
        if (sysResult.status === 'unique' && sysResult.solution) {
          resultText = `Unique Solution: ` + sysResult.solution.map((x, i) => `x${i + 1} = ${formatCell(x, displayFmt, 4)}`).join(', ');
        } else if (sysResult.status === 'infinite') {
          resultText = `Infinitely Many Solutions (${sysResult.freeVariablesCount} free parameter${sysResult.freeVariablesCount > 1 ? 's' : ''})`;
        } else {
          resultText = `No Solution (System Inconsistent: 0 = c)`;
        }
      }

      // 5. 2D TRANSFORMATION VISUALIZER
      else if (studioMode === 'visualizer') {
        if (rowsA !== 2 || colsA !== 2) {
          // Force 2x2 for visualizer
          steps.push('2D Transformation Visualizer requires 2×2 matrix.');
        }
        const a = activeMatrixA[0]?.[0] ?? 1;
        const b = activeMatrixA[0]?.[1] ?? 0;
        const c = activeMatrixA[1]?.[0] ?? 0;
        const d = activeMatrixA[1]?.[1] ?? 1;
        const det = a * d - b * c;
        extraData = { a, b, c, d, det };
        resultText = `Determinant Area Scale = ${Math.abs(det).toFixed(3)} (${det < 0 ? 'Orientation Inverted' : 'Orientation Preserved'})`;
      }

    } catch (e: any) {
      error = e.message || 'Matrix calculation error.';
    }

    return {
      error,
      steps,
      resultMatrix,
      resultScalar,
      resultText,
      extraData
    };
  }, [
    studioMode,
    binaryOp,
    unaryOp,
    advancedOp,
    rowsA,
    colsA,
    rowsB,
    colsB,
    activeMatrixA,
    activeMatrixB,
    activeVectorB,
    scalarK,
    powerK,
    displayFmt
  ]);

  // Copy Result Handlers
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopiedLabel(label);
    setTimeout(() => {
      setCopied(false);
      setCopiedLabel(null);
    }, 2000);
  };

  // Export Matrix to CSV
  const handleExportCSV = (matrix: number[][], filename = 'matrix_result.csv') => {
    const csv = matrix.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Polyglot Formatters
  const getLaTeX = (m: number[][]) => {
    return `\\begin{pmatrix}\n` + m.map(row => '  ' + row.map(v => formatCell(v, displayFmt)).join(' & ')).join(' \\\\\n') + `\n\\end{pmatrix}`;
  };

  const getNumPy = (m: number[][]) => {
    return `import numpy as np\n\nA = np.array([\n` + m.map(row => '    [' + row.join(', ') + ']').join(',\n') + `\n])`;
  };

  const getMATLAB = (m: number[][]) => {
    return `A = [\n` + m.map(row => '  ' + row.join(' ')).join(';\n') + `\n];`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* AEO Quick Definition Card */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3.5 shadow-xs">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
          <p className="font-bold text-zinc-900 dark:text-white text-sm">
            What is a Matrix and Linear Transformation?
          </p>
          <p className="leading-relaxed">
            A <strong>matrix</strong> is a rectangular array of numbers arranged in rows and columns that represents linear systems, coordinate transformations, and spatial tensors. Fundamental operations include matrix multiplication (<em>A &times; B</em>), inversion (<em>A<sup>-1</sup></em>), determinants (<em>det A</em>), spectral eigendecomposition (<em>A&middot;v = &lambda;&middot;v</em>), and Gaussian elimination (RREF).
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Matrix Editors & Dimension Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Navigation Tabs */}
          <div className="saas-card p-5 space-y-4">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 mb-2.5">
                <Grid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Matrix Studio Mode
              </span>

              <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-xs">
                {[
                  { id: 'arithmetic', label: 'Arithmetic' },
                  { id: 'unary', label: 'Properties' },
                  { id: 'advanced', label: 'Decompose' },
                  { id: 'linearsystem', label: 'Ax = b' },
                  { id: 'visualizer', label: '2D Visual' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStudioMode(tab.id as MatrixStudioMode);
                      if (tab.id === 'visualizer') {
                        handleDimensionChangeA(2, 2);
                      }
                    }}
                    className={`py-1.5 px-1 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                      studioMode === tab.id
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Operations Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {studioMode === 'arithmetic' && (
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'add', label: 'A + B' },
                    { id: 'subtract', label: 'A - B' },
                    { id: 'multiply', label: 'A × B' },
                    { id: 'hadamard', label: 'A ⊙ B (Hadamard)' },
                    { id: 'kronecker', label: 'A ⊗ B (Kronecker)' }
                  ].map(op => (
                    <button
                      key={op.id}
                      onClick={() => setBinaryOp(op.id as BinaryOp)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                        binaryOp === op.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              )}

              {studioMode === 'unary' && (
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'det', label: 'det(A)' },
                    { id: 'inv', label: 'A⁻¹ (Inverse)' },
                    { id: 'transpose', label: 'Aᵀ (Transpose)' },
                    { id: 'rank_nullity', label: 'Rank & Nullity' },
                    { id: 'trace', label: 'tr(A) (Trace)' },
                    { id: 'power', label: `A^${powerK}` },
                    { id: 'scalar_mult', label: `${scalarK} · A` },
                    { id: 'norm_cond', label: 'Norms & Condition' }
                  ].map(op => (
                    <button
                      key={op.id}
                      onClick={() => setUnaryOp(op.id as UnaryOp)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                        unaryOp === op.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              )}

              {studioMode === 'advanced' && (
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'rref', label: 'RREF (Gauss-Jordan)' },
                    { id: 'eigen', label: 'Eigenvalues (λ, v)' },
                    { id: 'lu', label: 'LU Decomposition' },
                    { id: 'qr', label: 'QR Decomposition' },
                    { id: 'cholesky', label: 'Cholesky (L · Lᵀ)' }
                  ].map(op => (
                    <button
                      key={op.id}
                      onClick={() => setAdvancedOp(op.id as AdvancedOp)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                        advancedOp === op.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Fractional / Decimal Format Toggle */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold shrink-0 ml-auto">
                <button
                  onClick={() => setDisplayFmt('decimal')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${displayFmt === 'decimal' ? 'bg-white dark:bg-zinc-900 text-indigo-600 shadow-xs' : 'text-zinc-500'}`}
                >
                  Decimal
                </button>
                <button
                  onClick={() => setDisplayFmt('fraction')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${displayFmt === 'fraction' ? 'bg-white dark:bg-zinc-900 text-indigo-600 shadow-xs' : 'text-zinc-500'}`}
                >
                  Fraction (a/b)
                </button>
              </div>
            </div>

            {/* Extra Slider Controls for Power / Scalar */}
            {studioMode === 'unary' && unaryOp === 'power' && (
              <div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Matrix Power Exponent (k):</span>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={powerK}
                  onChange={(e) => setPowerK(parseInt(e.target.value))}
                  className="flex-1 accent-indigo-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-indigo-600 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950">
                  k = {powerK}
                </span>
              </div>
            )}

            {studioMode === 'unary' && unaryOp === 'scalar_mult' && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Scalar Multiplier (k):</span>
                <input
                  type="number"
                  step="any"
                  value={scalarK}
                  onChange={(e) => setScalarK(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2.5 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono font-bold"
                />
              </div>
            )}

            {/* Preset Archetypes Dropdown */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-200 dark:border-zinc-800 text-xs">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Presets:
              </span>
              {[
                { id: 'identity_3', label: 'Identity (3×3)' },
                { id: 'symmetric_3', label: 'Symmetric' },
                { id: 'rotation_2d_45', label: '2D Rotation 45°' },
                { id: 'shear_2d', label: '2D Shear' },
                { id: 'hilbert_3', label: 'Hilbert' },
                { id: 'magic_square_3', label: 'Magic Square' },
                { id: 'markov_transition_3', label: 'Markov' }
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => loadPreset(preset.id)}
                  className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 text-[11px] font-medium transition cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => loadPreset('random_integers')}
                className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Shuffle className="w-3 h-3" /> Random [-5, 5]
              </button>
            </div>
          </div>

          {/* Matrix Input Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Matrix A Card */}
            <div className="saas-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5" />
                  Matrix A ({rowsA}×{colsA})
                </span>

                {/* Dimension Selectors */}
                <div className="flex items-center gap-1 text-xs">
                  <select
                    value={rowsA}
                    onChange={(e) => handleDimensionChangeA(parseInt(e.target.value), colsA)}
                    className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} rows</option>)}
                  </select>
                  <span className="text-zinc-400 font-bold">×</span>
                  <select
                    value={colsA}
                    onChange={(e) => handleDimensionChangeA(rowsA, parseInt(e.target.value))}
                    className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} cols</option>)}
                  </select>
                </div>
              </div>

              {/* Grid Inputs for A */}
              <div
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${colsA}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: rowsA }).map((_, rIdx) =>
                  Array.from({ length: colsA }).map((_, cIdx) => (
                    <input
                      key={`A-${rIdx}-${cIdx}`}
                      type="number"
                      step="any"
                      value={matrixA[rIdx]?.[cIdx] ?? ''}
                      placeholder="0"
                      onChange={(e) => handleCellChangeA(rIdx, cIdx, e.target.value)}
                      className="w-full py-2 px-1 rounded-lg border border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-900 text-center font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-indigo-500"
                    />
                  ))
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <button
                  onClick={() => setMatrixA(createEmptyMatrix(rowsA, colsA, 0))}
                  className="text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                >
                  Clear A
                </button>
                <button
                  onClick={() => {
                    const I = createEmptyMatrix(rowsA, colsA, 0);
                    for (let i = 0; i < Math.min(rowsA, colsA); i++) I[i][i] = 1;
                    setMatrixA(I);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
                >
                  Make Identity
                </button>
              </div>
            </div>

            {/* Matrix B Card (Only shown if studioMode is arithmetic) */}
            {studioMode === 'arithmetic' && (
              <div className="saas-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5" />
                    Matrix B ({rowsB}×{colsB})
                  </span>

                  {/* Dimension Selectors */}
                  <div className="flex items-center gap-1 text-xs">
                    <select
                      value={rowsB}
                      onChange={(e) => handleDimensionChangeB(parseInt(e.target.value), colsB)}
                      className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} rows</option>)}
                    </select>
                    <span className="text-zinc-400 font-bold">×</span>
                    <select
                      value={colsB}
                      onChange={(e) => handleDimensionChangeB(rowsB, parseInt(e.target.value))}
                      className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} cols</option>)}
                    </select>
                  </div>
                </div>

                {/* Grid Inputs for B */}
                <div
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${colsB}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: rowsB }).map((_, rIdx) =>
                    Array.from({ length: colsB }).map((_, cIdx) => (
                      <input
                        key={`B-${rIdx}-${cIdx}`}
                        type="number"
                        step="any"
                        value={matrixB[rIdx]?.[cIdx] ?? ''}
                        placeholder="0"
                        onChange={(e) => handleCellChangeB(rIdx, cIdx, e.target.value)}
                        className="w-full py-2 px-1 rounded-lg border border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-900 text-center font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-purple-500"
                      />
                    ))
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <button
                    onClick={() => setMatrixB(createEmptyMatrix(rowsB, colsB, 0))}
                    className="text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                  >
                    Clear B
                  </button>
                  <button
                    onClick={() => {
                      handleDimensionChangeB(rowsA, colsA);
                      setMatrixB(cloneMatrix(activeMatrixA));
                    }}
                    className="text-purple-600 dark:text-purple-400 hover:underline font-bold cursor-pointer"
                  >
                    Copy from A
                  </button>
                </div>
              </div>
            )}

            {/* Vector B Inputs (Only shown for Linear System Ax = b) */}
            {studioMode === 'linearsystem' && (
              <div className="saas-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                    Target Vector b ({rowsA}×1)
                  </span>
                </div>

                <div className="grid gap-1.5 max-w-[120px] mx-auto">
                  {Array.from({ length: rowsA }).map((_, idx) => (
                    <div key={`b-${idx}`} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-zinc-400 font-bold">b_{idx + 1} =</span>
                      <input
                        type="number"
                        step="any"
                        value={vectorB[idx] ?? ''}
                        placeholder="0"
                        onChange={(e) => handleVectorBCellChange(idx, e.target.value)}
                        className="w-full py-2 px-1 rounded-lg border border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-900 text-center font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-emerald-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-center text-[11px] pt-1">
                  <button
                    onClick={() => setVectorB(Array(rowsA).fill(0))}
                    className="text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                  >
                    Clear Vector b
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Computed Results, Visualizer & Exports (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Visualizer Mode SVG Canvas */}
          {studioMode === 'visualizer' && (
            <div className="saas-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  2D Transformation Geometry
                </span>
                <span className="text-[11px] font-mono text-indigo-600 font-bold">
                  det(T) = {computation.extraData?.det?.toFixed(2)}
                </span>
              </div>

              {/* 2D Coordinate Transformation Grid */}
              <div className="relative w-full rounded-2xl bg-zinc-950 p-2 border border-zinc-800 flex items-center justify-center select-none">
                {(() => {
                  const svgW = 340;
                  const svgH = 260;
                  const ox = svgW / 2;
                  const oy = svgH / 2;
                  const scale = 38;

                  const a = activeMatrixA[0]?.[0] ?? 1;
                  const b = activeMatrixA[0]?.[1] ?? 0;
                  const c = activeMatrixA[1]?.[0] ?? 0;
                  const d = activeMatrixA[1]?.[1] ?? 1;

                  // Transform coordinates
                  const tx = (x: number, y: number) => ox + (a * x + b * y) * scale;
                  const ty = (x: number, y: number) => oy - (c * x + d * y) * scale;

                  // Unit square corners
                  const p0 = `${tx(0, 0)},${ty(0, 0)}`;
                  const p1 = `${tx(1, 0)},${ty(1, 0)}`;
                  const p2 = `${tx(1, 1)},${ty(1, 1)}`;
                  const p3 = `${tx(0, 1)},${ty(0, 1)}`;

                  return (
                    <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible">
                      <defs>
                        <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                          <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
                        </marker>
                        <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                          <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
                        </marker>
                      </defs>

                      {/* Coordinate Axes */}
                      <line x1={0} y1={oy} x2={svgW} y2={oy} stroke="#3f3f46" strokeWidth={1} strokeDasharray="3,3" />
                      <line x1={ox} y1={0} x2={ox} y2={svgH} stroke="#3f3f46" strokeWidth={1} strokeDasharray="3,3" />

                      {/* Transformed Unit Square Area */}
                      <polygon
                        points={`${p0} ${p1} ${p2} ${p3}`}
                        fill="rgba(99, 102, 241, 0.15)"
                        stroke="#6366f1"
                        strokeWidth={1.5}
                      />

                      {/* Transformed Basis Vector i_hat = T([1, 0]) = [a, c] (Red) */}
                      <line
                        x1={ox}
                        y1={oy}
                        x2={tx(1, 0)}
                        y2={ty(1, 0)}
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        markerEnd="url(#arrow-red)"
                      />
                      <circle cx={tx(1, 0)} cy={ty(1, 0)} r={3.5} fill="#ef4444" />
                      <text x={tx(1, 0) + 6} y={ty(1, 0) - 4} fill="#ef4444" fontSize={10} fontWeight="bold" fontFamily="monospace">
                        T(î) = [{a}, {c}]
                      </text>

                      {/* Transformed Basis Vector j_hat = T([0, 1]) = [b, d] (Blue) */}
                      <line
                        x1={ox}
                        y1={oy}
                        x2={tx(0, 1)}
                        y2={ty(0, 1)}
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        markerEnd="url(#arrow-blue)"
                      />
                      <circle cx={tx(0, 1)} cy={ty(0, 1)} r={3.5} fill="#3b82f6" />
                      <text x={tx(0, 1) + 6} y={ty(0, 1) - 4} fill="#3b82f6" fontSize={10} fontWeight="bold" fontFamily="monospace">
                        T(ĵ) = [{b}, {d}]
                      </text>
                    </svg>
                  );
                })()}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Red arrow: transformed standard basis vector î. Blue arrow: transformed ĵ. Shaded polygon represents unit square area scaling by determinant |det(T)|.
              </p>
            </div>
          )}

          {/* Results Output Matrix / Card */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
              <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Computed Solution Matrix
              </span>

              {/* Action Exports */}
              {computation.resultMatrix && !computation.error && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportCSV(computation.resultMatrix!, 'matrix_solution.csv')}
                    className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button
                    onClick={() => handleCopy(getLaTeX(computation.resultMatrix!), 'latex')}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    {copied && copiedLabel === 'latex' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    LaTeX
                  </button>
                </div>
              )}
            </div>

            {/* Error Message Box */}
            {computation.error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium leading-relaxed">
                {computation.error}
              </div>
            )}

            {/* Result Matrix Grid Display */}
            {!computation.error && computation.resultMatrix && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 overflow-x-auto flex justify-center">
                  <div
                    className="inline-grid gap-2 border-l-2 border-r-2 border-zinc-800 dark:border-zinc-200 px-3 py-1 rounded-sm"
                    style={{ gridTemplateColumns: `repeat(${computation.resultMatrix[0].length}, minmax(48px, 1fr))` }}
                  >
                    {computation.resultMatrix.map((row, rIdx) =>
                      row.map((cell, cIdx) => (
                        <div
                          key={`res-${rIdx}-${cIdx}`}
                          className="py-2.5 px-2 rounded-lg bg-white dark:bg-zinc-850 text-center font-mono text-xs font-black border border-zinc-200 dark:border-zinc-750 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        >
                          {formatCell(cell, displayFmt, 4)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="text-center text-[10px] text-zinc-400 font-mono">
                  Dimension: {computation.resultMatrix.length} × {computation.resultMatrix[0].length}
                </div>
              </div>
            )}

            {/* Scalar / Single Result Output Display */}
            {!computation.error && computation.resultScalar !== null && (
              <div className="p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 text-center space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Calculated Scalar Output
                </span>
                <p className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {formatCell(computation.resultScalar, displayFmt, 6)}
                </p>
              </div>
            )}

            {/* Text Summary Result */}
            {!computation.error && computation.resultText && !computation.resultScalar && (
              <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 text-center">
                <p className="font-bold text-xs text-zinc-900 dark:text-white font-mono">
                  {computation.resultText}
                </p>
              </div>
            )}

            {/* Decompositions Cards (LU, QR, Eigen) */}
            {!computation.error && computation.extraData?.eigenvalues && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Eigenvalues & Spectrum
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {computation.extraData.eigenvalues.map((eig: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-400">&lambda;_{idx + 1} = </span>
                      <strong className="text-indigo-600 dark:text-indigo-400">{eig.valStr}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Polyglot Code Generator Bar */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="text-zinc-400 font-bold uppercase text-[10px] self-center">Copy Matrix As:</span>
              <button
                onClick={() => handleCopy(getNumPy(activeMatrixA), 'numpy')}
                className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-bold transition cursor-pointer"
              >
                {copied && copiedLabel === 'numpy' ? 'Copied NumPy!' : 'Python (NumPy)'}
              </button>
              <button
                onClick={() => handleCopy(getMATLAB(activeMatrixA), 'matlab')}
                className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-bold transition cursor-pointer"
              >
                {copied && copiedLabel === 'matlab' ? 'Copied MATLAB!' : 'MATLAB / Octave'}
              </button>
              <button
                onClick={() => handleCopy(JSON.stringify(activeMatrixA), 'json')}
                className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-bold transition cursor-pointer"
              >
                {copied && copiedLabel === 'json' ? 'Copied JSON!' : 'JSON Array'}
              </button>
            </div>
          </div>

          {/* Mathematical Derivation Steps */}
          {computation.steps.length > 0 && (
            <div className="saas-card p-5 space-y-3 font-mono text-xs">
              <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase font-sans flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                Step-by-Step Derivation & Reduction
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
                {computation.steps.map((step, idx) => (
                  <div key={idx} className="pl-2 border-l-2 border-indigo-400 dark:border-indigo-600 leading-relaxed">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fundamental Linear Algebra Guide Card */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
        <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Core Theorems of Linear Algebra & Matrix Systems
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">Invertible Matrix Theorem</p>
            <p className="text-[11px]">
              For an <em>n &times; n</em> matrix <em>A</em>, <em>det(A) &ne; 0</em> if and only if <em>A</em> is invertible, <em>rank(A) = n</em>, <em>nullity(A) = 0</em>, and <em>Ax = b</em> has a unique solution for every vector <em>b</em>.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">Rank-Nullity Theorem</p>
            <p className="text-[11px]">
              For any <em>m &times; n</em> matrix transformation, <em>rank(A) + nullity(A) = n</em> (number of columns). The rank represents the dimension of the column space / image, while nullity is the dimension of the kernel.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">Spectral Eigendecomposition</p>
            <p className="text-[11px]">
              Eigenvectors <em>v</em> satisfy <em>Av = &lambda;v</em>, meaning the transformation scales <em>v</em> by eigenvalue <em>&lambda;</em> without altering its direction. Real symmetric matrices always possess real eigenvalues and orthogonal eigenvectors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
