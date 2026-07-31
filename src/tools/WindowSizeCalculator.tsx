import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function WindowSizeCalculator() {
  const [floorArea, setFloorArea] = useState(250);
  const [glazingRatio, setGlazingRatio] = useState(10); // standard 10% rule
  const [copied, setCopied] = useState(false);

  const reqGlazing = floorArea * (glazingRatio / 100);

  const copyReport = () => {
    const text = `Window Glazing Area Report\nFloor Area: ${floorArea} sq ft\nTarget Glazing Ratio: ${glazingRatio}%\nRequired Glazing Area: ${reqGlazing} sq ft`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Room & Lighting Profiles</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Floor Area (Sq Ft)</label>
            <input type="number" value={floorArea} onChange={e => setFloorArea(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Glazing Ratio (%)</label>
            <input type="number" value={glazingRatio} onChange={e => setGlazingRatio(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Required Aperture</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Total Net Glazing Area</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{reqGlazing.toFixed(1)} sq ft</div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 text-[10px] text-zinc-400 leading-relaxed">
              Based on the NBC/IBC codes, habitable rooms require at least 10% of their floor area as openable glazing for natural lighting and ventilation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}