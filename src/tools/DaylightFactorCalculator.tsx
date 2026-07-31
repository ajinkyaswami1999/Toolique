import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function DaylightFactorCalculator() {
  const [glazingArea, setGlazingArea] = useState(30); // sq ft
  const [totalSurfaceArea, setTotalSurfaceArea] = useState(800); // sq ft (walls + ceiling + floor)
  const [transmittance, setTransmittance] = useState(0.7); // double glazing standard
  const [copied, setCopied] = useState(false);

  // Simplified BRE Daylight Factor formula: DF = (Glazing Area / Surface Area) * transmittance * 10
  const df = (glazingArea / (totalSurfaceArea || 1)) * transmittance * 10;
  const isAdequate = df >= 2.0; // 2% daylight factor is standard adequacy

  const copyReport = () => {
    const text = `Average Daylight Factor Report\nGlazing Area: ${glazingArea} sq ft\nRoom Surface Area: ${totalSurfaceArea} sq ft\nDaylight Factor: ${df.toFixed(2)}%\nStatus: ${isAdequate ? 'ADEQUATE (>= 2%)' : 'INSUFFICIENT (< 2%)'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Room Apertures</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Glazing Area (Sq Ft)</label>
            <input type="number" value={glazingArea} onChange={e => setGlazingArea(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Surface Area (Sq Ft)</label>
            <input type="number" value={totalSurfaceArea} onChange={e => setTotalSurfaceArea(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Glass VLT (0.1 - 1.0)</label>
            <input type="number" step="0.1" value={transmittance} onChange={e => setTransmittance(parseFloat(e.target.value) || 0.7)} className="saas-input" />
          </div>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Illumination</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Daylight Factor (DF)</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{df.toFixed(2)}%</div>
              <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-2 ${isAdequate ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {isAdequate ? 'ADEQUATE ILLUMINATION' : 'REQUIRES ARTIFICIAL LIGHT'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}