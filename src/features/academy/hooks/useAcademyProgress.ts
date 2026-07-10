import { useState, useEffect } from 'react';
import type { UserProgress } from '../types';

const LOCAL_STORAGE_KEY = 'toolique_academy_progress';

const initialProgress: UserProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  lastActiveDate: '',
  completedQuestions: [],
  bookmarkedQuestions: [],
  notes: {},
  xpHistory: {}
};

export function useAcademyProgress() {
  const [progress, setProgress] = useState<UserProgress>(initialProgress);

  // Load progress from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...initialProgress, ...parsed };
        
        // Calculate daily streak on load
        const updated = checkAndTriggerStreak(merged);
        setProgress(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to parse academy progress:', err);
        setProgress(initialProgress);
      }
    } else {
      setProgress(initialProgress);
    }
  }, []);

  // Check and update daily streak
  const checkAndTriggerStreak = (curr: UserProgress): UserProgress => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (curr.lastActiveDate === todayStr) {
      return curr; // Already active today, streak stays same
    }

    if (!curr.lastActiveDate) {
      return {
        ...curr,
        streak: 1,
        longestStreak: Math.max(curr.longestStreak, 1),
        lastActiveDate: todayStr
      };
    }

    const lastDate = new Date(curr.lastActiveDate);
    const today = new Date(todayStr);
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day! Increment streak
      const newStreak = curr.streak + 1;
      return {
        ...curr,
        streak: newStreak,
        longestStreak: Math.max(curr.longestStreak, newStreak),
        lastActiveDate: todayStr
      };
    } else if (diffDays > 1) {
      // Streak broken. Check if user has streak shields
      let shields = 0;
      try {
        const savedShields = localStorage.getItem('toolique_streak_shields') || '0';
        shields = parseInt(savedShields);
      } catch (e) {}

      if (shields > 0) {
        // Consume one streak shield
        shields = shields - 1;
        localStorage.setItem('toolique_streak_shields', shields.toString());
        // Streak stays preserved! We just advance the active date
        return {
          ...curr,
          lastActiveDate: todayStr
        };
      }

      // Reset streak to 1 if no shield is available
      return {
        ...curr,
        streak: 1,
        longestStreak: Math.max(curr.longestStreak, 1),
        lastActiveDate: todayStr
      };
    }

    return curr;
  };

  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProgress));
  };

  const completeQuestion = (questionId: string, xpReward: number = 20) => {
    if (progress.completedQuestions.includes(questionId)) return; // Already solved

    const todayStr = new Date().toISOString().split('T')[0];
    const newCompleted = [...progress.completedQuestions, questionId];
    
    // Add XP and recalculate level (100 XP per level)
    const newXp = progress.xp + xpReward;
    const newLevel = Math.floor(newXp / 100) + 1;
    
    // Track XP history
    const newXpHistory = { ...progress.xpHistory };
    newXpHistory[todayStr] = (newXpHistory[todayStr] || 0) + xpReward;

    // Check streak
    const currentProgress = {
      ...progress,
      xp: newXp,
      level: newLevel,
      completedQuestions: newCompleted,
      xpHistory: newXpHistory
    };
    
    const updated = checkAndTriggerStreak(currentProgress);
    saveProgress(updated);
  };

  const toggleBookmark = (questionId: string) => {
    const isBookmarked = progress.bookmarkedQuestions.includes(questionId);
    const newBookmarks = isBookmarked
      ? progress.bookmarkedQuestions.filter(id => id !== questionId)
      : [...progress.bookmarkedQuestions, questionId];

    saveProgress({
      ...progress,
      bookmarkedQuestions: newBookmarks
    });
  };

  const saveNote = (questionId: string, noteText: string) => {
    const newNotes = { ...progress.notes };
    if (noteText.trim() === '') {
      delete newNotes[questionId];
    } else {
      newNotes[questionId] = noteText;
    }

    saveProgress({
      ...progress,
      notes: newNotes
    });
  };

  const exportNotes = () => {
    const notesJson = JSON.stringify(progress.notes, null, 2);
    const blob = new Blob([notesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolique-academy-notes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    progress,
    completeQuestion,
    toggleBookmark,
    saveNote,
    exportNotes,
    isSolved: (qId: string) => progress.completedQuestions.includes(qId),
    isBookmarked: (qId: string) => progress.bookmarkedQuestions.includes(qId)
  };
}
