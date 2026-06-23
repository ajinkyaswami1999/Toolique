import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash2, Copy, Check } from 'lucide-react';

interface LoadItem {
  id: string;
  name: string;
  wattage: number;
  quantity: number;
  category: 'lighting' | 'cooling' | 'heating' | 'general' | 'motor';
}

const PRESET_APPLIANCES = [
  { name: 'LED Bulb', wattage: 15, category: 'lighting' },
  { name: 'Ceiling Fan', wattage: 75, category: 'cooling' },
  { name: 'Air Conditioner (1.5 Ton)', wattage: 1800, category: 'cooling' },
  { name: 'Refrigerator', wattage: 250, category: 'general' },
  { name: 'Microwave Oven', wattage: 1200, category: 'general' },
  { name: 'Geyser / Water Heater', wattage: 3000, category: 'heating' },
  { name: 'Television (LED)', wattage: 100, category: 'general' },
  { name: 'Desktop Computer', wattage: 250, category: 'general' },
  { name: 'Water Pump (1 HP)', wattage: 746, category: 'motor' },
  { name: 'Washing Machine', wattage: 800, category: 'general' }
];

// Diversity/Demand factors for different load types
const DIVERSITY_FACTORS = {
  lighting: 0.6,
  cooling: 0.8,
  heating: 0.7,
  general: 0.5,
  motor: 0.9
};

