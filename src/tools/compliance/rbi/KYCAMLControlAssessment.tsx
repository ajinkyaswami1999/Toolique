import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Building2,
  FileText,
  Copy,
  Check,
  Scale,
  Download
} from 'lucide-react';

interface KycControl {
  id: string;
  pillar: 'CDD & Risk Profiling' | 'UBO Identification' | 'V-CIP Video KYC' | 'Small Accounts' | 'Sanctions & FIU';
  title: string;
  requirement: string;
  statutoryRef: string;
  riskTier: 'Critical' | 'High' | 'Medium';
}

const KYC_CONTROLS: KycControl[] = [
  {
    id: 'cdd_1',
    pillar: 'CDD & Risk Profiling',
    title: 'Statutory Customer Risk Categorization',
    requirement: 'Customers must be classified into Low, Medium, and High risk based on identity, social/financial status, nature of business, and geographic location.',
    statutoryRef: 'RBI KYC MD Section 37',
    riskTier: 'Critical'
  },
  {
    id: 'cdd_2',
    pillar: 'CDD & Risk Profiling',
    title: 'Periodic KYC Updation Schedule',
    requirement: 'Mandatory periodic KYC updation: High Risk every 2 years, Medium Risk every 8 years, and Low Risk every 10 years with fresh Officially Valid Documents (OVDs).',
    statutoryRef: 'RBI KYC MD Section 38',
    riskTier: 'High'
  },
  {
    id: 'cdd_3',
    pillar: 'CDD & Risk Profiling',
    title: 'Politically Exposed Persons (PEP) Enhanced Due Diligence',
    requirement: 'Approval from Senior Management is mandatory before onboarding any PEP (foreign or domestic prominent public figures) along with verifying Source of Wealth and Source of Funds.',
    statutoryRef: 'RBI KYC MD Section 41',
    riskTier: 'Critical'
  },
  {
    id: 'ubo_1',
    pillar: 'UBO Identification',
    title: '10% Corporate Beneficial Ownership Threshold',
    requirement: 'Under 2023 PMLA amendment, identify natural persons holding >10% controlling ownership interest or voting rights in corporate entities (reduced from 25%).',
    statutoryRef: 'PMLA Rules 2023 Amendment Reg 9(1)',
    riskTier: 'Critical'
  },
  {
    id: 'ubo_2',
    pillar: 'UBO Identification',
    title: 'Partnership & Trust UBO Screening (10%)',
    requirement: 'Identify individuals holding >10% capital or profits in partnership firms, or >10% interest/trustees/settlors in private or public trusts.',
    statutoryRef: 'RBI KYC MD Section 9(b)',
    riskTier: 'High'
  },
  {
    id: 'vcip_1',
    pillar: 'V-CIP Video KYC',
    title: 'Live Geolocation within Indian Territory',
    requirement: 'V-CIP application must enforce real-time GPS coordinate capture verifying that both the customer and RE official are physically situated inside Indian borders.',
    statutoryRef: 'RBI KYC MD Section 18(d)',
    riskTier: 'Critical'
  },
  {
    id: 'vcip_2',
    pillar: 'V-CIP Video KYC',
    title: 'AI Liveness Detection & Facial Match Score',
    requirement: 'Automated liveness detection to prevent deepfakes or pre-recorded spoofing, with facial recognition match vs OVD/Aadhaar image meeting min 80% threshold.',
    statutoryRef: 'RBI KYC MD Section 18(f)',
    riskTier: 'Critical'
  },
  {
    id: 'vcip_3',
    pillar: 'V-CIP Video KYC',
    title: 'Live PAN Verification with NSDL/Protean API',
    requirement: 'Real-time online verification of PAN details with the issuing authority (Income Tax Department / Protean / NSDL) during the live video session.',
    statutoryRef: 'RBI KYC MD Section 18(h)',
    riskTier: 'Critical'
  },
  {
    id: 'small_1',
    pillar: 'Small Accounts',
    title: 'Small Account Aggregate Balance Cap (₹50,000)',
    requirement: 'Accounts opened with relaxed KYC (Simplified Due Diligence) must never exceed ₹50,000 aggregate balance at any point in time.',
    statutoryRef: 'RBI KYC MD Section 24',
    riskTier: 'High'
  },
  {
    id: 'small_2',
    pillar: 'Small Accounts',
    title: 'Small Account Annual Credit Cap (₹1,00,000)',
    requirement: 'Total credits in a Small Account shall not exceed ₹1,00,000 in a financial year, and total monthly debits/transfers shall not exceed ₹10,000.',
    statutoryRef: 'RBI KYC MD Section 24(b)',
    riskTier: 'High'
  },
  {
    id: 'sanc_1',
    pillar: 'Sanctions & FIU',
    title: 'UNSCR 1267 / 1988 Sanctions List Screening',
    requirement: 'Real-time screening of all existing and prospective account holders against United Nations Security Council Resolutions (UNSCR) terrorist sanctions lists without delay.',
    statutoryRef: 'RBI KYC MD Section 51',
    riskTier: 'Critical'
  },
  {
    id: 'sanc_2',
    pillar: 'Sanctions & FIU',
    title: 'Mandatory Suspicious Transaction Reporting (STR) to FIU-IND',
    requirement: 'Suspicious transactions must be reported to the Financial Intelligence Unit - India (FIU-IND) via FINnet within 7 days of arriving at a conclusion of suspicion.',
    statutoryRef: 'PMLA Rule 8(2) & FIU Directions',
    riskTier: 'Critical'
  }
];

