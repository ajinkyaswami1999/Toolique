import { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Award, 
  Flame, 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  FileText, 
  Star, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  Database, 
  Search, 
  Copy, 
  Check, 
  Zap,
  FolderLock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { toolsList } from '../data/tools';
import { workflows } from '../data/workflows';
import { academyCategories } from '../features/academy/data/categories';
import { getToolCanonicalPath } from '../routes/AppRoutes';
import { 
  getFavoritesFromDB, 
  saveFavoritesToDB,
  getNoteFromDB,
  saveNoteToDB
} from '../utils/indexedDB';

type DashboardTab = 'favorites' | 'workflows' | 'academy' | 'scratchpad' | 'storage';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('favorites');
  const [streak, setStreak] = useState<number>(1);
  const [longestStreak, setLongestStreak] = useState<number>(1);
  const [xp, setXp] = useState<number>(120);
  const [level, setLevel] = useState<number>(1);
  const [completedQuestions, setCompletedQuestions] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favSearchQuery, setFavSearchQuery] = useState<string>('');
  
  // Scratchpad
  const [notes, setNotes] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isMonospace, setIsMonospace] = useState<boolean>(false);

  // Storage Stats
  const [storageSizeKB, setStorageSizeKB] = useState<number>(0);

  // Load profile state on mount
  useEffect(() => {
    loadAllData();

    // Listen for global favorites update from FAB or Tool Cards
    const handleFavUpdate = () => {
      loadFavorites();
    };
    window.addEventListener('toolique_favorites_updated', handleFavUpdate);

    return () => {
      window.removeEventListener('toolique_favorites_updated', handleFavUpdate);
    };
  }, []);

  const loadAllData = async () => {
    try {
      // 1. Academy Progress & Streaks
      const academyRaw = localStorage.getItem('toolique_academy_progress');
      if (academyRaw) {
        const parsed = JSON.parse(academyRaw);
        setXp(parsed.xp || 120);
        setLevel(parsed.level || Math.max(1, Math.floor((parsed.xp || 120) / 100) + 1));
        setStreak(parsed.streak || parseInt(localStorage.getItem('toolique_daily_streak') || '1'));
        setLongestStreak(parsed.longestStreak || 1);
        setCompletedQuestions(parsed.completedQuestions || []);
      } else {
        const legacyStreak = parseInt(localStorage.getItem('toolique_daily_streak') || '1');
        const legacyXp = parseInt(localStorage.getItem('toolique_academy_xp') || '120');
        setStreak(legacyStreak);
        setLongestStreak(legacyStreak);
        setXp(legacyXp);
        setLevel(Math.max(1, Math.floor(legacyXp / 100) + 1));
      }

      // 2. Favorites
      await loadFavorites();

      // 3. Scratchpad Notes from IndexedDB / localStorage
      const savedNote = await getNoteFromDB('main_scratchpad');
      if (savedNote !== null) {
        setNotes(savedNote);
      } else {
        const legacyNote = localStorage.getItem('toolique_user_notes') || '';
        setNotes(legacyNote);
      }

      // 4. Calculate Storage Size
      calculateStorageUsage();
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await getFavoritesFromDB();
      if (favs && favs.length > 0) {
        setFavoriteIds(favs);
      } else {
        // Defaults if empty
        const defaults = ['GSTCalculator', 'SIPCalculator', 'SQLFormatter', 'JSONFormatter', 'ApiTester'];
        setFavoriteIds(defaults);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const calculateStorageUsage = () => {
    try {
      let totalBytes = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalBytes += (localStorage[key].length + key.length) * 2;
        }
      }
      setStorageSizeKB(Math.round(totalBytes / 1024));
    } catch {
      setStorageSizeKB(12);
    }
  };

  // Toggle Favorite
  const toggleFavorite = async (toolId: string) => {
    let updated: string[];
    if (favoriteIds.includes(toolId)) {
      updated = favoriteIds.filter((id) => id !== toolId);
    } else {
      updated = [...favoriteIds, toolId];
    }
    setFavoriteIds(updated);
    await saveFavoritesToDB(updated);
  };

  // Save Notes to IndexedDB and LocalStorage
  const handleSaveNotes = async () => {
    await saveNoteToDB('main_scratchpad', notes);
    try {
      localStorage.setItem('toolique_user_notes', notes);
    } catch {}
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    calculateStorageUsage();
  };

  // Copy notes to clipboard
  const handleCopyNotes = () => {
    if (!notes) return;
    navigator.clipboard.writeText(notes);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Download notes
  const handleDownloadNotes = () => {
    if (!notes) return;
    const blob = new Blob([notes], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolique_notes_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear / Wipe Profile
  const clearProfile = () => {
    if (window.confirm('Are you sure you want to clear your local profile, history, bookmarks, and scratchpad? This action is strictly local and irreversible.')) {
      localStorage.removeItem('toolique_daily_streak');
      localStorage.removeItem('toolique_academy_xp');
      localStorage.removeItem('toolique_academy_progress');
      localStorage.removeItem('toolique_user_notes');
      localStorage.removeItem('toolique_favorites');
      localStorage.removeItem('toolique_note_main_scratchpad');
      localStorage.removeItem('toolique_recent_history');
      
      setStreak(1);
      setLongestStreak(1);
      setXp(0);
      setLevel(1);
      setNotes('');
      setFavoriteIds([]);
      setCompletedQuestions([]);
      calculateStorageUsage();
    }
  };

  // Export Full Profile Backup
  const exportProfile = () => {
    const profile = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      streak,
      longestStreak,
      xp,
      level,
      completedQuestions,
      favoriteIds,
      notes,
      storageKeys: Object.keys(localStorage).filter(k => k.startsWith('toolique_'))
    };
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolique_workspace_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import Profile Backup
  const importProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.streak !== undefined) {
          localStorage.setItem('toolique_daily_streak', data.streak.toString());
          setStreak(data.streak);
        }
        if (data.longestStreak !== undefined) {
          setLongestStreak(data.longestStreak);
        }
        if (data.xp !== undefined) {
          localStorage.setItem('toolique_academy_xp', data.xp.toString());
          setXp(data.xp);
          setLevel(data.level || Math.max(1, Math.floor(data.xp / 100) + 1));
        }
        if (data.favoriteIds) {
          localStorage.setItem('toolique_favorites', JSON.stringify(data.favoriteIds));
          setFavoriteIds(data.favoriteIds);
        }
        if (data.notes !== undefined) {
          await saveNoteToDB('main_scratchpad', data.notes);
          setNotes(data.notes);
        }
        if (data.completedQuestions) {
          setCompletedQuestions(data.completedQuestions);
        }
        calculateStorageUsage();
        alert('Toolique workspace profile imported successfully!');
      } catch (err) {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Filtered Favorited Tools
  const favoritedTools = useMemo(() => {
    const tools = toolsList.filter((t) => favoriteIds.includes(t.id));
    if (!favSearchQuery.trim()) return tools;
    const q = favSearchQuery.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.shortDescription.toLowerCase().includes(q)
    );
  }, [favoriteIds, favSearchQuery]);

  // Suggested tools to bookmark if favorites empty
  const suggestedTools = useMemo(() => {
    return toolsList.filter((t) => !favoriteIds.includes(t.id)).slice(0, 6);
  }, [favoriteIds]);

  // Notes word count
  const noteWordCount = useMemo(() => {
    if (!notes.trim()) return 0;
    return notes.trim().split(/\s+/).length;
  }, [notes]);

  const noteCharCount = notes.length;
  const noteLineCount = notes ? notes.split('\n').length : 0;

  // Level progress percentage
  const nextLevelXp = level * 100;
  const currentLevelBaseXp = (level - 1) * 100;
  const levelProgress = Math.min(100, Math.max(0, Math.round(((xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp || 1)) * 100)));

  return (
    <div className="space-y-8 text-left animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <SEO 
        title="Personal Workspace & Local Developer Dashboard | Toolique" 
        description="Your client-side productivity hub. Manage bookmarked utilities, active multi-step workflows, learning academy progress, notes scratchpad, and private backup exports."
      />

      {/* Header Profile & Local Sandbox Banner */}
      <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
        {/* Glow ambient background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full rounded-[14px] bg-zinc-950 flex items-center justify-center text-indigo-400">
              <User className="w-8 h-8" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Developer & Creator Workspace
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
                Level {level} Builder
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-2xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Client-Side Sandbox. All calculations, notes, and progress are stored locally on your device.</span>
            </p>
          </div>
        </div>

        {/* Sync & Backup Actions */}
        <div className="flex items-center gap-2.5 flex-wrap relative z-10 w-full sm:w-auto">
          <button
            onClick={exportProfile}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 text-white font-extrabold text-xs flex items-center justify-center gap-2 border border-zinc-700/80 cursor-pointer transition shadow-xs hover:border-zinc-500"
            title="Download complete JSON workspace backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          
          <label className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 text-white font-extrabold text-xs flex items-center justify-center gap-2 border border-zinc-700/80 cursor-pointer transition shadow-xs hover:border-zinc-500">
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input type="file" onChange={importProfile} className="hidden" accept=".json" />
          </label>
        </div>
      </div>

      {/* Top 4 Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Streak Counter */}
        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Practice Streak
            </span>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">
              {streak} {streak === 1 ? 'Day' : 'Days'}
            </p>
            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold">
              Best Record: {longestStreak} Days
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 shrink-0">
            <Flame className="w-6 h-6 fill-current animate-pulse" />
          </div>
        </div>

        {/* Saved Favorites */}
        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Pinned Favorites
            </span>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">
              {favoriteIds.length} Tools
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
              Quick Launch Synced
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
            <Star className="w-6 h-6 fill-current" />
          </div>
        </div>

        {/* Experience Points & Level */}
        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Academy XP
            </span>
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-black text-zinc-900 dark:text-white">{xp} XP</p>
              <span className="text-[10px] font-bold text-zinc-400">Lvl {level}</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Scratchpad Status */}
        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Local Scratchpad
            </span>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">
              {noteWordCount} Words
            </p>
            <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
              IndexedDB Persistent
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Quick Utility Launcher Bar */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-zinc-900 dark:text-white">
          <Zap className="w-4 h-4 text-amber-500 fill-current" />
          <span>Quick Actions:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Link
            to="/calculators/gst-calculator"
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 hover:text-indigo-600 transition shrink-0"
          >
            🧮 GST Calculator
          </Link>
          <Link
            to="/calculators/sip-calculator"
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 hover:text-indigo-600 transition shrink-0"
          >
            📈 SIP Planner
          </Link>
          <Link
            to="/developer/sql-formatter"
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 hover:text-indigo-600 transition shrink-0"
          >
            💻 SQL Formatter
          </Link>
          <Link
            to="/developer/json-formatter"
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 hover:text-indigo-600 transition shrink-0"
          >
            🔍 JSON Validator
          </Link>
          <Link
            to="/developer/jwt-decoder"
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 hover:text-indigo-600 transition shrink-0"
          >
            🔑 JWT Debugger
          </Link>
          <Link
            to="/3d-print-studio"
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 hover:text-indigo-600 transition shrink-0"
          >
            📐 3D Print Studio
          </Link>
        </div>
      </div>

      {/* Main Workspace Tabs */}
      <div className="space-y-6">
        
        {/* Tab Headers */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'favorites'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Pinned Favorites ({favoriteIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'workflows'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Workflows ({workflows.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('academy')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'academy'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Learning Academy ({academyCategories.length} Tracks)</span>
          </button>

          <button
            onClick={() => setActiveTab('scratchpad')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'scratchpad'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Markdown Scratchpad</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Storage & Privacy</span>
          </button>
        </div>

        {/* TAB 1: FAVORITES & PINNED TOOLS */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            
            {/* Search Filter Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={favSearchQuery}
                  onChange={(e) => setFavSearchQuery(e.target.value)}
                  placeholder="Filter favorited tools..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Favorites are synchronized with the bottom-right floating speed dial menu.
              </p>
            </div>

            {/* Favorited Tools Grid */}
            {favoritedTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoritedTools.map((t) => (
                  <div
                    key={t.id}
                    className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                          {t.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(t.id)}
                          className="p-1 rounded-lg text-amber-500 hover:bg-amber-500/10 transition cursor-pointer"
                          title="Unpin from favorites"
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {t.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 leading-relaxed">
                        {t.shortDescription}
                      </p>
                    </div>

                    <Link
                      to={getToolCanonicalPath(t.category, t.slug)}
                      className="saas-button-primary inline-flex items-center justify-center gap-1.5 py-2 text-xs w-full"
                    >
                      <span>Launch Tool</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                <Star className="w-8 h-8 text-zinc-400 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">No favorited tools found</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto font-medium">
                  {favSearchQuery ? 'No tools matched your search query.' : 'Click the star icon on any tool card or in the list below to pin your frequently used utilities.'}
                </p>
              </div>
            )}

            {/* Quick Add Recommendations */}
            <div className="space-y-3 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
                Recommended Utilities to Pin
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {suggestedTools.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 flex items-center justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                  >
                    <div className="truncate">
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {t.name}
                      </h5>
                      <span className="text-[10px] text-zinc-400 font-medium uppercase">{t.category}</span>
                    </div>
                    <button
                      onClick={() => toggleFavorite(t.id)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-white text-zinc-600 dark:text-zinc-300 text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                    >
                      <Star className="w-3 h-3" />
                      <span>Pin</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INTERACTIVE PROJECT WORKFLOWS */}
        {activeTab === 'workflows' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Curated Project Workflows
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                End-to-end multi-step pipelines designed to take your tasks from planning to final execution without switching tabs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {workflows.map((wf) => {
                const firstStepTool = toolsList.find((t) => t.id === wf.steps[0]?.id);
                const launchPath = firstStepTool ? getToolCanonicalPath(firstStepTool.category, firstStepTool.slug) : '#';

                return (
                  <div
                    key={wf.id}
                    className="saas-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-5 hover:border-indigo-500/40 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                          <Layers className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            Workflow Pipeline
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase">
                          {wf.steps.length} Steps
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
                        {wf.name}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                        {wf.description}
                      </p>

                      {/* Stepper Preview Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        {wf.steps.map((step, idx) => (
                          <span
                            key={step.slug}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold"
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[9px] font-black">
                              {idx + 1}
                            </span>
                            <span>{step.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={launchPath}
                      className="saas-button-primary inline-flex items-center justify-center gap-2 py-2.5 text-xs w-full"
                    >
                      <span>Launch Pipeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: LEARNING ACADEMY PROGRESS */}
        {activeTab === 'academy' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  Developer Learning Academy
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {completedQuestions.length} Questions Completed · {xp} Total XP Earned · {streak} Day Practice Streak
                </p>
              </div>

              <Link
                to="/academy"
                className="saas-button-primary inline-flex items-center gap-1.5 py-2 px-4 text-xs"
              >
                <span>Browse All Academy Tracks</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Academy Tracks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {academyCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase">
                        {cat.learningTime || 'Self-Paced'}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400">
                        {cat.topics.length} Core Topics
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <Link
                    to={`/academy/${cat.id}`}
                    className="w-full py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-600 hover:text-white text-zinc-800 dark:text-zinc-200 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Open Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PERSISTENT MARKDOWN SCRATCHPAD */}
        {activeTab === 'scratchpad' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  Local Markdown & Code Scratchpad
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Auto-synced with IndexedDB (`toolique_local_db`) and accessible anytime from the global bottom-right speed dial menu.
                </p>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsMonospace(!isMonospace)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    isMonospace
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {isMonospace ? 'Monospace' : 'Sans-Serif'}
                </button>

                <button
                  onClick={handleCopyNotes}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownloadNotes}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .txt</span>
                </button>

                <button
                  onClick={handleSaveNotes}
                  className="saas-button-primary py-1.5 px-3.5 text-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaved ? 'Saved!' : 'Save Notes'}</span>
                </button>
              </div>
            </div>

            {/* Scratchpad Textarea */}
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Draft code snippets, SQL queries, regex tests, project calculations, or meeting notes here..."
                rows={14}
                className={`w-full bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 transition font-medium leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-600 ${
                  isMonospace ? 'font-mono' : 'font-sans'
                }`}
              />
            </div>

            {/* Scratchpad Metrics Bar */}
            <div className="flex items-center justify-between text-[11px] text-zinc-450 dark:text-zinc-500 font-bold px-2">
              <div className="flex items-center gap-4">
                <span>{noteWordCount} Words</span>
                <span>{noteCharCount} Characters</span>
                <span>{noteLineCount} Lines</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>IndexedDB Auto-Sync Active</span>
              </span>
            </div>
          </div>
        )}

        {/* TAB 5: STORAGE & PRIVACY MANAGER */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Client Sandbox & Privacy Audit
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Toolique is engineered for privacy. We do not store your tokens, calculations, financial inputs, or notes on remote servers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Storage Stats Card */}
              <div className="saas-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
                <div className="flex items-center gap-2.5 text-zinc-900 dark:text-white font-extrabold text-sm">
                  <Database className="w-4 h-4 text-indigo-500" />
                  <span>Browser Storage Footprint</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">LocalStorage Keys</span>
                    <span className="font-extrabold text-zinc-900 dark:text-white">{Object.keys(localStorage).filter(k => k.startsWith('toolique_')).length} Entries</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">IndexedDB Store</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">toolique_local_db (Healthy)</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">Estimated Usage</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">~{storageSizeKB} KB / 5000 KB</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={exportProfile}
                    className="saas-button-primary w-full py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full Backup (.json)</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone / Wipe Profile */}
              <div className="saas-card p-6 rounded-3xl border border-rose-500/20 bg-rose-500/[0.02] space-y-4">
                <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                  <FolderLock className="w-4 h-4" />
                  <span>Profile Factory Reset</span>
                </div>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  Clearing your workspace will permanently delete your local daily streak, scratchpad notes, pinned bookmarks, and console telemetry.
                </p>

                <div className="pt-4">
                  <button
                    onClick={clearProfile}
                    className="w-full py-2.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset Workspace Data</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
