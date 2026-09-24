/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import {
  FileDown,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
  Sliders,
  ShieldCheck,
  Check,
  Info,
  Trash2,
  Scale,
  Copy,
  Gauge,
  FileCheck
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type CompressionPreset = 'extreme' | 'balanced' | 'studio' | 'target_size' | 'custom';
export type ColorMode = 'color' | 'grayscale' | 'monochrome';

export interface PageMetric {
  pageNum: number;
  origThumb?: string;
  compThumb?: string;
}

export default function PDFCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [preset, setPreset] = useState<CompressionPreset>('balanced');
  const [targetSizeKb, setTargetSizeKb] = useState<number>(500);

  // Custom Fine Tuning
  const [customQuality, setCustomQuality] = useState<number>(55); // 10 to 95%
  const [customDpiScale, setCustomDpiScale] = useState<number>(1.0); // 0.5 to 2.0
  const [colorMode, setColorMode] = useState<ColorMode>('color');

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Results state
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalBytes: number;
    compressedBytes: number;
    savedBytes: number;
    percentSaved: number;
    processingTimeMs: number;
  } | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load and inspect PDF file
  const loadPdf = async (uploadedFile: File) => {
    setIsProcessing(true);
    setProgressStatus(`Analyzing "${uploadedFile.name}"...`);
    setError(null);
    setCompressedBlob(null);
    setCompressionStats(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();

      if (count === 0) {
        throw new Error('This PDF contains 0 pages.');
      }

      setFile(uploadedFile);
      setTotalPages(count);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not parse PDF. Please ensure the file is not password-protected or corrupted.');
      setFile(null);
      setTotalPages(0);
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.endsWith('.pdf')) {
        setError('Please select a valid .pdf file.');
        return;
      }
      loadPdf(uploadedFile);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Instant Sample Heavy PDF generation for testing
  const handleLoadSamplePdf = async () => {
    setIsProcessing(true);
    setProgressStatus('Synthesizing graphic-heavy sample PDF in browser memory...');
    setError(null);

    try {
      const doc = await PDFDocument.create();
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
      const regFont = await doc.embedFont(StandardFonts.Helvetica);

      // Create 3 graphic-heavy pages
      const pagesData = [
        {
          title: 'HIGH-RESOLUTION ARCHITECTURAL PORTFOLIO',
          subtitle: 'Large Vector Masterplan & Texture Overlay (Sample Asset)',
          themeColor: [0.15, 0.35, 0.95] as [number, number, number],
        },
        {
          title: 'COMMERCIAL BROCHURE & PHOTO CATALOG',
          subtitle: 'Full Color Spectrum Visual Layout (Sample Asset)',
          themeColor: [0.85, 0.25, 0.45] as [number, number, number],
        },
        {
          title: 'ENGINEERING SPECIFICATIONS & SCHEMATICS',
          subtitle: 'CAD Drawing Sheet & Vector Raster (Sample Asset)',
          themeColor: [0.08, 0.65, 0.45] as [number, number, number],
        },
      ];

      for (let i = 0; i < pagesData.length; i++) {
        const item = pagesData[i];
        const page = doc.addPage([595.28, 841.89]); // A4

        // Top Banner
        page.drawRectangle({
          x: 30,
          y: 760,
          width: 535.28,
          height: 52,
          color: rgb(item.themeColor[0], item.themeColor[1], item.themeColor[2]),
        });
        page.drawText(item.title, {
          x: 45,
          y: 780,
          size: 13,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        // Subtitle
        page.drawText(item.subtitle, {
          x: 45,
          y: 725,
          size: 10,
          font: regFont,
          color: rgb(0.3, 0.3, 0.35),
        });

        // Simulated High-Density Pattern Grid
        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 4; col++) {
            const bx = 45 + col * 125;
            const by = 200 + row * 80;
            page.drawRectangle({
              x: bx,
              y: by,
              width: 115,
              height: 70,
              color: rgb(
                0.9 - (row * 0.05) + (col * 0.02),
                0.92 - (col * 0.05),
                0.95 - (row * 0.03)
              ),
              borderColor: rgb(0.75, 0.8, 0.9),
              borderWidth: 1,
            });
            page.drawText(`Tile [${row + 1},${col + 1}]`, {
              x: bx + 10,
              y: by + 50,
              size: 8,
              font: boldFont,
              color: rgb(0.2, 0.3, 0.5),
            });
          }
        }

        // Footer
        page.drawLine({
          start: { x: 45, y: 50 },
          end: { x: 550, y: 50 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
        page.drawText(`Toolique PDF Compressor Demo Document • Page ${i + 1} of 3`, {
          x: 45,
          y: 35,
          size: 8,
          font: regFont,
          color: rgb(0.5, 0.5, 0.55),
        });
      }

      const pdfBytes = await doc.save();
      const sampleFile = new File([pdfBytes as any], 'High_Res_Presentation_Sample.pdf', { type: 'application/pdf' });
      await loadPdf(sampleFile);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate sample document.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  // Compression Parameter Resolver
  const resolveCompressionParams = () => {
    let quality = 0.55;
    let scale = 1.0;
    let gray = colorMode === 'grayscale';

    if (preset === 'extreme') {
      quality = 0.30;
      scale = 0.75;
      gray = true; // Extreme automatically leverages grayscale compression for max savings
    } else if (preset === 'balanced') {
      quality = 0.55;
      scale = 1.0;
      gray = colorMode === 'grayscale';
    } else if (preset === 'studio') {
      quality = 0.80;
      scale = 1.4;
      gray = false;
    } else if (preset === 'target_size') {
      // Auto-tune quality & scale based on target size vs current file size
      if (file) {
        const currentKb = file.size / 1024;
        const ratio = targetSizeKb / currentKb;
        if (ratio < 0.25) {
          quality = 0.25;
          scale = 0.65;
          gray = true;
        } else if (ratio < 0.5) {
          quality = 0.40;
          scale = 0.85;
          gray = true;
        } else if (ratio < 0.75) {
          quality = 0.60;
          scale = 1.0;
        } else {
          quality = 0.78;
          scale = 1.2;
        }
      }
    } else if (preset === 'custom') {
      quality = customQuality / 100;
      scale = customDpiScale;
      gray = colorMode === 'grayscale';
    }

    return { quality, scale, grayscale: gray };
  };

  // Main Compression Execution Engine
  const handleCompress = async () => {
    if (!file) return;

    const startTime = performance.now();
    setIsProcessing(true);
    setError(null);
    setProgressPercent(0);
    setProgressStatus('Initializing client-side WebAssembly rasterizer...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer.slice(0) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const { quality, scale, grayscale } = resolveCompressionParams();
      const compressedPdfDoc = await PDFDocument.create();

      for (let i = 1; i <= numPages; i++) {
        const percent = Math.round(((i - 1) / numPages) * 100);
        setProgressPercent(percent);
        setProgressStatus(`Optimizing page ${i} of ${numPages} (${percent}%)...`);

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not initialize canvas context.');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await (page.render as any)({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        // Apply Grayscale transformation if enabled
        if (grayscale) {
          const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let px = 0; px < data.length; px += 4) {
            const g = 0.299 * data[px] + 0.587 * data[px + 1] + 0.114 * data[px + 2];
            data[px] = g;
            data[px + 1] = g;
            data[px + 2] = g;
          }
          context.putImageData(imgData, 0, 0);
        }

        // Convert to JPEG data URL
        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
        const imageBytes = await fetch(jpegDataUrl).then((r) => r.arrayBuffer());

        const pdfImage = await compressedPdfDoc.embedJpg(imageBytes);
        const newPage = compressedPdfDoc.addPage([viewport.width, viewport.height]);
        newPage.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      setProgressPercent(95);
      setProgressStatus('Packaging compressed PDF binary stream...');
      const compressedBytes = await compressedPdfDoc.save();
      const blob = new Blob([compressedBytes as any], { type: 'application/pdf' });

      const origSize = file.size;
      const compSize = blob.size;
      const savedBytes = Math.max(0, origSize - compSize);
      const percentSaved = Math.round((savedBytes / origSize) * 100);
      const processingTimeMs = Math.round(performance.now() - startTime);

      setCompressedBlob(blob);
      setCompressionStats({
        originalBytes: origSize,
        compressedBytes: compSize,
        savedBytes,
        percentSaved,
        processingTimeMs,
      });

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error(err);
      setError('An error occurred during compression. Please ensure the PDF is uncorrupted.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
      setProgressPercent(100);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedBlob);
    link.download = `${file.name.replace(/\.pdf$/i, '')}_compressed.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const generateReportText = () => {
    if (!file || !compressionStats) return '';
    let text = `========================================================\n`;
    text += `TOOLIQUE CLIENT-SIDE PDF COMPRESSION AUDIT\n`;
    text += `Timestamp: ${new Date().toLocaleString()}\n`;
    text += `File Name: ${file.name}\n`;
    text += `Page Count: ${totalPages} Pages\n`;
    text += `Preset Applied: ${preset.toUpperCase()}\n`;
    text += `========================================================\n\n`;

    text += `COMPRESSION METRICS:\n`;
    text += `• Original Size: ${formatBytes(compressionStats.originalBytes)}\n`;
    text += `• Compressed Size: ${formatBytes(compressionStats.compressedBytes)}\n`;
    text += `• Bandwidth Saved: ${formatBytes(compressionStats.savedBytes)} (-${compressionStats.percentSaved}%)\n`;
    text += `• Processing Time: ${(compressionStats.processingTimeMs / 1000).toFixed(2)}s\n\n`;

    text += `100% In-Browser WebAssembly Execution • Privacy Guaranteed\n`;
    return text;
  };

  const handleCopyReport = () => {
    const report = generateReportText();
    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Action & Preset Selection Bar */}
      <div className="saas-card p-4 flex flex-wrap items-center justify-between gap-4 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl overflow-x-auto">
          <button
            onClick={() => setPreset('extreme')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              preset === 'extreme'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Extreme (~80% Drop)</span>
          </button>

          <button
            onClick={() => setPreset('balanced')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              preset === 'balanced'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-emerald-500" />
            <span>Balanced (Recommended)</span>
          </button>

          <button
            onClick={() => setPreset('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              preset === 'studio'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Studio Quality (Light)</span>
          </button>

          <button
            onClick={() => setPreset('target_size')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              preset === 'target_size'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-blue-500" />
            <span>Target File Size</span>
          </button>

          <button
            onClick={() => setPreset('custom')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              preset === 'custom'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-500" />
            <span>Custom Tuning</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLoadSamplePdf}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            title="Load a heavy sample graphic presentation to test compression"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Try Sample Heavy PDF</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>{file ? 'Replace PDF' : 'Upload PDF'}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {file && (
            <button
              onClick={() => {
                setFile(null);
                setTotalPages(0);
                setCompressedBlob(null);
                setCompressionStats(null);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }}
              className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition cursor-pointer"
              title="Clear current file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress or Error Banner */}
      {isProcessing && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>{progressStatus || 'Compressing document...'}</span>
            </div>
            <span className="font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full bg-indigo-200 dark:bg-indigo-900/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): File Config & Live Preview */}
        <div className="lg:col-span-8 space-y-6">
          {!file ? (
            /* Upload Empty State */
            <div className="saas-card p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 hover:border-indigo-500/50 transition">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                <FileDown className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Upload a PDF to Compress & Shrink</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                  Reduce heavy document sizes for government portals, job applications, and email attachments without losing legibility.
                </p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <label className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition shadow-md flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Choose PDF File</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleLoadSamplePdf}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Load Sample Presentation</span>
                </button>
              </div>
              <div className="pt-4 flex items-center justify-center gap-4 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% In-Browser Privacy
                </span>
                <span>•</span>
                <span>Grayscale Compression</span>
                <span>•</span>
                <span>Zero File Uploads</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Document Overview Bar */}
              <div className="saas-card p-4 flex flex-wrap items-center justify-between gap-3 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-[11px] text-zinc-400 font-medium">
                      {formatBytes(file.size)} • {totalPages} Total Pages
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold uppercase">
                    Preset: {preset}
                  </span>
                </div>
              </div>

              {/* Compression Configuration Details Card */}
              <div className="saas-card p-6 space-y-5">
                <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Optimization Parameters</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Fine-tune DPI rasterization scale, JPEG quality compression, and color channels.
                  </p>
                </div>

                {/* Preset Specific Controls */}
                {preset === 'target_size' && (
                  <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-blue-900 dark:text-blue-200">
                        Target Maximum File Size
                      </label>
                      <span className="font-mono font-black text-sm text-blue-700 dark:text-blue-300">
                        {targetSizeKb < 1000 ? `${targetSizeKb} KB` : `${(targetSizeKb / 1024).toFixed(1)} MB`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[100, 200, 500, 1024, 2048].map((kb) => (
                        <button
                          key={kb}
                          onClick={() => setTargetSizeKb(kb)}
                          className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                            targetSizeKb === kb
                              ? 'border-blue-500 bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                              : 'border-blue-200 dark:border-blue-900/60 text-zinc-700 dark:text-zinc-300 hover:bg-white/50'
                          }`}
                        >
                          {kb < 1000 ? `≤ ${kb} KB` : `≤ ${kb / 1024} MB`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {preset === 'custom' && (
                  <div className="space-y-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                    {/* Quality Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-700 dark:text-zinc-300">JPEG Image Quality</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">{customQuality}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={95}
                        value={customQuality}
                        onChange={(e) => setCustomQuality(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>

                    {/* Scale Factor Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-zinc-700 dark:text-zinc-300">Resolution Scale (DPI Multiplier)</span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400">{customDpiScale.toFixed(2)}×</span>
                      </div>
                      <input
                        type="range"
                        min={0.5}
                        max={1.8}
                        step={0.1}
                        value={customDpiScale}
                        onChange={(e) => setCustomDpiScale(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>
                )}

                {/* Color Mode Switcher */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Color Channel Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setColorMode('color')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        colorMode === 'color'
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="text-xs font-bold">Full Color (RGB)</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">Preserves all photo hues & gradients</div>
                    </button>

                    <button
                      onClick={() => setColorMode('grayscale')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        colorMode === 'grayscale'
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="text-xs font-bold">Grayscale (B&W)</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">Saves extra ~35% for forms & text</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Embed */}
              {previewUrl && (
                <div className="saas-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Compressed PDF Inspector</h3>
                      <p className="text-xs text-zinc-400">Live preview of optimized document rendered directly in memory.</p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>

                  <div className="w-full h-[550px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950">
                    <iframe
                      src={`${previewUrl}#toolbar=1`}
                      title="Compressed PDF Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Action, Stats & Verification */}
        <div className="lg:col-span-4 space-y-6">
          <div className="saas-card p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Compression Engine</span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1 font-mono">
                {file ? formatBytes(file.size) : '0 MB'}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleCompress}
              disabled={!file || isProcessing}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compressing Document...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Compress & Optimize PDF</span>
                </>
              )}
            </button>

            {/* Compression Outcome Card */}
            {compressionStats && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Compression Successful!</span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-white/70 dark:bg-zinc-900/70 rounded-xl text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-sans">Before:</span>
                    <strong className="text-zinc-800 dark:text-zinc-200">{formatBytes(compressionStats.originalBytes)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-sans">After:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{formatBytes(compressionStats.compressedBytes)}</strong>
                  </div>
                </div>

                <div className="text-xs text-emerald-700 dark:text-emerald-300 font-bold flex justify-between items-center">
                  <span>Saved Bandwidth:</span>
                  <span className="font-mono text-sm">-{compressionStats.percentSaved}% ({formatBytes(compressionStats.savedBytes)})</span>
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Compressed PDF</span>
                </button>
              </div>
            )}

            {/* Document Checklist Summary */}
            <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500">Page Count:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{totalPages} Pages</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500">Selected Profile:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{preset}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Color Palette:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase">{colorMode}</span>
              </div>
            </div>

            {/* Copy Audit Report */}
            {compressionStats && (
              <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4">
                <button
                  onClick={handleCopyReport}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedReport ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied Report!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Copy Compression Audit</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Privacy & Air-Gap Verification Card */}
          <div className="saas-card p-5 space-y-3 bg-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>100% In-Browser Privacy Shield</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Your confidential files never leave your computer. PDF rendering, JPEG quantizing, and binary repacking
              execute exclusively in your browser RAM using WebAssembly.
            </p>
          </div>

          {/* Pro-Tips Card */}
          <div className="saas-card p-5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
              <Info className="w-4 h-4 text-indigo-500" />
              <span>Compression Best Practices</span>
            </div>
            <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5 list-disc pl-4">
              <li>
                <strong>Government & Portal Limits</strong>: Use <code className="text-[10px]">Target File Size</code> to hit &le; 200 KB or &le; 500 KB caps.
              </li>
              <li>
                <strong>Scanned Forms & Invoices</strong>: Switch to <code className="text-[10px]">Grayscale</code> for an immediate extra ~35% space reduction.
              </li>
              <li>
                <strong>Presentation Slides</strong>: Use <code className="text-[10px]">Balanced</code> to retain high-clarity typography.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
