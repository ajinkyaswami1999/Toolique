import { useState } from 'react';
import { FileCode, Upload, Copy, Check, RotateCcw, AlertCircle } from 'lucide-react';

export default function ImageToBase64() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [base64String, setBase64String] = useState<string>('');
  
  const [format, setFormat] = useState<'raw' | 'dataurl' | 'html' | 'css'>('dataurl');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // File upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setError(null);
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageSrc(result);
        
        // Strip dataURL header to get raw base64 string
        const base64Raw = result.split(',')[1];
        setBase64String(base64Raw);
        setCopied(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const getFormattedString = () => {
    if (!imageSrc) return '';
    
    if (format === 'raw') return base64String;
    if (format === 'dataurl') return imageSrc;
    if (format === 'html') return `<img src="${imageSrc}" alt="${fileName}" />`;
    if (format === 'css') return `background-image: url("${imageSrc}");`;
    return '';
  };

  const handleCopy = () => {
    const text = getFormattedString();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Settings & Info */}
      <div className="md:col-span-4 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FileCode className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-white text-sm">Base64 Options</h3>
          </div>
          {imageSrc && (
            <button
              onClick={() => {
                setImageSrc(null);
                setFileName('');
                setBase64String('');
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Reset Upload"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Output format selectors */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2.5">Output Snippet Format</label>
          <div className="space-y-2">
            {[
              { id: 'dataurl', label: 'Data URL (Standard)' },
              { id: 'raw', label: 'Raw Base64 Data String' },
              { id: 'html', label: 'HTML Image tag snippet' },
              { id: 'css', label: 'CSS Background snippet' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setFormat(opt.id as any)}
                disabled={!imageSrc}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold text-left transition disabled:opacity-40 ${
                  format === opt.id
                    ? 'border-indigo-650 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Character counts info */}
        {imageSrc && (
          <div className="text-[10px] text-zinc-400 dark:text-zinc-550 bg-zinc-50 dark:bg-zinc-950/40 p-4 border border-zinc-100 dark:border-zinc-800/60 rounded-xl space-y-1.5 font-bold uppercase tracking-wider">
            <div className="flex justify-between">
              <span>String Length:</span>
              <span className="font-mono text-zinc-750 dark:text-zinc-350">{getFormattedString().length.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>File Type:</span>
              <span className="font-mono text-zinc-750 dark:text-zinc-350">
                {imageSrc.substring(imageSrc.indexOf('/') + 1, imageSrc.indexOf(';'))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Code Text Area Output */}
      <div className="md:col-span-8 p-6 saas-card flex flex-col min-h-[400px]">
        {error && (
          <div className="mb-4 w-full p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!imageSrc ? (
          <label className="flex-grow w-full flex flex-col justify-center items-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-300">
            <Upload className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-3" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Upload Image to Convert</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">PNG, JPG, WebP supported</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        ) : (
          <div className="space-y-4 w-full flex-grow flex flex-col">
            <div className="flex justify-between items-center w-full px-1">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">Base64 Output snippet</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-650 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <textarea
              readOnly
              value={getFormattedString()}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              className="flex-grow w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/40 text-xs font-mono leading-relaxed text-zinc-750 dark:text-zinc-300 resize-none outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
}
