import { useState, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Copy,
  Check
} from 'lucide-react';

interface PolicyClauseCheck {
  id: string;
  category: string;
  title: string;
  statutoryRef: string;
  mandatoryRequirement: string;
  draftSnippet: string;
}

const POLICY_CLAUSES: PolicyClauseCheck[] = [
  {
    id: 'fiduciary_identity',
    category: 'General Information',
    title: 'Data Fiduciary Identity & Legal Address',
    statutoryRef: 'Section 5(1)',
    mandatoryRequirement: 'Explicitly identifies the legal corporate entity, registered corporate office in India, and CIN.',
    draftSnippet: 'This Privacy Policy is published by [Company Name], a company incorporated under the Companies Act, 2013, having its registered office at [Registered Indian Address] (referred to as "Data Fiduciary").'
  },
  {
    id: 'data_categories',
    category: 'Data Inventory',
    title: 'Itemized Categories of Personal Data Collected',
    statutoryRef: 'Section 5(1)(a)',
    mandatoryRequirement: 'Clear categorization of personal data (Identity, KYC, contact, transaction, device metadata).',
    draftSnippet: 'We collect and process the following specific categories of digital personal data: (a) Identity & KYC Data (Full Name, Date of Birth, PAN, Masked Aadhaar), (b) Contact Data (Email address, mobile number, postal billing address), (c) Transaction & Payment Data.'
  },
  {
    id: 'specified_purposes',
    category: 'Purpose Limitation',
    title: 'Specified & Unbundled Processing Purposes',
    statutoryRef: 'Section 5(1)(b) & Section 6(1)',
    mandatoryRequirement: 'Purposes must be clear, specific, and unbundled. No open-ended "for other related services" language.',
    draftSnippet: 'Your personal data is processed strictly for the following itemized purposes: (i) Provision and execution of requested services, (ii) Verification of identity pursuant to statutory regulatory mandates, (iii) Sending mandatory transaction notifications.'
  },
  {
    id: 'consent_withdrawal',
    category: 'Consent Management',
    title: 'Consent Withdrawal Mechanism with Equal Ease',
    statutoryRef: 'Section 6(4)',
    mandatoryRequirement: 'Data Principals must be informed how they can withdraw consent as easily as it was given.',
    draftSnippet: 'You have the statutory right to withdraw your consent at any time with equal ease. You may withdraw consent by navigating to Account Settings > Privacy & Consents on our web portal or mobile application, or by emailing [Consent Email]. Upon withdrawal, processing will cease immediately.'
  },
  {
    id: 'principal_rights',
    category: 'Citizen Rights',
    title: 'Right to Access, Correction & Erasure',
    statutoryRef: 'Sections 11 & 12',
    mandatoryRequirement: 'Discloses rights to obtain summary of data, correct inaccuracies, and request erasure upon purpose fulfillment.',
    draftSnippet: 'As a Data Principal, you hold statutory rights under the DPDP Act, 2023: (a) Right to Access: Request a summary of personal data processed and identities of third-party fiduciaries with whom data has been shared, (b) Right to Correction & Updating: Request correction of misleading or incomplete data, (c) Right to Erasure: Request erasure of data once the processing purpose is fulfilled.'
  },
  {
    id: 'grievance_officer',
    category: 'Grievance Redressal',
    title: 'Designated Grievance Redressal Officer Contact',
    statutoryRef: 'Section 13',
    mandatoryRequirement: 'Publishes name, designation, email, and Indian correspondence address of the Grievance Officer with an SLA.',
    draftSnippet: 'In accordance with Section 13 of the DPDP Act, 2023, the details of our Grievance Redressal Officer are as follows: Name: [Officer Name], Designation: Grievance Officer, Email: [grievance@company.in], Office Address: [Indian Address]. All grievances will be acknowledged within 24 hours and resolved within statutory timeframes.'
  },
  {
    id: 'dpbi_complaint',
    category: 'Grievance Redressal',
    title: 'Right to Approach Data Protection Board of India (DPBI)',
    statutoryRef: 'Section 13(3)',
    mandatoryRequirement: 'Informs Data Principals of their right to escalate unresolved grievances to the DPBI.',
    draftSnippet: 'If your grievance is not resolved satisfactorily by our Grievance Redressal Officer within the prescribed timeframe, you are entitled to lodge a complaint directly with the Data Protection Board of India (DPBI) through its official digital portal.'
  },
  {
    id: 'children_data',
    category: 'Special Protections',
    title: 'Children’s Data & Parental Consent Safeguards',
    statutoryRef: 'Section 9',
    mandatoryRequirement: 'Prohibits behavioral tracking of minors and affirms verifiable parental consent (VPC) mechanisms.',
    draftSnippet: 'Our services are not directed to individuals under 18 years of age without verifiable parental consent. We do not engage in behavioral monitoring, tracking, or targeted advertising directed at children.'
  },
  {
    id: 'data_retention',
    category: 'Data Governance',
    title: 'Data Retention & Purpose Fulfillment Erasure',
    statutoryRef: 'Section 8(7)',
    mandatoryRequirement: 'Explains retention schedules and affirms data erasure when no longer serving specified purpose.',
    draftSnippet: 'We retain your digital personal data only for as long as necessary to fulfill the specified purposes for which it was collected, or as mandated by applicable statutory laws (such as tax and accounting regulations). Upon expiration of the retention timeline, data is securely erased or anonymized.'
  },
  {
    id: 'security_safeguards',
    category: 'Security Standards',
    title: 'Reasonable Technical & Security Safeguards',
    statutoryRef: 'Section 8(5)',
    mandatoryRequirement: 'Affirms implementation of technical encryption, access controls, and breach prevention safeguards.',
    draftSnippet: 'We deploy robust technical and organizational measures to prevent personal data breaches, including AES-256 encryption at rest, TLS 1.3 encryption in transit, role-based access control, and continuous vulnerability monitoring.'
  },
  {
    id: 'cross_border',
    category: 'Data Transfers',
    title: 'Cross-Border Data Transfer Disclosures',
    statutoryRef: 'Section 16',
    mandatoryRequirement: 'Discloses international data transfers in compliance with Central Government notifications.',
    draftSnippet: 'Your personal data is stored and processed primarily within secure sovereign data centers located in India. Any cross-border data transfer complies strictly with Section 16 of the DPDP Act and Central Government negative list notifications.'
  },
  {
    id: 'dpo_appointment',
    category: 'SDF Governance',
    title: 'India-Resident Data Protection Officer (DPO)',
    statutoryRef: 'Section 10(2)(a)',
    mandatoryRequirement: 'For Significant Data Fiduciaries: DPO appointment details and Indian residence affirmation.',
    draftSnippet: 'Our designated Data Protection Officer (DPO) is based in India and represents the organization for statutory communications with the Data Protection Board of India: Contact: [dpo@company.in].'
  }
];

