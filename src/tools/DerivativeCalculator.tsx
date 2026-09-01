import { useState, useMemo, useRef } from 'react';
import { 
  Copy, 
  RotateCcw, 
  Check, 
  Layers, 
  HelpCircle, 
  Compass, 
  TrendingUp, 
  Sliders,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';

interface StepDetail {
  stepNumber: number;
  title: string;
  rule: string;
  latexFormula: string;
  explanation: string;
  intermediateExpr: string;
}

export default function DerivativeCalculator() {
  const [expression, setExpression] = useState<string>('x^3 - 3*x^2 + 2*x');
  const [variable, setVariable] = useState<string>('x');
  const [order, setOrder] = useState<number>(1);
  const [evalX, setEvalX] = useState<string>('2');
  const [copiedType, setCopiedType] = useState<'text' | 'latex' | 'all' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState<boolean>(true);
  const [showOriginalCurve, setShowOriginalCurve] = useState<boolean>(true);
  const [showDerivCurve, setShowDerivCurve] = useState<boolean>(true);
  const [showTangentCurve, setShowTangentCurve] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick Keypad insert helper
  const insertSymbol = (sym: string) => {
    if (!inputRef.current) {
      setExpression((prev) => prev + sym);
      return;
    }
    const input = inputRef.current;
    const start = input.selectionStart || expression.length;
    const end = input.selectionEnd || expression.length;
    const nextExpr = expression.substring(0, start) + sym + expression.substring(end);
    setExpression(nextExpr);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + sym.length, start + sym.length);
    }, 10);
  };

  // Preset Examples
  const loadExample = (expr: string, varName: string = 'x', ord: number = 1, atVal: string = '2') => {
    setExpression(expr);
    setVariable(varName);
    setOrder(ord);
    setEvalX(atVal);
    setError(null);
  };

  // Perform Differentiation & Step Generation
  const calculation = useMemo(() => {
    setError(null);
    if (!expression.trim()) return null;

    try {
      // 1. First Derivative
      const firstDerivRaw = nerdamer.diff(expression, variable).toString();
      const firstDeriv = nerdamer(firstDerivRaw).simplify().toString();

      // 2. Second Derivative
      const secondDerivRaw = nerdamer.diff(firstDeriv, variable).toString();
      const secondDeriv = nerdamer(secondDerivRaw).simplify().toString();

      // 3. Target N-th Derivative
      let currentDeriv = expression;
      for (let i = 0; i < order; i++) {
        currentDeriv = nerdamer.diff(currentDeriv, variable).toString();
      }
      const targetDerivSimplified = nerdamer(currentDeriv).simplify().toString();

      // 4. Numerical Evaluations at x = evalX
      let originalValAtX: number | null = null;
      let firstDerivValAtX: number | null = null;
      let secondDerivValAtX: number | null = null;
      let targetDerivValAtX: number | null = null;

      const xNum = parseFloat(evalX);
      if (!isNaN(xNum)) {
        try {
          originalValAtX = math.evaluate(expression, { [variable]: xNum });
        } catch {}
        try {
          firstDerivValAtX = math.evaluate(firstDeriv, { [variable]: xNum });
        } catch {}
        try {
          secondDerivValAtX = math.evaluate(secondDeriv, { [variable]: xNum });
        } catch {}
        try {
          targetDerivValAtX = math.evaluate(targetDerivSimplified, { [variable]: xNum });
        } catch {}
      }

      // 5. Tangent Line Equation: y = m*x + c
      let tangentEquation: string | null = null;
      let normalEquation: string | null = null;
      let tangentSlope: number | null = null;
      let tangentIntercept: number | null = null;

      if (originalValAtX !== null && firstDerivValAtX !== null && !isNaN(originalValAtX) && !isNaN(firstDerivValAtX)) {
        tangentSlope = firstDerivValAtX;
        tangentIntercept = originalValAtX - tangentSlope * xNum;
        const slopeStr = tangentSlope === 1 ? '' : tangentSlope === -1 ? '-' : tangentSlope.toFixed(4);
        const interceptSign = tangentIntercept >= 0 ? '+' : '-';
        const interceptStr = Math.abs(tangentIntercept).toFixed(4);
        tangentEquation = `y = ${slopeStr}${variable} ${interceptSign} ${interceptStr}`;

        // Normal Line (perpendicular)
        if (Math.abs(tangentSlope) > 1e-7) {
          const normalSlope = -1 / tangentSlope;
          const normalIntercept = originalValAtX - normalSlope * xNum;
          const normSlopeStr = normalSlope.toFixed(4);
          const normIntSign = normalIntercept >= 0 ? '+' : '-';
          const normIntStr = Math.abs(normalIntercept).toFixed(4);
          normalEquation = `y = ${normSlopeStr}${variable} ${normIntSign} ${normIntStr}`;
        } else {
          normalEquation = `${variable} = ${xNum.toFixed(4)} (Vertical Normal Line)`;
        }
      }

      // 6. Concavity Classification
      let concavityText = 'Not evaluated';
      let concavityType: 'up' | 'down' | 'inflection' | 'neutral' = 'neutral';
      if (secondDerivValAtX !== null && !isNaN(secondDerivValAtX)) {
        if (secondDerivValAtX > 0.00001) {
          concavityText = 'Concave Up (∪) — Slope is increasing; potential local minimum.';
          concavityType = 'up';
        } else if (secondDerivValAtX < -0.00001) {
          concavityText = 'Concave Down (∩) — Slope is decreasing; potential local maximum.';
          concavityType = 'down';
        } else {
          concavityText = 'f\'\'(x) = 0 — Potential inflection point (check sign change).';
          concavityType = 'inflection';
        }
      }

      // 7. Structured Step-by-Step Derivation Breakdown
      const steps: StepDetail[] = [];

      // Step 1: Identify Function and Goal
      const orderNames = ['First', 'Second', 'Third', 'Fourth', 'Higher-Order'];
      const orderName = orderNames[Math.min(order - 1, 4)];
      steps.push({
        stepNumber: 1,
        title: `Set up the ${orderName} Derivative problem`,
        rule: 'Leibniz & Lagrange Notation',
        latexFormula: order === 1 
          ? `\\frac{d}{d${variable}}\\left[ ${expression} \\right]` 
          : `\\frac{d^{${order}}}{d${variable}^{${order}}}\\left[ ${expression} \\right]`,
        explanation: `We are tasked with computing the ${orderName.toLowerCase()} derivative of the function f(${variable}) = ${expression} with respect to the variable ${variable}.`,
        intermediateExpr: expression
      });

      // Step 2: Analyze terms decomposition
      const cleanExpr = expression.trim();
      const hasProduct = cleanExpr.includes('*') && !cleanExpr.match(/^[0-9.]+\s*\*/);
      const hasQuotient = cleanExpr.includes('/') && !cleanExpr.match(/\/\s*[0-9.]+/);
      const hasTrig = /sin|cos|tan|sec|csc|cot/.test(cleanExpr);
      const hasExp = /e\^|exp|ln|log/.test(cleanExpr);

      if (hasQuotient) {
        steps.push({
          stepNumber: 2,
          title: 'Apply the Quotient Rule',
          rule: 'Quotient Rule: (u/v)\' = (u\'v - uv\') / v²',
          latexFormula: `\\frac{d}{d${variable}}\\left[\\frac{u}{v}\\right] = \\frac{u'v - uv'}{v^2}`,
          explanation: `The expression is structured as a rational fraction. Identify the numerator u(${variable}) and denominator v(${variable}), differentiate each separately, and substitute into the quotient formula.`,
          intermediateExpr: firstDerivRaw
        });
      } else if (hasProduct) {
        steps.push({
          stepNumber: 2,
          title: 'Apply the Product Rule',
          rule: 'Product Rule: (u · v)\' = u\'v + uv\'',
          latexFormula: `\\frac{d}{d${variable}}\\left[ u \\cdot v \\right] = u' \\cdot v + u \\cdot v'`,
          explanation: `The expression consists of multiplied variable terms. Differentiate the first factor and multiply by the second, then add the first factor multiplied by the derivative of the second.`,
          intermediateExpr: firstDerivRaw
        });
      } else if (hasTrig || hasExp) {
        steps.push({
          stepNumber: 2,
          title: 'Apply Transcendental & Chain Rules',
          rule: 'Chain & Transcendental Rules',
          latexFormula: `\\frac{d}{d${variable}}[f(g(${variable}))] = f'(g(${variable})) \\cdot g'(${variable})`,
          explanation: `Apply elementary transcendental rules (d/dx[sin x] = cos x, d/dx[eˣ] = eˣ, d/dx[ln x] = 1/x) combined with the Chain Rule for inner composite terms.`,
          intermediateExpr: firstDerivRaw
        });
      } else {
        steps.push({
          stepNumber: 2,
          title: 'Apply the Sum Rule and Power Rule',
          rule: 'Sum Rule & Power Rule: d/dx[xⁿ] = n·xⁿ⁻¹',
          latexFormula: `\\frac{d}{d${variable}}[a \\cdot ${variable}^n] = a \\cdot n \\cdot ${variable}^{n-1}`,
          explanation: `Differentiate each polynomial term independently by multiplying each coefficient by the power and reducing the exponent by 1. Constants differentiate to 0.`,
          intermediateExpr: firstDerivRaw
        });
      }

      // Step 3: Higher order iterations if order > 1
      if (order > 1) {
        for (let i = 2; i <= order; i++) {
          const ordLabel = orderNames[Math.min(i - 1, 4)];
          let ithDeriv = expression;
          for (let k = 0; k < i; k++) {
            ithDeriv = nerdamer.diff(ithDeriv, variable).toString();
          }
          steps.push({
            stepNumber: steps.length + 1,
            title: `Compute ${ordLabel} Derivative (Order ${i})`,
            rule: `Successive Differentiation (Order ${i})`,
            latexFormula: `\\frac{d^{${i}}}{d${variable}^{${i}}}[f(${variable})] = \\frac{d}{d${variable}}\\left[ f^{(${i-1})}(${variable}) \\right]`,
            explanation: `Differentiate the previous order result with respect to ${variable} once more.`,
            intermediateExpr: nerdamer(ithDeriv).simplify().toString()
          });
        }
      }

      // Final Step: Simplification
      steps.push({
        stepNumber: steps.length + 1,
        title: 'Combine Terms and Simplify Result',
        rule: 'Algebraic Simplification',
        latexFormula: `f^{(${order})}(${variable}) = ${targetDerivSimplified}`,
        explanation: `Collect like terms, factor out common algebraic multipliers, and reduce common factors.`,
        intermediateExpr: targetDerivSimplified
      });

      return {
        expression,
        variable,
        order,
        firstDeriv,
        secondDeriv,
        targetDeriv: targetDerivSimplified,
        originalValAtX,
        firstDerivValAtX,
        secondDerivValAtX,
        targetDerivValAtX,
        tangentSlope,
        tangentIntercept,
        tangentEquation,
        normalEquation,
        concavityText,
        concavityType,
        steps
      };
    } catch (e: any) {
      setError(e.message || 'Invalid mathematical expression. Check syntax (e.g. use * for multiplication like 3*x).');
      return null;
    }
  }, [expression, variable, order, evalX]);

  // Graphing & Plot Mapping
  const svgWidth = 460;
  const svgHeight = 280;
  const padding = 35;
  const originX = svgWidth / 2;
  const originY = svgHeight / 2;
  const scale = 24; // 24 pixels per coordinate unit

  const mapX = (x: number) => originX + x * scale;
  const mapY = (y: number) => originY - y * scale;

  const graphData = useMemo(() => {
    if (error || !calculation) return null;

    const originalPoints: string[] = [];
    const derivativePoints: string[] = [];
    const tangentPoints: string[] = [];

    // Step across domain -8 to +8
    for (let xVal = -8; xVal <= 8; xVal += 0.08) {
      const px = mapX(xVal);
      if (px < padding || px > svgWidth - padding) continue;

      // 1. Original f(x)
      try {
        const yVal = math.evaluate(expression, { [variable]: xVal });
        if (typeof yVal === 'number' && !isNaN(yVal) && isFinite(yVal)) {
          const py = mapY(yVal);
          if (py >= padding && py <= svgHeight - padding) {
            originalPoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
          }
        }
      } catch {}

      // 2. Derivative f'(x)
      try {
        const yVal = math.evaluate(calculation.targetDeriv, { [variable]: xVal });
        if (typeof yVal === 'number' && !isNaN(yVal) && isFinite(yVal)) {
          const py = mapY(yVal);
          if (py >= padding && py <= svgHeight - padding) {
            derivativePoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
          }
        }
      } catch {}

      // 3. Tangent Line y = m*x + c
      if (calculation.tangentSlope !== null && calculation.tangentIntercept !== null) {
        const yVal = calculation.tangentSlope * xVal + calculation.tangentIntercept;
        if (!isNaN(yVal) && isFinite(yVal)) {
          const py = mapY(yVal);
          if (py >= padding && py <= svgHeight - padding) {
            tangentPoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
          }
        }
      }
    }

    // Tangency touch point
    let touchPoint: { x: number; y: number } | null = null;
    const xNum = parseFloat(evalX);
    if (!isNaN(xNum) && calculation.originalValAtX !== null && !isNaN(calculation.originalValAtX)) {
      const px = mapX(xNum);
      const py = mapY(calculation.originalValAtX);
      if (px >= padding && px <= svgWidth - padding && py >= padding && py <= svgHeight - padding) {
        touchPoint = { x: px, y: py };
      }
    }

    return {
      originalPath: originalPoints.length > 1 ? `M ${originalPoints.join(' L ')}` : '',
      derivativePath: derivativePoints.length > 1 ? `M ${derivativePoints.join(' L ')}` : '',
      tangentPath: tangentPoints.length > 1 ? `M ${tangentPoints.join(' L ')}` : '',
      touchPoint
    };
  }, [expression, variable, calculation, error, evalX]);

  // Copy Handlers
  const handleCopyText = () => {
    if (!calculation) return;
    navigator.clipboard.writeText(calculation.targetDeriv);
    setCopiedType('text');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyLatex = () => {
    if (!calculation) return;
    const latex = `\\frac{d^{${order}}}{d${variable}^{${order}}}\\left[ ${expression} \\right] = ${calculation.targetDeriv}`;
    navigator.clipboard.writeText(latex);
    setCopiedType('latex');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyAll = () => {
    if (!calculation) return;
    let text = `# Derivative Solution with Steps\n\n`;
    text += `**Function:** f(${variable}) = ${expression}\n`;
    text += `**Order:** ${order} (d^${order}/d${variable}^${order})\n`;
    text += `**Result:** ${calculation.targetDeriv}\n\n`;
    if (calculation.firstDerivValAtX !== null) {
      text += `**Evaluated at ${variable} = ${evalX}:** ${calculation.targetDerivValAtX?.toFixed(6)}\n`;
      text += `**Tangent Line:** ${calculation.tangentEquation}\n`;
      text += `**Normal Line:** ${calculation.normalEquation}\n`;
      text += `**Concavity:** ${calculation.concavityText}\n\n`;
    }
    text += `### Step-by-Step Derivation:\n`;
    calculation.steps.forEach((s) => {
      text += `${s.stepNumber}. **${s.title}** (${s.rule}): ${s.explanation}\n   Formula: ${s.latexFormula}\n   Expression: ${s.intermediateExpr}\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopiedType('all');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleReset = () => {
    setExpression('x^3 - 3*x^2 + 2*x');
    setVariable('x');
    setOrder(1);
    setEvalX('2');
    setError(null);
  };

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto">
      {/* Top Banner / Feature Callout */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/[0.04] via-purple-500/[0.02] to-transparent border border-indigo-500/10 dark:border-indigo-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider">
              Symbolic Calculus Engine
            </span>
            <span className="text-[10px] text-zinc-400 font-bold">Client-Side Sandbox</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Derivative Calculator with Steps & Graphs
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Differentiate single-variable equations symbolically using Power, Product, Quotient, and Chain rules. Computes tangent slopes, tangent lines ($y = mx + b$), normal lines, second derivatives, and concavity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={handleCopyLatex}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:border-indigo-500/40 text-zinc-700 dark:text-zinc-300 transition inline-flex items-center gap-1.5 shadow-sm"
          >
            {copiedType === 'latex' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
            <span>{copiedType === 'latex' ? 'LaTeX Copied!' : 'Copy LaTeX'}</span>
          </button>
          <button
            onClick={handleCopyAll}
            className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/10 text-xs font-bold transition inline-flex items-center gap-1.5"
          >
            {copiedType === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{copiedType === 'all' ? 'Solution Copied!' : 'Copy Full Solution'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls & Results | Right Graph & Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Inputs Card */}
          <div className="saas-card p-6 space-y-5 border border-zinc-200/60 dark:border-zinc-800/80">
            
            {/* Function Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Function Expression f({variable})</span>
                </label>
                <span className="text-[10px] text-zinc-400 font-semibold font-mono">e.g. x^3 - 3*x^2 + 2*x</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g. x^3 - 3*x^2 + 2*x"
                className="w-full px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
              />
            </div>

            {/* Quick-Math Insert Keypad */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                Quick Math Keypad
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'x²', val: 'x^2' },
                  { label: 'x³', val: 'x^3' },
                  { label: 'xⁿ', val: '^' },
                  { label: '√x', val: 'sqrt(x)' },
                  { label: 'sin', val: 'sin(x)' },
                  { label: 'cos', val: 'cos(x)' },
                  { label: 'tan', val: 'tan(x)' },
                  { label: 'ln', val: 'log(x)' },
                  { label: 'eˣ', val: 'e^(x)' },
                  { label: '1/x', val: '1/(x)' },
                  { label: 'u/v', val: '(x)/(x+1)' },
                  { label: 'π', val: 'pi' }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => insertSymbol(item.val)}
                    className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300 transition shadow-xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Variable & Order Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Variable
                </label>
                <input
                  type="text"
                  value={variable}
                  onChange={(e) => setVariable(e.target.value || 'x')}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs font-bold text-center text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Derivative Order
                </label>
                <select
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>1st Derivative (d/d{variable})</option>
                  <option value={2}>2nd Derivative (d²/d{variable}²)</option>
                  <option value={3}>3rd Derivative (d³/d{variable}³)</option>
                  <option value={4}>4th Derivative (d⁴/d{variable}⁴)</option>
                </select>
              </div>
            </div>

            {/* Evaluation Point (Optional) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Evaluate at {variable} = (Slope & Tangent)
                </label>
                <span className="text-[10px] text-zinc-400 font-bold">Optional</span>
              </div>
              <input
                type="number"
                step="any"
                value={evalX}
                onChange={(e) => setEvalX(e.target.value)}
                placeholder="e.g. 2"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Presets Gallery */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-850">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                Calculus Presets Gallery
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Polynomial', expr: 'x^3 - 3*x^2 + 2*x', ord: 1, at: '2' },
                  { name: 'Product Rule', expr: 'x^2 * sin(x)', ord: 1, at: '1' },
                  { name: 'Quotient Rule', expr: '(x^2 + 1)/(x - 1)', ord: 1, at: '2' },
                  { name: 'Chain Rule', expr: 'sqrt(x^2 + 4)', ord: 1, at: '2' },
                  { name: 'Exponential', expr: 'e^(2*x)', ord: 2, at: '0' },
                  { name: 'Trigonometric', expr: 'sin(x)*cos(x)', ord: 1, at: '0.785' },
                  { name: 'Logarithmic', expr: 'x * log(x)', ord: 1, at: '1' }
                ].map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => loadExample(p.expr, 'x', p.ord, p.at)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 text-[10px] font-bold text-zinc-650 dark:text-zinc-350 transition"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSteps(!showSteps)}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>{showSteps ? 'Hide Steps' : 'Show Steps'}</span>
                {showSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Results Summary Box */}
          {calculation && !error && (
            <div className="saas-card p-6 space-y-4 border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-900 dark:bg-zinc-950 text-white shadow-lg">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  Symbolic Derivative Output
                </span>
                <button
                  onClick={handleCopyText}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1"
                >
                  {copiedType === 'text' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'text' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Main Result */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                  d^{order}/d{variable}^{order} [ {expression} ] =
                </span>
                <div className="text-xl md:text-2xl font-black font-mono text-emerald-400 break-all select-all">
                  {calculation.targetDeriv}
                </div>
              </div>

              {/* Evaluated Point & Tangent Specs */}
              {calculation.firstDerivValAtX !== null && (
                <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-850/60 border border-zinc-800">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">
                        Tangent Slope m = f'({evalX})
                      </span>
                      <span className="font-mono text-base font-extrabold text-white">
                        {calculation.firstDerivValAtX.toFixed(6)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-850/60 border border-zinc-800">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase block mb-1">
                        Point of Tangency
                      </span>
                      <span className="font-mono text-xs font-extrabold text-indigo-400 truncate block">
                        ({evalX}, {calculation.originalValAtX?.toFixed(4)})
                      </span>
                    </div>
                  </div>

                  {calculation.tangentEquation && (
                    <div className="p-3 rounded-xl bg-zinc-850/40 border border-zinc-800 space-y-1">
                      <span className="text-[9px] font-mono text-amber-400 uppercase block font-bold">
                        Tangent Line Equation
                      </span>
                      <div className="font-mono text-xs font-bold text-zinc-200 select-all">
                        {calculation.tangentEquation}
                      </div>
                    </div>
                  )}

                  {calculation.normalEquation && (
                    <div className="p-3 rounded-xl bg-zinc-850/40 border border-zinc-800 space-y-1">
                      <span className="text-[9px] font-mono text-purple-400 uppercase block font-bold">
                        Normal Line Equation (Perpendicular)
                      </span>
                      <div className="font-mono text-xs font-bold text-zinc-200 select-all">
                        {calculation.normalEquation}
                      </div>
                    </div>
                  )}

                  {/* Concavity */}
                  <div className="p-3 rounded-xl bg-zinc-850/40 border border-zinc-800 text-[11px] font-semibold text-zinc-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{calculation.concavityText}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (7 Cols): Multi-curve Graph & Steps */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Interactive Graph Section */}
          <div className="saas-card p-6 space-y-4 border border-zinc-200/60 dark:border-zinc-800/80">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-500" />
                <span>Function & Derivative Graph Overlay</span>
              </h3>
              
              {/* Curve Toggles */}
              <div className="flex flex-wrap gap-3 text-[10px] font-bold">
                <label className="flex items-center gap-1.5 cursor-pointer text-indigo-600 dark:text-indigo-400">
                  <input
                    type="checkbox"
                    checked={showOriginalCurve}
                    onChange={(e) => setShowOriginalCurve(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span>f(x) Curve</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-purple-600 dark:text-purple-400">
                  <input
                    type="checkbox"
                    checked={showDerivCurve}
                    onChange={(e) => setShowDerivCurve(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-0"
                  />
                  <span>f'(x) Derivative</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-amber-600 dark:text-amber-400">
                  <input
                    type="checkbox"
                    checked={showTangentCurve}
                    onChange={(e) => setShowTangentCurve(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-0"
                  />
                  <span>Tangent Line</span>
                </label>
              </div>
            </div>

            {/* SVG Graph Plane */}
            <div className="w-full flex items-center justify-center">
              <svg
                width="100%"
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="border border-zinc-200/60 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/60"
              >
                {/* Coordinate Grid */}
                {Array.from({ length: 19 }).map((_, i) => {
                  const lineX = mapX(-9 + i);
                  return (
                    <line
                      key={`grid-x-${i}`}
                      x1={lineX}
                      y1={0}
                      x2={lineX}
                      y2={svgHeight}
                      stroke="currentColor"
                      className="text-zinc-200/80 dark:text-zinc-850/60"
                      strokeWidth={-9 + i === 0 ? 1.5 : 0.5}
                    />
                  );
                })}
                {Array.from({ length: 13 }).map((_, i) => {
                  const lineY = mapY(-6 + i);
                  return (
                    <line
                      key={`grid-y-${i}`}
                      x1={0}
                      y1={lineY}
                      x2={svgWidth}
                      y2={lineY}
                      stroke="currentColor"
                      className="text-zinc-200/80 dark:text-zinc-850/60"
                      strokeWidth={-6 + i === 0 ? 1.5 : 0.5}
                    />
                  );
                })}

                {/* Axes */}
                <line x1={0} y1={originY} x2={svgWidth} y2={originY} stroke="#71717a" strokeWidth="1.5" />
                <line x1={originX} y1={0} x2={originX} y2={svgHeight} stroke="#71717a" strokeWidth="1.5" />

                {/* Axis Labels */}
                <text x={svgWidth - 20} y={originY - 8} fill="#71717a" fontSize="10" fontFamily="monospace" fontWeight="bold">x</text>
                <text x={originX + 8} y={18} fill="#71717a" fontSize="10" fontFamily="monospace" fontWeight="bold">y</text>

                {/* Plotted Curves */}
                {graphData && (
                  <>
                    {/* Original Function Curve */}
                    {showOriginalCurve && graphData.originalPath && (
                      <path
                        d={graphData.originalPath}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Derivative Curve */}
                    {showDerivCurve && graphData.derivativePath && (
                      <path
                        d={graphData.derivativePath}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    )}

                    {/* Tangent Line */}
                    {showTangentCurve && graphData.tangentPath && (
                      <path
                        d={graphData.tangentPath}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* Point of Tangency Dot */}
                    {graphData.touchPoint && showTangentCurve && (
                      <g>
                        <circle
                          cx={graphData.touchPoint.x}
                          cy={graphData.touchPoint.y}
                          r="6"
                          fill="#f59e0b"
                          className="animate-pulse"
                        />
                        <circle
                          cx={graphData.touchPoint.x}
                          cy={graphData.touchPoint.y}
                          r="3"
                          fill="#ffffff"
                        />
                      </g>
                    )}
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* Step-by-Step Derivation Breakdown Accordion */}
          {showSteps && calculation && calculation.steps && (
            <div className="saas-card p-6 space-y-4 border border-zinc-200/60 dark:border-zinc-800/80">
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <Layers className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Step-by-Step Analytical Derivation
                </h3>
              </div>

              <div className="space-y-3.5">
                {calculation.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 space-y-2"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 text-[10px] font-black flex items-center justify-center shrink-0">
                          {step.stepNumber}
                        </span>
                        <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white">
                          {step.title}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 text-[9px] font-black uppercase tracking-wider">
                        {step.rule}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                      {step.explanation}
                    </p>

                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-850/80 font-mono text-[11px] text-indigo-650 dark:text-indigo-400 font-bold">
                      {step.latexFormula}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Differentiation Rules Cheat Sheet */}
          <div className="saas-card p-6 space-y-3 border border-zinc-200/60 dark:border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Calculus Rules Reference</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono text-zinc-650 dark:text-zinc-350">
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850">
                <span className="font-bold text-zinc-900 dark:text-white block text-[10px] uppercase font-sans">Power Rule</span>
                d/dx [xⁿ] = n · xⁿ⁻¹
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850">
                <span className="font-bold text-zinc-900 dark:text-white block text-[10px] uppercase font-sans">Product Rule</span>
                d/dx [u · v] = u'v + uv'
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850">
                <span className="font-bold text-zinc-900 dark:text-white block text-[10px] uppercase font-sans">Quotient Rule</span>
                d/dx [u / v] = (u'v - uv') / v²
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850">
                <span className="font-bold text-zinc-900 dark:text-white block text-[10px] uppercase font-sans">Chain Rule</span>
                d/dx [f(g(x))] = f'(g(x)) · g'(x)
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
