import { aboutHighlights } from '../../data/founder';

export default function About() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
      <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md space-y-4">
        <h3 className="text-lg font-bold text-zinc-800 dark:text-white">
          My Story
        </h3>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
          With over <strong>4+ years of quality engineering experience</strong>, I moved from validating other people's software to building my own — engineering functional products from scratch that run securely, instantly, and with zero subscription fees.
        </p>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Outside of code, I have a deep fascination with physical product design and <strong>3D printing</strong> — bridging software and hardware tinkering led me to start Voxelique alongside Toolique.
        </p>
      </div>

      <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md">
        <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-4">
          What I Bring
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {aboutHighlights.map(highlight => {
            const Icon = highlight.icon;
            return (
              <div
                key={highlight.label}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100/60 dark:bg-zinc-900/40 text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                <Icon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                {highlight.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
