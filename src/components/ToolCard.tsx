import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Tool } from '../data/tools';
import { categories } from '../data/categories';
import LucideIcon from './LucideIcon';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const categoryInfo = categories.find((c) => c.id === tool.category);

  return (
    <Link
      to={`/tool/${tool.slug}`}
      className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:shadow-[0_8px_30px_rgb(99,102,241,0.03)] dark:hover:shadow-[0_8px_30px_rgb(99,102,241,0.015)] transition-all duration-300 transform hover:-translate-y-0.5"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 group-hover:bg-indigo-500/10 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors duration-300">
            <LucideIcon name={tool.icon} className="w-5 h-5" />
          </div>
          {categoryInfo && (
            <span className={`text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-gradient-to-r ${categoryInfo.colorClass}`}>
              {categoryInfo.name}
            </span>
          )}
        </div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 mb-1.5">
          {tool.name}
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mb-4 line-clamp-2">
          {tool.shortDescription}
        </p>
      </div>
      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        <span>Open Utility</span>
        <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
      </div>
    </Link>
  );
}
