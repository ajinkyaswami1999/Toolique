import { useState, useEffect } from 'react';
import { Copy, Check, TrendingUp } from 'lucide-react';

export default function NPSCalculator() {
  const [monthlyContribution, setMonthlyContribution] = useState<number>(10000);
  const [expectedReturns, setExpectedReturns] = useState<number>(10);
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [annuityPercent, setAnnuityPercent] = useState<number>(40);
  const [annuityRate, setAnnuityRate] = useState<number>(6);
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    totalInvested: 0,
    maturityValue: 0,
    interestEarned: 0,
    lumpSumValue: 0,
    annuityValue: 0,
    monthlyPension: 0,
    investmentYears: 0,
  });

  useEffect(() => {
    const P = monthlyContribution;
    const i = expectedReturns / 12 / 100;
    const yearsToInvest = 60 - currentAge;
    
    if (yearsToInvest <= 0) return;
    
    const totalMonths = yearsToInvest * 12;

    // SIP Maturity Value
    const maturityValue = P * (((Math.pow(1 + i, totalMonths) - 1) / i) * (1 + i));
    const totalInvested = P * totalMonths;
    const interestEarned = maturityValue - totalInvested;

    // Split at age 60
    const annuityValue = (maturityValue * annuityPercent) / 100;
    const lumpSumValue = maturityValue - annuityValue;

    // Monthly Pension from Annuity Balance
    // Monthly Pension = (Annuity Balance * Annuity Rate) / 12 / 100
    const monthlyPension = (annuityValue * (annuityRate / 100)) / 12;

    setResults({
      totalInvested: Math.round(totalInvested),
      maturityValue: Math.round(maturityValue),
      interestEarned: Math.round(interestEarned),
      annuityValue: Math.round(annuityValue),
      lumpSumValue: Math.round(lumpSumValue),
      monthlyPension: Math.round(monthlyPension),
      investmentYears: yearsToInvest,
    });
  }, [monthlyContribution, expectedReturns, currentAge, annuityPercent, annuityRate]);

  const copyReport = () => {
    const text = `NPS Retirement Report (Toolique)
----------------------------------------
Monthly Contribution: ₹${monthlyContribution.toLocaleString('en-IN')}/mo
Expected Return Rate: ${expectedReturns}% p.a.
Current Age         : ${currentAge} Years (Investing till 60)
Annuity Reinvested  : ${annuityPercent}%
Expected Annuity %  : ${annuityRate}%
----------------------------------------
Total Invested      : ₹${results.totalInvested.toLocaleString('en-IN')}
Total Maturity Wealth: ₹${results.maturityValue.toLocaleString('en-IN')}
----------------------------------------
Tax-free Lump Sum   : ₹${results.lumpSumValue.toLocaleString('en-IN')} (withdrawable)
Annuity Corpus      : ₹${results.annuityValue.toLocaleString('en-IN')} (for pension)
EST. MONTHLY PENSION: ₹${results.monthlyPension.toLocaleString('en-IN')}/month
----------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Panel */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">NPS Settings</h3>

        {/* Monthly Contribution */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Monthly Contribution (₹)
            </label>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Math.max(500, Number(e.target.value)))}
              className="w-28 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="500"
            max="150000"
            step="500"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>

        {/* Expected returns */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Expected Return Rate (% p.a.)
            </label>
            <input
              type="number"
              value={expectedReturns}
              onChange={(e) => setExpectedReturns(Math.max(5, Math.min(18, Number(e.target.value))))}
              className="w-16 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="5"
            max="15"
            step="0.5"
            value={expectedReturns}
            onChange={(e) => setExpectedReturns(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>

        {/* Current Age */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Current Age (Years)
            </label>
            <input
              type="number"
              value={currentAge}
              onChange={(e) => setCurrentAge(Math.max(18, Math.min(59, Number(e.target.value))))}
              className="w-16 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="18"
            max="59"
            step="1"
            value={currentAge}
            onChange={(e) => setCurrentAge(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Retirement is calculated at age 60 ({results.investmentYears} years of compounding).</span>
        </div>

        {/* Annuity Percentage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Wealth Allocated for Annuity (%)
            </label>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 font-mono">{annuityPercent}%</span>
          </div>
          <input
            type="range"
            min="40"
            max="100"
            step="5"
            value={annuityPercent}
            onChange={(e) => setAnnuityPercent(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
          <span className="text-[9px] text-slate-400 dark:text-slate-500">Min 40% allocation is mandatory to buy annuity in India.</span>
        </div>

        {/* Annuity Rate */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-350">
              Expected Annuity Rate (% p.a.)
            </label>
            <input
              type="number"
              value={annuityRate}
              onChange={(e) => setAnnuityRate(Math.max(3, Math.min(15, Number(e.target.value))))}
              className="w-16 px-2 py-1 text-right rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent font-bold text-teal-600 dark:text-teal-400 text-sm focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="3"
            max="10"
            step="0.5"
            value={annuityRate}
            onChange={(e) => setAnnuityRate(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Pension Estimations</span>
              <h3 className="text-xl font-bold text-slate-200 mt-1">Retirement Corpus Split</h3>
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
              <span className="text-xs text-slate-400 font-medium">Total Invested</span>
              <div className="text-lg font-bold text-white mt-1">₹{results.totalInvested.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Interest Earned</span>
              <div className="text-lg font-bold text-teal-400 mt-1">₹{results.interestEarned.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">Total Pension Wealth</span>
              <div className="text-lg font-bold text-indigo-400 mt-1">₹{results.maturityValue.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Lump Sum Withdrawal (Tax-free - {100 - annuityPercent}%)</span>
              <span className="font-bold text-white">₹{results.lumpSumValue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Annuity Reinvested (For Pension - {annuityPercent}%)</span>
              <span className="font-bold text-teal-400">₹{results.annuityValue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-5 rounded-2xl mt-8 flex justify-between items-center shadow-lg shadow-teal-500/10">
          <div>
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Estimated Monthly Pension</span>
            <div className="text-3xl font-black text-white mt-0.5">₹{results.monthlyPension.toLocaleString('en-IN')}/mo</div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

