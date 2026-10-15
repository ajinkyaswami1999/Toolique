import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Archive,
  Upload,
  Download,
  RotateCcw,
  CheckCircle2,
  Trash2,
  AlertCircle,
  FileArchive,
  Sliders,
  Settings2,
  Image as ImageIcon,
  Info,
  Layers,
  Sparkles,
  Eye,
  X,
  FileCheck2,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  FolderUp,
  HardDrive
} from 'lucide-react';
import JSZip from 'jszip';

interface ImageFileItem {
  id: string;
  name: string;
  originalName: string;
  size: number;
  sizeFormatted: string;
  type: string;
  previewUrl: string;
  width: number;
  height: number;
  fileBlob: File;
}

interface ZipSettings {
  archiveName: string;
  compression: 'DEFLATE' | 'STORE';
  compressionLevel: number; // 1 to 9
  convertFormat: 'original' | 'image/webp' | 'image/jpeg' | 'image/png';
  quality: number; // 0.1 to 1.0
  maxDimension: number; // 0 for original, or 3840, 1920, 1280, 800
  namingPattern: 'original' | 'numbered' | 'prefixed' | 'slugified';
  customPrefix: string;
  includeManifest: boolean;
  subfolderStructure: 'root' | 'format' | 'custom';
  customSubfolder: string;
}

