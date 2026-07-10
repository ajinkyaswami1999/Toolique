import type { NavSection } from '../../types/founder';

interface SidebarProps {
  sections: NavSection[];
  activeSection: string;
  scrollToSection: (id: string) => void;
  scrollProgress: number;
}

export default function Sidebar({ sections, activeSection, scrollToSection, scrollProgress }: SidebarProps) {
  return (
    <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
      <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md">
        <div className="h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 transition-[width] duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase mb-4 px-2">
          On This Page
        </h3>
        <nav className="flex flex-col gap-1.5">
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center gap-2 text-left text-xs font-bold py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {section.name}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
