import { useState, useEffect, useRef, useCallback, useId } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  ArrowDownCircle,
  ArrowUpCircle,
  Timer,
  Activity,
  Wifi,
  Globe,
  Server,
  Monitor,
  Share2,
  Copy,
  Check,
  Trash2,
  Download,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Award,
  Gamepad2,
  Tv,
  Video,
  HardDriveUpload,
  Clock,
  Sparkles,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import type SpeedTestEngine from '@cloudflare/speedtest';
import {
  speedToAngle,
  bpsToMbps,
  formatMs,
  maskIp,
  evaluateConnectionQuality
} from '../utils/speedTestUtils';

// Type definitions
export interface SpeedTestRecord {
  id: string;
  timestamp: string;
  formattedDate: string;
  download: number; // Mbps
  upload: number; // Mbps
  ping: number; // ms
  jitter: number; // ms
  colo?: string;
  isp?: string;
}

interface CloudflareColoData {
  iata?: string;
  lat?: number;
  lon?: number;
  cca2?: string;
  region?: string;
  city?: string;
}

interface CloudflareMetaResponse {
  clientIp?: string;
  asOrganization?: string;
  asn?: number;
  colo?: string | CloudflareColoData;
  city?: string;
  country?: string;
}

interface TelemetryData {
  ip: string | null;
  isp: string | null;
  colo: string | null;
  city: string | null;
  country: string | null;
  asn: number | null;
  connectionType: string | null;
  browser: string;
  os: string;
  timestamp: string;
}

interface TestScores {
  streaming?: { points: number; classificationName: string };
  gaming?: { points: number; classificationName: string };
  rtc?: { points: number; classificationName: string };
}

type TestStatus = 'idle' | 'running' | 'completed' | 'stopped' | 'error';
type TestPhase = 'ready' | 'latency' | 'download' | 'upload' | 'completed' | 'error';
type SecondaryTab = 'suitability' | 'history' | 'telemetry' | 'guide';

// Parse user agent for friendly browser & OS names
function parseUserAgent(): { browser: string; os: string } {
  if (typeof navigator === 'undefined') return { browser: 'Browser', os: 'Device' };
  const ua = navigator.userAgent;
  let browser = 'Modern Browser';
  if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Safari/')) browser = 'Apple Safari';
  else if (ua.includes('OPR/') || ua.includes('Opera/')) browser = 'Opera';

  let os = 'Desktop';
  if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return { browser, os };
}

