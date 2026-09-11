import { memo } from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectsData } from '../../data/founder';
import type { Project } from '../../types/founder';

const ProjectCard = memo(function ProjectCard({ project, index }: { project: Project; index: number }) {
  const Icon = project.icon;
  const isExternal = project.url?.startsWith('http');

  return (
    <div className="relative group">
      {/* Ambient Gradient Glow */}
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-teal-500/30 opacity-0 group-hover:opacity-100 blur-md transition duration-500" />
      
      <div className="relative p-6 sm:p-7 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl shadow-2xs group-hover:shadow-xl group-hover:border-indigo-500/40 group-hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        
        {/* Project Visual Icon Container */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-teal-500/10 dark:from-indigo-500/20 dark:to-teal-500/20 flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:scale-105 transition-transform">
          <Icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>

        {/* Project Meta Content */}
        <div className="space-y-2.5 flex-grow text-left">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
              {project.name}
            </h3>
            {index === 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Flagship Platform
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal max-w-2xl">
            {project.desc}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tech.map(t => (
              <span
                key={t}
                className="px-2.5 py-0.5 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Launch Button */}
        <div className="shrink-0 w-full md:w-auto pt-2 md:pt-0">
          {isExternal ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="saas-button-secondary py-2.5 px-4 text-xs font-bold w-full md:w-auto inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-md"
            >
              <span>Visit Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <Link
              to={project.url || '/'}
              className="saas-button-secondary py-2.5 px-4 text-xs font-bold w-full md:w-auto inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-md"
            >
              <span>Launch Tool</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

      </div>
    </div>
  );
});

export default function Projects() {
  return (
    <div className="grid grid-cols-1 gap-5">
      {projectsData.map((project, idx) => (
        <ProjectCard key={project.name} project={project} index={idx} />
      ))}
    </div>
  );
}

