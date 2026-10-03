/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useRef } from 'react';
import {
  FileCode,
  Sparkles,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Settings2,
  Zap,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Code2,
  Layers,
  Palette,
  TrendingDown
} from 'lucide-react';

// --- Preset CSS Templates ---
interface CssPreset {
  id: string;
  name: string;
  desc: string;
  code: string;
}

const PRESETS: CssPreset[] = [
  {
    id: 'modern_reset',
    name: '🎨 Modern CSS Reset & Design Tokens',
    desc: 'CSS reset with @layer, smooth scroll, box-sizing, and OKLCH color variables',
    code: `/*!
 * Toolique Modern CSS Reset & Base System v2.4
 * Licensed under MIT (Preserved in Production)
 */
@layer reset, base, theme, components;

@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0px 0px 0px 0px;
    padding: 0px 0px 0px 0px;
  }

  html {
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  body {
    min-height: 100vh;
    line-height: 1.5;
    text-rendering: optimizeSpeed;
    background-color: #ffffff;
    color: #111827;
  }

  img, picture, video, canvas, svg {
    display: block;
    max-width: 100%;
    height: auto;
  }
}

@layer theme {
  :root {
    --primary-color: #3b82f6;
    --primary-hover: #2563eb;
    --surface-bg: #f8fafc;
    --card-shadow: 0px 10px 15px -3px rgba(0, 0, 0, 0.1);
    --border-radius-lg: 0.75rem;
    --transition-speed: 250ms;
  }
}`
  },
  {
    id: 'glassmorphism_card',
    name: '✨ Glassmorphism & UI Components',
    desc: 'Frosted glass UI card with backdrop-filter, gradients, and hover transitions',
    code: `/* Glassmorphic Interactive Dashboard Card */
.glass-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.0rem 2.0rem 2.0rem 2.0rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 400px;
}

.glass-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  padding: 1.5rem 1.5rem 1.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12.5px);
  -webkit-backdrop-filter: blur(12.5px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  box-shadow: 0px 8px 32px 0px rgba(31, 38, 135, 0.37);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0px 16px 40px 0px rgba(31, 38, 135, 0.45);
}

.glass-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
}`
  },
  {
    id: 'responsive_grid',
    name: '📱 Responsive Grid & Container Queries',
    desc: 'Fluid auto-fit layout with clamp typography and modern media queries',
    code: `/* Responsive Multi-Column Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 1.5rem 1.5rem;
  padding: 1.0rem 1.0rem 1.0rem 1.0rem;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
}

.product-item {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: border-color 0.2s ease-in-out;
}

.product-item:hover {
  border-color: #3b82f6;
}

.product-item__header {
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
  font-weight: 600;
  color: #1f2937;
  padding: 1rem 1rem 0.5rem 1rem;
}

@media (max-width: 768px) {
  .product-grid {
    gap: 1.0rem 1.0rem;
    padding: 0.5rem 0.5rem 0.5rem 0.5rem;
  }
}`
  },
  {
    id: 'keyframe_animations',
    name: '🎬 Shimmer & Keyframe Micro-Interactions',
    desc: 'Skeleton loading shimmer, floating pulse, and CSS keyframe animations',
    code: `/* CSS Keyframe Animation Suite */
@keyframes skeletonShimmer {
  0% {
    background-position: -200% 0px;
  }
  100% {
    background-position: 200% 0px;
  }
}

@keyframes floatPulse {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.9;
  }
  50% {
    transform: translateY(-8px) scale(1.02);
    opacity: 1;
  }
}

.skeleton-loader {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s infinite ease-in-out;
  border-radius: 4px;
}

.badge-pulse {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem 0.25rem 0.75rem;
  background-color: #ef4444;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 9999px;
  animation: floatPulse 2.4s infinite ease-in-out;
}`
  },
  {
    id: 'dark_mode_tokens',
    name: '🌓 Light & Dark Theme Variable Studio',
    desc: 'Prefers-color-scheme switching with high-contrast color palettes',
    code: `/* Light / Dark Mode Color Token System */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --text-main: #111827;
  --text-muted: #6b7280;
  --accent-color: #6366f1;
  --border-subtle: #e5e7eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --accent-color: #818cf8;
    --border-subtle: #334155;
  }
}

[data-theme="dark"] {
  --bg-primary: #09090b;
  --bg-secondary: #18181b;
  --text-main: #fafafa;
  --text-muted: #a1a1aa;
  --accent-color: #a855f7;
  --border-subtle: #27272a;
}`
  }
];

