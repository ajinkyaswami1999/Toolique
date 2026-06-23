import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Copy, Link as LinkIcon, QrCode, Download, ExternalLink, Check, RefreshCw } from 'lucide-react';

export default function WhatsAppLinkGenerator() {
  const [countryCode, setCountryCode] = useState<string>('91');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateLink = () => {
    // Clean phone number from spaces, dashes, parentheses
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      alert('Please enter a valid phone number.');
      return;
    }

    const fullPhone = `${countryCode}${cleanPhone}`;
    const encodedText = encodeURIComponent(message.trim());
    
    const url = encodedText 
      ? `https://wa.me/${fullPhone}?text=${encodedText}`
      : `https://wa.me/${fullPhone}`;
      
    setGeneratedLink(url);
  };

  // Render QR Code to canvas whenever generatedLink changes
  useEffect(() => {
    if (!generatedLink || !canvasRef.current) return;

    const renderQR = async () => {
      try {
        await QRCode.toCanvas(canvasRef.current, generatedLink, {
          width: 250,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });
      } catch (err) {
        console.error('Error rendering QR Code for WhatsApp link:', err);
      }
    };

    renderQR();
  }, [generatedLink]);

  const copyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `whatsapp-qr-${phoneNumber || 'link'}-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Settings Form */}
      <div className="lg:col-span-5 saas-card p-6 space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <LinkIcon className="w-4.5 h-4.5 text-indigo-500" />
          <span>WhatsApp Link Builder</span>
        </h3>

        <div className="space-y-4">
          {/* Phone Number Inputs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">Phone Number</label>
            <div className="flex gap-2">
              <div className="w-24 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 select-none">+</span>
                <input
                  type="number"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="saas-input pl-6 text-center"
                  placeholder="91"
                />
              </div>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="saas-input flex-grow"
                placeholder="9988776655"
              />
            </div>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Enter code (e.g. 91 for India) & local number.</span>
          </div>

          {/* Pre-filled Message Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase">Pre-filled Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="saas-input h-24 resize-none"
              placeholder="e.g. Hello, I'm interested in booking a consultation session."
            />
            <span className="text-[10px] text-zinc-400 block mt-0.5">This text will auto-populate in the user's chat window.</span>
          </div>

          <button
            onClick={generateLink}
            className="saas-button-primary w-full cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Link & QR Code</span>
          </button>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-7 saas-card p-6 flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-850 mb-4">
            Generated Sharing Assets
          </h3>

          {generatedLink ? (
            <div className="space-y-6">
              {/* Generated link copy box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase">Instant URL</label>
                <div className="flex gap-2">
                  <div className="flex-grow p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-850 truncate select-all text-sm font-semibold text-indigo-650 dark:text-indigo-400">
                    {generatedLink}
                  </div>
                  <button
                    onClick={copyLink}
                    className="flex items-center justify-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:text-indigo-650 dark:hover:text-indigo-400 transition hover:border-indigo-500/30 cursor-pointer"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-4.5 h-4.5 text-green-500" /> : <Copy className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* QR Code and Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-850">
                <div className="w-[200px] h-[200px] bg-white border border-zinc-200/65 dark:border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center p-1 shadow-sm">
                  <canvas ref={canvasRef} className="max-w-full max-h-full" />
                </div>
                
                <div className="flex-grow space-y-4 text-center sm:text-left">
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                      <QrCode className="w-4.5 h-4.5 text-indigo-500" />
                      <span>Scan-to-Chat QR Code</span>
                    </h4>
                    <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1 leading-normal">
                      Scan this QR code using any smartphone camera to open the WhatsApp chat window instantly.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      onClick={downloadQR}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/30 text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:text-indigo-650 dark:hover:text-indigo-400 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download QR</span>
                    </button>
                    <a
                      href={generatedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Test Link / Chat</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-zinc-400 dark:text-zinc-600 border-2 border-dashed border-zinc-100 dark:border-zinc-850 rounded-2xl">
              <LinkIcon className="w-10 h-10 mb-3 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm font-semibold">Enter phone details & click Generate</p>
              <p className="text-xs text-zinc-450 mt-1">Generated links and QR code nodes will display here.</p>
            </div>
          )}
        </div>

        {generatedLink && (
          <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-850 flex justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>Link format: https://wa.me/</span>
            <span className="uppercase text-[10px] font-bold text-indigo-500">Output Verified</span>
          </div>
        )}
      </div>
    </div>
  );
}
