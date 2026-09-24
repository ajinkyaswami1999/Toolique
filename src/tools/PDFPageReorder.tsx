/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import {
  ArrowUpDown,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Check,
  Info,
  Layers,
  FileCheck,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Undo2,
  RefreshCw,
  Shuffle
} from 'lucide-react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface ReorderPageItem {
  id: string;
  originalPageNumber: number; // 1-indexed in source
  originalPageIndex: number;  // 0-indexed in source
  rotation: number;           // 0, 90, 180, 270
  thumbnailUrl?: string;
  dimensions?: { width: number; height: number };
}

export default function PDFPageReorder() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<ReorderPageItem[]>([]);
  const [customSequenceInput, setCustomSequenceInput] = useState<string>('');

  // Processing & progress
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Results & preview
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Drag and drop state
  const draggedIndexRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load and parse PDF into page items
  const loadPdf = async (uploadedFile: File) => {
    setIsProcessing(true);
    setProgressStatus(`Loading "${uploadedFile.name}" into memory...`);
    setError(null);
    setOutputBlob(null);
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();

      if (count === 0) {
        throw new Error('This PDF document contains 0 pages.');
      }

      setFile(uploadedFile);

      const initialPages: ReorderPageItem[] = [];
      for (let i = 0; i < count; i++) {
        const p = pdfDoc.getPage(i);
        const { width, height } = p.getSize();
        initialPages.push({
          id: `page_${i + 1}_${Math.random().toString(36).substring(2, 7)}`,
          originalPageNumber: i + 1,
          originalPageIndex: i,
          rotation: 0,
          dimensions: { width: Math.round(width), height: Math.round(height) },
        });
      }
      setPages(initialPages);

      // Async render canvas thumbnails via pdfjs
      setProgressStatus('Rendering page previews...');
      try {
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer.slice(0) });
        const pdfJsDoc = await loadingTask.promise;

        const updatedPages = [...initialPages];
        for (let i = 1; i <= count; i++) {
          try {
            const page = await pdfJsDoc.getPage(i);
            const viewport = page.getViewport({ scale: 0.25 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              await (page.render as any)({
                canvasContext: ctx,
                viewport,
                canvas,
              }).promise;
              updatedPages[i - 1].thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
            }
          } catch (e) {
            console.warn(`Page ${i} thumbnail skipped:`, e);
          }
        }
        setPages(updatedPages);
      } catch (thumbErr) {
        console.warn('PDF.js thumbnail rendering skipped:', thumbErr);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to parse PDF document.');
      setFile(null);
      setPages([]);
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.endsWith('.pdf')) {
        setError('Please upload a valid .pdf file.');
        return;
      }
      loadPdf(uploadedFile);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Instant 6-page Sample Scrambled PDF Generator
  const handleLoadSamplePdf = async () => {
    setIsProcessing(true);
    setProgressStatus('Generating sample presentation with scrambled slides in memory...');
    setError(null);

    try {
      const doc = await PDFDocument.create();
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
      const regFont = await doc.embedFont(StandardFonts.Helvetica);

      // Scrambled slides sequence
      const sampleSlides = [
        { title: 'SLIDE #3: REGIONAL PERFORMANCE METRICS', tag: 'Out of order (Should be #3)', color: [0.55, 0.22, 0.85] as [number, number, number] },
        { title: 'SLIDE #1: TITLE & EXECUTIVE OVERVIEW', tag: 'Out of order (Should be #1)', color: [0.2, 0.38, 0.9] as [number, number, number] },
        { title: 'SLIDE #5: FINANCIAL AUDIT SCHEDULE', tag: 'Out of order (Should be #5)', color: [0.08, 0.65, 0.45] as [number, number, number] },
        { title: 'SLIDE #2: STRATEGIC ROADMAP & TARGETS', tag: 'Out of order (Should be #2)', color: [0.2, 0.38, 0.9] as [number, number, number] },
        { title: 'SLIDE #6: APPENDIX & STAKEHOLDER SIGN-OFF', tag: 'Out of order (Should be #6)', color: [0.85, 0.45, 0.1] as [number, number, number] },
        { title: 'SLIDE #4: CLOUD SECURITY SPECIFICATIONS', tag: 'Out of order (Should be #4)', color: [0.55, 0.22, 0.85] as [number, number, number] },
      ];

      for (let i = 0; i < sampleSlides.length; i++) {
        const item = sampleSlides[i];
        const page = doc.addPage([595.28, 841.89]); // A4

        page.drawRectangle({
          x: 35,
          y: 760,
          width: 525.28,
          height: 48,
          color: rgb(item.color[0], item.color[1], item.color[2]),
        });

        page.drawText(item.title, {
          x: 50,
          y: 778,
          size: 13,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        page.drawRectangle({
          x: 480,
          y: 770,
          width: 65,
          height: 26,
          color: rgb(1, 1, 1),
        });
        page.drawText(`PAGE ${i + 1} / 6`, {
          x: 490,
          y: 778,
          size: 9,
          font: boldFont,
          color: rgb(item.color[0], item.color[1], item.color[2]),
        });

        page.drawText(item.tag, {
          x: 50,
          y: 720,
          size: 11,
          font: boldFont,
          color: rgb(0.2, 0.25, 0.3),
        });

        page.drawRectangle({
          x: 45,
          y: 350,
          width: 505.28,
          height: 340,
          borderColor: rgb(0.85, 0.88, 0.92),
          borderWidth: 1,
          color: rgb(0.98, 0.98, 1),
        });

        page.drawText('Use drag & drop or sequence presets to restore the correct slide sequence.', {
          x: 65,
          y: 650,
          size: 10,
          font: regFont,
          color: rgb(0.25, 0.25, 0.3),
        });

        page.drawLine({
          start: { x: 45, y: 50 },
          end: { x: 550, y: 50 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
        page.drawText('Toolique PDF Page Organizer • Sample Scrambled Deck', {
          x: 45,
          y: 35,
          size: 8,
          font: regFont,
          color: rgb(0.5, 0.5, 0.55),
        });
      }

      const pdfBytes = await doc.save();
      const sampleFile = new File([pdfBytes as any], 'Scrambled_Corporate_Slides.pdf', { type: 'application/pdf' });
      await loadPdf(sampleFile);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate sample PDF.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    draggedIndexRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndexRef.current === null || draggedIndexRef.current === index) return;

    const newPages = [...pages];
    const draggedItem = newPages.splice(draggedIndexRef.current, 1)[0];
    newPages.splice(index, 0, draggedItem);

    draggedIndexRef.current = index;
    setPages(newPages);
    setOutputBlob(null);
  };

  const handleDragEnd = () => {
    draggedIndexRef.current = null;
  };

  // Step Movements
  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    const newPages = [...pages];
    const [item] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, item);
    setPages(newPages);
    setOutputBlob(null);
  };

  const movePageFirst = (index: number) => {
    movePage(index, 0);
  };

  const movePageLast = (index: number) => {
    movePage(index, pages.length - 1);
  };

  const removePageFromDeck = (index: number) => {
    if (pages.length <= 1) {
      setError('A PDF must retain at least 1 page.');
      setTimeout(() => setError(null), 3500);
      return;
    }
    const newPages = [...pages];
    newPages.splice(index, 1);
    setPages(newPages);
    setOutputBlob(null);
  };

  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
    setOutputBlob(null);
  };

  // Presets
  const reverseOrder = () => {
    setPages((prev) => [...prev].reverse());
    setOutputBlob(null);
  };

  const interleaveDuplex = () => {
    if (pages.length < 2) return;
    const half = Math.ceil(pages.length / 2);
    const frontHalf = pages.slice(0, half);
    const backHalf = pages.slice(half);

    const interleaved: ReorderPageItem[] = [];
    const maxLen = Math.max(frontHalf.length, backHalf.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < frontHalf.length) interleaved.push(frontHalf[i]);
      if (i < backHalf.length) interleaved.push(backHalf[i]);
    }

    setPages(interleaved);
    setOutputBlob(null);
  };

  const resetOriginalOrder = () => {
    const copy = [...pages];
    copy.sort((a, b) => a.originalPageNumber - b.originalPageNumber);
    setPages(copy);
    setOutputBlob(null);
  };

  const handleApplyCustomSequence = () => {
    if (!customSequenceInput.trim()) return;
    const tokens = customSequenceInput.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    if (tokens.length === 0) return;

    const pageMap = new Map<number, ReorderPageItem>();
    pages.forEach((p) => pageMap.set(p.originalPageNumber, p));

    const reordered: ReorderPageItem[] = [];
    const used = new Set<number>();

    tokens.forEach((num) => {
      const item = pageMap.get(num);
      if (item && !used.has(num)) {
        reordered.push(item);
        used.add(num);
      }
    });

    // Append any unmentioned pages
    pages.forEach((p) => {
      if (!used.has(p.originalPageNumber)) {
        reordered.push(p);
      }
    });

    setPages(reordered);
    setOutputBlob(null);
  };

  // Main Assembly Execution
  const handleSaveReorderedPdf = async () => {
    if (!file || pages.length === 0) return;
    setIsProcessing(true);
    setProgressStatus('Rebuilding PDF page tree with new sequence...');
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      const pageIndices = pages.map((p) => p.originalPageIndex);
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);

      copiedPages.forEach((p, idx) => {
        const rot = pages[idx].rotation;
        if (rot !== 0) {
          const cur = p.getRotation().angle;
          p.setRotation(degrees((cur + rot) % 360));
        }
        newDoc.addPage(p);
      });

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setShowPreview(true);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while saving the reordered PDF.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleDownload = () => {
    if (!outputBlob || !file) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(outputBlob);
    link.download = `${file.name.replace(/\.pdf$/i, '')}_reordered.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = () => {
    if (!file) return '';
    let text = `========================================================\n`;
    text += `TOOLIQUE CLIENT-SIDE PDF PAGE REORDER SCHEDULE\n`;
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `Source File: ${file.name}\n`;
    text += `========================================================\n\n`;

    text += `NEW PAGE SEQUENCE:\n`;
    pages.forEach((p, idx) => {
      text += `• Position #${idx + 1} ➔ Source Page ${p.originalPageNumber} (${p.rotation !== 0 ? `Rotated ${p.rotation}°` : '0°'})\n`;
    });

    text += `\n100% In-Browser Execution • Privacy Guaranteed\n`;
    return text;
  };

  const handleCopyReport = () => {
    const report = generateReport();
    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Action & Reordering Presets Bar */}
      <div className="saas-card p-4 flex flex-wrap items-center justify-between gap-4 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
        {/* Presets */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl overflow-x-auto">
          <button
            onClick={reverseOrder}
            disabled={!file}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-zinc-900 transition cursor-pointer disabled:opacity-40 whitespace-nowrap"
            title="Reverse entire document sequence"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Reverse Order</span>
          </button>

          <button
            onClick={interleaveDuplex}
            disabled={!file || pages.length < 2}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-zinc-900 transition cursor-pointer disabled:opacity-40 whitespace-nowrap"
            title="Interleave front half and back half for duplex scanning reassembly"
          >
            <Shuffle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Duplex Interleave</span>
          </button>

          <button
            onClick={resetOriginalOrder}
            disabled={!file}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 transition cursor-pointer disabled:opacity-40 whitespace-nowrap"
            title="Reset to original uploaded sequence"
          >
            <Undo2 className="w-3.5 h-3.5 text-zinc-500" />
            <span>Reset Order</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLoadSamplePdf}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            title="Load a 6-page scrambled presentation to test drag & drop reordering"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Try Sample PDF</span>
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
                setPages([]);
                setOutputBlob(null);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }}
              className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition cursor-pointer"
              title="Remove document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress or Error Banner */}
      {isProcessing && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div className="text-xs font-medium text-indigo-900 dark:text-indigo-200">
            <p className="font-bold">{progressStatus || 'Rebuilding document...'}</p>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300">All processing is performed locally in browser memory.</p>
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
        {/* Left Column (8 cols): Drag & Drop Visual Deck */}
        <div className="lg:col-span-8 space-y-6">
          {!file ? (
            /* Upload Empty State */
            <div className="saas-card p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 hover:border-indigo-500/50 transition">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                <ArrowUpDown className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Upload a PDF to Rearrange Page Sequence</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                  Drag and drop page thumbnail cards into your desired sequence, reverse flipped scans, or interleave duplex sheets.
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
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-750 transition cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Try Scrambled PDF</span>
                </button>
              </div>
              <div className="pt-4 flex items-center justify-center gap-4 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% In-Browser Privacy
                </span>
                <span>•</span>
                <span>Fluid HTML5 Drag & Drop</span>
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
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {pages.length} Pages Total
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold">
                    Sequence: #{1} to #{pages.length}
                  </span>
                </div>
              </div>

              {/* Custom Sequence Syntax Bar */}
              <div className="saas-card p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    Custom Order:
                  </span>
                  <input
                    type="text"
                    value={customSequenceInput}
                    onChange={(e) => setCustomSequenceInput(e.target.value)}
                    placeholder="e.g. 1, 3, 2, 5, 4, 6"
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono w-full max-w-xs focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleApplyCustomSequence}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold cursor-pointer transition shadow-sm"
                  >
                    Apply
                  </button>
                </div>

                <span className="text-[11px] text-zinc-400">
                  Tip: Drag cards or use step arrows to adjust positions
                </span>
              </div>

              {/* Drag & Drop Visual Deck */}
              <div className="saas-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    Page Sequence Deck (Drag & Drop to rearrange):
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {pages.length} Pages Loaded
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[520px] overflow-y-auto pr-1">
                  {pages.map((p, idx) => (
                    <div
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-indigo-500/60 transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between space-y-2 select-none group shadow-sm hover:shadow-md"
                    >
                      {/* Top Header: New Sequence Badge vs Original */}
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-mono font-black text-[10px] flex items-center justify-center shadow-sm">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400">
                            (Orig: #{p.originalPageNumber})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            rotatePage(idx);
                          }}
                          className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-indigo-600 cursor-pointer"
                          title="Rotate this page +90°"
                        >
                          <RotateCw className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Thumbnail Container */}
                      <div className="w-full aspect-[3/4] rounded-xl bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 flex items-center justify-center overflow-hidden relative shadow-inner">
                        {p.thumbnailUrl ? (
                          <img
                            src={p.thumbnailUrl}
                            alt={`Page ${p.originalPageNumber}`}
                            className="w-full h-full object-contain"
                            style={{ transform: `rotate(${p.rotation}deg)` }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-3 text-center space-y-1">
                            <Layers className="w-8 h-8 text-zinc-400 opacity-60" />
                            <span className="text-[10px] font-bold text-zinc-500">Page {p.originalPageNumber}</span>
                          </div>
                        )}

                        {p.rotation !== 0 && (
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-amber-500 text-white font-mono text-[8px] font-bold">
                            {p.rotation}°
                          </div>
                        )}
                      </div>

                      {/* Step Controller Bar */}
                      <div className="flex items-center justify-between pt-1 border-t border-zinc-150 dark:border-zinc-800 text-zinc-500">
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => movePageFirst(idx)}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-20 cursor-pointer"
                            title="Move to first position"
                          >
                            <ChevronsLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePage(idx, idx - 1)}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-20 cursor-pointer"
                            title="Move left"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removePageFromDeck(idx)}
                          className="p-1 rounded hover:bg-red-500/10 text-zinc-400 hover:text-red-500 cursor-pointer"
                          title="Exclude this page"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => movePage(idx, idx + 1)}
                            disabled={idx === pages.length - 1}
                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-20 cursor-pointer"
                            title="Move right"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePageLast(idx)}
                            disabled={idx === pages.length - 1}
                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-20 cursor-pointer"
                            title="Move to last position"
                          >
                            <ChevronsRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Embedded PDF Preview Modal / Box */}
              {showPreview && previewUrl && (
                <div className="saas-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Reordered PDF Preview</h3>
                      <p className="text-xs text-zinc-400">Live preview of your reorganized document.</p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  <div className="w-full h-[550px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950">
                    <iframe
                      src={`${previewUrl}#toolbar=1`}
                      title="Reordered PDF Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Actions, Summary & Manifest */}
        <div className="lg:col-span-4 space-y-6">
          <div className="saas-card p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Sequence Summary</span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1 font-mono">
                {pages.length} <span className="text-sm font-normal text-zinc-500">Pages Organized</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleSaveReorderedPdf}
              disabled={!file || pages.length === 0 || isProcessing}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Reordering PDF...</span>
                </>
              ) : (
                <>
                  <ArrowUpDown className="w-4 h-4" />
                  <span>Save Reordered PDF</span>
                </>
              )}
            </button>

            {/* Success Download Card */}
            {outputBlob && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>PDF Reordered Successfully!</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  Output Size: {(outputBlob.size / (1024 * 1024)).toFixed(2)} MB • {pages.length} Pages
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Reordered PDF</span>
                </button>
              </div>
            )}

            {/* Document Sequence Checklist */}
            <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500">Total Page Count:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{pages.length} Pages</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500">First Output Page:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {pages.length > 0 ? `Orig #${pages[0].originalPageNumber}` : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Last Output Page:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {pages.length > 0 ? `Orig #${pages[pages.length - 1].originalPageNumber}` : '—'}
                </span>
              </div>
            </div>

            {/* Copy Audit Report */}
            {file && (
              <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4">
                <button
                  onClick={handleCopyReport}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedReport ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied Schedule!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Copy Sequence Schedule</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Privacy & Air-Gap Shield */}
          <div className="saas-card p-5 space-y-3 bg-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>100% In-Browser Privacy Shield</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Your confidential documents are never uploaded to remote servers. All vector page extractions, rotations,
              and sequence restructuring execute exclusively in local WebAssembly memory.
            </p>
          </div>

          {/* Pro-Tips */}
          <div className="saas-card p-5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
              <Info className="w-4 h-4 text-indigo-500" />
              <span>Reordering Pro-Tips</span>
            </div>
            <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5 list-disc pl-4">
              <li>
                <strong>Reverse Order</strong>: 1-click inversion for documents scanned back-to-front.
              </li>
              <li>
                <strong>Duplex Interleave</strong>: Merges front sides with back sides for single-pass feed reconciliations.
              </li>
              <li>
                <strong>Step Controls</strong>: Use arrow step icons on any card to move it directly to first or last position.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
