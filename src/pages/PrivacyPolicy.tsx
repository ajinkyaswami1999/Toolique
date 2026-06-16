import SEO from '../components/SEO';
import { Shield, EyeOff } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left py-6">
      <SEO
        title="Privacy Policy | Toolique"
        description="Read the privacy policy of Toolique. All calculators and formatters run entirely locally in your browser. We never collect or store your inputs."
      />

      <div className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Shield className="w-10 h-10 text-teal-600 dark:text-teal-400 shrink-0" />
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Last Updated: June 16, 2026</p>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6 text-sm text-slate-655 dark:text-slate-400 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-850 dark:text-white">1. Client-Side Operations & Data Safety</h2>
          <p>
            At Toolique, privacy is our core principle. Unlike typical online platforms, all calculations, syntax formatting, inputs, and image compression occur <strong>100% locally in your web browser</strong> using client-side JavaScript APIs.
          </p>
          <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/10 flex items-start gap-2.5 text-xs text-teal-700 dark:text-teal-400">
            <EyeOff className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              We do not transmit, analyze, or back up any numbers, JSON logs, SQL scripts, or images on our servers. Your inputs are ephemeral and disappear once you close or reload the browser page.
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-850 dark:text-white">2. Google AdSense & Cookies</h2>
          <p>
            We may use Google AdSense to serve advertisements on our website. Google, as a third-party vendor, uses cookies (such as DART cookies) to serve ads based on your visit to this site and other websites on the internet.
          </p>
          <p>
            Users may opt-out of personalized advertising by visiting Google Ad Settings or choosing browser plugins that manage tracker cookies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-850 dark:text-white">3. Third-Party Analytics</h2>
          <p>
            We may deploy lightweight, privacy-focused traffic analytics (such as Google Analytics or Plausible) to monitor aggregate traffic trends, bounce rates, and popular tools. These tools compile anonymous metrics (such as page views and browser types) but never track individual identification details.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-850 dark:text-white">4. External Web Links</h2>
          <p>
            Our web pages may link to external sites (e.g., bank sites or developer documentation). We are not responsible for the privacy regulations or content of third-party platforms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-850 dark:text-white">5. Revisions to This Policy</h2>
          <p>
            We reserve the right to revise this Privacy Policy at any time. Any revisions will be reflected instantly on this page with an updated "Last Updated" timestamp.
          </p>
        </section>
      </div>
    </div>
  );
}

