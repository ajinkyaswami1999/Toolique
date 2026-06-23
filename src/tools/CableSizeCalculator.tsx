import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';

const CABLE_SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

// Base ampacity in conduit for Copper at 30°C ambient
const BASE_AMPACITY_COPPER = {
  1.5: 14,
  2.5: 19,
  4: 26,
  6: 33,
  10: 45,
  16: 61,
  25: 80,
  35: 99,
  50: 120,
  70: 153,
  95: 186,
  120: 215,
  150: 247,
  185: 282,
  240: 333,
  300: 382
};

const RESISTIVITY = {
  copper: 0.0193,
  aluminum: 0.031
};

export default function CableSizeCalculator() {
  const [load, setLoad] = useState<number>(3.5); // kW by default
  const [loadUnit, setLoadUnit] = useState<'kw' | 'amps' | 'hp'>('kw');
  const [phase, setPhase] = useState<'dc' | '1phase' | '3phase'>('1phase');
  const [material, setMaterial] = useState<'copper' | 'aluminum'>('copper');
  const [voltage, setVoltage] = useState<number>(230);
  const [length, setLength] = useState<number>(40);
  const [lengthUnit, setLengthUnit] = useState<'meters' | 'feet'>('meters');
  const [powerFactor, setPowerFactor] = useState<number>(0.8);
  const [allowableDrop, setAllowableDrop] = useState<number>(3); // 3% default
  
  const [installation, setInstallation] = useState<'conduit' | 'air' | 'buried'>('conduit');
  const [insulation, setInsulation] = useState<'pvc' | 'xlpe'>('pvc');

  // Outputs
  const [loadCurrent, setLoadCurrent] = useState<number>(0);
  const [recommendedSize, setRecommendedSize] = useState<number | null>(null);
  const [calculatedDrop, setCalculatedDrop] = useState<number>(0);
  const [isSizeFeasible, setIsSizeFeasible] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // 1. Calculate Load Current (Amps)
    let amps = 0;
    if (loadUnit === 'amps') {
      amps = load;
    } else {
      let watts = loadUnit === 'hp' ? load * 746 : load * 1000;
      if (phase === 'dc') {
        amps = watts / voltage;
      } else if (phase === '1phase') {
        amps = watts / (voltage * powerFactor);
      } else {
        // 3 Phase
        amps = watts / (Math.sqrt(3) * voltage * powerFactor);
      }
    }
    
    if (isNaN(amps) || amps < 0) amps = 0;
    setLoadCurrent(amps);

    // 2. Find Conductor sizes satisfying Ampacity
    // Calculate length in meters for voltage drop check
    const lenMtrs = lengthUnit === 'feet' ? length * 0.3048 : length;
    let foundSize: number | null = null;

    for (const size of CABLE_SIZES) {
      // Get base copper ampacity in conduit
      let ampacity = BASE_AMPACITY_COPPER[size as keyof typeof BASE_AMPACITY_COPPER] || 10;
      
      // Adjust for Material
      if (material === 'aluminum') {
        ampacity *= 0.76; // Aluminum ampacity is lower
      }
      
      // Adjust for Installation method
      if (installation === 'air') {
        ampacity *= 1.25; // Open air cooling is better
      } else if (installation === 'buried') {
        ampacity *= 1.1; // Soil thermal dissipation
      }

      // Adjust for Insulation temperature limit
      if (insulation === 'xlpe') {
        ampacity *= 1.15; // XLPE handles 90°C compared to PVC 70°C
      }

      // Check if size handles current
      if (ampacity >= amps) {
        // Calculate Voltage Drop for this size
        const R = (RESISTIVITY[material] * lenMtrs) / size;
        const X = 0.00008 * lenMtrs;
        let vDrop = 0;

        if (phase === 'dc') {
          vDrop = 2 * amps * R;
        } else if (phase === '1phase') {
          const cosPhi = powerFactor;
          const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
          vDrop = 2 * amps * (R * cosPhi + X * sinPhi);
        } else {
          const cosPhi = powerFactor;
          const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
          vDrop = Math.sqrt(3) * amps * (R * cosPhi + X * sinPhi);
        }

        const dropPercent = (vDrop / voltage) * 100;
        
        // Check if voltage drop is within limit
        if (dropPercent <= allowableDrop) {
          foundSize = size;
          setCalculatedDrop(dropPercent);
          break;
        }
      }
    }

    if (foundSize) {
      setRecommendedSize(foundSize);
      setIsSizeFeasible(true);
    } else {
      // If no size matches both current and drop, use the absolute largest size but flag infeasibility
      setRecommendedSize(300);
      setIsSizeFeasible(false);
      
      // Calculate drop for max size
      const R = (RESISTIVITY[material] * lenMtrs) / 300;
      const X = 0.00008 * lenMtrs;
      const vDrop = phase === 'dc' 
        ? 2 * amps * R 
        : phase === '1phase' 
          ? 2 * amps * (R * powerFactor + X * Math.sqrt(1 - powerFactor * powerFactor))
          : Math.sqrt(3) * amps * (R * powerFactor + X * Math.sqrt(1 - powerFactor * powerFactor));
      setCalculatedDrop((vDrop / voltage) * 100);
    }
  }, [load, loadUnit, phase, material, voltage, length, lengthUnit, powerFactor, allowableDrop, installation, insulation]);

  const handleCopy = () => {
    const summary = `Cable Size Calculator Report
--------------------------------------
Connected Load: ${load} ${loadUnit.toUpperCase()}
Calculated Current: ${loadCurrent.toFixed(2)} A
Voltage & Phase: ${voltage}V (${phase === 'dc' ? 'DC' : phase === '1phase' ? '1-Phase AC' : '3-Phase AC'})
Installation Type: ${installation === 'conduit' ? 'In Conduit' : installation === 'air' ? 'Open Air' : 'Direct Buried'}
Insulation Type: ${insulation.toUpperCase()}
Conductor: ${material === 'copper' ? 'Copper' : 'Aluminum'}
Length of Run: ${length} ${lengthUnit}
Allowable Drop Limit: ${allowableDrop}%
--------------------------------------
Recommended Cable size: ${isSizeFeasible && recommendedSize ? `${recommendedSize} mm²` : 'Exceeds standard 300 mm² size'}
Calculated Voltage Drop: ${calculatedDrop.toFixed(2)}%
Feasible: ${isSizeFeasible ? 'Yes' : 'No (Requires parallel runs/larger design)'}`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setLoad(3.5);
    setLoadUnit('kw');
    setPhase('1phase');
    setMaterial('copper');
    setVoltage(230);
    setLength(40);
    setLengthUnit('meters');
    setPowerFactor(0.8);
    setAllowableDrop(3);
    setInstallation('conduit');
    setInsulation('pvc');
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Inputs Column */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Cable Sizing Inputs</h3>
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
                onChange={(e) => setLoad(Math.max(0.1, Number(e.target.value)))}
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
                <option value="kw">Kilowatt (kW)</option>
                <option value="amps">Amps (A)</option>
                <option value="hp">Horsepower (HP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">SYSTEM VOLTAGE (V) & PHASE</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="number"
                    value={voltage}
                    onChange={(e) => setVoltage(Math.max(1, Number(e.target.value)))}
                    className="saas-input w-full"
                  />
                </div>
                <div>
                  <select
                    value={phase}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setPhase(val);
                      if (val === '3phase') setVoltage(415);
                      else if (val === '1phase') setVoltage(230);
                      else setVoltage(12);
                    }}
                    className="saas-select w-full text-xs px-1"
                  >
                    <option value="dc">DC</option>
                    <option value="1phase">1-Ph</option>
                    <option value="3phase">3-Ph</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">CABLE LENGTH</label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(Math.max(1, Number(e.target.value)))}
                  className="saas-input w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1.5">UNIT</label>
                <select
                  value={lengthUnit}
                  onChange={(e) => setLengthUnit(e.target.value as any)}
                  className="saas-select w-full"
                >
                  <option value="meters">m</option>
                  <option value="feet">ft</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">CONDUCTOR MATERIAL</label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value as any)}
                className="saas-select w-full"
              >
                <option value="copper">Copper (Cu)</option>
                <option value="aluminum">Aluminum (Al)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">INSTALLATION METHOD</label>
              <select
                value={installation}
                onChange={(e) => setInstallation(e.target.value as any)}
                className="saas-select w-full"
              >
                <option value="conduit">In Conduit / Duct</option>
                <option value="air">In Free Air / Trays</option>
                <option value="buried">Direct Buried Underground</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">CABLE INSULATION TYPE</label>
              <select
                value={insulation}
                onChange={(e) => setInsulation(e.target.value as any)}
                className="saas-select w-full"
              >
                <option value="pvc">PVC (70°C max temp)</option>
                <option value="xlpe">XLPE (90°C max temp)</option>
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
                disabled={phase === 'dc'}
                onChange={(e) => setPowerFactor(Math.min(1.0, Math.max(0.1, Number(e.target.value))))}
                className="saas-input w-full disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">ALLOWABLE DROP LIMIT (%)</label>
              <select
                value={allowableDrop}
                onChange={(e) => setAllowableDrop(Number(e.target.value))}
                className="saas-select w-full"
              >
                <option value="1">1% (Very Strict)</option>
                <option value="2">2%</option>
                <option value="3">3% (NEC Standard)</option>
                <option value="5">5% (Utility Max)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Outputs Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Sizing Result</h3>
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
            <span className="block text-[10px] font-bold text-zinc-400">RECOMMENDED CABLE SIZE</span>
            {isSizeFeasible ? (
              <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                {recommendedSize} <span className="text-xl">mm²</span>
              </span>
            ) : (
              <span className="text-lg font-black text-red-500">
                Size Exceeds 300 mm²
              </span>
            )}
            <span className="block text-[10px] text-zinc-400 font-semibold mt-1">
              Minimum conductor size based on load & drop limits
            </span>
          </div>

          {/* Sizing Parameters Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">CALCULATED CURRENT</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100">
                {loadCurrent.toFixed(1)} A
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">VOLTAGE DROP</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100">
                {calculatedDrop.toFixed(2)}%
              </span>
            </div>
          </div>

          {!isSizeFeasible && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-600 dark:text-red-400 font-bold leading-relaxed">
              Caution: The required current or distance exceeds standard single cable sizes. Consider running multiple cables in parallel or stepping up system voltage.
            </div>
          )}

          {/* Quick Specifications */}
          <div className="space-y-2.5 text-xs border-t border-zinc-100 dark:border-zinc-850 pt-4">
            <div className="flex justify-between text-zinc-650 dark:text-zinc-400">
              <span>Allowable Drop Target:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {allowableDrop}% ({((allowableDrop / 100) * voltage).toFixed(1)} V)
              </span>
            </div>
            <div className="flex justify-between text-zinc-650 dark:text-zinc-400">
              <span>Material Resistivity:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {RESISTIVITY[material].toFixed(4)} Ω·mm²/m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
