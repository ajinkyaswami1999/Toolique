import { Link } from 'react-router-dom';
import { toolsList } from '../data/tools';
import ToolCard from './ToolCard';
import { getToolWorkflows } from '../data/workflows';
import { getToolCanonicalPath } from '../routes/AppRoutes';
import { ArrowRight, CheckCircle2, Layers } from 'lucide-react';

interface RelatedToolsProps {
  currentToolSlug: string;
  category: string;
  stepperOnly?: boolean;
}

export default function RelatedTools({ currentToolSlug, category, stepperOnly = false }: RelatedToolsProps) {
  const toolWorkflows = getToolWorkflows(currentToolSlug);
  const hasWorkflow = toolWorkflows.length > 0;

  // 1. If we only want the stepper, render nothing if there is no workflow
  if (stepperOnly) {
    if (!hasWorkflow) return null;

    return (
      <div className="space-y-6 mt-4 mb-8">
        {toolWorkflows.map((workflow) => {
          const activeIdx = workflow.steps.findIndex(
            (step) => step.slug === currentToolSlug
          );
          const nextStep = activeIdx < workflow.steps.length - 1 ? workflow.steps[activeIdx + 1] : null;
          const nextTool = nextStep ? toolsList.find((t) => t.id === nextStep.id) : null;

          return (
            <section
              key={workflow.id}
              className="p-6 md:p-8 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 space-y-6 text-left"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400">
                    <Layers className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      Interactive Project Workflow
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    {workflow.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-450 font-medium">
                    {workflow.description}
                  </p>
                </div>
                <div className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/10 text-[10px] font-black uppercase shrink-0">
                  Step {activeIdx + 1} of {workflow.steps.length}
                </div>
              </div>

              {/* Stepper Steps (Timeline) */}
              <div className="overflow-x-auto pb-2">
                <div className="flex items-start gap-4 min-w-[700px] md:min-w-0 md:grid md:grid-cols-8">
                  {workflow.steps.map((step, idx) => {
                    const isCompleted = idx < activeIdx;
                    const isActive = idx === activeIdx;
                    
                    const stepTool = toolsList.find((t) => t.id === step.id);
                    const path = stepTool ? getToolCanonicalPath(stepTool.category, stepTool.slug) : '#';

                    return (
                      <div key={step.slug} className="flex-1 relative group text-center">
                        {/* Connecting Line (except for last step) */}
                        {idx < workflow.steps.length - 1 && (
                          <div className="absolute top-4 left-1/2 right-[-50%] h-[2px] bg-zinc-200 dark:bg-zinc-800 z-0 hidden md:block">
                            <div
                              className="h-full bg-indigo-500 transition-all duration-300"
                              style={{ width: isCompleted ? '100%' : '0%' }}
                            />
                          </div>
                        )}

                        {/* Step Card / Node */}
                        <Link
                          to={path}
                          className="flex flex-col items-center relative z-10 group hover:no-underline"
                        >
                          {/* Node Icon/Number */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition duration-300 ${
                              isCompleted
                                ? 'bg-indigo-500 text-white'
                                : isActive
                                ? 'bg-white dark:bg-zinc-950 border-2 border-indigo-500 text-indigo-655 dark:text-indigo-400 ring-4 ring-indigo-500/10'
                                : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:border-zinc-350'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              idx + 1
                            )}
                          </div>

                          {/* Node Label */}
                          <span
                            className={`text-[10px] font-bold mt-2.5 leading-snug px-1 px-1.5 transition duration-300 ${
                              isActive
                                ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                                : isCompleted
                                ? 'text-zinc-700 dark:text-zinc-350 font-medium'
                                : 'text-zinc-400 dark:text-zinc-650 font-medium group-hover:text-zinc-500'
                            }`}
                          >
                            {step.title}
                          </span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Step Call-To-Action Banner */}
              {nextTool && (
                <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Up Next
                    </span>
                    <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white leading-none">
                      {nextTool.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-450 leading-relaxed font-medium mt-1">
                      {nextTool.shortDescription}
                    </p>
                  </div>
                  <Link
                    to={getToolCanonicalPath(nextTool.category, nextTool.slug)}
                    className="saas-button-primary inline-flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center py-2 text-xs"
                  >
                    <span>Proceed to Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </section>
          );
        })}
      </div>
    );
  }

  // 2. If we want standard related cards (bottom), render nothing if there is a workflow (since it was already rendered at the top)
  if (hasWorkflow) return null;

  // Fallback category-based related tools list
  let related = toolsList.filter(
    (t) => t.category === category && t.slug !== currentToolSlug
  );

  if (related.length < 3) {
    const extra = toolsList.filter(
      (t) => t.slug !== currentToolSlug && !related.some((r) => r.slug === t.slug)
    );
    related = [...related, ...extra].slice(0, 3);
  } else {
    related = related.slice(0, 3);
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-6">
        Related Tools You Might Find Useful
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
