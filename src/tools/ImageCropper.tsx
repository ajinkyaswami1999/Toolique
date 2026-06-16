import { useState, useRef, useEffect } from 'react';
import { Crop, Upload, Download, RotateCcw, LayoutGrid, AlertCircle } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface CropBox {
  x: number; // in percentage of container width
  y: number; // in percentage of container height
  w: number; // in percentage of container width
  h: number; // in percentage of container height
}

export default function ImageCropper() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('free'); // free, 1:1, 16:9, 4:3
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [cropBox, setCropBox] = useState<CropBox>({ x: 10, y: 10, w: 80, h: 80 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<string | null>(null); // 'tl', 'tr', 'bl', 'br'
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [cropBoxStart, setCropBoxStart] = useState<CropBox>({ x: 0, y: 0, w: 0, h: 0 });

  // Handle image upload
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
        setCropBox({ x: 10, y: 10, w: 80, h: 80 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag box or resize handlers
  const handleMouseDown = (e: React.MouseEvent, type: string | null) => {
    e.preventDefault();
    if (!containerRef.current || !imageSrc) return;

    setDragStart({ x: e.clientX, y: e.clientY });
    setCropBoxStart({ ...cropBox });

    if (type === 'drag') {
      setIsDragging(true);
    } else {
      setIsResizing(type);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      if (!containerRef.current || !imgRef.current) return;

      const rect = imgRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

      if (isDragging) {
        let newX = cropBoxStart.x + deltaX;
        let newY = cropBoxStart.y + deltaY;

        // Boundary constraints
        newX = Math.max(0, Math.min(newX, 100 - cropBoxStart.w));
        newY = Math.max(0, Math.min(newY, 100 - cropBoxStart.h));

        setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (isResizing) {
        let newX = cropBoxStart.x;
        let newY = cropBoxStart.y;
        let newW = cropBoxStart.w;
        let newH = cropBoxStart.h;

        const ratioVal =
          aspectRatio === '1:1' ? 1 : aspectRatio === '16:9' ? 16 / 9 : aspectRatio === '4:3' ? 4 / 3 : null;

        const imgAspectRatio = rect.width / rect.height;

        if (isResizing === 'br') {
          newW = Math.max(10, Math.min(cropBoxStart.w + deltaX, 100 - cropBoxStart.x));
          if (ratioVal) {
            newH = (newW * ratioVal) / imgAspectRatio;
            if (newY + newH > 100) {
              newH = 100 - newY;
              newW = (newH * imgAspectRatio) / ratioVal;
            }
          } else {
            newH = Math.max(10, Math.min(cropBoxStart.h + deltaY, 100 - cropBoxStart.y));
          }
        } else if (isResizing === 'bl') {
          const maxW = cropBoxStart.x + cropBoxStart.w;
          newW = Math.max(10, Math.min(cropBoxStart.w - deltaX, maxW));
          newX = maxW - newW;
          if (ratioVal) {
            newH = (newW * ratioVal) / imgAspectRatio;
            if (newY + newH > 100) {
              newH = 100 - newY;
              newW = (newH * imgAspectRatio) / ratioVal;
              newX = maxW - newW;
            }
          } else {
            newH = Math.max(10, Math.min(cropBoxStart.h + deltaY, 100 - cropBoxStart.y));
          }
        } else if (isResizing === 'tr') {
          newW = Math.max(10, Math.min(cropBoxStart.w + deltaX, 100 - cropBoxStart.x));
          if (ratioVal) {
            newH = (newW * ratioVal) / imgAspectRatio;
            newY = cropBoxStart.y + cropBoxStart.h - newH;
            if (newY < 0) {
              newY = 0;
              newH = cropBoxStart.y + cropBoxStart.h;
              newW = (newH * imgAspectRatio) / ratioVal;
            }
          } else {
            const maxH = cropBoxStart.y + cropBoxStart.h;
            newH = Math.max(10, Math.min(cropBoxStart.h - deltaY, maxH));
            newY = maxH - newH;
          }
        } else if (isResizing === 'tl') {
          const maxW = cropBoxStart.x + cropBoxStart.w;
          newW = Math.max(10, Math.min(cropBoxStart.w - deltaX, maxW));
          newX = maxW - newW;

          if (ratioVal) {
            newH = (newW * ratioVal) / imgAspectRatio;
            newY = cropBoxStart.y + cropBoxStart.h - newH;
            if (newY < 0) {
              newY = 0;
              newH = cropBoxStart.y + cropBoxStart.h;
              newW = (newH * imgAspectRatio) / ratioVal;
              newX = maxW - newW;
            }
          } else {
            const maxH = cropBoxStart.y + cropBoxStart.h;
            newH = Math.max(10, Math.min(cropBoxStart.h - deltaY, maxH));
            newY = maxH - newH;
          }
        }

        setCropBox({ x: newX, y: newY, w: newW, h: newH });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, cropBoxStart, aspectRatio]);

  // Handle aspect ratio change
  const handleRatioPreset = (preset: string) => {
    setAspectRatio(preset);
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const imgAspectRatio = rect.width / rect.height;

    let w = 80;
    let h = 80;

    if (preset === '1:1') {
      if (imgAspectRatio > 1) {
        h = 80;
        w = h / imgAspectRatio;
      } else {
        w = 80;
        h = w * imgAspectRatio;
      }
    } else if (preset === '16:9') {
      const targetRatio = 16 / 9;
      if (imgAspectRatio > targetRatio) {
        h = 80;
        w = (h * targetRatio) / imgAspectRatio;
      } else {
        w = 80;
        h = (w / targetRatio) * imgAspectRatio;
      }
    } else if (preset === '4:3') {
      const targetRatio = 4 / 3;
      if (imgAspectRatio > targetRatio) {
        h = 80;
        w = (h * targetRatio) / imgAspectRatio;
      } else {
        w = 80;
        h = (w / targetRatio) * imgAspectRatio;
      }
    }

    setCropBox({
      x: (100 - w) / 2,
      y: (100 - h) / 2,
      w,
      h,
    });
  };

  // Perform crop calculation and trigger download
  const handleDownload = () => {
    if (!imageSrc || !imgRef.current) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Map percentage bounds to actual original image pixels
      const sx = (cropBox.x / 100) * img.naturalWidth;
      const sy = (cropBox.y / 100) * img.naturalHeight;
      const sw = (cropBox.w / 100) * img.naturalWidth;
      const sh = (cropBox.h / 100) * img.naturalHeight;

      canvas.width = sw;
      canvas.height = sh;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cropped_${fileName || 'image.png'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Settings & Controls Panel */}
      <div className="md:col-span-4 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Crop className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-white text-sm">Crop Editor</h3>
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

        {/* Aspect Ratio Config */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2.5">Aspect Ratio Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'free', label: 'Free Aspect' },
              { id: '1:1', label: 'Square (1:1)' },
              { id: '16:9', label: 'Widescreen (16:9)' },
              { id: '4:3', label: 'Standard (4:3)' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleRatioPreset(preset.id)}
                disabled={!imageSrc}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition disabled:opacity-40 ${
                  aspectRatio === preset.id
                    ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-zinc-400 dark:text-zinc-550 leading-relaxed bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl space-y-2 border border-zinc-100 dark:border-zinc-800/60">
          <div className="flex gap-1.5 items-start">
            <LayoutGrid className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            <span className="font-semibold text-zinc-650 dark:text-zinc-300">How to Crop:</span>
          </div>
          <ul className="list-disc pl-4 space-y-1">
            <li>Drag the bounding box selection to reposition.</li>
            <li>Drag any of the corner handles to resize.</li>
            <li>Click download to save the cropped selection.</li>
          </ul>
        </div>

        {imageSrc && (
          <button
            onClick={handleDownload}
            className="saas-button-primary w-full py-3"
          >
            <Download className="w-4 h-4" />
            <span>Download Crop</span>
          </button>
        )}
      </div>

      {/* Upload / Workspace Area */}
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
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Upload Image to Crop</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">PNG, JPG, WebP supported</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        ) : (
          <div
            ref={containerRef}
            className="relative select-none max-w-full overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-950/5"
            style={{ maxHeight: '500px' }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Source Crop"
              className="pointer-events-none block max-w-full h-auto"
              style={{ maxHeight: '500px' }}
            />

            {/* Backdrop Dimmer overlay */}
            <div className="absolute inset-0 bg-black/55 pointer-events-none" />

            {/* Bounding Crop Box Window */}
            <div
              className="absolute border border-dashed border-white cursor-move"
              style={{
                left: `${cropBox.x}%`,
                top: `${cropBox.y}%`,
                width: `${cropBox.w}%`,
                height: `${cropBox.h}%`,
              }}
              onMouseDown={(e) => handleMouseDown(e, 'drag')}
            >
              {/* Image Preview within crop window (reverse mask trick) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  background: `url(${imageSrc})`,
                  backgroundSize: `${10000 / cropBox.w}% ${10000 / cropBox.h}%`,
                  backgroundPosition: `${(cropBox.x / (100 - cropBox.w)) * 100}% ${(cropBox.y / (100 - cropBox.h)) * 100}%`,
                }}
              />

              {/* Corner Resize Handles */}
              <div
                className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white rounded-full cursor-nwse-resize z-10"
                onMouseDown={(e) => handleMouseDown(e, 'tl')}
              />
              <div
                className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full cursor-nesw-resize z-10"
                onMouseDown={(e) => handleMouseDown(e, 'tr')}
              />
              <div
                className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white rounded-full cursor-nesw-resize z-10"
                onMouseDown={(e) => handleMouseDown(e, 'bl')}
              />
              <div
                className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white rounded-full cursor-nwse-resize z-10"
                onMouseDown={(e) => handleMouseDown(e, 'br')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
