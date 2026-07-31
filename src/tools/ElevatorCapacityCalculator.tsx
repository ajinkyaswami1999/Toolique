import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function ElevatorCapacityCalculator() {
  const [floors, setFloors] = useState(5);
  const [population, setPopulation] = useState(300);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    // 1 elevator per 250 occupants for offices
    const elevatorCount = Math.max(1, Math.ceil(population / 250));
    // Standard size: 2500 lbs (approx 10-12 persons) for > 4 floors
    const sizeText = floors > 4 ? '2500 lbs (Passenger)' : '2000 lbs (Residential)';
    return { elevatorCount, sizeText };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Elevator Traffic & Capacity Report\nTotal Floors: ${floors}\nTotal Population: ${population} Persons\nRequired Elevators: ${results.elevatorCount}\nRecommended Car Class: ${results.sizeText}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Building Population</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Number of Floors</label>
            <input type="number" value={floors} onChange={e => setFloors(parseInt(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Building Population</label>
            <input type="number" value={population} onChange={e => setPopulation(parseInt(e.target.value) || 0)} className="saas-input" />
          </div>
        </div>
      </div>
      <div className="md:col-span-5 p-6 saas-card flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Traffic Specs</span>
            <button onClick={copyReport} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs text-zinc-400">Required Elevators</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{results.elevatorCount} Car(s)</div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Recommended Size</span>
                <span className="font-bold text-right text-xs max-w-[140px] truncate">{results.sizeText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}