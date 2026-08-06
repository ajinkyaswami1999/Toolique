import { useState, useRef } from 'react';
import { Copy, Check, Info, ShieldCheck, Ruler, Trash2, RotateCcw, MousePointerClick } from 'lucide-react';

type ModeType = 'regular' | 'irregular';
type UnitType = 'm' | 'ft';

interface Point {
  x: number;
  y: number;
}

const DEFAULT_VERTICES: Point[] = [
  { x: 100, y: 100 },
  { x: 300, y: 80 },
  { x: 380, y: 220 },
  { x: 200, y: 320 },
  { x: 80, y: 260 }
];

export default function PolygonAreaCalculator() {
  const [mode, setMode] = useState<ModeType>('regular');
  const [unit, setUnit] = useState<UnitType>('m');

  // Regular Polygon States
  const [sides, setSides] = useState<number>(5); // Pentagon default
  const [sideLength, setSideLength] = useState<number>(6); // meters or feet

  // Irregular Polygon States
  const [vertices, setVertices] = useState<Point[]>(DEFAULT_VERTICES);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<SVGSVGElement>(null);

  // Shoelace (Gauss's) Area Formula
  const calculateIrregularArea = (pts: Point[]) => {
    const n = pts.length;
    if (n < 3) return 0;
    let area = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += pts[i].x * pts[j].y;
      area -= pts[j].x * pts[i].y;
    }
    return Math.abs(area) / 2;
  };

  const calculateIrregularPerimeter = (pts: Point[]) => {
    const n = pts.length;
    if (n < 2) return 0;
    let perimeter = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
  };

  const calculate = () => {
    if (mode === 'regular') {
      const n = sides;
      const s = sideLength;
      
      // Area = 0.25 * n * s^2 * cot(pi/n)
      const area = 0.25 * n * Math.pow(s, 2) * (1 / Math.tan(Math.PI / n));
      const perimeter = n * s;
      
      // Apothem = s / (2 * tan(pi/n))
      const apothem = s / (2 * Math.tan(Math.PI / n));
      const interiorAngle = ((n - 2) * 180) / n;
      const exteriorAngle = 360 / n;

      return {
        area: Number(area.toFixed(2)),
        perimeter: Number(perimeter.toFixed(2)),
        apothem: Number(apothem.toFixed(2)),
        interiorAngle: Number(interiorAngle.toFixed(1)),
        exteriorAngle: Number(exteriorAngle.toFixed(1))
      };
    } else {
      // Irregular Mode (scaled coordinates for representation)
      // Standard drawing boundary matches 500x380 viewport.
      // Assume 10px = 1 unit for readable area scaling
      const scale = 20; // 20px = 1 meter
      const pixelArea = calculateIrregularArea(vertices);
      const pixelPerimeter = calculateIrregularPerimeter(vertices);

      return {
        area: Number((pixelArea / (scale * scale)).toFixed(2)),
        perimeter: Number((pixelPerimeter / scale).toFixed(2)),
        apothem: 0,
        interiorAngle: 0,
        exteriorAngle: 0
      };
    }
  };

  const results = calculate();

  // Click on Canvas to add Irregular Vertices
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== 'irregular' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    
    // Add point
    setVertices((prev) => [...prev, { x, y }]);
  };

  const clearVertices = () => {
    setVertices([]);
  };

  const removeVertex = (idx: number) => {
    setVertices((prev) => prev.filter((_, i) => i !== idx));
  };

  // Helper to generate regular polygon vertices for SVG rendering
  const getRegularSvgPoints = () => {
    const cx = 250;
    const cy = 190;
    const r = 120;
    const pts: Point[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      pts.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      });
    }
    return pts;
  };

  const handleUnitChange = (newUnit: UnitType) => {
    const factor = newUnit === 'ft' ? 3.28084 : 1 / 3.28084;
    setUnit(newUnit);
    if (mode === 'regular') {
      setSideLength(Number((sideLength * factor).toFixed(2)));
    }
  };

  const copyReport = () => {
    const areaUnit = `sq ${unit}`;
    const lenUnit = unit;
    
    let text = ``;
    if (mode === 'regular') {
      text = `Regular Polygon Geometry Audit (${sides}-sides)
----------------------------------------
Side Length: ${sideLength} ${lenUnit}
Calculated Properties:
- Total Surface Area: ${results.area} ${areaUnit}
- Total Perimeter: ${results.perimeter} ${lenUnit}
- Apothem Radius: ${results.apothem} ${lenUnit}
- Interior Angle: ${results.interiorAngle}°
- Exterior Angle: ${results.exteriorAngle}°`;
    } else {
      text = `Irregular Polygon Coordinate Area Audit
----------------------------------------
Vertices Count: ${vertices.length} coordinates
Calculated Properties:
- Computed Area (Shoelace): ${results.area} ${areaUnit}
- Total Perimeter: ${results.perimeter} ${lenUnit}

Vertices Coordinate Registry:
${vertices.map((v, i) => ` - Vertex ${i + 1}: (${v.x}, ${v.y})`).join('\n')}`;
    }

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
            <span>Polygon Area Configuration</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Polygon Category
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {(['regular', 'irregular'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                      mode === m
                        ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Scale Unit System
              </label>
              <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                {(['m', 'ft'] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                      unit === u
                        ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-650'
                    }`}
                  >
                    {u === 'm' ? 'Meters' : 'Feet'}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'regular' ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                  Number of Sides
                </label>
                <input
                  type="number"
                  min="3"
                  max="12"
                  value={sides}
                  onChange={(e) => setSides(Math.max(3, Math.min(12, parseInt(e.target.value) || 3)))}
                  className="saas-input font-bold"
                />
              </div>
            ) : (
              <div className="flex items-end justify-end">
                <button
                  onClick={clearVertices}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition w-full justify-center"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Clear Vertices</span>
                </button>
              </div>
            )}
          </div>

          {mode === 'regular' && (
            <div className="border-t pt-4">
              <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                Regular Side Length ({unit})
              </label>
              <input
                type="number"
                value={sideLength}
                onChange={(e) => setSideLength(parseFloat(e.target.value) || 0)}
                className="saas-input font-bold"
              />
            </div>
          )}
        </div>

        {/* Interactive CAD Vector Canvas */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-sm flex items-center justify-between">
            <span>Interactive CAD Geometry Viewport</span>
            {mode === 'irregular' && (
              <span className="flex items-center gap-1 text-[9px] text-indigo-500 font-bold uppercase tracking-wider">
                <MousePointerClick className="w-3.5 h-3.5 animate-bounce" />
                <span>Click inside grid to plot vertices</span>
              </span>
            )}
          </h3>

          <div className="relative w-full aspect-[16/10] bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden select-none">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 pointer-events-none" />

            {/* SVG Render Workspace */}
            <svg
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              viewBox="0 0 500 380"
            >
              {mode === 'regular' ? (
                <>
                  {/* Render regular polygon */}
                  <polygon
                    points={getRegularSvgPoints().map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="rgba(99, 102, 241, 0.1)"
                    stroke="#6366f1"
                    strokeWidth="3"
                  />
                  {/* Geometric Center indicator */}
                  <circle cx="250" cy="190" r="4" fill="#3b82f6" />
                  
                  {/* Apothem radius line */}
                  <line
                    x1="250"
                    y1="190"
                    x2="250"
                    y2="70"
                    stroke="#eab308"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <text x="255" y="130" fill="#eab308" fontSize="8" fontFamily="monospace" fontWeight="bold">
                    Apothem
                  </text>
                </>
              ) : (
                <>
                  {/* Render irregular polygon vertices */}
                  {vertices.length > 0 && (
                    <polygon
                      points={vertices.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill="rgba(99, 102, 241, 0.1)"
                      stroke="#6366f1"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Vertices circles */}
                  {vertices.map((p, idx) => (
                    <g key={idx}>
                      <circle cx={p.x} cy={p.y} r="5" fill="#eab308" stroke="#ffffff" strokeWidth="1.5" />
                      <text x={p.x + 8} y={p.y - 8} fill="#94a3b8" fontSize="7" fontFamily="monospace">
                        P{idx + 1}({vName(p.x)},{vName(p.y)})
                      </text>
                    </g>
                  ))}
                </>
              )}
            </svg>
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
                <span>Geometric Properties</span>
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
                <span className="text-xs text-zinc-455">Total Surface Area</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {results.area} <span className="text-sm font-semibold">sq {unit}</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Geometry Specs</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Perimeter</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {results.perimeter} {unit}
                  </span>
                </div>
                {mode === 'regular' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Apothem Length</span>
                      <span className="font-bold font-mono text-zinc-950 dark:text-white">
                        {results.apothem} {unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Interior Angle</span>
                      <span className="font-bold font-mono text-indigo-500">
                        {results.interiorAngle}°
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Exterior Angle</span>
                      <span className="font-bold font-mono text-zinc-950 dark:text-white">
                        {results.exteriorAngle}°
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Active Vertex Count</span>
                    <span className="font-bold font-mono text-indigo-500">
                      {vertices.length} vertices
                    </span>
                  </div>
                )}
              </div>

              {/* Vertex registry list for Irregular mode */}
              {mode === 'irregular' && (
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2.5 text-xs">
                  <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Vertex Coordinate Register</span>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {vertices.map((pt, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80">
                        <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                          P{idx + 1}: X: {vName(pt.x)}, Y: {vName(pt.y)}
                        </span>
                        <button
                          onClick={() => removeVertex(idx)}
                          className="text-rose-500 hover:text-rose-600 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {vertices.length === 0 && (
                      <div className="text-center text-zinc-400 italic text-[10px] py-4">
                        No vertices plotted. Click the canvas grid above to add coordinate nodes.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  Shoelace area integration computes precise plane surface boundaries. Useful for calculating site coverage, plot dimensions, and concrete slab volumes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Coordinate formatter helper
function vName(val: number): number {
  return Math.round(val / 2);
}