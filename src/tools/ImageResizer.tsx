import { useState } from 'react';
import { Sliders, Upload, Download, RotateCcw, Lock, Unlock, AlertCircle } from 'lucide-react';

export default function ImageResizer() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [percentage, setPercentage] = useState<number>(100);
  const [error, setError] = useState<string | null>(null);

  // Load image file
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setError(null);
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + ' KB');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          setOriginalWidth(img.width);
          setOriginalHeight(img.height);
          setWidth(img.width);
          setHeight(img.height);
          setPercentage(100);
          setImageSrc(img.src);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Width changes
  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspectRatio && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(val * ratio));
    }
  };

  // Height changes
  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspectRatio && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(val * ratio));
    }
  };

  // Resize percentage changes
  const handlePercentageChange = (pct: number) => {
    setPercentage(pct);
    const newWidth = Math.round((originalWidth * pct) / 100);
    const newHeight = Math.round((originalHeight * pct) / 100);
    setWidth(newWidth);
    setHeight(newHeight);
  };

  // Download resized image
  const handleDownload = () => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `resized_${fileName || 'image.png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Configuration & Controls */}
      <div className="md:col-span-4 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-white text-sm">Resize Controls</h3>
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

        {/* Input Dimensions */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-550 mb-1.5">Width (px)</label>
              <input
                type="number"
                disabled={!imageSrc}
                value={width || ''}
                onChange={(e) => handleWidthChange(Math.max(1, parseInt(e.target.value) || 0))}
                className="saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-550 mb-1.5">Height (px)</label>
              <input
                type="number"
                disabled={!imageSrc}
                value={height || ''}
                onChange={(e) => handleHeightChange(Math.max(1, parseInt(e.target.value) || 0))}
                className="saas-input"
              />
            </div>
          </div>

          {/* Aspect Ratio Constraint */}
          <button
            onClick={() => setLockAspectRatio(!lockAspectRatio)}
            disabled={!imageSrc}
            className={`w-full flex items-center justify-center gap-2 py-2 border rounded-xl text-xs font-bold transition ${
              lockAspectRatio
                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{lockAspectRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}</span>
          </button>
        </div>

        {/* Preset Percentage resizing */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2.5">Scale Preset (%)</label>
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handlePercentageChange(pct)}
                disabled={!imageSrc}
                className={`py-1.5 rounded-xl border text-xs font-bold transition disabled:opacity-40 ${
                  percentage === pct
                    ? 'border-indigo-600 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Custom slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
            <span>Scale Slider</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-mono">{percentage}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            disabled={!imageSrc}
            value={percentage}
            onChange={(e) => handlePercentageChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
          />
        </div>

        {imageSrc && (
          <button
            onClick={handleDownload}
            className="saas-button-primary w-full py-3"
          >
            <Download className="w-4 h-4" />
            <span>Download Resized</span>
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
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Upload Image to Resize</span>
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
            {/* Meta tags details info */}
            <div className="flex justify-between items-center w-full px-2 text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
              <span>File: {fileName}</span>
              <span>Size: {fileSize}</span>
              <span>Dimensions: {originalWidth}x{originalHeight} px</span>
            </div>

            <div
              className="relative max-w-full overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-zinc-950/5 flex items-center justify-center"
              style={{ maxHeight: '400px' }}
            >
              <img
                src={imageSrc}
                alt="Source preview"
                className="max-w-full h-auto object-contain"
                style={{ maxHeight: '380px' }}
              />
            </div>

            <div className="text-xs text-zinc-400 font-semibold">
              Target Resolution: <span className="text-indigo-555 dark:text-indigo-400 font-mono font-bold">{width} x {height} px</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
