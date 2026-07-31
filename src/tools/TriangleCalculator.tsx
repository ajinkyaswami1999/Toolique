import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function TriangleCalculator() {
  const [base, setBase] = useState(12);
  const [height, setHeight] = useState(8);
  const [copied, setCopied] = useState(false);

  const area = 0.5 * base * height;
  const hypotenuse = Math.sqrt(base*base + height*height); // right triangle assumption
  const perimeter = base + height + hypotenuse;

  const copyReport = () => {
    const text = `Triangle Profile (Right-Angled)\nBase: ${base}\nHeight: ${height}\nArea: ${area} sq units\nPerimeter: ${perimeter.toFixed(2)} units`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Triangle Dimensions</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Base Length</label>
            <input type="number" value={base} onChange={e => setBase(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Height</label>
            <input type="number" value={height} onChange={e => setHeight(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Geometry Results</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Total Calculated Area</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{area.toLocaleString()} sq units</div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Est. Perimeter (Right Shape)</span>
                <span className="font-bold font-mono">{perimeter.toFixed(1)} units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}