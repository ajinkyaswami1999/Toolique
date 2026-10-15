import { useState } from 'react';
import {
  ShieldCheck,
  Printer,
  Copy,
  Check,
  Award
} from 'lucide-react';

export default function AuditReportGenerator() {
  const [orgName, setOrgName] = useState('FinCorp Global Payments India Pvt Ltd');
  const [auditTitle, setAuditTitle] = useState('Annual Information Security & Regulatory Compliance Audit');
  const [leadAuditor, setLeadAuditor] = useState('Vikramaditya Sen, CISA, ISO 27001 Lead Auditor');
  const [auditPeriod, setAuditPeriod] = useState('FY 2024-2025 (H1 Audit)');
  const [auditOpinion, setAuditOpinion] = useState<'Unqualified' | 'Qualified' | 'Adverse'>('Qualified');

  // Finding counts
  const [criticalFindings, setCriticalFindings] = useState<number>(0);
  const [highFindings, setHighFindings] = useState<number>(2);
  const [mediumFindings, setMediumFindings] = useState<number>(5);
  const [lowFindings, setLowFindings] = useState<number>(8);

  const [executiveSummary, setExecutiveSummary] = useState<string>(
    'The audit evaluated organizational technical, physical, and administrative controls against the Digital Personal Data Protection (DPDP) Act 2023, RBI Master Direction on IT Governance 2023, and CERT-In Directions 2022. Overall control posture is mature; however, two High-priority findings regarding 90-day API key rotation and vendor right-to-audit amendments require immediate management remediation within 30 days.'
  );

  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReport = () => {
    const text = `=====================================================
EXECUTIVE AUDIT REPORT & REGULATORY ATTESTATION
Conducted in Accordance with ISO 19011 Audit Standards
=====================================================
Audit Title: ${auditTitle}
Organization: ${orgName}
Lead Auditor: ${leadAuditor}
Audit Period: ${auditPeriod}
Attestation Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}

OVERALL AUDIT OPINION: [${auditOpinion.toUpperCase()} OPINION]
- Unqualified: Controls operating effectively with negligible residual risk.
- Qualified: Controls operational with specific non-conformities under active remediation.
- Adverse: Pervasive statutory deficiencies requiring urgent regulatory disclosure.

EXECUTIVE SUMMARY:
${executiveSummary}

STATUTORY FINDINGS SUMMARY:
- Critical Findings: ${criticalFindings}
- High-Risk Findings: ${highFindings}
- Medium-Risk Findings: ${mediumFindings}
- Low-Risk Observations: ${lowFindings}

LEAD AUDITOR CERTIFICATION:
I hereby certify that the security controls and governance practices of ${orgName} were evaluated independently and objectively. The findings presented reflect the operational state during the audit period.

Signature: __________________________
(${leadAuditor})
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Executive Audit Report Builder & Attestation Studio
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Compile formal ISO 19011 compliant executive audit reports with lead auditor sign-offs, finding summaries, and printable layouts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>ISO 19011 Standardized</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="saas-card p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Audit Scope & Metadata
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Organization / Auditee Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Audit Report Title
                </label>
                <input
                  type="text"
                  value={auditTitle}
                  onChange={e => setAuditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Lead Auditor Name & Credentials
                  </label>
                  <input
                    type="text"
                    value={leadAuditor}
                    onChange={e => setLeadAuditor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Audit Period / Scope
                  </label>
                  <input
                    type="text"
                    value={auditPeriod}
                    onChange={e => setAuditPeriod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Overall Audit Opinion
                </label>
                <select
                  value={auditOpinion}
                  onChange={e => setAuditOpinion(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden font-semibold"
                >
                  <option value="Unqualified">Unqualified / Clean Opinion (Effective Controls)</option>
                  <option value="Qualified">Qualified Opinion (Minor Gaps under CAPA)</option>
                  <option value="Adverse">Adverse Opinion (Statutory Non-Compliance)</option>
                </select>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-rose-600 block mb-1">Critical</label>
                  <input
                    type="number"
                    value={criticalFindings}
                    onChange={e => setCriticalFindings(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-amber-600 block mb-1">High</label>
                  <input
                    type="number"
                    value={highFindings}
                    onChange={e => setHighFindings(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-blue-600 block mb-1">Medium</label>
                  <input
                    type="number"
                    value={mediumFindings}
                    onChange={e => setMediumFindings(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Low</label>
                  <input
                    type="number"
                    value={lowFindings}
                    onChange={e => setLowFindings(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Executive Summary Commentary
                </label>
                <textarea
                  value={executiveSummary}
                  onChange={e => setExecutiveSummary(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Print Ready Document Preview (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="saas-card p-6 rounded-xl border border-purple-500/30 bg-white dark:bg-slate-900 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                Official Audit Report Layout
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReport}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
              </div>
            </div>

            {/* Document Header */}
            <div className="space-y-1 text-center py-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {auditTitle}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {orgName} • {auditPeriod}
              </p>
            </div>

            {/* Opinion Badge */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-400">Audit Opinion:</span>
              <span
                className={`font-bold px-2.5 py-0.5 rounded ${
                  auditOpinion === 'Unqualified'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : auditOpinion === 'Qualified'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {auditOpinion} Opinion
              </span>
            </div>

            {/* Findings Counters */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
                <span className="text-[11px] text-rose-600 block">Critical</span>
                <span className="text-lg font-bold text-rose-700 dark:text-rose-400">{criticalFindings}</span>
              </div>
              <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <span className="text-[11px] text-amber-600 block">High</span>
                <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{highFindings}</span>
              </div>
              <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                <span className="text-[11px] text-blue-600 block">Medium</span>
                <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{mediumFindings}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500 block">Low</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{lowFindings}</span>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-1 text-xs">
              <strong className="text-slate-900 dark:text-white block">Executive Summary:</strong>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {executiveSummary}
              </p>
            </div>

            {/* Attestation Sign-off */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Lead Auditor:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{leadAuditor}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Attestation Date:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
