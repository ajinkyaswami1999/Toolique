import { useState } from 'react';
import { Code2, Copy, Check, Sparkles, Trash2, ArrowDownUp, AlertCircle } from 'lucide-react';

export default function JSONFormatter() {
  const [inputJson, setInputJson] = useState<string>('');
  const [outputJson, setOutputJson] = useState<string>('');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const sampleJson = `{
  "site": "Toolique",
  "founder": "Ajinkya",
  "active": true,
  "toolsCount": 12,
  "categories": ["finance", "developer", "image", "utility"],
  "features": {
    "responsive": true,
    "fast": true,
    "noBackend": true
  }
}`;

  const formatJSON = () => {
    setError(null);
    if (!inputJson.trim()) {
      setOutputJson('');
      return;
    }

    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutputJson(formatted);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
      setOutputJson('');
    }
  };

  const minifyJSON = () => {
    setError(null);
    if (!inputJson.trim()) return;

    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
      setOutputJson('');
    }
  };

  const copyToClipboard = () => {
    if (!outputJson) return;
    navigator.clipboard.writeText(outputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInputJson('');
    setOutputJson('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Samples section */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Load Sample:</span>
        <button
          onClick={() => {
            setInputJson(sampleJson);
            setError(null);
            setOutputJson('');
          }}
          className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-teal-600 transition"
        >
          Sample JSON Object
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Text Area */}
        <div className="flex flex-col h-[600px] p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <Code2 className="w-4 h-4 text-slate-400" />
              Source JSON String
            </span>
            <button
              onClick={clear}
              className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition cursor-pointer"
              title="Clear input"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            className="flex-grow w-full p-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-slate-50/50 dark:bg-slate-950/50 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-150 resize-none"
            placeholder="Paste your raw, compressed, or invalid JSON here..."
          />
          <div className="flex flex-wrap gap-4 items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50">
            {/* Indent select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Indentation:</span>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-semibold text-slate-600 dark:text-slate-400 focus:outline-none"
              >
                <option value="2" className="dark:bg-slate-955 dark:text-white text-slate-800">2 Spaces</option>
                <option value="4" className="dark:bg-slate-955 dark:text-white text-slate-800">4 Spaces</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={minifyJSON}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer"
              >
                <ArrowDownUp className="w-3.5 h-3.5" />
                <span>Minify</span>
              </button>
              <button
                onClick={formatJSON}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white shadow-sm transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Beautify</span>
              </button>
            </div>
          </div>
        </div>

        {/* Output Area */}
        <div className="flex flex-col h-[600px] p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-slate-800 dark:text-slate-200">
          <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-250">Result</span>
            {outputJson && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
          
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-2.5 text-xs font-semibold mb-4 leading-normal">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <div className="font-bold text-rose-500 uppercase tracking-wide">Validation Error</div>
                <div className="mt-0.5 font-mono">{error}</div>
              </div>
            </div>
          )}

          {outputJson ? (
            <pre className="flex-grow w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-100 dark:border-zinc-800/50 font-mono text-sm leading-relaxed overflow-auto text-teal-700 dark:text-teal-400">
              <code>{outputJson}</code>
            </pre>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400 dark:text-slate-550 text-center p-6">
              <Code2 className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm">Click "Beautify" or "Minify" on the left to see validated output here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

