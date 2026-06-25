import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator, Binary, Grid, BarChart3, TrendingUp, Compass, Box,
  Activity, LineChart, Scale, Search, Grid2X2, List, Sparkles, ChevronRight
} from 'lucide-react';
import SEO from '../components/SEO';

interface ToolItem {
  name: string;
  slug: string;
  desc: string;
  icon: string;
}

interface ToolGroup {
  name: string;
  icon: string;
  description: string;
  tools: ToolItem[];
}

const toolGroups: ToolGroup[] = [
  {
    name: 'Equations & Algebra',
    icon: 'Binary',
    description: 'Solve equations step-by-step.',
    tools: [
      { name: 'Equation Solver', slug: 'equation-solver', desc: 'Solve linear, quadratic, and simultaneous equations with steps and graphs.', icon: 'Binary' }
    ]
  },
  {
    name: 'Matrix Mathematics',
    icon: 'Grid',
    description: 'Solve matrix algebra up to 4x4.',
    tools: [
      { name: 'Matrix Calculator', slug: 'matrix-calculator', desc: 'Add, multiply, invert, transpose matrices, and solve determinants.', icon: 'Grid' }
    ]
  },
  {
    name: 'Descriptive Statistics',
    icon: 'BarChart3',
    description: 'Analyze numeric datasets and distributions.',
    tools: [
      { name: 'Statistics Calculator', slug: 'statistics-calculator', desc: 'Compute mean, median, standard deviation, and render frequency charts.', icon: 'BarChart3' },
      { name: 'Data Analysis Calculator', slug: 'data-analysis-calculator', desc: 'Detect outliers, perform regressions, and analyze scatter correlation.', icon: 'TrendingUp' }
    ]
  },
  {
    name: 'Trigonometry & 2D Geometry',
    icon: 'Compass',
    description: 'Solve triangles and Cartesian paths.',
    tools: [
      { name: 'Geometry Solver', slug: 'geometry-solver', desc: 'Solve triangles (SSS, SAS, ASA, AAS), regular polygons, and circles.', icon: 'Compass' },
      { name: 'Coordinate Geometry Calculator', slug: 'coordinate-geometry-calculator', desc: 'Calculate point distances, slopes, midpoints, and line equations.', icon: 'LineChart' }
    ]
  },
  {
    name: '3D Geometry & Space',
    icon: 'Box',
    description: 'Calculate shapes volume and surface areas.',
    tools: [
      { name: '3D Geometry & Volume Calculator', slug: '3d-geometry-volume-calculator', desc: 'Find volumes, capacity in litres, and surface areas of cones, pipes, and cylinders.', icon: 'Box' }
    ]
  },
  {
    name: 'Probability & Conversion',
    icon: 'Scale',
    description: 'Calculate distributions and convert units.',
    tools: [
      { name: 'Probability Calculator', slug: 'probability-calculator', desc: 'Evaluate permutations, combinations, binomial, and normal z-scores.', icon: 'Activity' },
      { name: 'Unit Converter Pro', slug: 'unit-converter-pro', desc: 'Convert length, pressure, torque, density, and 12+ physical dimensions.', icon: 'Scale' }
    ]
  },
  {
    name: 'Calculus & Function Analysis',
    icon: 'LineChart',
    description: 'Symbolic and numeric calculus tools.',
    tools: [
      { name: 'Derivative Calculator', slug: 'derivative-calculator', desc: 'Find derivatives symbolically with step-by-step differentiation rules and graph plots.', icon: 'Activity' },
      { name: 'Integral Calculator', slug: 'integral-calculator', desc: 'Calculate indefinite/definite integrals with area graphs and numerical Simpson fallbacks.', icon: 'Binary' },
      { name: 'Limit Calculator', slug: 'limit-calculator', desc: 'Evaluate left-hand, right-hand, and two-sided limits with numerical tables and plots.', icon: 'TrendingUp' },
      { name: 'Graphing Calculator', slug: 'graphing-calculator', desc: 'Plot multiple functions on an interactive Cartesian plane with zooming and panning.', icon: 'LineChart' }
    ]
  },
  {
    name: 'Numerical Methods & Optimization',
    icon: 'Calculator',
    description: 'Iterative equation solvers and linear solvers.',
    tools: [
      { name: 'Numerical Root Finder', slug: 'numerical-root-finder', desc: 'Find function roots using Bisection, Newton-Raphson, and Secant methods.', icon: 'Calculator' },
      { name: 'Numerical Integration Calculator', slug: 'numerical-integration-calculator', desc: 'Approximate definite integrals using Trapezoidal, Simpson 1/3, and 3/8 rules.', icon: 'Grid' },
      { name: 'Differential Equation Solver', slug: 'differential-equation-solver', desc: 'Solve first-order initial value problems using RK4, Euler, and Heun algorithms.', icon: 'Compass' },
      { name: 'Linear Programming Solver', slug: 'linear-programming-solver', desc: 'Optimize objective functions subject to linear constraints using simplex.', icon: 'Scale' }
    ]
  },
  {
    name: 'Advanced Engineering Math',
    icon: 'Box',
    description: 'Fourier, complex phasor, and vector modules.',
    tools: [
      { name: 'Fourier Transform Calculator', slug: 'fourier-transform-tool', desc: 'Compute signal FFT spectrum profiles in time and frequency domains.', icon: 'Activity' },
      { name: 'Complex Number Calculator', slug: 'complex-number-calculator', desc: 'Evaluate complex algebra, roots, and display on an Argand diagram.', icon: 'Box' },
      { name: 'Vector Calculator', slug: 'vector-calculator', desc: 'Calculate dot/cross products, magnitudes, angles, and projections for 2D/3D vectors.', icon: 'LineChart' }
    ]
  },
  {
    name: 'Data Science & Probability',
    icon: 'TrendingUp',
    description: 'Probability models and data regression fits.',
    tools: [
      { name: 'Regression Calculator', slug: 'regression-calculator', desc: 'Fit linear, polynomial, and exponential curves to X/Y datasets.', icon: 'TrendingUp' },
      { name: 'Probability Distribution Calculator', slug: 'probability-distribution-calculator', desc: 'Analyze Poisson, Exponential, Binomial, and Normal CDFs/PDFs.', icon: 'Activity' }
    ]
  }
];

