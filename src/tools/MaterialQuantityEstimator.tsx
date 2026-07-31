import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function MaterialQuantityEstimator() {
  const [concreteVol, setConcreteVol] = useState(10); // cubic meters
  const [mixRatio, setMixRatio] = useState<'M20' | 'M15' | 'M10'>('M20');
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    // M20 is 1:1.5:3. Total parts = 5.5. Dry volume = 1.54 * wet volume.
    const dryVol = concreteVol * 1.54;
    let parts = 5.5; // default M20
    let cementPart = 1;
    let sandPart = 1.5;
    let stonePart = 3;

    if (mixRatio === 'M15') {
      parts = 7;
      sandPart = 2;
      stonePart = 4;
    } else if (mixRatio === 'M10') {
      parts = 10;
      sandPart = 3;
      stonePart = 6;
    }

    const cementBags = Math.ceil((dryVol * cementPart / parts) / 0.035); // 0.035 m3 per bag
    const sandM3 = (dryVol * sandPart) / parts;
    const aggregateM3 = (dryVol * stonePart) / parts;

    return { cementBags, sandM3: Number(sandM3.toFixed(2)), aggregateM3: Number(aggregateM3.toFixed(2)) };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Concrete Materials Estimation Report\nWet Volume: ${concreteVol} m³\nMix Design: ${mixRatio}\nCement Bags: ${results.cementBags} Bags (50kg)\nSand: ${results.sandM3} m³\nStone Aggregate: ${results.aggregateM3} m³`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Concrete Volume</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Volume (Cubic Meters)</label>
            <input type="number" value={concreteVol} onChange={e => setConcreteVol(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Concrete Mix Nominal Grade</label>
            <select value={mixRatio} onChange={e => setMixRatio(e.target.value as any)} className="saas-input">
              <option value="M20">M20 (1 : 1.5 : 3)</option>
              <option value="M15">M15 (1 : 2 : 4)</option>
              <option value="M10">M10 (1 : 3 : 6)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Materials Breakdown</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs border-b pb-2">
              <span className="text-zinc-400 font-semibold">Cement Bags (50 Kg)</span>
              <span className="font-bold font-mono">{results.cementBags} Bags</span>
            </div>
            <div className="flex justify-between text-xs border-b pb-2">
              <span className="text-zinc-400">Sand Quantity</span>
              <span className="font-bold font-mono">{results.sandM3} m³</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Coarse Stone Aggregate</span>
              <span className="font-bold font-mono">{results.aggregateM3} m³</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}