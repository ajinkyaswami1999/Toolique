import { useState } from 'react';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PDFToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setError(null);
      setFile(uploadedFile);
      setOutputBlob(null);
    }
  };

  const handleConvertToWord = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgressText('Loading document...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>${file.name.replace('.pdf', '')}</title>
          <style>
            body { font-family: "Calibri", "Arial", sans-serif; font-size: 11pt; line-height: 1.25; margin: 1in; color: #333333; }
            p { margin-bottom: 8pt; text-align: justify; }
            h1, h2, h3 { color: #1f4e78; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
            h1 { font-size: 18pt; }
            h2 { font-size: 14pt; }
            h3 { font-size: 12pt; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
      `;

      for (let i = 1; i <= numPages; i++) {
        setProgressText(`Parsing page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let pageHtml = i > 1 ? '<div class="page-break"></div>' : '';
        let lastY = -1;
        let currentParagraph = '';

        for (const item of textContent.items as any[]) {
          const currentY = item.transform?.[5];
          const textStr = item.str || '';

          if (lastY !== -1 && Math.abs(currentY - lastY) > 12) {
            // New paragraph/line detected if coordinates shifted vertically
            if (currentParagraph.trim()) {
              pageHtml += `<p>${currentParagraph.trim()}</p>\n`;
            }
            currentParagraph = '';
          }

          currentParagraph += textStr + ' ';
          lastY = currentY;
        }

        if (currentParagraph.trim()) {
          pageHtml += `<p>${currentParagraph.trim()}</p>\n`;
        }

        htmlContent += pageHtml;
      }

      htmlContent += `
        </body>
        </html>
      `;

      // Create a Blob with Word mime type
      const wordBlob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
      setOutputBlob(wordBlob);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred during conversion. Make sure the PDF is not encrypted.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const handleDownload = () => {
    if (!outputBlob || !file) return;
    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}.doc`; // Saved as .doc (supported natively by Word)
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* File Select */}
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
                onClick={() => { setFile(null); setOutputBlob(null); }}
                className="text-xs font-semibold text-red-500 hover:text-red-650 cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="md:col-span-5 space-y-6">
        <div className="saas-card p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white text-left">Actions</h3>

          <button
            onClick={handleConvertToWord}
            disabled={!file || isProcessing}
            className="w-full saas-button-primary py-3 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span className="truncate">{progressText || 'Converting...'}</span>
              </>
            ) : (
              <span>Convert to Word</span>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2.5 text-left">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {outputBlob && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-left space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold">Conversion Complete!</span>
              </div>
              
              <p className="text-[10px] text-zinc-550 leading-relaxed font-semibold">
                Your PDF has been converted into an editable Microsoft Word document (.doc).
              </p>

              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Word Document</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
