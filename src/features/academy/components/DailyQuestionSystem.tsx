import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, ChevronRight, Calendar, ArrowLeft, ArrowRight, Flame } from 'lucide-react';
import { getDailyQuestions } from '../utils/dailyQuestionGenerator';
import type { Question } from '../types';

export default function DailyQuestionSystem({
  categoryId,
  staticQuestions,
  progress,
  onXpEarned
}: {
  categoryId: string;
  staticQuestions: Question[];
  progress: any;
  onXpEarned: (xp: number) => void;
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dailyQuestions, setDailyQuestions] = useState<Question[]>([]);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);

  // Load questions for the selected date
  useEffect(() => {
    const list = getDailyQuestions(categoryId, selectedDate, staticQuestions);
    setDailyQuestions(list);

    // Load claimed rewards from localStorage
    try {
      const savedClaims = localStorage.getItem(`toolique_claimed_daily_rewards_${categoryId}`);
      if (savedClaims) setClaimedRewards(JSON.parse(savedClaims));
      else setClaimedRewards([]);
    } catch (e) {}
  }, [categoryId, selectedDate, staticQuestions]);

  // Check solved count for each difficulty
  const getSolvedCount = (diff: string) => {
    const pool = dailyQuestions.filter(q => q.difficulty === diff);
    return pool.filter(q => progress.completedQuestions.includes(q.id)).length;
  };

  const getOverallSolvedCount = () => {
    return dailyQuestions.filter(q => progress.completedQuestions.includes(q.id)).length;
  };

  const isRewardClaimed = (tier: string) => {
    return claimedRewards.includes(`${selectedDate}-${tier}`);
  };

  const claimReward = (tier: string, xp: number) => {
    const claimKey = `${selectedDate}-${tier}`;
    if (claimedRewards.includes(claimKey)) return;

    onXpEarned(xp);

    const updated = [...claimedRewards, claimKey];
    setClaimedRewards(updated);
    localStorage.setItem(`toolique_claimed_daily_rewards_${categoryId}`, JSON.stringify(updated));

    // Also trigger daily streak if all 15 are completed
    if (tier === 'all') {
      try {
        const chestSaved = localStorage.getItem('toolique_daily_chests') || '[]';
        const chests = JSON.parse(chestSaved);
        const updatedChests = chests.map((c: any) => {
          if (c.category === categoryId) {
            // Chest is ready to open now! We clear lastOpened today block to allow opening once
            return { ...c, lastOpened: '' };
          }
          return c;
        });
        localStorage.setItem('toolique_daily_chests', JSON.stringify(updatedChests));
      } catch (e) {}
    }
  };

  // Date controls
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const nextStr = d.toISOString().split('T')[0];
    if (nextStr <= todayStr) {
      setSelectedDate(nextStr);
    }
  };

  const difficulties = [
    { id: 'beginner', name: 'Beginner', xp: 50 },
    { id: 'intermediate', name: 'Intermediate', xp: 75 },
    { id: 'advanced', name: 'Advanced', xp: 100 },
    { id: 'expert', name: 'Expert', xp: 150 },
    { id: 'interview', name: 'Interview', xp: 200 }
  ];

  const overallSolved = getOverallSolvedCount();
  const overallPercentage = Math.round((overallSolved / 15) * 100);

  // SVG Progress Ring calculations
  const radius = 40;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  const isYesterdayMissed = getOverallSolvedCount() === 0;

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* Header date navigator bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80">
        <button
          onClick={handlePrevDay}
          className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer text-zinc-600 dark:text-zinc-400"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 font-black text-sm text-zinc-900 dark:text-white">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>{selectedDate === todayStr ? 'Today\'s Challenges' : selectedDate}</span>
        </div>
        <button
          onClick={handleNextDay}
          disabled={selectedDate === todayStr}
          className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer disabled:opacity-30 text-zinc-600 dark:text-zinc-400"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Yesterday missed motivative summary card */}
      {selectedDate === todayStr && isYesterdayMissed && (
        <div className="p-4 rounded-2xl border border-orange-500/20 bg-orange-500/[0.01] flex items-start gap-3 animate-fadeIn">
          <Flame className="w-5 h-5 text-orange-500 fill-current animate-pulse shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-black text-zinc-905 dark:text-white">Yesterday's Summary: Missed Practice Day</h4>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-normal font-semibold mt-0.5">
              You didn't complete any challenges yesterday. Solve today's daily sets to rebuild your practice streak!
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Progress stats & rewards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card p-6 flex items-center justify-between border border-zinc-200/80 dark:border-zinc-850/80">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white">Completion Progress</h3>
              <p className="text-xs text-zinc-400 font-bold">{overallSolved} / 15 Daily Solved</p>
            </div>
            
            {/* SVG Progress Ring */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  stroke="rgba(63, 63, 70, 0.1)"
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx={40}
                  cy={40}
                />
                <circle
                  className="transition-all duration-300"
                  stroke="#6366f1"
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset }}
                  r={normalizedRadius}
                  cx={40}
                  cy={40}
                />
              </svg>
              <span className="absolute text-xs font-black text-zinc-800 dark:text-white">{overallPercentage}%</span>
            </div>
          </div>

          {/* Claims rewards panel */}
          <div className="saas-card p-6 space-y-4 border border-zinc-200/80 dark:border-zinc-850/80">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-505">
              Daily Completion Rewards
            </h3>
            <div className="space-y-3">
              {difficulties.map((diff) => {
                const count = getSolvedCount(diff.id);
                const isReady = count === 3;
                const claimed = isRewardClaimed(diff.id);
                return (
                  <div key={diff.id} className="flex justify-between items-center text-xs font-bold">
                    <span className="text-zinc-650 dark:text-zinc-400">{diff.name} (3/3)</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400">+{diff.xp} XP</span>
                      {claimed ? (
                        <span className="text-[9px] text-emerald-500 font-extrabold uppercase">Claimed</span>
                      ) : (
                        <button
                          onClick={() => claimReward(diff.id, diff.xp)}
                          disabled={!isReady}
                          className="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-650 dark:text-indigo-400 text-[9px] font-black uppercase disabled:opacity-40 transition cursor-pointer"
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* All 15 completed reward */}
              <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-850/60 flex justify-between items-center text-xs font-black text-indigo-600 dark:text-indigo-400">
                <span>Perfect 15/15 Daily Set</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400">+500 XP</span>
                  {isRewardClaimed('all') ? (
                    <span className="text-[9px] text-emerald-500 font-extrabold uppercase">Claimed</span>
                  ) : (
                    <button
                      onClick={() => claimReward('all', 500)}
                      disabled={overallSolved < 15}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase disabled:opacity-40 transition cursor-pointer"
                    >
                      Bonus Pass
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Question lists */}
        <div className="lg:col-span-7 space-y-6">
          {difficulties.map((diff) => {
            const list = dailyQuestions.filter(q => q.difficulty === diff.id);
            return (
              <div key={diff.id} className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 px-2 flex justify-between">
                  <span>{diff.name} Challenges</span>
                  <span>{getSolvedCount(diff.id)} / 3 Solved</span>
                </h4>
                
                <div className="saas-card overflow-hidden divide-y divide-zinc-205 dark:divide-zinc-850/60">
                  {list.map((q) => {
                    const solved = progress.completedQuestions.includes(q.id);
                    return (
                      <Link
                        key={q.id}
                        to={`/academy/${categoryId}/question/${q.slug}`}
                        className="flex items-center justify-between p-4 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 transition group"
                      >
                        <div className="flex items-center gap-3 text-left">
                          {solved ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-700 shrink-0 group-hover:text-indigo-500 transition" />
                          )}
                          <div>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                              {q.title}
                            </span>
                            <p className="text-[9px] text-zinc-400 font-semibold mt-0.5">{q.topic} • {q.tags.join(', ')}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
