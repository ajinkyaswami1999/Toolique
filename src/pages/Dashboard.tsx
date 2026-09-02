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
  ArrowRight, 
  ExternalLink, 
  ShieldCheck, 
  Database, 
  Search, 
  Copy, 
  Check, 
  Zap,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { toolsList } from '../data/tools';
import { workflows } from '../data/workflows';
import { academyCategories } from '../features/academy/data/categories';
import { getToolCanonicalPath } from '../routes/AppRoutes';
import LucideIcon from '../components/LucideIcon';
import { 
  getFavoritesFromDB, 
  saveFavoritesToDB,
  getNoteFromDB,
  saveNoteToDB,
  getRecentlyUsedToolsFromDB,
  clearRecentlyUsedToolsFromDB,
  formatRelativeTime
} from '../utils/indexedDB';
import type { RecentToolItem } from '../utils/indexedDB';

type DashboardTab = 'favorites' | 'recent' | 'workflows' | 'academy' | 'scratchpad' | 'storage';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('favorites');
  const [streak, setStreak] = useState<number>(1);
  const [longestStreak, setLongestStreak] = useState<number>(1);
  const [xp, setXp] = useState<number>(120);
  const [level, setLevel] = useState<number>(1);
  const [completedQuestions, setCompletedQuestions] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favSearchQuery, setFavSearchQuery] = useState<string>('');
  
  // Recently Used Tools
  const [recentTools, setRecentTools] = useState<RecentToolItem[]>([]);
  const [recentSearchQuery, setRecentSearchQuery] = useState<string>('');

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

    // Listen for recent tools updates
    const handleRecentUpdate = () => {
      loadRecentTools();
    };

    window.addEventListener('toolique_favorites_updated', handleFavUpdate);
    window.addEventListener('toolique_recent_updated', handleRecentUpdate);

    return () => {
      window.removeEventListener('toolique_favorites_updated', handleFavUpdate);
      window.removeEventListener('toolique_recent_updated', handleRecentUpdate);
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

      // 3. Recently Used Tools
      await loadRecentTools();

      // 4. Scratchpad Notes from IndexedDB / localStorage
      const savedNote = await getNoteFromDB('main_scratchpad');
      if (savedNote !== null) {
        setNotes(savedNote);
      } else {
        const legacyNote = localStorage.getItem('toolique_user_notes') || '';
        setNotes(legacyNote);
      }

      // 5. Calculate Storage Size
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
        const defaults = ['GSTCalculator', 'SIPCalculator', 'SQLFormatter', 'JSONFormatter', 'ApiTester'];
        setFavoriteIds(defaults);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadRecentTools = async () => {
    try {
      const recent = await getRecentlyUsedToolsFromDB();
      setRecentTools(recent);
    } catch (e) {
      console.error('Error loading recent tools:', e);
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

  // Clear Recent History
  const handleClearRecentHistory = async () => {
    if (window.confirm('Clear your recently used tools history?')) {
      await clearRecentlyUsedToolsFromDB();
      setRecentTools([]);
    }
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
      setRecentTools([]);
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
      recentTools,
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
          await saveFavoritesToDB(data.favoriteIds);
          setFavoriteIds(data.favoriteIds);
        }
        if (data.recentTools) {
          localStorage.setItem('toolique_recent_history', JSON.stringify(data.recentTools));
          setRecentTools(data.recentTools);
        }
        if (data.notes !== undefined) {
          await saveNoteToDB('main_scratchpad', data.notes);
          setNotes(data.notes);
        }
        if (data.completedQuestions) {
          setCompletedQuestions(data.completedQuestions);
          localStorage.setItem('toolique_academy_progress', JSON.stringify({
            xp: data.xp,
            level: data.level,
            streak: data.streak,
            longestStreak: data.longestStreak,
            completedQuestions: data.completedQuestions
          }));
        }
        calculateStorageUsage();
        alert('Workspace successfully restored from backup!');
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

  // Filtered Recently Used Tools
  const filteredRecentTools = useMemo(() => {
    if (!recentSearchQuery.trim()) return recentTools;
    const q = recentSearchQuery.toLowerCase();
    return recentTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.shortDescription && t.shortDescription.toLowerCase().includes(q))
    );
  }, [recentTools, recentSearchQuery]);

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
        description="Your client-side productivity hub. Manage bookmarked utilities, recently used tools, active multi-step workflows, learning academy progress, notes scratchpad, and private backup exports."
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
              <span>100% Client-Side Sandbox. All calculations, notes, history, and progress are stored locally on your device.</span>
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
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Practice Streak</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <span>{streak} Days</span>
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-bounce" />
            </div>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold">Best Record: {longestStreak} days</p>
          </div>
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
            <Flame className="w-6 h-6 fill-current" />
          </div>
        </div>

        {/* Pinned Favorites */}
        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Pinned Utilities</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">
              {favoriteIds.length} Tools
            </div>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold">Synced with speed dial FAB</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Star className="w-6 h-6 fill-current" />
          </div>
        </div>

        {/* Academy XP & Level */}
        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Academy Experience</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <span>{xp} XP</span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">Lv {level}</span>
            </div>
            <div className="w-28 bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div className="bg-indigo-600 h-full rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Scratchpad Status */}
        <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Scratchpad Notes</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white">
              {noteWordCount} Words
            </div>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold">{noteCharCount} characters • {noteLineCount} lines</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
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
        
        {/* Tab Headers: Favorites -> Recently Used -> Workflows -> Academy -> Scratchpad -> Storage */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
          
          {/* Tab 1: Favorites */}
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

          {/* Tab 2: Recently Used Tools (AFTER Favorites and BEFORE Workflows) */}
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition shrink-0 cursor-pointer ${
              activeTab === 'recent'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recently Used ({recentTools.length})</span>
          </button>

          {/* Tab 3: Interactive Workflows */}
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

          {/* Tab 4: Learning Academy */}
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

          {/* Tab 5: Scratchpad */}
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

          {/* Tab 6: Storage */}
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
                      className="saas-button-primary inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs w-full"
                    >
                      <span>Launch Tool</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="saas-card p-12 text-center rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
                <Star className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">No Pinned Favorites Yet</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Click the star icon on any tool to pin it here for rapid access.
                  </p>
                </div>
              </div>
            )}

            {/* Recommendations Row if few favorites */}
            {favoritedTools.length < 4 && (
              <div className="pt-6 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Recommended Utilities to Pin
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {suggestedTools.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-3"
                    >
                      <div className="truncate">
                        <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">{t.name}</div>
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold">{t.category}</div>
                      </div>
                      <button
                        onClick={() => toggleFavorite(t.id)}
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-amber-500 hover:text-amber-500 text-xs font-bold text-zinc-600 dark:text-zinc-400 transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Star className="w-3 h-3" />
                        <span>Pin</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RECENTLY USED TOOLS (NEW FEATURE) */}
        {activeTab === 'recent' && (
          <div className="space-y-6">
            
            {/* Filter & Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={recentSearchQuery}
                  onChange={(e) => setRecentSearchQuery(e.target.value)}
                  placeholder="Filter recently used tools..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Persisted locally in IndexedDB
                </span>
                {recentTools.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearRecentHistory}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear History</span>
                  </button>
                )}
              </div>
            </div>

            {/* Recently Used Tools Tabular View */}
            {filteredRecentTools.length > 0 ? (
              <div className="saas-card rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50/70 dark:bg-zinc-900/50 border-b border-zinc-200/80 dark:border-zinc-800/80 text-[10px] font-black uppercase tracking-wider text-zinc-400 select-none">
                      <tr>
                        <th className="py-3.5 px-4 sm:px-6">Tool Name</th>
                        <th className="py-3.5 px-4 hidden sm:table-cell">Category</th>
                        <th className="py-3.5 px-4">Last Used</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                      {filteredRecentTools.map((t) => {
                        const isFavorited = favoriteIds.includes(t.id);
                        const timeLabel = formatRelativeTime(t.lastVisited);
                        const toolObj = toolsList.find((item) => item.id === t.id);
                        const iconName = t.icon || toolObj?.icon || 'Code';

                        return (
                          <tr 
                            key={`${t.id}-${t.lastVisited}`}
                            className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition group"
                          >
                            {/* Tool Name & Description */}
                            <td className="py-3.5 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 shrink-0 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 transition">
                                  <LucideIcon name={iconName} className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 max-w-xs sm:max-w-md">
                                  <Link
                                    to={getToolCanonicalPath(t.category, t.slug)}
                                    className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate block"
                                  >
                                    {t.name}
                                  </Link>
                                  {t.shortDescription && (
                                    <p className="text-[11px] text-zinc-450 dark:text-zinc-500 truncate mt-0.5 font-medium">
                                      {t.shortDescription}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Category Pill */}
                            <td className="py-3.5 px-4 hidden sm:table-cell">
                              <span className="px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-wider">
                                {t.category}
                              </span>
                            </td>

                            {/* Last Used Timestamp */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span>{timeLabel}</span>
                              </span>
                            </td>

                            {/* Actions (Bookmark + Launch) */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => toggleFavorite(t.id)}
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    isFavorited 
                                      ? 'text-amber-500 bg-amber-500/10' 
                                      : 'text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                  }`}
                                  title={isFavorited ? 'Unpin from favorites' : 'Pin to favorites'}
                                >
                                  <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                                </button>

                                <Link
                                  to={getToolCanonicalPath(t.category, t.slug)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-extrabold text-xs shadow-xs transition"
                                >
                                  <span>Open</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="saas-card p-12 text-center rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
                <Clock className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">No Recent Tools Yet</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Whenever you use a calculator, generator, or formatter, it will automatically appear in this table with timestamps.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <Link
                    to="/tools"
                    className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs shadow-sm hover:scale-105 transition"
                  >
                    Browse 270+ Tools
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INTERACTIVE WORKFLOWS */}
        {activeTab === 'workflows' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Multi-Step Project Workflows
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Connect multiple calculators and developer formatters together into cohesive pipelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {workflows.map((wf) => {
                const firstStepTool = toolsList.find((t) => t.id === wf.steps[0]?.id);
                const launchPath = firstStepTool ? getToolCanonicalPath(firstStepTool.category, firstStepTool.slug) : '#';

                return (
                  <div
                    key={wf.id}
                    className="saas-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                          {wf.name}
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase">
                          {wf.steps.length} Steps
                        </span>
                      </div>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                        {wf.description}
                      </p>

                      {/* Steps Pill List */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {wf.steps.map((step, idx) => (
                          <span
                            key={step.slug}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold"
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[8px] font-black">
                              {idx + 1}
                            </span>
                            <span>{step.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={launchPath}
                      className="saas-button-primary inline-flex items-center justify-center gap-2 py-2 text-xs w-full"
                    >
                      <span>Start Workflow</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ACADEMY LEARNING TRACKS */}
        {activeTab === 'academy' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  Career Tracks & Interview Preparation
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {completedQuestions.length} Questions Completed • {xp} Total XP Earned
                </p>
              </div>

              <Link
                to="/academy"
                className="saas-button-primary inline-flex items-center gap-1.5 py-2 px-3 text-xs"
              >
                <span>Open Academy</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {academyCategories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/academy/${cat.id}`}
                  className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between space-y-3 hover:border-indigo-500/40 hover:-translate-y-0.5 transition group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
                        {cat.name}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                        {cat.learningTime || '10+ Topics'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs font-extrabold text-indigo-600 dark:text-indigo-400 pt-1">
                    <span>Practice Track</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MARKDOWN SCRATCHPAD */}
        {activeTab === 'scratchpad' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                  Developer Notes & Scratchpad
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  Synced across tabs, the bottom-right FAB Notepad, and IndexedDB storage.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsMonospace(!isMonospace)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    isMonospace
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {isMonospace ? 'Code Font' : 'Sans Font'}
                </button>

                <button
                  onClick={handleCopyNotes}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownloadNotes}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaved ? 'Saved!' : 'Save Notes'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="# Quick Scratchpad
- Draft meeting notes
- Paste API tokens or JSON payloads
- Calculate rough figures
- Everything auto-saves locally..."
              className={`w-full h-96 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition leading-relaxed resize-y ${
                isMonospace ? 'font-mono' : 'font-sans'
              }`}
            />
          </div>
        )}

        {/* TAB 6: STORAGE & PRIVACY */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Browser Storage Footprint
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Toolique is strictly client-side. Inspect your local storage footprint and backup anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Storage</span>
                <div className="text-xl font-black text-zinc-900 dark:text-white">{storageSizeKB} KB</div>
                <p className="text-[10px] text-zinc-500 font-medium">LocalStorage + IndexedDB</p>
              </div>

              <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Privacy Status</span>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5" />
                  <span>100% Private</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium">Zero cloud telemetry logs</p>
              </div>

              <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Export Ready</span>
                <div className="text-xl font-black text-zinc-900 dark:text-white">JSON Backup</div>
                <p className="text-[10px] text-zinc-500 font-medium">1-Click portable workspace file</p>
              </div>
            </div>

            {/* Wipe Profile Danger Zone */}
            <div className="p-6 rounded-3xl border border-rose-500/20 bg-rose-500/5 space-y-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                <Trash2 className="w-4 h-4" />
                <span>Reset & Factory Wipe Workspace</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                Clearing your workspace will erase all local bookmarks, practice streaks, academy progress, recently used tools history, and scratchpad notes stored in this browser.
              </p>
              <button
                onClick={clearProfile}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition cursor-pointer shadow-sm active:scale-95"
              >
                Clear All Local Data
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
