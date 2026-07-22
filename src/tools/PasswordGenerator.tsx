/* eslint-disable react-hooks/purity */
import { useState, useMemo } from 'react';
import { Lock, Copy, Sparkles, RefreshCw } from 'lucide-react';

export default function PasswordGenerator() {
  const [length, setLength] = useState<number>(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenTrigger, setRegenTrigger] = useState(0);

  const password = useMemo(() => {
    if (regenTrigger < 0) return '';
    let charset = '';
    let uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    let numberChars = '0123456789';
    let symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (excludeSimilar) {
      uppercaseChars = uppercaseChars.replace(/[IO]/g, '');
      lowercaseChars = lowercaseChars.replace(/[l]/g, '');
      numberChars = numberChars.replace(/[01]/g, '');
      symbolChars = symbolChars.replace(/[|]/g, '');
    }

    if (includeUppercase) charset += uppercaseChars;
    if (includeLowercase) charset += lowercaseChars;
    if (includeNumbers) charset += numberChars;
    if (includeSymbols) charset += symbolChars;

    if (!charset) {
      return '';
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }
    return newPassword;
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, regenTrigger]);

  const generatePassword = () => {
    setRegenTrigger(prev => prev + 1);
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Evaluate Password Strength
  const getStrength = () => {
    if (!password) return { label: 'Empty', color: 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500', width: '0%' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 3) {
      return { label: 'Weak', color: 'bg-rose-500 text-rose-700 dark:text-rose-450', width: '25%' };
    } else if (score === 4 || score === 5) {
      return { label: 'Medium', color: 'bg-amber-500 text-amber-700 dark:text-amber-450', width: '50%' };
    } else if (score === 6) {
      return { label: 'Strong', color: 'bg-indigo-500 text-indigo-700 dark:text-indigo-400', width: '75%' };
    } else {
      return { label: 'Excellent', color: 'bg-emerald-500 text-emerald-700 dark:text-emerald-400', width: '100%' };
    }
  };

  const strength = getStrength();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings Form */}
      <div className="lg:col-span-2 saas-card p-6 space-y-6 text-left">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Lock className="w-4.5 h-4.5 text-indigo-500" />
          <span>Password Configurations</span>
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-655 dark:text-zinc-350">
              <span>Password Length</span>
              <span className="text-indigo-650 dark:text-indigo-400">{length} characters</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              step="1"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase">
              <span>8 Chars</span>
              <span>24 Chars</span>
              <span>40 Chars</span>
              <span>56 Chars</span>
              <span>64 Chars</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Character Sets</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-650 focus:ring-indigo-500/20"
                />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-650 focus:ring-indigo-500/20"
                />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Lowercase (a-z)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-650 focus:ring-indigo-500/20"
                />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-650 focus:ring-indigo-500/20"
                />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Symbols (!@#$)</span>
              </label>
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none mt-2">
              <input
                type="checkbox"
                checked={excludeSimilar}
                onChange={(e) => setExcludeSimilar(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-650 focus:ring-indigo-500/20"
              />
              <span className="text-xs font-bold text-zinc-705 dark:text-zinc-300">Exclude Similar Characters (e.g. i, l, 1, o, 0, O)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Result panel */}
      <div className="space-y-6 text-left">
        <div className="saas-card p-6 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Secure Password</span>
          </h3>

          <div className="space-y-5">
            <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-4 flex justify-between items-center gap-2">
              <div className="font-mono text-zinc-200 text-sm overflow-x-auto select-all break-all whitespace-pre-wrap pr-2">
                {password || 'Select options...'}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={generatePassword}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white transition"
                  title="Regenerate"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!password}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white disabled:opacity-50 transition"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Strength Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">
                <span>Password Strength</span>
                <span className="font-black text-zinc-800 dark:text-zinc-250">{strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }} />
              </div>
            </div>

            {copied && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-xl text-center text-xs font-bold">
                ✓ Password copied to clipboard!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
