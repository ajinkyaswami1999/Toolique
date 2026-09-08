import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

export default function PriceElasticitySupplyCalculator() {
  const [p1, setP1] = useState<number>(40);
  const [p2, setP2] = useState<number>(50);
  const [qs1, setQs1] = useState<number>(300);
  const [qs2, setQs2] = useState<number>(450);

  const calc = useMemo(() => {
    const deltaQ = qs2 - qs1;
    const deltaP = p2 - p1;
    if (deltaP === 0 || p1 === 0 || qs1 === 0) {
      return { pes: 0, pctQ: 0, pctP: 0, type: 'Indeterminate', desc: 'Price change is zero.' };
    }
    const avgQ = (qs1 + qs2) / 2;
    const avgP = (p1 + p2) / 2;
    const pctQ = (deltaQ / avgQ) * 100;
    const pctP = (deltaP / avgP) * 100;
    const pes = pctQ / pctP;

    let type = '';
    let desc = '';
    if (pes > 1) {
      type = 'Elastic Supply (PES > 1)';
      desc = 'Producers can rapidly expand production when market prices increase.';
    } else if (pes === 1) {
      type = 'Unitary Elastic Supply (PES = 1)';
      desc = 'Quantity supplied changes in exact equal proportion to price changes.';
    } else if (pes > 0) {
      type = 'Inelastic Supply (PES < 1)';
      desc = 'Producers face capacity constraints and cannot easily increase output.';
    } else {
      type = 'Perfectly Inelastic Supply (PES = 0)';
      desc = 'Supply is fixed (e.g. agricultural harvest).';
    }

    return { pes, pctQ, pctP, type, desc };
  }, [p1, p2, qs1, qs2]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">Microeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-600" />
          Price Elasticity of Supply (PES) Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate supplier responsiveness and production flexibility.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Price P₁</label>
              <input type="number" value={p1} onChange={(e) => setP1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Price P₂</label>
              <input type="number" value={p2} onChange={(e) => setP2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Supply Qs₁</label>
              <input type="number" value={qs1} onChange={(e) => setQs1(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Supply Qs₂</label>
              <input type="number" value={qs2} onChange={(e) => setQs2(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-amber-900 to-orange-950 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-semibold text-amber-300">Supply Elasticity (PES)</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/20">{calc.type}</span>
            </div>
            <div className="text-5xl font-black font-mono my-3">{calc.pes.toFixed(3)}</div>
            <p className="text-xs sm:text-sm text-amber-100 border-t border-white/10 pt-3">{calc.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
