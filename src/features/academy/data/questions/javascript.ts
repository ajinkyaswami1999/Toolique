import type { Question } from '../../types';

export const javascriptQuestions: Question[] = [
  {
    id: 'js-1',
    slug: 'js-closure-counter',
    title: 'Create a Private State Counter using Closures',
    difficulty: 'beginner',
    topic: 'Scopes & Closures',
    tags: ['Closures', 'Scopes', 'Encapsulation'],
    question: `Write a JavaScript function \`createCounter()\` that returns an object containing two methods: \`increment()\` and \`getValue()\`. The counter value must be **fully private** and inaccessible from outside the function scope.

### Function Signature:
\`\`\`javascript
function createCounter() {
  // Write implementation
}
\`\`\``,
    hint: 'Define a variable inside createCounter() and return an object with closures that reference this private variable.',
    explanation: `Closures allow inner functions to access variables defined in outer scopes:
1. Define \`let count = 0\` inside \`createCounter()\`.
2. Return an object with two methods. Since these methods are declared inside \`createCounter()\`, they retain access to \`count\` even after \`createCounter()\` finishes execution.
3. Because \`count\` is not exposed on the returned object, it is completely secure and private.`,
    answer: `\`\`\`javascript
function createCounter() {
  let count = 0;
  return {
    increment: function() {
      count++;
    },
    getValue: function() {
      return count;
    }
  };
}
\`\`\``,
    sampleInput: `const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.getValue());`,
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
    answer: `\`\`\`javascript
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('Arguments must be an array'));
    }
    
    const results = [];
    let completedCount = 0;
    const total = promises.length;
    
    if (total === 0) {
      return resolve([]);
    }
    
    promises.forEach((p, index) => {
      Promise.resolve(p)
        .then(value => {
          results[index] = value;
          completedCount++;
          if (completedCount === total) {
            resolve(results);
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  });
}
\`\`\``,
    sampleInput: `const p1 = Promise.resolve(3);
const p2 = 42;
const p3 = new Promise((resolve) => setTimeout(resolve, 100, 'foo'));

promiseAll([p1, p2, p3]).then(console.log);`,
    sampleOutput: `[3, 42, "foo"]`,
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
    relatedQuestions: ['js-closure-counter']
  }
];
export const javascriptQuestionMap = new Map(javascriptQuestions.map(q => [q.slug, q]));
