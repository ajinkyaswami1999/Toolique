import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function DoorSizeCalculator() {
  const [occupants, setOccupants] = useState(150);
  const [useType, setUseType] = useState<'egress' | 'standard'>('egress');
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    // IBC egress door width factor: 0.2 inches per occupant
    const minWidth = useType === 'egress' ? Math.max(32, occupants * 0.2) : 32;
    const requiredDoors = Math.ceil(occupants / 500) + 1; // IBC exit count rule
    return { minWidth: Math.round(minWidth), requiredDoors };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Door Size & Egress Report\nOccupants Load: ${occupants}\nDoor Category: ${useType}\nMinimum Required Width: ${results.minWidth} inches\nMinimum Required Exit Doors: ${results.requiredDoors}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Egress Profile</h3>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Total Occupant Load (Persons)</label>
          <input type="number" value={occupants} onChange={e => setOccupants(parseInt(e.target.value) || 0)} className="saas-input" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Usage Type</label>
          <select value={useType} onChange={e => setUseType(e.target.value as any)} className="saas-input">
            <option value="egress">Emergency Egress Exit Door</option>
            <option value="standard">Standard Internal Door</option>
          </select>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Clearances</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Required Clear Width</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{results.minWidth} inches</div>
              <div className="text-[10px] text-zinc-400 mt-1">Conforms to ADA minimum clear width of 32 inches.</div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Required Egress Doors</span>
                <span className="font-bold font-mono">{results.requiredDoors} Exit(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}