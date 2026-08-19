import { useState } from 'react';
import { Clipboard, Check, RefreshCw, Eye, EyeOff } from 'lucide-react';

export default function BugReportGenerator() {
  const [title, setTitle] = useState('');
  const [component, setComponent] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [environment, setEnvironment] = useState('Production (Web / Chrome)');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<string[]>(['Navigate to...', 'Click on...', 'Observe the...']);
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [workaround, setWorkaround] = useState('');

  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const handleStepChange = (index: number, val: string) => {
    const updated = [...steps];
    updated[index] = val;
    setSteps(updated);
  };

  const handleAddStep = () => {
    setSteps([...steps, '']);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length === 1) return;
    setSteps(steps.filter((_, i) => i !== index));
  };

  const generateMarkdown = () => {
    let md = `## [BUG] ${title || 'Untitled Bug'}\n\n`;
    md += `**Component/Area:** ${component || 'General'}\n`;
    md += `**Severity:** ${severity}\n`;
    md += `**Environment:** ${environment}\n\n`;
    md += `### Description\n${description || 'No description provided.'}\n\n`;
    
    md += `### Steps to Reproduce\n`;
    steps.forEach((step, idx) => {
      if (step.trim()) {
        md += `${idx + 1}. ${step.trim()}\n`;
      }
    });
    md += `\n`;

    md += `### Expected Result\n${expected || 'What should have happened.'}\n\n`;
    md += `### Actual Result\n${actual || 'What actually happened.'}\n\n`;

    if (workaround.trim()) {
      md += `### Workaround\n${workaround.trim()}\n\n`;
    }

    md += `*Report generated via [Toolique.in](https://www.toolique.in)*`;
    return md;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setTitle('');
    setComponent('');
    setSeverity('Medium');
    setEnvironment('Production (Web / Chrome)');
    setDescription('');
    setSteps(['Navigate to...', 'Click on...', 'Observe the...']);
    setExpected('');
    setActual('');
    setWorkaround('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="saas-card p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                Bug Details
              </h3>
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] font-bold text-zinc-450 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Form</span>
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Bug Title</label>
                <input
                  type="text"
                  placeholder="e.g. Checkout page freezes when payment fails"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="saas-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="saas-select"
                  >
                    <option value="Critical">🚨 Critical</option>
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🟢 Low</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Component</label>
                  <input
                    type="text"
                    placeholder="e.g. Authentication, Billing"
                    value={component}
                    onChange={(e) => setComponent(e.target.value)}
                    className="saas-input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Environment</label>
                <input
                  type="text"
                  placeholder="e.g. Staging (macOS / Safari 17.2)"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="saas-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Description</label>
                <textarea
                  rows={2}
                  placeholder="Briefly summarize the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="saas-input resize-none"
                />
              </div>

              {/* Steps to Reproduce */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-400 flex justify-between items-center">
                  <span>Steps to Reproduce</span>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="text-[9px] font-extrabold text-indigo-650 hover:underline cursor-pointer"
                  >
                    + Add Step
                  </button>
                </label>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-[10px] font-mono font-bold text-zinc-400 w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => handleStepChange(idx, e.target.value)}
                        className="saas-input py-1.5"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        disabled={steps.length === 1}
                        className="text-zinc-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Expected Result</label>
                  <textarea
                    rows={2}
                    placeholder="What should have happened..."
                    value={expected}
                    onChange={(e) => setExpected(e.target.value)}
                    className="saas-input resize-none text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400">Actual Result</label>
                  <textarea
                    rows={2}
                    placeholder="What actually happened..."
                    value={actual}
                    onChange={(e) => setActual(e.target.value)}
                    className="saas-input resize-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400">Workaround (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Refreshing page restores cart items"
                  value={workaround}
                  onChange={(e) => setWorkaround(e.target.value)}
                  className="saas-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Markdown Output Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="saas-card p-5 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                  Markdown Report
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-[10px] font-bold text-zinc-500 hover:text-indigo-650 flex items-center gap-1 cursor-pointer"
                  >
                    {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPreview ? 'Show Raw MD' : 'Show Rendered'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="saas-button-primary py-1 px-3 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Clipboard className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy markdown'}</span>
                  </button>
                </div>
              </div>

              {showPreview ? (
                <div className="p-4 rounded-xl border border-zinc-250/20 dark:border-zinc-850/60 bg-zinc-50/10 dark:bg-zinc-950/20 text-xs font-semibold text-zinc-750 dark:text-zinc-350 space-y-3.5 text-left h-[420px] overflow-y-auto leading-relaxed">
                  <h4 className="text-base font-black text-zinc-900 dark:text-white border-b border-zinc-200/30 pb-1">
                    {title || 'Untitled Bug'}
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-bold">
                    <div>
                      <span className="text-zinc-400">Area: </span>
                      <span className="text-zinc-650 dark:text-zinc-250">{component || 'General'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Severity: </span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        severity === 'Critical' || severity === 'High' ? 'text-rose-500 bg-rose-500/5' : 'text-zinc-600 bg-zinc-100 dark:text-zinc-350 dark:bg-zinc-900'
                      }`}>{severity}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Env: </span>
                      <span className="text-zinc-650 dark:text-zinc-250">{environment}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="font-black text-zinc-900 dark:text-white">Description:</span>
                    <p className="text-zinc-600 dark:text-zinc-400 bg-white/20 dark:bg-zinc-900/20 p-2.5 rounded-lg border border-zinc-200/10">
                      {description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-black text-zinc-900 dark:text-white">Steps to Reproduce:</span>
                    <ol className="list-decimal pl-4.5 space-y-1 text-zinc-600 dark:text-zinc-400">
                      {steps.filter(s => s.trim()).map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="font-black text-zinc-900 dark:text-white">Expected:</span>
                      <p className="text-zinc-600 dark:text-zinc-400 bg-white/20 dark:bg-zinc-900/20 p-2.5 rounded-lg border border-zinc-200/10">
                        {expected || 'What should happen.'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-black text-zinc-900 dark:text-white">Actual:</span>
                      <p className="text-zinc-600 dark:text-zinc-400 bg-white/20 dark:bg-zinc-900/20 p-2.5 rounded-lg border border-zinc-200/10">
                        {actual || 'What actually happens.'}
                      </p>
                    </div>
                  </div>

                  {workaround.trim() && (
                    <div className="space-y-1">
                      <span className="font-black text-zinc-900 dark:text-white">Workaround:</span>
                      <p className="text-zinc-600 dark:text-zinc-400 bg-white/20 dark:bg-zinc-900/20 p-2.5 rounded-lg border border-zinc-200/10">
                        {workaround}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  readOnly
                  value={generateMarkdown()}
                  className="w-full h-[420px] font-mono text-[11px] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-emerald-400 focus:outline-none resize-none leading-relaxed"
                />
              )}
            </div>
            
            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold pt-4">
              All computations are completed locally in browser sandbox. Data remains inside your browser memory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
