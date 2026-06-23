import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';

export default function UPSCalculator() {
  const [load, setLoad] = useState<number>(500); // Watts default
  const [loadUnit, setLoadUnit] = useState<'watts' | 'va'>('watts');
  const [powerFactor, setPowerFactor] = useState<number>(0.8);
  const [margin, setMargin] = useState<number>(20); // 20% safety margin
  const [backupTime, setBackupTime] = useState<number>(3); // 3 hours
  const [dcVoltage, setDcVoltage] = useState<number>(12); // 12V battery system
  
  const [batteryType, setBatteryType] = useState<'lead_acid' | 'lithium'>('lead_acid');
  const [efficiency, setEfficiency] = useState<number>(85); // 85% inverter efficiency

  // Outputs
  const [requiredUpsCapacity, setRequiredUpsCapacity] = useState<number>(0); // VA
  const [requiredBatteryAh, setRequiredBatteryAh] = useState<number>(0);
  const [batteryWh, setBatteryWh] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // 1. Calculate Load in VA
    const loadVA = loadUnit === 'va' ? load : load / powerFactor;
    const loadW = loadUnit === 'watts' ? load : load * powerFactor;

    // 2. Calculate UPS capacity required (with safety margin)
    const upsVA = loadVA * (1 + margin / 100);
    setRequiredUpsCapacity(upsVA);

    // 3. Calculate Battery requirements
    // Depth of Discharge (DoD) factor
    const dod = batteryType === 'lead_acid' ? 0.7 : 0.9; // Lead acid is 70% max discharge, Lithium is 90%
    const effFactor = efficiency / 100;

    // Battery energy required in Watt-hours
    const whRequired = (loadW * backupTime) / (effFactor * dod);
    setBatteryWh(whRequired);

    // Ah required at system voltage
    const ahRequired = whRequired / dcVoltage;
    setRequiredBatteryAh(ahRequired);

  }, [load, loadUnit, powerFactor, margin, backupTime, dcVoltage, batteryType, efficiency]);

  const handleCopy = () => {
    const summary = `UPS and Battery Backup Calculator Report
--------------------------------------
Connected Load: ${load} ${loadUnit.toUpperCase()}
Power Factor: ${powerFactor}
Safety Margin: ${margin}%
Desired Backup Time: ${backupTime} Hours
Battery System Voltage: ${dcVoltage} V
Battery Type: ${batteryType === 'lead_acid' ? 'Lead Acid (70% DoD)' : 'Lithium (90% DoD)'}
Inverter Efficiency: ${efficiency}%
--------------------------------------
Required UPS Rating: ${requiredUpsCapacity.toFixed(0)} VA
Estimated Battery Energy: ${batteryWh.toFixed(0)} Wh
Recommended Battery Bank: ${requiredBatteryAh.toFixed(1)} Ah at ${dcVoltage}V
Configuration Suggestions:
- E.g. ${Math.ceil(requiredBatteryAh / 150)} x 12V 150Ah batteries in parallel (if 12V system)`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setLoad(500);
    setLoadUnit('watts');
    setPowerFactor(0.8);
    setMargin(20);
    setBackupTime(3);
    setDcVoltage(12);
    setBatteryType('lead_acid');
    setEfficiency(85);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Input panel (Left) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">UPS Calculator Inputs</h3>
            <button
              onClick={handleReset}
              className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition cursor-pointer"
              title="Reset Parameters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">CONNECTED LOAD</label>
              <input
                type="number"
                value={load}
                onChange={(e) => setLoad(Math.max(1, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">UNIT</label>
              <select
                value={loadUnit}
                onChange={(e) => setLoadUnit(e.target.value as any)}
                className="saas-select w-full"
              >
                <option value="watts">Watts (W)</option>
                <option value="va">Volt-Amp (VA)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">POWER FACTOR (COS Φ)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="1.0"
                value={powerFactor}
                disabled={loadUnit === 'va'}
                onChange={(e) => setPowerFactor(Math.min(1.0, Math.max(0.1, Number(e.target.value))))}
                className="saas-input w-full disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">SAFETY MARGIN (%)</label>
              <input
                type="number"
                value={margin}
                onChange={(e) => setMargin(Math.max(0, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">BACKUP TIME (HOURS)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={backupTime}
                onChange={(e) => setBackupTime(Math.max(0.5, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">BATTERY VOLTAGE (V)</label>
              <select
                value={dcVoltage}
                onChange={(e) => setDcVoltage(Number(e.target.value))}
                className="saas-select w-full"
              >
                <option value="12">12 V (Single Battery)</option>
                <option value="24">24 V (2 Batteries)</option>
                <option value="36">36 V (3 Batteries)</option>
                <option value="48">48 V (4 Batteries)</option>
                <option value="96">96 V</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">BATTERY CHEMISTRY</label>
              <select
                value={batteryType}
                onChange={(e) => setBatteryType(e.target.value as any)}
                className="saas-select w-full"
              >
                <option value="lead_acid">Lead Acid (70% DoD)</option>
                <option value="lithium">Lithium-Ion (90% DoD)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1.5">UPS INVERTER EFFICIENCY (%)</label>
            <input
              type="number"
              min="50"
              max="100"
              value={efficiency}
              onChange={(e) => setEfficiency(Math.min(100, Math.max(50, Number(e.target.value))))}
              className="saas-input w-full"
            />
          </div>
        </div>
      </div>

      {/* Output Panel (Right) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Sizing Results</h3>
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
            <span className="block text-[10px] font-bold text-zinc-400">RECOMMENDED UPS CAPACITY</span>
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {requiredUpsCapacity.toFixed(0)} <span className="text-xl">VA</span>
            </span>
            <span className="block text-[10px] text-zinc-400 font-semibold mt-1">
              Provides {margin}% safety buffer over connected load
            </span>
          </div>

          <div className="text-center py-6 px-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
            <span className="block text-[10px] font-bold text-zinc-400">REQUIRED BATTERY CAPACITY</span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {requiredBatteryAh.toFixed(1)} <span className="text-xl">Ah</span>
            </span>
            <span className="block text-[10px] text-zinc-400 font-semibold mt-1">
              Battery bank sized at {dcVoltage}V DC system
            </span>
          </div>

          <div className="space-y-2.5 text-xs border-t border-zinc-100 dark:border-zinc-850 pt-4">
            <div className="flex justify-between text-zinc-650 dark:text-zinc-400">
              <span>Total Battery Energy:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {batteryWh.toFixed(0)} Wh ({(batteryWh / 1000).toFixed(2)} kWh)
              </span>
            </div>
            <div className="flex justify-between text-zinc-650 dark:text-zinc-400">
              <span>12V Battery Suggestion:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {Math.ceil(requiredBatteryAh / 150)} x 150Ah Batteries
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
