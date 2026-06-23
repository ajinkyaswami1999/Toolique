import { useState } from 'react';
import { Copy, Sparkles, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

export default function XMLFormatter() {
  const [xmlInput, setXmlInput] = useState(`<?xml version="1.0" encoding="UTF-8"?>\n<note>\n<to>Tove</to>\n<from>Jani</from>\n<heading>Reminder</heading>\n<body>Don't forget me this weekend!</body>\n</note>`);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const serializeNode = (node: Node, depth: number, indent: number): string => {
    const spacer = ' '.repeat(depth * indent);

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      let attrs = '';
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attrs += ` ${attr.name}="${attr.value}"`;
      }

      if (element.childNodes.length === 0) {
        return `${spacer}<${element.tagName}${attrs} />\n`;
      }

      let childrenStr = '';
      let hasTextOnly = false;

      if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
        const val = element.childNodes[0].nodeValue?.trim();
        if (val) {
          childrenStr = val;
          hasTextOnly = true;
        }
      } else {
        element.childNodes.forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const val = child.nodeValue?.trim();
            if (val) {
              childrenStr += `${spacer}${' '.repeat(indent)}${val}\n`;
            }
          } else {
            childrenStr += serializeNode(child, depth + 1, indent);
          }
        });
      }

      if (hasTextOnly) {
        return `${spacer}<${element.tagName}${attrs}>${childrenStr}</${element.tagName}>\n`;
      } else {
        return `${spacer}<${element.tagName}${attrs}>\n${childrenStr}${spacer}</${element.tagName}>\n`;
      }
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const val = node.nodeValue?.trim();
      return val ? `${spacer}${val}\n` : '';
    }

    if (node.nodeType === Node.COMMENT_NODE) {
      return `${spacer}<!-- ${node.nodeValue?.trim()} -->\n`;
    }

    return '';
  };

  const handleFormat = () => {
    if (!xmlInput.trim()) {
      setResult({ success: false, message: 'XML input is empty.' });
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlInput, 'application/xml');

      const parserError = xmlDoc.getElementsByTagName('parsererror');
      if (parserError.length > 0) {
        throw new Error(parserError[0].textContent || 'XML Parsing Error');
      }

      let formatted = '';
      xmlDoc.childNodes.forEach((node) => {
        if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
          formatted += `<?xml version="1.0" encoding="UTF-8"?>\n`;
        } else {
          formatted += serializeNode(node, 0, indentSize);
        }
      });

      setXmlInput(formatted.trim());
      setResult({ success: true, message: 'XML parsed and formatted successfully!' });
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Malformed XML structure detected.' });
    }
  };

  const handleMinify = () => {
    if (!xmlInput.trim()) {
      setResult({ success: false, message: 'XML input is empty.' });
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlInput, 'application/xml');
      
      const parserError = xmlDoc.getElementsByTagName('parsererror');
      if (parserError.length > 0) {
        throw new Error(parserError[0].textContent || 'XML Parsing Error');
      }

      const minified = xmlInput
        .replace(/>\s+</g, '><')
        .replace(/<!--[\s\S]*?-->/g, '')
        .trim();

      setXmlInput(minified);
      setResult({ success: true, message: 'XML minified successfully!' });
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Malformed XML structure detected.' });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-6 text-left">
      <div className="saas-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">XML Formatter & Validator</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Pretty-print, validate, and minify XML data tags in-browser.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg text-xs font-semibold">
              <span className="text-zinc-500">Indent:</span>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(parseInt(e.target.value, 10))}
                className="bg-transparent border-none focus:outline-none cursor-pointer text-zinc-700 dark:text-zinc-300"
              >
                <option value={2}>2 Spaces</option>
                <option value={4}>4 Spaces</option>
                <option value={8}>8 Spaces</option>
              </select>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => {
                setXmlInput('');
                setResult(null);
              }}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={xmlInput}
            onChange={(e) => setXmlInput(e.target.value)}
            className="w-full h-80 font-mono text-sm p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition outline-none resize-y"
            placeholder="Paste your XML document here..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleFormat}
              className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Format XML</span>
            </button>
            <button
              onClick={handleMinify}
              className="py-3 bg-zinc-850 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 rotate-180" />
              <span>Minify XML</span>
            </button>
          </div>
        </div>

        {result && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition ${
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
              <h4 className="font-bold text-sm">{result.success ? 'Parsing Validated' : 'Validation Error'}</h4>
              <p className="text-xs leading-relaxed opacity-90 mt-0.5">{result.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
