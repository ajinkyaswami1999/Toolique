import { useState, useRef } from 'react';
import { Globe, Copy, Sparkles, Upload, Download } from 'lucide-react';

export default function FaviconGenerator() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadSize = (size: number) => {
    if (!imageSrc) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, size, size);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `favicon-${size}x${size}.png`;
            link.click();
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      }
    };
  };

  const codeString = `<!-- Standard Favicons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />

<!-- Apple Touch Icon (iOS) -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
      {/* Settings Form */}
      <div className="saas-card p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <Globe className="w-4.5 h-4.5 text-indigo-500" />
          <span>Upload Image Source</span>
        </h3>

        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-10 text-center cursor-pointer hover:bg-zinc-550/[0.01] dark:hover:bg-zinc-900/10 transition-all duration-300 flex flex-col items-center justify-center gap-3"
          >
            <Upload className="w-8 h-8 text-zinc-400" />
            <div>
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Click to upload source image</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Supports PNG, JPEG, WebP, SVG (Square aspect recommended)</p>
            </div>
          </div>

          {imageSrc && (
            <div className="space-y-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-850">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Download Resized Favicons</h4>
              <div className="grid grid-cols-2 gap-2">
                {[16, 32, 48, 180].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleDownloadSize(size)}
                    className="flex justify-between items-center px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-850/60 rounded-xl text-xs font-bold hover:border-indigo-500/30 hover:text-indigo-650 dark:hover:text-indigo-400 transition"
                  >
                    <span>{size} x {size} px</span>
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code output & Preview */}
      <div className="space-y-6">
        <div className="saas-card p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Favicon HTML Links</span>
            </h3>
            <button
              onClick={handleCopy}
              className="saas-button-primary px-3 py-1.5 text-xs flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Tags'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <pre className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-4 text-zinc-300 font-mono text-[10px] leading-relaxed overflow-x-auto whitespace-pre">
              {codeString}
            </pre>

            {imageSrc && (
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Live Icon Previews</span>
                <div className="flex items-end gap-5 p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-850/60 rounded-xl">
                  <div className="text-center space-y-1">
                    <img src={imageSrc} alt="16x16" className="w-4 h-4 object-contain mx-auto" />
                    <span className="text-[9px] font-bold text-zinc-400 block">16x16</span>
                  </div>
                  <div className="text-center space-y-1">
                    <img src={imageSrc} alt="32x32" className="w-8 h-8 object-contain mx-auto" />
                    <span className="text-[9px] font-bold text-zinc-400 block">32x32</span>
                  </div>
                  <div className="text-center space-y-1">
                    <img src={imageSrc} alt="48x48" className="w-12 h-12 object-contain mx-auto" />
                    <span className="text-[9px] font-bold text-zinc-400 block">48x48</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
