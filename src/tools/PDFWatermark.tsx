import { useState } from 'react';
import { FileText, Upload, Download, CheckCircle2, AlertCircle, Loader2, Type, Image as ImageIcon } from 'lucide-react';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export default function PDFWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  
  // Text options
  const [text, setText] = useState<string>('CONFIDENTIAL');
  const [textColor, setTextColor] = useState<string>('#6366f1'); // Indigo default
  const [fontSize, setFontSize] = useState<number>(50);
  const [rotation, setRotation] = useState<number>(45);
  
  // Image options
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoScale, setLogoScale] = useState<number>(30); // size percentage of page width
  
  // General options
  const [opacity, setOpacity] = useState<number>(0.3);
  const [position, setPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('center');
  const [skipFirstPage, setSkipFirstPage] = useState<boolean>(false);
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [watermarkedBlob, setWatermarkedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setError(null);
      setFile(uploadedFile);
      setWatermarkedBlob(null);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && (uploadedFile.type === 'image/png' || uploadedFile.type === 'image/jpeg')) {
      setLogoFile(uploadedFile);
      setWatermarkedBlob(null);
    }
  };

  // Helper to convert HEX color to RGB (0-1 range)
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const r = parseInt(hex.substring(1, 3), 16) / 255;
    const g = parseInt(hex.substring(3, 5), 16) / 255;
    const b = parseInt(hex.substring(5, 7), 16) / 255;
    return { r, g, b };
  };

  const handleApplyWatermark = async () => {
    if (!file) return;
    if (watermarkType === 'text' && !text.trim()) {
      setError('Please enter the watermark text.');
      return;
    }
    if (watermarkType === 'image' && !logoFile) {
      setError('Please upload a watermark logo image.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let embeddedImage: any = null;
      let imgDims: { width: number; height: number } = { width: 0, height: 0 };

      if (watermarkType === 'image' && logoFile) {
        const imgBuffer = await logoFile.arrayBuffer();
        if (logoFile.type === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(imgBuffer);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imgBuffer);
        }
        imgDims = embeddedImage.scale(1.0);
      }

      const startIndex = skipFirstPage ? 1 : 0;
      const rgbColor = hexToRgb(textColor);

      for (let i = startIndex; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        if (watermarkType === 'text') {
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          
          let x = width / 2;
          let y = height / 2;

          if (position === 'top-left') {
            x = 80;
            y = height - 80;
          } else if (position === 'top-right') {
            x = width - textWidth - 80;
            y = height - 80;
          } else if (position === 'bottom-left') {
            x = 80;
            y = 80;
          } else if (position === 'bottom-right') {
            x = width - textWidth - 80;
            y = 80;
          }

          page.drawText(text, {
            x: position === 'center' ? x - textWidth / 2 : x,
            y: y,
            size: fontSize,
            font: font,
            color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
            opacity: opacity,
            rotate: degrees(rotation),
          });
        } else if (watermarkType === 'image' && embeddedImage) {
          // Scale image relative to page width
          const targetWidth = width * (logoScale / 100);
          const aspect = imgDims.height / imgDims.width;
          const targetHeight = targetWidth * aspect;

          let x = (width - targetWidth) / 2;
          let y = (height - targetHeight) / 2;

          if (position === 'top-left') {
            x = 40;
            y = height - targetHeight - 40;
          } else if (position === 'top-right') {
            x = width - targetWidth - 40;
            y = height - targetHeight - 40;
          } else if (position === 'bottom-left') {
            x = 40;
            y = 40;
          } else if (position === 'bottom-right') {
            x = width - targetWidth - 40;
            y = 40;
          }

          page.drawImage(embeddedImage, {
            x: x,
            y: y,
            width: targetWidth,
            height: targetHeight,
            opacity: opacity,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      setWatermarkedBlob(blob);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred while applying watermark. Ensure the PDF is not encrypted.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!watermarkedBlob || !file) return;
    const url = URL.createObjectURL(watermarkedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}_watermarked.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Configuration Section */}
      <div className="md:col-span-7 space-y-6">
        {/* File Selection */}
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
                onClick={() => { setFile(null); setWatermarkedBlob(null); }}
                className="text-xs font-semibold text-red-500 hover:text-red-650 cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Watermark Details */}
        {file && (
          <div className="saas-card p-6 space-y-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Watermark Settings</h3>

            {/* Type selector */}
            <div className="flex p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80">
              <button
                onClick={() => { setWatermarkType('text'); setWatermarkedBlob(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  watermarkType === 'text'
                    ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Text Watermark</span>
              </button>
              <button
                onClick={() => { setWatermarkType('image'); setWatermarkedBlob(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  watermarkType === 'image'
                    ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Image Logo</span>
              </button>
            </div>

            {watermarkType === 'text' ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Watermark Text</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => { setText(e.target.value); setWatermarkedBlob(null); }}
                    className="saas-input py-2.5"
                    placeholder="CONFIDENTIAL"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => { setTextColor(e.target.value); setWatermarkedBlob(null); }}
                        className="w-10 h-10 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer bg-transparent"
                      />
                      <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase">{textColor}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Font Size</label>
                    <input
                      type="number"
                      value={fontSize}
                      onChange={(e) => { setFontSize(parseInt(e.target.value, 10) || 12); setWatermarkedBlob(null); }}
                      className="saas-input py-2"
                      min="10"
                      max="150"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Rotation (deg)</label>
                    <input
                      type="number"
                      value={rotation}
                      onChange={(e) => { setRotation(parseInt(e.target.value, 10) || 0); setWatermarkedBlob(null); }}
                      className="saas-input py-2"
                      min="-360"
                      max="360"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Logo Image (PNG or JPEG)</label>
                  {!logoFile ? (
                    <div className="relative border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center hover:border-indigo-500/50 transition-colors">
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleLogoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-8 h-8 mx-auto text-zinc-400 dark:text-zinc-650 mb-2" />
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Choose PNG/JPEG logo image</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate pr-4">{logoFile.name}</p>
                      <button
                        onClick={() => { setLogoFile(null); setWatermarkedBlob(null); }}
                        className="text-xs font-semibold text-red-500 hover:text-red-650 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Scale on Page ({logoScale}%)</label>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={logoScale}
                    onChange={(e) => { setLogoScale(parseInt(e.target.value, 10)); setWatermarkedBlob(null); }}
                    className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                  />
                </div>
              </div>
            )}

            {/* Position, Opacity, and Page filters */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Position</label>
                <select
                  value={position}
                  onChange={(e) => { setPosition(e.target.value as any); setWatermarkedBlob(null); }}
                  className="saas-select"
                >
                  <option value="center">Centered</option>
                  <option value="top-left">Top Left Corner</option>
                  <option value="top-right">Top Right Corner</option>
                  <option value="bottom-left">Bottom Left Corner</option>
                  <option value="bottom-right">Bottom Right Corner</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Opacity ({(opacity * 100).toFixed(0)}%)</label>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => { setOpacity(parseFloat(e.target.value)); setWatermarkedBlob(null); }}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-650 mt-3"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={skipFirstPage}
                onChange={(e) => { setSkipFirstPage(e.target.checked); setWatermarkedBlob(null); }}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800"
              />
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Skip First Page (Cover page)</span>
            </label>
          </div>
        )}
      </div>

      {/* Actions / Output area */}
      <div className="md:col-span-5 space-y-6">
        <div className="saas-card p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white text-left">Actions</h3>

          <button
            onClick={handleApplyWatermark}
            disabled={!file || (watermarkType === 'image' && !logoFile) || isProcessing}
            className="w-full saas-button-primary py-3 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Applying watermark...</span>
              </>
            ) : (
              <span>Apply Watermark</span>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2.5 text-left">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {watermarkedBlob && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-left space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold">Watermark Embedded!</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Watermarked PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
