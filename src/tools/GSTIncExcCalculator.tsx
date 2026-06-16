import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

export default function GSTIncExcCalculator() {
  const [amount, setAmount] = useState<number>(10000);
  const [gstRate, setGstRate] = useState<number>(18);
  const [copiedInc, setCopiedInc] = useState<boolean>(false);
  const [copiedExc, setCopiedExc] = useState<boolean>(false);

  const [incResults, setIncResults] = useState({
    base: 0,
    tax: 0,
    total: 0,
  });

  const [excResults, setExcResults] = useState({
    base: 0,
    tax: 0,
    total: 0,
  });

  const slabs = [5, 12, 18, 28];

  useEffect(() => {
    // 1. Exclusive (GST Added on top of amount)
    const excBase = amount;
    const excTax = (amount * gstRate) / 100;
    const excTotal = amount + excTax;

    // 2. Inclusive (GST Extracted from amount)
    const incTotal = amount;
    const incBase = (amount * 100) / (100 + gstRate);
    const incTax = amount - incBase;

    setExcResults({
      base: Number(excBase.toFixed(2)),
      tax: Number(excTax.toFixed(2)),
      total: Number(excTotal.toFixed(2)),
    });

    setIncResults({
      base: Number(incBase.toFixed(2)),
      tax: Number(incTax.toFixed(2)),
      total: Number(incTotal.toFixed(2)),
    });
  }, [amount, gstRate]);

  const copyInc = () => {
    const text = `GST Inclusive Report (Toolique)
----------------------------------------
Total Amount (Inclusive): ₹${amount.toLocaleString('en-IN')}
GST Rate                : ${gstRate}%
----------------------------------------
Base price (Net Value)  : ₹${incResults.base.toLocaleString('en-IN')}
GST Tax component       : ₹${incResults.tax.toLocaleString('en-IN')}
----------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopiedInc(true);
    setTimeout(() => setCopiedInc(false), 2000);
  };

  const copyExc = () => {
    const text = `GST Exclusive Report (Toolique)
----------------------------------------
Base price (Exclusive)  : ₹${amount.toLocaleString('en-IN')}
GST Rate                : ${gstRate}%
----------------------------------------
GST Tax component       : ₹${excResults.tax.toLocaleString('en-IN')}
Total Amount (Inclusive): ₹${excResults.total.toLocaleString('en-IN')}
----------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopiedExc(true);
    setTimeout(() => setCopiedExc(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Input Panel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Reference Amount (₹)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-semibold text-sm"
            placeholder="e.g. 10000"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            GST Rate (%)
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {slabs.map((slab) => (
              <button
                key={slab}
                onClick={() => setGstRate(slab)}
                className={`py-2 rounded-lg border text-xs font-bold transition ${
                  gstRate === slab
                    ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {slab}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparisons Side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Inclusive Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Option A</span>
                <h4 className="text-base font-bold text-slate-800 dark:text-white">Inclusive of GST</h4>
              </div>
              <button
                onClick={copyInc}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
              >
                {copiedInc ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            
            <p className="text-xs text-slate-400 leading-normal">
              Extracts GST from the initial amount (assumes ₹{amount.toLocaleString('en-IN')} includes tax).
            </p>

            <div className="space-y-2 text-xs md:text-sm pt-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Total Amount</span>
                <span className="font-bold">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-550 dark:text-slate-400">GST Portion ({gstRate}%)</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">- ₹{incResults.tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-slate-800 dark:text-white">
                <span>Base price (Net)</span>
                <span>₹{incResults.base.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exclusive Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Option B</span>
                <h4 className="text-base font-bold text-slate-800 dark:text-white">Exclusive of GST</h4>
              </div>
              <button
                onClick={copyExc}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
              >
                {copiedExc ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              Applies GST on top of the initial amount (assumes ₹{amount.toLocaleString('en-IN')} is the net value).
            </p>

            <div className="space-y-2 text-xs md:text-sm pt-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Base price (Net)</span>
                <span className="font-bold">₹{amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-550 dark:text-slate-400">GST Portion ({gstRate}%)</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">+ ₹{excResults.tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-slate-800 dark:text-white">
                <span>Total Amount</span>
                <span>₹{excResults.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