const iconMap: Record<string, React.ComponentType<any>> = {
  Calculator, Binary, Grid, BarChart3, TrendingUp, Compass, Box, Activity, LineChart, Scale
};

const groupColors: Record<string, { gradient: string; border: string; text: string; bg: string; shadow: string }> = {
  'Equations & Algebra': {
    gradient: 'from-violet-500/10 to-indigo-500/10',
    border: 'border-violet-500/20 dark:border-violet-500/10',
    text: 'text-violet-700 dark:text-violet-400',
    bg: 'bg-violet-500/5',
    shadow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] dark:hover:shadow-[0_0_20px_rgba(139,92,246,0.08)]'
  },
  'Matrix Mathematics': {
    gradient: 'from-blue-500/10 to-indigo-500/10',
    border: 'border-blue-500/20 dark:border-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-500/5',
    shadow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.08)]'
  },
  'Descriptive Statistics': {
    gradient: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/20 dark:border-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-500/5',
    shadow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]'
  },
  'Trigonometry & 2D Geometry': {
    gradient: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-500/20 dark:border-amber-500/10',
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-500/5',
    shadow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_0_20px_rgba(245,158,11,0.08)]'
  },
  '3D Geometry & Space': {
    gradient: 'from-rose-500/10 to-pink-500/10',
    border: 'border-rose-500/20 dark:border-rose-500/10',
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-500/5',
    shadow: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] dark:hover:shadow-[0_0_20px_rgba(244,63,94,0.08)]'
  },
  'Probability & Conversion': {
    gradient: 'from-cyan-500/10 to-teal-500/10',
    border: 'border-cyan-500/20 dark:border-cyan-500/10',
    text: 'text-cyan-700 dark:text-cyan-400',
    bg: 'bg-cyan-500/5',
    shadow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.08)]'
  },
  'Calculus & Function Analysis': {
    gradient: 'from-blue-500/10 to-cyan-500/10',
    border: 'border-blue-500/20 dark:border-blue-500/10',
    text: 'text-blue-750 dark:text-blue-400',
    bg: 'bg-blue-500/5',
    shadow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]'
  },
  'Numerical Methods & Optimization': {
    gradient: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-500/20 dark:border-emerald-500/10',
    text: 'text-emerald-705 dark:text-emerald-400',
    bg: 'bg-emerald-500/5',
    shadow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]'
  },
  'Advanced Engineering Math': {
    gradient: 'from-violet-500/10 to-purple-500/10',
    border: 'border-violet-500/20 dark:border-violet-500/10',
    text: 'text-violet-750 dark:text-violet-400',
    bg: 'bg-violet-500/5',
    shadow: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]'
  },
  'Data Science & Probability': {
    gradient: 'from-pink-500/10 to-rose-500/10',
    border: 'border-pink-500/20 dark:border-pink-500/10',
    text: 'text-pink-750 dark:text-pink-400',
    bg: 'bg-pink-500/5',
    shadow: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]'
  }
};

