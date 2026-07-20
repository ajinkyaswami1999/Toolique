import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { toolsList } from '../data/tools';
import { 
  FileQuestion, 
  Search, 
  Home, 
  ArrowRight, 
  Calculator, 
  Box, 
  GraduationCap, 
  Sparkles, 
  Compass, 
  Wrench,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Filter tools based on user search query
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return toolsList.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.shortDescription.toLowerCase().includes(query) ||
        tool.keywords?.some((k) => k.toLowerCase().includes(query))
    ).slice(0, 6);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (filteredTools.length > 0) {
        navigate(`/tool/${filteredTools[0].slug}`);
      } else {
        navigate(`/tools?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const quickStudios = [
    {
      title: '3D Print Studio',
      description: 'Filament, resin, cost, & print pricing calculators',
      icon: Box,
      href: '/3d-print-studio',
      badge: 'Popular',
      color: 'from-amber-500/10 via-orange-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20'
    },
    {
      title: 'Math Studio',
      description: '22 symbolic equation, matrix & calculus solvers',
      icon: Calculator,
      href: '/math-studio',
      badge: '22 Tools',
      color: 'from-blue-500/10 via-indigo-500/10 to-blue-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
    },
    {
      title: 'Toolique Academy',
      description: 'SQL, Python, JS & QA interview prep challenges',
      icon: GraduationCap,
      href: '/academy',
      badge: 'Practice',
      color: 'from-emerald-500/10 via-teal-500/10 to-emerald-500/5 text-teal-600 dark:text-teal-400 border-teal-500/20'
    },
    {
      title: 'AI Studio & Playground',
      description: 'Client-sandboxed AI SQL & test generators',
      icon: Sparkles,
      href: '/ai',
      badge: 'AI Powered',
      color: 'from-purple-500/10 via-pink-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20'
    }
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 px-4">
      <SEO
        title="404 - Page Not Found | Toolique"
        description="The requested page could not be found on Toolique. Browse our directory of 100+ free online calculators, developer utilities, and 3D printing tools."
      />

      <div className="w-full max-w-3xl mx-auto space-y-8 text-center">
        
        {/* Animated 404 Hero Header */}
        <div className="relative inline-block">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-teal-500/20 via-indigo-500/20 to-purple-500/20 blur-2xl opacity-75 dark:opacity-50 animate-pulse" />
          
          <div className="relative flex items-center justify-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 px-6 py-2.5 rounded-full shadow-lg">
            <FileQuestion className="w-5 h-5 text-teal-600 dark:text-teal-400 animate-bounce" />
            <span className="text-xs md:text-sm font-bold tracking-wider uppercase text-slate-600 dark:text-slate-300">
              Error 404 • Page Not Found
            </span>
          </div>
        </div>

        {/* Hero Title & Subtext */}
        <div className="space-y-3">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 dark:text-white">
            <span className="bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              404
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            Oops! Lost in the digital void.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            The page you're looking for might have been moved, renamed, or doesn't exist. Search our 100+ free tools below or return to the main dashboard.
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="w-full max-w-xl mx-auto relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 100+ tools (e.g. GST, Filament, Matrix, Base64)..."
              className="w-full pl-12 pr-24 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-800 dark:text-slate-100 text-sm placeholder:text-slate-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-20 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1"
            >
              Search
            </button>
          </form>

          {/* Search Live Autocomplete Dropdown */}
          {searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden text-left divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={`/tool/${tool.slug}`}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 flex items-center gap-2">
                        <span>{tool.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {tool.shortDescription}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transform group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No direct tools match "{searchQuery}". Click search to see full directory results.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Navigation Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            to="/tools"
            className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <Wrench className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Browse All 100+ Tools</span>
          </Link>
        </div>

        {/* Popular Tool Studios Grid */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Popular Destinations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {quickStudios.map((studio) => {
              const Icon = studio.icon;
              return (
                <Link
                  key={studio.title}
                  to={studio.href}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/50 dark:hover:border-teal-500/50 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${studio.color} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {studio.title}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {studio.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {studio.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end text-xs font-bold text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
