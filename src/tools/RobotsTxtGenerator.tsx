/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  Upload,
  Plus,
  Trash2,
  Settings2,
  ShieldCheck,
  Bot,
  AlertTriangle,
  Code2,
  CheckCircle2,
  XCircle,
  Layers
} from 'lucide-react';

// --- Types & Interfaces ---
export interface BotDirective {
  id: string;
  type: 'allow' | 'disallow';
  path: string;
  comment?: string;
}

export interface UserAgentGroup {
  id: string;
  userAgent: string;
  crawlDelay?: string;
  directives: BotDirective[];
}

export interface RobotsPreset {
  id: string;
  name: string;
  desc: string;
  groups: UserAgentGroup[];
  sitemaps: string[];
}

// Popular Search & AI Crawlers
export const CRAWLER_OPTIONS = [
  { value: '*', label: 'All Crawlers (*)' },
  { value: 'Googlebot', label: 'Googlebot (Google Web Search)' },
  { value: 'Googlebot-Image', label: 'Googlebot-Image (Google Images)' },
  { value: 'Google-Extended', label: 'Google-Extended (Gemini & Vertex AI Training)' },
  { value: 'Bingbot', label: 'Bingbot (Microsoft Bing & Copilot)' },
  { value: 'GPTBot', label: 'GPTBot (OpenAI ChatGPT Search & Training)' },
  { value: 'ChatGPT-User', label: 'ChatGPT-User (Custom GPT Browsing)' },
  { value: 'ClaudeBot', label: 'ClaudeBot (Anthropic AI Crawler)' },
  { value: 'Claude-Web', label: 'Claude-Web (Anthropic Web Fetcher)' },
  { value: 'PerplexityBot', label: 'PerplexityBot (Perplexity AI Search)' },
  { value: 'Applebot', label: 'Applebot (Apple Siri & Spotlight)' },
  { value: 'Baiduspider', label: 'Baiduspider (Baidu Search)' },
  { value: 'YandexBot', label: 'YandexBot (Yandex Search)' },
  { value: 'DuckDuckBot', label: 'DuckDuckBot (DuckDuckGo)' },
  { value: 'facebookexternalhit', label: 'Facebook / Meta Crawler' },
  { value: 'Twitterbot', label: 'Twitter / X Bot' },
  { value: 'CCBot', label: 'CCBot (Common Crawl Data Scraper)' },
  { value: 'Bytespider', label: 'Bytespider (TikTok / ByteDance)' }
];

