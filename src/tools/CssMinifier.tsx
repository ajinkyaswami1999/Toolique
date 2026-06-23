import { useState } from 'react';
import { Copy, Sparkles, FileCode } from 'lucide-react';

export default function CssMinifier() {
  const [css, setCss] = useState(`.container {\n  width: 100%;\n  margin-right: auto;\n  margin-left: auto;\n  padding-right: 15px;\n  padding-left: 15px;\n  /* standard spacer comment */\n}`);
  const [copied, setCopied] = useState(false);

  const minifyCSS = (input: string) => {
    if (!input) return '';
    let minified = input;
    
    // Strip comments
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove space around selectors, punctuation
    minified = minified.replace(/\s*([{}|:;,>+~])\s*/g, '$1');
    
    // Remove multiple whitespaces
    minified = minified.replace(/\s+/g, ' ');
    
    // Remove trailing semicolons before closing braces
    minified = minified.replace(/;}/g, '}');
    
    return minified.trim();
  };

  const output = minifyCSS(css);

  const originalSize = css.length;
  const minifiedSize = output.length;
  const savings = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
      {/* Input Field */}
      <div className="lg:col-span-2 saas-card p-6 space-y-4">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <FileCode className="w-4.5 h-4.5 text-indigo-500" />
          <span>Raw CSS stylesheet</span>
        </h3>
        <textarea
          value={css}
          onChange={(e) => setCss(e.target.value)}
          placeholder="Paste your uncompressed CSS here..."
          className="w-full h-96 saas-input font-mono text-xs leading-relaxed p-4"
        />
      </div>

      {/* Summary sidebar */}
      <div className="space-y-6">
        <div className="saas-card p-6 space-y-6">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Compression Statistics</span>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400">Original</span>
                <p className="text-lg font-black text-zinc-700 dark:text-zinc-300 mt-0.5">{originalSize} B</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400">Minified</span>
                <p className="text-lg font-black text-indigo-650 dark:text-indigo-400 mt-0.5">{minifiedSize} B</p>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-center">
              <span className="text-[10px] uppercase tracking-wider font-extrabold block">Savings Ratio</span>
              <p className="text-3xl font-black mt-0.5">{savings.toFixed(1)}%</p>
            </div>

            {minifiedSize > 0 && (
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-850">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-650">Copy Minified Code</span>
                  <button
                    onClick={handleCopy}
                    className="saas-button-primary px-3 py-1.5 text-xs flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy code'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={output}
                  className="w-full h-40 saas-input font-mono text-[10px] p-3 bg-zinc-900 border border-zinc-850 text-zinc-300 leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
