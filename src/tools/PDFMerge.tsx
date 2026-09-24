/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  RotateCw,
  Sparkles,
  Eye,
  FileCheck,
  Printer,
  Copy,
  Layers,
  Settings2,
  FolderArchive,
  ArrowUpDown,
  BookOpen,
  FileStack,
  ShieldCheck,
  Check,
  Info,
  Maximize2
} from 'lucide-react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  sizeFormatted: string;
  sizeBytes: number;
  pageCount: number;
  pageRange: string; // 'all', '1-5', '1, 3, 5-8', 'odd', 'even'
  rotation: number; // 0, 90, 180, 270
  thumbnailUrl?: string;
  pageDimensions?: { width: number; height: number; format: string }[];
}

export interface PageThumbnailItem {
  id: string;
  fileId: string;
  fileName: string;
  pageIndex: number; // 0-indexed in parent file
  pageNumber: number; // 1-indexed in parent file
  rotation: number;
  thumbnailUrl?: string;
}

export type ViewTab = 'files' | 'pages' | 'settings' | 'preview';
export type PageSizeMode = 'original' | 'a4' | 'letter' | 'a3' | 'legal';
export type PageNumberPosition = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-center';
export type PageNumberFormat = 'Page X of Y' | 'X / Y' | 'Page X' | '— X —';

const PAGE_SIZE_POINTS: Record<PageSizeMode, [number, number]> = {
  original: [595.28, 841.89],
  a4: [595.28, 841.89],
  letter: [612.0, 792.0],
  a3: [841.89, 1190.55],
  legal: [612.0, 1008.0],
};

