import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function ParkingSpaceCalculator() {
  const [totalLength, setTotalLength] = useState(120); // feet of frontage
  const [angle, setAngle] = useState<'90' | '60' | '45'>('90');
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    let bayWidth = 9.0; // feet
    let aisleWidth = 24; // feet

    if (angle === '60') {
      bayWidth = 10.4;
      aisleWidth = 18;
    } else if (angle === '45') {
      bayWidth = 12.7;
      aisleWidth = 15;
    }

    const spots = Math.floor(totalLength / bayWidth);
    return { spots, aisleWidth, bayWidth };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Parking Layout Plan\nFrontage Length: ${totalLength} ft\nParking Angle: ${angle}°\nStall Width: ${results.bayWidth} ft\nRequired Aisle Width: ${results.aisleWidth} ft\nPermissible Parking Spots: ${results.spots}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Frontage & Layout</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Available Frontage (Ft)</label>
            <input type="number" value={totalLength} onChange={e => setTotalLength(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Parking Angle</label>
            <select value={angle} onChange={e => setAngle(e.target.value as any)} className="saas-input">
              <option value="90">90 Degrees (Perpendicular)</option>
              <option value="60">60 Degrees (Angled)</option>
              <option value="45">45 Degrees (Angled)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Layout Stats</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Total Parking Bays</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{results.spots} Spots</div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Required Aisle Width</span>
                <span className="font-bold font-mono">{results.aisleWidth} feet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}