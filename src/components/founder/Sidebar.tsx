import type { NavSection } from '../../types/founder';

interface SidebarProps {
  sections: NavSection[];
  activeSection: string;
  scrollToSection: (id: string) => void;
  scrollProgress: number;
}

export default function Sidebar({ sections, activeSection, scrollToSection, scrollProgress }: SidebarProps) {
  return (
    <div className="p-5 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-900/80 backdrop-blur-xl shadow-lg shadow-indigo-500/5 dark:shadow-none">
      
      {/* Reading Progress Indicator */}
      <div className="space-y-1.5 mb-5">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
          <span>Read Progress</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{Math.round(scrollProgress)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-500 transition-[width] duration-150 rounded-full"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </div>

      <h3 className="text-[11px] font-black text-zinc-900 dark:text-white tracking-wider uppercase mb-3 px-2 flex items-center justify-between">
        <span>Navigation</span>
        <span className="text-[9px] font-mono text-zinc-400 font-bold">{sections.length} SECTIONS</span>
      </h3>

      <nav className="flex flex-col gap-1">
        {sections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`flex items-center gap-2.5 text-left text-xs font-bold py-2.5 px-3 rounded-xl cursor-pointer transition-all duration-200 relative ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-2xs font-black'
                  : 'text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full" />
              )}
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
              <span className="truncate">{section.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}


