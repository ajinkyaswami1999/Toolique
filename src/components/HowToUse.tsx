import { Info } from 'lucide-react';

interface HowToUseProps {
  steps: string[];
  toolName: string;
}

export default function HowToUse({ steps, toolName }: HowToUseProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="mt-8 p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <h2 className="flex items-center gap-2.5 text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-6">
        <Info className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        How to Use the {toolName}
      </h2>
      <ol className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-6">
        {steps.map((step, index) => (
          <li key={index} className="mb-4 last:mb-0 ml-6">
            <span className="absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {index + 1}
            </span>
            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed pt-0.5">
              {step}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
