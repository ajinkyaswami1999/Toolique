import { useEffect } from 'react';
import { Search, Sparkles, LayoutGrid, IndianRupee, Code, Image as ImageIcon, Sliders, Hammer, Compass, Palette, HelpCircle, ArrowRight, ShieldAlert, Zap, Globe } from 'lucide-react';
import { toolsList } from '../data/tools';
import { categories } from '../data/categories';
import ToolCard from '../components/ToolCard';
import AdPlaceholder from '../components/AdPlaceholder';
import SEO from '../components/SEO';
import { useSearchParams } from 'react-router-dom';

const categoryIcons: Record<string, React.ComponentType<any>> = {
  finance: IndianRupee,
  developer: Code,
  image: ImageIcon,
  utility: Sliders,
  civil: Hammer,
  architecture: Compass,
  interior: Palette,
};

// Lists of featured, popular and recently added tool IDs
const featuredToolIds = ['GSTCalculator', 'ConstructionCostCalculator', 'FARFSICalculator', 'ImageCompressor'];
const popularToolIds = ['SIPCalculator', 'EMICalculator', 'ConcreteCalculator', 'InHandSalaryCalculator'];
const recentToolIds = ['ModularKitchenCostCalculator', 'WardrobeCostCalculator', 'FalseCeilingCalculator', 'StaircaseCalculator'];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'all';

  const setSearchQuery = (q: string) => {
    setSearchParams((prev) => {
      if (q) prev.set('q', q);
      else prev.delete('q');
      return prev;
    }, { replace: true });
  };

  const setSelectedCategory = (cat: string) => {
    setSearchParams((prev) => {
      if (cat && cat !== 'all') prev.set('category', cat);
      else prev.delete('category');
      return prev;
    }, { replace: true });
  };

  // Scroll to tools-section if we have active filter parameters in URL (e.g. redirected from breadcrumbs)
  useEffect(() => {
    if (searchParams.get('category') || searchParams.get('q')) {
      const el = document.getElementById('tools-section');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []); // run once on mount

  const filteredTools = toolsList.filter((tool) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (tool.name || '').toLowerCase().includes(query) ||
      (tool.shortDescription || '').toLowerCase().includes(query) ||
      (tool.keywords || []).some((k) => (k || '').toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredTools = toolsList.filter(t => featuredToolIds.includes(t.id));
  const popularTools = toolsList.filter(t => popularToolIds.includes(t.id));
  const recentTools = toolsList.filter(t => recentToolIds.includes(t.id));

  const siteFaqs = [
    {
      question: 'Are my calculations private and safe?',
      answer: 'Yes. All calculations, string formatting, and image compression execute entirely inside your local browser sandbox. No file, code block, or cost estimate is uploaded to our servers, assuring 100% data privacy.'
    },
    {
      question: 'Is Toolique completely free to use?',
      answer: 'Yes, Toolique is 100% free with no subscription tiers or limitations. It is supported solely by non-intrusive display banners.'
    },
    {
      question: 'Are municipal building bylaws standard across the tools?',
      answer: 'Our building calculators (like FAR/FSI and staircase dimensions) use standard Indian NBC (National Building Code) guidelines. Local Municipal Corporation bylaws can vary slightly.'
    }
  ];

  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'Toolique',
    'url': 'https://Toolique.in',
    'description': 'Free online browser-based civil, architecture, interior design, finance, and developer tools optimized for Indian standards.',
    'applicationCategory': 'BusinessApplication, DeveloperApplication, DesignApplication, UtilityApplication',
    'operatingSystem': 'All'
  };

  return (
    <div className="space-y-16 py-4">
      <SEO 
        title="Toolique | Modern In-Browser Calculators & Engineering Utilities"
        description="Free in-browser tools. Compute GST, SIP, construction cost, concrete splits, staircase layouts, RERA carpet, paint liters, and modular kitchen designs locally."
        keywords={['Online Tools', 'GST Calculator', 'SIP Calculator', 'Construction cost estimator', 'RERA carpet calculator', 'staircase riser calculation', 'Image compressor online']}
        schemaMarkup={homeSchema}
      />

      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-6 md:pt-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/10 dark:border-indigo-400/10 bg-indigo-500/5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>No servers, no tracking, completely instant</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
          A simpler way to calculate, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">design, and optimize</span>
        </h1>
        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Fast, free browser utilities for Indian engineers, architects, designers, developers, and finance professionals. All calculations execute locally.
        </p>

        {/* Global Stats bar */}
        <div className="flex justify-center items-center gap-8 pt-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          <div>
            <span className="text-lg font-black text-zinc-900 dark:text-white mr-1.5">{toolsList.length}</span>
            Tools
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-800" />
          <div>
            <span className="text-lg font-black text-zinc-900 dark:text-white mr-1.5">{categories.length}</span>
            Categories
          </div>
        </div>
      </section>

      {/* Search & Category Filter Hub */}
      <section id="tools-section" className="space-y-6 max-w-5xl mx-auto pt-2">
        {/* Search Input */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 w-4.5 h-4.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type tool name, keyword, or category (e.g. concrete, cost)..."
            className="saas-input pl-11 pr-4 py-3 font-semibold shadow-sm focus:ring-indigo-500/10 focus:border-indigo-500"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto pt-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              selectedCategory === 'all'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white'
                : 'bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </button>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id] || LayoutGrid;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white'
                    : 'bg-transparent text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Ad slot */}
      <AdPlaceholder slot="home-top" type="banner" />

      {/* Conditional Rendering: If searching or filtering, show directory list. Else, show structured SaaS landing layout */}
      {searchQuery || selectedCategory !== 'all' ? (
        <section className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center max-w-5xl mx-auto px-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Search Results</h3>
            <span className="text-xs font-bold text-indigo-500">{filteredTools.length} found</span>
          </div>
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md mx-auto">
              <LayoutGrid className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <div className="font-bold text-zinc-700 dark:text-zinc-200">No tools match your query</div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 px-4">Try checking spelling or clear search filters.</p>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Featured Tools Grid */}
          <section className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Featured Platforms</h3>
              <a href="#tools-section" className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-0.5">
                <span>View all</span> <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>

          {/* Popular Tools Grid */}
          <section className="max-w-6xl mx-auto space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-2">Popular Calculations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>

          {/* Recently Added Tools Grid */}
          <section className="max-w-6xl mx-auto space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-2">Recently Released</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Ad slot */}
      <AdPlaceholder slot="home-middle" type="responsive" />

      {/* Why Choose Us Section */}
      <section className="max-w-5xl mx-auto space-y-8 pt-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Designed for high-performance privacy</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">Why professionals choose Toolique for daily calculations.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="saas-card p-6 text-left space-y-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">100% In-Browser Privacy</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              No servers are involved. Every calculation runs entirely in your local sandbox, keeping financial ledgers and building maps completely private.
            </p>
          </div>
          <div className="saas-card p-6 text-left space-y-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Instant Calculations</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              By removing server API requests, operations complete instantly, providing real-time sliding updates and immediate graph distributions.
            </p>
          </div>
          <div className="saas-card p-6 text-left space-y-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Globe className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Indian Bylaw Optimizations</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Tailored specifically to Indian market specifications, from RERA standard carpet definitions to Indian tax brackets (GST, TDS).
            </p>
          </div>
        </div>
      </section>

      {/* Central FAQs Section */}
      <section className="max-w-3xl mx-auto space-y-6 pt-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center">Platform FAQs</h2>
        <div className="space-y-4">
          {siteFaqs.map((faq, idx) => (
            <div key={idx} className="saas-card p-5 text-left flex gap-3.5">
              <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-200 mb-1">{faq.question}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
