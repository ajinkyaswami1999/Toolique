/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Copy, Sparkles, AlertCircle, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';

const parseValue = (val: string): any => {
  const trimmed = val.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (!isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const yamlToObj = (yamlText: string): any => {
  const lines = yamlText.split('\n');
  const root: any = {};
  const stack: { indent: number; key: string; obj: any }[] = [
    { indent: -1, key: '', obj: root }
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = line.length - line.trimStart().length;

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const currentScope = stack[stack.length - 1];

    if (trimmed.startsWith('-')) {
      const valStr = trimmed.slice(1).trim();
      
      if (!Array.isArray(currentScope.obj[currentScope.key]) && currentScope.key !== '') {
        currentScope.obj[currentScope.key] = [];
      }
      
      const targetArray = currentScope.key === '' ? currentScope.obj : currentScope.obj[currentScope.key];

      if (valStr.includes(':')) {
        const colonIdx = valStr.indexOf(':');
        const k = valStr.slice(0, colonIdx).trim();
        const v = valStr.slice(colonIdx + 1).trim();
        const itemObj = { [k]: parseValue(v) };
        targetArray.push(itemObj);
        stack.push({ indent: indent + 2, key: k, obj: itemObj });
      } else {
        targetArray.push(parseValue(valStr));
      }
    } else if (trimmed.includes(':')) {
      const colonIdx = trimmed.indexOf(':');
      const key = trimmed.slice(0, colonIdx).trim();
      const valueStr = trimmed.slice(colonIdx + 1).trim();

      if (valueStr === '') {
        const newObj = {};
        if (currentScope.key === '') {
          currentScope.obj[key] = newObj;
        } else {
          if (Array.isArray(currentScope.obj)) {
            let lastItem = currentScope.obj[currentScope.obj.length - 1];
            if (typeof lastItem !== 'object' || lastItem === null) {
              lastItem = {};
              currentScope.obj[currentScope.obj.length - 1] = lastItem;
            }
            lastItem[key] = newObj;
          } else {
            currentScope.obj[currentScope.key][key] = newObj;
          }
        }
        
        const nextObj = currentScope.key === '' ? currentScope.obj[key] : currentScope.obj[currentScope.key][key];
        stack.push({ indent, key: '', obj: nextObj });
      } else {
        const parsedVal = parseValue(valueStr);
        if (currentScope.key === '') {
          currentScope.obj[key] = parsedVal;
        } else {
          if (Array.isArray(currentScope.obj)) {
            let lastItem = currentScope.obj[currentScope.obj.length - 1];
            if (typeof lastItem !== 'object' || lastItem === null) {
              lastItem = {};
              currentScope.obj[currentScope.obj.length - 1] = lastItem;
            }
            lastItem[key] = parsedVal;
          } else {
            currentScope.obj[currentScope.key][key] = parsedVal;
          }
        }
      }
    }
  }

  return root;
};

const objToYaml = (obj: any, depth = 0, indentSize = 2): string => {
  const spacer = ' '.repeat(depth * indentSize);
  if (obj === null) return 'null';
  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      if (obj.includes(':') || obj.includes('#') || obj.startsWith('-') || obj.trim() === '') {
        return `"${obj}"`;
      }
      return obj;
    }
    return String(obj);
  }

  if (Array.isArray(obj)) {
    return obj
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const innerYaml = objToYaml(item, depth + 1, indentSize).trimStart();
          return `${spacer}- ${innerYaml}`;
        }
        return `${spacer}- ${objToYaml(item, 0, indentSize)}`;
      })
      .join('\n');
  }

  return Object.keys(obj)
    .map((key) => {
      const val = obj[key];
      if (typeof val === 'object' && val !== null) {
        const header = `${spacer}${key}:`;
        const body = objToYaml(val, depth + 1, indentSize);
        return `${header}\n${body}`;
      } else {
        return `${spacer}${key}: ${objToYaml(val, 0, indentSize)}`;
      }
    })
    .join('\n');
};

export default function YAMLFormatter() {
  const [yamlInput, setYamlInput] = useState(`# Project Configuration\nserver:\n  port: 8080\n  host: localhost\ndatabase:\n  enabled: true\n  driver: postgres\ntags:\n  - web\n  - tools\n  - helper`);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState<'yaml' | 'json' | null>(null);

  const handleFormat = () => {
    if (!yamlInput.trim()) {
      setResult({ success: false, message: 'YAML input is empty.' });
      return;
    }

    try {
      const parsed = yamlToObj(yamlInput);
      const formatted = objToYaml(parsed, 0, indentSize);
      setYamlInput(formatted);
      setResult({ success: true, message: 'YAML validated and formatted!' });
    } catch (err: any) {
      setResult({ success: false, message: `Formatting error: ${err.message || 'Check nesting spaces.'}` });
    }
  };

  const handleConvertToJSON = () => {
    if (!yamlInput.trim()) {
      setResult({ success: false, message: 'YAML input is empty.' });
      return;
    }

    try {
      const parsed = yamlToObj(yamlInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
      setResult({ success: true, message: 'Successfully converted YAML to JSON!' });
    } catch (err: any) {
      setResult({ success: false, message: `Conversion error: ${err.message || 'Invalid YAML schema.'}` });
    }
  };

  const handleCopy = (type: 'yaml' | 'json') => {
    navigator.clipboard.writeText(type === 'yaml' ? yamlInput : jsonOutput);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
      {/* Editor Panel */}
      <div className="saas-card p-6 space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">YAML Editor</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Edit, format, and validate YAML nodes.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg text-xs font-semibold">
              <span className="text-zinc-500">Indent:</span>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(parseInt(e.target.value, 10))}
                className="bg-transparent border-none focus:outline-none cursor-pointer text-zinc-700 dark:text-zinc-300"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
              </select>
            </div>
            <button
              onClick={() => {
                setYamlInput('');
                setResult(null);
                setJsonOutput('');
              }}
              className="px-2 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <textarea
          value={yamlInput}
          onChange={(e) => setYamlInput(e.target.value)}
          className="w-full h-96 font-mono text-sm p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none resize-none"
          placeholder="Paste your YAML config here..."
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleFormat}
            className="py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-zinc-700"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Format YAML</span>
          </button>
          <button
            onClick={handleConvertToJSON}
            className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
          >
            <span>Convert to JSON</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Output Panel */}
      <div className="saas-card p-6 space-y-6 flex flex-col">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">JSON Output</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Parsed JSON structure representation.</p>
          </div>
          {jsonOutput && (
            <button
              onClick={() => handleCopy('json')}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied === 'json' ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <textarea
            readOnly
            value={jsonOutput}
            className="w-full flex-1 min-h-[300px] font-mono text-sm p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none resize-none"
            placeholder="Convert YAML on the left to see JSON output..."
          />

          {result && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 mt-4 transition ${
                result.success
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-350'
                  : 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-500/20 text-rose-800 dark:text-rose-350'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">{result.success ? 'Success' : 'Error'}</h4>
                <p className="text-xs leading-relaxed opacity-90 mt-0.5">{result.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
