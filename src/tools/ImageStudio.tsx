import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  Sliders,
  FileImage,
  Download,
  Upload,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Lock,
  Unlock,
  Sparkles,
  Layers,
  Archive,
  Trash2,
  AlertCircle,
  Check,
  Copy,
  RefreshCw,
  Zap,
  SlidersHorizontal,
  SplitSquareVertical,
  Eye,
  Maximize2
} from 'lucide-react';
import JSZip from 'jszip';

// Dynamically load heic2any locally via Vite code-splitting
const loadHeic2Any = async (): Promise<any> => {
  const module = await import('heic2any');
  return module.default;
};

export type StudioTab = 'studio' | 'compress' | 'crop' | 'resize' | 'batch';

export interface ImageStudioProps {
  initialTab?: StudioTab;
}

interface CropBox {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  w: number; // percentage (0-100)
  h: number; // percentage (0-100)
}

interface BatchItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  processedBlob: Blob | null;
  processedUrl: string | null;
  processedSize: number;
  processedWidth: number;
  processedHeight: number;
  error?: string;
}

// Preset Quick-Actions
const SMART_PRESETS = [
  {
    id: 'passport',
    label: 'Passport / Govt Form',
    desc: '600×600 px • JPG < 50 KB',
    badge: 'UPSC / Visa',
    action: {
      cropAspect: '1:1',
      width: 600,
      height: 600,
      format: 'image/jpeg',
      mode: 'targetSize' as const,
      targetKb: 45,
      quality: 80,
    },
  },
  {
    id: 'web-seo',
    label: 'Web & SEO Performance',
    desc: 'Max 1920 px • WebP < 150 KB',
    badge: 'Core Web Vitals',
    action: {
      cropAspect: 'free',
      width: 1920,
      height: 1080,
      format: 'image/webp',
      mode: 'quality' as const,
      targetKb: 120,
      quality: 80,
    },
  },
  {
    id: 'instagram-post',
    label: 'Instagram Square Post',
    desc: '1080×1080 px • 1:1 Aspect',
    badge: 'Social Media',
    action: {
      cropAspect: '1:1',
      width: 1080,
      height: 1080,
      format: 'image/jpeg',
      mode: 'quality' as const,
      targetKb: 300,
      quality: 90,
    },
  },
  {
    id: 'youtube-thumb',
    label: 'YouTube Thumbnail',
    desc: '1280×720 px • 16:9 HD',
    badge: '16:9 Widescreen',
    action: {
      cropAspect: '16:9',
      width: 1280,
      height: 720,
      format: 'image/jpeg',
      mode: 'quality' as const,
      targetKb: 800,
      quality: 90,
    },
  },
  {
    id: 'whatsapp-share',
    label: 'WhatsApp / Email Quick Share',
    desc: 'Max 800 px • WebP < 90 KB',
    badge: 'Fast Transfer',
    action: {
      cropAspect: 'free',
      width: 800,
      height: 800,
      format: 'image/webp',
      mode: 'targetSize' as const,
      targetKb: 80,
      quality: 75,
    },
  },
];

const ASPECT_RATIO_OPTIONS = [
  { id: 'free', label: 'Free Aspect', ratio: null },
  { id: '1:1', label: 'Square (1:1)', ratio: 1 },
  { id: '16:9', label: 'Landscape (16:9)', ratio: 16 / 9 },
  { id: '9:16', label: 'Stories/Reels (9:16)', ratio: 9 / 16 },
  { id: '4:3', label: 'Standard (4:3)', ratio: 4 / 3 },
  { id: '3:2', label: 'Photography (3:2)', ratio: 3 / 2 },
  { id: '2:3', label: 'Portrait (2:3)', ratio: 2 / 3 },
  { id: '21:9', label: 'Ultrawide (21:9)', ratio: 21 / 9 },
];

