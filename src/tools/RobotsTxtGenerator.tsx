import { useState } from 'react';
import { Globe, Copy, FileText, Download, Trash2, Plus } from 'lucide-react';

interface Directives {
  type: 'allow' | 'disallow';
  path: string;
}

export default function RobotsTxtGenerator() {
  const [userAgent, setUserAgent] = useState('*');
  const [crawlDelay, setCrawlDelay] = useState('none');
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [directives, setDirectives] = useState<Directives[]>([
    { type: 'disallow', path: '/admin/' },
    { type: 'disallow', path: '/api/' },
  ]);
  const [copied, setCopied] = useState(false);

  const handleAddDirective = () => {
    setDirectives((prev) => [...prev, { type: 'disallow', path: '' }]);
  };

  const handleRemoveDirective = (idx: number) => {
    setDirectives((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDirectiveChange = (idx: number, field: keyof Directives, value: string) => {
    setDirectives((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d))
    );
  };

  const generateRobotsTxt = () => {
    const lines: string[] = [];
    lines.push(`User-agent: ${userAgent}`);
    if (crawlDelay !== 'none') {
      lines.push(`Crawl-delay: ${crawlDelay}`);
    }

    directives.forEach((d) => {
      if (d.path.trim()) {
        const keyword = d.type === 'allow' ? 'Allow' : 'Disallow';
        lines.push(`${keyword}: ${d.path.trim()}`);
      }
    });

    if (sitemapUrl.trim()) {
      lines.push(`Sitemap: ${sitemapUrl.trim()}`);
    }

    return lines.join('\n');
  };

  const codeString = generateRobotsTxt();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([codeString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
      {/* Configuration Form */}
      <div className="saas-card p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <Globe className="w-4.5 h-4.5 text-indigo-500" />
          <span>Robots.txt Directives</span>
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Default User-Agent</label>
              <select
                value={userAgent}
                onChange={(e) => setUserAgent(e.target.value)}
                className="w-full saas-select text-sm px-3 py-2.5"
              >
                <option value="*">All bots (*)</option>
                <option value="Googlebot">Googlebot (Google)</option>
                <option value="Bingbot">Bingbot (Bing)</option>
                <option value="Baiduspider">Baiduspider (Baidu)</option>
                <option value="Yandex">YandexBot (Yandex)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Crawl-Delay (Seconds)</label>
              <select
                value={crawlDelay}
                onChange={(e) => setCrawlDelay(e.target.value)}
                className="w-full saas-select text-sm px-3 py-2.5"
              >
                <option value="none">No Delay (Default)</option>
                <option value="5">5 seconds</option>
                <option value="10">10 seconds</option>
                <option value="20">20 seconds</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Sitemap URL Link</label>
            <input
              type="text"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              placeholder="https://yourwebsite.com/sitemap.xml"
              className="w-full saas-input text-sm px-3.5 py-2"
            />
          </div>

          {/* Directives Section */}
          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-850">
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Crawl Restrictions</span>
              <button
                onClick={handleAddDirective}
                className="saas-button-primary px-3 py-1.5 text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Path</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {directives.map((d, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={d.type}
                    onChange={(e) => handleDirectiveChange(idx, 'type', e.target.value as any)}
                    className="saas-select text-xs px-2.5 py-2 w-32"
                  >
                    <option value="disallow">Disallow</option>
                    <option value="allow">Allow</option>
                  </select>
                  <input
                    type="text"
                    value={d.path}
                    onChange={(e) => handleDirectiveChange(idx, 'path', e.target.value)}
                    placeholder="e.g. /private/"
                    className="w-full saas-input text-xs px-3 py-2"
                  />
                  <button
                    onClick={() => handleRemoveDirective(idx)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Code output */}
      <div className="space-y-6">
        <div className="saas-card p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Robots.txt Output</span>
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

          <pre className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-4 text-zinc-300 font-mono text-sm leading-relaxed overflow-x-auto h-72 whitespace-pre">
            {codeString}
          </pre>
        </div>
      </div>
    </div>
  );
}
