import { useState, useMemo } from 'react';
import {
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Download
} from 'lucide-react';

interface AuditItem {
  id: string;
  pillar: 'Governance & CISO' | 'Access & PAM' | 'Cryptography' | 'VAPT & SecOps' | 'Incident & CERT-In' | 'Third-Party Risk';
  frameworks: string[];
  title: string;
  requirement: string;
  evidenceNeeded: string;
  severity: 'Critical' | 'High' | 'Medium';
}

const AUDIT_CHECKLIST_ITEMS: AuditItem[] = [
  {
    id: 'gov_ciso',
    pillar: 'Governance & CISO',
    frameworks: ['ISO 27001:2022', 'RBI MD-IT', 'CERT-In'],
    title: 'Designated CISO & Board Security Committee',
    requirement: 'Appointment of an independent Chief Information Security Officer (CISO) reporting directly to the Board of Directors or Board Risk Committee.',
    evidenceNeeded: 'Board resolution, appointment letter, and committee charter',
    severity: 'Critical'
  },
  {
    id: 'gov_policy',
    pillar: 'Governance & CISO',
    frameworks: ['ISO 27001:2022', 'DPDP 2023'],
    title: 'Annual Information Security & Privacy Policy Review',
    requirement: 'Formally documented and approved Information Security Policy, reviewed and re-approved at least annually or upon major structural changes.',
    evidenceNeeded: 'Signed policy document with version revision history and approval timestamp',
    severity: 'High'
  },
  {
    id: 'iam_mfa',
    pillar: 'Access & PAM',
    frameworks: ['ISO 27001', 'RBI Cyber Framework', 'CERT-In'],
    title: 'Hardware/App-Backed MFA for All Admin & Remote Access',
    requirement: 'Mandatory Multi-Factor Authentication (MFA) across all administrative consoles, VPNs, cloud portals, and SSH/RDP jump hosts.',
    evidenceNeeded: 'IdP/Okta/Azure AD conditional access policies and active MFA logs',
    severity: 'Critical'
  },
  {
    id: 'iam_uar',
    pillar: 'Access & PAM',
    frameworks: ['ISO 27001', 'RBI MD-IT'],
    title: 'Quarterly User Access Review (UAR) & Deprovisioning SLA',
    requirement: 'Documented quarterly recertification of access rights and immediate 24-hour offboarding de-provisioning for separated personnel.',
    evidenceNeeded: 'Signed quarterly UAR sign-off sheets and offboarding ticket audit samples',
    severity: 'High'
  },
  {
    id: 'crypto_at_rest',
    pillar: 'Cryptography',
    frameworks: ['DPDP 2023', 'RBI MD-IT', 'ISO 27001'],
    title: 'AES-256 Encryption at Rest & In-Transit (TLS 1.3)',
    requirement: 'Sensitive customer PII, database tables, and backups encrypted at rest with AES-256, and data in transit secured via TLS 1.2/1.3.',
    evidenceNeeded: 'Cloud KMS key configuration, database TDE encryption settings, and SSL Labs report',
    severity: 'Critical'
  },
  {
    id: 'secops_vapt',
    pillar: 'VAPT & SecOps',
    frameworks: ['RBI Cyber Framework', 'CERT-In', 'ISO 27001'],
    title: 'Bi-Annual VAPT by CERT-In Empanelled Auditors',
    requirement: 'Vulnerability Assessment and Penetration Testing (VAPT) performed at least twice a year and before any major release by CERT-In empanelled auditors.',
    evidenceNeeded: 'Executive VAPT report, executive sign-off, and closure verification letters',
    severity: 'Critical'
  },
  {
    id: 'inc_certin',
    pillar: 'Incident & CERT-In',
    frameworks: ['CERT-In Directions 2022', 'IT Act 70B'],
    title: 'Statutory 6-Hour CERT-In Incident Reporting Workflow',
    requirement: 'Formalized incident response plan enforcing mandatory initial reporting of 20 designated cybersecurity incident types to CERT-In within 6 hours.',
    evidenceNeeded: 'Incident Response Plan (IRP) citing incident@cert-in.org.in and simulation records',
    severity: 'Critical'
  },
  {
    id: 'inc_logs_180d',
    pillar: 'Incident & CERT-In',
    frameworks: ['CERT-In Directions 2022'],
    title: '180-Day ICT Logs Retention with NPL NTP Sync',
    requirement: 'Secure retention of all firewall, server, and application logs within Indian jurisdiction for 180 consecutive rolling days synchronized with NPL-India NTP.',
    evidenceNeeded: 'NTP chrony config pointing to time.nplindia.org and S3 WORM retention bucket policy',
    severity: 'Critical'
  },
  {
    id: 'vendor_right_audit',
    pillar: 'Third-Party Risk',
    frameworks: ['RBI Outsourcing 2023', 'ISO 27001'],
    title: 'Unrestricted Right-to-Audit in Vendor Contracts',
    requirement: 'All third-party SaaS and outsourcing contracts contain clauses granting the enterprise and regulatory auditors unrestricted audit inspection rights.',
    evidenceNeeded: 'Executed Master Service Agreements (MSAs) highlighting audit clauses',
    severity: 'High'
  }
];

