import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Bug, 
  Lightbulb, 
  Building2, 
  HelpCircle, 
  ChevronDown, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

interface InquiryCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultSubject: string;
  placeholder: string;
}

const INQUIRY_CATEGORIES: InquiryCategory[] = [
  {
    id: 'feature',
    label: 'Tool Proposal',
    icon: Lightbulb,
    defaultSubject: 'Feature Proposal: [Tool Name or Calculation Concept]',
    placeholder: 'Describe the tool or calculator you would like to see on Toolique. What inputs, outputs, and statutory standards (e.g. Indian Tax Code, NBC 2016, RFC standards) should it support?'
  },
  {
    id: 'bug',
    label: 'Bug / Math Discrepancy',
    icon: Bug,
    defaultSubject: 'Calculation Report: [Tool Name] - Math Variance',
    placeholder: 'Please share the tool URL, test inputs, expected output vs actual output, and any relevant statutory reference standard.'
  },
  {
    id: 'security',
    label: 'Security & DLP Clearance',
    icon: ShieldCheck,
    defaultSubject: 'Security Audit: Client-Side DLP Verification',
    placeholder: 'Inquire about our zero-knowledge architecture, air-gapped intranet deployment, or DPDP Act 2023 / GDPR Article 25 compliance.'
  },
  {
    id: 'enterprise',
    label: 'Enterprise / API',
    icon: Building2,
    defaultSubject: 'Enterprise Query: Custom Deployment / Integration',
    placeholder: 'Tell us about your organization and requirements for offline or custom tool bundles.'
  },
  {
    id: 'general',
    label: 'General Feedback',
    icon: MessageSquare,
    defaultSubject: 'Feedback on Toolique',
    placeholder: 'Share your thoughts, praise, ideas, or feedback on how we can improve Toolique for you!'
  }
];

const CONTACT_FAQS = [
  {
    q: 'How fast are new tool proposals and bug reports reviewed?',
    a: 'Our engineering team reviews community submissions daily. High-demand engineering calculators and verified mathematical bug fixes are typically developed, tested, and deployed to production within 48 to 72 hours.'
  },
  {
    q: 'Can enterprise teams request a custom offline or air-gapped build?',
    a: 'Yes! Toolique is engineered with zero remote server dependencies. If your corporate intranet or banking lab requires an air-gapped offline package or custom internal calculators, reach out via security@toolique.in.'
  },
  {
    q: 'Is my email or submitted message logged or shared with third parties?',
    a: 'Never. In alignment with our strict DPDP Act 2023 and GDPR privacy architecture, your contact submissions are used solely to reply to your inquiry. We never share, sell, or monetize user correspondence.'
  },
  {
    q: 'How can I report a mathematical calculation discrepancy in a tool?',
    a: 'Select the "Bug / Math Discrepancy" category in the contact form above, include the tool name, your input values, and the statutory reference formula (e.g. IS 456:2000, Section 87A of Income Tax Act), and our mathematical engineering team will audit it.'
  }
];

