import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';

const APPLIANCES_PRESET = [
  { name: 'Custom (Manual)', wattage: 100 },
  { name: 'LED Bulb (9W)', wattage: 9 },
  { name: 'LED Bulb (15W)', wattage: 15 },
  { name: 'Ceiling Fan (75W)', wattage: 75 },
  { name: 'LED Television (120W)', wattage: 120 },
  { name: 'Laptop Computer (90W)', wattage: 90 },
  { name: 'Desktop PC (250W)', wattage: 250 },
  { name: 'Refrigerator (200W)', wattage: 200 },
  { name: 'Air Conditioner (1.5 Ton, 1800W)', wattage: 1800 },
  { name: 'Microwave Oven (1200W)', wattage: 1200 },
  { name: 'Electric Kettle (1500W)', wattage: 1500 },
  { name: 'Geyser / Water Heater (3000W)', wattage: 3000 },
  { name: 'Washing Machine (800W)', wattage: 800 }
];

export default function PowerConsumptionCalculator() {
  const [presetIndex, setPresetIndex] = useState<number>(3); // Fan by default
  const [wattage, setWattage] = useState<number>(75);
  const [hours, setHours] = useState<number>(8);
  const [rate, setRate] = useState<number>(7); // ₹7/unit standard
  const [qty, setQty] = useState<number>(1);

  const [dailyKwh, setDailyKwh] = useState<number>(0);
  const [dailyCost, setDailyCost] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const kwh = (wattage * hours * qty) / 1000;
    setDailyKwh(kwh);
    setDailyCost(kwh * rate);
  }, [wattage, hours, qty, rate]);

  const handlePresetChange = (idx: number) => {
    setPresetIndex(idx);
    if (idx > 0) {
      setWattage(APPLIANCES_PRESET[idx].wattage);
    }
  };

  const handleCopy = () => {
    const summary = `Power Consumption Calculator Report
--------------------------------------
Appliance: ${presetIndex > 0 ? APPLIANCES_PRESET[presetIndex].name : 'Custom'}
Wattage: ${wattage} W
Quantity: ${qty}
Daily Usage Hours: ${hours} hours
Electricity Rate: ₹ ${rate} per Unit (kWh)
--------------------------------------
Consumption Breakdown:
- Daily: ${dailyKwh.toFixed(2)} kWh | ₹ ${dailyCost.toFixed(2)}
- Weekly: ${(dailyKwh * 7).toFixed(2)} kWh | ₹ ${(dailyCost * 7).toFixed(2)}
- Monthly (30 days): ${(dailyKwh * 30).toFixed(2)} kWh | ₹ ${(dailyCost * 30).toFixed(2)}
- Yearly (365 days): ${(dailyKwh * 365).toFixed(2)} kWh | ₹ ${(dailyCost * 365).toFixed(2)}`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setPresetIndex(3);
    setWattage(75);
    setHours(8);
    setRate(7);
    setQty(1);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Input panel (Left) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Consumption Inputs</h3>
            <button
              onClick={handleReset}
              className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition cursor-pointer"
              title="Reset Parameters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1.5">CHOOSE APPLIANCE PRESET</label>
            <select
              value={presetIndex}
              onChange={(e) => handlePresetChange(Number(e.target.value))}
              className="saas-select w-full text-xs font-bold"
            >
              {APPLIANCES_PRESET.map((app, idx) => (
                <option key={idx} value={idx}>{app.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">WATTAGE (WATTS)</label>
              <input
                type="number"
                value={wattage}
                onChange={(e) => {
                  setPresetIndex(0); // Custom
                  setWattage(Math.max(1, Number(e.target.value)));
                }}
                className="saas-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-505 mb-1.5">QUANTITY</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">HOURS USED PER DAY</label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                max="24"
                value={hours}
                onChange={(e) => setHours(Math.min(24, Math.max(0.1, Number(e.target.value))))}
                className="saas-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">TARIFF RATE (₹ / kWh / UNIT)</label>
              <input
                type="number"
                step="0.5"
                value={rate}
                onChange={(e) => setRate(Math.max(0.1, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Output Panel (Right) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="saas-card p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Usage Projections</h3>
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

          {/* Table display */}
          <div className="overflow-hidden border border-zinc-200 dark:border-zinc-850 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 border-b border-zinc-150 dark:border-zinc-800">
                <tr>
                  <th className="p-3 font-bold">Time Period</th>
                  <th className="p-3 font-bold">Energy Used (Units)</th>
                  <th className="p-3 font-bold">Estimated Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800/70 font-semibold text-zinc-700 dark:text-zinc-300">
                <tr>
                  <td className="p-3 font-bold text-zinc-850 dark:text-zinc-150">Daily</td>
                  <td className="p-3">{dailyKwh.toFixed(2)} kWh</td>
                  <td className="p-3 text-indigo-600 dark:text-indigo-400 font-bold">₹ {dailyCost.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-zinc-850 dark:text-zinc-150">Weekly</td>
                  <td className="p-3">{(dailyKwh * 7).toFixed(2)} kWh</td>
                  <td className="p-3 text-indigo-600 dark:text-indigo-400 font-bold">₹ {(dailyCost * 7).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-zinc-850 dark:text-zinc-150">Monthly (30 days)</td>
                  <td className="p-3">{(dailyKwh * 30).toFixed(2)} kWh</td>
                  <td className="p-3 text-indigo-600 dark:text-indigo-400 font-bold">₹ {(dailyCost * 30).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-zinc-850 dark:text-zinc-150">Yearly (365 days)</td>
                  <td className="p-3">{(dailyKwh * 365).toFixed(1)} kWh</td>
                  <td className="p-3 text-indigo-600 dark:text-indigo-400 font-bold">₹ {(dailyCost * 365).toFixed(0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 bg-zinc-50/20 text-xs text-zinc-500 leading-relaxed">
            Note: 1 Unit of electricity equals 1 Kilowatt-hour (kWh). Projections assume a constant load rate. Real-world compressor-based appliances (like refrigerators and ACs) duty cycle on and off, which may lower actual power consumed.
          </div>
        </div>
      </div>
    </div>
  );
}
