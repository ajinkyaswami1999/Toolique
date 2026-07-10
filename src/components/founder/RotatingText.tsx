import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface RotatingTextProps {
  words: string[];
  intervalMs?: number;
  className?: string;
}

export default function RotatingText({ words, intervalMs = 2500, className }: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs]);

  return (
    <span className={`inline-block min-h-[1.5rem] sm:min-h-[1.75rem] overflow-hidden align-bottom ${className ?? ''}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="inline-block bg-gradient-to-r from-indigo-500 to-teal-500 bg-clip-text text-transparent"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
