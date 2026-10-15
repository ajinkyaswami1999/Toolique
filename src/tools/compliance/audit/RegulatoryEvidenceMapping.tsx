import { useState, useMemo } from 'react';
import {
  Layers,
  ShieldCheck,
  Search,
  Copy,
  Check,
  Download,
  Zap
} from 'lucide-react';

interface EvidenceMapping {
  id: string;
  evidenceName: string;
  category: string;
  dpdpSection: string;
  rbiSection: string;
  certinSection: string;
  isoControl: string;
  uidaiSection?: string;
  description: string;
}

const REGULATORY_MAPPINGS: EvidenceMapping[] = [
  {
    id: 'map_vapt',
    evidenceName: 'Bi-Annual VAPT Assessment & Remediation Report',
    category: 'Vulnerability Management',
    dpdpSection: 'Section 8(5) - Reasonable Security Safeguards',
    rbiSection: 'MD-IT 2023 Section 15 - Periodic VAPT',
    certinSection: 'Annexure I Para 4 - Vulnerability Mitigation',
    isoControl: 'ISO 27001 Annex A.8.8 - Technical Vulnerabilities',
    uidaiSection: 'Aadhaar Auth Reg 19 - Annual Security Audit',
    description: 'Empanelled CERT-In penetration test validating API endpoints, mobile applications, and cloud posture.'
  },
  {
    id: 'map_mfa',
    evidenceName: 'IdP Conditional Access MFA Enforcement Policy & Logs',
    category: 'Access Management',
    dpdpSection: 'Section 8(5) - Access Controls for Personal Data',
    rbiSection: 'Cyber Security Framework Annex 1 Para 4 - MFA',
    certinSection: 'Directions 2022 Para 2 - Authorized Access Controls',
    isoControl: 'ISO 27001 Annex A.9.4 - System and Application Access',
    uidaiSection: 'UIDAI Reg 18 - Dual-Factor Operator Authentication',
    description: 'Hardware or authenticator app MFA logs for all administrative consoles, VPNs, and database jump hosts.'
  },
  {
    id: 'map_logs',
    evidenceName: '180-Day Immutable WORM System Logs & NTP Sync Audit',
    category: 'Logging & Monitoring',
    dpdpSection: 'Section 8(6) - Breach Detection & Forensics',
    rbiSection: 'MD-IT 2023 Section 18 - Cyber Incident Telemetry',
    certinSection: 'Directions 2022 Para 5 - 180 Days Indian Storage with NPL NTP',
    isoControl: 'ISO 27001 Annex A.12.4 - Logging and Monitoring',
    uidaiSection: 'ADV Circular 2017 - Vault Access Logging',
    description: 'CloudTrail / Syslog archived in immutable S3 Glacier with Chrony NTP synchronization to time.nplindia.org.'
  },
  {
    id: 'map_kms',
    evidenceName: 'Cloud KMS AES-256 Key Rotation & Encryption Config',
    category: 'Cryptography',
    dpdpSection: 'Section 8(5) - Storage Encryption Safeguards',
    rbiSection: 'MD-IT 2023 Section 12 - 90-Day Key Rotation & mTLS',
    certinSection: 'Directions 2022 Para 6 - Data-at-Rest Encryption',
    isoControl: 'ISO 27001 Annex A.10.1 - Cryptographic Controls',
    uidaiSection: 'ADV Specs - FIPS 140-2 Level 3 HSM Enclave',
    description: 'Automated 90-day KMS master key rotation, field-level encryption for sensitive PII, and TLS 1.3 in-transit.'
  },
  {
    id: 'map_vendor',
    evidenceName: 'Master Services Agreement with Unrestricted Right-to-Audit',
    category: 'Third-Party Governance',
    dpdpSection: 'Section 8(2) - Data Processor Engagement Agreement',
    rbiSection: 'IT Outsourcing 2023 Section 14 - Unconditional Audit',
    certinSection: 'Directions 2022 Para 7 - Supply Chain Due Diligence',
    isoControl: 'ISO 27001 Annex A.15.1 - Supplier Relationships',
    description: 'Executed vendor contracts containing explicit clauses granting enterprise and RBI auditors physical and system inspection rights.'
  }
];

export default function RegulatoryEvidenceMapping() {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredMappings = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return REGULATORY_MAPPINGS.filter(m =>
      m.evidenceName.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.dpdpSection.toLowerCase().includes(q) ||
      m.rbiSection.toLowerCase().includes(q) ||
      m.certinSection.toLowerCase().includes(q) ||
      m.isoControl.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleCopyMatrix = () => {
    const text = `=====================================================
CROSS-REGULATORY EVIDENCE MAPPING MATRIX
One-to-Many Statutory Compliance Optimizer
=====================================================
Export Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}

EVIDENCE MAPPING TABLE:
${REGULATORY_MAPPINGS.map(m => `[${m.evidenceName}]
- Category: ${m.category}
- DPDP Act 2023: ${m.dpdpSection}
- RBI MD-IT 2023: ${m.rbiSection}
- CERT-In 2022: ${m.certinSection}
- ISO 27001:2022: ${m.isoControl}
${m.uidaiSection ? `- UIDAI Aadhaar: ${m.uidaiSection}\n` : ''}- Description: ${m.description}`).join('\n\n')}
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const headers = 'Evidence Artifact,Category,DPDP Act 2023,RBI MD-IT 2023,CERT-In Directions,ISO 27001:2022,UIDAI Aadhaar\n';
    const rows = REGULATORY_MAPPINGS.map(m =>
      `"${m.evidenceName}","${m.category}","${m.dpdpSection}","${m.rbiSection}","${m.certinSection}","${m.isoControl}","${m.uidaiSection || 'N/A'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Regulatory_Evidence_Mapping_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Cross-Regulatory Evidence Mapping Matrix (One-to-Many)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Map single operational artifacts across DPDP, RBI, CERT-In, ISO 27001, and UIDAI to eliminate 70%+ redundant audit preparation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Single-Source Evidence</span>
        </div>
      </div>

      {/* Efficiency Multiplier Banner */}
      <div className="saas-card p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Audit Efficiency Multiplier: 4.2x
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Each collected technical artifact satisfies an average of 4.2 statutory frameworks simultaneously.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMatrix}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Matrix'}
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-96">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter by artifact or regulatory section..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
        />
      </div>

      {/* Mapping Cards */}
      <div className="space-y-4">
        {filteredMappings.map(m => (
          <div
            key={m.id}
            className="saas-card p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 bg-white dark:bg-slate-900/50"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {m.evidenceName}
                </h3>
                <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded text-[11px] font-medium">
                  {m.category}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {m.description}
            </p>

            {/* Framework Alignment Matrix Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block mb-1">
                  DPDP Act 2023
                </span>
                <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                  {m.dpdpSection}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                  RBI MD-IT 2023
                </span>
                <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                  {m.rbiSection}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block mb-1">
                  CERT-In Directions
                </span>
                <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                  {m.certinSection}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ISO 27001:2022
                </span>
                <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {m.isoControl}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
