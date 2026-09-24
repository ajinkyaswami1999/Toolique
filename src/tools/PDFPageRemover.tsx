/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import {
  FileMinus,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  RotateCw,
  ShieldCheck,
  Check,
  Info,
  Layers,
  FileCheck,
  Copy,
  Undo2,
  CheckSquare
} from 'lucide-react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface PageItem {
  pageNumber: number; // 1-indexed
  pageIndex: number;  // 0-indexed
  rotation: number;   // 0, 90, 180, 270
  markedForDeletion: boolean;
  thumbnailUrl?: string;
  dimensions?: { width: number; height: number };
}

export default function PDFPageRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [rangeInput, setRangeInput] = useState<string>('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load and parse PDF into visual page models
  const loadPdf = async (uploadedFile: File) => {
    setIsProcessing(true);
    setProgressStatus(`Loading "${uploadedFile.name}" into browser memory...`);
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
        throw new Error('This PDF contains 0 pages.');
      }

      setFile(uploadedFile);
      setTotalPages(count);

      // Create initial page models
      const initialPages: PageItem[] = [];
      for (let i = 0; i < count; i++) {
        const p = pdfDoc.getPage(i);
        const { width, height } = p.getSize();
        initialPages.push({
          pageNumber: i + 1,
          pageIndex: i,
          rotation: 0,
          markedForDeletion: false,
          dimensions: { width: Math.round(width), height: Math.round(height) },
        });
      }
      setPages(initialPages);

      // Async render canvas thumbnails via pdfjs
      setProgressStatus('Rendering page thumbnails...');
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
      setError(err.message || 'Failed to load PDF file. Please ensure it is unencrypted and valid.');
      setFile(null);
      setPages([]);
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
        setError('Please upload a valid .pdf file.');
        return;
      }
      loadPdf(uploadedFile);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Instant Sample 6-Page PDF Generation
  const handleLoadSamplePdf = async () => {
    setIsProcessing(true);
    setProgressStatus('Generating sample multi-page document in memory...');
    setError(null);

    try {
      const doc = await PDFDocument.create();
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
      const regFont = await doc.embedFont(StandardFonts.Helvetica);

      const pagesSpec = [
        { title: 'MASTER PROJECT BRIEF', tag: 'KEEP (Page 1 - Cover)', color: [0.2, 0.38, 0.9] as [number, number, number] },
        { title: 'EXECUTIVE OVERVIEW & SPECS', tag: 'KEEP (Page 2 - Specs)', color: [0.2, 0.38, 0.9] as [number, number, number] },
        { title: 'DUPLICATE ACCIDENTAL BLANK SHEET', tag: 'DELETE (Page 3 - Blank)', color: [0.75, 0.75, 0.8] as [number, number, number] },
        { title: 'FINANCIAL AUDIT BALANCE SHEET', tag: 'KEEP (Page 4 - Audit)', color: [0.08, 0.65, 0.45] as [number, number, number] },
        { title: 'OBSOLETE DRAFT APPENDIX D', tag: 'DELETE (Page 5 - Old Draft)', color: [0.85, 0.25, 0.35] as [number, number, number] },
        { title: 'FINAL ATTESTATION & SIGN-OFF', tag: 'KEEP (Page 6 - Signatures)', color: [0.55, 0.22, 0.85] as [number, number, number] },
      ];

      for (let i = 0; i < pagesSpec.length; i++) {
        const item = pagesSpec[i];
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

        page.drawText(`Document Status: ${item.tag}`, {
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

        page.drawText(`Sample content paragraph for sheet #${i + 1}.`, {
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
        page.drawText('Toolique Client-Side PDF Pruning Studio • Sample Document', {
          x: 45,
          y: 35,
          size: 8,
          font: regFont,
          color: rgb(0.5, 0.5, 0.55),
        });
      }

      const pdfBytes = await doc.save();
      const sampleFile = new File([pdfBytes as any], 'Project_Report_With_Unwanted_Pages.pdf', { type: 'application/pdf' });
      await loadPdf(sampleFile);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate sample PDF.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  // Selection & Marking Handlers
  const togglePageDeletion = (pageIndex: number) => {
    setPages((prev) => {
      const currentCount = prev.filter((p) => p.markedForDeletion).length;
      const willBeMarked = !prev[pageIndex].markedForDeletion;

      // Ensure at least 1 page remains
      if (willBeMarked && currentCount + 1 >= prev.length) {
        setError('A PDF document must retain at least 1 page. You cannot delete all pages.');
        setTimeout(() => setError(null), 3500);
        return prev;
      }

      return prev.map((p, idx) =>
        idx === pageIndex ? { ...p, markedForDeletion: willBeMarked } : p
      );
    });
    setOutputBlob(null);
  };

  const markFirstPage = () => {
    if (pages.length <= 1) return;
    setPages((prev) =>
      prev.map((p, idx) => (idx === 0 ? { ...p, markedForDeletion: true } : p))
    );
    setOutputBlob(null);
  };

  const markLastPage = () => {
    if (pages.length <= 1) return;
    setPages((prev) =>
      prev.map((p, idx) => (idx === prev.length - 1 ? { ...p, markedForDeletion: true } : p))
    );
    setOutputBlob(null);
  };

  const markOddPages = () => {
    setPages((prev) => {
      const updated = prev.map((p) => ({ ...p, markedForDeletion: p.pageNumber % 2 !== 0 }));
      if (updated.filter((p) => !p.markedForDeletion).length === 0) {
        return prev;
      }
      return updated;
    });
    setOutputBlob(null);
  };

  const markEvenPages = () => {
    setPages((prev) => {
      const updated = prev.map((p) => ({ ...p, markedForDeletion: p.pageNumber % 2 === 0 }));
      if (updated.filter((p) => !p.markedForDeletion).length === 0) {
        return prev;
      }
      return updated;
    });
    setOutputBlob(null);
  };

  const clearAllMarked = () => {
    setPages((prev) => prev.map((p) => ({ ...p, markedForDeletion: false })));
    setOutputBlob(null);
  };

  const invertDeletionSelection = () => {
    setPages((prev) => {
      const updated = prev.map((p) => ({ ...p, markedForDeletion: !p.markedForDeletion }));
      if (updated.filter((p) => !p.markedForDeletion).length === 0) {
        setError('Inverting would delete all pages. Please retain at least 1 page.');
        setTimeout(() => setError(null), 3500);
        return prev;
      }
      return updated;
    });
    setOutputBlob(null);
  };

  const rotatePage = (pageIndex: number) => {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === pageIndex ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
    setOutputBlob(null);
  };

  // Apply Range Input for Deletion (e.g., "2, 4-5")
  const handleApplyRangeDeletion = () => {
    if (!rangeInput.trim()) return;
    const parts = rangeInput.split(',');
    const pagesToMark = new Set<number>();

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
          for (let k = start; k <= end; k++) pagesToMark.add(k);
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num >= 1 && num <= totalPages) {
          pagesToMark.add(num);
        }
      }
    }

    if (pagesToMark.size >= totalPages) {
      setError('Cannot delete all pages. Please select fewer pages.');
      return;
    }

    setPages((prev) =>
      prev.map((p) => ({ ...p, markedForDeletion: pagesToMark.has(p.pageNumber) }))
    );
    setOutputBlob(null);
  };

  // Main Page Removal Execution
  const handleRemovePages = async () => {
    if (!file || pages.length === 0) return;
    const pagesToKeep = pages.filter((p) => !p.markedForDeletion);

    if (pagesToKeep.length === 0) {
      setError('A PDF document must contain at least 1 page.');
      return;
    }

    if (pagesToKeep.length === totalPages) {
      setError('No pages have been marked for removal. Click page thumbnails or select a preset to mark pages.');
      return;
    }

    setIsProcessing(true);
    setProgressStatus(`Extracting and rebuilding ${pagesToKeep.length} preserved pages...`);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      const keepIndices = pagesToKeep.map((p) => p.pageIndex);
      const copiedPages = await newDoc.copyPages(srcDoc, keepIndices);

      copiedPages.forEach((p, idx) => {
        const rot = pagesToKeep[idx].rotation;
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
      setError('An error occurred while removing pages. Please check the document.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleDownload = () => {
    if (!outputBlob || !file) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(outputBlob);
    link.download = `${file.name.replace(/\.pdf$/i, '')}_cleaned.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deletedCount = pages.filter((p) => p.markedForDeletion).length;
  const remainingCount = totalPages - deletedCount;

  const generateReport = () => {
    if (!file) return '';
    let text = `========================================================\n`;
    text += `TOOLIQUE CLIENT-SIDE PDF PAGE REMOVAL AUDIT\n`;
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `Source File: ${file.name} (${totalPages} Total Pages)\n`;
    text += `========================================================\n\n`;

    const deletedPages = pages.filter((p) => p.markedForDeletion).map((p) => p.pageNumber);
    const keptPages = pages.filter((p) => !p.markedForDeletion).map((p) => p.pageNumber);

    text += `DELETED PAGES (${deletedPages.length}):\n`;
    text += `• Page Numbers: ${deletedPages.length > 0 ? deletedPages.join(', ') : 'None'}\n\n`;

    text += `RETAINED PAGES (${keptPages.length}):\n`;
    text += `• Page Numbers: ${keptPages.join(', ')}\n\n`;

    text += `100% In-Browser Execution • Privacy Guaranteed\n`;
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
      {/* Top Action & Selection Bar */}
      <div className="saas-card p-4 flex flex-wrap items-center justify-between gap-4 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
        {/* Presets */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl overflow-x-auto">
          <button
            onClick={markFirstPage}
            disabled={!file}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-zinc-900 transition cursor-pointer disabled:opacity-40 whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Delete Cover (Page 1)</span>
          </button>

          <button
            onClick={markLastPage}
            disabled={!file}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-zinc-900 transition cursor-pointer disabled:opacity-40 whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Delete Last Page</span>
          </button>

          <button
            onClick={markOddPages}
            disabled={!file}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-zinc-900 transition cursor-pointer disabled:opacity-40 whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Delete Odd Pages</span>
          </button>

          <button
            onClick={markEvenPages}
            disabled={!file}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-zinc-900 transition cursor-pointer disabled:opacity-40 whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>Delete Even Pages</span>
          </button>

          <button
            onClick={invertDeletionSelection}
            disabled={!file || deletedCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-900 transition cursor-pointer disabled:opacity-40 whitespace-nowrap"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Invert</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLoadSamplePdf}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            title="Load sample document with unwanted pages to test removal"
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
                setTotalPages(0);
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
            <p className="font-bold">{progressStatus || 'Processing PDF...'}</p>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300">Executing client-side in browser memory.</p>
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
        {/* Left Column (8 cols): Interactive Page Deck & Range Input */}
        <div className="lg:col-span-8 space-y-6">
          {!file ? (
            /* Upload Empty State */
            <div className="saas-card p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 hover:border-indigo-500/50 transition">
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/60 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
                <FileMinus className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Upload a PDF to Remove Unwanted Pages</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                  Visually select and strike out blank sheets, duplicate forms, outdated appendices, or sensitive pages.
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
                  <span>Try Sample PDF</span>
                </button>
              </div>
              <div className="pt-4 flex items-center justify-center gap-4 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Client-Side Privacy
                </span>
                <span>•</span>
                <span>Instant Vector Slicing</span>
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
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • {totalPages} Total Pages
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-xs font-mono font-bold">
                    {deletedCount} Marked for Deletion
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
                    {remainingCount} Preserved
                  </span>
                </div>
              </div>

              {/* Range Input Filter */}
              <div className="saas-card p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    Mark by Range:
                  </span>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="e.g. 2, 4-5, 8"
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono w-full max-w-xs focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={handleApplyRangeDeletion}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-bold cursor-pointer transition shadow-sm"
                  >
                    Apply
                  </button>
                </div>

                {deletedCount > 0 && (
                  <button
                    onClick={clearAllMarked}
                    className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                  >
                    Clear All Marked
                  </button>
                )}
              </div>

              {/* Visual Page Deck Grid */}
              <div className="saas-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    Click any page to toggle deletion mark:
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Red overlay = Will be removed
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[520px] overflow-y-auto pr-1">
                  {pages.map((p, idx) => (
                    <div
                      key={p.pageNumber}
                      onClick={() => togglePageDeletion(idx)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between space-y-2 select-none ${
                        p.markedForDeletion
                          ? 'border-red-500 bg-red-50/60 dark:bg-red-950/40 shadow-sm ring-2 ring-red-500/20'
                          : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-indigo-400'
                      }`}
                    >
                      {/* Top Header Badge & Rotate */}
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {p.markedForDeletion ? (
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          ) : (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          )}
                          <span
                            className={`font-mono font-black ${
                              p.markedForDeletion ? 'text-red-600 dark:text-red-400 line-through' : 'text-zinc-900 dark:text-white'
                            }`}
                          >
                            Page {p.pageNumber}
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

                      {/* Thumbnail Card with Strikethrough Overlay if Marked */}
                      <div className="w-full aspect-[3/4] rounded-xl bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 flex items-center justify-center overflow-hidden relative shadow-inner">
                        {p.thumbnailUrl ? (
                          <img
                            src={p.thumbnailUrl}
                            alt={`Page ${p.pageNumber}`}
                            className={`w-full h-full object-contain transition-all ${
                              p.markedForDeletion ? 'opacity-30 grayscale' : ''
                            }`}
                            style={{ transform: `rotate(${p.rotation}deg)` }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-3 text-center space-y-1">
                            <Layers className="w-8 h-8 text-zinc-400 opacity-60" />
                            <span className="text-[10px] font-bold text-zinc-500">Page {p.pageNumber}</span>
                          </div>
                        )}

                        {/* Red Deletion Strikethrough Watermark */}
                        {p.markedForDeletion && (
                          <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-mono text-[10px] font-black shadow-lg flex items-center gap-1">
                              <Trash2 className="w-3 h-3" />
                              <span>DELETED</span>
                            </div>
                          </div>
                        )}

                        {p.rotation !== 0 && (
                          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-amber-500 text-white font-mono text-[8px] font-bold">
                            {p.rotation}°
                          </div>
                        )}
                      </div>

                      <div className="text-center text-[10px] font-semibold">
                        {p.markedForDeletion ? (
                          <span className="text-red-500 font-bold">Marked to Delete</span>
                        ) : (
                          <span className="text-zinc-400">Preserved in Output</span>
                        )}
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
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Cleaned PDF Preview</h3>
                      <p className="text-xs text-zinc-400">Live preview of your document with deleted pages removed.</p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Cleaned PDF</span>
                    </button>
                  </div>

                  <div className="w-full h-[550px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950">
                    <iframe
                      src={`${previewUrl}#toolbar=1`}
                      title="Cleaned PDF Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Actions, Summary & Audit */}
        <div className="lg:col-span-4 space-y-6">
          <div className="saas-card p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Pruning Summary</span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1 font-mono">
                {remainingCount} <span className="text-sm font-normal text-zinc-500">Pages Preserved</span>
              </div>
              <p className="text-[11px] text-red-500 font-bold mt-0.5">
                {deletedCount} of {totalPages} Pages marked for removal
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={handleRemovePages}
              disabled={!file || deletedCount === 0 || isProcessing}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Pruning PDF...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Selected Pages</span>
                </>
              )}
            </button>

            {/* Success Download Card */}
            {outputBlob && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Pages Removed Successfully!</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  Output Size: {(outputBlob.size / (1024 * 1024)).toFixed(2)} MB • {remainingCount} Pages
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Cleaned PDF</span>
                </button>
              </div>
            )}

            {/* Document Checklist Summary */}
            <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500">Original Total:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{totalPages} Pages</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500">Pages Removed:</span>
                <span className="font-bold text-red-500 font-mono">{deletedCount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Final Output:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{remainingCount} Pages</span>
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
                      <span>Copied Report!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Copy Removal Audit</span>
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
              and binary cloning execute exclusively in local WebAssembly memory.
            </p>
          </div>

          {/* Pro-Tips */}
          <div className="saas-card p-5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
              <Info className="w-4 h-4 text-indigo-500" />
              <span>Pruning Pro-Tips</span>
            </div>
            <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5 list-disc pl-4">
              <li>
                <strong>Click to Strike Out</strong>: Simply click on any page card to toggle its deletion state.
              </li>
              <li>
                <strong>Quick Presets</strong>: Use "Delete Cover" or "Delete Last Page" to strip redundant title sheets instantly.
              </li>
              <li>
                <strong>Page Integrity</strong>: All remaining text layers, search indexes, and vector graphics are cloned with 100% fidelity.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
