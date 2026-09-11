import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Scale, 
  Building, 
  Calculator, 
  Code2, 
  Printer, 
  HelpCircle, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles, 
  FileCheck2, 
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

interface DisclaimerSection {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge?: string;
  content: React.ReactNode;
}

const DISCLAIMER_FAQS = [
  {
    q: 'Can I use Toolique tax calculation results for official ITR e-filing directly?',
    a: 'Toolique tax calculators (such as the Old vs New Tax Regime, Capital Gains, and HRA Exemption estimators) are based on the latest Union Budget 2025-26 rules and standard tax slabs. However, individual deductions (e.g. 80C, 80D, standard deductions, and state surcharges) require verified computation. We recommend cross-checking results with a certified Chartered Accountant (CA) or the official Income Tax e-filing portal.'
  },
  {
    q: 'Are civil engineering BOQ and FAR/FSI calculations suitable for municipal approval submissions?',
    a: 'Our civil engineering calculators implement standard formulas from the National Building Code (NBC 2016) and IS 456:2000. However, local Development Control Regulations (DCR), municipal bye-laws, and site-specific structural soil test parameters vary. Official blueprint submissions require vetting and stamping by a licensed structural engineer or registered architect.'
  },
  {
    q: 'Are cryptographic hash generators and JWT parsers on Toolique secure for production keys?',
    a: 'Yes. All cryptographic operations (SHA-256, HMAC, MD5, Base64, and JWT debugging) execute 100% client-side via the browser’s native Web Crypto API and JavaScript runtime. Zero keys or secrets are transmitted over the network. However, for maximum security, we recommend never pasting production private keys or unmasked live API credentials into any browser.'
  },
  {
    q: 'Does Toolique assume legal or financial liability for investment calculation errors?',
    a: 'No. All calculations provided on Toolique are estimation and educational aids provided on an "as-is" basis. Toolique assumes zero financial, tax, or legal liability for investment decisions, tax assessments, or construction cost variances.'
  },
  {
    q: 'How frequently are statutory tax formulas and construction standards updated?',
    a: 'Our engineering and research team audits and updates tax algorithms within 24 to 48 hours of official Union Budget announcements, Central Board of Direct Taxes (CBDT) notifications, and Bureau of Indian Standards (BIS) revisions.'
  }
];

