import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Award, 
  ChevronRight, 
  Play, 
  FileCode, 
  AlertCircle,
  CheckCircle,
  Search,
  Sparkles,
  Zap,
  Filter,
  Check,
  Copy,
  BookOpen,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  Clock,
  Terminal,
  LayoutGrid,
  List
} from 'lucide-react';
import SEO from '../../../components/SEO';
import LucideIcon from '../../../components/LucideIcon';
import { academyCategories } from '../data/categories';
import { sqlQuestions } from '../data/questions/sql';
import { pythonQuestions } from '../data/questions/python';
import { javascriptQuestions } from '../data/questions/javascript';
import { reactQuestions } from '../data/questions/react';
import { qaQuestions } from '../data/questions/qa';
import { useAcademyProgress } from '../hooks/useAcademyProgress';
import DailyQuestionSystem from '../components/DailyQuestionSystem';
import JoinVisualizer from '../components/JoinVisualizer';
import { 
  SQLExecutionLifecycleVisualizer, 
  SQLBTreeVisualizer, 
  SQLWindowFunctionVisualizer, 
  SQLIsolationLevelsVisualizer, 
  SQLNormalizationVisualizer, 
  SQLPlayground 
} from '../components/SQLVisualizers';

export default function AcademyCategory() {
  const { category: categoryId } = useParams();
  const navigate = useNavigate();
  const { progress, completeQuestion } = useAcademyProgress();
  const [activeTab, setActiveTab] = useState<'practice' | 'visuals' | 'playground' | 'daily' | 'roadmap' | 'cheatsheet'>('practice');
  const [activeVisualSubTab, setActiveVisualSubTab] = useState<'all' | 'lifecycle' | 'btree' | 'joins' | 'window' | 'acid' | 'norm'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [interviewMode, setInterviewMode] = useState(false);
  const [interviewDifficulty, setInterviewDifficulty] = useState('all');
  const [interviewTimeLimit, setInterviewTimeLimit] = useState(15); // in minutes
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced' | 'interview'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unsolved' | 'solved'>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const category = academyCategories.find(c => c.id === categoryId?.toLowerCase());

  if (!category) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Track Not Found</h2>
        <p className="text-zinc-500 text-xs">The learning track you are looking for does not exist.</p>
        <Link to="/academy" className="saas-button-primary text-xs w-full justify-center">
          Return to Academy
        </Link>
      </div>
    );
  }

  // Map category ID to its question list
  const getQuestions = () => {
    switch (category.id) {
      case 'sql': return sqlQuestions;
      case 'python': return pythonQuestions;
      case 'javascript': return javascriptQuestions;
      case 'react': return reactQuestions;
      case 'qa': return qaQuestions;
      default: return [];
    }
  };

  const questions = getQuestions();
  const solvedCount = progress.completedQuestions.filter(id => id.startsWith(category.id)).length;
  const progressPct = questions.length > 0 ? (solvedCount / questions.length) * 100 : 0;

  // Extract all distinct topics
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach(q => {
      if (q.topic) set.add(q.topic);
    });
    return Array.from(set);
  }, [questions]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      // Difficulty match
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      // Topic match
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
      // Status match
      const isSolved = progress.completedQuestions.includes(q.id);
      if (statusFilter === 'solved' && !isSolved) return false;
      if (statusFilter === 'unsolved' && isSolved) return false;
      // Search query match (title, topic, tags, companies)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchTitle = q.title.toLowerCase().includes(query);
        const matchTopic = q.topic.toLowerCase().includes(query);
        const matchTags = q.tags.some(t => t.toLowerCase().includes(query));
        const matchCompany = q.companies?.some(c => c.toLowerCase().includes(query));
        if (!matchTitle && !matchTopic && !matchTags && !matchCompany) return false;
      }
      return true;
    });
  }, [questions, selectedDifficulty, selectedTopic, statusFilter, searchQuery, progress.completedQuestions]);

  // Group questions by difficulty for segmented display
  const difficulties = ['beginner', 'intermediate', 'advanced', 'interview'] as const;

  const handleStartInterview = () => {
    let pool = questions;
    if (interviewDifficulty !== 'all') {
      pool = questions.filter(q => q.difficulty === interviewDifficulty);
    }
    if (pool.length === 0) {
      alert("No questions available for this difficulty track yet!");
      return;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    const sessionData = {
      category: category.id,
      difficulty: interviewDifficulty,
      questions: selected,
      timeRemaining: interviewTimeLimit * 60,
      totalTime: interviewTimeLimit * 60
    };
    sessionStorage.setItem('toolique_academy_interview_session', JSON.stringify(sessionData));
    navigate(`/academy/${category.id}/question/${selected[0].slug}?mode=interview`);
  };

  const copyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isSqlTrack = category.id === 'sql';

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 text-left animate-fadeIn">
      <SEO
        title={`${category.name} Practice & Cheat Sheets | Toolique Academy`}
        description={category.description}
        canonicalUrl={`https://www.toolique.in/academy/${category.id}`}
      />

      {/* Back button & Hero Header Panel */}
      <div className="space-y-4">
        <Link 
          to="/academy"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Academy Tracks
        </Link>

        {/* Hero Card with Stats & Progress */}
        <div className="relative p-6 sm:p-8 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/3 -mb-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                  <LucideIcon name={category.icon} className="w-3.5 h-3.5 text-indigo-400" />
                  Official Academy Track
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800/80 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {category.learningTime || '15 Hours'}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-emerald-400" />
                  {questions.length} Practice Challenges
                </span>
              </div>

              {/* STRICT SINGLE H1 */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {category.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {category.description}
              </p>

              {/* Quick Jump Action Pills */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                {isSqlTrack && (
                  <>
                    <button
                      onClick={() => setActiveTab('visuals')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-bold text-indigo-200 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Visual Explainers (6 Models)</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('playground')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Live SQLite Studio</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setActiveTab('cheatsheet')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Syntax Cheat Sheet</span>
                </button>
              </div>
            </div>

            {/* Progress Gauge Card */}
            {questions.length > 0 && (
              <div className="w-full lg:w-60 bg-white/10 backdrop-blur-md dark:bg-slate-900/60 p-4 rounded-2xl border border-white/10 dark:border-slate-800 space-y-3 shrink-0">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    Track Mastery
                  </span>
                  <span className="font-mono font-black text-indigo-300">{Math.round(progressPct)}%</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPct}%` }} 
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Solved: <strong className="text-white font-mono">{solvedCount}</strong></span>
                  <span>Total: <strong className="text-slate-300 font-mono">{questions.length}</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('practice')}
          className={`py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'practice'
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Practice ({questions.length})</span>
        </button>

        {isSqlTrack && (
          <button
            onClick={() => setActiveTab('visuals')}
            className={`py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'visuals'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Visual Explainers (6)</span>
          </button>
        )}

        {isSqlTrack && (
          <button
            onClick={() => setActiveTab('playground')}
            className={`py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'playground'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-500" />
            <span>SQLite Studio</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('daily')}
          className={`py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'daily'
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Daily Challenges (15/15)</span>
        </button>

        {category.roadmap.length > 0 && (
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Roadmap</span>
          </button>
        )}

        {category.cheatSheet.length > 0 && (
          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`py-3 px-5 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cheatsheet'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Cheat Sheet</span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="space-y-8">
        {/* VISUAL EXPLAINERS TAB (FOR SQL TRACK) */}
        {activeTab === 'visuals' && isSqlTrack && (
          <div className="space-y-8 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h2 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Interactive SQL Mental Models &amp; Database Internals</span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Understand query pipelines, B+ tree indexes, window partitions, ACID transactions, and normalization.
                </p>
              </div>

              {/* Subtab Filter */}
              <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl overflow-x-auto max-w-full">
                {[
                  { id: 'all', label: 'All (6)' },
                  { id: 'lifecycle', label: '1. Lifecycle' },
                  { id: 'btree', label: '2. B+ Tree' },
                  { id: 'joins', label: '3. JOINs' },
                  { id: 'window', label: '4. Window' },
                  { id: 'acid', label: '5. ACID' },
                  { id: 'norm', label: '6. Normalization' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setActiveVisualSubTab(st.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
                      activeVisualSubTab === st.id
                        ? 'bg-white dark:bg-zinc-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visualizer Stack */}
            <div className="space-y-8">
              {(activeVisualSubTab === 'all' || activeVisualSubTab === 'lifecycle') && (
                <SQLExecutionLifecycleVisualizer />
              )}

              {(activeVisualSubTab === 'all' || activeVisualSubTab === 'btree') && (
                <SQLBTreeVisualizer />
              )}

              {(activeVisualSubTab === 'all' || activeVisualSubTab === 'joins') && (
                <JoinVisualizer />
              )}

              {(activeVisualSubTab === 'all' || activeVisualSubTab === 'window') && (
                <SQLWindowFunctionVisualizer />
              )}

              {(activeVisualSubTab === 'all' || activeVisualSubTab === 'acid') && (
                <SQLIsolationLevelsVisualizer />
              )}

              {(activeVisualSubTab === 'all' || activeVisualSubTab === 'norm') && (
                <SQLNormalizationVisualizer />
              )}
            </div>
          </div>
        )}

        {/* IN-BROWSER SQLITE PLAYGROUND TAB */}
        {activeTab === 'playground' && isSqlTrack && (
          <div className="space-y-6 text-left">
            <SQLPlayground />
          </div>
        )}

        {/* DAILY CHALLENGES TAB */}
        {activeTab === 'daily' && (
          <DailyQuestionSystem
            categoryId={category.id}
            staticQuestions={questions}
            progress={progress}
            onXpEarned={(xp) => completeQuestion('reward-claim-' + Math.random(), xp)}
          />
        )}

        {/* PRACTICE CHALLENGES TAB */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            {/* Search & Filter Toolbar */}
            <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by challenge title, topic (JOINs, Window, CTE), or company (Google, Amazon)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Status Filter & View Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="unsolved">Unsolved Only</option>
                    <option value="solved">Solved Only</option>
                  </select>

                  <div className="hidden sm:flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl p-0.5 bg-zinc-100 dark:bg-zinc-950">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                      }`}
                      title="Compact List View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                      }`}
                      title="Grid Cards View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Difficulty Filter Chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-850">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase mr-1">Difficulty:</span>
                  {[
                    { id: 'all', label: 'All', count: questions.length },
                    { id: 'beginner', label: 'Beginner', count: questions.filter(q => q.difficulty === 'beginner').length },
                    { id: 'intermediate', label: 'Intermediate', count: questions.filter(q => q.difficulty === 'intermediate').length },
                    { id: 'advanced', label: 'Advanced', count: questions.filter(q => q.difficulty === 'advanced').length },
                    { id: 'interview', label: 'FAANG / Expert', count: questions.filter(q => q.difficulty === 'interview').length }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedDifficulty(tab.id as any)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        selectedDifficulty === tab.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        selectedDifficulty === tab.id ? 'bg-indigo-700 text-indigo-100' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Topic Selector */}
                {allTopics.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Topic:</span>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/80 text-xs font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer max-w-[180px] truncate"
                    >
                      <option value="all">All Topics ({allTopics.length})</option>
                      {allTopics.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Split Arena: Question List on Left, Mock Interview Launcher on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Content: Questions List */}
              <div className="col-span-1 lg:col-span-8 space-y-6">
                {filteredQuestions.length > 0 ? (
                  difficulties.map(level => {
                    const levelQuestions = filteredQuestions.filter(q => q.difficulty === level);
                    if (levelQuestions.length === 0) return null;

                    const levelSolved = levelQuestions.filter(q => progress.completedQuestions.includes(q.id)).length;

                    return (
                      <div key={level} className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <h2 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              level === 'beginner' ? 'bg-emerald-500' :
                              level === 'intermediate' ? 'bg-amber-500' :
                              level === 'advanced' ? 'bg-rose-500' : 'bg-indigo-500'
                            }`} />
                            <span className="capitalize">{level} Tier Challenges</span>
                          </h2>
                          <span className="text-[11px] font-mono font-bold text-zinc-400">
                            {levelSolved}/{levelQuestions.length} Solved
                          </span>
                        </div>

                        {viewMode === 'list' ? (
                          <div className="saas-card overflow-hidden divide-y divide-zinc-200/50 dark:divide-zinc-850/80 shadow-xs">
                            {levelQuestions.map((q) => {
                              const solved = progress.completedQuestions.includes(q.id);
                              return (
                                <Link
                                  key={q.id}
                                  to={`/academy/${category.id}/question/${q.slug}`}
                                  className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition group text-left"
                                >
                                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                                    {solved ? (
                                      <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0">
                                        <CheckCircle className="w-5 h-5 fill-emerald-500/20" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 shrink-0 group-hover:border-indigo-500 transition" />
                                    )}
                                    
                                    <div className="min-w-0">
                                      <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate block">
                                        {q.title}
                                      </span>
                                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-zinc-400">
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{q.topic}</span>
                                        <span>•</span>
                                        <span className="truncate">{q.tags.slice(0, 3).join(', ')}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    {q.companies && q.companies.length > 0 && (
                                      <div className="hidden sm:flex items-center gap-1">
                                        {q.companies.slice(0, 2).map(c => (
                                          <span key={c} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[9px] font-bold text-zinc-600 dark:text-zinc-400">
                                            {c}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition text-indigo-500" />
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {levelQuestions.map((q) => {
                              const solved = progress.completedQuestions.includes(q.id);
                              return (
                                <Link
                                  key={q.id}
                                  to={`/academy/${category.id}/question/${q.slug}`}
                                  className="saas-card p-4 hover:border-indigo-500/40 transition group flex flex-col justify-between space-y-3"
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                                        {q.topic}
                                      </span>
                                      {solved && (
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                      )}
                                    </div>
                                    <span className="text-xs font-black text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-2 block">
                                      {q.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-850 text-[10px] text-zinc-400">
                                    <span>+{q.difficulty === 'beginner' ? '50' : q.difficulty === 'intermediate' ? '75' : q.difficulty === 'advanced' ? '100' : '150'} XP</span>
                                    <span className="font-bold text-indigo-500 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                                      Solve &rarr;
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-12 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <Filter className="w-10 h-10 text-zinc-400 mx-auto" />
                    <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No Challenges Match Your Filter</h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Try clearing your search query or selecting "All" in the difficulty and topic filters above.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedDifficulty('all');
                        setSelectedTopic('all');
                        setStatusFilter('all');
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Right Sidebar: Mock Interview Simulator */}
              <div className="col-span-1 lg:col-span-4 sticky top-24 space-y-6">
                <div className="p-6 rounded-3xl border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white">Mock Interview Simulator</h3>
                  </div>
                  
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                    Test your problem-solving speed under real timed constraints. Solve a randomized set of 3 questions with a countdown timer to test production readiness.
                  </p>

                  {interviewMode ? (
                    <div className="space-y-4 pt-2 border-t border-indigo-100 dark:border-indigo-950">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Difficulty Filter</label>
                          <select
                            value={interviewDifficulty}
                            onChange={(e) => setInterviewDifficulty(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
                          >
                            <option value="all">All Difficulties (100 Questions)</option>
                            <option value="beginner">Beginner Only</option>
                            <option value="intermediate">Intermediate Only</option>
                            <option value="advanced">Advanced Only</option>
                            <option value="interview">FAANG / Expert Scenarios</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Time Limit (Minutes)</label>
                          <input
                            type="number"
                            min={5}
                            max={60}
                            value={interviewTimeLimit}
                            onChange={(e) => setInterviewTimeLimit(parseInt(e.target.value) || 15)}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleStartInterview}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Quiz</span>
                        </button>
                        <button
                          onClick={() => setInterviewMode(false)}
                          className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setInterviewMode(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Configure Mock Interview</span>
                    </button>
                  )}
                </div>

                {/* Quick Track Stats Summary */}
                <div className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-3 text-xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Track Breakdown</span>
                  <div className="space-y-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-zinc-600 dark:text-zinc-400">Beginner Tier</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">25 Questions</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-zinc-600 dark:text-zinc-400">Intermediate Tier</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">30 Questions</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-zinc-600 dark:text-zinc-400">Advanced Tier</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">25 Questions</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-zinc-600 dark:text-zinc-400">FAANG Scenarios</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">20 Questions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROADMAP TAB */}
        {activeTab === 'roadmap' && category.roadmap.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-8 text-left">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Topic Roadmap &amp; Mastery Milestones
              </h2>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {category.roadmap.length} Progression Milestones
              </span>
            </div>

            <div className="relative pl-6 border-l-2 border-indigo-500/30 space-y-10 ml-3 py-2">
              {category.roadmap.map((step, idx) => (
                <div key={idx} className="relative group text-left">
                  {/* Step Bubble */}
                  <div className="absolute -left-[33px] top-1 w-6 h-6 rounded-full border-2 border-indigo-500 bg-white dark:bg-zinc-950 flex items-center justify-center shadow-xs">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{idx + 1}</span>
                  </div>

                  <div className="saas-card p-6 space-y-3">
                    <div>
                      <h3 className="text-base font-black text-zinc-900 dark:text-white">{step.title}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{step.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-850">
                      {step.topics.map(t => (
                        <button
                          key={t}
                          onClick={() => {
                            setActiveTab('practice');
                            setSearchQuery(t);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                          title={`Find practice questions for ${t}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHEAT SHEET TAB */}
        {activeTab === 'cheatsheet' && category.cheatSheet.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-6 text-left">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Syntax &amp; Database Architecture Reference Cards
              </h2>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {category.cheatSheet.length} Topic Guides
              </span>
            </div>

            <div className="space-y-6">
              {category.cheatSheet.map((sheet, idx) => (
                <div key={idx} className="saas-card p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/80 pb-3">
                    <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      <span>{sheet.title}</span>
                    </h3>
                    <button
                      onClick={() => copyCode(sheet.content, idx)}
                      className="text-xs font-bold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Reference</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium markdown-content whitespace-pre-line">
                    {sheet.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
