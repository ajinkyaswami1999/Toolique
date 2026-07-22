import { useState } from 'react';
import { Fingerprint, Copy, Check, RefreshCw } from 'lucide-react';

// Fallback UUID v4 generator if crypto.randomUUID isn't available
const generateUUIDv4 = (): string => {
  if (typeof window !== 'undefined' && typeof window.crypto?.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  // Fallback math-based uuid v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function UUIDGenerator() {
  const [count, setCount] = useState<number>(5);
  const [useUppercase, setUseUppercase] = useState<boolean>(false);
  const [includeHyphens, setIncludeHyphens] = useState<boolean>(true);
  
  const [uuids, setUuids] = useState<string[]>(() => {
    const list: string[] = [];
    for (let i = 0; i < 5; i++) {
      list.push(generateUUIDv4());
    }
    return list;
  });

  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = () => {
    const list: string[] = [];
    const iterations = Math.min(100, Math.max(1, count));
    for (let i = 0; i < iterations; i++) {
      let uuid = generateUUIDv4();
      if (!includeHyphens) {
        uuid = uuid.replace(/-/g, '');
      }
      if (useUppercase) {
        uuid = uuid.toUpperCase();
      }
      list.push(uuid);
    }
    setUuids(list);
  };

  const handleCopyAll = () => {
    if (uuids.length === 0) return;
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyOne = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Left Settings Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Fingerprint className="w-4.5 h-4.5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">UUID Options</h3>
        </div>

        {/* Count Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Quantity (1 - 100)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={count || ''}
            onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Configurations */}
        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeHyphens}
              onChange={(e) => setIncludeHyphens(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-4.5 h-4.5 dark:border-slate-800 bg-transparent"
            />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-450">
              Include hyphens (standard formatting)
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useUppercase}
              onChange={(e) => setUseUppercase(e.target.checked)}
              className="rounded text-teal-600 focus:ring-teal-500 w-4.5 h-4.5 dark:border-slate-800 bg-transparent"
            />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-450">
              Uppercase letters
            </span>
          </label>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-650 hover:bg-teal-700 text-sm font-bold text-white shadow-sm transition"
        >
          <RefreshCw className="w-4 h-4" />
          Generate UUIDs
        </button>
      </div>

      {/* Right Outputs Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Generated UUID v4 List
            </span>
            {uuids.length > 0 && (
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 text-xs font-bold text-slate-600 dark:text-slate-300 transition"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'All Copied!' : 'Copy All'}</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {uuids.map((uuid, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 font-mono text-xs text-slate-700 dark:text-slate-300"
              >
                <span className="truncate select-all">{uuid}</span>
                <button
                  onClick={() => handleCopyOne(uuid, idx)}
                  className="p-1 rounded text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition"
                  title="Copy"
                >
                  {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Universally Unique Identifier (UUID) v4 is standard generated based on random numbers. Each UUID v4 has 122 bits of random entropy.
          </p>
        </div>
      </div>
    </div>
  );
}

