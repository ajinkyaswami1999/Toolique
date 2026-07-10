import { useState } from 'react';
import { BookOpen, ExternalLink, Search, Clock, ArrowRight } from 'lucide-react';
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

export default function BlogResources() {
  const [searchQuery, setSearchQuery] = useState<string>('');

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
          <p className="text-sm text-zinc-400 leading-relaxed">
            Evolve your QA and engineering skills with guides mapping formulas to interactive calculators and playground sandbox suites.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/10 animate-pulse relative z-10">
          <BookOpen className="w-8 h-8" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4 h-4" />
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
          <div key={art.slug} className="saas-card p-6 flex flex-col justify-between hover:border-zinc-350 dark:hover:border-zinc-700 transition duration-300">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/5 px-2.5 py-1 rounded-md border border-teal-500/10">
                  {art.category}
                </span>
                <span className="text-[9px] text-zinc-400 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
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
                onClick={() => alert('Guides page content loaded in app. Enable client-side reading mode.')}
                className="text-[10px] font-black uppercase tracking-wider text-zinc-850 dark:text-white flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
              >
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
