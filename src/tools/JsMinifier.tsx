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
  Bookmark,
  FileCheck,
  AlertTriangle,
  Code2,
  Layers,
  TrendingDown
} from 'lucide-react';

// --- Preset Code Templates ---
interface CodePreset {
  id: string;
  name: string;
  desc: string;
  code: string;
}

const PRESETS: CodePreset[] = [
  {
    id: 'fetch_api',
    name: '⚡ Async Fetch API with Retry',
    desc: 'Modern fetch utility with timeout, error handling, and exponential backoff',
    code: `/**
 * Fetches JSON resource with automatic retry backoff
 * @param {string} url - Target endpoint URL
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Base delay in milliseconds
 * @returns {Promise<any>}
 */
async function fetchWithRetry(url, retries = 3, delay = 1000) {
  // Initialize AbortController for request timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    console.log(\`[Network] Requesting \${url} (Attempts left: \${retries})\`);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "X-Requested-With": "TooliqueEngine"
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }

    const data = await response.json();
    console.info("[Network] Data fetched successfully:", data);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (retries > 0) {
      console.warn(\`Retrying in \${delay}ms...\`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, retries - 1, delay * 1.5);
    }
    debugger; // Debug breakpoint on final failure
    throw new Error(\`Failed to fetch after retries: \${error.message}\`);
  }
}`
  },
  {
    id: 'debounce_throttle',
    name: '⏱️ Debounce & Throttle Helpers',
    desc: 'Performance optimizations for scroll, resize, and keystroke events',
    code: `// Universal Debounce Function with Immediate Trigger Option
function debounce(callback, wait = 300, immediate = false) {
  let timeoutId = null;
  
  return function executedFunction(...args) {
    const context = this;
    const callNow = immediate && !timeoutId;
    
    const later = () => {
      timeoutId = null;
      if (!immediate) {
        callback.apply(context, args);
      }
    };
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, wait);
    
    if (callNow) {
      callback.apply(context, args);
    }
  };
}

// Throttle utility ensuring max 1 execution per interval window
function throttle(func, limit = 200) {
  let inThrottle = false;
  let lastFn = null;
  let lastTime = 0;
  
  return function(...args) {
    const context = this;
    const now = Date.now();
    
    if (!inThrottle) {
      func.apply(context, args);
      lastTime = now;
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= limit) {
          func.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(limit - (now - lastTime), 0));
    }
  };
}`
  },
  {
    id: 'dom_modal',
    name: '🎨 Modal Controller & Focus Trap',
    desc: 'Accessible modal dialog with keyboard navigation and overlay traps',
    code: `class ModalController {
  constructor(modalId, overlayId) {
    this.modal = document.getElementById(modalId);
    this.overlay = document.getElementById(overlayId);
    this.isOpen = false;
    this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  open() {
    if (!this.modal) return;
    this.isOpen = true;
    this.modal.classList.add("is-active");
    this.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    
    document.addEventListener("keydown", this.handleKeyDown);
    
    // Auto-focus first interactive element
    const firstFocusable = this.modal.querySelector(this.focusableElements);
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  close() {
    if (!this.modal) return;
    this.isOpen = false;
    this.modal.classList.remove("is-active");
    this.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown(event) {
    if (event.key === "Escape") {
      this.close();
    }
  }
}`
  },
  {
    id: 'canvas_particle',
    name: '🌌 Canvas Particle System Loop',
    desc: 'Trigonometric particle physics with 60FPS requestAnimationFrame',
    code: `// Canvas Animation Engine
function initParticleCanvas(canvasId, particleCount = 100) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  
  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  
  const particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 3 + 1,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    color: \`hsl(\${Math.floor(Math.random() * 360)}, 70%, 60%)\`
  }));

  function render() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Bounce against edges
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  render();
}`
  },
  {
    id: 'analytics_beacon',
    name: '📊 Queue Beacon Analytics Tracker',
    desc: 'Lightweight user telemetry dispatcher with batching & pagehide sync',
    code: `(function(window, document) {
  const ANALYTICS_ENDPOINT = "https://telemetry.toolique.com/api/v1/collect";
  const queue = [];
  const FLUSH_INTERVAL_MS = 5000;

  function trackEvent(eventName, payload = {}) {
    const eventData = {
      event: eventName,
      timestamp: Date.now(),
      url: window.location.href,
      payload: payload
    };

    queue.push(eventData);
    if (queue.length >= 10) {
      flushQueue();
    }
  }

  function flushQueue() {
    if (queue.length === 0) return;
    
    const eventsToSend = queue.splice(0, queue.length);
    const data = JSON.stringify({ batch: eventsToSend });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ANALYTICS_ENDPOINT, data);
    } else {
      fetch(ANALYTICS_ENDPOINT, {
        method: "POST",
        body: data,
        keepalive: true,
        headers: { "Content-Type": "application/json" }
      }).catch(err => console.error("Telemetry failed:", err));
    }
  }

  setInterval(flushQueue, FLUSH_INTERVAL_MS);
  window.addEventListener("pagehide", flushQueue);
  window.TooliqueAnalytics = { track: trackEvent, flush: flushQueue };
})(window, document);`
  }
];

