import SEO from '../components/SEO';
import { 
  Zap, 
  Layers, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WhyToolique() {
  const comparisons = [
    {
      feature: 'Privacy & Data Transmission',
      toolique: '100% Client-Side Sandbox (Never sent to server)',
      competitors: 'Data uploaded & logged on cloud servers'
    },
    {
      feature: 'Pricing & Registration',
      toolique: 'Completely Free, No account or credit card needed',
      competitors: 'Freemium caps, daily limits, forced sign-ups'
    },
    {
      feature: 'Multi-Step Project Workflows',
      toolique: 'Connected pipelines (e.g. API -> JSON -> JWT)',
      competitors: 'Isolated standalone pages with fragmented UX'
    },
    {
      feature: 'Offline & Local Persistence',
      toolique: 'IndexedDB & LocalStorage state management',
      competitors: 'Requires active internet connection'
    },
    {
      feature: 'Export Capabilities',
      toolique: 'Instant 1-click PDF, JSON, and text reports',
      competitors: 'Watermarks or paid export tiers'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 text-left py-6 px-4 sm:px-6 animate-fadeIn">
      <SEO
        title="Why Choose Toolique | Privacy-First Client-Side Developer & Creator Suite"
        description="Discover why developers, finance professionals, civil engineers, and creators choose Toolique. 100% in-browser sandboxing, zero paywalls, and connected project pipelines."
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>The Toolique Advantage</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
          Why Professionals Choose <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Toolique</span>
        </h1>
        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
          Built from the ground up for speed, privacy, and seamless multi-tool workflows. No accounts, no paywalls, no tracking.
        </p>
      </div>

      {/* 4 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pillar 1 */}
        <div className="saas-card p-6 md:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 w-fit">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
            100% Client-Side Privacy
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Your confidential SQL queries, proprietary JSON payloads, JWT auth tokens, and salary details are computed strictly inside your browser sandbox. Nothing is transmitted to remote databases.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="saas-card p-6 md:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 w-fit">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
            Zero Latency & Instant Execution
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Without costly HTTP server round-trips, calculations complete in microseconds. Even large JSON formatters and complex mathematical derivative graphs render in sub-milliseconds.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="saas-card p-6 md:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 w-fit">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
            Interactive Multi-Tool Pipelines
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Unlike fragmented single-purpose tools, Toolique connects related tasks together into smooth pipelines (e.g. REST API Tester $\to$ JSON Formatter $\to$ JSON Compare $\to$ JWT Decoder).
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="saas-card p-6 md:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 w-fit">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
            No Subscriptions or Paywalls
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Free forever. We do not lock features behind paywalls, restrict daily usage, or demand credit cards. All 270+ tools and academy tracks are immediately open.
          </p>
        </div>

      </div>

      {/* Comparison Table */}
      <div className="saas-card p-6 md:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-6">
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
          Toolique vs. Traditional Cloud Tools
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-3 px-4 font-black uppercase tracking-wider text-zinc-400">Feature</th>
                <th className="py-3 px-4 font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Toolique</th>
                <th className="py-3 px-4 font-black uppercase tracking-wider text-zinc-400">Other Online Utilities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
              {comparisons.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition">
                  <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-white">{item.feature}</td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{item.toolique}</span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-450 dark:text-zinc-500 font-medium">{item.competitors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-indigo-950 via-zinc-950 to-indigo-950 text-white border border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl">
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold">Ready to build faster?</h3>
          <p className="text-xs text-zinc-400 font-medium">Explore all 270+ calculators and developer formatters instantly.</p>
        </div>
        <Link
          to="/tools"
          className="px-5 py-2.5 rounded-xl bg-white text-zinc-900 font-extrabold text-xs shadow-md hover:scale-105 transition cursor-pointer shrink-0 inline-flex items-center gap-1.5"
        >
          <span>Browse All Tools</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
