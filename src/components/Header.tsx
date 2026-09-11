import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Search, 
  Menu, 
  X, 
  User, 
  ChevronDown,
  TrendingUp,
  Code2,
  IndianRupee,
  Compass,
  ShieldCheck,
  Scale,
  Printer,
  Sparkles,
  Terminal,
  GraduationCap,
  LayoutGrid,
  Home as HomeIcon,
  Info,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Zap,
  ChevronRight,
  Lock,
  Layers,
  Phone
} from 'lucide-react';
import { toolsList } from '../data/tools';
import { TooliqueLogo } from './Logo';
import LucideIcon from './LucideIcon';
import { getToolCanonicalPath } from '../routes/AppRoutes';

interface DomainSuite {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  badge?: string;
  badgeColor?: string;
  color: string;
  bgLight: string;
  bgDark: string;
}

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'suites' | 'core' | 'company'>('suites');
  
  const location = useLocation();
  const navigate = useNavigate();
  const [navQuery, setNavQuery] = useState('');
  const modalInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Scroll detection for enhanced frosted header depth
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body scroll locking when drawer or command palette is open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  // Domain Calculation Hubs
  const domainHubs: DomainSuite[] = [
    { 
      name: 'Finance & Tax Hub', 
      path: '/finance', 
      icon: IndianRupee, 
      desc: 'Income Tax, HRA, SIP, Salary, GST & Loan Calculators', 
      badge: 'Budget 2025',
      badgeColor: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-300/60',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgLight: 'bg-emerald-50 hover:bg-emerald-100/70',
      bgDark: 'dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40'
    },
    { 
      name: 'Developer Hub', 
      path: '/developer', 
      icon: Code2, 
      desc: 'JSON, SQL, JWT, Regex, Base64 & Web SEO Diagnostics', 
      badge: 'Zero Latency',
      badgeColor: 'text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-950/60 border-indigo-300/60',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgLight: 'bg-indigo-50 hover:bg-indigo-100/70',
      bgDark: 'dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40'
    },
    { 
      name: 'Architecture & Civil', 
      path: '/architecture', 
      icon: Compass, 
      desc: '172+ Statutory Bye-Laws, FAR/FSI, Setbacks & BOQ', 
      badge: 'NBC 2016',
      badgeColor: 'text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/60 border-violet-300/60',
      color: 'text-violet-600 dark:text-violet-400',
      bgLight: 'bg-violet-50 hover:bg-violet-100/70',
      bgDark: 'dark:bg-violet-950/40 dark:hover:bg-violet-900/40'
    },
    { 
      name: 'QA Engineering Hub', 
      path: '/qa', 
      icon: ShieldCheck, 
      desc: 'Test Case Synthesis, Boundary Value Analysis & XPath', 
      badge: 'ISTQB',
      badgeColor: 'text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/60 border-rose-300/60',
      color: 'text-rose-600 dark:text-rose-400',
      bgLight: 'bg-rose-50 hover:bg-rose-100/70',
      bgDark: 'dark:bg-rose-950/40 dark:hover:bg-rose-900/40'
    },
    { 
      name: 'Economics Hub', 
      path: '/economics', 
      icon: TrendingUp, 
      desc: 'Micro & Macro Formulas, Elasticity, Profit & Rule of 70', 
      badge: '20+ Models',
      badgeColor: 'text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/60 border-blue-300/60',
      color: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-50 hover:bg-blue-100/70',
      bgDark: 'dark:bg-blue-950/40 dark:hover:bg-blue-900/40'
    }
  ];

  // Interactive Studios & Academies
  const interactiveStudios: DomainSuite[] = [
    { 
      name: 'Learning Academy', 
      path: '/academy', 
      icon: GraduationCap, 
      desc: '15+ Coding Tracks, Daily Practice & Question Bank', 
      badge: 'NEW',
      badgeColor: 'text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950/60 border-teal-300/60 animate-pulse',
      color: 'text-teal-600 dark:text-teal-400',
      bgLight: 'bg-teal-50 hover:bg-teal-100/70',
      bgDark: 'dark:bg-teal-950/40 dark:hover:bg-teal-900/40'
    },
    { 
      name: 'Symbolic Math Studio', 
      path: '/math-studio', 
      icon: Scale, 
      desc: '22 Solver Suites, Step-by-Step Calculus & Plots', 
      badge: 'CAS Engine',
      badgeColor: 'text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 border-amber-300/60',
      color: 'text-amber-600 dark:text-amber-400',
      bgLight: 'bg-amber-50 hover:bg-amber-100/70',
      bgDark: 'dark:bg-amber-950/40 dark:hover:bg-amber-900/40'
    },
    { 
      name: '3D Maker Studio', 
      path: '/3d-print-studio', 
      icon: Printer, 
      desc: 'Filament Cost, AMS Multi-Color & HueForge Layers', 
      badge: '3D Slicing',
      badgeColor: 'text-cyan-700 dark:text-cyan-300 bg-cyan-100/80 dark:bg-cyan-950/60 border-cyan-300/60',
      color: 'text-cyan-600 dark:text-cyan-400',
      bgLight: 'bg-cyan-50 hover:bg-cyan-100/70',
      bgDark: 'dark:bg-cyan-950/40 dark:hover:bg-cyan-900/40'
    },
    { 
      name: 'AI Studio', 
      path: '/ai', 
      icon: Sparkles, 
      desc: 'Client-Sandboxed AI Assistants for SQL & Coding', 
      badge: 'Browser AI',
      badgeColor: 'text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/60 border-purple-300/60',
      color: 'text-purple-600 dark:text-purple-400',
      bgLight: 'bg-purple-50 hover:bg-purple-100/70',
      bgDark: 'dark:bg-purple-950/40 dark:hover:bg-purple-900/40'
    },
    { 
      name: 'Code Playground', 
      path: '/playground', 
      icon: Terminal, 
      desc: 'Instant Multi-Language Client-Side Sandbox', 
      badge: 'PWA Ready',
      badgeColor: 'text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-950/60 border-indigo-300/60',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgLight: 'bg-indigo-50 hover:bg-indigo-100/70',
      bgDark: 'dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40'
    }
  ];

  const productSuites = useMemo(() => [...domainHubs, ...interactiveStudios], []);

  // Company / Resources Links
  const companyLinks = [
    { name: 'About Toolique', path: '/about', icon: Info, desc: 'Platform mission, client-side compute architecture' },
    { name: 'About Founder', path: '/about-founder', icon: User, desc: 'Vision, background & engineering journey', badge: 'Story' },
    { name: 'Why Toolique', path: '/why-toolique', icon: HelpCircle, desc: 'Zero data logging, zero latency & comparison' },
    { name: 'Knowledge Base & Blog', path: '/blog', icon: BookOpen, desc: 'Statutory guides, algorithms & coding roadmaps' },
    { name: 'Contact & Support', path: '/contact', icon: Phone, desc: 'Get in touch for enterprise or feature inquiries' }
  ];

  // Search Palette Filtering Logic
  const categoriesList = [
    { id: 'all', label: 'All (274+)' },
    { id: 'finance', label: 'Finance & Tax' },
    { id: 'developer', label: 'Developer' },
    { id: 'architecture', label: 'Architecture & Civil' },
    { id: 'qa', label: 'QA Engineering' },
    { id: 'math-studio', label: 'Math Studio' },
    { id: '3d-printing', label: '3D Maker' },
    { id: 'economics', label: 'Economics' }
  ];

  const popularDefaultTools = useMemo(() => toolsList.filter(t =>
    ['BuildingFeasibilityChecker', 'GSTCalculator', 'SIPCalculator', 'IncomeTaxCalculator', 'SQLFormatter', 'JSONFormatter', 'ApiTester', 'TestCaseGenerator'].includes(t.id)
  ), []);

  const filteredSuggestions = useMemo(() => {
    let list = toolsList;
    if (searchCategory !== 'all') {
      if (searchCategory === 'developer') {
        list = list.filter(t => ['developer', 'web', 'security'].includes(t.category));
      } else {
        list = list.filter(t => t.category === searchCategory);
      }
    }

    if (!navQuery.trim()) {
      return searchCategory === 'all' ? popularDefaultTools : list.slice(0, 10);
    }

    const query = navQuery.toLowerCase().trim();
    return list.filter(tool =>
      (tool.name || '').toLowerCase().includes(query) ||
      (tool.category || '').toLowerCase().includes(query) ||
      (tool.shortDescription || '').toLowerCase().includes(query) ||
      (tool.keywords || []).some(k => k.toLowerCase().includes(query))
    ).slice(0, 15);
  }, [navQuery, searchCategory, popularDefaultTools]);

  const activeResults = filteredSuggestions;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < activeResults.length) {
      const selectedTool = activeResults[selectedIndex];
      navigate(getToolCanonicalPath(selectedTool.category, selectedTool.slug));
      setNavQuery('');
      setIsSearchOpen(false);
      return;
    }
    if (navQuery.trim()) {
      navigate(`/tools?q=${encodeURIComponent(navQuery.trim())}`);
      setNavQuery('');
      setIsSearchOpen(false);
    }
  };

  // Keyboard navigation for Search Palette
  const handleKeyDownInSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < activeResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : activeResults.length - 1));
    }
  };

  // Scroll highlighted search item into view
  useEffect(() => {
    if (selectedIndex >= 0 && searchResultsRef.current) {
      const activeElement = searchResultsRef.current.children[selectedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
      if (!savedTheme) {
        localStorage.setItem('theme', 'light');
      }
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Global Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setSelectedIndex(-1);
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  // Close mobile menu on location change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isSuiteActive = productSuites.some(s => isActive(s.path));
  const isCompanyActive = companyLinks.some(c => isActive(c.path));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 w-full pt-2.5 sm:pt-3.5 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300">
        <div 
          className={`max-w-7xl 2xl:max-w-[1440px] mx-auto pointer-events-auto transition-all duration-300 rounded-2xl sm:rounded-3xl lg:rounded-full border px-3.5 sm:px-6 lg:px-7 h-14 sm:h-15 flex items-center justify-between gap-2 sm:gap-4 ${
            isScrolled
              ? 'bg-white/92 dark:bg-[#0b0f19]/92 backdrop-blur-xl border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]'
              : 'bg-white/85 dark:bg-[#0b0f19]/85 backdrop-blur-lg border-zinc-200/70 dark:border-zinc-800/70 shadow-[0_4px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.18)]'
          }`}
        >
          
          {/* Left: Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-6 xl:gap-8 min-w-0">
            <Link 
              to="/" 
              className="flex items-center group py-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
              aria-label="Toolique Home"
            >
              <TooliqueLogo iconSize="w-8 h-8 sm:w-8.5 sm:h-8.5" />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label="Main Navigation">
              
              {/* 1. Home */}
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  location.pathname === '/'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 font-extrabold shadow-2xs'
                    : 'text-zinc-650 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-850/60'
                }`}
              >
                Home
              </Link>

              {/* 2. All Tools */}
              <Link
                to="/tools"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 inline-flex items-center gap-1.5 ${
                  isActive('/tools')
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 font-extrabold shadow-2xs'
                    : 'text-zinc-650 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-850/60'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>All Tools</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  274+
                </span>
              </Link>

              {/* 3. Suites & Studios Mega Dropdown */}
              <div className="relative group/suites py-1">
                <button
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer ${
                    isSuiteActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 font-extrabold shadow-2xs'
                      : 'text-zinc-650 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-850/60'
                  }`}
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Suites & Studios</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover/suites:rotate-180 opacity-70" />
                </button>

                {/* Mega Dropdown Menu Container */}
                <div className="absolute left-0 top-full pt-2 w-[620px] opacity-0 invisible group-hover/suites:opacity-100 group-hover/suites:visible transition-all duration-200 translate-y-1.5 group-hover/suites:translate-y-0 z-50 pointer-events-none group-hover/suites:pointer-events-auto">
                  <div className="rounded-3xl bg-white/98 dark:bg-[#0f1422]/98 border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] backdrop-blur-2xl p-4 overflow-hidden">
                    
                    {/* 2-Column Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      
                      {/* Col 1: Calculation Hubs */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-2.5 py-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            Calculation Hubs
                          </span>
                          <span className="text-[9px] font-bold text-zinc-400">5 Suites</span>
                        </div>

                        <div className="space-y-1">
                          {domainHubs.map((suite) => {
                            const Icon = suite.icon;
                            const isCurrent = isActive(suite.path);
                            return (
                              <Link
                                key={suite.name}
                                to={suite.path}
                                className={`flex items-start gap-2.5 p-2 rounded-2xl transition-all duration-150 group/item ${
                                  isCurrent
                                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                                    : `${suite.bgLight} ${suite.bgDark} text-zinc-750 dark:text-zinc-200 border border-transparent hover:border-zinc-200/60 dark:hover:border-zinc-700/60`
                                }`}
                              >
                                <div className={`p-2 rounded-xl ${suite.color} bg-white dark:bg-zinc-900 shadow-2xs shrink-0 mt-0.5 border border-zinc-200/50 dark:border-zinc-800 group-hover/item:scale-105 transition-transform`}>
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="text-xs font-black text-zinc-900 dark:text-white truncate">
                                      {suite.name}
                                    </div>
                                    {suite.badge && (
                                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border shrink-0 ${suite.badgeColor}`}>
                                        {suite.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                                    {suite.desc}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>

                      {/* Col 2: Interactive Studios */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-2.5 py-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Studios & Academies
                          </span>
                          <span className="text-[9px] font-bold text-zinc-400">5 Studios</span>
                        </div>

                        <div className="space-y-1">
                          {interactiveStudios.map((suite) => {
                            const Icon = suite.icon;
                            const isCurrent = isActive(suite.path);
                            return (
                              <Link
                                key={suite.name}
                                to={suite.path}
                                className={`flex items-start gap-2.5 p-2 rounded-2xl transition-all duration-150 group/item ${
                                  isCurrent
                                    ? 'bg-purple-50 dark:bg-purple-950/60 border border-purple-200/80 dark:border-purple-800/60 text-purple-900 dark:text-purple-200 shadow-2xs'
                                    : `${suite.bgLight} ${suite.bgDark} text-zinc-750 dark:text-zinc-200 border border-transparent hover:border-zinc-200/60 dark:hover:border-zinc-700/60`
                                }`}
                              >
                                <div className={`p-2 rounded-xl ${suite.color} bg-white dark:bg-zinc-900 shadow-2xs shrink-0 mt-0.5 border border-zinc-200/50 dark:border-zinc-800 group-hover/item:scale-105 transition-transform`}>
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="text-xs font-black text-zinc-900 dark:text-white truncate">
                                      {suite.name}
                                    </div>
                                    {suite.badge && (
                                      <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border shrink-0 ${suite.badgeColor}`}>
                                        {suite.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate mt-0.5">
                                    {suite.desc}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Footer Strip */}
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between px-2 text-xs">
                      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">
                        <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>100% Client-Side • Zero Data Transmission</span>
                      </div>
                      <Link
                        to="/tools"
                        className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 text-[11px] transition-colors"
                      >
                        <span>Explore Directory</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                  </div>
                </div>
              </div>

              {/* 4. Company & About Dropdown */}
              <div className="relative group/company py-1">
                <button
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer ${
                    isCompanyActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 font-extrabold shadow-2xs'
                      : 'text-zinc-650 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-850/60'
                  }`}
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <span>Company</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover/company:rotate-180 opacity-70" />
                </button>

                <div className="absolute left-0 top-full pt-2 w-72 opacity-0 invisible group-hover/company:opacity-100 group-hover/company:visible transition-all duration-200 translate-y-1.5 group-hover/company:translate-y-0 z-50 pointer-events-none group-hover/company:pointer-events-auto">
                  <div className="rounded-2xl bg-white/98 dark:bg-[#0f1422]/98 border border-zinc-200/90 dark:border-zinc-800/90 shadow-xl backdrop-blur-2xl p-2 space-y-1">
                    {companyLinks.map((item) => {
                      const Icon = item.icon;
                      const isCurrent = isActive(item.path);
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                            isCurrent
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-bold'
                              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0 mt-0.5">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                                {item.name}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/50">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

            </nav>
          </div>

          {/* Right: Search, Workspace, Theme Toggle & Mobile Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Command Palette Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-xs text-zinc-500 dark:text-zinc-400 hover:border-indigo-400/60 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-white dark:hover:bg-zinc-850 transition-all duration-150 cursor-pointer shadow-2xs group"
              title="Search all 274+ tools (Ctrl+K or ⌘K)"
              aria-label="Search tools"
            >
              <Search className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors shrink-0" />
              <span className="hidden md:inline text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate max-w-[120px] xl:max-w-[150px]">
                Search 274+ tools...
              </span>
              <kbd className="hidden sm:inline-flex items-center h-4.5 select-none px-1.5 font-mono text-[9px] font-bold bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Workspace / Dashboard Pill */}
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border transition-all duration-150 cursor-pointer text-xs font-bold ${
                isActive('/dashboard')
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'border-zinc-200/80 dark:border-zinc-800 text-zinc-750 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-50/80 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-850 shadow-2xs'
              }`}
              title="My Workspace & Saved Tools"
            >
              <User className={`w-3.5 h-3.5 ${isActive('/dashboard') ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
              <span className="hidden sm:inline">Workspace</span>
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-850 text-zinc-650 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-white transition-all cursor-pointer shadow-2xs focus:outline-hidden"
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Mobile Menu Hamburger / Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className={`lg:hidden p-2 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                isMobileMenuOpen 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-750 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-850'
              }`}
              aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE FULL-SCREEN SLIDE-OVER DRAWER (Responsive & Ultra-Smooth) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Slide-over Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-[360px] sm:max-w-[400px] h-full bg-white dark:bg-[#0b0f19] border-l border-zinc-200/90 dark:border-zinc-800/90 shadow-2xl flex flex-col z-50 overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              
              {/* Drawer Top Bar */}
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center"
                >
                  <TooliqueLogo iconSize="w-7 h-7" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300"
                    aria-label="Toggle Theme"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                  </button>

                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                    aria-label="Close Menu"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Drawer Search Trigger */}
              <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 font-semibold cursor-pointer shadow-2xs hover:border-indigo-400 transition text-left"
                >
                  <Search className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="flex-1 truncate">Search all 274+ tools...</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    ⌘K
                  </span>
                </button>
              </div>

              {/* Drawer Segmented Navigation Switcher */}
              <div className="px-3.5 pt-3 shrink-0">
                <div className="grid grid-cols-3 p-1 rounded-2xl bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/70 dark:border-zinc-800/70 text-xs font-bold">
                  <button
                    onClick={() => setMobileActiveTab('suites')}
                    className={`py-1.5 px-2 rounded-xl transition-all text-center truncate ${
                      mobileActiveTab === 'suites'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-black'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Suites
                  </button>
                  <button
                    onClick={() => setMobileActiveTab('core')}
                    className={`py-1.5 px-2 rounded-xl transition-all text-center truncate ${
                      mobileActiveTab === 'core'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-black'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Core Links
                  </button>
                  <button
                    onClick={() => setMobileActiveTab('company')}
                    className={`py-1.5 px-2 rounded-xl transition-all text-center truncate ${
                      mobileActiveTab === 'company'
                        ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-2xs font-black'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Company
                  </button>
                </div>
              </div>

              {/* Drawer Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
                
                {/* TAB 1: SUITES & STUDIOS */}
                {mobileActiveTab === 'suites' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Calculation Hubs Accordion/Card */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          Calculation Hubs
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400">5 Suites</span>
                      </div>

                      <div className="space-y-1.5">
                        {domainHubs.map((suite) => {
                          const Icon = suite.icon;
                          const isCurrent = isActive(suite.path);
                          return (
                            <Link
                              key={suite.name}
                              to={suite.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                                isCurrent
                                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                                  : 'bg-zinc-50/80 dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                              }`}
                            >
                              <div className={`p-2 rounded-xl ${suite.color} bg-white dark:bg-zinc-800 shadow-2xs shrink-0 border border-zinc-200/50 dark:border-zinc-700`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black truncate">{suite.name}</span>
                                  {suite.badge && (
                                    <span className={`text-[8.5px] font-extrabold px-1.5 py-0.2 rounded-md border ${suite.badgeColor}`}>
                                      {suite.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                  {suite.desc}
                                </p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interactive Studios Accordion/Card */}
                    <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Studios & Academies
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400">5 Studios</span>
                      </div>

                      <div className="space-y-1.5">
                        {interactiveStudios.map((suite) => {
                          const Icon = suite.icon;
                          const isCurrent = isActive(suite.path);
                          return (
                            <Link
                              key={suite.name}
                              to={suite.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                                isCurrent
                                  ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                                  : 'bg-zinc-50/80 dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                              }`}
                            >
                              <div className={`p-2 rounded-xl ${suite.color} bg-white dark:bg-zinc-800 shadow-2xs shrink-0 border border-zinc-200/50 dark:border-zinc-700`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black truncate">{suite.name}</span>
                                  {suite.badge && (
                                    <span className={`text-[8.5px] font-extrabold px-1.5 py-0.2 rounded-md border ${suite.badgeColor}`}>
                                      {suite.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                  {suite.desc}
                                </p>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}

                {/* TAB 2: CORE LINKS */}
                {mobileActiveTab === 'core' && (
                  <div className="space-y-2 animate-fadeIn">
                    <Link
                      to="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                        location.pathname === '/'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 text-indigo-600 dark:text-indigo-400 font-black'
                          : 'bg-zinc-50/80 dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      <HomeIcon className="w-4.5 h-4.5 text-indigo-500" />
                      <div className="flex-1">
                        <div className="text-xs font-bold">Homepage</div>
                        <div className="text-[10px] text-zinc-400 font-medium">Main tool launcher & featured suites</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </Link>

                    <Link
                      to="/tools"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                        isActive('/tools')
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 text-indigo-600 dark:text-indigo-400 font-black'
                          : 'bg-zinc-50/80 dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      <LayoutGrid className="w-4.5 h-4.5 text-indigo-500" />
                      <div className="flex-1">
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>All 274+ Tools Directory</span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                            274+
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-medium">Browse complete catalog with instant search</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                        isActive('/dashboard')
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 text-indigo-600 dark:text-indigo-400 font-black'
                          : 'bg-zinc-50/80 dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      <User className="w-4.5 h-4.5 text-indigo-500" />
                      <div className="flex-1">
                        <div className="text-xs font-bold">My Workspace & Dashboard</div>
                        <div className="text-[10px] text-zinc-400 font-medium">Favorites, recent calculations & bookmarks</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </Link>

                    {/* Highlight Box */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-rose-500/10 border border-indigo-200/60 dark:border-indigo-800/60 space-y-2 mt-4">
                      <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400">
                        <Zap className="w-4 h-4" />
                        <span>Progressive Web App (PWA)</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                        Install Toolique on your phone or tablet home screen for full offline client-side calculation access.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 3: COMPANY & INFO */}
                {mobileActiveTab === 'company' && (
                  <div className="space-y-2 animate-fadeIn">
                    {companyLinks.map((item) => {
                      const Icon = item.icon;
                      const isCurrent = isActive(item.path);
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition ${
                            isCurrent
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 text-indigo-600 dark:text-indigo-400 font-black'
                              : 'bg-zinc-50/80 dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                          }`}
                        >
                          <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold truncate">{item.name}</span>
                              {item.badge && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        </Link>
                      );
                    })}

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap gap-2 text-[11px] font-bold text-zinc-400 px-1">
                      <Link to="/privacy-policy" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-indigo-500">Privacy Policy</Link>
                      <span>•</span>
                      <Link to="/terms-conditions" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-indigo-500">Terms of Service</Link>
                      <span>•</span>
                      <Link to="/disclaimer" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-indigo-500">Legal Disclaimer</Link>
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer Bottom Bar */}
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-950/90 shrink-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Theme</span>
                  <div className="flex p-0.5 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 border border-zinc-300/50 dark:border-zinc-700">
                    <button
                      onClick={() => {
                        if (isDarkMode) toggleTheme();
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        !isDarkMode ? 'bg-white text-zinc-900 shadow-2xs font-extrabold' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => {
                        if (!isDarkMode) toggleTheme();
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                        isDarkMode ? 'bg-zinc-900 text-white shadow-2xs font-extrabold' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 text-center text-[10px] font-bold text-zinc-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100% Client-Side RAM • DPDP 2023 Compliant</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* COMMAND PALETTE SEARCH MODAL (Raycast & Linear Style) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4">
            
            {/* Modal Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
              aria-hidden="true"
            />
            
            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0f1422] border border-zinc-200/90 dark:border-zinc-800/90 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col z-50 max-h-[85vh]"
              role="dialog"
              aria-modal="true"
              aria-label="Command Search Palette"
            >
              
              {/* Search Header Input */}
              <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-zinc-100 dark:border-zinc-800/80 px-4 sm:px-5 py-4 gap-3 bg-white/50 dark:bg-zinc-900/30">
                <Search className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <input
                  ref={modalInputRef}
                  type="text"
                  value={navQuery}
                  onChange={(e) => {
                    setNavQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={handleKeyDownInSearch}
                  placeholder="Search 274+ tools, formulas, SQL, GST, 3D printing, FAR/FSI..."
                  className="flex-grow bg-transparent border-none outline-none text-sm sm:text-base font-bold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
                />
                
                {navQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setNavQuery('');
                      setSelectedIndex(-1);
                    }}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <kbd className="hidden sm:inline-flex text-[10px] font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  ESC
                </kbd>
              </form>

              {/* Category Filter Pills Bar */}
              <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {categoriesList.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSearchCategory(cat.id);
                      setSelectedIndex(-1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition cursor-pointer ${
                      searchCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Results & Suggestions List */}
              <div 
                ref={searchResultsRef}
                className="overflow-y-auto p-2 sm:p-3 space-y-1.5 max-h-[50vh] min-h-[160px]"
              >
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
                    {navQuery.trim() ? `Search Results (${activeResults.length})` : 'Popular & Frequently Used'}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400">
                    {navQuery.trim() ? 'Press Enter to open' : 'Quick Launch'}
                  </span>
                </div>

                {activeResults.length > 0 ? (
                  activeResults.map((tool, idx) => {
                    const isHighlighted = idx === selectedIndex;
                    return (
                      <Link
                        key={tool.id}
                        to={getToolCanonicalPath(tool.category, tool.slug)}
                        onClick={() => {
                          setNavQuery('');
                          setIsSearchOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl transition-all text-left group ${
                          isHighlighted
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-100 shadow-2xs'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 border border-transparent'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 transition-transform ${
                          isHighlighted 
                            ? 'bg-indigo-600 text-white shadow-xs scale-105' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700'
                        }`}>
                          <LucideIcon name={tool.icon} className="w-4 h-4" />
                        </div>

                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white truncate">
                              {tool.name}
                            </span>
                            {tool.id === 'BuildingFeasibilityChecker' && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300/50">
                                172+ Bye-Laws
                              </span>
                            )}
                          </div>
                          <div className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 font-medium">
                            {tool.shortDescription}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-200/60 dark:border-zinc-700/60">
                            {tool.category}
                          </span>
                          <ArrowRight className={`w-3.5 h-3.5 transition-transform ${
                            isHighlighted ? 'text-indigo-600 dark:text-indigo-400 translate-x-1' : 'text-zinc-400 opacity-0 group-hover:opacity-100'
                          }`} />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="py-12 px-4 text-center space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                      <Search className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      No tools found for "{navQuery}"
                    </p>
                    <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                      Try searching with alternate terms or press Enter to run a global search on the Tools Directory.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-400">
                <div className="hidden sm:flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-[10px]">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-[10px]">↓</kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-[10px]">↵</kbd>
                    <span>Open Tool</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-[10px]">ESC</kbd>
                    <span>Close</span>
                  </span>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 font-medium">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    274+ Client-Side Tools
                  </span>
                  <Link
                    to={`/tools?q=${encodeURIComponent(navQuery)}`}
                    onClick={() => {
                      setNavQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Directory View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
