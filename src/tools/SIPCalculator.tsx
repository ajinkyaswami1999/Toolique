import { useState, useEffect } from 'react';
import { TrendingUp, Copy, Check } from 'lucide-react';

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(5000);
  const [expectedReturns, setExpectedReturns] = useState<number>(12);
  const [years, setYears] = useState<number>(10);
  const [copied, setCopied] = useState<boolean>(false);

  const [summary, setSummary] = useState({
    investedAmount: 0,
    estimatedReturns: 0,
    maturityValue: 0,
  });

  const [schedule, setSchedule] = useState<{ year: number; investment: number; returns: number; balance: number }[]>([]);

  useEffect(() => {
    const P = monthlyInvestment;
    const i = expectedReturns / 12 / 100;
    const n = years * 12;

    // Standard SIP formula
    // M = P * [ ( (1 + i)^n - 1 ) / i ] * (1 + i)
    const maturityValue = P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    const investedAmount = P * n;
    const estimatedReturns = maturityValue - investedAmount;

    setSummary({
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns),
      maturityValue: Math.round(maturityValue),
    });

    // Generate year-by-year table
    const yearSchedule = [];
    for (let y = 1; y <= years; y++) {
      const yearMonths = y * 12;
      const yearlyInvested = P * yearMonths;
      const yearlyMaturity = P * (((Math.pow(1 + i, yearMonths) - 1) / i) * (1 + i));
      yearSchedule.push({
        year: y,
        investment: Math.round(yearlyInvested),
        returns: Math.round(yearlyMaturity - yearlyInvested),
        balance: Math.round(yearlyMaturity),
      });
    }
    setSchedule(yearSchedule);
  }, [monthlyInvestment, expectedReturns, years]);

  const copyReport = () => {
    const text = `SIP Investment Report (Toolique)
----------------------------------------
Monthly Investment: ₹${monthlyInvestment.toLocaleString('en-IN')}
Return Rate (p.a.) : ${expectedReturns}%
Tenure             : ${years} Years
----------------------------------------
Invested Amount    : ₹${summary.investedAmount.toLocaleString('en-IN')}
Estimated Wealth   : ₹${summary.estimatedReturns.toLocaleString('en-IN')}
Total Value        : ₹${summary.maturityValue.toLocaleString('en-IN')}
----------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Section */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">SIP Details</h3>

        {/* Monthly Investment */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Monthly Investment (₹)
            </label>
            <input
              type="number"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Math.max(500, Number(e.target.value)))}
              className="w-28 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="500"
            max="100000"
            step="500"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <span>₹500</span>
            <span>₹1,00,000</span>
          </div>
        </div>

        {/* Expected Returns */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Expected Return Rate (% p.a.)
            </label>
            <input
              type="number"
              value={expectedReturns}
              onChange={(e) => setExpectedReturns(Math.max(1, Math.min(30, Number(e.target.value))))}
              className="w-20 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="0.5"
            value={expectedReturns}
            onChange={(e) => setExpectedReturns(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <span>1%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Investment Period */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Investment Period (Years)
            </label>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Math.max(1, Math.min(40, Number(e.target.value))))}
              className="w-20 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="1"
            max="40"
            step="1"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <span>1 Yr</span>
            <span>40 Yrs</span>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Estimated Return Summary</span>
              <h3 className="text-xl font-bold text-slate-200 mt-1">Wealth Estimation</h3>
            </div>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Invested Amount</span>
              <div className="text-xl font-bold text-white mt-1">₹{summary.investedAmount.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Est. Returns</span>
              <div className="text-xl font-bold text-teal-400 mt-1">₹{summary.estimatedReturns.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Total Value</span>
              <div className="text-xl font-bold text-indigo-400 mt-1">₹{summary.maturityValue.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Growth Table */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Yearly Growth Breakup</span>
            <div className="max-h-48 overflow-y-auto border border-slate-800/60 rounded-xl">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-900 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Year</th>
                    <th className="py-2.5 px-4">Invested Amount</th>
                    <th className="py-2.5 px-4">Wealth Gain</th>
                    <th className="py-2.5 px-4 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-800/20">
                      <td className="py-2 px-4 font-semibold text-slate-400">Yr {row.year}</td>
                      <td className="py-2 px-4">₹{row.investment.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-teal-500">₹{row.returns.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-right font-semibold text-white">₹{row.balance.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-5 rounded-2xl mt-8 flex justify-between items-center shadow-lg shadow-teal-500/10">
          <div>
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Estimated Wealth (Maturity)</span>
            <div className="text-3xl font-black text-white mt-0.5">₹{summary.maturityValue.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

