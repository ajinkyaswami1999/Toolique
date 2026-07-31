import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function BuildingHeightCalculator() {
  const [roadWidth, setRoadWidth] = useState(30); // feet
  const [setback, setSetback] = useState(10); // feet
  const [copied, setCopied] = useState(false);

  // Maximum height standard: Road Width * 1.5 + Front Setback
  const maxHeight = (roadWidth * 1.5) + setback;

  const copyReport = () => {
    const text = `Maximum Permissible Building Height\nFront Road Width: ${roadWidth} ft\nFront Setback: ${setback} ft\nMax Allowable Height: ${maxHeight} ft`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Site Frontage Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Road Width (Ft)</label>
            <input type="number" value={roadWidth} onChange={e => setRoadWidth(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Front Setback (Ft)</label>
            <input type="number" value={setback} onChange={e => setSetback(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Code Limit</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Max Permissible Height</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{maxHeight} feet</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}