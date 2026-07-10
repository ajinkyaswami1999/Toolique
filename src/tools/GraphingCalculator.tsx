import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, ZoomIn, ZoomOut, Save, Download, LineChart } from 'lucide-react';
import * as math from 'mathjs';
import SEO from '../components/SEO';

interface FunctionRow {
  id: string;
  expr: string;
  color: string;
  visible: boolean;
}

const PLOT_COLORS = ['#6366f1', '#a855f7', '#ef4444', '#10b981', '#f59e0b', '#3b82f6'];

export default function GraphingCalculator() {
  const [functions, setFunctions] = useState<FunctionRow[]>(() => {
    const saved = localStorage.getItem('graphing_funcs');
    return saved ? JSON.parse(saved) : [
      { id: '1', expr: 'x^2', color: PLOT_COLORS[0], visible: true },
      { id: '2', expr: 'sin(x)', color: PLOT_COLORS[1], visible: true }
    ];
  });

  const [minX, setMinX] = useState<number>(-10);
  const [maxX, setMaxX] = useState<number>(10);
  const [minY, setMinY] = useState<number>(-6);
  const [maxY, setMaxY] = useState<number>(6);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; px: number; py: number } | null>(null);

  // Load viewport settings from localstorage
  useEffect(() => {
    const savedLimits = localStorage.getItem('graphing_limits');
    if (savedLimits) {
      const parsed = JSON.parse(savedLimits);
      setMinX(parsed.minX ?? -10);
      setMaxX(parsed.maxX ?? 10);
      setMinY(parsed.minY ?? -6);
      setMaxY(parsed.maxY ?? 6);
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('graphing_funcs', JSON.stringify(functions));
    localStorage.setItem('graphing_limits', JSON.stringify({ minX, maxX, minY, maxY }));
    alert('Graph configurations saved successfully!');
  };

  const addFunctionRow = () => {
    const nextColor = PLOT_COLORS[functions.length % PLOT_COLORS.length];
    setFunctions([
      ...functions,
      { id: Date.now().toString(), expr: '', color: nextColor, visible: true }
    ]);
  };

  const removeFunctionRow = (id: string) => {
    setFunctions(functions.filter(f => f.id !== id));
  };

  const updateFunctionExpression = (id: string, newExpr: string) => {
    setFunctions(functions.map(f => (f.id === id ? { ...f, expr: newExpr } : f)));
  };

  const toggleVisibility = (id: string) => {
    setFunctions(functions.map(f => (f.id === id ? { ...f, visible: !f.visible } : f)));
  };

  // Render plot on Canvas
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Detect theme colors
    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isDark ? '#09090b' : '#fafafa';
    const gridColor = isDark ? '#1f2937' : '#e5e7eb';
    const axisColor = isDark ? '#e5e7eb' : '#1f2937';
    const labelColor = isDark ? '#9ca3af' : '#4b5563';

    // Clear background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Coord mapping helpers
    const getPxX = (xVal: number) => ((xVal - minX) / (maxX - minX)) * width;
    const getPxY = (yVal: number) => height - ((yVal - minY) / (maxY - minY)) * height;

    const getValX = (pxX: number) => minX + (pxX / width) * (maxX - minX);

    // Draw Grid
    if (showGrid) {
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      ctx.font = '10px monospace';
      ctx.fillStyle = labelColor;

      // X grid & labels
      const rangeX = maxX - minX;
      const stepX = Math.pow(10, Math.floor(Math.log10(rangeX))) / 2 || 1;
      const startX = Math.floor(minX / stepX) * stepX;

      for (let x = startX; x <= maxX; x += stepX) {
        const px = getPxX(x);
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, height);
        ctx.stroke();

        // Print value ticks
        if (Math.abs(x) > 1e-9) {
          ctx.fillText(x.toFixed(1), px + 2, height - 6);
        }
      }

      // Y grid & labels
      const rangeY = maxY - minY;
      const stepY = Math.pow(10, Math.floor(Math.log10(rangeY))) / 2 || 1;
      const startY = Math.floor(minY / stepY) * stepY;

      for (let y = startY; y <= maxY; y += stepY) {
        const py = getPxY(y);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(width, py);
        ctx.stroke();

        if (Math.abs(y) > 1e-9) {
          ctx.fillText(y.toFixed(1), 6, py - 2);
        }
      }
    }

    // Draw X and Y Axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // X Axis
    const axisY = getPxY(0);
    ctx.moveTo(0, axisY);
    ctx.lineTo(width, axisY);
    // Y Axis
    const axisX = getPxX(0);
    ctx.moveTo(axisX, 0);
    ctx.lineTo(axisX, height);
    ctx.stroke();

    // Plot functions
    functions.forEach((fRow) => {
      if (!fRow.visible || !fRow.expr.trim()) return;

      ctx.strokeStyle = fRow.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      let isDrawing = false;
      const stepPx = 1.5; // evaluate every 1.5 pixel for high performance

      for (let px = 0; px <= width; px += stepPx) {
        const x = getValX(px);
        try {
          // evaluate expression
          const y = math.evaluate(fRow.expr, { x });
          if (typeof y === 'number' && !isNaN(y) && isFinite(y)) {
            const py = getPxY(y);
            if (py >= 0 && py <= height) {
              if (!isDrawing) {
                ctx.moveTo(px, py);
                isDrawing = true;
              } else {
                ctx.lineTo(px, py);
              }
            } else {
              isDrawing = false;
            }
          } else {
            isDrawing = false;
          }
        } catch {
          isDrawing = false;
        }
      }
      ctx.stroke();
    });
  };

  useEffect(() => {
    drawGraph();
  }, [functions, minX, maxX, minY, maxY, showGrid]);

  const handleZoom = (factor: number) => {
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const halfSpanX = ((maxX - minX) * factor) / 2;
    const halfSpanY = ((maxY - minY) * factor) / 2;

    setMinX(midX - halfSpanX);
    setMaxX(midX + halfSpanX);
    setMinY(midY - halfSpanY);
    setMaxY(midY + halfSpanY);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const x = minX + (px / canvas.width) * (maxX - minX);
    const y = minY + ((canvas.height - py) / canvas.height) * (maxY - minY);

    setHoverCoord({ x, y, px, py });
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'graph_plot.png';
    link.href = url;
    link.click();
  };

  return (
    <>
      <SEO
        title="Graphing Calculator Online | Multi Function Plotter"
        description="Plot multiple functions on an interactive Cartesian plane. Customize coordinates viewport ranges, zoom, and export graph images."
        keywords={['graphing calculator', 'plot functions online', 'cartesian coordinate plane', 'math grapher']}
      />

      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 mb-6">
        <a
          href="/math-studio"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Math Studio</span>
        </a>
        <div className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold flex items-center gap-1.5">
          <a href="/" className="hover:text-indigo-500 transition-colors">Home</a>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <a href="/math-studio" className="hover:text-indigo-500 transition-colors">Math Studio</a>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">Graphing Calculator</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Graphing Calculator Online
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
              Plot multiple mathematical functions simultaneously on a high-precision coordinate plane grid.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Left Column: Equation Editor rows */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-850 dark:text-zinc-200 uppercase tracking-wider mb-2">
                Function Rows
              </h3>
              
              <div className="space-y-3">
                {functions.map((fRow, idx) => (
                  <div key={fRow.id} className="flex items-center gap-2">
                    <button
                      onClick={() => toggleVisibility(fRow.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold`}
                      style={{
                        borderColor: fRow.color,
                        backgroundColor: fRow.visible ? `${fRow.color}20` : 'transparent',
                        color: fRow.color
                      }}
                    >
                      {idx + 1}
                    </button>
                    <input
                      type="text"
                      value={fRow.expr}
                      onChange={(e) => updateFunctionExpression(fRow.id, e.target.value)}
                      placeholder="e.g. sin(x) * x"
                      className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                    />
                    {functions.length > 1 && (
                      <button
                        onClick={() => removeFunctionRow(fRow.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addFunctionRow}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Equation</span>
                </button>
                <button
                  onClick={saveSettings}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white text-xs font-bold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Layout</span>
                </button>
              </div>
            </div>

            {/* Viewport Range Settings Panel */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-200 uppercase tracking-wider mb-2">
                Coordinate Range Settings
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Min X</label>
                  <input type="number" value={minX} onChange={(e) => setMinX(parseFloat(e.target.value) || -10)} className="w-full p-2 border border-zinc-200 dark:border-zinc-850 rounded-lg font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Max X</label>
                  <input type="number" value={maxX} onChange={(e) => setMaxX(parseFloat(e.target.value) || 10)} className="w-full p-2 border border-zinc-200 dark:border-zinc-850 rounded-lg font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Min Y</label>
                  <input type="number" value={minY} onChange={(e) => setMinY(parseFloat(e.target.value) || -6)} className="w-full p-2 border border-zinc-200 dark:border-zinc-850 rounded-lg font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Max Y</label>
                  <input type="number" value={maxY} onChange={(e) => setMaxY(parseFloat(e.target.value) || 6)} className="w-full p-2 border border-zinc-200 dark:border-zinc-850 rounded-lg font-mono" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="show-grid-chk"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-zinc-300"
                />
                <label htmlFor="show-grid-chk" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Toggle Coordinate Gridlines
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Canvas graphing plot */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Interactive Viewport Plot
                </h4>

                <div className="flex gap-2">
                  <button onClick={() => handleZoom(0.8)} className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 transition-colors">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleZoom(1.2)} className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 transition-colors">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleExportPNG}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PNG</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={300}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={() => setHoverCoord(null)}
                  className="w-full border border-zinc-150 dark:border-zinc-850 rounded-xl cursor-crosshair bg-zinc-50 dark:bg-zinc-950"
                />

                {hoverCoord && (
                  <div
                    className="absolute bg-zinc-900/90 dark:bg-zinc-900/95 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md pointer-events-none"
                    style={{
                      left: `${(hoverCoord.px / 500) * 100}%`,
                      top: `${(hoverCoord.py / 300) * 100 - 15}%`,
                      transform: 'translate(-50%, -100%)'
                    }}
                  >
                    x: {hoverCoord.x.toFixed(3)}, y: {hoverCoord.y.toFixed(3)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
