import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  CreditCard,
  Lock,
  FileText,
  Copy,
  Check,
  Zap,
  Download
} from 'lucide-react';

interface SecurityControl {
  id: string;
  domain: 'AFA & Tokenization' | 'Mobile App Security' | 'Session & Fraud' | 'Escrow & Settlement';
  title: string;
  requirement: string;
  statutoryRef: string;
  severity: 'Critical' | 'High' | 'Medium';
}

const DIGITAL_PAYMENT_CONTROLS: SecurityControl[] = [
  {
    id: 'ctrl_afa',
    domain: 'AFA & Tokenization',
    title: 'Mandatory Additional Factor of Authentication (AFA / 2FA)',
    requirement: 'All domestic payment transactions (cards, net banking, UPI, PPI) must enforce dynamic 2-factor authentication, with OTP/cryptographic token generated independently of card credentials.',
    statutoryRef: 'RBI MD-DPSC Section 15(1)',
    severity: 'Critical'
  },
  {
    id: 'ctrl_coft',
    domain: 'AFA & Tokenization',
    title: 'Card-on-File Tokenization (CoFT) Enforcement',
    requirement: 'Merchants and Payment Aggregators are strictly barred from storing actual card numbers (PAN), CVV, or card expiry. All stored cards must be surrogate network tokens issued by card networks.',
    statutoryRef: 'RBI CoFT Circular DPSS.CO.PD 2021',
    severity: 'Critical'
  },
  {
    id: 'ctrl_coft_guest',
    domain: 'AFA & Tokenization',
    title: 'Alternate Guest Checkout Tokenization',
    requirement: 'Guest checkouts must either tokenize via issuer/network or discard card details immediately upon transaction authorization without server caching.',
    statutoryRef: 'RBI Circular October 2023',
    severity: 'High'
  },
  {
    id: 'ctrl_app_root',
    domain: 'Mobile App Security',
    title: 'Root and Jailbreak Detection with App Termination',
    requirement: 'Payment applications must actively detect rooted or jailbroken operating environments, modified bootloaders, or debug modes, and instantly terminate execution.',
    statutoryRef: 'RBI MD-DPSC Section 27(1)',
    severity: 'Critical'
  },
  {
    id: 'ctrl_app_pinning',
    domain: 'Mobile App Security',
    title: 'SSL / TLS Certificate Pinning',
    requirement: 'Mobile apps must enforce SSL Pinning to prevent Man-in-the-Middle (MITM) proxy inspection or malicious certificate authority injection.',
    statutoryRef: 'RBI MD-DPSC Section 28',
    severity: 'Critical'
  },
  {
    id: 'ctrl_app_obfuscation',
    domain: 'Mobile App Security',
    title: 'Code Obfuscation & Anti-Tamper Packaging',
    requirement: 'Client binaries must employ robust code obfuscation, anti-repackaging checks, and runtime application self-protection (RASP) against reverse engineering.',
    statutoryRef: 'RBI MD-DPSC Section 29',
    severity: 'High'
  },
  {
    id: 'ctrl_sess_timeout',
    domain: 'Session & Fraud',
    title: '5-Minute Inactivity Auto-Logout',
    requirement: 'Web and mobile digital payment sessions must automatically terminate after an inactivity period of not more than 5 minutes.',
    statutoryRef: 'RBI MD-DPSC Section 21',
    severity: 'High'
  },
  {
    id: 'ctrl_sess_concurrent',
    domain: 'Session & Fraud',
    title: 'Concurrent Session Restriction & Device Binding',
    requirement: 'Payment applications must tie accounts to unique device hardware fingerprints and prevent concurrent authenticated logins across multiple devices.',
    statutoryRef: 'RBI MD-DPSC Section 23',
    severity: 'Critical'
  },
  {
    id: 'ctrl_fraud_velocity',
    domain: 'Session & Fraud',
    title: 'Real-time Risk-Based Authentication (RBA) & Velocity Checks',
    requirement: 'Transaction monitoring engines must analyze IP reputation, velocity spikes, unusual transaction values, and geographical anomalies before authorizing transactions.',
    statutoryRef: 'RBI MD-DPSC Section 17',
    severity: 'High'
  },
  {
    id: 'ctrl_cooling_off',
    domain: 'Session & Fraud',
    title: 'Payee Cooling-off Period & Cumulative Limits',
    requirement: 'Enforce a minimum cooling-off window (min 2 hours, standard 24 hours) for newly registered beneficiaries with capped initial transaction limits.',
    statutoryRef: 'RBI MD-DPSC Section 19',
    severity: 'Medium'
  },
  {
    id: 'ctrl_escrow_nodal',
    domain: 'Escrow & Settlement',
    title: 'Nodal / Escrow Account Segregation',
    requirement: 'Payment Aggregators (PAs) must maintain designated escrow accounts with Scheduled Commercial Banks, strictly separating merchant settlement funds from operating capital.',
    statutoryRef: 'RBI Guidelines on Regulation of PAs & PGs',
    severity: 'Critical'
  },
  {
    id: 'ctrl_settlement_tat',
    domain: 'Escrow & Settlement',
    title: 'Strict Merchant Settlement Turnaround (T+1 / T+2)',
    requirement: 'All authorized transactions must be settled to final merchant accounts within designated statutory SLA timelines without withholding funds.',
    statutoryRef: 'RBI PA/PG Directions Para 8',
    severity: 'High'
  }
];

