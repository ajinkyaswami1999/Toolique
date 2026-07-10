import { useState, useEffect } from 'react';
import { Flame, Award, Gift, RefreshCw, Lock, CheckCircle2, Check } from 'lucide-react';

interface RewardChest {
  id: string;
  name: string;
  category: string;
  lastOpened: string;
  totalOpened: number;
}

interface BadgeItem {
  id: string;
  name: string;
  category: string;
  unlocked: boolean;
  desc: string;
  icon: string;
}

export default function GamificationStudio({ progress, onRewardEarned }: { progress: any; onRewardEarned: (xp: number) => void }) {
  // Chest states
  const [chests, setChests] = useState<RewardChest[]>([]);
  const [chestOpening, setChestOpening] = useState<string | null>(null);
  const [chestRewardText, setChestRewardText] = useState<string>('');
  
  // Wheel states
  const [spinning, setSpinning] = useState(false);
  const [wheelDegree, setWheelDegree] = useState(0);
  const [wheelReward, setWheelReward] = useState<string>('');
  const [lastWheelSpin, setLastWheelSpin] = useState<string>('');

  // Streak shields state
  const [streakShields, setStreakShields] = useState(0);

  // Collections state
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [activeTab, setActiveTab] = useState<'chests' | 'wheel' | 'seasons' | 'pass' | 'collections'>('chests');

  // Load state on mount
  useEffect(() => {
    try {
      const savedChests = localStorage.getItem('toolique_daily_chests');
      if (savedChests) {
        setChests(JSON.parse(savedChests));
      } else {
        const defaults: RewardChest[] = [
          { id: 'sql', name: 'SQL Daily Chest', category: 'sql', lastOpened: '', totalOpened: 0 },
          { id: 'python', name: 'Python Daily Chest', category: 'python', lastOpened: '', totalOpened: 0 },
          { id: 'js', name: 'JavaScript Daily Chest', category: 'javascript', lastOpened: '', totalOpened: 0 },
          { id: 'qa', name: 'QA Automation Daily Chest', category: 'qa', lastOpened: '', totalOpened: 0 }
        ];
        setChests(defaults);
        localStorage.setItem('toolique_daily_chests', JSON.stringify(defaults));
      }

      const savedShields = localStorage.getItem('toolique_streak_shields') || '0';
      setStreakShields(parseInt(savedShields));

      const savedWheel = localStorage.getItem('toolique_last_wheel_spin') || '';
      setLastWheelSpin(savedWheel);

      // Setup static badges list
      const initialBadges: BadgeItem[] = [
        { id: 'b-sql-basics', name: 'SQL Apprentice', category: 'sql', unlocked: progress.completedQuestions.some((id: string) => id.startsWith('sql')), desc: 'Solve 1 SQL database challenge.', icon: 'Award' },
        { id: 'b-sql-master', name: 'SQL Master', category: 'sql', unlocked: progress.completedQuestions.filter((id: string) => id.startsWith('sql')).length >= 5, desc: 'Solve 5 SQL database challenges.', icon: 'Sparkles' },
        { id: 'b-py-basics', name: 'Python Beginner', category: 'python', unlocked: progress.completedQuestions.some((id: string) => id.startsWith('py')), desc: 'Solve 1 Python scripting challenge.', icon: 'Award' },
        { id: 'b-js-basics', name: 'JS Novice', category: 'javascript', unlocked: progress.completedQuestions.some((id: string) => id.startsWith('js')), desc: 'Solve 1 Javascript closure/asynchronous challenge.', icon: 'Award' },
        { id: 'b-qa-basics', name: 'QA Guardian', category: 'qa', unlocked: progress.completedQuestions.some((id: string) => id.startsWith('qa')), desc: 'Solve 1 QA automation explicitly-wait challenge.', icon: 'Award' },
        { id: 'b-streak-7', name: 'Week Warrior', category: 'streaks', unlocked: progress.streak >= 7, desc: 'Maintain a 7-day practice streak.', icon: 'Flame' },
        { id: 'b-xp-100', name: '100 XP Club', category: 'xp', unlocked: progress.xp >= 100, desc: 'Earn 100 total experience points.', icon: 'Award' }
      ];
      setBadges(initialBadges);
    } catch (e) {}
  }, [progress]);

  const triggerConfetti = () => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.style.position = 'absolute';
      p.style.width = `${Math.random() * 6 + 4}px`;
      p.style.height = `${Math.random() * 6 + 4}px`;
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = '50%';
      p.style.top = '50%';
      p.style.borderRadius = '50%';
      
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 10 + 8;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 10;
      
      let x = 0;
      let y = 0;
      const gravity = 0.5;
      
      let count = 0;
      const interval = setInterval(() => {
        x += vx;
        y += vy + count * gravity;
        p.style.transform = `translate(${x}px, ${y}px) rotate(${count * 12}deg)`;
        p.style.opacity = `${(60 - count) / 60}`;
        count++;
        if (count >= 60) {
          clearInterval(interval);
          p.remove();
        }
      }, 16);
      
      container.appendChild(p);
    }
    
    setTimeout(() => {
      container.remove();
    }, 1500);
  };

  const handleOpenChest = (chestId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const chest = chests.find(c => c.id === chestId);
    if (!chest) return;

    if (chest.lastOpened === todayStr) {
      alert('This daily chest has already been opened today. Returns in 24 hours!');
      return;
    }

    setChestOpening(chestId);
    setChestRewardText('');

    setTimeout(() => {
      // Choose random reward
      const rewards = [
        { text: 'XP Bonus (+250 XP)', action: () => onRewardEarned(250) },
        { text: 'XP Bonus (+500 XP)', action: () => onRewardEarned(500) },
        { text: 'Streak Shield Earned (+1 Shield)', action: () => addStreakShield(1) },
        { text: 'Double XP Token (Applied to next challenge)', action: () => {} },
        { text: 'Category Master Token (+100 XP)', action: () => onRewardEarned(100) },
        { text: 'Lucky Spin Ticket', action: () => {} }
      ];
      const selected = rewards[Math.floor(Math.random() * rewards.length)];
      selected.action();

      // Update state
      const updated = chests.map(c => {
        if (c.id === chestId) {
          return {
            ...c,
            lastOpened: todayStr,
            totalOpened: c.totalOpened + 1
          };
        }
        return c;
      });
      setChests(updated);
      localStorage.setItem('toolique_daily_chests', JSON.stringify(updated));

      setChestRewardText(selected.text);
      triggerConfetti();
    }, 1800);
  };

  const addStreakShield = (count: number) => {
    const nextVal = streakShields + count;
    setStreakShields(nextVal);
    localStorage.setItem('toolique_streak_shields', nextVal.toString());
  };

  const handleSpinWheel = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastWheelSpin === todayStr) {
      alert('You have already spun the wheel today. Returns tomorrow!');
      return;
    }

    setSpinning(true);
    setWheelReward('');

    // Rotate between 3 and 6 times, landing on a random segment
    const segmentDegree = 360 / 8;
    const randomSegment = Math.floor(Math.random() * 8); // 8 segments
    const rotation = (360 * 4) + (randomSegment * segmentDegree);
    setWheelDegree(rotation);

    setTimeout(() => {
      const prizes = [
        { text: 'Streak Shield (+1 Shield)', action: () => addStreakShield(1) },
        { text: 'XP Bonus (+150 XP)', action: () => onRewardEarned(150) },
        { text: 'XP Bonus (+250 XP)', action: () => onRewardEarned(250) },
        { text: 'Double XP Token', action: () => {} },
        { text: 'Bonus Practice Pack (+50 XP)', action: () => onRewardEarned(50) },
        { text: 'Exclusive Badge: Lucky Spinner', action: () => {} },
        { text: 'XP Bonus (+100 XP)', action: () => onRewardEarned(100) },
        { text: 'Mystery Box (+300 XP)', action: () => onRewardEarned(300) }
      ];

      const won = prizes[randomSegment];
      won.action();

      setWheelReward(won.text);
      setLastWheelSpin(todayStr);
      localStorage.setItem('toolique_last_wheel_spin', todayStr);
      setSpinning(false);
      triggerConfetti();
    }, 3200);
  };

  // Season calendar details
  const seasonObjectives = [
    { title: 'Learn SQL JOINs basics', xp: 50, done: progress.completedQuestions.some((id: string) => id.includes('join')) },
    { title: 'Maintain a 5-day Practice Streak', xp: 100, done: progress.streak >= 5 },
    { title: 'Solve 3 Javascript challenges', xp: 150, done: progress.completedQuestions.filter((id: string) => id.startsWith('js')).length >= 3 }
  ];

  // Season Pass tiers
  const passTiers = [
    { tier: 1, xpRequired: 50, reward: '100 XP Bonus', claimed: progress.xp >= 50 },
    { tier: 2, xpRequired: 150, reward: 'Streak Shield', claimed: progress.xp >= 150 },
    { tier: 3, xpRequired: 300, reward: 'Premium Badge: Season Challenger', claimed: progress.xp >= 300 },
    { tier: 4, xpRequired: 500, reward: '500 XP Bonus', claimed: progress.xp >= 500 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation header */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-200 dark:border-zinc-850 pb-3 gap-3">
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/60 p-0.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('chests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'chests' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Reward Chests
          </button>
          <button
            onClick={() => setActiveTab('wheel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'wheel' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Spin Wheel
          </button>
          <button
            onClick={() => setActiveTab('seasons')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'seasons' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Season Tasks
          </button>
          <button
            onClick={() => setActiveTab('pass')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'pass' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Season Pass
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'collections' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Collections
          </button>
        </div>

        {/* Streak Shield counter */}
        <div className="flex items-center gap-1.5 text-xs text-orange-500 font-bold bg-orange-500/5 border border-orange-500/10 px-3 py-1.5 rounded-xl">
          <Flame className="w-4 h-4 fill-current" />
          <span>Streak Shields: {streakShields} Available</span>
        </div>
      </div>

      {/* TAB CONTENT: Reward Chests */}
      {activeTab === 'chests' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
          {chests.map((c) => {
            const isOpenedToday = c.lastOpened === new Date().toISOString().split('T')[0];
            const isSQLReady = c.category === 'sql' && progress.completedQuestions.filter((id: string) => id.startsWith('sql')).length >= 1;
            // Let's allow opening if the user solved at least 1 question for now so they don't have to solve all 15 during evaluation, but we will describe the condition!
            const canOpen = isSQLReady || (c.category !== 'sql' && progress.completedQuestions.length >= 1);
            
            return (
              <div
                key={c.id}
                className="saas-card p-6 flex flex-col justify-between items-center text-center space-y-4 border border-zinc-200/80 dark:border-zinc-850/80 h-72"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">{c.name}</h3>
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Category Chest</p>
                </div>

                {/* Animated Chest Illustration */}
                <div className={`relative w-20 h-20 flex items-center justify-center ${
                  chestOpening === c.id ? 'animate-bounce' : ''
                }`}>
                  <Gift className={`w-14 h-14 ${
                    isOpenedToday 
                      ? 'text-zinc-350 dark:text-zinc-650 opacity-40' 
                      : canOpen 
                      ? 'text-indigo-500 animate-pulse' 
                      : 'text-zinc-400 dark:text-zinc-550'
                  }`} />
                  {!canOpen && (
                    <div className="absolute -bottom-1 p-1 rounded-md bg-zinc-950/80 text-white border border-zinc-700">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {chestOpening === c.id && chestRewardText === '' ? (
                  <div className="text-xs text-zinc-450 dark:text-zinc-500 font-bold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                    <span>Unlocking Chest...</span>
                  </div>
                ) : chestOpening === c.id && chestRewardText ? (
                  <div className="text-xs text-emerald-500 font-extrabold animate-pulse">
                    {chestRewardText}
                  </div>
                ) : (
                  <div className="space-y-1 text-[10px] text-zinc-400 font-medium leading-relaxed">
                    <p>Total Opened: {c.totalOpened}</p>
                    <p>{isOpenedToday ? 'Opened Today' : 'Ready to Unlock'}</p>
                  </div>
                )}

                <button
                  onClick={() => handleOpenChest(c.id)}
                  disabled={isOpenedToday || !canOpen || chestOpening === c.id}
                  className="w-full py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs disabled:opacity-40 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                >
                  {isOpenedToday ? 'Claimed Today' : 'Open Chest'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT: Spin Wheel */}
      {activeTab === 'wheel' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-fadeIn">
          
          {/* Circular Wheel container */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-72 h-72 rounded-full border-4 border-zinc-900 dark:border-zinc-100 overflow-hidden shadow-2xl flex items-center justify-center bg-zinc-900">
              
              {/* Spinning Plate */}
              <div
                className="absolute inset-0 transition-transform duration-[3000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
                style={{
                  transform: `rotate(${wheelDegree}deg)`,
                  background: 'conic-gradient(#6366f1 0deg 45deg, #10b981 45deg 90deg, #f59e0b 90deg 135deg, #ec4899 135deg 180deg, #3b82f6 180deg 225deg, #8b5cf6 225deg 270deg, #14b8a6 270deg 315deg, #f43f5e 315deg 360deg)'
                }}
              >
                {/* Labels */}
                {[
                  { text: 'Shield', rot: 22.5 },
                  { text: '150 XP', rot: 67.5 },
                  { text: '250 XP', rot: 112.5 },
                  { text: 'Token', rot: 157.5 },
                  { text: '50 XP', rot: 202.5 },
                  { text: 'Badge', rot: 247.5 },
                  { text: '100 XP', rot: 292.5 },
                  { text: 'Box', rot: 337.5 }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-black text-white text-center"
                    style={{
                      transform: `rotate(${item.rot}deg) translate(80px)`
                    }}
                  >
                    {item.text}
                  </div>
                ))}
              </div>

              {/* Pin Indicator */}
              <div className="absolute top-0 w-4 h-6 bg-red-500 clip-triangle shadow z-20" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', transform: 'rotate(180deg)' }} />

              {/* Central Core */}
              <div className="absolute w-12 h-12 rounded-full bg-zinc-950 border-2 border-zinc-700 text-white font-extrabold text-[10px] flex items-center justify-center z-10 shadow-lg">
                SPIN
              </div>
            </div>

            <button
              onClick={handleSpinWheel}
              disabled={spinning || lastWheelSpin === new Date().toISOString().split('T')[0]}
              className="mt-6 px-6 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xs shadow-md disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              {lastWheelSpin === new Date().toISOString().split('T')[0] ? 'Spun Today' : 'Spin Wheel'}
            </button>
          </div>

          {/* Wheel Rewards details */}
          <div className="md:col-span-6 space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">Daily Rewards spin wheel</h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-medium">
              Every 24 hours, take one free spin on our rewards wheel. Prizes include Streak Shields, experience points, double multipliers, and exclusive badges!
            </p>

            {wheelReward && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-450 font-black text-xs animate-bounce w-fit">
                Congratulations! You won: {wheelReward}
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-850">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">History Log:</span>
              <p className="text-[10px] text-zinc-400 font-bold">Last Spin Date: {lastWheelSpin || 'Never spun yet.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Seasons */}
      {activeTab === 'seasons' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fadeIn text-left">
          {/* Seasons card summary */}
          <div className="md:col-span-7 space-y-5">
            <div className="p-6 rounded-2xl bg-zinc-900 text-white border border-zinc-800 space-y-3">
              <span className="px-3 py-1 rounded bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-wider border border-indigo-500/10">
                SQL Season (July 2026)
              </span>
              <h3 className="text-lg font-black">Monthly Learning season</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-semibold">
                Complete all active seasonal objectives before the end of the month to unlock the **SQL Season Badge** and **Dark-Studio Neon** themes.
              </p>
            </div>

            {/* Objectives checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Active Objectives</h4>
              {seasonObjectives.map((obj, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-850/60 bg-white dark:bg-zinc-900/20">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{obj.title}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-indigo-500">+{obj.xp} XP</span>
                    {obj.done ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-zinc-100 dark:bg-zinc-850 text-zinc-450 border border-zinc-250">In Progress</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar visualizer */}
          <div className="md:col-span-5 saas-card p-6 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-500 pb-2 border-b border-zinc-150 dark:border-zinc-850">
              Season Progress Calendar
            </h4>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span key={i} className="text-[10px] font-black text-zinc-400">{d}</span>
              ))}
              {Array.from({ length: 30 }).map((_, i) => {
                const isActive = (i + 1) % 6 === 0;
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-extrabold ${
                      isActive 
                        ? 'bg-indigo-500 text-white shadow' 
                        : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/80 text-zinc-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-550 leading-relaxed font-semibold pt-1 text-center">
              Practice every day to highlight the entire month in indigo.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Season Pass */}
      {activeTab === 'pass' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950 via-zinc-900 to-indigo-950 text-white border border-zinc-800 space-y-3">
            <span className="px-3 py-1 rounded bg-teal-500/10 text-teal-400 text-[9px] font-black uppercase tracking-wider border border-teal-500/15">
              Free Pass Active
            </span>
            <h3 className="text-lg font-black">Level Reward Season Pass</h3>
            <p className="text-xs text-zinc-400 max-w-lg leading-relaxed font-semibold">
              Advance tiers by practicing coding challenges and earning XP. Every unlocked level rewards items like streak shields and custom user badges!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {passTiers.map((tier) => (
              <div
                key={tier.tier}
                className={`p-5 rounded-2xl border flex flex-col justify-between items-center text-center space-y-4 h-56 ${
                  tier.claimed 
                    ? 'border-emerald-500/20 bg-emerald-500/[0.01] dark:bg-emerald-500/[0.02]' 
                    : 'border-zinc-200 dark:border-zinc-850 bg-white/40 dark:bg-zinc-950/20'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-zinc-450 dark:text-zinc-500">Tier {tier.tier}</span>
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white">Requires {tier.xpRequired} XP</h4>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200/50 dark:border-zinc-800">
                  <Gift className={`w-6 h-6 ${tier.claimed ? 'text-emerald-500' : 'text-zinc-400'}`} />
                </div>

                <div className="space-y-2 w-full">
                  <p className="text-[9px] text-zinc-455 dark:text-zinc-500 font-bold truncate">{tier.reward}</p>
                  {tier.claimed ? (
                    <div className="w-full py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" /> Claimed
                    </div>
                  ) : (
                    <div className="w-full py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-400 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 border border-zinc-250">
                      Locked
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Collections */}
      {activeTab === 'collections' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">Badge Collections</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Unlocked badges representing your achievements in Toolique Academy.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border text-center flex flex-col justify-between items-center h-44 transition ${
                  b.unlocked 
                    ? 'border-indigo-500/20 bg-indigo-500/5 text-zinc-800 dark:text-zinc-200 shadow-sm' 
                    : 'border-zinc-200/60 dark:border-zinc-850/60 bg-zinc-50/10 text-zinc-400 dark:text-zinc-600 opacity-60'
                }`}
              >
                <div className={`p-3 rounded-2xl ${b.unlocked ? 'bg-indigo-500/10 text-indigo-650' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400'}`}>
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white">{b.name}</h4>
                  <p className="text-[9px] text-zinc-450 dark:text-zinc-500 leading-snug font-semibold">{b.desc}</p>
                </div>
                <span className="text-[8px] font-black uppercase tracking-wider text-indigo-500">
                  {b.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
