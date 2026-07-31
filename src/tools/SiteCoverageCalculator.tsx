import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function SiteCoverageCalculator() {
  const [plotArea, setPlotArea] = useState(5000);
  const [footprint, setFootprint] = useState(2000);
  const [pavedArea, setPavedArea] = useState(1200);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    const builtRatio = plotArea > 0 ? (footprint / plotArea) * 100 : 0;
    const pavedRatio = plotArea > 0 ? (pavedArea / plotArea) * 100 : 0;
    const greenRatio = 100 - (builtRatio + pavedRatio);
    return {
      builtRatio: Number(builtRatio.toFixed(1)),
      pavedRatio: Number(pavedRatio.toFixed(1)),
      greenRatio: Number(greenRatio.toFixed(1))
    };
  };

  const results = calculate();

  const copyReport = () => {
    const text = `Site Coverage & Permeability Report\nPlot Area: ${plotArea} sq ft\nGround Footprint: ${footprint} sq ft\nPaved/Driveway: ${pavedArea} sq ft\nBuilt Coverage: ${results.builtRatio}%\nPaved Coverage: ${results.pavedRatio}%\nPermeable Green: ${results.greenRatio}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      <div className="md:col-span-7 p-6 saas-card space-y-4">
        <h3 className="font-bold text-sm">Site Areas</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Plot (Sq Ft)</label>
            <input type="number" value={plotArea} onChange={e => setPlotArea(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Footprint (Sq Ft)</label>
            <input type="number" value={footprint} onChange={e => setFootprint(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Paved/Drive (Sq Ft)</label>
            <input type="number" value={pavedArea} onChange={e => setPavedArea(parseFloat(e.target.value) || 0)} className="saas-input" />
          </div>
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
          <div className="space-y-3">
            <div>
              <span className="text-xs text-zinc-400">Permeable Green Area</span>
              <div className="text-2xl font-black mt-1 font-mono text-zinc-950 dark:text-white">{results.greenRatio}%</div>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Ground Coverage Ratio</span>
                <span className="font-bold font-mono">{results.builtRatio}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Paved Hardscape Ratio</span>
                <span className="font-bold font-mono">{results.pavedRatio}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}