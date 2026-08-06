import { useState } from 'react';
import { Copy, Check, Info, ShieldCheck, Ruler, ShieldAlert } from 'lucide-react';

type UnitType = 'mm' | 'in';
type StandardType = 'ada' | 'nbc' | 'partM';

interface StandardConfig {
  label: string;
  maxSlopeRatio: number; // e.g. 12 for 1:12
  maxSingleRise: number; // in mm
  minWidth: number; // in mm
  landingLen: number; // in mm
  desc: string;
}

const REGULATORY_STANDARDS: Record<StandardType, StandardConfig> = {
  ada: {
    label: 'ADA Standards (US)',
    maxSlopeRatio: 12, // 1:12 (8.33%)
    maxSingleRise: 762, // 30 inches
    minWidth: 915, // 36 inches
    landingLen: 1525, // 60 inches
    desc: 'Maximum slope is 1:12. A resting landing (min 60" x 60") is required for every 30" (762mm) of rise.'
  },
  nbc: {
    label: 'NBC India (Part 3)',
    maxSlopeRatio: 12, // 1:12 (8.33%)
    maxSingleRise: 750, // 750 mm
    minWidth: 1200, // 1200 mm
    landingLen: 1500, // 1500 mm
    desc: 'Maximum slope is 1:12. Preferred slope is 1:15. Min width is 1200mm (residential) or 1500mm (public).'
  },
  partM: {
    label: 'UK Part M',
    maxSlopeRatio: 12, // depends on rise, max 1:12
    maxSingleRise: 500, // 500 mm limit per run
    minWidth: 1500, // 1500 mm
    landingLen: 1500, // 1500 mm
    desc: 'Maximum slope is 1:12 for rise <= 166mm; 1:15 for rise <= 333mm; and 1:20 for rise <= 500mm.'
  }
};

