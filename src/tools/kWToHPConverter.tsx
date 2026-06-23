import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';

const STANDARDS = {
  mechanical: { name: 'Mechanical / Imperial (1 HP ≈ 0.7457 kW)', val: 0.745699872 },
  metric: { name: 'Metric (1 HP ≈ 0.7355 kW)', val: 0.73549875 },
  electrical: { name: 'Electrical (1 HP ≈ 0.746 kW)', val: 0.746 }
};

export default function kWToHPConverter() {
  const [standard, setStandard] = useState<'mechanical' | 'metric' | 'electrical'>('electrical');
  const [kw, setKw] = useState<number>(1);
  const [hp, setHp] = useState<number>(1.341);
  
  const [activeInput, setActiveInput] = useState<'kw' | 'hp'>('kw');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const ratio = STANDARDS[standard].val;
    if (activeInput === 'kw') {
      const calculatedHp = kw / ratio;
      setHp(isNaN(calculatedHp) ? 0 : calculatedHp);
    } else {
      const calculatedKw = hp * ratio;
      setKw(isNaN(calculatedKw) ? 0 : calculatedKw);
    }
  }, [kw, hp, standard, activeInput]);

  const handleCopy = () => {
    const summary = `Power Conversion Report
--------------------------------------
Standard: ${STANDARDS[standard].name}
Kilowatts: ${kw.toFixed(4)} kW
Horsepower: ${hp.toFixed(4)} HP`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    setStandard('electrical');
    setActiveInput('kw');
    setKw(1);
    setHp(1.341);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Input panel */}
      <div className="md:col-span-7 space-y-6">
        <div className="saas-card p-6 space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Bi-directional Power Converter</h3>
            <button
              onClick={handleReset}
              className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition cursor-pointer"
              title="Reset Converter"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1.5">HORSEPOWER STANDARD</label>
            <select
              value={standard}
              onChange={(e) => setStandard(e.target.value as any)}
              className="saas-select w-full"
            >
              <option value="electrical">{STANDARDS.electrical.name}</option>
              <option value="mechanical">{STANDARDS.mechanical.name}</option>
              <option value="metric">{STANDARDS.metric.name}</option>
            </select>
          </div>

          {/* kW Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-500">KILOWATTS (kW)</label>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={kw % 1 === 0 ? kw : Number(kw.toFixed(4))}
                onChange={(e) => {
                  setActiveInput('kw');
                  setKw(Number(e.target.value));
                }}
                className="saas-input flex-1 font-bold"
              />
              <span className="text-sm font-bold text-zinc-400 w-12">kW</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="100"
              step="0.1"
              value={kw}
              onChange={(e) => {
                setActiveInput('kw');
                setKw(Number(e.target.value));
              }}
              className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-650"
            />
          </div>

          {/* HP Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-zinc-500">HORSEPOWER (HP)</label>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={hp % 1 === 0 ? hp : Number(hp.toFixed(4))}
                onChange={(e) => {
                  setActiveInput('hp');
                  setHp(Number(e.target.value));
                }}
                className="saas-input flex-1 font-bold"
              />
              <span className="text-sm font-bold text-zinc-400 w-12">HP</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="135"
              step="0.1"
              value={hp}
              onChange={(e) => {
                setActiveInput('hp');
                setHp(Number(e.target.value));
              }}
              className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-650"
            />
          </div>
        </div>
      </div>

      {/* Output / Copy Card */}
      <div className="md:col-span-5 space-y-6">
        <div className="saas-card p-6 space-y-5 h-full flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-2">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Summary</h3>
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
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center py-6 text-center space-y-4">
            <div>
              <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                {kw.toFixed(2)} <span className="text-lg">kW</span>
              </span>
            </div>
            <div className="text-zinc-350 dark:text-zinc-750 font-black text-xl">
              equals
            </div>
            <div>
              <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {hp.toFixed(2)} <span className="text-lg">HP</span>
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-850 bg-zinc-50/20 text-[10px] leading-relaxed text-zinc-400 font-semibold">
            Note: Electrical HP is standard for sizing electric motors. Mechanical HP is standard in the US automotive industry. Metric HP (PS) is standard in Europe.
          </div>
        </div>
      </div>
    </div>
  );
}
