import { useState, useMemo } from 'react';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  FileCheck,
  Copy,
  Check,
  Download
} from 'lucide-react';

interface VendorClause {
  id: string;
  category: 'Governance & Due Diligence' | 'Contractual Safeguards' | 'Data Security & Sovereignty' | 'BCP & Exit Strategy';
  title: string;
  requirement: string;
  statutoryRef: string;
  severity: 'Critical' | 'High' | 'Medium';
}

const VENDOR_CLAUSES: VendorClause[] = [
  {
    id: 'v_audit',
    category: 'Contractual Safeguards',
    title: 'Unrestricted Right to Audit by RE & RBI',
    requirement: 'The outsourcing agreement must explicitly grant the RE, its internal/external auditors, and RBI supervisory officials unrestricted access to inspect and audit facilities, systems, and logs.',
    statutoryRef: 'RBI Outsourcing MD 2023 Section 14(a)',
    severity: 'Critical'
  },
  {
    id: 'v_subcontract',
    category: 'Contractual Safeguards',
    title: 'Prior Written Approval for Sub-Contracting',
    requirement: 'The service provider shall not sub-contract any part of the outsourced IT service without prior written consent from the Regulated Entity.',
    statutoryRef: 'RBI Outsourcing MD 2023 Section 15',
    severity: 'Critical'
  },
  {
    id: 'v_breach_sla',
    category: 'Data Security & Sovereignty',
    title: '2-Hour Incident Notification SLA to RE',
    requirement: 'The vendor must contractually commit to notifying the RE of any cybersecurity breach, unauthorized access, or data leakage within 2 hours of detection.',
    statutoryRef: 'RBI Outsourcing MD 2023 Section 16(b)',
    severity: 'Critical'
  },
  {
    id: 'v_data_local',
    category: 'Data Security & Sovereignty',
    title: 'Data Localization within Indian Borders',
    requirement: 'All customer financial records, KYC data, and transactional databases processed by the vendor must remain stored in data centers physically located in India.',
    statutoryRef: 'RBI Storage of Payment System Data 2018',
    severity: 'Critical'
  },
  {
    id: 'v_due_diligence',
    category: 'Governance & Due Diligence',
    title: 'Comprehensive Financial & Technical Due Diligence',
    requirement: 'Mandatory evaluation of vendor financial viability, SOC 2 Type II reports, ISO 27001 certifications, litigation history, and beneficial ownership prior to onboarding.',
    statutoryRef: 'RBI Outsourcing MD 2023 Section 8',
    severity: 'High'
  },
  {
    id: 'v_concentration',
    category: 'Governance & Due Diligence',
    title: 'Vendor Concentration & Single Point of Failure (SPOF) Audit',
    requirement: 'Evaluation of system dependency on a single vendor or geographic cluster, ensuring alternative failover or secondary provider availability.',
    statutoryRef: 'RBI Outsourcing MD 2023 Section 10',
    severity: 'High'
  },
  {
    id: 'v_bcp_dr',
    category: 'BCP & Exit Strategy',
    title: 'Annual Joint BCP / Disaster Recovery Drills',
    requirement: 'Vendor must participate in annual joint business continuity drills demonstrating an RTO under 4 hours and RPO under 15 minutes for critical banking services.',
    statutoryRef: 'RBI Outsourcing MD 2023 Section 18',
    severity: 'Critical'
  },
  {
    id: 'v_exit_escrow',
    category: 'BCP & Exit Strategy',
    title: 'Documented Exit Management & Transition Escrow',
    requirement: 'Legally enforceable exit clause mandating vendor cooperation, secure data repatriation, code escrow, and complete data purging upon contract termination.',
    statutoryRef: 'RBI Outsourcing MD 2023 Section 20',
    severity: 'High'
  }
];

