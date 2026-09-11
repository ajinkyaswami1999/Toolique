import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Clock,
  ArrowRight,
  X,
  Bookmark,
  Share2,
  ExternalLink,
  Sparkles,
  Building2,
  Receipt,
  Code2,
  ShieldCheck,
  Printer,
  TrendingUp,
  CheckCircle2,
  Tag,
  ChevronRight,
  Check,
  Flame,
  SlidersHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { blogArticles, BLOG_CATEGORIES, type BlogArticle } from '../data/blogArticles';

const BOOKMARKS_STORAGE_KEY = 'toolique_bookmarked_articles';

export default function BlogResources() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState<boolean>(false);
  const [activeArticle, setActiveArticle] = useState<BlogArticle | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Lock body scroll when reader modal is open
  useEffect(() => {
    if (activeArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeArticle]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveArticle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync bookmarks to localStorage
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save bookmarks', err);
      }
      return next;
    });
  };

  // Copy article link
  const copyArticleLink = (article: BlogArticle, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const url = `${window.location.origin}/blog#${article.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(article.slug);
    setTimeout(() => {
      setCopiedSlug(null);
    }, 2500);
  };

  // Filtered articles calculation
  const filteredArticles = useMemo(() => {
    return blogArticles.filter((art) => {
      // Category filter
      if (selectedCategory !== 'all' && art.categoryId !== selectedCategory) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'all' && art.difficulty !== selectedDifficulty) {
        return false;
      }
      // Tag filter
      if (selectedTag && !art.tags.includes(selectedTag)) {
        return false;
      }
      // Bookmarks filter
      if (showOnlyBookmarks && !bookmarkedIds.includes(art.id)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesSubtitle = art.subtitle.toLowerCase().includes(q);
        const matchesExcerpt = art.excerpt.toLowerCase().includes(q);
        const matchesTool = art.toolName.toLowerCase().includes(q);
        const matchesTag = art.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSubtitle && !matchesExcerpt && !matchesTool && !matchesTag) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCategory, selectedDifficulty, selectedTag, showOnlyBookmarks, searchQuery, bookmarkedIds]);

  // Featured article (first featured article or first in list)
  const featuredArticle = useMemo(() => {
    return blogArticles.find((a) => a.featured) || blogArticles[0];
  }, []);

  // All unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    blogArticles.forEach((art) => art.tags.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, []);

  // Category Icon helper
  const renderCategoryIcon = (catId: string, className = 'w-4 h-4') => {
    switch (catId) {
      case 'civil-arch':
        return <Building2 className={className} />;
      case 'finance-tax':
        return <Receipt className={className} />;
      case 'software-dev':
        return <Code2 className={className} />;
      case 'qa-testing':
        return <ShieldCheck className={className} />;
      case '3d-printing':
        return <Printer className={className} />;
      case 'economics':
        return <TrendingUp className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // Category Accent colors
  const getCategoryTheme = (catId: string) => {
    switch (catId) {
      case 'civil-arch':
        return {
          badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
          gradient: 'from-emerald-500 to-teal-600',
          border: 'border-emerald-500/30'
        };
      case 'finance-tax':
        return {
          badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
          gradient: 'from-blue-500 to-indigo-600',
          border: 'border-blue-500/30'
        };
      case 'software-dev':
        return {
          badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
          gradient: 'from-indigo-500 to-violet-600',
          border: 'border-indigo-500/30'
        };
      case 'qa-testing':
        return {
          badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
          gradient: 'from-purple-500 to-pink-600',
          border: 'border-purple-500/30'
        };
      case '3d-printing':
        return {
          badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
          gradient: 'from-amber-500 to-orange-600',
          border: 'border-amber-500/30'
        };
      case 'economics':
        return {
          badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
          gradient: 'from-rose-500 to-red-600',
          border: 'border-rose-500/30'
        };
      default:
        return {
          badge: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
          gradient: 'from-teal-500 to-emerald-600',
          border: 'border-teal-500/30'
        };
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Intermediate':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Advanced':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-10 text-left animate-fadeIn pb-16">
      <SEO
        title="Knowledge Base & Statutory Engineering Guides | Toolique"
        description="Explore in-depth technical articles, municipal NBC 2016 bye-laws, IS 456 civil formulas, FY 2024-25 tax breakdown, SQL query plans, and 3D printing cost economics connected to 274+ free online tools."
        canonicalUrl="https://www.toolique.in/blog"
        keywords={['engineering blog', 'nbc 2016 calculations', 'is 456 concrete design', 'income tax slabs 2025', 'sql joins execution plan', '3d printing farm economics', 'price elasticity calculator']}
      />

      {/* Copy Toast Notification */}
      <AnimatePresence>
        {copiedSlug && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-[120] px-4 py-3 rounded-2xl bg-slate-900/95 text-white dark:bg-white dark:text-slate-900 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-bold border border-slate-700/50 dark:border-slate-200"
          >
            <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>Article guide link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Panel */}
      <div className="relative p-6 sm:p-10 md:p-12 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 shadow-2xl">
        {/* Glow ambient decoration */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Engineering &amp; Statutory Knowledge Base
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800/80 text-slate-300 border border-slate-700">
              Updated for 2025/2026 Codes
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Authoritative Guides &amp; Mathematical Blueprints
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl font-medium">
            Bridging statutory municipal standards (NBC 2016, IS 456), Union Budget tax frameworks, database execution plans, and additive manufacturing economics directly to <strong>274+ free browser-based tools</strong>.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 border-t border-slate-800/80 mt-6">
            <div className="space-y-0.5">
              <div className="text-lg sm:text-xl font-black text-white">{blogArticles.length} Master Guides</div>
              <div className="text-[11px] text-slate-400 font-medium">Peer-Reviewed</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg sm:text-xl font-black text-emerald-400">274+ Live Tools</div>
              <div className="text-[11px] text-slate-400 font-medium">Direct Sandboxes</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg sm:text-xl font-black text-indigo-400">100% Client-Side</div>
              <div className="text-[11px] text-slate-400 font-medium">Zero Telemetry</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-lg sm:text-xl font-black text-purple-400">Free Forever</div>
              <div className="text-[11px] text-slate-400 font-medium">No Paywalls</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Deep Dive Article Banner (If not filtered by bookmarks/tags) */}
      {!selectedTag && !showOnlyBookmarks && selectedCategory === 'all' && searchQuery.trim() === '' && featuredArticle && (
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950/30 via-slate-900/40 to-slate-900/90 border border-emerald-500/20 shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Featured Guide
                </span>
                <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredArticle.readTime}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getDifficultyBadge(featuredArticle.difficulty)}`}>
                  {featuredArticle.difficulty}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight hover:text-emerald-500 transition cursor-pointer" onClick={() => setActiveArticle(featuredArticle)}>
                {featuredArticle.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {featuredArticle.subtitle}
              </p>

              {/* Takeaways quick preview */}
              <div className="pt-2 space-y-1.5">
                {featuredArticle.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setActiveArticle(featuredArticle)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Read Full Blueprint</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to={featuredArticle.toolLink}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                <span>Launch {featuredArticle.toolName}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar Section */}
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulas, NBC codes, SQL plans, GST rules..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-semibold placeholder-slate-400 dark:placeholder-slate-500 shadow-xs transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Difficulty & Bookmark toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-2" />
              {['all', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedDifficulty(lvl)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition capitalize cursor-pointer ${
                    selectedDifficulty === lvl
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-black'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {lvl === 'all' ? 'All Levels' : lvl}
                </button>
              ))}
            </div>

            {/* Bookmarks Toggle */}
            <button
              type="button"
              onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
              className={`px-3.5 py-2 rounded-2xl text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                showOnlyBookmarks
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${showOnlyBookmarks ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>Saved Guides ({bookmarkedIds.length})</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {BLOG_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedTag(null);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-black'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                {renderCategoryIcon(cat.id, 'w-3.5 h-3.5')}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Tag Cloud */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0 mr-1">
            <Tag className="w-3 h-3" />
            Trending Tags:
          </span>
          {allTags.slice(0, 8).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-xl font-semibold transition shrink-0 cursor-pointer border ${
                selectedTag === tag
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold'
                  : 'bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/30'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Active Tag or Search Filter Indicator */}
        {(selectedTag || searchQuery || showOnlyBookmarks || selectedDifficulty !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
            <span>Active filters:</span>
            {selectedTag && (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {selectedTag}
                <button type="button" onClick={() => setSelectedTag(null)} className="ml-1 hover:text-emerald-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedDifficulty !== 'all' && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                Level: {selectedDifficulty}
                <button type="button" onClick={() => setSelectedDifficulty('all')} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {showOnlyBookmarks && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 font-bold flex items-center gap-1">
                Saved Bookmarks Only
                <button type="button" onClick={() => setShowOnlyBookmarks(false)} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                Search: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedTag(null);
                setShowOnlyBookmarks(false);
                setSearchQuery('');
              }}
              className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline font-semibold ml-2 cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Articles Grid list */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No matching technical guides found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, switching categories, or clearing active filters to browse all engineering articles.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedDifficulty('all');
              setSelectedTag(null);
              setShowOnlyBookmarks(false);
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((art) => {
            const theme = getCategoryTheme(art.categoryId);
            const isBookmarked = bookmarkedIds.includes(art.id);

            return (
              <div
                key={art.id}
                className="group relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Top Accent Gradient Bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`} />

                <div className="p-6 space-y-4">
                  {/* Category & Meta Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${theme.badge} flex items-center gap-1`}>
                        {renderCategoryIcon(art.categoryId, 'w-3 h-3')}
                        {art.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getDifficultyBadge(art.difficulty)}`}>
                        {art.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {art.readTime}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(art.id, e)}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-1.5">
                    <h3
                      onClick={() => setActiveArticle(art)}
                      className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition cursor-pointer"
                    >
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {art.excerpt}
                    </p>
                  </div>

                  {/* Key Takeaways preview */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Key Blueprint Takeaways:</div>
                    {art.keyTakeaways.slice(0, 2).map((takeaway, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{takeaway}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {art.tags.slice(0, 4).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTag(tag);
                        }}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <Link
                    to={art.toolLink}
                    className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Try: {art.toolName}</span>
                  </Link>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                    <button
                      type="button"
                      onClick={(e) => copyArticleLink(art, e)}
                      title="Copy link"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveArticle(art)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 hover:gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reader Modal Overlay */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 pt-16 sm:pt-20">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveArticle(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-4xl max-h-[calc(100vh-5.5rem)] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 text-left my-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-20 border-b border-slate-150 dark:border-slate-850 px-5 sm:px-6 py-4 sm:py-5 flex items-start justify-between gap-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shrink-0">
                <div className="space-y-1.5 pr-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getCategoryTheme(activeArticle.categoryId).badge}`}>
                      {activeArticle.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getDifficultyBadge(activeArticle.difficulty)}`}>
                      {activeArticle.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {activeArticle.readTime}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      • {activeArticle.publishedDate}
                    </span>
                  </div>

                  <h2 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                    {activeArticle.title}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(activeArticle.id)}
                    title={bookmarkedIds.includes(activeArticle.id) ? 'Remove bookmark' : 'Bookmark article'}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-500 transition cursor-pointer"
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarkedIds.includes(activeArticle.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => copyArticleLink(activeArticle)}
                    title="Share Guide Link"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveArticle(null)}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer ml-1 shadow-xs border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300">
                {/* Author info & subtitle */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                      AS
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{activeArticle.author.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{activeArticle.author.role} • Toolique Engineering</div>
                    </div>
                  </div>

                  <Link
                    to={activeArticle.toolLink}
                    onClick={() => setActiveArticle(null)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open {activeArticle.toolName}</span>
                  </Link>
                </div>

                {/* Subtitle */}
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic border-l-3 border-emerald-500 pl-3">
                  "{activeArticle.subtitle}"
                </p>

                {/* Key Takeaways Box */}
                <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    Key Statutory &amp; Engineering Rules
                  </h4>
                  <ul className="space-y-1.5">
                    {activeArticle.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Table of Contents */}
                {activeArticle.tableOfContents && activeArticle.tableOfContents.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Table of Contents:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {activeArticle.tableOfContents.map((toc) => (
                        <a
                          key={toc.id}
                          href={`#${toc.id}`}
                          className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition flex items-center gap-1"
                        >
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                          <span>{toc.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Article Content Rendered */}
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: activeArticle.contentHtml }}
                />

                {/* Tags in reader */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-bold mr-1">Filed Under:</span>
                  {activeArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-150 dark:border-slate-850 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
                <Link
                  to={activeArticle.toolLink}
                  onClick={() => setActiveArticle(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Launch {activeArticle.toolName}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => copyArticleLink(activeArticle)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Guide</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveArticle(null)}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
