import { memo } from 'react';
import { motion } from 'framer-motion';
import { milestones } from '../../data/founder';
import type { Milestone } from '../../types/founder';

const MilestoneCard = memo(function MilestoneCard({ milestone, index }: { milestone: Milestone; index: number }) {
  const Icon = milestone.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative group"
    >
      <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-6 h-6 rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 group-hover:border-indigo-500 transition duration-300 flex items-center justify-center">
        <Icon className="w-3 h-3 text-zinc-400 dark:text-zinc-600 group-hover:text-indigo-500 transition" />
      </div>

      <div className="space-y-1.5 p-4 rounded-xl group-hover:bg-zinc-100/50 dark:group-hover:bg-zinc-900/40 group-hover:-translate-y-0.5 transition-all duration-300">
        <span className="inline-block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
          {milestone.year}
        </span>
        <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition">
          {milestone.title}
        </h4>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl">
          {milestone.desc}
        </p>
      </div>
    </motion.div>
  );
});

export default function Journey() {
  return (
    <div className="relative pl-8 sm:pl-10 border-l border-zinc-200 dark:border-zinc-800 space-y-2 ml-2 py-2">
      {milestones.map((milestone, idx) => (
        <MilestoneCard key={`${milestone.year}-${milestone.title}`} milestone={milestone} index={idx} />
      ))}
    </div>
  );
}
