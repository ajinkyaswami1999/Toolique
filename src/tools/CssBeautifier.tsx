import { useState } from 'react';
import { Copy, Sparkles, FileCode } from 'lucide-react';

export default function CssBeautifier() {
  const [css, setCss] = useState(`.container{width:100%;margin-right:auto;margin-left:auto;padding-right:15px;padding-left:15px}.header{background:#fff;color:#333}`);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [copied, setCopied] = useState(false);

  const beautifyCSS = (input: string, spaces: number) => {
    if (!input) return '';
    let formatted = input;

    // Clean whitespaces
    formatted = formatted.replace(/\s*([{}|:;])\s*/g, '$1');
    formatted = formatted.replace(/\/\*[\s\S]*?\*\//g, (m) => m + '\n');

    // Add newlines around selectors and blocks
    formatted = formatted.replace(/{/g, ' {\n');
    formatted = formatted.replace(/}/g, '\n}\n\n');
    formatted = formatted.replace(/;/g, ';\n');

    // Re-introduce spacing around properties
    formatted = formatted.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('}') || trimmed.startsWith('{') || trimmed.endsWith('{')) {
        return trimmed;
      }
      if (trimmed.includes(':')) {
        const parts = trimmed.split(':');
        const prop = parts[0].trim();
        const val = parts.slice(1).join(':').trim();
        return ' '.repeat(spaces) + `${prop}: ${val}`;
      }
      return ' '.repeat(spaces) + trimmed;
    }).join('\n');

    // Clean up multiple newlines
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    return formatted.trim();
  };

  const output = beautifyCSS(css, indentSize);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
      {/* Input Panel */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileCode className="w-4.5 h-4.5 text-indigo-500" />
            <span>Raw / Minified CSS</span>
          </h3>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-zinc-400 mr-1 uppercase">Indent:</span>
            <select
              value={indentSize}
              onChange={(e) => setIndentSize(Number(e.target.value))}
              className="saas-select text-xs px-2 py-1 w-16"
            >
              <option value="2">2</option>
              <option value="4">4</option>
            </select>
          </div>
        </div>

        <textarea
          value={css}
          onChange={(e) => setCss(e.target.value)}
          placeholder="Paste messy or minified CSS here..."
          className="w-full h-80 saas-input font-mono text-xs leading-relaxed p-4"
        />
      </div>

      {/* Output Panel */}
      <div className="space-y-6">
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-855">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Formatted Output</span>
            </h3>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="saas-button-primary px-3 py-1.5 text-xs flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <textarea
            readOnly
            value={output}
            placeholder="Formatted CSS will display here..."
            className="w-full h-80 saas-input font-mono text-xs leading-relaxed p-4 bg-zinc-50 dark:bg-zinc-950/60"
          />
        </div>
      </div>
    </div>
  );
}
