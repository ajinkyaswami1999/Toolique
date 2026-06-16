import { useState, useEffect, useRef } from 'react';
import { RotateCw, Upload, Download, RotateCcw, AlertCircle } from 'lucide-react';

export default function ImageRotator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  const [angle, setAngle] = useState<number>(0); // Custom angle in degrees
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // File selection
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
        setAngle(0);
        setFlipH(false);
        setFlipV(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Redraw canvas preview when parameters change
  useEffect(() => {
    if (!imageSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      // Calculate coordinates and canvas dimensions based on rotation angle
      const rad = (angle * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      
      const newWidth = img.width * cos + img.height * sin;
      const newHeight = img.width * sin + img.height * cos;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Setup drawing matrix
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      
      // Draw centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
    };
  }, [imageSrc, angle, flipH, flipV]);

  // Bulk rotation steps
  const rotateStep = (deg: number) => {
    setAngle((prev) => (prev + deg + 360) % 360);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rotated_${fileName || 'image.png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Configuration & Controls */}
      <div className="md:col-span-4 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <RotateCw className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-white text-sm">Rotator Controls</h3>
          </div>
          {imageSrc && (
            <button
              onClick={() => {
                setImageSrc(null);
                setFileName('');
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Reset Upload"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dynamic bulk rotation buttons */}
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-zinc-400">Transform actions</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => rotateStep(-90)}
              disabled={!imageSrc}
              className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold transition hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40"
            >
              Rotate -90&deg;
            </button>
            <button
              onClick={() => rotateStep(90)}
              disabled={!imageSrc}
              className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold transition hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40"
            >
              Rotate 90&deg;
            </button>
            <button
              onClick={() => setFlipH(!flipH)}
              disabled={!imageSrc}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition disabled:opacity-40 ${
                flipH
                  ? 'border-indigo-650 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              Flip Horizontal
            </button>
            <button
              onClick={() => setFlipV(!flipV)}
              disabled={!imageSrc}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition disabled:opacity-40 ${
                flipV
                  ? 'border-indigo-650 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              Flip Vertical
            </button>
          </div>
        </div>

        {/* Custom slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
            <span>Rotation Angle</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-mono">{angle}&deg;</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            disabled={!imageSrc}
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
          />
        </div>

        {imageSrc && (
          <button
            onClick={handleDownload}
            className="saas-button-primary w-full py-3"
          >
            <Download className="w-4 h-4" />
            <span>Download Rotated</span>
          </button>
        )}
      </div>

      {/* Image Preview Area */}
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
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Upload Image to Rotate</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">PNG, JPG, WebP supported</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        ) : (
          <div className="space-y-4 w-full flex flex-col items-center justify-center">
            {/* Meta details */}
            <div className="flex justify-between items-center w-full px-2 text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
              <span>File: {fileName}</span>
              <span>Angle: {angle}&deg;</span>
            </div>

            <div
              className="relative max-w-full overflow-auto border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-zinc-950/5 flex items-center justify-center"
              style={{ maxHeight: '420px', minHeight: '300px' }}
            >
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto object-contain"
                style={{ maxHeight: '380px' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
