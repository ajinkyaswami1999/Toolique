import { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  ShieldAlert,
  FileCheck,
  Copy,
  Check,
  Calendar,
  Terminal,
  FileText,
  HardDrive,
  Info,
  UploadCloud,
  AlertCircle
} from 'lucide-react';

/* =========================================================================
   CERT-IN 20 STATUTORY INCIDENT TYPES (ANNEXURE I OF DIRECTIONS 2022)
   ========================================================================= */

interface IncidentType {
  id: number;
  name: string;
  category: string;
  severity: 'Critical' | 'High' | 'Medium';
  description: string;
}

const CERT_IN_INCIDENTS: IncidentType[] = [
  { id: 1, name: 'Targeted scanning/probing of critical networks/systems', category: 'Reconnaissance', severity: 'High', description: 'Systematic scans or probes targeting sensitive infrastructure or ports.' },
  { id: 2, name: 'Compromise of critical systems/information', category: 'Breach', severity: 'Critical', description: 'Unauthorized compromise or takeover of core transactional or customer databases.' },
  { id: 3, name: 'Unauthorized access of IT systems/data', category: 'Unauthorized Access', severity: 'Critical', description: 'Breach of credential or identity management leading to illicit access.' },
  { id: 4, name: 'Defacement of website or intrusion into a website', category: 'Web Attack', severity: 'High', description: 'Alteration of visual or functional content on public/internal web portals.' },
  { id: 5, name: 'Malicious code attacks (Ransomware/Trojan/Virus/Spyware)', category: 'Malware', severity: 'Critical', description: 'Propagation of encryption lockers, cryptominers, or exfiltration trojans.' },
  { id: 6, name: 'Attack on servers such as Database, Mail and DNS', category: 'Infrastructure', severity: 'Critical', description: 'Hostile disruption or takeover of enterprise mail, DNS, or domain controllers.' },
  { id: 7, name: 'Identity theft, spoofing and phishing attacks', category: 'Social Engineering', severity: 'High', description: 'Brand spoofing, spear phishing, or executive credential harvesting.' },
  { id: 8, name: 'Denial of Service (DoS) and Distributed Denial of Service (DDoS)', category: 'Availability', severity: 'High', description: 'High-volume or layer-7 volumetric resource exhaustion attacks.' },
  { id: 9, name: 'Attacks on Critical Information Infrastructure (CII)', category: 'National Security', severity: 'Critical', description: 'Attacks targeting designated National Critical Information Infrastructure (NCIIPC).' },
  { id: 10, name: 'Data Breach or Data Leak', category: 'Data Privacy', severity: 'Critical', description: 'Unauthorized exposure, dump, or exfiltration of sensitive personal or commercial data.' },
  { id: 11, name: 'Attacks on Applications (E-Governance, E-Commerce, etc.)', category: 'Application', severity: 'High', description: 'Exploitation of OWASP Top 10 vulnerabilities (SQLi, SSRF, RCE) in web/mobile apps.' },
  { id: 12, name: 'Unauthorised access to Social Media accounts', category: 'Account Takeover', severity: 'Medium', description: 'Compromise of corporate or statutory entity official social media handles.' },
  { id: 13, name: 'Attacks on IoT devices, SCADA, ICS and Operational Technology (OT)', category: 'OT/IoT', severity: 'Critical', description: 'Exploitation of industrial control systems, telemetry, or smart meters.' },
  { id: 14, name: 'Attacks on digital payment systems (UPI, AePS, IMPS)', category: 'FinTech', severity: 'Critical', description: 'Tampering with banking switches, payment gateways, or settlement APIs.' },
  { id: 15, name: 'Attacks through malicious mobile applications', category: 'Mobile', severity: 'High', description: 'Rogue APK distribution, overlay trojans, or SMS interceptors.' },
  { id: 16, name: 'Fake/Forged malicious applications & packages', category: 'Supply Chain', severity: 'High', description: 'Typosquatting packages in NPM/PyPI or cloned corporate software.' },
  { id: 17, name: 'Suspicious activities affecting Blockchain/Smart Contracts', category: 'Web3/Crypto', severity: 'High', description: 'Re-entrancy exploits, bridge drainings, or unauthorized minting.' },
  { id: 18, name: 'Attacks on Cloud infrastructure and virtualization', category: 'Cloud', severity: 'Critical', description: 'IAM privilege escalation, metadata service SSRF, or exposed S3/Blob storage.' },
  { id: 19, name: 'Attacks on Artificial Intelligence (AI) and Machine Learning (ML) systems', category: 'AI Security', severity: 'High', description: 'Prompt injection, model inversion, or training data poisoning.' },
  { id: 20, name: 'Supply chain attacks affecting hardware/software vendors', category: 'Supply Chain', severity: 'Critical', description: 'Compromise of vendor build pipelines, CI/CD, or firmware update channels.' }
];

