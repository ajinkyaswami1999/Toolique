import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Heart, ChevronUp, Mail, MessageSquare, Printer,
  Zap, ShieldCheck, MonitorCheck, Smartphone, CheckCircle2,
  Sparkles, ExternalLink
} from 'lucide-react';
import { footerConfig } from '../data/footerConfig';
import { TooliqueLogo } from './Logo';

// Custom Inline SVGs for brand logos to prevent compilation issues with lucide-react brand icons
const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const TwitterIcon = ({ className = "w-4 h-4" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Github: GithubIcon,
  Linkedin: LinkedinIcon,
  Instagram: InstagramIcon,
  Youtube: YoutubeIcon,
  Twitter: TwitterIcon,
  Mail,
  MessageSquare,
  Printer,
  Zap,
  ShieldCheck,
  MonitorCheck,
  Smartphone
};

function CountUp({ end, duration = 1500 }: { end: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const target = parseInt(end) || 0;
  const suffix = end.replace(/^[0-9]+/, '');

  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{target === 0 ? end : `${count}${suffix}`}</span>;
}

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success'>('idle');

  const isExternalOrStatic = (url: string) => {
    return url.startsWith('http') || url.startsWith('mailto:') || url.endsWith('.xml') || url.includes('#');
  };

  useEffect(() => {
    let prev = false;
    const handleScroll = () => {
      const show = window.scrollY > 400;
      if (show !== prev) {
        prev = show;
        setShowBackToTop(show);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setNewsletterStatus('success');
    setEmail('');
    setTimeout(() => setNewsletterStatus('idle'), 4500);
  };

  const buildDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <footer className="relative border-t border-zinc-200/70 dark:border-zinc-800/70 bg-[#fafbfe]/90 dark:bg-[#090d16] text-zinc-500 dark:text-zinc-400 transition-colors duration-300 overflow-hidden text-left content-auto" aria-label="Toolique Platform Footer">
      
      {/* Decorative ambient pastel background glows */}
      <div 
        className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none -z-10 opacity-60 dark:opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)' }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none -z-10 opacity-60 dark:opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(20, 184, 166, 0.25) 0%, transparent 70%)' }}
      />

      {/* -------------------- 1. TOP CTA BANNER -------------------- */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-50/80 via-white/80 to-teal-50/80 dark:from-zinc-900/80 dark:via-zinc-950/70 dark:to-zinc-900/80 border border-indigo-100/80 dark:border-zinc-800/80 p-8 md:p-12 text-center space-y-6 shadow-sm backdrop-blur-md">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/90 dark:bg-zinc-800/90 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Zero Sign-Up • Zero Telemetry • Instant Client RAM Execution</span>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
              {footerConfig.cta.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
              {footerConfig.cta.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 relative z-10 pt-2">
            {footerConfig.cta.buttons.map((btn, idx) => (
              <Link
                key={idx}
                to={btn.link}
                className={`px-5 py-3 rounded-2xl font-black text-xs transition duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center gap-2 ${
                  btn.variant === 'primary' 
                    ? 'saas-button-primary'
                    : btn.variant === 'glow'
                    ? 'saas-button-secondary border-indigo-500/30 text-indigo-700 dark:text-indigo-300'
                    : 'saas-button-secondary'
                }`}
              >
                <span>{btn.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------- 2. PLATFORM LIVE METRICS -------------------- */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {footerConfig.stats.map((stat, idx) => (
            <div key={idx} className="saas-card p-5 text-center bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/60 rounded-2xl flex flex-col justify-center space-y-1 shadow-2xs">
              <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                <CountUp end={stat.value} />
              </span>
              <span className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------- 3. MAIN 5-COLUMN FOOTER -------------------- */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 border-b border-zinc-200/60 dark:border-zinc-900">
        
        {/* Column 1: Brand Info & Architecture */}
        <div className="lg:col-span-4 space-y-5">
          <Link to="/" className="group flex items-center w-fit" aria-label="Toolique Home">
            <TooliqueLogo iconSize="w-9 h-9" showTagline={true} />
          </Link>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm font-medium">
            {footerConfig.companyDetails.description}
          </p>

          <div className="grid grid-cols-2 gap-2 max-w-sm pt-1">
            {footerConfig.companyDetails.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{highlight.replace(/^✔\s*/, '')}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/about-founder"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-indigo-500/40 transition-colors"
            >
              <span>Architected by Ajinkya Swami</span>
              <ArrowRight className="w-3 h-3 text-indigo-500" />
            </Link>
          </div>
        </div>

        {/* Column 2: Platform Links */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-[10px] font-black text-zinc-900 dark:text-zinc-200 tracking-wider uppercase">
            {footerConfig.columns.platform.title}
          </h4>
          <ul className="space-y-2.5 text-xs font-semibold">
            {footerConfig.columns.platform.links.map((link, idx) => (
              <li key={idx}>
                {isExternalOrStatic(link.link) ? (
                  <a href={link.link} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-block hover:translate-x-0.5 duration-200">
                    {link.label}
                  </a>
                ) : (
                  <Link to={link.link} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-block hover:translate-x-0.5 duration-200">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Suites & Studios */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-[10px] font-black text-zinc-900 dark:text-zinc-200 tracking-wider uppercase">
            {footerConfig.columns.categories.title}
          </h4>
          <ul className="space-y-2.5 text-xs font-semibold">
            {footerConfig.columns.categories.links.map((link, idx) => (
              <li key={idx}>
                <Link to={link.link} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-block hover:translate-x-0.5 duration-200">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Transparency & Legal */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-[10px] font-black text-zinc-900 dark:text-zinc-200 tracking-wider uppercase">
            {footerConfig.columns.company.title}
          </h4>
          <ul className="space-y-2.5 text-xs font-semibold">
            {footerConfig.columns.company.links.map((link, idx) => (
              <li key={idx}>
                {isExternalOrStatic(link.link) ? (
                  <a href={link.link} target={link.link.startsWith('http') ? "_blank" : undefined} rel={link.link.startsWith('http') ? "noopener noreferrer" : undefined} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1 hover:translate-x-0.5 duration-200">
                    <span>{link.label}</span>
                    {link.link.startsWith('http') && <ExternalLink className="w-2.5 h-2.5 opacity-60" />}
                  </a>
                ) : (
                  <Link to={link.link} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-block hover:translate-x-0.5 duration-200">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Column 5: Connect & Newsletter */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-zinc-900 dark:text-zinc-200 tracking-wider uppercase">
              {footerConfig.columns.connect.title}
            </h4>
            <div className="flex flex-wrap gap-2">
              {footerConfig.columns.connect.links.map((link, idx) => {
                const IconComponent = iconMap[link.icon] || Mail;
                if (link.future) {
                  return (
                    <button
                      key={idx}
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-650 cursor-not-allowed"
                      title={`${link.label} (Coming Soon)`}
                      disabled
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  );
                }
                return (
                  <a
                    key={idx}
                    href={link.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/40 hover:scale-105 transition duration-200 shadow-2xs"
                    aria-label={link.label}
                    title={link.label}
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Newsletter Card */}
          <div className="saas-card p-4 bg-white/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl space-y-3 relative overflow-hidden shadow-2xs">
            <div className="space-y-1 text-left">
              <h5 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>{footerConfig.newsletter.title}</span>
              </h5>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                {footerConfig.newsletter.description}
              </p>
            </div>
            
            <form onSubmit={handleSubscribe} className="flex gap-1.5">
              <input
                type="email"
                placeholder={footerConfig.newsletter.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-2 text-[11px] text-zinc-900 dark:text-white font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-zinc-400"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] cursor-pointer shrink-0 transition shadow-2xs"
              >
                {footerConfig.newsletter.buttonText}
              </button>
            </form>

            {newsletterStatus === 'success' && (
              <span className="block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 animate-fadeIn text-left">
                ✔ Success! You are on the release notification list.
              </span>
            )}
          </div>
        </div>

      </div>

      {/* -------------------- 4. TRUST & STATUTORY ACCREDITATIONS -------------------- */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 border-b border-zinc-200/60 dark:border-zinc-900">
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-6 text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          <div className="flex flex-wrap justify-center gap-6">
            {footerConfig.trustBadges.map((badge, idx) => {
              const Icon = iconMap[badge.icon] || Zap;
              return (
                <div key={idx} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300">
            <span>Architected with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>in India 🇮🇳</span>
          </div>
        </div>
      </div>

      {/* -------------------- 5. TECHNICAL SEO & KNOWLEDGE SUMMARY -------------------- */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-zinc-200/60 dark:border-zinc-900">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed font-medium max-w-5xl text-justify sm:text-left">
          {footerConfig.seoText} Discover our specialized{' '}
          <Link to="/developer" className="text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold hover:underline">
            Developer Utilities
          </Link>, compute civil calculations via the{' '}
          <Link to="/architecture" className="text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold hover:underline">
            Architecture & Civil Suite
          </Link>, run test cases in the{' '}
          <Link to="/qa" className="text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold hover:underline">
            QA Workspace
          </Link>, optimize taxes in the{' '}
          <Link to="/finance" className="text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold hover:underline">
            Finance & Tax Hub
          </Link>, or slice 3D models with the{' '}
          <Link to="/3d-printing" className="text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold hover:underline">
            3D Printing Studio
          </Link>.
        </p>
      </div>

      {/* -------------------- 6. BOTTOM SUB-FOOTER -------------------- */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-semibold text-zinc-500 dark:text-zinc-500">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold text-zinc-700 dark:text-zinc-300">{footerConfig.bottom.copyright}</span>
          <span className="text-zinc-450 dark:text-zinc-600">{footerConfig.bottom.builtBy}</span>
        </div>

        <div className="flex items-center gap-4 text-center">
          <div>
            <span className="font-extrabold uppercase text-[9px] text-zinc-400 dark:text-zinc-600 mr-1">Version:</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-bold">{footerConfig.bottom.version}</span>
          </div>
          <span className="text-zinc-300 dark:text-zinc-800">|</span>
          <div>
            <span className="font-extrabold uppercase text-[9px] text-zinc-400 dark:text-zinc-600 mr-1">Last Updated:</span>
            <span className="text-zinc-700 dark:text-zinc-300 font-bold">{buildDate}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {footerConfig.bottom.quickLinks.map((link, idx) => (
            isExternalOrStatic(link.link) ? (
              <a key={idx} href={link.link} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {link.label}
              </a>
            ) : (
              <Link key={idx} to={link.link} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                {link.label}
              </Link>
            )
          ))}
          <Link to="/status" className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Operational</span>
          </Link>
        </div>
      </div>

      {/* -------------------- 7. BACK TO TOP FLOATING BUTTON -------------------- */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-20 right-6 sm:bottom-24 sm:right-8 p-3 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 text-zinc-650 dark:text-zinc-350 shadow-xl hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 z-40 cursor-pointer ${
          showBackToTop ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible pointer-events-none'
        }`}
        title="Scroll to Top"
        aria-label="Back to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

    </footer>
  );
}

