import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  ArrowLeft, 
  Bookmark, 
  HelpCircle, 
  Share2, 
  FileText,
  Clock,
  Compass,
  ArrowRight,
  Save,
  AlertTriangle,
  ChevronRight,
  Award,
  Play,
  RotateCcw,
  Database,
  CheckCircle2,
  XCircle,
  Wand2,
  Code2
} from 'lucide-react';
import SEO from '../../../components/SEO';
import { sqlQuestions } from '../data/questions/sql';
import { pythonQuestions } from '../data/questions/python';
import { javascriptQuestions } from '../data/questions/javascript';
import { reactQuestions } from '../data/questions/react';
import { qaQuestions } from '../data/questions/qa';
import { useAcademyProgress } from '../hooks/useAcademyProgress';
import { getDailyQuestions } from '../utils/dailyQuestionGenerator';
import { validateSQLQuery, validateJSCode, validatePythonCode, type ValidationResult } from '../utils/validation';
import { initSqlWasm, MOCK_TABLES_METADATA } from '../utils/sqlWasmHelper';

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

  // Map category ID to its question list
  const getQuestions = () => {
    if (!categoryId) return [];
    const normalized = categoryId.toLowerCase();
    switch (normalized) {
      case 'sql': return sqlQuestions;
      case 'python': return pythonQuestions;
      case 'javascript': return javascriptQuestions;
      case 'react': return reactQuestions;
      case 'qa': return qaQuestions;
      default: return [];
    }
  };

  const questions = getQuestions();
  let question = questions.find(q => q.slug === questionSlug);
  if (!question && questionSlug && (questionSlug.includes('-daily-') || questionSlug.includes('-var-'))) {
    const dateMatch = questionSlug.match(/\d{4}-\d{2}-\d{2}/);
    if (dateMatch) {
      const dateStr = dateMatch[0];
      const dailyPool = getDailyQuestions(categoryId || '', dateStr, questions);
      question = dailyPool.find(q => q.slug === questionSlug);
    }
  }

  const [code, setCode] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [validationOutput, setValidationOutput] = useState<string[]>([]);
  const [leftTab, setLeftTab] = useState<'problem' | 'schema' | 'notes'>('problem');
  const [selectedSchemaTable, setSelectedSchemaTable] = useState<string>('Customers');
  const [schemaSampleRows, setSchemaSampleRows] = useState<any[]>([]);
  
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [copied, setCopied] = useState(false);
  const [scoreModal, setScoreModal] = useState(false);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(() => document.documentElement.classList.contains('dark'));
  const [activeOutputTab, setActiveOutputTab] = useState<'user' | 'expected'>('user');

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkTheme(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Playgrounds runtimes state
  const [db, setDb] = useState<any>(null);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Interview Mode states
  const [interviewSession, setInterviewSession] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Load question settings and starterCode
  useEffect(() => {
    if (question) {
      setCode(question.starterCode);
      setValidation(null);
      setValidationOutput([]);
      setHintLevel(0);
      setAttempts(0);
      setEarnedXp(null);
      setNoteText(progress.notes[question.id] || '');
      setRevealAnswer(false);
      setActiveOutputTab('user');

      if (categoryId === 'sql' && !db) {
        setIsLoading(true);
        initSqlWasm().then(instance => {
          setDb(instance);
          setValidationOutput(['SQLite Database mounted. Ready for queries.']);
          loadTableSample(instance, selectedSchemaTable);
        }).catch(err => {
          console.error(err);
          setValidationOutput(['Failed to mount WASM database.']);
        }).finally(() => {
          setIsLoading(false);
        });
      } else if (categoryId === 'python' && !pyodide) {
        loadPythonRuntime();
      }
    }
  }, [questionSlug, question]);

  const loadTableSample = (database: any, tableName: string) => {
    if (!database) return;
    try {
      const rows: any[] = [];
      const stmt = database.prepare(`SELECT * FROM ${tableName} LIMIT 5;`);
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      setSchemaSampleRows(rows);
    } catch (e) {
      setSchemaSampleRows([]);
    }
  };

  useEffect(() => {
    if (db && selectedSchemaTable) {
      loadTableSample(db, selectedSchemaTable);
    }
  }, [selectedSchemaTable, db]);

  const loadPythonRuntime = () => {
    setIsLoading(true);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
    script.async = true;
    script.onload = async () => {
      try {
        const runtime = await (window as any).loadPyodide();
        setPyodide(runtime);
        setValidationOutput(['Python Pyodide sandbox environment ready.']);
      } catch (err) {
        console.error(err);
        setValidationOutput(['Failed to initialize Pyodide context.']);
      } finally {
        setIsLoading(false);
      }
    };
    document.body.appendChild(script);
  };

  // Run and validate code results
  const handleValidate = useCallback(async () => {
    if (!question) return;
    setAttempts(prev => prev + 1);

    let result: ValidationResult;
    if (categoryId === 'sql') {
      result = validateSQLQuery(db, code, question.answer, question.validationRules);
    } else if (categoryId === 'python') {
      result = validatePythonCode(pyodide, code, question.functionName || '', question.testCases);
    } else {
      result = validateJSCode(code, question.functionName || '', question.testCases);
    }

    setValidation(result);
    setValidationOutput([result.message]);

    if (result.passed) {
      const base = 100;
      const hintDeduction = hintLevel * 15;
      const attemptDeduction = Math.min((attempts) * 5, 25);
      
      let score = Math.max(base - hintDeduction - attemptDeduction, 10);
      if (attempts === 0) score += 20; // First attempt bonus
      if (hintLevel === 0) score += 20; // No hints bonus
      
      setEarnedXp(score);
      completeQuestion(question.id, score);
    }
  }, [question, categoryId, db, pyodide, code, hintLevel, attempts, completeQuestion]);

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to run tests
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleValidate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleValidate]);

  // SQL Auto-Formatter
  const handleFormatSQL = () => {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 
      'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN',
      'ON', 'LIMIT', 'OFFSET', 'UNION ALL', 'UNION', 'INSERT INTO', 'VALUES',
      'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE',
      'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'OVER', 'PARTITION BY', 'AS', 'AND', 
      'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL',
      'ASC', 'DESC', 'DISTINCT', 'WITH', 'RECURSIVE', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
      'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LEAD', 'LAG'
    ];
    let formatted = code;
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw);
    });
    setCode(formatted);
  };

  // Handle Interview Timer and Session State
  useEffect(() => {
    if (isInterviewMode) {
      const savedSession = sessionStorage.getItem('toolique_academy_interview_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          setInterviewSession(parsed);
          const currentIdx = parsed.questions.findIndex((q: any) => q.slug === questionSlug);
          if (currentIdx !== -1) {
            setTimeLeft(parsed.timeRemaining);
          }
        } catch (err) {
          console.error(err);
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

  const handleSaveNote = () => {
    saveNote(question.id, noteText);
    alert('Note saved locally!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-4 text-left relative animate-fadeIn">
      <SEO
        title={`${question.title} | ${categoryId?.toUpperCase()} Challenge`}
        description={`Solve the challenge: ${question.title}. Group: ${question.topic}. Practice technical questions with step-by-step explanations.`}
      />

      {/* Persistent Mock Interview Header */}
      {isInterviewMode && interviewSession && (
        <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between gap-4 sticky top-18 z-30 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider">
              Mock Interview
            </div>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
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
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer"
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
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                {question.topic}
              </span>
              {solved && (
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Solved
                </span>
              )}
            </div>

            {/* STRICT SINGLE H1 */}
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
              {question.title}
            </h1>
          </div>

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

      {/* Split panel grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Problem Tab / Schema Explorer / Notes */}
        <div className="col-span-1 lg:col-span-5 space-y-6">
          {/* Subtabs Header */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2">
            <button
              onClick={() => setLeftTab('problem')}
              className={`py-2 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                leftTab === 'problem'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Description
            </button>

            {categoryId === 'sql' && (
              <button
                onClick={() => setLeftTab('schema')}
                className={`py-2 px-3 text-xs font-bold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                  leftTab === 'schema'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                <span>DB Schemas</span>
              </button>
            )}

            {!isInterviewMode && (
              <button
                onClick={() => setLeftTab('notes')}
                className={`py-2 px-3 text-xs font-bold transition border-b-2 cursor-pointer ${
                  leftTab === 'notes'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Scratch Notes
              </button>
            )}
          </div>

          {/* Left Tab 1: Problem Description */}
          {leftTab === 'problem' && (
            <div className="space-y-6">
              <div className="saas-card p-6 space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Challenge Description
                </h3>
                
                <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium markdown-content whitespace-pre-line">
                  {question.question}
                </div>

                {question.sampleInput && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Sample Tables &amp; Expected Cases</h4>
                    <div className="p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-850/60 bg-zinc-100/50 dark:bg-zinc-900/30 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-line text-zinc-800 dark:text-zinc-300">
                      {question.sampleInput}
                      {question.sampleOutput && (
                        <>
                          <div className="border-t border-zinc-200 dark:border-zinc-800/80 my-3 pt-3 font-semibold text-zinc-500">Expected Output:</div>
                          {question.sampleOutput}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Progressive Hint Card */}
              <div className="saas-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" /> Progressive Hints
                  </h3>
                  {hintLevel < question.progressiveHints.length && (
                    <button
                      onClick={() => setHintLevel(prev => prev + 1)}
                      className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Reveal Hint ({hintLevel + 1}/{question.progressiveHints.length})
                    </button>
                  )}
                </div>

                {hintLevel > 0 ? (
                  <div className="space-y-2">
                    {question.progressiveHints.slice(0, hintLevel).map((h, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.03] text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed scale-in">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">Hint {idx + 1}:</span>
                        {h}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400 block">Stuck? Reveal progressive hints for guidance. (Each hint incurs an XP penalty).</span>
                )}
              </div>
            </div>
          )}

          {/* Left Tab 2: Database Schema Explorer */}
          {leftTab === 'schema' && categoryId === 'sql' && (
            <div className="saas-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-500" /> Preloaded Mock Schemas
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-500">Live WASM SQLite</span>
              </div>

              {/* Table Selector Chips */}
              <div className="flex flex-wrap gap-1.5">
                {MOCK_TABLES_METADATA.map((tbl) => (
                  <button
                    key={tbl.name}
                    onClick={() => setSelectedSchemaTable(tbl.name)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      selectedSchemaTable === tbl.name
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                    }`}
                  >
                    {tbl.name}
                  </button>
                ))}
              </div>

              {/* Selected Table Columns Spec */}
              {(() => {
                const meta = MOCK_TABLES_METADATA.find(t => t.name === selectedSchemaTable) || MOCK_TABLES_METADATA[0];
                return (
                  <div className="space-y-3 pt-2">
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">{meta.name}</span>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{meta.description}</p>
                    </div>

                    <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase">
                            <th className="p-2">Column Name</th>
                            <th className="p-2">Data Type / Key</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 font-mono">
                          {meta.columns.map(c => (
                            <tr key={c.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                              <td className="p-2 font-bold text-indigo-600 dark:text-indigo-400">{c.name}</td>
                              <td className="p-2 text-zinc-500">{c.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Sample Table Rows Preview */}
                    {schemaSampleRows.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">First 5 Sample Tuples in {meta.name}:</span>
                        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl text-[10px]">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
                                {Object.keys(schemaSampleRows[0]).map(k => (
                                  <th key={k} className="p-1.5 font-bold uppercase">{k}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 font-mono">
                              {schemaSampleRows.map((r, idx) => (
                                <tr key={idx}>
                                  {Object.values(r).map((v: any, cIdx) => (
                                    <td key={cIdx} className="p-1.5 text-zinc-700 dark:text-zinc-300">
                                      {v === null ? 'NULL' : String(v)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Left Tab 3: User Notes Card */}
          {leftTab === 'notes' && !isInterviewMode && (
            <div className="saas-card p-6 space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>Personal Scratch Notes</span>
                <button
                  onClick={handleSaveNote}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </h3>
              <textarea
                rows={6}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write personal notes, concepts, or alternate solutions. Saves locally on your device..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white/40 dark:bg-zinc-950/40 text-xs text-zinc-800 dark:text-zinc-200 font-medium placeholder-zinc-400 dark:placeholder-zinc-600 resize-none focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Right Side: Monaco Code Editor & Live Table Verification */}
        <div className="col-span-1 lg:col-span-7 space-y-6">
          {/* Interactive Monaco Editor panel */}
          <div className="saas-card p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-500" />
                <span>Interactive Code Sandbox</span>
              </span>

              <div className="flex items-center gap-2">
                {categoryId === 'sql' && (
                  <button
                    onClick={handleFormatSQL}
                    className="p-1.5 px-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Format SQL Keywords"
                  >
                    <Wand2 className="w-3 h-3 text-amber-500" />
                    <span>Format</span>
                  </button>
                )}

                <button
                  onClick={() => setCode(question.starterCode)}
                  className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                  title="Reset to Starter Code"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleValidate}
                  disabled={isLoading}
                  className="saas-button-primary py-1.5 px-4 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Run Tests</span>
                  <span className="hidden sm:inline text-[9px] opacity-70 font-mono font-normal">(Ctrl+↵)</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-850 overflow-hidden shadow-sm">
              <Editor
                height="280px"
                language={categoryId === 'sql' ? 'sql' : categoryId === 'python' ? 'python' : 'javascript'}
                value={code}
                onChange={(val: string | undefined) => setCode(val || '')}
                theme={isDarkTheme ? 'vs-dark' : 'light'}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: 'Fira Code, monospace',
                  automaticLayout: true,
                  scrollBeyondLastLine: false
                }}
              />
            </div>
          </div>

          {/* Validation Banner results */}
          {validation && (
            <div className={`p-5 rounded-2xl border ${
              validation.passed 
                ? 'border-emerald-500/20 bg-emerald-500/[0.03] text-emerald-600'
                : 'border-rose-500/20 bg-rose-500/[0.03] text-rose-600'
            } space-y-3`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  {validation.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                  <span>Test Suite Feedback</span>
                </h4>
                {validation.passed && earnedXp !== null && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 bg-emerald-500/15 rounded-md text-emerald-600">
                    +{earnedXp} XP Awarded!
                  </span>
                )}
              </div>
              
              <div className="text-xs font-bold leading-relaxed">{validation.message}</div>

              {/* SQL Result Table View */}
              {categoryId === 'sql' && (validation.userRows || validation.officialRows) && (
                <div className="space-y-3 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => setActiveOutputTab('user')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        activeOutputTab === 'user'
                          ? 'bg-zinc-800 text-white dark:bg-white dark:text-zinc-900'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      Your Query Output ({validation.userRows?.length || 0} rows)
                    </button>

                    {validation.officialRows && (
                      <button
                        onClick={() => setActiveOutputTab('expected')}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                          activeOutputTab === 'expected'
                            ? 'bg-zinc-800 text-white dark:bg-white dark:text-zinc-900'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        Expected Output ({validation.officialRows.length} rows)
                      </button>
                    )}
                  </div>

                  {/* Render Tabular Data */}
                  {(() => {
                    const rowsToRender = activeOutputTab === 'user' ? validation.userRows : validation.officialRows;
                    if (!rowsToRender || rowsToRender.length === 0) {
                      return (
                        <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs text-center font-mono">
                          Empty result set (0 rows).
                        </div>
                      );
                    }
                    const cols = Object.keys(rowsToRender[0] || {});
                    return (
                      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl max-h-48 text-[11px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase text-[10px]">
                              {cols.map(c => (
                                <th key={c} className="p-2.5 whitespace-nowrap">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 font-mono">
                            {rowsToRender.map((row, idx) => (
                              <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                                {Object.values(row).map((val: any, cIdx) => (
                                  <td key={cIdx} className="p-2.5 whitespace-nowrap text-zinc-800 dark:text-zinc-200">
                                    {val === null ? <span className="text-zinc-400 italic">NULL</span> : String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Individual non-SQL test cases */}
              {validation.testCaseResults && (
                <div className="space-y-1.5 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
                  {validation.testCaseResults.map((tc, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] font-medium font-mono">
                      <span>Test Case {idx + 1}: expected {tc.expected}</span>
                      <span className={tc.passed ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                        {tc.passed ? '✓ Passed' : `✗ Failed (got ${tc.actual})`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Console Log feedback */}
          {validationOutput.length > 0 && (
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-400 font-mono text-[11px] min-h-[4rem] max-h-32 overflow-y-auto space-y-1">
              <div className="text-[10px] font-bold text-zinc-500 border-b border-zinc-900 pb-1 mb-2">Console log output:</div>
              {validationOutput.map((log, index) => (
                <div key={index} className="leading-relaxed whitespace-pre-wrap">{log}</div>
              ))}
            </div>
          )}

          {/* Solutions tabs comparison visualizer */}
          {solved && (
            <div className="saas-card p-6 space-y-5 animate-fade-in">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>Code Comparison Panel</span>
                <button
                  onClick={() => setRevealAnswer(!revealAnswer)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-bold"
                >
                  {revealAnswer ? 'Hide Comparison' : 'Compare Solutions'}
                </button>
              </h3>

              {revealAnswer && (
                <div className="space-y-4 border-t border-zinc-200/50 dark:border-zinc-850/60 pt-4 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* User Code */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-zinc-400 uppercase block">Your Code Submission</span>
                      <pre className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 font-mono text-[10px] overflow-x-auto border border-zinc-200/40 dark:border-zinc-800/40 leading-relaxed text-zinc-800 dark:text-zinc-200">
                        {code}
                      </pre>
                    </div>

                    {/* Recommended Code */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-emerald-500 uppercase block">Recommended Solution</span>
                      <pre className="p-3 rounded-lg bg-emerald-500/5 font-mono text-[10px] overflow-x-auto border border-emerald-500/10 leading-relaxed text-zinc-800 dark:text-zinc-200">
                        {question.answer}
                      </pre>
                    </div>
                  </div>

                  {/* Optimized Solution */}
                  {question.optimizedAnswer && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-indigo-500 uppercase block">Optimized Alternative</span>
                      <pre className="p-3 rounded-lg bg-indigo-500/5 font-mono text-[10px] overflow-x-auto border border-indigo-500/10 leading-relaxed text-zinc-800 dark:text-zinc-200">
                        {question.optimizedAnswer}
                      </pre>
                    </div>
                  )}

                  {/* Explanation text */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
                    <span className="text-[9px] font-black text-zinc-400 uppercase block">Optimization Breakdown</span>
                    <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium markdown-content whitespace-pre-line">
                      {question.explanation}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Related Tools, Companies and Metadata Card */}
          <div className="saas-card p-6 space-y-5">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Related Resources
            </h3>

            {question.companies && question.companies.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Target Interview Companies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {question.companies.map(c => (
                    <span key={c} className="px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-850 bg-zinc-100/50 dark:bg-zinc-900/30 text-[9px] font-bold text-zinc-500">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Complementary Toolique tools</h4>
              <div className="flex flex-col gap-2">
                <Link
                  to="/?category=developer"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200/50 dark:border-zinc-850/60 bg-white/10 hover:border-indigo-500/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition text-xs font-bold text-zinc-700 dark:text-zinc-300 group"
                >
                  <span>Browse Web &amp; Developer Tools</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition" />
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
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                You have completed the mock challenge track for {categoryId?.toUpperCase()}!
              </p>
            </div>

            <div className="bg-zinc-100/50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="block text-xl font-black text-zinc-900 dark:text-white">
                  {interviewSession.questions.length}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Questions Met</span>
              </div>
              <div>
                <span className="block text-xl font-black text-zinc-900 dark:text-white font-mono">
                  {formatTime(interviewSession.totalTime - timeLeft)}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Time Spent</span>
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
