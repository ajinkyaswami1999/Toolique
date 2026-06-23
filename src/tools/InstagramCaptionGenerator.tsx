import { useState } from 'react';
import { Copy, Sparkles, Check, RefreshCw } from 'lucide-react';

const CAPTION_TEMPLATES: Record<string, string[]> = {
  aesthetic: [
    "chasing light and sweet moments. ✨ [KEYWORDS]",
    "soft hours & warm thoughts. ☕💭 [KEYWORDS]",
    "finding magic in the ordinary. 🌿 [KEYWORDS]",
    "just standard visual poetry. 🌅 [KEYWORDS]",
    "aesthetic state of mind. ✨ [KEYWORDS]"
  ],
  funny: [
    "I'm actually not funny, I'm just mean and people think I'm joking. 🤪 [KEYWORDS]",
    "reality called, so I hung up. 📞❌ [KEYWORDS]",
    "another day, another post I'll look back at and cringe. 🫣 [KEYWORDS]",
    "doing adult stuff today. 0/10 would not recommend. 🙃 [KEYWORDS]",
    "my favorite hobby is collecting hobbies I will never finish. 🎨 [KEYWORDS]"
  ],
  motivational: [
    "Dream big. Work hard. Keep it simple. 🚀 [KEYWORDS]",
    "Make today your masterpiece. 🎨 [KEYWORDS]",
    "Progress over perfection, always. 💪 [KEYWORDS]",
    "Consistency beats talent when talent doesn't work. 🔥 [KEYWORDS]",
    "Focus on the step in front of you, not the whole staircase. 🌟 [KEYWORDS]"
  ],
  minimal: [
    "[KEYWORDS] 🤍",
    "Moments. ✨ [KEYWORDS]",
    "Less is more. [KEYWORDS]",
    "Unfiltered. 🌿 [KEYWORDS]",
    "Today's view. ☁️ [KEYWORDS]"
  ],
  professional: [
    "Reflecting on key milestones and stepping into the next phase of growth. 📈 [KEYWORDS]",
    "Excited to share our latest project milestone. Success is a collaborative effort. 💼 [KEYWORDS]",
    "Innovation, strategy, and execution in motion. Let's build! 💡 [KEYWORDS]",
    "Focusing on the long-term vision. Consistent effort equals exponential returns. 🚀 [KEYWORDS]",
    "Proud of the dedication this team brings to the table every single day. 🙌 [KEYWORDS]"
  ],
  quote: [
    "\"Be yourself; everyone else is already taken.\" ✨ [KEYWORDS]",
    "\"The only way to do great work is to love what you do.\" – Steve Jobs 💡 [KEYWORDS]",
    "\"In the middle of difficulty lies opportunity.\" – Albert Einstein 🌟 [KEYWORDS]",
    "\"Your time is limited, so don't waste it living someone else's life.\" ⏳ [KEYWORDS]",
    "\"Action is the foundational key to all success.\" – Pablo Picasso 🔑 [KEYWORDS]"
  ]
};

const SUGGESTED_HASHTAGS: Record<string, string[]> = {
  aesthetic: ["#aesthetic", "#vibes", "#mood", "#vintage", "#minimal", "#photography"],
  funny: ["#funny", "#lol", "#meme", "#humor", "#cringe", "#relatable"],
  motivational: ["#motivation", "#goals", "#grind", "#success", "#mindset", "#growth"],
  minimal: ["#minimal", "#clean", "#moodygram", "#simplicity", "#neutralstyle"],
  professional: ["#professional", "#networking", "#business", "#career", "#strategy", "#leadership"],
  quote: ["#quotes", "#inspiration", "#thoughts", "#philosophy", "#wise-words"]
};

