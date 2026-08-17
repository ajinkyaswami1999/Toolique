import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search, Heart, Share2, Copy, Bookmark,
  Clock, ChevronRight, Check, ListFilter, LayoutGrid, HelpCircle, ArrowUpRight, X,
  IndianRupee, Hammer, Compass, Palette, FileText, Image as ImageIcon, Code, Globe, Type, Calendar, Scale, Lock, GraduationCap, Car, Briefcase, Heart as HeartIcon, Printer
} from 'lucide-react';
import { toolsList } from '../data/tools';
import type { Tool } from '../data/tools';
import { categories } from '../data/categories';
import SEO from '../components/SEO';
import LucideIcon from '../components/LucideIcon';

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
  health: HeartIcon,
  '3d-printing': Printer,
  'math-studio': Scale
};

const getToolBadge = (toolId: string) => {
  if (['GSTCalculator', 'ConcreteCalculator', 'InHandSalaryCalculator', 'SIPCalculator', 'EMICalculator'].includes(toolId)) {
    return { text: 'Popular', className: 'bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' };
  }
  if (['FARFSICalculator', 'ModularKitchenCostCalculator', 'ImageCompressor'].includes(toolId)) {
    return { text: 'Trending', className: 'bg-amber-500/10 dark:bg-amber-500/5 text-amber-700 dark:text-amber-400 border-amber-500/20' };
  }
  if (['WardrobeCostCalculator', 'FalseCeilingCalculator', 'StaircaseCalculator'].includes(toolId)) {
    return { text: 'New', className: 'bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 border-indigo-500/20' };
  }
  return null;
};

