import { useState } from 'react';
import { Heart, Sparkles, RefreshCw } from 'lucide-react';

export default function BMICalculator() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(170);
  const [weightLbs, setWeightLbs] = useState<number>(154);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(7);

  // Calculation Math
  let bmi = 0;
  if (unit === 'metric') {
    const heightM = heightCm / 100;
    if (heightM > 0) {
      bmi = weight / (heightM * heightM);
    }
  } else {
    const totalInches = heightFt * 12 + heightIn;
    if (totalInches > 0) {
      bmi = (weightLbs / (totalInches * totalInches)) * 703;
    }
  }

  // Determine BMI Category
  let category = '';
  let categoryColor = '';
  let categoryText = '';
  if (bmi < 18.5) {
    category = 'Underweight';
    categoryColor = 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    categoryText = 'Your weight is lower than normal. Focus on a balanced diet to build healthy weight.';
  } else if (bmi >= 18.5 && bmi < 25) {
    category = 'Normal';
    categoryColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    categoryText = 'Great job! Your body weight index is in the optimal range. Keep up the active lifestyle.';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    categoryColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    categoryText = 'Your BMI is slightly high. Balanced workouts and portion control can help return to normal range.';
  } else {
    category = 'Obese';
    categoryColor = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    categoryText = 'Your BMI indicates obesity. We advise consulting a nutritionist or trainer to manage health risks.';
  }

  const handleReset = () => {
    setWeight(70);
    setHeightCm(170);
    setWeightLbs(154);
    setHeightFt(5);
    setHeightIn(7);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Input settings */}
      <div className="lg:col-span-2 saas-card p-6 space-y-6 text-left">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Heart className="w-4.5 h-4.5 text-rose-500" />
            <span>Body Mass Index (BMI) Inputs</span>
          </h3>
          <div className="flex bg-zinc-105 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
            <button
              onClick={() => setUnit('metric')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                unit === 'metric' ? 'bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Metric
            </button>
            <button
              onClick={() => setUnit('imperial')}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                unit === 'imperial' ? 'bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-50 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Imperial
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {unit === 'metric' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Weight (kg)</label>
                  <input
                    type="number"
                    value={weight === 0 ? '' : weight}
                    onChange={(e) => setWeight(Math.max(0, Number(e.target.value)))}
                    className="w-full saas-input text-sm px-3 py-2"
                    placeholder="70"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm === 0 ? '' : heightCm}
                    onChange={(e) => setHeightCm(Math.max(0, Number(e.target.value)))}
                    className="w-full saas-input text-sm px-3 py-2"
                    placeholder="170"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Weight (lbs)</label>
                  <input
                    type="number"
                    value={weightLbs === 0 ? '' : weightLbs}
                    onChange={(e) => setWeightLbs(Math.max(0, Number(e.target.value)))}
                    className="w-full saas-input text-sm px-3 py-2"
                    placeholder="154"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Height (feet)</label>
                  <input
                    type="number"
                    value={heightFt === 0 ? '' : heightFt}
                    onChange={(e) => setHeightFt(Math.max(0, Number(e.target.value)))}
                    className="w-full saas-input text-sm px-3 py-2"
                    placeholder="5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Height (inches)</label>
                  <input
                    type="number"
                    value={heightIn === 0 ? '' : heightIn}
                    onChange={(e) => setHeightIn(Math.max(0, Number(e.target.value)))}
                    className="w-full saas-input text-sm px-3 py-2"
                    placeholder="7"
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:text-indigo-500 hover:border-indigo-500/30 flex items-center gap-1.5 transition duration-300"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Values</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calculations results */}
      <div className="space-y-6 text-left">
        <div className="saas-card p-6 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Health Report</span>
          </h3>

          <div className="space-y-5">
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">Your BMI</span>
                <p className="text-3xl font-black text-zinc-900 dark:text-white mt-0.5">
                  {bmi > 0 ? bmi.toFixed(1) : '0.0'}
                </p>
              </div>
              {bmi > 0 && (
                <span className={`px-3 py-1 text-xs font-extrabold rounded-lg border ${categoryColor}`}>
                  {category}
                </span>
              )}
            </div>

            {/* Custom visual indicator bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">
                <span>Underweight</span>
                <span>Normal</span>
                <span>Overweight</span>
                <span>Obese</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden flex">
                <div className="h-full bg-blue-500" style={{ width: '25%' }} />
                <div className="h-full bg-emerald-500" style={{ width: '25%' }} />
                <div className="h-full bg-amber-500" style={{ width: '25%' }} />
                <div className="h-full bg-rose-500" style={{ width: '25%' }} />
              </div>
              {bmi > 0 && (
                <div className="relative w-full text-xs">
                  <div
                    className="absolute h-2 w-2 rounded-full bg-zinc-900 dark:bg-white border-2 border-white dark:border-zinc-900 -top-4 -translate-x-1/2 transition-all duration-500"
                    style={{
                      left: `${Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100))}%`
                    }}
                  />
                </div>
              )}
            </div>

            {bmi > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/50 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {categoryText}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
