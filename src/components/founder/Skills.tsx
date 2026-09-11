import { memo } from 'react';
import { skillsData } from '../../data/founder';
import type { SkillCategory } from '../../types/founder';

const SkillCategoryCard = memo(function SkillCategoryCard({ category, index }: { category: SkillCategory; index: number }) {
  const Icon = category.icon;
  const colors = [
    'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    'text-sky-500 bg-sky-500/10 border-sky-500/20',
    'text-teal-500 bg-teal-500/10 border-teal-500/20',
    'text-purple-500 bg-purple-500/10 border-purple-500/20',
    'text-amber-500 bg-amber-500/10 border-amber-500/20'
  ];
  const colorClass = colors[index % colors.length];

  return (
    <div className="p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-2xs hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 space-y-4 text-left">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl border ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
          {category.category}
        </h4>
      </div>

      <div className="flex flex-wrap gap-2">
        {category.skills.map(skill => (
          <span
            key={skill}
            className="px-3 py-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-50/80 dark:bg-zinc-800/60 text-xs font-bold text-zinc-750 dark:text-zinc-250 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-[1.03] transition-all duration-200 cursor-default shadow-2xs"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
});

export default function Skills() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {skillsData.map((category, idx) => (
        <SkillCategoryCard key={category.category} category={category} index={idx} />
      ))}
    </div>
  );
}

