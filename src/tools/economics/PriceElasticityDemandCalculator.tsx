import { useState, useMemo } from 'react';
import { TrendingDown, Copy, Check, RotateCcw } from 'lucide-react';

export default function PriceElasticityDemandCalculator() {
  const [p1, setP1] = useState<number>(100);
  const [p2, setP2] = useState<number>(120);
  const [q1, setQ1] = useState<number>(500);
  const [q2, setQ2] = useState<number>(400);
  const [method, setMethod] = useState<'midpoint' | 'standard'>('midpoint');
  const [copied, setCopied] = useState(false);

  const calc = useMemo(() => {
    const deltaQ = q2 - q1;
    const deltaP = p2 - p1;
    if (deltaP === 0 || p1 === 0 || q1 === 0) {
      return { ped: 0, absPed: 0, pctQ: 0, pctP: 0, type: 'Indeterminate', tr1: p1 * q1, tr2: p2 * q2, trDelta: p2 * q2 - p1 * q1, explanation: 'Price change is zero.' };
    }

    let pctQ = 0, pctP = 0, ped = 0;
    if (method === 'midpoint') {
      const avgQ = (q1 + q2) / 2;
      const avgP = (p1 + p2) / 2;
      pctQ = (deltaQ / avgQ) * 100;
      pctP = (deltaP / avgP) * 100;
      ped = pctP !== 0 ? pctQ / pctP : 0;
    } else {
      pctQ = (deltaQ / q1) * 100;
      pctP = (deltaP / p1) * 100;
      ped = pctP !== 0 ? pctQ / pctP : 0;
    }

    const absPed = Math.abs(ped);
    let type = '';
    let explanation = '';

    if (absPed > 1) {
      type = 'Elastic Demand (|PED| > 1)';
      explanation = 'Consumers are price sensitive. Raising price leads to lower Total Revenue.';
    } else if (absPed === 1) {
      type = 'Unitary Elastic (|PED| = 1)';
      explanation = '% change in Q equals % change in P. Total Revenue remains unchanged.';
    } else if (absPed > 0) {
      type = 'Inelastic Demand (|PED| < 1)';
      explanation = 'Consumers are relatively insensitive (necessities). Raising price increases Total Revenue.';
    } else {
      type = 'Perfectly Inelastic (|PED| = 0)';
      explanation = 'Demand is constant regardless of price.';
    }

    const tr1 = p1 * q1;
    const tr2 = p2 * q2;
    const trDelta = tr2 - tr1;

    return { ped, absPed, pctQ, pctP, type, tr1, tr2, trDelta, explanation };
  }, [p1, p2, q1, q2, method]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Price Elasticity of Demand (PED): ${calc.ped.toFixed(3)} (${calc.type})\nP1: ${p1}, P2: ${p2} | Q1: ${q1}, Q2: ${q2}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
            Microeconomics
          </span>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">Price Elasticity of Demand (PED) Calculator</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate consumer price sensitivity, arc elasticity, and revenue impact.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={() => { setP1(100); setP2(120); setQ1(500); setQ2(400); }} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-blue-600" /> Parameters
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setMethod('midpoint')} className={`px-3 py-2 text-xs font-medium rounded-xl border ${method === 'midpoint' ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'}`}>Midpoint Formula</button>
            <button type="button" onClick={() => setMethod('standard')} className={`px-3 py-2 text-xs font-medium rounded-xl border ${method === 'standard' ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'}`}>Standard Base</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Initial Price (P₁)</label>
              <input type="number" min="0" value={p1} onChange={(e) => setP1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">New Price (P₂)</label>
              <input type="number" min="0" value={p2} onChange={(e) => setP2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white" />
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
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-semibold text-blue-300">Elasticity Coefficient</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/20">{calc.type}</span>
            </div>
            <div className="text-5xl font-black font-mono my-3">{calc.ped.toFixed(3)}</div>
            <p className="text-xs sm:text-sm text-blue-100 border-t border-white/10 pt-3">{calc.explanation}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
              <div className="text-xs text-zinc-500">Δ Quantity</div>
              <div className={`text-base font-bold font-mono mt-1 ${calc.pctQ >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{calc.pctQ >= 0 ? '+' : ''}{calc.pctQ.toFixed(2)}%</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
              <div className="text-xs text-zinc-500">Δ Price</div>
              <div className={`text-base font-bold font-mono mt-1 ${calc.pctP >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>{calc.pctP >= 0 ? '+' : ''}{calc.pctP.toFixed(2)}%</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
              <div className="text-xs text-zinc-500">Initial TR</div>
              <div className="text-base font-bold font-mono text-zinc-900 dark:text-white mt-1">{calc.tr1.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
              <div className="text-xs text-zinc-500">New TR</div>
              <div className={`text-base font-bold font-mono mt-1 ${calc.trDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{calc.tr2.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
