import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Copy,
  Check,
  Building,
  Users,
  Scale
} from 'lucide-react';

export default function DataBreachAssessment() {
  const [activeTab, setActiveTab] = useState<'assessment' | 'dpbi_notice' | 'user_notice'>('assessment');

  // Breach Parameters
  const [orgName, setOrgName] = useState<string>('Bharat E-Commerce Technologies Pvt Ltd');
  const [affectedUsers, setAffectedUsers] = useState<number>(45000);
  const [dataTypesExposed] = useState<string[]>([
    'Names & Phone Numbers',
    'Masked Invoices & Shipping Addresses'
  ]);
  const [hasFinancialData, setHasFinancialData] = useState<boolean>(false);
  const [hasAadhaarOrBiometrics, setHasAadhaarOrBiometrics] = useState<boolean>(false);
  const [hasChildrenData, setHasChildrenData] = useState<boolean>(false);
  const [wasDataEncrypted, setWasDataEncrypted] = useState<boolean>(true);
  const [containmentCompleted] = useState<boolean>(true);
  const [incidentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);

  // Severity Matrix & Statutory Penalty Estimation
  const assessment = useMemo(() => {
    let riskPoints = 0;

    if (affectedUsers > 500000) riskPoints += 35;
    else if (affectedUsers > 50000) riskPoints += 25;
    else if (affectedUsers > 5000) riskPoints += 15;
    else riskPoints += 5;

    if (hasFinancialData) riskPoints += 25;
    if (hasAadhaarOrBiometrics) riskPoints += 30;
    if (hasChildrenData) riskPoints += 25;
    if (!wasDataEncrypted) riskPoints += 20;
    if (!containmentCompleted) riskPoints += 15;

    let severity: 'Critical' | 'High' | 'Moderate' | 'Low' = 'Low';
    if (riskPoints >= 65) severity = 'Critical';
    else if (riskPoints >= 45) severity = 'High';
    else if (riskPoints >= 25) severity = 'Moderate';

    // Section 33 Exposure estimation (₹ Crores)
    let estimatedPenaltyCr = 0;
    if (!wasDataEncrypted) {
      estimatedPenaltyCr += severity === 'Critical' ? 120 : severity === 'High' ? 50 : 15;
    }
    if (hasChildrenData) {
      estimatedPenaltyCr += 80;
    }
    if (hasAadhaarOrBiometrics) {
      estimatedPenaltyCr += 60;
    }
    estimatedPenaltyCr = Math.min(250, Math.max(5, estimatedPenaltyCr));

    return {
      riskPoints,
      severity,
      estimatedPenaltyCr,
      isMandatoryDPBIReport: severity === 'Critical' || severity === 'High' || hasFinancialData || hasAadhaarOrBiometrics || hasChildrenData
    };
  }, [affectedUsers, hasFinancialData, hasAadhaarOrBiometrics, hasChildrenData, wasDataEncrypted, containmentCompleted]);

  // DPBI Official Notification Draft
  const dpbiNoticeText = useMemo(() => {
    return `FORM OF INTIMATION OF PERSONAL DATA BREACH
TO THE DATA PROTECTION BOARD OF INDIA (DPBI)
PURSUANT TO SECTION 8(6) OF THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023

1. DATA FIDUCIARY PARTICULARS:
   - Legal Entity: ${orgName}
   - Corporate Status: Data Fiduciary under DPDP Act 2023
   - Incident Detection Date: ${incidentDate}

2. NATURE AND SCOPE OF THE BREACH:
   - Severity Level: ${assessment.severity} Risk
   - Estimated Volume of Affected Data Principals: ${affectedUsers.toLocaleString('en-IN')} individuals
   - Categories of Personal Data Involved:
     ${dataTypesExposed.join(', ')}
     ${hasFinancialData ? '(Includes Financial / Transaction Identifiers)' : ''}
     ${hasAadhaarOrBiometrics ? '(Includes Biometric / Identity Identifiers)' : ''}
     ${hasChildrenData ? '(Includes Minors / Children Data - Section 9 Trigger)' : ''}
   - Encryption Status at Rest: ${wasDataEncrypted ? 'Encrypted with AES-256 (Keys uncompromised)' : 'Unencrypted / Plaintext'}

3. CONTAINMENT & MITIGATION MEASURES TAKEN:
   - Subnet Isolation: ${containmentCompleted ? 'Executed' : 'In Progress'}
   - Credential Revocation: Executed across affected service accounts.
   - Forensic Investigation: Initiated with certified CERT-In empanelled auditor.

4. COMMUNICATION TO DATA PRINCIPALS:
   - Transparent notifications are being issued directly to all affected individuals in compliance with Section 8(6).

Submitted on behalf of ${orgName}`;
  }, [orgName, incidentDate, assessment, affectedUsers, dataTypesExposed, hasFinancialData, hasAadhaarOrBiometrics, hasChildrenData, wasDataEncrypted, containmentCompleted]);

  // Affected Data Principal Notification Draft
  const userNoticeText = useMemo(() => {
    return `IMPORTANT SECURITY NOTICE: PERSONAL DATA INCIDENT NOTIFICATION
ISSUED UNDER SECTION 8(6) OF THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023

Dear Customer,

We are writing to transparently inform you about a cybersecurity incident affecting ${orgName} that may have involved some of your personal data.

1. WHAT HAPPENED:
On ${incidentDate}, our information security team detected an unauthorized attempt to access certain application databases. We immediately contained the incident and engaged cybersecurity specialists.

2. WHAT INFORMATION WAS INVOLVED:
Our investigation confirms that the records involved may have included:
- ${dataTypesExposed.join('\n- ')}

3. WHAT WE ARE DOING:
- We have patched the affected systems and revoked all potentially exposed credentials.
- System logs have been secured and reported to statutory authorities including the Data Protection Board of India.

4. RECOMMENDED ACTIONS FOR YOU:
- Please remain cautious against suspicious phishing messages, SMS, or phone calls requesting one-time passwords (OTPs).
- If you use the same password on other platforms, we recommend updating your password immediately.

5. SUPPORT & GRIEVANCE REDRESSAL:
For assistance or queries, please reach out to our dedicated privacy desk:
Email: privacy@${orgName.toLowerCase().replace(/[^a-z0-9]/g, '')}.example.in
Grievance Officer: Designated under Section 13 of the DPDP Act.`;
  }, [orgName, incidentDate, dataTypesExposed]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 border border-red-500/20 dark:border-red-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-red-600 text-white rounded-xl shadow-md shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                DPDP Data Breach Risk & Statutory Notice Generator
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800">
                  Section 8(6) & Section 33
                </span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Evaluate personal data breach severity, simulate Section 33 statutory financial penalty liability (up to ₹250 Crores), and generate mandatory notifications for the Data Protection Board of India (DPBI) and affected Data Principals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('assessment')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'assessment'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          Breach Severity & Penalty Exposure
        </button>
        <button
          onClick={() => setActiveTab('dpbi_notice')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'dpbi_notice'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          DPBI Statutory Notice (Section 8(6))
        </button>
        <button
          onClick={() => setActiveTab('user_notice')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
            activeTab === 'user_notice'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Affected Users Notification
        </button>
      </div>

      {/* TAB 1: ASSESSMENT */}
      {activeTab === 'assessment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Incident Scope Parameters
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Entity / Data Fiduciary Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Number of Impacted Data Principals
                </label>
                <input
                  type="number"
                  min="1"
                  value={affectedUsers}
                  onChange={(e) => setAffectedUsers(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasFinancialData}
                    onChange={(e) => setHasFinancialData(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Includes Financial or Payment Information
                  </span>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAadhaarOrBiometrics}
                    onChange={(e) => setHasAadhaarOrBiometrics(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Includes Aadhaar numbers or Biometric templates (UIDAI Trigger)
                  </span>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasChildrenData}
                    onChange={(e) => setHasChildrenData(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Includes Children's / Minors' Personal Data (Section 9)
                  </span>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wasDataEncrypted}
                    onChange={(e) => setWasDataEncrypted(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Data was encrypted at rest with AES-256 (Mitigating factor)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Results Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Statutory Assessment Summary
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${
                  assessment.severity === 'Critical'
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300'
                }`}>
                  <span className="text-[11px] font-bold uppercase tracking-wider">Severity Classification</span>
                  <div className="text-2xl font-black mt-1">{assessment.severity} Risk</div>
                  <span className="text-[11px]">Score: {assessment.riskPoints} / 100</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">DPBI Reporting</span>
                  <div className="text-xl font-black text-red-600 dark:text-red-400 mt-1">
                    {assessment.isMandatoryDPBIReport ? 'MANDATORY' : 'OPTIONAL'}
                  </div>
                  <span className="text-[11px] text-slate-400">Section 8(6) notice required</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 space-y-1">
                <div className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">
                  Estimated Section 33 Penalty Exposure
                </div>
                <div className="text-3xl font-black text-red-600 dark:text-red-400 font-mono">
                  Up to ₹{assessment.estimatedPenaltyCr} Crores
                </div>
                <p className="text-[11px] text-slate-500">
                  Statutory maximum: Up to ₹250 Crores per violation for failure to implement reasonable safeguards.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              Statutory Basis: Schedule to Section 33, DPDP Act 2023.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DPBI STATUTORY NOTICE */}
      {activeTab === 'dpbi_notice' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-500" />
              Section 8(6) Formal Notice to Data Protection Board of India
            </h3>
            <button
              onClick={() => copyText(dpbiNoticeText)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              {copiedDraft ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedDraft ? 'Copied' : 'Copy Formal Intimation'}
            </button>
          </div>
          <textarea
            readOnly
            rows={16}
            value={dpbiNoticeText}
            className="w-full p-4 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-slate-100 focus:outline-none leading-relaxed"
          />
        </div>
      )}

      {/* TAB 3: USER NOTIFICATION */}
      {activeTab === 'user_notice' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              Section 8(6) Transparent Communication to Affected Data Principals
            </h3>
            <button
              onClick={() => copyText(userNoticeText)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              {copiedDraft ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedDraft ? 'Copied' : 'Copy User Communication'}
            </button>
          </div>
          <textarea
            readOnly
            rows={16}
            value={userNoticeText}
            className="w-full p-4 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-slate-100 focus:outline-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
