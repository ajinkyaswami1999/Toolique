/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Compass,
  Info,
  Sparkles
} from 'lucide-react';
import * as math from 'mathjs';

export type CalculationMode = 'binary' | 'unary' | 'roots' | 'impedance';
export type CoordinateFormat = 'cartesian' | 'polar_deg' | 'polar_rad';

export interface RootPoint {
  k: number;
  re: number;
  im: number;
  r: number;
  phiDeg: number;
  phiRad: number;
  formatted: string;
}

export type CalculationResult =
  | {
      type: 'roots';
      z1: any;
      roots: RootPoint[];
      rootDegree: number;
      rootRadius: number;
    }
  | {
      type: 'unary';
      z1: any;
      resComplex: any;
      scalarResult: string | null;
      stepMath: string;
      polarZ1: any;
    }
  | {
      type: 'impedance';
      R: number;
      L: number;
      C: number;
      f: number;
      omega: number;
      X_L: number;
      X_C: number;
      X_net: number;
      totalZ: any;
      zPolar: any;
      phaseDeg: number;
      powerFactor: number;
      pfNature: string;
    }
  | {
      type: 'binary';
      z1: any;
      z2: any;
      result: any;
      stepMath: string;
      polarZ1: any;
      polarZ2: any;
      polarResult: any;
    };

