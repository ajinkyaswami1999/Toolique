import { useState } from 'react';
import { Copy, Check, Info, ShieldCheck, RotateCcw, Building2, Road, ChevronRight } from 'lucide-react';

type UnitType = 'sqm' | 'sqft';
type CityPreset = 'mumbai' | 'delhi' | 'bengaluru' | 'chennai' | 'custom';

interface CityConfig {
  label: string;
  basicFsi: number;
  premiumFsiAllowed: boolean;
  desc: string;
}

const CITY_PRESETS: Record<CityPreset, CityConfig> = {
  mumbai: {
    label: 'Mumbai (MCGM Rules)',
    basicFsi: 1.33,
    premiumFsiAllowed: true,
    desc: 'Basic FSI is 1.33. Up to 0.5 additional Premium FSI can be purchased depending on road width.'
  },
  delhi: {
    label: 'Delhi (DDA bylaws)',
    basicFsi: 2.0,
    premiumFsiAllowed: false,
    desc: 'Governed by plot size. Max FAR/FSI is 2.0 for residential and 3.5 for commercial hubs.'
  },
  bengaluru: {
    label: 'Bengaluru (BBMP limits)',
    basicFsi: 1.75,
    premiumFsiAllowed: true,
    desc: 'Varies from 1.75 to 3.25 based on zone (Intense, Moderate, Sparse) and road width.'
  },
  chennai: {
    label: 'Chennai (CMDA limits)',
    basicFsi: 1.5,
    premiumFsiAllowed: true,
    desc: 'Basic FSI is 1.5. Premium FSI up to 2.0 is allowed on roads wider than 9 meters.'
  },
  custom: {
    label: 'Custom Zoning Rules',
    basicFsi: 2.0,
    premiumFsiAllowed: true,
    desc: 'Enter custom FSI guidelines manually for local municipality compliance.'
  }
};

