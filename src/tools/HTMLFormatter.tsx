import { useState } from 'react';
import { Copy, Sparkles, Code, Trash2 } from 'lucide-react';

export default function HTMLFormatter() {
  const [htmlInput, setHtmlInput] = useState(`<div class="container">\n<h1>Welcome to Toolique</h1>\n<p>Format your <b>HTML</b> codebase online easily.</p>\n<img src="logo.png" alt="Logo" />\n<!-- Quick comment -->\n</div>`);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [copied, setCopied] = useState(false);

  const formatHTML = (html: string, indent: number): string => {
    if (!html.trim()) return '';
    
    let formatted = '';
    const reg = /(<\/?[a-zA-Z0-9\-]+(?:\s+[a-zA-Z0-9\-]+(?:=(?:"[^"]*"|'[^']*'|[^>\s]+))?)*\s*\/?>)|([^<>]+)/g;
    let pad = 0;
    
    // List of standard self-closing tags in HTML
    const selfClosingTags = /^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;

    let match;
    while ((match = reg.exec(html)) !== null) {
      const tag = match[1];
      const text = match[2];

      if (text && text.trim()) {
        formatted += ' '.repeat(pad * indent) + text.trim() + '\n';
      } else if (tag) {
        const isClosing = tag.startsWith('</');
        const isSelfClosingInline = tag.endsWith('/>');

        // Extract tag name
        const tagNameMatch = tag.match(/<\/?([a-zA-Z0-9\-]+)/);
        const tagName = tagNameMatch ? tagNameMatch[1] : '';
        const isStandardSelfClosing = selfClosingTags.test(tagName);

        if (isClosing) {
          pad = Math.max(0, pad - 1);
          formatted += ' '.repeat(pad * indent) + tag + '\n';
        } else if (isSelfClosingInline || isStandardSelfClosing) {
          formatted += ' '.repeat(pad * indent) + tag + '\n';
        } else {
          formatted += ' '.repeat(pad * indent) + tag + '\n';
          pad++;
        }
      }
    }
    
    return formatted.trim();
  };

  const handleFormat = () => {
    const formatted = formatHTML(htmlInput, indentSize);
    setHtmlInput(formatted);
  };

  const handleMinify = () => {
    const minified = htmlInput
      .replace(/>\s+</g, '><')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    setHtmlInput(minified);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-6 text-left">
      <div className="saas-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-500" />
              <span>HTML Formatter</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Format markup trees, clean spaces, and minify HTML text payloads.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg text-xs font-semibold">
              <span className="text-zinc-500">Indent:</span>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(parseInt(e.target.value, 10))}
                className="bg-transparent border-none focus:outline-none cursor-pointer text-zinc-700 dark:text-zinc-300"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
                <option value={8}>8 Spaces</option>
              </select>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => setHtmlInput('')}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            className="w-full h-80 font-mono text-sm p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none resize-y"
            placeholder="Paste your HTML code here..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleFormat}
              className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Format HTML</span>
            </button>
            <button
              onClick={handleMinify}
              className="py-3 bg-zinc-850 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition shadow flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 rotate-180" />
              <span>Minify HTML</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
