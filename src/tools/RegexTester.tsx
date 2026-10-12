import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Copy,
  Check,
  Code,
  Sparkles,
  Trash2,
  Zap,
  Replace,
  Layers,
  BookOpen,
  Terminal,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

/* =========================================================================
   TYPES & PRESETS
   ========================================================================= */

interface MatchItem {
  index: number;
  text: string;
  groups: string[];
}

interface RegexPreset {
  category: 'India ID & Formats' | 'Web & Security' | 'Development';
  label: string;
  pattern: string;
  flags: { g: boolean; i: boolean; m: boolean; s: boolean; u: boolean };
  sampleText: string;
  description: string;
}

const REGEX_PRESETS: RegexPreset[] = [
  // India Specific Presets
  {
    category: 'India ID & Formats',
    label: 'Indian Mobile (+91)',
    pattern: '^(?:\\+91|91|0)?[6-9]\\d{9}$',
    flags: { g: true, i: false, m: true, s: false, u: false },
    sampleText: '+919876543210\n9823012345\n09123456789\n1234567890 (invalid)',
    description: 'Validates 10-digit Indian phone numbers with optional +91, 91, or 0 prefixes starting with digits 6-9.'
  },
  {
    category: 'India ID & Formats',
    label: 'PAN Card Number',
    pattern: '[A-Z]{5}[0-9]{4}[A-Z]{1}',
    flags: { g: true, i: false, m: false, s: false, u: false },
    sampleText: 'My corporate PAN is ABCDE1234F and individual is BNZPK9988A.',
    description: 'Validates Indian Permanent Account Number (5 letters + 4 digits + 1 letter).'
  },
  {
    category: 'India ID & Formats',
    label: 'GSTIN (GST Number)',
    pattern: '\\d{2}[A-Z]{5}\\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}',
    flags: { g: true, i: false, m: false, s: false, u: false },
    sampleText: 'Invoice GSTIN: 27ABCDE1234F1Z5 for Maharashtra branch and 29AAACA1234B1Z2 for Karnataka.',
    description: 'Validates 15-character Indian Goods and Services Tax Identification Number.'
  },
  {
    category: 'India ID & Formats',
    label: 'PIN Code (Postal)',
    pattern: '\\b[1-9][0-9]{5}\\b',
    flags: { g: true, i: false, m: false, s: false, u: false },
    sampleText: 'Bengaluru: 560001, Mumbai: 400001, Delhi: 110001, Invalid: 012345.',
    description: 'Matches 6-digit Indian PIN codes starting with non-zero digit.'
  },
  {
    category: 'India ID & Formats',
    label: 'Aadhaar (Masked / Formatted)',
    pattern: '[2-9]{1}[0-9]{3}\\s[0-9]{4}\\s[0-9]{4}',
    flags: { g: true, i: false, m: false, s: false, u: false },
    sampleText: 'Registered Aadhaar: 3675 9834 6012 and 9812 3456 7890.',
    description: 'Matches 12-digit UIDAI Aadhaar number formatted with spaces (starts with 2-9).'
  },

  // Web & Security
  {
    category: 'Web & Security',
    label: 'Email Address (RFC 5322)',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: { g: true, i: true, m: false, s: false, u: false },
    sampleText: 'Contact support@toolique.in, founder.ceo@startup.co, or invalid-email@.',
    description: 'Standard email address validator matching username, domain, and TLD.'
  },
  {
    category: 'Web & Security',
    label: 'URL / Web Hyperlink',
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b[-a-zA-Z0-9()@:%_+.~#?&/=]*',
    flags: { g: true, i: false, m: false, s: false, u: false },
    sampleText: 'Check out https://toolique.in/tools and http://api.github.com/repos?page=1&limit=50 for details.',
    description: 'Matches HTTP/HTTPS web links with paths and query parameters.'
  },
  {
    category: 'Web & Security',
    label: 'IPv4 Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: { g: true, i: false, m: false, s: false, u: false },
    sampleText: 'Local server 192.168.1.1, DNS 8.8.8.8, router 10.0.0.1, invalid 999.1.2.3.',
    description: 'Matches valid IPv4 addresses strictly bounded by octets (0-255).'
  },
  {
    category: 'Web & Security',
    label: 'Strong Password Policy',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: { g: false, i: false, m: true, s: false, u: false },
    sampleText: 'Secret@2026\nweakpass\nNoSpecial123\nAdmin#9999',
    description: 'Requires min 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
  },

  // Development
  {
    category: 'Development',
    label: 'UUID v4',
    pattern: '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}',
    flags: { g: true, i: true, m: false, s: false, u: false },
    sampleText: 'Item 1: 550e8400-e29b-41d4-a716-446655440000, Item 2: c9a646d3-9c61-4cc9-bc55-c51122a21098.',
    description: 'Matches standard 128-bit RFC 4122 Version-4 Universally Unique Identifiers.'
  },
  {
    category: 'Development',
    label: 'ISO 8601 Date (YYYY-MM-DD)',
    pattern: '\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b',
    flags: { g: true, i: false, m: false, s: false, u: false },
    sampleText: 'Release date: 2026-10-12, Created: 2024-01-01, Invalid: 2023-13-45.',
    description: 'Validates calendar dates formatted in ISO 8601 YYYY-MM-DD format.'
  },
  {
    category: 'Development',
    label: 'HTML Tags & Attributes',
    pattern: '<([a-z1-6]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s*\\/>)',
    flags: { g: true, i: true, m: false, s: false, u: false },
    sampleText: '<div class="card"><h2 id="title">Toolique</h2><p>India Dev Hub</p></div>',
    description: 'Extracts HTML tags, element names, attributes, and inner contents with capture groups.'
  }
];

const CHEAT_SHEET_ITEMS = [
  { token: '\\d', label: 'Digit (0-9)', category: 'Classes' },
  { token: '\\D', label: 'Non-digit', category: 'Classes' },
  { token: '\\w', label: 'Word char (a-z, 0-9, _)', category: 'Classes' },
  { token: '\\W', label: 'Non-word char', category: 'Classes' },
  { token: '\\s', label: 'Whitespace (space, tab, \\n)', category: 'Classes' },
  { token: '.', label: 'Any character (except \\n)', category: 'Classes' },
  { token: '^', label: 'Start of line / string', category: 'Anchors' },
  { token: '$', label: 'End of line / string', category: 'Anchors' },
  { token: '\\b', label: 'Word boundary', category: 'Anchors' },
  { token: '*', label: '0 or more times', category: 'Quantifiers' },
  { token: '+', label: '1 or more times', category: 'Quantifiers' },
  { token: '?', label: '0 or 1 time (optional)', category: 'Quantifiers' },
  { token: '{2,5}', label: 'Between 2 and 5 times', category: 'Quantifiers' },
  { token: '(...)', label: 'Capturing group', category: 'Groups' },
  { token: '(?:...)', label: 'Non-capturing group', category: 'Groups' },
  { token: '(?=...)', label: 'Positive lookahead', category: 'Groups' },
  { token: '(?!...)', label: 'Negative lookahead', category: 'Groups' },
  { token: '(?<=...)', label: 'Positive lookbehind', category: 'Groups' }
];

export default function RegexTester() {
  // Mode: 'match' or 'replace'
  const [activeTab, setActiveTab] = useState<'match' | 'replace'>('match');

  // Pattern & Flags State
  const [pattern, setPattern] = useState<string>('([A-Z][a-z]+)');
  const [flags, setFlags] = useState({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false
  });

  // Test String & Replacement String
  const [testString, setTestString] = useState<string>(
    'Welcome to Toolique! We build awesome browser tools for Indian developers.'
  );
  const [replacePattern, setReplacePattern] = useState<string>('[$1]');

  // UI state
  const [showCheatSheet, setShowCheatSheet] = useState<boolean>(false);
  const [showCodeGenerator, setShowCodeGenerator] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'js' | 'python' | 'go' | 'php'>('js');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const patternInputRef = useRef<HTMLInputElement>(null);

  // Toggle flag helper
  const handleFlagChange = (flag: keyof typeof flags) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  // Compile flag string
  const flagsString = useMemo(() => {
    let res = '';
    if (flags.g) res += 'g';
    if (flags.i) res += 'i';
    if (flags.m) res += 'm';
    if (flags.s) res += 's';
    if (flags.u) res += 'u';
    return res;
  }, [flags]);

  // Derived Regex Calculation & Performance Timer
  const { matches, error, highlightedNodes, executionTimeMs, replacementResult } = useMemo(() => {
    if (!pattern) {
      return {
        matches: [],
        error: null,
        highlightedNodes: [testString],
        executionTimeMs: 0,
        replacementResult: testString
      };
    }

    const startTime = performance.now();

    try {
      const regex = new RegExp(pattern, flagsString);
      const list: MatchItem[] = [];
      let match: RegExpExecArray | null = null;

      if (flags.g) {
        let safety = 0;
        while ((match = regex.exec(testString)) !== null && safety < 3000) {
          safety++;
          list.push({
            index: match.index,
            text: match[0],
            groups: match.slice(1)
          });
          if (match[0].length === 0) {
            regex.lastIndex++; // Prevent infinite loops for zero-width matches
          }
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          list.push({
            index: match.index,
            text: match[0],
            groups: match.slice(1)
          });
        }
      }

      // Construct visual highlights
      const nodes: React.ReactNode[] = [];
      let lastIdx = 0;

      list.forEach((m, idx) => {
        // Text segment preceding the match
        if (m.index > lastIdx) {
          nodes.push(testString.substring(lastIdx, m.index));
        }
        // Match highlight chip
        nodes.push(
          <mark
            key={`m-${idx}`}
            className="bg-amber-300/40 dark:bg-amber-500/25 border-b-2 border-amber-500 text-amber-950 dark:text-amber-200 font-mono font-bold px-1 rounded-sm mx-0.5"
            title={`Match ${idx + 1}: "${m.text}" (Index: ${m.index})`}
          >
            {m.text}
          </mark>
        );
        lastIdx = m.index + m.text.length;
      });

      if (lastIdx < testString.length) {
        nodes.push(testString.substring(lastIdx));
      }

      // Compute replacement string
      let replaced = '';
      try {
        replaced = testString.replace(new RegExp(pattern, flagsString), replacePattern);
      } catch {
        replaced = 'Error during replacement evaluation.';
      }

      const endTime = performance.now();

      return {
        matches: list,
        error: null,
        highlightedNodes: nodes.length > 0 ? nodes : [testString],
        executionTimeMs: Math.max(0.01, endTime - startTime),
        replacementResult: replaced
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid Regular Expression';
      return {
        matches: [],
        error: msg,
        highlightedNodes: [testString],
        executionTimeMs: 0,
        replacementResult: testString
      };
    }
  }, [pattern, flagsString, testString, replacePattern]);

  // Insert token from Cheat Sheet into input
  const handleInsertToken = (token: string) => {
    setPattern((prev) => prev + token);
    if (patternInputRef.current) {
      patternInputRef.current.focus();
    }
  };

  // Select Preset Handler
  const handleSelectPreset = (preset: RegexPreset) => {
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestString(preset.sampleText);
  };

  // Clipboard Copy Helper
  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Multi-Language Code Snippets
  const codeSnippet = useMemo(() => {
    const escapedPattern = pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    switch (selectedLanguage) {
      case 'js':
        return `// JavaScript / TypeScript RegExp
const regex = /${pattern}/${flagsString};
const text = ${JSON.stringify(testString)};

// Find all matches
const matches = [...text.matchAll(regex)];
matches.forEach((match, index) => {
  console.log(\`Match \${index + 1}: \${match[0]}\`);
  console.log('Capture Groups:', match.slice(1));
});

// Replace / Substitution
const replaced = text.replace(regex, ${JSON.stringify(replacePattern)});
console.log(replaced);`;

      case 'python':
        return `# Python re module
import re

pattern = r"${pattern}"
flags = 0
${flags.i ? 'flags |= re.IGNORECASE\n' : ''}${flags.m ? 'flags |= re.MULTILINE\n' : ''}${flags.s ? 'flags |= re.DOTALL\n' : ''}
text = """${testString}"""

# Find all matches
for idx, match in enumerate(re.finditer(pattern, text, flags)):
    print(f"Match {idx + 1}: {match.group(0)} at index {match.start()}")
    print(f"Groups: {match.groups()}")

# Replace / Substitution
replaced = re.sub(pattern, r"${replacePattern}", text, flags=flags)
print(replaced)`;

      case 'go':
        return `// Go (Golang) regexp
package main

import (
	"fmt"
	"regexp"
)

func main() {
	pattern := \`${pattern}\`
	re := regexp.MustCompile(pattern)
	text := \`${testString}\`

	matches := re.FindAllStringSubmatch(text, -1)
	for i, match := range matches {
		fmt.Printf("Match %d: %s\\n", i+1, match[0])
	}
}`;

      case 'php':
        return `<?php
// PHP PCRE preg_match_all
$pattern = '/${pattern}/${flagsString}';
$text = "${escapedPattern}";

if (preg_match_all($pattern, $text, $matches, PREG_SET_ORDER)) {
    foreach ($matches as $i => $match) {
        echo "Match " . ($i + 1) . ": " . $match[0] . "\\n";
    }
}
?>`;
    }
  }, [selectedLanguage, pattern, flagsString, testString, replacePattern]);

  return (
    <div className="space-y-6 text-left">
      {/* Category Presets Carousel (No Heading Doubling: No H1 rendered) */}
      <div className="saas-card p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Developer & Indian Standards Presets</span>
          </span>
          <span className="text-[10px] text-zinc-400">Click any preset to auto-load</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {REGEX_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-zinc-100 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200/80 dark:border-zinc-700/80 transition flex items-center gap-1.5 shrink-0"
              title={preset.description}
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid: Left Configuration & Right Visual Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pattern Editor, Flags & Tools (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-500" />
                <span>Regex Expression & Flags</span>
              </h2>
              {/* Performance Indicator */}
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                <Zap className="w-3 h-3" />
                <span>{executionTimeMs < 1 ? '< 1 ms' : `${executionTimeMs.toFixed(1)} ms`}</span>
              </div>
            </div>

            {/* Pattern Input Box */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <label htmlFor="regex-pattern-input">Pattern Expression *</label>
                <button
                  type="button"
                  onClick={() => handleCopy(`/${pattern}/${flagsString}`, 'regex-literal')}
                  className="text-[11px] text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                >
                  {copiedKey === 'regex-literal' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'regex-literal' ? 'Copied' : 'Copy Literal'}</span>
                </button>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-mono font-bold text-zinc-400 dark:text-zinc-500 select-none">
                  /
                </span>
                <input
                  ref={patternInputRef}
                  id="regex-pattern-input"
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="e.g. ([a-zA-Z0-9]+)"
                  className="w-full pl-7 pr-20 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 shadow-inner"
                />
                <span className="absolute right-3.5 text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 select-none bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                  /{flagsString}
                </span>
              </div>
            </div>

            {/* Flags Selector Chips */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                Regular Expression Flags
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { key: 'g', label: 'Global', char: 'g', desc: 'Find all occurrences rather than halting at first' },
                  { key: 'i', label: 'Ignore Case', char: 'i', desc: 'Case-insensitive matching (A equals a)' },
                  { key: 'm', label: 'Multiline', char: 'm', desc: '^ and $ match start & end of each line' },
                  { key: 's', label: 'DotAll', char: 's', desc: '. matches newlines (\\n)' },
                  { key: 'u', label: 'Unicode', char: 'u', desc: 'Full UTF-16 code point matching' }
                ].map((f) => {
                  const isActive = flags[f.key as keyof typeof flags];
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => handleFlagChange(f.key as keyof typeof flags)}
                      title={`${f.label} (${f.char}): ${f.desc}`}
                      className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                        isActive
                          ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-black shadow-xs'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium'
                      }`}
                    >
                      <span className="text-xs font-mono font-black">{f.char}</span>
                      <span className="text-[9px] uppercase tracking-wider">{f.key}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Syntax Error in Pattern</span>
                  <span className="font-mono text-[11px]">{error}</span>
                </div>
              </div>
            )}

            {/* Quick Actions Row */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowCheatSheet(!showCheatSheet)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{showCheatSheet ? 'Hide Cheat Sheet' : 'Regex Cheat Sheet'}</span>
                {showCheatSheet ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={() => setShowCodeGenerator(!showCodeGenerator)}
                className="text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
              >
                <Code className="w-3.5 h-3.5" />
                <span>Export Code</span>
              </button>
            </div>

            {/* Collapsible Quick Cheat Sheet */}
            {showCheatSheet && (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    Click Token to Insert:
                  </span>
                  <span className="text-[10px] text-zinc-400">Inserts at pattern end</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {CHEAT_SHEET_ITEMS.map((item) => (
                    <button
                      key={item.token}
                      type="button"
                      onClick={() => handleInsertToken(item.token)}
                      className="px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-zinc-200/70 dark:border-zinc-700/60 text-left transition flex items-center justify-between"
                    >
                      <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400">
                        {item.token}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate pl-1">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Collapsible Multi-Language Code Generator */}
            {showCodeGenerator && (
              <div className="p-4 rounded-xl bg-zinc-900 text-zinc-100 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Code Generator</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(['js', 'python', 'go', 'php'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                          selectedLanguage === lang
                            ? 'bg-indigo-600 text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <pre className="p-3 rounded-lg bg-black/60 font-mono text-[11px] leading-relaxed overflow-x-auto text-zinc-300 max-h-48 scrollbar-thin">
                  {codeSnippet}
                </pre>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => handleCopy(codeSnippet, 'generated-code')}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition inline-flex items-center gap-1"
                  >
                    {copiedKey === 'generated-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'generated-code' ? 'Copied Snippet' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Subject & Match Playground (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-6 md:p-7 space-y-5">
            {/* Top Mode Tabs: Match vs Replace */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
                <button
                  type="button"
                  onClick={() => setActiveTab('match')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'match'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Matches & Groups ({matches.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('replace')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'replace'
                      ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Replace className="w-3.5 h-3.5" />
                  <span>Find & Replace</span>
                </button>
              </div>

              {/* Clear button */}
              <button
                type="button"
                onClick={() => setTestString('')}
                className="text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1"
                title="Clear test text"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Text</span>
              </button>
            </div>

            {/* Test Subject Textarea */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <label htmlFor="test-subject-input">Test String / Subject Text</label>
                <span className="text-[11px] font-mono text-zinc-400">
                  {testString.length} chars • {testString.split(/\r\n|\r|\n/).length} lines
                </span>
              </div>
              <textarea
                id="test-subject-input"
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Type or paste your sample text here..."
                rows={4}
                className="w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 font-mono text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 shadow-inner resize-y leading-relaxed"
              />
            </div>

            {/* MATCH MODE: Visual Highlight Viewer */}
            {activeTab === 'match' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                      Visual Matching Highlight Viewer
                    </span>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
                    </span>
                  </div>
                  <div className="w-full min-h-[120px] max-h-[260px] overflow-y-auto p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50 font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words leading-relaxed select-text shadow-inner">
                    {highlightedNodes}
                  </div>
                </div>

                {/* Matches & Capture Groups List */}
                {matches.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800">
                      <h3 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Match Breakdown & Capture Groups</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleCopy(JSON.stringify(matches, null, 2), 'matches-json')}
                        className="text-[11px] font-bold text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                      >
                        {copiedKey === 'matches-json' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'matches-json' ? 'Copied JSON' : 'Export JSON'}</span>
                      </button>
                    </div>

                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                      {matches.map((m, idx) => (
                        <div
                          key={`match-${idx}`}
                          className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 text-xs font-mono space-y-1.5"
                        >
                          <div className="flex justify-between items-center font-bold text-zinc-700 dark:text-zinc-300">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              <span>Match #{idx + 1}</span>
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              Character index: {m.index}..{m.index + m.text.length}
                            </span>
                          </div>

                          <div className="text-zinc-800 dark:text-zinc-200 break-all">
                            <span className="text-zinc-400 select-none">Full: </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold">
                              "{m.text}"
                            </span>
                          </div>

                          {m.groups.length > 0 && (
                            <div className="space-y-0.5 pt-1 pl-2 border-l-2 border-indigo-200 dark:border-indigo-900/60 text-[11px]">
                              {m.groups.map((grp, gIdx) => (
                                <div key={gIdx} className="text-zinc-500 dark:text-zinc-400 break-all">
                                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                    Group ${gIdx + 1}:
                                  </span>{' '}
                                  "{grp !== undefined ? grp : 'undefined'}"
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* REPLACE MODE: Find & Replace Studio */}
            {activeTab === 'replace' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    <label htmlFor="replace-pattern-input">Replacement String / Template</label>
                    <span className="text-[10px] text-zinc-400">
                      Supports $1, $2, $&amp; (full match)
                    </span>
                  </div>
                  <input
                    id="replace-pattern-input"
                    type="text"
                    value={replacePattern}
                    onChange={(e) => setReplacePattern(e.target.value)}
                    placeholder="e.g. [$1], masked_***, or replacement text"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-mono text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500 shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
                      Substituted Result Preview
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(replacementResult, 'replaced-text')}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      {copiedKey === 'replaced-text' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'replaced-text' ? 'Copied Result' : 'Copy Output'}</span>
                    </button>
                  </div>
                  <div className="w-full min-h-[140px] max-h-[260px] overflow-y-auto p-4 rounded-xl border border-emerald-200/70 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 font-mono text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words leading-relaxed shadow-inner">
                    {replacementResult}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
