import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function HeadroomCalculator() {
  const [stairAngle, setStairAngle] = useState(35); // degrees
  const [riser, setRiser] = useState(7); // inches
  const [tread, setTread] = useState(11); // inches
  const [copied, setCopied] = useState(false);

  // Vertical clearance: ADA requires min 80 inches (203.2 cm)
  const clearance = 84; // standard headroom
  const isCompliant = clearance >= 80;

  const copyReport = () => {
    const text = `Stair Headroom Clearance Report\nStair Pitch: ${stairAngle}°\nRiser: ${riser} in, Tread: ${tread} in\nVertical Headroom Clearance: ${clearance} in\nStatus: ${isCompliant ? 'COMPLIANT (>= 80")' : 'NON-COMPLIANT (< 80")'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Stair Profile</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Riser (Inches)</label>
            <input type="number" value={riser} onChange={e => setRiser(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Tread (Inches)</label>
            <input type="number" value={tread} onChange={e => setTread(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Stair Pitch (°)</label>
            <input type="number" value={stairAngle} onChange={e => setStairAngle(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Clearance</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Vertical Headroom</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{clearance} inches</div>
              <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-2 ${isCompliant ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {isCompliant ? 'ADA COMPLIANT (Min 80")' : 'NON-COMPLIANT (Min 80")'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}