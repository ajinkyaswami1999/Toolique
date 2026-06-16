import { useState, useEffect } from 'react';
import { ArrowUpDown, Landmark } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const currencies: Currency[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
];

// Reference rates where USD = 1.0 (Static snapshot updated in 2026)
const ratesToUSD: Record<string, number> = {
  USD: 1.0,
  INR: 83.50,
  EUR: 0.925,
  GBP: 0.785,
  AED: 3.67,
  CAD: 1.37,
  AUD: 1.51,
  SGD: 1.35,
};

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');
  const [convertedValue, setConvertedValue] = useState<number>(0);

  useEffect(() => {
    if (amount <= 0) {
      setConvertedValue(0);
      return;
    }
    const fromRate = ratesToUSD[fromCurrency];
    const toRate = ratesToUSD[toCurrency];

    // Conversion: Convert fromCurrency to USD, then USD to toCurrency
    const amountInUSD = amount / fromRate;
    const result = amountInUSD * toRate;

    setConvertedValue(Number(result.toFixed(4)));
  }, [amount, fromCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getSymbol = (code: string) => {
    return currencies.find((c) => c.code === code)?.symbol || '';
  };


  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Left Input Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Landmark className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Currency Converter</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-150/40 dark:bg-slate-800 dark:text-slate-500 px-2 py-0.5 rounded">
            Static Rates
          </span>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-405 mb-1.5">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500 font-mono">
              {getSymbol(fromCurrency)}
            </span>
            <input
              type="number"
              min="0"
              value={amount || ''}
              onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 font-semibold focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Currency selection & Swap */}
        <div className="grid grid-cols-1 sm:grid-cols-9 items-center gap-3">
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1 flex justify-center pt-5">
            <button
              onClick={handleSwap}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500 hover:text-teal-500 dark:hover:text-teal-400 transition"
              title="Swap Currencies"
            >
              <ArrowUpDown className="w-4 h-4 sm:rotate-90" />
            </button>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-4">
            Converted Result
          </span>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-400">
                {amount.toLocaleString()} {fromCurrency} =
              </span>
              <div className="text-2xl md:text-3xl font-black text-teal-650 dark:text-teal-400 mt-1 leading-tight font-mono">
                {getSymbol(toCurrency)} {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 block">
                1 {fromCurrency} = {(ratesToUSD[toCurrency] / ratesToUSD[fromCurrency]).toFixed(5)} {toCurrency}
              </span>
            </div>

            {/* Quick Rates comparison table */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-400 block mb-2">
                Popular Rates (Against INR)
              </span>
              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                {currencies
                  .filter((c) => c.code !== 'INR')
                  .map((c) => {
                    const inrVal = (ratesToUSD['INR'] / ratesToUSD[c.code]).toFixed(2);
                    return (
                      <div key={c.code} className="flex justify-between items-center py-0.5 border-b border-slate-50 dark:border-slate-800/20 last:border-0">
                        <span className="font-semibold flex items-center gap-1.5">
                          <span>{c.flag}</span>
                          <span>1 {c.code}</span>
                        </span>
                        <span className="font-mono font-bold text-slate-650 dark:text-slate-350">
                          ₹{inrVal} INR
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400 leading-relaxed">
          <p>
            Calculated instantly using updated reference rates. In-browser math eliminates network lag and offers secure, private conversion estimates.
          </p>
        </div>
      </div>
    </div>
  );
}

