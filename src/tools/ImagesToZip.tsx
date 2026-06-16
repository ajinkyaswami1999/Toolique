import { useState } from 'react';
import { Archive, Upload, Download, RotateCcw, FileText, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';

interface FileItem {
  id: string;
  name: string;
  size: number;
  sizeFormatted: string;
  type: string;
  src: string;
  fileBlob: File;
}

export default function ImagesToZip() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [zipSize, setZipSize] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // File selection
  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      setError(null);
      const newFilesPromises: Promise<FileItem>[] = Array.from(uploadedFiles).map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              id: Math.random().toString(36).substring(2, 9),
              name: file.name,
              size: file.size,
              sizeFormatted: (file.size / 1024).toFixed(1) + ' KB',
              type: file.type,
              src: file.type.startsWith('image/') ? (event.target?.result as string) : '',
              fileBlob: file,
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newFilesPromises).then((loadedFiles) => {
        setFiles((prev) => [...prev, ...loadedFiles]);
        setZipBlob(null); // Reset zip
      });
    }
  };

  // Compile ZIP using JSZip
  const handleCompileZip = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const zip = new JSZip();
      files.forEach((fileItem) => {
        zip.file(fileItem.name, fileItem.fileBlob);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      setZipBlob(blob);
      setZipSize((blob.size / 1024).toFixed(1) + ' KB');
    } catch (err) {
      setError('An error occurred while compiling the ZIP archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download ZIP
  const handleDownload = () => {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `archive_images.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Remove individual file
  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
    setZipBlob(null);
  };

  const handleClearAll = () => {
    setFiles([]);
    setZipBlob(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Settings Panel */}
      <div className="md:col-span-4 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Archive className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-white text-sm">ZIP Options</h3>
          </div>
          {files.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Clear All"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Info Box */}
        <div className="text-xs text-zinc-400 dark:text-zinc-550 leading-relaxed bg-zinc-50 dark:bg-zinc-950/40 p-4 border border-zinc-100 dark:border-zinc-800/60 rounded-xl">
          Upload multiple image files and package them into a single compressed `.zip` archive immediately without transferring any data over the internet.
        </div>

        {files.length > 0 && (
          <div className="space-y-2 pt-2">
            <button
              onClick={handleCompileZip}
              disabled={isProcessing}
              className="saas-button-primary w-full py-3"
            >
              <Archive className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Creating ZIP...' : 'Compile ZIP Archive'}</span>
            </button>

            {zipBlob && (
              <button
                onClick={handleDownload}
                className="saas-button-secondary w-full py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download ZIP ({zipSize})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload & List Panel */}
      <div className="md:col-span-8 p-6 saas-card flex flex-col min-h-[400px]">
        {error && (
          <div className="mb-4 w-full p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {files.length === 0 ? (
          <label className="flex-grow w-full flex flex-col justify-center items-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-300">
            <Upload className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-3" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Upload Files to Package</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Select multiple images or files</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFilesUpload}
            />
          </label>
        ) : (
          <div className="space-y-4 w-full flex-grow flex flex-col justify-between">
            <div className="flex justify-between items-center px-1 text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
              <span>Files List ({files.length})</span>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.onchange = (e) => {
                    handleFilesUpload(e as any);
                  };
                  input.click();
                }}
                className="text-indigo-500 hover:underline cursor-pointer"
              >
                + Add More
              </button>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 overflow-y-auto max-h-[350px] pr-1">
              {files.map((file) => (
                <div key={file.id} className="py-3 flex items-center justify-between text-xs gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-950/5 shrink-0 flex items-center justify-center">
                      {file.src ? (
                        <img src={file.src} alt="thumb" className="object-cover w-full h-full" />
                      ) : (
                        <FileText className="w-5 h-5 text-zinc-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-800 dark:text-zinc-250 truncate block animate-none" title={file.name}>
                        {file.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-0.5">
                        {file.sizeFormatted} &bull; {file.type || 'Unknown Type'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition cursor-pointer"
                    title="Remove File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">
              {zipBlob ? (
                <span className="text-emerald-500 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ZIP Archive Compiled Successfully!</span>
                </span>
              ) : (
                <span>Ready to compile package archive.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
