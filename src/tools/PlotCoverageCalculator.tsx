import { useState } from 'react';
import { Copy, Check, Info, ShieldAlert, LayoutGrid } from 'lucide-react';

type UnitType = 'sqft' | 'sqm' | 'sqyd' | 'acres';

const UNIT_LABELS: Record<UnitType, string> = {
  sqft: 'Sq. Feet',
  sqm: 'Sq. Meters',
  sqyd: 'Sq. Yards',
  acres: 'Acres'
};

export default function PlotCoverageCalculator() {
  const [unit, setUnit] = useState<UnitType>('sqft');
  const [plotArea, setPlotArea] = useState<number>(4000);
  const [footprintArea, setFootprintArea] = useState<number>(1600);
  const [accessoryArea, setAccessoryArea] = useState<number>(200);
  const [permissibleLimit, setPermissibleLimit] = useState<number>(50); // %
  const [copied, setCopied] = useState(false);

  // Conversion helpers (normalize to sqft for math, then format back)
  const getAreaInSqFt = (val: number, u: UnitType) => {
    if (u === 'sqm') return val * 10.7639;
    if (u === 'sqyd') return val * 9;
    if (u === 'acres') return val * 43560;
    return val;
  };

  const plotInSqFt = getAreaInSqFt(plotArea, unit);
  const footprintInSqFt = getAreaInSqFt(footprintArea, unit);
  const accessoryInSqFt = getAreaInSqFt(accessoryArea, unit);

  const totalBuiltFootprint = footprintInSqFt + accessoryInSqFt;
  const coveragePercent = plotInSqFt > 0 ? (totalBuiltFootprint / plotInSqFt) * 100 : 0;
  const maxPermissibleFootprint = plotArea * (permissibleLimit / 100);
  const remainingOpenArea = Math.max(0, plotArea - (footprintArea + accessoryArea));
  
  const isCompliant = coveragePercent <= permissibleLimit;

  // Visual scaling factor for the CSS simulation box
  // Scale building footprint relative to the square root of the coverage fraction
  const footprintSideScale = plotInSqFt > 0 ? Math.min(100, Math.sqrt(totalBuiltFootprint / plotInSqFt) * 100) : 0;

  const copyReport = () => {
    const text = `Plot Coverage Compliance Audit
----------------------------------------
Plot Area: ${plotArea} ${UNIT_LABELS[unit]}
Building Footprint Area: ${footprintArea} ${UNIT_LABELS[unit]}
Accessory Structures Area: ${accessoryArea} ${UNIT_LABELS[unit]}
Total Ground Footprint: ${footprintArea + accessoryArea} ${UNIT_LABELS[unit]}

Actual Ground Coverage: ${coveragePercent.toFixed(2)}%
Permissible Limit: ${permissibleLimit}%
Status: ${isCompliant ? 'COMPLIANT (Within Limits)' : 'NON-COMPLIANT (Limit Exceeded)'}
Max Permissible Ground Footprint: ${maxPermissibleFootprint.toFixed(1)} ${UNIT_LABELS[unit]}
Remaining Open Space: ${remainingOpenArea.toFixed(1)} ${UNIT_LABELS[unit]}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Input Form Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-500" />
            <span>Site Dimensions & Zoning Guidelines</span>
          </h3>

          <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-sm">
            {(Object.keys(UNIT_LABELS) as UnitType[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition ${
                  unit === u
                    ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-650'
                }`}
              >
                {UNIT_LABELS[u]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Total Plot Area
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={plotArea}
                  onChange={(e) => setPlotArea(parseFloat(e.target.value) || 0)}
                  className="saas-input pr-12"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-zinc-400 uppercase">
                  {unit}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Ground Building Footprint
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={footprintArea}
                  onChange={(e) => setFootprintArea(parseFloat(e.target.value) || 0)}
                  className="saas-input pr-12"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-zinc-400 uppercase">
                  {unit}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Accessory Spaces (Decks, Sheds, Pools)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={accessoryArea}
                  onChange={(e) => setAccessoryArea(parseFloat(e.target.value) || 0)}
                  className="saas-input pr-12"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-zinc-400 uppercase">
                  {unit}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Permissible Coverage Limit (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={permissibleLimit}
                  max={100}
                  min={1}
                  onChange={(e) => setPermissibleLimit(parseFloat(e.target.value) || 0)}
                  className="saas-input pr-12 font-bold font-mono"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold text-zinc-400">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {[
              { label: 'Residential Zone (40%)', val: 40 },
              { label: 'Commercial Zone (60%)', val: 60 },
              { label: 'Industrial Zone (75%)', val: 75 }
            ].map((preset) => (
              <button
                key={preset.val}
                onClick={() => setPermissibleLimit(preset.val)}
                className="px-3 py-1.5 rounded-lg bg-zinc-55 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[10px] font-bold text-zinc-500 transition"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Interactive Ground Plan Simulator</h3>
          <p className="text-xs text-zinc-400">
            Below is a top-down visual simulation of your plot. The blue/shaded box represents your total built footprint relative to the green/open plot boundary.
          </p>

          <div className="relative w-full aspect-[16/9] bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl overflow-hidden flex items-center justify-center p-4 shadow-inner">
            <div className="absolute top-3 left-3 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
              PLOT AREA ({plotArea} {unit})
            </div>

            {/* Building Block */}
            {footprintSideScale > 0 && (
              <div
                style={{
                  width: `${footprintSideScale}%`,
                  height: `${footprintSideScale}%`,
                  maxHeight: '100%',
                  maxWidth: '100%'
                }}
                className={`rounded-lg border-2 shadow-lg transition-all duration-300 flex items-center justify-center ${
                  isCompliant
                    ? 'bg-indigo-500/15 border-indigo-500 text-indigo-650 dark:text-indigo-400'
                    : 'bg-rose-500/20 border-rose-500 text-rose-650 dark:text-rose-400'
                }`}
              >
                <div className="text-center p-2">
                  <div className="text-[10px] font-black uppercase tracking-wider">Built Footprint</div>
                  <div className="text-xs font-bold font-mono mt-0.5">
                    {coveragePercent.toFixed(1)}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Compliance Panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Compliance Results
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
                <span className="text-xs text-zinc-400">Actual Ground Coverage</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {coveragePercent.toFixed(1)}%
                </div>
                <div
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md mt-2 ${
                    isCompliant
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}
                >
                  {!isCompliant && <ShieldAlert className="w-3 h-3" />}
                  <span>
                    {isCompliant ? 'COMPLIANT WITH ZONING CODE' : 'EXCEEDS PERMISSIBLE COVERAGE'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Max Permissible Coverage Limit</span>
                  <span className="font-bold font-mono">{permissibleLimit}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400 font-semibold">Max Ground Footprint Allowed</span>
                  <span className="font-bold font-mono text-indigo-500">
                    {maxPermissibleFootprint.toFixed(1)} {unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Proposed Footprint</span>
                  <span className="font-bold font-mono">
                    {(footprintArea + accessoryArea).toFixed(1)} {unit}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <span className="text-zinc-400">Mandatory Open Area Space</span>
                  <span className="font-bold font-mono text-emerald-500">
                    {remainingOpenArea.toFixed(1)} {unit}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-xs text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Ground coverage is calculated as the ratio of building footprint area on the ground floor to the total site plot area. Common bylaws require at least 40-50% open green buffer space for natural storm permeability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}