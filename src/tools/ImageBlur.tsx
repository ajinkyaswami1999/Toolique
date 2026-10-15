import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Layers,
  Upload,
  Download,
  RotateCcw,
  AlertCircle,
  Archive,
  Sparkles,
  Sliders,
  Trash2,
  FolderUp,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Focus,
  Square,
  Circle,
  Shield,
  Split
} from 'lucide-react';
import JSZip from 'jszip';

export type BlurMode = 'full' | 'selective' | 'invert';
export type BlurAlgorithm = 'gaussian' | 'pixelate';
export type RegionShape = 'rect' | 'circle';

export interface ImageItem {
  id: string;
  name: string;
  sizeFormatted: string;
  type: string;
  src: string;
  width: number;
  height: number;
  fileBlob: File;
}

export interface BlurConfig {
  mode: BlurMode;
  algorithm: BlurAlgorithm;
  blurRadius: number; // 1 to 100 px (default 18)
  pixelSize: number; // 4 to 64 px (default 16)
  regionShape: RegionShape;
  regionX: number; // % 0-100
  regionY: number; // % 0-100
  regionWidth: number; // % 5-100
  regionHeight: number; // % 5-100
  outputFormat: 'png' | 'jpeg';
  jpegQuality: number; // 0.6 to 1.0
}

const DEFAULT_CONFIG: BlurConfig = {
  mode: 'full',
  algorithm: 'gaussian',
  blurRadius: 18,
  pixelSize: 16,
  regionShape: 'rect',
  regionX: 25,
  regionY: 25,
  regionWidth: 50,
  regionHeight: 50,
  outputFormat: 'png',
  jpegQuality: 0.92,
};

const BLUR_PRESETS = [
  { label: 'Subtle', radius: 6, pixel: 8 },
  { label: 'Medium', radius: 18, pixel: 16 },
  { label: 'Heavy', radius: 36, pixel: 28 },
  { label: 'Max Redaction', radius: 70, pixel: 48 },
];

const REGION_PRESETS = [
  { label: 'Center (Face/Subject)', x: 25, y: 20, w: 50, h: 50, shape: 'circle' as RegionShape },
  { label: 'Top Header', x: 5, y: 5, w: 90, h: 25, shape: 'rect' as RegionShape },
  { label: 'Bottom Footer', x: 5, y: 70, w: 90, h: 25, shape: 'rect' as RegionShape },
  { label: 'Left Card / Badge', x: 5, y: 20, w: 40, h: 60, shape: 'rect' as RegionShape },
  { label: 'Right Card / Badge', x: 55, y: 20, w: 40, h: 60, shape: 'rect' as RegionShape },
];

/**
 * Draws pixelated mosaic effect using an offscreen canvas downsampling technique.
 */
function drawPixelatedRegion(
  ctx: CanvasRenderingContext2D,
  sourceImg: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  blockSize: number
) {
  const safeBlock = Math.max(2, Math.round(blockSize));
  const smallW = Math.max(1, Math.floor(sw / safeBlock));
  const smallH = Math.max(1, Math.floor(sh / safeBlock));

  const offscreen = document.createElement('canvas');
  offscreen.width = smallW;
  offscreen.height = smallH;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return;

  offCtx.imageSmoothingEnabled = true;
  offCtx.drawImage(sourceImg, sx, sy, sw, sh, 0, 0, smallW, smallH);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(offscreen, 0, 0, smallW, smallH, dx, dy, dw, dh);
  ctx.imageSmoothingEnabled = true;
}

/**
 * Pure rendering function that draws blurred/pixelated content onto a destination canvas.
 */
