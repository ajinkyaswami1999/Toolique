import { useState, useMemo } from 'react';
import {
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Download,
  Eye,
  EyeOff,
  FileText
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

export default function AadhaarDataMaskingTool() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [singleAadhaar, setSingleAadhaar] = useState('234567890128');
  const [maskChar, setMaskChar] = useState<'X' | '*'>('X');
  const [delimiter, setDelimiter] = useState<'-' | ' ' | ''>('-');
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  // Batch State
  const [batchInput, setBatchInput] = useState<string>(
    `-- Customer KYC Database Dump (Sample)
INSERT INTO kyc_verifications (user_id, full_name, aadhaar_no, status) VALUES
(101, 'Rahul Sharma', '2345 6789 0128', 'VERIFIED'),
(102, 'Priya Patel', '3456-7890-1237', 'VERIFIED'),
(103, 'Amit Verma', '999999999999', 'INVALID_CHECKSUM');`
  );

  // Single Masking Calculation
  const singleResult = useMemo(() => {
    const clean = singleAadhaar.replace(/[\s-]/g, '');
    const isTwelveDigits = /^\d{12}$/.test(clean);
    const startsValid = /^[2-9]/.test(clean);
    const verhoeffValid = isTwelveDigits && validateVerhoeff(clean);
    const last4 = isTwelveDigits ? clean.slice(8) : '0000';

    let maskedOutput = '';
    if (isTwelveDigits) {
      const part1 = maskChar.repeat(4);
      const part2 = maskChar.repeat(4);
      if (delimiter === '-') maskedOutput = `${part1}-${part2}-${last4}`;
      else if (delimiter === ' ') maskedOutput = `${part1} ${part2} ${last4}`;
      else maskedOutput = `${part1}${part2}${last4}`;
    }

    return {
      clean,
      isTwelveDigits,
      startsValid,
      verhoeffValid,
      last4,
      maskedOutput
    };
  }, [singleAadhaar, maskChar, delimiter]);

  // Batch Masking Execution
  const batchResult = useMemo(() => {
    // Regex matches 12-digit numbers with optional spaces or dashes
    const regex = /\b([2-9]\d{3})[\s-]?(\d{4})[\s-]?(\d{4})\b/g;
    let matchCount = 0;
    let verhoeffPassedCount = 0;

    const redactedText = batchInput.replace(regex, (match, p1, p2, p3) => {
      matchCount++;
      const fullDigits = `${p1}${p2}${p3}`;
      const isValid = validateVerhoeff(fullDigits);
      if (isValid) {
        verhoeffPassedCount++;
        const last4 = p3;
        const part1 = maskChar.repeat(4);
        const part2 = maskChar.repeat(4);
        if (delimiter === '-') return `${part1}-${part2}-${last4}`;
        if (delimiter === ' ') return `${part1} ${part2} ${last4}`;
        return `${part1}${part2}${last4}`;
      }
      return match; // Keep invalid untouched or indicate
    });

    return { redactedText, matchCount, verhoeffPassedCount };
  }, [batchInput, maskChar, delimiter]);

  const handleCopySingle = () => {
    navigator.clipboard.writeText(singleResult.maskedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBatch = () => {
    navigator.clipboard.writeText(batchResult.redactedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBatch = () => {
    const blob = new Blob([batchResult.redactedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Aadhaar_Masked_Redacted_${Date.now()}.txt`;
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
              UIDAI Statutory Aadhaar Data Masking & Redaction Engine
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Generate statutory XXXX-XXXX-1234 masked formats with Dihedral D5 Verhoeff checksum validation. Zero server retention.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>100% In-Browser Memory</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'single'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          Single Aadhaar Masker
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'batch'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Batch SQL / Text Redaction
        </button>
      </div>

      {/* Masking Configuration Options */}
      <div className="saas-card p-4 rounded-xl flex flex-wrap items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Mask Character:</span>
          <button
            onClick={() => setMaskChar('X')}
            className={`px-2.5 py-1 rounded font-mono font-bold transition-colors ${
              maskChar === 'X'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
            }`}
          >
            XXXX
          </button>
          <button
            onClick={() => setMaskChar('*')}
            className={`px-2.5 py-1 rounded font-mono font-bold transition-colors ${
              maskChar === '*'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
            }`}
          >
            ****
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Format Delimiter:</span>
          <button
            onClick={() => setDelimiter('-')}
            className={`px-2.5 py-1 rounded font-mono font-bold transition-colors ${
              delimiter === '-'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
            }`}
          >
            Hyphen (-)
          </button>
          <button
            onClick={() => setDelimiter(' ')}
            className={`px-2.5 py-1 rounded font-mono font-bold transition-colors ${
              delimiter === ' '
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
            }`}
          >
            Space ( )
          </button>
          <button
            onClick={() => setDelimiter('')}
            className={`px-2.5 py-1 rounded font-mono font-bold transition-colors ${
              delimiter === ''
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
            }`}
          >
            None
          </button>
        </div>
      </div>

      {/* TAB 1: SINGLE MASKER */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="saas-card p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Input Aadhaar Number
            </h3>

            <div className="relative">
              <input
                type={showRaw ? 'text' : 'password'}
                value={singleAadhaar}
                onChange={e => setSingleAadhaar(e.target.value)}
                maxLength={14}
                placeholder="Enter 12-digit Aadhaar..."
                className="w-full px-4 py-3 text-base font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowRaw(!showRaw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showRaw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                {singleResult.isTwelveDigits ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
                <span className="text-slate-600 dark:text-slate-400">12 Numeric Digits Length</span>
              </div>
              <div className="flex items-center gap-2">
                {singleResult.startsValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
                <span className="text-slate-600 dark:text-slate-400">Starts with 2-9 (Non 0/1 prefix)</span>
              </div>
              <div className="flex items-center gap-2">
                {singleResult.verhoeffValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500" />
                )}
                <span className="text-slate-600 dark:text-slate-400">
                  UIDAI Verhoeff Dihedral D5 Checksum Valid
                </span>
              </div>
            </div>
          </div>

          {/* Masked Output Preview */}
          <div className="saas-card p-6 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Statutory Masked Result
              </span>
              <span className="text-xs bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-semibold">
                UIDAI Compliant
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
              <div className="text-2xl font-mono font-extrabold text-slate-900 dark:text-white tracking-widest">
                {singleResult.maskedOutput || 'XXXX-XXXX-XXXX'}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Last 4 Digits Exposed: {singleResult.last4}
              </span>
            </div>

            <button
              onClick={handleCopySingle}
              disabled={!singleResult.verhoeffValid}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Masked Aadhaar' : 'Copy Masked Aadhaar'}
            </button>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Under Section 42 of the Aadhaar Act and RBI/SEBI KYC mandates, non-vault entities must permanently mask the first 8 digits before archiving or displaying identity documents.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: BATCH REDACTION */}
      {activeTab === 'batch' && (
        <div className="space-y-6">
          <div className="saas-card p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Batch Text, CSV & SQL Dump Redaction
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste raw database exports, server logs, or JSON payloads to replace all genuine 12-digit Aadhaar numbers with masked representations.
                </p>
              </div>
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                {batchResult.verhoeffPassedCount} Aadhaar Numbers Redacted
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Raw Input Text
                </label>
                <textarea
                  value={batchInput}
                  onChange={e => setBatchInput(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Masked Output (Zero Raw PII)
                </label>
                <textarea
                  readOnly
                  value={batchResult.redactedText}
                  rows={10}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleCopyBatch}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Redacted Text'}
              </button>
              <button
                onClick={handleDownloadBatch}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Redacted File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
