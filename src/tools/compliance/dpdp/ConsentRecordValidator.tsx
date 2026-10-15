import { useState, useMemo } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sparkles,
  Shield,
  Code
} from 'lucide-react';

interface ConsentArtifact {
  consent_id: string;
  data_principal_id: string;
  data_fiduciary: string;
  timestamp: string;
  purposes: {
    purpose_id: string;
    description: string;
    is_essential: boolean;
    consented: boolean;
  }[];
  language: string;
  notice_version: string;
  withdrawal_mechanism: {
    enabled: boolean;
    portal_url?: string;
    token?: string;
  };
  dpo_details: {
    name: string;
    email: string;
    address_in_india: boolean;
  };
  has_pre_ticked_boxes: boolean;
  cryptographic_hash?: string;
}

const SAMPLE_VALID_CONSENT: ConsentArtifact = {
  consent_id: "CNS-2026-9812401",
  data_principal_id: "DP-IND-882190",
  data_fiduciary: "Bharat FinTech Solutions Pvt Ltd",
  timestamp: "2026-10-14T10:45:00.000Z",
  purposes: [
    {
      purpose_id: "PURP_01",
      description: "Credit underwriting and verification via authorized credit bureaus",
      is_essential: true,
      consented: true
    },
    {
      purpose_id: "PURP_02",
      description: "Sending monthly transaction statements and statutory regulatory notices via email/SMS",
      is_essential: true,
      consented: true
    },
    {
      purpose_id: "PURP_03",
      description: "Personalized marketing offers and third-party loan product updates",
      is_essential: false,
      consented: false
    }
  ],
  language: "hi-IN", // Hindi (Eighth Schedule language)
  notice_version: "v2.4",
  withdrawal_mechanism: {
    enabled: true,
    portal_url: "https://bharatfintech.example.in/privacy/consent/withdraw",
    token: "wth_token_77189a8c"
  },
  dpo_details: {
    name: "Vikram Malhotra",
    email: "dpo@bharatfintech.example.in",
    address_in_india: true
  },
  has_pre_ticked_boxes: false,
  cryptographic_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
};

export default function ConsentRecordValidator() {
  const [inputJson, setInputJson] = useState<string>(JSON.stringify(SAMPLE_VALID_CONSENT, null, 2));
  const [copied, setCopied] = useState<boolean>(false);

  const parsed = useMemo(() => {
    try {
      const obj = JSON.parse(inputJson);
      return { success: true, data: obj as ConsentArtifact, error: null };
    } catch (e: any) {
      return { success: false, data: null, error: e.message };
    }
  }, [inputJson]);

  // Validation Checks
  const validationResults = useMemo(() => {
    if (!parsed.success || !parsed.data) return null;
    const d = parsed.data;

    const checks = [
      {
        id: 'c1_notice',
        title: 'Section 5 Notice Version & Identifier',
        passed: Boolean(d.notice_version && d.consent_id),
        details: d.notice_version ? `Notice ${d.notice_version} tracked under ${d.consent_id}` : 'Missing notice version identifier',
        severity: 'High'
      },
      {
        id: 'c2_unbundled',
        title: 'Unbundled & Itemized Purposes (Section 6(1))',
        passed: Array.isArray(d.purposes) && d.purposes.length > 0 && d.purposes.every(p => p.description && p.purpose_id),
        details: Array.isArray(d.purposes) ? `${d.purposes.length} distinct processing purposes itemized` : 'Purposes not specified as itemized array',
        severity: 'Critical'
      },
      {
        id: 'c3_dark_patterns',
        title: 'Zero Pre-Ticked Checkboxes (No Forced Consent)',
        passed: d.has_pre_ticked_boxes === false,
        details: d.has_pre_ticked_boxes === false ? 'Affirmative user action confirmed (no pre-selected boxes)' : 'Violation: Pre-ticked or forced consent detected',
        severity: 'Critical'
      },
      {
        id: 'c4_withdrawal',
        title: 'Withdrawal Mechanism with Equal Ease (Section 6(4))',
        passed: Boolean(d.withdrawal_mechanism?.enabled && (d.withdrawal_mechanism.portal_url || d.withdrawal_mechanism.token)),
        details: d.withdrawal_mechanism?.enabled ? 'Active withdrawal portal / API token present' : 'Missing statutory consent revocation workflow',
        severity: 'Critical'
      },
      {
        id: 'c5_dpo',
        title: 'Data Protection Officer (DPO) Disclosures (Section 13)',
        passed: Boolean(d.dpo_details?.email && d.dpo_details?.name && d.dpo_details?.address_in_india),
        details: d.dpo_details?.email ? `DPO ${d.dpo_details.name} (Indian resident: ${d.dpo_details.address_in_india ? 'Yes' : 'No'})` : 'Missing DPO / Grievance Officer contact details',
        severity: 'High'
      },
      {
        id: 'c6_language',
        title: 'Eighth Schedule Constitutional Language (Section 5(3))',
        passed: Boolean(d.language),
        details: d.language ? `Delivered in language: ${d.language}` : 'Missing language tag',
        severity: 'Medium'
      },
      {
        id: 'c7_crypto',
        title: 'Cryptographic Audit Trail (Integrity Hash)',
        passed: Boolean(d.cryptographic_hash && d.cryptographic_hash.length >= 32),
        details: d.cryptographic_hash ? 'Tamper-evident cryptographic digest verified' : 'No cryptographic integrity checksum attached to record',
        severity: 'Medium'
      }
    ];

    const passedCount = checks.filter(c => c.passed).length;
    const totalCount = checks.length;
    const score = Math.round((passedCount / totalCount) * 100);

    return {
      checks,
      passedCount,
      totalCount,
      score,
      isFullyCompliant: score === 100
    };
  }, [parsed]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 border border-blue-500/20 dark:border-blue-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Consent Record & Section 5 Notice Validator
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  DPDP Act Sec 5 & 6
                </span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Validate consent tokens, notices, and audit artifacts against statutory mandates for unbundled purposes, dark pattern prevention, withdrawal mechanisms, and DPO appointments.
              </p>
            </div>
          </div>
          <button
            onClick={() => setInputJson(JSON.stringify(SAMPLE_VALID_CONSENT, null, 2))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Load Sample Consent Record
          </button>
        </div>
      </div>

      {/* Score Summary */}
      {validationResults && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Statutory Consent Validity
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{validationResults.score}% Score</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                validationResults.isFullyCompliant
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
              }`}>
                {validationResults.isFullyCompliant ? 'Statutorily Valid' : 'Compliance Gaps Found'}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500 sm:text-right font-medium">
            Passed <strong>{validationResults.passedCount}</strong> of <strong>{validationResults.totalCount}</strong> DPDP Section 5/6 obligations
          </div>
        </div>
      )}

      {/* Editor & Validation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: JSON Input */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-blue-500" />
                Consent Record Artifact (JSON)
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              rows={16}
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              className="w-full p-3.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {!parsed.success && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-mono">
                JSON Parse Error: {parsed.error}
              </div>
            )}
          </div>
        </div>

        {/* Right: Validation Checklist */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" />
            Statutory Verification Items
          </h3>

          {validationResults ? (
            <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
              {validationResults.checks.map((chk) => (
                <div
                  key={chk.id}
                  className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                    chk.passed
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                      : 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                  }`}
                >
                  <div className="mt-0.5">
                    {chk.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    )}
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {chk.title}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                        chk.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {chk.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {chk.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              Provide valid JSON on the left to run statutory validation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
