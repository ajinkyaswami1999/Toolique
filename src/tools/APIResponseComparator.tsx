import { useState } from 'react';
import { 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  FileCode,
  ClipboardList
} from 'lucide-react';

interface Difference {
  path: string;
  type: 'missing' | 'added' | 'mismatch';
  expected: any;
  actual: any;
}

export default function APIResponseComparator() {
  const [expectedJson, setExpectedJson] = useState(
    JSON.stringify(
      {
        status: "success",
        user: {
          id: 101,
          name: "Ajinkya Swami",
          email: "ajinkyaswami1999@example.com",
          roles: ["admin", "editor"]
        },
        settings: {
          theme: "dark",
          notifications: true
        }
      },
      null,
      2
    )
  );

  const [actualJson, setActualJson] = useState(
    JSON.stringify(
      {
        status: "success",
        user: {
          id: 102,
          name: "Ajinkya Swami",
          roles: ["admin", "viewer"],
          token: "jwt_token_sample_123"
        },
        settings: {
          theme: "light",
          notifications: true
        }
      },
      null,
      2
    )
  );

  const [diffs, setDiffs] = useState<Difference[]>([]);
  const [errors, setErrors] = useState<{ expected?: string; actual?: string }>({});
  const [compared, setCompared] = useState(false);

  const handleCompare = () => {
    setErrors({});
    setCompared(false);
    setDiffs([]);

    let expectedObj: any;
    let actualObj: any;
    let parsingFailed = false;

    try {
      expectedObj = JSON.parse(expectedJson);
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, expected: `Invalid Expected JSON: ${err.message}` }));
      parsingFailed = true;
    }

    try {
      actualObj = JSON.parse(actualJson);
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, actual: `Invalid Actual JSON: ${err.message}` }));
      parsingFailed = true;
    }

    if (parsingFailed) return;

    const computedDiffs: Difference[] = [];

    const deepCompare = (exp: any, act: any, path: string) => {
      // 1. Check if types are different
      if (typeof exp !== typeof act) {
        computedDiffs.push({
          path,
          type: 'mismatch',
          expected: `${typeof exp} (${JSON.stringify(exp)})`,
          actual: `${typeof act} (${JSON.stringify(act)})`
        });
        return;
      }

      // 2. Handling null values
      if (exp === null || act === null) {
        if (exp !== act) {
          computedDiffs.push({
            path,
            type: 'mismatch',
            expected: String(exp),
            actual: String(act)
          });
        }
        return;
      }

      // 3. Handling arrays
      if (Array.isArray(exp)) {
        if (!Array.isArray(act)) {
          computedDiffs.push({
            path,
            type: 'mismatch',
            expected: 'Array',
            actual: 'Not Array'
          });
          return;
        }

        // Compare array elements
        const maxLength = Math.max(exp.length, act.length);
        for (let i = 0; i < maxLength; i++) {
          const itemPath = `${path}[${i}]`;
          if (i >= exp.length) {
            computedDiffs.push({
              path: itemPath,
              type: 'added',
              expected: undefined,
              actual: act[i]
            });
          } else if (i >= act.length) {
            computedDiffs.push({
              path: itemPath,
              type: 'missing',
              expected: exp[i],
              actual: undefined
            });
          } else {
            deepCompare(exp[i], act[i], itemPath);
          }
        }
        return;
      }

      // 4. Handling objects
      if (typeof exp === 'object') {
        const expKeys = Object.keys(exp);
        const actKeys = Object.keys(act);

        // Find missing or mismatched keys
        expKeys.forEach((key) => {
          const keyPath = path ? `${path}.${key}` : key;
          if (!(key in act)) {
            computedDiffs.push({
              path: keyPath,
              type: 'missing',
              expected: exp[key],
              actual: undefined
            });
          } else {
            deepCompare(exp[key], act[key], keyPath);
          }
        });

        // Find extra (added) keys in actual object
        actKeys.forEach((key) => {
          const keyPath = path ? `${path}.${key}` : key;
          if (!(key in exp)) {
            computedDiffs.push({
              path: keyPath,
              type: 'added',
              expected: undefined,
              actual: act[key]
            });
          }
        });
        return;
      }

      // 5. Primitive comparisons
      if (exp !== act) {
        computedDiffs.push({
          path,
          type: 'mismatch',
          expected: exp,
          actual: act
        });
      }
    };

    deepCompare(expectedObj, actualObj, '');
    setDiffs(computedDiffs);
    setCompared(true);
  };

  const loadSample = () => {
    setExpectedJson(
      JSON.stringify(
        {
          name: "API response",
          status: 200,
          data: {
            users: [
              { id: 1, name: "Alice", active: true },
              { id: 2, name: "Bob", active: false }
            ]
          }
        },
        null,
        2
      )
    );
    setActualJson(
      JSON.stringify(
        {
          name: "API response",
          status: 500, // mismatch
          data: {
            users: [
              { id: 1, name: "Alice", active: true },
              { id: 2, name: "Bob", active: true }, // mismatch
              { id: 3, name: "Charlie", active: true } // added
            ]
            // missing other fields
          }
        },
        null,
        2
      )
    );
    setCompared(false);
    setDiffs([]);
    setErrors({});
  };

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* JSON Inputs grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Expected Input */}
        <div className="saas-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-emerald-500" />
              <span>Expected JSON (Response A)</span>
            </label>
            <span className="text-[10px] text-zinc-400 font-bold">Standard Spec</span>
          </div>
          <textarea
            rows={12}
            value={expectedJson}
            onChange={(e) => setExpectedJson(e.target.value)}
            className={`w-full p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-650 ${
              errors.expected ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10' : 'border-zinc-200 dark:border-zinc-800'
            }`}
          />
          {errors.expected && (
            <div className="text-[10px] font-semibold text-rose-500 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>{errors.expected}</span>
            </div>
          )}
        </div>

        {/* Right Actual Input */}
        <div className="saas-card p-5 space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-indigo-500" />
              <span>Actual JSON (Response B)</span>
            </label>
            <span className="text-[10px] text-zinc-400 font-bold">Server Output</span>
          </div>
          <textarea
            rows={12}
            value={actualJson}
            onChange={(e) => setActualJson(e.target.value)}
            className={`w-full p-4 rounded-2xl border bg-zinc-50/50 dark:bg-zinc-950 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-650 ${
              errors.actual ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/10' : 'border-zinc-200 dark:border-zinc-800'
            }`}
          />
          {errors.actual && (
            <div className="text-[10px] font-semibold text-rose-500 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>{errors.actual}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleCompare}
          className="saas-button-primary inline-flex items-center gap-2 text-xs"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Compare JSON Responses</span>
        </button>
        <button
          onClick={loadSample}
          className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-zinc-500 dark:text-zinc-455"
        >
          Load Mismatch Sample
        </button>
        <button
          onClick={() => {
            setExpectedJson('');
            setActualJson('');
            setDiffs([]);
            setCompared(false);
            setErrors({});
          }}
          className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-zinc-500 dark:text-zinc-455"
        >
          Clear
        </button>
      </div>

      {/* Discrepancy Ledger Results */}
      {compared && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-500">
              Discrepancy Ledger Results
            </h2>
          </div>

          {diffs.length === 0 ? (
            <div className="p-6 rounded-2xl border border-emerald-500/10 dark:border-emerald-500/20 bg-emerald-500/[0.02] flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              <div>
                <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400">JSON Responses Match!</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5">
                  Deep recursive comparison found zero structural or primitive mismatches between Expected and Actual payloads.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-amber-500/10 dark:border-amber-500/20 bg-amber-500/[0.02] flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
                  Deep comparison identified {diffs.length} discrepancy points.
                </span>
              </div>

              {/* Diffs List */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-900/10">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      <th className="px-5 py-3.5">Discrepancy Path</th>
                      <th className="px-5 py-3.5">Type</th>
                      <th className="px-5 py-3.5">Expected (A)</th>
                      <th className="px-5 py-3.5">Actual (B)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-semibold">
                    {diffs.map((diff, index) => {
                      const typeLabel = 
                        diff.type === 'missing' 
                          ? 'Missing Key' 
                          : diff.type === 'added' 
                          ? 'Extra Key' 
                          : 'Value Mismatch';

                      const typeColor = 
                        diff.type === 'missing'
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/10'
                          : diff.type === 'added'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/10'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/10';

                      return (
                        <tr key={index} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10 transition">
                          <td className="px-5 py-4 font-mono text-[11px] text-zinc-800 dark:text-zinc-250">
                            {diff.path ? `.${diff.path}` : '(root)'}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${typeColor}`}>
                              {typeLabel}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono text-[11px] text-zinc-505 dark:text-zinc-450 truncate max-w-[200px]" title={JSON.stringify(diff.expected)}>
                            {diff.expected === undefined ? '-' : JSON.stringify(diff.expected)}
                          </td>
                          <td className="px-5 py-4 font-mono text-[11px] text-zinc-900 dark:text-white truncate max-w-[200px]" title={JSON.stringify(diff.actual)}>
                            {diff.actual === undefined ? '-' : JSON.stringify(diff.actual)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Block */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/35 border border-zinc-200/50 dark:border-zinc-850/50 text-xs text-zinc-500 dark:text-zinc-400 space-y-2 leading-relaxed font-semibold">
        <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <span>How it works:</span>
        </div>
        <p>This comparator runs a full structural check client-side: (1) It parses both inputs to confirm they are valid JSON schemas; (2) It recursively traverses keys to find if any are missing in actual, or added in actual; (3) It performs strict type and value matching on arrays, objects, and primitives, listing any discrepancies in the table.</p>
      </div>
    </div>
  );
}
