import { useState, useMemo } from 'react';
import {
  Clock,
  ShieldCheck,
  Landmark,
  Copy,
  Check,
  IndianRupee,
  FileText,
  Download
} from 'lucide-react';

interface TatCategory {
  id: string;
  channel: string;
  scenario: string;
  tatSla: string;
  tatDays: number;
  compensationRule: string;
  fixedDailyComp: number;
}

const TAT_CATEGORIES: TatCategory[] = [
  {
    id: 'atm_cash',
    channel: 'ATM',
    scenario: 'Account debited but cash not dispensed or partially dispensed',
    tatSla: 'T + 5 calendar days',
    tatDays: 5,
    compensationRule: '₹100 per day of delay beyond T + 5 calendar days',
    fixedDailyComp: 100
  },
  {
    id: 'upi_p2p',
    channel: 'UPI (P2P / P2M)',
    scenario: 'Account debited but beneficiary account not credited, reversal pending',
    tatSla: 'T + 1 calendar day',
    tatDays: 1,
    compensationRule: '₹100 per day of delay beyond T + 1 day',
    fixedDailyComp: 100
  },
  {
    id: 'imps',
    channel: 'IMPS',
    scenario: 'Account debited but confirmation not received or credit failed',
    tatSla: 'T + 1 calendar day',
    tatDays: 1,
    compensationRule: '₹100 per day of delay beyond T + 1 day',
    fixedDailyComp: 100
  },
  {
    id: 'pos_ecom',
    channel: 'Card / POS / E-Commerce',
    scenario: 'Cardholder debited but merchant did not receive confirmation',
    tatSla: 'T + 5 calendar days',
    tatDays: 5,
    compensationRule: '₹100 per day of delay beyond T + 5 calendar days',
    fixedDailyComp: 100
  },
  {
    id: 'bbps',
    channel: 'BBPS Bill Payment',
    scenario: 'Account debited but biller did not receive credit / confirmation',
    tatSla: 'T + 1 calendar day',
    tatDays: 1,
    compensationRule: '₹100 per day of delay beyond T + 1 day',
    fixedDailyComp: 100
  },
  {
    id: 'ppi_wallet',
    channel: 'Prepaid Wallet (PPI)',
    scenario: 'Wallet debited but beneficiary wallet/merchant did not credit',
    tatSla: 'T + 1 calendar day',
    tatDays: 1,
    compensationRule: '₹100 per day of delay beyond T + 1 day',
    fixedDailyComp: 100
  },
  {
    id: 'card_to_card',
    channel: 'Card to Card Transfer',
    scenario: 'Account debited but beneficiary card not credited',
    tatSla: 'T + 1 calendar day',
    tatDays: 1,
    compensationRule: '₹100 per day of delay beyond T + 1 day',
    fixedDailyComp: 100
  },
  {
    id: 'nach_mandate',
    channel: 'NACH / ECS Debit',
    scenario: 'Unauthorized debit or delay in reversal after mandate cancellation',
    tatSla: 'T + 1 calendar day',
    tatDays: 1,
    compensationRule: '₹100 per day of delay beyond T + 1 day',
    fixedDailyComp: 100
  }
];

