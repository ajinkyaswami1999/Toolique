import { useState, useMemo } from 'react';
import {
  Landmark,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Calculator,
  FileText,
  Copy,
  Check,
  HelpCircle,
  Percent,
  Download
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: 'Digital Lending' | 'FLDG Structure' | 'KFS & Transparency' | 'Data Privacy' | 'Grievance & Recovery' | 'IT & Cyber Governance';
  title: string;
  requirement: string;
  statutoryRef: string;
  severity: 'Critical' | 'High' | 'Medium';
}

const RBI_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'dlg_1',
    category: 'Digital Lending',
    title: 'Direct Account-to-Account Disbursement',
    requirement: 'All loan disbursements and repayments must execute strictly between the bank account of the Regulated Entity (RE) and borrower, without pass-through via any pool account of Lending Service Providers (LSPs).',
    statutoryRef: 'RBI DLG Para 3.1',
    severity: 'Critical'
  },
  {
    id: 'dlg_2',
    category: 'Digital Lending',
    title: 'Direct Fee Payment to LSPs by RE',
    requirement: 'Any fees, charges, or payable commissions to LSPs must be paid directly by the RE. No charges shall be directly deducted from the borrower by the LSP.',
    statutoryRef: 'RBI DLG Para 3.3',
    severity: 'High'
  },
  {
    id: 'fldg_1',
    category: 'FLDG Structure',
    title: 'Statutory 5% Ceiling on Default Loss Guarantee',
    requirement: 'The total amount of Default Loss Guarantee (DLG/FLDG) agreed upon by the RE with any LSP across an outstanding portfolio shall not exceed 5% of the total loan portfolio volume.',
    statutoryRef: 'RBI Circular DOR.CRE.REC.23/21.07.001/2023-24',
    severity: 'Critical'
  },
  {
    id: 'fldg_2',
    category: 'FLDG Structure',
    title: 'Recognized Forms of DLG Collateral',
    requirement: 'DLG cover is accepted exclusively in three permitted structures: (i) Cash deposit with RE, (ii) SCB Fixed Deposit with marked lien in favor of RE, or (iii) Bank Guarantee in favor of RE.',
    statutoryRef: 'RBI FLDG Directions Para 4',
    severity: 'Critical'
  },
  {
    id: 'kfs_1',
    category: 'KFS & Transparency',
    title: 'Standardized Key Fact Statement (KFS) Prior to Execution',
    requirement: 'Borrowers must receive a standardized Key Fact Statement (KFS) before loan execution, itemizing sanctioned amount, tenure, APR, fee breakdown, and schedule.',
    statutoryRef: 'RBI Master Direction KFS 2024',
    severity: 'Critical'
  },
  {
    id: 'kfs_2',
    category: 'KFS & Transparency',
    title: 'True Annual Percentage Rate (APR) Disclosure',
    requirement: 'APR must be computed using the internal rate of return (IRR) method, incorporating all upfront processing fees, verification expenses, and third-party charges into an annualized cost.',
    statutoryRef: 'RBI KFS Circular 2024 Para 5',
    severity: 'High'
  },
  {
    id: 'kfs_3',
    category: 'KFS & Transparency',
    title: 'Statutory Cooling-off / Look-up Period',
    requirement: 'Explicit look-up period during which borrowers can exit the digital loan by paying principal and proportionate APR without any prepayment penalty (min 3 days for >=7 days tenure).',
    statutoryRef: 'RBI DLG Para 4.1',
    severity: 'High'
  },
  {
    id: 'data_1',
    category: 'Data Privacy',
    title: 'Strict Prohibition on Device Storage Access',
    requirement: 'Digital Lending Apps (DLAs) must never access mobile device files, media, contact lists, call logs, or telephone status. One-time access to camera/mic is permitted solely for KYC.',
    statutoryRef: 'RBI DLG Para 6.1',
    severity: 'Critical'
  },
  {
    id: 'data_2',
    category: 'Data Privacy',
    title: 'Data Localization and In-Country Processing',
    requirement: 'All personal data, transactional data, and biometric verifications collected by DLAs and LSPs must be stored securely on servers located within India.',
    statutoryRef: 'RBI DLG Para 6.4',
    severity: 'Critical'
  },
  {
    id: 'data_3',
    category: 'Data Privacy',
    title: 'Clear Consent for Data Sharing and Revocation',
    requirement: 'Explicit, unbundled consent must be captured prior to sharing borrower data with any third party, along with a functional mechanism to revoke consent and delete stored records.',
    statutoryRef: 'RBI DLG Para 6.2',
    severity: 'High'
  },
  {
    id: 'grv_1',
    category: 'Grievance & Recovery',
    title: 'Nodal Grievance Redressal Officer (GRO) & CMS Integration',
    requirement: 'REs and LSPs must designate a dedicated GRO whose details are prominently visible on websites/apps, with escalation to the RBI Ombudsman if unresolved within 30 days.',
    statutoryRef: 'RBI DLG Para 7.1',
    severity: 'High'
  },
  {
    id: 'grv_2',
    category: 'Grievance & Recovery',
    title: 'Strict Recovery Agent Code of Conduct',
    requirement: 'Recovery agents must be certified, communicated to borrowers in advance, and may only contact between 08:00 and 19:00 hours. Threats, abusive language, or family intimidation is prohibited.',
    statutoryRef: 'RBI Fair Practices Code Para 2.4',
    severity: 'Critical'
  },
  {
    id: 'it_1',
    category: 'IT & Cyber Governance',
    title: 'Annual Information System & Cybersecurity Audit',
    requirement: 'REs and partnered LSPs must undergo annual technical audits by CERT-In empanelled auditors to verify adherence to RBI Cyber Security Framework.',
    statutoryRef: 'RBI Master Direction IT Governance 2023',
    severity: 'High'
  },
  {
    id: 'it_2',
    category: 'IT & Cyber Governance',
    title: 'Automated Credit Bureau Reporting',
    requirement: 'All digital lending transactions, drawdowns, and delinquencies must be reported to all four Credit Information Companies (CICs) without exception under the borrower’s name.',
    statutoryRef: 'RBI DLG Para 5.1',
    severity: 'Critical'
  }
];

