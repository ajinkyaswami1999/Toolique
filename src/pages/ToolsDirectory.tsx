import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Heart, Share2, Copy, Bookmark,
  Clock, ArrowUpRight, ChevronRight, Check, ListFilter, LayoutGrid, HelpCircle,
  IndianRupee, Hammer, Compass, Palette, FileText, Image as ImageIcon, Code, Globe, Type, Calendar, Scale, Lock, GraduationCap, Car, Briefcase, Heart as HeartIcon, Printer
} from 'lucide-react';
import { toolsList } from '../data/tools';
import type { Tool } from '../data/tools';
import { categories } from '../data/categories';
import SEO from '../components/SEO';

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

export default function ToolsDirectory() {
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

  // Load favorites & views on mount
  useEffect(() => {
    try {
      const favs = localStorage.getItem('toolique_favorites');
      if (favs) setFavorites(JSON.parse(favs));

      const hist = localStorage.getItem('toolique_recent_history');
      if (hist) {
        const parsedHist = JSON.parse(hist);
        // Map history names to tool list items
        const matchingTools = parsedHist
          .map((h: any) => toolsList.find(t => t.name === h.name))
          .filter(Boolean) as Tool[];
        setRecentViews(matchingTools.slice(0, 5));
      }
    } catch (e) {}
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
    } catch (e) {}
  };

  const handleSearchChange = (val: string) => {
    setSearchParams((prev) => {
      if (val) prev.set('q', val);
      else prev.delete('q');
      return prev;
    }, { replace: true });
  };

  const selectCategory = (catId: string) => {
    setSearchParams((prev) => {
      if (catId === 'all') prev.delete('category');
      else {
        prev.set('category', catId);
        prev.delete('collection'); // clear collection to prioritize category selection
      }
      return prev;
    }, { replace: true });
  };

  const selectCollection = (colId: string) => {
    setSearchParams((prev) => {
      if (colId === 'all') prev.delete('collection');
      else {
        prev.set('collection', colId);
        prev.delete('category'); // clear category to prioritize collection selection
      }
      return prev;
    }, { replace: true });
  };

  // Filter tools
  let filtered = toolsList.filter((tool) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        (tool.keywords || []).some(k => k.toLowerCase().includes(q)) ||
        tool.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 2. Category
    if (activeCategory !== 'all') {
      if (tool.category !== activeCategory) return false;
    }

    // 3. Collection filter mapping
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
        return ['sql-minifier', 'json-validator', 'regex-tester', 'jwt-decoder'].includes(tool.id) || tool.category === 'developer';
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
      // simulate newest by ID matching
      return b.id.localeCompare(a.id);
    }
    if (sortBy === 'favorites') {
      const aFav = favorites.includes(a.id) ? 1 : 0;
      const bFav = favorites.includes(b.id) ? 1 : 0;
      return bFav - aFav;
    }
    // Default: popularity sorting
    const aIndex = toolsList.findIndex(t => t.id === a.id);
    const bIndex = toolsList.findIndex(t => t.id === b.id);
    return aIndex - bIndex;
  });

  const collectionsList = [
    { id: 'all', name: 'All Collections' },
    { id: 'popular', name: 'Popular Utilities' },
    { id: 'trending', name: 'Trending' },
    { id: 'new', name: 'Newly Added' },
    { id: 'dev-picks', name: 'Developer Picks' },
    { id: 'engineering-picks', name: 'Engineering Picks' },
    { id: 'favorites', name: 'My Favorites' }
  ];

  return (
    <div className="space-y-8 pb-12 text-left animate-fadeIn">
      <SEO 
        title="Tools Directory | Complete Utilities Catalog | Toolique" 
        description="Browse hundreds of free browser-based online tools. Search, filter, and run developer extensions, financial calculators, engineering apps, and PDF scripts locally."
      />

      {/* Directory Hero */}
      <div className="p-8 md:p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 space-y-3">
        <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider">
          Complete Directory
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
          Find the Right Tool Instantly
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl font-medium leading-relaxed">
          Browse hundreds of fast, offline-first calculators, text filters, and conversion suites execution-free in-browser.
        </p>
      </div>

      {/* Search and Filters panel */}
      <div className="sticky top-16 z-30 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md py-4 border-b border-zinc-200/50 dark:border-zinc-850/50 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Sticky Search bar */}
        <div className="relative w-full md:max-w-md flex-grow">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search tools by name, tag, or formula (e.g. concrete, Far)..."
            className="saas-input pl-10 pr-4 py-2.5 text-xs font-semibold focus:ring-indigo-500/10 focus:border-indigo-500"
          />
        </div>

        {/* Filters Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Sorting */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
            <ListFilter className="w-3.5 h-3.5" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="popularity">Most Popular</option>
              <option value="newest">Newest Added</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="favorites">Favorites First</option>
            </select>
          </div>

          {/* Collection Tab */}
          <select
            value={activeCollection}
            onChange={(e) => selectCollection(e.target.value)}
            className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none md:hidden"
          >
            {collectionsList.map((col) => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>

          {/* Mobile Filter Drawer Toggler */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 transition cursor-pointer"
          >
            Categories
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR: Collections & Categories */}
        <div className={`lg:col-span-3 space-y-6 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
          
          {/* Collections Selector */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 pl-1">
              Curated Collections
            </span>
            <div className="flex flex-col gap-1">
              {collectionsList.map((col) => (
                <button
                  key={col.id}
                  onClick={() => selectCollection(col.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    activeCollection === col.id
                      ? 'bg-indigo-500/5 text-indigo-700 dark:text-indigo-400'
                      : 'text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  <span>{col.name}</span>
                  {activeCollection === col.id && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter list */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 pl-1">
              Filter by Category
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => selectCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-indigo-500/5 text-indigo-700 dark:text-indigo-400'
                    : 'text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                }`}
              >
                <span>All Categories</span>
                {activeCategory === 'all' && <Check className="w-3.5 h-3.5 text-indigo-500" />}
              </button>
              
              {categories.map((cat) => {
                const Icon = categoryIcons[cat.id] || LayoutGrid;
                return (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-indigo-500/5 text-indigo-700 dark:text-indigo-400'
                        : 'text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.name}</span>
                    </div>
                    {activeCategory === cat.id && <Check className="w-3.5 h-3.5 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recently Viewed Sidebar list */}
          {recentViews.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-zinc-200/60 dark:border-zinc-850/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 pl-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Recently Visited</span>
              </span>
              <div className="space-y-2">
                {recentViews.map((tool) => (
                  <Link
                    key={tool.id}
                    to={`/tool/${tool.slug}`}
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900/40 transition group"
                  >
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[150px] group-hover:text-indigo-650 transition">
                      {tool.name}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DIRECTORY LISTING */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 pl-1">
            <span>Results ({filtered.length} Tools Matching)</span>
            {activeCollection !== 'all' && (
              <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/5 px-2 py-0.5 rounded">
                Collection: {collectionsList.find(c => c.id === activeCollection)?.name}
              </span>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {filtered.map((tool) => {
                const Icon = categoryIcons[tool.category] || LayoutGrid;
                const isFavorite = favorites.includes(tool.id);
                return (
                  <div
                    key={tool.id}
                    className="saas-card p-6 flex flex-col justify-between hover:border-zinc-350 dark:hover:border-zinc-700 transition duration-300 group"
                  >
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-550 dark:text-zinc-450 border border-zinc-200/50 dark:border-zinc-800/80 group-hover:bg-indigo-500/10 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors duration-300">
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        {/* Favorites button */}
                        <button
                          onClick={() => toggleFavorite(tool.id)}
                          className={`p-2 rounded-xl border hover:bg-zinc-50 dark:hover:bg-zinc-900 transition duration-300 cursor-pointer ${
                            isFavorite 
                              ? 'bg-rose-500/5 border-rose-500/10 text-rose-500' 
                              : 'bg-white/40 dark:bg-zinc-900/30 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-400 hover:text-rose-500'
                          }`}
                          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200/30 dark:border-zinc-800/60">
                            {tool.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition duration-300">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-zinc-450 dark:text-zinc-500 font-medium leading-relaxed">
                          {tool.shortDescription}
                        </p>
                      </div>
                    </div>

                    {/* Quick actions bar */}
                    <div className="pt-5 mt-5 border-t border-zinc-100 dark:border-zinc-850/80 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleBookmark(tool)}
                          className="p-1.5 rounded-lg hover:bg-zinc-150 dark:hover:bg-zinc-900 text-zinc-450 hover:text-zinc-800 dark:hover:text-white transition cursor-pointer"
                          title="Save Bookmark"
                        >
                          {bookmarkedId === tool.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bookmark className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopyLink(tool.slug)}
                          className="p-1.5 rounded-lg hover:bg-zinc-150 dark:hover:bg-zinc-900 text-zinc-450 hover:text-zinc-800 dark:hover:text-white transition cursor-pointer"
                          title="Copy Tool Link"
                        >
                          {copiedId === tool.slug ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <Link
                        to={tool.slug === 'advanced-boq-calculator-india' ? '/tools/advanced-boq-calculator-india' : `/tool/${tool.slug}`}
                        className="text-[10px] font-black uppercase tracking-wider text-zinc-850 dark:text-white flex items-center gap-1 group-hover:gap-1.5 transition-all"
                      >
                        <span>Open Tool</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 saas-card space-y-3">
              <HelpCircle className="w-8 h-8 text-zinc-400 mx-auto animate-bounce" />
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">No tools found</h3>
              <p className="text-xs text-zinc-455 max-w-xs mx-auto leading-relaxed">
                We couldn't find any utilities matching your queries. Try resetting filters or search parameters.
              </p>
              <button
                onClick={() => {
                  setSearchParams({});
                  setSortBy('popularity');
                }}
                className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-[10px] uppercase tracking-wider cursor-pointer"
              >
                Reset Directories Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
