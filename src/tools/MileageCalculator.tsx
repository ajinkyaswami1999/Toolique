import { useState } from 'react';
import { Car, Sparkles, RefreshCw } from 'lucide-react';

export default function MileageCalculator() {
  const [distance, setDistance] = useState<number>(300);
  const [fuelUsed, setFuelUsed] = useState<number>(15);
  const [fuelPrice, setFuelPrice] = useState<number>(100);

  // Calculations
  const mileage = fuelUsed > 0 ? distance / fuelUsed : 0;
  const tripCost = fuelUsed * fuelPrice;
  const costPerKm = distance > 0 ? tripCost / distance : 0;

  const handleReset = () => {
    setDistance(300);
    setFuelUsed(15);
    setFuelPrice(100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings Form */}
      <div className="lg:col-span-2 saas-card p-6 space-y-6 text-left">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Car className="w-4.5 h-4.5 text-indigo-500" />
          <span>Vehicle Fuel & Distance Details</span>
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Distance Traveled (km)</label>
              <input
                type="number"
                value={distance === 0 ? '' : distance}
                onChange={(e) => setDistance(Math.max(0, Number(e.target.value)))}
                className="w-full saas-input text-sm px-3 py-2"
                placeholder="300"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Fuel Filled (Liters)</label>
              <input
                type="number"
                value={fuelUsed === 0 ? '' : fuelUsed}
                onChange={(e) => setFuelUsed(Math.max(0, Number(e.target.value)))}
                className="w-full saas-input text-sm px-3 py-2"
                placeholder="15"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Fuel Price (₹ / Liter)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-550 text-xs font-bold">₹</span>
              <input
                type="number"
                value={fuelPrice === 0 ? '' : fuelPrice}
                onChange={(e) => setFuelPrice(Math.max(0, Number(e.target.value)))}
                className="w-full saas-input saas-input-with-prefix pl-8 pr-4 py-2 text-sm font-semibold"
                placeholder="100"
              />
            </div>
          </div>

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

      {/* Calculations Summary */}
      <div className="space-y-6 text-left">
        <div className="saas-card p-6 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Trip Economics</span>
          </h3>

          <div className="space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">Fuel Efficiency</span>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 flex items-baseline gap-1">
                {mileage > 0 ? mileage.toFixed(2) : '0.00'}
                <span className="text-xs font-bold">km / Liter</span>
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                <span>Total Fuel Cost</span>
                <span className="text-zinc-850 dark:text-zinc-250">₹{tripCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-650 dark:text-zinc-400">
                <span>Cost per Kilometer</span>
                <span className="text-zinc-850 dark:text-zinc-250 font-extrabold">
                  ₹{costPerKm > 0 ? costPerKm.toFixed(2) : '0.00'} / km
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
