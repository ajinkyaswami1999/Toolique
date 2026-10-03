import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Search, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown, 
  Compass, 
  IndianRupee, 
  Code2, 
  ShieldCheck, 
  Printer, 
  Scale, 
  TrendingUp, 
  Boxes, 
  CheckCircle2, 
  Workflow as WorkflowIcon, 
  Star, 
  LayoutGrid, 
  ListFilter, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  Eye, 
  X 
} from 'lucide-react';
import SEO from '../components/SEO';
import { workflows, workflowCategories, type Workflow } from '../data/workflows';
import { toolsList } from '../data/tools';
import { getToolCanonicalPath } from '../routes/AppRoutes';

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Compass,
  IndianRupee,
  Code2,
  ShieldCheck,
  Printer,
  Scale,
  TrendingUp
};

const quickSearchChips = [
  'Plot to BOQ',
  'Salary & Income Tax',
  'REST API & JWT',
  '3D Spool Pricing',
  'Calculus Analysis',
  'Technical SEO',
  'Manual Test Case',
  'Structural RCC'
];

const faqs = [
  {
    question: 'What are Multi-Step Project Workflows?',
    answer: 'Workflows connect specialized calculators, developer formatters, and engineering utilities into ordered, cohesive pipelines. Instead of searching for individual tools one by one, workflows guide you step-by-step from raw project parameters (like land area or API payloads) to verified outputs and Bills of Quantities (BOQ).'
  },
  {
    question: 'Is any project data stored on Toolique servers during a workflow?',
    answer: 'No. All calculations, parameter transformations, formatters, and diagram generations execute 100% locally in your web browser memory (RAM). No data is logged, sent to external servers, or tracked.'
  },
  {
    question: 'Can I jump between steps or do I have to execute them in order?',
    answer: 'You have complete freedom. You can launch Step 1 to follow the guided sequence or directly open any intermediate step (e.g. jumping straight to BOQ or JWT inspection) from the workflow cards.'
  },
  {
    question: 'How do I track and resume my workflow progress?',
    answer: 'Toolique saves your completed workflow steps automatically in local browser storage. You can check off steps as you complete them, view your completion percentage, and click "Resume Pipeline" to jump directly to your next step.'
  }
];

