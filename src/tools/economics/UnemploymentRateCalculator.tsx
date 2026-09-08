import { useState, useMemo } from 'react';
import { Users } from 'lucide-react';

export default function UnemploymentRateCalculator() {
  const [employed, setEmployed] = useState<number>(45000000);
  const [unemployed, setUnemployed] = useState<number>(3200000);
  const [workingAge, setWorkingAge] = useState<number>(75000000);

  const calc = useMemo(() => {
    const laborForce = employed + unemployed;
    const unempRate = laborForce > 0 ? (unemployed / laborForce) * 100 : 0;
    const lfpr = workingAge > 0 ? (laborForce / workingAge) * 100 : 0;
    return { laborForce, unempRate, lfpr };
  }, [employed, unemployed, workingAge]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">Macroeconomics</span>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Unemployment Rate & Labor Force Participation Calculator
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Calculate headline unemployment rate and Labor Force Participation Rate (LFPR).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xs">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Employed Population</label>
            <input type="number" value={employed} onChange={(e) => setEmployed(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Unemployed (Actively Looking)</label>
            <input type="number" value={unemployed} onChange={(e) => setUnemployed(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">Working-Age Civilian Population</label>
            <input type="number" value={workingAge} onChange={(e) => setWorkingAge(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-rose-900 to-pink-950 rounded-2xl p-5 text-white">
              <span className="text-xs uppercase font-semibold text-rose-300">Unemployment Rate</span>
              <div className="text-4xl font-black font-mono my-2">{calc.unempRate.toFixed(2)}%</div>
              <p className="text-xs text-rose-200">Unemployed ÷ Labor Force</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-2xl p-5 text-white">
              <span className="text-xs uppercase font-semibold text-blue-300">Participation Rate (LFPR)</span>
              <div className="text-4xl font-black font-mono my-2">{calc.lfpr.toFixed(2)}%</div>
              <p className="text-xs text-blue-200">Labor Force ÷ Working Age</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
