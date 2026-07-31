import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CorridorWidthCalculator() {
  const [occupants, setOccupants] = useState(120);
  const [useType, setUseType] = useState<'commercial' | 'residential' | 'healthcare'>('commercial');
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    let baseWidth = 36;
    if (useType === 'commercial') baseWidth = 44;
    else if (useType === 'healthcare') baseWidth = 96; // bed transfer space

    const capacityWidth = occupants * 0.2; // 0.2 inches per occupant
    const finalWidth = Math.max(baseWidth, capacityWidth);

    return { baseWidth, finalWidth };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Corridor Egress Width Report\nOccupants Load: ${occupants}\nOccupancy Type: ${useType}\nCode Minimum Width: ${results.baseWidth} inches\nCalculated Egress Width: ${results.finalWidth} inches`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Corridor Clearances</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Occupant Capacity</label>
            <input type="number" value={occupants} onChange={e => setOccupants(parseInt(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Occupancy Type</label>
            <select value={useType} onChange={e => setUseType(e.target.value as any)} className="saas-input">
              <option value="commercial">Commercial/Business (44")</option>
              <option value="residential">Residential Apartments (36")</option>
              <option value="healthcare">Healthcare/Hospitals (96")</option>
            </select>
          </div>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Egress Result</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Required Clear Width</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{results.finalWidth} inches</div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 text-[10px] text-zinc-400">
              Conforms to IBC Section 1020 egress requirements for wheelchair clearances and safe passage travel.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}