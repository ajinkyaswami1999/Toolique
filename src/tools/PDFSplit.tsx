import { useState } from 'react';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export default function PDFSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [splitMode, setSplitMode] = useState<'extract' | 'ranges'>('extract');
  const [pagesInput, setPagesInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [splitResult, setSplitResult] = useState<{ zipBlob?: Blob; singleBlob?: Blob; fileName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setError(null);
      setFile(uploadedFile);
      setSplitResult(null);
    }
  };

  const parsePagesString = (input: string, maxPages: number): number[] => {
    const pages: number[] = [];
    const parts = input.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= maxPages) pages.push(i);
          }
        }
      } else {
        const page = parseInt(trimmed, 10);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          pages.push(page);
        }
      }
    }
    return Array.from(new Set(pages)).sort((a, b) => a - b);
  };

  const parseRangesString = (input: string, maxPages: number): { start: number; end: number }[] => {
    const ranges: { start: number; end: number }[] = [];
    const parts = input.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start <= end && start >= 1 && end <= maxPages) {
          ranges.push({ start, end });
        }
      } else {
        const page = parseInt(trimmed, 10);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          ranges.push({ start: page, end: page });
        }
      }
    }
    return ranges;
  };

  const handleSplit = async () => {
    if (!file) return;
    if (!pagesInput.trim()) {
      setError('Please specify page numbers or ranges.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer);
      const pageCount = srcPdf.getPageCount();

      if (splitMode === 'extract') {
        const pageIndices = parsePagesString(pagesInput, pageCount).map((p) => p - 1);
        if (pageIndices.length === 0) {
          throw new Error('Invalid page numbers. Please check your inputs.');
        }

        const splitPdf = await PDFDocument.create();
        const copiedPages = await splitPdf.copyPages(srcPdf, pageIndices);
        copiedPages.forEach((page) => splitPdf.addPage(page));

        const pdfBytes = await splitPdf.save();
        setSplitResult({
          singleBlob: new Blob([pdfBytes as any], { type: 'application/pdf' }),
          fileName: `${file.name.replace('.pdf', '')}_extracted.pdf`,
        });
      } else {
        const ranges = parseRangesString(pagesInput, pageCount);
        if (ranges.length === 0) {
          throw new Error('Invalid page ranges. Please check your inputs.');
        }

        if (ranges.length === 1) {
          // Single range, download directly as a PDF
          const range = ranges[0];
          const pageIndices = Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start - 1 + i);
          
          const splitPdf = await PDFDocument.create();
          const copiedPages = await splitPdf.copyPages(srcPdf, pageIndices);
          copiedPages.forEach((page) => splitPdf.addPage(page));

          const pdfBytes = await splitPdf.save();
          setSplitResult({
            singleBlob: new Blob([pdfBytes as any], { type: 'application/pdf' }),
            fileName: `${file.name.replace('.pdf', '')}_split_${range.start}-${range.end}.pdf`,
          });
        } else {
          // Multiple ranges, compile into a ZIP
          const zip = new JSZip();

          for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            const pageIndices = Array.from({ length: range.end - range.start + 1 }, (_, idx) => range.start - 1 + idx);
            
            const splitPdf = await PDFDocument.create();
            const copiedPages = await splitPdf.copyPages(srcPdf, pageIndices);
            copiedPages.forEach((page) => splitPdf.addPage(page));

            const pdfBytes = await splitPdf.save();
            zip.file(`${file.name.replace('.pdf', '')}_part_${i + 1}_pages_${range.start}-${range.end}.pdf`, pdfBytes);
          }

          const zipBlob = await zip.generateAsync({ type: 'blob' });
          setSplitResult({
            zipBlob,
            fileName: `${file.name.replace('.pdf', '')}_split_parts.zip`,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while splitting the PDF. Please check your inputs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!splitResult) return;
    const blob = splitResult.zipBlob || splitResult.singleBlob;
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = splitResult.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Configuration Section */}
      <div className="md:col-span-7 space-y-6">
        <div className="saas-card p-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Select PDF File</h3>
          
          {!file ? (
            <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 mx-auto text-zinc-400 dark:text-zinc-650 mb-3" />
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Click to upload or drag & drop PDF</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Single PDF file selection (.pdf)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg shrink-0">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate pr-4">{file.name}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setFile(null); setSplitResult(null); }}
                className="text-xs font-semibold text-red-500 hover:text-red-650 cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {file && (
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Split Settings</h3>
            
            {/* Split Mode Tabs */}
            <div className="flex p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80">
              <button
                onClick={() => { setSplitMode('extract'); setSplitResult(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  splitMode === 'extract'
                    ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-355'
                }`}
              >
                Extract Pages
              </button>
              <button
                onClick={() => { setSplitMode('ranges'); setSplitResult(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  splitMode === 'ranges'
                    ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-355'
                }`}
              >
                Split by Ranges
              </button>
            </div>

            {/* Input fields */}
            {splitMode === 'extract' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Pages to Extract</label>
                <input
                  type="text"
                  value={pagesInput}
                  onChange={(e) => { setPagesInput(e.target.value); setSplitResult(null); }}
                  placeholder="e.g. 1, 3, 5-8"
                  className="saas-input py-2.5"
                />
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed font-semibold">
                  Specify page numbers or ranges separated by commas (e.g. "1, 2, 4-7").
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Split Ranges</label>
                <input
                  type="text"
                  value={pagesInput}
                  onChange={(e) => { setPagesInput(e.target.value); setSplitResult(null); }}
                  placeholder="e.g. 1-2, 3-5"
                  className="saas-input py-2.5"
                />
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed font-semibold">
                  Define custom split boundaries. Multiple ranges will be bundled into a ZIP file.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action / Download Section */}
      <div className="md:col-span-5 space-y-6">
        <div className="saas-card p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white text-left">Actions</h3>
          
          <button
            onClick={handleSplit}
            disabled={!file || isProcessing}
            className="w-full saas-button-primary py-3 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Splitting PDF...</span>
              </>
            ) : (
              <span>Split PDF</span>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2.5 text-left">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {splitResult && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-left space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold">PDF Split Complete!</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-955 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Output File</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
