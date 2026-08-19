import { useState, useEffect, useMemo } from 'react';
import { Percent, Copy, Check, FileText, Download, Printer, History, Trash2, Sparkles, ChevronDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

// --- Interfaces ---
type TransactionType = 'intra' | 'inter';
type CalculationMode = 'add' | 'remove';
type DiscountType = 'percentage' | 'fixed';

interface HistoryItem {
  id: string;
  amount: number;
  rate: number;
  mode: CalculationMode;
  gstAmount: number;
  finalAmount: number;
  timestamp: string;
}

export default function GSTCalculator() {
  const [calcMode, setCalcMode] = useState<CalculationMode>('add');
  const [amountInput, setAmountInput] = useState<string>('10000');
  const [gstRate, setGstRate] = useState<number>(18);
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);
  const [customRateText, setCustomRateText] = useState<string>('');
  const [transactionType, setTransactionType] = useState<TransactionType>('intra');

  // Advanced section inputs
  const [enableAdvanced, setEnableAdvanced] = useState<boolean>(false);
  const [unitPrice, setUnitPrice] = useState<string>('2000');
  const [quantity, setQuantity] = useState<string>('5');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('10');

  // Utility states
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedInvoice, setCopiedInvoice] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const slabs = [0, 5, 12, 18, 28];

  // Load URL query parameters & history on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const amt = params.get('amount');
      const rate = params.get('rate');
      const mode = params.get('mode');
      const type = params.get('type');

      if (amt) setAmountInput(amt);
      if (rate) {
        const parsedRate = parseFloat(rate);
        if (slabs.includes(parsedRate)) {
          setGstRate(parsedRate);
          setIsCustomRate(false);
        } else {
          setGstRate(parsedRate);
          setIsCustomRate(true);
          setCustomRateText(rate);
        }
      }
      if (mode) setCalcMode(mode as CalculationMode);
      if (type) setTransactionType(type as TransactionType);
    } catch (e) {}

    const cachedHist = localStorage.getItem('toolique_gst_hist');
    if (cachedHist) setHistory(JSON.parse(cachedHist));
  }, []);

  // Validation hook
  const validateInputs = () => {
    const errs: Record<string, string> = {};
    if (enableAdvanced) {
      const uPrice = parseFloat(unitPrice);
      const qty = parseInt(quantity, 10);
      const disc = parseFloat(discountValue);

      if (isNaN(uPrice) || uPrice < 0) errs.unitPrice = 'Enter a valid unit price.';
      if (isNaN(qty) || qty <= 0) errs.quantity = 'Enter a valid quantity.';
      if (isNaN(disc) || disc < 0) errs.discount = 'Enter a valid discount.';
      
      const subtotal = (uPrice || 0) * (qty || 0);
      if (discountType === 'percentage' && disc > 100) {
        errs.discount = 'Discount cannot exceed 100%.';
      } else if (discountType === 'fixed' && disc > subtotal) {
        errs.discount = 'Discount cannot exceed subtotal amount.';
      }
    } else {
      const baseAmt = parseFloat(amountInput);
      if (isNaN(baseAmt) || baseAmt < 0) errs.amount = 'Enter a valid positive number.';
    }

    if (isCustomRate) {
      const cRate = parseFloat(customRateText);
      if (isNaN(cRate) || cRate < 0 || cRate > 100) errs.rate = 'Rate must be between 0% and 100%.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Live Calculations Engine
  const calculations = useMemo(() => {
    validateInputs();
    
    // 1. Resolve active rate
    const activeRate = isCustomRate ? (parseFloat(customRateText) || 0) : gstRate;

    // 2. Resolve taxable value / subtotal
    let subtotal = 0;
    let discountAmount = 0;
    let taxableValue = 0;

    if (enableAdvanced) {
      const uPrice = parseFloat(unitPrice) || 0;
      const qty = parseInt(quantity, 10) || 0;
      const discVal = parseFloat(discountValue) || 0;

      subtotal = uPrice * qty;
      if (discountType === 'percentage') {
        discountAmount = subtotal * (discVal / 100);
      } else {
        discountAmount = discVal;
      }
      taxableValue = Math.max(0, subtotal - discountAmount);
    } else {
      taxableValue = parseFloat(amountInput) || 0;
    }

    // 3. Apply Add vs Reverse GST math
    let baseAmount = 0;
    let totalGst = 0;
    let grandTotal = 0;

    if (calcMode === 'add') {
      baseAmount = taxableValue;
      totalGst = (baseAmount * activeRate) / 100;
      grandTotal = baseAmount + totalGst;
    } else {
      grandTotal = taxableValue;
      baseAmount = (grandTotal * 100) / (100 + activeRate);
      totalGst = grandTotal - baseAmount;
    }

    // 4. Split tax components
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (transactionType === 'intra') {
      cgst = totalGst / 2;
      sgst = totalGst / 2;
    } else {
      igst = totalGst;
    }

    return {
      subtotal,
      discountAmount,
      taxableValue: Number(baseAmount.toFixed(2)),
      cgst: Number(cgst.toFixed(2)),
      sgst: Number(sgst.toFixed(2)),
      igst: Number(igst.toFixed(2)),
      totalGst: Number(totalGst.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      gstRate: activeRate
    };
  }, [
    calcMode,
    amountInput,
    gstRate,
    isCustomRate,
    customRateText,
    transactionType,
    enableAdvanced,
    unitPrice,
    quantity,
    discountType,
    discountValue
  ]);

  // Log calculation to local browser history
  const logToHistory = () => {
    if (Object.keys(errors).length > 0) return;
    const keyAmt = enableAdvanced ? calculations.subtotal : parseFloat(amountInput);
    if (isNaN(keyAmt) || keyAmt <= 0) return;

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      amount: keyAmt,
      rate: calculations.gstRate,
      mode: calcMode,
      gstAmount: calculations.totalGst,
      finalAmount: calculations.grandTotal,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newItem, ...history.filter(h => !(h.amount === newItem.amount && h.rate === newItem.rate && h.mode === newItem.mode))].slice(0, 15);
    setHistory(updated);
    localStorage.setItem('toolique_gst_hist', JSON.stringify(updated));
  };

  // Indian Currency Formatting Helper
  const formatINR = (val: number) => {
    return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Copy standard text report
  const copyResultsText = () => {
    const text = `GST Calculation Report (Toolique.in)
---------------------------------------
Mode: ${calcMode === 'add' ? 'Add GST (+)' : 'Remove GST (-)'}
GST Rate: ${calculations.gstRate}%
Transaction Type: ${transactionType === 'intra' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}
---------------------------------------
${enableAdvanced ? `Subtotal: ${formatINR(calculations.subtotal)}\nDiscount: ${formatINR(calculations.discountAmount)}\n` : ''}Taxable Amount: ${formatINR(calculations.taxableValue)}
Total GST: ${formatINR(calculations.totalGst)}
${transactionType === 'intra' ? `CGST @ ${(calculations.gstRate / 2)}%: ${formatINR(calculations.cgst)}\nSGST @ ${(calculations.gstRate / 2)}%: ${formatINR(calculations.sgst)}` : `IGST @ ${calculations.gstRate}%: ${formatINR(calculations.igst)}`}
---------------------------------------
Grand Total: ${formatINR(calculations.grandTotal)}`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Copy Invoice-Style text box
  const copyInvoiceText = () => {
    const text = `GST CALCULATION
Taxable Amount     : ${formatINR(calculations.taxableValue)}
${transactionType === 'intra' ? `CGST @ ${(calculations.gstRate / 2)}%        : ${formatINR(calculations.cgst)}\nSGST @ ${(calculations.gstRate / 2)}%        : ${formatINR(calculations.sgst)}` : `IGST @ ${calculations.gstRate}%        : ${formatINR(calculations.igst)}`}
---------------------------
Total GST          : ${formatINR(calculations.totalGst)}
Grand Total        : ${formatINR(calculations.grandTotal)}
---------------------------`;

    navigator.clipboard.writeText(text);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  // Print Invoice View
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>GST Calculation Invoice - Toolique</title>
          <style>
            body { font-family: monospace; padding: 40px; color: #333; line-height: 1.6; }
            h2 { border-bottom: 2px solid #333; padding-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 12px 0; }
            .divider { border-top: 1px dashed #999; margin: 20px 0; }
            .total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 10px; }
            .footer { margin-top: 40px; font-size: 0.8em; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <h2>GST CALCULATION INVOICE</h2>
          <div class="row"><span>Calculation Mode</span><span>${calcMode === 'add' ? 'Add GST' : 'Remove GST'}</span></div>
          <div class="row"><span>Transaction Type</span><span>${transactionType === 'intra' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}</span></div>
          <div class="divider"></div>
          ${enableAdvanced ? `
            <div class="row"><span>Subtotal (Qty x Price)</span><span>${formatINR(calculations.subtotal)}</span></div>
            <div class="row"><span>Discount Deducted</span><span>-${formatINR(calculations.discountAmount)}</span></div>
          ` : ''}
          <div class="row"><span>Taxable Base Value</span><span>${formatINR(calculations.taxableValue)}</span></div>
          ${transactionType === 'intra' ? `
            <div class="row"><span>CGST @ ${(calculations.gstRate / 2)}%</span><span>${formatINR(calculations.cgst)}</span></div>
            <div class="row"><span>SGST @ ${(calculations.gstRate / 2)}%</span><span>${formatINR(calculations.sgst)}</span></div>
          ` : `
            <div class="row"><span>IGST @ ${calculations.gstRate}%</span><span>${formatINR(calculations.igst)}</span></div>
          `}
          <div class="divider"></div>
          <div class="row total"><span>Grand Total</span><span>${formatINR(calculations.grandTotal)}</span></div>
          <div class="footer">Calculated on Toolique.in. Rates and taxes for informational purposes only.</div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download Invoice PDF via jsPDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFont('helvetica', 'normal');

    // Title banner
    doc.setFillColor(79, 70, 229); // Indigo banner
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('GST CALCULATION REPORT', 15, 25);
    doc.setFontSize(10);
    doc.text('Generated via Toolique.in', 15, 32);

    // Metadata
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.text('Calculation Summary', 15, 55);
    
    doc.setFontSize(10);
    doc.text(`Date/Time: ${new Date().toLocaleString('en-IN')}`, 15, 63);
    doc.text(`Taxation Scheme: Indian GST Slabs`, 15, 69);
    doc.text(`Transaction Type: ${transactionType === 'intra' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}`, 15, 75);
    doc.text(`Calculation Mode: ${calcMode === 'add' ? 'Add GST (+)' : 'Remove GST (-)'}`, 15, 81);

    // Draw table border
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 90, 195, 90);

    let currentY = 100;
    
    // Table content lines helper
    const drawRow = (label: string, value: string, isHeader = false) => {
      doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
      doc.text(label, 15, currentY);
      doc.text(value, 150, currentY);
      currentY += 8;
    };

    if (enableAdvanced) {
      drawRow('Subtotal (Quantity x Price)', formatINR(calculations.subtotal));
      drawRow('Discount Deducted', `-${formatINR(calculations.discountAmount)}`);
    }
    
    drawRow('Taxable Value (Base Price)', formatINR(calculations.taxableValue));
    
    if (transactionType === 'intra') {
      drawRow(`CGST @ ${(calculations.gstRate / 2)}%`, formatINR(calculations.cgst));
      drawRow(`SGST @ ${(calculations.gstRate / 2)}%`, formatINR(calculations.sgst));
    } else {
      drawRow(`IGST @ ${calculations.gstRate}%`, formatINR(calculations.igst));
    }

    doc.line(15, currentY - 3, 195, currentY - 3);
    currentY += 4;
    
    drawRow('Grand Total (Inclusive of Tax)', formatINR(calculations.grandTotal), true);

    // Draw border line
    doc.line(15, currentY, 195, currentY);

    // Disclaimer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Disclaimer: GST rules and rates are subject to updates. This calculator is for estimation', 15, currentY + 15);
    doc.text('and calculations purposes only and does not constitute official legal tax advice.', 15, currentY + 19);

    doc.save(`GST_Invoice_Report_${Date.now()}.pdf`);
  };

  // Generate URL parameters share link
  const getShareLink = () => {
    const params = new URLSearchParams();
    params.set('amount', amountInput);
    params.set('rate', calculations.gstRate.toString());
    params.set('mode', calcMode);
    params.set('type', transactionType);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left">
      
      {/* Dynamic Header Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-650 dark:text-indigo-400">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-zinc-900 dark:text-white text-sm">GST Tax Office</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Standard CGST, SGST, & IGST amortization splits</p>
          </div>
        </div>

        {/* Share Button Link */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(getShareLink());
            setCopiedText(true);
            setTimeout(() => setCopiedText(false), 2000);
          }}
          className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
        >
          {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedText ? 'Link Copied' : 'Share Scenario'}</span>
        </button>
      </div>

      {/* TWO COLUMN WORKSPACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CALCULATOR CONTROLS */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-850 pb-3">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Calculator Inputs</span>
            </h3>

            {/* Mode Selectors (Add vs Remove GST) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Calculation Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCalcMode('add')}
                  className={`py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    calcMode === 'add'
                      ? 'border-indigo-600 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                      : 'border-zinc-200 dark:border-zinc-800/60 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  <span>Add GST (+)</span>
                </button>
                <button
                  onClick={() => setCalcMode('remove')}
                  className={`py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    calcMode === 'remove'
                      ? 'border-indigo-600 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                      : 'border-zinc-200 dark:border-zinc-800/60 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  <span>Remove GST (Reverse)</span>
                </button>
              </div>
            </div>

            {/* Standard Amount Field (Only shown if Advanced Billing is disabled) */}
            {!enableAdvanced && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  {calcMode === 'add' ? 'Base Amount (Excl. GST)' : 'Total Amount (Incl. GST)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">₹</span>
                  <input
                    type="text"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    onBlur={logToHistory}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs font-bold focus:outline-none"
                    placeholder="Enter amount"
                  />
                </div>
                {errors.amount && <p className="text-[10px] text-rose-500 font-semibold">{errors.amount}</p>}
              </div>
            )}

            {/* Advanced Billing Toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs font-extrabold text-zinc-650 dark:text-zinc-350 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAdvanced}
                  onChange={(e) => setEnableAdvanced(e.target.checked)}
                  className="rounded border-zinc-300 text-indigo-650 focus:ring-indigo-500"
                />
                <span>Enable Quantity & Discount Billing</span>
              </label>
            </div>

            {/* Advanced Section Inputs */}
            {enableAdvanced && (
              <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Unit Price</label>
                    <input
                      type="number"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
                    />
                    {errors.unitPrice && <p className="text-[9px] text-rose-500 font-bold">{errors.unitPrice}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
                    />
                    {errors.quantity && <p className="text-[9px] text-rose-500 font-bold">{errors.quantity}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 items-end">
                  <div className="col-span-1 space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as DiscountType)}
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none"
                    >
                      <option value="percentage">Percent (%)</option>
                      <option value="fixed">Fixed (₹)</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider block">Discount Amount</label>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      onBlur={logToHistory}
                      className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs font-bold focus:outline-none font-mono"
                    />
                    {errors.discount && <p className="text-[9px] text-rose-500 font-bold">{errors.discount}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* GST SLABS RATES SELECTOR */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">GST Slab Rate (%)</label>
              <div className="grid grid-cols-5 gap-2">
                {slabs.map((slab) => (
                  <button
                    key={slab}
                    onClick={() => {
                      setGstRate(slab);
                      setIsCustomRate(false);
                    }}
                    className={`py-1.5 rounded-xl border text-xs font-extrabold transition ${
                      gstRate === slab && !isCustomRate
                        ? 'border-indigo-650 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                        : 'border-zinc-200 dark:border-zinc-800/60 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50'
                    }`}
                  >
                    {slab}%
                  </button>
                ))}
              </div>

              {/* Custom rate toggle */}
              <button
                onClick={() => setIsCustomRate(!isCustomRate)}
                className={`w-full py-2 rounded-xl border text-xs font-extrabold transition flex items-center justify-between px-3 ${
                  isCustomRate
                    ? 'border-indigo-650 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                    : 'border-zinc-200 dark:border-zinc-800/60 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50'
                }`}
              >
                <span>Custom GST percentage</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isCustomRate && (
                <div className="relative mt-2">
                  <input
                    type="number"
                    value={customRateText}
                    onChange={(e) => setCustomRateText(e.target.value)}
                    onBlur={logToHistory}
                    placeholder="Enter custom GST %"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 font-mono text-xs font-bold focus:outline-none"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">%</span>
                  {errors.rate && <p className="text-[10px] text-rose-500 font-semibold">{errors.rate}</p>}
                </div>
              )}
            </div>

            {/* TRANSACTION DESTINATION SELECTOR */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Transaction Destination</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTransactionType('intra')}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                    transactionType === 'intra'
                      ? 'border-indigo-600 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                      : 'border-zinc-200 dark:border-zinc-800/60 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  <span>Intra-State</span>
                  <span className="text-[9px] text-zinc-400 mt-0.5">CGST + SGST splits</span>
                </button>
                <button
                  onClick={() => setTransactionType('inter')}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                    transactionType === 'inter'
                      ? 'border-indigo-600 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                      : 'border-zinc-200 dark:border-zinc-800/60 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  <span>Inter-State</span>
                  <span className="text-[9px] text-zinc-400 mt-0.5">IGST unified tax</span>
                </button>
              </div>
            </div>

            {/* AMOUNT SHORTCUT PRESETS (Only shown if Advanced Billing is disabled) */}
            {!enableAdvanced && (
              <div className="space-y-2 pt-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Preset Base amounts</span>
                <div className="flex flex-wrap gap-1.5">
                  {[1000, 5000, 10000, 25000, 50000, 100000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmountInput(preset.toString())}
                      className="px-2.5 py-1 text-xs font-bold border border-zinc-250 dark:border-zinc-800 rounded-xl bg-zinc-50/40 dark:bg-zinc-950/20 hover:border-indigo-500/20 hover:bg-indigo-500/5 hover:text-indigo-650 transition"
                    >
                      ₹{preset.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED SUMMARY CARD */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* TAX Split Breakdown Card */}
          <div className="p-6 rounded-3xl bg-zinc-950 text-white shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase text-zinc-450 tracking-wider">GST TAX SLOTS</span>
                <h3 className="text-sm font-black text-indigo-400 mt-0.5">Split breakdown</h3>
              </div>
              <button
                onClick={copyResultsText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-350 hover:bg-zinc-850 hover:text-white transition"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied' : 'Copy splits'}</span>
              </button>
            </div>

            {/* Calculations Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/40">
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">Taxable base value</span>
                <div className="text-xl font-black font-mono text-white mt-1.5">
                  {formatINR(calculations.taxableValue)}
                </div>
              </div>
              <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/40">
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider block">Total GST ({calculations.gstRate}%)</span>
                <div className="text-xl font-black font-mono text-indigo-400 mt-1.5">
                  {formatINR(calculations.totalGst)}
                </div>
              </div>
            </div>

            {/* SPLITS LIST */}
            <div className="space-y-2.5 pt-1 text-xs">
              {enableAdvanced && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800/60 text-zinc-400">
                    <span>Invoice Subtotal (Qty x Price):</span>
                    <span className="font-mono font-bold text-white">{formatINR(calculations.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800/60 text-zinc-400">
                    <span>Discount Deducted:</span>
                    <span className="font-mono font-bold text-rose-400">-{formatINR(calculations.discountAmount)}</span>
                  </div>
                </>
              )}

              {transactionType === 'intra' ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800/60 text-zinc-450">
                    <span>CGST (Central GST — {(calculations.gstRate / 2)}%):</span>
                    <span className="font-mono font-bold text-zinc-100">{formatINR(calculations.cgst)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-800/60 text-zinc-450">
                    <span>SGST (State GST — {(calculations.gstRate / 2)}%):</span>
                    <span className="font-mono font-bold text-zinc-100">{formatINR(calculations.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center py-2 border-b border-zinc-800/60 text-zinc-455">
                  <span>IGST (Integrated GST — {calculations.gstRate}%):</span>
                  <span className="font-mono font-bold text-zinc-100">{formatINR(calculations.igst)}</span>
                </div>
              )}
            </div>

            {/* Total Highlight */}
            <div className="bg-gradient-to-r from-indigo-650 to-indigo-500 p-5 rounded-2xl mt-4 flex justify-between items-center shadow-lg shadow-indigo-600/10">
              <div>
                <span className="text-[10px] font-black text-indigo-150 uppercase tracking-wider block">Grand total (Incl. taxes)</span>
                <div className="text-2xl font-black font-mono text-white mt-0.5">
                  {formatINR(calculations.grandTotal)}
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl">
                <Percent className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* INVOICE-STYLE BREAKDOWN VIEW */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-850 pb-2">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Invoice receipt breakdown</span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={copyInvoiceText}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-550 transition-colors"
                  title="Copy Invoice text"
                >
                  {copiedInvoice ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handlePrint}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-550 transition-colors"
                  title="Print Invoice"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-550 transition-colors"
                  title="Download Invoice PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Receipt view block */}
            <div className="p-5 rounded-2xl border border-dashed border-zinc-250 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/20 font-mono text-xs text-zinc-700 dark:text-zinc-350 space-y-3.5">
              <div className="text-center font-extrabold uppercase border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-2">
                --- GST Invoice Details ---
              </div>
              {enableAdvanced && (
                <>
                  <div className="flex justify-between"><span>Subtotal (Qty x Price)</span><span>{formatINR(calculations.subtotal)}</span></div>
                  <div className="flex justify-between text-rose-500"><span>Discount</span><span>-{formatINR(calculations.discountAmount)}</span></div>
                </>
              )}
              <div className="flex justify-between font-bold"><span>Taxable Base Value</span><span>{formatINR(calculations.taxableValue)}</span></div>
              
              {transactionType === 'intra' ? (
                <>
                  <div className="flex justify-between"><span>CGST @ ${(calculations.gstRate / 2)}%</span><span>{formatINR(calculations.cgst)}</span></div>
                  <div className="flex justify-between"><span>SGST @ ${(calculations.gstRate / 2)}%</span><span>{formatINR(calculations.sgst)}</span></div>
                </>
              ) : (
                <div className="flex justify-between"><span>IGST @ ${calculations.gstRate}%</span><span>{formatINR(calculations.igst)}</span></div>
              )}
              <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-2 flex justify-between font-black text-sm text-zinc-900 dark:text-white">
                <span>Grand Total</span>
                <span>{formatINR(calculations.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* CALCULATION HISTORY */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-850 pb-2">
              <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-teal-500" />
                <span>Recent splits</span>
              </h3>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([]);
                    localStorage.removeItem('toolique_gst_hist');
                  }}
                  className="p-1 text-zinc-400 hover:text-rose-550"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {history.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-[10px]">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setAmountInput(h.amount.toString());
                      setGstRate(h.rate);
                      setCalcMode(h.mode);
                      setIsCustomRate(false);
                      setEnableAdvanced(false);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 flex flex-col space-y-1"
                  >
                    <div className="flex justify-between font-extrabold uppercase text-zinc-400">
                      <span>{h.mode === 'add' ? 'Add GST' : 'Remove GST'} ({h.rate}%)</span>
                      <span className="font-normal font-sans text-[8px]">{h.timestamp}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-zinc-700 dark:text-zinc-300">
                      <span>Base: ₹{h.amount.toLocaleString('en-IN')}</span>
                      <span>➔</span>
                      <span className="text-indigo-650 dark:text-indigo-400 font-bold">Total: ₹{h.finalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold italic text-center py-4">
                No recent calculations.
              </p>
            )}
          </div>

          {/* Collapsible How is GST calculated section */}
          <details className="group p-5 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/60 dark:border-zinc-800/80 cursor-pointer">
            <summary className="flex justify-between items-center text-xs font-black text-zinc-900 dark:text-zinc-200 uppercase tracking-wider select-none list-none">
              <span>How is GST calculated?</span>
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-3 text-xs leading-relaxed text-zinc-550 dark:text-zinc-400 space-y-3">
              <div>
                <h4 className="font-extrabold text-zinc-800 dark:text-zinc-200">1. Adding GST formula</h4>
                <p className="font-mono mt-1 text-[11px]">
                  GST = Taxable Amount × GST Rate / 100
                  <br />
                  Final Amount = Taxable Amount + GST
                </p>
              </div>
              <div>
                <h4 className="font-extrabold text-zinc-800 dark:text-zinc-200">2. Removing GST formula (Reverse GST)</h4>
                <p className="font-mono mt-1 text-[11px]">
                  Taxable Amount = Inclusive Amount × 100 / (100 + GST Rate)
                  <br />
                  GST = Inclusive Amount - Taxable Amount
                </p>
              </div>
              <div>
                <h4 className="font-extrabold text-zinc-800 dark:text-zinc-200">3. Splitting CGST + SGST</h4>
                <p className="font-mono mt-1 text-[11px]">
                  CGST = GST / 2
                  <br />
                  SGST = GST / 2
                </p>
              </div>
            </div>
          </details>

          {/* Legal disclaimer */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-450 dark:text-zinc-500 leading-relaxed font-medium">
            ⚠️ <strong>Legal Disclaimer:</strong> GST rates and tax bylaws are subject to update. Calculations compiled are for informational estimations only and do not constitute official accounting or tax advice.
          </div>
        </div>
      </div>
    </div>
  );
}
