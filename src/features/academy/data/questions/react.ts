import type { Question } from '../../types';

export const reactQuestions: Question[] = [
  {
    id: 'react-1',
    slug: 'react-useeffect-dependency',
    title: 'Resolve Missing useEffect Dependencies',
    difficulty: 'beginner',
    topic: 'useEffect Hook',
    tags: ['useEffect', 'Hooks', 'Dependencies'],
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
    answer: `\`\`\`jsx
import { useState, useEffect } from 'react';

export default function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Return cleanup function to clear interval on unmount
    return () => clearInterval(interval);
  }, []);

  return <div>Timer: {seconds}s</div>;
}
\`\`\``,
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
    answer: `\`\`\`jsx
import { useState, useEffect } from 'react';

export default function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup event listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}
\`\`\``,
    sampleInput: `User resizes the viewport to 768px.`,
    sampleOutput: `Hook returns 768`,
    companies: ['Meta', 'Amazon', 'Google'],
    relatedQuestions: ['react-useeffect-dependency']
  }
];
export const reactQuestionMap = new Map(reactQuestions.map(q => [q.slug, q]));
