import { useState } from 'react';
import { BookOpen, ExternalLink, Search, Clock, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  toolLink: string;
  toolName: string;
}

const articlesList: Article[] = [
  {
    slug: 'sql-joins-explained',
    title: 'SQL JOINs Explained Visually',
    excerpt: 'Master INNER, LEFT, RIGHT, and FULL outer joins with interactive Venn diagrams and matching database row combinations.',
    category: 'Academy & Databases',
    readTime: '6 min read',
    toolLink: '/academy/learn',
    toolName: 'SQL JOIN Visualizer'
  },
  {
    slug: 'json-vs-xml-differences',
    title: 'JSON vs XML: Modern Data Formats Comparison',
    excerpt: 'Explore structural parsing performance, syntax differences, and learn when to choose lightweight JSON payloads over XML.',
    category: 'Developer Utilities',
    readTime: '4 min read',
    toolLink: '/tool/json-validator',
    toolName: 'JSON Validator Tool'
  },
  {
    slug: '3d-printing-cost-breakdown',
    title: 'How to Estimate 3D Printing Production Costs',
    excerpt: 'A comprehensive guide explaining filament cost calculations, printer electricity consumption, machine utilization, and print farm revenue offsets.',
    category: '3D Maker Studio',
    readTime: '8 min read',
    toolLink: '/tool/3d-printing-cost-calculator',
    toolName: '3D Printing Cost Calculator'
  },
  {
    slug: 'gst-calculations-india',
    title: 'Understanding Indian GST Invoice Formats',
    excerpt: 'Demystifying CGST, SGST, IGST tax bounds and calculating reverse taxation percentages accurately.',
    category: 'Finance Calculations',
    readTime: '5 min read',
    toolLink: '/tool/gst-invoice-generator',
    toolName: 'GST Invoice Generator'
  }
];

const articleContents: Record<string, string> = {
  'sql-joins-explained': `
    <h4 class="font-extrabold text-sm mb-2 text-zinc-900 dark:text-white">Understanding SQL JOINs</h4>
    <p class="mb-3">SQL JOINs are used to combine rows from two or more tables based on a related column between them.</p>
    
    <h5 class="font-bold text-xs mb-1 text-zinc-900 dark:text-zinc-100">1. INNER JOIN</h5>
    <p class="mb-3">Returns records that have matching values in both tables. This is the default join type.</p>
    <pre class="bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded-lg text-[10px] font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto mb-4 border border-zinc-200/50 dark:border-zinc-800/80">SELECT orders.OrderID, customers.CustomerName \nFROM orders \nINNER JOIN customers ON orders.CustomerID = customers.CustomerID;</pre>
    
    <h5 class="font-bold text-xs mb-1 text-zinc-900 dark:text-zinc-100">2. LEFT JOIN (or LEFT OUTER JOIN)</h5>
    <p class="mb-4">Returns all records from the left table, and the matched records from the right table. If there is no match, the result is NULL on the right side.</p>
    
    <h5 class="font-bold text-xs mb-1 text-zinc-900 dark:text-zinc-100">3. RIGHT JOIN (or RIGHT OUTER JOIN)</h5>
    <p class="mb-4">Returns all records from the right table, and the matched records from the left table. If there is no match, the result is NULL on the left side.</p>
    
    <h5 class="font-bold text-xs mb-1 text-zinc-900 dark:text-zinc-100">4. FULL JOIN (or FULL OUTER JOIN)</h5>
    <p class="mb-4">Returns all records when there is a match in either left or right table records.</p>
  `,
  'json-vs-xml-differences': `
    <h4 class="font-extrabold text-sm mb-2 text-zinc-900 dark:text-white">JSON vs XML: Structural Comparison</h4>
    <p class="mb-4">JSON (JavaScript Object Notation) and XML (eXtensible Markup Language) are both human-readable data serialization formats, but they have key differences.</p>
    
    <table class="w-full text-xs text-left border-collapse my-4 border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl overflow-hidden">
      <thead>
        <tr class="bg-zinc-100 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800">
          <th class="py-2.5 px-3 font-bold">Feature</th>
          <th class="py-2.5 px-3 font-bold">JSON</th>
          <th class="py-2.5 px-3 font-bold">XML</th>
        </tr>
      </thead>
      <tbody>
        <tr class="border-b border-zinc-100 dark:border-zinc-900/60">
          <td class="py-2 px-3 font-bold">Syntax</td>
          <td class="py-2 px-3 text-zinc-500 dark:text-zinc-400">Minimal, based on JS objects</td>
          <td class="py-2 px-3 text-zinc-500 dark:text-zinc-400">Tag-based, heavy nesting</td>
        </tr>
        <tr class="border-b border-zinc-100 dark:border-zinc-900/60">
          <td class="py-2 px-3 font-bold">File Size</td>
          <td class="py-2 px-3 text-zinc-500 dark:text-zinc-400">Lightweight</td>
          <td class="py-2 px-3 text-zinc-500 dark:text-zinc-400">Verbose / Larger payloads</td>
        </tr>
        <tr class="border-b border-zinc-100 dark:border-zinc-900/60">
          <td class="py-2 px-3 font-bold">Parsing Speed</td>
          <td class="py-2 px-3 text-zinc-500 dark:text-zinc-400">Extremely fast (native JS)</td>
          <td class="py-2 px-3 text-zinc-500 dark:text-zinc-400">Slower (requires parser tree)</td>
        </tr>
      </tbody>
    </table>
    
    <h5 class="font-bold text-xs mt-4 mb-1 text-zinc-900 dark:text-zinc-100">When to use JSON:</h5>
    <p class="mb-4">Modern Web APIs, single page applications (SPAs), state configurations, and simple structured data exchanges.</p>
  `,
  '3d-printing-cost-breakdown': `
    <h4 class="font-extrabold text-sm mb-2 text-zinc-900 dark:text-white">3D Printing Cost Estimation Formulas</h4>
    <p class="mb-4">To accurately model volumetric print pricing and farm revenues, several variables must be considered.</p>
    
    <h5 class="font-bold text-xs mb-1 text-zinc-900 dark:text-zinc-100">1. Filament Cost</h5>
    <p class="mb-3">Filament Cost = (Weight of Print in grams / Total spool weight in grams) * Price per spool.</p>
    
    <h5 class="font-bold text-xs mb-1 text-zinc-900 dark:text-zinc-100">2. Electricity Cost</h5>
    <p class="mb-3">Electricity Cost = (Printer Power Consumption in kW) * (Print Time in hours) * (Utility Rate per kWh).</p>
    
    <h5 class="font-bold text-xs mb-1 text-zinc-900 dark:text-zinc-100">3. Wear and Tear (Depreciation)</h5>
    <p class="mb-4">A standard depreciation model allocates a fixed cost per printing hour (e.g. $0.15 - $0.30/hr) to cover nozzle replacements, belt wear, and machine amortization.</p>
  `,
  'gst-calculations-india': `
    <h4 class="font-extrabold text-sm mb-2 text-zinc-900 dark:text-white">Understanding Indian GST Calculations</h4>
    <p class="mb-4">Goods and Services Tax (GST) is a unified tax structure that replaces multiple cascading indirect taxes in India.</p>
    
    <h5 class="font-bold text-xs mb-1 text-zinc-900 dark:text-zinc-100">1. CGST & SGST</h5>
    <p class="mb-3">For transactions within the same state (Intra-state), tax is split equally between Central GST (CGST) and State GST (SGST).</p>
    
    <h5 class="font-bold text-xs mb-1 text-zinc-900 dark:text-zinc-100">2. IGST</h5>
    <p class="mb-3">For transactions between different states (Inter-state), Integrated GST (IGST) is levied by the Central Government.</p>
    
    <h5 class="font-bold text-xs mb-1 text-zinc-900 dark:text-zinc-100">3. Formula for Adding GST:</h5>
    <pre class="bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded-lg text-[10px] font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto mb-3 border border-zinc-200/50 dark:border-zinc-800/80">GST Amount = Base Value * (GST Rate / 100)\nTotal Amount = Base Value + GST Amount</pre>
    
    <h5 class="font-bold text-xs mb-1 text-zinc-900 dark:text-zinc-100">4. Formula for Removing GST:</h5>
    <pre class="bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded-lg text-[10px] font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto mb-4 border border-zinc-200/50 dark:border-zinc-800/80">Base Value = Total Amount / (1 + (GST Rate / 100))\nGST Amount = Total Amount - Base Value</pre>
  `
};

