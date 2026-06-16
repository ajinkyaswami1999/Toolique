import { useState, useEffect } from 'react';
import { Percent, Copy, Check, Info } from 'lucide-react';

type TransactionType = 'intra' | 'ut' | 'inter';

export default function GSTCalculator() {
  const [amount, setAmount] = useState<number>(10000);
  const [gstRate, setGstRate] = useState<number>(18);
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);
  const [calcType, setCalcType] = useState<'add' | 'remove'>('add');
  const [transactionType, setTransactionType] = useState<TransactionType>('intra');
  
  // Custom toggles to include/exclude specific components
  const [includeCGST, setIncludeCGST] = useState<boolean>(true);
  const [includeSGST, setIncludeSGST] = useState<boolean>(true);
  const [includeUTGST, setIncludeUTGST] = useState<boolean>(true);
  const [includeIGST, setIncludeIGST] = useState<boolean>(true);
  
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    baseAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    utgstAmount: 0,
    igstAmount: 0,
    totalGst: 0,
    totalAmount: 0,
  });

  const slabs = [5, 12, 18, 28];

  useEffect(() => {
    // Determine active rates based on transaction type and toggles
    let cgstRate = 0;
    let sgstRate = 0;
    let utgstRate = 0;
    let igstRate = 0;

    if (transactionType === 'intra') {
      if (includeCGST) cgstRate = gstRate / 2;
      if (includeSGST) sgstRate = gstRate / 2;
    } else if (transactionType === 'ut') {
      if (includeCGST) cgstRate = gstRate / 2;
      if (includeUTGST) utgstRate = gstRate / 2;
    } else {
      if (includeIGST) igstRate = gstRate;
    }

    const totalEffectiveRate = cgstRate + sgstRate + utgstRate + igstRate;

    let base = 0;
    let cgst = 0;
    let sgst = 0;
    let utgst = 0;
    let igst = 0;
    let total = 0;

    if (calcType === 'add') {
      base = amount;
      cgst = (base * cgstRate) / 100;
      sgst = (base * sgstRate) / 100;
      utgst = (base * utgstRate) / 100;
      igst = (base * igstRate) / 100;
      total = base + cgst + sgst + utgst + igst;
    } else {
      total = amount;
      base = (amount * 100) / (100 + totalEffectiveRate);
      cgst = (base * cgstRate) / 100;
      sgst = (base * sgstRate) / 100;
      utgst = (base * utgstRate) / 100;
      igst = (base * igstRate) / 100;
    }

    const totalGst = cgst + sgst + utgst + igst;

    setResults({
      baseAmount: Number(base.toFixed(2)),
      cgstAmount: Number(cgst.toFixed(2)),
      sgstAmount: Number(sgst.toFixed(2)),
      utgstAmount: Number(utgst.toFixed(2)),
      igstAmount: Number(igst.toFixed(2)),
      totalGst: Number(totalGst.toFixed(2)),
      totalAmount: Number(total.toFixed(2)),
    });
  }, [amount, gstRate, calcType, transactionType, includeCGST, includeSGST, includeUTGST, includeIGST]);

  const copyResults = () => {
    const typeLabel = 
      transactionType === 'intra' ? 'Intra-State (CGST + SGST)' : 
      transactionType === 'ut' ? 'Union Territory (CGST + UTGST)' : 'Inter-State (IGST)';

    const text = `GST Calculation Report (Toolique)
----------------------------------------
Calculation Type : GST ${calcType === 'add' ? 'Added' : 'Removed'}
Initial Amount   : ₹${amount.toLocaleString('en-IN')}
GST Rate (Total) : ${gstRate}%
Transaction Type : ${typeLabel}
----------------------------------------
Base Amount      : ₹${results.baseAmount.toLocaleString('en-IN')}
CGST (Central)   : ₹${results.cgstAmount.toLocaleString('en-IN')}
SGST (State)     : ₹${results.sgstAmount.toLocaleString('en-IN')}
UTGST (Union T.) : ₹${results.utgstAmount.toLocaleString('en-IN')}
IGST (Integrated): ₹${results.igstAmount.toLocaleString('en-IN')}
----------------------------------------
Total GST Tax    : ₹${results.totalGst.toLocaleString('en-IN')}
Total Amount     : ₹${results.totalAmount.toLocaleString('en-IN')}
----------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs Section */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Calculator Controls</h3>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
              Initial Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
                placeholder="Enter amount"
              />
            </div>
          </div>

          {/* Calculation Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
              Calculation Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCalcType('add')}
                className={`py-2.5 rounded-xl border font-bold text-xs transition ${
                  calcType === 'add'
                    ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Add GST (+)
              </button>
              <button
                onClick={() => setCalcType('remove')}
                className={`py-2.5 rounded-xl border font-bold text-xs transition ${
                  calcType === 'remove'
                    ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Remove GST (-)
              </button>
            </div>
          </div>

          {/* Transaction Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
              Transaction Destination / Type
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as TransactionType)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-semibold text-xs"
            >
              <option value="intra" className="dark:bg-slate-950">Intra-State (Within same State)</option>
              <option value="ut" className="dark:bg-slate-950">Union Territory (Within UT)</option>
              <option value="inter" className="dark:bg-slate-950">Inter-State (Between different States)</option>
            </select>
          </div>

          {/* Include/Exclude Component Checkboxes */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
              Select GST Components to Include
            </label>
            <div className="space-y-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
              {transactionType === 'intra' && (
                <>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCGST}
                      onChange={(e) => setIncludeCGST(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Central GST (CGST) - Applies Central portion ({(gstRate / 2)}%)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSGST}
                      onChange={(e) => setIncludeSGST(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>State GST (SGST) - Applies State portion ({(gstRate / 2)}%)</span>
                  </label>
                </>
              )}

              {transactionType === 'ut' && (
                <>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCGST}
                      onChange={(e) => setIncludeCGST(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Central GST (CGST) - Applies Central portion ({(gstRate / 2)}%)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeUTGST}
                      onChange={(e) => setIncludeUTGST(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Union Territory GST (UTGST) - Applies UT portion ({(gstRate / 2)}%)</span>
                  </label>
                </>
              )}

              {transactionType === 'inter' && (
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeIGST}
                    onChange={(e) => setIncludeIGST(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Integrated GST (IGST) - Applies full Inter-state portion ({gstRate}%)</span>
                </label>
              )}
            </div>
          </div>

          {/* GST Slabs */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
              GST Slab Rate (%)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {slabs.map((slab) => (
                <button
                  key={slab}
                  onClick={() => {
                    setGstRate(slab);
                    setIsCustomRate(false);
                  }}
                  className={`py-2 rounded-lg border text-xs font-bold transition ${
                    gstRate === slab && !isCustomRate
                      ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {slab}%
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsCustomRate(true)}
              className={`w-full py-2.5 rounded-lg border text-xs font-bold transition mb-3 ${
                isCustomRate
                  ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Custom GST Rate
            </button>

            {isCustomRate && (
              <div className="relative mt-2">
                <input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
                  placeholder="Enter custom rate"
                  min="0"
                  max="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold">%</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">GST Component Details</span>
                <h3 className="text-xl font-bold text-slate-200 mt-1">Split Breakdown</h3>
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
                <span className="text-xs text-slate-400 font-medium">Base Amount (Excl. Tax)</span>
                <div className="text-2xl font-black text-white mt-1">₹{results.baseAmount.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/40">
                <span className="text-xs text-slate-400 font-medium">Total GST Tax ({gstRate}%)</span>
                <div className="text-2xl font-black text-teal-400 mt-1">₹{results.totalGst.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {transactionType === 'intra' && (
                <>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
                    <span className="text-slate-400 font-semibold">CGST (Central GST - {(gstRate / 2)}%)</span>
                    <span className="font-bold">{includeCGST ? `₹${results.cgstAmount.toLocaleString('en-IN')}` : 'Excluded (₹0)'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
                    <span className="text-slate-400 font-semibold">SGST (State GST - {(gstRate / 2)}%)</span>
                    <span className="font-bold">{includeSGST ? `₹${results.sgstAmount.toLocaleString('en-IN')}` : 'Excluded (₹0)'}</span>
                  </div>
                </>
              )}

              {transactionType === 'ut' && (
                <>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
                    <span className="text-slate-400 font-semibold">CGST (Central GST - {(gstRate / 2)}%)</span>
                    <span className="font-bold">{includeCGST ? `₹${results.cgstAmount.toLocaleString('en-IN')}` : 'Excluded (₹0)'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
                    <span className="text-slate-400 font-semibold">UTGST (Union Territory GST - {(gstRate / 2)}%)</span>
                    <span className="font-bold">{includeUTGST ? `₹${results.utgstAmount.toLocaleString('en-IN')}` : 'Excluded (₹0)'}</span>
                  </div>
                </>
              )}

              {transactionType === 'inter' && (
                <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800/40">
                  <span className="text-slate-400 font-semibold">IGST (Integrated GST - {gstRate}%)</span>
                  <span className="font-bold">{includeIGST ? `₹${results.igstAmount.toLocaleString('en-IN')}` : 'Excluded (₹0)'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-5 rounded-2xl mt-8 flex justify-between items-center shadow-lg shadow-teal-500/10">
            <div>
              <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Final Value (Incl. Active Taxes)</span>
              <div className="text-3xl font-black text-white mt-0.5">₹{results.totalAmount.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 bg-white/10 rounded-xl">
              <Percent className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Educational GST Guide Explainer */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
          <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Understanding CGST, SGST, IGST, and UTGST
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">1. CGST (Central Goods & Services Tax)</h4>
              <p className="mt-1">
                Levied by the Central Government of India on intra-state supplies (within the same state). It is paired together with SGST or UTGST.
                <br />
                <span className="font-semibold text-slate-500 dark:text-slate-450">Applicability:</span> Intra-state transactions. Split is always 50% of the total GST rate.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">2. SGST (State Goods & Services Tax)</h4>
              <p className="mt-1">
                Levied by the State Government on transactions occurring within state boundaries.
                <br />
                <span className="font-semibold text-slate-500 dark:text-slate-450">Applicability:</span> Intra-state transactions (e.g. trading within Maharashtra). Split is 50% of the total GST rate.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">3. UTGST (Union Territory Goods & Services Tax)</h4>
              <p className="mt-1">
                Levied on transactions inside Union Territories that do not have their own state legislatures (e.g. Lakshadweep, Ladakh, Andaman & Nicobar). It replaces SGST.
                <br />
                <span className="font-semibold text-slate-500 dark:text-slate-450">Applicability:</span> Intra-UT transactions. Split is 50% of the total GST rate (along with 50% CGST).
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white">4. IGST (Integrated Goods & Services Tax)</h4>
              <p className="mt-1">
                Levied on all inter-state transactions (supplies moving from one state/UT to another), exports, and imports. Collected by the Central government and distributed to destination states.
                <br />
                <span className="font-semibold text-slate-500 dark:text-slate-450">Applicability:</span> Inter-state transactions (e.g. shipping from Karnataka to Delhi). Consumes 100% of the total GST rate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

