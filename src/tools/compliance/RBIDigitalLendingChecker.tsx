import { useState, useMemo } from 'react';
import {
  Landmark,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Coins,
  Percent
} from 'lucide-react';

interface AuditCheck {
  id: string;
  category: string;
  title: string;
  norm: string;
  circularRef: string;
}

const RBI_DLG_CHECKS: AuditCheck[] = [
  {
    id: 'fund_flow',
    category: 'Fund Flow Architecture',
    title: 'Direct Account-to-Account Disbursal & Repayment',
    norm: 'All loan disbursals and repayments MUST execute directly between the bank account of the Regulated Entity (RE) and the borrower, without any pass-through or pool account of the Lending Service Provider (LSP).',
    circularRef: 'RBI/2022-23/111 Para 3'
  },
  {
    id: 'fee_ban',
    category: 'Fee Transparency',
    title: 'Zero Direct Borrower Fees by LSP',
    norm: 'No fees or charges can be directly levied by the Lending Service Provider (Fintech) on the borrower. Any fee payable to the LSP must be paid directly by the Regulated Entity.',
    circularRef: 'RBI/2022-23/111 Para 4'
  },
  {
    id: 'kfs',
    category: 'Key Fact Statement',
    title: 'Standardized KFS with APR Disclosure',
    norm: 'A standardized Key Fact Statement (KFS) containing the true Annual Percentage Rate (APR), recovery agent details, and cooling-off period must be provided to borrower prior to loan execution.',
    circularRef: 'RBI/2023-24/112 KFS Norms'
  },
  {
    id: 'cooling_off',
    category: 'Consumer Protection',
    title: 'Look-up / Cooling-off Period',
    norm: 'A mandatory cooling-off period (minimum 3 days for loans ≥ 7 days tenor, 1 day for < 7 days) allowing borrower to exit the digital loan without prepayment penalty upon returning principal and proportionate APR.',
    circularRef: 'RBI/2022-23/111 Para 6'
  },
  {
    id: 'privacy',
    category: 'Data & Privacy',
    title: 'Prohibition on Accessing Mobile Contacts / Media',
    norm: 'Digital lending apps cannot access mobile phone resources such as contact lists, call logs, photos, media files, or biometric data. One-time access to camera/microphone is permitted solely for onboarding KYC (V-CIP).',
    circularRef: 'RBI/2022-23/111 Para 11'
  },
  {
    id: 'fldg_cap',
    category: 'Credit Risk Sharing',
    title: 'FLDG Capped at 5% of Loan Portfolio',
    norm: 'Default Loss Guarantee (FLDG) arrangements between RE and LSP cannot exceed 5% of the total underlying loan portfolio under the structured guarantee framework.',
    circularRef: 'DOR.CRE.REC.47/21.04.048/2023-24'
  }
];

