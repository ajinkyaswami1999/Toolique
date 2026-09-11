import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  EyeOff, 
  Zap, 
  Code2, 
  Building, 
  Calculator, 
  Printer, 
  Scale, 
  ArrowRight, 
  Lock, 
  Award, 
  Heart, 
  Search, 
  BookOpen, 
  User, 
  HelpCircle, 
  ChevronDown, 
  Cpu,
  Fingerprint
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

// --- DATA DEFINITIONS ---

interface ValueProp {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  description: string;
  color: string;
}

const CORE_VALUES: ValueProp[] = [
  {
    icon: EyeOff,
    title: 'Zero-Knowledge Privacy',
    subtitle: '100% Client-Side Sandbox',
    description: 'We believe your confidential data, production API tokens, employee salaries, and architecture blueprints should never leave your device. All calculations occur strictly in browser RAM.',
    color: 'text-emerald-600 dark:text-emerald-400 bg-pastel-emerald/25 border-pastel-emerald/50 dark:bg-emerald-950/40 dark:border-emerald-800/60'
  },
  {
    icon: Zap,
    title: 'Zero-Latency Execution',
    subtitle: 'Sub-Millisecond Speed',
    description: 'Eliminating HTTP network round-trips and remote queuing enables our tools to execute in microseconds via modern Web Workers, WebAssembly, and native browser engines.',
    color: 'text-indigo-600 dark:text-indigo-400 bg-pastel-indigo/25 border-pastel-indigo/50 dark:bg-indigo-950/40 dark:border-indigo-800/60'
  },
  {
    icon: Lock,
    title: 'Radical Open Access',
    subtitle: 'No Paywalls & No Accounts',
    description: 'Every single one of our 274+ tools is completely free. We enforce zero daily rate limits, zero export watermarks, zero credit systems, and zero forced registration walls.',
    color: 'text-purple-600 dark:text-purple-400 bg-pastel-purple/25 border-pastel-purple/50 dark:bg-purple-950/40 dark:border-purple-800/60'
  },
  {
    icon: Award,
    title: 'Statutory Precision',
    subtitle: 'Indian & Global Standards',
    description: 'Algorithms are benchmarked against official gazette bye-laws (NBC 2016, 172+ state and city codes), latest Union Budget tax slabs, and ISTQB software testing methodologies.',
    color: 'text-amber-600 dark:text-amber-400 bg-pastel-peach/25 border-pastel-peach/50 dark:bg-amber-950/40 dark:border-amber-800/60'
  }
];

