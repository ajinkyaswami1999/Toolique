import { useState, useEffect } from 'react';
import { Landmark, Copy, Check } from 'lucide-react';

export default function PPFCalculator() {
  const [yearlyInvestment, setYearlyInvestment] = useState<number>(100000);
  const [rate, setRate] = useState<number>(7.1);
  const [tenure, setTenure] = useState<number>(15);
  const [copied, setCopied] = useState<boolean>(false);

  const [summary, setSummary] = useState({
    invested: 0,
    interest: 0,
    maturityValue: 0,
  });

  const [schedule, setSchedule] = useState<{ year: number; investment: number; interest: number; balance: number }[]>([]);

  useEffect(() => {
    const P = yearlyInvestment;
    const r = rate / 100;
    
    let balance = 0;
    let totalInvested = 0;
    const yearSchedule = [];

    for (let y = 1; y <= tenure; y++) {
      totalInvested += P;
      // PPF compounding annually
      const openingBalance = balance + P;
      const interestEarned = openingBalance * r;
      balance = openingBalance + interestEarned;

      yearSchedule.push({
        year: y,
        investment: Math.round(totalInvested),
        interest: Math.round(interestEarned),
        balance: Math.round(balance),
      });
    }

    setSummary({
      invested: Math.round(totalInvested),
      interest: Math.round(balance - totalInvested),
      maturityValue: Math.round(balance),
    });
    setSchedule(yearSchedule);
  }, [yearlyInvestment, rate, tenure]);

  const copyReport = () => {
    const text = `PPF Calculation Report (Toolique)
----------------------------------------
Yearly Investment: ₹${yearlyInvestment.toLocaleString('en-IN')}
Interest Rate    : ${rate}% p.a. (Compounded Annually)
Tenure           : ${tenure} Years
----------------------------------------
Total Invested   : ₹${summary.invested.toLocaleString('en-IN')}
Interest Earned  : ₹${summary.interest.toLocaleString('en-IN')}
Maturity Value   : ₹${summary.maturityValue.toLocaleString('en-IN')}
----------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Panel */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">PPF Account Parameters</h3>

        {/* Yearly Investment */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Yearly Investment (₹)
            </label>
            <input
              type="number"
              value={yearlyInvestment}
              onChange={(e) => setYearlyInvestment(Math.max(500, Math.min(150000, Number(e.target.value))))}
              className="w-28 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="500"
            max="150000"
            step="500"
            value={yearlyInvestment}
            onChange={(e) => setYearlyInvestment(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <span>₹500 (Min)</span>
            <span>₹1.5 Lakhs (Max)</span>
          </div>
        </div>

        {/* Rate of Interest */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Rate of Interest (% p.a.)
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Math.max(1, Math.min(15, Number(e.target.value))))}
              className="w-20 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="5"
            max="12"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <span>5%</span>
            <span>12% (Current: 7.1%)</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Tenure (Lock-in: 15 years)
          </label>
          <select
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium text-sm"
          >
            <option value="15" className="dark:bg-slate-950">15 Years (Default)</option>
            <option value="20" className="dark:bg-slate-950">20 Years (5-yr Extension)</option>
            <option value="25" className="dark:bg-slate-950">25 Years (10-yr Extension)</option>
            <option value="30" className="dark:bg-slate-950">30 Years</option>
            <option value="35" className="dark:bg-slate-950">35 Years</option>
            <option value="40" className="dark:bg-slate-950">40 Years</option>
            <option value="45" className="dark:bg-slate-950">45 Years</option>
            <option value="50" className="dark:bg-slate-950">50 Years</option>
          </select>
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Public Provident Fund Summary</span>
              <h3 className="text-xl font-bold text-slate-200 mt-1">Maturity Returns</h3>
            </div>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Total Investment</span>
              <div className="text-xl font-bold text-white mt-1">₹{summary.invested.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Est. Interest Earned</span>
              <div className="text-xl font-bold text-teal-400 mt-1">₹{summary.interest.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Maturity Value</span>
              <div className="text-xl font-bold text-indigo-400 mt-1">₹{summary.maturityValue.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Yearly Schedule Table */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Year-by-Year Growth Table</span>
            <div className="max-h-48 overflow-y-auto border border-slate-800/60 rounded-xl">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-900 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Year</th>
                    <th className="py-2.5 px-4">Invested Amount</th>
                    <th className="py-2.5 px-4">Interest Added</th>
                    <th className="py-2.5 px-4 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-800/20">
                      <td className="py-2 px-4 font-semibold text-slate-400">Yr {row.year}</td>
                      <td className="py-2 px-4">₹{row.investment.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-teal-500">₹{row.interest.toLocaleString('en-IN')}</td>
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
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Estimated Maturity Value</span>
            <div className="text-3xl font-black text-white mt-0.5">₹{summary.maturityValue.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <Landmark className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

