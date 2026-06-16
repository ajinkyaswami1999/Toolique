import { useState } from 'react';
import { Search, Sparkles, LayoutGrid } from 'lucide-react';
import { toolsList } from '../data/tools';
import { categories } from '../data/categories';
import ToolCard from '../components/ToolCard';
import AdPlaceholder from '../components/AdPlaceholder';
import SEO from '../components/SEO';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools = toolsList.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const siteFaqs = [
    {
      question: 'Are my data calculations private and safe?',
      answer: 'Yes! All calculations, string formatting, and image compression occur completely inside your local browser. No data, files, or configurations are uploaded to any external server.'
    },
    {
      question: 'Is Toolique completely free to use?',
      answer: 'Absolutely. All calculators and developer utilities on Toolique are 100% free and have no usage limitations.'
    },
    {
      question: 'How do I request a new tool to be added?',
      answer: 'You can submit suggestions via our Contact page. We are always working on adding more Indian-specific utilities!'
    }
  ];

  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Toolique',
    'url': 'https://Toolique',
    'description': 'Free online developer, finance, image, and general utility tools optimized for Indian users.',
    'applicationCategory': 'BusinessApplication, DeveloperApplication, UtilityApplication',
    'operatingSystem': 'All'
  };

  return (
    <div className="space-y-12">
      <SEO 
        title="Free Online Tools for India | Finance, Tax, Developer & Image Utilities"
        description="Free in-browser tools including GST, SIP, EMI, TDS, and In-hand salary calculators, SQL/JSON formatters, image compressors, and UPI QR generators."
        keywords={['Online Tools', 'GST Calculator India', 'SIP Mutual Fund Calculator', 'Inhand salary calculator', 'UPI QR Generator', 'SQL Formatter', 'JSON Validator']}
        schemaMarkup={homeSchema}
      />

      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-6 md:pt-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 text-xs font-bold text-teal-600 dark:text-teal-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>100% Browser-Based & Safe</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          Free Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-indigo-600">Tools for India</span>
        </h1>
        <p className="text-base md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
          Finance, tax, developer, image and utility tools — fast, free and browser-based with zero data uploads.
        </p>
      </section>

      {/* Search & Category Filter Hub */}
      <section id="tools-section" className="space-y-6 max-w-5xl mx-auto pt-4">
        {/* Search Input */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools (e.g. GST, Salary, JSON, Image)..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-teal-500 text-slate-800 dark:text-white shadow-sm font-semibold transition"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-950'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-950'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Ad slot */}
      <AdPlaceholder slot="home-top" type="banner" />

      {/* Tools Grid */}
      <section className="max-w-6xl mx-auto">
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm max-w-md mx-auto">
            <LayoutGrid className="w-12 h-12 text-slate-350 dark:text-slate-700 mx-auto mb-3" />
            <div className="font-bold text-slate-700 dark:text-slate-200">No tools match your query</div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 px-4">Try checking your spelling or selecting "All Categories" above.</p>
          </div>
        )}
      </section>

      {/* Ad slot */}
      <AdPlaceholder slot="home-middle" type="responsive" />

      {/* Site features description */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-left shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm mb-4">1</div>
          <h3 className="font-bold text-slate-800 dark:text-white mb-2">100% In-Browser Privacy</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All algorithms execute entirely on your device. We do not transmit or review any documents, calculations, or variables on our servers.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-left shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm mb-4">2</div>
          <h3 className="font-bold text-slate-800 dark:text-white mb-2">High Performance Speed</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Since calculations don't wait on network requests, results compile instantly, creating a smooth responsive user experience.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-left shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm mb-4">3</div>
          <h3 className="font-bold text-slate-800 dark:text-white mb-2">Designed for India</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Calculations are configured to support Indian tax slabs (GST, TDS), systematic investment plans (SIP), bank loan EMIs, and regional salary structures.
          </p>
        </div>
      </section>

      {/* Central FAQs */}
      <section className="max-w-4xl mx-auto pt-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {siteFaqs.map((faq, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-left">
              <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2">{faq.question}</h4>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

