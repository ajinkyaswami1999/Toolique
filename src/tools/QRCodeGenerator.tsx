import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Settings, RefreshCw } from 'lucide-react';

export default function QRCodeGenerator() {
  const [text, setText] = useState<string>('https://Toolique');
  const [fgColor, setFgColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [size, setSize] = useState<number>(300);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateQR = async () => {
    if (!canvasRef.current) return;
    try {
      await QRCode.toCanvas(canvasRef.current, text || ' ', {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
    } catch (err) {
      console.error('QR Code generation error:', err);
    }
  };

  useEffect(() => {
    generateQR();
  }, [text, fgColor, bgColor, size]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Settings Column */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
          <Settings className="w-5 h-5 text-slate-400" />
          QR Settings
        </h3>

        {/* Text Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            URL or Text Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium resize-none h-24"
            placeholder="Type URL, Wi-Fi or text here to generate QR..."
          />
        </div>

        {/* Colors selector */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
              Foreground Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-10 h-10 rounded border border-slate-200 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-24 px-2 py-1 border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-700 dark:text-slate-300 font-mono rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded border border-slate-200 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-24 px-2 py-1 border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-700 dark:text-slate-300 font-mono rounded"
              />
            </div>
          </div>
        </div>

        {/* Size Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              QR Size (px)
            </label>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">{size}x{size}</span>
          </div>
          <input
            type="range"
            min="150"
            max="600"
            step="10"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>
      </div>

      {/* Output Column */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl min-h-[400px]">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-800 max-w-full overflow-hidden">
          <canvas ref={canvasRef} className="mx-auto rounded" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
        
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => {
              setText('https://Toolique');
              setFgColor('#0f172a');
              setBgColor('#ffffff');
              setSize(300);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-sm font-bold text-slate-300 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={downloadQR}
            disabled={!text}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold text-white shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}

