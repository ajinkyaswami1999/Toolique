import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search, Heart, Copy, Clock, ChevronRight,
  Check, ListFilter, LayoutGrid, HelpCircle, X,
  IndianRupee, Hammer, Compass, Palette, FileText, Image as ImageIcon, Code, Globe, Type, Calendar, Scale, Lock, GraduationCap, Car, Briefcase, Heart as HeartIcon, Printer, Zap, Bug, TrendingUp, Binary, Sparkles, Shuffle, Table, SlidersHorizontal
} from 'lucide-react';
import { toolsList } from '../data/tools';
import type { Tool } from '../data/tools';
import { categories } from '../data/categories';
import SEO from '../components/SEO';
import LucideIcon from '../components/LucideIcon';
import ToolCard from '../components/ToolCard';
import { getToolCanonicalPath } from '../routes/AppRoutes';

const categoryIcons: Record<string, React.ComponentType<any>> = {
  finance: IndianRupee,
  civil: Hammer,
  architecture: Compass,
  interior: Palette,
  electrical: Zap,
  pdf: FileText,
  image: ImageIcon,
  developer: Code,
  web: Globe,
  text: Type,
  social: Globe,
  datetime: Calendar,
  unit: Scale,
  security: Lock,
  student: GraduationCap,
  automobile: Car,
  business: Briefcase,
  health: HeartIcon,
  '3d-printing': Printer,
  'math-studio': Binary,
  qa: Bug,
  economics: TrendingUp
};

