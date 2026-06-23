import { useState, useEffect } from 'react';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Loader2, RotateCw } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PageThumb {
  pageNum: number;
  src: string;
}

export default function PDFRotate() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loadingPages, setLoadingPages] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [thumbnails, setThumbnails] = useState<PageThumb[]>([]);
  // Record mapping page number to the relative rotation angle offset (0, 90, 180, 270)
  const [rotations, setRotations] = useState<Record<number, number>>({});
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setError(null);
      setFile(uploadedFile);
      setThumbnails([]);
      setRotations({});
      setOutputBlob(null);
    }
  };

  useEffect(() => {
    if (!file) return;

    const renderThumbnails = async () => {
      setLoadingPages(true);
      setError(null);
      setProgressText('Loading thumbnails...');
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        const thumbs: PageThumb[] = [];
        for (let i = 1; i <= numPages; i++) {
          setProgressText(`Rendering page ${i} of ${numPages}...`);
          const page = await pdf.getPage(i);
          
          const viewport = page.getViewport({ scale: 0.25 });
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

          thumbs.push({
            pageNum: i,
            src: canvas.toDataURL(),
          });
        }
        setThumbnails(thumbs);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load PDF pages. The file might be encrypted or corrupted.');
      } finally {
        setLoadingPages(false);
        setProgressText('');
      }
    };

    renderThumbnails();
  }, [file]);

  const handleRotatePage = (pageNum: number) => {
    setRotations((prev) => ({
      ...prev,
      [pageNum]: ((prev[pageNum] || 0) + 90) % 360,
    }));
    setOutputBlob(null);
  };

  const handleRotateAll = () => {
    const newRotations: Record<number, number> = {};
    thumbnails.forEach((thumb) => {
      newRotations[thumb.pageNum] = ((rotations[thumb.pageNum] || 0) + 90) % 360;
    });
    setRotations(newRotations);
    setOutputBlob(null);
  };

  const handleSaveRotation = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page, index) => {
        const pageNum = index + 1;
        const offset = rotations[pageNum] || 0;
        if (offset !== 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + offset) % 360));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setOutputBlob(blob);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while saving PDF rotations. Ensure the document is unlocked.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputBlob || !file) return;
    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}_rotated.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Workspace Area */}
      <div className="md:col-span-8 space-y-6">
        <div className="saas-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Select PDF File</h3>
            {file && (
              <button
                onClick={() => { setFile(null); setThumbnails([]); setRotations({}); setOutputBlob(null); }}
                className="text-xs font-semibold text-red-500 hover:text-red-650 cursor-pointer"
              >
                Remove File
              </button>
            )}
          </div>

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
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="p-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg shrink-0">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate pr-4">{file.name}</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {thumbnails.length || '...'} pages
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail Rotation area */}
        {file && (
          <div className="saas-card p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Page Preview & Rotation</h4>
              <button
                onClick={handleRotateAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-800/80 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate All 90°</span>
              </button>
            </div>

            {loadingPages ? (
              <div className="text-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">{progressText}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {thumbnails.map((thumb) => {
                  const deg = rotations[thumb.pageNum] || 0;
                  return (
                    <div
                      key={thumb.pageNum}
                      onClick={() => handleRotatePage(thumb.pageNum)}
                      className="group relative flex flex-col items-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 hover:border-indigo-500/50 dark:hover:border-indigo-500/40 cursor-pointer select-none text-center"
                    >
                      <div
                        className="transition-transform duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-zinc-200/50 dark:border-zinc-800/80 rounded"
                        style={{ transform: `rotate(${deg}deg)` }}
                      >
                        <img
                          src={thumb.src}
                          alt={`Page ${thumb.pageNum}`}
                          className="max-h-32 object-contain rounded"
                        />
                      </div>
                      
                      <div className="mt-3 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-650 dark:group-hover:text-zinc-300">
                        Page {thumb.pageNum} ({deg}°)
                      </div>

                      {/* Rotate icon on hover */}
                      <div className="absolute inset-0 bg-zinc-900/5 dark:bg-zinc-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                        <div className="p-2 rounded-xl bg-white dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 shadow-md">
                          <RotateCw className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Area */}
      <div className="md:col-span-4 space-y-6">
        <div className="saas-card p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white text-left">Actions</h3>

          <button
            onClick={handleSaveRotation}
            disabled={!file || thumbnails.length === 0 || isProcessing}
            className="w-full saas-button-primary py-3 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Saving Rotations...</span>
              </>
            ) : (
              <span>Save PDF Rotations</span>
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
                <span className="text-xs font-bold">PDF Rotated!</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Rotated PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
