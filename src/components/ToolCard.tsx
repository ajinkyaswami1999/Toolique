import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart, Copy, Check } from 'lucide-react';
import type { Tool } from '../data/tools';
import { categories, type Category } from '../data/categories';
import LucideIcon from './LucideIcon';
import { getToolCanonicalPath } from '../routes/AppRoutes';

// Precomputed category map for O(1) instant lookups
const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  categories.map((c) => [c.id, c])
);

// Shared cached favorites Set across all tool cards to prevent redundant JSON parsing
let cachedFavorites: Set<string> | null = null;

function getFavoritesSet(): Set<string> {
  if (cachedFavorites !== null) return cachedFavorites;
  try {
    const favs = localStorage.getItem('toolique_favorites');
    cachedFavorites = new Set(favs ? JSON.parse(favs) : []);
  } catch {
    cachedFavorites = new Set();
  }
  return cachedFavorites;
}

const getToolBadge = (toolId: string) => {
  if (toolId === 'BuildingFeasibilityChecker') {
    return { text: '★ Hero', className: 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-500/30' };
  }
  if (['GSTCalculator', 'ConcreteCalculator', 'InHandSalaryCalculator', 'SIPCalculator', 'EMICalculator', 'PDFMerge', 'STLVolumeCalculator'].includes(toolId)) {
    return { text: 'Popular', className: 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' };
  }
  if (['FARFSICalculator', 'ModularKitchenCostCalculator', 'ImageCompressor', 'PrintFarmRevenueCalculator'].includes(toolId)) {
    return { text: 'Trending', className: 'bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-500/20' };
  }
  if (['PackagingCostCalculator', 'ScaleCalculator', 'LineWidthCalculator', 'PrintProfitCalculator', 'WardrobeCostCalculator', 'FalseCeilingCalculator'].includes(toolId)) {
    return { text: 'New', className: 'bg-cyan-500/10 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-500/20' };
  }
  return null;
};

interface ToolCardProps {
  tool: Tool;
  onTagClick?: (tag: string) => void;
}

function ToolCardComponent({ tool, onTagClick }: ToolCardProps) {
  const categoryInfo = CATEGORY_MAP[tool.category];
  const [isFavorite, setIsFavorite] = useState<boolean>(() => getFavoritesSet().has(tool.id));
  const [copied, setCopied] = useState(false);
  const badge = getToolBadge(tool.id);
  const canonicalPath = getToolCanonicalPath(tool.category, tool.slug);

  useEffect(() => {
    const handleFavChange = () => {
      setIsFavorite(getFavoritesSet().has(tool.id));
    };
    window.addEventListener('toolique_favorite_toggle', handleFavChange);
    return () => window.removeEventListener('toolique_favorite_toggle', handleFavChange);
  }, [tool.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const favSet = getFavoritesSet();
      if (favSet.has(tool.id)) {
        favSet.delete(tool.id);
        setIsFavorite(false);
      } else {
        favSet.add(tool.id);
        setIsFavorite(true);
      }
      localStorage.setItem('toolique_favorites', JSON.stringify(Array.from(favSet)));
      window.dispatchEvent(new CustomEvent('toolique_favorite_toggle'));
    } catch {}
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(`https://www.toolique.in${canonicalPath}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <Link
      to={canonicalPath}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-white/90 dark:bg-zinc-900/60 border transition-all duration-300 hover:-translate-y-1 active:scale-[0.99] text-left overflow-hidden ${
        badge?.text === '★ Hero'
          ? 'border-amber-300/80 dark:border-amber-500/40 shadow-[0_4px_20px_rgba(245,158,11,0.06)] bg-gradient-to-b from-amber-500/[0.03] to-transparent'
          : 'border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/40 dark:hover:border-indigo-400/30'
      } hover:shadow-[0_12px_28px_rgba(99,102,241,0.08)] dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)]`}
    >
      {/* Top subtle hover gradient ambient light */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08] rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/[0.09] transition-all duration-500 -z-10" />

      <div className="space-y-3.5">
        {/* Header: Icon + Category Badge + Actions */}
        <div className="flex justify-between items-start gap-2">
          <div className="p-2.5 rounded-xl bg-indigo-50/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 border border-indigo-100/60 dark:border-zinc-700/60 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300 shadow-2xs group-hover:scale-105 shrink-0">
            <LucideIcon name={tool.icon} className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {badge && (
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-2xs ${badge.className}`}>
                {badge.text}
              </span>
            )}
            {categoryInfo && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50">
                {categoryInfo.name}
              </span>
            )}
            <button
              type="button"
              onClick={toggleFavorite}
              className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                isFavorite
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-500 scale-105'
                  : 'bg-white/80 dark:bg-zinc-900/60 border-zinc-200/70 dark:border-zinc-800 text-zinc-400 hover:text-rose-500 hover:border-rose-200'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 transition-transform active:scale-125 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content: Title & Short Description */}
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 tracking-tight leading-snug line-clamp-1">
            {tool.name}
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium leading-relaxed line-clamp-2 min-h-[32px]">
            {tool.shortDescription}
          </p>
        </div>

        {/* Keywords / Feature Hashtags */}
        {tool.keywords && tool.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {tool.keywords.slice(0, 3).map((kw, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  if (onTagClick) {
                    e.preventDefault();
                    e.stopPropagation();
                    onTagClick(kw);
                  }
                }}
                className="text-[9.5px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100/70 dark:bg-zinc-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 px-2 py-0.5 rounded-md border border-zinc-200/50 dark:border-zinc-800/60 transition-colors"
              >
                #{kw.split(' ')[0]}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Quick Actions & Launch Button */}
      <div className="pt-3.5 mt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer flex items-center gap-1"
            title="Copy direct tool URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <span className="text-[9.5px] font-semibold text-zinc-400 dark:text-zinc-500 hidden sm:inline">
            100% Private
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10.5px] font-extrabold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
          <span>Launch Tool</span>
          <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
        </div>
      </div>
    </Link>
  );
}

const ToolCard = React.memo(ToolCardComponent);
export default ToolCard;
