import { useState, useEffect, useRef } from 'react';
import {
  Search, Sparkles, LayoutGrid, IndianRupee, Code, Image as ImageIcon,
  Hammer, Compass, Palette, ArrowRight,
  Globe, FileText, Share2, Calendar, Scale, Lock, GraduationCap, Car, Briefcase, Heart, Type,
  Flame, Award, ExternalLink, Printer, Cpu, Code2, Terminal, Calculator, ShieldCheck
} from 'lucide-react';
import { toolsList } from '../data/tools';
import type { Tool } from '../data/tools';
import { categories } from '../data/categories';
import ToolCard from '../components/ToolCard';
import SEO from '../components/SEO';
import { Link, useNavigate } from 'react-router-dom';

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
  'math-studio': Scale
};

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [featuredTab, setFeaturedTab] = useState<'trending' | 'recent' | 'popular'>('trending');
  const [recentViews, setRecentViews] = useState<Tool[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load search history and recently viewed tools
  useEffect(() => {
    try {
      const savedSearches = localStorage.getItem('toolique_recent_searches');
      if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
      else setRecentSearches(['concrete calculator', 'json formatter', 'gst calculator']);

      const savedViews = localStorage.getItem('toolique_recent_history');
      if (savedViews) {
        const parsedViews = JSON.parse(savedViews);
        const matchingTools = parsedViews
          .map((h: any) => toolsList.find(t => t.name === h.name))
          .filter(Boolean) as Tool[];
        setRecentViews(matchingTools.slice(0, 4));
      }
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
      localStorage.setItem('toolique_recent_searches', JSON.stringify(updated));
      navigate(`/tools?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const trendingTools = toolsList.filter(t => ['GSTCalculator', 'ConstructionCostCalculator', 'ImageCompressor', 'SIPCalculator'].includes(t.id));
  const popularTools = toolsList.filter(t => ['EMICalculator', 'ConcreteCalculator', 'InHandSalaryCalculator', 'ModularKitchenCostCalculator'].includes(t.id));
  const recentTools = toolsList.filter(t => ['WardrobeCostCalculator', 'FalseCeilingCalculator', 'StaircaseCalculator', 'FARFSICalculator'].includes(t.id));

  const homePopularTools = [
    toolsList.find(t => t.id === 'GSTCalculator'),
    toolsList.find(t => t.id === 'SQLMinifier'),
    toolsList.find(t => t.id === 'EMICalculator'),
    toolsList.find(t => t.id === 'JSONFormatter')
  ].filter(Boolean) as Tool[];

  const getActiveTabTools = () => {
    if (featuredTab === 'recent') return recentTools;
    if (featuredTab === 'popular') return popularTools;
    return trendingTools;
  };

  const platforms = [
    { id: 'calculators', title: 'Calculators Hub', desc: 'Finance, compound interest, standard calculators, tax estimators.', link: '/calculators', icon: Calculator, color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' },
    { id: 'architecture', title: 'Architecture & Civil', desc: 'Plot area, setbacks, RERA carpet, construction costs, concrete mixes, and material quantities.', link: '/architecture', icon: Compass, color: 'text-violet-500 bg-violet-500/5 border-violet-500/10' },
    { id: 'developer', title: 'Developer Utilities', desc: 'SQL formatting, JSON validation, JWT decode, Base64 converters.', link: '/developer', icon: Code, color: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/10' },
    { id: 'qa', title: 'QA Engineering', desc: 'Generate test cases, mock datasets, bug templates, boundary value analysis.', link: '/qa', icon: ShieldCheck, color: 'text-rose-500 bg-rose-500/5 border-rose-500/10' },
    { id: 'ai', title: 'AI Studio', desc: 'AI-powered code generators, QA test automation, and regex builders.', link: '/ai', icon: Sparkles, color: 'text-purple-500 bg-purple-500/5 border-purple-500/10' },
    { id: 'academy', title: 'Learning Academy', desc: 'Master programming and QA interviews with structured tracks.', link: '/academy', icon: GraduationCap, color: 'text-teal-500 bg-teal-500/5 border-teal-500/10' }
  ];

  return (
    <div className="space-y-12 pb-16 animate-fadeIn text-left">
      <SEO 
        title="Toolique | Free Online Professional Tools & Calculators" 
        description="Toolique is a modern browser-based productivity ecosystem offering free developer tools, financial calculators, interactive code playgrounds, PDF files converters, and 3D printing modules."
      />

      {/* SECTION 1: Premium Hero */}
      <section className="relative pt-8 md:pt-12 text-center max-w-4xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 animate-fadeIn">
          <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
          <span>✦ 255+ TOOLS • FREE • NO SIGN-UP REQUIRED</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
          Free Calculators &<br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Professional Online Tools
          </span>
        </h1>
        
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-semibold">
          Calculate, convert, test and build with fast browser-based tools for finance, architecture, civil engineering, developers and QA professionals.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            to="/tools"
            className="px-6 py-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-black text-sm shadow-lg hover:shadow-indigo-550/10 transition-all duration-200 active:scale-98 cursor-pointer"
          >
            Explore 255+ Tools →
          </Link>
          <Link
            to="/academy"
            className="px-6 py-3.5 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/10 dark:border-indigo-500/20 font-black text-sm transition duration-200 active:scale-98 cursor-pointer"
          >
            Start Learning
          </Link>
        </div>

        {/* Stats Row */}
        <div className="pt-6 max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-100/10 dark:bg-zinc-900/10 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-300">
            <div className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">255+</div>
            <div className="text-[9px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mt-0.5">Browser Tools</div>
          </div>
          <div className="p-3 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-100/10 dark:bg-zinc-900/10 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-300">
            <div className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">10+</div>
            <div className="text-[9px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mt-0.5">Categories</div>
          </div>
          <div className="p-3 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-100/10 dark:bg-zinc-900/10 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-300">
            <div className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">100%</div>
            <div className="text-[9px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mt-0.5">Client-Side</div>
          </div>
          <div className="p-3 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-100/10 dark:bg-zinc-900/10 hover:border-zinc-300 dark:hover:border-zinc-700 transition duration-300">
            <div className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">No</div>
            <div className="text-[9px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mt-0.5">Sign-Up Required</div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Global Search */}
      <section className="max-w-2xl mx-auto space-y-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-450 dark:text-zinc-500 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entire platform (Tools, Academy, Playgrounds, AI...)"
            className="saas-input !pl-12 pr-16 py-3.5 text-xs font-semibold shadow-sm focus:ring-indigo-500/10 focus:border-indigo-500 rounded-2xl"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center h-5 select-none px-1.5 font-mono text-[9px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-800/80 rounded">
              ⌘K
            </kbd>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-zinc-400 font-bold pl-2">
          {recentSearches.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-zinc-500 uppercase tracking-wider">Recent:</span>
              {recentSearches.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(s);
                    navigate(`/tools?q=${encodeURIComponent(s)}`);
                  }}
                  className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 hover:text-indigo-650 transition cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-zinc-500 uppercase tracking-wider">Popular:</span>
            {['concrete', 'sql formatter', 'gst invoice', 'sip'].map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(s);
                  navigate(`/tools?q=${encodeURIComponent(s)}`);
                }}
                className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 hover:text-indigo-650 transition cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Popular Tools (High Priority Access) */}
      <section className="space-y-6 pt-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Fast Access</span>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Popular Tools</h2>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-1">Quick access to tools people use most.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {homePopularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* SECTION 4: Platform Overview */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Ecosystem Products</span>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Everything inside Toolique</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.id}
                to={p.link}
                className="saas-card p-6 flex items-start gap-4 hover:border-zinc-350 dark:hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className={`p-3 rounded-2xl border ${p.color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-grow min-w-0">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                    {p.title}
                  </h3>
                  <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold leading-relaxed line-clamp-2">{p.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white pt-2 transition-colors duration-200">
                    Explore <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: Explore by Category */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-500">Categories</span>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Explore by Category</h2>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id] || LayoutGrid;
            return (
              <Link
                key={cat.id}
                to={`/tools?category=${cat.id}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-900 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
              >
                <div className="text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 6: Recently Used */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">Personalized</span>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Recently Used</h2>
        </div>

        {recentViews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentViews.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="saas-card p-6 border border-zinc-200/50 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-550 dark:text-zinc-400 font-semibold">
              You haven't opened any tools recently. Explore our popular tools to get started!
            </p>
            <Link
              to="/tools"
              className="px-4 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 font-black text-[10px] uppercase tracking-wider shadow-sm transition active:scale-98 shrink-0 hover:opacity-90 cursor-pointer"
            >
              Explore Popular Tools →
            </Link>
          </div>
        )}
      </section>

      {/* SECTION 7: Featured Tools */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-500">Top Utilities</span>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Featured Platform Tools</h2>
          </div>

          {/* Featured Tabs */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-150 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800">
            <button
              onClick={() => setFeaturedTab('trending')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                featuredTab === 'trending' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setFeaturedTab('recent')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                featuredTab === 'recent' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'
              }`}
            >
              New Added
            </button>
            <button
              onClick={() => setFeaturedTab('popular')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                featuredTab === 'popular' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'
              }`}
            >
              Most Used
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {getActiveTabTools().map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* SECTION 8: AI Studio Preview */}
      <section className="p-8 md:p-12 rounded-3xl border border-zinc-200/80 dark:border-zinc-850/80 bg-zinc-50/50 dark:bg-zinc-900/10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5 space-y-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/10 w-fit">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">AI Studio Assistants</h2>
          <p className="text-xs text-zinc-505 dark:text-zinc-400 leading-relaxed font-medium">
            Boost development outputs using browser-sandboxed artificial intelligence helpers. Create manual QA checks, format regex codes, and optimize select SQL blocks without credentials.
          </p>
          <Link
            to="/ai"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs shadow-md cursor-pointer"
          >
            <span>View AI Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'AI Test Case Generator', desc: 'Create manual QA suites and click locators.' },
            { name: 'AI SQL Query Generator', desc: 'Convert english questions into SQL commands.' },
            { name: 'AI Regex Designer', desc: 'Compose parsing expressions with matching tests.' },
            { name: 'AI Bug Report Generator', desc: 'Generate descriptions and severity tags.' }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 flex items-start gap-3">
              <Cpu className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-black text-zinc-900 dark:text-white">{item.name}</h4>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-1 leading-normal font-semibold">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 9: Academy Preview */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-6 space-y-5">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/10 w-fit">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Academy Learning Tracks</h2>
          <p className="text-xs text-zinc-505 dark:text-zinc-400 leading-relaxed font-medium">
            Master programming and QA interviews offline. Build confidence in SQL queries, Python scripts, JavaScript challenges, React hooks, and Playwright locators.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {['SQL Database', 'Python Developer', 'QA Automation', 'React UI', 'Playwright QA'].map((track, i) => (
              <span key={i} className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {track}
              </span>
            ))}
          </div>
        </div>

        {/* Challenge Widget */}
        <div className="md:col-span-6 saas-card p-6 border-teal-500/20 bg-teal-500/[0.01] space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-current animate-bounce" />
              <span>Today's Interview Challenge</span>
            </span>
            <span className="text-[9px] text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded">Medium 15 XP</span>
          </div>

          <div className="space-y-2 text-left">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">SQL Second Highest Salary</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Write a query to retrieve the second highest salary from the Employee table. Return null if no such record exists.
            </p>
          </div>

          <Link
            to="/academy"
            className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] transition cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Solve Daily Challenge</span>
          </Link>
        </div>
      </section>

      {/* SECTION 10: Developer Playground */}
      <section className="p-8 md:p-12 rounded-3xl border border-zinc-200/80 dark:border-zinc-850/80 bg-zinc-50/50 dark:bg-zinc-900/10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'SQL Query Playground', desc: 'Interact with SQLite database modules client-side.' },
            { name: 'JSON Formatter Studio', desc: 'Format, validate, parse, and compare JSON nodes.' },
            { name: 'Regex Sandbox Tester', desc: 'Inspect matching regular expressions instantly.' },
            { name: 'REST HTTP API Agent', desc: 'Trigger mock client-side endpoints and responses.' }
          ].map((playground, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 flex items-start gap-3">
              <Terminal className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-black text-zinc-900 dark:text-white">{playground.name}</h4>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-1 leading-normal font-semibold">{playground.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-5 space-y-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/10 w-fit">
            <Code2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Developer Sandbox Hub</h2>
          <p className="text-xs text-zinc-505 dark:text-zinc-400 leading-relaxed font-medium">
            Test and compile scripts without compiling installations locally. Run JavaScript console triggers or inspect JSON hierarchies directly in a robust editor environment.
          </p>
          <Link
            to="/playground"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs shadow-md cursor-pointer"
          >
            <span>Explore Playground</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* SECTION 11: 3D Printing Studio */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-6 space-y-5">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/10 w-fit">
            <Printer className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">3D Maker Printing Studio</h2>
          <p className="text-xs text-zinc-505 dark:text-zinc-400 leading-relaxed font-medium">
            Design and optimize 3D printing settings and cost models. Evaluate Bambu Lab AMS templates, electricity cost factors, and resin densities easily.
          </p>
          <div className="flex gap-3">
            <Link
              to="/3d-printing"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <span>3D Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <a
              href="https://voxelique.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-350 font-extrabold text-xs flex items-center gap-1.5 transition"
            >
              <span>Visit Voxelique</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'Print Cost Calculator', desc: 'Estimate filament pricing and electricity ratios.' },
            { name: 'AMS Slot Planner', desc: 'Plan color templates for AMS multi-spool configs.' },
            { name: 'Print Time Estimator', desc: 'Model volumetric flows and speed limits.' },
            { name: 'Resin Volume Utility', desc: 'Calculate resin tank volumes for SLA prints.' }
          ].map((card, i) => (
            <div key={i} className="saas-card p-5 border border-zinc-205 dark:border-zinc-850 flex flex-col justify-between h-32">
              <h4 className="text-xs font-black text-zinc-900 dark:text-white">{card.name}</h4>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-normal font-semibold mt-1">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 12: Latest Articles */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Guides</span>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Knowledge Resources</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'SQL JOINs Explained Visually', desc: 'Venn diagrams mapping inner, left, and outer JOIN database queries.', link: '/blog' },
            { title: 'Modern JSON Formatter Utilities', desc: 'How lightweight JSON payloads outperform complex XML structures.', link: '/blog' },
            { title: 'Indian GST Invoice Formats', desc: 'Demystifying CGST, SGST, and reverse taxation structures.', link: '/blog' },
            { title: '3D Printer Cost Calculations', desc: 'How to calculate filament weights and electricity bills.', link: '/blog' },
            { title: 'Cable Sizes and Voltage Drop', desc: 'Guide to estimating load demands and cable thickness.', link: '/blog' },
            { title: 'Wordpress and SEO optimization', desc: 'Maximize rich schemas and long-tail crawl rates.', link: '/blog' }
          ].map((art, idx) => (
            <div key={idx} className="saas-card p-5 flex flex-col justify-between h-40 border border-zinc-200/60 dark:border-zinc-850/60 hover:border-indigo-500/30 transition">
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-850 text-[9px] font-black text-zinc-500 uppercase tracking-wider">Tutorial</span>
                <h4 className="text-xs font-black text-zinc-900 dark:text-white leading-snug">{art.title}</h4>
                <p className="text-[10px] text-zinc-455 dark:text-zinc-550 leading-normal font-semibold">{art.desc}</p>
              </div>
              <Link to={art.link} className="text-[10px] font-extrabold text-indigo-650 dark:text-indigo-400 inline-flex items-center gap-1 hover:gap-1.5 transition-all">
                Read Guide <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 13: About Founder */}
      <section className="p-8 md:p-12 rounded-3xl border border-zinc-200/80 dark:border-zinc-850/80 bg-zinc-50/30 dark:bg-zinc-900/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-black text-lg">
            AS
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 dark:text-white">Ajinkya Swami</h3>
            <p className="text-[11px] text-zinc-450 dark:text-zinc-500 font-semibold">Founder of Toolique & Voxelique</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/ajinkyaswami1999"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 text-[10px] font-black text-zinc-655 dark:text-zinc-400 hover:text-indigo-600 transition"
          >
            GitHub Profile
          </a>
          <a
            href="https://www.linkedin.com/in/ajinkya-swami-82751b191/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 text-[10px] font-black text-zinc-655 dark:text-zinc-400 hover:text-indigo-600 transition"
          >
            LinkedIn Connect
          </a>
          <Link
            to="/about-founder"
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black hover:scale-105 transition cursor-pointer"
          >
            Founder Biography
          </Link>
        </div>
      </section>

      {/* SECTION 14: CTA */}
      <section className="text-center p-12 rounded-3xl bg-gradient-to-br from-indigo-955 via-zinc-955 to-indigo-955 text-white border border-zinc-850 shadow-xl space-y-5">
        <h2 className="text-2xl md:text-3xl font-black">Ready to Explore?</h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed font-semibold">
          Unlock 255+ free online developers and engineering calculation tools. No signup, no storage limits, completely secure inside your local browser.
        </p>
        <Link
          to="/tools"
          className="inline-block px-6 py-3 rounded-2xl bg-white text-zinc-900 font-extrabold text-xs shadow-md hover:scale-105 transition cursor-pointer"
        >
          Browse All Tools
        </Link>
      </section>
    </div>
  );
}
