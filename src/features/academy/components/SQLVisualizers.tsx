import { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  GitBranch, 
  Database, 
  Layers, 
  Table, 
  Terminal, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { initSqlWasm, MOCK_TABLES_METADATA } from '../utils/sqlWasmHelper';

// ----------------------------------------------------------------------------
// 1. SQL LOGICAL QUERY EXECUTION LIFECYCLE SIMULATOR
// ----------------------------------------------------------------------------
export function SQLExecutionLifecycleVisualizer() {
  const steps = [
    {
      step: 1,
      clause: 'FROM & JOIN',
      title: '1. Identification of Base Tables & Cartesian Joins',
      desc: 'The database engine evaluates candidate tables, performs JOIN matches on foreign keys, and builds the initial working virtual table.',
      sampleRows: [
        { id: 1, name: 'Alice', dept: 'Engineering', salary: 95000, state: 'active' },
        { id: 2, name: 'Bob', dept: 'Engineering', salary: 65000, state: 'active' },
        { id: 3, name: 'Charlie', dept: 'Sales', salary: 80000, state: 'inactive' },
        { id: 4, name: 'David', dept: 'Sales', salary: 92000, state: 'active' },
        { id: 5, name: 'Eve', dept: 'Engineering', salary: 110000, state: 'active' }
      ],
      codeSnippet: `FROM Employees e\nJOIN Departments d ON e.dept_id = d.id`
    },
    {
      step: 2,
      clause: 'WHERE',
      title: '2. Row-Level Predicate Filtering',
      desc: 'Filters out individual rows that do NOT satisfy the boolean predicate (state = "active" AND salary >= 70000) before any grouping occurs.',
      sampleRows: [
        { id: 1, name: 'Alice', dept: 'Engineering', salary: 95000, state: 'active' },
        { id: 4, name: 'David', dept: 'Sales', salary: 92000, state: 'active' },
        { id: 5, name: 'Eve', dept: 'Engineering', salary: 110000, state: 'active' }
      ],
      codeSnippet: `WHERE e.state = 'active' AND e.salary >= 70000`
    },
    {
      step: 3,
      clause: 'GROUP BY',
      title: '3. Partitioning into Aggregate Buckets',
      desc: 'Consolidates remaining rows into distinct departmental partitions for summary aggregations.',
      sampleRows: [
        { dept: 'Engineering', count: 2, avg_salary: 102500, max_salary: 110000 },
        { dept: 'Sales', count: 1, avg_salary: 92000, max_salary: 92000 }
      ],
      codeSnippet: `GROUP BY d.dept_name`
    },
    {
      step: 4,
      clause: 'HAVING',
      title: '4. Group-Level Aggregate Filtering',
      desc: 'Filters aggregate buckets. Only departments with COUNT(*) >= 2 survive to the projection phase.',
      sampleRows: [
        { dept: 'Engineering', count: 2, avg_salary: 102500, max_salary: 110000 }
      ],
      codeSnippet: `HAVING COUNT(*) >= 2`
    },
    {
      step: 5,
      clause: 'SELECT',
      title: '5. Column Projection & Analytical Expressions',
      desc: 'Computes output expressions, aliases, mathematical calculations, and evaluates window functions.',
      sampleRows: [
        { Department: 'Engineering', HighEarners: 2, AvgCompensation: 102500 }
      ],
      codeSnippet: `SELECT d.dept_name AS Department, COUNT(*) AS HighEarners, ROUND(AVG(e.salary), 0) AS AvgCompensation`
    },
    {
      step: 6,
      clause: 'ORDER BY & LIMIT',
      title: '6. Ordering & Boundary Slicing',
      desc: 'Sorts the final projected dataset by specified keys (DESC/ASC) and slices the top N records.',
      sampleRows: [
        { Department: 'Engineering', HighEarners: 2, AvgCompensation: 102500 }
      ],
      codeSnippet: `ORDER BY AvgCompensation DESC\nLIMIT 10;`
    }
  ];

  const [activeStep, setActiveStep] = useState<number>(0);

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">SQL Logical Execution Lifecycle Pipeline</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step through the exact 6-phase logical execution pipeline an RDBMS engine runs for every query.
          </p>
        </div>
      </div>

      {/* Interactive Step Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
        {steps.map((s, idx) => (
          <button
            key={s.step}
            type="button"
            onClick={() => setActiveStep(idx)}
            className={`py-2 px-2 rounded-xl text-center transition cursor-pointer ${
              activeStep === idx
                ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 font-black shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-xs'
            }`}
          >
            <span className="block text-[9px] uppercase tracking-wider text-slate-400">Step {s.step}</span>
            <span className="text-xs font-black truncate">{s.clause}</span>
          </button>
        ))}
      </div>

      {/* Step Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-850/60 space-y-2">
            <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
              Logical Phase {activeStep + 1} of 6
            </span>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">
              {steps[activeStep].title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {steps[activeStep].desc}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs border border-slate-800">
            <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">SQL Clause Evaluation:</span>
            <pre className="text-indigo-300 whitespace-pre-wrap">{steps[activeStep].codeSnippet}</pre>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={activeStep === 0}
              onClick={() => setActiveStep(prev => prev - 1)}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              Previous Phase
            </button>
            <button
              type="button"
              disabled={activeStep === steps.length - 1}
              onClick={() => setActiveStep(prev => prev + 1)}
              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-40 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              Next Phase &rarr;
            </button>
          </div>
        </div>

        {/* Live Virtual Table State */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold px-1">
            <span className="text-slate-600 dark:text-slate-400">Virtual Dataset State in Buffer Pool</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-mono">{steps[activeStep].sampleRows.length} Row(s) Active</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl max-h-64 shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  {Object.keys(steps[activeStep].sampleRows[0]).map((col) => (
                    <th key={col} className="p-2.5 font-bold uppercase text-[10px] tracking-wider">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {steps[activeStep].sampleRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    {Object.values(row).map((val: any, cellIdx) => (
                      <td key={cellIdx} className="p-2.5 font-mono text-slate-800 dark:text-slate-200 font-medium">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 2. B+ TREE INDEX SEEK VS SEQUENTIAL SCAN VISUALIZER
// ----------------------------------------------------------------------------
export function SQLBTreeVisualizer() {
  const [targetKey, setTargetKey] = useState<number>(42);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [mode, setMode] = useState<'btree' | 'table_scan'>('btree');

  const btreeStructure = {
    leafPages: [
      { id: 'leaf_1', range: '[1..29]', keys: [5, 12, 18, 25], branchId: 'leftBranch' },
      { id: 'leaf_2', range: '[30..44]', keys: [32, 38, 42, 44], branchId: 'midBranch' },
      { id: 'leaf_3', range: '[45..59]', keys: [47, 51, 55, 58], branchId: 'midBranch' },
      { id: 'leaf_4', range: '[60..90]', keys: [63, 72, 85, 90], branchId: 'rightBranch' }
    ]
  };

  const handleRunSearch = () => {
    if (mode === 'btree') {
      const targetLeaf = btreeStructure.leafPages.find(l => l.keys.includes(targetKey)) || btreeStructure.leafPages[1];
      setVisitedNodes(['root', targetLeaf.branchId, targetLeaf.id]);
    } else {
      setVisitedNodes(['leaf_1', 'leaf_2', 'leaf_3', 'leaf_4']);
    }
  };

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">B+ Tree Index Seek vs Full Table Scan</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize how clustered B+ Tree index pointers locate target rows in O(log N) page I/O operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Target ID:</span>
          <select
            value={targetKey}
            onChange={(e) => {
              setTargetKey(Number(e.target.value));
              setVisitedNodes([]);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          >
            {[18, 42, 55, 85].map((k) => (
              <option key={k} value={k}>
                ID = {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 text-xs">
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl shrink-0">
          <button
            type="button"
            onClick={() => { setMode('btree'); setVisitedNodes([]); }}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
              mode === 'btree'
                ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            B+ Tree Index Seek
          </button>
          <button
            type="button"
            onClick={() => { setMode('table_scan'); setVisitedNodes([]); }}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
              mode === 'table_scan'
                ? 'bg-white dark:bg-slate-950 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Seq Table Scan
          </button>
        </div>

        <button
          type="button"
          onClick={handleRunSearch}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Execute Plan ({mode === 'btree' ? 'Index Seek' : 'Seq Scan'})</span>
        </button>
      </div>

      {/* Visual B+ Tree Diagram */}
      <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center">
        {/* Level 0: Root */}
        <div className="flex justify-center">
          <div className={`p-3 rounded-2xl border transition-all ${
            visitedNodes.includes('root') 
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 shadow-md scale-105' 
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
          }`}>
            <span className="block text-[9px] font-bold text-slate-400 uppercase">Root Page (Level 0)</span>
            <span className="font-mono font-black text-xs">[ Keys: 30 | 60 ]</span>
          </div>
        </div>

        {/* Pointer Lines */}
        <div className="text-slate-300 dark:text-slate-700 font-mono text-xs">▼ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ▼ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ▼</div>

        {/* Level 1: Internal Branches */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto">
          {[
            { id: 'leftBranch', label: 'Branch 1 (< 30)', keys: '[10 | 20]' },
            { id: 'midBranch', label: 'Branch 2 (30-60)', keys: '[40 | 50]' },
            { id: 'rightBranch', label: 'Branch 3 (> 60)', keys: '[70 | 80]' }
          ].map(branch => {
            const isVisited = visitedNodes.includes(branch.id);
            return (
              <div key={branch.id} className={`p-2.5 rounded-2xl border transition-all ${
                isVisited
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 shadow-md scale-105'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}>
                <span className="block text-[8px] font-bold text-slate-400 uppercase">{branch.label}</span>
                <span className="font-mono font-black text-[11px]">{branch.keys}</span>
              </div>
            );
          })}
        </div>

        {/* Pointer Lines */}
        <div className="text-slate-300 dark:text-slate-700 font-mono text-xs">▼ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ▼ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ▼ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ▼</div>

        {/* Level 2: Leaf Data Pages (Clustered Data) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {btreeStructure.leafPages.map((leaf) => {
            const isVisited = visitedNodes.includes(leaf.id);
            const hasTarget = leaf.keys.includes(targetKey);
            return (
              <div key={leaf.id} className={`p-3 rounded-2xl border text-left transition-all ${
                isVisited && hasTarget
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 shadow-md ring-2 ring-emerald-500/30 scale-105'
                  : isVisited
                  ? 'border-rose-400 bg-rose-500/10 text-rose-600'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{leaf.id}</span>
                  <span className="text-[8px] font-mono text-indigo-500">{leaf.range}</span>
                </div>
                <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                  {leaf.keys.map(k => (
                    <span key={k} className={`px-1.5 py-0.5 rounded font-bold ${
                      k === targetKey && isVisited
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Footnote */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Search Method</span>
          <span className="block font-black text-slate-900 dark:text-white mt-0.5">{mode === 'btree' ? 'Clustered Index Seek' : 'Sequential Table Scan'}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Page I/O Reads</span>
          <span className="block font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{mode === 'btree' ? '2 Buffer Pages' : '4 Buffer Pages (Full Scan)'}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Algorithmic Cost</span>
          <span className="block font-mono font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{mode === 'btree' ? 'O(log N)' : 'O(N)'}</span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 3. WINDOW FUNCTION (ROW_NUMBER vs RANK vs DENSE_RANK) VISUALIZER
// ----------------------------------------------------------------------------
export function SQLWindowFunctionVisualizer() {
  const dataset = [
    { id: 1, name: 'Alice', dept: 'IT', salary: 90000, rowNum: 1, rank: 1, denseRank: 1, lag: 'NULL', lead: '90000' },
    { id: 2, name: 'Bob', dept: 'IT', salary: 90000, rowNum: 2, rank: 1, denseRank: 1, lag: '90000', lead: '75000' },
    { id: 3, name: 'Charlie', dept: 'IT', salary: 75000, rowNum: 3, rank: 3, denseRank: 2, lag: '90000', lead: '60000' },
    { id: 4, name: 'David', dept: 'IT', salary: 60000, rowNum: 4, rank: 4, denseRank: 3, lag: '75000', lead: 'NULL' }
  ];

  const [selectedFunc, setSelectedFunc] = useState<'all' | 'row_number' | 'rank' | 'dense_rank' | 'lag_lead'>('all');

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">Window Functions Matrix Masterclass</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare how ROW_NUMBER(), RANK(), DENSE_RANK(), and LEAD/LAG handle ties within partition windows.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl shrink-0">
          {(['all', 'row_number', 'rank', 'dense_rank', 'lag_lead'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedFunc(tab)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                selectedFunc === tab
                  ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Table View */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <th className="p-3 font-bold">Employee</th>
              <th className="p-3 font-bold">Dept</th>
              <th className="p-3 font-bold">Salary</th>
              {(selectedFunc === 'all' || selectedFunc === 'row_number') && (
                <th className="p-3 font-bold text-indigo-600 dark:text-indigo-400">ROW_NUMBER()</th>
              )}
              {(selectedFunc === 'all' || selectedFunc === 'rank') && (
                <th className="p-3 font-bold text-amber-600 dark:text-amber-400">RANK() (With Gaps)</th>
              )}
              {(selectedFunc === 'all' || selectedFunc === 'dense_rank') && (
                <th className="p-3 font-bold text-emerald-600 dark:text-emerald-400">DENSE_RANK() (No Gaps)</th>
              )}
              {(selectedFunc === 'all' || selectedFunc === 'lag_lead') && (
                <>
                  <th className="p-3 font-bold text-purple-600 dark:text-purple-400">LAG(salary, 1)</th>
                  <th className="p-3 font-bold text-pink-600 dark:text-pink-400">LEAD(salary, 1)</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
            {dataset.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-mono">
                <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">{row.name}</td>
                <td className="p-3 text-slate-500">{row.dept}</td>
                <td className="p-3 font-bold text-slate-800 dark:text-slate-200">${row.salary.toLocaleString()}</td>
                {(selectedFunc === 'all' || selectedFunc === 'row_number') && (
                  <td className="p-3 text-indigo-600 dark:text-indigo-400 font-black">{row.rowNum}</td>
                )}
                {(selectedFunc === 'all' || selectedFunc === 'rank') && (
                  <td className="p-3 text-amber-600 dark:text-amber-400 font-black">{row.rank}</td>
                )}
                {(selectedFunc === 'all' || selectedFunc === 'dense_rank') && (
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-black">{row.denseRank}</td>
                )}
                {(selectedFunc === 'all' || selectedFunc === 'lag_lead') && (
                  <>
                    <td className="p-3 text-purple-600 dark:text-purple-400">{row.lag}</td>
                    <td className="p-3 text-pink-600 dark:text-pink-400">{row.lead}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Key Interview Takeaway:</span>
        Alice and Bob have the exact same salary ($90,000). Notice how <strong>RANK()</strong> assigns both rank 1, but creates a gap skipping rank 2 directly to 3. <strong>DENSE_RANK()</strong> assigns both rank 1 and smoothly continues to rank 2 without any skipped numbering.
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 4. ACID TRANSACTIONS & ISOLATION LEVEL MATRIX
// ----------------------------------------------------------------------------
export function SQLIsolationLevelsVisualizer() {
  const levels = [
    {
      name: 'Read Uncommitted',
      dirtyRead: 'Allowed (Danger)',
      nonRepeatable: 'Allowed',
      phantomRead: 'Allowed',
      perf: 'Fastest',
      desc: 'Transactions can read data rows that are currently being modified by other uncommitted transactions.'
    },
    {
      name: 'Read Committed (Postgres / Oracle Default)',
      dirtyRead: 'Prevented',
      nonRepeatable: 'Allowed',
      phantomRead: 'Allowed',
      perf: 'Fast & Balanced',
      desc: 'Guarantees that any data read was committed prior to the read query start.'
    },
    {
      name: 'Repeatable Read (MySQL InnoDB Default)',
      dirtyRead: 'Prevented',
      nonRepeatable: 'Prevented',
      phantomRead: 'Prevented (via Next-Key Locks)',
      perf: 'High Consistency',
      desc: 'Re-reading identical rows in the same transaction guarantees the exact same values using MVCC snapshots.'
    },
    {
      name: 'Serializable',
      dirtyRead: 'Prevented',
      nonRepeatable: 'Prevented',
      phantomRead: 'Prevented',
      perf: 'Strict / High Locking',
      desc: 'Completely isolates transactions as if they were executed in a strict sequential order.'
    }
  ];

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-6 text-left">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-indigo-500" />
        <h3 className="text-base font-black text-slate-900 dark:text-white">ACID Transactions &amp; Isolation Levels Matrix</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {levels.map((lvl) => (
          <div key={lvl.name} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">{lvl.name}</h4>
                <span className="text-[10px] font-bold text-indigo-500">{lvl.perf}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{lvl.desc}</p>

            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
              <div>
                <span className="text-slate-400 block font-bold">Dirty Read:</span>
                <span className={`font-black ${lvl.dirtyRead.includes('Allowed') ? 'text-rose-500' : 'text-emerald-500'}`}>{lvl.dirtyRead}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Non-Repeat:</span>
                <span className={`font-black ${lvl.nonRepeatable === 'Allowed' ? 'text-rose-500' : 'text-emerald-500'}`}>{lvl.nonRepeatable}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Phantom:</span>
                <span className={`font-black ${lvl.phantomRead === 'Allowed' ? 'text-rose-500' : 'text-emerald-500'}`}>{lvl.phantomRead}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 5. DATABASE NORMALIZATION (1NF, 2NF, 3NF, BCNF) VISUALIZER
// ----------------------------------------------------------------------------
export function SQLNormalizationVisualizer() {
  const [stage, setStage] = useState<'unnormalized' | '1nf' | '2nf' | '3nf' | 'bcnf'>('1nf');

  const stagesData = {
    unnormalized: {
      name: 'Unnormalized Form (UNF)',
      badge: 'Anomalies Present',
      rule: 'Multiple values stored in a single column (repeating groups). High redundancy and update anomalies.',
      tables: [
        {
          title: 'Student_Course_Registration (Violates 1NF)',
          headers: ['StudentID', 'Name', 'Department', 'Courses (Non-Atomic)', 'Professors'],
          rows: [
            ['101', 'Ajinkya', 'Computer Science', 'CS101, CS202, CS303', 'Dr. Smith, Dr. Rao'],
            ['102', 'Priya', 'Electrical Eng', 'EE101, EE204', 'Dr. Adams, Dr. Taylor']
          ]
        }
      ]
    },
    '1nf': {
      name: 'First Normal Form (1NF)',
      badge: 'Atomic Values',
      rule: 'All column values are atomic (indivisible). No repeating groups or array values. Primary Key: (StudentID, CourseID).',
      tables: [
        {
          title: 'Enrollments_1NF (Atomic Rows)',
          headers: ['StudentID (PK)', 'CourseID (PK)', 'Name', 'Dept', 'DeptHead', 'CourseName', 'Credits'],
          rows: [
            ['101', 'CS101', 'Ajinkya', 'CS', 'Dr. Turing', 'Algorithms', '4'],
            ['101', 'CS202', 'Ajinkya', 'CS', 'Dr. Turing', 'Databases', '3'],
            ['102', 'EE101', 'Priya', 'EE', 'Dr. Maxwell', 'Circuits', '4']
          ]
        }
      ]
    },
    '2nf': {
      name: 'Second Normal Form (2NF)',
      badge: 'No Partial Dependencies',
      rule: 'Meets 1NF AND removes partial functional dependencies on composite primary key (StudentID, CourseID). Tables decompose.',
      tables: [
        {
          title: 'Students Table',
          headers: ['StudentID (PK)', 'Name', 'Dept', 'DeptHead'],
          rows: [
            ['101', 'Ajinkya', 'CS', 'Dr. Turing'],
            ['102', 'Priya', 'EE', 'Dr. Maxwell']
          ]
        },
        {
          title: 'Courses Table',
          headers: ['CourseID (PK)', 'CourseName', 'Credits'],
          rows: [
            ['CS101', 'Algorithms', '4'],
            ['CS202', 'Databases', '3'],
            ['EE101', 'Circuits', '4']
          ]
        },
        {
          title: 'Student_Course_Link',
          headers: ['StudentID (FK)', 'CourseID (FK)'],
          rows: [
            ['101', 'CS101'],
            ['101', 'CS202'],
            ['102', 'EE101']
          ]
        }
      ]
    },
    '3nf': {
      name: 'Third Normal Form (3NF)',
      badge: 'No Transitive Dependencies',
      rule: 'Meets 2NF AND removes transitive dependencies (StudentID -> Dept -> DeptHead). Non-key attributes now depend ONLY on primary keys.',
      tables: [
        {
          title: 'Students Table (3NF)',
          headers: ['StudentID (PK)', 'Name', 'DeptID (FK)'],
          rows: [
            ['101', 'Ajinkya', 'CS'],
            ['102', 'Priya', 'EE']
          ]
        },
        {
          title: 'Departments Table (3NF)',
          headers: ['DeptID (PK)', 'DeptName', 'DeptHead'],
          rows: [
            ['CS', 'Computer Science', 'Dr. Turing'],
            ['EE', 'Electrical Engineering', 'Dr. Maxwell']
          ]
        },
        {
          title: 'Courses Table (3NF)',
          headers: ['CourseID (PK)', 'CourseName', 'Credits'],
          rows: [
            ['CS101', 'Algorithms', '4'],
            ['CS202', 'Databases', '3'],
            ['EE101', 'Circuits', '4']
          ]
        }
      ]
    },
    bcnf: {
      name: 'Boyce-Codd Normal Form (BCNF)',
      badge: 'Strict Superkey Integrity',
      rule: 'Stricter version of 3NF. For every functional dependency X -> Y, X must be a super key. Eliminates overlapping composite candidate keys.',
      tables: [
        {
          title: 'Advisor_Department Table (BCNF)',
          headers: ['Advisor (PK)', 'Department'],
          rows: [
            ['Dr. Turing', 'Computer Science'],
            ['Dr. Maxwell', 'Electrical Engineering']
          ]
        },
        {
          title: 'Student_Advisor Table (BCNF)',
          headers: ['StudentID (PK)', 'Advisor (FK)'],
          rows: [
            ['101', 'Dr. Turing'],
            ['102', 'Dr. Maxwell']
          ]
        }
      ]
    }
  };

  const current = stagesData[stage];

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">Database Normalization Lifecycle (1NF to BCNF)</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize how table schemas decompose to eliminate insert, update, and deletion anomalies.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl shrink-0 overflow-x-auto">
          {(['unnormalized', '1nf', '2nf', '3nf', 'bcnf'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setStage(tab)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                stage === tab
                  ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-850/60 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 dark:text-white">{current.name}</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {current.badge}
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">{current.rule}</p>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {current.tables.map((t, idx) => (
          <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-indigo-500" />
              {t.title}
            </span>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-850 rounded-xl">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    {t.headers.map(h => (
                      <th key={h} className="p-2 font-bold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50 font-mono">
                  {t.rows.map((r, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30">
                      {r.map((c, cIdx) => (
                        <td key={cIdx} className="p-2 whitespace-nowrap text-slate-700 dark:text-slate-300">{c}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 6. IN-BROWSER LIVE SQL SANDBOX / PLAYGROUND
// ----------------------------------------------------------------------------
export function SQLPlayground() {
  const [query, setQuery] = useState('SELECT country, COUNT(*) as total_customers FROM Customers GROUP BY country ORDER BY total_customers DESC;');
  const [resultRows, setResultRows] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [execTimeMs, setExecTimeMs] = useState<number | null>(null);
  const [dbInstance, setDbInstance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initSqlWasm().then(db => {
      setDbInstance(db);
      runQuery(db, query);
    }).catch(err => {
      console.error(err);
      setErrorMsg('Failed to initialize SQLite in-browser database engine.');
    });
  }, []);

  const runQuery = (db: any, sqlString: string) => {
    if (!db) return;
    setLoading(true);
    setErrorMsg(null);
    const start = performance.now();

    try {
      const rows: any[] = [];
      const stmt = db.prepare(sqlString);
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      const duration = performance.now() - start;
      setResultRows(rows);
      setExecTimeMs(Math.round(duration * 100) / 100);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing SQL query.');
      setResultRows([]);
      setExecTimeMs(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = () => {
    if (dbInstance) {
      runQuery(dbInstance, query);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">In-Browser Live SQLite Studio</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Write and execute arbitrary SQL queries against preloaded SQLite schemas with instant table preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            title="Copy SQL Query"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleRun}
            disabled={loading || !dbInstance}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? 'Running...' : 'Execute SQL'}</span>
          </button>
        </div>
      </div>

      {/* Mock Table Quick Starters */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Select Starter Schema &amp; Pre-Built Query:
        </span>
        <div className="flex flex-wrap gap-2">
          {MOCK_TABLES_METADATA.map((tbl) => (
            <button
              key={tbl.name}
              onClick={() => {
                setQuery(tbl.sampleQuery);
                if (dbInstance) runQuery(dbInstance, tbl.sampleQuery);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-indigo-500/50 hover:bg-indigo-500/[0.05] transition text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Database className="w-3 h-3 text-indigo-500" />
              <span>{tbl.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SQL Input Area */}
      <div className="space-y-2">
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden font-mono shadow-inner">
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/80 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
            <span>SQL Query Buffer</span>
            <span>Shortcut: Click Execute</span>
          </div>
          <textarea
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your SQL query here e.g. SELECT * FROM Customers..."
            className="w-full p-4 bg-transparent text-indigo-300 text-xs font-mono resize-none focus:outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* Output / Results Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold px-1">
          <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Table className="w-4 h-4 text-emerald-500" />
            Query Result Set
          </span>
          {execTimeMs !== null && (
            <span className="text-[11px] font-mono text-slate-400">
              {resultRows.length} row(s) returned in <strong className="text-emerald-500">{execTimeMs}ms</strong>
            </span>
          )}
        </div>

        {errorMsg ? (
          <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        ) : resultRows.length > 0 ? (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl max-h-72 shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  {Object.keys(resultRows[0]).map((col) => (
                    <th key={col} className="p-3 font-bold uppercase text-[10px] tracking-wider whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-mono">
                {resultRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    {Object.values(row).map((val: any, cellIdx) => (
                      <td key={cellIdx} className="p-3 whitespace-nowrap text-slate-800 dark:text-slate-200 font-medium">
                        {val === null ? <span className="text-slate-400 italic">NULL</span> : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            Query returned 0 rows or hasn't been executed yet.
          </div>
        )}
      </div>
    </div>
  );
}