const PRESETS: RobotsPreset[] = [
  {
    id: 'standard_production',
    name: '🌐 Standard Production (SEO Best Practice)',
    desc: 'Allows all search engines, shields /admin/ and /api/, includes sitemap',
    sitemaps: ['https://example.com/sitemap.xml'],
    groups: [
      {
        id: 'g_all',
        userAgent: '*',
        crawlDelay: 'none',
        directives: [
          { id: 'd1', type: 'allow', path: '/' },
          { id: 'd2', type: 'disallow', path: '/admin/' },
          { id: 'd3', type: 'disallow', path: '/api/' },
          { id: 'd4', type: 'disallow', path: '/private/' },
          { id: 'd5', type: 'disallow', path: '/*?*sort=' },
          { id: 'd6', type: 'disallow', path: '/*.json$' }
        ]
      }
    ]
  },
  {
    id: 'ai_block_opt_out',
    name: '🤖 AI Bot Opt-Out & Content Shield',
    desc: 'Allows Google/Bing search indexing while blocking AI data scraping bots (GPTBot, Claude, CCBot)',
    sitemaps: ['https://example.com/sitemap.xml'],
    groups: [
      {
        id: 'g_all',
        userAgent: '*',
        crawlDelay: 'none',
        directives: [
          { id: 'd1', type: 'allow', path: '/' },
          { id: 'd2', type: 'disallow', path: '/admin/' }
        ]
      },
      {
        id: 'g_ai_scrape',
        userAgent: 'GPTBot',
        directives: [{ id: 'd_gpt', type: 'disallow', path: '/' }]
      },
      {
        id: 'g_claude',
        userAgent: 'ClaudeBot',
        directives: [{ id: 'd_claude', type: 'disallow', path: '/' }]
      },
      {
        id: 'g_ccbot',
        userAgent: 'CCBot',
        directives: [{ id: 'd_cc', type: 'disallow', path: '/' }]
      },
      {
        id: 'g_gext',
        userAgent: 'Google-Extended',
        directives: [{ id: 'd_gext', type: 'disallow', path: '/' }]
      }
    ]
  },
  {
    id: 'wordpress_woocommerce',
    name: '🛍️ WordPress & WooCommerce',
    desc: 'Protects /wp-admin/, carts, checkouts, while allowing AJAX and theme assets',
    sitemaps: ['https://example.com/sitemap_index.xml'],
    groups: [
      {
        id: 'g_wp',
        userAgent: '*',
        crawlDelay: 'none',
        directives: [
          { id: 'd_wp1', type: 'allow', path: '/wp-admin/admin-ajax.php' },
          { id: 'd_wp2', type: 'disallow', path: '/wp-admin/' },
          { id: 'd_wp3', type: 'disallow', path: '/cart/' },
          { id: 'd_wp4', type: 'disallow', path: '/checkout/' },
          { id: 'd_wp5', type: 'disallow', path: '/my-account/' },
          { id: 'd_wp6', type: 'disallow', path: '/track-order/' },
          { id: 'd_wp7', type: 'disallow', path: '/?s=' }
        ]
      }
    ]
  },
  {
    id: 'nextjs_react',
    name: '⚛️ Next.js & React SPA',
    desc: 'Excludes internal /_next/ builds while keeping static assets and APIs safe',
    sitemaps: ['https://example.com/sitemap.xml'],
    groups: [
      {
        id: 'g_next',
        userAgent: '*',
        directives: [
          { id: 'd_n1', type: 'allow', path: '/_next/static/' },
          { id: 'd_n2', type: 'disallow', path: '/_next/' },
          { id: 'd_n3', type: 'disallow', path: '/api/' },
          { id: 'd_n4', type: 'disallow', path: '/preview/' }
        ]
      }
    ]
  },
  {
    id: 'block_all_staging',
    name: '🚫 Block Everything (Staging / Dev)',
    desc: 'Disallows all crawlers completely on staging and testing environments',
    sitemaps: [],
    groups: [
      {
        id: 'g_block',
        userAgent: '*',
        directives: [{ id: 'd_all_block', type: 'disallow', path: '/' }]
      }
    ]
  }
];

