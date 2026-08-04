import { useState, useRef } from 'react';
import { Copy, Check, Info, FileCode, Split, Layers, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

interface VectorEntity {
  id: string;
  type: 'line' | 'circle' | 'text';
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  cx?: number;
  cy?: number;
  r?: number;
  text?: string;
  rev: 'A' | 'B' | 'both'; // which revision contains this element
}

// Highly detailed floor plan diff mock dataset
const REVISION_ENTITIES: VectorEntity[] = [
  // Unchanged structural core (both revisions)
  { id: 'u1', type: 'line', x1: 50, y1: 50, x2: 450, y2: 50, rev: 'both' },
  { id: 'u2', type: 'line', x1: 450, y1: 50, x2: 450, y2: 300, rev: 'both' },
  { id: 'u3', type: 'line', x1: 450, y1: 300, x2: 50, y2: 300, rev: 'both' },
  { id: 'u4', type: 'line', x1: 50, y1: 300, x2: 50, y2: 50, rev: 'both' },
  
  // Columns (both revisions)
  { id: 'c1', type: 'circle', cx: 50, cy: 50, r: 6, rev: 'both' },
  { id: 'c2', type: 'circle', cx: 450, cy: 50, r: 6, rev: 'both' },
  { id: 'c3', type: 'circle', cx: 450, cy: 300, r: 6, rev: 'both' },
  { id: 'c4', type: 'circle', cx: 50, cy: 300, r: 6, rev: 'both' },

  // Revision A (Old wall layout to be deleted)
  { id: 'del-wall-1', type: 'line', x1: 250, y1: 50, x2: 250, y2: 300, rev: 'A' },
  { id: 'del-door-1', type: 'line', x1: 250, y1: 180, x2: 220, y2: 150, rev: 'A' },

  // Revision B (New layout additions)
  { id: 'add-wall-1', type: 'line', x1: 180, y1: 50, x2: 180, y2: 300, rev: 'B' },
  { id: 'add-wall-2', type: 'line', x1: 320, y1: 50, x2: 320, y2: 300, rev: 'B' },
  { id: 'add-door-1', type: 'line', x1: 180, y1: 200, x2: 210, y2: 170, rev: 'B' },
  { id: 'add-door-2', type: 'line', x1: 320, y1: 120, x2: 290, y2: 90, rev: 'B' },

  // Text labels
  { id: 't-main', type: 'text', cx: 120, cy: 35, text: 'REV COMPARISON BLUEPRINT', rev: 'both' },
  { id: 't-revA', type: 'text', cx: 280, cy: 150, text: 'OLD OFFICE ZONE', rev: 'A' },
  { id: 't-revB-1', type: 'text', cx: 100, cy: 150, text: 'CABIN A', rev: 'B' },
  { id: 't-revB-2', type: 'text', cx: 370, cy: 150, text: 'CABIN B', rev: 'B' }
];

export default function DrawingRevisionComparator() {
  const [entities] = useState<VectorEntity[]>(REVISION_ENTITIES);
  const [viewMode, setViewMode] = useState<'overlay' | 'sweep' | 'revA' | 'revB'>('sweep');
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0-100
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sweep mouse-drag slider controller
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode !== 'sweep' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const calculateStats = () => {
    const total = entities.length;
    const additions = entities.filter((e) => e.rev === 'B').length;
    const deletions = entities.filter((e) => e.rev === 'A').length;
    const unchanged = entities.filter((e) => e.rev === 'both').length;

    const matchPercent = total > 0 ? (unchanged / (unchanged + additions + deletions)) * 100 : 100;

    return {
      total,
      additions,
      deletions,
      unchanged,
      matchPercent: Number(matchPercent.toFixed(1))
    };
  };

  const stats = calculateStats();

  const copyReport = () => {
    const text = `CAD Drawing Revision Comparison Audit
----------------------------------------
Drawing Match Coefficient: ${stats.matchPercent}%
Total Vector Elements: ${stats.total} items

Revision Difference Inventory:
- Added elements (Revision B): ${stats.additions} items (Green)
- Deleted elements (Revision A): ${stats.deletions} items (Red)
- Unchanged structural lines: ${stats.unchanged} items (Slate)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to render SVG entities based on active revision view modes
  const renderSvgEntities = (revFilter: 'A' | 'B' | 'both' | 'all') => {
    return entities
      .filter((e) => {
        if (revFilter === 'all') return true;
        if (revFilter === 'both') return e.rev === 'both';
        return e.rev === revFilter || e.rev === 'both';
      })
      .map((e) => {
        let strokeColor = '#475569'; // Slate for unchanged
        if (e.rev === 'A') strokeColor = '#f43f5e'; // Red for deletions
        else if (e.rev === 'B') strokeColor = '#10b981'; // Green for additions

        if (e.type === 'line' && e.x1 !== undefined && e.y1 !== undefined && e.x2 !== undefined && e.y2 !== undefined) {
          return (
            <line
              key={e.id}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        } else if (e.type === 'circle' && e.cx !== undefined && e.cy !== undefined && e.r !== undefined) {
          return (
            <circle
              key={e.id}
              cx={e.cx}
              cy={e.cy}
              r={e.r}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
            />
          );
        } else if (e.type === 'text' && e.cx !== undefined && e.cy !== undefined && e.text) {
          return (
            <text
              key={e.id}
              x={e.cx}
              y={e.cy}
              fill={strokeColor}
              fontSize="7.5"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {e.text}
            </text>
          );
        }
        return null;
      });
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* File & Viewport Config Column */}
      <div className="lg:col-span-8 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span>Interactive CAD Revision Comparator</span>
            </span>

            <div className="flex gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold cursor-pointer transition">
                <span>Upload Base (Rev A)</span>
                <input type="file" className="hidden" />
              </label>
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold cursor-pointer transition">
                <span>Upload New (Rev B)</span>
                <input type="file" className="hidden" />
              </label>
            </div>
          </h3>

          {/* Viewport sweep toggles */}
          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              {(['sweep', 'overlay', 'revA', 'revB'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition ${
                    viewMode === mode
                      ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-650'
                  }`}
                >
                  {mode === 'sweep' ? 'Sweep Split' : mode === 'revA' ? 'Rev A Only' : mode === 'revB' ? 'Rev B Only' : 'Overlay Diff'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold">
              {viewMode === 'sweep' ? (
                <>
                  <Split className="w-3.5 h-3.5 text-indigo-500 animate-bounce" />
                  <span>Drag mouse inside box to sweep split divider</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>Color Legend: Green = Added | Red = Deleted | Slate = Common</span>
                </>
              )}
            </div>
          </div>

          {/* Sweep comparative viewport */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative w-full aspect-[16/10] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-inner select-none cursor-ew-resize"
          >
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none" />

            {/* Sweep split mode rendering */}
            {viewMode === 'sweep' ? (
              <>
                {/* Left Side: Revision A (Deletions) */}
                <div className="absolute inset-0">
                  <svg className="w-full h-full p-6" viewBox="0 0 500 350">
                    {renderSvgEntities('A')}
                  </svg>
                </div>

                {/* Right Side: Revision B (Additions) */}
                <div
                  style={{
                    clipPath: `polygon(${sliderPos}% 0%, 100% 0%, 100% 100%, ${sliderPos}% 100%)`
                  }}
                  className="absolute inset-0 bg-zinc-950/40"
                >
                  {/* Grid Pattern inside clipped area to prevent redraw blank */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none" />
                  <svg className="w-full h-full p-6" viewBox="0 0 500 350">
                    {renderSvgEntities('B')}
                  </svg>
                </div>

                {/* Visual vertical slider bar handle */}
                <div
                  style={{ left: `${sliderPos}%` }}
                  className="absolute inset-y-0 w-1 bg-indigo-500 shadow-[0_0_10px_#6366f1] z-20 flex items-center justify-center"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-white shadow flex items-center justify-center text-white">
                    <Sliders className="w-3 h-3" />
                  </div>
                </div>
              </>
            ) : (
              // Non-sweep rendering
              <svg className="w-full h-full p-6" viewBox="0 0 500 350">
                {viewMode === 'overlay' && renderSvgEntities('all')}
                {viewMode === 'revA' && renderSvgEntities('A')}
                {viewMode === 'revB' && renderSvgEntities('B')}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Revision schedule ledger panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Delta Registry</span>
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
                <span className="text-xs text-zinc-455">Drawing Match Coefficient</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {stats.matchPercent}%
                </div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded mt-2 border text-emerald-500 bg-emerald-500/10 border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Overlay Alignment: OK</span>
                </div>
              </div>

              {/* Revision list */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Difference Statistics</span>
                <div className="flex justify-between">
                  <span className="text-zinc-450">Common elements</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{stats.unchanged}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-2.5">
                  <span className="text-rose-500 font-semibold">Removed (Rev A)</span>
                  <span className="font-bold font-mono text-rose-500">{stats.deletions}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-2.5">
                  <span className="text-emerald-500 font-semibold">Added (Rev B)</span>
                  <span className="font-bold font-mono text-emerald-500">{stats.additions}</span>
                </div>
              </div>

              {/* Log ledger list */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Change Event Log</span>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  <div className="p-2 rounded bg-rose-500/5 text-rose-500 border border-rose-500/10 text-[10px] leading-relaxed">
                    Removed interior wall (X: 250) dividing central office block.
                  </div>
                  <div className="p-2 rounded bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 text-[10px] leading-relaxed">
                    Added Cabin A enclosure partition wall (X: 180).
                  </div>
                  <div className="p-2 rounded bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 text-[10px] leading-relaxed">
                    Added Cabin B enclosure partition wall (X: 320).
                  </div>
                  <div className="p-2 rounded bg-emerald-500/5 text-emerald-500 border border-emerald-500/10 text-[10px] leading-relaxed">
                    Added fire exits Cabin doors (180, 200) and (320, 120).
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Drawing revisions highlight modifications clearly to align building contractors. Red segments indicate deleted entities, whereas green highlights correspond to new layout updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}