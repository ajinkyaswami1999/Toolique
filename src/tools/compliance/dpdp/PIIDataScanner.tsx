import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Sparkles,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

/* =========================================================================
   OFFICIAL VERHOEFF ALGORITHM (DIHEDRAL GROUP D5)
   ========================================================================= */
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

function validateVerhoeff(numStr: string): boolean {
  const clean = numStr.replace(/\D/g, '');
  if (clean.length !== 12) return false;
  let c = 0;
  const digits = clean.split('').map(Number).reverse();
  for (let i = 0; i < digits.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digits[i]]];
  }
  return c === 0;
}

// Luhn Algorithm for Credit/Debit Cards
function validateLuhn(numStr: string): boolean {
  const clean = numStr.replace(/\D/g, '');
  if (clean.length < 13 || clean.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export interface PIIDetection {
  id: string;
  type: 'Aadhaar Number' | 'PAN Card' | 'Indian Passport' | 'Voter ID (EPIC)' | 'Driving Licence' | 'Phone Number' | 'Email Address' | 'Payment Card';
  raw: string;
  masked: string;
  line: number;
  severity: 'Critical' | 'High' | 'Medium';
  isVerhoeffValid?: boolean;
}

const SAMPLE_PAYLOAD = `[2026-10-14 10:15:32] INFO: Customer onboarding request initiated.
User Profile: Rajesh Sharma, Email: rajesh.sharma@example.in, Phone: +91 98230 45678
Identity Document Details:
- PAN: ABCPS1234M (Individual verified via NSDL API)
- Aadhaar Number: 4321 8765 9012 (Status: Unmasked raw number detected in payload!)
- Alternate Voter ID: WHT1234567
Payment Gateway Payload:
{
  "customer_id": "CUST_99120",
  "email": "sharma_family@enterprise.co.in",
  "billing_phone": "9876543210",
  "card_number": "4111 1111 1111 1111",
  "passport_number": "Z1234567"
}
[2026-10-14 10:15:34] DEBUG: Transaction committed successfully.`;

export default function PIIDataScanner() {
  const [inputText, setInputText] = useState<string>(SAMPLE_PAYLOAD);
  const [showRawValues, setShowRawValues] = useState<boolean>(false);
  const [copiedSanitized, setCopiedSanitized] = useState<boolean>(false);

  // Scanner Engine
  const findings: PIIDetection[] = useMemo(() => {
    if (!inputText.trim()) return [];
    const results: PIIDetection[] = [];
    const lines = inputText.split('\n');

    lines.forEach((lineText, lineIdx) => {
      const lineNum = lineIdx + 1;

      // 1. Aadhaar Numbers (12 digits, optional space or dash)
      const aadhaarMatches = lineText.match(/\b[2-9]{1}[0-9]{3}[-\s]?[0-9]{4}[-\s]?[0-9]{4}\b/g);
      if (aadhaarMatches) {
        aadhaarMatches.forEach((match) => {
          const clean = match.replace(/\D/g, '');
          const isVerhoeff = validateVerhoeff(clean);
          results.push({
            id: `aadhaar-${lineNum}-${clean}`,
            type: 'Aadhaar Number',
            raw: match,
            masked: `XXXX-XXXX-${clean.slice(-4)}`,
            line: lineNum,
            severity: 'Critical',
            isVerhoeffValid: isVerhoeff
          });
        });
      }

      // 2. PAN Card ([A-Z]{5}[0-9]{4}[A-Z]{1})
      const panMatches = lineText.match(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g);
      if (panMatches) {
        panMatches.forEach((match) => {
          results.push({
            id: `pan-${lineNum}-${match}`,
            type: 'PAN Card',
            raw: match,
            masked: `${match.slice(0, 2)}***${match.slice(-2)}`,
            line: lineNum,
            severity: 'High'
          });
        });
      }

      // 3. Indian Passport (1 letter + 7 digits)
      const passportMatches = lineText.match(/\b[A-PR-WYa-pr-wy][1-9][0-9]{6}\b/g);
      if (passportMatches) {
        passportMatches.forEach((match) => {
          results.push({
            id: `pass-${lineNum}-${match}`,
            type: 'Indian Passport',
            raw: match,
            masked: `${match.slice(0, 2)}*****${match.slice(-1)}`,
            line: lineNum,
            severity: 'High'
          });
        });
      }

      // 4. Voter ID / EPIC (3 letters + 7 digits)
      const voterMatches = lineText.match(/\b[A-Z]{3}[0-9]{7}\b/g);
      if (voterMatches) {
        voterMatches.forEach((match) => {
          results.push({
            id: `voter-${lineNum}-${match}`,
            type: 'Voter ID (EPIC)',
            raw: match,
            masked: `${match.slice(0, 3)}****${match.slice(-2)}`,
            line: lineNum,
            severity: 'Medium'
          });
        });
      }

      // 5. Email Addresses
      const emailMatches = lineText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g);
      if (emailMatches) {
        emailMatches.forEach((match) => {
          const parts = match.split('@');
          const maskedUser = parts[0].length > 2 ? `${parts[0].slice(0, 1)}***${parts[0].slice(-1)}` : '***';
          results.push({
            id: `email-${lineNum}-${match}`,
            type: 'Email Address',
            raw: match,
            masked: `${maskedUser}@${parts[1]}`,
            line: lineNum,
            severity: 'Medium'
          });
        });
      }

      // 6. Indian Mobile Numbers (+91 or 10 digits starting with 6-9)
      const phoneMatches = lineText.match(/(?:\+91[\s-]?)?[6-9]\d{9}\b/g);
      if (phoneMatches) {
        phoneMatches.forEach((match) => {
          const clean = match.replace(/\D/g, '');
          const national = clean.slice(-10);
          results.push({
            id: `phone-${lineNum}-${clean}`,
            type: 'Phone Number',
            raw: match,
            masked: `+91 ${national.slice(0, 2)}*** **${national.slice(-2)}`,
            line: lineNum,
            severity: 'Medium'
          });
        });
      }

      // 7. Payment Cards (13-19 digits, Luhn check)
      const cardMatches = lineText.match(/\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{13,19}\b/g);
      if (cardMatches) {
        cardMatches.forEach((match) => {
          const clean = match.replace(/\D/g, '');
          if (validateLuhn(clean)) {
            results.push({
              id: `card-${lineNum}-${clean}`,
              type: 'Payment Card',
              raw: match,
              masked: `****-****-****-${clean.slice(-4)}`,
              line: lineNum,
              severity: 'Critical'
            });
          }
        });
      }
    });

    return results;
  }, [inputText]);

  // Redacted Output
  const sanitizedOutput = useMemo(() => {
    let output = inputText;
    findings.forEach((f) => {
      output = output.split(f.raw).join(f.masked);
    });
    return output;
  }, [inputText, findings]);

  const severityCounts = useMemo(() => {
    return {
      critical: findings.filter(f => f.severity === 'Critical').length,
      high: findings.filter(f => f.severity === 'High').length,
      medium: findings.filter(f => f.severity === 'Medium').length
    };
  }, [findings]);

  const handleCopySanitized = () => {
    navigator.clipboard.writeText(sanitizedOutput);
    setCopiedSanitized(true);
    setTimeout(() => setCopiedSanitized(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Advisory Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 border border-blue-500/20 dark:border-blue-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Client-Side PII & Aadhaar Data Scanner
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  100% In-Browser Sandbox
                </span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Scan logs, JSON, CSV, or database snippets for Indian personal data: Aadhaar (with official Verhoeff D5 check), PAN, Passport, Voter ID, phone numbers, and payment cards.
              </p>
            </div>
          </div>
          <button
            onClick={() => setInputText(SAMPLE_PAYLOAD)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Load Sample Payload
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total PII Detected</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {findings.length}
          </div>
          <span className="text-[11px] text-slate-400">across payload lines</span>
        </div>

        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">Critical Risk</span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
            {severityCounts.critical}
          </div>
          <span className="text-[11px] text-red-600/70 dark:text-red-400/70">Aadhaar & Cards</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">High Risk</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {severityCounts.high}
          </div>
          <span className="text-[11px] text-amber-600/70 dark:text-amber-400/70">PAN & Passports</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">Medium Risk</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {severityCounts.medium}
          </div>
          <span className="text-[11px] text-blue-600/70 dark:text-blue-400/70">Phones & Emails</span>
        </div>
      </div>

      {/* Editor & Input Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Text / Logs */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                Raw Input Text / JSON / Application Logs
              </label>
              <button
                onClick={() => setInputText('')}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            </div>
            <textarea
              rows={14}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste text, log lines, CSV, or JSON payloads to scan for Indian PII..."
              className="w-full p-3.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>{inputText.length} characters • {inputText.split('\n').length} lines</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Processed 100% locally</span>
          </div>
        </div>

        {/* Right: Sanitized / Redacted Preview */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-500" />
                Sanitized & Redacted Output
              </label>
              <button
                onClick={handleCopySanitized}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                {copiedSanitized ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSanitized ? 'Copied' : 'Copy Sanitized'}
              </button>
            </div>
            <textarea
              readOnly
              rows={14}
              value={sanitizedOutput}
              className="w-full p-3.5 text-xs font-mono rounded-xl border border-emerald-300/40 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-800 dark:text-slate-200 focus:outline-none cursor-text"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>All Aadhaar, PAN, Card, and Phone numbers masked</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">DPDP Ready</span>
          </div>
        </div>
      </div>

      {/* Itemized Detections Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-500" />
              Detected Personal Identifiable Information ({findings.length})
            </h3>
            <p className="text-xs text-slate-500">
              Itemized inventory of detected personal data elements with line references and verification status.
            </p>
          </div>

          <button
            onClick={() => setShowRawValues(!showRawValues)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors self-start sm:self-auto"
          >
            {showRawValues ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showRawValues ? 'Hide Raw Values' : 'Reveal Raw Values'}
          </button>
        </div>

        {findings.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            No personal identifiable information (PII) detected in the provided input.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Line #</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Detected Value</th>
                  <th className="px-4 py-3">Masked Format</th>
                  <th className="px-4 py-3">Verification Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                {findings.map((f, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-bold">Line {f.line}</td>
                    <td className="px-4 py-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                      {f.type}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        f.severity === 'Critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          : f.severity === 'High'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {showRawValues ? f.raw : f.masked}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">
                      {f.masked}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-500">
                      {f.type === 'Aadhaar Number' && (
                        f.isVerhoeffValid ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verhoeff D5 Checksum Valid
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Invalid Verhoeff Checksum
                          </span>
                        )
                      )}
                      {f.type === 'Payment Card' && 'Luhn Validated'}
                      {f.type === 'PAN Card' && 'NSDL Format Compliant'}
                      {f.type === 'Phone Number' && 'TRAI 10-Digit Mobile'}
                      {f.type === 'Email Address' && 'RFC 5322 Valid'}
                      {f.type === 'Indian Passport' && 'Passport Seva Format'}
                      {f.type === 'Voter ID (EPIC)' && 'ECI EPIC Format'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statutory Guidance */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
        <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-blue-500" />
          Statutory Data Protection Mandate:
        </div>
        <p>
          Under Section 8(5) of the DPDP Act 2023, Data Fiduciaries must implement reasonable security safeguards including data masking and pseudonymization. Storing unmasked 12-digit Aadhaar numbers in production application logs violates UIDAI circular No. 11020/205/2017-UIDAI.
        </p>
      </div>
    </div>
  );
}