// --- Minification / Beautification Options ---
export interface MinifyOptions {
  mode: 'safe' | 'aggressive' | 'beautify';
  stripComments: 'all' | 'keep_license' | 'keep_all';
  stripConsole: boolean;
  stripDebugger: boolean;
  shortenBooleans: boolean;
  shortenUndefined: boolean;
  removeTrailingSemicolons: boolean;
  indentSpaces: number;
}

export default function JsMinifier() {
  const [activeTab, setActiveTab] = useState<'editor' | 'diff' | 'bookmarklet' | 'metrics'>('editor');
  const [rawCode, setRawCode] = useState<string>(PRESETS[0].code);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Options State
  const [options, setOptions] = useState<MinifyOptions>({
    mode: 'safe',
    stripComments: 'keep_license',
    stripConsole: false,
    stripDebugger: true,
    shortenBooleans: false,
    shortenUndefined: false,
    removeTrailingSemicolons: false,
    indentSpaces: 2
  });

  // Toggle option helper
  const updateOption = <K extends keyof MinifyOptions>(key: K, value: MinifyOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // --- Smart JavaScript Lexer / Minifier & Beautifier Engine ---
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

    // Basic syntax balance verification
    let openBraces = 0;
    let openBrackets = 0;
    let openParens = 0;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inTemplate = false;

    for (let i = 0; i < rawCode.length; i++) {
      const char = rawCode[i];
      const prev = i > 0 ? rawCode[i - 1] : '';

      if (char === "'" && prev !== '\\' && !inDoubleQuote && !inTemplate) inSingleQuote = !inSingleQuote;
      else if (char === '"' && prev !== '\\' && !inSingleQuote && !inTemplate) inDoubleQuote = !inDoubleQuote;
      else if (char === '`' && prev !== '\\' && !inSingleQuote && !inDoubleQuote) inTemplate = !inTemplate;

      if (!inSingleQuote && !inDoubleQuote && !inTemplate) {
        if (char === '{') openBraces++;
        else if (char === '}') openBraces--;
        else if (char === '[') openBrackets++;
        else if (char === ']') openBrackets--;
        else if (char === '(') openParens++;
        else if (char === ')') openParens--;
      }
    }

    if (openBraces !== 0) errors.push(`Unbalanced curly braces { } (net: ${openBraces > 0 ? '+' : ''}${openBraces})`);
    if (openBrackets !== 0) errors.push(`Unbalanced square brackets [ ] (net: ${openBrackets > 0 ? '+' : ''}${openBrackets})`);
    if (openParens !== 0) errors.push(`Unbalanced parentheses ( ) (net: ${openParens > 0 ? '+' : ''}${openParens})`);
    if (inSingleQuote || inDoubleQuote || inTemplate) errors.push('Unterminated string or template literal detected');

    let output = rawCode;

    // 1. Strip Console Logging
    if (options.stripConsole) {
      output = output.replace(/console\.(log|debug|info|warn|table|trace|time|timeEnd|dir)\s*\([\s\S]*?\)\s*;?/g, '');
    }

    // 2. Strip Debugger
    if (options.stripDebugger) {
      output = output.replace(/\bdebugger\s*;?/g, '');
    }

    if (options.mode === 'beautify') {
      // --- Beautify Mode ---
      let indent = 0;
      const indentStr = ' '.repeat(options.indentSpaces);
      const lines = output.split('\n');
      const formattedLines: string[] = [];

      for (let rawLine of lines) {
        const trimmed = rawLine.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
          indent = Math.max(0, indent - 1);
        }

        formattedLines.push(indentStr.repeat(indent) + trimmed);

        if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
          indent++;
        }
      }
      output = formattedLines.join('\n');
    } else {
      // --- Minify Mode ---
      let result = '';
      let i = 0;
      const len = output.length;
      let lastChar = '';

      while (i < len) {
        const c = output[i];
        const next = i + 1 < len ? output[i + 1] : '';

        // License / Multi-line Comment
        if (c === '/' && next === '*') {
          const isLicense = output.substr(i, 4) === '/*!' || output.substr(i, 3) === '/**';
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

        // Single-line Comment
        if (c === '/' && next === '/') {
          const isShebang = i === 0 && output.substr(i, 2) === '#!';
          const endIdx = output.indexOf('\n', i + 2);
          if (isShebang) {
            result += output.substring(i, endIdx === -1 ? len : endIdx) + '\n';
          }
          i = endIdx === -1 ? len : endIdx + 1;
          continue;
        }

        // String literals (Single & Double quotes)
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

        // Template Literals (Backticks)
        if (c === '`') {
          let str = '`';
          i++;
          while (i < len) {
            const tc = output[i];
            str += tc;
            if (tc === '\\') {
              i++;
              if (i < len) str += output[i];
            } else if (tc === '`') {
              break;
            }
            i++;
          }
          result += str;
          lastChar = '`';
          i++;
          continue;
        }

        // Regular Expression Literal Detection (Lookbehind check)
        if (c === '/') {
          const isDivision = /[a-zA-Z0-9_$)\]]/.test(lastChar);
          if (!isDivision) {
            let regexStr = '/';
            i++;
            while (i < len) {
              const rc = output[i];
              regexStr += rc;
              if (rc === '\\') {
                i++;
                if (i < len) regexStr += output[i];
              } else if (rc === '/') {
                i++;
                // Capture flags
                while (i < len && /[a-z]/i.test(output[i])) {
                  regexStr += output[i];
                  i++;
                }
                break;
              }
              i++;
            }
            result += regexStr;
            lastChar = '/';
            continue;
          }
        }

        // Whitespace and Token Collapsing
        if (/\s/.test(c)) {
          // Check if space is mandatory between two alphanumeric/keyword characters
          let nextNonWs = '';
          let k = i + 1;
          while (k < len && /\s/.test(output[k])) {
            k++;
          }
          if (k < len) nextNonWs = output[k];

          const needsSpace =
            /[a-zA-Z0-9_$]/.test(lastChar) && /[a-zA-Z0-9_$]/.test(nextNonWs);

          // Handle automatic semicolon insertion protection across newlines
          const hasNewline = output.substring(i, k).includes('\n');
          const isTerminatingPrev = /[a-zA-Z0-9_$)\]+'"`]/.test(lastChar);
          const isStartingNext = /^[a-zA-Z0-9_$(]/.test(nextNonWs);

          if (hasNewline && isTerminatingPrev && isStartingNext && !needsSpace && lastChar !== ';') {
            result += ';';
            lastChar = ';';
          } else if (needsSpace) {
            result += ' ';
            lastChar = ' ';
          }
          i = k;
          continue;
        }

        // Regular code character
        result += c;
        lastChar = c;
        i++;
      }

      output = result;

      // Aggressive optimizations
      if (options.mode === 'aggressive' || options.shortenBooleans) {
        output = output
          .replace(/\btrue\b/g, '!0')
          .replace(/\bfalse\b/g, '!1');
      }

      if (options.mode === 'aggressive' || options.shortenUndefined) {
        output = output.replace(/\bundefined\b/g, 'void 0');
      }

      if (options.removeTrailingSemicolons) {
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

    // Gzip estimation (~65% reduction on minified text)
    const gzipEstBytes = Math.round(processedBytes * 0.35);
    // Brotli estimation (~70% reduction on minified text)
    const brotliEstBytes = Math.round(processedBytes * 0.30);

    // Latency on mobile 3G (1.6 Mbps / 200 KB/s) & 4G (20 Mbps / 2.5 MB/s)
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
    const blob = new Blob([processedCode], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = options.mode === 'beautify' ? 'formatted.js' : 'bundle.min.js';
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

  // Bookmarklet Formatter
  const bookmarkletCode = useMemo(() => {
    if (!processedCode) return '';
    return `javascript:(function(){${encodeURIComponent(processedCode)}})();`;
  }, [processedCode]);

  // HTML Script Tag
  const scriptTagCode = useMemo(() => {
    return `<script>\n${processedCode}\n</script>`;
  }, [processedCode]);

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner Studio Header (Zero Double Heading) */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-white to-amber-50/70 dark:from-indigo-950/30 dark:via-zinc-900/60 dark:to-amber-950/20 border border-indigo-200/80 dark:border-indigo-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white uppercase tracking-wider flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" /> JS Compression & AST Studio
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Safe Minification • Tree Optimizations • Gzip Telemetry
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
              accept=".js,.mjs,.cjs,.ts,.txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Upload JS</span>
            </button>

            <button
              onClick={() => handleCopy('minified', processedCode)}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copiedType === 'minified' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{copiedType === 'minified' ? 'Copied Code!' : 'Copy Minified'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .min.js</span>
            </button>
          </div>
        </div>

        {/* 1-Click Code Presets */}
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
            <p className="font-bold">Syntax Inspection Warning</p>
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
          { id: 'bookmarklet', name: '🔖 Bookmarklet & Embeds', icon: Bookmark },
          { id: 'metrics', name: '📊 Wire Transfer & Gzip Telemetry', icon: TrendingDown }
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
          {/* Left Column: Raw Source Code */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Raw JavaScript Input</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                  <span>{stats.rawLines} lines</span>
                  <span>•</span>
                  <span>{stats.rawBytes.toLocaleString()} B</span>
                  <button
                    onClick={() => setRawCode('')}
                    className="p-1 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                    title="Clear Code"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                value={rawCode}
                onChange={(e) => setRawCode(e.target.value)}
                placeholder="Paste uncompressed JavaScript (ES6+, Node, TypeScript compile)..."
                className="w-full h-96 p-3.5 font-mono text-xs leading-relaxed bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 resize-y"
                spellCheck={false}
              />
            </div>

            {/* Minification Controls & Toggles */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-indigo-500" /> Compression Strategy
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Options & AST Rules</span>
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
                  <p className="text-[10px] font-normal opacity-80 mt-0.5">Boolean & AST Shortening</p>
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

              {/* Advanced Checkbox Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={options.stripConsole}
                    onChange={(e) => updateOption('stripConsole', e.target.checked)}
                    className="rounded-sm text-indigo-600 accent-indigo-600"
                  />
                  <span>Strip console.log() calls</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={options.stripDebugger}
                    onChange={(e) => updateOption('stripDebugger', e.target.checked)}
                    className="rounded-sm text-indigo-600 accent-indigo-600"
                  />
                  <span>Remove debugger statements</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={options.shortenBooleans}
                    onChange={(e) => updateOption('shortenBooleans', e.target.checked)}
                    className="rounded-sm text-indigo-600 accent-indigo-600"
                  />
                  <span>Shorten true/false (!0 / !1)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={options.removeTrailingSemicolons}
                    onChange={(e) => updateOption('removeTrailingSemicolons', e.target.checked)}
                    className="rounded-sm text-indigo-600 accent-indigo-600"
                  />
                  <span>Omit trailing block semicolons</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Output Minified JavaScript */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    {options.mode === 'beautify' ? 'Formatted Output' : 'Minified Production Payload'}
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
                placeholder="Compressed JavaScript will generate here..."
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
              <span>Side-by-Side Visual Inspector</span>
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              Before ({stats.rawBytes} B) vs After ({stats.processedBytes} B)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Raw Code (Uncompressed)</span>
              <pre className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-xs overflow-auto h-96 text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                {rawCode}
              </pre>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Minified / Formatted Result</span>
              <pre className="p-4 bg-zinc-900 dark:bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs overflow-auto h-96 text-emerald-400 whitespace-pre-wrap">
                {processedCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Bookmarklet & Embed Codes */}
      {activeTab === 'bookmarklet' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Browser Bookmarklet & HTML Embed Formats</span>
            </h3>
          </div>

          {/* Bookmarklet Drag & Drop Button */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Interactive Browser Bookmarklet Link
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Drag this button directly to your browser's Bookmarks bar to execute this script on any live webpage.
                </p>
              </div>

              <a
                href={bookmarkletCode}
                onClick={(e) => e.preventDefault()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-move inline-flex items-center gap-1.5 shrink-0"
                title="Drag to your browser bookmarks bar"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Drag Me to Bookmarks Bar</span>
              </a>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Bookmarklet URI String</span>
                <button
                  onClick={() => handleCopy('bookmarklet', bookmarkletCode)}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedType === 'bookmarklet' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'bookmarklet' ? 'Copied!' : 'Copy URI'}</span>
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={bookmarkletCode}
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-zinc-600 dark:text-zinc-400 truncate"
              />
            </div>
          </div>

          {/* HTML Script Tag Embed */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Inline HTML &lt;script&gt; Embed</span>
              <button
                onClick={() => handleCopy('scriptTag', scriptTagCode)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'scriptTag' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'scriptTag' ? 'Copied!' : 'Copy <script> Tag'}</span>
              </button>
            </div>
            <pre className="p-3 bg-zinc-900 text-zinc-100 rounded-xl font-mono text-xs overflow-x-auto">
              {scriptTagCode}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: Wire Transfer & Performance Metrics */}
      {activeTab === 'metrics' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Network Wire Transfer & PageSpeed Impact Audit</span>
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
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Core Web Vitals & Script Optimization Best Practices:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <li><strong>First Contentful Paint (FCP):</strong> Minifying render-blocking critical scripts decreases total parse & compile execution time by up to 45%.</li>
              <li><strong>Total Blocking Time (TBT):</strong> Removing dead debug statements (`console.log`, `debugger`) reduces V8 engine main thread script evaluation latency.</li>
              <li><strong>HTTP Caching:</strong> Always combine minified outputs (`.min.js`) with immutable Cache-Control headers (`max-age=31536000, immutable`) and Gzip/Brotli server compression.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