export default function ToolsDirectory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const activeCategory = searchParams.get('category') || 'all';
  const activeCollection = searchParams.get('collection') || 'all';

  const [sortBy, setSortBy] = useState<string>('popularity');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentViews, setRecentViews] = useState<Tool[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedId, setBookmarkedId] = useState<string | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load favorites & views on mount
  useEffect(() => {
    try {
      const favs = localStorage.getItem('toolique_favorites');
      if (favs) setFavorites(JSON.parse(favs));

      const hist = localStorage.getItem('toolique_recent_history');
      if (hist) {
        const parsedHist = JSON.parse(hist);
        const matchingTools = parsedHist
          .map((h: any) => toolsList.find(t => t.name === h.name))
          .filter(Boolean) as Tool[];
        setRecentViews(matchingTools.slice(0, 8));
      }
    } catch (e) { }
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

  // Click outside to close autocomplete suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFavorite = (toolId: string) => {
    let updated = [...favorites];
    if (updated.includes(toolId)) {
      updated = updated.filter(id => id !== toolId);
    } else {
      updated.push(toolId);
    }
    setFavorites(updated);
    localStorage.setItem('toolique_favorites', JSON.stringify(updated));
  };

  const handleCopyLink = (slug: string) => {
    const link = `https://www.toolique.in/tool/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBookmark = (tool: Tool) => {
    try {
      const saved = localStorage.getItem('toolique_bookmarks') || '[]';
      const bookmarks = JSON.parse(saved);
      const exists = bookmarks.some((b: any) => b.id === tool.id);
      if (!exists) {
        const updated = [...bookmarks, { id: tool.id, name: tool.name, type: 'tool', slug: tool.slug }];
        localStorage.setItem('toolique_bookmarks', JSON.stringify(updated));
      }
      setBookmarkedId(tool.id);
      setTimeout(() => setBookmarkedId(null), 1500);
    } catch (e) { }
  };

  const handleSearchChange = (val: string) => {
    setSearchParams((prev) => {
      if (val) prev.set('q', val);
      else prev.delete('q');
      return prev;
    }, { replace: true });
    setShowSuggestions(true);
  };

  const selectCategory = (catId: string) => {
    setSearchParams((prev) => {
      if (catId === 'all') prev.delete('category');
      else {
        prev.set('category', catId);
        prev.delete('collection');
      }
      return prev;
    }, { replace: true });
  };

  const selectCollection = (colId: string) => {
    setSearchParams((prev) => {
      if (colId === 'all') prev.delete('collection');
      else {
        prev.set('collection', colId);
        prev.delete('category');
      }
      return prev;
    }, { replace: true });
  };

  const addToHistory = (tool: Tool) => {
    try {
      const hist = localStorage.getItem('toolique_recent_history') || '[]';
      const parsedHist = JSON.parse(hist);

      const filteredHist = parsedHist.filter((h: any) => h.name !== tool.name);
      const newItem = {
        name: tool.name,
        type: 'Tool Used',
        timestamp: 'Just now',
        link: tool.slug === 'advanced-boq-calculator-india' ? '/tools/advanced-boq-calculator-india' : `/tool/${tool.slug}`
      };

      const updated = [newItem, ...filteredHist].slice(0, 8);
      localStorage.setItem('toolique_recent_history', JSON.stringify(updated));
      setRecentViews(updated.map((h: any) => toolsList.find(t => t.name === h.name)).filter(Boolean) as Tool[]);
    } catch (e) { }
  };

  const handlePopularSuggestionClick = (query: string) => {
    setSearchParams((prev) => {
      prev.set('q', query);
      prev.delete('category');
      prev.delete('collection');
      return prev;
    }, { replace: true });
    setShowSuggestions(false);
  };

  // Filter tools
  let filtered = toolsList.filter((tool) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        (tool.keywords || []).some(k => k.toLowerCase().includes(q)) ||
        tool.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (activeCategory !== 'all') {
      if (tool.category !== activeCategory) return false;
    }

    if (activeCollection !== 'all') {
      if (activeCollection === 'popular') {
        return ['GSTCalculator', 'ConcreteCalculator', 'InHandSalaryCalculator', 'SIPCalculator', 'EMICalculator'].includes(tool.id);
      }
      if (activeCollection === 'trending') {
        return ['FARFSICalculator', 'ModularKitchenCostCalculator', 'ImageCompressor'].includes(tool.id);
      }
      if (activeCollection === 'new') {
        return ['WardrobeCostCalculator', 'FalseCeilingCalculator', 'StaircaseCalculator'].includes(tool.id);
      }
      if (activeCollection === 'dev-picks') {
        return ['SQLMinifier', 'JSONFormatter', 'RegexTester', 'JWTDecoder'].map(id => id.toLowerCase()).includes(tool.id.toLowerCase()) || tool.category === 'developer';
      }
      if (activeCollection === 'engineering-picks') {
        return tool.category === 'civil' || tool.category === 'electrical' || tool.category === 'math-studio';
      }
      if (activeCollection === 'favorites') {
        return favorites.includes(tool.id);
      }
    }

    return true;
  });

  // Sort tools
  filtered.sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'newest') {
      return b.id.localeCompare(a.id);
    }
    if (sortBy === 'favorites') {
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      return bFav - aFav;
    }
    const aIndex = toolsList.findIndex(t => t.id === a.id);
    const bIndex = toolsList.findIndex(t => t.id === b.id);
    return aIndex - bIndex;
  });

  const collectionsList = [
    { id: 'all', name: 'All Tools' },
    { id: 'popular', name: 'Popular Utilities' },
    { id: 'trending', name: 'Trending' },
    { id: 'new', name: 'Newly Added' },
    { id: 'dev-picks', name: 'Developer Picks' },
    { id: 'engineering-picks', name: 'Engineering Picks' },
    { id: 'favorites', name: 'My Favorites' }
  ];

  const popularSuggestions = [
    { name: 'GST Calculator', query: 'GST Calculator' },
    { name: 'SQL Formatter', query: 'SQL' },
    { name: 'JSON Formatter', query: 'JSON' },
    { name: 'EMI Calculator', query: 'EMI' }
  ];

  // Top 5 autocomplete matches
  const autocompleteSuggestions = searchQuery.trim()
    ? toolsList
      .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5)
    : [];

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 8);

  return (
    <div className="space-y-8 pb-12 text-left animate-fadeIn">
      <SEO
        title="Tools Directory | Complete Utilities Catalog | Toolique"
        description="Browse hundreds of free browser-based online tools. Search, filter, and run developer extensions, financial calculators, engineering apps, and PDF scripts locally."
      />

      {/* Directory Hero */}
      <div className="space-y-2.5">
        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
          All Tools
        </h1>
        <p className="text-sm text-zinc-550 dark:text-zinc-400 max-w-2xl font-semibold leading-relaxed">
          255+ tools for developers, engineers, designers, finance, productivity, and everyday tasks.
        </p>
      </div>

      {/* Search and Curation Panel */}
      <div className="space-y-4">
        {/* Sticky Search bar wrapper */}
        <div ref={searchContainerRef} className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search 255+ tools..."
            className="saas-input !pl-12 pr-16 py-3.5 text-sm font-semibold focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm rounded-2xl"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchParams((prev) => {
                    prev.delete('q');
                    return prev;
                  }, { replace: true });
                  searchInputRef.current?.focus();
                }}
                className="pointer-events-auto p-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center h-5 select-none px-1.5 font-mono text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-550 border border-zinc-200/50 dark:border-zinc-800/80 rounded-md">
              ⌘K
            </kbd>
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && autocompleteSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl overflow-hidden py-1.5 z-50 animate-fadeIn animate-duration-200">
              <div className="px-4 py-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-550 border-b border-zinc-100 dark:border-zinc-900/50 mb-1">
                Suggested Tools
              </div>
              {autocompleteSuggestions.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    setSearchParams((prev) => {
                      prev.set('q', tool.name);
                      prev.delete('category');
                      prev.delete('collection');
                      return prev;
                    }, { replace: true });
                    setShowSuggestions(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <LucideIcon name={tool.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                      {tool.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-550 bg-zinc-100 dark:bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-200/20 dark:border-zinc-800/40">
                    {tool.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular Suggestions & Sorting selector */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-450 dark:text-zinc-500 font-bold pl-1">
            <span>Popular:</span>
            {popularSuggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handlePopularSuggestionClick(s.query)}
                className="hover:text-indigo-650 dark:hover:text-indigo-400 transition cursor-pointer text-zinc-650 dark:text-zinc-400 font-semibold"
              >
                {s.name}
                {idx < popularSuggestions.length - 1 && <span className="mx-1.5 text-zinc-300 dark:text-zinc-700">·</span>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-550 dark:text-zinc-400 self-end sm:self-auto">
            <ListFilter className="w-3.5 h-3.5" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="popularity">Most Popular</option>
              <option value="newest">Newest Added</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="favorites">Favorites First</option>
            </select>
          </div>
        </div>

        {/* Curation Pills/Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-b border-zinc-200/50 dark:border-zinc-850/50">
          {collectionsList.map((col) => {
            const isActive = activeCollection === col.id;
            return (
              <button
                key={col.id}
                onClick={() => selectCollection(col.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                    : 'text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                  }`}
              >
                {col.name}
              </button>
            );
          })}

          {/* Mobile Categories toggler in tabs line */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden shrink-0 px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-450 hover:bg-zinc-100 transition cursor-pointer"
          >
            Categories {showFiltersMobile ? '▲' : '▼'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* SIDEBAR: Categories list */}
        <div className={`w-full md:w-[240px] shrink-0 space-y-6 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 pl-1">
              Filter by Category
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => selectCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer border ${activeCategory === 'all'
                    ? 'bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 border-indigo-500/10'
                    : 'text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 border-transparent'
                  }`}
              >
                <span>All Categories</span>
                {activeCategory === 'all' && <Check className="w-3.5 h-3.5 text-indigo-500" />}
              </button>

              {visibleCategories.map((cat) => {
                const Icon = categoryIcons[cat.id] || LayoutGrid;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer border ${isActive
                        ? 'bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 border-indigo-500/10'
                        : 'text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 border-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.name}</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                  </button>
                );
              })}

              {categories.length > 8 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="w-full text-left px-3 py-2 rounded-xl text-[11px] font-extrabold text-indigo-650 dark:text-indigo-400 hover:bg-indigo-500/5 dark:hover:bg-indigo-950/20 transition cursor-pointer"
                >
                  {showAllCategories ? 'Show less categories ↑' : 'View all categories →'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MAIN LISTING WORKSPACE */}
        <div className="flex-grow space-y-6">
          {/* Recently Visited Quick row */}
          {recentViews.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-left bg-zinc-50 dark:bg-zinc-900/20 p-3.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-850/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-550 pl-1 flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>Recently Visited:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {recentViews.map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.slug === 'advanced-boq-calculator-india' ? '/tools/advanced-boq-calculator-india' : `/tool/${tool.slug}`}
                    onClick={() => addToHistory(tool)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 hover:border-indigo-500/30 text-[11px] font-bold text-zinc-650 dark:text-zinc-350 hover:text-indigo-650 dark:hover:text-indigo-455 transition"
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Featured Tool Card */}
          {!searchQuery && activeCategory === 'all' && activeCollection === 'all' && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/[0.03] to-violet-500/[0.03] border border-indigo-500/10 dark:border-indigo-500/10 space-y-4 text-left animate-fadeIn">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <span className="text-sm">⭐</span> Tool of the Week
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    SQL Minifier
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Minify and compress SQL queries by removing comments and unnecessary spaces. Ideal for optimizing database payloads and embedding scripts.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    to="/tool/sql-minifier"
                    onClick={() => {
                      const sqlTool = toolsList.find(t => t.slug === 'sql-minifier');
                      if (sqlTool) addToHistory(sqlTool);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold text-xs shadow-sm hover:shadow-indigo-500/10 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    Try SQL Minifier →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Listing Count Header */}
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-550 pl-1">
            <div className="flex items-center gap-2">
              <span>Results ({filtered.length} Tools Matching)</span>
              {(searchQuery || activeCategory !== 'all' || activeCollection !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchParams({});
                    setSortBy('popularity');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition lowercase cursor-pointer font-extrabold"
                >
                  (Reset Filters)
                </button>
              )}
            </div>
            {activeCollection !== 'all' && (
              <span className="text-indigo-650 dark:text-indigo-400 font-bold bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                Collection: {collectionsList.find(c => c.id === activeCollection)?.name}
              </span>
            )}
          </div>
          {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
                {filtered.map((tool) => {
                  const isFavorite = favorites.includes(tool.id);
                  const badge = getToolBadge(tool.id);

                  return (
                    <div
                      key={tool.id}
                      onClick={() => {
                        addToHistory(tool);
                        navigate(tool.slug === 'advanced-boq-calculator-india' ? '/tools/advanced-boq-calculator-india' : `/tool/${tool.slug}`);
                      }}
                      className="saas-card p-5 flex flex-col justify-between hover:border-indigo-500/20 dark:hover:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/[0.01] hover:-translate-y-0.5 transition-all duration-300 group relative cursor-pointer"
                    >
                      <div className="space-y-3.5">
                        {/* Top actions/icons row */}
                        <div className="flex justify-between items-start">
                          <div className="p-2.5 rounded-xl bg-zinc-150/40 dark:bg-zinc-900/60 text-zinc-650 dark:text-zinc-400 border border-zinc-200/30 dark:border-zinc-800/60 group-hover:bg-indigo-500/10 group-hover:text-indigo-705 dark:group-hover:text-indigo-400 transition-colors duration-300">
                            <LucideIcon name={tool.icon} className="w-4 h-4" />
                          </div>

                          <div className="flex items-center gap-1.5">
                            {badge && (
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${badge.className}`}>
                                {badge.text}
                              </span>
                            )}

                            {/* Favorites button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(tool.id);
                              }}
                              className={`p-1.5 rounded-lg border hover:bg-zinc-50 dark:hover:bg-zinc-900 transition duration-300 cursor-pointer ${isFavorite
                                  ? 'bg-rose-500/5 border-rose-500/10 text-rose-500'
                                  : 'bg-white/40 dark:bg-zinc-900/30 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-400 hover:text-rose-500'
                                }`}
                              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Info block */}
                        <div className="space-y-1.5 text-left">
                          <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-550 border border-zinc-200/30 dark:border-zinc-800/60">
                            {tool.category}
                          </span>

                          <h3 className="text-xs font-extrabold text-zinc-900 dark:text-white tracking-tight leading-snug group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition duration-300 truncate">
                            {tool.name}
                          </h3>

                          <p className="text-[11px] text-zinc-450 dark:text-zinc-500 font-semibold leading-relaxed line-clamp-2 h-8">
                            {tool.shortDescription}
                          </p>
                        </div>

                        {/* Tags/Keywords section */}
                        {tool.keywords && tool.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {tool.keywords.slice(0, 3).map((kw, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSearchChange(kw);
                                }}
                                className="text-[9px] font-bold text-zinc-455 dark:text-zinc-555 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/5 bg-zinc-100/50 dark:bg-zinc-900/40 px-2 py-0.5 rounded border border-zinc-200/10 dark:border-zinc-800/10 transition cursor-pointer"
                              >
                                #{kw.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom CTA row */}
                      <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-850/80 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookmark(tool);
                            }}
                            className="p-1.5 rounded-lg hover:bg-zinc-150 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition cursor-pointer"
                            title="Save Bookmark"
                          >
                            {bookmarkedId === tool.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bookmark className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(tool.slug);
                            }}
                            className="p-1.5 rounded-lg hover:bg-zinc-150 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition cursor-pointer"
                            title="Copy Tool Link"
                          >
                            {copiedId === tool.slug ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1 transition-all">
                          <span>Open Tool</span>
                          <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-zinc-400 group-hover:text-indigo-500" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 saas-card space-y-4">
                <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-900 w-16 h-16 flex items-center justify-center mx-auto text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50">
                  <HelpCircle className="w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">No tools found</h3>
                  <p className="text-xs text-zinc-450 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed font-semibold">
                    We couldn't find any utilities matching your queries. Try resetting filters or search parameters.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchParams({});
                      setSortBy('popularity');
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer hover:opacity-90 transition shadow-sm"
                  >
                    Reset All Filters
                  </button>
                  <button
                    onClick={() => {
                      handlePopularSuggestionClick('GST Calculator');
                    }}
                    className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-300 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
                  >
                    Browse Popular Tools
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
