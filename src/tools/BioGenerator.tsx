import { useState } from 'react';
import { Copy, Sparkles, Check, RefreshCw } from 'lucide-react';

const BIO_TEMPLATES: Record<string, Record<string, string[]>> = {
  instagram: {
    creative: [
      "🎨 [OCCUPATION] | Crafting ideas into code\n✨ Obsessed with [SKILLS]\n📍 Based in India\n🔗 Check out my work below! 👇",
      "🚀 Turning coffee into [OCCUPATION]\n💫 Passionate about [SKILLS]\nLiving life one frame at a time 📸\n👇 Let's collaborate!",
    ],
    professional: [
      "💼 [OCCUPATION]\n📈 Specializing in [SKILLS]\n✉️ DM for business inquiries / collaborations\n🌐 Portfolio Link 👇",
      "🎯 [OCCUPATION]\n💡 Helping businesses grow through [SKILLS]\nBased in India | Open to opportunities\n👇 Let's connect!",
    ],
    funny: [
      "🤪 [OCCUPATION] by day, professional napper by night.\n🔥 Powered by coffee and [SKILLS].\nWarning: My posts might look cool.\n👇 Click at your own risk!",
      "🦖 Just an average [OCCUPATION] trying to make sense of life.\n✨ Expert in [SKILLS] & eating pizza.\n🔗 Link below! 👇",
    ],
    minimal: [
      "[OCCUPATION] 🌿\n[SKILLS] 🤍\nIndia\n👇 Link",
      "• [OCCUPATION]\n• [SKILLS]\n• India 📍\n👇 Portfolio",
    ],
  },
  twitter: {
    creative: [
      "⚡ [OCCUPATION] creating things with [SKILLS]. 💫 Based in India. Let's make things happen! 👇",
      "🎨 Visual thinker & [OCCUPATION]. Building [SKILLS] projects. Say hi! ✨",
    ],
    professional: [
      "💼 [OCCUPATION] specialized in [SKILLS]. Sharing industry updates and developer insights. 📈 Let's scale!",
      "🎯 [OCCUPATION] | Consulting on [SKILLS] execution. Building products and teams. ✉️ Open to DMs.",
    ],
    funny: [
      "🤪 Professional [OCCUPATION] and meme enjoyer. I run on coffee and [SKILLS]. ☕ Opinions are mine, but they are right.",
      "🦖 Code wrangler & [OCCUPATION]. Can talk about [SKILLS] for 5 hours straight. 🍕 Let's chat!",
    ],
    minimal: [
      "[OCCUPATION] 🌿 [SKILLS]. India. 👇",
      "• [OCCUPATION] • [SKILLS] • Creator",
    ],
  },
  linkedin: {
    creative: [
      "🚀 [OCCUPATION] | Transforming creative ideas into functional solutions using [SKILLS]. Passionate about community building, developer relations, and standard designs.",
      "💡 [OCCUPATION] focused on crafting next-generation digital products. Expert in [SKILLS]. Let's innovate together! 📈",
    ],
    professional: [
      "💼 [OCCUPATION] specializing in [SKILLS]. Helping startups and enterprise teams architect scalable software infrastructures. 🌐 Let's discuss collaborations.",
      "🎯 Business-driven [OCCUPATION] with a focus on [SKILLS] strategy. Proven track record of managing multi-disciplinary engineering programs. ✉️ open to network.",
    ],
    funny: [
      "🤪 [OCCUPATION] | I write code so you don't have to. Powered by caffeine, [SKILLS], and stackoverflow searches. ☕ Let's build something fun!",
      "🦖 [OCCUPATION] who actually likes debugging code. Specializing in [SKILLS] and writing clean comments. 🍕 Connect to chat tech or food!",
    ],
    minimal: [
      "[OCCUPATION] | [SKILLS] | Based in India 📍",
      "Professional [OCCUPATION] specializing in [SKILLS] development.",
    ],
  },
  tiktok: {
    creative: [
      "🎨 [OCCUPATION] showing the behind-the-scenes ✨\n[SKILLS] expert\n👇 Drop a follow!",
      "🚀 Building [OCCUPATION] projects live!\n💫 Passionate about [SKILLS]\n👇 Collab link",
    ],
    professional: [
      "💼 [OCCUPATION] tips and tricks\n📈 Scaling [SKILLS] workflows\n🌐 Business inquiries 👇",
      "🎯 Learn [SKILLS] from a professional [OCCUPATION]!\n💡 Daily developer tips\n👇 Connect!",
    ],
    funny: [
      "🤪 [OCCUPATION] with zero logic.\n🔥 [SKILLS] is my excuse for everything.\n👇 Follow for chaos",
      "🦖 [OCCUPATION] trying to look busy.\n✨ [SKILLS] and bad jokes.\n👇 Check out",
    ],
    minimal: [
      "[OCCUPATION] 🌿\n[SKILLS]\n👇 Follow",
      "• [OCCUPATION]\n• [SKILLS]",
    ],
  },
};

