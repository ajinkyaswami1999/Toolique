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
  FileSpreadsheet,
  Archive,
  Sparkles,
  SlidersHorizontal,
  Trash2,
  ExternalLink,
  Eye,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  Layers,
  ListOrdered,
  CaseSensitive,
  AlignLeft,
  Clock,
  BarChart3,
  X,
  FileCheck,
  Zap,
  Printer
} from 'lucide-react';
import { pdfjs } from '../utils/pdfWorker';
import JSZip from 'jszip';

interface ExtractedPageData {
  pageNumber: number;
  text: string;
  rawLines: string[];
  wordCount: number;
  charCount: number;
  links: string[];
}

type PageDividerStyle = 'dashes' | 'markdown' | 'xml' | 'minimal' | 'none';
type CaseTransformMode = 'original' | 'uppercase' | 'lowercase' | 'titlecase';

export default function ExtractTextPDF() {
  // File & Document State
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

  // Password Decryption Handling
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Configuration State
  const [pageSelectionMode, setPageSelectionMode] = useState<'all' | 'range' | 'custom'>('all');
  const [pageRangeInput, setPageRangeInput] = useState<string>('');
  const [customSelectedPages, setCustomSelectedPages] = useState<Set<number>>(new Set());
  const [pageDividerStyle, setPageDividerStyle] = useState<PageDividerStyle>('dashes');
  const [preserveParagraphs, setPreserveParagraphs] = useState<boolean>(true);
  const [normalizeWhitespace, setNormalizeWhitespace] = useState<boolean>(true);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(false);
  const [caseTransform, setCaseTransform] = useState<CaseTransformMode>('original');
  const [removeLineBreaks, setRemoveLineBreaks] = useState<boolean>(false);

  // Extracted Results State
  const [extractedPages, setExtractedPages] = useState<ExtractedPageData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'combined' | 'byPage' | 'links' | 'stats'>('combined');
  const [selectedPreviewPage, setSelectedPreviewPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Cancellation reference
  const isCancelledRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse and validate custom page range string (e.g. "1-3, 5, 8-10")
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
    setProgress({ current: 0, total: 0, stage: 'Reading file data...', percent: 0 });

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

      // Initialize custom selected pages with all pages by default
      const defaultPages = new Set<number>();
      for (let i = 1; i <= loadedPdf.numPages; i++) {
        defaultPages.add(i);
      }
      setCustomSelectedPages(defaultPages);
      setPageRangeInput(`1-${loadedPdf.numPages}`);
      setSelectedPreviewPage(1);

      // Run automatic text extraction on load
      await extractTextFromPdf(loadedPdf, loadedPdf.numPages);
    } catch (err: any) {
      console.error('PDF load error:', err);
      if (err?.name === 'PasswordException') {
        setIsPasswordProtected(true);
        setPasswordError('This PDF document is password-protected. Please enter password to decrypt.');
      } else {
        setError(err.message || 'Failed to parse PDF document. Ensure the file is a valid, uncorrupted PDF.');
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
      setExtractedPages([]);
      loadPdfDocument(uploaded);
    }
  };

  // Drag & Drop handlers
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
      setExtractedPages([]);
      loadPdfDocument(droppedFile);
    }
  };

  // Extract Text from PDF Pages
  const extractTextFromPdf = async (docInstance?: any, count?: number) => {
    const activeDoc = docInstance || pdfDoc;
    const numPages = count || totalPages;

    if (!activeDoc || !numPages) return;

    setIsProcessing(true);
    setError(null);
    isCancelledRef.current = false;

    const targetPages = resolveTargetPages(numPages);
    const results: ExtractedPageData[] = [];
    const urlRegex = /(https?:\/\/[^\s<>)"'\]]+|www\.[^\s<>)"'\]]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;

    try {
      for (let idx = 0; idx < targetPages.length; idx++) {
        if (isCancelledRef.current) {
          break;
        }

        const pageNum = targetPages[idx];
        const percent = Math.round(((idx + 1) / targetPages.length) * 100);
        setProgress({
          current: idx + 1,
          total: targetPages.length,
          stage: `Extracting text from page ${pageNum} of ${numPages}...`,
          percent
        });

        const page = await activeDoc.getPage(pageNum);
        const textContent = await page.getTextContent({
          includeMarkedContent: false,
          disableCombineTextItems: false
        });

        // Collect Annotation URLs if any
        const pageLinks = new Set<string>();
        try {
          const annotations = await page.getAnnotations();
          for (const annot of annotations) {
            if (annot.url) {
              pageLinks.add(annot.url);
            }
          }
        } catch {
          // Ignore annotation errors gracefully
        }

        // Layout parsing logic with geometry coordinates
        const items = textContent.items as any[];
        let pageText = '';
        let lastY = -1;
        let lastX = -1;
        let lastWidth = 0;

        for (const item of items) {
          if (!item.str && item.str !== ' ') continue;

          const currentY = item.transform ? item.transform[5] : -1;
          const currentX = item.transform ? item.transform[4] : -1;
          const height = item.height || 10;

          if (lastY !== -1 && currentY !== -1) {
            const deltaY = Math.abs(currentY - lastY);
            if (deltaY > height * 1.6) {
              // Paragraph break
              pageText += preserveParagraphs ? '\n\n' : '\n';
              lastX = -1;
            } else if (deltaY > height * 0.4) {
              // Regular line break
              pageText += '\n';
              lastX = -1;
            } else if (lastX !== -1 && currentX !== -1) {
              // Horizontal gap on the same line
              const gap = currentX - (lastX + lastWidth);
              if (gap > 3 && !pageText.endsWith(' ') && !item.str.startsWith(' ')) {
                pageText += ' ';
              }
            }
          }

          pageText += item.str;
          lastY = currentY;
          lastX = currentX;
          lastWidth = item.width || 0;
        }

        // Extract inline regex links
        const matches = pageText.match(urlRegex);
        if (matches) {
          matches.forEach(m => pageLinks.add(m));
        }

        // Normalize spaces if requested
        let cleanText = pageText;
        if (normalizeWhitespace) {
          cleanText = cleanText
            .replace(/[ \t]+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        }

        const words = (cleanText.match(/\S+/g) || []).length;
        const chars = cleanText.length;
        const lines = cleanText.split('\n');

        results.push({
          pageNumber: pageNum,
          text: cleanText,
          rawLines: lines,
          wordCount: words,
          charCount: chars,
          links: Array.from(pageLinks)
        });
      }

      setExtractedPages(results);
      if (results.length > 0 && !results.some(r => r.pageNumber === selectedPreviewPage)) {
        setSelectedPreviewPage(results[0].pageNumber);
      }
    } catch (err: any) {
      console.error('Text extraction failed:', err);
      setError(err.message || 'An error occurred while parsing text. Please ensure the document is valid.');
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0, stage: '', percent: 0 });
    }
  };

  // Cancel running extraction
  const handleCancelExtraction = () => {
    isCancelledRef.current = true;
    setIsProcessing(false);
    setProgress({ current: 0, total: 0, stage: 'Extraction canceled.', percent: 0 });
  };

  // Reset tool
  const handleReset = () => {
    setFile(null);
    setPdfDoc(null);
    setTotalPages(0);
    setExtractedPages([]);
    setError(null);
    setPassword('');
    setIsPasswordProtected(false);
    setPasswordError(null);
    setPageSelectionMode('all');
    setPageRangeInput('');
    setSearchQuery('');
    setActiveTab('combined');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Apply transformations (Case, Line Numbers, Headers) to produce the final string
  const formatTextContent = useCallback((pages: ExtractedPageData[], isFullDoc = true): string => {
    if (!pages || pages.length === 0) return '';

    const formattedPages = pages.map((p) => {
      let pageBody = p.text;

      // Case transform
      if (caseTransform === 'uppercase') {
        pageBody = pageBody.toUpperCase();
      } else if (caseTransform === 'lowercase') {
        pageBody = pageBody.toLowerCase();
      } else if (caseTransform === 'titlecase') {
        pageBody = pageBody.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
      }

      // Remove line breaks if requested
      if (removeLineBreaks) {
        pageBody = pageBody.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();
      }

      // Line numbers
      if (showLineNumbers && !removeLineBreaks) {
        const lines = pageBody.split('\n');
        pageBody = lines
          .map((line, idx) => `${String(idx + 1).padStart(3, '0')} | ${line}`)
          .join('\n');
      }

      if (!isFullDoc) return pageBody;

      // Page dividers
      if (pageDividerStyle === 'dashes') {
        return `--- Page ${p.pageNumber} of ${totalPages} ---\n\n${pageBody}`;
      } else if (pageDividerStyle === 'markdown') {
        return `## Page ${p.pageNumber}\n\n${pageBody}`;
      } else if (pageDividerStyle === 'xml') {
        return `<page number="${p.pageNumber}">\n${pageBody}\n</page>`;
      } else if (pageDividerStyle === 'minimal') {
        return `[Page ${p.pageNumber}]\n${pageBody}`;
      }
      return pageBody;
    });

    return formattedPages.join('\n\n\n');
  }, [totalPages, pageDividerStyle, caseTransform, removeLineBreaks, showLineNumbers]);

  // Combined full document string
  const combinedText = useMemo(() => {
    return formatTextContent(extractedPages, true);
  }, [extractedPages, formatTextContent]);

  // Current selected page single string
  const singlePageText = useMemo(() => {
    const found = extractedPages.find(p => p.pageNumber === selectedPreviewPage);
    if (!found) return '';
    return formatTextContent([found], false);
  }, [extractedPages, selectedPreviewPage, formatTextContent]);

  // All extracted URLs and links across document
  const allLinks = useMemo(() => {
    const linkSet = new Set<string>();
    extractedPages.forEach(p => {
      p.links.forEach(l => linkSet.add(l));
    });
    return Array.from(linkSet);
  }, [extractedPages]);

  // Document Statistics
  const documentStats = useMemo(() => {
    const totalWords = extractedPages.reduce((sum, p) => sum + p.wordCount, 0);
    const totalChars = extractedPages.reduce((sum, p) => sum + p.charCount, 0);
    const totalCharsNoSpaces = combinedText.replace(/\s/g, '').length;
    const totalLines = combinedText.split('\n').length;
    const readingTimeMin = Math.ceil(totalWords / 200);
    const speakingTimeMin = Math.ceil(totalWords / 130);

    return {
      pagesProcessed: extractedPages.length,
      totalWords,
      totalChars,
      totalCharsNoSpaces,
      totalLines,
      readingTimeMin,
      speakingTimeMin,
      linkCount: allLinks.length
    };
  }, [extractedPages, combinedText, allLinks]);

  // Copy helper
  const handleCopyText = (text: string, key = 'all') => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  // Export handlers
  const handleDownloadTxt = (content = combinedText, fileNameSuffix = 'full_text') => {
    if (!content || !file) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = file.name.replace(/\.pdf$/i, '');
    link.download = `${baseName}_${fileNameSuffix}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    if (!combinedText || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    let md = `# Extracted Text: ${file.name}\n\n`;
    md += `*Extracted locally via Toolique on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    extractedPages.forEach(p => {
      md += `## Page ${p.pageNumber}\n\n${p.text}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}_extracted.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    if (!extractedPages.length || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    const data = {
      document: file.name,
      fileSizeBytes: file.size,
      totalPagesInPdf: totalPages,
      extractedPagesCount: extractedPages.length,
      extractedAt: new Date().toISOString(),
      stats: documentStats,
      pages: extractedPages.map(p => ({
        pageNumber: p.pageNumber,
        wordCount: p.wordCount,
        characterCount: p.charCount,
        links: p.links,
        text: p.text
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}_extracted.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    if (!extractedPages.length || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    let csv = 'Page Number,Word Count,Character Count,Links Detected,Text Content\n';

    extractedPages.forEach(p => {
      const sanitizedText = `"${p.text.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      const linksStr = `"${p.links.join('; ')}"`;
      csv += `${p.pageNumber},${p.wordCount},${p.charCount},${linksStr},${sanitizedText}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}_pages.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    if (!extractedPages.length || !file) return;
    const baseName = file.name.replace(/\.pdf$/i, '');
    const zip = new JSZip();

    // 1. Add individual page txt files
    extractedPages.forEach(p => {
      const padNum = String(p.pageNumber).padStart(3, '0');
      zip.file(`page-${padNum}.txt`, p.text);
    });

    // 2. Add complete document file
    zip.file('full_document.txt', combinedText);

    // 3. Add document summary report
    const summary = {
      fileName: file.name,
      fileSizeBytes: file.size,
      totalPages: totalPages,
      extractedPages: extractedPages.length,
      stats: documentStats,
      extractedAt: new Date().toISOString()
    };
    zip.file('summary.json', JSON.stringify(summary, null, 2));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}_pages_archive.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${file?.name || 'Extracted Text'} - Toolique</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            h1 { font-size: 18pt; margin-bottom: 4pt; border-bottom: 2px solid #333; padding-bottom: 8pt; }
            .meta { color: #666; font-size: 10pt; margin-bottom: 24pt; }
            .page-break { page-break-after: always; margin-top: 30pt; padding-top: 20pt; border-top: 1px dashed #ccc; }
            pre { font-family: inherit; white-space: pre-wrap; font-size: 11pt; }
          </style>
        </head>
        <body>
          <h1>${file?.name || 'Extracted PDF Text'}</h1>
          <div class="meta">Extracted securely in browser via Toolique. Total Pages: ${extractedPages.length} | Words: ${documentStats.totalWords}</div>
          <pre>${combinedText}</pre>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto">
      {/* Privacy Guarantee Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>100% Client-Side WebAssembly Processing • Zero Document Uploads • Private in Local RAM</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-rose-700 dark:text-rose-400">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Fast Layout Stream Parser</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Upload, Options, Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upload Card */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-500" />
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
                    ? 'border-rose-500 bg-rose-500/10 dark:bg-rose-500/20 scale-[0.99]'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-rose-500/60 hover:bg-rose-500/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Drop PDF file here or <span className="text-rose-600 dark:text-rose-400">browse</span>
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Supports multi-page documents, manuals, and reports
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

            {/* Password Decryption Box if Protected */}
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

          {/* Configuration & Parsing Settings */}
          {file && totalPages > 0 && (
            <div className="saas-card p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-rose-500" />
                  Extraction Settings
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  {pageSelectionMode === 'all' ? `All ${totalPages} Pages` : 'Filtered Pages'}
                </span>
              </div>

              {/* Page Selection Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  Page Selection
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setPageSelectionMode('all');
                      setTimeout(() => extractTextFromPdf(), 50);
                    }}
                    className={`py-1.5 rounded-lg transition-all text-center cursor-pointer ${
                      pageSelectionMode === 'all'
                        ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs font-black'
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
                        ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs font-black'
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
                        ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs font-black'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Pick ({customSelectedPages.size})
                  </button>
                </div>

                {/* Range input */}
                {pageSelectionMode === 'range' && (
                  <div className="pt-2 space-y-1.5 animate-fadeIn">
                    <input
                      type="text"
                      value={pageRangeInput}
                      onChange={(e) => setPageRangeInput(e.target.value)}
                      placeholder={`e.g. 1-5, 8, 11-${totalPages}`}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => extractTextFromPdf()}
                      className="w-full py-1.5 text-xs font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      Apply Range & Re-Extract
                    </button>
                  </div>
                )}

                {/* Custom Page Picker Chips */}
                {pageSelectionMode === 'custom' && totalPages <= 60 && (
                  <div className="pt-2 max-h-36 overflow-y-auto pr-1 flex flex-wrap gap-1.5 animate-fadeIn">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                      const isSelected = customSelectedPages.has(num);
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            const updated = new Set(customSelectedPages);
                            if (isSelected) {
                              if (updated.size > 1) updated.delete(num);
                            } else {
                              updated.add(num);
                            }
                            setCustomSelectedPages(updated);
                          }}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-750'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Page Dividers Format */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  Page Header / Divider
                </label>
                <select
                  value={pageDividerStyle}
                  onChange={(e) => setPageDividerStyle(e.target.value as PageDividerStyle)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 cursor-pointer"
                >
                  <option value="dashes">--- Page 1 of {totalPages} --- (Standard)</option>
                  <option value="markdown">## Page 1 (Markdown Heading)</option>
                  <option value="xml">&lt;page number="1"&gt; (XML Tags)</option>
                  <option value="minimal">[Page 1] (Compact Tag)</option>
                  <option value="none">No Dividers (Continuous Text Stream)</option>
                </select>
              </div>

              {/* Quick Toggles */}
              <div className="space-y-2.5 pt-1">
                <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-rose-500" />
                    Preserve Paragraph Breaks
                  </span>
                  <input
                    type="checkbox"
                    checked={preserveParagraphs}
                    onChange={(e) => {
                      setPreserveParagraphs(e.target.checked);
                      setTimeout(() => extractTextFromPdf(), 50);
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-zinc-300 dark:border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Trim Extra Whitespace
                  </span>
                  <input
                    type="checkbox"
                    checked={normalizeWhitespace}
                    onChange={(e) => {
                      setNormalizeWhitespace(e.target.checked);
                      setTimeout(() => extractTextFromPdf(), 50);
                    }}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-zinc-300 dark:border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-indigo-500" />
                    Prepend Line Numbers
                  </span>
                  <input
                    type="checkbox"
                    checked={showLineNumbers}
                    onChange={(e) => setShowLineNumbers(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-zinc-300 dark:border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-teal-500" />
                    Continuous Flow (Strip Linebreaks)
                  </span>
                  <input
                    type="checkbox"
                    checked={removeLineBreaks}
                    onChange={(e) => setRemoveLineBreaks(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-zinc-300 dark:border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <span className="flex items-center gap-1.5">
                    <CaseSensitive className="w-3.5 h-3.5 text-purple-500" />
                    Text Case
                  </span>
                  <select
                    value={caseTransform}
                    onChange={(e) => setCaseTransform(e.target.value as CaseTransformMode)}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="original">Original</option>
                    <option value="uppercase">UPPERCASE</option>
                    <option value="lowercase">lowercase</option>
                    <option value="titlecase">Title Case</option>
                  </select>
                </label>
              </div>

              {/* Action Re-Extract Button */}
              <button
                type="button"
                onClick={() => extractTextFromPdf()}
                disabled={isProcessing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Re-Extract Text</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Output Preview & Export Station */}
        <div className="lg:col-span-8 space-y-5">
          {/* Real-time Progress Bar */}
          {isProcessing && (
            <div className="saas-card p-5 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                  <span>{progress.stage || 'Processing document...'}</span>
                </div>
                <span className="font-mono text-rose-600 dark:text-rose-400">{progress.percent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-indigo-600 transition-all duration-200 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-zinc-400">
                <span>Page {progress.current} of {progress.total}</span>
                <button
                  onClick={handleCancelExtraction}
                  className="text-red-500 hover:underline font-bold cursor-pointer"
                >
                  Cancel Extraction
                </button>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs flex items-start gap-3 text-left animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Extraction Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Output Workstation Card */}
          <div className="saas-card p-5 space-y-4">
            {/* Top Toolbar: Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
              {/* Segmented Tab Bar */}
              <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('combined')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'combined'
                      ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs font-black'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Combined Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('byPage')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'byPage'
                      ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs font-black'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Per-Page Viewer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('links')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'links'
                      ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs font-black'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Links ({allLinks.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('stats')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'stats'
                      ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs font-black'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </button>
              </div>

              {/* In-Text Quick Filter / Search */}
              {extractedPages.length > 0 && activeTab !== 'stats' && (
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find in text..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
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

            {/* Quick Metrics Header Strip */}
            {extractedPages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Words</span>
                  <span className="text-base font-black text-zinc-900 dark:text-white">
                    {documentStats.totalWords.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Characters</span>
                  <span className="text-base font-black text-zinc-900 dark:text-white">
                    {documentStats.totalChars.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Pages</span>
                  <span className="text-base font-black text-zinc-900 dark:text-white">
                    {documentStats.pagesProcessed} of {totalPages}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Est. Read Time</span>
                  <span className="text-base font-black text-zinc-900 dark:text-white">
                    {documentStats.readingTimeMin} min
                  </span>
                </div>
              </div>
            )}

            {/* TAB 1: COMBINED TEXT PREVIEW */}
            {activeTab === 'combined' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    Full Document Output Stream
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyText(combinedText, 'all')}
                      disabled={!combinedText}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      {copiedKey === 'all' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied All!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy All</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadTxt()}
                      disabled={!combinedText}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download TXT</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 font-mono text-xs overflow-y-auto max-h-[520px] whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed select-text">
                  {combinedText ? (
                    searchQuery ? (
                      combinedText.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')).map((chunk, i) => (
                        chunk.toLowerCase() === searchQuery.toLowerCase() ? (
                          <mark key={i} className="bg-amber-300 dark:bg-amber-600 text-black dark:text-white px-0.5 rounded">
                            {chunk}
                          </mark>
                        ) : chunk
                      ))
                    ) : (
                      combinedText
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-24 text-zinc-400 space-y-2">
                      <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                      <p className="font-semibold text-xs">No extracted text yet.</p>
                      <p className="text-[11px] text-zinc-400">Upload a PDF document on the left to extract its plain text.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PER-PAGE VIEWER */}
            {activeTab === 'byPage' && (
              <div className="space-y-3">
                {/* Page selector bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Select Page:</span>
                    <select
                      value={selectedPreviewPage}
                      onChange={(e) => setSelectedPreviewPage(Number(e.target.value))}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                    >
                      {extractedPages.map((p) => (
                        <option key={p.pageNumber} value={p.pageNumber}>
                          Page {p.pageNumber} ({p.wordCount} words)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyText(singlePageText, `page-${selectedPreviewPage}`)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === `page-${selectedPreviewPage}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied Page!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Page {selectedPreviewPage}</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadTxt(singlePageText, `page_${selectedPreviewPage}`)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Page TXT</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 font-mono text-xs overflow-y-auto max-h-[480px] whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 leading-relaxed select-text">
                  {singlePageText ? (
                    searchQuery ? (
                      singlePageText.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')).map((chunk, i) => (
                        chunk.toLowerCase() === searchQuery.toLowerCase() ? (
                          <mark key={i} className="bg-amber-300 dark:bg-amber-600 text-black dark:text-white px-0.5 rounded">
                            {chunk}
                          </mark>
                        ) : chunk
                      ))
                    ) : (
                      singlePageText
                    )
                  ) : (
                    <div className="text-center py-16 text-zinc-400">
                      No text extracted for this page.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: EXTRACTED LINKS & EMAILS */}
            {activeTab === 'links' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    Detected Hyperlinks & Emails ({allLinks.length})
                  </span>
                  {allLinks.length > 0 && (
                    <button
                      onClick={() => handleCopyText(allLinks.join('\n'), 'links')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'links' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy All Links</span>
                    </button>
                  )}
                </div>

                {allLinks.length > 0 ? (
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 overflow-hidden divide-y divide-zinc-200/60 dark:divide-zinc-800 max-h-[460px] overflow-y-auto">
                    {allLinks.map((linkUrl, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <ExternalLink className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-mono text-zinc-800 dark:text-zinc-200 truncate">
                            {linkUrl}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleCopyText(linkUrl, `link-${idx}`)}
                            className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition"
                            title="Copy Link"
                          >
                            {copiedKey === `link-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-rose-500 transition"
                            title="Open Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 space-y-1">
                    <ExternalLink className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
                    <p className="text-xs font-semibold">No external hyperlinks or email addresses detected.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ANALYTICS & STATS */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4" />
                      Document Corpus Metrics
                    </h4>
                    <div className="space-y-2 text-xs divide-y divide-zinc-200/50 dark:divide-zinc-800">
                      <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                        <span>Total Words</span>
                        <strong className="text-zinc-900 dark:text-white font-mono">{documentStats.totalWords.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                        <span>Total Characters (with spaces)</span>
                        <strong className="text-zinc-900 dark:text-white font-mono">{documentStats.totalChars.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                        <span>Characters (no spaces)</span>
                        <strong className="text-zinc-900 dark:text-white font-mono">{documentStats.totalCharsNoSpaces.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                        <span>Total Extracted Lines</span>
                        <strong className="text-zinc-900 dark:text-white font-mono">{documentStats.totalLines.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                        <span>Pages Analyzed</span>
                        <strong className="text-zinc-900 dark:text-white font-mono">{documentStats.pagesProcessed} / {totalPages}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Pacing & Readability Estimates
                    </h4>
                    <div className="space-y-2 text-xs divide-y divide-zinc-200/50 dark:divide-zinc-800">
                      <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                        <span>Estimated Silent Reading Time</span>
                        <strong className="text-zinc-900 dark:text-white font-mono">~{documentStats.readingTimeMin} min (200 wpm)</strong>
                      </div>
                      <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                        <span>Estimated Speaking Time</span>
                        <strong className="text-zinc-900 dark:text-white font-mono">~{documentStats.speakingTimeMin} min (130 wpm)</strong>
                      </div>
                      <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                        <span>Average Words per Page</span>
                        <strong className="text-zinc-900 dark:text-white font-mono">
                          {documentStats.pagesProcessed > 0 ? Math.round(documentStats.totalWords / documentStats.pagesProcessed) : 0}
                        </strong>
                      </div>
                      <div className="flex justify-between py-1 text-zinc-600 dark:text-zinc-400">
                        <span>External Links & References</span>
                        <strong className="text-zinc-900 dark:text-white font-mono">{documentStats.linkCount}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Export Master Panel */}
            {extractedPages.length > 0 && (
              <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    Batch Export & Download Options
                  </span>
                  <button
                    onClick={handlePrint}
                    className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Text</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                  <button
                    onClick={() => handleDownloadTxt()}
                    className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-rose-500" />
                    <span>Plain Text (.txt)</span>
                  </button>

                  <button
                    onClick={handleDownloadMarkdown}
                    className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700 transition cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-indigo-500" />
                    <span>Markdown (.md)</span>
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                    <span>Structured JSON</span>
                  </button>

                  <button
                    onClick={handleDownloadCsv}
                    className="p-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex flex-col items-center justify-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700 transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-teal-500" />
                    <span>CSV Table (.csv)</span>
                  </button>

                  <button
                    onClick={handleDownloadZip}
                    className="p-3 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 transition cursor-pointer"
                  >
                    <Archive className="w-4 h-4 text-white" />
                    <span>ZIP Pages Archive</span>
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
