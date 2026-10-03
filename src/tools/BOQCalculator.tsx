import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Copy, 
  Check, 
  RotateCcw, 
  Share2, 
  Sparkles, 
  ArrowRight, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Coins,
  Info
} from 'lucide-react';
import { getStoredRates, saveStoredRates, DEFAULT_CIVIL_RATES, type CivilRateKey } from '../data/civilRatesData';
import MaterialTrendGraph from '../components/MaterialTrendGraph';

interface ProjectPreset {
  id: string;
  name: string;
  tag: string;
  area: number;
  floors: number;
  spec: 'standard' | 'economic' | 'heavy';
  icon: string;
  desc: string;
}

const PRESETS: ProjectPreset[] = [
  {
    id: '1bhk',
    name: '1 BHK Flat',
    tag: 'Compact',
    area: 600,
    floors: 1,
    spec: 'standard',
    icon: '🏡',
    desc: '600 sq ft • Ground only'
  },
  {
    id: '2bhk',
    name: '2 BHK Independent',
    tag: 'Popular',
    area: 1200,
    floors: 1,
    spec: 'standard',
    icon: '🏠',
    desc: '1,200 sq ft • 1 Floor'
  },
  {
    id: '3bhk-duplex',
    name: '3 BHK Duplex (G+1)',
    tag: 'Family',
    area: 900,
    floors: 2,
    spec: 'standard',
    icon: '🏢',
    desc: '1,800 sq ft total • G+1'
  },
  {
    id: 'g2-triple',
    name: 'G+2 Triple Storey',
    tag: 'Multi-Floor',
    area: 800,
    floors: 3,
    spec: 'standard',
    icon: '🏬',
    desc: '2,400 sq ft total • G+2'
  },
  {
    id: 'villa',
    name: 'Luxury Villa (G+1)',
    tag: 'Heavy Spec',
    area: 1600,
    floors: 2,
    spec: 'heavy',
    icon: '🏛️',
    desc: '3,200 sq ft total • High Spec'
  },
  {
    id: 'commercial',
    name: 'Commercial (G+3)',
    tag: 'High Rise',
    area: 1250,
    floors: 4,
    spec: 'heavy',
    icon: '🏗️',
    desc: '5,000 sq ft total • G+3'
  }
];

const SPEC_MULTIPLIERS = {
  economic: {
    label: 'Economical / Low-Rise Frame',
    cement: 0.35,     // bags / sq ft
    sand: 1.6,        // cu ft / sq ft
    aggregate: 1.2,   // cu ft / sq ft
    steel: 3.2,       // kg / sq ft
    bricks: 10.0,     // bricks / sq ft
    badge: 'Budget Friendly'
  },
  standard: {
    label: 'Standard RCC Frame (IS 456)',
    cement: 0.40,     // bags / sq ft
    sand: 1.8,        // cu ft / sq ft
    aggregate: 1.35,  // cu ft / sq ft
    steel: 4.0,       // kg / sq ft
    bricks: 11.2,     // bricks / sq ft (approx 1.4 * 8)
    badge: 'Recommended'
  },
  heavy: {
    label: 'Heavy Structural RCC',
    cement: 0.48,     // bags / sq ft
    sand: 2.1,        // cu ft / sq ft
    aggregate: 1.55,  // cu ft / sq ft
    steel: 4.8,       // kg / sq ft
    bricks: 12.0,     // bricks / sq ft
    badge: 'High Strength'
  }
};

