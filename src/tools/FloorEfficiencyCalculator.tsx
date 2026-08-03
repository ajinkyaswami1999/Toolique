import { useState } from 'react';
import { Copy, Check, Info, Layout, ShieldCheck } from 'lucide-react';

type UnitType = 'sqft' | 'sqm';

export default function FloorEfficiencyCalculator() {
  const [unit, setUnit] = useState<UnitType>('sqft');
  const [grossArea, setGrossArea] = useState<number>(12000);
  const [shaftsArea, setShaftsArea] = useState<number>(1200); // stairs & elevators
  const [hvacArea, setHvacArea] = useState<number>(400); // HVAC & electrical closets
  const [restroomsArea, setRestroomsArea] = useState<number>(600); // toilets
  const [corridorsArea, setCorridorsArea] = useState<number>(1000); // corridors & lobbies
  const [structuralArea, setStructuralArea] = useState<number>(300); // columns & walls
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const totalCoreArea = shaftsArea + hvacArea + restroomsArea + corridorsArea + structuralArea;
    const netUsableArea = Math.max(0, grossArea - totalCoreArea);
    const efficiencyPct = grossArea > 0 ? (netUsableArea / grossArea) * 100 : 0;

    // Visual scale factor for the central core box (square root of core fraction)
    const coreSideScale = grossArea > 0 ? Math.min(85, Math.sqrt(totalCoreArea / grossArea) * 100) : 0;

    // Calculate relative percentages of core compartments for the layout sizing
    const totalCoreDeductions = shaftsArea + hvacArea + restroomsArea;
    const shaftsPct = totalCoreDeductions > 0 ? (shaftsArea / totalCoreDeductions) * 100 : 33;
    const hvacPct = totalCoreDeductions > 0 ? (hvacArea / totalCoreDeductions) * 100 : 33;
    const restroomsPct = totalCoreDeductions > 0 ? (restroomsArea / totalCoreDeductions) * 100 : 33;

    return {
      totalCoreArea,
      netUsableArea,
      efficiencyPct,
      coreSideScale,
      shaftsPct,
      hvacPct,
      restroomsPct
    };
  };

  const results = calculate();

  const getEfficiencyRating = (pct: number) => {
    if (pct >= 85) return { label: 'Excellent Efficiency (Optimal floorplate design)', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' };
    if (pct >= 75) return { label: 'Good/Average Efficiency (Standard commercial layout)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Low Efficiency (High core footprint / complex shape)', color: 'text-rose-500 bg-rose-500/10 border-rose-500/30' };
  };

  const rating = getEfficiencyRating(results.efficiencyPct);

  const copyReport = () => {
    const text = `Floor Efficiency Audit Report
----------------------------------------
Gross Floor Area: ${grossArea} ${unit === 'sqft' ? 'Sq. Ft' : 'm²'}
Total Core Deductions: ${results.totalCoreArea} ${unit === 'sqft' ? 'Sq. Ft' : 'm²'}
- Stairs & Elevators: ${shaftsArea}
- Mechanical/HVAC Closets: ${hvacArea}
- Common Restrooms: ${restroomsArea}
- Corridors & Lobbies: ${corridorsArea}
- Columns & Walls: ${structuralArea}

Net Usable Area: ${results.netUsableArea.toFixed(1)} ${unit === 'sqft' ? 'Sq. Ft' : 'm²'}
Floor Space Efficiency: ${results.efficiencyPct.toFixed(1)}%
Efficiency Rating: ${rating.label}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-500" />
            <span>Floor Dimensions & Deductions</span>
          </h3>

          <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg max-w-[200px]">
            {(['sqft', 'sqm'] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-1 rounded-md text-xs font-bold transition ${
                  unit === u
                    ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-650'
                }`}
              >
                {u === 'sqft' ? 'Sq. Feet' : 'Sq. Meters'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
              Gross Floor Area (GFA)
            </label>
            <input
              type="number"
              value={grossArea}
              onChange={(e) => setGrossArea(parseFloat(e.target.value) || 0)}
              className="saas-input font-bold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Stairs & Elevator Shafts
              </label>
              <input
                type="number"
                value={shaftsArea}
                onChange={(e) => setShaftsArea(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Mechanical / HVAC / Electrical Closets
              </label>
              <input
                type="number"
                value={hvacArea}
                onChange={(e) => setHvacArea(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">
                Common Restrooms
              </label>
              <input
                type="number"
                value={restroomsArea}
                onChange={(e) => setRestroomsArea(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Corridors & Lobbies
              </label>
              <input
                type="number"
                value={corridorsArea}
                onChange={(e) => setCorridorsArea(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Columns & Internal Walls
              </label>
              <input
                type="number"
                value={structuralArea}
                onChange={(e) => setStructuralArea(parseFloat(e.target.value) || 0)}
                className="saas-input"
              />
            </div>
          </div>
        </div>

        {/* Live CSS Interactive Layout Simulator */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm">Visual Floorplate Core Simulator</h3>
          <p className="text-xs text-zinc-400">
            Advanced architectural sheet model showing structural grids, lift core shafts, and restroom divisions.
          </p>

          <div className="relative w-full aspect-[16/9] bg-slate-900 border-4 border-slate-700 rounded-2xl flex items-center justify-center p-8 shadow-2xl overflow-hidden">
            {/* Architectural Blueprint Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none" />

            {/* Coordinate Rulers */}
            {/* Top Row: 1 2 3 4 5 */}
            <div className="absolute top-2 left-10 right-10 flex justify-between text-[9px] font-bold text-slate-500 pointer-events-none">
              <span>01</span>
              <span>02</span>
              <span>03</span>
              <span>04</span>
              <span>05</span>
            </div>
            {/* Left Column: A B C D */}
            <div className="absolute left-2 top-8 bottom-8 flex flex-col justify-between text-[9px] font-bold text-slate-500 pointer-events-none">
              <span>A</span>
              <span>B</span>
              <span>C</span>
              <span>D</span>
            </div>

            {/* Blueprint outer boundary tick marks */}
            <div className="absolute top-0 bottom-0 left-6 border-l border-slate-700/50 pointer-events-none" />
            <div className="absolute top-6 left-0 right-0 border-t border-slate-700/50 pointer-events-none" />

            <div className="absolute bottom-3 left-8 text-[9px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              SHEET: A-102 | SCALE: 1:100 | {grossArea} {unit}
            </div>

            {/* Simulated Corridor circulation loop surrounding the core */}
            {results.coreSideScale > 0 && (
              <div
                style={{
                  width: `${results.coreSideScale + 14}%`,
                  height: `${results.coreSideScale + 14}%`,
                  maxHeight: '92%',
                  maxWidth: '92%'
                }}
                className="border-2 border-dashed border-indigo-500/30 rounded-xl flex items-center justify-center relative p-3 transition-all duration-300 pointer-events-none"
              >
                {/* Corridor Label */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-indigo-400/80 uppercase tracking-widest bg-slate-900 px-2">
                  Corridor Loop
                </div>

                {/* Central Service Core block */}
                <div
                  style={{
                    width: '100%',
                    height: '100%'
                  }}
                  className="bg-rose-950/30 border-2 border-rose-500 rounded-lg flex transition-all duration-300 overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                >
                  {/* Partitions inside Core */}
                  {/* 1. Elevators/Stairs Shafts */}
                  {shaftsArea > 0 && (
                    <div
                      style={{ width: `${results.shaftsPct}%` }}
                      className="border-r-2 border-rose-500/50 flex flex-col justify-around items-center p-1.5 bg-rose-500/5"
                    >
                      {/* Stairs Tread pattern */}
                      <div className="w-full h-2/5 border border-rose-500/30 rounded relative overflow-hidden bg-rose-950/20">
                        <svg className="w-full h-full text-rose-500/30" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="3" />
                          <line x1="0" y1="40" x2="100" y2="40" stroke="currentColor" strokeWidth="3" />
                          <line x1="0" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="3" />
                          <line x1="0" y1="80" x2="100" y2="80" stroke="currentColor" strokeWidth="3" />
                          <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="5" />
                        </svg>
                      </div>

                      {/* Elevator shaft boxes */}
                      <div className="flex gap-1 justify-center w-full">
                        <div className="w-6 h-6 border border-rose-500/40 rounded flex items-center justify-center text-[9px] font-black text-rose-500 bg-rose-950/40">🛗</div>
                        <div className="w-6 h-6 border border-rose-500/40 rounded flex items-center justify-center text-[9px] font-black text-rose-500 bg-rose-950/40">🛗</div>
                      </div>
                    </div>
                  )}

                  {/* 2. HVAC & Mech Duct Closets */}
                  {hvacArea > 0 && (
                    <div
                      style={{ width: `${results.hvacPct}%` }}
                      className="border-r-2 border-rose-500/50 flex items-center justify-center p-1 bg-rose-500/10 relative"
                    >
                      {/* Architectural cross lines X for shafts */}
                      <svg className="absolute inset-0 w-full h-full text-rose-500/25 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="3" />
                        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="3" />
                      </svg>
                      <div className="text-center relative z-10 bg-slate-900/80 px-1 rounded border border-rose-500/20">
                        <div className="text-[7px] font-black text-rose-400 uppercase tracking-wider">HVAC</div>
                      </div>
                    </div>
                  )}

                  {/* 3. Restrooms wc */}
                  {restroomsArea > 0 && (
                    <div
                      style={{ width: `${results.restroomsPct}%` }}
                      className="flex items-center justify-center p-1.5 bg-rose-500/5 relative"
                    >
                      {/* Internal separation partition line */}
                      <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-rose-500/30" />
                      <div className="text-center relative z-10">
                        <div className="text-[7px] font-black text-rose-400 uppercase tracking-wider">WC</div>
                        <div className="text-[9px] font-black text-rose-500 mt-1">🚻</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Legend Details */}
          <div className="flex flex-wrap gap-4 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border border-dashed border-indigo-500/40 rounded" />
              <span>Corridor Envelope</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-rose-950/20 border border-rose-500 rounded" />
              <span>Core Shafts / Lifts / WC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-slate-800 border border-slate-600 rounded" />
              <span>Office Usable Space</span>
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
                Efficiency Audit
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
                <span className="text-xs text-zinc-400 font-semibold">Floor Space Efficiency</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.efficiencyPct.toFixed(1)}%
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md mt-2 border ${rating.color}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{rating.label}</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Net Usable Area (NUA)</span>
                  <span className="font-bold font-mono text-emerald-500">
                    {results.netUsableArea.toFixed(1)} {unit === 'sqft' ? 'sq ft' : 'm²'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Dedicated Core Area</span>
                  <span className="font-bold font-mono text-rose-500">
                    {results.totalCoreArea.toFixed(1)} {unit === 'sqft' ? 'sq ft' : 'm²'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <span className="text-zinc-400">Gross Floor Area</span>
                  <span className="font-bold font-mono">{grossArea} {unit === 'sqft' ? 'sq ft' : 'm²'}</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Floor space efficiency ratios indicate the commercial productivity of real estate floorplates. A higher efficiency ratio decreases structural overhead leasing costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}