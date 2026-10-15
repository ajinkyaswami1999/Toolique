import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Type,
  Upload,
  Download,
  RotateCcw,
  Image as ImageIcon,
  AlertCircle,
  Archive,
  Layers,
  Sparkles,
  Sliders,
  Trash2,
  FolderUp,
  Grid3X3,
  CheckCircle2,
  X
} from 'lucide-react';
import JSZip from 'jszip';

type Position = 'tl' | 'tc' | 'tr' | 'ml' | 'cc' | 'mr' | 'bl' | 'bc' | 'br' | 'tile';

interface ImageItem {
  id: string;
  name: string;
  sizeFormatted: string;
  type: string;
  src: string;
  width: number;
  height: number;
  fileBlob: File;
}

interface WatermarkConfig {
  type: 'text' | 'image';
  text: string;
  textColor: string;
  textOutline: boolean;
  outlineColor: string;
  fontFamily: string;
  fontSize: number; // percentage of min dimension (2 to 25)
  rotation: number; // degrees (-90 to 90)
  opacity: number; // percentage (5 to 100)
  position: Position;
  margin: number; // percentage of min dimension (0 to 15)
  logoSrc: string | null;
  logoSize: number; // percentage of image width (5 to 70)
}

const DEFAULT_CONFIG: WatermarkConfig = {
  type: 'text',
  text: '© 2026 YourBrand Proof',
  textColor: '#ffffff',
  textOutline: true,
  outlineColor: '#000000',
  fontFamily: 'system-ui, sans-serif',
  fontSize: 6,
  rotation: 0,
  opacity: 60,
  position: 'br',
  margin: 4,
  logoSrc: null,
  logoSize: 18,
};

const FONT_OPTIONS = [
  { id: 'system-ui, sans-serif', name: 'Sans-Serif (Modern)' },
  { id: 'Georgia, serif', name: 'Serif (Classic & Editorial)' },
  { id: 'monospace', name: 'Monospace (Technical)' },
  { id: 'Impact, sans-serif', name: 'Impact (Bold Stamp)' },
  { id: 'cursive', name: 'Handwriting (Artistic Signature)' },
];

const PRESET_TEXTS = [
  '© Copyright',
  'CONFIDENTIAL',
  'SAMPLE / PROOF',
  'DO NOT COPY',
  'DRAFT',
];

