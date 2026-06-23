import { useState } from 'react';
import { Globe, Copy, Sparkles, RefreshCw } from 'lucide-react';

export default function CanonicalUrlGenerator() {
  const [protocol, setProtocol] = useState('https://');
  const [domain, setDomain] = useState('toolique.in');
  const [path, setPath] = useState('tool/canonical-url-generator');
  const [stripSlash, setStripSlash] = useState(true);
  const [stripQuery, setStripQuery] = useState(true);
  const [copied, setCopied] = useState(false);

  const generateCanonical = () => {
    let cleanDomain = domain.trim().replace(/\/+$/, '');
    let cleanPath = path.trim().replace(/^\/+/, '').replace(/\/+$/, '');

    let fullUrl = `${protocol}${cleanDomain}`;
    if (cleanPath) {
      fullUrl += `/${cleanPath}`;
    }

    if (!stripSlash) {
      fullUrl += '/';
    }

    return {
      tag: `<link rel="canonical" href="${fullUrl}" />`,
      header: `Link: <${fullUrl}>; rel="canonical"`,
      url: fullUrl
    };
  };

  const outputs = generateCanonical();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setProtocol('https://');
    setDomain('toolique.in');
    setPath('tool/canonical-url-generator');
    setStripSlash(true);
    setStripQuery(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
      {/* Settings Form */}
      <div className="saas-card p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <Globe className="w-4.5 h-4.5 text-indigo-500" />
          <span>Canonical Parameters</span>
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Protocol</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className="w-full saas-select text-xs px-2.5 py-2"
              >
                <option value="https://">https://</option>
                <option value="http://">http://</option>
              </select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Domain / Host</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="domain.com"
                className="w-full saas-input text-xs px-3 py-2"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">URL Path / Page Slug</label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="e.g. blog/seo-tips"
              className="w-full saas-input text-xs px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={stripSlash}
                onChange={(e) => setStripSlash(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-650 focus:ring-indigo-500/20"
              />
              <span className="text-xs font-bold text-zinc-705 dark:text-zinc-350">Remove trailing slash (e.g. `/page` instead of `/page/`)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={stripQuery}
                onChange={(e) => setStripQuery(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-650 focus:ring-indigo-500/20"
              />
              <span className="text-xs font-bold text-zinc-705 dark:text-zinc-350">Strip search parameters / query strings</span>
            </label>
          </div>

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:text-indigo-500 hover:border-indigo-500/30 flex items-center gap-1.5 transition duration-300"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Values</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code output */}
      <div className="space-y-6">
        <div className="saas-card p-6 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
            <span>SEO Directives</span>
          </h3>

          <div className="space-y-5">
            {/* HTML Link tag */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-500">
                <span>HTML Canonical Link Element</span>
                <button
                  onClick={() => handleCopy(outputs.tag)}
                  className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1 text-[11px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Tag</span>
                </button>
              </div>
              <pre className="bg-zinc-900 border border-zinc-850 text-zinc-300 rounded-xl p-3 text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre">
                {outputs.tag}
              </pre>
            </div>

            {/* HTTP Header tag */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-500">
                <span>HTTP Link Header Equivalent</span>
                <button
                  onClick={() => handleCopy(outputs.header)}
                  className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1 text-[11px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Header</span>
                </button>
              </div>
              <pre className="bg-zinc-900 border border-zinc-850 text-zinc-300 rounded-xl p-3 text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre">
                {outputs.header}
              </pre>
            </div>

            {/* Notification */}
            {copied && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-center text-xs font-bold">
                ✓ Copied to clipboard!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