export default function LoadCalculator() {
  const [items, setItems] = useState<LoadItem[]>([
    { id: '1', name: 'LED Bulb', wattage: 15, quantity: 10, category: 'lighting' },
    { id: '2', name: 'Ceiling Fan', wattage: 75, quantity: 5, category: 'cooling' },
    { id: '3', name: 'Refrigerator', wattage: 250, quantity: 1, category: 'general' },
    { id: '4', name: 'Air Conditioner (1.5 Ton)', wattage: 1800, quantity: 2, category: 'cooling' }
  ]);

  const [phase, setPhase] = useState<'1phase' | '3phase'>('1phase');
  const [voltage, setVoltage] = useState<number>(230);
  const [powerFactor, setPowerFactor] = useState<number>(0.85);

  const [totalConnectedLoad, setTotalConnectedLoad] = useState<number>(0); // Watts
  const [maxDemandLoad, setMaxDemandLoad] = useState<number>(0); // Watts
  const [connectedCurrent, setConnectedCurrent] = useState<number>(0);
  const [demandCurrent, setDemandCurrent] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Dynamic Add item form
  const [customName, setCustomName] = useState<string>('');
  const [customWattage, setCustomWattage] = useState<number>(100);
  const [customQty, setCustomQty] = useState<number>(1);
  const [customCategory, setCustomCategory] = useState<'lighting' | 'cooling' | 'heating' | 'general' | 'motor'>('general');

  useEffect(() => {
    // 1. Calculate loads
    let connectedSum = 0;
    let demandSum = 0;

    items.forEach(item => {
      const itemTotal = item.wattage * item.quantity;
      connectedSum += itemTotal;
      demandSum += itemTotal * DIVERSITY_FACTORS[item.category];
    });

    setTotalConnectedLoad(connectedSum);
    setMaxDemandLoad(demandSum);

    // 2. Calculate Currents (Amps)
    let cCurrent = 0;
    let dCurrent = 0;
    
    if (phase === '1phase') {
      cCurrent = connectedSum / (voltage * powerFactor);
      dCurrent = demandSum / (voltage * powerFactor);
    } else {
      // 3 phase
      cCurrent = connectedSum / (Math.sqrt(3) * voltage * powerFactor);
      dCurrent = demandSum / (Math.sqrt(3) * voltage * powerFactor);
    }

    setConnectedCurrent(isNaN(cCurrent) ? 0 : cCurrent);
    setDemandCurrent(isNaN(dCurrent) ? 0 : dCurrent);
  }, [items, phase, voltage, powerFactor]);

  const handleAddItem = (presetIndex: number | 'custom') => {
    if (presetIndex === 'custom') {
      if (!customName.trim()) return;
      const newItem: LoadItem = {
        id: Date.now().toString(),
        name: customName.trim(),
        wattage: customWattage,
        quantity: customQty,
        category: customCategory
      };
      setItems([...items, newItem]);
      setCustomName('');
    } else {
      const preset = PRESET_APPLIANCES[presetIndex];
      const newItem: LoadItem = {
        id: Date.now().toString(),
        name: preset.name,
        wattage: preset.wattage,
        quantity: 1,
        category: preset.category as any
      };
      setItems([...items, newItem]);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: 'wattage' | 'quantity', val: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: Math.max(1, val) };
      }
      return item;
    }));
  };

  const handleReset = () => {
    setItems([
      { id: '1', name: 'LED Bulb', wattage: 15, quantity: 10, category: 'lighting' },
      { id: '2', name: 'Ceiling Fan', wattage: 75, quantity: 5, category: 'cooling' },
      { id: '3', name: 'Refrigerator', wattage: 250, quantity: 1, category: 'general' }
    ]);
    setPhase('1phase');
    setVoltage(230);
    setPowerFactor(0.85);
  };

  const handleCopy = () => {
    let listStr = items.map(item => `  - ${item.name}: ${item.wattage}W x ${item.quantity} = ${item.wattage * item.quantity}W (${item.category})`).join('\n');
    
    const summary = `Connected Load Calculator Report
--------------------------------------
Appliance Load List:
${listStr}
--------------------------------------
Total Connected Load: ${(totalConnectedLoad / 1000).toFixed(2)} kW
Estimated Maximum Demand: ${(maxDemandLoad / 1000).toFixed(2)} kW (Diversity factors applied)
System Voltage: ${voltage} V (${phase === '1phase' ? '1-Phase AC' : '3-Phase AC'})
Power Factor: ${powerFactor}
Connected Load Current: ${connectedCurrent.toFixed(2)} A
Max Demand Current: ${demandCurrent.toFixed(2)} A`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* List Builder (Left) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Connected Load List Builder</h3>
            <button
              onClick={handleReset}
              className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition cursor-pointer"
              title="Reset Items"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick presets selectors */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400">QUICK ADD APPLIANCE PRESETS</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_APPLIANCES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddItem(idx)}
                  className="px-2.5 py-1 text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 rounded-lg cursor-pointer bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 transition"
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Table List of Added Loads */}
          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-850 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-550 border-b border-zinc-150 dark:border-zinc-800">
                <tr>
                  <th className="p-3 text-left font-bold">Appliance Name</th>
                  <th className="p-3 text-left font-bold">Category</th>
                  <th className="p-3 text-left font-bold">Wattage (W)</th>
                  <th className="p-3 text-left font-bold">Qty</th>
                  <th className="p-3 text-left font-bold">Total W</th>
                  <th className="p-3 text-center font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/70">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10">
                    <td className="p-3 font-bold text-zinc-800 dark:text-zinc-200">{item.name}</td>
                    <td className="p-3 capitalize text-zinc-450 dark:text-zinc-500">{item.category}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={item.wattage}
                        onChange={(e) => handleUpdateItem(item.id, 'wattage', Number(e.target.value))}
                        className="w-16 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-12 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold"
                      />
                    </td>
                    <td className="p-3 font-bold text-zinc-700 dark:text-zinc-300">
                      {item.wattage * item.quantity} W
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-650 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add custom appliance row form */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-800">
            <div className="md:col-span-4">
              <input
                type="text"
                placeholder="Custom appliance name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="saas-input w-full py-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="number"
                placeholder="Watts"
                value={customWattage}
                onChange={(e) => setCustomWattage(Number(e.target.value))}
                className="saas-input w-full py-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="number"
                placeholder="Qty"
                value={customQty}
                onChange={(e) => setCustomQty(Number(e.target.value))}
                className="saas-input w-full py-1.5"
              />
            </div>
            <div className="md:col-span-2">
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as any)}
                className="saas-select w-full py-1.5 text-xs"
              >
                <option value="general">General</option>
                <option value="lighting">Lighting</option>
                <option value="cooling">Cooling</option>
                <option value="heating">Heating</option>
                <option value="motor">Motor</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => handleAddItem('custom')}
                className="w-full saas-button-primary py-1.5 flex items-center justify-center gap-1 cursor-pointer font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Output Parameters (Right) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="saas-card p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Load Analysis</h3>
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

          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/20">
              <span className="block text-[10px] font-bold text-zinc-450">TOTAL CONNECTED LOAD</span>
              <span className="text-2xl font-black text-zinc-850 dark:text-zinc-100">
                {(totalConnectedLoad / 1000).toFixed(2)} <span className="text-sm">kW</span>
              </span>
              <span className="block text-[9px] text-zinc-400 font-semibold mt-0.5">
                Total load current: {connectedCurrent.toFixed(1)} A
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-indigo-500/10 bg-indigo-500/5">
              <span className="block text-[10px] font-bold text-indigo-500">MAX DEMAND LOAD</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {(maxDemandLoad / 1000).toFixed(2)} <span className="text-sm">kW</span>
              </span>
              <span className="block text-[9px] text-zinc-400 font-semibold mt-0.5">
                Diversified load current: {demandCurrent.toFixed(1)} A
              </span>
            </div>
          </div>

          {/* Grid electrical specs */}
          <div className="space-y-3.5 border-t border-zinc-150 dark:border-zinc-850 pt-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-1">SYSTEM PHASE & VOLTAGE</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={phase}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setPhase(val);
                    if (val === '3phase') setVoltage(415);
                    else setVoltage(230);
                  }}
                  className="saas-select w-full py-1 text-xs"
                >
                  <option value="1phase">1-Phase AC</option>
                  <option value="3phase">3-Phase AC</option>
                </select>
                <input
                  type="number"
                  value={voltage}
                  onChange={(e) => setVoltage(Math.max(1, Number(e.target.value)))}
                  className="saas-input w-full py-1 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-1">POWER FACTOR (COS Φ)</label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="1.0"
                value={powerFactor}
                onChange={(e) => setPowerFactor(Math.min(1.0, Math.max(0.1, Number(e.target.value))))}
                className="saas-input w-full py-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
