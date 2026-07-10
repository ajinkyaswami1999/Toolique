import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
        'image': 'https://www.toolique.in/founder.jpeg',
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

      {/* Ambient background accents */}
      <div className="absolute top-[15%] right-[-10%] w-[380px] h-[380px] bg-indigo-500/[0.03] dark:bg-indigo-500/[0.015] rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute top-[55%] left-[-10%] w-[380px] h-[380px] bg-teal-500/[0.03] dark:bg-teal-500/[0.015] rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="hidden sm:block absolute top-[85%] right-[5%] w-[320px] h-[320px] bg-purple-500/[0.025] dark:bg-purple-500/[0.012] rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="hidden sm:block absolute inset-0 bg-dot-grid opacity-30 pointer-events-none -z-10" />

      {/* Main Grid: Left Sidebar Navigation (Desktop) & Right Content Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <Sidebar
          sections={sections}
          activeSection={activeSection}
          scrollToSection={scrollToSection}
          scrollProgress={scrollProgress}
        />

        {/* Right Column: Content Pages */}
        <div className="col-span-1 lg:col-span-9 space-y-20">

          <div id="hero" ref={sectionRefs.hero} className="scroll-mt-24 pt-4">
            <Hero scrollToSection={scrollToSection} />
          </div>

          <div className="scroll-mt-24">
            <Stats />
          </div>

          <div id="about" ref={sectionRefs.about} className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
                About Me
              </h2>
            </div>
            <About />
          </div>

          <div id="journey" ref={sectionRefs.journey} className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
                My Journey
              </h2>
            </div>
            <Journey />
          </div>

          <div id="brands" ref={sectionRefs.brands} className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
                My Brands
              </h2>
            </div>
            <Brands />
          </div>

          <div id="what-i-build" ref={sectionRefs['what-i-build']} className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-teal-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
                What I Build
              </h2>
            </div>
            <Build />
          </div>

          <div id="skills" ref={sectionRefs.skills} className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <Code className="w-5 h-5" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
                Technical Skills
              </h2>
            </div>
            <Skills />
          </div>

          <div id="projects" ref={sectionRefs.projects} className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
                Featured Projects
              </h2>
            </div>
            <Projects />
          </div>

          <div id="why-toolique" ref={sectionRefs['why-toolique']} className="scroll-mt-24 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
                Why I Built Toolique
              </h2>
            </div>
            <Values />
          </div>

          <div id="connect" ref={sectionRefs.connect} className="scroll-mt-24">
            <Connect githubData={githubData} loadingGithub={loadingGithub} />
          </div>

        </div>

      </div>
    </motion.div>
  );
}
