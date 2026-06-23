import { useState, useRef, useEffect } from 'react';
import { Upload, Download, RotateCw, Type, Image as ImageIcon } from 'lucide-react';

export default function FacebookCoverCreator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  
  // Text Overlay properties
  const [headerText, setHeaderText] = useState<string>('Welcome to Our Page');
  const [subheaderText, setSubheaderText] = useState<string>('Community & Innovation');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.3);

  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [quality, setQuality] = useState<number>(0.9);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const TARGET_WIDTH = 820;
  const TARGET_HEIGHT = 312;

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
  }, [imageSrc, zoom, rotation, offsetX, offsetY, headerText, subheaderText, textColor, overlayOpacity, format]);

  const draw = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;

    ctx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    // Default base background
    ctx.fillStyle = format === 'jpeg' ? '#ffffff' : '#09090b';
    ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    // 1. Draw scaled background image
    ctx.save();
    ctx.translate(TARGET_WIDTH / 2, TARGET_HEIGHT / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const scaleX = TARGET_WIDTH / img.width;
    const scaleY = TARGET_HEIGHT / img.height;
    
    // Cover the canvas
    const baseScale = Math.max(scaleX, scaleY);
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

    // 2. Draw semi-transparent color overlay to make text legible
    if (overlayOpacity > 0) {
      ctx.fillStyle = `rgba(15, 23, 42, ${overlayOpacity})`;
      ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
    }

    // 3. Draw text overlays centered
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;

    // Draw header text
    if (headerText.trim()) {
      ctx.font = '800 36px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(headerText.trim(), TARGET_WIDTH / 2, TARGET_HEIGHT / 2 - 20);
    }

    // Draw subheader text
    if (subheaderText.trim()) {
      ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = textColor + 'dd'; // slight alpha
      ctx.fillText(subheaderText.trim(), TARGET_WIDTH / 2, TARGET_HEIGHT / 2 + 25);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, quality);

    const link = document.createElement('a');
    link.download = `facebook-cover-${Date.now()}.${format}`;
    link.href = dataUrl;
    link.click();
  };

  const resetAll = () => {
    setZoom(1);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
    setHeaderText('Welcome to Our Page');
    setSubheaderText('Community & Innovation');
    setTextColor('#ffffff');
    setOverlayOpacity(0.3);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Settings Form */}
      <div className="lg:col-span-5 saas-card p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <Upload className="w-4.5 h-4.5 text-indigo-500" />
          <span>Cover Customization</span>
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
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-250">Drag & Drop Cover Image</p>
            <p className="text-xs text-zinc-450 mt-1">or click to browse local files</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
                <Type className="w-3.5 h-3.5" /> Title / Header Text
              </label>
              <input
                type="text"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                className="saas-input"
                placeholder="Enter title text"
              />
            </div>

            {/* Subheader Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1">
                <Type className="w-3.5 h-3.5" /> Subtitle / Subheader Text
              </label>
              <input
                type="text"
                value={subheaderText}
                onChange={(e) => setSubheaderText(e.target.value)}
                className="saas-input"
                placeholder="Enter subtitle text"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Text Color Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded border border-zinc-200 dark:border-zinc-800 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-20 px-2 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs text-zinc-700 dark:text-zinc-300 font-mono rounded"
                  />
                </div>
              </div>

              {/* Cover Dim Overlay Opacity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase">
                  <span>Overlay Darken</span>
                  <span>{Math.round(overlayOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.9}
                  step={0.05}
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-855 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* Position Zoom Slider */}
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

            {/* Position Y/X offsets */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Position X Offset</label>
                <input
                  type="range"
                  min={-500}
                  max={500}
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-855 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase">Position Y Offset</label>
                <input
                  type="range"
                  min={-200}
                  max={200}
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-855 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
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
                <span>Download Cover</span>
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
          <h3 className="text-base font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-855 mb-4">
            Facebook Cover Layout (820 × 312)
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4 leading-relaxed">
            FB Page Desktop Cover standard formatting. Use text overlays to brand your profile graphic.
          </p>

          <div className="relative w-full rounded-xl bg-zinc-900 overflow-hidden flex items-center justify-center border border-zinc-800 p-4 shadow-inner min-h-[300px]">
            {imageSrc ? (
              <div className="max-w-full border border-zinc-700/50 rounded overflow-hidden flex items-center justify-center shadow-md aspect-[820/312]">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="text-center text-zinc-600 dark:text-zinc-700 space-y-2">
                <ImageIcon className="w-12 h-12 mx-auto opacity-40" />
                <p className="text-sm font-semibold">Workspace is empty</p>
                <p className="text-xs max-w-xs leading-normal">Load a banner photograph to build your custom overlay mockup.</p>
              </div>
            )}
          </div>
        </div>

        {imageSrc && (
          <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-855 flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>Dimensions: {TARGET_WIDTH} x {TARGET_HEIGHT}</span>
            <span className="uppercase text-[10px] font-bold text-indigo-500">Output Active</span>
          </div>
        )}
      </div>
    </div>
  );
}