export default function PDFMerge() {
  const [activeTab, setActiveTab] = useState<ViewTab>('files');
  const [files, setFiles] = useState<PDFFileItem[]>([]);
  const [pages, setPages] = useState<PageThumbnailItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedManifest, setCopiedManifest] = useState<boolean>(false);

  // Advanced Assembly Configuration
  const [outputFileName, setOutputFileName] = useState<string>('Merged_Document_Toolique.pdf');
  const [pageSizeMode, setPageSizeMode] = useState<PageSizeMode>('original');
  const [pageNumberingEnabled, setPageNumberingEnabled] = useState<boolean>(false);
  const [pageNumberFormat, setPageNumberFormat] = useState<PageNumberFormat>('Page X of Y');
  const [pageNumberPosition, setPageNumberPosition] = useState<PageNumberPosition>('bottom-center');
  const [pageNumberFontSize, setPageNumberFontSize] = useState<number>(10);
  const [skipFirstPageNumber, setSkipFirstPageNumber] = useState<boolean>(false);

  const [tocEnabled, setTocEnabled] = useState<boolean>(false);
  const [tocTitle, setTocTitle] = useState<string>('Document Index');

  const [metaTitle, setMetaTitle] = useState<string>('');
  const [metaAuthor, setMetaAuthor] = useState<string>('Toolique User');
  const [metaSubject, setMetaSubject] = useState<string>('Compiled Multi-Document Package');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to parse page range input (e.g., "1-3, 5, 8-10", "odd", "even", "all")
  const parsePageRange = (rangeStr: string, maxPages: number): number[] => {
    const trimmed = (rangeStr || 'all').trim().toLowerCase();
    if (!trimmed || trimmed === 'all') {
      return Array.from({ length: maxPages }, (_, i) => i);
    }
    if (trimmed === 'odd') {
      return Array.from({ length: maxPages }, (_, i) => i).filter((i) => i % 2 === 0);
    }
    if (trimmed === 'even') {
      return Array.from({ length: maxPages }, (_, i) => i).filter((i) => i % 2 === 1);
    }

    const indices = new Set<number>();
    const parts = trimmed.split(',');
    for (const part of parts) {
      const p = part.trim();
      if (p.includes('-')) {
        const [startStr, endStr] = p.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(maxPages, Math.max(start, end));
          for (let k = min; k <= max; k++) {
            indices.add(k - 1);
          }
        }
      } else {
        const pageNum = parseInt(p, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
          indices.add(pageNum - 1);
        }
      }
    }

    const result = Array.from(indices).sort((a, b) => a - b);
    return result.length > 0 ? result : Array.from({ length: maxPages }, (_, i) => i);
  };

  // Inspect and extract metadata & thumbnail for uploaded files
  const processNewFiles = async (newFileObjects: File[]) => {
    setError(null);
    setIsProcessing(true);
    setProgressStatus('Reading PDF document structures...');

    const processedItems: PDFFileItem[] = [];

    for (let fIdx = 0; fIdx < newFileObjects.length; fIdx++) {
      const file = newFileObjects[fIdx];
      setProgressStatus(`Analyzing ${file.name} (${fIdx + 1}/${newFileObjects.length})...`);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pageCount = pdfDoc.getPageCount();

        // Detect dimensions
        const pageDimensions: { width: number; height: number; format: string }[] = [];
        for (let p = 0; p < Math.min(pageCount, 5); p++) {
          const pg = pdfDoc.getPage(p);
          const { width, height } = pg.getSize();
          let format = 'Custom';
          if (Math.abs(width - 595) < 10 && Math.abs(height - 842) < 10) format = 'A4 Portrait';
          else if (Math.abs(width - 842) < 10 && Math.abs(height - 595) < 10) format = 'A4 Landscape';
          else if (Math.abs(width - 612) < 10 && Math.abs(height - 792) < 10) format = 'Letter Portrait';
          else if (Math.abs(width - 842) < 10 && Math.abs(height - 1191) < 10) format = 'A3 Portrait';
          pageDimensions.push({ width: Math.round(width), height: Math.round(height), format });
        }

        // Render first page thumbnail via pdfjs
        let thumbUrl: string | undefined;
        try {
          const loadingTask = pdfjs.getDocument({ data: arrayBuffer.slice(0) });
          const pdfJsDoc = await loadingTask.promise;
          const firstPage = await pdfJsDoc.getPage(1);
          const viewport = firstPage.getViewport({ scale: 0.25 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await (firstPage.render as any)({
              canvasContext: ctx,
              viewport,
              canvas,
            }).promise;
            thumbUrl = canvas.toDataURL('image/jpeg', 0.7);
          }
        } catch (thumbErr) {
          console.warn('Thumbnail generation skipped:', thumbErr);
        }

        processedItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          sizeFormatted: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          sizeBytes: file.size,
          pageCount,
          pageRange: 'all',
          rotation: 0,
          thumbnailUrl: thumbUrl,
          pageDimensions,
        });
      } catch (err: any) {
        console.error(`Failed to load ${file.name}:`, err);
        setError(`Could not parse "${file.name}". Please ensure it is a valid, uncorrupted PDF file.`);
      }
    }

    if (processedItems.length > 0) {
      setFiles((prev) => {
        const updated = [...prev, ...processedItems];
        rebuildPagesDeck(updated);
        return updated;
      });
      setMergedBlob(null);
      if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
        setMergedPdfUrl(null);
      }
    }

    setIsProcessing(false);
    setProgressStatus('');
  };

  const rebuildPagesDeck = (fileList: PDFFileItem[]) => {
    const pageItems: PageThumbnailItem[] = [];
    for (const f of fileList) {
      const activeIndices = parsePageRange(f.pageRange, f.pageCount);
      for (const pIdx of activeIndices) {
        pageItems.push({
          id: `${f.id}_p${pIdx}`,
          fileId: f.id,
          fileName: f.name,
          pageIndex: pIdx,
          pageNumber: pIdx + 1,
          rotation: f.rotation,
          thumbnailUrl: f.thumbnailUrl,
        });
      }
    }
    setPages(pageItems);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      const pdfFiles = Array.from(uploadedFiles).filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
      if (pdfFiles.length === 0) {
        setError('No valid PDF files selected. Please upload files with the .pdf extension.');
        return;
      }
      processNewFiles(pdfFiles);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Instant Sample PDF Generation for quick demo
  const handleLoadSamples = async () => {
    setIsProcessing(true);
    setProgressStatus('Generating sample PDF documents in browser memory...');
    setError(null);

    try {
      // 1. Executive Summary
      const doc1 = await PDFDocument.create();
      const page1 = doc1.addPage([595.28, 841.89]);
      page1.drawRectangle({ x: 30, y: 760, width: 535, height: 50, color: rgb(0.26, 0.4, 0.95) });
      const font = await doc1.embedFont(StandardFonts.HelveticaBold);
      const regFont = await doc1.embedFont(StandardFonts.Helvetica);
      page1.drawText('EXECUTIVE STRATEGY BRIEF - Q3', { x: 45, y: 780, size: 16, font, color: rgb(1, 1, 1) });
      page1.drawText('Confidential • Prepared for Board of Directors', { x: 45, y: 720, size: 11, font: regFont, color: rgb(0.4, 0.4, 0.4) });
      page1.drawText('1. Executive Overview & Key Accomplishments', { x: 45, y: 680, size: 13, font, color: rgb(0.1, 0.1, 0.2) });
      page1.drawText('All strategic milestones for Q3 have been achieved ahead of schedule.', { x: 45, y: 655, size: 10, font: regFont, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText('Gross platform efficiency increased by 38.4% across 4 global operating hubs.', { x: 45, y: 635, size: 10, font: regFont, color: rgb(0.2, 0.2, 0.2) });
      const bytes1 = await doc1.save();
      const file1 = new File([bytes1 as any], '01_Executive_Summary.pdf', { type: 'application/pdf' });

      // 2. Financial Breakdown (2 Pages)
      const doc2 = await PDFDocument.create();
      const font2 = await doc2.embedFont(StandardFonts.HelveticaBold);
      const regFont2 = await doc2.embedFont(StandardFonts.Helvetica);
      
      const page2A = doc2.addPage([595.28, 841.89]);
      page2A.drawRectangle({ x: 30, y: 760, width: 535, height: 50, color: rgb(0.08, 0.65, 0.45) });
      page2A.drawText('FINANCIAL PERFORMANCE & AUDIT - PAGE 1', { x: 45, y: 780, size: 16, font: font2, color: rgb(1, 1, 1) });
      page2A.drawText('Consolidated Balance Sheet & EBITDA Schedule', { x: 45, y: 720, size: 11, font: regFont2, color: rgb(0.4, 0.4, 0.4) });
      page2A.drawText('• Gross Revenue: $4,280,000 (+14.2% YoY)', { x: 45, y: 680, size: 11, font: regFont2, color: rgb(0.1, 0.1, 0.1) });
      page2A.drawText('• Operating Expenses: $2,120,000 (Target: <$2.3M)', { x: 45, y: 655, size: 11, font: regFont2, color: rgb(0.1, 0.1, 0.1) });
      page2A.drawText('• Net Operating Margin: 50.4%', { x: 45, y: 630, size: 11, font: font2, color: rgb(0.08, 0.65, 0.45) });

      const page2B = doc2.addPage([595.28, 841.89]);
      page2B.drawRectangle({ x: 30, y: 760, width: 535, height: 50, color: rgb(0.08, 0.65, 0.45) });
      page2B.drawText('FINANCIAL PERFORMANCE & AUDIT - PAGE 2', { x: 45, y: 780, size: 16, font: font2, color: rgb(1, 1, 1) });
      page2B.drawText('Capital Expenditure & R&D Allocations for Next Fiscal Year.', { x: 45, y: 720, size: 11, font: regFont2, color: rgb(0.4, 0.4, 0.4) });
      page2B.drawText('Approved by Chief Financial Officer.', { x: 45, y: 680, size: 10, font: regFont2, color: rgb(0.3, 0.3, 0.3) });

      const bytes2 = await doc2.save();
      const file2 = new File([bytes2 as any], '02_Financial_Audit_Report.pdf', { type: 'application/pdf' });

      // 3. Technical Blueprint & Schematics (Landscape A4)
      const doc3 = await PDFDocument.create();
      const font3 = await doc3.embedFont(StandardFonts.HelveticaBold);
      const regFont3 = await doc3.embedFont(StandardFonts.Helvetica);
      const page3 = doc3.addPage([841.89, 595.28]); // Landscape
      page3.drawRectangle({ x: 30, y: 515, width: 781, height: 50, color: rgb(0.55, 0.22, 0.85) });
      page3.drawText('INFRASTRUCTURE ARCHITECTURE & CLOUD TOPOLOGY', { x: 45, y: 535, size: 16, font: font3, color: rgb(1, 1, 1) });
      page3.drawText('Engineering Submittal Sheet • 99.999% High Availability Vector Layout', { x: 45, y: 480, size: 11, font: regFont3, color: rgb(0.4, 0.4, 0.4) });
      page3.drawRectangle({ x: 45, y: 100, width: 751, height: 350, borderColor: rgb(0.55, 0.22, 0.85), borderWidth: 1.5, color: rgb(0.97, 0.95, 1) });
      page3.drawText('CAD Vector Cluster: Web Layer -> Load Balancers -> Database Cluster (Active/Active)', { x: 60, y: 280, size: 12, font: font3, color: rgb(0.3, 0.1, 0.5) });

      const bytes3 = await doc3.save();
      const file3 = new File([bytes3 as any], '03_Cloud_Infrastructure_Schematic.pdf', { type: 'application/pdf' });

      await processNewFiles([file1, file2, file3]);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate sample PDFs.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      rebuildPagesDeck(updated);
      return updated;
    });
    setMergedBlob(null);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newFiles.length) {
      const temp = newFiles[index];
      newFiles[index] = newFiles[targetIndex];
      newFiles[targetIndex] = temp;
      setFiles(newFiles);
      rebuildPagesDeck(newFiles);
      setMergedBlob(null);
    }
  };

  const handleRotateFile = (id: string) => {
    setFiles((prev) => {
      const updated = prev.map((f) => {
        if (f.id === id) {
          const nextRot = (f.rotation + 90) % 360;
          return { ...f, rotation: nextRot };
        }
        return f;
      });
      rebuildPagesDeck(updated);
      return updated;
    });
    setMergedBlob(null);
  };

  const handlePageRangeChange = (id: string, newRange: string) => {
    setFiles((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, pageRange: newRange } : f));
      rebuildPagesDeck(updated);
      return updated;
    });
    setMergedBlob(null);
  };

  const sortFiles = (type: 'az' | 'za' | 'reverse' | 'size') => {
    const copy = [...files];
    if (type === 'az') copy.sort((a, b) => a.name.localeCompare(b.name));
    else if (type === 'za') copy.sort((a, b) => b.name.localeCompare(a.name));
    else if (type === 'reverse') copy.reverse();
    else if (type === 'size') copy.sort((a, b) => b.sizeBytes - a.sizeBytes);
    setFiles(copy);
    rebuildPagesDeck(copy);
    setMergedBlob(null);
  };

  const handleClearAll = () => {
    if (files.length > 0 && !window.confirm('Clear all uploaded files from the queue?')) {
      return;
    }
    setFiles([]);
    setPages([]);
    setMergedBlob(null);
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
      setMergedPdfUrl(null);
    }
    setError(null);
  };

  // Main Assembly / Merge Execution Engine
  const handleMergePDFs = async () => {
    if (files.length === 0) {
      setError('Please upload or load at least one PDF file to assemble.');
      return;
    }

    setIsProcessing(true);
    setProgressStatus('Initializing client-side PDF document compiler...');
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();
      const helvetica = await mergedPdf.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

      const tocEntries: { title: string; startPage: number; pageCount: number }[] = [];
      let currentPageCounter = 0;

      // 1. Copy pages from each file
      for (let fIdx = 0; fIdx < files.length; fIdx++) {
        const fileItem = files[fIdx];
        setProgressStatus(`Merging "${fileItem.name}" (${fIdx + 1}/${files.length})...`);

        const arrayBuffer = await fileItem.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const totalSrcPages = srcDoc.getPageCount();
        const targetIndices = parsePageRange(fileItem.pageRange, totalSrcPages);

        if (targetIndices.length === 0) continue;

        tocEntries.push({
          title: fileItem.name.replace(/\.pdf$/i, ''),
          startPage: currentPageCounter,
          pageCount: targetIndices.length,
        });

        const copiedPages = await mergedPdf.copyPages(srcDoc, targetIndices);

        for (let pIdx = 0; pIdx < copiedPages.length; pIdx++) {
          const page = copiedPages[pIdx];

          // Apply rotation offset
          if (fileItem.rotation !== 0) {
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees((currentRotation + fileItem.rotation) % 360));
          }

          // Apply page size normalization if requested
          if (pageSizeMode !== 'original') {
            const [stdW, stdH] = PAGE_SIZE_POINTS[pageSizeMode];
            const origSize = page.getSize();
            const isOrigLandscape = origSize.width > origSize.height;

            let targetWidth = stdW;
            let targetHeight = stdH;
            if (isOrigLandscape && targetWidth < targetHeight) {
              targetWidth = stdH;
              targetHeight = stdW;
            }

            const scaleRatio = Math.min(targetWidth / origSize.width, targetHeight / origSize.height);
            page.scale(scaleRatio, scaleRatio);
          }

          mergedPdf.addPage(page);
          currentPageCounter++;
        }
      }

      // 2. Optional: Prepend Visual Table of Contents page
      if (tocEnabled && tocEntries.length > 0) {
        setProgressStatus('Constructing visual document index sheet...');
        const tocPage = mergedPdf.insertPage(0, [595.28, 841.89]); // A4
        tocPage.drawRectangle({
          x: 35,
          y: 770,
          width: 525.28,
          height: 40,
          color: rgb(0.15, 0.23, 0.36),
        });
        tocPage.drawText(tocTitle || 'Document Index', {
          x: 48,
          y: 785,
          size: 16,
          font: helveticaBold,
          color: rgb(1, 1, 1),
        });

        tocPage.drawText('Table of Contents • Compiled via Toolique PDF Studio', {
          x: 48,
          y: 745,
          size: 9,
          font: helvetica,
          color: rgb(0.45, 0.45, 0.5),
        });

        let yOffset = 705;
        tocEntries.forEach((entry, idx) => {
          if (yOffset > 70) {
            // Index number pill
            tocPage.drawRectangle({
              x: 48,
              y: yOffset - 2,
              width: 18,
              height: 14,
              color: rgb(0.9, 0.93, 0.98),
            });
            tocPage.drawText(`${idx + 1}`, {
              x: 53,
              y: yOffset + 1,
              size: 8,
              font: helveticaBold,
              color: rgb(0.2, 0.35, 0.8),
            });

            // Section title
            const truncatedTitle = entry.title.length > 48 ? entry.title.substring(0, 45) + '...' : entry.title;
            tocPage.drawText(truncatedTitle, {
              x: 74,
              y: yOffset + 1,
              size: 10,
              font: helveticaBold,
              color: rgb(0.12, 0.14, 0.2),
            });

            // Page link text (+1 to account for the TOC page itself)
            const targetPageStr = `Page ${entry.startPage + 2} (${entry.pageCount} ${entry.pageCount === 1 ? 'pg' : 'pgs'})`;
            const strWidth = helvetica.widthOfTextAtSize(targetPageStr, 9);
            tocPage.drawText(targetPageStr, {
              x: 540 - strWidth,
              y: yOffset + 1,
              size: 9,
              font: helvetica,
              color: rgb(0.35, 0.4, 0.5),
            });

            // Divider rule
            tocPage.drawLine({
              start: { x: 48, y: yOffset - 8 },
              end: { x: 540, y: yOffset - 8 },
              thickness: 0.5,
              color: rgb(0.88, 0.9, 0.94),
            });

            yOffset -= 30;
          }
        });
      }

      // 3. Optional: Unified Page Numbering Overlay
      const finalTotalPages = mergedPdf.getPageCount();
      if (pageNumberingEnabled) {
        setProgressStatus('Stamping unified pagination and headers...');
        for (let pIdx = 0; pIdx < finalTotalPages; pIdx++) {
          if (skipFirstPageNumber && pIdx === 0) continue;

          const p = mergedPdf.getPage(pIdx);
          const { width, height } = p.getSize();
          const pageNum = pIdx + 1;

          let numText = `Page ${pageNum} of ${finalTotalPages}`;
          if (pageNumberFormat === 'X / Y') numText = `${pageNum} / ${finalTotalPages}`;
          else if (pageNumberFormat === 'Page X') numText = `Page ${pageNum}`;
          else if (pageNumberFormat === '— X —') numText = `— ${pageNum} —`;

          const fontSize = pageNumberFontSize;
          const textWidth = helvetica.widthOfTextAtSize(numText, fontSize);

          let x = (width - textWidth) / 2;
          let y = 22;

          if (pageNumberPosition === 'bottom-left') x = 36;
          else if (pageNumberPosition === 'bottom-right') x = width - textWidth - 36;
          else if (pageNumberPosition === 'top-center') y = height - 28;
          else if (pageNumberPosition === 'top-right') {
            x = width - textWidth - 36;
            y = height - 28;
          }

          p.drawText(numText, {
            x,
            y,
            size: fontSize,
            font: helvetica,
            color: rgb(0.35, 0.35, 0.4),
          });
        }
      }

      // 4. Set Metadata
      mergedPdf.setTitle(metaTitle || outputFileName.replace(/\.pdf$/i, ''));
      mergedPdf.setAuthor(metaAuthor || 'Toolique PDF Studio');
      mergedPdf.setSubject(metaSubject || 'Merged PDF Package');
      mergedPdf.setProducer('Toolique Client-Side Secure PDF Engine (v2.0)');
      mergedPdf.setCreator('Toolique PDF Studio');

      setProgressStatus('Packaging final PDF binary stream...');
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes as any], { type: 'application/pdf' });
      setMergedBlob(blob);

      if (mergedPdfUrl) URL.revokeObjectURL(mergedPdfUrl);
      const newUrl = URL.createObjectURL(blob);
      setMergedPdfUrl(newUrl);

      setActiveTab('preview');
    } catch (err: any) {
      console.error('Merge error:', err);
      setError(
        'An error occurred during PDF assembly. Please verify that none of your documents are corrupted or password-protected.'
      );
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const handleDownloadMerged = () => {
    if (!mergedBlob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(mergedBlob);
    link.download = outputFileName.endsWith('.pdf') ? outputFileName : `${outputFileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintMerged = () => {
    if (!mergedPdfUrl) return;
    const printWindow = window.open(mergedPdfUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleDownloadZipPackage = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgressStatus('Creating ZIP archive of original documents...');

    try {
      const zip = new JSZip();
      const folder = zip.folder('Source_Documents');

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const prefix = `${String(i + 1).padStart(2, '0')}_`;
        folder?.file(`${prefix}${f.name}`, f.file);
      }

      if (mergedBlob) {
        zip.file(outputFileName, mergedBlob);
      }

      // Add Manifest
      const manifestText = generateManifestText();
      zip.file('DOCUMENT_SCHEDULE_MANIFEST.txt', manifestText);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = 'PDF_Package_Archive.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error(err);
      setError('Failed to create ZIP package.');
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
    }
  };

  const generateManifestText = () => {
    let text = `========================================================\n`;
    text += `TOOLIQUE CLIENT-SIDE PDF MERGE MANIFEST SCHEDULE\n`;
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `Output File: ${outputFileName}\n`;
    text += `Page Size Mode: ${pageSizeMode.toUpperCase()}\n`;
    text += `Pagination: ${pageNumberingEnabled ? pageNumberFormat : 'Disabled'}\n`;
    text += `========================================================\n\n`;

    text += `SOURCE DOCUMENTS ORDER:\n`;
    let cumulativePage = 1;
    files.forEach((f, idx) => {
      const activeIndices = parsePageRange(f.pageRange, f.pageCount);
      const count = activeIndices.length;
      text += `[${idx + 1}] ${f.name}\n`;
      text += `    • File Size: ${f.sizeFormatted}\n`;
      text += `    • Source Pages: ${f.pageCount} (Selected: ${f.pageRange})\n`;
      text += `    • Included Page Count: ${count}\n`;
      text += `    • Output Target Pages: Page ${cumulativePage} to Page ${cumulativePage + count - 1}\n`;
      text += `    • Rotation Applied: ${f.rotation}°\n\n`;
      cumulativePage += count;
    });

    text += `TOTAL ASSEMBLED PAGES: ${cumulativePage - 1}\n`;
    text += `100% Client-Side In-Memory Execution • Privacy Guaranteed\n`;
    return text;
  };

  const handleCopyManifest = () => {
    const manifest = generateManifestText();
    navigator.clipboard.writeText(manifest);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  // Metrics Calculations
  const totalInputBytes = files.reduce((acc, f) => acc + f.sizeBytes, 0);
  const totalInputFormatted = (totalInputBytes / (1024 * 1024)).toFixed(2) + ' MB';
  const totalEffectivePages = files.reduce((acc, f) => acc + parsePageRange(f.pageRange, f.pageCount).length, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-left">
      {/* Top Action & Mode Navigation Toolbar */}
      <div className="saas-card p-4 flex flex-wrap items-center justify-between gap-4 border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <FileStack className="w-4 h-4" />
            <span>Files Queue ({files.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pages')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pages'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Page Deck ({totalEffectivePages})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Assembly Config</span>
          </button>

          {mergedBlob && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Merged Preview</span>
            </button>
          )}
        </div>

        {/* Quick Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLoadSamples}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition cursor-pointer disabled:opacity-50"
            title="Instantly generate 3 mock PDF documents to test merge capabilities"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Load Sample PDFs</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>Add PDF Files</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {files.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress or Error Banner */}
      {isProcessing && (
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div className="text-xs font-medium text-indigo-900 dark:text-indigo-200">
            <p className="font-bold">{progressStatus || 'Processing documents...'}</p>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300">All PDF operations occur client-side in browser memory.</p>
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
        {/* Left Column (8 cols): Active View Mode */}
        <div className="lg:col-span-8 space-y-6">
          {/* VIEW TAB 1: FILES LIST */}
          {activeTab === 'files' && (
            <div className="space-y-4">
              {files.length === 0 ? (
                /* Empty State Upload Dropzone */
                <div className="saas-card p-10 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 hover:border-indigo-500/50 transition">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                    <FileStack className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">Drag & drop your PDF files here</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                      Merge multiple contracts, blueprints, invoices, or presentation decks into a single, unified document.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <label className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition shadow-md flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>Browse Files</span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={handleLoadSamples}
                      className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span>Try Sample PDFs</span>
                    </button>
                  </div>
                  <div className="pt-4 flex items-center justify-center gap-4 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Client-Side Privacy
                    </span>
                    <span>•</span>
                    <span>No File Size Limit</span>
                    <span>•</span>
                    <span>Multi-Format Preserved</span>
                  </div>
                </div>
              ) : (
                /* Files List with Reordering & Range Selectors */
                <div className="saas-card p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">Document Queue</span>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 font-bold">
                        {files.length} {files.length === 1 ? 'file' : 'files'}
                      </span>
                    </div>

                    {/* Quick Sort Tools */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[11px] text-zinc-400 font-medium">Sort:</span>
                      <button
                        onClick={() => sortFiles('az')}
                        className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold cursor-pointer"
                        title="Sort Alphabetically A to Z"
                      >
                        A → Z
                      </button>
                      <button
                        onClick={() => sortFiles('za')}
                        className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold cursor-pointer"
                        title="Sort Alphabetically Z to A"
                      >
                        Z → A
                      </button>
                      <button
                        onClick={() => sortFiles('reverse')}
                        className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold cursor-pointer"
                        title="Reverse current queue order"
                      >
                        <ArrowUpDown className="w-3 h-3 inline mr-1" /> Reverse
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {files.map((file, idx) => {
                      const activeCount = parsePageRange(file.pageRange, file.pageCount).length;
                      return (
                        <div
                          key={file.id}
                          className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/40 hover:border-indigo-500/40 transition-all space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono text-xs font-black shrink-0">
                                {String(idx + 1).padStart(2, '0')}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate pr-2">{file.name}</p>
                                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                                  <span>{file.sizeFormatted}</span>
                                  <span>•</span>
                                  <span>{file.pageCount} {file.pageCount === 1 ? 'page' : 'pages'}</span>
                                  {file.rotation !== 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-amber-500 font-bold">Rotated {file.rotation}°</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Move and Delete Buttons */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleRotateFile(file.id)}
                                className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer"
                                title="Rotate entire file +90°"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveFile(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-25 cursor-pointer"
                                title="Move up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveFile(idx, 'down')}
                                disabled={idx === files.length - 1}
                                className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-25 cursor-pointer"
                                title="Move down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 cursor-pointer"
                                title="Remove file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Per-File Page Range Filter */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Pages to include:</span>
                              <input
                                type="text"
                                value={file.pageRange}
                                onChange={(e) => handlePageRangeChange(file.id, e.target.value)}
                                placeholder="all, 1-3, odd, even"
                                className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-mono w-36 focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>

                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              Selected: <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeCount} of {file.pageCount}</span> pages
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW TAB 2: PAGE DECK VISUAL GRID */}
          {activeTab === 'pages' && (
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Page-by-Page Visual Deck</h3>
                  <p className="text-xs text-zinc-400">All extracted pages in their final assembly sequence.</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold">
                  {pages.length} Pages Total
                </span>
              </div>

              {pages.length === 0 ? (
                <div className="p-12 text-center text-xs text-zinc-400">No pages loaded. Upload PDF files to inspect pages.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[550px] overflow-y-auto pr-1">
                  {pages.map((p, pIdx) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col justify-between space-y-2 relative group hover:border-indigo-500/50 transition shadow-sm"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                          #{pIdx + 1}
                        </span>
                        <span className="truncate max-w-[90px]" title={p.fileName}>
                          {p.fileName}
                        </span>
                      </div>

                      {/* Thumbnail Container */}
                      <div className="w-full aspect-[3/4] rounded-xl bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 flex items-center justify-center overflow-hidden relative shadow-inner">
                        {p.thumbnailUrl ? (
                          <img
                            src={p.thumbnailUrl}
                            alt={`Page ${p.pageNumber}`}
                            className="w-full h-full object-contain"
                            style={{ transform: `rotate(${p.rotation}deg)` }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-3 text-center space-y-1">
                            <FileText className="w-8 h-8 text-indigo-400 opacity-60" />
                            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                              Page {p.pageNumber}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-center text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        Source Page {p.pageNumber}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW TAB 3: ASSEMBLY SETTINGS */}
          {activeTab === 'settings' && (
            <div className="saas-card p-6 space-y-6">
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Document Assembly Configuration</h3>
                <p className="text-xs text-zinc-400">Customize output formatting, unified page numbering, table of contents, and metadata.</p>
              </div>

              {/* 1. Page Size Normalization */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-indigo-500" />
                  <span>Page Size Normalization</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(
                    [
                      { id: 'original', label: 'Keep Original', desc: 'Mixed sizes preserved' },
                      { id: 'a4', label: 'Standard A4', desc: '210 × 297 mm' },
                      { id: 'letter', label: 'US Letter', desc: '8.5 × 11 in' },
                      { id: 'a3', label: 'A3 Blueprint', desc: '297 × 420 mm' },
                      { id: 'legal', label: 'US Legal', desc: '8.5 × 14 in' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setPageSizeMode(opt.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        pageSizeMode === opt.id
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Unified Page Numbering */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">Unified Page Numbering (Pagination)</span>
                      <p className="text-[11px] text-zinc-400">Stamp continuous sequential page numbers across all combined pages.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pageNumberingEnabled}
                    onChange={(e) => setPageNumberingEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {pageNumberingEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">Format</label>
                      <select
                        value={pageNumberFormat}
                        onChange={(e) => setPageNumberFormat(e.target.value as PageNumberFormat)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      >
                        <option value="Page X of Y">Page X of Y</option>
                        <option value="X / Y">X / Y</option>
                        <option value="Page X">Page X</option>
                        <option value="— X —">— X —</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">Position</label>
                      <select
                        value={pageNumberPosition}
                        onChange={(e) => setPageNumberPosition(e.target.value as PageNumberPosition)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      >
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">Font Size</label>
                      <select
                        value={pageNumberFontSize}
                        onChange={(e) => setPageNumberFontSize(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                      >
                        <option value={8}>8 pt (Small)</option>
                        <option value={10}>10 pt (Standard)</option>
                        <option value={12}>12 pt (Large)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3 flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="skipFirst"
                        checked={skipFirstPageNumber}
                        onChange={(e) => setSkipFirstPageNumber(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <label htmlFor="skipFirst" className="text-[11px] text-zinc-600 dark:text-zinc-400 cursor-pointer">
                        Skip page numbering on the first page (Cover / Title Page)
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Table of Contents Index Page */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">Auto Table of Contents (TOC)</span>
                    <p className="text-[11px] text-zinc-400">Prepend a professional index sheet with document names and start page numbers.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={tocEnabled}
                    onChange={(e) => setTocEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {tocEnabled && (
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <label className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">Index Page Title</label>
                    <input
                      type="text"
                      value={tocTitle}
                      onChange={(e) => setTocTitle(e.target.value)}
                      placeholder="e.g. Master Document Schedule"
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* 4. PDF Metadata */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-zinc-900 dark:text-white">Output Document Metadata</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Document Title</label>
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="e.g. Q3 Comprehensive Report"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Author / Organization</label>
                    <input
                      type="text"
                      value={metaAuthor}
                      onChange={(e) => setMetaAuthor(e.target.value)}
                      placeholder="e.g. Engineering Team"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Subject / Classification</label>
                    <input
                      type="text"
                      value={metaSubject}
                      onChange={(e) => setMetaSubject(e.target.value)}
                      placeholder="e.g. Submittal Package"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 4: LIVE PREVIEW & MANIFEST */}
          {activeTab === 'preview' && mergedPdfUrl && (
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Merged PDF Inspector</h3>
                  <p className="text-xs text-zinc-400">Live preview of compiled document rendered directly in your browser.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintMerged}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={handleDownloadMerged}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Embedded PDF Iframe Preview */}
              <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950">
                <iframe
                  src={`${mergedPdfUrl}#toolbar=1&navpanes=1`}
                  title="PDF Preview"
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Summary, Action Cards & Exports */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main Action Merge Card */}
          <div className="saas-card p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Assembly Summary</span>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1 font-mono">
                {files.length} <span className="text-sm font-normal text-zinc-500">Files</span> • {totalEffectivePages}{' '}
                <span className="text-sm font-normal text-zinc-500">Pages</span>
              </div>
            </div>

            {/* Output Filename */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Output Filename</label>
              <input
                type="text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                placeholder="Merged_Document.pdf"
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-medium focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleMergePDFs}
              disabled={files.length === 0 || isProcessing}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Assembling PDF...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Assemble & Merge PDF</span>
                </>
              )}
            </button>

            {/* Success Download Card */}
            {mergedBlob && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Merge Completed Successfully!</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  Size: {(mergedBlob.size / (1024 * 1024)).toFixed(2)} MB • Ready for download
                </div>
                <button
                  onClick={handleDownloadMerged}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Merged PDF</span>
                </button>
              </div>
            )}

            {/* Document Checklist Metrics */}
            <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500">Total Input Size:</span>
                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{totalInputFormatted}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500">Page Normalization:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{pageSizeMode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500">Continuous Numbering:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {pageNumberingEnabled ? pageNumberFormat : 'Off'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Table of Contents:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{tocEnabled ? 'Enabled' : 'Off'}</span>
              </div>
            </div>

            {/* Additional Export Suite */}
            <div className="border-t border-zinc-150 dark:border-zinc-800 pt-4 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Additional Export Options
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadZipPackage}
                  disabled={files.length === 0 || isProcessing}
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  title="Download all original source PDFs + manifest in a single ZIP"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-amber-500" />
                  <span>ZIP Package</span>
                </button>

                <button
                  onClick={handleCopyManifest}
                  disabled={files.length === 0}
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  title="Copy formatted text manifest schedule of all combined documents"
                >
                  {copiedManifest ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Copy Schedule</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Engine Verification Card */}
          <div className="saas-card p-5 space-y-3 bg-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Client-Side Privacy Shield</span>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Your confidential documents never leave your computer. Merging, pagination, and indexing are performed
              entirely in your local browser WebAssembly memory using pure JavaScript (<code className="text-[10px]">pdf-lib</code>).
            </p>
          </div>

          {/* Pro Tips Card */}
          <div className="saas-card p-5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
              <Info className="w-4 h-4 text-indigo-500" />
              <span>Assembly Pro-Tips</span>
            </div>
            <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5 list-disc pl-4">
              <li>
                <strong>Custom Page Ranges</strong>: Type <code className="text-[10px]">1-3, 5</code> to only include specific pages of a file.
              </li>
              <li>
                <strong>Odd / Even Split</strong>: Enter <code className="text-[10px]">odd</code> or <code className="text-[10px]">even</code> to merge double-sided scans.
              </li>
              <li>
                <strong>Standardization</strong>: Select <code className="text-[10px]">Standard A4</code> to scale mixed blueprints and letter scans into a clean uniform binder.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