export default function ImageWatermark() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [config, setConfig] = useState<WatermarkConfig>(DEFAULT_CONFIG);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; percent: number }>({
    current: 0,
    total: 0,
    percent: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'position'>('content');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const activeImage = useMemo(() => {
    return images[selectedIndex] || null;
  }, [images, selectedIndex]);

  // Clean up object URLs on unmount or file removal
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
      });
      if (config.logoSrc && config.logoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(config.logoSrc);
      }
    };
  }, [images, config.logoSrc]);

  // Read file as ImageItem
  const parseImageFile = (file: File): Promise<ImageItem> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Non-image file'));
        return;
      }

      const id = Math.random().toString(36).substring(2, 9);
      const url = URL.createObjectURL(file);
      const img = new Image();

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
      setError('Please select valid image files (PNG, JPG, WebP, SVG, AVIF, GIF, BMP).');
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

  // Native Paste handler for clipboard screenshots
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

  // Load 3 sample images for immediate frictionless testing
  const handleLoadSampleImages = () => {
    setError(null);
    const sampleThemes = [
      { name: 'landscape-mountain.jpg', c1: '#1e3c72', c2: '#2a5298', label: 'Alpine Panorama 4K' },
      { name: 'architecture-urban.jpg', c1: '#2c3e50', c2: '#3498db', label: 'Modern Metro Architecture' },
      { name: 'product-photography.jpg', c1: '#4a00e0', c2: '#8e2de2', label: 'Studio Portfolio Showcase' },
    ];

    const promises = sampleThemes.map((item) => {
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

          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 58px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(item.label, 800, 480);

          ctx.font = '24px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillText('Toolique High-Resolution Client-Side Test Canvas', 800, 540);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], item.name, { type: 'image/jpeg' }));
          }
        }, 'image/jpeg', 0.92);
      });
    });

    Promise.all(promises).then((files) => handleIncomingFiles(files));
  };

  // Upload Logo Graphic
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for the logo.');
        return;
      }
      setError(null);
      const url = URL.createObjectURL(file);
      setConfig((prev) => ({ ...prev, logoSrc: url, type: 'image' }));
    }
  };

  // Core Watermark Renderer: draws on an arbitrary canvas
  const drawWatermarkOnCanvas = useCallback(
    (canvas: HTMLCanvasElement, baseImg: HTMLImageElement, logoImg: HTMLImageElement | null) => {
      canvas.width = baseImg.naturalWidth;
      canvas.height = baseImg.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original image
      ctx.drawImage(baseImg, 0, 0);

      const minDim = Math.min(canvas.width, canvas.height);
      const marginPx = Math.round((minDim * config.margin) / 100);

      ctx.save();
      ctx.globalAlpha = config.opacity / 100;

      if (config.type === 'text') {
        // Calculate font size relative to image resolution so all batch images look proportional
        const effectiveFontSize = Math.max(14, Math.round((minDim * config.fontSize) / 100));
        ctx.font = `bold ${effectiveFontSize}px ${config.fontFamily}`;
        ctx.fillStyle = config.textColor;

        const textMetrics = ctx.measureText(config.text);
        const textWidth = textMetrics.width;

        if (config.position === 'tile') {
          // Tiled repeating watermark
          ctx.save();
          const tileAngle = config.rotation !== 0 ? config.rotation : -30;
          ctx.rotate((tileAngle * Math.PI) / 180);

          const stepX = textWidth + Math.max(80, effectiveFontSize * 2);
          const stepY = effectiveFontSize * 4 + 80;

          const diag = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);

          for (let tx = -diag; tx < diag * 1.5; tx += stepX) {
            for (let ty = -diag; ty < diag * 1.5; ty += stepY) {
              if (config.textOutline) {
                ctx.strokeStyle = config.outlineColor;
                ctx.lineWidth = Math.max(2, Math.round(effectiveFontSize / 10));
                ctx.strokeText(config.text, tx, ty);
              }
              ctx.fillText(config.text, tx, ty);
            }
          }
          ctx.restore();
        } else {
          // 9-Point Grid Positioning
          let x = canvas.width / 2;
          let y = canvas.height / 2;
          let align: CanvasTextAlign = 'center';

          switch (config.position) {
            case 'tl':
              x = marginPx;
              y = marginPx + effectiveFontSize;
              align = 'left';
              break;
            case 'tc':
              x = canvas.width / 2;
              y = marginPx + effectiveFontSize;
              align = 'center';
              break;
            case 'tr':
              x = canvas.width - marginPx;
              y = marginPx + effectiveFontSize;
              align = 'right';
              break;
            case 'ml':
              x = marginPx;
              y = canvas.height / 2;
              align = 'left';
              break;
            case 'cc':
              x = canvas.width / 2;
              y = canvas.height / 2;
              align = 'center';
              break;
            case 'mr':
              x = canvas.width - marginPx;
              y = canvas.height / 2;
              align = 'right';
              break;
            case 'bl':
              x = marginPx;
              y = canvas.height - marginPx;
              align = 'left';
              break;
            case 'bc':
              x = canvas.width / 2;
              y = canvas.height - marginPx;
              align = 'center';
              break;
            case 'br':
              x = canvas.width - marginPx;
              y = canvas.height - marginPx;
              align = 'right';
              break;
          }

          ctx.save();
          ctx.translate(x, y);
          if (config.rotation !== 0) {
            ctx.rotate((config.rotation * Math.PI) / 180);
          }
          ctx.textAlign = align;
          ctx.textBaseline = 'middle';

          if (config.textOutline) {
            ctx.strokeStyle = config.outlineColor;
            ctx.lineWidth = Math.max(2, Math.round(effectiveFontSize / 9));
            ctx.strokeText(config.text, 0, 0);
          }
          ctx.fillText(config.text, 0, 0);
          ctx.restore();
        }
      } else if (config.type === 'image' && logoImg) {
        // Logo Graphic Watermark
        const logoW = Math.round((config.logoSize / 100) * canvas.width);
        const logoH = Math.round((logoW * logoImg.naturalHeight) / logoImg.naturalWidth);

        if (config.position === 'tile') {
          ctx.save();
          const tileAngle = config.rotation !== 0 ? config.rotation : -25;
          ctx.rotate((tileAngle * Math.PI) / 180);

          const stepX = logoW + 120;
          const stepY = logoH + 120;
          const diag = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);

          for (let tx = -diag; tx < diag * 1.5; tx += stepX) {
            for (let ty = -diag; ty < diag * 1.5; ty += stepY) {
              ctx.drawImage(logoImg, tx, ty, logoW, logoH);
            }
          }
          ctx.restore();
        } else {
          let x = (canvas.width - logoW) / 2;
          let y = (canvas.height - logoH) / 2;

          switch (config.position) {
            case 'tl': x = marginPx; y = marginPx; break;
            case 'tc': x = (canvas.width - logoW) / 2; y = marginPx; break;
            case 'tr': x = canvas.width - logoW - marginPx; y = marginPx; break;
            case 'ml': x = marginPx; y = (canvas.height - logoH) / 2; break;
            case 'cc': x = (canvas.width - logoW) / 2; y = (canvas.height - logoH) / 2; break;
            case 'mr': x = canvas.width - logoW - marginPx; y = (canvas.height - logoH) / 2; break;
            case 'bl': x = marginPx; y = canvas.height - logoH - marginPx; break;
            case 'bc': x = (canvas.width - logoW) / 2; y = canvas.height - logoH - marginPx; break;
            case 'br': x = canvas.width - logoW - marginPx; y = canvas.height - logoH - marginPx; break;
          }

          ctx.save();
          if (config.rotation !== 0) {
            ctx.translate(x + logoW / 2, y + logoH / 2);
            ctx.rotate((config.rotation * Math.PI) / 180);
            ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
          } else {
            ctx.drawImage(logoImg, x, y, logoW, logoH);
          }
          ctx.restore();
        }
      }

      ctx.restore();
    },
    [config]
  );

  // Redraw preview canvas whenever activeImage or config changes
  useEffect(() => {
    if (!activeImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const baseImg = new Image();
    baseImg.onload = () => {
      if (config.type === 'image' && config.logoSrc) {
        const logoImg = new Image();
        logoImg.onload = () => {
          drawWatermarkOnCanvas(canvas, baseImg, logoImg);
        };
        logoImg.src = config.logoSrc;
      } else {
        drawWatermarkOnCanvas(canvas, baseImg, null);
      }
    };
    baseImg.src = activeImage.src;
  }, [activeImage, config, drawWatermarkOnCanvas]);

  // Download currently previewed single image
  const handleDownloadSingle = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeImage) return;

    const outType = activeImage.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
    const ext = outType === 'image/jpeg' ? 'jpg' : 'png';
    const baseName = activeImage.name.substring(0, activeImage.name.lastIndexOf('.')) || activeImage.name;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseName}-watermarked.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, outType, 0.94);
  };

  // Helper to render any single ImageItem to Blob
  const processImageToBlob = (item: ImageItem, logoImg: HTMLImageElement | null): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const offscreenCanvas = document.createElement('canvas');
        drawWatermarkOnCanvas(offscreenCanvas, img, logoImg);
        const outType = item.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
        offscreenCanvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas blob failure'));
          },
          outType,
          0.94
        );
      };
      img.onerror = () => reject(new Error(`Failed to load ${item.name}`));
      img.src = item.src;
    });
  };

  // Batch Process & Download All as ZIP
  const handleBatchDownloadZip = async () => {
    if (images.length === 0 || isProcessingBatch) return;
    setIsProcessingBatch(true);
    setError(null);
    setBatchProgress({ current: 0, total: images.length, percent: 5 });

    try {
      const zip = new JSZip();

      // Load logo image once if logo watermark is active
      let loadedLogoImg: HTMLImageElement | null = null;
      if (config.type === 'image' && config.logoSrc) {
        loadedLogoImg = await new Promise((resolve) => {
          const lImg = new Image();
          lImg.onload = () => resolve(lImg);
          lImg.onerror = () => resolve(null);
          lImg.src = config.logoSrc!;
        });
      }

      // Process all images sequentially through offscreen canvas
      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        setBatchProgress({
          current: i + 1,
          total: images.length,
          percent: Math.round(5 + ((i + 1) / images.length) * 75),
        });

        const blob = await processImageToBlob(item, loadedLogoImg);
        const ext = item.type === 'image/jpeg' ? 'jpg' : 'png';
        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
        zip.file(`${baseName}-watermarked.${ext}`, blob);
      }

      // Generate ZIP archive
      setBatchProgress((prev) => ({ ...prev, percent: 85 }));
      const zipBlob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (meta) => {
          const zipPercent = Math.min(99, Math.round(85 + meta.percent * 0.14));
          setBatchProgress((prev) => ({ ...prev, percent: zipPercent }));
        }
      );

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `watermarked-images-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setBatchProgress({ current: images.length, total: images.length, percent: 100 });
    } catch {
      setError('An error occurred during batch processing. Please try again.');
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleRemoveImage = (id: string, index: number) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      if (index === selectedIndex) {
        setSelectedIndex(Math.max(0, index - 1));
      } else if (index < selectedIndex) {
        setSelectedIndex(selectedIndex - 1);
      }
      return updated;
    });
  };

  const handleClearAll = () => {
    images.forEach((img) => {
      if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
    });
    setImages([]);
    setSelectedIndex(0);
    setError(null);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Main Grid: Control Sidebar (4 Cols) vs Workspace & Queue (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="saas-card p-5 space-y-4 shadow-sm">
            {/* Header with Reset */}
            <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-zinc-950 dark:text-white text-sm">
                  Watermark Settings
                </h3>
              </div>

              {images.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  title="Clear all images"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mode Switcher: Text vs Logo */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfig({ ...config, type: 'text' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  config.type === 'text'
                    ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Text Stamp</span>
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, type: 'image' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  config.type === 'image'
                    ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Logo Image</span>
              </button>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-1 rounded-lg text-center transition cursor-pointer ${
                  activeTab === 'content'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Content
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('style')}
                className={`flex-1 py-1 rounded-lg text-center transition cursor-pointer ${
                  activeTab === 'style'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Style
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('position')}
                className={`flex-1 py-1 rounded-lg text-center transition cursor-pointer ${
                  activeTab === 'position'
                    ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Position
              </button>
            </div>

            {/* Tab 1: Content Controls */}
            {activeTab === 'content' && (
              <div className="space-y-4 animate-fadeIn">
                {config.type === 'text' ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Watermark Text
                      </label>
                      <input
                        type="text"
                        value={config.text}
                        onChange={(e) => setConfig({ ...config, text: e.target.value })}
                        placeholder="Enter watermark copyright text..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                      />
                    </div>

                    {/* Quick Text Presets */}
                    <div>
                      <span className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                        Quick Stamp Presets
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_TEXTS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setConfig({ ...config, text: preset })}
                            className="text-[10px] px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold transition cursor-pointer"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Font Family
                      </label>
                      <select
                        value={config.fontFamily}
                        onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Watermark Logo Graphic
                    </label>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    {!config.logoSrc ? (
                      <div
                        onClick={() => logoInputRef.current?.click()}
                        className="p-5 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition space-y-1.5"
                      >
                        <ImageIcon className="w-6 h-6 mx-auto text-zinc-400" />
                        <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          Upload PNG / SVG Logo
                        </span>
                        <span className="block text-[10px] text-zinc-400">
                          Transparent backgrounds recommended
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={config.logoSrc}
                            alt="Logo"
                            className="w-10 h-10 object-contain rounded-lg bg-zinc-200 dark:bg-zinc-900 p-1"
                          />
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            Custom Logo Active
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfig({ ...config, logoSrc: null })}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md cursor-pointer"
                            title="Remove Logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {config.logoSrc && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-600 dark:text-zinc-400">Logo Scale:</span>
                          <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                            {config.logoSize}% width
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="60"
                          step="1"
                          value={config.logoSize}
                          onChange={(e) => setConfig({ ...config, logoSize: Number(e.target.value) })}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Style & Aesthetics */}
            {activeTab === 'style' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Opacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600 dark:text-zinc-400">Watermark Opacity:</span>
                    <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {config.opacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={config.opacity}
                    onChange={(e) => setConfig({ ...config, opacity: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>5% (Subtle)</span>
                    <span>50% (Proof)</span>
                    <span>100% (Solid)</span>
                  </div>
                </div>

                {config.type === 'text' && (
                  <>
                    {/* Font Size Scaling */}
                    <div className="space-y-1 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-600 dark:text-zinc-400">Size (Relative Scale):</span>
                        <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          {config.fontSize}% of image
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="22"
                        step="1"
                        value={config.fontSize}
                        onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-zinc-400">
                        Proportional scaling automatically keeps watermarks consistent across mixed image resolutions.
                      </p>
                    </div>

                    {/* Colors & Outline */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Fill Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.textColor}
                            onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                            className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
                          />
                          <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                            {config.textColor}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Text Outline
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            disabled={!config.textOutline}
                            value={config.outlineColor}
                            onChange={(e) => setConfig({ ...config, outlineColor: e.target.value })}
                            className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent disabled:opacity-40"
                          />
                          <label className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.textOutline}
                              onChange={(e) => setConfig({ ...config, textOutline: e.target.checked })}
                              className="rounded text-indigo-600 accent-indigo-600"
                            />
                            <span>Outline</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Rotation Angle */}
                <div className="space-y-1 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600 dark:text-zinc-400">Rotation Angle:</span>
                    <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {config.rotation}&deg;
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="5"
                    value={config.rotation}
                    onChange={(e) => setConfig({ ...config, rotation: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex gap-1.5 pt-1">
                    {[-45, -30, 0, 30, 45].map((angle) => (
                      <button
                        key={angle}
                        type="button"
                        onClick={() => setConfig({ ...config, rotation: angle })}
                        className={`text-[10px] flex-1 py-0.5 rounded border transition cursor-pointer ${
                          config.rotation === angle
                            ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                        }`}
                      >
                        {angle}&deg;
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Positioning & Grid */}
            {activeTab === 'position' && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                    Placement Matrix
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'tl', label: 'Top Left' },
                      { id: 'tc', label: 'Top Center' },
                      { id: 'tr', label: 'Top Right' },
                      { id: 'ml', label: 'Middle Left' },
                      { id: 'cc', label: 'Center' },
                      { id: 'mr', label: 'Middle Right' },
                      { id: 'bl', label: 'Bottom Left' },
                      { id: 'bc', label: 'Bottom Center' },
                      { id: 'br', label: 'Bottom Right' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setConfig({ ...config, position: pos.id as Position })}
                        className={`py-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                          config.position === pos.id
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, position: 'tile' })}
                    className={`w-full py-2.5 border rounded-xl text-xs font-bold mt-2.5 transition flex items-center justify-center gap-2 cursor-pointer ${
                      config.position === 'tile'
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    <span>Tiled Repeating Pattern (Full Protection)</span>
                  </button>
                </div>

                {config.position !== 'tile' && (
                  <div className="space-y-1 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400">Edge Inset Margin:</span>
                      <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {config.margin}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="1"
                      value={config.margin}
                      onChange={(e) => setConfig({ ...config, margin: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons: Single Download vs Batch ZIP Download */}
            <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800 space-y-2">
              {images.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadSingle}
                    className="saas-button-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Current Photo ({selectedIndex + 1}/{images.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBatchDownloadZip}
                    disabled={isProcessingBatch}
                    className="saas-button-primary w-full py-3 text-xs flex items-center justify-center gap-2 cursor-pointer font-bold"
                  >
                    <Archive className={`w-4 h-4 ${isProcessingBatch ? 'animate-spin' : ''}`} />
                    <span>
                      {isProcessingBatch
                        ? `Processing ${batchProgress.current}/${batchProgress.total}...`
                        : `Batch Download All as ZIP (${images.length} Photos)`}
                    </span>
                  </button>
                </>
              ) : (
                <div className="p-3 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                  Upload one or more photos to apply watermarks
                </div>
              )}
            </div>
          </div>

          {/* Quick Privacy Note */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zero Server Uploads &bull; Private RAM Execution</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
              All canvas drawing, font rendering, and multi-image ZIP deflation execute directly inside your browser. No photos or logos are transmitted across any network.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Canvas Workspace & Batch Filmstrip (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Batch Progress Bar */}
          {isProcessingBatch && (
            <div className="saas-card p-4 space-y-2 animate-fadeIn border-indigo-200 dark:border-indigo-900">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <Archive className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>
                    Watermarking batch: {batchProgress.current} of {batchProgress.total} images...
                  </span>
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {batchProgress.percent}%
                </span>
              </div>
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-200 rounded-full"
                  style={{ width: `${batchProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.heic,.heif,.svg,.bmp,.webp,.gif,.png,.jpg,.jpeg"
            onChange={(e) => {
              if (e.target.files) handleIncomingFiles(e.target.files);
            }}
            className="hidden"
          />
          <input
            ref={folderInputRef}
            type="file"
            // @ts-expect-error webkitdirectory standard
            webkitdirectory=""
            directory=""
            multiple
            onChange={(e) => {
              if (e.target.files) handleIncomingFiles(e.target.files);
            }}
            className="hidden"
          />

          {images.length === 0 ? (
            /* Upload Dropzone when no images are loaded */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files) handleIncomingFiles(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-3xl p-12 transition-all duration-200 text-center relative ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/20 scale-[1.005]'
                  : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/40'
              }`}
            >
              <div className="max-w-md mx-auto space-y-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Drop single or multiple photos to watermark
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Supports PNG, JPG, WebP, GIF, SVG, and AVIF &bull; Paste from clipboard with <kbd className="px-1 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 border rounded">Ctrl+V</kbd>
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="saas-button-primary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Select Photos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="saas-button-secondary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FolderUp className="w-3.5 h-3.5" />
                    <span>Upload Folder</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSampleImages}
                    className="saas-button-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
                    title="Load 3 sample test photos"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Try Samples</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Active Workspace with Canvas & Filmstrip */
            <div className="space-y-4">
              {/* Top Toolbar Above Canvas */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900 dark:text-white truncate max-w-xs">
                    {activeImage?.name}
                  </span>
                  <span className="text-zinc-400">&bull;</span>
                  <span className="font-mono text-zinc-500">
                    {activeImage?.width} &times; {activeImage?.height}px
                  </span>
                  <span className="text-zinc-400">&bull;</span>
                  <span className="font-mono text-zinc-500">
                    {activeImage?.sizeFormatted}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold transition cursor-pointer"
                  >
                    + Add More Photos
                  </button>
                  <button
                    type="button"
                    onClick={() => folderInputRef.current?.click()}
                    className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold transition cursor-pointer"
                  >
                    + Add Folder
                  </button>
                </div>
              </div>

              {/* Main Interactive Preview Canvas */}
              <div className="saas-card p-4 flex flex-col items-center justify-center min-h-[380px] max-h-[550px] overflow-auto bg-zinc-950/5 dark:bg-zinc-950/40 relative rounded-3xl border border-zinc-200 dark:border-zinc-800">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[480px] object-contain rounded-xl shadow-lg border border-zinc-200/50 dark:border-zinc-800/80"
                />
              </div>

              {/* Batch Filmstrip / Carousel (When 2 or more photos loaded) */}
              <div className="saas-card p-4 space-y-3 shadow-xs">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Batch Queue</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {images.length} {images.length === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>

                  <span className="text-[11px] text-zinc-400">
                    Click any thumbnail below to preview watermark
                  </span>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
                  {images.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedIndex(idx)}
                      className={`group relative shrink-0 w-20 h-20 rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200 ${
                        idx === selectedIndex
                          ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-105 shadow-md'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={item.src}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-2xs p-1 text-[9px] text-white truncate font-mono text-center">
                        {idx + 1}. {item.name}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(item.id, idx);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Educational & Practical Value Cards (AEO / GEO Optimization) */}
      <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="saas-card p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              Simultaneous Batch Watermarking
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Upload dozens of photos or an entire folder. Apply unified copyright stamps or branding logos across all photos and download everything as a single compressed ZIP archive.
            </p>
          </div>

          <div className="saas-card p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Grid3X3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              Tiled Repeating & 9-Point Grid
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Lock watermarks to corners, center stamps, or activate diagonal tiled repeating patterns that prevent unauthorized cropping and copyright infringement.
            </p>
          </div>

          <div className="saas-card p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              High-Resolution Resolution Scaling
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Relative font and logo scaling adapts intelligently across mixed image sizes, maintaining identical visual proportions on 4K camera shots and web graphics alike.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