function renderBlurredImage(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  config: BlurConfig
) {
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const w = canvas.width;
  const h = canvas.height;

  if (config.mode === 'full') {
    if (config.algorithm === 'pixelate') {
      drawPixelatedRegion(ctx, img, 0, 0, w, h, 0, 0, w, h, config.pixelSize);
    } else {
      ctx.save();
      ctx.drawImage(img, 0, 0);
      ctx.filter = `blur(${config.blurRadius}px)`;
      const bleed = Math.min(config.blurRadius, 12);
      ctx.drawImage(img, -bleed, -bleed, w + bleed * 2, h + bleed * 2);
      ctx.restore();
    }
  } else if (config.mode === 'selective') {
    // 1. Draw base crisp image
    ctx.drawImage(img, 0, 0);

    // 2. Calculate pixel coordinates for region
    const rx = (config.regionX / 100) * w;
    const ry = (config.regionY / 100) * h;
    const rw = Math.max(10, (config.regionWidth / 100) * w);
    const rh = Math.max(10, (config.regionHeight / 100) * h);

    ctx.save();
    ctx.beginPath();
    if (config.regionShape === 'circle') {
      ctx.ellipse(rx + rw / 2, ry + rh / 2, rw / 2, rh / 2, 0, 0, Math.PI * 2);
    } else {
      ctx.rect(rx, ry, rw, rh);
    }
    ctx.clip();

    if (config.algorithm === 'pixelate') {
      drawPixelatedRegion(ctx, img, rx, ry, rw, rh, rx, ry, rw, rh, config.pixelSize);
    } else {
      ctx.filter = `blur(${config.blurRadius}px)`;
      const bleed = Math.min(config.blurRadius, 12);
      ctx.drawImage(img, -bleed, -bleed, w + bleed * 2, h + bleed * 2);
    }
    ctx.restore();
  } else if (config.mode === 'invert') {
    // Bokeh Portrait Mode: Blur entire background, keep selective region sharp
    ctx.save();
    ctx.filter = `blur(${config.blurRadius}px)`;
    const bleed = Math.min(config.blurRadius, 12);
    ctx.drawImage(img, -bleed, -bleed, w + bleed * 2, h + bleed * 2);
    ctx.restore();

    // Clip to region and draw original sharp image inside
    const rx = (config.regionX / 100) * w;
    const ry = (config.regionY / 100) * h;
    const rw = Math.max(10, (config.regionWidth / 100) * w);
    const rh = Math.max(10, (config.regionHeight / 100) * h);

    ctx.save();
    ctx.beginPath();
    if (config.regionShape === 'circle') {
      ctx.ellipse(rx + rw / 2, ry + rh / 2, rw / 2, rh / 2, 0, 0, Math.PI * 2);
    } else {
      ctx.rect(rx, ry, rw, rh);
    }
    ctx.clip();
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  }
}

