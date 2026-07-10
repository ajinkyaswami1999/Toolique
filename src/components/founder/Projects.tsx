import { memo } from 'react';
import { ExternalLink } from 'lucide-react';
import { projectsData } from '../../data/founder';
import type { Project } from '../../types/founder';

const ProjectCard = memo(function ProjectCard({ project }: { project: Project }) {
  const Icon = project.icon;
  return (
    <div className="relative group">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-indigo-500 to-teal-500 opacity-0 group-hover:opacity-20 blur-sm transition duration-300" />
      <div className="relative p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md flex flex-col md:flex-row gap-6 items-stretch justify-between hover:-translate-y-0.5 transition-all duration-300">
        <div className="h-32 md:h-auto md:w-40 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-teal-500/10 flex items-center justify-center">
          <Icon className="w-10 h-10 text-indigo-500/60 dark:text-indigo-400/60" />
        </div>

        <div className="space-y-3 flex-grow">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
            {project.name}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {project.desc}
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            {project.tech.map(t => (
              <span
                key={t}
                className="px-2 py-0.5 rounded bg-zinc-200/40 dark:bg-zinc-900/60 text-[9px] font-bold text-zinc-500 dark:text-zinc-400"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 flex items-end md:items-center">
          <a
            href={project.url}
            target={project.url?.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="saas-button-secondary py-2 px-4 text-xs w-full md:w-auto"
          >
            Visit Project <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
});

export default function Projects() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {projectsData.map(project => (
        <ProjectCard key={project.name} project={project} />
      ))}
    </div>
  );
}
