import { useState, useEffect, useRef } from 'react';
import { Type, Upload, Download, RotateCcw, Image as ImageIcon, AlertCircle } from 'lucide-react';

type Position = 'tl' | 'tc' | 'tr' | 'ml' | 'cc' | 'mr' | 'bl' | 'bc' | 'br' | 'tile';

export default function ImageWatermark() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  
  // Text options
  const [text, setText] = useState<string>('Toolique Watermark');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [fontSize, setFontSize] = useState<number>(30); // in px
  const [opacity, setOpacity] = useState<number>(50); // percentage
  const [position, setPosition] = useState<Position>('cc');
  
  // Image options
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState<number>(20); // percentage of parent width
  
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // File uploads
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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for logo.');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Redraw preview
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

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Apply watermark
      ctx.save();
      ctx.globalAlpha = opacity / 100;

      if (watermarkType === 'text') {
        // Draw Text
        ctx.fillStyle = textColor;
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textBaseline = 'middle';
        const textWidth = ctx.measureText(text).width;

        // Position coordinates
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        let align: CanvasTextAlign = 'center';

        if (position === 'tl') { x = 20; y = 20 + fontSize/2; align = 'left'; }
        else if (position === 'tc') { x = canvas.width / 2; y = 20 + fontSize/2; align = 'center'; }
        else if (position === 'tr') { x = canvas.width - 20; y = 20 + fontSize/2; align = 'right'; }
        else if (position === 'ml') { x = 20; y = canvas.height / 2; align = 'left'; }
        else if (position === 'cc') { x = canvas.width / 2; y = canvas.height / 2; align = 'center'; }
        else if (position === 'mr') { x = canvas.width - 20; y = canvas.height / 2; align = 'right'; }
        else if (position === 'bl') { x = 20; y = canvas.height - 20 - fontSize/2; align = 'left'; }
        else if (position === 'bc') { x = canvas.width / 2; y = canvas.height - 20 - fontSize/2; align = 'center'; }
        else if (position === 'br') { x = canvas.width - 20; y = canvas.height - 20 - fontSize/2; align = 'right'; }

        ctx.textAlign = align;

        if (position === 'tile') {
          // Tile text watermark across canvas
          const stepX = textWidth + 100;
          const stepY = fontSize + 150;
          ctx.rotate((-20 * Math.PI) / 180);
          
          for (let tx = -canvas.width; tx < canvas.width * 2; tx += stepX) {
            for (let ty = -canvas.height; ty < canvas.height * 2; ty += stepY) {
              ctx.fillText(text, tx, ty);
            }
          }
        } else {
          ctx.fillText(text, x, y);
        }
      } else if (watermarkType === 'image' && logoSrc) {
        // Draw Image Logo
        const logo = new Image();
        logo.src = logoSrc;
        logo.onload = () => {
          const w = (logoSize / 100) * canvas.width;
          const h = (w * logo.height) / logo.width;

          let x = (canvas.width - w) / 2;
          let y = (canvas.height - h) / 2;

          if (position === 'tl') { x = 20; y = 20; }
          else if (position === 'tc') { x = (canvas.width - w) / 2; y = 20; }
          else if (position === 'tr') { x = canvas.width - w - 20; y = 20; }
          else if (position === 'ml') { x = 20; y = (canvas.height - h) / 2; }
          else if (position === 'cc') { x = (canvas.width - w) / 2; y = (canvas.height - h) / 2; }
          else if (position === 'mr') { x = canvas.width - w - 20; y = (canvas.height - h) / 2; }
          else if (position === 'bl') { x = 20; y = canvas.height - h - 20; }
          else if (position === 'bc') { x = (canvas.width - w) / 2; y = canvas.height - h - 20; }
          else if (position === 'br') { x = canvas.width - w - 20; y = canvas.height - h - 20; }

          if (position === 'tile') {
            const stepX = w + 100;
            const stepY = h + 100;
            for (let lx = 0; lx < canvas.width; lx += stepX) {
              for (let ly = 0; ly < canvas.height; ly += stepY) {
                ctx.drawImage(logo, lx, ly, w, h);
              }
            }
          } else {
            ctx.drawImage(logo, x, y, w, h);
          }
          ctx.restore();
        };
        return; // handle restore inside onload to prevent race conditions
      }
      ctx.restore();
    };
  }, [imageSrc, watermarkType, text, textColor, fontSize, opacity, position, logoSrc, logoSize]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `watermarked_${fileName || 'image.png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Configuration panel */}
      <div className="md:col-span-4 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Type className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-white text-sm">Watermark Config</h3>
          </div>
          {imageSrc && (
            <button
              onClick={() => {
                setImageSrc(null);
                setFileName('');
                setLogoSrc(null);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Reset Upload"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tab options */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setWatermarkType('text')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              watermarkType === 'text'
                ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Text</span>
          </button>
          <button
            onClick={() => setWatermarkType('image')}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              watermarkType === 'image'
                ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Logo</span>
          </button>
        </div>

        {/* Text configuration inputs */}
        {watermarkType === 'text' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-550 mb-1.5">Watermark Text</label>
              <input
                type="text"
                disabled={!imageSrc}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="saas-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-550 mb-1.5">Color</label>
                <input
                  type="color"
                  disabled={!imageSrc}
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 px-1 py-0.5 rounded-xl border border-zinc-205 dark:border-zinc-800 bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-550 mb-1.5">Font Size (px)</label>
                <input
                  type="number"
                  disabled={!imageSrc}
                  value={fontSize}
                  onChange={(e) => setFontSize(Math.max(1, parseInt(e.target.value) || 0))}
                  className="saas-input"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Watermark Logo Image</label>
              {!logoSrc ? (
                <label className="w-full flex flex-col justify-center items-center py-5 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                  <Upload className="w-6 h-6 text-zinc-400 mb-1.5" />
                  <span className="text-[10px] font-bold text-zinc-650 dark:text-zinc-300">Upload PNG Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!imageSrc}
                    onChange={handleLogoUpload}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="truncate max-w-[150px] font-mono font-bold">Logo Uploaded</span>
                  <button
                    onClick={() => setLogoSrc(null)}
                    className="text-[10px] text-red-500 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
                <span>Logo Size (% width)</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-mono">{logoSize}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                disabled={!imageSrc}
                value={logoSize}
                onChange={(e) => setLogoSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Position Grid selector */}
        <div>
          <label className="block text-xs font-semibold text-zinc-450 mb-2.5">Watermark Position</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'tl', label: 'Top-L' }, { id: 'tc', label: 'Top-C' }, { id: 'tr', label: 'Top-R' },
              { id: 'ml', label: 'Mid-L' }, { id: 'cc', label: 'Center' }, { id: 'mr', label: 'Mid-R' },
              { id: 'bl', label: 'Bot-L' }, { id: 'bc', label: 'Bot-C' }, { id: 'br', label: 'Bot-R' }
            ].map((pos) => (
              <button
                key={pos.id}
                onClick={() => setPosition(pos.id as Position)}
                disabled={!imageSrc}
                className={`py-1.5 rounded-xl border text-[10px] font-bold transition disabled:opacity-40 ${
                  position === pos.id
                    ? 'border-indigo-600 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-550'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPosition('tile')}
            disabled={!imageSrc}
            className={`w-full py-1.5 border rounded-xl text-[10px] font-bold mt-2 transition disabled:opacity-40 ${
              position === 'tile'
                ? 'border-indigo-600 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-550 hover:bg-zinc-55'
            }`}
          >
            Tiled Repeating Layout
          </button>
        </div>

        {/* Opacity slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
            <span>Watermark Opacity</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-mono">{opacity}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            disabled={!imageSrc}
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
          />
        </div>

        {imageSrc && (
          <button
            onClick={handleDownload}
            className="saas-button-primary w-full py-3"
          >
            <Download className="w-4 h-4" />
            <span>Download Output</span>
          </button>
        )}
      </div>

      {/* Image Preview Workspace */}
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
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Upload Image for Watermark</span>
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
            <div className="flex justify-between items-center w-full px-2 text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
              <span>File: {fileName}</span>
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