const ECOSYSTEM_SUITES = [
  {
    id: 'dev',
    title: 'Developer Utilities & Sandboxes',
    badge: '34 Tools',
    icon: Code2,
    desc: 'JSON formatters, JWT token decoders, SQL minifiers, REST API testers, regex simulators, and timestamp converters.',
    link: '/developer',
    color: 'text-indigo-700 dark:text-indigo-300 bg-pastel-indigo/30 border-pastel-indigo/60 dark:bg-indigo-950/40 dark:border-indigo-800/60'
  },
  {
    id: 'qa',
    title: 'QA Engineering & Test Suite Studio',
    badge: '12 Tools',
    icon: ShieldCheck,
    desc: 'ISTQB 2/3-value Boundary Value Analysis, automated test case generators, mock KYC datasets, and Playwright exports.',
    link: '/qa',
    color: 'text-emerald-700 dark:text-emerald-300 bg-pastel-emerald/30 border-pastel-emerald/60 dark:bg-emerald-950/40 dark:border-emerald-800/60'
  },
  {
    id: 'arch',
    title: 'Architecture & Civil Engineering',
    badge: '60+ Tools',
    icon: Building,
    desc: 'Location-aware building feasibility across 172+ Indian authorities, FAR/FSI calculations, setbacks, and BOQ cost estimators.',
    link: '/architecture',
    color: 'text-amber-700 dark:text-amber-300 bg-pastel-peach/30 border-pastel-peach/60 dark:bg-amber-950/40 dark:border-amber-800/60'
  },
  {
    id: 'fin',
    title: 'Personal Finance & Indian Tax Hub',
    badge: '18 Tools',
    icon: Calculator,
    desc: 'Old vs New Tax Regime comparisons, in-hand salary calculations from CTC, mutual fund SIP planners, and GST invoices.',
    link: '/finance',
    color: 'text-purple-700 dark:text-purple-300 bg-pastel-purple/30 border-pastel-purple/60 dark:bg-purple-950/40 dark:border-purple-800/60'
  },
  {
    id: 'maker',
    title: '3D Maker & Prototyping Studio',
    badge: 'Maker Suite',
    icon: Printer,
    desc: 'Bambu Lab AMS multi-color filament consumption, resin vat volume sizing, print farm power costs, and HueForge layer planners.',
    link: '/3d-print-studio',
    color: 'text-cyan-700 dark:text-cyan-300 bg-pastel-cyan/30 border-pastel-cyan/60 dark:bg-cyan-950/40 dark:border-cyan-800/60'
  },
  {
    id: 'math',
    title: 'Symbolic Math & Calculus Studio',
    badge: 'Calculus Suite',
    icon: Scale,
    desc: 'Step-by-step calculus derivative solvers, matrix arithmetic, descriptive statistics, and probability distribution models.',
    link: '/math-studio',
    color: 'text-rose-700 dark:text-rose-300 bg-pastel-rose/30 border-pastel-rose/60 dark:bg-rose-950/40 dark:border-rose-800/60'
  }
];

const TECH_STACK_ITEMS = [
  { name: 'React 19 & TypeScript', desc: 'Type-safe, modern reactive UI component architecture' },
  { name: 'WebAssembly (WASM)', desc: 'Near-native CPU execution for compute-heavy solvers and image codecs' },
  { name: 'Web Crypto API', desc: 'Hardware-accelerated cryptographic hashing, SHA-256, and AES in RAM' },
  { name: 'Web Workers', desc: 'Multi-threaded background compute preventing UI thread blocking' },
  { name: 'Progressive Web App (PWA)', desc: 'Service Worker caching for 100% offline & air-gapped readiness' },
  { name: 'IndexedDB State Engine', desc: 'Encrypted client-side storage for workspaces and recent calculation history' }
];

const ABOUT_FAQS = [
  {
    q: 'What is Toolique and what is the mission behind it?',
    a: 'Toolique is a privacy-first, decentralized online ecosystem of 274+ professional tools, calculators, developer utilities, and engineering studios. Our mission is to eliminate the friction, paywalls, and privacy risks of traditional utility websites by executing 100% of calculations directly inside the user\'s local web browser.'
  },
  {
    q: 'How does Toolique sustain itself without subscriptions or ads?',
    a: 'By architecting Toolique as a client-side platform, our cloud server infrastructure costs are near zero (only serving static pre-compiled JavaScript/WebAssembly assets through global edge CDNs). Without heavy per-query backend server costs, we are able to provide the entire suite completely free to developers, students, and professionals globally.'
  },
  {
    q: 'Who created Toolique?',
    a: 'Toolique was founded and architected by Ajinkya Swami, a software architect, QA automation engineer, and full-stack builder passionate about privacy-first software, client-side engineering, and developer productivity tools.'
  },
  {
    q: 'Can Toolique be used in high-security corporate or government intranets?',
    a: 'Yes. Because Toolique operates as an air-gapped sandbox without external telemetry, tracking cookies, or remote database logging, it complies with strict enterprise DLP (Data Loss Prevention) and data sovereignty standards, including India\'s DPDP Act 2023 and EU GDPR.'
  },
  {
    q: 'How can I suggest a new tool or report an issue?',
    a: 'We welcome feedback and feature requests from the global engineering community. You can connect with our founder directly via our Contact page or through GitHub.'
  }
];

