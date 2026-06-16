import { useState, useEffect } from 'react';
import { Compass, Copy, Check, RotateCcw } from 'lucide-react';

export default function StaircaseCalculator() {
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [totalRise, setTotalRise] = useState<number>(120); // inches (10 ft)
  const [desiredRiser, setDesiredRiser] = useState<number>(7); // inches
  const [desiredTread, setDesiredTread] = useState<number>(10.5); // inches
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    numRisers: 0,
    actualRiser: 0,
    numTreads: 0,
    totalRun: 0,
    stairAngle: 0,
    isCompliant: true,
    complianceText: '',
  });

  useEffect(() => {
    if (totalRise <= 0 || desiredRiser <= 0) return;

    // Calculate number of risers (round to nearest whole number)
    const numRisers = Math.round(totalRise / desiredRiser) || 1;
    const actualRiser = totalRise / numRisers;
    const numTreads = Math.max(1, numRisers - 1);
    const totalRun = numTreads * desiredTread;

    // Angle of staircase
    const angleRad = Math.atan(actualRiser / (desiredTread || 1));
    const stairAngle = (angleRad * 180) / Math.PI;

    // Indian Building Code / standard limits:
    // Ideal riser: 5.5 to 7 inches (14 - 18 cm)
    // Ideal tread: 10 to 12 inches (25 - 30 cm)
    // Ideal angle: 30 to 38 degrees
    let isCompliant = true;
    let complianceText = 'Compliant: Comfortable slope';

    if (unit === 'imperial') {
      if (actualRiser > 7.75) {
        isCompliant = false;
        complianceText = 'Warning: Riser is too steep (Max 7.75" recommended)';
      } else if (actualRiser < 4) {
        isCompliant = false;
        complianceText = 'Warning: Riser is too low (Min 4" recommended)';
      } else if (stairAngle > 42) {
        isCompliant = false;
        complianceText = 'Warning: Pitch is too steep (Max 42° recommended)';
      } else if (stairAngle < 25) {
        isCompliant = false;
        complianceText = 'Warning: Pitch is too shallow (Min 25° recommended)';
      }
    } else {
      // Metric (cm)
      if (actualRiser > 19.5) {
        isCompliant = false;
        complianceText = 'Warning: Riser is too steep (Max 19.5 cm recommended)';
      } else if (actualRiser < 10) {
        isCompliant = false;
        complianceText = 'Warning: Riser is too low (Min 10 cm recommended)';
      } else if (stairAngle > 42) {
        isCompliant = false;
        complianceText = 'Warning: Pitch is too steep (Max 42° recommended)';
      } else if (stairAngle < 25) {
        isCompliant = false;
        complianceText = 'Warning: Pitch is too shallow (Min 25° recommended)';
      }
    }

    setResults({
      numRisers,
      actualRiser: Number(actualRiser.toFixed(2)),
      numTreads,
      totalRun: Number(totalRun.toFixed(2)),
      stairAngle: Number(stairAngle.toFixed(1)),
      isCompliant,
      complianceText,
    });
  }, [totalRise, desiredRiser, desiredTread, unit]);

  const copyReport = () => {
    const unitLabel = unit === 'imperial' ? 'inches' : 'cm';
    const text = `Staircase Geometry Report (Toolique)
----------------------------------------
Unit Mode         : ${unit.toUpperCase()}
Total Rise (Height): ${totalRise} ${unitLabel}
Target Riser      : ${desiredRiser} ${unitLabel}
Target Tread      : ${desiredTread} ${unitLabel}
----------------------------------------
Number of Risers  : ${results.numRisers}
Actual Riser Height: ${results.actualRiser} ${unitLabel}
Number of Treads  : ${results.numTreads}
Total Run (Length): ${results.totalRun} ${unitLabel}
Stair Pitch Angle : ${results.stairAngle}°
Bylaw Status      : ${results.complianceText}
----------------------------------------
Calculated u/s National Building Code (NBC) stair guidelines.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (unit === 'imperial') {
      setTotalRise(120);
      setDesiredRiser(7);
      setDesiredTread(10.5);
    } else {
      setTotalRise(300);
      setDesiredRiser(17.5);
      setDesiredTread(27);
    }
  };

  const handleUnitChange = (newUnit: 'imperial' | 'metric') => {
    setUnit(newUnit);
    if (newUnit === 'imperial') {
      setTotalRise(120);
      setDesiredRiser(7);
      setDesiredTread(10.5);
    } else {
      setTotalRise(300);
      setDesiredRiser(17.5);
      setDesiredTread(27);
    }
  };

  const unitLabel = unit === 'imperial' ? 'in' : 'cm';

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Staircase Dimensions</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
              <button
                onClick={() => handleUnitChange('imperial')}
                className={`px-2 py-1 rounded-md transition ${unit === 'imperial' ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
              >
                Imperial
              </button>
              <button
                onClick={() => handleUnitChange('metric')}
                className={`px-2 py-1 rounded-md transition ${unit === 'metric' ? 'bg-white dark:bg-slate-700 text-violet-600 shadow-sm' : 'text-slate-400'}`}
              >
                Metric
              </button>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-650 dark:hover:text-slate-200 transition"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floor Height */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Total Floor-to-Floor Rise ({unitLabel === 'in' ? 'Inches' : 'cm'})
          </label>
          <input
            type="number"
            value={totalRise || ''}
            onChange={(e) => setTotalRise(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-violet-500 focus:outline-none"
          />
          <p className="text-[10px] text-slate-400 mt-1">
            {unit === 'imperial' 
              ? `Equivalent to ${(totalRise / 12).toFixed(1)} feet.`
              : `Equivalent to ${(totalRise / 100).toFixed(2)} meters.`}
          </p>
        </div>

        {/* Riser & Tread Target */}
        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Target Riser Height ({unitLabel})
            </label>
            <input
              type="number"
              step="0.1"
              value={desiredRiser || ''}
              onChange={(e) => setDesiredRiser(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-violet-500 focus:outline-none"
            />
            <p className="text-[9px] text-slate-400 mt-1">Ideal: 6-7" (15-18cm)</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Target Tread Depth ({unitLabel})
            </label>
            <input
              type="number"
              step="0.1"
              value={desiredTread || ''}
              onChange={(e) => setDesiredTread(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-violet-500 focus:outline-none"
            />
            <p className="text-[9px] text-slate-400 mt-1">Ideal: 10-12" (25-30cm)</p>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
              Stair Geometry Results
            </span>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold transition shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400">Total Risers Required</span>
              <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {results.numRisers} Steps
              </div>
              <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-2 ${
                results.isCompliant
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500'
              }`}>
                {results.complianceText}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Actual Riser Height</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.actualRiser} {unitLabel}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium font-mono">Number of Treads</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.numTreads} Treads
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Total Horizontal Run</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.totalRun} {unitLabel}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Stair Pitch Angle</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 font-mono">
                  {results.stairAngle}°
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Ideal stair angle should lie between 30° and 38°. Treads and risers follow the standard rule: 2 × Riser + Tread = 24 to 25 inches (60 to 64 cm) for natural walking rhythm.
          </p>
        </div>
      </div>
    </div>
  );
}
