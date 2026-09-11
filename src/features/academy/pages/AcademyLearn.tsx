import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Layers, 
  Database, 
  Binary, 
  Play, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Clock,
  Shuffle,
  BarChart3,
  Search,
  BookOpen,
  Zap
} from 'lucide-react';
import SEO from '../../../components/SEO';
import JoinVisualizer from '../components/JoinVisualizer';
import DataStructureVisual from '../components/DataStructureVisual';

// ----------------------------------------------------------------------------
// INTERACTIVE SORTING ALGORITHM SIMULATOR COMPONENT
// ----------------------------------------------------------------------------
function SortingVisualizer() {
  const [array, setArray] = useState<number[]>([45, 18, 85, 32, 60, 24, 72, 12, 50, 95]);
  const [comparingIndices, setComparingIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'bubble' | 'selection' | 'insertion'>('bubble');
  const [speedMs, setSpeedMs] = useState<number>(200);
  const [comparisonsCount, setComparisonsCount] = useState<number>(0);
  const [swapsCount, setSwapsCount] = useState<number>(0);
  const isSortingRef = useRef<boolean>(false);

  // Generate random array
  const generateRandomArray = () => {
    if (isSorting) return;
    const newArr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 85) + 15);
    setArray(newArr);
    setComparingIndices([]);
    setSortedIndices([]);
    setComparisonsCount(0);
    setSwapsCount(0);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Run Bubble Sort
  const runBubbleSort = async () => {
    setIsSorting(true);
    isSortingRef.current = true;
    const arr = [...array];
    const n = arr.length;
    let comps = 0;
    let swps = 0;
    const sorted: number[] = [];

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!isSortingRef.current) return;
        setComparingIndices([j, j + 1]);
        comps++;
        setComparisonsCount(comps);
        await sleep(speedMs);

        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swps++;
          setSwapsCount(swps);
          setArray([...arr]);
          await sleep(speedMs);
        }
      }
      sorted.push(n - i - 1);
      setSortedIndices([...sorted]);
    }

    setComparingIndices([]);
    setSortedIndices(Array.from({ length: n }, (_, idx) => idx));
    setIsSorting(false);
    isSortingRef.current = false;
  };

  // Run Selection Sort
  const runSelectionSort = async () => {
    setIsSorting(true);
    isSortingRef.current = true;
    const arr = [...array];
    const n = arr.length;
    let comps = 0;
    let swps = 0;
    const sorted: number[] = [];

    for (let i = 0; i < n; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (!isSortingRef.current) return;
        setComparingIndices([minIdx, j]);
        comps++;
        setComparisonsCount(comps);
        await sleep(speedMs);

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }

      if (minIdx !== i) {
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        swps++;
        setSwapsCount(swps);
        setArray([...arr]);
        await sleep(speedMs);
      }
      sorted.push(i);
      setSortedIndices([...sorted]);
    }

    setComparingIndices([]);
    setSortedIndices(Array.from({ length: n }, (_, idx) => idx));
    setIsSorting(false);
    isSortingRef.current = false;
  };

  // Run Insertion Sort
  const runInsertionSort = async () => {
    setIsSorting(true);
    isSortingRef.current = true;
    const arr = [...array];
    const n = arr.length;
    let comps = 0;
    let swps = 0;

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      while (j >= 0 && arr[j] > key) {
        if (!isSortingRef.current) return;
        setComparingIndices([j, j + 1]);
        comps++;
        setComparisonsCount(comps);
        await sleep(speedMs);

        arr[j + 1] = arr[j];
        swps++;
        setSwapsCount(swps);
        setArray([...arr]);
        j--;
        await sleep(speedMs);
      }
      arr[j + 1] = key;
      setArray([...arr]);
      setSortedIndices(Array.from({ length: i + 1 }, (_, idx) => idx));
    }

    setComparingIndices([]);
    setSortedIndices(Array.from({ length: n }, (_, idx) => idx));
    setIsSorting(false);
    isSortingRef.current = false;
  };

  const handleStartSort = () => {
    if (selectedAlgorithm === 'bubble') runBubbleSort();
    else if (selectedAlgorithm === 'selection') runSelectionSort();
    else runInsertionSort();
  };

  const handleStop = () => {
    isSortingRef.current = false;
    setIsSorting(false);
    setComparingIndices([]);
  };

  const getAlgorithmDetails = () => {
    switch (selectedAlgorithm) {
      case 'bubble':
        return {
          name: 'Bubble Sort',
          timeBest: 'O(N)',
          timeAvg: 'O(N²)',
          timeWorst: 'O(N²)',
          space: 'O(1)',
          desc: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.'
        };
      case 'selection':
        return {
          name: 'Selection Sort',
          timeBest: 'O(N²)',
          timeAvg: 'O(N²)',
          timeWorst: 'O(N²)',
          space: 'O(1)',
          desc: 'Finds the minimum element from the unsorted subarray and swaps it with the leftmost unsorted element.'
        };
      case 'insertion':
        return {
          name: 'Insertion Sort',
          timeBest: 'O(N)',
          timeAvg: 'O(N²)',
          timeWorst: 'O(N²)',
          space: 'O(1)',
          desc: 'Builds the final sorted array one item at a time by inserting each element into its correct position.'
        };
    }
  };

  const details = getAlgorithmDetails();

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">Sorting Algorithm Step Simulator</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize comparisons, memory swaps, and time complexity in real-time.
          </p>
        </div>

        {/* Algorithm Selectors */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl shrink-0">
          {(['bubble', 'selection', 'insertion'] as const).map((algo) => (
            <button
              key={algo}
              type="button"
              disabled={isSorting}
              onClick={() => {
                setSelectedAlgorithm(algo);
                generateRandomArray();
              }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                selectedAlgorithm === algo
                  ? 'bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {algo}
            </button>
          ))}
        </div>
      </div>

      {/* Control Actions & Speed */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850">
        <div className="flex items-center gap-2">
          {!isSorting ? (
            <button
              type="button"
              onClick={handleStartSort}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Sort</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <span>Stop</span>
            </button>
          )}

          <button
            type="button"
            disabled={isSorting}
            onClick={generateRandomArray}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Randomize</span>
          </button>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
          <div>
            Comparisons: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-black">{comparisonsCount}</span>
          </div>
          <div>
            Swaps: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">{swapsCount}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <select
              value={speedMs}
              disabled={isSorting}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value={400}>0.5x Speed</option>
              <option value={200}>1.0x Speed</option>
              <option value={80}>2.5x Fast</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bar Chart Animated Visualizer Canvas */}
      <div className="h-56 w-full flex items-end justify-center gap-2 sm:gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
        {array.map((val, idx) => {
          const isComparing = comparingIndices.includes(idx);
          const isSorted = sortedIndices.includes(idx);

          let barColor = 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
          if (isComparing) {
            barColor = 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105';
          } else if (isSorted) {
            barColor = 'bg-emerald-500 text-white';
          }

          return (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full max-w-[48px]">
              <span className="text-[10px] font-mono font-black mb-1 text-slate-600 dark:text-slate-400">
                {val}
              </span>
              <div
                className={`w-full rounded-t-xl transition-all duration-150 flex items-center justify-center ${barColor}`}
                style={{ height: `${(val / 100) * 100}%` }}
              />
              <span className="text-[9px] font-mono text-slate-400 mt-1">[{idx}]</span>
            </div>
          );
        })}
      </div>

      {/* Algorithm Specs & Complexity Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Algorithm</span>
          <span className="block font-black text-slate-900 dark:text-white mt-0.5">{details.name}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Best Case</span>
          <span className="block font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{details.timeBest}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Avg / Worst Case</span>
          <span className="block font-mono font-black text-rose-600 dark:text-rose-400 mt-0.5">{details.timeAvg}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Auxiliary Space</span>
          <span className="block font-mono font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{details.space}</span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// INTERACTIVE BINARY SEARCH STEPPER COMPONENT
// ----------------------------------------------------------------------------
function BinarySearchVisualizer() {
  const sortedArr = [3, 8, 14, 22, 35, 48, 59, 70, 84, 96];
  const [target, setTarget] = useState<number>(48);
  const [low, setLow] = useState<number>(0);
  const [high, setHigh] = useState<number>(sortedArr.length - 1);
  const [mid, setMid] = useState<number>(Math.floor((0 + sortedArr.length - 1) / 2));
  const [stepCount, setStepCount] = useState<number>(1);
  const [status, setStatus] = useState<'searching' | 'found' | 'not_found'>('searching');

  const resetSearch = (newTarget: number) => {
    setTarget(newTarget);
    const initialLow = 0;
    const initialHigh = sortedArr.length - 1;
    const initialMid = Math.floor((initialLow + initialHigh) / 2);
    setLow(initialLow);
    setHigh(initialHigh);
    setMid(initialMid);
    setStepCount(1);
    if (sortedArr[initialMid] === newTarget) {
      setStatus('found');
    } else {
      setStatus('searching');
    }
  };

  const handleNextStep = () => {
    if (status !== 'searching') return;

    if (sortedArr[mid] === target) {
      setStatus('found');
      return;
    }

    if (low >= high) {
      setStatus('not_found');
      return;
    }

    if (sortedArr[mid] < target) {
      const nextLow = mid + 1;
      const nextMid = Math.floor((nextLow + high) / 2);
      setLow(nextLow);
      setMid(nextMid);
      setStepCount(prev => prev + 1);
      if (sortedArr[nextMid] === target) {
        setStatus('found');
      } else if (nextLow > high) {
        setStatus('not_found');
      }
    } else {
      const nextHigh = mid - 1;
      const nextMid = Math.floor((low + nextHigh) / 2);
      setHigh(nextHigh);
      setMid(nextMid);
      setStepCount(prev => prev + 1);
      if (sortedArr[nextMid] === target) {
        setStatus('found');
      } else if (low > nextHigh) {
        setStatus('not_found');
      }
    }
  };

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">Binary Search O(log N) Pointer Visualizer</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step through low, mid, and high pointer intervals to halve the search domain each iteration.
          </p>
        </div>

        {/* Quick Target Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Target Value:</span>
          <select
            value={target}
            onChange={(e) => resetSearch(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-900 dark:text-white focus:outline-none cursor-pointer"
          >
            {[3, 14, 35, 48, 70, 96, 50].map((val) => (
              <option key={val} value={val}>
                {val} {val === 50 ? '(Not in list)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pointer Indicators Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 text-xs">
        <div className="flex items-center gap-4 font-bold">
          <div>
            <span className="text-indigo-600 dark:text-indigo-400">Low Pointer:</span> [{low}] ({sortedArr[low] ?? 'N/A'})
          </div>
          <div>
            <span className="text-amber-600 dark:text-amber-400">Mid Index:</span> [{mid}] ({sortedArr[mid] ?? 'N/A'})
          </div>
          <div>
            <span className="text-purple-600 dark:text-purple-400">High Pointer:</span> [{high}] ({sortedArr[high] ?? 'N/A'})
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={status !== 'searching'}
            onClick={handleNextStep}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
              status === 'searching'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Next Step ({stepCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => resetSearch(target)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            title="Reset Search"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Array Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
        {sortedArr.map((val, idx) => {
          const isMid = idx === mid;
          const isLow = idx === low;
          const isHigh = idx === high;
          const isOutOfRange = idx < low || idx > high;
          const isFound = status === 'found' && idx === mid;

          let cardBorder = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
          if (isFound) {
            cardBorder = 'border-emerald-500 bg-emerald-500/15 text-emerald-600 shadow-lg shadow-emerald-500/20 scale-105';
          } else if (isMid) {
            cardBorder = 'border-amber-500 bg-amber-500/15 text-amber-600 shadow-md scale-105';
          } else if (isOutOfRange) {
            cardBorder = 'border-transparent bg-slate-100/50 dark:bg-slate-900/30 text-slate-300 dark:text-slate-600 opacity-40';
          }

          return (
            <div key={idx} className={`p-3 rounded-2xl border text-center transition-all ${cardBorder}`}>
              <span className="block text-base font-black font-mono">{val}</span>
              <span className="block text-[9px] font-mono text-slate-400 mt-1">idx {idx}</span>
              <div className="flex flex-col gap-0.5 mt-1">
                {isLow && <span className="text-[8px] font-black uppercase text-indigo-500">LOW</span>}
                {isMid && <span className="text-[8px] font-black uppercase text-amber-500">MID</span>}
                {isHigh && <span className="text-[8px] font-black uppercase text-purple-500">HIGH</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Result feedback */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {status === 'found' && `Target value ${target} successfully located at index [${mid}] in ${stepCount} step(s)!`}
            {status === 'not_found' && `Target value ${target} is not present in the sorted array (search bounded).`}
            {status === 'searching' && `Comparing target (${target}) with arr[mid=${mid}] = ${sortedArr[mid]}.`}
          </span>
        </div>
        <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">Time: O(log N)</span>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MAIN ACADEMY LEARN PAGE COMPONENT
// ----------------------------------------------------------------------------
export default function AcademyLearn() {
  const [activeVisualTab, setActiveVisualTab] = useState<'all' | 'sql' | 'ds' | 'sorting' | 'search'>('all');

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-4 text-left animate-fadeIn pb-16">
      <SEO
        title="Visual Explainers & Computer Science Simulators | Toolique Academy"
        description="Master programming, algorithms, and database query mechanics visually. Interactive sandboxes for SQL JOINs, Stacks, Queues, Sorting algorithms, and Binary Search pointer intervals."
        canonicalUrl="https://www.toolique.in/academy/learn"
      />

      {/* Back button & Hero Panel */}
      <div className="space-y-4">
        <Link 
          to="/academy"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Academy Portal
        </Link>

        {/* Hero Header Banner */}
        <div className="relative p-6 sm:p-10 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Interactive CS Simulators
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800/80 text-slate-300 border border-slate-700">
                Live State Engines
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Visual Explainers &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Mental Models</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Build concrete, intuitive understanding of relational algebra, memory pointer transitions, data structures, and algorithmic time complexity with interactive visual sandboxes.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80 mt-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Installation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Real-Time State Transitions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Interactive Controls &amp; Steppers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Filter Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'All Visualizers', icon: Layers },
          { id: 'sql', label: 'SQL JOIN Venn Engine', icon: Database },
          { id: 'ds', label: 'Data Structures Node Stack', icon: Binary },
          { id: 'sorting', label: 'Sorting Step Animator', icon: BarChart3 },
          { id: 'search', label: 'Binary Search O(log N)', icon: Search }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isSelected = activeVisualTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveVisualTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 border whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm border-slate-900 dark:border-white'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Visualizers Stack */}
      <div className="space-y-10">
        {/* Engine 1: SQL JOIN Visualizer */}
        {(activeVisualTab === 'all' || activeVisualTab === 'sql') && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-500" />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Relational Algebra • Set Operations
                </h2>
              </div>
              <Link to="/academy/sql" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <span>Explore SQL Track</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <JoinVisualizer />
          </section>
        )}

        {/* Engine 2: Data Structures Node Simulator */}
        {(activeVisualTab === 'all' || activeVisualTab === 'ds') && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Binary className="w-4 h-4 text-purple-500" />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Memory Management • LIFO / FIFO Structures
                </h2>
              </div>
              <Link to="/academy/javascript" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <span>Explore JS Track</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <DataStructureVisual />
          </section>
        )}

        {/* Engine 3: Sorting Algorithm Simulator */}
        {(activeVisualTab === 'all' || activeVisualTab === 'sorting') && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Comparison Sorts • Swap Animations
                </h2>
              </div>
              <Link to="/academy/python" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <span>Explore Python Track</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <SortingVisualizer />
          </section>
        )}

        {/* Engine 4: Binary Search Visualizer */}
        {(activeVisualTab === 'all' || activeVisualTab === 'search') && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-500" />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Divide &amp; Conquer • O(log N) Interval Halving
                </h2>
              </div>
              <Link to="/academy/qa" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                <span>Explore QA Track</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <BinarySearchVisualizer />
          </section>
        )}
      </div>

      {/* Quick CS Architecture & Complexity Reference Footer */}
      <section className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">Time &amp; Space Complexity Quick Reference</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">O(1) Constant</span>
            <p className="text-[11px] text-slate-500">Hash map lookup, Array index seek, Stack push/pop.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-mono font-black text-blue-600 dark:text-blue-400">O(log N) Logarithmic</span>
            <p className="text-[11px] text-slate-500">Binary Search, Balanced Binary Search Tree (BST) query.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">O(N log N) Linearithmic</span>
            <p className="text-[11px] text-slate-500">Merge Sort, Heap Sort, Quick Sort (average case).</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="font-mono font-black text-rose-600 dark:text-rose-400">O(N²) Quadratic</span>
            <p className="text-[11px] text-slate-500">Nested loops, Bubble Sort, Selection Sort, Cartesian Product.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
