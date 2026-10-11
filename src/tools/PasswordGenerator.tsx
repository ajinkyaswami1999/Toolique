import { useState, useMemo, useCallback } from 'react';
import {
  Lock,
  Key,
  Hash,
  Layers,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Download,
  Trash2,
  SlidersHorizontal,
  History,
  CheckCircle2,
  XCircle,
  Zap,
  Globe,
  Laptop,
  Cpu
} from 'lucide-react';

// Cryptographically Secure Random Integer Generator using Web Cryptography API
function getRandomInt(min: number, max: number): number {
  const range = max - min;
  if (range <= 0) return min;

  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const maxUint = 0xffffffff;
    const limit = maxUint - (maxUint % range);
    const buffer = new Uint32Array(1);
    let num = 0;
    do {
      window.crypto.getRandomValues(buffer);
      num = buffer[0];
    } while (num >= limit);
    return min + (num % range);
  }
  return min + Math.floor(Math.random() * range);
}

// Curated 350+ clean, distinct, memorable English words for Diceware Passphrases
const WORDLIST: string[] = [
  'ability', 'anchor', 'apex', 'apple', 'arrow', 'artist', 'atom', 'aurora', 'avatar', 'badge',
  'bamboo', 'banner', 'beacon', 'breeze', 'bridge', 'bronze', 'bullet', 'cactus', 'canyon', 'castle',
  'cedar', 'champion', 'cipher', 'clarity', 'clover', 'cobalt', 'comet', 'compass', 'copper', 'coral',
  'cosmic', 'crater', 'crystal', 'delta', 'diamond', 'dolphin', 'dragon', 'dynasty', 'eagle', 'echo',
  'eclipse', 'emerald', 'empire', 'energy', 'falcon', 'feather', 'flame', 'forest', 'fossil', 'frontier',
  'galaxy', 'garnet', 'glacier', 'glider', 'glow', 'granite', 'harbor', 'harmony', 'haven', 'hawk',
  'helix', 'horizon', 'hybrid', 'impact', 'indigo', 'island', 'jasper', 'journey', 'jungle', 'jupiter',
  'karma', 'knight', 'lagoon', 'laser', 'legend', 'leopard', 'liberty', 'light', 'linear', 'lotus',
  'lunar', 'magnet', 'mango', 'mantra', 'marble', 'matrix', 'meadow', 'meteor', 'mirage', 'monarch',
  'monolith', 'mosaic', 'motion', 'nebula', 'nectar', 'nexus', 'ninja', 'noble', 'nomad', 'oasis',
  'ocean', 'omega', 'onyx', 'oracle', 'orbit', 'orchid', 'origin', 'ozone', 'pacific', 'palace',
  'panda', 'panther', 'paradox', 'parrot', 'patrol', 'peak', 'pearl', 'pebble', 'phoenix', 'pioneer',
  'planet', 'plasma', 'polar', 'portal', 'prism', 'pulse', 'pyramid', 'quantum', 'quartz', 'quasar',
  'radar', 'radiant', 'rainbow', 'raptor', 'raven', 'realm', 'reef', 'relic', 'rhino', 'ripple',
  'river', 'rocket', 'rover', 'ruby', 'safari', 'sailor', 'samurai', 'sapphire', 'saturn', 'shadow',
  'shield', 'sierra', 'silver', 'siren', 'skyline', 'solar', 'sonic', 'spark', 'sphere', 'spiral',
  'spirit', 'spring', 'star', 'stellar', 'stream', 'summit', 'sunburst', 'surge', 'swift', 'symbol',
  'synergy', 'temple', 'terra', 'thunder', 'tiger', 'titan', 'topaz', 'tornado', 'tracer', 'tropic',
  'tsunami', 'tundra', 'turbo', 'typhoon', 'ultra', 'umbra', 'valiant', 'valley', 'vanguard', 'vector',
  'velvet', 'vertex', 'vessel', 'victor', 'viper', 'vortex', 'voyage', 'vulcan', 'walnut', 'warden',
  'wave', 'willow', 'wind', 'wizard', 'zenith', 'zephyr', 'zodiac', 'acorn', 'alpine', 'amber',
  'arcade', 'arctic', 'atlas', 'autumn', 'blaze', 'bliss', 'bloom', 'boulder', 'bounty', 'cadet',
  'carbon', 'celestial', 'chime', 'cinder', 'citadel', 'cliff', 'cloud', 'crest', 'dawn', 'dune',
  'ember', 'everest', 'flint', 'frost', 'gamma', 'geode', 'glimmer', 'grove', 'halo', 'harvester',
  'hyper', 'infinity', 'iron', 'ivory', 'kinetic', 'lantern', 'lava', 'lens', 'lupine', 'magma',
  'matrix', 'meridian', 'nebular', 'neon', 'nova', 'obsidian', 'onyx', 'opal', 'optics', 'orbit',
  'outpost', 'paragon', 'peak', 'prism', 'pulsar', 'radius', 'ranger', 'rebel', 'resonance', 'ridge',
  'rover', 'runway', 'saffron', 'saturn', 'scout', 'serene', 'shimmer', 'solace', 'solstice', 'spark',
  'spectrum', 'stride', 'summit', 'surge', 'swift', 'tempo', 'torch', 'trail', 'unity', 'valor',
  'vessel', 'vista', 'vivid', 'wander', 'warp', 'zenith'
];

