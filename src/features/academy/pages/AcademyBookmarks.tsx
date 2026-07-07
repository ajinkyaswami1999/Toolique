import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bookmark, 
  Trash2, 
  Download, 
  ChevronRight, 
  CheckCircle, 
  FileText
} from 'lucide-react';
import SEO from '../../../components/SEO';
import { allQuestions } from '../data/questions/qa';
import { useAcademyProgress } from '../hooks/useAcademyProgress';

export default function AcademyBookmarks() {
  const { progress, toggleBookmark, exportNotes, isSolved } = useAcademyProgress();

  // Find bookmarked question details
  const bookmarkedList = allQuestions.filter(q => 
    progress.bookmarkedQuestions.includes(q.id)
  );

  const notesCount = Object.keys(progress.notes).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 text-left">
      <SEO
        title="Saved Challenges & Notes | Toolique Academy"
        description="Review your bookmarked technical interview questions, coding challenges, and export your personal scratch notes."
      />

      {/* Back button and title header */}
      <div className="space-y-4">
        <Link 
          to="/academy"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Academy
        </Link>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">Bookmarks & Notes</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Manage your saved programming challenges and export personal notes locally.
            </p>
          </div>
          {notesCount > 0 && (
            <button
              onClick={exportNotes}
              className="saas-button-secondary text-xs flex items-center gap-1.5 shrink-0 justify-center cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export Notes ({notesCount})
            </button>
          )}
        </div>
      </div>

      {/* Bookmarked Questions List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-wider px-2">
          Saved Questions ({bookmarkedList.length})
        </h3>

        {bookmarkedList.length > 0 ? (
          <div className="saas-card overflow-hidden divide-y divide-zinc-200/50 dark:divide-zinc-850/80">
            {bookmarkedList.map(q => {
              const solved = isSolved(q.id);
              const track = q.id.startsWith('sql') ? 'sql' : q.id.startsWith('py') ? 'python' : q.id.startsWith('js') ? 'javascript' : q.id.startsWith('react') ? 'react' : 'qa';
              
              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between p-4 hover:bg-zinc-100/30 dark:hover:bg-zinc-900/20 transition group"
                >
                  <Link
                    to={`/academy/${track}/question/${q.slug}`}
                    className="flex items-center gap-3 text-left flex-grow"
                  >
                    {solved ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-zinc-350 dark:border-zinc-700 shrink-0 group-hover:border-indigo-500 transition" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-zinc-850 dark:text-zinc-250 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {q.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 text-[9px] text-zinc-455">
                        <span className="font-bold uppercase text-indigo-600 dark:text-indigo-400">{track}</span>
                        <span>•</span>
                        <span className="font-semibold">{q.topic}</span>
                        {progress.notes[q.id] && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <FileText className="w-2.5 h-2.5" /> Has Note
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => toggleBookmark(q.id)}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-500 hover:border-rose-500/20 transition cursor-pointer"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/academy/${track}/question/${q.slug}`}
                      className="p-1.5 text-zinc-400 hover:text-indigo-500 transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-3">
            <Bookmark className="w-10 h-10 text-zinc-400 mx-auto" />
            <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No Bookmarked Challenges</h4>
            <p className="text-[10px] text-zinc-455 dark:text-zinc-550 max-w-sm mx-auto leading-relaxed">
              When practicing coding or testing challenges, click the bookmark icon on any question page to save it here for quick reference.
            </p>
            <Link to="/academy" className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-755 text-white font-bold text-xs rounded-xl transition">
              Explore Practice Challenges
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
