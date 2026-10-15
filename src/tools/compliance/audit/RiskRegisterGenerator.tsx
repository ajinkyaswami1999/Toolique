import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  Check,
  FileSpreadsheet
} from 'lucide-react';

interface RiskEntry {
  id: string;
  threat: string;
  category: 'Cybersecurity' | 'Data Privacy' | 'Regulatory' | 'Operational' | 'Third-Party';
  likelihood: number; // 1 to 5
  impact: number; // 1 to 5
  inherentScore: number;
  treatment: 'Mitigate' | 'Transfer' | 'Avoid' | 'Accept';
  controls: string;
  residualScore: number;
  owner: string;
}

const INITIAL_RISKS: RiskEntry[] = [
  {
    id: 'r_1',
    threat: 'Unencrypted PII leak in public S3 bucket leading to DPDP Section 33 fine',
    category: 'Data Privacy',
    likelihood: 4,
    impact: 5,
    inherentScore: 20,
    treatment: 'Mitigate',
    controls: 'Automated S3 public access block, AWS Macie PII scanning, and KMS encryption.',
    residualScore: 4,
    owner: 'Cloud Infrastructure Team'
  },
  {
    id: 'r_2',
    threat: 'DDoS attack disrupting mobile banking UPI switch gateway',
    category: 'Cybersecurity',
    likelihood: 3,
    impact: 4,
    inherentScore: 12,
    treatment: 'Mitigate',
    controls: 'Cloudflare / AWS Shield Advanced anti-DDoS and rate limiting.',
    residualScore: 6,
    owner: 'Network Engineering'
  },
  {
    id: 'r_3',
    threat: 'SaaS CRM vendor breach compromising customer contact numbers',
    category: 'Third-Party',
    likelihood: 3,
    impact: 3,
    inherentScore: 9,
    treatment: 'Transfer',
    controls: 'Cyber insurance policy with ₹10 Cr coverage and vendor right-to-audit clauses.',
    residualScore: 3,
    owner: 'Vendor Management'
  }
];

