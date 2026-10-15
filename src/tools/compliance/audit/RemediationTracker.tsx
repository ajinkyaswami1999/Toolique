import { useState, useMemo } from 'react';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  ListTodo
} from 'lucide-react';

interface CapaItem {
  id: string;
  findingTitle: string;
  source: 'External VAPT' | 'RBI Inspection' | 'Internal Audit' | 'CERT-In Advisory' | 'DPDP Audit';
  priority: 'P0 - Blocker (7d)' | 'P1 - Critical (15d)' | 'P2 - High (30d)' | 'P3 - Medium (60d)';
  assignee: string;
  targetDate: string;
  status: 'Open' | 'In Progress' | 'Verification' | 'Closed';
}

const INITIAL_CAPA: CapaItem[] = [
  {
    id: 'capa_1',
    findingTitle: 'Rotate legacy API signing keys older than 90 days across payment gateway',
    source: 'RBI Inspection',
    priority: 'P0 - Blocker (7d)',
    assignee: 'Payment Gateway Lead',
    targetDate: '2024-10-20',
    status: 'In Progress'
  },
  {
    id: 'capa_2',
    findingTitle: 'Patch OpenSSL vulnerability CVE-2024-XXXX on production reverse proxy',
    source: 'External VAPT',
    priority: 'P1 - Critical (15d)',
    assignee: 'DevOps SecOps Team',
    targetDate: '2024-10-25',
    status: 'Verification'
  },
  {
    id: 'capa_3',
    findingTitle: 'Deploy bilingual Section 5 consent notices in 22 scheduled languages',
    source: 'DPDP Audit',
    priority: 'P2 - High (30d)',
    assignee: 'Product Frontend Team',
    targetDate: '2024-11-10',
    status: 'Open'
  }
];