export default function MathStudio() {
  const [viewMode, setViewMode] = useState<'toolkit' | 'list'>('toolkit');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroupFilter, setActiveGroupFilter] = useState('All');

  // 2D Function Plotter Widget State
  const [plotFunction, setPlotFunction] = useState<'sin' | 'cos' | 'quadratic' | 'cubic' | 'wave'>('sin');
  const [plotScale, setPlotScale] = useState(1);
  const [plotFrequency, setPlotFrequency] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; px: number; py: number } | null>(null);

  const allTools = useMemo(() => {
    return toolGroups.flatMap(group => group.tools.map(t => ({ ...t, groupName: group.name })));
  }, []);

  const filteredTools = useMemo(() => {
    return allTools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = activeGroupFilter === 'All' || tool.groupName === activeGroupFilter;
      return matchesSearch && matchesGroup;
    });
  }, [allTools, searchQuery, activeGroupFilter]);

  const groupPills = ['All', ...toolGroups.map(g => g.name)];

  // Plotter math details
  const svgWidth = 500;
  const svgHeight = 250;
  const padding = 20;
  const originX = svgWidth / 2;
  const originY = svgHeight / 2;
  
  // Maps standard math coordinates (x: -10 to 10, y: -5 to 5) to SVG pixels
  const mapX = (x: number) => originX + x * (originX - padding) / 10;
  const mapY = (y: number) => originY - y * (originY - padding) / 5;
  const reverseX = (px: number) => ((px - originX) * 10) / (originX - padding);

  // Computes the function value
  const evaluateMathFunc = (x: number) => {
    switch (plotFunction) {
      case 'sin':
        return plotScale * Math.sin(plotFrequency * x);
      case 'cos':
        return plotScale * Math.cos(plotFrequency * x);
      case 'quadratic':
        return plotScale * 0.1 * x * x;
      case 'cubic':
        return plotScale * 0.01 * x * x * x;
      case 'wave':
        return plotScale * (Math.sin(plotFrequency * x) + 0.3 * Math.sin(2.5 * plotFrequency * x));
      default:
        return 0;
    }
  };

  // Generate points for the SVG path
  const plotPath = useMemo(() => {
    const points: string[] = [];
    const minX = -10;
    const maxX = 10;
    const step = 0.05;

    for (let x = minX; x <= maxX; x += step) {
      const y = evaluateMathFunc(x);
      const px = mapX(x);
      const py = mapY(y);
      if (px >= padding && px <= svgWidth - padding && py >= padding && py <= svgHeight - padding) {
        if (points.length === 0) {
          points.push(`M ${px} ${py}`);
        } else {
          points.push(`L ${px} ${py}`);
        }
      }
    }
    return points.join(' ');
  }, [plotFunction, plotScale, plotFrequency]);

  const handlePlotMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (px >= padding && px <= svgWidth - padding && py >= padding && py <= svgHeight - padding) {
      const x = reverseX(px);
      const y = evaluateMathFunc(x);
      const graphPy = mapY(y);
      if (Math.abs(py - graphPy) < 20) {
        setHoveredPoint({ x, y, px, py: graphPy });
        return;
      }
    }
    setHoveredPoint(null);
  };

  const allMathTools = useMemo(() => {
    return toolGroups.flatMap(group => group.tools);
  }, []);

  const studioSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Advanced Math Studio - Solve & Visualize Calculations Online',
    'description': 'Explore 22 premium, browser-based calculators covering equation solving, matrix arithmetic, descriptive statistics, 2D/3D geometry, coordinate grids, and probability curves.',
    'url': 'https://toolique.in/math-studio',
    'mainEntity': {
      '@type': 'ItemList',
      'numberOfItems': allMathTools.length,
      'itemListElement': allMathTools.map((tool, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'url': `https://toolique.in/tool/${tool.slug}`,
        'name': tool.name
      }))
    }
  };

  return (
    <>
      <SEO
        title="Advanced Math Studio - Solve & Visualize Calculations Online"
        description="Explore 22 premium, browser-based calculators covering equation solving, matrix arithmetic, descriptive statistics, 2D/3D geometry, coordinate grids, and probability curves."
        keywords={['math studio', 'equation solver', 'matrix calculator', 'statistics calculator', 'unit converter pro', 'geometry solver', 'volume calculator 3d', 'probability calculator', 'coordinate geometry']}
        canonicalUrl="https://toolique.in/math-studio"
        schemaMarkup={studioSchema}
      />

      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
        {/* Premium Hero */}
        <section className="relative overflow-hidden pt-12 pb-16 border-b border-zinc-200/50 dark:border-zinc-800/40">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
          <div className="absolute -top-[30%] -right-[10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-semibold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Math Suite</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                  Advanced Math <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                    Studio
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                  Solve simultaneous equations, compute high-dimension matrices, analyze datasets, plot geometry, and explore statistical curves instantly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search math tools (e.g. Matrix, Equation, SSS)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('toolkit')}
                      className={`px-4 py-3 rounded-xl border font-medium text-sm flex items-center gap-2 transition-all ${
                        viewMode === 'toolkit'
                          ? 'border-indigo-500/35 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <Grid2X2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Toolkit View</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-3 rounded-xl border font-medium text-sm flex items-center gap-2 transition-all ${
                        viewMode === 'list'
                          ? 'border-indigo-500/35 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      <span className="hidden sm:inline">List View</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive 2D Function Plotter Visualizer */}
              <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-xl dark:shadow-2xl/20 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                      Live 2D Plotter Widget
                    </span>
                  </div>
                  <select
                    value={plotFunction}
                    onChange={(e) => setPlotFunction(e.target.value as any)}
                    className="text-xs bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-2.5 py-1 text-zinc-700 dark:text-zinc-300 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="sin">y = k · sin(f · x)</option>
                    <option value="cos">y = k · cos(f · x)</option>
                    <option value="wave">y = k · (sin(fx) + 0.3sin(2.5fx))</option>
                    <option value="quadratic">y = k · 0.1x²</option>
                    <option value="cubic">y = k · 0.01x³</option>
                  </select>
                </div>

                <div className="relative">
                  <svg
                    width="100%"
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="border border-zinc-100 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 select-none cursor-crosshair"
                    onMouseMove={handlePlotMouseMove}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Grid lines */}
                    {Array.from({ length: 21 }).map((_, i) => {
                      const valX = -10 + i;
                      const px = mapX(valX);
                      return (
                        <line
                          key={`gx-${i}`}
                          x1={px}
                          y1={padding}
                          x2={px}
                          y2={svgHeight - padding}
                          stroke="currentColor"
                          className="text-zinc-200/50 dark:text-zinc-800/40"
                          strokeWidth={valX === 0 ? 1.5 : 0.5}
                        />
                      );
                    })}
                    {Array.from({ length: 11 }).map((_, i) => {
                      const valY = -5 + i;
                      const py = mapY(valY);
                      return (
                        <line
                          key={`gy-${i}`}
                          x1={padding}
                          y1={py}
                          x2={svgWidth - padding}
                          y2={py}
                          stroke="currentColor"
                          className="text-zinc-200/50 dark:text-zinc-800/40"
                          strokeWidth={valY === 0 ? 1.5 : 0.5}
                        />
                      );
                    })}

                    {/* Plot Line */}
                    <path
                      d={plotPath}
                      fill="none"
                      stroke="url(#plot-gradient)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="plot-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>

                    {/* Hover point marker */}
                    {hoveredPoint && (
                      <>
                        <line
                          x1={hoveredPoint.px}
                          y1={padding}
                          x2={hoveredPoint.px}
                          y2={svgHeight - padding}
                          stroke="#6366f1"
                          strokeDasharray="4 4"
                          strokeWidth="1.2"
                        />
                        <line
                          x1={padding}
                          y1={hoveredPoint.py}
                          x2={svgWidth - padding}
                          y2={hoveredPoint.py}
                          stroke="#6366f1"
                          strokeDasharray="4 4"
                          strokeWidth="1.2"
                        />
                        <circle
                          cx={hoveredPoint.px}
                          cy={hoveredPoint.py}
                          r="6"
                          className="fill-indigo-500 stroke-white dark:stroke-zinc-900"
                          strokeWidth="2.5"
                        />
                      </>
                    )}
                  </svg>

                  {/* Floating tooltip */}
                  {hoveredPoint && (
                    <div
                      className="absolute bg-zinc-900/90 dark:bg-zinc-900/95 text-white text-[10px] font-mono px-2 py-1 rounded border border-zinc-800 shadow-md backdrop-blur-sm pointer-events-none"
                      style={{
                        left: `${(hoveredPoint.px / svgWidth) * 100}%`,
                        top: `${(hoveredPoint.py / svgHeight) * 100 - 15}%`,
                        transform: 'translate(-50%, -100%)'
                      }}
                    >
                      x: {hoveredPoint.x.toFixed(2)}, y: {hoveredPoint.y.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Plot Controls */}
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex justify-between">
                      <span>Amplitude (k)</span>
                      <span className="font-mono text-zinc-600 dark:text-zinc-400">{plotScale.toFixed(1)}</span>
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="3.5"
                      step="0.1"
                      value={plotScale}
                      onChange={(e) => setPlotScale(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex justify-between">
                      <span>Frequency (f)</span>
                      <span className="font-mono text-zinc-600 dark:text-zinc-400">{plotFrequency.toFixed(1)}</span>
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="3"
                      step="0.1"
                      value={plotFrequency}
                      onChange={(e) => setPlotFrequency(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Group Filter Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
            {groupPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveGroupFilter(pill)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeGroupFilter === pill
                    ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700'
                }`}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {viewMode === 'toolkit' ? (
            /* Grouped Toolkit View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {toolGroups
                .filter(group => activeGroupFilter === 'All' || group.name === activeGroupFilter)
                .map((group) => {
                  const Icon = iconMap[group.icon] || Calculator;
                  const colors = groupColors[group.name] || {
                    gradient: 'from-zinc-500/10 to-zinc-500/10',
                    border: 'border-zinc-500/20 dark:border-zinc-500/10',
                    text: 'text-zinc-700 dark:text-zinc-400',
                    bg: 'bg-zinc-500/5',
                    shadow: 'hover:shadow-[0_0_15px_rgba(115,115,115,0.1)]'
                  };

                  // Filter tools in this group matching the search query
                  const filteredToolsInGroup = group.tools.filter(tool =>
                    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filteredToolsInGroup.length === 0) return null;

                  return (
                    <div
                      key={group.name}
                      className={`group flex flex-col rounded-2xl border ${colors.border} bg-white dark:bg-zinc-900 p-6 transition-all duration-300 ${colors.shadow}`}
                    >
                      <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
                        <div className={`flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr ${colors.gradient} ${colors.text}`}>
                          <Icon className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                            {group.name}
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {group.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-3">
                        {filteredToolsInGroup.map((tool) => {
                          const ToolIcon = iconMap[tool.icon] || Calculator;
                          return (
                            <Link
                              key={tool.slug}
                              to={`/tool/${tool.slug}`}
                              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group/tool transition-colors"
                            >
                              <div className={`mt-0.5 flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover/tool:bg-indigo-500/10 group-hover/tool:text-indigo-600 dark:group-hover/tool:text-indigo-400 transition-colors`}>
                                <ToolIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover/tool:text-indigo-600 dark:group-hover/tool:text-indigo-400 transition-colors flex items-center gap-1">
                                  <span>{tool.name}</span>
                                  <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover/tool:opacity-100 group-hover/tool:translate-x-0 transition-all" />
                                </h4>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal mt-0.5">
                                  {tool.desc}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            /* Simple List View */
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Tool Name</th>
                      <th className="px-6 py-4">Group</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                    {filteredTools.map((tool) => {
                      const ToolIcon = iconMap[tool.icon] || Calculator;
                      return (
                        <tr
                          key={tool.slug}
                          className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8.5 h-8.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                <ToolIcon className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-zinc-900 dark:text-white">
                                {tool.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                              {tool.groupName}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-650 dark:text-zinc-400 text-xs">
                            {tool.desc}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <Link
                              to={`/tool/${tool.slug}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold transition-colors"
                            >
                              <span>Open Tool</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredTools.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                          No math tools found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
