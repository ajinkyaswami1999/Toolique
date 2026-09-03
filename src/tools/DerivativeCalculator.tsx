import { useState, useMemo } from 'react';
import { 
  Copy, 
  RotateCcw, 
  Check, 
  Layers, 
  HelpCircle, 
  Sliders, 
  FileText, 
  Activity, 
  Sparkles, 
  Grid, 
  Compass, 
  Target, 
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';

// Calculation Modes
type CalculusMode = 'single' | 'partial' | 'implicit' | 'parametric' | 'taylor' | 'optimization';

interface StepDetail {
  stepNumber: number;
  title: string;
  rule: string;
  latexFormula: string;
  explanation: string;
  intermediateExpr: string;
}

interface CriticalPoint {
  x: number;
  y: number;
  fPrime: number;
  fDoublePrime: number;
  type: 'Local Minimum' | 'Local Maximum' | 'Inflection Point' | 'Stationary / Inconclusive';
}

interface TaylorTerm {
  order: number;
  derivativeExpr: string;
  derivativeVal: number;
  factorial: number;
  coefficient: number;
  termLaTeX: string;
}

export default function DerivativeCalculator() {
  // Mode State
  const [mode, setMode] = useState<CalculusMode>('single');

  // Single Variable Inputs
  const [singleExpr, setSingleExpr] = useState<string>('x^3 - 3*x^2 + 2*x');
  const [singleVar, setSingleVar] = useState<string>('x');
  const [singleOrder, setSingleOrder] = useState<number>(1);
  const [singleEvalX, setSingleEvalX] = useState<string>('2');

  // Partial Derivative Inputs
  const [partialExpr, setPartialExpr] = useState<string>('x^3*y + sin(x*y) - 2*y^2');
  const [partialX0, setPartialX0] = useState<string>('1');
  const [partialY0, setPartialY0] = useState<string>('2');
  const [partialDirU, setPartialDirU] = useState<string>('1');
  const [partialDirV, setPartialDirV] = useState<string>('1');

  // Implicit Inputs: F(x, y) = 0
  const [implicitExpr, setImplicitExpr] = useState<string>('x^2 + y^2 - 25');
  const [implicitX0, setImplicitX0] = useState<string>('3');
  const [implicitY0, setImplicitY0] = useState<string>('4');

  // Parametric Inputs: x(t), y(t)
  const [paramXExpr, setParamXExpr] = useState<string>('cos(t) + t*sin(t)');
  const [paramYExpr, setParamYExpr] = useState<string>('sin(t) - t*cos(t)');
  const [paramT0, setParamT0] = useState<string>('1.5708'); // pi/2

  // Taylor Series Inputs
  const [taylorExpr, setTaylorExpr] = useState<string>('sin(x)');
  const [taylorCenterA, setTaylorCenterA] = useState<string>('0');
  const [taylorDegreeN, setTaylorDegreeN] = useState<number>(5);
  const [taylorTestX, setTaylorTestX] = useState<string>('0.5');

  // Critical Points / Optimization Inputs
  const [optExpr, setOptExpr] = useState<string>('x^4 - 4*x^3 + 4*x^2');
  const [optDomainMin, setOptDomainMin] = useState<string>('-2');
  const [optDomainMax, setOptDomainMax] = useState<string>('4');

  // General UI & Graph States
  const [copiedType, setCopiedType] = useState<'text' | 'latex' | 'all' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOriginalCurve, setShowOriginalCurve] = useState<boolean>(true);
  const [showDerivCurve, setShowDerivCurve] = useState<boolean>(true);
  const [showTangentCurve, setShowTangentCurve] = useState<boolean>(true);
  const [showTaylorCurve, setShowTaylorCurve] = useState<boolean>(true);
  const [probeX, setProbeX] = useState<number | null>(null);

  // Math keypad symbol insertion helper
  const insertSymbol = (sym: string) => {
    if (mode === 'single') setSingleExpr(prev => prev + sym);
    else if (mode === 'partial') setPartialExpr(prev => prev + sym);
    else if (mode === 'implicit') setImplicitExpr(prev => prev + sym);
    else if (mode === 'parametric') setParamYExpr(prev => prev + sym);
    else if (mode === 'taylor') setTaylorExpr(prev => prev + sym);
    else if (mode === 'optimization') setOptExpr(prev => prev + sym);
  };

  // Reset to defaults helper
  const handleReset = () => {
    setError(null);
    if (mode === 'single') {
      setSingleExpr('x^3 - 3*x^2 + 2*x');
      setSingleVar('x');
      setSingleOrder(1);
      setSingleEvalX('2');
    } else if (mode === 'partial') {
      setPartialExpr('x^3*y + sin(x*y) - 2*y^2');
      setPartialX0('1');
      setPartialY0('2');
      setPartialDirU('1');
      setPartialDirV('1');
    } else if (mode === 'implicit') {
      setImplicitExpr('x^2 + y^2 - 25');
      setImplicitX0('3');
      setImplicitY0('4');
    } else if (mode === 'parametric') {
      setParamXExpr('cos(t) + t*sin(t)');
      setParamYExpr('sin(t) - t*cos(t)');
      setParamT0('1.5708');
    } else if (mode === 'taylor') {
      setTaylorExpr('sin(x)');
      setTaylorCenterA('0');
      setTaylorDegreeN(5);
      setTaylorTestX('0.5');
    } else if (mode === 'optimization') {
      setOptExpr('x^4 - 4*x^3 + 4*x^2');
      setOptDomainMin('-2');
      setOptDomainMax('4');
    }
  };

  // -------------------------------------------------------------
  // 1. SINGLE VARIABLE CALCULATIONS & DERIVATIONS
  // -------------------------------------------------------------
  const singleCalc = useMemo(() => {
    if (mode !== 'single' || !singleExpr.trim()) return null;
    setError(null);

    try {
      // First Derivative
      const firstDerivRaw = nerdamer.diff(singleExpr, singleVar).toString();
      const firstDeriv = nerdamer(firstDerivRaw).simplify().toString();

      // Second Derivative
      const secondDerivRaw = nerdamer.diff(firstDeriv, singleVar).toString();
      const secondDeriv = nerdamer(secondDerivRaw).simplify().toString();

      // Target N-th Derivative
      let currentDeriv = singleExpr;
      for (let i = 0; i < singleOrder; i++) {
        currentDeriv = nerdamer.diff(currentDeriv, singleVar).toString();
      }
      const targetDerivSimplified = nerdamer(currentDeriv).simplify().toString();

      // Numerical Evaluations at x = evalX
      let originalValAtX: number | null = null;
      let firstDerivValAtX: number | null = null;
      let secondDerivValAtX: number | null = null;
      let targetDerivValAtX: number | null = null;

      const xNum = parseFloat(singleEvalX);
      if (!isNaN(xNum)) {
        try { originalValAtX = math.evaluate(singleExpr, { [singleVar]: xNum }); } catch {}
        try { firstDerivValAtX = math.evaluate(firstDeriv, { [singleVar]: xNum }); } catch {}
        try { secondDerivValAtX = math.evaluate(secondDeriv, { [singleVar]: xNum }); } catch {}
        try { targetDerivValAtX = math.evaluate(targetDerivSimplified, { [singleVar]: xNum }); } catch {}
      }

      // Tangent & Normal Lines
      let tangentEquation: string | null = null;
      let normalEquation: string | null = null;
      let tangentSlope: number | null = null;
      let tangentIntercept: number | null = null;
      let curvature: number | null = null;
      let radiusOfCurvature: number | null = null;

      if (originalValAtX !== null && firstDerivValAtX !== null && !isNaN(originalValAtX) && !isNaN(firstDerivValAtX)) {
        tangentSlope = firstDerivValAtX;
        tangentIntercept = originalValAtX - tangentSlope * xNum;
        const slopeStr = tangentSlope === 1 ? '' : tangentSlope === -1 ? '-' : tangentSlope.toFixed(4);
        const interceptSign = tangentIntercept >= 0 ? '+' : '-';
        const interceptStr = Math.abs(tangentIntercept).toFixed(4);
        tangentEquation = `y = ${slopeStr}${singleVar} ${interceptSign} ${interceptStr}`;

        if (Math.abs(tangentSlope) > 1e-7) {
          const normalSlope = -1 / tangentSlope;
          const normalIntercept = originalValAtX - normalSlope * xNum;
          const normSlopeStr = normalSlope.toFixed(4);
          const normIntSign = normalIntercept >= 0 ? '+' : '-';
          const normIntStr = Math.abs(normalIntercept).toFixed(4);
          normalEquation = `y = ${normSlopeStr}${singleVar} ${normIntSign} ${normIntStr}`;
        } else {
          normalEquation = `${singleVar} = ${xNum.toFixed(4)} (Vertical Normal)`;
        }

        // Curvature calculation: kappa = |f''| / (1 + (f')^2)^(3/2)
        if (secondDerivValAtX !== null && !isNaN(secondDerivValAtX)) {
          const numerator = Math.abs(secondDerivValAtX);
          const denominator = Math.pow(1 + Math.pow(firstDerivValAtX, 2), 1.5);
          if (denominator > 1e-9) {
            curvature = numerator / denominator;
            radiusOfCurvature = curvature > 1e-7 ? 1 / curvature : Infinity;
          }
        }
      }

      // Concavity
      let concavityText = 'Not evaluated';
      if (secondDerivValAtX !== null && !isNaN(secondDerivValAtX)) {
        if (secondDerivValAtX > 0.00001) {
          concavityText = 'Concave Up (∪) — Rate of change is accelerating (potential local minimum).';
        } else if (secondDerivValAtX < -0.00001) {
          concavityText = 'Concave Down (∩) — Rate of change is decelerating (potential local maximum).';
        } else {
          concavityText = "f''(x) = 0 — Potential Inflection Point (check sign transition).";
        }
      }

      // Step-by-Step Derivation Breakdown
      const steps: StepDetail[] = [];
      const orderNames = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Higher-Order'];
      const orderLabel = orderNames[Math.min(singleOrder - 1, 5)];

      steps.push({
        stepNumber: 1,
        title: `Initialize ${orderLabel} Derivative Operation`,
        rule: 'Lagrange & Leibniz Differential Notation',
        latexFormula: singleOrder === 1 
          ? `\\frac{d}{d${singleVar}}\\left[ ${singleExpr} \\right]` 
          : `\\frac{d^{${singleOrder}}}{d${singleVar}^{${singleOrder}}}\\left[ ${singleExpr} \\right]`,
        explanation: `Identify the target expression f(${singleVar}) = ${singleExpr} and differentiate successively with respect to ${singleVar}.`,
        intermediateExpr: singleExpr
      });

      const cleanExpr = singleExpr.trim();
      const hasProduct = cleanExpr.includes('*') && !cleanExpr.match(/^[0-9.]+\s*\*/);
      const hasQuotient = cleanExpr.includes('/') && !cleanExpr.match(/\/\s*[0-9.]+/);
      const hasTrig = /sin|cos|tan|sec|csc|cot/.test(cleanExpr);
      const hasExp = /e\^|exp|ln|log/.test(cleanExpr);

      if (hasQuotient) {
        steps.push({
          stepNumber: 2,
          title: 'Apply the Quotient Differentiation Rule',
          rule: "Quotient Rule: (u/v)' = (u'v - uv') / v²",
          latexFormula: `\\frac{d}{d${singleVar}}\\left[\\frac{u}{v}\\right] = \\frac{u'v - uv'}{v^2}`,
          explanation: `Decompose into numerator u(${singleVar}) and denominator v(${singleVar}), differentiate both parts, and assemble the fractional derivative.`,
          intermediateExpr: firstDerivRaw
        });
      } else if (hasProduct) {
        steps.push({
          stepNumber: 2,
          title: 'Apply the Product Differentiation Rule',
          rule: "Product Rule: (u · v)' = u'v + uv'",
          latexFormula: `\\frac{d}{d${singleVar}}\\left[ u \\cdot v \\right] = u'v + uv'`,
          explanation: `Differentiate each multiplying factor in turn and sum the product combinations.`,
          intermediateExpr: firstDerivRaw
        });
      } else if (hasTrig || hasExp) {
        steps.push({
          stepNumber: 2,
          title: 'Apply Transcendental & Composite Chain Rules',
          rule: 'Chain & Transcendental Rules',
          latexFormula: `\\frac{d}{d${singleVar}}[f(g(${singleVar}))] = f'(g(${singleVar})) \\cdot g'(${singleVar})`,
          explanation: `Differentiate outer transcendental components and multiply by the inner argument derivatives.`,
          intermediateExpr: firstDerivRaw
        });
      } else {
        steps.push({
          stepNumber: 2,
          title: 'Apply Polynomial Power & Linearity Rules',
          rule: 'Power Rule: d/dx[xⁿ] = n · xⁿ⁻¹',
          latexFormula: `\\frac{d}{d${singleVar}}[c \\cdot ${singleVar}^n] = c \\cdot n \\cdot ${singleVar}^{n-1}`,
          explanation: `Multiply coefficients by exponents and decrement powers by 1. Constants vanish to 0.`,
          intermediateExpr: firstDerivRaw
        });
      }

      if (singleOrder > 1) {
        for (let i = 2; i <= singleOrder; i++) {
          let ithDeriv = singleExpr;
          for (let k = 0; k < i; k++) {
            ithDeriv = nerdamer.diff(ithDeriv, singleVar).toString();
          }
          steps.push({
            stepNumber: steps.length + 1,
            title: `Execute Order ${i} Differentiation`,
            rule: `Successive Derivative (Order ${i})`,
            latexFormula: `\\frac{d^{${i}}}{d${singleVar}^{${i}}}[f] = \\frac{d}{d${singleVar}}\\left[ f^{(${i-1})} \\right]`,
            explanation: `Differentiate the previous order ${i-1} result with respect to ${singleVar}.`,
            intermediateExpr: nerdamer(ithDeriv).simplify().toString()
          });
        }
      }

      steps.push({
        stepNumber: steps.length + 1,
        title: 'Perform Algebraic Simplification',
        rule: 'Canonical Simplification',
        latexFormula: `f^{(${singleOrder})}(${singleVar}) = ${targetDerivSimplified}`,
        explanation: `Collect like algebraic terms, factor out common multiples, and reduce fractions.`,
        intermediateExpr: targetDerivSimplified
      });

      return {
        firstDeriv,
        secondDeriv,
        targetDeriv: targetDerivSimplified,
        originalValAtX,
        firstDerivValAtX,
        secondDerivValAtX,
        targetDerivValAtX,
        tangentEquation,
        normalEquation,
        tangentSlope,
        tangentIntercept,
        curvature,
        radiusOfCurvature,
        concavityText,
        steps
      };
    } catch (err: any) {
      setError(`Calculation error: ${err.message || 'Invalid single variable expression'}`);
      return null;
    }
  }, [mode, singleExpr, singleVar, singleOrder, singleEvalX]);

  // -------------------------------------------------------------
  // 2. MULTIVARIABLE & PARTIAL DERIVATIVES CALCULATIONS
  // -------------------------------------------------------------
  const partialCalc = useMemo(() => {
    if (mode !== 'partial' || !partialExpr.trim()) return null;
    setError(null);

    try {
      // First Partials: fx, fy
      const fxRaw = nerdamer.diff(partialExpr, 'x').toString();
      const fx = nerdamer(fxRaw).simplify().toString();
      const fyRaw = nerdamer.diff(partialExpr, 'y').toString();
      const fy = nerdamer(fyRaw).simplify().toString();

      // Second Partials: fxx, fyy, fxy, fyx
      const fxx = nerdamer(nerdamer.diff(fx, 'x').toString()).simplify().toString();
      const fyy = nerdamer(nerdamer.diff(fy, 'y').toString()).simplify().toString();
      const fxy = nerdamer(nerdamer.diff(fx, 'y').toString()).simplify().toString();
      const fyx = nerdamer(nerdamer.diff(fy, 'x').toString()).simplify().toString();

      // Laplacian: Laplacian = fxx + fyy
      const laplacian = nerdamer(`(${fxx}) + (${fyy})`).simplify().toString();

      // Numerical Evaluation at (x0, y0)
      const x0 = parseFloat(partialX0) || 0;
      const y0 = parseFloat(partialY0) || 0;
      const scope = { x: x0, y: y0 };

      let fVal = 0, fxVal = 0, fyVal = 0, fxxVal = 0, fyyVal = 0, fxyVal = 0;
      try { fVal = math.evaluate(partialExpr, scope); } catch {}
      try { fxVal = math.evaluate(fx, scope); } catch {}
      try { fyVal = math.evaluate(fy, scope); } catch {}
      try { fxxVal = math.evaluate(fxx, scope); } catch {}
      try { fyyVal = math.evaluate(fyy, scope); } catch {}
      try { fxyVal = math.evaluate(fxy, scope); } catch {}

      // Gradient Vector & Magnitude
      const gradMag = Math.sqrt(fxVal * fxVal + fyVal * fyVal);

      // Hessian Matrix Determinant D = fxx*fyy - (fxy)^2
      const hessianDet = fxxVal * fyyVal - Math.pow(fxyVal, 2);
      let classification = 'Inconclusive / Neutral';
      if (hessianDet > 0) {
        if (fxxVal > 0) classification = 'Local Minimum (Hessian is positive definite)';
        else if (fxxVal < 0) classification = 'Local Maximum (Hessian is negative definite)';
      } else if (hessianDet < 0) {
        classification = 'Saddle Point (Hessian is indefinite; mixed curvature)';
      } else {
        classification = 'D = 0: Second derivative test is inconclusive';
      }

      // Directional Derivative in direction (u, v)
      const uRaw = parseFloat(partialDirU) || 1;
      const vRaw = parseFloat(partialDirV) || 1;
      const uNorm = Math.sqrt(uRaw * uRaw + vRaw * vRaw) || 1;
      const uUnit = uRaw / uNorm;
      const vUnit = vRaw / uNorm;
      const dirDerivVal = fxVal * uUnit + fyVal * vUnit;

      // Tangent Plane at (x0, y0, z0): z - z0 = fx*(x - x0) + fy*(y - y0)
      const z0 = fVal;
      const constTerm = z0 - fxVal * x0 - fyVal * y0;
      const constSign = constTerm >= 0 ? '+' : '-';
      const planeEq = `z = ${fxVal.toFixed(4)}x + ${fyVal.toFixed(4)}y ${constSign} ${Math.abs(constTerm).toFixed(4)}`;

      return {
        fx,
        fy,
        fxx,
        fyy,
        fxy,
        fyx,
        laplacian,
        fVal,
        fxVal,
        fyVal,
        fxxVal,
        fyyVal,
        fxyVal,
        gradMag,
        hessianDet,
        classification,
        dirDerivVal,
        planeEq
      };
    } catch (err: any) {
      setError(`Multivariable error: ${err.message || 'Check multivariable syntax'}`);
      return null;
    }
  }, [mode, partialExpr, partialX0, partialY0, partialDirU, partialDirV]);

  // -------------------------------------------------------------
  // 3. IMPLICIT DIFFERENTIATION CALCULATIONS: F(x, y) = 0
  // -------------------------------------------------------------
  const implicitCalc = useMemo(() => {
    if (mode !== 'implicit' || !implicitExpr.trim()) return null;
    setError(null);

    try {
      // Fx and Fy
      const Fx = nerdamer.diff(implicitExpr, 'x').simplify().toString();
      const Fy = nerdamer.diff(implicitExpr, 'y').simplify().toString();

      // dy/dx = - Fx / Fy
      const dydx = nerdamer(`-(${Fx})/(${Fy})`).simplify().toString();

      // Second derivative: d2y/dx2 = -(Fxx*Fy^2 - 2*Fxy*Fx*Fy + Fyy*Fx^2) / Fy^3
      const Fxx = nerdamer.diff(Fx, 'x').simplify().toString();
      const Fyy = nerdamer.diff(Fy, 'y').simplify().toString();
      const Fxy = nerdamer.diff(Fx, 'y').simplify().toString();

      const d2ydx2Formula = `- ((${Fxx})*(${Fy})^2 - 2*(${Fxy})*(${Fx})*(${Fy}) + (${Fyy})*(${Fx})^2) / ((${Fy})^3)`;
      let d2ydx2 = 'Complex';
      try {
        d2ydx2 = nerdamer(d2ydx2Formula).simplify().toString();
      } catch {}

      // Evaluation at (x0, y0)
      const x0 = parseFloat(implicitX0) || 0;
      const y0 = parseFloat(implicitY0) || 0;
      const scope = { x: x0, y: y0 };

      let FxVal = 0, FyVal = 0, dydxVal: number | null = null, tangentEq = 'Undefined';
      try { FxVal = math.evaluate(Fx, scope); } catch {}
      try { FyVal = math.evaluate(Fy, scope); } catch {}

      if (Math.abs(FyVal) > 1e-9) {
        dydxVal = -FxVal / FyVal;
        const slopeStr = dydxVal.toFixed(4);
        const intercept = y0 - dydxVal * x0;
        const intSign = intercept >= 0 ? '+' : '-';
        tangentEq = `y = ${slopeStr}x ${intSign} ${Math.abs(intercept).toFixed(4)}`;
      } else {
        tangentEq = `x = ${x0.toFixed(4)} (Vertical Tangent Line)`;
      }

      return {
        Fx,
        Fy,
        dydx,
        d2ydx2,
        dydxVal,
        tangentEq
      };
    } catch (err: any) {
      setError(`Implicit error: ${err.message || 'Check implicit equation'}`);
      return null;
    }
  }, [mode, implicitExpr, implicitX0, implicitY0]);

  // -------------------------------------------------------------
  // 4. PARAMETRIC DIFFERENTIATION: x(t), y(t)
  // -------------------------------------------------------------
  const paramCalc = useMemo(() => {
    if (mode !== 'parametric' || !paramXExpr.trim() || !paramYExpr.trim()) return null;
    setError(null);

    try {
      // dx/dt and dy/dt
      const dxdt = nerdamer.diff(paramXExpr, 't').simplify().toString();
      const dydt = nerdamer.diff(paramYExpr, 't').simplify().toString();

      // dy/dx = (dy/dt) / (dx/dt)
      const dydx = nerdamer(`(${dydt})/(${dxdt})`).simplify().toString();

      // Second derivative: d2y/dx2 = (d/dt(dy/dx)) / (dx/dt)
      const d_dydx_dt = nerdamer.diff(dydx, 't').simplify().toString();
      const d2ydx2 = nerdamer(`(${d_dydx_dt})/(${dxdt})`).simplify().toString();

      // Evaluation at t = t0
      const t0 = parseFloat(paramT0) || 0;
      const scope = { t: t0 };

      let dxdtVal = 0, dydtVal = 0, speedVal = 0, curvatureVal: number | null = null;

      try { dxdtVal = math.evaluate(dxdt, scope); } catch {}
      try { dydtVal = math.evaluate(dydt, scope); } catch {}
      try { speedVal = Math.sqrt(dxdtVal * dxdtVal + dydtVal * dydtVal); } catch {}

      // Curvature kappa = |x'y'' - y'x''| / (x'^2 + y'^2)^(3/2)
      try {
        const d2xdt2 = math.evaluate(nerdamer.diff(dxdt, 't').toString(), scope);
        const d2ydt2 = math.evaluate(nerdamer.diff(dydt, 't').toString(), scope);
        const numerator = Math.abs(dxdtVal * d2ydt2 - dydtVal * d2xdt2);
        const denominator = Math.pow(dxdtVal * dxdtVal + dydtVal * dydtVal, 1.5);
        if (denominator > 1e-9) curvatureVal = numerator / denominator;
      } catch {}

      return {
        dxdt,
        dydt,
        dydx,
        d2ydx2,
        speedVal,
        curvatureVal
      };
    } catch (err: any) {
      setError(`Parametric error: ${err.message || 'Check parametric equations'}`);
      return null;
    }
  }, [mode, paramXExpr, paramYExpr, paramT0]);

  // -------------------------------------------------------------
  // 5. TAYLOR & MACLAURIN POLYNOMIAL EXPANSION
  // -------------------------------------------------------------
  const taylorCalc = useMemo(() => {
    if (mode !== 'taylor' || !taylorExpr.trim()) return null;
    setError(null);

    try {
      const a = parseFloat(taylorCenterA) || 0;
      const testX = parseFloat(taylorTestX) || 0;
      const maxN = Math.min(Math.max(taylorDegreeN, 1), 8);

      const terms: TaylorTerm[] = [];
      let currentDeriv = taylorExpr;
      let factorial = 1;
      const polyTermsStr: string[] = [];

      for (let k = 0; k <= maxN; k++) {
        if (k > 0) {
          factorial *= k;
          currentDeriv = nerdamer.diff(currentDeriv, 'x').toString();
        }
        const simplifiedDeriv = nerdamer(currentDeriv).simplify().toString();
        let derivVal = 0;
        try {
          derivVal = math.evaluate(simplifiedDeriv, { x: a });
        } catch {}

        const coef = derivVal / factorial;
        let termLatex = '';
        if (k === 0) {
          termLatex = derivVal.toFixed(4);
          polyTermsStr.push(`${derivVal.toFixed(4)}`);
        } else {
          const sign = coef >= 0 ? '+' : '-';
          const absCoef = Math.abs(coef).toFixed(4);
          const shiftStr = a === 0 ? 'x' : `(x - ${a})`;
          const powStr = k === 1 ? shiftStr : `${shiftStr}^${k}`;
          termLatex = `${sign} \\frac{${Math.abs(derivVal).toFixed(4)}}{${factorial}}${powStr}`;
          polyTermsStr.push(`${sign} ${absCoef} * ${powStr}`);
        }

        terms.push({
          order: k,
          derivativeExpr: simplifiedDeriv,
          derivativeVal: derivVal,
          factorial,
          coefficient: coef,
          termLaTeX: termLatex
        });
      }

      const fullTaylorPolyString = polyTermsStr.join(' ');
      let exactFVal = 0;
      let approxVal = 0;
      try { exactFVal = math.evaluate(taylorExpr, { x: testX }); } catch {}
      try {
        approxVal = terms.reduce((acc, t) => acc + t.coefficient * Math.pow(testX - a, t.order), 0);
      } catch {}

      const absError = Math.abs(exactFVal - approxVal);
      const relError = Math.abs(exactFVal) > 1e-9 ? (absError / Math.abs(exactFVal)) * 100 : 0;

      return {
        a,
        maxN,
        terms,
        fullTaylorPolyString,
        exactFVal,
        approxVal,
        relError
      };
    } catch (err: any) {
      setError(`Taylor series error: ${err.message || 'Check expression'}`);
      return null;
    }
  }, [mode, taylorExpr, taylorCenterA, taylorDegreeN, taylorTestX]);

  // -------------------------------------------------------------
  // 6. CRITICAL POINTS & CURVE OPTIMIZATION
  // -------------------------------------------------------------
  const optCalc = useMemo(() => {
    if (mode !== 'optimization' || !optExpr.trim()) return null;
    setError(null);

    try {
      const firstDeriv = nerdamer.diff(optExpr, 'x').simplify().toString();
      const secondDeriv = nerdamer.diff(firstDeriv, 'x').simplify().toString();

      const minX = parseFloat(optDomainMin) || -5;
      const maxX = parseFloat(optDomainMax) || 5;

      const criticalPoints: CriticalPoint[] = [];
      const rootsFound = new Set<number>();

      // High-precision numerical bisection with Newton-Raphson refinement
      const samples = 150;
      const step = (maxX - minX) / samples;
      let prevX = minX;
      let prevVal: number | null = null;
      try { prevVal = math.evaluate(firstDeriv, { x: prevX }); } catch {}

      for (let i = 1; i <= samples; i++) {
        const currX = minX + i * step;
        let currVal: number | null = null;
        try { currVal = math.evaluate(firstDeriv, { x: currX }); } catch {}

        if (prevVal !== null && currVal !== null && (prevVal * currVal <= 0 || Math.abs(currVal) < 1e-6)) {
          let root = (prevX + currX) / 2;
          // 5 iterations of Newton-Raphson for machine precision
          for (let iter = 0; iter < 5; iter++) {
            try {
              const fP = math.evaluate(firstDeriv, { x: root });
              const fPP = math.evaluate(secondDeriv, { x: root });
              if (Math.abs(fPP) > 1e-9) {
                root = root - fP / fPP;
              }
            } catch {}
          }
          if (root >= minX - 0.1 && root <= maxX + 0.1 && isFinite(root)) {
            rootsFound.add(parseFloat(root.toFixed(3)));
          }
        }
        prevX = currX;
        prevVal = currVal;
      }

      // Classify each critical point
      Array.from(rootsFound).sort((a, b) => a - b).forEach((rx) => {
        let yVal = 0, fP = 0, fPP = 0;
        try { yVal = math.evaluate(optExpr, { x: rx }); } catch {}
        try { fP = math.evaluate(firstDeriv, { x: rx }); } catch {}
        try { fPP = math.evaluate(secondDeriv, { x: rx }); } catch {}

        let cpType: CriticalPoint['type'] = 'Stationary / Inconclusive';
        if (fPP > 0.0001) cpType = 'Local Minimum';
        else if (fPP < -0.0001) cpType = 'Local Maximum';
        else cpType = 'Inflection Point';

        criticalPoints.push({
          x: rx,
          y: yVal,
          fPrime: fP,
          fDoublePrime: fPP,
          type: cpType
        });
      });

      return {
        firstDeriv,
        secondDeriv,
        criticalPoints
      };
    } catch (err: any) {
      setError(`Optimization error: ${err.message || 'Check optimization function'}`);
      return null;
    }
  }, [mode, optExpr, optDomainMin, optDomainMax]);

  // -------------------------------------------------------------
  // INTERACTIVE GRAPH ENGINE
  // -------------------------------------------------------------
  const graphData = useMemo(() => {
    const activeExpr = mode === 'single' ? singleExpr : mode === 'optimization' ? optExpr : mode === 'taylor' ? taylorExpr : 'x^2';
    const activeDeriv = singleCalc?.targetDeriv || optCalc?.firstDeriv || '2*x';
    const activeTaylor = taylorCalc?.fullTaylorPolyString || null;

    const svgWidth = 600;
    const svgHeight = 320;
    const padding = 40;
    const xMin = -6;
    const xMax = 6;
    const yMin = -6;
    const yMax = 6;

    const mapX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (svgWidth - 2 * padding);
    const mapY = (y: number) => svgHeight - padding - ((y - yMin) / (yMax - yMin)) * (svgHeight - 2 * padding);

    const originalPoints: string[] = [];
    const derivativePoints: string[] = [];
    const taylorPoints: string[] = [];
    const numSamples = 160;

    for (let i = 0; i <= numSamples; i++) {
      const xVal = xMin + (i / numSamples) * (xMax - xMin);
      const px = mapX(xVal);

      // f(x)
      try {
        const yVal = math.evaluate(activeExpr, { x: xVal, [singleVar]: xVal });
        if (typeof yVal === 'number' && !isNaN(yVal) && isFinite(yVal)) {
          const py = Math.max(padding - 20, Math.min(svgHeight - padding + 20, mapY(yVal)));
          originalPoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
        }
      } catch {}

      // f'(x)
      try {
        const yVal = math.evaluate(activeDeriv, { x: xVal, [singleVar]: xVal });
        if (typeof yVal === 'number' && !isNaN(yVal) && isFinite(yVal)) {
          const py = Math.max(padding - 20, Math.min(svgHeight - padding + 20, mapY(yVal)));
          derivativePoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
        }
      } catch {}

      // Taylor Polynomial curve
      if (activeTaylor && mode === 'taylor') {
        try {
          const yVal = taylorCalc?.terms.reduce((acc, t) => acc + t.coefficient * Math.pow(xVal - (taylorCalc?.a || 0), t.order), 0);
          if (typeof yVal === 'number' && !isNaN(yVal) && isFinite(yVal)) {
            const py = Math.max(padding - 20, Math.min(svgHeight - padding + 20, mapY(yVal)));
            taylorPoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
          }
        } catch {}
      }
    }

    // Dynamic Tangent Line at probed or selected X
    let tangentPoints: string[] = [];
    let probeCoords: { x: number; y: number; slope: number } | null = null;
    const targetX = probeX !== null ? probeX : parseFloat(singleEvalX) || 2;

    if (!isNaN(targetX)) {
      try {
        const y0 = math.evaluate(activeExpr, { x: targetX, [singleVar]: targetX });
        const slope = math.evaluate(activeDeriv, { x: targetX, [singleVar]: targetX });
        if (typeof y0 === 'number' && typeof slope === 'number' && isFinite(y0) && isFinite(slope)) {
          const intercept = y0 - slope * targetX;
          const xA = xMin;
          const yA = slope * xA + intercept;
          const xB = xMax;
          const yB = slope * xB + intercept;
          tangentPoints = [
            `${mapX(xA).toFixed(1)},${mapY(yA).toFixed(1)}`,
            `${mapX(xB).toFixed(1)},${mapY(yB).toFixed(1)}`
          ];
          probeCoords = { x: targetX, y: y0, slope };
        }
      } catch {}
    }

    return {
      svgWidth,
      svgHeight,
      originX: mapX(0),
      originY: mapY(0),
      mapX,
      mapY,
      originalPath: originalPoints.length > 1 ? `M ${originalPoints.join(' L ')}` : '',
      derivativePath: derivativePoints.length > 1 ? `M ${derivativePoints.join(' L ')}` : '',
      taylorPath: taylorPoints.length > 1 ? `M ${taylorPoints.join(' L ')}` : '',
      tangentPath: tangentPoints.length === 2 ? `M ${tangentPoints.join(' L ')}` : '',
      probeCoords
    };
  }, [mode, singleExpr, singleVar, singleCalc, optExpr, optCalc, taylorExpr, taylorCalc, singleEvalX, probeX]);

  // Copy handlers
  const handleCopySolution = (format: 'latex' | 'all') => {
    let content = '';
    if (mode === 'single' && singleCalc) {
      if (format === 'latex') {
        content = `\\frac{d^{${singleOrder}}}{d${singleVar}^{${singleOrder}}}\\left[ ${singleExpr} \\right] = ${singleCalc.targetDeriv}`;
      } else {
        content = `# Single-Variable Calculus Derivation\nFunction: f(${singleVar}) = ${singleExpr}\nDerivative Order: ${singleOrder}\nResult: ${singleCalc.targetDeriv}\nTangent Line: ${singleCalc.tangentEquation}\nCurvature: ${singleCalc.curvature?.toFixed(4)}\n\nSteps:\n` +
          singleCalc.steps.map(s => `${s.stepNumber}. ${s.title}: ${s.latexFormula}`).join('\n');
      }
    } else if (mode === 'partial' && partialCalc) {
      content = `# Multivariable Calculus Analysis\nFunction: f(x, y) = ${partialExpr}\n∂f/∂x = ${partialCalc.fx}\n∂f/∂y = ${partialCalc.fy}\nGradient: ∇f = (${partialCalc.fx}, ${partialCalc.fy})\nHessian Det: D = ${partialCalc.hessianDet.toFixed(4)} (${partialCalc.classification})\nTangent Plane: ${partialCalc.planeEq}`;
    } else if (mode === 'implicit' && implicitCalc) {
      content = `# Implicit Differentiation\nEquation: ${implicitExpr} = 0\ndy/dx = ${implicitCalc.dydx}\nd²y/dx² = ${implicitCalc.d2ydx2}\nTangent Line: ${implicitCalc.tangentEq}`;
    } else if (mode === 'parametric' && paramCalc) {
      content = `# Parametric Calculus\nx(t) = ${paramXExpr}\ny(t) = ${paramYExpr}\ndy/dx = ${paramCalc.dydx}\nd²y/dx² = ${paramCalc.d2ydx2}\nCurvature κ = ${paramCalc.curvatureVal?.toFixed(4)}`;
    } else if (mode === 'taylor' && taylorCalc) {
      content = `# Taylor Polynomial Expansion\nf(x) = ${taylorExpr} around a = ${taylorCalc.a}\nT_${taylorCalc.maxN}(x) = ${taylorCalc.fullTaylorPolyString}`;
    } else if (mode === 'optimization' && optCalc) {
      content = `# Curve Optimization\nf(x) = ${optExpr}\nCritical Points: ` + optCalc.criticalPoints.map(c => `(${c.x}, ${c.y.toFixed(2)}) -> ${c.type}`).join(', ');
    }

    navigator.clipboard.writeText(content);
    setCopiedType(format);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto">
      {/* Top Banner / Feature Callout */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/[0.05] via-purple-500/[0.03] to-transparent border border-indigo-500/15 dark:border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider">
              Calculus & Derivative Studio
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">University & Engineering Grade</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Advanced Derivative & Calculus Studio
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
            Perform Single-Variable, Multivariable & Partial, Implicit, Parametric, Taylor Series, and Curve Optimization derivations with step-by-step mathematical proofs and interactive multi-curve graphs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => handleCopySolution('latex')}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:border-indigo-500/40 text-zinc-700 dark:text-zinc-300 transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {copiedType === 'latex' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
            <span>{copiedType === 'latex' ? 'LaTeX Copied!' : 'Copy LaTeX'}</span>
          </button>
          <button
            onClick={() => handleCopySolution('all')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {copiedType === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{copiedType === 'all' ? 'Solution Copied!' : 'Copy Full Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold">
        {[
          { id: 'single', name: '1. Single Variable & Higher-Order', icon: Sliders },
          { id: 'partial', name: '2. Multivariable & Partials (∇f, H)', icon: Grid },
          { id: 'implicit', name: '3. Implicit Diff (F(x,y)=0)', icon: Activity },
          { id: 'parametric', name: '4. Parametric (x(t), y(t))', icon: Compass },
          { id: 'taylor', name: '5. Taylor & Maclaurin Series', icon: Sparkles },
          { id: 'optimization', name: '6. Critical Points & Min/Max', icon: Target },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = mode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setMode(tab.id as CalculusMode); setError(null); }}
              className={`px-4 py-2.5 rounded-t-xl shrink-0 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Error Alert Display */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (5 Cols) - Inputs & Mode Results */}
        <div className="lg:col-span-5 space-y-6">

          {/* MODE 1: SINGLE VARIABLE INPUTS */}
          {mode === 'single' && (
            <div className="saas-card p-6 space-y-5 border border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Function Expression f({singleVar})</span>
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">e.g. x^3 - 3*x^2 + 2*x</span>
                </div>
                <input
                  type="text"
                  value={singleExpr}
                  onChange={(e) => setSingleExpr(e.target.value)}
                  placeholder="e.g. x^3 - 3*x^2 + 2*x"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Variable</label>
                  <select
                    value={singleVar}
                    onChange={(e) => setSingleVar(e.target.value)}
                    className="saas-select font-mono font-bold"
                  >
                    {['x', 't', 'u', 'y', 'z', 'θ'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Order</label>
                  <select
                    value={singleOrder}
                    onChange={(e) => setSingleOrder(parseInt(e.target.value))}
                    className="saas-select"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <option key={n} value={n}>Order {n}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500">At {singleVar} =</label>
                  <input
                    type="number"
                    step="any"
                    value={singleEvalX}
                    onChange={(e) => setSingleEvalX(e.target.value)}
                    className="saas-input font-mono font-bold"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Single Variable Presets</span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  {[
                    { name: 'Cubic Poly', expr: 'x^3 - 3*x^2 + 2*x', ord: 1 },
                    { name: 'Product Rule', expr: 'x^2 * sin(x)', ord: 1 },
                    { name: 'Quotient Rule', expr: '(x^2 + 1)/(x - 1)', ord: 1 },
                    { name: 'Chain Exponential', expr: 'exp(-x^2)', ord: 2 },
                    { name: 'Logarithmic', expr: 'x * ln(x)', ord: 1 }
                  ].map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => { setSingleExpr(p.expr); setSingleOrder(p.ord); }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: MULTIVARIABLE & PARTIAL INPUTS */}
          {mode === 'partial' && (
            <div className="saas-card p-6 space-y-5 border border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Multivariable Function f(x, y)</span>
                </label>
                <input
                  type="text"
                  value={partialExpr}
                  onChange={(e) => setPartialExpr(e.target.value)}
                  placeholder="e.g. x^3*y + sin(x*y) - 2*y^2"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Point x₀</label>
                  <input type="number" step="any" value={partialX0} onChange={(e) => setPartialX0(e.target.value)} className="saas-input font-mono font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Point y₀</label>
                  <input type="number" step="any" value={partialY0} onChange={(e) => setPartialY0(e.target.value)} className="saas-input font-mono font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Direction Vector u_x</label>
                  <input type="number" value={partialDirU} onChange={(e) => setPartialDirU(e.target.value)} className="saas-input font-mono text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Direction Vector u_y</label>
                  <input type="number" value={partialDirV} onChange={(e) => setPartialDirV(e.target.value)} className="saas-input font-mono text-xs" />
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Multivariable Presets</span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  {[
                    { name: 'Saddle Point', expr: 'x^2 - y^2', x: '0', y: '0' },
                    { name: 'Paraboloid Min', expr: 'x^2 + y^2', x: '1', y: '1' },
                    { name: 'Rosenbrock Valley', expr: '(1 - x)^2 + 100*(y - x^2)^2', x: '1', y: '1' }
                  ].map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => { setPartialExpr(p.expr); setPartialX0(p.x); setPartialY0(p.y); }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: IMPLICIT INPUTS */}
          {mode === 'implicit' && (
            <div className="saas-card p-6 space-y-5 border border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Implicit Equation F(x, y) = 0</span>
                </label>
                <input
                  type="text"
                  value={implicitExpr}
                  onChange={(e) => setImplicitExpr(e.target.value)}
                  placeholder="e.g. x^2 + y^2 - 25"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Probe Point x₀</label>
                  <input type="number" step="any" value={implicitX0} onChange={(e) => setImplicitX0(e.target.value)} className="saas-input font-mono font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Probe Point y₀</label>
                  <input type="number" step="any" value={implicitY0} onChange={(e) => setImplicitY0(e.target.value)} className="saas-input font-mono font-bold" />
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Implicit Presets</span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  {[
                    { name: 'Circle R=5', expr: 'x^2 + y^2 - 25', x: '3', y: '4' },
                    { name: 'Folium of Descartes', expr: 'x^3 + y^3 - 6*x*y', x: '3', y: '3' },
                    { name: 'Astroid', expr: 'x^(2/3) + y^(2/3) - 4', x: '2.828', y: '2.828' }
                  ].map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => { setImplicitExpr(p.expr); setImplicitX0(p.x); setImplicitY0(p.y); }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODE 4: PARAMETRIC INPUTS */}
          {mode === 'parametric' && (
            <div className="saas-card p-6 space-y-5 border border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Parametric Equation x(t)</span>
                </label>
                <input
                  type="text"
                  value={paramXExpr}
                  onChange={(e) => setParamXExpr(e.target.value)}
                  placeholder="e.g. cos(t) + t*sin(t)"
                  className="saas-input font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Parametric Equation y(t)</label>
                <input
                  type="text"
                  value={paramYExpr}
                  onChange={(e) => setParamYExpr(e.target.value)}
                  placeholder="e.g. sin(t) - t*cos(t)"
                  className="saas-input font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Parameter Value t₀</label>
                <input type="number" step="any" value={paramT0} onChange={(e) => setParamT0(e.target.value)} className="saas-input font-mono font-bold" />
              </div>

              {/* Presets */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Parametric Presets</span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  {[
                    { name: 'Circle', x: 'cos(t)', y: 'sin(t)', t: '0.785' },
                    { name: 'Involute of Circle', x: 'cos(t) + t*sin(t)', y: 'sin(t) - t*cos(t)', t: '1.57' },
                    { name: 'Cycloid', x: 't - sin(t)', y: '1 - cos(t)', t: '3.14' }
                  ].map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => { setParamXExpr(p.x); setParamYExpr(p.y); setParamT0(p.t); }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODE 5: TAYLOR SERIES INPUTS */}
          {mode === 'taylor' && (
            <div className="saas-card p-6 space-y-5 border border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Function f(x) for Series Expansion</span>
                </label>
                <input
                  type="text"
                  value={taylorExpr}
                  onChange={(e) => setTaylorExpr(e.target.value)}
                  placeholder="e.g. sin(x) or exp(x)"
                  className="saas-input font-mono font-bold"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Center a</label>
                  <input type="number" step="any" value={taylorCenterA} onChange={(e) => setTaylorCenterA(e.target.value)} className="saas-input font-mono text-xs font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Max Degree N</label>
                  <select value={taylorDegreeN} onChange={(e) => setTaylorDegreeN(parseInt(e.target.value))} className="saas-select text-xs font-bold">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(d => <option key={d} value={d}>Degree {d}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-zinc-400">Test Point x</label>
                  <input type="number" step="any" value={taylorTestX} onChange={(e) => setTaylorTestX(e.target.value)} className="saas-input font-mono text-xs font-bold" />
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Taylor Presets</span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  {[
                    { name: 'sin(x) at a=0', expr: 'sin(x)', a: '0', n: 5 },
                    { name: 'exp(x) at a=0', expr: 'exp(x)', a: '0', n: 5 },
                    { name: 'cos(x) at a=0', expr: 'cos(x)', a: '0', n: 6 },
                    { name: 'ln(1+x) at a=0', expr: 'ln(1+x)', a: '0', n: 4 }
                  ].map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => { setTaylorExpr(p.expr); setTaylorCenterA(p.a); setTaylorDegreeN(p.n); }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODE 6: OPTIMIZATION INPUTS */}
          {mode === 'optimization' && (
            <div className="saas-card p-6 space-y-5 border border-zinc-200 dark:border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Optimization Objective f(x)</span>
                </label>
                <input
                  type="text"
                  value={optExpr}
                  onChange={(e) => setOptExpr(e.target.value)}
                  placeholder="e.g. x^4 - 4*x^3 + 4*x^2"
                  className="saas-input font-mono font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Domain Min</label>
                  <input type="number" value={optDomainMin} onChange={(e) => setOptDomainMin(e.target.value)} className="saas-input font-mono font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-500">Domain Max</label>
                  <input type="number" value={optDomainMax} onChange={(e) => setOptDomainMax(e.target.value)} className="saas-input font-mono font-bold" />
                </div>
              </div>

              {/* Presets */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">Extrema Presets</span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  {[
                    { name: 'Double Well Potential', expr: 'x^4 - 2*x^2', min: '-2', max: '2' },
                    { name: 'Cubic with Extremum', expr: 'x^3 - 3*x', min: '-3', max: '3' },
                    { name: 'Damped Sine Wave', expr: 'exp(-0.2*x)*sin(x)', min: '0', max: '6' }
                  ].map(p => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => { setOptExpr(p.expr); setOptDomainMin(p.min); setOptDomainMax(p.max); }}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Keypad & Reset */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Quick Symbol Keypad
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Mode</span>
              </button>
            </div>
            <div className="grid grid-cols-8 gap-1.5 text-xs font-mono">
              {['x', 'y', 't', '^2', '^', 'sqrt(', 'sin(', 'cos(', 'tan(', 'ln(', 'exp(', 'pi', '+', '-', '*', '/'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => insertSymbol(sym)}
                  className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 text-zinc-800 dark:text-zinc-200 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary Box for Current Mode */}
          {mode === 'single' && singleCalc && (
            <div className="saas-card p-6 space-y-4 border border-zinc-200 dark:border-zinc-800 shadow-md">
              <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Symbolic Derivative Output
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Order {singleOrder}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase block">
                  d^{singleOrder}/d{singleVar}^{singleOrder} [ {singleExpr} ] =
                </span>
                <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 break-all select-all">
                  {singleCalc.targetDeriv}
                </div>
              </div>
              {singleCalc.firstDerivValAtX !== null && (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Tangent Slope m</span>
                      <span className="font-mono text-base font-extrabold text-zinc-900 dark:text-white">{singleCalc.firstDerivValAtX.toFixed(6)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Curvature κ</span>
                      <span className="font-mono text-base font-extrabold text-indigo-600 dark:text-indigo-400">{singleCalc.curvature !== null ? singleCalc.curvature.toFixed(4) : 'N/A'}</span>
                    </div>
                  </div>
                  {singleCalc.tangentEquation && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <span className="text-[9px] font-mono text-amber-700 dark:text-amber-400 uppercase block font-bold">Tangent Line</span>
                      <div className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 select-all">{singleCalc.tangentEquation}</div>
                    </div>
                  )}
                  {singleCalc.normalEquation && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                      <span className="text-[9px] font-mono text-purple-700 dark:text-purple-400 uppercase block font-bold">Normal Line</span>
                      <div className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 select-all">{singleCalc.normalEquation}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === 'partial' && partialCalc && (
            <div className="saas-card p-6 space-y-4 border border-zinc-200 dark:border-zinc-800 shadow-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block border-b border-zinc-200 dark:border-zinc-800 pb-2">
                Multivariable Analysis Output
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[9px] text-zinc-400 uppercase block font-bold">∂f/∂x</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold break-all block">{partialCalc.fx}</span>
                  <span className="text-[10px] text-zinc-500 block">Evaluated: {partialCalc.fxVal.toFixed(4)}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[9px] text-zinc-400 uppercase block font-bold">∂f/∂y</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold break-all block">{partialCalc.fy}</span>
                  <span className="text-[10px] text-zinc-500 block">Evaluated: {partialCalc.fyVal.toFixed(4)}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                <span className="text-[9px] font-mono text-indigo-700 dark:text-indigo-400 uppercase block font-bold">Gradient Vector ∇f & Magnitude</span>
                <div className="font-mono text-xs font-black text-zinc-900 dark:text-zinc-100">
                  ∇f = ({partialCalc.fxVal.toFixed(3)}, {partialCalc.fyVal.toFixed(3)}) | ||∇f|| = {partialCalc.gradMag.toFixed(4)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                <span className="text-[9px] font-mono text-purple-700 dark:text-purple-400 uppercase block font-bold">Hessian Matrix Classification (D = {partialCalc.hessianDet.toFixed(4)})</span>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{partialCalc.classification}</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[9px] font-mono text-amber-700 dark:text-amber-400 uppercase block font-bold">Tangent Plane Equation</span>
                <div className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">{partialCalc.planeEq}</div>
              </div>
            </div>
          )}

          {mode === 'implicit' && implicitCalc && (
            <div className="saas-card p-6 space-y-4 border border-zinc-200 dark:border-zinc-800 shadow-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block border-b border-zinc-200 dark:border-zinc-800 pb-2">
                Implicit Differentiation Results
              </span>
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-zinc-400 uppercase block">dy/dx = - (∂F/∂x) / (∂F/∂y)</span>
                <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 break-all select-all">
                  dy/dx = {implicitCalc.dydx}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-[9px] font-mono text-zinc-400 uppercase block">Second Derivative d²y/dx²</span>
                <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 break-all">{implicitCalc.d2ydx2}</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[9px] font-mono text-amber-700 dark:text-amber-400 uppercase block font-bold">Tangent Line at ({implicitX0}, {implicitY0})</span>
                <div className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">{implicitCalc.tangentEq}</div>
              </div>
            </div>
          )}

          {mode === 'parametric' && paramCalc && (
            <div className="saas-card p-6 space-y-4 border border-zinc-200 dark:border-zinc-800 shadow-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block border-b border-zinc-200 dark:border-zinc-800 pb-2">
                Parametric Derivative Results
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 block">dx/dt</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{paramCalc.dxdt}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 block">dy/dt</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{paramCalc.dydt}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-400 uppercase block">dy/dx = (dy/dt) / (dx/dt)</span>
                <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 break-all select-all">
                  dy/dx = {paramCalc.dydx}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono">
                  <span className="text-[9px] text-zinc-400 block">Speed ||v||</span>
                  <span className="font-extrabold text-zinc-900 dark:text-white">{paramCalc.speedVal.toFixed(4)}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono">
                  <span className="text-[9px] text-zinc-400 block">Curvature κ(t)</span>
                  <span className="font-extrabold text-purple-600 dark:text-purple-400">{paramCalc.curvatureVal !== null ? paramCalc.curvatureVal.toFixed(4) : 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {mode === 'taylor' && taylorCalc && (
            <div className="saas-card p-6 space-y-4 border border-zinc-200 dark:border-zinc-800 shadow-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block border-b border-zinc-200 dark:border-zinc-800 pb-2">
                Taylor Polynomial Approximation
              </span>
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-400 uppercase block">Degree {taylorCalc.maxN} Polynomial T_{taylorCalc.maxN}(x)</span>
                <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 break-all select-all leading-relaxed">
                  T(x) = {taylorCalc.fullTaylorPolyString}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-2">
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 block">Exact f({taylorTestX})</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{taylorCalc.exactFVal.toFixed(6)}</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 block">Taylor T({taylorTestX})</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{taylorCalc.approxVal.toFixed(6)}</span>
                </div>
                <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] text-zinc-400 block">Rel Error</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{taylorCalc.relError.toFixed(4)}%</span>
                </div>
              </div>
            </div>
          )}

          {mode === 'optimization' && optCalc && (
            <div className="saas-card p-6 space-y-4 border border-zinc-200 dark:border-zinc-800 shadow-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block border-b border-zinc-200 dark:border-zinc-800 pb-2">
                Critical Points & Extrema Analysis
              </span>
              <div className="space-y-2">
                {optCalc.criticalPoints.length > 0 ? (
                  optCalc.criticalPoints.map((cp, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-black text-zinc-900 dark:text-white block">({cp.x}, {cp.y.toFixed(3)})</span>
                        <span className="text-[10px] font-mono text-zinc-500">f''(x) = {cp.fDoublePrime.toFixed(3)}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase ${
                        cp.type === 'Local Minimum'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                          : cp.type === 'Local Maximum'
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20'
                      }`}>
                        {cp.type}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-zinc-500 p-2">No real stationary points found within specified domain.</div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Column (7 Cols) - Interactive Graph & Steps Engine */}
        <div className="lg:col-span-7 space-y-6">

          {/* Interactive Multi-Curve Graph */}
          <div className="saas-card p-6 space-y-4 border border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Interactive Calculus Visualization & Tangent Probe
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                <label className="flex items-center gap-1.5 cursor-pointer text-indigo-600 dark:text-indigo-400">
                  <input type="checkbox" checked={showOriginalCurve} onChange={(e) => setShowOriginalCurve(e.target.checked)} className="rounded text-indigo-600" />
                  <span>f(x)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-purple-600 dark:text-purple-400">
                  <input type="checkbox" checked={showDerivCurve} onChange={(e) => setShowDerivCurve(e.target.checked)} className="rounded text-purple-600" />
                  <span>f'(x)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-amber-600 dark:text-amber-400">
                  <input type="checkbox" checked={showTangentCurve} onChange={(e) => setShowTangentCurve(e.target.checked)} className="rounded text-amber-600" />
                  <span>Tangent Probe</span>
                </label>
                {mode === 'taylor' && (
                  <label className="flex items-center gap-1.5 cursor-pointer text-emerald-600 dark:text-emerald-400">
                    <input type="checkbox" checked={showTaylorCurve} onChange={(e) => setShowTaylorCurve(e.target.checked)} className="rounded text-emerald-600" />
                    <span>Taylor Poly</span>
                  </label>
                )}
              </div>
            </div>

            {/* SVG Graph Viewport */}
            <div 
              className="w-full h-80 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 relative overflow-hidden flex items-center justify-center cursor-crosshair select-none"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const normX = -6 + ((mouseX - 40) / (rect.width - 80)) * 12;
                if (normX >= -6 && normX <= 6) setProbeX(parseFloat(normX.toFixed(2)));
              }}
              onMouseLeave={() => setProbeX(null)}
            >
              <svg viewBox={`0 0 ${graphData.svgWidth} ${graphData.svgHeight}`} className="w-full h-full">
                {/* Grid Lines */}
                {Array.from({ length: 13 }).map((_, i) => {
                  const lineX = graphData.mapX(-6 + i);
                  return (
                    <line key={`gx-${i}`} x1={lineX} y1={0} x2={lineX} y2={graphData.svgHeight} stroke="currentColor" className="text-zinc-200 dark:text-zinc-850/60" strokeWidth={-6 + i === 0 ? 1.5 : 0.5} />
                  );
                })}
                {Array.from({ length: 13 }).map((_, i) => {
                  const lineY = graphData.mapY(-6 + i);
                  return (
                    <line key={`gy-${i}`} x1={0} y1={lineY} x2={graphData.svgWidth} y2={lineY} stroke="currentColor" className="text-zinc-200 dark:text-zinc-850/60" strokeWidth={-6 + i === 0 ? 1.5 : 0.5} />
                  );
                })}

                {/* Axes */}
                <line x1={0} y1={graphData.originY} x2={graphData.svgWidth} y2={graphData.originY} stroke="#71717a" strokeWidth="1.5" />
                <line x1={graphData.originX} y1={0} x2={graphData.originX} y2={graphData.svgHeight} stroke="#71717a" strokeWidth="1.5" />

                {/* Axis Labels */}
                <text x={graphData.svgWidth - 20} y={graphData.originY - 8} fill="#71717a" fontSize="10" fontFamily="monospace" fontWeight="bold">x</text>
                <text x={graphData.originX + 8} y={18} fill="#71717a" fontSize="10" fontFamily="monospace" fontWeight="bold">y</text>

                {/* Plotted Curves */}
                {showOriginalCurve && graphData.originalPath && (
                  <path d={graphData.originalPath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
                )}

                {showDerivCurve && graphData.derivativePath && (
                  <path d={graphData.derivativePath} fill="none" stroke="#a855f7" strokeWidth="2.2" strokeLinecap="round" />
                )}

                {mode === 'taylor' && showTaylorCurve && graphData.taylorPath && (
                  <path d={graphData.taylorPath} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
                )}

                {showTangentCurve && graphData.tangentPath && (
                  <path d={graphData.tangentPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
                )}

                {/* Tangency Probe Dot */}
                {graphData.probeCoords && showTangentCurve && (
                  <g>
                    <circle cx={graphData.mapX(graphData.probeCoords.x)} cy={graphData.mapY(graphData.probeCoords.y)} r="6" fill="#f59e0b" className="animate-pulse" />
                    <circle cx={graphData.mapX(graphData.probeCoords.x)} cy={graphData.mapY(graphData.probeCoords.y)} r="3" fill="#ffffff" />
                  </g>
                )}
              </svg>

              {/* Probe Floating HUD */}
              {graphData.probeCoords && (
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-[10px] font-mono shadow-sm space-y-0.5">
                  <div className="text-zinc-600 dark:text-zinc-400">Probe: x = <strong className="text-zinc-900 dark:text-white">{graphData.probeCoords.x.toFixed(2)}</strong>, y = <strong className="text-zinc-900 dark:text-white">{graphData.probeCoords.y.toFixed(2)}</strong></div>
                  <div className="text-amber-600 dark:text-amber-400 font-bold">Slope f'(x) = {graphData.probeCoords.slope.toFixed(4)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Mode 1 Derivation Steps */}
          {mode === 'single' && singleCalc && singleCalc.steps && (
            <div className="saas-card p-6 space-y-4 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <Layers className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Analytical Step-by-Step Derivation Proof
                </h3>
              </div>
              <div className="space-y-3.5">
                {singleCalc.steps.map((step) => (
                  <div key={step.stepNumber} className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2 shadow-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-black flex items-center justify-center shrink-0">
                          {step.stepNumber}
                        </span>
                        <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white">{step.title}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 text-[9px] font-black uppercase tracking-wider">
                        {step.rule}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">{step.explanation}</p>
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] text-zinc-900 dark:text-indigo-300 font-bold select-all">
                      {step.latexFormula}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode 5 Taylor Term Table */}
          {mode === 'taylor' && taylorCalc && (
            <div className="saas-card p-6 space-y-4 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Taylor Series Term-by-Term Breakdown Table
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 text-[10px] uppercase">
                      <th className="py-2 px-3">Order k</th>
                      <th className="py-2 px-3">f^(k)(x)</th>
                      <th className="py-2 px-3">f^(k)({taylorCalc.a})</th>
                      <th className="py-2 px-3">k!</th>
                      <th className="py-2 px-3">Coefficient c_k</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-zinc-800 dark:text-zinc-200">
                    {taylorCalc.terms.map((t) => (
                      <tr key={t.order}>
                        <td className="py-2 px-3 font-bold text-indigo-600 dark:text-indigo-400">{t.order}</td>
                        <td className="py-2 px-3 max-w-[150px] truncate">{t.derivativeExpr}</td>
                        <td className="py-2 px-3">{t.derivativeVal.toFixed(4)}</td>
                        <td className="py-2 px-3">{t.factorial}</td>
                        <td className="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-400">{t.coefficient.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Calculus Rules Reference */}
          <div className="saas-card p-6 space-y-3 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Calculus & Differentiation Theorems Reference</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-bold text-zinc-900 dark:text-white block text-[10px] uppercase font-sans">Leibniz Product Rule</span>
                <span className="text-zinc-800 dark:text-zinc-300">d/dx [u · v] = u'v + uv'</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-bold text-zinc-900 dark:text-white block text-[10px] uppercase font-sans">Chain Rule</span>
                <span className="text-zinc-800 dark:text-zinc-300">d/dx [f(g(x))] = f'(g(x)) · g'(x)</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-bold text-zinc-900 dark:text-white block text-[10px] uppercase font-sans">Clairaut's / Schwarz's Theorem</span>
                <span className="text-zinc-800 dark:text-zinc-300">∂²f/∂x∂y = ∂²f/∂y∂x</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="font-bold text-zinc-900 dark:text-white block text-[10px] uppercase font-sans">Hessian Determinant</span>
                <span className="text-zinc-800 dark:text-zinc-300">D = f_xx · f_yy - (f_xy)²</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
