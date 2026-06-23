import { useState } from 'react';
import { Globe, Copy, FileCode, Download } from 'lucide-react';

export default function SitemapGenerator() {
  const [urlInput, setUrlInput] = useState('https://yourwebsite.com/\nhttps://yourwebsite.com/about\nhttps://yourwebsite.com/contact');
  const [changefreq, setChangefreq] = useState('weekly');
  const [priority, setPriority] = useState('0.8');
  const [includeLastmod, setIncludeLastmod] = useState(true);
  const [copied, setCopied] = useState(false);

  const generateSitemap = () => {
    const urls = urlInput
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    const todayStr = new Date().toISOString().split('T')[0];

    const lines: string[] = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    urls.forEach((url) => {
      lines.push('  <url>');
      lines.push(`    <loc>${url}</loc>`);
      if (includeLastmod) {
        lines.push(`    <lastmod>${todayStr}</lastmod>`);
      }
      lines.push(`    <changefreq>${changefreq}</changefreq>`);
      lines.push(`    <priority>${priority}</priority>`);
      lines.push('  </url>');
    });

    lines.push('</urlset>');
    return lines.join('\n');
  };

  const codeString = generateSitemap();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([codeString], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
      {/* Configuration Form */}
      <div className="saas-card p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <Globe className="w-4.5 h-4.5 text-indigo-500" />
          <span>Sitemap Configurator</span>
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">URLs List (One link per line)</label>
            <textarea
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://yourwebsite.com/&#10;https://yourwebsite.com/about"
              className="w-full saas-input text-xs font-mono p-3 h-40 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Change Frequency</label>
              <select
                value={changefreq}
                onChange={(e) => setChangefreq(e.target.value)}
                className="w-full saas-select text-xs px-2.5 py-2"
              >
                <option value="always">Always</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="never">Never</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Priority (Weight)</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full saas-select text-xs px-2.5 py-2"
              >
                <option value="1.0">1.0 (Homepage / Primary)</option>
                <option value="0.9">0.9</option>
                <option value="0.8">0.8 (Main sections)</option>
                <option value="0.7">0.7</option>
                <option value="0.6">0.6</option>
                <option value="0.5">0.5 (Utility/Footer)</option>
                <option value="0.3">0.3 (Low priority)</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeLastmod}
              onChange={(e) => setIncludeLastmod(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-650 focus:ring-indigo-500/20"
            />
            <span className="text-xs font-bold text-zinc-705 dark:text-zinc-350">Include Last Modification Date (`&lt;lastmod&gt;` today)</span>
          </label>
        </div>
      </div>

      {/* Code output */}
      <div className="space-y-6">
        <div className="saas-card p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-indigo-500" />
              <span>XML Sitemap Output</span>
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="saas-button-primary px-3 py-1.5 text-xs flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="saas-button-secondary px-3 py-1.5 text-xs flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <pre className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-4 text-zinc-300 font-mono text-[11px] leading-relaxed overflow-x-auto h-96 whitespace-pre">
            {codeString}
          </pre>
        </div>
      </div>
    </div>
  );
}
