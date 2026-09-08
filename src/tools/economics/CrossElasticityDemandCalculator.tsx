import { useState, useMemo } from 'react';
import { ArrowLeftRight } from 'lucide-react';

export default function CrossElasticityDemandCalculator() {
  const [pb1, setPb1] = useState<number>(50);
  const [pb2, setPb2] = useState<number>(60);
  const [qa1, setQa1] = useState<number>(200);
  const [qa2, setQa2] = useState<number>(260);

  const calc = useMemo(() => {
    const deltaQ = qa2 - qa1;
    const deltaP = pb2 - pb1;
    if (deltaP === 0 || pb1 === 0 || qa1 === 0) {
      return { xed: 0, pctQ: 0, pctP: 0, type: 'Indeterminate', desc: 'Price change of Good B is zero.' };
    }
    const avgQ = (qa1 + qa2) / 2;
    const avgP = (pb1 + pb2) / 2;
    const pctQ = (deltaQ / avgQ) * 100;
    const pctP = (deltaP / avgP) * 100;
    const xed = pctQ / pctP;

    let type = '';
    let desc = '';
    if (xed > 0) {
      type = 'Substitute Goods (XED > 0)';
      desc = 'As the price of Good B rises, consumers switch to Good A (e.g., Tea and Coffee).';
    } else if (xed < 0) {
      type = 'Complementary Goods (XED < 0)';
      desc = 'As the price of Good B rises, demand for Good A drops (e.g., Cars and Petrol).';
    } else {
      type = 'Independent Goods (XED = 0)';
      desc = 'The goods are unrelated; price shifts have no effect.';
    }

    return { xed, pctQ, pctP, type, desc };
  }, [pb1, pb2, qa1, qa2]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">Microeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">Cross Price Elasticity of Demand (XED) Calculator</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Determine whether two goods are Substitutes, Complements, or Unrelated.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-purple-600" /> Prices & Quantities
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Price Good B (P_B₁)</label>
              <input type="number" value={pb1} onChange={(e) => setPb1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Price Good B (P_B₂)</label>
              <input type="number" value={pb2} onChange={(e) => setPb2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Qty Good A (Q_A₁)</label>
              <input type="number" value={qa1} onChange={(e) => setQa1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Qty Good A (Q_A₂)</label>
              <input type="number" value={qa2} onChange={(e) => setQa2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-semibold text-purple-300">Cross Elasticity (XED)</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/20">{calc.type}</span>
            </div>
            <div className="text-5xl font-black font-mono my-3">{calc.xed.toFixed(3)}</div>
            <p className="text-xs sm:text-sm text-purple-100 border-t border-white/10 pt-3">{calc.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
