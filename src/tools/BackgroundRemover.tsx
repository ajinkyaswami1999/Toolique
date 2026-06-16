import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Upload, Download, RotateCcw, Pipette, AlertCircle } from 'lucide-react';

export default function BackgroundRemover() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  // Chroma key selection
  const [targetColor, setTargetColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [tolerance, setTolerance] = useState<number>(30); // 0-100 threshold
  const [feather, setFeather] = useState<number>(2); // feathering edge
  
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        setTargetColor(null); // click to select background color
      };
      reader.readAsDataURL(file);
    }
  };

  // Perform background keying on canvas
  const processImage = () => {
    if (!imageSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (!targetColor) return;

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const { r: tr, g: tg, b: tb } = targetColor;
      const tolSquared = tolerance * tolerance * 3; // normalized distance

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean distance in RGB color space
        const distSquared = (r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2;

        if (distSquared <= tolSquared) {
          // Inside threshold, make transparent
          if (feather > 0) {
            // Apply smoothing delta transition
            const ratio = distSquared / tolSquared;
            const alpha = Math.min(255, Math.max(0, (ratio - 0.7) / 0.3 * 255));
            data[i + 3] = alpha;
          } else {
            data[i + 3] = 0;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };
  };

  useEffect(() => {
    processImage();
  }, [imageSrc, targetColor, tolerance, feather]);

  // Click on canvas to pick background color
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Translate coordinates from display size to actual natural image size
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setTargetColor({
      r: pixel[0],
      g: pixel[1],
      b: pixel[2]
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `no-bg_${fileName || 'image.png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Settings Panel */}
      <div className="md:col-span-4 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Pipette className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-white text-sm">Background Eraser</h3>
          </div>
          {imageSrc && (
            <button
              onClick={() => {
                setImageSrc(null);
                setFileName('');
                setTargetColor(null);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Reset Upload"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Selected target color */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2">Target Color to Remove</label>
          {targetColor ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div
                className="w-7 h-7 rounded-lg border border-zinc-300 dark:border-zinc-700"
                style={{ backgroundColor: rgbToHex(targetColor.r, targetColor.g, targetColor.b) }}
              />
              <div className="text-xs">
                <span className="font-bold text-zinc-700 dark:text-zinc-350 block">
                  {rgbToHex(targetColor.r, targetColor.g, targetColor.b).toUpperCase()}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  rgb({targetColor.r}, {targetColor.g}, {targetColor.b})
                </span>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 items-center text-xs text-amber-500 font-medium bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <span>Click any pixel on the image to pick background color.</span>
            </div>
          )}
        </div>

        {/* Color tolerance */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
            <span>Color Tolerance</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-mono">{tolerance}</span>
          </div>
          <input
            type="range"
            min="5"
            max="120"
            disabled={!targetColor}
            value={tolerance}
            onChange={(e) => setTolerance(parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
          />
        </div>

        {/* Feather edge smoothing */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
            <span>Edge Smoothing</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-mono">{feather}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            disabled={!targetColor}
            value={feather}
            onChange={(e) => setFeather(parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
          />
        </div>

        {targetColor && (
          <button
            onClick={handleDownload}
            className="saas-button-primary w-full py-3"
          >
            <Download className="w-4 h-4" />
            <span>Download Transparent PNG</span>
          </button>
        )}
      </div>

      {/* Interactive image canvas */}
      <div className="md:col-span-8 p-6 saas-card flex flex-col justify-center items-center min-h-[400px]">
        {error && (
          <div className="mb-4 w-full p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!imageSrc ? (
          <label className="w-full h-full flex flex-col justify-center items-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-300">
            <Upload className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-3" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Upload Image to Erase bg</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">PNG, JPG, WebP supported</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        ) : (
          <div className="space-y-4 w-full flex flex-col items-center">
            {/* Checkerboard transparent background wrapper */}
            <div
              ref={containerRef}
              className="relative max-w-full overflow-auto border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 flex items-center justify-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:16px_16px] bg-zinc-50 dark:bg-zinc-950"
              style={{ maxHeight: '420px', minHeight: '300px' }}
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-w-full h-auto object-contain cursor-crosshair"
                style={{ maxHeight: '380px' }}
              />
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-center">
              Selected image rendered on checkerboard background. Click to erase.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
