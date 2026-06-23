import { useState } from 'react';
import { Copy, Sparkles, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

export default function JSONValidator() {
  const [jsonInput, setJsonInput] = useState('{\n  "name": "Toolique",\n  "status": "active",\n  "features": ["conversion", "formatting"],\n  "version": 1.2\n}');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    line?: number;
    column?: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleValidate = () => {
    if (!jsonInput.trim()) {
      setValidationResult({
        isValid: false,
        message: 'Input is empty. Please enter a JSON string to validate.'
      });
      return;
    }

    try {
      JSON.parse(jsonInput);
      setValidationResult({
        isValid: true,
        message: 'Valid JSON structure!'
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Invalid JSON';
      
      // Parse line and column numbers from typical browser JS engine messages
      let line: number | undefined;
      let column: number | undefined;
      
      const positionMatch = errorMsg.match(/at position (\d+)/i);
      if (positionMatch) {
        const position = parseInt(positionMatch[1], 10);
        const sub = jsonInput.substring(0, position);
        const lines = sub.split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
      
      const lineColMatch = errorMsg.match(/line (\d+) column (\d+)/i);
      if (lineColMatch) {
        line = parseInt(lineColMatch[1], 10);
        column = parseInt(lineColMatch[2], 10);
      }

      setValidationResult({
        isValid: false,
        message: errorMsg,
        line,
        column
      });
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setValidationResult({
        isValid: true,
        message: 'Valid JSON and beautifully formatted!'
      });
    } catch (err: any) {
      handleValidate();
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
      setValidationResult({
        isValid: true,
        message: 'Valid JSON and minified!'
      });
    } catch (err: any) {
      handleValidate();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-6 text-left">
      <div className="saas-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">JSON Input Editor</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Validate, format, and minify JSON schema data entirely in-browser.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleFormat}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Format</span>
            </button>
            <button
              onClick={handleMinify}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 rotate-180" />
              <span>Minify</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => {
                setJsonInput('');
                setValidationResult(null);
              }}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-96 font-mono text-sm p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none resize-y"
            placeholder='Paste your JSON code here...'
          />
          <button
            onClick={handleValidate}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm hover:shadow flex items-center justify-center gap-2"
          >
            <span>Validate JSON</span>
          </button>
        </div>

        {validationResult && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition ${
              validationResult.isValid
                ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-350'
                : 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-500/20 text-rose-800 dark:text-rose-350'
            }`}
          >
            {validationResult.isValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="font-bold text-sm">
                {validationResult.isValid ? 'Validation Succeeded' : 'Validation Failed'}
              </h4>
              <p className="text-xs leading-relaxed opacity-90">{validationResult.message}</p>
              {!validationResult.isValid && validationResult.line && (
                <div className="flex gap-4 mt-2 text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-455 bg-rose-500/5 px-2 py-1 rounded">
                  <span>Line: {validationResult.line}</span>
                  <span>Column: {validationResult.column}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
