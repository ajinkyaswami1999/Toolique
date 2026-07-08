import { useState, useRef } from 'react';
import { FileImage, Download, RefreshCw, Upload, Image as ImageIcon, SlidersHorizontal } from 'lucide-react';

// Dynamically load heic2any from jsDelivr CDN
const loadHeic2Any = async (): Promise<any> => {
  if ((window as any).heic2any) {
    return (window as any).heic2any;
  }
  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById('heic2any-cdn-script');
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if ((window as any).heic2any) {
          clearInterval(checkInterval);
          resolve((window as any).heic2any);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('HEIC converter library loading timed out.'));
      }, 15000);
      return;
    }

    const script = document.createElement('script');
    script.id = 'heic2any-cdn-script';
    script.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.js';
    script.onload = () => {
      resolve((window as any).heic2any);
    };
    script.onerror = () => {
      reject(new Error('Failed to load HEIC converter library. Please check your internet connection.'));
    };
    document.body.appendChild(script);
  });
};

export default function ImageCompressor() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  
  // Compression Modes
  const [compressionMode, setCompressionMode] = useState<'quality' | 'targetSize'>('quality');
  const [quality, setQuality] = useState<number>(85);
  const [targetSizeKb, setTargetSizeKb] = useState<number>(150);
  const [achievedQuality, setAchievedQuality] = useState<number | null>(null);

  // Resize Dimensions
  const [resizeImage, setResizeImage] = useState<boolean>(false);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [maxHeight, setMaxHeight] = useState<number>(1080);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [heicConverting, setHeicConverting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isHeic = (file: File) => {
    const name = file.name.toLowerCase();
    return name.endsWith('.heic') || name.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setInfoMessage(null);

    // Revoke old object URLs to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl);
      setCompressedUrl(null);
    }

    let fileToProcess = file;

    if (isHeic(file)) {
      setHeicConverting(true);
      try {
        const heic2anyLib = await loadHeic2Any();
        const conversionResult = await heic2anyLib({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9,
        });

        const resultBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
        const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
        fileToProcess = new File([resultBlob], newName, { type: 'image/jpeg' });
        setInfoMessage('HEIC photo successfully converted to JPEG in your browser.');
      } catch (err: any) {
        console.error('HEIC conversion failed:', err);
        setError(err.message || 'Failed to convert HEIC image. Please upload a standard JPG, PNG, or WebP image.');
        setHeicConverting(false);
        return;
      }
      setHeicConverting(false);
    }

    setSelectedFile(fileToProcess);
    setOriginalSize(fileToProcess.size);
    setCompressedSize(0);
    setCompressedUrl(null);
    setAchievedQuality(null);
    
    const url = URL.createObjectURL(fileToProcess);
    setPreviewUrl(url);

    // Intelligently suggest target size based on original size
    const maxKb = Math.ceil(fileToProcess.size / 1024);
    let suggestedKb = 150;
    if (fileToProcess.size > 1024 * 1024) {
      suggestedKb = 200;
    } else {
      suggestedKb = Math.max(5, Math.round(maxKb * 0.4));
    }
    if (suggestedKb >= maxKb) {
      suggestedKb = Math.max(5, Math.round(maxKb * 0.5));
    }
    setTargetSizeKb(suggestedKb);
  };

  const compressImage = () => {
    if (!selectedFile || !previewUrl) return;
    setCompressing(true);
    setError(null);
    setInfoMessage(null);

    const img = new Image();

    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Safety cap (max 4096px in either dimension) to prevent canvas memory/crash issues
        const SAFETY_CAP = 4096;
        if (width > SAFETY_CAP || height > SAFETY_CAP) {
          const ratio = Math.min(SAFETY_CAP / width, SAFETY_CAP / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
          setInfoMessage(`Image resolution capped from ${img.naturalWidth || img.width}x${img.naturalHeight || img.height} to ${width}x${height} to prevent browser tab crash.`);
        }

        // Handle Resolution resizing maintaining aspect ratio (only if resizeImage is checked)
        if (resizeImage && (width > maxWidth || height > maxHeight)) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const ratio = Math.min(widthRatio, heightRatio);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to create canvas 2D context.');
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Export compressed image as Blob
        const mimeType = selectedFile.type === 'image/png' ? 'image/jpeg' : selectedFile.type;

        if (compressionMode === 'targetSize') {
          const targetSizeBytes = targetSizeKb * 1024;
          let minQ = 0.01;
          let maxQ = 0.99;
          let bestBlob: Blob | null = null;
          let bestDiff = Infinity;
          let bestQ = 0.5;

          // Perform Binary Search across 6 iterations for efficiency on large files
          for (let i = 0; i < 6; i++) {
            const midQ = (minQ + maxQ) / 2;

            // Yield thread for large canvases to keep browser responsive
            if (width * height > 2000000) {
              await new Promise((resolve) => setTimeout(resolve, 15));
            }

            const blob = await new Promise<Blob | null>((resolve) => {
              try {
                canvas.toBlob((b) => resolve(b), mimeType, midQ);
              } catch (e) {
                resolve(null);
              }
            });
            
            if (!blob) break;

            const diff = blob.size - targetSizeBytes;
            if (Math.abs(diff) < bestDiff) {
              bestDiff = Math.abs(diff);
              bestBlob = blob;
              bestQ = midQ;
            }

            if (blob.size > targetSizeBytes) {
              maxQ = midQ;
            } else {
              minQ = midQ;
            }
          }

          if (bestBlob) {
            if (compressedUrl) {
              URL.revokeObjectURL(compressedUrl);
            }
            setCompressedSize(bestBlob.size);
            const compUrl = URL.createObjectURL(bestBlob);
            setCompressedUrl(compUrl);
            setAchievedQuality(Math.round(bestQ * 100));
          } else {
            throw new Error('Failed to generate compressed image.');
          }
          setCompressing(false);
        } else {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                if (compressedUrl) {
                  URL.revokeObjectURL(compressedUrl);
                }
                setCompressedSize(blob.size);
                const compUrl = URL.createObjectURL(blob);
                setCompressedUrl(compUrl);
                setAchievedQuality(quality);
              } else {
                setError('Failed to compress image.');
              }
              setCompressing(false);
            },
            mimeType,
            quality / 100
          );
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred during compression.');
        setCompressing(false);
      }
    };

    img.onerror = () => {
      setError('Failed to load image. The file format may be unsupported or corrupted.');
      setCompressing(false);
    };

    img.src = previewUrl;
  };

  const downloadImage = () => {
    if (!compressedUrl || !selectedFile) return;
    const link = document.createElement('a');
    
    const originalName = selectedFile.name;
    const dotIdx = originalName.lastIndexOf('.');
    const nameWithoutExt = originalName.substring(0, dotIdx);
    const ext = selectedFile.type === 'image/png' ? 'jpg' : originalName.substring(dotIdx + 1);

    link.download = `${nameWithoutExt}-compressed.${ext}`;
    link.href = compressedUrl;
    link.click();
  };

  const reset = () => {
    setSelectedFile(null);
    setOriginalSize(0);
    setCompressedSize(0);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl);
    }
    setPreviewUrl(null);
    setCompressedUrl(null);
    setAchievedQuality(null);
    setError(null);
    setInfoMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionSavings = () => {
    if (!originalSize || !compressedSize) return 0;
    const savings = ((originalSize - compressedSize) / originalSize) * 100;
    return Math.round(savings);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
          <SlidersHorizontal className="w-5 h-5 text-slate-400" />
          Compression Controls
        </h3>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-xl flex items-center gap-2">
            <span className="shrink-0 block w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400"></span>
            <span>{error}</span>
          </div>
        )}

        {/* Info Alert */}
        {infoMessage && (
          <div className="p-3.5 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 border border-teal-150/50 dark:border-teal-900/40 rounded-xl flex items-center gap-2">
            <span className="shrink-0 block w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400"></span>
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Upload box / HEIC conversion loader */}
        {heicConverting ? (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-950/20">
            <RefreshCw className="w-10 h-10 mx-auto text-teal-500 mb-3 animate-spin" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-1">Converting HEIC to JPEG...</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">This happens locally in your browser. Please wait.</span>
          </div>
        ) : !selectedFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-teal-500 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/35 transition"
          >
            <Upload className="w-10 h-10 mx-auto text-slate-400 mb-3" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 block mb-1">Upload Photo</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Supports JPEG, PNG, WebP, HEIC</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileImage className="w-8 h-8 text-teal-600 dark:text-teal-400 shrink-0" />
              <div className="text-left overflow-hidden">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{selectedFile.name}</div>
                <div className="text-[10px] text-slate-400">{formatSize(originalSize)}</div>
              </div>
            </div>
            <button
              onClick={reset}
              className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition"
              title="Remove image"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Compression Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compression Mode</label>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
            <button
              onClick={() => setCompressionMode('quality')}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                compressionMode === 'quality'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Manual Quality
            </button>
            <button
              onClick={() => setCompressionMode('targetSize')}
              className={`py-1.5 text-xs font-bold rounded-lg transition ${
                compressionMode === 'targetSize'
                  ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Target File Size
            </button>
          </div>
        </div>

        {/* Quality Controls */}
        {compressionMode === 'quality' ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-650 dark:text-slate-350">
                Compression Quality
              </label>
              <span className="text-xs font-bold text-teal-650 dark:text-teal-400 font-mono">{quality}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              disabled={!selectedFile}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 disabled:opacity-40"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-650 dark:text-slate-350">
              Target File Size (KB)
            </label>
            <input
              type="number"
              min="5"
              max={selectedFile ? Math.ceil(originalSize / 1024) : 100000}
              value={targetSizeKb}
              onChange={(e) => {
                const maxKb = selectedFile ? Math.ceil(originalSize / 1024) : 100000;
                let val = parseInt(e.target.value) || 5;
                if (val > maxKb) val = maxKb;
                setTargetSizeKb(Math.max(5, val));
              }}
              disabled={!selectedFile}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-teal-500 focus:outline-none disabled:opacity-40"
            />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
              The compressor will automatically search for the optimal compression quality to match this size.
            </span>
          </div>
        )}

        {/* Toggle Dimensions Resize */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <label htmlFor="resizeToggle" className="text-sm font-semibold text-slate-650 dark:text-slate-300 cursor-pointer">
            Resize Image Dimensions
          </label>
          <input
            type="checkbox"
            id="resizeToggle"
            checked={resizeImage}
            onChange={(e) => setResizeImage(e.target.checked)}
            disabled={!selectedFile}
            className="w-4.5 h-4.5 rounded border-slate-300 dark:border-slate-800 text-teal-600 focus:ring-teal-500 cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Resize Resolution Inputs */}
        {resizeImage && (
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800/60 pt-4">
            {/* Max Resolution Width */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
                  Max Width (px)
                </label>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">{maxWidth}px</span>
              </div>
              <input
                type="range"
                min="300"
                max="3840"
                step="10"
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                disabled={!selectedFile}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 disabled:opacity-40"
              />
            </div>

            {/* Max Resolution Height */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
                  Max Height (px)
                </label>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">{maxHeight}px</span>
              </div>
              <input
                type="range"
                min="300"
                max="3840"
                step="10"
                value={maxHeight}
                onChange={(e) => setMaxHeight(Number(e.target.value))}
                disabled={!selectedFile}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 disabled:opacity-40"
              />
            </div>
          </div>
        )}

        {/* Compress Action */}
        <button
          onClick={compressImage}
          disabled={!selectedFile || compressing}
          className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-sm transition"
        >
          {compressing ? 'Compressing...' : 'Compress Image'}
        </button>
      </div>

      {/* Preview Column */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl min-h-[400px]">
        {previewUrl ? (
          <div className="flex-grow flex flex-col justify-between space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Preview */}
              <div className="text-center">
                <span className="text-xs font-semibold text-slate-400 block mb-2">Original ({formatSize(originalSize)})</span>
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950/60 flex items-center justify-center">
                  <img src={previewUrl} className="max-h-40 max-w-full object-contain" alt="Original" />
                </div>
              </div>

              {/* Compressed Preview */}
              <div className="text-center">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Compressed {compressedSize > 0 && `(${formatSize(compressedSize)})`}
                </span>
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950/60 flex items-center justify-center">
                  {compressedUrl ? (
                    <img src={compressedUrl} className="max-h-40 max-w-full object-contain" alt="Compressed" />
                  ) : (
                    <div className="text-xs text-slate-500">Click Compress to render</div>
                  )}
                </div>
              </div>
            </div>

            {/* Savings banner */}
            {compressedSize > 0 && (
              <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-center">
                <div className="text-xs font-bold text-teal-400">Successfully Reduced File Size!</div>
                <div className="text-lg font-black text-white mt-1">
                  Saved {compressionSavings()}% ({formatSize(originalSize - compressedSize)} smaller)
                </div>
                {achievedQuality !== null && (
                  <div className="text-xs text-slate-400 mt-1">
                    {compressionMode === 'targetSize' 
                      ? `Target: ${targetSizeKb} KB | Achieved: ${formatSize(compressedSize)} (Quality used: ${achievedQuality}%)`
                      : `Quality level applied: ${achievedQuality}%`}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={downloadImage}
                disabled={!compressedUrl}
                className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm text-white transition shadow-lg shadow-teal-500/10"
              >
                <Download className="w-4 h-4" />
                <span>Download Compressed Image</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-slate-500 text-center p-6">
            <ImageIcon className="w-12 h-12 mb-3 text-slate-700" />
            <p className="text-sm">Upload a photo to see the compression comparisons and download details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
