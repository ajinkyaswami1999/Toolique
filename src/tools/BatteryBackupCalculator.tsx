import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';

const DOD_VALUES = {
  tubular: 0.5, // 50% standard tubular lead acid
  agm: 0.7,     // 70% AGM / GEL
  lithium: 0.9, // 90% standard lithium
  lifepo4: 0.95 // 95% LiFePO4
};

export default function BatteryBackupCalculator() {
  const [load, setLoad] = useState<number>(300); // Watts default
  const [voltage, setVoltage] = useState<number>(12); // 12V battery default
  const [capacity, setCapacity] = useState<number>(150); // 150 Ah battery default
  const [batteryType, setBatteryType] = useState<'tubular' | 'agm' | 'lithium' | 'lifepo4'>('tubular');
  const [efficiency, setEfficiency] = useState<number>(85); // 85% inverter/cable efficiency default

  // Outputs
  const [totalEnergyWh, setTotalEnergyWh] = useState<number>(0);
  const [usableEnergyWh, setUsableEnergyWh] = useState<number>(0);
  const [backupHours, setBackupHours] = useState<number>(0);
  const [backupMins, setBackupMins] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // 1. Calculate Total Energy in Wh
    const totalWh = capacity * voltage;
    setTotalEnergyWh(totalWh);

    // 2. Calculate Usable Energy considering Depth of Discharge (DoD)
    const dod = DOD_VALUES[batteryType];
    const usableWh = totalWh * dod;
    setUsableEnergyWh(usableWh);

    // 3. Calculate Backup Time (Hours) considering Inverter/system efficiency
    const hours = (usableWh * (efficiency / 100)) / load;
    
    if (isNaN(hours) || hours < 0 || !isFinite(hours)) {
      setBackupHours(0);
      setBackupMins(0);
    } else {
      const wholeHours = Math.floor(hours);
      const remainingMins = Math.round((hours - wholeHours) * 60);
      setBackupHours(wholeHours);
      setBackupMins(remainingMins);
    }

  }, [load, voltage, capacity, batteryType, efficiency]);

  const handleCopy = () => {
    const summary = `Battery Backup Run-Time Report
--------------------------------------
Connected Load: ${load} Watts
Battery Spec: ${capacity} Ah at ${voltage}V
Battery Type: ${batteryType.toUpperCase()} (DoD: ${DOD_VALUES[batteryType] * 100}%)
Inverter Efficiency: ${efficiency}%
--------------------------------------
Total Energy Capacity: ${totalEnergyWh.toFixed(0)} Wh (${(totalEnergyWh / 1000).toFixed(2)} kWh)
Usable Energy Capacity: ${usableEnergyWh.toFixed(0)} Wh (${(usableEnergyWh / 1000).toFixed(2)} kWh)
Estimated Backup Run-time: ${backupHours} Hours ${backupMins} Minutes`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setLoad(300);
    setVoltage(12);
    setCapacity(150);
    setBatteryType('tubular');
    setEfficiency(85);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Inputs panel (Left) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Backup Parameters</h3>
            <button
              onClick={handleReset}
              className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition cursor-pointer"
              title="Reset Parameters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">CONNECTED LOAD (WATTS)</label>
              <input
                type="number"
                value={load}
                onChange={(e) => setLoad(Math.max(1, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">BATTERY CHEMISTRY TYPE</label>
              <select
                value={batteryType}
                onChange={(e) => setBatteryType(e.target.value as any)}
                className="saas-select w-full"
              >
                <option value="tubular">Tubular Lead Acid (50% DoD)</option>
                <option value="agm">AGM / GEL Lead Acid (70% DoD)</option>
                <option value="lithium">Lithium-Ion (90% DoD)</option>
                <option value="lifepo4">Lithium Iron Phosphate / LiFePO4 (95% DoD)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">BATTERY VOLTAGE (V)</label>
              <select
                value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))}
                className="saas-select w-full"
              >
                <option value="12">12 V</option>
                <option value="24">24 V</option>
                <option value="48">48 V</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">BATTERY CAPACITY (Ah)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">INVERTER EFFICIENCY (%)</label>
              <input
                type="number"
                value={efficiency}
                onChange={(e) => setEfficiency(Math.min(100, Math.max(10, Number(e.target.value))))}
                className="saas-input w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel (Right) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Run-time Sizing</h3>
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
            <span className="block text-[10px] font-bold text-zinc-400">ESTIMATED RUN-TIME</span>
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {backupHours} <span className="text-xl">Hrs</span> {backupMins} <span className="text-xl">Mins</span>
            </span>
            <span className="block text-[10px] text-zinc-400 font-semibold mt-1">
              Backup duration at constant {load}W load
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">TOTAL ENERGY</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100">
                {totalEnergyWh.toFixed(0)} Wh
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">USABLE ENERGY</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100">
                {usableEnergyWh.toFixed(0)} Wh
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs border-t border-zinc-100 dark:border-zinc-850 pt-4">
            <div className="flex justify-between text-zinc-650 dark:text-zinc-400">
              <span>Depth of Discharge (DoD):</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {DOD_VALUES[batteryType] * 100}%
              </span>
            </div>
            <div className="flex justify-between text-zinc-650 dark:text-zinc-400">
              <span>Energy in Kilowatt-hours:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {(usableEnergyWh / 1000).toFixed(2)} kWh usable
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
