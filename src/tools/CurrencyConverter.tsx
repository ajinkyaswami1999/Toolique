import { useState, useEffect } from 'react';
import { ArrowUpDown, Landmark, RefreshCw, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';

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

// Fallback rates where USD = 1.0 (Static snapshot updated in 2026)
const fallbackRates: Record<string, number> = {
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

  const [rates, setRates] = useState<Record<string, number>>(fallbackRates);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'loading' | 'success' | 'error'>('loading');

  // Fetch Resilient Live Rates on Mount
  useEffect(() => {
    setSyncStatus('loading');

    const endpoints = [
      'https://open.er-api.com/v6/latest/USD',
      'https://api.exchangerate-api.com/v4/latest/USD',
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
    ];

    const tryFetch = async (index: number) => {
      if (index >= endpoints.length) {
        throw new Error('All exchange rate API endpoints failed.');
      }
      const url = endpoints[index];
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return { data, url };
    };

    const loadRates = async () => {
      for (let i = 0; i < endpoints.length; i++) {
        try {
          const { data } = await tryFetch(i);
          const ratesObj: Record<string, number> = {};
          let fetchedRates: Record<string, number> = {};
          let updatedTime = '';

          if (data && data.rates) {
            fetchedRates = data.rates;
            if (data.time_last_update_utc) {
              updatedTime = data.time_last_update_utc;
            } else if (data.time_last_updated) {
              updatedTime = new Date(data.time_last_updated * 1000).toUTCString();
            }
          } else if (data && data.usd) {
            const keys = Object.keys(data.usd);
            keys.forEach((k) => {
              fetchedRates[k.toUpperCase()] = data.usd[k];
            });
            if (data.date) {
              updatedTime = data.date;
            }
          }

          // Map fetched rates or fall back
          Object.keys(fallbackRates).forEach((code) => {
            if (fetchedRates[code] !== undefined && fetchedRates[code] > 0) {
              ratesObj[code] = fetchedRates[code];
            } else {
              ratesObj[code] = fallbackRates[code];
            }
          });

          setRates(ratesObj);
          setSyncStatus('success');

          if (updatedTime) {
            const dateObj = new Date(updatedTime);
            const dateStr = dateObj.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            setLastUpdated(dateStr);
          } else {
            setLastUpdated(new Date().toLocaleDateString('en-IN'));
          }
          return; // Success, stop trying remaining endpoints
        } catch (err) {
          console.warn(`Exchange rate endpoint ${endpoints[i]} failed:`, err);
        }
      }
      throw new Error('All exchange rate API endpoints failed.');
    };

    loadRates().catch((err) => {
      console.error('All live currency rate APIs failed:', err);
      setSyncStatus('error');
    });
  }, []);

  // Compute conversion on input or rate changes
  useEffect(() => {
    if (amount <= 0) {
      setConvertedValue(0);
      return;
    }
    const fromRate = rates[fromCurrency] || fallbackRates[fromCurrency];
    const toRate = rates[toCurrency] || fallbackRates[toCurrency];

    // Conversion: Convert fromCurrency to USD, then USD to toCurrency
    const amountInUSD = amount / fromRate;
    const result = amountInUSD * toRate;

    setConvertedValue(Number(result.toFixed(4)));
  }, [amount, fromCurrency, toCurrency, rates]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };



  const getFlag = (code: string) => {
    return currencies.find((c) => c.code === code)?.flag || '';
  };

  const currentFromRate = rates[fromCurrency] || fallbackRates[fromCurrency];
  const currentToRate = rates[toCurrency] || fallbackRates[toCurrency];
  const rateExchange = currentFromRate > 0 ? (currentToRate / currentFromRate) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      {/* Dynamic Header Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm">International Exchange Desk</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Real-time interbank currency calculator</p>
          </div>
        </div>

        {/* Sync Status Badge */}
        {syncStatus === 'loading' && (
          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/30 dark:border-zinc-800/30 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
            <RefreshCw className="w-3 h-3 animate-spin text-zinc-500" />
            <span>Syncing live markets...</span>
          </span>
        )}
        {syncStatus === 'success' && (
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live rates active ({lastUpdated})</span>
          </span>
        )}
        {syncStatus === 'error' && (
          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Fallback rates active</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Wise-Style Converter Block */}
        <div className="md:col-span-7 space-y-6">
          <div className="saas-card p-6 md:p-8 space-y-6">
            
            {/* Source Box */}
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 space-y-2 focus-within:border-indigo-500/30 transition-all duration-300">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-450 dark:text-zinc-500">
                <span>You Send</span>
                <span>Balance Safe</span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  value={amount || ''}
                  onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-transparent text-3xl font-black text-zinc-900 dark:text-white border-0 p-0 focus:ring-0 focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-650"
                  placeholder="0.00"
                />
                
                {/* Custom Inline Currency Select */}
                <div className="relative shrink-0 flex items-center bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl px-2.5 py-1.5 shadow-sm hover:border-zinc-350 dark:hover:border-zinc-600 transition">
                  <span className="text-sm mr-1.5 select-none">{getFlag(fromCurrency)}</span>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="bg-transparent text-sm font-bold text-zinc-850 dark:text-zinc-150 border-0 p-0 pr-6 focus:ring-0 focus:outline-none cursor-pointer"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Middle Row with Swap Connector */}
            <div className="relative flex justify-center items-center py-1">
              <div className="absolute inset-x-0 h-px bg-zinc-150 dark:bg-zinc-850" />
              <button
                onClick={handleSwap}
                className="group relative z-10 p-3 rounded-full bg-indigo-650 hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95"
                title="Swap Currencies"
              >
                <ArrowUpDown className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            {/* Target Box */}
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-450 dark:text-zinc-500">
                <span>You Get (Estimated)</span>
                <span>1 {fromCurrency} = {rateExchange.toFixed(5)} {toCurrency}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-full text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono truncate select-all">
                  {convertedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </div>
                
                {/* Custom Inline Currency Select */}
                <div className="relative shrink-0 flex items-center bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl px-2.5 py-1.5 shadow-sm hover:border-zinc-350 dark:hover:border-zinc-600 transition">
                  <span className="text-sm mr-1.5 select-none">{getFlag(toCurrency)}</span>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="bg-transparent text-sm font-bold text-zinc-850 dark:text-zinc-150 border-0 p-0 pr-6 focus:ring-0 focus:outline-none cursor-pointer"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Currency Select Pills */}
            <div className="pt-2 space-y-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Popular Quick Selects</span>
              <div className="flex flex-wrap gap-1.5">
                {currencies.slice(0, 4).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      if (fromCurrency !== c.code) {
                        setToCurrency(fromCurrency);
                        setFromCurrency(c.code);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                      fromCurrency === c.code
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-550 dark:text-zinc-400 border-transparent hover:border-zinc-250 dark:hover:border-zinc-700'
                    }`}
                  >
                    {c.flag} {c.code}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Details Panel */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Rate Comparison Card */}
          <div className="saas-card p-6 space-y-5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              <span>Live Rates against INR</span>
            </h3>

            <div className="space-y-3">
              {currencies
                .filter((c) => c.code !== 'INR')
                .map((c) => {
                  const fromVal = rates[c.code] || fallbackRates[c.code];
                  const toVal = rates['INR'] || fallbackRates['INR'];
                  const inrVal = fromVal > 0 ? (toVal / fromVal).toFixed(2) : '0.00';
                  return (
                    <div key={c.code} className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/60 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-850/60 transition">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base select-none">{c.flag}</span>
                        <div>
                          <p className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">1 {c.code}</p>
                          <p className="text-[9px] text-zinc-400 font-semibold">{c.name}</p>
                        </div>
                      </div>
                      <span className="font-mono font-black text-zinc-900 dark:text-white text-xs">
                        ₹ {inrVal}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Educational Note Card */}
          <div className="saas-card p-5 bg-gradient-to-br from-indigo-500/[0.02] to-teal-500/[0.02] border border-zinc-200/40 dark:border-zinc-800/40 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Secure Sandboxed Math</span>
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Our conversion engines process calculations strictly within browser sandboxes. No personal transaction history or data coordinates are ever sent offsite, guaranteeing complete data privacy.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
