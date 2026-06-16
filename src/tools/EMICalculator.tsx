import { useState, useEffect } from 'react';
import { CreditCard, Copy, Check } from 'lucide-react';

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState<number>(2500000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(20);
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    monthlyEmi: 0,
    totalInterest: 0,
    totalPayment: 0,
  });

  const [schedule, setSchedule] = useState<{ year: number; principalPaid: number; interestPaid: number; balance: number }[]>([]);

  useEffect(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenureType === 'years' ? tenure * 12 : tenure;

    let emi = 0;
    if (r > 0) {
      emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      emi = P / n;
    }

    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    setResults({
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
    });

    // Generate yearly amortization schedule
    const yearlyData = [];
    let remainingBalance = P;
    const totalYears = tenureType === 'years' ? tenure : Math.ceil(tenure / 12);

    for (let y = 1; y <= totalYears; y++) {
      let principalPaidInYear = 0;
      let interestPaidInYear = 0;

      // Calculate for 12 months (or fewer for final year if tenure is in months)
      const monthsInYear = tenureType === 'years' ? 12 : Math.min(12, tenure - (y - 1) * 12);

      for (let m = 1; m <= monthsInYear; m++) {
        const interestForMonth = remainingBalance * r;
        const principalForMonth = emi - interestForMonth;
        
        interestPaidInYear += interestForMonth;
        principalPaidInYear += principalForMonth;
        remainingBalance -= principalForMonth;

        if (remainingBalance < 0) remainingBalance = 0;
      }

      yearlyData.push({
        year: y,
        principalPaid: Math.round(principalPaidInYear),
        interestPaid: Math.round(interestPaidInYear),
        balance: Math.round(remainingBalance),
      });
    }

    setSchedule(yearlyData);
  }, [loanAmount, interestRate, tenure, tenureType]);

  const copyReport = () => {
    const text = `Loan EMI Report (Toolique)
----------------------------------------
Loan Amount      : ₹${loanAmount.toLocaleString('en-IN')}
Interest Rate    : ${interestRate}% p.a.
Tenure           : ${tenure} ${tenureType === 'years' ? 'Years' : 'Months'}
----------------------------------------
Monthly EMI      : ₹${results.monthlyEmi.toLocaleString('en-IN')}
Total Interest   : ₹${results.totalInterest.toLocaleString('en-IN')}
Total Payment    : ₹${results.totalPayment.toLocaleString('en-IN')}
----------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Section */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Loan Parameters</h3>

        {/* Loan Amount */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Loan Amount (Principal - ₹)
            </label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
              className="w-32 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="0"
            max="15000000"
            step="10000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <span>₹0</span>
            <span>₹1.5 Crore</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Interest Rate (% p.a.)
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Math.max(1, Math.min(30, Number(e.target.value))))}
              className="w-20 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="5"
            max="20"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <span>5%</span>
            <span>20%</span>
          </div>
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Tenure
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={tenure}
                onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
                className="w-16 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
              />
              <select
                value={tenureType}
                onChange={(e) => {
                  const val = e.target.value as 'years' | 'months';
                  setTenureType(val);
                  setTenure(val === 'years' ? Math.round(tenure / 12) || 1 : tenure * 12);
                }}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-semibold text-slate-500"
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
          <input
            type="range"
            min={tenureType === 'years' ? 1 : 12}
            max={tenureType === 'years' ? 30 : 360}
            step="1"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            <span>{tenureType === 'years' ? '1 Year' : '12 Months'}</span>
            <span>{tenureType === 'years' ? '30 Years' : '360 Months'}</span>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Monthly Repayment Details</span>
              <h3 className="text-xl font-bold text-slate-200 mt-1">EMI Summary</h3>
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
              <span className="text-xs text-slate-400 font-medium">Principal Amount</span>
              <div className="text-lg font-bold text-white mt-1">₹{loanAmount.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Total Interest</span>
              <div className="text-lg font-bold text-teal-400 mt-1">₹{results.totalInterest.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Total Payable</span>
              <div className="text-lg font-bold text-indigo-400 mt-1">₹{results.totalPayment.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Yearly Repayment Schedule</span>
            <div className="max-h-48 overflow-y-auto border border-slate-800/60 rounded-xl">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-900 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Year</th>
                    <th className="py-2.5 px-4">Principal Repaid</th>
                    <th className="py-2.5 px-4">Interest Repaid</th>
                    <th className="py-2.5 px-4 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-800/20">
                      <td className="py-2 px-4 font-semibold text-slate-400">Year {row.year}</td>
                      <td className="py-2 px-4">₹{row.principalPaid.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-4 text-teal-500">₹{row.interestPaid.toLocaleString('en-IN')}</td>
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
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Monthly EMI Installment</span>
            <div className="text-3xl font-black text-white mt-0.5">₹{results.monthlyEmi.toLocaleString('en-IN')}/mo</div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

