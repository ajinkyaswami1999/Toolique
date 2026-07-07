const LOCAL_STORAGE_KEY = 'toolique_spaced_repetition';

export interface SpacedRepetitionSchedule {
  [questionId: string]: {
    phase: number; // 1, 2, 3, 4, 5
    nextReviewDate: string; // YYYY-MM-DD
    lastReviewed: string; // YYYY-MM-DD
  };
}

// Spaced Repetition Phases offset in Days
const PHASE_OFFSETS = [1, 3, 7, 14, 30];

export function getSpacedSchedules(): SpacedRepetitionSchedule {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export function saveSpacedSchedules(schedules: SpacedRepetitionSchedule) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schedules));
}

// Log a successful answer, incrementing spaced repetition phase and scheduling next review
export function logAnswerForRepetition(questionId: string) {
  const schedules = getSpacedSchedules();
  const current = schedules[questionId];
  
  const todayStr = new Date().toISOString().split('T')[0];
  
  let nextPhase = 1;
  if (current) {
    nextPhase = Math.min(current.phase + 1, 5);
  }
  
  const offsetDays = PHASE_OFFSETS[nextPhase - 1];
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + offsetDays);
  const nextDateStr = nextDate.toISOString().split('T')[0];

  schedules[questionId] = {
    phase: nextPhase,
    nextReviewDate: nextDateStr,
    lastReviewed: todayStr
  };

  saveSpacedSchedules(schedules);
}

// Get lists of question IDs that are currently due for review
export function getDueQuestionIds(): string[] {
  const schedules = getSpacedSchedules();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTime = new Date(todayStr).getTime();

  return Object.keys(schedules).filter(qId => {
    const item = schedules[qId];
    const reviewTime = new Date(item.nextReviewDate).getTime();
    return todayTime >= reviewTime;
  });
}