export default function InstagramCaptionGenerator() {
  const [description, setDescription] = useState<string>('');
  const [vibe, setVibe] = useState<string>('aesthetic');
  const [emojiMode, setEmojiMode] = useState<'normal' | 'none' | 'heavy'>('normal');
  const [includeTags, setIncludeTags] = useState<boolean>(true);
  const [captions, setCaptions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateCaptions = () => {
    const templates = CAPTION_TEMPLATES[vibe] || CAPTION_TEMPLATES.aesthetic;
    const tags = SUGGESTED_HASHTAGS[vibe] || [];
    const keywordsText = description.trim() ? description.trim() : "visuals";

    const results = templates.map((tpl) => {
      let cap = tpl.replace('[KEYWORDS]', keywordsText);

      // Process emoji modes
      if (emojiMode === 'none') {
        // Remove standard emojis using regex
        cap = cap.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '');
      } else if (emojiMode === 'heavy') {
        const extraEmojis = vibe === 'aesthetic' ? " ✨🌅☁️" 
                           : vibe === 'funny' ? " 😂🤪💀" 
                           : vibe === 'motivational' ? " 🚀💪🔥" 
                           : vibe === 'minimal' ? " 🌿🤍☁️" 
                           : vibe === 'professional' ? " 📈💼💡" 
                           : " 🌟📜✨";
        cap = cap + extraEmojis;
      }

      if (includeTags && tags.length > 0) {
        // Pick 3 random tags
        const shuffled = [...tags].sort(() => 0.5 - Math.random());
        const selectedTags = shuffled.slice(0, 3).join(' ');
        cap = `${cap}\n\n${selectedTags}`;
      }

      return cap.trim();
    });

    setCaptions(results);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Settings Form */}
      <div className="lg:col-span-5 saas-card p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
          <span>Caption Settings</span>
        </h3>

        <div className="space-y-4">
          {/* Post Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">What is your post about?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="saas-input h-24 resize-none"
              placeholder="e.g. morning coffee walk in the park, working on React coding project"
            />
          </div>

          {/* Vibe Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">Select Vibe</label>
            <select
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="saas-select capitalize"
            >
              <option value="aesthetic">Aesthetic ✨</option>
              <option value="funny">Funny 🤪</option>
              <option value="motivational">Motivational 🚀</option>
              <option value="minimal">Minimal 🤍</option>
              <option value="professional">Professional 💼</option>
              <option value="quote">Quote 📜</option>
            </select>
          </div>

          {/* Emojis selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">Emoji Density</label>
            <div className="grid grid-cols-3 gap-2">
              {(['none', 'normal', 'heavy'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setEmojiMode(mode)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border capitalize transition ${
                    emojiMode === mode
                      ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                      : 'bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-650 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  {mode === 'none' ? 'No Emojis' : mode === 'heavy' ? 'Emoji-heavy' : 'Normal'}
                </button>
              ))}
            </div>
          </div>

          {/* Include Hashtags Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-b border-zinc-100 dark:border-zinc-850">
            <span className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Append Recommended Hashtags</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeTags}
                onChange={(e) => setIncludeTags(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <button
            onClick={generateCaptions}
            className="saas-button-primary w-full cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Captions</span>
          </button>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-7 saas-card p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <span>Generated Caption Proposals</span>
        </h3>

        {captions.length > 0 ? (
          <div className="space-y-4">
            {captions.map((cap, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-850 space-y-3 relative group"
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  <span>Proposal #{idx + 1}</span>
                  <span>{cap.length} characters</span>
                </div>
                <p className="text-sm text-zinc-850 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed select-all font-medium">
                  {cap}
                </p>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleCopy(cap, idx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:text-indigo-650 dark:hover:text-indigo-400 transition cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-green-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Caption</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-600 border-2 border-dashed border-zinc-100 dark:border-zinc-850 rounded-2xl">
            <Sparkles className="w-10 h-10 mb-3 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm font-semibold">Enter keywords & click Generate</p>
            <p className="text-xs text-zinc-450 mt-1">Captions tailored with dynamic styling will display here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
