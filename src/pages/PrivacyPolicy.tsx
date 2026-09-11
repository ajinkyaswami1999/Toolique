import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  EyeOff, 
  Lock, 
  ServerOff, 
  HardDrive, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  Globe2, 
  FileText, 
  Scale, 
  UserCheck,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

interface PolicySection {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  badge?: string;
  content: React.ReactNode;
}

const PRIVACY_FAQS = [
  {
    q: 'Does Toolique ever transmit my files, passwords, or calculation inputs to a server?',
    a: 'No. All calculations, parsing, formatting, cryptographic hashing, and conversions execute exclusively inside your web browser\'s local V8 engine, WebAssembly sandbox, and Web Crypto APIs. There are 0 server API endpoints that receive your input payloads.'
  },
  {
    q: 'How does Toolique comply with India\'s DPDP Act 2023?',
    a: 'Under the Digital Personal Data Protection Act 2023, data protection duties apply to Data Fiduciaries that collect or process digital personal data. Because Toolique operates strictly on the client side without collecting, storing, or transmitting personal identifiers (PII), no personal data is transferred or retained by Toolique.'
  },
  {
    q: 'What data is stored in my browser\'s LocalStorage or IndexedDB?',
    a: 'We use local browser storage exclusively for user convenience (such as saving your dark/light theme preference, recent search history, or offline tool cache). This data remains strictly on your local device and can be cleared at any time via your browser settings.'
  },
  {
    q: 'Can I verify Toolique\'s zero-network transmission independently?',
    a: 'Yes! You can open your browser Developer Tools (F12) -> Network tab at any time while using any calculator, code formatter, or document parser on Toolique. You will see that 0 outbound POST/PUT network requests containing your data are sent.'
  },
  {
    q: 'Does Toolique use tracking cookies or sell user analytics to third parties?',
    a: 'No. Toolique does not use invasive third-party cross-site tracking cookies, does not sell user telemetry, and does not maintain persistent advertising profiles.'
  }
];

