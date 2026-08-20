import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar, ArrowRightLeft, Download, Printer, 
  Sparkles, Copy, Check, Trash
} from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Types & Interfaces ---
type CalcMode = 'diff' | 'arithmetic' | 'working_days' | 'age' | 'countdown' | 'weekday' | 'sla_deadline' | 'range_generator';
type InclusiveCounting = 'exclude_start_include_end' | 'include_both' | 'exclude_both' | 'include_start_exclude_end';

interface HolidayRule {
  name: string;
  month: number; // 1-indexed (1 = Jan, 12 = Dec)
  day: number;
  state?: string; // 'MH', 'DL', 'KA', 'RJ'
}

interface Milestone {
  age: number;
  dateStr: string;
  daysDiff: number;
  passed: boolean;
}

// --- Date Normalization Utilities ---
const normalizeMonthOffset = (baseDate: Date, monthsOffset: number): Date => {
  const d = new Date(baseDate.getTime());
  const expectedMonth = (d.getMonth() + monthsOffset) % 12;
  d.setMonth(d.getMonth() + monthsOffset);
  const normalizedExpected = expectedMonth < 0 ? expectedMonth + 12 : expectedMonth;
  if (d.getMonth() !== normalizedExpected) {
    d.setDate(0); // roll back to last day of previous month
  }
  return d;
};

// --- Seeded Indian Holiday Rules ---
const StandardIndianHolidays: HolidayRule[] = [
  { name: 'Republic Day', month: 1, day: 26 },
  { name: 'Independence Day', month: 8, day: 15 },
  { name: 'Gandhi Jayanti', month: 10, day: 2 },
  { name: 'Christmas', month: 12, day: 25 },
  // Local state holidays
  { name: 'Maharashtra Day', month: 5, day: 1, state: 'MH' },
  { name: 'Delhi Foundation Day', month: 2, day: 15, state: 'DL' },
  { name: 'Kannada Rajyotsava', month: 11, day: 1, state: 'KA' },
  { name: 'Rajasthan Day', month: 3, day: 30, state: 'RJ' }
];

