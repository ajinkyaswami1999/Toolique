import { useState, useEffect } from 'react';
import { HelpCircle, RefreshCw, Copy, Check } from 'lucide-react';

const CABLE_SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

// Resistivity in Ohm.mm²/m at 70°C
const RESISTIVITY = {
  copper: 0.0193,
  aluminum: 0.031
};

export default function VoltageDropCalculator() {
  const [phase, setPhase] = useState<'dc' | '1phase' | '3phase'>('1phase');
  const [material, setMaterial] = useState<'copper' | 'aluminum'>('copper');
  const [cableSize, setCableSize] = useState<number>(2.5);
  const [length, setLength] = useState<number>(50);
  const [lengthUnit, setLengthUnit] = useState<'meters' | 'feet'>('meters');
  const [voltage, setVoltage] = useState<number>(230);
  const [current, setCurrent] = useState<number>(16);
  const [powerFactor, setPowerFactor] = useState<number>(0.8);
  
  const [voltageDrop, setVoltageDrop] = useState<number>(0);
  const [voltageDropPercent, setVoltageDropPercent] = useState<number>(0);
  const [receivingVoltage, setReceivingVoltage] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Convert length to meters for calculation
    const lengthInMeters = lengthUnit === 'feet' ? length * 0.3048 : length;
    
    // Resistance R = rho * L / A (rho is per meter for 1 mm²)
    const R = (RESISTIVITY[material] * lengthInMeters) / cableSize;
    // Standard reactance X = 0.08 Ohm/km = 0.00008 Ohm/m
    const X = 0.00008 * lengthInMeters;

    let drop = 0;

    if (phase === 'dc') {
      drop = 2 * current * R;
    } else if (phase === '1phase') {
      const cosPhi = powerFactor;
      const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
      drop = 2 * current * (R * cosPhi + X * sinPhi);
    } else {
      // 3 Phase
      const cosPhi = powerFactor;
      const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
      drop = Math.sqrt(3) * current * (R * cosPhi + X * sinPhi);
    }

    // Sanity check
    if (isNaN(drop) || drop < 0) drop = 0;
    if (drop > voltage) drop = voltage;

    const percent = (drop / voltage) * 100;
    setVoltageDrop(drop);
    setVoltageDropPercent(percent);
    setReceivingVoltage(voltage - drop);
  }, [phase, material, cableSize, length, lengthUnit, voltage, current, powerFactor]);

  const handleCopy = () => {
    const summary = `Voltage Drop Calculator Report
--------------------------------------
System Phase: ${phase === 'dc' ? 'DC' : phase === '1phase' ? '1-Phase AC' : '3-Phase AC'}
Cable Material: ${material === 'copper' ? 'Copper' : 'Aluminum'}
Cable Conductor Size: ${cableSize} mm²
Cable Length: ${length} ${lengthUnit}
Source Voltage: ${voltage} V
Load Current: ${current} A
Power Factor: ${powerFactor}
--------------------------------------
Calculated Voltage Drop: ${voltageDrop.toFixed(2)} V
Percentage Drop: ${voltageDropPercent.toFixed(2)}%
Voltage at Receiving End: ${receivingVoltage.toFixed(2)} V
Status: ${voltageDropPercent <= 3 ? 'Safe (Under 3%)' : voltageDropPercent <= 5 ? 'Warning (3% to 5%)' : 'Critical (Over 5%)'}`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setPhase('1phase');
    setMaterial('copper');
    setCableSize(2.5);
    setLength(50);
    setLengthUnit('meters');
    setVoltage(230);
    setCurrent(16);
    setPowerFactor(0.8);
  };

  // Determine indicator colors
  const getStatusColor = () => {
    if (voltageDropPercent <= 3) return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
    if (voltageDropPercent <= 5) return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
    return 'text-red-500 border-red-500/20 bg-red-500/5';
  };

  const getStatusMessage = () => {
    if (voltageDropPercent <= 3) return 'Safe: Recommended for lighting & power branch circuits.';
    if (voltageDropPercent <= 5) return 'Acceptable: Max limit for feeders under standard regulations.';
    return 'Critical: High voltage drop! Consider increasing cable size or reducing current load.';
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Input Form */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Circuit Parameters</h3>
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
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">ELECTRICAL PHASE</label>
              <select
                value={phase}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setPhase(val);
                  if (val === '3phase') setVoltage(415);
                  else if (val === '1phase') setVoltage(230);
                  else setVoltage(12);
                }}
                className="saas-select w-full"
              >
                <option value="dc">DC (Direct Current)</option>
                <option value="1phase">1-Phase AC (230V standard)</option>
                <option value="3phase">3-Phase AC (415V standard)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">CABLE CONDUCTOR MATERIAL</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMaterial('copper')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer text-center ${material === 'copper' ? 'border-indigo-500 bg-indigo-50/5 text-indigo-650 dark:text-indigo-400' : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                >
                  Copper
                </button>
                <button
                  type="button"
                  onClick={() => setMaterial('aluminum')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer text-center ${material === 'aluminum' ? 'border-indigo-500 bg-indigo-50/5 text-indigo-650 dark:text-indigo-400' : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                >
                  Aluminum
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">CABLE SIZE (SQ MM)</label>
              <select
                value={cableSize}
                onChange={(e) => setCableSize(Number(e.target.value))}
                className="saas-select w-full"
              >
                {CABLE_SIZES.map(size => (
                  <option key={size} value={size}>{size} mm²</option>
                ))}
              </select>
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
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">SYSTEM VOLTAGE (V)</label>
              <input
                type="number"
                value={voltage}
                onChange={(e) => setVoltage(Math.max(1, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">LOAD CURRENT (AMPS)</label>
              <input
                type="number"
                value={current}
                onChange={(e) => setCurrent(Math.max(0, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>

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
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Calculated Drop</h3>
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

          {/* Visual Drop Meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-zinc-500">
              <span>VOLTAGE DROP INDEX</span>
              <span className={voltageDropPercent <= 3 ? 'text-emerald-500' : voltageDropPercent <= 5 ? 'text-amber-500' : 'text-red-500'}>
                {voltageDropPercent.toFixed(2)}%
              </span>
            </div>
            
            <div className="h-3.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(3, voltageDropPercent) * 20}%` }}
              />
              <div 
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${Math.min(2, Math.max(0, voltageDropPercent - 3)) * 20}%` }}
              />
              <div 
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${Math.min(5, Math.max(0, voltageDropPercent - 5)) * 12}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-zinc-400 font-semibold px-0.5">
              <span>0% (Perfect)</span>
              <span>3% (NEC Target)</span>
              <span>5% (Max Limit)</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${getStatusColor()}`}>
            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{getStatusMessage()}</span>
          </div>

          {/* Numerical Results Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">VOLTAGE DROP</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100">
                {voltageDrop.toFixed(2)} V
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">RECEIVING VOLTAGE</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100">
                {receivingVoltage.toFixed(1)} V
              </span>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="space-y-2.5 text-xs border-t border-zinc-100 dark:border-zinc-850 pt-4">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Conductor Resistivity:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {RESISTIVITY[material].toFixed(4)} Ω·mm²/m
              </span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Estimated Power Loss:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {(voltageDrop * current).toFixed(1)} W
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