export default function KYCAMLControlAssessment() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'ubo' | 'small' | 'report'>('checklist');
  const [controlStatus, setControlStatus] = useState<Record<string, 'compliant' | 'non_compliant' | 'in_progress'>>(() => {
    const init: Record<string, 'compliant' | 'non_compliant' | 'in_progress'> = {};
    KYC_CONTROLS.forEach(c => {
      init[c.id] = 'in_progress';
    });
    return init;
  });

  const [pillarFilter, setPillarFilter] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  // UBO Calculator State
  const [entityType, setEntityType] = useState<'company' | 'partnership' | 'trust' | 'unincorporated'>('company');
  const [stakeholderShare, setStakeholderShare] = useState<number>(12);
  const [votingControl, setVotingControl] = useState<boolean>(false);
  const [actingThroughSeniorManagingOfficial, setActingThroughSeniorManagingOfficial] = useState<boolean>(false);

  // Small Account Tracker State
  const [accountBalance, setAccountBalance] = useState<number>(35000);
  const [totalAnnualCredits, setTotalAnnualCredits] = useState<number>(85000);
  const [monthlyDebits, setMonthlyDebits] = useState<number>(7500);

  // Assessment Stats
  const stats = useMemo(() => {
    let compliant = 0;
    let gaps = 0;
    let pending = 0;
    let criticalGaps = 0;

    KYC_CONTROLS.forEach(c => {
      const s = controlStatus[c.id];
      if (s === 'compliant') compliant++;
      else if (s === 'non_compliant') {
        gaps++;
        if (c.riskTier === 'Critical') criticalGaps++;
      } else pending++;
    });

    const score = Math.round((compliant / KYC_CONTROLS.length) * 100);
    return { compliant, gaps, pending, criticalGaps, score };
  }, [controlStatus]);

  // UBO Evaluation
  const uboAnalysis = useMemo(() => {
    let threshold = 10;
    if (entityType === 'unincorporated') threshold = 15;

    const qualifiesByEquity = stakeholderShare >= threshold;
    const isUBO = qualifiesByEquity || votingControl || actingThroughSeniorManagingOfficial;

    return {
      threshold,
      qualifiesByEquity,
      isUBO,
      classification: isUBO ? 'Natural Person Beneficial Owner (UBO)' : 'Non-Controlling Shareholder'
    };
  }, [entityType, stakeholderShare, votingControl, actingThroughSeniorManagingOfficial]);

  // Small Account Analysis
  const smallAccountAnalysis = useMemo(() => {
    const isBalanceExceeded = accountBalance > 50000;
    const isCreditExceeded = totalAnnualCredits > 100000;
    const isDebitExceeded = monthlyDebits > 10000;
    const isViolated = isBalanceExceeded || isCreditExceeded || isDebitExceeded;

    return {
      isViolated,
      isBalanceExceeded,
      isCreditExceeded,
      isDebitExceeded
    };
  }, [accountBalance, totalAnnualCredits, monthlyDebits]);

  const filteredControls = useMemo(() => {
    if (pillarFilter === 'All') return KYC_CONTROLS;
    return KYC_CONTROLS.filter(c => c.pillar === pillarFilter);
  }, [pillarFilter]);

  const handleCopyReport = () => {
    const text = `=====================================================
RBI KYC / AML STATUTORY CONTROL ASSESSMENT REPORT
Master Direction - Know Your Customer (KYC) Direction, 2016
=====================================================
Assessment Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall KYC/AML Maturity Score: ${stats.score}% (${stats.compliant}/${KYC_CONTROLS.length} Controls Met)
Critical Audit Gaps: ${stats.criticalGaps}
In-Review Controls: ${stats.pending}

BENEFICIAL OWNERSHIP (UBO) STATUTORY EVALUATION:
- Entity Structure: ${entityType.toUpperCase()}
- Statutory Threshold: ${uboAnalysis.threshold}%
- Stakeholder Equity/Capital: ${stakeholderShare}%
- Result: ${uboAnalysis.classification} (Under PMLA 2023 Amendment)

SMALL ACCOUNT STATUTORY LIMIT AUDIT:
- Current Balance: ₹${accountBalance.toLocaleString('en-IN')} (Max ₹50,000 -> ${smallAccountAnalysis.isBalanceExceeded ? 'EXCEEDED' : 'OK'})
- Financial Year Credits: ₹${totalAnnualCredits.toLocaleString('en-IN')} (Max ₹1,00,000 -> ${smallAccountAnalysis.isCreditExceeded ? 'EXCEEDED' : 'OK'})
- Monthly Debits: ₹${monthlyDebits.toLocaleString('en-IN')} (Max ₹10,000 -> ${smallAccountAnalysis.isDebitExceeded ? 'EXCEEDED' : 'OK'})
- Compliance Status: ${smallAccountAnalysis.isViolated ? 'VIOLATION DETECTED' : 'FULLY COMPLIANT'}

DETAILED AUDIT FINDINGS:
${KYC_CONTROLS.map(c => `[${controlStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.riskTier}`).join('\n')}
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReport = () => {
    const text = `=====================================================
RBI KYC / AML STATUTORY CONTROL ASSESSMENT REPORT
Master Direction - Know Your Customer (KYC) Direction, 2016
=====================================================
Assessment Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall KYC/AML Maturity Score: ${stats.score}% (${stats.compliant}/${KYC_CONTROLS.length} Controls Met)
Critical Audit Gaps: ${stats.criticalGaps}
In-Review Controls: ${stats.pending}

BENEFICIAL OWNERSHIP (UBO) STATUTORY EVALUATION:
- Entity Structure: ${entityType.toUpperCase()}
- Statutory Threshold: ${uboAnalysis.threshold}%
- Stakeholder Equity/Capital: ${stakeholderShare}%
- Result: ${uboAnalysis.classification} (Under PMLA 2023 Amendment)

SMALL ACCOUNT STATUTORY LIMIT AUDIT:
- Current Balance: ₹${accountBalance.toLocaleString('en-IN')} (Max ₹50,000 -> ${smallAccountAnalysis.isBalanceExceeded ? 'EXCEEDED' : 'OK'})
- Financial Year Credits: ₹${totalAnnualCredits.toLocaleString('en-IN')} (Max ₹1,00,000 -> ${smallAccountAnalysis.isCreditExceeded ? 'EXCEEDED' : 'OK'})
- Monthly Debits: ₹${monthlyDebits.toLocaleString('en-IN')} (Max ₹10,000 -> ${smallAccountAnalysis.isDebitExceeded ? 'EXCEEDED' : 'OK'})
- Compliance Status: ${smallAccountAnalysis.isViolated ? 'VIOLATION DETECTED' : 'FULLY COMPLIANT'}

DETAILED AUDIT FINDINGS:
${KYC_CONTROLS.map(c => `[${controlStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.riskTier}`).join('\n')}
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KYC_AML_Control_Assessment_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              RBI KYC & Anti-Money Laundering (AML) Control Assessment
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Audit Customer Due Diligence, 10% UBO thresholds under PMLA 2023, V-CIP video onboarding, and Small Account limits.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Client-Side Evaluation</span>
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
          KYC/AML Control Matrix
        </button>
        <button
          onClick={() => setActiveTab('ubo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'ubo'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          10% UBO Identifier
        </button>
        <button
          onClick={() => setActiveTab('small')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'small'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          Small Account Limits
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
          Compliance Workpaper
        </button>
      </div>

      {/* TAB 1: CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Readiness Index</span>
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
              <span className="text-xs text-slate-500 font-medium">Controls Met</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" />
                {stats.compliant} / {KYC_CONTROLS.length}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Verified In Place</span>
            </div>

            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Critical Gaps</span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5" />
                {stats.criticalGaps}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">PMLA Sanction Exposure</span>
            </div>

            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Under Review</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
                <Clock className="w-5 h-5" />
                {stats.pending}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">In Progress</span>
            </div>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'CDD & Risk Profiling', 'UBO Identification', 'V-CIP Video KYC', 'Small Accounts', 'Sanctions & FIU'].map(p => (
              <button
                key={p}
                onClick={() => setPillarFilter(p)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  pillarFilter === p
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Controls List */}
          <div className="space-y-3">
            {filteredControls.map(c => {
              const currentStatus = controlStatus[c.id];
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
                            c.riskTier === 'Critical'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {c.riskTier} Risk
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{c.pillar}</span>
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
                        onClick={() => setControlStatus(prev => ({ ...prev, [c.id]: 'compliant' }))}
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
                        onClick={() => setControlStatus(prev => ({ ...prev, [c.id]: 'in_progress' }))}
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
                        onClick={() => setControlStatus(prev => ({ ...prev, [c.id]: 'non_compliant' }))}
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

      {/* TAB 2: UBO IDENTIFIER */}
      {activeTab === 'ubo' && (
        <div className="saas-card p-6 rounded-xl space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Ultimate Beneficial Ownership (UBO) Statutory Threshold Tester
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Evaluates natural persons qualifying as Beneficial Owners under the amended Prevention of Money Laundering (Maintenance of Records) Rules, 2023.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Legal Entity Classification
                </label>
                <select
                  value={entityType}
                  onChange={e => setEntityType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  <option value="company">Company / Corporate Entity (10% Threshold)</option>
                  <option value="partnership">Partnership Firm / LLP (10% Capital/Profits)</option>
                  <option value="trust">Trust / Foundation (10% Interest or Author/Trustee)</option>
                  <option value="unincorporated">Unincorporated Association / BOI (15% Threshold)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Shareholding / Capital / Profit Interest (%)
                </label>
                <input
                  type="number"
                  value={stakeholderShare}
                  onChange={e => setStakeholderShare(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={votingControl}
                    onChange={e => setVotingControl(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Exercises control through voting rights, shareholder agreements, or board nomination
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={actingThroughSeniorManagingOfficial}
                    onChange={e => setActingThroughSeniorManagingOfficial(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    Acting as Senior Managing Official (SMO) where no natural person owns &gt;10%
                  </span>
                </label>
              </div>
            </div>

            {/* Evaluation Result */}
            <div className="space-y-4">
              <div
                className={`p-5 rounded-xl border ${
                  uboAnalysis.isUBO
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                  PMLA Classification
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  {uboAnalysis.classification}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Statutory Threshold:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">≥ {uboAnalysis.threshold}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Declared Stake:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{stakeholderShare}%</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-400">Enhanced Due Diligence (EDD) Required:</span>
                    <span className={`font-bold ${uboAnalysis.isUBO ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
                      {uboAnalysis.isUBO ? 'MANDATORY (Form 60 / Aadhaar / PAN + Source of Wealth)' : 'STANDARD CDD'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="saas-card p-4 rounded-xl text-xs space-y-2 text-slate-600 dark:text-slate-400">
                <div className="font-semibold text-slate-900 dark:text-white">
                  March 2023 PMLA Amendment Notice
                </div>
                <p>
                  The Ministry of Finance notified revised thresholds reducing corporate beneficial ownership from 25% down to 10%, aligning India’s FATF compliance framework. Non-profit organizations (NPOs) must also register on the Darpan portal of NITI Aayog.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SMALL ACCOUNT LIMITS */}
      {activeTab === 'small' && (
        <div className="saas-card p-6 rounded-xl space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Simplified Due Diligence (Small Accounts) Compliance Limits
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Under Section 24 of RBI KYC Master Direction, accounts opened without standard OVDs must adhere strictly to statutory ceiling limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Current Account Balance (₹) — Statutory Max: ₹50,000
                </label>
                <input
                  type="number"
                  value={accountBalance}
                  onChange={e => setAccountBalance(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Total Financial Year Aggregate Credits (₹) — Statutory Max: ₹1,00,000
                </label>
                <input
                  type="number"
                  value={totalAnnualCredits}
                  onChange={e => setTotalAnnualCredits(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Current Month Aggregate Debits / Transfers (₹) — Statutory Max: ₹10,000
                </label>
                <input
                  type="number"
                  value={monthlyDebits}
                  onChange={e => setMonthlyDebits(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </div>

            {/* Audit Status */}
            <div className="space-y-4">
              <div
                className={`p-5 rounded-xl border ${
                  smallAccountAnalysis.isViolated
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-emerald-500/10 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {smallAccountAnalysis.isViolated ? (
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {smallAccountAnalysis.isViolated
                      ? 'STATUTORY CEILING VIOLATION: Transaction Freeze Required'
                      : 'COMPLIANT: Within Small Account Statutory Limits'}
                  </h3>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Balance Limit (₹50,000):</span>
                    <span className={`font-bold ${smallAccountAnalysis.isBalanceExceeded ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                      ₹{accountBalance.toLocaleString('en-IN')} {smallAccountAnalysis.isBalanceExceeded ? '(EXCEEDED)' : '(OK)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Annual Credit Limit (₹1,00,000):</span>
                    <span className={`font-bold ${smallAccountAnalysis.isCreditExceeded ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                      ₹{totalAnnualCredits.toLocaleString('en-IN')} {smallAccountAnalysis.isCreditExceeded ? '(EXCEEDED)' : '(OK)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-400">Monthly Debit Limit (₹10,000):</span>
                    <span className={`font-bold ${smallAccountAnalysis.isDebitExceeded ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                      ₹{monthlyDebits.toLocaleString('en-IN')} {smallAccountAnalysis.isDebitExceeded ? '(EXCEEDED)' : '(OK)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="saas-card p-4 rounded-xl text-xs space-y-2 text-slate-600 dark:text-slate-400">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Regulatory Remedy
                </div>
                <p>
                  If any of the three ceiling limits are breached, no further debits or credits shall be allowed until full KYC is completed by obtaining Officially Valid Documents (OVDs). Small accounts remain valid for an initial period of 12 months only.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REPORT */}
      {activeTab === 'report' && (
        <div className="saas-card p-6 rounded-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                KYC / AML Statutory Audit Workpaper
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Formal compliance memorandum ready for Board Risk Committees, RBI KYC audits, and FIU inspections.
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
RBI KYC / AML STATUTORY CONTROL ASSESSMENT REPORT
Master Direction - Know Your Customer (KYC) Direction, 2016
=====================================================
Assessment Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall KYC/AML Maturity Score: ${stats.score}% (${stats.compliant}/${KYC_CONTROLS.length} Controls Met)
Critical Audit Gaps: ${stats.criticalGaps}
In-Review Controls: ${stats.pending}

BENEFICIAL OWNERSHIP (UBO) STATUTORY EVALUATION:
- Entity Structure: ${entityType.toUpperCase()}
- Statutory Threshold: ${uboAnalysis.threshold}%
- Stakeholder Equity/Capital: ${stakeholderShare}%
- Result: ${uboAnalysis.classification} (Under PMLA 2023 Amendment)

SMALL ACCOUNT STATUTORY LIMIT AUDIT:
- Current Balance: ₹${accountBalance.toLocaleString('en-IN')} (Max ₹50,000 -> ${smallAccountAnalysis.isBalanceExceeded ? 'EXCEEDED' : 'OK'})
- Financial Year Credits: ₹${totalAnnualCredits.toLocaleString('en-IN')} (Max ₹1,00,000 -> ${smallAccountAnalysis.isCreditExceeded ? 'EXCEEDED' : 'OK'})
- Monthly Debits: ₹${monthlyDebits.toLocaleString('en-IN')} (Max ₹10,000 -> ${smallAccountAnalysis.isDebitExceeded ? 'EXCEEDED' : 'OK'})
- Compliance Status: ${smallAccountAnalysis.isViolated ? 'VIOLATION DETECTED' : 'FULLY COMPLIANT'}

DETAILED AUDIT FINDINGS:
${KYC_CONTROLS.map(c => `[${controlStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.riskTier}`).join('\n')}
=====================================================`}
          </div>
        </div>
      )}
    </div>
  );
}
