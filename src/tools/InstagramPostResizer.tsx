import { useState, useRef, useEffect } from 'react';
import { Upload, Download, RotateCw, Image as ImageIcon } from 'lucide-react';

interface CropPreset {
  label: string;
  width: number;
  height: number;
  aspect: string;
}

const PRESETS: Record<string, CropPreset> = {
  square: { label: 'Square (1:1)', width: 1080, height: 1080, aspect: 'aspect-square' },
  portrait: { label: 'Portrait (4:5)', width: 1080, height: 1350, aspect: 'aspect-[4/5]' },
  landscape: { label: 'Landscape (1.91:1)', width: 1080, height: 566, aspect: 'aspect-[1.91/1]' }
};

export default function InstagramPostResizer() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [presetKey, setPresetKey] = useState<string>('square');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [fitMode, setFitMode] = useState<'fill' | 'fit'>('fill');
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState<number>(0.9);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activePreset = PRESETS[presetKey] || PRESETS.square;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadImage(file);
  };

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
        resetAll();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  };

  // Render to canvas
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      draw();
    };
  }, [imageSrc, presetKey, zoom, rotation, offsetX, offsetY, fitMode, format]);

  const draw = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = activePreset.width;
    canvas.height = activePreset.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = format === 'jpeg' ? '#ffffff' : '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const scaleX = canvas.width / img.width;
    const scaleY = canvas.height / img.height;

    const baseScale = fitMode === 'fill' ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
    const finalScale = baseScale * zoom;

    const drawWidth = img.width * finalScale;
    const drawHeight = img.height * finalScale;

    ctx.drawImage(
      img,
      -drawWidth / 2 + offsetX,
      -drawHeight / 2 + offsetY,
      drawWidth,
      drawHeight
    );

    ctx.restore();
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, quality);

    const link = document.createElement('a');
    link.download = `instagram-post-${presetKey}-${Date.now()}.${format}`;
    link.href = dataUrl;
    link.click();
  };

  const resetAll = () => {
    setZoom(1);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
    setFitMode('fill');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Settings Form */}
      <div className="lg:col-span-5 saas-card p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <Upload className="w-4.5 h-4.5 text-indigo-500" />
          <span>Upload & Crop Bounds</span>
        </h3>

        {!imageSrc ? (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 text-center hover:border-indigo-500/50 transition cursor-pointer group bg-zinc-50/50 dark:bg-zinc-950/20"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Upload className="w-10 h-10 text-zinc-400 dark:text-zinc-650 mx-auto mb-3 group-hover:scale-110 transition" />
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-250">Drag & Drop Post Image</p>
            <p className="text-xs text-zinc-450 mt-1">or click to browse local files</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Presets / Aspect Selectors */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase">Aspect Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(PRESETS).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setPresetKey(key);
                      resetAll();
                    }}
                    className={`px-2 py-2 rounded-xl text-[10px] font-bold border transition text-center cursor-pointer ${
                      presetKey === key
                        ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                        : 'bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    {value.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fit mode selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase">Crop Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFitMode('fill')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    fitMode === 'fill'
                      ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                      : 'bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  Fill Frame
                </button>
                <button
                  onClick={() => setFitMode('fit')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    fitMode === 'fit'
                      ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                      : 'bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  Fit Frame
                </button>
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-zinc-550 dark:text-zinc-400">
                <span>Scale Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-855 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Rotation Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-zinc-550 dark:text-zinc-400">
                <span>Rotation Angle</span>
                <span>{rotation}°</span>
              </div>
              <input
                type="range"
                min={-180}
                max={180}
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-855 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Position Y/X offsets */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Position X Offset</label>
                <input
                  type="range"
                  min={-600}
                  max={600}
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-855 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Position Y Offset</label>
                <input
                  type="range"
                  min={-600}
                  max={600}
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-855 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* File format */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">File Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
                  className="saas-select"
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                </select>
              </div>
              {format === 'jpeg' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase">
                    <span>Quality</span>
                    <span>{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={1.0}
                    step={0.05}
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-200 dark:bg-zinc-855 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={resetAll}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={downloadImage}
                className="saas-button-primary flex-grow cursor-pointer"
              >
                <Download className="w-4.5 h-4.5" />
                <span>Download Post</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setImageSrc(null)}
                className="text-[10px] text-zinc-400 hover:text-red-500 font-bold uppercase transition cursor-pointer"
              >
                Upload Different Image
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-7 saas-card p-6 flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-850 mb-4">
            Crop Preview ({activePreset.width} × {activePreset.height})
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4 leading-relaxed">
            Standard resolution template for Instagram feed layouts. Live view scales to fit your current browser pane.
          </p>

          <div className="relative w-full rounded-xl bg-zinc-900 overflow-hidden flex items-center justify-center border border-zinc-800 p-4 shadow-inner min-h-[300px]">
            {imageSrc ? (
              <div className={`max-w-full max-h-[400px] border border-zinc-700/50 rounded overflow-hidden flex items-center justify-center shadow-md ${activePreset.aspect}`}>
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="text-center text-zinc-600 dark:text-zinc-700 space-y-2">
                <ImageIcon className="w-12 h-12 mx-auto opacity-40" />
                <p className="text-sm font-semibold">Workspace is empty</p>
                <p className="text-xs max-w-xs leading-normal">Upload your photo to access sizing grids.</p>
              </div>
            )}
          </div>
        </div>

        {imageSrc && (
          <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-850 flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>Instagram Preset Sizing Active</span>
            <span className="uppercase text-[10px] font-bold text-indigo-500">Output Standard</span>
          </div>
        )}
      </div>
    </div>
  );
}
