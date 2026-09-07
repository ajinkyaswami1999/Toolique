import { Info } from 'lucide-react';

interface HowToUseProps {
  steps: string[];
  toolName: string;
}

export default function HowToUse({ steps, toolName }: HowToUseProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="mt-8 p-6 md:p-8 rounded-3xl saas-card border border-zinc-200/70 dark:border-zinc-800/70 shadow-xs text-left">
      <h2 className="flex items-center gap-2.5 text-lg md:text-xl font-black text-zinc-900 dark:text-white mb-6">
        <div className="p-1.5 rounded-xl bg-pastel-indigo/30 text-indigo-600 dark:text-indigo-400 border border-pastel-indigo/50">
          <Info className="w-5 h-5" />
        </div>
        <span>How to Use the {toolName}</span>
      </h2>
      <ol className="relative border-l border-zinc-200/80 dark:border-zinc-800 ml-4 space-y-6">
        {steps.map((step, index) => (
          <li key={index} className="mb-4 last:mb-0 ml-6">
            <span className="absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full bg-pastel-indigo/35 dark:bg-indigo-950/60 border border-pastel-indigo/60 dark:border-indigo-800/80 text-xs font-black text-indigo-700 dark:text-indigo-300 shadow-xs">
              {index + 1}
            </span>
            <p className="text-zinc-650 dark:text-zinc-300 text-xs md:text-sm font-medium leading-relaxed pt-0.5">
              {step}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