export default function CERTInIncidentCalculator() {
  const [activeTab, setActiveTab] = useState<'incident' | 'retention' | 'evidence'>('incident');

  // ===================== TAB 1: 6-HOUR CLOCK & REPORTING =====================
  const [detectionTime, setDetectionTime] = useState<string>(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${mins}`;
  });

  const [selectedIncidentId, setSelectedIncidentId] = useState<number>(5);
  const [orgName, setOrgName] = useState<string>('Acme Technologies Pvt Ltd');
  const [affectedSystems, setAffectedSystems] = useState<string>('Production AWS Elastic Kubernetes Service & Primary PostgreSQL Cluster');
  const [pocName, setPocName] = useState<string>('Rajesh Sharma, Chief Information Security Officer (CISO)');
  const [pocContact, setPocContact] = useState<string>('+91 98765 43210 / ciso@acme.example.in');
  const [remediationSteps, setRemediationSteps] = useState<string>('Isolated affected subnets, revoked compromised IAM credentials, initiated forensics dump.');
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);

  // Time calculations
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const incidentCalculation = useMemo(() => {
    const detected = new Date(detectionTime);
    if (isNaN(detected.getTime())) {
      return {
        isValid: false,
        detected: new Date(),
        deadline: new Date(),
        remainingMs: 0,
        elapsedMs: 0,
        isExpired: false,
        remainingHours: 0,
        remainingMins: 0,
        remainingSecs: 0,
        percentUsed: 0
      };
    }
    const deadline = new Date(detected.getTime() + 6 * 60 * 60 * 1000); // 6 hours
    const remainingMs = deadline.getTime() - currentTime.getTime();
    const elapsedMs = currentTime.getTime() - detected.getTime();
    const isExpired = remainingMs <= 0;

    const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
    const remainingMins = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)));
    const remainingSecs = Math.max(0, Math.floor((remainingMs % (1000 * 60)) / 1000));

    return {
      isValid: true,
      detected,
      deadline,
      remainingMs,
      elapsedMs,
      isExpired,
      remainingHours,
      remainingMins,
      remainingSecs,
      percentUsed: Math.min(100, Math.max(0, (elapsedMs / (6 * 3600 * 1000)) * 100))
    };
  }, [detectionTime, currentTime]);

  const selectedIncident = useMemo(() => {
    return CERT_IN_INCIDENTS.find(i => i.id === selectedIncidentId) || CERT_IN_INCIDENTS[0];
  }, [selectedIncidentId]);

  const incidentReportText = useMemo(() => {
    const detectedStr = incidentCalculation.isValid ? incidentCalculation.detected.toUTCString() + ' (' + incidentCalculation.detected.toLocaleString('en-IN') + ' IST)' : '';
    const deadlineStr = incidentCalculation.isValid ? incidentCalculation.deadline.toUTCString() + ' (' + incidentCalculation.deadline.toLocaleString('en-IN') + ' IST)' : '';

    return `To: incident@cert-in.org.in
Subject: [STATUTORY INCIDENT REPORT - 6 HOUR MANDATE] ${orgName} - ${selectedIncident.name}

INCIDENT REPORT UNDER SECTION 70B OF INFORMATION TECHNOLOGY ACT, 2000
READ WITH DIRECTION 20(3)/2022-CERT-IN DATED 28TH APRIL 2022

1. REPORTING ENTITY DETAILS:
   - Organization: ${orgName}
   - Designated Security POC: ${pocName}
   - Contact / 24x7 Hotline: ${pocContact}

2. INCIDENT CLASSIFICATION:
   - Annexure-I Category #${selectedIncident.id}: ${selectedIncident.name}
   - Threat Taxonomy: ${selectedIncident.category}
   - Statutory Severity: ${selectedIncident.severity}

3. TIMELINE & STATUTORY DEADLINE:
   - Incident Detected At: ${detectedStr}
   - Mandatory 6-Hour Reporting Deadline: ${deadlineStr}
   - Time Elapsed: ${incidentCalculation.isValid ? Math.floor(incidentCalculation.elapsedMs / 60000) : 0} minutes

4. AFFECTED INFRASTRUCTURE & ASSETS:
   - Systems Impacted: ${affectedSystems}

5. MITIGATION / IMMEDIATE CONTAINMENT ACTIONS:
   - ${remediationSteps}

6. EVIDENCE RETENTION & TIME SYNCHRONIZATION AFFIRMATION:
   - System logs are preserved in accordance with the mandatory 180-day retention directive.
   - All server clocks are synchronized with National Physical Laboratory (NPL-India) NTP stratum.

Reported by:
${pocName}
${orgName}`;
  }, [orgName, pocName, pocContact, selectedIncident, incidentCalculation, affectedSystems, remediationSteps]);

  // ===================== TAB 2: 180-DAY LOG RETENTION =====================
  const [logStartDate, setLogStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dailyLogSizeGB, setDailyLogSizeGB] = useState<number>(25);
  const [ntpServerChoice, setNtpServerChoice] = useState<'npl' | 'iucaa' | 'nic'>('npl');

  const logRetentionCalc = useMemo(() => {
    const start = new Date(logStartDate);
    if (isNaN(start.getTime())) return null;

    const expiry = new Date(start.getTime() + 180 * 24 * 60 * 60 * 1000);
    const totalStorageGB = dailyLogSizeGB * 180;
    const totalStorageTB = (totalStorageGB / 1024).toFixed(2);
    const recommendedBudgetTB = (parseFloat(totalStorageTB) * 1.3).toFixed(2); // 30% overhead for indexes

    return {
      start,
      expiry,
      totalStorageGB,
      totalStorageTB,
      recommendedBudgetTB
    };
  }, [logStartDate, dailyLogSizeGB]);

  // ===================== TAB 3: SECTION 65B EVIDENCE CERTIFICATE =====================
  const [evidenceName, setEvidenceName] = useState<string>('audit_access_logs_20261014.tar.gz');
  const [evidenceHash, setEvidenceHash] = useState<string>('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [deviceHostname, setDeviceHostname] = useState<string>('prod-app-cluster-01.internal');
  const [deviceIp, setDeviceIp] = useState<string>('10.14.0.128');
  const [certifierName, setCertifierName] = useState<string>('Sunil Kumar');
  const [certifierDesignation, setCertifierDesignation] = useState<string>('Head of Cloud Infrastructure & DevSecOps');
  const [certCopied, setCertCopied] = useState<boolean>(false);

  // Compute file hash client-side
  const handleFileHash = async (file: File) => {
    setIsHashing(true);
    setEvidenceName(file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setEvidenceHash(hashHex);
    } catch {
      alert('Unable to compute SHA-256 hash client-side.');
    } finally {
      setIsHashing(false);
    }
  };

  const certificate65BText = useMemo(() => {
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    return `CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872
[AND CORRESPONDING SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023]
FOR ADMISSIBILITY OF ELECTRONIC RECORDS

I, ${certifierName}, aged about mature years, presently serving as ${certifierDesignation} at ${orgName}, do hereby solemnly state, affirm, and certify as follows:

1. LAWFUL CONTROL & POSSESSION:
   During the material period, I have been and continue to be in lawful and operational control of the computer systems, servers, and digital devices deployed at ${orgName}, including specifically:
   - Device Hostname / Identifier: ${deviceHostname}
   - Internal IP / Network Address: ${deviceIp}

2. REGULAR PRODUCTION IN ORDINARY COURSE OF BUSINESS:
   The electronic record described below was produced, received, and stored by the said computer systems during the period over which the computer was used regularly to store or process information for the purposes of regular activities carried on by ${orgName}.

3. UNCOMPROMISED OPERATIONAL INTEGRITY:
   Throughout the material period, the said computer systems were operating properly. There have been no operational defects, system crashes, or unapproved tampering that would affect the accuracy, integrity, or authenticity of the digital records or the statements contained therein.

4. SPECIFICATION OF EVIDENCE & CRYPTOGRAPHIC VERIFICATION:
   The digital evidence artifact to which this certificate pertains is detailed hereunder:
   - Artifact Name: ${evidenceName}
   - Cryptographic Hash Algorithm: SHA-256 (NIST FIPS 180-4 compliant)
   - SHA-256 Digest: ${evidenceHash}
   - Time Synchronization Standard: National Physical Laboratory (NPL) - IST Stratum-1

5. AUTHENTICITY CONFIRMATION:
   I certify that the electronic record produced herewith is a true and uncorrupted reproduction of the digital data generated and retained in the regular course of business. To the best of my knowledge and belief, the contents are authentic and tamper-free.

Executed on this ${today} at India.

_______________________________
SIGNATURE OF CERTIFYING AUTHORITY
Name: ${certifierName}
Designation: ${certifierDesignation}
Organization: ${orgName}`;
  }, [certifierName, certifierDesignation, orgName, deviceHostname, deviceIp, evidenceName, evidenceHash]);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Statutory Banner */}
      <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 border border-red-500/20 dark:border-red-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-md shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Indian Cybersecurity & Evidence Mandates
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800">
                  IT Act Sec 70B & BSA Sec 63
                </span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Calculate the strict 6-hour CERT-In incident deadline, verify 180-day log retention compliance with NPL NTP, and generate court-admissible Section 65B electronic evidence certificates.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-mono">
              IST: {currentTime.toLocaleTimeString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('incident')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'incident'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          CERT-In 6-Hour Clock & Reporting
        </button>
        <button
          onClick={() => setActiveTab('retention')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'retention'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          180-Day Log Retention & NTP Sync
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'evidence'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Sec 65B / BSA 63 Evidence Certificate
        </button>
      </div>

      {/* TAB 1: 6-HOUR CLOCK & REPORTING */}
      {activeTab === 'incident' && (
        <div className="space-y-6">
          {/* Countdown & Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status 1: Remaining Time */}
            <div className={`p-5 rounded-2xl border ${
              incidentCalculation.isExpired
                ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800'
                : incidentCalculation.remainingHours < 2
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Reporting Window
                </span>
                <Clock className={`w-5 h-5 ${
                  incidentCalculation.isExpired ? 'text-red-600' : incidentCalculation.remainingHours < 2 ? 'text-amber-600' : 'text-emerald-600'
                }`} />
              </div>
              <div className="mt-3">
                {incidentCalculation.isExpired ? (
                  <div className="text-2xl font-black text-red-600 dark:text-red-400">
                    STATUTORY DEADLINE EXPIRED
                  </div>
                ) : (
                  <div className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                    {String(incidentCalculation.remainingHours).padStart(2, '0')}:
                    {String(incidentCalculation.remainingMins).padStart(2, '0')}:
                    {String(incidentCalculation.remainingSecs).padStart(2, '0')}
                  </div>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {incidentCalculation.isExpired
                    ? 'Report immediately to CERT-In to mitigate non-compliance liability under IT Act § 70B(7).'
                    : 'Time remaining to submit initial cyber incident report.'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    incidentCalculation.isExpired
                      ? 'bg-red-600'
                      : incidentCalculation.remainingHours < 2
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${incidentCalculation.percentUsed}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Detected: 0h</span>
                <span>Deadline: 6h (Mandatory)</span>
              </div>
            </div>

            {/* Status 2: Detection & Deadline Times */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Statutory Timestamps (IST)
              </span>
              <div className="space-y-3 mt-3">
                <div>
                  <div className="text-xs text-slate-500">Detection Timestamp:</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {incidentCalculation.isValid ? incidentCalculation.detected.toLocaleString('en-IN') : 'Invalid'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">CERT-In Cutoff Time:</div>
                  <div className="text-sm font-bold text-red-600 dark:text-red-400 font-mono">
                    {incidentCalculation.isValid ? incidentCalculation.deadline.toLocaleString('en-IN') : 'Invalid'}
                  </div>
                </div>
              </div>
            </div>

            {/* Status 3: Statutory Penalty Notice */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Section 70B(7) IT Act Liability
                </div>
                <div className="text-sm text-slate-300 mt-2">
                  Failure to serve notice of cybersecurity incidents to CERT-In within 6 hours carries up to <strong>1 year imprisonment</strong> and/or fine up to <strong>₹1,00,000</strong> for key personnel.
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span>CERT-In Desk: 1800-11-4949</span>
                <span className="text-amber-400 font-mono">incident@cert-in.org.in</span>
              </div>
            </div>
          </div>

          {/* Form & Incident Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Inputs */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Incident Parameters & Entity Context
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Incident Detection Timestamp (Notice / Awareness)
                </label>
                <input
                  type="datetime-local"
                  value={detectionTime}
                  onChange={(e) => setDetectionTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Statutory Incident Type (CERT-In Annexure I)
                </label>
                <select
                  value={selectedIncidentId}
                  onChange={(e) => setSelectedIncidentId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {CERT_IN_INCIDENTS.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      #{inc.id}: {inc.name} ({inc.severity})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                  {selectedIncident.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Security Officer (POC) & Role
                  </label>
                  <input
                    type="text"
                    value={pocName}
                    onChange={(e) => setPocName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  24x7 Contact Hotline / Official Email
                </label>
                <input
                  type="text"
                  value={pocContact}
                  onChange={(e) => setPocContact(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Impacted Systems & Infrastructure
                </label>
                <input
                  type="text"
                  value={affectedSystems}
                  onChange={(e) => setAffectedSystems(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Immediate Remediation & Containment Actions
                </label>
                <textarea
                  rows={2}
                  value={remediationSteps}
                  onChange={(e) => setRemediationSteps(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Generated Notification Draft */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    CERT-In Statutory Report Template
                  </h3>
                  <button
                    onClick={() => copyToClipboard(incidentReportText, setCopiedDraft)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    {copiedDraft ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedDraft ? 'Copied to Clipboard' : 'Copy Report'}
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-[380px] border border-slate-800 leading-relaxed whitespace-pre-wrap">
                  {incidentReportText}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Email directly: <strong>incident@cert-in.org.in</strong></span>
                <a
                  href={`mailto:incident@cert-in.org.in?subject=${encodeURIComponent(`[STATUTORY INCIDENT REPORT] ${orgName} - ${selectedIncident.name}`)}&body=${encodeURIComponent(incidentReportText)}`}
                  className="text-red-600 dark:text-red-400 hover:underline font-semibold"
                >
                  Open in Mail Client →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 180-DAY LOG RETENTION & NTP SYNC */}
      {activeTab === 'retention' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Retention Parameters
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Log Ingestion Start Date
                </label>
                <input
                  type="date"
                  value={logStartDate}
                  onChange={(e) => setLogStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Daily ICT Log Volume (GB/Day across all nodes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={dailyLogSizeGB}
                  onChange={(e) => setDailyLogSizeGB(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
                <p className="text-xs text-slate-500 mt-1">Includes firewalls, load balancers, VPC flow logs, audit trails, and OS logs.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Authorised India NTP Stratum Target
                </label>
                <select
                  value={ntpServerChoice}
                  onChange={(e) => setNtpServerChoice(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="npl">National Physical Laboratory (time.nplindia.org)</option>
                  <option value="iucaa">IUCAA Pune (time.iucaa.in)</option>
                  <option value="nic">National Informatics Centre (samay.nic.in)</option>
                </select>
              </div>
            </div>

            {/* Statutory Calculation Summary */}
            <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-600" />
                Statutory 180-Day Capacity & Retention Timetable
              </h3>

              {logRetentionCalc && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Mandatory Retention</span>
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">180 Days</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Until: <strong>{logRetentionCalc.expiry.toLocaleDateString('en-IN')}</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Total Raw Logs Storage</span>
                    <div className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1">
                      {logRetentionCalc.totalStorageTB} TB
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {logRetentionCalc.totalStorageGB.toLocaleString('en-IN')} GB raw capacity
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Recommended Tier-2 Cold S3</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {logRetentionCalc.recommendedBudgetTB} TB
                    </div>
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                      Includes 30% index & compression buffer
                    </div>
                  </div>
                </div>
              )}

              {/* NTP Server Configuration Snippets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-500" />
                    Mandatory Indian NTP Sync Configuration (Chrony / NTPD)
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    CERT-In Directive 2022 Compliant
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                  <div className="text-slate-500"># /etc/chrony/chrony.conf or /etc/ntp.conf</div>
                  <div className="text-amber-400 mt-1">
                    {ntpServerChoice === 'npl'
                      ? 'server time.nplindia.org iburst prefer'
                      : ntpServerChoice === 'iucaa'
                      ? 'server time.iucaa.in iburst prefer'
                      : 'server samay.nic.in iburst prefer'}
                  </div>
                  <div className="text-slate-400">server pool.ntp.org iburst</div>
                  <div className="text-slate-500 mt-2"># Enable rolling local drift compensation</div>
                  <div className="text-slate-400">driftfile /var/lib/chrony/drift</div>
                  <div className="text-slate-400">makestep 1.0 3</div>
                  <div className="text-slate-400">rtcsync</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECTION 65B EVIDENCE CERTIFICATE */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form & Hash Calculator */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                Electronic Evidence & Custodian Details
              </h3>

              {/* Upload to Hash */}
              <div className="p-4 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
                <UploadCloud className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <label className="cursor-pointer text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline">
                  <span>{isHashing ? 'Hashing file...' : 'Compute SHA-256 Checksum from Local File'}</span>
                  <input
                    type="file"
                    className="hidden"
                    disabled={isHashing}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileHash(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                <p className="text-[11px] text-slate-500 mt-1">Processed 100% locally in your browser via Web Crypto API. No files uploaded.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Evidence Artifact / Archive Name
                </label>
                <input
                  type="text"
                  value={evidenceName}
                  onChange={(e) => setEvidenceName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  SHA-256 Checksum Hash (NIST FIPS 180-4)
                </label>
                <input
                  type="text"
                  value={evidenceHash}
                  onChange={(e) => setEvidenceHash(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Device Hostname / Cluster
                  </label>
                  <input
                    type="text"
                    value={deviceHostname}
                    onChange={(e) => setDeviceHostname(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Internal IP Address
                  </label>
                  <input
                    type="text"
                    value={deviceIp}
                    onChange={(e) => setDeviceIp(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Certifying Custodian Name
                  </label>
                  <input
                    type="text"
                    value={certifierName}
                    onChange={(e) => setCertifierName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Official Designation / Role
                  </label>
                  <input
                    type="text"
                    value={certifierDesignation}
                    onChange={(e) => setCertifierDesignation(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Ready to Print / Copy Legal Certificate */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Statutory Certificate Draft
                  </h3>
                  <button
                    onClick={() => copyToClipboard(certificate65BText, setCertCopied)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                  >
                    {certCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {certCopied ? 'Copied' : 'Copy Certificate'}
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-serif text-xs text-slate-800 dark:text-slate-200 overflow-y-auto max-h-[400px] border border-slate-200 dark:border-slate-800 leading-relaxed whitespace-pre-wrap shadow-inner">
                  {certificate65BText}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Recognized by Indian High Courts & Tribunals</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Section 65B(4) Admissible</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statutory Guidance FAQ Footer */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-500" />
          Statutory Framework Notes:
        </div>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>CERT-In Directions 2022:</strong> Applicable to all service providers, intermediaries, data centers, body corporates, and government organizations in India.</li>
          <li><strong>Mandatory 6-Hour Clock:</strong> Begins from the moment the organization first notices or receives confirmation of the incident. Partial reports must be submitted if complete forensic analysis is still underway.</li>
          <li><strong>Bharatiya Sakshya Adhiniyam, 2023 (BSA):</strong> Section 63 replaces Section 65B of the repealed Indian Evidence Act, 1872, maintaining the requirement for electronic evidence custody certification with cryptographic integrity.</li>
        </ul>
      </div>
    </div>
  );
}
