/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileImage,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Check,
  Trash2,
  Zap,
  Archive,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Copy,
  Info,
  Layers,
  Square,
  CheckSquare,
  X,
  XCircle,
  FileText
} from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type ImageOutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';
export type DpiPreset = '72' | '150' | '300' | '600' | 'custom';
export type ColorFilterMode = 'original' | 'grayscale' | 'invert';

export interface ConvertedPage {
  pageNumber: number; // 1-indexed
  pageIndex: number;  // 0-indexed
  widthPt: number;
  heightPt: number;
  selected: boolean;
  thumbnailUrl?: string;
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  convertedWidth: number;
  convertedHeight: number;
  convertedSize: number;
  status: 'idle' | 'rendering' | 'done' | 'error';
  error?: string;
}

const DPI_PRESETS: { id: DpiPreset; label: string; dpi: number; desc: string; badge: string }[] = [
  { id: '72', label: '72 DPI', dpi: 72, desc: 'Fast & Lightweight (Screen/Web)', badge: '1.0× Fast' },
  { id: '150', label: '150 DPI', dpi: 150, desc: 'Standard Balance (Email/Docs)', badge: '2.08× Balanced' },
  { id: '300', label: '300 DPI', dpi: 300, desc: 'High Definition (Print/OCR)', badge: '4.17× Crisp' },
  { id: '600', label: '600 DPI', dpi: 600, desc: 'Ultra High Res (Archival/Vector)', badge: '8.33× Ultra' },
  { id: 'custom', label: 'Custom', dpi: 200, desc: 'User-defined DPI Scale', badge: 'Custom' },
];

