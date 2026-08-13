/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { 
  Code2, Copy, Check, Sparkles, Trash2, ArrowDownUp, AlertCircle, 
  Search, ChevronDown, ChevronRight, Download, Wrench, FileText, 
  Layers, Hash, Info, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types & Interfaces ---
interface JsonMetadata {
  type: string;
  sizeBytes: number;
  depth: number;
  length?: number; // arrays
  keysCount?: number; // objects
  wordCount?: number; // strings
  charCount?: number; // strings
  isInteger?: boolean; // numbers
  isFloat?: boolean; // numbers
  isPositive?: boolean; // numbers
  isScientific?: boolean; // numbers
}

export default function JSONFormatter() {
  const [inputJson, setInputJson] = useState<string>('');
  const [outputJson, setOutputJson] = useState<string>('');
  const [indentSize, setIndentSize] = useState<string>('2');
  const [activeTab, setActiveTab] = useState<'formatted' | 'tree' | 'analysis'>('formatted');
  
  // Validation / Error States
  const [error, setError] = useState<{
    message: string;
    line?: number;
    column?: number;
    position?: number;
  } | null>(null);
  
  const [metadata, setMetadata] = useState<JsonMetadata | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [fixSuccess, setFixSuccess] = useState<string | null>(null);

  // Tree View States
  const [treeSearch, setTreeSearch] = useState<string>('');
  const [treeKey, setTreeKey] = useState<number>(0);
  const [defaultExpanded, setDefaultExpanded] = useState<boolean>(true);

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
        isPositive: parsed >= 0,
        isScientific: /e/i.test(rawStr)
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

  // --- Auto-Fix malformed inputs ---
  const handleAutoFix = () => {
    setFixSuccess(null);
    setError(null);
    if (!inputJson.trim()) return;

    let cleaned = inputJson.trim();

    // Remove Export/Variable declarations (e.g. export default { ... })
    cleaned = cleaned.replace(/^(export\s+default|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=)\s*/, '');
    if (cleaned.endsWith(';')) {
      cleaned = cleaned.slice(0, -1).trim();
    }

    // 1. Replace single quotes wrapping keys or values
    // Replace single quotes around keys
    cleaned = cleaned.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'\s*:/g, '"$1":');
    // Replace single quotes around string values
    cleaned = cleaned.replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, ': "$1"');
    // Replace single quotes inside array items
    cleaned = cleaned.replace(/,\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, ', "$1"');
    cleaned = cleaned.replace(/\[\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, '["$1"');

    // 2. Add double quotes to unquoted keys
    cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$-]*)\s*:/g, '$1"$2":');

    // 3. Strip trailing commas
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

    // 4. Clean JS special values
    cleaned = cleaned.replace(/:\s*undefined/g, ': null');
    cleaned = cleaned.replace(/:\s*NaN/g, ': null');

    try {
      const parsed = JSON.parse(cleaned);
      const indent = indentSize === 'tab' ? '\t' : Number(indentSize);
      const formatted = JSON.stringify(parsed, null, indent);
      
      setInputJson(formatted);
      setOutputJson(formatted);
      setMetadata(extractMetadata(parsed, formatted));
      setFixSuccess('Common errors (quotes, trailing commas, unquoted keys) have been auto-fixed!');
    } catch (err: any) {
      // If regex fixer didn't result in valid JSON, show error
      const posInfo = getErrorPosition(cleaned, err.message);
      setError({
        message: err.message || 'Unable to automatically parse and fix JSON. Check syntax manually.',
        ...posInfo
      });
      setInputJson(cleaned);
      setOutputJson('');
      setMetadata(null);
    }
  };

  // --- Format JSON ---
  const formatJSON = () => {
    setError(null);
    setFixSuccess(null);
    if (!inputJson.trim()) {
      setOutputJson('');
      setMetadata(null);
      return;
    }

    try {
      const parsed = JSON.parse(inputJson.trim());
      const indent = indentSize === 'tab' ? '\t' : Number(indentSize);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutputJson(formatted);
      setMetadata(extractMetadata(parsed, formatted));
    } catch (err: any) {
      const posInfo = getErrorPosition(inputJson, err.message);
      setError({
        message: err.message || 'Invalid JSON syntax',
        ...posInfo
      });
      setOutputJson('');
      setMetadata(null);
      setActiveTab('formatted');
    }
  };

  // --- Minify JSON ---
  const minifyJSON = () => {
    setError(null);
    setFixSuccess(null);
    if (!inputJson.trim()) return;

    try {
      const parsed = JSON.parse(inputJson.trim());
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setMetadata(extractMetadata(parsed, minified));
    } catch (err: any) {
      const posInfo = getErrorPosition(inputJson, err.message);
      setError({
        message: err.message || 'Invalid JSON syntax',
        ...posInfo
      });
      setOutputJson('');
      setMetadata(null);
      setActiveTab('formatted');
    }
  };

  // --- Copy Clipboard ---
  const copyToClipboard = () => {
    if (!outputJson) return;
    navigator.clipboard.writeText(outputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Download JSON file ---
  const downloadJSON = () => {
    if (!outputJson) return;
    const blob = new Blob([outputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formatted_${metadata?.type?.toLowerCase() || 'data'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Reset All ---
  const clear = () => {
    setInputJson('');
    setOutputJson('');
    setError(null);
    setMetadata(null);
    setFixSuccess(null);
    setTreeSearch('');
  };

  // Trigger format when settings change
  useEffect(() => {
    if (inputJson.trim() && !error) {
      try {
        const parsed = JSON.parse(inputJson.trim());
        const indent = indentSize === 'tab' ? '\t' : Number(indentSize);
        setOutputJson(JSON.stringify(parsed, null, indent));
      } catch {
        // do not block user typing with error triggers
      }
    }
  }, [indentSize]);

  // Load sample on click
  const loadSample = (val: string) => {
    setInputJson(val);
    setError(null);
    setFixSuccess(null);
    try {
      const parsed = JSON.parse(val);
      const indent = indentSize === 'tab' ? '\t' : Number(indentSize);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutputJson(formatted);
      setMetadata(extractMetadata(parsed, formatted));
    } catch (err: any) {
      setOutputJson('');
      setMetadata(null);
    }
  };

  // Force tree reset expansion state
  const handleToggleExpandAll = (val: boolean) => {
    setDefaultExpanded(val);
    setTreeKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Samples load row */}
      <div className="flex flex-wrap items-center gap-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5 text-teal-500 fill-teal-500" />
          Load JSON Type:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadSample(samples.object)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-teal-500/50 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition hover:text-teal-600 cursor-pointer"
          >
            Object `{}`
          </button>
          <button
            onClick={() => loadSample(samples.array)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-teal-500/50 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition hover:text-teal-600 cursor-pointer"
          >
            Array `[]`
          </button>
          <button
            onClick={() => loadSample(samples.string)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-teal-500/50 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition hover:text-teal-600 cursor-pointer"
          >
            String `""`
          </button>
          <button
            onClick={() => loadSample(samples.number)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-teal-500/50 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition hover:text-teal-600 cursor-pointer"
          >
            Number `123`
          </button>
          <button
            onClick={() => loadSample(samples.boolean)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-teal-500/50 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition hover:text-teal-600 cursor-pointer"
          >
            Boolean `T/F`
          </button>
          <button
            onClick={() => loadSample(samples.nullValue)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-850 hover:border-teal-500/50 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 transition hover:text-teal-600 cursor-pointer"
          >
            Null `null`
          </button>
        </div>
      </div>

      {/* Main Panel layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Left Side: Editor Area */}
        <div className="flex flex-col h-[650px] p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Code2 className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
              Source Input Editor
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoFix}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-950/40 text-xs font-bold transition shadow-sm cursor-pointer border border-teal-500/10"
                title="Automatically fix common JSON syntax errors"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Auto-Fix</span>
              </button>
              <button
                onClick={clear}
                className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                title="Clear input"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-grow w-full relative flex">
            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              className="w-full h-full p-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-slate-50/50 dark:bg-slate-950/50 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-150 resize-none overflow-y-auto"
              placeholder="Paste your JSON string here (Can be object, array, string, number, boolean, or null)..."
            />
          </div>

          {/* Configuration & Actions Bar */}
          <div className="flex flex-wrap gap-4 items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50">
            {/* Options */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Indentation:</span>
                <select
                  value={indentSize}
                  onChange={(e) => setIndentSize(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-semibold text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer"
                >
                  <option value="2" className="dark:bg-slate-900 text-slate-800 dark:text-white">2 Spaces</option>
                  <option value="4" className="dark:bg-slate-900 text-slate-800 dark:text-white">4 Spaces</option>
                  <option value="tab" className="dark:bg-slate-900 text-slate-800 dark:text-white">Tab</option>
                </select>
              </div>
            </div>
            
            {/* Format actions */}
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
                <span>Validate & Beautify</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Results & Tree Viewer */}
        <div className="flex flex-col h-[650px] p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm text-slate-800 dark:text-slate-200">
          
          {/* Header tabs & outputs */}
          <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex gap-1.5 bg-slate-100/70 dark:bg-slate-950/70 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('formatted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'formatted'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Formatted</span>
              </button>
              <button
                onClick={() => {
                  if (!error && outputJson) {
                    setActiveTab('tree');
                  }
                }}
                disabled={!!error || !outputJson}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  !!error || !outputJson ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  activeTab === 'tree'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Interactive Tree</span>
              </button>
              <button
                onClick={() => {
                  if (!error && outputJson) {
                    setActiveTab('analysis');
                  }
                }}
                disabled={!!error || !outputJson}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  !!error || !outputJson ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                } ${
                  activeTab === 'analysis'
                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Analysis</span>
              </button>
            </div>

            <div className="flex gap-2">
              {outputJson && !error && (
                <>
                  <button
                    onClick={downloadJSON}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                    title="Download Formatted JSON File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notifications area: Auto-Fix success or Error messages */}
          <div className="mt-4">
            <AnimatePresence>
              {fixSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/15 border border-teal-500/20 text-teal-800 dark:text-teal-350 flex items-start gap-2.5 text-xs font-semibold leading-normal"
                >
                  <Check className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
                  <div>
                    <span className="font-bold">Auto-Fixed Successful! </span>
                    <span>{fixSuccess}</span>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 flex flex-col gap-2 text-xs mb-4"
                >
                  <div className="flex items-start gap-2.5 font-semibold leading-normal">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500 mt-0.5" />
                    <div>
                      <div className="font-bold text-rose-500 uppercase tracking-wide">Validation Succeeded: Syntax Error Found</div>
                      <div className="mt-0.5 font-mono break-all">{error.message}</div>
                    </div>
                  </div>
                  
                  {/* Detailed Line & Column indicator */}
                  {error.line !== undefined && (
                    <div className="mt-2 p-3 bg-rose-500/5 dark:bg-rose-950/10 rounded-lg border border-rose-500/10 font-mono text-slate-600 dark:text-slate-400">
                      <div className="flex gap-4 font-bold text-[10px] uppercase text-rose-500 tracking-wider mb-1.5">
                        <span>Line: {error.line}</span>
                        <span>Column: {error.column}</span>
                      </div>
                      
                      {/* Visual pointer */}
                      <div className="overflow-x-auto whitespace-pre py-1 leading-relaxed text-xs">
                        {(() => {
                          const lines = inputJson.split('\n');
                          const errLineIndex = error.line - 1;
                          
                          // Show preceding, offending, and trailing line for context
                          const contextStart = Math.max(0, errLineIndex - 1);
                          const contextEnd = Math.min(lines.length - 1, errLineIndex + 1);
                          
                          return lines.slice(contextStart, contextEnd + 1).map((currLine, idx) => {
                            const actualLineNum = contextStart + idx + 1;
                            const isErrorLine = actualLineNum === error.line;
                            
                            return (
                              <div key={actualLineNum} className={isErrorLine ? 'bg-rose-500/10 dark:bg-rose-950/20 px-1 rounded text-rose-700 dark:text-rose-400 font-semibold' : 'opacity-60'}>
                                <span className="inline-block w-8 text-right pr-2 mr-2 border-r border-slate-300 dark:border-slate-800 text-[10px] select-none text-slate-400">{actualLineNum}</span>
                                <span>{currLine}</span>
                                {isErrorLine && error.column !== undefined && (
                                  <div className="text-rose-500 leading-none">
                                    {' '.repeat(8 + 2 + error.column - 1)}^
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dynamic Tab Body */}
          <div className="flex-grow w-full overflow-hidden mt-4">
            {outputJson && !error ? (
              <div className="h-full flex flex-col">
                
                {/* TAB 1: FORMATTED JSON */}
                {activeTab === 'formatted' && (
                  <pre className="flex-grow w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 font-mono text-sm leading-relaxed overflow-auto text-teal-700 dark:text-teal-400 whitespace-pre">
                    <code>{outputJson}</code>
                  </pre>
                )}

                {/* TAB 2: INTERACTIVE TREE */}
                {activeTab === 'tree' && (
                  <div className="flex-grow flex flex-col h-full overflow-hidden">
                    {/* Tree Search & Collapse Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="relative flex-grow max-w-xs">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Search className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          value={treeSearch}
                          onChange={(e) => setTreeSearch(e.target.value)}
                          placeholder="Search keys or values..."
                          className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 focus:outline-none focus:border-teal-500 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-350"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleExpandAll(true)}
                          className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          Expand All
                        </button>
                        <button
                          onClick={() => handleToggleExpandAll(false)}
                          className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          Collapse All
                        </button>
                      </div>
                    </div>

                    {/* Recursive tree viewport */}
                    <div className="flex-grow overflow-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-300">
                      <JSONTreeView 
                        key={treeKey} 
                        data={JSON.parse(outputJson)} 
                        searchTerm={treeSearch}
                        defaultExpanded={defaultExpanded}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: SCHEMA & ANALYSIS */}
                {activeTab === 'analysis' && metadata && (
                  <div className="flex-grow overflow-auto space-y-4 pr-1">
                    
                    {/* Visual Tag of Detected Type */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">JSON Type Detected</span>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                            metadata.type === 'Object' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' :
                            metadata.type === 'Array' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400' :
                            metadata.type === 'String' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                            metadata.type === 'Number' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                            metadata.type === 'Boolean' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-455'
                          }`}>
                            {metadata.type}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nesting Depth</span>
                        <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                          <Layers className="w-4.5 h-4.5 text-slate-400" />
                          {metadata.depth} {metadata.depth > 1 ? 'levels' : 'level'}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex flex-col justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Memory footprint</span>
                        <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
                          <Hash className="w-4.5 h-4.5 text-slate-400" />
                          {metadata.sizeBytes} bytes
                        </span>
                      </div>
                    </div>

                    {/* Detailed breakdown based on type */}
                    <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        Type-Specific Analytics
                      </h4>
                      
                      {metadata.type === 'Object' && (
                        <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                          <div>
                            <span className="text-slate-400 block text-xs">Total Root Keys:</span>
                            <span className="text-slate-700 dark:text-slate-200 font-bold">{metadata.keysCount} keys</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-xs">Structural Shape:</span>
                            <span className="text-slate-700 dark:text-slate-200 font-bold">Unordered Key-Value Mapping</span>
                          </div>
                        </div>
                      )}

                      {metadata.type === 'Array' && (
                        <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                          <div>
                            <span className="text-slate-400 block text-xs">Total Elements (Length):</span>
                            <span className="text-slate-700 dark:text-slate-200 font-bold">{metadata.length} items</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-xs">Structural Shape:</span>
                            <span className="text-slate-700 dark:text-slate-200 font-bold">Ordered Sequence</span>
                          </div>
                        </div>
                      )}

                      {metadata.type === 'String' && (
                        <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                          <div>
                            <span className="text-slate-400 block text-xs">Character Count:</span>
                            <span className="text-slate-700 dark:text-slate-200 font-bold">{metadata.charCount} characters</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-xs">Approx Word Count:</span>
                            <span className="text-slate-700 dark:text-slate-200 font-bold">{metadata.wordCount} words</span>
                          </div>
                        </div>
                      )}

                      {metadata.type === 'Number' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium">
                          <div>
                            <span className="text-slate-400 block text-xs">Class:</span>
                            <span className="text-slate-700 dark:text-slate-200 font-bold">
                              {metadata.isInteger ? 'Integer' : 'Float'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-xs">Sign:</span>
                            <span className="text-slate-700 dark:text-slate-200 font-bold">
                              {metadata.isPositive ? 'Positive' : 'Negative'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-xs">Format:</span>
                            <span className="text-slate-700 dark:text-slate-200 font-bold">
                              {metadata.isScientific ? 'Scientific Notation' : 'Standard Notation'}
                            </span>
                          </div>
                          {metadata.isInteger && (
                            <div>
                              <span className="text-slate-400 block text-xs">Parity:</span>
                              <span className="text-slate-700 dark:text-slate-200 font-bold">
                                {JSON.parse(outputJson) % 2 === 0 ? 'Even' : 'Odd'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {metadata.type === 'Boolean' && (
                        <div className="text-sm font-medium">
                          <span className="text-slate-400 block text-xs">Boolean Value:</span>
                          <span className={`font-black ${JSON.parse(outputJson) ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {JSON.parse(outputJson) ? 'TRUE' : 'FALSE'}
                          </span>
                        </div>
                      )}

                      {metadata.type === 'Null' && (
                        <div className="text-sm font-medium">
                          <span className="text-slate-400 block text-xs">Null Value Explanation:</span>
                          <span className="text-slate-700 dark:text-slate-350">
                            Represents the intentional absence of any object value or reference.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-550 text-center p-6 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <Code2 className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Validated JSON output will render here.</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">Paste your raw or compressed code, then click "Validate & Beautify" on the left.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// --- INTERACTIVE TREE VIEWER COMPONENT ---
// ==========================================
interface TreeViewProps {
  data: any;
  searchTerm: string;
  defaultExpanded: boolean;
}

function JSONTreeView({ data, searchTerm, defaultExpanded }: TreeViewProps) {
  // Helper to determine if a value should be rendered based on search criteria
  const matchesSearch = (term: string): boolean => {
    if (!term) return true;
    const t = term.toLowerCase();
    
    const search = (node: any): boolean => {
      if (node === null || node === undefined) return 'null'.includes(t);
      if (typeof node !== 'object') {
        return String(node).toLowerCase().includes(t);
      }
      if (Array.isArray(node)) {
        return node.some(item => search(item));
      }
      return Object.entries(node).some(([k, v]) => k.toLowerCase().includes(t) || search(v));
    };
    
    return search(data);
  };

  if (!matchesSearch(searchTerm)) {
    return <div className="text-slate-400 text-xs italic">No matching keys or values found.</div>;
  }

  return (
    <div className="tree-root select-text text-left">
      <TreeNode 
        name="root" 
        value={data} 
        path="" 
        searchTerm={searchTerm} 
        isLast={true} 
        defaultExpanded={defaultExpanded}
      />
    </div>
  );
}

interface TreeNodeProps {
  name: string | number;
  value: any;
  path: string;
  searchTerm: string;
  isLast: boolean;
  defaultExpanded: boolean;
}

function TreeNode({ name, value, path, searchTerm, isLast, defaultExpanded }: TreeNodeProps) {
  const [collapsed, setCollapsed] = useState<boolean>(!defaultExpanded);
  const [hovered, setHovered] = useState<boolean>(false);
  const [copiedPath, setCopiedPath] = useState<boolean>(false);
  const [copiedVal, setCopiedVal] = useState<boolean>(false);

  // Re-sync with defaultExpanded changes
  useEffect(() => {
    setCollapsed(!defaultExpanded);
  }, [defaultExpanded]);

  // Clean value path string
  const currentPath = path === '' 
    ? (typeof name === 'number' ? `[${name}]` : String(name))
    : (typeof name === 'number' ? `${path}[${name}]` : `${path}.${name}`);

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentPath.replace(/^root\.?/, ''));
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 1500);
  };

  const handleCopyValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value));
    setCopiedVal(true);
    setTimeout(() => setCopiedVal(false), 1500);
  };

  const matchesSearch = (val: any, term: string): boolean => {
    if (!term) return true;
    const t = term.toLowerCase();
    
    const search = (node: any): boolean => {
      if (node === null || node === undefined) return 'null'.includes(t);
      if (typeof node !== 'object') {
        return String(node).toLowerCase().includes(t);
      }
      if (Array.isArray(node)) {
        return node.some(item => search(item));
      }
      return Object.entries(node).some(([k, v]) => k.toLowerCase().includes(t) || search(v));
    };
    
    return search(val);
  };

  // 1. Array Type Node
  if (Array.isArray(value)) {
    const totalItems = value.length;
    const isMatched = String(name).toLowerCase().includes(searchTerm.toLowerCase()) || matchesSearch(value, searchTerm);
    if (!isMatched) return null;

    return (
      <div 
        className="pl-4 border-l border-slate-200/50 dark:border-slate-800/30 my-0.5"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center gap-1 py-0.5 group">
          <button 
            onClick={() => setCollapsed(prev => !prev)}
            className="p-0.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          
          <span className="text-slate-800 dark:text-purple-400 font-bold select-none">{name}:</span>
          <span className="text-slate-400 text-xs select-none">
            Array[{totalItems}] {collapsed ? '[...]' : '['}
          </span>

          {/* Copy utilities on Hover */}
          {hovered && (
            <div className="flex items-center gap-1.5 ml-2.5 scale-90 opacity-70 hover:opacity-100 transition">
              <button 
                onClick={handleCopyPath}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[9px] font-bold text-slate-500 dark:text-slate-350 rounded cursor-pointer flex items-center gap-0.5"
              >
                {copiedPath ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : null}
                <span>Path</span>
              </button>
              <button 
                onClick={handleCopyValue}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[9px] font-bold text-slate-500 dark:text-slate-350 rounded cursor-pointer flex items-center gap-0.5"
              >
                {copiedVal ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : null}
                <span>Value</span>
              </button>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="pl-4">
            {value.map((item, idx) => {
              const isChildLast = idx === totalItems - 1;
              return (
                <TreeNode 
                  key={idx}
                  name={idx}
                  value={item}
                  path={currentPath}
                  searchTerm={searchTerm}
                  isLast={isChildLast}
                  defaultExpanded={defaultExpanded}
                />
              );
            })}
          </div>
        )}
        
        {!collapsed && (
          <div className="pl-6 text-slate-400 text-xs select-none">
            {']'}{isLast ? '' : ','}
          </div>
        )}
      </div>
    );
  }

  // 2. Object Type Node
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value);
    const totalKeys = keys.length;
    const isMatched = String(name).toLowerCase().includes(searchTerm.toLowerCase()) || matchesSearch(value, searchTerm);
    if (!isMatched) return null;

    return (
      <div 
        className="pl-4 border-l border-slate-200/50 dark:border-slate-800/30 my-0.5"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center gap-1 py-0.5 group">
          <button 
            onClick={() => setCollapsed(prev => !prev)}
            className="p-0.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/50 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          
          <span className="text-slate-800 dark:text-indigo-400 font-bold select-none">{name}:</span>
          <span className="text-slate-400 text-xs select-none">
            Object{`{${totalKeys} keys}`} {collapsed ? '{...}' : '{'}
          </span>

          {/* Copy utility indicators */}
          {hovered && (
            <div className="flex items-center gap-1.5 ml-2.5 scale-90 opacity-70 hover:opacity-100 transition">
              <button 
                onClick={handleCopyPath}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[9px] font-bold text-slate-500 dark:text-slate-350 rounded cursor-pointer flex items-center gap-0.5"
              >
                {copiedPath ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : null}
                <span>Path</span>
              </button>
              <button 
                onClick={handleCopyValue}
                className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[9px] font-bold text-slate-500 dark:text-slate-350 rounded cursor-pointer flex items-center gap-0.5"
              >
                {copiedVal ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : null}
                <span>Value</span>
              </button>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="pl-4">
            {keys.map((key, idx) => {
              const isChildLast = idx === totalKeys - 1;
              return (
                <TreeNode 
                  key={key}
                  name={key}
                  value={value[key]}
                  path={currentPath}
                  searchTerm={searchTerm}
                  isLast={isChildLast}
                  defaultExpanded={defaultExpanded}
                />
              );
            })}
          </div>
        )}
        
        {!collapsed && (
          <div className="pl-6 text-slate-400 text-xs select-none">
            {'}'}{isLast ? '' : ','}
          </div>
        )}
      </div>
    );
  }

  // 3. Primitive Type Nodes (String, Number, Boolean, Null)
  const isMatched = 
    String(name).toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(value).toLowerCase().includes(searchTerm.toLowerCase());

  if (!isMatched) return null;

  // Style primitives differently
  let valueElement = null;
  if (value === null) {
    valueElement = <span className="text-rose-500 dark:text-rose-455 font-bold">null</span>;
  } else if (typeof value === 'string') {
    valueElement = <span className="text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap break-all">"{value}"</span>;
  } else if (typeof value === 'number') {
    valueElement = <span className="text-indigo-600 dark:text-indigo-400">{value}</span>;
  } else if (typeof value === 'boolean') {
    valueElement = <span className="text-amber-600 dark:text-amber-500 font-bold">{value ? 'true' : 'false'}</span>;
  }

  return (
    <div 
      className="pl-4 border-l border-slate-200/50 dark:border-slate-800/30 py-0.5 flex items-center gap-1.5 flex-wrap my-0.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 select-none"></span>
      <span className="text-slate-600 dark:text-slate-400 font-bold">{name}:</span>
      {valueElement}
      <span className="text-slate-400 text-xs select-none">{isLast ? '' : ','}</span>

      {hovered && (
        <div className="flex items-center gap-1.5 ml-2.5 scale-90 opacity-70 hover:opacity-100 transition">
          <button 
            onClick={handleCopyPath}
            className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[9px] font-bold text-slate-500 dark:text-slate-350 rounded cursor-pointer flex items-center gap-0.5"
          >
            {copiedPath ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : null}
            <span>Path</span>
          </button>
          <button 
            onClick={handleCopyValue}
            className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[9px] font-bold text-slate-500 dark:text-slate-350 rounded cursor-pointer flex items-center gap-0.5"
          >
            {copiedVal ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : null}
            <span>Value</span>
          </button>
        </div>
      )}
    </div>
  );
}
