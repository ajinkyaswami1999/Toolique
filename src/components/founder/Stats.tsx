import { motion } from 'framer-motion';
import { trustMetrics } from '../../data/founder';
import AnimatedCounter from './AnimatedCounter';

export default function Stats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {trustMetrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="saas-card saas-card-hover p-4 flex flex-col items-center justify-center text-center gap-1.5"
          >
            <Icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mb-1" />
            {metric.isBadge ? (
              <span className="text-sm font-black text-zinc-900 dark:text-white">{metric.label}</span>
            ) : (
              <>
                <span className="text-xl font-black text-zinc-900 dark:text-white">
                  <AnimatedCounter target={metric.value ?? 0} suffix={metric.suffix} />
                </span>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  {metric.label}
                </span>
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
