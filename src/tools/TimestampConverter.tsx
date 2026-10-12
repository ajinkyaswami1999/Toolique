import { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Calendar,
  ArrowRightLeft,
  Copy,
  Check,
  Play,
  Pause,
  RefreshCw,
  Layers,
  Code2,
  Download,
  Zap,
  Globe,
  Hourglass
} from 'lucide-react';

type ConverterTab = 'studio' | 'batch' | 'diff' | 'snippets';

// World Timezone Presets
const TIMEZONE_OPTIONS = [
  { id: 'local', label: 'Local Browser Timezone' },
  { id: 'UTC', label: 'UTC / GMT (Coordinated Universal Time)' },
  { id: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, UTC+5:30)' },
  { id: 'America/New_York', label: 'America/New_York (EST/EDT, UTC-5/-4)' },
  { id: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT, UTC-8/-7)' },
  { id: 'America/Chicago', label: 'America/Chicago (CST/CDT, UTC-6/-5)' },
  { id: 'Europe/London', label: 'Europe/London (GMT/BST, UTC+0/+1)' },
  { id: 'Europe/Paris', label: 'Europe/Paris (CET/CEST, UTC+1/+2)' },
  { id: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST, UTC+1/+2)' },
  { id: 'Asia/Dubai', label: 'Asia/Dubai (GST, UTC+4)' },
  { id: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+8)' },
  { id: 'Asia/Tokyo', label: 'Asia/Tokyo (JST, UTC+9)' },
  { id: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT, UTC+10/+11)' }
];

// Developer Code Snippets
const CODE_SNIPPETS = [
  {
    lang: 'JavaScript / Node.js',
    getNow: 'Math.floor(Date.now() / 1000) // Seconds\nDate.now() // Milliseconds',
    parse: 'const date = new Date(epochSec * 1000);\nconsole.log(date.toISOString());'
  },
  {
    lang: 'Python (datetime / time)',
    getNow: 'import time\nint(time.time()) # Seconds\ntime.time_ns() # Nanoseconds',
    parse: 'from datetime import datetime, timezone\ndt = datetime.fromtimestamp(epoch_sec, tz=timezone.utc)\nprint(dt.isoformat())'
  },
  {
    lang: 'Go (golang)',
    getNow: 'time.Now().Unix() // Seconds\ntime.Now().UnixMilli() // Milliseconds',
    parse: 't := time.Unix(epochSec, 0)\nfmt.Println(t.UTC().Format(time.RFC3339))'
  },
  {
    lang: 'PHP',
    getNow: 'time(); // Current Epoch Seconds\n(int)(microtime(true) * 1000); // Ms',
    parse: "$date = (new DateTime('@' . $epochSec))->setTimezone(new DateTimeZone('UTC'));\necho $date->format(DateTime::ATOM);"
  },
  {
    lang: 'Java (java.time)',
    getNow: 'Instant.now().getEpochSecond(); // Seconds\nSystem.currentTimeMillis(); // Milliseconds',
    parse: 'Instant instant = Instant.ofEpochSecond(epochSec);\nZonedDateTime zdt = instant.atZone(ZoneId.of("UTC"));'
  },
  {
    lang: 'C# / .NET',
    getNow: 'DateTimeOffset.UtcNow.ToUnixTimeSeconds();\nDateTimeOffset.UtcNow.ToUnixTimeMilliseconds();',
    parse: 'DateTimeOffset dto = DateTimeOffset.FromUnixTimeSeconds(epochSec);\nConsole.WriteLine(dto.ToString("o"));'
  },
  {
    lang: 'Rust',
    getNow: 'use std::time::{SystemTime, UNIX_EPOCH};\nSystemTime::now().duration_since(UNIX_EPOCH)?.as_secs();',
    parse: 'use chrono::{DateTime, Utc};\nlet dt = DateTime::from_timestamp(epoch_sec, 0).unwrap();'
  },
  {
    lang: 'PostgreSQL / SQL',
    getNow: 'SELECT EXTRACT(EPOCH FROM NOW())::BIGINT;\n-- MySQL: SELECT UNIX_TIMESTAMP();',
    parse: 'SELECT TO_TIMESTAMP(epoch_sec) AT TIME ZONE \'UTC\';\n-- MySQL: SELECT FROM_UNIXTIME(epoch_sec);'
  },
  {
    lang: 'Bash / Linux CLI',
    getNow: 'date +%s # Seconds\ndate +%s%3N # Milliseconds',
    parse: 'date -d @1791786600 -u +"%Y-%m-%dT%H:%M:%SZ"\n# macOS BSD date: date -r 1791786600 -u'
  }
];

