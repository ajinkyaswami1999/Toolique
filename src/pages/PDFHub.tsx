import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  HelpCircle, 
  Search, 
  ShieldCheck, 
  Zap, 
  Lock, 
  FileImage, 
  Scissors, 
  FileDown, 
  CheckCircle2
} from 'lucide-react';
import { toolsList } from '../data/tools';
import ToolCard from '../components/ToolCard';
import SEO from '../components/SEO';

interface FAQItem {
  question: string;
  answer: string;
}

export default function PDFHub() {
  const [searchQuery, setSearchQuery] = useState('');

  // Target all PDF Suite tools
  const allPdfTools = toolsList.filter(t => t.category === 'pdf');

  // Categorized Clusters
  const groupConversion = allPdfTools.filter(t => [
    'pdf-to-image', 'pdf-to-word', 'word-to-pdf', 'excel-to-pdf', 'powerpoint-to-pdf', 'extract-text-pdf'
  ].includes(t.slug));

  const groupOrganize = allPdfTools.filter(t => [
    'pdf-merge', 'pdf-split', 'pdf-page-remover', 'pdf-page-reorder', 'pdf-rotate', 'pdf-page-numbering'
  ].includes(t.slug));

  const groupCompression = allPdfTools.filter(t => [
    'pdf-compressor'
  ].includes(t.slug));

  const groupSecurity = allPdfTools.filter(t => [
    'pdf-watermark', 'pdf-password-protect', 'pdf-unlock', 'pdf-metadata-viewer'
  ].includes(t.slug));

  const categoriesData = [
    { 
      id: 'conversion', 
      name: 'Conversion & Image Extraction', 
      description: 'Convert PDF pages to high-res PNG/JPG/WebP images, extract text, or convert Office documents', 
      tools: groupConversion, 
      icon: FileImage,
      badge: 'High DPI & Formats'
    },
    { 
      id: 'organize', 
      name: 'Organize, Merge & Split', 
      description: 'Combine multiple PDFs, slice custom page ranges, delete duplicate sheets, rotate, and reorder', 
      tools: groupOrganize, 
      icon: Scissors,
      badge: 'Zero Quality Loss'
    },
    { 
      id: 'compression', 
      name: 'Compression & Size Optimization', 
      description: 'Shrink heavy PDF files to target KB budgets (≤100KB, ≤200KB, ≤500KB) for portal uploads', 
      tools: groupCompression, 
      icon: FileDown,
      badge: 'Target Budget'
    },
    { 
      id: 'security', 
      name: 'Security, Watermarks & Forensics', 
      description: 'Protect with AES passwords, remove encryption, stamp custom watermarks, and inspect metadata', 
      tools: groupSecurity, 
      icon: Lock,
      badge: '100% In-Browser'
    }
  ];

  // Search filter helper
  const getFilteredTools = (toolsListForGroup: typeof toolsList) => {
    if (!searchQuery) return toolsListForGroup;
    return toolsListForGroup.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const hasMatches = categoriesData.some(cat => getFilteredTools(cat.tools).length > 0);

  // Dedicated PDF FAQs for AEO & Search
  const localFaqs: FAQItem[] = [
    {
      question: 'Are my confidential PDF documents uploaded to any external server?',
      answer: 'No, absolutely not. Every PDF utility in Toolique executes 100% locally inside your web browser sandbox using WebAssembly, PDF.js, and PDF-Lib. Your confidential agreements, tax returns, architectural drawings, and bank statements never leave your device.'
    },
    {
      question: 'How do I convert PDF pages into high-resolution images?',
      answer: 'Open the PDF to Image Converter tool, upload your PDF, choose your desired format (PNG, JPG, or WebP), select your DPI scale (72 to 600 DPI), filter pages, and click Convert. You can download individual sheets or download all pages bundled in a ZIP archive.'
    },
    {
      question: 'Can I compress a PDF to a specific file size like under 100KB or 200KB?',
      answer: 'Yes! The PDF Compressor includes a Target Size mode where you can specify an exact KB limit (e.g., 100 KB, 200 KB, or 500 KB) required for government portals, UPSC forms, and visa applications.'
    },
    {
      question: 'How does PDF Merge maintain document quality and vector clarity?',
      answer: 'Toolique preserves native vector paths, font glyphs, and embedded objects without rasterization or downsampling. When you merge multiple files, pages are cloned losslessly in browser memory.'
    },
    {
      question: 'Can I split or extract non-consecutive pages from a large PDF binder?',
      answer: 'Yes. The PDF Split tool supports custom range syntax (such as "1-3, 5, 8-12"), odd/even duplex splitting, fixed page chunking, and visual thumbnail selection.'
    },
    {
      question: 'How does client-side PDF Watermarking work?',
      answer: 'The PDF Watermark tool stamps customizable text, transparent company logos, or tiled security matrices directly into the PDF content stream in real-time, giving you full control over opacity, angle, and positioning.'
    },
    {
      question: 'Is there any file size limit or cost to use the PDF Tools Hub?',
      answer: 'Toolique PDF tools are 100% free with no account registration, subscriptions, or daily limits. The capacity is governed only by your device RAM, allowing you to process multi-hundred-megabyte files smoothly.'
    }
  ];

  // SEO Schema
  const hubSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': 'https://www.toolique.in/pdf#webpage',
        'url': 'https://www.toolique.in/pdf',
        'name': 'PDF Tools Hub – Free In-Browser PDF Suite | Toolique',
        'description': 'Complete suite of free, private, client-side PDF tools. Convert PDF to Image, Merge, Split, Compress, Watermark, and Secure documents with zero cloud uploads.',
        'inLanguage': 'en-IN',
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.toolique.in/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'PDF Tools Hub', 'item': 'https://www.toolique.in/pdf' }
          ]
        }
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://www.toolique.in/pdf#faq',
        'mainEntity': localFaqs.map(faq => ({
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

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO
        title="PDF Tools Hub – Free In-Browser PDF Suite | Toolique"
        description="Complete suite of free, private, client-side PDF tools. Convert PDF to Image, Merge, Split, Compress, Watermark, Protect, and Secure documents with zero cloud uploads."
        keywords={[
          'PDF Tools Hub',
          'Free PDF tools online',
          'Client side PDF converter',
          'PDF to Image converter',
          'Merge PDF free',
          'Split PDF range',
          'Compress PDF target KB',
          'Watermark PDF online',
          'PDF password protect',
          'Private PDF tools',
          'PDF without upload',
          'Secure PDF editor browser'
        ]}
        canonicalUrl="https://www.toolique.in/pdf"
        schemaMarkup={hubSchema}
      />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-left bg-gradient-to-br from-rose-500/10 via-orange-500/5 to-indigo-500/10 border border-rose-500/20 dark:border-rose-500/20 shadow-sm">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
            <span>100% In-Browser Privacy • Zero Cloud Uploads</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
            All-in-One Client-Side <span className="bg-gradient-to-r from-rose-600 to-indigo-600 bg-clip-text text-transparent">PDF Tools Hub</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-350 max-w-3xl leading-relaxed">
            Convert, Merge, Split, Compress, Watermark, and Secure PDF documents directly in your browser. Engineered with WebAssembly and local JavaScript binary streams so your confidential agreements and blueprints never touch a remote server.
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {[
              '🔒 100% Private (Local RAM)',
              '⚡ Zero Server Latency',
              '🖼️ 72–600 DPI Conversion',
              '📦 1-Click ZIP Exports',
              '🎯 Target KB Budgeting',
              '🆓 100% Free Forever'
            ].map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 shadow-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Real-time Search & Filter Bar */}
        <div className="relative z-10 mt-8 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PDF tools (e.g. 'convert to png', 'split', 'compress to 200kb', 'watermark')..."
              className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700/80 text-zinc-800 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Primary Tool Spotlight */}
      {!searchQuery && (
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-500/10 via-teal-500/5 to-indigo-500/10 border border-rose-500/20 text-left relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-rose-500 text-white font-extrabold text-[10px] tracking-wider uppercase">
                  Featured Converter
                </span>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                  ⚡ 72 to 600 DPI Support
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                PDF to Image Converter (PNG, JPG, WebP)
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-350 leading-relaxed">
                Transform every PDF page into crisp, high-definition images with custom DPI scales, transparent backgrounds, custom page ranges, sequential progress, and 1-click batch ZIP downloads.
              </p>
            </div>

            <Link
              to="/pdf/pdf-to-image"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-500/20 transition flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
            >
              <span>Launch PDF to Image</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Categorized PDF Tool Clusters */}
      <div className="space-y-10 text-left">
        {categoriesData.map((category) => {
          const filtered = getFilteredTools(category.tools);
          if (filtered.length === 0) return null;

          const IconComponent = category.icon;

          return (
            <section key={category.id} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                        {category.name}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {filtered.length} {filtered.length === 1 ? 'Tool' : 'Tools'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {category.description}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 shrink-0 hidden sm:inline">
                  {category.badge}
                </span>
              </div>

              {/* Tool Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          );
        })}

        {!hasMatches && (
          <div className="p-12 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
              No PDF tools matched &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Reset Search Filter
            </button>
          </div>
        )}
      </div>

      {/* Security & Privacy Architecture Spotlight */}
      <section className="p-8 sm:p-10 rounded-3xl bg-zinc-900 text-white text-left border border-zinc-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold block">
              AIR-GAPPED CLIENT-SIDE ARCHITECTURE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Why In-Browser PDF Processing is the Gold Standard for Privacy
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero Server Transmission</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Traditional cloud editors upload sensitive documents to remote servers. Toolique executes 100% of PDF slicing, merging, and compression in local device RAM.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>WebAssembly Speed</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Hardware-accelerated PDF.js and PDF-Lib engines compile vector graphics and compress raster streams in milliseconds without upload or download queue delays.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Enterprise Compliance</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Fully compliant with GDPR, HIPAA, and corporate confidentiality policies since personal identifiable information (PII) never touches a network socket.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-6 text-left">
        <div className="flex items-center gap-2 border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
          <HelpCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {localFaqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2"
            >
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-start gap-2">
                <span className="text-rose-600 dark:text-rose-400">Q.</span>
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pl-5">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
