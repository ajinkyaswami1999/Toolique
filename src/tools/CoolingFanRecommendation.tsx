import { useState, useEffect } from 'react';
import { Settings, Copy, Check, Info } from 'lucide-react';

export default function CoolingFanRecommendation() {
  // Input States
  const [material, setMaterial] = useState<string>('PLA');
  const [layerTime, setLayerTime] = useState<number>(12);

  // Output States
  const [results, setResults] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<boolean>(false);


  // Math Computation
  useEffect(() => {
    try {
      const runCalc = () => {
        
      let recFan = '100%';
      let description = 'PLA requires maximum cooling for detail stability.';
      if (material === 'ABS' || material === 'ASA') {
        recFan = '0 - 15%';
        description = 'ABS requires high heat build-up. Turn off fan to prevent warping.';
      } else if (material === 'PETG') {
        recFan = layerTime < 10 ? '50%' : '30%';
        description = 'PETG requires moderate cooling. Increase only on short layers.';
      } else if (material === 'TPU') {
        recFan = '20 - 40%';
        description = 'TPU requires minimal cooling for strong layer adhesion.';
      } else if (material === 'Nylon') {
        recFan = '0%';
        description = 'Nylon requires slow structural cooling to prevent cracking.';
      }
      return {
        'Recommended Fan Speed': recFan,
        'Cooling Directive': description
      };
    
      };
      setResults(runCalc());
    } catch (e) {
      setResults({ 'Error': 'Calculation error' });
    }
  }, [material, layerTime]);



  const handleCopy = () => {
    const text = Object.entries(results).map(([k, v]) => `${k}: ${v}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="md:col-span-6 p-6 saas-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <Settings className="w-4 h-4 text-indigo-650 dark:text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Settings</h3>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Filament Material</label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="saas-select"
              >
                <option value="PLA">PLA</option>
                <option value="PETG">PETG</option>
                <option value="ABS">ABS</option>
                <option value="ASA">ASA</option>
                <option value="TPU">TPU</option>
                <option value="Nylon">Nylon</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Average Layer Time (seconds)</label>
              <input
                type="number"
                value={layerTime}
                onChange={(e) => setLayerTime(Number(e.target.value))}
                className="saas-input"
              />
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="md:col-span-6 p-6 saas-card flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Calculated Results</h3>
            <button
              onClick={handleCopy}
              className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex-grow space-y-4">
            {Object.entries(results).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800/50">
                <span className="text-xs font-bold text-zinc-550 dark:text-zinc-400">{key}</span>
                <span className="text-sm font-extrabold text-zinc-900 dark:text-white">{val}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/40 dark:border-zinc-800/40 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-relaxed font-semibold">
              All computations are processed strictly in your local browser sandbox. No file uploads or numbers leave your machine.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
