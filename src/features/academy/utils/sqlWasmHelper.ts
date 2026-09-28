// SQLite WASM Database Initializer & Mock Schemas
import initSqlJs from 'sql.js';

export const SQL_MOCK_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS Customers (id INT PRIMARY KEY, name VARCHAR(50), country VARCHAR(50));
INSERT INTO Customers VALUES (1, 'Joe', 'USA'), (2, 'Henry', 'Canada'), (3, 'Sam', 'India'), (4, 'Max', 'UK'), (5, 'Alice', 'Germany');

CREATE TABLE IF NOT EXISTS Customer (id INT PRIMARY KEY, name VARCHAR(50), referee_id INT);
INSERT INTO Customer VALUES (1, 'Will', NULL), (2, 'Jane', NULL), (3, 'Alex', 2), (4, 'Bill', NULL), (5, 'Zack', 1), (6, 'Mark', 2);

CREATE TABLE IF NOT EXISTS Orders (id INT PRIMARY KEY, customerId INT, amount INT, orderDate DATE);
INSERT INTO Orders VALUES (1, 3, 500, '2026-02-15'), (2, 1, 300, '2026-03-20'), (3, 1, 450, '2026-05-10'), (4, 2, 150, '2026-07-22');

CREATE TABLE IF NOT EXISTS Products (id INT PRIMARY KEY, name VARCHAR(50), category VARCHAR(50), price INT, stock INT);
INSERT INTO Products VALUES (1, 'Laptop', 'Tech', 80000, 15), (2, 'Mouse', 'Tech', 1500, 40), (3, 'Monitor', 'Tech', 15000, 0), (4, 'Shirt', 'Apparel', 1200, 50), (5, 'Phone', 'Tech', 60000, 10);

CREATE TABLE IF NOT EXISTS OrderItems (id INT PRIMARY KEY, orderId INT, productId INT, quantity INT);
INSERT INTO OrderItems VALUES (1, 1, 1, 1), (2, 1, 2, 2), (3, 2, 4, 3), (4, 3, 5, 1);

CREATE TABLE IF NOT EXISTS Employee (id INT PRIMARY KEY, name VARCHAR(50), salary INT, departmentId INT, managerId INT, company VARCHAR(50), month INT);
INSERT INTO Employee VALUES (1, 'Joe', 70000, 1, 3, 'A', 1), (2, 'Jim', 90000, 1, NULL, 'A', 1), (3, 'Henry', 80000, 2, 4, 'B', 1), (4, 'Sam', 60000, 2, NULL, 'B', 1), (5, 'Max', 90000, 1, NULL, 'A', 1);

CREATE TABLE IF NOT EXISTS Department (id INT PRIMARY KEY, name VARCHAR(50), revenue INT, month VARCHAR(10));
INSERT INTO Department VALUES (1, 'IT', 8000, 'Jan'), (2, 'Sales', 7000, 'Jan'), (1, 'IT', 9000, 'Feb');

CREATE TABLE IF NOT EXISTS Person (id INT PRIMARY KEY, email VARCHAR(100), firstName VARCHAR(50), lastName VARCHAR(50));
INSERT INTO Person VALUES (1, 'a@b.com', 'Allen', 'Wang'), (2, 'c@d.com', 'Bob', 'Alice'), (3, 'a@b.com', 'Charlie', 'Brown');

CREATE TABLE IF NOT EXISTS Address (id INT PRIMARY KEY, personId INT, city VARCHAR(50), state VARCHAR(50));
INSERT INTO Address VALUES (1, 2, 'New York City', 'New York');

CREATE TABLE IF NOT EXISTS Weather (id INT PRIMARY KEY, recordDate DATE, temperature INT);
INSERT INTO Weather VALUES (1, '2026-01-01', 10), (2, '2026-01-02', 25), (3, '2026-01-03', 20), (4, '2026-01-04', 30);

CREATE TABLE IF NOT EXISTS Cinema (id INT PRIMARY KEY, movie VARCHAR(50), description VARCHAR(50), rating FLOAT);
INSERT INTO Cinema VALUES (1, 'War', 'great 3D', 8.9), (2, 'Science', 'fiction', 8.5), (3, 'Irish', 'boring', 6.2), (4, 'Ice song', 'Fantacy', 8.6), (5, 'House card', 'Interesting', 9.1);

