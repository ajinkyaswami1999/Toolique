import { useState, useEffect, useRef } from 'react';
import { Pipette, Upload, Copy, Check, RotateCcw, AlertCircle } from 'lucide-react';

interface ColorInfo {
  hex: string;
  rgb: string;
  hsl: string;
}

export default function ImageColorPicker() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  const [pickedColor, setPickedColor] = useState<ColorInfo>({
    hex: '#6366F1',
    rgb: 'rgb(99, 102, 241)',
    hsl: 'hsl(239, 84%, 67%)',
  });

  const [hoverColor, setHoverColor] = useState<string>('#6366F1');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  // File upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setError(null);
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setHistory([]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw image to canvas
  useEffect(() => {
    if (!imageSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  }, [imageSrc]);

  // Color coordinate converters helpers
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const rgbToHsl = (r: number, g: number, b: number): string => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  // Mouse interaction for magnifying glass and hover color selection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
      setMousePos((prev) => ({ ...prev, visible: false }));
      return;
    }

    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true });

    // Read pixel color
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hexColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
    setHoverColor(hexColor);

    // Draw magnifying zoom grid
    const zoomCanvas = zoomCanvasRef.current;
    if (zoomCanvas) {
      const zCtx = zoomCanvas.getContext('2d');
      if (zCtx) {
        zCtx.imageSmoothingEnabled = false;
        zCtx.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);
        
        // Draw zoomed area from main canvas
        const zoomSize = 9; // 9x9 grid
        zCtx.drawImage(
          canvas,
          x - Math.floor(zoomSize / 2),
          y - Math.floor(zoomSize / 2),
          zoomSize,
          zoomSize,
          0,
          0,
          zoomCanvas.width,
          zoomCanvas.height
        );

        // Draw crosshair grid lines
        zCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        zCtx.lineWidth = 1;
        
        const cellW = zoomCanvas.width / zoomSize;
        const cellH = zoomCanvas.height / zoomSize;

        // Center pixel border
        zCtx.strokeStyle = '#ff0055';
        zCtx.lineWidth = 1.5;
        zCtx.strokeRect(
          Math.floor(zoomSize / 2) * cellW,
          Math.floor(zoomSize / 2) * cellH,
          cellW,
          cellH
        );
      }
    }
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, visible: false }));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    const hsl = rgbToHsl(pixel[0], pixel[1], pixel[2]);

    setPickedColor({ hex, rgb, hsl });
    
    // Add to history list
    setHistory((prev) => {
      const clean = prev.filter(c => c !== hex);
      return [hex, ...clean].slice(0, 8);
    });
  };

  const handleCopy = (text: string, tag: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTag(tag);
      setTimeout(() => setCopiedTag(null), 2000);
    });
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Sidebar Controls */}
      <div className="md:col-span-4 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Pipette className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-white text-sm">Color Specs</h3>
          </div>
          {imageSrc && (
            <button
              onClick={() => {
                setImageSrc(null);
                setFileName('');
                setHistory([]);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Reset Upload"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Selected color display */}
        <div className="space-y-4">
          <div
            className="w-full h-16 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-inner transition-colors duration-200"
            style={{ backgroundColor: pickedColor.hex }}
          />

          {/* Copyable formats */}
          <div className="space-y-2 text-xs">
            {[
              { id: 'hex', label: 'HEX', val: pickedColor.hex },
              { id: 'rgb', label: 'RGB', val: pickedColor.rgb },
              { id: 'hsl', label: 'HSL', val: pickedColor.hsl }
            ].map((fmt) => (
              <div key={fmt.id} className="flex items-center justify-between p-2 rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-950/20">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">{fmt.label}</span>
                  <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">{fmt.val}</span>
                </div>
                <button
                  onClick={() => handleCopy(fmt.val, fmt.id)}
                  className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-450 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  {copiedTag === fmt.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Color History Palette builder */}
        {history.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">Picked History Palette</label>
            <div className="flex flex-wrap gap-2.5">
              {history.map((hex, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    setPickedColor({
                      hex,
                      rgb: `rgb(${r}, ${g}, ${b})`,
                      hsl: rgbToHsl(r, g, b),
                    });
                  }}
                  className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm transition hover:scale-115 active:scale-95"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload and Workspace details */}
      <div className="md:col-span-8 p-6 saas-card flex flex-col justify-center items-center min-h-[400px] relative">
        {error && (
          <div className="mb-4 w-full p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!imageSrc ? (
          <label className="w-full h-full flex flex-col justify-center items-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-300">
            <Upload className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-3" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Upload Image to Pick Colors</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-550 mt-1">PNG, JPG, WebP supported</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        ) : (
          <div className="space-y-4 w-full flex flex-col items-center justify-center relative">
            <div className="flex justify-between items-center w-full px-2 text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
              <span>File: {fileName}</span>
            </div>

            {/* Canvas wrapper container */}
            <div
              className="relative max-w-full overflow-auto border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-zinc-950/5 flex items-center justify-center"
              style={{ maxHeight: '420px', minHeight: '300px' }}
            >
              <canvas
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleCanvasClick}
                className="max-w-full h-auto object-contain cursor-crosshair"
                style={{ maxHeight: '380px' }}
              />

              {/* Magnifying Glass Zoom Overlay (Floating next to cursor) */}
              {mousePos.visible && (
                <div
                  className="absolute pointer-events-none w-24 h-24 rounded-full border-2 border-white shadow-xl overflow-hidden bg-zinc-900 z-30"
                  style={{
                    left: `${mousePos.x + 15}px`,
                    top: `${mousePos.y + 15}px`,
                  }}
                >
                  <canvas ref={zoomCanvasRef} width={96} height={96} className="w-full h-full block" />
                  {/* Hex tag inside zoom window */}
                  <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-bold text-center text-white py-0.5 font-mono">
                    {hoverColor}
                  </div>
                </div>
              )}
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-center">
              Hover mouse cursor over image to zoom. Click to pick color values.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
