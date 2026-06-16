import { useState } from 'react';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Loader2, Hash } from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default function PDFPageNumbering() {
  const [file, setFile] = useState<File | null>(null);
  
  // Settings
  const [numFormat, setNumFormat] = useState<'plain' | 'page-x' | 'page-x-y'>('page-x');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right' | 'top-center' | 'top-left'>('bottom-right');
  const [fontSize, setFontSize] = useState<number>(10);
  const [fontColor, setFontColor] = useState<string>('#6b7280'); // Zinc gray default
  const [margin, setMargin] = useState<number>(30);
  const [startPage, setStartPage] = useState<number>(1);
  const [skipFirstPage, setSkipFirstPage] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [numberedBlob, setNumberedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setError(null);
      setFile(uploadedFile);
      setNumberedBlob(null);
    }
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    return { r, g, b };
  };

  const handleAddNumbers = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const pageCount = pages.length;

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const rgbColor = hexToRgb(fontColor);

      const startIndex = skipFirstPage ? 1 : 0;

      for (let i = startIndex; i < pageCount; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        // Calculate dynamic page number index based on startPage setting
        const visualPageNum = i - startIndex + startPage;
        
        let text = `${visualPageNum}`;
        if (numFormat === 'page-x') {
          text = `Page ${visualPageNum}`;
        } else if (numFormat === 'page-x-y') {
          text = `Page ${visualPageNum} of ${pageCount - startIndex + startPage - 1}`;
        }

        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = fontSize;

        let x = width - margin - textWidth;
        let y = margin;

        if (position === 'bottom-center') {
          x = (width - textWidth) / 2;
          y = margin;
        } else if (position === 'bottom-left') {
          x = margin;
          y = margin;
        } else if (position === 'top-right') {
          x = width - margin - textWidth;
          y = height - margin - textHeight;
        } else if (position === 'top-center') {
          x = (width - textWidth) / 2;
          y = height - margin - textHeight;
        } else if (position === 'top-left') {
          x = margin;
          y = height - margin - textHeight;
        }

        page.drawText(text, {
          x: x,
          y: y,
          size: fontSize,
          font: font,
          color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setNumberedBlob(blob);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while numbering pages. Ensure the PDF is not encrypted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!numberedBlob || !file) return;
    const url = URL.createObjectURL(numberedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}_numbered.pdf`;
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
                onClick={() => { setFile(null); setNumberedBlob(null); }}
                className="text-xs font-semibold text-red-500 hover:text-red-650 cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {file && (
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Page Numbering Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Number Format</label>
                <select
                  value={numFormat}
                  onChange={(e) => { setNumFormat(e.target.value as any); setNumberedBlob(null); }}
                  className="saas-select"
                >
                  <option value="plain">1, 2, 3... (Plain Number)</option>
                  <option value="page-x">Page X</option>
                  <option value="page-x-y">Page X of Y</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Position</label>
                <select
                  value={position}
                  onChange={(e) => { setPosition(e.target.value as any); setNumberedBlob(null); }}
                  className="saas-select"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Font Size (pt)</label>
                <input
                  type="number"
                  value={fontSize}
                  onChange={(e) => { setFontSize(parseInt(e.target.value, 10) || 10); setNumberedBlob(null); }}
                  className="saas-input py-2"
                  min="6"
                  max="32"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Margin (px)</label>
                <input
                  type="number"
                  value={margin}
                  onChange={(e) => { setMargin(parseInt(e.target.value, 10) || 20); setNumberedBlob(null); }}
                  className="saas-input py-2"
                  min="10"
                  max="100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Start Page Value</label>
                <input
                  type="number"
                  value={startPage}
                  onChange={(e) => { setStartPage(parseInt(e.target.value, 10) || 1); setNumberedBlob(null); }}
                  className="saas-input py-2"
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Font Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => { setFontColor(e.target.value); setNumberedBlob(null); }}
                    className="w-10 h-10 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase">{fontColor}</span>
                </div>
              </div>

              <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={skipFirstPage}
                  onChange={(e) => { setSkipFirstPage(e.target.checked); setNumberedBlob(null); }}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800"
                />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Skip First Page (Cover page)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Control / Actions */}
      <div className="md:col-span-5 space-y-6">
        <div className="saas-card p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white text-left">Actions</h3>

          <button
            onClick={handleAddNumbers}
            disabled={!file || isProcessing}
            className="w-full saas-button-primary py-3 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Processing page numbers...</span>
              </>
            ) : (
              <>
                <Hash className="w-4.5 h-4.5" />
                <span>Add Page Numbers</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2.5 text-left">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {numberedBlob && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-left space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold">PDF Numbering Complete!</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Numbered PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
