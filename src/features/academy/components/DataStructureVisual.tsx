import { useState } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export default function DataStructureVisual() {
  const [dsType, setDsType] = useState<'stack' | 'queue' | 'list'>('stack');
  const [elements, setElements] = useState<number[]>([10, 20, 30]);
  const [inputValue, setInputValue] = useState('');

  const handlePush = () => {
    if (inputValue.trim() === '') return;
    const val = parseInt(inputValue);
    if (isNaN(val)) return;

    if (elements.length >= 8) {
      alert("Visualizer supports up to 8 nodes to maintain viewport alignment.");
      return;
    }

    if (dsType === 'stack') {
      // Stack LIFO: add to end (top)
      setElements([...elements, val]);
    } else if (dsType === 'queue') {
      // Queue FIFO: add to end (rear)
      setElements([...elements, val]);
    } else {
      // List: append to end
      setElements([...elements, val]);
    }
    setInputValue('');
  };

  const handlePop = () => {
    if (elements.length === 0) return;

    if (dsType === 'stack') {
      // Stack: remove last element (top)
      setElements(elements.slice(0, -1));
    } else if (dsType === 'queue') {
      // Queue: remove first element (front)
      setElements(elements.slice(1));
    } else {
      // List: remove last element
      setElements(elements.slice(0, -1));
    }
  };

  const handleReset = () => {
    setElements([10, 20, 30]);
    setInputValue('');
  };

  return (
    <div className="space-y-6 p-6 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Data Structures Visualizer</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Push/Pop items to visual arrays representing Stack, Queue, or LinkedList.</p>
        </div>

        {/* Ds Toggle Buttons */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl shrink-0">
          {(['stack', 'queue', 'list'] as const).map(type => (
            <button
              key={type}
              onClick={() => {
                setDsType(type);
                setElements([10, 20, 30]);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                dsType === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Control Actions Form */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="number"
          placeholder="Value (e.g. 40)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:border-indigo-500 w-28 text-zinc-850 dark:text-zinc-150"
        />
        <button
          onClick={handlePush}
          className="saas-button-primary py-1.5 px-3 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> 
          {dsType === 'stack' ? 'Push' : dsType === 'queue' ? 'Enqueue' : 'Append'}
        </button>
        <button
          onClick={handlePop}
          className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-[10px] font-black uppercase tracking-wider text-zinc-650 dark:text-zinc-300 flex items-center gap-1 cursor-pointer"
          disabled={elements.length === 0}
        >
          <Minus className="w-3.5 h-3.5" /> 
          {dsType === 'stack' ? 'Pop' : dsType === 'queue' ? 'Dequeue' : 'Remove'}
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-850 text-zinc-500 hover:text-indigo-500 transition cursor-pointer"
          title="Reset Structures"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Visualizer Canvas display */}
      <div className="py-10 border border-zinc-200/50 dark:border-zinc-850/50 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl flex items-center justify-center min-h-[14rem] overflow-x-auto px-4">
        {elements.length > 0 ? (
          <div className="flex items-center gap-4">
            {elements.map((value, idx) => {
              const isStackTop = dsType === 'stack' && idx === elements.length - 1;
              const isQueueFront = dsType === 'queue' && idx === 0;
              const isQueueRear = dsType === 'queue' && idx === elements.length - 1;
              const isListHead = dsType === 'list' && idx === 0;
              const isListTail = dsType === 'list' && idx === elements.length - 1;

              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5">
                    {/* Upper pointer label */}
                    <div className="h-6 flex items-end">
                      {isStackTop && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded border border-rose-500/20">
                          Top (LIFO)
                        </span>
                      )}
                      {isQueueFront && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Front
                        </span>
                      )}
                      {isListHead && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded border border-indigo-500/20">
                          Head
                        </span>
                      )}
                    </div>

                    {/* The Visual Block */}
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white dark:bg-indigo-500 flex items-center justify-center font-mono font-bold text-sm shadow-md border border-indigo-500/20 scale-in animate-scale-in transition-all duration-300">
                      {value}
                    </div>

                    {/* Lower pointer label */}
                    <div className="h-6 flex items-start">
                      {isQueueRear && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-500 px-1.5 py-0.5 rounded border border-teal-500/20">
                          Rear (FIFO)
                        </span>
                      )}
                      {isListTail && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-500 px-1.5 py-0.5 rounded border border-teal-500/20">
                          Tail
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Node arrow pointer (for LinkedList) */}
                  {dsType === 'list' && idx < elements.length - 1 && (
                    <div className="text-indigo-400 font-black text-lg select-none px-1">
                      ➔
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-xs text-zinc-450 dark:text-zinc-600 py-6">
            Structure is empty. Push/append a value to visualize.
          </div>
        )}
      </div>
    </div>
  );
}
