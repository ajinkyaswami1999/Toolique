import { CheckCircle2, Compass, Target as TargetIcon, Zap } from 'lucide-react';
import { visionStatement, missionDetail, coreValues, funFacts } from '../../data/founder';

export default function Values() {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md space-y-3">
          <h3 className="flex items-center gap-2 text-base font-bold text-zinc-800 dark:text-white">
            <TargetIcon className="w-4 h-4 text-pink-500" /> Mission
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            {visionStatement}
          </p>
        </div>
        <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md space-y-3">
          <h3 className="flex items-center gap-2 text-base font-bold text-zinc-800 dark:text-white">
            <Compass className="w-4 h-4 text-indigo-500" /> Vision
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {missionDetail}
          </p>
        </div>
      </div>

      {/* Core Values grid */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-zinc-800 dark:text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" /> Core Values
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {coreValues.map(val => (
            <div
              key={val.title}
              className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-white/10 dark:bg-zinc-950/10 space-y-1 hover:-translate-y-0.5 hover:border-indigo-500/20 transition-all duration-300"
            >
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                {val.title}
              </h4>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
                {val.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Fun Facts grid */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-zinc-800 dark:text-white flex items-center gap-2">
          Fun Facts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {funFacts.map(fact => {
            const Icon = fact.icon;
            return (
              <div
                key={fact.title}
                className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800 bg-white/10 dark:bg-zinc-950/10 space-y-1.5 hover:-translate-y-0.5 hover:border-indigo-500/20 transition-all duration-300"
              >
                <Icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {fact.title}
                </h4>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
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
