import type { Question } from '../../types';

export const sqlQuestions: Question[] = [
  {
    id: 'sql-1',
    slug: 'sql-left-join-customers-without-orders',
    title: 'Find Customers Who Never Placed Orders',
    difficulty: 'beginner',
    topic: 'JOINs',
    tags: ['JOINs', 'Subqueries', 'Null Values'],
    starterCode: `-- Write your SQL query here\nSELECT \nFROM Customers\n;`,
    progressiveHints: [
      'You need to list customers. Think about joining the Customers and Orders tables.',
      'A LEFT JOIN will keep all customers, even if they do not have a match in the Orders table.',
      'Check which field in the joined Orders table is NULL to find customers without orders.',
      'Select the customer name and filter using WHERE Orders.customerId IS NULL.'
    ],
    optimizedAnswer: `SELECT name AS Customers FROM Customers WHERE id NOT IN (SELECT DISTINCT customerId FROM Orders WHERE customerId IS NOT NULL);`,
    validationRules: {
      ignoreOrder: true,
      matchColumns: ['Customers']
    },
    question: `Write an SQL query to report all customers who **never placed any orders**.

### Table Schema:

**Customers** Table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| name | varchar |

**Orders** Table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| customerId | int |`,
    hint: 'Use a LEFT JOIN between Customers and Orders tables and check for null values on the Orders table foreign key.',
    explanation: `To find customers who never placed an order:
1. We execute a **LEFT JOIN** from \`Customers\` to \`Orders\` matching \`Customers.id = Orders.customerId\`.
2. This includes all customers in the output. If a customer has no orders, the corresponding columns from the \`Orders\` table will return \`NULL\`.
3. We filter the results using the clause \`WHERE Orders.customerId IS NULL\` to isolate customers without order associations.`,
    answer: `SELECT c.name AS Customers
FROM Customers c
LEFT JOIN Orders o ON c.id = o.customerId
WHERE o.customerId IS NULL;`,
    sampleInput: `**Customers** Table:
| id | name |
| :- | :--- |
| 1  | Joe  |
| 2  | Henry|
| 3  | Sam  |
| 4  | Max  |

**Orders** Table:
| id | customerId |
| :- | :--------- |
| 1  | 3          |
| 2  | 1          |`,
    sampleOutput: `| Customers |
| :--- |
| Henry |
| Max |`,
    companies: ['Google', 'Amazon', 'Microsoft', 'Oracle'],
    relatedQuestions: ['sql-group-by-department-salary']
  },
  {
    id: 'sql-2',
    slug: 'sql-second-highest-salary',
    title: 'Calculate Second Highest Salary',
    difficulty: 'intermediate',
    topic: 'Window Functions',
    tags: ['Subqueries', 'Offset', 'Aggregation'],
    starterCode: `-- Write your SQL query here\nSELECT \nFROM Employee\n;`,
    progressiveHints: [
      'We need to find salaries. Sorting unique salaries in descending order will help.',
      'Use DISTINCT to get unique salary values.',
      'We can skip the first row (the highest) and take the next row. Think of LIMIT and OFFSET.',
      'Wrap it in an outer select or use MAX with a subquery to handle cases where there are less than 2 employees.'
    ],
    optimizedAnswer: `SELECT MAX(salary) AS SecondHighestSalary FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);`,
    validationRules: {
      ignoreOrder: true,
      matchColumns: ['SecondHighestSalary']
    },
    question: `Write an SQL query to find the **second highest salary** from the \`Employee\` table. If there is no second highest salary, return \`NULL\`.

### Table Schema:

**Employee** Table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| salary | int |`,
    hint: 'You can use DISTINCT to avoid duplicates, sort in descending order, and skip the top row using LIMIT and OFFSET.',
    explanation: `To get the second highest salary:
1. First select the distinct salaries in descending order: \`SELECT DISTINCT salary FROM Employee ORDER BY salary DESC\`.
2. Use \`LIMIT 1 OFFSET 1\` to skip the highest salary and take the second.
3. Wrap this select statement inside an outer query to return \`NULL\` instead of an empty set if only one employee salary exists.`,
    answer: `SELECT (
  SELECT DISTINCT salary 
  FROM Employee 
  ORDER BY salary DESC 
  LIMIT 1 OFFSET 1
) AS SecondHighestSalary;`,
    sampleInput: `**Employee** Table:
| id | salary |
| :- | :----- |
| 1  | 100    |
| 2  | 200    |
| 3  | 300    |`,
    sampleOutput: `| SecondHighestSalary |
| :--- |
| 200 |`,
    companies: ['Meta', 'Netflix', 'Accenture', 'TCS'],
    relatedQuestions: ['sql-left-join-customers-without-orders']
  },
  {
    id: 'sql-3',
    slug: 'sql-group-by-department-salary',
    title: 'Find Highest Salary in Each Department',
    difficulty: 'advanced',
    topic: 'GROUP BY',
    tags: ['GROUP BY', 'JOINs', 'Subqueries'],
    starterCode: `-- Write your SQL query here\nSELECT \nFROM Employee\n;`,
    progressiveHints: [
      'We need the maximum salary grouped by department. Use GROUP BY departmentId and MAX(salary).',
      'This subquery will return a list of departmentId and max salary pairs.',
      'Use the IN operator in your WHERE clause to match the employee departmentId and salary to the subquery results.',
      'JOIN the Employee table with the Department table to output the department name instead of the ID.'
    ],
    optimizedAnswer: `SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary FROM Employee e JOIN Department d ON e.departmentId = d.id WHERE (e.departmentId, e.salary) IN (SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId);`,
    validationRules: {
      ignoreOrder: true,
      matchColumns: ['Department', 'Employee', 'Salary']
    },
    question: `Write an SQL query to retrieve the employees who have the **highest salary in each of their departments**.

### Table Schema:

**Employee** Table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| name | varchar |
| salary | int |
| departmentId | int |

**Department** Table:
| Column Name | Type |
| :--- | :--- |
| id | int |
| name | varchar |`,
    hint: 'Use a subquery to find the MAX(salary) grouped by departmentId, and join it back to the Employee table.',
    explanation: `To find the highest salary in each department:
1. Find the maximum salary per department using: \`SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId\`.
2. Join this subquery result back to the \`Employee\` and \`Department\` tables matching both the \`departmentId\` and \`salary\`.`,
    answer: `SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM Employee e
JOIN Department d ON e.departmentId = d.id
WHERE (e.departmentId, e.salary) IN (
  SELECT departmentId, MAX(salary)
  FROM Employee
  GROUP BY departmentId
);`,
    sampleInput: `**Employee** Table:
| id | name | salary | departmentId |
| :- | :--- | :----- | :----------- |
| 1  | Joe  | 70000  | 1            |
| 2  | Jim  | 90000  | 1            |
| 3  | Henry| 80000  | 2            |
| 4  | Sam  | 60000  | 2            |

**Department** Table:
| id | name |
| :- | :--- |
| 1  | IT   |
| 2  | Sales|`,
    sampleOutput: `| Department | Employee | Salary |
| :--- | :--- | :--- |
| IT | Jim | 90000 |
| Sales | Henry | 80000 |`,
    companies: ['Google', 'Meta', 'Infosys', 'Wipro'],
    relatedQuestions: ['sql-second-highest-salary']
  }
];
export const sqlQuestionMap = new Map(sqlQuestions.map(q => [q.slug, q]));
