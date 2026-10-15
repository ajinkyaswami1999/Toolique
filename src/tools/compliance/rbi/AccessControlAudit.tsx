import { useState, useMemo } from 'react';
import {
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Lock,
  FileText,
  Copy,
  Check,
  Zap,
  Download
} from 'lucide-react';

interface AccessControlItem {
  id: string;
  pillar: 'Maker-Checker & SoD' | 'Privileged Access (PAM)' | 'Quarterly UAR' | 'Offboarding & Dormancy';
  title: string;
  requirement: string;
  statutoryRef: string;
  severity: 'Critical' | 'High' | 'Medium';
}

const ACCESS_CONTROLS: AccessControlItem[] = [
  {
    id: 'ac_maker_checker',
    pillar: 'Maker-Checker & SoD',
    title: 'Dual-Control Maker-Checker for Financial Transactions',
    requirement: 'All fund disbursements, limit modifications, account status overrides, and master parameter edits must enforce strict segregation between creator (Maker) and approver (Checker).',
    statutoryRef: 'RBI Cyber Security Framework Annex 1 Para 3',
    severity: 'Critical'
  },
  {
    id: 'ac_sod_matrix',
    pillar: 'Maker-Checker & SoD',
    title: 'Automated Segregation of Duties (SoD) Conflict Detection',
    requirement: 'Identity governance systems must actively detect and block conflicting role assignments (e.g., loan underwriting + loan disbursement authority held by the same user).',
    statutoryRef: 'RBI MD-IT Governance 2023 Sec 11',
    severity: 'Critical'
  },
  {
    id: 'ac_pam_mfa',
    pillar: 'Privileged Access (PAM)',
    title: 'Hardware-Backed MFA for Administrative Consoles',
    requirement: 'Mandatory Multi-Factor Authentication (FIDO2 / Hardware Token / Authenticator App) for all server roots, cloud dashboards, database consoles, and firewall portals.',
    statutoryRef: 'RBI Cyber Security Framework Annex 1 Para 4',
    severity: 'Critical'
  },
  {
    id: 'ac_pam_session',
    pillar: 'Privileged Access (PAM)',
    title: 'Privileged Session Recording & Keystroke Auditing',
    requirement: 'All privileged terminal (SSH/RDP) sessions accessing core databases and production infrastructure must be screen-recorded and keystroke-logged with tamper-proof archival.',
    statutoryRef: 'RBI Cyber Security Framework Annex 1 Para 5',
    severity: 'High'
  },
  {
    id: 'ac_uar_quarterly',
    pillar: 'Quarterly UAR',
    title: 'Mandatory Quarterly User Access Review (UAR)',
    requirement: 'Department heads and system custodians must recertify access permissions for 100% of internal employees, consultants, and vendor accounts on a strict quarterly cadence.',
    statutoryRef: 'RBI MD-IT Governance 2023 Sec 13',
    severity: 'Critical'
  },
  {
    id: 'ac_offboard_sla',
    pillar: 'Offboarding & Dormancy',
    title: 'Immediate 24-Hour Offboarding De-provisioning SLA',
    requirement: 'Access rights for separated employees, terminated contractors, and rotated vendors must be revoked in directory services (AD/IdP) within 24 hours of exit.',
    statutoryRef: 'RBI Cyber Security Framework Annex 1 Para 8',
    severity: 'Critical'
  },
  {
    id: 'ac_dormancy_90d',
    pillar: 'Offboarding & Dormancy',
    title: 'Automated 90-Day Dormant Account Disablement',
    requirement: 'User accounts with zero login activity for 90 consecutive days must be automatically disabled and flagged for supervisor review before reactivation.',
    statutoryRef: 'RBI Cyber Security Framework Annex 1 Para 9',
    severity: 'High'
  },
  {
    id: 'ac_polp_least_priv',
    pillar: 'Maker-Checker & SoD',
    title: 'Principle of Least Privilege (PoLP) Role Baseline',
    requirement: 'Users must be provisioned with the minimum permissions strictly necessary for their current job function, with just-in-time (JIT) elevation for emergency break-glass tasks.',
    statutoryRef: 'RBI MD-IT Governance 2023 Sec 10',
    severity: 'High'
  }
];

