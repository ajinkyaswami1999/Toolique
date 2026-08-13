/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { 
  Copy, Check, Sparkles, Trash2, ArrowDownUp, AlertCircle, 
  CheckCircle2, Wrench, Layers, Hash, Play, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JsonMetadata {
  type: string;
  sizeBytes: number;
  depth: number;
  length?: number;
  keysCount?: number;
  wordCount?: number;
  charCount?: number;
  isInteger?: boolean;
  isFloat?: boolean;
  isPositive?: boolean;
}

export default function JSONValidator() {
  const [jsonInput, setJsonInput] = useState<string>('{\n  "name": "Toolique",\n  "status": "active",\n  "features": ["conversion", "formatting"],\n  "version": 1.2\n}');
  
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    line?: number;
    column?: number;
    position?: number;
    metadata?: JsonMetadata;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [fixSuccess, setFixSuccess] = useState<string | null>(null);

  // --- Sample JSON Templates for each JSON Type ---
  const samples = {
    object: `{
  "site": "Toolique",
  "founder": "Ajinkya",
  "active": true,
  "toolsCount": 125,
  "categories": ["finance", "developer", "image", "utility"],
  "features": {
    "responsive": true,
    "fast": true,
    "noBackend": true
  }
}`,
    array: `[
  {
    "id": 1,
    "name": "JSON Formatter",
    "type": "developer"
  },
  {
    "id": 2,
    "name": "SIP Calculator",
    "type": "finance"
  },
  true,
  null,
  99.99
]`,
    string: `"Hello, Welcome to Toolique JSON Formatter! This is a valid JSON string value."`,
    number: `12345.6789`,
    boolean: `true`,
    nullValue: `null`
  };

  // --- Helper: Get nesting depth ---
  const getJsonDepth = (val: any): number => {
    if (val === null || typeof val !== 'object') {
      return 0;
    }
    let maxDepth = 0;
    if (Array.isArray(val)) {
      for (const item of val) {
        maxDepth = Math.max(maxDepth, getJsonDepth(item));
      }
    } else {
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          maxDepth = Math.max(maxDepth, getJsonDepth(val[key]));
        }
      }
    }
    return maxDepth + 1;
  };

  // --- Helper: Extract details from JSON ---
  const extractMetadata = (parsed: any, rawStr: string): JsonMetadata => {
    const sizeBytes = new Blob([rawStr]).size;
    const depth = getJsonDepth(parsed);

    if (parsed === null) {
      return { type: 'Null', sizeBytes, depth };
    }
    if (Array.isArray(parsed)) {
      return {
        type: 'Array',
        sizeBytes,
        depth,
        length: parsed.length
      };
    }
    if (typeof parsed === 'object') {
      return {
        type: 'Object',
        sizeBytes,
        depth,
        keysCount: Object.keys(parsed).length
      };
    }
    if (typeof parsed === 'string') {
      return {
        type: 'String',
        sizeBytes,
        depth,
        charCount: parsed.length,
        wordCount: parsed.trim().split(/\s+/).filter(Boolean).length
      };
    }
    if (typeof parsed === 'number') {
      return {
        type: 'Number',
        sizeBytes,
        depth,
        isInteger: Number.isInteger(parsed),
        isFloat: !Number.isInteger(parsed),
        isPositive: parsed >= 0
      };
    }
    if (typeof parsed === 'boolean') {
      return {
        type: 'Boolean',
        sizeBytes,
        depth
      };
    }
    return { type: 'Unknown', sizeBytes, depth };
  };

  // --- Parse Error Position Solver ---
  const getErrorPosition = (input: string, errorMessage: string) => {
    let line = 1;
    let column = 1;
    let position = -1;

    const posMatch = errorMessage.match(/at position (\d+)/i);
    if (posMatch) {
      position = parseInt(posMatch[1], 10);
    } else {
      const lineColMatch = errorMessage.match(/line (\d+)\s+column\s+(\d+)/i);
      if (lineColMatch) {
        line = parseInt(lineColMatch[1], 10);
        column = parseInt(lineColMatch[2], 10);
        let curLine = 1;
        let curCol = 1;
        for (let i = 0; i < input.length; i++) {
          if (curLine === line && curCol === column) {
            position = i;
            break;
          }
          if (input[i] === '\n') {
            curLine++;
            curCol = 1;
          } else {
            curCol++;
          }
        }
      }
    }

    if (position !== -1 && position <= input.length) {
      const textBeforeError = input.substring(0, position);
      const linesBefore = textBeforeError.split('\n');
      line = linesBefore.length;
      column = linesBefore[linesBefore.length - 1].length + 1;
    }

    return { line, column, position };
  };

  // --- Validate Handler ---
  const handleValidate = () => {
    setFixSuccess(null);
    if (!jsonInput.trim()) {
      setValidationResult({
        isValid: false,
        message: 'Input is empty. Please enter a JSON string to validate.'
      });
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput.trim());
      const metadata = extractMetadata(parsed, jsonInput);
      setValidationResult({
        isValid: true,
        message: `Valid JSON structure! Detected type: ${metadata.type}.`,
        metadata
      });
    } catch (err: any) {
      const posInfo = getErrorPosition(jsonInput, err.message);
      setValidationResult({
        isValid: false,
        message: err.message || 'Invalid JSON syntax',
        ...posInfo
      });
    }
  };

  // --- Auto-Fix Handler ---
  const handleAutoFix = () => {
    setFixSuccess(null);
    if (!jsonInput.trim()) return;

    let cleaned = jsonInput.trim();

    // Strip export/var declarations
    cleaned = cleaned.replace(/^(export\s+default|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=)\s*/, '');
    if (cleaned.endsWith(';')) {
      cleaned = cleaned.slice(0, -1).trim();
    }

    // Replace single quotes
    cleaned = cleaned.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'\s*:/g, '"$1":');
    cleaned = cleaned.replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, ': "$1"');
    cleaned = cleaned.replace(/,\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, ', "$1"');
    cleaned = cleaned.replace(/\[\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, '["$1"');

    // Add quotes to unquoted keys
    cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$-]*)\s*:/g, '$1"$2":');

    // Remove trailing commas
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

    // Clean JS special values
    cleaned = cleaned.replace(/:\s*undefined/g, ': null');
    cleaned = cleaned.replace(/:\s*NaN/g, ': null');

    try {
      const parsed = JSON.parse(cleaned);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      const metadata = extractMetadata(parsed, formatted);
      setValidationResult({
        isValid: true,
        message: `Valid JSON structure and beautifully formatted!`,
        metadata
      });
      setFixSuccess('Common JSON issues have been resolved!');
    } catch (err: any) {
      const posInfo = getErrorPosition(cleaned, err.message);
      setJsonInput(cleaned);
      setValidationResult({
        isValid: false,
        message: err.message || 'Unable to auto-fix. Please correct syntax manually.',
        ...posInfo
      });
    }
  };

  // --- Format & Beautify Handler ---
  const handleFormat = () => {
    setFixSuccess(null);
    try {
      const parsed = JSON.parse(jsonInput.trim());
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      const metadata = extractMetadata(parsed, formatted);
      setValidationResult({
        isValid: true,
        message: 'Valid JSON and beautifully formatted!',
        metadata
      });
    } catch (err: any) {
      const posInfo = getErrorPosition(jsonInput, err.message);
      setValidationResult({
        isValid: false,
        message: err.message || 'Invalid JSON',
        ...posInfo
      });
    }
  };

  // --- Minify Handler ---
  const handleMinify = () => {
    setFixSuccess(null);
    try {
      const parsed = JSON.parse(jsonInput.trim());
      const minified = JSON.stringify(parsed);
      setJsonInput(minified);
      const metadata = extractMetadata(parsed, minified);
      setValidationResult({
        isValid: true,
        message: 'Valid JSON and minified!',
        metadata
      });
    } catch (err: any) {
      const posInfo = getErrorPosition(jsonInput, err.message);
      setValidationResult({
        isValid: false,
        message: err.message || 'Invalid JSON',
        ...posInfo
      });
    }
  };

  // --- Copy Handler ---
  const handleCopy = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Load Sample Helper ---
  const loadSample = (val: string) => {
    setJsonInput(val);
    setFixSuccess(null);
    setValidationResult(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6 text-left">
      {/* Samples load row */}
      <div className="flex flex-wrap items-center gap-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
          <Play className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
          Load JSON Type:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadSample(samples.object)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-indigo-500/50 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition hover:text-indigo-600 cursor-pointer"
          >
            Object `{}`
          </button>
          <button
            onClick={() => loadSample(samples.array)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-indigo-500/50 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition hover:text-indigo-600 cursor-pointer"
          >
            Array `[]`
          </button>
          <button
            onClick={() => loadSample(samples.string)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-indigo-500/50 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition hover:text-indigo-600 cursor-pointer"
          >
            String `""`
          </button>
          <button
            onClick={() => loadSample(samples.number)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-indigo-500/50 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition hover:text-indigo-600 cursor-pointer"
          >
            Number `123`
          </button>
          <button
            onClick={() => loadSample(samples.boolean)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-indigo-500/50 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition hover:text-indigo-600 cursor-pointer"
          >
            Boolean `T/F`
          </button>
          <button
            onClick={() => loadSample(samples.nullValue)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-indigo-500/50 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition hover:text-indigo-600 cursor-pointer"
          >
            Null `null`
          </button>
        </div>
      </div>

      <div className="saas-card p-6 space-y-6">
        
        {/* Editor controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">JSON Input Editor</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Validate, format, parse, and verify schemas for all JSON structures entirely in-browser.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAutoFix}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-indigo-500/10"
              title="Auto-Fix JSON Syntax Errors"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Auto-Fix</span>
            </button>
            <button
              onClick={handleFormat}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Format</span>
            </button>
            <button
              onClick={handleMinify}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span>Minify</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => {
                setJsonInput('');
                setValidationResult(null);
                setFixSuccess(null);
              }}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Editor text area */}
        <div className="space-y-4">
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-96 font-mono text-sm p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none resize-y text-zinc-800 dark:text-zinc-150"
            placeholder='Paste your JSON code here...'
          />
          <button
            onClick={handleValidate}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Validate JSON</span>
          </button>
        </div>

        {/* Feedback alerts */}
        <AnimatePresence>
          {fixSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/10 border border-teal-500/20 text-teal-800 dark:text-teal-350 flex items-start gap-2.5 text-xs font-semibold leading-normal"
            >
              <Check className="w-4 h-4 shrink-0 text-teal-650 mt-0.5" />
              <div>
                <span className="font-bold">Auto-Fix Applied! </span>
                <span>{fixSuccess}</span>
              </div>
            </motion.div>
          )}

          {validationResult && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Alert banner */}
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
                <div className="space-y-1 w-full">
                  <h4 className="font-bold text-sm">
                    {validationResult.isValid ? 'Validation Succeeded' : 'Validation Failed'}
                  </h4>
                  <p className="text-xs leading-relaxed opacity-90 font-mono break-all">{validationResult.message}</p>
                </div>
              </div>

              {/* Validation Failed detailed code highlight */}
              {!validationResult.isValid && validationResult.line !== undefined && (
                <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/10 font-mono text-zinc-650 dark:text-zinc-400">
                  <div className="flex gap-4 font-bold text-[10px] uppercase tracking-wider text-rose-500 mb-2">
                    <span>Line: {validationResult.line}</span>
                    <span>Column: {validationResult.column}</span>
                  </div>
                  <div className="overflow-x-auto whitespace-pre py-1 leading-relaxed text-xs">
                    {(() => {
                      const lines = jsonInput.split('\n');
                      const errLineIndex = validationResult.line - 1;
                      const contextStart = Math.max(0, errLineIndex - 1);
                      const contextEnd = Math.min(lines.length - 1, errLineIndex + 1);
                      
                      return lines.slice(contextStart, contextEnd + 1).map((currLine, idx) => {
                        const actualLineNum = contextStart + idx + 1;
                        const isErrorLine = actualLineNum === validationResult.line;
                        
                        return (
                          <div key={actualLineNum} className={isErrorLine ? 'bg-rose-500/10 dark:bg-rose-950/20 px-1 rounded text-rose-700 dark:text-rose-455 font-semibold animate-pulse' : 'opacity-60'}>
                            <span className="inline-block w-8 text-right pr-2 mr-2 border-r border-slate-300 dark:border-slate-800 text-[10px] select-none text-slate-400">{actualLineNum}</span>
                            <span>{currLine}</span>
                            {isErrorLine && validationResult.column !== undefined && (
                              <div className="text-rose-500 leading-none">
                                {' '.repeat(8 + 2 + validationResult.column - 1)}^
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Validation Succeeded detailed metrics */}
              {validationResult.isValid && validationResult.metadata && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Metric 1 */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">JSON Type</span>
                    <div className="mt-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide ${
                        validationResult.metadata.type === 'Object' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' :
                        validationResult.metadata.type === 'Array' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400' :
                        validationResult.metadata.type === 'String' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                        validationResult.metadata.type === 'Number' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                        validationResult.metadata.type === 'Boolean' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' :
                        'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-455'
                      }`}>
                        {validationResult.metadata.type}
                      </span>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Nesting Depth</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-zinc-100 mt-0.5 flex items-center gap-1">
                      <Layers className="w-4 h-4 text-zinc-400" />
                      {validationResult.metadata.depth} {validationResult.metadata.depth > 1 ? 'levels' : 'level'}
                    </span>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Byte Size</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-zinc-100 mt-0.5 flex items-center gap-1">
                      <Hash className="w-4 h-4 text-zinc-400" />
                      {validationResult.metadata.sizeBytes} bytes
                    </span>
                  </div>

                  {/* Extra type details */}
                  <div className="col-span-1 md:col-span-3 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 space-y-2">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-zinc-400" />
                      Structure Details
                    </h5>
                    <div className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed font-semibold">
                      {validationResult.metadata.type === 'Object' && (
                        <span>Object consists of <strong className="text-indigo-600 dark:text-indigo-400">{validationResult.metadata.keysCount}</strong> root keys.</span>
                      )}
                      {validationResult.metadata.type === 'Array' && (
                        <span>Array contains <strong className="text-cyan-600 dark:text-cyan-400">{validationResult.metadata.length}</strong> sequential items.</span>
                      )}
                      {validationResult.metadata.type === 'String' && (
                        <span>String is composed of <strong className="text-emerald-600 dark:text-emerald-400">{validationResult.metadata.charCount}</strong> characters.</span>
                      )}
                      {validationResult.metadata.type === 'Number' && (
                        <span>Number class: <strong className="text-amber-600 dark:text-amber-400">{validationResult.metadata.isInteger ? 'Integer' : 'Floating point'}</strong> ({validationResult.metadata.isPositive ? 'Positive' : 'Negative'}).</span>
                      )}
                      {validationResult.metadata.type === 'Boolean' && (
                        <span>Boolean literal value is set to <strong className="text-orange-600 dark:text-orange-400">{String(JSON.parse(jsonInput)).toUpperCase()}</strong>.</span>
                      )}
                      {validationResult.metadata.type === 'Null' && (
                        <span>Value is a <strong className="text-rose-500 dark:text-rose-400">null</strong> reference representing an empty state.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