export default function TransactionReversalSLACalculator() {
  const [selectedCategory, setSelectedCategory] = useState<string>('upi_p2p');
  const [transactionDate, setTransactionDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [reversalDate, setReversalDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [transactionAmount, setTransactionAmount] = useState<number>(2500);
  const [bankName, setBankName] = useState<string>('State Bank of India');
  const [refNumber, setRefNumber] = useState<string>('UPI/429182910283');
  const [copied, setCopied] = useState(false);

  const activeCategory = useMemo(() => {
    return TAT_CATEGORIES.find(c => c.id === selectedCategory) || TAT_CATEGORIES[0];
  }, [selectedCategory]);

  const calculation = useMemo(() => {
    const tDate = new Date(transactionDate);
    const rDate = isResolved ? new Date(reversalDate) : new Date();

    // Statutory SLA Deadline Date = Transaction Date + SLA Days
    const deadlineDate = new Date(tDate);
    deadlineDate.setDate(deadlineDate.getDate() + activeCategory.tatDays);

    const diffTime = rDate.getTime() - deadlineDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const delayDays = Math.max(0, diffDays);

    const statutoryCompensation = delayDays * activeCategory.fixedDailyComp;
    const isOverdue = delayDays > 0;

    return {
      tDateString: tDate.toLocaleDateString('en-IN', { dateStyle: 'medium' }),
      deadLineString: deadlineDate.toLocaleDateString('en-IN', { dateStyle: 'medium' }),
      delayDays,
      statutoryCompensation,
      isOverdue
    };
  }, [transactionDate, reversalDate, isResolved, activeCategory]);

  const handleCopyGrievance = () => {
    const letter = `To,
The Principal Nodal Officer / Grievance Redressal Officer
${bankName}

Subject: Formal Claim for Statutory Delayed Compensation under RBI Circular DPSS.CO.PD No.629/02.01.014/2019-20

Dear Sir/Madam,

I am writing regarding a failed transaction on your banking rails:
- Transaction Channel: ${activeCategory.channel}
- Transaction Reference / RRN: ${refNumber}
- Transaction Date: ${calculation.tDateString}
- Transaction Amount: ₹${transactionAmount.toLocaleString('en-IN')}
- Nature of Issue: ${activeCategory.scenario}

Under the Reserve Bank of India Harmonisation of Turn Around Time (TAT) and customer compensation for failed transactions circular (DPSS.CO.PD No.629/02.01.014/2019-20):
1. The mandated TAT for resolution is ${activeCategory.tatSla} (Statutory Deadline: ${calculation.deadLineString}).
2. The transaction has incurred a statutory delay of ${calculation.delayDays} day(s).
3. Under RBI directions, compensation of ₹${activeCategory.fixedDailyComp} per day of delay must be credited proactively to my account without requiring a separate request.

Total Compensation Claimed: ₹${calculation.statutoryCompensation.toLocaleString('en-IN')} (calculated at ₹${activeCategory.fixedDailyComp}/day for ${calculation.delayDays} days delay) + Immediate Reversal of Principal Amount ₹${transactionAmount.toLocaleString('en-IN')}.

Kindly process the compensation to my linked account within 7 business days, failing which this matter will be escalated to the Reserve Bank of India Integrated Ombudsman under the Reserve Bank - Integrated Ombudsman Scheme, 2021.

Yours sincerely,
Account Holder`;

    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadGrievance = () => {
    const letter = `To,
The Principal Nodal Officer / Grievance Redressal Officer
${bankName}

Subject: Formal Claim for Statutory Delayed Compensation under RBI Circular DPSS.CO.PD No.629/02.01.014/2019-20

Dear Sir/Madam,

I am writing regarding a failed transaction on your banking rails:
- Transaction Channel: ${activeCategory.channel}
- Transaction Reference / RRN: ${refNumber}
- Transaction Date: ${calculation.tDateString}
- Transaction Amount: ₹${transactionAmount.toLocaleString('en-IN')}
- Nature of Issue: ${activeCategory.scenario}

Under the Reserve Bank of India Harmonisation of Turn Around Time (TAT) and customer compensation for failed transactions circular (DPSS.CO.PD No.629/02.01.014/2019-20):
1. The mandated TAT for resolution is ${activeCategory.tatSla} (Statutory Deadline: ${calculation.deadLineString}).
2. The transaction has incurred a statutory delay of ${calculation.delayDays} day(s).
3. Under RBI directions, compensation of ₹${activeCategory.fixedDailyComp} per day of delay must be credited proactively to my account without requiring a separate request.

Total Compensation Claimed: ₹${calculation.statutoryCompensation.toLocaleString('en-IN')} (calculated at ₹${activeCategory.fixedDailyComp}/day for ${calculation.delayDays} days delay) + Immediate Reversal of Principal Amount ₹${transactionAmount.toLocaleString('en-IN')}.

Kindly process the compensation to my linked account within 7 business days, failing which this matter will be escalated to the Reserve Bank of India Integrated Ombudsman under the Reserve Bank - Integrated Ombudsman Scheme, 2021.

Yours sincerely,
Account Holder`;

    const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RBI_TAT_Grievance_${refNumber.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              RBI Transaction Reversal SLA & ₹100/Day Compensation Calculator
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Compute statutory turnaround deadlines and ₹100/day customer compensation under RBI Circular DPSS.CO.PD No.629.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>RBI Circular Mandated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Calculator Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-6 rounded-xl space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Failed Transaction Details
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Payment Rail / Modality
              </label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
              >
                {TAT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.channel} — {c.tatSla} (Auto-Comp: ₹{c.fixedDailyComp}/day)
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Scenario: {activeCategory.scenario}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Bank / Issuer Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Reference / RRN Number
                </label>
                <input
                  type="text"
                  value={refNumber}
                  onChange={e => setRefNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Transaction Amount (₹)
                </label>
                <input
                  type="number"
                  value={transactionAmount}
                  onChange={e => setTransactionAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Transaction Date (T)
                </label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={e => setTransactionDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isResolved}
                  onChange={e => setIsResolved(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Transaction has already been reversed / credited (Specify Reversal Date)
                </span>
              </label>

              {isResolved && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Actual Reversal Date
                  </label>
                  <input
                    type="date"
                    value={reversalDate}
                    onChange={e => setReversalDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Statutory Reference Table */}
          <div className="saas-card p-5 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-emerald-600" />
              RBI TAT Harmonisation Framework (Circular 2019)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Under RBI directions, the customer compensation must be paid automatically by the bank without requiring the customer to lodge a grievance. The amount is credited directly to the account of the customer on the day of reversal.
            </p>
          </div>
        </div>

        {/* Right Column: Statutory Compensation & Grievance Exporter (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Compensation Metric Card */}
          <div
            className={`saas-card p-6 rounded-xl border ${
              calculation.isOverdue
                ? 'border-rose-500/30 bg-rose-500/5'
                : 'border-emerald-500/30 bg-emerald-500/5'
            } space-y-4`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Statutory Entitlement
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  calculation.isOverdue
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {calculation.isOverdue ? 'SLA BREACHED' : 'WITHIN STATUTORY SLA'}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Total Compensation Payable:</span>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1 mt-1">
                <IndianRupee className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                {calculation.statutoryCompensation.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Statutory TAT SLA:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeCategory.tatSla}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Resolution Deadline:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{calculation.deadLineString}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Delayed Days:</span>
                <span className={`font-bold ${calculation.delayDays > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                  {calculation.delayDays} day(s)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Daily Penalty Rate:</span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{activeCategory.fixedDailyComp} / day</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                <span>Total Recovery (Principal + Penalty):</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ₹{(transactionAmount + calculation.statutoryCompensation).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Grievance Draft Card */}
          <div className="saas-card p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Banking Ombudsman Notice
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyGrievance}
                  className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  title="Copy Notice"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleDownloadGrievance}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Download Notice"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Pre-drafted legal representation ready to be emailed to your bank’s Principal Nodal Officer and the RBI Ombudsman.
            </p>
            <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed">
{`To: Principal Nodal Officer, ${bankName}
Subject: Claim for Compensation under RBI Circular DPSS.CO.PD No.629/02.01.014/2019-20

Transaction: ${refNumber}
Channel: ${activeCategory.channel}
Delay: ${calculation.delayDays} day(s) beyond SLA
Compensation Claimed: ₹${calculation.statutoryCompensation.toLocaleString('en-IN')}

Under RBI directives, failure to auto-credit ₹100/day compensation constitutes deficiency of service under Reserve Bank - Integrated Ombudsman Scheme, 2021.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
