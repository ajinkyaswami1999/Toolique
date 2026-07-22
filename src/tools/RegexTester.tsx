/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

interface MatchItem {
  index: number;
  text: string;
  groups: string[];
}

export default function RegexTester() {
  const [pattern, setPattern] = useState<string>('([A-Z][a-z]+)');
  const [flags, setFlags] = useState({
    g: true,
    i: false,
    m: false,
  });
  const [testString, setTestString] = useState<string>(
    'Welcome to Toolique! We build awesome browser tools for Indian developers.'
  );

  // Derived matches, error, and highlightedNodes
  const { matches, error, highlightedNodes } = useMemo(() => {
    if (!pattern) {
      return {
        matches: [],
        error: null,
        highlightedNodes: [testString]
      };
    }

    try {
      // Build flags string
      let flagsStr = '';
      if (flags.g) flagsStr += 'g';
      if (flags.i) flagsStr += 'i';
      if (flags.m) flagsStr += 'm';

      const regex = new RegExp(pattern, flagsStr);
      const list: MatchItem[] = [];
      let match: RegExpExecArray | null = null;

      if (flags.g) {
        let safety = 0;
        while ((match = regex.exec(testString)) !== null && safety < 5000) {
          safety++;
          list.push({
            index: match.index,
            text: match[0],
            groups: match.slice(1),
          });
          if (match[0].length === 0) {
            regex.lastIndex++; // Avoid infinite loop for zero-width matches
          }
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          list.push({
            index: match.index,
            text: match[0],
            groups: match.slice(1),
          });
        }
      }

      // Construct highlighted node array
      const nodes: React.ReactNode[] = [];
      let lastIdx = 0;

      list.forEach((m, idx) => {
        // Prefix before match
        if (m.index > lastIdx) {
          nodes.push(testString.substring(lastIdx, m.index));
        }
        // Highlighted match
        nodes.push(
          <span
            key={`m-${idx}`}
            className="bg-amber-450/20 dark:bg-amber-500/10 border-b-2 border-amber-500 text-amber-900 dark:text-amber-300 font-mono font-bold px-0.5 rounded cursor-help"
            title={`Match ${idx + 1}: "${m.text}" at index ${m.index}`}
          >
            {m.text}
          </span>
        );
        lastIdx = m.index + m.text.length;
      });

      // Remainder
      if (lastIdx < testString.length) {
        nodes.push(testString.substring(lastIdx));
      }

      return {
        matches: list,
        error: null,
        highlightedNodes: nodes
      };
    } catch (err: any) {
      return {
        matches: [],
        error: err.message || 'Invalid Regular Expression',
        highlightedNodes: [testString]
      };
    }
  }, [pattern, flags, testString]);

  const handleFlagChange = (flag: 'g' | 'i' | 'm') => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Panel (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Search className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Regex Config</h3>
          </div>

          {/* Regex Pattern */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Regular Expression Pattern
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500 font-mono select-none">
                /
              </span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern (e.g. [a-z]+)"
                className="w-full pl-6 pr-14 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm font-mono text-slate-700 dark:text-slate-250 focus:border-teal-500 focus:outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-450 dark:text-slate-550 font-mono select-none">
                /{flags.g ? 'g' : ''}{flags.i ? 'i' : ''}{flags.m ? 'm' : ''}
              </span>
            </div>
          </div>

          {/* Flags Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Flags</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleFlagChange('g')}
                className={`flex-grow py-2 px-3 rounded-xl border text-xs font-bold transition ${
                  flags.g
                    ? 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-950/20 dark:border-teal-900/60 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-550'
                }`}
                title="Global search: find all matches rather than stopping after first"
              >
                Global (g)
              </button>
              <button
                onClick={() => handleFlagChange('i')}
                className={`flex-grow py-2 px-3 rounded-xl border text-xs font-bold transition ${
                  flags.i
                    ? 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-950/20 dark:border-teal-900/60 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-550'
                }`}
                title="Case-insensitive search"
              >
                Insensitive (i)
              </button>
              <button
                onClick={() => handleFlagChange('m')}
                className={`flex-grow py-2 px-3 rounded-xl border text-xs font-bold transition ${
                  flags.m
                    ? 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-950/20 dark:border-teal-900/60 dark:text-teal-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-550'
                }`}
                title="Multiline search: caret (^) and dollar ($) match start/end of lines"
              >
                Multiline (m)
              </button>
            </div>
          </div>

          {/* Error notification */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-semibold leading-relaxed break-words">
              {error}
            </div>
          )}
        </div>

        {/* Right Match Output Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Editor & Highlight viewer */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Test String / Subject Text
            </span>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Paste test string content here..."
              className="w-full h-32 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none resize-none"
            />

            {/* Highlights view */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                Visual Highlight Viewer ({matches.length} matches)
              </span>
              <div className="w-full min-h-32 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-sm text-slate-700 dark:text-slate-300 break-all whitespace-pre-wrap select-text font-sans leading-relaxed">
                {highlightedNodes}
              </div>
            </div>
          </div>

          {/* Matches Capture Breakdown */}
          {matches.length > 0 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block pb-2 border-b border-slate-100 dark:border-slate-800/60">
                Matches & Groups List
              </span>
              <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                {matches.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono"
                  >
                    <div className="flex justify-between font-bold text-slate-750 dark:text-slate-300">
                      <span>Match {idx + 1}</span>
                      <span>Index {m.index}</span>
                    </div>
                    <div className="text-teal-650 dark:text-teal-400 break-all font-bold">
                      Full Match: <span className="bg-slate-200/60 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">"{m.text}"</span>
                    </div>
                    {m.groups.map((grp, gIdx) => (
                      <div key={gIdx} className="text-[11px] text-slate-450 pl-3">
                        ↳ Group {gIdx + 1}: "{grp || 'null'}"
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

