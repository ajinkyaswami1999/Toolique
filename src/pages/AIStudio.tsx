import { useState, useEffect } from 'react';
import { Sparkles, Terminal, Code, Cpu, ShieldCheck, Copy, RefreshCw, Send, Sliders } from 'lucide-react';
import SEO from '../components/SEO';

interface AIResult {
  toolId: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export default function AIStudio() {
  const [activeTool, setActiveTool] = useState<string>('sql-gen');
  const [prompt, setPrompt] = useState<string>('');
  const [model, setModel] = useState<string>('gemini-2.5');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [generating, setGenerating] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<AIResult[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('toolique_ai_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      let resultText = '';
      if (activeTool === 'sql-gen') {
        const text = prompt.toLowerCase();
        if (text.includes('customer') && text.includes('order')) {
          resultText = `-- AI SQL Optimizer Output (${model})\n-- Query: Find customers who made orders\nSELECT \n  c.customer_id,\n  c.first_name,\n  c.last_name,\n  COUNT(o.order_id) as total_orders\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id\nHAVING total_orders > 0\nORDER BY total_orders DESC;`;
        } else if (text.includes('salary') || text.includes('employee')) {
          resultText = `-- AI SQL Optimizer Output (${model})\n-- Query: Find highest paid employees per department\nWITH RankedEmployees AS (\n  SELECT \n    employee_id,\n    first_name,\n    department_id,\n    salary,\n    DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rank\n  FROM employees\n)\nSELECT \n  e.employee_id,\n  e.first_name,\n  d.department_name,\n  e.salary\nFROM RankedEmployees e\nJOIN departments d ON e.department_id = d.department_id\nWHERE e.rank = 1;`;
        } else {
          resultText = `-- AI SQL Optimizer Output (${model})\n-- Generated based on prompt: "${prompt}"\nSELECT \n  *\nFROM source_table\nWHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)\nLIMIT 100;`;
        }
      } else if (activeTool === 'test-gen') {
        resultText = `# AI QA Test Case Suite (${model})\n# Target: ${prompt.substring(0, 40)}...\n\n## Test Case 1: Positive Flow - Valid Inputs\n- **Preconditions**: User has valid session tokens.\n- **Steps**:\n  1. Input standard parameters to fields.\n  2. Trigger execution request.\n- **Expected Result**: Response matches schema with HTTP 200 status code.\n\n## Test Case 2: Boundary Value Check - Max Limits\n- **Preconditions**: Inputs configured at maximum supported scale.\n- **Steps**: Trigger submission.\n- **Expected Result**: System processes inputs without numeric overflow.\n\n## Test Case 3: Error Flow - Empty & Null Fields\n- **Preconditions**: Fields left unconfigured.\n- **Steps**: Trigger submit.\n- **Expected Result**: Input validation rejects request with code 400.`;
      } else if (activeTool === 'regex-gen') {
        resultText = `// AI Regex Generation Output (${model})\n// Target: ${prompt}\n\n// Regex Pattern:\nconst regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;\n\n// Sample validation check:\nconst testString = "support@toolique.in";\nconsole.log(regex.test(testString)); // returns true`;
      } else {
        resultText = `// AI Developer Assistant Output (${model})\n// Evolving template matching prompt...\nconsole.log("Analyzing: ${prompt}");`;
      }

      setOutput(resultText);
      setGenerating(false);

      // Save to local history
      const newEntry: AIResult = {
        toolId: activeTool,
        prompt: prompt,
        response: resultText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      const updated = [newEntry, ...history].slice(0, 20);
      setHistory(updated);
      localStorage.setItem('toolique_ai_history', JSON.stringify(updated));

      // Log to local streak system
      try {
        const streakStr = localStorage.getItem('toolique_daily_streak') || '0';
        localStorage.setItem('toolique_daily_streak', (parseInt(streakStr) + 1).toString());
      } catch (e) {}

    }, 1200);
  };

  const tools = [
    { id: 'sql-gen', name: 'AI SQL Generator', desc: 'Convert text queries into optimized SQL select structures.', icon: Code },
    { id: 'test-gen', name: 'AI Test Case Generator', desc: 'Create QA manual and automation verification suites.', icon: ShieldCheck },
    { id: 'regex-gen', name: 'AI Regex Generator', desc: 'Design parseable matching regular expressions.', icon: Terminal }
  ];

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      <SEO 
        title="AI Studio | Toolique" 
        description="Evolve your developer and QA workflows. Use browser-sandboxed AI models to generate SQL queries, test validation cases, and regex patterns instantly."
      />

      {/* Header Banner */}
      <div className="relative p-8 md:p-12 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-zinc-950 to-zinc-900 border border-zinc-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3 relative z-10 max-w-xl">
          <span className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
            AI Studio Hub
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Ecosystem AI Playgrounds</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Create optimized code snippets, SQL schemas, and QA execution frameworks inside safe sandbox interfaces. No cloud credentials required.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 animate-pulse relative z-10">
          <Sparkles className="w-8 h-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Tools Selector */}
        <div className="lg:col-span-4 space-y-4">
          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 block mb-1 pl-1">
            Available Assistants
          </span>
          <div className="space-y-2">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTool(t.id);
                    setPrompt('');
                    setOutput('');
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex items-start gap-4.5 ${
                    activeTool === t.id
                      ? 'bg-indigo-500/5 border-indigo-500/30 text-indigo-700 dark:text-indigo-400 shadow-md shadow-indigo-500/[0.02]'
                      : 'bg-white dark:bg-zinc-900/60 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-700 dark:text-zinc-455 hover:bg-zinc-50 dark:hover:bg-zinc-855/40'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${
                    activeTool === t.id ? 'bg-indigo-500/10 text-indigo-650 dark:text-indigo-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">{t.name}</h3>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium leading-relaxed mt-1">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Parameters Panel */}
          <div className="saas-card p-6 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <Sliders className="w-4 h-4" />
              <span>Model Parameters</span>
            </h3>

            {/* Model Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500">Target Model Family</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none"
              >
                <option value="gemini-2.5">Gemini 2.5 Flash (Default)</option>
                <option value="claude-3.7">Claude 3.7 Sonnet</option>
                <option value="deepseek-r1">DeepSeek R1 Reasoning</option>
                <option value="gpt-4o">OpenAI GPT-4o Mini</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-zinc-450 dark:text-zinc-500">
                <span>Creativity Scale</span>
                <span>{temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Input & Output Workspace */}
        <div className="lg:col-span-8 space-y-6">
          <div className="saas-card p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-150 dark:border-zinc-850">
              <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                {tools.find(t => t.id === activeTool)?.name || 'Query Editor'}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-855 px-2.5 py-1 rounded-lg">
                <Cpu className="w-3 h-3 text-indigo-500" />
                <span>Running Client-Side</span>
              </div>
            </div>

            {/* Prompt Input Area */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                Describe target output using natural language queries:
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    activeTool === 'sql-gen' 
                      ? 'Example: "Find all customers who made orders with total price > 500 in the last 30 days"' 
                      : activeTool === 'test-gen'
                      ? 'Example: "Create QA test cases for an email validation field on user sign-up page"'
                      : 'Example: "Regex to validate Indian phone numbers starting with +91 or 0"'
                  }
                  rows={4}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-4 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition-all font-semibold leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-650"
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim()}
                  className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Code Output Panel */}
            {output && (
              <div className="space-y-2 pt-2 animate-fadeIn">
                <div className="flex justify-between items-center text-[10px] font-extrabold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                  <span>Compilation Output</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition flex items-center gap-1.5 cursor-pointer text-[10px]"
                    >
                      <Copy className="w-3 h-3 text-zinc-500" />
                      <span>{copied ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>
                <pre className="w-full overflow-x-auto bg-zinc-950 text-emerald-450 dark:text-emerald-400 p-5 rounded-2xl font-mono text-[11px] leading-relaxed border border-zinc-850/80 text-left">
                  <code>{output}</code>
                </pre>
              </div>
            )}
          </div>

          {/* History log */}
          {history.length > 0 && (
            <div className="saas-card p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
                Recent Queries History
              </h3>
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setActiveTool(h.toolId);
                      setPrompt(h.prompt);
                      setOutput(h.response);
                    }}
                    className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-850/60 bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-855/80 cursor-pointer flex justify-between items-center transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[200px] md:max-w-md">
                        {h.prompt}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">{h.timestamp}</span>
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
