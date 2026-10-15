import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Copy,
  Check,
  Scale,
  Building
} from 'lucide-react';

interface AssessmentQuestion {
  id: string;
  pillar: string;
  title: string;
  description: string;
  section: string;
  weight: number;
}

const DPDP_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'notice',
    pillar: 'Notice & Consent',
    title: 'Itemized & Bilingual Consent Notice (Section 5)',
    description: 'Do you give users an itemized notice in clear language (and in English + scheduled Indian languages) specifying data collected, exact purpose, and withdrawal mechanism before seeking consent?',
    section: 'Sec 5(1)',
    weight: 15
  },
  {
    id: 'purpose',
    pillar: 'Purpose Limitation',
    title: 'Strict Purpose Limitation & Minimisation (Section 6)',
    description: 'Is personal data processed strictly and solely for the specified purpose for which the Data Principal provided consent, without secondary reuse?',
    section: 'Sec 6(1)',
    weight: 15
  },
  {
    id: 'safeguards',
    pillar: 'Security Safeguards',
    title: 'Reasonable Technical & Organisational Safeguards (Section 8(5))',
    description: 'Do you deploy encryption at rest, encryption in transit, strict access control, and periodic vulnerability assessments to prevent data breaches?',
    section: 'Sec 8(5)',
    weight: 20
  },
  {
    id: 'breach_notice',
    pillar: 'Breach Notification',
    title: 'Mandatory Data Breach Intimation (Section 8(6))',
    description: 'Do you maintain an operational incident response plan capable of intimating both the Data Protection Board of India (DPB) and each affected Data Principal in case of a breach?',
    section: 'Sec 8(6)',
    weight: 15
  },
  {
    id: 'erasure',
    pillar: 'Data Retention & Erasure',
    title: 'Data Erasure Upon Purpose Fulfillment (Section 8(7))',
    description: 'Do you automatically erase personal data when the specified purpose is fulfilled, or when the user withdraws consent, unless retention is mandated by law (e.g. PMLA/RBI)?',
    section: 'Sec 8(7)',
    weight: 10
  },
  {
    id: 'children',
    pillar: 'Children’s Data Protection',
    title: 'Verifiable Parental Consent & No Targeted Ads (Section 9)',
    description: 'If processing data of children (<18 years), do you obtain verifiable parental consent and completely avoid behavioral tracking or targeted advertising directed at children?',
    section: 'Sec 9(1)-(3)',
    weight: 10
  },
  {
    id: 'grievance',
    pillar: 'Grievance Redressal',
    title: 'Data Principal Grievance Officer & Redressal (Section 8(10))',
    description: 'Have you published the contact details of a Grievance Officer on your website/app with a defined redressal timeline for user complaints?',
    section: 'Sec 8(10)',
    weight: 10
  },
  {
    id: 'rights',
    pillar: 'Principal Rights',
    title: 'Rights to Access, Correction & Erasure (Sections 11–13)',
    description: 'Can users easily request a summary of personal data, nominate an individual in event of death/incapacity, and correct or erase their profile information?',
    section: 'Sec 11-13',
    weight: 5
  }
];

