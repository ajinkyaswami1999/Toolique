import { useState, useMemo } from 'react';
import {
  Fingerprint,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Download,
  FileText,
  Lock
} from 'lucide-react';

// Official UIDAI Verhoeff Dihedral D5 tables
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

function validateVerhoeff(str: string): boolean {
  let c = 0;
  const digits = str.split('').map(Number);
  const len = digits.length;
  for (let i = 0; i < len; i++) {
    const digit = digits[len - 1 - i];
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digit]];
  }
  return c === 0;
}

interface ExposureFinding {
  lineNum: number;
  rawMatch: string;
  verhoeffValid: boolean;
  maskedVersion: string;
  risk: 'CRITICAL_LEAK' | 'BENIGN_SEQUENCE';
}

const SAMPLE_LOG_WITH_EXPOSURES = `2024-10-14 10:14:22 [INFO] Processing customer KYC onboarding request ID 982103
2024-10-14 10:14:23 [DEBUG] Incoming JSON: {"name": "Rahul Sharma", "aadhaar": "234567890128", "phone": "9876543210"}
2024-10-14 10:14:24 [WARN] Internal order sequence: 123456789012 (order reference non-aadhaar)
2024-10-14 10:14:25 [INFO] Verified secondary user: Priya Patel with document 3456-7890-1237
2024-10-14 10:14:26 [INFO] Compliant Masked Record: XXXX-XXXX-9912 stored in ADV surrogate table.`;

export default function AadhaarDataExposureScanner() {
  const [inputText, setInputText] = useState<string>(SAMPLE_LOG_WITH_EXPOSURES);
  const [copied, setCopied] = useState(false);

  // Scan and identify exposures
  const scanResult = useMemo(() => {
    const lines = inputText.split('\n');
    const findings: ExposureFinding[] = [];
    let criticalLeaks = 0;
    let falsePositives = 0;

    const regex = /\b([2-9]\d{3})[\s-]?(\d{4})[\s-]?(\d{4})\b/g;

    lines.forEach((line, idx) => {
      let match: RegExpExecArray | null;
      while ((match = regex.exec(line)) !== null) {
        const rawMatch = match[0];
        const cleanDigits = rawMatch.replace(/[\s-]/g, '');
        const isValid = validateVerhoeff(cleanDigits);

        const last4 = cleanDigits.slice(-4);
        const maskedVersion = `XXXX-XXXX-${last4}`;

        if (isValid) {
          criticalLeaks++;
          findings.push({
            lineNum: idx + 1,
            rawMatch,
            verhoeffValid: true,
            maskedVersion,
            risk: 'CRITICAL_LEAK'
          });
        } else {
          falsePositives++;
          findings.push({
            lineNum: idx + 1,
            rawMatch,
            verhoeffValid: false,
            maskedVersion,
            risk: 'BENIGN_SEQUENCE'
          });
        }
      }
    });

    // Sanitized output text
    const sanitizedText = inputText.replace(regex, (m) => {
      const clean = m.replace(/[\s-]/g, '');
      if (validateVerhoeff(clean)) {
        return `XXXX-XXXX-${clean.slice(-4)}`;
      }
      return m;
    });

    return {
      findings,
      criticalLeaks,
      falsePositives,
      sanitizedText
    };
  }, [inputText]);

  const handleCopySanitized = () => {
    navigator.clipboard.writeText(scanResult.sanitizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSanitized = () => {
    const blob = new Blob([scanResult.sanitizedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sanitized_Aadhaar_Logs_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
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
              Enterprise Aadhaar Data Exposure & ADV Scanner
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Audit log files, SQL dumps, and JSON payloads for un-vaulted Aadhaar numbers with Verhoeff verification and instant in-memory redaction.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Section 42 Aadhaar Act Safe</span>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Critical Aadhaar Leaks</span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5" />
            {scanResult.criticalLeaks}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Verhoeff Valid Aadhaar</span>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Non-Aadhaar Sequences</span>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1">
            {scanResult.falsePositives}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Checksum Failed (Safe)</span>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Vault Compliance Status</span>
          <div className={`text-base font-bold mt-1.5 flex items-center gap-1.5 ${
            scanResult.criticalLeaks > 0 ? 'text-rose-600' : 'text-emerald-600'
          }`}>
            {scanResult.criticalLeaks > 0 ? (
              <>
                <XCircle className="w-4 h-4" />
                <span>ADV Breach Detected</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Exposure</span>
              </>
            )}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">UIDAI ADV Mandate</span>
        </div>

        <div className="saas-card p-4 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">Data Sanitization</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <Lock className="w-5 h-5" />
            Ready
          </div>
          <span className="text-xs text-slate-500 mt-1 block">1-Click Redact</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Text Area & Findings (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="saas-card p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                Input Logs / Code / Payload
              </h3>
              <button
                onClick={() => setInputText(SAMPLE_LOG_WITH_EXPOSURES)}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
              >
                Load Sample Log
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
            />
          </div>

          {/* Findings List */}
          <div className="saas-card p-6 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Detected Numeric Matches & Checksum Audit
            </h3>

            {scanResult.findings.length === 0 ? (
              <div className="text-xs text-slate-500 py-3">
                No 12-digit number sequences detected in current input.
              </div>
            ) : (
              <div className="space-y-2">
                {scanResult.findings.map((f, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                      f.risk === 'CRITICAL_LEAK'
                        ? 'border-rose-500/30 bg-rose-500/5'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400">Line {f.lineNum}:</span>
                      <span className={`font-bold ${f.risk === 'CRITICAL_LEAK' ? 'text-rose-600' : 'text-slate-600 dark:text-slate-400'}`}>
                        {f.rawMatch}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {f.risk === 'CRITICAL_LEAK' ? (
                        <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded">
                          Verhoeff Checksum Valid (Aadhaar Leak)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Checksum Invalid (False Positive)
                        </span>
                      )}
                      <span className="font-mono text-emerald-600">→ {f.maskedVersion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sanitized Redaction & Statutory Notice (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                In-Memory Sanitized Preview
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold">
                Masked Output
              </span>
            </div>

            <textarea
              readOnly
              value={scanResult.sanitizedText}
              rows={8}
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySanitized}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Sanitized Logs'}
              </button>
              <button
                onClick={handleDownloadSanitized}
                className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                title="Download Sanitized"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="saas-card p-4 rounded-xl text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-600" />
              Section 42 of Aadhaar Act, 2016 Penalty
            </div>
            <p>
              Storing or publishing raw, unencrypted 12-digit Aadhaar numbers in databases, logs, or public websites without an authorized Aadhaar Data Vault carries severe criminal penalties, including imprisonment up to 3 years and substantial financial fines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
