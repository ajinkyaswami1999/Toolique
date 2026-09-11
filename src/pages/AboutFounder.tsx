import { useState, useEffect, useRef } from 'react';
import {
  User,
  Layers,
  Award,
  Cpu,
  Code,
  Trophy,
  Target,
  Mail,
  Sparkles
} from 'lucide-react';
import SEO from '../components/SEO';
import { socialLinks } from '../config/socialLinks';
import type { GitHubProfile, NavSection } from '../types/founder';
import Sidebar from '../components/founder/Sidebar';
import Hero from '../components/founder/Hero';
import Stats from '../components/founder/Stats';
import About from '../components/founder/About';
import Journey from '../components/founder/Journey';
import Brands from '../components/founder/Brands';
import Build from '../components/founder/Build';
import Skills from '../components/founder/Skills';
import Projects from '../components/founder/Projects';
import Values from '../components/founder/Values';
import Connect from '../components/founder/Connect';

const sections: NavSection[] = [
  { id: 'hero', name: 'Introduction', icon: Sparkles },
  { id: 'about', name: 'About Me', icon: User },
  { id: 'journey', name: 'My Journey', icon: Layers },
  { id: 'brands', name: 'My Brands', icon: Award },
  { id: 'what-i-build', name: 'What I Build', icon: Cpu },
  { id: 'skills', name: 'Technical Skills', icon: Code },
  { id: 'projects', name: 'Featured Projects', icon: Trophy },
  { id: 'why-toolique', name: 'Why Toolique', icon: Target },
  { id: 'connect', name: 'Connect', icon: Mail }
];

export default function AboutFounder() {
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [githubData, setGithubData] = useState<GitHubProfile | null>(null);
  const [loadingGithub, setLoadingGithub] = useState(true);

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

  // Scroll spy + reading-progress implementation
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

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)) : 0;
      setScrollProgress(progress);
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
        'image': 'https://www.toolique.in/favicon-512x512.png',
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

  return (
    <div className="relative text-left max-w-6xl mx-auto py-4">
      <SEO
        title="About Ajinkya Swami | Founder of Toolique & Voxelique"
        description="Meet Ajinkya Swami, founder of Toolique and Voxelique. Learn about his experience in QA Automation, software development, engineering tools, 3D printing, and his mission to build high-quality free online tools."
        canonicalUrl={pageUrl}
        schemaMarkup={schemaMarkup}
      />

      {/* Ambient background accents */}
      <div className="absolute top-[15%] right-[-10%] w-[380px] h-[380px] bg-indigo-500/[0.03] dark:bg-indigo-500/[0.015] rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute top-[55%] left-[-10%] w-[380px] h-[380px] bg-teal-500/[0.03] dark:bg-teal-500/[0.015] rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="hidden sm:block absolute top-[85%] right-[5%] w-[320px] h-[320px] bg-purple-500/[0.025] dark:bg-purple-500/[0.012] rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="hidden sm:block absolute inset-0 bg-dot-grid opacity-30 pointer-events-none -z-10" />

      {/* Mobile Sticky Quick Navigation Bar (Top-16 right below navbar) */}
      <div className="lg:hidden sticky top-16 z-30 -mx-4 px-4 py-2.5 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-2xs mb-6">
        {sections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{section.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left Sticky Sidebar (Desktop) & Right Content Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">

        {/* Left Sticky Desktop Sidebar Column */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 self-start space-y-4 text-left z-20">
          <Sidebar
            sections={sections}
            activeSection={activeSection}
            scrollToSection={scrollToSection}
            scrollProgress={scrollProgress}
          />
        </aside>

        {/* Right Column: Content Pages */}
        <div className="col-span-1 lg:col-span-9 space-y-20">

          <div id="hero" ref={sectionRefs.hero} className="scroll-mt-24 pt-4">
            <Hero scrollToSection={scrollToSection} />
          </div>

          <div className="scroll-mt-24">
            <Stats />
          </div>

          <div id="about" ref={sectionRefs.about} className="scroll-mt-24 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider">
                <User className="w-3.5 h-3.5" />
                <span>Background & Ethos</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                About Me
              </h2>
              <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400">
                From Quality Assurance engineering to full-stack systems and hardware manufacturing.
              </p>
            </div>
            <About />
          </div>

          <div id="journey" ref={sectionRefs.journey} className="scroll-mt-24 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20 text-[10px] font-black uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                <span>Career Milestones</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                My Journey & Growth
              </h2>
              <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400">
                The timeline of engineering breakthroughs, automation frameworks, and product launches.
              </p>
            </div>
            <Journey />
          </div>

          <div id="brands" ref={sectionRefs.brands} className="scroll-mt-24 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>Ecosystem & Ventures</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                My Brands
              </h2>
              <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400">
                Software utility calculations and precision additive manufacturing.
              </p>
            </div>
            <Brands />
          </div>

          <div id="what-i-build" ref={sectionRefs['what-i-build']} className="scroll-mt-24 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5" />
                <span>Tool Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                What I Build
              </h2>
              <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400">
                High-performance categories spanning developer tools, civil estimation, finance, and QA.
              </p>
            </div>
            <Build />
          </div>

          <div id="skills" ref={sectionRefs.skills} className="scroll-mt-24 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-wider">
                <Code className="w-3.5 h-3.5" />
                <span>Technical Stack</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                Technical Skills & Tools
              </h2>
              <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400">
                Core competencies across test automation, frontend engineering, and 3D printing.
              </p>
            </div>
            <Skills />
          </div>

          <div id="projects" ref={sectionRefs.projects} className="scroll-mt-24 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20 text-[10px] font-black uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5" />
                <span>Portfolio Highlights</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                Featured Projects
              </h2>
              <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400">
                Key applications and tools engineered for performance, precision, and zero tracking.
              </p>
            </div>
            <Projects />
          </div>

          <div id="why-toolique" ref={sectionRefs['why-toolique']} className="scroll-mt-24 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-500/20 text-[10px] font-black uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                <span>Founding Vision</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                Why I Built Toolique
              </h2>
              <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400">
                The core philosophy, principles, and maker mindset behind the platform.
              </p>
            </div>
            <Values />
          </div>

          <div id="connect" ref={sectionRefs.connect} className="scroll-mt-24">
            <Connect githubData={githubData} loadingGithub={loadingGithub} />
          </div>

        </div>

      </div>
    </div>
  );
}
