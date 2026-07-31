import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function SetbackCalculator() {
  const [roadWidth, setRoadWidth] = useState(40); // feet
  const [height, setHeight] = useState(30); // feet
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    // Basic Municipal Setback guidelines
    const front = Math.max(10, roadWidth * 0.25);
    const side = Math.max(5, height * 0.15);
    const rear = Math.max(8, height * 0.2);
    return { front: Math.round(front), side: Math.round(side), rear: Math.round(rear) };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Zoning Setback Boundary Report\nFront Road Width: ${roadWidth} ft\nBuilding Height: ${height} ft\nFront Setback: ${results.front} ft\nSide Setback: ${results.side} ft\nRear Setback: ${results.rear} ft`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Site Parameters</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Road Width Frontage (Ft)</label>
            <input type="number" value={roadWidth} onChange={e => setRoadWidth(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Proposed Height (Ft)</label>
            <input type="number" value={height} onChange={e => setHeight(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Required Setbacks</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs border-b pb-2">
              <span className="text-zinc-400">Front Setback Line</span>
              <span className="font-bold font-mono">{results.front} feet</span>
            </div>
            <div className="flex justify-between text-xs border-b pb-2">
              <span className="text-zinc-400">Side Setback line</span>
              <span className="font-bold font-mono">{results.side} feet</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Rear Setback line</span>
              <span className="font-bold font-mono">{results.rear} feet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}