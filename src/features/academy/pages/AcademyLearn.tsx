import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Layers, Award } from 'lucide-react';
import SEO from '../../../components/SEO';
import JoinVisualizer from '../components/JoinVisualizer';
import DataStructureVisual from '../components/DataStructureVisual';

export default function AcademyLearn() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 text-left">
      <SEO
        title="Visual Explainers & Learn Path | Toolique Academy"
        description="Master programming concepts visually. Explore interactive visualizers for SQL JOINs, Stacks, Queues, and Linked Lists."
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
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">Visual Explainers</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Interactive visual explainers to clarify technical engineering, SQL, and algorithm structures.
            </p>
          </div>
        </div>
      </div>

      {/* Explainers list stack */}
      <div className="space-y-12">
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">SQL JOIN Interactive Venn Map</h2>
          </div>
          <JoinVisualizer />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Award className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Data Structures Node Simulator</h2>
          </div>
          <DataStructureVisual />
        </section>
      </div>
    </div>
  );
}
