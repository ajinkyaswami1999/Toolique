import { useState } from 'react';
import { Copy, Database, Trash2 } from 'lucide-react';

export default function SQLMinifier() {
  const [sqlInput, setSqlInput] = useState(`-- Retrieve active subscriber details\nSELECT u.id, u.username, p.amount\nFROM users u\nJOIN payments p ON u.id = p.user_id\nWHERE u.status = 'active'\n  AND p.created_at >= '2026-01-01' /* New Year Threshold */;\n`);
  const [copied, setCopied] = useState(false);

  const handleMinify = (input: string): string => {
    let result = '';
    let i = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inBacktick = false;
    let inSingleLineComment = false;
    let inMultiLineComment = false;
    let lastCharWasSpace = false;

    while (i < input.length) {
      const char = input[i];
      const nextChar = input[i + 1] || '';

      // Handle single-line comment
      if (inSingleLineComment) {
        if (char === '\n' || char === '\r') {
          inSingleLineComment = false;
          if (!lastCharWasSpace) {
            result += ' ';
            lastCharWasSpace = true;
          }
        }
        i++;
        continue;
      }

      // Handle multi-line comment
      if (inMultiLineComment) {
        if (char === '*' && nextChar === '/') {
          inMultiLineComment = false;
          i += 2;
          if (!lastCharWasSpace) {
            result += ' ';
            lastCharWasSpace = true;
          }
          continue;
        }
        i++;
        continue;
      }

      // Check comment starts if not inside strings
      if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
        if (char === '-' && nextChar === '-') {
          inSingleLineComment = true;
          i += 2;
          continue;
        }
        if (char === '/' && nextChar === '*') {
          inMultiLineComment = true;
          i += 2;
          continue;
        }
      }

      // Track quote scopes
      if (char === "'" && !inDoubleQuote && !inBacktick) {
        inSingleQuote = !inSingleQuote;
      } else if (char === '"' && !inSingleQuote && !inBacktick) {
        inDoubleQuote = !inDoubleQuote;
      } else if (char === '`' && !inSingleQuote && !inDoubleQuote) {
        inBacktick = !inBacktick;
      }

      const isSpaceChar = /\s/.test(char);

      if (isSpaceChar) {
        // If inside any string, preserve space
        if (inSingleQuote || inDoubleQuote || inBacktick) {
          result += char;
          lastCharWasSpace = false;
        } else {
          // Collapse spaces outside strings
          if (!lastCharWasSpace && result.length > 0) {
            result += ' ';
            lastCharWasSpace = true;
          }
        }
      } else {
        result += char;
        lastCharWasSpace = false;
      }

      i++;
    }

    // Clean up spaces around operators and punctuation: , ( ) = + - * / ;
    let trimmed = result.trim();
    if (!inSingleQuote && !inDoubleQuote && !inBacktick) {
      trimmed = trimmed.replace(/\s*([,()=+*/;])\s*/g, '$1');
    }

    return trimmed;
  };

  const output = handleMinify(sqlInput);
  const originalSize = sqlInput.length;
  const minifiedSize = output.length;
  const savings = originalSize > 0 ? Math.max(0, Math.round(((originalSize - minifiedSize) / originalSize) * 100)) : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-6 text-left">
      <div className="saas-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              <span>SQL Minifier</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Compress SQL queries by stripping comments and reducing whitespaces.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSqlInput('')}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Input area */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase">Input SQL Query</label>
          <textarea
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
            className="w-full h-48 font-mono text-sm p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none resize-y"
            placeholder="SELECT * FROM table..."
          />
        </div>

        {/* Statistics and Output */}
        {output && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-zinc-55 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="block text-[10px] text-zinc-450 dark:text-zinc-500 font-bold uppercase">Original Size</span>
                <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">{originalSize} B</span>
              </div>
              <div className="p-3 bg-zinc-55 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                <span className="block text-[10px] text-zinc-450 dark:text-zinc-500 font-bold uppercase">Minified Size</span>
                <span className="text-sm font-black text-zinc-800 dark:text-zinc-200">{minifiedSize} B</span>
              </div>
              <div className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/15">
                <span className="block text-[10px] text-emerald-600/80 dark:text-emerald-450 font-bold uppercase">Space Saved</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{savings}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-bold text-zinc-500 uppercase">Minified Output</span>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied' : 'Copy Result'}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={output}
                className="w-full h-24 font-mono text-sm p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