export default function RBIComplianceChecklist() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'fldg' | 'kfs' | 'report'>('checklist');
  const [checklistStatus, setChecklistStatus] = useState<Record<string, 'compliant' | 'non_compliant' | 'in_progress'>>(() => {
    const initial: Record<string, 'compliant' | 'non_compliant' | 'in_progress'> = {};
    RBI_CHECKLIST_ITEMS.forEach(item => {
      initial[item.id] = 'in_progress';
    });
    return initial;
  });

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  // FLDG Calculator State
  const [portfolioSize, setPortfolioSize] = useState<number>(50000000); // 5 Crore
  const [proposedFLDG, setProposedFLDG] = useState<number>(2500000); // 25 Lakhs
  const [fldgType, setFldgType] = useState<'cash' | 'fd_lien' | 'bank_guarantee' | 'corporate_guarantee'>('fd_lien');
  const [lspName, setLspName] = useState<string>('FinTech Partner Alpha');

  // KFS Calculator State
  const [loanAmount, setLoanAmount] = useState<number>(50000);
  const [loanTenureMonths, setLoanTenureMonths] = useState<number>(12);
  const [nominalInterestRate, setNominalInterestRate] = useState<number>(16); // % p.a.
  const [upfrontFees, setUpfrontFees] = useState<number>(1500); // Processing + Verification
  const [insuranceCharges, setInsuranceCharges] = useState<number>(450);

  // Checklist Calculations
  const stats = useMemo(() => {
    let compliantCount = 0;
    let nonCompliantCount = 0;
    let inProgressCount = 0;
    let criticalFailures = 0;

    RBI_CHECKLIST_ITEMS.forEach(item => {
      const status = checklistStatus[item.id];
      if (status === 'compliant') compliantCount++;
      else if (status === 'non_compliant') {
        nonCompliantCount++;
        if (item.severity === 'Critical') criticalFailures++;
      } else inProgressCount++;
    });

    const score = Math.round((compliantCount / RBI_CHECKLIST_ITEMS.length) * 100);
    return { compliantCount, nonCompliantCount, inProgressCount, criticalFailures, score };
  }, [checklistStatus]);

  // FLDG Calculation
  const fldgMetrics = useMemo(() => {
    const maxAllowedFLDG = portfolioSize * 0.05;
    const currentPercent = portfolioSize > 0 ? (proposedFLDG / portfolioSize) * 100 : 0;
    const isExceeded = proposedFLDG > maxAllowedFLDG;
    const isInvalidCollateral = fldgType === 'corporate_guarantee';

    return {
      maxAllowedFLDG,
      currentPercent: currentPercent.toFixed(2),
      isExceeded,
      isInvalidCollateral,
      excessAmount: Math.max(0, proposedFLDG - maxAllowedFLDG)
    };
  }, [portfolioSize, proposedFLDG, fldgType]);

  // KFS APR Calculation
  const aprMetrics = useMemo(() => {
    const totalDeductions = upfrontFees + insuranceCharges;
    const netDisbursed = Math.max(1, loanAmount - totalDeductions);
    const monthlyRate = nominalInterestRate / 12 / 100;
    const n = loanTenureMonths;
    const emi = monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
      : loanAmount / n;
    const totalRepayable = emi * n;
    const totalInterest = totalRepayable - loanAmount;
    const totalCostOfCredit = totalInterest + totalDeductions;
    const trueApr = ((totalCostOfCredit / netDisbursed) / (n / 12)) * 100;

    return {
      emi: Math.round(emi),
      netDisbursed,
      totalInterest: Math.round(totalInterest),
      totalRepayable: Math.round(totalRepayable),
      totalCostOfCredit: Math.round(totalCostOfCredit),
      trueApr: trueApr.toFixed(2)
    };
  }, [loanAmount, loanTenureMonths, nominalInterestRate, upfrontFees, insuranceCharges]);

  const filteredItems = useMemo(() => {
    if (categoryFilter === 'All') return RBI_CHECKLIST_ITEMS;
    return RBI_CHECKLIST_ITEMS.filter(i => i.category === categoryFilter);
  }, [categoryFilter]);

  const handleCopyReport = () => {
    const reportText = `=====================================================
RBI REGULATORY & DIGITAL LENDING AUDIT REPORT
Generated via Toolique Compliance Suite (Client-Side)
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Compliance Readiness: ${stats.score}% (${stats.compliantCount}/${RBI_CHECKLIST_ITEMS.length} Controls Met)
Critical Violations: ${stats.criticalFailures}
In-Progress Verification: ${stats.inProgressCount}

FLDG STRUCTURE AUDIT:
- Partner LSP: ${lspName}
- Total Portfolio: ₹${portfolioSize.toLocaleString('en-IN')}
- DLG Guarantee Amount: ₹${proposedFLDG.toLocaleString('en-IN')} (${fldgMetrics.currentPercent}%)
- Statutory 5% Ceiling: ₹${fldgMetrics.maxAllowedFLDG.toLocaleString('en-IN')}
- FLDG Statutory Status: ${fldgMetrics.isExceeded ? 'EXCEEDED STATUTORY CAP (VIOLATION)' : 'WITHIN 5% CAP (COMPLIANT)'}
- Collateral Structure: ${fldgType.replace('_', ' ').toUpperCase()} ${fldgMetrics.isInvalidCollateral ? '--> INVALID COLLATERAL (RBI BARRED)' : '--> COMPLIANT COLLATERAL'}

KEY FACT STATEMENT (KFS) METRICS:
- Sanctioned Principal: ₹${loanAmount.toLocaleString('en-IN')}
- Net Disbursed: ₹${aprMetrics.netDisbursed.toLocaleString('en-IN')}
- Nominal Interest Rate: ${nominalInterestRate}% p.a.
- Upfront Fees & Third-Party Charges: ₹${(upfrontFees + insuranceCharges).toLocaleString('en-IN')}
- Monthly EMI: ₹${aprMetrics.emi.toLocaleString('en-IN')}
- Statutory True APR: ${aprMetrics.trueApr}% p.a.

DETAILED STATUTORY FINDINGS:
${RBI_CHECKLIST_ITEMS.map(item => `[${checklistStatus[item.id].toUpperCase()}] ${item.title} (${item.statutoryRef}) - Severity: ${item.severity}`).join('\n')}
=====================================================`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReport = () => {
    const reportText = `=====================================================
RBI REGULATORY & DIGITAL LENDING AUDIT REPORT
Generated via Toolique Compliance Suite (Client-Side)
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Compliance Readiness: ${stats.score}% (${stats.compliantCount}/${RBI_CHECKLIST_ITEMS.length} Controls Met)
Critical Violations: ${stats.criticalFailures}
In-Progress Verification: ${stats.inProgressCount}

FLDG STRUCTURE AUDIT:
- Partner LSP: ${lspName}
- Total Portfolio: ₹${portfolioSize.toLocaleString('en-IN')}
- DLG Guarantee Amount: ₹${proposedFLDG.toLocaleString('en-IN')} (${fldgMetrics.currentPercent}%)
- Statutory 5% Ceiling: ₹${fldgMetrics.maxAllowedFLDG.toLocaleString('en-IN')}
- FLDG Statutory Status: ${fldgMetrics.isExceeded ? 'EXCEEDED STATUTORY CAP (VIOLATION)' : 'WITHIN 5% CAP (COMPLIANT)'}
- Collateral Structure: ${fldgType.replace('_', ' ').toUpperCase()} ${fldgMetrics.isInvalidCollateral ? '--> INVALID COLLATERAL (RBI BARRED)' : '--> COMPLIANT COLLATERAL'}

KEY FACT STATEMENT (KFS) METRICS:
- Sanctioned Principal: ₹${loanAmount.toLocaleString('en-IN')}
- Net Disbursed: ₹${aprMetrics.netDisbursed.toLocaleString('en-IN')}
- Nominal Interest Rate: ${nominalInterestRate}% p.a.
- Upfront Fees & Third-Party Charges: ₹${(upfrontFees + insuranceCharges).toLocaleString('en-IN')}
- Monthly EMI: ₹${aprMetrics.emi.toLocaleString('en-IN')}
- Statutory True APR: ${aprMetrics.trueApr}% p.a.

DETAILED STATUTORY FINDINGS:
${RBI_CHECKLIST_ITEMS.map(item => `[${checklistStatus[item.id].toUpperCase()}] ${item.title} (${item.statutoryRef}) - Severity: ${item.severity}`).join('\n')}
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RBI_Digital_Lending_Audit_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Privacy Guarantee */}
      <div className="saas-card bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              RBI Digital Lending Guidelines & FLDG Compliance Studio
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Audit NBFC & FinTech operations against RBI DLG circulars, test the statutory 5% FLDG ceiling, and verify True APR in KFS.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Client-Side Private</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'checklist'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          DLG Statutory Checklist
        </button>
        <button
          onClick={() => setActiveTab('fldg')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'fldg'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Percent className="w-4 h-4" />
          5% FLDG Portfolio Cap
        </button>
        <button
          onClick={() => setActiveTab('kfs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'kfs'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          KFS True APR Simulator
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'report'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Audit Executive Summary
        </button>
      </div>

      {/* TAB 1: CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Metrics Overview Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Compliance Score</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.score}%
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    stats.score >= 80 ? 'bg-emerald-500' : stats.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${stats.score}%` }}
                />
              </div>
            </div>

            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Compliant Controls</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" />
                {stats.compliantCount} / {RBI_CHECKLIST_ITEMS.length}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Verified In Place</span>
            </div>

            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Critical Gaps</span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5" />
                {stats.criticalFailures}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Immediate Regulatory Risk</span>
            </div>

            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Under Review</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
                <Clock className="w-5 h-5" />
                {stats.inProgressCount}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Pending Documentation</span>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Digital Lending', 'FLDG Structure', 'KFS & Transparency', 'Data Privacy', 'Grievance & Recovery', 'IT & Cyber Governance'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Checklist Cards */}
          <div className="space-y-3">
            {filteredItems.map(item => {
              const currentStatus = checklistStatus[item.id];
              return (
                <div
                  key={item.id}
                  className={`saas-card p-4 rounded-xl border transition-all ${
                    currentStatus === 'compliant'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : currentStatus === 'non_compliant'
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {item.statutoryRef}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            item.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {item.severity} Risk
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{item.category}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                        {item.requirement}
                      </p>
                    </div>

                    {/* Status Toggles */}
                    <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
                      <button
                        onClick={() => setChecklistStatus(prev => ({ ...prev, [item.id]: 'compliant' }))}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                          currentStatus === 'compliant'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Compliant
                      </button>
                      <button
                        onClick={() => setChecklistStatus(prev => ({ ...prev, [item.id]: 'in_progress' }))}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                          currentStatus === 'in_progress'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-100'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        In Review
                      </button>
                      <button
                        onClick={() => setChecklistStatus(prev => ({ ...prev, [item.id]: 'non_compliant' }))}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                          currentStatus === 'non_compliant'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-100'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Gap
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: FLDG CALCULATOR */}
      {activeTab === 'fldg' && (
        <div className="space-y-6">
          <div className="saas-card p-6 rounded-xl space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Default Loss Guarantee (FLDG) 5% Statutory Portfolio Cap
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Under RBI Circular DOR.CRE.REC.23/21.07.001/2023-24, total contractual FLDG cover on any portfolio must never exceed 5%.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Lending Service Provider (LSP / FinTech Name)
                  </label>
                  <input
                    type="text"
                    value={lspName}
                    onChange={e => setLspName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Total Outstanding Portfolio (₹)
                  </label>
                  <input
                    type="number"
                    value={portfolioSize}
                    onChange={e => setPortfolioSize(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    ₹{portfolioSize.toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Contracted / Proposed DLG Guarantee (₹)
                  </label>
                  <input
                    type="number"
                    value={proposedFLDG}
                    onChange={e => setProposedFLDG(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    ₹{proposedFLDG.toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    DLG Collateral Structure Form
                  </label>
                  <select
                    value={fldgType}
                    onChange={e => setFldgType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    <option value="fd_lien">Fixed Deposit with Lien marked to RE (Permitted)</option>
                    <option value="cash">Cash deposit with the RE (Permitted)</option>
                    <option value="bank_guarantee">Bank Guarantee favoring RE (Permitted)</option>
                    <option value="corporate_guarantee">Corporate Guarantee / Unbacked MoU (Strictly Barred)</option>
                  </select>
                </div>
              </div>

              {/* Analysis Card */}
              <div className="space-y-4">
                <div
                  className={`p-5 rounded-xl border ${
                    fldgMetrics.isExceeded || fldgMetrics.isInvalidCollateral
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-emerald-500/10 border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {fldgMetrics.isExceeded || fldgMetrics.isInvalidCollateral ? (
                      <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {fldgMetrics.isExceeded
                        ? 'VIOLATION: FLDG Exceeds Statutory 5% Limit'
                        : fldgMetrics.isInvalidCollateral
                        ? 'VIOLATION: Non-Permitted Collateral Structure'
                        : 'COMPLIANT: Within Statutory 5% Ceiling'}
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Current DLG Percentage:</span>
                      <span className={`font-bold ${fldgMetrics.isExceeded ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                        {fldgMetrics.currentPercent}%
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-600 dark:text-slate-400">Max Statutory 5% Ceiling:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ₹{fldgMetrics.maxAllowedFLDG.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {fldgMetrics.isExceeded && (
                      <div className="flex justify-between py-1 text-rose-600 dark:text-rose-400 font-bold">
                        <span>Excess Inadmissible Cover:</span>
                        <span>₹{fldgMetrics.excessAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600 dark:text-slate-400">Collateral Recognition:</span>
                      <span className={`font-semibold ${fldgMetrics.isInvalidCollateral ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {fldgMetrics.isInvalidCollateral ? 'Non-Permitted (Barred)' : 'Recognized by RBI'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="saas-card p-4 rounded-xl text-xs space-y-2 text-slate-600 dark:text-slate-400">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    Statutory Rule (RBI Circular 2023)
                  </div>
                  <p>
                    Regulated entities cannot enter into implicit or balance sheet guarantee agreements. All FLDG contracts must be explicitly declared, capped at 5%, supported by an auditor certificate, and monitored for credit provisioning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KFS APR SIMULATOR */}
      {activeTab === 'kfs' && (
        <div className="space-y-6">
          <div className="saas-card p-6 rounded-xl space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Key Fact Statement (KFS) True APR & All-Inclusive Cost Simulator
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                RBI’s 2024 Master Direction mandates computing the True Annual Percentage Rate (APR) based on net disbursed funds, factoring in all upfront processing, insurance, and third-party fees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Sanctioned Loan Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={e => setLoanAmount(Math.max(1000, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Tenure (Months)
                    </label>
                    <input
                      type="number"
                      value={loanTenureMonths}
                      onChange={e => setLoanTenureMonths(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Nominal Rate (% p.a.)
                    </label>
                    <input
                      type="number"
                      value={nominalInterestRate}
                      step="0.1"
                      onChange={e => setNominalInterestRate(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Upfront Processing & Legal (₹)
                    </label>
                    <input
                      type="number"
                      value={upfrontFees}
                      onChange={e => setUpfrontFees(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Insurance & Third-Party (₹)
                    </label>
                    <input
                      type="number"
                      value={insuranceCharges}
                      onChange={e => setInsuranceCharges(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* APR Output Card */}
              <div className="saas-card p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    KFS True APR
                  </span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                    Statutory IRR
                  </span>
                </div>

                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {aprMetrics.trueApr}% <span className="text-sm font-normal text-slate-500">p.a.</span>
                </div>
                <p className="text-xs text-slate-500">
                  Compared to nominal {nominalInterestRate}% p.a. (Spread: +{(Number(aprMetrics.trueApr) - nominalInterestRate).toFixed(2)}%)
                </p>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Sanctioned Principal:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{loanAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total Upfront Deductions:</span>
                    <span className="font-semibold text-rose-600">-₹{(upfrontFees + insuranceCharges).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Net Disbursed to Borrower:</span>
                    <span className="font-bold text-emerald-600">₹{aprMetrics.netDisbursed.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Monthly Equated Installment (EMI):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{aprMetrics.emi.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total Interest Repayable:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{aprMetrics.totalInterest.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span>Total Cost of Credit:</span>
                    <span>₹{aprMetrics.totalCostOfCredit.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT EXECUTIVE SUMMARY */}
      {activeTab === 'report' && (
        <div className="saas-card p-6 rounded-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                RBI Digital Lending & Regulatory Audit Workpaper
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Court and regulatory inspectable audit draft compiling DLG checklist status, 5% FLDG adherence, and KFS APR disclosures.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy Full Audit'}
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Report
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
{`=====================================================
RBI REGULATORY & DIGITAL LENDING AUDIT REPORT
Generated via Toolique Compliance Suite (Client-Side)
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Compliance Readiness: ${stats.score}% (${stats.compliantCount}/${RBI_CHECKLIST_ITEMS.length} Controls Met)
Critical Violations: ${stats.criticalFailures}
In-Progress Verification: ${stats.inProgressCount}

FLDG STRUCTURE AUDIT:
- Partner LSP: ${lspName}
- Total Portfolio: ₹${portfolioSize.toLocaleString('en-IN')}
- DLG Guarantee Amount: ₹${proposedFLDG.toLocaleString('en-IN')} (${fldgMetrics.currentPercent}%)
- Statutory 5% Ceiling: ₹${fldgMetrics.maxAllowedFLDG.toLocaleString('en-IN')}
- FLDG Statutory Status: ${fldgMetrics.isExceeded ? 'EXCEEDED STATUTORY CAP (VIOLATION)' : 'WITHIN 5% CAP (COMPLIANT)'}
- Collateral Structure: ${fldgType.replace('_', ' ').toUpperCase()} ${fldgMetrics.isInvalidCollateral ? '--> INVALID COLLATERAL (RBI BARRED)' : '--> COMPLIANT COLLATERAL'}

KEY FACT STATEMENT (KFS) METRICS:
- Sanctioned Principal: ₹${loanAmount.toLocaleString('en-IN')}
- Net Disbursed: ₹${aprMetrics.netDisbursed.toLocaleString('en-IN')}
- Nominal Interest Rate: ${nominalInterestRate}% p.a.
- Upfront Fees & Third-Party Charges: ₹${(upfrontFees + insuranceCharges).toLocaleString('en-IN')}
- Monthly EMI: ₹${aprMetrics.emi.toLocaleString('en-IN')}
- Statutory True APR: ${aprMetrics.trueApr}% p.a.

DETAILED STATUTORY FINDINGS:
${RBI_CHECKLIST_ITEMS.map(item => `[${checklistStatus[item.id].toUpperCase()}] ${item.title} (${item.statutoryRef}) - Severity: ${item.severity}`).join('\n')}
=====================================================`}
          </div>
        </div>
      )}
    </div>
  );
}
