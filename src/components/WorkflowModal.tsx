import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  X, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink
} from 'lucide-react';
import type { Workflow } from '../data/workflows';
import { toolsList } from '../data/tools';
import { getToolCanonicalPath } from '../routes/AppRoutes';

interface WorkflowModalProps {
  workflow: Workflow;
  currentToolSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkflowModal({ workflow, currentToolSlug, isOpen, onClose }: WorkflowModalProps) {
  // Close on Escape key & lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    
    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const activeIdx = workflow.steps.findIndex((s) => s.slug === currentToolSlug);
  const nextStep = activeIdx < workflow.steps.length - 1 ? workflow.steps[activeIdx + 1] : null;
  const nextTool = nextStep ? toolsList.find((t) => t.id === nextStep.id) : null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Project Workflow Overview"
    >
      <div 
        className="w-full max-w-3xl rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl overflow-hidden text-left animate-fadeIn scale-100 flex flex-col max-h-[85vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider">
                Interactive Project Workflow
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
              {workflow.name}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-xl">
              {workflow.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-black uppercase">
              Step {activeIdx + 1} of {workflow.steps.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Journey */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Stepper Timeline Bar */}
          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 overflow-x-auto">
            <div className="flex items-start gap-4 min-w-[540px] md:min-w-0 md:grid md:grid-cols-5">
              {workflow.steps.map((step, idx) => {
                const isCompleted = idx < activeIdx;
                const isActive = idx === activeIdx;
                const stepTool = toolsList.find((t) => t.id === step.id);
                const path = stepTool ? getToolCanonicalPath(stepTool.category, stepTool.slug) : '#';

                return (
                  <div key={step.slug} className="flex-1 relative group text-center">
                    {/* Connecting Line */}
                    {idx < workflow.steps.length - 1 && (
                      <div className="absolute top-3.5 left-1/2 right-[-50%] h-[2px] bg-zinc-200 dark:bg-zinc-800 z-0 hidden md:block">
                        <div
                          className="h-full bg-indigo-500 transition-all duration-300"
                          style={{ width: isCompleted ? '100%' : '0%' }}
                        />
                      </div>
                    )}

                    <Link
                      to={path}
                      onClick={onClose}
                      className="flex flex-col items-center relative z-10 group hover:no-underline"
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition duration-300 ${
                          isCompleted
                            ? 'bg-indigo-600 text-white'
                            : isActive
                            ? 'bg-white dark:bg-zinc-900 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 ring-4 ring-indigo-500/15'
                            : 'bg-zinc-100 dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 text-zinc-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] font-bold mt-1.5 leading-snug truncate max-w-[90px] ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                            : isCompleted
                            ? 'text-zinc-700 dark:text-zinc-300'
                            : 'text-zinc-400 dark:text-zinc-500'
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

          {/* Detailed Steps List */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
              Project Workflow Steps
            </h3>
            <div className="space-y-2.5">
              {workflow.steps.map((step, idx) => {
                const isCompleted = idx < activeIdx;
                const isActive = idx === activeIdx;
                const stepTool = toolsList.find((t) => t.id === step.id);
                const path = stepTool ? getToolCanonicalPath(stepTool.category, stepTool.slug) : '#';

                return (
                  <div
                    key={step.slug}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-indigo-500/[0.06] border-indigo-500/40 shadow-xs'
                        : isCompleted
                        ? 'bg-zinc-50/60 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800/60'
                        : 'bg-white dark:bg-zinc-900/40 border-zinc-100 dark:border-zinc-850'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : isActive
                            ? 'bg-indigo-600 text-white font-black shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs font-bold truncate ${isActive ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-zinc-900 dark:text-white'}`}>
                            {step.title}
                          </h4>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-indigo-600 text-white">
                              Current Step
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-450 dark:text-zinc-500 font-medium truncate mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={path}
                      onClick={onClose}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 inline-flex items-center gap-1 ${
                        isActive
                          ? 'bg-indigo-600 text-white pointer-events-none opacity-80'
                          : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span>{isActive ? 'Active' : 'Open'}</span>
                      {!isActive && <ExternalLink className="w-3 h-3" />}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Up Next Banner */}
          {nextTool && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Ready to proceed? Up Next:
                </span>
                <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white">
                  {nextTool.name}
                </h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {nextTool.shortDescription}
                </p>
              </div>
              <Link
                to={getToolCanonicalPath(nextTool.category, nextTool.slug)}
                onClick={onClose}
                className="saas-button-primary inline-flex items-center gap-1.5 shrink-0 py-2 px-4 text-xs shadow-md"
              >
                <span>Launch Step {activeIdx + 2}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
