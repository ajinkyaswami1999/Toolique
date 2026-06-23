import { useState } from 'react';
import { Globe, Copy, Sparkles } from 'lucide-react';

export default function MetaTagGenerator() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    author: '',
    robotsIndex: 'index',
    robotsFollow: 'follow',
    ogTitle: '',
    ogDescription: '',
    ogUrl: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
  });
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateHTML = () => {
    const lines: string[] = [];
    lines.push('<!-- Primary Meta Tags -->');
    if (formData.title) lines.push(`<title>${formData.title}</title>`);
    lines.push(`<meta name="title" content="${formData.title || ''}" />`);
    if (formData.description) lines.push(`<meta name="description" content="${formData.description}" />`);
    if (formData.keywords) lines.push(`<meta name="keywords" content="${formData.keywords}" />`);
    if (formData.author) lines.push(`<meta name="author" content="${formData.author}" />`);
    lines.push(`<meta name="robots" content="${formData.robotsIndex}, ${formData.robotsFollow}" />`);

    const ogTitle = formData.ogTitle || formData.title;
    const ogDesc = formData.ogDescription || formData.description;

    lines.push('');
    lines.push('<!-- Open Graph / Facebook -->');
    lines.push('<meta property="og:type" content="website" />');
    if (formData.ogUrl) lines.push(`<meta property="og:url" content="${formData.ogUrl}" />`);
    if (ogTitle) lines.push(`<meta property="og:title" content="${ogTitle}" />`);
    if (ogDesc) lines.push(`<meta property="og:description" content="${ogDesc}" />`);
    if (formData.ogImage) lines.push(`<meta property="og:image" content="${formData.ogImage}" />`);

    const twTitle = formData.twitterTitle || ogTitle;
    const twDesc = formData.twitterDescription || ogDesc;
    const twImg = formData.twitterImage || formData.ogImage;

    lines.push('');
    lines.push('<!-- Twitter -->');
    lines.push(`<meta property="twitter:card" content="${formData.twitterCard}" />`);
    if (formData.ogUrl) lines.push(`<meta property="twitter:url" content="${formData.ogUrl}" />`);
    if (twTitle) lines.push(`<meta property="twitter:title" content="${twTitle}" />`);
    if (twDesc) lines.push(`<meta property="twitter:description" content="${twDesc}" />`);
    if (twImg) lines.push(`<meta property="twitter:image" content="${twImg}" />`);

    return lines.join('\n');
  };

  const codeString = generateHTML();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Settings Form */}
      <div className="saas-card p-6 space-y-6 text-left">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Globe className="w-4.5 h-4.5 text-indigo-500" />
          <span>SEO Meta Tag Settings</span>
        </h3>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {/* Primary Tags */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Primary SEO Tags</h4>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Site Title (Recommended 50-60 characters)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Toolique | Free Online Calculators"
                className="w-full saas-input text-sm px-3 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Meta Description (Recommended 150-160 characters)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Free online developer, finance, civil, and image utilities..."
                className="w-full saas-input text-sm p-3 h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Keywords (Comma separated)</label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  placeholder="calculators, utilities, tools"
                  className="w-full saas-input text-sm px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="e.g. Toolique Team"
                  className="w-full saas-input text-sm px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Robots Index</label>
                <select
                  name="robotsIndex"
                  value={formData.robotsIndex}
                  onChange={handleChange}
                  className="w-full saas-select text-sm px-3 py-2"
                >
                  <option value="index">Index (Allow search engine indexes)</option>
                  <option value="noindex">Noindex (Hide from search results)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Robots Follow</label>
                <select
                  name="robotsFollow"
                  value={formData.robotsFollow}
                  onChange={handleChange}
                  className="w-full saas-select text-sm px-3 py-2"
                >
                  <option value="follow">Follow (Follow page links)</option>
                  <option value="nofollow">Nofollow (Do not scan page links)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Open Graph Tags */}
          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-850">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Open Graph (Facebook / Social Sharing)</h4>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">OG URL</label>
              <input
                type="text"
                name="ogUrl"
                value={formData.ogUrl}
                onChange={handleChange}
                placeholder="e.g. https://toolique.in"
                className="w-full saas-input text-sm px-3 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">OG Title (Overrides Primary Title if set)</label>
              <input
                type="text"
                name="ogTitle"
                value={formData.ogTitle}
                onChange={handleChange}
                placeholder="e.g. Toolique Social Preview"
                className="w-full saas-input text-sm px-3 py-2"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">OG Image URL (Absolute link)</label>
              <input
                type="text"
                name="ogImage"
                value={formData.ogImage}
                onChange={handleChange}
                placeholder="e.g. https://toolique.in/banner.png"
                className="w-full saas-input text-sm px-3 py-2"
              />
            </div>
          </div>

          {/* Twitter Card Tags */}
          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-850">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Twitter Cards</h4>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Twitter Card Type</label>
              <select
                name="twitterCard"
                value={formData.twitterCard}
                onChange={handleChange}
                className="w-full saas-select text-sm px-3 py-2"
              >
                <option value="summary">Summary Card (Square image)</option>
                <option value="summary_large_image">Summary Card with Large Image</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Twitter Image URL</label>
              <input
                type="text"
                name="twitterImage"
                value={formData.twitterImage}
                onChange={handleChange}
                placeholder="e.g. https://toolique.in/twitter-card.png"
                className="w-full saas-input text-sm px-3 py-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Code output and preview */}
      <div className="space-y-6 text-left">
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Generated Code</span>
            </h3>
            <button
              onClick={handleCopy}
              className="saas-button-primary px-3 py-1.5 text-xs flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-4 text-zinc-300 font-mono text-[11px] leading-relaxed overflow-x-auto h-96 whitespace-pre">
              {codeString}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
