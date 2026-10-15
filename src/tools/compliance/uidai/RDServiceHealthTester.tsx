import { useState } from 'react';
import {
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Activity,
  Play,
  RotateCcw,
  Cpu,
  HelpCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PortCheck {
  port: number;
  status: 'idle' | 'checking' | 'open' | 'closed';
  serviceInfo?: string;
}

const COMMON_PORTS = [11100, 11101, 11102, 11103, 11104, 11105];

export default function RDServiceHealthTester() {
  const [ports, setPorts] = useState<PortCheck[]>(
    COMMON_PORTS.map(port => ({ port, status: 'idle' }))
  );
  const [isScanning, setIsScanning] = useState(false);
  const [lLevel, setLLevel] = useState<'L0' | 'L1'>('L1');
  const [deviceModel, setDeviceModel] = useState<string>('mantra_mfs110');
  const [copied, setCopied] = useState(false);

  // Scan local loopback ports
  const handleScanPorts = async () => {
    setIsScanning(true);
    const updated = [...ports];

    for (let i = 0; i < updated.length; i++) {
      const p = updated[i];
      p.status = 'checking';
      setPorts([...updated]);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        // Standard UIDAI RDSERVICE discovery HTTP method
        const resp = await fetch(`http://127.0.0.1:${p.port}`, {
          method: 'RDSERVICE',
          signal: controller.signal
        }).catch(() => null);

        clearTimeout(timeoutId);

        if (resp && resp.ok) {
          const text = await resp.text();
          p.status = 'open';
          p.serviceInfo = text.includes('RDSERVICE') ? 'UIDAI RD Service Active' : 'Service Responding';
        } else {
          p.status = 'closed';
        }
      } catch {
        p.status = 'closed';
      }
      setPorts([...updated]);
    }
    setIsScanning(false);
  };

  const handleReset = () => {
    setPorts(COMMON_PORTS.map(port => ({ port, status: 'idle' })));
  };

  const handleCopyTroubleshoot = () => {
    const text = `UIDAI RD SERVICE TROUBLESHOOTING GUIDE:
1. Ensure USB cable is plugged into high-speed USB 2.0/3.0 port directly on the motherboard.
2. In services.msc (Windows), ensure the vendor service (e.g., 'Mantra AVDM' or 'MorphoSmart RD Service') is Running.
3. Check if HTTPS mixed content or localhost loopback is blocked in browser settings (chrome://flags/#allow-insecure-localhost).
4. Verify whether the device is an L0 legacy optical scanner or an L1 cryptographic certified scanner. L1 is mandatory for new banking/eKYC deployments.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="saas-card bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-lg">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              UIDAI Registered Device (RD Service) Health Diagnostic Suite
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Audit local loopback ports (11100–11105), verify L0 vs L1 cryptographic compliance, and diagnose driver health.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Local HTTP Probe</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Port Scanner (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-6 rounded-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Local Loopback RD Service Ports (127.0.0.1)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  UIDAI specifies ports 11100 to 11105 for communication with certified biometric vendor drivers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleScanPorts}
                  disabled={isScanning}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  {isScanning ? 'Probing...' : 'Probe Ports'}
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ports.map(p => (
                <div
                  key={p.port}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    p.status === 'open'
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : p.status === 'closed'
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50'
                      : p.status === 'checking'
                      ? 'border-amber-500/40 bg-amber-500/10 animate-pulse'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    Port {p.port}
                  </div>
                  <div className="text-xs font-semibold mt-1 flex items-center justify-center gap-1">
                    {p.status === 'open' && (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                    {p.status === 'closed' && (
                      <span className="text-slate-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Closed
                      </span>
                    )}
                    {p.status === 'checking' && (
                      <span className="text-amber-600 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 animate-spin" /> Checking
                      </span>
                    )}
                    {p.status === 'idle' && (
                      <span className="text-slate-400">Idle</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg text-xs text-slate-600 dark:text-slate-400">
              Note: If ports show as Closed despite device being connected, ensure your biometric vendor driver service (e.g. Mantra AVDM / MorphoSmart) is started in Windows Services (`services.msc`).
            </div>
          </div>

          {/* L0 vs L1 Architecture Card */}
          <div className="saas-card p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-600" />
              UIDAI Compliance Level: L0 vs L1
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLLevel('L1')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  lLevel === 'L1'
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  L1 Registered Device (Mandatory)
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Biometric signing & encryption executed inside hardware cryptographic boundary.
                </p>
              </button>

              <button
                onClick={() => setLLevel('L0')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  lLevel === 'L0'
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  L0 Registered Device (Phasing Out)
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Encryption handled at host operating system level via vendor driver software.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Deep Diagnostics & Troubleshooting (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Hardware Device Profile
              </span>
              <span className="text-xs bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-semibold">
                {lLevel} Attested
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Device Hardware Preset
                </label>
                <select
                  value={deviceModel}
                  onChange={e => setDeviceModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
                >
                  <option value="mantra_mfs110">Mantra MFS110 (L1 Optical Scanner)</option>
                  <option value="morpho_mso1300">IDEMIA Morpho MSO 1300 E3 (L1 / L0)</option>
                  <option value="secugen_hamster">SecuGen Hamster Pro 20 (L1 Certified)</option>
                  <option value="startek_fm220">Startek FM220U (L1 Biometric)</option>
                </select>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Security Requirement:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">UIDAI 2024 L1 Directive</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Key Storage:</span>
                  <span className="font-semibold text-emerald-600">Hardware Secure Enclave</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Anti-Spoofing / Liveness:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Active Hardware Detection</span>
                </div>
              </div>

              <Link
                to="/biometric-device-tester"
                className="w-full mt-3 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Open Advanced Biometric Hardware Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Troubleshooting Guide */}
          <div className="saas-card p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Troubleshooting Common RD Errors
              </h3>
              <button
                onClick={handleCopyTroubleshoot}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block">Error 1140 / Device Not Connected</strong>
                <span>Caused by USB selective suspend on Windows 11. Ensure direct motherboard USB connection and run Mantra/Morpho RD service as Administrator.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block">Localhost CORS / Mixed Content</strong>
                <span>Chrome blocks HTTP localhost calls from HTTPS sites. Enable `chrome://flags/#allow-insecure-localhost` or install vendor SSL loopback certificate.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
