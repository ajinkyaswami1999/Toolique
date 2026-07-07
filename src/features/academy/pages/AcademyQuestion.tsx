import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bookmark, 
  HelpCircle, 
  CheckCircle, 
  Share2, 
  Eye, 
  EyeOff, 
  BookOpen, 
  FileText,
  Clock,
  Compass,
  ArrowRight,
  Save,
  AlertTriangle,
  ChevronRight,
  Award
} from 'lucide-react';
import SEO from '../../../components/SEO';
import { sqlQuestions } from '../data/questions/sql';
import { pythonQuestions } from '../data/questions/python';
import { javascriptQuestions } from '../data/questions/javascript';
import { reactQuestions } from '../data/questions/react';
import { qaQuestions } from '../data/questions/qa';
import { useAcademyProgress } from '../hooks/useAcademyProgress';

export default function AcademyQuestion() {
  const { category: categoryId, questionSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isInterviewMode = searchParams.get('mode') === 'interview';

  const { 
    progress, 
    completeQuestion, 
    toggleBookmark, 
    saveNote, 
    isSolved, 
    isBookmarked 
  } = useAcademyProgress();

  const [revealAnswer, setRevealAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [copied, setCopied] = useState(false);
  const [scoreModal, setScoreModal] = useState(false);

  // Interview Mode states
  const [interviewSession, setInterviewSession] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Map category ID to its question list
  const getQuestions = () => {
    switch (categoryId) {
      case 'sql': return sqlQuestions;
      case 'python': return pythonQuestions;
      case 'javascript': return javascriptQuestions;
      case 'react': return reactQuestions;
      case 'qa': return qaQuestions;
      default: return [];
    }
  };

  const questions = getQuestions();
  const question = questions.find(q => q.slug === questionSlug);

  // Load notes and interview session on mount/change
  useEffect(() => {
    if (question) {
      setNoteText(progress.notes[question.id] || '');
      setRevealAnswer(false);
      setShowHint(false);
    }
  }, [questionSlug, progress.notes, question]);

  // Handle Interview Timer and Session State
  useEffect(() => {
    if (isInterviewMode) {
      const savedSession = sessionStorage.getItem('toolique_academy_interview_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          setInterviewSession(parsed);
          
          // Set initial timer count
          const currentIdx = parsed.questions.findIndex((q: any) => q.slug === questionSlug);
          if (currentIdx !== -1) {
            setTimeLeft(parsed.timeRemaining);
          }
        } catch (err) {
          console.error('Failed to parse interview session:', err);
        }
      }
    } else {
      setInterviewSession(null);
    }
  }, [questionSlug, isInterviewMode]);

  // Timer countdown hook
  useEffect(() => {
    if (!isInterviewMode || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const nextTime = prev - 1;
        if (nextTime <= 0) {
          clearInterval(timer);
          handleFinishInterview();
          return 0;
        }
        // Save time back to sessionStorage
        if (interviewSession) {
          const updated = { ...interviewSession, timeRemaining: nextTime };
          sessionStorage.setItem('toolique_academy_interview_session', JSON.stringify(updated));
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isInterviewMode, timeLeft, interviewSession]);

  if (!question) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Question Not Found</h2>
        <p className="text-zinc-500 text-xs">The challenge you are looking for does not exist or has been removed.</p>
        <Link to={`/academy/${categoryId}`} className="saas-button-primary text-xs w-full justify-center">
          Return to Track
        </Link>
      </div>
    );
  }

  const solved = isSolved(question.id);
  const bookmarked = isBookmarked(question.id);

  const handleComplete = () => {
    completeQuestion(question.id, 20); // Award 20XP
  };

  const handleSaveNote = () => {
    saveNote(question.id, noteText);
    alert('Note saved locally!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Interview actions
  const getInterviewProgressIndex = () => {
    if (!interviewSession) return 0;
    return interviewSession.questions.findIndex((q: any) => q.slug === questionSlug);
  };

  const currentQuestionIdx = getInterviewProgressIndex();

  const handleNextInterviewQuestion = () => {
    if (!interviewSession) return;
    const nextIdx = currentQuestionIdx + 1;
    if (nextIdx < interviewSession.questions.length) {
      navigate(`/academy/${categoryId}/question/${interviewSession.questions[nextIdx].slug}?mode=interview`);
    }
  };

  const handleFinishInterview = () => {
    setScoreModal(true);
  };

  const handleCloseScoreModal = () => {
    sessionStorage.removeItem('toolique_academy_interview_session');
    setScoreModal(false);
    navigate(`/academy/${categoryId}`);
  };

  // Format remaining seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Map categories to tool redirects for 'Related Tools' links
  const getRelatedToolLink = () => {
    if (categoryId === 'sql') return '/?category=developer';
    if (categoryId === 'qa') return '/?category=developer';
    if (categoryId === 'react') return '/?category=developer';
    if (categoryId === 'javascript') return '/?category=developer';
    if (categoryId === 'python') return '/?category=developer';
    return '/';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4 text-left relative">
      <SEO
        title={`${question.title} | ${categoryId?.toUpperCase()} Challenge`}
        description={`Solve the challenge: ${question.title}. Group: ${question.topic}. Practice technical questions with step-by-step explanations.`}
      />

      {/* Persistent Mock Interview Header */}
      {isInterviewMode && interviewSession && (
        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between gap-4 sticky top-18 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider">
              Mock Interview
            </div>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-350">
              Question {currentQuestionIdx + 1} of {interviewSession.questions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400 font-mono">
              <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
            </div>
            {currentQuestionIdx < interviewSession.questions.length - 1 ? (
              <button
                onClick={handleNextInterviewQuestion}
                className="saas-button-primary py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider"
              >
                Next Question <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinishInterview}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer"
              >
                Submit Interview
              </button>
            )}
          </div>
        </div>
      )}

      {/* Back button and title header */}
      <div className="space-y-4">
        {!isInterviewMode && (
          <Link 
            to={`/academy/${categoryId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to {categoryId?.toUpperCase()} Track
          </Link>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2">
              <span className={`saas-badge text-[9px] font-bold px-2.5 py-0.5 rounded border capitalize ${
                question.difficulty === 'beginner' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                  : question.difficulty === 'intermediate'
                  ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'
                  : question.difficulty === 'advanced'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600'
              }`}>
                {question.difficulty}
              </span>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">
                {question.topic}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
              {question.title}
            </h1>
          </div>

          {/* Action buttons */}
          {!isInterviewMode && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => toggleBookmark(question.id)}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  bookmarked 
                    ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500' 
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }`}
                title={bookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-indigo-500' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                title="Copy Link"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {copied && <span className="text-[10px] font-bold text-indigo-500 animate-fade-in">Copied!</span>}
            </div>
          )}
        </div>
      </div>

      {/* LeetCode style split panel grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Question Statement & Hints & Personal Notes */}
        <div className="col-span-1 lg:col-span-6 space-y-6">
          {/* Question card */}
          <div className="saas-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Challenge Description
            </h3>
            
            <div className="text-xs sm:text-sm text-zinc-655 dark:text-zinc-350 leading-relaxed font-medium markdown-content whitespace-pre-line">
              {question.question}
            </div>

            {question.sampleInput && (
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase">Examples & Cases</h4>
                <div className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850/60 bg-zinc-100/50 dark:bg-zinc-900/30 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-line text-zinc-800 dark:text-zinc-300">
                  {question.sampleInput}
                  {question.sampleOutput && (
                    <>
                      <div className="border-t border-zinc-200 dark:border-zinc-800/80 my-3 pt-3 font-semibold text-zinc-500">expected Output:</div>
                      {question.sampleOutput}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Hint Card */}
          <div className="saas-card p-6 space-y-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="w-full text-left text-xs font-bold text-zinc-800 dark:text-zinc-250 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-zinc-400" /> Need a Hint?
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline">
                {showHint ? 'Hide Hint' : 'Reveal Hint'}
              </span>
            </button>
            
            {showHint && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed bg-zinc-100/30 dark:bg-zinc-900/20 p-3 rounded-lg border border-zinc-200/30 dark:border-zinc-800/30 animate-fade-in">
                {question.hint}
              </p>
            )}
          </div>

          {/* User Notes Card */}
          {!isInterviewMode && (
            <div className="saas-card p-6 space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-wider flex items-center justify-between">
                <span>Personal Scratch Notes</span>
                <button
                  onClick={handleSaveNote}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </h3>
              <textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write personal notes, concepts, or alternate solutions. Saves locally on your device..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white/40 dark:bg-zinc-950/40 text-xs text-zinc-850 dark:text-zinc-150 font-medium placeholder-zinc-400 dark:placeholder-zinc-600 resize-none focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Right Side: Answer Revealer & Step-by-Step Explanation */}
        <div className="col-span-1 lg:col-span-6 space-y-6">
          {/* Action: Resolve and Answer Card */}
          <div className="saas-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Solution & Explanation
              </h3>
              
              {!isInterviewMode && (
                <button
                  onClick={handleComplete}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition ${
                    solved 
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-sm'
                  }`}
                  disabled={solved}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{solved ? 'Completed (+20 XP)' : 'Mark as Solved'}</span>
                </button>
              )}
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Review your solution. When ready, reveal our compiler answer and step-by-step optimization logic.
            </p>

            <button
              onClick={() => setRevealAnswer(!revealAnswer)}
              className="w-full saas-button-secondary text-xs justify-center flex items-center gap-1.5"
            >
              {revealAnswer ? (
                <>
                  <EyeOff className="w-4 h-4" /> Hide Solution
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" /> Reveal Best Solution
                </>
              )}
            </button>

            {revealAnswer && (
              <div className="space-y-5 border-t border-zinc-200/50 dark:border-zinc-850/60 pt-5 animate-fade-in">
                {/* Code Answer */}
                <div className="space-y-2 text-left">
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase">Best Practices Code</h4>
                  <div className="font-mono text-[11px] overflow-x-auto whitespace-pre-line bg-zinc-950 text-emerald-400 p-4 rounded-xl">
                    {question.answer}
                  </div>
                </div>

                {/* Explanation text */}
                <div className="space-y-2 text-left">
                  <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase">Step-by-step Breakdown</h4>
                  <div className="text-xs sm:text-sm text-zinc-655 dark:text-zinc-400 leading-relaxed font-medium markdown-content whitespace-pre-line">
                    {question.explanation}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Related Tools, Companies and Metadata Card */}
          <div className="saas-card p-6 space-y-5">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Related Resources
            </h3>

            {/* Company list asking this question */}
            {question.companies && question.companies.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[9px] font-bold text-zinc-400 dark:text-zinc-555 uppercase">Target Interview Companies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {question.companies.map(c => (
                    <span key={c} className="px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-900/30 text-[9px] font-bold text-zinc-500">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Tools & calculators */}
            <div className="space-y-2">
              <h4 className="text-[9px] font-bold text-zinc-400 dark:text-zinc-555 uppercase">Complementary Toolique tools</h4>
              <div className="flex flex-col gap-2">
                <Link
                  to={getRelatedToolLink()}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200/50 dark:border-zinc-850/60 bg-white/10 hover:border-indigo-500/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition text-xs font-bold text-zinc-700 dark:text-zinc-350 group"
                >
                  <span>Browse Web & Developer Tools</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-450 group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Score Modal/Summary for Interview Mode */}
      {scoreModal && interviewSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-8 space-y-6 text-center shadow-2xl animate-scale-in">
            <Award className="w-12 h-12 text-yellow-500 mx-auto" />
            <div className="space-y-2">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white">Mock Interview Finished!</h3>
              <p className="text-xs text-zinc-550 dark:text-zinc-400">
                You have completed the mock challenge track for {categoryId?.toUpperCase()}!
              </p>
            </div>

            <div className="bg-zinc-100/50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="block text-xl font-black text-zinc-900 dark:text-white">
                  {interviewSession.questions.length}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase">Questions Met</span>
              </div>
              <div>
                <span className="block text-xl font-black text-zinc-900 dark:text-white font-mono">
                  {formatTime(interviewSession.totalTime - timeLeft)}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase">Time Spent</span>
              </div>
            </div>

            <button
              onClick={handleCloseScoreModal}
              className="w-full saas-button-primary py-2.5 text-xs justify-center"
            >
              Finish Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
