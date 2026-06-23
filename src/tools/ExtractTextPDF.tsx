import { useState } from 'react';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ExtractTextPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setError(null);
      setFile(uploadedFile);
      setExtractedText('');
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgressText('Loading document...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      let fullText = '';

      for (let i = 1; i <= numPages; i++) {
        setProgressText(`Parsing page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Join all text items on this page
        let pageText = '';
        let lastY = -1;
        
        for (const item of textContent.items as any[]) {
          // Check if item has coordinates (transform matrix has Y coordinate in index 5)
          const currentY = item.transform?.[5];
          
          if (lastY !== -1 && Math.abs(currentY - lastY) > 8) {
            // New line if coordinates shifted significantly
            pageText += '\n';
          }
          
          pageText += (item.str || '') + ' ';
          lastY = currentY;
        }

        fullText += `--- Page ${i} ---\n${pageText.trim()}\n\n`;
      }

      setExtractedText(fullText.trim());
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while parsing the PDF text. Ensure the file is not protected.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!extractedText || !file) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}_extracted_text.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* File Upload / Status */}
      <div className="md:col-span-5 space-y-6">
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
                onClick={() => { setFile(null); setExtractedText(''); }}
                className="text-xs font-semibold text-red-500 hover:text-red-650 cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="saas-card p-6 space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Actions</h3>

          <button
            onClick={handleExtract}
            disabled={!file || isProcessing}
            className="w-full saas-button-primary py-3 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span className="truncate">{progressText || 'Extracting...'}</span>
              </>
            ) : (
              <span>Extract Plain Text</span>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2.5 text-left">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {extractedText && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 mb-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold">Extraction Complete!</span>
              </div>
              
              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download TXT File</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Text Preview area */}
      <div className="md:col-span-7 space-y-6">
        <div className="saas-card p-6 h-full flex flex-col justify-between min-h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Text Preview</h3>
            {extractedText && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-800/80 cursor-pointer transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-55/30 dark:bg-zinc-950/40 p-4 font-mono text-xs overflow-y-auto max-h-[450px] whitespace-pre-wrap text-zinc-650 dark:text-zinc-300">
            {extractedText ? (
              extractedText
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-32 text-zinc-400">
                <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-750 mb-3" />
                <span className="font-semibold">No extracted text yet. Upload a PDF and run extraction.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
