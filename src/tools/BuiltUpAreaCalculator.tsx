import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function BuiltUpAreaCalculator() {
  const [carpet, setCarpet] = useState<number>(1000);
  const [balconies, setBalconies] = useState<number>(120);
  const [wallThickness, setWallThickness] = useState<number>(15);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const wallArea = carpet * (wallThickness / 100);
    const builtup = carpet + balconies + wallArea;
    return { wallArea: Math.round(wallArea), builtup: Math.round(builtup) };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Built-up Area Report\nCarpet Area: ${carpet} sq ft\nBalconies Area: ${balconies} sq ft\nWall Structural Loading: ${wallThickness}%\nEst. Wall Area: ${results.wallArea} sq ft\nTotal Built-up Area: ${results.builtup} sq ft`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Carpet & Open Spaces</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">Carpet Area (Sq Ft)</label>
            <input type="number" value={carpet} onChange={e => setCarpet(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">Balconies & Utility (Sq Ft)</label>
            <input type="number" value={balconies} onChange={e => setBalconies(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-450 dark:text-zinc-500 mb-1.5">Wall Structural Loading Factor (%)</label>
          <input type="number" value={wallThickness} onChange={e => setWallThickness(parseFloat(e.target.value) || 0)} className="saas-input" />
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
              <span className="text-xs text-zinc-400">Total Built-up Area</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{results.builtup.toLocaleString()} sq ft</div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-medium font-semibold">Est. Structural Wall Area</span>
                <span className="font-bold font-mono">{results.wallArea.toLocaleString()} sq ft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}