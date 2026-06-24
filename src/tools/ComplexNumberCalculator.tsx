import { useState, useMemo } from 'react';
import { ArrowLeft, RotateCcw, Copy, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as math from 'mathjs';
import SEO from '../components/SEO';

export default function ComplexNumberCalculator() {
  // Input mode: 'binary' (Z1 op Z2) or 'unary' (properties of Z1)
  const [calcMode, setCalcMode] = useState<'binary' | 'unary'>('binary');
  
  // Z1 Inputs
  const [z1Real, setZ1Real] = useState<string>('3');
  const [z1Imag, setZ1Imag] = useState<string>('4');
  
  // Z2 Inputs
  const [z2Real, setZ2Real] = useState<string>('1');
  const [z2Imag, setZ2Imag] = useState<string>('-2');

  const [operation, setOperation] = useState<'+' | '-' | '*' | '/' | '^'>('+');
  const [unaryOp, setUnaryOp] = useState<'abs' | 'arg' | 'conj' | 'sqrt' | 'log' | 'sin' | 'cos'>('abs');
  
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setCalcMode('binary');
    setZ1Real('3');
    setZ1Imag('4');
    setZ2Real('1');
    setZ2Imag('-2');
    setOperation('+');
    setUnaryOp('abs');
    setError(null);
  };

  // Perform calculations using math.js complex math
  const calculations = useMemo(() => {
    setError(null);
    try {
      const r1 = parseFloat(z1Real);
      const i1 = parseFloat(z1Imag);
      if (isNaN(r1) || isNaN(i1)) {
        throw new Error('Please enter valid numeric coefficients for Z1.');
      }

      const z1 = math.complex(r1, i1);

      if (calcMode === 'unary') {
        let unaryResult: any = null;
        let resultString = '';
        let isComplex = true;

        switch (unaryOp) {
          case 'abs':
            unaryResult = math.abs(z1);
            resultString = `|Z1| = ${unaryResult.toFixed(4)}`;
            isComplex = false;
            break;
          case 'arg':
            unaryResult = math.arg(z1); // In radians
            const deg = (unaryResult * 180) / Math.PI;
            resultString = `arg(Z1) = ${unaryResult.toFixed(4)} rad (${deg.toFixed(1)}°)`;
            isComplex = false;
            break;
          case 'conj':
            unaryResult = math.conj(z1);
            resultString = `Z1* = ${unaryResult.toString()}`;
            break;
          case 'sqrt':
            unaryResult = math.sqrt(z1);
            resultString = `√Z1 = ${unaryResult.toString()}`;
            break;
          case 'log':
            unaryResult = math.log(z1);
            resultString = `ln(Z1) = ${unaryResult.toString()}`;
            break;
          case 'sin':
            unaryResult = math.sin(z1);
            resultString = `sin(Z1) = ${unaryResult.toString()}`;
            break;
          case 'cos':
            unaryResult = math.cos(z1);
            resultString = `cos(Z1) = ${unaryResult.toString()}`;
            break;
          default:
            break;
        }

        return {
          z1,
          z2: null,
          result: isComplex ? unaryResult : null,
          resultScalar: !isComplex ? resultString : null,
          polarZ1: { r: z1.toPolar().r, phi: z1.toPolar().phi }
        };
      } else {
        const r2 = parseFloat(z2Real);
        const i2 = parseFloat(z2Imag);
        if (isNaN(r2) || isNaN(i2)) {
          throw new Error('Please enter valid numeric coefficients for Z2.');
        }

        const z2 = math.complex(r2, i2);
        let result: any = null;

        switch (operation) {
          case '+':
            result = math.add(z1, z2);
            break;
          case '-':
            result = math.subtract(z1, z2);
            break;
          case '*':
            result = math.multiply(z1, z2);
            break;
          case '/':
            if (r2 === 0 && i2 === 0) throw new Error('Division by zero is undefined.');
            result = math.divide(z1, z2);
            break;
          case '^':
            result = math.pow(z1, z2);
            break;
          default:
            break;
        }

        return {
          z1,
          z2,
          result,
          resultScalar: null,
          polarZ1: { r: z1.toPolar().r, phi: z1.toPolar().phi },
          polarZ2: { r: z2.toPolar().r, phi: z2.toPolar().phi },
          polarResult: result && typeof result !== 'number' ? { r: (result as any).toPolar().r, phi: (result as any).toPolar().phi } : null
        };
      }
    } catch (e: any) {
      setError(e.message || 'Arithmetic error.');
      return null;
    }
  }, [calcMode, z1Real, z1Imag, z2Real, z2Imag, operation, unaryOp]);

  const handleCopy = () => {
    if (!calculations) return;
    const textToCopy = calculations.resultScalar
      ? calculations.resultScalar
      : calculations.result
      ? calculations.result.toString()
      : '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SVGs Argand graph scaling
  const svgWidth = 350;
  const svgHeight = 250;
  const originX = svgWidth / 2;
  const originY = svgHeight / 2;

  const graphScale = useMemo(() => {
    if (!calculations) return 20;
    const vals = [
      Math.abs(calculations.z1.re),
      Math.abs(calculations.z1.im),
    ];
    if (calculations.z2) {
      vals.push(Math.abs(calculations.z2.re), Math.abs(calculations.z2.im));
    }
    if (calculations.result && typeof calculations.result !== 'number') {
      vals.push(Math.abs((calculations.result as any).re), Math.abs((calculations.result as any).im));
    }

    const maxCoord = Math.max(...vals, 1);
    // scale to fit within padding (let's say we have 100 pixels of clearance)
    return Math.min(80, (svgHeight / 2 - 30) / maxCoord);
  }, [calculations]);

  const mapX = (xVal: number) => originX + xVal * graphScale;
  const mapY = (yVal: number) => originY - yVal * graphScale;

  return (
    <>
      <SEO
        title="Complex Number Calculator | Argand Vector Grapher"
        description="Free online complex numbers solver. Perform addition, subtraction, division, powers, conjugate, argument phase angle, and plot vector coordinates on Argand diagram."
        keywords={['complex numbers', 'argand diagram', 'cartesian polar calculator', 'imaginary numbers solver', 'mathjs complex']}
      />

      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 mb-6">
        <Link
          to="/math-studio"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Math Studio</span>
        </Link>
        <div className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold flex items-center gap-1.5">
          <Link to="/" className="hover:text-indigo-500 transition-colors">Home</Link>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <Link to="/math-studio" className="hover:text-indigo-500 transition-colors">Math Studio</Link>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">Complex Number Calculator</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Complex Number Calculator
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
              Perform algebraic operations on complex numbers, convert to polar phase, and map coordinates on Argand diagram vectors.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Inputs Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              {/* Operations Scope */}
              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  Calculation Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCalcMode('binary')}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      calcMode === 'binary'
                        ? 'border-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400'
                        : 'border-zinc-250 dark:border-zinc-850 hover:bg-zinc-50 text-zinc-650 dark:text-zinc-450'
                    }`}
                  >
                    Binary (Z1 & Z2)
                  </button>
                  <button
                    onClick={() => setCalcMode('unary')}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      calcMode === 'unary'
                        ? 'border-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400'
                        : 'border-zinc-250 dark:border-zinc-850 hover:bg-zinc-50 text-zinc-650 dark:text-zinc-450'
                    }`}
                  >
                    Unary (Properties of Z1)
                  </button>
                </div>
              </div>

              {/* Complex Z1 */}
              <div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-2">
                  Complex Number Z1 (a + bi)
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-450 uppercase mb-1">Real Part (a)</label>
                    <input
                      type="number"
                      step="any"
                      value={z1Real}
                      onChange={(e) => setZ1Real(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-455 uppercase mb-1">Imaginary Part (b)</label>
                    <input
                      type="number"
                      step="any"
                      value={z1Imag}
                      onChange={(e) => setZ1Imag(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              </div>

              {/* Operations or properties selection */}
              {calcMode === 'binary' ? (
                <>
                  {/* Operation select */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                      Arithmetic Operation
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {([
                        { symbol: '+', label: 'Add' },
                        { symbol: '-', label: 'Sub' },
                        { symbol: '*', label: 'Mul' },
                        { symbol: '/', label: 'Div' },
                        { symbol: '^', label: 'Pow' }
                      ] as const).map((op) => (
                        <button
                          key={op.symbol}
                          onClick={() => setOperation(op.symbol)}
                          className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                            operation === op.symbol
                              ? 'border-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400'
                              : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-450 hover:bg-zinc-50'
                          }`}
                          title={op.label}
                        >
                          {op.symbol}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Complex Z2 */}
                  <div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-2">
                      Complex Number Z2 (c + di)
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-450 uppercase mb-1">Real Part (c)</label>
                        <input
                          type="number"
                          step="any"
                          value={z2Real}
                          onChange={(e) => setZ2Real(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-455 uppercase mb-1">Imaginary Part (d)</label>
                        <input
                          type="number"
                          step="any"
                          value={z2Imag}
                          onChange={(e) => setZ2Imag(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-sm text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                    Property solver
                  </label>
                  <select
                    value={unaryOp}
                    onChange={(e) => setUnaryOp(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="abs">Modulus |Z1|</option>
                    <option value="arg">Argument/Phase arg(Z1)</option>
                    <option value="conj">Conjugate Z1*</option>
                    <option value="sqrt">Square Root √Z1</option>
                    <option value="log">Natural Log ln(Z1)</option>
                    <option value="sin">Sine sin(Z1)</option>
                    <option value="cos">Cosine cos(Z1)</option>
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-xs font-bold text-zinc-660 dark:text-zinc-400 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Solver</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-455 text-xs font-semibold">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Visual Argand Plot & polar representation details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Argand Plane Diagram Overlay</span>
                <span className="flex gap-4 text-[9px] font-bold">
                  <span className="flex items-center gap-1 text-indigo-500">
                    <span className="w-2.5 h-0.5 bg-indigo-500 inline-block" /> Z1
                  </span>
                  {calcMode === 'binary' && (
                    <span className="flex items-center gap-1 text-purple-400">
                      <span className="w-2.5 h-0.5 bg-purple-400 inline-block" /> Z2
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-emerald-500">
                    <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" /> Result
                  </span>
                </span>
              </h4>
              <div className="flex items-center justify-center">
                <svg
                  width="100%"
                  height={svgHeight}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="border border-zinc-100 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
                >
                  {/* Grid Lines */}
                  <line x1={0} y1={originY} x2={svgWidth} y2={originY} stroke="currentColor" className="text-zinc-300 dark:text-zinc-800" strokeWidth={1.5} />
                  <line x1={originX} y1={0} x2={originX} y2={svgHeight} stroke="currentColor" className="text-zinc-300 dark:text-zinc-800" strokeWidth={1.5} />

                  {/* Axis labels */}
                  <text x={svgWidth - 25} y={originY - 5} className="text-[9px] font-black fill-zinc-400 font-mono">Real (Re)</text>
                  <text x={originX + 5} y={15} className="text-[9px] font-black fill-zinc-400 font-mono">Imag (Im)</text>

                  {calculations && (
                    <>
                      {/* Z1 Vector */}
                      <line
                        x1={originX}
                        y1={originY}
                        x2={mapX(calculations.z1.re)}
                        y2={mapY(calculations.z1.im)}
                        stroke="#6366f1"
                        strokeWidth={2}
                        markerEnd="url(#arrow-indigo)"
                      />
                      <circle cx={mapX(calculations.z1.re)} cy={mapY(calculations.z1.im)} r={3} className="fill-indigo-650" />
                      <text x={mapX(calculations.z1.re) + 5} y={mapY(calculations.z1.im) - 5} className="text-[9px] font-mono font-bold fill-indigo-600 dark:fill-indigo-400">Z1</text>

                      {/* Z2 Vector */}
                      {calcMode === 'binary' && calculations.z2 && (
                        <>
                          <line
                            x1={originX}
                            y1={originY}
                            x2={mapX(calculations.z2.re)}
                            y2={mapY(calculations.z2.im)}
                            stroke="#c084fc"
                            strokeWidth={2}
                            markerEnd="url(#arrow-purple)"
                          />
                          <circle cx={mapX(calculations.z2.re)} cy={mapY(calculations.z2.im)} r={3} className="fill-purple-500" />
                          <text x={mapX(calculations.z2.re) + 5} y={mapY(calculations.z2.im) - 5} className="text-[9px] font-mono font-bold fill-purple-600 dark:fill-purple-400">Z2</text>
                        </>
                      )}

                      {/* Result Vector */}
                      {calculations.result && typeof calculations.result !== 'number' && (
                        <>
                          <line
                            x1={originX}
                            y1={originY}
                            x2={mapX((calculations.result as any).re)}
                            y2={mapY((calculations.result as any).im)}
                            stroke="#10b981"
                            strokeWidth={2.5}
                            markerEnd="url(#arrow-emerald)"
                          />
                          <circle cx={mapX((calculations.result as any).re)} cy={mapY((calculations.result as any).im)} r={3} className="fill-emerald-600" />
                          <text x={mapX((calculations.result as any).re) + 5} y={mapY((calculations.result as any).im) - 5} className="text-[9px] font-mono font-bold fill-emerald-650 dark:fill-emerald-400">Result</text>
                        </>
                      )}
                    </>
                  )}

                  {/* Marker definitions for arrows */}
                  <defs>
                    <marker id="arrow-indigo" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                    </marker>
                    <marker id="arrow-purple" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#c084fc" />
                    </marker>
                    <marker id="arrow-emerald" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Results Panel */}
            {calculations && !error && (
              <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-850 space-y-4 font-mono text-sm">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Complex Number Output
                  </h4>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Result'}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Rectangular / Scalar */}
                  <div>
                    <span className="text-[10px] text-zinc-400 block uppercase tracking-wider mb-1">
                      Cartesian / Rectangular Format (a + bi)
                    </span>
                    <span className="text-base font-black text-emerald-400">
                      {calculations.resultScalar ? calculations.resultScalar : (calculations.result ? calculations.result.toString() : '')}
                    </span>
                  </div>

                  {/* Polar coordinate representation */}
                  <div className="pt-3 border-t border-zinc-850 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase tracking-wider mb-1">
                        Z1 Polar Coordinates
                      </span>
                      <span className="text-xs text-zinc-350 block">
                        Modulus (r): <strong className="text-white">{calculations.polarZ1.r.toFixed(4)}</strong>
                      </span>
                      <span className="text-xs text-zinc-350 block">
                        Phase (θ): <strong className="text-white">{(calculations.polarZ1.phi * 180 / Math.PI).toFixed(1)}°</strong>
                      </span>
                    </div>

                    {calcMode === 'binary' && calculations.polarResult && (
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase tracking-wider mb-1">
                          Result Polar Coordinates
                        </span>
                        <span className="text-xs text-zinc-350 block">
                          Modulus (r): <strong className="text-emerald-400">{calculations.polarResult.r.toFixed(4)}</strong>
                        </span>
                        <span className="text-xs text-zinc-350 block">
                          Phase (θ): <strong className="text-emerald-400">{(calculations.polarResult.phi * 180 / Math.PI).toFixed(1)}°</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Theoretical complex numbers reference */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                Complex Number Math Guide
              </h4>
              <div className="text-xs text-zinc-650 dark:text-zinc-350 space-y-3 leading-relaxed">
                <p>
                  A complex number is an element of a number system that extends the real numbers with a specific imaginary element i, satisfying i² = -1.
                </p>
                <ul className="list-disc pl-4 space-y-1 font-mono text-[10px] text-zinc-550 dark:text-zinc-400">
                  <li>Cartesian: Z = a + bi</li>
                  <li>Polar representation: Z = r(cos θ + i sin θ) = r e^(iθ)</li>
                  <li>Euler's formula: e^(iθ) = cos θ + i sin θ</li>
                  <li>Conjugate: Z* = a - bi (reflected across the real horizontal axis)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
