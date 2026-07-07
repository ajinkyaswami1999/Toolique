import type { Question } from '../types';

export function getDailyChallenge(questions: Question[], categoryId?: string): Question | null {
  if (!questions || questions.length === 0) return null;

  const filtered = categoryId 
    ? questions.filter(q => q.id.startsWith(categoryId) || q.slug.includes(categoryId))
    : questions;

  if (filtered.length === 0) return null;

  // Use current date string (YYYY-MM-DD) as the seed for deterministic selection
  const todayStr = new Date().toISOString().split('T')[0];
  
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = todayStr.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % filtered.length;
  return filtered[index];
}
