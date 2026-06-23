import { useState } from 'react';
import { Briefcase, Sparkles, RefreshCw } from 'lucide-react';

export default function DiscountCalculator() {
  const [price, setPrice] = useState<number>(1000);
  const [discount, setDiscount] = useState<number>(20);
  const [tax, setTax] = useState<number>(0);

  // Calculation Math
  const discountAmount = (price * discount) / 100;
  const priceAfterDiscount = price - discountAmount;
  const taxAmount = (priceAfterDiscount * tax) / 100;
  const finalPrice = priceAfterDiscount + taxAmount;

  const handleReset = () => {
    setPrice(1000);
    setDiscount(20);
    setTax(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings Form */}
      <div className="lg:col-span-2 saas-card p-6 space-y-6 text-left">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Briefcase className="w-4.5 h-4.5 text-indigo-500" />
          <span>Discount Parameters</span>
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Original Price (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-550 text-xs font-bold">₹</span>
              <input
                type="number"
                value={price === 0 ? '' : price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                className="w-full saas-input saas-input-with-prefix pl-8 pr-4 py-2 text-sm font-semibold"
                placeholder="1000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-650 dark:text-zinc-350">
              <span>Discount Rate (%)</span>
              <span className="text-indigo-650 dark:text-indigo-400">{discount}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-650 dark:text-zinc-350">
              <span>Sales Tax Rate (%) (Optional)</span>
              <span className="text-indigo-650 dark:text-indigo-400">{tax}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="28"
              step="1"
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase">
              <span>0%</span>
              <span>5%</span>
              <span>12%</span>
              <span>18%</span>
              <span>28%</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 hover:border-indigo-500/30 flex items-center gap-1.5 transition duration-300"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Values</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calculations Summary */}
      <div className="space-y-6 text-left">
        <div className="saas-card p-6 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Billing Summary</span>
          </h3>

          <div className="space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">Final Price</span>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1 flex items-baseline gap-0.5">
                <span className="text-lg font-bold">₹</span>
                {finalPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                <span>Original Price</span>
                <span className="text-zinc-850 dark:text-zinc-250">₹{price.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-650 dark:text-zinc-400">
                <span>Discount Saved</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                  -₹{discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-650 dark:text-zinc-400">
                <span>Price after Discount</span>
                <span className="text-zinc-850 dark:text-zinc-250">
                  ₹{priceAfterDiscount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between items-center text-xs font-bold text-zinc-650 dark:text-zinc-400">
                  <span>Sales Tax ({tax}%)</span>
                  <span className="text-zinc-850 dark:text-zinc-250">
                    +₹{taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Savings Badge */}
            {discountAmount > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-3.5 rounded-xl text-center text-xs font-bold leading-relaxed">
                🎉 You save ₹{discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({discount}% OFF) on this item!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
