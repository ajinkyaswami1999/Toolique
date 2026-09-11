import { motion } from 'framer-motion';
import { trustMetrics } from '../../data/founder';
import AnimatedCounter from './AnimatedCounter';

export default function Stats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {trustMetrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="group relative p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-2xs hover:shadow-md hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between text-center overflow-hidden min-h-[110px]"
          >
            {/* Top Accent Line on Hover */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all">
              <Icon className="w-4 h-4" />
            </div>

            <div className="space-y-0.5 my-auto">
              {metric.isBadge ? (
                <div className="text-xs font-black text-zinc-900 dark:text-white leading-tight">
                  {metric.label}
                </div>
              ) : (
                <>
                  <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    <AnimatedCounter target={metric.value ?? 0} suffix={metric.suffix} />
                  </div>
                  <div className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                    {metric.label}
                  </div>
                </>
              )}
            </div>

            {metric.isBadge && (
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full">
                VERIFIED
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

