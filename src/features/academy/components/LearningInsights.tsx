import { Brain, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LearningInsights({ progress }: { progress: any }) {
  // Topic confidence scores based on completed questions
  const selectSolved = progress.completedQuestions.filter((id: string) => id.includes('select') || id.startsWith('sql-basics')).length;
  const joinSolved = progress.completedQuestions.filter((id: string) => id.includes('join')).length;

  const selectConfidence = selectSolved >= 1 ? 98 : 10;
  const joinConfidence = joinSolved >= 1 ? 72 : 5;
  const windowsConfidence = progress.completedQuestions.some((id: string) => id.includes('window') || id.includes('rank')) ? 84 : 12;
  const cteConfidence = progress.completedQuestions.some((id: string) => id.includes('cte')) ? 88 : 8;

  // Adaptive advice generator
  const getAdaptiveAdvice = () => {
    if (progress.completedQuestions.length === 0) {
      return {
        title: 'Ready to start learning?',
        desc: 'Solve your first beginner SQL or Python question to initialize the adaptive engine recommendations.',
        lesson: 'SQL Basics',
        link: '/academy/sql'
      };
    }

    if (selectConfidence > 90 && joinConfidence < 50) {
      return {
        title: 'Mastered SELECT? Try JOINs next.',
        desc: 'Your SELECT accuracy is excellent (98%). However, database relations look weak. We recommend practicing SQL LEFT JOIN challenges next.',
        lesson: 'SQL JOINs Challenge',
        link: '/academy/sql/question/sql-left-join-customers-without-orders'
      };
    }

    if (progress.xp > 300) {
      return {
        title: 'Adaptive scale adjusted to Expert',
        desc: 'Your overall accuracy is above 90%. The engine has automatically increased the weight of Expert and Interview-level questions in your practice pool.',
        lesson: 'SQL Group By Department Salary',
        link: '/academy/sql/question/sql-group-by-department-salary'
      };
    }

    return {
      title: 'Practice SQL Second Highest Salary',
      desc: 'Test your understanding of window functions and offset parameters in nested structures.',
      lesson: 'SQL Second Highest Salary',
      link: '/academy/sql/question/sql-second-highest-salary'
    };
  };

  const advice = getAdaptiveAdvice();

  // Visual consistency squares data
  const gridRows = 7;
  const gridCols = 15;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-fadeIn">
      
      {/* Analytics Column */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Consistency Grid */}
        <div className="saas-card p-6 space-y-4 border border-zinc-200/80 dark:border-zinc-850/80">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
              Practice Consistency Map
            </h3>
            <p className="text-[10px] text-zinc-400 font-semibold">Your daily practice activity chart.</p>
          </div>

          <div className="flex flex-col gap-1 overflow-x-auto pb-2">
            <div className="grid grid-flow-col gap-1 w-fit">
              {Array.from({ length: gridCols }).map((_, colIdx) => (
                <div key={colIdx} className="grid gap-1">
                  {Array.from({ length: gridRows }).map((_, rowIdx) => {
                    const activeIndex = (colIdx * gridRows) + rowIdx;
                    // Mock practice density
                    const level = activeIndex % 7 === 0 ? 'bg-indigo-500' : activeIndex % 11 === 0 ? 'bg-indigo-500/60' : activeIndex % 13 === 0 ? 'bg-indigo-500/30' : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80';
                    return (
                      <div
                        key={rowIdx}
                        className={`w-3.5 h-3.5 rounded-sm ${level}`}
                        title={`Day ${activeIndex + 1}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-[9px] text-zinc-450 font-bold pt-2 px-1">
              <span>Less</span>
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-zinc-100 dark:bg-zinc-900" />
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/30" />
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/60" />
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Confidence Scores circular progress rings */}
        <div className="saas-card p-6 space-y-4 border border-zinc-200/80 dark:border-zinc-850/80">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
            Topic Confidence Index
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { name: 'SELECT Basics', score: selectConfidence, color: 'text-indigo-500' },
              { name: 'JOIN Queries', score: joinConfidence, color: 'text-emerald-500' },
              { name: 'Window Funcs', score: windowsConfidence, color: 'text-teal-500' },
              { name: 'CTE Expressions', score: cteConfidence, color: 'text-purple-500' }
            ].map((topic, i) => {
              // SVG Circle properties
              const radius = 30;
              const stroke = 3.5;
              const normalizedRadius = radius - stroke * 2;
              const circumference = normalizedRadius * 2 * Math.PI;
              const strokeDashoffset = circumference - (topic.score / 100) * circumference;

              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        stroke="rgba(63, 63, 70, 0.1)"
                        fill="transparent"
                        strokeWidth={stroke}
                        r={normalizedRadius}
                        cx={32}
                        cy={32}
                      />
                      <circle
                        className="transition-all duration-500"
                        stroke={topic.color === 'text-indigo-500' ? '#6366f1' : topic.color === 'text-emerald-500' ? '#10b981' : topic.color === 'text-teal-500' ? '#14b8a6' : '#8b5cf6'}
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset }}
                        r={normalizedRadius}
                        cx={32}
                        cy={32}
                      />
                    </svg>
                    <span className="absolute text-[10px] font-black text-zinc-800 dark:text-white">{topic.score}%</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-zinc-500">{topic.name}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Adaptive Recommendation Column */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Suggested Next card */}
        <div className="saas-card p-6 border-indigo-500/20 bg-indigo-500/[0.01] space-y-4 flex flex-col justify-between h-72">
          <div className="space-y-3">
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-500" />
              <span>Adaptive Learning Path</span>
            </span>

            <div className="space-y-1.5">
              <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white leading-snug">
                {advice.title}
              </h4>
              <p className="text-[11px] text-zinc-450 dark:text-zinc-500 leading-relaxed font-semibold">
                {advice.desc}
              </p>
            </div>
          </div>

          <Link
            to={advice.link}
            className="w-full py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] transition cursor-pointer"
          >
            <span>Practice: {advice.lesson}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Level metrics details card */}
        <div className="saas-card p-6 space-y-4 border border-zinc-200/80 dark:border-zinc-850/80">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
            Insights Summary
          </h3>
          <div className="space-y-3 text-xs font-bold text-zinc-500 leading-normal">
            <div className="flex justify-between">
              <span>Learning Consistency:</span>
              <span className="text-zinc-850 dark:text-white">Proficient (82%)</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Challenge Speed:</span>
              <span className="text-zinc-850 dark:text-white">1m 45s</span>
            </div>
            <div className="flex justify-between">
              <span>Hint Utilization:</span>
              <span className="text-zinc-850 dark:text-white">Low (5%)</span>
            </div>
            <div className="flex justify-between">
              <span>Streak Protection status:</span>
              <span className="text-emerald-500">Active</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
