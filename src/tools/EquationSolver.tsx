/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Calculator,
  Sparkles,
  Info,
  Download,
  Eye
} from 'lucide-react';
import * as math from 'mathjs';

// Solver Modes
export type EquationSolverMode = 'linear' | 'quadratic' | 'cubic' | 'simultaneous_2x2' | 'simultaneous_3x3' | 'nonlinear';
export type DisplayFormat = 'decimal' | 'fraction';

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

function formatNum(val: number, fmt: DisplayFormat, decimals = 4): string {
  if (Math.abs(val) < 1e-11) return '0';
  if (fmt === 'fraction') return toFractionString(val);
  return Number.isInteger(val) ? val.toString() : parseFloat(val.toFixed(decimals)).toString();
}

export default function EquationSolver() {
  const [solverMode, setSolverMode] = useState<EquationSolverMode>('quadratic');
  const [displayFmt, setDisplayFmt] = useState<DisplayFormat>('decimal');

  // 1. Linear Inputs: ax + b = c
  const [linA, setLinA] = useState<number>(3);
  const [linB, setLinB] = useState<number>(-7);
  const [linC, setLinC] = useState<number>(8);

  // 2. Quadratic Inputs: ax² + bx + c = 0
  const [quadA, setQuadA] = useState<number>(1);
  const [quadB, setQuadB] = useState<number>(-5);
  const [quadC, setQuadC] = useState<number>(6);

  // 3. Cubic Inputs: ax³ + bx² + cx + d = 0
  const [cubA, setCubA] = useState<number>(1);
  const [cubB, setCubB] = useState<number>(-6);
  const [cubC, setCubC] = useState<number>(11);
  const [cubD, setCubD] = useState<number>(-6);

  // 4. Simultaneous 2x2:
  // a1 x + b1 y = c1
  // a2 x + b2 y = c2
  const [simA1, setSimA1] = useState<number>(2);
  const [simB1, setSimB1] = useState<number>(3);
  const [simC1, setSimC1] = useState<number>(8);
  const [simA2, setSimA2] = useState<number>(1);
  const [simB2, setSimB2] = useState<number>(-2);
  const [simC2, setSimC2] = useState<number>(-3);

  // 5. Simultaneous 3x3:
  const [sys3A, setSys3A] = useState<number[][]>(() => [
    [1, 1, 1],
    [2, -1, 1],
    [1, 2, -1]
  ]);
  const [sys3B, setSys3B] = useState<number[]>(() => [6, 3, 2]);

  // 6. Non-linear / Transcendental Equation: f(x) = 0
  const [nonlinExpr, setNonlinExpr] = useState<string>('x^3 - 2*x - 5');
  const [nonlinGuess, setNonlinGuess] = useState<number>(2);
  const [nonlinMaxIter, setNonlinMaxIter] = useState<number>(15);

  // Copy Feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  // Preset Loaders
  const loadPreset = (presetKey: string) => {
    switch (presetKey) {
      case 'linear_standard':
        setSolverMode('linear');
        setLinA(4);
        setLinB(-8);
        setLinC(16);
        break;
      case 'quad_real_distinct':
        setSolverMode('quadratic');
        setQuadA(1);
        setQuadB(-5);
        setQuadC(6);
        break;
      case 'quad_complex':
        setSolverMode('quadratic');
        setQuadA(1);
        setQuadB(2);
        setQuadC(5);
        break;
      case 'quad_perfect_square':
        setSolverMode('quadratic');
        setQuadA(1);
        setQuadB(-6);
        setQuadC(9);
        break;
      case 'cubic_cardano':
        setSolverMode('cubic');
        setCubA(1);
        setCubB(0);
        setCubC(-6);
        setCubD(-9);
        break;
      case 'cubic_three_real':
        setSolverMode('cubic');
        setCubA(1);
        setCubB(-6);
        setCubC(11);
        setCubD(-6);
        break;
      case 'sim2_unique':
        setSolverMode('simultaneous_2x2');
        setSimA1(3);
        setSimB1(2);
        setSimC1(16);
        setSimA2(7);
        setSimB2(-4);
        setSimC2(16);
        break;
      case 'sim3_standard':
        setSolverMode('simultaneous_3x3');
        setSys3A([
          [1, 1, 1],
          [2, -1, 1],
          [1, 2, -1]
        ]);
        setSys3B([6, 3, 2]);
        break;
      case 'newton_kepler':
        setSolverMode('nonlinear');
        setNonlinExpr('x - 0.5 * sin(x) - 1.2');
        setNonlinGuess(1.5);
        break;
      case 'newton_poly':
        setSolverMode('nonlinear');
        setNonlinExpr('x^3 - 2*x - 5');
        setNonlinGuess(2.0);
        break;
    }
  };

  // Main Calculation Engine
  const solution = useMemo(() => {
    const steps: string[] = [];
    let title = '';
    let rootsFormatted: string[] = [];
    let summaryText = '';
    let graphPoints: { x: number; y: number }[] = [];
    let rootMarkers: { x: number; y: number; label: string }[] = [];
    let extremaMarkers: { x: number; y: number; label: string }[] = [];
    let error: string | null = null;
    let extraTableData: any = null;

    try {
      // 1. LINEAR SOLVER: ax + b = c  =>  ax = c - b  =>  x = (c - b) / a
      if (solverMode === 'linear') {
        title = `Linear Equation: ${linA}x + (${linB}) = ${linC}`;
        steps.push(`Given equation: ${linA}x + (${linB}) = ${linC}`);

        if (linA === 0) {
          if (linB === linC) {
            steps.push(`0x + (${linB}) = ${linC} → 0 = 0 (Identity).`);
            steps.push(`Every real number x is a valid solution. Infinitely many solutions exist.`);
            summaryText = `Infinite Solutions (Identity 0 = 0)`;
          } else {
            steps.push(`0x + (${linB}) = ${linC} → ${linB} = ${linC} (Contradiction).`);
            steps.push(`No value of x satisfies this equation. No solution exists.`);
            summaryText = `No Solution (Inconsistent Equation)`;
          }
        } else {
          const rightHand = linC - linB;
          steps.push(`Subtract constant term (${linB}) from both sides: ${linA}x = ${linC} - (${linB}) = ${rightHand}`);
          const root = rightHand / linA;
          steps.push(`Divide both sides by coefficient a (${linA}): x = ${rightHand} / ${linA} = ${formatNum(root, displayFmt, 4)}`);
          summaryText = `x = ${formatNum(root, displayFmt, 4)}`;
          rootsFormatted = [summaryText];

          // Graphing line: y = ax + (b - c) so that root is at y = 0
          for (let x = root - 5; x <= root + 5; x += 0.5) {
            graphPoints.push({ x, y: linA * x + (linB - linC) });
          }
          rootMarkers.push({ x: root, y: 0, label: `x = ${formatNum(root, displayFmt, 2)}` });
        }
      }

      // 2. QUADRATIC SOLVER: ax² + bx + c = 0
      else if (solverMode === 'quadratic') {
        title = `Quadratic Equation: ${quadA}x² + (${quadB})x + (${quadC}) = 0`;
        steps.push(`Standard Form: ax² + bx + c = 0 with a = ${quadA}, b = ${quadB}, c = ${quadC}`);

        if (quadA === 0) {
          steps.push(`Since a = 0, this is a linear equation: ${quadB}x + (${quadC}) = 0.`);
          if (quadB !== 0) {
            const r = -quadC / quadB;
            summaryText = `Linear Root: x = ${formatNum(r, displayFmt, 4)}`;
            rootsFormatted = [summaryText];
          } else {
            summaryText = quadC === 0 ? 'Infinite Solutions' : 'No Solution';
          }
        } else {
          // Discriminant
          const disc = quadB * quadB - 4 * quadA * quadC;
          steps.push(`1. Calculate Discriminant: Δ = b² - 4ac = (${quadB})² - 4·(${quadA})·(${quadC}) = ${quadB * quadB} - ${4 * quadA * quadC} = ${disc}`);

          // Vertex (h, k)
          const h = -quadB / (2 * quadA);
          const k = quadC - (quadB * quadB) / (4 * quadA);
          steps.push(`2. Parabola Vertex (h, k): h = -b/(2a) = ${formatNum(h, displayFmt, 4)}, k = f(h) = ${formatNum(k, displayFmt, 4)}`);
          extremaMarkers.push({ x: h, y: k, label: `Vertex (${formatNum(h, displayFmt, 2)}, ${formatNum(k, displayFmt, 2)})` });

          // Factoring / Quadratic formula
          steps.push(`3. Applying Quadratic Formula: x = (-b ± √Δ) / (2a) = (-(${quadB}) ± √${disc}) / (2·${quadA})`);

          if (disc > 0) {
            const sqrtD = Math.sqrt(disc);
            const r1 = (-quadB + sqrtD) / (2 * quadA);
            const r2 = (-quadB - sqrtD) / (2 * quadA);
            steps.push(`Δ > 0: Two real distinct roots exist:`);
            steps.push(`x₁ = (${-quadB} + ${sqrtD.toFixed(4)}) / ${2 * quadA} = ${formatNum(r1, displayFmt, 4)}`);
            steps.push(`x₂ = (${-quadB} - ${sqrtD.toFixed(4)}) / ${2 * quadA} = ${formatNum(r2, displayFmt, 4)}`);
            rootsFormatted = [`x₁ = ${formatNum(r1, displayFmt, 4)}`, `x₂ = ${formatNum(r2, displayFmt, 4)}`];
            summaryText = rootsFormatted.join(', ');

            rootMarkers.push({ x: r1, y: 0, label: `x₁ = ${formatNum(r1, displayFmt, 2)}` });
            rootMarkers.push({ x: r2, y: 0, label: `x₂ = ${formatNum(r2, displayFmt, 2)}` });

            // Graph sampling centered at vertex h
            const span = Math.max(4, Math.abs(r1 - r2) + 2);
            for (let x = h - span; x <= h + span; x += span / 25) {
              graphPoints.push({ x, y: quadA * x * x + quadB * x + quadC });
            }
          } else if (disc === 0) {
            const r = -quadB / (2 * quadA);
            steps.push(`Δ = 0: Exactly one real double root exists: x = -b/(2a) = ${formatNum(r, displayFmt, 4)}`);
            rootsFormatted = [`x = ${formatNum(r, displayFmt, 4)} (double root)`];
            summaryText = rootsFormatted[0];
            rootMarkers.push({ x: r, y: 0, label: `x = ${formatNum(r, displayFmt, 2)}` });

            for (let x = h - 5; x <= h + 5; x += 0.4) {
              graphPoints.push({ x, y: quadA * x * x + quadB * x + quadC });
            }
          } else {
            // Complex conjugate roots
            const realPart = -quadB / (2 * quadA);
            const imagPart = Math.sqrt(-disc) / (2 * Math.abs(quadA));
            steps.push(`Δ < 0: Two complex conjugate roots exist:`);
            steps.push(`x₁,₂ = ${formatNum(realPart, displayFmt, 4)} ± ${formatNum(imagPart, displayFmt, 4)}i`);
            rootsFormatted = [
              `x₁ = ${formatNum(realPart, displayFmt, 4)} + ${formatNum(imagPart, displayFmt, 4)}i`,
              `x₂ = ${formatNum(realPart, displayFmt, 4)} - ${formatNum(imagPart, displayFmt, 4)}i`
            ];
            summaryText = `${formatNum(realPart, displayFmt, 4)} ± ${formatNum(imagPart, displayFmt, 4)}i`;

            for (let x = h - 5; x <= h + 5; x += 0.4) {
              graphPoints.push({ x, y: quadA * x * x + quadB * x + quadC });
            }
          }
        }
      }

      // 3. CUBIC SOLVER: ax³ + bx² + cx + d = 0 (Cardano's Method)
      else if (solverMode === 'cubic') {
        title = `Cubic Equation: ${cubA}x³ + (${cubB})x² + (${cubC})x + (${cubD}) = 0`;
        steps.push(`Cardano's Depressed Cubic Reduction for ax³ + bx² + cx + d = 0`);

        if (cubA === 0) throw new Error('Coefficient a cannot be 0 for a cubic equation.');

        const a = cubA;
        const b = cubB;
        const c = cubC;
        const d = cubD;

        // Shift x = t - b/(3a)
        const shift = b / (3 * a);
        const p = (3 * a * c - b * b) / (3 * a * a);
        const q = (2 * (b ** 3) - 9 * a * b * c + 27 * (a ** 2) * d) / (27 * (a ** 3));
        steps.push(`Substitute x = t - b/(3a) = t - (${shift.toFixed(3)}) to depress cubic: t³ + pt + q = 0`);
        steps.push(`Parameters: p = ${p.toFixed(4)}, q = ${q.toFixed(4)}`);

        const delta = (q ** 2) / 4 + (p ** 3) / 27;
        steps.push(`Cubic Discriminant: Δ = (q/2)² + (p/3)³ = ${delta.toFixed(6)}`);

        const cubicRoots: string[] = [];

        if (delta > 0) {
          // 1 Real root + 2 Complex roots
          const u = Math.cbrt(-q / 2 + Math.sqrt(delta));
          const v = Math.cbrt(-q / 2 - Math.sqrt(delta));
          const t1 = u + v;
          const x1 = t1 - shift;

          const reComplex = -(u + v) / 2 - shift;
          const imComplex = (Math.sqrt(3) * (u - v)) / 2;

          steps.push(`Δ > 0: One real root and two complex conjugate roots:`);
          steps.push(`x₁ = ${formatNum(x1, displayFmt, 4)}`);
          steps.push(`x₂,₃ = ${formatNum(reComplex, displayFmt, 4)} ± ${formatNum(Math.abs(imComplex), displayFmt, 4)}i`);

          cubicRoots.push(`x₁ = ${formatNum(x1, displayFmt, 4)}`);
          cubicRoots.push(`x₂ = ${formatNum(reComplex, displayFmt, 4)} + ${formatNum(Math.abs(imComplex), displayFmt, 4)}i`);
          cubicRoots.push(`x₃ = ${formatNum(reComplex, displayFmt, 4)} - ${formatNum(Math.abs(imComplex), displayFmt, 4)}i`);
          rootMarkers.push({ x: x1, y: 0, label: `x₁ = ${formatNum(x1, displayFmt, 2)}` });

          for (let x = x1 - 5; x <= x1 + 5; x += 0.4) {
            graphPoints.push({ x, y: a * (x ** 3) + b * (x ** 2) + c * x + d });
          }
        } else if (Math.abs(delta) < 1e-9) {
          // All roots real, at least two equal
          const t1 = 2 * Math.cbrt(-q / 2);
          const t2 = -Math.cbrt(-q / 2);
          const x1 = t1 - shift;
          const x2 = t2 - shift;

          steps.push(`Δ = 0: Three real roots (multiple root):`);
          steps.push(`x₁ = ${formatNum(x1, displayFmt, 4)}, x₂,₃ = ${formatNum(x2, displayFmt, 4)}`);
          cubicRoots.push(`x₁ = ${formatNum(x1, displayFmt, 4)}`, `x₂ = ${formatNum(x2, displayFmt, 4)} (double root)`);
          rootMarkers.push({ x: x1, y: 0, label: `x₁` }, { x: x2, y: 0, label: `x₂` });

          for (let x = x1 - 5; x <= x1 + 5; x += 0.4) {
            graphPoints.push({ x, y: a * (x ** 3) + b * (x ** 2) + c * x + d });
          }
        } else {
          // Δ < 0: 3 Distinct Real Roots (Trigonometric method)
          const r = Math.sqrt(-((p ** 3) / 27));
          const phi = Math.acos(Math.max(-1, Math.min(1, -q / (2 * r))));
          const factor = 2 * Math.sqrt(-p / 3);

          const t1 = factor * Math.cos(phi / 3);
          const t2 = factor * Math.cos((phi + 2 * Math.PI) / 3);
          const t3 = factor * Math.cos((phi + 4 * Math.PI) / 3);

          const x1 = t1 - shift;
          const x2 = t2 - shift;
          const x3 = t3 - shift;

          steps.push(`Δ < 0: Three distinct real roots (Casus Irreducibilis):`);
          steps.push(`x₁ = ${formatNum(x1, displayFmt, 4)}`);
          steps.push(`x₂ = ${formatNum(x2, displayFmt, 4)}`);
          steps.push(`x₃ = ${formatNum(x3, displayFmt, 4)}`);

          cubicRoots.push(`x₁ = ${formatNum(x1, displayFmt, 4)}`, `x₂ = ${formatNum(x2, displayFmt, 4)}`, `x₃ = ${formatNum(x3, displayFmt, 4)}`);
          rootMarkers.push(
            { x: x1, y: 0, label: `x₁` },
            { x: x2, y: 0, label: `x₂` },
            { x: x3, y: 0, label: `x₃` }
          );

          const minX = Math.min(x1, x2, x3) - 2;
          const maxX = Math.max(x1, x2, x3) + 2;
          for (let x = minX; x <= maxX; x += (maxX - minX) / 30) {
            graphPoints.push({ x, y: a * (x ** 3) + b * (x ** 2) + c * x + d });
          }
        }
        rootsFormatted = cubicRoots;
        summaryText = cubicRoots.join(', ');
      }

      // 4. SIMULTANEOUS 2x2 LINEAR SYSTEM
      else if (solverMode === 'simultaneous_2x2') {
        title = `2×2 System of Linear Equations`;
        steps.push(`Eq (1): ${simA1}x + ${simB1}y = ${simC1}`);
        steps.push(`Eq (2): ${simA2}x + ${simB2}y = ${simC2}`);

        // Cramer's Rule Determinants
        const D = simA1 * simB2 - simA2 * simB1;
        const Dx = simC1 * simB2 - simC2 * simB1;
        const Dy = simA1 * simC2 - simA2 * simC1;

        steps.push(`Main Determinant D = (${simA1}·${simB2}) - (${simA2}·${simB1}) = ${D}`);
        steps.push(`X-Determinant D_x = (${simC1}·${simB2}) - (${simC2}·${simB1}) = ${Dx}`);
        steps.push(`Y-Determinant D_y = (${simA1}·${simC2}) - (${simA2}·${simC1}) = ${Dy}`);

        if (D !== 0) {
          const x = Dx / D;
          const y = Dy / D;
          steps.push(`Consistent & Independent System (Lines intersect at unique point):`);
          steps.push(`x = D_x / D = ${Dx} / ${D} = ${formatNum(x, displayFmt, 4)}`);
          steps.push(`y = D_y / D = ${Dy} / ${D} = ${formatNum(y, displayFmt, 4)}`);
          summaryText = `x = ${formatNum(x, displayFmt, 4)}, y = ${formatNum(y, displayFmt, 4)}`;
          rootsFormatted = [`x = ${formatNum(x, displayFmt, 4)}`, `y = ${formatNum(y, displayFmt, 4)}`];
          rootMarkers.push({ x, y, label: `(${formatNum(x, displayFmt, 2)}, ${formatNum(y, displayFmt, 2)})` });
        } else {
          if (Dx === 0 && Dy === 0) {
            steps.push(`D = 0 and D_x = D_y = 0: Coincident lines (Infinitely many solutions).`);
            summaryText = `Infinite Solutions (Coincident Lines)`;
          } else {
            steps.push(`D = 0 and (D_x ≠ 0 or D_y ≠ 0): Parallel lines (No intersection).`);
            summaryText = `No Solution (Parallel Lines / Inconsistent)`;
          }
        }
      }

      // 5. SIMULTANEOUS 3x3 LINEAR SYSTEM
      else if (solverMode === 'simultaneous_3x3') {
        title = `3×3 System of Linear Equations`;
        steps.push(`Solving 3-variable linear system using Cramer's Rule & Matrix Inversion [A | b]:`);

        const A = sys3A;
        const b = sys3B;
        const detA = math.det(A);
        steps.push(`Matrix Determinant det(A) = ${detA.toFixed(4)}`);

        if (Math.abs(detA) > 1e-9) {
          const invA: any = math.inv(A);
          const xVec: any = math.multiply(invA, b);
          const x = xVec[0];
          const y = xVec[1];
          const z = xVec[2];

          steps.push(`Unique Solution Vector x = A⁻¹ · b:`);
          steps.push(`x₁ = ${formatNum(x, displayFmt, 4)}`);
          steps.push(`x₂ = ${formatNum(y, displayFmt, 4)}`);
          steps.push(`x₃ = ${formatNum(z, displayFmt, 4)}`);

          rootsFormatted = [
            `x = ${formatNum(x, displayFmt, 4)}`,
            `y = ${formatNum(y, displayFmt, 4)}`,
            `z = ${formatNum(z, displayFmt, 4)}`
          ];
          summaryText = rootsFormatted.join(', ');
        } else {
          steps.push(`det(A) = 0: Matrix is singular. System has either 0 solutions or infinitely many solutions.`);
          summaryText = `Singular Matrix (0 or ∞ solutions)`;
        }
      }

      // 6. NON-LINEAR NEWTON-RAPHSON SOLVER: f(x) = 0
      else if (solverMode === 'nonlinear') {
        title = `Non-Linear Root Finder: ${nonlinExpr} = 0`;
        steps.push(`Numerical Root Finding for f(x) = ${nonlinExpr} using Newton-Raphson Iterations`);

        const compiled = math.compile(nonlinExpr);
        const f = (xVal: number) => compiled.evaluate({ x: xVal });
        // Numerical derivative approximation: f'(x) = (f(x+h) - f(x-h)) / (2h)
        const h = 1e-6;
        const df = (xVal: number) => (f(xVal + h) - f(xVal - h)) / (2 * h);

        let currX = nonlinGuess;
        const iterRows: { k: number; x: number; fx: number; dfx: number; delta: number }[] = [];

        for (let k = 1; k <= nonlinMaxIter; k++) {
          const fx = f(currX);
          const dfx = df(currX);
          if (Math.abs(dfx) < 1e-12) {
            steps.push(`Derivative near 0 at x = ${currX.toFixed(4)}. Iteration halted.`);
            break;
          }
          const delta = fx / dfx;
          const nextX = currX - delta;
          iterRows.push({ k, x: currX, fx, dfx, delta });
          currX = nextX;
          if (Math.abs(delta) < 1e-8) {
            steps.push(`Convergence reached with tolerance < 10⁻⁸ at iteration ${k}.`);
            break;
          }
        }

        extraTableData = iterRows;
        summaryText = `x ≈ ${currX.toFixed(6)}`;
        rootsFormatted = [summaryText];
        rootMarkers.push({ x: currX, y: 0, label: `x ≈ ${currX.toFixed(3)}` });

        for (let x = currX - 4; x <= currX + 4; x += 0.25) {
          try {
            const y = f(x);
            if (!isNaN(y) && isFinite(y) && Math.abs(y) < 100) {
              graphPoints.push({ x, y });
            }
          } catch {
            // Ignore domain errors
          }
        }
      }

    } catch (e: any) {
      error = e.message || 'Error solving equation.';
    }

    return {
      title,
      summaryText,
      rootsFormatted,
      steps,
      graphPoints,
      rootMarkers,
      extremaMarkers,
      error,
      extraTableData
    };
  }, [
    solverMode,
    linA,
    linB,
    linC,
    quadA,
    quadB,
    quadC,
    cubA,
    cubB,
    cubC,
    cubD,
    simA1,
    simB1,
    simC1,
    simA2,
    simB2,
    simC2,
    sys3A,
    sys3B,
    nonlinExpr,
    nonlinGuess,
    nonlinMaxIter,
    displayFmt
  ]);

  // Copy Handler
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopiedLabel(label);
    setTimeout(() => {
      setCopied(false);
      setCopiedLabel(null);
    }, 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const lines = [
      ['Equation Type', solverMode.toUpperCase()],
      ['Solution Summary', solution.summaryText],
      ['Step Count', solution.steps.length.toString()],
      [],
      ['Step Number', 'Derivation Step']
    ];
    solution.steps.forEach((s, idx) => {
      lines.push([`Step ${idx + 1}`, `"${s.replace(/"/g, '""')}"`]);
    });
    const csvContent = lines.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `equation_solution_${solverMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Coordinate Geometry & Graph Scaling
  const svgWidth = 360;
  const svgHeight = 240;
  const originX = svgWidth / 2;
  const originY = svgHeight / 2;

  const graphScale = useMemo(() => {
    if (solution.graphPoints.length === 0) return 20;
    const xVals = solution.graphPoints.map(p => Math.abs(p.x));
    const yVals = solution.graphPoints.map(p => Math.abs(p.y));
    const maxX = Math.max(...xVals, 5);
    const maxY = Math.max(...yVals, 5);
    return Math.max(6, Math.min(28, (svgWidth / 2 - 20) / Math.max(maxX, maxY * 0.4)));
  }, [solution.graphPoints, svgWidth]);

  const mapX = (x: number) => originX + x * graphScale;
  const mapY = (y: number) => originY - y * graphScale;

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Answer Engine Optimization (AEO) Quick Answer Card */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3.5 shadow-xs">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
          <p className="font-bold text-zinc-900 dark:text-white text-sm">
            What is an Algebraic Equation Solver?
          </p>
          <p className="leading-relaxed">
            An <strong>Equation Solver</strong> finds the exact mathematical values of variables ($x, y, z$) that satisfy equality conditions. It supports <strong>linear equations</strong> ($ax + b = c$), <strong>quadratic equations</strong> ($ax^2 + bx + c = 0$ via quadratic formula and factoring), <strong>cubic equations</strong> (Cardano's method), <strong>simultaneous linear systems</strong> ($2\times 2$ & $3\times 3$ Cramer's Rule), and <strong>non-linear root finding</strong> (Newton-Raphson iteration).
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Equation Inputs & Presets (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="saas-card p-5 space-y-4">
            {/* Solver Mode Navigation Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 mb-2.5">
                <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Select Equation Type
              </span>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-xs">
                {[
                  { id: 'linear', label: 'Linear' },
                  { id: 'quadratic', label: 'Quadratic' },
                  { id: 'cubic', label: 'Cubic' },
                  { id: 'simultaneous_2x2', label: '2×2 System' },
                  { id: 'simultaneous_3x3', label: '3×3 System' },
                  { id: 'nonlinear', label: 'Non-Linear' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSolverMode(tab.id as EquationSolverMode)}
                    className={`py-1.5 px-1 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                      solverMode === tab.id
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Format & Preset Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Presets:
                </span>
                {solverMode === 'linear' && (
                  <button onClick={() => loadPreset('linear_standard')} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 text-[11px] font-medium cursor-pointer">
                    4x - 8 = 16
                  </button>
                )}
                {solverMode === 'quadratic' && (
                  <>
                    <button onClick={() => loadPreset('quad_real_distinct')} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 text-[11px] font-medium cursor-pointer">
                      x² - 5x + 6 = 0
                    </button>
                    <button onClick={() => loadPreset('quad_complex')} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 text-[11px] font-medium cursor-pointer">
                      x² + 2x + 5 = 0 (Complex)
                    </button>
                    <button onClick={() => loadPreset('quad_perfect_square')} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 text-[11px] font-medium cursor-pointer">
                      x² - 6x + 9 = 0
                    </button>
                  </>
                )}
                {solverMode === 'cubic' && (
                  <>
                    <button onClick={() => loadPreset('cubic_cardano')} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 text-[11px] font-medium cursor-pointer">
                      x³ - 6x - 9 = 0 (Cardano)
                    </button>
                    <button onClick={() => loadPreset('cubic_three_real')} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 text-[11px] font-medium cursor-pointer">
                      x³ - 6x² + 11x - 6 = 0
                    </button>
                  </>
                )}
                {solverMode === 'simultaneous_2x2' && (
                  <button onClick={() => loadPreset('sim2_unique')} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 text-[11px] font-medium cursor-pointer">
                    3x+2y=16, 7x-4y=16
                  </button>
                )}
                {solverMode === 'simultaneous_3x3' && (
                  <button onClick={() => loadPreset('sim3_standard')} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 text-[11px] font-medium cursor-pointer">
                    Standard 3x3 System
                  </button>
                )}
                {solverMode === 'nonlinear' && (
                  <>
                    <button onClick={() => loadPreset('newton_poly')} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 text-[11px] font-medium cursor-pointer">
                      x³ - 2x - 5 = 0
                    </button>
                    <button onClick={() => loadPreset('newton_kepler')} className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 text-[11px] font-medium cursor-pointer">
                      Kepler Equation
                    </button>
                  </>
                )}
              </div>

              {/* Decimal vs Fraction Toggle */}
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
                  Fraction
                </button>
              </div>
            </div>
          </div>

          {/* Contextual Input Fields Card */}
          <div className="saas-card p-5 space-y-4">
            {/* 1. LINEAR INPUTS */}
            {solverMode === 'linear' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 text-center font-mono text-sm font-bold text-indigo-700 dark:text-indigo-300">
                  {linA}x + ({linB}) = {linC}
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Coefficient a</label>
                    <input
                      type="number"
                      step="any"
                      value={linA}
                      onChange={(e) => setLinA(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Constant b</label>
                    <input
                      type="number"
                      step="any"
                      value={linB}
                      onChange={(e) => setLinB(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Equals c</label>
                    <input
                      type="number"
                      step="any"
                      value={linC}
                      onChange={(e) => setLinC(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. QUADRATIC INPUTS */}
            {solverMode === 'quadratic' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 text-center font-mono text-sm font-bold text-purple-700 dark:text-purple-300">
                  {quadA}x² + ({quadB})x + ({quadC}) = 0
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">a (x² term)</label>
                    <input
                      type="number"
                      step="any"
                      value={quadA}
                      onChange={(e) => setQuadA(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">b (x term)</label>
                    <input
                      type="number"
                      step="any"
                      value={quadB}
                      onChange={(e) => setQuadB(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">c (constant)</label>
                    <input
                      type="number"
                      step="any"
                      value={quadC}
                      onChange={(e) => setQuadC(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. CUBIC INPUTS */}
            {solverMode === 'cubic' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 text-center font-mono text-sm font-bold text-indigo-700 dark:text-indigo-300">
                  {cubA}x³ + ({cubB})x² + ({cubC})x + ({cubD}) = 0
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">a (x³)</label>
                    <input
                      type="number"
                      step="any"
                      value={cubA}
                      onChange={(e) => setCubA(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">b (x²)</label>
                    <input
                      type="number"
                      step="any"
                      value={cubB}
                      onChange={(e) => setCubB(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">c (x)</label>
                    <input
                      type="number"
                      step="any"
                      value={cubC}
                      onChange={(e) => setCubC(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">d (const)</label>
                    <input
                      type="number"
                      step="any"
                      value={cubD}
                      onChange={(e) => setCubD(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. SIMULTANEOUS 2x2 INPUTS */}
            {solverMode === 'simultaneous_2x2' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Equation 1: a₁x + b₁y = c₁</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      step="any"
                      value={simA1}
                      onChange={(e) => setSimA1(parseFloat(e.target.value) || 0)}
                      placeholder="a1"
                      className="px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs font-bold text-center"
                    />
                    <input
                      type="number"
                      step="any"
                      value={simB1}
                      onChange={(e) => setSimB1(parseFloat(e.target.value) || 0)}
                      placeholder="b1"
                      className="px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs font-bold text-center"
                    />
                    <input
                      type="number"
                      step="any"
                      value={simC1}
                      onChange={(e) => setSimC1(parseFloat(e.target.value) || 0)}
                      placeholder="c1"
                      className="px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs font-bold text-center"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">Equation 2: a₂x + b₂y = c₂</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      step="any"
                      value={simA2}
                      onChange={(e) => setSimA2(parseFloat(e.target.value) || 0)}
                      placeholder="a2"
                      className="px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs font-bold text-center"
                    />
                    <input
                      type="number"
                      step="any"
                      value={simB2}
                      onChange={(e) => setSimB2(parseFloat(e.target.value) || 0)}
                      placeholder="b2"
                      className="px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs font-bold text-center"
                    />
                    <input
                      type="number"
                      step="any"
                      value={simC2}
                      onChange={(e) => setSimC2(parseFloat(e.target.value) || 0)}
                      placeholder="c2"
                      className="px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-xs font-bold text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. SIMULTANEOUS 3x3 INPUTS */}
            {solverMode === 'simultaneous_3x3' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Matrix Coefficients [A | b]</span>
                <div className="grid gap-2">
                  {[0, 1, 2].map((rIdx) => (
                    <div key={rIdx} className="grid grid-cols-4 gap-2">
                      {[0, 1, 2].map((cIdx) => (
                        <input
                          key={`3x3-${rIdx}-${cIdx}`}
                          type="number"
                          step="any"
                          value={sys3A[rIdx][cIdx]}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setSys3A(prev => {
                              const copy = prev.map(row => [...row]);
                              copy[rIdx][cIdx] = val;
                              return copy;
                            });
                          }}
                          className="px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold text-center"
                        />
                      ))}
                      <input
                        type="number"
                        step="any"
                        value={sys3B[rIdx]}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setSys3B(prev => {
                            const copy = [...prev];
                            copy[rIdx] = val;
                            return copy;
                          });
                        }}
                        className="px-2 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950 font-mono text-xs font-bold text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. NON-LINEAR / NEWTON INPUTS */}
            {solverMode === 'nonlinear' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Mathematical Function f(x) = 0</label>
                  <input
                    type="text"
                    value={nonlinExpr}
                    onChange={(e) => setNonlinExpr(e.target.value)}
                    placeholder="e.g. x^3 - 2*x - 5"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Initial Guess (x₀)</label>
                    <input
                      type="number"
                      step="any"
                      value={nonlinGuess}
                      onChange={(e) => setNonlinGuess(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Max Iterations</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={nonlinMaxIter}
                      onChange={(e) => setNonlinMaxIter(parseInt(e.target.value) || 10)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Computed Solutions, Visual SVG Graph & Iterations (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Solution Summary Card */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
              <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" />
                Computed Roots & Solution
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button
                  onClick={() => handleCopy(solution.summaryText, 'summary')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  {copied && copiedLabel === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy
                </button>
              </div>
            </div>

            {/* Error banner */}
            {solution.error ? (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {solution.error}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Solved Answer Highlight */}
                <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">Final Solved Values</span>
                  <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {solution.summaryText}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive SVG Function Graph Preview */}
          {solution.graphPoints.length > 0 && !solution.error && (
            <div className="saas-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  Cartesian Function Curve & Roots Plot
                </span>
              </div>

              <div className="relative w-full rounded-2xl bg-zinc-950 p-2 border border-zinc-800 flex items-center justify-center select-none overflow-hidden">
                <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
                  {/* Grid Lines */}
                  {[-4, -2, 0, 2, 4].map(tick => (
                    <g key={tick}>
                      <line x1={0} y1={mapY(tick)} x2={svgWidth} y2={mapY(tick)} stroke="#27272a" strokeWidth={tick === 0 ? 1.5 : 0.6} />
                      <line x1={mapX(tick)} y1={0} x2={mapX(tick)} y2={svgHeight} stroke="#27272a" strokeWidth={tick === 0 ? 1.5 : 0.6} />
                    </g>
                  ))}

                  {/* Function polyline */}
                  <polyline
                    points={solution.graphPoints.map(p => `${mapX(p.x)},${mapY(p.y)}`).join(' ')}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth={2.2}
                  />

                  {/* Extrema / Vertex */}
                  {solution.extremaMarkers.map((ext, idx) => (
                    <g key={`ext-${idx}`}>
                      <circle cx={mapX(ext.x)} cy={mapY(ext.y)} r={4.5} fill="#a855f7" stroke="#ffffff" strokeWidth={1.5} />
                      <text x={mapX(ext.x) + 6} y={mapY(ext.y) - 6} fill="#c084fc" fontSize={9} fontWeight="bold" fontFamily="monospace">
                        {ext.label}
                      </text>
                    </g>
                  ))}

                  {/* Root Markers */}
                  {solution.rootMarkers.map((rm, idx) => (
                    <g key={`rm-${idx}`}>
                      <circle cx={mapX(rm.x)} cy={mapY(rm.y)} r={5} fill="#10b981" stroke="#ffffff" strokeWidth={1.5} />
                      <text x={mapX(rm.x) + 6} y={mapY(rm.y) - 6} fill="#34d399" fontSize={9} fontWeight="bold" fontFamily="monospace">
                        {rm.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          )}

          {/* Newton-Raphson Iteration Table */}
          {solverMode === 'nonlinear' && solution.extraTableData && (
            <div className="saas-card p-4 space-y-2 font-mono text-xs">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block font-sans">
                Newton-Raphson Convergence Iterations
              </span>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-x-auto max-h-48 overflow-y-auto">
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold uppercase border-b border-zinc-200 dark:border-zinc-800">
                      <th className="p-1.5">Iter (k)</th>
                      <th className="p-1.5">x_k</th>
                      <th className="p-1.5">f(x_k)</th>
                      <th className="p-1.5">f'(x_k)</th>
                      <th className="p-1.5">Step Δ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {solution.extraTableData.map((row: any) => (
                      <tr key={row.k} className="hover:bg-zinc-50 dark:hover:bg-zinc-850">
                        <td className="p-1.5 font-bold text-indigo-500">#{row.k}</td>
                        <td className="p-1.5">{row.x.toFixed(6)}</td>
                        <td className="p-1.5">{row.fx.toExponential(3)}</td>
                        <td className="p-1.5">{row.dfx.toFixed(4)}</td>
                        <td className="p-1.5 text-emerald-500">{row.delta.toExponential(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mathematical Derivation Steps */}
          {solution.steps.length > 0 && (
            <div className="saas-card p-5 space-y-3 font-mono text-xs">
              <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase font-sans flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                Step-by-Step Algebraic Derivation
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
                {solution.steps.map((step, idx) => (
                  <div key={idx} className="pl-2 border-l-2 border-indigo-400 dark:border-indigo-600 leading-relaxed">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fundamental Algebraic Theorems Guide Card */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
        <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Fundamental Theorems of Algebra & Polynomial Solvers
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">Fundamental Theorem of Algebra</p>
            <p className="text-[11px]">
              Every non-zero polynomial of degree <em>n</em> with complex coefficients has exactly <em>n</em> complex roots (counted with algebraic multiplicity).
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">Cardano's Depressed Cubic Method</p>
            <p className="text-[11px]">
              Any cubic equation <em>ax³ + bx² + cx + d = 0</em> can be depressed into <em>t³ + pt + q = 0</em> by the substitution <em>x = t - b/(3a)</em>, eliminating the quadratic term.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">Cramer's Rule for Linear Systems</p>
            <p className="text-[11px]">
              For a system of linear equations <em>Ax = b</em> with <em>det(A) &ne; 0</em>, each unknown is given by <em>x_i = det(A_i) / det(A)</em>, where <em>A_i</em> replaces column <em>i</em> with vector <em>b</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
