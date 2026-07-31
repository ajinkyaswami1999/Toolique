import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function ParkingRequirementCalculator() {
  const [floorArea, setFloorArea] = useState(25000); // sq ft
  const [bldgType, setBldgType] = useState<'office' | 'retail' | 'residential'>('office');
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    // Guidelines: Office (1 per 300 sq ft), Retail (1 per 250 sq ft), Residential (1.5 per dwelling unit)
    let ratio = 300;
    if (bldgType === 'retail') ratio = 250;
    else if (bldgType === 'residential') ratio = 200; // simplified dwelling estimate

    const totalSpots = Math.ceil(floorArea / ratio);
    const accessibleSpots = Math.max(1, Math.ceil(totalSpots * 0.02)); // ADA 2% rule

    return { totalSpots, accessibleSpots };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Zoning Parking Requirement Report\nBuilding Type: ${bldgType}\nGross Floor Area: ${floorArea} sq ft\nRequired Parking Spaces: ${results.totalSpots}\nADA Accessible Spaces Required: ${results.accessibleSpots}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Building Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Gross Floor Area (Sq Ft)</label>
            <input type="number" value={floorArea} onChange={e => setFloorArea(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Building Type</label>
            <select value={bldgType} onChange={e => setBldgType(e.target.value as any)} className="saas-input">
              <option value="office">Business / Office</option>
              <option value="retail">Retail / Commercial</option>
              <option value="residential">Residential Apartments</option>
            </select>
          </div>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Spots Required</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Total Mandatory Bays</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{results.totalSpots} Spaces</div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">ADA Accessible Spots</span>
                <span className="font-bold font-mono">{results.accessibleSpots} Bay(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}