import { useState } from 'react';
import { Copy, Check, Info, Layers, Scale } from 'lucide-react';

type UnitType = 'metric' | 'imperial';

interface ThicknessOption {
  label: string;
  value: number; // thickness in mm
}

const THICKNESS_OPTIONS: ThicknessOption[] = [
  { label: '4 mm Single Pane', value: 4 },
  { label: '5 mm Single Pane', value: 5 },
  { label: '6 mm Single Pane', value: 6 },
  { label: '8 mm Single Pane', value: 8 },
  { label: '10 mm Single Pane', value: 10 },
  { label: '12 mm Single Pane', value: 12 },
  { label: 'Double Glazed (4mm + 12mm Air + 4mm)', value: 8 },
  { label: 'Double Glazed (6mm + 12mm Air + 6mm)', value: 12 }
];

export default function GlassAreaCalculator() {
  const [unit, setUnit] = useState<UnitType>('imperial');
  const [width, setWidth] = useState<number>(36); // inches or cm
  const [height, setHeight] = useState<number>(60); // inches or cm
  const [qty, setQty] = useState<number>(5);
  const [thickness, setThickness] = useState<number>(6); // mm
  const [frameWidth, setFrameWidth] = useState<number>(2); // frame border deduction
  const [copied, setCopied] = useState(false);

  // Math Conversion Constants
  // Density of glass is 2.5 kg per sq meter per mm of thickness
  const calculateMetrics = () => {
    let widthInMeters = 0;
    let heightInMeters = 0;
    let frameInMeters = 0;

    if (unit === 'imperial') {
      // Convert inches to meters
      widthInMeters = width * 0.0254;
      heightInMeters = height * 0.0254;
      frameInMeters = frameWidth * 0.0254;
    } else {
      // Convert cm to meters
      widthInMeters = width / 100;
      heightInMeters = height / 100;
      frameInMeters = frameWidth / 100;
    }

    // Deduct frame from all 4 sides (so 2 * frameWidth deducted from width and height)
    const netWidthMeters = Math.max(0, widthInMeters - (2 * frameInMeters));
    const netHeightMeters = Math.max(0, heightInMeters - (2 * frameInMeters));

    const grossAreaM2 = widthInMeters * heightInMeters;
    const netAreaM2 = netWidthMeters * netHeightMeters;

    // Weight in kg = Area (m2) * Thickness (mm) * 2.5
    const unitWeightKg = netAreaM2 * thickness * 2.5;
    const totalWeightKg = unitWeightKg * qty;
    const totalAreaM2 = netAreaM2 * qty;

    // Output formatting based on unit
    if (unit === 'imperial') {
      const grossAreaSqFt = grossAreaM2 * 10.7639;
      const netAreaSqFt = netAreaM2 * 10.7639;
      const totalAreaSqFt = totalAreaM2 * 10.7639;
      const totalWeightLbs = totalWeightKg * 2.20462;

      return {
        grossArea: grossAreaSqFt,
        netArea: netAreaSqFt,
        totalArea: totalAreaSqFt,
        totalWeight: totalWeightLbs,
        areaUnit: 'Sq. Ft',
        weightUnit: 'Lbs'
      };
    } else {
      return {
        grossArea: grossAreaM2,
        netArea: netAreaM2,
        totalArea: totalAreaM2,
        totalWeight: totalWeightKg,
        areaUnit: 'Sq. Meters',
        weightUnit: 'Kg'
      };
    }
  };

  const results = calculateMetrics();

  const copyReport = () => {
    const text = `Glass Area & Load Report
----------------------------------------
Dimensions: ${width} x ${height} ${unit === 'imperial' ? 'Inches' : 'Cm'}
Quantity: ${qty} Unit(s)
Glass Thickness: ${thickness} mm
Frame Border Width: ${frameWidth} ${unit === 'imperial' ? 'Inches' : 'Cm'}

Gross Window Area: ${results.grossArea.toFixed(2)} ${results.areaUnit}
Net Visible Glass Area (Per Unit): ${results.netArea.toFixed(2)} ${results.areaUnit}
Total Project Glass Area: ${results.totalArea.toFixed(2)} ${results.areaUnit}
Total Glazing Structural Weight: ${results.totalWeight.toFixed(1)} ${results.weightUnit}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Parameter Inputs */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <span>Glazing Specification</span>
          </h3>

          <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-xs">
            {(['imperial', 'metric'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold capitalize transition ${
                  unit === u
                    ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-650'
                }`}
              >
                {u === 'imperial' ? 'Imperial (in/lbs)' : 'Metric (cm/kg)'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Window Width ({unit === 'imperial' ? 'Inches' : 'Cm'})
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Window Height ({unit === 'imperial' ? 'Inches' : 'Cm'})
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Window Quantity
              </label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                className="saas-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Frame Border Thickness ({unit === 'imperial' ? 'Inches' : 'Cm'})
              </label>
              <input
                type="number"
                value={frameWidth}
                onChange={(e) => setFrameWidth(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Glass Thickness
              </label>
              <select
                value={thickness}
                onChange={(e) => setThickness(parseInt(e.target.value) || 6)}
                className="saas-input"
              >
                {THICKNESS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Window Blueprint Visualizer */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Glazing Blueprint</h3>
          <p className="text-xs text-zinc-400">
            Top-down structural diagram showing the glass pane surrounded by the window frame border.
          </p>

          <div className="relative w-full aspect-[4/3] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center p-8 shadow-inner">
            {/* Outer Window Frame */}
            <div className="w-4/5 h-4/5 bg-amber-800/10 border-4 border-amber-900 rounded-lg flex items-center justify-center relative p-3">
              <span className="absolute -top-6 text-[10px] font-black text-zinc-500">
                WIDTH: {width} {unit === 'imperial' ? 'in' : 'cm'}
              </span>
              <span className="absolute -left-12 top-1/2 -rotate-90 text-[10px] font-black text-zinc-500">
                HEIGHT: {height} {unit === 'imperial' ? 'in' : 'cm'}
              </span>

              {/* Glass Pane */}
              <div className="w-full h-full bg-sky-300/20 border-2 border-dashed border-sky-500 rounded flex items-center justify-center relative">
                <span className="text-[10px] font-bold text-sky-650 dark:text-sky-400 uppercase tracking-widest text-center">
                  Glass Pane<br />({thickness}mm)
                </span>
                <span className="absolute bottom-2 right-2 text-[9px] text-zinc-450 dark:text-zinc-500">
                  Frame Deduct: -{frameWidth * 2} {unit === 'imperial' ? 'in' : 'cm'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Glazing Estimation
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-xs text-zinc-400">Total Project Glass Area</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.totalArea.toFixed(2)} {results.areaUnit}
                </div>
              </div>

              <div>
                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-indigo-500" />
                  <span>Total Project Glass Weight</span>
                </span>
                <div className="text-3xl font-black mt-1 font-mono text-indigo-650 dark:text-indigo-400">
                  {results.totalWeight.toFixed(1)} {results.weightUnit}
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Gross Window Area (Per Unit)</span>
                  <span className="font-bold font-mono">
                    {results.grossArea.toFixed(2)} {results.areaUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Net Glass Area (Per Unit)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.netArea.toFixed(2)} {results.areaUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Glass Thickness</span>
                  <span className="font-bold font-mono">{thickness} mm</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Deducting window frame border sizes is crucial for accurate glass cutting procurement orders. Glass weight calculations are based on standard architectural density values.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}