export default function RemediationTracker() {
  const [items, setItems] = useState<CapaItem[]>(INITIAL_CAPA);
  const [newTitle, setNewTitle] = useState('');
  const [newSource, setNewSource] = useState<CapaItem['source']>('External VAPT');
  const [newPriority, setNewPriority] = useState<CapaItem['priority']>('P1 - Critical (15d)');
  const [newAssignee, setNewAssignee] = useState('');
  const [newTargetDate, setNewTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });

  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    let openCount = 0;
    let inProgressCount = 0;
    let verificationCount = 0;
    let closedCount = 0;
    let overdueCount = 0;

    const now = new Date().getTime();

    items.forEach(i => {
      if (i.status === 'Closed') closedCount++;
      else {
        if (i.status === 'Open') openCount++;
        else if (i.status === 'In Progress') inProgressCount++;
        else if (i.status === 'Verification') verificationCount++;

        const targetTime = new Date(i.targetDate).getTime();
        if (targetTime < now) overdueCount++;
      }
    });

    const completionRate = items.length > 0 ? Math.round((closedCount / items.length) * 100) : 0;
    return { openCount, inProgressCount, verificationCount, closedCount, overdueCount, completionRate };
  }, [items]);

  const handleAddItem = () => {
    if (!newTitle.trim()) return;
    const newItem: CapaItem = {
      id: `capa_${Date.now()}`,
      findingTitle: newTitle.trim(),
      source: newSource,
      priority: newPriority,
      assignee: newAssignee.trim() || 'Unassigned',
      targetDate: newTargetDate,
      status: 'Open'
    };
    setItems(prev => [newItem, ...prev]);
    setNewTitle('');
    setNewAssignee('');
  };

  const handleUpdateStatus = (id: string, status: CapaItem['status']) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, status } : i)));
  };

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleCopyReport = () => {
    const text = `=====================================================
AUDIT REMEDIATION & CAPA SLA CLOSURE TRACKER
ISO 27001 Clause 10 / RBI Inspection / VAPT
=====================================================
Report Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Closure Rate: ${stats.completionRate}% (${stats.closedCount}/${items.length} Action Items Resolved)
Active Findings: ${items.length - stats.closedCount}
Overdue SLA Breaches: ${stats.overdueCount}

ACTION ITEMS BREAKDOWN:
${items.map(i => `[${i.status.toUpperCase()}] ${i.findingTitle}
- Priority: ${i.priority} | Source: ${i.source}
- Assignee: ${i.assignee} | SLA Target Date: ${i.targetDate}`).join('\n\n')}
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const text = `=====================================================
AUDIT REMEDIATION & CAPA SLA CLOSURE TRACKER
ISO 27001 Clause 10 / RBI Inspection / VAPT
=====================================================
Report Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Closure Rate: ${stats.completionRate}% (${stats.closedCount}/${items.length} Action Items Resolved)
Active Findings: ${items.length - stats.closedCount}
Overdue SLA Breaches: ${stats.overdueCount}

ACTION ITEMS BREAKDOWN:
${items.map(i => `[${i.status.toUpperCase()}] ${i.findingTitle}
- Priority: ${i.priority} | Source: ${i.source}
- Assignee: ${i.assignee} | SLA Target Date: ${i.targetDate}`).join('\n\n')}
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CAPA_Remediation_Report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Remediation Tracker & Corrective Action (CAPA) Manager
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Track audit non-conformities, VAPT findings, and regulatory inspection corrective actions with automated SLA aging.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>ISO 27001 Clause 10</span>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">CAPA Resolution Rate</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.completionRate}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Open & In Progress</span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-5 h-5" />
            {stats.openCount + stats.inProgressCount}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Active Remediation</span>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Under Verification</span>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            {stats.verificationCount}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Pending Re-Test</span>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Overdue SLA Breaches</span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5" />
            {stats.overdueCount}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Breached Target Date</span>
        </div>
      </div>

      {/* Add New CAPA Item */}
      <div className="saas-card p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-600" />
          Log New Audit Finding / Corrective Action
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Audit Finding / Non-Conformity Description
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Missing TLS 1.3 enforcement on backend microservice..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Audit Source
            </label>
            <select
              value={newSource}
              onChange={e => setNewSource(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            >
              <option value="External VAPT">External VAPT (CERT-In)</option>
              <option value="RBI Inspection">RBI Statutory Inspection</option>
              <option value="Internal Audit">Internal IS Audit</option>
              <option value="CERT-In Advisory">CERT-In Security Advisory</option>
              <option value="DPDP Audit">DPDP Data Privacy Review</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Remediation SLA Priority
            </label>
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            >
              <option value="P0 - Blocker (7d)">P0 - Blocker (7 Days SLA)</option>
              <option value="P1 - Critical (15d)">P1 - Critical (15 Days SLA)</option>
              <option value="P2 - High (30d)">P2 - High (30 Days SLA)</option>
              <option value="P3 - Medium (60d)">P3 - Medium (60 Days SLA)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Owner / Assignee
            </label>
            <input
              type="text"
              value={newAssignee}
              onChange={e => setNewAssignee(e.target.value)}
              placeholder="e.g. Infrastructure Team"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Target Closure Date
            </label>
            <input
              type="date"
              value={newTargetDate}
              onChange={e => setNewTargetDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleAddItem}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Append Action Item
          </button>
        </div>
      </div>

      {/* Action Items List */}
      <div className="saas-card p-6 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Corrective Action Backlog ({items.length} Findings)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status tracking with SLA countdown for internal and external auditors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy CAPA Report'}
            </button>
            <button
              onClick={handleDownloadReport}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Report
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {items.map(item => {
            const isOverdue = new Date(item.targetDate).getTime() < new Date().getTime() && item.status !== 'Closed';
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.status === 'Closed'
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : isOverdue
                    ? 'border-rose-500/30 bg-rose-500/5'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'
                } flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {item.findingTitle}
                    </span>
                    <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded text-[11px] font-medium">
                      {item.source}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.priority.includes('P0')
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.priority.split(' ')[0]}
                    </span>
                    {isOverdue && (
                      <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-[11px] font-bold animate-pulse">
                        OVERDUE SLA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-slate-500 flex-wrap">
                    <span>Assignee: <strong className="text-slate-700 dark:text-slate-300">{item.assignee}</strong></span>
                    <span>•</span>
                    <span>Target Date: <strong className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>{item.targetDate}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={item.status}
                    onChange={e => handleUpdateStatus(item.id, e.target.value as any)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold outline-hidden"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Verification">Verification</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1.5"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