export default function ComplexNumberCalculator() {
  const [calcMode, setCalcMode] = useState<CalculationMode>('binary');
  const [coordFormat, setCoordFormat] = useState<CoordinateFormat>('cartesian');

  // Z1 Inputs (Cartesian)
  const [z1Real, setZ1Real] = useState<string>('3');
  const [z1Imag, setZ1Imag] = useState<string>('4');

  // Z1 Inputs (Polar)
  const [z1Mag, setZ1Mag] = useState<string>('5');
  const [z1Angle, setZ1Angle] = useState<string>('53.13'); // degrees

  // Z2 Inputs (Cartesian)
  const [z2Real, setZ2Real] = useState<string>('1');
  const [z2Imag, setZ2Imag] = useState<string>('-2');

  // Z2 Inputs (Polar)
  const [z2Mag, setZ2Mag] = useState<string>('2.236');
  const [z2Angle, setZ2Angle] = useState<string>('-63.43');

  // Binary operation
  const [operation, setOperation] = useState<'+' | '-' | '*' | '/' | '^' | 'parallel'>('+');

  // Unary operation
  const [unaryOp, setUnaryOp] = useState<'abs' | 'arg' | 'conj' | 'inv' | 'sqrt' | 'log' | 'exp' | 'sin' | 'cos' | 'tan' | 'sinh' | 'cosh'>('abs');

  // Roots of Unity / De Moivre root count n
  const [rootDegreeN, setRootDegreeN] = useState<number>(3);

  // AC Impedance (RLC) Inputs
  const [resistorR, setResistorR] = useState<string>('50'); // Ohms
  const [inductorL, setInductorL] = useState<string>('0.1'); // Henry
  const [capacitorC, setCapacitorC] = useState<string>('0.000047'); // Farad (47 uF)
  const [acFrequency, setAcFrequency] = useState<string>('50'); // Hz (Grid frequency)
  const [circuitType, setCircuitType] = useState<'series' | 'parallel'>('series');

  // Copy Feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Preset loader
  const loadPreset = (presetKey: string) => {
    setError(null);
    switch (presetKey) {
      case '3_4i':
        setCoordFormat('cartesian');
        setZ1Real('3');
        setZ1Imag('4');
        setZ2Real('1');
        setZ2Imag('-2');
        setOperation('+');
        break;
      case 'roots_unity_4':
        setCalcMode('roots');
        setCoordFormat('cartesian');
        setZ1Real('1');
        setZ1Imag('0');
        setRootDegreeN(4);
        break;
      case 'roots_unity_6':
        setCalcMode('roots');
        setCoordFormat('cartesian');
        setZ1Real('1');
        setZ1Imag('0');
        setRootDegreeN(6);
        break;
      case 'euler_identity':
        setCalcMode('unary');
        setUnaryOp('exp');
        setCoordFormat('cartesian');
        setZ1Real('0');
        setZ1Imag('3.14159265'); // i * pi
        break;
      case 'rlc_50hz':
        setCalcMode('impedance');
        setResistorR('50');
        setInductorL('0.15');
        setCapacitorC('0.000033');
        setAcFrequency('50');
        setCircuitType('series');
        break;
    }
  };

  const handleReset = () => {
    setCalcMode('binary');
    setCoordFormat('cartesian');
    setZ1Real('3');
    setZ1Imag('4');
    setZ1Mag('5');
    setZ1Angle('53.13');
    setZ2Real('1');
    setZ2Imag('-2');
    setZ2Mag('2.236');
    setZ2Angle('-63.43');
    setOperation('+');
    setUnaryOp('abs');
    setRootDegreeN(3);
    setError(null);
  };

  // Helper to format complex numbers
  const formatComplex = (re: number, im: number, precision: number = 4): string => {
    const rStr = Math.abs(re) < 1e-10 ? '0' : Number(re.toFixed(precision)).toString();
    const absIm = Math.abs(im);
    const iStr = Math.abs(im) < 1e-10 ? '' : absIm === 1 ? 'i' : `${Number(absIm.toFixed(precision))}i`;

    if (iStr === '') return rStr;
    if (rStr === '0') return im < 0 ? `-${iStr}` : iStr;
    return im < 0 ? `${rStr} - ${iStr}` : `${rStr} + ${iStr}`;
  };

  // Parse Complex Z1 and Z2 based on coordFormat
  const parsedInputs = useMemo(() => {
    setError(null);
    try {
      let z1: any;
      let z2: any;

      if (coordFormat === 'cartesian') {
        const r1 = parseFloat(z1Real);
        const i1 = parseFloat(z1Imag);
        if (isNaN(r1) || isNaN(i1)) throw new Error('Please enter valid numeric values for Z1 (Real and Imaginary).');
        z1 = math.complex(r1, i1);

        const r2 = parseFloat(z2Real);
        const i2 = parseFloat(z2Imag);
        if (!isNaN(r2) && !isNaN(i2)) {
          z2 = math.complex(r2, i2);
        }
      } else {
        const m1 = parseFloat(z1Mag);
        const a1 = parseFloat(z1Angle);
        if (isNaN(m1) || isNaN(a1)) throw new Error('Please enter valid numeric values for Z1 (Magnitude and Angle).');
        const rad1 = coordFormat === 'polar_deg' ? (a1 * Math.PI) / 180 : a1;
        z1 = math.complex({ r: m1, phi: rad1 });

        const m2 = parseFloat(z2Mag);
        const a2 = parseFloat(z2Angle);
        if (!isNaN(m2) && !isNaN(a2)) {
          const rad2 = coordFormat === 'polar_deg' ? (a2 * Math.PI) / 180 : a2;
          z2 = math.complex({ r: m2, phi: rad2 });
        }
      }

      return { z1, z2 };
    } catch (e: any) {
      setError(e.message || 'Invalid complex number coordinates.');
      return null;
    }
  }, [coordFormat, z1Real, z1Imag, z1Mag, z1Angle, z2Real, z2Imag, z2Mag, z2Angle]);

  // Main Calculation Engine
  const calculationResults = useMemo<CalculationResult | null>(() => {
    if (!parsedInputs) return null;
    const { z1, z2 } = parsedInputs;

    try {
      // 1. ROOTS MODE: De Moivre N-th Roots
      if (calcMode === 'roots') {
        const n = Math.max(2, Math.min(16, Math.round(rootDegreeN)));
        const polar = z1.toPolar();
        const rRoot = Math.pow(polar.r, 1 / n);
        const roots: RootPoint[] = [];

        for (let k = 0; k < n; k++) {
          const angleRad = (polar.phi + 2 * Math.PI * k) / n;
          const angleDeg = (angleRad * 180) / Math.PI;
          const re = rRoot * Math.cos(angleRad);
          const im = rRoot * Math.sin(angleRad);
          roots.push({
            k,
            re,
            im,
            r: rRoot,
            phiDeg: angleDeg,
            phiRad: angleRad,
            formatted: formatComplex(re, im, 4)
          });
        }

        return {
          type: 'roots',
          z1,
          roots,
          rootDegree: n,
          rootRadius: rRoot
        };
      }

      // 2. UNARY MODE: Single Variable Properties
      if (calcMode === 'unary') {
        let resComplex: any = null;
        let scalarResult: string | null = null;
        let stepMath = '';

        const polar = z1.toPolar();
        const phiDeg = (polar.phi * 180) / Math.PI;

        switch (unaryOp) {
          case 'abs':
            scalarResult = `${polar.r.toFixed(4)}`;
            stepMath = `|Z1| = \\sqrt{(${z1.re})^2 + (${z1.im})^2} = \\sqrt{${(z1.re * z1.re + z1.im * z1.im).toFixed(4)}} = ${polar.r.toFixed(4)}`;
            break;
          case 'arg':
            scalarResult = `${polar.phi.toFixed(4)} rad (${phiDeg.toFixed(2)}°)`;
            stepMath = `\\text{arg}(Z1) = \\text{atan2}(${z1.im}, ${z1.re}) = ${polar.phi.toFixed(4)}\\text{ rad} = ${phiDeg.toFixed(2)}^\\circ`;
            break;
          case 'conj':
            resComplex = math.complex(z1.re, -z1.im);
            stepMath = `Z1^* = \\text{Re}(Z1) - i\\cdot\\text{Im}(Z1) = ${formatComplex(z1.re, -z1.im)}`;
            break;
          case 'inv':
            resComplex = math.divide(math.complex(1, 0), z1);
            stepMath = `\\frac{1}{Z1} = \\frac{${z1.re} - ${z1.im}i}{(${z1.re})^2 + (${z1.im})^2} = ${formatComplex(resComplex.re, resComplex.im)}`;
            break;
          case 'sqrt':
            resComplex = math.sqrt(z1);
            stepMath = `\\sqrt{Z1} = \\sqrt{${polar.r.toFixed(4)}} \\cdot e^{i \\cdot (${phiDeg.toFixed(1)}^\\circ / 2)} = ${formatComplex(resComplex.re, resComplex.im)}`;
            break;
          case 'log':
            resComplex = math.log(z1);
            stepMath = `\\ln(Z1) = \\ln(|Z1|) + i\\cdot\\text{arg}(Z1) = \\ln(${polar.r.toFixed(4)}) + ${polar.phi.toFixed(4)}i = ${formatComplex(resComplex.re, resComplex.im)}`;
            break;
          case 'exp':
            resComplex = math.exp(z1);
            stepMath = `e^{Z1} = e^{${z1.re}} \\cdot (\\cos(${z1.im}) + i\\sin(${z1.im})) = ${formatComplex(resComplex.re, resComplex.im)}`;
            break;
          case 'sin':
            resComplex = math.sin(z1);
            stepMath = `\\sin(Z1) = \\frac{e^{iZ1} - e^{-iZ1}}{2i} = ${formatComplex(resComplex.re, resComplex.im)}`;
            break;
          case 'cos':
            resComplex = math.cos(z1);
            stepMath = `\\cos(Z1) = \\frac{e^{iZ1} + e^{-iZ1}}{2} = ${formatComplex(resComplex.re, resComplex.im)}`;
            break;
          case 'tan':
            resComplex = math.tan(z1);
            stepMath = `\\tan(Z1) = \\frac{\\sin(Z1)}{\\cos(Z1)} = ${formatComplex(resComplex.re, resComplex.im)}`;
            break;
          case 'sinh':
            resComplex = math.sinh(z1);
            stepMath = `\\sinh(Z1) = \\frac{e^{Z1} - e^{-Z1}}{2} = ${formatComplex(resComplex.re, resComplex.im)}`;
            break;
          case 'cosh':
            resComplex = math.cosh(z1);
            stepMath = `\\cosh(Z1) = \\frac{e^{Z1} + e^{-Z1}}{2} = ${formatComplex(resComplex.re, resComplex.im)}`;
            break;
        }

        return {
          type: 'unary',
          z1,
          resComplex,
          scalarResult,
          stepMath,
          polarZ1: polar
        };
      }

      // 3. AC IMPEDANCE MODE: RLC Circuits
      if (calcMode === 'impedance') {
        const R = Math.max(0, parseFloat(resistorR) || 0);
        const L = Math.max(0, parseFloat(inductorL) || 0);
        const C = Math.max(1e-12, parseFloat(capacitorC) || 1e-6);
        const f = Math.max(1, parseFloat(acFrequency) || 50);

        const omega = 2 * Math.PI * f; // rad/s
        const X_L = omega * L; // Inductive Reactance (Ohms)
        const X_C = 1 / (omega * C); // Capacitive Reactance (Ohms)
        const X_net = X_L - X_C;

        let totalZ: any;
        if (circuitType === 'series') {
          totalZ = math.complex(R, X_net);
        } else {
          // Parallel: 1/Z = 1/R + 1/(j X_L) + 1/(-j X_C) = 1/R + j(1/X_C - 1/X_L)
          const G = 1 / Math.max(1e-9, R);
          const B_C = omega * C;
          const B_L = L > 0 ? 1 / (omega * L) : 0;
          const B_net = B_C - B_L;
          const Y = math.complex(G, B_net);
          totalZ = math.divide(math.complex(1, 0), Y);
        }

        const zPolar = totalZ.toPolar();
        const phaseDeg = (zPolar.phi * 180) / Math.PI;
        const powerFactor = Math.cos(zPolar.phi);
        const pfNature = phaseDeg > 0 ? 'Lagging (Inductive)' : phaseDeg < 0 ? 'Leading (Capacitive)' : 'Unity (Resonant)';

        return {
          type: 'impedance',
          R,
          L,
          C,
          f,
          omega,
          X_L,
          X_C,
          X_net,
          totalZ,
          zPolar,
          phaseDeg,
          powerFactor,
          pfNature
        };
      }

      // 4. BINARY MODE: (Z1 op Z2)
      if (!z2) throw new Error('Please enter valid coordinates for Z2.');

      let result: any = null;
      let stepMath = '';

      switch (operation) {
        case '+':
          result = math.add(z1, z2);
          stepMath = `(${formatComplex(z1.re, z1.im)}) + (${formatComplex(z2.re, z2.im)}) = (${z1.re} + ${z2.re}) + (${z1.im} + ${z2.im})i = ${formatComplex(result.re, result.im)}`;
          break;
        case '-':
          result = math.subtract(z1, z2);
          stepMath = `(${formatComplex(z1.re, z1.im)}) - (${formatComplex(z2.re, z2.im)}) = (${z1.re} - ${z2.re}) + (${z1.im} - ${z2.im})i = ${formatComplex(result.re, result.im)}`;
          break;
        case '*':
          result = math.multiply(z1, z2);
          stepMath = `(${formatComplex(z1.re, z1.im)}) \\times (${formatComplex(z2.re, z2.im)}) = (${z1.re}\\cdot${z2.re} - ${z1.im}\\cdot${z2.im}) + (${z1.re}\\cdot${z2.im} + ${z1.im}\\cdot${z2.re})i = ${formatComplex(result.re, result.im)}`;
          break;
        case '/':
          if (Math.abs(z2.re) < 1e-12 && Math.abs(z2.im) < 1e-12) {
            throw new Error('Division by zero (0 + 0i) is mathematically undefined.');
          }
          result = math.divide(z1, z2);
          const denom = z2.re * z2.re + z2.im * z2.im;
          stepMath = `\\frac{${formatComplex(z1.re, z1.im)}}{${formatComplex(z2.re, z2.im)}} = \\frac{(${formatComplex(z1.re, z1.im)})(${formatComplex(z2.re, -z2.im)})}{${denom.toFixed(4)}} = ${formatComplex(result.re, result.im)}`;
          break;
        case '^':
          result = math.pow(z1, z2);
          stepMath = `(${formatComplex(z1.re, z1.im)})^{(${formatComplex(z2.re, z2.im)})} = ${formatComplex(result.re, result.im)}`;
          break;
        case 'parallel':
          const sumZ = math.add(z1, z2);
          const prodZ = math.multiply(z1, z2);
          result = math.divide(prodZ, sumZ);
          stepMath = `Z_1 \\parallel Z_2 = \\frac{Z_1 \\cdot Z_2}{Z_1 + Z_2} = ${formatComplex(result.re, result.im)}`;
          break;
      }

      return {
        type: 'binary',
        z1,
        z2,
        result,
        stepMath,
        polarZ1: z1.toPolar(),
        polarZ2: z2.toPolar(),
        polarResult: result.toPolar()
      };
    } catch (e: any) {
      setError(e.message || 'Computation error.');
      return null;
    }
  }, [parsedInputs, calcMode, unaryOp, operation, rootDegreeN, resistorR, inductorL, capacitorC, acFrequency, circuitType]);

  // Copy handler with multiple formats
  const handleCopyResult = (textToCopy: string, formatLabel: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setCopiedFormat(formatLabel);
    setTimeout(() => {
      setCopied(false);
      setCopiedFormat(null);
    }, 2000);
  };

  // SVGs Argand Diagram Geometry & Scaling
  const svgWidth = 420;
  const svgHeight = 320;
  const originX = svgWidth / 2;
  const originY = svgHeight / 2;

  const graphScale = useMemo(() => {
    if (!calculationResults) return 25;

    const coords: number[] = [1];
    if ('z1' in calculationResults && calculationResults.z1) {
      coords.push(Math.abs(calculationResults.z1.re), Math.abs(calculationResults.z1.im));
    }

    if (calculationResults.type === 'binary') {
      if (calculationResults.z2) coords.push(Math.abs(calculationResults.z2.re), Math.abs(calculationResults.z2.im));
      if (calculationResults.result) coords.push(Math.abs(calculationResults.result.re), Math.abs(calculationResults.result.im));
    }

    if (calculationResults.type === 'unary' && calculationResults.resComplex) {
      coords.push(Math.abs(calculationResults.resComplex.re), Math.abs(calculationResults.resComplex.im));
    }

    if (calculationResults.type === 'roots') {
      calculationResults.roots.forEach((r: RootPoint) => {
        coords.push(Math.abs(r.re), Math.abs(r.im));
      });
    }

    if (calculationResults.type === 'impedance' && calculationResults.totalZ) {
      coords.push(Math.abs(calculationResults.totalZ.re), Math.abs(calculationResults.totalZ.im));
    }

    const maxVal = Math.max(...coords, 1);
    const availablePixelRadius = Math.min(originX, originY) - 40;
    return Math.max(12, Math.min(65, availablePixelRadius / maxVal));
  }, [calculationResults, originX, originY]);

  const mapX = (xVal: number) => originX + xVal * graphScale;
  const mapY = (yVal: number) => originY - yVal * graphScale;

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Answer Engine Optimization (AEO) Quick Answer Box */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3.5 shadow-xs">
        <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
          <p className="font-bold text-zinc-900 dark:text-white text-sm">
            What is a Complex Number and the Argand Diagram?
          </p>
          <p className="leading-relaxed">
            A <strong>complex number</strong> is a two-dimensional mathematical entity written as <em>Z = a + bi</em> (Cartesian) or <em>Z = r &middot; e<sup>i&theta;</sup></em> (Polar), where <em>i = &radic;(-1)</em>. An <strong>Argand Diagram</strong> plots the Real part along the horizontal X-axis and the Imaginary part along the vertical Y-axis, representing complex quantities as 2D position phasors.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form & Modes (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="saas-card p-5 space-y-4">
            {/* Calculation Mode Selector Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 mb-2.5">
                <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Calculator Operation Mode
              </span>

              <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-xs">
                {[
                  { id: 'binary', label: 'Arithmetic' },
                  { id: 'unary', label: 'Functions' },
                  { id: 'roots', label: 'De Moivre' },
                  { id: 'impedance', label: 'AC RLC' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCalcMode(tab.id as CalculationMode)}
                    className={`py-1.5 px-1 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                      calcMode === tab.id
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinate Representation Selector */}
            {calcMode !== 'impedance' && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Coordinate Format</span>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold">
                  <button
                    onClick={() => setCoordFormat('cartesian')}
                    className={`px-2 py-0.5 rounded transition ${coordFormat === 'cartesian' ? 'bg-white dark:bg-zinc-900 text-indigo-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Rectangular (a + bi)
                  </button>
                  <button
                    onClick={() => setCoordFormat('polar_deg')}
                    className={`px-2 py-0.5 rounded transition ${coordFormat === 'polar_deg' ? 'bg-white dark:bg-zinc-900 text-indigo-600 shadow-xs' : 'text-zinc-500'}`}
                  >
                    Polar (r ∠ θ°)
                  </button>
                </div>
              </div>
            )}

            {/* Z1 Input Coordinates */}
            {calcMode !== 'impedance' && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                  Complex Number Z1
                </span>

                {coordFormat === 'cartesian' ? (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold mb-1">Real Part (a)</label>
                      <input
                        type="number"
                        step="any"
                        value={z1Real}
                        onChange={(e) => setZ1Real(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold mb-1">Imaginary Part (b)</label>
                      <input
                        type="number"
                        step="any"
                        value={z1Imag}
                        onChange={(e) => setZ1Imag(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold mb-1">Modulus / Magnitude (r)</label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={z1Mag}
                        onChange={(e) => setZ1Mag(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 font-bold mb-1">Phase Angle (θ°)</label>
                      <input
                        type="number"
                        step="any"
                        value={z1Angle}
                        onChange={(e) => setZ1Angle(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Binary Operations & Z2 */}
            {calcMode === 'binary' && (
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
                    Binary Operator
                  </span>
                  <div className="grid grid-cols-6 gap-1.5 text-xs font-bold font-mono">
                    {[
                      { op: '+', label: 'Add (+)' },
                      { op: '-', label: 'Sub (-)' },
                      { op: '*', label: 'Mul (×)' },
                      { op: '/', label: 'Div (÷)' },
                      { op: '^', label: 'Pow (^)' },
                      { op: 'parallel', label: 'Par (∥)' }
                    ].map((btn) => (
                      <button
                        key={btn.op}
                        onClick={() => setOperation(btn.op as any)}
                        className={`py-2 rounded-lg border transition cursor-pointer ${
                          operation === btn.op
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                        }`}
                        title={btn.label}
                      >
                        {btn.op === 'parallel' ? '∥' : btn.op}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Z2 Input Coordinates */}
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                    Complex Number Z2
                  </span>

                  {coordFormat === 'cartesian' ? (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-bold mb-1">Real Part (c)</label>
                        <input
                          type="number"
                          step="any"
                          value={z2Real}
                          onChange={(e) => setZ2Real(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-bold mb-1">Imaginary Part (d)</label>
                        <input
                          type="number"
                          step="any"
                          value={z2Imag}
                          onChange={(e) => setZ2Imag(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-bold mb-1">Modulus (r2)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={z2Mag}
                          onChange={(e) => setZ2Mag(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-bold mb-1">Phase Angle (θ2°)</label>
                        <input
                          type="number"
                          step="any"
                          value={z2Angle}
                          onChange={(e) => setZ2Angle(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Unary Properties Selection */}
            {calcMode === 'unary' && (
              <div className="space-y-2 text-xs">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Select Analytic Function
                </span>
                <select
                  value={unaryOp}
                  onChange={(e) => setUnaryOp(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-xs"
                >
                  <option value="abs">Modulus / Absolute Value |Z1|</option>
                  <option value="arg">Argument / Phase Angle arg(Z1)</option>
                  <option value="conj">Complex Conjugate Z1*</option>
                  <option value="inv">Multiplicative Inverse (1 / Z1)</option>
                  <option value="sqrt">Principal Square Root √Z1</option>
                  <option value="log">Principal Natural Log ln(Z1)</option>
                  <option value="exp">Exponential Function e^Z1</option>
                  <option value="sin">Trigonometric Sine sin(Z1)</option>
                  <option value="cos">Trigonometric Cosine cos(Z1)</option>
                  <option value="tan">Trigonometric Tangent tan(Z1)</option>
                  <option value="sinh">Hyperbolic Sine sinh(Z1)</option>
                  <option value="cosh">Hyperbolic Cosine cosh(Z1)</option>
                </select>
              </div>
            )}

            {/* Roots of Unity Selection */}
            {calcMode === 'roots' && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Root Degree (n-th roots)
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={2}
                    max={12}
                    value={rootDegreeN}
                    onChange={(e) => setRootDegreeN(Number(e.target.value))}
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 w-12 text-center text-sm">
                    n = {rootDegreeN}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Calculates all {rootDegreeN} roots distributed symmetrically on the radius circle r = ({Math.pow(parseFloat(z1Mag) || 5, 1 / rootDegreeN).toFixed(3)}).
                </p>
              </div>
            )}

            {/* AC RLC Impedance Inputs */}
            {calcMode === 'impedance' && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Circuit Topology</span>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold">
                    <button
                      onClick={() => setCircuitType('series')}
                      className={`px-2 py-0.5 rounded transition ${circuitType === 'series' ? 'bg-white dark:bg-zinc-900 text-indigo-600 shadow-xs' : 'text-zinc-500'}`}
                    >
                      Series RLC
                    </button>
                    <button
                      onClick={() => setCircuitType('parallel')}
                      className={`px-2 py-0.5 rounded transition ${circuitType === 'parallel' ? 'bg-white dark:bg-zinc-900 text-indigo-600 shadow-xs' : 'text-zinc-500'}`}
                    >
                      Parallel RLC
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold mb-1">Resistance R (Ω)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={resistorR}
                      onChange={(e) => setResistorR(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold mb-1">Inductance L (H)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={inductorL}
                      onChange={(e) => setInductorL(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold mb-1">Capacitance C (F)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={capacitorC}
                      onChange={(e) => setCapacitorC(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 font-bold mb-1">AC Frequency f (Hz)</label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={acFrequency}
                      onChange={(e) => setAcFrequency(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-mono text-xs font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Presets & Reset */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase block">Quick Problem Archetypes</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: '3_4i', label: '3 + 4i Example' },
                  { id: 'roots_unity_4', label: '4th Roots of 1' },
                  { id: 'roots_unity_6', label: '6th Roots of 1' },
                  { id: 'euler_identity', label: "Euler's Identity (e^(iπ))" },
                  { id: 'rlc_50hz', label: '50Hz AC Circuit' }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => loadPreset(p.id)}
                    className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-700 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleReset}
                className="w-full mt-2 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-xs font-bold text-zinc-600 dark:text-zinc-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Calculator</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Visual Argand Diagram & Output Matrix (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Interactive Argand Diagram Vector Plotter */}
          <div className="saas-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
              <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Argand Plane Complex Vector Plotter
              </span>

              {/* Legend Badges */}
              <div className="flex items-center gap-2.5 text-[10px] font-bold font-mono">
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <span className="w-2.5 h-1 rounded bg-indigo-600" /> Z1
                </span>
                {calcMode === 'binary' && (
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    <span className="w-2.5 h-1 rounded bg-purple-600" /> Z2
                  </span>
                )}
                {(calcMode === 'binary' || calcMode === 'unary' || calcMode === 'impedance') && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-1 rounded bg-emerald-600" /> Result
                  </span>
                )}
                {calcMode === 'roots' && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-1 rounded bg-emerald-600" /> Roots (wk)
                  </span>
                )}
              </div>
            </div>

            {/* SVG Graph Canvas */}
            <div className="relative w-full rounded-2xl bg-zinc-950 p-2 border border-zinc-800 select-none overflow-hidden flex items-center justify-center">
              <svg
                width="100%"
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="overflow-visible"
              >
                {/* Real & Imaginary Axis Grid Lines */}
                <line x1={0} y1={originY} x2={svgWidth} y2={originY} stroke="#3f3f46" strokeWidth={1.5} />
                <line x1={originX} y1={0} x2={originX} y2={svgHeight} stroke="#3f3f46" strokeWidth={1.5} />

                {/* Concentric Modulus Reference Circles */}
                {[1, 2, 3, 4].map((rStep) => (
                  <circle
                    key={rStep}
                    cx={originX}
                    cy={originY}
                    r={rStep * 25}
                    fill="none"
                    stroke="#27272a"
                    strokeWidth={0.8}
                    strokeDasharray="3,3"
                  />
                ))}

                {/* Axis Labels */}
                <text x={svgWidth - 12} y={originY - 6} fill="#a1a1aa" fontSize={10} fontWeight="bold" textAnchor="end" fontFamily="monospace">
                  Re (Real)
                </text>
                <text x={originX + 8} y={15} fill="#a1a1aa" fontSize={10} fontWeight="bold" fontFamily="monospace">
                  Im (Imag)
                </text>

                {/* Roots of Unity Circle & Vector Polygon */}
                {calculationResults && calculationResults.type === 'roots' && (
                  <>
                    <circle
                      cx={originX}
                      cy={originY}
                      r={calculationResults.rootRadius * graphScale}
                      fill="none"
                      stroke="#059669"
                      strokeWidth={1.2}
                      strokeDasharray="4,4"
                    />

                    {/* Polygon connecting roots */}
                    <polygon
                      points={calculationResults.roots.map((r: RootPoint) => `${mapX(r.re)},${mapY(r.im)}`).join(' ')}
                      fill="rgba(16, 185, 129, 0.08)"
                      stroke="#10b981"
                      strokeWidth={1.2}
                    />

                    {calculationResults.roots.map((r: RootPoint) => (
                      <g key={r.k}>
                        <line
                          x1={originX}
                          y1={originY}
                          x2={mapX(r.re)}
                          y2={mapY(r.im)}
                          stroke="#10b981"
                          strokeWidth={1.5}
                          markerEnd="url(#arrow-emerald)"
                        />
                        <circle cx={mapX(r.re)} cy={mapY(r.im)} r={3.5} fill="#34d399" />
                        <text
                          x={mapX(r.re) + (r.re >= 0 ? 6 : -6)}
                          y={mapY(r.im) + (r.im >= 0 ? -6 : 10)}
                          fill="#34d399"
                          fontSize={9}
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor={r.re >= 0 ? 'start' : 'end'}
                        >
                          w{r.k}
                        </text>
                      </g>
                    ))}
                  </>
                )}

                {/* Z1 Vector Arrow */}
                {calculationResults && 'z1' in calculationResults && calculationResults.z1 && (
                  <g>
                    <line
                      x1={originX}
                      y1={originY}
                      x2={mapX(calculationResults.z1.re)}
                      y2={mapY(calculationResults.z1.im)}
                      stroke="#818cf8"
                      strokeWidth={2.2}
                      markerEnd="url(#arrow-indigo)"
                    />
                    <circle cx={mapX(calculationResults.z1.re)} cy={mapY(calculationResults.z1.im)} r={4} fill="#6366f1" />
                    <text
                      x={mapX(calculationResults.z1.re) + 8}
                      y={mapY(calculationResults.z1.im) - 6}
                      fill="#818cf8"
                      fontSize={10}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      Z1
                    </text>
                  </g>
                )}

                {/* Z2 Vector Arrow (Binary mode) */}
                {calculationResults && calculationResults.type === 'binary' && calculationResults.z2 && (
                  <g>
                    <line
                      x1={originX}
                      y1={originY}
                      x2={mapX(calculationResults.z2.re)}
                      y2={mapY(calculationResults.z2.im)}
                      stroke="#c084fc"
                      strokeWidth={2.2}
                      markerEnd="url(#arrow-purple)"
                    />
                    <circle cx={mapX(calculationResults.z2.re)} cy={mapY(calculationResults.z2.im)} r={4} fill="#a855f7" />
                    <text
                      x={mapX(calculationResults.z2.re) + 8}
                      y={mapY(calculationResults.z2.im) - 6}
                      fill="#c084fc"
                      fontSize={10}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      Z2
                    </text>
                  </g>
                )}

                {/* Result Vector Arrow */}
                {calculationResults && calculationResults.type === 'binary' && calculationResults.result && (
                  <g>
                    <line
                      x1={originX}
                      y1={originY}
                      x2={mapX(calculationResults.result.re)}
                      y2={mapY(calculationResults.result.im)}
                      stroke="#34d399"
                      strokeWidth={2.5}
                      markerEnd="url(#arrow-emerald)"
                    />
                    <circle cx={mapX(calculationResults.result.re)} cy={mapY(calculationResults.result.im)} r={4.5} fill="#10b981" />
                    <text
                      x={mapX(calculationResults.result.re) + 8}
                      y={mapY(calculationResults.result.im) - 6}
                      fill="#34d399"
                      fontSize={10}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      Res
                    </text>
                  </g>
                )}

                {/* Unary Result Vector */}
                {calculationResults && calculationResults.type === 'unary' && calculationResults.resComplex && (
                  <g>
                    <line
                      x1={originX}
                      y1={originY}
                      x2={mapX(calculationResults.resComplex.re)}
                      y2={mapY(calculationResults.resComplex.im)}
                      stroke="#34d399"
                      strokeWidth={2.5}
                      markerEnd="url(#arrow-emerald)"
                    />
                    <circle cx={mapX(calculationResults.resComplex.re)} cy={mapY(calculationResults.resComplex.im)} r={4.5} fill="#10b981" />
                    <text
                      x={mapX(calculationResults.resComplex.re) + 8}
                      y={mapY(calculationResults.resComplex.im) - 6}
                      fill="#34d399"
                      fontSize={10}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      f(Z1)
                    </text>
                  </g>
                )}

                {/* AC Impedance Phasor Vector */}
                {calculationResults && calculationResults.type === 'impedance' && calculationResults.totalZ && (
                  <g>
                    <line
                      x1={originX}
                      y1={originY}
                      x2={mapX(calculationResults.totalZ.re)}
                      y2={mapY(calculationResults.totalZ.im)}
                      stroke="#34d399"
                      strokeWidth={2.5}
                      markerEnd="url(#arrow-emerald)"
                    />
                    <circle cx={mapX(calculationResults.totalZ.re)} cy={mapY(calculationResults.totalZ.im)} r={4.5} fill="#10b981" />
                    <text
                      x={mapX(calculationResults.totalZ.re) + 8}
                      y={mapY(calculationResults.totalZ.im) - 6}
                      fill="#34d399"
                      fontSize={10}
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      Z ({calculationResults.zPolar.r.toFixed(1)}Ω)
                    </text>
                  </g>
                )}

                {/* Arrowhead Markers */}
                <defs>
                  <marker id="arrow-indigo" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
                  </marker>
                  <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc" />
                  </marker>
                  <marker id="arrow-emerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
                  </marker>
                </defs>
              </svg>
            </div>
          </div>

          {/* Results Matrix & Conversions Card */}
          {calculationResults && (
            <div className="saas-card p-5 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase font-sans">
                  Computed Mathematical Output
                </span>
                <button
                  onClick={() => {
                    let text = '';
                    if (calculationResults.type === 'binary') {
                      text = formatComplex(calculationResults.result.re, calculationResults.result.im);
                    } else if (calculationResults.type === 'unary') {
                      text = calculationResults.scalarResult || (calculationResults.resComplex ? formatComplex(calculationResults.resComplex.re, calculationResults.resComplex.im) : '');
                    } else if (calculationResults.type === 'roots') {
                      text = calculationResults.roots.map((r: RootPoint) => `w${r.k} = ${r.formatted}`).join(', ');
                    } else if (calculationResults.type === 'impedance') {
                      text = `Z = ${formatComplex(calculationResults.totalZ.re, calculationResults.totalZ.im)} Ω`;
                    }
                    handleCopyResult(text, 'all');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-sans"
                >
                  {copied && copiedFormat === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied && copiedFormat === 'all' ? 'Copied!' : 'Copy Result'}</span>
                </button>
              </div>

              {/* BINARY & UNARY COMPLEX OUTPUT DISPLAY */}
              {(calculationResults.type === 'binary' || calculationResults.type === 'unary') && (
                <div className="space-y-3">
                  {/* Cartesian / Rectangular */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">
                      Cartesian / Rectangular Form (a + bi)
                    </span>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {calculationResults.type === 'binary'
                        ? formatComplex(calculationResults.result.re, calculationResults.result.im, 5)
                        : calculationResults.scalarResult || formatComplex(calculationResults.resComplex.re, calculationResults.resComplex.im, 5)}
                    </p>
                  </div>

                  {/* Polar Representations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">
                        Polar Phasor Form (r ∠ θ°)
                      </span>
                      <p className="font-bold text-zinc-900 dark:text-white">
                        {calculationResults.type === 'binary'
                          ? `${calculationResults.polarResult.r.toFixed(4)} ∠ ${(calculationResults.polarResult.phi * 180 / Math.PI).toFixed(2)}°`
                          : calculationResults.resComplex
                          ? `${calculationResults.resComplex.toPolar().r.toFixed(4)} ∠ ${(calculationResults.resComplex.toPolar().phi * 180 / Math.PI).toFixed(2)}°`
                          : calculationResults.scalarResult}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">
                        Euler Exponential Form (r · e^(iθ))
                      </span>
                      <p className="font-bold text-zinc-900 dark:text-white">
                        {calculationResults.type === 'binary'
                          ? `${calculationResults.polarResult.r.toFixed(4)} · e^(${calculationResults.polarResult.phi.toFixed(4)}i)`
                          : calculationResults.resComplex
                          ? `${calculationResults.resComplex.toPolar().r.toFixed(4)} · e^(${calculationResults.resComplex.toPolar().phi.toFixed(4)}i)`
                          : calculationResults.scalarResult}
                      </p>
                    </div>
                  </div>

                  {/* Step by step derivation */}
                  {calculationResults.stepMath && (
                    <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/60">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block mb-1">
                        Mathematical Derivation
                      </span>
                      <p className="font-mono text-zinc-800 dark:text-zinc-200 text-xs">
                        {calculationResults.stepMath}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ROOTS DE MOIVRE TABLE */}
              {calculationResults.type === 'roots' && (
                <div className="space-y-3">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 font-bold uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800">
                          <th className="p-2">Root (k)</th>
                          <th className="p-2">Cartesian (a + bi)</th>
                          <th className="p-2">Polar (r ∠ θ°)</th>
                          <th className="p-2">Angle (rad)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {calculationResults.roots.map((r: RootPoint) => (
                          <tr key={r.k} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                            <td className="p-2 font-bold text-emerald-600 dark:text-emerald-400">w{r.k}</td>
                            <td className="p-2 font-bold text-zinc-900 dark:text-white">{r.formatted}</td>
                            <td className="p-2 text-zinc-600 dark:text-zinc-400">{r.r.toFixed(3)} ∠ {r.phiDeg.toFixed(1)}°</td>
                            <td className="p-2 text-zinc-500">{r.phiRad.toFixed(3)} rad</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AC IMPEDANCE RESULTS */}
              {calculationResults.type === 'impedance' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Reactance X_L</span>
                      <p className="font-bold text-zinc-900 dark:text-white">{calculationResults.X_L.toFixed(2)} Ω</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Reactance X_C</span>
                      <p className="font-bold text-zinc-900 dark:text-white">{calculationResults.X_C.toFixed(2)} Ω</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Power Factor</span>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{calculationResults.powerFactor.toFixed(3)}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">Phase Shift</span>
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">{calculationResults.phaseDeg.toFixed(1)}°</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">Total Circuit Impedance</span>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                        Z = {formatComplex(calculationResults.totalZ.re, calculationResults.totalZ.im, 3)} Ω &bull; ({calculationResults.zPolar.r.toFixed(2)} Ω ∠ {calculationResults.phaseDeg.toFixed(1)}°)
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-sans">
                      {calculationResults.pfNature}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Complex Numbers Theoretical Guide Card */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
        <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Fundamental Complex Number Algebra & Phasor Laws
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">Euler's Formula & Polar Form</p>
            <p className="text-[11px]">
              Every complex number can be expressed as <em>Z = r(cos &theta; + i sin &theta;) = r &middot; e<sup>i&theta;</sup></em>, where <em>r = &radic;(a&sup2; + b&sup2;)</em> is the modulus and <em>&theta; = atan2(b, a)</em> is the argument.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">De Moivre's Powers & Roots</p>
            <p className="text-[11px]">
              For any integer <em>n</em>, <em>(r &middot; e<sup>i&theta;</sup>)<sup>n</sup> = r<sup>n</sup> &middot; e<sup>in&theta;</sup></em>. The <em>n</em> distinct <em>n</em>-th roots form vertices of a regular <em>n</em>-gon centered at the origin of the Argand plane.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-850/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <p className="font-bold text-zinc-900 dark:text-white">AC Phasors & Impedance</p>
            <p className="text-[11px]">
              In electrical circuits, capacitors and inductors introduce 90&deg; phase shifts represented by imaginary reactances (<em>X<sub>L</sub> = &omega;L</em>, <em>X<sub>C</sub> = -1/(&omega;C)</em>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