export default function PDFToImage() {
  // Document State
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pages, setPages] = useState<ConvertedPage[]>([]);
  const [pdfJsDoc, setPdfJsDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);

  // Conversion Settings
  const [outputFormat, setOutputFormat] = useState<ImageOutputFormat>('image/png');
  const [dpiPreset, setDpiPreset] = useState<DpiPreset>('150');
  const [customDpi, setCustomDpi] = useState<number>(200);
  const [quality, setQuality] = useState<number>(90); // 10-100% for JPG/WebP
  const [transparentBg, setTransparentBg] = useState<boolean>(false);
  const [colorMode, setColorMode] = useState<ColorFilterMode>('original');
  const [customPrefix, setCustomPrefix] = useState<string>('');

  // Page Selection Mode
  const [selectionMode, setSelectionMode] = useState<'all' | 'range' | 'custom'>('all');
  const [rangeInput, setRangeInput] = useState<string>('1-3');

  // Conversion Execution State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Preview Modal State
  const [inspectPage, setInspectPage] = useState<ConvertedPage | null>(null);
  const [copiedPageNum, setCopiedPageNum] = useState<number | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelConversionRef = useRef<boolean>(false);
  const arrayBufferRef = useRef<ArrayBuffer | null>(null);

  // Calculate current effective DPI
  const effectiveDpi = dpiPreset === 'custom' ? customDpi : (DPI_PRESETS.find((p) => p.id === dpiPreset)?.dpi || 150);
  const effectiveScale = effectiveDpi / 72;

  // Cleanup helper for object URLs
  const cleanupUrls = useCallback((pageList: ConvertedPage[]) => {
    pageList.forEach((p) => {
      if (p.thumbnailUrl && p.thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(p.thumbnailUrl);
      }
      if (p.convertedUrl && p.convertedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(p.convertedUrl);
      }
    });
  }, []);

  // Format bytes helper
  const formatSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Helper to parse page ranges e.g. "1-3, 5, 8-10"
  const parseRangeString = (str: string, max: number): number[] => {
    const list: number[] = [];
    const parts = str.split(',').map((s) => s.trim()).filter(Boolean);
    for (const p of parts) {
      if (p.includes('-')) {
        const [startStr, endStr] = p.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= max && start <= end) {
          for (let k = start; k <= end; k++) {
            if (!list.includes(k)) list.push(k);
          }
        }
      } else {
        const num = parseInt(p, 10);
        if (!isNaN(num) && num >= 1 && num <= max) {
          if (!list.includes(num)) list.push(num);
        }
      }
    }
    return list.sort((a, b) => a - b);
  };

  // Synchronize range input with page selection
  useEffect(() => {
    if (selectionMode === 'range' && totalPages > 0) {
      const selectedNums = parseRangeString(rangeInput, totalPages);
      const activeSet = new Set(selectedNums);
      setPages((prev) => prev.map((p) => ({ ...p, selected: activeSet.has(p.pageNumber) })));
    }
  }, [rangeInput, selectionMode, totalPages]);

  // Load and parse uploaded PDF file
  const loadPdfFile = async (uploadedFile: File) => {
    setIsProcessing(true);
    setProgressStatus(`Loading and parsing "${uploadedFile.name}"...`);
    setError(null);
    setStatusMessage(null);
    cancelConversionRef.current = false;

    cleanupUrls(pages);
    setPages([]);
    setPdfJsDoc(null);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      arrayBufferRef.current = buffer;

      // Load with pdfjs
      const loadingTask = pdfjs.getDocument({ data: buffer.slice(0) });
      const doc = await loadingTask.promise;
      const count = doc.numPages;

      if (count === 0) {
        throw new Error('This PDF file contains 0 pages.');
      }

      setFile(uploadedFile);
      setTotalPages(count);
      setPdfJsDoc(doc);
      setCustomPrefix(uploadedFile.name.replace(/\.pdf$/i, ''));
      setRangeInput(`1-${Math.min(count, 5)}`);

      // Initialize page entries and render fast lightweight thumbnails
      const initialPages: ConvertedPage[] = [];
      for (let i = 1; i <= count; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        initialPages.push({
          pageNumber: i,
          pageIndex: i - 1,
          widthPt: Math.round(viewport.width),
          heightPt: Math.round(viewport.height),
          selected: true,
          convertedBlob: null,
          convertedUrl: null,
          convertedWidth: 0,
          convertedHeight: 0,
          convertedSize: 0,
          status: 'idle',
        });
      }

      setPages(initialPages);

      // Async render initial lightweight thumbnail previews (scale 0.25)
      setProgressStatus('Generating page previews...');
      const updatedPages = [...initialPages];
      for (let i = 1; i <= count; i++) {
        try {
          const page = await doc.getPage(i);
          const thumbViewport = page.getViewport({ scale: 0.25 });
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, thumbViewport.width);
          canvas.height = Math.max(1, thumbViewport.height);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await (page.render as any)({
              canvasContext: ctx,
              viewport: thumbViewport,
              canvas,
            }).promise;
            updatedPages[i - 1].thumbnailUrl = canvas.toDataURL('image/jpeg', 0.65);
          }
          canvas.width = 0;
          canvas.height = 0;
        } catch (thumbErr) {
          console.warn(`Thumbnail rendering error for page ${i}:`, thumbErr);
        }
      }
      setPages(updatedPages);
      setStatusMessage(`Successfully loaded ${count} page${count > 1 ? 's' : ''}.`);
    } catch (err: any) {
      console.error(err);
      if (err.name === 'PasswordException') {
        setError('This PDF is password-protected. Please unlock or remove password before conversion.');
      } else {
        setError(err.message || 'Failed to load PDF file. Please ensure it is a valid, uncorrupted PDF.');
      }
      setFile(null);
      setTotalPages(0);
      setPdfJsDoc(null);
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please upload a valid .pdf document.');
        return;
      }
      loadPdfFile(uploadedFile);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Instant Sample PDF synthesis in browser memory for 1-click trial
  const handleLoadSamplePdf = async () => {
    setIsProcessing(true);
    setProgressStatus('Creating a high-resolution sample PDF in browser memory...');
    setError(null);
    setStatusMessage(null);

    try {
      const doc = await PDFDocument.create();
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
      const regFont = await doc.embedFont(StandardFonts.Helvetica);

      const samplePages = [
        {
          title: 'ARCHITECTURAL MASTERPLAN & SCHEMATICS',
          subtitle: 'Multi-layered Vector Drafting & Grid Layout (Page 1)',
          color: [0.05, 0.58, 0.53] as [number, number, number],
          desc: 'High-precision computer-aided blueprint design sample with structural annotations.',
        },
        {
          title: 'FINANCIAL PERFORMANCE & METRICS',
          subtitle: 'Executive Summary & Quarterly Balance Sheet (Page 2)',
          color: [0.38, 0.35, 0.85] as [number, number, number],
          desc: 'Audit report and tabular metrics showing local rendering fidelity.',
        },
        {
          title: 'BRAND IDENTITY & ARTWORK CATALOG',
          subtitle: 'Full Color Spectrum Visual Palette (Page 3)',
          color: [0.93, 0.28, 0.45] as [number, number, number],
          desc: 'Graphic design portfolio proof page with crisp typography and geometric elements.',
        },
      ];

      for (let i = 0; i < samplePages.length; i++) {
        const item = samplePages[i];
        const page = doc.addPage([595.28, 841.89]); // Standard A4

        // Top Accent Banner
        page.drawRectangle({
          x: 35,
          y: 730,
          width: 525,
          height: 75,
          color: rgb(item.color[0], item.color[1], item.color[2]),
        });

        page.drawText(item.title, {
          x: 50,
          y: 770,
          size: 15,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        page.drawText(item.subtitle, {
          x: 50,
          y: 748,
          size: 10,
          font: regFont,
          color: rgb(0.9, 0.95, 1),
        });

        // Content Area Card
        page.drawRectangle({
          x: 35,
          y: 420,
          width: 525,
          height: 280,
          color: rgb(0.96, 0.97, 0.99),
          borderColor: rgb(0.85, 0.88, 0.92),
          borderWidth: 1,
        });

        page.drawText(`Document Page ${i + 1} of ${samplePages.length}`, {
          x: 55,
          y: 665,
          size: 13,
          font: boldFont,
          color: rgb(0.1, 0.15, 0.25),
        });

        page.drawText(item.desc, {
          x: 55,
          y: 640,
          size: 10,
          font: regFont,
          color: rgb(0.35, 0.4, 0.5),
        });

        // Interactive decorative grid / blueprint lines
        for (let gridX = 55; gridX <= 500; gridX += 45) {
          page.drawLine({
            start: { x: gridX, y: 440 },
            end: { x: gridX, y: 610 },
            color: rgb(0.88, 0.9, 0.94),
            thickness: 0.75,
          });
        }
        for (let gridY = 440; gridY <= 610; gridY += 34) {
          page.drawLine({
            start: { x: 55, y: gridY },
            end: { x: 500, y: gridY },
            color: rgb(0.88, 0.9, 0.94),
            thickness: 0.75,
          });
        }

        // Circular Seal graphic
        page.drawCircle({
          x: 460,
          y: 525,
          size: 35,
          color: rgb(item.color[0], item.color[1], item.color[2]),
          opacity: 0.15,
        });

        page.drawText('TOOLIQUE', {
          x: 435,
          y: 522,
          size: 9,
          font: boldFont,
          color: rgb(item.color[0], item.color[1], item.color[2]),
        });

        // Footer
        page.drawText('100% In-Browser Client-Side Rendering • No Cloud Uploads • Toolique.in', {
          x: 35,
          y: 35,
          size: 8,
          font: regFont,
          color: rgb(0.55, 0.6, 0.65),
        });
      }

      const pdfBytes = await doc.save();
      const sampleFile = new File([pdfBytes as any], 'Toolique-Sample-Document.pdf', {
        type: 'application/pdf',
      });
      await loadPdfFile(sampleFile);
    } catch (err: any) {
      console.error(err);
      setError('Could not generate sample PDF: ' + (err.message || 'Unknown error'));
      setIsProcessing(false);
    }
  };

  // Page selection togglers
  const togglePageSelection = (pageNumber: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p))
    );
    setSelectionMode('custom');
  };

  const handleSelectAll = (select: boolean) => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: select })));
    setSelectionMode(select ? 'all' : 'custom');
  };

  const handleInvertSelection = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: !p.selected })));
    setSelectionMode('custom');
  };

  const handleSelectOddEven = (type: 'odd' | 'even') => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        selected: type === 'odd' ? p.pageNumber % 2 !== 0 : p.pageNumber % 2 === 0,
      }))
    );
    setSelectionMode('custom');
  };

  // Cancel ongoing conversion
  const handleCancelConversion = () => {
    cancelConversionRef.current = true;
    setProgressStatus('Cancelling conversion...');
  };

  // Core Sequential Conversion Pipeline
  const runConversion = async () => {
    if (!pdfJsDoc || pages.length === 0) {
      setError('Please upload a PDF document before converting.');
      return;
    }

    const selectedPages = pages.filter((p) => p.selected);
    if (selectedPages.length === 0) {
      setError('Please select at least one page to convert.');
      return;
    }

    setIsProcessing(true);
    cancelConversionRef.current = false;
    setError(null);
    setStatusMessage(null);
    setProgressPercent(0);

    const ext = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat === 'image/png' ? 'png' : 'webp';
    const scale = effectiveScale;
    const currentList = [...pages];

    let completedCount = 0;

    for (let i = 0; i < currentList.length; i++) {
      if (cancelConversionRef.current) {
        setStatusMessage(`Conversion paused. Converted ${completedCount} pages before cancellation.`);
        break;
      }

      const item = currentList[i];
      if (!item.selected) continue;

      setProgressStatus(`Converting page ${item.pageNumber} of ${totalPages} (${effectiveDpi} DPI)...`);
      item.status = 'rendering';
      setPages([...currentList]);

      // Allow UI thread to breathe
      await new Promise((resolve) => setTimeout(resolve, 20));

      try {
        const page = await pdfJsDoc.getPage(item.pageNumber);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(viewport.width));
        canvas.height = Math.max(1, Math.round(viewport.height));
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('Could not create canvas 2D rendering context.');

        // Background handling
        if (outputFormat === 'image/jpeg' || !transparentBg) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Render PDF page to canvas
        await (page.render as any)({
          canvasContext: ctx,
          viewport,
          canvas,
        }).promise;

        // Post-processing color filter if enabled
        if (colorMode === 'grayscale') {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let k = 0; k < data.length; k += 4) {
            const gray = 0.299 * data[k] + 0.587 * data[k + 1] + 0.114 * data[k + 2];
            data[k] = gray;
            data[k + 1] = gray;
            data[k + 2] = gray;
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (colorMode === 'invert') {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let k = 0; k < data.length; k += 4) {
            data[k] = 255 - data[k];
            data[k + 1] = 255 - data[k + 1];
            data[k + 2] = 255 - data[k + 2];
          }
          ctx.putImageData(imgData, 0, 0);
        }

        // Export to Blob
        const qVal = outputFormat === 'image/png' ? undefined : quality / 100;
        const blob: Blob | null = await new Promise((res) => {
          canvas.toBlob((b) => res(b), outputFormat, qVal);
        });

        if (!blob) throw new Error('Failed to encode rendered canvas to image blob.');

        if (item.convertedUrl) {
          URL.revokeObjectURL(item.convertedUrl);
        }

        item.convertedBlob = blob;
        item.convertedUrl = URL.createObjectURL(blob);
        item.convertedWidth = canvas.width;
        item.convertedHeight = canvas.height;
        item.convertedSize = blob.size;
        item.status = 'done';
        item.error = undefined;

        // Clean canvas memory
        canvas.width = 0;
        canvas.height = 0;

        completedCount++;
        setProgressPercent(Math.round((completedCount / selectedPages.length) * 100));
      } catch (pageErr: any) {
        console.error(`Page ${item.pageNumber} error:`, pageErr);
        item.status = 'error';
        item.error = pageErr.message || 'Page conversion failed';
      }

      setPages([...currentList]);
    }

    setIsProcessing(false);
    setProgressStatus('');
    if (!cancelConversionRef.current) {
      setStatusMessage(
        `Successfully converted ${completedCount} page${completedCount > 1 ? 's' : ''} to ${ext.toUpperCase()} at ${effectiveDpi} DPI!`
      );
    }
  };

  // Download Single Page Image
  const handleDownloadSingle = (page: ConvertedPage) => {
    if (!page.convertedUrl || !page.convertedBlob) return;
    const prefix = customPrefix || (file ? file.name.replace(/\.pdf$/i, '') : 'document');
    const ext = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat === 'image/png' ? 'png' : 'webp';
    const filename = `${prefix}-page-${String(page.pageNumber).padStart(3, '0')}.${ext}`;

    const link = document.createElement('a');
    link.href = page.convertedUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download All Converted Pages as a ZIP Archive
  const handleDownloadAllZip = async () => {
    const donePages = pages.filter((p) => p.selected && p.status === 'done' && p.convertedBlob);
    if (donePages.length === 0) {
      setError('No converted images available to download. Please convert the pages first.');
      return;
    }

    setIsProcessing(true);
    setProgressStatus('Packing images into ZIP archive...');
    setError(null);

    try {
      const zip = new JSZip();
      const prefix = customPrefix || (file ? file.name.replace(/\.pdf$/i, '') : 'document');
      const ext = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat === 'image/png' ? 'png' : 'webp';

      // Sort by page number to preserve strict page order
      const sorted = [...donePages].sort((a, b) => a.pageNumber - b.pageNumber);
      sorted.forEach((p) => {
        const name = `${prefix}-page-${String(p.pageNumber).padStart(3, '0')}.${ext}`;
        zip.file(name, p.convertedBlob!);
      });

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `${prefix}-images-${effectiveDpi}dpi.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(zipUrl);

      setStatusMessage(`ZIP archive downloaded with ${donePages.length} images.`);
    } catch (zipErr: any) {
      console.error(zipErr);
      setError('Failed to create ZIP archive: ' + (zipErr.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async (page: ConvertedPage) => {
    if (!page.convertedBlob) return;
    try {
      if (navigator.clipboard && (window as any).ClipboardItem) {
        // Clipboard API strictly supports image/png on most browsers
        let blobToCopy = page.convertedBlob;
        if (page.convertedBlob.type !== 'image/png') {
          // Convert to PNG on canvas for clipboard compatibility
          const img = new Image();
          img.src = page.convertedUrl!;
          await new Promise((res) => {
            img.onload = () => res(null);
          });
          const c = document.createElement('canvas');
          c.width = img.width;
          c.height = img.height;
          const ctx = c.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          blobToCopy = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'));
        }
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({
            'image/png': blobToCopy,
          }),
        ]);
        setCopiedPageNum(page.pageNumber);
        setTimeout(() => setCopiedPageNum(null), 2500);
      } else {
        setError('Clipboard copy not supported in this browser.');
      }
    } catch (err: any) {
      console.warn('Clipboard write failed:', err);
      setError('Could not copy image directly to clipboard.');
    }
  };

  // Reset entire workspace
  const handleReset = () => {
    cleanupUrls(pages);
    setFile(null);
    setPages([]);
    setTotalPages(0);
    setPdfJsDoc(null);
    setError(null);
    setStatusMessage(null);
    setProgressPercent(0);
    arrayBufferRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Summary Metrics
  const selectedPagesCount = pages.filter((p) => p.selected).length;
  const convertedPagesCount = pages.filter((p) => p.selected && p.status === 'done').length;
  const totalConvertedBytes = pages
    .filter((p) => p.selected && p.status === 'done')
    .reduce((acc, p) => acc + (p.convertedSize || 0), 0);

  // High Memory Warning Check
  const showMemoryWarning = totalPages >= 15 && effectiveDpi >= 300;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-left">
      {/* Privacy Command Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 dark:bg-teal-950/40 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0" />
            <span>100% In-Browser Privacy</span>
          </div>

          {file ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 text-xs font-medium max-w-sm">
              <FileText className="w-3.5 h-3.5 shrink-0 text-teal-500" />
              <span className="truncate font-semibold">{file.name}</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 font-mono">
                ({totalPages} pages • {formatSize(file.size)})
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Your files are processed locally in your browser and never uploaded to any server.
            </span>
          )}
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* System Error & Status Banners */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 text-rose-400 hover:text-rose-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 text-teal-800 dark:text-teal-300 text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 text-teal-400 hover:text-teal-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Memory Alert Warning for Huge PDFs */}
      {showMemoryWarning && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Memory Tip:</strong> Converting {totalPages} pages at {effectiveDpi} DPI renders high-res raster frames. If your device has limited memory, 150 or 300 DPI is recommended for optimal speed.
          </span>
        </div>
      )}

      {/* MAIN WORKSPACE: Upload Dropzone (When Empty) or Config + Previews (When Loaded) */}
      {!file ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-center">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) {
                if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
                  setError('Please drop a valid .pdf file.');
                  return;
                }
                loadPdfFile(f);
              }
            }}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 rounded-3xl p-8 sm:p-12 transition group cursor-pointer bg-slate-50/50 dark:bg-slate-950/20 hover:bg-teal-500/5 dark:hover:bg-teal-500/5"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-500/10 dark:bg-teal-950/50 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform shadow-md shadow-teal-500/10">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
              Select or Drop PDF Document
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              Convert every page or custom ranges into crystal-clear PNG, JPG, or WebP images with customizable DPI resolution.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <FileImage className="w-4 h-4" />
                <span>Choose PDF File</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSamplePdf();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 transition flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Try with Sample PDF</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,application/pdf"
              className="hidden"
            />
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {[
              { title: 'Multiple Formats', desc: 'Export as lossless PNG, JPG, or modern WebP images.' },
              { title: '72 to 600 DPI', desc: 'Choose standard web scales or crisp print resolution.' },
              { title: 'Range & Selection', desc: 'Extract full documents, single sheets, or custom page ranges.' },
              { title: '1-Click ZIP Export', desc: 'Download entire document image collections in 1 clean archive.' },
            ].map((f, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{f.title}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* LOADED WORKSPACE (Left Config Panel + Right Preview & Progress Area) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Configuration Panel */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-teal-500" />
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                    Conversion Settings
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  {outputFormat.replace('image/', '').toUpperCase()} • {effectiveDpi} DPI
                </span>
              </div>

              {/* Output Format Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Output Image Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'image/png' as ImageOutputFormat, label: 'PNG', desc: 'Lossless / Alpha' },
                    { id: 'image/jpeg' as ImageOutputFormat, label: 'JPG', desc: 'Small File / Photos' },
                    { id: 'image/webp' as ImageOutputFormat, label: 'WebP', desc: 'Modern Web' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setOutputFormat(fmt.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        outputFormat === fmt.id
                          ? 'bg-teal-500/10 dark:bg-teal-950/40 border-teal-500 text-teal-700 dark:text-teal-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{fmt.label}</div>
                      <div className="text-[10px] text-slate-400">{fmt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution / DPI Preset Grid */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block flex items-center justify-between">
                  <span>Resolution / Quality (DPI)</span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                    {effectiveScale.toFixed(2)}× Scale
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DPI_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDpiPreset(p.id)}
                      className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                        dpiPreset === p.id
                          ? 'bg-teal-500/10 dark:bg-teal-950/40 border-teal-500 text-teal-700 dark:text-teal-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{p.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{p.badge}</div>
                    </button>
                  ))}
                </div>

                {/* Custom DPI Slider */}
                {dpiPreset === 'custom' && (
                  <div className="pt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Custom DPI:</span>
                      <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                        {customDpi} DPI ({(customDpi / 72).toFixed(2)}×)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={600}
                      step={25}
                      value={customDpi}
                      onChange={(e) => setCustomDpi(parseInt(e.target.value, 10))}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Quality Slider for JPG / WebP */}
              {outputFormat !== 'image/png' && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Compression Quality:
                    </span>
                    <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Smaller File (10%)</span>
                    <span>Standard (90%)</span>
                    <span>Max Quality (100%)</span>
                  </div>
                </div>
              )}

              {/* Transparency & Color Post-Processing */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {outputFormat !== 'image/jpeg' && (
                    <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={transparentBg}
                        onChange={(e) => setTransparentBg(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span>Transparent Background</span>
                    </label>
                  )}

                  <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                    <span className="text-slate-500 font-medium text-[11px]">Color Mode:</span>
                    <select
                      value={colorMode}
                      onChange={(e) => setColorMode(e.target.value as ColorFilterMode)}
                      className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    >
                      <option value="original">Full Color</option>
                      <option value="grayscale">Grayscale (B&W)</option>
                      <option value="invert">Invert (Negative)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Page Selection Controls */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block flex items-center justify-between">
                  <span>Page Range Filter</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {selectedPagesCount} of {totalPages} pages selected
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAll(true)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      selectionMode === 'all'
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    All ({totalPages})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectionMode('range')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      selectionMode === 'range'
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Custom Range
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInvertSelection()}
                    className="py-1.5 px-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Invert
                  </button>
                </div>

                {selectionMode === 'range' && (
                  <div className="pt-1 animate-fadeIn">
                    <input
                      type="text"
                      placeholder={`e.g. 1-3, 5 (Max: ${totalPages})`}
                      value={rangeInput}
                      onChange={(e) => setRangeInput(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-teal-500 outline-hidden font-mono"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Enter page numbers or intervals separated by commas (e.g., 1-4, 7, 9)
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectOddEven('odd')}
                      className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                    >
                      Odd Pages
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleSelectOddEven('even')}
                      className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                    >
                      Even Pages
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Custom Filename Prefix */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Custom File Name Prefix
                </label>
                <input
                  type="text"
                  placeholder="e.g. Invoice-2026"
                  value={customPrefix}
                  onChange={(e) => setCustomPrefix(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-teal-500 outline-hidden"
                />
              </div>

              {/* Main Action Buttons */}
              <div className="pt-2 space-y-2.5">
                {isProcessing ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleCancelConversion}
                      className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Cancel Conversion</span>
                    </button>
                    <div className="text-center text-[11px] text-slate-500 font-medium">
                      {progressStatus}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={runConversion}
                    disabled={selectedPagesCount === 0}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:opacity-90 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>
                      Convert {selectedPagesCount} Selected Page{selectedPagesCount > 1 ? 's' : ''} to{' '}
                      {outputFormat.replace('image/', '').toUpperCase()}
                    </span>
                  </button>
                )}

                {convertedPagesCount > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Archive className="w-4 h-4 text-teal-400" />
                    <span>
                      Download All ({convertedPagesCount}) as ZIP ({formatSize(totalConvertedBytes)})
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Preview Grid & Results Area */}
          <div className="lg:col-span-7 space-y-5">
            {/* Top Workspace Summary Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-500" />
                <span className="font-bold text-slate-800 dark:text-white">
                  Document Preview ({totalPages} Pages)
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
                <span>
                  Converted: <strong className="text-teal-600 dark:text-teal-400">{convertedPagesCount}</strong> / {selectedPagesCount}
                </span>
                {totalConvertedBytes > 0 && (
                  <span>
                    Output Size: <strong className="text-slate-800 dark:text-slate-200">{formatSize(totalConvertedBytes)}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Live Progress Bar if Converting */}
            {isProcessing && (
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-bold text-teal-700 dark:text-teal-300">
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-500" />
                    {progressStatus}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-indigo-600 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Page Thumbnails & Converted Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[640px] overflow-y-auto p-1">
              {pages.map((p) => {
                const isConverted = p.status === 'done' && p.convertedUrl;
                const isRendering = p.status === 'rendering';
                const hasError = p.status === 'error';

                return (
                  <div
                    key={p.pageNumber}
                    className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-white dark:bg-slate-900 ${
                      p.selected
                        ? 'border-teal-500/80 shadow-md ring-1 ring-teal-500/30'
                        : 'border-slate-200/80 dark:border-slate-800/80 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Header bar of page card */}
                    <div className="p-2.5 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => togglePageSelection(p.pageNumber)}
                        className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        {p.selected ? (
                          <CheckSquare className="w-4 h-4 text-teal-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                        <span>Page {p.pageNumber}</span>
                      </button>

                      {isConverted ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-teal-500 text-white uppercase">
                          Done
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {p.widthPt}×{p.heightPt} pt
                        </span>
                      )}
                    </div>

                    {/* Image Preview Area */}
                    <div className="relative aspect-3/4 bg-slate-100 dark:bg-slate-950/60 flex items-center justify-center p-2 overflow-hidden">
                      {isConverted ? (
                        <img
                          src={p.convertedUrl!}
                          alt={`Page ${p.pageNumber}`}
                          className="max-h-full max-w-full object-contain rounded shadow-xs"
                        />
                      ) : p.thumbnailUrl ? (
                        <img
                          src={p.thumbnailUrl}
                          alt={`Page ${p.pageNumber} preview`}
                          className="max-h-full max-w-full object-contain opacity-80"
                        />
                      ) : (
                        <div className="text-center p-4 text-slate-400 text-xs">
                          <Loader2 className="w-5 h-5 mx-auto mb-1 animate-spin text-teal-500" />
                          <span>Loading preview...</span>
                        </div>
                      )}

                      {/* Rendering Overlay */}
                      {isRendering && (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2 text-center animate-fadeIn">
                          <RefreshCw className="w-6 h-6 text-teal-400 animate-spin mb-1.5" />
                          <span className="text-[11px] font-bold">Rendering {effectiveDpi} DPI...</span>
                        </div>
                      )}

                      {/* Error Overlay */}
                      {hasError && (
                        <div className="absolute inset-0 bg-rose-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2 text-center">
                          <AlertCircle className="w-6 h-6 text-rose-400 mb-1" />
                          <span className="text-[10px] font-bold text-rose-200">{p.error}</span>
                        </div>
                      )}

                      {/* Quick Inspect Hover Overlay */}
                      {isConverted && (
                        <button
                          type="button"
                          onClick={() => setInspectPage(p)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-teal-300" />
                          <span>View Fullscreen</span>
                        </button>
                      )}
                    </div>

                    {/* Bottom Metadata & Download Footer */}
                    <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <div className="overflow-hidden">
                        {isConverted ? (
                          <div className="text-[10px] text-slate-500 font-mono">
                            {p.convertedWidth}×{p.convertedHeight} • {formatSize(p.convertedSize)}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Ready to convert</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isConverted && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleCopyImage(p)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                              title="Copy to Clipboard"
                            >
                              {copiedPageNum === p.pageNumber ? (
                                <Check className="w-3.5 h-3.5 text-teal-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadSingle(p)}
                              className="p-1.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition shadow-xs"
                              title="Download Page Image"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN PREVIEW MODAL */}
      {inspectPage && inspectPage.convertedUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setInspectPage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <FileImage className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-sm">
                  Page {inspectPage.pageNumber} Preview ({inspectPage.convertedWidth}×{inspectPage.convertedHeight} px • {formatSize(inspectPage.convertedSize)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(inspectPage)}
                  className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectPage(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Canvas Viewport */}
            <div className="flex-grow p-4 overflow-auto flex items-center justify-center bg-slate-950">
              <img
                src={inspectPage.convertedUrl}
                alt={`Page ${inspectPage.pageNumber}`}
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