export default function RobotsTxtGenerator() {
  const [activeTab, setActiveTab] = useState<'studio' | 'tester' | 'raw_editor' | 'audit'>('studio');
  const [groups, setGroups] = useState<UserAgentGroup[]>(PRESETS[0].groups);
  const [sitemaps, setSitemaps] = useState<string[]>(PRESETS[0].sitemaps);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Path Tester State
  const [testUrlPath, setTestUrlPath] = useState('/admin/dashboard');
  const [testBot, setTestBot] = useState('Googlebot');

  // --- Group & Directive Mutation Handlers ---
  const handleAddGroup = () => {
    const newGroup: UserAgentGroup = {
      id: 'g_' + Date.now(),
      userAgent: 'Googlebot',
      crawlDelay: 'none',
      directives: [{ id: 'd_' + Date.now(), type: 'disallow', path: '/private/' }]
    };
    setGroups((prev) => [...prev, newGroup]);
  };

  const handleRemoveGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleUpdateGroupAgent = (groupId: string, userAgent: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, userAgent } : g))
    );
  };

  const handleUpdateGroupDelay = (groupId: string, crawlDelay: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, crawlDelay } : g))
    );
  };

  const handleAddDirective = (groupId: string) => {
    const newDirective: BotDirective = {
      id: 'd_' + Date.now(),
      type: 'disallow',
      path: ''
    };
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, directives: [...g.directives, newDirective] } : g
      )
    );
  };

  const handleRemoveDirective = (groupId: string, directiveId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, directives: g.directives.filter((d) => d.id !== directiveId) }
          : g
      )
    );
  };

  const handleUpdateDirective = (
    groupId: string,
    directiveId: string,
    field: keyof BotDirective,
    value: string
  ) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              directives: g.directives.map((d) =>
                d.id === directiveId ? { ...d, [field]: value } : d
              )
            }
          : g
      )
    );
  };

  // Sitemap Handlers
  const handleAddSitemap = () => {
    setSitemaps((prev) => [...prev, '']);
  };

  const handleUpdateSitemap = (index: number, value: string) => {
    setSitemaps((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const handleRemoveSitemap = (index: number) => {
    setSitemaps((prev) => prev.filter((_, i) => i !== index));
  };

  // Apply Preset
  const handleApplyPreset = (preset: RobotsPreset) => {
    setGroups(JSON.parse(JSON.stringify(preset.groups)));
    setSitemaps([...preset.sitemaps]);
  };

  // --- Compiled Robots.txt String ---
  const compiledRobotsTxt = useMemo(() => {
    const lines: string[] = [];
    lines.push('# ========================================================');
    lines.push('# Robots.txt Generated via Toolique Studio');
    lines.push('# https://toolique.com/developer/robots-txt-generator');
    lines.push('# ========================================================');
    lines.push('');

    groups.forEach((group, gIdx) => {
      lines.push(`User-agent: ${group.userAgent || '*'}`);
      if (group.crawlDelay && group.crawlDelay !== 'none') {
        lines.push(`Crawl-delay: ${group.crawlDelay}`);
      }

      group.directives.forEach((d) => {
        if (d.path.trim()) {
          const keyword = d.type === 'allow' ? 'Allow' : 'Disallow';
          const commentPart = d.comment ? ` # ${d.comment}` : '';
          lines.push(`${keyword}: ${d.path.trim()}${commentPart}`);
        }
      });

      if (gIdx < groups.length - 1) {
        lines.push('');
      }
    });

    const cleanSitemaps = sitemaps.filter((s) => s.trim());
    if (cleanSitemaps.length > 0) {
      lines.push('');
      lines.push('# --- Sitemaps ---');
      cleanSitemaps.forEach((s) => {
        lines.push(`Sitemap: ${s.trim()}`);
      });
    }

    return lines.join('\n');
  }, [groups, sitemaps]);

  // Copy Handler
  const handleCopy = () => {
    navigator.clipboard.writeText(compiledRobotsTxt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download File
  const handleDownload = () => {
    const blob = new Blob([compiledRobotsTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Upload & Parse Robots.txt
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) parseRobotsTxtString(content);
    };
    reader.readAsText(file);
  };

  const parseRobotsTxtString = (raw: string) => {
    const lines = raw.split('\n');
    const newGroups: UserAgentGroup[] = [];
    const newSitemaps: string[] = [];
    let currentGroup: UserAgentGroup | null = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const [key, ...rest] = trimmed.split(':');
      const lowerKey = key.trim().toLowerCase();
      const val = rest.join(':').trim();

      if (lowerKey === 'user-agent') {
        if (currentGroup) {
          newGroups.push(currentGroup);
        }
        currentGroup = {
          id: 'g_' + Math.random(),
          userAgent: val,
          crawlDelay: 'none',
          directives: []
        };
      } else if (lowerKey === 'crawl-delay' && currentGroup) {
        currentGroup.crawlDelay = val;
      } else if ((lowerKey === 'disallow' || lowerKey === 'allow') && currentGroup) {
        currentGroup.directives.push({
          id: 'd_' + Math.random(),
          type: lowerKey as 'allow' | 'disallow',
          path: val
        });
      } else if (lowerKey === 'sitemap') {
        newSitemaps.push(val);
      }
    });

    if (currentGroup) {
      newGroups.push(currentGroup);
    }

    if (newGroups.length > 0) {
      setGroups(newGroups);
    }
    if (newSitemaps.length > 0) {
      setSitemaps(newSitemaps);
    }
  };

  // --- Real-Time URL Path Indexability Tester Simulator ---
  const testResult = useMemo(() => {
    const path = testUrlPath.trim() || '/';

    // Find best matching group for testBot:
    // Priority: Specific matching userAgent > fallback to '*'
    let matchingGroup = groups.find(
      (g) => g.userAgent.toLowerCase() === testBot.toLowerCase()
    );
    if (!matchingGroup) {
      matchingGroup = groups.find((g) => g.userAgent === '*');
    }

    if (!matchingGroup || matchingGroup.directives.length === 0) {
      return {
        status: 'ALLOWED',
        matchedRule: null,
        matchedGroup: matchingGroup?.userAgent || 'Default (No restrictions)',
        reason: 'No matching Disallow rules found for this crawler. Path is indexable.'
      };
    }

    // Evaluate directives based on standard longest-prefix match (RFC 9309)
    let bestMatchDirective: BotDirective | null = null;
    let longestMatchLen = -1;

    for (const d of matchingGroup.directives) {
      const rulePath = d.path.trim();
      if (!rulePath) continue;

      // Handle wildcard regex matching (* and $)
      let regexPattern = rulePath
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // escape special regex chars except * and $
        .replace(/\\\*/g, '.*'); // replace * with .*

      if (regexPattern.endsWith('\\$')) {
        regexPattern = regexPattern.slice(0, -2) + '$';
      }

      const regex = new RegExp('^' + regexPattern);
      if (regex.test(path)) {
        if (rulePath.length > longestMatchLen) {
          longestMatchLen = rulePath.length;
          bestMatchDirective = d;
        }
      }
    }

    if (!bestMatchDirective) {
      return {
        status: 'ALLOWED',
        matchedRule: null,
        matchedGroup: matchingGroup.userAgent,
        reason: 'Path did not match any disallow patterns under the active User-agent group.'
      };
    }

    if (bestMatchDirective.type === 'disallow') {
      return {
        status: 'BLOCKED',
        matchedRule: bestMatchDirective,
        matchedGroup: matchingGroup.userAgent,
        reason: `Blocked by rule "Disallow: ${bestMatchDirective.path}" in User-agent: ${matchingGroup.userAgent}.`
      };
    } else {
      return {
        status: 'ALLOWED',
        matchedRule: bestMatchDirective,
        matchedGroup: matchingGroup.userAgent,
        reason: `Explicitly allowed by rule "Allow: ${bestMatchDirective.path}" (overrides broader disallows).`
      };
    }
  }, [testUrlPath, testBot, groups]);

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner Studio Header (Zero Double Heading) */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/70 dark:from-indigo-950/30 dark:via-zinc-900/60 dark:to-sky-950/20 border border-indigo-200/80 dark:border-indigo-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white uppercase tracking-wider flex items-center gap-1">
                <Bot className="w-3.5 h-3.5" /> Robots.txt & AI Crawler Studio
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                RFC 9309 Protocol • AI Bot Protection • Live Path Validator
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
              <span>Crawler Groups: <strong className="font-mono text-zinc-900 dark:text-white">{groups.length}</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Directives: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{groups.reduce((acc, g) => acc + g.directives.length, 0)}</strong></span>
              <span className="text-zinc-300 dark:text-zinc-700">|</span>
              <span>Sitemaps: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{sitemaps.filter((s) => s.trim()).length}</strong></span>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Upload Existing</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-indigo-500" />}
              <span>{copied ? 'Copied Robots.txt!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download robots.txt</span>
            </button>
          </div>
        </div>

        {/* 1-Click Presets */}
        <div className="mt-3 pt-3 border-t border-indigo-100/70 dark:border-indigo-900/30 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Quick Presets:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/80 dark:bg-zinc-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80 transition cursor-pointer"
              title={preset.desc}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Studio Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { id: 'studio', name: '🛠️ Visual Directives Studio', icon: Settings2 },
          { id: 'tester', name: '🔍 Live URL Indexability Tester', icon: ShieldCheck },
          { id: 'raw_editor', name: '📝 Raw Code View & Export', icon: FileText },
          { id: 'audit', name: '🛡️ SEO Crawl Budget & AI Audit', icon: Bot }
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

      {/* TAB 1: Visual Directives Studio */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: User-Agent Groups Configuration */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Configured User-Agent Groups ({groups.length})
              </span>
              <button
                onClick={handleAddGroup}
                className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Crawler Block</span>
              </button>
            </div>

            {groups.map((group, gIdx) => (
              <div
                key={group.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold">
                      Block #{gIdx + 1}
                    </span>
                    <select
                      value={group.userAgent}
                      onChange={(e) => handleUpdateGroupAgent(group.id, e.target.value)}
                      className="px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-900 dark:text-white"
                    >
                      {CRAWLER_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={group.crawlDelay || 'none'}
                      onChange={(e) => handleUpdateGroupDelay(group.id, e.target.value)}
                      className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300"
                      title="Crawl-Delay (seconds)"
                    >
                      <option value="none">No Delay</option>
                      <option value="1">Delay: 1s</option>
                      <option value="2">Delay: 2s</option>
                      <option value="5">Delay: 5s</option>
                      <option value="10">Delay: 10s</option>
                    </select>

                    {groups.length > 1 && (
                      <button
                        onClick={() => handleRemoveGroup(group.id)}
                        className="p-1 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                        title="Delete Group"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Directives List in Group */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase">
                    <span>Directives</span>
                    <button
                      onClick={() => handleAddDirective(group.id)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Rule
                    </button>
                  </div>

                  {group.directives.map((d) => (
                    <div key={d.id} className="flex items-center gap-2">
                      <select
                        value={d.type}
                        onChange={(e) =>
                          handleUpdateDirective(group.id, d.id, 'type', e.target.value as any)
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                          d.type === 'disallow'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                        }`}
                      >
                        <option value="disallow">Disallow</option>
                        <option value="allow">Allow</option>
                      </select>

                      <input
                        type="text"
                        value={d.path}
                        onChange={(e) =>
                          handleUpdateDirective(group.id, d.id, 'path', e.target.value)
                        }
                        placeholder="/private/ or /path/*"
                        className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono text-zinc-900 dark:text-white"
                      />

                      <button
                        onClick={() => handleRemoveDirective(group.id, d.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                        title="Remove rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* XML Sitemaps Manager */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" /> XML Sitemap Indexes
                </span>
                <button
                  onClick={handleAddSitemap}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Sitemap
                </button>
              </div>

              {sitemaps.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={s}
                    onChange={(e) => handleUpdateSitemap(idx, e.target.value)}
                    placeholder="https://yourwebsite.com/sitemap.xml"
                    className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono text-zinc-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleRemoveSitemap(idx)}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Output Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-emerald-500" /> Live Compiled robots.txt
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {compiledRobotsTxt.split('\n').length} lines
                </span>
              </div>

              <textarea
                readOnly
                value={compiledRobotsTxt}
                className="w-full h-96 p-3.5 font-mono text-xs leading-relaxed bg-zinc-900 text-emerald-400 rounded-xl border border-zinc-800 focus:outline-hidden resize-y select-all"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Live URL Path Indexability Tester */}
      {activeTab === 'tester' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Real-Time RFC 9309 URL Indexability Simulator</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Select Test Crawler</label>
              <select
                value={testBot}
                onChange={(e) => setTestBot(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white"
              >
                {CRAWLER_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-8 space-y-1.5">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Relative URL Path to Test</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testUrlPath}
                  onChange={(e) => setTestUrlPath(e.target.value)}
                  placeholder="/admin/dashboard, /blog/post-1, or /_next/static/app.js"
                  className="flex-1 px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Verification Verdict Box */}
          <div
            className={`p-5 rounded-2xl border flex items-start gap-4 ${
              testResult.status === 'ALLOWED'
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
            }`}
          >
            {testResult.status === 'ALLOWED' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                    testResult.status === 'ALLOWED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {testResult.status === 'ALLOWED' ? '✅ CRAWL ALLOWED (INDEXABLE)' : '🚫 CRAWL BLOCKED (DISALLOWED)'}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  Agent: {testResult.matchedGroup}
                </span>
              </div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {testResult.reason}
              </p>
              {testResult.matchedRule && (
                <div className="pt-2 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  <span>Matched Directive: </span>
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    {testResult.matchedRule.type.toUpperCase()}: {testResult.matchedRule.path}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Raw Code View & Export */}
      {activeTab === 'raw_editor' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-500" />
              <span>Full Robots.txt Code Source</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-zinc-900 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto h-96 leading-relaxed">
            {compiledRobotsTxt}
          </pre>
        </div>
      )}

      {/* TAB 4: SEO Crawl Budget & AI Audit */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-500" />
              <span>Technical SEO & AI Bot Governance Best Practices</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Googlebot vs Google-Extended
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Disallowing <code>Google-Extended</code> prevents Google from using your content for Gemini AI training without hurting your Google Search rankings.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Noindex via Robots.txt
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Never use robots.txt to hide sensitive data or remove indexed URLs. Use the <code>&lt;meta name="robots" content="noindex"&gt;</code> HTML tag instead.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60 space-y-1">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Sitemaps Integration
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Always specify full absolute URLs for <code>Sitemap: https://domain.com/sitemap.xml</code> at the bottom of your robots.txt to speed up indexing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