export default function BOQCalculator() {
  const [area, setArea] = useState<number>(1200);
  const [unit, setUnit] = useState<'sqft' | 'sqm'>('sqft');
  const [floors, setFloors] = useState<number>(1);
  const [spec, setSpec] = useState<'standard' | 'economic' | 'heavy'>('standard');
  const [activePresetId, setActivePresetId] = useState<string>('2bhk');
  const [copied, setCopied] = useState<boolean>(false);
  const [showRateEditor, setShowRateEditor] = useState<boolean>(false);
  const [prices, setPrices] = useState(getStoredRates());

  // Listen for storage events to sync rates across calculators in real-time
  useEffect(() => {
    const handleStorage = () => {
      setPrices(getStoredRates());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Convert entered area into sq ft for normalized calculations
  const floorAreaSqFt = useMemo(() => {
    return unit === 'sqm' ? Math.round(area * 10.7639) : area;
  }, [area, unit]);

  const totalBuiltAreaSqFt = useMemo(() => {
    return floorAreaSqFt * floors;
  }, [floorAreaSqFt, floors]);

  const materials = useMemo(() => {
    const multipliers = SPEC_MULTIPLIERS[spec];
    const totalSqFt = totalBuiltAreaSqFt;

    const cementBags = totalSqFt * multipliers.cement;
    const sandCuft = totalSqFt * multipliers.sand;
    const aggregateCuft = totalSqFt * multipliers.aggregate;
    const steelKg = totalSqFt * multipliers.steel;
    const bricksCount = totalSqFt * multipliers.bricks;

    const cementRate = prices.cement || DEFAULT_CIVIL_RATES.cement;
    const sandRate = prices.sand || DEFAULT_CIVIL_RATES.sand;
    const aggregateRate = prices.aggregate || DEFAULT_CIVIL_RATES.aggregate;
    const steelRate = prices.steel || DEFAULT_CIVIL_RATES.steel;
    const bricksRate = prices.bricks || DEFAULT_CIVIL_RATES.bricks;

    const cementCost = cementBags * cementRate;
    const sandCost = sandCuft * sandRate;
    const aggregateCost = aggregateCuft * aggregateRate;
    const steelCost = steelKg * steelRate;
    const bricksCost = bricksCount * bricksRate;

    const totalCost = cementCost + sandCost + aggregateCost + steelCost + bricksCost;
    const costPerSqFt = totalSqFt > 0 ? Math.round(totalCost / totalSqFt) : 0;

    return {
      cementBags: Math.round(cementBags),
      cementTons: Number((cementBags * 0.05).toFixed(2)), // 50kg per bag = 0.05 tons
      cementCost: Math.round(cementCost),
      cementPct: totalCost > 0 ? Math.round((cementCost / totalCost) * 100) : 0,

      sandCuft: Math.round(sandCuft),
      sandBrass: Number((sandCuft / 100).toFixed(2)), // 1 Brass = 100 cu ft
      sandCost: Math.round(sandCost),
      sandPct: totalCost > 0 ? Math.round((sandCost / totalCost) * 100) : 0,

      aggregateCuft: Math.round(aggregateCuft),
      aggregateBrass: Number((aggregateCuft / 100).toFixed(2)),
      aggregateCost: Math.round(aggregateCost),
      aggregatePct: totalCost > 0 ? Math.round((aggregateCost / totalCost) * 100) : 0,

      steelKg: Math.round(steelKg),
      steelTons: Number((steelKg / 1000).toFixed(2)), // 1000kg = 1 metric ton
      steelCost: Math.round(steelCost),
      steelPct: totalCost > 0 ? Math.round((steelCost / totalCost) * 100) : 0,

      bricksCount: Math.round(bricksCount),
      bricksCost: Math.round(bricksCost),
      bricksPct: totalCost > 0 ? Math.round((bricksCost / totalCost) * 100) : 0,

      totalEstimatedCost: Math.round(totalCost),
      costPerSqFt
    };
  }, [totalBuiltAreaSqFt, spec, prices]);

  const handlePriceChange = (key: CivilRateKey, val: number) => {
    const updatedPrices = { ...prices, [key]: val };
    setPrices(updatedPrices);
    saveStoredRates({ [key]: val });
  };

  const applyPreset = (p: ProjectPreset) => {
    setActivePresetId(p.id);
    setUnit('sqft');
    setArea(p.area);
    setFloors(p.floors);
    setSpec(p.spec);
  };

  const copyReport = () => {
    const text = `Bill of Quantities (BOQ) Takeoff Estimate • Toolique
--------------------------------------------------
Floor Area     : ${area.toLocaleString()} ${unit === 'sqm' ? 'Sq M' : 'Sq Ft'} (${floors} Floor/s)
Total Built-up : ${totalBuiltAreaSqFt.toLocaleString()} Sq Ft
Specification  : ${SPEC_MULTIPLIERS[spec].label}
--------------------------------------------------
1. Cement      : ${materials.cementBags.toLocaleString()} Bags (${materials.cementTons} Tons)
   Rate        : ₹${prices.cement}/bag  |  Cost: ₹${materials.cementCost.toLocaleString('en-IN')} (${materials.cementPct}%)

2. Steel Rebar : ${materials.steelKg.toLocaleString()} Kg (${materials.steelTons} Metric Tons)
   Rate        : ₹${prices.steel}/kg   |  Cost: ₹${materials.steelCost.toLocaleString('en-IN')} (${materials.steelPct}%)

3. Sand (River/M): ${materials.sandCuft.toLocaleString()} Cu Ft (${materials.sandBrass} Brass)
   Rate        : ₹${prices.sand}/cu ft |  Cost: ₹${materials.sandCost.toLocaleString('en-IN')} (${materials.sandPct}%)

4. Coarse Aggr.: ${materials.aggregateCuft.toLocaleString()} Cu Ft (${materials.aggregateBrass} Brass)
   Rate        : ₹${prices.aggregate}/cu ft |  Cost: ₹${materials.aggregateCost.toLocaleString('en-IN')} (${materials.aggregatePct}%)

5. Red Bricks  : ${materials.bricksCount.toLocaleString()} Pcs (~${Math.round(materials.bricksCount / 1000)}k Pcs)
   Rate        : ₹${prices.bricks}/piece |  Cost: ₹${materials.bricksCost.toLocaleString('en-IN')} (${materials.bricksPct}%)
--------------------------------------------------
TOTAL MATERIAL COST : ₹${materials.totalEstimatedCost.toLocaleString('en-IN')}
Rate per Sq Ft     : ₹${materials.costPerSqFt}/sq ft
--------------------------------------------------
Generated via Toolique BOQ Calculator (100% In-Browser & Private)
https://www.toolique.in/civil/boq-calculator`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `*Bill of Quantities (BOQ) Estimate - Toolique*%0A` +
      `Built-up Area: ${totalBuiltAreaSqFt.toLocaleString()} sq ft (${floors} Floor/s)%0A` +
      `--------------------------------%0A` +
      `• *Cement:* ${materials.cementBags.toLocaleString()} Bags (₹${materials.cementCost.toLocaleString('en-IN')})%0A` +
      `• *Steel:* ${materials.steelKg.toLocaleString()} Kg (₹${materials.steelCost.toLocaleString('en-IN')})%0A` +
      `• *Sand:* ${materials.sandCuft.toLocaleString()} Cu Ft (₹${materials.sandCost.toLocaleString('en-IN')})%0A` +
      `• *Aggregate:* ${materials.aggregateCuft.toLocaleString()} Cu Ft (₹${materials.aggregateCost.toLocaleString('en-IN')})%0A` +
      `• *Bricks:* ${materials.bricksCount.toLocaleString()} Pcs (₹${materials.bricksCost.toLocaleString('en-IN')})%0A` +
      `--------------------------------%0A` +
      `*Total Material Cost: ₹${materials.totalEstimatedCost.toLocaleString('en-IN')}* (₹${materials.costPerSqFt}/sq ft)%0A` +
      `Calculated on https://www.toolique.in/civil/boq-calculator`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleReset = () => {
    setArea(1200);
    setUnit('sqft');
    setFloors(1);
    setSpec('standard');
    setActivePresetId('2bhk');
    const defaults = DEFAULT_CIVIL_RATES;
    setPrices(defaults);
    saveStoredRates(defaults);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left animate-fadeIn">
      
      {/* 1. Quick Project Presets Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Quick Project Presets
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400">
            Click any template to auto-populate dimensions
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500/80 shadow-xs text-zinc-900 dark:text-white'
                    : 'bg-zinc-50/70 dark:bg-zinc-950/50 border-zinc-200/70 dark:border-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:border-teal-400 dark:hover:border-teal-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-base">{preset.icon}</span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full border ${
                      isActive
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300/60 dark:border-zinc-700'
                    }`}>
                      {preset.tag}
                    </span>
                  </div>
                  <div className="text-xs font-bold leading-snug">
                    {preset.name}
                  </div>
                </div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                  {preset.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main 2-Column Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Dimensions & Specification Controls */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
                  Structure Parameters
                </h3>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                title="Reset to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Floor Area Input with Unit Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Floor / Plot Footprint Area
                </label>
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      if (unit !== 'sqft') {
                        setArea(Math.round(area * 10.7639));
                        setUnit('sqft');
                      }
                    }}
                    className={`px-2 py-0.5 rounded-md transition ${unit === 'sqft' ? 'bg-white dark:bg-zinc-900 shadow-2xs text-teal-600 dark:text-teal-400 font-extrabold' : 'text-zinc-500'}`}
                  >
                    Sq Ft
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (unit !== 'sqm') {
                        setArea(Math.round(area / 10.7639));
                        setUnit('sqm');
                      }
                    }}
                    className={`px-2 py-0.5 rounded-md transition ${unit === 'sqm' ? 'bg-white dark:bg-zinc-900 shadow-2xs text-teal-600 dark:text-teal-400 font-extrabold' : 'text-zinc-500'}`}
                  >
                    Sq M
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="50"
                  max="100000"
                  step="10"
                  value={area || ''}
                  onChange={(e) => {
                    setActivePresetId('');
                    setArea(Math.max(0, parseInt(e.target.value) || 0));
                  }}
                  className="saas-input font-bold text-base sm:text-lg pl-3 pr-16"
                  placeholder="e.g. 1200"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                  {unit === 'sqft' ? 'sq ft' : 'sq m'}
                </span>
              </div>

              {unit === 'sqm' && (
                <p className="text-[11px] text-zinc-400">
                  ≈ {floorAreaSqFt.toLocaleString()} sq ft per floor
                </p>
              )}
            </div>

            {/* Number of Floors (G + N) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Number of Floors (G + N)
                </label>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                  Total: {totalBuiltAreaSqFt.toLocaleString()} sq ft
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setActivePresetId('');
                      setFloors(f);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition border text-center ${
                      floors === f
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                    }`}
                  >
                    {f === 1 ? 'G only' : `G+${f - 1}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Construction Specification Tier */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Structure Specification Grade</span>
                <span className="text-[10px] text-zinc-400 font-normal">IS 456 / IS 1200 norms</span>
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                {(['economic', 'standard', 'heavy'] as const).map((sKey) => {
                  const s = SPEC_MULTIPLIERS[sKey];
                  const isSel = spec === sKey;
                  return (
                    <button
                      key={sKey}
                      type="button"
                      onClick={() => {
                        setActivePresetId('');
                        setSpec(sKey);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        isSel
                          ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-zinc-900 dark:text-white shadow-2xs'
                          : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                      }`}
                    >
                      <div className="text-xs font-bold capitalize">{sKey}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 truncate">{s.badge}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Collapsible Editable Material Rates */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3.5">
              <button
                type="button"
                onClick={() => setShowRateEditor(!showRateEditor)}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-teal-600 dark:hover:text-teal-400 transition"
              >
                <div className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Customize Local Material Rates (₹)</span>
                </div>
                {showRateEditor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showRateEditor && (
                <div className="mt-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1">Cement (₹/bag)</label>
                      <input
                        type="number"
                        value={prices.cement}
                        onChange={(e) => handlePriceChange('cement', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="saas-input py-1.5 px-2.5 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1">Steel (₹/kg)</label>
                      <input
                        type="number"
                        value={prices.steel}
                        onChange={(e) => handlePriceChange('steel', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="saas-input py-1.5 px-2.5 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1">Sand (₹/cu ft)</label>
                      <input
                        type="number"
                        value={prices.sand}
                        onChange={(e) => handlePriceChange('sand', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="saas-input py-1.5 px-2.5 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1">Aggregate (₹/cu ft)</label>
                      <input
                        type="number"
                        value={prices.aggregate}
                        onChange={(e) => handlePriceChange('aggregate', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="saas-input py-1.5 px-2.5 text-xs font-mono font-bold"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1">Bricks (₹/piece)</label>
                      <input
                        type="number"
                        value={prices.bricks}
                        onChange={(e) => handlePriceChange('bricks', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="saas-input py-1.5 px-2.5 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 italic">
                    Rates are saved automatically and synchronized across all Toolique construction calculators.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>IS 456 Thumb-Rules:</strong> Quantities account for standard reinforced concrete framing (columns, beams, slabs), masonry walls with 9" outer and 4.5" inner partitions, and standard 5% site wastage allowance.
            </p>
          </div>
        </div>

        {/* Right Column: BOQ Bill of Quantities Output Card */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between space-y-5">
            
            {/* Output Header */}
            <div>
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest block">
                    Itemized Material Takeoff
                  </span>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    For {totalBuiltAreaSqFt.toLocaleString()} sq ft ({floors} Floor{floors > 1 ? 's' : ''})
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={shareWhatsApp}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold transition inline-flex items-center gap-1"
                    title="Share BOQ on WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyReport}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs active:scale-95"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy BOQ'}</span>
                  </button>
                </div>
              </div>

              {/* Itemized Material Cards */}
              <div className="space-y-3">
                
                {/* 1. Cement */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                      🧱
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <span>Cement</span>
                        <span className="text-[10px] text-zinc-400 font-normal">@ ₹{prices.cement}/bag</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                        {materials.cementTons} Metric Tonnes
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-zinc-900 dark:text-white font-mono">
                      {materials.cementBags.toLocaleString()} Bags
                    </div>
                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">
                      ₹{materials.cementCost.toLocaleString('en-IN')} <span className="text-[10px] text-zinc-400 font-normal">({materials.cementPct}%)</span>
                    </div>
                  </div>
                </div>

                {/* 2. Steel Rebar */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                      🔩
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <span>Steel Rebar (TMT)</span>
                        <span className="text-[10px] text-zinc-400 font-normal">@ ₹{prices.steel}/kg</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                        {materials.steelTons} Metric Tonnes
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-zinc-900 dark:text-white font-mono">
                      {materials.steelKg.toLocaleString()} Kg
                    </div>
                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">
                      ₹{materials.steelCost.toLocaleString('en-IN')} <span className="text-[10px] text-zinc-400 font-normal">({materials.steelPct}%)</span>
                    </div>
                  </div>
                </div>

                {/* 3. Sand */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                      ⏳
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <span>Sand (River / M-Sand)</span>
                        <span className="text-[10px] text-zinc-400 font-normal">@ ₹{prices.sand}/cu ft</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                        {materials.sandBrass} Brass (100 cu ft/brass)
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-zinc-900 dark:text-white font-mono">
                      {materials.sandCuft.toLocaleString()} Cu Ft
                    </div>
                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">
                      ₹{materials.sandCost.toLocaleString('en-IN')} <span className="text-[10px] text-zinc-400 font-normal">({materials.sandPct}%)</span>
                    </div>
                  </div>
                </div>

                {/* 4. Coarse Aggregate */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 font-bold text-xs flex items-center justify-center shrink-0">
                      🪨
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <span>Coarse Aggregate</span>
                        <span className="text-[10px] text-zinc-400 font-normal">@ ₹{prices.aggregate}/cu ft</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                        {materials.aggregateBrass} Brass (10mm / 20mm)
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-zinc-900 dark:text-white font-mono">
                      {materials.aggregateCuft.toLocaleString()} Cu Ft
                    </div>
                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">
                      ₹{materials.aggregateCost.toLocaleString('en-IN')} <span className="text-[10px] text-zinc-400 font-normal">({materials.aggregatePct}%)</span>
                    </div>
                  </div>
                </div>

                {/* 5. Red Bricks */}
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
                      🧱
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <span>Red Clay Bricks</span>
                        <span className="text-[10px] text-zinc-400 font-normal">@ ₹{prices.bricks}/piece</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                        ~{Math.round(materials.bricksCount / 1000)}k Standard 9" × 4.25" × 2.75"
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-zinc-900 dark:text-white font-mono">
                      {materials.bricksCount.toLocaleString()} Pcs
                    </div>
                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">
                      ₹{materials.bricksCost.toLocaleString('en-IN')} <span className="text-[10px] text-zinc-400 font-normal">({materials.bricksPct}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grand Total Cost Summary Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/5 dark:from-teal-950/40 dark:via-emerald-950/30 dark:to-teal-950/20 border border-teal-300/80 dark:border-teal-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Total Structural Material Cost
                </span>
                <span className="text-2xl sm:text-3xl font-black text-teal-650 dark:text-teal-400 font-mono tracking-tight">
                  ₹{materials.totalEstimatedCost.toLocaleString('en-IN')}
                </span>
              </div>
              
              <div className="text-left sm:text-right">
                <span className="inline-block px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-900 border border-teal-200 dark:border-teal-800 text-xs font-extrabold text-teal-700 dark:text-teal-300 shadow-2xs">
                  ₹{materials.costPerSqFt} / sq.ft
                </span>
                <span className="block text-[10px] text-zinc-400 mt-0.5">
                  Raw material budget index
                </span>
              </div>
            </div>
          </div>

          {/* Promotion / Switch to Advanced BOQ Tool */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Need Line-by-Line Contractor Tender BOQ?</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                Calculate multi-floor room schedules, plastering, tiling, painting, CPWD DSR rates, and export to Excel/PDF.
              </p>
            </div>

            <Link
              to="/civil/advanced-boq-calculator-india"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition shrink-0 inline-flex items-center gap-1"
            >
              <span>Advanced BOQ</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Historical Price Trend Graph */}
      <MaterialTrendGraph allowedMaterials={['cement', 'steel', 'sand', 'aggregate', 'bricks']} />
    </div>
  );
}