export default function ImageBlur() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [config, setConfig] = useState<BlurConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'blur' | 'region' | 'export'>('blur');

  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; percent: number }>({
    current: 0,
    total: 0,
    percent: 0,
  });

  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [showRegionOverlay, setShowRegionOverlay] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const activeItem = images[selectedIndex] || null;

  // Helper to parse file into ImageItem
  const parseImageFile = (file: File): Promise<ImageItem> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      img.onload = () => {
        resolve({
          id,
          name: file.name,
          sizeFormatted: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type || 'image/png',
          src: url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          fileBlob: file,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  };

  const handleIncomingFiles = useCallback(async (incomingFiles: FileList | File[]) => {
    setError(null);
    const validFiles = Array.from(incomingFiles).filter((f) => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      setError('Please select valid image files (PNG, JPG, WebP, SVG, AVIF, BMP).');
      return;
    }

    try {
      const parsedItems = await Promise.all(validFiles.map(parseImageFile));
      setImages((prev) => {
        const updated = [...prev, ...parsedItems];
        if (prev.length === 0) setSelectedIndex(0);
        return updated;
      });
    } catch {
      setError('Could not parse one or more selected images.');
    }
  }, []);

  // Native Paste handler (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      const pastedFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
            const renamed = new File([file], `clipboard-image-${timestamp}-${i + 1}.png`, {
              type: file.type || 'image/png',
            });
            pastedFiles.push(renamed);
          }
        }
      }

      if (pastedFiles.length > 0) {
        handleIncomingFiles(pastedFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleIncomingFiles]);

  // Load 3 sample images for immediate testing
  const handleLoadSampleImages = () => {
    setError(null);
    const samples = [
      {
        name: 'sample-portrait-bokeh.jpg',
        title: 'PORTRAIT PHOTOGRAPHY',
        subtitle: 'Test Portrait Bokeh & Background Blur',
        c1: '#4a00e0',
        c2: '#8e2de2',
        isPortrait: true,
      },
      {
        name: 'sample-confidential-card.png',
        title: 'CONFIDENTIAL ID CARD',
        subtitle: 'CARD: 4929 •••• •••• 8831 | DOB: 14/08/1990',
        c1: '#141e30',
        c2: '#243b55',
        isDoc: true,
      },
      {
        name: 'sample-landscape-wallpaper.jpg',
        title: 'NORDIC MOUNTAIN DAWN',
        subtitle: 'Scenic Landscape Ultra-Wide 4K',
        c1: '#0f2027',
        c2: '#2c5364',
        isScenic: true,
      },
    ];

    const promises = samples.map((item) => {
      return new Promise<File>((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 1600, 1000);
          grad.addColorStop(0, item.c1);
          grad.addColorStop(1, item.c2);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1600, 1000);

          if (item.isPortrait) {
            // Draw mock silhouette/portrait circle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.arc(800, 420, 220, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(800, 360, 110, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.ellipse(800, 600, 210, 140, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (item.isDoc) {
            // Draw mock ID badge
            ctx.fillStyle = '#ffffff';
            ctx.roundRect(400, 220, 800, 560, 24);
            ctx.fill();

            ctx.fillStyle = '#1e3a8a';
            ctx.fillRect(400, 220, 800, 100);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText('OFFICIAL IDENTITY CREDENTIAL', 440, 285);

            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(450, 360, 200, 240);

            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 32px sans-serif';
            ctx.fillText('JOHNATHAN DOE', 680, 410);

            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 28px monospace';
            ctx.fillText('SSN: ***-**-8492', 680, 470);

            ctx.fillStyle = '#334155';
            ctx.font = '24px monospace';
            ctx.fillText('ACCOUNT: 8849-2041-0012', 680, 520);
          } else {
            // Mountain peak shapes
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.beginPath();
            ctx.moveTo(100, 800);
            ctx.lineTo(500, 300);
            ctx.lineTo(900, 800);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.moveTo(600, 800);
            ctx.lineTo(1100, 220);
            ctx.lineTo(1600, 800);
            ctx.fill();
          }

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 44px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(item.title, 800, 860);

          ctx.font = '26px sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.fillText(item.subtitle, 800, 915);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], item.name, { type: 'image/jpeg' }));
          }
        }, 'image/jpeg', 0.95);
      });
    });

    Promise.all(promises).then((files) => {
      handleIncomingFiles(files);
    });
  };

  // Render Preview on canvas
  useEffect(() => {
    if (!activeItem) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.src = activeItem.src;
    img.onload = () => {
      if (showOriginal) {
        // Draw unblurred original
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
      } else {
        renderBlurredImage(canvas, img, config);
      }
    };
  }, [activeItem, config, showOriginal]);

  // Remove single image from queue
  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => {
      const target = prev[indexToRemove];
      if (target) URL.revokeObjectURL(target.src);
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      if (selectedIndex >= filtered.length) {
        setSelectedIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  // Clear entire queue
  const handleClearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.src));
    setImages([]);
    setSelectedIndex(0);
    setError(null);
  };

  // Download Current Image
  const handleDownloadCurrent = () => {
    if (!activeItem) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const mime = config.outputFormat === 'png' ? 'image/png' : 'image/jpeg';
    const ext = config.outputFormat === 'png' ? 'png' : 'jpg';
    const baseName = activeItem.name.replace(/\.[^/.]+$/, '');

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `blurred_${baseName}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },
      mime,
      config.jpegQuality
    );
  };

  // Batch Export All Images as ZIP
  const handleDownloadAllZip = async () => {
    if (images.length === 0 || isProcessingBatch) return;

    setIsProcessingBatch(true);
    setBatchProgress({ current: 0, total: images.length, percent: 0 });

    try {
      const zip = new JSZip();
      const folder = zip.folder('blurred_photos') || zip;
      const offscreenCanvas = document.createElement('canvas');

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        setBatchProgress({
          current: i + 1,
          total: images.length,
          percent: Math.round(((i + 1) / images.length) * 100),
        });

        // Load image onto offscreen canvas
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.src = item.src;
          img.onload = () => {
            renderBlurredImage(offscreenCanvas, img, config);

            const mime = config.outputFormat === 'png' ? 'image/png' : 'image/jpeg';
            const ext = config.outputFormat === 'png' ? 'png' : 'jpg';
            const baseName = item.name.replace(/\.[^/.]+$/, '');
            const fileName = `blurred_${baseName}.${ext}`;

            offscreenCanvas.toBlob(
              (blob) => {
                if (blob) {
                  folder.file(fileName, blob);
                }
                resolve();
              },
              mime,
              config.jpegQuality
            );
          };
          img.onerror = () => reject(new Error(`Failed to load ${item.name}`));
        });
      }

      // Generate and trigger ZIP download
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `blurred_images_batch_${images.length}_photos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setError('An error occurred during batch ZIP generation. Please try again.');
    } finally {
      setIsProcessingBatch(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Banner Warning / Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-red-500/20 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Batch ZIP Export Progress Banner */}
      {isProcessingBatch && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm space-y-2">
          <div className="flex justify-between font-semibold">
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4 animate-bounce" />
              Processing & Compiling ZIP Archive...
            </span>
            <span>
              {batchProgress.current} / {batchProgress.total} ({batchProgress.percent}%)
            </span>
          </div>
          <div className="w-full bg-indigo-200 dark:bg-indigo-950/60 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${batchProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* State A: Zero Images Loaded - Frictionless Dropzone */}
      {images.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files) {
              handleIncomingFiles(e.dataTransfer.files);
            }
          }}
          className={`relative border-2 border-dashed rounded-3xl p-10 md:p-14 text-center transition-all duration-300 ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-950/20 scale-[0.99]'
              : 'border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-700'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleIncomingFiles(e.target.files);
            }}
          />
          <input
            ref={folderInputRef}
            type="file"
            // @ts-expect-error webkitdirectory attribute is standard in Chromium/Firefox
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleIncomingFiles(e.target.files);
            }}
          />

          <div className="max-w-xl mx-auto flex flex-col items-center">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-5 shadow-inner">
              <Layers className="w-10 h-10" />
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Drop Photos to Blur or Redact in Bulk
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
              Batch apply Gaussian blur or pixelate mosaic censorship to multiple photos simultaneously. 100% private in your browser.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="saas-button-primary px-5 py-2.5 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Select Images</span>
              </button>

              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-750 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center gap-2"
              >
                <FolderUp className="w-4 h-4" />
                <span>Upload Folder</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSampleImages}
                className="px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Load 3 Samples</span>
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Paste from Clipboard (Ctrl+V)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
                Zero Server Uploads
              </span>
              <span>•</span>
              <span>PNG, JPG, WebP, SVG</span>
            </div>
          </div>
        </div>
      ) : (
        /* State B: Active Multi-Image Workspace */
        <div className="space-y-6">
          {/* Top Quick Actions Bar */}
          <div className="saas-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Batch Queue ({images.length} {images.length === 1 ? 'image' : 'images'})</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                    Active: #{selectedIndex + 1}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {activeItem ? `${activeItem.name} (${activeItem.width}×${activeItem.height}px, ${activeItem.sizeFormatted})` : ''}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-zinc-250 dark:border-zinc-750 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Add More</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCurrent}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-900 text-white text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Current</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={isProcessingBatch}
                className="saas-button-primary px-4 py-1.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Download All ({images.length} in ZIP)</span>
              </button>
            </div>
          </div>

          {/* Hidden File Pickers */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleIncomingFiles(e.target.files);
            }}
          />

          {/* Main Studio Grid: Controls (Left) + Workspace & Filmstrip (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Configuration Controls (lg:col-span-5) */}
            <div className="lg:col-span-5 saas-card p-5 space-y-5">
              {/* Tabs */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 pb-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('blur')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'blur'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Blur & Filter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('region')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'region'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Focus className="w-3.5 h-3.5" />
                  <span>Region & Censor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('export')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'export'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Format</span>
                </button>
              </div>

              {/* Tab 1: Blur & Filter Options */}
              {activeTab === 'blur' && (
                <div className="space-y-5 text-xs">
                  {/* Blur Mode Selection */}
                  <div>
                    <label className="font-bold text-zinc-900 dark:text-zinc-100 block mb-2">
                      Target Area Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, mode: 'full' }))}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          config.mode === 'full'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Layers className="w-4 h-4" />
                        <span>Full Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, mode: 'selective' }))}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          config.mode === 'selective'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                        <span>Censor Box</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, mode: 'invert' }))}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          config.mode === 'invert'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Focus className="w-4 h-4" />
                        <span>Portrait Bokeh</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
                      {config.mode === 'full' && 'Blurs the entire canvas smoothly for backgrounds and textures.'}
                      {config.mode === 'selective' && 'Redacts faces, IDs, credit cards, or confidential sections.'}
                      {config.mode === 'invert' && 'Keeps the focal region sharp while blurring the exterior background.'}
                    </p>
                  </div>

                  {/* Filter Algorithm */}
                  <div>
                    <label className="font-bold text-zinc-900 dark:text-zinc-100 block mb-2">
                      Filter Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, algorithm: 'gaussian' }))}
                        className={`p-2.5 rounded-xl border text-center transition flex items-center justify-center gap-2 ${
                          config.algorithm === 'gaussian'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Gaussian Blur</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, algorithm: 'pixelate' }))}
                        className={`p-2.5 rounded-xl border text-center transition flex items-center justify-center gap-2 ${
                          config.algorithm === 'pixelate'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Split className="w-4 h-4" />
                        <span>Pixelate / Mosaic</span>
                      </button>
                    </div>
                  </div>

                  {/* Intensity Slider depending on algorithm */}
                  {config.algorithm === 'gaussian' ? (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">Blur Radius</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                          {config.blurRadius} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={config.blurRadius}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, blurRadius: parseInt(e.target.value) || 1 }))
                        }
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                      />

                      {/* Quick Presets */}
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {BLUR_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() =>
                              setConfig((p) => ({ ...p, blurRadius: preset.radius }))
                            }
                            className={`py-1 px-1.5 rounded-lg border text-[10px] font-semibold transition ${
                              config.blurRadius === preset.radius
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {preset.label} ({preset.radius}px)
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">Mosaic Pixel Size</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                          {config.pixelSize} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="64"
                        step="2"
                        value={config.pixelSize}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, pixelSize: parseInt(e.target.value) || 4 }))
                        }
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                      />

                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {BLUR_PRESETS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() =>
                              setConfig((p) => ({ ...p, pixelSize: preset.pixel }))
                            }
                            className={`py-1 px-1.5 rounded-lg border text-[10px] font-semibold transition ${
                              config.pixelSize === preset.pixel
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {preset.label} ({preset.pixel}px)
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reset defaults button */}
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setConfig(DEFAULT_CONFIG)}
                      className="w-full py-2 rounded-xl border border-zinc-250 dark:border-zinc-750 text-zinc-600 dark:text-zinc-400 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Blur Parameters</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Region & Censor Positioning */}
              {activeTab === 'region' && (
                <div className="space-y-4 text-xs">
                  {config.mode === 'full' ? (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
                      <p className="font-semibold mb-1">Target Mode is currently set to &apos;Full Image&apos;.</p>
                      <p className="text-[11px] mb-3 text-amber-700 dark:text-amber-400">
                        To enable selective censor boxes or bokeh portrait focus, switch to Censor Box or Portrait Bokeh.
                      </p>
                      <button
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, mode: 'selective' }))}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs"
                      >
                        Enable Censor Box
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Region Shape */}
                      <div>
                        <label className="font-bold text-zinc-900 dark:text-zinc-100 block mb-2">
                          Region Shape
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setConfig((p) => ({ ...p, regionShape: 'rect' }))}
                            className={`p-2 rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
                              config.regionShape === 'rect'
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <Square className="w-3.5 h-3.5" />
                            <span>Rectangle / Box</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfig((p) => ({ ...p, regionShape: 'circle' }))}
                            className={`p-2 rounded-xl border text-center transition flex items-center justify-center gap-1.5 ${
                              config.regionShape === 'circle'
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <Circle className="w-3.5 h-3.5" />
                            <span>Circle / Ellipse</span>
                          </button>
                        </div>
                      </div>

                      {/* Region Presets */}
                      <div>
                        <label className="font-bold text-zinc-900 dark:text-zinc-100 block mb-2">
                          Quick Region Presets
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {REGION_PRESETS.map((rp) => (
                            <button
                              key={rp.label}
                              type="button"
                              onClick={() =>
                                setConfig((p) => ({
                                  ...p,
                                  regionX: rp.x,
                                  regionY: rp.y,
                                  regionWidth: rp.w,
                                  regionHeight: rp.h,
                                  regionShape: rp.shape,
                                }))
                              }
                              className="py-1 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                              {rp.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Region Dimensions Coordinates */}
                      <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-zinc-600 dark:text-zinc-400">Horizontal Position (X)</span>
                            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                              {config.regionX}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="90"
                            value={config.regionX}
                            onChange={(e) =>
                              setConfig((p) => ({ ...p, regionX: parseInt(e.target.value) || 0 }))
                            }
                            className="w-full h-1.5 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-zinc-600 dark:text-zinc-400">Vertical Position (Y)</span>
                            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                              {config.regionY}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="90"
                            value={config.regionY}
                            onChange={(e) =>
                              setConfig((p) => ({ ...p, regionY: parseInt(e.target.value) || 0 }))
                            }
                            className="w-full h-1.5 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-zinc-600 dark:text-zinc-400">Box Width</span>
                            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                              {config.regionWidth}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="100"
                            value={config.regionWidth}
                            onChange={(e) =>
                              setConfig((p) => ({ ...p, regionWidth: parseInt(e.target.value) || 5 }))
                            }
                            className="w-full h-1.5 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-zinc-600 dark:text-zinc-400">Box Height</span>
                            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                              {config.regionHeight}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="100"
                            value={config.regionHeight}
                            onChange={(e) =>
                              setConfig((p) => ({ ...p, regionHeight: parseInt(e.target.value) || 5 }))
                            }
                            className="w-full h-1.5 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      </div>

                      {/* Visual Guide Toggle */}
                      <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                          <input
                            type="checkbox"
                            checked={showRegionOverlay}
                            onChange={(e) => setShowRegionOverlay(e.target.checked)}
                            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span>Show Region Boundary Outline on Preview</span>
                        </label>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 3: Export Format */}
              {activeTab === 'export' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-zinc-900 dark:text-zinc-100 block mb-2">
                      Export Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, outputFormat: 'png' }))}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          config.outputFormat === 'png'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span className="font-mono font-bold">PNG</span>
                        <span className="text-[10px] text-zinc-500">Lossless & Crisp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfig((p) => ({ ...p, outputFormat: 'jpeg' }))}
                        className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          config.outputFormat === 'jpeg'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span className="font-mono font-bold">JPEG</span>
                        <span className="text-[10px] text-zinc-500">Compressed & Small</span>
                      </button>
                    </div>
                  </div>

                  {config.outputFormat === 'jpeg' && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-600 dark:text-zinc-400">JPEG Quality</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {Math.round(config.jpegQuality * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.0"
                        step="0.05"
                        value={config.jpegQuality}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, jpegQuality: parseFloat(e.target.value) || 0.9 }))
                        }
                        className="w-full h-1.5 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  )}

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">Batch Processing Settings:</p>
                    <p>• The configured blur radius and censor region will apply consistently to all {images.length} images.</p>
                    <p>• Normalized percentage coordinates ensure uniform placement across photos of mixed resolutions.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Active Canvas Preview + Batch Filmstrip (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Canvas Workspace Box */}
              <div className="saas-card p-4 space-y-3">
                {/* Canvas Toolbar */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-150 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
                      {activeItem?.name}
                    </span>
                    <span className="text-zinc-400">
                      {activeItem?.width}×{activeItem?.height}px
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onMouseDown={() => setShowOriginal(true)}
                      onMouseUp={() => setShowOriginal(false)}
                      onTouchStart={() => setShowOriginal(true)}
                      onTouchEnd={() => setShowOriginal(false)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 select-none ${
                        showOriginal
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'border-zinc-250 dark:border-zinc-750 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                      }`}
                      title="Hold to see original unblurred photo"
                    >
                      {showOriginal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showOriginal ? 'Showing Original' : 'Hold to Compare'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadCurrent}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Canvas Container with Region Overlay Box */}
                <div
                  className="relative w-full overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-950/5 dark:bg-zinc-950/40 flex items-center justify-center p-2"
                  style={{ minHeight: '380px', maxHeight: '520px' }}
                >
                  <div className="relative inline-block max-w-full max-h-full">
                    <canvas
                      ref={previewCanvasRef}
                      className="max-w-full h-auto object-contain rounded-lg shadow-sm"
                      style={{ maxHeight: '480px' }}
                    />

                    {/* Visual Censor Region Overlay (Only for preview, not on downloaded image) */}
                    {config.mode !== 'full' && showRegionOverlay && !showOriginal && (
                      <div
                        className={`absolute border-2 pointer-events-none transition-all duration-75 ${
                          config.regionShape === 'circle' ? 'rounded-full' : 'rounded-lg'
                        } ${
                          config.mode === 'selective'
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-emerald-500 bg-emerald-500/10'
                        }`}
                        style={{
                          left: `${config.regionX}%`,
                          top: `${config.regionY}%`,
                          width: `${config.regionWidth}%`,
                          height: `${config.regionHeight}%`,
                        }}
                      >
                        <span
                          className={`absolute -top-5 left-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white shadow-sm ${
                            config.mode === 'selective' ? 'bg-red-600' : 'bg-emerald-600'
                          }`}
                        >
                          {config.mode === 'selective' ? 'Censor Region' : 'Sharp Subject'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Batch Queue Filmstrip */}
              <div className="saas-card p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>Batch Queue Filmstrip</span>
                  </span>
                  <span className="text-zinc-500">
                    Click any thumbnail to inspect
                  </span>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {images.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedIndex(idx)}
                        className={`group relative shrink-0 w-28 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-105'
                            : 'border-zinc-200 dark:border-zinc-800 opacity-75 hover:opacity-100 hover:border-zinc-400'
                        }`}
                      >
                        <img
                          src={item.src}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1">
                          <p className="text-[10px] text-white font-medium truncate">
                            {item.name}
                          </p>
                        </div>

                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition"
                          title="Remove from queue"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        {isSelected && (
                          <div className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            #{idx + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
