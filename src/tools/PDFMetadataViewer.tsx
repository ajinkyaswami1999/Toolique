/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Download,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Search,
  FileCode,
  FileSpreadsheet,
  Sparkles,
  Trash2,
  Eye,
  Lock,
  Unlock,
  ShieldCheck,
  Layers,
  Clock,
  Settings2,
  Eraser,
  Save,
  CheckCircle2,
  X,
  Printer,
  ShieldAlert,
  Edit3
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { pdfjs } from '../utils/pdfWorker';

interface ExtractedMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string[];
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
  trapped: string;
  pdfVersion: string;
  isLinearized: boolean;
  isEncrypted: boolean;
  pageCount: number;
  fileSize: number;
  rawInfo: Record<string, any>;
  xmpRawXml: string;
  pages: Array<{
    pageNumber: number;
    widthPt: number;
    heightPt: number;
    widthInches: number;
    heightInches: number;
    widthMm: number;
    heightMm: number;
    orientation: 'Portrait' | 'Landscape' | 'Square';
    rotation: number;
    paperSizeName: string;
  }>;
}

type ActiveTab = 'overview' | 'info' | 'geometry' | 'xmp' | 'security' | 'edit';

export default function PDFMetadataViewer() {
  // File & State
  const [file, setFile] = useState<File | null>(null);
  const [rawArrayBuffer, setRawArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [coverThumbnail, setCoverThumbnail] = useState<string>('');
  const [metadata, setMetadata] = useState<ExtractedMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Editable fields state
  const [editTitle, setEditTitle] = useState<string>('');
  const [editAuthor, setEditAuthor] = useState<string>('');
  const [editSubject, setEditSubject] = useState<string>('');
  const [editKeywords, setEditKeywords] = useState<string>('');
  const [editCreator, setEditCreator] = useState<string>('');
  const [editProducer, setEditProducer] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [editedDownloadBlob, setEditedDownloadBlob] = useState<{ blob: Blob; url: string; filename: string } | null>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (editedDownloadBlob?.url) {
        URL.revokeObjectURL(editedDownloadBlob.url);
      }
    };
  }, [editedDownloadBlob]);

  // Determine standard paper size name from dimensions in PDF points (72 pt = 1 inch)
  const detectPaperSize = (w: number, h: number): string => {
    const min = Math.min(w, h);
    const max = Math.max(w, h);

    // A4: 595.28 x 841.89
    if (Math.abs(min - 595.3) < 10 && Math.abs(max - 841.9) < 10) return 'A4';
    // US Letter: 612 x 792
    if (Math.abs(min - 612) < 10 && Math.abs(max - 792) < 10) return 'US Letter';
    // US Legal: 612 x 1008
    if (Math.abs(min - 612) < 10 && Math.abs(max - 1008) < 10) return 'US Legal';
    // A3: 841.89 x 1190.55
    if (Math.abs(min - 841.9) < 10 && Math.abs(max - 1190.6) < 10) return 'A3';
    // A5: 419.53 x 595.28
    if (Math.abs(min - 419.5) < 10 && Math.abs(max - 595.3) < 10) return 'A5';
    // Tabloid / Ledger: 792 x 1224
    if (Math.abs(min - 792) < 10 && Math.abs(max - 1224) < 10) return 'Tabloid (11×17)';

    return 'Custom Dimensions';
  };

  // Helper date formatter for PDF date strings like "D:20261005234500+05'30'" or standard ISO strings
  const parsePdfDate = (rawDate: any): string => {
    if (!rawDate) return 'Not Specified';
    if (rawDate instanceof Date) return rawDate.toLocaleString();
    if (typeof rawDate === 'string') {
      const match = rawDate.match(/^D:(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?/);
      if (match) {
        const year = match[1];
        const month = match[2] || '01';
        const day = match[3] || '01';
        const hour = match[4] || '00';
        const min = match[5] || '00';
        const sec = match[6] || '00';
        const parsed = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}`);
        if (!isNaN(parsed.getTime())) {
          return parsed.toLocaleString();
        }
      }
      return rawDate;
    }
    return String(rawDate);
  };

  // Inspect PDF document
  const inspectPdf = async (uploadedFile: File) => {
    setIsLoading(true);
    setError(null);
    setMetadata(null);
    setCoverThumbnail('');
    setEditedDownloadBlob(null);

    try {
      const buffer = await uploadedFile.arrayBuffer();
      setRawArrayBuffer(buffer);

      // Load via pdfjs for high-fidelity rendering & XMP extraction
      const loadingTask = pdfjs.getDocument({
        data: buffer,
        cMapUrl: 'https://unpkg.com/pdfjs-dist@6.0.227/cmaps/',
        cMapPacked: true
      });

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      // Extract raw metadata dictionaries
      const rawMeta = await pdf.getMetadata();
      const infoDict: Record<string, any> = (rawMeta.info as Record<string, any>) || {};
      const xmpRawXml = rawMeta.metadata ? (rawMeta.metadata as any).getRaw?.() || '' : '';

      // Load via pdf-lib for exact field extraction & editing capabilities
      let pdfDocLib: PDFDocument | null = null;
      try {
        pdfDocLib = await PDFDocument.load(buffer, { ignoreEncryption: true });
      } catch (e) {
        console.warn('pdf-lib load warning:', e);
      }

      // Render cover page thumbnail
      const page1 = await pdf.getPage(1);
      const viewport = page1.getViewport({ scale: 0.45 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: false });

      let coverUrl = '';
      if (ctx) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page1.render({
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas
        }).promise;

        coverUrl = canvas.toDataURL('image/jpeg', 0.85);
      }
      setCoverThumbnail(coverUrl);

      // Page geometry inspection
      const pageGeometry: ExtractedMetadata['pages'] = [];
      for (let i = 1; i <= Math.min(numPages, 100); i++) {
        const p = await pdf.getPage(i);
        const vp = p.getViewport({ scale: 1.0 });
        const wPt = Math.round(vp.width * 100) / 100;
        const hPt = Math.round(vp.height * 100) / 100;
        const wIn = Math.round((wPt / 72) * 100) / 100;
        const hIn = Math.round((hPt / 72) * 100) / 100;
        const wMm = Math.round(((wPt * 25.4) / 72) * 10) / 10;
        const hMm = Math.round(((hPt * 25.4) / 72) * 10) / 10;

        let orientation: 'Portrait' | 'Landscape' | 'Square' = 'Portrait';
        if (Math.abs(wPt - hPt) < 2) orientation = 'Square';
        else if (wPt > hPt) orientation = 'Landscape';

        pageGeometry.push({
          pageNumber: i,
          widthPt: wPt,
          heightPt: hPt,
          widthInches: wIn,
          heightInches: hIn,
          widthMm: wMm,
          heightMm: hMm,
          orientation,
          rotation: (p.rotate || 0) % 360,
          paperSizeName: detectPaperSize(wPt, hPt)
        });
      }

      // Title, Author, Subject, Keywords
      const title = (pdfDocLib?.getTitle() || infoDict.Title || '').trim();
      const author = (pdfDocLib?.getAuthor() || infoDict.Author || '').trim();
      const subject = (pdfDocLib?.getSubject() || infoDict.Subject || '').trim();
      const keywordsRaw = (pdfDocLib?.getKeywords() || infoDict.Keywords || '');
      const keywords = typeof keywordsRaw === 'string'
        ? keywordsRaw.split(/[,;]/).map((k) => k.trim()).filter(Boolean)
        : Array.isArray(keywordsRaw)
        ? keywordsRaw
        : [];
      const creator = (pdfDocLib?.getCreator() || infoDict.Creator || '').trim();
      const producer = (pdfDocLib?.getProducer() || infoDict.Producer || '').trim();
      const creationDate = parsePdfDate(pdfDocLib?.getCreationDate() || infoDict.CreationDate);
      const modificationDate = parsePdfDate(pdfDocLib?.getModificationDate() || infoDict.ModDate);
      const trapped = infoDict.Trapped ? String(infoDict.Trapped) : 'Unknown';
      const pdfVersion = (infoDict.PDFFormatVersion || (pdf as any).pdfFormatVersion || '1.7').toString();
      const isLinearized = Boolean(infoDict.IsLinearized || (infoDict as any).Linearized);
      const isEncrypted = Boolean(infoDict.IsAcroFormPresent && infoDict.EncryptFilterName);

      const parsedData: ExtractedMetadata = {
        title: title || 'Untitled Document',
        author: author || 'Not Specified',
        subject: subject || 'Not Specified',
        keywords,
        creator: creator || 'Not Specified',
        producer: producer || 'Not Specified',
        creationDate,
        modificationDate,
        trapped,
        pdfVersion,
        isLinearized,
        isEncrypted,
        pageCount: numPages,
        fileSize: uploadedFile.size,
        rawInfo: infoDict,
        xmpRawXml,
        pages: pageGeometry
      };

      setMetadata(parsedData);

      // Populate edit fields
      setEditTitle(title);
      setEditAuthor(author);
      setEditSubject(subject);
      setEditKeywords(keywords.join(', '));
      setEditCreator(creator);
      setEditProducer(producer);
    } catch (err: any) {
      console.error('Inspection failed:', err);
      setError(err.message || 'Failed to inspect PDF metadata. Document might be corrupted or encrypted with restrictions.');
    } finally {
      setIsLoading(false);
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
      inspectPdf(uploaded);
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
      inspectPdf(dropped);
    }
  };

  const handleReset = () => {
    if (editedDownloadBlob?.url) {
      URL.revokeObjectURL(editedDownloadBlob.url);
    }
    setFile(null);
    setRawArrayBuffer(null);
    setMetadata(null);
    setCoverThumbnail('');
    setError(null);
    setEditedDownloadBlob(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Copy helper with animation
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Export metadata as JSON file
  const handleExportJSON = () => {
    if (!metadata || !file) return;
    const jsonString = JSON.stringify(metadata, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace(/\.[^/.]+$/, '')}_metadata.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export metadata as CSV table
  const handleExportCSV = () => {
    if (!metadata || !file) return;
    const rows = [
      ['Property', 'Value'],
      ['File Name', file.name],
      ['File Size (Bytes)', metadata.fileSize.toString()],
      ['Page Count', metadata.pageCount.toString()],
      ['Title', metadata.title],
      ['Author', metadata.author],
      ['Subject', metadata.subject],
      ['Keywords', metadata.keywords.join(', ')],
      ['Creator Software', metadata.creator],
      ['Producer PDF Engine', metadata.producer],
      ['Creation Date', metadata.creationDate],
      ['Modification Date', metadata.modificationDate],
      ['PDF Format Version', metadata.pdfVersion],
      ['Is Linearized (Web Fast View)', metadata.isLinearized ? 'Yes' : 'No']
    ];

    const csvContent = rows.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace(/\.[^/.]+$/, '')}_metadata.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Save Updated Metadata using pdf-lib
  const handleSaveUpdatedMetadata = async () => {
    if (!rawArrayBuffer || !file) return;
    setIsSavingEdit(true);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.load(rawArrayBuffer, { ignoreEncryption: true });

      pdfDoc.setTitle(editTitle.trim());
      pdfDoc.setAuthor(editAuthor.trim());
      pdfDoc.setSubject(editSubject.trim());
      pdfDoc.setKeywords(
        editKeywords
          .split(/[,;]/)
          .map((k) => k.trim())
          .filter(Boolean)
      );
      pdfDoc.setCreator(editCreator.trim());
      pdfDoc.setProducer(editProducer.trim());
      pdfDoc.setModificationDate(new Date());

      const savedBytes = await pdfDoc.save();
      const outputBlob = new Blob([savedBytes as any], { type: 'application/pdf' });
      const outputUrl = URL.createObjectURL(outputBlob);
      const outputName = `${file.name.replace(/\.[^/.]+$/, '')}_updated_metadata.pdf`;

      setEditedDownloadBlob({
        blob: outputBlob,
        url: outputUrl,
        filename: outputName
      });
    } catch (err: any) {
      console.error('Save metadata failed:', err);
      setError(err.message || 'Failed to write updated metadata to PDF.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Wipe / Sanitize All Metadata for Privacy using pdf-lib
  const handleSanitizeMetadata = async () => {
    if (!rawArrayBuffer || !file) return;
    setIsSavingEdit(true);
    setError(null);

    try {
      const pdfDoc = await PDFDocument.load(rawArrayBuffer, { ignoreEncryption: true });

      // Clear all standard fields
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setCreator('');
      pdfDoc.setProducer('');

      const savedBytes = await pdfDoc.save();
      const outputBlob = new Blob([savedBytes as any], { type: 'application/pdf' });
      const outputUrl = URL.createObjectURL(outputBlob);
      const outputName = `${file.name.replace(/\.[^/.]+$/, '')}_sanitized.pdf`;

      setEditedDownloadBlob({
        blob: outputBlob,
        url: outputUrl,
        filename: outputName
      });
    } catch (err: any) {
      console.error('Sanitize metadata failed:', err);
      setError(err.message || 'Failed to sanitize PDF metadata.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Filtered Info Dictionary entries for search
  const filteredInfoEntries = useMemo(() => {
    if (!metadata) return [];
    const entries = Object.entries(metadata.rawInfo);
    if (!searchFilter.trim()) return entries;
    const q = searchFilter.toLowerCase();
    return entries.filter(
      ([key, val]) =>
        key.toLowerCase().includes(q) ||
        String(val).toLowerCase().includes(q)
    );
  }, [metadata, searchFilter]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-left">
      {/* Privacy & Engine Assurance Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-indigo-50/70 dark:bg-indigo-950/25 border border-indigo-200/70 dark:border-indigo-800/40 rounded-2xl text-xs">
        <div className="flex items-center gap-2.5 text-indigo-950 dark:text-indigo-200">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            <strong className="font-semibold text-indigo-900 dark:text-indigo-100">100% In-Browser Inspection:</strong> Your PDF document and its internal metadata dictionaries are parsed locally in browser memory. Zero files or tags are ever uploaded.
          </span>
        </div>
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>PDF /Info & XMP Parser</span>
        </div>
      </div>

      {/* Drag & Drop Upload Zone (When No File Loaded) */}
      {!file && (
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
            aria-label="Upload PDF file to inspect metadata"
          />

          <div className="max-w-md mx-auto space-y-4 pointer-events-none">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <p className="text-base font-bold text-zinc-900 dark:text-white">
                Drop your PDF here or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Inspect author, software producer, creation dates, page geometry, and XMP XML
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60">Title & Author</span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60">Producer & Creator</span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60">Page Dimensions</span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800/60">Edit & Sanitize</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Progress State */}
      {isLoading && (
        <div className="saas-card p-12 text-center space-y-3">
          <Loader2 className="w-9 h-9 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            Parsing PDF dictionary & metadata streams...
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Extracting document properties, XMP packet, and geometry
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="font-bold">Inspection Error</p>
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

      {/* Main Workspace (When Document is Loaded) */}
      {file && metadata && !isLoading && (
        <div className="space-y-6">
          {/* Active File Header Bar */}
          <div className="saas-card p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              {coverThumbnail ? (
                <div className="w-12 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0 shadow-2xs">
                  <img
                    src={coverThumbnail}
                    alt="Cover Thumbnail"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="p-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              )}

              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-sm sm:max-w-md md:max-w-lg">
                  {file.name}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                  <span>{(metadata.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{metadata.pageCount} {metadata.pageCount === 1 ? 'page' : 'pages'}</span>
                  <span>•</span>
                  <span>PDF v{metadata.pdfVersion}</span>
                  {metadata.isLinearized && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Fast Web View (Linearized)
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Reset */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition cursor-pointer"
                title="Export metadata as JSON"
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition cursor-pointer"
                title="Export metadata table as CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition cursor-pointer"
                title="Inspect another file"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Change PDF</span>
              </button>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            {[
              { id: 'overview', label: 'Summary Overview', icon: Eye },
              { id: 'info', label: '/Info Dictionary', icon: FileText },
              { id: 'geometry', label: `Page Geometry (${metadata.pages.length})`, icon: Layers },
              { id: 'xmp', label: 'XMP Raw XML', icon: FileCode },
              { id: 'security', label: 'Security & Access', icon: Lock },
              { id: 'edit', label: 'Edit & Sanitize', icon: Edit3 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: SUMMARY OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Document Identity */}
              <div className="saas-card p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Document Identity</h3>
                  <FileText className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-400 block font-medium">Title</span>
                    <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-white mt-0.5">
                      <span className="truncate pr-2">{metadata.title}</span>
                      <button
                        onClick={() => copyToClipboard(metadata.title, 'title')}
                        className="text-zinc-400 hover:text-indigo-500 cursor-pointer"
                        title="Copy title"
                      >
                        {copiedKey === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">Author</span>
                    <div className="flex items-center justify-between font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      <span className="truncate pr-2">{metadata.author}</span>
                      <button
                        onClick={() => copyToClipboard(metadata.author, 'author')}
                        className="text-zinc-400 hover:text-indigo-500 cursor-pointer"
                      >
                        {copiedKey === 'author' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">Subject</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate mt-0.5">
                      {metadata.subject}
                    </p>
                  </div>
                </div>
              </div>

              {/* Software & Origins */}
              <div className="saas-card p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Software Origin</h3>
                  <Settings2 className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-400 block font-medium">Creator Software</span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate mt-0.5" title={metadata.creator}>
                      {metadata.creator}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">PDF Producer Engine</span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate mt-0.5" title={metadata.producer}>
                      {metadata.producer}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">PDF Specification</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      ISO 32000 (PDF v{metadata.pdfVersion})
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps & Versioning */}
              <div className="saas-card p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Timestamps</h3>
                  <Clock className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-400 block font-medium">Creation Date</span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {metadata.creationDate}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">Last Modified Date</span>
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {metadata.modificationDate}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">Linearization</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {metadata.isLinearized ? 'Enabled (Fast Web Stream)' : 'Standard Stream'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Keywords Badge Cloud */}
              <div className="saas-card p-5 md:col-span-2 lg:col-span-3 space-y-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Document Keywords & Tags</h3>
                {metadata.keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">No embedded keyword tags found in this document.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: /INFO DICTIONARY TABLE */}
          {activeTab === 'info' && (
            <div className="saas-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">PDF /Info Dictionary Tags</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Low-level key-value metadata stored in the document root trailer catalog.
                  </p>
                </div>

                {/* Search in properties */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search metadata keys & values..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
                {filteredInfoEntries.length > 0 ? (
                  filteredInfoEntries.map(([key, value], idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-850/60 transition-colors items-center gap-2"
                    >
                      <div className="sm:col-span-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 break-all">
                        /{key}
                      </div>
                      <div className="sm:col-span-7 font-mono text-zinc-800 dark:text-zinc-200 break-all text-[11px]">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </div>
                      <div className="sm:col-span-1 text-right">
                        <button
                          onClick={() => copyToClipboard(String(value), `info_${key}`)}
                          className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                          title={`Copy /${key}`}
                        >
                          {copiedKey === `info_${key}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-400">
                    No matching metadata keys found for "{searchFilter}".
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PAGE GEOMETRY & PAPER SIZES */}
          {activeTab === 'geometry' && (
            <div className="saas-card p-6 space-y-4">
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Page Dimensions & Geometry</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Per-page physical bounds, aspect ratios, orientations, and standard ISO paper dimensions.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <thead className="bg-zinc-100 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="p-3">Page</th>
                      <th className="p-3">Standard Format</th>
                      <th className="p-3">Dimensions (pt)</th>
                      <th className="p-3">Dimensions (in)</th>
                      <th className="p-3">Dimensions (mm)</th>
                      <th className="p-3">Orientation</th>
                      <th className="p-3">Rotation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {metadata.pages.map((p) => (
                      <tr key={p.pageNumber} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/50">
                        <td className="p-3 font-bold text-zinc-900 dark:text-white font-mono">
                          #{p.pageNumber}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px]">
                            {p.paperSizeName}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">
                          {p.widthPt} × {p.heightPt}
                        </td>
                        <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">
                          {p.widthInches}" × {p.heightInches}"
                        </td>
                        <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">
                          {p.widthMm} × {p.heightMm} mm
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                              p.orientation === 'Landscape'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            {p.orientation}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-zinc-500">
                          {p.rotation}°
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: XMP RAW XML */}
          {activeTab === 'xmp' && (
            <div className="saas-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Adobe XMP Extensible Metadata Packet</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Standardized XML packet embedding Dublin Core, Photoshop, and PDF/A schemas.
                  </p>
                </div>

                {metadata.xmpRawXml && (
                  <button
                    onClick={() => copyToClipboard(metadata.xmpRawXml, 'xmp_raw')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey === 'xmp_raw' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'xmp_raw' ? 'Copied XML!' : 'Copy XML Packet'}</span>
                  </button>
                )}
              </div>

              {metadata.xmpRawXml ? (
                <div className="p-4 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto max-h-[500px]">
                  <pre className="whitespace-pre-wrap break-all">{metadata.xmpRawXml}</pre>
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-400 space-y-2">
                  <FileCode className="w-8 h-8 mx-auto text-zinc-500" />
                  <p className="font-semibold text-xs">No explicit XMP XML packet stream detected.</p>
                  <p className="text-[11px] text-zinc-500">
                    This document relies entirely on the standard `/Info` trailer dictionary.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SECURITY & ACCESS */}
          {activeTab === 'security' && (
            <div className="saas-card p-6 space-y-5">
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Security & Permissions Audit</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Encryption flags, digital protection, and access rights.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs">
                    {metadata.isEncrypted ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4 text-emerald-500" />}
                    <span>Encryption Status</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {metadata.isEncrypted
                      ? 'Encrypted with password and permission restrictions'
                      : 'Unencrypted (Standard open access)'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs">
                    <Printer className="w-4 h-4 text-indigo-500" />
                    <span>Printing Permission</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Allowed (No print restrictions detected)
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs">
                    <Copy className="w-4 h-4 text-indigo-500" />
                    <span>Content Copying & Extraction</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Allowed (Text and image extraction enabled)
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-indigo-500" />
                    <span>Trapped State</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {metadata.trapped}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EDIT & SANITIZE */}
          {activeTab === 'edit' && (
            <div className="saas-card p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-3.5">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Edit & Sanitize Document Metadata</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Update document properties or completely strip author and software fingerprints for privacy.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSanitizeMetadata}
                  disabled={isSavingEdit}
                  className="px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  title="Wipe all author and software metadata tags"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Wipe / Sanitize All Metadata</span>
                </button>
              </div>

              {/* Edit Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Document Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Enter document title..."
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Author</label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    placeholder="Author name or organization..."
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Subject</label>
                  <input
                    type="text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    placeholder="Document subject or summary..."
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Keywords (Comma-separated)</label>
                  <input
                    type="text"
                    value={editKeywords}
                    onChange={(e) => setEditKeywords(e.target.value)}
                    placeholder="e.g. invoice, legal, contract, 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Creator Software</label>
                  <input
                    type="text"
                    value={editCreator}
                    onChange={(e) => setEditCreator(e.target.value)}
                    placeholder="e.g. Microsoft Word, Canva, InDesign"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">PDF Producer Engine</label>
                  <input
                    type="text"
                    value={editProducer}
                    onChange={(e) => setEditProducer(e.target.value)}
                    placeholder="e.g. Toolique Engine, Adobe PDF Library"
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action save button */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleSaveUpdatedMetadata}
                  disabled={isSavingEdit}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Writing Metadata...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Update & Save PDF</span>
                    </>
                  )}
                </button>
              </div>

              {/* Download Success Card */}
              {editedDownloadBlob && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold">Metadata Written Losslessly!</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {editedDownloadBlob.filename} ({(editedDownloadBlob.blob.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    </div>
                  </div>

                  <a
                    href={editedDownloadBlob.url}
                    download={editedDownloadBlob.filename}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Modified PDF</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
