import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Landmark,
  Fingerprint,
  FileCheck,
  Search,
  Lock,
  Scale,
  HelpCircle,
  Clock
} from 'lucide-react';
import { toolsList } from '../data/tools';
import ToolCard from '../components/ToolCard';
import SEO from '../components/SEO';
import { getToolCanonicalPath } from '../routes/AppRoutes';

interface FAQItem {
  question: string;
  answer: string;
}

export default function ComplianceHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter tools for the Compliance & Regulatory Suite
  const complianceTools = useMemo(() => {
    return toolsList.filter(t =>
      ['compliance', 'dpdp-privacy', 'rbi-financial', 'uidai-aadhaar', 'audit-evidence'].includes(t.category)
    );
  }, []);

  // 4 Category Clusters
  const categoriesData = [
    {
      id: 'dpdp-privacy',
      name: 'DPDP & Privacy',
      shortName: 'DPDP & Privacy',
      statute: 'Digital Personal Data Protection Act, 2023',
      authority: 'Data Protection Board of India (DPBI) / MeitY',
      description: 'Audit 8 statutory data protection pillars, evaluate Significant Data Fiduciary (SDF) status under Section 10, simulate Section 33 penalties up to ₹250 Cr, and generate Section 5 bilingual consent notices.',
      icon: Shield,
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      tools: complianceTools.filter(t => t.category === 'dpdp-privacy')
    },
    {
      id: 'rbi-financial',
      name: 'RBI & Financial Regulations',
      shortName: 'RBI & FinTech',
      statute: 'Digital Lending Guidelines (DLG) & FLDG Circular 2023',
      authority: 'Reserve Bank of India (RBI)',
      description: 'Audit RE & LSP digital lending practices, calculate the statutory 5% First Loss Default Guarantee (FLDG) portfolio cap, enforce escrow bank-to-bank routing, and compute Key Fact Statement (KFS) True APR.',
      icon: Landmark,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      tools: complianceTools.filter(t => t.category === 'rbi-financial')
    },
    {
      id: 'uidai-aadhaar',
      name: 'UIDAI & Aadhaar',
      shortName: 'UIDAI & Aadhaar',
      statute: 'Aadhaar Act 2016 & ADV Regulations Circular',
      authority: 'Unique Identification Authority of India (UIDAI)',
      description: 'Validate 12-digit Aadhaar numbers using the official Verhoeff Dihedral D5 check digit algorithm, format statutory masked Aadhaar (XXXX-XXXX-1234), test ADV surrogate tokenization, and diagnose RD Service L0/L1 devices.',
      icon: Fingerprint,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      tools: complianceTools.filter(t => t.category === 'uidai-aadhaar')
    },
    {
      id: 'audit-evidence',
      name: 'Audit & Evidence Management',
      shortName: 'Audit & Evidence',
      statute: 'CERT-In Directions 2022 & BSA 2023 Sec 63 / Sec 65B',
      authority: 'CERT-In & High Courts of India',
      description: 'Calculate mandatory 6-hour cybersecurity incident reporting deadlines under IT Act § 70B, audit 180-day ICT logs storage with NPL NTP clock sync, and generate court-admissible electronic evidence certificates.',
      icon: FileCheck,
      color: 'from-purple-500/10 to-rose-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      tools: complianceTools.filter(t => t.category === 'audit-evidence')
    }
  ];

  // Filter tools by active category & search query
  const displayedCategories = useMemo(() => {
    let cats = categoriesData;
    if (selectedCategory !== 'all') {
      cats = cats.filter(c => c.id === selectedCategory);
    }

    if (!searchQuery.trim()) return cats;

    const query = searchQuery.toLowerCase();
    return cats.map(c => ({
      ...c,
      tools: c.tools.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.shortDescription.toLowerCase().includes(query) ||
        t.keywords.some(k => k.toLowerCase().includes(query))
      )
    })).filter(c => c.tools.length > 0);
  }, [selectedCategory, searchQuery, complianceTools]);

  const faqs: FAQItem[] = [
    {
      question: 'What is the Compliance & Regulatory Suite on Toolique?',
      answer: 'The Compliance & Regulatory Suite provides client-side statutory assessment calculators, compliance audit matrices, and cryptographic evidence generators for organizations operating in India under the DPDP Act 2023, RBI Digital Lending Guidelines, UIDAI Aadhaar Regulations, and CERT-In Directions 2022.'
    },
    {
      question: 'Is any confidential business compliance data or Aadhaar numbers transmitted to servers?',
      answer: 'Never. Toolique operates on a strict zero-knowledge, client-side execution model. All calculations, Verhoeff checksum algorithms, FLDG cap computations, 6-hour countdowns, and SHA-256 evidence hashing execute entirely in your web browser memory. No data is stored, logged, or sent across any network.'
    },
    {
      question: 'How do the 4 categories align with statutory authorities in India?',
      answer: 'The suite is structured into 4 statutory pillars: (1) DPDP & Privacy (Data Protection Board of India & MeitY), (2) RBI & Financial Regulations (Reserve Bank of India FinTech directives), (3) UIDAI & Aadhaar (Unique Identification Authority of India), and (4) Audit & Evidence Management (CERT-In IT Act Sec 70B & Section 63 Bharatiya Sakshya Adhiniyam / Section 65B Evidence Act).'
    },
    {
      question: 'Can I export audit checklists and Section 65B / BSA 63 certificates for legal proceedings?',
      answer: 'Yes. Each tool features instant copy and download capabilities for audit documentation, including pre-formatted incident notifications for incident@cert-in.org.in, itemized DPDP consent notices, and court-admissible electronic record certificates.'
    }
  ];

  const hubSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://www.toolique.in/compliance#collection',
        'name': 'Compliance & Regulatory Suite – DPDP, RBI DLG, UIDAI & CERT-In | Toolique',
        'description': 'Statutory compliance & regulatory calculation suite for Indian enterprises. Evaluate DPDP Act 2023 readiness, audit RBI Digital Lending 5% FLDG caps, test UIDAI Aadhaar Vault & Verhoeff, and track CERT-In 6-hour incident deadlines.',
        'url': 'https://www.toolique.in/compliance',
        'mainEntity': {
          '@type': 'ItemList',
          'name': 'Compliance & Regulatory Tools Directory',
          'numberOfItems': complianceTools.length,
          'itemListElement': complianceTools.map((t, idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'name': t.name,
            'url': `https://www.toolique.in/${getToolCanonicalPath(t.category, t.slug)}`
          }))
        }
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.toolique.in/compliance#faq',
        'mainEntity': faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      }
    ]
  };

  return (
    <>
      <SEO
        title="Compliance & Regulatory Suite – DPDP, RBI DLG, UIDAI & CERT-In | Toolique"
        description="Comprehensive statutory compliance and regulatory calculation suite for Indian enterprises. Evaluate DPDP Act 2023 readiness, audit RBI Digital Lending 5% FLDG caps, test UIDAI Aadhaar Vault & Verhoeff, and track CERT-In 6-hour incident deadlines."
        keywords={[
          'Compliance Suite India',
          'DPDP Act 2023 compliance',
          'RBI Digital Lending Guidelines',
          'FLDG 5% cap calculator',
          'UIDAI Aadhaar Data Vault',
          'Verhoeff algorithm validator',
          'CERT-In 6-hour incident reporting',
          'Section 65B Indian Evidence Act',
          'Bharatiya Sakshya Adhiniyam Section 63',
          'FinTech compliance tools India'
        ]}
        canonicalUrl="/compliance"
        schemaMarkup={hubSchema}
      />

      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
        {/* HERO SECTION */}
        <div className="relative border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md pt-12 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs">
              <Scale className="w-3.5 h-3.5" />
              Indian Statutory Frameworks • 100% Client-Side Privacy
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Compliance & Regulatory Suite
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Statutory assessment engines, regulatory risk calculators, and court-admissible evidence generators for Indian enterprises, FinTechs, banks, and IT teams operating under Indian statutory law.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 flex flex-wrap justify-center items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                DPDP Act 2023 Readiness
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                RBI 5% FLDG & DLG Audit
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <Fingerprint className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                UIDAI Verhoeff Checksum & ADV
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                CERT-In 6-Hour Clock & BSA 63
              </span>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto pt-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search compliance tools by act, guideline, section, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
          {/* CATEGORY SELECTOR PILLS */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Categories ({complianceTools.length})
            </button>
            {categoriesData.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.shortName} ({cat.tools.length})
                </button>
              );
            })}
          </div>

          {/* 4 STATUTORY CATEGORY CLUSTERS */}
          <div className="space-y-12">
            {displayedCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} className="space-y-4">
                  {/* Category Header */}
                  <div className={`p-5 rounded-2xl border bg-gradient-to-r ${category.color} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {category.name}
                          </h2>
                          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${category.badgeColor}`}>
                            {category.authority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 font-medium shrink-0 self-start md:self-auto bg-white/60 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      Statutory Basis: <strong>{category.statute}</strong>
                    </div>
                  </div>

                  {/* Tool Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.tools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* STATUTORY COMPLIANCE ARCHITECTURE OVERVIEW */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Indian Regulatory & Compliance Architecture
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Key mandates governing enterprise data governance, financial licensing, identity security, and legal evidence.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  <Shield className="w-4 h-4" />
                  DPDP Act, 2023
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Data Principal Rights & SDF Mandates
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Replaces SPDI Rules 2011. Mandates clear, itemized consent notices under Section 5, strict parental verification for children\'s data under Section 9, India-resident DPO appointments under Section 10, and enforces financial penalties up to ₹250 Crores per violation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  <Landmark className="w-4 h-4" />
                  RBI DLG June 2023
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  5% FLDG Cap & Escrow Routing
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Prohibits loan disbursements through third-party pool accounts of LSPs. Enforces contractual default loss guarantee limits at 5% of outstanding portfolio backed exclusively by cash, FD lien, or Bank Guarantee, and mandates True APR disclosure in KFS.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  <Fingerprint className="w-4 h-4" />
                  UIDAI Aadhaar Vault
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Surrogate Keys & Verhoeff Checksum
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Mandates dedicated, isolated HSM-backed vault enclaves for storing raw Aadhaar numbers. Replaces Aadhaar in transactional tables with surrogate tokens (Reference Keys), enforces masking (XXXX-XXXX-1234), and requires Dihedral D5 Verhoeff checksum validation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                  <FileCheck className="w-4 h-4" />
                  IT Act § 70B & BSA § 63
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  6-Hour Incident Clock & Court Evidence
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Enforces mandatory 6-hour cybersecurity incident reporting to CERT-In under Directions 2022, 180-day system logs retention synchronized with NPL-India NTP stratum, and Section 65B / BSA 2023 Section 63 cryptographic custody certificates for court admissibility.
                </p>
              </div>
            </div>
          </div>

          {/* ZERO-RETENTION PRIVACY PROMISE */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl shrink-0">
                <Lock className="w-8 h-8 text-blue-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Zero-Knowledge & Client-Side Execution Guarantee
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    100% Private
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Toolique does not collect, log, track, or transmit your compliance checklists, Aadhaar digits, loan portfolios, or server incident records. Everything computes locally in your browser memory via Web Crypto API and client-side JavaScript.
                </p>
              </div>
            </div>
            <Link
              to="/privacy-policy"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            >
              Read Privacy Policy
            </Link>
          </div>

          {/* FREQUENTLY ASKED QUESTIONS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Compliance Questions
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs"
                >
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-mono">Q.</span>
                    {faq.question}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-5">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