export default function InternetSpeedTest() {
  const clipId = useId();
  const gradId = useId();

  // Speed test engine instance ref
  const engineRef = useRef<SpeedTestEngine | null>(null);

  // Testing states
  const [status, setStatus] = useState<TestStatus>('idle');
  const [phase, setPhase] = useState<TestPhase>('ready');
  const [progress, setProgress] = useState<number>(0);
  const [liveSpeed, setLiveSpeed] = useState<number>(0);
  const [liveUnit, setLiveUnit] = useState<'Mbps' | 'ms'>('Mbps');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Measurement results
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [jitter, setJitter] = useState<number | null>(null);
  const [loadedLatency, setLoadedLatency] = useState<number | null>(null);
  const [scores, setScores] = useState<TestScores | null>(null);

  // Active secondary tab (defaults to suitability, auto-activates when finished)
  const [activeTab, setActiveTab] = useState<SecondaryTab>('suitability');

  // Telemetry & Environment initialized synchronously
  const [telemetry, setTelemetry] = useState<TelemetryData>(() => {
    const uaInfo = parseUserAgent();
    const navConn = typeof navigator !== 'undefined'
      ? (navigator as unknown as { connection?: { effectiveType?: string; type?: string } }).connection
      : undefined;
    const connectionType = navConn?.effectiveType ? navConn.effectiveType.toUpperCase() : null;

    return {
      ip: null,
      isp: null,
      colo: null,
      city: null,
      country: null,
      asn: null,
      connectionType,
      browser: uaInfo.browser,
      os: uaInfo.os,
      timestamp: ''
    };
  });
  const [hideIp, setHideIp] = useState<boolean>(true);

  // Local test history initialized from localStorage
  const [history, setHistory] = useState<SpeedTestRecord[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('toolique_speedtest_history');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            // Defensively sanitize any previously persisted records
            return parsed.map((item: Partial<SpeedTestRecord> & { colo?: unknown; isp?: unknown }) => ({
              ...item,
              colo: typeof item.colo === 'string'
                ? item.colo
                : item.colo && typeof item.colo === 'object'
                ? String((item.colo as CloudflareColoData).iata || (item.colo as CloudflareColoData).city || 'Cloudflare')
                : undefined,
              isp: typeof item.isp === 'string' ? item.isp : undefined
            } as SpeedTestRecord));
          }
        }
      }
    } catch {
      // Ignore
    }
    return [];
  });
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Load Cloudflare metadata on mount
  useEffect(() => {
    fetch('https://speed.cloudflare.com/meta', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Network response not ok'))))
      .then((data: CloudflareMetaResponse) => {
        if (!data || typeof data !== 'object') return;

        let coloStr: string | null = null;
        let cityStr: string | null = null;
        let countryStr: string | null = null;

        if (typeof data.colo === 'string') {
          coloStr = data.colo;
        } else if (data.colo && typeof data.colo === 'object') {
          coloStr = typeof data.colo.iata === 'string'
            ? data.colo.iata
            : typeof data.colo.city === 'string'
            ? data.colo.city
            : null;
          cityStr = typeof data.colo.city === 'string' ? data.colo.city : null;
          countryStr = typeof data.colo.cca2 === 'string' ? data.colo.cca2 : null;
        }

        if (typeof data.city === 'string') cityStr = data.city;
        if (typeof data.country === 'string') countryStr = data.country;

        const clientIp = typeof data.clientIp === 'string' ? data.clientIp : null;
        const ispName = typeof data.asOrganization === 'string'
          ? data.asOrganization
          : data.asn
          ? `AS${data.asn}`
          : null;
        const asnNum = typeof data.asn === 'number' ? data.asn : null;

        setTelemetry((prev) => ({
          ...prev,
          ip: clientIp,
          isp: ispName,
          colo: coloStr,
          city: cityStr,
          country: countryStr,
          asn: asnNum
        }));
      })
      .catch(() => {
        // Non-fatal telemetry error
      });
  }, []);

  // Save history helper
  const saveToHistory = useCallback((record: SpeedTestRecord) => {
    setHistory((prev) => {
      const updated = [record, ...prev.slice(0, 19)]; // Keep latest 20
      try {
        localStorage.setItem('toolique_speedtest_history', JSON.stringify(updated));
      } catch {
        // Ignore localStorage quota errors
      }
      return updated;
    });
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem('toolique_speedtest_history');
    } catch {
      // Ignore
    }
    setHistory([]);
  }, []);

  // Stop speed test
  const stopTest = useCallback(() => {
    if (engineRef.current) {
      try {
        engineRef.current.pause();
      } catch {
        // Ignore pause errors
      }
    }
    setStatus('stopped');
    setPhase('completed');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        try {
          engineRef.current.pause();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  // Start speed test
  const startSpeedTest = useCallback(async () => {
    if (status === 'running') return;

    setStatus('running');
    setPhase('latency');
    setProgress(2);
    setLiveSpeed(0);
    setLiveUnit('ms');
    setErrorMessage(null);
    setDownloadSpeed(null);
    setUploadSpeed(null);
    setPingLatency(null);
    setJitter(null);
    setLoadedLatency(null);
    setScores(null);

    const now = new Date();
    setTelemetry((prev) => ({
      ...prev,
      timestamp: now.toLocaleString()
    }));

    try {
      const speedtestModule = await import('@cloudflare/speedtest');
      const SpeedTest = speedtestModule.default;

      const engine = new SpeedTest({
        autoStart: false
      });
      engineRef.current = engine;

      const totalMeasurements = (engine as unknown as { config?: { measurements?: unknown[] } }).config?.measurements?.length || 22;

      engine.onPhaseChange = (phasePayload) => {
        const currentType = phasePayload.measurement?.type;
        const msmId = phasePayload.measurementId ?? 0;
        const currentProgress = Math.min(Math.round(((msmId + 1) / totalMeasurements) * 100), 98);
        setProgress(currentProgress);

        if (currentType === 'latency') {
          setPhase('latency');
          setLiveUnit('ms');
        } else if (currentType === 'download') {
          setPhase('download');
          setLiveUnit('Mbps');
        } else if (currentType === 'upload') {
          setPhase('upload');
          setLiveUnit('Mbps');
        }
      };

      engine.onResultsChange = ({ type }) => {
        const results = engine.results;
        const summary = results.getSummary();

        if (type === 'latency') {
          const currentPing = results.getUnloadedLatency();
          const currentJitter = results.getUnloadedJitter();
          if (typeof currentPing === 'number') {
            setPingLatency(formatMs(currentPing));
            setLiveSpeed(formatMs(currentPing));
            setLiveUnit('ms');
          }
          if (typeof currentJitter === 'number') {
            setJitter(formatMs(currentJitter));
          }
        } else if (type === 'download') {
          const currentDown = results.getDownloadBandwidth();
          if (typeof currentDown === 'number') {
            const mbps = bpsToMbps(currentDown);
            setDownloadSpeed(mbps);
            setLiveSpeed(mbps);
            setLiveUnit('Mbps');
          }
          if (typeof summary.downLoadedLatency === 'number') {
            setLoadedLatency(formatMs(summary.downLoadedLatency));
          }
        } else if (type === 'upload') {
          const currentUp = results.getUploadBandwidth();
          if (typeof currentUp === 'number') {
            const mbps = bpsToMbps(currentUp);
            setUploadSpeed(mbps);
            setLiveSpeed(mbps);
            setLiveUnit('Mbps');
          }
        }
      };

      engine.onFinish = (results) => {
        const summary = results.getSummary();
        const finalDownload = bpsToMbps(summary.download);
        const finalUpload = bpsToMbps(summary.upload);
        const finalPing = formatMs(summary.latency);
        const finalJitter = formatMs(summary.jitter);
        const finalLoaded = formatMs(summary.downLoadedLatency);

        setDownloadSpeed(finalDownload);
        setUploadSpeed(finalUpload);
        setPingLatency(finalPing);
        setJitter(finalJitter);
        setLoadedLatency(finalLoaded);
        setLiveSpeed(finalDownload);
        setLiveUnit('Mbps');
        setProgress(100);
        setStatus('completed');
        setPhase('completed');

        try {
          const aimScores = results.getScores() as unknown as TestScores;
          if (aimScores) {
            setScores(aimScores);
          }
        } catch {
          // Ignore scoring calculation errors
        }

        const newRecord: SpeedTestRecord = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toISOString(),
          formattedDate: new Date().toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          download: finalDownload,
          upload: finalUpload,
          ping: finalPing,
          jitter: finalJitter,
          colo: typeof telemetry.colo === 'string' ? telemetry.colo : undefined,
          isp: typeof telemetry.isp === 'string' ? telemetry.isp : undefined
        };
        saveToHistory(newRecord);
        setActiveTab('suitability');
      };

      engine.onError = (message) => {
        setErrorMessage(message || 'Speed test encountered a connection interruption.');
        setStatus('error');
        setPhase('error');
        try {
          engine.pause();
        } catch {
          // Ignore
        }
      };

      engine.play();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize speed test engine.';
      setErrorMessage(msg);
      setStatus('error');
      setPhase('error');
    }
  }, [status, telemetry.colo, telemetry.isp, saveToHistory]);

  // Copy formatted summary
  const copyFormattedSummary = useCallback(() => {
    const down = downloadSpeed !== null ? `${downloadSpeed} Mbps` : '--';
    const up = uploadSpeed !== null ? `${uploadSpeed} Mbps` : '--';
    const ping = pingLatency !== null ? `${pingLatency} ms` : '--';
    const jit = jitter !== null ? `${jitter} ms` : '--';
    const serverColo = typeof telemetry.colo === 'string' ? telemetry.colo : null;
    const serverCity = typeof telemetry.city === 'string' ? telemetry.city : null;
    const server = serverColo ? `Cloudflare (${serverColo}${serverCity ? ` - ${serverCity}` : ''})` : 'Cloudflare Anycast';
    const dateStr = telemetry.timestamp || new Date().toLocaleString();

    const summary = [
      '⚡ Toolique Internet Speed Test',
      '───────────────────────────────',
      `📥 Download: ${down}`,
      `📤 Upload:   ${up}`,
      `⏱️ Ping:     ${ping}`,
      `📊 Jitter:   ${jit}`,
      `🌐 Server:   ${server}`,
      `📅 Tested:   ${dateStr}`,
      '───────────────────────────────',
      'Test your speed: https://www.toolique.in/developer/internet-speed-test'
    ].join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).then(() => {
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 3000);
      });
    }
  }, [downloadSpeed, uploadSpeed, pingLatency, jitter, telemetry]);

  // Native Web Share
  const handleShare = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      const down = downloadSpeed !== null ? `${downloadSpeed} Mbps` : 'N/A';
      const up = uploadSpeed !== null ? `${uploadSpeed} Mbps` : 'N/A';
      navigator
        .share({
          title: 'Internet Speed Test Result | Toolique',
          text: `My Internet Speed on Toolique: 📥 ${down} Download | 📤 ${up} Upload | ⏱️ ${pingLatency ?? 0} ms Ping.`,
          url: 'https://www.toolique.in/developer/internet-speed-test'
        })
        .catch(() => {
          // Share was cancelled or unsupported
        });
    } else {
      copyFormattedSummary();
    }
  }, [downloadSpeed, uploadSpeed, pingLatency, copyFormattedSummary]);

  // Export history as CSV
  const exportHistoryCSV = useCallback(() => {
    if (history.length === 0) return;
    const header = ['Date', 'Download (Mbps)', 'Upload (Mbps)', 'Ping (ms)', 'Jitter (ms)', 'Server', 'ISP'];
    const rows = history.map((item) => [
      `"${item.formattedDate}"`,
      item.download,
      item.upload,
      item.ping,
      item.jitter,
      `"${typeof item.colo === 'string' ? item.colo : 'N/A'}"`,
      `"${typeof item.isp === 'string' ? item.isp : 'N/A'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `toolique-speedtest-history-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [history]);

  // Needle angle for speedometer
  const needleAngle = status === 'running' && phase === 'latency'
    ? Math.max(-120, Math.min(120, -120 + ((liveSpeed || 0) / 100) * 240))
    : speedToAngle(liveSpeed);

  // Gauge arc progress fraction
  const gaugeFraction = Math.max(0, Math.min(1, (needleAngle + 120) / 240));
  const arcLength = 460.77;
  const strokeDashoffset = arcLength * (1 - gaugeFraction);

  // Previous test comparison
  const previousTest = history.length > 1 ? history[1] : null;

  // Connection Quality Ratings
  const suitability = evaluateConnectionQuality(
    downloadSpeed ?? 0,
    uploadSpeed ?? 0,
    pingLatency ?? 0,
    jitter ?? 0
  );

  const getStatusBadge = (lvl: 'Excellent' | 'Good' | 'Fair' | 'Poor') => {
    switch (lvl) {
      case 'Excellent':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Good':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Fair':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Poor':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 py-1">
      {/* 1. Ultra-Slim Telemetry & Privacy Micro-Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-zinc-50/90 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            100% In-Browser Engine
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Zero Server Logs</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
          {typeof telemetry.colo === 'string' && telemetry.colo && (
            <span className="inline-flex items-center gap-1 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 font-mono">
              <Server className="w-3 h-3 text-zinc-400" />
              PoP: {telemetry.colo} {typeof telemetry.city === 'string' && telemetry.city ? `(${telemetry.city})` : ''}
            </span>
          )}

          <span className="inline-flex items-center gap-1 font-mono">
            <Globe className="w-3 h-3 text-zinc-400" />
            IP: {hideIp ? maskIp(telemetry.ip) : telemetry.ip || 'Detecting...'}
            <button
              type="button"
              onClick={() => setHideIp(!hideIp)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-0.5"
              title={hideIp ? 'Reveal IP' : 'Mask IP'}
            >
              {hideIp ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Cloudflare Anycast
          </span>
        </div>
      </div>

      {/* 2. Main Speed Cockpit: Compact 2-Column Dashboard on Desktop, Vertical on Mobile */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left Column: Speedometer Gauge + Primary Controls (col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center text-center">
            {/* Status Phase Badge */}
            <div className="mb-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border transition-colors ${
                  status === 'running'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 animate-pulse'
                    : status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : status === 'error'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    : status === 'stopped'
                    ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === 'running'
                      ? 'bg-indigo-600 dark:bg-indigo-400'
                      : status === 'completed'
                      ? 'bg-emerald-500'
                      : status === 'error'
                      ? 'bg-rose-500'
                      : 'bg-zinc-400'
                  }`}
                />
                {status === 'running' ? (
                  phase === 'latency' ? (
                    'Measuring Ping & Jitter...'
                  ) : phase === 'download' ? (
                    'Testing Download...'
                  ) : phase === 'upload' ? (
                    'Testing Upload...'
                  ) : (
                    'Testing Network...'
                  )
                ) : status === 'completed' ? (
                  'Test Completed'
                ) : status === 'stopped' ? (
                  'Test Paused'
                ) : status === 'error' ? (
                  'Test Interrupted'
                ) : (
                  'Ready to Test'
                )}
              </span>
            </div>

            {/* Circular Speedometer Gauge */}
            <div className="w-full max-w-[280px] sm:max-w-[310px] aspect-[320/220] relative flex items-center justify-center">
              <svg viewBox="0 0 320 220" className="w-full h-full overflow-visible select-none" aria-label="Speedometer Gauge">
                <defs>
                  <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>

                  <filter id={`needle-glow-${clipId}`} x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Background Track Arc */}
                <path
                  d="M 64.74 215 A 110 110 0 1 1 255.26 215"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className="text-zinc-100 dark:text-zinc-800"
                />

                {/* Scale Tick Marks */}
                {[
                  { val: 0, label: '0' },
                  { val: 10, label: '10' },
                  { val: 50, label: '50' },
                  { val: 100, label: '100' },
                  { val: 250, label: '250' },
                  { val: 500, label: '500' },
                  { val: 1000, label: '1k' }
                ].map((tick) => {
                  const ang = speedToAngle(tick.val);
                  const rad = ((ang - 90) * Math.PI) / 180;
                  const innerX = 160 + 98 * Math.cos(rad);
                  const innerY = 160 + 98 * Math.sin(rad);
                  const outerX = 160 + 106 * Math.cos(rad);
                  const outerY = 160 + 106 * Math.sin(rad);
                  const textX = 160 + 82 * Math.cos(rad);
                  const textY = 160 + 82 * Math.sin(rad) + 4;

                  return (
                    <g key={tick.val}>
                      <line
                        x1={innerX}
                        y1={innerY}
                        x2={outerX}
                        y2={outerY}
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-zinc-300 dark:text-zinc-700"
                      />
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-zinc-400 dark:fill-zinc-500 tracking-tight"
                      >
                        {tick.label}
                      </text>
                    </g>
                  );
                })}

                {/* Active Animated Progress Arc */}
                <path
                  d="M 64.74 215 A 110 110 0 1 1 255.26 215"
                  fill="none"
                  stroke={`url(#${gradId})`}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${arcLength} ${arcLength}`}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 ease-out"
                />

                {/* Needle Pointer */}
                <g
                  style={{
                    transform: `rotate(${needleAngle}deg)`,
                    transformOrigin: '160px 160px',
                    transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                >
                  <path
                    d="M 157 160 L 159 66 L 160 58 L 161 66 L 163 160 Z"
                    fill="#6366f1"
                    filter={`url(#needle-glow-${clipId})`}
                  />
                  <circle cx="160" cy="160" r="10" fill="#4f46e5" />
                  <circle cx="160" cy="160" r="4" fill="#ffffff" />
                </g>
              </svg>

              {/* Digital Readout inside Center */}
              <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white font-mono tabular-nums leading-none">
                  {liveSpeed > 0 ? liveSpeed : '--'}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mt-1">
                  {liveUnit}
                </span>
              </div>
            </div>

            {/* Test Progress Bar */}
            {status === 'running' && (
              <div className="w-full max-w-[240px] mt-1 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 px-0.5">
                  <span>Progress</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Start / Stop Button */}
            <div className="mt-3 flex items-center justify-center">
              {status === 'running' ? (
                <button
                  type="button"
                  onClick={stopTest}
                  className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm shadow-rose-600/20 active:scale-95 transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Speed Test</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startSpeedTest}
                  className="saas-button-primary px-6 py-2.5 text-sm rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30"
                >
                  {status === 'completed' || status === 'stopped' ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>Run Test Again</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Speed Test</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: 4 Metrics + Suitability Strip + Action Bar (col-span-7) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            {/* 4 Measurement Cards in 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* 1. Download Card */}
              <div
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  phase === 'download' && status === 'running'
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60 ring-2 ring-emerald-500/20'
                    : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Download</span>
                  <ArrowDownCircle
                    className={`w-4 h-4 ${
                      phase === 'download' && status === 'running' ? 'text-emerald-500 animate-bounce' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-mono tabular-nums leading-none">
                    {downloadSpeed !== null ? downloadSpeed : '--'}
                  </span>
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Mbps</span>
                </div>
                <div className="mt-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>Bandwidth</span>
                  {previousTest && downloadSpeed !== null && (
                    <span
                      className={`font-semibold ${
                        downloadSpeed >= previousTest.download ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {downloadSpeed >= previousTest.download ? '+' : ''}
                      {(downloadSpeed - previousTest.download).toFixed(1)} Mbps
                    </span>
                  )}
                </div>
              </div>

              {/* 2. Upload Card */}
              <div
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  phase === 'upload' && status === 'running'
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700/60 ring-2 ring-indigo-500/20'
                    : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Upload</span>
                  <ArrowUpCircle
                    className={`w-4 h-4 ${
                      phase === 'upload' && status === 'running' ? 'text-indigo-500 animate-bounce' : 'text-indigo-600 dark:text-indigo-400'
                    }`}
                  />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-mono tabular-nums leading-none">
                    {uploadSpeed !== null ? uploadSpeed : '--'}
                  </span>
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Mbps</span>
                </div>
                <div className="mt-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>Upstream</span>
                  {previousTest && uploadSpeed !== null && (
                    <span
                      className={`font-semibold ${
                        uploadSpeed >= previousTest.upload ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {uploadSpeed >= previousTest.upload ? '+' : ''}
                      {(uploadSpeed - previousTest.upload).toFixed(1)} Mbps
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Ping / Latency Card */}
              <div
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  phase === 'latency' && status === 'running'
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 ring-2 ring-amber-500/20'
                    : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Ping</span>
                  <Timer
                    className={`w-4 h-4 ${
                      phase === 'latency' && status === 'running' ? 'text-amber-500 animate-spin' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-mono tabular-nums leading-none">
                    {pingLatency !== null ? pingLatency : '--'}
                  </span>
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">ms</span>
                </div>
                <div className="mt-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>Unloaded</span>
                  {loadedLatency !== null && <span className="text-zinc-600 dark:text-zinc-300 font-mono">+{loadedLatency} ms load</span>}
                </div>
              </div>

              {/* 4. Jitter Card */}
              <div className="p-3.5 sm:p-4 rounded-xl border bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Jitter</span>
                  <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white font-mono tabular-nums leading-none">
                    {jitter !== null ? jitter : '--'}
                  </span>
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">ms</span>
                </div>
                <div className="mt-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                  <span>Stability</span>
                  {jitter !== null && (
                    <span className={`font-semibold ${jitter <= 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {jitter <= 3 ? 'Ultra Stable' : jitter <= 10 ? 'Good' : 'Fluctuating'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Compact Activity Suitability Strip */}
            <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-500" />
                  Connection Quality
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('suitability')}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
                >
                  <span>Criteria details</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Gaming */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 text-[11px]">
                  <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 font-medium">
                    <Gamepad2 className="w-3 h-3 text-violet-500" />
                    Gaming
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(suitability.gaming.status)}`}>
                    {downloadSpeed !== null ? suitability.gaming.status : '--'}
                  </span>
                </div>

                {/* 4K Stream */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 text-[11px]">
                  <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 font-medium">
                    <Tv className="w-3 h-3 text-emerald-500" />
                    4K Stream
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(suitability.streaming.status)}`}>
                    {downloadSpeed !== null ? suitability.streaming.status : '--'}
                  </span>
                </div>

                {/* Video Calls */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 text-[11px]">
                  <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 font-medium">
                    <Video className="w-3 h-3 text-blue-500" />
                    Video Call
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(suitability.rtc.status)}`}>
                    {downloadSpeed !== null ? suitability.rtc.status : '--'}
                  </span>
                </div>

                {/* Cloud Upload */}
                <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 text-[11px]">
                  <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 font-medium">
                    <HardDriveUpload className="w-3 h-3 text-amber-500" />
                    Upload
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(suitability.upload.status)}`}>
                    {uploadSpeed !== null ? suitability.upload.status : '--'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyFormattedSummary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold transition-all shadow-2xs"
                  title="Copy result receipt"
                >
                  {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  <span>{copiedSummary ? 'Copied' : 'Copy Result'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold transition-all shadow-2xs"
                  title="Share result"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Share</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-2xs ${
                    activeTab === 'history'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>History ({history.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <strong className="font-bold">Interrupted: </strong>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={startSpeedTest}
              className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* 3. Segmented Navigation Tabs for Secondary Details (Less Scroll) */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('suitability')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'suitability'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Quality Insights</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Test History ({history.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'telemetry'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Network Telemetry</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
            activeTab === 'guide'
              ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Speed Guide & Standards</span>
        </button>
      </div>

      {/* 4. Tab Content Panel */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        {/* Tab 1: Quality Insights */}
        {activeTab === 'suitability' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-500" />
                  Connection Quality & Activity Suitability
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Multi-factor benchmark evaluating download throughput, upload pipe, latency, and packet stability.
                </p>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                Indicative
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Gaming */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Competitive Online Gaming</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadge(suitability.gaming.status)}`}>
                      {suitability.gaming.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{suitability.gaming.desc}</p>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    Criteria: Ping ({pingLatency ?? 0} ms) &bull; Jitter ({jitter ?? 0} ms)
                  </div>
                </div>
              </div>

              {/* 4K Streaming */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <Tv className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">4K / 8K Video Streaming</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadge(suitability.streaming.status)}`}>
                      {suitability.streaming.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{suitability.streaming.desc}</p>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    Requires &ge; 25 Mbps &bull; Current: {downloadSpeed ?? 0} Mbps
                  </div>
                </div>
              </div>

              {/* Video Calls */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                  <Video className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Video Calls (Zoom / Teams)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadge(suitability.rtc.status)}`}>
                      {suitability.rtc.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{suitability.rtc.desc}</p>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    Tested on bidirectional throughput & latency
                  </div>
                </div>
              </div>

              {/* Cloud Upload */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <HardDriveUpload className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Large File Backups & Cloud Sync</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadge(suitability.upload.status)}`}>
                      {suitability.upload.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{suitability.upload.desc}</p>
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    Upstream capacity: {uploadSpeed ?? 0} Mbps
                  </div>
                </div>
              </div>
            </div>

            {scores && (
              <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  <strong>Cloudflare AIM Intelligence: </strong>
                  Streaming: <span className="capitalize font-semibold">{scores.streaming?.classificationName || 'Good'}</span> &bull; Gaming:{' '}
                  <span className="capitalize font-semibold">{scores.gaming?.classificationName || 'Good'}</span> &bull; RTC:{' '}
                  <span className="capitalize font-semibold">{scores.rtc?.classificationName || 'Good'}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Test History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  Local Speed Test History
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Stored strictly in your local browser storage. Never transmitted to Toolique servers.
                </p>
              </div>

              {history.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportHistoryCSV}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 text-xs font-semibold"
                  >
                    <Download className="w-3 h-3" />
                    <span>CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-semibold"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs">
                No past speed tests recorded yet. Run a speed test above to track history!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-3.5 py-2.5">Date</th>
                      <th className="px-3.5 py-2.5">Download</th>
                      <th className="px-3.5 py-2.5">Upload</th>
                      <th className="px-3.5 py-2.5">Ping</th>
                      <th className="px-3.5 py-2.5">Jitter</th>
                      <th className="px-3.5 py-2.5">Server</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {history.map((record, index) => (
                      <tr key={record.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="px-3.5 py-2.5 font-medium text-zinc-900 dark:text-zinc-200 whitespace-nowrap">
                          {record.formattedDate}
                          {index === 0 && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                              Latest
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {record.download} Mbps
                        </td>
                        <td className="px-3.5 py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {record.upload} Mbps
                        </td>
                        <td className="px-3.5 py-2.5 font-mono text-zinc-700 dark:text-zinc-300">{record.ping} ms</td>
                        <td className="px-3.5 py-2.5 font-mono text-zinc-700 dark:text-zinc-300">{record.jitter} ms</td>
                        <td className="px-3.5 py-2.5 text-zinc-500 dark:text-zinc-400">
                          {typeof record.colo === 'string' ? record.colo : 'Cloudflare'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Network Telemetry */}
        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  Network & Client Environment Telemetry
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Captured directly via browser APIs and Cloudflare edge metadata (`speed.cloudflare.com/meta`).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1 text-[11px]">
                  <Globe className="w-3.5 h-3.5" />
                  Public IP
                </span>
                <p className="font-mono font-bold text-zinc-900 dark:text-zinc-200 truncate">
                  {hideIp ? maskIp(telemetry.ip) : telemetry.ip || 'Detecting...'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1 text-[11px]">
                  <Wifi className="w-3.5 h-3.5" />
                  Internet Provider (ISP)
                </span>
                <p className="font-bold text-zinc-900 dark:text-zinc-200 truncate" title={telemetry.isp || 'Detecting...'}>
                  {telemetry.isp || 'Detecting...'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1 text-[11px]">
                  <Server className="w-3.5 h-3.5" />
                  Cloudflare PoP
                </span>
                <p className="font-bold text-zinc-900 dark:text-zinc-200 truncate">
                  {typeof telemetry.colo === 'string' && telemetry.colo ? `Cloudflare (${telemetry.colo})` : 'Cloudflare Anycast'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1 text-[11px]">
                  <Monitor className="w-3.5 h-3.5" />
                  Client Device
                </span>
                <p className="font-bold text-zinc-900 dark:text-zinc-200 truncate" title={`${telemetry.browser} on ${telemetry.os}`}>
                  {telemetry.browser} ({telemetry.os})
                </p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 italic">
              * Privacy disclosure: Public IP and autonomous system metadata are resolved strictly by Cloudflare edge servers during measurement. Toolique does not capture or log client IP addresses.
            </p>
          </div>
        )}

        {/* Tab 4: Speed Guide & Standards */}
        {activeTab === 'guide' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Broadband Speed Recommendations & Troubleshooting
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Target bandwidth and latency metrics recommended by FCC, Netflix, Zoom, and Steam.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 font-bold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-3.5 py-2">Activity</th>
                    <th className="px-3.5 py-2">Recommended Download</th>
                    <th className="px-3.5 py-2">Recommended Upload</th>
                    <th className="px-3.5 py-2">Target Ping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
                  <tr>
                    <td className="px-3.5 py-2 font-semibold text-zinc-900 dark:text-zinc-200">Browsing & Social Media</td>
                    <td className="px-3.5 py-2 font-mono">5 &ndash; 10 Mbps</td>
                    <td className="px-3.5 py-2 font-mono">1 &ndash; 2 Mbps</td>
                    <td className="px-3.5 py-2 font-mono">&lt; 100 ms</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-semibold text-zinc-900 dark:text-zinc-200">1080p HD Video Streaming</td>
                    <td className="px-3.5 py-2 font-mono">10 &ndash; 15 Mbps</td>
                    <td className="px-3.5 py-2 font-mono">2 &ndash; 3 Mbps</td>
                    <td className="px-3.5 py-2 font-mono">&lt; 70 ms</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-semibold text-zinc-900 dark:text-zinc-200">4K Ultra HD Streaming & HDR</td>
                    <td className="px-3.5 py-2 font-mono">25 &ndash; 50 Mbps</td>
                    <td className="px-3.5 py-2 font-mono">5 Mbps</td>
                    <td className="px-3.5 py-2 font-mono">&lt; 50 ms</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-semibold text-zinc-900 dark:text-zinc-200">Competitive Online Gaming</td>
                    <td className="px-3.5 py-2 font-mono">25 &ndash; 50 Mbps</td>
                    <td className="px-3.5 py-2 font-mono">5 &ndash; 10 Mbps</td>
                    <td className="px-3.5 py-2 font-mono text-emerald-600 dark:text-emerald-400 font-bold">&lt; 30 ms</td>
                  </tr>
                  <tr>
                    <td className="px-3.5 py-2 font-semibold text-zinc-900 dark:text-zinc-200">Remote Work (Zoom, Teams)</td>
                    <td className="px-3.5 py-2 font-mono">50 &ndash; 100 Mbps</td>
                    <td className="px-3.5 py-2 font-mono">15 &ndash; 25 Mbps</td>
                    <td className="px-3.5 py-2 font-mono">&lt; 40 ms</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850">
                <strong className="text-zinc-900 dark:text-zinc-200 block mb-1">Ethernet over Wi-Fi</strong>
                Direct Cat6 cable eliminates radio interference, cutting ping jitter by up to 80%.
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850">
                <strong className="text-zinc-900 dark:text-zinc-200 block mb-1">Use 5 GHz Wi-Fi</strong>
                5 GHz Wi-Fi offers triple the bandwidth of congested 2.4 GHz frequencies.
              </div>
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850">
                <strong className="text-zinc-900 dark:text-zinc-200 block mb-1">Reboot Router Monthly</strong>
                Power cycling clears NAT table memory leaks and restores clean ISP routing.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Semantic SEO Content Foundation (Always present for Search Engines & GEO) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white tracking-tight">
            How Internet Speed Testing Works on Toolique
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Unlike legacy flash-based tests, Toolique integrates Cloudflare&apos;s modern Anycast edge measurement library directly in client JavaScript.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Download vs. Upload Speed</h3>
            <p>
              <strong>Download speed</strong> determines how fast your device receives streams, web files, and game downloads. <strong>Upload speed</strong> controls how fast you transmit data outward—critical for Zoom screen sharing, Twitch streaming, and cloud photo backups.
            </p>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Latency (Ping) and Jitter</h3>
            <p>
              <strong>Ping</strong> is the round-trip packet reaction time in milliseconds (ms). <strong>Jitter</strong> is the variance in ping between consecutive packets. Stable jitter under 5 ms prevents robotic voice lag and online gaming frame stutters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
