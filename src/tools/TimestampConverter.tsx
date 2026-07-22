/* eslint-disable react-hooks/purity */
import { useState, useEffect, useMemo } from 'react';
import { Copy, Clock, Calendar, ArrowRightLeft } from 'lucide-react';

export default function TimestampConverter() {
  const [currentEpoch, setCurrentEpoch] = useState(() => Math.floor(Date.now() / 1000));
  const [copiedClock, setCopiedClock] = useState(false);

  // Epoch to Date state
  const [inputEpoch, setInputEpoch] = useState<string>(() => Math.floor(Date.now() / 1000).toString());

  // Date to Epoch state
  const [inputDate, setInputDate] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 19);
  });

  const [copiedResult, setCopiedResult] = useState<string | null>(null);

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Derived Epoch to Date details
  const epochResult = useMemo(() => {
    if (!inputEpoch.trim() || isNaN(Number(inputEpoch))) {
      return null;
    }

    let num = Number(inputEpoch);
    // Auto-detect seconds vs milliseconds (millisecond length is typically 13 digits)
    const isMs = inputEpoch.trim().length >= 13;
    if (!isMs) {
      num = num * 1000;
    }

    const date = new Date(num);
    if (isNaN(date.getTime())) {
      return null;
    }

    // Relative time string helper
    const now = Date.now();
    const diff = date.getTime() - now;
    const absDiff = Math.abs(diff);
    
    let relative: string;
    const secs = Math.floor(absDiff / 1000);
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (secs < 60) {
      relative = diff > 0 ? 'just now' : 'seconds ago';
    } else if (mins < 60) {
      relative = diff > 0 ? `in ${mins} minutes` : `${mins} minutes ago`;
    } else if (hours < 24) {
      relative = diff > 0 ? `in ${hours} hours` : `${hours} hours ago`;
    } else {
      relative = diff > 0 ? `in ${days} days` : `${days} days ago`;
    }

    return {
      local: date.toString(),
      utc: date.toUTCString(),
      iso: date.toISOString(),
      relative
    };
  }, [inputEpoch]);

  // Derived Date to Epoch details
  const dateResult = useMemo(() => {
    if (!inputDate) {
      return null;
    }
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) {
      return null;
    }
    return {
      seconds: Math.floor(date.getTime() / 1000),
      milliseconds: date.getTime()
    };
  }, [inputDate]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResult(label);
    setTimeout(() => setCopiedResult(null), 2000);
  };

  const handleCopyClock = () => {
    navigator.clipboard.writeText(currentEpoch.toString());
    setCopiedClock(true);
    setTimeout(() => setCopiedClock(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 gap-6 text-left">
      {/* Live Clock Card */}
      <div className="saas-card p-6 bg-zinc-900 border border-zinc-800 text-white relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-450">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Current Unix Epoch Time</span>
          </div>
          <span className="text-3xl font-black font-mono tracking-tight text-white">{currentEpoch}</span>
        </div>
        <button
          onClick={handleCopyClock}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>{copiedClock ? 'Copied!' : 'Copy Current Epoch'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Epoch to Date */}
        <div className="saas-card p-6 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <span>Epoch to Date Time</span>
          </h3>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Unix Epoch Timestamp</label>
            <input
              type="text"
              value={inputEpoch}
              onChange={(e) => setInputEpoch(e.target.value)}
              className="saas-input w-full"
              placeholder="e.g. 1772189033"
            />
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-1">
              Supports seconds (10 digits) and milliseconds (13 digits) format automatically.
            </span>
          </div>

          {epochResult ? (
            <div className="space-y-4 pt-2">
              <div className="relative p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-850 flex justify-between items-center">
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Local Time</span>
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{epochResult.local}</span>
                </div>
                <button onClick={() => handleCopy(epochResult.local, 'local')} className="text-indigo-500 hover:underline text-[10px] font-bold shrink-0 ml-2">
                  {copiedResult === 'local' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="relative p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-850 flex justify-between items-center">
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wide">UTC Time</span>
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{epochResult.utc}</span>
                </div>
                <button onClick={() => handleCopy(epochResult.utc, 'utc')} className="text-indigo-500 hover:underline text-[10px] font-bold shrink-0 ml-2">
                  {copiedResult === 'utc' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="relative p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-850 flex justify-between items-center">
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wide">ISO 8601</span>
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{epochResult.iso}</span>
                </div>
                <button onClick={() => handleCopy(epochResult.iso, 'iso')} className="text-indigo-500 hover:underline text-[10px] font-bold shrink-0 ml-2">
                  {copiedResult === 'iso' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="p-3 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-xl border border-indigo-500/10">
                <span className="block text-[9px] font-bold text-indigo-600/80 dark:text-indigo-400 uppercase tracking-wide">Relative Calendar</span>
                <span className="text-xs font-black text-indigo-700 dark:text-indigo-350 capitalize">{epochResult.relative}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center rounded-xl bg-zinc-50 dark:bg-zinc-950 border text-xs text-zinc-400 border-zinc-100 dark:border-zinc-850">
              Enter a valid epoch integer to review parameters.
            </div>
          )}
        </div>

        {/* Date to Epoch */}
        <div className="saas-card p-6 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
            <span>Date Time to Epoch</span>
          </h3>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Date & Time Selection</label>
            <input
              type="datetime-local"
              step="1"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="saas-input w-full cursor-pointer"
            />
          </div>

          {dateResult ? (
            <div className="space-y-4 pt-2">
              <div className="relative p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-850 flex justify-between items-center">
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Epoch in Seconds</span>
                  <span className="text-lg font-black font-mono text-zinc-800 dark:text-zinc-100">{dateResult.seconds}</span>
                </div>
                <button onClick={() => handleCopy(dateResult.seconds.toString(), 'secs')} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
                  {copiedResult === 'secs' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="relative p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-850 flex justify-between items-center">
                <div>
                  <span className="block text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Epoch in Milliseconds</span>
                  <span className="text-lg font-black font-mono text-zinc-800 dark:text-zinc-100">{dateResult.milliseconds}</span>
                </div>
                <button onClick={() => handleCopy(dateResult.milliseconds.toString(), 'ms')} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
                  {copiedResult === 'ms' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center rounded-xl bg-zinc-50 dark:bg-zinc-950 border text-xs text-zinc-400 border-zinc-100 dark:border-zinc-850">
              Provide a date selection to check values.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
