import { useState } from 'react';
import { Globe, Copy, Sparkles, ArrowRightLeft } from 'lucide-react';

export default function HtmlEntityEncoder() {
  const [input, setInput] = useState('<h1>Hello World & Welcome!</h1>');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  const processText = () => {
    if (!input) return '';
    if (mode === 'encode') {
      // Basic HTML Entity Encoding
      return input.replace(/[\u00A0-\u9999<>&"']/g, (i) => {
        return `&#${i.charCodeAt(0)};`;
      });
    } else {
      // Basic HTML Entity Decoding
      const doc = new DOMParser().parseFromString(input, 'text/html');
      return doc.documentElement.textContent || doc.body.textContent || '';
    }
  };

  const output = processText();

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwapMode = () => {
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
    setInput(output);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
      {/* Input panel */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4.5 h-4.5 text-indigo-500" />
            <span>Input Text</span>
          </h3>
          <button
            onClick={handleSwapMode}
            className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:text-indigo-500 hover:border-indigo-500/30 flex items-center gap-1.5 transition"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Mode: {mode === 'encode' ? 'Encode' : 'Decode'}</span>
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'Type or paste HTML code to encode...' : 'Type or paste &lt;h1&gt; code to decode...'}
          className="w-full h-80 saas-input font-mono text-sm leading-relaxed p-4"
        />
      </div>

      {/* Output panel */}
      <div className="space-y-6">
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Processed Output</span>
            </h3>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="saas-button-primary px-3 py-1.5 text-xs flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Result'}</span>
            </button>
          </div>

          <textarea
            readOnly
            value={output}
            placeholder="Processed output will display here..."
            className="w-full h-80 saas-input font-mono text-sm leading-relaxed p-4 bg-zinc-50 dark:bg-zinc-950/60"
          />
        </div>
      </div>
    </div>
  );
}
