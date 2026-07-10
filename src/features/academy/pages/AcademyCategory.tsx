import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Award, 
  ChevronRight, 
  Play, 
  FileCode, 
  AlertCircle,
  CheckCircle
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

export default function AcademyCategory() {
  const { category: categoryId } = useParams();
  const navigate = useNavigate();
  const { progress, completeQuestion } = useAcademyProgress();
  const [activeTab, setActiveTab] = useState<'practice' | 'daily' | 'roadmap' | 'cheatsheet'>('practice');
  const [interviewMode, setInterviewMode] = useState(false);
  const [interviewDifficulty, setInterviewDifficulty] = useState('all');
  const [interviewTimeLimit, setInterviewTimeLimit] = useState(15); // in minutes

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

  // Group questions by difficulty
  const difficulties = ['beginner', 'intermediate', 'advanced', 'interview'];

  const handleStartInterview = () => {
    // Navigate to interview session mode
    let pool = questions;
    if (interviewDifficulty !== 'all') {
      pool = questions.filter(q => q.difficulty === interviewDifficulty);
    }
    if (pool.length === 0) {
      alert("No questions available for this difficulty track yet!");
      return;
    }

    // Generate random selection of up to 3 questions
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    // Save temporary session parameters in sessionStorage
    const sessionData = {
      category: category.id,
      difficulty: interviewDifficulty,
      questions: selected,
      timeRemaining: interviewTimeLimit * 60,
      totalTime: interviewTimeLimit * 60
    };
    sessionStorage.setItem('toolique_academy_interview_session', JSON.stringify(sessionData));
    
    // Navigate to the first question in the session using index pointer
    navigate(`/academy/${category.id}/question/${selected[0].slug}?mode=interview`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 text-left">
      <SEO
        title={`${category.name} | Toolique Academy`}
        description={category.description}
      />

      {/* Back button and title header */}
      <div className="space-y-4">
        <a 
          href="/academy"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Academy
        </a>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <LucideIcon name={category.icon} className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">{category.name}</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">{category.description}</p>
            </div>
          </div>
          {questions.length > 0 && (
            <div className="w-full sm:w-48 space-y-1.5 shrink-0 bg-white/20 dark:bg-zinc-950/20 p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-800 dark:text-zinc-200">Progress</span>
                <span className="text-indigo-600 dark:text-indigo-400">{solvedCount}/{questions.length} Solved</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-850 overflow-hidden">
                <div className="h-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('practice')}
          className={`py-3 px-6 text-xs font-bold border-b-2 cursor-pointer transition ${
            activeTab === 'practice'
              ? 'border-indigo-600 dark:border-indigo-400 text-zinc-900 dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          Practice Challenges
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`py-3 px-6 text-xs font-bold border-b-2 cursor-pointer transition ${
            activeTab === 'daily'
              ? 'border-indigo-600 dark:border-indigo-400 text-zinc-900 dark:text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          Daily Challenges (15/15)
        </button>
        {category.roadmap.length > 0 && (
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`py-3 px-6 text-xs font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'roadmap'
                ? 'border-indigo-600 dark:border-indigo-400 text-zinc-900 dark:text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Learning Roadmap
          </button>
        )}
        {category.cheatSheet.length > 0 && (
          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`py-3 px-6 text-xs font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'cheatsheet'
                ? 'border-indigo-600 dark:border-indigo-400 text-zinc-900 dark:text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Cheat Sheet
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="space-y-8">
        {activeTab === 'daily' && (
          <DailyQuestionSystem
            categoryId={category.id}
            staticQuestions={questions}
            progress={progress}
            onXpEarned={(xp) => completeQuestion('reward-claim-' + Math.random(), xp)}
          />
        )}
        {activeTab === 'practice' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Content: Questions and Practice Areas */}
            <div className="col-span-1 lg:col-span-8 space-y-8">
              {questions.length > 0 ? (
                difficulties.map(level => {
                  const filtered = questions.filter(q => q.difficulty === level);
                  if (filtered.length === 0) return null;

                  return (
                    <div key={level} className="space-y-4">
                      <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-wider px-2 flex items-center justify-between">
                        <span className="capitalize">{level} Challenges</span>
                        <span>{filtered.filter(q => progress.completedQuestions.includes(q.id)).length}/{filtered.length} Solved</span>
                      </h3>

                      <div className="saas-card overflow-hidden divide-y divide-zinc-200/50 dark:divide-zinc-850/80">
                        {filtered.map(q => {
                          const solved = progress.completedQuestions.includes(q.id);
                          return (
                            <Link
                              key={q.id}
                              to={`/academy/${category.id}/question/${q.slug}`}
                              className="flex items-center justify-between p-4 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition group"
                            >
                              <div className="flex items-center gap-3 text-left">
                                {solved ? (
                                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-700 shrink-0 group-hover:border-indigo-500 transition" />
                                )}
                                <div>
                                  <span className="text-xs font-bold text-zinc-850 dark:text-zinc-250 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                    {q.title}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5 text-[9px] text-zinc-400">
                                    <span className="font-semibold">{q.topic}</span>
                                    <span>•</span>
                                    <span>{q.tags.join(', ')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {q.companies && q.companies.length > 0 && (
                                  <div className="hidden sm:flex items-center gap-1">
                                    {q.companies.slice(0, 2).map(c => (
                                      <span key={c} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-[8px] font-bold text-zinc-500">
                                        {c}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-10 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                  <FileCode className="w-10 h-10 text-zinc-400 mx-auto" />
                  <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Question Bank Coming Soon</h4>
                  <p className="text-[10px] text-zinc-450 dark:text-zinc-550 max-w-sm mx-auto leading-relaxed">
                    Our editors are currently curating and validating interview challenges for {category.name}. Check out the Roadmap and Syntax Cheat Sheet in the tabs above!
                  </p>
                </div>
              )}
            </div>

            {/* Right Content: Sidebar Launcher for Interview Mode */}
            {questions.length > 0 && (
              <div className="col-span-1 lg:col-span-4 sticky top-24 space-y-6">
                <div className="p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-br from-indigo-500/[0.05] to-teal-500/[0.02] space-y-5">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Interview Practice Mode</h3>
                  </div>
                  
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Test your knowledge with a simulated interview quiz. Solve a randomized selection of 3 questions under a countdown timer to test your production readiness.
                  </p>

                  {interviewMode ? (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Difficulty</label>
                          <select
                            value={interviewDifficulty}
                            onChange={(e) => setInterviewDifficulty(e.target.value)}
                            className="w-full px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[11px] font-semibold focus:outline-none"
                          >
                            <option value="all">All Difficulties</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="interview">Interview Questions</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-400 uppercase mb-1">Time Limit (Minutes)</label>
                          <input
                            type="number"
                            min={5}
                            max={60}
                            value={interviewTimeLimit}
                            onChange={(e) => setInterviewTimeLimit(parseInt(e.target.value) || 15)}
                            className="w-full px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-[11px] font-semibold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleStartInterview}
                          className="saas-button-primary py-2 px-3 text-xs flex-grow justify-center"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> Start
                        </button>
                        <button
                          onClick={() => setInterviewMode(false)}
                          className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setInterviewMode(true)}
                      className="w-full saas-button-primary py-2.5 text-xs justify-center"
                    >
                      Configure Mock Interview
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'roadmap' && category.roadmap.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-8">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-wider px-2">
              Topic Roadmap Progression
            </h3>

            <div className="relative pl-6 border-l border-zinc-200 dark:border-zinc-800 space-y-12 ml-2 py-2">
              {category.roadmap.map((step, idx) => (
                <div key={idx} className="relative group text-left">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-indigo-500 bg-white dark:bg-zinc-950 flex items-center justify-center">
                    <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400">{idx + 1}</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{step.title}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{step.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {step.topics.map(t => (
                        <span key={t} className="px-2.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-900/30 text-[9px] font-bold text-zinc-500">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cheatsheet' && category.cheatSheet.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-8 text-left">
            {category.cheatSheet.map((sheet, idx) => (
              <div key={idx} className="saas-card p-6 space-y-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white border-b border-zinc-200/50 dark:border-zinc-850/60 pb-2">
                  {sheet.title}
                </h3>
                <div className="text-xs sm:text-sm text-zinc-655 dark:text-zinc-400 leading-relaxed font-medium markdown-content whitespace-pre-line">
                  {sheet.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
