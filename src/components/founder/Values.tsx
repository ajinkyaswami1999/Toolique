import { CheckCircle2, Compass, Target as TargetIcon, Zap, Sparkles } from 'lucide-react';
import { visionStatement, missionDetail, coreValues, funFacts } from '../../data/founder';

export default function Values() {
  return (
    <div className="space-y-10 text-left">
      
      {/* Mission & Vision Dual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
                <TargetIcon className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                The Mission
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal">
              {visionStatement}
            </p>
          </div>
          <div className="text-[10px] font-mono font-bold text-pink-600 dark:text-pink-400 uppercase tracking-widest pt-2">
            ● 100% FREE & ACCESSIBLE
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                The Philosophy
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal">
              {missionDetail}
            </p>
          </div>
          <div className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest pt-2">
            ● ZERO TRACKING · PRIVACY BY DESIGN
          </div>
        </div>
      </div>

      {/* Core Values grid */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
            Engineering Principles
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreValues.map(val => (
            <div
              key={val.title}
              className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md space-y-2 hover:-translate-y-0.5 hover:border-indigo-500/30 shadow-2xs hover:shadow-md transition-all duration-300"
            >
              <h4 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                {val.title}
              </h4>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal">
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Maker Spirit & Fun Facts */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white">
            Behind the Scenes & Maker Mindset
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {funFacts.map(fact => {
            const Icon = fact.icon;
            return (
              <div
                key={fact.title}
                className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md space-y-2 hover:-translate-y-0.5 hover:border-purple-500/30 shadow-2xs hover:shadow-md transition-all duration-300"
              >
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black text-zinc-900 dark:text-white">
                  {fact.title}
                </h4>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal">
                  {fact.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

