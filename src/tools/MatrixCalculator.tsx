import { useState, useMemo } from 'react';
import {
  matrixAdd, matrixSubtract, matrixMultiply, matrixTranspose,
  getDeterminant, getMatrixInverse, getMatrixRank
} from '../utils/mathCalc';
import type { Matrix } from '../utils/mathCalc';

export default function MatrixCalculator() {
  const [size, setSize] = useState<2 | 3 | 4>(3);
  const [op, setOp] = useState<'add' | 'subtract' | 'multiply' | 'transpose' | 'det' | 'inverse' | 'rank'>('add');

  // Initialize Matrix values
  const [matrixA, setMatrixA] = useState<number[][]>(() =>
    Array(4).fill(0).map(() => Array(4).fill(0))
  );
  const [matrixB, setMatrixB] = useState<number[][]>(() =>
    Array(4).fill(0).map(() => Array(4).fill(0))
  );

  const handleCellChange = (
    which: 'A' | 'B',
    row: number,
    col: number,
    val: string
  ) => {
    const num = parseFloat(val) || 0;
    if (which === 'A') {
      const copy = matrixA.map((r, rIdx) =>
        r.map((c, cIdx) => (rIdx === row && cIdx === col ? num : c))
      );
      setMatrixA(copy);
    } else {
      const copy = matrixB.map((r, rIdx) =>
        r.map((c, cIdx) => (rIdx === row && cIdx === col ? num : c))
      );
      setMatrixB(copy);
    }
  };

  // Slice matrix down to active size
  const activeA = useMemo(() => {
    return matrixA.slice(0, size).map(r => r.slice(0, size));
  }, [matrixA, size]);

  const activeB = useMemo(() => {
    return matrixB.slice(0, size).map(r => r.slice(0, size));
  }, [matrixB, size]);

  // Compute outputs and steps
  const calculationResult = useMemo(() => {
    let result: Matrix | number | null = null;
    let error: string | null = null;
    const steps: string[] = [];

    steps.push(`Performing operation: ${op.toUpperCase()} on active matrix dimensions (${size}x${size})`);

    try {
      switch (op) {
        case 'add':
          result = matrixAdd(activeA, activeB);
          steps.push("Matrix Addition formula: C[i][j] = A[i][j] + B[i][j]");
          for (let i = 0; i < size; i++) {
            steps.push(`Row ${i + 1} steps: ` + activeA[i].map((val, j) => `(${val} + ${activeB[i][j]} = ${(val + activeB[i][j]).toFixed(2)})`).join(', '));
          }
          break;
        case 'subtract':
          result = matrixSubtract(activeA, activeB);
          steps.push("Matrix Subtraction formula: C[i][j] = A[i][j] - B[i][j]");
          for (let i = 0; i < size; i++) {
            steps.push(`Row ${i + 1} steps: ` + activeA[i].map((val, j) => `(${val} - ${activeB[i][j]} = ${(val - activeB[i][j]).toFixed(2)})`).join(', '));
          }
          break;
        case 'multiply':
          result = matrixMultiply(activeA, activeB);
          steps.push("Matrix Multiplication formula: C[i][j] = sum(A[i][k] * B[k][j])");
          for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
              let dotProductTerms = [];
              let sum = 0;
              for (let k = 0; k < size; k++) {
                dotProductTerms.push(`${activeA[i][k]}*${activeB[k][j]}`);
                sum += activeA[i][k] * activeB[k][j];
              }
              steps.push(`C[${i+1}][${j+1}] = ${dotProductTerms.join(' + ')} = ${sum.toFixed(2)}`);
            }
          }
          break;
        case 'transpose':
          result = matrixTranspose(activeA);
          steps.push("Transpose formula: Transpose[i][j] = A[j][i]");
          break;
        case 'det':
          result = getDeterminant(activeA);
          steps.push(`Determinant value calculated: ${result}`);
          break;
        case 'inverse':
          result = getMatrixInverse(activeA);
          if (!result) {
            error = "Matrix is singular (determinant is 0), so it has no inverse.";
            steps.push("Inverse fails because determinant = 0.");
          } else {
            steps.push("Inverse found successfully using cofactor method.");
          }
          break;
        case 'rank':
          result = getMatrixRank(activeA);
          steps.push(`Rank calculated via Row Echelon Reduction: ${result}`);
          break;
        default:
          break;
      }
    } catch (e: any) {
      error = e.message || "An error occurred during calculations.";
    }

    return { result, error, steps };
  }, [op, activeA, activeB, size]);

  // Export resulting matrix to CSV
  const handleExportCSV = () => {
    const res = calculationResult.result;
    if (!res) return;

    let csvContent = "";
    if (Array.isArray(res)) {
      csvContent = (res as number[][])
        .map(row => row.map(cell => cell.toString()).join(','))
        .join('\n');
    } else {
      csvContent = `ResultValue\n${res}`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `matrix_result_${op}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isUnary = ['transpose', 'det', 'inverse', 'rank'].includes(op);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Configuration & Matrix Inputs */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-150 dark:border-zinc-850 pb-5 mb-5">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Matrix Properties
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Choose grid dimensions and operation rules.
              </p>
            </div>
            <div className="flex gap-2">
              {([2, 3, 4] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    size === s
                      ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 dark:bg-zinc-850 dark:border-zinc-750 dark:text-zinc-300'
                  }`}
                >
                  {s}x{s}
                </button>
              ))}
            </div>
          </div>

          {/* Operation selector pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(['add', 'subtract', 'multiply', 'transpose', 'det', 'inverse', 'rank'] as const).map((o) => (
              <button
                key={o}
                onClick={() => setOp(o)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  op === o
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-750 dark:text-indigo-400'
                    : 'border-zinc-250 dark:border-zinc-850 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {o === 'det' ? 'Determinant' : o.charAt(0).toUpperCase() + o.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Matrix A */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                <span>Matrix A ({size}x{size})</span>
                <button
                  onClick={() => setMatrixA(Array(4).fill(0).map(() => Array(4).fill(0)))}
                  className="text-[10px] text-red-500 hover:underline lowercase font-normal"
                >
                  Clear A
                </button>
              </h4>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: size }).map((_, rIdx) =>
                  Array.from({ length: size }).map((_, cIdx) => (
                    <input
                      key={`A-${rIdx}-${cIdx}`}
                      type="number"
                      value={matrixA[rIdx][cIdx] || ''}
                      placeholder="0"
                      onChange={(e) => handleCellChange('A', rIdx, cIdx, e.target.value)}
                      className="w-full px-2 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-center font-mono text-sm text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Matrix B (only show if operation is binary) */}
            {!isUnary ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                  <span>Matrix B ({size}x{size})</span>
                  <button
                    onClick={() => setMatrixB(Array(4).fill(0).map(() => Array(4).fill(0)))}
                    className="text-[10px] text-red-500 hover:underline lowercase font-normal"
                  >
                    Clear B
                  </button>
                </h4>
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: size }).map((_, rIdx) =>
                    Array.from({ length: size }).map((_, cIdx) => (
                      <input
                        key={`B-${rIdx}-${cIdx}`}
                        type="number"
                        value={matrixB[rIdx][cIdx] || ''}
                        placeholder="0"
                        onChange={(e) => handleCellChange('B', rIdx, cIdx, e.target.value)}
                        className="w-full px-2 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-center font-mono text-sm text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/20 text-center">
                <p className="text-xs text-zinc-400 max-w-[200px]">
                  Unary Operation active. Matrix B coefficients are ignored.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step by Step Breakdown */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
            Calculation Steps
          </h4>
          <div className="font-mono text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 p-4 rounded-xl space-y-2 max-h-60 overflow-y-auto">
            {calculationResult.steps.map((step, idx) => (
              <div key={idx} className="pl-3 border-l border-zinc-300 dark:border-zinc-800">
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Output Result
            </h3>
            {calculationResult.result !== null && !calculationResult.error && (
              <button
                onClick={handleExportCSV}
                className="text-xs text-indigo-600 hover:underline font-bold"
              >
                Export CSV
              </button>
            )}
          </div>

          {calculationResult.error ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-450 text-xs font-medium">
              {calculationResult.error}
            </div>
          ) : calculationResult.result !== null ? (
            <div className="space-y-4">
              {Array.isArray(calculationResult.result) ? (
                /* Matrix output layout */
                <div
                  className="grid gap-2 max-w-[240px] mx-auto p-4 border border-zinc-100 dark:border-zinc-800/80 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/50"
                  style={{ gridTemplateColumns: `repeat(${(calculationResult.result as number[][])[0].length}, minmax(0, 1fr))` }}
                >
                  {(calculationResult.result as number[][]).map((row, rIdx) =>
                    row.map((cell, cIdx) => (
                      <div
                        key={`res-${rIdx}-${cIdx}`}
                        className="py-3 px-1 rounded bg-white dark:bg-zinc-900 text-center font-mono text-sm font-bold border border-zinc-200 dark:border-zinc-850 text-indigo-600 dark:text-indigo-400"
                      >
                        {cell.toFixed(2)}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                /* Scalar output layout */
                <div className="p-6 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/30 text-center">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
                    Scalar Value Result
                  </div>
                  <div className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                    {typeof calculationResult.result === 'number' ? calculationResult.result.toFixed(4) : calculationResult.result}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
              Complete the input cells to see matrix results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