export default function WorkflowsHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'steps-desc' | 'steps-asc' | 'alpha'>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'lane'>('grid');
  const [onlySaved, setOnlySaved] = useState<boolean>(false);
  const [expandedWorkflowId, setExpandedWorkflowId] = useState<string | null>(null);
  const [previewWorkflow, setPreviewWorkflow] = useState<Workflow | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Local storage: Bookmarked / Saved Workflows
  const [savedWorkflows, setSavedWorkflows] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('toolique_saved_workflows');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Local storage: Completed Steps per Workflow
  const [completedSteps, setCompletedSteps] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('toolique_workflow_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Lock body scroll and listen for Escape key when preview modal is open
  useEffect(() => {
    if (previewWorkflow) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setPreviewWorkflow(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [previewWorkflow]);

  // Save bookmarked workflows to local storage
  const toggleSaveWorkflow = (workflowId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSavedWorkflows((prev) => {
      const updated = prev.includes(workflowId) 
        ? prev.filter(id => id !== workflowId) 
        : [...prev, workflowId];
      try {
        localStorage.setItem('toolique_saved_workflows', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Toggle step completion manually
  const toggleStepCompleted = (workflowId: string, stepSlug: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCompletedSteps((prev) => {
      const current = prev[workflowId] || [];
      const updatedList = current.includes(stepSlug)
        ? current.filter(s => s !== stepSlug)
        : [...current, stepSlug];
      const updated = { ...prev, [workflowId]: updatedList };
      try {
        localStorage.setItem('toolique_workflow_progress', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Reset workflow progress
  const resetWorkflowProgress = (workflowId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCompletedSteps((prev) => {
      const updated = { ...prev, [workflowId]: [] };
      try {
        localStorage.setItem('toolique_workflow_progress', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Filter & Sort workflows
  const filteredWorkflows = useMemo(() => {
    return workflows
      .filter((w) => {
        const matchesCategory = selectedCategory === 'all' || w.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'all' || w.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
        const matchesSaved = !onlySaved || savedWorkflows.includes(w.id);
        
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || (
          w.name.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.categoryLabel.toLowerCase().includes(q) ||
          w.steps.some(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
        );

        return matchesCategory && matchesDifficulty && matchesSaved && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'steps-desc') return b.steps.length - a.steps.length;
        if (sortBy === 'steps-asc') return a.steps.length - b.steps.length;
        if (sortBy === 'alpha') return a.name.localeCompare(b.name);
        return 0; // Default recommended order
      });
  }, [searchQuery, selectedCategory, selectedDifficulty, onlySaved, savedWorkflows, sortBy]);

  // Copy workflow share link
  const handleCopyLink = (workflowId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = `${window.location.origin}/workflows#${workflowId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(workflowId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Structured Schema Markup
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://www.toolique.in/workflows#collection',
        'name': 'Multi-Step Project Workflows & Engineering Pipelines | Toolique',
        'description': 'Connect multiple calculators, developer formatters, and engineering utilities into cohesive multi-step project pipelines.',
        'url': 'https://www.toolique.in/workflows',
        'mainEntity': {
          '@type': 'ItemList',
          'name': 'Curated Project Workflows Directory',
          'numberOfItems': workflows.length,
          'itemListElement': workflows.map((w, idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'name': w.name,
            'description': w.description,
            'url': `https://www.toolique.in/workflows#${w.id}`
          }))
        }
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.toolique.in/workflows#faq',
        'mainEntity': faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      }
    ]
  };

  const totalConnectedTools = useMemo(() => {
    const uniqueSlugs = new Set<string>();
    workflows.forEach(w => w.steps.forEach(s => uniqueSlugs.add(s.slug)));
    return uniqueSlugs.size;
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <SEO
        title="Multi-Step Project Workflows & Calculation Pipelines"
        description="Connect multiple calculators, developer formatters, and engineering utilities together into cohesive step-by-step project pipelines. 100% private, browser-based, and ad-free."
        keywords={[
          'project workflows',
          'multi-step calculators',
          'engineering pipelines',
          'developer workflows',
          'civil construction workflow',
          'api testing pipeline',
          'finance planning workflow'
        ]}
        canonicalUrl="https://www.toolique.in/workflows"
        schemaMarkup={schemaMarkup}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-6 md:pt-8 md:pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-white via-indigo-50/20 to-zinc-50 dark:from-zinc-900 dark:via-zinc-900/50 dark:to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] dark:opacity-[0.07] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[11px] font-black uppercase tracking-wider mb-2 animate-fadeIn">
            <WorkflowIcon className="w-3.5 h-3.5" />
            <span>Interactive Tool Pipelines</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight max-w-3xl mx-auto">
            Multi-Step Project <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-teal-500">Workflows</span>
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Connect multiple calculators, structural design tools, and developer formatters together into cohesive, step-by-step project pipelines.
          </p>

          {/* Compact Quick Metrics Strip */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <strong className="text-indigo-600 dark:text-indigo-400">{workflows.length}+</strong> Pipelines
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span>
              <strong className="text-violet-600 dark:text-violet-400">{totalConnectedTools}+</strong> Connected Tools
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <strong className="text-emerald-600 dark:text-emerald-400">100%</strong> In-Memory RAM
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <strong className="text-teal-600 dark:text-teal-400">0 Bytes</strong> Server Upload
            </span>
          </div>

          {/* Quick Search Suggestion Chips */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 mr-1 hidden sm:inline">Popular:</span>
            {quickSearchChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setSearchQuery(chip)}
                className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200/60 dark:border-zinc-700/60 transition"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Workflows Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        {/* Search & Filter Toolbar */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workflows, tools, or step titles (e.g. FAR, BOQ, JWT, SIP, RCC)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Controls Right: Saved, Difficulty, Sort & View Mode */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Starred / Saved Filter */}
              <button
                type="button"
                onClick={() => setOnlySaved(prev => !prev)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  onlySaved
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title="Filter by Starred Workflows"
              >
                <Star className={`w-3.5 h-3.5 ${onlySaved ? 'fill-current' : 'text-amber-500'}`} />
                <span>Saved ({savedWorkflows.length})</span>
              </button>

              {/* Difficulty Scope Filter */}
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl">
                {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedDifficulty(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
                      selectedDifficulty === lvl
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="steps-desc">Sort: Most Steps</option>
                  <option value="steps-asc">Sort: Quickest (Fewest Steps)</option>
                  <option value="alpha">Sort: Alphabetical</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('lane')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'lane'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                  }`}
                  title="Expanded Linear Pipeline View"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Domain Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>All Pipelines ({workflows.length})</span>
            </button>

            {workflowCategories.map((cat) => {
              const Icon = categoryIconMap[cat.icon] || Boxes;
              const count = workflows.filter(w => w.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workflows List */}
        {filteredWorkflows.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
            <WorkflowIcon className="w-10 h-10 mx-auto text-zinc-400 mb-3" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">No matching workflows found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              Try adjusting your query or resetting your active category filters to explore all available pipelines.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedDifficulty('all'); setOnlySaved(false); }}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ==================================================================== */
          /* 1. GRID VIEW                                                         */
          /* ==================================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredWorkflows.map((wf) => {
              const isExpanded = expandedWorkflowId === wf.id;
              const isSaved = savedWorkflows.includes(wf.id);
              const doneSteps = completedSteps[wf.id] || [];
              const progressPct = Math.round((doneSteps.length / wf.steps.length) * 100);
              
              // Determine next step
              const nextIncompleteStep = wf.steps.find(s => !doneSteps.includes(s.slug)) || wf.steps[0];
              const nextTool = toolsList.find(t => t.id === nextIncompleteStep?.id);
              const nextToolPath = nextTool ? getToolCanonicalPath(nextTool.category, nextTool.slug) : '#';

              return (
                <div
                  key={wf.id}
                  id={wf.id}
                  className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden group relative"
                >
                  {/* Top Workflow Header */}
                  <div className="p-5 space-y-3.5">
                    
                    {/* Badge & Action Header */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-gradient-to-r ${wf.highlightColor}`}>
                          {wf.categoryLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                          {wf.difficulty}
                        </span>
                        {doneSteps.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{doneSteps.length}/{wf.steps.length} Done ({progressPct}%)</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium mr-1">
                          <Clock className="w-3 h-3" />
                          <span>{wf.estimatedTime}</span>
                        </div>
                        {/* Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleSaveWorkflow(wf.id, e)}
                          className={`p-1.5 rounded-xl border transition ${
                            isSaved
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-500'
                              : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-amber-500'
                          }`}
                          title={isSaved ? 'Remove from Saved' : 'Save Pipeline'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {wf.name}
                      </h2>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                        {wf.description}
                      </p>
                    </div>

                    {/* Progress Bar (if active) */}
                    {doneSteps.length > 0 && (
                      <div className="space-y-1">
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Stepper Pipeline Flow Node Strip */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                        <span className="flex items-center gap-1">
                          <WorkflowIcon className="w-3 h-3 text-indigo-500" />
                          Pipeline Sequence ({wf.steps.length} tools)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewWorkflow(wf)}
                            className="text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1 transition"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedWorkflowId(isExpanded ? null : wf.id)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 font-bold"
                          >
                            <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {/* Interactive Horizontal Sequence */}
                      <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/60 overflow-x-auto scrollbar-thin">
                        <div className="flex items-center gap-1.5 min-w-max">
                          {wf.steps.map((step, sIdx) => {
                            const isDone = doneSteps.includes(step.slug);
                            const isNext = step.slug === nextIncompleteStep?.slug;
                            const stepTool = toolsList.find(t => t.id === step.id);
                            const path = stepTool ? getToolCanonicalPath(stepTool.category, stepTool.slug) : '#';

                            return (
                              <React.Fragment key={step.slug}>
                                <div className="flex items-center gap-1">
                                  <Link
                                    to={path}
                                    title={`${step.title} - ${step.description}`}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition border ${
                                      isDone
                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                        : isNext
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                                        : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-indigo-400'
                                    }`}
                                  >
                                    <span className={`w-3.5 h-3.5 rounded-full text-[9px] font-black flex items-center justify-center ${
                                      isDone
                                        ? 'bg-emerald-600 text-white'
                                        : isNext
                                        ? 'bg-white text-indigo-600'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                    }`}>
                                      {isDone ? '✓' : sIdx + 1}
                                    </span>
                                    <span className="truncate max-w-[105px]">{step.title}</span>
                                  </Link>
                                </div>
                                {sIdx < wf.steps.length - 1 && (
                                  <ChevronRight className="w-3 h-3 text-zinc-350 dark:text-zinc-600 shrink-0" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Step Details with Manual Checkboxes */}
                    {isExpanded && (
                      <div className="space-y-2 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 animate-fadeIn">
                        {wf.steps.map((step, idx) => {
                          const isDone = doneSteps.includes(step.slug);
                          const stepTool = toolsList.find(t => t.id === step.id);
                          const path = stepTool ? getToolCanonicalPath(stepTool.category, stepTool.slug) : '#';

                          return (
                            <div
                              key={step.slug}
                              className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2.5 ${
                                isDone
                                  ? 'bg-emerald-500/[0.04] border-emerald-500/20'
                                  : 'bg-zinc-50/70 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800/60'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <button
                                  type="button"
                                  onClick={(e) => toggleStepCompleted(wf.id, step.slug, e)}
                                  className="mt-0.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                                  title={isDone ? 'Mark Incomplete' : 'Mark Complete'}
                                >
                                  {isDone ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Square className="w-4 h-4" />
                                  )}
                                </button>

                                <div className="min-w-0">
                                  <h4 className={`text-xs font-bold truncate ${isDone ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>
                                    {idx + 1}. {step.title}
                                  </h4>
                                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight truncate mt-0.5">
                                    {step.description}
                                  </p>
                                </div>
                              </div>

                              <Link
                                to={path}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white transition shrink-0 inline-flex items-center gap-1"
                              >
                                <span>Open</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                          );
                        })}

                        {doneSteps.length > 0 && (
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={(e) => resetWorkflowProgress(wf.id, e)}
                              className="text-[11px] font-semibold text-zinc-400 hover:text-rose-500 inline-flex items-center gap-1 transition"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset Progress</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="p-3.5 sm:p-4 bg-zinc-50/70 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(wf.id, e)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
                      title="Copy pipeline direct link"
                    >
                      {copiedId === wf.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </>
                      )}
                    </button>

                    <Link
                      to={nextToolPath}
                      className="saas-button-primary inline-flex items-center gap-1.5 py-1.5 px-3.5 text-xs shadow-xs"
                    >
                      <span>{doneSteps.length > 0 ? `Resume Step (${nextIncompleteStep.title})` : 'Launch Pipeline'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ==================================================================== */
          /* 2. DETAILED PIPELINE LANE VIEW                                       */
          /* ==================================================================== */
          <div className="space-y-4">
            {filteredWorkflows.map((wf) => {
              const doneSteps = completedSteps[wf.id] || [];
              const isSaved = savedWorkflows.includes(wf.id);
              const firstTool = toolsList.find(t => t.id === wf.steps[0]?.id);
              const firstToolPath = firstTool ? getToolCanonicalPath(firstTool.category, firstTool.slug) : '#';

              return (
                <div
                  key={wf.id}
                  id={wf.id}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:border-indigo-500/40 transition space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-gradient-to-r ${wf.highlightColor}`}>
                          {wf.categoryLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                          {wf.difficulty}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {wf.estimatedTime}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        {wf.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
                        {wf.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => toggleSaveWorkflow(wf.id, e)}
                        className={`p-2 rounded-xl border transition ${
                          isSaved
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-500'
                            : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-amber-500'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>

                      <Link
                        to={firstToolPath}
                        className="saas-button-primary inline-flex items-center gap-1.5 py-2 px-4 text-xs shadow-xs"
                      >
                        <span>Start Pipeline</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Connected Step Cards in Lane */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 pt-2">
                    {wf.steps.map((step, idx) => {
                      const isDone = doneSteps.includes(step.slug);
                      const stepTool = toolsList.find(t => t.id === step.id);
                      const path = stepTool ? getToolCanonicalPath(stepTool.category, stepTool.slug) : '#';

                      return (
                        <div
                          key={step.slug}
                          className={`p-3 rounded-2xl border transition flex flex-col justify-between gap-2 ${
                            isDone
                              ? 'bg-emerald-500/[0.05] border-emerald-500/30'
                              : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-400'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase mb-1">
                              <span>Step {idx + 1}</span>
                              {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                            </div>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-snug">
                              {step.title}
                            </h4>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                              {step.description}
                            </p>
                          </div>

                          <Link
                            to={path}
                            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            <span>Open Tool</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Interactive Workflow Preview Modal via React Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {previewWorkflow && (() => {
            const wf = previewWorkflow;
            const doneSteps = completedSteps[wf.id] || [];
            const progressPct = Math.round((doneSteps.length / wf.steps.length) * 100);
            const nextIncompleteStep = wf.steps.find(s => !doneSteps.includes(s.slug)) || wf.steps[0];
            const nextStepTool = toolsList.find(t => t.id === nextIncompleteStep?.id);
            const nextToolPath = nextStepTool ? getToolCanonicalPath(nextStepTool.category, nextStepTool.slug) : '#';

            return (
              <div
                className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-zinc-950/70 dark:bg-black/85 backdrop-blur-md overflow-hidden"
                onClick={() => setPreviewWorkflow(null)}
                role="dialog"
                aria-modal="true"
                aria-labelledby="preview-modal-title"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
                >
                  {/* Modal Header */}
                  <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/70 shrink-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-gradient-to-r ${wf.highlightColor}`}>
                            {wf.categoryLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                            {wf.difficulty}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {wf.estimatedTime}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                            • {wf.steps.length} Connected Steps
                          </span>
                        </div>

                        <h3 id="preview-modal-title" className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight leading-snug">
                          {wf.name}
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                          {wf.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewWorkflow(null)}
                        aria-label="Close preview modal"
                        className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Completion Status Bar inside Header */}
                    {doneSteps.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <span>{doneSteps.length} of {wf.steps.length} Steps Completed</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => resetWorkflowProgress(wf.id, e)}
                          className="text-[11px] font-semibold text-zinc-400 hover:text-rose-500 inline-flex items-center gap-1 shrink-0 transition"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Modal Body: Scrollable Pipeline Step Sequence */}
                  <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 scrollbar-thin">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-zinc-400">
                      <span>Execution Sequence ({wf.steps.length} Tools)</span>
                      <span className="text-[10px] lowercase font-normal text-zinc-400 italic">Click checkbox to mark step done</span>
                    </div>
                    
                    <div className="space-y-2.5">
                      {wf.steps.map((step, idx) => {
                        const isDone = doneSteps.includes(step.slug);
                        const isNext = step.slug === nextIncompleteStep?.slug;
                        const stepTool = toolsList.find(t => t.id === step.id);
                        const path = stepTool ? getToolCanonicalPath(stepTool.category, stepTool.slug) : '#';

                        return (
                          <div
                            key={step.slug}
                            className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                              isDone
                                ? 'bg-emerald-500/[0.04] border-emerald-500/30 dark:border-emerald-500/20'
                                : isNext
                                ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800/60 shadow-2xs'
                                : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              {/* Step Checkbox Toggle */}
                              <button
                                type="button"
                                onClick={(e) => toggleStepCompleted(wf.id, step.slug, e)}
                                className="mt-0.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition shrink-0"
                                title={isDone ? 'Mark step incomplete' : 'Mark step completed'}
                              >
                                {isDone ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>

                              {/* Step Number Badge */}
                              <div className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : isNext
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                              }`}>
                                {isDone ? '✓' : idx + 1}
                              </div>

                              <div className="min-w-0">
                                <h4 className={`text-xs sm:text-sm font-bold truncate ${isDone ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                                  {step.title}
                                </h4>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                                  {step.description}
                                </p>
                              </div>
                            </div>

                            <Link
                              to={path}
                              onClick={() => setPreviewWorkflow(null)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 inline-flex items-center gap-1.5 ${
                                isNext
                                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xs'
                                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-indigo-600'
                              }`}
                            >
                              <span>Open Tool</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-3.5 sm:p-4 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewWorkflow(null)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        Close
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(wf.id, e)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition inline-flex items-center gap-1.5"
                      >
                        {copiedId === wf.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Share Pipeline</span>
                          </>
                        )}
                      </button>
                    </div>

                    <Link
                      to={nextToolPath}
                      onClick={() => setPreviewWorkflow(null)}
                      className="saas-button-primary inline-flex items-center gap-2 py-2 px-4.5 text-xs shadow-md"
                    >
                      <span>
                        {doneSteps.length > 0 
                          ? `Resume Step (${nextIncompleteStep.title})` 
                          : 'Launch Pipeline from Step 1'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}

      {/* How It Works Explainer Section */}
      <section className="py-12 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              How Toolique Project Workflows Work
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1.5">
              Engineered for architects, developers, QA testers, and financial analysts to eliminate calculation fragmentation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Ordered Parameter Flow
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Workflows order calculations logically. For instance, start with plot dimensions, compute statutory FAR, deduce carpet space, and finalize a full Bill of Quantities (BOQ).
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                100% In-Memory Privacy
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Zero telemetry, zero server database storage, and no required login accounts. All calculations and transformations stay private in local browser RAM.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Interactive Progress Tracking
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Check off steps as you complete them, track completion percentages, and resume exactly where you stopped on any device with local memory storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-12 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Everything you need to know about chaining calculations together on Toolique.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs"
              >
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
