import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Layers
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

export default function AcademyLanding() {
  const { progress } = useAcademyProgress();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [showFilters, setShowFilters] = useState(false);



  // Statistics configuration
  const stats = [
    { label: 'Learning Tracks', value: academyCategories.length, icon: BookOpen },
    { label: 'Total Challenges', value: allQuestions.length, icon: Brain },
    { label: 'Daily Challenges', value: 365, icon: Flame },
    { label: 'Interview Questions', value: allQuestions.filter((q: Question) => q.difficulty === 'interview').length, icon: Award }
  ];

  // Filter questions based on query and filters
  const filteredQuestions = allQuestions.filter((q: Question) => {
    const matchesSearch = 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.companies && q.companies.some((c: string) => c.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const matchesTopic = selectedTopic === 'all' || q.topic === selectedTopic;

    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  // Extract all unique topics for filter dropdown
  const allTopics = Array.from(new Set(allQuestions.map((q: Question) => q.topic)));

  const scrollToCategories = () => {
    const el = document.getElementById('academy-tracks');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Gamification calculations
  const nextLevelXp = 100;
  const currentLevelXp = progress.xp % nextLevelXp;
  const levelProgressPct = (currentLevelXp / nextLevelXp) * 100;

  // Determine badges earned based on XP/solved count
  const badges = [
    { name: 'Hello World', desc: 'Join the Academy', earned: true, icon: Sparkles },
    { name: 'Problem Solver', desc: 'Solve 1+ Questions', earned: progress.completedQuestions.length >= 1, icon: Brain },
    { name: 'SQL Apprentice', desc: 'Solve 1 SQL Question', earned: progress.completedQuestions.some(id => id.startsWith('sql')), icon: BookOpen },
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
        alert('Restore completed successfully! Reloading page...');
        window.location.reload();
      } catch {
        alert('Invalid backup file formatting.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-12 py-4">
      <SEO
        title="Toolique Academy | Learn Programming & QA Interview Prep"
        description="Practice programming, software engineering, QA automation, and technical interview questions with dynamic daily challenges and progress tracking."
      />

      {/* Hero Section */}
      <section className="relative p-8 sm:p-12 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-white/70 to-white/30 dark:from-zinc-900/60 dark:to-zinc-950/30 backdrop-blur-md overflow-hidden text-center max-w-5xl mx-auto">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/[0.04] dark:bg-indigo-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Offline-First Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
            Learn by Solving <span className="text-indigo-600 dark:text-indigo-400">Real Problems</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Practice programming, QA automation, engineering, and technical interview questions with step-by-step solutions, explanations, and daily practice challenges.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button 
              onClick={scrollToCategories}
              className="saas-button-primary text-xs"
            >
              Start Learning <ArrowRight className="w-4 h-4" />
            </button>
            <Link 
              to="/academy/playgrounds"
              className="saas-button-secondary text-xs flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" /> Code Playground
            </Link>
            <Link 
              to="/academy/learn"
              className="saas-button-secondary text-xs flex items-center gap-2"
            >
              <Layers className="w-4 h-4" /> Visual Explainers
            </Link>
          </div>
        </div>
      </section>

      {/* Gamification Dashboard & Progress Tracker */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* User Progress Stats Card */}
        <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-wider flex items-center justify-between">
            Your Profile
            <Link to="/academy/bookmarks" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5" /> Bookmarks
            </Link>
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center border border-indigo-500/20 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider">Level</span>
              <span className="text-xl font-black">{progress.level}</span>
            </div>
            <div className="flex-grow space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-800 dark:text-zinc-200">{progress.xp} Total XP</span>
                <span className="text-zinc-455 dark:text-zinc-500">{currentLevelXp} / {nextLevelXp} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-850 overflow-hidden">
                <div className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300" style={{ width: `${levelProgressPct}%` }} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-850/80 text-center">
            <div>
              <span className="block text-lg font-black text-zinc-900 dark:text-white flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" /> {progress.streak}
              </span>
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-550 uppercase">Active Streak</span>
            </div>
            <div>
              <span className="block text-lg font-black text-zinc-900 dark:text-white">
                {progress.completedQuestions.length}
              </span>
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-555 uppercase">Solved Challenges</span>
            </div>
          </div>
        </div>

        {/* Badges and Milestones Card */}
        <div className="md:col-span-2 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-500" /> Earned Badges
            </h3>

            {/* Backup Import/Export buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleBackup}
                className="text-[9px] font-bold text-zinc-500 hover:text-indigo-500 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md cursor-pointer"
              >
                <Download className="w-3 h-3" /> Backup
              </button>
              <label className="text-[9px] font-bold text-zinc-500 hover:text-indigo-500 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md cursor-pointer">
                <Upload className="w-3 h-3" /> Restore
                <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {badges.map((badge, idx) => {
              const BadgeIcon = badge.icon;
              return (
                <div 
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 transition ${
                    badge.earned 
                      ? 'border-indigo-500/20 bg-indigo-500/5 text-zinc-800 dark:text-zinc-200' 
                      : 'border-zinc-200/50 dark:border-zinc-850 bg-zinc-100/10 text-zinc-400 dark:text-zinc-600 opacity-60'
                  }`}
                  title={badge.desc}
                >
                  <div className={`p-2 rounded-lg ${badge.earned ? 'bg-indigo-500/10 text-indigo-500' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600'}`}>
                    <BadgeIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold leading-tight">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dynamic Statistics Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-655 dark:text-zinc-450">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xl font-black text-zinc-900 dark:text-white">{stat.value}</span>
                <span className="text-[10px] font-bold text-zinc-455 dark:text-zinc-555 uppercase">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Flashcard decks inline section */}
      <section className="max-w-5xl mx-auto">
        <FlashcardViewer />
      </section>

      {/* SQL & DS Visualizers inline section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <JoinVisualizer />
        <DataStructureVisual />
      </section>

      {/* Questions Search & Filter Section */}
      <section className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-550 w-4 h-4" />
            <input
              type="text"
              placeholder="Search challenges by title, tag, or company (e.g. JOINs, Google)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold focus:outline-none focus:border-indigo-500 placeholder-zinc-400 dark:placeholder-zinc-650"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-55 dark:hover:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Filter Sliders */}
        {showFilters && (
          <div className="p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase mb-1.5">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-semibold focus:outline-none text-zinc-850 dark:text-zinc-200"
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="interview">Interview Questions</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-455 dark:text-zinc-500 uppercase mb-1.5">Topics</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-semibold focus:outline-none text-zinc-850 dark:text-zinc-200"
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
        {searchQuery.trim() && (
          <div className="saas-card p-4 space-y-2 max-h-72 overflow-y-auto">
            <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-wider px-2">
              Search Results ({filteredQuestions.length})
            </h4>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map(q => {
                const track = q.id.startsWith('sql') ? 'sql' : q.id.startsWith('py') ? 'python' : q.id.startsWith('js') ? 'javascript' : q.id.startsWith('react') ? 'react' : 'qa';
                return (
                  <Link
                    key={q.id}
                    to={`/academy/${track}/question/${q.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition group"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{q.title}</span>
                      <span className="text-[9px] text-zinc-400 mt-0.5">{q.topic} • {q.tags.join(', ')}</span>
                    </div>
                    <span className={`saas-badge text-[8px] font-bold px-2 py-0.5 rounded border capitalize ${
                      q.difficulty === 'beginner' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                        : q.difficulty === 'intermediate'
                        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'
                        : q.difficulty === 'advanced'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600'
                    }`}>
                      {q.difficulty}
                    </span>
                  </Link>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-zinc-450 dark:text-zinc-600">No questions found matching your search parameters.</div>
            )}
          </div>
        )}
      </section>

      {/* Learning Tracks Grid */}
      <section id="academy-tracks" className="scroll-mt-24 max-w-5xl mx-auto space-y-6">
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white text-center sm:text-left">
          Select Your Learning Track
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {academyCategories.map((cat) => {
            const solvedCount = progress.completedQuestions.filter(id => id.startsWith(cat.id)).length;
            const isTrackSoon = cat.id !== 'sql' && cat.id !== 'python' && cat.id !== 'javascript' && cat.id !== 'react' && cat.id !== 'qa';

            return (
              <div
                key={cat.id}
                className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-white/70 to-white/30 dark:from-zinc-900/60 dark:to-zinc-950/30 shadow-sm flex flex-col justify-between group hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-455 group-hover:bg-indigo-500/15 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      <LucideIcon name={cat.icon} className="w-6 h-6" />
                    </div>
                    {isTrackSoon ? (
                      <span className="text-[8px] font-bold text-zinc-455 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Cheatsheet
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Practice
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-left">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[3rem]">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-850/80 mt-4 flex items-center justify-between text-[11px] text-zinc-450 dark:text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
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
                  className="mt-4 saas-button-secondary text-xs py-2 w-full justify-center"
                >
                  {isTrackSoon ? 'View Cheat Sheet' : 'Continue Learning'}
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
