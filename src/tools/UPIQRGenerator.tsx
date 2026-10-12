import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Printer,
  Store,
  IndianRupee,
  ShieldCheck,
  Palette,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface TemplatePreset {
  label: string;
  id: string;
  upiId: string;
  name: string;
  amount: string;
  note: string;
}

const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    label: 'Kirana / Retail Shop',
    id: 'kirana',
    upiId: 'sharma.kirana@okaxis',
    name: 'Sharma Daily Mart',
    amount: '',
    note: 'Groceries'
  },
  {
    label: 'Freelance & Invoicing',
    id: 'freelance',
    upiId: 'aarav.studio@okhdfcbank',
    name: 'Aarav Design Studio',
    amount: '4500',
    note: 'UI Design Invoice #204'
  },
  {
    label: 'Chai & Cafe Stall',
    id: 'cafe',
    upiId: 'corner.cafe@ybl',
    name: 'Corner Tea & Snacks',
    amount: '40',
    note: 'Chai & Samosa'
  },
  {
    label: 'Doctor / Consultation',
    id: 'doctor',
    upiId: 'dr.mehta@icici',
    name: 'Dr. Mehta Clinic',
    amount: '500',
    note: 'OPD Consultation Fee'
  },
  {
    label: 'Personal Bill Split',
    id: 'personal',
    upiId: 'rahul.verma@paytm',
    name: 'Rahul Verma',
    amount: '350',
    note: 'Weekend Dinner Share'
  }
];

const COMMON_VPA_HANDLES = [
  '@okhdfcbank',
  '@okaxis',
  '@oksbi',
  '@okicici',
  '@ybl',
  '@ibl',
  '@paytm',
  '@upi'
];

type StandeeTheme = 'classic' | 'indigo' | 'emerald' | 'dark';