export default function ComplianceAuditChecklist() {
  const [controlStatus, setControlStatus] = useState<Record<string, 'compliant' | 'non_compliant' | 'in_progress'>>(() => {
    const init: Record<string, 'compliant' | 'non_compliant' | 'in_progress'> = {};
    AUDIT_CHECKLIST_ITEMS.forEach(i => {
      init[i.id] = 'in_progress';
    });
    return init;
  });

  const [frameworkFilter, setFrameworkFilter] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    let compliant = 0;
    let gaps = 0;
    let pending = 0;
    let criticalGaps = 0;

    AUDIT_CHECKLIST_ITEMS.forEach(i => {
      const s = controlStatus[i.id];
      if (s === 'compliant') compliant++;
      else if (s === 'non_compliant') {
        gaps++;
        if (i.severity === 'Critical') criticalGaps++;
      } else pending++;
    });

    const score = Math.round((compliant / AUDIT_CHECKLIST_ITEMS.length) * 100);
    return { compliant, gaps, pending, criticalGaps, score };
  }, [controlStatus]);

  const filteredItems = useMemo(() => {
    if (frameworkFilter === 'All') return AUDIT_CHECKLIST_ITEMS;
    return AUDIT_CHECKLIST_ITEMS.filter(i =>
      i.frameworks.some(f => f.toLowerCase().includes(frameworkFilter.toLowerCase()))
    );
  }, [frameworkFilter]);

  const handleCopyReport = () => {
    const text = `=====================================================
ENTERPRISE UNIFIED COMPLIANCE AUDIT WORKPAPER
ISO 27001 | CERT-In | DPDP Act 2023 | RBI MD-IT
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Compliance Readiness: ${stats.score}% (${stats.compliant}/${AUDIT_CHECKLIST_ITEMS.length} Controls Met)
Critical Audit Gaps: ${stats.criticalGaps}
Controls In Progress: ${stats.pending}

AUDIT FINDINGS BY CONTROL:
${AUDIT_CHECKLIST_ITEMS.map(i => `[${controlStatus[i.id].toUpperCase()}] ${i.title}
- Frameworks: ${i.frameworks.join(', ')} | Severity: ${i.severity}
- Requirement: ${i.requirement}
- Mandatory Evidence: ${i.evidenceNeeded}`).join('\n\n')}
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const text = `=====================================================
ENTERPRISE UNIFIED COMPLIANCE AUDIT WORKPAPER
ISO 27001 | CERT-In | DPDP Act 2023 | RBI MD-IT
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Compliance Readiness: ${stats.score}% (${stats.compliant}/${AUDIT_CHECKLIST_ITEMS.length} Controls Met)
Critical Audit Gaps: ${stats.criticalGaps}
Controls In Progress: ${stats.pending}

AUDIT FINDINGS BY CONTROL:
${AUDIT_CHECKLIST_ITEMS.map(i => `[${controlStatus[i.id].toUpperCase()}] ${i.title}
- Frameworks: ${i.frameworks.join(', ')} | Severity: ${i.severity}
- Requirement: ${i.requirement}
- Mandatory Evidence: ${i.evidenceNeeded}`).join('\n\n')}
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Unified_Compliance_Audit_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Enterprise Unified Compliance Audit Checklist
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Audit internal controls against ISO 27001:2022, CERT-In Directions 2022, DPDP Act 2023, and RBI Master Direction on IT.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Multi-Framework Unified</span>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Compliance Readiness</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.score}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                stats.score >= 80 ? 'bg-purple-500' : stats.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${stats.score}%` }}
            />
          </div>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Controls Met</span>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            {stats.compliant} / {AUDIT_CHECKLIST_ITEMS.length}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Verified In Place</span>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Critical Gaps</span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5" />
            {stats.criticalGaps}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Statutory Non-Compliance</span>
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

      {/* Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'ISO 27001', 'CERT-In', 'DPDP', 'RBI'].map(f => (
            <button
              key={f}
              onClick={() => setFrameworkFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                frameworkFilter === f
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Workpaper'}
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download Report
          </button>
        </div>
      </div>

      {/* Checklist Cards */}
      <div className="space-y-3">
        {filteredItems.map(item => {
          const currentStatus = controlStatus[item.id];
          return (
            <div
              key={item.id}
              className={`saas-card p-4 rounded-xl border transition-all ${
                currentStatus === 'compliant'
                  ? 'border-purple-500/30 bg-purple-500/5'
                  : currentStatus === 'non_compliant'
                  ? 'border-rose-500/30 bg-rose-500/5'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.frameworks.map(f => (
                      <span
                        key={f}
                        className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded"
                      >
                        {f}
                      </span>
                    ))}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        item.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.severity} Risk
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{item.pillar}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
                    {item.requirement}
                  </p>

                  <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
                    <strong className="text-slate-700 dark:text-slate-300">Mandatory Evidence:</strong>
                    <span>{item.evidenceNeeded}</span>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
                  <button
                    onClick={() => setControlStatus(prev => ({ ...prev, [item.id]: 'compliant' }))}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                      currentStatus === 'compliant'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Compliant
                  </button>
                  <button
                    onClick={() => setControlStatus(prev => ({ ...prev, [item.id]: 'in_progress' }))}
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
                    onClick={() => setControlStatus(prev => ({ ...prev, [item.id]: 'non_compliant' }))}
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
  );
}