export default function RiskRegisterGenerator() {
  const [risks, setRisks] = useState<RiskEntry[]>(INITIAL_RISKS);
  const [threatInput, setThreatInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<RiskEntry['category']>('Cybersecurity');
  const [likelihoodInput, setLikelihoodInput] = useState<number>(3);
  const [impactInput, setImpactInput] = useState<number>(4);
  const [treatmentInput, setTreatmentInput] = useState<RiskEntry['treatment']>('Mitigate');
  const [controlsInput, setControlsInput] = useState('');
  const [ownerInput, setOwnerInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAddRisk = () => {
    if (!threatInput.trim()) return;
    const inherent = likelihoodInput * impactInput;
    const residual = treatmentInput === 'Mitigate' ? Math.ceil(inherent * 0.4) : inherent;

    const newRisk: RiskEntry = {
      id: `risk_${Date.now()}`,
      threat: threatInput.trim(),
      category: categoryInput,
      likelihood: likelihoodInput,
      impact: impactInput,
      inherentScore: inherent,
      treatment: treatmentInput,
      controls: controlsInput.trim() || 'Internal SOP and monitoring',
      residualScore: residual,
      owner: ownerInput.trim() || 'Information Security Team'
    };

    setRisks(prev => [newRisk, ...prev]);
    setThreatInput('');
    setControlsInput('');
    setOwnerInput('');
  };

  const handleRemove = (id: string) => {
    setRisks(prev => prev.filter(r => r.id !== id));
  };

  // 5x5 Matrix Cell Counts
  const matrixCounts = useMemo(() => {
    const grid: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
    risks.forEach(r => {
      const lIdx = r.likelihood - 1;
      const iIdx = r.impact - 1;
      if (lIdx >= 0 && lIdx < 5 && iIdx >= 0 && iIdx < 5) {
        grid[lIdx][iIdx]++;
      }
    });
    return grid;
  }, [risks]);

  const handleCopyRegister = () => {
    const text = `=====================================================
ENTERPRISE STATUTORY RISK REGISTER (ISO 31000 / 27005)
Toolique Compliance & Regulatory Suite
=====================================================
Export Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Total Identified Risks: ${risks.length}

RISK REGISTER ENTRIES:
${risks.map((r, idx) => `[Risk #${idx + 1}]
- Threat / Vulnerability: ${r.threat}
- Category: ${r.category} | Owner: ${r.owner}
- Likelihood: ${r.likelihood}/5 | Impact: ${r.impact}/5
- Inherent Risk Score: ${r.inherentScore} / 25
- Treatment Strategy: ${r.treatment}
- Mitigation Controls: ${r.controls}
- Residual Risk Score: ${r.residualScore} / 25`).join('\n\n')}
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const headers = 'ID,Threat Description,Category,Likelihood,Impact,Inherent Score,Treatment,Mitigating Controls,Residual Score,Risk Owner\n';
    const rows = risks.map(r =>
      `"${r.id}","${r.threat.replace(/"/g, '""')}","${r.category}",${r.likelihood},${r.impact},${r.inherentScore},"${r.treatment}","${r.controls.replace(/"/g, '""')}",${r.residualScore},"${r.owner}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Risk_Register_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Enterprise 5×5 Risk Matrix & Statutory Risk Register Studio
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Score inherent and residual risks under ISO 31000 / ISO 27005 and generate printable risk registers with heatmaps.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>ISO 31000 Compliant</span>
        </div>
      </div>

      {/* 5x5 Heatmap Matrix Visualization */}
      <div className="saas-card p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
          5×5 Likelihood vs Impact Risk Heatmap
        </h3>

        <div className="overflow-x-auto">
          <div className="min-w-[480px] space-y-2 text-xs">
            {/* Header row (Impact) */}
            <div className="grid grid-cols-6 gap-2 text-center font-bold text-slate-500">
              <span className="text-left font-normal">Likelihood ↓ | Impact →</span>
              <span>1: Negligible</span>
              <span>2: Minor</span>
              <span>3: Moderate</span>
              <span>4: Major</span>
              <span>5: Catastrophic</span>
            </div>

            {/* Matrix Rows (Likelihood from 5 down to 1) */}
            {[5, 4, 3, 2, 1].map(l => {
              const lIdx = l - 1;
              return (
                <div key={l} className="grid grid-cols-6 gap-2 text-center">
                  <span className="font-semibold text-slate-600 dark:text-slate-400 text-left self-center">
                    L{l}: {['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'][lIdx]}
                  </span>
                  {[1, 2, 3, 4, 5].map(imp => {
                    const impIdx = imp - 1;
                    const score = l * imp;
                    const count = matrixCounts[lIdx][impIdx];

                    let bg = 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20';
                    if (score >= 15) bg = 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/30';
                    else if (score >= 8) bg = 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30';

                    return (
                      <div
                        key={imp}
                        className={`p-3 rounded-lg border font-mono font-bold flex flex-col items-center justify-center ${bg}`}
                      >
                        <span className="text-[11px] opacity-60">Score {score}</span>
                        <span className="text-sm font-extrabold">{count > 0 ? `${count} Risk${count > 1 ? 's' : ''}` : '-'}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Risk Form */}
      <div className="saas-card p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-600" />
          Add Threat Scenario to Register
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Threat / Vulnerability Scenario
            </label>
            <input
              type="text"
              value={threatInput}
              onChange={e => setThreatInput(e.target.value)}
              placeholder="e.g. Unauthenticated API endpoint exposes borrower credit reports..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Risk Category
            </label>
            <select
              value={categoryInput}
              onChange={e => setCategoryInput(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            >
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Data Privacy">Data Privacy (DPDP)</option>
              <option value="Regulatory">Regulatory (RBI/SEBI)</option>
              <option value="Operational">Operational</option>
              <option value="Third-Party">Third-Party</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Likelihood (1 to 5)
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={likelihoodInput}
              onChange={e => setLikelihoodInput(Math.max(1, Math.min(5, Number(e.target.value))))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Impact (1 to 5)
            </label>
            <input
              type="number"
              min={1}
              max={5}
              value={impactInput}
              onChange={e => setImpactInput(Math.max(1, Math.min(5, Number(e.target.value))))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Treatment Strategy
            </label>
            <select
              value={treatmentInput}
              onChange={e => setTreatmentInput(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            >
              <option value="Mitigate">Mitigate (Controls)</option>
              <option value="Transfer">Transfer (Insurance/Contract)</option>
              <option value="Avoid">Avoid (Cease Activity)</option>
              <option value="Accept">Accept (Documented Risk)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Risk Owner
            </label>
            <input
              type="text"
              value={ownerInput}
              onChange={e => setOwnerInput(e.target.value)}
              placeholder="e.g. CISO / SecOps"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleAddRisk}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Append to Register
          </button>
        </div>
      </div>

      {/* Risk Register Table */}
      <div className="saas-card p-6 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Statutory Risk Register ({risks.length} Scenarios)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inherent Score = Likelihood × Impact. Residual Score incorporates treatment controls.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRegister}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Download CSV
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {risks.map(r => (
            <div
              key={r.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                    {r.threat}
                  </span>
                  <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded text-[11px] font-medium">
                    {r.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      r.inherentScore >= 15
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : r.inherentScore >= 8
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    Inherent: {r.inherentScore}/25
                  </span>
                </div>

                <div className="flex items-center gap-3 text-slate-500 flex-wrap">
                  <span>Strategy: <strong className="text-slate-700 dark:text-slate-300">{r.treatment}</strong></span>
                  <span>•</span>
                  <span>Residual Score: <strong className="text-emerald-600 font-bold">{r.residualScore}/25</strong></span>
                  <span>•</span>
                  <span>Owner: {r.owner}</span>
                </div>
              </div>

              <button
                onClick={() => handleRemove(r.id)}
                className="text-slate-400 hover:text-rose-600 transition-colors self-end sm:self-center p-1.5"
                title="Remove Entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
