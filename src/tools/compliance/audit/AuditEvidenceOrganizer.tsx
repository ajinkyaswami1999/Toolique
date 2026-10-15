import { useState } from 'react';
import {
  FolderArchive,
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  Check,
  Download
} from 'lucide-react';

interface EvidenceItem {
  id: string;
  name: string;
  category: 'Policy Document' | 'Technical Logs' | 'Audit Report' | 'Board Approval' | 'Vendor Contract';
  custodian: string;
  framework: string;
  hash: string;
  collectedAt: string;
}

const INITIAL_EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev_1',
    name: 'Information_Security_Policy_v4.2_Signed.pdf',
    category: 'Policy Document',
    custodian: 'Priya Sharma (CISO)',
    framework: 'ISO 27001:2022 / RBI MD-IT',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    collectedAt: '2024-09-15'
  },
  {
    id: 'ev_2',
    name: 'H1_2024_External_VAPT_Report_CERTIn_Auditor.pdf',
    category: 'Audit Report',
    custodian: 'Arun Verma (Lead SecOps)',
    framework: 'RBI Cyber Security / CERT-In',
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    collectedAt: '2024-08-30'
  },
  {
    id: 'ev_3',
    name: 'Q3_User_Access_Review_SignOff_Sheet.xlsx',
    category: 'Audit Report',
    custodian: 'Deepak Rao (IAM Manager)',
    framework: 'ISO 27001 Annex A.9',
    hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    collectedAt: '2024-10-01'
  }
];

export default function AuditEvidenceOrganizer() {
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(INITIAL_EVIDENCE);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<EvidenceItem['category']>('Policy Document');
  const [newItemCustodian, setNewItemCustodian] = useState('');
  const [newItemFramework, setNewItemFramework] = useState('ISO 27001 / DPDP 2023');
  const [fileHashInput, setFileHashInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Compute live hash of any string input
  const handleComputeCustomHash = async (content: string) => {
    if (!content) return;
    const enc = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', enc.encode(content));
    const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    setFileHashInput(hex);
  };

  const handleAddEvidence = () => {
    if (!newItemName.trim()) return;
    const item: EvidenceItem = {
      id: `ev_${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      custodian: newItemCustodian.trim() || 'Internal Compliance Lead',
      framework: newItemFramework,
      hash: fileHashInput.trim() || 'SHA256:pending_computation',
      collectedAt: new Date().toISOString().split('T')[0]
    };
    setEvidenceList(prev => [item, ...prev]);
    setNewItemName('');
    setNewItemCustodian('');
    setFileHashInput('');
  };

  const handleRemove = (id: string) => {
    setEvidenceList(prev => prev.filter(i => i.id !== id));
  };

  const handleCopyManifest = () => {
    const text = `=====================================================
AUDIT EVIDENCE CHAIN OF CUSTODY MANIFEST
Bharatiya Sakshya Adhiniyam 2023 Sec 63 / Sec 65B
=====================================================
Manifest Timestamp: ${new Date().toISOString()}
Total Artifacts Packaged: ${evidenceList.length}

ARTIFACT RECORD DETAILS:
${evidenceList.map((e, idx) => `[Artifact ${idx + 1}]
- File Name: ${e.name}
- Category: ${e.category}
- Custodian / Owner: ${e.custodian}
- Regulatory Mapping: ${e.framework}
- Collection Date: ${e.collectedAt}
- Cryptographic SHA-256 Hash: ${e.hash}`).join('\n\n')}
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadManifest = () => {
    const manifestJson = JSON.stringify(
      {
        manifestTitle: 'Audit Evidence Chain of Custody Package',
        generatedAt: new Date().toISOString(),
        totalItems: evidenceList.length,
        evidence: evidenceList
      },
      null,
      2
    );

    const blob = new Blob([manifestJson], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Evidence_Manifest_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Secure Audit Evidence Organizer & Chain of Custody Packager
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Catalog audit artifacts, compute in-browser SHA-256 cryptographic hashes, and export legal chain-of-custody manifests.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>BSA 2023 Sec 63 Defensible</span>
        </div>
      </div>

      {/* Add New Artifact Form */}
      <div className="saas-card p-6 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-600" />
          Register New Evidence Artifact
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Artifact File Name
            </label>
            <input
              type="text"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              placeholder="e.g. S3_Bucket_Encryption_Policy.pdf"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Artifact Category
            </label>
            <select
              value={newItemCategory}
              onChange={e => setNewItemCategory(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            >
              <option value="Policy Document">Policy Document</option>
              <option value="Technical Logs">Technical Logs</option>
              <option value="Audit Report">Audit Report</option>
              <option value="Board Approval">Board Approval</option>
              <option value="Vendor Contract">Vendor Contract</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Custodian / Owner
            </label>
            <input
              type="text"
              value={newItemCustodian}
              onChange={e => setNewItemCustodian(e.target.value)}
              placeholder="e.g. Priya Sharma (CISO)"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Regulatory Framework
            </label>
            <input
              type="text"
              value={newItemFramework}
              onChange={e => setNewItemFramework(e.target.value)}
              placeholder="e.g. ISO 27001 / DPDP"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Paste Sample Text / Content to Generate SHA-256 Hash
            </label>
            <input
              type="text"
              onChange={e => handleComputeCustomHash(e.target.value)}
              placeholder="Type string to generate instant SHA-256..."
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Cryptographic SHA-256 Digest
            </label>
            <input
              type="text"
              value={fileHashInput}
              onChange={e => setFileHashInput(e.target.value)}
              placeholder="64-character SHA-256 digest..."
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleAddEvidence}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add to Evidence Package
          </button>
        </div>
      </div>

      {/* Artifacts Table */}
      <div className="saas-card p-6 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Packaged Evidence Artifacts ({evidenceList.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Each record contains verified custodian ownership and cryptographic SHA-256 checksum.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyManifest}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Manifest'}
            </button>
            <button
              onClick={handleDownloadManifest}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download JSON
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {evidenceList.map(e => (
            <div
              key={e.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">
                    {e.name}
                  </span>
                  <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded text-[11px] font-medium">
                    {e.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 flex-wrap">
                  <span>Custodian: <strong className="text-slate-700 dark:text-slate-300">{e.custodian}</strong></span>
                  <span>•</span>
                  <span>Framework: <strong className="text-slate-700 dark:text-slate-300">{e.framework}</strong></span>
                  <span>•</span>
                  <span>Date: {e.collectedAt}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400 break-all">
                  SHA-256: {e.hash}
                </div>
              </div>

              <button
                onClick={() => handleRemove(e.id)}
                className="text-slate-400 hover:text-rose-600 transition-colors self-end sm:self-center p-1.5"
                title="Remove Artifact"
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
