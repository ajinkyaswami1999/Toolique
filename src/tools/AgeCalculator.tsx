import { useState, useEffect } from 'react';
import { Clock, Gift, Copy, Check } from 'lucide-react';

export default function AgeCalculator() {
  const [dob, setDob] = useState<string>('2000-01-01');
  const [targetDate, setTargetDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [copied, setCopied] = useState<boolean>(false);

  const [results, setResults] = useState({
    years: 0,
    months: 0,
    days: 0,
    totalMonths: 0,
    totalWeeks: 0,
    totalDays: 0,
    totalHours: 0,
    totalMinutes: 0,
    nextBirthdayMonths: 0,
    nextBirthdayDays: 0,
    nextBirthdayWeekday: '',
  });

  useEffect(() => {
    const birth = new Date(dob);
    const target = new Date(targetDate);

    if (isNaN(birth.getTime()) || isNaN(target.getTime()) || birth > target) {
      return;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      // Get days in previous month
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Total metrics
    const diffMs = target.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalMonths = years * 12 + months;
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Next Birthday calculations
    const nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < target) {
      nextBday.setFullYear(target.getFullYear() + 1);
    }

    let nBdayMonths = nextBday.getMonth() - target.getMonth();
    let nBdayDays = nextBday.getDate() - target.getDate();

    if (nBdayDays < 0) {
      nBdayMonths -= 1;
      const prevMonth = new Date(nextBday.getFullYear(), nextBday.getMonth(), 0);
      nBdayDays += prevMonth.getDate();
    }

    if (nBdayMonths < 0) {
      nBdayMonths += 12;
    }

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const nextBirthdayWeekday = weekdays[nextBday.getDay()];

    setResults({
      years,
      months,
      days,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      nextBirthdayMonths: nBdayMonths,
      nextBirthdayDays: nBdayDays,
      nextBirthdayWeekday,
    });
  }, [dob, targetDate]);

  const copyReport = () => {
    const text = `Age Report (Toolique)
----------------------------------------
Date of Birth : ${dob}
Age at Date   : ${targetDate}
----------------------------------------
Exact Age     : ${results.years} Years, ${results.months} Months, ${results.days} Days
Total Months  : ${results.totalMonths.toLocaleString()} Months
Total Weeks   : ${results.totalWeeks.toLocaleString()} Weeks
Total Days    : ${results.totalDays.toLocaleString()} Days
Next Birthday : ${results.nextBirthdayMonths} Months, ${results.nextBirthdayDays} Days left (on a ${results.nextBirthdayWeekday})
----------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Panel */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Choose Dates</h3>

        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Date of Birth (DOB)
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Calculate Age At Date
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
          />
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-7 space-y-6">
        {/* Core Age Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Exact Age Result</span>
              <h3 className="text-xl font-bold text-slate-200 mt-1">Current Age</h3>
            </div>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-around items-center py-4">
            <div className="text-center">
              <span className="text-4xl md:text-5xl font-black text-teal-400">{results.years}</span>
              <span className="block text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Years</span>
            </div>
            <div className="text-center">
              <span className="text-4xl md:text-5xl font-black text-indigo-400">{results.months}</span>
              <span className="block text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Months</span>
            </div>
            <div className="text-center">
              <span className="text-4xl md:text-5xl font-black text-white">{results.days}</span>
              <span className="block text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">Days</span>
            </div>
          </div>
        </div>

        {/* Next Birthday & Cumulative details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Next Birthday */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Next Birthday</span>
              <div className="text-base font-bold text-slate-800 dark:text-white mt-1">
                {results.nextBirthdayMonths === 0 && results.nextBirthdayDays === 0 ? (
                  <span className="text-rose-500 font-black">Happy Birthday! 🎂</span>
                ) : (
                  `${results.nextBirthdayMonths}m ${results.nextBirthdayDays}d left`
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">Will fall on a {results.nextBirthdayWeekday}</div>
            </div>
          </div>

          {/* Time metrics list */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Time Stats
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1">
                <span className="text-slate-400">Total Months:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{results.totalMonths.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1">
                <span className="text-slate-400">Total Weeks:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{results.totalWeeks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1">
                <span className="text-slate-400">Total Days:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{results.totalDays.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/50 pb-1">
                <span className="text-slate-400">Total Hours:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{results.totalHours.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