export default function PrivacyPolicy() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const privacySchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': 'https://www.toolique.in/privacy-policy#webpage',
        'url': 'https://www.toolique.in/privacy-policy',
        'name': 'Privacy Policy | Toolique - Zero-Data Client-Side Guarantee',
        'description': 'Official Privacy Policy of Toolique. All tools run 100% locally in your browser. Zero server data collection, zero tracking cookies, DPDP Act 2023 and GDPR compliant.',
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
              'name': 'Privacy Policy',
              'item': 'https://www.toolique.in/privacy-policy'
            }
          ]
        }
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.toolique.in/privacy-policy#faq',
        'mainEntity': PRIVACY_FAQS.map(faq => ({
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

  const policySections: PolicySection[] = [
    {
      id: 'architecture',
      icon: EyeOff,
      title: '1. Zero-Knowledge Client-Side Architecture',
      badge: 'Core Principle',
      content: (
        <div className="space-y-3">
          <p>
            At Toolique, data privacy is not just a policy statement — it is our foundational technical architecture. Traditional online utilities upload your queries, SQL scripts, API tokens, PAN numbers, employee CTC figures, and images to remote multi-tenant backend servers for processing.
          </p>
          <p>
            In contrast, Toolique executes <strong>100% of calculations, transformations, image compressions, and document parsing locally within your web browser’s volatile memory (RAM)</strong> using client-side JavaScript, Web Workers, and WebAssembly.
          </p>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-emerald-900 dark:text-emerald-300 font-semibold leading-relaxed flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong>Technical Verification:</strong> Your confidential inputs are ephemeral and disappear the moment you close or refresh the tab. No server-side logging, caching, or remote database persistence ever occurs.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dpdp-gdpr',
      icon: ShieldCheck,
      title: '2. Statutory Compliance (DPDP Act 2023 & GDPR)',
      badge: 'Legal Standards',
      content: (
        <div className="space-y-3">
          <p>
            Toolique is engineered to comply with the highest global and national data sovereignty and privacy mandates:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Digital Personal Data Protection (DPDP) Act 2023 (India):</strong> Because Toolique does not collect, record, transmit, or process Personal Identifiable Information (PII) on any external server, our decentralized architecture guarantees compliance with Indian data sovereignty principles.
            </li>
            <li>
              <strong>EU General Data Protection Regulation (GDPR):</strong> Article 25 (Data Protection by Design and by Default) and Article 5 (Data Minimisation) are strictly fulfilled by processing all payloads on the user's client hardware.
            </li>
            <li>
              <strong>California Consumer Privacy Act (CCPA / CPRA):</strong> We do not sell, rent, trade, or share personal data, as no personal data is collected or tracked.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'local-storage',
      icon: HardDrive,
      title: '3. Browser Local Storage & Offline PWA State',
      badge: 'On-Device Storage',
      content: (
        <div className="space-y-3">
          <p>
            Toolique uses standard browser client storage mechanisms (such as <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs">localStorage</code> and <code className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs">IndexedDB</code>) exclusively for client-side user experience enhancements:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 space-y-1">
              <div className="text-xs font-bold text-zinc-900 dark:text-white">Theme & UI Preferences</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Remembers your selected Dark/Light mode theme and layout density across visits.
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 space-y-1">
              <div className="text-xs font-bold text-zinc-900 dark:text-white">Recent Tool History</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Stores your most frequently used tools locally on your device for fast speed-dial access.
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            This data never leaves your device. You can clear this data at any time via your browser's "Clear Site Data" or "Clear Cookies and Storage" settings.
          </p>
        </div>
      )
    },
    {
      id: 'cookies-ads',
      icon: Lock,
      title: '4. No Tracking Cookies & Distraction-Free Experience',
      badge: 'Zero Telemetry',
      content: (
        <div className="space-y-3">
          <p>
            Toolique does not utilize intrusive third-party tracking pixels, cross-site profiling cookies, or invasive behavioral fingerprinting. 
          </p>
          <p>
            Our website is designed to be completely distraction-free: no popups, no interstitial overlays, and no pay-to-export mechanisms.
          </p>
        </div>
      )
    },
    {
      id: 'edge-cdn',
      icon: Globe2,
      title: '5. Edge CDN & Anonymous Technical Logs',
      badge: 'Infrastructure',
      content: (
        <div className="space-y-3">
          <p>
            When you visit Toolique, our edge Content Delivery Network (CDN) serves pre-compiled static HTML, CSS, JavaScript, and WebAssembly bundles. 
          </p>
          <p>
            The CDN may process standard, ephemeral network connection logs (such as IP address, user-agent string, and HTTP status code) exclusively for DDoS mitigation, routing optimization, and infrastructure uptime monitoring. These access logs are stateless, security-focused, and never linked to your calculation content.
          </p>
        </div>
      )
    },
    {
      id: 'air-gap',
      icon: ServerOff,
      title: '6. Enterprise Air-Gapped & Offline Security',
      badge: 'Enterprise Security',
      content: (
        <div className="space-y-3">
          <p>
            Because Toolique operates as a Progressive Web Application (PWA), once initial assets are cached by your browser’s Service Worker, the vast majority of our calculators, formatters, and simulators function <strong>100% offline</strong> without an active internet connection.
          </p>
          <p>
            This architecture makes Toolique uniquely safe for use within banking intranets, high-security defense workstations, confidential QA automation environments, and air-gapped systems.
          </p>
        </div>
      )
    },
    {
      id: 'children-privacy',
      icon: UserCheck,
      title: '7. Children\'s Privacy Protection (COPPA)',
      content: (
        <p>
          Toolique provides educational and professional utilities suitable for students, educators, and professionals of all ages. Because we do not collect personal identifiable information (PII) from any user, we comply fully with the requirements of the Children’s Online Privacy Protection Act (COPPA).
        </p>
      )
    },
    {
      id: 'updates',
      icon: FileText,
      title: '8. Policy Updates & Contact Information',
      content: (
        <div className="space-y-3">
          <p>
            We may occasionally update this Privacy Policy to reflect technical enhancements or new statutory regulations. Any updates will be published immediately on this page with a revised "Last Updated" timestamp.
          </p>
          <p>
            If you have questions regarding our privacy practices or wish to verify our client-side architecture, you can contact our software architect directly via our{' '}
            <Link to="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Contact Page
            </Link>{' '}
            or review our{' '}
            <Link to="/why-toolique" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Why Toolique Architecture
            </Link>.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 text-left py-8 px-4 sm:px-6 animate-fadeIn">
      <SEO
        title="Privacy Policy | Toolique - Zero-Data Client-Side Guarantee"
        description="Official Privacy Policy of Toolique. All tools run 100% locally in your browser. Zero server data collection, zero tracking cookies, DPDP Act 2023 and GDPR compliant."
        keywords={[
          'toolique privacy policy',
          'client side tools privacy',
          'zero data collection',
          'dpdp act 2023 compliant',
          'gdpr privacy by design',
          'offline developer tools security'
        ]}
        schemaMarkup={privacySchema}
      />

      {/* --- 1. HERO SECTION WITH AMBIENT PASTEL GLOW --- */}
      <div className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
        {/* Ambient Glows */}
        <div 
          className="absolute -left-20 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none opacity-0 dark:opacity-100 blur-3xl transition-opacity duration-500 -z-10"
          style={{ background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div 
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none opacity-0 dark:opacity-100 blur-3xl transition-opacity duration-500 -z-10"
          style={{ background: 'radial-gradient(circle, rgba(244, 114, 182, 0.25) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/80 dark:bg-zinc-900/80 text-indigo-700 dark:text-indigo-400 border border-pastel-indigo/60 dark:border-indigo-800/60 shadow-xs backdrop-blur-sm"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>Zero Server Storage • DPDP Act 2023 Compliant • Privacy by Design</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.12]"
        >
          Privacy Policy &{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 dark:from-emerald-400 dark:via-teal-400 dark:to-indigo-400">
            Security Guarantee
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-zinc-650 dark:text-zinc-300 leading-relaxed max-w-3xl mx-auto font-medium"
        >
          At Toolique, privacy is an absolute architectural guarantee. Your confidential queries, source code, financial numbers, and document files are processed <strong>100% inside your local browser memory</strong> and never transmitted to our servers.
        </motion.p>

        <div className="flex items-center justify-center gap-3 pt-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <span>Effective Date: September 2026</span>
          <span>•</span>
          <span>Version 2.4</span>
        </div>
      </div>

      {/* --- 2. THE 4 PILLARS OF OUR PRIVACY PROMISE --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xs">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit">
            <ServerOff className="w-5 h-5" />
          </div>
          <div className="text-sm font-black text-zinc-900 dark:text-white">0 Bytes Wire Calls</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Calculations and conversions run in browser RAM without server upload.
          </div>
        </div>

        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xs">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 w-fit">
            <Scale className="w-5 h-5" />
          </div>
          <div className="text-sm font-black text-zinc-900 dark:text-white">DPDP 2023 & GDPR</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Full compliance with Indian statutory data protection and EU GDPR rules.
          </div>
        </div>

        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xs">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit">
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-sm font-black text-zinc-900 dark:text-white">No Tracking Cookies</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Zero third-party advertising cookies, cross-site trackers, or profiling.
          </div>
        </div>

        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xs">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-sm font-black text-zinc-900 dark:text-white">Enterprise Safe</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Safe for air-gapped corporate networks, banking audits, and defense VPNs.
          </div>
        </div>
      </div>

      {/* --- 3. DETAILED POLICY SECTIONS --- */}
      <div className="space-y-6">
        {policySections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div
              key={sec.id}
              id={sec.id}
              className="saas-card p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
                    {sec.title}
                  </h2>
                </div>
                {sec.badge && (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
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

      {/* --- 4. PRIVACY FAQS ACCORDION --- */}
      <div className="saas-card p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 mb-1.5">
            <HelpCircle className="w-3 h-3 text-indigo-500" />
            <span>Common Privacy Questions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            Frequently Asked Privacy Questions
          </h2>
        </div>

        <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
          {PRIVACY_FAQS.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex justify-between items-center text-left text-sm font-black text-zinc-900 dark:text-white cursor-pointer group"
              >
                <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-2 ${
                    openFaq === idx ? 'rotate-180 text-indigo-600' : ''
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

      {/* --- 5. CALL TO ACTION & TRANSPARENCY HUBS --- */}
      <div className="saas-card p-8 sm:p-10 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-emerald-500/5 via-indigo-500/5 to-purple-500/5 space-y-6 text-center shadow-md">
        <div className="max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            Experience 100% Private, Client-Side Tools
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Zero sign-up, zero data collection, and zero server logging across all 274+ calculators and utilities.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/tools"
            className="saas-button-primary py-3 px-6 text-xs font-extrabold inline-flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Explore All 274+ Tools</span>
          </Link>

          <Link
            to="/why-toolique"
            className="saas-button-secondary py-3 px-6 text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Why Choose Toolique</span>
          </Link>

          <Link
            to="/about"
            className="saas-button-secondary py-3 px-6 text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
          >
            <Globe2 className="w-4 h-4" />
            <span>About Our Platform</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

