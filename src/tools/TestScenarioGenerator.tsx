import { useState } from 'react';
import { 
  Play, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Check, 
  HelpCircle,
  FileText
} from 'lucide-react';

interface Scenario {
  id: string;
  type: 'positive' | 'negative';
  description: string;
  expectedResult: string;
}

export default function TestScenarioGenerator() {
  const [requirement, setRequirement] = useState(
    "Create a login form with email and password fields. The email must be valid and password should be at least 8 characters long. It should include a 'Remember Me' checkbox and a 'Forgot Password' link."
  );
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const generateScenarios = () => {
    if (!requirement.trim()) return;

    const reqText = requirement.toLowerCase();
    const generated: Scenario[] = [];
    let idCounter = 1;

    const addScenario = (type: 'positive' | 'negative', description: string, expectedResult: string) => {
      generated.push({
        id: `TS-${idCounter++}`,
        type,
        description,
        expectedResult
      });
    };

    // 1. Email validation rules
    if (reqText.includes('email') || reqText.includes('mail')) {
      addScenario('positive', 'Verify login with a valid email format (e.g. user@example.com).', 'System accepts the email and proceeds to credential validation.');
      addScenario('negative', 'Verify email input with missing "@" symbol (e.g. userexample.com).', 'Validation error is displayed indicating invalid email format.');
      addScenario('negative', 'Verify email input with missing domain suffix (e.g. user@example).', 'Validation error is displayed indicating invalid email format.');
      addScenario('negative', 'Verify blank email input submission.', 'Validation error is displayed indicating email is required.');
    }

    // 2. Password rules
    if (reqText.includes('password') || reqText.includes('pass')) {
      // Check for length constraints
      const lengthMatch = reqText.match(/at least\s+(\d+)\s+character/);
      const minLength = lengthMatch ? parseInt(lengthMatch[1]) : 8;

      addScenario('positive', `Verify password input meets minimum length requirement of ${minLength} characters.`, 'System accepts the password input.');
      addScenario('negative', `Verify password input below minimum length requirement (e.g. ${minLength - 1} characters).`, `Validation error is displayed indicating password must be at least ${minLength} characters.`);
      addScenario('negative', 'Verify blank password input submission.', 'Validation error is displayed indicating password is required.');
      addScenario('negative', 'Verify password input with special characters and SQL injection strings (e.g. \' OR \'1\'=\'1).', 'System sanitizes input or rejects authentication safely without leaking schema logs.');
    }

    // 3. Login specific forms
    if (reqText.includes('login') || reqText.includes('signin') || reqText.includes('credential')) {
      addScenario('positive', 'Verify successful login with valid active email and password.', 'User is authenticated and redirected to dashboard.');
      addScenario('negative', 'Verify login with valid email format but incorrect password.', 'Authentication fails with generic "Invalid credentials" error.');
      addScenario('negative', 'Verify login with un-registered email.', 'Authentication fails with generic "Invalid credentials" error to prevent account enumeration.');
      addScenario('negative', 'Verify account lockout behavior after multiple consecutive failed attempts (e.g., 5 failures).', 'Account is temporarily locked or CAPTCHA is triggered.');
    }

    // 4. Remember me checkbox
    if (reqText.includes('remember') || reqText.includes('checkbox')) {
      addScenario('positive', 'Verify checking "Remember Me" persists session cookie beyond tab closure.', 'Session remains active upon reopening browser window.');
      addScenario('positive', 'Verify unchecking "Remember Me" invalidates session upon closing browser tab.', 'User is prompted to re-login on next browser visit.');
    }

    // 5. Links
    if (reqText.includes('forgot') || reqText.includes('link')) {
      addScenario('positive', 'Verify clicking "Forgot Password" link redirects to reset-password wizard.', 'Reset password configuration page is loaded.');
    }

    // 6. Generic Fallbacks if requirement is short or generic
    if (generated.length === 0) {
      addScenario('positive', 'Verify successful execution of requirement under standard load.', 'System completes the action successfully.');
      addScenario('negative', 'Verify system behavior when mandatory inputs are blank.', 'System blocks submission and displays field-level validations.');
      addScenario('negative', 'Verify input validation filters block emoji and HTML script tag injections.', 'System sanitizes inputs and blocks XSS scripts.');
    }

    setScenarios(generated);
  };

  const handleAdd = () => {
    const newId = `TS-${scenarios.length + 1}`;
    setScenarios([
      ...scenarios,
      {
        id: newId,
        type: 'positive',
        description: 'New custom scenario description...',
        expectedResult: 'Expected output result...'
      }
    ]);
    setEditingId(newId);
  };

  const handleDelete = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const handleUpdate = (id: string, field: keyof Scenario, value: string) => {
    setScenarios(
      scenarios.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const getExportText = (format: 'csv' | 'md' | 'json') => {
    if (format === 'csv') {
      const headers = 'Scenario ID,Type,Description,Expected Result\n';
      const rows = scenarios
        .map(
          (s) =>
            `"${s.id}","${s.type}","${s.description.replace(/"/g, '""')}","${s.expectedResult.replace(/"/g, '""')}"`
        )
        .join('\n');
      return headers + rows;
    }
    if (format === 'md') {
      let md = `## Generated Test Scenarios\n\n| ID | Type | Description | Expected Result |\n| --- | --- | --- | --- |\n`;
      scenarios.forEach((s) => {
        md += `| ${s.id} | **${s.type.toUpperCase()}** | ${s.description} | ${s.expectedResult} |\n`;
      });
      return md;
    }
    return JSON.stringify(scenarios, null, 2);
  };

  const handleCopy = () => {
    const text = getExportText('md');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'csv' | 'md' | 'json') => {
    const text = getExportText(format);
    const mimeMap = {
      csv: 'text/csv',
      md: 'text/markdown',
      json: 'application/json'
    };
    const extMap = { csv: 'csv', md: 'md', json: 'json' };
    
    const blob = new Blob([text], { type: mimeMap[format] });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test_scenarios_${Date.now()}.${extMap[format]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* Input panel */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Paste Software Requirement / User Story</span>
          </label>
          <span className="text-[10px] text-zinc-400 font-bold">Client-Side Parser</span>
        </div>
        <textarea
          rows={5}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="e.g. As a user, I want to upload files up to 5MB in PDF/PNG format..."
          className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-zinc-150 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-650"
        />
        <div className="flex gap-4">
          <button
            onClick={generateScenarios}
            className="saas-button-primary inline-flex items-center gap-2 text-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Generate Scenarios</span>
          </button>
          <button
            onClick={() => setRequirement('')}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-zinc-500 dark:text-zinc-455"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Generated Scenarios output list */}
      {scenarios.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-500">
              Scenarios Blueprint ({scenarios.length} Generated)
            </h2>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleAdd}
                className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/10 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Markdown Table</span>
              </button>
              <div className="relative group">
                <button
                  className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
                <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-1 z-30 min-w-[120px]">
                  <button
                    onClick={() => handleDownload('csv')}
                    className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-zinc-55 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                  >
                    CSV Format
                  </button>
                  <button
                    onClick={() => handleDownload('md')}
                    className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-zinc-55 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                  >
                    Markdown Table
                  </button>
                  <button
                    onClick={() => handleDownload('json')}
                    className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-zinc-55 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                  >
                    JSON Format
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {scenarios.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  item.type === 'positive'
                    ? 'border-emerald-500/10 dark:border-emerald-500/20 bg-emerald-500/[0.01]'
                    : 'border-rose-500/10 dark:border-rose-500/20 bg-rose-500/[0.01]'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-[10px] font-black text-zinc-400 shrink-0">{item.id}</span>
                    <select
                      value={item.type}
                      onChange={(e) => handleUpdate(item.id, 'type', e.target.value as any)}
                      className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider focus:outline-none ${
                        item.type === 'positive'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/10'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/10'
                      }`}
                    >
                      <option value="positive" className="bg-white dark:bg-zinc-950">Positive</option>
                      <option value="negative" className="bg-white dark:bg-zinc-950">Negative</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-zinc-400 hover:text-rose-500 transition p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Scenario Description</span>
                    {editingId === item.id ? (
                      <textarea
                        value={item.description}
                        onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                        onBlur={() => setEditingId(null)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                    ) : (
                      <p
                        onClick={() => setEditingId(item.id)}
                        className="text-xs text-zinc-800 dark:text-zinc-250 font-semibold cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-850 p-1.5 rounded-xl leading-relaxed whitespace-pre-wrap"
                      >
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Expected Result</span>
                    {editingId === `expected-${item.id}` ? (
                      <textarea
                        value={item.expectedResult}
                        onChange={(e) => handleUpdate(item.id, 'expectedResult', e.target.value)}
                        onBlur={() => setEditingId(null)}
                        className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />
                    ) : (
                      <p
                        onClick={() => setEditingId(`expected-${item.id}`)}
                        className="text-xs text-zinc-650 dark:text-zinc-400 font-semibold cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-850 p-1.5 rounded-xl leading-relaxed"
                      >
                        {item.expectedResult}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Help Block */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/35 border border-zinc-200/50 dark:border-zinc-850/50 text-xs text-zinc-500 dark:text-zinc-400 space-y-2 leading-relaxed">
        <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-white">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <span>How it works:</span>
        </div>
        <p>Paste user stories, raw software requirements, or specs in the input box. The local validation client reads keywords such as "login", "password length", "email validations", or checkbox parameters, applying standard QA heuristics to instantly map positive and negative scenario templates which you can refine, expand, and copy as markdown tables directly into JIRA issues.</p>
      </div>
    </div>
  );
}
