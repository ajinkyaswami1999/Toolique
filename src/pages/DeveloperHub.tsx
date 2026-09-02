import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  HelpCircle, 
  LayoutGrid, 
  Search, 
  Layers, 
  Info, 
  ShieldCheck,
  Code,
  Globe,
  Lock,
  Terminal,
  Database,
  GraduationCap
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

export default function DeveloperHub() {
  const [searchQuery, setSearchQuery] = useState('');

  // Target tools for Developer, Web, and Security suites
  const devSlugs = [
    // Formatters & Converters
    'json-formatter', 'json-compare', 'json-validator', 'xml-formatter', 
    'yaml-formatter', 'html-formatter', 'sql-formatter', 'sql-minifier', 
    'css-formatter', 'js-formatter',
    // API & Auth
    'api-tester', 'jwt-decoder', 'url-encoder-decoder', 'base64-encoder-decoder', 
    'timestamp-converter',
    // Security & Identifiers
    'hash-generator', 'uuid-generator', 'password-generator', 'regex-tester', 
    'advanced-data-cleaner-quality-analyzer', 'lorem-ipsum-generator', 'upi-qr-generator',
    // Web & SEO Engineering
    'website-crawler', 'website-seo-audit', 'robots-txt-generator', 'sitemap-generator', 
    'canonical-url-generator', 'meta-tag-generator', 'open-graph-preview', 
    'favicon-generator', 'css-minifier', 'js-minifier', 'html-entity-encoder',
    // Automation
    'cron-generator'
  ];

  const developerTools = toolsList.filter(t => devSlugs.includes(t.slug));

  // Category grouping
  const groupFormatters = developerTools.filter(t => [
    'json-formatter', 'json-compare', 'json-validator', 'sql-formatter', 
    'sql-minifier', 'xml-formatter', 'yaml-formatter', 'html-formatter', 
    'css-formatter', 'js-formatter'
  ].includes(t.slug));

  const groupApiAuth = developerTools.filter(t => [
    'api-tester', 'jwt-decoder', 'url-encoder-decoder', 'base64-encoder-decoder', 'timestamp-converter'
  ].includes(t.slug));

  const groupSecurityText = developerTools.filter(t => [
    'regex-tester', 'uuid-generator', 'hash-generator', 'password-generator', 
    'advanced-data-cleaner-quality-analyzer', 'lorem-ipsum-generator', 'upi-qr-generator'
  ].includes(t.slug));

  const groupWebSeo = developerTools.filter(t => [
    'website-crawler', 'website-seo-audit', 'robots-txt-generator', 'sitemap-generator', 
    'canonical-url-generator', 'meta-tag-generator', 'open-graph-preview', 
    'favicon-generator', 'css-minifier', 'js-minifier', 'html-entity-encoder'
  ].includes(t.slug));

  const groupAutomation = developerTools.filter(t => [
    'cron-generator'
  ].includes(t.slug));

  const categoriesData = [
    { id: 'formatters', name: 'Code & Data Formatters', description: 'Prettify, validate, and minify SQL, JSON, XML, YAML, HTML, CSS, and JS', tools: groupFormatters, icon: Code },
    { id: 'api-auth', name: 'API, Network & Authentication', description: 'Test REST endpoints, inspect JWT tokens, encode Base64, and convert Epoch timestamps', tools: groupApiAuth, icon: Terminal },
    { id: 'security-text', name: 'Security, Hashes & Regex', description: 'Test regex expressions, generate UUIDs, compute SHA/MD5 hashes, and clean data', tools: groupSecurityText, icon: Lock },
    { id: 'web-seo', name: 'Web Performance & Technical SEO', description: 'Crawl websites, audit meta tags, generate robots.txt directives, and build XML sitemaps', tools: groupWebSeo, icon: Globe },
    { id: 'automation', name: 'Cron & Automation', description: 'Build cron schedule expressions with human-readable syntax explanations', tools: groupAutomation, icon: Database }
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

  // Developer FAQs for AEO & GEO
  const localFaqs: FAQItem[] = [
    {
      question: 'Are my SQL queries, JSON payloads, or JWT tokens sent to a backend server?',
      answer: 'No. All developer tools in this suite execute 100% client-side inside your browser sandbox using Web Workers and local JavaScript engines. Your proprietary database schemas, authentication tokens, API secrets, and source code never leave your device.'
    },
    {
      question: 'Which SQL dialects are supported by the SQL Formatter?',
      answer: 'The SQL Formatter supports standard ANSI SQL along with dialect-specific formatting for MySQL, PostgreSQL, Microsoft SQL Server (T-SQL), Oracle PL/SQL, SQLite, MariaDB, and Google BigQuery, including keyword capitalization and customizable indentation.'
    },
    {
      question: 'How does the REST API Client handle Cross-Origin Resource Sharing (CORS)?',
      answer: 'For direct browser-to-server requests with standard CORS headers, requests are dispatched directly. For third-party APIs without CORS headers, options to inspect headers, format cURL commands, and test payloads locally are provided.'
    },
    {
      question: 'Can I decode and verify JWT signature validity locally?',
      answer: 'Yes. The JWT Decoder parses the standard Base64URL-encoded header, payload, and signature segments. It verifies token expiration (exp), issued-at (iat) timestamps, and custom claims instantly without exposing tokens over the network.'
    },
    {
      question: 'What regex flavors are supported by the Regex Tester?',
      answer: 'The Regex Tester operates on the native ECMAScript/JavaScript RegExp engine with support for standard flags: global (g), case-insensitive (i), multiline (m), dotAll (s), unicode (u), and sticky (y).'
    }
  ];

  const ACADEMY_TRACKS = [
    { name: 'SQL Query Track', path: '/academy/sql', desc: 'Joins, Aggregations, Window Functions' },
    { name: 'Python Engineering', path: '/academy/python', desc: 'Data structures, list comprehensions, OOP' },
    { name: 'JavaScript & Async', path: '/academy/javascript', desc: 'Closures, Promises, Event Loop' },
    { name: 'Git & Version Control', path: '/academy/git', desc: 'Rebase, Merge conflicts, Cherry-pick' },
    { name: 'Docker & Containers', path: '/academy/docker', desc: 'Dockerfiles, compose, multi-stage builds' },
    { name: 'Linux System CLI', path: '/academy/linux', desc: 'File permissions, pipes, bash scripting' }
  ];

  const PILLARS = [
    { id: 'qa', name: 'QA Engineering', description: 'Test cases, BVA, XPath selectors, and bug reports.', path: '/qa' },
    { id: 'finance', name: 'Personal Finance & Tax', description: 'Income tax, in-hand salary, SIP, and loan EMIs.', path: '/finance' },
    { id: 'architecture', name: 'Architecture & Civil', description: 'Plot area, setbacks, RERA carpet, and BOQ estimates.', path: '/architecture' },
    { id: 'ai', name: 'AI Studio', description: 'AI code generators, test designers, and query builders.', path: '/ai' }
  ];

  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://www.toolique.in/developer#collection',
        'name': 'Developer Tools & Web Engineering Suite | Toolique',
        'description': 'Free online developer utilities for SQL formatting, JSON diffing, JWT decoding, regex testing, API request simulation, and technical SEO analysis.',
        'url': 'https://www.toolique.in/developer'
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.toolique.in/developer#faq',
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
        title="Developer Tools & Web Engineering Suite | Toolique"
        description="Free online developer utilities. Format SQL queries, beautify JSON, decode JWT tokens, test regex, simulate REST APIs, and audit technical SEO in private browser sandboxes."
        schemaMarkup={schemaMarkup}
      />

      {/* Hero Panel */}
      <div className="p-8 md:p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider">
              Developer & Web Suite
            </span>
            <span className="text-[10px] text-zinc-450 font-bold">34 Browser-Sandboxed Tools</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-905 dark:text-white tracking-tight leading-none">
            Developer Utilities Hub
          </h1>
          <p className="text-sm text-zinc-505 dark:text-zinc-400 leading-relaxed font-medium">
            Format SQL, beautify and validate JSON, decode JWTs, test regular expressions, inspect REST API endpoints, and audit technical SEO. 100% private, client-side computation with zero telemetry.
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
          placeholder="Search developer tools (e.g. SQL, JSON, JWT, Regex, API)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-255 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-900/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-semibold placeholder-zinc-400 dark:placeholder-zinc-650"
        />
      </div>

      {/* Curated Developer Workflows */}
      {!searchQuery && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Curated Developer Workflows
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {workflows.filter(w => ['api-payload-inspection', 'sql-database-optimization', 'web-seo-engineering'].includes(w.id)).map((wf) => (
              <div 
                key={wf.id}
                className="p-5 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase text-zinc-500 tracking-wider">
                    {wf.id === 'api-payload-inspection' ? 'API Engineering' : wf.id === 'sql-database-optimization' ? 'Database & Backend' : 'Web & Performance'}
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
                      (toolsList.find(t => t.id === wf.steps[0].id))?.category || 'developer', 
                      wf.steps[0].slug
                    )}
                    className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    <span>Launch Workflow</span>
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
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">No developer tools match your query</h3>
            <p className="text-xs text-zinc-450 font-medium">Try searching for terms like "SQL", "JSON", "JWT", "Regex", or "API".</p>
          </div>
        )}
      </div>

      {/* Learning Academy & Coding Interview Practice Section */}
      {!searchQuery && (
        <section className="p-6 md:p-8 rounded-3xl border border-indigo-500/20 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.02] text-left space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                Developer Academy & Coding Interview Practice
              </h2>
            </div>
            <Link
              to="/academy"
              className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-1.5 transition-all"
            >
              <span>Explore All Tracks</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl">
            Sharpen your backend, database, and system engineering skills with real interview code challenges, automated tests, and syntax reference guides.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
            {ACADEMY_TRACKS.map((track) => (
              <Link
                key={track.path}
                to={track.path}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 hover:border-indigo-500/40 transition group space-y-1"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {track.name}
                  </h4>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 group-hover:text-indigo-500 transition-all" />
                </div>
                <p className="text-[10px] text-zinc-450 font-medium">
                  {track.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Double Column: FAQs + Side Pillars */}
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

        {/* Sidebar Related Pillars */}
        <div className="lg:col-span-4 space-y-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-indigo-500" />
            <span>Companion Suites</span>
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
