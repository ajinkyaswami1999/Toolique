import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
      className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-teal-500/30 dark:hover:border-teal-500/35 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-teal-500/10 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300`}>
            <LucideIcon name={tool.icon} className="w-6 h-6" />
          </div>
          {categoryInfo && (
            <span className={`text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border ${categoryInfo.colorClass}`}>
              {categoryInfo.name}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300 mb-2">
          {tool.name}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4">
          {tool.shortDescription}
        </p>
      </div>
      <div className="flex items-center text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-1.5 transition-transform duration-300">
        Use Tool <ArrowRight className="w-3.5 h-3.5 ml-1" />
      </div>
    </Link>
  );
}
