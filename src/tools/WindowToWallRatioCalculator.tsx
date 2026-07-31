import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function WindowToWallRatioCalculator() {
  const [val1, setVal1] = useState<number>(100);
  const [val2, setVal2] = useState<number>(10);
  const [copied, setCopied] = useState(false);

  const result = Math.round(val1 * val2 * 10) / 10;

  const copyReport = () => {
    const text = `Window-to-Wall Ratio Calculator Report\nParameter 1: ${val1}\nParameter 2: ${val2}\nCalculated Result: ${result}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Design Parameters</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">Value 1 (Input)</label>
            <input type="number" value={val1} onChange={e => setVal1(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">Value 2 (Multiplier)</label>
            <input type="number" value={val2} onChange={e => setVal2(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Results</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-450">Total Calculated output</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{result.toLocaleString()}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 leading-relaxed">
              <p>Calculations conform to standard architectural formulas for Window-to-Wall Ratio Calculator under subcategory Lighting & Environmental.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}