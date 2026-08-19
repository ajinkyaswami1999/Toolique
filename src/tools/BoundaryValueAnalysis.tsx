import { useState, useEffect } from 'react';
import { Clipboard, Check, HelpCircle } from 'lucide-react';

interface BoundaryValue {
  value: number;
  label: string;
  category: 'Just Below Min' | 'Minimum' | 'Just Above Min' | 'Nominal' | 'Just Below Max' | 'Maximum' | 'Just Above Max';
  isValid: boolean;
  explanation: string;
}

export default function BoundaryValueAnalysis() {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(100);
  const [copied, setCopied] = useState(false);
  const [boundaries, setBoundaries] = useState<BoundaryValue[]>([]);

  useEffect(() => {
    if (min >= max) {
      setBoundaries([]);
      return;
    }

    const diff = max - min;
    const nominal = Math.round(min + diff / 2);

    const list: BoundaryValue[] = [
      {
        value: min - 1,
        label: 'Min - 1',
        category: 'Just Below Min',
        isValid: false,
        explanation: 'Invalid boundary: below the minimum threshold.'
      },
      {
        value: min,
        label: 'Min',
        category: 'Minimum',
        isValid: true,
        explanation: 'Valid boundary: exactly the minimum allowed value.'
      },
      {
        value: min + 1,
        label: 'Min + 1',
        category: 'Just Above Min',
        isValid: true,
        explanation: 'Valid boundary: just above the minimum allowed value.'
      },
      {
        value: nominal,
        label: 'Nominal',
        category: 'Nominal',
        isValid: true,
        explanation: 'Valid nominal: average/standard expected input.'
      },
      {
        value: max - 1,
        label: 'Max - 1',
        category: 'Just Below Max',
        isValid: true,
        explanation: 'Valid boundary: just below the maximum allowed value.'
      },
      {
        value: max,
        label: 'Max',
        category: 'Maximum',
        isValid: true,
        explanation: 'Valid boundary: exactly the maximum allowed value.'
      },
      {
        value: max + 1,
        label: 'Max + 1',
        category: 'Just Above Max',
        isValid: false,
        explanation: 'Invalid boundary: exceeds the maximum allowed threshold.'
      }
    ];

    setBoundaries(list);
  }, [min, max]);

  const handleCopy = () => {
    if (boundaries.length === 0) return;
    let text = `Boundary Value Analysis (Range: ${min} to ${max})\n`;
    text += `Boundary,Value,Category,Status,Description\n`;
    boundaries.forEach(b => {
      text += `${b.label},${b.value},${b.category},${b.isValid ? 'Valid' : 'Invalid'},${b.explanation}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Parameters */}
        <div className="lg:col-span-4 space-y-4">
          <div className="saas-card p-5 space-y-4 text-left">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">
              Range Specifications
            </h3>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Minimum Value (Min)</label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Maximum Value (Max)</label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => setMax(Number(e.target.value))}
                  className="saas-input"
                />
              </div>
            </div>

            {min >= max && (
              <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-xs font-semibold">
                ⚠️ Error: Minimum must be strictly less than Maximum.
              </div>
            )}
          </div>
        </div>

        {/* Boundary Analysis Output Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="saas-card p-6 space-y-4 text-left">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                  Boundary Calculations (3-Value Testing)
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                disabled={boundaries.length === 0}
                className="saas-button-secondary py-1 px-3 text-[10px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied CSV!' : 'Copy to Clipboard'}</span>
              </button>
            </div>

            {boundaries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      <th className="py-2.5 px-3">Boundary</th>
                      <th className="py-2.5 px-3">Value</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boundaries.map((b, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-zinc-200/40 dark:border-zinc-800/40 hover:bg-zinc-50/30 dark:hover:bg-zinc-950/20 transition-all font-semibold"
                      >
                        <td className="py-3 px-3 font-mono text-[11px] text-indigo-650 dark:text-indigo-400">{b.label}</td>
                        <td className="py-3 px-3 font-mono text-[11px] font-black">{b.value}</td>
                        <td className="py-3 px-3 text-zinc-500 dark:text-zinc-450">{b.category}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded border ${
                              b.isValid
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                            }`}
                          >
                            {b.isValid ? 'Valid' : 'Invalid'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-zinc-450 dark:text-zinc-500 leading-normal">{b.explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                <HelpCircle className="w-10 h-10 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold">Enter a valid Range Specification on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
