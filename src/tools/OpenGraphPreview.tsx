/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import {
  Globe,
  Sparkles,
  Copy,
  Check,
  Download,
  Eye,
  RefreshCw,
  Share2,
  ShieldCheck,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

// --- Types & Interfaces ---
export type SocialPlatform = 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'discord' | 'google';
export type TwitterCardType = 'summary_large_image' | 'summary';
export type OgType = 'website' | 'article' | 'product' | 'profile';

export interface OpenGraphFormData {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  imageAlt: string;
  siteName: string;
  twitterHandle: string;
  authorName: string;
  themeColor: string;
  ogType: OgType;
  twitterCard: TwitterCardType;
  locale: string;
}

export interface OgArchetype {
  id: string;
  name: string;
  description: string;
  data: Partial<OpenGraphFormData>;
}

const OG_ARCHETYPES: OgArchetype[] = [
  {
    id: 'saas_product',
    name: '🚀 SaaS Web App',
    description: 'Modern developer tool suite with high-impact preview',
    data: {
      title: 'Toolique | Free In-Browser Developer & Engineering Calculators',
      description: 'Zero-install, instant, privacy-focused engineering tools and calculators for developers, students, and engineers worldwide.',
      url: 'https://toolique.com',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&auto=format&fit=crop&q=80',
      imageAlt: 'Toolique Engineering Suite Dashboard Preview',
      siteName: 'Toolique',
      twitterHandle: '@toolique_app',
      authorName: 'Toolique Team',
      themeColor: '#4f46e5',
      ogType: 'website',
      twitterCard: 'summary_large_image',
      locale: 'en_US'
    }
  },
  {
    id: 'tech_blog',
    name: '📰 Tech Blog Article',
    description: 'In-depth engineering article with publication metadata',
    data: {
      title: 'How to Size Electrical Cables Accurately (IEC 60364 & NEC Standards)',
      description: 'A complete step-by-step engineering tutorial on cable conductor sizing, ampacity deratings, motor starting inrush, and voltage drop calculations.',
      url: 'https://toolique.com/blog/cable-sizing-guide',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&h=630&auto=format&fit=crop&q=80',
      imageAlt: 'Electrical Cable Engineering Diagram',
      siteName: 'Toolique Engineering Blog',
      twitterHandle: '@toolique_eng',
      authorName: 'Ajinkya Swami',
      themeColor: '#d97706',
      ogType: 'article',
      twitterCard: 'summary_large_image',
      locale: 'en_US'
    }
  },
  {
    id: 'ecommerce_item',
    name: '🛍️ E-Commerce Product',
    description: 'Product listing card with clear visual branding',
    data: {
      title: 'Ergonomic Standing Desk Pro - Solid Teakwood & Dual Motor',
      description: 'Engineered for all-day focus. Features silent dual-stage motors, memory presets, integrated cable channels, and a 10-year warranty.',
      url: 'https://furnispot.com/products/standing-desk-pro',
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=1200&h=630&auto=format&fit=crop&q=80',
      imageAlt: 'Ergonomic Standing Desk Studio Shot',
      siteName: 'FurniSpot Living',
      twitterHandle: '@furnispot',
      authorName: 'FurniSpot Design',
      themeColor: '#059669',
      ogType: 'product',
      twitterCard: 'summary_large_image',
      locale: 'en_US'
    }
  },
  {
    id: 'portfolio',
    name: '💼 Portfolio / Profile',
    description: 'Personal resume and portfolio website card',
    data: {
      title: 'Ajinkya Swami | Lead Software Engineer & AI System Architect',
      description: 'Building high-scale distributed systems, web tooling architectures, and generative AI agents. Explore open-source projects and case studies.',
      url: 'https://ajinkya.dev',
      imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&h=630&auto=format&fit=crop&q=80',
      imageAlt: 'Ajinkya Swami Portfolio Header',
      siteName: 'Ajinkya Swami',
      twitterHandle: '@ajinkya_swami',
      authorName: 'Ajinkya Swami',
      themeColor: '#6366f1',
      ogType: 'profile',
      twitterCard: 'summary_large_image',
      locale: 'en_US'
    }
  }
];

export default function OpenGraphPreview() {
  // Form State
  const [formData, setFormData] = useState<OpenGraphFormData>({
    title: 'Toolique | Free In-Browser Developer & Engineering Tools',
    description: 'Instant, privacy-friendly online utilities for software developers, electrical engineers, and students with zero server uploads.',
    url: 'https://toolique.com',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&auto=format&fit=crop&q=80',
    imageAlt: 'Toolique Web Platform Preview Banner',
    siteName: 'Toolique',
    twitterHandle: '@toolique_app',
    authorName: 'Toolique Team',
    themeColor: '#4f46e5',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    locale: 'en_US'
  });

  // Active Platform View
  const [activePlatform, setActivePlatform] = useState<SocialPlatform>('facebook');
  const [activeCodeFormat, setActiveCodeFormat] = useState<'html' | 'nextjs' | 'jsonld'>('html');
  const [copied, setCopied] = useState<boolean>(false);

  // Field change handler
  const handleChange = (field: keyof OpenGraphFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Preset Applicator
  const handleApplyPreset = (preset: OgArchetype) => {
    setFormData((prev) => ({ ...prev, ...preset.data }));
  };

  // URL Domain Extraction
  const domainName = useMemo(() => {
    try {
      if (!formData.url) return 'yourwebsite.com';
      const parsed = new URL(formData.url.startsWith('http') ? formData.url : `https://${formData.url}`);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return formData.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'yourwebsite.com';
    }
  }, [formData.url]);

  // Length Checks & SEO Health Score
  const healthAnalysis = useMemo(() => {
    const titleLen = formData.title.trim().length;
    const descLen = formData.description.trim().length;
    const hasImage = Boolean(formData.imageUrl.trim());
    const hasUrl = Boolean(formData.url.trim());
    const isHttps = formData.url.startsWith('https://') || formData.imageUrl.startsWith('https://');

    let score = 100;
    const issues: string[] = [];

    // Title checks (Ideal 50 - 60 chars)
    if (titleLen === 0) {
      score -= 30;
      issues.push('Missing Open Graph title.');
    } else if (titleLen < 30) {
      score -= 10;
      issues.push('Title is short (< 30 chars). Consider adding brand keywords.');
    } else if (titleLen > 65) {
      score -= 10;
      issues.push('Title may truncate on mobile feeds (> 65 chars).');
    }

    // Description checks (Ideal 110 - 160 chars)
    if (descLen === 0) {
      score -= 25;
      issues.push('Missing Open Graph description.');
    } else if (descLen < 60) {
      score -= 10;
      issues.push('Description is brief (< 60 chars). Add value proposition.');
    } else if (descLen > 160) {
      score -= 5;
      issues.push('Description is slightly long (> 160 chars) and will truncate.');
    }

    // Image checks
    if (!hasImage) {
      score -= 30;
      issues.push('Missing og:image URL. Social platforms will show text-only cards.');
    } else if (!formData.imageUrl.startsWith('https://')) {
      score -= 10;
      issues.push('Image URL is not HTTPS. Some platforms block unsecure image assets.');
    }

    if (!hasUrl) {
      score -= 10;
      issues.push('Missing og:url canonical link.');
    }

    score = Math.max(0, Math.min(100, score));

    return {
      titleLen,
      descLen,
      hasImage,
      hasUrl,
      isHttps,
      score,
      issues
    };
  }, [formData]);

  // HTML Code String
  const htmlCodeString = useMemo(() => {
    return `<!-- Primary Meta Tags -->
<title>${formData.title || 'Your Website Title'}</title>
<meta name="title" content="${formData.title || 'Your Website Title'}" />
<meta name="description" content="${formData.description || 'Your Website Description'}" />
<link rel="canonical" href="${formData.url || 'https://yourwebsite.com'}" />
<meta name="theme-color" content="${formData.themeColor || '#4f46e5'}" />

<!-- Open Graph / Facebook / LinkedIn / WhatsApp -->
<meta property="og:type" content="${formData.ogType}" />
<meta property="og:url" content="${formData.url || 'https://yourwebsite.com'}" />
<meta property="og:title" content="${formData.title || 'Your Website Title'}" />
<meta property="og:description" content="${formData.description || 'Your Website Description'}" />
<meta property="og:image" content="${formData.imageUrl || 'https://yourwebsite.com/og-image.jpg'}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${formData.imageAlt || formData.title}" />
<meta property="og:site_name" content="${formData.siteName || 'Site Name'}" />
<meta property="og:locale" content="${formData.locale}" />

<!-- Twitter / X -->
<meta name="twitter:card" content="${formData.twitterCard}" />
<meta name="twitter:url" content="${formData.url || 'https://yourwebsite.com'}" />
<meta name="twitter:title" content="${formData.title || 'Your Website Title'}" />
<meta name="twitter:description" content="${formData.description || 'Your Website Description'}" />
<meta name="twitter:image" content="${formData.imageUrl || 'https://yourwebsite.com/og-image.jpg'}" />
<meta name="twitter:image:alt" content="${formData.imageAlt || formData.title}" />
<meta name="twitter:site" content="${formData.twitterHandle || '@yourhandle'}" />
<meta name="twitter:creator" content="${formData.twitterHandle || '@yourhandle'}" />`;
  }, [formData]);

  // Next.js App Router Metadata Code
  const nextjsCodeString = useMemo(() => {
    return `// Next.js App Router: app/layout.tsx or app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${formData.title || 'Your Website Title'}',
  description: '${formData.description || 'Your Website Description'}',
  alternates: {
    canonical: '${formData.url || 'https://yourwebsite.com'}',
  },
  openGraph: {
    type: '${formData.ogType === 'article' ? 'article' : 'website'}',
    url: '${formData.url || 'https://yourwebsite.com'}',
    title: '${formData.title || 'Your Website Title'}',
    description: '${formData.description || 'Your Website Description'}',
    siteName: '${formData.siteName || 'Site Name'}',
    locale: '${formData.locale}',
    images: [
      {
        url: '${formData.imageUrl || 'https://yourwebsite.com/og-image.jpg'}',
        width: 1200,
        height: 630,
        alt: '${formData.imageAlt || formData.title}',
      },
    ],
  },
  twitter: {
    card: '${formData.twitterCard}',
    title: '${formData.title || 'Your Website Title'}',
    description: '${formData.description || 'Your Website Description'}',
    creator: '${formData.twitterHandle || '@yourhandle'}',
    images: ['${formData.imageUrl || 'https://yourwebsite.com/og-image.jpg'}'],
  },
};`;
  }, [formData]);

  // JSON-LD Schema Code
  const jsonLdCodeString = useMemo(() => {
    return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "${formData.ogType === 'article' ? 'Article' : 'WebSite'}",
  "name": "${formData.title || 'Your Website Title'}",
  "url": "${formData.url || 'https://yourwebsite.com'}",
  "description": "${formData.description || 'Your Website Description'}",
  "image": "${formData.imageUrl || 'https://yourwebsite.com/og-image.jpg'}",
  "author": {
    "@type": "Person",
    "name": "${formData.authorName || formData.siteName}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "${formData.siteName || 'Site Name'}",
    "logo": {
      "@type": "ImageObject",
      "url": "${formData.imageUrl || 'https://yourwebsite.com/logo.png'}"
    }
  }
}
</script>`;
  }, [formData]);

  // Copy active code string
  const handleCopyCode = () => {
    const textToCopy =
      activeCodeFormat === 'html'
        ? htmlCodeString
        : activeCodeFormat === 'nextjs'
        ? nextjsCodeString
        : jsonLdCodeString;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export HTML file
  const handleExportHtml = () => {
    const blob = new Blob([htmlCodeString], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `og_meta_tags_${domainName.replace(/[^a-z0-9]/gi, '_')}.html`;
    link.click();
  };

  const handleReset = () => {
    setFormData({
      title: 'Toolique | Free In-Browser Developer & Engineering Tools',
      description: 'Instant, privacy-friendly online utilities for software developers, electrical engineers, and students with zero server uploads.',
      url: 'https://toolique.com',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&auto=format&fit=crop&q=80',
      imageAlt: 'Toolique Web Platform Preview Banner',
      siteName: 'Toolique',
      twitterHandle: '@toolique_app',
      authorName: 'Toolique Team',
      themeColor: '#4f46e5',
      ogType: 'website',
      twitterCard: 'summary_large_image',
      locale: 'en_US'
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* AEO Instant Social Metadata Insights Card (Zero Double Heading) */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/70 dark:from-indigo-950/30 dark:via-zinc-900/60 dark:to-sky-950/20 border border-indigo-200/80 dark:border-indigo-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3 fill-current" /> AEO Social Card Studio
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Open Graph Protocol & Twitter Card Validator
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
              <span>SEO Score: <strong className={`font-mono text-base ${healthAnalysis.score >= 90 ? 'text-emerald-600 dark:text-emerald-400' : healthAnalysis.score >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{healthAnalysis.score}/100</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Title: <strong className={`font-mono ${healthAnalysis.titleLen >= 30 && healthAnalysis.titleLen <= 65 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{healthAnalysis.titleLen} chars</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Desc: <strong className={`font-mono ${healthAnalysis.descLen >= 70 && healthAnalysis.descLen <= 160 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{healthAnalysis.descLen} chars</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>1200×630 Image: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{healthAnalysis.hasImage ? 'Ready (1.91:1)' : 'Missing'}</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{copied ? 'Copied Tags!' : 'Copy Tags'}</span>
            </button>

            <button
              onClick={handleExportHtml}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export HTML</span>
            </button>
          </div>
        </div>

        {/* 1-Click Archetype Presets */}
        <div className="mt-3 pt-3 border-t border-indigo-100/70 dark:border-indigo-900/30 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Archetypes:
          </span>
          {OG_ARCHETYPES.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/80 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 transition cursor-pointer"
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Settings & Audit */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-500" />
                Open Graph & Social Metadata Fields
              </h3>
              <button
                onClick={handleReset}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1 transition cursor-pointer"
                title="Reset to default template"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Title with Length Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Page Meta Title (`og:title`)
                </label>
                <span className={`font-mono text-[11px] font-bold ${healthAnalysis.titleLen >= 30 && healthAnalysis.titleLen <= 65 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {healthAnalysis.titleLen} / 60 chars
                </span>
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Toolique | Free In-Browser Developer Tools"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Description with Length Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Page Meta Description (`og:description`)
                </label>
                <span className={`font-mono text-[11px] font-bold ${healthAnalysis.descLen >= 70 && healthAnalysis.descLen <= 160 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {healthAnalysis.descLen} / 155 chars
                </span>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                placeholder="Write an engaging 110-155 character summary with clear user benefits..."
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* URL and Site Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Canonical URL (`og:url`)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://yourwebsite.com/page"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Brand / Site Name (`og:site_name`)
                </label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                  placeholder="e.g. Toolique"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Image URL and Alt Text */}
            <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  OG Image Absolute URL (1200×630px recommended)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                    placeholder="https://yourwebsite.com/og-banner.jpg"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-400 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Image Alt Description (`og:image:alt`)
                  </label>
                  <input
                    type="text"
                    value={formData.imageAlt}
                    onChange={(e) => handleChange('imageAlt', e.target.value)}
                    placeholder="Accessible description of image"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Twitter Card Format
                  </label>
                  <select
                    value={formData.twitterCard}
                    onChange={(e) => handleChange('twitterCard', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white"
                  >
                    <option value="summary_large_image">Summary with Large Image (1200×628)</option>
                    <option value="summary">Standard Summary (Square 1:1 Thumbnail)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Advanced Metadata Accordion */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Twitter Handle</label>
                <input
                  type="text"
                  value={formData.twitterHandle}
                  onChange={(e) => handleChange('twitterHandle', e.target.value)}
                  placeholder="@handle"
                  className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">OG Type</label>
                <select
                  value={formData.ogType}
                  onChange={(e) => handleChange('ogType', e.target.value as OgType)}
                  className="w-full px-2 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-zinc-900 dark:text-white"
                >
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="product">product</option>
                  <option value="profile">profile</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Theme Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={formData.themeColor}
                    onChange={(e) => handleChange('themeColor', e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.themeColor}
                    onChange={(e) => handleChange('themeColor', e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono font-semibold text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Health Audit Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Social Card Readiness Audit
              </span>
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${healthAnalysis.score >= 90 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : healthAnalysis.score >= 70 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                {healthAnalysis.score} / 100
              </span>
            </div>

            {healthAnalysis.issues.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All Open Graph tags and dimensions are optimized for social feeds!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {healthAnalysis.issues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Mockup Simulator & Exporter */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xs">
            {/* Platform Tab Buttons */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-500" /> Live Feed Simulation
              </span>

              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                {[
                  { id: 'facebook', label: 'FB' },
                  { id: 'twitter', label: 'X (Twitter)' },
                  { id: 'linkedin', label: 'LinkedIn' },
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'google', label: 'Google' }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlatform(p.id as SocialPlatform)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                      activePlatform === p.id
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* MOCKUP CONTAINER */}
            <div className="p-2 sm:p-4 bg-zinc-100/70 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center min-h-[320px]">
              {/* FACEBOOK MOCKUP */}
              {activePlatform === 'facebook' && (
                <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt={formData.imageAlt || formData.title}
                      className="w-full h-48 sm:h-52 object-cover border-b border-zinc-200 dark:border-zinc-800"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&auto=format&fit=crop&q=80';
                      }}
                    />
                  )}
                  <div className="p-3.5 space-y-1 bg-[#f0f2f5] dark:bg-zinc-900/90">
                    <span className="block text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                      {domainName}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 leading-snug">
                      {formData.title || 'Your Website Title'}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {formData.description || 'Your website description will appear here on social timelines.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TWITTER / X MOCKUP */}
              {activePlatform === 'twitter' && (
                <div className="w-full max-w-md bg-white dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                  {formData.twitterCard === 'summary_large_image' ? (
                    <div>
                      {formData.imageUrl && (
                        <img
                          src={formData.imageUrl}
                          alt={formData.imageAlt || formData.title}
                          className="w-full h-48 sm:h-52 object-cover border-b border-zinc-200 dark:border-zinc-800"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&auto=format&fit=crop&q=80';
                          }}
                        />
                      )}
                      <div className="p-3.5 space-y-1">
                        <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          {domainName}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">
                          {formData.title || 'Your Website Title'}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {formData.description || 'Your website description will appear here on social timelines.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center p-3 gap-3">
                      {formData.imageUrl && (
                        <img
                          src={formData.imageUrl}
                          alt="Thumbnail"
                          className="w-20 h-20 rounded-xl object-cover shrink-0"
                        />
                      )}
                      <div className="space-y-0.5 overflow-hidden">
                        <span className="block text-[10px] font-medium text-zinc-400">{domainName}</span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">{formData.title}</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">{formData.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LINKEDIN MOCKUP */}
              {activePlatform === 'linkedin' && (
                <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt={formData.imageAlt || formData.title}
                      className="w-full h-48 sm:h-52 object-cover border-b border-zinc-200 dark:border-zinc-800"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&auto=format&fit=crop&q=80';
                      }}
                    />
                  )}
                  <div className="p-3.5 space-y-1">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug">
                      {formData.title || 'Your Website Title'}
                    </h4>
                    <span className="block text-[11px] text-zinc-400 font-medium">{domainName}</span>
                  </div>
                </div>
              )}

              {/* WHATSAPP MOCKUP */}
              {activePlatform === 'whatsapp' && (
                <div className="w-full max-w-sm bg-[#e7ffdb] dark:bg-[#005c4b] p-2.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-xs space-y-1.5">
                  <div className="bg-white/80 dark:bg-zinc-900/80 rounded-xl overflow-hidden border border-emerald-100 dark:border-emerald-900/40">
                    {formData.imageUrl && (
                      <img
                        src={formData.imageUrl}
                        alt="WhatsApp Preview"
                        className="w-full h-36 object-cover"
                      />
                    )}
                    <div className="p-2.5 space-y-0.5">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">{formData.title}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-300 line-clamp-2 leading-tight">{formData.description}</p>
                      <span className="block text-[9px] text-zinc-400 pt-0.5">{domainName}</span>
                    </div>
                  </div>
                  <div className="px-1 text-xs text-blue-600 dark:text-sky-300 font-mono truncate">
                    {formData.url || 'https://yourwebsite.com'}
                  </div>
                </div>
              )}

              {/* GOOGLE SERP MOCKUP */}
              {activePlatform === 'google' && (
                <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {domainName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">{formData.siteName || domainName}</span>
                      <span className="block text-[10px] text-zinc-400 font-mono truncate">{formData.url || 'https://yourwebsite.com'}</span>
                    </div>
                  </div>
                  <h4 className="text-base font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
                    {formData.title || 'Your Website Title'}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {formData.description || 'Your meta description provides search engines and prospective visitors with an informative synopsis of page content.'}
                  </p>
                </div>
              )}
            </div>

            {/* Code Generation & Copy Panel */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg">
                  <button
                    onClick={() => setActiveCodeFormat('html')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      activeCodeFormat === 'html'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    HTML Meta Tags
                  </button>
                  <button
                    onClick={() => setActiveCodeFormat('nextjs')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      activeCodeFormat === 'nextjs'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    Next.js Metadata
                  </button>
                  <button
                    onClick={() => setActiveCodeFormat('jsonld')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      activeCodeFormat === 'jsonld'
                        ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                        : 'text-zinc-500'
                    }`}
                  >
                    JSON-LD Schema
                  </button>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-200/60 dark:border-indigo-900/50 flex items-center gap-1.5 hover:bg-indigo-100 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-3.5 bg-zinc-950 text-zinc-200 border border-zinc-800 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-56">
                {activeCodeFormat === 'html'
                  ? htmlCodeString
                  : activeCodeFormat === 'nextjs'
                  ? nextjsCodeString
                  : jsonLdCodeString}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
