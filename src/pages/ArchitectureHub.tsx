import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  ArrowRight, 
  HelpCircle, 
  LayoutGrid, 
  Search, 
  Layers, 
  Info, 
  ChevronRight 
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

export default function ArchitectureHub() {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract tools for filtering
  const allArchTools = toolsList.filter(t => t.category === 'architecture');
  const allCivilTools = toolsList.filter(t => t.category === 'civil');
  const allInteriorTools = toolsList.filter(t => t.category === 'interior');

  // Unified Architecture Ecosystem grouping
  const groupZoning = [
    ...allArchTools.filter(t => t.subcategory === 'Site Planning' || t.slug === 'plot-area-calculator')
  ];

  const groupDesign = [
    ...allArchTools.filter(t => t.subcategory === 'Building Design' || t.subcategory === 'Building Code Helpers')
  ];

  const groupQuantities = [
    ...allCivilTools,
    ...allArchTools.filter(t => t.subcategory === 'Estimation' && ![
      'paint-calculator', 'wallpaper-calculator', 'floor-tile-calculator'
    ].includes(t.slug))
  ];

  const groupInterior = [
    ...allInteriorTools,
    ...allArchTools.filter(t => [
      'paint-calculator', 'wallpaper-calculator', 'floor-tile-calculator'
    ].includes(t.slug))
  ];

  const groupCAD = [
    ...allArchTools.filter(t => t.subcategory === 'CAD & BIM Utilities' || t.subcategory === 'Drawing & Scale Tools')
  ];

  const groupGeometry = [
    ...allArchTools.filter(t => t.subcategory === 'Geometry' || t.subcategory === 'Lighting & Environmental')
  ];

  const categoriesData = [
    { id: 'zoning', name: 'Zoning & Site Clearance', description: 'FSI/FAR, setbacks, ground coverage, plot limits', tools: groupZoning },
    { id: 'design', name: 'Design & Code Compliance', description: 'Staircases, ramps, corridors, doors, toilet clearances', tools: groupDesign },
    { id: 'quantities', name: 'Civil Engineering & Quantities', description: 'Concrete, brick, steel weight, plaster, slab, foundation, BOQ', tools: groupQuantities },
    { id: 'interior', name: 'Interior & Finishing Budgets', description: 'Modular kitchen, wardrobes, false ceiling, tiles, paint, wallpaper', tools: groupInterior },
    { id: 'cad', name: 'CAD, BIM & Scale Tools', description: 'Drawing scales, DXF viewer, DWG version check, revision checker', tools: groupCAD },
    { id: 'geometry', name: 'Geometry & Environmental', description: 'Angles, arcs, daylight factors, room ventilation, orientation', tools: groupGeometry }
  ];

  // Search logic
  const getFilteredTools = (toolsListForGroup: typeof toolsList) => {
    if (!searchQuery) return toolsListForGroup;
    return toolsListForGroup.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const hasMatches = categoriesData.some(cat => getFilteredTools(cat.tools).length > 0);

  // Dedicated FAQs
  const localFaqs: FAQItem[] = [
    {
      question: 'What is Floor Space Index (FSI) & Floor Area Ratio (FAR)?',
      answer: 'FSI (used in South/West India) and FAR (used in North India) represent the ratio of the total built-up area of a building to the total plot area. Formula: FSI = Total Built-up Area / Plot Area. Permissible FSI depends on local municipal regulations (e.g. MCGM, DDA) and access road width.'
    },
    {
      question: 'How is RERA Carpet Area calculated under Indian regulations?',
      answer: 'RERA Carpet Area represents the net usable floor area of an apartment. It includes inner partition walls but excludes external walls, service shafts, balconies, terraces, and common areas (stairs, lifts, lobbies).'
    },
    {
      question: 'What is the difference between Built-up Area and Super Built-up Area?',
      answer: 'Built-up Area is the carpet area plus the thickness of walls and balcony spaces. Super Built-up Area includes the built-up area plus a proportionate share of common areas like lobbies, lift shafts, security gates, and generator rooms (calculated using a loading factor of 25-35%).'
    },
    {
      question: 'How do I calculate building construction costs in India?',
      answer: 'Total construction cost is computed by multiplying the built-up area (in sq ft) by the per square foot rate (ranging from ₹1,500/sq ft for basic construction to ₹3,500+/sq ft for premium custom homes). Material volume (bricks, cement, steel) represents 60% of this cost, and labor represents 30%.'
    }
  ];

  const PILLARS = [
    { id: 'calculators', name: 'Calculators Hub', description: 'Calculators for finance, unit conversions, and math.', path: '/calculators' },
    { id: 'civil', name: 'Civil Engineering Suite', description: 'Estimation sheets, concrete ratios, and structural elements.', path: '/civil' },
    { id: 'developer', name: 'Developer Utilities', description: 'SQL formatting, JSON validation, and web tag generators.', path: '/developer' },
    { id: 'qa', name: 'QA Engineering', description: 'Test cases, mock datasets, and boundaries.', path: '/qa' }
  ];

  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://www.toolique.in/architecture#collection',
        'name': 'Architecture & Building Clearance Calculators Hub',
        'description': 'Free online browser-based calculators for plot clearances, FSI, carpet area, civil estimates, and interior costs.',
        'url': 'https://www.toolique.in/architecture'
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.toolique.in/architecture#faq',
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
        title="Architecture & Building Clearance Calculators | Toolique"
        description="Calculate Floor Space Index (FSI), setbacks, RERA carpet area, construction costs, staircase plans, and material volumes with local Indian building code pre-fills."
        schemaMarkup={schemaMarkup}
      />

      {/* Hero Panel */}
      <div className="p-8 md:p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider">
              Bylaw & Planning Suite
            </span>
            <span className="text-[10px] text-zinc-450 font-bold">86 Interactive Tools</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-zinc-905 dark:text-white tracking-tight leading-none">
            Architecture & Building Calculators
          </h1>
          <p className="text-sm text-zinc-505 dark:text-zinc-400 leading-relaxed font-medium">
            Plan setbacks, calculate permissible FSI, convert RERA carpet areas, estimate material quantities, and draft renovation budgets directly in your browser. All computations are run locally in private sandboxes.
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0 hidden sm:block">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '20s' }} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-550 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 86 architecture tools..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-255 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-900/40 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 font-semibold placeholder-zinc-400 dark:placeholder-zinc-650"
        />
      </div>

      {/* Interactive Project Workflows (Timelines) */}
      {!searchQuery && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Curated Project Journeys
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {workflows.map((wf) => (
              <div 
                key={wf.id}
                className="p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span>{wf.name}</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed font-medium">
                    {wf.description}
                  </p>
                </div>

                {/* Steps Mini Timeline preview */}
                <div className="py-2 border-y border-zinc-100 dark:border-zinc-850 my-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {wf.steps.map((step, idx) => {
                      const stepTool = toolsList.find(t => t.id === step.id);
                      const path = stepTool ? getToolCanonicalPath(stepTool.category, stepTool.slug) : '#';
                      return (
                        <div key={step.slug} className="flex items-center gap-1.5 shrink-0">
                          <Link 
                            to={path}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-indigo-500 hover:text-white dark:bg-zinc-850/80 dark:hover:bg-indigo-600 text-[9px] font-bold text-zinc-600 dark:text-zinc-300 transition"
                          >
                            {step.title}
                          </Link>
                          {idx < wf.steps.length - 1 && (
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] font-bold text-zinc-400">{wf.steps.length} Steps Sequence</span>
                  <Link 
                    to={getToolCanonicalPath(
                      (toolsList.find(t => t.id === wf.steps[0].id))?.category || 'architecture', 
                      wf.steps[0].slug
                    )}
                    className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    <span>Start Journey</span>
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
                  <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-bold mt-1">
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
            <p className="text-xs text-zinc-450 font-medium">Try searching for other terms like "FSI", "brick", "concrete", or "ceiling".</p>
          </div>
        )}
      </div>

      {/* India Bylaws & Regulations Highlight Block */}
      {!searchQuery && (
        <section className="p-6 md:p-8 rounded-3xl border border-zinc-200/50 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 text-left space-y-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              India Compliance
            </span>
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Indian Building Codes & Municipal Bylaws
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed font-medium text-zinc-500 dark:text-zinc-400">
            <div className="space-y-2">
              <h3 className="font-extrabold text-zinc-900 dark:text-white">1. RERA Area Standard</h3>
              <p>RERA (Real Estate Regulatory Authority) mandates that builders sell apartments exclusively based on **RERA Carpet Area**. Balconies and open terraces are categorized separately. Our calculators deduct standard wall-width fractions to let you verify compliance.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-zinc-900 dark:text-white">2. Regional Bylaws</h3>
              <p>Zonal building clearances are determined by municipal bodies. Mumbai uses DCPR 2034 with "Fungible FSI" options; Delhi uses DDA rules allowing "Premium FAR"; and Bangalore limits building heights based on access road widths. Check our FSI tools for details.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-zinc-900 dark:text-white">3. Local Estimation Units</h3>
              <p>Indian contractors measure site aggregates in Brass (100 CFT), sand in CFT, cement in 50 kg bags, and steel in metric tons. Costing options in our BOQ and material calculators include defaults tailored to regional Indian market standards.</p>
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
