import { useState, useEffect } from 'react';
import { Compass, Copy, Check, RotateCcw, Info, AlertTriangle } from 'lucide-react';

export default function RampSlopeCalculator() {
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [calcMode, setCalcMode] = useState<'slope' | 'run' | 'rise'>('slope');

  // Input states
  const [rise, setRise] = useState<number>(30); // inches (imperial) or cm (metric)
  const [run, setRun] = useState<number>(30);  // feet (imperial) or meters (metric)
  const [slopeRatioVal, setSlopeRatioVal] = useState<number>(12); // X in 1:X (e.g. 12 for 1:12)
  const [width, setWidth] = useState<number>(36); // inches (imperial) or cm (metric)

  const [copied, setCopied] = useState<boolean>(false);

  // Output results
  const [results, setResults] = useState({
    calculatedRise: 0, // in rise units
    calculatedRun: 0,   // in run units
    slopePercentage: 0,
    slopeAngle: 0,
    slopeRatioText: '',
    isAdaCompliant: true,
    needsIntermediateLanding: false,
    isWidthCompliant: true,
    minLandingSizeText: '',
  });

  useEffect(() => {
    // Standardize everything to inches/feet or cm/m for calculation
    // Imperial: Rise is in inches, Run is in feet. 1 foot = 12 inches.
    // Metric: Rise is in cm, Run is in meters. 1 meter = 100 cm.
    let calculatedRise = rise;
    let calculatedRun = run;
    let percentage = 0;
    let angle = 0;
    let ratioDenominator = slopeRatioVal;

    if (calcMode === 'slope') {
      if (unit === 'imperial') {
        // Rise in inches, Run in feet
        const runInInches = run * 12;
        if (runInInches > 0) {
          ratioDenominator = runInInches / (rise || 1);
          percentage = (rise / runInInches) * 100;
        }
      } else {
        // Rise in cm, Run in meters
        const runInCm = run * 100;
        if (runInCm > 0) {
          ratioDenominator = runInCm / (rise || 1);
          percentage = (rise / runInCm) * 100;
        }
      }
      ratioDenominator = Number(ratioDenominator.toFixed(2));
    } else if (calcMode === 'run') {
      // Given Rise and Slope Ratio 1:X
      if (unit === 'imperial') {
        const runInInches = rise * slopeRatioVal;
        calculatedRun = Number((runInInches / 12).toFixed(2));
        percentage = (1 / (slopeRatioVal || 1)) * 100;
      } else {
        const runInCm = rise * slopeRatioVal;
        calculatedRun = Number((runInCm / 100).toFixed(2));
        percentage = (1 / (slopeRatioVal || 1)) * 100;
      }
    } else if (calcMode === 'rise') {
      // Given Run and Slope Ratio 1:X
      if (unit === 'imperial') {
        const runInInches = run * 12;
        calculatedRise = Number((runInInches / slopeRatioVal).toFixed(1));
        percentage = (1 / (slopeRatioVal || 1)) * 100;
      } else {
        const runInCm = run * 100;
        calculatedRise = Number((runInCm / slopeRatioVal).toFixed(1));
        percentage = (1 / (slopeRatioVal || 1)) * 100;
      }
    }

    // Common calculations
    angle = Math.atan(percentage / 100) * (180 / Math.PI);

    // Compliance check (ADA max slope is 1:12 = 8.33%)
    const isAdaCompliant = percentage <= 8.34; // Allow minor floating point rounding tolerances

    // Intermediate landing check (ADA requires landing for rises > 30 inches / 76.2 cm)
    const riseInInches = unit === 'imperial' ? calculatedRise : (calculatedRise / 2.54);
    const needsIntermediateLanding = riseInInches > 30;

    // Width check (ADA minimum width is 36 inches / 91.4 cm)
    const widthInInches = unit === 'imperial' ? width : (width / 2.54);
    const isWidthCompliant = widthInInches >= 36;

    // Minimum Landing Size recommendation
    const minLandingSizeText = unit === 'imperial'
      ? '60" x 60" (5ft x 5ft) flat landing'
      : '152.4 cm x 152.4 cm flat landing';

    setResults({
      calculatedRise: Number(calculatedRise.toFixed(1)),
      calculatedRun: Number(calculatedRun.toFixed(2)),
      slopePercentage: Number(percentage.toFixed(2)),
      slopeAngle: Number(angle.toFixed(2)),
      slopeRatioText: `1 : ${ratioDenominator.toLocaleString(undefined, { maximumFractionDigits: 1 })}`,
      isAdaCompliant,
      needsIntermediateLanding,
      isWidthCompliant,
      minLandingSizeText,
    });
  }, [unit, calcMode, rise, run, slopeRatioVal, width]);

  const copyReport = () => {
    const riseUnitText = unit === 'imperial' ? 'inches' : 'cm';
    const runUnitText = unit === 'imperial' ? 'feet' : 'meters';
    const widthUnitText = unit === 'imperial' ? 'inches' : 'cm';

    const text = `Ramp Slope & Egress Compliance Report (Toolique)
--------------------------------------------------
Calculation Mode : ${calcMode.toUpperCase()}
Unit System      : ${unit.toUpperCase()}
Ramp Width       : ${width} ${widthUnitText}
Vertical Rise    : ${results.calculatedRise} ${riseUnitText}
Horizontal Run   : ${results.calculatedRun} ${runUnitText}
--------------------------------------------------
Calculated Slope : ${results.slopeRatioText} (${results.slopePercentage}% / ${results.slopeAngle}°)
ADA Compliance   : ${results.isAdaCompliant ? 'PASS (<= 1:12)' : 'FAIL (> 1:12, too steep)'}
Width Check      : ${results.isWidthCompliant ? 'PASS (>= 36")' : 'FAIL (< 36", too narrow)'}
Landing Required : ${results.needsIntermediateLanding ? 'YES (Rise exceeds 30" limit)' : 'NO (Single run is sufficient)'}
Min Landing Size : ${results.minLandingSizeText}
--------------------------------------------------
Calculated according to International Building Code (IBC) and ADA guidelines.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setRise(30);
    setRun(30);
    setSlopeRatioVal(12);
    setWidth(36);
  };

  const applyPreset = (ratio: number) => {
    setSlopeRatioVal(ratio);
    if (calcMode === 'slope') {
      setCalcMode('run'); // Shift mode to recalculate run with the preset slope
    }
  };

  // Determine visual color class
  const getSlopeColorClass = () => {
    if (results.slopePercentage <= 8.34) return 'stroke-emerald-500 fill-emerald-500/10 border-emerald-500/30 text-emerald-500';
    if (results.slopePercentage <= 10.00) return 'stroke-amber-500 fill-amber-500/10 border-amber-500/30 text-amber-500';
    return 'stroke-rose-500 fill-rose-500/10 border-rose-500/30 text-rose-500';
  };

  // Scale SVG dimensions. Maximum width 100%, maximum height.
  // Triangle representation: max run width is 240px, max rise height is 70px.
  const svgRunWidth = 260;
  const slopeVal = results.slopePercentage / 100;
  // Calculate scaled height based on slope limit
  const svgRiseHeight = Math.max(8, Math.min(75, svgRunWidth * Math.min(slopeVal, 0.2)));

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-7 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-800 dark:text-white text-sm">Ramp Dimensions</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Units Selector */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 text-[10px] font-bold">
              <button
                onClick={() => { setUnit('imperial'); if (rise === 75) { setRise(30); setRun(30); setWidth(36); } }}
                className={`px-2 py-1 rounded-md transition ${unit === 'imperial' ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-indigo-300 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                Imperial
              </button>
              <button
                onClick={() => { setUnit('metric'); if (rise === 30) { setRise(75); setRun(9); setWidth(90); } }}
                className={`px-2 py-1 rounded-md transition ${unit === 'metric' ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-indigo-300 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                Metric
              </button>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-650 dark:hover:text-zinc-200 transition"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calculation Mode */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-2">
            Calculation Target
          </label>
          <div className="grid grid-cols-3 gap-2 bg-zinc-150/40 dark:bg-zinc-800/40 rounded-xl p-1">
            <button
              onClick={() => setCalcMode('slope')}
              className={`py-2 rounded-lg text-xs font-bold text-center transition ${calcMode === 'slope' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
            >
              Find Slope
            </button>
            <button
              onClick={() => setCalcMode('run')}
              className={`py-2 rounded-lg text-xs font-bold text-center transition ${calcMode === 'run' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
            >
              Find Run/Length
            </button>
            <button
              onClick={() => setCalcMode('rise')}
              className={`py-2 rounded-lg text-xs font-bold text-center transition ${calcMode === 'rise' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
            >
              Find Rise/Height
            </button>
          </div>
        </div>

        {/* Dynamic Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Rise Input */}
          {(calcMode === 'slope' || calcMode === 'run') && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
                Vertical Rise ({unit === 'imperial' ? 'Inches' : 'Centimeters'})
              </label>
              <input
                type="number"
                value={rise || ''}
                onChange={(e) => setRise(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="saas-input font-semibold"
              />
            </div>
          )}

          {/* Run Input */}
          {(calcMode === 'slope' || calcMode === 'rise') && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
                Horizontal Run ({unit === 'imperial' ? 'Feet' : 'Meters'})
              </label>
              <input
                type="number"
                value={run || ''}
                onChange={(e) => setRun(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="saas-input font-semibold"
              />
            </div>
          )}

          {/* Slope Input (when solving for Rise or Run) */}
          {(calcMode === 'run' || calcMode === 'rise') && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
                Slope Ratio (1 : X)
              </label>
              <input
                type="number"
                value={slopeRatioVal || ''}
                onChange={(e) => setSlopeRatioVal(Math.max(1, parseFloat(e.target.value) || 0))}
                className="saas-input font-semibold"
                placeholder="X (e.g. 12)"
              />
            </div>
          )}

          {/* Width Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-1.5">
              Ramp Clear Width ({unit === 'imperial' ? 'Inches' : 'Centimeters'})
            </label>
            <input
              type="number"
              value={width || ''}
              onChange={(e) => setWidth(Math.max(1, parseFloat(e.target.value) || 0))}
              className="saas-input"
            />
          </div>
        </div>

        {/* Slope Ratio Presets Helper */}
        <div className="border-t border-zinc-150 dark:border-zinc-800/60 pt-4">
          <span className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-2">
            Standard Slope Ratio Presets
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset(12)}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 transition"
              title="Standard ADA Maximum Slope for public ramps"
            >
              1:12 (ADA Max)
            </button>
            <button
              onClick={() => applyPreset(16)}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 transition"
              title="Recommended ADA Slope for comfort"
            >
              1:16 (ADA Comfort)
            </button>
            <button
              onClick={() => applyPreset(20)}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 transition"
              title="Very gentle easy-climb slope"
            >
              1:20 (Gentle / Easy)
            </button>
            <button
              onClick={() => applyPreset(10)}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 transition"
              title="Residential-only or assisted ramp slope limits"
            >
              1:10 (Residential limit)
            </button>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
              Slope Report
            </span>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Primary Result */}
            <div>
              <span className="text-xs font-semibold text-zinc-400">Calculated Slope Profile</span>
              <div className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white mt-0.5 font-mono flex items-baseline gap-2">
                <span>{results.slopeRatioText}</span>
                <span className="text-xs text-zinc-400 font-semibold font-sans">
                  ({results.slopePercentage}% / {results.slopeAngle}°)
                </span>
              </div>
              <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-2 ${
                results.isAdaCompliant
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500'
              }`}>
                {results.isAdaCompliant ? 'ADA COMPLIANT (< 1:12)' : 'TOO STEEP FOR ADA (> 1:12)'}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Vertical Rise</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                  {results.calculatedRise} {unit === 'imperial' ? 'in' : 'cm'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Horizontal Run</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-300 font-mono">
                  {results.calculatedRun} {unit === 'imperial' ? 'ft' : 'm'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Width Check</span>
                <span className={`font-bold font-mono ${results.isWidthCompliant ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {width} {unit === 'imperial' ? 'in' : 'cm'} ({results.isWidthCompliant ? 'Compliant' : 'Too Narrow'})
                </span>
              </div>
            </div>

            {/* Compliance Alerts */}
            {results.needsIntermediateLanding && (
              <div className="flex gap-2 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs">
                <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Landing Required!</span>
                  Single run rise exceeds 30" (76.2 cm). You must place an intermediate landing.
                </div>
              </div>
            )}

            {/* SVG Visual Diagram */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                Ramp Profile Diagram
              </span>
              <div className="relative w-full h-36 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-850/50 flex items-center justify-center p-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                  <g transform="translate(20, 10)">
                    {/* Background ground line */}
                    <line x1="0" y1="75" x2="270" y2="75" stroke="#71717a" strokeWidth="1" strokeDasharray="3,3" />

                    {/* Triangle Ramp polygon */}
                    <polygon
                      points={`0,75 ${svgRunWidth},75 ${svgRunWidth},${75 - svgRiseHeight}`}
                      className={getSlopeColorClass()}
                      strokeWidth="2"
                    />

                    {/* Horizontal Run label */}
                    <text x={svgRunWidth / 2} y="92" textAnchor="middle" className="fill-zinc-400 dark:fill-zinc-500 text-[10px] font-bold">
                      Run: {results.calculatedRun} {unit === 'imperial' ? 'ft' : 'm'}
                    </text>

                    {/* Vertical Rise label */}
                    <text x={svgRunWidth + 10} y={75 - (svgRiseHeight / 2)} textAnchor="start" dominantBaseline="middle" className="fill-zinc-400 dark:fill-zinc-500 text-[10px] font-bold">
                      Rise: {results.calculatedRise} {unit === 'imperial' ? 'in' : 'cm'}
                    </text>

                    {/* Angle annotation */}
                    <path
                      d={`M 15 75 A 15 15 0 0 0 ${15 * Math.cos(results.slopeAngle * Math.PI / 180)} ${75 - 15 * Math.sin(results.slopeAngle * Math.PI / 180)}`}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="1"
                    />
                    <text x="22" y="70" className="fill-indigo-500 dark:fill-indigo-400 text-[8px] font-extrabold">
                      {results.slopeAngle}°
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Egress/Landing Info */}
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-start gap-2 text-[10px] text-zinc-450 dark:text-zinc-500 leading-relaxed">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-indigo-500" />
          <p>
            ADA/IBC code mandates flat landings at the top and bottom of each ramp run (min 60" length). Ramp slope must not exceed 1:12 (8.33%) for commercial wheelchair access.
          </p>
        </div>
      </div>
    </div>
  );
}
