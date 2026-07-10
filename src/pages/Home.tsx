import { useState, useEffect } from 'react';
import {
  Search, Sparkles, LayoutGrid, IndianRupee, Code, Image as ImageIcon,
  Hammer, Compass, Palette, ArrowRight,
  Globe, FileText, Share2, Calendar, Scale, Lock, GraduationCap, Car, Briefcase, Heart, Type,
  Flame, Award, BookOpen, ExternalLink, Printer, Cpu, Code2, Terminal, Calculator
} from 'lucide-react';
import { toolsList } from '../data/tools';
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolique_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
      else setRecentSearches(['concrete calculator', 'json formatter', 'gst calculator']);
    } catch (e) {}
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Add to recent searches
      const updated = [searchQuery.trim(), ...recentSearches.filter(s => s !== searchQuery.trim())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('toolique_recent_searches', JSON.stringify(updated));
      navigate(`/tools?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Get trending, popular, and recent tools from toolsList
  // We can filter them by specific lists or metrics
  const trendingTools = toolsList.filter(t => ['GSTCalculator', 'ConstructionCostCalculator', 'ImageCompressor', 'SIPCalculator'].includes(t.id));
  const popularTools = toolsList.filter(t => ['EMICalculator', 'ConcreteCalculator', 'InHandSalaryCalculator', 'ModularKitchenCostCalculator'].includes(t.id));
  const recentTools = toolsList.filter(t => ['WardrobeCostCalculator', 'FalseCeilingCalculator', 'StaircaseCalculator', 'FARFSICalculator'].includes(t.id));

  const getActiveTabTools = () => {
    if (featuredTab === 'recent') return recentTools;
    if (featuredTab === 'popular') return popularTools;
    return trendingTools;
  };

  const platforms = [
    { id: 'tools', title: 'Tools', desc: '300+ Browser Utilities', link: '/tools', icon: LayoutGrid, color: 'text-indigo-500 bg-indigo-500/5 border-indigo-500/10' },
    { id: 'ai', title: 'AI Studio', desc: 'AI-powered productivity', link: '/ai', icon: Sparkles, color: 'text-purple-500 bg-purple-500/5 border-purple-500/10' },
    { id: 'academy', title: 'Academy', desc: 'Learn SQL, QA & Python', link: '/academy', icon: GraduationCap, color: 'text-teal-500 bg-teal-500/5 border-teal-500/10' },
    { id: 'playground', title: 'Developer Playground', desc: 'Interactive coding environments', link: '/playground', icon: Code2, color: 'text-blue-500 bg-blue-500/5 border-blue-500/10' },
    { id: '3d-printing', title: '3D Printing Studio', desc: 'Professional maker tools', link: '/3d-printing', icon: Printer, color: 'text-orange-500 bg-orange-500/5 border-orange-500/10' },
    { id: 'math-studio', title: 'Advanced Math Studio', desc: 'Equation solvers & geometry tools', link: '/math-studio', icon: Calculator, color: 'text-rose-500 bg-rose-500/5 border-rose-500/10' },
    { id: 'resources', title: 'Resources', desc: 'Blogs, Guides & Tutorials', link: '/blog', icon: BookOpen, color: 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10' }
  ];

  return (
    <div className="space-y-20 pb-16 animate-fadeIn text-left">
      <SEO 
        title="Toolique | Free Online Professional Tools & Calculators" 
        description="Toolique is a modern browser-based productivity ecosystem offering free developer tools, financial calculators, interactive code playgrounds, PDF files converters, and 3D printing modules."
      />

      {/* SECTION 1: Premium Hero */}
      <section className="relative pt-12 md:pt-20 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>No Servers • No Tracking • 100% Client-Side</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
          Everything You Need to <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Build, Calculate, Learn & Create
          </span>
        </h1>
        
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto font-medium">
          Toolique is a modern browser-based productivity platform offering free online tools, AI utilities, interactive playgrounds, learning resources, engineering calculators, and 3D printing solutions.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <Link
            to="/tools"
            className="px-6 py-3 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-sm shadow-md hover:scale-105 transition duration-300"
          >
            Explore Tools
          </Link>
          <Link
            to="/academy"
            className="px-6 py-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 font-extrabold text-sm transition duration-300"
          >
            Start Learning
          </Link>
          <Link
            to="/ai"
            className="px-6 py-3 rounded-2xl bg-purple-500/5 hover:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/10 font-extrabold text-sm transition duration-300"
          >
            AI Studio
          </Link>
          <Link
            to="/playground"
            className="px-6 py-3 rounded-2xl bg-blue-500/5 hover:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/10 font-extrabold text-sm transition duration-300"
          >
            Playground
          </Link>
        </div>
      </section>

      {/* SECTION 2: Global Search */}
      <section className="max-w-2xl mx-auto space-y-4 pt-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-450 dark:text-zinc-500 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entire platform (Tools, Academy, Playgrounds, AI...)"
            className="saas-input pl-12 pr-4 py-3 text-xs font-semibold shadow-sm focus:ring-indigo-500/10 focus:border-indigo-500"
          />
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

      {/* SECTION 3: Platform Overview */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Ecosystem Products</span>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Complete Productivity Suite</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.id}
                to={p.link}
                className="saas-card p-6 flex items-start gap-4 hover:border-zinc-350 dark:hover:border-zinc-700 hover:-translate-y-1 transition duration-300 group"
              >
                <div className={`p-3 rounded-2xl border ${p.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-grow">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {p.title}
                  </h3>
                  <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold">{p.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white pt-2 transition">
                    Explore <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: Popular Categories */}
      <section className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-500">Categories</span>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Popular Sub-sections</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => {
            const Icon = categoryIcons[cat.id] || LayoutGrid;
            return (
              <Link
                key={cat.id}
                to={`/tools/${cat.id}`}
                className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-900/80 hover:scale-[1.02] transition duration-300 flex flex-col items-center text-center gap-3 group"
              >
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-655 transition">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {cat.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: Featured Tools */}
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

      {/* SECTION 6: AI Studio Preview */}
      <section className="p-8 md:p-12 rounded-3xl border border-zinc-200/80 dark:border-zinc-850/80 bg-zinc-50/50 dark:bg-zinc-900/10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5 space-y-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/10 w-fit">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">AI Studio Assistants</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Boost development outputs using browser-sandboxed artificial intelligence helpers. Create manual QA checks, format regex codes, and optimize select SQL blocks without credentials.
          </p>
          <Link
            to="/ai"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs shadow-md"
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

      {/* SECTION 7: Academy Preview */}
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
            className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] transition"
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Solve Daily Challenge</span>
          </Link>
        </div>
      </section>

      {/* SECTION 8: Developer Playground */}
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs shadow-md"
          >
            <span>Explore Playground</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* SECTION 9: 3D Printing Studio */}
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
              className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs flex items-center gap-1.5 shadow-md"
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

      {/* SECTION 10: Latest Articles */}
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
                <p className="text-[10px] text-zinc-455 dark:text-zinc-500 leading-normal font-semibold">{art.desc}</p>
              </div>
              <Link to={art.link} className="text-[10px] font-extrabold text-indigo-650 dark:text-indigo-400 inline-flex items-center gap-1 hover:gap-1.5 transition-all">
                Read Guide <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 11: About Founder */}
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
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 text-[10px] font-black text-zinc-650 dark:text-zinc-400 hover:text-indigo-600 transition"
          >
            GitHub Profile
          </a>
          <a
            href="https://www.linkedin.com/in/ajinkya-swami-82751b191/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 text-[10px] font-black text-zinc-650 dark:text-zinc-400 hover:text-indigo-600 transition"
          >
            LinkedIn Connect
          </a>
          <Link
            to="/about-founder"
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black hover:scale-105 transition"
          >
            Founder Biography
          </Link>
        </div>
      </section>

      {/* SECTION 12: CTA */}
      <section className="text-center p-12 rounded-3xl bg-gradient-to-br from-indigo-950 via-zinc-950 to-indigo-950 text-white border border-zinc-850 shadow-xl space-y-5">
        <h2 className="text-2xl md:text-3xl font-black">Ready to Explore?</h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed font-semibold">
          Unlock 300+ free online developers and engineering calculation tools. No signup, no storage limits, completely secure inside your local browser.
        </p>
        <Link
          to="/tools"
          className="inline-block px-6 py-3 rounded-2xl bg-white text-zinc-900 font-extrabold text-xs shadow-md hover:scale-105 transition"
        >
          Browse All Tools
        </Link>
      </section>
    </div>
  );
}