export default function PrivacyPolicyChecklist() {
  const [checkedClauses, setCheckedClauses] = useState<Record<string, boolean>>({
    fiduciary_identity: true,
    data_categories: true,
    specified_purposes: true,
    security_safeguards: true
  });
  const [companyName, setCompanyName] = useState<string>('Acme Digital India Pvt Ltd');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleClause = (id: string) => {
    setCheckedClauses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scoreData = useMemo(() => {
    const total = POLICY_CLAUSES.length;
    const implemented = Object.values(checkedClauses).filter(Boolean).length;
    const percent = Math.round((implemented / total) * 100);

    let status = 'Significant Gaps';
    let statusClass = 'text-red-600 dark:text-red-400';
    let badgeClass = 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300';

    if (percent === 100) {
      status = 'Fully DPDP Compliant';
      statusClass = 'text-emerald-600 dark:text-emerald-400';
      badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300';
    } else if (percent >= 70) {
      status = 'Substantially Aligned';
      statusClass = 'text-amber-600 dark:text-amber-400';
      badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
    }

    return { total, implemented, percent, status, statusClass, badgeClass };
  }, [checkedClauses]);

  const copyClause = (text: string, id: string) => {
    const customized = text.replaceAll('[Company Name]', companyName);
    navigator.clipboard.writeText(customized);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-indigo-500/10 border border-blue-500/20 dark:border-blue-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                DPDP Privacy Policy Statutory Clause Auditor
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  DPDP Act 2023 Mandatory Disclosures
                </span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Audit your corporate Privacy Policy against the 12 mandatory statutory clauses required under the DPDP Act 2023, identify compliance gaps, and generate legal clauses.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${scoreData.badgeClass}`}>
              {scoreData.percent}% Aligned • {scoreData.status}
            </span>
          </div>
        </div>
      </div>

      {/* Progress & Customizer Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Policy Completeness</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {scoreData.implemented} of {scoreData.total} Clauses Implemented
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
            Company Name for Drafts:
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          />
        </div>
      </div>

      {/* 12 Clauses Grid */}
      <div className="space-y-4">
        {POLICY_CLAUSES.map((clause) => {
          const isDone = !!checkedClauses[clause.id];
          return (
            <div
              key={clause.id}
              className={`p-5 rounded-2xl border transition-all ${
                isDone
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  : 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => toggleClause(clause.id)}
                    className="mt-0.5 shrink-0 focus:outline-none"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {clause.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                        {clause.statutoryRef}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        ({clause.category})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {clause.mandatoryRequirement}
                    </p>
                  </div>
                </div>

                <div className="lg:w-96 shrink-0 space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Standard Statutory Draft Clause
                    </span>
                    <button
                      onClick={() => copyClause(clause.draftSnippet, clause.id)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {copiedId === clause.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedId === clause.id ? 'Copied' : 'Copy Clause'}
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
                    {clause.draftSnippet.replaceAll('[Company Name]', companyName)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
