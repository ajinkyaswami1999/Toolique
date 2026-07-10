import { useState } from 'react';
import { Play, Lock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SkillNode {
  id: string;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master' | 'Legend';
  status: 'locked' | 'unlocked' | 'completed' | 'mastered';
  xpRequired: number;
  questionSlug?: string;
  x: number; // grid coords
  y: number;
}

export default function SkillTree({ progress }: { progress: any }) {
  const [activeTrack, setActiveTrack] = useState<'sql' | 'python' | 'javascript'>('sql');
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // SQL skill path nodes
  const sqlNodes: SkillNode[] = [
    { id: 'sql-basics', name: 'SQL Basics', difficulty: 'Beginner', status: 'completed', xpRequired: 0, x: 200, y: 50, questionSlug: 'sql-select-all' },
    { id: 'sql-filtering', name: 'Filtering Data', difficulty: 'Beginner', status: 'completed', xpRequired: 20, x: 200, y: 150, questionSlug: 'sql-filtering-where' },
    { id: 'sql-sorting', name: 'Sorting Data', difficulty: 'Beginner', status: 'unlocked', xpRequired: 40, x: 200, y: 250, questionSlug: 'sql-order-by' },
    { id: 'sql-aggregation', name: 'Aggregation Functions', difficulty: 'Intermediate', status: 'unlocked', xpRequired: 60, x: 200, y: 350, questionSlug: 'sql-group-by-department-salary' },
    { id: 'sql-join', name: 'JOIN Queries', difficulty: 'Intermediate', status: 'locked', xpRequired: 80, x: 100, y: 470, questionSlug: 'sql-left-join-customers-without-orders' },
    { id: 'sql-subqueries', name: 'Subqueries & nested SELECTs', difficulty: 'Advanced', status: 'locked', xpRequired: 100, x: 300, y: 470, questionSlug: 'sql-second-highest-salary' },
    { id: 'sql-cte', name: 'CTEs (Common Table Expressions)', difficulty: 'Advanced', status: 'locked', xpRequired: 150, x: 200, y: 580 },
    { id: 'sql-windows', name: 'Window Functions', difficulty: 'Expert', status: 'locked', xpRequired: 200, x: 200, y: 680 }
  ];

  // Python skill path nodes
  const pythonNodes: SkillNode[] = [
    { id: 'py-basics', name: 'Python syntax basics', difficulty: 'Beginner', status: 'completed', xpRequired: 0, x: 200, y: 50, questionSlug: 'python-merge-dictionaries' },
    { id: 'py-comprehensions', name: 'List Comprehensions', difficulty: 'Intermediate', status: 'unlocked', xpRequired: 40, x: 200, y: 170, questionSlug: 'python-list-comprehension-filter' },
    { id: 'py-functions', name: 'Decorators & Generators', difficulty: 'Advanced', status: 'locked', xpRequired: 100, x: 200, y: 300 }
  ];

  // Javascript skill path nodes
  const jsNodes: SkillNode[] = [
    { id: 'js-closures', name: 'Closures & Scope', difficulty: 'Intermediate', status: 'completed', xpRequired: 0, x: 200, y: 50, questionSlug: 'js-closure-counter' },
    { id: 'js-promises', name: 'Promises Implementation', difficulty: 'Advanced', status: 'unlocked', xpRequired: 50, x: 200, y: 170, questionSlug: 'js-promise-all-implementation' },
    { id: 'js-async', name: 'Async / Await flow', difficulty: 'Expert', status: 'locked', xpRequired: 120, x: 200, y: 290 }
  ];

  const getActiveNodes = () => {
    if (activeTrack === 'python') return pythonNodes;
    if (activeTrack === 'javascript') return jsNodes;
    return sqlNodes;
  };

  // Adjust nodes status dynamically based on progress completed list
  const getDynamicNodes = () => {
    const raw = getActiveNodes();
    return raw.map((node) => {
      // If completed
      const isCompleted = node.questionSlug && progress.completedQuestions.includes(node.questionSlug);
      if (isCompleted) {
        return { ...node, status: 'completed' as const };
      }
      
      // Unlock checking: if previous node in array is completed
      const idx = raw.findIndex(n => n.id === node.id);
      if (idx === 0) {
        return { ...node, status: 'unlocked' as const };
      }
      
      const prev = raw[idx - 1];
      const prevCompleted = prev.questionSlug && progress.completedQuestions.includes(prev.questionSlug);
      if (prevCompleted || prev.status === 'completed') {
        return { ...node, status: 'unlocked' as const };
      }

      return { ...node, status: 'locked' as const };
    });
  };

  const currentNodes = getDynamicNodes();

  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in') setZoomScale(prev => Math.min(prev + 0.1, 1.4));
    else setZoomScale(prev => Math.max(prev - 0.1, 0.7));
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      
      {/* Skill tree header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTrack('sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTrack === 'sql' ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20' : 'text-zinc-550'
            }`}
          >
            SQL Database Tree
          </button>
          <button
            onClick={() => setActiveTrack('python')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTrack === 'python' ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20' : 'text-zinc-550'
            }`}
          >
            Python Tree
          </button>
          <button
            onClick={() => setActiveTrack('javascript')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTrack === 'javascript' ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20' : 'text-zinc-550'
            }`}
          >
            JavaScript Tree
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-xl">
          <button onClick={() => handleZoom('out')} className="p-1 text-xs font-bold hover:text-indigo-500 cursor-pointer">-</button>
          <span className="text-[10px] text-zinc-500 font-extrabold">{Math.round(zoomScale * 100)}%</span>
          <button onClick={() => handleZoom('in')} className="p-1 text-xs font-bold hover:text-indigo-500 cursor-pointer">+</button>
        </div>
      </div>

      {/* SVG Connections overlay & Nodes Map */}
      <div className="relative w-full border border-zinc-200 dark:border-zinc-850 rounded-3xl overflow-auto bg-zinc-50/50 dark:bg-zinc-950/20 p-6 min-h-[500px] max-h-[600px] flex justify-center">
        
        <div
          className="relative transition-transform duration-300 origin-top text-center"
          style={{
            transform: `scale(${zoomScale})`,
            width: '400px',
            height: activeTrack === 'sql' ? '760px' : '400px'
          }}
        >
          {/* Animated SVG Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {currentNodes.map((node, index) => {
              if (index === 0) return null;
              
              // find parent coordinates: simply connect node[index-1] to node[index]
              const parent = currentNodes[index - 1];
              const isCompletedPath = node.status === 'completed' || parent.status === 'completed';
              
              return (
                <g key={node.id}>
                  {/* Glowing filter definition */}
                  <defs>
                    <filter id="glow-line" x="-10%" y="-10%" width="120%" height="120%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  
                  <path
                    d={`M ${parent.x} ${parent.y} L ${node.x} ${node.y}`}
                    stroke={isCompletedPath ? '#6366f1' : '#3f3f46'}
                    strokeWidth={isCompletedPath ? '3' : '2'}
                    strokeDasharray={node.status === 'locked' ? '5,5' : 'none'}
                    filter={isCompletedPath ? 'url(#glow-line)' : ''}
                    fill="none"
                    className={isCompletedPath ? 'animate-pulse' : ''}
                  />
                </g>
              );
            })}
          </svg>

          {/* Render node circles */}
          {currentNodes.map((node) => {
            const isCompleted = node.status === 'completed';
            const isUnlocked = node.status === 'unlocked';
            const isLocked = node.status === 'locked';

            return (
              <div
                key={node.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1.5"
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`
                }}
              >
                {/* Visual node circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted 
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 shadow-md shadow-indigo-500/10' 
                      : isUnlocked 
                      ? 'border-indigo-500/40 bg-zinc-900 text-white animate-pulse'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-550 opacity-60'
                  }`}
                  title={`${node.name} (${node.difficulty})`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                  )}
                </div>

                {/* Node info popup / label */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2.5 py-1 text-center shadow-md select-none w-32">
                  <h4 className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 truncate">{node.name}</h4>
                  <span className="text-[8px] font-black uppercase text-zinc-400 dark:text-zinc-500">
                    {node.difficulty}
                  </span>
                </div>

                {/* Target question router link if unlocked */}
                {isUnlocked && node.questionSlug && (
                  <Link
                    to={`/academy/${activeTrack}/question/${node.questionSlug}`}
                    className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[8px] font-black uppercase tracking-wider hover:bg-indigo-500 transition-all mt-1"
                  >
                    Solve
                  </Link>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
