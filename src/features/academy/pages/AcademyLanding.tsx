import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Flame, 
  Award, 
  BookOpen, 
  ArrowRight, 
  Bookmark, 
  SlidersHorizontal, 
  TrendingUp, 
  Brain, 
  Terminal, 
  Download, 
  Upload, 
  Layers, 
  Gift, 
  CheckCircle2, 
  Code2, 
  Database, 
  Check, 
  ChevronRight 
} from 'lucide-react';
import SEO from '../../../components/SEO';
import LucideIcon from '../../../components/LucideIcon';
import { academyCategories } from '../data/categories';
import { allQuestions } from '../data/questions/qa';
import { useAcademyProgress } from '../hooks/useAcademyProgress';
import type { Question } from '../types';

import JoinVisualizer from '../components/JoinVisualizer';
import DataStructureVisual from '../components/DataStructureVisual';
import FlashcardViewer from '../components/FlashcardViewer';
import GamificationStudio from '../components/GamificationStudio';
import SkillTree from '../components/SkillTree';
import LearningInsights from '../components/LearningInsights';

export default function AcademyLanding() {
  const { progress, completeQuestion } = useAcademyProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeStudioTab, setActiveStudioTab] = useState<'tracks' | 'visualizers' | 'flashcards' | 'gamification' | 'skilltree' | 'insights'>('tracks');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Gamification calculations
  const nextLevelXp = 100;
  const currentLevelXp = progress.xp % nextLevelXp;
  const levelProgressPct = (currentLevelXp / nextLevelXp) * 100;

  // Filter questions based on query and filters
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q: Question) => {
      const qTrack = q.id.startsWith('sql') ? 'sql' : q.id.startsWith('py') ? 'python' : q.id.startsWith('js') ? 'javascript' : q.id.startsWith('react') ? 'react' : 'qa';
      
      if (selectedTrack !== 'all' && qTrack !== selectedTrack) {
        return false;
      }
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) {
        return false;
      }
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) {
        return false;
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesTag = q.tags.some((t: string) => t.toLowerCase().includes(query));
        const matchesCompany = q.companies && q.companies.some((c: string) => c.toLowerCase().includes(query));
        if (!matchesTitle && !matchesTopic && !matchesTag && !matchesCompany) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedDifficulty, selectedTrack, selectedTopic]);

  // Extract all unique topics for filter dropdown
  const allTopics = useMemo(() => Array.from(new Set(allQuestions.map((q: Question) => q.topic))), []);

  // Today's Daily Challenge pick (deterministic based on day of year)
  const dailyChallenge = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return allQuestions[dayOfYear % allQuestions.length] || allQuestions[0];
  }, []);

  const isDailySolved = progress.completedQuestions.includes(dailyChallenge.id);

  // Track Icon & Color helpers
  const getTrackColor = (catId: string) => {
    switch (catId) {
      case 'sql':
        return {
          gradient: 'from-blue-600 to-indigo-600',
          badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
          border: 'hover:border-blue-500/40'
        };
      case 'python':
        return {
          gradient: 'from-emerald-600 to-teal-600',
          badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
          border: 'hover:border-emerald-500/40'
        };
      case 'javascript':
        return {
          gradient: 'from-amber-500 to-yellow-600',
          badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
          border: 'hover:border-amber-500/40'
        };
      case 'react':
        return {
          gradient: 'from-cyan-500 to-blue-600',
          badge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
          border: 'hover:border-cyan-500/40'
        };
      case 'qa':
        return {
          gradient: 'from-purple-600 to-pink-600',
          badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
          border: 'hover:border-purple-500/40'
        };
      default:
        return {
          gradient: 'from-indigo-600 to-violet-600',
          badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
          border: 'hover:border-indigo-500/40'
        };
    }
  };

  // Determine badges earned based on XP/solved count
  const badges = [
    { name: 'Hello World', desc: 'Join the Academy', earned: true, icon: Sparkles },
    { name: 'Problem Solver', desc: 'Solve 1+ Questions', earned: progress.completedQuestions.length >= 1, icon: Brain },
    { name: 'SQL Apprentice', desc: 'Solve 1 SQL Question', earned: progress.completedQuestions.some(id => id.startsWith('sql')), icon: Database },
    { name: '100 XP Club', desc: 'Earn 100+ total XP', earned: progress.xp >= 100, icon: Award },
    { name: 'Code Master', desc: 'Solve 5+ Questions', earned: progress.completedQuestions.length >= 5, icon: Award }
  ];

  // Backup data
  const handleBackup = () => {
    const backupData = {
      progress: localStorage.getItem('toolique_academy_progress'),
      spacedRepetition: localStorage.getItem('toolique_spaced_repetition')
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolique-academy-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Progress backup exported successfully!');
  };

  // Restore backup data
  const handleRestore = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.progress) localStorage.setItem('toolique_academy_progress', parsed.progress);
        if (parsed.spacedRepetition) localStorage.setItem('toolique_spaced_repetition', parsed.spacedRepetition);
        showToast('Restore completed successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        showToast('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-10 py-4 text-left animate-fadeIn pb-16">
      <SEO
        title="Toolique Academy | Master Coding, Databases & QA Automation"
        description="Practice programming, software engineering, SQL optimization, Python scripting, React architecture, and QA automation interview challenges in an offline-first browser sandbox."
        canonicalUrl="https://www.toolique.in/academy"
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-[120] px-4 py-3 rounded-2xl bg-slate-900/95 text-white dark:bg-white dark:text-slate-900 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-bold border border-slate-700/50 dark:border-slate-200"
          >
            <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Section */}
      <div className="relative p-6 sm:p-10 md:p-12 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 shadow-2xl">
        {/* Ambient neon aura blur */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Toolique Interactive Academy
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800/80 text-slate-300 border border-slate-700">
              100% Free • Client-Side Sandbox
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Master Technical Coding &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Interview Prep</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
            Sharpen your software engineering, database query optimization, and QA automation skills with hands-on live code challenges, visual explainers, spaced repetition, and real-world company questions.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#academy-tracks"
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition"
            >
              <span>Explore 5+ Tracks</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              to="/academy/playgrounds"
              className="px-5 py-3 rounded-2xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>SQL &amp; Code Playgrounds</span>
            </Link>

            <Link
              to="/academy/learn"
              className="px-5 py-3 rounded-2xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Visual Explainers</span>
            </Link>

            <Link
              to="/academy/bookmarks"
              className="px-4 py-3 rounded-2xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition ml-auto"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Saved Bookmarks</span>
            </Link>
          </div>

          {/* Platform Stat Metrics */}
          <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 border-t border-slate-800/80 mt-6">
            <div>
              <div className="text-lg sm:text-xl font-black text-white">{academyCategories.length} Specialized Tracks</div>
              <div className="text-[11px] text-slate-400 font-medium">SQL, Py, JS, React, QA</div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-indigo-400">{allQuestions.length}+ Live Challenges</div>
              <div className="text-[11px] text-slate-400 font-medium">With Automated Test Runners</div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-emerald-400">Zero Accounts Required</div>
              <div className="text-[11px] text-slate-400 font-medium">Local State &amp; Backups</div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-purple-400">365 Daily Series</div>
              <div className="text-[11px] text-slate-400 font-medium">Spaced Practice System</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification Dashboard & Progress Tracker Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Progress Stats Card */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-500" />
              Mastery Profile
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              Rank #{progress.level}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex flex-col items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <span className="text-[9px] font-black uppercase tracking-wider">Level</span>
              <span className="text-xl font-black leading-none">{progress.level}</span>
            </div>
            <div className="flex-grow space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900 dark:text-white">{progress.xp} Total XP</span>
                <span className="text-slate-500 dark:text-slate-400">{currentLevelXp} / {nextLevelXp} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 rounded-full" style={{ width: `${levelProgressPct}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850">
              <span className="block text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
                <Flame className="w-4.5 h-4.5 text-orange-500 fill-orange-500" />
                {progress.streak}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Day Streak</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850">
              <span className="block text-lg font-black text-emerald-600 dark:text-emerald-400">
                {progress.completedQuestions.length}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Solved Challenges</span>
            </div>
          </div>
        </div>

        {/* Badges & Backup Card */}
        <div className="md:col-span-2 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-4 text-left flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Earned Badges &amp; Milestones
            </h3>

            {/* Backup Import/Export buttons */}
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleBackup}
                className="text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup JSON</span>
              </button>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore JSON</span>
                <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
            {badges.map((badge, idx) => {
              const BadgeIcon = badge.icon;
              return (
                <div 
                  key={idx}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-1.5 transition ${
                    badge.earned 
                      ? 'border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/20 text-slate-900 dark:text-slate-100 shadow-xs' 
                      : 'border-slate-200/60 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 text-slate-400 opacity-50'
                  }`}
                  title={badge.desc}
                >
                  <div className={`p-2 rounded-xl ${badge.earned ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <BadgeIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black leading-tight">{badge.name}</span>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Progress automatically saved in local browser storage</span>
            <span className="font-bold text-indigo-500">Zero tracking cookies</span>
          </div>
        </div>
      </section>

      {/* Today's Daily Spotlight Challenge Banner */}
      {dailyChallenge && (
        <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-orange-950/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                Today's Daily Challenge
              </span>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">+50 XP Reward</span>
              {isDailySolved && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Solved Today
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {dailyChallenge.title}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Topic: <strong>{dailyChallenge.topic}</strong> • Tags: {dailyChallenge.tags.join(', ')}
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {(() => {
              const track = dailyChallenge.id.startsWith('sql') ? 'sql' : dailyChallenge.id.startsWith('py') ? 'python' : dailyChallenge.id.startsWith('js') ? 'javascript' : dailyChallenge.id.startsWith('react') ? 'react' : 'qa';
              return (
                <Link
                  to={`/academy/${track}/question/${dailyChallenge.slug}`}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition"
                >
                  <span>{isDailySolved ? 'Review Solution' : 'Solve Daily Challenge'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              );
            })()}
          </div>
        </div>
      )}

      {/* Academy Feature Segmented Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex flex-wrap items-center justify-start gap-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveStudioTab('tracks')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 border ${
            activeStudioTab === 'tracks' 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm border-slate-900 dark:border-white' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Learning Tracks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab('visualizers')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 border ${
            activeStudioTab === 'visualizers' 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm border-slate-900 dark:border-white' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-500" />
          <span>Visualizers Sandbox</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab('flashcards')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 border ${
            activeStudioTab === 'flashcards' 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm border-slate-900 dark:border-white' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-emerald-500" />
          <span>Spaced Flashcards</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab('gamification')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 border ${
            activeStudioTab === 'gamification' 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm border-slate-900 dark:border-white' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Gift className="w-3.5 h-3.5 text-amber-500" />
          <span>Rewards Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab('skilltree')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 border ${
            activeStudioTab === 'skilltree' 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm border-slate-900 dark:border-white' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-blue-500" />
          <span>Skill Tree</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab('insights')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 border ${
            activeStudioTab === 'insights' 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm border-slate-900 dark:border-white' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
          <span>Learning Analytics</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      <div>
        {activeStudioTab === 'gamification' && (
          <GamificationStudio progress={progress} onRewardEarned={(xpReward) => completeQuestion('reward-claim-' + Math.random(), xpReward)} />
        )}

        {activeStudioTab === 'skilltree' && (
          <SkillTree progress={progress} />
        )}

        {activeStudioTab === 'insights' && (
          <LearningInsights progress={progress} />
        )}

        {activeStudioTab === 'visualizers' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-200 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Interactive visual sandbox engines designed to build deep mental models of query sets and memory structures.</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <JoinVisualizer />
              <DataStructureVisual />
            </div>
          </div>
        )}

        {activeStudioTab === 'flashcards' && (
          <div className="space-y-4">
            <FlashcardViewer />
          </div>
        )}

        {activeStudioTab === 'tracks' && (
          <div className="space-y-12 text-left">
            {/* Questions Search & Filter Section */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-grow">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search 100+ challenges by title, tag, or company (e.g. JOINs, Google, TCS)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 text-xs font-semibold focus:outline-none focus:border-indigo-500 placeholder-slate-400 dark:placeholder-slate-500 shadow-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Filter Controls Bar */}
              {showFilters && (
                <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Track / Category</label>
                    <select
                      value={selectedTrack}
                      onChange={(e) => setSelectedTrack(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-200"
                    >
                      <option value="all">All Tracks</option>
                      <option value="sql">SQL &amp; Databases</option>
                      <option value="python">Python Programming</option>
                      <option value="javascript">JavaScript Core</option>
                      <option value="react">React &amp; Modern Frontend</option>
                      <option value="qa">QA Automation &amp; Testing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-200"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="interview">Interview Questions</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5">Topic</label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold focus:outline-none text-slate-800 dark:text-slate-200"
                    >
                      <option value="all">All Topics</option>
                      {allTopics.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Question search results list */}
              {(searchQuery.trim() || selectedTrack !== 'all' || selectedDifficulty !== 'all' || selectedTopic !== 'all') && (
                <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-lg space-y-2 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                      Filtered Questions ({filteredQuestions.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTrack('all');
                        setSelectedDifficulty('all');
                        setSelectedTopic('all');
                      }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map(q => {
                      const track = q.id.startsWith('sql') ? 'sql' : q.id.startsWith('py') ? 'python' : q.id.startsWith('js') ? 'javascript' : q.id.startsWith('react') ? 'react' : 'qa';
                      const isSolved = progress.completedQuestions.includes(q.id);

                      return (
                        <Link
                          key={q.id}
                          to={`/academy/${track}/question/${q.slug}`}
                          className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isSolved ? 'bg-emerald-500/20 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                              {isSolved ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                {q.title}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                {q.topic} • {q.tags.join(', ')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {q.companies && q.companies.slice(0, 2).map((comp: string) => (
                              <span key={comp} className="hidden sm:inline px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {comp}
                              </span>
                            ))}
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                              q.difficulty === 'beginner' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                                : q.difficulty === 'intermediate'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                                : q.difficulty === 'advanced'
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600'
                            }`}>
                              {q.difficulty}
                            </span>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">No questions found matching your search parameters.</div>
                  )}
                </div>
              )}
            </section>

            {/* Learning Tracks Grid */}
            <section id="academy-tracks" className="scroll-mt-24 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Comprehensive Roadmaps</span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Select Your Learning Track
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-semibold">{academyCategories.length} Curated Tracks Available</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {academyCategories.map((cat) => {
                  const solvedCount = progress.completedQuestions.filter(id => id.startsWith(cat.id)).length;
                  const isTrackSoon = cat.id !== 'sql' && cat.id !== 'python' && cat.id !== 'javascript' && cat.id !== 'react' && cat.id !== 'qa';
                  const theme = getTrackColor(cat.id);

                  return (
                    <div
                      key={cat.id}
                      className="group relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top Accent Gradient Bar */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`} />

                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                            <LucideIcon name={cat.icon} className="w-5 h-5" />
                          </div>
                          {isTrackSoon ? (
                            <span className="text-[9px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl uppercase tracking-wider">
                              Cheat Sheet &amp; Roadmap
                            </span>
                          ) : (
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Practice Ready
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-left">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal min-h-[3rem]">
                            {cat.description}
                          </p>
                        </div>

                        {/* Topics pill tags */}
                        {cat.topics && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {cat.topics.slice(0, 4).map((top: string) => (
                              <span key={top} className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400">
                                {top}
                              </span>
                            ))}
                            {cat.topics.length > 4 && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold text-slate-400">
                                +{cat.topics.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-5 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                            <span>{cat.learningTime}</span>
                          </div>
                          {!isTrackSoon && (
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              {solvedCount} Solved
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/academy/${cat.id}`}
                          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-xs"
                        >
                          <span>{isTrackSoon ? 'View Cheat Sheet' : 'Start Track'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>

    </div>
  );
}