export default function About() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  // Structured Data Schema for About Page
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': 'https://www.toolique.in/about#webpage',
        'url': 'https://www.toolique.in/about',
        'name': 'About Toolique | Mission, Architecture & Open Client-Side Platform',
        'description': 'Learn about Toolique: a free, privacy-first ecosystem of 274+ online calculators, developer utilities, and engineering studios running 100% in-browser.',
        'mainEntity': {
          '@type': 'Organization',
          'name': 'Toolique',
          'url': 'https://www.toolique.in/',
          'logo': 'https://www.toolique.in/favicon-512x512.png',
          'founder': {
            '@type': 'Person',
            'name': 'Ajinkya Swami',
            'jobTitle': 'Software Architect & QA Automation Engineer',
            'url': 'https://www.toolique.in/about-founder'
          }
        }
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.toolique.in/about#faq',
        'mainEntity': ABOUT_FAQS.map(faq => ({
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

  return (
    <div className="max-w-6xl mx-auto space-y-16 text-left py-8 px-4 sm:px-6 animate-fadeIn">
      <SEO
        title="About Toolique | Privacy-First Online Tools & Engineering Studios"
        description="Learn about Toolique, a free online suite of 274+ calculators, developer utilities, QA studios, and architectural compliance engines running 100% client-side without data tracking."
        keywords={[
          'about toolique',
          'client side tools platform',
          'free developer tools no signup',
          'privacy first online calculators',
          'ajinkya swami toolique',
          'dpdp compliant online tools',
          'offline developer utilities'
        ]}
        schemaMarkup={aboutSchema}
      />

      {/* --- 1. HERO SECTION WITH AMBIENT GLOW --- */}
      <div className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
        {/* Soft Ambient Background Glows */}
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
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span>Engineered for Builders • 100% Client-Side • Free Forever</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.12]"
        >
          Empowering Builders with{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
            Zero-Friction Tools
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-zinc-650 dark:text-zinc-300 leading-relaxed max-w-3xl mx-auto font-medium"
        >
          Toolique was born from a simple belief: professional calculation, formatting, and analysis tools should be 
          <strong> blazingly fast, deeply accurate, and 100% private</strong> — with zero paywalls, zero accounts, and zero data harvesting.
        </motion.p>

        {/* Live Metrics Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 max-w-4xl mx-auto"
        >
          <div className="saas-card p-4 text-center rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">274+</div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
              Production Tools
            </div>
          </div>

          <div className="saas-card p-4 text-center rounded-2xl border border-pastel-emerald/50 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
              Client-Side RAM
            </div>
          </div>

          <div className="saas-card p-4 text-center rounded-2xl border border-pastel-indigo/50 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">21</div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
              Specialized Suites
            </div>
          </div>

          <div className="saas-card p-4 text-center rounded-2xl border border-pastel-peach/50 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xs">
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">0</div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
              Accounts Needed
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- 2. OUR STORY & THE PROBLEM WE SOLVE --- */}
      <div className="saas-card p-6 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">The Problem & Solution</span>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
              Why We Rebuilt the Online Utility Stack
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed font-medium">
          <p>
            The modern web utility landscape is broken. When developers, analysts, and engineers search for simple tools — like formatting JSON, decoding a JWT auth token, converting plot areas, or calculating loan EMIs — they are greeted by pages covered in intrusive advertisements, slow server round-trips, and hidden paywalls demanding credit cards.
          </p>
          <p>
            More critically, traditional tool websites transmit confidential payloads (passwords, customer KYC data, proprietary source code, and financial statements) to multi-tenant remote servers, exposing users to serious data leakage and compliance vulnerabilities.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-pastel-indigo/50 dark:border-indigo-800/60 text-xs sm:text-sm text-indigo-950 dark:text-indigo-200 font-semibold leading-relaxed flex items-start gap-3">
          <Fingerprint className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <strong>The Toolique Difference:</strong> By taking full advantage of modern browser compute capabilities (WebAssembly, Web Workers, Web Crypto, and IndexedDB), Toolique executes all processing directly on your workstation's CPU. Your confidential inputs never leave your device.
          </div>
        </div>
      </div>

      {/* --- 3. THE 4 CORE VALUES & PHILOSOPHY --- */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Our Commitments</span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            Built on Uncompromising Principles
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Four foundational pillars guide every tool, interface, and algorithm we design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CORE_VALUES.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="saas-card p-6 sm:p-7 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 hover:border-indigo-500/40 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl border ${val.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    {val.subtitle}
                  </span>
                </div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">{val.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                  {val.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- 4. THE TOOLIQUE ECOSYSTEM SHOWCASE --- */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Platform Ecosystem</span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            Explore Our Specialized Engineering Suites
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Integrated studios and connected pipelines tailored for distinct disciplines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ECOSYSTEM_SUITES.map((suite) => {
            const Icon = suite.icon;
            return (
              <Link
                key={suite.id}
                to={suite.link}
                className="saas-card p-5.5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 group shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`p-2.5 rounded-2xl border ${suite.color} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-400">
                      {suite.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {suite.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed font-medium">
                      {suite.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Launch Suite</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* --- 5. MODERN OPEN-ENGINEERING TECH STACK --- */}
      <div className="saas-card p-6 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Technical Foundation</span>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
                Engineered with Modern Web Standards
              </h2>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
            100% Client-Side Stack
          </span>
        </div>

        <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed font-medium">
          Toolique is built using cutting-edge web primitives designed for maximum speed, offline resilience, and absolute security:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TECH_STACK_ITEMS.map((tech, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70 space-y-1 shadow-2xs"
            >
              <div className="text-xs font-black text-zinc-900 dark:text-white">{tech.name}</div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                {tech.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- 6. ABOUT THE FOUNDER SPOTLIGHT --- */}
      <div className="saas-card p-6 sm:p-10 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-purple-500/[0.03] space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md font-black text-xl shrink-0">
              AS
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Founder & Architect</span>
              <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
                Ajinkya Swami
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                QA Automation Engineer • Software Architect • Full-Stack Builder
              </p>
            </div>
          </div>

          <Link
            to="/about-founder"
            className="saas-button-secondary py-2.5 px-4 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
          >
            <User className="w-4 h-4" />
            <span>Read Founder Story & Journey</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed font-medium">
          "I started building Toolique because I was frustrated with having to upload proprietary API payloads and financial numbers to random web utilities that tracked my every move. Toolique represents what modern online utilities should be: fast, respectful of user privacy, completely open, and meticulously accurate."
        </p>
      </div>

      {/* --- 7. FREQUENTLY ASKED QUESTIONS --- */}
      <div className="saas-card p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 mb-1.5">
            <HelpCircle className="w-3 h-3 text-indigo-500" />
            <span>Frequently Answered Questions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            Common Questions About Toolique
          </h2>
        </div>

        <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
          {ABOUT_FAQS.map((faq, idx) => (
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

      {/* --- 8. CALL TO ACTION & DIRECTORY HUBS --- */}
      <div className="saas-card p-8 sm:p-10 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-rose-500/5 space-y-6 text-center shadow-md">
        <div className="max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            Ready to Explore the Toolique Suite?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Instant, uncapped access to 274+ professional client-side calculators, developer utilities, and engineering studios.
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
            to="/developer"
            className="saas-button-secondary py-3 px-6 text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
            <span>Developer Hub</span>
          </Link>

          <Link
            to="/academy"
            className="saas-button-secondary py-3 px-6 text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Toolique Academy</span>
          </Link>
        </div>

        <div className="border-t border-zinc-200/50 dark:border-zinc-800/50 pt-6 mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5 font-medium">
          <span>Crafted with passion for builders worldwide</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>
      </div>
    </div>
  );
}

