import { memo } from 'react';
import { skillsData } from '../../data/founder';
import type { SkillCategory } from '../../types/founder';

const SkillCategoryCard = memo(function SkillCategoryCard({ category }: { category: SkillCategory }) {
  const Icon = category.icon;
  return (
    <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md space-y-3">
      <h4 className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        <Icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
        {category.category}
      </h4>
      <div className="flex flex-wrap gap-2">
        {category.skills.map(skill => (
          <span
            key={skill}
            className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/30 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition"
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
      {skillsData.map(category => (
        <SkillCategoryCard key={category.category} category={category} />
      ))}
    </div>
  );
}
