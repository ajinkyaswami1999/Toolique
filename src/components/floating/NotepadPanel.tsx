import { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  FileText, 
  Sparkles,
  Type
} from 'lucide-react';
import { getNoteFromDB, saveNoteToDB } from '../../utils/indexedDB';

interface NotepadPanelProps {
  onClose: () => void;
}

export default function NotepadPanel({ onClose }: NotepadPanelProps) {
  const [note, setNote] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [copied, setCopied] = useState<boolean>(false);
  const [isMono, setIsMono] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load note from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    getNoteFromDB('scratchpad').then((savedNote) => {
      if (isMounted) {
        if (savedNote !== null) {
          setNote(savedNote);
        }
        setIsLoaded(true);
      }
    });

    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // Auto-save with debouncing to IndexedDB
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextText = e.target.value;
    setNote(nextText);
    setSaveStatus('saving');

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      await saveNoteToDB('scratchpad', nextText);
      setSaveStatus('saved');
    }, 350);
  };

  // Keyboard shortcut to close (Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showClearConfirm) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showClearConfirm]);

  // Copy notes to clipboard
  const handleCopy = () => {
    if (!note) return;
    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Download notes as .txt file
  const handleDownload = () => {
    if (!note) return;
    const blob = new Blob([note], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `toolique-notes-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Clear notes
  const handleClear = async () => {
    setNote('');
    setShowClearConfirm(false);
    await saveNoteToDB('scratchpad', '');
    setSaveStatus('saved');
  };

  // Metrics
  const charCount = note.length;
  const wordCount = note.trim() ? note.trim().split(/\s+/).length : 0;
  const lineCount = note ? note.split('\n').length : 0;

  return (
    <div 
      className="toolique-notepad-panel fixed bottom-24 right-6 sm:right-8 z-[100] w-[340px] sm:w-[420px] md:w-[460px] h-[480px] max-h-[78vh] rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-indigo-500/10 dark:shadow-black/50 flex flex-col overflow-hidden text-left animate-fadeIn scale-100 origin-bottom-right transition-all"
      role="dialog"
      aria-label="Quick Notepad"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white leading-none">
                Scratchpad
              </h3>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{saveStatus === 'saving' ? 'Saving...' : 'Saved to IndexedDB'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMono(!isMono)}
            title={isMono ? 'Switch to Proportional font' : 'Switch to Monospace font'}
            className={`p-1.5 rounded-lg transition ${isMono ? 'bg-indigo-500/10 text-indigo-600' : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <Type className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!note}
            title="Copy notes"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!note}
            title="Download as .txt"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={!note}
            title="Clear notes"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            title="Close (Esc)"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clear Confirmation Prompt */}
      {showClearConfirm && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/40 flex items-center justify-between text-xs animate-fadeIn shrink-0">
          <span className="font-bold text-rose-700 dark:text-rose-300">
            Clear all notes?
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] transition"
            >
              Yes, Clear
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg font-bold text-[10px] transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Text Area */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col bg-transparent">
        <textarea
          ref={textareaRef}
          value={note}
          onChange={handleTextChange}
          placeholder="Type or paste your calculations, notes, JSON payloads, or test snippets here... Automatically saved in your browser."
          disabled={!isLoaded}
          className={`w-full h-full resize-none p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 placeholder:text-zinc-400 ${
            isMono ? 'font-mono' : 'font-sans'
          }`}
          spellCheck={false}
        />
      </div>

      {/* Footer Metrics */}
      <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between text-[10px] font-bold text-zinc-400 shrink-0">
        <div className="flex items-center gap-3">
          <span>{charCount} characters</span>
          <span>•</span>
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{lineCount} lines</span>
        </div>
        <span className="font-mono text-zinc-400 dark:text-zinc-500">Auto-saved</span>
      </div>
    </div>
  );
}
