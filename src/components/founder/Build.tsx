import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildCategories } from '../../data/founder';
import type { BuildCategory } from '../../types/founder';

const BuildCategoryCard = memo(function BuildCategoryCard({ category }: { category: BuildCategory }) {
  const Icon = category.icon;
  return (
    <Link to={category.path} className="relative group block">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-indigo-500 to-teal-500 opacity-0 group-hover:opacity-20 blur-sm transition duration-300" />
      <div className="relative p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md hover:bg-white/90 dark:hover:bg-zinc-900/90 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full text-left space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-105 transition-all">
              <Icon className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-black text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
              {category.name}
            </h4>
          </div>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal">
            {category.desc}
          </p>
        </div>
        
        <div className="flex items-center justify-end text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition pt-2 border-t border-zinc-200/50 dark:border-zinc-800">
          <span>Explore Suite</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
});

export default function Build() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {buildCategories.map(category => (
        <BuildCategoryCard key={category.name} category={category} />
      ))}
    </div>
  );
}