function normalizeTimestampToMs(val: string): { ms: number; unit: 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds' | 'invalid' } {
  const clean = val.trim();
  if (!clean || isNaN(Number(clean))) return { ms: NaN, unit: 'invalid' };
  
  const len = clean.replace(/^-/, '').length;
  const num = Number(clean);

  if (len <= 11) {
    return { ms: num * 1000, unit: 'seconds' };
  } else if (len <= 14) {
    return { ms: num, unit: 'milliseconds' };
  } else if (len <= 17) {
    return { ms: Math.floor(num / 1000), unit: 'microseconds' };
  } else {
    return { ms: Math.floor(num / 1000000), unit: 'nanoseconds' };
  }
}

function getRelativeTime(timestampMs: number): string {
  if (isNaN(timestampMs)) return 'Invalid date';
  const now = Date.now();
  const diffSec = Math.round((timestampMs - now) / 1000);
  
  try {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const abs = Math.abs(diffSec);
    if (abs < 45) return diffSec >= 0 ? 'just now' : 'a few seconds ago';
    if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
    if (abs < 86400 * 30) return rtf.format(Math.round(diffSec / 86400), 'day');
    if (abs < 86400 * 365) return rtf.format(Math.round(diffSec / (86400 * 30)), 'month');
    return rtf.format(Math.round(diffSec / (86400 * 365)), 'year');
  } catch {
    const absDiff = Math.abs(diffSec);
    const mins = Math.floor(absDiff / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (diffSec >= 0) {
      if (days > 0) return `in ${days} days`;
      if (hours > 0) return `in ${hours} hours`;
      return `in ${mins} minutes`;
    } else {
      if (days > 0) return `${days} days ago`;
      if (hours > 0) return `${hours} hours ago`;
      return `${mins} minutes ago`;
    }
  }
}

function getDayOfYearAndWeek(d: Date): { dayOfYear: number; weekNumber: number; isLeapYear: boolean } {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime() + ((start.getTimezoneOffset() - d.getTimezoneOffset()) * 60000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);

  const year = d.getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

  return { dayOfYear, weekNumber, isLeapYear };
}

function getEpochForTimezone(dateStr: string, timeZone: string): number {
  if (timeZone === 'local') {
    return new Date(dateStr).getTime();
  }
  if (timeZone === 'UTC') {
    return new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z')).getTime();
  }
  const localDate = new Date(dateStr);
  if (isNaN(localDate.getTime())) return NaN;
  const invDate = new Date(localDate.toLocaleString('en-US', { timeZone }));
  const diff = localDate.getTime() - invDate.getTime();
  return localDate.getTime() + diff;
}

export default function TimestampConverter() {
  const [activeTab, setActiveTab] = useState<ConverterTab>('studio');

  // Live ticking clock state
  const [isClockRunning, setIsClockRunning] = useState<boolean>(true);
  const [liveNow, setLiveNow] = useState<number>(() => Date.now());

  // Input states for single converter
  const [inputEpoch, setInputEpoch] = useState<string>(() => Math.floor(Date.now() / 1000).toString());
  const [selectedTimezone, setSelectedTimezone] = useState<string>('local');
  const [inputDateString, setInputDateString] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 19);
  });

  // Batch converter state
  const [batchInput, setBatchInput] = useState<string>(
    '1791786600\n1791786600000\n1577836800\n2147483647\n0'
  );
  const [batchCopied, setBatchCopied] = useState<boolean>(false);

  // Time diff state
  const [diffTimestampA, setDiffTimestampA] = useState<string>(() => Math.floor(Date.now() / 1000).toString());
  const [diffTimestampB, setDiffTimestampB] = useState<string>(() => (Math.floor(Date.now() / 1000) - 86400 * 7).toString());

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live clock interval
  useEffect(() => {
    if (!isClockRunning) return;
    const interval = setInterval(() => {
      setLiveNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockRunning]);

  const liveSeconds = Math.floor(liveNow / 1000);
  const liveMilliseconds = liveNow;
  const liveMicroseconds = liveNow * 1000;
  const liveNanoseconds = liveNow * 1000000;

  // Derived Epoch -> Date Breakdown
  const epochBreakdown = useMemo(() => {
    const { ms, unit } = normalizeTimestampToMs(inputEpoch);
    if (isNaN(ms) || unit === 'invalid') return null;

    const date = new Date(ms);
    if (isNaN(date.getTime())) return null;

    const { dayOfYear, weekNumber, isLeapYear } = getDayOfYearAndWeek(date);
    const sec = Math.floor(ms / 1000);
    const hex = '0x' + (sec >>> 0).toString(16).toUpperCase();

    // Timezone string
    let localFormatted = date.toLocaleString();
    try {
      if (selectedTimezone !== 'local') {
        localFormatted = date.toLocaleString('en-US', { timeZone: selectedTimezone, dateStyle: 'full', timeStyle: 'long' });
      } else {
        localFormatted = date.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'long' });
      }
    } catch {
      localFormatted = date.toString();
    }

    return {
      date,
      unit,
      ms,
      seconds: sec,
      milliseconds: ms,
      microseconds: ms * 1000,
      nanoseconds: ms * 1000000,
      local: localFormatted,
      utc: date.toUTCString(),
      iso: date.toISOString(),
      relative: getRelativeTime(ms),
      dayOfYear,
      weekNumber,
      isLeapYear,
      hex
    };
  }, [inputEpoch, selectedTimezone]);

  // Derived Date -> Epoch Breakdown
  const dateToEpochBreakdown = useMemo(() => {
    if (!inputDateString) return null;
    const epochMs = getEpochForTimezone(inputDateString, selectedTimezone);
    if (isNaN(epochMs)) return null;

    const date = new Date(epochMs);
    const sec = Math.floor(epochMs / 1000);

    return {
      seconds: sec,
      milliseconds: epochMs,
      microseconds: epochMs * 1000,
      nanoseconds: epochMs * 1000000,
      iso: date.toISOString(),
      utc: date.toUTCString()
    };
  }, [inputDateString, selectedTimezone]);

  // Batch parsed table
  const batchRows = useMemo(() => {
    if (!batchInput.trim()) return [];
    const lines = batchInput.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);

    return lines.map((line, idx) => {
      const { ms, unit } = normalizeTimestampToMs(line);
      if (isNaN(ms) || unit === 'invalid') {
        return {
          idx: idx + 1,
          raw: line,
          unit: 'Invalid',
          local: 'Invalid Epoch Format',
          utc: '-',
          iso: '-'
        };
      }
      const d = new Date(ms);
      return {
        idx: idx + 1,
        raw: line,
        unit,
        local: d.toLocaleString(),
        utc: d.toUTCString(),
        iso: d.toISOString()
      };
    });
  }, [batchInput]);

  // Diff calculation
  const diffCalculation = useMemo(() => {
    const normA = normalizeTimestampToMs(diffTimestampA);
    const normB = normalizeTimestampToMs(diffTimestampB);

    if (isNaN(normA.ms) || isNaN(normB.ms)) return null;

    const diffMs = normA.ms - normB.ms;
    const absMs = Math.abs(diffMs);
    const totalSecs = Math.floor(absMs / 1000);
    const totalMins = Math.floor(totalSecs / 60);
    const totalHours = Math.floor(totalMins / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);

    const remHours = totalHours % 24;
    const remMins = totalMins % 60;
    const remSecs = totalSecs % 60;

    let durationWords = `${totalDays}d ${remHours}h ${remMins}m ${remSecs}s`;
    if (totalDays === 0 && totalHours === 0) durationWords = `${remMins}m ${remSecs}s`;
    if (totalDays === 0 && totalHours === 0 && remMins === 0) durationWords = `${remSecs}s`;

    return {
      diffMs,
      absMs,
      totalSecs,
      totalMins,
      totalHours,
      totalDays,
      totalWeeks,
      durationWords,
      order: diffMs >= 0 ? 'A is after B' : 'A is before B'
    };
  }, [diffTimestampA, diffTimestampB]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Download batch
  const handleDownloadBatch = (format: 'csv' | 'txt') => {
    if (batchRows.length === 0) return;
    let content = '';
    let filename = `timestamp-batch-${Date.now()}.${format}`;
    let mime = 'text/plain';

    if (format === 'csv') {
      content = 'Index,InputTimestamp,Unit,LocalTime,UTCTime,ISO8601\n' +
        batchRows.map((r) => `${r.idx},"${r.raw}","${r.unit}","${r.local}","${r.utc}","${r.iso}"`).join('\n');
      mime = 'text/csv';
    } else {
      content = `# Unix Timestamp Batch Export (${new Date().toISOString()})\n\n` +
        batchRows.map((r) => `#${r.idx} [${r.unit}] ${r.raw} -> ${r.iso} (${r.local})`).join('\n');
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Quick preset loaders for single epoch
  const loadEpochPreset = (preset: 'now' | 'today' | 'month' | 'year' | 'y2k38' | 'epoch0') => {
    const now = new Date();
    if (preset === 'now') {
      setInputEpoch(Math.floor(Date.now() / 1000).toString());
    } else if (preset === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      setInputEpoch(Math.floor(today.getTime() / 1000).toString());
    } else if (preset === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      setInputEpoch(Math.floor(monthStart.getTime() / 1000).toString());
    } else if (preset === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      setInputEpoch(Math.floor(yearStart.getTime() / 1000).toString());
    } else if (preset === 'y2k38') {
      setInputEpoch('2147483647'); // 2038-01-19T03:14:07Z
    } else if (preset === 'epoch0') {
      setInputEpoch('0'); // 1970-01-01T00:00:00Z
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs (Note: No duplicate H1 here) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3 text-left">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-zinc-100/80 dark:bg-zinc-850/60 border border-zinc-200/50 dark:border-zinc-800/50">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'studio'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Epoch & Date Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'batch'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch Converter</span>
          </button>

          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'diff'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5" />
            <span>Time Diff & Duration</span>
          </button>

          <button
            onClick={() => setActiveTab('snippets')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'snippets'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Snippets</span>
          </button>
        </div>

        {/* Global Timezone Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 shadow-2xs"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz.id} value={tz.id}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Unix Epoch Clock Studio Banner */}
      <div className="saas-card p-6 md:p-7 border-pastel-indigo/60 dark:border-zinc-800 relative overflow-hidden shadow-sm text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                {isClockRunning && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isClockRunning ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {isClockRunning ? 'Live Unix Epoch Clock' : 'Epoch Clock (Paused)'}
              </span>
              <button
                onClick={() => setIsClockRunning(!isClockRunning)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title={isClockRunning ? 'Pause live ticking' : 'Resume live ticking'}
              >
                {isClockRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-zinc-900 dark:text-white select-all">
                {liveSeconds}
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Seconds (10 digits)
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              UTC: <span className="font-mono text-zinc-700 dark:text-zinc-300 font-bold">{new Date(liveNow).toUTCString()}</span>
            </p>
          </div>

          {/* Quick Copy Multi-Resolution Epochs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Seconds</div>
              <div className="font-mono text-xs font-black text-zinc-800 dark:text-zinc-200 truncate mt-1">{liveSeconds}</div>
              <button
                onClick={() => handleCopy(liveSeconds.toString(), 'clock-sec')}
                className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'clock-sec' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'clock-sec' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Milliseconds</div>
              <div className="font-mono text-xs font-black text-zinc-800 dark:text-zinc-200 truncate mt-1">{liveMilliseconds}</div>
              <button
                onClick={() => handleCopy(liveMilliseconds.toString(), 'clock-ms')}
                className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'clock-ms' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'clock-ms' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Microseconds</div>
              <div className="font-mono text-xs font-black text-zinc-800 dark:text-zinc-200 truncate mt-1">{liveMicroseconds}</div>
              <button
                onClick={() => handleCopy(liveMicroseconds.toString(), 'clock-us')}
                className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'clock-us' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'clock-us' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Nanoseconds</div>
              <div className="font-mono text-xs font-black text-zinc-800 dark:text-zinc-200 truncate mt-1">{liveNanoseconds}</div>
              <button
                onClick={() => handleCopy(liveNanoseconds.toString(), 'clock-ns')}
                className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'clock-ns' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'clock-ns' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: STUDIO (EPOCH <-> DATE BIDIRECTIONAL) */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
          {/* PANEL 1: EPOCH TO DATE */}
          <div className="saas-card p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Unix Epoch &rarr; Calendar Date</span>
              </h2>

              {epochBreakdown && (
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-[10px] font-extrabold uppercase">
                  Detected {epochBreakdown.unit}
                </span>
              )}
            </div>

            {/* Epoch Quick Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">Presets:</span>
              <button
                onClick={() => loadEpochPreset('now')}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition shrink-0"
              >
                Now
              </button>
              <button
                onClick={() => loadEpochPreset('today')}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition shrink-0"
              >
                Today 00:00
              </button>
              <button
                onClick={() => loadEpochPreset('month')}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition shrink-0"
              >
                Start of Month
              </button>
              <button
                onClick={() => loadEpochPreset('year')}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition shrink-0"
              >
                Start of Year
              </button>
              <button
                onClick={() => loadEpochPreset('y2k38')}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition shrink-0"
              >
                Year 2038 Max
              </button>
              <button
                onClick={() => loadEpochPreset('epoch0')}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition shrink-0"
              >
                Epoch 0 (1970)
              </button>
            </div>

            {/* Input Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Enter Timestamp (Seconds, Ms, &micro;s, or ns)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputEpoch}
                  onChange={(e) => setInputEpoch(e.target.value)}
                  placeholder="e.g. 1791786600 or 1791786600000"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                />
                <button
                  onClick={() => setInputEpoch(Math.floor(Date.now() / 1000).toString())}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 transition"
                  title="Reset to current epoch"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-zinc-400">
                Auto-detects 10 digits (seconds), 13 digits (ms), 16 digits (&micro;s), and 19 digits (ns).
              </p>
            </div>

            {/* Results Card */}
            {epochBreakdown ? (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 flex justify-between items-center">
                  <div className="overflow-hidden pr-2">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Local Time ({selectedTimezone === 'local' ? 'Browser' : selectedTimezone})
                    </span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white truncate block">
                      {epochBreakdown.local}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(epochBreakdown.local, 'res-local')}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
                    title="Copy Local Time"
                  >
                    {copiedKey === 'res-local' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 flex justify-between items-center">
                  <div className="overflow-hidden pr-2">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      UTC / GMT (RFC 7231)
                    </span>
                    <span className="text-xs font-bold font-mono text-zinc-900 dark:text-white truncate block">
                      {epochBreakdown.utc}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(epochBreakdown.utc, 'res-utc')}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
                    title="Copy UTC Time"
                  >
                    {copiedKey === 'res-utc' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 flex justify-between items-center">
                  <div className="overflow-hidden pr-2">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      ISO 8601 / RFC 3339
                    </span>
                    <span className="text-xs font-bold font-mono text-zinc-900 dark:text-white truncate block">
                      {epochBreakdown.iso}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(epochBreakdown.iso, 'res-iso')}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
                    title="Copy ISO 8601"
                  >
                    {copiedKey === 'res-iso' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-pastel-indigo/50 dark:border-indigo-900/40">
                    <span className="block text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                      Relative Time
                    </span>
                    <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 capitalize mt-0.5 block">
                      {epochBreakdown.relative}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800">
                    <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Calendar Stats
                    </span>
                    <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 block">
                      Day {epochBreakdown.dayOfYear} &bull; Week {epochBreakdown.weekNumber} &bull; {epochBreakdown.isLeapYear ? 'Leap Year' : 'Common Year'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
                Please enter a valid numeric Unix Epoch timestamp.
              </div>
            )}
          </div>

          {/* PANEL 2: DATE TO EPOCH */}
          <div className="saas-card p-6 space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                <span>Calendar Date &rarr; Unix Epoch</span>
              </h2>

              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Microsecond Precision
              </span>
            </div>

            {/* Date Pickers */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Select Date and Time
              </label>
              <input
                type="datetime-local"
                step="1"
                value={inputDateString}
                onChange={(e) => setInputDateString(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-inner cursor-pointer"
              />
              <p className="text-[10px] text-zinc-400">
                Calculated according to the active timezone: <span className="font-bold text-zinc-600 dark:text-zinc-300">{selectedTimezone}</span>
              </p>
            </div>

            {/* Generated Epoch Outputs */}
            {dateToEpochBreakdown ? (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Epoch in Seconds (10 digits)
                    </span>
                    <span className="text-base font-black font-mono text-zinc-900 dark:text-white">
                      {dateToEpochBreakdown.seconds}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(dateToEpochBreakdown.seconds.toString(), 'dto-sec')}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
                    title="Copy Epoch Seconds"
                  >
                    {copiedKey === 'dto-sec' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Epoch in Milliseconds (13 digits)
                    </span>
                    <span className="text-base font-black font-mono text-zinc-900 dark:text-white">
                      {dateToEpochBreakdown.milliseconds}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(dateToEpochBreakdown.milliseconds.toString(), 'dto-ms')}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
                    title="Copy Epoch Milliseconds"
                  >
                    {copiedKey === 'dto-ms' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Epoch in Microseconds (16 digits)
                    </span>
                    <span className="text-sm font-black font-mono text-zinc-900 dark:text-white">
                      {dateToEpochBreakdown.microseconds}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(dateToEpochBreakdown.microseconds.toString(), 'dto-us')}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
                    title="Copy Epoch Microseconds"
                  >
                    {copiedKey === 'dto-us' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Epoch in Nanoseconds (19 digits)
                    </span>
                    <span className="text-sm font-black font-mono text-zinc-900 dark:text-white">
                      {dateToEpochBreakdown.nanoseconds}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(dateToEpochBreakdown.nanoseconds.toString(), 'dto-ns')}
                    className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
                    title="Copy Epoch Nanoseconds"
                  >
                    {copiedKey === 'dto-ns' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
                Select a valid calendar date and time.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BATCH CONVERTER */}
      {activeTab === 'batch' && (
        <div className="saas-card p-6 md:p-8 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Batch Timestamp Converter & Exporter</span>
              </h2>
              <span className="text-[11px] text-zinc-500 font-medium">
                Paste list of timestamps separated by newlines or commas
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadBatch('txt')}
                disabled={batchRows.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>.TXT</span>
              </button>
              <button
                onClick={() => handleDownloadBatch('csv')}
                disabled={batchRows.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>.CSV</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    batchRows.map((r) => `${r.raw} -> ${r.iso} (${r.local})`).join('\n')
                  );
                  setBatchCopied(true);
                  setTimeout(() => setBatchCopied(false), 2000);
                }}
                disabled={batchRows.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
              >
                {batchCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{batchCopied ? 'All Copied!' : 'Copy All'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              className="w-full h-36 font-mono text-xs sm:text-sm p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
              placeholder="Paste timestamps (one per line, e.g. 1791786600)..."
            />
          </div>

          {/* Results Table */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100/80 dark:bg-zinc-850/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10">#</th>
                    <th className="py-2.5 px-3">Input Timestamp</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Local Date & Time</th>
                    <th className="py-2.5 px-3">ISO 8601 (UTC)</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800">
                  {batchRows.map((row) => (
                    <tr key={row.idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="py-2.5 px-3 font-mono text-zinc-400">{row.idx}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-zinc-800 dark:text-zinc-200 select-all">{row.raw}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 text-[10px] font-bold capitalize">
                          {row.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">{row.local}</td>
                      <td className="py-2.5 px-3 font-mono text-zinc-500">{row.iso}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleCopy(row.iso, `batch-${row.idx}`)}
                          className="p-1 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                          title="Copy ISO string"
                        >
                          {copiedKey === `batch-${row.idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TIMESTAMP DIFF & DURATION */}
      {activeTab === 'diff' && (
        <div className="saas-card p-6 md:p-8 space-y-6 text-left">
          <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-indigo-500" />
              <span>Timestamp Difference & Duration Calculator</span>
            </h2>
            <span className="text-[11px] text-zinc-500 font-medium">
              Calculate exact elapsed time, day counts, and duration between two timestamps
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Timestamp A</label>
              <input
                type="text"
                value={diffTimestampA}
                onChange={(e) => setDiffTimestampA(e.target.value)}
                placeholder="e.g. 1791786600"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Timestamp B</label>
              <input
                type="text"
                value={diffTimestampB}
                onChange={(e) => setDiffTimestampB(e.target.value)}
                placeholder="e.g. 1791182200"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-sm"
              />
            </div>
          </div>

          {diffCalculation ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-pastel-indigo/60 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    Calculated Time Duration
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-indigo-950 dark:text-indigo-200">
                    {diffCalculation.durationWords}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold self-start sm:self-auto border border-zinc-200/80 dark:border-zinc-700">
                  {diffCalculation.order}
                </span>
              </div>

              {/* Units Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Total Seconds</span>
                  <span className="text-base font-black font-mono text-zinc-800 dark:text-zinc-200 mt-1 block">
                    {diffCalculation.totalSecs.toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Total Minutes</span>
                  <span className="text-base font-black font-mono text-zinc-800 dark:text-zinc-200 mt-1 block">
                    {diffCalculation.totalMins.toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Total Hours</span>
                  <span className="text-base font-black font-mono text-zinc-800 dark:text-zinc-200 mt-1 block">
                    {diffCalculation.totalHours.toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Total Days</span>
                  <span className="text-base font-black font-mono text-zinc-800 dark:text-zinc-200 mt-1 block">
                    {diffCalculation.totalDays.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
              Enter two valid timestamps to view duration and difference calculations.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DEVELOPER CODE SNIPPETS */}
      {activeTab === 'snippets' && (
        <div className="saas-card p-6 md:p-8 space-y-6 text-left">
          <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-500" />
              <span>Developer Epoch Cheat Sheet (9 Languages)</span>
            </h2>
            <span className="text-[11px] text-zinc-500 font-medium">
              Production code snippets to get current timestamp and parse epoch dates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CODE_SNIPPETS.map((snip, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-indigo-700 dark:text-indigo-400">
                    {snip.lang}
                  </span>
                  <button
                    onClick={() => handleCopy(`${snip.getNow}\n\n${snip.parse}`, `code-${idx}`)}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                    title="Copy Snippet"
                  >
                    {copiedKey === `code-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Get Current Timestamp:</span>
                  <pre className="font-mono text-[11px] p-2 rounded-lg bg-zinc-900 text-zinc-200 overflow-x-auto whitespace-pre">
                    {snip.getNow}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Convert Epoch to Date:</span>
                  <pre className="font-mono text-[11px] p-2 rounded-lg bg-zinc-900 text-zinc-200 overflow-x-auto whitespace-pre">
                    {snip.parse}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature & Architecture Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="saas-card p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400 font-black text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Automatic Granularity Detection</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Seamlessly handles 10-digit seconds, 13-digit milliseconds (`Date.now()`), 16-digit microseconds, and 19-digit nanoseconds with zero manual unit switching.
          </p>
        </div>

        <div className="saas-card p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-purple-650 dark:text-purple-400 font-black text-xs uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            <span>IANA Timezone Support</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Accurate conversions across global time zones (IST, UTC, EST, PST, CET, JST) using native browser `Intl` APIs without heavy external moment.js dependencies.
          </p>
        </div>

        <div className="saas-card p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-650 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>Year 2038 Problem (Y2K38)</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Tests 32-bit signed integer boundary conditions (`2,147,483,647`) and guarantees 64-bit timestamp stability up to 292 billion years into the future.
          </p>
        </div>
      </div>
    </div>
  );
}