export default function FARFSICalculator() {
  const [unit, setUnit] = useState<UnitType>('sqft');
  const [city, setCity] = useState<CityPreset>('mumbai');
  
  // Plot inputs
  const [plotArea, setPlotArea] = useState<number>(3000);
  const [customFsi, setCustomFsi] = useState<number>(2.0);
  const [roadWidth, setRoadWidth] = useState<number>(12); // meters
  
  // Premium FSI states
  const [usePremiumFsi, setUsePremiumFsi] = useState<boolean>(false);
  const [guidanceValue, setGuidanceValue] = useState<number>(100); // cost per sq unit
  
  // Construction inputs
  const [builtupFloor, setBuiltupFloor] = useState<number>(1500);
  const [floors, setFloors] = useState<number>(3);
  
  const [copied, setCopied] = useState<boolean>(false);

  const calculate = () => {
    const config = CITY_PRESETS[city];
    let baseFsi = city === 'custom' ? customFsi : config.basicFsi;

    // Adjust FSI based on road width under standard NBC guidelines
    // Roads < 9m restrict FSI by 10-20%; roads > 15m allow full FSI
    let roadMultiplier = 1.0;
    if (roadWidth < 9) {
      roadMultiplier = 0.85; // restricted development
    } else if (roadWidth >= 18) {
      roadMultiplier = 1.2; // high density corridor bonus
    }
    baseFsi = Number((baseFsi * roadMultiplier).toFixed(2));

    // Premium FSI calculation (typically up to 30-40% FSI addition)
    const premiumFsiFactor = config.premiumFsiAllowed && usePremiumFsi ? 0.4 : 0;
    const totalPermissibleFsi = baseFsi + premiumFsiFactor;

    const maxBuildableArea = plotArea * totalPermissibleFsi;
    const utilizedArea = builtupFloor * floors;
    const remainingArea = maxBuildableArea - utilizedArea;
    const utilizedFsi = utilizedArea / (plotArea || 1);

    const isOverLimit = utilizedArea > maxBuildableArea;

    // Premium FSI purchase cost calculation (typically 50% of guidance value * premium FSI area)
    const premiumFsiArea = plotArea * premiumFsiFactor;
    const premiumFsiCost = premiumFsiArea * guidanceValue * 0.5;

    return {
      baseFsi,
      premiumFsiFactor,
      totalPermissibleFsi,
      maxBuildableArea: Math.round(maxBuildableArea),
      utilizedArea: Math.round(utilizedArea),
      utilizedFsi: Number(utilizedFsi.toFixed(2)),
      remainingArea: Math.round(remainingArea),
      isOverLimit,
      premiumFsiArea: Math.round(premiumFsiArea),
      premiumFsiCost: Math.round(premiumFsiCost),
      roadMultiplier
    };
  };

  const results = calculate();

  const handleUnitChange = (newUnit: UnitType) => {
    const factor = newUnit === 'sqft' ? 10.7639 : 1 / 10.7639;
    setUnit(newUnit);
    setPlotArea(Number((plotArea * factor).toFixed(0)));
    setBuiltupFloor(Number((builtupFloor * factor).toFixed(0)));
    setGuidanceValue(newUnit === 'sqft' ? Number((guidanceValue / 10.7639).toFixed(2)) : Number((guidanceValue * 10.7639).toFixed(1)));
  };

  const handleReset = () => {
    setPlotArea(3000);
    setCity('mumbai');
    setCustomFsi(2.0);
    setRoadWidth(12);
    setUsePremiumFsi(false);
    setBuiltupFloor(1500);
    setFloors(3);
  };

  const copyReport = () => {
    const areaUnit = unit === 'sqm' ? 'sq m' : 'sq ft';
    const text = `FAR / FSI Bylaw Compliance Report (${CITY_PRESETS[city].label})
----------------------------------------
Plot Area     : ${plotArea} ${areaUnit}
Adjacent Road : ${roadWidth} meters (FSI Multiplier: ${results.roadMultiplier})
Permissible FSI: ${results.totalPermissibleFsi} (Basic: ${results.baseFsi} + Premium: ${results.premiumFsiFactor})

Planned Structure:
- Floors Count: ${floors} floors
- Footprint Area: ${builtupFloor} ${areaUnit} per floor
- Total Built-up Area: ${results.utilizedArea} ${areaUnit}

FSI Clearance Status:
- Max Permissible Area: ${results.maxBuildableArea} ${areaUnit}
- FSI Utilized: ${results.utilizedFsi} / ${results.totalPermissibleFsi}
- Remaining Area Limit: ${results.remainingArea} ${areaUnit}
- Egress Status: ${results.isOverLimit ? 'FAIL (Exceeds permissible limits)' : 'PASS (Compliant)'}

Premium FSI Charges:
- Premium Area Purchased: ${results.premiumFsiArea} ${areaUnit}
- Total Charges: $${results.premiumFsiCost.toLocaleString()}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left py-4 px-2 select-none">
      
      {/* Parameter Configuration & Results Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Parameter Configuration Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-6 space-y-4">
            <h3 className="font-bold text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500 animate-pulse" />
                <span>Plot & Municipal Presets</span>
              </span>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-150 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Reset Parameters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                  Local Municipality
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as CityPreset)}
                  className="saas-input font-bold"
                >
                  {Object.entries(CITY_PRESETS).map(([k, preset]) => (
                    <option key={k} value={k}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                  Scale Unit System
                </label>
                <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  {(['sqm', 'sqft'] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => handleUnitChange(u)}
                      className={`flex-1 py-1 text-xs font-bold rounded-md transition capitalize cursor-pointer ${
                        unit === u 
                          ? 'bg-white dark:bg-zinc-900 text-indigo-500 shadow-sm' 
                          : 'text-zinc-400 hover:text-zinc-600'
                      }`}
                    >
                      {u === 'sqm' ? 'Sq Meters' : 'Sq Feet'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                  Total Plot Area
                </label>
                <input
                  type="number"
                  value={plotArea}
                  onChange={(e) => setPlotArea(Math.max(1, parseInt(e.target.value) || 1))}
                  className="saas-input font-mono font-bold"
                />
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-850/50 p-4 rounded-xl text-xs space-y-1.5 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">Rule Description</span>
              <p className="font-semibold text-zinc-600 dark:text-zinc-350">{CITY_PRESETS[city].desc}</p>
            </div>
          </div>

          {/* Road width & FSI parameters */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="font-bold text-sm">Zoning bylaws Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5 flex items-center gap-1.5">
                  <Road className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Adjacent Road Width (meters)</span>
                </label>
                <input
                  type="number"
                  value={roadWidth}
                  onChange={(e) => setRoadWidth(Math.max(1, parseInt(e.target.value) || 1))}
                  className="saas-input font-bold"
                />
                <p className="text-[10px] text-zinc-400 mt-1">Roads narrower than 9m reduce FSI capacity.</p>
              </div>

              {city === 'custom' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                    Permissible Basic FSI Value
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={customFsi}
                    onChange={(e) => setCustomFsi(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="saas-input font-mono font-bold"
                  />
                </div>
              )}
            </div>

            {CITY_PRESETS[city].premiumFsiAllowed && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Utilize Paid Premium FSI?</span>
                    <span className="text-[10px] text-zinc-400">Add extra density (up to +0.4 FSI) at premium fee.</span>
                  </div>
                  <button
                    onClick={() => setUsePremiumFsi(!usePremiumFsi)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                      usePremiumFsi 
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' 
                        : 'border-zinc-300 dark:border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {usePremiumFsi ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {usePremiumFsi && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                        Land Guidance Value (₹ / {unit === 'sqm' ? 'sq m' : 'sq ft'})
                      </label>
                      <input
                        type="number"
                        value={guidanceValue}
                        onChange={(e) => setGuidanceValue(Math.max(1, parseFloat(e.target.value) || 1))}
                        className="saas-input font-mono font-bold"
                      />
                      <p className="text-[10px] text-zinc-400 mt-1">Premium fee is typically calculated at 50% of value.</p>
                    </div>

                    <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-3 rounded-xl flex flex-col justify-center text-xs">
                      <span className="text-zinc-500">Premium FSI Purchase Fee</span>
                      <span className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                        ₹{results.premiumFsiCost.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Construction Details inputs */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="font-bold text-sm">Construction Design Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                  Built-up Footprint Area / Floor ({unit === 'sqm' ? 'sq m' : 'sq ft'})
                </label>
                <input
                  type="number"
                  value={builtupFloor}
                  onChange={(e) => setBuiltupFloor(Math.max(1, parseInt(e.target.value) || 1))}
                  className="saas-input font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-455 dark:text-zinc-500 mb-1.5">
                  Total Planned Floors
                </label>
                <input
                  type="number"
                  value={floors}
                  onChange={(e) => setFloors(Math.max(1, parseInt(e.target.value) || 1))}
                  className="saas-input font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results & 3D Visualizer details panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Bylaw clearance</span>
                </span>
                <button
                  onClick={copyReport}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <span className="text-xs text-zinc-455">Total Built-up Area Planned</span>
                  <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                    {results.utilizedArea.toLocaleString()} <span className="text-sm font-semibold">sq {unit}</span>
                  </div>

                  <div className="flex flex-col gap-2 mt-3">
                    <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded border self-start ${
                      results.isOverLimit
                        ? 'text-rose-500 bg-rose-500/10 border-rose-500/30'
                        : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
                    }`}>
                      <span>Status: {results.isOverLimit ? 'EXCEEDS FSI LIMIT' : 'COMPLIANT WITH FSI'}</span>
                    </div>
                  </div>
                </div>

                {/* 3D Stacked Floor Axonometric Viewport */}
                <div className="border-t pt-4 space-y-3">
                  <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">3D Axonometric Floor Stacking</span>
                  <div className="relative w-full aspect-[4/3] rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-center overflow-hidden p-4 shadow-inner">
                    {/* Grid base */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20 pointer-events-none" />

                    {/* 3D Stacked floor slabs */}
                    <div className="relative w-48 h-48 flex justify-center items-center transform rotateX(60deg) rotateZ(-30deg) select-none">
                      {/* Render Plot Ground Plane */}
                      <div className="absolute w-36 h-36 border-2 border-slate-700/60 bg-slate-900/10 rounded flex items-center justify-center">
                        <span className="text-[5.5px] font-black text-slate-500 uppercase tracking-widest -rotate-45">PLOT BASE</span>
                      </div>

                      {/* Render dynamic stacked glass floor slabs */}
                      {Array.from({ length: Math.min(10, floors) }).map((_, idx) => (
                        <div
                          key={idx}
                          style={{
                            transform: `translateZ(${(idx + 1) * 16}px)`,
                            width: `${Math.max(20, Math.min(100, Math.sqrt(builtupFloor / plotArea) * 100))}%`,
                            height: `${Math.max(20, Math.min(100, Math.sqrt(builtupFloor / plotArea) * 100))}%`
                          }}
                          className={`absolute border-2 rounded shadow-lg flex items-center justify-center transition-all duration-500 ${
                            results.isOverLimit
                              ? 'bg-rose-500/10 border-rose-500/60 shadow-rose-500/20'
                              : 'bg-indigo-500/10 border-indigo-500/60 shadow-indigo-500/20'
                          }`}
                        >
                          <span className="text-[5px] font-bold text-zinc-400 rotate-45 scale-75">FLOOR {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                  <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">FSI Audit Details</span>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Max Permissible Area</span>
                    <span className="font-bold font-mono text-zinc-950 dark:text-white">
                      {results.maxBuildableArea.toLocaleString()} sq {unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">FSI Utilized</span>
                    <span className={`font-bold font-mono ${results.isOverLimit ? 'text-rose-500' : 'text-zinc-950 dark:text-white'}`}>
                      {results.utilizedFsi} / {results.totalPermissibleFsi}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                    <span className="text-zinc-400">Remaining Built-up Area</span>
                    <span className={`font-bold font-mono ${results.isOverLimit ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {results.remainingArea.toLocaleString()} sq {unit}
                    </span>
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                  <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                  <p>
                    Floor Area Ratio regulates built envelope densities. Outward extensions or additional storeys must fit the permissible municipal index boundary limits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* SEO & FAQ ACCORDION SECTION */}
      {/* ================================================== */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
        <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h2 className="text-xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Understanding FAR & FSI: Calculations and Bylaws
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Learn how Floor Area Ratio (FAR) and Floor Space Index (FSI) define permissible built-up density, municipal zoning exemptions, and road width limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-600 dark:text-zinc-350 leading-relaxed">
          <div className="space-y-4">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-250 text-sm">How is FAR / FSI Calculated?</h3>
            <p>
              Floor Space Index (FSI), also known as Floor Area Ratio (FAR), is the ratio of the total built-up area of a building across all floors to the total area of the plot it stands on. 
              The formula is simple:
            </p>
            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/60 font-mono text-[10px] text-zinc-800 dark:text-zinc-350">
              FSI = Total Built-up Area (All Floors) / Plot Area
            </div>
            <p>
              For example, if you own a plot of 2,000 sq. ft. and the permissible FSI in your zone is 1.5, the maximum gross floor area you are allowed to build across all levels is 3,000 sq. ft. You can choose to design a 2-story building with 1,500 sq. ft. per floor, or a 3-story building with 1,000 sq. ft. per floor, provided it complies with setbacks.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-250 text-sm">Exemptions and Paid Premium FSI</h3>
            <p>
              In many Indian cities, certain areas are exempted from the FSI calculation (referred to as free-of-FSI spaces). These typically include basements dedicated purely to car parking, common lift shafts, staircases, utility duct lines, and sometimes open balconies up to a specific percentage.
            </p>
            <p>
              If your planned layout exceeds the basic permissible FSI, you can often purchase **Premium FSI** (or paid FSI) from the local municipal authority (like MCGM in Mumbai, DDA in Delhi, or BBMP in Bengaluru). The price is calculated as a percentage of the state land guidance value, allowing developers to add density where road infrastructure supports it.
            </p>
          </div>
        </div>

        {/* FAQs Accordion */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-300 mb-3">Frequently Asked Questions (FAQ)</h3>
          
          {[
            {
              q: "What is the difference between Floor Area Ratio (FAR) and Floor Space Index (FSI)?",
              a: "Mathematically, they are identical. FSI is expressed as a ratio (e.g., 1.5 or 2.0), whereas FAR is expressed as a decimal or percentage (e.g., 150 or 200). An FSI of 2.0 corresponds to a FAR of 200%."
            },
            {
              q: "How does road width affect the permissible FAR / FSI?",
              a: "Local municipal bylaws link density limits to adjacent road widths to manage vehicular congestion and emergency evacuation safety. Wider roads allow fire trucks to turn safely, which is why municipal corporations grant higher basic or premium FSI to plots facing wider roads."
            },
            {
              q: "Are balconies and staircases counted in the FSI area?",
              a: "It depends heavily on the local municipal development bylaws. Most cities exclude structural staircases, elevators, and basement parking from FSI calculations. However, open balconies may be partially counted or exempted up to a fixed percentage (e.g., 10% of floor area) depending on whether you pay a premium fee."
            },
            {
              q: "What is Premium FSI or Paid FSI?",
              a: "Premium FSI is additional built-up area allowed over the basic permissible FSI on payment of a premium charge to the municipal corporation. It is normally allowed on plots facing roads wider than 9 meters (or 30 feet) and capped at 30% to 40% of the basic FSI."
            }
          ].map((faq, index) => (
            <details key={index} className="group border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 transition-all duration-200">
              <summary className="font-bold text-xs text-zinc-700 dark:text-zinc-300 hover:text-indigo-500 cursor-pointer list-none flex justify-between items-center select-none">
                <span>{faq.q}</span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2.5 pl-1.5 border-l-2 border-indigo-500/40 font-semibold">
                {faq.a}
              </p>
            </details>
          ))}
        </div>

        {/* JSON-LD Schema markup for Google search optimization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is the difference between Floor Area Ratio (FAR) and Floor Space Index (FSI)?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "FAR and FSI represent the same built density limit. FSI is a decimal index (like 1.5) while FAR is a percentage (like 150%)."
                }
              },
              {
                "@type": "Question",
                "name": "How does road width affect the permissible FAR / FSI?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Wider adjacent roads support higher traffic loads, prompting municipal authorities to grant higher FSI or allow premium FSI purchase."
                }
              },
              {
                "@type": "Question",
                "name": "Are balconies and staircases counted in the FSI area?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Staircases, elevator shafts, and parking floors are commonly exempt. Balconies might be exempt up to a statutory limit or charged with premium fees."
                }
              }
            ]
          })}
        </script>
      </section>

    </div>
  );
}
