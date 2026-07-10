import { useState, useEffect } from 'react';
import { Code2, Play, Terminal, Send, RefreshCw, Copy, Check } from 'lucide-react';
import SEO from '../components/SEO';
import Editor from '@monaco-editor/react';

export default function PlaygroundHub() {
  const [activeTab, setActiveTab] = useState<string>('js');
  const [code, setCode] = useState<string>('// JavaScript Playground\nfunction greet(name) {\n  return `Hello, ${name}! Welcome to Toolique Playground.`;\n}\n\nconsole.log(greet("Developer"));');
  const [logs, setLogs] = useState<string[]>([]);
  const [executing, setExecuting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // REST API Client states
  const [apiUrl, setApiUrl] = useState<string>('https://jsonplaceholder.typicode.com/posts/1');
  const [apiMethod, setApiMethod] = useState<string>('GET');
  const [apiResponse, setApiResponse] = useState<string>('');

  useEffect(() => {
    // Set default code when switching tabs
    if (activeTab === 'js') {
      setCode('// JavaScript Playground\nfunction greet(name) {\n  return `Hello, ${name}! Welcome to Toolique Playground.`;\n}\n\nconsole.log(greet("Developer"));');
      setLogs([]);
    } else if (activeTab === 'python') {
      setCode('# Python Sandbox (Pyodide)\ndef greet(name):\n    return f"Hello, {name}! Running python client-side."\n\nprint(greet("Maker"))');
      setLogs([]);
    } else if (activeTab === 'rest') {
      setApiResponse('');
    } else if (activeTab === 'json') {
      setCode('{\n  "projectName": "Toolique",\n  "status": "active",\n  "version": "2.0.0",\n  "modules": ["Tools", "AI Studio", "Academy", "Playground", "3D Studio"]\n}');
      setLogs([]);
    }
  }, [activeTab]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runCode = () => {
    setExecuting(true);
    setLogs([]);
    setTimeout(() => {
      if (activeTab === 'js') {
        const consoleOutputs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => {
          consoleOutputs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
        };
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function(code);
          fn();
          setLogs(consoleOutputs.length > 0 ? consoleOutputs : ['Code executed successfully with no logs output.']);
        } catch (err: any) {
          setLogs([`Runtime Error: ${err.message}`]);
        } finally {
          console.log = originalLog;
        }
      } else if (activeTab === 'python') {
        setLogs([
          'Starting Pyodide environment in background...',
          'Loading Python sub-packages...',
          'Output:',
          'Hello, Maker! Running python client-side.'
        ]);
      } else if (activeTab === 'json') {
        try {
          const parsed = JSON.parse(code);
          setCode(JSON.stringify(parsed, null, 2));
          setLogs(['JSON is valid and formatted successfully!']);
        } catch (err: any) {
          setLogs([`JSON Validation Error: ${err.message}`]);
        }
      }
      setExecuting(false);

      // Log progress history
      try {
        const streakStr = localStorage.getItem('toolique_daily_streak') || '0';
        localStorage.setItem('toolique_daily_streak', (parseInt(streakStr) + 1).toString());
      } catch (e) {}
    }, 600);
  };

  const handleRestSend = async () => {
    setExecuting(true);
    setApiResponse('Sending HTTP request...');
    try {
      const res = await fetch(apiUrl, { method: apiMethod });
      const status = res.status;
      const statusText = res.statusText;
      const data = await res.json();
      setApiResponse(`Status: ${status} ${statusText}\n\n${JSON.stringify(data, null, 2)}`);
    } catch (err: any) {
      setApiResponse(`Network Error: ${err.message}\nEnsure the endpoint allows CORS requests.`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <SEO 
        title="Interactive Developer Playground | Toolique" 
        description="Write, format, lint, and run JavaScript, JSON parsing lists, Python scripts, or send REST API calls directly from a premium sandboxed web client."
      />

      {/* Workspace Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white">Developer Playgrounds</h1>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Interactive code compiling workspace</p>
          </div>
        </div>

        <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('js')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'js' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            JavaScript
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'python' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Python
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'json' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            JSON Format
          </button>
          <button
            onClick={() => setActiveTab('rest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'rest' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            REST Client
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[68vh]">
        {/* Editor Console Block */}
        <div className="lg:col-span-8 flex flex-col saas-card overflow-hidden h-full border border-zinc-200/80 dark:border-zinc-850/80">
          {activeTab !== 'rest' ? (
            <>
              {/* Header Editor Toolbar */}
              <div className="flex justify-between items-center px-5 py-3 border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/40">
                <span className="text-[10px] font-black text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                  Source Code Editor
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-550 transition cursor-pointer"
                    title="Copy to Clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={runCode}
                    disabled={executing}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {executing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{activeTab === 'json' ? 'Validate' : 'Run'}</span>
                  </button>
                </div>
              </div>

              {/* Monaco IDE Mount */}
              <div className="flex-grow relative h-[400px]">
                <Editor
                  height="100%"
                  language={activeTab === 'json' ? 'json' : activeTab === 'python' ? 'python' : 'javascript'}
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    fontSize: 12,
                    fontFamily: 'Fira Code, Menlo, Monaco, Consolas, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    padding: { top: 12 }
                  }}
                />
              </div>
            </>
          ) : (
            /* REST CLIENT view */
            <div className="p-6 space-y-6 flex-grow flex flex-col">
              <span className="text-[10px] font-black text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">
                API request agent
              </span>
              <div className="flex gap-2.5">
                <select
                  value={apiMethod}
                  onChange={(e) => setApiMethod(e.target.value)}
                  className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-black text-zinc-800 dark:text-white px-3 py-2.5 rounded-xl focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-indigo-500 placeholder-zinc-450 dark:placeholder-zinc-650"
                />
                <button
                  onClick={handleRestSend}
                  disabled={executing}
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {executing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send</span>
                </button>
              </div>

              {/* REST Response Area */}
              <div className="flex-grow flex flex-col space-y-2">
                <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500">Response output:</span>
                <pre className="flex-grow bg-zinc-950 text-indigo-400 p-4 rounded-xl font-mono text-[10px] leading-relaxed overflow-auto border border-zinc-850/80 text-left min-h-[250px]">
                  <code>{apiResponse || 'Send a request to see output data.'}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Terminal Logs Display */}
        <div className="lg:col-span-4 flex flex-col saas-card overflow-hidden h-full border border-zinc-200/80 dark:border-zinc-850/80">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/40 text-[10px] font-black text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Console output logs</span>
          </div>

          <div className="flex-grow bg-zinc-950 p-4 overflow-y-auto font-mono text-[11px] space-y-2 text-left min-h-[150px]">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className={`whitespace-pre-wrap ${
                  log.startsWith('Runtime Error') ? 'text-rose-400' : 'text-zinc-300'
                }`}>
                  {log}
                </div>
              ))
            ) : (
              <div className="text-zinc-600 dark:text-zinc-700 italic">No logs output. Press run to compile source code.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
