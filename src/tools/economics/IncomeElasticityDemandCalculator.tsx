import { useState, useMemo } from 'react';
import { Layers, Copy, Check, RotateCcw } from 'lucide-react';

export default function IncomeElasticityDemandCalculator() {
  const [y1, setY1] = useState<number>(50000);
  const [y2, setY2] = useState<number>(65000);
  const [q1, setQ1] = useState<number>(20);
  const [q2, setQ2] = useState<number>(28);
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const deltaQ = q2 - q1;
    const deltaY = y2 - y1;
    if (deltaY === 0 || y1 === 0 || q1 === 0) {
      return { yed: 0, pctQ: 0, pctY: 0, type: 'Indeterminate', desc: 'Income difference is zero.' };
    }
    const avgQ = (q1 + q2) / 2;
    const avgY = (y1 + y2) / 2;
    const pctQ = (deltaQ / avgQ) * 100;
    const pctY = (deltaY / avgY) * 100;
    const yed = pctQ / pctY;

    let type = '';
    let desc = '';
    if (yed > 1) {
      type = 'Luxury / Superior Good (YED > 1)';
      desc = 'Demand increases by a greater percentage than income growth.';
    } else if (yed > 0) {
      type = 'Normal Necessity (0 < YED ≤ 1)';
      desc = 'Demand rises with income, but at a slower rate than income expansion.';
    } else if (yed < 0) {
      type = 'Inferior Good (YED < 0)';
      desc = 'Consumers purchase less of this good as income increases, switching to alternatives.';
    } else {
      type = 'Income Inelastic (YED = 0)';
      desc = 'Demand is completely independent of household income changes.';
    }
    return { yed, pctQ, pctY, type, desc };
  }, [y1, y2, q1, q2]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Income Elasticity of Demand (YED): ${calc.yed.toFixed(3)} (${calc.type})\nIncome: ${y1} -> ${y2} | Qty: ${q1} -> ${q2}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
            Microeconomics
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">Income Elasticity of Demand (YED) Calculator</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Classify goods as Normal Necessities, Luxury items, or Inferior goods based on income shifts.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={() => { setY1(50000); setY2(65000); setQ1(20); setQ2(28); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" /> Income & Consumption Inputs
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Initial Income (Y₁)</label>
              <input type="number" min="0" value={y1} onChange={(e) => setY1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">New Income (Y₂)</label>
              <input type="number" min="0" value={y2} onChange={(e) => setY2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Initial Quantity (Q₁)</label>
              <input type="number" min="0" value={q1} onChange={(e) => setQ1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">New Quantity (Q₂)</label>
              <input type="number" min="0" value={q2} onChange={(e) => setQ2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-semibold text-emerald-300">Income Elasticity (YED)</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/20">{calc.type}</span>
            </div>
            <div className="text-5xl font-black font-mono my-3">{calc.yed.toFixed(3)}</div>
            <p className="text-xs sm:text-sm text-emerald-100 border-t border-white/10 pt-3">{calc.desc}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <div className="text-xs text-zinc-500">Income Growth (%ΔY)</div>
              <div className="text-lg font-bold font-mono text-emerald-600 mt-1">{calc.pctY >= 0 ? '+' : ''}{calc.pctY.toFixed(2)}%</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <div className="text-xs text-zinc-500">Demand Change (%ΔQ)</div>
              <div className={`text-lg font-bold font-mono mt-1 ${calc.pctQ >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{calc.pctQ >= 0 ? '+' : ''}{calc.pctQ.toFixed(2)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