export default function Disclaimer() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const disclaimerSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': 'https://www.toolique.in/disclaimer#webpage',
        'url': 'https://www.toolique.in/disclaimer',
        'name': 'Disclaimer | Toolique - Multi-Disciplinary Calculation Safe Harbor',
        'description': 'Official Disclaimer for Toolique. Understand estimation boundaries across financial taxation, civil engineering, developer cryptography, and QA tooling.',
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://www.toolique.in/'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Disclaimer',
              'item': 'https://www.toolique.in/disclaimer'
            }
          ]
        }
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.toolique.in/disclaimer#faq',
        'mainEntity': DISCLAIMER_FAQS.map(faq => ({
          '@type': 'Question',
          'name': faq.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.a
          }
        }))
      }
    ]
  };

  const disclaimerSections: DisclaimerSection[] = [
    {
      id: 'financial-tax',
      icon: Calculator,
      title: '1. Financial, Taxation & Investment Disclaimers',
      badge: 'Finance & Tax',
      content: (
        <div className="space-y-3">
          <p>
            The financial estimators, SIP investment calculators, EMI loan amortizers, and tax calculators (including Old vs New Tax Regime, GST, TDS, and In-Hand Salary calculators) on Toolique use mathematical algorithms to estimate future monetary values and tax liabilities based on prevailing statutory provisions:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Market Volatility:</strong> SIP returns, mutual fund compound projections, and retirement corpus calculators assume steady compound annual growth rates (CAGR). Mutual funds and equity markets are subject to market risks; past performance does not guarantee future yields.
            </li>
            <li>
              <strong>No Certified Financial Advice:</strong> Toolique does not act as a SEBI-registered Investment Adviser (RIA), Chartered Accountant, or tax attorney. You must consult a qualified financial planner or tax professional before making significant capital allocations or completing commercial balance sheets.
            </li>
            <li>
              <strong>Statutory Amendments:</strong> Tax slabs, cess rates, municipal surcharges, and Section 87A rebate rules are updated per the latest Union Budget announcements, but may not account for unusual multi-state or complex tax deductions.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'civil-structural',
      icon: Building,
      title: '2. Civil, Structural & Architectural Engineering Estimations',
      badge: 'Civil & Engineering',
      content: (
        <div className="space-y-3">
          <p>
            Our civil engineering utilities (such as FAR/FSI calculators, Concrete Mix Design, BOQ Cost Estimator, Steel Reinforcement Weight, and Brickwork calculators) are developed in alignment with the <em>National Building Code of India (NBC 2016)</em> and <em>IS 456:2000</em> standards:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Site-Specific Variations:</strong> Material consumption factors (e.g. cement-sand dry volume multiplier of $1.54$ to $1.57$, steel lap lengths, and wastage margins) represent standard nominal benchmarks. Actual construction site consumption varies based on sand bulk density, water-cement ratios, and contractor tolerances.
            </li>
            <li>
              <strong>Municipal Bye-Laws:</strong> Permissible Floor Area Ratio (FAR) / Floor Space Index (FSI), setback requirements, and ground coverage ratios depend on localized municipal Master Plans (e.g. BBMP, BMC, DDA, PMRDA). Official architectural approvals require stamping by a licensed structural engineer or council architect.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'developer-crypto',
      icon: Code2,
      title: '3. Developer Utilities, Cryptography & Code Formatters',
      badge: 'Software Engineering',
      content: (
        <div className="space-y-3">
          <p>
            Developer utilities—including SQL formatters, JSON validators, Regex testers, Base64 converters, and cryptographic hash utilities—execute entirely within the client’s browser JavaScript engine and Web Crypto APIs:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Code Integrity:</strong> While our formatters and linters validate against official specifications (e.g. RFC 8259 for JSON, ANSI SQL), we do not guarantee that formatted code will execute without syntactic errors on every legacy database version or dialect. Always verify formatted scripts in staging environments before applying them to production databases.
            </li>
            <li>
              <strong>Confidential Credentials:</strong> Toolique does not transmit or log any clipboard content or input tokens. However, standard cybersecurity best practices recommend never pasting live production private keys, unmasked database passwords, or active administrative API credentials into any web browser.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'qa-testing',
      icon: FileCheck2,
      title: '4. QA Engineering & Test Case Design Frameworks',
      badge: 'QA & Verification',
      content: (
        <div className="space-y-3">
          <p>
            Our Quality Assurance utilities (such as Boundary Value Analysis, Equivalence Partitioning Matrix, and Decision Table Generators) are structured around standard <em>ISTQB (International Software Testing Qualifications Board)</em> methodologies:
          </p>
          <p>
            Generated test vectors and edge-case permutations serve as high-speed scaffolding aids for test design. They do not replace comprehensive end-to-end user acceptance testing, performance load testing, or specialized penetration audits.
          </p>
        </div>
      )
    },
    {
      id: 'fabrication-3d',
      icon: Printer,
      title: '5. 3D Printing, Fabrication & Slicing Tools',
      badge: '3D Fabrication',
      content: (
        <div className="space-y-3">
          <p>
            Calculators for filament cost estimation, thermal shrinkage compensation, lithophane STL generation, and print time modeling use generalized mathematical approximations:
          </p>
          <p>
            Physical print output depends on machine calibration, nozzle diameter wear, ambient temperature, bed adhesion, filament brand moisture content, and proprietary slicer acceleration curves (e.g. Bambu Lab, PrusaSlicer, Cura).
          </p>
        </div>
      )
    },
    {
      id: 'no-relationship',
      icon: Scale,
      title: '6. No Professional-Client Advisory Relationship',
      badge: 'Legal Safe Harbor',
      content: (
        <div className="space-y-3">
          <p>
            Use of Toolique and its mathematical outputs does not create a professional advisor-client relationship, financial advisory contract, legal representation, or certified engineering consultancy between you and Toolique or its creators.
          </p>
          <p>
            For certified audits, tax filings, structural permits, and clinical or security compliance, please engage licensed professionals in your respective jurisdiction.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 text-left py-8 px-4 sm:px-6 animate-fadeIn">
      <SEO
        title="Disclaimer | Toolique - Multi-Disciplinary Safe Harbor & Accuracy Scope"
        description="Official Disclaimer for Toolique. Understand estimation boundaries across financial taxation, civil engineering, developer cryptography, and QA tooling."
        keywords={[
          'toolique disclaimer',
          'tax calculation disclaimer',
          'civil engineering calculator accuracy',
          'financial calculator disclaimer',
          'developer tools liability safe harbor'
        ]}
        schemaMarkup={disclaimerSchema}
      />

      {/* --- 1. HERO SECTION WITH AMBIENT PASTEL GLOW --- */}
      <div className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
        {/* Ambient Glows */}
        <div 
          className="absolute -left-20 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none opacity-0 dark:opacity-100 blur-3xl transition-opacity duration-500 -z-10"
          style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div 
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none opacity-0 dark:opacity-100 blur-3xl transition-opacity duration-500 -z-10"
          style={{ background: 'radial-gradient(circle, rgba(239, 68, 68, 0.22) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/80 dark:bg-zinc-900/80 text-amber-700 dark:text-amber-400 border border-amber-500/30 dark:border-amber-700/40 shadow-xs backdrop-blur-sm"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Statutory Safe Harbor • Algorithmic Estimation Scope • Professional Advice</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.12]"
        >
          Calculation &{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 dark:from-amber-400 dark:via-rose-400 dark:to-indigo-400">
            Legal Disclaimer
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-zinc-650 dark:text-zinc-300 leading-relaxed max-w-3xl mx-auto font-medium"
        >
          Toolique provides high-precision algorithmic calculators and developer tools for estimation and workflow acceleration. Review our domain-specific accuracy parameters and statutory guidelines below.
        </motion.p>

        <div className="flex items-center justify-center gap-3 pt-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <span>Effective Date: September 2026</span>
          <span>•</span>
          <span>Version 2.4</span>
        </div>
      </div>

      {/* --- 2. IMPORTANT BANNER --- */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-900 dark:text-amber-300 font-semibold leading-relaxed flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <strong>Statutory Notice:</strong> Calculations and outputs generated on Toolique are algorithmic estimates designed for rapid modeling, education, and development workflows. They do not constitute official chartered financial advice, statutory tax certification, or licensed structural blueprints.
        </div>
      </div>

      {/* --- 3. DOMAIN-SPECIFIC DISCLAIMER CARDS (4 QUICK CARDS) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xs">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="text-sm font-black text-zinc-900 dark:text-white">Tax & Finance</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Estimates based on Union Budget 2025-26. Consult a CA for certified e-filing.
          </div>
        </div>

        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xs">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit">
            <Building className="w-5 h-5" />
          </div>
          <div className="text-sm font-black text-zinc-900 dark:text-white">Civil & Structural</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Based on IS 456 & NBC 2016. Requires licensed engineer sign-off for permits.
          </div>
        </div>

        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xs">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit">
            <Code2 className="w-5 h-5" />
          </div>
          <div className="text-sm font-black text-zinc-900 dark:text-white">Code & Cryptography</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Client-side Web Crypto execution. Audit formatted code in staging first.
          </div>
        </div>

        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xs">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-sm font-black text-zinc-900 dark:text-white">QA & 3D Fabrication</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Design scaffolding tools. Material tolerances and hardware specs vary.
          </div>
        </div>
      </div>

      {/* --- 4. DETAILED DISCLAIMER SECTIONS --- */}
      <div className="space-y-6">
        {disclaimerSections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.id}
              id={sec.id}
              className="saas-card p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
                    {sec.title}
                  </h2>
                </div>
                {sec.badge && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/20">
                    {sec.badge}
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed font-medium">
                {sec.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- 5. DISCLAIMER FAQS --- */}
      <div className="saas-card p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 mb-1.5">
            <HelpCircle className="w-3 h-3 text-amber-500" />
            <span>Calculation Questions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            Frequently Asked Disclaimer & Accuracy Questions
          </h2>
        </div>

        <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
          {DISCLAIMER_FAQS.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex justify-between items-center text-left text-sm font-black text-zinc-900 dark:text-white cursor-pointer group"
              >
                <span className="group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-2 ${
                    openFaq === idx ? 'rotate-180 text-amber-600' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-medium pt-3 pr-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* --- 6. CALL TO ACTION --- */}
      <div className="saas-card p-8 sm:p-10 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-indigo-500/5 to-teal-500/5 space-y-6 text-center shadow-md">
        <div className="max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            Explore 274+ Client-Side Calculators & Tools
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            High-speed, zero-knowledge browser utilities for engineers, developers, and creators.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/tools"
            className="saas-button-primary py-3 px-6 text-xs font-extrabold inline-flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Browse All Tools</span>
          </Link>

          <Link
            to="/terms"
            className="saas-button-secondary py-3 px-6 text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>Terms of Service</span>
          </Link>

          <Link
            to="/privacy-policy"
            className="saas-button-secondary py-3 px-6 text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy Policy</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