CREATE TABLE IF NOT EXISTS Activity (player_id INT, device_id INT, event_date DATE, games_played INT, activity_date DATE, user_id INT);
INSERT INTO Activity VALUES (1, 2, '2026-03-01', 5, '2026-07-25', 1), (1, 2, '2026-03-02', 6, '2026-07-26', 1), (2, 3, '2026-06-25', 1, '2026-07-27', 2);

CREATE TABLE IF NOT EXISTS World (name VARCHAR(50), continent VARCHAR(50), area INT, population INT, gdp BIGINT);
INSERT INTO World VALUES ('Afghanistan', 'Asia', 652230, 25500100, 20343000000), ('Albania', 'Europe', 28748, 2831741, 12960000000), ('Algeria', 'Africa', 2381741, 37100000, 188681000000);

CREATE TABLE IF NOT EXISTS Scores (id INT PRIMARY KEY, score FLOAT);
INSERT INTO Scores VALUES (1, 3.50), (2, 3.65), (3, 4.00), (4, 3.85), (5, 4.00), (6, 3.65);

CREATE TABLE IF NOT EXISTS Logs (id INT PRIMARY KEY, num INT);
INSERT INTO Logs VALUES (1, 1), (2, 1), (3, 1), (4, 2), (5, 1), (6, 2), (7, 2);

CREATE TABLE IF NOT EXISTS Logins (id INT PRIMARY KEY, user_id INT, login_date DATE);
INSERT INTO Logins VALUES (1, 1, '2026-09-01'), (2, 1, '2026-09-02'), (3, 1, '2026-09-03'), (4, 1, '2026-09-04'), (5, 1, '2026-09-05');

CREATE TABLE IF NOT EXISTS Stadium (id INT PRIMARY KEY, visit_date DATE, people INT);
INSERT INTO Stadium VALUES (1, '2026-01-01', 10), (2, '2026-01-02', 109), (3, '2026-01-03', 150), (4, '2026-01-04', 99), (5, '2026-01-05', 145), (6, '2026-01-06', 1455), (7, '2026-01-07', 199);

CREATE TABLE IF NOT EXISTS Queue (person_id INT PRIMARY KEY, person_name VARCHAR(50), weight INT, turn INT);
INSERT INTO Queue VALUES (1, 'Alice', 250, 1), (2, 'Bob', 350, 2), (3, 'Charlie', 400, 3), (4, 'David', 200, 4);

CREATE TABLE IF NOT EXISTS Users (id INT PRIMARY KEY, user_id INT, name VARCHAR(50), country VARCHAR(50), status VARCHAR(20), join_date DATE, account INT, mail VARCHAR(50));
INSERT INTO Users VALUES (1, 1, 'Joe', 'USA', 'active', '2026-01-01', 101, 'a@toolique.com'), (2, 2, 'Raj', 'India', 'active', '2026-02-01', 102, 'b@toolique.com');

CREATE TABLE IF NOT EXISTS Rides (id INT PRIMARY KEY, user_id INT, distance INT);
INSERT INTO Rides VALUES (1, 1, 120), (2, 2, 317), (3, 1, 222);

CREATE TABLE IF NOT EXISTS Triangle (x INT, y INT, z INT);
INSERT INTO Triangle VALUES (13, 15, 30), (10, 20, 15);

CREATE TABLE IF NOT EXISTS MyNumbers (num INT);
INSERT INTO MyNumbers VALUES (8), (8), (3), (3), (1), (4), (5), (6);

