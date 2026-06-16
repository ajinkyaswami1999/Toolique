import { useState, useEffect } from 'react';
import { Calendar, Plus, Minus, RotateCcw } from 'lucide-react';

export default function DateCalculator() {
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [years, setYears] = useState<number>(0);
  const [months, setMonths] = useState<number>(0);
  const [weeks, setWeeks] = useState<number>(0);
  const [days, setDays] = useState<number>(0);
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [resultDate, setResultDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!startDate) return;
    const date = new Date(startDate);
    if (isNaN(date.getTime())) return;

    const factor = operation === 'add' ? 1 : -1;

    // Adjust years and months
    date.setFullYear(date.getFullYear() + (years * factor));
    date.setMonth(date.getMonth() + (months * factor));
    
    // Adjust days (weeks * 7 + days)
    const totalDays = (weeks * 7) + days;
    date.setDate(date.getDate() + (totalDays * factor));

    setResultDate(date);
  }, [startDate, years, months, weeks, days, operation]);

  const resetFields = () => {
    setYears(0);
    setMonths(0);
    setWeeks(0);
    setDays(0);
    setOperation('add');
    setStartDate(new Date().toISOString().split('T')[0]);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Left Input Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Date Calculations</h3>
          </div>
          <button
            onClick={resetFields}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-600 dark:hover:text-slate-200 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Operation Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-405 mb-1.5">
            Operation
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setOperation('add')}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-sm font-semibold transition ${
                operation === 'add'
                  ? 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-950/20 dark:border-teal-900/60 dark:text-teal-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Time
            </button>
            <button
              onClick={() => setOperation('subtract')}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-sm font-semibold transition ${
                operation === 'subtract'
                  ? 'bg-teal-50 border-teal-200 text-teal-600 dark:bg-teal-950/20 dark:border-teal-900/60 dark:text-teal-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Minus className="w-4 h-4" />
              Subtract Time
            </button>
          </div>
        </div>

        {/* Offsets inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Years
            </label>
            <input
              type="number"
              min="0"
              value={years || ''}
              onChange={(e) => setYears(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Months
            </label>
            <input
              type="number"
              min="0"
              value={months || ''}
              onChange={(e) => setMonths(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Weeks
            </label>
            <input
              type="number"
              min="0"
              value={weeks || ''}
              onChange={(e) => setWeeks(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Days
            </label>
            <input
              type="number"
              min="0"
              value={days || ''}
              onChange={(e) => setDays(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Right Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-4">
            Calculation Result
          </span>

          {resultDate && !isNaN(resultDate.getTime()) ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400">Target Date</span>
                <div className="text-xl md:text-2xl font-black text-teal-650 dark:text-teal-400 mt-1 leading-tight">
                  {formatDate(resultDate)}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Day of the year</span>
                  <span className="font-bold text-slate-650 dark:text-slate-300 font-mono">
                    {Math.floor(
                      (resultDate.getTime() - new Date(resultDate.getFullYear(), 0, 0).getTime()) /
                        86400000
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Leap Year</span>
                  <span className={`font-bold ${isLeapYear(resultDate.getFullYear()) ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {isLeapYear(resultDate.getFullYear()) ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Week number</span>
                  <span className="font-bold text-slate-650 dark:text-slate-300 font-mono">
                    {Math.ceil(
                      ((resultDate.getTime() - new Date(resultDate.getFullYear(), 0, 1).getTime()) /
                        86400000 +
                        new Date(resultDate.getFullYear(), 0, 1).getDay() +
                        1) /
                        7
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400 dark:text-slate-500">
              Please enter valid start date and offset values to compute target date.
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
          <p>
            Adds or subtracts specified increments of time from your base date, accounting for variable month lengths (28, 29, 30, or 31 days) and leap years.
          </p>
        </div>
      </div>
    </div>
  );
}

