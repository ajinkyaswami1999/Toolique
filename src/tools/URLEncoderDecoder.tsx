import { useState, useMemo } from 'react';
import { Link, Copy, Check, Trash2 } from 'lucide-react';

export default function URLEncoderDecoder() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState<string>('https://Toolique/search?q=GST calculator & tools!');
  const [type, setType] = useState<'component' | 'uri'>('component');
  const [copied, setCopied] = useState<boolean>(false);

  // Derived output and error
  const { output, error } = useMemo(() => {
    if (!input) {
      return { output: '', error: null };
    }

    try {
      if (mode === 'encode') {
        const val = type === 'component' ? encodeURIComponent(input) : encodeURI(input);
        return { output: val, error: null };
      } else {
        const val = type === 'component' ? decodeURIComponent(input) : decodeURI(input);
        return { output: val, error: null };
      }
    } catch {
      return {
        output: '',
        error: 'Decoding failed. Please ensure the input is a valid URL-encoded string (e.g. correct percentage escapes like %20).'
      };
    }
  }, [input, mode, type]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Mode selection tabs */}
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode('encode');
              handleClear();
              setInput('https://Toolique/search?q=GST calculator & tools!');
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              mode === 'encode'
                ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            URL Encode
          </button>
          <button
            onClick={() => {
              setMode('decode');
              handleClear();
              setInput('https%3A%2F%2FToolique%2Fsearch%3Fq%3DGST%20calculator%20%26%20tools%21');
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
              mode === 'decode'
                ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            URL Decode
          </button>
        </div>

        {/* Options */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400">Mode:</label>
          <div className="flex rounded-xl bg-slate-50 dark:bg-slate-950/40 p-1 border border-slate-200/80 dark:border-slate-800/80">
            <button
              onClick={() => setType('component')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                type === 'component'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
              title="Encodes/Decodes characters like ?, =, & and :"
            >
              Component
            </button>
            <button
              onClick={() => setType('uri')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                type === 'uri'
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
              title="Keeps main URL structure intact (keeps ?, =, &)"
            >
              Full URL
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Input Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 flex flex-col">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Source String
            </span>
            <button
              onClick={handleClear}
              className="text-xs font-semibold text-slate-450 hover:text-rose-500 dark:text-slate-450 dark:hover:text-rose-400 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? 'Type or paste plain text/URL here...' : 'Paste URL-encoded string here...'}
            className="w-full min-h-[280px] p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm font-mono text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none resize-none"
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
                Result
              </span>
              {output && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-650 hover:bg-teal-700 text-xs font-bold text-white shadow-sm transition"
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
              )}
            </div>

            {error ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/60 text-rose-600 dark:text-rose-455 text-xs font-semibold leading-relaxed">
                {error}
              </div>
            ) : (
              <textarea
                readOnly
                value={output}
                placeholder="Output will appear here..."
                className="w-full flex-grow min-h-[280px] p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-sm font-mono text-slate-700 dark:text-slate-200 focus:outline-none resize-none break-all"
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
          <Link className="w-4.5 h-4.5" />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <h4 className="font-bold text-slate-800 dark:text-white mb-0.5">URL Encoding Information</h4>
          <p>
            URL encoding (percent-encoding) converts characters into a format that can be transmitted securely over the internet. Standard URLs can only contain ASCII characters. Non-ASCII or reserved characters (like spaces, & or ?) are replaced with a percent sign (%) followed by two hex digits.
          </p>
        </div>
      </div>
    </div>
  );
}

