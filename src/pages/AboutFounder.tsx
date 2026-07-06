import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  ExternalLink,
  Code,
  Layers,
  Award,
  BookOpen,
  Cpu,
  Zap,
  CheckCircle2,
  Heart,
  ArrowRight,
  Smartphone,
  ChevronRight,
  Target,
  Sparkles
} from 'lucide-react';
import SEO from '../components/SEO';
import { socialLinks } from '../config/socialLinks';

interface GitHubProfile {
  avatar_url: string;
  name: string;
  login: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
}

// Custom Inline SVGs for brand logos to prevent compilation issues with lucide-react brand icons
const GithubIcon = ({ className = "w-5 h-5" }) => (
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

const LinkedinIcon = ({ className = "w-5 h-5" }) => (
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

const InstagramIcon = ({ className = "w-5 h-5" }) => (
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

export default function AboutFounder() {
  const [activeSection, setActiveSection] = useState('hero');
  const [githubData, setGithubData] = useState<GitHubProfile | null>(null);
  const [loadingGithub, setLoadingGithub] = useState(true);

  // Sections list for sticky navigation
  const sections = [
    { id: 'hero', name: 'Introduction' },
    { id: 'about', name: 'About Me' },
    { id: 'journey', name: 'My Journey' },
    { id: 'brands', name: 'My Brands' },
    { id: 'what-i-build', name: 'What I Build' },
    { id: 'skills', name: 'Technical Skills' },
    { id: 'projects', name: 'Featured Projects' },
    { id: 'why-toolique', name: 'Why Toolique' },
    { id: 'connect', name: 'Connect' }
  ];

  // Refs for scroll spying
  const sectionRefs: { [key: string]: any } = {
    hero: useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
    journey: useRef<HTMLDivElement>(null),
    brands: useRef<HTMLDivElement>(null),
    'what-i-build': useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null),
    projects: useRef<HTMLDivElement>(null),
    'why-toolique': useRef<HTMLDivElement>(null),
    connect: useRef<HTMLDivElement>(null)
  };

  // Fetch GitHub profile data on mount
  useEffect(() => {
    if (!socialLinks.github) {
      setLoadingGithub(false);
      return;
    }
    fetch('https://api.github.com/users/ajinkyaswami1999')
      .then(res => {
        if (!res.ok) throw new Error('API Rate Limit or Network Error');
        return res.json();
      })
      .then((data: GitHubProfile) => {
        setGithubData(data);
        setLoadingGithub(false);
      })
      .catch(err => {
        console.error('GitHub API error:', err);
        // Graceful fallback to static defaults
        setGithubData({
          avatar_url: 'https://avatars.githubusercontent.com/u/58882510?v=4',
          name: 'Ajinkya Swami',
          login: 'ajinkyaswami1999',
          bio: 'QA Automation Engineer • Full-Stack Builder • 3D Printing Enthusiast',
          public_repos: 42,
          followers: 120,
          following: 85
        });
        setLoadingGithub(false);
      });
  }, []);

  // Scroll spy implementation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for header & comfort

      for (const section of sections) {
        const element = sectionRefs[section.id].current;
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = sectionRefs[id].current;
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  // Combined Schema graph for Person and Organizations
  const pageUrl = 'https://www.toolique.in/about-founder';
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.toolique.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'About Founder', 'item': pageUrl }
        ]
      },
      {
        '@type': 'Person',
        '@id': `${pageUrl}#person`,
        'name': 'Ajinkya Swami',
        'jobTitle': 'QA Automation Engineer & Full-Stack Builder',
        'url': pageUrl,
        'image': githubData?.avatar_url || 'https://www.toolique.in/favicon-512x512.png',
        'sameAs': Object.values(socialLinks).filter(link => link && link.startsWith('http')),
        'worksFor': [
          {
            '@type': 'Organization',
            'name': 'Toolique',
            'url': 'https://www.toolique.in'
          },
          {
            '@type': 'Organization',
            'name': 'Voxelique',
            'url': 'https://voxelique.com'
          }
        ]
      },
      {
        '@type': 'Organization',
        '@id': 'https://www.toolique.in/#organization',
        'name': 'Toolique',
        'url': 'https://www.toolique.in',
        'logo': 'https://www.toolique.in/favicon-512x512.png',
        'founder': {
          '@type': 'Person',
          'name': 'Ajinkya Swami'
        }
      },
      {
        '@type': 'Organization',
        '@id': 'https://voxelique.com/#organization',
        'name': 'Voxelique',
        'url': 'https://voxelique.com',
        'founder': {
          '@type': 'Person',
          'name': 'Ajinkya Swami'
        }
      }
    ]
  };

  // Timeline milestones
  const milestones = [
    {
      year: '2020',
      title: 'Career Launch (QA Engineer)',
      desc: 'Began professional journey in Quality Assurance, focusing on functional verification and finding structural code flaws.'
    },
    {
      year: '2021',
      title: 'QA Automation Specialist',
      desc: 'Designed high-fidelity testing frameworks using Selenium, Python, and API testing models to speed up release iterations.'
    },
    {
      year: '2022',
      title: 'Productivity Architect',
      desc: 'Built custom internal desktop scripts and browser automation extensions to reduce repetitive manual overhead.'
    },
    {
      year: '2023',
      title: 'Full-Stack Integration',
      desc: 'Self-taught modern frontend stacks (React, Next.js) and Node backend servers to bring personal software designs to life.'
    },
    {
      year: '2024',
      title: 'Founding Toolique',
      desc: 'Launched Toolique to deliver clean, ad-free, 100% browser-based utility calculators tailored for Indian engineering & finance.'
    },
    {
      year: '2025',
      title: 'Founding Voxelique & Maker Era',
      desc: 'Ventured into hardware prototyping and creative manufacturing, launching Voxelique for 3D printing custom design solutions.'
    },
    {
      year: '2026 & Beyond',
      title: 'Engineering the Future',
      desc: 'Scaling dynamic calculation suites, AI-driven offline tools, and hardware-software bridges to empower global makers.'
    }
  ];

  // Tool categories for mapping
  const buildCategories = [
    { name: 'Developer Tools', path: '/?category=developer', icon: Code, desc: 'Minifiers, formatters, and tag generators.' },
    { name: 'PDF Tools', path: '/?category=pdf', icon: Layers, desc: 'Merge, split, and edit PDF documents client-side.' },
    { name: 'Image Tools', path: '/?category=image', icon: Sparkles, desc: 'Compress, crop, and convert images locally.' },
    { name: 'Finance Calculators', path: '/?category=finance', icon: Cpu, desc: 'Compute GST, SIP, EMI, and salary breakdowns.' },
    { name: 'Civil Engineering', path: '/?category=civil', icon: Target, desc: 'Brick, cement, steel, and concrete calculations.' },
    { name: 'Architecture Tools', path: '/?category=architecture', icon: BookOpen, desc: 'Staircase risers, paint coverage, and FAR clearances.' },
    { name: '3D Print Studio', path: '/3d-print-studio', icon: Zap, desc: 'Filament, print farm, and AMS slot configurations.' },
    { name: 'Advanced Math Studio', path: '/math-studio', icon: Award, desc: 'Equation solvers, matrices, and geometry calculations.' },
    { name: 'Construction estimation', path: '/?q=construction', icon: Target, desc: 'Detailed bill of materials and Indian standard BOQs.' },
    { name: 'Productivity Utilities', path: '/?category=text', icon: Smartphone, desc: 'Word counters, generators, and text diff checkers.' }
  ];

  // Technical skills
  const skillsData = [
    {
      category: 'QA & Testing',
      skills: ['Selenium', 'Playwright', 'Appium', 'Postman', 'REST API Testing', 'Framework Design', 'Test Planning', 'SQL Testing']
    },
    {
      category: 'Programming',
      skills: ['Python', 'JavaScript', 'TypeScript', 'SQL']
    },
    {
      category: 'Frontend',
      skills: ['React', 'Next.js', 'Tailwind CSS', 'HTML5', 'CSS3']
    },
    {
      category: 'Backend',
      skills: ['Node.js', 'REST APIs', 'Express']
    },
    {
      category: 'Database',
      skills: ['MySQL', 'PostgreSQL', 'SQLite']
    },
    {
      category: 'DevOps & Other',
      skills: ['Git & GitHub', 'CI/CD Pipelines', 'Docker', 'Agile / Scrum', 'Jira', 'Rapid Prototyping']
    }
  ];

  // Featured Projects
  const projectsData = [
    {
      name: 'Toolique Suite',
      desc: 'A robust portfolio of 158+ browser-based calculation utilities. Designed with high-performance JS computation running entirely local to safeguard user privacy.',
      tech: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Workbox', 'MathJS'],
      url: socialLinks.toolique
    },
    {
      name: 'Voxelique 3D Studio',
      desc: 'A custom manufacturing and 3D printing store providing industrial prototypes, rapid design iterations, functional components, and creative architectural decors.',
      tech: ['3D Printing', 'CAD Modeling', 'Additive Manufacturing', 'Product Design'],
      url: socialLinks.voxelique
    },
    {
      name: '3D Printing Cost Calculator',
      desc: 'An advanced estimator tracking filament weights, electricity metrics, depreciation, labor, packaging, and profit margins to price 3D prints professionally.',
      tech: ['React', 'TypeScript', 'Tailwind CSS', 'Local Storage API'],
      url: `${socialLinks.toolique}/tool/3d-printing-cost-calculator`
    },
    {
      name: 'Advanced BOQ Calculator India',
      desc: 'A heavy-duty civil engineering utility building full Bill of Quantities (BOQ) with customized material splits, labor rates, and professional PDF/Excel reporting.',
      tech: ['React', 'PDF-Lib', 'SheetJS', 'Tailwind CSS', 'Indian Standard Rules'],
      url: `${socialLinks.toolique}/tools/advanced-boq-calculator-india`
    },
    {
      name: 'Construction Cost Calculator',
      desc: 'An area-based construction estimator evaluating brick, cement, steel, sand, aggregate, and labor costs dynamically based on Indian regional rates.',
      tech: ['React', 'Tailwind CSS', 'Engineering Thumb Rules'],
      url: `${socialLinks.toolique}/tool/construction-cost-calculator`
    },
    {
      name: 'Steel Weight Calculator',
      desc: 'A structural tool calculating weight profiles of round bars, tubes, beams, channels, and plates across custom alloys and dimensions.',
      tech: ['React', 'Mathematical Modeling', 'Tailwind CSS'],
      url: `${socialLinks.toolique}/tool/steel-weight-calculator`
    },
    {
      name: 'Advanced Math Studio',
      desc: 'A comprehensive analytical environment for resolving coordinate geometry, multi-variable calculus, matrix algebra, linear programming, and Fourier calculations.',
      tech: ['React', 'Math.js', 'Framer Motion', 'Tailwind CSS'],
      url: `${socialLinks.toolique}/math-studio`
    }
  ];

  // Core values
  const coreValues = [
    { title: 'Accuracy', desc: 'Precise formula outputs aligned with Indian and global structural standards.' },
    { title: 'Simplicity', desc: 'No signup blockades, no ads, and clean layouts that get straight to business.' },
    { title: 'Innovation', desc: 'Evolving dynamic calculations, offline service availability, and modern UX paradigms.' },
    { title: 'Performance', desc: 'Microsecond processing speeds using client-side execution, bypassing network roundtrips.' },
    { title: 'Privacy First', desc: 'All data stays on the user device. Absolute zero tracking or remote payload logging.' },
    { title: 'Continuous Learning', desc: 'Constant exploration of engineering and software standards to enrich the toolkit.' },
    { title: 'User-Centric', desc: 'Crafting responsive, intuitive flows designed by engineers, for engineers.' },
    { title: 'Problem Solving', desc: 'Converting tedious mathematical models into straightforward visual web utilities.' }
  ];

  // Fun facts
  const funFacts = [
    { title: 'Maker Mentality', desc: 'Maintains a local custom 3D printing workshop, building functional engineering prints.' },
    { title: 'Automation Addict', desc: 'If a workflow takes more than 3 steps and is repeated, a script is built for it.' },
    { title: 'Privacy Guard', desc: 'Staunch advocate for browser-based client computing that operates without tracking databases.' },
    { title: 'Tinkerer by Choice', desc: 'Spends weekends bridging hardware controls (IoT/3D design) with modern web dashboards.' },
    { title: 'Constant Upskilling', desc: 'Learns emerging software libraries and mathematical standards to fuel the next 50 Toolique tools.' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative text-left max-w-6xl mx-auto py-4"
    >
      <SEO
        title="About Ajinkya Swami | Founder of Toolique & Voxelique"
        description="Meet Ajinkya Swami, founder of Toolique and Voxelique. Learn about his experience in QA Automation, software development, engineering tools, 3D printing, and his mission to build high-quality free online tools."
        canonicalUrl={pageUrl}
        schemaMarkup={schemaMarkup}
      />

      {/* Ambient background accent */}
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/[0.03] dark:bg-indigo-500/[0.015] rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-[60%] left-[-10%] w-[400px] h-[400px] bg-teal-500/[0.03] dark:bg-teal-500/[0.015] rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Main Grid: Left Sidebar Navigation (Desktop) & Right Content Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Sticky Section Navigation (Desktop only) */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
          <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-650 tracking-wider uppercase mb-4 px-2">
              On This Page
            </h3>
            <nav className="flex flex-col gap-1.5">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`text-left text-xs font-bold py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-350 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40'
                  }`}
                >
                  {section.name}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Right Column: Content Pages */}
        <div className="col-span-1 lg:col-span-9 space-y-20">
          
          {/* Section: Hero */}
          <div id="hero" ref={sectionRefs.hero} className="scroll-mt-24 pt-4">
            <div className="p-6 sm:p-10 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-white/70 to-white/30 dark:from-zinc-900/60 dark:to-zinc-950/30 backdrop-blur-md shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.04] dark:bg-indigo-500/[0.02] rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                {/* Profile Picture */}
                <div className="relative group shrink-0">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-teal-500 opacity-30 blur group-hover:opacity-50 transition duration-300" />
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center">
                    {githubData?.avatar_url ? (
                      <img
                        src={githubData.avatar_url}
                        alt="Ajinkya Swami"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-zinc-400 dark:text-zinc-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-4 text-center md:text-left flex-grow">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Founder Profile
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
                    Ajinkya Swami
                  </h1>
                  <h2 className="text-sm font-semibold text-zinc-655 dark:text-zinc-350 leading-relaxed max-w-xl">
                    QA Automation Engineer • Full-Stack Builder • 3D Printing Enthusiast • Founder of Toolique & Voxelique
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl font-medium">
                    I build practical digital tools and real-world solutions that simplify everyday work for developers, engineers, architects, students, businesses, and makers. My goal is to create fast, reliable, privacy-friendly tools that solve real problems without unnecessary complexity.
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                    {socialLinks.toolique && (
                      <a href="/" className="saas-button-primary text-xs">
                        Explore Toolique <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {socialLinks.voxelique && (
                      <a
                        href={socialLinks.voxelique}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="saas-button-secondary text-xs"
                      >
                        Visit Voxelique <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => scrollToSection('connect')}
                      className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
                    >
                      Connect With Me
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: About Me */}
          <div id="about" ref={sectionRefs.about} className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                About Me
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md space-y-4">
                <h3 className="text-base font-bold text-zinc-800 dark:text-white">
                  Automation & QA Background
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  With over <strong>4+ years of quality engineering experience</strong>, I specialize in designing automation frameworks, validating backend APIs, structuring SQL schemas, and implementing Selenium scripts. Having audited and tested systems for industry-grade reliability, I bring that same standard of rigorous verification and accuracy to everything I develop.
                </p>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Instead of only validating client deliverables, I realized my passion lay in engineering functional products from scratch. Creating tools that run securely, instantly, and with zero subscription fees is my contribution back to the developer and engineering communities.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md space-y-4">
                <h3 className="text-base font-bold text-zinc-805 dark:text-white">
                  Engineering & Prototyping Passion
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-450 leading-relaxed">
                  Outside of pure code architecture, I have a deep fascination with physical product design, rapid manufacturing, and <strong>3D printing</strong>. Tinkering with FDM printers, mechanical properties of filaments, slicing profiles, and post-production scaling led me to start Voxelique.
                </p>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-450 leading-relaxed">
                  My vision is to bridge software and physical tinkering. Whether you're calculating civil material volumes for a building foundation, evaluating matrix equations in a math studio, or planning exposure steps for SLA resin printing, Toolique is built to serve as your offline-ready browser companion.
                </p>
              </div>
            </div>
          </div>

          {/* Section: My Journey */}
          <div id="journey" ref={sectionRefs.journey} className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                My Journey
              </h2>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-6 sm:pl-8 border-l border-zinc-200 dark:border-zinc-800 space-y-8 ml-2 py-2">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline indicator circle */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 group-hover:border-indigo-500 transition duration-300 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 group-hover:bg-indigo-500 transition" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="inline-block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                      {milestone.year}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition">
                      {milestone.title}
                    </h4>
                    <p className="text-xs text-zinc-455 dark:text-zinc-400 leading-relaxed max-w-2xl">
                      {milestone.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: My Brands */}
          <div id="brands" ref={sectionRefs.brands} className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                My Brands
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand 1: Toolique */}
              {socialLinks.toolique && (
                <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-white/60 to-white/20 dark:from-zinc-900/40 dark:to-zinc-950/20 shadow-sm space-y-5 flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-300">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        Toolique
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase">
                        Active Suite
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      A growing collection of free online calculators, engineering utilities, productivity tools, developer resources, and business estimators built for everyone. Computation occurs 100% locally.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <a href="/" className="saas-button-primary py-2 px-4 text-xs">
                      Visit Toolique
                    </a>
                    <a href="/?view=all" className="saas-button-secondary py-2 px-4 text-xs">
                      Browse Tools
                    </a>
                  </div>
                </div>
              )}

              {/* Brand 2: Voxelique */}
              {socialLinks.voxelique && (
                <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-white/60 to-white/20 dark:from-zinc-900/40 dark:to-zinc-950/20 shadow-sm space-y-5 flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-300">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        Voxelique
                      </h3>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md uppercase">
                        Manufacturing
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      A premium 3D printing brand focused on custom products, engineering prototypes, creative manufacturing, home décor, and innovative designs.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <a
                      href={socialLinks.voxelique}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="saas-button-primary py-2 px-4 text-xs"
                    >
                      Visit Voxelique
                    </a>
                    <a
                      href={`${socialLinks.toolique}/3d-print-studio`}
                      className="saas-button-secondary py-2 px-4 text-xs"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: What I Build */}
          <div id="what-i-build" ref={sectionRefs['what-i-build']} className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-teal-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                What I Build
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {buildCategories.map((cat, idx) => {
                const IconComponent = cat.icon;
                return (
                  <a
                    key={idx}
                    href={cat.path}
                    className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 bg-white/20 dark:bg-zinc-950/20 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 group-hover:bg-indigo-500/15 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-250 group-hover:text-zinc-900 dark:group-hover:text-white transition">
                          {cat.name}
                        </h4>
                      </div>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-555 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-end text-[10px] font-bold text-zinc-450 dark:text-zinc-600 group-hover:text-indigo-500 transition pt-3">
                      Go To Category <ChevronRight className="w-3 h-3 ml-0.5" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Section: Technical Skills */}
          <div id="skills" ref={sectionRefs.skills} className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <Code className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                Technical Skills
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillsData.map((category, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md space-y-3"
                >
                  <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-wider">
                    {category.category}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {category.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-900/30 text-[10px] font-bold text-zinc-650 dark:text-zinc-350"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Featured Projects */}
          <div id="projects" ref={sectionRefs.projects} className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                Featured Projects
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {projectsData.map((project, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md space-y-4 flex flex-col md:flex-row gap-6 items-stretch justify-between group hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="space-y-3 flex-grow max-w-2xl">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {project.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {project.desc}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {project.tech.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded bg-zinc-200/40 dark:bg-zinc-900/60 text-[9px] font-bold text-zinc-500 dark:text-zinc-450"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-end md:items-center">
                    <a
                      href={project.url}
                      target={project.url?.startsWith('http') ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="saas-button-secondary py-2 px-4 text-xs w-full md:w-auto"
                    >
                      Visit Project <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Why I Built Toolique & Core Values */}
          <div id="why-toolique" ref={sectionRefs['why-toolique']} className="scroll-mt-24 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
                  <Target className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                  Why I Built Toolique
                </h2>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md space-y-4">
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                  The vision behind Toolique is to build one of India's largest collections of free online tools that work directly in the browser without requiring users to install software or create accounts.
                </p>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-450 leading-relaxed">
                  Too many utility sites are bloated with invasive tracker networks, slow loading times, wall-to-wall banner ads, or paywalls blocking basic files. I built Toolique to counter that. Everything here is computed local to the host client, meaning we store zero record of your input. It is built for absolute privacy, speed, accuracy, accessibility, and continuous innovation.
                </p>
              </div>
            </div>

            {/* Core Values grid */}
            <div className="space-y-6">
              <h3 className="text-base font-bold text-zinc-850 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> Core Values
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {coreValues.map((val, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850 bg-white/10 dark:bg-zinc-950/10 space-y-1"
                  >
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      {val.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fun Facts grid */}
            <div className="space-y-6">
              <h3 className="text-base font-bold text-zinc-850 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Fun Facts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {funFacts.map((fact, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850 bg-white/10 dark:bg-zinc-950/10 space-y-1"
                  >
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {fact.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
                      {fact.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Connect & Contact */}
          <div id="connect" ref={sectionRefs.connect} className="scroll-mt-24 space-y-8">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                Connect With Me
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* GitHub Card */}
              {socialLinks.github && (
                <div className="col-span-1 md:col-span-6 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-white/70 to-white/30 dark:from-zinc-900/60 dark:to-zinc-950/30 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center">
                      <GithubIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">GitHub</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">@{githubData?.login || 'ajinkyaswami1999'}</p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[2.5rem]">
                    {githubData?.bio || 'QA Automation Engineer & Full-Stack Builder | Passionate about building products, 3D printing, and automation.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-zinc-200/50 dark:border-zinc-855/80 text-center">
                    <div>
                      <span className="block text-sm font-black text-zinc-900 dark:text-white">
                        {loadingGithub ? '...' : githubData?.public_repos || '40+'}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase">Repositories</span>
                    </div>
                    <div>
                      <span className="block text-sm font-black text-zinc-900 dark:text-white">
                        {loadingGithub ? '...' : githubData?.followers || '100+'}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase">Followers</span>
                    </div>
                    <div>
                      <span className="block text-sm font-black text-zinc-900 dark:text-white">
                        {loadingGithub ? '...' : githubData?.following || '80+'}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase">Following</span>
                    </div>
                  </div>

                  <a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="saas-button-primary text-xs w-full"
                  >
                    View Repositories
                  </a>
                </div>
              )}

              {/* LinkedIn & Instagram Cards */}
              <div className="col-span-1 md:col-span-6 space-y-4">
                
                {/* LinkedIn Card */}
                {socialLinks.linkedin && (
                  <div className="p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/20 dark:bg-zinc-950/20 flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0077b5]/10 text-[#0077b5] flex items-center justify-center">
                        <LinkedinIcon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">LinkedIn</h4>
                        <p className="text-[10px] text-zinc-455 dark:text-zinc-500 font-semibold">Ajinkya Swami</p>
                      </div>
                    </div>
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-[#0077b5] hover:bg-[#00629b] text-white font-bold text-[10px] transition"
                    >
                      Connect
                    </a>
                  </div>
                )}

                {/* Instagram Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Instagram Personal */}
                  {socialLinks.instagramPersonal && (
                    <a
                      href={socialLinks.instagramPersonal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/20 dark:bg-zinc-950/20 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between h-28 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                        <InstagramIcon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Instagram</h4>
                        <p className="text-[9px] text-zinc-400 font-mono mt-0.5">@2ajinkya6</p>
                      </div>
                    </a>
                  )}

                  {/* Instagram Voxelique */}
                  {socialLinks.instagramVoxelique && (
                    <a
                      href={socialLinks.instagramVoxelique}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/20 dark:bg-zinc-950/20 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between h-28 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <InstagramIcon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Voxelique</h4>
                        <p className="text-[9px] text-zinc-400 font-mono mt-0.5">@voxelique</p>
                      </div>
                    </a>
                  )}
                </div>

              </div>
            </div>

            {/* Premium Contact Buttons / Support section */}
            <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md text-center space-y-4">
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-250">
                Contact
              </h4>
              
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {socialLinks.github && (
                  <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="saas-button-secondary text-xs flex items-center gap-1.5">
                    <GithubIcon className="w-4 h-4" /> GitHub
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="saas-button-secondary text-xs flex items-center gap-1.5">
                    <LinkedinIcon className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {socialLinks.instagramPersonal && (
                  <a href={socialLinks.instagramPersonal} target="_blank" rel="noopener noreferrer" className="saas-button-secondary text-xs flex items-center gap-1.5">
                    <InstagramIcon className="w-4 h-4" /> Instagram
                  </a>
                )}
                {socialLinks.toolique && (
                  <a href="/" className="saas-button-secondary text-xs flex items-center gap-1.5">
                    Toolique
                  </a>
                )}
                {socialLinks.voxelique && (
                  <a href={socialLinks.voxelique} target="_blank" rel="noopener noreferrer" className="saas-button-secondary text-xs flex items-center gap-1.5">
                    Voxelique
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* Footer Heart split */}
          <div className="pt-8 text-center text-xs text-zinc-400 dark:text-zinc-550 flex items-center justify-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> in India
          </div>

        </div>

      </div>
    </motion.div>
  );
}
