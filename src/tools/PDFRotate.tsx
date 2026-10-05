/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  FileText,
  Download,
  AlertCircle,
  Loader2,
  RotateCw,
  RotateCcw,
  RefreshCw,
  Trash2,
  Eye,
  Lock,
  Unlock,
  ShieldCheck,
  Check,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  LayoutGrid
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import { pdfjs } from '../utils/pdfWorker';

interface PageItem {
  pageNum: number;
  originalRotation: number;
  userRotation: number; // 0, 90, 180, 270 relative offset
  dataUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
}

type BatchTargetMode = 'all' | 'selected' | 'odd' | 'even' | 'range';
type GridDensity = 'compact' | 'standard' | 'large';

export default function PDFRotate() {
  // File & Document State
  const [file, setFile] = useState<File | null>(null);
  const [rawArrayBuffer, setRawArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number; text: string }>({
    current: 0,
    total: 0,
    text: ''
  });
  const [isProcessingSave, setIsProcessingSave] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successBlob, setSuccessBlob] = useState<{ blob: Blob; url: string; size: number } | null>(null);

  // Password Security
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Batch Configuration
  const [batchTarget, setBatchTarget] = useState<BatchTargetMode>('all');
  const [customRangeInput, setCustomRangeInput] = useState<string>('');
  const [gridDensity, setGridDensity] = useState<GridDensity>('standard');

  // Preview Modal State
  const [previewModalPage, setPreviewModalPage] = useState<number | null>(null);
  const [modalZoom, setModalZoom] = useState<number>(100);

  // Drag State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up blob URLs when component unmounts or new blob is generated
  useEffect(() => {
    return () => {
      if (successBlob?.url) {
        URL.revokeObjectURL(successBlob.url);
      }
    };
  }, [successBlob]);

  // Parse page range string (e.g., "1-3, 5, 8-10")
  const parsePageRange = useCallback((rangeStr: string, total: number): Set<number> => {
    const result = new Set<number>();
    if (!rangeStr.trim()) return result;

    const parts = rangeStr.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(total, Math.max(start, end));
          for (let p = min; p <= max; p++) {
            result.add(p);
          }
        }
      } else {
        const p = parseInt(trimmed, 10);
        if (!isNaN(p) && p >= 1 && p <= total) {
          result.add(p);
        }
      }
    }
    return result;
  }, []);

  // Compute pages targeted by current batch setting
  const targetPageNumbers = useMemo((): Set<number> => {
    if (pages.length === 0) return new Set();
    const total = pages.length;

    switch (batchTarget) {
      case 'all':
        return new Set(pages.map((p) => p.pageNum));
      case 'selected':
        return selectedPages.size > 0 ? selectedPages : new Set(pages.map((p) => p.pageNum));
      case 'odd':
        return new Set(pages.filter((p) => p.pageNum % 2 !== 0).map((p) => p.pageNum));
      case 'even':
        return new Set(pages.filter((p) => p.pageNum % 2 === 0).map((p) => p.pageNum));
      case 'range':
        return parsePageRange(customRangeInput, total);
      default:
        return new Set(pages.map((p) => p.pageNum));
    }
  }, [pages, batchTarget, selectedPages, customRangeInput, parsePageRange]);

  // Load and render PDF pages as interactive thumbnails
  const loadPdf = async (pdfFile: File, userPassword = '') => {
    setError(null);
    setPasswordError(null);
    setIsLoading(true);
    setPages([]);
    setSelectedPages(new Set());
    setSuccessBlob(null);
    setLoadingProgress({ current: 0, total: 0, text: 'Reading file buffer...' });

    try {
      const buffer = await pdfFile.arrayBuffer();
      setRawArrayBuffer(buffer);

      const loadingTask = pdfjs.getDocument({
        data: buffer,
        password: userPassword,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@6.0.227/cmaps/',
        cMapPacked: true
      });

      loadingTask.onPassword = (_callback: any, reason: number) => {
        setIsPasswordProtected(true);
        if (reason === 2) {
          setPasswordError('Incorrect password. Please enter the valid document password.');
        }
      };

      const pdf = await loadingTask.promise;
      const total = pdf.numPages;
      setIsPasswordProtected(false);
      setPasswordError(null);
      setCustomRangeInput(`1-${total}`);

      const loadedPages: PageItem[] = [];
      const defaultSelected = new Set<number>();

      for (let i = 1; i <= total; i++) {
        setLoadingProgress({
          current: i,
          total,
          text: `Rendering preview ${i} of ${total}...`
        });

        const page = await pdf.getPage(i);
        // Extract native rotation
        const originalRotation = (page.rotate || 0) % 360;

        // Render thumbnail canvas at optimal resolution
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { alpha: false });

        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
          }).promise;

          loadedPages.push({
            pageNum: i,
            originalRotation,
            userRotation: 0,
            dataUrl: canvas.toDataURL('image/jpeg', 0.85),
            width: viewport.width,
            height: viewport.height,
            aspectRatio: viewport.width / viewport.height
          });
        }

        defaultSelected.add(i);
      }

      setPages(loadedPages);
      setSelectedPages(defaultSelected);
    } catch (err: any) {
      console.error('PDF loading error:', err);
      if (err?.name === 'PasswordException') {
        setIsPasswordProtected(true);
        setPasswordError('This PDF document is password-protected. Please enter the password to decrypt.');
      } else {
        setError(err.message || 'Failed to parse PDF document. Ensure the file is a valid, uncorrupted PDF.');
      }
    } finally {
      setIsLoading(false);
      setLoadingProgress({ current: 0, total: 0, text: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      if (uploaded.type !== 'application/pdf' && !uploaded.name.toLowerCase().endsWith('.pdf')) {
        setError('Please upload a valid PDF document (.pdf file only).');
        return;
      }
      setFile(uploaded);
      loadPdf(uploaded);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (dropped.type !== 'application/pdf' && !dropped.name.toLowerCase().endsWith('.pdf')) {
        setError('Please drop a valid PDF document (.pdf format).');
        return;
      }
      setFile(dropped);
      loadPdf(dropped);
    }
  };

  const handleResetFile = () => {
    if (successBlob?.url) {
      URL.revokeObjectURL(successBlob.url);
    }
    setFile(null);
    setRawArrayBuffer(null);
    setPages([]);
    setSelectedPages(new Set());
    setSuccessBlob(null);
    setError(null);
    setPassword('');
    setIsPasswordProtected(false);
    setPasswordError(null);
    setPreviewModalPage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Per-page rotation handler
  const rotateSinglePage = (pageNum: number, deltaDeg: number) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.pageNum === pageNum) {
          const nextRotation = (p.userRotation + deltaDeg + 360) % 360;
          return { ...p, userRotation: nextRotation };
        }
        return p;
      })
    );
    // Invalidate previous export blob so user downloads fresh result
    if (successBlob) setSuccessBlob(null);
  };

  const resetSinglePage = (pageNum: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNum === pageNum ? { ...p, userRotation: 0 } : p))
    );
    if (successBlob) setSuccessBlob(null);
  };

  // Batch rotation handler
  const applyBatchRotation = (deltaDeg: number) => {
    if (targetPageNumbers.size === 0) return;

    setPages((prev) =>
      prev.map((p) => {
        if (targetPageNumbers.has(p.pageNum)) {
          const nextRotation = (p.userRotation + deltaDeg + 360) % 360;
          return { ...p, userRotation: nextRotation };
        }
        return p;
      })
    );
    if (successBlob) setSuccessBlob(null);
  };

  const applyBatchReset = () => {
    if (targetPageNumbers.size === 0) return;

    setPages((prev) =>
      prev.map((p) => {
        if (targetPageNumbers.has(p.pageNum)) {
          return { ...p, userRotation: 0 };
        }
        return p;
      })
    );
    if (successBlob) setSuccessBlob(null);
  };

  // Selection toggle
  const togglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  };

  const selectAllPages = () => {
    setSelectedPages(new Set(pages.map((p) => p.pageNum)));
  };

  const deselectAllPages = () => {
    setSelectedPages(new Set());
  };

  const selectOddPages = () => {
    setSelectedPages(new Set(pages.filter((p) => p.pageNum % 2 !== 0).map((p) => p.pageNum)));
  };

  const selectEvenPages = () => {
    setSelectedPages(new Set(pages.filter((p) => p.pageNum % 2 === 0).map((p) => p.pageNum)));
  };

  const invertSelection = () => {
    setSelectedPages((prev) => {
      const next = new Set<number>();
      for (const p of pages) {
        if (!prev.has(p.pageNum)) {
          next.add(p.pageNum);
        }
      }
      return next;
    });
  };

  // Rotation Statistics
  const stats = useMemo(() => {
    const rotatedCount = pages.filter((p) => p.userRotation !== 0).length;
    const unmodifiedCount = pages.length - rotatedCount;
    return {
      total: pages.length,
      rotated: rotatedCount,
      unmodified: unmodifiedCount,
      selected: selectedPages.size
    };
  }, [pages, selectedPages]);

  // Execute Lossless PDF Rotation via pdf-lib
  const handleSaveAndExport = async () => {
    if (!rawArrayBuffer || pages.length === 0) return;
    setIsProcessingSave(true);
    setError(null);

    try {
      // Load document into pdf-lib
      const pdfDoc = await PDFDocument.load(rawArrayBuffer, { ignoreEncryption: true });
      const docPages = pdfDoc.getPages();

      pages.forEach((pageItem) => {
        const docPage = docPages[pageItem.pageNum - 1];
        if (docPage) {
          const currentRotation = docPage.getRotation().angle || 0;
          const newTotalAngle = ((currentRotation + pageItem.userRotation) % 360 + 360) % 360;
          docPage.setRotation(degrees(newTotalAngle));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const outputBlob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const outputUrl = URL.createObjectURL(outputBlob);

      setSuccessBlob({
        blob: outputBlob,
        url: outputUrl,
        size: outputBlob.size
      });
    } catch (err: any) {
      console.error('Error saving rotated PDF:', err);
      setError(err.message || 'An error occurred while compiling rotated PDF. Ensure the file is not locked.');
    } finally {
      setIsProcessingSave(false);
    }
  };

  const handleDownload = () => {
    if (!successBlob || !file) return;
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const link = document.createElement('a');
    link.href = successBlob.url;
    link.download = `${cleanName}_rotated.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    if (!successBlob) return;
    window.open(successBlob.url, '_blank', 'noopener,noreferrer');
  };

  // Keyboard navigation for Preview Modal
  useEffect(() => {
    if (previewModalPage === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewModalPage(null);
      } else if (e.key === 'ArrowLeft') {
        setPreviewModalPage((prev) => (prev && prev > 1 ? prev - 1 : prev));
      } else if (e.key === 'ArrowRight') {
        setPreviewModalPage((prev) => (prev && prev < pages.length ? prev + 1 : prev));
      } else if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        rotateSinglePage(previewModalPage, 90);
      } else if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey) {
        rotateSinglePage(previewModalPage, -90);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewModalPage, pages.length]);

  const currentModalPageItem = useMemo(() => {
    if (previewModalPage === null) return null;
    return pages.find((p) => p.pageNum === previewModalPage) || null;
  }, [previewModalPage, pages]);

  // Helper formatting for angle labels
  const formatAngleLabel = (angle: number) => {
    switch (angle) {
      case 0:
        return '0° (Original)';
      case 90:
        return '90° CW (Right)';
      case 180:
        return '180° Flip';
      case 270:
        return '270° / 90° CCW';
      default:
        return `${angle}°`;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-left">
      {/* Privacy & Engine Assurance Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-indigo-50/70 dark:bg-indigo-950/25 border border-indigo-200/70 dark:border-indigo-800/40 rounded-2xl text-xs">
        <div className="flex items-center gap-2.5 text-indigo-950 dark:text-indigo-200">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            <strong className="font-semibold text-indigo-900 dark:text-indigo-100">100% Client-Side Privacy:</strong> Your PDF never leaves your device. Pages are rotated losslessly in browser memory with zero compression or quality loss.
          </span>
        </div>
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Lossless Vector Geometry</span>
        </div>
      </div>

      {/* Password Decryption Dialog */}
      {isPasswordProtected && (
        <div className="saas-card p-6 border-amber-300 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Password Protected Document</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                This PDF is encrypted. Enter the document password below to decrypt and rotate pages locally.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (file) loadPdf(file, password);
            }}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <div className="relative flex-1">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter document password..."
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!password || isLoading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
              <span>Unlock Document</span>
            </button>
          </form>

          {passwordError && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}
        </div>
      )}

      {/* Upload Zone (When No File Loaded) */}
      {!file && !isPasswordProtected && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`saas-card relative border-2 border-dashed p-10 sm:p-14 text-center transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]'
              : 'border-zinc-250 dark:border-zinc-800 hover:border-indigo-400/80 bg-zinc-50/40 dark:bg-zinc-900/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-label="Upload PDF document to rotate"
          />

          <div className="max-w-md mx-auto space-y-4 pointer-events-none">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <RotateCw className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <p className="text-base font-bold text-zinc-900 dark:text-white">
                Drop your PDF here or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Supports single-page & multi-page documents • Instant visual rotation
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60">90° CW & CCW</span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60">180° Flip</span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60">Odd/Even Filter</span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60">Lossless Output</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Progress State */}
      {isLoading && (
        <div className="saas-card p-10 text-center space-y-4">
          <Loader2 className="w-9 h-9 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {loadingProgress.text || 'Processing PDF document...'}
            </p>
            {loadingProgress.total > 0 && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Page {loadingProgress.current} of {loadingProgress.total} (
                {Math.round((loadingProgress.current / loadingProgress.total) * 100)}%)
              </p>
            )}
          </div>
          {loadingProgress.total > 0 && (
            <div className="max-w-xs mx-auto h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-200"
                style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="font-bold">Error Processing PDF</p>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Workspace (When PDF is Loaded) */}
      {file && pages.length > 0 && !isLoading && (
        <div className="space-y-6">
          {/* Active File Header Bar */}
          <div className="saas-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-2.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-sm sm:max-w-md md:max-w-lg">
                  {file.name}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                  <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{pages.length} {pages.length === 1 ? 'page' : 'pages'}</span>
                  <span>•</span>
                  <span className={stats.rotated > 0 ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}>
                    {stats.rotated} modified
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleResetFile}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition cursor-pointer"
                title="Remove current file and upload another"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Change PDF</span>
              </button>
            </div>
          </div>

          {/* Master Batch Rotation & Filter Toolbar */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-3.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Batch Rotation Toolbar</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                  {targetPageNumbers.size} of {pages.length} pages targeted
                </span>
              </div>

              {/* Grid Density Selector */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                <button
                  onClick={() => setGridDensity('compact')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                    gridDensity === 'compact'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                  title="Compact Grid"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Compact</span>
                </button>
                <button
                  onClick={() => setGridDensity('standard')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                    gridDensity === 'standard'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                  title="Standard Grid"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Standard</span>
                </button>
                <button
                  onClick={() => setGridDensity('large')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 ${
                    gridDensity === 'large'
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                  title="Large Grid"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Large</span>
                </button>
              </div>
            </div>

            {/* Scope / Target Selector */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-5 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mr-1">Apply To:</span>
                {(
                  [
                    { id: 'all', label: 'All Pages' },
                    { id: 'selected', label: `Selected (${selectedPages.size})` },
                    { id: 'odd', label: 'Odd Pages' },
                    { id: 'even', label: 'Even Pages' },
                    { id: 'range', label: 'Custom Range' }
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setBatchTarget(opt.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      batchTarget === opt.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Custom Range Input if 'range' selected */}
              {batchTarget === 'range' && (
                <div className="md:col-span-3">
                  <input
                    type="text"
                    value={customRangeInput}
                    onChange={(e) => setCustomRangeInput(e.target.value)}
                    placeholder={`e.g. 1-3, 5, 8-${pages.length}`}
                    className="w-full px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className={`flex flex-wrap items-center gap-2 ${batchTarget === 'range' ? 'md:col-span-4 justify-end' : 'md:col-span-7 justify-end'}`}>
                <button
                  onClick={() => applyBatchRotation(-90)}
                  disabled={targetPageNumbers.size === 0}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
                  title="Rotate targeted pages 90° counter-clockwise"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Rotate 90° CCW</span>
                </button>

                <button
                  onClick={() => applyBatchRotation(90)}
                  disabled={targetPageNumbers.size === 0}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
                  title="Rotate targeted pages 90° clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Rotate 90° CW</span>
                </button>

                <button
                  onClick={() => applyBatchRotation(180)}
                  disabled={targetPageNumbers.size === 0}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
                  title="Flip targeted pages 180° upside down"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Flip 180°</span>
                </button>

                <button
                  onClick={applyBatchReset}
                  disabled={targetPageNumbers.size === 0}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 text-zinc-600 dark:text-zinc-400 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 transition"
                  title="Reset targeted pages back to 0°"
                >
                  <span>Reset 0°</span>
                </button>
              </div>
            </div>

            {/* Quick Selection Helpers */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Quick Select:</span>
              <button
                onClick={selectAllPages}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 underline cursor-pointer"
              >
                Select All
              </button>
              <span>•</span>
              <button
                onClick={deselectAllPages}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 underline cursor-pointer"
              >
                Deselect All
              </button>
              <span>•</span>
              <button
                onClick={selectOddPages}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 underline cursor-pointer"
              >
                Select Odd
              </button>
              <span>•</span>
              <button
                onClick={selectEvenPages}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 underline cursor-pointer"
              >
                Select Even
              </button>
              <span>•</span>
              <button
                onClick={invertSelection}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 underline cursor-pointer"
              >
                Invert Selection
              </button>
            </div>
          </div>

          {/* Page Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
              <span>Click on any page or use card buttons to rotate. Double-click to preview.</span>
              <span>{pages.length} Pages</span>
            </div>

            <div
              className={`grid gap-4 ${
                gridDensity === 'compact'
                  ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
                  : gridDensity === 'large'
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              }`}
            >
              {pages.map((page) => {
                const isSelected = selectedPages.has(page.pageNum);
                const isTargeted = targetPageNumbers.has(page.pageNum);
                const isRotated = page.userRotation !== 0;

                return (
                  <div
                    key={page.pageNum}
                    className={`group relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-zinc-900 shadow-xs hover:shadow-md ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : isTargeted
                        ? 'border-zinc-300 dark:border-zinc-700'
                        : 'border-zinc-200 dark:border-zinc-800 opacity-80'
                    }`}
                  >
                    {/* Card Top Header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-850/60 border-b border-zinc-150 dark:border-zinc-800 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePageSelection(page.pageNum)}
                          className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700 cursor-pointer"
                        />
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">
                          #{page.pageNum}
                        </span>
                      </label>

                      {/* Rotation Angle Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          page.userRotation === 0
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                            : page.userRotation === 90
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60'
                            : page.userRotation === 180
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60'
                            : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60'
                        }`}
                      >
                        {formatAngleLabel(page.userRotation)}
                      </span>
                    </div>

                    {/* Thumbnail Display with Smooth CSS Rotation */}
                    <div
                      onClick={() => rotateSinglePage(page.pageNum, 90)}
                      onDoubleClick={() => setPreviewModalPage(page.pageNum)}
                      className="relative p-4 flex items-center justify-center bg-zinc-100/50 dark:bg-zinc-950/40 min-h-[170px] cursor-pointer group-hover:bg-zinc-100/80 dark:group-hover:bg-zinc-950/70 transition-colors select-none"
                      title="Click to rotate +90° CW. Double-click to preview."
                    >
                      <div
                        className="transition-transform duration-300 ease-out shadow-sm rounded overflow-hidden max-w-full"
                        style={{
                          transform: `rotate(${page.userRotation}deg)`
                        }}
                      >
                        <img
                          src={page.dataUrl}
                          alt={`Page ${page.pageNum}`}
                          className={`object-contain max-h-36 sm:max-h-40 rounded pointer-events-none ${
                            page.userRotation % 180 !== 0 ? 'scale-90' : ''
                          }`}
                        />
                      </div>

                      {/* Hover Overlay with Magnify Button */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewModalPage(page.pageNum);
                          }}
                          className="p-1.5 rounded-lg bg-white/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 shadow-sm hover:scale-105 transition cursor-pointer"
                          title="Zoom & Fullscreen Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Action Controls Footer */}
                    <div className="grid grid-cols-4 gap-1 p-2 bg-zinc-50/70 dark:bg-zinc-850/40 border-t border-zinc-150 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={() => rotateSinglePage(page.pageNum, -90)}
                        className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
                        title="Rotate 90° CCW (Left)"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => rotateSinglePage(page.pageNum, 90)}
                        className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
                        title="Rotate 90° CW (Right)"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => rotateSinglePage(page.pageNum, 180)}
                        className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition cursor-pointer shadow-2xs"
                        title="Flip 180°"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => resetSinglePage(page.pageNum)}
                        disabled={!isRotated}
                        className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
                        title="Reset page to 0°"
                      >
                        <span className="text-[10px] font-bold">0°</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compilation & Export Action Bar */}
          <div className="saas-card p-6 bg-gradient-to-r from-zinc-50 to-indigo-50/20 dark:from-zinc-900 dark:to-indigo-950/10 border-indigo-200/50 dark:border-indigo-800/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Save Rotated Document</span>
                  {stats.rotated > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                      {stats.rotated} of {stats.total} pages rotated
                    </span>
                  )}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Embeds new page rotation orientation into PDF metadata without re-encoding or degrading vector text.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSaveAndExport}
                  disabled={isProcessingSave || pages.length === 0}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
                >
                  {isProcessingSave ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Compiling PDF...</span>
                    </>
                  ) : (
                    <>
                      <RotateCw className="w-4 h-4" />
                      <span>{successBlob ? 'Recompile PDF' : 'Save PDF Rotations'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Download Output State */}
            {successBlob && (
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">
                      Rotated PDF Ready! ({(successBlob.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Permanent lossless rotation saved across all designated pages.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleOpenInNewTab}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Preview in Tab</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Rotated PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* High-Resolution Interactive Page Preview Modal */}
      {previewModalPage !== null && currentModalPageItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  Page Preview #{currentModalPageItem.pageNum} of {pages.length}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200/60 dark:border-indigo-800/60">
                  {formatAngleLabel(currentModalPageItem.userRotation)}
                </span>
              </div>

              {/* Zoom & Close Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalZoom((prev) => Math.max(50, prev - 25))}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 w-10 text-center">
                  {modalZoom}%
                </span>
                <button
                  onClick={() => setModalZoom((prev) => Math.min(200, prev + 25))}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-700 mx-1" />

                <button
                  onClick={() => setPreviewModalPage(null)}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
                  title="Close Preview (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body / Canvas Image */}
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-zinc-100/70 dark:bg-zinc-950/70">
              <div
                className="transition-transform duration-300 ease-out shadow-lg rounded bg-white p-1"
                style={{
                  transform: `scale(${modalZoom / 100}) rotate(${currentModalPageItem.userRotation}deg)`
                }}
              >
                <img
                  src={currentModalPageItem.dataUrl}
                  alt={`Preview Page ${currentModalPageItem.pageNum}`}
                  className="max-h-[60vh] object-contain rounded"
                />
              </div>
            </div>

            {/* Modal Navigation & Rotation Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 text-xs">
              {/* Previous / Next Page Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewModalPage((prev) => (prev && prev > 1 ? prev - 1 : prev))}
                  disabled={previewModalPage === 1}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-zinc-500 font-medium">
                  {currentModalPageItem.pageNum} / {pages.length}
                </span>

                <button
                  onClick={() =>
                    setPreviewModalPage((prev) => (prev && prev < pages.length ? prev + 1 : prev))
                  }
                  disabled={previewModalPage === pages.length}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold flex items-center gap-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 transition cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Rotation Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => rotateSinglePage(currentModalPageItem.pageNum, -90)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Rotate CCW (L)</span>
                </button>

                <button
                  onClick={() => rotateSinglePage(currentModalPageItem.pageNum, 90)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate CW (R)</span>
                </button>

                <button
                  onClick={() => rotateSinglePage(currentModalPageItem.pageNum, 180)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold flex items-center gap-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Flip 180°</span>
                </button>

                <button
                  onClick={() => resetSinglePage(currentModalPageItem.pageNum)}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                >
                  <span>Reset 0°</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