export default function BlogResources() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const filtered = articlesList.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      <SEO 
        title="Knowledge Base & Resources | Toolique" 
        description="Explore technical articles, developer roadmap explainers, and comprehensive calculation guides linked back to browser-based playgrounds and tools."
      />

      {/* Header Panel */}
      <div className="relative p-8 md:p-12 rounded-3xl overflow-hidden bg-gradient-to-br from-teal-950 via-zinc-955 to-zinc-900 border border-zinc-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3 relative z-10 max-w-xl">
          <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/25">
            Resources & Blog
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Developer Knowledge Base</h1>
          <p className="text-sm text-zinc-450 leading-relaxed">
            Evolve your QA and engineering skills with guides mapping formulas to interactive calculators and playground sandbox suites.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/10 animate-pulse relative z-10">
          <BookOpen className="w-8 h-8" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-550 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter resources guides..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-900/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500 font-semibold placeholder-zinc-400 dark:placeholder-zinc-650"
        />
      </div>

      {/* Articles Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((art) => (
          <div
            key={art.slug}
            className="saas-card p-6 flex flex-col justify-between hover:border-zinc-350 dark:hover:border-zinc-700 transition"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  {art.category}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {art.readTime}
                </span>
              </div>
              <h3 className="text-base font-black text-zinc-900 dark:text-white leading-snug">
                {art.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                {art.excerpt}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              {/* Linked utility tool shortcut */}
              <Link
                to={art.toolLink}
                className="text-[10px] font-bold text-zinc-650 dark:text-zinc-300 flex items-center gap-1 hover:text-indigo-650 dark:hover:text-indigo-400 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Try Calculator: {art.toolName}</span>
              </Link>

              <button
                type="button"
                onClick={() => setActiveArticle(art)}
                className="text-[10px] font-black uppercase tracking-wider text-zinc-850 dark:text-white flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
              >
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal Overlay */}
      {activeArticle && (
        <div className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop click to close */}
          <div className="fixed inset-0" onClick={() => setActiveArticle(null)} />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50 animate-scaleIn animate-duration-200 text-left">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-900 px-6 py-4">
              <div className="space-y-0.5 pr-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  {activeArticle.category} • {activeArticle.readTime}
                </span>
                <h2 className="text-sm font-black text-zinc-900 dark:text-white leading-snug">
                  {activeArticle.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-450 dark:text-zinc-500 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh] text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed space-y-3">
              <div dangerouslySetInnerHTML={{ __html: articleContents[activeArticle.slug] || '<p>Content is loading...</p>' }} />
            </div>
            
            {/* Modal Footer */}
            <div className="border-t border-zinc-150 dark:border-zinc-900 px-6 py-4 flex justify-between items-center">
              <Link
                to={activeArticle.toolLink}
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-[10px] uppercase tracking-wider shadow-sm hover:opacity-90 transition cursor-pointer"
              >
                Try {activeArticle.toolName} →
              </Link>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 font-extrabold text-[10px] uppercase tracking-wider transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
