import { useState, useMemo } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  FileText,
  Copy,
  Check
} from 'lucide-react';

interface DSRRequest {
  id: string;
  citizenName: string;
  email: string;
  type: 'access_summary' | 'correction' | 'erasure' | 'nomination' | 'grievance';
  receivedDate: string;
  status: 'pending' | 'in_review' | 'fulfilled' | 'rejected';
  statutoryDaysLimit: number;
}

const SAMPLE_REQUESTS: DSRRequest[] = [
  {
    id: 'DSR-2026-001',
    citizenName: 'Anita Deshmukh',
    email: 'anita.d@example.in',
    type: 'erasure',
    receivedDate: '2026-10-01',
    status: 'in_review',
    statutoryDaysLimit: 30
  },
  {
    id: 'DSR-2026-002',
    citizenName: 'Rohan Verma',
    email: 'rohan.v@example.in',
    type: 'access_summary',
    receivedDate: '2026-10-08',
    status: 'pending',
    statutoryDaysLimit: 30
  },
  {
    id: 'DSR-2026-003',
    citizenName: 'Kavita Menon',
    email: 'kavita.m@example.in',
    type: 'correction',
    receivedDate: '2026-09-20',
    status: 'fulfilled',
    statutoryDaysLimit: 30
  }
];

export default function DataPrincipalRightsTracker() {
  const [requests, setRequests] = useState<DSRRequest[]>(SAMPLE_REQUESTS);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('DSR-2026-001');

  // New Request Form
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newType, setNewType] = useState<DSRRequest['type']>('access_summary');
  const [newDate, setNewDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [companyName, setCompanyName] = useState<string>('Bharat Tech Solutions Pvt Ltd');
  const [copiedLetter, setCopiedLetter] = useState<boolean>(false);

  const selectedRequest = useMemo(() => {
    return requests.find(r => r.id === selectedRequestId) || requests[0];
  }, [requests, selectedRequestId]);

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newId = `DSR-2026-${String(requests.length + 1).padStart(3, '0')}`;
    const newReq: DSRRequest = {
      id: newId,
      citizenName: newName.trim(),
      email: newEmail.trim(),
      type: newType,
      receivedDate: newDate,
      status: 'pending',
      statutoryDaysLimit: 30
    };

    setRequests([newReq, ...requests]);
    setSelectedRequestId(newId);
    setNewName('');
    setNewEmail('');
  };

  const handleStatusChange = (id: string, status: DSRRequest['status']) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
  };

  // Statutory Response Letter Draft
  const responseLetterText = useMemo(() => {
    if (!selectedRequest) return '';
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    let actionClause = '';
    if (selectedRequest.type === 'erasure') {
      actionClause = `In compliance with your request under Section 12(3) of the Act, we confirm that all personal data associated with your profile has been permanently erased from our primary active databases and transactional caches. No further automated processing will take place.`;
    } else if (selectedRequest.type === 'access_summary') {
      actionClause = `Pursuant to Section 11 of the Act, please find enclosed a summary of your personal data processed by us, including categories of personal data, specified purposes of processing, and identities of other Data Fiduciaries with whom your data has been shared.`;
    } else if (selectedRequest.type === 'correction') {
      actionClause = `Pursuant to Section 12(1) of the Act, we have updated and corrected your personal records across our customer relationship and billing systems as requested.`;
    } else {
      actionClause = `Your request submitted under the statutory provisions of the DPDP Act, 2023 has been reviewed and acknowledged by our Data Protection desk.`;
    }

    return `CONFIDENTIAL - STATUTORY RESPONSE LETTER
ISSUED UNDER THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023

Date: ${today}
To: ${selectedRequest.citizenName}
Email: ${selectedRequest.email}
Statutory Reference Tracking ID: ${selectedRequest.id}

Dear ${selectedRequest.citizenName},

Subject: Formal Response to Statutory Request under DPDP Act, 2023

We refer to your request dated ${selectedRequest.receivedDate} regarding the exercise of your statutory Data Principal rights.

${actionClause}

GRIEVANCE ESCALATION PROCEDURE:
If you are dissatisfied with this resolution, you may escalate this matter to our designated Grievance Redressal Officer within 30 days. Under Section 13(3) of the DPDP Act, you also hold the right to lodge a complaint with the Data Protection Board of India (DPBI).

Sincerely,
Privacy & Data Protection Officer
${companyName}`;
  }, [selectedRequest, companyName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(responseLetterText);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 border border-blue-500/20 dark:border-blue-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Data Principal Statutory Rights Tracker & SLA Manager
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  Sections 11–14 DPDP Act
                </span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Manage citizen requests for Data Access (Sec 11), Data Correction & Updating (Sec 12), Right to Erasure (Sec 12(3)), and Grievance Redressal (Sec 13) within statutory response timeframes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Request Intake Form */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Log New Statutory Request
          </h3>

          <form onSubmit={handleAddRequest} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Data Principal (Citizen) Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Registered Contact Email
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="citizen@example.in"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Statutory Request Category
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="access_summary">Section 11: Right to Access Summary</option>
                <option value="correction">Section 12(1): Right to Correction / Updating</option>
                <option value="erasure">Section 12(3): Right to Erasure / Deletion</option>
                <option value="grievance">Section 13: Grievance Redressal</option>
                <option value="nomination">Section 14: Right to Nominate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Date Request Received
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Register Statutory Ticket
            </button>
          </form>
        </div>

        {/* Center: Active DSR Tickets Table */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Active Tickets ({requests.length})
            </h3>
            <span className="text-[11px] text-slate-400">30-day statutory SLA</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
            {requests.map((req) => {
              const isSelected = req.id === selectedRequestId;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-400 dark:border-blue-700 shadow-xs'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {req.id}
                    </span>
                    <select
                      value={req.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(req.id, e.target.value as any)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        req.status === 'fulfilled'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : req.status === 'rejected'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_review">In Review</option>
                      <option value="fulfilled">Fulfilled</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {req.citizenName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Type: <strong className="capitalize">{req.type.replace('_', ' ')}</strong> • Recd: {req.receivedDate}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Response Letter Draft */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Statutory Fulfillment Letter
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                {copiedLetter ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLetter ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="mb-2">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Data Fiduciary Name:
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="e.g. Bharat Tech Solutions Pvt Ltd"
              />
            </div>
            <textarea
              readOnly
              rows={14}
              value={responseLetterText}
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-900 text-slate-100 focus:outline-none"
            />
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>SLA: 30 Days Maximum</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">DPDP Act Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
