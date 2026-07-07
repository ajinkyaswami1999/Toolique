export interface Question {
  id: string;
  slug: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'interview';
  topic: string;
  tags: string[];
  question: string; // Markdown supported question statement
  hint: string;
  explanation: string; // Step-by-step markdown explanation
  answer: string; // Correct answer description or code block
  sampleInput?: string;
  sampleOutput?: string;
  companies?: string[];
  relatedQuestions?: string[]; // array of question slugs
  
  // Interactive Coding expansions
  starterCode: string;
  progressiveHints: string[];
  optimizedAnswer?: string;
  functionName?: string;
  testCases?: { input: any[]; expected: any }[];
  validationRules?: {
    ignoreOrder?: boolean;
    matchColumns?: string[];
  };
}

export interface Category {
  id: string; // e.g. 'sql', 'python'
  name: string;
  description: string;
  icon: string; // Lucide icon name string
  learningTime: string; // e.g. '12 hours'
  topics: string[];
  roadmap: {
    title: string;
    description: string;
    topics: string[];
  }[];
  cheatSheet: {
    title: string;
    content: string; // Markdown cheat sheet text
  }[];
}

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  completedQuestions: string[]; // Question IDs
  bookmarkedQuestions: string[]; // Question IDs
  notes: { [questionId: string]: string }; // Note text map
  xpHistory: { [date: string]: number }; // Date to XP earned map
}

export interface InterviewSession {
  isActive: boolean;
  category: string;
  difficulty: string;
  questions: Question[];
  currentQuestionIndex: number;
  timeRemaining: number; // in seconds
  answers: { [questionId: string]: string }; // saved answers
  scores: { [questionId: string]: boolean }; // true if marked correct by user
  totalTime: number; // in seconds
}
