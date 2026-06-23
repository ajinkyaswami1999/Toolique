import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';

export default function SolarPanelCalculator() {
  const [inputType, setInputType] = useState<'consumption' | 'bill'>('consumption');
  const [monthlyConsumption, setMonthlyConsumption] = useState<number>(300); // 300 kWh/units default
  const [monthlyBill, setMonthlyBill] = useState<number>(2000); // ₹2000 default
  const [electricityRate, setElectricityRate] = useState<number>(7); // ₹7/unit standard
  
  const [peakSunHours, setPeakSunHours] = useState<number>(4.5); // 4.5 hours average in India
  const [panelRating, setPanelRating] = useState<number>(400); // 400 Watt panels default
  const [efficiency, setEfficiency] = useState<number>(75); // 75% system efficiency factor

  // Outputs
  const [systemSizeKw, setSystemSizeKw] = useState<number>(0);
  const [panelCount, setPanelCount] = useState<number>(0);
  const [roofAreaSqM, setRoofAreaSqM] = useState<number>(0);
  const [roofAreaSqFt, setRoofAreaSqFt] = useState<number>(0);
  const [dailyGeneration, setDailyGeneration] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // 1. Determine monthly consumption in kWh
    let monthlyKwh = monthlyConsumption;
    if (inputType === 'bill') {
      monthlyKwh = monthlyBill / electricityRate;
    }

    // Daily consumption in kWh
    const dailyKwh = monthlyKwh / 30;

    // 2. Required PV Solar Array size (kW)
    // Sized to cover daily consumption considering peak sun hours and loss factors
    const systemSize = dailyKwh / (peakSunHours * (efficiency / 100));
    setSystemSizeKw(isNaN(systemSize) || systemSize < 0 ? 0 : systemSize);

    // 3. Panel count calculation
    const panels = Math.ceil((systemSize * 1000) / panelRating);
    setPanelCount(isNaN(panels) || panels < 0 ? 0 : panels);

    // 4. Roof Area estimation
    // A standard 400W solar panel is approx 2.0 sq meters (or 21.5 sq ft) including walk space spacing
    const areaM2 = panels * 2.0;
    const areaFt2 = areaM2 * 10.7639;
    setRoofAreaSqM(isNaN(areaM2) ? 0 : areaM2);
    setRoofAreaSqFt(isNaN(areaFt2) ? 0 : areaFt2);

    // 5. Expected daily generation
    const dailyGen = systemSize * peakSunHours * (efficiency / 100);
    setDailyGeneration(isNaN(dailyGen) ? 0 : dailyGen);

  }, [inputType, monthlyConsumption, monthlyBill, electricityRate, peakSunHours, panelRating, efficiency]);

  const handleCopy = () => {
    const summary = `Solar PV System Sizing Report
--------------------------------------
Monthly Consumption: ${inputType === 'consumption' ? monthlyConsumption : (monthlyBill / electricityRate).toFixed(0)} kWh
Target Peak Sun Hours: ${peakSunHours} hours/day
Solar Panel Watt Rating: ${panelRating} W
System Efficiency: ${efficiency}%
--------------------------------------
Recommended PV System Size: ${systemSizeKw.toFixed(2)} kW
Total Solar Panels Required: ${panelCount} Panels
Approximate Roof Space Needed: ${roofAreaSqFt.toFixed(0)} sq ft (${roofAreaSqM.toFixed(1)} m²)
Estimated Daily Solar Generation: ${dailyGeneration.toFixed(2)} kWh / Units
Est. Monthly Generation: ${(dailyGeneration * 30).toFixed(0)} kWh`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setInputType('consumption');
    setMonthlyConsumption(300);
    setMonthlyBill(2000);
    setElectricityRate(7);
    setPeakSunHours(4.5);
    setPanelRating(400);
    setEfficiency(75);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Inputs (Left) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Solar PV Parameters</h3>
            <button
              onClick={handleReset}
              className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition cursor-pointer"
              title="Reset Parameters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setInputType('consumption')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer text-center ${inputType === 'consumption' ? 'border-indigo-500 bg-indigo-50/5 text-indigo-650 dark:text-indigo-400' : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
            >
              By Monthly Units (kWh)
            </button>
            <button
              type="button"
              onClick={() => setInputType('bill')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer text-center ${inputType === 'bill' ? 'border-indigo-500 bg-indigo-50/5 text-indigo-650 dark:text-indigo-400' : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
            >
              By Monthly Bill Amount
            </button>
          </div>

          {inputType === 'consumption' ? (
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">MONTHLY POWER CONSUMPTION (kWh / UNITS)</label>
              <input
                type="number"
                value={monthlyConsumption}
                onChange={(e) => setMonthlyConsumption(Math.max(1, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">MONTHLY BILL (₹)</label>
                <input
                  type="number"
                  value={monthlyBill}
                  onChange={(e) => setMonthlyBill(Math.max(1, Number(e.target.value)))}
                  className="saas-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">TARIFF RATE (₹ / kWh)</label>
                <input
                  type="number"
                  value={electricityRate}
                  onChange={(e) => setElectricityRate(Math.max(0.1, Number(e.target.value)))}
                  className="saas-input w-full"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">PEAK SUN HOURS / DAY</label>
              <input
                type="number"
                step="0.1"
                value={peakSunHours}
                onChange={(e) => setPeakSunHours(Math.max(1, Number(e.target.value)))}
                className="saas-input w-full"
                title="Average solar peak hours in your area (usually 4 to 5.5)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">SOLAR PANEL RATING (W)</label>
              <select
                value={panelRating}
                onChange={(e) => setPanelRating(Number(e.target.value))}
                className="saas-select w-full"
              >
                <option value="330">330 Watts</option>
                <option value="400">400 Watts</option>
                <option value="450">450 Watts</option>
                <option value="540">540 Watts</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">SYSTEM EFFICIENCY (%)</label>
              <input
                type="number"
                value={efficiency}
                onChange={(e) => setEfficiency(Math.min(100, Math.max(10, Number(e.target.value))))}
                className="saas-input w-full"
                title="Saves buffer for dust, wiring, and inverter losses (usually 70-80%)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Outputs (Right) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Solar Estimation</h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-650 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center py-6 px-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
            <span className="block text-[10px] font-bold text-zinc-400">REQUIRED SYSTEM SIZE</span>
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {systemSizeKw.toFixed(2)} <span className="text-xl">kW</span>
            </span>
            <span className="block text-[10px] text-zinc-400 font-semibold mt-1">
              Required capacity to offset your consumption
            </span>
          </div>

          {/* Sizing Parameters Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">SOLAR PANELS</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100">
                {panelCount} Panels
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">ROOF SPACE NEEDED</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100">
                {roofAreaSqFt.toFixed(0)} <span className="text-xs">sq ft</span>
              </span>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="space-y-2.5 text-xs border-t border-zinc-100 dark:border-zinc-850 pt-4">
            <div className="flex justify-between text-zinc-650 dark:text-zinc-400">
              <span>Avg. Daily Generation:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {dailyGeneration.toFixed(2)} kWh
              </span>
            </div>
            <div className="flex justify-between text-zinc-650 dark:text-zinc-400">
              <span>Roof Space in Metres:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {roofAreaSqM.toFixed(1)} m²
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
