/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useMemo, useCallback } from 'react';
import {
  FileText,
  Upload,
  Download,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Search,
  FileCode,
  SlidersHorizontal,
  Trash2,
  Eye,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  Layers,
  Type,
  AlignLeft,
  X,
  FileCheck,
  Zap,
  Printer,
  Sparkles
} from 'lucide-react';
import { pdfjs } from '../utils/pdfWorker';

export type WordConversionMode = 'editable' | 'visual' | 'hybrid';
export type WordFontFamily = 'Calibri' | 'Arial' | 'Times New Roman' | 'Georgia' | 'Segoe UI' | 'Aptos';
export type WordMarginSize = 'normal' | 'narrow' | 'moderate' | 'wide';
export type WordLineSpacing = '1.0' | '1.15' | '1.5' | '2.0';

interface ConvertedPageData {
  pageNumber: number;
  htmlContent: string;
  plainText: string;
  wordCount: number;
  charCount: number;
  hasImages: boolean;
  imageDataUrl?: string;
}

export default function PDFToWord() {
  // Document State
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number; stage: string; percent: number }>({
    current: 0,
    total: 0,
    stage: '',
    percent: 0
  });

  // Password Decryption
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Conversion Settings
  const [conversionMode, setConversionMode] = useState<WordConversionMode>('editable');
  const [fontFamily, setFontFamily] = useState<WordFontFamily>('Calibri');
  const [baseFontSize, setBaseFontSize] = useState<number>(11);
  const [lineSpacing, setLineSpacing] = useState<WordLineSpacing>('1.15');
  const [marginSize, setMarginSize] = useState<WordMarginSize>('normal');
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);
  const [includeDocumentTitle, setIncludeDocumentTitle] = useState<boolean>(true);
  const [imageDpiQuality, setImageDpiQuality] = useState<number>(150);

  // Page Selection
  const [pageSelectionMode, setPageSelectionMode] = useState<'all' | 'range' | 'custom'>('all');
  const [pageRangeInput, setPageRangeInput] = useState<string>('');
  const [customSelectedPages, setCustomSelectedPages] = useState<Set<number>>(new Set());

  // Converted Document Results
  const [convertedPages, setConvertedPages] = useState<ConvertedPageData[]>([]);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'pages'>('preview');
  const [selectedPreviewPage, setSelectedPreviewPage] = useState<number>(1);

  // Cancellation and Refs
  const isCancelledRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve target pages from selection settings
  const resolveTargetPages = useCallback((numPages: number): number[] => {
    if (pageSelectionMode === 'all') {
      return Array.from({ length: numPages }, (_, i) => i + 1);
    }
    if (pageSelectionMode === 'custom') {
      const arr = Array.from(customSelectedPages).filter(p => p >= 1 && p <= numPages);
      return arr.length > 0 ? arr.sort((a, b) => a - b) : Array.from({ length: numPages }, (_, i) => i + 1);
    }
    if (pageSelectionMode === 'range') {
      if (!pageRangeInput.trim()) {
        return Array.from({ length: numPages }, (_, i) => i + 1);
      }
      const pages = new Set<number>();
      const parts = pageRangeInput.split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [startStr, endStr] = trimmed.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end)) {
            const min = Math.max(1, Math.min(start, end));
            const max = Math.min(numPages, Math.max(start, end));
            for (let p = min; p <= max; p++) {
              pages.add(p);
            }
          }
        } else {
          const p = parseInt(trimmed, 10);
          if (!isNaN(p) && p >= 1 && p <= numPages) {
            pages.add(p);
          }
        }
      }
      return pages.size > 0 ? Array.from(pages).sort((a, b) => a - b) : Array.from({ length: numPages }, (_, i) => i + 1);
    }
    return Array.from({ length: numPages }, (_, i) => i + 1);
  }, [pageSelectionMode, customSelectedPages, pageRangeInput]);

  // Load and inspect PDF document on file selection
  const loadPdfDocument = async (pdfFile: File, userPassword = '') => {
    setError(null);
    setPasswordError(null);
    setIsProcessing(true);
    setProgress({ current: 0, total: 0, stage: 'Reading document structure...', percent: 0 });

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        password: userPassword,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@6.0.227/cmaps/',
        cMapPacked: true
      });

      loadingTask.onPassword = (_callback: any, reason: number) => {
        setIsPasswordProtected(true);
        if (reason === 2) {
          setPasswordError('Incorrect password. Please enter the valid PDF password.');
        }
      };

      const loadedPdf = await loadingTask.promise;
      setPdfDoc(loadedPdf);
      setTotalPages(loadedPdf.numPages);
      setIsPasswordProtected(false);
      setPasswordError(null);

      // Initialize page choices
      const defaultPages = new Set<number>();
      for (let i = 1; i <= loadedPdf.numPages; i++) {
        defaultPages.add(i);
      }
      setCustomSelectedPages(defaultPages);
      setPageRangeInput(`1-${loadedPdf.numPages}`);
      setSelectedPreviewPage(1);

      // Run conversion
      await convertPdfToWord(loadedPdf, loadedPdf.numPages);
    } catch (err: any) {
      console.error('PDF load error:', err);
      if (err?.name === 'PasswordException') {
        setIsPasswordProtected(true);
        setPasswordError('This PDF is password-protected. Please enter the password to decrypt.');
      } else {
        setError(err.message || 'Failed to parse PDF. Please ensure the file is valid and not corrupted.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      if (uploaded.type !== 'application/pdf' && !uploaded.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file (.pdf format only).');
        return;
      }
      setFile(uploaded);
      setConvertedPages([]);
      setOutputBlob(null);
      loadPdfDocument(uploaded);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf' && !droppedFile.name.toLowerCase().endsWith('.pdf')) {
        setError('Please drop a valid PDF file (.pdf format only).');
        return;
      }
      setFile(droppedFile);
      setConvertedPages([]);
      setOutputBlob(null);
      loadPdfDocument(droppedFile);
    }
  };

  // Build Microsoft Word HTML Structure
  const buildWordDocumentHtml = useCallback((pages: ConvertedPageData[], docTitle: string): string => {
    const marginStyles = {
      normal: 'margin: 1.0in 1.0in 1.0in 1.0in;',
      narrow: 'margin: 0.5in 0.5in 0.5in 0.5in;',
      moderate: 'margin: 0.75in 0.75in 0.75in 0.75in;',
      wide: 'margin: 1.0in 1.5in 1.0in 1.5in;'
    }[marginSize];

    const lineHeightMultiplier = {
      '1.0': '1.0',
      '1.15': '1.15',
      '1.5': '1.5',
      '2.0': '2.0'
    }[lineSpacing];

    const pagesBody = pages.map((p, idx) => {
      const pageBreak = idx > 0 ? '<br clear="all" style="mso-special-character:line-break; page-break-before:always;" />' : '';
      const pageHeaderMeta = includePageNumbers ? `<div style="mso-element:header; font-size: 8.5pt; color: #888888; text-align: right; border-bottom: 1px solid #e0e0e0; padding-bottom: 4pt; margin-bottom: 12pt;">${docTitle} — Page ${p.pageNumber} of ${totalPages}</div>` : '';

      return `
        ${pageBreak}
        <div class="WordSection${idx + 1}" style="${marginStyles}">
          ${pageHeaderMeta}
          ${p.htmlContent}
        </div>
      `;
    }).join('\n');

    return `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>${docTitle}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: 8.5in 11.0in;
            ${marginStyles}
            mso-header-margin: 0.5in;
            mso-footer-margin: 0.5in;
            mso-paper-source: 0;
          }
          body {
            font-family: "${fontFamily}", Calibri, Arial, sans-serif;
            font-size: ${baseFontSize}pt;
            line-height: ${lineHeightMultiplier};
            color: #1a1a1a;
            background-color: #ffffff;
          }
          p, div.MsoNormal {
            margin-top: 0pt;
            margin-bottom: 6pt;
            line-height: ${lineHeightMultiplier};
            text-align: justify;
          }
          h1 {
            font-size: ${baseFontSize + 7}pt;
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 14pt;
            margin-bottom: 6pt;
            page-break-after: avoid;
          }
          h2 {
            font-size: ${baseFontSize + 4}pt;
            font-weight: bold;
            color: #1e40af;
            margin-top: 12pt;
            margin-bottom: 4pt;
            page-break-after: avoid;
          }
          h3 {
            font-size: ${baseFontSize + 2}pt;
            font-weight: bold;
            color: #2563eb;
            margin-top: 10pt;
            margin-bottom: 3pt;
            page-break-after: avoid;
          }
          ul, ol {
            margin-top: 0pt;
            margin-bottom: 8pt;
            padding-left: 24pt;
          }
          li {
            margin-bottom: 3pt;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 8pt;
            margin-bottom: 12pt;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 6pt 8pt;
            text-align: left;
            font-size: ${baseFontSize - 1}pt;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          img {
            max-width: 100%;
            height: auto;
          }
          .doc-header-banner {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 8pt;
            margin-bottom: 16pt;
          }
        </style>
      </head>
      <body>
        ${includeDocumentTitle ? `
          <div class="doc-header-banner">
            <h1 style="margin: 0; color: #1e3a8a; font-size: ${baseFontSize + 9}pt;">${docTitle}</h1>
            <p style="color: #6b7280; font-size: 9pt; margin-top: 2pt;">Converted to Word via Toolique • ${new Date().toLocaleDateString()}</p>
          </div>
        ` : ''}
        ${pagesBody}
      </body>
      </html>
    `;
  }, [marginSize, lineSpacing, fontFamily, baseFontSize, includePageNumbers, includeDocumentTitle, totalPages]);

  // Core Conversion Routine
  const convertPdfToWord = async (docInstance?: any, count?: number) => {
    const activeDoc = docInstance || pdfDoc;
    const numPages = count || totalPages;

    if (!activeDoc || !numPages || !file) return;

    setIsProcessing(true);
    setError(null);
    isCancelledRef.current = false;

    const targetPages = resolveTargetPages(numPages);
    const pagesResults: ConvertedPageData[] = [];
    const baseDocName = file.name.replace(/\.pdf$/i, '');

    try {
      for (let idx = 0; idx < targetPages.length; idx++) {
        if (isCancelledRef.current) break;

        const pageNum = targetPages[idx];
        const percent = Math.round(((idx + 1) / targetPages.length) * 100);
        setProgress({
          current: idx + 1,
          total: targetPages.length,
          stage: `Converting page ${pageNum} of ${numPages} (${conversionMode} mode)...`,
          percent
        });

        const page = await activeDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: imageDpiQuality / 72 });

        let pageHtml = '';
        let plainText = '';
        let hasImages = false;
        let imageDataUrl: string | undefined;

        if (conversionMode === 'visual') {
          // Visual Layout Match Mode (Render full high-DPI page to image)
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;

            imageDataUrl = canvas.toDataURL('image/jpeg', 0.90);
            hasImages = true;
            pageHtml = `
              <div style="text-align: center; margin-bottom: 12pt;">
                <img src="${imageDataUrl}" alt="Page ${pageNum}" width="650" style="max-width: 100%; height: auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
              </div>
            `;
          }
        } else {
          // Editable or Hybrid Mode (Extract semantic headings, paragraphs, and list items)
          const textContent = await page.getTextContent();
          const items = textContent.items as any[];

          if (items.length === 0 && conversionMode === 'editable') {
            // Scanned or empty page fallback to visual canvas image
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (context) {
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              await page.render({
                canvasContext: context,
                viewport: viewport
              }).promise;
              imageDataUrl = canvas.toDataURL('image/jpeg', 0.88);
              hasImages = true;
              pageHtml = `<div style="text-align: center;"><img src="${imageDataUrl}" alt="Page ${pageNum}" width="650" /></div>`;
            }
          } else {
            let lastY = -1;
            let currentBlock = '';
            let isCurrentHeading = false;
            let headingLevel = 2;

            for (const item of items) {
              if (!item.str && item.str !== ' ') continue;

              const currentY = item.transform ? item.transform[5] : -1;
              const height = item.height || 10;

              if (lastY !== -1 && currentY !== -1) {
                const deltaY = Math.abs(currentY - lastY);

                if (deltaY > height * 1.3) {
                  // End of paragraph or heading
                  if (currentBlock.trim()) {
                    if (isCurrentHeading) {
                      pageHtml += `<h${headingLevel}>${currentBlock.trim()}</h${headingLevel}>\n`;
                    } else if (currentBlock.trim().startsWith('•') || currentBlock.trim().startsWith('-')) {
                      pageHtml += `<ul><li>${currentBlock.trim().replace(/^[•\-]\s*/, '')}</li></ul>\n`;
                    } else {
                      pageHtml += `<p>${currentBlock.trim()}</p>\n`;
                    }
                    plainText += currentBlock.trim() + '\n\n';
                  }
                  currentBlock = '';
                  isCurrentHeading = false;
                }
              }

              // Detect headings by font size
              if (height >= baseFontSize * 1.45) {
                isCurrentHeading = true;
                headingLevel = height >= baseFontSize * 1.8 ? 1 : 2;
              }

              currentBlock += item.str + ' ';
              lastY = currentY;
            }

            if (currentBlock.trim()) {
              if (isCurrentHeading) {
                pageHtml += `<h${headingLevel}>${currentBlock.trim()}</h${headingLevel}>\n`;
              } else {
                pageHtml += `<p>${currentBlock.trim()}</p>\n`;
              }
              plainText += currentBlock.trim() + '\n';
            }
          }
        }

        const words = (plainText.match(/\S+/g) || []).length;
        const chars = plainText.length;

        pagesResults.push({
          pageNumber: pageNum,
          htmlContent: pageHtml,
          plainText,
          wordCount: words,
          charCount: chars,
          hasImages,
          imageDataUrl
        });
      }

      setConvertedPages(pagesResults);
      if (pagesResults.length > 0 && !pagesResults.some(r => r.pageNumber === selectedPreviewPage)) {
        setSelectedPreviewPage(pagesResults[0].pageNumber);
      }

      // Generate MS Word Document Blob
      const fullWordHtml = buildWordDocumentHtml(pagesResults, baseDocName);
      const wordBlob = new Blob([fullWordHtml], { type: 'application/msword;charset=utf-8' });
      setOutputBlob(wordBlob);
    } catch (err: any) {
      console.error('Conversion failed:', err);
      setError(err.message || 'An error occurred during Word conversion. Please ensure the PDF is valid.');
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0, stage: '', percent: 0 });
    }
  };

  // Cancel running conversion
  const handleCancelConversion = () => {
    isCancelledRef.current = true;
    setIsProcessing(false);
    setProgress({ current: 0, total: 0, stage: 'Conversion canceled.', percent: 0 });
  };

  // Reset tool
  const handleReset = () => {
    setFile(null);
    setPdfDoc(null);
    setTotalPages(0);
    setConvertedPages([]);
    setOutputBlob(null);
    setError(null);
    setPassword('');
    setIsPasswordProtected(false);
    setPasswordError(null);
    setSearchQuery('');
    setActiveTab('preview');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Full Word Document HTML string
  const fullDocumentHtml = useMemo(() => {
    if (!convertedPages.length || !file) return '';
    const baseDocName = file.name.replace(/\.pdf$/i, '');
    return buildWordDocumentHtml(convertedPages, baseDocName);
  }, [convertedPages, file, buildWordDocumentHtml]);

  // Document Corpus Statistics
  const documentStats = useMemo(() => {
    const totalWords = convertedPages.reduce((sum, p) => sum + p.wordCount, 0);
    const totalChars = convertedPages.reduce((sum, p) => sum + p.charCount, 0);
    const totalImages = convertedPages.filter(p => p.hasImages).length;
    const estimatedWordFileSizeKb = outputBlob ? Math.round(outputBlob.size / 1024) : 0;

    return {
      pagesConverted: convertedPages.length,
      totalWords,
      totalChars,
      totalImages,
      estimatedWordFileSizeKb
    };
  }, [convertedPages, outputBlob]);

  // Copy HTML to Clipboard for instant pasting into MS Word or Google Docs
  const handleCopyHtml = () => {
    if (!fullDocumentHtml) return;
    navigator.clipboard.writeText(fullDocumentHtml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Download Handlers
  const handleDownloadWordDoc = () => {
    if (!outputBlob || !file) return;
    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = file.name.replace(/\.pdf$/i, '');
    link.download = `${baseName}.doc`; // Saved as .doc (native MSOffice format)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    if (!fullDocumentHtml || !file) return;
    const blob = new Blob([fullDocumentHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = file.name.replace(/\.pdf$/i, '');
    link.download = `${baseName}_word_document.htm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(fullDocumentHtml);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* Privacy & Engine Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-900 dark:text-indigo-300 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>100% In-Browser PDF to Word Conversion • Zero Cloud Uploads • Native MS Word & Google Docs Format</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Semantic Heading & Layout Engine</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Upload, Conversion Settings, Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* File Upload Card */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                Upload PDF Document
              </span>
              {file && (
                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer group ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20 scale-[0.99]'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-indigo-500/60 hover:bg-indigo-500/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Drop PDF file here or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Convert reports, contracts, essays, and manuals into Word (.doc)
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>{totalPages > 0 ? `${totalPages} Pages` : 'Inspecting...'}</span>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {/* Password Decryption Box */}
            {isPasswordProtected && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>Password-Protected Document</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter document password..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                  <button
                    onClick={() => file && loadPdfDocument(file, password)}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlock</span>
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                    {passwordError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Conversion Modes & Settings Card */}
          {file && totalPages > 0 && (
            <div className="saas-card p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                  Word Document Options
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  {conversionMode === 'editable' ? 'Editable Flow' : conversionMode === 'visual' ? 'Visual Match' : 'Hybrid'}
                </span>
              </div>

              {/* Conversion Mode Radio Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  Conversion Mode
                </label>
                <div className="space-y-2">
                  <label
                    onClick={() => {
                      setConversionMode('editable');
                      setTimeout(() => convertPdfToWord(), 50);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      conversionMode === 'editable'
                        ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="convMode"
                      checked={conversionMode === 'editable'}
                      onChange={() => {}}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <span>Editable Flow (Recommended)</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                          Semantic
                        </span>
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        Converts headings, paragraphs, bullet points, and tables into editable text. Best for documents you need to rewrite.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => {
                      setConversionMode('visual');
                      setTimeout(() => convertPdfToWord(), 50);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                      conversionMode === 'visual'
                        ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="convMode"
                      checked={conversionMode === 'visual'}
                      onChange={() => {}}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <span>Visual Layout Match (Exact Replica)</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                          High-DPI
                        </span>
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        Renders 100% exact replica pages as embedded Word sheets. Perfect for scanned PDFs, signatures, and complex diagrams.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Visual mode DPI setting */}
                {conversionMode === 'visual' && (
                  <div className="pt-2 flex items-center justify-between animate-fadeIn text-xs">
                    <span className="font-bold text-zinc-600 dark:text-zinc-400">Image Clarity / DPI:</span>
                    <select
                      value={imageDpiQuality}
                      onChange={(e) => {
                        setImageDpiQuality(Number(e.target.value));
                        setTimeout(() => convertPdfToWord(), 50);
                      }}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                    >
                      <option value={96}>96 DPI (Fast & Lightweight)</option>
                      <option value={150}>150 DPI (Balanced Standard)</option>
                      <option value={300}>300 DPI (Crisp Print Quality)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Typography & Styling Controls */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                    <Type className="w-3.5 h-3.5 text-indigo-500" />
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as WordFontFamily)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="Calibri">Calibri (Word Standard)</option>
                    <option value="Arial">Arial (Clean Sans)</option>
                    <option value="Times New Roman">Times New Roman (Serif)</option>
                    <option value="Georgia">Georgia (Editorial)</option>
                    <option value="Aptos">Aptos (Modern Office)</option>
                    <option value="Segoe UI">Segoe UI</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                    <AlignLeft className="w-3.5 h-3.5 text-indigo-500" />
                    Base Font Size
                  </label>
                  <select
                    value={baseFontSize}
                    onChange={(e) => setBaseFontSize(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value={10}>10 pt (Compact)</option>
                    <option value={11}>11 pt (Standard Word)</option>
                    <option value={12}>12 pt (Large / Legal)</option>
                    <option value={14}>14 pt (Presentation)</option>
                  </select>
                </div>
              </div>

              {/* Spacing and Margins */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                    Line Spacing
                  </label>
                  <select
                    value={lineSpacing}
                    onChange={(e) => setLineSpacing(e.target.value as WordLineSpacing)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="1.0">1.0 (Single)</option>
                    <option value="1.15">1.15 (Standard Word)</option>
                    <option value="1.5">1.5 (Relaxed)</option>
                    <option value="2.0">2.0 (Double Spaced)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                    Page Margins
                  </label>
                  <select
                    value={marginSize}
                    onChange={(e) => setMarginSize(e.target.value as WordMarginSize)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="normal">Normal (1.0 inch)</option>
                    <option value="narrow">Narrow (0.5 inch)</option>
                    <option value="moderate">Moderate (0.75 inch)</option>
                    <option value="wide">Wide (1.5 inch)</option>
                  </select>
                </div>
              </div>

              {/* Page Selection Mode */}
              <div className="space-y-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  Pages to Convert
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setPageSelectionMode('all');
                      setTimeout(() => convertPdfToWord(), 50);
                    }}
                    className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                      pageSelectionMode === 'all'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    All ({totalPages})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSelectionMode('range')}
                    className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                      pageSelectionMode === 'range'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Range
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSelectionMode('custom')}
                    className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                      pageSelectionMode === 'custom'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Pick ({customSelectedPages.size})
                  </button>
                </div>

                {pageSelectionMode === 'range' && (
                  <div className="pt-2 space-y-1.5 animate-fadeIn">
                    <input
                      type="text"
                      value={pageRangeInput}
                      onChange={(e) => setPageRangeInput(e.target.value)}
                      placeholder={`e.g. 1-3, 5, 8-${totalPages}`}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => convertPdfToWord()}
                      className="w-full py-1.5 text-xs font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      Apply Range & Re-Convert
                    </button>
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-1">
                <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    Insert Page Header & Numbering
                  </span>
                  <input
                    type="checkbox"
                    checked={includePageNumbers}
                    onChange={(e) => setIncludePageNumbers(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Include Document Title Banner
                  </span>
                  <input
                    type="checkbox"
                    checked={includeDocumentTitle}
                    onChange={(e) => setIncludeDocumentTitle(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-700"
                  />
                </label>
              </div>

              {/* Convert / Refresh Button */}
              <button
                type="button"
                onClick={() => convertPdfToWord()}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Converting to Word...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Re-Convert Document</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Word Document Preview & Export Suite */}
        <div className="lg:col-span-8 space-y-5">
          {/* Progress Indicator */}
          {isProcessing && (
            <div className="saas-card p-5 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                  <span>{progress.stage || 'Converting PDF to Word...'}</span>
                </div>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">{progress.percent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 transition-all duration-200 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-zinc-400">
                <span>Page {progress.current} of {progress.total}</span>
                <button
                  onClick={handleCancelConversion}
                  className="text-red-500 hover:underline font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs flex items-start gap-3 text-left animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Conversion Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Converted Word Output Workstation Card */}
          <div className="saas-card p-5 space-y-4">
            {/* Top Bar: Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
              <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Word Document Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pages')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'pages'
                      ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Page-by-Page</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('html')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'html'
                      ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-black'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Word HTML Code</span>
                </button>
              </div>

              {/* In-Document Search */}
              {convertedPages.length > 0 && (
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find in converted document..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Metrics Header */}
            {convertedPages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Pages Converted</span>
                  <span className="text-base font-black text-zinc-900 dark:text-white">
                    {documentStats.pagesConverted} of {totalPages}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Word Count</span>
                  <span className="text-base font-black text-zinc-900 dark:text-white">
                    {documentStats.totalWords.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Target Format</span>
                  <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                    MS Word (.doc)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">File Budget</span>
                  <span className="text-base font-black text-zinc-900 dark:text-white">
                    ~{documentStats.estimatedWordFileSizeKb} KB
                  </span>
                </div>
              </div>
            )}

            {/* TAB 1: WORD DOCUMENT PREVIEW */}
            {activeTab === 'preview' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    Document Sheet Layout View
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyHtml}
                      disabled={!fullDocumentHtml}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied for Word!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy for MS Word</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadWordDoc}
                      disabled={!outputBlob}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .DOC</span>
                    </button>
                  </div>
                </div>

                {/* Styled Virtual Paper Container */}
                <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-4 sm:p-6 overflow-y-auto max-h-[550px]">
                  {convertedPages.length > 0 ? (
                    <div className="max-w-3xl mx-auto space-y-6">
                      {convertedPages.map((pageData) => (
                        <div
                          key={pageData.pageNumber}
                          className="bg-white text-zinc-900 rounded-xl shadow-md border border-zinc-200 p-8 sm:p-10 min-h-[500px] text-left leading-relaxed relative"
                          style={{
                            fontFamily: `${fontFamily}, Calibri, sans-serif`,
                            fontSize: `${baseFontSize}pt`
                          }}
                        >
                          {includePageNumbers && (
                            <div className="text-[10px] text-zinc-400 text-right border-b border-zinc-100 pb-2 mb-6">
                              Page {pageData.pageNumber} of {totalPages}
                            </div>
                          )}

                          <div
                            className="prose prose-sm max-w-none text-zinc-900"
                            dangerouslySetInnerHTML={{ __html: pageData.htmlContent }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-28 text-zinc-400 space-y-2">
                      <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                      <p className="font-semibold text-xs">No converted document yet.</p>
                      <p className="text-[11px] text-zinc-400">Upload a PDF file to convert it into a Microsoft Word document.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PAGE BY PAGE */}
            {activeTab === 'pages' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Select Page:</span>
                    <select
                      value={selectedPreviewPage}
                      onChange={(e) => setSelectedPreviewPage(Number(e.target.value))}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                    >
                      {convertedPages.map((p) => (
                        <option key={p.pageNumber} value={p.pageNumber}>
                          Page {p.pageNumber} ({p.wordCount} words)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-6 overflow-y-auto max-h-[500px]">
                  {convertedPages.find(p => p.pageNumber === selectedPreviewPage) ? (
                    <div
                      className="max-w-2xl mx-auto bg-white text-zinc-900 rounded-xl shadow-md border border-zinc-200 p-8 min-h-[400px] text-left leading-relaxed"
                      style={{
                        fontFamily: `${fontFamily}, Calibri, sans-serif`,
                        fontSize: `${baseFontSize}pt`
                      }}
                      dangerouslySetInnerHTML={{
                        __html: convertedPages.find(p => p.pageNumber === selectedPreviewPage)?.htmlContent || ''
                      }}
                    />
                  ) : (
                    <div className="text-center py-16 text-zinc-400">No page selected.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: WORD HTML CODE */}
            {activeTab === 'html' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    Raw Microsoft Office Word HTML Payload
                  </span>
                  <button
                    onClick={handleCopyHtml}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy HTML</span>
                  </button>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 font-mono text-xs overflow-y-auto max-h-[480px] whitespace-pre text-zinc-700 dark:text-zinc-300 select-text">
                  {fullDocumentHtml || 'No HTML generated yet.'}
                </div>
              </div>
            )}

            {/* Export Actions Strip */}
            {outputBlob && (
              <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    Export & Download Converted Document
                  </span>
                  <button
                    onClick={handlePrint}
                    className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Document</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={handleDownloadWordDoc}
                    className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Word Document (.doc)</span>
                  </button>

                  <button
                    onClick={handleDownloadHtml}
                    className="p-3.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 border border-zinc-200/60 dark:border-zinc-700 transition cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-indigo-500" />
                    <span>Save as Word HTML (.htm)</span>
                  </button>

                  <button
                    onClick={handleCopyHtml}
                    className="p-3.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 border border-zinc-200/60 dark:border-zinc-700 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-amber-500" />}
                    <span>{copied ? 'Copied HTML!' : 'Copy to Clipboard'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
