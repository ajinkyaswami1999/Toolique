import { useState, useEffect } from 'react';
import { Settings, Copy, Check, Info } from 'lucide-react';

export default function PrintFarmRevenueCalculator() {
  // Input States
  const [printers, setPrinters] = useState<number>(10);
  const [dailyHours, setDailyHours] = useState<number>(18);
  const [hourlyRate, setHourlyRate] = useState<number>(150);
  const [utilization, setUtilization] = useState<number>(75);

  // Output States
  const [results, setResults] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<boolean>(false);


  // Math Computation
  useEffect(() => {
    try {
      const runCalc = () => {
        
      const activeDailyHours = dailyHours * (utilization / 100);
      const dailyRevenue = printers * activeDailyHours * hourlyRate;
      const monthly = dailyRevenue * 30;
      const yearly = dailyRevenue * 365;
      return {
        'Daily Revenue': '₹' + dailyRevenue.toFixed(2),
        'Monthly Revenue': '₹' + monthly.toFixed(2),
        'Yearly Revenue': '₹' + yearly.toFixed(2)
      };
    
      };
      setResults(runCalc());
    } catch (e) {
      setResults({ 'Error': 'Calculation error' });
    }
  }, [printers, dailyHours, hourlyRate, utilization]);



  const handleCopy = () => {
    const text = Object.entries(results).map(([k, v]) => `${k}: ${v}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="md:col-span-6 p-6 saas-card space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <Settings className="w-4 h-4 text-indigo-650 dark:text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Settings</h3>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Number of Printers</label>
              <input
                type="number"
                value={printers}
                onChange={(e) => setPrinters(Number(e.target.value))}
                className="saas-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Daily Hours Per Printer</label>
              <input
                type="number"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="saas-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Charge Rate (₹/hour)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="saas-input"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Farm Utilization (%)</label>
              <input
                type="number"
                value={utilization}
                onChange={(e) => setUtilization(Number(e.target.value))}
                className="saas-input"
              />
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="md:col-span-6 p-6 saas-card flex flex-col space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Calculated Results</h3>
            <button
              onClick={handleCopy}
              className="text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex-grow space-y-4">
            {Object.entries(results).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800/50">
                <span className="text-xs font-bold text-zinc-550 dark:text-zinc-400">{key}</span>
                <span className="text-sm font-extrabold text-zinc-900 dark:text-white">{val}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/40 dark:border-zinc-800/40 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-relaxed font-semibold">
              All computations are processed strictly in your local browser sandbox. No file uploads or numbers leave your machine.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
