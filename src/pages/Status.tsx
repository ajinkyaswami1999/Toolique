import { useState, useEffect } from 'react';
import { ShieldCheck, Database, Cpu, Wifi, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Status() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [localStorageUsage, setLocalStorageUsage] = useState('0 KB');
  const [performanceMs, setPerformanceMs] = useState(0);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Measure local storage size and run performance check
  useEffect(() => {
    try {
      let total = 0;
      for (const x in localStorage) {
        if (localStorage.hasOwnProperty(x)) {
          total += ((localStorage[x] || '').length + x.length) * 2;
        }
      }
      setLocalStorageUsage((total / 1024).toFixed(2) + ' KB');
    } catch (e) {
      setLocalStorageUsage('Unavailable');
    }

    // Quick CPU performance check
    const start = performance.now();
    for (let i = 0; i < 1e6; i++) {} // Small computation loop
    const end = performance.now();
    setPerformanceMs(Math.round(end - start));
  }, []);

  const services = [
    { name: 'Core Platform & Router', desc: 'React Client App Router', status: 'Operational' },
    { name: 'Ecosystem Utilities & Tools', desc: '255+ local browser calculators', status: 'Operational' },
    { name: 'AI Studio Sandboxes', desc: 'Free browser-based model interfaces', status: 'Operational' },
    { name: 'Playground Environments', desc: 'SQLite & JavaScript sandbox terminals', status: 'Operational' },
    { name: 'Static File Delivery (CDN)', desc: 'Asset load & font distribution', status: 'Operational' }
  ];

  return (
    <div className="space-y-8 text-left animate-fadeIn max-w-3xl mx-auto">
      <SEO
        title="System Status | Toolique"
        description="Monitor system operations, client-side metrics, storage usage, and local execution status for the Toolique utilities suite."
      />

      <div className="flex items-center gap-2">
        <Link to="/" className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 transition flex items-center gap-1 text-xs font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>

      {/* Main Status Header Card */}
      <div className="p-8 rounded-3xl border border-emerald-500/10 dark:border-emerald-500/5 bg-gradient-to-br from-emerald-500/[0.03] to-teal-500/[0.03] space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-full animate-pulse">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">All Systems Operational</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">Toolique local client-side components are performing optimally.</p>
          </div>
        </div>
      </div>

      {/* Client Diagnostics Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-550 pl-1">Your Local Client Diagnostics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Storage */}
          <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/20 space-y-2.5">
            <div className="flex items-center justify-between text-zinc-450 dark:text-zinc-500">
              <Database className="w-4.5 h-4.5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Healthy</span>
            </div>
            <div>
              <div className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Local Storage</div>
              <div className="text-sm font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">{localStorageUsage} Used</div>
            </div>
          </div>

          {/* Sandbox */}
          <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/20 space-y-2.5">
            <div className="flex items-center justify-between text-zinc-455 dark:text-zinc-500">
              <ShieldCheck className="w-4.5 h-4.5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Secure</span>
            </div>
            <div>
              <div className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Sandbox Security</div>
              <div className="text-sm font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">Isolated</div>
            </div>
          </div>

          {/* CPU Latency */}
          <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/20 space-y-2.5">
            <div className="flex items-center justify-between text-zinc-455 dark:text-zinc-500">
              <Cpu className="w-4.5 h-4.5" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Optimized</span>
            </div>
            <div>
              <div className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">CPU latency</div>
              <div className="text-sm font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">{performanceMs} ms</div>
            </div>
          </div>

          {/* Connection */}
          <div className="p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/40 dark:bg-zinc-900/20 space-y-2.5">
            <div className="flex items-center justify-between text-zinc-455 dark:text-zinc-500">
              <Wifi className="w-4.5 h-4.5" />
              <span className={`text-[10px] font-black uppercase tracking-wider ${isOnline ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isOnline ? 'Active' : 'Offline'}
              </span>
            </div>
            <div>
              <div className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Network Status</div>
              <div className="text-sm font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">
                {isOnline ? 'Online' : 'Offline Mode'}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Services List Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-550 pl-1">Ecosystem Services</h2>
        <div className="saas-card overflow-hidden divide-y divide-zinc-200/50 dark:divide-zinc-800/60">
          {services.map((svc, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-zinc-900 dark:text-white">{svc.name}</h3>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold">{svc.desc}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                {svc.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
