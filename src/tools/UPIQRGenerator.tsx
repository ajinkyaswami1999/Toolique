import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check } from 'lucide-react';

export default function UPIQRGenerator() {
  const [upiId, setUpiId] = useState<string>('payee@bank');
  const [payeeName, setPayeeName] = useState<string>('Payee Name');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('Payment via Toolique');
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getUPIString = () => {
    // Standard UPI Link format: upi://pay?pa=id&pn=name&am=amount&tn=note&cu=INR
    const encodedName = encodeURIComponent(payeeName.trim());
    const encodedNote = encodeURIComponent(note.trim());
    let upiLink = `upi://pay?pa=${upiId.trim()}&pn=${encodedName}&cu=INR`;
    
    if (amount.trim() && !isNaN(Number(amount))) {
      upiLink += `&am=${Number(amount).toFixed(2)}`;
    }
    
    if (note.trim()) {
      upiLink += `&tn=${encodedNote}`;
    }
    
    return upiLink;
  };

  const generateQR = async () => {
    if (!canvasRef.current) return;
    try {
      const upiUrl = getUPIString();
      await QRCode.toCanvas(canvasRef.current, upiUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a', // Navy blue foreground
          light: '#ffffff',
        },
      });
    } catch (err) {
      console.error('UPI QR generation error:', err);
    }
  };

  useEffect(() => {
    generateQR();
  }, [upiId, payeeName, amount, note]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `upi-payment-qr-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  const copyUPILink = () => {
    navigator.clipboard.writeText(getUPIString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Inputs Column */}
      <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Payment Details</h3>

        {/* UPI ID */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Payee UPI ID (VPA)
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
            placeholder="e.g. sharma@okaxis, 9876543210@paytm"
          />
        </div>

        {/* Payee Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Payee Name
          </label>
          <input
            type="text"
            value={payeeName}
            onChange={(e) => setPayeeName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
            placeholder="e.g. Rajesh Kumar"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Amount (₹ - Optional)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
            placeholder="Enter fixed amount (e.g. 500)"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-350 mb-2">
            Transaction Note (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-teal-500 bg-transparent text-slate-800 dark:text-white font-medium"
            placeholder="e.g. Dinner share, Invoice 482"
            maxLength={50}
          />
        </div>
      </div>

      {/* Output Column */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-950 text-white shadow-xl min-h-[400px]">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-800 text-center max-w-full overflow-hidden">
          <canvas ref={canvasRef} className="mx-auto rounded" style={{ maxWidth: '100%', height: 'auto' }} />
          <div className="text-[10px] text-slate-400 font-mono mt-3 uppercase tracking-wider">UPI NPCI Standard QR</div>
        </div>

        <div className="text-center mt-5 max-w-sm px-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            This QR code encodes standard UPI transaction protocols. Scan using any UPI app (GPay, PhonePe, Paytm, BHIM) to make a transfer.
          </p>
        </div>

        {/* Payment URI info and Action Buttons */}
        <div className="w-full max-w-md mt-6 pt-4 border-t border-slate-800/80 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={copyUPILink}
              className="flex-grow flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Link' : 'Copy Payment URI'}</span>
            </button>
            
            <button
              onClick={downloadQR}
              className="flex-grow flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:opacity-90 font-bold text-xs text-white shadow-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

