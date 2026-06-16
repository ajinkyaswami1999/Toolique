import { useState, useRef, useEffect } from 'react';
import { QrCode, Upload, Copy, Check, RotateCcw, ExternalLink, AlertTriangle, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

export default function QRScannerImage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isUrl, setIsUrl] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      setScanResult(null);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Decode QR once image is drawn on hidden canvas
  useEffect(() => {
    if (!imageSrc) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);

      // Read pixel buffer
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Decode using jsQR
      try {
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          setScanResult(code.data);
          setError(null);
          
          // Check if string is a valid absolute HTTP url
          const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
          setIsUrl(urlPattern.test(code.data));
        } else {
          setScanResult(null);
          setError('No QR code detected in the image. Please verify focus and lighting.');
        }
      } catch (err) {
        setScanResult(null);
        setError('Failed to scan QR code from canvas buffer.');
      }
    };
  }, [imageSrc]);

  const handleCopy = () => {
    if (!scanResult) return;
    navigator.clipboard.writeText(scanResult).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Scan Results Panel */}
      <div className="md:col-span-4 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <QrCode className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-white text-sm">Scan Result</h3>
          </div>
          {imageSrc && (
            <button
              onClick={() => {
                setImageSrc(null);
                setFileName('');
                setScanResult(null);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Reset Upload"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Scan output content */}
        {scanResult ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Decoded Content</span>
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/20 font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all select-all max-h-40 overflow-y-auto">
                {scanResult}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopy}
                className="saas-button-primary w-full py-2.5 flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Content'}</span>
              </button>

              {isUrl && (
                <a
                  href={scanResult.startsWith('http') ? scanResult : `https://${scanResult}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="saas-button-secondary w-full py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open URL Link</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs text-zinc-400 dark:text-zinc-550 leading-relaxed bg-zinc-50 dark:bg-zinc-950/40 p-4 border border-zinc-100 dark:border-zinc-800/60 rounded-xl space-y-2">
            <div className="flex gap-1.5 items-start">
              <QrCode className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <span className="font-semibold text-zinc-650 dark:text-zinc-300">QR Scanner From Image</span>
            </div>
            <p>Upload any picture containing a QR code. The scanner will parse pixel buffers locally and decode the underlying links or texts instantly.</p>
          </div>
        )}
      </div>

      {/* Upload and Canvas Workspace */}
      <div className="md:col-span-8 p-6 saas-card flex flex-col justify-center items-center min-h-[400px]">
        {error && (
          <div className="mb-4 w-full p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-650 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
            {scanResult ? <AlertCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{error}</span>
          </div>
        )}

        {!imageSrc ? (
          <label className="w-full h-full flex flex-col justify-center items-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-300">
            <Upload className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-3" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Upload Image to Scan</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-550 mt-1">PNG, JPG, WebP supported</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        ) : (
          <div className="space-y-4 w-full flex flex-col items-center justify-center">
            {/* Meta details */}
            <div className="flex justify-between items-center w-full px-2 text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
              <span>File: {fileName}</span>
            </div>

            {/* Hidden canvas for image data buffer scanning */}
            <canvas ref={canvasRef} className="hidden" />

            <div
              className="relative max-w-full overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-zinc-950/5 flex items-center justify-center"
              style={{ maxHeight: '400px' }}
            >
              <img
                src={imageSrc}
                alt="Source preview"
                className="max-w-full h-auto object-contain"
                style={{ maxHeight: '380px' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
