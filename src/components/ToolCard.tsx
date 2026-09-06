import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart } from 'lucide-react';
import type { Tool } from '../data/tools';
import { categories } from '../data/categories';
import LucideIcon from './LucideIcon';
import { useState, useEffect } from 'react';

interface ToolCardProps {
  tool: Tool;
}

import { getToolCanonicalPath } from '../routes/AppRoutes';

export default function ToolCard({ tool }: ToolCardProps) {
  const categoryInfo = categories.find((c) => c.id === tool.category);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    try {
      const favs = localStorage.getItem('toolique_favorites');
      if (favs) {
        const parsed = JSON.parse(favs);
        setIsFavorite(parsed.includes(tool.id));
      }
    } catch (e) {}
  }, [tool.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const favs = localStorage.getItem('toolique_favorites');
      let parsed = favs ? JSON.parse(favs) : [];
      if (parsed.includes(tool.id)) {
        parsed = parsed.filter((id: string) => id !== tool.id);
        setIsFavorite(false);
      } else {
        parsed.push(tool.id);
        setIsFavorite(true);
      }
      localStorage.setItem('toolique_favorites', JSON.stringify(parsed));
    } catch (e) {}
  };

  const isHeroTool = tool.id === 'BuildingFeasibilityChecker';

  return (
    <Link
      to={getToolCanonicalPath(tool.category, tool.slug)}
      className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border transition-all duration-300 transform hover:-translate-y-0.5 ${
        isHeroTool
          ? 'border-indigo-500/50 dark:border-indigo-500/40 shadow-[0_2px_12px_rgba(99,102,241,0.06)] ring-1 ring-indigo-500/20 bg-gradient-to-b from-indigo-500/[0.03] to-transparent'
          : 'border-zinc-200/70 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-indigo-500/40 dark:hover:border-indigo-500/40'
      } hover:shadow-[0_8px_30px_rgb(99,102,241,0.03)] dark:hover:shadow-[0_8px_30px_rgb(99,102,241,0.015)]`}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 group-hover:bg-indigo-500/10 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors duration-300">
            <LucideIcon name={tool.icon} className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            {isHeroTool && (
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                ★ Hero
              </span>
            )}
            {categoryInfo && (
              <span className={`text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-gradient-to-r ${categoryInfo.colorClass}`}>
                {categoryInfo.name}
              </span>
            )}
            <button
              type="button"
              onClick={toggleFavorite}
              className={`p-1.5 rounded-lg border hover:bg-zinc-50 dark:hover:bg-zinc-900 transition duration-300 cursor-pointer ${
                isFavorite
                  ? 'bg-rose-500/5 border-rose-500/10 text-rose-500'
                  : 'bg-white/40 dark:bg-zinc-900/30 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-400 hover:text-rose-500'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 mb-1.5">
          {tool.name}
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mb-3 line-clamp-2">
          {tool.shortDescription}
        </p>

        {/* Keywords/tags section */}
        {tool.keywords && tool.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tool.keywords.slice(0, 2).map((kw, idx) => (
              <span
                key={idx}
                className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 bg-zinc-100/50 dark:bg-zinc-900/40 px-2 py-0.5 rounded border border-zinc-200/10 dark:border-zinc-800/10 animate-fadeIn"
              >
                #{kw.split(' ')[0]}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        <span>Open Utility</span>
        <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
      </div>
    </Link>
  );
}
