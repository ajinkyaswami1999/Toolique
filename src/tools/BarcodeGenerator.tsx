import { useState, useRef, useEffect } from 'react';
import { Download, Barcode, AlertCircle } from 'lucide-react';

const CODE39_ENCODINGS: Record<string, string> = {
  '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
  '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
  '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
  'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
  'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
  'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
  'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
  'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
  'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
  '-': '010000101', '.': '110000100', ' ': '011000100', '*': '010010100',
  '$': '010101000', '/': '010100010', '+': '010001010', '%': '000101010'
};

export default function BarcodeGenerator() {
  const [text, setText] = useState<string>('TOOLIQUE123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawBarcode = () => {
    setErrorMsg(null);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const uppercaseText = text.toUpperCase();
    
    // Validate character set (Code39 supports 0-9, A-Z, space, -, ., $, /, +, %, and start/stop *)
    const validRegex = /^[0-9A-Z\-.\s$/+%,]*$/;
    if (!validRegex.test(uppercaseText)) {
      setErrorMsg('Invalid characters. Code39 supports numbers, capital letters, spaces, and symbols (- . $ / + %)');
      return;
    }

    if (uppercaseText.length === 0) {
      // Clear canvas if input is empty
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const fullText = `*${uppercaseText}*`;

    // Code39 metrics
    const narrowWidth = 2;
    const wideWidth = 5;
    const barcodeHeight = 70;
    const startX = 30;
    const startY = 15;

    // A standard Code39 character has 3 wide elements (out of 9).
    // Width of 1 character = 3 * wideWidth + 6 * narrowWidth + interCharacterGap
    const charWidth = 3 * wideWidth + 6 * narrowWidth + narrowWidth;
    const totalBarcodeWidth = fullText.length * charWidth;

    // Dynamically resize canvas
    canvas.width = totalBarcodeWidth + startX * 2;
    canvas.height = barcodeHeight + startY * 2 + 25;

    // Clear canvas white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let currentX = startX;

    for (let i = 0; i < fullText.length; i++) {
      const char = fullText[i];
      const pattern = CODE39_ENCODINGS[char];
      if (!pattern) continue;

      for (let p = 0; p < pattern.length; p++) {
        const bit = pattern[p];
        const isBar = p % 2 === 0;
        const isWide = bit === '1';
        const elementWidth = isWide ? wideWidth : narrowWidth;

        ctx.fillStyle = isBar ? '#000000' : '#ffffff';
        ctx.fillRect(currentX, startY, elementWidth, barcodeHeight);
        currentX += elementWidth;
      }

      // Draw narrow inter-character gap (white)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(currentX, startY, narrowWidth, barcodeHeight);
      currentX += narrowWidth;
    }

    // Draw label
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(fullText, canvas.width / 2, startY + barcodeHeight + 20);
  };

  useEffect(() => {
    drawBarcode();
  }, [text]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `barcode-${text || 'code39'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
      {/* Editor Column */}
      <div className="md:col-span-2 saas-card p-6 space-y-6">
        <div className="pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Barcode className="w-5 h-5 text-indigo-500" />
            <span>Barcode Configurator</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Generate high-density Code39 standard barcode labels.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Barcode Text / Value</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              className="saas-input w-full font-mono uppercase"
              placeholder="e.g. TAXINVOICE123"
            />
            <span className="text-[10px] text-zinc-400 block mt-1">
              Supports uppercase letters, numbers, spaces, and characters: - . $ / + %
            </span>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl border bg-rose-50/50 dark:bg-rose-950/10 border-rose-500/20 text-rose-800 dark:text-rose-350 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Validation Warning</h4>
                <p className="text-xs mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview and Export Column */}
      <div className="saas-card p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
            Barcode Preview
          </h3>

          <div className="p-4 bg-white rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-x-auto min-h-[140px]">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={!!errorMsg || text.length === 0}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
        >
          <Download className="w-4 h-4" />
          <span>Download PNG Barcode</span>
        </button>
      </div>
    </div>
  );
}
