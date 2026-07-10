import { useState, useMemo } from 'react';
import { ArrowLeft, RotateCcw, Download, Percent, AlertCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { solveSimplexLP } from '../utils/mathAdvanced';

export default function LinearProgrammingSolver() {
  const [numVars, setNumVars] = useState<number>(2);
  const [numConstraints, setNumConstraints] = useState<number>(3);
  const [objective, setObjective] = useState<number[]>([3, 5]);
  const [minimize, setMinimize] = useState<boolean>(false);
  const [constraints, setConstraints] = useState<number[][]>([
    [1, 0],
    [0, 2],
    [3, 2]
  ]);
  const [rhs, setRhs] = useState<number[]>([4, 12, 18]);
  const [error, setError] = useState<string | null>(null);

  // Synchronize sizes when numVars changes
  const handleNumVarsChange = (val: number) => {
    const nextVal = Math.max(2, Math.min(6, val));
    setNumVars(nextVal);
    setObjective(prev => {
      const copy = [...prev];
      while (copy.length < nextVal) copy.push(0);
      return copy.slice(0, nextVal);
    });
    setConstraints(prev => {
      return prev.map(row => {
        const rowCopy = [...row];
        while (rowCopy.length < nextVal) rowCopy.push(0);
        return rowCopy.slice(0, nextVal);
      });
    });
  };

  // Synchronize sizes when numConstraints changes
  const handleNumConstraintsChange = (val: number) => {
    const nextVal = Math.max(1, Math.min(8, val));
    setNumConstraints(nextVal);
    setConstraints(prev => {
      const copy = [...prev];
      while (copy.length < nextVal) {
        copy.push(Array(numVars).fill(0));
      }
      return copy.slice(0, nextVal);
    });
    setRhs(prev => {
      const copy = [...prev];
      while (copy.length < nextVal) copy.push(0);
      return copy.slice(0, nextVal);
    });
  };

  const handleObjectiveCoeffChange = (idx: number, val: number) => {
    setObjective(prev => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const handleConstraintCoeffChange = (rowIdx: number, colIdx: number, val: number) => {
    setConstraints(prev => {
      const copy = prev.map(r => [...r]);
      copy[rowIdx][colIdx] = val;
      return copy;
    });
  };

  const handleRhsChange = (rowIdx: number, val: number) => {
    setRhs(prev => {
      const copy = [...prev];
      copy[rowIdx] = val;
      return copy;
    });
  };

  const loadExample = () => {
    setNumVars(2);
    setNumConstraints(3);
    setObjective([3, 5]);
    setMinimize(false);
    setConstraints([
      [1, 0],
      [0, 2],
      [3, 2]
    ]);
    setRhs([4, 12, 18]);
    setError(null);
  };

  const handleReset = () => {
    loadExample();
  };

  // Compute Simplex LP
  const result = useMemo(() => {
    setError(null);
    try {
      // Validate RHS values are non-negative for standard simplex setup
      if (rhs.some(val => val < 0)) {
        throw new Error('Standard simplex solver requires all constraint bounds (RHS) to be non-negative.');
      }
      // Run Simplex
      const lpRes = solveSimplexLP(objective, constraints, rhs, minimize);
      if (lpRes.status === 'unbounded') {
        throw new Error('Linear programming model is Unbounded (objective can grow infinitely).');
      }
      if (lpRes.status === 'max_iterations_reached') {
        throw new Error('Solver reached maximum iteration threshold without converging.');
      }
      return lpRes;
    } catch (e: any) {
      setError(e.message || 'Solver Error.');
      return null;
    }
  }, [objective, constraints, rhs, minimize]);

  // Visual 2D Graph Overlay (For 2 variables only)
  const graphData = useMemo(() => {
    if (numVars !== 2 || error) return null;

    // We want to find the intersections of the lines to map the feasible region.
    // Lines:
    // 1. x1 = 0
    // 2. x2 = 0
    // 3. a_i1 * x1 + a_i2 * x2 = rhs_i (for each constraint)

    const lines: { a: number; b: number; c: number }[] = [
      { a: 1, b: 0, c: 0 }, // x1 = 0
      { a: 0, b: 1, c: 0 }  // x2 = 0
    ];

    for (let i = 0; i < numConstraints; i++) {
      lines.push({
        a: constraints[i][0],
        b: constraints[i][1],
        c: rhs[i]
      });
    }

    // Find all intersections
    const intersections: { x: number; y: number }[] = [];
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const l1 = lines[i];
        const l2 = lines[j];
        const det = l1.a * l2.b - l2.a * l1.b;
        if (Math.abs(det) > 1e-9) {
          const x = (l1.c * l2.b - l2.c * l1.b) / det;
          const y = (l1.a * l2.c - l2.a * l1.c) / det;
          intersections.push({ x, y });
        }
      }
    }

    // Filter to keep only those that satisfy ALL constraints (within numerical precision)
    const feasiblePoints = intersections.filter(pt => {
      if (pt.x < -1e-9 || pt.y < -1e-9) return false;
      for (let i = 0; i < numConstraints; i++) {
        const val = constraints[i][0] * pt.x + constraints[i][1] * pt.y;
        if (val > rhs[i] + 1e-9) return false;
      }
      return true;
    });

    // Clean duplicate points
    const uniquePoints: { x: number; y: number }[] = [];
    feasiblePoints.forEach(pt => {
      const exists = uniquePoints.some(u => Math.abs(u.x - pt.x) < 1e-5 && Math.abs(u.y - pt.y) < 1e-5);
      if (!exists) uniquePoints.push(pt);
    });

    // Sort points angularly around centroid to form a convex polygon
    if (uniquePoints.length > 0) {
      const cx = uniquePoints.reduce((sum, p) => sum + p.x, 0) / uniquePoints.length;
      const cy = uniquePoints.reduce((sum, p) => sum + p.y, 0) / uniquePoints.length;
      uniquePoints.sort((p1, p2) => {
        const angle1 = Math.atan2(p1.y - cy, p1.x - cx);
        const angle2 = Math.atan2(p2.y - cy, p2.x - cx);
        return angle1 - angle2;
      });
    }

    // Determine scale bounds
    let maxXLimit = 5;
    let maxYLimit = 5;
    for (let i = 0; i < numConstraints; i++) {
      const a = constraints[i][0];
      const b = constraints[i][1];
      const c = rhs[i];
      if (a > 1e-9) maxXLimit = Math.max(maxXLimit, c / a);
      if (b > 1e-9) maxYLimit = Math.max(maxYLimit, c / b);
    }

    maxXLimit = maxXLimit * 1.2;
    maxYLimit = maxYLimit * 1.2;

    return {
      polygonPoints: uniquePoints,
      maxXLimit,
      maxYLimit
    };
  }, [numVars, numConstraints, constraints, rhs, error]);

  const svgWidth = 400;
  const svgHeight = 250;
  const padding = 30;

  const mapX = (xVal: number) => {
    if (!graphData) return 0;
    const pct = xVal / graphData.maxXLimit;
    return padding + pct * (svgWidth - 2 * padding);
  };

  const mapY = (yVal: number) => {
    if (!graphData) return 0;
    const pct = yVal / graphData.maxYLimit;
    return svgHeight - padding - pct * (svgHeight - 2 * padding);
  };

  // Export Results
  const handleExportCSV = () => {
    if (!result) return;
    const lines = [
      ['Metric', 'Value'],
      ['Status', result.status],
      ['Optimal Objective Z', result.optimalValue ?? 'N/A'],
      ...Object.entries(result.variables).map(([name, val]) => [`Variable ${name}`, val]),
      ...result.slack.map((val, idx) => [`Slack s${idx + 1}`, val])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + lines.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "simplex_lp_solution.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <SEO
        title="Linear Programming Simplex Solver | Visual LP Grapher"
        description="Solve linear programming maximization and minimization problems using the Simplex algorithm. Graph 2-variable systems showing feasible boundary polygons."
        keywords={['linear programming', 'simplex algorithm', 'lp solver', 'simplex calculator', 'feasible region']}
      />

      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 mb-6">
        <a
          href="/math-studio"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Math Studio</span>
        </a>
        <div className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold flex items-center gap-1.5">
          <a href="/" className="hover:text-indigo-500 transition-colors">Home</a>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <a href="/math-studio" className="hover:text-indigo-500 transition-colors">Math Studio</a>
          <span className="text-zinc-350 dark:text-zinc-700">&gt;</span>
          <span className="text-zinc-650 dark:text-zinc-300 font-medium">Linear Programming Solver</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
              Linear Programming (Simplex) Solver
            </h1>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-0.5">
              Solve linear optimization equations symbolically, view constraints boundary slacks, and render 2D feasibility graphs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Inputs Section */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                    Variables (2-6)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={numVars}
                    onChange={(e) => handleNumVarsChange(parseInt(e.target.value) || 2)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                    Constraints (1-8)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={numConstraints}
                    onChange={(e) => handleNumConstraintsChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-sm font-mono text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Goal Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-455 uppercase tracking-wider mb-2">
                  Optimization Goal
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMinimize(false)}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      !minimize
                        ? 'border-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400'
                        : 'border-zinc-250 dark:border-zinc-850 hover:bg-zinc-50 text-zinc-650 dark:text-zinc-450'
                    }`}
                  >
                    Maximize Z
                  </button>
                  <button
                    onClick={() => setMinimize(true)}
                    className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      minimize
                        ? 'border-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400'
                        : 'border-zinc-250 dark:border-zinc-850 hover:bg-zinc-50 text-zinc-650 dark:text-zinc-450'
                    }`}
                  >
                    Minimize Z
                  </button>
                </div>
              </div>

              {/* Objective Coefficients */}
              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  Objective Function Coefficients (Z = ...)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {objective.map((val, idx) => (
                    <div key={`obj-${idx}`} className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-xl border border-zinc-150 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 font-mono">c{idx + 1}:</span>
                      <input
                        type="number"
                        step="any"
                        value={val}
                        onChange={(e) => handleObjectiveCoeffChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent text-xs font-mono font-bold focus:outline-none text-zinc-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Constraints Matrix */}
              <div>
                <label className="block text-xs font-bold text-zinc-450 uppercase tracking-wider mb-2">
                  Constraints coefficients (A · x ≤ b)
                </label>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {constraints.map((row, rowIdx) => (
                    <div key={`constraint-row-${rowIdx}`} className="p-3 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-200/60 dark:border-zinc-850/60 rounded-xl space-y-2">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                        Constraint {rowIdx + 1}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {row.map((coeff, colIdx) => (
                          <div key={`coeff-${rowIdx}-${colIdx}`} className="flex items-center gap-1 bg-white dark:bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-150 dark:border-zinc-800 w-24">
                            <span className="text-[9px] font-mono text-zinc-400">x{colIdx + 1}:</span>
                            <input
                              type="number"
                              step="any"
                              value={coeff}
                              onChange={(e) => handleConstraintCoeffChange(rowIdx, colIdx, parseFloat(e.target.value) || 0)}
                              className="w-full bg-transparent text-xs font-mono text-zinc-900 dark:text-white focus:outline-none"
                            />
                          </div>
                        ))}
                        <span className="text-xs font-bold text-zinc-450">≤</span>
                        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-150 dark:border-zinc-800 w-24 ml-auto">
                          <span className="text-[9px] font-mono text-indigo-500 font-bold">Limit:</span>
                          <input
                            type="number"
                            step="any"
                            value={rhs[rowIdx] || 0}
                            onChange={(e) => handleRhsChange(rowIdx, parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-850 hover:bg-zinc-50 text-xs font-bold text-zinc-650 dark:text-zinc-400 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={loadExample}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-xs font-bold text-zinc-600 dark:text-zinc-400 transition"
                >
                  Load Example
                </button>
                {result && result.status === 'optimal' && (
                  <button
                    onClick={handleExportCSV}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-750 text-white text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-600 dark:text-rose-450 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right Column: Visual Graph & Matrix Results */}
          <div className="lg:col-span-6 space-y-6">
            {/* Visual feasible polygon graph (Only when variables count is 2) */}
            {numVars === 2 && graphData && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Linear Feasible Region Graph</span>
                  <span className="text-[10px] text-zinc-450 font-mono">2D Convex Polygon Area</span>
                </h4>
                <div className="flex items-center justify-center">
                  <svg
                    width="100%"
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="border border-zinc-100 dark:border-zinc-850 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20"
                  >
                    {/* Graph Axes */}
                    <line x1={padding} y1={svgHeight - padding} x2={svgWidth} y2={svgHeight - padding} stroke="currentColor" className="text-zinc-400 dark:text-zinc-700" strokeWidth={1.5} />
                    <line x1={padding} y1={0} x2={padding} y2={svgHeight - padding} stroke="currentColor" className="text-zinc-400 dark:text-zinc-700" strokeWidth={1.5} />

                    {/* Constraint Line segments */}
                    {constraints.map((row, idx) => {
                      const a = row[0];
                      const b = row[1];
                      const c = rhs[idx];

                      // Find two points on boundary to draw lines
                      let p1x = 0, p1y = 0, p2x = 0, p2y = 0;
                      if (Math.abs(b) < 1e-9) {
                        p1x = c / a; p1y = 0;
                        p2x = c / a; p2y = graphData.maxYLimit;
                      } else if (Math.abs(a) < 1e-9) {
                        p1x = 0; p1y = c / b;
                        p2x = graphData.maxXLimit; p2y = c / b;
                      } else {
                        p1x = 0; p1y = c / b;
                        p2x = c / a; p2y = 0;
                      }

                      return (
                        <line
                          key={`const-line-${idx}`}
                          x1={mapX(p1x)}
                          y1={mapY(p1y)}
                          x2={mapX(p2x)}
                          y2={mapY(p2y)}
                          stroke="#a855f7"
                          strokeWidth={1}
                          strokeDasharray="4,4"
                          className="opacity-70"
                        />
                      );
                    })}

                    {/* Shaded Feasible Region Polygon */}
                    {graphData.polygonPoints.length > 2 && (
                      <polygon
                        points={graphData.polygonPoints.map(p => `${mapX(p.x)},${mapY(p.y)}`).join(' ')}
                        fill="#6366f1"
                        className="opacity-20 dark:opacity-30"
                      />
                    )}

                    {/* Polygon Corners/Vertices */}
                    {graphData.polygonPoints.map((pt, idx) => (
                      <circle
                        key={`poly-vert-${idx}`}
                        cx={mapX(pt.x)}
                        cy={mapY(pt.y)}
                        r={3}
                        className="fill-indigo-400"
                      />
                    ))}

                    {/* Optimal Solution Node */}
                    {result && result.status === 'optimal' && result.variables.x1 !== undefined && result.variables.x2 !== undefined && (
                      <g>
                        <circle
                          cx={mapX(result.variables.x1)}
                          cy={mapY(result.variables.x2)}
                          r={6}
                          className="fill-emerald-500 animate-ping opacity-75"
                        />
                        <circle
                          cx={mapX(result.variables.x1)}
                          cy={mapY(result.variables.x2)}
                          r={4}
                          className="fill-emerald-500 stroke-white dark:stroke-zinc-900"
                          strokeWidth={1.5}
                        />
                      </g>
                    )}
                  </svg>
                </div>
              </div>
            )}

            {/* Simplex Solution Panel */}
            {result && !error && (
              <div className="bg-zinc-900 dark:bg-zinc-950 text-white rounded-2xl p-6 shadow-md border border-zinc-800 space-y-4 font-mono">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Simplex Solution Summary
                  </h4>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-black uppercase">
                    {result.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">
                    Optimal Objective Value (Z*)
                  </span>
                  <div className="text-2xl font-black text-emerald-400">
                    {result.optimalValue !== null ? result.optimalValue.toFixed(4) : 'N/A'}
                  </div>
                </div>

                {/* Variable Values */}
                <div className="pt-3 border-t border-zinc-850 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-zinc-400 block uppercase tracking-wider mb-2">
                      Decision Variables
                    </span>
                    <div className="space-y-1.5">
                      {Object.entries(result.variables).map(([name, val]) => (
                        <div key={name} className="flex justify-between bg-zinc-850 p-2 rounded-xl text-xs">
                          <span className="font-bold text-zinc-450">{name}:</span>
                          <span className="font-bold text-white">{val.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slack Values */}
                  <div>
                    <span className="text-[9px] text-zinc-400 block uppercase tracking-wider mb-2">
                      Slack Variables (s_i)
                    </span>
                    <div className="space-y-1.5">
                      {result.slack.map((val, idx) => (
                        <div key={`slack-${idx}`} className="flex justify-between bg-zinc-850 p-2 rounded-xl text-xs">
                          <span className="font-bold text-zinc-450">s{idx + 1}:</span>
                          <span className="font-bold text-zinc-350">{val.toFixed(4)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LP Guide */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Simplex Method & LP Info
              </h4>
              <div className="text-xs text-zinc-650 dark:text-zinc-350 space-y-3 leading-relaxed">
                <p>
                  Linear programming solves optimization models defined by linear relationships. The Simplex algorithm travels along the exterior boundary vertices of the convex feasibility polyhedron.
                </p>
                <ul className="list-disc pl-4 space-y-1 font-mono text-[10px] text-zinc-550 dark:text-zinc-400">
                  <li>Slack variables represent unused capacities or thresholds.</li>
                  <li>Vertices are intersections of bounding constraint planes.</li>
                  <li>Standard form requires variable non-negativity \(x_i \ge 0\).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
