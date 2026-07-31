import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CeilingHeightCalculator() {
  const [roomType, setRoomType] = useState<'habitable' | 'bath' | 'storage'>('habitable');
  const [hasFan, setHasFan] = useState(true);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    let minHeight = 7.5; // feet (90 inches) default habitable
    if (roomType === 'bath') minHeight = 7.0;
    else if (roomType === 'storage') minHeight = 7.0;

    const recommended = hasFan ? Math.max(9.0, minHeight + 1.5) : Math.max(8.0, minHeight + 0.5);
    return { minHeight, recommended };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Ceiling Height Recommendations\nRoom Category: ${roomType}\nCeiling Fan Installed: ${hasFan ? 'Yes' : 'No'}\nCode Minimum Height: ${results.minHeight} ft\nRecommended Height: ${results.recommended} ft`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Room Details</h3>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Room Category</label>
          <select value={roomType} onChange={e => setRoomType(e.target.value as any)} className="saas-input">
            <option value="habitable">Habitable Rooms (Living, Bed, Office)</option>
            <option value="bath">Bathrooms / Laundry</option>
            <option value="storage">Storage / Corridors / Closets</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={hasFan} id="fan" onChange={e => setHasFan(e.target.checked)} className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500" />
          <label htmlFor="fan" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Ceiling Fan / Chandelier Installed?</label>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Heights</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Recommended Ceiling Height</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{results.recommended.toFixed(1)} feet</div>
              <div className="text-[10px] text-zinc-400 mt-1">Allows comfortable head clearance beneath hanging fixtures.</div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Code Minimum Limit</span>
                <span className="font-bold font-mono">{results.minHeight.toFixed(1)} feet</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}