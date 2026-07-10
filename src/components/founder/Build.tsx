import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { buildCategories } from '../../data/founder';
import type { BuildCategory } from '../../types/founder';

const BuildCategoryCard = memo(function BuildCategoryCard({ category }: { category: BuildCategory }) {
  const Icon = category.icon;
  return (
    <a href={category.path} className="relative group block">
      <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 opacity-0 group-hover:opacity-20 blur-sm transition duration-300" />
      <div className="relative p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 bg-white/20 dark:bg-zinc-950/20 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/30 transition-all duration-300 flex flex-col justify-between h-full">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 group-hover:bg-indigo-500/15 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
              <Icon className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition">
              {category.name}
            </h4>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
            {category.desc}
          </p>
        </div>
        <div className="flex items-center justify-end text-[10px] font-bold text-zinc-450 dark:text-zinc-600 group-hover:text-indigo-500 transition pt-3">
          Go To Category <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </a>
  );
});

export default function Build() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {buildCategories.map(category => (
        <BuildCategoryCard key={category.name} category={category} />
      ))}
    </div>
  );
}
