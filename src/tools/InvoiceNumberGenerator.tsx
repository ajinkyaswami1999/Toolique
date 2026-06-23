import { useState, useEffect } from 'react';
import { Copy, Hash, RefreshCw, Layers } from 'lucide-react';

export default function InvoiceNumberGenerator() {
  const [prefix, setPrefix] = useState<string>('INV');
  const [separator, setSeparator] = useState<string>('-');
  const [dateFormat, setDateFormat] = useState<string>('YYYYMM');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [padding, setPadding] = useState<number>(4);
  const [batchSize, setBatchSize] = useState<number>(10);
  const [generatedNumbers, setGeneratedNumbers] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const generateSequence = () => {
    const list: string[] = [];
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    let dateSegment = '';
    if (dateFormat === 'YYYY') dateSegment = String(year);
    else if (dateFormat === 'YYYYMM') dateSegment = `${year}${month}`;
    else if (dateFormat === 'YYYYMMDD') dateSegment = `${year}${month}${day}`;

    for (let i = 0; i < batchSize; i++) {
      const currentNum = startNumber + i;
      const paddedNum = String(currentNum).padStart(padding, '0');

      const parts = [prefix, dateSegment, paddedNum].filter(Boolean);
      list.push(parts.join(separator));
    }
    setGeneratedNumbers(list);
  };

  useEffect(() => {
    generateSequence();
  }, [prefix, separator, dateFormat, startNumber, padding, batchSize]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedNumbers.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
      {/* Settings configuration */}
      <div className="lg:col-span-2 saas-card p-6 space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-indigo-500" />
              <span>Invoice Sequence Settings</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Customize serial formats for business transactions.</p>
          </div>
          <button
            onClick={generateSequence}
            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold transition"
          >
            <RefreshCw className="w-4 h-4 text-indigo-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Prefix Code</label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              className="saas-input w-full"
              placeholder="INV, QT, TX"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Separator</label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="saas-select w-full cursor-pointer"
            >
              <option value="-">Dash (-)</option>
              <option value="/">Slash (/)</option>
              <option value="_">Underscore (_)</option>
              <option value="">None (Empty)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Date Stamp Format</label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="saas-select w-full cursor-pointer"
            >
              <option value="YYYYMM">YearMonth (YYYYMM)</option>
              <option value="YYYYMMDD">YearMonthDay (YYYYMMDD)</option>
              <option value="YYYY">Year Only (YYYY)</option>
              <option value="none">No Date Stamp</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Padding (Digits Width)</label>
            <select
              value={padding}
              onChange={(e) => setPadding(parseInt(e.target.value, 10))}
              className="saas-select w-full cursor-pointer"
            >
              <option value={2}>2 Digits (01)</option>
              <option value={3}>3 Digits (001)</option>
              <option value={4}>4 Digits (0001)</option>
              <option value={6}>6 Digits (000001)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Start Serial Counter</label>
            <input
              type="number"
              value={startNumber}
              onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="saas-input w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Quantity to Generate ({batchSize})</label>
            <input
              type="range"
              min={1}
              max={100}
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value, 10))}
              className="w-full h-1.5 mt-3.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Generated Sequence Output */}
      <div className="saas-card p-6 space-y-6 flex flex-col justify-between">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              <span>Generated Run</span>
            </h3>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy List'}</span>
          </button>
        </div>

        <div className="flex-1 mt-4">
          <textarea
            readOnly
            value={generatedNumbers.join('\n')}
            className="w-full h-72 font-mono text-sm p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl outline-none resize-none leading-relaxed text-zinc-755 dark:text-zinc-350"
          />
        </div>
      </div>
    </div>
  );
}
