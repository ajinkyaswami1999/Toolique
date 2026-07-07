import { Link } from 'react-router-dom';
import { ArrowLeft, Terminal } from 'lucide-react';
import SEO from '../../../components/SEO';
import SQLPlayground from '../components/SQLPlayground';

export default function AcademyPlayground() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 text-left">
      <SEO
        title="Interactive Playgrounds Sandbox | Toolique Academy"
        description="Write and execute SQL queries, JavaScript scripts, and Python code in the browser with full console output logs and query history tracking."
      />

      {/* Back button and title header */}
      <div className="space-y-4">
        <Link 
          to="/academy"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Academy
        </Link>
        <div className="flex items-center gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-6">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Terminal className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">Code Playground</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Sandbox compilation engine to execute SQL, JS, and Python queries client-side.
            </p>
          </div>
        </div>
      </div>

      {/* Playgrounds console rendering */}
      <div className="saas-card p-6">
        <SQLPlayground />
      </div>
    </div>
  );
}