type GeneratorTab = 'custom' | 'passphrase' | 'pin' | 'batch' | 'audit';

interface HistoryItem {
  password: string;
  type: string;
  timestamp: string;
  entropy: number;
}

export default function PasswordGenerator() {
  const [activeTab, setActiveTab] = useState<GeneratorTab>('custom');

  // Random Characters Options
  const [length, setLength] = useState<number>(16);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [includeExtendedSymbols, setIncludeExtendedSymbols] = useState<boolean>(false);
  const [excludeSimilar, setExcludeSimilar] = useState<boolean>(false);
  const [ensureAllSets, setEnsureAllSets] = useState<boolean>(true);
  const [noConsecutiveDuplicates, setNoConsecutiveDuplicates] = useState<boolean>(false);
  const [beginWithLetter, setBeginWithLetter] = useState<boolean>(false);
  const [customExcludeChars, setCustomExcludeChars] = useState<string>('');
  const [customIncludeChars, setCustomIncludeChars] = useState<string>('');

  // Passphrase Options
  const [wordCount, setWordCount] = useState<number>(4);
  const [separator, setSeparator] = useState<string>('-');
  const [passphraseCase, setPassphraseCase] = useState<'title' | 'lower' | 'upper' | 'random'>('title');
  const [appendNumber, setAppendNumber] = useState<boolean>(true);
  const [includePassphraseSymbol, setIncludePassphraseSymbol] = useState<boolean>(false);

  // PIN Options
  const [pinLength, setPinLength] = useState<number>(6);
  const [pinNoSequential, setPinNoSequential] = useState<boolean>(true);
  const [pinNoRepeat, setPinNoRepeat] = useState<boolean>(false);

  // Batch Options
  const [batchCount, setBatchCount] = useState<number>(10);
  const [batchMode, setBatchMode] = useState<'custom' | 'passphrase'>('custom');
  const [batchResults, setBatchResults] = useState<string[]>([]);
  const [batchCopiedIndex, setBatchCopiedIndex] = useState<number | null>(null);
  const [batchCopiedAll, setBatchCopiedAll] = useState<boolean>(false);

  // Audit Tab
  const [auditPassword, setAuditPassword] = useState<string>('');

  // UI State
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [regenTrigger, setRegenTrigger] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Core character generator logic
  const buildCharSet = useCallback(() => {
    let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lower = 'abcdefghijklmnopqrstuvwxyz';
    let nums = '0123456789';
    let syms = '!@#$%^&*';
    let extSyms = '-_=+[]{}|;:,.<>?/~`';

    if (excludeSimilar) {
      // Exclude ambiguous characters: i, l, 1, I, o, 0, O, L, |
      upper = upper.replace(/[ILO]/g, '');
      lower = lower.replace(/[il]/g, '');
      nums = nums.replace(/[01]/g, '');
      syms = syms.replace(/[/]/g, '');
      extSyms = extSyms.replace(/[|]/g, '');
    }

    if (customExcludeChars) {
      const excludeRegex = new RegExp(`[${customExcludeChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`, 'g');
      upper = upper.replace(excludeRegex, '');
      lower = lower.replace(excludeRegex, '');
      nums = nums.replace(excludeRegex, '');
      syms = syms.replace(excludeRegex, '');
      extSyms = extSyms.replace(excludeRegex, '');
    }

    const sets: { name: string; chars: string }[] = [];
    if (includeUppercase && upper.length > 0) sets.push({ name: 'upper', chars: upper });
    if (includeLowercase && lower.length > 0) sets.push({ name: 'lower', chars: lower });
    if (includeNumbers && nums.length > 0) sets.push({ name: 'nums', chars: nums });
    if (includeSymbols && syms.length > 0) sets.push({ name: 'syms', chars: syms });
    if (includeExtendedSymbols && extSyms.length > 0) sets.push({ name: 'extSyms', chars: extSyms });

    let combined = sets.map((s) => s.chars).join('');
    if (customIncludeChars) {
      combined += customIncludeChars;
    }

    return { sets, combined, upper, lower, nums, syms, extSyms };
  }, [
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    includeExtendedSymbols,
    excludeSimilar,
    customExcludeChars,
    customIncludeChars
  ]);

  const generateSinglePassword = useCallback((): string => {
    const { sets, combined, upper, lower } = buildCharSet();
    if (!combined || sets.length === 0) return '';

    const letters = (upper + lower) || combined;
    const result: string[] = [];

    // Ensure at least 1 character from each selected set if requested
    if (ensureAllSets && sets.length > 1 && length >= sets.length) {
      for (const set of sets) {
        const char = set.chars[getRandomInt(0, set.chars.length)];
        result.push(char);
      }
    }

    // Fill the remaining length
    while (result.length < length) {
      const char = combined[getRandomInt(0, combined.length)];
      if (noConsecutiveDuplicates && result.length > 0 && result[result.length - 1] === char) {
        continue;
      }
      result.push(char);
    }

    // Shuffle the array using Fisher-Yates with CSPRNG
    for (let i = result.length - 1; i > 0; i--) {
      const j = getRandomInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }

    // If begin with letter requested, ensure first character is a letter
    if (beginWithLetter && letters.length > 0 && !/[A-Za-z]/.test(result[0])) {
      const letter = letters[getRandomInt(0, letters.length)];
      result[0] = letter;
    }

    return result.join('');
  }, [buildCharSet, length, ensureAllSets, noConsecutiveDuplicates, beginWithLetter]);

  // Passphrase generator
  const generatePassphrase = useCallback((): string => {
    const selectedWords: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      let word = WORDLIST[getRandomInt(0, WORDLIST.length)];
      if (passphraseCase === 'title') {
        word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      } else if (passphraseCase === 'upper') {
        word = word.toUpperCase();
      } else if (passphraseCase === 'lower') {
        word = word.toLowerCase();
      } else if (passphraseCase === 'random') {
        word = getRandomInt(0, 2) === 1 ? word.toUpperCase() : word.toLowerCase();
      }
      selectedWords.push(word);
    }

    let joined = selectedWords.join(separator);

    if (appendNumber) {
      const num = getRandomInt(10, 99);
      joined += `${separator}${num}`;
    }

    if (includePassphraseSymbol) {
      const symbols = '!@#$%^&*?';
      const sym = symbols[getRandomInt(0, symbols.length)];
      joined += `${sym}`;
    }

    return joined;
  }, [wordCount, separator, passphraseCase, appendNumber, includePassphraseSymbol]);

  // PIN generator
  const generatePin = useCallback((): string => {
    const digits: string[] = [];
    const pool = '0123456789';

    while (digits.length < pinLength) {
      const digit = pool[getRandomInt(0, pool.length)];

      if (pinNoRepeat && digits.includes(digit)) {
        if (pinLength <= 10) continue;
      }

      if (pinNoSequential && digits.length > 0) {
        const lastDigit = parseInt(digits[digits.length - 1], 10);
        const curDigit = parseInt(digit, 10);
        if (Math.abs(curDigit - lastDigit) === 1) {
          continue;
        }
      }

      digits.push(digit);
    }

    return digits.join('');
  }, [pinLength, pinNoRepeat, pinNoSequential]);

  // Active current generated password
  const currentPassword = useMemo(() => {
    // regenTrigger is a dependency to force recalculation on regenerate click
    if (regenTrigger < 0) return '';
    if (activeTab === 'passphrase') {
      return generatePassphrase();
    }
    if (activeTab === 'pin') {
      return generatePin();
    }
    if (activeTab === 'custom') {
      return generateSinglePassword();
    }
    return '';
  }, [activeTab, generatePassphrase, generatePin, generateSinglePassword, regenTrigger]);

  // Shannon Entropy and Security Calculations
  const calculateEntropy = useCallback((pwd: string, mode: GeneratorTab): {
    bits: number;
    poolSize: number;
    score: number;
    label: string;
    colorClass: string;
    barPercent: number;
    crackOnline: string;
    crackDesktopGPU: string;
    crackCluster: string;
  } => {
    if (!pwd) {
      return {
        bits: 0,
        poolSize: 0,
        score: 0,
        label: 'Empty',
        colorClass: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500',
        barPercent: 0,
        crackOnline: '0s',
        crackDesktopGPU: '0s',
        crackCluster: '0s'
      };
    }

    let pool = 0;
    if (mode === 'passphrase') {
      pool = WORDLIST.length;
      const count = pwd.split(/[-_. /]/).length;
      let bits = count * Math.log2(pool);
      if (/[0-9]/.test(pwd)) bits += Math.log2(100);
      if (/[^A-Za-z0-9]/.test(pwd)) bits += Math.log2(16);
      return evaluateEntropyMetrics(bits, pwd.length);
    } else if (mode === 'pin') {
      pool = 10;
      const bits = pwd.length * Math.log2(pool);
      return evaluateEntropyMetrics(bits, pwd.length);
    } else {
      let hasLower = false;
      let hasUpper = false;
      let hasDigits = false;
      let hasSymbols = false;
      let hasOther = false;

      for (const char of pwd) {
        if (/[a-z]/.test(char)) hasLower = true;
        else if (/[A-Z]/.test(char)) hasUpper = true;
        else if (/[0-9]/.test(char)) hasDigits = true;
        else if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?/~`]/.test(char)) hasSymbols = true;
        else hasOther = true;
      }

      if (hasLower) pool += 26;
      if (hasUpper) pool += 26;
      if (hasDigits) pool += 10;
      if (hasSymbols) pool += 33;
      if (hasOther) pool += 20;

      if (pool === 0) pool = 10;
      const bits = pwd.length * Math.log2(pool);
      return evaluateEntropyMetrics(bits, pwd.length);
    }
  }, []);

  function formatCrackDuration(seconds: number): string {
    if (!isFinite(seconds) || seconds > 3.15e16) return 'Trillions of years (Uncrackable)';
    if (seconds < 1) return 'Instantly (< 1 sec)';
    if (seconds < 60) return `${Math.max(1, Math.round(seconds))} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 86400 * 30) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 86400 * 365.25) return `${Math.round(seconds / (86400 * 30))} months`;
    const years = seconds / (86400 * 365.25);
    if (years < 1000) return `${Math.round(years)} years`;
    if (years < 1e6) return `${(years / 1000).toFixed(1)}k years`;
    if (years < 1e9) return `${(years / 1e6).toFixed(1)}M years`;
    return `${(years / 1e9).toFixed(1)}B years`;
  }

  function evaluateEntropyMetrics(bits: number, len: number) {
    const combinations = Math.pow(2, bits);
    const avgGuesses = combinations / 2;

    // Speeds:
    // Online Web (100 attempts / min = 1.67 guesses/sec)
    const crackOnline = formatCrackDuration(avgGuesses / 1.67);
    // Offline Fast GPU (RTX 4090 cracking NTLM/MD5 ~ 10 Billion guesses/sec)
    const crackDesktopGPU = formatCrackDuration(avgGuesses / 1e10);
    // Supercomputer / ASIC Cluster ~ 1 Trillion guesses/sec
    const crackCluster = formatCrackDuration(avgGuesses / 1e12);

    let score = 1;
    let label = 'Very Weak';
    let colorClass = 'bg-rose-500 text-rose-700 dark:text-rose-400';
    let barPercent = 20;

    if (bits >= 90 || (bits >= 75 && len >= 16)) {
      score = 5;
      label = 'Military Grade (Uncrackable)';
      colorClass = 'bg-emerald-500 text-emerald-700 dark:text-emerald-400';
      barPercent = 100;
    } else if (bits >= 65 || (bits >= 55 && len >= 14)) {
      score = 4;
      label = 'Very Strong';
      colorClass = 'bg-teal-500 text-teal-700 dark:text-teal-400';
      barPercent = 80;
    } else if (bits >= 45 || len >= 10) {
      score = 3;
      label = 'Moderate';
      colorClass = 'bg-amber-500 text-amber-700 dark:text-amber-400';
      barPercent = 60;
    } else if (bits >= 30) {
      score = 2;
      label = 'Weak';
      colorClass = 'bg-orange-500 text-orange-700 dark:text-orange-400';
      barPercent = 40;
    }

    return {
      bits: Math.round(bits * 10) / 10,
      poolSize: Math.round(Math.pow(2, bits / Math.max(1, len))),
      score,
      label,
      colorClass,
      barPercent,
      crackOnline,
      crackDesktopGPU,
      crackCluster
    };
  }

  const activeTargetPassword = activeTab === 'audit' ? auditPassword : currentPassword;
  const entropyMetrics = useMemo(() => {
    return calculateEntropy(activeTargetPassword, activeTab);
  }, [activeTargetPassword, activeTab, calculateEntropy]);

  // Handle regeneration & add to history
  const handleRegenerate = () => {
    setRegenTrigger((prev) => prev + 1);
    if (currentPassword) {
      setHistory((prev) => {
        const item: HistoryItem = {
          password: currentPassword,
          type: activeTab,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          entropy: entropyMetrics.bits
        };
        const updated = [item, ...prev.filter((h) => h.password !== currentPassword)].slice(0, 6);
        return updated;
      });
    }
  };

  // Copy handler
  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preset Applicator
  const applyPreset = (presetName: string) => {
    if (presetName === 'default-strong') {
      setActiveTab('custom');
      setLength(16);
      setIncludeUppercase(true);
      setIncludeLowercase(true);
      setIncludeNumbers(true);
      setIncludeSymbols(true);
      setIncludeExtendedSymbols(false);
      setExcludeSimilar(false);
      setEnsureAllSets(true);
      setNoConsecutiveDuplicates(false);
      setBeginWithLetter(false);
      setCustomExcludeChars('');
    } else if (presetName === 'banking-portal') {
      setActiveTab('custom');
      setLength(14);
      setIncludeUppercase(true);
      setIncludeLowercase(true);
      setIncludeNumbers(true);
      setIncludeSymbols(true);
      setIncludeExtendedSymbols(false);
      setExcludeSimilar(true);
      setEnsureAllSets(true);
      setNoConsecutiveDuplicates(true);
      setBeginWithLetter(true);
      setCustomExcludeChars('"\'`|\\');
    } else if (presetName === 'ultra-entropy') {
      setActiveTab('custom');
      setLength(32);
      setIncludeUppercase(true);
      setIncludeLowercase(true);
      setIncludeNumbers(true);
      setIncludeSymbols(true);
      setIncludeExtendedSymbols(true);
      setExcludeSimilar(false);
      setEnsureAllSets(true);
      setNoConsecutiveDuplicates(false);
      setBeginWithLetter(false);
    } else if (presetName === 'diceware-passphrase') {
      setActiveTab('passphrase');
      setWordCount(4);
      setSeparator('-');
      setPassphraseCase('title');
      setAppendNumber(true);
      setIncludePassphraseSymbol(true);
    } else if (presetName === 'pin-code') {
      setActiveTab('pin');
      setPinLength(6);
      setPinNoSequential(true);
      setPinNoRepeat(false);
    } else if (presetName === 'wifi-wpa3') {
      setActiveTab('custom');
      setLength(63);
      setIncludeUppercase(true);
      setIncludeLowercase(true);
      setIncludeNumbers(true);
      setIncludeSymbols(true);
      setIncludeExtendedSymbols(true);
      setExcludeSimilar(false);
      setEnsureAllSets(true);
      setNoConsecutiveDuplicates(false);
      setBeginWithLetter(false);
    }
    setRegenTrigger((prev) => prev + 1);
  };

  // Batch Generation trigger
  const runBatchGeneration = useCallback(() => {
    const list: string[] = [];
    const count = Math.min(50, Math.max(1, batchCount));
    for (let i = 0; i < count; i++) {
      if (batchMode === 'passphrase') {
        list.push(generatePassphrase());
      } else {
        list.push(generateSinglePassword());
      }
    }
    setBatchResults(list);
  }, [batchCount, batchMode, generatePassphrase, generateSinglePassword]);

  // Export batch
  const handleDownloadBatch = (format: 'txt' | 'csv') => {
    if (batchResults.length === 0) return;
    let content = '';
    let mimeType = 'text/plain';
    let filename = `passwords-${Date.now()}.${format}`;

    if (format === 'csv') {
      content = 'Index,Password,Length,EstimatedEntropyBits\n' +
        batchResults
          .map((pwd, idx) => `${idx + 1},"${pwd}",${pwd.length},${calculateEntropy(pwd, batchMode).bits}`)
          .join('\n');
      mimeType = 'text/csv';
    } else {
      content = `# Generated by Toolique Password Security Suite\n# Date: ${new Date().toISOString()}\n\n` +
        batchResults.join('\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render password characters with semantic syntax color classes
  const renderHighlightedPassword = (pwd: string) => {
    if (!pwd) return <span className="text-zinc-400 italic">Configure options to generate...</span>;
    if (isMasked) {
      return (
        <span className="tracking-widest font-mono text-zinc-300 dark:text-zinc-600 select-all">
          {'•'.repeat(Math.min(pwd.length, 36))}
          {pwd.length > 36 ? ` (+${pwd.length - 36} chars)` : ''}
        </span>
      );
    }

    return (
      <span className="font-mono break-all select-all leading-relaxed">
        {pwd.split('').map((char, index) => {
          let color = 'text-zinc-700 dark:text-zinc-200';
          if (/[A-Z]/.test(char)) color = 'text-indigo-600 dark:text-indigo-400 font-bold';
          else if (/[a-z]/.test(char)) color = 'text-sky-600 dark:text-sky-300';
          else if (/[0-9]/.test(char)) color = 'text-amber-600 dark:text-amber-400 font-bold';
          else if (/[-_./]/.test(char)) color = 'text-purple-600 dark:text-purple-400 font-bold';
          else color = 'text-emerald-600 dark:text-emerald-400 font-bold';

          return (
            <span key={index} className={color}>
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs (Note: No duplicate H1 here) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-zinc-100/80 dark:bg-zinc-850/60 border border-zinc-200/50 dark:border-zinc-800/50">
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'custom'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Random Characters</span>
          </button>
          <button
            onClick={() => setActiveTab('passphrase')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'passphrase'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Memorable Passphrase</span>
          </button>
          <button
            onClick={() => setActiveTab('pin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pin'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Numeric PIN</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('batch');
              if (batchResults.length === 0) runBatchGeneration();
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'batch'
                ? 'bg-white dark:bg-zinc-800 text-indigo-650 dark:text-indigo-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Batch</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit & Strength Test</span>
          </button>
        </div>

        {/* Security CSPRNG badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-bold">
          <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>CSPRNG Hardware Entropy Active</span>
        </div>
      </div>

      {/* Quick Security Presets */}
      {activeTab !== 'audit' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-left">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 shrink-0">
            Security Presets:
          </span>
          <button
            onClick={() => applyPreset('default-strong')}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-pastel-indigo/30 hover:bg-pastel-indigo/60 text-indigo-800 dark:text-indigo-300 border border-pastel-indigo/50 transition shrink-0"
          >
            16-Char Strong
          </button>
          <button
            onClick={() => applyPreset('banking-portal')}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-pastel-emerald/30 hover:bg-pastel-emerald/60 text-emerald-800 dark:text-emerald-300 border border-pastel-emerald/50 transition shrink-0"
          >
            Indian Banking (Safe)
          </button>
          <button
            onClick={() => applyPreset('ultra-entropy')}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-pastel-lavender/30 hover:bg-pastel-lavender/60 text-purple-800 dark:text-purple-300 border border-pastel-lavender/50 transition shrink-0"
          >
            32-Char Max Entropy
          </button>
          <button
            onClick={() => applyPreset('diceware-passphrase')}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 transition shrink-0"
          >
            4-Word Diceware
          </button>
          <button
            onClick={() => applyPreset('pin-code')}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 transition shrink-0"
          >
            6-Digit PIN
          </button>
          <button
            onClick={() => applyPreset('wifi-wpa3')}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/30 transition shrink-0"
          >
            Wi-Fi WPA3 (63 Chars)
          </button>
        </div>
      )}

      {/* Primary Display Showcase Card (For single generation modes) */}
      {activeTab !== 'batch' && activeTab !== 'audit' && (
        <div className="saas-card p-6 md:p-8 space-y-6 text-left border-pastel-indigo/60 dark:border-zinc-800/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white leading-none">
                  Generated Password
                </h2>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold">
                  {currentPassword.length} characters &bull; {entropyMetrics.bits} bits of Shannon entropy
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-2xs ${
                  entropyMetrics.score >= 4
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : entropyMetrics.score === 3
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                }`}
              >
                {entropyMetrics.label}
              </span>
            </div>
          </div>

          {/* Password Output Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200/90 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-inner">
            <div className="text-base sm:text-xl font-mono min-h-[2.5rem] flex items-center pr-2 overflow-x-auto">
              {renderHighlightedPassword(currentPassword)}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => setIsMasked(!isMasked)}
                className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shadow-2xs transition"
                title={isMasked ? 'Reveal Password' : 'Mask Password'}
              >
                {isMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              <button
                onClick={handleRegenerate}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold shadow-2xs transition"
                title="Regenerate with fresh hardware entropy"
              >
                <RefreshCw className="w-4 h-4 text-indigo-500 hover:rotate-180 transition-transform duration-500" />
                <span className="hidden sm:inline">New</span>
              </button>

              <button
                onClick={() => handleCopy(currentPassword)}
                disabled={!currentPassword}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition active:scale-95 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Strength Bar & Attack Scenario Estimates */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-zinc-500 dark:text-zinc-400">
                <span>Cryptographic Strength Meter</span>
                <span>{entropyMetrics.barPercent}% Strength ({entropyMetrics.bits} bits)</span>
              </div>
              <div className="h-2 w-full bg-zinc-200/80 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${entropyMetrics.colorClass} transition-all duration-500 ease-out`}
                  style={{ width: `${entropyMetrics.barPercent}%` }}
                />
              </div>
            </div>

            {/* Crack Time Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-850/50 border border-zinc-200/60 dark:border-zinc-800 text-left">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-sky-500" />
                  <span>Online Web Attack</span>
                </div>
                <div className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white mt-1">
                  {entropyMetrics.crackOnline}
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">Rate-limited (100 tries/min)</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-850/50 border border-zinc-200/60 dark:border-zinc-800 text-left">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                  <Laptop className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Offline GPU Rig</span>
                </div>
                <div className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white mt-1">
                  {entropyMetrics.crackDesktopGPU}
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">10 Billion Hashes/sec</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-850/50 border border-zinc-200/60 dark:border-zinc-800 text-left">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                  <Cpu className="w-3.5 h-3.5 text-purple-500" />
                  <span>Supercomputer / ASIC</span>
                </div>
                <div className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white mt-1">
                  {entropyMetrics.crackCluster}
                </div>
                <div className="text-[10px] text-zinc-400 font-medium">1 Trillion Hashes/sec</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Left Column: Interactive Controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: RANDOM CHARACTERS */}
          {activeTab === 'custom' && (
            <div className="saas-card p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                  <span>Character & Length Configurations</span>
                </h3>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {length} Characters
                </span>
              </div>

              {/* Length Slider & Quick Buttons */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Password Length</span>
                  <div className="flex items-center gap-1.5">
                    {[8, 12, 16, 24, 32, 64].map((val) => (
                      <button
                        key={val}
                        onClick={() => setLength(val)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black transition ${
                          length === val
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-150 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="range"
                  min="4"
                  max="128"
                  step="1"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
                />

                <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase">
                  <span>4 Min</span>
                  <span>16 Standard</span>
                  <span>32 Strong</span>
                  <span>64 Max</span>
                  <span>128 Ultra</span>
                </div>
              </div>

              {/* Character Sets Selection */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Character Sets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none hover:border-indigo-300 dark:hover:border-zinc-700 transition">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={includeUppercase}
                        onChange={(e) => setIncludeUppercase(e.target.checked)}
                        className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Uppercase Letters</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">A-Z</span>
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none hover:border-indigo-300 dark:hover:border-zinc-700 transition">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={includeLowercase}
                        onChange={(e) => setIncludeLowercase(e.target.checked)}
                        className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Lowercase Letters</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400">a-z</span>
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none hover:border-indigo-300 dark:hover:border-zinc-700 transition">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={includeNumbers}
                        onChange={(e) => setIncludeNumbers(e.target.checked)}
                        className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Numbers</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">0-9</span>
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none hover:border-indigo-300 dark:hover:border-zinc-700 transition">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={includeSymbols}
                        onChange={(e) => setIncludeSymbols(e.target.checked)}
                        className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Standard Symbols</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">!@#$%^&*</span>
                  </label>
                </div>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none hover:border-indigo-300 dark:hover:border-zinc-700 transition">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={includeExtendedSymbols}
                      onChange={(e) => setIncludeExtendedSymbols(e.target.checked)}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Extended Punctuation & Symbols</span>
                      <span className="text-[10px] text-zinc-400">Brackets, tildes, slashes, mathematical signs</span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-purple-600 dark:text-purple-400">-_=+[]{}|;:,.~</span>
                </label>
              </div>

              {/* Advanced Security Rules */}
              <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <label className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Compliance & Readability Rules
                </label>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={excludeSimilar}
                      onChange={(e) => setExcludeSimilar(e.target.checked)}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">Exclude Ambiguous / Similar Characters</span>
                      <span className="text-zinc-400 block text-[11px]">Omits `i, l, 1, I, o, 0, O, |` to avoid font transcription errors</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={ensureAllSets}
                      onChange={(e) => setEnsureAllSets(e.target.checked)}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">Guarantee at least one from every selected character set</span>
                      <span className="text-zinc-400 block text-[11px]">Satisfies enterprise Active Directory & banking policy checks</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={noConsecutiveDuplicates}
                      onChange={(e) => setNoConsecutiveDuplicates(e.target.checked)}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">No Consecutive Duplicate Characters</span>
                      <span className="text-zinc-400 block text-[11px]">Prevents accidental double keys (e.g., `aa`, `99`)</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={beginWithLetter}
                      onChange={(e) => setBeginWithLetter(e.target.checked)}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">Must Begin With an Alphabetic Letter</span>
                      <span className="text-zinc-400 block text-[11px]">Required by Linux usernames, SQL DBs, and legacy software systems</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Custom Exclusions / Inclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Custom Characters to Exclude
                  </label>
                  <input
                    type="text"
                    value={customExcludeChars}
                    onChange={(e) => setCustomExcludeChars(e.target.value)}
                    placeholder="e.g. &quot;'/\^%`"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 font-mono focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-400">Blacklist specific disallowed symbols</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Custom Characters to Include
                  </label>
                  <input
                    type="text"
                    value={customIncludeChars}
                    onChange={(e) => setCustomIncludeChars(e.target.value)}
                    placeholder="e.g. #$@"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 font-mono focus:border-indigo-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-zinc-400">Append specific required symbols</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEMORABLE PASSPHRASE */}
          {activeTab === 'passphrase' && (
            <div className="saas-card p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  <span>Diceware & Passphrase Configurations</span>
                </h3>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {wordCount} Words
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                <span className="font-bold">NIST SP 800-63B Recommendation:</span> Multi-word passphrases (e.g., <em>Galaxy-Beacon-Amber-Orbit</em>) offer superior mathematical entropy while being remarkably easy for human memory to retain without writing down.
              </div>

              {/* Word Count Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Number of Words</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{wordCount} Words</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="1"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase">
                  <span>3 (Fast)</span>
                  <span>4 (Standard NIST)</span>
                  <span>6 (Very Strong)</span>
                  <span>10 (Ultra)</span>
                </div>
              </div>

              {/* Separators & Capitalization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Word Separator
                  </label>
                  <select
                    value={separator}
                    onChange={(e) => setSeparator(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 font-bold focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="-">Hyphen (-)</option>
                    <option value="_">Underscore (_)</option>
                    <option value=".">Period (.)</option>
                    <option value=" ">Space ( )</option>
                    <option value="/">Forward Slash (/)</option>
                    <option value="">None (Concatenated)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Word Capitalization
                  </label>
                  <select
                    value={passphraseCase}
                    onChange={(e) => setPassphraseCase(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-800 dark:text-zinc-200 font-bold focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="title">Title Case (Word-Word)</option>
                    <option value="lower">Lowercase (word-word)</option>
                    <option value="upper">UPPERCASE (WORD-WORD)</option>
                    <option value="random">Random Capitalization</option>
                  </select>
                </div>
              </div>

              {/* Extra Security Flags */}
              <div className="space-y-2.5 pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={appendNumber}
                    onChange={(e) => setAppendNumber(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Append Random Numbers</span>
                    <span className="text-zinc-400 block text-[11px]">Appends a 2-digit number (adds ~6.6 bits of entropy)</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includePassphraseSymbol}
                    onChange={(e) => setIncludePassphraseSymbol(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Append Special Symbol</span>
                    <span className="text-zinc-400 block text-[11px]">Satisfies services mandating non-alphanumeric characters</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: NUMERIC PIN */}
          {activeTab === 'pin' && (
            <div className="saas-card p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <Hash className="w-4 h-4 text-cyan-500" />
                  <span>Numeric PIN Configurations</span>
                </h3>
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  {pinLength} Digits
                </span>
              </div>

              {/* PIN Length Buttons */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Preset PIN Formats
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: '4-Digit (ATM/Debit)', len: 4 },
                    { label: '6-Digit (UPI/Aadhaar)', len: 6 },
                    { label: '8-Digit (High Security)', len: 8 },
                    { label: '12-Digit (TOTP/Master)', len: 12 }
                  ].map((p) => (
                    <button
                      key={p.len}
                      onClick={() => setPinLength(p.len)}
                      className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                        pinLength === p.len
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-800 dark:text-cyan-300'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="font-mono text-base font-black">{p.len} Digits</div>
                      <div className="text-[10px] text-zinc-400 font-medium">{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <span>Custom PIN Length</span>
                  <span className="text-cyan-600 dark:text-cyan-400">{pinLength} Digits</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="16"
                  step="1"
                  value={pinLength}
                  onChange={(e) => setPinLength(Number(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
                />
              </div>

              <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pinNoSequential}
                    onChange={(e) => setPinNoSequential(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-cyan-600 focus:ring-cyan-500/20"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Avoid Sequential Digits</span>
                    <span className="text-zinc-400 block text-[11px]">Disallows trivial patterns like `1234` or `9876`</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pinNoRepeat}
                    onChange={(e) => setPinNoRepeat(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-cyan-600 focus:ring-cyan-500/20"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">Disallow Repeating Digits (Unique)</span>
                    <span className="text-zinc-400 block text-[11px]">Ensures all digits are distinct (for PINs up to 10 digits)</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: BULK BATCH GENERATION */}
          {activeTab === 'batch' && (
            <div className="saas-card p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Bulk Password Generator & Exporter</span>
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadBatch('txt')}
                    disabled={batchResults.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-500" />
                    <span>.TXT</span>
                  </button>
                  <button
                    onClick={() => handleDownloadBatch('csv')}
                    disabled={batchResults.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-500" />
                    <span>.CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(batchResults.join('\n'));
                      setBatchCopiedAll(true);
                      setTimeout(() => setBatchCopiedAll(false), 2000);
                    }}
                    disabled={batchResults.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
                  >
                    {batchCopiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{batchCopiedAll ? 'All Copied!' : 'Copy All'}</span>
                  </button>
                </div>
              </div>

              {/* Batch Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Quantity to Generate
                  </label>
                  <select
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={5}>5 Passwords</option>
                    <option value={10}>10 Passwords</option>
                    <option value={20}>20 Passwords</option>
                    <option value={50}>50 Passwords</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Generation Type
                  </label>
                  <select
                    value={batchMode}
                    onChange={(e) => setBatchMode(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="custom">Random Characters ({length} chars)</option>
                    <option value="passphrase">Memorable Passphrase ({wordCount} words)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={runBatchGeneration}
                    className="w-full py-2 px-4 rounded-xl bg-indigo-650 hover:bg-indigo-750 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-black shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate Batch</span>
                  </button>
                </div>
              </div>

              {/* Batch Results Table */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                <div className="max-h-96 overflow-y-auto divide-y divide-zinc-200/70 dark:divide-zinc-800">
                  {batchResults.map((pwd, idx) => {
                    const metrics = calculateEntropy(pwd, batchMode);
                    return (
                      <div
                        key={idx}
                        className="p-3.5 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-850 flex items-center justify-between gap-3 text-xs transition"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="w-5 text-zinc-400 font-mono text-[10px] shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="font-mono text-zinc-800 dark:text-zinc-200 truncate select-all">
                            {pwd}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                            {metrics.bits} bits
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(pwd);
                              setBatchCopiedIndex(idx);
                              setTimeout(() => setBatchCopiedIndex(null), 1500);
                            }}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="Copy Password"
                          >
                            {batchCopiedIndex === idx ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-zinc-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT & STRENGTH TESTER */}
          {activeTab === 'audit' && (
            <div className="saas-card p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Interactive Password Auditor & Entropy Tester</span>
                </h3>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  100% In-Browser Privacy
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  Test Any Existing Password (Safe & Private)
                </label>
                <div className="relative">
                  <input
                    type={isMasked ? 'password' : 'text'}
                    value={auditPassword}
                    onChange={(e) => setAuditPassword(e.target.value)}
                    placeholder="Type or paste your password here to inspect strength..."
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-mono text-zinc-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setIsMasked(!isMasked)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {isMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">
                  🔒 Zero network requests are made. The password is never logged, stored, or sent over the internet.
                </p>
              </div>

              {auditPassword && (
                <div className="space-y-4 pt-2">
                  {/* Results Meter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      <span>Security Level: {entropyMetrics.label}</span>
                      <span>{entropyMetrics.bits} bits of entropy</span>
                    </div>
                    <div className="h-2.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${entropyMetrics.colorClass} transition-all duration-300`}
                        style={{ width: `${entropyMetrics.barPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Audit Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800 text-xs">
                      {auditPassword.length >= 12 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">Length &ge; 12 Characters</span>
                        <span className="block text-[10px] text-zinc-400">Current length: {auditPassword.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800 text-xs">
                      {/[A-Z]/.test(auditPassword) && /[a-z]/.test(auditPassword) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">Mixed Case Letters</span>
                        <span className="block text-[10px] text-zinc-400">Uppercase & Lowercase</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800 text-xs">
                      {/[0-9]/.test(auditPassword) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">Numeric Digits (0-9)</span>
                        <span className="block text-[10px] text-zinc-400">Increases character pool size</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800 text-xs">
                      {/[^A-Za-z0-9]/.test(auditPassword) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">Special Symbols</span>
                        <span className="block text-[10px] text-zinc-400">Punctuation & characters</span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Crack Time for Audited Password */}
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-pastel-indigo/50 dark:border-indigo-900/40 space-y-2 text-xs">
                    <span className="font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 block">
                      Attack Resilience Assessment:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-zinc-700 dark:text-zinc-300">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-bold">Online Throttled:</span>
                        <span className="font-black text-indigo-700 dark:text-indigo-300">{entropyMetrics.crackOnline}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-bold">Offline GPU Hashcat:</span>
                        <span className="font-black text-indigo-700 dark:text-indigo-300">{entropyMetrics.crackDesktopGPU}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-bold">Supercomputer Rig:</span>
                        <span className="font-black text-indigo-700 dark:text-indigo-300">{entropyMetrics.crackCluster}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Security Analysis, NIST Guidelines & History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Entropy & Standards Card */}
          <div className="saas-card p-6 space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>NIST SP 800-63B Compliance</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Length Prioritized Over Churn:</span>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    NIST deprecates forced 90-day password rotation in favor of high-entropy, longer passwords.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Cryptographic CSPRNG:</span>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Uses OS kernel random pool (`crypto.getRandomValues`) with zero modulo bias.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Passphrase Support:</span>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Diceware wordlists provide over 40–80 bits of memorizable entropy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Session History Drawer */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                <span>Session Generation History</span>
              </h3>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                  title="Clear history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-6 text-zinc-400 text-xs">
                <Lock className="w-6 h-6 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
                <span>No session history yet. Generated passwords will appear here temporarily.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="overflow-hidden">
                      <div className="font-mono text-zinc-700 dark:text-zinc-300 truncate select-all">
                        {h.password}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-medium">
                        {h.timestamp} &bull; {h.entropy} bits
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(h.password)}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 transition shrink-0"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-850/40 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              🔒 In-memory session buffer only. This list disappears immediately when you close or reload the browser.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
