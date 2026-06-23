import { useState } from 'react';
import { FileText, Copy, Trash2, Clock, Sparkles } from 'lucide-react';

export default function WordCounter() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  // Calculations
  const cleanText = text.trim();
  const wordCount = cleanText === '' ? 0 : cleanText.split(/\s+/).length;
  const charCountWithSpaces = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;
  const sentenceCount = cleanText === '' ? 0 : cleanText.split(/[.!?]+/).filter(Boolean).length;
  const paragraphCount = cleanText === '' ? 0 : text.split(/\n+/).filter(Boolean).length;

  // Average speeds
  const readingTime = Math.ceil(wordCount / 225); // 225 wpm average
  const speakingTime = Math.ceil(wordCount / 130); // 130 wpm average

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCaseChange = (type: 'upper' | 'lower' | 'title' | 'sentence') => {
    if (!text) return;
    let newText = text;
    if (type === 'upper') {
      newText = text.toUpperCase();
    } else if (type === 'lower') {
      newText = text.toLowerCase();
    } else if (type === 'title') {
      newText = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    } else if (type === 'sentence') {
      newText = text.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, (m) => m.toUpperCase());
    }
    setText(newText);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Input Area */}
      <div className="lg:col-span-2 space-y-4 text-left">
        <div className="saas-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-350 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Input Text</span>
            </label>
            <div className="flex items-center gap-2">
              {copied && <span className="text-xs text-emerald-500 font-bold mr-1">Copied!</span>}
              <button
                onClick={handleCopy}
                disabled={!text}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:text-indigo-500 disabled:opacity-50 transition"
                title="Copy Text"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => setText('')}
                disabled={!text}
                className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:text-red-500 disabled:opacity-50 transition"
                title="Clear Text"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type, paste, or write your text here..."
            className="w-full h-80 saas-input font-mono text-sm leading-relaxed p-4"
          />

          <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <button
              onClick={() => handleCaseChange('upper')}
              disabled={!text}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-indigo-500/10 text-zinc-650 dark:text-zinc-300 dark:hover:text-indigo-400 text-xs font-bold transition disabled:opacity-50"
            >
              UPPERCASE
            </button>
            <button
              onClick={() => handleCaseChange('lower')}
              disabled={!text}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-indigo-500/10 text-zinc-650 dark:text-zinc-300 dark:hover:text-indigo-400 text-xs font-bold transition disabled:opacity-50"
            >
              lowercase
            </button>
            <button
              onClick={() => handleCaseChange('title')}
              disabled={!text}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-indigo-500/10 text-zinc-650 dark:text-zinc-300 dark:hover:text-indigo-400 text-xs font-bold transition disabled:opacity-50"
            >
              Title Case
            </button>
            <button
              onClick={() => handleCaseChange('sentence')}
              disabled={!text}
              className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-indigo-500/10 text-zinc-650 dark:text-zinc-300 dark:hover:text-indigo-400 text-xs font-bold transition disabled:opacity-50"
            >
              Sentence Case
            </button>
          </div>
        </div>
      </div>

      {/* Stats Sidebar */}
      <div className="space-y-6 text-left">
        <div className="saas-card p-6 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Text Statistics</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">Words</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{wordCount}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">Characters</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{charCountWithSpaces}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">No Spaces</span>
              <p className="text-lg font-extrabold text-zinc-800 dark:text-zinc-200 mt-1">{charCountNoSpaces}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">Sentences</span>
              <p className="text-lg font-extrabold text-zinc-800 dark:text-zinc-200 mt-1">{sentenceCount}</p>
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Paragraphs</span>
            <span className="text-base font-black text-zinc-850 dark:text-zinc-100">{paragraphCount}</span>
          </div>

          {/* Time Estimators */}
          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-850">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Estimates</span>
            </h4>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-650 dark:text-zinc-350">
                <span>Reading Time</span>
                <span className="text-zinc-900 dark:text-white bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded text-[10px]">
                  ~{readingTime} {readingTime === 1 ? 'min' : 'mins'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-650 dark:text-zinc-350">
                <span>Speaking Time</span>
                <span className="text-zinc-900 dark:text-white bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px]">
                  ~{speakingTime} {speakingTime === 1 ? 'min' : 'mins'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
