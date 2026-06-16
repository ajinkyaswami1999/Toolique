import { useState, useEffect } from 'react';
import { Binary, Copy, Check, Trash2, Download, Upload } from 'lucide-react';

export default function Base64Tool() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState<string>('Hello, Toolique!');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setError(null);
    if (!input) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'encode') {
        // Safe UTF-8 Base64 Encoding
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
      } else {
        // Safe UTF-8 Base64 Decoding
        // Remove whitespace/newlines from base64 string
        const cleanInput = input.replace(/\s+/g, '');
        const decoded = decodeURIComponent(escape(atob(cleanInput)));
        setOutput(decoded);
      }
    } catch (err) {
      setOutput('');
      if (mode === 'decode') {
        setError('Invalid Base64 string. Please check the character set and padding.');
      } else {
        setError('Encoding failed. Ensure valid text input.');
      }
    }
  }, [input, mode]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2050);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mode === 'encode' ? 'encoded_base64.txt' : 'decoded_text.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInput(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Mode selectors */}
      <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <button
          onClick={() => {
            setMode('encode');
            handleClear();
            setInput('Hello, Toolique!');
          }}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
            mode === 'encode'
              ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Base64 Encode
        </button>
        <button
          onClick={() => {
            setMode('decode');
            handleClear();
            setInput('SGVsbG8sIFRvb2xTdGFjayBJbmRpYSE=');
          }}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
            mode === 'decode'
              ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Base64 Decode
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Input Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 flex flex-col">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {mode === 'encode' ? 'Source Text' : 'Base64 Encoded Text'}
            </span>
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-450 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 cursor-pointer flex items-center gap-1.5 transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".txt,.json,.xml,.csv,.html,.js,.ts"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleClear}
                className="text-xs font-semibold text-slate-450 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 transition"
                title="Clear"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Type or paste plain text here...' : 'Paste Base64 encoded string here...'}
            className="w-full min-h-[300px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm font-mono text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none resize-y"
          />
          <div className="text-right text-[11px] font-semibold text-slate-400">
            {input.length.toLocaleString()} characters
          </div>
        </div>

        {/* Right Output Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4 flex flex-col h-full">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {mode === 'encode' ? 'Base64 Encoded Result' : 'Decoded Plain Text'}
              </span>
              {output && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition"
                    title="Download as File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white shadow-sm transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {error ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold leading-relaxed">
                {error}
              </div>
            ) : (
              <textarea
                readOnly
                value={output}
                placeholder="Result will appear here..."
                className="w-full flex-grow min-h-[300px] p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-sm font-mono text-slate-700 dark:text-slate-200 focus:outline-none resize-y"
              />
            )}
          </div>

          <div className="text-right text-[11px] font-semibold text-slate-400 pt-2">
            {output.length.toLocaleString()} characters
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-zinc-800 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mt-0.5">
          <Binary className="w-4.5 h-4.5" />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <h4 className="font-bold text-slate-800 dark:text-white mb-0.5">Under the hood</h4>
          <p>
            Base64 encoding schemes are commonly used when there is a need to encode binary data that needs to be stored and transferred over media that are designed to deal with textual data. Our implementation encodes and decodes strings using standard Base64 format securely inside your web browser.
          </p>
        </div>
      </div>
    </div>
  );
}

