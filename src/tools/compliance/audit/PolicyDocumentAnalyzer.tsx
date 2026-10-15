import { useState, useMemo } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';

interface PolicyClauseCheck {
  id: string;
  name: string;
  statutoryImportance: string;
  regexList: RegExp[];
  boilerplateSnippet: string;
}

const MANDATORY_CLAUSES: PolicyClauseCheck[] = [
  {
    id: 'doc_control',
    name: 'Version Control & Metadata Header',
    statutoryImportance: 'Mandatory under ISO 27001 Clause 7.5 to demonstrate document lifecycle control.',
    regexList: [/version\s*[:\d]/i, /effective\s*date/i, /document\s*owner/i],
    boilerplateSnippet: `DOCUMENT CONTROL & VERSION METADATA
Document Title: Enterprise Information Security Policy
Version: 4.2 | Classification: Confidential
Effective Date: 2024-04-01 | Review Cadence: Annual
Approved By: Board IT Strategy Committee`
  },
  {
    id: 'board_approval',
    name: 'Board / Executive Leadership Approval Statement',
    statutoryImportance: 'Required under RBI MD-IT 2023 Section 5 and ISO 27001 leadership commitment.',
    regexList: [/board\s*of\s*directors/i, /executive\s*management/i, /ciso\s*approval/i, /approved\s*by/i],
    boilerplateSnippet: `GOVERNANCE & LEADERSHIP APPROVAL
This policy has been formally reviewed by the Chief Information Security Officer (CISO) and approved by the Board IT Strategy Committee. Compliance is mandatory across all business units.`
  },
  {
    id: 'scope_app',
    name: 'Clear Scope & Applicability Statement',
    statutoryImportance: 'Defines the operational perimeter across full-time employees, contractors, and third-party vendors.',
    regexList: [/scope/i, /applicability/i, /all\s*employees/i, /third-party/i],
    boilerplateSnippet: `SCOPE & APPLICABILITY
This policy applies to all full-time employees, contractual personnel, interns, vendors, and consultants accessing organizational IT assets, networks, or digital personal data.`
  },
  {
    id: 'statutory_ref',
    name: 'Statutory & Regulatory Citations (DPDP / IT Act / RBI)',
    statutoryImportance: 'Establishes legal alignment with Indian cybersecurity and data protection legislation.',
    regexList: [/dpdp/i, /information\s*technology\s*act/i, /rbi/i, /cert-in/i, /iso\s*27001/i],
    boilerplateSnippet: `STATUTORY & REGULATORY ALIGNMENT
This policy is drafted in strict adherence to the Digital Personal Data Protection (DPDP) Act 2023, Information Technology Act 2000, CERT-In Directions 2022, and the RBI Master Direction on IT Governance 2023.`
  },
  {
    id: 'disciplinary',
    name: 'Enforcement & Disciplinary Actions',
    statutoryImportance: 'Mandatory under labor laws and information security frameworks to ensure enforceability.',
    regexList: [/disciplinary\s*action/i, /termination/i, /violation/i, /non-compliance/i],
    boilerplateSnippet: `ENFORCEMENT & DISCIPLINARY CONSEQUENCES
Any willful violation or negligence regarding this policy shall result in disciplinary action up to and including immediate termination of employment/contract, legal prosecution, and claims for statutory damages.`
  },
  {
    id: 'annual_review',
    name: 'Annual Review & Audit Cadence',
    statutoryImportance: 'Prevents policy dormancy as mandated by CERT-In and RBI cyber inspection directions.',
    regexList: [/annual\s*review/i, /reviewed\s*at\s*least\s*annually/i, /periodic\s*audit/i],
    boilerplateSnippet: `PERIODIC REVIEW & AUDIT
This policy shall be formally reviewed at least annually, or immediately following significant architectural changes or regulatory circular notifications from regulatory authorities.`
  }
];

const SAMPLE_POLICY_TEXT = `ENTERPRISE INFORMATION SECURITY POLICY
Version 3.1 | Effective Date: April 2024
Document Owner: CISO Office

1. SCOPE AND APPLICABILITY
This policy applies to all employees, contractors, and third-party partners accessing company systems.

2. STATUTORY ALIGNMENT
Our controls adhere to ISO 27001:2022 and the Digital Personal Data Protection (DPDP) Act 2023.

3. APPROVAL
Approved by the Board of Directors on 15th April 2024.

4. ENFORCEMENT
Any willful non-compliance will lead to disciplinary action and termination.`;

export default function PolicyDocumentAnalyzer() {
  const [policyText, setPolicyText] = useState<string>(SAMPLE_POLICY_TEXT);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Analysis Engine
  const analysis = useMemo(() => {
    let matchedCount = 0;
    const clauseResults = MANDATORY_CLAUSES.map(clause => {
      const isPresent = clause.regexList.some(r => r.test(policyText));
      if (isPresent) matchedCount++;
      return {
        ...clause,
        isPresent
      };
    });

    const score = Math.round((matchedCount / MANDATORY_CLAUSES.length) * 100);
    return { clauseResults, score, matchedCount };
  }, [policyText]);

  const handleCopySnippet = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Statutory Policy Completeness & Mandatory Clause Verifier
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Audit internal corporate policies for mandatory statutory clauses, version control headers, and board approval statements.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>ISO 27001 & DPDP Audit</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Text Area (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Policy Document Text
              </h3>
              <button
                onClick={() => setPolicyText(SAMPLE_POLICY_TEXT)}
                className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
              >
                Load Sample Policy
              </button>
            </div>

            <textarea
              value={policyText}
              onChange={e => setPolicyText(e.target.value)}
              rows={15}
              placeholder="Paste internal policy text (InfoSec, Privacy, AUP, IRP)..."
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: Clause Audit Results & Boilerplates (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card p-6 rounded-xl border border-purple-500/20 bg-purple-500/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Policy Health Score
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  analysis.score >= 80
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : analysis.score >= 50
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {analysis.matchedCount} / {MANDATORY_CLAUSES.length} Mandatory Clauses
              </span>
            </div>

            <div>
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                {analysis.score}%
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    analysis.score >= 80 ? 'bg-emerald-500' : analysis.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Clauses List */}
          <div className="space-y-3">
            {analysis.clauseResults.map(clause => (
              <div
                key={clause.id}
                className={`saas-card p-4 rounded-xl border text-xs transition-all ${
                  clause.isPresent
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-rose-500/30 bg-rose-500/5'
                } space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {clause.isPresent ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {clause.name}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      clause.isPresent ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950' : 'text-rose-700 bg-rose-100 dark:bg-rose-950'
                    }`}
                  >
                    {clause.isPresent ? 'Found' : 'Missing'}
                  </span>
                </div>

                <p className="text-slate-500 text-[11px]">
                  {clause.statutoryImportance}
                </p>

                {!clause.isPresent && (
                  <div className="pt-1">
                    <button
                      onClick={() => handleCopySnippet(clause.boilerplateSnippet, clause.id)}
                      className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
                    >
                      {copiedSnippet === clause.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedSnippet === clause.id ? 'Copied Boilerplate' : 'Copy Recommended Boilerplate Clause'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
