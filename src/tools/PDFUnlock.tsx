import { useState } from 'react';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Loader2, Unlock } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PDFUnlock() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [unlockedBlob, setUnlockedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setError(null);
      setFile(uploadedFile);
      setUnlockedBlob(null);
      setPassword('');
    }
  };

  const handleUnlock = async () => {
    if (!file) return;
    if (!password.trim()) {
      setError('Please enter the PDF password.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgressText('Verifying password...');

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Test password by loading via pdfjs-dist
      let pdf;
      try {
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer, password });
        pdf = await loadingTask.promise;
      } catch (err: any) {
        throw new Error('Incorrect password. Please verify and try again.');
      }

      const numPages = pdf.numPages;
      setProgressText(`Decrypting and rendering ${numPages} pages...`);

      // Re-compile PDF to unencrypted format page-by-page
      const unlockedPdfDoc = await PDFDocument.create();

      for (let i = 1; i <= numPages; i++) {
        setProgressText(`Processing page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // High quality

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const imageBytes = await fetch(imgData).then((r) => r.arrayBuffer());

        const pdfImage = await unlockedPdfDoc.embedJpg(imageBytes);
        const newPage = unlockedPdfDoc.addPage([viewport.width, viewport.height]);
        newPage.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      setProgressText('Saving unlocked document...');
      const pdfBytes = await unlockedPdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setUnlockedBlob(blob);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while unlocking the PDF. Verify the password.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const handleDownload = () => {
    if (!unlockedBlob || !file) return;
    const url = URL.createObjectURL(unlockedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}_unlocked.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Upload and password entry */}
      <div className="md:col-span-7 space-y-6">
        <div className="saas-card p-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Select Encrypted PDF</h3>
          
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
                onClick={() => { setFile(null); setUnlockedBlob(null); }}
                className="text-xs font-semibold text-red-500 hover:text-red-650 cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {file && (
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Credentials</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">PDF Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setUnlockedBlob(null); }}
                placeholder="Enter password to unlock"
                className="saas-input py-2.5 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action panel */}
      <div className="md:col-span-5 space-y-6">
        <div className="saas-card p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white text-left">Actions</h3>

          <button
            onClick={handleUnlock}
            disabled={!file || !password || isProcessing}
            className="w-full saas-button-primary py-3 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span className="truncate">{progressText || 'Decrypting PDF...'}</span>
              </>
            ) : (
              <>
                <Unlock className="w-4.5 h-4.5" />
                <span>Decrypt & Unlock PDF</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2.5 text-left">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {unlockedBlob && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-left space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold">PDF Decrypted & Unlocked!</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Unlocked PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
