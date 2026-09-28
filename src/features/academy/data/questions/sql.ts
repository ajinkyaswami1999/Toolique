import type { Question } from '../../types';

export const sqlQuestions: Question[] = [
  {
    "id": "sql-1",
    "slug": "sql-left-join-customers-without-orders",
    "title": "Find Customers Who Never Placed Orders",
    "difficulty": "beginner",
    "topic": "JOINs",
    "tags": [
      "JOINs",
      "Subqueries",
      "Null Values"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Customers\n;",
    "progressiveHints": [
      "You need to list customers. Think about joining the Customers and Orders tables.",
      "A LEFT JOIN will keep all customers, even if they do not have a match in the Orders table.",
      "Check which field in the joined Orders table is NULL to find customers without orders.",
      "Select the customer name and filter using WHERE Orders.customerId IS NULL."
    ],
    "optimizedAnswer": "SELECT name AS Customers FROM Customers WHERE id NOT IN (SELECT DISTINCT customerId FROM Orders WHERE customerId IS NOT NULL);",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "Customers"
      ]
    },
    "question": "Write an SQL query to report all customers who **never placed any orders**.\n\n### Table Schema:\n\n**Customers** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |\n\n**Orders** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| customerId | int |",
    "hint": "Use a LEFT JOIN between Customers and Orders tables and check for null values on the Orders table foreign key.",
    "explanation": "To find customers who never placed an order:\n1. Execute a **LEFT JOIN** from `Customers` to `Orders` matching `Customers.id = Orders.customerId`.\n2. All customers are retained in the output. If a customer has no orders, the corresponding columns from `Orders` will be `NULL`.\n3. Filter with `WHERE Orders.customerId IS NULL` to isolate customers without order associations.",
    "answer": "SELECT c.name AS Customers\nFROM Customers c\nLEFT JOIN Orders o ON c.id = o.customerId\nWHERE o.customerId IS NULL;",
    "sampleInput": "**Customers** Table:\n| id | name |\n| :- | :--- |\n| 1 | Joe |\n| 2 | Henry|\n| 3 | Sam |\n| 4 | Max |\n\n**Orders** Table:\n| id | customerId |\n| :- | :--------- |\n| 1 | 3 |\n| 2 | 1 |",
    "sampleOutput": "| Customers |\n| :--- |\n| Henry |\n| Max |",
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "Oracle"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-find-products-with-zero-sales"
    ]
  },
  {
    "id": "sql-2",
    "slug": "sql-second-highest-salary",
    "title": "Calculate Second Highest Salary",
    "difficulty": "beginner",
    "topic": "Subqueries",
    "tags": [
      "Subqueries",
      "Offset",
      "Aggregation"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Employee\n;",
    "progressiveHints": [
      "We need unique salaries sorted in descending order.",
      "Use DISTINCT to eliminate salary ties.",
      "We can skip the first row (the highest) and take the next row using LIMIT 1 OFFSET 1.",
      "Wrap it in an outer select or use MAX with a subquery so that if only 1 employee exists, it returns NULL."
    ],
    "optimizedAnswer": "SELECT MAX(salary) AS SecondHighestSalary FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "SecondHighestSalary"
      ]
    },
    "question": "Write an SQL query to find the **second highest salary** from the `Employee` table. If there is no second highest salary, return `NULL`.\n\n### Table Schema:\n\n**Employee** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| salary | int |",
    "hint": "You can use DISTINCT to avoid duplicates, sort in descending order, and skip the top row using LIMIT and OFFSET.",
    "explanation": "To get the second highest salary:\n1. Select distinct salaries descending: `SELECT DISTINCT salary FROM Employee ORDER BY salary DESC`.\n2. Use `LIMIT 1 OFFSET 1` to skip the top salary and retrieve the second.\n3. Wrapping inside an outer scalar select guarantees `NULL` return if fewer than 2 distinct salaries exist.",
    "answer": "SELECT (\n  SELECT DISTINCT salary \n  FROM Employee \n  ORDER BY salary DESC \n  LIMIT 1 OFFSET 1\n) AS SecondHighestSalary;",
    "sampleInput": "**Employee** Table:\n| id | salary |\n| :- | :----- |\n| 1 | 100 |\n| 2 | 200 |\n| 3 | 300 |",
    "sampleOutput": "| SecondHighestSalary |\n| :--- |\n| 200 |",
    "companies": [
      "Meta",
      "Netflix",
      "Accenture",
      "TCS"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-department-highest-salary"
    ]
  },
  {
    "id": "sql-3",
    "slug": "sql-group-by-department-salary",
    "title": "Find Highest Salary in Each Department",
    "difficulty": "beginner",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "GROUP BY",
      "JOINs",
      "Subqueries"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Employee\n;",
    "progressiveHints": [
      "Compute the maximum salary grouped by department using GROUP BY departmentId and MAX(salary).",
      "Use the (departmentId, salary) tuple in your WHERE clause with the IN operator.",
      "JOIN the Employee table with the Department table to display the department name."
    ],
    "optimizedAnswer": "SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary FROM Employee e JOIN Department d ON e.departmentId = d.id WHERE (e.departmentId, e.salary) IN (SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId);",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "Department",
        "Employee",
        "Salary"
      ]
    },
    "question": "Write an SQL query to retrieve the employees who have the **highest salary in each department**.\n\n### Table Schema:\n\n**Employee** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |\n| salary | int |\n| departmentId | int |\n\n**Department** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |",
    "hint": "Use a subquery to find MAX(salary) grouped by departmentId, and join it back to Employee and Department.",
    "explanation": "To find the highest earner per department:\n1. Aggregate the max salary per department with `SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId`.\n2. Filter the outer `Employee` rows where the `(departmentId, salary)` tuple matches that subquery.\n3. Join with `Department` to output clean department names.",
    "answer": "SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary\nFROM Employee e\nJOIN Department d ON e.departmentId = d.id\nWHERE (e.departmentId, e.salary) IN (\n  SELECT departmentId, MAX(salary)\n  FROM Employee\n  GROUP BY departmentId\n);",
    "sampleInput": "**Employee** Table:\n| id | name | salary | departmentId |\n| :- | :--- | :----- | :----------- |\n| 1 | Joe | 70000 | 1 |\n| 2 | Jim | 90000 | 1 |\n| 3 | Henry| 80000 | 2 |\n| 4 | Sam | 60000 | 2 |\n\n**Department** Table:\n| id | name |\n| :- | :--- |\n| 1 | IT |\n| 2 | Sales|",
    "sampleOutput": "| Department | Employee | Salary |\n| :--- | :--- | :--- |\n| IT | Jim | 90000 |\n| Sales | Henry | 80000 |",
    "companies": [
      "Google",
      "Meta",
      "Infosys",
      "Wipro"
    ],
    "relatedQuestions": [
      "sql-department-top-three-salaries",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-4",
    "slug": "sql-find-duplicate-emails",
    "title": "Find Duplicate Emails in Table",
    "difficulty": "beginner",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "GROUP BY",
      "HAVING",
      "Duplicates"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Person\n;",
    "progressiveHints": [
      "Group rows by email address.",
      "Count occurrences for each email using COUNT(email).",
      "Filter grouped rows using the HAVING clause to keep emails appearing more than once (> 1)."
    ],
    "optimizedAnswer": "SELECT email AS Email FROM Person GROUP BY email HAVING COUNT(email) > 1;",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "Email"
      ]
    },
    "question": "Write an SQL query to report all the **duplicate emails** in the `Person` table. Note that all emails are in lowercase.\n\n### Table Schema:\n\n**Person** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| email | varchar |",
    "hint": "Use GROUP BY email and filter with HAVING COUNT(email) > 1.",
    "explanation": "Grouping records by `email` consolidates identical addresses into single buckets. We then apply `HAVING COUNT(*) > 1` to retain only email groups that have duplicate occurrences.",
    "answer": "SELECT email AS Email\nFROM Person\nGROUP BY email\nHAVING COUNT(email) > 1;",
    "sampleInput": "**Person** Table:\n| id | email |\n| :- | :---- |\n| 1 | a@b.com |\n| 2 | c@d.com |\n| 3 | a@b.com |",
    "sampleOutput": "| Email |\n| :--- |\n| a@b.com |",
    "companies": [
      "Amazon",
      "Apple",
      "Adobe"
    ],
    "relatedQuestions": [
      "sql-delete-duplicate-emails",
      "sql-find-products-with-zero-sales"
    ]
  },
  {
    "id": "sql-5",
    "slug": "sql-big-countries-filtering",
    "title": "Filter Big Countries by Area and Population",
    "difficulty": "beginner",
    "topic": "SELECT & Filtering",
    "tags": [
      "WHERE",
      "OR",
      "UNION",
      "Indexing"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM World\n;",
    "progressiveHints": [
      "A country is big if its area is at least 3,000,000 km² OR its population is at least 25,000,000.",
      "Select the name, population, and area columns.",
      "Use a WHERE clause with OR, or UNION two SELECT queries for index optimization."
    ],
    "optimizedAnswer": "SELECT name, population, area FROM World WHERE area >= 3000000 UNION SELECT name, population, area FROM World WHERE population >= 25000000;",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "name",
        "population",
        "area"
      ]
    },
    "question": "A country is considered **big** if:\n- It has an area of at least three million (i.e. `3000000 km²`), OR\n- It has a population of at least twenty-five million (i.e. `25000000`).\n\nWrite an SQL query to report the `name`, `population`, and `area` of all big countries.\n\n### Table Schema:\n\n**World** Table:\n| Column Name | Type |\n| :--- | :--- |\n| name | varchar |\n| continent | varchar |\n| area | int |\n| population | int |\n| gdp | bigint |",
    "hint": "Filter using WHERE area >= 3000000 OR population >= 25000000.",
    "explanation": "This query evaluates standard boolean predicate filtering using `OR`. When optimizing on large tables with individual column indexes on `area` and `population`, using `UNION` allows the engine to utilize index seeks on both columns independently.",
    "answer": "SELECT name, population, area\nFROM World\nWHERE area >= 3000000 OR population >= 25000000;",
    "sampleInput": "**World** Table:\n| name | continent | area | population | gdp |\n| :--- | :-------- | :--- | :--------- | :-- |\n| Afghanistan | Asia | 652230 | 25500100 | 20343000000 |\n| Albania | Europe | 28748 | 2831741 | 12960000000 |\n| Algeria | Africa | 2381741 | 37100000 | 188681000000 |",
    "sampleOutput": "| name | population | area |\n| :--- | :--------- | :--- |\n| Afghanistan | 25500100 | 652230 |\n| Algeria | 37100000 | 2381741 |",
    "companies": [
      "Google",
      "Microsoft",
      "Bloomberg"
    ],
    "relatedQuestions": [
      "sql-rising-temperature",
      "sql-find-duplicate-emails"
    ]
  },
  {
    "id": "sql-6",
    "slug": "sql-combine-two-tables-person-address",
    "title": "Combine Two Tables with Optional Addresses",
    "difficulty": "beginner",
    "topic": "JOINs",
    "tags": [
      "LEFT JOIN",
      "Null Values"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Person\n;",
    "progressiveHints": [
      "You need firstName, lastName, city, and state.",
      "Not all persons have an address in the Address table.",
      "A LEFT JOIN preserves every person even if their addressId does not exist in Address."
    ],
    "optimizedAnswer": "SELECT p.firstName, p.lastName, a.city, a.state FROM Person p LEFT JOIN Address a ON p.id = a.personId;",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "firstName",
        "lastName",
        "city",
        "state"
      ]
    },
    "question": "Write an SQL query to report the `firstName`, `lastName`, `city`, and `state` of each person in the `Person` table. If the address of a `personId` is not present in the `Address` table, report `null` instead.\n\n### Table Schema:\n\n**Person** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| lastName | varchar |\n| firstName | varchar |\n\n**Address** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| personId | int |\n| city | varchar |\n| state | varchar |",
    "hint": "Use a LEFT JOIN from Person to Address matching on Person.id = Address.personId.",
    "explanation": "A LEFT JOIN from `Person` to `Address` guarantees all rows from `Person` are present. For persons without an address record, SQLite/MySQL populates `city` and `state` with `NULL`.",
    "answer": "SELECT p.firstName, p.lastName, a.city, a.state\nFROM Person p\nLEFT JOIN Address a ON p.id = a.personId;",
    "sampleInput": "**Person** Table:\n| id | lastName | firstName |\n| :- | :------- | :-------- |\n| 1 | Wang | Allen |\n| 2 | Alice | Bob |\n\n**Address** Table:\n| id | personId | city | state |\n| :- | :------- | :--- | :---- |\n| 1 | 2 | New York City | New York |",
    "sampleOutput": "| firstName | lastName | city | state |\n| :-------- | :------- | :--- | :---- |\n| Allen | Wang | null | null |\n| Bob | Alice | New York City | New York |",
    "companies": [
      "Apple",
      "Amazon",
      "Facebook"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-employees-earning-more-than-managers"
    ]
  },
  {
    "id": "sql-7",
    "slug": "sql-employees-earning-more-than-managers",
    "title": "Employees Earning More Than Their Managers",
    "difficulty": "beginner",
    "topic": "JOINs",
    "tags": [
      "Self JOIN",
      "Comparison"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Employee\n;",
    "progressiveHints": [
      "An employee table contains both the employee and their manager.",
      "Perform a Self JOIN on Employee: JOIN Employee e ON e.managerId = m.id.",
      "Compare e.salary > m.salary in the WHERE clause and return e.name as Employee."
    ],
    "optimizedAnswer": "SELECT e.name AS Employee FROM Employee e JOIN Employee m ON e.managerId = m.id WHERE e.salary > m.salary;",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "Employee"
      ]
    },
    "question": "Write an SQL query to find the employees who earn **more than their direct managers**.\n\n### Table Schema:\n\n**Employee** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |\n| salary | int |\n| managerId | int |",
    "hint": "Self-join the Employee table alias e to alias m on e.managerId = m.id, then filter WHERE e.salary > m.salary.",
    "explanation": "By self-joining `Employee e` (the worker) with `Employee m` (their manager) where `e.managerId = m.id`, each worker row is paired with their respective manager. We then filter `WHERE e.salary > m.salary`.",
    "answer": "SELECT e.name AS Employee\nFROM Employee e\nJOIN Employee m ON e.managerId = m.id\nWHERE e.salary > m.salary;",
    "sampleInput": "**Employee** Table:\n| id | name | salary | managerId |\n| :- | :--- | :----- | :-------- |\n| 1 | Joe | 70000 | 3 |\n| 2 | Henry| 80000 | 4 |\n| 3 | Sam | 60000 | NULL |\n| 4 | Max | 90000 | NULL |",
    "sampleOutput": "| Employee |\n| :--- |\n| Joe |",
    "companies": [
      "Amazon",
      "Google",
      "Salesforce"
    ],
    "relatedQuestions": [
      "sql-rising-temperature",
      "sql-group-by-department-salary"
    ]
  },
  {
    "id": "sql-8",
    "slug": "sql-rising-temperature",
    "title": "Find Dates with Rising Temperature",
    "difficulty": "beginner",
    "topic": "JOINs",
    "tags": [
      "Self JOIN",
      "Date Functions"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Weather\n;",
    "progressiveHints": [
      "Join the Weather table with itself to compare today with yesterday.",
      "Use date arithmetic: in SQLite, date(w1.recordDate, \"-1 day\") = w2.recordDate or julianday(w1.recordDate) - julianday(w2.recordDate) = 1.",
      "Filter for w1.temperature > w2.temperature and select w1.id."
    ],
    "optimizedAnswer": "SELECT w1.id FROM Weather w1 JOIN Weather w2 ON julianday(w1.recordDate) - julianday(w2.recordDate) = 1 WHERE w1.temperature > w2.temperature;",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "id"
      ]
    },
    "question": "Write an SQL query to find all dates `id` with **higher temperatures compared to its previous dates (yesterday)**.\n\n### Table Schema:\n\n**Weather** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| recordDate | date |\n| temperature | int |",
    "hint": "Self-join Weather w1 with Weather w2 where w1.recordDate is 1 day after w2.recordDate and w1.temperature > w2.temperature.",
    "explanation": "We join `Weather w1` (current day) with `Weather w2` (previous day). In standard SQL, we match `DATEDIFF(w1.recordDate, w2.recordDate) = 1` (or `julianday(w1.recordDate) - julianday(w2.recordDate) = 1` in SQLite) and assert `w1.temperature > w2.temperature`.",
    "answer": "SELECT w1.id\nFROM Weather w1\nJOIN Weather w2 ON julianday(w1.recordDate) - julianday(w2.recordDate) = 1\nWHERE w1.temperature > w2.temperature;",
    "sampleInput": "**Weather** Table:\n| id | recordDate | temperature |\n| :- | :--------- | :---------- |\n| 1 | 2026-01-01 | 10 |\n| 2 | 2026-01-02 | 25 |\n| 3 | 2026-01-03 | 20 |\n| 4 | 2026-01-04 | 30 |",
    "sampleOutput": "| id |\n| :- |\n| 2 |\n| 4 |",
    "companies": [
      "Twitter",
      "Bloomberg",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-consecutive-numbers-occurrences",
      "sql-employees-earning-more-than-managers"
    ]
  },
  {
    "id": "sql-9",
    "slug": "sql-customer-largest-number-of-orders",
    "title": "Customer Placing Largest Number of Orders",
    "difficulty": "beginner",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "COUNT",
      "ORDER BY",
      "LIMIT"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Orders\n;",
    "progressiveHints": [
      "Group orders by customerId using GROUP BY customerId.",
      "Count total orders for each customer with COUNT(*).",
      "Sort by the count in descending order and limit to the top 1 result."
    ],
    "optimizedAnswer": "SELECT customerId FROM Orders GROUP BY customerId ORDER BY COUNT(*) DESC LIMIT 1;",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "customerId"
      ]
    },
    "question": "Write an SQL query to find the `customerId` of the customer who has placed the **largest number of orders**.\n\n### Table Schema:\n\n**Orders** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| customerId | int |",
    "hint": "Use GROUP BY customerId, ORDER BY COUNT(*) DESC, and LIMIT 1.",
    "explanation": "Grouping by `customerId` allows `COUNT(*)` to calculate order volume per customer. Ordering descending and taking `LIMIT 1` yields the top customer.",
    "answer": "SELECT customerId\nFROM Orders\nGROUP BY customerId\nORDER BY COUNT(*) DESC\nLIMIT 1;",
    "sampleInput": "**Orders** Table:\n| id | customerId |\n| :- | :--------- |\n| 1 | 1 |\n| 2 | 2 |\n| 3 | 3 |\n| 4 | 3 |",
    "sampleOutput": "| customerId |\n| :--------- |\n| 3 |",
    "companies": [
      "Amazon",
      "Flipkart",
      "Shopify"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-top-travellers-distance-sum"
    ]
  },
  {
    "id": "sql-10",
    "slug": "sql-game-play-analysis-first-login",
    "title": "Game Play Analysis I: First Login Date",
    "difficulty": "beginner",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "MIN",
      "GROUP BY",
      "Dates"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Activity\n;",
    "progressiveHints": [
      "Each player has multiple rows representing login activity dates.",
      "We need each unique player_id and their earliest event_date.",
      "Use GROUP BY player_id and MIN(event_date) as first_login."
    ],
    "optimizedAnswer": "SELECT player_id, MIN(event_date) AS first_login FROM Activity GROUP BY player_id;",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "player_id",
        "first_login"
      ]
    },
    "question": "Write an SQL query to report the **first login date** for each player.\n\n### Table Schema:\n\n**Activity** Table:\n| Column Name | Type |\n| :--- | :--- |\n| player_id | int |\n| device_id | int |\n| event_date | date |\n| games_played | int |",
    "hint": "Group by player_id and select MIN(event_date) AS first_login.",
    "explanation": "Applying `MIN(event_date)` grouped by `player_id` extracts the earliest calendar timestamp recorded for each player.",
    "answer": "SELECT player_id, MIN(event_date) AS first_login\nFROM Activity\nGROUP BY player_id;",
    "sampleInput": "**Activity** Table:\n| player_id | device_id | event_date | games_played |\n| :-------- | :-------- | :--------- | :----------- |\n| 1 | 2 | 2026-03-01 | 5 |\n| 1 | 2 | 2026-05-02 | 6 |\n| 2 | 3 | 2026-06-25 | 1 |\n| 3 | 1 | 2026-03-02 | 0 |\n| 3 | 4 | 2026-07-03 | 5 |",
    "sampleOutput": "| player_id | first_login |\n| :-------- | :---------- |\n| 1 | 2026-03-01 |\n| 2 | 2026-06-25 |\n| 3 | 2026-03-02 |",
    "companies": [
      "Epic Games",
      "Riot Games",
      "EA"
    ],
    "relatedQuestions": [
      "sql-game-play-analysis-retention-rate",
      "sql-user-activity-past-30-days"
    ]
  },
  {
    "id": "sql-11",
    "slug": "sql-not-boring-movies",
    "title": "Filter Not Boring Movies with Odd IDs",
    "difficulty": "beginner",
    "topic": "SELECT & Filtering",
    "tags": [
      "MOD",
      "WHERE",
      "ORDER BY"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Cinema\n;",
    "progressiveHints": [
      "Filter for movies with odd-numbered IDs: id % 2 = 1 or MOD(id, 2) = 1.",
      "Exclude movies with description equal to \"boring\".",
      "Order the results by rating in descending order."
    ],
    "optimizedAnswer": "SELECT id, movie, description, rating FROM Cinema WHERE id % 2 != 0 AND description <> 'boring' ORDER BY rating DESC;",
    "validationRules": {
      "ignoreOrder": false,
      "matchColumns": [
        "id",
        "movie",
        "description",
        "rating"
      ]
    },
    "question": "Write an SQL query to report the movies with an **odd-numbered ID** and a description that is **not \"boring\"**. Return the result table ordered by `rating` in **descending order**.\n\n### Table Schema:\n\n**Cinema** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| movie | varchar |\n| description | varchar |\n| rating | float |",
    "hint": "Use WHERE id % 2 = 1 AND description != \"boring\" ORDER BY rating DESC.",
    "explanation": "The modulo operator `id % 2 = 1` tests for odd identifiers. Combining with `description != 'boring'` and sorting by `rating DESC` satisfies all conditions.",
    "answer": "SELECT id, movie, description, rating\nFROM Cinema\nWHERE id % 2 = 1 AND description != 'boring'\nORDER BY rating DESC;",
    "sampleInput": "**Cinema** Table:\n| id | movie | description | rating |\n| :- | :---- | :---------- | :----- |\n| 1 | War | great 3D | 8.9 |\n| 2 | Science | fiction | 8.5 |\n| 3 | Irish | boring | 6.2 |\n| 4 | Ice song| Fantacy | 8.6 |\n| 5 | House card | Interesting| 9.1 |",
    "sampleOutput": "| id | movie | description | rating |\n| :- | :---- | :---------- | :----- |\n| 5 | House card | Interesting| 9.1 |\n| 1 | War | great 3D | 8.9 |",
    "companies": [
      "Netflix",
      "Hulu",
      "Amazon Prime"
    ],
    "relatedQuestions": [
      "sql-big-countries-filtering",
      "sql-movie-rating-analysis"
    ]
  },
  {
    "id": "sql-12",
    "slug": "sql-find-products-with-zero-sales",
    "title": "Find Inactive Products with Zero Orders",
    "difficulty": "beginner",
    "topic": "JOINs",
    "tags": [
      "LEFT JOIN",
      "Null Filtering",
      "Anti-Join"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Products\n;",
    "progressiveHints": [
      "Select products from Products table.",
      "LEFT JOIN with OrderItems on Products.id = OrderItems.productId.",
      "Filter where OrderItems.productId IS NULL to find unsold items."
    ],
    "optimizedAnswer": "SELECT p.id, p.name FROM Products p WHERE NOT EXISTS (SELECT 1 FROM OrderItems oi WHERE oi.productId = p.id);",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "id",
        "name"
      ]
    },
    "question": "Write an SQL query to find all products (`id`, `name`) that have **never been ordered** in any transaction.\n\n### Table Schema:\n\n**Products** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |\n| price | int |\n\n**OrderItems** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| orderId | int |\n| productId | int |\n| quantity | int |",
    "hint": "Use a LEFT JOIN between Products and OrderItems and filter for NULL productId on OrderItems.",
    "explanation": "An anti-join pattern via `LEFT JOIN ... WHERE OrderItems.productId IS NULL` retrieves catalog items with zero order history.",
    "answer": "SELECT p.id, p.name\nFROM Products p\nLEFT JOIN OrderItems oi ON p.id = oi.productId\nWHERE oi.productId IS NULL;",
    "sampleInput": "**Products** Table:\n| id | name | price |\n| :- | :--- | :---- |\n| 1 | Keyboard | 4500 |\n| 2 | Mouse | 1200 |\n| 3 | Monitor | 15000 |\n\n**OrderItems** Table:\n| id | orderId | productId | quantity |\n| :- | :------ | :-------- | :------- |\n| 1 | 101 | 1 | 1 |\n| 2 | 102 | 2 | 2 |",
    "sampleOutput": "| id | name |\n| :- | :--- |\n| 3 | Monitor |",
    "companies": [
      "Flipkart",
      "Walmart",
      "Target"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-top-5-most-expensive-products"
    ]
  },
  {
    "id": "sql-13",
    "slug": "sql-total-order-value-per-customer",
    "title": "Calculate Total Spent per Customer",
    "difficulty": "beginner",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "SUM",
      "JOIN",
      "GROUP BY",
      "COALESCE"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Customers\n;",
    "progressiveHints": [
      "Join Customers with Orders.",
      "Group by customer id and customer name.",
      "Sum the order amounts with SUM(o.amount) and use COALESCE to handle customers with no orders."
    ],
    "optimizedAnswer": "SELECT c.id, c.name, COALESCE(SUM(o.amount), 0) AS total_spent FROM Customers c LEFT JOIN Orders o ON c.id = o.customerId GROUP BY c.id, c.name;",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "id",
        "name",
        "total_spent"
      ]
    },
    "question": "Write an SQL query to calculate the **total amount spent** (`total_spent`) by each customer. If a customer has placed no orders, output `0`.\n\n### Table Schema:\n\n**Customers** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |\n\n**Orders** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| customerId | int |\n| amount | int |",
    "hint": "Use a LEFT JOIN, GROUP BY c.id, c.name, and COALESCE(SUM(o.amount), 0) AS total_spent.",
    "explanation": "Joining Customers with Orders via LEFT JOIN retains non-ordering customers. Applying `COALESCE(SUM(o.amount), 0)` turns NULL sum aggregates into a clean 0 balance.",
    "answer": "SELECT c.id, c.name, COALESCE(SUM(o.amount), 0) AS total_spent\nFROM Customers c\nLEFT JOIN Orders o ON c.id = o.customerId\nGROUP BY c.id, c.name;",
    "sampleInput": "**Customers** Table:\n| id | name |\n| :- | :--- |\n| 1 | Alice|\n| 2 | Bob |\n| 3 | Charlie|\n\n**Orders** Table:\n| id | customerId | amount |\n| :- | :--------- | :----- |\n| 1 | 1 | 500 |\n| 2 | 1 | 300 |\n| 3 | 2 | 150 |",
    "sampleOutput": "| id | name | total_spent |\n| :- | :--- | :---------- |\n| 1 | Alice| 800 |\n| 2 | Bob | 150 |\n| 3 | Charlie| 0 |",
    "companies": [
      "Stripe",
      "PayPal",
      "Square"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-top-travellers-distance-sum"
    ]
  },
  {
    "id": "sql-14",
    "slug": "sql-employees-without-department",
    "title": "Find Employees Without an Assigned Department",
    "difficulty": "beginner",
    "topic": "SELECT & Filtering",
    "tags": [
      "IS NULL",
      "WHERE"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Employee\n;",
    "progressiveHints": [
      "Select employee id and name.",
      "Filter for records where departmentId is missing using IS NULL."
    ],
    "optimizedAnswer": "SELECT id, name FROM Employee WHERE departmentId IS NULL;",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "id",
        "name"
      ]
    },
    "question": "Write an SQL query to find all employees (`id`, `name`) who **have not been assigned to any department** (`departmentId` is NULL).\n\n### Table Schema:\n\n**Employee** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |\n| departmentId | int |",
    "hint": "Filter using WHERE departmentId IS NULL.",
    "explanation": "In SQL, NULL represents missing information and must be checked using `IS NULL` rather than `= NULL`.",
    "answer": "SELECT id, name\nFROM Employee\nWHERE departmentId IS NULL;",
    "sampleInput": "**Employee** Table:\n| id | name | departmentId |\n| :- | :--- | :----------- |\n| 1 | Mark | 1 |\n| 2 | Sarah| NULL |\n| 3 | Dave | 2 |",
    "sampleOutput": "| id | name |\n| :- | :--- |\n| 2 | Sarah|",
    "companies": [
      "Oracle",
      "IBM",
      "Cisco"
    ],
    "relatedQuestions": [
      "sql-combine-two-tables-person-address",
      "sql-left-join-customers-without-orders"
    ]
  },
  {
    "id": "sql-15",
    "slug": "sql-top-5-most-expensive-products",
    "title": "List Top 5 Most Expensive Products",
    "difficulty": "beginner",
    "topic": "SELECT & Filtering",
    "tags": [
      "ORDER BY",
      "LIMIT"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Products\n;",
    "progressiveHints": [
      "Select name and price from Products table.",
      "Order by price descending.",
      "Limit the result set to 5 records."
    ],
    "optimizedAnswer": "SELECT name, price FROM Products ORDER BY price DESC LIMIT 5;",
    "validationRules": {
      "ignoreOrder": false,
      "matchColumns": [
        "name",
        "price"
      ]
    },
    "question": "Write an SQL query to retrieve the `name` and `price` of the **top 5 most expensive products**, ordered by `price` in descending order.\n\n### Table Schema:\n\n**Products** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |\n| price | int |",
    "hint": "Use ORDER BY price DESC LIMIT 5.",
    "explanation": "Ordering by `price DESC` places the highest numbers at the top, and `LIMIT 5` slices the first 5 records.",
    "answer": "SELECT name, price\nFROM Products\nORDER BY price DESC\nLIMIT 5;",
    "sampleInput": "**Products** Table:\n| id | name | price |\n| :- | :--- | :---- |\n| 1 | Phone | 80000 |\n| 2 | Laptop | 120000|\n| 3 | TV | 65000 |\n| 4 | Cable | 500 |\n| 5 | Watch | 25000 |\n| 6 | Tablet | 45000 |",
    "sampleOutput": "| name | price |\n| :--- | :---- |\n| Laptop | 120000|\n| Phone | 80000 |\n| TV | 65000 |\n| Tablet | 45000 |\n| Watch | 25000 |",
    "companies": [
      "Amazon",
      "BestBuy"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-find-products-with-zero-sales"
    ]
  },
  {
    "id": "sql-16",
    "slug": "sql-average-salary-per-department",
    "title": "Calculate Average Salary per Department",
    "difficulty": "beginner",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "AVG",
      "ROUND",
      "GROUP BY",
      "JOIN"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Employee\n;",
    "progressiveHints": [
      "Join Employee with Department.",
      "Group by Department name.",
      "Compute ROUND(AVG(salary), 2) as avg_salary."
    ],
    "optimizedAnswer": "SELECT d.name AS department_name, ROUND(AVG(e.salary), 2) AS avg_salary FROM Employee e JOIN Department d ON e.departmentId = d.id GROUP BY d.id, d.name;",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "department_name",
        "avg_salary"
      ]
    },
    "question": "Write an SQL query to calculate the **average salary** (`avg_salary`) rounded to 2 decimal places for each department. Output the department name and average salary.\n\n### Table Schema:\n\n**Employee** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |\n| salary | int |\n| departmentId | int |\n\n**Department** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |",
    "hint": "Join Employee and Department on departmentId = id, group by department name, and compute ROUND(AVG(salary), 2).",
    "explanation": "Joining on the foreign key and aggregating with `AVG(e.salary)` calculates arithmetic mean compensation per department division.",
    "answer": "SELECT d.name AS department_name, ROUND(AVG(e.salary), 2) AS avg_salary\nFROM Employee e\nJOIN Department d ON e.departmentId = d.id\nGROUP BY d.name;",
    "sampleInput": "**Employee** Table:\n| id | name | salary | departmentId |\n| :- | :--- | :----- | :----------- |\n| 1 | Alice | 60000 | 1 |\n| 2 | Bob | 80000 | 1 |\n| 3 | Carol | 75000 | 2 |\n\n**Department** Table:\n| id | name |\n| :- | :--- |\n| 1 | Engineering |\n| 2 | HR |",
    "sampleOutput": "| department_name | avg_salary |\n| :-------------- | :--------- |\n| Engineering | 70000.0 |\n| HR | 75000.0 |",
    "companies": [
      "LinkedIn",
      "Dell",
      "HP"
    ],
    "relatedQuestions": [
      "sql-group-by-department-salary",
      "sql-average-salary-departments-vs-company"
    ]
  },
  {
    "id": "sql-17",
    "slug": "sql-products-priced-above-average",
    "title": "Find Products Priced Above Average",
    "difficulty": "beginner",
    "topic": "Subqueries",
    "tags": [
      "Subquery",
      "Scalar Subquery",
      "AVG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Products\n;",
    "progressiveHints": [
      "Write a subquery to find the average product price: (SELECT AVG(price) FROM Products).",
      "Filter the outer Products query WHERE price > that subquery value."
    ],
    "optimizedAnswer": "SELECT name, price FROM Products WHERE price > (SELECT AVG(price) FROM Products);",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "name",
        "price"
      ]
    },
    "question": "Write an SQL query to find all products (`name`, `price`) whose price is **strictly greater than the average price** of all products.\n\n### Table Schema:\n\n**Products** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |\n| price | int |",
    "hint": "Use WHERE price > (SELECT AVG(price) FROM Products).",
    "explanation": "A scalar subquery evaluates `AVG(price)` once, and the outer query filters records with prices exceeding that threshold.",
    "answer": "SELECT name, price\nFROM Products\nWHERE price > (SELECT AVG(price) FROM Products);",
    "sampleInput": "**Products** Table:\n| id | name | price |\n| :- | :--- | :---- |\n| 1 | Book | 200 |\n| 2 | Pen | 50 |\n| 3 | Bag | 1000 |\n| 4 | Bottle | 350 |",
    "sampleOutput": "| name | price |\n| :--- | :---- |\n| Bag | 1000 |",
    "companies": [
      "eBay",
      "Shopify"
    ],
    "relatedQuestions": [
      "sql-top-5-most-expensive-products",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-18",
    "slug": "sql-count-active-users-by-country",
    "title": "Count Active Users by Country",
    "difficulty": "beginner",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "COUNT",
      "GROUP BY",
      "WHERE"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Users\n;",
    "progressiveHints": [
      "Filter for active users WHERE status = \"active\".",
      "Group by country.",
      "Count the number of users per country with COUNT(*)."
    ],
    "optimizedAnswer": "SELECT country, COUNT(*) AS user_count FROM Users WHERE status = 'active' GROUP BY country ORDER BY user_count DESC;",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "country",
        "user_count"
      ]
    },
    "question": "Write an SQL query to count the number of **active users** (`user_count`) in each country. Only include users where `status = 'active'`.\n\n### Table Schema:\n\n**Users** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |\n| country | varchar |\n| status | varchar |",
    "hint": "Filter WHERE status = \"active\" and GROUP BY country.",
    "explanation": "The WHERE clause eliminates inactive users before the GROUP BY phase, guaranteeing accurate partition counts.",
    "answer": "SELECT country, COUNT(*) AS user_count\nFROM Users\nWHERE status = 'active'\nGROUP BY country;",
    "sampleInput": "**Users** Table:\n| id | name | country | status |\n| :- | :--- | :------ | :----- |\n| 1 | Joe | USA | active |\n| 2 | Raj | India | active |\n| 3 | Priya | India | active |\n| 4 | John | USA | banned |",
    "sampleOutput": "| country | user_count |\n| :------ | :--------- |\n| India | 2 |\n| USA | 1 |",
    "companies": [
      "Meta",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-total-order-value-per-customer",
      "sql-find-customers-who-never-placed-orders"
    ]
  },
  {
    "id": "sql-19",
    "slug": "sql-find-employees-starting-with-j",
    "title": "Find Employees with Names Starting with \"J\"",
    "difficulty": "beginner",
    "topic": "SELECT & Filtering",
    "tags": [
      "LIKE",
      "Wildcards"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Employee\n;",
    "progressiveHints": [
      "Use the LIKE operator with the percent wildcard (%).",
      "WHERE name LIKE \"J%\" matches any string beginning with J."
    ],
    "optimizedAnswer": "SELECT id, name FROM Employee WHERE name LIKE 'J%';",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "id",
        "name"
      ]
    },
    "question": "Write an SQL query to find all employees (`id`, `name`) whose name **starts with the letter 'J'**.\n\n### Table Schema:\n\n**Employee** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |",
    "hint": "Filter using WHERE name LIKE \"J%\".",
    "explanation": "The pattern `'J%'` matches strings beginning with 'J' followed by any sequence of zero or more characters.",
    "answer": "SELECT id, name\nFROM Employee\nWHERE name LIKE 'J%';",
    "sampleInput": "**Employee** Table:\n| id | name |\n| :- | :--- |\n| 1 | Joe |\n| 2 | Jim |\n| 3 | Alice |\n| 4 | Jack |",
    "sampleOutput": "| id | name |\n| :- | :--- |\n| 1 | Joe |\n| 2 | Jim |\n| 4 | Jack |",
    "companies": [
      "Microsoft",
      "Adobe"
    ],
    "relatedQuestions": [
      "sql-big-countries-filtering",
      "sql-fix-names-in-table"
    ]
  },
  {
    "id": "sql-20",
    "slug": "sql-orders-between-two-dates",
    "title": "Filter Orders in Specific Date Range",
    "difficulty": "beginner",
    "topic": "SELECT & Filtering",
    "tags": [
      "BETWEEN",
      "Dates",
      "WHERE"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Orders\n;",
    "progressiveHints": [
      "Filter for orders created between 2026-01-01 and 2026-06-30.",
      "Use the BETWEEN operator: WHERE orderDate BETWEEN \"2026-01-01\" AND \"2026-06-30\"."
    ],
    "optimizedAnswer": "SELECT id, customerId, amount, orderDate FROM Orders WHERE orderDate BETWEEN '2026-01-01' AND '2026-06-30';",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "id",
        "customerId",
        "amount",
        "orderDate"
      ]
    },
    "question": "Write an SQL query to retrieve all orders placed between **January 1, 2026 and June 30, 2026** (inclusive).\n\n### Table Schema:\n\n**Orders** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| customerId | int |\n| amount | int |\n| orderDate | date |",
    "hint": "Use WHERE orderDate BETWEEN \"2026-01-01\" AND \"2026-06-30\".",
    "explanation": "`BETWEEN 'start' AND 'end'` evaluates inclusive boundary intervals across standard ISO-8601 date representations.",
    "answer": "SELECT id, customerId, amount, orderDate\nFROM Orders\nWHERE orderDate BETWEEN '2026-01-01' AND '2026-06-30';",
    "sampleInput": "**Orders** Table:\n| id | customerId | amount | orderDate |\n| :- | :--------- | :----- | :-------- |\n| 1 | 1 | 500 | 2026-02-15 |\n| 2 | 2 | 300 | 2026-07-20 |\n| 3 | 3 | 450 | 2026-05-10 |",
    "sampleOutput": "| id | customerId | amount | orderDate |\n| :- | :--------- | :----- | :-------- |\n| 1 | 1 | 500 | 2026-02-15 |\n| 3 | 3 | 450 | 2026-05-10 |",
    "companies": [
      "Amazon",
      "Walmart"
    ],
    "relatedQuestions": [
      "sql-user-activity-past-30-days",
      "sql-rising-temperature"
    ]
  },
  {
    "id": "sql-21",
    "slug": "sql-count-products-per-category",
    "title": "Count Total Products per Category",
    "difficulty": "beginner",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "COUNT",
      "GROUP BY",
      "HAVING"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Products\n;",
    "progressiveHints": [
      "Group records by category.",
      "Count product rows with COUNT(*) AS product_count.",
      "Order by category alphabetically."
    ],
    "optimizedAnswer": "SELECT category, COUNT(*) AS product_count FROM Products GROUP BY category ORDER BY category ASC;",
    "validationRules": {
      "ignoreOrder": false,
      "matchColumns": [
        "category",
        "product_count"
      ]
    },
    "question": "Write an SQL query to report the number of products (`product_count`) in each `category`, ordered by category name ascending.\n\n### Table Schema:\n\n**Products** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |\n| category | varchar |\n| price | int |",
    "hint": "Use GROUP BY category ORDER BY category ASC.",
    "explanation": "Grouping by category partitions the dataset into distinct product types and tallies the total items in each bucket.",
    "answer": "SELECT category, COUNT(*) AS product_count\nFROM Products\nGROUP BY category\nORDER BY category ASC;",
    "sampleInput": "**Products** Table:\n| id | name | category | price |\n| :- | :--- | :------- | :---- |\n| 1 | Laptop | Electronics | 80000 |\n| 2 | Mouse | Electronics | 1500 |\n| 3 | Shirt | Apparel | 1200 |",
    "sampleOutput": "| category | product_count |\n| :------- | :------------ |\n| Apparel | 1 |\n| Electronics | 2 |",
    "companies": [
      "Target",
      "Costco"
    ],
    "relatedQuestions": [
      "sql-find-products-with-zero-sales",
      "sql-total-revenue-by-category"
    ]
  },
  {
    "id": "sql-22",
    "slug": "sql-total-revenue-by-category",
    "title": "Calculate Total Sales Revenue by Category",
    "difficulty": "beginner",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "SUM",
      "JOIN",
      "GROUP BY"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Products\n;",
    "progressiveHints": [
      "Join Products with OrderItems on Products.id = OrderItems.productId.",
      "Multiply quantity by price for each sale: oi.quantity * p.price.",
      "Group by p.category and sum the line total."
    ],
    "optimizedAnswer": "SELECT p.category, SUM(oi.quantity * p.price) AS total_revenue FROM Products p JOIN OrderItems oi ON p.id = oi.productId GROUP BY p.category ORDER BY total_revenue DESC;",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "category",
        "total_revenue"
      ]
    },
    "question": "Write an SQL query to calculate the **total sales revenue** (`total_revenue`) generated by each product `category`.\n\n### Table Schema:\n\n**Products** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| category | varchar |\n| price | int |\n\n**OrderItems** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| productId | int |\n| quantity | int |",
    "hint": "Join Products and OrderItems, group by category, and select SUM(quantity * price).",
    "explanation": "Multiplying item unit price by sold units computes item gross, and summing by category produces category revenue totals.",
    "answer": "SELECT p.category, SUM(oi.quantity * p.price) AS total_revenue\nFROM Products p\nJOIN OrderItems oi ON p.id = oi.productId\nGROUP BY p.category;",
    "sampleInput": "**Products** Table:\n| id | category | price |\n| :- | :------- | :---- |\n| 1 | Tech | 1000 |\n| 2 | Tech | 500 |\n| 3 | Home | 200 |\n\n**OrderItems** Table:\n| id | productId | quantity |\n| :- | :-------- | :------- |\n| 1 | 1 | 2 |\n| 2 | 2 | 1 |\n| 3 | 3 | 4 |",
    "sampleOutput": "| category | total_revenue |\n| :------- | :------------ |\n| Tech | 2500 |\n| Home | 800 |",
    "companies": [
      "Amazon",
      "Flipkart"
    ],
    "relatedQuestions": [
      "sql-count-products-per-category",
      "sql-total-order-value-per-customer"
    ]
  },
  {
    "id": "sql-23",
    "slug": "sql-delete-duplicate-emails",
    "title": "Delete Duplicate Emails Keeping Smallest ID",
    "difficulty": "beginner",
    "topic": "Data Integrity & DML",
    "tags": [
      "DELETE",
      "Self JOIN",
      "Duplicates"
    ],
    "starterCode": "-- Write your SQL statement here\nDELETE \nFROM Person\n;",
    "progressiveHints": [
      "We need to delete records from Person table that have duplicate emails.",
      "Join Person p1 with Person p2 on p1.email = p2.email.",
      "Keep the smallest id by checking WHERE p1.id > p2.id."
    ],
    "optimizedAnswer": "DELETE FROM Person WHERE id NOT IN (SELECT MIN(id) FROM Person GROUP BY email);",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Write an SQL query to **delete all duplicate emails**, keeping only one unique email with the **smallest `id`**.\n\n### Table Schema:\n\n**Person** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| email | varchar |",
    "hint": "Use DELETE p1 FROM Person p1, Person p2 WHERE p1.email = p2.email AND p1.id > p2.id.",
    "explanation": "By comparing `p1` and `p2` on equal emails with `p1.id > p2.id`, `p1` targets all duplicate rows except the earliest (minimum) ID instance.",
    "answer": "DELETE FROM Person\nWHERE id IN (\n  SELECT p1.id\n  FROM Person p1\n  JOIN Person p2 ON p1.email = p2.email AND p1.id > p2.id\n);",
    "sampleInput": "**Person** Table:\n| id | email |\n| :- | :---- |\n| 1 | john@example.com |\n| 2 | bob@example.com |\n| 3 | john@example.com |",
    "sampleOutput": "**Person** Table after deletion:\n| id | email |\n| :- | :---- |\n| 1 | john@example.com |\n| 2 | bob@example.com |",
    "companies": [
      "Uber",
      "Amazon",
      "Apple"
    ],
    "relatedQuestions": [
      "sql-find-duplicate-emails",
      "sql-fix-names-in-table"
    ]
  },
  {
    "id": "sql-24",
    "slug": "sql-find-customers-referee",
    "title": "Find Customers Not Referred by Specific ID",
    "difficulty": "beginner",
    "topic": "SELECT & Filtering",
    "tags": [
      "NULL Handling",
      "WHERE",
      "OR"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Customer\n;",
    "progressiveHints": [
      "We need customers who are NOT referred by referee_id = 2.",
      "Remember that in SQL, NULL != 2 evaluates to UNKNOWN (not TRUE).",
      "Filter with WHERE referee_id != 2 OR referee_id IS NULL (or COALESCE)."
    ],
    "optimizedAnswer": "SELECT name FROM Customer WHERE referee_id != 2 OR referee_id IS NULL;",
    "validationRules": {
      "ignoreOrder": true,
      "matchColumns": [
        "name"
      ]
    },
    "question": "Write an SQL query to report the names of the customer that are **not referred by the customer with `id = 2`**.\n\n### Table Schema:\n\n**Customer** Table:\n| Column Name | Type |\n| :--- | :--- |\n| id | int |\n| name | varchar |\n| referee_id | int |",
    "hint": "Account for NULL referee_id using WHERE referee_id != 2 OR referee_id IS NULL.",
    "explanation": "Three-valued logic in SQL means comparisons with NULL yield UNKNOWN. To include customers with no referee, explicitly check `OR referee_id IS NULL`.",
    "answer": "SELECT name\nFROM Customer\nWHERE referee_id != 2 OR referee_id IS NULL;",
    "sampleInput": "**Customer** Table:\n| id | name | referee_id |\n| :- | :--- | :--------- |\n| 1 | Will | NULL |\n| 2 | Jane | NULL |\n| 3 | Alex | 2 |\n| 4 | Bill | NULL |\n| 5 | Zack | 1 |\n| 6 | Mark | 2 |",
    "sampleOutput": "| name |\n| :--- |\n| Will |\n| Jane |\n| Bill |\n| Zack |",
    "companies": [
      "Google",
      "Bloomberg"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-big-countries-filtering"
    ]
  },
  {
    "id": "sql-25",
    "slug": "sql-article-views-authors",
    "title": "Find Authors Who Viewed Their Own Articles",
    "difficulty": "beginner",
    "topic": "SELECT & Filtering",
    "tags": [
      "DISTINCT",
      "WHERE",
      "ORDER BY"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \nFROM Views\n;",
    "progressiveHints": [
      "Compare author_id with viewer_id in the WHERE clause.",
      "Use DISTINCT to avoid duplicate author IDs.",
      "Sort by id ascending."
    ],
    "optimizedAnswer": "SELECT DISTINCT author_id AS id FROM Views WHERE author_id = viewer_id ORDER BY id ASC;",
    "validationRules": {
      "ignoreOrder": false,
      "matchColumns": [
        "id"
      ]
    },
    "question": "Write an SQL query to find all the authors that **viewed at least one of their own articles**. Return the result table sorted by `id` in **ascending order**.\n\n### Table Schema:\n\n**Views** Table:\n| Column Name | Type |\n| :--- | :--- |\n| article_id | int |\n| author_id | int |\n| viewer_id | int |\n| view_date | date |",
    "hint": "Use SELECT DISTINCT author_id AS id WHERE author_id = viewer_id ORDER BY id ASC.",
    "explanation": "Filtering on `author_id = viewer_id` isolates self-views, and `DISTINCT` ensures each author appears only once in the ascending output list.",
    "answer": "SELECT DISTINCT author_id AS id\nFROM Views\nWHERE author_id = viewer_id\nORDER BY id ASC;",
    "sampleInput": "**Views** Table:\n| article_id | author_id | viewer_id | view_date |\n| :--------- | :-------- | :-------- | :-------- |\n| 1 | 3 | 5 | 2026-08-01 |\n| 2 | 7 | 7 | 2026-08-01 |\n| 2 | 7 | 6 | 2026-08-02 |\n| 4 | 7 | 7 | 2026-07-22 |",
    "sampleOutput": "| id |\n| :- |\n| 7 |",
    "companies": [
      "LinkedIn",
      "Medium",
      "Substack"
    ],
    "relatedQuestions": [
      "sql-find-duplicate-emails",
      "sql-customer-largest-number-of-orders"
    ]
  },
  {
    "id": "sql-26",
    "slug": "sql-consecutive-numbers-occurrences",
    "title": "Find Consecutive Numbers Occurring 3 Times",
    "difficulty": "intermediate",
    "topic": "JOINs",
    "tags": [
      "JOINs",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT DISTINCT l1.num AS ConsecutiveNums\nFROM Logs l1\nJOIN Logs l2 ON l1.id = l2.id - 1\nJOIN Logs l3 ON l1.id = l3.id - 2\nWHERE l1.num = l2.num AND l2.num = l3.num;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find all numbers that appear at least three times consecutively in the `Logs` table.\n\n### Table Schema:\n**Logs** Table:\n| id | num |\n| :- | :-- |\n| 1  | 1   |\n| 2  | 1   |\n| 3  | 1   |\n| 4  | 2   |\n| 5  | 1   |",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Joining Logs three times with sequential ID offsets verifies identical adjacent num values.",
    "answer": "SELECT DISTINCT l1.num AS ConsecutiveNums\nFROM Logs l1\nJOIN Logs l2 ON l1.id = l2.id - 1\nJOIN Logs l3 ON l1.id = l3.id - 2\nWHERE l1.num = l2.num AND l2.num = l3.num;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-27",
    "slug": "sql-department-highest-salary-join",
    "title": "Department Highest Salary with Ties",
    "difficulty": "intermediate",
    "topic": "Subqueries & CTEs",
    "tags": [
      "Subqueries & CTEs",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary\nFROM Employee e\nJOIN Department d ON e.departmentId = d.id\nWHERE (e.departmentId, e.salary) IN (\n  SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId\n);",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find employees who have the highest salary in each department, handling ties gracefully.\n\n### Table Schema:\n**Employee** (id, name, salary, departmentId)\n**Department** (id, name)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Tupling departmentId and salary in the subquery returns all employees sharing the max compensation.",
    "answer": "SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary\nFROM Employee e\nJOIN Department d ON e.departmentId = d.id\nWHERE (e.departmentId, e.salary) IN (\n  SELECT departmentId, MAX(salary) FROM Employee GROUP BY departmentId\n);",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-28",
    "slug": "sql-managers-with-at-least-5-reports",
    "title": "Find Managers with at Least 5 Direct Reports",
    "difficulty": "intermediate",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "Aggregation & GROUP BY",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT m.name\nFROM Employee m\nJOIN Employee e ON m.id = e.managerId\nGROUP BY m.id, m.name\nHAVING COUNT(e.id) >= 5;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Write an SQL query to report the managers with at least 5 direct reports.\n\n### Table Schema:\n**Employee** Table:\n| id | name | department | managerId |",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Self-joining managers to direct reporting workers allows grouping by manager ID with a HAVING COUNT threshold.",
    "answer": "SELECT m.name\nFROM Employee m\nJOIN Employee e ON m.id = e.managerId\nGROUP BY m.id, m.name\nHAVING COUNT(e.id) >= 5;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-29",
    "slug": "sql-winning-candidate-in-elections",
    "title": "Find the Winning Candidate in Elections",
    "difficulty": "intermediate",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "Aggregation & GROUP BY",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT c.name\nFROM Candidate c\nJOIN Vote v ON c.id = v.candidateId\nGROUP BY c.id, c.name\nORDER BY COUNT(v.id) DESC\nLIMIT 1;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Report the name of the winning candidate who received the most votes from the `Votes` table.\n\n### Table Schema:\n**Candidate** (id, name)\n**Vote** (id, candidateId)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Joining candidates to votes, grouping by candidate and sorting DESC by vote tally extracts the winner.",
    "answer": "SELECT c.name\nFROM Candidate c\nJOIN Vote v ON c.id = v.candidateId\nGROUP BY c.id, c.name\nORDER BY COUNT(v.id) DESC\nLIMIT 1;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-30",
    "slug": "sql-employees-whose-manager-left",
    "title": "Employees Whose Manager Left the Company",
    "difficulty": "intermediate",
    "topic": "Subqueries & CTEs",
    "tags": [
      "Subqueries & CTEs",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT employee_id\nFROM Employees\nWHERE salary < 30000\n  AND manager_id IS NOT NULL\n  AND manager_id NOT IN (SELECT employee_id FROM Employees)\nORDER BY employee_id;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the employees whose salary is strictly less than 30000 and whose manager left the company (managerId is not in the table).\n\n### Table Schema:\n**Employees** (employee_id, name, manager_id, salary)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Using NOT IN checks if the manager_id foreign key references a departed (non-existent) employee record.",
    "answer": "SELECT employee_id\nFROM Employees\nWHERE salary < 30000\n  AND manager_id IS NOT NULL\n  AND manager_id NOT IN (SELECT employee_id FROM Employees)\nORDER BY employee_id;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-31",
    "slug": "sql-monthly-transactions-summary",
    "title": "Monthly Transactions Aggregate Summary",
    "difficulty": "intermediate",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "Aggregation & GROUP BY",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT \n  strftime('%Y-%m', trans_date) AS month,\n  country,\n  COUNT(*) AS trans_count,\n  SUM(CASE WHEN state = 'approved' THEN 1 ELSE 0 END) AS approved_count,\n  SUM(amount) AS trans_total_amount,\n  SUM(CASE WHEN state = 'approved' THEN amount ELSE 0 END) AS approved_total_amount\nFROM Transactions\nGROUP BY month, country;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Write an SQL query to find for each month and country, the number of transactions and their total amount, the number of approved transactions and their total amount.\n\n### Table Schema:\n**Transactions** (id, country, state, amount, trans_date)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Conditional aggregation with SUM(CASE WHEN ...) computes sub-totals for approved rows in a single pass.",
    "answer": "SELECT \n  strftime('%Y-%m', trans_date) AS month,\n  country,\n  COUNT(*) AS trans_count,\n  SUM(CASE WHEN state = 'approved' THEN 1 ELSE 0 END) AS approved_count,\n  SUM(amount) AS trans_total_amount,\n  SUM(CASE WHEN state = 'approved' THEN amount ELSE 0 END) AS approved_total_amount\nFROM Transactions\nGROUP BY month, country;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-32",
    "slug": "sql-immediate-food-delivery-percentage",
    "title": "Immediate Food Delivery First Order Percentage",
    "difficulty": "intermediate",
    "topic": "Subqueries & CTEs",
    "tags": [
      "Subqueries & CTEs",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT ROUND(100.0 * SUM(CASE WHEN order_date = customer_pref_delivery_date THEN 1 ELSE 0 END) / COUNT(*), 2) AS immediate_percentage\nFROM Delivery\nWHERE (customer_id, order_date) IN (\n  SELECT customer_id, MIN(order_date)\n  FROM Delivery\n  GROUP BY customer_id\n);",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the percentage of immediate orders in the first orders of all customers, rounded to 2 decimal places.\n\n### Table Schema:\n**Delivery** (delivery_id, customer_id, order_date, customer_pref_delivery_date)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Isolating first orders per customer and calculating the ratio of same-day preferred delivery yields the immediate percentage.",
    "answer": "SELECT ROUND(100.0 * SUM(CASE WHEN order_date = customer_pref_delivery_date THEN 1 ELSE 0 END) / COUNT(*), 2) AS immediate_percentage\nFROM Delivery\nWHERE (customer_id, order_date) IN (\n  SELECT customer_id, MIN(order_date)\n  FROM Delivery\n  GROUP BY customer_id\n);",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-33",
    "slug": "sql-product-price-at-a-given-date",
    "title": "Find Product Price at a Specific Historical Date",
    "difficulty": "intermediate",
    "topic": "Subqueries & CTEs",
    "tags": [
      "Subqueries & CTEs",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT p1.product_id, COALESCE(p2.new_price, 10) AS price\nFROM (SELECT DISTINCT product_id FROM Products) p1\nLEFT JOIN Products p2 ON p1.product_id = p2.product_id \n  AND (p2.product_id, p2.change_date) IN (\n    SELECT product_id, MAX(change_date) \n    FROM Products \n    WHERE change_date <= '2026-08-16' \n    GROUP BY product_id\n  );",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Write an SQL query to find the prices of all products on date \"2026-08-16\". Assume the price of all products before any change is 10.\n\n### Table Schema:\n**Products** (product_id, new_price, change_date)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Finding the latest change_date <= target date per product and falling back to default 10 with COALESCE.",
    "answer": "SELECT p1.product_id, COALESCE(p2.new_price, 10) AS price\nFROM (SELECT DISTINCT product_id FROM Products) p1\nLEFT JOIN Products p2 ON p1.product_id = p2.product_id \n  AND (p2.product_id, p2.change_date) IN (\n    SELECT product_id, MAX(change_date) \n    FROM Products \n    WHERE change_date <= '2026-08-16' \n    GROUP BY product_id\n  );",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-34",
    "slug": "sql-restaurant-7-day-moving-average",
    "title": "Compute 7-Day Moving Average Revenue",
    "difficulty": "intermediate",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "WITH DailyTotals AS (\n  SELECT visited_on, SUM(amount) AS amount\n  FROM Customer\n  GROUP BY visited_on\n)\nSELECT \n  d1.visited_on,\n  SUM(d2.amount) AS amount,\n  ROUND(AVG(d2.amount), 2) AS average_amount\nFROM DailyTotals d1\nJOIN DailyTotals d2 ON julianday(d1.visited_on) - julianday(d2.visited_on) BETWEEN 0 AND 6\nGROUP BY d1.visited_on\nHAVING COUNT(d2.visited_on) = 7\nORDER BY d1.visited_on ASC;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Compute moving average of how much customer paid in a 7 days window (current day + 6 days before).\n\n### Table Schema:\n**Customer** (customer_id, name, visited_on, amount)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Rolling 7-day window aggregations sum amount over 0-6 preceding days once a full 7-day baseline is established.",
    "answer": "WITH DailyTotals AS (\n  SELECT visited_on, SUM(amount) AS amount\n  FROM Customer\n  GROUP BY visited_on\n)\nSELECT \n  d1.visited_on,\n  SUM(d2.amount) AS amount,\n  ROUND(AVG(d2.amount), 2) AS average_amount\nFROM DailyTotals d1\nJOIN DailyTotals d2 ON julianday(d1.visited_on) - julianday(d2.visited_on) BETWEEN 0 AND 6\nGROUP BY d1.visited_on\nHAVING COUNT(d2.visited_on) = 7\nORDER BY d1.visited_on ASC;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-35",
    "slug": "sql-movie-rating-analysis",
    "title": "Top Movie Reviewer and Highest Rated Movie",
    "difficulty": "intermediate",
    "topic": "UNION & Set Operations",
    "tags": [
      "UNION & Set Operations",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "(SELECT u.name AS results\n FROM MovieRating mr\n JOIN Users u ON mr.user_id = u.user_id\n GROUP BY u.user_id, u.name\n ORDER BY COUNT(*) DESC, u.name ASC\n LIMIT 1)\nUNION ALL\n(SELECT m.title AS results\n FROM MovieRating mr\n JOIN Movies m ON mr.movie_id = m.movie_id\n WHERE strftime('%Y-%m', mr.created_at) = '2026-02'\n GROUP BY m.movie_id, m.title\n ORDER BY AVG(mr.rating) DESC, m.title ASC\n LIMIT 1);",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the name of the user who has rated the greatest number of movies, and find the movie name with the highest average rating in February 2026.\n\n### Table Schema:\n**Movies** (movie_id, title)\n**Users** (user_id, name)\n**MovieRating** (movie_id, user_id, rating, created_at)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Combining two distinct analytical queries using UNION ALL produces the multi-entity benchmark.",
    "answer": "(SELECT u.name AS results\n FROM MovieRating mr\n JOIN Users u ON mr.user_id = u.user_id\n GROUP BY u.user_id, u.name\n ORDER BY COUNT(*) DESC, u.name ASC\n LIMIT 1)\nUNION ALL\n(SELECT m.title AS results\n FROM MovieRating mr\n JOIN Movies m ON mr.movie_id = m.movie_id\n WHERE strftime('%Y-%m', mr.created_at) = '2026-02'\n GROUP BY m.movie_id, m.title\n ORDER BY AVG(mr.rating) DESC, m.title ASC\n LIMIT 1);",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-36",
    "slug": "sql-capital-gain-loss-per-stock",
    "title": "Capital Gain/Loss per Stock Portfolio",
    "difficulty": "intermediate",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "Aggregation & GROUP BY",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT \n  stock_name,\n  SUM(CASE WHEN operation = 'Buy' THEN -price ELSE price END) AS capital_gain_loss\nFROM Stocks\nGROUP BY stock_name;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Write an SQL query to report the Capital Gain/Loss for each stock after Buy and Sell operations.\n\n### Table Schema:\n**Stocks** (stock_name, operation, operation_day, price)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Treating Buy operations as negative cash flow and Sell as positive yields net capital gains.",
    "answer": "SELECT \n  stock_name,\n  SUM(CASE WHEN operation = 'Buy' THEN -price ELSE price END) AS capital_gain_loss\nFROM Stocks\nGROUP BY stock_name;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-37",
    "slug": "sql-top-travellers-distance-sum",
    "title": "Top Travellers by Total Traveled Distance",
    "difficulty": "intermediate",
    "topic": "JOINs",
    "tags": [
      "JOINs",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT u.name, COALESCE(SUM(r.distance), 0) AS travelled_distance\nFROM Users u\nLEFT JOIN Rides r ON u.id = r.user_id\nGROUP BY u.id, u.name\nORDER BY travelled_distance DESC, u.name ASC;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Write an SQL query to report the distance traveled by each user, ordered by traveled_distance DESC and name ASC.\n\n### Table Schema:\n**Users** (id, name)\n**Rides** (id, user_id, distance)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "LEFT JOIN keeps zero-mileage users and COALESCE turns NULL into 0 before sorting.",
    "answer": "SELECT u.name, COALESCE(SUM(r.distance), 0) AS travelled_distance\nFROM Users u\nLEFT JOIN Rides r ON u.id = r.user_id\nGROUP BY u.id, u.name\nORDER BY travelled_distance DESC, u.name ASC;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-38",
    "slug": "sql-group-sold-products-by-date",
    "title": "Group Sold Products Concatenated by Date",
    "difficulty": "intermediate",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "Aggregation & GROUP BY",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT \n  sell_date,\n  COUNT(DISTINCT product) AS num_sold,\n  group_concat(DISTINCT product) AS products\nFROM Activities\nGROUP BY sell_date\nORDER BY sell_date ASC;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Write an SQL query to find for each date the number of different products sold and their sorted, comma-separated names.\n\n### Table Schema:\n**Activities** (sell_date, product)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "group_concat(DISTINCT product) aggregates multiple items into a single delimited text string.",
    "answer": "SELECT \n  sell_date,\n  COUNT(DISTINCT product) AS num_sold,\n  group_concat(DISTINCT product) AS products\nFROM Activities\nGROUP BY sell_date\nORDER BY sell_date ASC;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-39",
    "slug": "sql-patients-with-a-condition",
    "title": "Filter Patients Diagnosed with Type I Diabetes",
    "difficulty": "intermediate",
    "topic": "SELECT & Filtering",
    "tags": [
      "SELECT & Filtering",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT patient_id, patient_name, conditions\nFROM Patients\nWHERE conditions LIKE 'DIAB1%' OR conditions LIKE '% DIAB1%';",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the patient_id, patient_name, and conditions of patients who have Type I Diabetes (starts with DIAB1).\n\n### Table Schema:\n**Patients** (patient_id, patient_name, conditions)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Matching prefix DIAB1% or spaced word % DIAB1% avoids false positives on middle substrings.",
    "answer": "SELECT patient_id, patient_name, conditions\nFROM Patients\nWHERE conditions LIKE 'DIAB1%' OR conditions LIKE '% DIAB1%';",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-40",
    "slug": "sql-bank-account-summary-balance",
    "title": "Bank Account Balances Exceeding Threshold",
    "difficulty": "intermediate",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "Aggregation & GROUP BY",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT u.name, SUM(t.amount) AS balance\nFROM Users u\nJOIN Transactions t ON u.account = t.account\nGROUP BY u.account, u.name\nHAVING SUM(t.amount) > 10000;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Report the name and balance of users with a balance higher than 10000. Balance is sum of transactions.\n\n### Table Schema:\n**Users** (account, name)\n**Transactions** (trans_id, account, amount, trans_date)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Grouping transaction amounts by account and filtering with HAVING SUM > 10000 identifies high-value accounts.",
    "answer": "SELECT u.name, SUM(t.amount) AS balance\nFROM Users u\nJOIN Transactions t ON u.account = t.account\nGROUP BY u.account, u.name\nHAVING SUM(t.amount) > 10000;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-41",
    "slug": "sql-fix-names-in-table",
    "title": "Fix Capitalization Formatting of User Names",
    "difficulty": "intermediate",
    "topic": "String Functions",
    "tags": [
      "String Functions",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT \n  user_id,\n  UPPER(SUBSTR(name, 1, 1)) || LOWER(SUBSTR(name, 2)) AS name\nFROM Users\nORDER BY user_id;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Fix names so that only the first character is uppercase and the rest are lowercase.\n\n### Table Schema:\n**Users** (user_id, name)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "UPPER on the first character combined with LOWER on the remaining substring normalizes casing.",
    "answer": "SELECT \n  user_id,\n  UPPER(SUBSTR(name, 1, 1)) || LOWER(SUBSTR(name, 2)) AS name\nFROM Users\nORDER BY user_id;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-42",
    "slug": "sql-daily-leads-and-partners",
    "title": "Daily Distinct Leads and Partners Count",
    "difficulty": "intermediate",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "Aggregation & GROUP BY",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT \n  date_id,\n  make_name,\n  COUNT(DISTINCT lead_id) AS unique_leads,\n  COUNT(DISTINCT partner_id) AS unique_partners\nFROM DailySales\nGROUP BY date_id, make_name;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "For each date_id and make_name, return the number of distinct lead_id and distinct partner_id.\n\n### Table Schema:\n**DailySales** (date_id, make_name, lead_id, partner_id)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "COUNT(DISTINCT column) tallies unique lead and partner contacts across sales date dimensions.",
    "answer": "SELECT \n  date_id,\n  make_name,\n  COUNT(DISTINCT lead_id) AS unique_leads,\n  COUNT(DISTINCT partner_id) AS unique_partners\nFROM DailySales\nGROUP BY date_id, make_name;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-43",
    "slug": "sql-total-time-spent-by-employee",
    "title": "Calculate Total Daily In-Office Time per Employee",
    "difficulty": "intermediate",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "Aggregation & GROUP BY",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT \n  event_day AS day,\n  emp_id,\n  SUM(out_time - in_time) AS total_time\nFROM Employees\nGROUP BY event_day, emp_id;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Calculate the total time in minutes spent by each employee on each day in the office.\n\n### Table Schema:\n**Employees** (emp_id, event_day, in_time, out_time)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Subtracting in_time from out_time and summing per emp_id and event_day calculates duration.",
    "answer": "SELECT \n  event_day AS day,\n  emp_id,\n  SUM(out_time - in_time) AS total_time\nFROM Employees\nGROUP BY event_day, emp_id;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-44",
    "slug": "sql-triangle-judgement-inequality",
    "title": "Triangle Inequality Judgement for 3 Segments",
    "difficulty": "intermediate",
    "topic": "Conditional Logic",
    "tags": [
      "Conditional Logic",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT x, y, z,\n  CASE \n    WHEN x + y > z AND x + z > y AND y + z > x THEN 'Yes'\n    ELSE 'No'\n  END AS triangle\nFROM Triangle;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Report for every three line segment values whether they can form a triangle (x+y>z, x+z>y, y+z>x).\n\n### Table Schema:\n**Triangle** (x, y, z)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "The triangle inequality theorem asserts the sum of any two sides must exceed the third.",
    "answer": "SELECT x, y, z,\n  CASE \n    WHEN x + y > z AND x + z > y AND y + z > x THEN 'Yes'\n    ELSE 'No'\n  END AS triangle\nFROM Triangle;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-45",
    "slug": "sql-biggest-single-number",
    "title": "Find the Largest Unique Single Number",
    "difficulty": "intermediate",
    "topic": "Subqueries & CTEs",
    "tags": [
      "Subqueries & CTEs",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT MAX(num) AS num\nFROM (\n  SELECT num\n  FROM MyNumbers\n  GROUP BY num\n  HAVING COUNT(*) = 1\n);",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the largest single number that appeared only once in `MyNumbers`. Return NULL if none exists.\n\n### Table Schema:\n**MyNumbers** (num)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "The subquery filters numbers appearing once (HAVING COUNT=1) and outer MAX selects the highest value.",
    "answer": "SELECT MAX(num) AS num\nFROM (\n  SELECT num\n  FROM MyNumbers\n  GROUP BY num\n  HAVING COUNT(*) = 1\n);",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-46",
    "slug": "sql-primary-department-for-employee",
    "title": "Determine Primary Department for Each Employee",
    "difficulty": "intermediate",
    "topic": "Subqueries & CTEs",
    "tags": [
      "Subqueries & CTEs",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT employee_id, department_id\nFROM Employee\nWHERE primary_flag = 'Y'\nUNION\nSELECT employee_id, department_id\nFROM Employee\nGROUP BY employee_id\nHAVING COUNT(department_id) = 1;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Report all employees with their primary department. For employees in only 1 department, report that one.\n\n### Table Schema:\n**Employee** (employee_id, department_id, primary_flag)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "UNION combines explicitly flagged primary records with employees who have a single department association.",
    "answer": "SELECT employee_id, department_id\nFROM Employee\nWHERE primary_flag = 'Y'\nUNION\nSELECT employee_id, department_id\nFROM Employee\nGROUP BY employee_id\nHAVING COUNT(department_id) = 1;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-47",
    "slug": "sql-sales-person-no-orders-red",
    "title": "Sales Persons with No Orders for Company RED",
    "difficulty": "intermediate",
    "topic": "Subqueries & CTEs",
    "tags": [
      "Subqueries & CTEs",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT name\nFROM SalesPerson\nWHERE sales_id NOT IN (\n  SELECT o.sales_id\n  FROM Orders o\n  JOIN Company c ON o.com_id = c.com_id\n  WHERE c.name = 'RED'\n);",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Report the names of all salespersons who did not have any orders related to the company with the name \"RED\".\n\n### Table Schema:\n**SalesPerson** (sales_id, name)\n**Company** (com_id, name)\n**Orders** (order_id, com_id, sales_id)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "NOT IN excludes sales representatives linked to any order associated with the RED company.",
    "answer": "SELECT name\nFROM SalesPerson\nWHERE sales_id NOT IN (\n  SELECT o.sales_id\n  FROM Orders o\n  JOIN Company c ON o.com_id = c.com_id\n  WHERE c.name = 'RED'\n);",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-48",
    "slug": "sql-classes-more-than-5-students",
    "title": "Find Classes with at Least 5 Enrolled Students",
    "difficulty": "intermediate",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "Aggregation & GROUP BY",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT class\nFROM Courses\nGROUP BY class\nHAVING COUNT(DISTINCT student) >= 5;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find all classes that have at least five students enrolled.\n\n### Table Schema:\n**Courses** (student, class)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Grouping by class with HAVING COUNT(DISTINCT student) >= 5 filters for high-enrollment courses.",
    "answer": "SELECT class\nFROM Courses\nGROUP BY class\nHAVING COUNT(DISTINCT student) >= 5;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-49",
    "slug": "sql-user-activity-past-30-days",
    "title": "Daily Active Users Count Over 30-Day Window",
    "difficulty": "intermediate",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "Aggregation & GROUP BY",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT \n  activity_date AS day,\n  COUNT(DISTINCT user_id) AS active_users\nFROM Activity\nWHERE activity_date BETWEEN date('2026-07-27', '-29 days') AND '2026-07-27'\nGROUP BY activity_date;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the daily active user count for a period of 30 days ending 2026-07-27 inclusively.\n\n### Table Schema:\n**Activity** (user_id, session_id, activity_date, activity_type)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Filtering on a 30-day inclusive date interval and counting distinct users gives Daily Active Users (DAU).",
    "answer": "SELECT \n  activity_date AS day,\n  COUNT(DISTINCT user_id) AS active_users\nFROM Activity\nWHERE activity_date BETWEEN date('2026-07-27', '-29 days') AND '2026-07-27'\nGROUP BY activity_date;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-50",
    "slug": "sql-market-analysis-first-year",
    "title": "Market Analysis: User Orders in First Year",
    "difficulty": "intermediate",
    "topic": "JOINs",
    "tags": [
      "JOINs",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT \n  u.user_id AS buyer_id,\n  u.join_date,\n  COUNT(o.order_id) AS orders_in_2026\nFROM Users u\nLEFT JOIN Orders o ON u.user_id = o.buyer_id AND strftime('%Y', o.order_date) = '2026'\nGROUP BY u.user_id, u.join_date;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find for each user, their join date and the number of orders they placed as a buyer in 2026.\n\n### Table Schema:\n**Users** (user_id, join_date, favorite_brand)\n**Orders** (order_id, order_date, item_id, buyer_id, seller_id)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "LEFT JOIN with the date condition in the ON clause preserves all users while counting 2026 orders.",
    "answer": "SELECT \n  u.user_id AS buyer_id,\n  u.join_date,\n  COUNT(o.order_id) AS orders_in_2026\nFROM Users u\nLEFT JOIN Orders o ON u.user_id = o.buyer_id AND strftime('%Y', o.order_date) = '2026'\nGROUP BY u.user_id, u.join_date;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-51",
    "slug": "sql-project-employees-experience",
    "title": "Average Employee Experience per Project",
    "difficulty": "intermediate",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "Aggregation & GROUP BY",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT \n  p.project_id,\n  ROUND(AVG(e.experience_years), 2) AS average_years\nFROM Project p\nJOIN Employee e ON p.employee_id = e.employee_id\nGROUP BY p.project_id;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Report the average experience years of all the employees for each project, rounded to 2 digits.\n\n### Table Schema:\n**Project** (project_id, employee_id)\n**Employee** (employee_id, name, experience_years)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Joining projects to employees and computing ROUND(AVG(experience_years), 2) gives project tenure.",
    "answer": "SELECT \n  p.project_id,\n  ROUND(AVG(e.experience_years), 2) AS average_years\nFROM Project p\nJOIN Employee e ON p.employee_id = e.employee_id\nGROUP BY p.project_id;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-52",
    "slug": "sql-find-users-with-valid-emails",
    "title": "Find Users with Valid Email Pattern",
    "difficulty": "intermediate",
    "topic": "String Functions",
    "tags": [
      "String Functions",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT user_id, name, mail\nFROM Users\nWHERE mail LIKE '%@toolique.com'\n  AND SUBSTR(mail, 1, 1) GLOB '[a-zA-Z]*';",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the users who have valid emails ending with @toolique.com with valid alphanumeric prefix.\n\n### Table Schema:\n**Users** (user_id, name, mail)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Using string filters verifies the email domain and ensures the prefix begins with an alphabetic character.",
    "answer": "SELECT user_id, name, mail\nFROM Users\nWHERE mail LIKE '%@toolique.com'\n  AND SUBSTR(mail, 1, 1) GLOB '[a-zA-Z]*';",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-53",
    "slug": "sql-percentage-users-attended-contests",
    "title": "Percentage of Users Registered in Contests",
    "difficulty": "intermediate",
    "topic": "Subqueries & CTEs",
    "tags": [
      "Subqueries & CTEs",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT \n  contest_id,\n  ROUND(COUNT(user_id) * 100.0 / (SELECT COUNT(*) FROM Users), 2) AS percentage\nFROM Register\nGROUP BY contest_id\nORDER BY percentage DESC, contest_id ASC;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the percentage of users registered in each contest rounded to two decimals, ordered by percentage DESC.\n\n### Table Schema:\n**Users** (user_id, user_name)\n**Register** (contest_id, user_id)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Dividing contest registrant counts by total user base scalar subquery calculates participation percentage.",
    "answer": "SELECT \n  contest_id,\n  ROUND(COUNT(user_id) * 100.0 / (SELECT COUNT(*) FROM Users), 2) AS percentage\nFROM Register\nGROUP BY contest_id\nORDER BY percentage DESC, contest_id ASC;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-54",
    "slug": "sql-queries-quality-and-percentage",
    "title": "Queries Quality and Poor Query Percentage",
    "difficulty": "intermediate",
    "topic": "Aggregation & GROUP BY",
    "tags": [
      "Aggregation & GROUP BY",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT \n  query_name,\n  ROUND(AVG(rating * 1.0 / position), 2) AS quality,\n  ROUND(SUM(CASE WHEN rating < 3 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS poor_query_percentage\nFROM Queries\nWHERE query_name IS NOT NULL\nGROUP BY query_name;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Calculate query quality (avg rating/position) and poor query percentage (rating < 3).\n\n### Table Schema:\n**Queries** (query_name, result, position, rating)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Aggregating rating ratios and percentage of poor ratings measures search relevance quality.",
    "answer": "SELECT \n  query_name,\n  ROUND(AVG(rating * 1.0 / position), 2) AS quality,\n  ROUND(SUM(CASE WHEN rating < 3 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS poor_query_percentage\nFROM Queries\nWHERE query_name IS NOT NULL\nGROUP BY query_name;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-55",
    "slug": "sql-reformat-department-table",
    "title": "Pivot Monthly Revenues into Columns",
    "difficulty": "intermediate",
    "topic": "Conditional Logic",
    "tags": [
      "Conditional Logic",
      "Practice",
      "Intermediate"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Break the problem down into filtering, grouping, and ordering steps.",
      "Check if a subquery or join helps link the related entities.",
      "Use aggregation functions or CASE statements to structure the output."
    ],
    "optimizedAnswer": "SELECT id,\n  SUM(CASE WHEN month = 'Jan' THEN revenue ELSE NULL END) AS Jan_Revenue,\n  SUM(CASE WHEN month = 'Feb' THEN revenue ELSE NULL END) AS Feb_Revenue,\n  SUM(CASE WHEN month = 'Mar' THEN revenue ELSE NULL END) AS Mar_Revenue\nFROM Department\nGROUP BY id;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Reformat the Department table such that there is a department id column and a revenue column for each month.\n\n### Table Schema:\n**Department** (id, revenue, month)",
    "hint": "Review the problem statement and inspect the table schema definitions.",
    "explanation": "Conditional aggregation with SUM(CASE WHEN month = ...) pivots row values into monthly columns.",
    "answer": "SELECT id,\n  SUM(CASE WHEN month = 'Jan' THEN revenue ELSE NULL END) AS Jan_Revenue,\n  SUM(CASE WHEN month = 'Feb' THEN revenue ELSE NULL END) AS Feb_Revenue,\n  SUM(CASE WHEN month = 'Mar' THEN revenue ELSE NULL END) AS Mar_Revenue\nFROM Department\nGROUP BY id;",
    "companies": [
      "Amazon",
      "Google",
      "Meta",
      "Microsoft",
      "Uber"
    ],
    "relatedQuestions": [
      "sql-left-join-customers-without-orders",
      "sql-second-highest-salary"
    ]
  },
  {
    "id": "sql-56",
    "slug": "sql-department-top-three-salaries",
    "title": "Department Top Three Unique Salaries",
    "difficulty": "advanced",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH RankedSalaries AS (\n  SELECT \n    d.name AS Department,\n    e.name AS Employee,\n    e.salary AS Salary,\n    DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS rnk\n  FROM Employee e\n  JOIN Department d ON e.departmentId = d.id\n)\nSELECT Department, Employee, Salary\nFROM RankedSalaries\nWHERE rnk <= 3;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find employees who earn the top three unique salaries in each department using DENSE_RANK().\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "DENSE_RANK() assigns contiguous rank values to salaries without gaps, allowing filtering on rnk <= 3.",
    "answer": "WITH RankedSalaries AS (\n  SELECT \n    d.name AS Department,\n    e.name AS Employee,\n    e.salary AS Salary,\n    DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS rnk\n  FROM Employee e\n  JOIN Department d ON e.departmentId = d.id\n)\nSELECT Department, Employee, Salary\nFROM RankedSalaries\nWHERE rnk <= 3;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-57",
    "slug": "sql-rank-scores-dense-rank",
    "title": "Rank Game Scores Without Gaps",
    "difficulty": "advanced",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT score, DENSE_RANK() OVER (ORDER BY score DESC) AS rank\nFROM Scores\nORDER BY score DESC;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Rank the scores from the `Scores` table. If there is a tie between two scores, both should have the same ranking with no gaps.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "DENSE_RANK() partitions identical scores identically while assigning consecutive integers.",
    "answer": "SELECT score, DENSE_RANK() OVER (ORDER BY score DESC) AS rank\nFROM Scores\nORDER BY score DESC;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-58",
    "slug": "sql-human-traffic-of-stadium",
    "title": "Human Traffic of Stadium: 3 Consecutive Days",
    "difficulty": "advanced",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH ConsecutiveGroups AS (\n  SELECT id, visit_date, people,\n    id - ROW_NUMBER() OVER (ORDER BY id) AS grp\n  FROM Stadium\n  WHERE people >= 100\n)\nSELECT id, visit_date, people\nFROM ConsecutiveGroups\nWHERE grp IN (\n  SELECT grp FROM ConsecutiveGroups GROUP BY grp HAVING COUNT(*) >= 3\n)\nORDER BY visit_date;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Display records with three or more consecutive days with people count >= 100.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Subtracting ROW_NUMBER() from sequential id creates island identifiers (grp). Filtering grps with count >= 3 isolates streaks.",
    "answer": "WITH ConsecutiveGroups AS (\n  SELECT id, visit_date, people,\n    id - ROW_NUMBER() OVER (ORDER BY id) AS grp\n  FROM Stadium\n  WHERE people >= 100\n)\nSELECT id, visit_date, people\nFROM ConsecutiveGroups\nWHERE grp IN (\n  SELECT grp FROM ConsecutiveGroups GROUP BY grp HAVING COUNT(*) >= 3\n)\nORDER BY visit_date;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-59",
    "slug": "sql-trips-and-users-cancellation-rate",
    "title": "Trips & Users: Unbanned Client/Driver Cancellation Rate",
    "difficulty": "advanced",
    "topic": "JOINs",
    "tags": [
      "JOINs",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT \n  t.request_at AS Day,\n  ROUND(SUM(CASE WHEN t.status != 'completed' THEN 1.0 ELSE 0.0 END) / COUNT(*), 2) AS 'Cancellation Rate'\nFROM Trips t\nJOIN TripsUsers c ON t.client_id = c.users_id AND c.banned = 'No'\nJOIN TripsUsers d ON t.driver_id = d.users_id AND d.banned = 'No'\nWHERE t.request_at BETWEEN '2026-10-01' AND '2026-10-03'\nGROUP BY t.request_at;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the cancellation rate of requests with unbanned users (both client and driver must not be banned) each day between \"2026-10-01\" and \"2026-10-03\".\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Joining Trips to Users twice ensures neither rider nor driver is banned before calculating daily cancellation fractions.",
    "answer": "SELECT \n  t.request_at AS Day,\n  ROUND(SUM(CASE WHEN t.status != 'completed' THEN 1.0 ELSE 0.0 END) / COUNT(*), 2) AS 'Cancellation Rate'\nFROM Trips t\nJOIN TripsUsers c ON t.client_id = c.users_id AND c.banned = 'No'\nJOIN TripsUsers d ON t.driver_id = d.users_id AND d.banned = 'No'\nWHERE t.request_at BETWEEN '2026-10-01' AND '2026-10-03'\nGROUP BY t.request_at;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-60",
    "slug": "sql-game-play-analysis-retention-rate",
    "title": "Game Play Analysis IV: Next-Day Player Retention Rate",
    "difficulty": "advanced",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH FirstLogins AS (\n  SELECT player_id, MIN(event_date) AS first_date\n  FROM Activity\n  GROUP BY player_id\n)\nSELECT \n  ROUND(COUNT(DISTINCT a.player_id) * 1.0 / (SELECT COUNT(*) FROM FirstLogins), 2) AS fraction\nFROM FirstLogins fl\nJOIN Activity a ON fl.player_id = a.player_id \n  AND a.event_date = date(fl.first_date, '+1 day');",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Report the fraction of players that logged in again on the day after the day they first logged in, rounded to 2 decimal places.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Joining players on first_login + 1 day isolates Day-1 retained users over total first-time cohorts.",
    "answer": "WITH FirstLogins AS (\n  SELECT player_id, MIN(event_date) AS first_date\n  FROM Activity\n  GROUP BY player_id\n)\nSELECT \n  ROUND(COUNT(DISTINCT a.player_id) * 1.0 / (SELECT COUNT(*) FROM FirstLogins), 2) AS fraction\nFROM FirstLogins fl\nJOIN Activity a ON fl.player_id = a.player_id \n  AND a.event_date = date(fl.first_date, '+1 day');",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-61",
    "slug": "sql-median-employee-salary",
    "title": "Calculate Median Employee Salary per Company",
    "difficulty": "advanced",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH Ranked AS (\n  SELECT id, company, salary,\n    ROW_NUMBER() OVER (PARTITION BY company ORDER BY salary, id) AS row_num,\n    COUNT(*) OVER (PARTITION BY company) AS total_count\n  FROM Employee\n)\nSELECT id, company, salary\nFROM Ranked\nWHERE row_num BETWEEN total_count * 1.0 / 2 AND total_count * 1.0 / 2 + 1;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the median salary of each company without using built-in median functions.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Comparing row_num with total_count / 2 extracts the middle index value(s) representing median compensation.",
    "answer": "WITH Ranked AS (\n  SELECT id, company, salary,\n    ROW_NUMBER() OVER (PARTITION BY company ORDER BY salary, id) AS row_num,\n    COUNT(*) OVER (PARTITION BY company) AS total_count\n  FROM Employee\n)\nSELECT id, company, salary\nFROM Ranked\nWHERE row_num BETWEEN total_count * 1.0 / 2 AND total_count * 1.0 / 2 + 1;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-62",
    "slug": "sql-cumulative-salary-employee",
    "title": "Calculate Rolling 3-Month Cumulative Salary",
    "difficulty": "advanced",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH Filtered AS (\n  SELECT id, month, salary,\n    MAX(month) OVER (PARTITION BY id) AS max_month\n  FROM Employee\n)\nSELECT id, month,\n  SUM(salary) OVER (PARTITION BY id ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS Salary\nFROM Filtered\nWHERE month < max_month\nORDER BY id ASC, month DESC;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Calculate cumulative salary of each employee over a 3-month rolling window excluding their most recent month.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW computes moving cumulative totals over 3-month spans.",
    "answer": "WITH Filtered AS (\n  SELECT id, month, salary,\n    MAX(month) OVER (PARTITION BY id) AS max_month\n  FROM Employee\n)\nSELECT id, month,\n  SUM(salary) OVER (PARTITION BY id ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS Salary\nFROM Filtered\nWHERE month < max_month\nORDER BY id ASC, month DESC;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-63",
    "slug": "sql-average-salary-departments-vs-company",
    "title": "Compare Department Salary Average vs Company Average",
    "difficulty": "advanced",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH MonthlyAvg AS (\n  SELECT \n    strftime('%Y-%m', s.pay_date) AS pay_month,\n    e.departmentId,\n    AVG(s.amount) AS dept_avg,\n    AVG(AVG(s.amount)) OVER (PARTITION BY strftime('%Y-%m', s.pay_date)) AS comp_avg\n  FROM Salary s\n  JOIN Employee e ON s.employee_id = e.id\n  GROUP BY pay_month, e.departmentId\n)\nSELECT pay_month, departmentId,\n  CASE \n    WHEN dept_avg > comp_avg THEN 'higher'\n    WHEN dept_avg < comp_avg THEN 'lower'\n    ELSE 'same'\n  END AS comparison\nFROM MonthlyAvg;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Report if each department average salary in a given month is higher, lower, or same as company average salary.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Window partitioning calculates department averages alongside benchmark company monthly averages.",
    "answer": "WITH MonthlyAvg AS (\n  SELECT \n    strftime('%Y-%m', s.pay_date) AS pay_month,\n    e.departmentId,\n    AVG(s.amount) AS dept_avg,\n    AVG(AVG(s.amount)) OVER (PARTITION BY strftime('%Y-%m', s.pay_date)) AS comp_avg\n  FROM Salary s\n  JOIN Employee e ON s.employee_id = e.id\n  GROUP BY pay_month, e.departmentId\n)\nSELECT pay_month, departmentId,\n  CASE \n    WHEN dept_avg > comp_avg THEN 'higher'\n    WHEN dept_avg < comp_avg THEN 'lower'\n    ELSE 'same'\n  END AS comparison\nFROM MonthlyAvg;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-64",
    "slug": "sql-cumulative-user-spend-running-total",
    "title": "Running Cumulative Spend per User",
    "difficulty": "advanced",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT \n  user_id,\n  trans_date,\n  amount,\n  SUM(amount) OVER (PARTITION BY user_id ORDER BY trans_date, id) AS running_total\nFROM Transactions\nORDER BY user_id, trans_date;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Calculate running total spend for each user over time ordered by transaction date.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "SUM(amount) OVER (PARTITION BY user_id ORDER BY trans_date) constructs an efficient running ledger balance.",
    "answer": "SELECT \n  user_id,\n  trans_date,\n  amount,\n  SUM(amount) OVER (PARTITION BY user_id ORDER BY trans_date, id) AS running_total\nFROM Transactions\nORDER BY user_id, trans_date;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-65",
    "slug": "sql-active-user-retention-rate",
    "title": "Monthly Active User Retention Cohorts",
    "difficulty": "advanced",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH UserActivity AS (\n  SELECT DISTINCT user_id, strftime('%Y-%m', activity_date) AS activity_month\n  FROM Activity\n)\nSELECT \n  u1.activity_month AS cohort_month,\n  COUNT(u1.user_id) AS cohort_size,\n  COUNT(u2.user_id) AS retained_next_month,\n  ROUND(COUNT(u2.user_id) * 100.0 / COUNT(u1.user_id), 2) AS retention_rate\nFROM UserActivity u1\nLEFT JOIN UserActivity u2 ON u1.user_id = u2.user_id \n  AND u2.activity_month = strftime('%Y-%m', date(u1.activity_month || '-01', '+1 month'))\nGROUP BY cohort_month;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Calculate monthly user retention cohorts comparing active users in month M who remain active in month M+1.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Joining distinct monthly active users with their subsequent month instances measures cohort churn.",
    "answer": "WITH UserActivity AS (\n  SELECT DISTINCT user_id, strftime('%Y-%m', activity_date) AS activity_month\n  FROM Activity\n)\nSELECT \n  u1.activity_month AS cohort_month,\n  COUNT(u1.user_id) AS cohort_size,\n  COUNT(u2.user_id) AS retained_next_month,\n  ROUND(COUNT(u2.user_id) * 100.0 / COUNT(u1.user_id), 2) AS retention_rate\nFROM UserActivity u1\nLEFT JOIN UserActivity u2 ON u1.user_id = u2.user_id \n  AND u2.activity_month = strftime('%Y-%m', date(u1.activity_month || '-01', '+1 month'))\nGROUP BY cohort_month;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-66",
    "slug": "sql-recursive-org-hierarchy",
    "title": "Recursive CTE: Employee Hierarchy Management Tree",
    "difficulty": "advanced",
    "topic": "Recursive Queries",
    "tags": [
      "Recursive Queries",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH RECURSIVE OrgHierarchy AS (\n  SELECT id, name, managerId, 1 AS level, name AS path\n  FROM Employee\n  WHERE managerId IS NULL\n  UNION ALL\n  SELECT e.id, e.name, e.managerId, o.level + 1, o.path || ' -> ' || e.name\n  FROM Employee e\n  JOIN OrgHierarchy o ON e.managerId = o.id\n)\nSELECT id, name, level, path\nFROM OrgHierarchy\nORDER BY level, id;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the hierarchy level (1 for CEO, 2 for VP, etc.) and reporting path for all employees using a Recursive CTE.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "A recursive CTE traverses tree branches from root (managerId IS NULL) downward, tracking depth levels.",
    "answer": "WITH RECURSIVE OrgHierarchy AS (\n  SELECT id, name, managerId, 1 AS level, name AS path\n  FROM Employee\n  WHERE managerId IS NULL\n  UNION ALL\n  SELECT e.id, e.name, e.managerId, o.level + 1, o.path || ' -> ' || e.name\n  FROM Employee e\n  JOIN OrgHierarchy o ON e.managerId = o.id\n)\nSELECT id, name, level, path\nFROM OrgHierarchy\nORDER BY level, id;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-67",
    "slug": "sql-second-most-recent-activity",
    "title": "Find Second Most Recent Activity per User",
    "difficulty": "advanced",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH RankedActivity AS (\n  SELECT username, activity, startDate, endDate,\n    ROW_NUMBER() OVER (PARTITION BY username ORDER BY endDate DESC) AS rnk,\n    COUNT(*) OVER (PARTITION BY username) AS cnt\n  FROM UserActivity\n)\nSELECT username, activity, startDate, endDate\nFROM RankedActivity\nWHERE rnk = 2 OR cnt = 1;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Show second most recent activity of each user. If a user has only 1 activity, show that single activity.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Window counting pairs row ranking with total item count to satisfy the fallback rule.",
    "answer": "WITH RankedActivity AS (\n  SELECT username, activity, startDate, endDate,\n    ROW_NUMBER() OVER (PARTITION BY username ORDER BY endDate DESC) AS rnk,\n    COUNT(*) OVER (PARTITION BY username) AS cnt\n  FROM UserActivity\n)\nSELECT username, activity, startDate, endDate\nFROM RankedActivity\nWHERE rnk = 2 OR cnt = 1;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-68",
    "slug": "sql-find-gaps-and-islands-logins",
    "title": "Gaps and Islands: Consecutive 5-Day Login Streaks",
    "difficulty": "advanced",
    "topic": "Subqueries & CTEs",
    "tags": [
      "Subqueries & CTEs",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH DistinctLogins AS (\n  SELECT DISTINCT user_id, date(login_date) AS log_date\n  FROM Logins\n),\nIslands AS (\n  SELECT user_id, log_date,\n    date(log_date, '-' || ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY log_date) || ' days') AS grp\n  FROM DistinctLogins\n)\nSELECT DISTINCT user_id\nFROM Islands\nGROUP BY user_id, grp\nHAVING COUNT(*) >= 5;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Identify all users who have achieved a streak of at least 5 consecutive daily logins.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Subtracting ROW_NUMBER days from the calendar date produces a constant base date for consecutive streaks.",
    "answer": "WITH DistinctLogins AS (\n  SELECT DISTINCT user_id, date(login_date) AS log_date\n  FROM Logins\n),\nIslands AS (\n  SELECT user_id, log_date,\n    date(log_date, '-' || ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY log_date) || ' days') AS grp\n  FROM DistinctLogins\n)\nSELECT DISTINCT user_id\nFROM Islands\nGROUP BY user_id, grp\nHAVING COUNT(*) >= 5;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-69",
    "slug": "sql-last-person-to-fit-in-bus",
    "title": "Last Person to Fit on the Elevator or Bus (Weight Capacity 1000kg)",
    "difficulty": "advanced",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH RunningWeight AS (\n  SELECT person_name, turn, weight,\n    SUM(weight) OVER (ORDER BY turn) AS cumulative_weight\n  FROM Queue\n)\nSELECT person_name\nFROM RunningWeight\nWHERE cumulative_weight <= 1000\nORDER BY turn DESC\nLIMIT 1;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the person_name of the last person who can board without exceeding total capacity 1000kg.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Running total weight filtered by <= 1000 and sorted DESC by turn yields the final eligible passenger.",
    "answer": "WITH RunningWeight AS (\n  SELECT person_name, turn, weight,\n    SUM(weight) OVER (ORDER BY turn) AS cumulative_weight\n  FROM Queue\n)\nSELECT person_name\nFROM RunningWeight\nWHERE cumulative_weight <= 1000\nORDER BY turn DESC\nLIMIT 1;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-70",
    "slug": "sql-month-over-month-revenue-growth",
    "title": "Calculate Month-over-Month (MoM) Revenue Growth Rate",
    "difficulty": "advanced",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH MonthlySales AS (\n  SELECT \n    strftime('%Y-%m', orderDate) AS month,\n    SUM(amount) AS total_revenue\n  FROM Orders\n  GROUP BY month\n)\nSELECT \n  month,\n  total_revenue,\n  LAG(total_revenue) OVER (ORDER BY month) AS prev_month_revenue,\n  ROUND((total_revenue - LAG(total_revenue) OVER (ORDER BY month)) * 100.0 / LAG(total_revenue) OVER (ORDER BY month), 2) AS mom_growth_pct\nFROM MonthlySales;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Calculate total monthly sales and percentage growth compared to the previous month using LAG().\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "LAG() accesses previous month revenue directly without requiring expensive self-joins.",
    "answer": "WITH MonthlySales AS (\n  SELECT \n    strftime('%Y-%m', orderDate) AS month,\n    SUM(amount) AS total_revenue\n  FROM Orders\n  GROUP BY month\n)\nSELECT \n  month,\n  total_revenue,\n  LAG(total_revenue) OVER (ORDER BY month) AS prev_month_revenue,\n  ROUND((total_revenue - LAG(total_revenue) OVER (ORDER BY month)) * 100.0 / LAG(total_revenue) OVER (ORDER BY month), 2) AS mom_growth_pct\nFROM MonthlySales;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-71",
    "slug": "sql-google-longest-login-streak",
    "title": "Google: Calculate Longest Daily Login Streak per User",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH UserStreaks AS (\n  SELECT user_id,\n    date(login_date, '-' || ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) || ' days') AS streak_id\n  FROM (SELECT DISTINCT user_id, date(login_date) AS login_date FROM Logins)\n)\nSELECT user_id, MAX(streak_length) AS max_streak\nFROM (\n  SELECT user_id, streak_id, COUNT(*) AS streak_length\n  FROM UserStreaks\n  GROUP BY user_id, streak_id\n)\nGROUP BY user_id;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the maximum consecutive daily login streak length for every user in the platform.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Applies Gaps & Islands clustering followed by grouped MAX aggregation to extract maximum user streak.",
    "answer": "WITH UserStreaks AS (\n  SELECT user_id,\n    date(login_date, '-' || ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) || ' days') AS streak_id\n  FROM (SELECT DISTINCT user_id, date(login_date) AS login_date FROM Logins)\n)\nSELECT user_id, MAX(streak_length) AS max_streak\nFROM (\n  SELECT user_id, streak_id, COUNT(*) AS streak_length\n  FROM UserStreaks\n  GROUP BY user_id, streak_id\n)\nGROUP BY user_id;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-72",
    "slug": "sql-meta-friend-request-acceptance-rate",
    "title": "Meta: Overall Friend Request Acceptance Rate",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT \n  ROUND(\n    COUNT(DISTINCT r.requester_id || '-' || r.accepter_id) * 1.0 / \n    COALESCE(NULLIF(COUNT(DISTINCT f.sender_id || '-' || f.send_to_id), 0), 1),\n    2\n  ) AS accept_rate\nFROM FriendRequest f\nLEFT JOIN RequestAccepted r ON f.sender_id = r.requester_id AND f.send_to_id = r.accepter_id;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Compute the overall acceptance rate of friend requests (accepted requests / total sent requests), rounded to 2 decimal places.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "De-duplicates sender-recipient pairs to calculate unique relationship conversion ratios.",
    "answer": "SELECT \n  ROUND(\n    COUNT(DISTINCT r.requester_id || '-' || r.accepter_id) * 1.0 / \n    COALESCE(NULLIF(COUNT(DISTINCT f.sender_id || '-' || f.send_to_id), 0), 1),\n    2\n  ) AS accept_rate\nFROM FriendRequest f\nLEFT JOIN RequestAccepted r ON f.sender_id = r.requester_id AND f.send_to_id = r.accepter_id;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-73",
    "slug": "sql-amazon-customer-retention-cohort",
    "title": "Amazon: Customer Acquisition Cohort Analysis",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH FirstPurchase AS (\n  SELECT customerId, MIN(strftime('%Y-%m', orderDate)) AS cohort_month\n  FROM Orders\n  GROUP BY customerId\n),\nCohortActivity AS (\n  SELECT \n    fp.cohort_month,\n    o.customerId,\n    (cast(strftime('%Y', o.orderDate) as int) - cast(substr(fp.cohort_month, 1, 4) as int)) * 12 + \n    (cast(strftime('%m', o.orderDate) as int) - cast(substr(fp.cohort_month, 6, 2) as int)) AS month_number\n  FROM Orders o\n  JOIN FirstPurchase fp ON o.customerId = fp.customerId\n)\nSELECT \n  cohort_month,\n  COUNT(DISTINCT CASE WHEN month_number = 0 THEN customerId END) AS m0_users,\n  COUNT(DISTINCT CASE WHEN month_number = 1 THEN customerId END) AS m1_users,\n  COUNT(DISTINCT CASE WHEN month_number = 2 THEN customerId END) AS m2_users\nFROM CohortActivity\nGROUP BY cohort_month;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Build an acquisition cohort table displaying initial customer count and retention at month 1, 2, and 3.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Maps customer orders into relative monthly intervals from acquisition date to create retention matrices.",
    "answer": "WITH FirstPurchase AS (\n  SELECT customerId, MIN(strftime('%Y-%m', orderDate)) AS cohort_month\n  FROM Orders\n  GROUP BY customerId\n),\nCohortActivity AS (\n  SELECT \n    fp.cohort_month,\n    o.customerId,\n    (cast(strftime('%Y', o.orderDate) as int) - cast(substr(fp.cohort_month, 1, 4) as int)) * 12 + \n    (cast(strftime('%m', o.orderDate) as int) - cast(substr(fp.cohort_month, 6, 2) as int)) AS month_number\n  FROM Orders o\n  JOIN FirstPurchase fp ON o.customerId = fp.customerId\n)\nSELECT \n  cohort_month,\n  COUNT(DISTINCT CASE WHEN month_number = 0 THEN customerId END) AS m0_users,\n  COUNT(DISTINCT CASE WHEN month_number = 1 THEN customerId END) AS m1_users,\n  COUNT(DISTINCT CASE WHEN month_number = 2 THEN customerId END) AS m2_users\nFROM CohortActivity\nGROUP BY cohort_month;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-74",
    "slug": "sql-netflix-binge-watch-session-detection",
    "title": "Netflix: Binge-Watching Session Boundary Detection",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH StreamGaps AS (\n  SELECT user_id, show_id, start_time, end_time,\n    CASE \n      WHEN julianday(start_time) - julianday(LAG(end_time) OVER (PARTITION BY user_id ORDER BY start_time)) > (30.0 / 1440.0) \n      THEN 1 ELSE 0 \n    END AS is_new_session\n  FROM PlaybackLogs\n),\nSessions AS (\n  SELECT user_id, show_id, start_time, end_time,\n    SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY start_time) AS session_id\n  FROM StreamGaps\n)\nSELECT user_id, session_id, COUNT(*) AS episodes_watched, MIN(start_time) AS session_start, MAX(end_time) AS session_end\nFROM Sessions\nGROUP BY user_id, session_id\nHAVING COUNT(*) >= 3;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Identify continuous viewing sessions where a user watches episodes with less than 30 minutes idle gap.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Uses LAG to evaluate time difference between successive streams and cumulative sum to create session IDs.",
    "answer": "WITH StreamGaps AS (\n  SELECT user_id, show_id, start_time, end_time,\n    CASE \n      WHEN julianday(start_time) - julianday(LAG(end_time) OVER (PARTITION BY user_id ORDER BY start_time)) > (30.0 / 1440.0) \n      THEN 1 ELSE 0 \n    END AS is_new_session\n  FROM PlaybackLogs\n),\nSessions AS (\n  SELECT user_id, show_id, start_time, end_time,\n    SUM(is_new_session) OVER (PARTITION BY user_id ORDER BY start_time) AS session_id\n  FROM StreamGaps\n)\nSELECT user_id, session_id, COUNT(*) AS episodes_watched, MIN(start_time) AS session_start, MAX(end_time) AS session_end\nFROM Sessions\nGROUP BY user_id, session_id\nHAVING COUNT(*) >= 3;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-75",
    "slug": "sql-uber-driver-trip-utilization-rate",
    "title": "Uber: Driver Idle Time vs Trip Utilization Efficiency",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH DriverTripDuration AS (\n  SELECT driver_id, SUM(julianday(dropoff_time) - julianday(pickup_time)) * 24 AS trip_hours\n  FROM Trips WHERE status = 'completed'\n  GROUP BY driver_id\n),\nDriverOnlineDuration AS (\n  SELECT driver_id, SUM(julianday(logout_time) - julianday(login_time)) * 24 AS online_hours\n  FROM DriverShifts\n  GROUP BY driver_id\n)\nSELECT \n  o.driver_id,\n  o.online_hours,\n  COALESCE(t.trip_hours, 0) AS trip_hours,\n  ROUND(COALESCE(t.trip_hours, 0) * 100.0 / o.online_hours, 2) AS utilization_rate_pct\nFROM DriverOnlineDuration o\nLEFT JOIN DriverTripDuration t ON o.driver_id = t.driver_id;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Calculate the utilization percentage of online drivers (time spent in active trips divided by total online duration).\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Aggregates billable passenger trip minutes against total logged-in shift duration.",
    "answer": "WITH DriverTripDuration AS (\n  SELECT driver_id, SUM(julianday(dropoff_time) - julianday(pickup_time)) * 24 AS trip_hours\n  FROM Trips WHERE status = 'completed'\n  GROUP BY driver_id\n),\nDriverOnlineDuration AS (\n  SELECT driver_id, SUM(julianday(logout_time) - julianday(login_time)) * 24 AS online_hours\n  FROM DriverShifts\n  GROUP BY driver_id\n)\nSELECT \n  o.driver_id,\n  o.online_hours,\n  COALESCE(t.trip_hours, 0) AS trip_hours,\n  ROUND(COALESCE(t.trip_hours, 0) * 100.0 / o.online_hours, 2) AS utilization_rate_pct\nFROM DriverOnlineDuration o\nLEFT JOIN DriverTripDuration t ON o.driver_id = t.driver_id;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-76",
    "slug": "sql-apple-inventory-stockout-runway",
    "title": "Apple: Inventory Stockout Days Runway Estimation",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH DailyVelocity AS (\n  SELECT product_id, SUM(quantity) * 1.0 / 14 AS avg_daily_sales\n  FROM OrderItems oi\n  JOIN Orders o ON oi.orderId = o.id\n  WHERE o.orderDate >= date('now', '-14 days')\n  GROUP BY product_id\n)\nSELECT \n  p.id, p.name, p.stock,\n  COALESCE(dv.avg_daily_sales, 0) AS daily_velocity,\n  CASE \n    WHEN COALESCE(dv.avg_daily_sales, 0) = 0 THEN 999\n    ELSE ROUND(p.stock / dv.avg_daily_sales, 1)\n  END AS days_runway_remaining\nFROM Products p\nLEFT JOIN DailyVelocity dv ON p.id = dv.product_id\nORDER BY days_runway_remaining ASC;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Calculate days of stock remaining for each warehouse product based on 14-day average daily sales velocity.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Computes rolling daily consumption rate and divides current on-hand warehouse inventory to forecast stockouts.",
    "answer": "WITH DailyVelocity AS (\n  SELECT product_id, SUM(quantity) * 1.0 / 14 AS avg_daily_sales\n  FROM OrderItems oi\n  JOIN Orders o ON oi.orderId = o.id\n  WHERE o.orderDate >= date('now', '-14 days')\n  GROUP BY product_id\n)\nSELECT \n  p.id, p.name, p.stock,\n  COALESCE(dv.avg_daily_sales, 0) AS daily_velocity,\n  CASE \n    WHEN COALESCE(dv.avg_daily_sales, 0) = 0 THEN 999\n    ELSE ROUND(p.stock / dv.avg_daily_sales, 1)\n  END AS days_runway_remaining\nFROM Products p\nLEFT JOIN DailyVelocity dv ON p.id = dv.product_id\nORDER BY days_runway_remaining ASC;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-77",
    "slug": "sql-stripe-fraudulent-card-velocity",
    "title": "Stripe: Fraud Detection Velocity (Multi-Account Card Use)",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT DISTINCT c1.card_fingerprint\nFROM CardCharges c1\nJOIN CardCharges c2 ON c1.card_fingerprint = c2.card_fingerprint \n  AND c1.account_id != c2.account_id\n  AND julianday(c2.charge_time) - julianday(c1.charge_time) BETWEEN 0 AND (1.0 / 24.0)\nGROUP BY c1.card_fingerprint\nHAVING COUNT(DISTINCT c2.account_id) >= 2;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Identify credit cards used across 3 or more distinct user accounts within a 1-hour moving window.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Self-joins transactions within a 1-hour temporal window to detect distributed payment velocity attacks.",
    "answer": "SELECT DISTINCT c1.card_fingerprint\nFROM CardCharges c1\nJOIN CardCharges c2 ON c1.card_fingerprint = c2.card_fingerprint \n  AND c1.account_id != c2.account_id\n  AND julianday(c2.charge_time) - julianday(c1.charge_time) BETWEEN 0 AND (1.0 / 24.0)\nGROUP BY c1.card_fingerprint\nHAVING COUNT(DISTINCT c2.account_id) >= 2;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-78",
    "slug": "sql-airbnb-search-to-booking-funnel",
    "title": "Airbnb: Search to Reservation Conversion Funnel",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT \n  city,\n  COUNT(DISTINCT search_id) AS total_searches,\n  COUNT(DISTINCT view_id) AS total_views,\n  COUNT(DISTINCT checkout_id) AS total_checkouts,\n  COUNT(DISTINCT booking_id) AS total_bookings,\n  ROUND(COUNT(DISTINCT booking_id) * 100.0 / COUNT(DISTINCT search_id), 2) AS search_to_book_conversion_pct\nFROM SearchFunnelEvents\nGROUP BY city;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Calculate conversion rates across funnel steps: Search -> View Listing -> Initiate Checkout -> Booked.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Aggregates distinct event IDs across stage columns to produce end-to-end user conversion funnels.",
    "answer": "SELECT \n  city,\n  COUNT(DISTINCT search_id) AS total_searches,\n  COUNT(DISTINCT view_id) AS total_views,\n  COUNT(DISTINCT checkout_id) AS total_checkouts,\n  COUNT(DISTINCT booking_id) AS total_bookings,\n  ROUND(COUNT(DISTINCT booking_id) * 100.0 / COUNT(DISTINCT search_id), 2) AS search_to_book_conversion_pct\nFROM SearchFunnelEvents\nGROUP BY city;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-79",
    "slug": "sql-spotify-track-skip-rate-analysis",
    "title": "Spotify: Song Completion and Early Skip Rate Metrics",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT \n  t.artist_name,\n  COUNT(l.id) AS total_streams,\n  ROUND(SUM(CASE WHEN l.duration_played_sec < 30 THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(l.id), 2) AS skip_rate_pct,\n  ROUND(SUM(CASE WHEN l.duration_played_sec >= t.track_duration_sec * 0.9 THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(l.id), 2) AS completion_rate_pct\nFROM StreamLogs l\nJOIN Tracks t ON l.track_id = t.id\nGROUP BY t.artist_name\nHAVING total_streams >= 10;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Classify listens: \"Skipped\" if played < 30s, \"Completed\" if played >= 90% duration, and calculate skip rates per artist.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Evaluates duration thresholds against track length to measure user satisfaction and engagement.",
    "answer": "SELECT \n  t.artist_name,\n  COUNT(l.id) AS total_streams,\n  ROUND(SUM(CASE WHEN l.duration_played_sec < 30 THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(l.id), 2) AS skip_rate_pct,\n  ROUND(SUM(CASE WHEN l.duration_played_sec >= t.track_duration_sec * 0.9 THEN 1.0 ELSE 0.0 END) * 100.0 / COUNT(l.id), 2) AS completion_rate_pct\nFROM StreamLogs l\nJOIN Tracks t ON l.track_id = t.id\nGROUP BY t.artist_name\nHAVING total_streams >= 10;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-80",
    "slug": "sql-doordash-delivery-sla-breaches",
    "title": "DoorDash: Order Delivery SLA Delay Root Cause Analysis",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT \n  order_id,\n  (julianday(food_ready_at) - julianday(placed_at)) * 1440 AS prep_minutes,\n  (julianday(delivered_at) - julianday(picked_up_at)) * 1440 AS transit_minutes,\n  (julianday(delivered_at) - julianday(placed_at)) * 1440 AS total_minutes,\n  CASE \n    WHEN (julianday(food_ready_at) - julianday(placed_at)) > (julianday(delivered_at) - julianday(picked_up_at)) THEN 'Restaurant Delay'\n    ELSE 'Driver Transit Delay'\n  END AS primary_root_cause\nFROM Deliveries\nWHERE (julianday(delivered_at) - julianday(placed_at)) * 1440 > 45;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Identify if delivery delays (> 45 min) were caused by Restaurant Prep or Driver Transit time.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Calculates stage durations in minutes and applies conditional logic to assign operational SLA responsibility.",
    "answer": "SELECT \n  order_id,\n  (julianday(food_ready_at) - julianday(placed_at)) * 1440 AS prep_minutes,\n  (julianday(delivered_at) - julianday(picked_up_at)) * 1440 AS transit_minutes,\n  (julianday(delivered_at) - julianday(placed_at)) * 1440 AS total_minutes,\n  CASE \n    WHEN (julianday(food_ready_at) - julianday(placed_at)) > (julianday(delivered_at) - julianday(picked_up_at)) THEN 'Restaurant Delay'\n    ELSE 'Driver Transit Delay'\n  END AS primary_root_cause\nFROM Deliveries\nWHERE (julianday(delivered_at) - julianday(placed_at)) * 1440 > 45;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-81",
    "slug": "sql-salesforce-first-touch-attribution",
    "title": "Salesforce: First-Touch vs Last-Touch Marketing Attribution",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH RankedTouches AS (\n  SELECT \n    t.deal_id,\n    t.channel,\n    d.revenue,\n    ROW_NUMBER() OVER (PARTITION BY t.deal_id ORDER BY t.touch_time ASC) AS first_touch_rnk\n  FROM MarketingTouches t\n  JOIN Deals d ON t.deal_id = d.id\n  WHERE d.stage = 'Closed Won'\n)\nSELECT channel, SUM(revenue) AS attributed_revenue\nFROM RankedTouches\nWHERE first_touch_rnk = 1\nGROUP BY channel\nORDER BY attributed_revenue DESC;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Attribute deal revenue to the first marketing touchpoint channel for all closed-won enterprise deals.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "ROW_NUMBER partitioned by deal_id ordered ASC by touch_time extracts the initial acquisition channel.",
    "answer": "WITH RankedTouches AS (\n  SELECT \n    t.deal_id,\n    t.channel,\n    d.revenue,\n    ROW_NUMBER() OVER (PARTITION BY t.deal_id ORDER BY t.touch_time ASC) AS first_touch_rnk\n  FROM MarketingTouches t\n  JOIN Deals d ON t.deal_id = d.id\n  WHERE d.stage = 'Closed Won'\n)\nSELECT channel, SUM(revenue) AS attributed_revenue\nFROM RankedTouches\nWHERE first_touch_rnk = 1\nGROUP BY channel\nORDER BY attributed_revenue DESC;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-82",
    "slug": "sql-bloomberg-vwap-stock-trading",
    "title": "Bloomberg: Volume Weighted Average Price (VWAP) Engine",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT \n  ticker,\n  trade_time,\n  price,\n  volume,\n  ROUND(\n    SUM(price * volume) OVER (PARTITION BY ticker ORDER BY trade_time) * 1.0 / \n    SUM(volume) OVER (PARTITION BY ticker ORDER BY trade_time), \n    4\n  ) AS vwap\nFROM Trades\nORDER BY ticker, trade_time;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Calculate cumulative intraday VWAP = Cumulative(Price * Volume) / Cumulative(Volume) for each ticker.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Combines two window sum functions to compute real-time Volume Weighted Average Price.",
    "answer": "SELECT \n  ticker,\n  trade_time,\n  price,\n  volume,\n  ROUND(\n    SUM(price * volume) OVER (PARTITION BY ticker ORDER BY trade_time) * 1.0 / \n    SUM(volume) OVER (PARTITION BY ticker ORDER BY trade_time), \n    4\n  ) AS vwap\nFROM Trades\nORDER BY ticker, trade_time;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-83",
    "slug": "sql-linkedin-second-degree-connections",
    "title": "LinkedIn: 2nd-Degree Friend of Friends Recommendations",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH DirectFriends AS (\n  SELECT friend_id FROM Connections WHERE user_id = 1\n  UNION\n  SELECT user_id FROM Connections WHERE friend_id = 1\n)\nSELECT c.friend_id AS recommended_user, COUNT(*) AS mutual_friends_count\nFROM Connections c\nWHERE c.user_id IN (SELECT friend_id FROM DirectFriends)\n  AND c.friend_id != 1\n  AND c.friend_id NOT IN (SELECT friend_id FROM DirectFriends)\nGROUP BY c.friend_id\nORDER BY mutual_friends_count DESC;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Suggest 2nd-degree connections (mutual friends) for user 1 that they are not already connected to directly.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Explores 1-hop graph edges from direct connections while filtering existing 1st-degree contacts.",
    "answer": "WITH DirectFriends AS (\n  SELECT friend_id FROM Connections WHERE user_id = 1\n  UNION\n  SELECT user_id FROM Connections WHERE friend_id = 1\n)\nSELECT c.friend_id AS recommended_user, COUNT(*) AS mutual_friends_count\nFROM Connections c\nWHERE c.user_id IN (SELECT friend_id FROM DirectFriends)\n  AND c.friend_id != 1\n  AND c.friend_id NOT IN (SELECT friend_id FROM DirectFriends)\nGROUP BY c.friend_id\nORDER BY mutual_friends_count DESC;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-84",
    "slug": "sql-bytedance-video-virality-threshold",
    "title": "ByteDance: Short Video Virality Prediction Milestone",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT \n  video_id,\n  COUNT(*) AS view_count,\n  ROUND(SUM(CASE WHEN watch_duration_sec >= video_length_sec THEN 1.0 ELSE 0.0 END) / COUNT(*), 2) AS completion_rate\nFROM VideoImpressions\nWHERE impression_time <= datetime(video_published_at, '+2 hours')\nGROUP BY video_id, video_published_at\nHAVING COUNT(*) >= 1000 AND completion_rate >= 0.70;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find videos where completion rate in the first 2 hours exceeded 70% with over 1,000 views.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Filters views within the first 2 hours of publication and calculates completion threshold percentage.",
    "answer": "SELECT \n  video_id,\n  COUNT(*) AS view_count,\n  ROUND(SUM(CASE WHEN watch_duration_sec >= video_length_sec THEN 1.0 ELSE 0.0 END) / COUNT(*), 2) AS completion_rate\nFROM VideoImpressions\nWHERE impression_time <= datetime(video_published_at, '+2 hours')\nGROUP BY video_id, video_published_at\nHAVING COUNT(*) >= 1000 AND completion_rate >= 0.70;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-85",
    "slug": "sql-twitter-trending-hashtag-velocity",
    "title": "Twitter/X: Trending Hashtag Velocity Delta Detection",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH DailyHashtags AS (\n  SELECT hashtag, date(tweet_time) AS tweet_date, COUNT(*) AS tweet_count\n  FROM Tweets\n  GROUP BY hashtag, tweet_date\n)\nSELECT \n  t1.hashtag,\n  t1.tweet_count AS today_count,\n  COALESCE(t2.tweet_count, 0) AS yesterday_count,\n  (t1.tweet_count - COALESCE(t2.tweet_count, 0)) AS velocity_growth\nFROM DailyHashtags t1\nLEFT JOIN DailyHashtags t2 ON t1.hashtag = t2.hashtag \n  AND t2.tweet_date = date(t1.tweet_date, '-1 day')\nWHERE t1.tweet_date = '2026-09-28'\nORDER BY velocity_growth DESC;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Calculate trending velocity = (Today Tweet Count - Yesterday Tweet Count) for each hashtag.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Measures rate-of-change momentum in hashtag occurrences between adjacent 24-hour periods.",
    "answer": "WITH DailyHashtags AS (\n  SELECT hashtag, date(tweet_time) AS tweet_date, COUNT(*) AS tweet_count\n  FROM Tweets\n  GROUP BY hashtag, tweet_date\n)\nSELECT \n  t1.hashtag,\n  t1.tweet_count AS today_count,\n  COALESCE(t2.tweet_count, 0) AS yesterday_count,\n  (t1.tweet_count - COALESCE(t2.tweet_count, 0)) AS velocity_growth\nFROM DailyHashtags t1\nLEFT JOIN DailyHashtags t2 ON t1.hashtag = t2.hashtag \n  AND t2.tweet_date = date(t1.tweet_date, '-1 day')\nWHERE t1.tweet_date = '2026-09-28'\nORDER BY velocity_growth DESC;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-86",
    "slug": "sql-snowflake-partition-pruning-audit",
    "title": "Snowflake: SARGable Query Pruning Performance Optimization",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT id, customerId, amount, orderDate\nFROM Orders\nWHERE orderDate >= '2026-01-01' AND orderDate < '2027-01-01';",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Refactor non-SARGable query `WHERE YEAR(order_date) = 2026` into index-friendly interval bounds.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Eliminates function wrappers on indexed columns to enable direct partition seeks and binary index scans.",
    "answer": "SELECT id, customerId, amount, orderDate\nFROM Orders\nWHERE orderDate >= '2026-01-01' AND orderDate < '2027-01-01';",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-87",
    "slug": "sql-oracle-deadlock-graph-cycle",
    "title": "Oracle: Database Lock Wait Graph Cycle Detection",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH RECURSIVE LockPaths AS (\n  SELECT waiting_tx, holding_tx, waiting_tx || '->' || holding_tx AS path, 1 AS depth\n  FROM LockWaits\n  UNION ALL\n  SELECT lp.waiting_tx, lw.holding_tx, lp.path || '->' || lw.holding_tx, lp.depth + 1\n  FROM LockPaths lp\n  JOIN LockWaits lw ON lp.holding_tx = lw.waiting_tx\n  WHERE lp.path NOT LIKE '%' || lw.holding_tx || '%'\n)\nSELECT DISTINCT waiting_tx AS deadlock_root_tx\nFROM LockPaths lp\nJOIN LockWaits lw ON lp.holding_tx = lw.waiting_tx AND lp.waiting_tx = lw.holding_tx;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Detect circular wait conditions between database transactions using Recursive CTE traversal.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Traverses transactional wait-for dependencies to identify directed cycles causing engine deadlocks.",
    "answer": "WITH RECURSIVE LockPaths AS (\n  SELECT waiting_tx, holding_tx, waiting_tx || '->' || holding_tx AS path, 1 AS depth\n  FROM LockWaits\n  UNION ALL\n  SELECT lp.waiting_tx, lw.holding_tx, lp.path || '->' || lw.holding_tx, lp.depth + 1\n  FROM LockPaths lp\n  JOIN LockWaits lw ON lp.holding_tx = lw.waiting_tx\n  WHERE lp.path NOT LIKE '%' || lw.holding_tx || '%'\n)\nSELECT DISTINCT waiting_tx AS deadlock_root_tx\nFROM LockPaths lp\nJOIN LockWaits lw ON lp.holding_tx = lw.waiting_tx AND lp.waiting_tx = lw.holding_tx;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-88",
    "slug": "sql-palantir-shortest-path-graph",
    "title": "Palantir: Shortest Path Traversal Between Entities",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH RECURSIVE Paths AS (\n  SELECT source_node, target_node, 1 AS distance, source_node || '->' || target_node AS path\n  FROM GraphEdges\n  WHERE source_node = 'Node_A'\n  UNION ALL\n  SELECT p.source_node, e.target_node, p.distance + 1, p.path || '->' || e.target_node\n  FROM Paths p\n  JOIN GraphEdges e ON p.target_node = e.source_node\n  WHERE p.path NOT LIKE '%' || e.target_node || '%'\n    AND p.distance < 5\n)\nSELECT distance, path\nFROM Paths\nWHERE target_node = 'Node_B'\nORDER BY distance ASC\nLIMIT 1;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find the minimum degree of separation (shortest path) between Entity A and Entity B in a network graph.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Implements Breadth-First-Search (BFS) path finding using recursive query iterations with cycle prevention.",
    "answer": "WITH RECURSIVE Paths AS (\n  SELECT source_node, target_node, 1 AS distance, source_node || '->' || target_node AS path\n  FROM GraphEdges\n  WHERE source_node = 'Node_A'\n  UNION ALL\n  SELECT p.source_node, e.target_node, p.distance + 1, p.path || '->' || e.target_node\n  FROM Paths p\n  JOIN GraphEdges e ON p.target_node = e.source_node\n  WHERE p.path NOT LIKE '%' || e.target_node || '%'\n    AND p.distance < 5\n)\nSELECT distance, path\nFROM Paths\nWHERE target_node = 'Node_B'\nORDER BY distance ASC\nLIMIT 1;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-89",
    "slug": "sql-double-entry-ledger-integrity",
    "title": "Toolique: Double-Entry Financial Ledger Balancing Audit",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT \n  transaction_id,\n  SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) AS total_debit,\n  SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) AS total_credit\nFROM GeneralLedger\nGROUP BY transaction_id\nHAVING total_debit != total_credit;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Verify that every financial transaction has equal debits and credits, reporting unbalanced transactions.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Enforces fundamental accounting equation integrity: Sum(Debits) == Sum(Credits) per journal entry.",
    "answer": "SELECT \n  transaction_id,\n  SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) AS total_debit,\n  SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) AS total_credit\nFROM GeneralLedger\nGROUP BY transaction_id\nHAVING total_debit != total_credit;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-90",
    "slug": "sql-top-k-products-dense-rank-ties",
    "title": "Top-K Products per Category with Rank Ties Handling",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH RankedProducts AS (\n  SELECT \n    category, name, price,\n    DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rnk\n  FROM Products\n)\nSELECT category, name, price\nFROM RankedProducts\nWHERE rnk <= 2\nORDER BY category, price DESC;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Retrieve the top 2 ranked products in each category, including all ties using DENSE_RANK().\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "DENSE_RANK preserves multiple tied items under rank 1 and 2 without skipping numerical rank buckets.",
    "answer": "WITH RankedProducts AS (\n  SELECT \n    category, name, price,\n    DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC) AS rnk\n  FROM Products\n)\nSELECT category, name, price\nFROM RankedProducts\nWHERE rnk <= 2\nORDER BY category, price DESC;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-91",
    "slug": "sql-sliding-window-active-sessions",
    "title": "Sliding Window Concurrently Active User Sessions",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH Events AS (\n  SELECT start_time AS event_time, 1 AS delta FROM UserSessions\n  UNION ALL\n  SELECT end_time AS event_time, -1 AS delta FROM UserSessions\n),\nRunningTotal AS (\n  SELECT event_time,\n    SUM(delta) OVER (ORDER BY event_time, delta DESC) AS concurrent_users\n  FROM Events\n)\nSELECT MAX(concurrent_users) AS peak_concurrent_users\nFROM RunningTotal;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find peak concurrent server load (maximum simultaneous active user sessions).\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Deconstructs session boundaries into +1 start and -1 end events to compute peak concurrent load.",
    "answer": "WITH Events AS (\n  SELECT start_time AS event_time, 1 AS delta FROM UserSessions\n  UNION ALL\n  SELECT end_time AS event_time, -1 AS delta FROM UserSessions\n),\nRunningTotal AS (\n  SELECT event_time,\n    SUM(delta) OVER (ORDER BY event_time, delta DESC) AS concurrent_users\n  FROM Events\n)\nSELECT MAX(concurrent_users) AS peak_concurrent_users\nFROM RunningTotal;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-92",
    "slug": "sql-dynamic-pivot-monthly-metrics",
    "title": "Dynamic Matrix Transformation of KPI Metrics",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT region,\n  SUM(CASE WHEN quarter = 'Q1' THEN revenue ELSE 0 END) AS Q1_Revenue,\n  SUM(CASE WHEN quarter = 'Q2' THEN revenue ELSE 0 END) AS Q2_Revenue,\n  SUM(CASE WHEN quarter = 'Q3' THEN revenue ELSE 0 END) AS Q3_Revenue,\n  SUM(CASE WHEN quarter = 'Q4' THEN revenue ELSE 0 END) AS Q4_Revenue,\n  SUM(revenue) AS Total_Annual_Revenue\nFROM RegionalSales\nGROUP BY region;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Pivot quarterly regional revenues into a single consolidated financial review table.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Constructs tabular quarterly dashboards through multi-condition aggregate projection.",
    "answer": "SELECT region,\n  SUM(CASE WHEN quarter = 'Q1' THEN revenue ELSE 0 END) AS Q1_Revenue,\n  SUM(CASE WHEN quarter = 'Q2' THEN revenue ELSE 0 END) AS Q2_Revenue,\n  SUM(CASE WHEN quarter = 'Q3' THEN revenue ELSE 0 END) AS Q3_Revenue,\n  SUM(CASE WHEN quarter = 'Q4' THEN revenue ELSE 0 END) AS Q4_Revenue,\n  SUM(revenue) AS Total_Annual_Revenue\nFROM RegionalSales\nGROUP BY region;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-93",
    "slug": "sql-unpopular-books-sold-less-than-10",
    "title": "Unpopular Books Sold Less Than 10 in Last Year",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT b.book_id, b.name\nFROM Books b\nLEFT JOIN Orders o ON b.book_id = o.book_id \n  AND o.dispatch_date BETWEEN date('2026-06-23', '-1 year') AND '2026-06-23'\nWHERE b.available_from < date('2026-06-23', '-1 month')\nGROUP BY b.book_id, b.name\nHAVING COALESCE(SUM(o.quantity), 0) < 10;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Find books available for > 1 month that sold fewer than 10 copies in the past calendar year.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Combines age thresholds with conditional aggregate sums across recent dispatch records.",
    "answer": "SELECT b.book_id, b.name\nFROM Books b\nLEFT JOIN Orders o ON b.book_id = o.book_id \n  AND o.dispatch_date BETWEEN date('2026-06-23', '-1 year') AND '2026-06-23'\nWHERE b.available_from < date('2026-06-23', '-1 month')\nGROUP BY b.book_id, b.name\nHAVING COALESCE(SUM(o.quantity), 0) < 10;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-94",
    "slug": "sql-running-difference-lag-orders",
    "title": "Running Delta of Sales Between Successive Orders",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT \n  id, customerId, amount, orderDate,\n  amount - LAG(amount, 1, amount) OVER (PARTITION BY customerId ORDER BY orderDate, id) AS diff_from_previous\nFROM Orders;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Calculate the variance difference in amount between current order and immediate prior order for each customer.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "LAG(amount, 1, amount) sets default fallback to current amount on first order, avoiding nulls.",
    "answer": "SELECT \n  id, customerId, amount, orderDate,\n  amount - LAG(amount, 1, amount) OVER (PARTITION BY customerId ORDER BY orderDate, id) AS diff_from_previous\nFROM Orders;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-95",
    "slug": "sql-user-first-and-last-action",
    "title": "Capture First and Last User Event in Session",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT DISTINCT \n  session_id,\n  FIRST_VALUE(action) OVER (PARTITION BY session_id ORDER BY event_time \n    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS first_action,\n  LAST_VALUE(action) OVER (PARTITION BY session_id ORDER BY event_time \n    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_action\nFROM SessionEvents;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Extract first_action and last_action performed in each user session using FIRST_VALUE and LAST_VALUE.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Setting window frame ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING correctly binds LAST_VALUE.",
    "answer": "SELECT DISTINCT \n  session_id,\n  FIRST_VALUE(action) OVER (PARTITION BY session_id ORDER BY event_time \n    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS first_action,\n  LAST_VALUE(action) OVER (PARTITION BY session_id ORDER BY event_time \n    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_action\nFROM SessionEvents;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-96",
    "slug": "sql-cross-join-matrix-generation",
    "title": "Generate Full Matrix of All Store and Product Combinations",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT s.store_id, s.store_name, p.id AS product_id, p.name AS product_name, COALESCE(inv.stock, 0) AS current_stock\nFROM Stores s\nCROSS JOIN Products p\nLEFT JOIN Inventory inv ON s.store_id = inv.store_id AND p.id = inv.product_id\nWHERE COALESCE(inv.stock, 0) = 0;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Generate a Cartesian matrix of all Stores and Products to find zero-stock combinations.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "CROSS JOIN generates every possible permutation, and LEFT JOIN highlights missing inventory pairs.",
    "answer": "SELECT s.store_id, s.store_name, p.id AS product_id, p.name AS product_name, COALESCE(inv.stock, 0) AS current_stock\nFROM Stores s\nCROSS JOIN Products p\nLEFT JOIN Inventory inv ON s.store_id = inv.store_id AND p.id = inv.product_id\nWHERE COALESCE(inv.stock, 0) = 0;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-97",
    "slug": "sql-anti-join-unregistered-customers",
    "title": "High-Speed Anti-Join Pattern for Unpurchased Products",
    "difficulty": "interview",
    "topic": "Performance & Indexing",
    "tags": [
      "Performance & Indexing",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT p.id, p.name, p.price\nFROM Products p\nWHERE NOT EXISTS (\n  SELECT 1 \n  FROM OrderItems oi \n  WHERE oi.productId = p.id\n);",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Implement high-performance NOT EXISTS anti-join to extract unpurchased catalog items.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "NOT EXISTS terminates subquery execution immediately upon finding first match, outperforming NOT IN.",
    "answer": "SELECT p.id, p.name, p.price\nFROM Products p\nWHERE NOT EXISTS (\n  SELECT 1 \n  FROM OrderItems oi \n  WHERE oi.productId = p.id\n);",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-98",
    "slug": "sql-b-tree-composite-index-order",
    "title": "Composite Index Column Ordering Optimization",
    "difficulty": "interview",
    "topic": "Performance & Indexing",
    "tags": [
      "Performance & Indexing",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "SELECT id, tenant_id, status, created_at, payload\nFROM EventLogs\nWHERE tenant_id = 'org_492'\n  AND status = 'FAILED'\n  AND created_at >= '2026-09-01'\nORDER BY created_at DESC;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Select records optimizing for composite index (tenant_id, status, created_at).\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Equality filters (tenant_id, status) placed first allow range filter (created_at) to utilize index seek.",
    "answer": "SELECT id, tenant_id, status, created_at, payload\nFROM EventLogs\nWHERE tenant_id = 'org_492'\n  AND status = 'FAILED'\n  AND created_at >= '2026-09-01'\nORDER BY created_at DESC;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-99",
    "slug": "sql-running-ntile-quartiles",
    "title": "Segment Customers into Revenue Quartiles (NTILE)",
    "difficulty": "interview",
    "topic": "Window Functions",
    "tags": [
      "Window Functions",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH CustomerSpend AS (\n  SELECT customerId, SUM(amount) AS total_spend\n  FROM Orders\n  GROUP BY customerId\n)\nSELECT \n  customerId,\n  total_spend,\n  NTILE(4) OVER (ORDER BY total_spend DESC) AS spend_quartile\nFROM CustomerSpend;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Divide customers into 4 equal quartiles (1=Top 25%, 4=Bottom 25%) based on lifetime spend.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "NTILE(4) partitions the sorted customer dataset into 4 balanced distribution tiers.",
    "answer": "WITH CustomerSpend AS (\n  SELECT customerId, SUM(amount) AS total_spend\n  FROM Orders\n  GROUP BY customerId\n)\nSELECT \n  customerId,\n  total_spend,\n  NTILE(4) OVER (ORDER BY total_spend DESC) AS spend_quartile\nFROM CustomerSpend;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  },
  {
    "id": "sql-100",
    "slug": "sql-mastery-full-relational-audit",
    "title": "Toolique Flagship: Full Relational Reconciliation Audit",
    "difficulty": "interview",
    "topic": "FAANG Scenarios",
    "tags": [
      "FAANG Scenarios",
      "Interview",
      "Advanced",
      "FAANG"
    ],
    "starterCode": "-- Write your SQL query here\nSELECT \n;",
    "progressiveHints": [
      "Think about Window functions like DENSE_RANK, LAG/LEAD, or CTEs.",
      "Check if grouping or partitioning by entity ID isolates the required segments.",
      "Construct a Common Table Expression (CTE) to structure intermediate calculation layers."
    ],
    "optimizedAnswer": "WITH OrderTotals AS (\n  SELECT customerId, SUM(amount) AS gross_orders\n  FROM Orders GROUP BY customerId\n),\nPaymentTotals AS (\n  SELECT customer_id, SUM(amount) AS total_paid\n  FROM Payments WHERE status = 'SETTLED' GROUP BY customer_id\n)\nSELECT \n  c.id, c.name,\n  COALESCE(ot.gross_orders, 0) AS total_ordered,\n  COALESCE(pt.total_paid, 0) AS total_paid,\n  (COALESCE(ot.gross_orders, 0) - COALESCE(pt.total_paid, 0)) AS outstanding_balance\nFROM Customers c\nLEFT JOIN OrderTotals ot ON c.id = ot.customerId\nLEFT JOIN PaymentTotals pt ON c.id = pt.customer_id\nWHERE (COALESCE(ot.gross_orders, 0) - COALESCE(pt.total_paid, 0)) > 0\nORDER BY outstanding_balance DESC;",
    "validationRules": {
      "ignoreOrder": true
    },
    "question": "Reconcile customer accounts against orders, payments, and discounts to detect discrepancy balances.\n\n### Requirement:\nProvide an efficient standard SQL query satisfying all edge-case constraints.",
    "hint": "Use window functions (OVER PARTITION BY) or Recursive CTEs.",
    "explanation": "Consolidates multi-table sub-aggregates to perform complete enterprise financial reconciliation.",
    "answer": "WITH OrderTotals AS (\n  SELECT customerId, SUM(amount) AS gross_orders\n  FROM Orders GROUP BY customerId\n),\nPaymentTotals AS (\n  SELECT customer_id, SUM(amount) AS total_paid\n  FROM Payments WHERE status = 'SETTLED' GROUP BY customer_id\n)\nSELECT \n  c.id, c.name,\n  COALESCE(ot.gross_orders, 0) AS total_ordered,\n  COALESCE(pt.total_paid, 0) AS total_paid,\n  (COALESCE(ot.gross_orders, 0) - COALESCE(pt.total_paid, 0)) AS outstanding_balance\nFROM Customers c\nLEFT JOIN OrderTotals ot ON c.id = ot.customerId\nLEFT JOIN PaymentTotals pt ON c.id = pt.customer_id\nWHERE (COALESCE(ot.gross_orders, 0) - COALESCE(pt.total_paid, 0)) > 0\nORDER BY outstanding_balance DESC;",
    "companies": [
      "Google",
      "Meta",
      "Amazon",
      "Apple",
      "Netflix",
      "Microsoft",
      "Stripe"
    ],
    "relatedQuestions": [
      "sql-second-highest-salary",
      "sql-department-top-three-salaries"
    ]
  }
];

export const sqlQuestionMap = new Map(sqlQuestions.map(q => [q.slug, q]));
