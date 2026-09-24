/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import {
  Scissors,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  FileCheck,
  RotateCw,
  Layers,
  ShieldCheck,
  Check,
  Info,
  Trash2,
  Grid,
  ListFilter,
  SplitSquareVertical,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Copy
} from 'lucide-react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface PageItem {
  pageNumber: number; // 1-indexed
  pageIndex: number;  // 0-indexed
  rotation: number;   // 0, 90, 180, 270
  selected: boolean;
  thumbnailUrl?: string;
  dimensions?: { width: number; height: number };
}

export type SplitMode = 'visual' | 'ranges' | 'fixed_chunks' | 'odd_even';
export type OutputMode = 'single_merged' | 'separate_zip';

export default function PDFSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<SplitMode>('visual');
  const [outputMode, setOutputMode] = useState<OutputMode>('single_merged');

  // Mode Specific States
  const [rangeInput, setRangeInput] = useState<string>('1-2, 5');
  const [chunkSize, setChunkSize] = useState<number>(2);
  const [oddEvenSelection, setOddEvenSelection] = useState<'odd' | 'even' | 'both'>('both');

  // Naming & Configuration
  const [customPrefix, setCustomPrefix] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [resultBlob, setResultBlob] = useState<{ blob: Blob; fileName: string; isZip: boolean } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedManifest, setCopiedManifest] = useState<boolean>(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'workspace' | 'settings' | 'preview'>('workspace');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load and parse PDF into page models
  const loadPdfFile = async (uploadedFile: File) => {
    setIsProcessing(true);
    setProgressStatus(`Loading "${uploadedFile.name}" into browser memory...`);
    setError(null);
    setResultBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();

      if (count === 0) {
        throw new Error('This PDF file contains 0 pages.');
      }

      setTotalPages(count);
      setFile(uploadedFile);
      setCustomPrefix(uploadedFile.name.replace(/\.pdf$/i, ''));

      // Create initial page items
      const initialPages: PageItem[] = [];
      for (let i = 0; i < count; i++) {
        const p = pdfDoc.getPage(i);
        const { width, height } = p.getSize();
        initialPages.push({
          pageNumber: i + 1,
          pageIndex: i,
          rotation: 0,
          selected: true,
          dimensions: { width: Math.round(width), height: Math.round(height) },
        });
      }
      setPages(initialPages);

      // Async render thumbnails with pdfjs
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
        setError('Please upload a valid .pdf document.');
        return;
      }
      loadPdfFile(uploadedFile);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Instant 6-page Sample PDF generation
  const handleLoadSamplePdf = async () => {
    setIsProcessing(true);
    setProgressStatus('Generating sample multi-chapter PDF in memory...');
    setError(null);

    try {
      const doc = await PDFDocument.create();
      const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await doc.embedFont(StandardFonts.Helvetica);

      const chapters = [
        {
          title: 'CHAPTER 1: EXECUTIVE SUMMARY',
          sub: 'Corporate Annual Strategy & Key Deliverables',
          color: [0.2, 0.38, 0.9] as [number, number, number],
          content: 'This section details the primary operational milestones achieved throughout Q1 and Q2. Revenue expanded by 42% YoY with zero system downtime across all regional infrastructure nodes.'
        },
        {
          title: 'CHAPTER 1: KEY PERFORMANCE INDICATORS',
          sub: 'Operational Metrics & User Growth Analysis',
          color: [0.2, 0.38, 0.9] as [number, number, number],
          content: 'Customer satisfaction indices reached 98.4%. Churn metrics dropped to 0.8% following the deployment of automated client-side processing workflows.'
        },
        {
          title: 'CHAPTER 2: TECHNICAL ARCHITECTURE',
          sub: 'System Topology & High Availability Design',
          color: [0.55, 0.22, 0.85] as [number, number, number],
          content: 'The core architecture utilizes decentralized in-memory WebAssembly execution pipelines to minimize data transmission latency and eliminate remote storage liabilities.'
        },
        {
          title: 'CHAPTER 2: CLOUD SECURITY SPECIFICATIONS',
          sub: 'Zero-Trust Protocol & Air-Gapped Verification',
          color: [0.55, 0.22, 0.85] as [number, number, number],
          content: 'Zero-knowledge encryption mechanisms ensure that all sensitive document tokens and payloads remain strictly confined within client hardware memory boundaries.'
        },
        {
          title: 'CHAPTER 3: FINANCIAL AUDIT SCHEDULE',
          sub: 'Comprehensive Capital Allocation & Capex',
          color: [0.08, 0.65, 0.45] as [number, number, number],
          content: 'Audited financial balance sheet confirming cash reserves of $18.4M with full solvency margin compliance under international financial reporting standards (IFRS).'
        },
        {
          title: 'CHAPTER 4: APPENDIX & REFERENCES',
          sub: 'Legal Governance & Regulatory Attestations',
          color: [0.85, 0.45, 0.1] as [number, number, number],
          content: 'Complete register of compliance certifications, including ISO/IEC 27001, SOC 2 Type II attestation, and GDPR/CCPA privacy adherence guarantees.'
        },
      ];

      chapters.forEach((ch, idx) => {
        const page = doc.addPage([595.28, 841.89]); // A4
        // Header Banner
        page.drawRectangle({
          x: 35,
          y: 760,
          width: 525.28,
          height: 48,
          color: rgb(ch.color[0], ch.color[1], ch.color[2]),
        });
        page.drawText(ch.title, {
          x: 50,
          y: 778,
          size: 14,
          font: boldFont,
          color: rgb(1, 1, 1),
        });

        // Page Number Indicator Badge
        page.drawRectangle({
          x: 480,
          y: 770,
          width: 65,
          height: 26,
          color: rgb(1, 1, 1),
        });
        page.drawText(`PAGE ${idx + 1} / 6`, {
          x: 490,
          y: 778,
          size: 9,
          font: boldFont,
          color: rgb(ch.color[0], ch.color[1], ch.color[2]),
        });

        page.drawText(ch.sub, {
          x: 50,
          y: 725,
          size: 11,
          font: boldFont,
          color: rgb(0.2, 0.25, 0.3),
        });

        // Mock Paragraph Body Box
        page.drawRectangle({
          x: 45,
          y: 450,
          width: 505.28,
          height: 240,
          borderColor: rgb(0.85, 0.88, 0.92),
          borderWidth: 1,
          color: rgb(0.98, 0.98, 1),
        });

        page.drawText(ch.content, {
          x: 65,
          y: 650,
          size: 10,
          font: regularFont,
          color: rgb(0.25, 0.25, 0.3),
        });

        page.drawText('• Section Status: Verified & Approved', {
          x: 65,
          y: 600,
          size: 10,
          font: regularFont,
          color: rgb(0.3, 0.3, 0.35),
        });
        page.drawText('• Confidentiality Level: Class-3 Commercial Distribution', {
          x: 65,
          y: 575,
          size: 10,
          font: regularFont,
          color: rgb(0.3, 0.3, 0.35),
        });

        // Bottom Footer
        page.drawLine({
          start: { x: 45, y: 50 },
          end: { x: 550, y: 50 },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
        page.drawText('Toolique Client-Side PDF Architecture Studio • Sample Document', {
          x: 45,
          y: 35,
          size: 8,
          font: regularFont,
          color: rgb(0.5, 0.5, 0.55),
        });
      });

      const pdfBytes = await doc.save();
      const sampleFile = new File([pdfBytes as any], 'Corporate_Annual_Report_Sample.pdf', { type: 'application/pdf' });
      await loadPdfFile(sampleFile);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate sample PDF document.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  // Selection Helper Methods
  const togglePageSelection = (pageIndex: number) => {
    setPages((prev) =>
      prev.map((p, idx) => (idx === pageIndex ? { ...p, selected: !p.selected } : p))
    );
    setResultBlob(null);
  };

  const selectAllPages = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: true })));
    setResultBlob(null);
  };

  const deselectAllPages = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })));
    setResultBlob(null);
  };

  const selectOddPages = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: p.pageNumber % 2 !== 0 })));
    setResultBlob(null);
  };

  const selectEvenPages = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: p.pageNumber % 2 === 0 })));
    setResultBlob(null);
  };

  const invertSelection = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: !p.selected })));
    setResultBlob(null);
  };

  const rotatePage = (pageIndex: number) => {
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === pageIndex ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
    setResultBlob(null);
  };

  const rotateAllSelected = () => {
    setPages((prev) =>
      prev.map((p) => (p.selected ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
    setResultBlob(null);
  };

  // Range String Parser (e.g., "1-3, 5, 7-10")
  const parseRangeString = (input: string, maxPages: number): { start: number; end: number; pageNumbers: number[] }[] => {
    const trimmed = input.trim();
    if (!trimmed) return [];

    const segments = trimmed.split(',');
    const results: { start: number; end: number; pageNumbers: number[] }[] = [];

    for (const seg of segments) {
      const p = seg.trim();
      if (p.includes('-')) {
        const [startStr, endStr] = p.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= maxPages && start <= end) {
          const list: number[] = [];
          for (let k = start; k <= end; k++) list.push(k);
          results.push({ start, end, pageNumbers: list });
        }
      } else {
        const num = parseInt(p, 10);
        if (!isNaN(num) && num >= 1 && num <= maxPages) {
          results.push({ start: num, end: num, pageNumbers: [num] });
        }
      }
    }
    return results;
  };

  // Sync ranges input when in range mode
  useEffect(() => {
    if (splitMode === 'ranges' && totalPages > 0) {
      const parsedRanges = parseRangeString(rangeInput, totalPages);
      const activeSet = new Set<number>();
      parsedRanges.forEach((r) => r.pageNumbers.forEach((p) => activeSet.add(p)));
      setPages((prev) => prev.map((p) => ({ ...p, selected: activeSet.has(p.pageNumber) })));
    }
  }, [rangeInput, splitMode, totalPages]);

  // Main Slicing & Extraction Handler
  const handleExecuteSplit = async () => {
    if (!file || pages.length === 0) {
      setError('Please upload a PDF document before splitting.');
      return;
    }

    setIsProcessing(true);
    setProgressStatus('Initializing PDF slicing pipeline...');
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const prefix = customPrefix || file.name.replace(/\.pdf$/i, '');

      if (splitMode === 'visual') {
        const selectedPages = pages.filter((p) => p.selected);
        if (selectedPages.length === 0) {
          throw new Error('Please select at least one page to extract.');
        }

        if (outputMode === 'single_merged') {
          setProgressStatus(`Extracting ${selectedPages.length} selected pages into a single PDF...`);
          const newDoc = await PDFDocument.create();
          const pageIndices = selectedPages.map((p) => p.pageIndex);
          const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);

          copiedPages.forEach((p, idx) => {
            const rot = selectedPages[idx].rotation;
            if (rot !== 0) {
              const cur = p.getRotation().angle;
              p.setRotation(degrees((cur + rot) % 360));
            }
            newDoc.addPage(p);
          });

          const bytes = await newDoc.save();
          const blob = new Blob([bytes as any], { type: 'application/pdf' });
          const outName = `${prefix}_extracted_${selectedPages.length}pages.pdf`;

          setResultBlob({ blob, fileName: outName, isZip: false });
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(URL.createObjectURL(blob));
          setActiveTab('preview');
        } else {
          // Output mode = separate_zip
          setProgressStatus(`Packaging ${selectedPages.length} individual pages into ZIP archive...`);
          const zip = new JSZip();

          for (let i = 0; i < selectedPages.length; i++) {
            const pageItem = selectedPages[i];
            const singleDoc = await PDFDocument.create();
            const [copied] = await singleDoc.copyPages(srcDoc, [pageItem.pageIndex]);

            if (pageItem.rotation !== 0) {
              const cur = copied.getRotation().angle;
              copied.setRotation(degrees((cur + pageItem.rotation) % 360));
            }
            singleDoc.addPage(copied);

            const singleBytes = await singleDoc.save();
            const padNum = String(pageItem.pageNumber).padStart(3, '0');
            zip.file(`${prefix}_page_${padNum}.pdf`, singleBytes);
          }

          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const outName = `${prefix}_individual_pages.zip`;
          setResultBlob({ blob: zipBlob, fileName: outName, isZip: true });
          setActiveTab('preview');
        }
      } else if (splitMode === 'ranges') {
        const parsedRanges = parseRangeString(rangeInput, totalPages);
        if (parsedRanges.length === 0) {
          throw new Error('Please enter valid page ranges (e.g. "1-2, 4-6").');
        }

        if (outputMode === 'single_merged') {
          setProgressStatus('Combining specified ranges into single PDF...');
          const newDoc = await PDFDocument.create();
          const allIndices: number[] = [];
          parsedRanges.forEach((r) => r.pageNumbers.forEach((p) => allIndices.push(p - 1)));

          const copiedPages = await newDoc.copyPages(srcDoc, allIndices);
          copiedPages.forEach((p) => newDoc.addPage(p));

          const bytes = await newDoc.save();
          const blob = new Blob([bytes as any], { type: 'application/pdf' });
          const outName = `${prefix}_ranges_${rangeInput.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

          setResultBlob({ blob, fileName: outName, isZip: false });
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(URL.createObjectURL(blob));
          setActiveTab('preview');
        } else {
          // Separate files per range in ZIP
          setProgressStatus(`Splitting into ${parsedRanges.length} separate range files...`);
          const zip = new JSZip();

          for (let i = 0; i < parsedRanges.length; i++) {
            const range = parsedRanges[i];
            const rangeDoc = await PDFDocument.create();
            const indices = range.pageNumbers.map((p) => p - 1);
            const copied = await rangeDoc.copyPages(srcDoc, indices);
            copied.forEach((p) => rangeDoc.addPage(p));

            const rangeBytes = await rangeDoc.save();
            zip.file(`${prefix}_part_${i + 1}_pages_${range.start}-${range.end}.pdf`, rangeBytes);
          }

          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const outName = `${prefix}_split_ranges.zip`;
          setResultBlob({ blob: zipBlob, fileName: outName, isZip: true });
          setActiveTab('preview');
        }
      } else if (splitMode === 'fixed_chunks') {
        const cSize = Math.max(1, chunkSize);
        const totalChunks = Math.ceil(totalPages / cSize);
        setProgressStatus(`Bursting ${totalPages} pages into ${totalChunks} chunks of ${cSize} pages...`);

        const zip = new JSZip();
        for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
          const start = chunkIdx * cSize + 1;
          const end = Math.min(totalPages, (chunkIdx + 1) * cSize);
          const chunkDoc = await PDFDocument.create();
          const indices: number[] = [];
          for (let k = start; k <= end; k++) indices.push(k - 1);

          const copied = await chunkDoc.copyPages(srcDoc, indices);
          copied.forEach((p) => chunkDoc.addPage(p));

          const chunkBytes = await chunkDoc.save();
          const padIdx = String(chunkIdx + 1).padStart(2, '0');
          zip.file(`${prefix}_burst_part_${padIdx}_pages_${start}-${end}.pdf`, chunkBytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const outName = `${prefix}_burst_${cSize}pg_chunks.zip`;
        setResultBlob({ blob: zipBlob, fileName: outName, isZip: true });
        setActiveTab('preview');
      } else if (splitMode === 'odd_even') {
        const zip = new JSZip();
        setProgressStatus('Splitting document into Odd and Even duplex sets...');

        if (oddEvenSelection === 'odd' || oddEvenSelection === 'both') {
          const oddDoc = await PDFDocument.create();
          const oddIndices = Array.from({ length: totalPages }, (_, i) => i).filter((i) => i % 2 === 0);
          const copiedOdd = await oddDoc.copyPages(srcDoc, oddIndices);
          copiedOdd.forEach((p) => oddDoc.addPage(p));
          const oddBytes = await oddDoc.save();

          if (oddEvenSelection === 'odd') {
            const blob = new Blob([oddBytes as any], { type: 'application/pdf' });
            setResultBlob({ blob, fileName: `${prefix}_ODD_pages.pdf`, isZip: false });
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(blob));
            setActiveTab('preview');
            return;
          }
          zip.file(`${prefix}_ODD_pages.pdf`, oddBytes);
        }

        if (oddEvenSelection === 'even' || oddEvenSelection === 'both') {
          const evenDoc = await PDFDocument.create();
          const evenIndices = Array.from({ length: totalPages }, (_, i) => i).filter((i) => i % 2 === 1);
          const copiedEven = await evenDoc.copyPages(srcDoc, evenIndices);
          copiedEven.forEach((p) => evenDoc.addPage(p));
          const evenBytes = await evenDoc.save();

          if (oddEvenSelection === 'even') {
            const blob = new Blob([evenBytes as any], { type: 'application/pdf' });
            setResultBlob({ blob, fileName: `${prefix}_EVEN_pages.pdf`, isZip: false });
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(blob));
            setActiveTab('preview');
            return;
          }
          zip.file(`${prefix}_EVEN_pages.pdf`, evenBytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        setResultBlob({ blob: zipBlob, fileName: `${prefix}_duplex_odd_even.zip`, isZip: true });
        setActiveTab('preview');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while splitting the PDF document.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleDownloadResult = () => {
    if (!resultBlob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(resultBlob.blob);
    link.download = resultBlob.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateManifestSchedule = () => {
    if (!file) return '';
    const prefix = customPrefix || file.name.replace(/\.pdf$/i, '');
    let text = `========================================================\n`;
    text += `TOOLIQUE CLIENT-SIDE PDF SPLIT & SLICING SCHEDULE\n`;
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `Source Document: ${file.name} (${totalPages} Total Pages)\n`;
    text += `Split Mode: ${splitMode.toUpperCase()}\n`;
    text += `Output Strategy: ${outputMode === 'single_merged' ? 'Single Combined PDF' : 'Separate Files in ZIP'}\n`;
    text += `========================================================\n\n`;

    const selectedList = pages.filter((p) => p.selected);
    text += `SELECTED PAGES SUMMARY:\n`;
    text += `Total Included Pages: ${selectedList.length} of ${totalPages}\n`;
    text += `Included Page Indices: ${selectedList.map((p) => p.pageNumber).join(', ')}\n\n`;

    text += `OUTPUT ARTIFACTS:\n`;
    text += `• Target Output Name: ${resultBlob ? resultBlob.fileName : `${prefix}_extracted.pdf`}\n`;
    text += `100% In-Browser WebAssembly Execution • Zero Server Transmission\n`;
    return text;
  };

  const handleCopyManifest = () => {
    const text = generateManifestSchedule();
    navigator.clipboard.writeText(text);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Action & Mode Navigation Toolbar */}
      <div className="saas-card p-4 flex flex-wrap items-center justify-between gap-4 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl overflow-x-auto">
          <button
            onClick={() => setSplitMode('visual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              splitMode === 'visual'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Visual Page Grid</span>
          </button>

          <button
            onClick={() => setSplitMode('ranges')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              splitMode === 'ranges'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Custom Ranges</span>
          </button>

          <button
            onClick={() => setSplitMode('fixed_chunks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              splitMode === 'fixed_chunks'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Burst / Chunks</span>
          </button>

          <button
            onClick={() => setSplitMode('odd_even')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              splitMode === 'odd_even'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Odd / Even Duplex</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLoadSamplePdf}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            title="Load a 6-page corporate report in memory to test extraction and burst splitting"
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
                setResultBlob(null);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }}
              className="p-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition cursor-pointer"
              title="Remove current document"
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
            <p className="font-bold">{progressStatus || 'Processing PDF document...'}</p>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300">All slicing happens locally in browser memory.</p>
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
        {/* Left Column (8 cols): Page Grid / Range Inputs */}
        <div className="lg:col-span-8 space-y-6">
          {!file ? (
            /* Upload Empty State */
            <div className="saas-card p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 hover:border-indigo-500/50 transition">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                <Scissors className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Upload a PDF to Split, Slice or Extract</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                  Extract specific pages, partition by custom ranges, burst into fixed chunks, or separate odd and even sheets.
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
                  <span>Load Sample Report</span>
                </button>
              </div>
              <div className="pt-4 flex items-center justify-center gap-4 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Client-Side Privacy
                </span>
                <span>•</span>
                <span>Instant Vector Slicing</span>
                <span>•</span>
                <span>No File Size Restrictions</span>
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
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold">
                    {selectedCount} Selected
                  </span>
                </div>
              </div>

              {/* Mode-Specific Controls */}
              {splitMode === 'visual' && (
                <div className="saas-card p-6 space-y-4">
                  {/* Selection Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-3">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Grid className="w-4 h-4 text-indigo-500" />
                      <span>Select Pages to Extract</span>
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <button
                        onClick={selectAllPages}
                        className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold cursor-pointer"
                      >
                        All
                      </button>
                      <button
                        onClick={deselectAllPages}
                        className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold cursor-pointer"
                      >
                        None
                      </button>
                      <button
                        onClick={selectOddPages}
                        className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold cursor-pointer"
                      >
                        Odd
                      </button>
                      <button
                        onClick={selectEvenPages}
                        className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold cursor-pointer"
                      >
                        Even
                      </button>
                      <button
                        onClick={invertSelection}
                        className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold cursor-pointer"
                      >
                        Invert
                      </button>
                      <button
                        onClick={rotateAllSelected}
                        disabled={selectedCount === 0}
                        className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-[10px] font-bold cursor-pointer flex items-center gap-1 disabled:opacity-30"
                        title="Rotate all selected pages +90°"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Rotate Selected</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Page Grid Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[520px] overflow-y-auto pr-1">
                    {pages.map((p, idx) => (
                      <div
                        key={p.pageNumber}
                        onClick={() => togglePageSelection(idx)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between space-y-2 select-none ${
                          p.selected
                            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-zinc-300 opacity-60'
                        }`}
                      >
                        {/* Header: Checkbox + Page Badge + Rotate */}
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            {p.selected ? (
                              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-400" />
                            )}
                            <span className="font-mono font-black text-zinc-900 dark:text-white">
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

                        {/* Page Canvas Thumbnail */}
                        <div className="w-full aspect-[3/4] rounded-xl bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 flex items-center justify-center overflow-hidden relative shadow-inner">
                          {p.thumbnailUrl ? (
                            <img
                              src={p.thumbnailUrl}
                              alt={`Page ${p.pageNumber}`}
                              className="w-full h-full object-contain transition-transform"
                              style={{ transform: `rotate(${p.rotation}deg)` }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-3 text-center space-y-1">
                              <FileSpreadsheet className="w-8 h-8 text-indigo-400 opacity-60" />
                              <span className="text-[10px] font-bold text-zinc-500">Page {p.pageNumber}</span>
                            </div>
                          )}

                          {p.rotation !== 0 && (
                            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-amber-500 text-white font-mono text-[8px] font-bold">
                              {p.rotation}°
                            </div>
                          )}
                        </div>

                        <div className="text-center text-[10px] font-semibold text-zinc-400">
                          {p.dimensions ? `${p.dimensions.width} × ${p.dimensions.height} pt` : 'Standard Page'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {splitMode === 'ranges' && (
                <div className="saas-card p-6 space-y-4">
                  <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Custom Page Ranges Definition</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Extract continuous segments or non-adjacent pages (e.g. chapters, appendices, or contract clauses).
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Enter Page Ranges (1 to {totalPages})
                    </label>
                    <input
                      type="text"
                      value={rangeInput}
                      onChange={(e) => setRangeInput(e.target.value)}
                      placeholder="e.g. 1-2, 5, 8-10"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                    />

                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      <span className="text-[11px] text-zinc-400 self-center">Quick presets:</span>
                      <button
                        onClick={() => setRangeInput(`1-${Math.ceil(totalPages / 2)}`)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                      >
                        First Half (1-{Math.ceil(totalPages / 2)})
                      </button>
                      <button
                        onClick={() => setRangeInput(`${Math.ceil(totalPages / 2) + 1}-${totalPages}`)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                      >
                        Second Half
                      </button>
                      <button
                        onClick={() => setRangeInput(`1, ${totalPages}`)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                      >
                        Cover & Back (1, {totalPages})
                      </button>
                    </div>

                    {/* Live Range Breakdown Preview */}
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                        Parsed Output Segments
                      </span>
                      <div className="space-y-1.5 text-xs">
                        {parseRangeString(rangeInput, totalPages).map((seg, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-150 dark:border-zinc-700 font-mono text-[11px]"
                          >
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              Part #{sIdx + 1}: Pages {seg.start} to {seg.end}
                            </span>
                            <span className="text-zinc-400">
                              ({seg.pageNumbers.length} {seg.pageNumbers.length === 1 ? 'page' : 'pages'})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {splitMode === 'fixed_chunks' && (
                <div className="saas-card p-6 space-y-4">
                  <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Fixed Burst Slicing</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Automatically burst large documents into equal-sized chapter files of N pages each.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Split Every N Pages
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        max={totalPages}
                        value={chunkSize}
                        onChange={(e) => setChunkSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-28 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-zinc-500">
                        = Will generate <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{Math.ceil(totalPages / Math.max(1, chunkSize))}</strong> separate PDF files in a ZIP archive.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {[1, 2, 5, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setChunkSize(num)}
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                            chunkSize === num
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                          }`}
                        >
                          Every {num} {num === 1 ? 'Page' : 'Pages'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {splitMode === 'odd_even' && (
                <div className="saas-card p-6 space-y-4">
                  <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Odd / Even Duplex Splitter</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Separate alternating sheets into distinct files for manual duplex printing or scanner reassembly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setOddEvenSelection('both')}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        oddEvenSelection === 'both'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="text-xs font-bold">Both Odd & Even Sets</div>
                      <div className="text-[10px] text-zinc-400 mt-1">Generates 2 separate PDFs in a ZIP</div>
                    </button>

                    <button
                      onClick={() => setOddEvenSelection('odd')}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        oddEvenSelection === 'odd'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="text-xs font-bold">Odd Pages Only (1, 3, 5...)</div>
                      <div className="text-[10px] text-zinc-400 mt-1">
                        {Math.ceil(totalPages / 2)} Front Sheets
                      </div>
                    </button>

                    <button
                      onClick={() => setOddEvenSelection('even')}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                        oddEvenSelection === 'even'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="text-xs font-bold">Even Pages Only (2, 4, 6...)</div>
                      <div className="text-[10px] text-zinc-400 mt-1">
                        {Math.floor(totalPages / 2)} Back Sheets
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Embedded Preview Tab */}
          {activeTab === 'preview' && previewUrl && (
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Extracted Document Preview</h3>
                  <p className="text-xs text-zinc-400">Live preview of your extracted PDF document.</p>
                </div>
                <button
                  onClick={handleDownloadResult}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Output</span>
                </button>
              </div>

              <div className="w-full h-[550px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950">
                <iframe
                  src={`${previewUrl}#toolbar=1`}
                  title="Split PDF Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Action & Output Strategy */}
        <div className="lg:col-span-4 space-y-6">
          <div className="saas-card p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Slicing Strategy</span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1 font-mono">
                {selectedCount} <span className="text-sm font-normal text-zinc-500">of {totalPages} Pages</span>
              </div>
            </div>

            {/* Output Mode Strategy */}
            {(splitMode === 'visual' || splitMode === 'ranges') && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Packaging Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOutputMode('single_merged')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      outputMode === 'single_merged'
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 text-xs'
                    }`}
                  >
                    <div className="text-xs font-bold">Single PDF</div>
                    <div className="text-[9px] text-zinc-400">Merged output</div>
                  </button>

                  <button
                    onClick={() => setOutputMode('separate_zip')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      outputMode === 'separate_zip'
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 text-xs'
                    }`}
                  >
                    <div className="text-xs font-bold">ZIP Package</div>
                    <div className="text-[9px] text-zinc-400">Separate files</div>
                  </button>
                </div>
              </div>
            )}

            {/* Custom Output Prefix */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">File Prefix / Name</label>
              <input
                type="text"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value)}
                placeholder="e.g. Contract_Clauses"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Main Action Button */}
            <button
              onClick={handleExecuteSplit}
              disabled={!file || selectedCount === 0 || isProcessing}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Pages...</span>
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4" />
                  <span>Execute Split & Extract</span>
                </>
              )}
            </button>

            {/* Success Download Card */}
            {resultBlob && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Split Completed Successfully!</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                  {resultBlob.fileName} ({(resultBlob.blob.size / (1024 * 1024)).toFixed(2)} MB)
                </div>
                <button
                  onClick={handleDownloadResult}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {resultBlob.isZip ? 'ZIP Archive' : 'Extracted PDF'}</span>
                </button>
              </div>
            )}

            {/* Document Checklist Summary */}
            <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500">Source Total:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{totalPages} Pages</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500">Extract Mode:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{splitMode}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Selected Count:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedCount} Pages</span>
              </div>
            </div>

            {/* Copy Manifest Button */}
            <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4">
              <button
                onClick={handleCopyManifest}
                disabled={!file}
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {copiedManifest ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied Manifest!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Copy Slicing Manifest</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Privacy & Air-Gap Shield */}
          <div className="saas-card p-5 space-y-3 bg-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>100% In-Browser Privacy Shield</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Your confidential documents are never uploaded to remote servers. All vector page extractions, rotations,
              and ZIP bundling execute directly in local WebAssembly memory.
            </p>
          </div>

          {/* Slicing Quick Tips */}
          <div className="saas-card p-5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
              <Info className="w-4 h-4 text-indigo-500" />
              <span>Slicing Pro-Tips</span>
            </div>
            <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5 list-disc pl-4">
              <li>
                <strong>Lasso Multi-Select</strong>: In Visual Grid mode, click any thumbnail card to include or exclude that page.
              </li>
              <li>
                <strong>Continuous Ranges</strong>: Use <code className="text-[10px]">1-5, 8, 12-14</code> to partition by sections.
              </li>
              <li>
                <strong>Duplex Reassembly</strong>: Separate Odd and Even sheets for double-sided scanner reconciliation.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
