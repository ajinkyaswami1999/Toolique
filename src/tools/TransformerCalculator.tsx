import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';

export default function TransformerCalculator() {
  const [kva, setKva] = useState<number>(10); // 10 kVA default
  const [phase, setPhase] = useState<'1phase' | '3phase'>('1phase');
  const [vPrimary, setVPrimary] = useState<number>(440); // 440V Primary default
  const [vSecondary, setVSecondary] = useState<number>(220); // 220V Secondary default
  const [turnsPerVolt, setTurnsPerVolt] = useState<number>(4); // default 4 turns/volt

  // Outputs
  const [iPrimary, setIPrimary] = useState<number>(0);
  const [iSecondary, setISecondary] = useState<number>(0);
  const [turnsRatio, setTurnsRatio] = useState<number>(0);
  const [nPrimary, setNPrimary] = useState<number>(0);
  const [nSecondary, setNSecondary] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // 1. Calculate Full load currents
    let ip = 0;
    let is = 0;

    if (phase === '1phase') {
      ip = (kva * 1000) / vPrimary;
      is = (kva * 1000) / vSecondary;
    } else {
      // 3 phase: I = kVA * 1000 / (sqrt(3) * V)
      ip = (kva * 1000) / (Math.sqrt(3) * vPrimary);
      is = (kva * 1000) / (Math.sqrt(3) * vSecondary);
    }

    setIPrimary(isNaN(ip) || ip < 0 ? 0 : ip);
    setISecondary(isNaN(is) || is < 0 ? 0 : is);

    // 2. Turns ratio Vp / Vs
    const ratio = vPrimary / vSecondary;
    setTurnsRatio(isNaN(ratio) || ratio < 0 ? 0 : ratio);

    // 3. Winding turns
    const np = vPrimary * turnsPerVolt;
    const ns = vSecondary * turnsPerVolt;
    setNPrimary(isNaN(np) ? 0 : Math.round(np));
    setNSecondary(isNaN(ns) ? 0 : Math.round(ns));

  }, [kva, phase, vPrimary, vSecondary, turnsPerVolt]);

  const handleCopy = () => {
    const summary = `Transformer Sizing & Winding Report
--------------------------------------
Rating: ${kva} kVA
System Phase: ${phase === '1phase' ? 'Single Phase' : 'Three Phase'}
Primary Voltage: ${vPrimary} V
Secondary Voltage: ${vSecondary} V
Turns per Volt Constant: ${turnsPerVolt}
--------------------------------------
Primary Full-Load Current: ${iPrimary.toFixed(2)} A
Secondary Full-Load Current: ${iSecondary.toFixed(2)} A
Turns Ratio (Np/Ns): ${turnsRatio.toFixed(3)}
Primary Winding Turns (Np): ${nPrimary} turns
Secondary Winding Turns (Ns): ${nSecondary} turns`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setKva(10);
    setPhase('1phase');
    setVPrimary(440);
    setVSecondary(220);
    setTurnsPerVolt(4);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Inputs (Left) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Transformer Parameters</h3>
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
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">TRANSFORMER RATING (kVA)</label>
              <input
                type="number"
                value={kva}
                onChange={(e) => setKva(Math.max(0.1, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">WINDING CONFIGURATION</label>
              <select
                value={phase}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setPhase(val);
                  if (val === '3phase') {
                    setVPrimary(11000);
                    setVSecondary(415);
                  } else {
                    setVPrimary(440);
                    setVSecondary(220);
                  }
                }}
                className="saas-select w-full"
              >
                <option value="1phase">Single-Phase (1-Ph)</option>
                <option value="3phase">Three-Phase (3-Ph)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">PRIMARY VOLTAGE (V_PRIMARY)</label>
              <input
                type="number"
                value={vPrimary}
                onChange={(e) => setVPrimary(Math.max(1, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1.5">SECONDARY VOLTAGE (V_SECONDARY)</label>
              <input
                type="number"
                value={vSecondary}
                onChange={(e) => setVSecondary(Math.max(1, Number(e.target.value)))}
                className="saas-input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1.5">TURNS PER VOLT CONSTANT (Te)</label>
            <input
              type="number"
              step="0.1"
              value={turnsPerVolt}
              onChange={(e) => setTurnsPerVolt(Math.max(0.1, Number(e.target.value)))}
              className="saas-input w-full"
              title="Specific constant used to calculate core coil rotations based on iron cross-sectional area"
            />
          </div>
        </div>
      </div>

      {/* Outputs (Right) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="saas-card p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Calculated Specifications</h3>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">PRIMARY CURRENT (Ip)</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100">
                {iPrimary.toFixed(2)} A
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">SECONDARY CURRENT (Is)</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100">
                {iSecondary.toFixed(2)} A
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">PRIMARY COIL WINDING</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100 font-mono">
                {nPrimary} <span className="text-xs font-sans">Turns</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <span className="block text-[10px] font-bold text-zinc-400">SECONDARY COIL WINDING</span>
              <span className="text-lg font-black text-zinc-850 dark:text-zinc-100 font-mono">
                {nSecondary} <span className="text-xs font-sans">Turns</span>
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs border-t border-zinc-100 dark:border-zinc-850 pt-4">
            <div className="flex justify-between text-zinc-650 dark:text-zinc-400">
              <span>Turns Ratio (Np / Ns):</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {turnsRatio.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-650 dark:text-zinc-400">
              <span>Transformer Type:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {vPrimary > vSecondary ? 'Step-Down Transformer' : vPrimary < vSecondary ? 'Step-Up Transformer' : 'Isolation Transformer'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
