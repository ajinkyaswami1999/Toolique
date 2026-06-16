import { useState, useEffect } from 'react';
import { Eye, Download, RotateCcw, AlertCircle } from 'lucide-react';

export default function Base64ToImage() {
  const [base64Input, setBase64Input] = useState<string>('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [dimensions, setDimensions] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Clean base64 input and extract the dataURL representation
  const parseBase64 = (val: string) => {
    let clean = val.trim();
    if (!clean) {
      setImageSrc(null);
      setError(null);
      return;
    }

    try {
      // 1. Check if wrapped in HTML image tag
      const imgTagMatch = clean.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgTagMatch) {
        clean = imgTagMatch[1];
      }

      // 2. Check if wrapped in CSS background url()
      const cssMatch = clean.match(/url\(["']?([^"')]+)["']?\)/i);
      if (cssMatch) {
        clean = cssMatch[1];
      }

      // 3. Check if standard Data URL
      if (clean.startsWith('data:image/')) {
        setImageSrc(clean);
        setError(null);
        return;
      }

      // 4. Fallback: assume raw base64 string. Try to detect MIME type from signature
      const signature = clean.substring(0, 5).toUpperCase();
      let mime = 'image/png';
      if (signature.startsWith('IVBOR')) mime = 'image/png';
      else if (signature.startsWith('/9J/')) mime = 'image/jpeg';
      else if (signature.startsWith('U1JJR')) mime = 'image/webp';
      else if (signature.startsWith('R0lGO')) mime = 'image/gif';
      
      const dataUrl = `data:${mime};base64,${clean}`;
      setImageSrc(dataUrl);
      setError(null);
    } catch (err) {
      setImageSrc(null);
      setError('Could not decode Base64 string. Please verify input data.');
    }
  };

  useEffect(() => {
    parseBase64(base64Input);
  }, [base64Input]);

  // Compute image meta tags info once source is loaded
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions(`${img.naturalWidth} x ${img.naturalHeight} px`);
    
    // Calculate size of raw base64 data string
    if (imageSrc) {
      const base64Str = imageSrc.split(',')[1] || '';
      const sizeBytes = Math.round((base64Str.length * 3) / 4);
      setFileSize((sizeBytes / 1024).toFixed(1) + ' KB');

      const mime = imageSrc.substring(imageSrc.indexOf(':') + 1, imageSrc.indexOf(';'));
      setMimeType(mime);
    }
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const link = document.createElement('a');
    link.href = imageSrc;
    const ext = mimeType.split('/')[1] || 'png';
    link.download = `reconstructed_base64.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Configuration & Meta panel */}
      <div className="md:col-span-4 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Eye className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-white text-sm">Decoder Info</h3>
          </div>
          {base64Input && (
            <button
              onClick={() => {
                setBase64Input('');
                setImageSrc(null);
                setDimensions('');
                setFileSize('');
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Reset Input"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dynamic Image Properties */}
        {imageSrc && !error ? (
          <div className="space-y-4">
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Image details</span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-555 dark:text-zinc-400">File Type</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{mimeType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-555 dark:text-zinc-400">Dimensions</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{dimensions}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-555 dark:text-zinc-400">Estimated Size</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{fileSize}</span>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="saas-button-primary w-full py-3"
            >
              <Download className="w-4 h-4" />
              <span>Download Image</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-zinc-400 dark:text-zinc-550 leading-relaxed bg-zinc-50 dark:bg-zinc-950/40 p-4 border border-zinc-100 dark:border-zinc-800/60 rounded-xl">
            Pasted Base64 string will be decoded and rendered on canvas in real-time. Supports raw base64 data, inline data URI string, HTML img tag strings, or CSS background URLs.
          </div>
        )}
      </div>

      {/* Input / Preview Editor area */}
      <div className="md:col-span-8 space-y-6 flex flex-col justify-between">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Paste Base64 Code</label>
          <textarea
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder="Paste your raw Base64 string or data:image/png;base64,... code here"
            className="w-full h-36 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 text-xs font-mono leading-relaxed text-zinc-850 dark:text-zinc-300 resize-none outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Live preview canvas wrapper */}
        {imageSrc && !error && (
          <div className="space-y-2 flex-grow flex flex-col">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Live Reconstructed Preview</label>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center min-h-[200px]">
              <img
                src={imageSrc}
                alt="Decoded output"
                onLoad={handleImageLoad}
                onError={() => setError('Invalid image binary structure detected inside Base64 string.')}
                className="max-h-[300px] max-w-full h-auto object-contain border border-zinc-200 dark:border-zinc-850 rounded-lg p-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
