import { useState, useEffect, useRef } from 'react';
import { Layers, Upload, Download, RotateCcw, AlertCircle } from 'lucide-react';

export default function ImageBlur() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  const [blurRadius, setBlurRadius] = useState<number>(15); // in pixels
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
        setBlurRadius(15);
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw blurred canvas
  useEffect(() => {
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

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Support for HTML5 Canvas filter API (standard in modern browsers)
      if (typeof ctx.filter !== 'undefined') {
        ctx.filter = `blur(${blurRadius}px)`;
        ctx.drawImage(img, 0, 0);
      } else {
        // Fallback draw (unfiltered) if filter is not supported
        ctx.drawImage(img, 0, 0);
      }
    };
  }, [imageSrc, blurRadius]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `blurred_${fileName || 'image.png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Settings Column */}
      <div className="md:col-span-4 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-white text-sm">Blur Settings</h3>
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

        {/* Custom Blur Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
            <span>Blur Intensity</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-mono">{blurRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            disabled={!imageSrc}
            value={blurRadius}
            onChange={(e) => setBlurRadius(parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
          />
        </div>

        {imageSrc && (
          <button
            onClick={handleDownload}
            className="saas-button-primary w-full py-3"
          >
            <Download className="w-4 h-4" />
            <span>Download Blurred</span>
          </button>
        )}
      </div>

      {/* Workspace Preview */}
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
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Upload Image to Blur</span>
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
              <span>Radius: {blurRadius}px</span>
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
