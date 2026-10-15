import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  HardDrive,
  FileCheck,
  Copy,
  Check
} from 'lucide-react';

interface StatutorySchedule {
  id: string;
  category: string;
  name: string;
  statute: string;
  mandatoryYears: number;
  mandatoryDays?: number;
  triggerEvent: string;
  disposalMethod: string;
}

const STATUTORY_SCHEDULES: StatutorySchedule[] = [
  {
    id: 'cert_in_logs',
    category: 'Cybersecurity Logs',
    name: 'ICT System Logs, Firewalls & Audit Trails',
    statute: 'CERT-In Directions 2022 § 4(v)',
    mandatoryYears: 0,
    mandatoryDays: 180,
    triggerEvent: 'From timestamp of log ingestion',
    disposalMethod: 'Cryptographic purging after 180 rolling days (if no ongoing investigation)'
  },
  {
    id: 'pmla_kyc',
    category: 'Financial & KYC',
    name: 'Customer Due Diligence (CDD) & KYC Records',
    statute: 'PMLA 2002 § 12 & RBI Master KYC 2016',
    mandatoryYears: 5,
    triggerEvent: 'From date of cessation of business relationship / account closure',
    disposalMethod: 'Secure digital shredding / HSM key destruction'
  },
  {
    id: 'it_books',
    category: 'Tax & Invoicing',
    name: 'Books of Accounts & Invoicing Registers',
    statute: 'Income Tax Act 1961 § 44AA & GST Act § 36',
    mandatoryYears: 7,
    triggerEvent: 'From end of the relevant assessment year',
    disposalMethod: 'Controlled digital destruction per statutory audit standards'
  },
  {
    id: 'companies_act',
    category: 'Corporate Governance',
    name: 'Annual Financial Statements & Board Registers',
    statute: 'Companies Act 2013 § 128(5)',
    mandatoryYears: 8,
    triggerEvent: 'From end of relevant financial year',
    disposalMethod: 'Board-approved archival / secure electronic disposal'
  },
  {
    id: 'dpdp_purpose',
    category: 'DPDP Privacy',
    name: 'General Customer Profile & Marketing Personal Data',
    statute: 'DPDP Act 2023 § 8(7)',
    mandatoryYears: 1,
    triggerEvent: 'Immediate upon fulfillment of purpose or consent withdrawal',
    disposalMethod: 'Complete erasure / irreversible anonymization within 30 days'
  },
  {
    id: 'epf_records',
    category: 'Human Resources',
    name: 'PF Returns & Employee Attendance Records',
    statute: 'Employees’ Provident Funds Act 1952',
    mandatoryYears: 5,
    triggerEvent: 'From date of employee resignation / final settlement',
    disposalMethod: 'HR confidential electronic document destruction'
  }
];

