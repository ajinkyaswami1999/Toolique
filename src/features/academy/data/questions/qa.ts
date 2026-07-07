import type { Question } from '../../types';
import { sqlQuestions } from './sql';
import { pythonQuestions } from './python';
import { javascriptQuestions } from './javascript';
import { reactQuestions } from './react';

export const qaQuestions: Question[] = [
  {
    id: 'qa-1',
    slug: 'qa-selenium-explicit-wait',
    title: 'Write a Robust Selenium Explicit Wait',
    difficulty: 'beginner',
    topic: 'Selenium WebDriver',
    tags: ['Selenium', 'Locators', 'Synchronization'],
    starterCode: `from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\n\ndef run_selenium_wait(driver):\n    driver.get("https://www.toolique.in")\n    # Click button and wait explicitly up to 10 seconds for .result-container\n    pass`,
    progressiveHints: [
      'Locate and click the button with ID calculate-btn first.',
      'Initialize WebDriverWait(driver, 10) to wait up to 10 seconds.',
      'Call wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "result-container"))).',
      'This returns the matched element when visible.'
    ],
    functionName: 'run_selenium_wait',
    testCases: [
      {
        input: [],
        expected: true,
        run: "(function() { return true; })()"
      }
    ] as any,
    question: `Write a Python code snippet using Selenium WebDriver to:
1. Open the URL \`https://www.toolique.in\`.
2. Click on a button with ID \`calculate-btn\`.
3. Wait up to **10 seconds** explicitly for a result card with class name \`result-container\` to become visible.

### Code Boilerplate:
\`\`\`python
from selenium import webdriver

driver = webdriver.Chrome()
# Write wait and click logic
\`\`\``,
    hint: 'Use WebDriverWait along with expected_conditions (EC) to sync the test execution with asynchronous page loads.',
    explanation: `Using implicit sleep timers like \`time.sleep(5)\` slows down testing suites.
To optimize synchronization:
1. Define a wait utility using \`WebDriverWait(driver, 10)\`.
2. Use expected conditions: \`EC.visibility_of_element_located((By.CLASS_NAME, "result-container"))\`.
3. The driver will poll the DOM dynamically and proceed the microsecond the element renders, up to a maximum timeout of 10s.`,
    answer: `from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nfrom selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\n\ndef run_selenium_wait(driver):\n    driver.get("https://www.toolique.in")\n    btn = driver.find_element(By.ID, "calculate-btn")\n    btn.click()\n    result_card = WebDriverWait(driver, 10).until(\n        EC.visibility_of_element_located((By.CLASS_NAME, "result-container"))\n    )\n    return result_card`,
    sampleInput: `Automation script triggers and page takes 2.5 seconds to calculate.`,
    sampleOutput: `Console logs: Result displayed: ...\nScript exits in ~3.2 seconds.`,
    companies: ['Accenture', 'TCS', 'Infosys', 'Capgemini'],
    relatedQuestions: ['qa-playwright-locators-click']
  },
  {
    id: 'qa-2',
    slug: 'qa-playwright-locators-click',
    title: 'Locate and Click Elements in Playwright',
    difficulty: 'intermediate',
    topic: 'Playwright',
    tags: ['Playwright', 'Locators', 'TypeScript'],
    starterCode: `import { test, expect } from '@playwright/test';\n\ntest('verify github link', async ({ page, context }) => {\n  // Navigate and click Github link inside .social-grid\n});`,
    progressiveHints: [
      'Call await page.goto("https://www.toolique.in/about-founder").',
      'Use context.waitForEvent("page") to wait for the new tab to open.',
      'Locate and click the link inside .social-grid using page.locator(".social-grid").getByText("GitHub").',
      'Await the page event promise and assert the new tab URL.'
    ],
    functionName: 'verify_github',
    testCases: [
      {
        input: [],
        expected: true,
        run: "(function() { return true; })()"
      }
    ] as any,
    question: `Write a Playwright test snippet in TypeScript to:
1. Navigate to \`https://www.toolique.in/about-founder\`.
2. Click a link containing the text \`GitHub\` inside a social links container with class \`social-grid\`.
3. Verify that the new tab page URL contains \`github.com\`.

### Code Boilerplate:
\`\`\`typescript
import { test, expect } from '@playwright/test';

test('verify github link', async ({ page, context }) => {
  // Write testing script
});
\`\`\``,
    hint: 'Use playwright\'s locator chains like page.locator(\'.social-grid\').getByRole(\'link\', { name: \'GitHub\' }) and monitor new pages inside the context.',
    explanation: `Playwright handles multiple tabs/pages by listening to events on the browser context:
1. Start listening for the \`page\` event on the context: \`const pagePromise = context.waitForEvent('page')\`.
2. Locate the link using semantic filters: \`page.locator('.social-grid').getByText('GitHub')\`.
3. Click the link. This triggers the tab opening.
4. Await the page promise to resolve the target tab: \`const newTab = await pagePromise\`.
5. Run assertion: \`await expect(newTab).toHaveURL(/github\\.com/)\`.`,
    answer: `import { test, expect } from '@playwright/test';\n\ntest('verify github link click opens new tab', async ({ page, context }) => {\n  await page.goto('https://www.toolique.in/about-founder');\n  const pagePromise = context.waitForEvent('page');\n  await page.locator('.social-grid').getByText('GitHub').click();\n  const newPage = await pagePromise;\n  await expect(newPage).toHaveURL(/github\\.com/);\n});`,
    sampleInput: `Runner executes Playwright test.`,
    sampleOutput: `1 passed (3.4s)`,
    companies: ['Google', 'Meta', 'Microsoft'],
    relatedQuestions: ['qa-selenium-explicit-wait']
  }
];

export const qaQuestionMap = new Map(qaQuestions.map(q => [q.slug, q]));
export const allQuestions = [
  ...sqlQuestions,
  ...pythonQuestions,
  ...javascriptQuestions,
  ...reactQuestions,
  ...qaQuestions
];
export const allQuestionMap = new Map(allQuestions.map(q => [q.slug, q]));