export default function DPDPReadinessEvaluator() {
  // Answers state: true = compliant, false = non-compliant, null = not assessed
  const [answers, setAnswers] = useState<Record<string, boolean>>({
    notice: true,
    purpose: true,
    safeguards: false,
    breach_notice: false,
    erasure: true,
    children: false,
    grievance: true,
    rights: true
  });

  // Significant Data Fiduciary (SDF) parameters
  const [userVolume, setUserVolume] = useState<'low' | 'medium' | 'high'>('medium');
  const [processesSensitiveData, setProcessesSensitiveData] = useState<boolean>(true);
  const [involvesChildren, setInvolvesChildren] = useState<boolean>(false);
  const [breachSeverityEstimate, setBreachSeverityEstimate] = useState<'safeguard_failure' | 'breach_unreported' | 'children_violation' | 'minor'>('safeguard_failure');

  // Consent Generator tab state
  const [companyName, setCompanyName] = useState<string>('Acme Fintech Technologies Pvt Ltd');
  const [dpoEmail, setDpoEmail] = useState<string>('dpo@acmefintech.in');
  const [purposeList, setPurposeList] = useState<string>('Account opening, KYC verification, and processing payment transactions');
  const [dataPoints, setDataPoints] = useState<string>('Full Name, Mobile Number, Email, PAN, and Bank Account Details');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Score Calculation
  const { score, compliantCount, totalCount, riskLevel, riskColor } = useMemo(() => {
    let earned = 0;
    let total = 0;
    let compliant = 0;

    DPDP_QUESTIONS.forEach((q) => {
      total += q.weight;
      if (answers[q.id]) {
        earned += q.weight;
        compliant++;
      }
    });

    const finalScore = Math.round((earned / total) * 100);
    let level = 'High Risk';
    let color = 'rose';

    if (finalScore >= 80) {
      level = 'Low Risk (Audit Ready)';
      color = 'emerald';
    } else if (finalScore >= 55) {
      level = 'Moderate Risk (Gaps Identified)';
      color = 'amber';
    }

    return {
      score: finalScore,
      compliantCount: compliant,
      totalCount: DPDP_QUESTIONS.length,
      riskLevel: level,
      riskColor: color
    };
  }, [answers]);

  // Significant Data Fiduciary (SDF) Assessment (Section 10)
  const isLikelySDF = useMemo(() => {
    return userVolume === 'high' || (userVolume === 'medium' && processesSensitiveData);
  }, [userVolume, processesSensitiveData]);

  // Statutory Penalty Calculator (Section 33 & Schedule)
  const statutoryPenaltyEstimate = useMemo(() => {
    switch (breachSeverityEstimate) {
      case 'safeguard_failure':
        return {
          max: '₹250 Crores',
          section: 'Section 33 read with Schedule (Item 1)',
          desc: 'Failure to observe reasonable technical and organisational security safeguards to prevent personal data breach.'
        };
      case 'breach_unreported':
        return {
          max: '₹200 Crores',
          section: 'Section 33 read with Schedule (Item 2)',
          desc: 'Failure to intimate personal data breach to Data Protection Board of India (DPB) or affected Data Principals.'
        };
      case 'children_violation':
        return {
          max: '₹200 Crores',
          section: 'Section 33 read with Schedule (Item 3)',
          desc: 'Non-compliance in relation to children’s data (tracking, targeted ads, or lacking verifiable parental consent).'
        };
      case 'minor':
      default:
        return {
          max: '₹50 Crores',
          section: 'Section 33 read with Schedule (Item 5)',
          desc: 'General non-compliance with statutory provisions of the DPDP Act or directions of the Data Protection Board.'
        };
    }
  }, [breachSeverityEstimate]);

  const toggleAnswer = (id: string, val: boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const generatedNoticeText = useMemo(() => {
    return `STATUTORY NOTICE UNDER SECTION 5(1) OF THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023 (DPDP ACT)

1. DATA FIDUCIARY IDENTIFICATION:
This notice is issued by ${companyName} ("Data Fiduciary") to inform you ("Data Principal") regarding the collection, processing, and storage of your personal data.

2. SPECIFIC PERSONAL DATA COLLECTED:
Under Section 5(1)(i), we collect the following limited personal data elements:
${dataPoints}

3. SPECIFIC PURPOSE OF PROCESSING:
Under Section 5(1)(ii), your personal data will be processed solely for the lawful and specified purpose of:
${purposeList}

4. DATA PRINCIPAL RIGHTS & CONSENT WITHDRAWAL:
Under Section 6(4) of the DPDP Act, you possess the unconditional right to withdraw your consent at any time through our settings portal. Withdrawal of consent shall not affect the lawfulness of processing based on consent before its withdrawal.

5. GRIEVANCE REDRESSAL & DATA PROTECTION OFFICER (DPO):
If you have any questions, wish to exercise your rights under Sections 11–13, or wish to file a grievance, contact our Data Protection Officer at:
Email: ${dpoEmail}
Official Address: Regulatory Compliance Cell, ${companyName}

6. APPEAL TO THE DATA PROTECTION BOARD OF INDIA:
If your grievance is not resolved to your satisfaction within statutory timelines, you have the right to file an official complaint before the Data Protection Board of India (DPB).`;
  }, [companyName, dataPoints, purposeList, dpoEmail]);

  return (
    <div className="space-y-8 text-left">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Compliance Score Card */}
        <div className="saas-card p-6 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
              DPDP Compliance Score
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
              riskColor === 'emerald'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : riskColor === 'amber'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
            }`}>
              {riskLevel}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-zinc-900 dark:text-white font-mono">
              {score}%
            </span>
            <span className="text-xs text-zinc-500 font-bold">
              ({compliantCount} of {totalCount} Controls Met)
            </span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                riskColor === 'emerald' ? 'bg-emerald-500' : riskColor === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Significant Data Fiduciary Status Card */}
        <div className="saas-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
              Fiduciary Classification
            </span>
            <Building className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-zinc-900 dark:text-white">
            {isLikelySDF ? 'Significant Data Fiduciary (SDF)' : 'Standard Data Fiduciary'}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {isLikelySDF
              ? 'Triggered Section 10 obligations: Mandatory DPO based in India, statutory independent audits, and algorithmic DPIA.'
              : 'Standard statutory fiduciary duties apply under Sections 5–8 (notice, purpose limitation, and breach intimation).'}
          </p>
        </div>

        {/* Maximum Statutory Penalty Exposure */}
        <div className="saas-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
              Statutory Penalty Ceiling
            </span>
            <Scale className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {statutoryPenaltyEstimate.max}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed truncate" title={statutoryPenaltyEstimate.desc}>
            {statutoryPenaltyEstimate.section}
          </p>
        </div>
      </div>

      {/* Main Grid: Assessment Questionnaire + Fiduciary Classification Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 10 Core Control Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span>DPDP Act 2023 Statutory Controls Audit</span>
              </h2>
              <span className="text-[10px] font-mono text-zinc-400">8 Key Obligations</span>
            </div>

            <div className="space-y-4">
              {DPDP_QUESTIONS.map((q) => {
                const isCompliant = answers[q.id];
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition ${
                      isCompliant
                        ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40'
                        : 'bg-rose-50/40 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                            {q.title}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {q.section}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-bold">
                            Weight: {q.weight} pts
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {q.description}
                        </p>
                      </div>

                      {/* Toggle Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                        <button
                          type="button"
                          onClick={() => toggleAnswer(q.id, true)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            isCompliant
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Met</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAnswer(q.id, false)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            !isCompliant
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Gap</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: SDF Classification & Penalty Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Fiduciary Profile & Sizing */}
          <div className="saas-card p-6 space-y-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <Building className="w-4 h-4 text-emerald-500" />
              <span>SDF Classification Parameters</span>
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Data Principal Volume (Active User Base in India)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: '< 1 Lakh Users' },
                    { id: 'medium', label: '1L - 50L Users' },
                    { id: 'high', label: '> 50 Lakh Users' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setUserVolume(lvl.id as any)}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                        userVolume === lvl.id
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <span>Processes Financial / Health / Biometric Data?</span>
                  <input
                    type="checkbox"
                    checked={processesSensitiveData}
                    onChange={(e) => setProcessesSensitiveData(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
                <label className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <span>Services Directed at Children (&lt;18 Years)?</span>
                  <input
                    type="checkbox"
                    checked={involvesChildren}
                    onChange={(e) => setInvolvesChildren(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>

              {isLikelySDF && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Section 10 SDF Triggers Active
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Under DPDP guidelines, high-volume entities processing sensitive data face mandatory resident DPO appointment, annual statutory data audits, and algorithmic DPIA filings.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Statutory Penalty Risk Simulator */}
          <div className="saas-card p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <Scale className="w-4 h-4 text-rose-500" />
              <span>Section 33 Statutory Penalty Exposure</span>
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Simulate Violation Severity Category:
              </label>
              <select
                value={breachSeverityEstimate}
                onChange={(e) => setBreachSeverityEstimate(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="safeguard_failure">Failure to take reasonable security safeguards (Max ₹250 Cr)</option>
                <option value="breach_unreported">Failure to intimate breach to DPB & Principals (Max ₹200 Cr)</option>
                <option value="children_violation">Breach of obligations regarding children's data (Max ₹200 Cr)</option>
                <option value="minor">General statutory non-compliance (Max ₹50 Cr)</option>
              </select>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-zinc-500">Statutory Limit:</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-black">{statutoryPenaltyEstimate.max}</span>
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {statutoryPenaltyEstimate.desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5 Statutory Notice Generator Studio */}
      <div className="saas-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Section 5 Statutory Consent Notice Studio</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Generate statutory itemized notices required by Section 5 of the DPDP Act 2023 before obtaining consent.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(generatedNoticeText, 'notice-text')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {copiedKey === 'notice-text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'notice-text' ? 'Copied Notice' : 'Copy Notice Text'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Company / Legal Entity Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Data Protection Officer / Grievance Email
              </label>
              <input
                type="email"
                value={dpoEmail}
                onChange={(e) => setDpoEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Personal Data Points Collected
              </label>
              <textarea
                rows={2}
                value={dataPoints}
                onChange={(e) => setDataPoints(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Exact Specified Purpose
              </label>
              <textarea
                rows={2}
                value={purposeList}
                onChange={(e) => setPurposeList(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Generated Notice Preview */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
              Generated Notice Output (Ready for App / Web Modal)
            </span>
            <pre className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 font-mono text-[11px] leading-relaxed text-zinc-800 dark:text-zinc-200 max-h-72 overflow-y-auto whitespace-pre-wrap select-all">
              {generatedNoticeText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
