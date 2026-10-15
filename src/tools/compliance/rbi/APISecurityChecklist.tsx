import { useState, useMemo } from 'react';
import {
  Code2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Lock,
  FileText,
  Copy,
  Check,
  Zap,
  Download
} from 'lucide-react';

interface ApiControl {
  id: string;
  pillar: 'Authentication & mTLS' | 'Payload Encryption' | 'Rate Limiting & WAF' | 'Logging & Secrets';
  title: string;
  requirement: string;
  statutoryRef: string;
  severity: 'Critical' | 'High' | 'Medium';
}

const API_CONTROLS: ApiControl[] = [
  {
    id: 'api_mtls',
    pillar: 'Authentication & mTLS',
    title: 'Mutual TLS (mTLS) 1.2+ for Partner Gateways',
    requirement: 'All communication between Regulated Entities and FinTech / LSP API gateways must enforce two-way mutual TLS using SHA-256 certificates from certified CAs.',
    statutoryRef: 'RBI MD-IT Governance 2023 Sec 12',
    severity: 'Critical'
  },
  {
    id: 'api_oauth',
    pillar: 'Authentication & mTLS',
    title: 'OAuth 2.0 with PKCE & Ephemeral JWTs',
    requirement: 'API authentication must use OAuth 2.0 with short-lived access tokens (max 15 mins) and cryptographically signed JWTs verifying audience and issuer claims.',
    statutoryRef: 'RBI MD-IT Governance 2023 Sec 14',
    severity: 'Critical'
  },
  {
    id: 'api_hmac',
    pillar: 'Payload Encryption',
    title: 'Cryptographic Payload Signing (HMAC-SHA256 / RSA)',
    requirement: 'Every financial API request and response payload must include a tamper-proof digital signature header verified before processing to prevent replay and alteration.',
    statutoryRef: 'NPCI UPI API Guidelines & RBI MD-IT',
    severity: 'Critical'
  },
  {
    id: 'api_fle',
    pillar: 'Payload Encryption',
    title: 'Field-Level Encryption (FLE) for Sensitive PII',
    requirement: 'Highly sensitive financial attributes (bank account numbers, PAN, KYC tokens) must be encrypted using AES-GCM-256 before insertion into JSON payloads.',
    statutoryRef: 'Account Aggregator ReBIT Specs',
    severity: 'High'
  },
  {
    id: 'api_ratelimit',
    pillar: 'Rate Limiting & WAF',
    title: 'API Rate Limiting, Throttling & DDoS Defense',
    requirement: 'API Gateways must enforce token-bucket rate limits per client ID and IP address to mitigate brute-force and Denial-of-Service attacks.',
    statutoryRef: 'RBI Cyber Security Framework Section 4.2',
    severity: 'High'
  },
  {
    id: 'api_owasp',
    pillar: 'Rate Limiting & WAF',
    title: 'OWASP API Security Top 10 Active Controls',
    requirement: 'Automated protection against Broken Object Level Authorization (BOLA), mass assignment, SQL/NoSQL injection, and SSRF in API input schemas.',
    statutoryRef: 'RBI MD-IT Governance Sec 16',
    severity: 'Critical'
  },
  {
    id: 'api_logmask',
    pillar: 'Logging & Secrets',
    title: 'Zero Storage of Secrets & Passwords in Logs',
    requirement: 'Gateway access logs and microservice traces must strictly redact passwords, PINs, CVV, OTPs, and private keys using automated log sanitization pipelines.',
    statutoryRef: 'RBI MD-DPSC Section 24',
    severity: 'Critical'
  },
  {
    id: 'api_key_rot',
    pillar: 'Logging & Secrets',
    title: 'Mandatory 90-Day API Secret Key Rotation',
    requirement: 'Production API keys, webhook signing secrets, and service account tokens must undergo mandatory rotation every 90 days with zero-downtime dual-key support.',
    statutoryRef: 'RBI MD-IT Governance Sec 19',
    severity: 'High'
  }
];