export default function DataRetentionPlanner() {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('cert_in_logs');
  const [creationDate, setCreationDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
  });
  const [recordIdentifier, setRecordIdentifier] = useState<string>('LOG_ARCHIVE_PROD_2026_Q2.tar.gz');
  const [authorizedOfficer, setAuthorizedOfficer] = useState<string>('Suresh Narayanan, Chief Data Officer');
  const [companyName, setCompanyName] = useState<string>('Apex Cloud Services Pvt Ltd');
  const [copiedCert, setCopiedCert] = useState<boolean>(false);

  const selectedSchedule = useMemo(() => {
    return STATUTORY_SCHEDULES.find(s => s.id === selectedScheduleId) || STATUTORY_SCHEDULES[0];
  }, [selectedScheduleId]);

  const retentionCalculation = useMemo(() => {
    const created = new Date(creationDate);
    if (isNaN(created.getTime())) return null;

    const expiry = new Date(created);
    if (selectedSchedule.mandatoryDays) {
      expiry.setDate(expiry.getDate() + selectedSchedule.mandatoryDays);
    } else {
      expiry.setFullYear(expiry.getFullYear() + selectedSchedule.mandatoryYears);
    }

    const today = new Date();
    const isExpired = today >= expiry;
    const diffTime = expiry.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      created,
      expiry,
      isExpired,
      daysRemaining
    };
  }, [creationDate, selectedSchedule]);

  const destructionCertificateText = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const expiryStr = retentionCalculation ? retentionCalculation.expiry.toLocaleDateString('en-IN') : 'N/A';

    return `STATUTORY CERTIFICATE OF DATA DESTRUCTION & PURGING
PURSUANT TO SECTION 8(7) OF THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023
AND ${selectedSchedule.statute}

1. RECORD SPECIFICATION:
   - Data Artifact Name: ${recordIdentifier}
   - Statutory Category: ${selectedSchedule.name}
   - Applicable Legal Mandate: ${selectedSchedule.statute}
   - Ingestion / Record Creation Date: ${creationDate}
   - Statutory Retention Expiry Date: ${expiryStr}

2. ATTESTATION OF PURPOSE FULFILLMENT:
   I hereby certify and solemnly affirm that the personal data contained within the above-specified artifact has fulfilled the specified purposes for which it was collected, or the statutory retention ceiling has elapsed. There are no pending statutory audits, legal holds, or court orders prohibiting its disposal.

3. METHOD OF DESTRUCTION & SANITIZATION:
   The personal data records have been permanently and irreversibly destroyed using the following approved method:
   - Sanitization Standard: ${selectedSchedule.disposalMethod}
   - Data State Post-Purge: Non-recoverable, with all encryption keys and storage blocks zero-filled.

Executed on this ${todayStr} at India.

____________________________________
SIGNATURE OF AUTHORIZED DPO / OFFICER
Name: ${authorizedOfficer}
Organization: ${companyName}`;
  }, [recordIdentifier, selectedSchedule, creationDate, retentionCalculation, authorizedOfficer, companyName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(destructionCertificateText);
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-500/10 via-blue-500/10 to-indigo-500/10 border border-teal-500/20 dark:border-teal-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-teal-600 text-white rounded-xl shadow-md shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Statutory Data Retention & Purpose Erasure Planner
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                  DPDP § 8(7) • CERT-In • PMLA
                </span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Calculate legal retention limits across Indian statutory frameworks (CERT-In 180-day logs, Income Tax 7-year records, PMLA 5-year KYC), track disposal schedules, and generate signed destruction certificates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1: Schedule Selector & Parameters */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-500" />
            Statutory Framework Selection
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Select Indian Regulatory Mandate
              </label>
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {STATUTORY_SCHEDULES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.statute})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Record Creation / Trigger Event Date
              </label>
              <input
                type="date"
                value={creationDate}
                onChange={(e) => setCreationDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-500 mt-1 italic">{selectedSchedule.triggerEvent}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Record Artifact Name / Storage Bucket
              </label>
              <input
                type="text"
                value={recordIdentifier}
                onChange={(e) => setRecordIdentifier(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Certifying Officer & Role
                </label>
                <input
                  type="text"
                  value={authorizedOfficer}
                  onChange={(e) => setAuthorizedOfficer(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Entity Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Timetable & Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-teal-500" />
              Retention Timetable & Disposal Status
            </h3>

            {retentionCalculation && (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border ${
                  retentionCalculation.isExpired
                    ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                }`}>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Statutory Status
                  </div>
                  <div className={`text-xl font-black mt-1 ${
                    retentionCalculation.isExpired ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {retentionCalculation.isExpired ? 'MANDATORY ERASURE DUE' : 'ACTIVE RETENTION PERIOD'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {retentionCalculation.isExpired
                      ? 'Statutory retention requirement has elapsed. Data should be permanently destroyed per DPDP § 8(7).'
                      : `${retentionCalculation.daysRemaining} days remaining before statutory disposal obligation.`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Creation Date:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {retentionCalculation.created.toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400">Earliest Disposal Date:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {retentionCalculation.expiry.toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Prescribed Disposal Standard:</span>
                  <p className="text-slate-600 dark:text-slate-400">{selectedSchedule.disposalMethod}</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Mandate: {selectedSchedule.statute}
          </div>
        </div>

        {/* Right: Certificate of Data Destruction Draft */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-500" />
                Certificate of Destruction
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
              >
                {copiedCert ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCert ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              readOnly
              rows={16}
              value={destructionCertificateText}
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-slate-200 focus:outline-none"
            />
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>DPDP Section 8(7) Admissible</span>
            <span className="text-teal-600 dark:text-teal-400 font-semibold">Audit Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
