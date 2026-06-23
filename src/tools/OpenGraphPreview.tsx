import { useState } from 'react';
import { Globe, Sparkles, Copy, Eye } from 'lucide-react';

export default function OpenGraphPreview() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    image: '',
    siteName: '',
  });
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'facebook' | 'twitter' | 'linkedin'>('facebook');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const codeString = `<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${formData.url || 'https://yourwebsite.com'}" />
<meta property="og:title" content="${formData.title || 'Your Website Title'}" />
<meta property="og:description" content="${formData.description || 'Your Website Description'}" />
<meta property="og:image" content="${formData.image || 'https://yourwebsite.com/image.png'}" />
<meta property="og:site_name" content="${formData.siteName || 'Site Name'}" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${formData.url || 'https://yourwebsite.com'}" />
<meta property="twitter:title" content="${formData.title || 'Your Website Title'}" />
<meta property="twitter:description" content="${formData.description || 'Your Website Description'}" />
<meta property="twitter:image" content="${formData.image || 'https://yourwebsite.com/image.png'}" />`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewImage = formData.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
  const previewTitle = formData.title || 'Preview Title - Edit to Customize';
  const previewDesc = formData.description || 'Provide a meta description to see how search engines and social platforms index your website details.';
  const previewUrl = formData.url ? formData.url.replace(/https?:\/\/(www\.)?/, '') : 'yourwebsite.com';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
      {/* Settings Form */}
      <div className="saas-card p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <Globe className="w-4.5 h-4.5 text-indigo-500" />
          <span>Open Graph Settings</span>
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Meta Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Toolique | Premium Browser Utilities"
              className="w-full saas-input text-sm px-3.5 py-2"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Meta Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Free in-browser developer, engineering, and design calculators..."
              className="w-full saas-input text-sm p-3 h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Website URL</label>
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className="w-full saas-input text-sm px-3.5 py-2"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Site Name</label>
              <input
                type="text"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                placeholder="e.g. Toolique"
                className="w-full saas-input text-sm px-3.5 py-2"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">OG Image Link (Absolute URL)</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://yourwebsite.com/preview.png"
              className="w-full saas-input text-sm px-3.5 py-2"
            />
          </div>
        </div>
      </div>

      {/* Visual Live Previews */}
      <div className="space-y-6">
        <div className="saas-card p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-500" />
              <span>Social Preview</span>
            </h3>
            
            {/* Platform selection */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
              <button
                onClick={() => setActiveTab('facebook')}
                className={`p-1 px-2.5 rounded-md text-[10px] font-bold uppercase transition flex items-center gap-1 ${
                  activeTab === 'facebook' ? 'bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-50 shadow-sm' : 'text-zinc-500'
                }`}
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>FB</span>
              </button>
              <button
                onClick={() => setActiveTab('twitter')}
                className={`p-1 px-2.5 rounded-md text-[10px] font-bold uppercase transition flex items-center gap-1 ${
                  activeTab === 'twitter' ? 'bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-50 shadow-sm' : 'text-zinc-500'
                }`}
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span>X</span>
              </button>
              <button
                onClick={() => setActiveTab('linkedin')}
                className={`p-1 px-2.5 rounded-md text-[10px] font-bold uppercase transition flex items-center gap-1 ${
                  activeTab === 'linkedin' ? 'bg-white dark:bg-zinc-900 text-zinc-850 dark:text-zinc-50 shadow-sm' : 'text-zinc-500'
                }`}
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                <span>LN</span>
              </button>
            </div>
          </div>

          {/* Facebook Mockup Card */}
          {activeTab === 'facebook' && (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-[#f2f3f5] dark:bg-zinc-950 max-w-md mx-auto">
              <img src={previewImage} alt="Facebook OG" className="w-full h-48 object-cover border-b border-zinc-200 dark:border-zinc-850" />
              <div className="p-4 space-y-1">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase">{previewUrl}</span>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{previewTitle}</h4>
                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{previewDesc}</p>
              </div>
            </div>
          )}

          {/* Twitter / X Mockup Card */}
          {activeTab === 'twitter' && (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 max-w-md mx-auto">
              <img src={previewImage} alt="Twitter Card" className="w-full h-48 object-cover border-b border-zinc-200 dark:border-zinc-850" />
              <div className="p-3.5 space-y-0.5">
                <span className="text-[10px] text-zinc-400 font-semibold">{previewUrl}</span>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{previewTitle}</h4>
                <p className="text-xs text-zinc-500 line-clamp-1 leading-relaxed">{previewDesc}</p>
              </div>
            </div>
          )}

          {/* LinkedIn Mockup Card */}
          {activeTab === 'linkedin' && (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-950 max-w-md mx-auto">
              <img src={previewImage} alt="LinkedIn Post" className="w-full h-48 object-cover border-b border-zinc-200 dark:border-zinc-850" />
              <div className="p-4 space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{previewTitle}</h4>
                <span className="text-[10px] text-zinc-400 font-semibold block">{previewUrl}</span>
              </div>
            </div>
          )}

          {/* Code output */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-850">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>HTML Output</span>
              </span>
              <button
                onClick={handleCopy}
                className="saas-button-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy Tags'}</span>
              </button>
            </div>
            <pre className="bg-zinc-900 border border-zinc-850 text-zinc-300 rounded-xl p-3 text-[10px] font-mono leading-relaxed overflow-x-auto whitespace-pre">
              {codeString}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
