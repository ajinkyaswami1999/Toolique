import { useState } from 'react';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFPasswordProtect() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [securedBlob, setSecuredBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setError(null);
      setFile(uploadedFile);
      setSecuredBlob(null);
    }
  };

  const handleEncrypt = async () => {
    if (!file) return;
    if (!password.trim()) {
      setError('Please enter a secure password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgressText('Loading document...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      let doc: jsPDF | null = null;

      for (let i = 1; i <= numPages; i++) {
        setProgressText(`Processing page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // Use decent scale for quality

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

        const imgData = canvas.toDataURL('image/jpeg', 0.85);

        if (i === 1) {
          // Initialize jsPDF on first page with encryption details
          doc = new jsPDF({
            orientation: viewport.width > viewport.height ? 'l' : 'p',
            unit: 'px',
            format: [viewport.width, viewport.height],
            encryption: {
              userPassword: password,
              ownerPassword: password + '_owner',
              userPermissions: ['print', 'copy', 'modify'],
            },
          });
        } else if (doc) {
          doc.addPage([viewport.width, viewport.height], viewport.width > viewport.height ? 'l' : 'p');
        }

        if (doc) {
          doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
        }
      }

      if (!doc) throw new Error('Could not create document.');

      setProgressText('Encrypting and saving...');
      const outputBlobObj = doc.output('blob');
      setSecuredBlob(outputBlobObj);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred during encryption. Please make sure the input PDF is not password protected already.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const handleDownload = () => {
    if (!securedBlob || !file) return;
    const url = URL.createObjectURL(securedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}_protected.pdf`;
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
                onClick={() => { setFile(null); setSecuredBlob(null); }}
                className="text-xs font-semibold text-red-500 hover:text-red-650 cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {file && (
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Security Settings</h3>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Set PDF Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setSecuredBlob(null); }}
                  placeholder="Enter secure password"
                  className="saas-input py-2.5 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setSecuredBlob(null); }}
                  placeholder="Re-enter password"
                  className="saas-input py-2.5 font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action panel */}
      <div className="md:col-span-5 space-y-6">
        <div className="saas-card p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white text-left">Actions</h3>

          <button
            onClick={handleEncrypt}
            disabled={!file || !password || isProcessing}
            className="w-full saas-button-primary py-3 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span className="truncate">{progressText || 'Encrypting PDF...'}</span>
              </>
            ) : (
              <>
                <Lock className="w-4.5 h-4.5" />
                <span>Encrypt PDF</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2.5 text-left">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {securedBlob && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-left space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold">PDF Locked & Protected!</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Encrypted PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
