import SEO from '../components/SEO';
import { Layers, CheckCircle2, ShieldAlert, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left py-6">
      <SEO
        title="About Us | Toolique"
        description="Learn about Toolique, a privacy-focused online suite of multi-tools, financial calculators, and developer utilities that run 100% in-browser."
      />

      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">About Toolique</h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
          High-performance online calculators and developer utilities designed specifically for Indian professionals.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Our Mission
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Toolique was built with a simple goal: to provide fast, reliable, and completely private utility tools. Whether you are calculating complicated GST/TDS tax invoices, planning mutual fund investments (SIP), structuring developer payloads (SQL/JSON), or compressing production images, our suite of tools works instantly in your web browser.
        </p>

        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white flex items-center gap-2 pt-4">
          <ShieldAlert className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          Why Choose Toolique?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">100% Client-Side Privacy</h4>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                We believe in absolute data security. Calculations and formatting are computed locally in your browser. None of your input is sent to our servers.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">No Accounts or Payments</h4>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                There are no subscriptions, registration walls, or credits. Enjoy unrestricted access to all 31 tools instantly.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Optimized for India</h4>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                Tailored for local specifications, including Indian tax regimes (New/Old), GST splits (CGST & SGST), dynamic UPI pay links, and TDS sections.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Blazing Fast Speed</h4>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
                Without server round-trips, calculations complete in microseconds. You can operate the tools offline once the page is cached.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-6 mt-6 text-center text-xs text-slate-450 dark:text-slate-500 flex items-center justify-center gap-1">
          Thank you for using Toolique! <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>
      </div>
    </div>
  );
}

