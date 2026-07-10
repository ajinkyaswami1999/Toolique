import type { Question } from '../types';

// Simple LCG PRNG seeded by date
function getSeededRandom(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  let seed = Math.abs(hash) || 123456789;
  return function() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

// Generate deterministic variations of a question
function makeVariation(q: Question, index: number, rand: () => number): Question {
  const seed = Math.floor(rand() * 100);
  const titles = [
    `${q.title} (Production Variant)`,
    `${q.title} (Optimization Check)`,
    `${q.title} (Edge-case Audit)`,
    `${q.title} (Refactored Suite)`
  ];
  const selectedTitle = titles[index % titles.length];

  return {
    ...q,
    id: `${q.id}-var-${index}-${seed}`,
    slug: `${q.slug}-var-${index}-${seed}`,
    title: selectedTitle
  };
}

// Generate template questions for technologies with no static question bank
const templates: Record<string, Record<string, { title: string; topic: string; problem: string; starterCode: string; answer: string }[]>> = {
  default: {
    beginner: [
      { title: 'Variable Assignments', topic: 'Syntax', problem: 'Assign values to standard numeric configurations.', starterCode: '// Write starter code here', answer: 'success' },
      { title: 'Console outputs print', topic: 'Control Flow', problem: 'Output hello world strings.', starterCode: '// Print greetings', answer: 'success' },
      { title: 'Arithmetic operators', topic: 'Operations', problem: 'Compute standard sums.', starterCode: '// Calculate basic operations', answer: 'success' }
    ],
    intermediate: [
      { title: 'Handling collections lists', topic: 'Collections', problem: 'Iterate and sum elements in lists.', starterCode: '// Write loop', answer: 'success' },
      { title: 'String splits arrays', topic: 'Parsing', problem: 'Split strings into string arrays.', starterCode: '// Write parser', answer: 'success' },
      { title: 'Date offsets calculations', topic: 'Date Time', problem: 'Calculate duration in milliseconds.', starterCode: '// Write duration logic', answer: 'success' }
    ],
    advanced: [
      { title: 'Memory buffers handling', topic: 'Performance', problem: 'Write safe file read chunk buffers.', starterCode: '// Write memory chunk logic', answer: 'success' },
      { title: 'Concurrences mutex locks', topic: 'Threading', problem: 'Design synchronous shared threads.', starterCode: '// Mutex code', answer: 'success' },
      { title: 'Optimized search tables', topic: 'Complexity', problem: 'Search keys using lookup hashes.', starterCode: '// Search logic', answer: 'success' }
    ],
    expert: [
      { title: 'Architecting cluster instances', topic: 'Systems', problem: 'Implement dynamic load scaling routers.', starterCode: '// Load balancer', answer: 'success' },
      { title: 'Memory garbage leak fixes', topic: 'Garbage Collection', problem: 'Resolve leak allocations.', starterCode: '// Memory clean', answer: 'success' },
      { title: 'Distributed queues channels', topic: 'Streams', problem: 'Build subscriber channel brokers.', starterCode: '// Broker logic', answer: 'success' }
    ],
    interview: [
      { title: 'Google Interview: Tree Inversion', topic: 'Binary Trees', problem: 'Inverse binary tree nodes.', starterCode: '// Invert nodes', answer: 'success' },
      { title: 'Meta Interview: Anagram check', topic: 'Strings', problem: 'Verify anagram word pairs.', starterCode: '// Anagram checker', answer: 'success' },
      { title: 'Netflix Interview: Least Recently Used cache', topic: 'LRU Cache', problem: 'Design LRU eviction metrics.', starterCode: '// LRU class', answer: 'success' }
    ]
  }
};

export function getDailyQuestions(
  categoryId: string,
  dateStr: string,
  staticQuestions: Question[]
): Question[] {
  const rand = getSeededRandom(`${dateStr}-${categoryId}`);
  const difficulties: ('beginner' | 'intermediate' | 'advanced' | 'expert' | 'interview')[] = [
    'beginner',
    'intermediate',
    'advanced',
    'expert',
    'interview'
  ];

  const result: Question[] = [];

  difficulties.forEach((diff) => {
    // Filter static questions matching this difficulty
    const pool = staticQuestions.filter((q) => q.difficulty === diff);
    
    if (pool.length > 0) {
      // Deterministic shuffle of the pool
      const shuffled = [...pool];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
      }

      // Select 3 questions. If pool is too small, generate variations!
      for (let k = 0; k < 3; k++) {
        const targetQ = shuffled[k % shuffled.length];
        const isDuplicate = k >= shuffled.length;
        if (isDuplicate) {
          result.push(makeVariation(targetQ, k, rand));
        } else {
          result.push({
            ...targetQ,
            id: `${targetQ.id}-daily-${dateStr}`,
            slug: `${targetQ.slug}-daily-${dateStr}`
          });
        }
      }
    } else {
      // Fallback: Generate template questions dynamically for this tech
      const categoryTemplates = templates[categoryId] || templates.default;
      const list = categoryTemplates[diff] || templates.default[diff];

      for (let k = 0; k < 3; k++) {
        const template = list[k % list.length];
        const seed = Math.floor(rand() * 100);
        result.push({
          id: `${categoryId}-${diff}-daily-${k}-${dateStr}-${seed}`,
          slug: `${categoryId}-${diff}-daily-${k}-${dateStr}-${seed}`,
          title: `${template.title} (${categoryId.toUpperCase()})`,
          difficulty: diff,
          topic: template.topic,
          tags: [categoryId, template.topic.toLowerCase()],
          question: `**Daily Challenge**: ${template.problem}\n\nProvide the correct solution to solve this mock exercise.`,
          hint: 'Practice code operations, logic parameters, and syntax rules.',
          explanation: 'Step-by-step review indicates writing correct standard statements compiles successfully.',
          answer: template.answer,
          starterCode: template.starterCode,
          progressiveHints: ['Read challenge description.', 'Review return outputs.', 'Click solve query.']
        });
      }
    }
  });

  return result;
}
