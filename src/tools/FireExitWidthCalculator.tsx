import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function FireExitWidthCalculator() {
  const [occupants, setOccupants] = useState(250);
  const [sprinklered, setSprinklered] = useState(true);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    // Egress width factor: 0.2 inches per person with sprinklers, 0.3 without
    const factor = sprinklered ? 0.2 : 0.3;
    const minWidth = Math.max(36, occupants * factor);
    return { minWidth: Math.round(minWidth) };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Fire Escape Egress Width Report\nTotal Occupants: ${occupants}\nSprinklered Building: ${sprinklered ? 'Yes' : 'No'}\nRequired Exit Width: ${results.minWidth} inches`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Fire Life Safety</h3>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Floor Occupant Load (Persons)</label>
          <input type="number" value={occupants} onChange={e => setOccupants(parseInt(e.target.value) || 0)} className="saas-input" />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={sprinklered} id="sprinkler" onChange={e => setSprinklered(e.target.checked)} className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500" />
          <label htmlFor="sprinkler" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Sprinkler System Installed?</label>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Egress Specs</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Total Required Exit Width</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{results.minWidth} inches</div>
              <div className="text-[10px] text-zinc-400 mt-1">Conforms to standard NFPA 101 Life Safety Code requirements.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}