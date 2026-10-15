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
  requirement: string;
  statutoryRef: string;
  riskIfMissing: 'Critical' | 'High' | 'Medium';
}

const DPDP_PILLARS: AssessmentQuestion[] = [
  {
    id: 'p1_notice',
    pillar: '1. Notice & Transparency',
    title: 'Itemized & Standalone Section 5 Notice',
    requirement: 'Notice is presented prior to or at the time of seeking consent, itemizing the personal data sought and specific purpose of processing in clear and plain language.',
    statutoryRef: 'Section 5(1)',
    riskIfMissing: 'Critical'
  },
  {
    id: 'p1_lang',
    pillar: '1. Notice & Transparency',
    title: 'Multi-Lingual Delivery (8th Schedule)',
    requirement: 'Data Principals have the option to access the consent notice and grievance redressal in English or any of the 22 languages specified in the Eighth Schedule of the Constitution.',
    statutoryRef: 'Section 5(3)',
    riskIfMissing: 'High'
  },
  {
    id: 'p2_consent',
    pillar: '2. Consent Architecture',
    title: 'Unbundled & Affirmative Consent',
    requirement: 'Consent is free, specific, informed, unconditional, and unambiguous with a clear affirmative action. No pre-ticked boxes or bundled terms.',
    statutoryRef: 'Section 6(1)',
    riskIfMissing: 'Critical'
  },
  {
    id: 'p2_withdraw',
    pillar: '2. Consent Architecture',
    title: 'Consent Withdrawal with Equal Ease',
    requirement: 'Data Principals can withdraw consent as easily as it was given, with immediate cessation of data processing unless required by other law.',
    statutoryRef: 'Section 6(4)',
    riskIfMissing: 'High'
  },
  {
    id: 'p3_child',
    pillar: '3. Children & Persons with Disability',
    title: 'Verifiable Parental Consent (VPC)',
    requirement: 'Verifiable consent of the parent or lawful guardian is obtained before processing personal data of any individual below 18 years of age.',
    statutoryRef: 'Section 9(1)',
    riskIfMissing: 'Critical'
  },
  {
    id: 'p3_track',
    pillar: '3. Children & Persons with Disability',
    title: 'Zero Tracking / Behavioral Monitoring of Minors',
    requirement: 'Strict prohibition of tracking, behavioral monitoring of children, or targeted advertising directed at children.',
    statutoryRef: 'Section 9(2)',
    riskIfMissing: 'Critical'
  },
  {
    id: 'p4_rights',
    pillar: '4. Data Principal Rights',
    title: 'Right to Access & Correction Workflow',
    requirement: 'Automated or human workflows are active to provide summaries of personal data processed and facilitate correction, completion, or updating.',
    statutoryRef: 'Sections 11 & 12',
    riskIfMissing: 'High'
  },
  {
    id: 'p4_erase',
    pillar: '4. Data Principal Rights',
    title: 'Right to Erasure & Purpose Fulfillment Deletion',
    requirement: 'Personal data is erased upon consent withdrawal or as soon as the specified purpose is no longer being served, unless retention is mandated by law.',
    statutoryRef: 'Section 12(3) & 8(7)',
    riskIfMissing: 'High'
  },
  {
    id: 'p5_grievance',
    pillar: '5. Grievance Redressal',
    title: 'Redressal Officer & Statutory SLA',
    requirement: 'A dedicated Grievance Redressal Officer is published on the portal with an SLA-bound escalation path prior to filing complaints with the Data Protection Board.',
    statutoryRef: 'Section 13',
    riskIfMissing: 'Medium'
  },
  {
    id: 'p6_dpo',
    pillar: '6. Significant Data Fiduciary (SDF)',
    title: 'India-Resident Data Protection Officer (DPO)',
    requirement: 'SDF entities appoint a Data Protection Officer based in India who reports directly to the Board of Directors.',
    statutoryRef: 'Section 10(2)(a)',
    riskIfMissing: 'Critical'
  },
  {
    id: 'p6_dpia',
    pillar: '6. Significant Data Fiduciary (SDF)',
    title: 'Data Protection Impact Assessment (DPIA) & Audit',
    requirement: 'Periodic DPIA and independent data audits are conducted to assess systemic risks to privacy and national sovereignty.',
    statutoryRef: 'Section 10(2)(c)',
    riskIfMissing: 'High'
  },
  {
    id: 'p7_security',
    pillar: '7. Technical Safeguards & Breaches',
    title: 'Reasonable Security Safeguards (AES-256 / HSM)',
    requirement: 'Technical measures including encryption at rest, pseudonymization, and access controls are implemented to prevent personal data breaches.',
    statutoryRef: 'Section 8(5)',
    riskIfMissing: 'Critical'
  },
  {
    id: 'p7_breach',
    pillar: '7. Technical Safeguards & Breaches',
    title: 'Mandatory DPBI & Principal Breach Notification',
    requirement: 'In the event of a personal data breach, immediate statutory intimation is given to the Data Protection Board of India and each affected Data Principal.',
    statutoryRef: 'Section 8(6)',
    riskIfMissing: 'Critical'
  },
  {
    id: 'p8_crossborder',
    pillar: '8. Cross-Border Transfers',
    title: 'Negative List Compliance (Section 16)',
    requirement: 'Personal data is transferred only to countries not restricted by the Central Government negative list notification.',
    statutoryRef: 'Section 16',
    riskIfMissing: 'Medium'
  }
];

