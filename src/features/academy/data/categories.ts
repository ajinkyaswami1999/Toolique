import type { Category } from '../types';

export const academyCategories: Category[] = [
  {
    id: 'sql',
    name: 'SQL & Databases',
    description: 'Master relational databases, queries, indexes, subqueries, and performance tuning.',
    icon: 'Database',
    learningTime: '15 Hours',
    topics: ['SELECT', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'JOINs', 'Subqueries', 'Window Functions', 'CTEs', 'Transactions', 'Optimization'],
    roadmap: [
      {
        title: 'SQL Basics',
        description: 'Basic database terminology, SELECT syntax, and simple filtering query logic.',
        topics: ['SELECT', 'WHERE', 'ORDER BY', 'LIMIT/OFFSET']
      },
      {
        title: 'Aggregation & Joins',
        description: 'Combining and grouping data across tables using aggregation models.',
        topics: ['GROUP BY', 'HAVING', 'INNER JOIN', 'LEFT/RIGHT JOIN', 'FULL OUTER JOIN']
      },
      {
        title: 'Advanced Subqueries & CTEs',
        description: 'Structuring complex analytical SQL queries using sub-evaluation filters.',
        topics: ['Subqueries', 'Common Table Expressions (CTEs)', 'Window Functions']
      },
      {
        title: 'Indexes & Query Optimization',
        description: 'Speeding up query execution and analyzing explain plans.',
        topics: ['Views', 'Indexes', 'Execution Plans', 'Transactions']
      }
    ],
    cheatSheet: [
      {
        title: 'Basic Query Syntax',
        content: `\`\`\`sql
SELECT column1, column2 
FROM table_name 
WHERE condition 
ORDER BY column1 ASC;
\`\`\``
      },
      {
        title: 'Common JOIN Types',
        content: `* **INNER JOIN:** Returns matching rows in both tables.
* **LEFT JOIN:** Returns all rows from left table, matching rows from right.
* **RIGHT JOIN:** Returns all rows from right table, matching rows from left.`
      }
    ]
  },
  {
    id: 'python',
    name: 'Python Programming',
    description: 'Learn Python syntax, data structures, scripting, OOP, and automation testing models.',
    icon: 'Code',
    learningTime: '20 Hours',
    topics: ['Variables', 'Data Types', 'Lists & Dicts', 'Functions', 'Loops', 'Exceptions', 'OOP', 'List Comprehensions', 'Decorators', 'Generators', 'File handling'],
    roadmap: [
      {
        title: 'Python Basics',
        description: 'Syntax, expressions, conditional logic, and control loops.',
        topics: ['Variables', 'Data Types', 'Loops', 'Functions']
      },
      {
        title: 'Data Structures',
        description: 'Native Python collection lists, sets, tuples, and dictionaries.',
        topics: ['Lists', 'Tuples', 'Dictionaries', 'Sets']
      },
      {
        title: 'Advanced Python',
        description: 'File operations, list comprehensions, object-oriented concepts, and exceptions.',
        topics: ['List Comprehensions', 'File Handling', 'Object-Oriented Programming (OOP)', 'Decorators']
      }
    ],
    cheatSheet: [
      {
        title: 'List Comprehensions',
        content: `\`\`\`python
# [expression for item in iterable if condition]
evens = [x for x in range(10) if x % 2 == 0]
# Returns [0, 2, 4, 6, 8]
\`\`\``
      },
      {
        title: 'Defining Functions',
        content: `\`\`\`python
def greet(name: str) -> str:
    return f"Hello, {name}!"
\`\`\``
      }
    ]
  },
  {
    id: 'javascript',
    name: 'JavaScript Core',
    description: 'Master JS engines, asynchronous loops, promises, DOM triggers, and browser APIs.',
    icon: 'Sparkles',
    learningTime: '18 Hours',
    topics: ['Variables', 'Data Types', 'Arrow Functions', 'Promises & Async/Await', 'DOM Manipulation', 'Event Loop', 'Scopes & Closures', 'Prototypes', 'ES6+ Features'],
    roadmap: [
      {
        title: 'JavaScript Basics',
        description: 'Syntax fundamentals, variables, control models, and basic array methods.',
        topics: ['Variables', 'Arrays', 'Objects', 'Functions']
      },
      {
        title: 'Asynchronous JavaScript',
        description: 'Handling network operations, timeouts, callbacks, and promise patterns.',
        topics: ['Promises', 'Async/Await', 'Fetch API', 'Event Loop']
      },
      {
        title: 'JS Internals & Scope',
        description: 'Understanding closures, memory layout, scope hoisting, and prototypal inheritance.',
        topics: ['Closures', 'Scopes', 'Hoisting', 'Prototypes']
      }
    ],
    cheatSheet: [
      {
        title: 'Async/Await Promise Handling',
        content: `\`\`\`javascript
async function fetchData(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}
\`\`\``
      },
      {
        title: 'ES6+ Destructuring',
        content: `\`\`\`javascript
const user = { name: 'Ajinkya', role: 'Founder' };
const { name, role } = user;
\`\`\``
      }
    ]
  },
  {
    id: 'react',
    name: 'React JS Framework',
    description: 'Build modern client interfaces using components, hooks, states, and virtual DOM.',
    icon: 'Layers',
    learningTime: '22 Hours',
    topics: ['Components', 'Props & State', 'Virtual DOM', 'useEffect Hook', 'useState Hook', 'Custom Hooks', 'React Router', 'Context API', 'Performance Tuning'],
    roadmap: [
      {
        title: 'React Fundamentals',
        description: 'JSX syntax, components, passing props, and managing basic states.',
        topics: ['JSX', 'Functional Components', 'Props', 'useState']
      },
      {
        title: 'Hooks & Side-effects',
        description: 'Handling server requests, lifecycle actions, and cleanup states.',
        topics: ['useEffect', 'useMemo/useCallback', 'Custom Hooks']
      },
      {
        title: 'State & Navigation',
        description: 'Global state contexts and page routing configuration.',
        topics: ['Context API', 'React Router', 'Performance Optimization']
      }
    ],
    cheatSheet: [
      {
        title: 'useState & useEffect Hook',
        content: `\`\`\`jsx
import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`Count is \${count}\`;
  }, [count]);

  return <button onClick={() => setCount(count + 1)}>Increment</button>;
}
\`\`\``
      }
    ]
  },
  {
    id: 'qa',
    name: 'QA Automation',
    description: 'Learn QA testing methodologies, test architecture, automation framework design, and scripting.',
    icon: 'Cpu',
    learningTime: '25 Hours',
    topics: ['Testing types', 'Selenium WebDriver', 'Playwright', 'Locators', 'Page Object Model', 'API testing', 'CI/CD integration', 'Test runners', 'Assertions'],
    roadmap: [
      {
        title: 'Testing Fundamentals',
        description: 'QA life cycles, test cases, and assertion logic.',
        topics: ['QA Lifecycles', 'Manual vs Automation', 'Assertions']
      },
      {
        title: 'Selenium & Locators',
        description: 'WebDriver drivers, element selectors, and handling page waits.',
        topics: ['Selenium WebDriver', 'XPath & CSS Locators', 'Implicit/Explicit Waits']
      },
      {
        title: 'Framework Architectures',
        description: 'Designing Page Object Model patterns and configuring test execution runners.',
        topics: ['Page Object Model (POM)', 'PyTest/JUnit Runners', 'API Test Automation']
      }
    ],
    cheatSheet: [
      {
        title: 'Selenium Explicit Wait',
        content: `\`\`\`python
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Wait up to 10s for element to be visible
element = WebDriverWait(driver, 10).until(
    EC.visibility_of_element_element_located((By.ID, "submit-btn"))
)
\`\`\``
      }
    ]
  },
  {
    id: 'c',
    name: 'C Language',
    description: 'Learn foundational syntax, pointers, memory allocation, and structures.',
    icon: 'Code',
    learningTime: '12 Hours',
    topics: ['Data Types', 'Pointers', 'Structs', 'Memory Allocation'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'cpp',
    name: 'C++ OOP',
    description: 'Master classes, inheritance, templates, and Standard Template Library.',
    icon: 'Code',
    learningTime: '18 Hours',
    topics: ['Classes', 'Inheritance', 'Polymorphism', 'STL'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'java',
    name: 'Java Platform',
    description: 'JVM architecture, multithreading, collections, and streams API.',
    icon: 'Code',
    learningTime: '20 Hours',
    topics: ['JVM', 'Collections', 'Multithreading', 'Streams'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'typescript',
    name: 'TypeScript Typings',
    description: 'Type safety, interfaces, generics, and compiler configurations.',
    icon: 'Sparkles',
    learningTime: '10 Hours',
    topics: ['Types & Interfaces', 'Generics', 'Utility Types', 'tsconfig'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'nodejs',
    name: 'Node.js Backend',
    description: 'Event loops, file streams, HTTP request servers, and middleware frameworks.',
    icon: 'Zap',
    learningTime: '16 Hours',
    topics: ['Event Loop', 'Buffer & Streams', 'Express.js', 'Middleware'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'golang',
    name: 'Golang',
    description: 'Learn go concurrency, channels, structs, and backend microservices.',
    icon: 'Code',
    learningTime: '14 Hours',
    topics: ['Goroutines', 'Channels', 'Structs', 'Error Handling'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'html',
    name: 'HTML5 Semantic Web',
    description: 'Modern structure, seo markup formats, layouts, and accessibility headers.',
    icon: 'BookOpen',
    learningTime: '6 Hours',
    topics: ['Semantic tags', 'Forms', 'SEO basics', 'Aria attributes'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'css',
    name: 'CSS3 Stylesheet Layouts',
    description: 'Flexbox layouts, grid alignments, animations, and variables.',
    icon: 'Palette',
    learningTime: '10 Hours',
    topics: ['Flexbox', 'CSS Grid', 'Custom Properties', 'Animations'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'git',
    name: 'Git Version Control',
    description: 'Branching, commit histories, resolving merge conflicts, and remote structures.',
    icon: 'Layers',
    learningTime: '6 Hours',
    topics: ['Rebase & Merge', 'Resolving Conflicts', 'Stashing', 'Branching workflows'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'linux',
    name: 'Linux Shell Scripting',
    description: 'Command line operations, file permission parameters, shell automation, and pipelines.',
    icon: 'Target',
    learningTime: '12 Hours',
    topics: ['Permissions', 'Pipes', 'Shell Scripting', 'Process Management'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'docker',
    name: 'Docker Containers',
    description: 'Container images, registries, docker compose stacks, and microservice networking.',
    icon: 'Cpu',
    learningTime: '10 Hours',
    topics: ['Dockerfiles', 'Compose', 'Volume Mounts', 'Container Networking'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'selenium',
    name: 'Selenium WebDriver',
    description: 'Configure grid node tests, locators, dynamic waits, and page objects.',
    icon: 'Cpu',
    learningTime: '15 Hours',
    topics: ['WebDriver', 'Page Objects', 'Grid setup', 'Element actions'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'api-testing',
    name: 'API Testing Pro',
    description: 'Assert payloads, test authorization protocols, and automate collections in Postman.',
    icon: 'Cpu',
    learningTime: '12 Hours',
    topics: ['JSON Assertions', 'Bearer Tokens', 'Postman Collections', 'RestAssured'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'mysql',
    name: 'MySQL Server',
    description: 'Design schemas, join queries, configure foreign references, and execute indexes.',
    icon: 'Database',
    learningTime: '12 Hours',
    topics: ['Constraints', 'Indexing', 'Stored Procedures', 'Views'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL DB',
    description: 'Advanced data models, JSONB queries, views, and execution optimization.',
    icon: 'Database',
    learningTime: '14 Hours',
    topics: ['JSONB', 'CTE Queries', 'Explain Analyze', 'Triggers'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'data-structures',
    name: 'Data Structures',
    description: 'Analyze lists, stacks, trees, heaps, search nodes, and array mappings.',
    icon: 'Award',
    learningTime: '20 Hours',
    topics: ['Linked Lists', 'Binary Trees', 'Heaps', 'Hash Maps', 'Stacks & Queues'],
    roadmap: [],
    cheatSheet: []
  },
  {
    id: 'algorithms',
    name: 'Algorithms Suite',
    description: 'Implement search algorithms, dynamic programming, sorting structures, and evaluate Big-O notation.',
    icon: 'Award',
    learningTime: '25 Hours',
    topics: ['Binary Search', 'Quick/Merge Sort', 'Dynamic Programming', 'Big-O Notation', 'Recursion'],
    roadmap: [],
    cheatSheet: []
  }
];
