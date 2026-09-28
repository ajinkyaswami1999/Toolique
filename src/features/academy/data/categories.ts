import type { Category } from '../types';

export const academyCategories: Category[] = [
  {
    id: 'sql',
    name: 'SQL & Databases',
    description: 'Master relational databases, queries, indexes, subqueries, and performance tuning.',
    icon: 'Database',
    learningTime: '15 Hours',
    topics: ['SELECT', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'JOINs', 'Subqueries', 'Window Functions', 'CTEs', 'Recursive Queries', 'B-Tree Indexes', 'Query Optimization', 'Transactions & ACID', 'Normalization (1NF-BCNF)'],
    roadmap: [
      {
        title: '1. SQL Basics & Logical Query Lifecycle',
        description: 'Understand relational models, RDBMS architectures, DDL/DML, and the logical execution order of SQL queries (FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT).',
        topics: ['SELECT', 'WHERE', 'AND/OR/NOT', 'IN/BETWEEN', 'LIKE & Wildcards', 'ORDER BY', 'LIMIT/OFFSET']
      },
      {
        title: '2. Relational Joins & Set Operations',
        description: 'Combine datasets across normalized tables using relational algebra and set theory.',
        topics: ['INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'SELF JOIN', 'UNION & UNION ALL', 'INTERSECT & EXCEPT']
      },
      {
        title: '3. Grouping, Aggregation & Pivoting',
        description: 'Aggregate numerical metrics, calculate grouped summaries, and pivot data rows into analytical columns.',
        topics: ['COUNT/SUM/AVG/MIN/MAX', 'GROUP BY', 'HAVING Clause', 'CASE WHEN Expressions', 'Conditional Aggregation', 'PIVOT & UNPIVOT']
      },
      {
        title: '4. Subqueries, CTEs & Recursive Hierarchies',
        description: 'Structure nested evaluations and recursive graph traversals using modular Common Table Expressions.',
        topics: ['Scalar Subqueries', 'Correlated Subqueries', 'EXISTS & NOT EXISTS', 'Common Table Expressions (CTEs)', 'Recursive CTEs', 'Hierarchical Trees']
      },
      {
        title: '5. Analytic Window Functions',
        description: 'Perform advanced calculations across rows related to the current query row without collapsing result sets.',
        topics: ['OVER (PARTITION BY ... ORDER BY)', 'ROW_NUMBER()', 'RANK() vs DENSE_RANK()', 'LEAD() & LAG()', 'Running Totals & Moving Averages', 'NTILE() & FIRST_VALUE()']
      },
      {
        title: '6. Indexes, SARGability & Query Optimization',
        description: 'Analyze query execution plans, design B-Tree/Composite indexes, and eliminate table scans.',
        topics: ['B+ Tree Indexes', 'Clustered vs Non-Clustered', 'Composite Index Column Order', 'SARGable Predicates', 'EXPLAIN ANALYZE', 'Join Algorithms (Nested Loop, Hash, Merge)']
      },
      {
        title: '7. Transactions, Concurrency & Normalization',
        description: 'Maintain data consistency with ACID guarantees, isolation levels, and normalized schema design.',
        topics: ['ACID Properties', 'Isolation Levels', 'Dirty / Non-Repeatable / Phantom Reads', 'Deadlocks & Locking', '1NF, 2NF, 3NF & BCNF', 'Foreign Keys & Constraints']
      }
    ],
    cheatSheet: [
      {
        title: 'Logical Execution Order of SQL',
        content: `Understanding how SQL engines evaluate queries logically:
1. **\`FROM\` & \`JOIN\`**: Identify candidate tables and build Cartesian products / join matching rows.
2. **\`WHERE\`**: Filter individual base rows before any grouping occurs.
3. **\`GROUP BY\`**: Partition filtered rows into aggregate group buckets.
4. **\`HAVING\`**: Filter grouped aggregates (e.g. \`HAVING COUNT(*) > 5\`).
5. **\`SELECT\`**: Evaluate expressions, compute columns, and apply window functions.
6. **\`DISTINCT\`**: Deduplicate identical output rows.
7. **\`ORDER BY\`**: Sort the final projected dataset.
8. **\`LIMIT\` / \`OFFSET\`**: Slice the output row boundaries.`
      },
      {
        title: 'Relational Joins Reference',
        content: `* **INNER JOIN**: Returns rows with matching keys in **both** tables.
* **LEFT JOIN**: Returns **all** rows from left table, with \`NULL\` for non-matching right table rows.
* **RIGHT JOIN**: Returns **all** rows from right table, with \`NULL\` for non-matching left table rows.
* **FULL OUTER JOIN**: Returns all rows from both tables, filling \`NULL\` whenever a match is absent.
* **CROSS JOIN**: Produces the Cartesian product ($M \\times N$ rows) combining every row of table 1 with table 2.
* **ANTI-JOIN (LEFT JOIN ... WHERE right.id IS NULL)**: Efficiently isolates records with **no** matching counterpart.`
      },
      {
        title: 'Window Functions Masterclass',
        content: `\`\`\`sql
-- Syntax: FUNCTION() OVER (PARTITION BY col1 ORDER BY col2 [FRAME])

-- 1. ROW_NUMBER: Unique sequential integer (1, 2, 3, 4)
ROW_NUMBER() OVER (PARTITION BY deptId ORDER BY salary DESC)

-- 2. RANK: Tied values share rank, creates gaps (1, 2, 2, 4)
RANK() OVER (PARTITION BY deptId ORDER BY salary DESC)

-- 3. DENSE_RANK: Tied values share rank, NO gaps (1, 2, 2, 3)
DENSE_RANK() OVER (PARTITION BY deptId ORDER BY salary DESC)

-- 4. LAG & LEAD: Access previous or next row values
LAG(salary, 1, 0) OVER (ORDER BY orderDate)
LEAD(salary, 1, 0) OVER (ORDER BY orderDate)

-- 5. Running Total:
SUM(amount) OVER (PARTITION BY customerId ORDER BY orderDate ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
\`\`\``
      },
      {
        title: 'Indexing & SARGability Rules',
        content: `* **SARGable** stands for **S**earch **Arg**ument **Able**. Queries that allow the optimizer to perform an index seek rather than a full table scan.
* **Non-SARGable (Slow):** \`WHERE YEAR(created_at) = 2026\` (Engine must evaluate the function on every row).
* **SARGable (Fast):** \`WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01'\` (Direct index range seek).
* **Composite Index Rule (Leftmost Prefix):** An index on \`(tenant_id, status, created_at)\` accelerates queries filtering on \`(tenant_id)\` or \`(tenant_id, status)\`, but **not** queries filtering solely on \`(status, created_at)\`.`
      },
      {
        title: 'Database Normalization (1NF to BCNF)',
        content: `* **1NF (First Normal Form):** Every column contains atomic (indivisible) values; no repeating groups or arrays.
* **2NF (Second Normal Form):** Meets 1NF + All non-key attributes are fully functionally dependent on the entire primary key (no partial dependencies on composite keys).
* **3NF (Third Normal Form):** Meets 2NF + No transitive dependencies (non-key columns do not depend on other non-key columns).
* **BCNF (Boyce-Codd Normal Form):** Stricter 3NF where for every functional dependency $X \\to Y$, $X$ must be a super key.`
      },
      {
        title: 'ACID Properties & Transaction Isolation Levels',
        content: `* **Atomicity:** All-or-nothing execution. If any operation in a transaction fails, everything is rolled back.
* **Consistency:** Data remains in a valid state adhering to all constraints, types, and foreign keys.
* **Isolation:** Concurrent transactions execute without interfering with one another.
* **Durability:** Committed changes persist safely even across system crashes or power failures.

### Isolation Levels vs Phenomena:
| Isolation Level | Dirty Read | Non-Repeatable Read | Phantom Read |
| :--- | :---: | :---: | :---: |
| **Read Uncommitted** | Allowed | Allowed | Allowed |
| **Read Committed** | Prevented | Allowed | Allowed |
| **Repeatable Read** | Prevented | Prevented | Allowed (InnoDB prevents) |
| **Serializable** | Prevented | Prevented | Prevented |`
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
