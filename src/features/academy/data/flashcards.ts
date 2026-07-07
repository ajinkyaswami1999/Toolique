export interface Flashcard {
  id: string;
  category: string; // sql, python, javascript, react, qa
  front: string; // Question or concept trigger
  back: string; // Code template or short answer definition
}

export const flashcardsList: Flashcard[] = [
  {
    id: 'fc-sql-1',
    category: 'sql',
    front: 'Difference between WHERE and HAVING clauses',
    back: 'WHERE filters rows before aggregation (GROUP BY). HAVING filters aggregated groups (e.g. HAVING COUNT(id) > 5) after GROUP BY.'
  },
  {
    id: 'fc-sql-2',
    category: 'sql',
    front: 'What does a LEFT JOIN return?',
    back: 'Returns all records from the left table, and matching records from the right table. Non-matching right columns resolve as NULL.'
  },
  {
    id: 'fc-py-1',
    category: 'python',
    front: 'What is a lambda function in Python?',
    back: 'An anonymous, inline function defined with the lambda keyword. Can take any number of arguments but has only one expression.'
  },
  {
    id: 'fc-py-2',
    category: 'python',
    front: 'How is memory managed in Python?',
    back: 'Python manages memory dynamically using a private heap space, garbage collection, and reference counting mechanisms.'
  },
  {
    id: 'fc-js-1',
    category: 'javascript',
    front: 'What is the Event Loop in JavaScript?',
    back: 'A browser mechanism that monitors the Call Stack and Callback Queue, pushing waiting callbacks onto the stack when it is empty.'
  },
  {
    id: 'fc-js-2',
    category: 'javascript',
    front: 'Difference between == and === in JS',
    back: '== performs type coercion (converts types to match before comparing). === checks both value and type equality strictly.'
  },
  {
    id: 'fc-react-1',
    category: 'react',
    front: 'What is the purpose of useEffect cleanup?',
    back: 'Clears timers, event listeners, or subscriptions when the component unmounts or before re-running the effect, preventing leaks.'
  },
  {
    id: 'fc-react-2',
    category: 'react',
    front: 'What is React Context API?',
    back: 'A built-in state management utility to share values (themes, user settings) globally across nested component trees without prop drilling.'
  },
  {
    id: 'fc-qa-1',
    category: 'qa',
    front: 'Difference between Implicit and Explicit wait',
    back: 'Implicit wait applies globally to all elements for a set timeout. Explicit wait targets a specific locator and condition dynamically.'
  },
  {
    id: 'fc-qa-2',
    category: 'qa',
    front: 'What is the Page Object Model (POM)?',
    back: 'A design pattern where web pages are represented as classes, isolating locator maps and page action queries from test script logic.'
  }
];
export const flashcardQuestionMap = new Map(flashcardsList.map(fc => [fc.id, fc]));
