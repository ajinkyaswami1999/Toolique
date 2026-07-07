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
    answer: `\`\`\`python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
driver.get("https://www.toolique.in")

# Locate and click the button
btn = driver.find_element(By.ID, "calculate-btn")
btn.click()

# Sync and wait explicitly for the result container
result_card = WebDriverWait(driver, 10).until(
    EC.visibility_of_element_located((By.CLASS_NAME, "result-container"))
)

print("Result displayed: ", result_card.text)
driver.quit()
\`\`\``,
    sampleInput: `Automation script triggers and page takes 2.5 seconds to calculate.`,
    sampleOutput: `Console logs: Result displayed: ...
Script exits in ~3.2 seconds.`,
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
    answer: `\`\`\`typescript
import { test, expect } from '@playwright/test';

test('verify github link click opens new tab', async ({ page, context }) => {
  await page.goto('https://www.toolique.in/about-founder');

  // Set up tab listener on the browser context before the click event
  const pagePromise = context.waitForEvent('page');

  // Locate the link inside the specific container and trigger click
  await page.locator('.social-grid').getByText('GitHub').click();

  // Resolve the new tab reference
  const newPage = await pagePromise;

  // Run assertion checks
  await expect(newPage).toHaveURL(/github\\.com/);
});
\`\`\``,
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
