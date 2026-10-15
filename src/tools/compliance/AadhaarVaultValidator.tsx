import { useState, useMemo } from 'react';
import {
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Lock,
  Database,
  Sparkles
} from 'lucide-react';

/* =========================================================================
   OFFICIAL VERHOEFF ALGORITHM (DIHEDRAL GROUP D5) AS USED BY UIDAI
   ========================================================================= */

// The multiplication table (d)
const VERHOEFF_D: number[][] = [
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

// The permutation table (p)
const VERHOEFF_P: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

// Validate Verhoeff Checksum
function validateVerhoeff(numStr: string): boolean {
  let c = 0;
  const cleanStr = numStr.replace(/\D/g, '');
  if (cleanStr.length !== 12) return false;
  
  const digits = cleanStr.split('').map(Number).reverse();
  for (let i = 0; i < digits.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digits[i]]];
  }
  return c === 0;
}

// Compute Verhoeff Checksum digit for an 11-digit string
function computeVerhoeffChecksumDigit(elevenDigits: string): number {
  let c = 0;
  const digits = elevenDigits.replace(/\D/g, '').split('').map(Number).reverse();
  for (let i = 0; i < digits.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][digits[i]]];
  }
  // Inverse table
  const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];
  return inv[c];
}

export default function AadhaarVaultValidator() {
  const [aadhaarInput, setAadhaarInput] = useState<string>('3675 9834 6012');
  const [maskType, setMaskType] = useState<'spaced' | 'continuous' | 'asterisk'>('spaced');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Clean numeric string
  const cleanDigits = useMemo(() => {
    return aadhaarInput.replace(/\D/g, '');
  }, [aadhaarInput]);

  // Validation Checks
  const validationResults = useMemo(() => {
    const is12Digits = cleanDigits.length === 12;
    const notStartingWithZeroOrOne = cleanDigits.length > 0 && cleanDigits[0] !== '0' && cleanDigits[0] !== '1';
    const isVerhoeffValid = is12Digits ? validateVerhoeff(cleanDigits) : false;

    return {
      is12Digits,
      notStartingWithZeroOrOne,
      isVerhoeffValid,
      overallValid: is12Digits && notStartingWithZeroOrOne && isVerhoeffValid
    };
  }, [cleanDigits]);

  // Masked Outputs
  const maskedOutputs = useMemo(() => {
    if (cleanDigits.length < 4) {
      return { spaced: 'XXXX-XXXX-XXXX', continuous: 'XXXXXXXXXXXX', asterisk: '************' };
    }
    const last4 = cleanDigits.slice(-4);
    return {
      spaced: `XXXX-XXXX-${last4}`,
      continuous: `XXXXXXXX${last4}`,
      asterisk: `********${last4}`
    };
  }, [cleanDigits]);

  // Simulated Aadhaar Data Vault (ADV) Reference Token
  const vaultToken = useMemo(() => {
    if (cleanDigits.length !== 12) return 'Enter valid 12-digit Aadhaar to simulate ADV token';
    // Generate deterministic reference UUID representation
    return `ADV-REF-${cleanDigits.slice(0, 4)}-${cleanDigits.slice(4, 8)}-${cleanDigits.slice(8)}`;
  }, [cleanDigits]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const loadSampleValid = () => {
    // Generate a valid Verhoeff 12-digit sample (UIDAI test format)
    const base11 = '36759834601';
    const checkDigit = computeVerhoeffChecksumDigit(base11);
    setAadhaarInput(`${base11}${checkDigit}`);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="saas-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
              Verhoeff Algorithm Check
            </span>
            <Fingerprint className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl font-black font-mono flex items-center gap-2 ${
            validationResults.overallValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {validationResults.overallValid ? (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span>Valid Aadhaar Format</span>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6" />
                <span>Invalid Format</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Evaluates the mathematical Dihedral Group D5 checksum used by UIDAI central servers.
          </p>
        </div>

        <div className="saas-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
              Masked Output (Statutory)
            </span>
            <Lock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-black text-zinc-900 dark:text-white font-mono truncate">
            {maskedOutputs[maskType]}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            First 8 digits strictly masked; only last 4 visible under UIDAI Circular &amp; Supreme Court judgment.
          </p>
        </div>

        <div className="saas-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
              Aadhaar Data Vault (ADV)
            </span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400 truncate">
            {vaultToken}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Stores an encrypted surrogate token in transactional DBs, isolating raw Aadhaar in HSM.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Validator & Masker (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Aadhaar Verhoeff &amp; Masking Studio</span>
              </h2>
              <button
                type="button"
                onClick={loadSampleValid}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Number</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Enter 12-Digit Aadhaar Number *
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={aadhaarInput}
                  onChange={(e) => setAadhaarInput(e.target.value)}
                  placeholder="e.g. 3675 9834 6012"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                />
                <span className="text-[11px] font-mono text-zinc-400">
                  Detected: {cleanDigits.length} / 12 digits
                </span>
              </div>

              {/* Validation Checklist */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">1. Length is exactly 12 digits:</span>
                  {validationResults.is12Digits ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Passed
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Must be 12 digits
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">2. First digit does not start with 0 or 1:</span>
                  {validationResults.notStartingWithZeroOrOne ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Passed (Starts with {cleanDigits[0] || '-'})
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Invalid prefix (UIDAI reserves 0 and 1)
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-400">3. Mathematical Verhoeff Checksum (D5):</span>
                  {validationResults.isVerhoeffValid ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Valid Checksum
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Checksum Mismatch
                    </span>
                  )}
                </div>
              </div>

              {/* Masking Style Selector */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  Mandatory Aadhaar Masking Formats
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'spaced', label: 'Spaced (XXXX-XXXX-1234)' },
                    { id: 'continuous', label: 'Continuous (XXXXXXXX1234)' },
                    { id: 'asterisk', label: 'Asterisk (********1234)' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMaskType(m.id as any)}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                        maskType === m.id
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900 text-white flex items-center justify-between font-mono text-sm">
                  <span>{maskedOutputs[maskType]}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(maskedOutputs[maskType], 'masked')}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                    title="Copy masked Aadhaar"
                  >
                    {copiedKey === 'masked' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Aadhaar Data Vault (ADV) Architecture & Requirements (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="saas-card p-6 space-y-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Aadhaar Data Vault (ADV) Rules</span>
            </h2>

            <div className="space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              <p>
                Under UIDAI Circular <strong>11020/205/2017-UIDAI</strong>, any agency (AUA, KUA, Sub-AUA, Bank, NBFC, or Fintech) storing Aadhaar must strictly implement an <strong>Aadhaar Data Vault (ADV)</strong>:
              </p>

              <div className="space-y-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                  <div>
                    <strong className="text-zinc-900 dark:text-white">Strict Enclave Separation:</strong> Raw 12-digit Aadhaar numbers and e-KYC XML packages MUST be encrypted (AES-256) inside a dedicated, isolated server enclave.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                  <div>
                    <strong className="text-zinc-900 dark:text-white">Surrogate Reference Keys:</strong> All business and transactional database tables must only reference the customer via a random <code>Reference_Key</code> (UUID token).
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                  <div>
                    <strong className="text-zinc-900 dark:text-white">FIPS 140-2 Level 3 HSM:</strong> Encryption keys must be stored in hardware security modules, not software configuration files.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                  <div>
                    <strong className="text-zinc-900 dark:text-white">Zero Raw Logging:</strong> Raw Aadhaar numbers must never appear in application logs, database queries, URL parameters, or browser local storage.
                  </div>
                </div>
              </div>

              {/* Cross Link to Biometric RD Service Tester */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
                <span className="font-bold block mb-1">Looking for Hardware Scanner Diagnostics?</span>
                <p className="text-[11px] leading-relaxed mb-2">
                  Test UIDAI L0 &amp; L1 registered biometric devices (Mantra, Morpho, Startek, SecuGen) on local ports 11100–11105.
                </p>
                <a
                  href="/developer/biometric-device-tester"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 underline"
                >
                  <span>Open Biometric Device &amp; RD Service Tester</span>
                  <span>&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
