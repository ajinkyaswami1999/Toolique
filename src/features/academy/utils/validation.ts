export interface ValidationResult {
  passed: boolean;
  status: 'correct' | 'incorrect' | 'syntax_error' | 'columns_mismatch' | 'rows_mismatch' | 'optimized';
  message: string;
  details?: string;
  testCaseResults?: {
    index: number;
    passed: boolean;
    expected: string;
    actual: string;
    error?: string;
  }[];
}

// Helper to deep compare JSON values ignoring key ordering
function deepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// SQL Query Result Comparison Engine
export function validateSQLQuery(
  db: any,
  userQuery: string,
  officialQuery: string,
  rules: { ignoreOrder?: boolean; matchColumns?: string[] } = {}
): ValidationResult {
  if (!db) {
    return {
      passed: false,
      status: 'syntax_error',
      message: 'SQLite database is not initialized.'
    };
  }

  let userRows: any[] = [];
  let officialRows: any[] = [];

  // 1. Run official query to get expected result set
  try {
    const stmt = db.prepare(officialQuery);
    while (stmt.step()) {
      officialRows.push(stmt.getAsObject());
    }
  } catch (err: any) {
    return {
      passed: false,
      status: 'syntax_error',
      message: `System Error: Recommended query failed to execute. Details: ${err.message}`
    };
  }

  // 2. Run user query and catch syntax issues
  try {
    const stmt = db.prepare(userQuery);
    while (stmt.step()) {
      userRows.push(stmt.getAsObject());
    }
  } catch (err: any) {
    return {
      passed: false,
      status: 'syntax_error',
      message: `❌ SQL Syntax Error: ${err.message}`
    };
  }

  if (userRows.length === 0 && officialRows.length > 0) {
    return {
      passed: false,
      status: 'rows_mismatch',
      message: '❌ Empty result set. Query returned no rows.'
    };
  }

  // 3. Match column headers
  const userCols = Object.keys(userRows[0] || {});

  // Case insensitive check of column headers if specified
  if (rules.matchColumns) {
    const userColsLower = userCols.map(c => c.toLowerCase());
    const mismatch = rules.matchColumns.some(c => !userColsLower.includes(c.toLowerCase()));
    if (mismatch) {
      return {
        passed: false,
        status: 'columns_mismatch',
        message: `⚠ Column Mismatch: Expected columns like: ${rules.matchColumns.join(', ')}`
      };
    }
  }

  // 4. Match lengths
  if (userRows.length !== officialRows.length) {
    return {
      passed: false,
      status: 'rows_mismatch',
      message: `❌ Rows Mismatch: Returned ${userRows.length} rows, but expected ${officialRows.length}.`
    };
  }

  // 5. Compare result rows content
  let matched = true;
  if (rules.ignoreOrder) {
    // Sort array values before comparing
    const sortStr = (arr: any[]) => 
      arr.map(row => JSON.stringify(Object.keys(row).sort().reduce((obj: any, key) => {
        obj[key] = row[key];
        return obj;
      }, {}))).sort();

    const sortedUser = sortStr(userRows);
    const sortedExpected = sortStr(officialRows);
    matched = deepEqual(sortedUser, sortedExpected);
  } else {
    matched = deepEqual(userRows, officialRows);
  }

  if (!matched) {
    return {
      passed: false,
      status: 'incorrect',
      message: '❌ Incorrect Output: Query result values do not match expected answer.'
    };
  }

  // 6. SQL Optimizer (Simple AST heuristic checking)
  let isOptimized = true;
  let optimizationTip = '';
  const queryLower = userQuery.toLowerCase();

  if (queryLower.includes('select *')) {
    isOptimized = false;
    optimizationTip = 'Avoid SELECT *. Explicitly list columns for improved performance.';
  } else if (queryLower.includes('join') && queryLower.includes('where') && !queryLower.includes('on')) {
    isOptimized = false;
    optimizationTip = 'Prefer explicit JOIN ... ON syntax instead of comma joins in the WHERE clause.';
  }

  return {
    passed: true,
    status: isOptimized ? 'correct' : 'optimized',
    message: isOptimized 
      ? '✅ Correct Answer! Query passed all assertions.' 
      : `✅ Correct Answer! But can be optimized: ${optimizationTip}`
  };
}

// JavaScript assertion executor
export function validateJSCode(
  userCode: string,
  functionName: string,
  testCases: { input: any[]; expected: any; run?: string }[] = []
): ValidationResult {
  const results: any[] = [];
  let allPassed = true;

  // Run each assertion test case
  testCases.forEach((tc, idx) => {
    try {
      // Isolate context inside an self-executing functional scope
      const sandbox = new Function(`
        ${userCode}
        ${tc.run ? `return ${tc.run};` : `return ${functionName}(...${JSON.stringify(tc.input)});`}
      `);

      const actualResult = sandbox();
      const passed = deepEqual(actualResult, tc.expected);
      if (!passed) allPassed = false;

      results.push({
        index: idx,
        passed,
        expected: JSON.stringify(tc.expected),
        actual: JSON.stringify(actualResult)
      });
    } catch (err: any) {
      allPassed = false;
      results.push({
        index: idx,
        passed: false,
        expected: JSON.stringify(tc.expected),
        actual: 'Error',
        error: err.message
      });
    }
  });

  return {
    passed: allPassed,
    status: allPassed ? 'correct' : 'incorrect',
    message: allPassed 
      ? '✅ Correct Answer! All test cases passed.' 
      : '❌ Fail: Some test cases failed to output the expected result.',
    testCaseResults: results
  };
}

// Python assertion executor (utilizing in-browser Pyodide)
export function validatePythonCode(
  pyodide: any,
  userCode: string,
  functionName: string,
  testCases: { input: any[]; expected: any; run?: string }[] = []
): ValidationResult {
  if (!pyodide) {
    return {
      passed: false,
      status: 'syntax_error',
      message: 'Python Pyodide environment is not loaded.'
    };
  }

  const results: any[] = [];
  let allPassed = true;

  try {
    // Load the user's function definition
    pyodide.runPython(userCode);

    testCases.forEach((tc, idx) => {
      try {
        let actualVal: any;
        if (tc.run) {
          // Eval python string run definition
          actualVal = pyodide.runPython(tc.run);
        } else {
          // Construct function call E.g. func(arg1, arg2)
          const argsStr = tc.input.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(', ');
          actualVal = pyodide.runPython(`${functionName}(${argsStr})`);
        }

        // Convert PyProxy references to standard JS types if returned
        const jsActualVal = actualVal && typeof actualVal.toJs === 'function' ? actualVal.toJs() : actualVal;
        const passed = deepEqual(jsActualVal, tc.expected);
        if (!passed) allPassed = false;

        results.push({
          index: idx,
          passed,
          expected: JSON.stringify(tc.expected),
          actual: JSON.stringify(jsActualVal)
        });
      } catch (err: any) {
        allPassed = false;
        results.push({
          index: idx,
          passed: false,
          expected: JSON.stringify(tc.expected),
          actual: 'Error',
          error: err.message
        });
      }
    });
  } catch (err: any) {
    return {
      passed: false,
      status: 'syntax_error',
      message: `❌ Python Compilation Error: ${err.message}`
    };
  }

  return {
    passed: allPassed,
    status: allPassed ? 'correct' : 'incorrect',
    message: allPassed 
      ? '✅ Correct Answer! All Python test cases passed.' 
      : '❌ Fail: Code did not pass all assertions.',
    testCaseResults: results
  };
}
