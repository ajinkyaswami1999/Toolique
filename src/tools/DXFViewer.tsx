import { useState, useRef, useEffect } from 'react';
import { Copy, Check, Info, FileCode, Layers, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface DxfEntity {
  id: string;
  type: 'LINE' | 'CIRCLE' | 'TEXT' | 'ARC';
  layer: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  cx?: number;
  cy?: number;
  r?: number;
  text?: string;
  color?: string;
}

// Detailed architectural floor plan default vector dataset
const MOCK_DXF_ENTITIES: DxfEntity[] = [
  // Walls Layer
  { id: '1', type: 'LINE', layer: 'WALLS', x1: 50, y1: 50, x2: 450, y2: 50, color: '#38bdf8' },
  { id: '2', type: 'LINE', layer: 'WALLS', x1: 450, y1: 50, x2: 450, y2: 300, color: '#38bdf8' },
  { id: '3', type: 'LINE', layer: 'WALLS', x1: 450, y1: 300, x2: 50, y2: 300, color: '#38bdf8' },
  { id: '4', type: 'LINE', layer: 'WALLS', x1: 50, y1: 300, x2: 50, y2: 50, color: '#38bdf8' },
  // Division wall
  { id: '5', type: 'LINE', layer: 'WALLS', x1: 250, y1: 50, x2: 250, y2: 300, color: '#38bdf8' },

  // Doors Layer
  { id: '6', type: 'LINE', layer: 'DOORS', x1: 250, y1: 200, x2: 210, y2: 170, color: '#f43f5e' },
  { id: '7', type: 'ARC', layer: 'DOORS', cx: 250, cy: 200, r: 40, color: '#f43f5e' }, // Door swing representation

  // Columns / Circles Layer
  { id: '8', type: 'CIRCLE', layer: 'COLUMNS', cx: 50, cy: 50, r: 8, color: '#eab308' },
  { id: '9', type: 'CIRCLE', layer: 'COLUMNS', cx: 450, cy: 50, r: 8, color: '#eab308' },
  { id: '10', type: 'CIRCLE', layer: 'COLUMNS', cx: 450, cy: 300, r: 8, color: '#eab308' },
  { id: '11', type: 'CIRCLE', layer: 'COLUMNS', cx: 50, cy: 300, r: 8, color: '#eab308' },
  { id: '12', type: 'CIRCLE', layer: 'COLUMNS', cx: 250, cy: 50, r: 8, color: '#eab308' },
  { id: '13', type: 'CIRCLE', layer: 'COLUMNS', cx: 250, cy: 300, r: 8, color: '#eab308' },

  // Text Annotations Layer
  { id: '14', type: 'TEXT', layer: 'TEXT', cx: 120, cy: 150, text: 'OFFICE SPACE 1', color: '#94a3b8' },
  { id: '15', type: 'TEXT', layer: 'TEXT', cx: 300, cy: 150, text: 'CONFERENCE RM', color: '#94a3b8' },
  { id: '16', type: 'TEXT', layer: 'TEXT', cx: 220, cy: 40, text: 'CAD ELEVATION SCHEMATIC', color: '#6366f1' }
];

export default function DXFViewer() {
  const [entities, setEntities] = useState<DxfEntity[]>(MOCK_DXF_ENTITIES);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    WALLS: true,
    DOORS: true,
    COLUMNS: true,
    TEXT: true
  });
  
  // Viewport transformation states
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Extract all unique layers from current entities list
  const uniqueLayers = Array.from(new Set(entities.map((e) => e.layer)));

  useEffect(() => {
    // Ensure all unique layers have a visibility state
    const nextLayers = { ...activeLayers };
    let changed = false;
    uniqueLayers.forEach((l) => {
      if (nextLayers[l] === undefined) {
        nextLayers[l] = true;
        changed = true;
      }
    });
    if (changed) setActiveLayers(nextLayers);
  }, [entities]);

  useEffect(() => {
    drawCanvas();
  }, [entities, activeLayers, zoom, pan]);

  // Clean, lightweight text-based DXF parsing algorithm
  const parseDxf = (text: string) => {
    const lines = text.split(/\r?\n/);
    const parsed: DxfEntity[] = [];
    let current: Partial<DxfEntity> | null = null;
    let code = '';

    for (let i = 0; i < lines.length; i++) {
      const val = lines[i].trim();
      if (i % 2 === 0) {
        code = val;
      } else {
        if (code === '0') {
          if (current && current.type) {
            const temp = { ...current } as DxfEntity;
            if (!temp.id) temp.id = Math.random().toString();
            parsed.push(temp);
          }
          if (['LINE', 'CIRCLE', 'TEXT', 'ARC'].includes(val)) {
            current = { type: val as any, layer: '0' };
          } else {
            current = null;
          }
        } else if (current) {
          if (code === '8') current.layer = val;
          else if (code === '10') {
            if (current.type === 'CIRCLE' || current.type === 'TEXT' || current.type === 'ARC') current.cx = parseFloat(val);
            else current.x1 = parseFloat(val);
          } else if (code === '20') {
            if (current.type === 'CIRCLE' || current.type === 'TEXT' || current.type === 'ARC') current.cy = parseFloat(val);
            else current.y1 = parseFloat(val);
          } else if (code === '11') current.x2 = parseFloat(val);
          else if (code === '21') current.y2 = parseFloat(val);
          else if (code === '40') current.r = parseFloat(val);
          else if (code === '1') current.text = val;
        }
      }
    }
    if (current && current.type) {
      const temp = { ...current } as DxfEntity;
      if (!temp.id) temp.id = Math.random().toString();
      parsed.push(temp);
    }

    if (parsed.length > 0) {
      setEntities(parsed);
      autoFit(parsed);
    } else {
      alert('Could not find compatible vector entities (LINE, CIRCLE, ARC, TEXT) in DXF file.');
    }
  };

  const autoFit = (list: DxfEntity[]) => {
    // Find bounding box to fit drawing to screen
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    list.forEach((e) => {
      const xs = [e.x1, e.x2, e.cx].filter((x) => x !== undefined) as number[];
      const ys = [e.y1, e.y2, e.cy].filter((y) => y !== undefined) as number[];
      xs.forEach((x) => {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      });
      ys.forEach((y) => {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
    });

    if (minX !== Infinity && canvasRef.current) {
      const dx = maxX - minX;
      const dy = maxY - minY;
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      const scale = Math.min(w / (dx || 1), h / (dy || 1)) * 0.8;
      setZoom(scale);
      setPan({
        x: w / 2 - (minX + dx / 2) * scale,
        y: h / 2 - (minY + dy / 2) * scale
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        parseDxf(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Drawing viewport setups
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a'; // CAD slate black background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Apply pan & zoom translation
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    entities.forEach((e) => {
      if (!activeLayers[e.layer]) return; // Skip hidden layers

      ctx.strokeStyle = e.color || '#38bdf8';
      ctx.fillStyle = e.color || '#38bdf8';
      ctx.lineWidth = 1.5 / zoom; // Maintain sharp line thickness across zooms

      if (e.type === 'LINE' && e.x1 !== undefined && e.y1 !== undefined && e.x2 !== undefined && e.y2 !== undefined) {
        ctx.beginPath();
        ctx.moveTo(e.x1, e.y1);
        ctx.lineTo(e.x2, e.y2);
        ctx.stroke();
      } else if (e.type === 'CIRCLE' && e.cx !== undefined && e.cy !== undefined && e.r !== undefined) {
        ctx.beginPath();
        ctx.arc(e.cx, e.cy, e.r, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (e.type === 'ARC' && e.cx !== undefined && e.cy !== undefined && e.r !== undefined) {
        ctx.beginPath();
        ctx.arc(e.cx, e.cy, e.r, 0, Math.PI / 2); // default quarter swing
        ctx.stroke();
      } else if (e.type === 'TEXT' && e.cx !== undefined && e.cy !== undefined && e.text) {
        ctx.font = `${10 / zoom}px monospace`;
        ctx.fillText(e.text, e.cx, e.cy);
      }
    });

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(20, z * zoomFactor));
    } else {
      setZoom((z) => Math.max(0.1, z / zoomFactor));
    }
  };

  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const copyReport = () => {
    const text = `DXF Vector CAD Analysis
----------------------------------------
Total Parsed Entities: ${entities.length} items
Lines Count: ${entities.filter((e) => e.type === 'LINE').length} lines
Circles Count: ${entities.filter((e) => e.type === 'CIRCLE').length} columns
Total Layers: ${uniqueLayers.join(', ')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* File & Viewport Config */}
      <div className="lg:col-span-8 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-500" />
              <span>Interactive DXF Vector Viewer</span>
            </span>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold cursor-pointer transition">
              <span>Open DXF File</span>
              <input
                type="file"
                accept=".dxf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </h3>

          {/* Viewport controls */}
          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <div className="flex gap-2">
              <button
                onClick={() => setZoom((z) => Math.min(20, z * 1.2))}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-indigo-650"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.1, z / 1.2))}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-indigo-650"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-450 hover:text-indigo-650 text-[9px] font-bold"
              >
                Reset Scale
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-bold">
              <Move className="w-3.5 h-3.5" />
              <span>Click & Drag canvas to PAN | Scroll mouse wheel to ZOOM</span>
            </div>
          </div>

          {/* Canvas viewport container */}
          <div className="relative w-full aspect-[16/10] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center cursor-move shadow-inner">
            <canvas
              ref={canvasRef}
              width={640}
              height={400}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              className="w-full max-w-full"
            />
          </div>
        </div>
      </div>

      {/* Layer Panel Column */}
      <div className="lg:col-span-4 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>CAD Layers Control</span>
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Layers switches */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Visible Layers</span>
                {uniqueLayers.map((layer) => (
                  <div
                    key={layer}
                    onClick={() => toggleLayer(layer)}
                    className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded border border-zinc-100 dark:border-zinc-800 text-xs cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition"
                  >
                    <span className="font-bold text-zinc-700 dark:text-zinc-350">{layer}</span>
                    <input
                      type="checkbox"
                      checked={!!activeLayers[layer]}
                      readOnly
                      className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              {/* Vector specs */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Vector Statistics</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Entities</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{entities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Line Vectors</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {entities.filter((e) => e.type === 'LINE').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Column Coordinates</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">
                    {entities.filter((e) => e.type === 'CIRCLE').length}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  This ASCII DXF parser extracts geometry blocks directly. Click and drag the viewport window to pan vector graphics, or scroll to zoom details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}