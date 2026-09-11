import { aboutHighlights } from '../../data/founder';
import { Quote, Sparkles, Terminal, Code2, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Main Narrative Card */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Terminal className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                Engineering from First Principles
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal">
              With over <strong>4+ years of quality engineering & automation experience</strong>, my career began with finding the breaking points in large-scale software systems. That deep obsession with precision, testability, and edge cases naturally led me to become a builder myself.
            </p>
            
            <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal">
              Today, I channel that rigor into engineering <strong>Toolique</strong> — a lightning-fast, zero-tracking ecosystem of 274+ tools where every calculation runs completely in the user's browser RAM without sending a single byte of sensitive user data to external servers.
            </p>

            <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal">
              Beyond pure software, I run <strong>Voxelique</strong> — a custom 3D printing and hardware prototyping studio where digital 3D models translate into precision physical engineering parts, creative décor, and bespoke maker products.
            </p>
          </div>

          {/* Quote Strip */}
          <div className="relative p-4 rounded-2xl bg-gradient-to-r from-indigo-500/5 via-teal-500/5 to-purple-500/5 border border-indigo-500/15 text-left mt-4">
            <Quote className="w-5 h-5 text-indigo-500/40 absolute top-3 right-3" />
            <p className="text-xs italic text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed pr-6">
              "Quality engineering isn't just about finding bugs — it's about engineering software so fast, private, and deterministic that users get instant value with zero friction."
            </p>
          </div>
        </div>

        {/* Disciplines & Core Competencies */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                Core Disciplines
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {aboutHighlights.map(highlight => {
                const Icon = highlight.icon;
                return (
                  <div
                    key={highlight.label}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition duration-200 group"
                  >
                    <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {highlight.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-[11px] font-bold text-zinc-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> DPDP 2023 Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-500" /> Full-Stack SDET
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