export default function DPDPComplianceChecklist() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'sdf' | 'penalty' | 'notice'>('checklist');

  // Checklist State
  const [answers, setAnswers] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    DPDP_PILLARS.forEach((q) => {
      initial[q.id] = false;
    });
    return initial;
  });

  // SDF Calculator State
  const [userVolume, setUserVolume] = useState<number>(500000);
  const [processesSensitiveData, setProcessesSensitiveData] = useState<boolean>(true);
  const [processesChildrenData, setProcessesChildrenData] = useState<boolean>(false);
  const [crossBorderTransfers, setCrossBorderTransfers] = useState<boolean>(true);
  const [publicOrderImpact, setPublicOrderImpact] = useState<boolean>(false);

  // Penalty Simulator State
  const [breachSeverity, setBreachSeverity] = useState<'minor' | 'moderate' | 'catastrophic'>('moderate');
  const [affectedCount, setAffectedCount] = useState<number>(50000);
  const [notifiedPromptly, setNotifiedPromptly] = useState<boolean>(true);
  const [securitySafeguardsFailed, setSecuritySafeguardsFailed] = useState<boolean>(false);

  // Consent Notice Generator State
  const [entityName, setEntityName] = useState<string>('Acme Innovations India Pvt. Ltd.');
  const [purpose, setPurpose] = useState<string>('Processing user orders, delivering logistics notifications, and credit verification');
  const [dataFields, setDataFields] = useState<string>('Full Name, Mobile Number, Delivery Address, PAN Card (for invoicing)');
  const [dpoEmail, setDpoEmail] = useState<string>('dpo@acme.example.in');
  const [grievanceUrl, setGrievanceUrl] = useState<string>('https://acme.example.in/privacy/grievance');
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);

  // Toggle checklist
  const toggleAnswer = (id: string) => {
    setAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Score Calculation
  const auditScore = useMemo(() => {
    const total = DPDP_PILLARS.length;
    const completed = Object.values(answers).filter(Boolean).length;
    const percentage = Math.round((completed / total) * 100);

    let status = 'Non-Compliant';
    let statusColor = 'text-red-600 dark:text-red-400';
    let badgeBg = 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800';

    if (percentage >= 85) {
      status = 'DPDP Ready';
      statusColor = 'text-emerald-600 dark:text-emerald-400';
      badgeBg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    } else if (percentage >= 50) {
      status = 'Moderate Alignment';
      statusColor = 'text-amber-600 dark:text-amber-400';
      badgeBg = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    }

    return { total, completed, percentage, status, statusColor, badgeBg };
  }, [answers]);

  // SDF Evaluation
  const sdfEvaluation = useMemo(() => {
    let score = 0;
    if (userVolume >= 1000000) score += 35;
    else if (userVolume >= 200000) score += 20;

    if (processesSensitiveData) score += 25;
    if (processesChildrenData) score += 25;
    if (crossBorderTransfers) score += 10;
    if (publicOrderImpact) score += 20;

    const isSdfLikely = score >= 50;

    return {
      score,
      isSdfLikely,
      status: isSdfLikely ? 'Likely Significant Data Fiduciary (SDF)' : 'Standard Data Fiduciary',
      requirements: isSdfLikely
        ? [
            'Mandatory appointment of resident Data Protection Officer (DPO) in India under Section 10(2)(a)',
            'Independent Data Auditor engagement for periodic audits under Section 10(2)(b)',
            'Undertake periodic Data Protection Impact Assessments (DPIA) under Section 10(2)(c)',
            'Maintain strict algorithm audits & algorithmic transparency logs under Section 10(2)(d)'
          ]
        : [
            'General fiduciary transparency under Section 8',
            'Publish contact details of Grievance Redressal Officer under Section 13',
            'Enforce data minimization & erasure upon withdrawal under Section 8(7)'
          ]
    };
  }, [userVolume, processesSensitiveData, processesChildrenData, crossBorderTransfers, publicOrderImpact]);

  // Statutory Penalty Simulator
  const penaltyEstimation = useMemo(() => {
    let statutoryMax = 250; // ₹250 Crores max under Section 33 Schedule
    let estimatedExposure = 0;

    if (securitySafeguardsFailed) {
      // Clause 1: Failure to take reasonable security safeguards (up to 250 Cr)
      if (breachSeverity === 'catastrophic') estimatedExposure += 150;
      else if (breachSeverity === 'moderate') estimatedExposure += 50;
      else estimatedExposure += 10;
    }

    if (!notifiedPromptly) {
      // Clause 2: Failure to notify Board and Data Principals (up to 200 Cr)
      estimatedExposure += breachSeverity === 'catastrophic' ? 100 : 30;
    }

    if (breachSeverity === 'catastrophic' && affectedCount > 100000) {
      estimatedExposure = Math.min(statutoryMax, estimatedExposure * 1.5);
    }

    return {
      statutoryMax,
      estimatedExposure: Math.min(statutoryMax, Math.round(estimatedExposure)),
      currency: '₹ Crores'
    };
  }, [breachSeverity, affectedCount, notifiedPromptly, securitySafeguardsFailed]);

  // Notice Text
  const generatedNoticeText = useMemo(() => {
    return `STATUTORY NOTICE UNDER SECTION 5 OF THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023

1. DATA FIDUCIARY IDENTITY:
This notice is issued by ${entityName} ("Data Fiduciary").

2. SPECIFIC PERSONAL DATA COLLECTED:
In connection with your use of our services, we seek your explicit consent to process the following categories of digital personal data:
- ${dataFields}

3. ITEMISED PURPOSE OF PROCESSING:
The personal data collected will be processed strictly for the following purposes:
- ${purpose}

4. RIGHTS OF THE DATA PRINCIPAL:
Under the provisions of the DPDP Act, 2023, you are entitled to:
a) Right to access a summary of personal data being processed (Section 11).
b) Right to correction, completion, and updating of inaccurate data (Section 12).
c) Right to erasure of personal data once the specified purpose is fulfilled (Section 12).
d) Right to withdraw consent at any time with equal ease via our online settings portal (Section 6(4)).

5. GRIEVANCE REDRESSAL & DATA PROTECTION OFFICER (DPO):
If you have any questions, concerns, or grievances regarding the processing of your data, you may contact our designated officer:
- Email: ${dpoEmail}
- Online Grievance Portal: ${grievanceUrl}

If your grievance is not resolved satisfactorily, you hold the statutory right to file a complaint with the Data Protection Board of India.`;
  }, [entityName, dataFields, purpose, dpoEmail, grievanceUrl]);

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(generatedNoticeText);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Statutory Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 border border-blue-500/20 dark:border-blue-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                DPDP Act 2023 Statutory Readiness & SDF Evaluator
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  Act No. 22 of 2023
                </span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Evaluate enterprise compliance across the 8 statutory pillars, determine Significant Data Fiduciary (SDF) obligations under Section 10, simulate Section 33 statutory financial penalties, and generate Section 5 compliant consent notices.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${auditScore.badgeBg}`}>
              {auditScore.percentage}% Complete • {auditScore.status}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'checklist'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          8-Pillar Compliance Audit
        </button>
        <button
          onClick={() => setActiveTab('sdf')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'sdf'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          SDF Classifier (Section 10)
        </button>
        <button
          onClick={() => setActiveTab('penalty')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'penalty'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          Section 33 Penalty Simulator
        </button>
        <button
          onClick={() => setActiveTab('notice')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'notice'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Section 5 Consent Notice Studio
        </button>
      </div>

      {/* TAB 1: 8-PILLAR STATUTORY AUDIT */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Audit Score Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Statutory Alignment Scorecard
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {auditScore.completed} of {auditScore.total} Pillars Implemented
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Based on statutory obligations enacted by the Parliament of India under Digital Personal Data Protection Act, 2023.
              </p>
            </div>

            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Readiness Progress</span>
                <span>{auditScore.percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${
                    auditScore.percentage >= 85
                      ? 'bg-emerald-500'
                      : auditScore.percentage >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${auditScore.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DPDP_PILLARS.map((item) => {
              const isChecked = !!answers[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleAnswer(item.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isChecked ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">{item.pillar}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {item.statutoryRef}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {item.requirement}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                        item.riskIfMissing === 'Critical'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : item.riskIfMissing === 'High'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.riskIfMissing}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SDF CLASSIFIER */}
      {activeTab === 'sdf' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              SDF Threshold Evaluation (Section 10)
            </h3>
            <p className="text-xs text-slate-500">
              The Central Government designates Significant Data Fiduciaries based on volume, sensitivity, and systemic impact.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Volume of Active Indian Data Principals: {userVolume.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="50000"
                  value={userVolume}
                  onChange={(e) => setUserVolume(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={processesSensitiveData}
                    onChange={(e) => setProcessesSensitiveData(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Processes High-Sensitivity Data</div>
                    <div className="text-slate-500">Financial records, health metrics, biometrics, or Aadhaar tokens</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={processesChildrenData}
                    onChange={(e) => setProcessesChildrenData(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Processes Data of Children (Minors under 18)</div>
                    <div className="text-slate-500">Subject to Section 9 parental consent and zero-tracking mandates</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={crossBorderTransfers}
                    onChange={(e) => setCrossBorderTransfers(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Cross-Border Cloud Processing</div>
                    <div className="text-slate-500">Data transfers to foreign cloud regions or international SaaS vendors</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <input
                    type="checkbox"
                    checked={publicOrderImpact}
                    onChange={(e) => setPublicOrderImpact(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Systemic Public Order / Electoral Influence</div>
                    <div className="text-slate-500">Social media, public opinion, critical national infrastructure</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Classification Assessment
              </span>
              <div className={`p-4 rounded-xl border ${
                sdfEvaluation.isSdfLikely
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              }`}>
                <div className="text-base font-bold">{sdfEvaluation.status}</div>
                <div className="text-xs mt-1">SDF Risk Index: {sdfEvaluation.score} / 100 points</div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Mandatory Statutory Obligations for Your Class:
                </div>
                <ul className="space-y-2">
                  {sdfEvaluation.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              Reference: Section 10 of Digital Personal Data Protection Act, 2023.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATUTORY PENALTY SIMULATOR */}
      {activeTab === 'penalty' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Section 33 Breach Parameters
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Number of Affected Data Principals
                </label>
                <input
                  type="number"
                  min="1"
                  value={affectedCount}
                  onChange={(e) => setAffectedCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Severity & Nature of Data Exposed
                </label>
                <select
                  value={breachSeverity}
                  onChange={(e) => setBreachSeverity(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="minor">Minor (Name, Email, Phone without credentials)</option>
                  <option value="moderate">Moderate (Customer order history, transaction records, addresses)</option>
                  <option value="catastrophic">Catastrophic (Passwords, Banking/KYC tokens, Aadhaar, Health)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySafeguardsFailed}
                    onChange={(e) => setSecuritySafeguardsFailed(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Failure in Reasonable Security Safeguards</div>
                    <div className="text-slate-500">Unencrypted DB, weak passwords, unpatched server (Schedule Item 1)</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!notifiedPromptly}
                    onChange={(e) => setNotifiedPromptly(!e.target.checked)}
                    className="w-4 h-4 rounded text-red-600"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">Delay or Failure in Notifying Board / Principals</div>
                    <div className="text-slate-500">Violates Section 8(6) mandatory breach reporting (Schedule Item 2)</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Statutory Financial Liability
              </span>

              <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-center">
                <div className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">
                  Estimated Section 33 Exposure Ceiling
                </div>
                <div className="text-4xl font-black text-red-600 dark:text-red-400 mt-2">
                  ₹{penaltyEstimation.estimatedExposure} Crores
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Statutory Maximum: Up to ₹{penaltyEstimation.statutoryMax} Crores per incident
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
                <p>
                  <strong>Mitigating Factors considered by DPBI under Section 33:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Promptness in mitigation and isolation of affected systems.</li>
                  <li>Timely statutory disclosure to the Data Protection Board and users.</li>
                  <li>Whether the violation was repetitive or first-time offense.</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              Adjudicated by the Data Protection Board of India under Section 33 Schedule.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONSENT NOTICE GENERATOR */}
      {activeTab === 'notice' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Section 5 Notice Parameters
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Legal Entity / Data Fiduciary Name
                </label>
                <input
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Categories of Personal Data Requested
                </label>
                <input
                  type="text"
                  value={dataFields}
                  onChange={(e) => setDataFields(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Specified & Itemized Processing Purposes
                </label>
                <textarea
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    DPO / Grievance Officer Email
                  </label>
                  <input
                    type="email"
                    value={dpoEmail}
                    onChange={(e) => setDpoEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Online Grievance URL
                  </label>
                  <input
                    type="text"
                    value={grievanceUrl}
                    onChange={(e) => setGrievanceUrl(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Statutory Draft (English)
                </span>
                <button
                  onClick={handleCopyNotice}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  {copiedNotice ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedNotice ? 'Copied' : 'Copy Notice'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-y-auto max-h-[360px] border border-slate-800 leading-relaxed whitespace-pre-wrap">
                {generatedNoticeText}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Section 5 Notice Format</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">DPDP 2023 Compliant</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
