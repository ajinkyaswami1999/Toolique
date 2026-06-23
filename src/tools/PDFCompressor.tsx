import { useState } from 'react';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressLevel, setCompressLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>('');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [sizes, setSizes] = useState<{ original: string; compressed: string; percent: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setError(null);
      setFile(uploadedFile);
      setCompressedBlob(null);
      setSizes(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress('Loading document...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF using pdfjs to render pages to images
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const compressedPdfDoc = await PDFDocument.create();

      // Determine quality and scale based on compression level
      // High compression = low quality, smaller scale
      let quality = 0.5;
      let scale = 1.0;
      if (compressLevel === 'high') {
        quality = 0.3;
        scale = 0.8;
      } else if (compressLevel === 'low') {
        quality = 0.8;
        scale = 1.3;
      }

      for (let i = 1; i <= numPages; i++) {
        setProgress(`Compressing page ${i} of ${numPages}...`);
        
        // 1. Get the page from PDF.js
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        // 2. Render to canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas 2D context.');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        }).promise;

        // 3. Compress to JPEG data URL
        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
        const imageBytes = await fetch(jpegDataUrl).then((r) => r.arrayBuffer());

        // 4. Embed into pdf-lib document
        const pdfImage = await compressedPdfDoc.embedJpg(imageBytes);
        const newPage = compressedPdfDoc.addPage([viewport.width, viewport.height]);
        newPage.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      setProgress('Saving compressed document...');
      const compressedBytes = await compressedPdfDoc.save();
      const compressedBlobObj = new Blob([compressedBytes as any], { type: 'application/pdf' });
      
      // Calculate sizes
      const origSize = file.size;
      const compSize = compressedBlobObj.size;
      const savedPercent = ((origSize - compSize) / origSize * 100).toFixed(0);

      setCompressedBlob(compressedBlobObj);
      setSizes({
        original: (origSize / (1024 * 1024)).toFixed(2) + ' MB',
        compressed: (compSize / (1024 * 1024)).toFixed(2) + ' MB',
        percent: savedPercent + '%',
      });
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while compressing the PDF document. Make sure the file is not protected.');
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}_compressed.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* File Upload Section */}
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
                onClick={() => { setFile(null); setCompressedBlob(null); setSizes(null); }}
                className="text-xs font-semibold text-red-500 hover:text-red-650 cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {file && (
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Compression Settings</h3>
            
            {/* Compression level buttons */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'low', label: 'Low', desc: 'High quality, large size' },
                { id: 'medium', label: 'Recommended', desc: 'Balanced quality & size' },
                { id: 'high', label: 'High', desc: 'Lower quality, smallest size' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => { setCompressLevel(lvl.id as any); setCompressedBlob(null); setSizes(null); }}
                  className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                    compressLevel === lvl.id
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-extrabold">{lvl.label}</div>
                  <div className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold leading-relaxed">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions / Results Section */}
      <div className="md:col-span-5 space-y-6">
        <div className="saas-card p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white text-left">Actions</h3>
          
          <button
            onClick={handleCompress}
            disabled={!file || isProcessing}
            className="w-full saas-button-primary py-3 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span className="truncate">{progress || 'Compressing...'}</span>
              </>
            ) : (
              <span>Compress PDF</span>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2.5 text-left">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {sizes && compressedBlob && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-left space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 mb-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold">PDF Compressed Successfully!</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold py-2 border-t border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="text-zinc-400">Original Size</div>
                  <div className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">{sizes.original}</div>
                </div>
                <div>
                  <div className="text-zinc-400">Compressed Size</div>
                  <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{sizes.compressed}</div>
                </div>
              </div>
              
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">
                Reduced file size by <span className="text-emerald-500 font-extrabold">{sizes.percent}</span>.
              </div>

              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Compressed PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
