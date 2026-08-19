import { useState, useEffect } from 'react';
import { Clipboard, Check, Eye, AlertTriangle } from 'lucide-react';

export default function XPathSelectorTester() {
  const [sourceCode, setSourceCode] = useState<string>(
`<div class="container">
  <h1 id="title">Toolique Suite</h1>
  <p class="desc">Privacy first developer tools.</p>
  <ul class="tools-list">
    <li class="tool-item" data-id="1">JSON Formatter</li>
    <li class="tool-item" data-id="2">JWT Decoder</li>
    <li class="tool-item animate" data-id="3">BVA Generator</li>
  </ul>
</div>`);
  const [xpathQuery, setXpathQuery] = useState<string>('//li[@class="tool-item"]/text()');
  const [results, setResults] = useState<string[]>([]);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sourceCode.trim() || !xpathQuery.trim()) {
      setResults([]);
      setMatchCount(0);
      setErrorMsg(null);
      return;
    }

    try {
      const parser = new DOMParser();
      // Try parsing as text/html. If it fails, fallback to application/xml
      const doc = parser.parseFromString(sourceCode, 'text/html');
      
      const parserErrors = doc.getElementsByTagName('parsererror');
      if (parserErrors.length > 0) {
        setErrorMsg(`Parser Warning: HTML/XML format may be invalid.`);
      } else {
        setErrorMsg(null);
      }

      // Evaluate XPath
      const evaluator = new XPathEvaluator();
      const expression = evaluator.createExpression(xpathQuery, null);
      const xpathResult = expression.evaluate(doc, XPathResult.ANY_TYPE, null);

      const items: string[] = [];
      
      if (xpathResult.resultType === XPathResult.NUMBER_TYPE) {
        items.push(`Number Result: ${xpathResult.numberValue}`);
      } else if (xpathResult.resultType === XPathResult.STRING_TYPE) {
        items.push(`String Result: "${xpathResult.stringValue}"`);
      } else if (xpathResult.resultType === XPathResult.BOOLEAN_TYPE) {
        items.push(`Boolean Result: ${xpathResult.booleanValue}`);
      } else {
        // Iterate over matching nodes
        let node = xpathResult.iterateNext();
        while (node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            items.push(el.outerHTML);
          } else if (node.nodeType === Node.ATTRIBUTE_NODE) {
            const attr = node as Attr;
            items.push(`Attribute: ${attr.name}="${attr.value}"`);
          } else if (node.nodeType === Node.TEXT_NODE) {
            items.push(`Text node: "${node.textContent || ''}"`);
          } else {
            items.push(`${node.nodeName}: ${node.textContent || ''}`);
          }
          node = xpathResult.iterateNext();
        }
      }

      setResults(items);
      setMatchCount(items.length);
    } catch (e: any) {
      setErrorMsg(e.message || 'Invalid XPath expression or XML syntax.');
      setResults([]);
      setMatchCount(0);
    }
  }, [sourceCode, xpathQuery]);

  const handleCopy = () => {
    if (results.length === 0) return;
    navigator.clipboard.writeText(results.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadSample = () => {
    setXpathQuery('//li/text()');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Inputs panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="saas-card p-5 space-y-4 text-left">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">
              Source Code (HTML / XML)
            </h3>
            
            <textarea
              rows={12}
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="Paste HTML or XML code here..."
              className="w-full font-mono text-[11px] p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition leading-normal"
            />
          </div>

          <div className="saas-card p-5 space-y-4 text-left">
            <div className="flex justify-between items-center pb-1">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                XPath Expression
              </h3>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-[10px] font-black text-indigo-650 hover:underline cursor-pointer"
              >
                Reset to sample XPath
              </button>
            </div>

            <input
              type="text"
              value={xpathQuery}
              onChange={(e) => setXpathQuery(e.target.value)}
              placeholder="e.g. //li[@class='tool-item']"
              className="saas-input font-mono text-[11px]"
            />
          </div>
        </div>

        {/* Outputs panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="saas-card p-5 h-full flex flex-col justify-between text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200/40 dark:border-zinc-800/40">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white">
                    Matching Nodes
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 px-2 py-0.5 rounded">
                    {matchCount} matches
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={results.length === 0}
                  className="saas-button-secondary py-1 px-3 text-[10px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Clipboard className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy Matches'}</span>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {results.length > 0 ? (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {results.map((res, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-zinc-200/40 dark:border-zinc-850/60 bg-zinc-50/10 dark:bg-zinc-950/20 font-mono text-[11px] leading-relaxed break-all whitespace-pre-wrap text-emerald-600 dark:text-emerald-400"
                    >
                      {res}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-[280px] rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/10 dark:bg-zinc-950/20 flex flex-col items-center justify-center text-zinc-450 dark:text-zinc-550">
                  <Eye className="w-10 h-10 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-semibold">Matched items will be rendered here in real-time</p>
                </div>
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
