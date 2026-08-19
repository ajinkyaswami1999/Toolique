import { useState, useEffect } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface YearBreakdown {
  year: number;
  interestEarned: number;
  totalInterest: number;
  balance: number;
}

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState<number>(100000);
  const [rate, setRate] = useState<number>(8);
  const [years, setYears] = useState<number>(10);
  const [interval, setInterval] = useState<number>(12); // Compounding interval (12=monthly, 4=quarterly, 1=yearly)

  // Outputs
  const [totalPrincipal, setTotalPrincipal] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [maturityValue, setMaturityValue] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<YearBreakdown[]>([]);
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (principal <= 0 || rate < 0 || years <= 0) {
      setTotalPrincipal(0);
      setTotalInterest(0);
      setMaturityValue(0);
      setBreakdown([]);
      return;
    }

    const P = principal;
    const r = rate / 100;
    const t = years;
    const n = interval;

    // Formula: A = P * (1 + r/n)^(n*t)
    const A = P * Math.pow(1 + r / n, n * t);
    const roundedMaturity = Math.round(A);
    const roundedPrincipal = Math.round(P);
    const roundedInterest = roundedMaturity - roundedPrincipal;

    setTotalPrincipal(roundedPrincipal);
    setTotalInterest(roundedInterest);
    setMaturityValue(roundedMaturity);

    // Generate year-by-year breakdown
    const list: YearBreakdown[] = [];
    let currentBalance = P;
    let accumulatedInterest = 0;

    for (let y = 1; y <= t; y++) {
      const yearBalance = P * Math.pow(1 + r / n, n * y);
      const interestForYear = Math.round(yearBalance - currentBalance);
      accumulatedInterest += interestForYear;
      
      list.push({
        year: y,
        interestEarned: interestForYear,
        totalInterest: accumulatedInterest,
        balance: Math.round(yearBalance)
      });
      currentBalance = yearBalance;
    }

    setBreakdown(list);
  }, [principal, rate, years, interval]);

  const handleCopy = () => {
    let text = `Compound Interest Estimation\n`;
    text += `Principal Invested: ₹${totalPrincipal.toLocaleString('en-IN')}\n`;
    text += `Interest Earned: ₹${totalInterest.toLocaleString('en-IN')}\n`;
    text += `Total Maturity Value: ₹${maturityValue.toLocaleString('en-IN')}\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="saas-card p-5 space-y-4 text-left">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">
              Investment Parameters
            </h3>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Principal Amount (₹)</label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="saas-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Rate of Interest (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="saas-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Tenure (Years)</label>
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="saas-input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Compounding Frequency</label>
                <select
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                  className="saas-select"
                >
                  <option value={12}>Monthly (12 times / year)</option>
                  <option value={4}>Quarterly (4 times / year)</option>
                  <option value={2}>Half-Yearly (2 times / year)</option>
                  <option value={1}>Annually (1 time / year)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-6 space-y-5 text-left font-semibold">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                Maturity Breakdown
              </h3>
              <button
                type="button"
                onClick={handleCopy}
                className="saas-button-secondary py-1 px-3 text-[10px] inline-flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-950/20 text-center">
                <div className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Invested</div>
                <div className="text-lg font-black text-zinc-900 dark:text-white mt-1">
                  ₹{totalPrincipal.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-950/20 text-center">
                <div className="text-[9px] font-black uppercase text-zinc-450 tracking-wider">Interest Gained</div>
                <div className="text-lg font-black text-indigo-650 dark:text-indigo-400 mt-1">
                  ₹{totalInterest.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-950/20 text-center">
                <div className="text-[9px] font-black uppercase text-zinc-450 tracking-wider">Maturity Value</div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹{maturityValue.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Breakdown Table */}
            {breakdown.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Year-on-Year Growth Table
                </h4>
                <div className="max-h-[220px] overflow-y-auto pr-1 border border-zinc-200/50 dark:border-zinc-850/60 rounded-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-250 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-900/50 text-[9px] font-black uppercase text-zinc-400 tracking-wider">
                        <th className="py-2 px-3">Year</th>
                        <th className="py-2 px-3">Interest (Year)</th>
                        <th className="py-2 px-3">Total Interest</th>
                        <th className="py-2 px-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.map((row) => (
                        <tr
                          key={row.year}
                          className="border-b border-zinc-200/40 dark:border-zinc-800/40 hover:bg-zinc-550/5 transition font-semibold"
                        >
                          <td className="py-2 px-3 text-zinc-500 dark:text-zinc-400">Yr {row.year}</td>
                          <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">+₹{row.interestEarned.toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-zinc-450 dark:text-zinc-500">₹{row.totalInterest.toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-right text-zinc-900 dark:text-white font-mono">
                            ₹{row.balance.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
