import { useState } from 'react';
import { Copy, Columns, ArrowRightLeft, Check, AlertCircle, Trash2 } from 'lucide-react';

// Helper to recursively sort keys of a JSON object for stable comparison
const sortJSON = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortJSON);
  }
  return Object.keys(obj)
    .sort()
    .reduce((result: any, key: string) => {
      result[key] = sortJSON(obj[key]);
      return result;
    }, {});
};

export default function JSONCompare() {
  const [leftJson, setLeftJson] = useState('{\n  "name": "Toolique",\n  "version": 1.2,\n  "active": true,\n  "tags": ["utility", "formatting"]\n}');
  const [rightJson, setRightJson] = useState('{\n  "name": "Toolique",\n  "version": 1.3,\n  "tags": ["utility", "web", "dev"],\n  "active": true\n}');
  const [diffResult, setDiffResult] = useState<{
    success: boolean;
    errorMsg?: string;
    leftLines: { text: string; type: 'equal' | 'diff' }[];
    rightLines: { text: string; type: 'equal' | 'diff' }[];
    areEqual: boolean;
  } | null>(null);
  const [copied, setCopied] = useState<'left' | 'right' | null>(null);

  const handleCompare = () => {
    if (!leftJson.trim() || !rightJson.trim()) {
      setDiffResult({
        success: false,
        errorMsg: 'Please enter JSON data in both editors.',
        leftLines: [],
        rightLines: [],
        areEqual: false
      });
      return;
    }

    try {
      const parsedL = JSON.parse(leftJson);
      const parsedR = JSON.parse(rightJson);

      // Sort keys to normalize comparison
      const sortedL = sortJSON(parsedL);
      const sortedR = sortJSON(parsedR);

      const formattedL = JSON.stringify(sortedL, null, 2);
      const formattedR = JSON.stringify(sortedR, null, 2);

      const leftLinesRaw = formattedL.split('\n');
      const rightLinesRaw = formattedR.split('\n');

      const maxLines = Math.max(leftLinesRaw.length, rightLinesRaw.length);
      const leftLinesProcessed: { text: string; type: 'equal' | 'diff' }[] = [];
      const rightLinesProcessed: { text: string; type: 'equal' | 'diff' }[] = [];

      let hasDifference = false;

      for (let i = 0; i < maxLines; i++) {
        const lText = leftLinesRaw[i] !== undefined ? leftLinesRaw[i] : '';
        const rText = rightLinesRaw[i] !== undefined ? rightLinesRaw[i] : '';

        if (lText === rText) {
          leftLinesProcessed.push({ text: lText, type: 'equal' });
          rightLinesProcessed.push({ text: rText, type: 'equal' });
        } else {
          leftLinesProcessed.push({ text: lText, type: 'diff' });
          rightLinesProcessed.push({ text: rText, type: 'diff' });
          hasDifference = true;
        }
      }

      setDiffResult({
        success: true,
        leftLines: leftLinesProcessed,
        rightLines: rightLinesProcessed,
        areEqual: !hasDifference
      });
    } catch (err: any) {
      setDiffResult({
        success: false,
        errorMsg: `JSON Parsing Error: ${err.message || 'Invalid JSON syntax detected.'}`,
        leftLines: [],
        rightLines: [],
        areEqual: false
      });
    }
  };

  const handleCopy = (side: 'left' | 'right') => {
    navigator.clipboard.writeText(side === 'left' ? leftJson : rightJson);
    setCopied(side);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClear = () => {
    setLeftJson('');
    setRightJson('');
    setDiffResult(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6 text-left">
      <div className="saas-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Columns className="w-5 h-5 text-indigo-500" />
              <span>JSON Compare & Diff</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Compare two JSON objects side-by-side with sorted-key structural matching.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Both</span>
            </button>
          </div>
        </div>

        {/* Dual Editor Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-zinc-500 uppercase">Left JSON (A)</span>
              <button
                onClick={() => handleCopy('left')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied === 'left' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              value={leftJson}
              onChange={(e) => setLeftJson(e.target.value)}
              className="w-full h-72 font-mono text-xs p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none resize-y"
              placeholder="Paste original JSON..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-zinc-500 uppercase">Right JSON (B)</span>
              <button
                onClick={() => handleCopy('right')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied === 'right' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              value={rightJson}
              onChange={(e) => setRightJson(e.target.value)}
              className="w-full h-72 font-mono text-xs p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none resize-y"
              placeholder="Paste comparison JSON..."
            />
          </div>
        </div>

        <button
          onClick={handleCompare}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm hover:shadow flex items-center justify-center gap-2"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Compare JSON</span>
        </button>

        {/* Diff Output Panel */}
        {diffResult && (
          <div className="space-y-4 pt-2">
            {!diffResult.success ? (
              <div className="p-4 rounded-xl border bg-rose-50/50 dark:bg-rose-950/10 border-rose-500/20 text-rose-850 dark:text-rose-350 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Comparison Error</h4>
                  <p className="text-xs mt-0.5">{diffResult.errorMsg}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    diffResult.areEqual
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-350'
                      : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-500/20 text-amber-800 dark:text-amber-350'
                  }`}
                >
                  {diffResult.areEqual ? (
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      {diffResult.areEqual ? 'Objects are Identical' : 'Differences Detected'}
                    </h4>
                    <p className="text-xs mt-0.5">
                      {diffResult.areEqual
                        ? 'The structural contents and values of both JSON inputs are exactly equal.'
                        : 'Mismatched lines have been highlighted below.'}
                    </p>
                  </div>
                </div>

                {/* Diff Viewer Grid */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden font-mono text-[11px] leading-normal bg-zinc-50 dark:bg-zinc-950 grid grid-cols-2 divide-x divide-zinc-250 dark:divide-zinc-800 max-h-[500px] overflow-y-auto">
                  {/* Left Column lines */}
                  <div className="py-2 overflow-x-auto min-w-0">
                    {diffResult.leftLines.map((line, idx) => (
                      <div
                        key={idx}
                        className={`px-3 flex gap-2 ${
                          line.type === 'diff'
                            ? 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-l-2 border-rose-500'
                            : 'text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <span className="w-5 shrink-0 text-zinc-400 text-right select-none">{idx + 1}</span>
                        <pre className="whitespace-pre">{line.text || ' '}</pre>
                      </div>
                    ))}
                  </div>

                  {/* Right Column lines */}
                  <div className="py-2 overflow-x-auto min-w-0">
                    {diffResult.rightLines.map((line, idx) => (
                      <div
                        key={idx}
                        className={`px-3 flex gap-2 ${
                          line.type === 'diff'
                            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-l-2 border-emerald-500'
                            : 'text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <span className="w-5 shrink-0 text-zinc-400 text-right select-none">{idx + 1}</span>
                        <pre className="whitespace-pre">{line.text || ' '}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
