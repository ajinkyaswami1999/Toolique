import type { Question } from '../../types';

export const javascriptQuestions: Question[] = [
  {
    id: 'js-1',
    slug: 'js-closure-counter',
    title: 'Create a Private State Counter using Closures',
    difficulty: 'beginner',
    topic: 'Scopes & Closures',
    tags: ['Closures', 'Scopes', 'Encapsulation'],
    starterCode: `function createCounter() {\n  let count = 0;\n  return {\n    increment: function() {\n      // increment private state\n    },\n    getValue: function() {\n      // return value\n      return 0;\n    }\n  };\n}`,
    progressiveHints: [
      'Define a local count variable inside createCounter().',
      'The returned object should have two functions: increment and getValue.',
      'Inside increment, add 1 to your local count variable.',
      'Inside getValue, return the count variable. Closure will retain access to it.'
    ],
    functionName: 'createCounter',
    testCases: [
      {
        input: [],
        expected: 2,
        // Custom runner execution block
        run: "(function() { const c = createCounter(); c.increment(); c.increment(); return c.getValue(); })()"
      },
      {
        input: [],
        expected: 0,
        run: "(function() { const c = createCounter(); return c.getValue(); })()"
      }
    ] as any,
    question: `Write a JavaScript function \`createCounter()\` that returns an object containing two methods: \`increment()\` and \`getValue()\`. The counter value must be **fully private** and inaccessible from outside the function scope.

### Function Signature:
\`\`\`javascript
function createCounter() {
  // Write implementation
}
\`\`\``,
    hint: 'Define a variable inside createCounter() and return an object with closures that reference this private variable.',
    explanation: `Closures allow inner functions to access variables defined in outer scopes:
1. Define \`let count = 0\` inside \`createCounterInstance()\`.
2. Return an object with two methods. Since these methods are declared inside \`createCounter()\`, they retain access to \`count\` even after \`createCounter()\` finishes execution.
3. Because \`count\` is not exposed on the returned object, it is completely secure and private.`,
    answer: `function createCounter() {\n  let count = 0;\n  return {\n    increment: function() {\n      count++;\n    },\n    getValue: function() {\n      return count;\n    }\n  };\n}`,
    sampleInput: `const counter = createCounter();\ncounter.increment();\ncounter.increment();\nconsole.log(counter.getValue());`,
    sampleOutput: `2`,
    companies: ['Wipro', 'Infosys', 'Capgemini'],
    relatedQuestions: ['js-promise-all-implementation']
  },
  {
    id: 'js-2',
    slug: 'js-promise-all-implementation',
    title: 'Custom Promise.all Implementation',
    difficulty: 'intermediate',
    topic: 'Promises & Async/Await',
    tags: ['Promises', 'Async/Await', 'Interview'],
    starterCode: `function promiseAll(promises) {\n  return new Promise((resolve, reject) => {\n    // Write implementation\n  });\n}`,
    progressiveHints: [
      'Return a new Promise instance.',
      'Initialize an empty results array and a completedCount count variable.',
      'Iterate over promises list and call Promise.resolve(p) for each item.',
      'Keep index mappings aligned. Resolve outer promise when completedCount === promises.length.'
    ],
    functionName: 'promiseAll',
    testCases: [
      {
        input: [],
        expected: [1, 2, 3],
        run: "promiseAll([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])"
      }
    ] as any,
    question: `Write a custom implementation of JavaScript's native \`Promise.all(promises)\` function. It should return a single promise that resolves when all input promises resolve, or rejects immediately if any input promise rejects.

### Function Signature:
\`\`\`javascript
function promiseAll(promises) {
  // Write implementation
}
\`\`\``,
    hint: 'Return a new Promise. Keep track of resolved counts and results in an array. Resolve when the count matches the input list length.',
    explanation: `To implement \`Promise.all\`:
1. Return a new \`Promise\`. If the input array is empty, resolve immediately with an empty array.
2. Initialize a \`results\` array and a \`completedCount\` counter.
3. Iterate over the promises using \`forEach\`. For each item, resolve it using \`Promise.resolve(p)\`.
4. Store the resolved value in the \`results\` array at the corresponding index (preserving order). Increment \`completedCount\`.
5. If \`completedCount === promises.length\`, resolve the outer promise.
6. If any promise throws or rejects, reject the outer promise immediately.`,
    answer: `function promiseAll(promises) {\n  return new Promise((resolve, reject) => {\n    const results = [];\n    let completed = 0;\n    if (promises.length === 0) return resolve([]);\n    promises.forEach((p, idx) => {\n      Promise.resolve(p).then(res => {\n        results[idx] = res;\n        completed++;\n        if (completed === promises.length) resolve(results);\n      }).catch(reject);\n    });\n  });\n}`,
    sampleInput: `const p1 = Promise.resolve(3);\nconst p2 = 42;\nconst p3 = new Promise((resolve) => setTimeout(resolve, 100, 'foo'));\n\npromiseAll([p1, p2, p3]).then(console.log);`,
    sampleOutput: `[3, 42, "foo"]`,
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
    relatedQuestions: ['js-closure-counter']
  }
];
export const javascriptQuestionMap = new Map(javascriptQuestions.map(q => [q.slug, q]));
