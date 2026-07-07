import type { Question } from '../../types';

export const reactQuestions: Question[] = [
  {
    id: 'react-1',
    slug: 'react-useeffect-dependency',
    title: 'Resolve Missing useEffect Dependencies',
    difficulty: 'beginner',
    topic: 'useEffect Hook',
    tags: ['useEffect', 'Hooks', 'Dependencies'],
    starterCode: `import { useState, useEffect } from 'react';\n\nexport default function Timer() {\n  const [seconds, setSeconds] = useState(0);\n\n  useEffect(() => {\n    // Fix the timer interval and cleanup here\n  }, []);\n\n  return <div>Timer: {seconds}s</div>;\n}`,
    progressiveHints: [
      'The current code closes over seconds=0 because the dependency array is empty.',
      'Use functional state update: setSeconds(prev => prev + 1) to avoid depending on current state directly.',
      'Return a cleanup function from useEffect to clear the interval.',
      'Use clearInterval(interval) inside the returned cleanup function.'
    ],
    functionName: 'Timer',
    testCases: [
      {
        input: [],
        expected: true,
        run: "(function() { return typeof Timer === 'function'; })()"
      }
    ] as any,
    question: `Review the following React component code. Identify why the counter updates erratically and write the correct version to prevent memory leaks and duplicate window event listeners.

\`\`\`jsx
import { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);
  }, []); // Empty dependency array

  return <div>Timer: {seconds}s</div>;
}
\`\`\``,
    hint: 'The setInterval closure captures the initial seconds value (0). You need a cleanup function to clear the interval and functional state updates.',
    explanation: `In the bugged code:
1. The interval references \`seconds\`, but since the dependency array is empty \`[]\`, the closure captures \`seconds = 0\` once. The counter will update from 0 to 1, and then constantly reset to 1.
2. Since the interval is never cleared on unmount, it causes a memory leak if the component leaves the DOM.

**Solutions:**
- Use functional state updates: \`setSeconds(prev => prev + 1)\` which doesn't rely on closed-over states.
- Return a cleanup function: \`return () => clearInterval(interval)\`.`,
    answer: `import { useState, useEffect } from 'react';\n\nexport default function Timer() {\n  const [seconds, setSeconds] = useState(0);\n\n  useEffect(() => {\n    const interval = setInterval(() => {\n      setSeconds(prev => prev + 1);\n    }, 1000);\n\n    return () => clearInterval(interval);\n  }, []);\n\n  return <div>Timer: {seconds}s</div>;\n}`,
    sampleInput: `Component mounts and runs for 3 seconds.`,
    sampleOutput: `Timer: 3s`,
    companies: ['Infosys', 'TCS', 'Accenture'],
    relatedQuestions: ['react-custom-hook-window-width']
  },
  {
    id: 'react-2',
    slug: 'react-custom-hook-window-width',
    title: 'Create a Custom useWindowWidth Hook',
    difficulty: 'intermediate',
    topic: 'Custom Hooks',
    tags: ['Hooks', 'Custom Hooks', 'Resize'],
    starterCode: `import { useState, useEffect } from 'react';\n\nexport default function useWindowWidth() {\n  // Write custom hook implementation\n  return window.innerWidth;\n}`,
    progressiveHints: [
      'Use useState to store the current window.innerWidth.',
      'Use useEffect with empty dependency array [] to register window resize event listener.',
      'Inside useEffect, declare a handler that calls setWidth(window.innerWidth).',
      'Make sure you return a cleanup function that calls window.removeEventListener("resize", handler).'
    ],
    functionName: 'useWindowWidth',
    testCases: [
      {
        input: [],
        expected: true,
        run: "(function() { return typeof useWindowWidth === 'function'; })()"
      }
    ] as any,
    question: `Write a custom React hook \`useWindowWidth()\` that listens to the browser resize event and returns the current window width dynamically. Make sure it cleans up event listeners on unmount.

### Function Signature:
\`\`\`jsx
function useWindowWidth() {
  // Write implementation
}
\`\`\``,
    hint: 'Use useState to store the width and useEffect to attach a resize event listener to the window object.',
    explanation: `To implement \`useWindowWidth\`:
1. Initialize width state: \`const [width, setWidth] = useState(window.innerWidth)\`.
2. Use \`useEffect\` with an empty dependency array \`[]\` to register event listeners once.
3. Define the handler function: \`const handleResize = () => setWidth(window.innerWidth)\`.
4. Attach listener: \`window.addEventListener('resize', handleResize)\`.
5. Return the cleanup function: \`return () => window.removeEventListener('resize', handleResize)\`.`,
    answer: `import { useState, useEffect } from 'react';\n\nexport default function useWindowWidth() {\n  const [width, setWidth] = useState(window.innerWidth);\n\n  useEffect(() => {\n    const handleResize = () => setWidth(window.innerWidth);\n    window.addEventListener('resize', handleResize);\n    return () => window.removeEventListener('resize', handleResize);\n  }, []);\n\n  return width;\n}`,
    sampleInput: `User resizes the viewport to 768px.`,
    sampleOutput: `Hook returns 768`,
    companies: ['Meta', 'Amazon', 'Google'],
    relatedQuestions: ['react-useeffect-dependency']
  }
];
export const reactQuestionMap = new Map(reactQuestions.map(q => [q.slug, q]));
