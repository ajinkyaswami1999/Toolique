import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Download, Database, Code, Terminal, Layers } from 'lucide-react';
import { saveQueryHistory, getQueryHistory, clearQueryHistory } from '../utils/db';
import HTMLPlayground from './HTMLPlayground';

declare global {
  interface Window {
    initSqlJs: any;
    loadPyodide: any;
  }
}

export default function SQLPlayground() {
  const [activeTab, setActiveTab] = useState<'sql' | 'js' | 'python' | 'html'>('sql');
  const [sqlCode, setSqlCode] = useState('SELECT * FROM Customers;');
  const [jsCode, setJsCode] = useState('const greet = "Hello Toolique";\nconsole.log(greet);\ngreet + " Academy!";');
  const [pyCode, setPyCode] = useState('name = "Ajinkya"\nprint(f"Hello {name} from Python!")\n[x*2 for x in range(5)]');
  
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkTheme(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // SQL client instances
  const [db, setDb] = useState<any>(null);
  const [pyodide, setPyodide] = useState<any>(null);

  // Initialize SQLite WASM (sql.js)
  useEffect(() => {
    if (activeTab === 'sql' && !db) {
      loadSQLWasm();
    } else if (activeTab === 'python' && !pyodide) {
      loadPythonRuntime();
    }
    if (activeTab !== 'html') {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    try {
      const history = await getQueryHistory(activeTab as any);
      setHistoryList(history);
    } catch {
      setHistoryList([]);
    }
  };

  const loadSQLWasm = () => {
    setIsLoading(true);
    // Dynamic import CDN script tags
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
    script.async = true;
    script.onload = async () => {
      try {
        const SQL = await window.initSqlJs({
          locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        const instance = new SQL.Database();
        
        // Initialize dummy tables
        instance.run(`
          CREATE TABLE Customers (id INT PRIMARY KEY, name VARCHAR(50), country VARCHAR(50));
          INSERT INTO Customers VALUES (1, 'Ajinkya', 'India');
          INSERT INTO Customers VALUES (2, 'Emily', 'USA');
          INSERT INTO Customers VALUES (3, 'Hiroshi', 'Japan');
          
          CREATE TABLE Orders (orderId INT PRIMARY KEY, item VARCHAR(50), price INT, customerId INT);
          INSERT INTO Orders VALUES (101, 'Mechanical Keyboard', 4500, 1);
          INSERT INTO Orders VALUES (102, 'Bambu Filament', 2200, 1);
          INSERT INTO Orders VALUES (103, 'SLA Resin Bottle', 3500, 2);
        `);
        setDb(instance);
        setConsoleOutput(['SQLite Database initialized successfully with mock tables: Customers, Orders.']);
      } catch (err) {
        console.error('Failed to init sqlite wasm:', err);
        setConsoleOutput(['Failed to load SQLite WebAssembly. Falling back to offline memory mode.']);
      } finally {
        setIsLoading(false);
      }
    };
    script.onerror = () => {
      setConsoleOutput(['Failed to connect to SQLite CDN hosts. Check your internet connection.']);
      setIsLoading(false);
    };
    document.body.appendChild(script);
  };

  const loadPythonRuntime = () => {
    setIsLoading(true);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
    script.async = true;
    script.onload = async () => {
      try {
        const runtime = await window.loadPyodide();
        setPyodide(runtime);
        setConsoleOutput(['Python Pyodide runtime loaded successfully in browser!']);
      } catch (err) {
        console.error(err);
        setConsoleOutput(['Failed to load Pyodide runtime.']);
      } finally {
        setIsLoading(false);
      }
    };
    script.onerror = () => {
      setConsoleOutput(['Failed to download Pyodide CDN assets.']);
      setIsLoading(false);
    };
    document.body.appendChild(script);
  };

  const handleRunSQL = async () => {
    if (!db) {
      setConsoleOutput(['SQLite engine is loading or unavailable.']);
      return;
    }
    
    try {
      const stmt = db.prepare(sqlCode);
      const rows: any[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      setQueryResults(rows);
      setConsoleOutput([`Query executed successfully. Returned ${rows.length} rows.`]);
      
      // Save query history
      await saveQueryHistory('sql', sqlCode);
      loadHistory();
    } catch (err: any) {
      setConsoleOutput([`SQL Error: ${err.message}`]);
      setQueryResults([]);
    }
  };

  const handleRunJS = async () => {
    const logs: string[] = [];
    const originalLog = console.log;
    
    console.log = (...args) => {
      logs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
    };

    try {
      const evalResult = eval(jsCode);
      logs.push(`➔ Return Value: ${typeof evalResult === 'object' ? JSON.stringify(evalResult) : String(evalResult)}`);
      setConsoleOutput(logs);
      await saveQueryHistory('js', jsCode);
      loadHistory();
    } catch (err: any) {
      logs.push(`Runtime JS Error: ${err.message}`);
      setConsoleOutput(logs);
    } finally {
      console.log = originalLog;
    }
  };

  const handleRunPython = async () => {
    if (!pyodide) {
      setConsoleOutput(['Python runtime is loading...']);
      return;
    }

    try {
      pyodide.runPython(`
        import sys
        import io
        sys.stdout = io.StringIO()
      `);

      const result = pyodide.runPython(pyCode);
      const stdout = pyodide.runPython('sys.stdout.getvalue()');
      
      const outputs = [];
      if (stdout) outputs.push(stdout.trim());
      if (result !== undefined) outputs.push(`➔ Return Value: ${result}`);
      
      setConsoleOutput(outputs.length > 0 ? outputs : ['Python script finished with no outputs.']);
      await saveQueryHistory('python', pyCode);
      loadHistory();
    } catch (err: any) {
      setConsoleOutput([`Python Error: ${err.message}`]);
    }
  };

  const handleRun = () => {
    if (activeTab === 'sql') handleRunSQL();
    if (activeTab === 'js') handleRunJS();
    if (activeTab === 'python') handleRunPython();
  };

  const handleClearHistory = async () => {
    try {
      await clearQueryHistory(activeTab as any);
      loadHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const exportQuery = () => {
    const code = activeTab === 'sql' ? sqlCode : activeTab === 'js' ? jsCode : pyCode;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolique-playground-snippet.${activeTab}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (activeTab === 'html') {
    return (
      <div className="space-y-6">
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl w-max">
          {(['sql', 'js', 'python', 'html'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setConsoleOutput([]);
                setQueryResults([]);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-250'
              }`}
            >
              {tab === 'sql' ? <Database className="w-3.5 h-3.5" /> : tab === 'js' ? <Code className="w-3.5 h-3.5" /> : tab === 'python' ? <Terminal className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
              {tab === 'sql' ? 'SQLite' : tab === 'js' ? 'JavaScript' : tab === 'python' ? 'Python' : 'HTML & CSS'}
            </button>
          ))}
        </div>
        <HTMLPlayground />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
          {(['sql', 'js', 'python', 'html'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setConsoleOutput([]);
                setQueryResults([]);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-250'
              }`}
            >
              {tab === 'sql' ? <Database className="w-3.5 h-3.5" /> : tab === 'js' ? <Code className="w-3.5 h-3.5" /> : tab === 'python' ? <Terminal className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
              {tab === 'sql' ? 'SQLite' : tab === 'js' ? 'JavaScript' : tab === 'python' ? 'Python' : 'HTML & CSS'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportQuery}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-55 dark:hover:bg-zinc-900 cursor-pointer"
            title="Download Code"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleRun}
            disabled={isLoading}
            className="saas-button-primary py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" /> Run
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="col-span-1 lg:col-span-8 rounded-2xl border border-zinc-200 dark:border-zinc-855 overflow-hidden shadow-sm">
          <Editor
            height="320px"
            language={activeTab === 'sql' ? 'sql' : activeTab === 'js' ? 'javascript' : 'python'}
            value={activeTab === 'sql' ? sqlCode : activeTab === 'js' ? jsCode : pyCode}
            onChange={(val: string | undefined) => {
              if (activeTab === 'sql') setSqlCode(val || '');
              if (activeTab === 'js') setJsCode(val || '');
              if (activeTab === 'python') setPyCode(val || '');
            }}
            theme={isDarkTheme ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: 'Fira Code, monospace',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              padding: { top: 10, bottom: 10 }
            }}
          />
        </div>

        <div className="col-span-1 lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/20 dark:bg-zinc-905/20 space-y-3">
            <h4 className="text-[10px] font-black text-zinc-450 dark:text-zinc-555 uppercase tracking-wider flex justify-between">
              <span>Query History</span>
              {historyList.length > 0 && (
                <button onClick={handleClearHistory} className="text-rose-500 hover:underline cursor-pointer">
                  Clear
                </button>
              )}
            </h4>
            {historyList.length > 0 ? (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {historyList.slice(0, 3).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (activeTab === 'sql') setSqlCode(item.query);
                      if (activeTab === 'js') setJsCode(item.query);
                      if (activeTab === 'python') setPyCode(item.query);
                    }}
                    className="w-full text-left p-1.5 rounded bg-zinc-100/50 dark:bg-zinc-900/30 text-[10px] font-mono text-zinc-650 truncate block hover:border-indigo-500/20 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
                    title={item.query}
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            ) : (
              <span className="block text-[10px] text-zinc-400 py-3 text-center">No history logs.</span>
            )}
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-emerald-400 font-mono text-[11px] min-h-[8.5rem] max-h-48 overflow-y-auto space-y-1">
            <div className="text-[10px] font-bold text-zinc-500 border-b border-zinc-200 dark:border-zinc-800/80 pb-1 mb-2">Console output:</div>
            {consoleOutput.length > 0 ? (
              consoleOutput.map((log, index) => (
                <div key={index} className="leading-relaxed whitespace-pre-wrap">{log}</div>
              ))
            ) : (
              <div className="text-zinc-600">Console is idle. Press Run to execute.</div>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'sql' && queryResults.length > 0 && (
        <div className="space-y-2 animate-fade-in text-left">
          <h4 className="text-[9px] font-black text-zinc-400 dark:text-zinc-555 uppercase">SQL Executed Rows</h4>
          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px] max-h-60">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-900 text-zinc-650 border-b border-zinc-200 dark:border-zinc-800">
                  {Object.keys(queryResults[0]).map(key => (
                    <th key={key} className="p-2 font-bold">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-850/80 font-medium">
                {queryResults.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-55/30 dark:hover:bg-zinc-900/30">
                    {Object.values(row).map((val: any, cellIdx) => (
                      <td key={cellIdx} className="p-2 text-zinc-800 dark:text-zinc-300 font-mono">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
