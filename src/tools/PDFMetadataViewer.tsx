import { useState } from 'react';
import { FileText, Upload, AlertCircle, Loader2, Info } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface MetadataInfo {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  pageCount: number;
  fileSize: string;
}

export default function PDFMetadataViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<MetadataInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setError(null);
      setFile(uploadedFile);
      setMetadata(null);
    }
  };

  const handleInspect = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      const formatDate = (date: Date | undefined): string => {
        if (!date) return 'Not Specified';
        return date.toLocaleString();
      };

      setMetadata({
        title: pdfDoc.getTitle() || 'Not Specified',
        author: pdfDoc.getAuthor() || 'Not Specified',
        subject: pdfDoc.getSubject() || 'Not Specified',
        creator: pdfDoc.getCreator() || 'Not Specified',
        producer: pdfDoc.getProducer() || 'Not Specified',
        creationDate: formatDate(pdfDoc.getCreationDate()),
        modificationDate: formatDate(pdfDoc.getModificationDate()),
        pageCount: pdfDoc.getPageCount(),
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      });
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while inspecting PDF metadata. Ensure the file is not corrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* File Select & Trigger */}
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
                onClick={() => { setFile(null); setMetadata(null); }}
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
            onClick={handleInspect}
            disabled={!file || isProcessing}
            className="w-full saas-button-primary py-3 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Reading properties...</span>
              </>
            ) : (
              <>
                <Info className="w-4.5 h-4.5" />
                <span>Inspect PDF Metadata</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2.5 text-left">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Renders Table metadata */}
      <div className="md:col-span-7 space-y-6">
        <div className="saas-card p-6 min-h-[350px]">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Metadata Report</h3>
          
          {metadata ? (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
              {[
                { label: 'Title', value: metadata.title },
                { label: 'Author', value: metadata.author },
                { label: 'Subject', value: metadata.subject },
                { label: 'Creator', value: metadata.creator },
                { label: 'Producer', value: metadata.producer },
                { label: 'Page Count', value: metadata.pageCount },
                { label: 'File Size', value: metadata.fileSize },
                { label: 'Creation Date', value: metadata.creationDate },
                { label: 'Modification Date', value: metadata.modificationDate },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-3 p-3.5 bg-zinc-50/20 dark:bg-zinc-900/10 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                  <div className="font-extrabold text-zinc-500 dark:text-zinc-450">{row.label}</div>
                  <div className="col-span-2 font-bold text-zinc-800 dark:text-zinc-200 truncate pr-2 font-mono text-[11px]" title={String(row.value)}>
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-24 text-zinc-400">
              <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-750 mb-3" />
              <span className="font-semibold">Upload a PDF file and click inspect to view metadata properties.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
