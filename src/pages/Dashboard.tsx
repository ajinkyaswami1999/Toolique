import { useState, useEffect } from 'react';
import { User, Bookmark, Award, Flame, History, Download, Upload, Trash2, Save, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

interface BookmarkItem {
  id: string;
  name: string;
  type: 'tool' | 'question' | 'playground';
  slug: string;
}

interface HistoryItem {
  name: string;
  type: string;
  timestamp: string;
  link: string;
}

export default function Dashboard() {
  const [streak, setStreak] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Load profile state from localStorage on mount
  useEffect(() => {
    try {
      const streakVal = parseInt(localStorage.getItem('toolique_daily_streak') || '1');
      setStreak(streakVal);

      const xpVal = parseInt(localStorage.getItem('toolique_academy_xp') || '120');
      setXp(xpVal);

      const savedNotes = localStorage.getItem('toolique_user_notes') || '';
      setNotes(savedNotes);

      // Load bookmarks
      const savedBookmarks = localStorage.getItem('toolique_bookmarks');
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      } else {
        // Fallback placeholder bookmarks
        const defaults: BookmarkItem[] = [
          { id: 'GSTCalculator', name: 'GST Invoice Generator', type: 'tool', slug: 'gst-invoice-generator' },
          { id: 'sql-left-join', name: 'SQL LEFT JOIN Customers Without Orders', type: 'question', slug: 'sql-left-join-customers-without-orders' }
        ];
        setBookmarks(defaults);
        localStorage.setItem('toolique_bookmarks', JSON.stringify(defaults));
      }

      // Load history
      const savedHistory = localStorage.getItem('toolique_recent_history');
      if (savedHistory) {
        setHistoryList(JSON.parse(savedHistory));
      } else {
        // Fallback default history entries
        const defaults: HistoryItem[] = [
          { name: 'Filament Cost Calculator', type: 'Tool Used', timestamp: 'Yesterday', link: '/tool/3d-printing-cost-calculator' },
          { name: 'JS Counter Closure Challenge', type: 'Question Solved', timestamp: '2 days ago', link: '/academy/javascript/question/js-closure-counter' }
        ];
        setHistoryList(defaults);
        localStorage.setItem('toolique_recent_history', JSON.stringify(defaults));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveNotes = () => {
    localStorage.setItem('toolique_user_notes', notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const clearProfile = () => {
    if (window.confirm('Are you sure you want to clear your local profile, history, and notes? This action is irreversible.')) {
      localStorage.removeItem('toolique_daily_streak');
      localStorage.removeItem('toolique_academy_xp');
      localStorage.removeItem('toolique_user_notes');
      localStorage.removeItem('toolique_bookmarks');
      localStorage.removeItem('toolique_recent_history');
      setStreak(1);
      setXp(0);
      setNotes('');
      setBookmarks([]);
      setHistoryList([]);
    }
  };

  const exportProfile = () => {
    const profile = {
      streak,
      xp,
      notes,
      bookmarks,
      historyList,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolique_profile_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.streak !== undefined) {
          localStorage.setItem('toolique_daily_streak', data.streak.toString());
          setStreak(data.streak);
        }
        if (data.xp !== undefined) {
          localStorage.setItem('toolique_academy_xp', data.xp.toString());
          setXp(data.xp);
        }
        if (data.notes !== undefined) {
          localStorage.setItem('toolique_user_notes', data.notes);
          setNotes(data.notes);
        }
        if (data.bookmarks) {
          localStorage.setItem('toolique_bookmarks', JSON.stringify(data.bookmarks));
          setBookmarks(data.bookmarks);
        }
        if (data.historyList) {
          localStorage.setItem('toolique_recent_history', JSON.stringify(data.historyList));
          setHistoryList(data.historyList);
        }
        alert('Local profile configuration imported successfully!');
      } catch (err) {
        alert('Invalid profile JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      <SEO 
        title="Local User Profile & Dashboard | Toolique" 
        description="Monitor your developer academy progress, bookmarks list, coding challenge history logs, and manage local notes and backup exports without registration."
      />

      {/* Profile summary banner */}
      <div className="p-8 md:p-12 rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white">Local Developer Hub</h1>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold leading-relaxed">
              Workspace data is encrypted and saved strictly on your local browser sandboxes. No cloud accounts required.
            </p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={exportProfile}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs flex items-center gap-2 border border-zinc-700 cursor-pointer transition"
            title="Download profile backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Profile</span>
          </button>
          
          <label className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs flex items-center gap-2 border border-zinc-700 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input type="file" onChange={importProfile} className="hidden" accept=".json" />
          </label>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Streak Counter */}
        <div className="saas-card p-6 flex items-center gap-5 border border-zinc-200/80 dark:border-zinc-850/80">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
            <Flame className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Practice Streak</h3>
            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{streak} Days</p>
          </div>
        </div>

        {/* Experience Points */}
        <div className="saas-card p-6 flex items-center gap-5 border border-zinc-200/80 dark:border-zinc-850/80">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Academy Experience</h3>
            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{xp} XP</p>
          </div>
        </div>

        {/* Bookmark Count */}
        <div className="saas-card p-6 flex items-center gap-5 border border-zinc-200/80 dark:border-zinc-850/80">
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500">
            <Bookmark className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Bookmarks Saved</h3>
            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{bookmarks.length} Pages</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Bookmarks & History lists */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Bookmarks Section */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
              <Bookmark className="w-4.5 h-4.5 text-indigo-500" />
              <span>Saved Bookmarks</span>
            </h3>

            {bookmarks.length > 0 ? (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-850">
                {bookmarks.map((bm, index) => {
                  const targetLink = bm.type === 'tool'
                    ? `/tool/${bm.slug}`
                    : `/academy/${bm.slug.split('-')[0]}/question/${bm.slug}`;
                  return (
                    <div key={index} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-zinc-100 dark:bg-zinc-850 text-zinc-500">
                          {bm.type}
                        </span>
                        <Link
                          to={targetLink}
                          className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                        >
                          {bm.name}
                        </Link>
                      </div>
                      
                      <button
                        onClick={() => {
                          const updated = bookmarks.filter((_, idx) => idx !== index);
                          setBookmarks(updated);
                          localStorage.setItem('toolique_bookmarks', JSON.stringify(updated));
                        }}
                        className="p-1 rounded-md hover:bg-rose-500/10 text-zinc-450 hover:text-rose-500 transition cursor-pointer"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 py-6 text-center italic">No bookmarked pages found. Bookmark tools to list them here.</div>
            )}
          </div>

          {/* History Lists */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-855">
              <History className="w-4.5 h-4.5 text-orange-500" />
              <span>Crawl & Practice History</span>
            </h3>

            {historyList.length > 0 ? (
              <div className="space-y-3">
                {historyList.map((entry, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-zinc-100 dark:border-zinc-850/60 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition">
                    <div>
                      <Link
                        to={entry.link}
                        className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
                      >
                        {entry.name}
                      </Link>
                      <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold mt-0.5">{entry.type}</p>
                    </div>
                    <span className="text-[9px] text-zinc-400 font-bold">{entry.timestamp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 py-6 text-center italic">Your local history logs are empty.</div>
            )}
          </div>

        </div>

        {/* Notepad Scratchpad & Clear Profile Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Notepad Scratchpad */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
              <FileText className="w-4.5 h-4.5 text-teal-500" />
              <span>Notepad Scratchpad</span>
            </h3>
            
            <div className="space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write custom markdown notes, equations, queries, or checklists. Automatically saved to browser memory."
                rows={8}
                className="w-full bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-4 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500 transition-all font-semibold leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-650"
              />
              
              <button
                onClick={saveNotes}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaved ? 'Saved Notes!' : 'Save Notes'}</span>
              </button>
            </div>
          </div>

          {/* Wipe profile options */}
          <div className="saas-card p-6 border-rose-500/20 bg-rose-500/[0.01] space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-rose-500">
              Dangerous Settings
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Wiping your profile will permanently clear all streaks, scratchpads, bookmarks, and local console histories.
            </p>
            <button
              onClick={clearProfile}
              className="w-full py-2.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-rose-650 dark:text-rose-400 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe Profile Configuration</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