// --- Minification Options ---
export interface CssMinifyOptions {
  mode: 'safe' | 'aggressive' | 'beautify';
  stripComments: 'all' | 'keep_license' | 'keep_all';
  shortenHexColors: boolean;
  stripZeroUnits: boolean;
  compressDecimals: boolean;
  collapseShorthands: boolean;
  removeTrailingSemicolons: boolean;
  indentSpaces: number;
}

export default function CssMinifier() {
  const [activeTab, setActiveTab] = useState<'editor' | 'diff' | 'embeds' | 'metrics'>('editor');
  const [rawCode, setRawCode] = useState<string>(PRESETS[0].code);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Options State
  const [options, setOptions] = useState<CssMinifyOptions>({
    mode: 'safe',
    stripComments: 'keep_license',
    shortenHexColors: true,
    stripZeroUnits: true,
    compressDecimals: true,
    collapseShorthands: true,
    removeTrailingSemicolons: true,
    indentSpaces: 2
  });

  const updateOption = <K extends keyof CssMinifyOptions>(key: K, value: CssMinifyOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // --- Smart CSS Lexer, Minifier & Formatter Engine ---
  const { processedCode, parseErrors, stats } = useMemo(() => {
    if (!rawCode.trim()) {
      return {
        processedCode: '',
        parseErrors: [] as string[],
        stats: {
          rawBytes: 0,
          processedBytes: 0,
          savingsPct: 0,
          rawLines: 0,
          processedLines: 0,
          gzipEstBytes: 0,
          brotliEstBytes: 0,
          download3gMs: 0,
          download4gMs: 0
        }
      };
    }

    const errors: string[] = [];

    // Basic syntax balance checks
    let openBraces = 0;
    let openParens = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let i = 0; i < rawCode.length; i++) {
      const char = rawCode[i];
      const prev = i > 0 ? rawCode[i - 1] : '';

      if (char === "'" && prev !== '\\' && !inDoubleQuote) inSingleQuote = !inSingleQuote;
      else if (char === '"' && prev !== '\\' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;

      if (!inSingleQuote && !inDoubleQuote) {
        if (char === '{') openBraces++;
        else if (char === '}') openBraces--;
        else if (char === '(') openParens++;
        else if (char === ')') openParens--;
      }
    }

    if (openBraces !== 0) errors.push(`Unbalanced braces { } (net: ${openBraces > 0 ? '+' : ''}${openBraces})`);
    if (openParens !== 0) errors.push(`Unbalanced parentheses ( ) in calc/url/rgba (net: ${openParens > 0 ? '+' : ''}${openParens})`);
    if (inSingleQuote || inDoubleQuote) errors.push('Unterminated string quotation mark detected in CSS selector or content property');

    let output = rawCode;

    if (options.mode === 'beautify') {
      // --- Beautify Mode ---
      let result = '';
      let indent = 0;
      const indentStr = ' '.repeat(options.indentSpaces);
      
      // Clean comments first
      let cleanInput = output;
      if (options.stripComments === 'all') {
        cleanInput = cleanInput.replace(/\/\*[\s\S]*?\*\//g, '');
      }

      // Format CSS rules
      const lines = cleanInput
        .replace(/\s*\{\s*/g, ' {\n')
        .replace(/\s*;\s*/g, ';\n')
        .replace(/\s*\}\s*/g, '\n}\n')
        .split('\n');

      const formattedLines: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('}')) {
          indent = Math.max(0, indent - 1);
        }

        // Add space after colon for property: value
        let formattedLine = trimmed;
        if (formattedLine.includes(':') && !formattedLine.startsWith('@') && !formattedLine.startsWith('--') && !formattedLine.includes('::')) {
          const colonIdx = formattedLine.indexOf(':');
          if (colonIdx !== -1 && formattedLine[colonIdx + 1] !== ' ') {
            formattedLine = formattedLine.substring(0, colonIdx) + ': ' + formattedLine.substring(colonIdx + 1).trim();
          }
        }

        formattedLines.push(indentStr.repeat(indent) + formattedLine);

        if (trimmed.endsWith('{')) {
          indent++;
        }
      }
      result = formattedLines.join('\n');
      output = result;
    } else {
      // --- Minify Mode ---
      let result = '';
      let i = 0;
      const len = output.length;
      let lastChar = '';

      while (i < len) {
        const c = output[i];
        const next = i + 1 < len ? output[i + 1] : '';

        // Comments Handling (/* ... */ and /*! ... */)
        if (c === '/' && next === '*') {
          const isLicense = output.substr(i, 3) === '/*!';
          const endIdx = output.indexOf('*/', i + 2);
          if (endIdx === -1) {
            i = len;
          } else {
            const commentText = output.substring(i, endIdx + 2);
            if (options.stripComments === 'keep_all' || (options.stripComments === 'keep_license' && isLicense)) {
              result += commentText + '\n';
            }
            i = endIdx + 2;
          }
          continue;
        }

        // String literals ('...' or "...")
        if (c === "'" || c === '"') {
          const quote = c;
          let str = quote;
          i++;
          while (i < len) {
            const sc = output[i];
            str += sc;
            if (sc === '\\') {
              i++;
              if (i < len) str += output[i];
            } else if (sc === quote) {
              break;
            }
            i++;
          }
          result += str;
          lastChar = quote;
          i++;
          continue;
        }

        // URL blocks (url(...))
        if (c === 'u' && output.substr(i, 4).toLowerCase() === 'url(') {
          const urlEnd = output.indexOf(')', i + 4);
          if (urlEnd !== -1) {
            const urlContent = output.substring(i, urlEnd + 1);
            result += urlContent.replace(/\s+/g, '');
            i = urlEnd + 1;
            lastChar = ')';
            continue;
          }
        }

        // Space Collapsing
        if (/\s/.test(c)) {
          // Check if space is needed between selectors or words (e.g. `body div`, `10px solid`)
          let nextNonWs = '';
          let k = i + 1;
          while (k < len && /\s/.test(output[k])) {
            k++;
          }
          if (k < len) nextNonWs = output[k];

          // Space required between alphanumeric words and not after punctuation
          const isWordPrev = /[a-zA-Z0-9_%#\.\-\)]/.test(lastChar);
          const isWordNext = /[a-zA-Z0-9_%#\.\-\(]/.test(nextNonWs);
          const isPunctuation = /[{}|:;,>+~]/.test(lastChar) || /[{}|:;,>+~]/.test(nextNonWs);

          if (isWordPrev && isWordNext && !isPunctuation) {
            result += ' ';
            lastChar = ' ';
          }
          i = k;
          continue;
        }

        // Normal Character
        result += c;
        lastChar = c;
        i++;
      }

      output = result;

      // 1. Remove space around CSS operators and punctuation
      output = output.replace(/\s*([{}|:;,>+~])\s*/g, '$1');

      // 2. Safe Hex Color Shortening (#ffffff -> #fff, #000000 -> #000)
      if (options.shortenHexColors || options.mode === 'aggressive') {
        output = output.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g, '#$1$2$3');
      }

      // 3. Strip redundant zero units (0px, 0em, 0rem, 0%, 0pt -> 0)
      // Note: Keep 0s and 0deg as they may be required for animation-duration or transform-rotate
      if (options.stripZeroUnits || options.mode === 'aggressive') {
        output = output.replace(/(:|\s)0(?:px|em|rem|%|pt|vw|vh|cm|mm|in)\b/g, '$10');
      }

      // 4. Compress leading floating decimal zeros (0.5rem -> .5rem, 0.75 -> .75)
      if (options.compressDecimals || options.mode === 'aggressive') {
        output = output.replace(/(:|\s|,)0\.(\d+)/g, '$1.$2');
      }

      // 5. Margin/Padding Shorthand 4-value Collapsing (10px 10px 10px 10px -> 10px)
      if (options.collapseShorthands || options.mode === 'aggressive') {
        output = output.replace(
          /(margin|padding|border-radius|border-width):([^\s;]+)\s+\2\s+\2\s+\2(;|\})/gi,
          '$1:$2$3'
        );
        output = output.replace(
          /(margin|padding):([^\s;]+)\s+([^\s;]+)\s+\2\s+\3(;|\})/gi,
          '$1:$2 $3$4'
        );
      }

      // 6. Remove trailing semicolons before closing brace (;})
      if (options.removeTrailingSemicolons || options.mode === 'aggressive') {
        output = output.replace(/;}/g, '}');
      }

      // Final trim
      output = output.trim();
    }

    // Performance & Wire Metrics
    const rawBytes = new Blob([rawCode]).size;
    const processedBytes = new Blob([output]).size;
    const savingsPct = rawBytes > 0 ? ((rawBytes - processedBytes) / rawBytes) * 100 : 0;
    const rawLines = rawCode.split('\n').length;
    const processedLines = output.split('\n').length;

    // Gzip estimation (~70% reduction on minified CSS)
    const gzipEstBytes = Math.round(processedBytes * 0.30);
    // Brotli estimation (~75% reduction on minified CSS)
    const brotliEstBytes = Math.round(processedBytes * 0.25);

    // Mobile latency estimates (3G at 1.6 Mbps / 200 KB/s, 4G at 20 Mbps / 2.5 MB/s)
    const download3gMs = Math.round((gzipEstBytes / 200000) * 1000);
    const download4gMs = Math.max(1, Math.round((gzipEstBytes / 2500000) * 1000));

    return {
      processedCode: output,
      parseErrors: errors,
      stats: {
        rawBytes,
        processedBytes,
        savingsPct: Number(savingsPct.toFixed(1)),
        rawLines,
        processedLines,
        gzipEstBytes,
        brotliEstBytes,
        download3gMs,
        download4gMs
      }
    };
  }, [rawCode, options]);

  // Copy Handlers
  const handleCopy = (type: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Download File
  const handleDownload = () => {
    const blob = new Blob([processedCode], { type: 'text/css;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = options.mode === 'beautify' ? 'styles.css' : 'styles.min.css';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Upload File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setRawCode(content);
    };
    reader.readAsText(file);
  };

  // HTML Style Tag Embed
  const styleTagCode = useMemo(() => {
    return `<style>\n${processedCode}\n</style>`;
  }, [processedCode]);

  // Data URI Embed
  const dataUriCode = useMemo(() => {
    if (!processedCode) return '';
    try {
      const base64 = btoa(unescape(encodeURIComponent(processedCode)));
      return `data:text/css;base64,${base64}`;
    } catch {
      return '';
    }
  }, [processedCode]);

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner Studio Header (Zero Double Heading) */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-white to-pink-50/70 dark:from-indigo-950/30 dark:via-zinc-900/60 dark:to-pink-950/20 border border-indigo-200/80 dark:border-indigo-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white uppercase tracking-wider flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" /> CSS Compression & Optimization Studio
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Hex Compaction • Zero-Unit Stripping • Gzip Telemetry
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
              <span>Original: <strong className="font-mono text-zinc-900 dark:text-white">{stats.rawBytes.toLocaleString()} B</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Minified: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{stats.processedBytes.toLocaleString()} B</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Wire Saved: <strong className="font-mono text-emerald-600 dark:text-emerald-400">-{stats.savingsPct}% ({Math.max(0, stats.rawBytes - stats.processedBytes).toLocaleString()} B)</strong></span>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".css,.scss,.less,.txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Upload CSS</span>
            </button>

            <button
              onClick={() => handleCopy('minified', processedCode)}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copiedType === 'minified' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{copiedType === 'minified' ? 'Copied CSS!' : 'Copy Minified'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .min.css</span>
            </button>
          </div>
        </div>

        {/* 1-Click CSS Presets */}
        <div className="mt-3 pt-3 border-t border-indigo-100/70 dark:border-indigo-900/30 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Quick Presets:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setRawCode(preset.code)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/80 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 transition cursor-pointer"
              title={preset.desc}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Syntax Error Warning Banner */}
      {parseErrors.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Stylesheet Inspection Notice</p>
            <ul className="list-disc list-inside space-y-0.5 opacity-90 font-mono text-[11px]">
              {parseErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Navigation Studio Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: 'editor', name: '⚡ Minify & Format Studio', icon: FileCode },
          { id: 'diff', name: '🔍 Side-by-Side Visual Diff', icon: Layers },
          { id: 'embeds', name: '📦 Embeds & Data URIs', icon: Code2 },
          { id: 'metrics', name: '📊 Network Wire & Gzip Telemetry', icon: TrendingDown }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Editor & Minifier Studio */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Raw Source CSS */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Raw Stylesheet Input</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                  <span>{stats.rawLines} lines</span>
                  <span>•</span>
                  <span>{stats.rawBytes.toLocaleString()} B</span>
                  <button
                    onClick={() => setRawCode('')}
                    className="p-1 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                    title="Clear CSS"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                value={rawCode}
                onChange={(e) => setRawCode(e.target.value)}
                placeholder="Paste uncompressed CSS stylesheets here..."
                className="w-full h-96 p-3.5 font-mono text-xs leading-relaxed bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 resize-y"
                spellCheck={false}
              />
            </div>

            {/* Minification Strategy Controls */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-indigo-500" /> Optimization Strategy
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Rules & Compression</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => updateOption('mode', 'safe')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                    options.mode === 'safe'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>🛡️ Safe Mode</span>
                    {options.mode === 'safe' && <Check className="w-3 h-3 text-indigo-600" />}
                  </div>
                  <p className="text-[10px] font-normal opacity-80 mt-0.5">Whitespace & Comments</p>
                </button>

                <button
                  onClick={() => updateOption('mode', 'aggressive')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                    options.mode === 'aggressive'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>⚡ Aggressive</span>
                    {options.mode === 'aggressive' && <Check className="w-3 h-3 text-indigo-600" />}
                  </div>
                  <p className="text-[10px] font-normal opacity-80 mt-0.5">Hex & 0-Unit Compaction</p>
                </button>

                <button
                  onClick={() => updateOption('mode', 'beautify')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-left cursor-pointer ${
                    options.mode === 'beautify'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>✨ Beautify</span>
                    {options.mode === 'beautify' && <Check className="w-3 h-3 text-indigo-600" />}
                  </div>
                  <p className="text-[10px] font-normal opacity-80 mt-0.5">Formatted 2-Space Indent</p>
                </button>
              </div>

              {/* Checkbox Optimizations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={options.shortenHexColors}
                    onChange={(e) => updateOption('shortenHexColors', e.target.checked)}
                    className="rounded-sm text-indigo-600 accent-indigo-600"
                  />
                  <span>Shorten Hex Colors (#ffffff &rarr; #fff)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={options.stripZeroUnits}
                    onChange={(e) => updateOption('stripZeroUnits', e.target.checked)}
                    className="rounded-sm text-indigo-600 accent-indigo-600"
                  />
                  <span>Strip zero units (0px &rarr; 0)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={options.compressDecimals}
                    onChange={(e) => updateOption('compressDecimals', e.target.checked)}
                    className="rounded-sm text-indigo-600 accent-indigo-600"
                  />
                  <span>Compress decimal zeros (0.5 &rarr; .5)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={options.removeTrailingSemicolons}
                    onChange={(e) => updateOption('removeTrailingSemicolons', e.target.checked)}
                    className="rounded-sm text-indigo-600 accent-indigo-600"
                  />
                  <span>Remove trailing semicolons (;&rbrace;)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Minified CSS Output */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {options.mode === 'beautify' ? 'Formatted Stylesheet' : 'Minified Production Payload'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                  <span>{stats.processedLines} lines</span>
                  <span>•</span>
                  <span>{stats.processedBytes.toLocaleString()} B</span>
                </div>
              </div>

              <textarea
                readOnly
                value={processedCode}
                placeholder="Compressed stylesheet will generate here..."
                className="w-full h-96 p-3.5 font-mono text-xs leading-relaxed bg-zinc-900 text-zinc-100 dark:bg-zinc-950 dark:text-emerald-300 rounded-xl border border-zinc-800 focus:outline-hidden resize-y select-all"
                spellCheck={false}
              />
            </div>

            {/* Compression Metrics Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Original</span>
                  <p className="text-base font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                    {stats.rawBytes.toLocaleString()} B
                  </p>
                  <p className="text-[10px] text-zinc-500">{stats.rawLines} lines</p>
                </div>

                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/80 dark:border-indigo-900/40 text-center">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Minified</span>
                  <p className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
                    {stats.processedBytes.toLocaleString()} B
                  </p>
                  <p className="text-[10px] text-zinc-500">{stats.processedLines} lines</p>
                </div>

                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 text-center">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Savings Ratio</span>
                  <p className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    -{stats.savingsPct}%
                  </p>
                  <p className="text-[10px] text-zinc-500">{(stats.rawBytes - stats.processedBytes).toLocaleString()} B saved</p>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Gzip Estimate</span>
                  <p className="text-base font-black text-zinc-900 dark:text-white font-mono mt-0.5">
                    ~{stats.gzipEstBytes.toLocaleString()} B
                  </p>
                  <p className="text-[10px] text-zinc-500">Wire transfer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Side-by-Side Visual Diff */}
      {activeTab === 'diff' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Side-by-Side Visual Stylesheet Diff</span>
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              Before ({stats.rawBytes} B) vs After ({stats.processedBytes} B)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Raw Stylesheet (Uncompressed)</span>
              <pre className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-xs overflow-auto h-96 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                {rawCode}
              </pre>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Minified / Formatted Payload</span>
              <pre className="p-4 bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs overflow-auto h-96 text-emerald-400 whitespace-pre-wrap">
                {processedCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Embeds & Data URIs */}
      {activeTab === 'embeds' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-500" />
              <span>HTML &lt;style&gt; Tags & Base64 Data URIs</span>
            </h3>
          </div>

          {/* HTML Style Tag */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Inline HTML &lt;style&gt; Tag</span>
              <button
                onClick={() => handleCopy('styleTag', styleTagCode)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'styleTag' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'styleTag' ? 'Copied!' : 'Copy <style> Tag'}</span>
              </button>
            </div>
            <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-xs overflow-x-auto">
              {styleTagCode}
            </pre>
          </div>

          {/* Base64 Data URI */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Base64 CSS Data URI (for SVG/Iframes)</span>
              <button
                onClick={() => handleCopy('dataUri', dataUriCode)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'dataUri' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'dataUri' ? 'Copied URI!' : 'Copy Data URI'}</span>
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={dataUriCode}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-emerald-400 truncate"
            />
          </div>
        </div>
      )}

      {/* TAB 4: Wire Transfer & Performance Metrics */}
      {activeTab === 'metrics' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Stylesheet Network Delivery & Core Web Vitals Audit</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-1 text-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Estimated Gzip Payload</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {(stats.gzipEstBytes / 1024).toFixed(2)} KB
              </p>
              <p className="text-[10px] text-zinc-500">Standard HTTP/2 Compression</p>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-1 text-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Estimated Brotli Payload</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {(stats.brotliEstBytes / 1024).toFixed(2)} KB
              </p>
              <p className="text-[10px] text-zinc-500">Next-gen HTTP/3 Compression</p>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-1 text-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">3G Mobile Latency</span>
              <p className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                ~{stats.download3gMs} ms
              </p>
              <p className="text-[10px] text-zinc-500">Fast 3G Mobile Network</p>
            </div>
          </div>

          {/* Educational Insights Box */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 rounded-2xl space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
            <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Stylesheet Optimization & Render-Blocking Mitigation:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <li><strong>Eliminate Render-Blocking CSS:</strong> External CSS files block HTML page rendering until downloaded. Minifying CSS reduces the critical path latency directly improving First Contentful Paint (FCP).</li>
              <li><strong>CSS Custom Property Shorthand:</strong> Consolidating redundant CSS rules into global `:root` variables reduces style computation recalculation passes in the browser rendering engine.</li>
              <li><strong>Font Loading Optimization:</strong> Combine minified CSS with <code>font-display: swap;</code> and <code>&lt;link rel="preload"&gt;</code> to eliminate Flash of Invisible Text (FOIT).</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