const getToolBadge = (toolId: string) => {
  if (['GSTCalculator', 'ConcreteCalculator', 'InHandSalaryCalculator', 'SIPCalculator', 'EMICalculator', 'PDFMerge', 'STLVolumeCalculator'].includes(toolId)) {
    return { text: 'Popular', className: 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-800/60' };
  }
  if (['BuildingFeasibilityChecker', 'FARFSICalculator', 'ModularKitchenCostCalculator', 'ImageCompressor', 'PrintFarmRevenueCalculator'].includes(toolId)) {
    return { text: 'Trending', className: 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/20 dark:border-amber-800/60' };
  }
  if (['PackagingCostCalculator', 'ScaleCalculator', 'LineWidthCalculator', 'PrintProfitCalculator', 'WardrobeCostCalculator'].includes(toolId)) {
    return { text: 'New', className: 'bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 dark:border-indigo-800/60' };
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentViews, setRecentViews] = useState<Tool[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [displayCount, setDisplayCount] = useState<number>(32);

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
          .map((h: any) => toolsList.find(t => t.name === h.name || t.slug === h.slug))
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

  // Reset display count when filter changes
  useEffect(() => {
    setDisplayCount(32);
  }, [searchQuery, activeCategory, activeCollection, sortBy]);

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

  const handleCopyLink = (tool: Tool) => {
    const canonicalPath = getToolCanonicalPath(tool.category, tool.slug);
    const link = `https://www.toolique.in${canonicalPath}`;
    navigator.clipboard.writeText(link);
    setCopiedId(tool.slug);
    setTimeout(() => setCopiedId(null), 2000);
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

  const addToHistory = useCallback((tool: Tool) => {
    try {
      const hist = localStorage.getItem('toolique_recent_history') || '[]';
      const parsedHist = JSON.parse(hist);

      const filteredHist = parsedHist.filter((h: any) => h.name !== tool.name && h.slug !== tool.slug);
      const newItem = {
        name: tool.name,
        slug: tool.slug,
        category: tool.category,
        type: 'Tool Used',
        timestamp: 'Just now',
        link: getToolCanonicalPath(tool.category, tool.slug)
      };

      const updated = [newItem, ...filteredHist].slice(0, 8);
      localStorage.setItem('toolique_recent_history', JSON.stringify(updated));
      setRecentViews(updated.map((h: any) => toolsList.find(t => t.name === h.name || t.slug === h.slug)).filter(Boolean) as Tool[]);
    } catch (e) { }
  }, []);

  const handlePopularSuggestionClick = (query: string) => {
    setSearchParams((prev) => {
      prev.set('q', query);
      prev.delete('category');
      prev.delete('collection');
      return prev;
    }, { replace: true });
    setShowSuggestions(false);
  };

  // Pick random tool
  const handleRandomTool = () => {
    if (toolsList.length === 0) return;
    const randomIndex = Math.floor(Math.random() * toolsList.length);
    const randomTool = toolsList[randomIndex];
    addToHistory(randomTool);
    navigate(getToolCanonicalPath(randomTool.category, randomTool.slug));
  };

  // Category counts calculation
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    toolsList.forEach(tool => {
      map[tool.category] = (map[tool.category] || 0) + 1;
    });
    return map;
  }, []);

  // Filter and sort tools inside useMemo
  const filtered = useMemo(() => {
    const result = toolsList.filter((tool) => {
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
          return ['GSTCalculator', 'ConcreteCalculator', 'InHandSalaryCalculator', 'SIPCalculator', 'EMICalculator', 'PDFMerge', 'STLVolumeCalculator'].includes(tool.id);
        }
        if (activeCollection === 'trending') {
          return ['BuildingFeasibilityChecker', 'FARFSICalculator', 'ModularKitchenCostCalculator', 'ImageCompressor', 'PrintFarmRevenueCalculator'].includes(tool.id);
        }
        if (activeCollection === 'new') {
          return ['PackagingCostCalculator', 'ScaleCalculator', 'LineWidthCalculator', 'PrintProfitCalculator', 'WardrobeCostCalculator', 'FalseCeilingCalculator'].includes(tool.id);
        }
        if (activeCollection === '3d-printing') {
          return tool.category === '3d-printing';
        }
        if (activeCollection === 'dev-picks') {
          return ['SQLMinifier', 'JSONFormatter', 'RegexTester', 'JWTDecoder'].includes(tool.id) || tool.category === 'developer' || tool.category === 'security';
        }
        if (activeCollection === 'engineering-picks') {
          return tool.category === 'civil' || tool.category === 'electrical' || tool.category === 'math-studio' || tool.category === 'architecture';
        }
        if (activeCollection === 'finance-picks') {
          return tool.category === 'finance' || tool.category === 'economics';
        }
        if (activeCollection === 'favorites') {
          return favorites.includes(tool.id);
        }
      }

      return true;
    });

    if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'favorites') {
      result.sort((a, b) => (favorites.includes(b.id) ? 1 : 0) - (favorites.includes(a.id) ? 1 : 0));
    }

    return result;
  }, [searchQuery, activeCategory, activeCollection, sortBy, favorites]);

  const collectionsList = [
    { id: 'all', name: 'All Tools', count: toolsList.length },
    { id: 'popular', name: '🌟 Popular & Core' },
    { id: 'trending', name: '🔥 Trending' },
    { id: 'new', name: '🚀 Newly Upgraded' },
    { id: '3d-printing', name: '🧊 3D Print Studio', count: categoryCounts['3d-printing'] || 0 },
    { id: 'dev-picks', name: '💻 Developer Picks', count: (categoryCounts['developer'] || 0) + (categoryCounts['security'] || 0) },
    { id: 'engineering-picks', name: '🏗️ Engineering & Civil', count: (categoryCounts['civil'] || 0) + (categoryCounts['architecture'] || 0) + (categoryCounts['electrical'] || 0) },
    { id: 'finance-picks', name: '📊 Finance & Tax', count: (categoryCounts['finance'] || 0) + (categoryCounts['economics'] || 0) },
    { id: 'favorites', name: `❤️ Favorites (${favorites.length})` }
  ];

  const popularSuggestions = [
    { name: 'STL Volume Calculator', query: 'STL Volume' },
    { name: 'GST Calculator', query: 'GST' },
    { name: 'Scale Calculator', query: 'Scale' },
    { name: 'SQL Formatter', query: 'SQL' },
    { name: 'Building Feasibility', query: 'Feasibility' },
    { name: 'Packaging Cost', query: 'Packaging' },
    { name: 'JSON Formatter', query: 'JSON' },
    { name: 'Concrete Calculator', query: 'Concrete' }
  ];

  // Top 6 autocomplete matches
  const autocompleteSuggestions = searchQuery.trim()
    ? toolsList
      .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 6)
    : [];

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 9);

  return (
    <div className="space-y-5 pb-16 text-left animate-fadeIn">
      <SEO
        title="Tools Directory | Complete 250+ Utilities Catalog | Toolique"
        description="Browse hundreds of free browser-based online tools. Search, filter, and run 3D printing estimators, developer utilities, civil engineering tools, finance calculators, and PDF scripts 100% locally in your browser."
      />

      {/* Compact Directory Hero Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 saas-card relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                Tools Directory
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3" />
                250+ Free Utilities
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hidden sm:inline-block">
                100% Client-Side Privacy
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              Explore professional-grade calculators, engineering utilities, 3D printing tools, and developer scripts running locally in your browser.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRandomTool}
              className="px-3 py-1.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Launch a random tool from the catalog"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-600" />
              <span>Surprise Me</span>
            </button>
            <button
              onClick={() => {
                selectCollection('favorites');
              }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-bold text-xs border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
              <span>Favorites ({favorites.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Curation Panel */}
      <div className="space-y-3.5">
        {/* Search bar wrapper */}
        <div ref={searchContainerRef} className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search 250+ tools by name, category, or keyword (e.g. STL, GST, SQL, Concrete, Scale)..."
            className="saas-input !pl-11 pr-20 py-3 text-sm font-semibold focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs rounded-xl"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
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
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center h-6 select-none px-2 font-mono text-[11px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800 rounded-lg">
              ⌘K
            </kbd>
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && autocompleteSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 shadow-2xl overflow-hidden py-1.5 z-50 animate-fadeIn">
              <div className="px-4 py-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-900 mb-1">
                Suggested Tools ({autocompleteSuggestions.length})
              </div>
              {autocompleteSuggestions.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => {
                    addToHistory(tool);
                    navigate(getToolCanonicalPath(tool.category, tool.slug));
                    setShowSuggestions(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/80 transition group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <LucideIcon name={tool.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors block">
                        {tool.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate max-w-md block">
                        {tool.shortDescription}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-800 shrink-0 ml-2">
                    {tool.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular Tags Strip & Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 font-bold">
            <span className="text-zinc-400 font-semibold mr-1">Quick Tags:</span>
            {popularSuggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handlePopularSuggestionClick(s.query)}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold border border-zinc-200/50 dark:border-zinc-800/50"
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
                title="Table List View"
              >
                <Table className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400">
              <ListFilter className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort tools"
                className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-extrabold text-zinc-800 dark:text-zinc-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="popularity">Most Popular</option>
                <option value="newest">Newest Added</option>
                <option value="alphabetical">Alphabetical (A-Z)</option>
                <option value="favorites">Favorites First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Horizontal Curation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-b border-zinc-200/60 dark:border-zinc-800/60">
          {collectionsList.map((col) => {
            const isActive = activeCollection === col.id;
            return (
              <button
                key={col.id}
                onClick={() => selectCollection(col.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                  }`}
              >
                <span>{col.name}</span>
                {col.count !== undefined && (
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900' : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500'
                  }`}>
                    {col.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Mobile Categories toggler in tabs line */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden shrink-0 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 transition cursor-pointer flex items-center gap-1"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Categories</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* SIDEBAR: Categories list with live counts */}
        <div className={`w-full md:w-[260px] shrink-0 space-y-6 ${showFiltersMobile ? 'block' : 'hidden md:block'}`}>
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 pl-1">
              Browse by Category
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => selectCategory('all')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer border ${activeCategory === 'all'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 border-transparent'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-indigo-500" />
                  <span>All Categories</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  {toolsList.length}
                </span>
              </button>

              {visibleCategories.map((cat) => {
                const Icon = categoryIcons[cat.id] || LayoutGrid;
                const isActive = activeCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;

                return (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer border ${isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 border-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-zinc-500 group-hover:text-indigo-500" />
                      <span>{cat.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}

              {categories.length > 9 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition cursor-pointer flex items-center justify-between"
                >
                  <span>{showAllCategories ? 'Show fewer categories' : `Show all (${categories.length}) categories`}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${showAllCategories ? '-rotate-90' : 'rotate-90'}`} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MAIN LISTING WORKSPACE */}
        <div className="flex-grow space-y-6">
          {/* Recently Visited Quick row */}
          {recentViews.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-left bg-zinc-50 dark:bg-zinc-900/40 p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 pl-1 flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Recently Visited:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {recentViews.map((tool) => (
                  <Link
                    key={tool.id}
                    to={getToolCanonicalPath(tool.category, tool.slug)}
                    onClick={() => addToHistory(tool)}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 hover:border-indigo-500 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition shadow-2xs"
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Featured Hero Card (when in All view) */}
          {!searchQuery && activeCategory === 'all' && activeCollection === 'all' && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-emerald-500/10 border border-indigo-500/30 space-y-4 text-left animate-fadeIn">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Featured Flagship Engine
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    Building Feasibility & Bye-Law Checker
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                    Automated location-aware architectural feasibility calculation. Check permissible FAR/FSI, ground coverage, setbacks, permissible building height, parking ECS, fire NOC, and development bye-laws across 36 Indian States & UTs.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    to="/architecture/building-feasibility-checker"
                    onClick={() => {
                      const bfc = toolsList.find(t => t.slug === 'building-feasibility-checker');
                      if (bfc) addToHistory(bfc);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-extrabold text-xs shadow-md hover:scale-[1.02] active:scale-98 transition-all duration-200 cursor-pointer"
                  >
                    Launch Feasibility Engine →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Listing Count Header & Quick Reset */}
          <div className="flex justify-between items-center text-xs font-bold text-zinc-500 pl-1">
            <div className="flex items-center gap-2">
              <span className="text-zinc-900 dark:text-white font-extrabold">
                {filtered.length} Tools Matching
              </span>
              {(searchQuery || activeCategory !== 'all' || activeCollection !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchParams({});
                    setSortBy('popularity');
                  }}
                  className="text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer font-bold text-xs"
                >
                  (Reset All Filters)
                </button>
              )}
            </div>
            {activeCollection !== 'all' && (
              <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 text-[11px]">
                Collection: {collectionsList.find(c => c.id === activeCollection)?.name}
              </span>
            )}
          </div>

          {/* TOOLS DISPLAY: Grid View vs Table View */}
          {filtered.length > 0 ? (
            <div className="space-y-8">
              
              {/* GRID VIEW */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fadeIn">
                  {filtered.slice(0, displayCount).map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onTagClick={handleSearchChange}
                    />
                  ))}
                </div>
              )}

              {/* TABLE LIST VIEW */}
              {viewMode === 'table' && (
                <div className="saas-card overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase text-[10px] bg-zinc-50/50 dark:bg-zinc-900/40">
                          <th className="py-3 px-4">Tool Name</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4 hidden md:table-cell">Description</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                        {filtered.slice(0, displayCount).map((tool) => {
                          const isFavorite = favorites.includes(tool.id);
                          const badge = getToolBadge(tool.id);
                          const canonicalPath = getToolCanonicalPath(tool.category, tool.slug);

                          return (
                            <tr
                              key={tool.id}
                              onClick={() => {
                                addToHistory(tool);
                                navigate(canonicalPath);
                              }}
                              className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition cursor-pointer group"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600">
                                    <LucideIcon name={tool.icon} className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 flex items-center gap-2">
                                      <span>{tool.name}</span>
                                      {badge && (
                                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase border ${badge.className}`}>
                                          {badge.text}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                      {canonicalPath}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200/50 dark:border-zinc-800">
                                  {tool.category}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 hidden md:table-cell max-w-md truncate">
                                {tool.shortDescription}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => toggleFavorite(tool.id)}
                                    className={`p-1.5 rounded-lg border transition ${
                                      isFavorite ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'text-zinc-400 hover:text-rose-500 border-transparent'
                                    }`}
                                    title={isFavorite ? 'Remove Favorite' : 'Add Favorite'}
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                                  </button>
                                  <button
                                    onClick={() => handleCopyLink(tool)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
                                    title="Copy Link"
                                  >
                                    {copiedId === tool.slug ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                  <Link
                                    to={canonicalPath}
                                    onClick={() => addToHistory(tool)}
                                    className="px-3 py-1 text-[11px] font-extrabold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                                  >
                                    Open
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Load More & Progress Bar */}
              {displayCount < filtered.length ? (
                <div className="saas-card p-5 text-center space-y-3">
                  <div className="max-w-md mx-auto space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-zinc-500">
                      <span>Showing {Math.min(displayCount, filtered.length)} of {filtered.length} tools</span>
                      <span>{Math.round((Math.min(displayCount, filtered.length) / filtered.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(Math.min(displayCount, filtered.length) / filtered.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-1">
                    <button
                      onClick={() => setDisplayCount((prev) => prev + 32)}
                      className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer"
                    >
                      Load More ({filtered.length - displayCount} Remaining)
                    </button>
                    <button
                      onClick={() => setDisplayCount(filtered.length)}
                      className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:border-indigo-500 transition cursor-pointer"
                    >
                      Show All ({filtered.length})
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs font-bold text-zinc-400">
                  ✓ Displaying all {filtered.length} matching tools
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 saas-card space-y-4">
              <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-900 w-16 h-16 flex items-center justify-center mx-auto text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50">
                <HelpCircle className="w-8 h-8 animate-pulse text-indigo-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">No tools found</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed font-medium">
                  We couldn't find any utilities matching "{searchQuery}". Try searching for another keyword or reset the category filter.
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchParams({});
                    setSortBy('popularity');
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs uppercase tracking-wider cursor-pointer hover:opacity-90 transition shadow-sm"
                >
                  Reset All Filters
                </button>
                <button
                  onClick={() => handlePopularSuggestionClick('STL Volume')}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-300 font-extrabold text-xs uppercase tracking-wider cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
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
