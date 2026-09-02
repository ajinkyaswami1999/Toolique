import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  Star, 
  Search, 
  Trash2, 
  ExternalLink, 
  Compass, 
  Plus
} from 'lucide-react';
import { toolsList } from '../../data/tools';
import { categories } from '../../data/categories';
import { getToolCanonicalPath } from '../../routes/AppRoutes';
import { getFavoritesFromDB, toggleFavoriteInDB } from '../../utils/indexedDB';
import LucideIcon from '../LucideIcon';

interface FavoritesPanelProps {
  onClose: () => void;
}

export default function FavoritesPanel({ onClose }: FavoritesPanelProps) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [addSearchQuery, setAddSearchQuery] = useState<string>('');

  // Load favorites from DB & listen for global updates
  useEffect(() => {
    let isMounted = true;
    getFavoritesFromDB().then((ids) => {
      if (isMounted) setFavoriteIds(ids);
    });

    const handleStorageChange = () => {
      getFavoritesFromDB().then((ids) => {
        if (isMounted) setFavoriteIds(ids);
      });
    };

    window.addEventListener('toolique_favorites_updated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('toolique_favorites_updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Keyboard shortcut to close (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAdding) {
          setIsAdding(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isAdding]);

  // Remove or toggle favorite
  const handleToggle = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const updated = await toggleFavoriteInDB(id);
    setFavoriteIds(updated);
  };

  // Matched favorite tools
  const favoriteTools = toolsList.filter(t => favoriteIds.includes(t.id));
  const filteredFavorites = favoriteTools.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Available tools to add
  const availableToAdd = toolsList.filter(t => 
    !favoriteIds.includes(t.id) &&
    (t.name.toLowerCase().includes(addSearchQuery.toLowerCase()) ||
     t.category.toLowerCase().includes(addSearchQuery.toLowerCase()))
  ).slice(0, 8);

  return (
    <div 
      className="toolique-favorites-panel fixed bottom-24 right-6 sm:right-8 z-[100] w-[340px] sm:w-[400px] max-h-[520px] h-[500px] rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-indigo-500/10 dark:shadow-black/50 flex flex-col overflow-hidden text-left animate-fadeIn scale-100 origin-bottom-right transition-all"
      role="dialog"
      aria-label="Favorites Manager"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-white leading-none">
              Favorite Tools ({favoriteTools.length})
            </h3>
            <span className="text-[9px] font-bold text-zinc-400">Quick 1-click access</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            title={isAdding ? 'Close Search' : 'Add tool to favorites'}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 ${
              isAdding 
                ? 'bg-indigo-600 text-white' 
                : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span className="text-[10px]">Add</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Tool Drawer (if open) */}
      {isAdding && (
        <div className="p-3 bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200/60 dark:border-zinc-800/60 space-y-2 shrink-0 animate-fadeIn">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={addSearchQuery}
              onChange={(e) => setAddSearchQuery(e.target.value)}
              placeholder="Search 255+ tools to bookmark..."
              autoFocus
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1">
            {availableToAdd.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-850 hover:border-indigo-500/30 transition text-xs"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                    <LucideIcon name={tool.icon} size={12} />
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white truncate text-[11px]">
                    {tool.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(tool.id)}
                  className="px-2 py-0.5 rounded-md bg-indigo-500/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 text-[10px] font-black shrink-0 transition"
                >
                  + Star
                </button>
              </div>
            ))}
            {availableToAdd.length === 0 && (
              <div className="text-[11px] text-zinc-400 text-center py-2">
                No matching tools found to add.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter inside favorites */}
      {favoriteTools.length > 3 && !isAdding && (
        <div className="p-2.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-transparent shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter your favorites..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-400"
            />
          </div>
        </div>
      )}

      {/* Favorites List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {filteredFavorites.map((tool) => {
          const categoryObj = categories.find((c) => c.id === tool.category);
          const categoryName = categoryObj ? categoryObj.name : tool.category;
          const canonicalPath = getToolCanonicalPath(tool.category, tool.slug);

          return (
            <div
              key={tool.id}
              className="group p-3 rounded-2xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/60 hover:border-indigo-500/40 hover:bg-white dark:hover:bg-zinc-900 transition flex items-center justify-between gap-3 shadow-xs"
            >
              <Link
                to={canonicalPath}
                onClick={onClose}
                className="flex items-center gap-2.5 flex-1 min-w-0"
              >
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <LucideIcon name={tool.icon} size={15} />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h4>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">
                    {categoryName}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to={canonicalPath}
                  onClick={onClose}
                  title="Open tool"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={(e) => handleToggle(tool.id, e)}
                  title="Remove from favorites"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {favoriteTools.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500 animate-pulse" />
            </div>
            <div className="space-y-1 max-w-[240px]">
              <h4 className="text-xs font-black text-zinc-900 dark:text-white">
                No favorites yet
              </h4>
              <p className="text-[11px] text-zinc-450 font-medium leading-relaxed">
                Save your frequently used tools for quick 1-click access anytime.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2 w-full max-w-[200px]">
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
              >
                + Add Favorite Tool
              </button>
              <Link
                to="/tools"
                onClick={onClose}
                className="w-full py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold transition text-center"
              >
                Browse Directory
              </Link>
            </div>
          </div>
        )}

        {/* No Filter Results */}
        {favoriteTools.length > 0 && filteredFavorites.length === 0 && (
          <div className="py-8 text-center text-xs text-zinc-400 font-medium">
            No favorite tools matched "{searchQuery}"
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between text-[10px] font-bold text-zinc-400 shrink-0">
        <span>Stored locally in IndexedDB</span>
        <Link 
          to="/tools" 
          onClick={onClose}
          className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
        >
          <span>All Tools</span>
          <Compass className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