const DEFAULT_SETTINGS: ZipSettings = {
  archiveName: 'images-archive',
  compression: 'DEFLATE',
  compressionLevel: 6,
  convertFormat: 'original',
  quality: 0.85,
  maxDimension: 0,
  namingPattern: 'original',
  customPrefix: 'photo',
  includeManifest: true,
  subfolderStructure: 'root',
  customSubfolder: 'images',
};

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function ImagesToZip() {
  const [files, setFiles] = useState<ImageFileItem[]>([]);
  const [settings, setSettings] = useState<ZipSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ percent: number; status: string }>({ percent: 0, status: '' });
  const [zipResult, setZipResult] = useState<{
    blob: Blob;
    url: string;
    size: number;
    originalTotalSize: number;
    durationMs: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [previewItem, setPreviewItem] = useState<ImageFileItem | null>(null);
  const [activeTab, setActiveTab] = useState<'queue' | 'settings'>('queue');
  const [sortOrder, setSortOrder] = useState<'name' | 'size' | 'custom'>('custom');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Compute live statistics
  const stats = useMemo(() => {
    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
    const count = files.length;
    const formatBreakdown: Record<string, number> = {};
    files.forEach((f) => {
      const ext = f.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      formatBreakdown[ext] = (formatBreakdown[ext] || 0) + 1;
    });

    return {
      count,
      totalBytes,
      totalFormatted: formatBytes(totalBytes),
      formatBreakdown,
    };
  }, [files]);

  // Clean up object URLs when files are deleted or on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(f.previewUrl);
        }
      });
      if (zipResult?.url) {
        URL.revokeObjectURL(zipResult.url);
      }
    };
  }, [files, zipResult]);

  // Read single image file and extract dimensions + preview
  const parseImageFile = (file: File): Promise<ImageFileItem> => {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).substring(2, 9);
      const isImg = file.type.startsWith('image/');
      const previewUrl = isImg ? URL.createObjectURL(file) : '';

      if (isImg) {
        const img = new Image();
        img.onload = () => {
          resolve({
            id,
            name: file.name,
            originalName: file.name,
            size: file.size,
            sizeFormatted: formatBytes(file.size),
            type: file.type || 'image/unknown',
            previewUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            fileBlob: file,
          });
        };
        img.onerror = () => {
          resolve({
            id,
            name: file.name,
            originalName: file.name,
            size: file.size,
            sizeFormatted: formatBytes(file.size),
            type: file.type || 'application/octet-stream',
            previewUrl,
            width: 0,
            height: 0,
            fileBlob: file,
          });
        };
        img.src = previewUrl;
      } else {
        resolve({
          id,
          name: file.name,
          originalName: file.name,
          size: file.size,
          sizeFormatted: formatBytes(file.size),
          type: file.type || 'application/octet-stream',
          previewUrl: '',
          width: 0,
          height: 0,
          fileBlob: file,
        });
      }
    });
  };

  const handleIncomingFiles = useCallback(async (incomingFiles: FileList | File[]) => {
    setError(null);
    const validFiles = Array.from(incomingFiles).filter((f) => {
      // allow images and general files
      return f.size > 0;
    });

    if (validFiles.length === 0) return;

    try {
      const parsed = await Promise.all(validFiles.map(parseImageFile));
      setFiles((prev) => [...prev, ...parsed]);
      setZipResult(null);
    } catch {
      setError('Could not process some of the selected files.');
    }
  }, []);

  // Native Paste listener for clipboard images
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
            const renamedFile = new File([file], `clipboard-image-${timestamp}-${i + 1}.png`, {
              type: file.type || 'image/png',
            });
            pastedFiles.push(renamedFile);
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

  // Load Sample Images for frictionless testing
  const handleLoadSampleImages = () => {
    setError(null);
    const sampleDefinitions = [
      { name: 'landscape-sunset.png', color1: '#ff7e5f', color2: '#feb47b', label: 'Golden Hour Vista' },
      { name: 'tech-geometry.png', color1: '#6a11cb', color2: '#2575fc', label: 'Digital Architecture' },
      { name: 'nature-leaf.png', color1: '#0ba360', color2: '#3cba92', label: 'Forest Micro-Texture' },
    ];

    const samplePromises = sampleDefinitions.map((item) => {
      return new Promise<File>((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 1200, 800);
          grad.addColorStop(0, item.color1);
          grad.addColorStop(1, item.color2);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1200, 800);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 52px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(item.label, 600, 390);

          ctx.font = '24px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.fillText('Toolique High-Resolution Client-Side Sample Asset', 600, 440);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], item.name, { type: 'image/png' }));
          }
        }, 'image/png');
      });
    });

    Promise.all(samplePromises).then((sampleFiles) => {
      handleIncomingFiles(sampleFiles);
    });
  };

  // Convert or resize an individual file if required by settings
  const processImageForArchive = async (
    item: ImageFileItem,
    targetName: string
  ): Promise<{ filename: string; blob: Blob }> => {
    const isImage = item.type.startsWith('image/') && item.type !== 'image/svg+xml';
    const needsConversion = isImage && settings.convertFormat !== 'original';
    const needsResize = isImage && settings.maxDimension > 0 && (item.width > settings.maxDimension || item.height > settings.maxDimension);

    // If no conversion or resizing is needed, return original
    if (!needsConversion && !needsResize) {
      return { filename: targetName, blob: item.fileBlob };
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { naturalWidth: w, naturalHeight: h } = img;

        if (settings.maxDimension > 0 && (w > settings.maxDimension || h > settings.maxDimension)) {
          if (w > h) {
            h = Math.round((h * settings.maxDimension) / w);
            w = settings.maxDimension;
          } else {
            w = Math.round((w * settings.maxDimension) / h);
            h = settings.maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({ filename: targetName, blob: item.fileBlob });
          return;
        }

        // Draw with high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // For JPEG without transparency, fill white background
        const outMime = settings.convertFormat === 'original' ? item.type : settings.convertFormat;
        if (outMime === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
        }

        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              let adjustedName = targetName;
              if (settings.convertFormat !== 'original') {
                const newExt = settings.convertFormat.replace('image/', '').replace('jpeg', 'jpg');
                const base = targetName.substring(0, targetName.lastIndexOf('.')) || targetName;
                adjustedName = `${base}.${newExt}`;
              }
              resolve({ filename: adjustedName, blob });
            } else {
              resolve({ filename: targetName, blob: item.fileBlob });
            }
          },
          outMime,
          settings.quality
        );
      };

      img.onerror = () => {
        resolve({ filename: targetName, blob: item.fileBlob });
      };

      img.src = item.previewUrl;
    });
  };

  // Generate target filename based on pattern
  const computeTargetFilename = (item: ImageFileItem, index: number): string => {
    const dotIndex = item.name.lastIndexOf('.');
    const ext = dotIndex !== -1 ? item.name.slice(dotIndex) : '';
    const rawBase = dotIndex !== -1 ? item.name.slice(0, dotIndex) : item.name;

    switch (settings.namingPattern) {
      case 'numbered': {
        const padIndex = String(index + 1).padStart(String(files.length).length > 2 ? 3 : 2, '0');
        return `${padIndex}${ext}`;
      }
      case 'prefixed': {
        const prefix = settings.customPrefix.trim() || 'image';
        const padIndex = String(index + 1).padStart(String(files.length).length > 2 ? 3 : 2, '0');
        return `${prefix}_${padIndex}${ext}`;
      }
      case 'slugified': {
        const cleanBase = rawBase
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        return `${cleanBase || 'image'}${ext.toLowerCase()}`;
      }
      case 'original':
      default:
        return item.name;
    }
  };

  // Compile ZIP with JSZip
  const handleCompileZip = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setProgress({ percent: 5, status: 'Initializing packaging...' });

    const startTime = performance.now();

    try {
      const zip = new JSZip();
      const manifestEntries: Array<{
        filename: string;
        originalName: string;
        sizeBytes: number;
        resolution?: string;
        type: string;
      }> = [];

      // Step 1: Process each file (optimizing or converting if needed)
      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        const stepProgress = Math.round(5 + (i / files.length) * 65);
        setProgress({
          percent: stepProgress,
          status: `Optimizing ${item.name} (${i + 1}/${files.length})...`,
        });

        const targetBaseName = computeTargetFilename(item, i);
        const { filename, blob } = await processImageForArchive(item, targetBaseName);

        // Determine destination folder within the archive
        let destinationPath = filename;
        if (settings.subfolderStructure === 'custom' && settings.customSubfolder.trim()) {
          destinationPath = `${settings.customSubfolder.trim()}/${filename}`;
        } else if (settings.subfolderStructure === 'format') {
          const folder = filename.split('.').pop()?.toLowerCase() || 'other';
          destinationPath = `${folder}/${filename}`;
        }

        zip.file(destinationPath, blob);

        manifestEntries.push({
          filename: destinationPath,
          originalName: item.originalName,
          sizeBytes: blob.size,
          resolution: item.width && item.height ? `${item.width}x${item.height}` : undefined,
          type: blob.type || item.type,
        });
      }

      // Step 2: Include optional manifest file
      if (settings.includeManifest) {
        const manifestPayload = {
          archiveName: `${settings.archiveName || 'images-archive'}.zip`,
          generatedAt: new Date().toISOString(),
          generator: 'Toolique Images to ZIP Studio (https://www.toolique.in)',
          totalFiles: files.length,
          compressionAlgorithm: settings.compression,
          files: manifestEntries,
        };
        zip.file('manifest.json', JSON.stringify(manifestPayload, null, 2));
      }

      // Step 3: Compress and generate ZIP blob
      setProgress({ percent: 75, status: 'Writing ZIP archive...' });

      const generatedBlob = await zip.generateAsync(
        {
          type: 'blob',
          compression: settings.compression,
          compressionOptions: settings.compression === 'DEFLATE' ? { level: settings.compressionLevel } : undefined,
        },
        (metadata) => {
          const compressProgress = Math.min(99, Math.round(75 + (metadata.percent * 0.24)));
          setProgress({
            percent: compressProgress,
            status: `Compressing archive: ${Math.round(metadata.percent)}%`,
          });
        }
      );

      const endTime = performance.now();
      const zipUrl = URL.createObjectURL(generatedBlob);

      setZipResult({
        blob: generatedBlob,
        url: zipUrl,
        size: generatedBlob.size,
        originalTotalSize: stats.totalBytes,
        durationMs: Math.round(endTime - startTime),
      });

      setProgress({ percent: 100, status: 'ZIP compiled successfully!' });
    } catch {
      setError('An error occurred while compiling the ZIP archive. Please ensure your images are accessible.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download compiled ZIP
  const handleDownloadZip = () => {
    if (!zipResult) return;
    const cleanArchiveName = settings.archiveName.trim()
      ? settings.archiveName.replace(/\.zip$/i, '')
      : 'images-archive';
    const link = document.createElement('a');
    link.href = zipResult.url;
    link.download = `${cleanArchiveName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Remove individual file
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setZipResult(null);
  };

  // Reorder file in queue
  const handleMoveFile = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= files.length) return;

    setFiles((prev) => {
      const copy = [...prev];
      const [movedItem] = copy.splice(index, 1);
      copy.splice(newIndex, 0, movedItem);
      return copy;
    });
    setSortOrder('custom');
    setZipResult(null);
  };

  // Sort queue by name or size
  const handleSort = (type: 'name' | 'size') => {
    setFiles((prev) => {
      const copy = [...prev];
      if (type === 'name') {
        copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
      } else {
        copy.sort((a, b) => b.size - a.size);
      }
      return copy;
    });
    setSortOrder(type);
    setZipResult(null);
  };

  // Clear all
  const handleClearAll = () => {
    files.forEach((f) => {
      if (f.previewUrl.startsWith('blob:')) URL.revokeObjectURL(f.previewUrl);
    });
    setFiles([]);
    setZipResult(null);
    setError(null);
    setProgress({ percent: 0, status: '' });
  };

  const savedBytes = zipResult ? zipResult.originalTotalSize - zipResult.size : 0;
  const savedPercent = zipResult && zipResult.originalTotalSize > 0
    ? Math.round((savedBytes / zipResult.originalTotalSize) * 100)
    : 0;

  return (
    <div className="space-y-6 text-left">
      {/* Main Grid: Settings & Actions Sidebar vs File Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Archive Configuration & Package Button (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Packaging Control Card */}
          <div className="saas-card p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Archive className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-zinc-950 dark:text-white text-sm">
                  Archive Controls
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    title="Clear All"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-0.5 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('queue')}
                    className={`px-2.5 py-1 rounded-md transition ${
                      activeTab === 'queue'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                      activeTab === 'settings'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Settings2 className="w-3 h-3" />
                    <span>Config</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Archive Name Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                ZIP File Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.archiveName}
                  onChange={(e) => {
                    setSettings({ ...settings, archiveName: e.target.value });
                    setZipResult(null);
                  }}
                  placeholder="images-archive"
                  className="w-full pl-3 pr-12 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-zinc-400">
                  .zip
                </span>
              </div>
            </div>

            {/* Queue Summary Metrics */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>Selected Assets:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {stats.count} {stats.count === 1 ? 'file' : 'files'}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>Uncompressed Size:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">
                  {stats.totalFormatted}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>ZIP Compression:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {settings.compression === 'DEFLATE' ? `DEFLATE (L${settings.compressionLevel})` : 'STORE (Raw/0)'}
                </span>
              </div>
              {settings.convertFormat !== 'original' && (
                <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-700/60">
                  <span>Batch Conversion:</span>
                  <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    &rarr; {settings.convertFormat.replace('image/', '')}
                  </span>
                </div>
              )}
            </div>

            {/* Compilation Action Button */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCompileZip}
                disabled={files.length === 0 || isProcessing}
                className={`saas-button-primary w-full py-3 flex items-center justify-center gap-2 cursor-pointer ${
                  files.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Archive className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span className="font-bold">
                  {isProcessing ? 'Building Archive...' : files.length === 0 ? 'Upload Images First' : 'Compile ZIP Archive'}
                </span>
              </button>

              {/* Download Button on Success */}
              {zipResult && (
                <div className="space-y-2 pt-1 animate-fadeIn">
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {settings.archiveName || 'archive'}.zip ({formatBytes(zipResult.size)})</span>
                  </button>

                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Ready ({zipResult.durationMs}ms)</span>
                    </span>
                    {savedPercent > 0 ? (
                      <span className="font-bold bg-emerald-200/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full text-[10px]">
                        Saved {savedPercent}% ({formatBytes(savedBytes)})
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
                        Packed {files.length} items
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Settings Drawer (When Config tab is selected) */}
          {activeTab === 'settings' && (
            <div className="saas-card p-5 space-y-4 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-2.5">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                  Archive & Optimization Options
                </h4>
              </div>

              {/* Compression Algorithm */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  ZIP Compression Algorithm
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSettings({ ...settings, compression: 'DEFLATE' });
                      setZipResult(null);
                    }}
                    className={`p-2 rounded-xl border text-center transition font-semibold cursor-pointer ${
                      settings.compression === 'DEFLATE'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    DEFLATE (Compressed)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSettings({ ...settings, compression: 'STORE' });
                      setZipResult(null);
                    }}
                    className={`p-2 rounded-xl border text-center transition font-semibold cursor-pointer ${
                      settings.compression === 'STORE'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    STORE (Ultra Fast / 0)
                  </button>
                </div>
              </div>

              {/* Compression Level Slider (if DEFLATE) */}
              {settings.compression === 'DEFLATE' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600 dark:text-zinc-400">Deflate Level:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      Level {settings.compressionLevel} {settings.compressionLevel === 6 ? '(Standard)' : settings.compressionLevel === 9 ? '(Maximum)' : '(Fast)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="9"
                    step="1"
                    value={settings.compressionLevel}
                    onChange={(e) => {
                      setSettings({ ...settings, compressionLevel: Number(e.target.value) });
                      setZipResult(null);
                    }}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>1 (Fastest)</span>
                    <span>6 (Default)</span>
                    <span>9 (Best compression)</span>
                  </div>
                </div>
              )}

              {/* Format Modernization (Convert all images) */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Pre-Conversion Image Format
                </label>
                <select
                  value={settings.convertFormat}
                  onChange={(e) => {
                    setSettings({ ...settings, convertFormat: e.target.value as any });
                    setZipResult(null);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                >
                  <option value="original">Keep Original Formats (No Conversion)</option>
                  <option value="image/webp">Convert all to WebP (Recommended for web)</option>
                  <option value="image/jpeg">Convert all to JPEG (Universal photo format)</option>
                  <option value="image/png">Convert all to PNG (Lossless)</option>
                </select>
              </div>

              {/* Quality Slider (if WebP or JPEG) */}
              {(settings.convertFormat === 'image/webp' || settings.convertFormat === 'image/jpeg') && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-600 dark:text-zinc-400">Image Quality:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {Math.round(settings.quality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.quality}
                    onChange={(e) => {
                      setSettings({ ...settings, quality: Number(e.target.value) });
                      setZipResult(null);
                    }}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              )}

              {/* Bulk Resize / Max Dimension */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Max Resolution (Aspect Ratio Kept)
                </label>
                <select
                  value={settings.maxDimension}
                  onChange={(e) => {
                    setSettings({ ...settings, maxDimension: Number(e.target.value) });
                    setZipResult(null);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                >
                  <option value="0">Original Resolution (No Resizing)</option>
                  <option value="3840">Max 3840px (4K Ultra HD)</option>
                  <option value="1920">Max 1920px (1080p Full HD)</option>
                  <option value="1280">Max 1280px (720p HD)</option>
                  <option value="800">Max 800px (Web & Social Thumbnails)</option>
                </select>
              </div>

              {/* Filename Pattern */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Internal File Naming Pattern
                </label>
                <select
                  value={settings.namingPattern}
                  onChange={(e) => {
                    setSettings({ ...settings, namingPattern: e.target.value as any });
                    setZipResult(null);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                >
                  <option value="original">Keep Original Filenames</option>
                  <option value="numbered">Sequential Numbers (01.jpg, 02.jpg)</option>
                  <option value="prefixed">Custom Prefix + Sequential (photo_01.jpg)</option>
                  <option value="slugified">Clean & Slugified (clean-image-name.jpg)</option>
                </select>

                {settings.namingPattern === 'prefixed' && (
                  <div className="pt-1.5">
                    <input
                      type="text"
                      value={settings.customPrefix}
                      onChange={(e) => {
                        setSettings({ ...settings, customPrefix: e.target.value });
                        setZipResult(null);
                      }}
                      placeholder="custom_prefix"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Subfolder Organization */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Folder Structure Inside ZIP
                </label>
                <select
                  value={settings.subfolderStructure}
                  onChange={(e) => {
                    setSettings({ ...settings, subfolderStructure: e.target.value as any });
                    setZipResult(null);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                >
                  <option value="root">Flat (All files in ZIP root)</option>
                  <option value="format">Subfolders by Format (/png/, /jpg/, etc.)</option>
                  <option value="custom">Single Custom Subfolder (/images/)</option>
                </select>
              </div>

              {/* Manifest JSON toggle */}
              <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={settings.includeManifest}
                    onChange={(e) => {
                      setSettings({ ...settings, includeManifest: e.target.checked });
                      setZipResult(null);
                    }}
                    className="rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                  />
                  <span>Include manifest.json archive index</span>
                </label>
              </div>
            </div>
          )}

          {/* Privacy Guarantee Note */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
              <HardDrive className="w-4 h-4 text-emerald-500" />
              <span>100% Private Client-Side Processing</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
              Every operation—from file reading, aspect resizing, to ZIP deflation—runs exclusively in your browser RAM using Web Workers and JSZip. Zero photos are uploaded to any cloud server.
            </p>
          </div>
        </div>

        {/* Right Column: Upload Box & Image Queue (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Error Banner */}
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

          {/* Dropzone Upload Area */}
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
            className={`border-2 border-dashed rounded-3xl p-8 transition-all duration-200 text-center relative ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/20 scale-[1.005]'
                : 'border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.heic,.heif,.svg,.bmp,.ico,.tif,.tiff,.webp,.gif,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files) handleIncomingFiles(e.target.files);
              }}
              className="hidden"
            />
            <input
              ref={folderInputRef}
              type="file"
              // @ts-expect-error webkitdirectory is standard in all modern browsers
              webkitdirectory=""
              directory=""
              multiple
              onChange={(e) => {
                if (e.target.files) handleIncomingFiles(e.target.files);
              }}
              className="hidden"
            />

            <div className="max-w-md mx-auto space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Drop images here, or choose from files
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Supports PNG, JPG, WebP, GIF, SVG, AVIF, BMP, and TIFF &bull; Paste with <kbd className="px-1 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 border rounded">Ctrl+V</kbd>
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="saas-button-primary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Select Images</span>
                </button>
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="saas-button-secondary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderUp className="w-3.5 h-3.5" />
                  <span>Upload Folder</span>
                </button>
                {files.length === 0 && (
                  <button
                    type="button"
                    onClick={handleLoadSampleImages}
                    className="saas-button-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
                    title="Load 3 sample test images"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Try Samples</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Processing Progress Bar */}
          {isProcessing && (
            <div className="saas-card p-4 space-y-2.5 animate-fadeIn border-indigo-200 dark:border-indigo-900">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <Archive className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>{progress.status || 'Compressing archive...'}</span>
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {progress.percent}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-200 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Loaded Files Queue List */}
          {files.length > 0 && (
            <div className="saas-card p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-zinc-950 dark:text-white flex items-center gap-1.5">
                    <span>Selected Images</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {files.length}
                    </span>
                  </h3>
                  <span className="text-zinc-400 text-xs">&bull;</span>
                  <span className="text-xs text-zinc-500 font-mono">
                    {stats.totalFormatted}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sorting dropdown */}
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                        sortOrder === 'name' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      Name
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSort('size')}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                        sortOrder === 'size' ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      Size
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-semibold transition"
                  >
                    + Add More
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[500px] overflow-y-auto pr-1">
                {files.map((file, idx) => (
                  <div
                    key={file.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs group hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Drag / Index */}
                      <span className="text-[11px] font-mono text-zinc-400 w-5 text-right shrink-0">
                        {idx + 1}.
                      </span>

                      {/* Thumbnail */}
                      <div
                        onClick={() => setPreviewItem(file)}
                        className="w-11 h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 flex items-center justify-center cursor-pointer relative group/thumb shadow-2xs"
                      >
                        {file.previewUrl ? (
                          <img
                            src={file.previewUrl}
                            alt={file.name}
                            className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-200"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-zinc-400" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Filename & Info */}
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-bold text-zinc-900 dark:text-zinc-100 truncate block max-w-xs sm:max-w-md"
                            title={file.name}
                          >
                            {computeTargetFilename(file, idx)}
                          </span>
                          {settings.namingPattern !== 'original' && (
                            <span className="text-[10px] text-zinc-400 truncate hidden sm:inline" title={`Original: ${file.originalName}`}>
                              ({file.originalName})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
                          <span className="font-mono">{file.sizeFormatted}</span>
                          {file.width > 0 && (
                            <>
                              <span>&bull;</span>
                              <span>{file.width} &times; {file.height}px</span>
                            </>
                          )}
                          <span>&bull;</span>
                          <span className="uppercase text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {file.name.split('.').pop() || 'FILE'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Move Up / Move Down / Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveFile(idx, 'up')}
                        className={`p-1.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition ${
                          idx === 0 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === files.length - 1}
                        onClick={() => handleMoveFile(idx, 'down')}
                        className={`p-1.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition ${
                          idx === files.length - 1 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.id)}
                        className="p-1.5 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-900/40 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer ml-1"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom bar inside queue card */}
              <div className="border-t border-zinc-150 dark:border-zinc-800 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">Format Summary:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Object.entries(stats.formatBreakdown).map(([fmt, count]) => (
                      <span
                        key={fmt}
                        className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] font-bold text-zinc-700 dark:text-zinc-300"
                      >
                        {fmt}: {count}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-red-600 dark:text-red-400 hover:underline font-semibold cursor-pointer"
                >
                  Clear Queue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Guide & FAQ Section (AEO / GEO Optimization) */}
      <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-8 text-left">
        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="saas-card p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FileArchive className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              DEFLATE & STORE Algorithms
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Choose standard DEFLATE compression (Levels 1 to 9) to minimize transfer sizes, or select STORE mode for instantaneous zero-CPU packaging of already-compressed files.
            </p>
          </div>

          <div className="saas-card p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              Batch Conversion & Resizing
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Convert your photos to modern WebP or universal JPEG before packaging. Set maximum width/height bounds (4K, 1080p, 800px) with automatic aspect ratio preservation.
            </p>
          </div>

          <div className="saas-card p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              Automated Manifest & Naming
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Rename image sequences automatically with zero hassle. Includes an optional <code className="font-mono text-zinc-700 dark:text-zinc-300">manifest.json</code> metadata file indexing original filenames, dimensions, and byte counts.
            </p>
          </div>
        </div>

        {/* How It Works Explainer */}
        <div className="saas-card p-6 space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            <span>How to Package Multiple Images into a Compressed ZIP File</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center">1</span>
              <h4 className="font-bold text-zinc-900 dark:text-white pt-1">Select Images</h4>
              <p className="text-zinc-500 dark:text-zinc-400">
                Drag-and-drop photos, upload an entire folder, paste from clipboard (<kbd className="font-mono text-[10px]">Ctrl+V</kbd>), or pick files from your device.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center">2</span>
              <h4 className="font-bold text-zinc-900 dark:text-white pt-1">Configure Naming & Resizing</h4>
              <p className="text-zinc-500 dark:text-zinc-400">
                Customize the ZIP filename, choose sequential numbering, apply batch WebP conversion, or scale photos to 1080p Full HD.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center">3</span>
              <h4 className="font-bold text-zinc-900 dark:text-white pt-1">Compile Archive</h4>
              <p className="text-zinc-500 dark:text-zinc-400">
                Click "Compile ZIP Archive". JSZip will package, deflate, and assemble your photos locally in your browser memory.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center">4</span>
              <h4 className="font-bold text-zinc-900 dark:text-white pt-1">Instant 1-Click Download</h4>
              <p className="text-zinc-500 dark:text-zinc-400">
                Download the compiled <code className="font-mono text-indigo-600 dark:text-indigo-400">.zip</code> archive immediately without waiting for server uploads or email links.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-950 dark:text-white truncate max-w-md">
                  {previewItem.name}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  {previewItem.sizeFormatted} &bull; {previewItem.width} &times; {previewItem.height}px &bull; {previewItem.type}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-950/5 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 p-2">
              <img
                src={previewItem.previewUrl}
                alt={previewItem.name}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-zinc-500">Press ESC or click outside to close preview</span>
              <a
                href={previewItem.previewUrl}
                download={previewItem.name}
                className="saas-button-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Individual File</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
