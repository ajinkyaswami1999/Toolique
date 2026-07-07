import type { Question } from '../../types';

export const pythonQuestions: Question[] = [
  {
    id: 'py-1',
    slug: 'python-list-comprehension-filter',
    title: 'Filter Even Numbers with List Comprehension',
    difficulty: 'beginner',
    topic: 'List Comprehensions',
    tags: ['List Comprehensions', 'Filtering', 'Lists'],
    starterCode: `def filter_evens(numbers: list[int]) -> list[int]:\n    # Write list comprehension here\n    return []`,
    progressiveHints: [
      'List comprehensions use brackets: [x for x in iterable]',
      'You need to loop through every item inside numbers. E.g. [x for x in numbers]',
      'Add a condition to filter. Even numbers check if x % 2 == 0.',
      'Combine them: [x for x in numbers if x % 2 == 0]'
    ],
    functionName: 'filter_evens',
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6]], expected: [2, 4, 6] },
      { input: [[10, 15, 20, 25]], expected: [10, 20] },
      { input: [[1, 3, 5]], expected: [] }
    ],
    question: `Write a Python function \`filter_evens(numbers)\` that takes a list of integers and returns a new list containing only the **even numbers**, utilizing **list comprehension**.

### Function Signature:
\`\`\`python
def filter_evens(numbers: list[int]) -> list[int]:
    pass
\`\`\``,
    hint: 'List comprehension syntax is: [expression for item in iterable if condition]',
    explanation: `List comprehensions provide a concise way to create lists.
To filter even numbers:
1. Iterate over the input list: \`for x in numbers\`.
2. Check if number is divisible by 2: \`if x % 2 == 0\`.
3. Include the matching variable in the expression array: \`[x for x in numbers if x % 2 == 0]\`.`,
    answer: `def filter_evens(numbers: list[int]) -> list[int]:\n    return [x for x in numbers if x % 2 == 0]`,
    sampleInput: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`,
    sampleOutput: `[2, 4, 6, 8, 10]`,
    companies: ['TCS', 'Infosys', 'Capgemini'],
    relatedQuestions: ['python-merge-dictionaries']
  },
  {
    id: 'py-2',
    slug: 'python-merge-dictionaries',
    title: 'Merge Two Dictionaries with Value Sums',
    difficulty: 'intermediate',
    topic: 'Lists & Dicts',
    tags: ['Dictionaries', 'Loops', 'Aggregation'],
    starterCode: `def merge_dicts(d1: dict, d2: dict) -> dict:\n    # Write merging logic here\n    return {}`,
    progressiveHints: [
      'Create a copy of d1 first so you do not modify the original dictionary.',
      'Iterate through the keys and values of d2 using d2.items().',
      'Use the dict get() method: res[k] = res.get(k, 0) + v to sum values.',
      'Return the merged dictionary.'
    ],
    functionName: 'merge_dicts',
    testCases: [
      { 
        input: [{ 'a': 1, 'b': 2 }, { 'b': 3, 'c': 4 }], 
        expected: { 'a': 1, 'b': 5, 'c': 4 } 
      },
      { 
        input: [{ 'x': 100 }, { 'x': 50, 'y': 20 }], 
        expected: { 'x': 150, 'y': 20 } 
      }
    ],
    question: `Write a Python function \`merge_dicts(d1, d2)\` that merges two dictionaries. If a key exists in both dictionaries, the resulting dictionary should contain the **sum of their values**.

### Function Signature:
\`\`\`python
def merge_dicts(d1: dict, d2: dict) -> dict:
    pass
\`\`\``,
    hint: 'Start with a copy of the first dictionary. Loop through keys in the second and either add to or set the values.',
    explanation: `To merge dictionaries and sum values for duplicate keys:
1. Create a copy of the first dictionary to avoid mutating the original input: \`res = d1.copy()\`.
2. Loop over the key-value pairs in the second dictionary: \`for k, v in d2.items()\`.
3. Use the dict's \`get(key, default)\` method to add the values together: \`res[k] = res.get(k, 0) + v\`.`,
    answer: `def merge_dicts(d1: dict, d2: dict) -> dict:\n    res = d1.copy()\n    for k, v in d2.items():\n        res[k] = res.get(k, 0) + v\n    return res`,
    sampleInput: `d1 = {'a': 100, 'b': 200, 'c': 300}\nd2 = {'b': 150, 'c': 50, 'd': 400}`,
    sampleOutput: `{'a': 100, 'b': 350, 'c': 350, 'd': 400}`,
    companies: ['Amazon', 'Google', 'Accenture'],
    relatedQuestions: ['python-list-comprehension-filter']
  }
];
export const pythonQuestionMap = new Map(pythonQuestions.map(q => [q.slug, q]));
