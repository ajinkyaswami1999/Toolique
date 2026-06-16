import { useState } from 'react';
import { RefreshCw, Upload, Download, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';

interface ImageFile {
  id: string;
  name: string;
  size: string;
  type: string;
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  status: 'idle' | 'converting' | 'done' | 'error';
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: string;
}

export default function ImageConverter() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>('image/jpeg');
  const [quality, setQuality] = useState<number>(80);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // File selection
  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setError(null);
      const newImages: Promise<ImageFile>[] = Array.from(files).map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
              resolve({
                id: Math.random().toString(36).substring(2, 9),
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                type: file.type,
                src: img.src,
                naturalWidth: img.width,
                naturalHeight: img.height,
                status: 'idle',
              });
            };
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newImages).then((loadedImages) => {
        setImages((prev) => [...prev, ...loadedImages]);
      });
    }
  };

  // Run conversion for an individual image
  const convertImage = (imgFile: ImageFile): Promise<ImageFile> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imgFile.src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ ...imgFile, status: 'error' });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const mime = targetFormat;
        const q = quality / 100;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({
                ...imgFile,
                status: 'done',
                convertedBlob: blob,
                convertedUrl: url,
                convertedSize: (blob.size / 1024).toFixed(1) + ' KB',
              });
            } else {
              resolve({ ...imgFile, status: 'error' });
            }
          },
          mime,
          mime === 'image/jpeg' || mime === 'image/webp' ? q : undefined
        );
      };
      img.onerror = () => {
        resolve({ ...imgFile, status: 'error' });
      };
    });
  };

  // Run bulk conversion
  const handleConvertAll = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    // Update statuses to converting
    setImages((prev) => prev.map((img) => ({ ...img, status: 'converting' })));

    const conversionPromises = images.map((img) => convertImage(img));
    const results = await Promise.all(conversionPromises);

    setImages(results);
    setIsProcessing(false);
  };

  // Download a single converted image
  const downloadSingle = (img: ImageFile) => {
    if (!img.convertedUrl) return;
    const link = document.createElement('a');
    link.href = img.convertedUrl;
    
    const ext = targetFormat.split('/')[1] === 'jpeg' ? 'jpg' : targetFormat.split('/')[1];
    const baseName = img.name.substring(0, img.name.lastIndexOf('.')) || img.name;
    
    link.download = `${baseName}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all as ZIP
  const downloadAllAsZip = async () => {
    const convertedImages = images.filter((img) => img.status === 'done' && img.convertedBlob);
    if (convertedImages.length === 0) return;

    const zip = new JSZip();
    convertedImages.forEach((img) => {
      const ext = targetFormat.split('/')[1] === 'jpeg' ? 'jpg' : targetFormat.split('/')[1];
      const baseName = img.name.substring(0, img.name.lastIndexOf('.')) || img.name;
      
      if (img.convertedBlob) {
        zip.file(`${baseName}.${ext}`, img.convertedBlob);
      }
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted_images.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    // Revoke urls to prevent memory leaks
    images.forEach((img) => {
      if (img.convertedUrl) URL.revokeObjectURL(img.convertedUrl);
    });
    setImages([]);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Settings Panel */}
      <div className="md:col-span-4 p-6 saas-card space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <RefreshCw className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-white text-sm">Convert Settings</h3>
          </div>
          {images.length > 0 && (
            <button
              onClick={clearAll}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Clear All"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Target format */}
        <div>
          <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-550 mb-1.5">Convert Target format</label>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value)}
            className="saas-select"
            disabled={isProcessing}
          >
            <option value="image/jpeg">JPEG (.jpg)</option>
            <option value="image/png">PNG (.png)</option>
            <option value="image/webp">WebP (.webp)</option>
            <option value="image/gif">GIF (.gif)</option>
            <option value="image/bmp">BMP (.bmp)</option>
          </select>
        </div>

        {/* Quality selector (WebP / JPEG) */}
        {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp') && (
          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-1">
              <span>Compression Quality</span>
              <span className="text-zinc-700 dark:text-zinc-300 font-mono">{quality}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-250 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
              disabled={isProcessing}
            />
          </div>
        )}

        {images.length > 0 && (
          <div className="space-y-2 pt-2">
            <button
              onClick={handleConvertAll}
              disabled={isProcessing}
              className="saas-button-primary w-full py-3"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Converting...' : 'Convert Images'}</span>
            </button>

            {images.some((img) => img.status === 'done') && (
              <button
                onClick={downloadAllAsZip}
                className="saas-button-secondary w-full py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200"
              >
                <Download className="w-4 h-4" />
                <span>Download converted (ZIP)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Files Directory */}
      <div className="md:col-span-8 p-6 saas-card flex flex-col min-h-[400px]">
        {error && (
          <div className="mb-4 w-full p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {images.length === 0 ? (
          <label className="flex-grow w-full flex flex-col justify-center items-center py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all duration-300">
            <Upload className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-3" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Upload Images to Convert</span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">Select multiple images (PNG, JPG, WebP)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesUpload}
            />
          </label>
        ) : (
          <div className="space-y-4 w-full flex-grow flex flex-col justify-between">
            <div className="flex justify-between items-center px-1 text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">
              <span>Selected Images ({images.length})</span>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = 'image/*';
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
              {images.map((img) => (
                <div key={img.id} className="py-3 flex items-center justify-between text-xs gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-950/5 shrink-0 flex items-center justify-center">
                      <img src={img.src} alt="thumbnail" className="object-cover w-full h-full" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-zinc-800 dark:text-zinc-250 truncate block" title={img.name}>
                        {img.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-0.5">
                        {img.size} &bull; {img.naturalWidth}x{img.naturalHeight} px
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {img.status === 'converting' && (
                      <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-bold animate-pulse">Converting...</span>
                    )}
                    {img.status === 'done' && (
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{img.convertedSize}</span>
                        </span>
                        <button
                          onClick={() => downloadSingle(img)}
                          className="p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-350"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {img.status === 'idle' && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider">Ready</span>
                    )}
                    {img.status === 'error' && (
                      <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Failed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">
              <span>All images processed in browser memory.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