export default function VendorRiskAssessment() {
  const [activeTab, setActiveTab] = useState<'materiality' | 'checklist' | 'report'>('materiality');
  const [vendorName, setVendorName] = useState<string>('CloudScale FinTech Services Pvt Ltd');
  const [serviceDescription, setServiceDescription] = useState<string>('Core Banking Gateway & Loan Origination SaaS Platform');

  // Materiality Criteria State
  const [impactsCoreBanking, setImpactsCoreBanking] = useState<boolean>(true);
  const [handlesCustomerPII, setHandlesCustomerPII] = useState<boolean>(true);
  const [contractValueAboveThreshold, setContractValueAboveThreshold] = useState<boolean>(true);
  const [highSwitchingCost, setHighSwitchingCost] = useState<boolean>(true);
  const [crossBorderComponent, setCrossBorderComponent] = useState<boolean>(false);

  // Clause Checklist State
  const [clauseStatus, setClauseStatus] = useState<Record<string, 'compliant' | 'non_compliant' | 'in_progress'>>(() => {
    const init: Record<string, 'compliant' | 'non_compliant' | 'in_progress'> = {};
    VENDOR_CLAUSES.forEach(c => {
      init[c.id] = 'in_progress';
    });
    return init;
  });

  const [copied, setCopied] = useState(false);

  // Materiality Evaluation
  const materialityEvaluation = useMemo(() => {
    let score = 0;
    if (impactsCoreBanking) score += 30;
    if (handlesCustomerPII) score += 30;
    if (contractValueAboveThreshold) score += 20;
    if (highSwitchingCost) score += 10;
    if (crossBorderComponent) score += 10;

    const isMaterial = score >= 50;
    const tier = isMaterial ? 'Material Outsourcing (Tier 1)' : 'Non-Material IT Vendor (Tier 2)';

    return { score, isMaterial, tier };
  }, [impactsCoreBanking, handlesCustomerPII, contractValueAboveThreshold, highSwitchingCost, crossBorderComponent]);

  // Clause Stats
  const stats = useMemo(() => {
    let compliant = 0;
    let gaps = 0;
    let pending = 0;
    let criticalGaps = 0;

    VENDOR_CLAUSES.forEach(c => {
      const s = clauseStatus[c.id];
      if (s === 'compliant') compliant++;
      else if (s === 'non_compliant') {
        gaps++;
        if (c.severity === 'Critical') criticalGaps++;
      } else pending++;
    });

    const score = Math.round((compliant / VENDOR_CLAUSES.length) * 100);
    return { compliant, gaps, pending, criticalGaps, score };
  }, [clauseStatus]);

  const handleCopyReport = () => {
    const text = `=====================================================
RBI IT OUTSOURCING & VENDOR RISK ASSESSMENT REPORT
Master Direction on Outsourcing of IT Services (April 2023)
=====================================================
Assessment Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Vendor Name: ${vendorName}
Service Scope: ${serviceDescription}

STATUTORY MATERIALITY CLASSIFICATION:
- Classification: ${materialityEvaluation.tier}
- Materiality Index: ${materialityEvaluation.score}/100
- Core Banking Impact: ${impactsCoreBanking ? 'YES' : 'NO'}
- Sensitive Customer PII Access: ${handlesCustomerPII ? 'YES' : 'NO'}
- High Switching Cost / Lock-in: ${highSwitchingCost ? 'YES' : 'NO'}
- Board IT Committee Approval Mandate: ${materialityEvaluation.isMaterial ? 'MANDATORY (Chapter III)' : 'Standard Procurement'}

CONTRACTUAL GOVERNANCE SCORE: ${stats.score}% (${stats.compliant}/${VENDOR_CLAUSES.length} Controls Met)
Critical Audit Gaps: ${stats.criticalGaps}
In-Progress Clauses: ${stats.pending}

MANDATORY STATUTORY CLAUSE AUDIT:
${VENDOR_CLAUSES.map(c => `[${clauseStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.severity}`).join('\n')}
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReport = () => {
    const text = `=====================================================
RBI IT OUTSOURCING & VENDOR RISK ASSESSMENT REPORT
Master Direction on Outsourcing of IT Services (April 2023)
=====================================================
Assessment Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Vendor Name: ${vendorName}
Service Scope: ${serviceDescription}

STATUTORY MATERIALITY CLASSIFICATION:
- Classification: ${materialityEvaluation.tier}
- Materiality Index: ${materialityEvaluation.score}/100
- Core Banking Impact: ${impactsCoreBanking ? 'YES' : 'NO'}
- Sensitive Customer PII Access: ${handlesCustomerPII ? 'YES' : 'NO'}
- High Switching Cost / Lock-in: ${highSwitchingCost ? 'YES' : 'NO'}
- Board IT Committee Approval Mandate: ${materialityEvaluation.isMaterial ? 'MANDATORY (Chapter III)' : 'Standard Procurement'}

CONTRACTUAL GOVERNANCE SCORE: ${stats.score}% (${stats.compliant}/${VENDOR_CLAUSES.length} Controls Met)
Critical Audit Gaps: ${stats.criticalGaps}
In-Progress Clauses: ${stats.pending}

MANDATORY STATUTORY CLAUSE AUDIT:
${VENDOR_CLAUSES.map(c => `[${clauseStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.severity}`).join('\n')}
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vendor_Risk_Assessment_${vendorName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              RBI IT Outsourcing & Vendor Risk Assessment
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Evaluate vendor materiality, right-to-audit mandates, and sub-contracting safeguards under RBI Master Direction 2023.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>RBI MD 2023 Compliant</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('materiality')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'materiality'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Materiality Evaluator
        </button>
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'checklist'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Contractual Safeguards Audit
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'report'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Board Workpaper
        </button>
      </div>

      {/* TAB 1: MATERIALITY */}
      {activeTab === 'materiality' && (
        <div className="saas-card p-6 rounded-xl space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Vendor Materiality Classification (Chapter III)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Material outsourcing arrangements are subject to heightened scrutiny, Board of Directors approval, and direct regulatory notification under the 2023 Master Direction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Vendor Legal Entity Name
                </label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Outsourced Service Description
                </label>
                <input
                  type="text"
                  value={serviceDescription}
                  onChange={e => setServiceDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Materiality Triggers
                </span>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={impactsCoreBanking}
                    onChange={e => setImpactsCoreBanking(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Disruption directly impairs core banking, payment processing, or loan disbursement
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={handlesCustomerPII}
                    onChange={e => setHandlesCustomerPII(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Vendor accesses, stores, or processes confidential customer PII / financial data
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contractValueAboveThreshold}
                    onChange={e => setContractValueAboveThreshold(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Annual contract value exceeds internal financial materiality threshold / IT budget
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highSwitchingCost}
                    onChange={e => setHighSwitchingCost(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Proprietary architecture or high switching costs create significant vendor lock-in
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={crossBorderComponent}
                    onChange={e => setCrossBorderComponent(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Cross-border elements (overseas parent company or offshore technical support teams)
                  </span>
                </label>
              </div>
            </div>

            {/* Classification Card */}
            <div className="space-y-4">
              <div
                className={`p-5 rounded-xl border ${
                  materialityEvaluation.isMaterial
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-emerald-500/10 border-emerald-500/30'
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  RBI Master Direction Tier
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {materialityEvaluation.isMaterial ? (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  {materialityEvaluation.tier}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Materiality Risk Index:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{materialityEvaluation.score} / 100</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Board IT Committee Approval:</span>
                    <span className={`font-bold ${materialityEvaluation.isMaterial ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {materialityEvaluation.isMaterial ? 'MANDATORY PRIOR TO EXECUTION' : 'DELEGATED PROCUREMENT'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-400">Periodic Audit Frequency:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {materialityEvaluation.isMaterial ? 'Annual Comprehensive On-site' : 'Biennial / Remote'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="saas-card p-4 rounded-xl text-xs space-y-2 text-slate-600 dark:text-slate-400">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Statutory Definition (RBI 2023)
                </div>
                <p>
                  "Material Outsourcing" refers to any arrangement which, if disrupted, would have a significant impact on business operations, reputation, profitability, or customer service delivery. REs retain ultimate responsibility and cannot delegate legal obligations to vendors.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Contract Compliance</span>
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
              <span className="text-xs text-slate-500 font-medium">Clauses Executed</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" />
                {stats.compliant} / {VENDOR_CLAUSES.length}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Contractually Bound</span>
            </div>

            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Critical Gaps</span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5" />
                {stats.criticalGaps}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Breach of RBI MD</span>
            </div>

            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Under Negotiation</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
                <Clock className="w-5 h-5" />
                {stats.pending}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Pending Legal Review</span>
            </div>
          </div>

          <div className="space-y-3">
            {VENDOR_CLAUSES.map(c => {
              const currentStatus = clauseStatus[c.id];
              return (
                <div
                  key={c.id}
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
                          {c.statutoryRef}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            c.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {c.severity} Severity
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{c.category}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                        {c.requirement}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
                      <button
                        onClick={() => setClauseStatus(prev => ({ ...prev, [c.id]: 'compliant' }))}
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
                        onClick={() => setClauseStatus(prev => ({ ...prev, [c.id]: 'in_progress' }))}
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
                        onClick={() => setClauseStatus(prev => ({ ...prev, [c.id]: 'non_compliant' }))}
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

      {/* TAB 3: REPORT */}
      {activeTab === 'report' && (
        <div className="saas-card p-6 rounded-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Board IT Strategy Committee Assessment Workpaper
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Statutory risk memorandum for Board approval and regulatory inspection records.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyReport}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Full Audit'}
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
RBI IT OUTSOURCING & VENDOR RISK ASSESSMENT REPORT
Master Direction on Outsourcing of IT Services (April 2023)
=====================================================
Assessment Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Vendor Name: ${vendorName}
Service Scope: ${serviceDescription}

STATUTORY MATERIALITY CLASSIFICATION:
- Classification: ${materialityEvaluation.tier}
- Materiality Index: ${materialityEvaluation.score}/100
- Core Banking Impact: ${impactsCoreBanking ? 'YES' : 'NO'}
- Sensitive Customer PII Access: ${handlesCustomerPII ? 'YES' : 'NO'}
- High Switching Cost / Lock-in: ${highSwitchingCost ? 'YES' : 'NO'}
- Board IT Committee Approval Mandate: ${materialityEvaluation.isMaterial ? 'MANDATORY (Chapter III)' : 'Standard Procurement'}

CONTRACTUAL GOVERNANCE SCORE: ${stats.score}% (${stats.compliant}/${VENDOR_CLAUSES.length} Controls Met)
Critical Audit Gaps: ${stats.criticalGaps}
In-Progress Clauses: ${stats.pending}

MANDATORY STATUTORY CLAUSE AUDIT:
${VENDOR_CLAUSES.map(c => `[${clauseStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.severity}`).join('\n')}
=====================================================`}
          </div>
        </div>
      )}
    </div>
  );
}
