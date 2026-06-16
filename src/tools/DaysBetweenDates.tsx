import { useState, useEffect } from 'react';
import { CalendarRange, RotateCcw } from 'lucide-react';

export default function DaysBetweenDates() {
  const [startDateStr, setStartDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [endDateStr, setEndDateStr] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [includeEndDate, setIncludeEndDate] = useState<boolean>(false);

  const [results, setResults] = useState<{
    days: number;
    years: number;
    months: number;
    remainingDays: number;
    weeks: number;
    remainingWeekDays: number;
    hours: number;
    minutes: number;
  } | null>(null);

  useEffect(() => {
    if (!startDateStr || !endDateStr) return;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

    // Normalize dates to midnight UTC to avoid DST and timezone shift issues
    const date1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const date2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

    let diffMs = date2 - date1;
    let daysDiff = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // Handle negative difference (if end date is before start date)
    const isNegative = daysDiff < 0;
    let absoluteDays = Math.abs(daysDiff);

    if (includeEndDate && !isNegative) {
      absoluteDays += 1;
    } else if (includeEndDate && isNegative) {
      absoluteDays -= 1; // absolute value adjustments
    }

    // Compute Y-M-D breakdown using calendar dates (always forward start to end)
    const d1 = new Date(isNegative ? end : start);
    const d2 = new Date(isNegative ? start : end);

    if (includeEndDate) {
      d2.setDate(d2.getDate() + 1);
    }

    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate();

    if (days < 0) {
      months -= 1;
      // Get days in the previous month
      const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Compute weeks split
    const weeks = Math.floor(absoluteDays / 7);
    const remainingWeekDays = absoluteDays % 7;

    setResults({
      days: daysDiff + (includeEndDate ? (isNegative ? -1 : 1) : 0),
      years: isNegative ? -years : years,
      months: isNegative ? -months : months,
      remainingDays: isNegative ? -days : days,
      weeks: isNegative ? -weeks : weeks,
      remainingWeekDays: isNegative ? -remainingWeekDays : remainingWeekDays,
      hours: absoluteDays * 24,
      minutes: absoluteDays * 24 * 60,
    });
  }, [startDateStr, endDateStr, includeEndDate]);

  const resetFields = () => {
    setStartDateStr(new Date().toISOString().split('T')[0]);
    setEndDateStr(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIncludeEndDate(false);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* Left Input Panel */}
      <div className="md:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <CalendarRange className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Duration Calculation</h3>
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
            value={startDateStr}
            onChange={(e) => setStartDateStr(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            End Date
          </label>
          <input
            type="date"
            value={endDateStr}
            onChange={(e) => setEndDateStr(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Option: Include End Date */}
        <label className="flex items-center gap-3 cursor-pointer py-1 select-none">
          <input
            type="checkbox"
            checked={includeEndDate}
            onChange={(e) => setIncludeEndDate(e.target.checked)}
            className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 dark:border-slate-800 bg-transparent"
          />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Include end date in calculation (adds 1 day)
          </span>
        </label>
      </div>

      {/* Right Output Panel */}
      <div className="md:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-4">
            Duration Result
          </span>

          {results ? (
            <div className="space-y-5">
              {/* Primary Output */}
              <div>
                <span className="text-xs font-semibold text-slate-450 dark:text-slate-400">Total Difference</span>
                <div className="text-2xl md:text-3xl font-black text-teal-600 dark:text-teal-400 mt-1 leading-tight font-mono">
                  {Math.abs(results.days).toLocaleString()} {Math.abs(results.days) === 1 ? 'Day' : 'Days'}
                </div>
                {results.days < 0 && (
                  <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 mt-0.5 block">
                    (End date is in the past)
                  </span>
                )}
              </div>

              {/* Calendar Split */}
              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <span className="text-xs font-semibold text-slate-450 dark:text-slate-400 block mb-2">Detailed Breakdown</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    <div className="text-base font-black text-slate-700 dark:text-slate-200 font-mono">{Math.abs(results.years)}</div>
                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Years</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    <div className="text-base font-black text-slate-700 dark:text-slate-200 font-mono">{Math.abs(results.months)}</div>
                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Months</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    <div className="text-base font-black text-slate-700 dark:text-slate-200 font-mono">{Math.abs(results.remainingDays)}</div>
                    <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Days</div>
                  </div>
                </div>
              </div>

              {/* Extra Stats */}
              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Weeks Split</span>
                  <span className="font-bold text-slate-650 dark:text-slate-300 font-mono">
                    {Math.abs(results.weeks)} {Math.abs(results.weeks) === 1 ? 'week' : 'weeks'} {Math.abs(results.remainingWeekDays)} {Math.abs(results.remainingWeekDays) === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Total Hours</span>
                  <span className="font-bold text-slate-650 dark:text-slate-300 font-mono">
                    {results.hours.toLocaleString()} hrs
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Total Minutes</span>
                  <span className="font-bold text-slate-650 dark:text-slate-300 font-mono">
                    {results.minutes.toLocaleString()} mins
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400 dark:text-slate-500">
              Select start and end dates to compute duration.
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
          <p>
            Computes difference between two dates. Ideal for billing periods, project timelines, age counts, or event planning.
          </p>
        </div>
      </div>
    </div>
  );
}

