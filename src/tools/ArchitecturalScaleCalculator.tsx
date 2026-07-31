import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function ArchitecturalScaleCalculator() {
  const [scaleFactor, setScaleFactor] = useState(96); // 1/8" = 1'-0" (96 multiplier)
  const [drawingLength, setDrawingLength] = useState(2.5); // inches
  const [copied, setCopied] = useState(false);

  const realLengthInches = drawingLength * scaleFactor;
  const realLengthFeet = realLengthInches / 12;

  const copyReport = () => {
    const text = `Architectural Scale Conversion\nScale Factor: 1/${scaleFactor}\nDrawing Measurement: ${drawingLength} in\nReal-world Length: ${realLengthFeet.toFixed(2)} ft (${realLengthInches} inches)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Scale Parameters</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Drawing Measurement (Inches)</label>
            <input type="number" value={drawingLength} onChange={e => setDrawingLength(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Common Ratios</label>
            <select value={scaleFactor} onChange={e => setScaleFactor(parseInt(e.target.value) || 12)} className="saas-input">
              <option value="12">1" = 1'-0" (1:12)</option>
              <option value="48">1/4" = 1'-0" (1:48)</option>
              <option value="96">1/8" = 1'-0" (1:96)</option>
              <option value="50">1:50 (Metric)</option>
              <option value="100">1:100 (Metric)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Real World</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Actual Real-World Length</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{realLengthFeet.toFixed(2)} feet</div>
              <div className="text-[10px] text-zinc-400 mt-1">Equals {realLengthInches} inches in model space units.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}