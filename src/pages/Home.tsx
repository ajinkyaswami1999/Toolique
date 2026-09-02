import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Sparkles, LayoutGrid, IndianRupee, Code, Image as ImageIcon,
  Hammer, Compass, Palette, ArrowRight,
  Globe, FileText, Share2, Calendar, Scale, Lock, GraduationCap, Car, Briefcase, Heart, Type,
  Flame, Award, Printer, ShieldCheck, Layers
} from 'lucide-react';
import { toolsList } from '../data/tools';
import { categories } from '../data/categories';
import { workflows } from '../data/workflows';
import ToolCard from '../components/ToolCard';
import SEO from '../components/SEO';
import { Link, useNavigate } from 'react-router-dom';
import { getToolCanonicalPath } from '../routes/AppRoutes';

const categoryIcons: Record<string, React.ComponentType<any>> = {
  finance: IndianRupee,
  civil: Hammer,
  architecture: Compass,
  interior: Palette,
  pdf: FileText,
  image: ImageIcon,
  developer: Code,
  web: Globe,
  text: Type,
  social: Share2,
  datetime: Calendar,
  unit: Scale,
  security: Lock,
  student: GraduationCap,
  automobile: Car,
  business: Briefcase,
  health: Heart,
  '3d-printing': Printer,
  'math-studio': Scale,
  qa: ShieldCheck
};

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [featuredTab, setFeaturedTab] = useState<'trending' | 'dev' | 'finance' | 'civil'>('trending');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load search history
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem('toolique_recent_searches');
      if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
      else setRecentSearches(['gst calculator', 'sql formatter', 'sip planner', 'concrete mix']);
    } catch (e) {}
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const updated = [searchQuery.trim(), ...recentSearches.filter(s => s !== searchQuery.trim())].slice(0, 5);
      setRecentSearches(updated);
      try {
        localStorage.setItem('toolique_recent_searches', JSON.stringify(updated));
      } catch {}
      navigate(`/tools?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Filtered tools for Featured Section
  const trendingTools = useMemo(() => {
    return toolsList.filter(t => ['GSTCalculator', 'SIPCalculator', 'SQLFormatter', 'JSONFormatter', 'ApiTester', 'ConstructionCostCalculator', 'DerivativeCalculator', 'ImageCompressor'].includes(t.id));
  }, []);

  const devTools = useMemo(() => {
    return toolsList.filter(t => ['SQLFormatter', 'JSONFormatter', 'JSONCompare', 'JWTDecoder', 'SQLMinifier', 'TimestampConverter', 'CronGenerator', 'HashGenerator'].includes(t.id));
  }, []);

  const financeTools = useMemo(() => {
    return toolsList.filter(t => ['SIPCalculator', 'GSTCalculator', 'IncomeTaxCalculator', 'InHandSalaryCalculator', 'EMICalculator', 'PPFCalculator', 'FDCalculator', 'TDSCalculator'].includes(t.id));
  }, []);

  const civilTools = useMemo(() => {
    return toolsList.filter(t => ['ConstructionCostCalculator', 'ConcreteCalculator', 'PlotAreaCalculator', 'FARFSICalculator', 'CarpetAreaCalculator', 'CementCalculator', 'PlasterCalculator', 'PaintCalculator'].includes(t.id));
  }, []);

  const getActiveTabTools = () => {
    if (featuredTab === 'dev') return devTools;
    if (featuredTab === 'finance') return financeTools;
    if (featuredTab === 'civil') return civilTools;
    return trendingTools;
  };

  // Flagship Platform Hubs
  const platforms = [
    { 
      id: 'finance', 
      title: 'Personal Finance & Tax', 
      badge: '18 Tools',
      desc: 'Old vs. New Income tax slabs, in-hand salary from CTC, mutual fund SIPs, PPF, and loan EMIs.', 
      link: '/finance', 
      icon: IndianRupee, 
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
    },
    { 
      id: 'developer', 
      title: 'Developer Utilities Hub', 
      badge: '34 Tools',
      desc: 'SQL formatting, JSON diffing/validation, JWT debugging, Regex testers, and Unix timestamp converters.', 
      link: '/developer', 
      icon: Code, 
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' 
    },
    { 
      id: 'architecture', 
      title: 'Architecture & Civil Engineering', 
      badge: '60+ Tools',
      desc: 'Plot area, setbacks, RERA carpet, construction costs, concrete mixes, and BOQ material quantities.', 
      link: '/architecture', 
      icon: Compass, 
      color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' 
    },
    { 
      id: 'qa', 
      title: 'QA Engineering & Automation', 
      badge: '12 Tools',
      desc: 'Generate test cases, mock datasets, bug report templates, BVA bounds, and XPath selectors.', 
      link: '/qa', 
      icon: ShieldCheck, 
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' 
    },
    { 
      id: 'math-studio', 
      title: 'Symbolic Math Studio', 
      badge: 'Calculus Suite',
      desc: 'Derivative solver with step-by-step solutions, matrix algebra, and graphical evaluation.', 
      link: '/math-studio', 
      icon: Scale, 
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' 
    },
    { 
      id: '3d-printing', 
      title: '3D Maker Printing Studio', 
      badge: 'Maker Suite',
      desc: 'Calculate filament consumption, multi-color AMS slot budgeting, and electricity costs.', 
      link: '/3d-print-studio', 
      icon: Printer, 
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' 
    },
    { 
      id: 'academy', 
      title: 'Learning Academy', 
      badge: '15+ Tracks',
      desc: 'Master coding, SQL queries, Python, React, and QA automation interviews with daily challenges.', 
      link: '/academy', 
      icon: GraduationCap, 
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' 
    },
    { 
      id: 'ai', 
      title: 'AI Studio Assistants', 
      badge: 'Client Sandbox',
      desc: 'AI-assisted QA test cases, SQL generators, regex creators, and code analyzers without credentials.', 
      link: '/ai', 
      icon: Sparkles, 
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' 
    }
  ];

  // Curated Pipelines to highlight on Home
  const spotlightWorkflows = workflows.slice(0, 4);

  // SEO Structured Data
  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://www.toolique.in/#website',
        'url': 'https://www.toolique.in/',
        'name': 'Toolique',
        'description': 'Free online calculators, developer utilities, engineering studios, and interactive learning academy.',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://www.toolique.in/tools?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'Organization',
        '@id': 'https://www.toolique.in/#organization',
        'name': 'Toolique',
        'url': 'https://www.toolique.in/',
        'logo': 'https://www.toolique.in/favicon.ico'
      },
      {
        '@type': 'SoftwareApplication',
        'name': 'Toolique Online Productivity Ecosystem',
        'applicationCategory': 'UtilitiesApplication',
        'operatingSystem': 'All (Browser-Based)',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'INR'
        }
      }
    ]
  };

  return (
    <div className="space-y-12 pb-16 animate-fadeIn text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Toolique | Free Online Professional Tools, Calculators & Developer Hub" 
        description="270+ free browser tools, financial calculators, SQL/JSON developer sandboxes, QA automation utilities, symbolic math calculators, and 3D printing studios. 100% private with no sign-up required."
        schemaMarkup={homeSchema}
      />

      {/* SECTION 1: Single-Screen Compact Flagship Hero */}
      <section className="relative pt-2 sm:pt-4 text-center max-w-4xl mx-auto space-y-3.5">
        
        {/* Top Trust Pill */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 shadow-xs">
            <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
            <span>✦ 270+ TOOLS • 100% FREE • ZERO SIGN-UP REQUIRED • LOCAL SANDBOX</span>
          </span>
        </div>
        
        {/* Main Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-black tracking-tight text-zinc-900 dark:text-white leading-[1.18]">
          Free Calculators & <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Professional Online Tools</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-medium line-clamp-2">
          Calculate, format, test, and design in lightning speed. 100% browser-based tools with zero data tracking for finance, software development, civil engineering, QA, and creators.
        </p>

        {/* Global Search Bar */}
        <div className="max-w-2xl mx-auto pt-0.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 270+ tools (e.g. GST, SQL Formatter, SIP, JSON, Concrete, JWT...)"
              className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs transition"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center h-5 select-none px-1.5 font-mono text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded">
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Popular Search Chips (Single-line) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold pt-2 text-zinc-400">
            <span className="uppercase text-[9px] tracking-wider text-zinc-500">Popular:</span>
            {['GST Invoice', 'SQL Formatter', 'SIP Planner', 'JSON Validator', 'Concrete Mix', 'JWT Decoder', 'Derivative Steps'].map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchQuery(s);
                  navigate(`/tools?q=${encodeURIComponent(s)}`);
                }}
                className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10px] transition cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap justify-center gap-2.5 pt-1">
          <Link
            to="/tools"
            className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-extrabold text-xs shadow-md transition-all duration-200 active:scale-98 cursor-pointer flex items-center gap-1.5"
          >
            <span>Explore All 270+ Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/developer"
            className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 font-extrabold text-xs transition duration-200 active:scale-98 cursor-pointer flex items-center gap-1.5"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Developer Hub</span>
          </Link>
          <Link
            to="/finance"
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-extrabold text-xs transition duration-200 active:scale-98 cursor-pointer flex items-center gap-1.5"
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Finance Hub</span>
          </Link>
        </div>

        {/* Compact Stats Row */}
        <div className="pt-2 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="py-2 px-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="text-base sm:text-lg font-black text-zinc-900 dark:text-white tracking-tight">270+</div>
            <div className="text-[9px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Online Tools</div>
          </div>
          <div className="py-2 px-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="text-base sm:text-lg font-black text-zinc-900 dark:text-white tracking-tight">19</div>
            <div className="text-[9px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Specialized Suites</div>
          </div>
          <div className="py-2 px-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">100%</div>
            <div className="text-[9px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Private Sandbox</div>
          </div>
          <div className="py-2 px-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tight">0</div>
            <div className="text-[9px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Accounts Needed</div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Dedicated Flagship Suites */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Specialized Hubs</span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Explore Dedicated Product Suites
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Curated ecosystems with integrated calculators, code playgrounds, and step-by-step guides.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.id}
                to={p.link}
                className="saas-card p-5.5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className={`p-2.5 rounded-2xl border ${p.color} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-400">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-3">
                    {p.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-extrabold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Suite</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: Interactive Project Workflow Pipelines (High Value Feature) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider">Multi-Tool Workflows</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Interactive Project Pipelines
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Execute complex multi-stage projects without losing your place across individual tools.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="saas-button-primary inline-flex items-center gap-1.5 py-2 px-3.5 text-xs shrink-0"
          >
            <span>View All Workflows</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {spotlightWorkflows.map((wf) => {
            const firstStepTool = toolsList.find((t) => t.id === wf.steps[0]?.id);
            const launchPath = firstStepTool ? getToolCanonicalPath(firstStepTool.category, firstStepTool.slug) : '#';

            return (
              <div
                key={wf.id}
                className="saas-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                      {wf.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase shrink-0">
                      {wf.steps.length} Connected Steps
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    {wf.description}
                  </p>

                  {/* Step Timeline Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {wf.steps.map((step, idx) => (
                      <span
                        key={step.slug}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold"
                      >
                        <span className="w-3 h-3 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[8px] font-black">
                          {idx + 1}
                        </span>
                        <span>{step.title}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to={launchPath}
                  className="saas-button-primary inline-flex items-center justify-center gap-2 py-2 text-xs w-full"
                >
                  <span>Launch Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: Featured & Trending Tools Tabs */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-500">Popular Tools</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Featured Platform Tools
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              High-utility calculators and formatters utilized daily across India and worldwide.
            </p>
          </div>

          {/* Featured Filter Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
            <button
              onClick={() => setFeaturedTab('trending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                featuredTab === 'trending' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              🔥 Trending
            </button>
            <button
              onClick={() => setFeaturedTab('dev')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                featuredTab === 'dev' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              💻 Developer
            </button>
            <button
              onClick={() => setFeaturedTab('finance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                featuredTab === 'finance' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              💰 Finance
            </button>
            <button
              onClick={() => setFeaturedTab('civil')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                featuredTab === 'civil' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              🏗️ Civil
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {getActiveTabTools().map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* SECTION 6: Explore All Categories Strip */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-500">Categories</span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Explore by Category
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Jump directly to any of our 19 specialized tool libraries.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id] || LayoutGrid;
            return (
              <Link
                key={cat.id}
                to={`/tools?category=${cat.id}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer shadow-xs"
              >
                <div className="text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 7: Learning Academy & Daily Challenge */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20 w-fit">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Developer & QA Learning Academy
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Master software engineering and technical interview rounds with hands-on practice. Structured tracks in SQL queries, Python data structures, JavaScript closures, React state patterns, and Selenium/Playwright locators.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {['SQL Queries', 'Python Core', 'JavaScript DSA', 'React Hooks', 'QA Selenium', 'Docker DevOps'].map((track, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                {track}
              </span>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/academy"
              className="saas-button-primary inline-flex items-center gap-1.5 py-2.5 px-4 text-xs"
            >
              <span>Explore All Learning Tracks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Daily Challenge Interactive Card */}
        <div className="lg:col-span-6 saas-card p-6 rounded-3xl border border-teal-500/30 bg-teal-500/[0.02] space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-current animate-bounce" />
              <span>Today's Daily Coding Challenge</span>
            </span>
            <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              15 XP
            </span>
          </div>

          <div className="space-y-1.5 text-left">
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
              SQL Second Highest Salary
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Write an optimal SQL query to retrieve the second highest salary from an Employee table without subquery performance degradation.
            </p>
          </div>

          <Link
            to="/academy/sql/question/sql-second-highest-salary"
            className="w-full py-2.5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] transition shadow-md cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Solve Daily Challenge & Claim XP</span>
          </Link>
        </div>
      </section>

      {/* SECTION 8: Authority FAQ Section (AEO / Search Engines) */}
      <section className="saas-card p-8 md:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Frequently Asked Questions</span>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Why Professionals Choose Toolique
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
          <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm">
              🔒 Are my calculations and developer inputs kept private?
            </h4>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Yes, 100%. Toolique tools execute client-side inside your browser sandbox. Your JSON payloads, SQL scripts, API auth headers, and tax inputs are never sent or stored on remote servers.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm">
              ⚡ Do I need to create an account or pay a fee?
            </h4>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              No. All 270+ calculators, generators, and learning academy tracks are completely free with zero registration or paywalls.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm">
              📁 Can I export my calculation reports and notes?
            </h4>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Yes. Financial calculations, GST invoices, civil quantity BOQs, and scratchpad notes support instant download as PDF, JSON, or text files.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm">
              🧰 How do Interactive Project Workflows work?
            </h4>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Project workflows chain consecutive tools together (such as REST API Debugging $\to$ JSON Formatter $\to$ JSON Compare) so you can follow an end-to-end engineering pipeline smoothly.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 9: Ready to Explore CTA */}
      <section className="text-center p-10 md:p-14 rounded-3xl bg-gradient-to-br from-indigo-950 via-zinc-950 to-indigo-950 text-white border border-zinc-800 shadow-2xl space-y-5">
        <h2 className="text-2xl md:text-4xl font-black tracking-tight">
          Ready to supercharge your workflow?
        </h2>
        <p className="text-xs md:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed font-medium">
          Access 270+ fast, client-side tools designed for builders, engineers, and analysts. No subscriptions, zero limits.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            to="/tools"
            className="px-6 py-3 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 font-black text-xs shadow-lg transition active:scale-98 cursor-pointer"
          >
            Browse All Tools
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700/80 text-white font-black text-xs border border-zinc-700 transition active:scale-98 cursor-pointer"
          >
            Open My Workspace
          </Link>
        </div>
      </section>
    </div>
  );
}