export default function DigitalPaymentSecurityChecklist() {
  const [activeTab, setActiveTab] = useState<'checklist' | 'simulator' | 'report'>('checklist');
  const [controlStatus, setControlStatus] = useState<Record<string, 'compliant' | 'non_compliant' | 'in_progress'>>(() => {
    const init: Record<string, 'compliant' | 'non_compliant' | 'in_progress'> = {};
    DIGITAL_PAYMENT_CONTROLS.forEach(c => {
      init[c.id] = 'in_progress';
    });
    return init;
  });

  const [domainFilter, setDomainFilter] = useState<string>('All');
  const [copied, setCopied] = useState(false);

  // Threat Simulator State
  const [selectedThreat, setSelectedThreat] = useState<string>('mitm');

  const threatsData: Record<string, { title: string; desc: string; statutoryDefense: string; mandatoryControlId: string }> = {
    mitm: {
      title: 'Man-in-the-Middle (MITM) Network Interception',
      desc: 'An attacker intercepts public Wi-Fi traffic or installs an untrusted root CA to eavesdrop on payment packets.',
      statutoryDefense: 'SSL/TLS Certificate Pinning (Section 28) validates the pre-embedded public key fingerprint, instantly dropping tampered connections.',
      mandatoryControlId: 'ctrl_app_pinning'
    },
    root_compromise: {
      title: 'Rooted Device & Memory Hooking (Frida / Xposed)',
      desc: 'A compromised device with Superuser rights uses dynamic instrumentation to bypass biometric prompts or read in-memory OTPs.',
      statutoryDefense: 'Root/Jailbreak Detection (Section 27) detects su binaries and hook frameworks, terminating the app immediately.',
      mandatoryControlId: 'ctrl_app_root'
    },
    coft_leak: {
      title: 'Merchant Database SQL Injection & Card Dump',
      desc: 'Hackers exploit a SQL vulnerability in an e-commerce platform to extract saved customer payment information.',
      statutoryDefense: 'Card-on-File Tokenization (CoFT 2021) ensures the merchant database only contains surrogate non-decryptable tokens, leaving zero raw card numbers or CVV exposed.',
      mandatoryControlId: 'ctrl_coft'
    },
    sim_swap: {
      title: 'SIM Swap & Unauthorized Credential Takeover',
      desc: 'Fraudsters clone a victim’s SIM card to intercept SMS OTPs and initiate high-value funds transfer on a new phone.',
      statutoryDefense: 'Device Binding & Concurrent Login Prevention (Section 23) alongside Payee Cooling-Off prevents logins from unregistered hardware without multi-factor re-verification.',
      mandatoryControlId: 'ctrl_sess_concurrent'
    }
  };

  // Assessment Stats
  const stats = useMemo(() => {
    let compliant = 0;
    let gaps = 0;
    let inReview = 0;
    let criticalGaps = 0;

    DIGITAL_PAYMENT_CONTROLS.forEach(c => {
      const s = controlStatus[c.id];
      if (s === 'compliant') compliant++;
      else if (s === 'non_compliant') {
        gaps++;
        if (c.severity === 'Critical') criticalGaps++;
      } else inReview++;
    });

    const score = Math.round((compliant / DIGITAL_PAYMENT_CONTROLS.length) * 100);
    return { compliant, gaps, inReview, criticalGaps, score };
  }, [controlStatus]);

  const filteredControls = useMemo(() => {
    if (domainFilter === 'All') return DIGITAL_PAYMENT_CONTROLS;
    return DIGITAL_PAYMENT_CONTROLS.filter(c => c.domain === domainFilter);
  }, [domainFilter]);

  const handleCopyReport = () => {
    const text = `=====================================================
RBI DIGITAL PAYMENT SECURITY CONTROLS (MD-DPSC) AUDIT
Master Direction - Digital Payment Security Controls, 2021
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Security Posture Score: ${stats.score}% (${stats.compliant}/${DIGITAL_PAYMENT_CONTROLS.length} Controls Met)
Critical Vulnerabilities / Gaps: ${stats.criticalGaps}
In-Progress Remediation: ${stats.inReview}

STATUTORY SECURITY DOMAINS AUDITED:
1. AFA & Tokenization (AFA 2FA, Card-on-File Tokenization CoFT, Guest Checkout)
2. Mobile App Security (Root/Jailbreak Detection, SSL Pinning, Code Obfuscation)
3. Session & Fraud (5-Min Auto-Logout, Device Binding, RBA Velocity, Cooling-off)
4. Escrow & Settlement (Nodal Account Separation, Strict Settlement SLAs)

AUDIT FINDINGS BY CONTROL:
${DIGITAL_PAYMENT_CONTROLS.map(c => `[${controlStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.severity}`).join('\n')}
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadReport = () => {
    const text = `=====================================================
RBI DIGITAL PAYMENT SECURITY CONTROLS (MD-DPSC) AUDIT
Master Direction - Digital Payment Security Controls, 2021
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Security Posture Score: ${stats.score}% (${stats.compliant}/${DIGITAL_PAYMENT_CONTROLS.length} Controls Met)
Critical Vulnerabilities / Gaps: ${stats.criticalGaps}
In-Progress Remediation: ${stats.inReview}

STATUTORY SECURITY DOMAINS AUDITED:
1. AFA & Tokenization (AFA 2FA, Card-on-File Tokenization CoFT, Guest Checkout)
2. Mobile App Security (Root/Jailbreak Detection, SSL Pinning, Code Obfuscation)
3. Session & Fraud (5-Min Auto-Logout, Device Binding, RBA Velocity, Cooling-off)
4. Escrow & Settlement (Nodal Account Separation, Strict Settlement SLAs)

AUDIT FINDINGS BY CONTROL:
${DIGITAL_PAYMENT_CONTROLS.map(c => `[${controlStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.severity}`).join('\n')}
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Digital_Payment_Security_Audit_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              RBI Digital Payment Security Controls (MD-DPSC) Checklist
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Audit payment gateways, UPI switches, mobile banking apps, and card tokenization against RBI 2021 master directives.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Server Storage</span>
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
          <Lock className="w-4 h-4" />
          Security Controls Matrix
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'simulator'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          Threat & Defense Simulator
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
          {/* Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="saas-card p-4 rounded-xl">
              <span className="text-xs text-slate-500 font-medium">Payment Posture Score</span>
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
                {stats.compliant} / {DIGITAL_PAYMENT_CONTROLS.length}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Statutorily Verified</span>
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
              <span className="text-xs text-slate-500 font-medium">Under Implementation</span>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
                <Clock className="w-5 h-5" />
                {stats.inReview}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">Pending Verification</span>
            </div>
          </div>

          {/* Domain Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'AFA & Tokenization', 'Mobile App Security', 'Session & Fraud', 'Escrow & Settlement'].map(d => (
              <button
                key={d}
                onClick={() => setDomainFilter(d)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  domainFilter === d
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {d}
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
                            c.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {c.severity} Severity
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{c.domain}</span>
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

      {/* TAB 2: THREAT SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="saas-card p-6 rounded-xl space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Digital Payment Attack Vector & Statutory Defense Simulator
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Select real-world payment fraud vectors to inspect the corresponding mandatory RBI MD-DPSC technical defense mechanism.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Threat List */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Attack Vector Scenarios
              </label>
              {Object.entries(threatsData).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setSelectedThreat(key)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                    selectedThreat === key
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{data.title}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Defense Analysis */}
            <div className="md:col-span-2 space-y-4">
              <div className="saas-card p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Attack Mechanism
                  </span>
                  <span className="text-xs bg-rose-500/10 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded font-semibold">
                    Threat Scenario
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {threatsData[selectedThreat].title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {threatsData[selectedThreat].desc}
                </p>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Mandatory Statutory Countermeasure (RBI MD-DPSC)</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {threatsData[selectedThreat].statutoryDefense}
                  </p>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-500">Linked Statutory Control:</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      {DIGITAL_PAYMENT_CONTROLS.find(c => c.id === threatsData[selectedThreat].mandatoryControlId)?.title}
                    </span>
                  </div>
                </div>
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
                Digital Payment Security Audit Memorandum
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Formally formatted security posture evaluation for Information Security Committees and external CERT-In empanelled auditors.
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
RBI DIGITAL PAYMENT SECURITY CONTROLS (MD-DPSC) AUDIT
Master Direction - Digital Payment Security Controls, 2021
=====================================================
Audit Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Security Posture Score: ${stats.score}% (${stats.compliant}/${DIGITAL_PAYMENT_CONTROLS.length} Controls Met)
Critical Vulnerabilities / Gaps: ${stats.criticalGaps}
In-Progress Remediation: ${stats.inReview}

STATUTORY SECURITY DOMAINS AUDITED:
1. AFA & Tokenization (AFA 2FA, Card-on-File Tokenization CoFT, Guest Checkout)
2. Mobile App Security (Root/Jailbreak Detection, SSL Pinning, Code Obfuscation)
3. Session & Fraud (5-Min Auto-Logout, Device Binding, RBA Velocity, Cooling-off)
4. Escrow & Settlement (Nodal Account Separation, Strict Settlement SLAs)

AUDIT FINDINGS BY CONTROL:
${DIGITAL_PAYMENT_CONTROLS.map(c => `[${controlStatus[c.id].toUpperCase()}] ${c.title} (${c.statutoryRef}) - Severity: ${c.severity}`).join('\n')}
=====================================================`}
          </div>
        </div>
      )}
    </div>
  );
}
