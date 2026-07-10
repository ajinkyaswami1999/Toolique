import { useParams, Link } from 'react-router-dom';
import { ArrowRight, HelpCircle, LayoutGrid } from 'lucide-react';
import { categories } from '../data/categories';
import { toolsList } from '../data/tools';
import { additionalFaqs } from '../data/toolFaqs';
import ToolCard from '../components/ToolCard';
import SEO from '../components/SEO';

interface FAQItem {
  question: string;
  answer: string;
}

export default function CategoryLanding() {
  const { categoryName } = useParams<{ categoryName: string }>();

  // Find category metadata
  const category = categories.find(
    (c) => c.id === categoryName || (categoryName === '3d-printing' && c.id === '3d-printing')
  );

  if (!category) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Category Not Found</h2>
        <p className="text-slate-500">The tools category you are looking for does not exist.</p>
        <Link to="/" className="inline-block px-5 py-2 rounded-xl bg-indigo-650 text-white font-bold text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  // Filter tools belonging to this category
  const categoryTools = toolsList.filter((t) => t.category === category.id);

  // Load related FAQs from tools in this category
  const faqs: FAQItem[] = [];
  categoryTools.forEach((t) => {
    const list = additionalFaqs[t.id];
    if (list && faqs.length < 5) {
      faqs.push(...list);
    }
  });

  // Generate dynamic JSON-LD FAQ schemas
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `https://www.toolique.in/tools/${category.id}#collection`,
        'name': `${category.name} Calculators & Tools`,
        'description': category.description,
        'url': `https://www.toolique.in/tools/${category.id}`
      },
      ...(faqs.length > 0 ? [{
        '@type': 'FAQPage',
        '@id': `https://www.toolique.in/tools/${category.id}#faq`,
        'mainEntity': faqs.map((f: FAQItem) => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': f.answer
          }
        }))
      }] : [])
    ]
  };

  // Find related categories
  const relatedCategories = categories.filter((c) => c.id !== category.id).slice(0, 4);

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      <SEO 
        title={`${category.name} Tools & Free Online Calculators | Toolique`}
        description={category.description}
        schemaMarkup={schemaMarkup}
      />

      {/* Header section */}
      <div className="p-8 md:p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 space-y-4">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider">
            Ecosystem Suite
          </span>
          <span className="text-[10px] text-zinc-450 font-bold">{categoryTools.length} Utilities Available</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
          {category.name} Utilities Hub
        </h1>
        <p className="text-sm text-zinc-505 dark:text-zinc-400 max-w-2xl leading-relaxed">
          {category.description} Clean, fast, 100% browser-based tools executing inside private client sandboxes.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="space-y-5">
        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
          Tools list in {category.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        
        {/* FAQs Panel */}
        {faqs.length > 0 && (
          <div className="lg:col-span-8 space-y-5">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Frequently Asked Questions</span>
            </h2>
            <div className="space-y-4">
              {faqs.map((faq: FAQItem, index: number) => (
                <div key={index} className="saas-card p-5 space-y-2 border border-zinc-200/60 dark:border-zinc-850/60">
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
        )}

        {/* Sidebar Related categories */}
        <div className="lg:col-span-4 space-y-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-teal-500" />
            <span>Related Categories</span>
          </h2>
          <div className="space-y-3">
            {relatedCategories.map((c) => (
              <Link
                key={c.id}
                to={`/tools/${c.id}`}
                className="p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-850/40 cursor-pointer flex justify-between items-center transition duration-300"
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
