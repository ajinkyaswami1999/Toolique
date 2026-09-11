import { useMemo } from 'react';
import { toolsList, type Tool } from '../data/tools';

const categoryGlowStyles: Record<string, { dot: string; cardDark: string }> = {
  finance: {
    dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    cardDark: 'dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:shadow-[0_0_16px_rgba(16,185,129,0.3)] dark:text-emerald-100'
  },
  civil: {
    dot: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',
    cardDark: 'dark:bg-sky-950/40 dark:border-sky-500/40 dark:shadow-[0_0_16px_rgba(56,189,248,0.3)] dark:text-sky-100'
  },
  architecture: {
    dot: 'bg-violet-400 shadow-[0_0_8px_#a78bfa]',
    cardDark: 'dark:bg-violet-950/40 dark:border-violet-500/40 dark:shadow-[0_0_16px_rgba(139,92,246,0.3)] dark:text-violet-100'
  },
  interior: {
    dot: 'bg-pink-400 shadow-[0_0_8px_#f472b6]',
    cardDark: 'dark:bg-pink-950/40 dark:border-pink-500/40 dark:shadow-[0_0_16px_rgba(244,114,182,0.3)] dark:text-pink-100'
  },
  electrical: {
    dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
    cardDark: 'dark:bg-amber-950/40 dark:border-amber-500/40 dark:shadow-[0_0_16px_rgba(245,158,11,0.3)] dark:text-amber-100'
  },
  pdf: {
    dot: 'bg-rose-400 shadow-[0_0_8px_#fb7185]',
    cardDark: 'dark:bg-rose-950/40 dark:border-rose-500/40 dark:shadow-[0_0_16px_rgba(244,63,94,0.3)] dark:text-rose-100'
  },
  image: {
    dot: 'bg-fuchsia-400 shadow-[0_0_8px_#e879f9]',
    cardDark: 'dark:bg-fuchsia-950/40 dark:border-fuchsia-500/40 dark:shadow-[0_0_16px_rgba(217,70,239,0.3)] dark:text-fuchsia-100'
  },
  developer: {
    dot: 'bg-indigo-400 shadow-[0_0_8px_#818cf8]',
    cardDark: 'dark:bg-indigo-950/40 dark:border-indigo-500/40 dark:shadow-[0_0_16px_rgba(99,102,241,0.3)] dark:text-indigo-100'
  },
  web: {
    dot: 'bg-blue-400 shadow-[0_0_8px_#60a5fa]',
    cardDark: 'dark:bg-blue-950/40 dark:border-blue-500/40 dark:shadow-[0_0_16px_rgba(59,130,246,0.3)] dark:text-blue-100'
  },
  text: {
    dot: 'bg-teal-400 shadow-[0_0_8px_#2dd4bf]',
    cardDark: 'dark:bg-teal-950/40 dark:border-teal-500/40 dark:shadow-[0_0_16px_rgba(20,184,166,0.3)] dark:text-teal-100'
  },
  social: {
    dot: 'bg-pink-400 shadow-[0_0_8px_#f472b6]',
    cardDark: 'dark:bg-pink-950/40 dark:border-pink-500/40 dark:shadow-[0_0_16px_rgba(236,72,153,0.3)] dark:text-pink-100'
  },
  datetime: {
    dot: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]',
    cardDark: 'dark:bg-cyan-950/40 dark:border-cyan-500/40 dark:shadow-[0_0_16px_rgba(6,182,212,0.3)] dark:text-cyan-100'
  },
  unit: {
    dot: 'bg-lime-400 shadow-[0_0_8px_#a3e635]',
    cardDark: 'dark:bg-lime-950/40 dark:border-lime-500/40 dark:shadow-[0_0_16px_rgba(132,204,22,0.3)] dark:text-lime-100'
  },
  security: {
    dot: 'bg-red-400 shadow-[0_0_8px_#f87171]',
    cardDark: 'dark:bg-red-950/40 dark:border-red-500/40 dark:shadow-[0_0_16px_rgba(239,68,68,0.3)] dark:text-red-100'
  },
  student: {
    dot: 'bg-purple-400 shadow-[0_0_8px_#c084fc]',
    cardDark: 'dark:bg-purple-950/40 dark:border-purple-500/40 dark:shadow-[0_0_16px_rgba(168,85,247,0.3)] dark:text-purple-100'
  },
  automobile: {
    dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    cardDark: 'dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:shadow-[0_0_16px_rgba(16,185,129,0.3)] dark:text-emerald-100'
  },
  business: {
    dot: 'bg-blue-400 shadow-[0_0_8px_#60a5fa]',
    cardDark: 'dark:bg-blue-950/40 dark:border-blue-500/40 dark:shadow-[0_0_16px_rgba(59,130,246,0.3)] dark:text-blue-100'
  },
  health: {
    dot: 'bg-rose-400 shadow-[0_0_8px_#fb7185]',
    cardDark: 'dark:bg-rose-950/40 dark:border-rose-500/40 dark:shadow-[0_0_16px_rgba(244,63,94,0.3)] dark:text-rose-100'
  },
  '3d-printing': {
    dot: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]',
    cardDark: 'dark:bg-cyan-950/40 dark:border-cyan-500/40 dark:shadow-[0_0_16px_rgba(6,182,212,0.3)] dark:text-cyan-100'
  },
  'math-studio': {
    dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
    cardDark: 'dark:bg-amber-950/40 dark:border-amber-500/40 dark:shadow-[0_0_16px_rgba(245,158,11,0.3)] dark:text-amber-100'
  },
  qa: {
    dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    cardDark: 'dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:shadow-[0_0_16px_rgba(16,185,129,0.3)] dark:text-emerald-100'
  },
  economics: {
    dot: 'bg-teal-400 shadow-[0_0_8px_#2dd4bf]',
    cardDark: 'dark:bg-teal-950/40 dark:border-teal-500/40 dark:shadow-[0_0_16px_rgba(20,184,166,0.3)] dark:text-teal-100'
  }
};