export default function AccessControlAudit() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'simulator' | 'report'>('checklist');
  const [controlStatus, setControlStatus] = useState<Record<string, 'compliant' | 'non_compliant' | 'in_progress'>>(() => {
    const init: Record<string, 'compliant' | 'non_compliant' | 'in_progress'> = {};
    ACCESS_CONTROLS.forEach(c => {
      init[c.id] = 'in_progress';
    });
    return init;
  });

  const [pillarFilter, setPillarFilter] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  // Maker-Checker Simulator State
  const [makerUser, setMakerUser] = useState<string>('officer_priya@bank.in');
  const [checkerUser, setCheckerUser] = useState<string>('manager_rajesh@bank.in');
  const [txnValue, setTxnValue] = useState<number>(500000); // 5 Lakhs
  const [actionType, setActionType] = useState<'disbursement' | 'kyc_override' | 'credit_limit'>('disbursement');

  const stats = useMemo(() => {
    let compliant = 0;
    let gaps = 0;
    let pending = 0;
    let criticalGaps = 0;

    ACCESS_CONTROLS.forEach(c => {
      const s = controlStatus[c.id];
      if (s === 'compliant') compliant++;
      else if (s === 'non_compliant') {
        gaps++;
        if (c.severity === 'Critical') criticalGaps++;
      } else pending++;
    });

    const score = Math.round((compliant / ACCESS_CONTROLS.length) * 100);
    return { compliant, gaps, pending, criticalGaps, score };
  }, [controlStatus]);

  const filteredControls = useMemo(() => {
    if (pillarFilter === 'All') return ACCESS_CONTROLS;
    return ACCESS_CONTROLS.filter(c => c.pillar === pillarFilter);
  }, [pillarFilter]);

  // Dual Control Validation
  const simulationResult = useMemo(() => {
    const isSameUser = makerUser.trim().toLowerCase() === checkerUser.trim().toLowerCase();
    const isHighValue = txnValue > 1000000; // > 10 Lakhs requires Senior VP checker

    let isValid = !isSameUser;
    let message = 'Compliant: Segregation of Duties validated with distinct Maker and Checker.';

    if (isSameUser) {
      isValid = false;
      message = 'FATAL SOD VIOLATION: Maker and Checker cannot be the same individual user account!';
    } else if (isHighValue) {
      message = 'Compliant dual-control authorization. Note: For transactions > ₹10 Lakhs, secondary Dual-Checker approval is recommended by RBI.';
    }

    return { isValid, isSameUser, isHighValue, message };
  }, [makerUser, checkerUser, txnValue]);

  const handleCopyReport = () => {
    const text = `=====================================================
RBI ACCESS CONTROL & MAKER-CHECKER AUDIT REPORT
RBI Cyber Security Framework & Master Direction on IT 2023
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Access Governance Score: ${stats.score}% (${stats.compliant}/${ACCESS_CONTROLS.length} Controls Met)
Critical Access Vulnerabilities: ${stats.criticalGaps}
Under Review: ${stats.pending}

MAKER-CHECKER WORKFLOW TEST:
- Maker Identity: ${makerUser}
- Checker Identity: ${checkerUser}
- Action: ${actionType.toUpperCase()} (₹${txnValue.toLocaleString('en-IN')})
- SoD Audit Result: ${simulationResult.isValid ? 'COMPLIANT (Segregation Enforced)' : 'VIOLATION DETECTED'}

DETAILED AUDIT FINDINGS:
${ACCESS_CONTROLS.map(c => `[${controlStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.severity}`).join('\n')}
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReport = () => {
    const text = `=====================================================
RBI ACCESS CONTROL & MAKER-CHECKER AUDIT REPORT
RBI Cyber Security Framework & Master Direction on IT 2023
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Access Governance Score: ${stats.score}% (${stats.compliant}/${ACCESS_CONTROLS.length} Controls Met)
Critical Access Vulnerabilities: ${stats.criticalGaps}
Under Review: ${stats.pending}

MAKER-CHECKER WORKFLOW TEST:
- Maker Identity: ${makerUser}
- Checker Identity: ${checkerUser}
- Action: ${actionType.toUpperCase()} (₹${txnValue.toLocaleString('en-IN')})
- SoD Audit Result: ${simulationResult.isValid ? 'COMPLIANT (Segregation Enforced)' : 'VIOLATION DETECTED'}

DETAILED AUDIT FINDINGS:
${ACCESS_CONTROLS.map(c => `[${controlStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.severity}`).join('\n')}
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Access_Control_Audit_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              RBI Access Control & Maker-Checker Audit
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Audit Segregation of Duties (SoD), Privileged Access Management (PAM), and quarterly User Access Reviews (UAR).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>RBI Cyber Framework</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'checklist'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          Access Controls Matrix
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'simulator'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Maker-Checker SoD Simulator
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
          Statutory Audit Report
        </button>
      </div>

      {/* TAB 1: CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Access Governance</span>
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
                {stats.compliant} / {ACCESS_CONTROLS.length}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Active Enforcement</span>
            </div>

            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Critical Gaps</span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5" />
                {stats.criticalGaps}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Immediate Audit Risk</span>
            </div>

            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Under Review</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
                <Clock className="w-5 h-5" />
                {stats.pending}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Pending Verification</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Maker-Checker & SoD', 'Privileged Access (PAM)', 'Quarterly UAR', 'Offboarding & Dormancy'].map(p => (
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
                            c.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {c.severity} Severity
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

      {/* TAB 2: SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="saas-card p-6 rounded-xl space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Maker-Checker Dual-Control Authorization Simulator
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Verify that transaction initiation and authorization adhere to strict Segregation of Duties (SoD) with zero self-approval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Transaction Operation
                </label>
                <select
                  value={actionType}
                  onChange={e => setActionType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  <option value="disbursement">Loan Principal Disbursement (RTGS/NEFT)</option>
                  <option value="kyc_override">Manual KYC Override & Risk Profile Downgrade</option>
                  <option value="credit_limit">Corporate Credit Limit Modification</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Transaction Amount (₹)
                </label>
                <input
                  type="number"
                  value={txnValue}
                  onChange={e => setTxnValue(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Initiator Account (Maker)
                </label>
                <input
                  type="text"
                  value={makerUser}
                  onChange={e => setMakerUser(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Approving Account (Checker)
                </label>
                <input
                  type="text"
                  value={checkerUser}
                  onChange={e => setCheckerUser(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </div>

            {/* Simulation Card */}
            <div className="space-y-4">
              <div
                className={`p-5 rounded-xl border ${
                  simulationResult.isValid
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {simulationResult.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  )}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {simulationResult.isValid
                      ? 'SOD VALIDATION PASSED: Dual-Control Established'
                      : 'SOD VALIDATION FAILED: Self-Approval Blocked'}
                  </h3>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {simulationResult.message}
                </p>

                <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Maker:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{makerUser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Checker:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{checkerUser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dual Authorization:</span>
                    <span className={`font-semibold ${simulationResult.isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {simulationResult.isValid ? 'Enforced' : 'Violated'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="saas-card p-4 rounded-xl text-xs space-y-2 text-slate-600 dark:text-slate-400">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  RBI Cyber Security Mandate
                </div>
                <p>
                  No single employee or administrator shall have the ability to both initiate and execute financial debits or security configuration changes. All Maker-Checker audit trails must be immutable and timestamped with NTP accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REPORT */}
      {activeTab === 'report' && (
        <div className="saas-card p-6 rounded-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Access Governance & SoD Audit Workpaper
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Formal workpaper for Internal Audit and RBI Cyber Security Inspections.
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
RBI ACCESS CONTROL & MAKER-CHECKER AUDIT REPORT
RBI Cyber Security Framework & Master Direction on IT 2023
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Access Governance Score: ${stats.score}% (${stats.compliant}/${ACCESS_CONTROLS.length} Controls Met)
Critical Access Vulnerabilities: ${stats.criticalGaps}
Under Review: ${stats.pending}

MAKER-CHECKER WORKFLOW TEST:
- Maker Identity: ${makerUser}
- Checker Identity: ${checkerUser}
- Action: ${actionType.toUpperCase()} (₹${txnValue.toLocaleString('en-IN')})
- SoD Audit Result: ${simulationResult.isValid ? 'COMPLIANT (Segregation Enforced)' : 'VIOLATION DETECTED'}

DETAILED AUDIT FINDINGS:
${ACCESS_CONTROLS.map(c => `[${controlStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.severity}`).join('\n')}
=====================================================`}
          </div>
        </div>
      )}
    </div>
  );
}
