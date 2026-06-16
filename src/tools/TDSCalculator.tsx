import { useState, useEffect } from 'react';
import { Calculator, Copy, Check, AlertTriangle } from 'lucide-react';

interface SectionDetail {
  code: string;
  name: string;
  rates: {
    individual: number;
    company: number;
  };
  threshold: number;
  description: string;
}

export default function TDSCalculator() {
  const [grossAmount, setGrossAmount] = useState<number>(100000);
  const [section, setSection] = useState<string>('194J-Prof');
  const [payeeType, setPayeeType] = useState<'individual' | 'company'>('individual');
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    tdsRate: 0,
    tdsAmount: 0,
    netPayable: 0,
    isBelowThreshold: false,
  });

  const sections: Record<string, SectionDetail> = {
    '194C': {
      code: '194C',
      name: 'Contractors / Sub-Contractors',
      rates: { individual: 1, company: 2 },
      threshold: 30000, // single invoice threshold, or 100k annual
      description: 'Payments to contractors for work, advertising, broadcasting, carriage of goods, catering, etc.',
    },
    '194J-Prof': {
      code: '194J',
      name: 'Professional Fees / Royalty',
      rates: { individual: 10, company: 10 },
      threshold: 30000,
      description: 'Fees for professional services, royalty, non-compete fees, director compensation.',
    },
    '194J-Tech': {
      code: '194J',
      name: 'Technical Services / Call Centre',
      rates: { individual: 2, company: 2 },
      threshold: 30000,
      description: 'Fees for technical services, call centre operations, royalty (in some categories).',
    },
    '194I-Rent': {
      code: '194I',
      name: 'Rent on Land & Building',
      rates: { individual: 10, company: 10 },
      threshold: 240000,
      description: 'Rent paid for use of land, building (including factory), or furniture/fittings.',
    },
    '194I-Mach': {
      code: '194I',
      name: 'Rent on Plant & Machinery',
      rates: { individual: 2, company: 2 },
      threshold: 240000,
      description: 'Rent paid for use of plant, machinery, or equipment.',
    },
    '194H': {
      code: '194H',
      name: 'Commission or Brokerage',
      rates: { individual: 5, company: 5 },
      threshold: 15000,
      description: 'Payments for commission or brokerage on products/services (excluding insurance).',
    }
  };

  useEffect(() => {
    const selectedSec = sections[section];
    if (!selectedSec) return;

    const rate = payeeType === 'individual' ? selectedSec.rates.individual : selectedSec.rates.company;
    const isBelow = grossAmount < selectedSec.threshold;

    // Technically in India, if below threshold, TDS is 0
    const tdsAmount = isBelow ? 0 : (grossAmount * rate) / 100;
    const netPayable = grossAmount - tdsAmount;

    setResults({
      tdsRate: rate,
      tdsAmount: Number(tdsAmount.toFixed(2)),
      netPayable: Number(netPayable.toFixed(2)),
      isBelowThreshold: isBelow,
    });
  }, [grossAmount, section, payeeType]);

  const copyResults = () => {
    const selectedSec = sections[section];
    const text = `TDS Calculation Report (Toolique)
----------------------------------------
Selected Section : Sec ${selectedSec.code} - ${selectedSec.name}
Payee Category   : ${payeeType === 'individual' ? 'Individual / HUF' : 'Company / Partnership Firm'}
Gross Amount     : ₹${grossAmount.toLocaleString('en-IN')}
----------------------------------------
TDS Rate Applied : ${results.tdsRate}% ${results.isBelowThreshold ? '(Threshold not met)' : ''}
Calculated TDS   : ₹${results.tdsAmount.toLocaleString('en-IN')}
Net Payable      : ₹${results.netPayable.toLocaleString('en-IN')}
----------------------------------------`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Section */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Deduction Details</h3>

        {/* Gross Invoice Amount */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Gross Invoice Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">₹</span>
            <input
              type="number"
              value={grossAmount}
              onChange={(e) => setGrossAmount(Math.max(0, Number(e.target.value)))}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
              placeholder="Enter gross invoice value"
            />
          </div>
        </div>

        {/* Section Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Section Category
          </label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium text-sm"
          >
            {Object.entries(sections).map(([key, value]) => (
              <option key={key} value={key} className="dark:bg-slate-950 dark:text-white text-slate-800">
                Sec {value.code} - {value.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1.5 leading-normal italic">
            {sections[section]?.description}
          </p>
        </div>

        {/* Payee Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Payee Category
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPayeeType('individual')}
              className={`py-2.5 rounded-xl border font-bold text-xs transition ${
                payeeType === 'individual'
                  ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Individual / HUF
            </button>
            <button
              onClick={() => setPayeeType('company')}
              className={`py-2.5 rounded-xl border font-bold text-xs transition ${
                payeeType === 'company'
                  ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Company / Firm / Others
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">TDS Liability</span>
              <h3 className="text-xl font-bold text-slate-200 mt-1">Tax Deducted Details</h3>
            </div>
            <button
              onClick={copyResults}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">TDS Percentage</span>
              <div className="text-2xl font-black text-white mt-1">{results.tdsRate}%</div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
              <span className="text-xs text-slate-400 font-medium">TDS Amount Deducted</span>
              <div className="text-2xl font-black text-teal-400 mt-1">₹{results.tdsAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Threshold alert */}
          {results.isBelowThreshold && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-start gap-2.5 text-xs font-semibold leading-normal">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <div className="font-bold text-amber-500 uppercase tracking-wide">Below Mandatory Threshold</div>
                <div className="mt-0.5">
                  The invoice value ₹{grossAmount.toLocaleString('en-IN')} is below the mandatory TDS threshold (Sec {sections[section]?.code} limit: ₹{sections[section]?.threshold.toLocaleString('en-IN')}). TDS is not required to be deducted under tax laws unless cumulative annual payments exceed thresholds.
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">Gross Invoice Amount</span>
              <span className="font-bold">₹{grossAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
              <span className="text-slate-400 font-semibold">TDS Deducted</span>
              <span className="font-bold text-teal-500">- ₹{results.tdsAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-5 rounded-2xl mt-8 flex justify-between items-center shadow-lg shadow-teal-500/10">
          <div>
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Net Amount Payable (To Party)</span>
            <div className="text-3xl font-black text-white mt-0.5">₹{results.netPayable.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <Calculator className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

