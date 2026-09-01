import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  HelpCircle, 
  LayoutGrid, 
  Search, 
  Layers, 
  Info, 
  ShieldCheck 
} from 'lucide-react';
import { toolsList } from '../data/tools';
import { workflows } from '../data/workflows';
import { getToolCanonicalPath } from '../routes/AppRoutes';
import ToolCard from '../components/ToolCard';
import SEO from '../components/SEO';

interface FAQItem {
  question: string;
  answer: string;
}

export default function QAHub() {
  const [searchQuery, setSearchQuery] = useState('');

  // Target tools to include in the QA workspace
  const targetSlugs = [
    'test-case-generator', 'bug-report-generator', 'boundary-value-analysis',
    'equivalence-partitioning', 'test-data-generator', 'xpath-tester',
    'api-tester', 'json-formatter', 'json-validator', 'json-compare',
    'jwt-decoder', 'regex-tester', 'test-scenario-generator', 'api-response-comparator'
  ];

  const qaWorkspaceTools = toolsList.filter(t => targetSlugs.includes(t.slug));

  // Category grouping
  const groupDesign = qaWorkspaceTools.filter(t => [
    'test-case-generator', 'bug-report-generator', 'test-scenario-generator'
  ].includes(t.slug));

  const groupData = qaWorkspaceTools.filter(t => [
    'boundary-value-analysis', 'equivalence-partitioning', 'test-data-generator'
  ].includes(t.slug));

  const groupLocators = qaWorkspaceTools.filter(t => [
    'xpath-tester', 'regex-tester'
  ].includes(t.slug));

  const groupAPI = qaWorkspaceTools.filter(t => [
    'api-tester', 'json-formatter', 'json-validator', 'json-compare', 'jwt-decoder', 'api-response-comparator'
  ].includes(t.slug));

  const categoriesData = [
    { id: 'design', name: 'Test Design & Case Writers', description: 'Write manual scenarios and format structured bug tickets', tools: groupDesign },
    { id: 'data', name: 'Data & Boundary Classifiers', description: 'Compute boundary values, class divisions, and dummy datasets', tools: groupData },
    { id: 'locators', name: 'Automation Locators & Regex', description: 'Verify DOM element selections and validation patterns', tools: groupLocators },
    { id: 'api', name: 'API Client & JSON Helpers', description: 'Trigger endpoints, parse response schemas, and decode auth signatures', tools: groupAPI }
  ];

  // Filter tools by search query
  const getFilteredTools = (toolsListForGroup: typeof toolsList) => {
    if (!searchQuery) return toolsListForGroup;
    return toolsListForGroup.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const hasMatches = categoriesData.some(cat => getFilteredTools(cat.tools).length > 0);

  // QA-Specific FAQs
  const localFaqs: FAQItem[] = [
    {
      question: 'What is the difference between Boundary Value Analysis (BVA) and Equivalence Partitioning (EP)?',
      answer: 'Equivalence Partitioning divides input data range classes into valid and invalid groups, assuming all values in a group behave similarly. Boundary Value Analysis focuses on testing the edges (boundaries) of these groups (e.g. min, min-1, max, max+1), as programming errors typically occur at the boundaries.'
    },
    {
      question: 'How do I evaluate XPath and CSS selectors for test automation?',
      answer: 'Use the XPath Tester to write and evaluate element selectors against your HTML layouts. This helps you verify that your Selenium or Playwright locators are unique and target the correct node before writing your test automation scripts.'
    },
    {
      question: 'Why should I perform JSON schema validation locally?',
      answer: 'Validating and formatting JSON schemas client-side prevents sensitive API requests and responses from being sent over the network to external formatting servers, maintaining data privacy in a secure browser sandbox.'
    },
    {
      question: 'How do I decode and verify JWT authorization tokens?',
      answer: 'Use the JWT Decoder to inspect the header and payload signature sections of your bearer authorization tokens. This allows you to verify token expiration timestamps, permissions scopes, and user details in local environments.'
    }
  ];

  const PILLARS = [
    { id: 'calculators', name: 'Calculators Hub', description: 'Calculators for finance, unit conversions, and math.', path: '/calculators' },
    { id: 'architecture', name: 'Architecture & Civil', description: 'FSI calculations, setback plans, and materials.', path: '/architecture' },
    { id: 'developer', name: 'Developer Utilities', description: 'SQL formatting, JSON validation, and web tag generators.', path: '/developer' }
  ];

  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://www.toolique.in/qa#collection',
        'name': 'QA Engineering Workspace & Test Case Tools',
        'description': 'Free online browser-based workspace for QA Engineers and automation testers. Generate test cases, compute boundary values, test API endpoints, and parse JSON.',
        'url': 'https://www.toolique.in/qa'
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.toolique.in/qa#faq',
        'mainEntity': localFaqs.map(f => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.answer
          }
        }))
      }
    ]
  };

  return (
    <div className="space-y-12 text-left animate-fadeIn">
      <SEO 
        title="QA Engineering Workspace & Test Case Tools | Toolique"
        description="Write manual test cases, compute boundary values, analyze equivalence classes, build mock datasets, test endpoints, evaluate XPath selectors, and prepare for QA interviews."
        schemaMarkup={schemaMarkup}
      />

      {/* Hero Panel */}
      <div className="p-8 md:p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider">
              QA Workspace Suite
            </span>
            <span className="text-[10px] text-zinc-450 font-bold">12 Integrated Utilities</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-905 dark:text-white tracking-tight leading-none">
            QA Engineering Workspace
          </h1>
          <p className="text-sm text-zinc-505 dark:text-zinc-400 leading-relaxed font-medium">
            Draft test case scenarios, generate CSV/JSON dummy mock datasets, test REST API headers, parse authorization JWT signatures, and evaluate XPath/Regex pattern locators. Everything executes securely inside your local browser sandbox.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0 hidden sm:block">
          <ShieldCheck className="w-10 h-10 animate-pulse" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-550 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search QA tools..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-255 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-900/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-semibold placeholder-zinc-400 dark:placeholder-zinc-650"
        />
      </div>

      {/* Curated Workflows */}
      {!searchQuery && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Curated QA Project Workflows
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {workflows.filter(w => ['manual-test-design', 'api-json-validation', 'web-automation-locators'].includes(w.id)).map((wf) => (
              <div 
                key={wf.id}
                className="p-5 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider">
                    {wf.id === 'manual-test-design' ? 'Manual Suite' : wf.id === 'api-json-validation' ? 'API & JSON Suite' : 'Automation Suite'}
                  </h3>
                  <h4 className="text-sm font-extrabold text-zinc-905 dark:text-white">
                    {wf.name}
                  </h4>
                  <p className="text-[11px] text-zinc-450 dark:text-zinc-500 leading-relaxed font-semibold">
                    {wf.description}
                  </p>
                </div>

                {/* Steps Mini Timeline preview */}
                <div className="py-2.5 border-y border-zinc-100 dark:border-zinc-850 my-1">
                  <div className="flex flex-col gap-2">
                    {wf.steps.map((step, idx) => {
                      const stepTool = toolsList.find(t => t.id === step.id);
                      const path = stepTool ? getToolCanonicalPath(stepTool.category, stepTool.slug) : '#';
                      return (
                        <Link 
                          key={step.slug}
                          to={path}
                          className="flex items-center gap-2 hover:translate-x-0.5 transition-transform"
                        >
                          <span className="w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:text-indigo-500">
                            {step.title}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">{wf.steps.length} Steps</span>
                  <Link 
                    to={getToolCanonicalPath(
                      (toolsList.find(t => t.id === wf.steps[0].id))?.category || 'qa', 
                      wf.steps[0].slug
                    )}
                    className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categorized Tools Grid */}
      <div className="space-y-12">
        {categoriesData.map((cat) => {
          const filtered = getFilteredTools(cat.tools);
          if (filtered.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-5">
              <div className="flex items-center gap-2.5 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-2.5">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white leading-none">
                    {cat.name} ({filtered.length})
                  </h2>
                  <p className="text-[10px] text-zinc-455 dark:text-zinc-500 font-bold mt-1">
                    {cat.description}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          );
        })}

        {!hasMatches && (
          <div className="p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-3">
            <Info className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">No tools match your query</h3>
            <p className="text-xs text-zinc-450 font-medium">Try searching for other terms like "case", "xpath", "JSON", or "api".</p>
          </div>
        )}
      </div>

      {/* QA Academy Integration Loop */}
      {!searchQuery && (
        <section className="p-6 md:p-8 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 text-left space-y-5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-wider">
              Learn & Practice
            </span>
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Interactive Test Automation & Code Practice
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed font-semibold text-zinc-500 dark:text-zinc-400">
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-zinc-900 dark:text-white">QA Automation Course Track</h3>
                <p className="text-[11px] leading-relaxed text-zinc-450 font-medium">
                  Learn XPath selector locators, Page Object Model (POM) design, Selenium waits, and Playwright execution structures inside our interactive academy curriculum.
                </p>
              </div>
              <Link
                to="/academy/qa"
                className="text-[10px] font-black uppercase text-indigo-650 dark:text-indigo-400 inline-flex items-center gap-1 mt-2 hover:gap-1.5 transition-all"
              >
                <span>Start Learning Track</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-zinc-900 dark:text-white">Interactive Automation Questions</h3>
                <div className="space-y-2 pt-1">
                  <Link 
                    to="/academy/qa/question/qa-selenium-explicit-wait" 
                    className="block text-[11px] font-bold text-zinc-650 dark:text-zinc-350 hover:text-indigo-500"
                  >
                    📝 Write a Robust Selenium Explicit Wait (Python)
                  </Link>
                  <Link 
                    to="/academy/qa/question/qa-playwright-locators-click" 
                    className="block text-[11px] font-bold text-zinc-650 dark:text-zinc-350 hover:text-indigo-500"
                  >
                    📝 Locate and Click Elements in Playwright (TypeScript)
                  </Link>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">
                Run tests locally in compiler sandboxes
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Double Column: FAQs + Side pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        
        {/* FAQs Panel */}
        <div className="lg:col-span-8 space-y-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="space-y-4">
            {localFaqs.map((faq, index) => (
              <div key={index} className="saas-card p-5 space-y-2 border border-zinc-200/60 dark:border-zinc-850/60 text-left">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-medium">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Related categories */}
        <div className="lg:col-span-4 space-y-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-teal-500" />
            <span>Core Pillars</span>
          </h2>
          <div className="space-y-3">
            {PILLARS.map((c) => (
              <Link
                key={c.id}
                to={c.path}
                className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-850/40 cursor-pointer flex justify-between items-center transition duration-300 text-left"
              >
                <div>
                  <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white">{c.name}</h4>
                  <p className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-snug mt-1 font-medium max-w-[200px] truncate">
                    {c.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