const PLATFORM_LIMITS: Record<string, number> = {
  instagram: 150,
  twitter: 160,
  linkedin: 220,
  tiktok: 80,
};

export default function BioGenerator() {
  const [platform, setPlatform] = useState<string>('instagram');
  const [occupation, setOccupation] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [vibe, setVibe] = useState<string>('creative');
  const [includeEmojis, setIncludeEmojis] = useState<boolean>(true);
  const [generatedBios, setGeneratedBios] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateBios = () => {
    const platformTemplates = BIO_TEMPLATES[platform] || BIO_TEMPLATES.instagram;
    const templates = platformTemplates[vibe] || platformTemplates.creative;

    const occVal = occupation.trim() ? occupation.trim() : 'Creator';
    const skillsVal = skills.trim() ? skills.trim() : 'Design & Tech';

    const results = templates.map((tpl) => {
      let bio = tpl.replace('[OCCUPATION]', occVal).replace('[SKILLS]', skillsVal);

      if (!includeEmojis) {
        // Strip emojis
        bio = bio.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '');
        // Collapse spaces
        bio = bio.replace(/\n\s+/g, '\n').trim();
      }

      return bio;
    });

    setGeneratedBios(results);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const limit = PLATFORM_LIMITS[platform] || 150;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Settings Form */}
      <div className="lg:col-span-5 saas-card p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
          <span>Bio Designer</span>
        </h3>

        <div className="space-y-4">
          {/* Target Platform */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">Target Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="saas-select capitalize"
            >
              <option value="instagram">Instagram (150 Chars)</option>
              <option value="twitter">X / Twitter (160 Chars)</option>
              <option value="linkedin">LinkedIn Headline (220 Chars)</option>
              <option value="tiktok">TikTok Bio (80 Chars)</option>
            </select>
          </div>

          {/* Occupation / Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">Occupation or Main Title</label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="saas-input"
              placeholder="e.g. Full Stack Developer, Yoga Instructor"
              maxLength={40}
            />
          </div>

          {/* Skills / Interests */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">Skills or Core Interests</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="saas-input"
              placeholder="e.g. React & UI Design, Fitness & Diet"
              maxLength={50}
            />
          </div>

          {/* Tone / Vibe Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">Tone & Vibe</label>
            <select
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="saas-select capitalize"
            >
              <option value="creative">Creative ✨</option>
              <option value="professional">Professional 💼</option>
              <option value="funny">Funny 🤪</option>
              <option value="minimal">Minimal 🤍</option>
            </select>
          </div>

          {/* Include Emojis Switch */}
          <div className="flex items-center justify-between py-2 border-t border-b border-zinc-100 dark:border-zinc-850">
            <span className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Include Emojis</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeEmojis}
                onChange={(e) => setIncludeEmojis(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-200 dark:bg-zinc-850 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <button
            onClick={generateBios}
            className="saas-button-primary w-full cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Bios</span>
          </button>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-7 saas-card p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <span>Custom Bio Layout Proposals</span>
        </h3>

        {generatedBios.length > 0 ? (
          <div className="space-y-4">
            {generatedBios.map((bio, idx) => {
              const isOverLimit = bio.length > limit;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border space-y-3 relative group transition ${
                    isOverLimit
                      ? 'bg-rose-500/[0.02] border-rose-200 dark:border-rose-950/60'
                      : 'bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-850'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-zinc-400 dark:text-zinc-500">Proposal #{idx + 1}</span>
                    <span className={isOverLimit ? 'text-rose-500 font-extrabold' : 'text-zinc-400'}>
                      {bio.length} / {limit} Chars {isOverLimit && '(Limit Exceeded!)'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-850 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed select-all font-medium">
                    {bio}
                  </p>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleCopy(bio, idx)}
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
                          <span>Copy Bio</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-600 border-2 border-dashed border-zinc-100 dark:border-zinc-850 rounded-2xl">
            <Sparkles className="w-10 h-10 mb-3 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm font-semibold">Enter occupation & skills & click Generate</p>
            <p className="text-xs text-zinc-450 mt-1">Platform-optimized bios will show here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
