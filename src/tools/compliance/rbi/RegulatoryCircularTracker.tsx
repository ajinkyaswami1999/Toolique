import { useState, useMemo } from 'react';
import {
  Landmark,
  ShieldCheck,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Building,
  Tag,
  Download
} from 'lucide-react';

interface CircularItem {
  id: string;
  refNumber: string;
  title: string;
  regulator: 'RBI' | 'NPCI' | 'SEBI';
  entityType: string[];
  issuedDate: string;
  effectiveDate: string;
  description: string;
  actionItems: string[];
}

const REGULATORY_CIRCULARS: CircularItem[] = [
  {
    id: 'circ_it_gov_2023',
    refNumber: 'RBI/2023-24/107 DoS.CO.CSITE.SEC.No.5/31.01.015/2023-24',
    title: 'Master Direction on IT Governance, Risk, Controls and Assurance Practices, 2023',
    regulator: 'RBI',
    entityType: ['Banks', 'NBFCs', 'Payment Banks'],
    issuedDate: '2023-11-07',
    effectiveDate: '2024-04-01',
    description: 'Comprehensive guidelines establishing Board IT Strategy Committees, mandatory CISO reporting structures, 90-day secret key rotations, mTLS 1.2+ for partner integrations, and cyber drills.',
    actionItems: [
      'Appoint qualified CISO reporting directly to ED or Board Risk Committee',
      'Establish IT Strategy Committee at Board level',
      'Enforce mTLS and payload integrity on all partner API gateways',
      'Conduct annual cyber crisis management drills'
    ]
  },
  {
    id: 'circ_fldg_2023',
    refNumber: 'DOR.CRE.REC.23/21.07.001/2023-24',
    title: 'Guidelines on Default Loss Guarantee (DLG) in Digital Lending',
    regulator: 'RBI',
    entityType: ['Banks', 'NBFCs', 'FinTechs/LSPs'],
    issuedDate: '2023-06-08',
    effectiveDate: '2023-06-08',
    description: 'Authorizes Default Loss Guarantee (FLDG) arrangements between REs and FinTech LSPs subject to a strict 5% portfolio cap, backed strictly by Cash, SCB FD lien, or Bank Guarantee.',
    actionItems: [
      'Audit all LSP contracts to ensure DLG does not exceed 5% portfolio ceiling',
      'Replace corporate guarantees with FD liens or Bank Guarantees',
      'Submit statutory auditor certificate certifying FLDG compliance',
      'Publish list of partnered LSPs prominently on RE website'
    ]
  },
  {
    id: 'circ_kfs_2024',
    refNumber: 'DOR.STR.REC.10/13.03.00/2024-25',
    title: 'Master Direction on Key Fact Statement (KFS) for Retail & MSME Loans',
    regulator: 'RBI',
    entityType: ['Banks', 'NBFCs', 'Digital Lenders'],
    issuedDate: '2024-04-15',
    effectiveDate: '2024-10-01',
    description: 'Mandates standardized Key Fact Statement (KFS) with True Annual Percentage Rate (APR) disclosure, cooling-off look-up period, and prohibition on charging any fee not disclosed in KFS.',
    actionItems: [
      'Implement standardized 1-page KFS template prior to loan execution',
      'Compute True APR via internal rate of return incorporating all processing fees',
      'Enforce minimum 3-day cooling-off period for loans >= 7 days tenure',
      'Provide KFS copy with acknowledgement in borrower portal'
    ]
  },
  {
    id: 'circ_outsourcing_2023',
    refNumber: 'RBI/2023-24/13 DoS.CO.CSITE.SEC.No.1/31.01.015/2023-24',
    title: 'Master Direction on Outsourcing of Information Technology Services',
    regulator: 'RBI',
    entityType: ['Banks', 'NBFCs', 'Payment Aggregators'],
    issuedDate: '2023-04-10',
    effectiveDate: '2023-10-01',
    description: 'Establishes governance over material IT outsourcing, unrestricted Right-to-Audit clauses for RE and RBI, sub-contracting approval mandates, and 2-hour breach reporting SLAs.',
    actionItems: [
      'Classify vendors into Material vs Non-Material tiers',
      'Amend vendor agreements to include unconditional RBI right-to-audit',
      'Enforce in-country data localization clauses for third-party processors',
      'Conduct annual joint BCP/DR failover drills'
    ]
  },
  {
    id: 'circ_dpsc_2021',
    refNumber: 'RBI/2020-21/74 DoS.CO.CSITE.SEC.No.1852/31.01.015/2020-21',
    title: 'Master Direction on Digital Payment Security Controls (MD-DPSC)',
    regulator: 'RBI',
    entityType: ['Banks', 'Payment Aggregators', 'PPI Issuers'],
    issuedDate: '2021-02-18',
    effectiveDate: '2021-08-18',
    description: 'Mandatory technical controls for internet & mobile banking, Card-Not-Present AFA 2FA, 5-minute inactivity logout, mobile app root/jailbreak detection, and SSL certificate pinning.',
    actionItems: [
      'Deploy SSL Pinning and root detection in consumer mobile apps',
      'Enforce 5-minute inactivity auto-logout on payment web sessions',
      'Implement dynamic risk-based authentication (RBA) on high-value transfers',
      'Enforce beneficiary addition cooling-off period (min 2 hours)'
    ]
  },
  {
    id: 'circ_coft_2023',
    refNumber: 'DPSS.CO.PD No.S702/02.14.003/2023-24',
    title: 'Card-on-File Tokenization (CoFT) – Enabling Tokenization through Card Issuers',
    regulator: 'RBI',
    entityType: ['Payment Aggregators', 'Merchants', 'Card Networks'],
    issuedDate: '2023-10-19',
    effectiveDate: '2023-10-19',
    description: 'Expands CoFT directly to card issuing banks, completely eliminating raw PAN/CVV storage on merchant databases and guest checkout flows.',
    actionItems: [
      'Purge any legacy card numbers, CVV, or expiry stored in merchant databases',
      'Integrate card network tokenization APIs (Visa, Mastercard, RuPay)',
      'Ensure guest checkouts utilize tokenization without server caching',
      'Enforce consumer token management portal for revoking tokens'
    ]
  },
  {
    id: 'circ_emandate_2023',
    refNumber: 'NPCI/2023-24/NACH/012',
    title: 'Enhancement of E-Mandate Limit for Mutual Funds, Insurance & Subscriptions',
    regulator: 'NPCI',
    entityType: ['Banks', 'FinTechs', 'Payment Aggregators'],
    issuedDate: '2023-12-14',
    effectiveDate: '2024-01-01',
    description: 'Revision of e-mandate limit from ₹15,000 to ₹1,00,000 per transaction for recurring payments towards mutual fund subscriptions, insurance premiums, and credit card bill payments without AFA.',
    actionItems: [
      'Update recurring billing engine to support ₹1,00,000 limits for eligible categories',
      'Enforce pre-debit notification SMS/email 24 hours prior to execution',
      'Provide instant online mandate cancellation facility to customers'
    ]
  }
];