export default function APISecurityChecklist() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'hmac' | 'report'>('checklist');
  const [controlStatus, setControlStatus] = useState<Record<string, 'compliant' | 'non_compliant' | 'in_progress'>>(() => {
    const init: Record<string, 'compliant' | 'non_compliant' | 'in_progress'> = {};
    API_CONTROLS.forEach(c => {
      init[c.id] = 'in_progress';
    });
    return init;
  });

  const [pillarFilter, setPillarFilter] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  // Live HMAC Generator State
  const [hmacSecret, setHmacSecret] = useState<string>('rbi_secret_key_demo_2024');
  const [hmacPayload, setHmacPayload] = useState<string>(
    JSON.stringify(
      {
        txnId: 'TXN-982310-IND',
        timestamp: Math.floor(Date.now() / 1000),
        amount: 25000.0,
        payerVpa: 'payer@bank',
        payeeVpa: 'merchant@fintech'
      },
      null,
      2
    )
  );
  const [generatedHmac, setGeneratedHmac] = useState<string>('');
  const [isSigning, setIsSigning] = useState(false);

  const stats = useMemo(() => {
    let compliant = 0;
    let gaps = 0;
    let pending = 0;
    let criticalGaps = 0;

    API_CONTROLS.forEach(c => {
      const s = controlStatus[c.id];
      if (s === 'compliant') compliant++;
      else if (s === 'non_compliant') {
        gaps++;
        if (c.severity === 'Critical') criticalGaps++;
      } else pending++;
    });

    const score = Math.round((compliant / API_CONTROLS.length) * 100);
    return { compliant, gaps, pending, criticalGaps, score };
  }, [controlStatus]);

  const filteredControls = useMemo(() => {
    if (pillarFilter === 'All') return API_CONTROLS;
    return API_CONTROLS.filter(c => c.pillar === pillarFilter);
  }, [pillarFilter]);

  // Compute HMAC using Browser SubtleCrypto
  const handleComputeHmac = async () => {
    try {
      setIsSigning(true);
      const enc = new TextEncoder();
      const keyData = enc.encode(hmacSecret);
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const payloadData = enc.encode(hmacPayload);
      const signature = await crypto.subtle.sign('HMAC', key, payloadData);
      const hashArray = Array.from(new Uint8Array(signature));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setGeneratedHmac(hashHex);
    } catch (err) {
      console.error(err);
      setGeneratedHmac('Error computing HMAC signature');
    } finally {
      setIsSigning(false);
    }
  };

  const handleCopyReport = () => {
    const text = `=====================================================
RBI API SECURITY & FINTECH INTEGRATION AUDIT
Master Direction on IT Governance, Risk & Controls, 2023
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall API Security Score: ${stats.score}% (${stats.compliant}/${API_CONTROLS.length} Controls Met)
Critical Gaps: ${stats.criticalGaps}
Under Review: ${stats.pending}

AUDITED DOMAINS:
- Authentication & Mutual TLS (mTLS 1.2+, OAuth 2.0 PKCE, Signed JWTs)
- Payload Security (Cryptographic HMAC-SHA256 Signing, AES Field-Level Encryption)
- Edge Protection (Token-Bucket Rate Limiting, OWASP API Top 10 WAF)
- Secrets Hygiene (Log Sanitization Pipeline, 90-Day Key Rotation)

DETAILED AUDIT FINDINGS:
${API_CONTROLS.map(c => `[${controlStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.severity}`).join('\n')}
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReport = () => {
    const text = `=====================================================
RBI API SECURITY & FINTECH INTEGRATION AUDIT
Master Direction on IT Governance, Risk & Controls, 2023
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall API Security Score: ${stats.score}% (${stats.compliant}/${API_CONTROLS.length} Controls Met)
Critical Gaps: ${stats.criticalGaps}
Under Review: ${stats.pending}

AUDITED DOMAINS:
- Authentication & Mutual TLS (mTLS 1.2+, OAuth 2.0 PKCE, Signed JWTs)
- Payload Security (Cryptographic HMAC-SHA256 Signing, AES Field-Level Encryption)
- Edge Protection (Token-Bucket Rate Limiting, OWASP API Top 10 WAF)
- Secrets Hygiene (Log Sanitization Pipeline, 90-Day Key Rotation)

DETAILED AUDIT FINDINGS:
${API_CONTROLS.map(c => `[${controlStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.severity}`).join('\n')}
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `API_Security_Audit_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              RBI API Security & FinTech Gateway Checklist
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Audit Open Banking, UPI switches, and Account Aggregator APIs against RBI MD-IT 2023 & generate client-side HMAC signatures.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Local WebCrypto Sandbox</span>
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
          API Security Controls
        </button>
        <button
          onClick={() => setActiveTab('hmac')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'hmac'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          HMAC-SHA256 Payload Signer
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
              <span className="text-xs text-slate-500 font-medium">API Security Index</span>
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
              <span className="text-xs text-slate-500 font-medium">Controls Implemented</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" />
                {stats.compliant} / {API_CONTROLS.length}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Verified In Place</span>
            </div>

            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Critical Gaps</span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5" />
                {stats.criticalGaps}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Immediate Vulnerability</span>
            </div>

            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">In Progress</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
                <Clock className="w-5 h-5" />
                {stats.pending}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Pending Verification</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Authentication & mTLS', 'Payload Encryption', 'Rate Limiting & WAF', 'Logging & Secrets'].map(p => (
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

      {/* TAB 2: HMAC SIGNER */}
      {activeTab === 'hmac' && (
        <div className="saas-card p-6 rounded-xl space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Client-Side HMAC-SHA256 Payload Signature Generator
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Verify non-repudiation and anti-tamper signature headers required across NPCI UPI switches, Account Aggregators, and RBI regulated partner gateways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Shared API Secret Key (Never sent over network)
                </label>
                <input
                  type="text"
                  value={hmacSecret}
                  onChange={e => setHmacSecret(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Raw JSON Request Payload
                </label>
                <textarea
                  value={hmacPayload}
                  onChange={e => setHmacPayload(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <button
                onClick={handleComputeHmac}
                disabled={isSigning}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Zap className="w-4 h-4" />
                {isSigning ? 'Computing Signature...' : 'Generate HMAC-SHA256 Signature'}
              </button>
            </div>

            {/* Signature Output */}
            <div className="space-y-4">
              <div className="saas-card p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Computed X-Signature-SHA256 Header
                </span>
                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg break-all select-all border border-slate-800">
                  {generatedHmac || 'Click "Generate HMAC-SHA256 Signature" to test.'}
                </div>
                <p className="text-[11px] text-slate-500">
                  This 64-character hexadecimal digest matches standard Python `hmac.new(secret, payload, hashlib.sha256).hexdigest()` and Node.js `crypto.createHmac`.
                </p>
              </div>

              <div className="saas-card p-4 rounded-xl text-xs space-y-2 text-slate-600 dark:text-slate-400">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Regulatory Mandate
                </div>
                <p>
                  RBI Master Direction on IT Governance Section 12 explicitly dictates that payload checksums or cryptographic signatures must be computed on both ends to detect data modification attacks and satisfy non-repudiation standards.
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
                API Security & FinTech Governance Audit Workpaper
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Formal workpaper for technical compliance reviews, architecture committees, and regulatory filings.
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
RBI API SECURITY & FINTECH INTEGRATION AUDIT
Master Direction on IT Governance, Risk & Controls, 2023
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall API Security Score: ${stats.score}% (${stats.compliant}/${API_CONTROLS.length} Controls Met)
Critical Gaps: ${stats.criticalGaps}
Under Review: ${stats.pending}

AUDITED DOMAINS:
- Authentication & Mutual TLS (mTLS 1.2+, OAuth 2.0 PKCE, Signed JWTs)
- Payload Security (Cryptographic HMAC-SHA256 Signing, AES Field-Level Encryption)
- Edge Protection (Token-Bucket Rate Limiting, OWASP API Top 10 WAF)
- Secrets Hygiene (Log Sanitization Pipeline, 90-Day Key Rotation)

DETAILED AUDIT FINDINGS:
${API_CONTROLS.map(c => `[${controlStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.severity}`).join('\n')}
=====================================================`}
          </div>
        </div>
      )}
    </div>
  );
}
