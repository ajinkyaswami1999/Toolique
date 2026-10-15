import { useState, useMemo } from 'react';
import {
  Lock,
  Copy,
  Check,
  FileText,
  Sliders,
  Sparkles,
  Download
} from 'lucide-react';

const SAMPLE_TEXT = `{
  "customer": {
    "name": "Ajinkya Swami",
    "email": "ajinkya.swami@example.com",
    "phone": "+91 98765 43210",
    "pan": "ABCDE1234F",
    "aadhaar": "9876 5432 1098",
    "passport": "A1234567",
    "voter_id": "ABC1234567",
    "credit_card": "4111 2222 3333 4444"
  },
  "notes": "Customer submitted Aadhaar 9876 5432 1098 and PAN ABCDE1234F for statutory KYC verification. Call him back at 9876543210."
}`;

export default function PersonalDataMaskingTool() {
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [aadhaarMode, setAadhaarMode] = useState<'masked_last4' | 'full_mask' | 'token'>('masked_last4');
  const [panMode, setPanMode] = useState<'mask_digits' | 'mask_letters' | 'token'>('mask_digits');
  const [emailMode, setEmailMode] = useState<'partial' | 'domain_only' | 'token'>('partial');
  const [phoneMode, setPhoneMode] = useState<'mask_middle' | 'mask_first6' | 'token'>('mask_middle');
  const [cardMode, setCardMode] = useState<'pci_last4' | 'full_mask' | 'token'>('pci_last4');
  const [passportMode, setPassportMode] = useState<'mask_middle' | 'token'>('mask_middle');
  const [copied, setCopied] = useState<boolean>(false);

  // Masking Transformation
  const maskedResult = useMemo(() => {
    if (!inputText) return { text: '', stats: { aadhaar: 0, pan: 0, email: 0, phone: 0, card: 0, passport: 0 } };

    let out = inputText;
    let aadhaarCount = 0;
    let panCount = 0;
    let emailCount = 0;
    let phoneCount = 0;
    let cardCount = 0;
    let passportCount = 0;

    // 1. Aadhaar Masking
    out = out.replace(/\b[2-9]{1}[0-9]{3}[-\s]?[0-9]{4}[-\s]?[0-9]{4}\b/g, (match) => {
      aadhaarCount++;
      const clean = match.replace(/\D/g, '');
      if (aadhaarMode === 'masked_last4') return `XXXX-XXXX-${clean.slice(-4)}`;
      if (aadhaarMode === 'full_mask') return 'XXXX-XXXX-XXXX';
      return '[REDACTED_AADHAAR]';
    });

    // 2. PAN Masking
    out = out.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, (match) => {
      panCount++;
      if (panMode === 'mask_digits') return `${match.slice(0, 5)}****${match.slice(-1)}`;
      if (panMode === 'mask_letters') return `*****${match.slice(5)}`;
      return '[REDACTED_PAN]';
    });

    // 3. Payment Cards (16 digits / 4 groups of 4)
    out = out.replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, (match) => {
      cardCount++;
      const clean = match.replace(/\D/g, '');
      if (cardMode === 'pci_last4') return `****-****-****-${clean.slice(-4)}`;
      if (cardMode === 'full_mask') return '****-****-****-****';
      return '[REDACTED_CARD]';
    });

    // 4. Passports (1 letter + 7 digits)
    out = out.replace(/\b[A-PR-WYa-pr-wy][1-9][0-9]{6}\b/g, (match) => {
      passportCount++;
      if (passportMode === 'mask_middle') return `${match.slice(0, 2)}****${match.slice(-1)}`;
      return '[REDACTED_PASSPORT]';
    });

    // 5. Emails
    out = out.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, (match) => {
      emailCount++;
      if (emailMode === 'token') return '[REDACTED_EMAIL]';
      const parts = match.split('@');
      if (emailMode === 'domain_only') return `****@${parts[1]}`;
      const user = parts[0];
      const maskedUser = user.length > 2 ? `${user.slice(0, 1)}***${user.slice(-1)}` : '***';
      return `${maskedUser}@${parts[1]}`;
    });

    // 6. Phones (+91 or 10 digits)
    out = out.replace(/(?:\+91[\s-]?)?[6-9]\d{9}\b/g, (match) => {
      phoneCount++;
      const clean = match.replace(/\D/g, '');
      const last4 = clean.slice(-4);
      if (phoneMode === 'token') return '[REDACTED_PHONE]';
      if (phoneMode === 'mask_first6') return `+91 ******${last4}`;
      const first2 = clean.slice(-10, -8);
      return `+91 ${first2}*** **${clean.slice(-2)}`;
    });

    return {
      text: out,
      stats: {
        aadhaar: aadhaarCount,
        pan: panCount,
        email: emailCount,
        phone: phoneCount,
        card: cardCount,
        passport: passportCount
      }
    };
  }, [inputText, aadhaarMode, panMode, emailMode, phoneMode, cardMode, passportMode]);

  const totalMaskedTokens = useMemo(() => {
    const s = maskedResult.stats;
    return s.aadhaar + s.pan + s.email + s.phone + s.card + s.passport;
  }, [maskedResult.stats]);

  const handleCopy = () => {
    navigator.clipboard.writeText(maskedResult.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([maskedResult.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sanitized_masked_data.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Personal Data Masking & Anonymization Tool
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Zero Server Transfer
                </span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Sanitize logs, databases, JSON files, or user records with statutory masking rules for Aadhaar (XXXX-XXXX-1234), PAN, phone numbers, emails, and payment cards.
              </p>
            </div>
          </div>
          <button
            onClick={() => setInputText(SAMPLE_TEXT)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Load Sample JSON
          </button>
        </div>
      </div>

      {/* Masking Rule Configuration */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-500" />
          Statutory Masking Rules & Redaction Syntax
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Aadhaar Card Rule
            </label>
            <select
              value={aadhaarMode}
              onChange={(e) => setAadhaarMode(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="masked_last4">XXXX-XXXX-1234 (UIDAI Statutory)</option>
              <option value="full_mask">XXXX-XXXX-XXXX (Full Redact)</option>
              <option value="token">[REDACTED_AADHAAR]</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              PAN Card Rule
            </label>
            <select
              value={panMode}
              onChange={(e) => setPanMode(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="mask_digits">ABCDE****F (Mask Digits)</option>
              <option value="mask_letters">*****1234F (Mask Letters)</option>
              <option value="token">[REDACTED_PAN]</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Email Address Rule
            </label>
            <select
              value={emailMode}
              onChange={(e) => setEmailMode(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="partial">a***a@domain.com (Partial)</option>
              <option value="domain_only">****@domain.com (Domain Only)</option>
              <option value="token">[REDACTED_EMAIL]</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Phone Number Rule
            </label>
            <select
              value={phoneMode}
              onChange={(e) => setPhoneMode(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="mask_middle">+91 98*** **210 (Middle Mask)</option>
              <option value="mask_first6">+91 ******3210 (Last 4 Only)</option>
              <option value="token">[REDACTED_PHONE]</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Payment Card Rule
            </label>
            <select
              value={cardMode}
              onChange={(e) => setCardMode(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="pci_last4">****-****-****-1234 (PCI-DSS)</option>
              <option value="full_mask">****-****-****-**** (Full Mask)</option>
              <option value="token">[REDACTED_CARD]</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Indian Passport Rule
            </label>
            <select
              value={passportMode}
              onChange={(e) => setPassportMode(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="mask_middle">A1****7 (Middle Mask)</option>
              <option value="token">[REDACTED_PASSPORT]</option>
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-Side Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Text */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-500" />
                Raw Source Text / JSON Payload
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
              placeholder="Paste raw text, JSON, logs, or customer lists to mask..."
              className="w-full p-3.5 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>{inputText.length} characters</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% In-Browser</span>
          </div>
        </div>

        {/* Right: Masked Result */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-500" />
                Sanitized Output ({totalMaskedTokens} Tokens Redacted)
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <textarea
              readOnly
              rows={14}
              value={maskedResult.text}
              className="w-full p-3.5 text-xs font-mono rounded-xl border border-emerald-300/40 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/10 text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>
              Aadhaar: {maskedResult.stats.aadhaar} • PAN: {maskedResult.stats.pan} • Phone: {maskedResult.stats.phone} • Email: {maskedResult.stats.email}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">DPDP & UIDAI Masked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