CREATE TABLE IF NOT EXISTS Views (article_id INT, author_id INT, viewer_id INT, view_date DATE);
INSERT INTO Views VALUES (1, 3, 5, '2026-08-01'), (2, 7, 7, '2026-08-01'), (2, 7, 6, '2026-08-02'), (4, 7, 7, '2026-07-22');
`;

export interface MockTableMeta {
  name: string;
  description: string;
  columns: { name: string; type: string }[];
  sampleQuery: string;
}

export const MOCK_TABLES_METADATA: MockTableMeta[] = [
  {
    name: 'Customers',
    description: 'Customer profiles with geographic country origin',
    columns: [
      { name: 'id', type: 'INT PRIMARY KEY' },
      { name: 'name', type: 'VARCHAR(50)' },
      { name: 'country', type: 'VARCHAR(50)' }
    ],
    sampleQuery: 'SELECT country, COUNT(*) as total FROM Customers GROUP BY country;'
  },
  {
    name: 'Orders',
    description: 'E-commerce purchase orders with customer associations',
    columns: [
      { name: 'id', type: 'INT PRIMARY KEY' },
      { name: 'customerId', type: 'INT' },
      { name: 'amount', type: 'INT' },
      { name: 'orderDate', type: 'DATE' }
    ],
    sampleQuery: 'SELECT c.name, SUM(o.amount) AS TotalSpend FROM Customers c JOIN Orders o ON c.id = o.customerId GROUP BY c.name;'
  },
  {
    name: 'Products',
    description: 'Product catalog with prices, stock levels, and categories',
    columns: [
      { name: 'id', type: 'INT PRIMARY KEY' },
      { name: 'name', type: 'VARCHAR(50)' },
      { name: 'category', type: 'VARCHAR(50)' },
      { name: 'price', type: 'INT' },
      { name: 'stock', type: 'INT' }
    ],
    sampleQuery: 'SELECT name, price, stock FROM Products WHERE stock > 0 ORDER BY price DESC;'
  },
  {
    name: 'Employee',
    description: 'Corporate employee roster with salary, manager relations, and departments',
    columns: [
      { name: 'id', type: 'INT PRIMARY KEY' },
      { name: 'name', type: 'VARCHAR(50)' },
      { name: 'salary', type: 'INT' },
      { name: 'departmentId', type: 'INT' },
      { name: 'managerId', type: 'INT' }
    ],
    sampleQuery: 'SELECT name, salary, DENSE_RANK() OVER (ORDER BY salary DESC) as salary_rank FROM Employee;'
  },
  {
    name: 'Scores',
    description: 'Test results used for ranking and window function evaluations',
    columns: [
      { name: 'id', type: 'INT PRIMARY KEY' },
      { name: 'score', type: 'FLOAT' }
    ],
    sampleQuery: 'SELECT score, DENSE_RANK() OVER (ORDER BY score DESC) AS Rank FROM Scores;'
  },
  {
    name: 'Weather',
    description: 'Time-series temperature observations across consecutive calendar dates',
    columns: [
      { name: 'id', type: 'INT PRIMARY KEY' },
      { name: 'recordDate', type: 'DATE' },
      { name: 'temperature', type: 'INT' }
    ],
    sampleQuery: 'SELECT w1.id FROM Weather w1 JOIN Weather w2 ON date(w1.recordDate) = date(w2.recordDate, "+1 day") WHERE w1.temperature > w2.temperature;'
  }
];

let cachedDbInstance: any = null;
let initPromise: Promise<any> | null = null;

export async function initSqlWasm(): Promise<any> {
  if (cachedDbInstance) return cachedDbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // 1. First try local WASM asset bundled in public/sql/
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `/sql/${file}`
      });
      const db = new SQL.Database();
      db.run(SQL_MOCK_SCHEMA_SQL);
      cachedDbInstance = db;
      return db;
    } catch (localErr) {
      console.warn('Local SQLite WASM load failed, attempting CDN fallback:', localErr);
    }

    // 2. Fallback to jsdelivr CDN
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/${file}`
      });
      const db = new SQL.Database();
      db.run(SQL_MOCK_SCHEMA_SQL);
      cachedDbInstance = db;
      return db;
    } catch (cdnErr) {
      console.warn('jsDelivr SQLite WASM load failed, attempting cdnjs fallback:', cdnErr);
    }

    // 3. Fallback to cdnjs CDN
    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });
      const db = new SQL.Database();
      db.run(SQL_MOCK_SCHEMA_SQL);
      cachedDbInstance = db;
      return db;
    } catch (finalErr) {
      console.error('All SQLite WASM initialization methods failed:', finalErr);
      initPromise = null;
      throw finalErr;
    }
  })();

  return initPromise;
}
