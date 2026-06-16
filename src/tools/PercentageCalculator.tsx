import { useState, useEffect } from 'react';
import { Percent } from 'lucide-react';

export default function PercentageCalculator() {
  // 1. What is X% of Y
  const [x1, setX1] = useState<number>(15);
  const [y1, setY1] = useState<number>(250);
  const [res1, setRes1] = useState<number>(0);

  // 2. X is what % of Y
  const [x2, setX2] = useState<number>(50);
  const [y2, setY2] = useState<number>(200);
  const [res2, setRes2] = useState<number>(0);

  // 3. % increase/decrease from X to Y
  const [x3, setX3] = useState<number>(80);
  const [y3, setY3] = useState<number>(120);
  const [res3, setRes3] = useState<number>(0);

  useEffect(() => {
    setRes1(Number(((x1 * y1) / 100).toFixed(4)));
  }, [x1, y1]);

  useEffect(() => {
    if (y2 === 0) setRes2(0);
    else setRes2(Number(((x2 / y2) * 100).toFixed(4)));
  }, [x2, y2]);

  useEffect(() => {
    if (x3 === 0) setRes3(0);
    else {
      const diff = y3 - x3;
      const pct = (diff / x3) * 100;
      setRes3(Number(pct.toFixed(4)));
    }
  }, [x3, y3]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {/* Type 1 */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Percent className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Calculate Value</h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Percentage (X %)</label>
              <input
                type="number"
                value={x1}
                onChange={(e) => setX1(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Of Value (Y)</label>
              <input
                type="number"
                value={y1}
                onChange={(e) => setY1(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Calculated Result</span>
          <div className="text-xl font-black text-slate-800 dark:text-white mt-1">
            {res1.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Type 2 */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Percent className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Calculate Ratio</h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Value (X)</label>
              <input
                type="number"
                value={x2}
                onChange={(e) => setX2(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Is what percentage of (Y)</label>
              <input
                type="number"
                value={y2}
                onChange={(e) => setY2(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Calculated Result</span>
          <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
            {res2}%
          </div>
        </div>
      </div>

      {/* Type 3 */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Percent className="w-4.5 h-4.5" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Percentage Change</h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">From Value (X)</label>
              <input
                type="number"
                value={x3}
                onChange={(e) => setX3(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">To Value (Y)</label>
              <input
                type="number"
                value={y3}
                onChange={(e) => setY3(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Calculated Result</span>
          <div className={`text-xl font-black mt-1 ${res3 >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {res3 >= 0 ? `+${res3}` : res3}% {res3 >= 0 ? 'Increase' : 'Decrease'}
          </div>
        </div>
      </div>
    </div>
  );
}

