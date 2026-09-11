import { memo } from 'react';
import { motion } from 'framer-motion';
import { milestones } from '../../data/founder';
import type { Milestone } from '../../types/founder';

const MilestoneCard = memo(function MilestoneCard({ milestone, index }: { milestone: Milestone; index: number }) {
  const Icon = milestone.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="relative group pl-6 sm:pl-8"
    >
      {/* Node circle on timeline */}
      <div className="absolute -left-[17px] top-4 w-8 h-8 rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 group-hover:border-indigo-500 group-hover:scale-110 shadow-sm transition duration-300 flex items-center justify-center z-10">
        <Icon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-500 transition" />
      </div>

      <div className="p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs group-hover:shadow-md group-hover:border-indigo-500/30 group-hover:-translate-y-0.5 transition-all duration-300 text-left space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black font-mono tracking-wider">
            {milestone.year}
          </span>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            MILESTONE #{index + 1}
          </span>
        </div>

        <h4 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
          {milestone.title}
        </h4>

        <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal">
          {milestone.desc}
        </p>
      </div>
    </motion.div>
  );
});

export default function Journey() {
  return (
    <div className="relative pl-3 sm:pl-4 border-l-2 border-indigo-500/20 dark:border-indigo-500/15 space-y-6 ml-3 sm:ml-4 py-2">
      {milestones.map((milestone, idx) => (
        <MilestoneCard key={`${milestone.year}-${milestone.title}`} milestone={milestone} index={idx} />
      ))}
    </div>
  );
}