export default function RegulatoryCircularTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [regulatorFilter, setRegulatorFilter] = useState<string>('All');
  const [circularStatus, setCircularStatus] = useState<Record<string, 'implemented' | 'in_progress' | 'review'>>(() => {
    const init: Record<string, 'implemented' | 'in_progress' | 'review'> = {};
    REGULATORY_CIRCULARS.forEach(c => {
      init[c.id] = 'in_progress';
    });
    return init;
  });

  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    let implemented = 0;
    let inProgress = 0;
    let review = 0;

    REGULATORY_CIRCULARS.forEach(c => {
      const s = circularStatus[c.id];
      if (s === 'implemented') implemented++;
      else if (s === 'in_progress') inProgress++;
      else review++;
    });

    const percent = Math.round((implemented / REGULATORY_CIRCULARS.length) * 100);
    return { implemented, inProgress, review, percent };
  }, [circularStatus]);

  const filteredCirculars = useMemo(() => {
    return REGULATORY_CIRCULARS.filter(c => {
      const matchesReg = regulatorFilter === 'All' || c.regulator === regulatorFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.title.toLowerCase().includes(q) ||
        c.refNumber.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.entityType.some(e => e.toLowerCase().includes(q));
      return matchesReg && matchesSearch;
    });
  }, [searchQuery, regulatorFilter]);

  const handleCopyTracker = () => {
    const text = `=====================================================
RBI & NPCI REGULATORY CIRCULAR COMPLIANCE TRACKER
Toolique Compliance & Regulatory Suite
=====================================================
Export Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Implementation Rate: ${stats.percent}% (${stats.implemented}/${REGULATORY_CIRCULARS.length} Circulars Completed)
In Progress: ${stats.inProgress}
Under Legal Review: ${stats.review}

REGULATORY CIRCULAR STATUS:
${REGULATORY_CIRCULARS.map(c => `[${circularStatus[c.id].toUpperCase()}] ${c.title} (${c.refNumber})
- Effective Date: ${c.effectiveDate} | Regulator: ${c.regulator}
- Target Entities: ${c.entityType.join(', ')}
- Action Items: ${c.actionItems.join('; ')}`).join('\n\n')}
=====================================================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTracker = () => {
    const text = `=====================================================
RBI & NPCI REGULATORY CIRCULAR COMPLIANCE TRACKER
Toolique Compliance & Regulatory Suite
=====================================================
Export Date: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Overall Implementation Rate: ${stats.percent}% (${stats.implemented}/${REGULATORY_CIRCULARS.length} Circulars Completed)
In Progress: ${stats.inProgress}
Under Legal Review: ${stats.review}

REGULATORY CIRCULAR STATUS:
${REGULATORY_CIRCULARS.map(c => `[${circularStatus[c.id].toUpperCase()}] ${c.title} (${c.refNumber})
- Effective Date: ${c.effectiveDate} | Regulator: ${c.regulator}
- Target Entities: ${c.entityType.join(', ')}
- Action Items: ${c.actionItems.join('; ')}`).join('\n\n')}
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Regulatory_Circular_Tracker_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              RBI & Financial Regulatory Circular Tracker
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Track mandatory directions, statutory implementation deadlines, and compliance milestones across RBI, NPCI, and SEBI.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Statutory Database</span>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Compliance Readiness</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.percent}%
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Fully Implemented</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            {stats.implemented}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Audit Certified</span>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Work In Progress</span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-5 h-5" />
            {stats.inProgress}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Active Engineering</span>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Under Legal Review</span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1.5">
            <FileText className="w-5 h-5" />
            {stats.review}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Policy Review</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search circulars, ref numbers, keywords..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {['All', 'RBI', 'NPCI'].map(r => (
            <button
              key={r}
              onClick={() => setRegulatorFilter(r)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                regulatorFilter === r
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {r}
            </button>
          ))}
          <button
            onClick={handleCopyTracker}
            className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors ml-2"
            title="Copy Circular Matrix"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownloadTracker}
            className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Download Matrix"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Circular Cards */}
      <div className="space-y-4">
        {filteredCirculars.map(c => {
          const currentStatus = circularStatus[c.id];
          return (
            <div
              key={c.id}
              className={`saas-card p-5 rounded-xl border transition-all ${
                currentStatus === 'implemented'
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : currentStatus === 'in_progress'
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {c.regulator}
                    </span>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {c.refNumber}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Effective: {c.effectiveDate}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
                    {c.description}
                  </p>

                  {/* Target Entities */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Building className="w-3 h-3" /> Applicable to:
                    </span>
                    {c.entityType.map(e => (
                      <span
                        key={e}
                        className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full"
                      >
                        {e}
                      </span>
                    ))}
                  </div>

                  {/* Action Items List */}
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      Key Statutory Implementation Items:
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {c.actionItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex sm:flex-col items-center gap-1.5 self-start shrink-0">
                  <button
                    onClick={() => setCircularStatus(prev => ({ ...prev, [c.id]: 'implemented' }))}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                      currentStatus === 'implemented'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Implemented
                  </button>
                  <button
                    onClick={() => setCircularStatus(prev => ({ ...prev, [c.id]: 'in_progress' }))}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                      currentStatus === 'in_progress'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    In Progress
                  </button>
                  <button
                    onClick={() => setCircularStatus(prev => ({ ...prev, [c.id]: 'review' }))}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                      currentStatus === 'review'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Under Review
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