export default function RBIDigitalLendingChecker() {
  // Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    fund_flow: true,
    fee_ban: true,
    kfs: true,
    cooling_off: true,
    privacy: false,
    fldg_cap: true
  });

  // FLDG Calculator State
  const [totalPortfolioLakhs, setTotalPortfolioLakhs] = useState<number>(500); // 500 Lakhs = 5 Cr
  const [agreedFldgLakhs, setAgreedFldgLakhs] = useState<number>(20); // 20 Lakhs
  const [fldgCollateralType, setFldgCollateralType] = useState<'cash' | 'fd' | 'bg'>('fd');

  // KFS APR Calculator State
  const [loanPrincipal, setLoanPrincipal] = useState<number>(50000);
  const [tenorMonths, setTenorMonths] = useState<number>(12);
  const [nominalAnnualRate, setNominalAnnualRate] = useState<number>(16); // 16%
  const [processingFee, setProcessingFee] = useState<number>(1500);
  const [insuranceFee, setInsuranceFee] = useState<number>(500);

  // FLDG Calculations
  const fldgMetrics = useMemo(() => {
    const maxPermissibleLakhs = totalPortfolioLakhs * 0.05; // 5%
    const currentFldgPercent = (agreedFldgLakhs / totalPortfolioLakhs) * 100;
    const isCompliant = agreedFldgLakhs <= maxPermissibleLakhs;
    const excessLakhs = Math.max(0, agreedFldgLakhs - maxPermissibleLakhs);

    return {
      maxPermissibleLakhs,
      currentFldgPercent: currentFldgPercent.toFixed(2),
      isCompliant,
      excessLakhs
    };
  }, [totalPortfolioLakhs, agreedFldgLakhs]);

  // APR Calculations (RBI Method)
  const aprMetrics = useMemo(() => {
    const P = loanPrincipal;
    const r = nominalAnnualRate / 12 / 100;
    const n = tenorMonths;

    // Monthly EMI formula
    let emi = 0;
    if (r > 0) {
      emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      emi = P / n;
    }

    const totalInterest = emi * n - P;
    const gstOnFees = (processingFee + insuranceFee) * 0.18; // 18% GST
    const totalUpfrontDeductions = processingFee + insuranceFee + gstOnFees;
    const netDisbursed = P - totalUpfrontDeductions;
    const totalCostOfBorrowing = totalInterest + totalUpfrontDeductions;

    // Approximate APR (All inclusive annualized percentage rate)
    const annualFinanceCost = (totalCostOfBorrowing / (netDisbursed || 1)) * (12 / (n || 1)) * 100;

    return {
      monthlyEmi: Math.round(emi),
      netDisbursed: Math.round(netDisbursed),
      totalUpfrontDeductions: Math.round(totalUpfrontDeductions),
      totalInterest: Math.round(totalInterest),
      trueApr: annualFinanceCost.toFixed(2)
    };
  }, [loanPrincipal, tenorMonths, nominalAnnualRate, processingFee, insuranceFee]);

  // Overall Compliance Score
  const complianceScore = useMemo(() => {
    const total = RBI_DLG_CHECKS.length;
    const passed = Object.values(checklist).filter(Boolean).length;
    return Math.round((passed / total) * 100);
  }, [checklist]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 text-left">
      {/* Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="saas-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
              RBI DLG Compliance Score
            </span>
            <Landmark className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-zinc-900 dark:text-white font-mono">
              {complianceScore}%
            </span>
            <span className="text-xs text-zinc-500 font-bold">
              ({Object.values(checklist).filter(Boolean).length} / {RBI_DLG_CHECKS.length} Norms Met)
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                complianceScore >= 80 ? 'bg-emerald-500' : complianceScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${complianceScore}%` }}
            />
          </div>
        </div>

        <div className="saas-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
              FLDG Portfolio Cap Status
            </span>
            <Coins className="w-4 h-4 text-indigo-500" />
          </div>
          <div className={`text-2xl font-black font-mono ${fldgMetrics.isCompliant ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {fldgMetrics.currentFldgPercent}%
            <span className="text-xs font-bold text-zinc-400 ml-1.5">(Cap: 5.00%)</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {fldgMetrics.isCompliant
              ? `Compliant with RBI Circular DOR.CRE.REC.47. Permitted up to ₹${fldgMetrics.maxPermissibleLakhs} Lakhs.`
              : `BREACH: Guaranteed amount exceeds 5% statutory ceiling by ₹${fldgMetrics.excessLakhs.toFixed(2)} Lakhs.`}
          </p>
        </div>

        <div className="saas-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
              KFS True APR vs Nominal
            </span>
            <Percent className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
            {aprMetrics.trueApr}%
            <span className="text-xs font-bold text-zinc-400 ml-1.5">(Nominal: {nominalAnnualRate}%)</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            All-inclusive borrowing rate including ₹{aprMetrics.totalUpfrontDeductions} upfront processing &amp; GST charges.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: RBI Statutory Checks (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>RBI Digital Lending Guidelines (DLG) Audit</span>
              </h2>
              <span className="text-[10px] font-mono text-zinc-400">Master Direction 2022/23</span>
            </div>

            <div className="space-y-4">
              {RBI_DLG_CHECKS.map((check) => {
                const isPassed = checklist[check.id];
                return (
                  <div
                    key={check.id}
                    onClick={() => toggleCheck(check.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      isPassed
                        ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40'
                        : 'bg-rose-50/40 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                            {check.title}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {check.circularRef}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {check.norm}
                        </p>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        {isPassed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Passed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-xs">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Deficient</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: FLDG 5% Calculator & KFS APR Tool (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* FLDG 5% Cap Calculator */}
          <div className="saas-card p-6 space-y-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <Coins className="w-4 h-4 text-indigo-500" />
              <span>FLDG 5% Portfolio Guarantee Calculator</span>
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Total Loan Portfolio Volume (₹ Lakhs)
                </label>
                <input
                  type="number"
                  value={totalPortfolioLakhs}
                  onChange={(e) => setTotalPortfolioLakhs(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Agreed FLDG Default Guarantee by LSP (₹ Lakhs)
                </label>
                <input
                  type="number"
                  value={agreedFldgLakhs}
                  onChange={(e) => setAgreedFldgLakhs(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Form of FLDG Security Deposit
                </label>
                <select
                  value={fldgCollateralType}
                  onChange={(e) => setFldgCollateralType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="fd">Fixed Deposit with Lien marked to RE (Permitted)</option>
                  <option value="cash">Cash Deposited with Regulated Entity (Permitted)</option>
                  <option value="bg">Bank Guarantee in favour of RE (Permitted)</option>
                </select>
              </div>

              <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                fldgMetrics.isCompliant
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
              }`}>
                <div className="flex justify-between font-bold">
                  <span>Permissible 5% Ceiling:</span>
                  <span className="font-mono">₹{fldgMetrics.maxPermissibleLakhs} Lakhs</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Current Guarantee Ratio:</span>
                  <span className="font-mono">{fldgMetrics.currentFldgPercent}%</span>
                </div>
                {!fldgMetrics.isCompliant && (
                  <p className="text-[11px] pt-1 border-t border-rose-200 dark:border-rose-900/60 leading-relaxed font-bold">
                    Violation of Section 5(a) of RBI FLDG Directions: Contracts promising &gt; 5% guarantee are nullified and invite regulatory action on the RE.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Key Fact Statement (KFS) APR Calculator */}
          <div className="saas-card p-6 space-y-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <Percent className="w-4 h-4 text-emerald-500" />
              <span>Key Fact Statement (KFS) APR Calculator</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500">Loan Amount (₹)</label>
                <input
                  type="number"
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(Math.max(1000, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500">Tenor (Months)</label>
                <input
                  type="number"
                  value={tenorMonths}
                  onChange={(e) => setTenorMonths(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500">Nominal Rate (%)</label>
                <input
                  type="number"
                  value={nominalAnnualRate}
                  onChange={(e) => setNominalAnnualRate(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500">Processing Fee (₹)</label>
                <input
                  type="number"
                  value={processingFee}
                  onChange={(e) => setProcessingFee(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500">Insurance / Verification (₹)</label>
                <input
                  type="number"
                  value={insuranceFee}
                  onChange={(e) => setInsuranceFee(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">Monthly EMI:</span>
                <span className="font-bold text-zinc-900 dark:text-white">₹{aprMetrics.monthlyEmi.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">Net Disbursed:</span>
                <span className="font-bold text-zinc-900 dark:text-white">₹{aprMetrics.netDisbursed.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="font-sans">Mandatory KFS APR:</span>
                <span className="text-sm">{aprMetrics.trueApr}% p.a.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