export default function Contact() {
  const [selectedCategory, setSelectedCategory] = useState<string>('feature');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [toolUrl, setToolUrl] = useState('');
  const [subject, setSubject] = useState(INQUIRY_CATEGORIES[0].defaultSubject);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCategorySelect = (cat: InquiryCategory) => {
    setSelectedCategory(cat.id);
    setSubject(cat.defaultSubject);
  };

  const handleCopyEmail = (emailStr: string) => {
    navigator.clipboard.writeText(emailStr);
    setCopiedEmail(emailStr);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    // Construct mailto link as fallback backup
    const mailtoLink = `mailto:support@toolique.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCategory: ${selectedCategory}\nTool Reference: ${toolUrl || 'N/A'}\n\nMessage:\n${message}`
    )}`;
    
    // Record submission state
    setSubmitted(true);
    
    // Optional client-side trigger
    window.location.href = mailtoLink;
  };

  const activeCategoryObj = INQUIRY_CATEGORIES.find(c => c.id === selectedCategory) || INQUIRY_CATEGORIES[0];

  const contactSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        '@id': 'https://www.toolique.in/contact#webpage',
        'url': 'https://www.toolique.in/contact',
        'name': 'Contact Support & Engineering | Toolique',
        'description': 'Direct engineering support, feature requests, and security inquiries for Toolique. Get in touch with our creators.',
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
              'name': 'Contact',
              'item': 'https://www.toolique.in/contact'
            }
          ]
        }
      },
      {
        '@type': 'Organization',
        '@id': 'https://www.toolique.in/#organization',
        'name': 'Toolique',
        'url': 'https://www.toolique.in',
        'contactPoint': [
          {
            '@type': 'ContactPoint',
            'contactType': 'Customer Support',
            'email': 'support@toolique.in',
            'availableLanguage': ['English', 'Hindi']
          },
          {
            '@type': 'ContactPoint',
            'contactType': 'Technical Support & Proposals',
            'email': 'tools@toolique.in',
            'availableLanguage': ['English', 'Hindi']
          }
        ]
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.toolique.in/contact#faq',
        'mainEntity': CONTACT_FAQS.map(faq => ({
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
        title="Contact Us | Toolique - Direct Engineering & Tool Proposals"
        description="Have suggestions for new calculators, found a mathematical discrepancy, or need enterprise DLP clearance? Get in touch directly with our engineering team."
        keywords={[
          'contact toolique',
          'suggest a tool',
          'toolique support',
          'report calculator bug',
          'developer tools feedback'
        ]}
        schemaMarkup={contactSchema}
      />

      {/* --- 1. HERO SECTION WITH AMBIENT PASTEL GLOW --- */}
      <div className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
        {/* Ambient Glows */}
        <div 
          className="absolute -left-20 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none opacity-0 dark:opacity-100 blur-3xl transition-opacity duration-500 -z-10"
          style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.22) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div 
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none opacity-0 dark:opacity-100 blur-3xl transition-opacity duration-500 -z-10"
          style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/80 dark:bg-zinc-900/80 text-teal-700 dark:text-teal-400 border border-teal-500/30 dark:border-teal-700/40 shadow-xs backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 text-teal-500" />
          <span>Direct Engineering Support • Tool Proposals • 48-Hour Response</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.12]"
        >
          Connect With Our{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-indigo-600 to-purple-600 dark:from-teal-400 dark:via-indigo-400 dark:to-purple-400">
            Engineering Team
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-zinc-650 dark:text-zinc-300 leading-relaxed max-w-3xl mx-auto font-medium"
        >
          Have an idea for a new calculator, found a mathematical calculation nuance, or want to verify client-side DLP compliance? We are here to help.
        </motion.p>
      </div>

      {/* --- 2. DIRECT CONTACT CHANNELS (3 CARDS WITH COPY ACTION) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="saas-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
              General Support
            </span>
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">Engineering Support</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed font-medium">
              Questions about tool performance, calculations, or bug reports.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800/80">
            <code className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono">
              support@toolique.in
            </code>
            <button
              onClick={() => handleCopyEmail('support@toolique.in')}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Copy Email Address"
            >
              {copiedEmail === 'support@toolique.in' ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="saas-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              Feature Requests
            </span>
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">Tool Proposals</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed font-medium">
              Request new domain calculators or specialized developer utilities.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800/80">
            <code className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono">
              tools@toolique.in
            </code>
            <button
              onClick={() => handleCopyEmail('tools@toolique.in')}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Copy Email Address"
            >
              {copiedEmail === 'tools@toolique.in' ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="saas-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
              Security & DPDP
            </span>
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">Security & Audit</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed font-medium">
              Enterprise DLP validation, privacy inquiries, and vulnerability reporting.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800/80">
            <code className="text-xs font-bold text-zinc-800 dark:text-zinc-200 font-mono">
              security@toolique.in
            </code>
            <button
              onClick={() => handleCopyEmail('security@toolique.in')}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Copy Email Address"
            >
              {copiedEmail === 'security@toolique.in' ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- 3. INTERACTIVE CONTACT FORM --- */}
      <div className="saas-card p-6 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-8 bg-white/90 dark:bg-zinc-900/90 shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            Send an Inquiry or Request
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Select an inquiry type below to auto-format your submission.
          </p>
        </div>

        {/* Category Pill Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Select Topic / Purpose
          </label>
          <div className="flex flex-wrap gap-2">
            {INQUIRY_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs scale-[1.02]'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-4 max-w-lg mx-auto bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-zinc-900 dark:text-white">
              Message Prepared & Transmitted!
            </h3>
            <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              Thank you for reaching out. Your default email client was launched. If it did not open automatically, you can email us directly at{' '}
              <a href="mailto:support@toolique.in" className="text-indigo-600 dark:text-indigo-400 font-bold underline">
                support@toolique.in
              </a>.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setName('');
                setEmail('');
                setMessage('');
                setToolUrl('');
              }}
              className="saas-button-secondary text-xs px-5 py-2.5 mt-2 cursor-pointer font-bold"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Subject Line <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="Subject"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Relevant Tool or URL <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={toolUrl}
                  onChange={(e) => setToolUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  placeholder="e.g. /tools/gst-calculator or Old vs New Tax"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Detailed Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium resize-none leading-relaxed"
                placeholder={activeCategoryObj.placeholder}
              />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>Zero telemetry tracking • 100% confidential correspondence</span>
              </div>

              <button
                type="submit"
                className="saas-button-primary py-3.5 px-8 text-xs font-black inline-flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Message to Engineering</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* --- 4. FOUNDER & ARCHITECTURE SPOTLIGHT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="saas-card p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 bg-white/80 dark:bg-zinc-900/80">
          <div className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            About the Creator
          </div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-white">
            Created by Ajinkya Swami
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Toolique was designed and engineered by Ajinkya Swami, a software architect and FinTech / Systems engineer dedicated to radical open access and zero-knowledge computing.
          </p>
          <div className="pt-2">
            <Link
              to="/about/founder"
              className="text-xs font-black text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 hover:underline"
            >
              <span>Read Founder Story & Background</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="saas-card p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3 bg-white/80 dark:bg-zinc-900/80">
          <div className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Architecture & Privacy
          </div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-white">
            Why Client-Side Execution Matters
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Curious why your confidential queries, SQL scripts, and financial balances are never uploaded to any remote database? Explore our architectural deep-dive.
          </p>
          <div className="pt-2">
            <Link
              to="/why-toolique"
              className="text-xs font-black text-teal-600 dark:text-teal-400 inline-flex items-center gap-1 hover:underline"
            >
              <span>Explore Why Toolique Architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* --- 5. CONTACT & SUPPORT FAQS --- */}
      <div className="saas-card p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20 mb-1.5">
            <HelpCircle className="w-3 h-3 text-teal-500" />
            <span>Support & Requests</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
            Frequently Asked Contact & Feature Questions
          </h2>
        </div>

        <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
          {CONTACT_FAQS.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex justify-between items-center text-left text-sm font-black text-zinc-900 dark:text-white cursor-pointer group"
              >
                <span className="group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-2 ${
                    openFaq === idx ? 'rotate-180 text-teal-600' : ''
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
    </div>
  );
}