export default function UPIQRGenerator() {
  // Payment Details
  const [upiId, setUpiId] = useState<string>('sharma.kirana@okaxis');
  const [payeeName, setPayeeName] = useState<string>('Sharma Daily Mart');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('Payment via Toolique');
  const [merchantCode, setMerchantCode] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Customizer State
  const [qrColor, setQrColor] = useState<string>('#0f172a');
  const [standeeTheme, setStandeeTheme] = useState<StandeeTheme>('classic');
  const [includeCenterLogo, setIncludeCenterLogo] = useState<boolean>(true);

  // Action State
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // VPA Validation
  const isVpaValid = useMemo(() => {
    const trimmed = upiId.trim();
    return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(trimmed);
  }, [upiId]);

  // Construct NPCI Standard UPI Intent URI
  const getUPIString = useCallback(() => {
    const cleanId = upiId.trim();
    const encodedName = encodeURIComponent(payeeName.trim());
    let upiLink = `upi://pay?pa=${cleanId}&pn=${encodedName}&cu=INR`;

    if (amount.trim() && !isNaN(Number(amount)) && Number(amount) > 0) {
      upiLink += `&am=${Number(amount).toFixed(2)}`;
    }

    if (note.trim()) {
      upiLink += `&tn=${encodeURIComponent(note.trim())}`;
    }

    if (merchantCode.trim()) {
      upiLink += `&mc=${encodeURIComponent(merchantCode.trim())}`;
    }

    if (transactionRef.trim()) {
      upiLink += `&tr=${encodeURIComponent(transactionRef.trim())}`;
    }

    return upiLink;
  }, [upiId, payeeName, amount, note, merchantCode, transactionRef]);

  // Generate QR Canvas with optional NPCI center logo badge
  const renderQRCode = useCallback(async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const upiUrl = getUPIString();

    try {
      await QRCode.toCanvas(canvas, upiUrl, {
        width: 320,
        margin: 2,
        errorCorrectionLevel: 'H', // High error correction permits center logo overlay
        color: {
          dark: qrColor,
          light: '#ffffff'
        }
      });

      // Draw custom center badge if enabled
      if (includeCenterLogo) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const badgeWidth = 56;
          const badgeHeight = 32;
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const x = centerX - badgeWidth / 2;
          const y = centerY - badgeHeight / 2;

          // Outer badge background with rounded border
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(x - 3, y - 3, badgeWidth + 6, badgeHeight + 6, 8);
          } else {
            ctx.rect(x - 3, y - 3, badgeWidth + 6, badgeHeight + 6);
          }
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#cbd5e1';
          ctx.stroke();

          // UPI Text
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('UPI', centerX, centerY - 3);

          // Indian Tricolor accent bars
          ctx.fillStyle = '#f97316'; // Saffron
          ctx.fillRect(centerX - 14, centerY + 7, 12, 2.5);
          ctx.fillStyle = '#10b981'; // Green
          ctx.fillRect(centerX + 2, centerY + 7, 12, 2.5);
        }
      }
    } catch (err) {
      console.error('UPI QR Generation error:', err);
    }
  }, [getUPIString, qrColor, includeCenterLogo]);

  useEffect(() => {
    renderQRCode();
  }, [renderQRCode]);

  // Download High-Resolution PNG
  const handleDownloadPNG = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `upi-qr-${payeeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  // Download Vector SVG
  const handleDownloadSVG = async () => {
    try {
      const upiUrl = getUPIString();
      const svgString = await QRCode.toString(upiUrl, {
        type: 'svg',
        width: 360,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: qrColor,
          light: '#ffffff'
        }
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `upi-qr-${payeeName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export SVG:', err);
    }
  };

  // Copy UPI Intent Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(getUPIString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Trigger Print Standee
  const handlePrint = () => {
    window.print();
  };

  // Amount Fast Addition
  const handleAddAmount = (addVal: number) => {
    const current = Number(amount) || 0;
    setAmount((current + addVal).toString());
  };

  // Quick Handle Suffix appender
  const handleAppendSuffix = (suffix: string) => {
    const current = upiId.trim();
    if (current.includes('@')) {
      const prefix = current.split('@')[0];
      setUpiId(`${prefix}${suffix}`);
    } else {
      setUpiId(`${current}${suffix}`);
    }
  };

  // Load Preset
  const handleSelectPreset = (preset: TemplatePreset) => {
    setUpiId(preset.upiId);
    setPayeeName(preset.name);
    setAmount(preset.amount);
    setNote(preset.note);
  };

  return (
    <div className="space-y-6">
      {/* Quick Merchant & Freelance Presets Row (Note: No duplicate H1 here) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-left">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 shrink-0">
          Payment Presets:
        </span>
        {TEMPLATE_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelectPreset(p)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-pastel-indigo/30 hover:bg-pastel-indigo/60 text-indigo-800 dark:text-indigo-300 border border-pastel-indigo/50 transition shrink-0"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Left Column: Form & Customizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-500" />
                <span>UPI Payment Configuration</span>
              </h2>
              <span className="text-[11px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                NPCI Standard v2.0
              </span>
            </div>

            <div className="space-y-4">
              {/* Payee UPI ID (VPA) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <label htmlFor="upi-id-input">Receiver UPI ID / VPA *</label>
                  {isVpaValid ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valid VPA Format</span>
                    </span>
                  ) : upiId ? (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Missing @handle suffix</span>
                    </span>
                  ) : null}
                </div>

                <input
                  id="upi-id-input"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. sharma@okaxis, 9876543210@paytm"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                />

                {/* Popular Handles Quick Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Quick Handles:</span>
                  {COMMON_VPA_HANDLES.map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => handleAppendSuffix(handle)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
                    >
                      {handle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payee / Business Name */}
              <div className="space-y-1.5">
                <label htmlFor="payee-name-input" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  Payee / Business Name *
                </label>
                <input
                  id="payee-name-input"
                  type="text"
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="e.g. Sharma Kirana Store, Rahul Verma"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>

              {/* Fixed Amount (Optional) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <label htmlFor="amount-input">Amount in INR (₹ - Optional)</label>
                  {amount && (
                    <button
                      type="button"
                      onClick={() => setAmount('')}
                      className="text-[10px] font-bold text-rose-500 hover:underline"
                    >
                      Clear Amount (Allow Any Amount)
                    </button>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    id="amount-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Leave empty for customer-entered flexible amount"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                  />
                </div>

                {/* Amount Fast Add Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[50, 100, 250, 500, 1000, 2000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAddAmount(val)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 transition"
                    >
                      +₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note / Remarks */}
              <div className="space-y-1.5">
                <label htmlFor="note-input" className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  Payment Note / Remarks (Optional)
                </label>
                <input
                  id="note-input"
                  type="text"
                  maxLength={50}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Order #1042, Lunch bill, Consultation"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                />
              </div>

              {/* Advanced Merchant Options Collapsible */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>{showAdvanced ? '− Hide Merchant Invoicing Fields' : '+ Show Merchant Invoicing Fields (MCC & Ref ID)'}</span>
                </button>

                {showAdvanced && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                        Merchant Category Code (MCC)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={merchantCode}
                        onChange={(e) => setMerchantCode(e.target.value)}
                        placeholder="e.g. 5411 (Grocery)"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                        Transaction Ref ID (tr)
                      </label>
                      <input
                        type="text"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder="e.g. INV-98402"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Standee & QR Customizer Panel */}
          <div className="saas-card p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-500" />
                <span>Standee Theme & QR Customizer</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Standee Theme */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  Standee Card Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'classic', label: 'Classic Store' },
                    { id: 'indigo', label: 'Royal Indigo' },
                    { id: 'emerald', label: 'Merchant Teal' },
                    { id: 'dark', label: 'Modern Dark' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setStandeeTheme(t.id as StandeeTheme)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        standeeTheme === t.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Foreground Color */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
                  QR Pattern Color
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { hex: '#0f172a', label: 'Navy' },
                    { hex: '#4f46e5', label: 'Indigo' },
                    { hex: '#059669', label: 'Emerald' },
                    { hex: '#0d9488', label: 'Teal' },
                    { hex: '#b91c1c', label: 'Crimson' }
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setQrColor(c.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        qrColor === c.hex ? 'border-indigo-500 scale-110 shadow-sm' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Center Logo Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeCenterLogo}
                  onChange={(e) => setIncludeCenterLogo(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                />
                <div className="text-xs">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Embed Authentic NPCI UPI Center Logo</span>
                  <span className="text-zinc-400 block text-[11px]">Renders the official UPI logo with error correction tolerance</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Standee Card & Action Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real Counter Standee Display Card */}
          <div
            id="printable-upi-standee"
            className={`p-6 md:p-8 rounded-3xl border shadow-lg text-center relative overflow-hidden transition-all ${
              standeeTheme === 'classic'
                ? 'bg-gradient-to-b from-amber-500/10 via-white to-emerald-500/10 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-white'
                : standeeTheme === 'indigo'
                ? 'bg-gradient-to-b from-indigo-500/15 via-white to-purple-500/15 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 border-indigo-200/80 dark:border-indigo-900/60 text-zinc-900 dark:text-white'
                : standeeTheme === 'emerald'
                ? 'bg-gradient-to-b from-emerald-500/15 via-white to-teal-500/15 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 border-emerald-200/80 dark:border-emerald-900/60 text-zinc-900 dark:text-white'
                : 'bg-zinc-900 border-zinc-800 text-white'
            }`}
          >
            {/* Top Standee Header with Indian Tricolor Stripe */}
            <div className="space-y-1 mb-5">
              <div className="flex items-center justify-center gap-1.5 font-black text-xs uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                <Store className="w-4 h-4" />
                <span>BHIM UPI &bull; SCAN &amp; PAY</span>
              </div>
              <h3 className="text-xl font-black tracking-tight truncate px-2">
                {payeeName || 'Business / Payee'}
              </h3>
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 font-bold truncate px-2">
                {upiId || 'payee@bank'}
              </p>
            </div>

            {/* QR Canvas Container */}
            <div className="inline-block p-4 rounded-2xl bg-white shadow-md border border-zinc-200/80 dark:border-zinc-700/80 mx-auto">
              <canvas
                ref={canvasRef}
                className="rounded-lg mx-auto"
                style={{ width: '220px', height: '220px' }}
              />
              {amount ? (
                <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-center gap-1 font-mono font-black text-emerald-700 text-base">
                  <span>Pay Exactly: ₹{Number(amount).toFixed(2)}</span>
                </div>
              ) : (
                <div className="mt-2.5 pt-2 border-t border-zinc-100 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Scan to Pay Any Amount
                </div>
              )}
            </div>

            {/* Payment Note if present */}
            {note && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-3 italic">
                &ldquo;{note}&rdquo;
              </p>
            )}

            {/* Supported UPI Apps Badges */}
            <div className="mt-5 pt-4 border-t border-zinc-200/60 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block">
                Accepted with Any UPI App
              </span>
              <div className="flex items-center justify-center gap-2 flex-wrap text-[11px] font-black text-zinc-700 dark:text-zinc-300">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                  Google Pay
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                  PhonePe
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                  Paytm
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                  BHIM
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                  Cred
                </span>
              </div>
            </div>
          </div>

          {/* Standee Action Controls Card */}
          <div className="saas-card p-6 space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="py-2.5 px-4 rounded-xl bg-indigo-650 hover:bg-indigo-750 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-black text-xs shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSVG}
                className="py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-black text-xs transition flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>Vector SVG</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                title="Print Standee display sheet"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-500" />
                <span>Print Standee</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                title="Copy raw upi:// URI"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                <span>{copiedLink ? 'Copied URI' : 'Copy UPI Link'}</span>
              </button>
            </div>

            {/* Mobile Pay Direct Link */}
            <a
              href={getUPIString()}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Installed UPI App (Mobile Only)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Feature & NPCI Architectural Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <div className="saas-card p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400 font-black text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero Intermediary &amp; 100% Free</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            This tool directly generates peer-to-peer and merchant NPCI standard payment links. Zero fees, zero commission deductions, and zero payment gateway middleman cuts.
          </p>
        </div>

        <div className="saas-card p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-650 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
            <QrCode className="w-4 h-4" />
            <span>Static vs. Dynamic QR Codes</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Leaving the amount blank creates an all-purpose static QR for your shop counter. Specifying an exact rupee amount generates an automated dynamic QR code for instant invoice reconciliation.
          </p>
        </div>

        <div className="saas-card p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-purple-650 dark:text-purple-400 font-black text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>High Error Correction (Level H)</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Generated with 30% Reed-Solomon error correction redundancy, ensuring instantaneous scanner camera reads even if printed standees experience smudges, scratches, or moisture.
          </p>
        </div>
      </div>
    </div>
  );
}
