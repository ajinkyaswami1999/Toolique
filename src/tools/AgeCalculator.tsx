/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Gift,
  Copy,
  Check,
  Clock,
  Sparkles,
  Users,
  Award,
  Globe2,
  Heart,
  Compass,
  Hourglass,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface CustomDatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  max?: string;
  min?: string;
  label?: string;
  badge?: string;
  showDirectSelects?: boolean;
}

function CustomDatePicker({
  value,
  onChange,
  max,
  min,
  label,
  badge,
  showDirectSelects = true
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'month' | 'year'>('calendar');
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parsed = useMemo(() => {
    const parts = (value || '2000-01-01').split('-');
    const y = parseInt(parts[0], 10) || 2000;
    const m = (parseInt(parts[1], 10) || 1) - 1;
    const d = parseInt(parts[2], 10) || 1;
    return { year: y, month: m, day: d };
  }, [value]);

  const [viewYear, setViewYear] = useState<number>(parsed.year);
  const [viewMonth, setViewMonth] = useState<number>(parsed.month);
  const [decadeStart, setDecadeStart] = useState<number>(Math.floor(parsed.year / 12) * 12);

  // Sync internal view when value changes from outside
  useEffect(() => {
    setViewYear(parsed.year);
    setViewMonth(parsed.month);
    setDecadeStart(Math.floor(parsed.year / 12) * 12);
  }, [parsed.year, parsed.month]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('calendar');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatIso = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const isDateDisabled = (y: number, m: number, d: number) => {
    const iso = formatIso(y, m, d);
    if (max && iso > max) return true;
    if (min && iso < min) return true;
    return false;
  };

  // Display formatting
  const displayInfo = useMemo(() => {
    const dObj = new Date(parsed.year, parsed.month, parsed.day);
    const dayStr = String(parsed.day).padStart(2, '0');
    const monthStr = MONTHS_SHORT[parsed.month] || 'Jan';
    const yearStr = parsed.year;
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayStr = weekdays[dObj.getDay()] || '';
    return {
      formatted: `${dayStr} ${monthStr} ${yearStr}`,
      weekday: weekdayStr
    };
  }, [parsed]);

  // Calendar cells
  const calendarCells = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurr = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

    const cells: Array<{ year: number; month: number; day: number; isCurrentMonth: boolean }> = [];

    // Prev month overflow
    for (let i = firstDay - 1; i >= 0; i--) {
      const pYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const pMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      cells.push({
        year: pYear,
        month: pMonth,
        day: daysInPrev - i,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInCurr; i++) {
      cells.push({
        year: viewYear,
        month: viewMonth,
        day: i,
        isCurrentMonth: true
      });
    }

    // Next month overflow
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const nYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const nMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      cells.push({
        year: nYear,
        month: nMonth,
        day: i,
        isCurrentMonth: false
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const handleSelectDate = (y: number, m: number, d: number) => {
    if (isDateDisabled(y, m, d)) return;
    const newIso = formatIso(y, m, d);
    onChange(newIso);
    setIsOpen(false);
    setViewMode('calendar');
  };

  const handleDirectDayChange = (newDay: number) => {
    const daysInMonth = new Date(parsed.year, parsed.month + 1, 0).getDate();
    const clampedDay = Math.min(newDay, daysInMonth);
    onChange(formatIso(parsed.year, parsed.month, clampedDay));
  };

  const handleDirectMonthChange = (newMonth: number) => {
    const daysInNewMonth = new Date(parsed.year, newMonth + 1, 0).getDate();
    const clampedDay = Math.min(parsed.day, daysInNewMonth);
    onChange(formatIso(parsed.year, newMonth, clampedDay));
  };

  const handleDirectYearChange = (newYear: number) => {
    const daysInMonth = new Date(newYear, parsed.month + 1, 0).getDate();
    const clampedDay = Math.min(parsed.day, daysInMonth);
    onChange(formatIso(newYear, parsed.month, clampedDay));
  };

  const maxDaysInMonth = new Date(parsed.year, parsed.month + 1, 0).getDate();

  // Year options for Direct Select (from current year + 10 down to 1910)
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear + 10; y >= 1910; y--) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  // Decade list for fast jump
  const decadeList = [2030, 2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940, 1930, 1920];

  const todayIso = formatIso(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-10'}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            {label}
          </label>
          {badge && (
            <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/50">
              {badge}
            </span>
          )}
        </div>
      )}

      <div className="space-y-2">
        {/* Main Interactive Trigger Card */}
        <button
          type="button"
          onClick={() => {
            if (!isOpen) {
              setViewYear(parsed.year);
              setViewMonth(parsed.month);
              setDecadeStart(Math.floor(parsed.year / 12) * 12);
              setViewMode('calendar');
            }
            setIsOpen(!isOpen);
          }}
          className={`w-full px-3.5 py-2.5 rounded-xl border flex items-center justify-between bg-white dark:bg-zinc-850 transition shadow-xs cursor-pointer ${
            isOpen
              ? 'border-teal-500 ring-2 ring-teal-500/20 text-zinc-900 dark:text-white'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-teal-500/60 dark:hover:border-teal-600 text-zinc-800 dark:text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-bold font-mono text-zinc-900 dark:text-zinc-100 truncate">
                {displayInfo.formatted}
              </div>
              <div className="text-[10px] text-zinc-500 font-medium">
                {displayInfo.weekday}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded-md border border-teal-200/60 dark:border-teal-800/40">
              Pick Date
            </span>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-teal-500' : ''
              }`}
            />
          </div>
        </button>

        {/* 3-Select Dropdown Quick Bar */}
        {showDirectSelects && (
          <div className="grid grid-cols-3 gap-1.5">
            {/* Day Dropdown */}
            <select
              value={parsed.day}
              onChange={(e) => handleDirectDayChange(parseInt(e.target.value, 10))}
              aria-label="Select Day"
              className="px-2 py-1.5 rounded-xl border border-zinc-250 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
            >
              {Array.from({ length: maxDaysInMonth }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Day {d}
                </option>
              ))}
            </select>

            {/* Month Dropdown */}
            <select
              value={parsed.month}
              onChange={(e) => handleDirectMonthChange(parseInt(e.target.value, 10))}
              aria-label="Select Month"
              className="px-2 py-1.5 rounded-xl border border-zinc-250 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
            >
              {MONTHS_SHORT.map((m, idx) => (
                <option key={m} value={idx}>
                  {m} ({idx + 1})
                </option>
              ))}
            </select>

            {/* Year Dropdown */}
            <select
              value={parsed.year}
              onChange={(e) => handleDirectYearChange(parseInt(e.target.value, 10))}
              aria-label="Select Year"
              className="px-2 py-1.5 rounded-xl border border-zinc-250 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer font-mono"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Modern Popover Calendar */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full min-w-[300px] sm:min-w-[330px] p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-750 rounded-2xl shadow-2xl space-y-3">
          {/* Header Navigation & View Switching */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-150 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                if (viewMode === 'calendar') {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear(viewYear - 1);
                  } else {
                    setViewMonth(viewMonth - 1);
                  }
                } else if (viewMode === 'month') {
                  setViewYear(viewYear - 1);
                } else if (viewMode === 'year') {
                  setDecadeStart(decadeStart - 12);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'month' ? 'calendar' : 'month')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-teal-500 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-900 dark:text-white'
                }`}
              >
                {MONTHS_LONG[viewMonth]} ▾
              </button>

              <button
                type="button"
                onClick={() => {
                  setDecadeStart(Math.floor(viewYear / 12) * 12);
                  setViewMode(viewMode === 'year' ? 'calendar' : 'year');
                }}
                className={`px-2.5 py-1 rounded-lg font-mono transition cursor-pointer ${
                  viewMode === 'year'
                    ? 'bg-teal-500 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-900 dark:text-white'
                }`}
              >
                {viewMode === 'year' ? `${decadeStart} - ${decadeStart + 11}` : `${viewYear} ▾`}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (viewMode === 'calendar') {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear(viewYear + 1);
                  } else {
                    setViewMonth(viewMonth + 1);
                  }
                } else if (viewMode === 'month') {
                  setViewYear(viewYear + 1);
                } else if (viewMode === 'year') {
                  setDecadeStart(decadeStart + 12);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* VIEW 1: CALENDAR DAY GRID */}
          {viewMode === 'calendar' && (
            <div className="space-y-2">
              {/* Day of Week Row */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAY_NAMES.map((w, idx) => (
                  <span
                    key={w}
                    className={`text-[11px] font-bold py-1 ${
                      idx === 0 || idx === 6
                        ? 'text-rose-500 dark:text-rose-400'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    {w}
                  </span>
                ))}
              </div>

              {/* Day Tiles Grid */}
              <div className="grid grid-cols-7 gap-1 text-xs">
                {calendarCells.map((c, i) => {
                  const isSelected =
                    c.year === parsed.year &&
                    c.month === parsed.month &&
                    c.day === parsed.day;
                  const cellIso = formatIso(c.year, c.month, c.day);
                  const isToday = cellIso === todayIso;
                  const disabled = isDateDisabled(c.year, c.month, c.day);

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectDate(c.year, c.month, c.day)}
                      className={`h-8 w-full rounded-xl flex items-center justify-center font-medium transition cursor-pointer ${
                        disabled
                          ? 'opacity-20 cursor-not-allowed text-zinc-400'
                          : isSelected
                          ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-600/30 scale-105'
                          : c.isCurrentMonth
                          ? isToday
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-bold border border-teal-500/40 hover:bg-teal-100'
                            : 'text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          : 'text-zinc-350 dark:text-zinc-650 opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                      }`}
                    >
                      {c.day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: MONTH SELECTION GRID */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {MONTHS_SHORT.map((mName, mIdx) => {
                const isSelected = parsed.year === viewYear && parsed.month === mIdx;
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => {
                      setViewMonth(mIdx);
                      setViewMode('calendar');
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          )}

          {/* VIEW 3: YEAR & DECADE SELECTION GRID */}
          {viewMode === 'year' && (
            <div className="space-y-3 py-1">
              {/* Decade Quick Jump Pills */}
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pb-1 text-[10px]">
                {decadeList.map((dec) => (
                  <button
                    key={dec}
                    type="button"
                    onClick={() => setDecadeStart(dec)}
                    className={`px-2 py-0.5 rounded-md font-mono font-semibold transition cursor-pointer ${
                      decadeStart === dec
                        ? 'bg-teal-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                    }`}
                  >
                    {dec}s
                  </button>
                ))}
              </div>

              {/* 12-Year Grid */}
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 12 }, (_, i) => decadeStart + i).map((y) => {
                  const isSelected = parsed.year === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setViewYear(y);
                        setViewMode('calendar');
                      }}
                      className={`py-2.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-md'
                          : 'bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Shortcuts */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-150 dark:border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => {
                const nowD = new Date();
                const nowIso = formatIso(nowD.getFullYear(), nowD.getMonth(), nowD.getDate());
                if (!isDateDisabled(nowD.getFullYear(), nowD.getMonth(), nowD.getDate())) {
                  onChange(nowIso);
                  setIsOpen(false);
                }
              }}
              className="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setViewMode('calendar');
              }}
              className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-lg transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type CalculatorTab = 'exact' | 'compare' | 'milestones' | 'planets' | 'astrology';
type AstroTab = 'vedic' | 'numerology' | 'western';

interface VedicRashiInfo {
  nameHi: string;
  nameEn: string;
  westernEquivalent: string;
  symbol: string;
  dates: string;
  lordHi: string;
  lordEn: string;
  elementHi: string;
  elementEn: string;
  gemstoneHi: string;
  gemstoneEn: string;
  gemstoneBenefits: string;
  luckyDayHi: string;
  luckyDayEn: string;
  luckyColors: string;
  luckyNumbers: string;
  ishtaDevHi: string;
  ishtaDevEn: string;
  namakshar: string;
  guna: string;
  nature: string;
  beejMantra: string;
  beejMantraTransliteration: string;
  beejMantraMeaning: string;
  coreTraits: string;
  careerPaths: string;
}

interface VedicNumerologyInfo {
  moolank: number;
  bhagyank: number;
  moolankLord: string;
  bhagyankLord: string;
  moolankMeaning: string;
  bhagyankMeaning: string;
  compatibleNumbers: string;
}

interface VedicWeekdayInfo {
  dayNameHi: string;
  dayNameEn: string;
  grahaLord: string;
  significance: string;
}

interface ZodiacInfo {
  sign: string;
  symbol: string;
  element: string;
  dates: string;
  trait: string;
}

interface ChineseZodiacInfo {
  animal: string;
  element: string;
  luckyNumbers: string;
}

export default function AgeCalculator() {
  // Tab State
  const [activeTab, setActiveTab] = useState<CalculatorTab>('exact');
  const [astroTab, setAstroTab] = useState<AstroTab>('vedic');
  const [copiedMantra, setCopiedMantra] = useState<boolean>(false);

  // Exact Age Inputs
  const [dob, setDob] = useState<string>('2000-01-01');
  const [birthTime, setBirthTime] = useState<string>('12:00');
  const [targetDate, setTargetDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [useCurrentTime, setUseCurrentTime] = useState<boolean>(true);

  // Compare Mode Inputs
  const [person1Name, setPerson1Name] = useState<string>('Person 1');
  const [person1Dob, setPerson1Dob] = useState<string>('1998-05-15');
  const [person2Name, setPerson2Name] = useState<string>('Person 2');
  const [person2Dob, setPerson2Dob] = useState<string>('2001-11-20');

  // Copy Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Clock Trigger for ticking seconds
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Exact Age Calculations
  const ageData = useMemo(() => {
    const birthDateTime = new Date(`${dob}T${birthTime || '00:00'}:00`);
    const targetDateTime = useCurrentTime && targetDate === now.toISOString().split('T')[0]
      ? now
      : new Date(`${targetDate}T23:59:59`);

    if (isNaN(birthDateTime.getTime()) || isNaN(targetDateTime.getTime()) || birthDateTime > targetDateTime) {
      return null;
    }

    let years = targetDateTime.getFullYear() - birthDateTime.getFullYear();
    let months = targetDateTime.getMonth() - birthDateTime.getMonth();
    let days = targetDateTime.getDate() - birthDateTime.getDate();
    let hours = targetDateTime.getHours() - birthDateTime.getHours();
    let minutes = targetDateTime.getMinutes() - birthDateTime.getMinutes();
    let seconds = targetDateTime.getSeconds() - birthDateTime.getSeconds();

    if (seconds < 0) {
      minutes -= 1;
      seconds += 60;
    }
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    if (hours < 0) {
      days -= 1;
      hours += 24;
    }
    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(targetDateTime.getFullYear(), targetDateTime.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffMs = targetDateTime.getTime() - birthDateTime.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalSeconds = Math.floor(diffMs / 1000);

    // Next Birthday Countdown
    const nextBday = new Date(targetDateTime.getFullYear(), birthDateTime.getMonth(), birthDateTime.getDate(), birthDateTime.getHours(), birthDateTime.getMinutes());
    if (nextBday.getTime() < targetDateTime.getTime()) {
      nextBday.setFullYear(targetDateTime.getFullYear() + 1);
    }

    const diffBdayMs = nextBday.getTime() - targetDateTime.getTime();
    const bdayTotalDays = Math.floor(diffBdayMs / (1000 * 60 * 60 * 24));
    const bdayHours = Math.floor((diffBdayMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const bdayMins = Math.floor((diffBdayMs % (1000 * 60 * 60)) / (1000 * 60));
    const bdaySecs = Math.floor((diffBdayMs % (1000 * 60)) / 1000);

    // Next Birthday Months and Days
    let nBdayMonths = nextBday.getMonth() - targetDateTime.getMonth();
    let nBdayDays = nextBday.getDate() - targetDateTime.getDate();
    if (nBdayDays < 0) {
      nBdayMonths -= 1;
      const prevM = new Date(nextBday.getFullYear(), nextBday.getMonth(), 0);
      nBdayDays += prevM.getDate();
    }
    if (nBdayMonths < 0) {
      nBdayMonths += 12;
    }

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const nextBirthdayWeekday = weekdays[nextBday.getDay()];
    const isBirthdayToday = bdayTotalDays === 0 && targetDateTime.getMonth() === birthDateTime.getMonth() && targetDateTime.getDate() === birthDateTime.getDate();

    // Half Birthday (6 months after birthday)
    const halfBday = new Date(birthDateTime);
    halfBday.setMonth(halfBday.getMonth() + 6);
    const halfBdayStr = halfBday.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });

    // Day of birth
    const dayOfBirth = weekdays[birthDateTime.getDay()];

    return {
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds,
      bdayTotalDays,
      bdayHours,
      bdayMins,
      bdaySecs,
      nextBirthdayMonths: nBdayMonths,
      nextBirthdayDays: nBdayDays,
      nextBirthdayWeekday,
      nextBirthdayDate: nextBday,
      isBirthdayToday,
      halfBdayStr,
      dayOfBirth,
      birthDateTime
    };
  }, [dob, birthTime, targetDate, useCurrentTime, now]);

  // Astrological Western Zodiac
  const zodiac = useMemo((): ZodiacInfo | null => {
    if (!dob) return null;
    const date = new Date(dob);
    if (isNaN(date.getTime())) return null;
    const m = date.getMonth() + 1;
    const d = date.getDate();

    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return { sign: 'Aries', symbol: '♈', element: 'Fire', dates: 'Mar 21 - Apr 19', trait: 'Courageous, Determined, Confident' };
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return { sign: 'Taurus', symbol: '♉', element: 'Earth', dates: 'Apr 20 - May 20', trait: 'Reliable, Patient, Practical' };
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return { sign: 'Gemini', symbol: '♊', element: 'Air', dates: 'May 21 - Jun 20', trait: 'Adaptable, Outgoing, Intelligent' };
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return { sign: 'Cancer', symbol: '♋', element: 'Water', dates: 'Jun 21 - Jul 22', trait: 'Intuitive, Compassionate, Protective' };
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return { sign: 'Leo', symbol: '♌', element: 'Fire', dates: 'Jul 23 - Aug 22', trait: 'Generous, Warm-hearted, Creative' };
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return { sign: 'Virgo', symbol: '♍', element: 'Earth', dates: 'Aug 23 - Sep 22', trait: 'Analytical, Loyal, Detail-Oriented' };
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return { sign: 'Libra', symbol: '♎', element: 'Air', dates: 'Sep 23 - Oct 22', trait: 'Diplomatic, Gracious, Fair-minded' };
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return { sign: 'Scorpio', symbol: '♏', element: 'Water', dates: 'Oct 23 - Nov 21', trait: 'Resourceful, Powerful, Passionate' };
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return { sign: 'Sagittarius', symbol: '♐', element: 'Fire', dates: 'Nov 22 - Dec 21', trait: 'Generous, Idealistic, Great sense of humor' };
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return { sign: 'Capricorn', symbol: '♑', element: 'Earth', dates: 'Dec 22 - Jan 19', trait: 'Disciplined, Responsible, Tenacious' };
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return { sign: 'Aquarius', symbol: '♒', element: 'Air', dates: 'Jan 20 - Feb 18', trait: 'Original, Progressive, Independent' };
    return { sign: 'Pisces', symbol: '♓', element: 'Water', dates: 'Feb 19 - Mar 20', trait: 'Empathetic, Artistic, Wise' };
  }, [dob]);

  // Vedic Sidereal Sun Rashi (Nirayana Sankranti System)
  const vedicRashi = useMemo((): VedicRashiInfo | null => {
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;

    const m = d.getMonth() + 1; // 1-12
    const day = d.getDate();

    if ((m === 4 && day >= 14) || (m === 5 && day <= 14)) {
      return {
        nameHi: 'मेष राशि',
        nameEn: 'Mesha (Aries)',
        westernEquivalent: 'Aries',
        symbol: '♈ 🐏',
        dates: 'April 14 – May 14',
        lordHi: 'मंगल (Mangal)',
        lordEn: 'Mars (Mangal Dev)',
        elementHi: 'अग्नि तत्व',
        elementEn: 'Fire (Agni Tattva)',
        gemstoneHi: 'मूंगा / लाल मूंगा',
        gemstoneEn: 'Red Coral (Moonga)',
        gemstoneBenefits: 'Enhances courage, stamina, leadership authority, and physical vitality.',
        luckyDayHi: 'मंगलवार (Tuesday)',
        luckyDayEn: 'Tuesday (Mangalvar)',
        luckyColors: 'Bright Red, Coral, Saffron & Gold',
        luckyNumbers: '9, 1, 3',
        ishtaDevHi: 'भगवान हनुमान जी / कार्तिकेय',
        ishtaDevEn: 'Lord Hanuman / Kartikeya',
        namakshar: 'Chu, Che, Cho, La, Li, Lu, Le, Lo, A (चू, चे, चो, ला, ली, लू, ले, लो, अ)',
        guna: 'Rajasic (Dynamic, Action-Oriented)',
        nature: 'Chara (Movable / Cardinal)',
        beejMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
        beejMantraTransliteration: 'Om Kraam Kreem Kroum Sah Bhaumaya Namah',
        beejMantraMeaning: 'Salutations to Mars, the cosmic source of courage, physical vitality, and heroic leadership.',
        coreTraits: 'Fearless pioneer with abundant stamina, quick decision-making, natural leadership, and high initiative.',
        careerPaths: 'Executive Leadership, Defense & Armed Forces, Surgery, Athletics, Dynamic Entrepreneurship, and Engineering.'
      };
    }
    if ((m === 5 && day >= 15) || (m === 6 && day <= 14)) {
      return {
        nameHi: 'वृषभ राशि',
        nameEn: 'Vrishabha (Taurus)',
        westernEquivalent: 'Taurus',
        symbol: '♉ 🐂',
        dates: 'May 15 – June 14',
        lordHi: 'शुक्र (Shukra)',
        lordEn: 'Venus (Shukra Dev)',
        elementHi: 'पृथ्वी तत्व',
        elementEn: 'Earth (Prithvi Tattva)',
        gemstoneHi: 'हीरा / सफेद ओपल / जरकन',
        gemstoneEn: 'Diamond / White Opal (Heera)',
        gemstoneBenefits: 'Attracts prosperity, financial luxury, artistic creativity, and marital harmony.',
        luckyDayHi: 'शुक्रवार (Friday)',
        luckyDayEn: 'Friday (Shukravar)',
        luckyColors: 'Pure White, Silver, Cream & Soft Pink',
        luckyNumbers: '6, 5, 2',
        ishtaDevHi: 'मां महालक्ष्मी / संतोषी माता',
        ishtaDevEn: 'Goddess Mahalakshmi',
        namakshar: 'I, U, E, O, Va, Vi, Vu, Ve, Vo (ई, ऊ, ए, ओ, वा, वी, वू, वे, वो)',
        guna: 'Rajasic (Creative & Wealth-Seeking)',
        nature: 'Sthira (Fixed / Steadfast)',
        beejMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
        beejMantraTransliteration: 'Om Draam Dreem Droum Sah Shukraya Namah',
        beejMantraMeaning: 'Salutations to Venus, governor of elegance, material abundance, harmony, and fine arts.',
        coreTraits: 'Steadfast, patient, financially astute, aesthetic connoisseur, loyal, and grounded in practical reality.',
        careerPaths: 'Banking & Wealth Management, Luxury Goods, Architecture, Fashion, Real Estate, and Creative Arts.'
      };
    }
    if ((m === 6 && day >= 15) || (m === 7 && day <= 15)) {
      return {
        nameHi: 'मिथुन राशि',
        nameEn: 'Mithuna (Gemini)',
        westernEquivalent: 'Gemini',
        symbol: '♊ 👥',
        dates: 'June 15 – July 15',
        lordHi: 'बुध (Budh)',
        lordEn: 'Mercury (Budh Dev)',
        elementHi: 'वायु तत्व',
        elementEn: 'Air (Vayu Tattva)',
        gemstoneHi: 'पन्ना / हरा पन्ना',
        gemstoneEn: 'Emerald (Panna)',
        gemstoneBenefits: 'Sharpens intellectual intellect, commercial acumen, memory, and articulate speech.',
        luckyDayHi: 'बुधवार (Wednesday)',
        luckyDayEn: 'Wednesday (Budhvar)',
        luckyColors: 'Emerald Green, Light Green & Pale Yellow',
        luckyNumbers: '5, 3, 7',
        ishtaDevHi: 'भगवान श्री गणेश / विष्णु जी',
        ishtaDevEn: 'Lord Ganesha / Lord Vishnu',
        namakshar: 'Ka, Ki, Ku, Gha, Chha, Ke, Ko, Ha (का, की, कू, घ, ङ, छ, के, को, हा)',
        guna: 'Sattvic (Intellectual & Communicative)',
        nature: 'Dvisvabhava (Dual / Adaptable)',
        beejMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
        beejMantraTransliteration: 'Om Braam Breem Broum Sah Budhaya Namah',
        beejMantraMeaning: 'Salutations to Mercury, divine source of sharp analytical intelligence, wit, and communication.',
        coreTraits: 'Sharp intellect, eloquent conversationalist, witty, multi-tasker, curious researcher, and versatile thinker.',
        careerPaths: 'Media & Journalism, Technology, Trading & Commerce, Marketing, Data Analytics, and Writing.'
      };
    }
    if ((m === 7 && day >= 16) || (m === 8 && day <= 16)) {
      return {
        nameHi: 'कर्क राशि',
        nameEn: 'Karka (Cancer)',
        westernEquivalent: 'Cancer',
        symbol: '♋ 🦀',
        dates: 'July 16 – August 16',
        lordHi: 'चंद्र (Chandra)',
        lordEn: 'The Moon (Chandra Dev)',
        elementHi: 'जल तत्व',
        elementEn: 'Water (Jal Tattva)',
        gemstoneHi: 'मोती / सच्चा मोती',
        gemstoneEn: 'Natural Pearl (Moti) / Moonstone',
        gemstoneBenefits: 'Calms the mind, fosters emotional stability, intuitive depth, and mental peace.',
        luckyDayHi: 'सोमवार (Monday)',
        luckyDayEn: 'Monday (Somvar)',
        luckyColors: 'Pearl White, Milky Silver & Sea Green',
        luckyNumbers: '2, 7, 4',
        ishtaDevHi: 'भगवान शिव (भोलेनाथ)',
        ishtaDevEn: 'Lord Shiva (Bholenath)',
        namakshar: 'Hi, Hu, He, Ho, Da, Dee, Do, De (ही, हू, हे, हो, डा, डी, डू, डे, डो)',
        guna: 'Sattvic (Empathetic & Nurturing)',
        nature: 'Chara (Movable / Intuitive)',
        beejMantra: 'ॐ श्रां श्रीं श्रौं सः चंद्रमसे नमः',
        beejMantraTransliteration: 'Om Shraam Shreem Shroum Sah Chandramase Namah',
        beejMantraMeaning: 'Salutations to the divine Moon God, embodiment of serenity, emotional intuition, and soothing grace.',
        coreTraits: 'Deeply intuitive, compassionate caregiver, strong emotional resilience, protective instincts, and artistic soul.',
        careerPaths: 'Healthcare, Medicine, Human Resources, Psychology, Hospitality, Creative Writing, and Social Welfare.'
      };
    }
    if ((m === 8 && day >= 17) || (m === 9 && day <= 16)) {
      return {
        nameHi: 'सिंह राशि',
        nameEn: 'Simha (Leo)',
        westernEquivalent: 'Leo',
        symbol: '♌ 🦁',
        dates: 'August 17 – September 16',
        lordHi: 'सूर्य (Surya Dev)',
        lordEn: 'The Sun (Surya Dev)',
        elementHi: 'अग्नि तत्व',
        elementEn: 'Fire (Agni Tattva)',
        gemstoneHi: 'माणिक्य / रूबी',
        gemstoneEn: 'Natural Ruby (Manikya)',
        gemstoneBenefits: 'Boosts executive authority, social prestige, leadership magnetism, and solar vitality.',
        luckyDayHi: 'रविवार (Sunday)',
        luckyDayEn: 'Sunday (Ravivar)',
        luckyColors: 'Royal Gold, Saffron & Crimson Red',
        luckyNumbers: '1, 4, 9',
        ishtaDevHi: 'भगवान सूर्य नारायण / गायत्री माता',
        ishtaDevEn: 'Lord Surya (Sun God) / Gayatri Devi',
        namakshar: 'Ma, Mi, Mu, Me, Mo, Ta, Ti, Tu, Te (मा, मी, मू, मे, मो, टा, टी, टू, टे)',
        guna: 'Sattvic (Regal & Magnanimous)',
        nature: 'Sthira (Fixed / Commanding)',
        beejMantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
        beejMantraTransliteration: 'Om Hraam Hreem Hroum Sah Suryaya Namah',
        beejMantraMeaning: 'Salutations to the radiant Sun God, supreme cosmic origin of power, life vitality, and royal dignity.',
        coreTraits: 'Regal confidence, generous heart, commanding presence, natural authority, and uncompromising integrity.',
        careerPaths: 'Corporate Executive Leadership, Civil Services, Politics, Creative Direction, and High-Impact Entrepreneurship.'
      };
    }
    if ((m === 9 && day >= 17) || (m === 10 && day <= 16)) {
      return {
        nameHi: 'कन्या राशि',
        nameEn: 'Kanya (Virgo)',
        westernEquivalent: 'Virgo',
        symbol: '♍ 🌾',
        dates: 'September 17 – October 16',
        lordHi: 'बुध (Budh)',
        lordEn: 'Mercury (Budh Dev)',
        elementHi: 'पृथ्वी तत्व',
        elementEn: 'Earth (Prithvi Tattva)',
        gemstoneHi: 'पन्ना / हरी तुरमली',
        gemstoneEn: 'Emerald (Panna)',
        gemstoneBenefits: 'Enhances critical analysis, logical problem-solving, and professional precision.',
        luckyDayHi: 'बुधवार (Wednesday)',
        luckyDayEn: 'Wednesday (Budhvar)',
        luckyColors: 'Dark Green, Olive & Khaki',
        luckyNumbers: '5, 2, 6',
        ishtaDevHi: 'भगवान गणेश / मां दुर्गा',
        ishtaDevEn: 'Lord Ganesha / Goddess Durga',
        namakshar: 'To, Pa, Pi, Pu, Sha, Na, Pe, Po (टो, पा, पी, पू, ष, ण, ठ, पे, पो)',
        guna: 'Tamasic (Methodical & Analytical)',
        nature: 'Dvisvabhava (Dual / Practical)',
        beejMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
        beejMantraTransliteration: 'Om Braam Breem Broum Sah Budhaya Namah',
        beejMantraMeaning: 'Salutations to Mercury, master of computational precision, analytical intelligence, and clear speech.',
        coreTraits: 'Analytical mastery, eye for detail, diligent work ethic, structured organization, and practical efficiency.',
        careerPaths: 'Software Engineering, Finance & Accounting, Statistical Research, Medicine, Editing, and Operations.'
      };
    }
    if ((m === 10 && day >= 17) || (m === 11 && day <= 15)) {
      return {
        nameHi: 'तुला राशि',
        nameEn: 'Tula (Libra)',
        westernEquivalent: 'Libra',
        symbol: '♎ ⚖️',
        dates: 'October 17 – November 15',
        lordHi: 'शुक्र (Shukra)',
        lordEn: 'Venus (Shukra Dev)',
        elementHi: 'वायु तत्व',
        elementEn: 'Air (Vayu Tattva)',
        gemstoneHi: 'हीरा / सफेद पुखराज / ओपल',
        gemstoneEn: 'Diamond / White Sapphire (Heera)',
        gemstoneBenefits: 'Fosters relationship harmony, social magnetism, wealth creation, and creative balance.',
        luckyDayHi: 'शुक्रवार (Friday)',
        luckyDayEn: 'Friday (Shukravar)',
        luckyColors: 'Bright White, Light Sky Blue & Rose',
        luckyNumbers: '6, 7, 8',
        ishtaDevHi: 'मां महालक्ष्मी / मां दुर्गा',
        ishtaDevEn: 'Goddess Mahalakshmi / Goddess Durga',
        namakshar: 'Ra, Ri, Ru, Re, Ro, Ta, Ti, Tu, Te (रा, री, रू, रे, रो, ता, ती, तू, ते)',
        guna: 'Rajasic (Harmonious & Artistic)',
        nature: 'Chara (Movable / Diplomatic)',
        beejMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
        beejMantraTransliteration: 'Om Draam Dreem Droum Sah Shukraya Namah',
        beejMantraMeaning: 'Salutations to Venus, architect of balance, beauty, diplomatic wisdom, and lasting harmony.',
        coreTraits: 'Diplomatic mediator, balanced worldview, refined aesthetic sensibilities, fairness, and captivating charm.',
        careerPaths: 'Law & Judiciary, Diplomacy, Architecture, Fine Arts, Public Relations, Consulting, and Design.'
      };
    }
    if ((m === 11 && day >= 16) || (m === 12 && day <= 15)) {
      return {
        nameHi: 'वृश्चिक राशि',
        nameEn: 'Vrishchika (Scorpio)',
        westernEquivalent: 'Scorpio',
        symbol: '♏ 🦂',
        dates: 'November 16 – December 15',
        lordHi: 'मंगल / केतु (Mangal/Ketu)',
        lordEn: 'Mars & Ketu (Mangal Dev)',
        elementHi: 'जल तत्व',
        elementEn: 'Water (Jal Tattva)',
        gemstoneHi: 'मूंगा / त्रिकोणीय मूंगा',
        gemstoneEn: 'Red Coral (Moonga)',
        gemstoneBenefits: 'Shields against negativity, strengthens psychological resolve, and drives breakthroughs.',
        luckyDayHi: 'मंगलवार (Tuesday)',
        luckyDayEn: 'Tuesday (Mangalvar)',
        luckyColors: 'Maroon, Crimson Red & Rust',
        luckyNumbers: '9, 8, 4',
        ishtaDevHi: 'हनुमान जी / भगवान भैरव',
        ishtaDevEn: 'Lord Hanuman / Lord Kartikeya',
        namakshar: 'To, Na, Ni, Nu, Ne, No, Ya, Yi, Yu (तो, ना, नी, नू, ने, नो, या, यी, यू)',
        guna: 'Tamasic (Intense & Transformative)',
        nature: 'Sthira (Fixed / Unwavering)',
        beejMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
        beejMantraTransliteration: 'Om Kraam Kreem Kroum Sah Bhaumaya Namah',
        beejMantraMeaning: 'Salutations to Mars and the cosmic forces of transformation, courage, and unyielding will.',
        coreTraits: 'Intense mental focus, profound emotional depth, unwavering loyalty, investigative brilliance, and resilience.',
        careerPaths: 'Cybersecurity, Investigative Research, Surgery, Forensics, Psychology, Investment Banking, and Intelligence.'
      };
    }
    if ((m === 12 && day >= 16) || (m === 1 && day <= 14)) {
      return {
        nameHi: 'धनु राशि',
        nameEn: 'Dhanu (Sagittarius)',
        westernEquivalent: 'Sagittarius',
        symbol: '♐ 🏹',
        dates: 'December 16 – January 14',
        lordHi: 'गुरु / बृहस्पति (Guru)',
        lordEn: 'Jupiter (Brihaspati / Guru Dev)',
        elementHi: 'अग्नि तत्व',
        elementEn: 'Fire (Agni Tattva)',
        gemstoneHi: 'पीला पुखराज / सुनहला',
        gemstoneEn: 'Yellow Sapphire (Pukhraj)',
        gemstoneBenefits: 'Attracts spiritual wisdom, fortune, high status, academic excellence, and divine grace.',
        luckyDayHi: 'गुरुवार (Thursday)',
        luckyDayEn: 'Thursday (Guruvar)',
        luckyColors: 'Bright Yellow, Saffron & Pure Gold',
        luckyNumbers: '3, 9, 7',
        ishtaDevHi: 'भगवान श्री हरि विष्णु / दत्तात्रेय',
        ishtaDevEn: 'Lord Vishnu / Lord Dattatreya',
        namakshar: 'Ye, Yo, Bha, Bhi, Bhu, Dha, Pha, Bhe (ये, यो, भा, भी, भू, धा, फा, ढा, भे)',
        guna: 'Sattvic (Philosophical & Wise)',
        nature: 'Dvisvabhava (Dual / Visionary)',
        beejMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
        beejMantraTransliteration: 'Om Graam Greem Groum Sah Gurave Namah',
        beejMantraMeaning: 'Salutations to Lord Brihaspati, supreme guru of the gods, reservoir of wisdom and higher truth.',
        coreTraits: 'Philosophical optimism, ethical clarity, visionary outlook, inspiring educator, and truth seeker.',
        careerPaths: 'Higher Education, International Commerce, Law, Publishing, Spiritual Counseling, and Strategic Advisory.'
      };
    }
    if ((m === 1 && day >= 15) || (m === 2 && day <= 12)) {
      return {
        nameHi: 'मकर राशि',
        nameEn: 'Makara (Capricorn)',
        westernEquivalent: 'Capricorn',
        symbol: '♑ 🐊',
        dates: 'January 15 – February 12',
        lordHi: 'शनि देव (Shani Dev)',
        lordEn: 'Saturn (Shani Dev)',
        elementHi: 'पृथ्वी तत्व',
        elementEn: 'Earth (Prithvi Tattva)',
        gemstoneHi: 'नीलम / जमुनिया',
        gemstoneEn: 'Blue Sapphire (Neelam) / Amethyst',
        gemstoneBenefits: 'Instills supreme discipline, endurance, career longevity, and steady material growth.',
        luckyDayHi: 'शनिवार (Saturday)',
        luckyDayEn: 'Saturday (Shanivar)',
        luckyColors: 'Dark Blue, Charcoal Grey & Black',
        luckyNumbers: '8, 4, 6',
        ishtaDevHi: 'भगवान शिव / शनि देव / हनुमान जी',
        ishtaDevEn: 'Lord Shiva / Lord Shani Dev',
        namakshar: 'Bho, Ja, Ji, Khi, Khu, Khe, Kho, Ga, Gi (भो, जा, जी, खी, खू, खे, खो, गा, गी)',
        guna: 'Tamasic (Disciplined & Karmic)',
        nature: 'Chara (Movable / Ambitious)',
        beejMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
        beejMantraTransliteration: 'Om Praam Preem Proum Sah Shanaishcharaya Namah',
        beejMantraMeaning: 'Salutations to Lord Saturn, master of time, karma, endurance, discipline, and ultimate mastery.',
        coreTraits: 'Patient empire-builder, unmatched discipline, pragmatic realist, reliable administrator, and persevering strategist.',
        careerPaths: 'Civil Engineering, Corporate Governance, Infrastructure, Supply Chain Management, and Judiciary.'
      };
    }
    if ((m === 2 && day >= 13) || (m === 3 && day <= 13)) {
      return {
        nameHi: 'कुंभ राशि',
        nameEn: 'Kumbha (Aquarius)',
        westernEquivalent: 'Aquarius',
        symbol: '♒ 🏺',
        dates: 'February 13 – March 13',
        lordHi: 'शनि एवं राहु (Shani & Rahu)',
        lordEn: 'Saturn & Rahu (Shani & Rahu)',
        elementHi: 'वायु तत्व',
        elementEn: 'Air (Vayu Tattva)',
        gemstoneHi: 'नीलम / लाजवर्त / गोमेद',
        gemstoneEn: 'Blue Sapphire (Neelam) / Lapis Lazuli',
        gemstoneBenefits: 'Catalyzes out-of-the-box innovation, scientific breakthrough, and humanitarian vision.',
        luckyDayHi: 'शनिवार (Saturday)',
        luckyDayEn: 'Saturday (Shanivar)',
        luckyColors: 'Electric Blue, Violet & Deep Navy',
        luckyNumbers: '8, 7, 4',
        ishtaDevHi: 'भगवान शिव (रुद्र रूप)',
        ishtaDevEn: 'Lord Shiva (Rudra Avatar)',
        namakshar: 'Gu, Ge, Go, Sa, Si, Su, Se, So, Da (गू, गे, गो, सा, सी, सू, से, सो, दा)',
        guna: 'Tamasic (Innovative & Reformist)',
        nature: 'Sthira (Fixed / Humanitarian)',
        beejMantra: 'ॐ शं शनैश्चराय नमः',
        beejMantraTransliteration: 'Om Sham Shanaishcharaya Namah',
        beejMantraMeaning: 'Salutations to Lord Saturn, guardian of justice, societal progress, and revolutionary vision.',
        coreTraits: 'Forward-thinking reformer, inventive genius, humanitarian spirit, intellectual independence, and unconventional wisdom.',
        careerPaths: 'Advanced Technology, Aerospace, Scientific Research, Social Welfare, Artificial Intelligence, and Non-Profits.'
      };
    }
    // Meena (Pisces) (Mar 14 - Apr 13)
    return {
      nameHi: 'मीन राशि',
      nameEn: 'Meena (Pisces)',
      westernEquivalent: 'Pisces',
      symbol: '♓ 🐟',
      dates: 'March 14 – April 13',
      lordHi: 'गुरु / बृहस्पति (Guru)',
      lordEn: 'Jupiter (Brihaspati / Guru Dev)',
      elementHi: 'जल तत्व',
      elementEn: 'Water (Jal Tattva)',
      gemstoneHi: 'पीला पुखराज / पुखराज',
      gemstoneEn: 'Yellow Sapphire (Pukhraj)',
      gemstoneBenefits: 'Nurtures spiritual intuition, mental peace, artistic imagination, and higher consciousness.',
      luckyDayHi: 'गुरुवार (Thursday)',
      luckyDayEn: 'Thursday (Guruvar)',
      luckyColors: 'Golden Yellow, Saffron & Aquamarine',
      luckyNumbers: '3, 7, 9',
      ishtaDevHi: 'भगवान श्री विष्णु / नारायण',
      ishtaDevEn: 'Lord Sri Vishnu / Narayana',
      namakshar: 'Di, Du, Tha, Jha, De, Do, Cha, Chi (दी, दू, थ, झ, ञ, दे, दो, चा, ची)',
      guna: 'Sattvic (Spiritual & Compassionate)',
      nature: 'Dvisvabhava (Dual / Mystic)',
      beejMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
      beejMantraTransliteration: 'Om Graam Greem Groum Sah Gurave Namah',
      beejMantraMeaning: 'Salutations to Lord Brihaspati, ocean of divine wisdom, compassion, and spiritual enlightenment.',
      coreTraits: 'Spiritual healer, profound empathy, artistic vision, intuitive understanding, and selfless generosity.',
      careerPaths: 'Creative Arts, Filmmaking, Holistic Wellness, Spiritual Teaching, Psychology, and Philanthropy.'
    };
  }, [dob]);

  // Vedic Numerology (Moolank & Bhagyank)
  const vedicNumerology = useMemo((): VedicNumerologyInfo | null => {
    if (!dob) return null;
    const parts = dob.split('-');
    if (parts.length < 3) return null;

    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;

    const sumDigits = (num: number): number => {
      let sum = num;
      while (sum > 9) {
        sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
      }
      return sum;
    };

    const moolank = sumDigits(d);

    // Bhagyank = sum of all digits
    const totalDigits = `${d}${m}${y}`;
    const rawSum = totalDigits.split('').reduce((acc, char) => acc + parseInt(char, 10), 0);
    const bhagyank = sumDigits(rawSum);

    const numMeanings: Record<number, { lord: string; meaning: string; compatible: string }> = {
      1: { lord: 'सूर्य (Surya Dev - Sun)', meaning: 'Born leader, independent, commanding aura, ambitious achiever.', compatible: '1, 2, 3, 9' },
      2: { lord: 'चंद्र (Chandra Dev - Moon)', meaning: 'Gentle, imaginative, diplomatic, intuitive, peace-loving collaborator.', compatible: '1, 2, 4, 7' },
      3: { lord: 'गुरु (Brihaspati - Jupiter)', meaning: 'Wise counselor, optimistic, creative communicator, expansive knowledge.', compatible: '1, 3, 6, 9' },
      4: { lord: 'राहु (Rahu)', meaning: 'Revolutionary thinker, practical executor, highly technical, unconventional.', compatible: '1, 2, 7, 8' },
      5: { lord: 'बुध (Budh - Mercury)', meaning: 'Commercial intellect, fast learner, witty communicator, dynamic adapter.', compatible: '1, 5, 6, 8' },
      6: { lord: 'शुक्र (Shukra - Venus)', meaning: 'Charming, luxury & beauty enthusiast, magnetic grace, artistic genius.', compatible: '3, 5, 6, 9' },
      7: { lord: 'केतु (Ketu)', meaning: 'Deep researcher, mystical, philosophical intuition, truth seeker.', compatible: '2, 4, 7' },
      8: { lord: 'शनि (Shani Dev - Saturn)', meaning: 'Resilient master of karma, disciplined strategist, builds lasting empire.', compatible: '4, 5, 6, 8' },
      9: { lord: 'मंगल (Mangal - Mars)', meaning: 'Warrior spirit, fearless courage, decisive leader, passionate humanitarian.', compatible: '1, 3, 5, 9' }
    };

    const mInfo = numMeanings[moolank] || numMeanings[1];
    const bInfo = numMeanings[bhagyank] || numMeanings[1];

    return {
      moolank,
      bhagyank,
      moolankLord: mInfo.lord,
      bhagyankLord: bInfo.lord,
      moolankMeaning: mInfo.meaning,
      bhagyankMeaning: bInfo.meaning,
      compatibleNumbers: mInfo.compatible
    };
  }, [dob]);

  // Vedic Weekday Lord
  const vedicWeekday = useMemo((): VedicWeekdayInfo | null => {
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;

    const dayOfWeek = d.getDay(); // 0 = Sun
    const list: VedicWeekdayInfo[] = [
      { dayNameHi: 'रविवार (Ravivar)', dayNameEn: 'Sunday', grahaLord: 'सूर्य देव (Surya Dev - Sun)', significance: 'Brings royal dignity, leadership, vibrant vitality and solar charisma.' },
      { dayNameHi: 'सोमवार (Somvar)', dayNameEn: 'Monday', grahaLord: 'चंद्र देव (Chandra Dev - Moon)', significance: 'Blesses with emotional calm, intuition, empathy and artistic flair.' },
      { dayNameHi: 'मंगलवार (Mangalvar)', dayNameEn: 'Tuesday', grahaLord: 'मंगल देव (Mangal - Mars)', significance: 'Bestows fearless courage, athleticism, high drive and breakthrough resolve.' },
      { dayNameHi: 'बुधवार (Budhvar)', dayNameEn: 'Wednesday', grahaLord: 'बुध देव (Budh - Mercury)', significance: 'Favors analytical intellect, witty communication and commercial acumen.' },
      { dayNameHi: 'गुरुवार (Guruvar)', dayNameEn: 'Thursday', grahaLord: 'बृहस्पति देव (Brihaspati / Guru - Jupiter)', significance: 'Bestows spiritual wisdom, higher learning, generosity and divine fortune.' },
      { dayNameHi: 'शुक्रवार (Shukravar)', dayNameEn: 'Friday', grahaLord: 'शुक्र देव (Shukra - Venus)', significance: 'Confers refined artistic taste, charm, magnetic grace and prosperity.' },
      { dayNameHi: 'शनिवार (Shanivar)', dayNameEn: 'Saturday', grahaLord: 'शनि देव (Shani - Saturn)', significance: 'Builds unshakeable discipline, patience, justice and long-term mastery.' }
    ];
    return list[dayOfWeek] || list[0];
  }, [dob]);

  // Chinese Zodiac
  const chineseZodiac = useMemo((): ChineseZodiacInfo | null => {
    if (!dob) return null;
    const year = new Date(dob).getFullYear();
    if (isNaN(year)) return null;

    const animals = ['Rat 🐀', 'Ox 🐂', 'Tiger 🐅', 'Rabbit 🐇', 'Dragon 🐉', 'Snake 🐍', 'Horse 🐎', 'Goat 🐐', 'Monkey 🐒', 'Rooster 🐓', 'Dog 🐕', 'Pig 🐖'];
    const elements = ['Metal', 'Metal', 'Water', 'Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth'];

    const animalIndex = (year - 4) % 12;
    const elementIndex = (year - 4) % 10;

    return {
      animal: animals[animalIndex >= 0 ? animalIndex : animalIndex + 12],
      element: elements[elementIndex >= 0 ? elementIndex : elementIndex + 10],
      luckyNumbers: `${(year % 9) + 1}, ${(year % 7) + 2}, ${(year % 5) + 3}`
    };
  }, [dob]);

  // Biological Estimates
  const bioStats = useMemo(() => {
    if (!ageData) return null;
    const days = ageData.totalDays;
    return {
      heartbeats: Math.round(days * 24 * 60 * 75), // ~75 bpm average
      breaths: Math.round(days * 24 * 60 * 16), // ~16 breaths/min
      sleepHours: Math.round(days * 8), // ~8 hours/day
      meals: Math.round(days * 3), // ~3 meals/day
      laughter: Math.round(days * 15) // ~15 laughs/day
    };
  }, [ageData]);

  // Upcoming Birthday Weekdays for next 8 years
  const upcomingBirthdays = useMemo(() => {
    if (!dob) return [];
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return [];

    const currentYear = now.getFullYear();
    const list: Array<{ year: number; weekday: string; ageTurning: number }> = [];
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let y = currentYear; y <= currentYear + 7; y++) {
      const bDate = new Date(y, birth.getMonth(), birth.getDate());
      list.push({
        year: y,
        weekday: weekdays[bDate.getDay()],
        ageTurning: y - birth.getFullYear()
      });
    }
    return list;
  }, [dob, now]);

  // Major Life Milestones
  const milestones = useMemo(() => {
    if (!dob) return [];
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return [];

    const calculateDateByDays = (days: number) => {
      const d = new Date(birth);
      d.setDate(d.getDate() + days);
      return d;
    };

    const calculateDateByYears = (years: number) => {
      const d = new Date(birth);
      d.setFullYear(d.getFullYear() + years);
      return d;
    };

    const targetTime = now.getTime();

    const items = [
      { title: '1,000 Days on Earth', date: calculateDateByDays(1000), totalDays: 1000 },
      { title: '5,000 Days on Earth', date: calculateDateByDays(5000), totalDays: 5000 },
      { title: '10,000 Days on Earth', date: calculateDateByDays(10000), totalDays: 1000 },
      { title: '18th Birthday (Adulthood)', date: calculateDateByYears(18), totalDays: 18 * 365.25 },
      { title: '20,000 Days on Earth', date: calculateDateByDays(20000), totalDays: 20000 },
      { title: '25th Birthday (Quarter Century)', date: calculateDateByYears(25), totalDays: 25 * 365.25 },
      { title: '1 Billion Seconds Alive', date: new Date(birth.getTime() + 1000000000 * 1000), totalDays: 11574 },
      { title: '50th Birthday (Golden Jubilee)', date: calculateDateByYears(50), totalDays: 50 * 365.25 },
      { title: '25,000 Days on Earth', date: calculateDateByDays(25000), totalDays: 25000 },
      { title: '60th Birthday (Diamond)', date: calculateDateByYears(60), totalDays: 60 * 365.25 },
      { title: '100th Birthday (Centenarian)', date: calculateDateByYears(100), totalDays: 100 * 365.25 }
    ];

    return items.map((m) => {
      const passed = m.date.getTime() <= targetTime;
      const daysDiff = Math.abs(Math.round((m.date.getTime() - targetTime) / (1000 * 60 * 60 * 24)));
      return {
        ...m,
        passed,
        formattedDate: m.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        daysDiff
      };
    });
  }, [dob, now]);

  // Planetary Ages (Orbital period ratios relative to Earth)
  const planetaryAges = useMemo(() => {
    if (!ageData) return [];

    const planets = [
      { name: 'Mercury', icon: '☿', orbitalPeriodDays: 87.97, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40' },
      { name: 'Venus', icon: '♀', orbitalPeriodDays: 224.7, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40' },
      { name: 'Earth', icon: '♁', orbitalPeriodDays: 365.25, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
      { name: 'Mars', icon: '♂', orbitalPeriodDays: 686.98, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/40' },
      { name: 'Jupiter', icon: '♃', orbitalPeriodDays: 4332.59, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/40' },
      { name: 'Saturn', icon: '♄', orbitalPeriodDays: 10759.22, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
      { name: 'Uranus', icon: '♅', orbitalPeriodDays: 30685.4, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/40' },
      { name: 'Neptune', icon: '♆', orbitalPeriodDays: 60189.0, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' }
    ];

    return planets.map((p) => {
      const planetAge = (ageData.totalDays / p.orbitalPeriodDays).toFixed(2);
      const nextPlanetBirthdayInEarthDays = Math.round(
        p.orbitalPeriodDays - (ageData.totalDays % p.orbitalPeriodDays)
      );
      return {
        ...p,
        planetAge,
        nextPlanetBirthdayInEarthDays
      };
    });
  }, [ageData]);

  // Comparison between two people
  const comparisonData = useMemo(() => {
    const d1 = new Date(person1Dob);
    const d2 = new Date(person2Dob);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const older = d1 < d2 ? { name: person1Name, dob: d1 } : { name: person2Name, dob: d2 };
    const younger = d1 < d2 ? { name: person2Name, dob: d2 } : { name: person1Name, dob: d1 };

    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);

    let years = younger.dob.getFullYear() - older.dob.getFullYear();
    let months = younger.dob.getMonth() - older.dob.getMonth();
    let days = younger.dob.getDate() - older.dob.getDate();

    if (days < 0) {
      months -= 1;
      const prevM = new Date(younger.dob.getFullYear(), younger.dob.getMonth(), 0);
      days += prevM.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Double age point: when older is exactly 2x younger
    // If older born at T0, younger at T1, difference is D = T1 - T0.
    // When younger is age A, older is A + D.
    // Condition: A + D = 2A => A = D.
    // So younger is age D at date T1 + D.
    const doubleAgeDate = new Date(younger.dob.getTime() + diffMs);
    const hasDoubleAgePassed = doubleAgeDate.getTime() < now.getTime();

    return {
      olderName: older.name,
      youngerName: younger.name,
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      doubleAgeDate: doubleAgeDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      hasDoubleAgePassed
    };
  }, [person1Name, person1Dob, person2Name, person2Dob, now]);

  // Copy Summary Handler
  const handleCopySummary = (type: string) => {
    if (!ageData) return;

    let text = '';
    if (type === 'exact') {
      text = `🎂 Age & Astrological Summary (Toolique)
----------------------------------------
Date of Birth : ${dob} (${ageData.dayOfBirth})
Age At Date   : ${targetDate}
----------------------------------------
Exact Age     : ${ageData.years} Years, ${ageData.months} Months, ${ageData.days} Days
Total Days    : ${ageData.totalDays.toLocaleString()} Days Alive
Total Weeks   : ${ageData.totalWeeks.toLocaleString()} Weeks
Total Hours   : ${ageData.totalHours.toLocaleString()} Hours
Total Seconds : ${ageData.totalSeconds.toLocaleString()} Seconds
Next Birthday : ${ageData.bdayTotalDays} days left (falling on a ${ageData.nextBirthdayWeekday})
----------------------------------------
🕉️ Vedic Jyotish & Numerology:
Vedic Rashi   : ${vedicRashi?.nameHi} / ${vedicRashi?.nameEn}
Rashi Lord    : ${vedicRashi?.lordHi}
Lucky Gemstone: ${vedicRashi?.gemstoneHi}
Moolank / Root: ${vedicNumerology?.moolank} (${vedicNumerology?.moolankLord})
Bhagyank      : ${vedicNumerology?.bhagyank} (${vedicNumerology?.bhagyankLord})
Ishta Dev     : ${vedicRashi?.ishtaDevHi}
Beej Mantra   : ${vedicRashi?.beejMantra}
----------------------------------------
🌐 Western & Chinese:
Western Sign  : ${zodiac?.sign} ${zodiac?.symbol} (${zodiac?.element} element)
Chinese Zodiac: Year of the ${chineseZodiac?.animal}
----------------------------------------
Calculated at: https://toolique.in/tools/age-calculator`;
    } else if (type === 'compare' && comparisonData) {
      text = `👥 Age Difference Report (Toolique)
----------------------------------------
Person 1: ${person1Name} (${person1Dob})
Person 2: ${person2Name} (${person2Dob})
----------------------------------------
Difference : ${comparisonData.years} Years, ${comparisonData.months} Months, ${comparisonData.days} Days
Total Days : ${comparisonData.totalDays.toLocaleString()} Days Gap
Older      : ${comparisonData.olderName} is older than ${comparisonData.youngerName}
2x Milestone: ${comparisonData.olderName} was/will be 2x older on ${comparisonData.doubleAgeDate}
----------------------------------------`;
    }

    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-left">
      {/* Privacy & Engine Assurance Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-teal-50/70 dark:bg-teal-950/25 border border-teal-200/70 dark:border-teal-800/40 rounded-2xl text-xs">
        <div className="flex items-center gap-2.5 text-teal-950 dark:text-teal-200">
          <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            <strong className="font-semibold text-teal-900 dark:text-teal-100">Exact Chronological Precision:</strong> Mathematical leap year and month-length accounting with live second countdown and astronomical metrics.
          </span>
        </div>
        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-medium shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-teal-500" />
          <span>Life Milestones & Planetary Suite</span>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {[
          { id: 'exact', label: 'Exact Age & Countdown', icon: Calendar },
          { id: 'compare', label: 'Age Difference (2 People)', icon: Users },
          { id: 'milestones', label: 'Life Milestones & Timeline', icon: Award },
          { id: 'planets', label: 'Planetary Ages & Bio-Stats', icon: Globe2 },
          { id: 'astrology', label: 'Vedic Astrology & Numerology', icon: Compass }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CalculatorTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXACT AGE & COUNTDOWN */}
      {activeTab === 'exact' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Date Inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-5 relative z-20">
            <div className="saas-card p-6 space-y-5 relative z-30 overflow-visible">
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Select Date of Birth
                </h3>
              </div>

              {/* DOB Picker */}
              <CustomDatePicker
                value={dob}
                onChange={setDob}
                max={now.toISOString().split('T')[0]}
                label="Date of Birth (DOB)"
                badge="Required"
                showDirectSelects
              />

              {/* Optional Birth Time */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">
                    Exact Birth Time <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                </div>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Target Age At Date */}
              <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800 space-y-2">
                <CustomDatePicker
                  value={targetDate}
                  onChange={(newDate) => {
                    setTargetDate(newDate);
                    setUseCurrentTime(newDate === now.toISOString().split('T')[0]);
                  }}
                  label="Calculate Age On Date"
                  badge={targetDate === now.toISOString().split('T')[0] ? 'Today' : 'Custom'}
                  showDirectSelects
                />
              </div>

              {/* Quick Presets */}
              <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Quick Presets</span>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { label: 'Year 2000', d: '2000-01-01' },
                    { label: '18 Yrs Ago', d: `${now.getFullYear() - 18}-01-01` },
                    { label: '25 Yrs Ago', d: `${now.getFullYear() - 25}-01-01` },
                    { label: '30 Yrs Ago', d: `${now.getFullYear() - 30}-01-01` },
                    { label: '50 Yrs Ago', d: `${now.getFullYear() - 50}-01-01` },
                    { label: 'Today', d: now.toISOString().split('T')[0] }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setDob(preset.d)}
                      className="px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Vedic & Astrological Snapshot Widget */}
            {vedicRashi && (
              <div className="saas-card p-5 space-y-3.5 bg-gradient-to-br from-amber-500/5 via-teal-500/5 to-zinc-50 dark:from-amber-950/20 dark:via-teal-950/20 dark:to-zinc-900 border border-teal-200/60 dark:border-teal-800/40 relative z-10">
                <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 pb-2.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Vedic Astrology & Numerology
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    Sidereal System
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750">
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                        Vedic Solar Sign (Rashi)
                      </span>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <span>{vedicRashi.symbol}</span>
                        <span>{vedicRashi.nameEn}</span>
                        <span className="text-xs text-zinc-500 font-normal">({vedicRashi.nameHi})</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">Ruling Planet</span>
                      <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{vedicRashi.lordEn}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 space-y-0.5">
                      <span className="text-[10px] text-zinc-400 block">💎 Lucky Gemstone</span>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-[11px] truncate">
                        {vedicRashi.gemstoneEn}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 space-y-0.5">
                      <span className="text-[10px] text-zinc-400 block">🔢 Root (Moolank)</span>
                      <p className="font-bold text-teal-600 dark:text-teal-400 text-[11px] font-mono">
                        Number {vedicNumerology?.moolank} <span className="text-[10px] text-zinc-400 font-normal">({vedicNumerology?.moolankLord})</span>
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('astrology')}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <span>Explore Full Vedic Astrology & Numerology Suite</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Results & Live Countdown (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {ageData ? (
              <>
                {/* Hero Exact Age Display */}
                <div className="saas-card p-6 bg-gradient-to-br from-zinc-900 via-teal-950 to-zinc-950 text-white shadow-xl space-y-6 border border-teal-800/40">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                    <div>
                      <span className="text-xs font-bold tracking-widest text-teal-400 uppercase">
                        Exact Chronological Age
                      </span>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Born on a <strong className="text-zinc-200">{ageData.dayOfBirth}</strong> ({dob})
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopySummary('exact')}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5 transition cursor-pointer border border-zinc-700"
                    >
                      {copiedKey === 'exact' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'exact' ? 'Copied!' : 'Copy Summary'}</span>
                    </button>
                  </div>

                  {/* Big Number Counters */}
                  <div className="grid grid-cols-3 gap-3 text-center py-2">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-3xl sm:text-5xl font-black text-teal-400 font-mono">
                        {ageData.years}
                      </span>
                      <span className="block text-[11px] font-bold text-zinc-300 mt-1 uppercase tracking-wider">
                        Years
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-3xl sm:text-5xl font-black text-indigo-300 font-mono">
                        {ageData.months}
                      </span>
                      <span className="block text-[11px] font-bold text-zinc-300 mt-1 uppercase tracking-wider">
                        Months
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                      <span className="text-3xl sm:text-5xl font-black text-amber-300 font-mono">
                        {ageData.days}
                      </span>
                      <span className="block text-[11px] font-bold text-zinc-300 mt-1 uppercase tracking-wider">
                        Days
                      </span>
                    </div>
                  </div>

                  {/* Live Clock Strip */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      Live Time Alive:
                    </span>
                    <span className="font-bold text-white">
                      {ageData.hours}h : {ageData.minutes}m : {ageData.seconds}s
                    </span>
                  </div>
                </div>

                {/* Next Birthday Card & Live Countdown */}
                <div className="saas-card p-5 space-y-4 border-rose-200 dark:border-rose-900/40 bg-gradient-to-r from-rose-50/40 to-amber-50/20 dark:from-rose-950/20 dark:to-amber-950/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          Next Birthday Countdown
                        </h4>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                          {ageData.isBirthdayToday ? (
                            <span className="text-rose-600 dark:text-rose-400 font-black animate-pulse">
                              🎉 Happy Birthday! Turning {ageData.years} today! 🎂
                            </span>
                          ) : (
                            `Turning ${ageData.years + 1} on a ${ageData.nextBirthdayWeekday}`
                          )}
                        </p>
                      </div>
                    </div>

                    {!ageData.isBirthdayToday && (
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                        {ageData.bdayTotalDays} Days Left
                      </span>
                    )}
                  </div>

                  {!ageData.isBirthdayToday && (
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750">
                        <span className="text-base font-bold text-zinc-900 dark:text-white font-mono block">
                          {ageData.nextBirthdayMonths}
                        </span>
                        <span className="text-[10px] text-zinc-500">Months</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750">
                        <span className="text-base font-bold text-zinc-900 dark:text-white font-mono block">
                          {ageData.nextBirthdayDays}
                        </span>
                        <span className="text-[10px] text-zinc-500">Days</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750">
                        <span className="text-base font-bold text-zinc-900 dark:text-white font-mono block">
                          {ageData.bdayHours}
                        </span>
                        <span className="text-[10px] text-zinc-500">Hours</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750">
                        <span className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono block">
                          {ageData.bdaySecs}
                        </span>
                        <span className="text-[10px] text-zinc-500">Seconds</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cumulative Time Metric Units Grid */}
                <div className="saas-card p-5 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Hourglass className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Equivalent Total Life Units
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                      <span className="text-[11px] text-zinc-400 font-medium">Total Months</span>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                        {ageData.totalMonths.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                      <span className="text-[11px] text-zinc-400 font-medium">Total Weeks</span>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                        {ageData.totalWeeks.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                      <span className="text-[11px] text-zinc-400 font-medium">Total Days</span>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                        {ageData.totalDays.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                      <span className="text-[11px] text-zinc-400 font-medium">Total Hours</span>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                        {ageData.totalHours.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                      <span className="text-[11px] text-zinc-400 font-medium">Total Minutes</span>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                        {ageData.totalMinutes.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-0.5">
                      <span className="text-[11px] text-zinc-400 font-medium">Total Seconds</span>
                      <p className="text-sm font-bold text-teal-600 dark:text-teal-400 font-mono">
                        {ageData.totalSeconds.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="saas-card p-12 text-center text-zinc-400 space-y-2">
                <Calendar className="w-10 h-10 mx-auto text-zinc-500" />
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Invalid Date Selection</p>
                <p className="text-xs text-zinc-500">
                  Please ensure your Date of Birth is on or before the target calculation date.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AGE DIFFERENCE & COMPARISON */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
            {/* Person 1 Input */}
            <div className="saas-card p-5 space-y-4 relative z-30 overflow-visible">
              <h3 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                First Person
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Name / Label</label>
                <input
                  type="text"
                  value={person1Name}
                  onChange={(e) => setPerson1Name(e.target.value)}
                  placeholder="e.g. Alice"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <CustomDatePicker
                value={person1Dob}
                onChange={setPerson1Dob}
                max={now.toISOString().split('T')[0]}
                label="Date of Birth"
                showDirectSelects
              />
            </div>

            {/* Person 2 Input */}
            <div className="saas-card p-5 space-y-4 relative z-20 overflow-visible">
              <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Second Person
              </h3>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Name / Label</label>
                <input
                  type="text"
                  value={person2Name}
                  onChange={(e) => setPerson2Name(e.target.value)}
                  placeholder="e.g. Bob"
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <CustomDatePicker
                value={person2Dob}
                onChange={setPerson2Dob}
                max={now.toISOString().split('T')[0]}
                label="Date of Birth"
                showDirectSelects
              />
            </div>
          </div>

          {/* Comparison Output Report */}
          {comparisonData && (
            <div className="saas-card p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-150 dark:border-zinc-800 pb-4">
                <div>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    Age Gap Analysis
                  </span>
                  <p className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                    <strong>{comparisonData.olderName}</strong> is older than <strong>{comparisonData.youngerName}</strong>
                  </p>
                </div>

                <button
                  onClick={() => handleCopySummary('compare')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey === 'compare' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'compare' ? 'Copied!' : 'Copy Gap Report'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60">
                  <span className="text-2xl sm:text-4xl font-black text-teal-600 dark:text-teal-400 font-mono">
                    {comparisonData.years}
                  </span>
                  <span className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-1 uppercase">
                    Years
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60">
                  <span className="text-2xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                    {comparisonData.months}
                  </span>
                  <span className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-1 uppercase">
                    Months
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60">
                  <span className="text-2xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    {comparisonData.days}
                  </span>
                  <span className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-1 uppercase">
                    Days
                  </span>
                </div>
              </div>

              {/* Total Days Gap & 2x Age Milestone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-400 font-semibold block">Total Days Difference</span>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                    {comparisonData.totalDays.toLocaleString()} Days ({comparisonData.totalWeeks.toLocaleString()} weeks)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-zinc-400 font-semibold block">Double-Age (2x) Milestone Date</span>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white font-mono">
                    {comparisonData.doubleAgeDate}
                  </p>
                  <span className="text-[10px] text-zinc-500 block">
                    {comparisonData.hasDoubleAgePassed ? '(Milestone already passed)' : '(Future milestone)'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LIFE MILESTONES & BIRTHDAYS */}
      {activeTab === 'milestones' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Major Milestones Timeline (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="saas-card p-6 space-y-4">
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Key Life Milestones Tracker
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Track when you hit significant day and decade milestones on Earth.
                </p>
              </div>

              <div className="space-y-2.5">
                {milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                      m.passed
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40'
                        : 'bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          m.passed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {m.passed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${m.passed ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                          {m.title}
                        </p>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {m.formattedDate}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        m.passed
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {m.passed ? 'Completed' : `In ${m.daysDiff} days`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Birthday Days of the Week (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="saas-card p-6 space-y-4">
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-rose-500" />
                  Upcoming Birthday Schedule
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Day of the week for your next 8 birthdays.
                </p>
              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
                {upcomingBirthdays.map((b) => (
                  <div
                    key={b.year}
                    className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-850/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-zinc-900 dark:text-white">{b.year}</span>
                      <span className="text-[11px] text-zinc-400 font-medium">(Turning {b.ageTurning})</span>
                    </div>
                    <span className="font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md">
                      {b.weekday}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PLANETARY AGES & BIO STATS */}
      {activeTab === 'planets' && (
        <div className="space-y-6">
          {/* Bio Statistics Overview */}
          {bioStats && (
            <div className="saas-card p-6 space-y-4">
              <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Estimated Biological Milestones
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Approximate physiological activities performed throughout your life so far.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 space-y-1">
                  <span className="text-rose-600 dark:text-rose-400 font-semibold block text-[11px]">Heartbeats</span>
                  <p className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                    ~{(bioStats.heartbeats / 1000000).toFixed(1)}M
                  </p>
                  <span className="text-[10px] text-zinc-400 block font-mono">({bioStats.heartbeats.toLocaleString()})</span>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-800/40 space-y-1">
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold block text-[11px]">Breaths Taken</span>
                  <p className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                    ~{(bioStats.breaths / 1000000).toFixed(1)}M
                  </p>
                  <span className="text-[10px] text-zinc-400 block font-mono">({bioStats.breaths.toLocaleString()})</span>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 space-y-1">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold block text-[11px]">Hours Slept</span>
                  <p className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                    {bioStats.sleepHours.toLocaleString()} hrs
                  </p>
                  <span className="text-[10px] text-zinc-400 block font-mono">(~{(bioStats.sleepHours / 24 / 365.25).toFixed(1)} years)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 space-y-1">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold block text-[11px]">Meals Eaten</span>
                  <p className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                    {bioStats.meals.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-zinc-400 block">Avg 3 meals/day</span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold block text-[11px]">Times Laughed</span>
                  <p className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                    ~{bioStats.laughter.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-zinc-400 block">Avg 15 laughs/day</span>
                </div>
              </div>
            </div>
          )}

          {/* Planetary Ages in our Solar System */}
          <div className="saas-card p-6 space-y-4">
            <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Your Age on Other Planets
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Because each planet takes a different duration to orbit the Sun, your age changes dramatically across the solar system!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {planetaryAges.map((p) => (
                <div
                  key={p.name}
                  className={`p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 ${p.bg} space-y-2`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <span className="text-base">{p.icon}</span>
                      {p.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {p.orbitalPeriodDays}d orbit
                    </span>
                  </div>

                  <div>
                    <span className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                      {p.planetAge}
                    </span>
                    <span className="text-[11px] text-zinc-500 block">
                      {p.name} Years Old
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-700/50 text-[11px] text-zinc-500">
                    Next {p.name} Birthday in: <strong className="text-zinc-700 dark:text-zinc-300 font-mono">{p.nextPlanetBirthdayInEarthDays}</strong> Earth days
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VEDIC ASTROLOGY & NUMEROLOGY */}
      {activeTab === 'astrology' && vedicRashi && (
        <div className="space-y-6">
          {/* Header Banner & Sub-Navigation Bar */}
          <div className="saas-card p-6 bg-gradient-to-br from-amber-500/10 via-teal-500/5 to-zinc-50 dark:from-zinc-900 dark:via-teal-950/20 dark:to-zinc-900 border-teal-200/60 dark:border-teal-800/40 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-600 text-white shadow-xs">
                    Vedic Sidereal Jyotish (Nirayana)
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    Calculated for <strong className="text-zinc-900 dark:text-zinc-100">{dob}</strong>
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2.5">
                  <span>{vedicRashi.nameEn}</span>
                  <span className="text-base text-zinc-500 font-semibold font-serif">({vedicRashi.nameHi})</span>
                  <span className="text-2xl">{vedicRashi.symbol}</span>
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Solar Sidereal Dates: <strong className="text-zinc-800 dark:text-zinc-200">{vedicRashi.dates}</strong> • Western Tropical Equivalent: <strong className="text-zinc-800 dark:text-zinc-200">{vedicRashi.westernEquivalent}</strong>
                </p>
              </div>

              {/* Sub-Tabs: Vedic / Numerology / Western */}
              <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/90 rounded-2xl border border-zinc-200 dark:border-zinc-750 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setAstroTab('vedic')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    astroTab === 'vedic'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <span>🕉️</span>
                  <span>Vedic Jyotish & Grahas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAstroTab('numerology')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    astroTab === 'numerology'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <span>🔢</span>
                  <span>Vedic Numerology</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAstroTab('western')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    astroTab === 'western'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <span>🌐</span>
                  <span>Western & Chinese Zodiac</span>
                </button>
              </div>
            </div>

            {/* Quick 4-Pill Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Ruling Planet</span>
                <p className="font-bold text-teal-600 dark:text-teal-400 text-xs sm:text-sm mt-0.5">
                  {vedicRashi.lordEn}
                </p>
                <span className="text-[10px] text-zinc-500">({vedicRashi.lordHi})</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Vedic Element</span>
                <p className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm mt-0.5">
                  {vedicRashi.elementEn}
                </p>
                <span className="text-[10px] text-zinc-500">({vedicRashi.elementHi})</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Cosmic Quality (Guna)</span>
                <p className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm mt-0.5 truncate">
                  {vedicRashi.guna}
                </p>
                <span className="text-[10px] text-zinc-500">Innate behavioral drive</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Mobility / Nature</span>
                <p className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm mt-0.5 truncate">
                  {vedicRashi.nature}
                </p>
                <span className="text-[10px] text-zinc-500">Parashari Rashi Type</span>
              </div>
            </div>
          </div>

          {/* SUB-VIEW 1: VEDIC JYOTISH & PLANETARY POWERS */}
          {astroTab === 'vedic' && (
            <div className="space-y-6">
              {/* 8-Card English Attribute Grid */}
              <div className="saas-card p-6 space-y-4">
                <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Essential Vedic Astrological Attributes & Remedies
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Traditional Indian Jyotish classifications for planetary harmony, prosperity, and personal alignment.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                  {/* Graha Lord */}
                  <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">🪐 Ruling Graha Lord</span>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {vedicRashi.lordEn}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Sanskrit: <strong className="text-zinc-700 dark:text-zinc-300">{vedicRashi.lordHi}</strong>
                    </p>
                  </div>

                  {/* Element */}
                  <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">🌪️ Elemental Tattva</span>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {vedicRashi.elementEn}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Sanskrit: <strong className="text-zinc-700 dark:text-zinc-300">{vedicRashi.elementHi}</strong>
                    </p>
                  </div>

                  {/* Lucky Gemstone */}
                  <div className="p-3.5 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/50 space-y-1">
                    <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">💎 Auspicious Gemstone (Ratna)</span>
                    <p className="font-bold text-teal-700 dark:text-teal-300 text-sm">
                      {vedicRashi.gemstoneEn}
                    </p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-tight">
                      {vedicRashi.gemstoneBenefits}
                    </p>
                  </div>

                  {/* Lucky Weekday */}
                  <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">📅 Auspicious Day of Week</span>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {vedicRashi.luckyDayEn}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Best day for new initiatives & investments
                    </p>
                  </div>

                  {/* Lucky Colors */}
                  <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">🎨 Auspicious Colors</span>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {vedicRashi.luckyColors}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Harmonizes planetary frequency
                    </p>
                  </div>

                  {/* Lucky Numbers */}
                  <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">🔢 Fortunate Numbers</span>
                    <p className="font-bold text-teal-600 dark:text-teal-400 text-sm font-mono">
                      {vedicRashi.luckyNumbers}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Auspicious vibrational resonances
                    </p>
                  </div>

                  {/* Presiding Deity */}
                  <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">🛕 Presiding Deity (Ishta Dev)</span>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                      {vedicRashi.ishtaDevEn}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Sanskrit: <strong className="text-zinc-700 dark:text-zinc-300">{vedicRashi.ishtaDevHi}</strong>
                    </p>
                  </div>

                  {/* Auspicious Naming Letters */}
                  <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">✍️ Naming Letters (Namakshar)</span>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm truncate">
                      {vedicRashi.namakshar}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Auspicious initials for names & brands
                    </p>
                  </div>
                </div>
              </div>

              {/* Graha Beej Mantra Portal */}
              <div className="saas-card p-6 bg-gradient-to-r from-teal-500/5 via-amber-500/5 to-zinc-50 dark:from-zinc-900 dark:to-zinc-850 border-teal-200/80 dark:border-teal-800/50 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Planetary Beej Mantra (ग्रह बीज मंत्र)
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Sacred primordial sound vibration dedicated to {vedicRashi.lordEn} for mental clarity, peace, and spiritual shielding.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(vedicRashi.beejMantra);
                      setCopiedMantra(true);
                      setTimeout(() => setCopiedMantra(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    {copiedMantra ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMantra ? 'Mantra Copied!' : 'Copy Beej Mantra'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-teal-200/60 dark:border-teal-800/40 space-y-2.5">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block">
                    Original Devanagari Sanskrit Mantra:
                  </span>
                  <p className="text-base sm:text-lg font-bold font-serif text-teal-950 dark:text-teal-100 bg-teal-50/60 dark:bg-teal-950/40 p-3 rounded-xl border border-teal-100 dark:border-teal-900 tracking-wide">
                    {vedicRashi.beejMantra}
                  </p>

                  <div className="space-y-1.5 pt-1 text-xs">
                    <p className="text-zinc-700 dark:text-zinc-300">
                      <strong className="text-zinc-900 dark:text-white font-semibold">Phonetic English Pronunciation:</strong>{' '}
                      <span className="italic font-mono text-teal-700 dark:text-teal-300">"{vedicRashi.beejMantraTransliteration}"</span>
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400">
                      <strong className="text-zinc-900 dark:text-white font-semibold">Spiritual Meaning & Benefits:</strong>{' '}
                      {vedicRashi.beejMantraMeaning}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-amber-500/10 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-300/40 dark:border-amber-700/30">
                  <span className="text-base">📿</span>
                  <span>
                    <strong className="text-zinc-800 dark:text-zinc-200">Vedic Chanting Recommendation:</strong> Best chanted 108 times at sunrise facing East using a Rudraksha or Lotus seed mala for maximum auspicious protection.
                  </span>
                </div>
              </div>

              {/* Vedic Psychology & Career Pathways Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Traits Card */}
                <div className="saas-card p-6 space-y-3">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-3">
                    <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Vedic Psychology & Innate Character
                  </h4>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {vedicRashi.coreTraits}
                  </p>
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500">
                    Grounded in classic Parashara Hora Shastra principles of solar constitution.
                  </div>
                </div>

                {/* Career Paths Card */}
                <div className="saas-card p-6 space-y-3">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-3">
                    <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    High-Affinity Career & Leadership Pathways
                  </h4>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {vedicRashi.careerPaths}
                  </p>
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500">
                    Fields that naturally resonate with {vedicRashi.lordEn} energies.
                  </div>
                </div>
              </div>

              {/* Vedic Weekday Blessing */}
              {vedicWeekday && (
                <div className="saas-card p-5 bg-gradient-to-r from-amber-500/5 to-teal-500/5 border border-amber-200/70 dark:border-amber-800/40 flex flex-wrap sm:flex-nowrap items-center gap-4">
                  <div className="p-3 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-2xl shrink-0 text-2xl flex items-center justify-center">
                    🔱
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                        Vedic Birth Weekday Lord (वार अधिपति)
                      </span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-white">
                        {vedicWeekday.dayNameEn} ({vedicWeekday.dayNameHi})
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">
                      Governing Deity: <strong className="text-zinc-900 dark:text-white">{vedicWeekday.grahaLord}</strong> — {vedicWeekday.significance}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 2: VEDIC NUMEROLOGY (SANKHYA SHASTRA) */}
          {astroTab === 'numerology' && vedicNumerology && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Moolank Card */}
                <div className="saas-card p-6 space-y-4 border-teal-200/80 dark:border-teal-800/50 bg-gradient-to-br from-teal-500/5 to-white dark:to-zinc-900">
                  <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                        मूलांक (Moolank / Root Number)
                      </span>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                        Inner Personality & Soul Drive
                      </h4>
                    </div>
                    <span className="text-4xl font-black font-mono text-teal-600 dark:text-teal-400">
                      {vedicNumerology.moolank}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 flex items-center justify-between">
                      <span className="text-zinc-400 font-medium">Ruling Planet (स्वामी ग्रह):</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{vedicNumerology.moolankLord}</span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1">
                      {vedicNumerology.moolankMeaning}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800 text-[11px] text-zinc-500">
                    Calculated solely from the day of your birth ({new Date(dob).getDate()}). Represents your instinctive character, self-image, and innate talents.
                  </div>
                </div>

                {/* Bhagyank Card */}
                <div className="saas-card p-6 space-y-4 border-indigo-200/80 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-500/5 to-white dark:to-zinc-900">
                  <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                        भाग्यांक (Bhagyank / Destiny Number)
                      </span>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                        Life Path, Karma & Career Culmination
                      </h4>
                    </div>
                    <span className="text-4xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                      {vedicNumerology.bhagyank}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 flex items-center justify-between">
                      <span className="text-zinc-400 font-medium">Destiny Planet (भाग्य स्वामी):</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{vedicNumerology.bhagyankLord}</span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1">
                      {vedicNumerology.bhagyankMeaning}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-150 dark:border-zinc-800 text-[11px] text-zinc-500">
                    Calculated from the full sum of Day + Month + Year reduced to a single digit (1-9). Represents your ultimate life mission, karmic opportunities, and vocational destiny.
                  </div>
                </div>
              </div>

              {/* Numerology Harmony & Compatibility Bar */}
              <div className="saas-card p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Compatible Harmonic Vibration Numbers (शुभ मित्र अंक)</span>
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Numbers that naturally harmonize with your Moolank ({vedicNumerology.moolank}) for partnerships, marriage, and enterprise.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-mono font-black text-base">
                    {vedicNumerology.compatibleNumbers}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: WESTERN & CHINESE COMPARATIVE */}
          {astroTab === 'western' && zodiac && chineseZodiac && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Western Tropical Zodiac */}
                <div className="saas-card p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                        Western Tropical Astrology
                      </span>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        <span>{zodiac.symbol}</span>
                        <span>{zodiac.sign}</span>
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {zodiac.element} Element
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 flex items-center justify-between">
                      <span className="text-zinc-400">Tropical Solar Range:</span>
                      <span className="font-bold text-zinc-900 dark:text-white font-mono">{zodiac.dates}</span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1">
                      {zodiac.trait}
                    </p>
                  </div>
                </div>

                {/* Chinese Lunar Zodiac */}
                <div className="saas-card p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                        Chinese Lunar Zodiac (Shengxiao)
                      </span>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                        Year of the {chineseZodiac.animal}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {chineseZodiac.element} Element
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 flex items-center justify-between">
                      <span className="text-zinc-400">Lunar Lucky Numbers:</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">{chineseZodiac.luckyNumbers}</span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1">
                      In the Chinese lunar calendar, the 12-year animal cycle governs cosmic luck, personal temperament, and cyclical fortune.
                    </p>
                  </div>
                </div>
              </div>

              {/* Explainer: Sidereal vs Tropical */}
              <div className="saas-card p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2 text-sm">
                  <span>💡</span>
                  <span>Why does Vedic Rashi differ from Western Sun Sign?</span>
                </h4>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  <strong>Vedic Astrology (Nirayana Sidereal System)</strong> measures planetary positions relative to the actual, observable fixed constellations in the sky, accounting for the ~24-degree astronomical precession of the Earth's axis (Ayanamsha). <strong>Western Astrology (Sayana Tropical System)</strong> fixes the start of Aries to the vernal equinox regardless of stellar drift. Both systems provide profound, complementary insights into human potential.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