export default function AccessibleRampCalculator() {
  const [unit, setUnit] = useState<UnitType>('mm');
  const [standard, setStandard] = useState<StandardType>('ada');
  
  // Inputs
  const [totalRise, setTotalRise] = useState<number>(600); // mm or inches
  const [rampWidth, setRampWidth] = useState<number>(1000); // mm or inches
  const [slopeRatio, setSlopeRatio] = useState<number>(12); // e.g. 12 for 1:12
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const config = REGULATORY_STANDARDS[standard];

    // Conversion factor to MM for math validations
    const toMm = unit === 'in' ? 25.4 : 1;
    const totalRiseMm = totalRise * toMm;
    const widthMm = rampWidth * toMm;

    // Check maximum rise limit for intermediate landing platforms
    const maxRiseLimit = config.maxSingleRise;
    const runsCount = Math.max(1, Math.ceil(totalRiseMm / maxRiseLimit));
    const landingCount = runsCount - 1;

    // Single run rise
    const singleRunRiseMm = totalRiseMm / runsCount;

    // Calculate length based on slope ratio (Length = Rise * Ratio)
    const singleRunLenMm = singleRunRiseMm * slopeRatio;
    const totalRampRunLenMm = singleRunLenMm * runsCount;

    // Landing length
    const totalLandingLenMm = landingCount * config.landingLen;
    const overallTotalLenMm = totalRampRunLenMm + totalLandingLenMm;

    // Compliance audits
    const slopeOk = slopeRatio >= config.maxSlopeRatio;
    const widthOk = widthMm >= config.minWidth;
    const isCompliant = slopeOk && widthOk;

    // Handrail requirements (ADA/NBC: rise > 150mm or run > 1800mm)
    const handrailsRequired = totalRiseMm > 150 || (singleRunLenMm > 1800);

    // Scaling back to display units
    const fromMm = unit === 'in' ? 1 / 25.4 : 1;
    const slopePercent = slopeRatio > 0 ? (1 / slopeRatio) * 100 : 0;

    return {
      runs: runsCount,
      landings: landingCount,
      singleRunRise: Number((singleRunRiseMm * fromMm).toFixed(0)),
      singleRunLen: Number((singleRunLenMm * fromMm).toFixed(0)),
      totalRampLength: Number((totalRampRunLenMm * fromMm).toFixed(0)),
      totalLandingLength: Number((totalLandingLenMm * fromMm).toFixed(0)),
      overallTotalLength: Number((overallTotalLenMm * fromMm).toFixed(0)),
      slopePercent: Number(slopePercent.toFixed(2)),
      compliant: isCompliant,
      slopeOk,
      widthOk,
      handrailsRequired,
      minWidthReq: Number((config.minWidth * fromMm).toFixed(0)),
      maxRiseLimitReq: Number((config.maxSingleRise * fromMm).toFixed(0)),
      // visual elements
      angleDeg: Math.atan(1 / slopeRatio) * (180 / Math.PI)
    };
  };

  const results = calculate();

  const handleUnitChange = (newUnit: UnitType) => {
    const factor = newUnit === 'in' ? 1 / 25.4 : 25.4;
    setUnit(newUnit);
    setTotalRise(Number((totalRise * factor).toFixed(0)));
    setRampWidth(Number((rampWidth * factor).toFixed(0)));
  };

  const copyReport = () => {
    const text = `Accessible Ramp Compliance Audit (${REGULATORY_STANDARDS[standard].label})
----------------------------------------
Target Rise: ${totalRise} ${unit} | Ramp Width: ${rampWidth} ${unit}
Ramp Slope: 1:${slopeRatio} (${results.slopePercent}%)

Calculation Summary:
- Number of Ramp Runs: ${results.runs} runs
- Number of Landing Platforms: ${results.landings} landings
- Single Run Horizontal Length: ${results.singleRunLen} ${unit}
- Net Ramp Run Length: ${results.totalRampLength} ${unit}
- Total Landing Length: ${results.totalLandingLength} ${unit}
- Overall Footprint Length: ${results.overallTotalLength} ${unit}

Regulatory Compliance:
- Slope Angle Compliance: ${results.slopeOk ? 'PASS' : 'FAIL (Too steep)'}
- Clearance Width Compliance: ${results.widthOk ? 'PASS' : 'FAIL (Too narrow - min: ' + results.minWidthReq + ' ' + unit + ')'}
- Handrails Required: ${results.handrailsRequired ? 'YES' : 'NO'}
- Overall Layout Audit: ${results.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Parameter Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Ruler className="w-5 h-5 text-indigo-500 animate-pulse" />
            <span>Accessible Ramp Parameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Regulatory Code
              </label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value as StandardType)}
                className="saas-input font-bold"
              >
                {Object.entries(REGULATORY_STANDARDS).map(([k, cfg]) => (
                  <option key={k} value={k}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Scale Unit System
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {(['mm', 'in'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`flex-1 py-1 rounded-md text-xs font-bold transition ${
                      unit === u
                        ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {u === 'mm' ? 'Millimeters' : 'Inches'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Target Slope Ratio (1:X)
              </label>
              <input
                type="number"
                value={slopeRatio}
                onChange={(e) => setSlopeRatio(Math.max(1, parseFloat(e.target.value) || 1))}
                className="saas-input font-bold"
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed italic">
            {REGULATORY_STANDARDS[standard].desc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Total Target Rise ({unit})
              </label>
              <input
                type="number"
                value={totalRise}
                onChange={(e) => setTotalRise(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Clear Ramp Width ({unit})
              </label>
              <input
                type="number"
                value={rampWidth}
                onChange={(e) => setRampWidth(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
          </div>
        </div>

        {/* Dynamic CAD Ramp Elevation drawing */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">2D Elevation Blueprint Simulator</h3>
          <p className="text-xs text-zinc-455">
            Elevation view displaying slope trajectory. If total rise exceeds limits, intermediate resting landings are generated.
          </p>

          <div className="relative w-full aspect-[16/9] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center p-6 shadow-inner overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none" />

            {/* Scale proportional elevation vector */}
            <div className="w-[90%] h-[75%] border border-slate-800/80 rounded bg-zinc-900/10 relative flex items-end justify-start p-6">
              <span className="absolute top-2 left-2 text-[6.5px] font-black text-slate-500 tracking-widest uppercase">
                RAMP ELEVATION ({results.runs} run{results.runs > 1 ? 's' : ''})
              </span>

              {/* Dynamic SVG Elevation Layout */}
              <svg className="w-full h-32 pointer-events-none" viewBox="0 0 500 120" preserveAspectRatio="none">
                {/* Ground Line */}
                <line x1="10" y1="100" x2="490" y2="100" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

                {/* Ramp Trajectory Profile (single or multi run) */}
                {results.runs === 1 ? (
                  <>
                    {/* Slope line */}
                    <line x1="50" y1="100" x2="400" y2="40" stroke="#6366f1" strokeWidth="3" />
                    {/* Upper landing platform */}
                    <line x1="400" y1="40" x2="470" y2="40" stroke="#6366f1" strokeWidth="3" />
                    {/* Handrail parallel lines */}
                    <line x1="50" y1="85" x2="400" y2="25" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="400" y1="25" x2="470" y2="25" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
                    
                    {/* Dimension witness lines */}
                    <line x1="470" y1="40" x2="470" y2="100" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="2 2" />
                    <text x="475" y="75" fill="#94a3b8" fontSize="8" fontFamily="monospace">RISE: {totalRise}{unit}</text>
                  </>
                ) : (
                  <>
                    {/* Multi-run Zig-Zag/Cascading elevation blueprint representation */}
                    {/* Run 1 */}
                    <line x1="50" y1="100" x2="200" y2="70" stroke="#6366f1" strokeWidth="3" />
                    {/* Landing 1 */}
                    <line x1="200" y1="70" x2="260" y2="70" stroke="#6366f1" strokeWidth="3" />
                    {/* Run 2 */}
                    <line x1="260" y1="70" x2="410" y2="40" stroke="#6366f1" strokeWidth="3" />
                    {/* Upper landing */}
                    <line x1="410" y1="40" x2="470" y2="40" stroke="#6366f1" strokeWidth="3" />

                    {/* Intermediate Landing annotation */}
                    <text x="210" y="60" fill="#6366f1" fontSize="6.5" fontFamily="monospace" fontWeight="bold">LANDING</text>
                  </>
                )}

                {/* Disabled Accessibility Wheelchair silhouette overlay */}
                <g className="translate-x-[120px] translate-y-[55px] animate-pulse">
                  <circle cx="12" cy="12" r="5" fill="none" stroke="#6366f1" strokeWidth="1.5" />
                  <line x1="12" y1="7" x2="16" y2="14" stroke="#6366f1" strokeWidth="1.5" />
                  <line x1="16" y1="14" x2="19" y2="14" stroke="#6366f1" strokeWidth="1.5" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Results details panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Accessibility Audit</span>
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
                <span className="text-xs text-zinc-455">Total Footprint Length</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.overallTotalLength} <span className="text-sm font-semibold">{unit}</span>
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border self-start ${
                    results.compliant
                      ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
                      : 'text-amber-500 bg-amber-500/10 border-amber-500/30'
                  }`}>
                    {results.compliant ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                    <span>Ramp Code: {results.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Slope Details</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Target Slope Ratio</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    1:{slopeRatio}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Slope Gradient (%)</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.slopePercent}% ({results.angleDeg.toFixed(1)}°)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Max Permissible Slope Ratio</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    1:{REGULATORY_STANDARDS[standard].maxSlopeRatio}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Layout Breakdown</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Runs Needed</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.runs} ({results.singleRunRise} {unit} rise per run)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Intermediate Landings</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.landings}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Ramp Run Length</span>
                  <span className="font-bold font-mono text-indigo-500">
                    {results.totalRampLength} {unit}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Safety & Railings</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Continuous Handrails</span>
                  <span className={`font-bold ${results.handrailsRequired ? 'text-indigo-500' : 'text-zinc-550'}`}>
                    {results.handrailsRequired ? 'REQUIRED' : 'NOT REQUIRED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Minimum Clear Width</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.minWidthReq} {unit} (Provided: {rampWidth} {unit})
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Accessible ramp slopes are strictly regulated. A 1:12 slope is the maximum allowed rise for accessibility; gentler slopes like 1:15 or 1:20 offer significantly better comfort and safety.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}