interface HeroToolsBackgroundProps {
  rowCount?: number;
}

export default function HeroToolsBackground({ rowCount = 6 }: HeroToolsBackgroundProps) {
  // Partition all 274+ tools across rows
  const rows = useMemo(() => {
    const splitRows: Tool[][] = Array.from({ length: rowCount }, () => []);
    toolsList.forEach((tool, index) => {
      splitRows[index % rowCount].push(tool);
    });
    return splitRows;
  }, [rowCount]);

  // Calmer, gentle floating animation speeds
  const durations = ['240s', '190s', '260s', '205s', '250s', '215s', '230s'];

  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0 opacity-40 dark:opacity-80 flex flex-col justify-between py-2 sm:py-4"
      style={{
        maskImage: 'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.28) 35%, rgba(0,0,0,0.95) 75%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.28) 35%, rgba(0,0,0,0.95) 75%, transparent 100%)'
      }}
      aria-hidden="true"
    >
      {rows.map((rowTools, rowIndex) => {
        const isReverse = rowIndex % 2 === 1; // Alternating direction: Row 0 -> left, Row 1 -> right, Row 2 -> left, etc.
        const animationClass = isReverse ? 'animate-marquee-right' : 'animate-marquee-left';
        const duration = durations[rowIndex % durations.length];

        // Duplicate the row to ensure seamless infinite looping without gaps
        const displayTools = [...rowTools, ...rowTools];

        return (
          <div key={rowIndex} className="overflow-hidden whitespace-nowrap py-1 sm:py-1.5 w-full">
            <div
              className={`flex items-center gap-4 sm:gap-6 ${animationClass}`}
              style={{ animationDuration: duration }}
            >
              {displayTools.map((tool, idx) => {
                const glow = categoryGlowStyles[tool.category] || categoryGlowStyles.developer;
                return (
                  <div
                    key={`${tool.id}-${idx}`}
                    className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-2xl text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap bg-white/70 border border-zinc-200/80 text-zinc-700 shadow-2xs backdrop-blur-xs transition-all ${glow.cardDark}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${glow.dot} shrink-0`} />
                    <span>{tool.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