export default function DateCalculator({ initialMode }: { initialMode?: string }) {
  // 1. Core State
  const [mode, setMode] = useState<CalcMode>((initialMode as CalcMode) || 'diff');
  
  // Date range inputs
  const [startDateStr, setStartDateStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [endDateStr, setEndDateStr] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  
  // Counting methods
  const [inclusiveMethod, setInclusiveMethod] = useState<InclusiveCounting>('exclude_start_include_end');
  const [workingDaysCheckboxes, setWorkingDaysCheckboxes] = useState<boolean[]>([
    false, // Sunday
    true,  // Monday
    true,  // Tuesday
    true,  // Wednesday
    true,  // Thursday
    true,  // Friday
    false  // Saturday
  ]);
  const [selectedState, setSelectedState] = useState<string>('all');
  
  // Custom holidays manual additions
  const [customHolidays, setCustomHolidays] = useState<{ date: string; name: string }[]>([]);
  const [newHolDate, setNewHolDate] = useState<string>('');
  const [newHolName, setNewHolName] = useState<string>('');

  // Date arithmetic offsets
  const [offsetValue, setOffsetValue] = useState<number>(100);
  const [offsetUnit, setOffsetUnit] = useState<'days' | 'working_days' | 'weeks' | 'months' | 'years'>('days');
  const [arithmeticOp, setArithmeticOp] = useState<'add' | 'subtract'>('add');

  // Age input
  const [dobStr, setDobStr] = useState<string>('1998-01-15');
  const [ageAsOfStr, setAgeAsOfStr] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Live Countdown inputs
  const [countdownDateStr, setCountdownDateStr] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 100);
    return d.toISOString().split('T')[0];
  });
  const [countdownTimeStr, setCountdownTimeStr] = useState<string>('00:00');
  const [countdownTime, setCountdownTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const intervalRef = useRef<any>(null);

  // SLA & Business hours
  const [startTimeStr, setStartTimeStr] = useState<string>('09:00');
  const [endTimeStr, setEndTimeStr] = useState<string>('18:00');
  const [slaTargetHours, setSlaTargetHours] = useState<number>(24);

  // Date Range Generator settings
  const [generatorRepeat, setGeneratorRepeat] = useState<'daily' | 'weekly' | 'weekdays' | 'monthly' | 'quarterly'>('weekly');
  const [generatorList, setGeneratorList] = useState<string[]>([]);

  // Natural language state
  const [naturalText, setNaturalText] = useState<string>('');
  const [naturalParsedMessage, setNaturalParsedMessage] = useState<string>('');

  // UI state
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Parse natural language queries
  const parseNaturalLanguage = () => {
    if (!naturalText.trim()) return;
    const txt = naturalText.toLowerCase();

    // 1. "X days after Y"
    const addDaysMatch = txt.match(/(\d+)\s*days?\s*after\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\s+[a-z]+|\w+)/);
    if (addDaysMatch) {
      const days = parseInt(addDaysMatch[1]);
      setMode('arithmetic');
      setOffsetUnit('days');
      setOffsetValue(days);
      setArithmeticOp('add');
      setNaturalParsedMessage(`Set operation to Add ${days} Days.`);
      return;
    }

    // 2. "X working days from today"
    if (txt.includes('working') && txt.includes('from')) {
      const workingMatch = txt.match(/(\d+)\s*working\s*days?/);
      if (workingMatch) {
        const days = parseInt(workingMatch[1]);
        setMode('arithmetic');
        setOffsetUnit('working_days');
        setOffsetValue(days);
        setArithmeticOp('add');
        setNaturalParsedMessage(`Set operation to Add ${days} Working Days.`);
        return;
      }
    }

    // 3. "age if born on Y"
    const ageMatch = txt.match(/age\s*(?:if\s*born\s*on|of)\s*([\d\/\-]+|[a-z0-9\s]+)/i);
    if (ageMatch) {
      setMode('age');
      setNaturalParsedMessage(`Switched to Age Calculator mode.`);
      return;
    }

    // 4. "days until Y"
    const countdownMatch = txt.match(/days?\s*until\s*(.*)/i);
    if (countdownMatch) {
      setMode('countdown');
      setNaturalParsedMessage(`Switched to Countdown Calculator.`);
      return;
    }

    setNaturalParsedMessage("Could not parse. Try: '100 days after 2026-08-20' or '30 working days from today'");
  };

  // Compile active list of holidays based on selected state + custom entries
  const resolvedHolidays = useMemo(() => {
    const list: Date[] = [];
    const currentYear = new Date(startDateStr).getFullYear();

    // Add national and matching state holidays
    StandardIndianHolidays.forEach((rule) => {
      if (!rule.state || rule.state === selectedState) {
        list.push(new Date(currentYear, rule.month - 1, rule.day));
      }
    });

    // Add manual custom holidays
    customHolidays.forEach((h) => {
      const d = new Date(h.date);
      if (!isNaN(d.getTime())) {
        list.push(d);
      }
    });

    return list;
  }, [startDateStr, selectedState, customHolidays]);

  // --- DIFFERENCE ENGINE ---
  const differenceResults = useMemo(() => {
    if (mode !== 'diff' && mode !== 'working_days' && mode !== 'weekday') return null;

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

    const diffMs = utcEnd - utcStart;
    let calendarDays = Math.round(diffMs / 86400000);
    const isNegative = calendarDays < 0;

    // Apply inclusive counting methods
    let countingOffset = 0;
    if (inclusiveMethod === 'include_both') {
      countingOffset = isNegative ? -1 : 1;
    } else if (inclusiveMethod === 'exclude_both') {
      countingOffset = isNegative ? 1 : -1;
    }

    const totalDays = calendarDays + countingOffset;

    // Calendar Difference Y-M-D Breakdown
    const d1 = new Date(isNegative ? end : start);
    const d2 = new Date(isNegative ? start : end);

    if (inclusiveMethod === 'include_both') {
      d2.setDate(d2.getDate() + 1);
    } else if (inclusiveMethod === 'exclude_both') {
      d2.setDate(d2.getDate() - 1);
    }

    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLast = new Date(d2.getFullYear(), d2.getMonth(), 0);
      days += prevMonthLast.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Working days loops
    let workingDays = 0;
    let weekendDays = 0;
    let holidayDays = 0;

    // Adjust boundaries for loops
    const current = new Date(d1.getTime());
    const endBound = new Date(d2.getTime());

    while (current < endBound) {
      const dayOfWeek = current.getDay();
      const isWorking = workingDaysCheckboxes[dayOfWeek];
      const isHol = resolvedHolidays.some(h => 
        h.getFullYear() === current.getFullYear() && 
        h.getMonth() === current.getMonth() && 
        h.getDate() === current.getDate()
      );

      if (isWorking) {
        if (isHol) {
          holidayDays++;
        } else {
          workingDays++;
        }
      } else {
        weekendDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    // Leap day tracking
    let leapDaysCrossed = 0;
    const loopStartYear = Math.min(start.getFullYear(), end.getFullYear());
    const loopEndYear = Math.max(start.getFullYear(), end.getFullYear());
    for (let yr = loopStartYear; yr <= loopEndYear; yr++) {
      const isLeap = (yr % 4 === 0 && yr % 100 !== 0) || (yr % 400 === 0);
      if (isLeap) {
        const leapDate = new Date(yr, 1, 29); // Feb 29
        if (leapDate >= d1 && leapDate <= d2) {
          leapDaysCrossed++;
        }
      }
    }

    return {
      totalDays: Math.abs(totalDays),
      years,
      months,
      days,
      workingDays,
      weekendDays,
      holidayDays,
      leapDaysCrossed,
      isNegative,
      startDay: start.toLocaleDateString('en-IN', { weekday: 'long' }),
      endDay: end.toLocaleDateString('en-IN', { weekday: 'long' }),
      totalWeeks: Math.floor(Math.abs(totalDays) / 7),
      remainingWeeksDays: Math.abs(totalDays) % 7
    };
  }, [mode, startDateStr, endDateStr, inclusiveMethod, workingDaysCheckboxes, resolvedHolidays]);

  // --- AGE ENGINE ---
  const ageResults = useMemo(() => {
    if (mode !== 'age') return null;

    const dob = new Date(dobStr);
    const asOf = new Date(ageAsOfStr);

    if (isNaN(dob.getTime()) || isNaN(asOf.getTime())) return null;

    let years = asOf.getFullYear() - dob.getFullYear();
    let months = asOf.getMonth() - dob.getMonth();
    let days = asOf.getDate() - dob.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLast = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
      days += prevMonthLast.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Days until next birthday
    const nextBday = new Date(asOf.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBday < asOf) {
      nextBday.setFullYear(nextBday.getFullYear() + 1);
    }
    const daysUntilBday = Math.round((nextBday.getTime() - asOf.getTime()) / 86400000);
    const nextAge = years + 1;

    // Core milestones
    const milestoneAges = [18, 21, 25, 30, 40, 50, 60, 75];
    const milestones: Milestone[] = milestoneAges.map((age) => {
      const mDate = new Date(dob.getTime());
      mDate.setFullYear(dob.getFullYear() + age);
      const diffDays = Math.round((mDate.getTime() - asOf.getTime()) / 86400000);
      return {
        age,
        dateStr: mDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        daysDiff: Math.abs(diffDays),
        passed: diffDays < 0
      };
    });

    const totalDaysAlive = Math.round((asOf.getTime() - dob.getTime()) / 86400000);

    return {
      years,
      months,
      days,
      totalDaysAlive,
      daysUntilBday,
      nextAge,
      nextBdayWeekday: nextBday.toLocaleDateString('en-IN', { weekday: 'long' }),
      milestones
    };
  }, [mode, dobStr, ageAsOfStr]);

  // --- ARITHMETIC ENGINE ---
  const arithmeticResults = useMemo(() => {
    if (mode !== 'arithmetic') return null;

    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return null;

    const factor = arithmeticOp === 'add' ? 1 : -1;
    const result = new Date(start.getTime());

    if (offsetUnit === 'days') {
      result.setDate(result.getDate() + (offsetValue * factor));
    } else if (offsetUnit === 'weeks') {
      result.setDate(result.getDate() + (offsetValue * 7 * factor));
    } else if (offsetUnit === 'months') {
      const finalDate = normalizeMonthOffset(start, offsetValue * factor);
      result.setTime(finalDate.getTime());
    } else if (offsetUnit === 'years') {
      const finalDate = normalizeMonthOffset(start, offsetValue * 12 * factor);
      result.setTime(finalDate.getTime());
    } else if (offsetUnit === 'working_days') {
      // Loop adding/subtracting working days
      let count = 0;
      while (count < offsetValue) {
        result.setDate(result.getDate() + factor);
        const dayOfWeek = result.getDay();
        const isWorking = workingDaysCheckboxes[dayOfWeek];
        const isHol = resolvedHolidays.some(h => 
          h.getFullYear() === result.getFullYear() && 
          h.getMonth() === result.getMonth() && 
          h.getDate() === result.getDate()
        );
        if (isWorking && !isHol) {
          count++;
        }
      }
    }

    return {
      resultStr: result.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' }),
      resultRaw: result.toISOString().split('T')[0]
    };
  }, [mode, startDateStr, offsetValue, offsetUnit, arithmeticOp, workingDaysCheckboxes, resolvedHolidays]);

  // --- Countdown Live timer loop ---
  useEffect(() => {
    if (mode !== 'countdown') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const updateCountdown = () => {
      const target = new Date(`${countdownDateStr}T${countdownTimeStr}`);
      const now = new Date();
      let diffMs = target.getTime() - now.getTime();
      const isPast = diffMs < 0;
      diffMs = Math.abs(diffMs);

      const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diffMs % (1000 * 60)) / 1000);

      setCountdownTime({ days: isPast ? -d : d, hours: h, minutes: m, seconds: s });
    };

    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [mode, countdownDateStr, countdownTimeStr]);

  // --- SLA DEADLINE COMPUTATIONS ---
  const slaResults = useMemo(() => {
    if (mode !== 'sla_deadline') return null;

    const start = new Date(startDateStr);
    if (isNaN(start.getTime())) return null;

    // Parse business hours
    const [startBHour, startBMin] = startTimeStr.split(':').map(Number);
    const [endBHour, endBMin] = endTimeStr.split(':').map(Number);

    const bhPerDay = (endBHour + endBMin / 60) - (startBHour + startBMin / 60);

    // Calculate deadline by stepping through hours
    let remainingHours = slaTargetHours;
    const current = new Date(start.getTime());

    // Loop day-by-day and hour-by-hour to solve SLA
    while (remainingHours > 0) {
      const dayOfWeek = current.getDay();
      const isWorking = workingDaysCheckboxes[dayOfWeek];
      const isHol = resolvedHolidays.some(h => 
        h.getFullYear() === current.getFullYear() && 
        h.getMonth() === current.getMonth() && 
        h.getDate() === current.getDate()
      );

      if (isWorking && !isHol) {
        // Business hours apply for this day
        if (remainingHours <= bhPerDay) {
          current.setHours(startBHour + Math.floor(remainingHours));
          const mins = Math.round((remainingHours % 1) * 60);
          current.setMinutes(startBMin + mins);
          remainingHours = 0;
        } else {
          remainingHours -= bhPerDay;
        }
      }
      if (remainingHours > 0) {
        current.setDate(current.getDate() + 1);
        current.setHours(startBHour);
        current.setMinutes(startBMin);
      }
    }

    return {
      deadlineStr: current.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
  }, [mode, startDateStr, startTimeStr, endTimeStr, slaTargetHours, workingDaysCheckboxes, resolvedHolidays]);

  // --- DATE RANGE GENERATOR ---
  const triggerRangeGenerator = () => {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return;

    const list: string[] = [];
    const current = new Date(start.getTime());

    while (current <= end) {
      if (generatorRepeat === 'daily') {
        list.push(current.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
        current.setDate(current.getDate() + 1);
      } else if (generatorRepeat === 'weekly') {
        list.push(current.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
        current.setDate(current.getDate() + 7);
      } else if (generatorRepeat === 'weekdays') {
        const dow = current.getDay();
        if (dow >= 1 && dow <= 5) {
          list.push(current.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
        }
        current.setDate(current.getDate() + 1);
      } else if (generatorRepeat === 'monthly') {
        list.push(current.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
        const next = normalizeMonthOffset(current, 1);
        current.setTime(next.getTime());
      } else if (generatorRepeat === 'quarterly') {
        list.push(current.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
        const next = normalizeMonthOffset(current, 3);
        current.setTime(next.getTime());
      }
    }
    setGeneratorList(list);
  };

  // --- Export Actions Handlers ---
  const copyFormattedReport = () => {
    let text = '';
    if (mode === 'diff' && differenceResults) {
      text = `Date Difference Audit Report (Toolique)
----------------------------------------------
Start Date      : ${startDateStr} (${differenceResults.startDay})
End Date        : ${endDateStr} (${differenceResults.endDay})
Counting Method : ${inclusiveMethod}
----------------------------------------------
Total Days      : ${differenceResults.totalDays} Days
Calendar Duration: ${differenceResults.years} Years, ${differenceResults.months} Months, ${differenceResults.days} Days
Working Days    : ${differenceResults.workingDays} Business Days
Weekend Days    : ${differenceResults.weekendDays} Days
State Holidays  : ${differenceResults.holidayDays} Days
Leap Days Crossed: ${differenceResults.leapDaysCrossed}`;
    } else if (mode === 'age' && ageResults) {
      text = `Age Planning Report (Toolique)
----------------------------------------------
DOB             : ${dobStr}
As Of Date      : ${ageAsOfStr}
----------------------------------------------
Age             : ${ageResults.years} Years, ${ageResults.months} Months, ${ageResults.days} Days
Total Days Alive: ${ageResults.totalDaysAlive} Days
Next Birthday   : ${ageResults.daysUntilBday} Days remaining (Age turning ${ageResults.nextAge})`;
    }

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Date Calculator Audit Summary - Toolique</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            h2 { border-bottom: 2px solid #555; padding-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 12px 0; font-size: 14px; }
            .total { font-weight: bold; font-size: 1.1em; border-top: 1px solid #333; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h2>DATE CALCULATION RESULTS</h2>
          <div class="row"><span>Start Date</span><span>${startDateStr}</span></div>
          ${mode === 'diff' && differenceResults ? `
            <div class="row"><span>Total Days</span><span>${differenceResults.totalDays} Days</span></div>
            <div class="row"><span>Calendar Duration</span><span>${differenceResults.years}y, ${differenceResults.months}m, ${differenceResults.days}d</span></div>
            <div class="row"><span>Working Days</span><span>${differenceResults.workingDays}</span></div>
          ` : ''}
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42); // slate-900 theme color
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('DATE PLANNING AUDIT REPORT', 15, 22);
    doc.setFontSize(10);
    doc.text('Working Days & Calendar Planning — Toolique.in', 15, 30);

    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text('Calculated Parameters', 15, 52);

    doc.setFontSize(10);
    doc.text(`Start Date: ${startDateStr}`, 15, 60);
    if (mode === 'diff' && differenceResults) {
      doc.text(`End Date: ${endDateStr}`, 15, 66);
      doc.text(`Total calendar difference: ${differenceResults.totalDays} Days`, 15, 72);
      doc.text(`Working days: ${differenceResults.workingDays} Days`, 15, 78);
    }

    doc.save(`Date_Calculations_Report_${Date.now()}.pdf`);
  };

  const getShareLink = () => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    params.set('start', startDateStr);
    params.set('end', endDateStr);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left animate-fadeIn">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm">Date Calculations Workspace</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Verify business days, countdowns, age milestones, and SLA margins</p>
          </div>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(getShareLink());
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
          }}
          className="text-[9px] font-bold text-slate-700 dark:text-slate-400 bg-slate-500/10 border border-slate-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
        >
          {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <ArrowRightLeft className="w-3 h-3" />}
          <span>{copiedLink ? 'Link Copied' : 'Share Scenario'}</span>
        </button>
      </div>

      {/* CORE WORKSPACE TABS */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setMode('diff')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            mode === 'diff' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Difference between Dates
        </button>
        <button
          onClick={() => setMode('arithmetic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            mode === 'arithmetic' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Add / Subtract Days
        </button>
        <button
          onClick={() => setMode('age')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            mode === 'age' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Age Calculator
        </button>
        <button
          onClick={() => setMode('countdown')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            mode === 'countdown' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Countdown Tracker
        </button>
        <button
          onClick={() => setMode('sla_deadline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            mode === 'sla_deadline' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          SLA & Deadline Solver
        </button>
        <button
          onClick={() => setMode('range_generator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            mode === 'range_generator' ? 'bg-teal-600 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800'
          }`}
        >
          Date Range Generator
        </button>
      </div>

      {/* NATURAL LANGUAGE PARSING ASSISTANT */}
      <div className="p-4 rounded-2xl bg-zinc-55 hover:bg-zinc-100 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-850 flex flex-col md:flex-row gap-3 items-center">
        <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0" />
        <div className="text-xs text-zinc-500 font-semibold flex-grow text-center md:text-left">
          <span>Type naturally: </span>
          <span className="italic text-zinc-400">"100 days after today", "30 working days from today", "age if born on 15 Jan 1998"</span>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <input
            type="text"
            placeholder="Try natural language..."
            value={naturalText}
            onChange={(e) => setNaturalText(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-xs font-medium focus:outline-none bg-transparent w-full md:w-60"
          />
          <button onClick={parseNaturalLanguage} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition">
            Parse
          </button>
        </div>
        {naturalParsedMessage && <span className="text-[10px] text-teal-600 font-bold block">{naturalParsedMessage}</span>}
      </div>

      {/* TWO COLUMN INTERACTIVE INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ARGS INPUT PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            
            {/* Start date standard picker */}
            {mode !== 'age' && mode !== 'countdown' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block">Start Date</label>
                <input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>
            )}

            {/* End date standard picker */}
            {(mode === 'diff' || mode === 'working_days' || mode === 'range_generator') && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block">End Date</label>
                <input
                  type="date"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>
            )}

            {/* Inclusive count toggle */}
            {mode === 'diff' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block">Counting Method</label>
                <select
                  value={inclusiveMethod}
                  onChange={(e) => setInclusiveMethod(e.target.value as InclusiveCounting)}
                  className="w-full p-2.5 border rounded-xl bg-transparent text-xs font-bold focus:outline-none"
                >
                  <option value="exclude_start_include_end">Exclude Start, Include End (Default)</option>
                  <option value="include_both">Include Both Dates (+1 day)</option>
                  <option value="exclude_both">Exclude Both Dates (-1 day)</option>
                  <option value="include_start_exclude_end">Include Start, Exclude End</option>
                </select>
              </div>
            )}

            {/* Custom Workweek days checklist */}
            {(mode === 'diff' || mode === 'working_days' || mode === 'arithmetic' || mode === 'sla_deadline') && (
              <div className="space-y-2 border-t pt-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block">Working Weekdays</label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                    <label key={day} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={workingDaysCheckboxes[idx]}
                        onChange={(e) => {
                          const copy = [...workingDaysCheckboxes];
                          copy[idx] = e.target.checked;
                          setWorkingDaysCheckboxes(copy);
                        }}
                        className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* SLA fields */}
            {mode === 'sla_deadline' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">SLA Target (Hours)</label>
                  <input
                    type="number"
                    value={slaTargetHours}
                    onChange={(e) => setSlaTargetHours(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full p-2 border rounded text-xs font-mono font-bold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Business Hours</label>
                  <div className="flex items-center gap-1">
                    <input type="text" value={startTimeStr} onChange={(e) => setStartTimeStr(e.target.value)} className="w-16 p-1 border rounded text-center text-xs font-mono" />
                    <span className="text-zinc-400 text-xs">to</span>
                    <input type="text" value={endTimeStr} onChange={(e) => setEndTimeStr(e.target.value)} className="w-16 p-1 border rounded text-center text-xs font-mono" />
                  </div>
                </div>
              </div>
            )}

            {/* Indian State Holidays filter */}
            {(mode === 'diff' || mode === 'working_days' || mode === 'arithmetic' || mode === 'sla_deadline') && (
              <div className="space-y-2 border-t pt-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block">Exclude Holidays (India)</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full p-2.5 border rounded-xl bg-transparent text-xs font-bold focus:outline-none"
                >
                  <option value="all">National Holidays Only</option>
                  <option value="MH">Maharashtra State Holidays</option>
                  <option value="DL">Delhi NCR State Holidays</option>
                  <option value="KA">Karnataka State Holidays</option>
                  <option value="RJ">Rajasthan State Holidays</option>
                </select>

                {/* Custom manual holiday adder */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-zinc-500 block">Add Custom Holiday</span>
                  <div className="flex gap-2">
                    <input type="date" value={newHolDate} onChange={(e) => setNewHolDate(e.target.value)} className="p-1 border rounded text-xs" />
                    <input type="text" placeholder="Independence Day etc." value={newHolName} onChange={(e) => setNewHolName(e.target.value)} className="p-1 border rounded text-xs flex-grow" />
                    <button
                      onClick={() => {
                        if (!newHolDate || !newHolName) return;
                        setCustomHolidays([...customHolidays, { date: newHolDate, name: newHolName }]);
                        setNewHolDate('');
                        setNewHolName('');
                      }}
                      className="px-2 py-1 bg-zinc-800 text-white rounded font-bold hover:bg-black"
                    >
                      +
                    </button>
                  </div>

                  {customHolidays.length > 0 && (
                    <div className="space-y-1 pt-1 max-h-20 overflow-y-auto">
                      {customHolidays.map((h, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-1.5 rounded border text-[10px]">
                          <span>{h.name} ({h.date})</span>
                          <button
                            onClick={() => {
                              const copy = [...customHolidays];
                              copy.splice(idx, 1);
                              setCustomHolidays(copy);
                            }}
                            className="text-rose-500 font-bold"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Arithmetic offsets */}
            {mode === 'arithmetic' && (
              <div className="space-y-4 border-t pt-3">
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => setArithmeticOp('add')}
                    className={`flex-grow py-2 rounded-xl text-xs font-bold border transition ${arithmeticOp === 'add' ? 'bg-teal-600 text-white border-teal-600' : 'text-zinc-500'}`}
                  >
                    Add Date
                  </button>
                  <button
                    onClick={() => setArithmeticOp('subtract')}
                    className={`flex-grow py-2 rounded-xl text-xs font-bold border transition ${arithmeticOp === 'subtract' ? 'bg-teal-600 text-white border-teal-600' : 'text-zinc-500'}`}
                  >
                    Subtract Date
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block">Quantity</label>
                    <input
                      type="number"
                      value={offsetValue}
                      onChange={(e) => setOffsetValue(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full p-2 border rounded font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block">Unit</label>
                    <select
                      value={offsetUnit}
                      onChange={(e) => setOffsetUnit(e.target.value as any)}
                      className="w-full p-2 border rounded bg-transparent text-xs font-bold focus:outline-none"
                    >
                      <option value="days">Calendar Days</option>
                      <option value="working_days">Working Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* DOB selection for age mode */}
            {mode === 'age' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Date of Birth</label>
                  <input
                    type="date"
                    value={dobStr}
                    onChange={(e) => setDobStr(e.target.value)}
                    className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Calculate age as of</label>
                  <input
                    type="date"
                    value={ageAsOfStr}
                    onChange={(e) => setAgeAsOfStr(e.target.value)}
                    className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Countdown target selections */}
            {mode === 'countdown' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Target Date</label>
                  <input
                    type="date"
                    value={countdownDateStr}
                    onChange={(e) => setCountdownDateStr(e.target.value)}
                    className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Target Time (HH:MM)</label>
                  <input
                    type="text"
                    value={countdownTimeStr}
                    onChange={(e) => setCountdownTimeStr(e.target.value)}
                    className="w-full p-2.5 border rounded-xl font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Range Generator Repeat settings */}
            {mode === 'range_generator' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">Frequency</label>
                  <select
                    value={generatorRepeat}
                    onChange={(e) => setGeneratorRepeat(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl bg-transparent text-xs font-bold focus:outline-none"
                  >
                    <option value="daily">Every Single Day</option>
                    <option value="weekly">Every 7 Days</option>
                    <option value="weekdays">Every Weekday (Mon-Fri)</option>
                    <option value="monthly">Same day of each Month</option>
                    <option value="quarterly">Same day of each Quarter</option>
                  </select>
                </div>

                <button
                  onClick={triggerRangeGenerator}
                  className="w-full py-2.5 bg-teal-650 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Generate Ranges List
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CORE SUMMARY VISUALIZATIONS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase text-zinc-450 tracking-wider block">Target date audit summary</span>
                <h3 className="text-sm font-black text-teal-400 mt-0.5">Date calculator outputs</h3>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={copyFormattedReport}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-350 hover:bg-zinc-850 hover:text-white transition"
                >
                  {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedReport ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* DIFFERENCE OUTPUT PANEL */}
            {mode === 'diff' && differenceResults && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-teal-300 uppercase block tracking-wider">Total Date Difference</span>
                    <div className="text-2xl md:text-3xl font-black text-white mt-1 font-mono tracking-tight">
                      {differenceResults.totalDays.toLocaleString('en-IN')} Days
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-400 font-extrabold uppercase block">Detailed Calendar Duration</span>
                    <div className="text-base font-bold font-mono text-zinc-300 mt-1">
                      {differenceResults.years}y, {differenceResults.months}m, {differenceResults.days}d
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-left pt-2 border-t border-zinc-850 text-xs">
                  <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                    <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Working Business Days</span>
                    <span className="text-xs font-black font-mono text-white mt-1 block">{differenceResults.workingDays} Days</span>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                    <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Weekend Days</span>
                    <span className="text-xs font-black font-mono text-teal-400 mt-1 block">{differenceResults.weekendDays} Days</span>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850/40">
                    <span className="text-[8px] text-zinc-400 font-extrabold uppercase block">Exclusions / Holidays</span>
                    <span className="text-xs font-black font-mono text-indigo-400 mt-1 block">{differenceResults.holidayDays} Days</span>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/40 border border-zinc-850/40 rounded-xl text-[10px] text-zinc-400 flex justify-between">
                  <span>Leap days crossed:</span>
                  <span className="font-bold text-white">{differenceResults.leapDaysCrossed} Days</span>
                </div>
              </div>
            )}

            {/* AGE OUTPUT PANEL */}
            {mode === 'age' && ageResults && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-teal-300 uppercase block tracking-wider">Your Exact Age</span>
                    <div className="text-2xl md:text-3xl font-black text-white mt-1 font-mono tracking-tight leading-tight">
                      {ageResults.years}y, {ageResults.months}m, {ageResults.days}d
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-400 font-extrabold uppercase block">Total Days Alive</span>
                    <div className="text-lg font-bold font-mono text-zinc-300 mt-1">
                      {ageResults.totalDaysAlive.toLocaleString('en-IN')} Days
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/50 border border-zinc-850/40 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-bold text-teal-400">
                    <span>Days until next birthday:</span>
                    <span>{ageResults.daysUntilBday} Days</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>Weekday: {ageResults.nextBdayWeekday}</span>
                    <span>Turning: {ageResults.nextAge} years old</span>
                  </div>
                </div>
              </div>
            )}

            {/* ARITHMETIC OUTPUT PANEL */}
            {mode === 'arithmetic' && arithmeticResults && (
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] font-bold text-teal-300 uppercase block tracking-wider">Calculated Target Date</span>
                  <div className="text-2xl md:text-3xl font-black text-white mt-1 leading-snug">
                    {arithmeticResults.resultStr}
                  </div>
                </div>
                <div className="p-3 bg-zinc-900/40 border border-zinc-850/40 rounded-xl text-[10px] text-zinc-400 flex justify-between font-mono">
                  <span>ISO Raw Date:</span>
                  <span className="font-bold text-white">{arithmeticResults.resultRaw}</span>
                </div>
              </div>
            )}

            {/* LIVE COUNTDOWN PANEL */}
            {mode === 'countdown' && (
              <div className="space-y-4">
                <span className="text-[9px] font-bold text-teal-300 uppercase block tracking-wider text-center">Live Ticking Countdown</span>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <div className="text-xl md:text-2xl font-bold text-white">{Math.abs(countdownTime.days)}</div>
                    <div className="text-[8px] text-zinc-450 uppercase block">Days</div>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <div className="text-xl md:text-2xl font-bold text-white">{countdownTime.hours}</div>
                    <div className="text-[8px] text-zinc-450 uppercase block">Hours</div>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <div className="text-xl md:text-2xl font-bold text-white">{countdownTime.minutes}</div>
                    <div className="text-[8px] text-zinc-450 uppercase block">Minutes</div>
                  </div>
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <div className="text-xl md:text-2xl font-bold text-white">{countdownTime.seconds}</div>
                    <div className="text-[8px] text-zinc-450 uppercase block">Seconds</div>
                  </div>
                </div>
                {countdownTime.days < 0 && (
                  <div className="text-[10px] text-rose-500 font-bold text-center">Date is in the past! Counting elapsed time.</div>
                )}
              </div>
            )}

            {/* SLA DEADLINE OUTPUT PANEL */}
            {mode === 'sla_deadline' && slaResults && (
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] font-bold text-teal-300 uppercase block tracking-wider">Calculated SLA Deadline</span>
                  <div className="text-xl md:text-2xl font-black text-white mt-1 leading-snug">
                    {slaResults.deadlineStr}
                  </div>
                </div>
                <div className="p-3 bg-zinc-900/40 border border-zinc-850/40 rounded-xl text-[10px] text-zinc-400 flex justify-between">
                  <span>Assumes Target SLA:</span>
                  <span className="font-bold text-white">{slaTargetHours} Business Hours</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DATE RANGE GENERATOR LIST */}
      {mode === 'range_generator' && generatorList.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 font-mono">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider block">Generated Dates List ({generatorList.length})</h3>
            <button
              onClick={() => {
                const text = generatorList.join('\n');
                navigator.clipboard.writeText(text);
              }}
              className="text-[10px] px-2 py-1 border rounded bg-zinc-50 font-sans hover:bg-zinc-100"
            >
              Copy List
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-zinc-700 dark:text-zinc-350 max-h-60 overflow-y-auto">
            {generatorList.map((row, idx) => (
              <div key={idx} className="p-2 border rounded text-center bg-zinc-50/50 dark:bg-zinc-950/20">
                #{idx + 1}: {row}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AGE MILESTONES DASHBOARD */}
      {mode === 'age' && ageResults && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Age Milestones Timeline</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ageResults.milestones.map((m) => (
              <div key={m.age} className={`p-4 rounded-2xl border ${m.passed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-200'} space-y-1 text-center font-mono`}>
                <div className="text-[10px] font-black uppercase text-zinc-400 block">Age {m.age}</div>
                <div className={`text-xs font-bold ${m.passed ? 'text-emerald-600' : 'text-teal-600'} mt-1 block`}>{m.dateStr}</div>
                <div className="text-[8px] text-zinc-500 block">{m.daysDiff.toLocaleString()} days {m.passed ? 'passed' : 'left'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WORKING / CALENDAR BREAKDOWN MATRIX */}
      {mode === 'diff' && differenceResults && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Detailed Calendar Breakdown</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
            <div className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border rounded-xl">
              <span className="text-[8px] text-zinc-450 uppercase block font-black">Calendar Months</span>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-1 block">{differenceResults.months} Months</span>
            </div>
            <div className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border rounded-xl">
              <span className="text-[8px] text-zinc-450 uppercase block font-black">Complete Weeks</span>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-1 block">{differenceResults.totalWeeks} Weeks</span>
            </div>
            <div className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border rounded-xl font-bold">
              <span className="text-[8px] text-zinc-450 uppercase block font-black">Hours Elapsed</span>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-1 block">{(differenceResults.totalDays * 24).toLocaleString()} h</span>
            </div>
            <div className="p-3 bg-zinc-50/50 dark:bg-zinc-950/20 border rounded-xl">
              <span className="text-[8px] text-zinc-450 uppercase block font-black">Minutes Elapsed</span>
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-1 block">{(differenceResults.totalDays * 1440).toLocaleString()} m</span>
            </div>
          </div>
        </div>
      )}

      {/* EXPORTS DOCK ACTIONS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block border-b border-zinc-150 dark:border-zinc-850 pb-2">Export Date Audits</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyFormattedReport}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReport ? 'Report Copied' : 'Copy Difference Summary'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
