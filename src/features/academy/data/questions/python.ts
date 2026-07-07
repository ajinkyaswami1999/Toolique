import type { Question } from '../../types';

export const pythonQuestions: Question[] = [
  {
    id: 'py-1',
    slug: 'python-list-comprehension-filter',
    title: 'Filter Even Numbers with List Comprehension',
    difficulty: 'beginner',
    topic: 'List Comprehensions',
    tags: ['List Comprehensions', 'Filtering', 'Lists'],
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
    answer: `\`\`\`python
def filter_evens(numbers: list[int]) -> list[int]:
    return [x for x in numbers if x % 2 == 0]
\`\`\``,
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
    answer: `\`\`\`python
def merge_dicts(d1: dict, d2: dict) -> dict:
    res = d1.copy()
    for k, v in d2.items():
        res[k] = res.get(k, 0) + v
    return res
\`\`\``,
    sampleInput: `d1 = {'a': 100, 'b': 200, 'c': 300}
d2 = {'b': 150, 'c': 50, 'd': 400}`,
    sampleOutput: `{'a': 100, 'b': 350, 'c': 350, 'd': 400}`,
    companies: ['Amazon', 'Google', 'Accenture'],
    relatedQuestions: ['python-list-comprehension-filter']
  },
  {
    id: 'py-3',
    slug: 'python-custom-decorator-timer',
    title: 'Create a Execution Timer Decorator',
    difficulty: 'advanced',
    topic: 'Decorators',
    tags: ['Decorators', 'Performance', 'Metadata'],
    question: `Write a custom Python decorator \`timer_decorator\` that calculates and **prints the execution time** of any decorated function in seconds.

### Function Signature:
\`\`\`python
def timer_decorator(func):
    pass
\`\`\``,
    hint: 'Use Python\'s time module to record the start time and end time around the target function invocation.',
    explanation: `Decorators wrap another function to extend its behavior without modifying it:
1. Use \`import time\`.
2. Define a wrapper function that takes arbitrary arguments: \`def wrapper(*args, **kwargs)\`.
3. Capture starting timestamp: \`start = time.time()\`.
4. Execute original function and store its result: \`result = func(*args, **kwargs)\`.
5. Capture end time and print elapsed time: \`print(f"Elapsed: {time.time() - start}s")\`.
6. Return the execution results.`,
    answer: `\`\`\`python
import time
from functools import wraps

def timer_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"Function {func.__name__} took {end_time - start_time:.4f} seconds to execute.")
        return result
    return wrapper
\`\`\``,
    sampleInput: `@timer_decorator
def slow_square(n):
    time.sleep(1)
    return n * n

slow_square(5)`,
    sampleOutput: `Function slow_square took 1.0000 seconds to execute.
25`,
    companies: ['Microsoft', 'Meta', 'Oracle'],
    relatedQuestions: ['python-merge-dictionaries']
  }
];
export const pythonQuestionMap = new Map(pythonQuestions.map(q => [q.slug, q]));
