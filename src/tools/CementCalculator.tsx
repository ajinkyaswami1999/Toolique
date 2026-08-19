import { useState, useEffect } from 'react';
import { Clipboard, Check } from 'lucide-react';
import { getStoredRates, DEFAULT_CIVIL_RATES } from '../data/civilRatesData';

export default function CementCalculator() {
  const [tab, setTab] = useState<'concrete' | 'masonry' | 'plaster'>('concrete');
  const [unit, setUnit] = useState<'ft' | 'm'>('ft');
  
  // Concrete Inputs
  const [concreteVol, setConcreteVol] = useState<number>(100); // in cuft
  const [concreteMix, setConcreteMix] = useState<string>('M20'); // 1:1.5:3
  
  // Masonry Inputs
  const [wallLength, setWallLength] = useState<number>(20);
  const [wallHeight, setWallHeight] = useState<number>(10);
  const [wallThickness, setWallThickness] = useState<number>(9); // in inches
  const [masonryMix, setMasonryMix] = useState<string>('1:6');
  
  // Plaster Inputs
  const [plasterArea, setPlasterArea] = useState<number>(500); // sqft
  const [plasterThickness, setPlasterThickness] = useState<number>(12); // mm
  const [plasterMix, setPlasterMix] = useState<string>('1:4');

  // Outputs
  const [cementBags, setCementBags] = useState<number>(0);
  const [dryVolume, setDryVolume] = useState<number>(0);
  const [cementCost, setCementCost] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const [prices] = useState(getStoredRates());
  const cementPrice = prices.cement || DEFAULT_CIVIL_RATES.cement;

  // Mix ratios definitions
  const mixRatios: Record<string, { cement: number; sum: number }> = {
    M5: { cement: 1, sum: 16 },      // 1:5:10
    M75: { cement: 1, sum: 13 },     // 1:4:8
    M10: { cement: 1, sum: 10 },     // 1:3:6
    M15: { cement: 1, sum: 7 },      // 1:2:4
    M20: { cement: 1, sum: 5.5 },    // 1:1.5:3
    M25: { cement: 1, sum: 4 },      // 1:1:2
    '1:3': { cement: 1, sum: 4 },
    '1:4': { cement: 1, sum: 5 },
    '1:5': { cement: 1, sum: 6 },
    '1:6': { cement: 1, sum: 7 }
  };

  useEffect(() => {
    let bags = 0;
    let dryVol = 0;

    if (tab === 'concrete') {
      // 1 cuft = 0.0283168 m3
      const volM3 = unit === 'ft' ? concreteVol * 0.0283168 : concreteVol;
      // Dry volume factor is 1.54
      dryVol = volM3 * 1.54;
      const ratio = mixRatios[concreteMix] || mixRatios.M20;
      const cementVol = (ratio.cement / ratio.sum) * dryVol;
      // 1 bag = 0.0347 m3
      bags = cementVol / 0.0347;
    } 
    
    else if (tab === 'masonry') {
      // Wall volume
      let volM3 = 0;
      if (unit === 'ft') {
        const l = wallLength * 0.3048;
        const h = wallHeight * 0.3048;
        const t = (wallThickness / 12) * 0.3048;
        volM3 = l * h * t;
      } else {
        // wallThickness in cm for metric mode
        volM3 = wallLength * wallHeight * (wallThickness / 100);
      }

      // Mortar volume is typically 30% of brickwork volume
      const wetMortarM3 = volM3 * 0.30;
      // Dry mortar factor is 1.33
      dryVol = wetMortarM3 * 1.33;
      const ratio = mixRatios[masonryMix] || mixRatios['1:6'];
      const cementVol = (ratio.cement / ratio.sum) * dryVol;
      bags = cementVol / 0.0347;
    } 
    
    else if (tab === 'plaster') {
      // Plaster volume
      let volM3 = 0;
      const thicknessM = plasterThickness / 1000;
      if (unit === 'ft') {
        const areaM2 = plasterArea * 0.092903;
        volM3 = areaM2 * thicknessM;
      } else {
        volM3 = plasterArea * thicknessM;
      }

      // Dry mortar factor is 1.33 plus 20% wastage/unevenness -> 1.33 * 1.2 = 1.6
      dryVol = volM3 * 1.6;
      const ratio = mixRatios[plasterMix] || mixRatios['1:4'];
      const cementVol = (ratio.cement / ratio.sum) * dryVol;
      bags = cementVol / 0.0347;
    }

    const roundedBags = Math.ceil(bags);
    setCementBags(roundedBags);
    setDryVolume(Number(dryVol.toFixed(3)));
    setCementCost(roundedBags * cementPrice);
  }, [tab, unit, concreteVol, concreteMix, wallLength, wallHeight, wallThickness, masonryMix, plasterArea, plasterThickness, plasterMix, cementPrice]);

  const handleCopy = () => {
    let text = `Cement Estimation Results (${tab.toUpperCase()})\n`;
    text += `Unit: ${unit === 'ft' ? 'Imperial (ft/sqft/cuft)' : 'Metric (m/sqm/m3)'}\n`;
    text += `Dry Volume: ${dryVolume} m³\n`;
    text += `Cement Bags Needed: ${cementBags} bags\n`;
    text += `Estimated Cost: ₹${cementCost}\n`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="saas-card p-5 space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                Calculation Mode
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

            {/* Tab Switches */}
            <div className="grid grid-cols-3 gap-2">
              {(['concrete', 'masonry', 'plaster'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-black uppercase text-center border transition cursor-pointer ${
                    tab === t
                      ? 'bg-indigo-650 border-indigo-650 text-white'
                      : 'bg-zinc-100/50 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-zinc-850/60 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-850/40'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              
              {/* Tab: Concrete */}
              {tab === 'concrete' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400">
                      Total Wet Volume ({unit === 'ft' ? 'Cubic Feet - cuft' : 'Cubic Meters - m³'})
                    </label>
                    <input
                      type="number"
                      value={concreteVol}
                      onChange={(e) => setConcreteVol(Number(e.target.value))}
                      className="saas-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Concrete Mix Grade</label>
                    <select
                      value={concreteMix}
                      onChange={(e) => setConcreteMix(e.target.value)}
                      className="saas-select"
                    >
                      <option value="M5">M5 (1:5:10) - Lean Mix</option>
                      <option value="M75">M7.5 (1:4:8)</option>
                      <option value="M10">M10 (1:3:6)</option>
                      <option value="M15">M15 (1:2:4) - Standard</option>
                      <option value="M20">M20 (1:1.5:3) - Slab & Column</option>
                      <option value="M25">M25 (1:1:2) - Heavy Load</option>
                    </select>
                  </div>
                </>
              )}

              {/* Tab: Masonry */}
              {tab === 'masonry' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400">
                        Wall Length ({unit === 'ft' ? 'ft' : 'm'})
                      </label>
                      <input
                        type="number"
                        value={wallLength}
                        onChange={(e) => setWallLength(Number(e.target.value))}
                        className="saas-input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400">
                        Wall Height ({unit === 'ft' ? 'ft' : 'm'})
                      </label>
                      <input
                        type="number"
                        value={wallHeight}
                        onChange={(e) => setWallHeight(Number(e.target.value))}
                        className="saas-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400">
                        Wall Thickness ({unit === 'ft' ? 'inches' : 'cm'})
                      </label>
                      <input
                        type="number"
                        value={wallThickness}
                        onChange={(e) => setWallThickness(Number(e.target.value))}
                        className="saas-input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400">Mortar Mix Ratio</label>
                      <select
                        value={masonryMix}
                        onChange={(e) => setMasonryMix(e.target.value)}
                        className="saas-select"
                      >
                        <option value="1:3">1:3 (Rich Mortar)</option>
                        <option value="1:4">1:4</option>
                        <option value="1:5">1:5</option>
                        <option value="1:6">1:6 (Standard Brickwall)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Tab: Plaster */}
              {tab === 'plaster' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400">
                        Plaster Area ({unit === 'ft' ? 'sqft' : 'sqm'})
                      </label>
                      <input
                        type="number"
                        value={plasterArea}
                        onChange={(e) => setPlasterArea(Number(e.target.value))}
                        className="saas-input"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-zinc-400">
                        Thickness (mm)
                      </label>
                      <select
                        value={plasterThickness}
                        onChange={(e) => setPlasterThickness(Number(e.target.value))}
                        className="saas-select"
                      >
                        <option value={6}>6 mm (Ceiling Plaster)</option>
                        <option value={12}>12 mm (Internal Wall)</option>
                        <option value={15}>15 mm (Rough Wall)</option>
                        <option value={20}>20 mm (External Plaster)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-zinc-400">Plaster Mix Ratio</label>
                    <select
                      value={plasterMix}
                      onChange={(e) => setPlasterMix(e.target.value)}
                      className="saas-select"
                    >
                      <option value="1:3">1:3 (Rich Ceiling/External)</option>
                      <option value="1:4">1:4 (Internal standard)</option>
                      <option value="1:5">1:5</option>
                      <option value="1:6">1:6</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-6 space-y-5 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                Material Estimation Results
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
                <div className="text-3xl font-black text-indigo-650 dark:text-indigo-400 mt-1">
                  {cementBags} <span className="text-xs font-bold text-zinc-550 dark:text-zinc-400">Bags</span>
                </div>
                <div className="text-[9.5px] font-semibold text-zinc-450 dark:text-zinc-500 mt-1">
                  Based on 50kg standard bags (~34.7 liters volume each)
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-950/20 text-center">
                <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Estimated Cost</div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹{cementCost.toLocaleString('en-IN')}
                </div>
                <div className="text-[9.5px] font-semibold text-zinc-450 dark:text-zinc-500 mt-1">
                  Calculated at ₹{cementPrice} per bag (local market rate)
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200/20 bg-white/40 dark:bg-zinc-950/30 text-xs font-semibold space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Dry mortar/concrete volume:</span>
                <span className="text-zinc-700 dark:text-zinc-200">{dryVolume} m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Estimated weight of cement:</span>
                <span className="text-zinc-700 dark:text-zinc-200">{(cementBags * 50).toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200/20 pt-2 font-black text-zinc-900 dark:text-white">
                <span>Calculated Volume (Dry Mix):</span>
                <span>{dryVolume} m³</span>
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
