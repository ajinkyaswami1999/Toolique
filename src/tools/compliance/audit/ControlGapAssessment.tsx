import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Download
} from 'lucide-react';

interface MaturityDomain {
  id: string;
  name: string;
  description: string;
  targetLevel: number; // 0 to 5
  currentLevel: number;
  compensatingControl: string;
}

const INITIAL_DOMAINS: MaturityDomain[] = [
  {
    id: 'dom_iam',
    name: 'Access Control & Privileged Access (PAM)',
    description: 'Hardware-backed MFA, JIT privilege elevation, session recording, and quarterly UAR.',
    targetLevel: 4,
    currentLevel: 2,
    compensatingControl: 'Enforce dual-custody approval on all database production jump hosts until full PAM is deployed.'
  },
  {
    id: 'dom_crypto',
    name: 'Data Encryption & Key Management (KMS)',
    description: 'FIPS 140-2 Level 3 HSM key management, field-level encryption, and automated 90-day key rotation.',
    targetLevel: 5,
    currentLevel: 3,
    compensatingControl: 'Implement cloud-native envelope encryption (AWS KMS / Azure Key Vault) with strict IAM policies.'
  },
  {
    id: 'dom_ir',
    name: 'Incident Response & 6-Hour Reporting',
    description: '24/7 SOC monitoring, automated playbooks, and 6-hour CERT-In incident reporting pipeline.',
    targetLevel: 4,
    currentLevel: 2,
    compensatingControl: 'Establish emergency on-call incident escalation phone tree and pre-filled email templates to CERT-In.'
  },
  {
    id: 'dom_vendor',
    name: 'Third-Party & Vendor Governance',
    description: 'Materiality classification, right-to-audit clauses, concentration risk monitoring, and exit escrow.',
    targetLevel: 4,
    currentLevel: 3,
    compensatingControl: 'Require SOC 2 Type II or ISO 27001 certificates for all Tier-1 SaaS vendors before annual renewal.'
  },
  {
    id: 'dom_bcp',
    name: 'Business Continuity & Disaster Recovery',
    description: 'Cross-region automated failover drills, RTO < 4 hours, and RPO < 15 minutes for critical banking services.',
    targetLevel: 4,
    currentLevel: 2,
    compensatingControl: 'Perform simulated database backup restoration drills bi-monthly to verify data integrity.'
  }
];

const MATURITY_LABELS = [
  'Level 0: Non-Existent',
  'Level 1: Initial / Ad-hoc',
  'Level 2: Repeatable',
  'Level 3: Defined SOP',
  'Level 4: Managed & Measured',
  'Level 5: Optimized / Automated'
];

export default function ControlGapAssessment() {
  const [domains, setDomains] = useState<MaturityDomain[]>(INITIAL_DOMAINS);
  const [copied, setCopied] = useState(false);

  const handleUpdateLevel = (id: string, newLevel: number) => {
    setDomains(prev =>
      prev.map(d => (d.id === id ? { ...d, currentLevel: newLevel } : d))
    );
  };

  const metrics = useMemo(() => {
    let totalCurrent = 0;
    let totalTarget = 0;
    let highGaps = 0;

    domains.forEach(d => {
      totalCurrent += d.currentLevel;
      totalTarget += d.targetLevel;
      if (d.targetLevel - d.currentLevel >= 2) highGaps++;
    });

    const averageCurrent = (totalCurrent / domains.length).toFixed(1);
    const averageTarget = (totalTarget / domains.length).toFixed(1);
    const overallMaturityScore = Math.round((totalCurrent / totalTarget) * 100);

    return { averageCurrent, averageTarget, overallMaturityScore, highGaps };
  }, [domains]);

  const handleCopyReport = () => {
    const text = `=====================================================
CONTROL MATURITY GAP ASSESSMENT & ROADMAP
CMMI / NIST CSF Maturity Evaluation
=====================================================
Assessment Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Maturity Fulfillment: ${metrics.overallMaturityScore}%
Average Current Maturity: Level ${metrics.averageCurrent} / 5.0 (Target: Level ${metrics.averageTarget})
High-Risk Deficient Domains: ${metrics.highGaps}

DOMAIN MATURITY BREAKDOWN:
${domains.map(d => `[${d.name}]
- Current Level: ${MATURITY_LABELS[d.currentLevel]}
- Target Level: ${MATURITY_LABELS[d.targetLevel]}
- Maturity Gap: -${d.targetLevel - d.currentLevel} Levels
- Recommended Compensating Control: ${d.compensatingControl}`).join('\n\n')}
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const text = `=====================================================
CONTROL MATURITY GAP ASSESSMENT & ROADMAP
CMMI / NIST CSF Maturity Evaluation
=====================================================
Assessment Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Maturity Fulfillment: ${metrics.overallMaturityScore}%
Average Current Maturity: Level ${metrics.averageCurrent} / 5.0 (Target: Level ${metrics.averageTarget})
High-Risk Deficient Domains: ${metrics.highGaps}

DOMAIN MATURITY BREAKDOWN:
${domains.map(d => `[${d.name}]
- Current Level: ${MATURITY_LABELS[d.currentLevel]}
- Target Level: ${MATURITY_LABELS[d.targetLevel]}
- Maturity Gap: -${d.targetLevel - d.currentLevel} Levels
- Recommended Compensating Control: ${d.compensatingControl}`).join('\n\n')}
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Control_Gap_Assessment_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Compliance & Security Control Gap Assessment
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Evaluate internal security controls across Level 0 to Level 5 maturity and generate targeted compensating controls.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>CMMI / NIST Model</span>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Maturity Target Met</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics.overallMaturityScore}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                metrics.overallMaturityScore >= 80 ? 'bg-purple-500' : 'bg-amber-500'
              }`}
              style={{ width: `${metrics.overallMaturityScore}%` }}
            />
          </div>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Average Current Level</span>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            Level {metrics.averageCurrent} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Baseline Maturity</span>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Target Level</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Level {metrics.averageTarget} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Enterprise Goal</span>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">High Deficit Gaps</span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5" />
            {metrics.highGaps}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Gap ≥ 2 Levels</span>
        </div>
      </div>

      {/* Domains Assessment List */}
      <div className="saas-card p-6 rounded-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Control Maturity Evaluation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust current operational maturity to calculate gap against statutory target.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Gap Analysis'}
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

        <div className="space-y-4">
          {domains.map(d => {
            const gap = d.targetLevel - d.currentLevel;
            return (
              <div
                key={d.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {d.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {d.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                        gap <= 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : gap === 1
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {gap <= 0 ? 'Target Met' : `Gap: -${gap} Levels`}
                    </span>
                  </div>
                </div>

                {/* Level Selector */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Current Maturity: {MATURITY_LABELS[d.currentLevel]}
                    </span>
                    <span className="text-slate-400">Target: Level {d.targetLevel}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[0, 1, 2, 3, 4, 5].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => handleUpdateLevel(d.id, lvl)}
                        className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          d.currentLevel === lvl
                            ? 'bg-purple-600 text-white shadow-xs'
                            : lvl <= d.targetLevel
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-400'
                        }`}
                      >
                        L{lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compensating Control */}
                {gap > 0 && (
                  <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-1">
                    <strong className="text-amber-800 dark:text-amber-300 block">
                      Recommended Compensating Control:
                    </strong>
                    <span className="text-slate-700 dark:text-slate-300">{d.compensatingControl}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
