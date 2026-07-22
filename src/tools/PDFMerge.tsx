/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { FileText, Upload, Trash2, ArrowUp, ArrowDown, Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface FileItem {
  id: string;
  name: string;
  sizeFormatted: string;
  fileBlob: File;
}

export default function PDFMerge() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      setError(null);
      const newItems = Array.from(uploadedFiles)
        .filter((file) => file.type === 'application/pdf')
        .map((file) => ({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          sizeFormatted: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          fileBlob: file,
        }));
      setFiles((prev) => [...prev, ...newItems]);
      setMergedBlob(null);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
    setMergedBlob(null);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newFiles.length) {
      const temp = newFiles[index];
      newFiles[index] = newFiles[targetIndex];
      newFiles[targetIndex] = temp;
      setFiles(newFiles);
      setMergedBlob(null);
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please upload at least 2 PDF files to merge.');
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const fileItem of files) {
        const arrayBuffer = await fileItem.fileBlob.arrayBuffer();
        const srcPdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      setMergedBlob(blob);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while merging the PDF files. Please ensure none of the files are corrupted or password-protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedBlob) return;
    const url = URL.createObjectURL(mergedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `merged_document_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setFiles([]);
    setMergedBlob(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Upload & Files Section */}
      <div className="md:col-span-7 space-y-6">
        <div className="saas-card p-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Select PDF Files</h3>
          
          <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-colors">
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-10 h-10 mx-auto text-zinc-400 dark:text-zinc-650 mb-3" />
            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Click to upload or drag & drop PDFs</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Supports multiple file selections (.pdf)</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="saas-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Files to Merge ({files.length})</h4>
              <button onClick={handleClear} className="text-xs font-semibold text-red-500 hover:text-red-650 cursor-pointer">Clear All</button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {files.map((file, idx) => (
                <div key={file.id} className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg shrink-0">
                      <FileText className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate pr-4">{file.name}</p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">{file.sizeFormatted}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => moveFile(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveFile(idx, 'down')}
                      disabled={idx === files.length - 1}
                      className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1 rounded-lg hover:bg-red-500/10 text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Control & Result Section */}
      <div className="md:col-span-5 space-y-6">
        <div className="saas-card p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white text-left">Actions</h3>
          
          <button
            onClick={handleMerge}
            disabled={files.length < 2 || isProcessing}
            className="w-full saas-button-primary py-3 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Merging files...</span>
              </>
            ) : (
              <span>Merge PDFs</span>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2.5 text-left">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mergedBlob && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-left space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold">PDF Merge Complete!</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Merged PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
