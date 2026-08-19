import { useState, useEffect } from 'react';
import { Clipboard, Check } from 'lucide-react';
import { getStoredRates, DEFAULT_CIVIL_RATES } from '../data/civilRatesData';

export default function PlasterCalculator() {
  const [unit, setUnit] = useState<'ft' | 'm'>('ft');
  const [area, setArea] = useState<number>(500);
  const [thickness, setThickness] = useState<number>(12); // mm
  const [mix, setMix] = useState<string>('1:4');
  const [wastage, setWastage] = useState<number>(20); // %

  // Outputs
  const [cementBags, setCementBags] = useState<number>(0);
  const [sandCuft, setSandCuft] = useState<number>(0);
  const [cementCost, setCementCost] = useState<number>(0);
  const [sandCost, setSandCost] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const [prices] = useState(getStoredRates());
  const cementPrice = prices.cement || DEFAULT_CIVIL_RATES.cement;
  const sandPrice = prices.sand || DEFAULT_CIVIL_RATES.sand;

  const mixRatios: Record<string, { cement: number; sand: number; sum: number }> = {
    '1:3': { cement: 1, sand: 3, sum: 4 },
    '1:4': { cement: 1, sand: 4, sum: 5 },
    '1:5': { cement: 1, sand: 5, sum: 6 },
    '1:6': { cement: 1, sand: 6, sum: 7 }
  };

  useEffect(() => {
    // 1. Calculate wet volume
    const thicknessM = thickness / 1000;
    let wetVolM3 = 0;
    if (unit === 'ft') {
      const areaM2 = area * 0.092903;
      wetVolM3 = areaM2 * thicknessM;
    } else {
      wetVolM3 = area * thicknessM;
    }

    // 2. Add wastage
    const wetVolWithWastage = wetVolM3 * (1 + wastage / 100);

    // 3. Dry volume factor is 1.33
    const dryVol = wetVolWithWastage * 1.33;

    // 4. Calculate material shares
    const ratio = mixRatios[mix] || mixRatios['1:4'];
    const cementVolM3 = (ratio.cement / ratio.sum) * dryVol;
    const sandVolM3 = (ratio.sand / ratio.sum) * dryVol;

    // 5. Convert to bags and CFT
    // 1 bag = 0.0347 m3
    const bags = Math.ceil(cementVolM3 / 0.0347);
    // 1 m3 = 35.3147 CFT
    const sandCFT = Number((sandVolM3 * 35.3147).toFixed(2));

    const cCost = bags * cementPrice;
    const sCost = Number((sandCFT * sandPrice).toFixed(0));

    setCementBags(bags);
    setSandCuft(sandCFT);
    setCementCost(cCost);
    setSandCost(sCost);
    setTotalCost(cCost + sCost);
  }, [unit, area, thickness, mix, wastage, cementPrice, sandPrice]);

  const handleCopy = () => {
    let text = `Plaster Estimation Results\n`;
    text += `Area: ${area} ${unit === 'ft' ? 'sqft' : 'sqm'}\n`;
    text += `Thickness: ${thickness} mm\n`;
    text += `Mix Ratio: ${mix}\n`;
    text += `Cement Required: ${cementBags} bags\n`;
    text += `Sand Required: ${sandCuft} CFT\n`;
    text += `Total Estimated Cost: ₹${totalCost}\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="saas-card p-5 space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                Plastering Specifications
              </h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setUnit('ft')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                    unit === 'ft'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400'
                      : 'border-zinc-200/60 dark:border-zinc-800 bg-white/40 text-zinc-400'
                  }`}
                >
                  ft / sqft
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('m')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition cursor-pointer ${
                    unit === 'm'
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400'
                      : 'border-zinc-200/60 dark:border-zinc-800 bg-white/40 text-zinc-400'
                  }`}
                >
                  m / sqm
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">
                  Plaster Area ({unit === 'ft' ? 'sqft' : 'sqm'})
                </label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Thickness (mm)</label>
                  <select
                    value={thickness}
                    onChange={(e) => setThickness(Number(e.target.value))}
                    className="saas-select"
                  >
                    <option value={6}>6 mm (Ceiling)</option>
                    <option value={12}>12 mm (Internal Wall)</option>
                    <option value={15}>15 mm (Rough Wall)</option>
                    <option value={20}>20 mm (External Wall)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Mix Ratio</label>
                  <select
                    value={mix}
                    onChange={(e) => setMix(e.target.value)}
                    className="saas-select"
                  >
                    <option value="1:3">1:3 (Rich)</option>
                    <option value="1:4">1:4 (Standard)</option>
                    <option value="1:5">1:5</option>
                    <option value="1:6">1:6</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Wastage & Unevenness (%)</label>
                <input
                  type="number"
                  value={wastage}
                  onChange={(e) => setWastage(Number(e.target.value))}
                  className="saas-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-6 space-y-5 text-left font-semibold">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                Materials Breakdown
              </h3>
              <button
                type="button"
                onClick={handleCopy}
                className="saas-button-secondary py-1 px-3 text-[10px] inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Results'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-950/20 text-center">
                <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Cement Required</div>
                <div className="text-2xl font-black text-indigo-650 dark:text-indigo-400 mt-1">
                  {cementBags} <span className="text-xs font-bold text-zinc-400">Bags</span>
                </div>
                <div className="text-[9px] text-zinc-450 dark:text-zinc-500 mt-1">
                  Cost: ₹{cementCost} (at ₹{cementPrice}/bag)
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-950/20 text-center">
                <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Sand Required</div>
                <div className="text-2xl font-black text-indigo-650 dark:text-indigo-400 mt-1">
                  {sandCuft} <span className="text-xs font-bold text-zinc-400">CFT</span>
                </div>
                <div className="text-[9px] text-zinc-450 dark:text-zinc-500 mt-1">
                  Cost: ₹{sandCost} (at ₹{sandPrice}/CFT)
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-250/20 dark:border-zinc-850/60 bg-zinc-50/20 dark:bg-zinc-950/20 text-center">
              <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Total Materials Cost</div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{totalCost.toLocaleString('en-IN')}
              </div>
            </div>

            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold leading-relaxed border-t border-zinc-200/20 pt-3">
              ⚠️ <strong>Disclaimer:</strong> Regulations vary by location and authority. Verify applicable local building regulations before using these results for approvals or construction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
