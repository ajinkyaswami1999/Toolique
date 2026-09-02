import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  Clock, 
  Search, 
  Trash2, 
  ArrowRight, 
  Star, 
  Compass
} from 'lucide-react';
import { getToolCanonicalPath } from '../../routes/AppRoutes';
import { 
  getRecentlyUsedToolsFromDB, 
  clearRecentlyUsedToolsFromDB, 
  formatRelativeTime,
  getFavoritesFromDB,
  toggleFavoriteInDB
} from '../../utils/indexedDB';
import type { RecentToolItem } from '../../utils/indexedDB';
import LucideIcon from '../LucideIcon';

interface RecentToolsPanelProps {
  onClose: () => void;
}

export default function RecentToolsPanel({ onClose }: RecentToolsPanelProps) {
  const [recentTools, setRecentTools] = useState<RecentToolItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load recent tools and favorites from DB & listen for live events
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [recents, favs] = await Promise.all([
          getRecentlyUsedToolsFromDB(),
          getFavoritesFromDB()
        ]);
        if (isMounted) {
          setRecentTools(recents);
          setFavoriteIds(favs);
        }
      } catch (err) {
        console.error('Error loading recent tools:', err);
      }
    };

    loadData();

    const handleRecentChange = () => {
      getRecentlyUsedToolsFromDB().then((recents) => {
        if (isMounted) setRecentTools(recents);
      });
    };

    const handleFavChange = () => {
      getFavoritesFromDB().then((favs) => {
        if (isMounted) setFavoriteIds(favs);
      });
    };

    window.addEventListener('toolique_recent_updated', handleRecentChange);
    window.addEventListener('toolique_favorites_updated', handleFavChange);
    window.addEventListener('storage', handleRecentChange);

    return () => {
      isMounted = false;
      window.removeEventListener('toolique_recent_updated', handleRecentChange);
      window.removeEventListener('toolique_favorites_updated', handleFavChange);
      window.removeEventListener('storage', handleRecentChange);
    };
  }, []);

  // Keyboard shortcut to close (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Toggle favorite for a tool
  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = await toggleFavoriteInDB(id);
    setFavoriteIds(updated);
  };

  // Clear all recent history
  const handleClearHistory = async () => {
    if (window.confirm('Clear all recently used tools history?')) {
      await clearRecentlyUsedToolsFromDB();
      setRecentTools([]);
    }
  };

  // Filtered tools by search query
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return recentTools;
    const q = searchQuery.toLowerCase();
    return recentTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.shortDescription && t.shortDescription.toLowerCase().includes(q))
    );
  }, [recentTools, searchQuery]);

  return (
    <div 
      className="toolique-recent-panel fixed bottom-24 right-6 sm:right-8 z-[100] w-[340px] sm:w-[420px] max-h-[540px] h-[520px] rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-purple-500/10 dark:shadow-black/50 flex flex-col overflow-hidden text-left animate-fadeIn scale-100 origin-bottom-right transition-all"
      role="dialog"
      aria-label="Recently Used Tools"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-white leading-none flex items-center gap-1.5">
              <span>Recently Used</span>
              {recentTools.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-extrabold">
                  {recentTools.length}
                </span>
              )}
            </h3>
            <span className="text-[9px] font-bold text-zinc-400">Stored locally in IndexedDB</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {recentTools.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              title="Clear Recent History"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      {recentTools.length > 0 && (
        <div className="p-3 bg-zinc-50/60 dark:bg-zinc-950/60 border-b border-zinc-100 dark:border-zinc-800/60 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recent tools..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-purple-500 transition placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tools List Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool) => {
            const canonicalUrl = getToolCanonicalPath(tool.category, tool.slug);
            const isFav = favoriteIds.includes(tool.id);

            return (
              <Link
                key={tool.id + tool.lastVisited}
                to={canonicalUrl}
                onClick={onClose}
                className="group p-2.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/60 hover:bg-purple-500/5 dark:hover:bg-purple-500/10 border border-zinc-200/60 dark:border-zinc-800/60 hover:border-purple-500/30 flex items-center justify-between gap-3 transition-all duration-150"
              >
                {/* Left: Icon & Tool Name */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-purple-500 group-hover:text-white transition-all duration-200">
                    <LucideIcon name={tool.icon || 'Wrench'} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {tool.name}
                    </h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-bold uppercase tracking-wider">
                        {tool.category}
                      </span>
                      <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium">
                        • {formatRelativeTime(tool.lastVisited)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavorite(tool.id, e)}
                    title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isFav 
                        ? 'text-amber-500 bg-amber-500/10' 
                        : 'text-zinc-300 dark:text-zinc-600 hover:text-amber-500 hover:bg-amber-500/10'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500' : ''}`} />
                  </button>

                  <div className="p-1 rounded-lg text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })
        ) : recentTools.length === 0 ? (
          /* Empty State */
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-zinc-900 dark:text-white">
                No Recently Used Tools
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-[240px] leading-relaxed">
                As you open and use tools across Toolique, your history will be automatically recorded here for instant access.
              </p>
            </div>
            <Link
              to="/tools"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore All Tools</span>
            </Link>
          </div>
        ) : (
          /* No search results */
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-400">
            <Search className="w-6 h-6 stroke-1" />
            <p className="text-xs font-semibold">No recent tools match "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Footer info */}
      {recentTools.length > 0 && (
        <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400 font-semibold shrink-0">
          <span>{recentTools.length} tool{recentTools.length > 1 ? 's' : ''} in local history</span>
          <Link
            to="/tools"
            onClick={onClose}
            className="text-purple-600 dark:text-purple-400 hover:underline font-bold"
          >
            Browse All &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
