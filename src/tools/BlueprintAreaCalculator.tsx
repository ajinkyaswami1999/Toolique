import { useState, useRef, useEffect } from 'react';
import { Copy, Check, Info, FileImage, Trash2, Maximize, Square, Pentagon, Compass } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface TracedShape {
  id: string;
  name: string;
  type: 'rectangle' | 'polygon';
  points: Point[];
  areaSqUnits: number; // in unit^2
}

export default function BlueprintAreaCalculator() {
  const [unit, setUnit] = useState<'ft' | 'm'>('ft');
  const [blueprint, setBlueprint] = useState<string | null>(null);
  const [tool, setTool] = useState<'rectangle' | 'polygon' | 'calibrate'>('rectangle');
  
  // Calibration states
  const [calibPoints, setCalibPoints] = useState<Point[]>([]);
  const [calibRealLength, setCalibRealLength] = useState<number>(10);
  const [pixelScale, setPixelScale] = useState<number>(0.1); // Real units per pixel (default)

  // Drawing states
  const [shapes, setShapes] = useState<TracedShape[]>([]);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rectStart, setRectStart] = useState<Point | null>(null);
  const [rectEnd, setRectEnd] = useState<Point | null>(null);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Setup default mock blueprint grid if no image is uploaded
  useEffect(() => {
    drawCanvas();
  }, [blueprint, shapes, currentPoints, rectStart, rectEnd, calibPoints, tool, pixelScale]);

  // Shoelace formula for polygon area
  const getPolygonArea = (pts: Point[]): number => {
    if (pts.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      area += p1.x * p2.y - p2.x * p1.y;
    }
    return Math.abs(area / 2);
  };

  const getRectangleArea = (p1: Point, p2: Point): number => {
    return Math.abs((p2.x - p1.x) * (p2.y - p1.y));
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Background Blueprint image or grid
    if (blueprint) {
      const img = new Image();
      img.src = blueprint;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawOverlays(ctx);
      };
    } else {
      // Default grid blueprint representation
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Default architectural vector outline
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(100, 50, 440, 200); // exterior walls
      ctx.strokeRect(100, 50, 200, 200); // division wall

      // Labels on default layout
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      ctx.fillText('EXTERIOR WALL BOUNDS', 120, 75);
      ctx.fillText('CONCRETE COLUMN A1', 120, 230);
      ctx.fillText('CONCRETE COLUMN B1', 320, 230);

      drawOverlays(ctx);
    }
  };

  const drawOverlays = (ctx: CanvasRenderingContext2D) => {
    // 2. Draw existing completed shapes
    shapes.forEach((shape) => {
      ctx.fillStyle = 'rgba(99, 102, 241, 0.25)'; // Indigo semi-transparent fill
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;

      ctx.beginPath();
      if (shape.type === 'rectangle') {
        const [p1, p2] = shape.points;
        ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else {
        shape.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();

      // Label with area
      const textX = shape.points[0].x;
      const textY = shape.points[0].y - 5;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(`${shape.name}: ${shape.areaSqUnits.toFixed(1)} sq ${unit}`, textX, textY);
    });

    // 3. Draw active drawing outline
    if (tool === 'rectangle' && rectStart && rectEnd) {
      ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(rectStart.x, rectStart.y, rectEnd.x - rectStart.x, rectEnd.y - rectStart.y);
      ctx.fill();
      ctx.stroke();
    }

    if (tool === 'polygon' && currentPoints.length > 0) {
      ctx.strokeStyle = '#a855f7'; // Purple for polygon
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      currentPoints.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Draw point anchors
      ctx.fillStyle = '#a855f7';
      currentPoints.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // 4. Draw calibration vectors
    if (calibPoints.length > 0) {
      ctx.strokeStyle = '#10b981'; // Emerald for calibration
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(calibPoints[0].x, calibPoints[0].y);
      if (calibPoints[1]) {
        ctx.lineTo(calibPoints[1].x, calibPoints[1].y);
      }
      ctx.stroke();

      // Anchors
      ctx.fillStyle = '#10b981';
      calibPoints.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'calibrate') {
      if (calibPoints.length >= 2) {
        setCalibPoints([{ x, y }]);
      } else {
        const nextPts = [...calibPoints, { x, y }];
        setCalibPoints(nextPts);
        if (nextPts.length === 2) {
          // Perform calibration calculation
          const dx = nextPts[1].x - nextPts[0].x;
          const dy = nextPts[1].y - nextPts[0].y;
          const pxDist = Math.sqrt(dx * dx + dy * dy);
          if (pxDist > 0) {
            setPixelScale(calibRealLength / pxDist);
          }
        }
      }
    } else if (tool === 'polygon') {
      // If click is near start point, close polygon
      if (currentPoints.length >= 3) {
        const start = currentPoints[0];
        const dist = Math.sqrt(Math.pow(x - start.x, 2) + Math.pow(y - start.y, 2));
        if (dist < 10) {
          const pixelArea = getPolygonArea(currentPoints);
          const realArea = pixelArea * Math.pow(pixelScale, 2);
          const newShape: TracedShape = {
            id: Date.now().toString(),
            name: `Room ${shapes.length + 1}`,
            type: 'polygon',
            points: currentPoints,
            areaSqUnits: realArea
          };
          setShapes([...shapes, newShape]);
          setCurrentPoints([]);
          return;
        }
      }
      setCurrentPoints([...currentPoints, { x, y }]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'rectangle') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRectStart({ x, y });
    setRectEnd({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'rectangle' || !isDrawing || !rectStart) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRectEnd({ x, y });
  };

  const handleMouseUp = () => {
    if (tool !== 'rectangle' || !isDrawing || !rectStart || !rectEnd) return;
    setIsDrawing(false);

    // Save rectangle shape
    const pixelArea = getRectangleArea(rectStart, rectEnd);
    const realArea = pixelArea * Math.pow(pixelScale, 2);

    // Avoid zero area shapes
    if (realArea > 0.1) {
      const newShape: TracedShape = {
        id: Date.now().toString(),
        name: `Room ${shapes.length + 1}`,
        type: 'rectangle',
        points: [rectStart, rectEnd],
        areaSqUnits: realArea
      };
      setShapes([...shapes, newShape]);
    }

    setRectStart(null);
    setRectEnd(null);
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        setBlueprint(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCanvas = () => {
    setShapes([]);
    setCurrentPoints([]);
    setCalibPoints([]);
    setRectStart(null);
    setRectEnd(null);
  };

  const removeShape = (id: string) => {
    setShapes(shapes.filter((s) => s.id !== id));
  };

  const grandTotal = shapes.reduce((acc, curr) => acc + curr.areaSqUnits, 0);

  const copyReport = () => {
    const text = `Blueprint Area Analysis Report
----------------------------------------
Calibration Scale: 1px = ${pixelScale.toFixed(4)} ${unit}
Total Traced Spaces: ${shapes.length} Rooms

Traced Area Breakdown:
${shapes.map((s) => `- ${s.name}: ${s.areaSqUnits.toFixed(1)} sq ${unit}`).join('\n')}

Grand Total Traced Footprint: ${grandTotal.toFixed(1)} sq ${unit}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-8 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-500 animate-spin-slow" />
              <span>Interactive Blueprint Canvas</span>
            </span>

            <div className="flex gap-2">
              <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold cursor-pointer transition">
                <FileImage className="w-3.5 h-3.5 text-zinc-500" />
                <span>Upload Floor Plan</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={clearCanvas}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-650 hover:bg-rose-700 text-white text-[10px] font-bold transition shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </h3>

          {/* Drafting board toolbar */}
          <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <div className="flex gap-2">
              <button
                onClick={() => setTool('rectangle')}
                className={`px-3 py-1.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                  tool === 'rectangle'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-650'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>Trace Rectangle</span>
              </button>
              <button
                onClick={() => setTool('polygon')}
                className={`px-3 py-1.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                  tool === 'polygon'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-650'
                }`}
              >
                <Pentagon className="w-3.5 h-3.5" />
                <span>Trace Polygon</span>
              </button>
              <button
                onClick={() => setTool('calibrate')}
                className={`px-3 py-1.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                  tool === 'calibrate'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-650'
                }`}
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>Calibrate scale</span>
              </button>
            </div>

            <div className="flex gap-2 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-md">
              {(['ft', 'm'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-2 py-0.5 rounded text-[9px] font-black transition ${
                    unit === u
                      ? 'bg-white dark:bg-zinc-700 text-indigo-650 dark:text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-650'
                  }`}
                >
                  {u === 'ft' ? 'Feet' : 'Meters'}
                </button>
              ))}
            </div>
          </div>

          {/* Scale Calibration Form panel */}
          {tool === 'calibrate' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center justify-between text-xs text-emerald-500">
              <div className="space-y-1">
                <span className="font-bold">Step 1: Click 2 points on canvas to define a scale segment</span>
                <p className="text-[10px] text-emerald-500/80">
                  Current Segment Pixel Width: {calibPoints.length === 2 ? 'CALIBRATED' : 'WAITING FOR 2 CLICKS'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold uppercase shrink-0">Real Distance:</label>
                <input
                  type="number"
                  value={calibRealLength}
                  onChange={(e) => setCalibRealLength(parseFloat(e.target.value) || 10)}
                  className="w-16 saas-input py-1 text-center font-bold text-zinc-950"
                />
              </div>
            </div>
          )}

          {/* Interactive drawing canvas container */}
          <div
            ref={containerRef}
            className="w-full relative bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center cursor-crosshair shadow-inner"
          >
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              onClick={handleCanvasClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="w-full max-w-full"
            />
          </div>
        </div>
      </div>

      {/* Results Ledger Column */}
      <div className="lg:col-span-4 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Traced Area Ledger
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
              <div>
                <span className="text-xs text-zinc-400">Grand Total Traced Area</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {grandTotal.toFixed(1)} <span className="text-sm font-semibold">sq {unit}</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {shapes.length === 0 ? (
                  <div className="text-xs text-zinc-400 text-center py-6 italic">
                    No rooms traced yet. Select a draw tool and trace on the blueprint blueprint above.
                  </div>
                ) : (
                  shapes.map((shape) => (
                    <div key={shape.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/40 p-2 rounded border border-zinc-100 dark:border-zinc-800 text-xs">
                      <div>
                        <div className="font-bold text-zinc-700 dark:text-zinc-300">{shape.name}</div>
                        <div className="text-[9px] text-zinc-450 capitalize font-semibold">{shape.type} trace</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold font-mono text-indigo-650 dark:text-indigo-400">
                          {shape.areaSqUnits.toFixed(1)} sq {unit}
                        </span>
                        <button
                          onClick={() => removeShape(shape.id)}
                          className="text-rose-500 hover:text-rose-650"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  To calibrate, click two points on a known dimension line (like a doorway or scale bar) and enter the length. Traced rectangles/polygons will scale automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}