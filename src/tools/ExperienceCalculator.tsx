import { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, Copy, Check } from 'lucide-react';

interface JobPeriod {
  id: string;
  companyName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export default function ExperienceCalculator() {
  const [jobs, setJobs] = useState<JobPeriod[]>([
    {
      id: '1',
      companyName: 'Company 1',
      startDate: '2020-01-01',
      endDate: '2023-06-30',
      isCurrent: false,
    },
  ]);
  const [copied, setCopied] = useState<boolean>(false);
  
  const [totalExperience, setTotalExperience] = useState({
    years: 0,
    months: 0,
    days: 0,
  });

  const [jobDurations, setJobDurations] = useState<Record<string, { years: number; months: number; days: number }>>({});

  const addJob = () => {
    const newId = (jobs.length + 1).toString();
    setJobs([
      ...jobs,
      {
        id: newId,
        companyName: `Company ${newId}`,
        startDate: '',
        endDate: '',
        isCurrent: false,
      },
    ]);
  };

  const removeJob = (id: string) => {
    if (jobs.length === 1) return;
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const updateJob = (id: string, field: keyof JobPeriod, value: any) => {
    setJobs(
      jobs.map((j) => {
        if (j.id === id) {
          const updated = { ...j, [field]: value };
          if (field === 'isCurrent' && value === true) {
            updated.endDate = new Date().toISOString().split('T')[0];
          }
          return updated;
        }
        return j;
      })
    );
  };

  const calculatePeriodDiff = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return { years: 0, months: 0, days: 0 };
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return { years: 0, months: 0, days: 0 };
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return { years, months, days };
  };

  useEffect(() => {
    const durations: Record<string, { years: number; months: number; days: number }> = {};
    let totalDays = 0;
    let totalMonths = 0;
    let totalYears = 0;

    jobs.forEach((job) => {
      const end = job.isCurrent ? new Date().toISOString().split('T')[0] : job.endDate;
      const diff = calculatePeriodDiff(job.startDate, end);
      durations[job.id] = diff;

      totalDays += diff.days;
      totalMonths += diff.months;
      totalYears += diff.years;
    });

    // Normalize totals (30 days = 1 month, 12 months = 1 year approx)
    if (totalDays >= 30) {
      totalMonths += Math.floor(totalDays / 30);
      totalDays = totalDays % 30;
    }

    if (totalMonths >= 12) {
      totalYears += Math.floor(totalMonths / 12);
      totalMonths = totalMonths % 12;
    }

    setJobDurations(durations);
    setTotalExperience({
      years: totalYears,
      months: totalMonths,
      days: totalDays,
    });
  }, [jobs]);

  const copyReport = () => {
    let text = `Work Experience Summary (Toolique)\n`;
    text += `----------------------------------------\n`;
    jobs.forEach((job) => {
      const endText = job.isCurrent ? 'Present' : job.endDate;
      const diff = jobDurations[job.id] || { years: 0, months: 0, days: 0 };
      text += `${job.companyName}: ${job.startDate} to ${endText} (${diff.years}y ${diff.months}m ${diff.days}d)\n`;
    });
    text += `----------------------------------------\n`;
    text += `TOTAL EXPERIENCE: ${totalExperience.years} Years, ${totalExperience.months} Months, ${totalExperience.days} Days\n`;
    text += `----------------------------------------`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input panel */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Employment Periods</h3>
          <button
            onClick={addJob}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Job</span>
          </button>
        </div>

        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4"
          >
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={job.companyName}
                onChange={(e) => updateJob(job.id, 'companyName', e.target.value)}
                className="text-base font-bold text-slate-800 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-teal-500 focus:outline-none pb-0.5"
                placeholder="Company / Employer Name"
              />
              {jobs.length > 1 && (
                <button
                  onClick={() => removeJob(job.id)}
                  className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition"
                  title="Remove period"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={job.startDate}
                  onChange={(e) => updateJob(job.id, 'startDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-white"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Relieving Date
                  </label>
                  <label className="flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={job.isCurrent}
                      onChange={(e) => updateJob(job.id, 'isCurrent', e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3 h-3"
                    />
                    <span>Active Job</span>
                  </label>
                </div>
                <input
                  type="date"
                  value={job.endDate}
                  disabled={job.isCurrent}
                  onChange={(e) => updateJob(job.id, 'endDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-800 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Individual job result label */}
            {jobDurations[job.id] && (job.startDate && (job.isCurrent || job.endDate)) && (
              <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 pt-1 flex items-center gap-1">
                <span>Duration:</span>
                <span>
                  {jobDurations[job.id].years}y, {jobDurations[job.id].months}m, {jobDurations[job.id].days}d
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Aggregate result panel */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl h-fit">
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Cumulative Experience</span>
              <h3 className="text-xl font-bold text-slate-200 mt-1">Aggregated Value</h3>
            </div>
            <button
              onClick={copyReport}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </button>
          </div>

          <div className="space-y-5 py-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800/40">
              <span className="text-sm text-slate-400 font-semibold">Years</span>
              <span className="text-3xl font-black text-white">{totalExperience.years}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800/40">
              <span className="text-sm text-slate-400 font-semibold">Months</span>
              <span className="text-3xl font-black text-teal-400">{totalExperience.months}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800/40">
              <span className="text-sm text-slate-400 font-semibold">Days</span>
              <span className="text-3xl font-black text-indigo-400">{totalExperience.days}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-indigo-600 p-5 rounded-2xl mt-8 flex justify-between items-center shadow-lg shadow-teal-500/10">
          <div>
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">Total Work Experience</span>
            <div className="text-2xl font-black text-white mt-0.5">
              {totalExperience.years} Yrs, {totalExperience.months} Mos
            </div>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

