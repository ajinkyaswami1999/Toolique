import { useState } from 'react';
import { Copy, Clock, Calendar, Check } from 'lucide-react';

const matchesCronPart = (val: number, pattern: string, min: number): boolean => {
  if (pattern === '*') return true;
  if (pattern.includes('/')) {
    const parts = pattern.split('/');
    const step = parseInt(parts[1], 10);
    const start = parts[0] === '*' ? min : parseInt(parts[0], 10);
    return (val - start) % step === 0;
  }
  if (pattern.includes(',')) {
    return pattern.split(',').map(Number).includes(val);
  }
  if (pattern.includes('-')) {
    const parts = pattern.split('-');
    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);
    return val >= start && val <= end;
  }
  return parseInt(pattern, 10) === val;
};

const getNextExecutions = (cronExpression: string): Date[] => {
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length < 5) return [];
  const [minPat, hourPat, domPat, monthPat, dowPat] = parts;

  const executions: Date[] = [];
  const testDate = new Date();
  testDate.setSeconds(0);
  testDate.setMilliseconds(0);
  testDate.setMinutes(testDate.getMinutes() + 1);

  // Limit scan to 1 year to avoid browser lock
  const maxScanMinutes = 365 * 24 * 60;
  let minutesScanned = 0;

  while (executions.length < 5 && minutesScanned < maxScanMinutes) {
    const min = testDate.getMinutes();
    const hour = testDate.getHours();
    const dom = testDate.getDate();
    const month = testDate.getMonth() + 1;
    const dow = testDate.getDay();

    if (
      matchesCronPart(min, minPat, 0) &&
      matchesCronPart(hour, hourPat, 0) &&
      matchesCronPart(dom, domPat, 1) &&
      matchesCronPart(month, monthPat, 1) &&
      matchesCronPart(dow, dowPat, 0)
    ) {
      executions.push(new Date(testDate));
    }

    testDate.setMinutes(testDate.getMinutes() + 1);
    minutesScanned++;
  }

  return executions;
};

const translateCron = (cronStr: string): string => {
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length < 5) return 'Invalid expression structure. Requires 5 space-separated parts.';
  const [min, hour, dom, month, dow] = parts;

  const minDesc = min === '*'
    ? 'every minute'
    : min.startsWith('*/')
    ? `every ${min.split('/')[1]} minutes`
    : `at minute ${min}`;

  const hourDesc = hour === '*'
    ? 'every hour'
    : hour.startsWith('*/')
    ? `every ${hour.split('/')[1]} hours`
    : (() => {
        const h = parseInt(hour, 10);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 === 0 ? 12 : h % 12;
        return `at ${displayHour} ${suffix}`;
      })();

  const domDesc = dom === '*' 
    ? 'every day' 
    : `on day ${dom} of the month`;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthDesc = month === '*'
    ? 'every month'
    : month.includes(',')
    ? `in ${month.split(',').map(m => months[parseInt(m, 10) - 1]).join(', ')}`
    : `in ${months[parseInt(month, 10) - 1] || 'month ' + month}`;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dowDesc = dow === '*'
    ? 'every day of the week'
    : dow.includes(',')
    ? `on ${dow.split(',').map(d => days[parseInt(d, 10)]).join(', ')}`
    : `on ${days[parseInt(dow, 15)] || 'weekday ' + dow}`;

  return `Runs ${minDesc}, ${hourDesc}, ${domDesc}, ${monthDesc}, ${dowDesc}.`;
};

export default function CronGenerator() {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [dayOfMonth, setDayOfMonth] = useState('*');
  const [month, setMonth] = useState('*');
  const [dayOfWeek, setDayOfWeek] = useState('*');

  const [copied, setCopied] = useState(false);

  const cronString = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const nextDates = getNextExecutions(cronString);
  const description = translateCron(cronString);

  const handleCopy = () => {
    navigator.clipboard.writeText(cronString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPreset = (preset: string) => {
    switch (preset) {
      case 'every-min':
        setMinute('*'); setHour('*'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*');
        break;
      case 'every-5-min':
        setMinute('*/5'); setHour('*'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*');
        break;
      case 'hourly':
        setMinute('0'); setHour('*'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*');
        break;
      case 'daily-midnight':
        setMinute('0'); setHour('0'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('*');
        break;
      case 'weekly-sunday':
        setMinute('0'); setHour('0'); setDayOfMonth('*'); setMonth('*'); setDayOfWeek('0');
        break;
      case 'monthly-first':
        setMinute('0'); setHour('0'); setDayOfMonth('1'); setMonth('*'); setDayOfWeek('*');
        break;
      default:
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
      {/* Configuration Column */}
      <div className="lg:col-span-2 saas-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>Cron Expression Builder</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Build cron schedule formats using manual parameters or common presets.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <span className="text-zinc-500">Preset:</span>
            <select
              onChange={(e) => handleApplyPreset(e.target.value)}
              defaultValue=""
              className="bg-transparent border-none focus:outline-none cursor-pointer text-zinc-700 dark:text-zinc-300"
            >
              <option value="" disabled>Choose Preset</option>
              <option value="every-min">Every Minute</option>
              <option value="every-5-min">Every 5 Minutes</option>
              <option value="hourly">Hourly (at min 0)</option>
              <option value="daily-midnight">Daily (at Midnight)</option>
              <option value="weekly-sunday">Weekly (Sunday Midnight)</option>
              <option value="monthly-first">Monthly (Day 1 Midnight)</option>
            </select>
          </div>
        </div>

        {/* Builder Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wide">Minute</label>
            <input
              type="text"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              className="saas-input w-full font-mono text-center"
              placeholder="*"
            />
            <span className="text-[9px] text-zinc-400 block text-center">0 - 59, *</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wide">Hour</label>
            <input
              type="text"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="saas-input w-full font-mono text-center"
              placeholder="*"
            />
            <span className="text-[9px] text-zinc-400 block text-center">0 - 23, *</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wide">Day of Month</label>
            <input
              type="text"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              className="saas-input w-full font-mono text-center"
              placeholder="*"
            />
            <span className="text-[9px] text-zinc-400 block text-center">1 - 31, *</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wide">Month</label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="saas-input w-full font-mono text-center"
              placeholder="*"
            />
            <span className="text-[9px] text-zinc-400 block text-center">1 - 12, *</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wide">Day of Week</label>
            <input
              type="text"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="saas-input w-full font-mono text-center"
              placeholder="*"
            />
            <span className="text-[9px] text-zinc-400 block text-center">0 - 6 (Sun-Sat)</span>
          </div>
        </div>

        {/* Translation Banner */}
        <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-xl border border-indigo-500/10">
          <span className="block text-[10px] font-bold text-indigo-500 uppercase tracking-wide mb-1">Human Translation</span>
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Output and Next Execution Column */}
      <div className="saas-card p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
            Cron Output & Predictor
          </h3>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wide">Expression</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={cronString}
                className="saas-input w-full font-mono text-base bg-zinc-50 dark:bg-zinc-950 font-black text-indigo-600 dark:text-indigo-400"
              />
              <button
                onClick={handleCopy}
                className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center shrink-0 shadow"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-zinc-150 dark:border-zinc-850">
          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>Next 5 Executions</span>
          </div>

          <div className="space-y-2">
            {nextDates.length > 0 ? (
              nextDates.map((date, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-lg text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 flex justify-between"
                >
                  <span className="text-zinc-400">#{idx + 1}</span>
                  <span>
                    {date.toLocaleDateString()} {date.toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                Invalid syntax or no executions matches.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
