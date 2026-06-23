import { useState, useRef, useEffect } from 'react';
import { Upload, Download, RotateCw, Image as ImageIcon } from 'lucide-react';

export default function YouTubeThumbnailResizer() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
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

  const TARGET_WIDTH = 1280;
  const TARGET_HEIGHT = 720;

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
        // Reset controls
        setZoom(1);
        setRotation(0);
        setOffsetX(0);
        setOffsetY(0);
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
    if (!imageSrc || !canvasRef.current) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imageRef.current = img;
      draw();
    };
  }, [imageSrc, zoom, rotation, offsetX, offsetY, fitMode]);

  const draw = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas dimensions to target resolution
    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;

    ctx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    // Fill background (white for JPEG, transparent for PNG by default, but let's make it dark gray for fit borders)
    ctx.fillStyle = format === 'jpeg' ? '#ffffff' : '#09090b';
    ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    ctx.save();
    // Center of canvas
    ctx.translate(TARGET_WIDTH / 2, TARGET_HEIGHT / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate base scale
    const scaleX = TARGET_WIDTH / img.width;
    const scaleY = TARGET_HEIGHT / img.height;
    
    // Fit vs Fill base scale
    const baseScale = fitMode === 'fill' ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
    const finalScale = baseScale * zoom;

    const drawWidth = img.width * finalScale;
    const drawHeight = img.height * finalScale;

    // Draw centering image + offsets
    ctx.drawImage(
      img,
      -drawWidth / 2 + offsetX,
      -drawHeight / 2 + offsetY,
      drawWidth,
      drawHeight
    );

    ctx.restore();
  };

  // Redraw when format changes (for background color toggle)
  useEffect(() => {
    draw();
  }, [format]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, quality);
    
    const link = document.createElement('a');
    link.download = `youtube-thumbnail-${Date.now()}.${format}`;
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
          <span>Upload & Resize Controls</span>
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
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-250">Drag & Drop Thumbnail Image</p>
            <p className="text-xs text-zinc-450 mt-1">or click to browse local files</p>
          </div>
        ) : (
          <div className="space-y-4">
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
                  Fill Frame (Crop)
                </button>
                <button
                  onClick={() => setFitMode('fit')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    fitMode === 'fit'
                      ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                      : 'bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  Fit Frame (Letterbox)
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
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
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
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Offsets positioning */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Position X Offset</label>
                <input
                  type="range"
                  min={-600}
                  max={600}
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Position Y Offset</label>
                <input
                  type="range"
                  min={-400}
                  max={400}
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* Export Configurations */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">File Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
                  className="saas-select"
                >
                  <option value="png">PNG (Lossless)</option>
                  <option value="jpeg">JPEG (Compressed)</option>
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
                    className="w-full h-1 bg-zinc-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Action buttons */}
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
                <span>Download Thumbnail</span>
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

      {/* Output / Canvas Preview Panel */}
      <div className="lg:col-span-7 saas-card p-6 flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-850 mb-4">
            Canvas Live Preview (1280 × 720)
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4 leading-relaxed">
            Drag the sliders to crop, rotate, and scale. The final image will compile at exactly 1280x720 pixels matching YouTube's guidelines.
          </p>

          <div className="relative w-full rounded-xl bg-zinc-900 overflow-hidden flex items-center justify-center border border-zinc-800 p-2 shadow-inner aspect-[16/9]">
            {imageSrc ? (
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain shadow-md rounded border border-zinc-700/50"
              />
            ) : (
              <div className="text-center text-zinc-600 dark:text-zinc-700 space-y-2">
                <ImageIcon className="w-12 h-12 mx-auto opacity-40" />
                <p className="text-sm font-semibold">Workspace is empty</p>
                <p className="text-xs max-w-xs leading-normal">Upload a thumbnail picture on the left to activate the pixel crop frame.</p>
              </div>
            )}
          </div>
        </div>

        {imageSrc && (
          <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-850 flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>Dimensions: {TARGET_WIDTH} x {TARGET_HEIGHT} (16:9)</span>
            <span className="uppercase text-[10px] font-bold text-indigo-500">Output Active</span>
          </div>
        )}
      </div>
    </div>
  );
}
