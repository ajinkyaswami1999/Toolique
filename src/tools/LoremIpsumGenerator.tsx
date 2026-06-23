import { useState, useEffect } from 'react';
import { Copy, Sparkles, AlignLeft, Check } from 'lucide-react';

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", 
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", 
  "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud", 
  "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", 
  "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit", 
  "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", 
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", 
  "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

const BASE_PARAGRAPHS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
  "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure.",
  "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
  "On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided."
];

export default function LoremIpsumGenerator() {
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words' | 'lists'>('paragraphs');
  const [count, setCount] = useState<number>(3);
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [includeHtml, setIncludeHtml] = useState<boolean>(false);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generateWords = (numWords: number): string => {
    let result: string[] = [];
    if (startWithLorem && numWords > 0) {
      result = ["Lorem", "ipsum", "dolor", "sit", "amet"];
    }
    while (result.length < numWords) {
      const idx = Math.floor(Math.random() * LOREM_WORDS.length);
      result.push(LOREM_WORDS[idx]);
    }
    // Capitalize first letter
    const text = result.join(' ');
    return text.charAt(0).toUpperCase() + text.slice(1) + '.';
  };

  const generateSentences = (numSentences: number): string => {
    const sentences: string[] = [];
    for (let i = 0; i < numSentences; i++) {
      const sentenceLength = 6 + Math.floor(Math.random() * 12);
      let s = generateWords(sentenceLength);
      // Remove trailing period inside words helper if any, and ensure it ends with period
      if (s.endsWith('.')) s = s.slice(0, -1);
      sentences.push(s + '.');
    }
    if (startWithLorem && sentences.length > 0) {
      sentences[0] = sentences[0].replace(/^[a-zA-Z]+/, "Lorem");
    }
    return sentences.join(' ');
  };

  const generateText = () => {
    let output = '';

    if (type === 'paragraphs') {
      const paras: string[] = [];
      for (let i = 0; i < count; i++) {
        // pick from BASE_PARAGRAPHS or generate random
        let p = BASE_PARAGRAPHS[i % BASE_PARAGRAPHS.length];
        if (i >= BASE_PARAGRAPHS.length) {
          p = generateSentences(4 + Math.floor(Math.random() * 4));
        }
        if (i === 0 && !startWithLorem) {
          p = p.replace(/^Lorem ipsum dolor sit amet, /i, '');
          p = p.charAt(0).toUpperCase() + p.slice(1);
        }
        paras.push(includeHtml ? `<p>${p}</p>` : p);
      }
      output = paras.join(includeHtml ? '\n' : '\n\n');
    } else if (type === 'sentences') {
      output = generateSentences(count);
    } else if (type === 'words') {
      output = generateWords(count);
    } else if (type === 'lists') {
      const items: string[] = [];
      if (includeHtml) items.push('<ul>');
      for (let i = 0; i < count; i++) {
        const itemText = generateWords(4 + Math.floor(Math.random() * 6));
        items.push(includeHtml ? `  <li>${itemText}</li>` : `- ${itemText}`);
      }
      if (includeHtml) items.push('</ul>');
      output = items.join('\n');
    }

    setGeneratedText(output);
  };

  useEffect(() => {
    generateText();
  }, [type, count, startWithLorem, includeHtml]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
      {/* Settings Panel */}
      <div className="saas-card p-6 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-indigo-500" />
              <span>Lorem Ipsum Builder</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Generate standard dummy text placeholders.</p>
          </div>

          {/* Type Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">Generator Unit</label>
            <div className="grid grid-cols-2 gap-2">
              {(['paragraphs', 'sentences', 'words', 'lists'] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => {
                    setType(unit);
                    setCount(unit === 'words' ? 50 : 3);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl border transition capitalize ${
                    type === unit
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-450 uppercase tracking-wider">
              <span>Quantity</span>
              <span className="text-indigo-600 dark:text-indigo-400">{count} {type}</span>
            </div>
            <input
              type="range"
              min={1}
              max={type === 'words' ? 500 : 30}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Checkbox Options */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/20"
              />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Start with "Lorem ipsum..."
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeHtml}
                onChange={(e) => setIncludeHtml(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/20"
              />
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Wrap in HTML tags (e.g. &lt;p&gt;, &lt;li&gt;)
              </span>
            </label>
          </div>
        </div>

        <button
          onClick={generateText}
          className="w-full py-3 mt-6 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-zinc-700"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Regenerate Text</span>
        </button>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-2 saas-card p-6 space-y-6 flex flex-col justify-between">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Generated Text</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Use the copied text as content mockups.</p>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>
        </div>

        <div className="flex-1 mt-4">
          <textarea
            readOnly
            value={generatedText}
            className="w-full h-[380px] font-sans text-sm p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-205 dark:border-zinc-850 rounded-xl outline-none resize-none leading-relaxed text-zinc-750 dark:text-zinc-350"
          />
        </div>
      </div>
    </div>
  );
}