export default function ImageStudio({ initialTab = 'studio' }: ImageStudioProps) {
  // Active Tab
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab);

  // Single Image State
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [originalSize, setOriginalSize] = useState<number>(0);

  // Crop & Transform State
  const [aspectRatio, setAspectRatio] = useState<string>('free');
  const [cropBox, setCropBox] = useState<CropBox>({ x: 0, y: 0, w: 100, h: 100 });
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [enableCrop, setEnableCrop] = useState<boolean>(true);

  // Resize State
  const [enableResize, setEnableResize] = useState<boolean>(false);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [scalePct, setScalePct] = useState<number>(100);

  // Compression & Format State
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');
  const [compressionMode, setCompressionMode] = useState<'quality' | 'targetSize'>('quality');
  const [quality, setQuality] = useState<number>(85);
  const [targetSizeKb, setTargetSizeKb] = useState<number>(150);
  const [matteBgColor, setMatteBgColor] = useState<string>('#FFFFFF'); // for PNG -> JPG transparency fill

  // Output Result State
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedWidth, setProcessedWidth] = useState<number>(0);
  const [processedHeight, setProcessedHeight] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [heicConverting, setHeicConverting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Split Screen Comparison Slider State
  const [showSplitView, setShowSplitView] = useState<boolean>(true);
  const [splitPosition, setSplitPosition] = useState<number>(50); // percentage 0 to 100
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  // Cropper Interactive Dragging State
  const [isDraggingCrop, setIsDraggingCrop] = useState<boolean>(false);
  const [isResizingHandle, setIsResizingHandle] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cropBoxStart, setCropBoxStart] = useState<CropBox>({ x: 0, y: 0, w: 100, h: 100 });

  // Batch Multi-Image State
  const [batchQueue, setBatchQueue] = useState<BatchItem[]>([]);
  const [batchQuality, setBatchQuality] = useState<number>(80);
  const [batchFormat, setBatchFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');
  const [batchMaxDim, setBatchMaxDim] = useState<number>(1920);
  const [batchEnableResize, setBatchEnableResize] = useState<boolean>(true);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);
  const cropImageRef = useRef<HTMLImageElement | null>(null);
  const cropContainerRef = useRef<HTMLDivElement | null>(null);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);

  const isHeic = (file: File) => {
    const name = file.name.toLowerCase();
    return name.endsWith('.heic') || name.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Process uploaded single file
  const handleSingleFileUpload = async (file: File) => {
    setErrorMessage(null);
    setStatusMessage(null);

    // Clean up previous URLs
    if (rawImageSrc) {
      URL.revokeObjectURL(rawImageSrc);
      setRawImageSrc(null);
    }
    if (processedUrl) {
      URL.revokeObjectURL(processedUrl);
      setProcessedUrl(null);
      setProcessedBlob(null);
    }

    let fileToProcess = file;

    if (isHeic(file)) {
      setHeicConverting(true);
      try {
        const heic2anyLib = await loadHeic2Any();
        const conversionResult = await heic2anyLib({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.92,
        });
        const resultBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
        const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
        fileToProcess = new File([resultBlob], newName, { type: 'image/jpeg' });
        setStatusMessage('Apple HEIC photo converted to JPEG in browser.');
      } catch (err: any) {
        setErrorMessage(err.message || 'HEIC conversion failed. Please use JPG, PNG, or WebP.');
        setHeicConverting(false);
        return;
      }
      setHeicConverting(false);
    }

    setCurrentFile(fileToProcess);
    setOriginalSize(fileToProcess.size);

    const blobUrl = URL.createObjectURL(fileToProcess);
    setRawImageSrc(blobUrl);

    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
      setScalePct(100);
      setCropBox({ x: 0, y: 0, w: 100, h: 100 });
      setRotation(0);
      setFlipH(false);
      setFlipV(false);

      // Default format suggestion
      if (fileToProcess.type === 'image/png') {
        setOutputFormat('image/webp');
      } else if (fileToProcess.type === 'image/webp') {
        setOutputFormat('image/webp');
      } else {
        setOutputFormat('image/jpeg');
      }

      // Default target size calculation
      const fileKb = Math.ceil(fileToProcess.size / 1024);
      setTargetSizeKb(Math.max(20, Math.round(fileKb * 0.4)));
    };
    img.src = blobUrl;
  };

  // Handle batch file additions
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: BatchItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let fileToUse = file;

      if (isHeic(file)) {
        try {
          const heic2anyLib = await loadHeic2Any();
          const conversionResult = await heic2anyLib({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9,
          });
          const resultBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
          fileToUse = new File([resultBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
        } catch {
          // ignore or skip
        }
      }

      const previewUrl = URL.createObjectURL(fileToUse);
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = previewUrl;
      });

      newItems.push({
        id: `${file.name}-${Date.now()}-${i}`,
        file: fileToUse,
        name: fileToUse.name,
        originalSize: fileToUse.size,
        originalWidth: img.naturalWidth || 800,
        originalHeight: img.naturalHeight || 600,
        previewUrl,
        status: 'pending',
        processedBlob: null,
        processedUrl: null,
        processedSize: 0,
        processedWidth: 0,
        processedHeight: 0,
      });
    }

    setBatchQueue((prev) => [...prev, ...newItems]);
    if (batchFileInputRef.current) {
      batchFileInputRef.current.value = '';
    }
  };

  // Primary Unified Render & Export Engine
  const runProcessPipeline = useCallback(async () => {
    if (!rawImageSrc || !currentFile) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const img = new Image();
      img.src = rawImageSrc;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load source image into canvas.'));
      });

      // 1. Calculate Crop Source Box in Natural Image Coordinates
      let sx = 0;
      let sy = 0;
      let sw = img.naturalWidth;
      let sh = img.naturalHeight;

      if (enableCrop && (cropBox.w < 100 || cropBox.h < 100 || cropBox.x > 0 || cropBox.y > 0)) {
        sx = Math.round((cropBox.x / 100) * img.naturalWidth);
        sy = Math.round((cropBox.y / 100) * img.naturalHeight);
        sw = Math.round((cropBox.w / 100) * img.naturalWidth);
        sh = Math.round((cropBox.h / 100) * img.naturalHeight);
      }

      // Safe clamp
      sw = Math.max(1, Math.min(sw, img.naturalWidth - sx));
      sh = Math.max(1, Math.min(sh, img.naturalHeight - sy));

      // 2. Intermediate Crop & Transform Canvas (Handles rotation & flip)
      const isRotated90or270 = rotation === 90 || rotation === 270;
      const intermediateWidth = isRotated90or270 ? sh : sw;
      const intermediateHeight = isRotated90or270 ? sw : sh;

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = intermediateWidth;
      cropCanvas.height = intermediateHeight;
      const cropCtx = cropCanvas.getContext('2d');
      if (!cropCtx) throw new Error('Could not initialize canvas context.');

      cropCtx.imageSmoothingEnabled = true;
      cropCtx.imageSmoothingQuality = 'high';

      // Move origin to center for rotation/flip transformations
      cropCtx.translate(intermediateWidth / 2, intermediateHeight / 2);
      if (rotation !== 0) {
        cropCtx.rotate((rotation * Math.PI) / 180);
      }
      if (flipH || flipV) {
        cropCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      }

      // Draw cropped slice centered
      cropCtx.drawImage(img, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);

      // 3. Final Output Resizing Canvas
      let finalW = intermediateWidth;
      let finalH = intermediateHeight;

      if (enableResize && targetWidth > 0 && targetHeight > 0) {
        finalW = targetWidth;
        finalH = targetHeight;
      }

      // Safety resolution cap (max 6144px)
      const SAFETY_MAX = 6144;
      if (finalW > SAFETY_MAX || finalH > SAFETY_MAX) {
        const ratio = Math.min(SAFETY_MAX / finalW, SAFETY_MAX / finalH);
        finalW = Math.round(finalW * ratio);
        finalH = Math.round(finalH * ratio);
      }

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = finalW;
      finalCanvas.height = finalH;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) throw new Error('Could not initialize final render canvas.');

      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';

      // If output format is JPEG and has transparency, fill with matte background color
      if (outputFormat === 'image/jpeg') {
        finalCtx.fillStyle = matteBgColor || '#FFFFFF';
        finalCtx.fillRect(0, 0, finalW, finalH);
      }

      finalCtx.drawImage(cropCanvas, 0, 0, finalW, finalH);

      // 4. Compression & Blob Generation
      let outBlob: Blob | null = null;

      if (compressionMode === 'targetSize' && outputFormat !== 'image/png') {
        const targetSizeBytes = targetSizeKb * 1024;
        let minQ = 0.01;
        let maxQ = 0.99;
        let bestBlob: Blob | null = null;
        let bestDiff = Infinity;

        // Perform Binary Search (7 iterations for high precision)
        for (let i = 0; i < 7; i++) {
          const midQ = (minQ + maxQ) / 2;

          const blob = await new Promise<Blob | null>((res) => {
            finalCanvas.toBlob((b) => res(b), outputFormat, midQ);
          });

          if (!blob) break;

          const diff = Math.abs(blob.size - targetSizeBytes);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestBlob = blob;
          }

          if (blob.size > targetSizeBytes) {
            maxQ = midQ;
          } else {
            minQ = midQ;
          }
        }
        outBlob = bestBlob;
      } else {
        const qVal = outputFormat === 'image/png' ? undefined : quality / 100;
        outBlob = await new Promise<Blob | null>((res) => {
          finalCanvas.toBlob((b) => res(b), outputFormat, qVal);
        });
      }

      if (!outBlob) throw new Error('Failed to encode output image.');

      if (processedUrl) {
        URL.revokeObjectURL(processedUrl);
      }

      const newUrl = URL.createObjectURL(outBlob);
      setProcessedBlob(outBlob);
      setProcessedUrl(newUrl);
      setProcessedWidth(finalW);
      setProcessedHeight(finalH);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during image processing.');
    } finally {
      setIsProcessing(false);
    }
  }, [
    rawImageSrc,
    currentFile,
    enableCrop,
    cropBox,
    rotation,
    flipH,
    flipV,
    enableResize,
    targetWidth,
    targetHeight,
    outputFormat,
    matteBgColor,
    compressionMode,
    targetSizeKb,
    quality,
    processedUrl,
  ]);

  // Auto-run pipeline on parameter change (debounced for smooth responsiveness)
  useEffect(() => {
    if (!rawImageSrc) return;
    const timer = setTimeout(() => {
      runProcessPipeline();
    }, 180);
    return () => clearTimeout(timer);
  }, [
    rawImageSrc,
    enableCrop,
    cropBox,
    rotation,
    flipH,
    flipV,
    enableResize,
    targetWidth,
    targetHeight,
    outputFormat,
    matteBgColor,
    compressionMode,
    targetSizeKb,
    quality,
  ]);

  // Aspect ratio preset handler
  const handleRatioChange = (ratioKey: string) => {
    setAspectRatio(ratioKey);
    const targetPreset = ASPECT_RATIO_OPTIONS.find((p) => p.id === ratioKey);
    if (!targetPreset || targetPreset.ratio === null) return;

    const naturalRatio = originalWidth / (originalHeight || 1);
    const targetRatio = targetPreset.ratio;

    let w = 80;
    let h = 80;

    if (naturalRatio > targetRatio) {
      h = 80;
      w = (h * targetRatio) / naturalRatio;
    } else {
      w = 80;
      h = (w / targetRatio) * naturalRatio;
    }

    setCropBox({
      x: Math.max(0, (100 - w) / 2),
      y: Math.max(0, (100 - h) / 2),
      w: Math.min(100, w),
      h: Math.min(100, h),
    });
  };

  // Dimension changes with aspect lock
  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setTargetHeight(Math.round(val * ratio));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setTargetWidth(Math.round(val * ratio));
    }
  };

  const handlePercentageChange = (pct: number) => {
    setScalePct(pct);
    const newW = Math.round((originalWidth * pct) / 100);
    const newH = Math.round((originalHeight * pct) / 100);
    setTargetWidth(newW);
    setTargetHeight(newH);
  };

  // Smart Preset Click Handler
  const applySmartPreset = (preset: (typeof SMART_PRESETS)[0]) => {
    handleRatioChange(preset.action.cropAspect);
    setTargetWidth(preset.action.width);
    setTargetHeight(preset.action.height);
    setEnableResize(true);
    setOutputFormat(preset.action.format as any);
    setCompressionMode(preset.action.mode);
    setTargetSizeKb(preset.action.targetKb);
    setQuality(preset.action.quality);
    setStatusMessage(`Applied preset: ${preset.label}`);
  };

  // Dragging & Resizing Crop Window Handler
  const handleMouseDownCrop = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    if (!cropContainerRef.current) return;
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setCropBoxStart({ ...cropBox });

    if (type === 'drag') {
      setIsDraggingCrop(true);
    } else {
      setIsResizingHandle(type);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingCrop && !isResizingHandle) return;
      if (!cropContainerRef.current || !cropImageRef.current) return;

      const rect = cropImageRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStartPos.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStartPos.y) / rect.height) * 100;

      if (isDraggingCrop) {
        let newX = cropBoxStart.x + deltaX;
        let newY = cropBoxStart.y + deltaY;

        newX = Math.max(0, Math.min(newX, 100 - cropBoxStart.w));
        newY = Math.max(0, Math.min(newY, 100 - cropBoxStart.h));

        setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (isResizingHandle) {
        let newX = cropBoxStart.x;
        let newY = cropBoxStart.y;
        let newW = cropBoxStart.w;
        let newH = cropBoxStart.h;

        const preset = ASPECT_RATIO_OPTIONS.find((o) => o.id === aspectRatio);
        const ratioVal = preset?.ratio || null;
        const imgAspect = rect.width / rect.height;

        if (isResizingHandle === 'br') {
          newW = Math.max(5, Math.min(cropBoxStart.w + deltaX, 100 - cropBoxStart.x));
          if (ratioVal) {
            newH = (newW * ratioVal) / imgAspect;
            if (newY + newH > 100) {
              newH = 100 - newY;
              newW = (newH * imgAspect) / ratioVal;
            }
          } else {
            newH = Math.max(5, Math.min(cropBoxStart.h + deltaY, 100 - cropBoxStart.y));
          }
        } else if (isResizingHandle === 'bl') {
          const maxW = cropBoxStart.x + cropBoxStart.w;
          newW = Math.max(5, Math.min(cropBoxStart.w - deltaX, maxW));
          newX = maxW - newW;
          if (ratioVal) {
            newH = (newW * ratioVal) / imgAspect;
            if (newY + newH > 100) {
              newH = 100 - newY;
              newW = (newH * imgAspect) / ratioVal;
              newX = maxW - newW;
            }
          } else {
            newH = Math.max(5, Math.min(cropBoxStart.h + deltaY, 100 - cropBoxStart.y));
          }
        } else if (isResizingHandle === 'tr') {
          newW = Math.max(5, Math.min(cropBoxStart.w + deltaX, 100 - cropBoxStart.x));
          if (ratioVal) {
            newH = (newW * ratioVal) / imgAspect;
            newY = cropBoxStart.y + cropBoxStart.h - newH;
            if (newY < 0) {
              newY = 0;
              newH = cropBoxStart.y + cropBoxStart.h;
              newW = (newH * imgAspect) / ratioVal;
            }
          } else {
            const maxH = cropBoxStart.y + cropBoxStart.h;
            newH = Math.max(5, Math.min(cropBoxStart.h - deltaY, maxH));
            newY = maxH - newH;
          }
        } else if (isResizingHandle === 'tl') {
          const maxW = cropBoxStart.x + cropBoxStart.w;
          newW = Math.max(5, Math.min(cropBoxStart.w - deltaX, maxW));
          newX = maxW - newW;
          if (ratioVal) {
            newH = (newW * ratioVal) / imgAspect;
            newY = cropBoxStart.y + cropBoxStart.h - newH;
            if (newY < 0) {
              newY = 0;
              newH = cropBoxStart.y + cropBoxStart.h;
              newW = (newH * imgAspect) / ratioVal;
              newX = maxW - newW;
            }
          } else {
            const maxH = cropBoxStart.y + cropBoxStart.h;
            newH = Math.max(5, Math.min(cropBoxStart.h - deltaY, maxH));
            newY = maxH - newH;
          }
        }

        setCropBox({ x: newX, y: newY, w: newW, h: newH });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingCrop(false);
      setIsResizingHandle(null);
    };

    if (isDraggingCrop || isResizingHandle) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingCrop, isResizingHandle, dragStartPos, cropBoxStart, aspectRatio]);

  // Split-screen drag handler
  useEffect(() => {
    const handleSplitMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplit || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const pos = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.max(5, Math.min(95, pos)));
    };

    const handleSplitMouseUp = () => {
      setIsDraggingSplit(false);
    };

    if (isDraggingSplit) {
      window.addEventListener('mousemove', handleSplitMouseMove);
      window.addEventListener('mouseup', handleSplitMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleSplitMouseMove);
      window.removeEventListener('mouseup', handleSplitMouseUp);
    };
  }, [isDraggingSplit]);

  // Download Single Processed File
  const handleDownloadSingle = () => {
    if (!processedUrl || !currentFile) return;
    const link = document.createElement('a');
    const ext = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat === 'image/png' ? 'png' : 'webp';
    const dotIdx = currentFile.name.lastIndexOf('.');
    const baseName = dotIdx > 0 ? currentFile.name.substring(0, dotIdx) : currentFile.name;
    link.download = `${baseName}-optimized.${ext}`;
    link.href = processedUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Image to Clipboard
  const handleCopyToClipboard = async () => {
    if (!processedBlob) return;
    try {
      // Browsers require PNG for clipboard image items
      let blobToCopy = processedBlob;
      if (processedBlob.type !== 'image/png') {
        const img = new Image();
        img.src = URL.createObjectURL(processedBlob);
        await new Promise((res) => (img.onload = res));
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        blobToCopy = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'));
      }
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blobToCopy,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err: any) {
      setErrorMessage('Could not copy image to clipboard in this browser.');
    }
  };

  // Run Batch Processing
  const runBatchProcessing = async () => {
    if (batchQueue.length === 0 || isBatchProcessing) return;
    setIsBatchProcessing(true);

    const updatedQueue = [...batchQueue];

    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (item.status === 'done') continue;

      setBatchProgress({ current: i + 1, total: updatedQueue.length });
      item.status = 'processing';
      setBatchQueue([...updatedQueue]);

      try {
        const img = new Image();
        img.src = item.previewUrl;
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = () => rej(new Error('Failed to load image.'));
        });

        let w = img.naturalWidth;
        let h = img.naturalHeight;

        if (batchEnableResize && (w > batchMaxDim || h > batchMaxDim)) {
          const ratio = Math.min(batchMaxDim / w, batchMaxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas init error');

        if (batchFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
        }

        ctx.drawImage(img, 0, 0, w, h);

        const q = batchFormat === 'image/png' ? undefined : batchQuality / 100;
        const blob = await new Promise<Blob | null>((res) => {
          canvas.toBlob((b) => res(b), batchFormat, q);
        });

        if (!blob) throw new Error('Encoding error');

        item.processedBlob = blob;
        item.processedUrl = URL.createObjectURL(blob);
        item.processedSize = blob.size;
        item.processedWidth = w;
        item.processedHeight = h;
        item.status = 'done';
      } catch (err: any) {
        item.status = 'error';
        item.error = err.message || 'Processing failed';
      }

      setBatchQueue([...updatedQueue]);
    }

    setIsBatchProcessing(false);
  };

  // Download All Batch Items as ZIP
  const downloadBatchZip = async () => {
    const doneItems = batchQueue.filter((item) => item.status === 'done' && item.processedBlob);
    if (doneItems.length === 0) return;

    const zip = new JSZip();
    const ext = batchFormat === 'image/jpeg' ? 'jpg' : batchFormat === 'image/png' ? 'png' : 'webp';

    doneItems.forEach((item) => {
      const dotIdx = item.name.lastIndexOf('.');
      const baseName = dotIdx > 0 ? item.name.substring(0, dotIdx) : item.name;
      zip.file(`${baseName}-optimized.${ext}`, item.processedBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.download = `Toolique-Optimized-Images-${Date.now()}.zip`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset current single file workspace
  const handleResetSingle = () => {
    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setCurrentFile(null);
    setRawImageSrc(null);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setOriginalSize(0);
    setProcessedBlob(null);
    setProcessedUrl(null);
    setCropBox({ x: 0, y: 0, w: 100, h: 100 });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setErrorMessage(null);
    setStatusMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const calculateSavingsPercent = () => {
    if (!originalSize || !processedBlob) return 0;
    const diff = originalSize - processedBlob.size;
    return Math.round((diff / originalSize) * 100);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-left">
      {/* Studio Header & Tab Switcher Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Image Studio & Optimizer
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
                All-in-One Pro
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crop, Resize, Compress & Convert PNG, JPG, WebP, and HEIC images with 100% browser privacy.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60 self-stretch md:self-auto">
          {[
            { id: 'studio', label: 'All-in-One Studio', icon: Sparkles },
            { id: 'compress', label: 'Compressor', icon: SlidersHorizontal },
            { id: 'crop', label: 'Cropper', icon: Crop },
            { id: 'resize', label: 'Resizer', icon: Sliders },
            { id: 'batch', label: 'Batch Optimizer', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as StudioTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded">
            ×
          </button>
        </div>
      )}

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/25 border border-teal-200 dark:border-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-500 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="p-1 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded">
            ×
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB: BATCH MULTI-IMAGE OPTIMIZER                    */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'batch' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Config Panel */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-500" />
                Batch Settings
              </h3>
              {batchQueue.length > 0 && (
                <button
                  onClick={() => setBatchQueue([])}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>

            {/* Output Format */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Target Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'image/webp', label: 'WebP (Smallest)' },
                  { id: 'image/jpeg', label: 'JPEG (Universal)' },
                  { id: 'image/png', label: 'PNG (Lossless)' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setBatchFormat(fmt.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      batchFormat === fmt.id
                        ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider (for lossy formats) */}
            {batchFormat !== 'image/png' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Batch Quality</label>
                  <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">{batchQuality}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={batchQuality}
                  onChange={(e) => setBatchQuality(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>
            )}

            {/* Max Resolution Constraint */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Cap Maximum Dimension
                </label>
                <input
                  type="checkbox"
                  checked={batchEnableResize}
                  onChange={(e) => setBatchEnableResize(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
              </div>
              {batchEnableResize && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[1080, 1920, 2560].map((dim) => (
                    <button
                      key={dim}
                      onClick={() => setBatchMaxDim(dim)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                        batchMaxDim === dim
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {dim}px
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={runBatchProcessing}
                disabled={batchQueue.length === 0 || isBatchProcessing}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-teal-500/10 transition flex items-center justify-center gap-2"
              >
                {isBatchProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing ({batchProgress.current}/{batchProgress.total})...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Process All {batchQueue.length} Images</span>
                  </>
                )}
              </button>

              <button
                onClick={downloadBatchZip}
                disabled={!batchQueue.some((i) => i.status === 'done')}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
              >
                <Archive className="w-4 h-4" />
                <span>Download All as ZIP Archive</span>
              </button>
            </div>
          </div>

          {/* Right Queue Workspace */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between min-h-[450px]">
            <div>
              {/* Batch Upload Dropzone */}
              <div
                onClick={() => batchFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition mb-6"
              >
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-0.5">
                  Select or Drop Multiple Images
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Bulk convert and compress JPG, PNG, WebP, and HEIC in parallel
                </span>
                <input
                  type="file"
                  multiple
                  ref={batchFileInputRef}
                  onChange={handleBatchUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Items List */}
              {batchQueue.length > 0 ? (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {batchQueue.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-200 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {formatSize(item.originalSize)} ({item.originalWidth}×{item.originalHeight}px)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {item.status === 'processing' && (
                          <span className="text-teal-500 font-semibold flex items-center gap-1">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Compressing
                          </span>
                        )}
                        {item.status === 'done' && (
                          <div className="text-right">
                            <div className="font-bold text-teal-600 dark:text-teal-400">
                              {formatSize(item.processedSize)} ({Math.round(((item.originalSize - item.processedSize) / item.originalSize) * 100)}% saved)
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {item.processedWidth}×{item.processedHeight}px
                            </div>
                          </div>
                        )}
                        {item.status === 'error' && (
                          <span className="text-rose-500 font-semibold">{item.error}</span>
                        )}

                        {item.processedUrl && (
                          <a
                            href={item.processedUrl}
                            download={`optimized-${item.name}`}
                            className="p-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition"
                            title="Download single file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => {
                            setBatchQueue((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 dark:text-slate-600 text-xs">
                  No images in batch queue. Upload photos above to start batch optimization.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ---------------------------------------------------- */
        /* SINGLE IMAGE WORKSPACE (Studio / Crop / Resize / Compress) */
        /* ---------------------------------------------------- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Tool Configuration Controls */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            {/* Top Workspace Header & Reset */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-500" />
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                  {activeTab === 'studio' && 'Studio Pipeline Controls'}
                  {activeTab === 'crop' && 'Crop & Transform Settings'}
                  {activeTab === 'resize' && 'Resolution & Scaling Settings'}
                  {activeTab === 'compress' && 'Compression & Format Settings'}
                </h3>
              </div>
              {currentFile && (
                <button
                  onClick={handleResetSingle}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Reset Image"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Upload Area / Current File Card */}
            {heicConverting ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-950/20">
                <RefreshCw className="w-8 h-8 mx-auto text-teal-500 mb-2 animate-spin" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Converting Apple HEIC photo...
                </span>
                <span className="text-[11px] text-slate-400">Processing locally in browser sandbox</span>
              </div>
            ) : !currentFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-teal-500 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/40 transition"
              >
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Upload Image
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Supports JPG, PNG, WebP, and HEIC
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleSingleFileUpload(f);
                  }}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileImage className="w-7 h-7 text-teal-500 shrink-0" />
                  <div className="text-left overflow-hidden">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{currentFile.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {formatSize(originalSize)} • {originalWidth}×{originalHeight} px
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleResetSingle}
                  className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Smart 1-Click Presets Carousel */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                1-Click Quick Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SMART_PRESETS.slice(0, 3).map((pr) => (
                  <button
                    key={pr.id}
                    onClick={() => applySmartPreset(pr)}
                    disabled={!currentFile}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-left transition disabled:opacity-40 hover:bg-teal-500/5 group"
                  >
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate">
                      {pr.label}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5">{pr.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* ---------------------------------------------- */}
            {/* SECTION 1: CROP & TRANSFORM CONTROLS          */}
            {/* ---------------------------------------------- */}
            {(activeTab === 'studio' || activeTab === 'crop') && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Crop className="w-3.5 h-3.5 text-teal-500" />
                    Crop & Aspect Ratio
                  </span>
                  {activeTab === 'studio' && (
                    <label className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableCrop}
                        onChange={(e) => setEnableCrop(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      Enable Crop
                    </label>
                  )}
                </div>

                {enableCrop && (
                  <>
                    <div className="grid grid-cols-4 gap-1.5">
                      {ASPECT_RATIO_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleRatioChange(opt.id)}
                          disabled={!currentFile}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition disabled:opacity-40 truncate ${
                            aspectRatio === opt.id
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {opt.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>

                    {/* Rotation & Flip Toolbar */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-500">Transform</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setRotation((r) => (r + 270) % 360)}
                          disabled={!currentFile}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition disabled:opacity-40"
                          title="Rotate 90° CCW"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRotation((r) => (r + 90) % 360)}
                          disabled={!currentFile}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition disabled:opacity-40"
                          title="Rotate 90° CW"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setFlipH(!flipH)}
                          disabled={!currentFile}
                          className={`p-1.5 rounded-lg border transition disabled:opacity-40 ${
                            flipH
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white'
                          }`}
                          title="Flip Horizontal"
                        >
                          <FlipHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setFlipV(!flipV)}
                          disabled={!currentFile}
                          className={`p-1.5 rounded-lg border transition disabled:opacity-40 ${
                            flipV
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white'
                          }`}
                          title="Flip Vertical"
                        >
                          <FlipVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ---------------------------------------------- */}
            {/* SECTION 2: RESIZE RESOLUTION CONTROLS         */}
            {/* ---------------------------------------------- */}
            {(activeTab === 'studio' || activeTab === 'resize') && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-teal-500" />
                    Target Resolution
                  </span>
                  {activeTab === 'studio' && (
                    <label className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableResize}
                        onChange={(e) => setEnableResize(e.target.checked)}
                        className="rounded text-teal-600"
                      />
                      Enable Resize
                    </label>
                  )}
                </div>

                {(activeTab === 'resize' || enableResize) && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Width (px)</label>
                        <input
                          type="number"
                          min="10"
                          max="8000"
                          value={targetWidth || ''}
                          onChange={(e) => handleWidthChange(Math.max(1, parseInt(e.target.value) || 0))}
                          disabled={!currentFile}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-mono font-bold text-slate-800 dark:text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Height (px)</label>
                        <input
                          type="number"
                          min="10"
                          max="8000"
                          value={targetHeight || ''}
                          onChange={(e) => handleHeightChange(Math.max(1, parseInt(e.target.value) || 0))}
                          disabled={!currentFile}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-mono font-bold text-slate-800 dark:text-white focus:border-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => setLockAspect(!lockAspect)}
                        disabled={!currentFile}
                        className={`flex-1 py-1.5 px-3 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-40 ${
                          lockAspect
                            ? 'bg-slate-900 dark:bg-slate-800 text-white border-slate-900'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {lockAspect ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{lockAspect ? 'Aspect Locked' : 'Free Stretch'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {[25, 50, 75, 100].map((pct) => (
                          <button
                            key={pct}
                            onClick={() => handlePercentageChange(pct)}
                            disabled={!currentFile}
                            className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
                              scalePct === pct
                                ? 'bg-teal-500 text-white border-teal-500'
                                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------------------------------------- */}
            {/* SECTION 3: COMPRESSION & FORMAT CONTROLS       */}
            {/* ---------------------------------------------- */}
            {(activeTab === 'studio' || activeTab === 'compress') && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-teal-500" />
                  Compression & Format
                </span>

                {/* Format Selector */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image/webp', label: 'WebP (Modern)' },
                    { id: 'image/jpeg', label: 'JPEG (Photo)' },
                    { id: 'image/png', label: 'PNG (Lossless)' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setOutputFormat(fmt.id as any)}
                      disabled={!currentFile}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition truncate disabled:opacity-40 ${
                        outputFormat === fmt.id
                          ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>

                {/* Compression Mode Switch (Quality vs Target KB) */}
                {outputFormat !== 'image/png' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => setCompressionMode('quality')}
                        className={`py-1 text-[11px] font-bold rounded-lg transition ${
                          compressionMode === 'quality'
                            ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Quality Slider
                      </button>
                      <button
                        onClick={() => setCompressionMode('targetSize')}
                        className={`py-1 text-[11px] font-bold rounded-lg transition ${
                          compressionMode === 'targetSize'
                            ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Target Size (KB)
                      </button>
                    </div>

                    {compressionMode === 'quality' ? (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[11px] font-semibold text-slate-500">Quality Level</label>
                          <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">{quality}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                          disabled={!currentFile}
                          className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 disabled:opacity-40"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Max Size (KB)</label>
                        <input
                          type="number"
                          min="5"
                          max={50000}
                          value={targetSizeKb}
                          onChange={(e) => setTargetSizeKb(Math.max(5, parseInt(e.target.value) || 5))}
                          disabled={!currentFile}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-mono font-bold text-slate-800 dark:text-white focus:border-teal-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Ideal for government forms, passports, and strict upload portals.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Matte Background Fill for JPEG conversion */}
                {outputFormat === 'image/jpeg' && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-500">Transparency Background Fill</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={matteBgColor}
                        onChange={(e) => setMatteBgColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-[10px] font-mono text-slate-400">{matteBgColor}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Action Button */}
            <div className="pt-2">
              <button
                onClick={runProcessPipeline}
                disabled={!currentFile || isProcessing}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-teal-500/10 transition flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Image...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Re-render & Optimize</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Preview & Split-Comparison Area */}
          <div className="lg:col-span-7 flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-900 to-slate-950 text-white shadow-xl min-h-[480px]">
            {rawImageSrc ? (
              <div className="flex-grow flex flex-col justify-between space-y-5">
                {/* Preview Toolbar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {activeTab === 'crop' ? 'Interactive Crop Window' : 'Live Comparison View'}
                    </span>
                  </div>

                  {activeTab !== 'crop' && (
                    <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                      <button
                        onClick={() => setShowSplitView(true)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded transition flex items-center gap-1 ${
                          showSplitView ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <SplitSquareVertical className="w-3 h-3" />
                        <span>Split Slider</span>
                      </button>
                      <button
                        onClick={() => setShowSplitView(false)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded transition flex items-center gap-1 ${
                          !showSplitView ? 'bg-teal-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Side-by-Side</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 1. INTERACTIVE CROP VIEW (Active on Crop Tab) */}
                {activeTab === 'crop' ? (
                  <div
                    ref={cropContainerRef}
                    className="relative select-none max-w-full overflow-hidden border border-slate-800 rounded-xl bg-slate-950/60 flex items-center justify-center p-2"
                    style={{ minHeight: '340px', maxHeight: '420px' }}
                  >
                    <div className="relative inline-block max-w-full max-h-full">
                      <img
                        ref={cropImageRef}
                        src={rawImageSrc}
                        alt="Crop Source"
                        className="pointer-events-none block max-w-full max-h-[380px] object-contain"
                        style={{
                          transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                        }}
                      />

                      {/* Backdrop Dimmer */}
                      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

                      {/* Crop Selection Window */}
                      <div
                        className="absolute border border-dashed border-teal-400 cursor-move shadow-2xl"
                        style={{
                          left: `${cropBox.x}%`,
                          top: `${cropBox.y}%`,
                          width: `${cropBox.w}%`,
                          height: `${cropBox.h}%`,
                        }}
                        onMouseDown={(e) => handleMouseDownCrop(e, 'drag')}
                      >
                        {/* Rule of Thirds Grid */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                          <div className="border-r border-b border-white/50" />
                          <div className="border-r border-b border-white/50" />
                          <div className="border-b border-white/50" />
                          <div className="border-r border-b border-white/50" />
                          <div className="border-r border-b border-white/50" />
                          <div className="border-b border-white/50" />
                          <div className="border-r border-white/50" />
                          <div className="border-r border-white/50" />
                          <div />
                        </div>

                        {/* Corner Handles */}
                        <div
                          className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-teal-400 border border-white rounded-full cursor-nwse-resize z-20"
                          onMouseDown={(e) => handleMouseDownCrop(e, 'tl')}
                        />
                        <div
                          className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-teal-400 border border-white rounded-full cursor-nesw-resize z-20"
                          onMouseDown={(e) => handleMouseDownCrop(e, 'tr')}
                        />
                        <div
                          className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-teal-400 border border-white rounded-full cursor-nesw-resize z-20"
                          onMouseDown={(e) => handleMouseDownCrop(e, 'bl')}
                        />
                        <div
                          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-teal-400 border border-white rounded-full cursor-nwse-resize z-20"
                          onMouseDown={(e) => handleMouseDownCrop(e, 'br')}
                        />
                      </div>
                    </div>
                  </div>
                ) : showSplitView && processedUrl ? (
                  /* 2. DRAGGABLE BEFORE/AFTER SPLIT COMPARISON SLIDER */
                  <div
                    ref={splitContainerRef}
                    className="relative select-none w-full h-[320px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center cursor-ew-resize"
                    onMouseDown={() => setIsDraggingSplit(true)}
                  >
                    {/* Processed (After) Base Layer */}
                    <img
                      src={processedUrl}
                      alt="Optimized"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />

                    {/* Original (Before) Clipped Overlay */}
                    <div
                      className="absolute inset-0 overflow-hidden pointer-events-none"
                      style={{ clipPath: `inset(0 ${100 - splitPosition}% 0 0)` }}
                    >
                      <img
                        src={rawImageSrc}
                        alt="Original"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </div>

                    {/* Splitter Divider Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-teal-400 pointer-events-none"
                      style={{ left: `${splitPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center text-white shadow-lg text-[10px] font-bold">
                        ↔
                      </div>
                    </div>

                    {/* Tags */}
                    <span className="absolute top-2 left-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-black/70 text-white border border-white/10">
                      Original
                    </span>
                    <span className="absolute top-2 right-2 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-600/90 text-white border border-white/10">
                      Optimized
                    </span>
                  </div>
                ) : (
                  /* 3. SIDE-BY-SIDE VIEW */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="text-center">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Original ({formatSize(originalSize)})
                      </span>
                      <div className="h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/60 flex items-center justify-center p-1">
                        <img src={rawImageSrc} className="max-h-full max-w-full object-contain" alt="Original" />
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Optimized {processedBlob && `(${formatSize(processedBlob.size)})`}
                      </span>
                      <div className="h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/60 flex items-center justify-center p-1">
                        {processedUrl ? (
                          <img src={processedUrl} className="max-h-full max-w-full object-contain" alt="Optimized" />
                        ) : (
                          <div className="text-xs text-slate-500">Rendering...</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Savings & Metrics Stats Bar */}
                {processedBlob && (
                  <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="text-[11px] font-bold text-teal-400">Compression Results</div>
                      <div className="text-base font-black text-white mt-0.5">
                        {calculateSavingsPercent() > 0 ? (
                          <>Saved {calculateSavingsPercent()}% ({formatSize(originalSize - processedBlob.size)} smaller)</>
                        ) : (
                          <>Optimized ({formatSize(processedBlob.size)})</>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-300">
                      <div>
                        Resolution: <span className="font-mono font-bold text-white">{processedWidth}×{processedHeight} px</span>
                      </div>
                      <div className="text-slate-400">
                        Format: <span className="uppercase font-bold text-teal-400">{outputFormat.replace('image/', '')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={handleCopyToClipboard}
                    disabled={!processedBlob}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 disabled:opacity-40 font-bold text-xs text-slate-200 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied Bitmap!' : 'Copy to Clipboard'}</span>
                  </button>

                  <button
                    onClick={handleDownloadSingle}
                    disabled={!processedUrl}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:opacity-90 disabled:opacity-40 font-bold text-xs text-white transition shadow-lg shadow-teal-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Image</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-500 text-center p-6">
                <FileImage className="w-12 h-12 mb-3 text-slate-700" />
                <p className="text-sm font-semibold text-slate-400">Upload an image to open the Studio</p>
                <p className="text-xs text-slate-500 mt-1">Crop, resize, compress and compare with live split preview</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
