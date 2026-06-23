import { useState } from 'react';
import { Copy, Hash, Check, RefreshCw } from 'lucide-react';

const CATEGORY_HASHTAGS: Record<string, string[]> = {
  business: ["#business", "#entrepreneur", "#marketing", "#startup", "#growth", "#success", "#mindset", "#sales", "#branding", "#digitalmarketing", "#entrepreneurship", "#money", "#work", "#strategy", "#goals"],
  travel: ["#travel", "#wanderlust", "#adventure", "#explore", "#travelphotography", "#nature", "#vacation", "#instatravel", "#trip", "#travelgram", "#landscape", "#solotravel", "#beautifuldestinations", "#travelblogger"],
  fitness: ["#fitness", "#workout", "#gym", "#motivation", "#fit", "#training", "#health", "#lifestyle", "#healthy", "#fitfam", "#exercise", "#bodybuilding", "#cardio", "#crossfit", "#nutrition"],
  food: ["#food", "#foodporn", "#instafood", "#yummy", "#delicious", "#foodie", "#cooking", "#recipe", "#dinner", "#homemade", "#healthyfood", "#foodstagram", "#lunch", "#eat", "#chef"],
  tech: ["#tech", "#technology", "#innovation", "#coding", "#programming", "#developer", "#software", "#ai", "#gadgets", "#future", "#engineering", "#science", "#geek", "#cybersecurity", "#digital"],
  fashion: ["#fashion", "#style", "#ootd", "#love", "#instagood", "#model", "#photography", "#beauty", "#like", "#follow", "#outfit", "#shopping", "#dress", "#instafashion", "#design"],
  art: ["#art", "#artist", "#drawing", "#illustration", "#artwork", "#painting", "#sketch", "#digitalart", "#creative", "#design", "#photography", "#instaart", "#handdrawn", "#abstract", "#galleries"],
  general: ["#explorepage", "#trending", "#viral", "#instagood", "#postoftheday", "#likes", "#follow", "#share", "#instagram", "#love", "#popular", "#foryou", "#reels", "#community"]
};

export default function HashtagGenerator() {
  const [keywords, setKeywords] = useState<string>('');
  const [niche, setNiche] = useState<string>('general');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const generateHashtags = () => {
    // 1. Convert user keywords to hashtags
    const rawWords = keywords
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s,]/g, '')
      .split(/[\s,]+/)
      .filter((w) => w.length > 1);

    const userTags = rawWords.map((w) => `#${w}`);

    // 2. Fetch category hashtags
    const categoryTags = CATEGORY_HASHTAGS[niche] || CATEGORY_HASHTAGS.general;

    // 3. Combine and remove duplicates
    const combined = Array.from(new Set([...userTags, ...categoryTags]));

    // Limit to 30 hashtags for standard Instagram limit
    const finalTags = combined.slice(0, 30);

    setGeneratedTags(finalTags);
    setSelectedTags(finalTags); // Select all by default
  };

  const toggleSelectTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length >= 30) return; // Keep limit
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const copyAll = () => {
    if (selectedTags.length === 0) return;
    navigator.clipboard.writeText(selectedTags.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Settings Form */}
      <div className="lg:col-span-5 saas-card p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <Hash className="w-4.5 h-4.5 text-indigo-500" />
          <span>Hashtag Config</span>
        </h3>

        <div className="space-y-4">
          {/* Keywords input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">Seed Keywords</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="saas-input"
              placeholder="e.g. coffee, coding, workout (comma or space)"
            />
            <span className="text-[10px] text-zinc-400 block mt-0.5">We will auto-format these into hashtags.</span>
          </div>

          {/* Niche Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">Select Niche Tiers</label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="saas-select capitalize"
            >
              <option value="general">Trending / General</option>
              <option value="business">Business & Startups</option>
              <option value="travel">Travel & Adventure</option>
              <option value="fitness">Fitness & Health</option>
              <option value="food">Food & Recipes</option>
              <option value="tech">Technology & AI</option>
              <option value="fashion">Fashion & Style</option>
              <option value="art">Art & Creative Illustration</option>
            </select>
          </div>

          <button
            onClick={generateHashtags}
            className="saas-button-primary w-full cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Hashtags</span>
          </button>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-7 saas-card p-6 space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Hashtag Pool ({selectedTags.length}/30 selected)
          </h3>
          {generatedTags.length > 0 && (
            <button
              onClick={copyAll}
              disabled={selectedTags.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Selection ({selectedTags.length})</span>
                </>
              )}
            </button>
          )}
        </div>

        {generatedTags.length > 0 ? (
          <div className="space-y-5">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tap tags to deselect them from your copy clipboard list.
            </p>

            <div className="flex flex-wrap gap-2">
              {generatedTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleSelectTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border select-none cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60'
                        : 'bg-zinc-50/50 dark:bg-zinc-900/10 text-zinc-400 dark:text-zinc-650 border-zinc-200 dark:border-zinc-850 line-through opacity-60'
                    }`}
                  >
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Structured Clipboard copybox preview */}
            <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-850">
              <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-2 tracking-wider">
                Clipboard Preview
              </div>
              <p className="text-sm font-mono text-indigo-600 dark:text-indigo-400 select-all font-semibold leading-relaxed">
                {selectedTags.join(' ') || '(no tags selected)'}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-600 border-2 border-dashed border-zinc-100 dark:border-zinc-850 rounded-2xl">
            <Hash className="w-10 h-10 mb-3 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm font-semibold">Enter keywords & click Generate</p>
            <p className="text-xs text-zinc-450 mt-1">Hashtags grouped by niche reach will populate here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
