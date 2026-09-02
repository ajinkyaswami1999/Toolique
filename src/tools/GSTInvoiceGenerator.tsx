import { useState, useEffect, useMemo, useRef } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Building2, 
  User, 
  CreditCard, 
  Sparkles, 
  Save, 
  Eye, 
  Edit3 
} from 'lucide-react';

export interface IndianState {
  code: string;
  name: string;
}

export const INDIAN_STATES: IndianState[] = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh' },
  { code: '97', name: 'Other Territory' }
];

export interface InvoiceItem {
  id: string;
  description: string;
  hsn: string;
  qty: number;
  unit: string;
  rate: number;
  discount: number; // percentage
  gstRate: number; // 0, 5, 12, 18, 28
}

export function numberToIndianWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return 'INR Zero Rupees Only';
  
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
             'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertLessThousand(n: number): string {
    let str = '';
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + ' ';
    }
    return str.trim();
  }

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = '';
  const crore = Math.floor(integerPart / 10000000);
  let rem = integerPart % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  const hundred = rem % 1000;

  if (crore > 0) result += convertLessThousand(crore) + ' Crore ';
  if (lakh > 0) result += convertLessThousand(lakh) + ' Lakh ';
  if (thousand > 0) result += convertLessThousand(thousand) + ' Thousand ';
  if (hundred > 0) result += convertLessThousand(hundred) + ' ';

  result = result.trim() + ' Rupees';

  if (decimalPart > 0) {
    result += ' and ' + convertLessThousand(decimalPart) + ' Paise';
  }

  return 'INR ' + result.trim() + ' Only';
}

export default function GSTInvoiceGenerator() {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Seller Details
  const [sellerName, setSellerName] = useState('Acme Technologies Pvt Ltd');
  const [sellerGstin, setSellerGstin] = useState('27AAAAA1111A1Z1');
  const [sellerState, setSellerState] = useState('27');
  const [sellerAddress, setSellerAddress] = useState('101 Tech Hub, BKC, Bandra East, Mumbai, MH - 400051');

  // Client Details
  const [clientName, setClientName] = useState('Global Retailers India Ltd');
  const [clientGstin, setClientGstin] = useState('27BBBBB2222B2Z2');
  const [clientAddress, setClientAddress] = useState('456 Commerce Plaza, Senapati Bapat Road, Pune, MH - 411016');
  const [placeOfSupply, setPlaceOfSupply] = useState('27');

  // Invoice Metadata
  const [invoiceNo, setInvoiceNo] = useState('INV-2026-001');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [poNumber, setPoNumber] = useState('PO-98421');
  const [reverseCharge, setReverseCharge] = useState<'No' | 'Yes'>('No');

  // Payment & Bank Details
  const [bankName, setBankName] = useState('HDFC Bank Ltd');
  const [accountNumber, setAccountNumber] = useState('50200012345678');
  const [ifscCode, setIfscCode] = useState('HDFC0000123');
  const [upiId, setUpiId] = useState('acmetech@hdfcbank');

  // Terms & Notes
  const [notes, setNotes] = useState('Thank you for doing business with us. Please settle within the due date.');
  const [terms, setTerms] = useState('1. Interest @ 18% p.a. will be charged on overdue payments.\n2. Goods/Services once billed will not be cancelled.\n3. Subject to Mumbai Jurisdiction.');
  const [signatoryName, setSignatoryName] = useState('For Acme Technologies Pvt Ltd');

  // Line Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Full-Stack Software Architecture Consulting', hsn: '998314', qty: 1, unit: 'HRS', rate: 25000, discount: 0, gstRate: 18 },
    { id: '2', description: 'Cloud Infrastructure Setup & Optimization', hsn: '998313', qty: 2, unit: 'DAYS', rate: 12000, discount: 5, gstRate: 18 },
    { id: '3', description: 'UI/UX Design Mockups & Wireframes', hsn: '998361', qty: 1, unit: 'SET', rate: 15000, discount: 0, gstRate: 18 }
  ]);

  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');
  const [isSavedProfile, setIsSavedProfile] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Load saved seller profile on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('toolique_gst_seller_profile');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.sellerName) setSellerName(p.sellerName);
        if (p.sellerGstin) setSellerGstin(p.sellerGstin);
        if (p.sellerState) setSellerState(p.sellerState);
        if (p.sellerAddress) setSellerAddress(p.sellerAddress);
        if (p.bankName) setBankName(p.bankName);
        if (p.accountNumber) setAccountNumber(p.accountNumber);
        if (p.ifscCode) setIfscCode(p.ifscCode);
        if (p.upiId) setUpiId(p.upiId);
        if (p.signatoryName) setSignatoryName(p.signatoryName);
      }
    } catch {}
  }, []);

  // Auto-detect State from GSTIN
  const handleSellerGstinChange = (gstin: string) => {
    setSellerGstin(gstin);
    if (gstin.length >= 2) {
      const prefix = gstin.substring(0, 2);
      const matched = INDIAN_STATES.find(s => s.code === prefix);
      if (matched) {
        setSellerState(matched.code);
      }
    }
  };

  const handleClientGstinChange = (gstin: string) => {
    setClientGstin(gstin);
    if (gstin.length >= 2) {
      const prefix = gstin.substring(0, 2);
      const matched = INDIAN_STATES.find(s => s.code === prefix);
      if (matched) {
        setPlaceOfSupply(matched.code);
      }
    }
  };

  // Supply Mode: Intra-state vs. Inter-state
  const isIntraState = sellerState === placeOfSupply;

  // Add Item
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      hsn: '9983',
      qty: 1,
      unit: 'NOS',
      rate: 0,
      discount: 0,
      gstRate: 18
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Preset quick adder
  const handleAddPreset = (preset: { desc: string; hsn: string; rate: number; gst: number; unit: string }) => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: preset.desc,
      hsn: preset.hsn,
      qty: 1,
      unit: preset.unit,
      rate: preset.rate,
      discount: 0,
      gstRate: preset.gst
    };
    setItems([...items, newItem]);
  };

  // Calculations
  const itemCalculations = useMemo(() => {
    return items.map(item => {
      const gross = item.qty * item.rate;
      const discountAmt = gross * ((item.discount || 0) / 100);
      const taxable = gross - discountAmt;
      const taxAmount = taxable * (item.gstRate / 100);
      const cgst = isIntraState ? taxAmount / 2 : 0;
      const sgst = isIntraState ? taxAmount / 2 : 0;
      const igst = !isIntraState ? taxAmount : 0;
      const total = taxable + taxAmount;

      return {
        ...item,
        gross,
        discountAmt,
        taxable,
        cgst,
        sgst,
        igst,
        taxAmount,
        total
      };
    });
  }, [items, isIntraState]);

  const grossSubtotal = useMemo(() => itemCalculations.reduce((sum, i) => sum + i.gross, 0), [itemCalculations]);
  const totalDiscount = useMemo(() => itemCalculations.reduce((sum, i) => sum + i.discountAmt, 0), [itemCalculations]);
  const totalTaxable = useMemo(() => itemCalculations.reduce((sum, i) => sum + i.taxable, 0), [itemCalculations]);
  const totalCgst = useMemo(() => itemCalculations.reduce((sum, i) => sum + i.cgst, 0), [itemCalculations]);
  const totalSgst = useMemo(() => itemCalculations.reduce((sum, i) => sum + i.sgst, 0), [itemCalculations]);
  const totalIgst = useMemo(() => itemCalculations.reduce((sum, i) => sum + i.igst, 0), [itemCalculations]);
  const totalTax = totalCgst + totalSgst + totalIgst;
  const grandTotal = totalTaxable + totalTax;

  const totalInWords = useMemo(() => numberToIndianWords(grandTotal), [grandTotal]);

  // Generate UPI QR Code
  useEffect(() => {
    if (upiId && grandTotal > 0) {
      const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId.trim())}&pn=${encodeURIComponent(sellerName.trim())}&am=${grandTotal.toFixed(2)}&tn=Invoice%20${encodeURIComponent(invoiceNo)}&cu=INR`;
      QRCode.toDataURL(upiUrl, { width: 140, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
        .then(url => setUpiQrDataUrl(url))
        .catch(() => setUpiQrDataUrl(''));
    } else {
      setUpiQrDataUrl('');
    }
  }, [upiId, sellerName, grandTotal, invoiceNo]);

  // Save Seller Profile
  const handleSaveProfile = () => {
    const profile = {
      sellerName,
      sellerGstin,
      sellerState,
      sellerAddress,
      bankName,
      accountNumber,
      ifscCode,
      upiId,
      signatoryName
    };
    try {
      localStorage.setItem('toolique_gst_seller_profile', JSON.stringify(profile));
      setIsSavedProfile(true);
      setTimeout(() => setIsSavedProfile(false), 2500);
    } catch {}
  };

  // Generate jsPDF Download
  const handleGeneratePDF = async () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const sellerStateObj = INDIAN_STATES.find(s => s.code === sellerState);
    const posStateObj = INDIAN_STATES.find(s => s.code === placeOfSupply);

    // Primary Header Banner
    doc.setFillColor(30, 41, 59); // Zinc-800
    doc.rect(14, 12, 182, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('TAX INVOICE', 105, 21, { align: 'center' });

    // Top Details Container
    let y = 32;
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

    // Invoice Metadata Block (Right aligned)
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice No:', 125, y);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceNo, 150, y);

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Date:', 125, y);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceDate, 150, y);

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', 125, y);
    doc.setFont('helvetica', 'normal');
    doc.text(dueDate, 150, y);

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Place of Supply:', 125, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${posStateObj?.code || ''} - ${posStateObj?.name || ''}`, 150, y);

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Reverse Charge:', 125, y);
    doc.setFont('helvetica', 'normal');
    doc.text(reverseCharge, 150, y);

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Supply Mode:', 125, y);
    doc.setFont('helvetica', 'normal');
    doc.text(isIntraState ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)', 150, y);

    // Seller Info (Left aligned)
    let ySeller = 32;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(sellerName, 14, ySeller);
    
    ySeller += 4.5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('GSTIN:', 14, ySeller);
    doc.setFont('helvetica', 'normal');
    doc.text(sellerGstin, 26, ySeller);

    ySeller += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('State:', 14, ySeller);
    doc.setFont('helvetica', 'normal');
    doc.text(`${sellerStateObj?.code || ''} - ${sellerStateObj?.name || ''}`, 24, ySeller);

    ySeller += 4;
    doc.text(sellerAddress, 14, ySeller, { maxWidth: 90 });

    // Divider Line
    y = Math.max(y + 2, ySeller + 10);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, 196, y);

    // Billed To Block
    y += 5;
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y - 1, 182, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('BILLED TO / BUYER DETAILS', 16, y + 3);

    y += 9;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(clientName, 16, y);

    y += 4.5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Buyer GSTIN:', 16, y);
    doc.setFont('helvetica', 'normal');
    doc.text(clientGstin || 'Unregistered (URP)', 36, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Place of Supply:', 110, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${posStateObj?.code || ''} - ${posStateObj?.name || ''}`, 135, y);

    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('Address:', 16, y);
    doc.setFont('helvetica', 'normal');
    doc.text(clientAddress, 30, y, { maxWidth: 150 });

    // Table Header
    y += 8;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 7, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(14, y, 182, 7, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('#', 16, y + 4.5);
    doc.text('Description of Goods / Services', 24, y + 4.5);
    doc.text('HSN/SAC', 90, y + 4.5);
    doc.text('Qty', 108, y + 4.5);
    doc.text('Rate (Rs.)', 122, y + 4.5);
    doc.text('Taxable', 142, y + 4.5);
    doc.text('GST %', 162, y + 4.5);
    doc.text('Total (Rs.)', 178, y + 4.5);

    y += 7;

    // Line Items Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    itemCalculations.forEach((item, idx) => {
      doc.setDrawColor(226, 232, 240);
      doc.line(14, y + 6, 196, y + 6);

      doc.text(String(idx + 1), 16, y + 4);
      doc.text(item.description || 'N/A', 24, y + 4, { maxWidth: 64 });
      doc.text(item.hsn || '9983', 90, y + 4);
      doc.text(`${item.qty} ${item.unit}`, 108, y + 4);
      doc.text(item.rate.toFixed(2), 122, y + 4);
      doc.text(item.taxable.toFixed(2), 142, y + 4);
      doc.text(`${item.gstRate}%`, 162, y + 4);
      doc.text(item.total.toFixed(2), 178, y + 4);

      y += 6.5;
    });

    // Summary Section
    y += 4;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);

    // Left Column: Bank Details & UPI QR Code
    let yBottomLeft = y + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('BANK & PAYMENT DETAILS', 16, yBottomLeft);

    yBottomLeft += 4;
    doc.setFontSize(7.5);
    doc.text('Bank Name:', 16, yBottomLeft);
    doc.setFont('helvetica', 'normal');
    doc.text(bankName, 35, yBottomLeft);

    yBottomLeft += 3.5;
    doc.setFont('helvetica', 'bold');
    doc.text('A/C Number:', 16, yBottomLeft);
    doc.setFont('helvetica', 'normal');
    doc.text(accountNumber, 35, yBottomLeft);

    yBottomLeft += 3.5;
    doc.setFont('helvetica', 'bold');
    doc.text('IFSC Code:', 16, yBottomLeft);
    doc.setFont('helvetica', 'normal');
    doc.text(ifscCode, 35, yBottomLeft);

    yBottomLeft += 3.5;
    doc.setFont('helvetica', 'bold');
    doc.text('UPI VPA:', 16, yBottomLeft);
    doc.setFont('helvetica', 'normal');
    doc.text(upiId, 35, yBottomLeft);

    // Embed QR Code
    if (upiQrDataUrl) {
      try {
        doc.addImage(upiQrDataUrl, 'PNG', 75, y + 4, 22, 22);
        doc.setFontSize(6.5);
        doc.text('Scan & Pay UPI', 86, y + 28, { align: 'center' });
      } catch {}
    }

    // Right Column: Tax Breakdown & Total
    let ySummary = y + 5;
    const rightLabelX = 135;
    const rightValX = 194;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Taxable Amount:', rightLabelX, ySummary);
    doc.text(`Rs. ${totalTaxable.toFixed(2)}`, rightValX, ySummary, { align: 'right' });

    if (isIntraState) {
      ySummary += 4;
      doc.text('CGST (Central Tax):', rightLabelX, ySummary);
      doc.text(`Rs. ${totalCgst.toFixed(2)}`, rightValX, ySummary, { align: 'right' });

      ySummary += 4;
      doc.text('SGST (State Tax):', rightLabelX, ySummary);
      doc.text(`Rs. ${totalSgst.toFixed(2)}`, rightValX, ySummary, { align: 'right' });
    } else {
      ySummary += 4;
      doc.text('IGST (Integrated Tax):', rightLabelX, ySummary);
      doc.text(`Rs. ${totalIgst.toFixed(2)}`, rightValX, ySummary, { align: 'right' });
    }

    ySummary += 5;
    doc.setFillColor(241, 245, 249);
    doc.rect(130, ySummary - 3.5, 66, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Total Invoice Value:', rightLabelX, ySummary + 1);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, rightValX, ySummary + 1, { align: 'right' });

    // Amount in Words
    y = Math.max(yBottomLeft + 10, ySummary + 8);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, 182, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Amount in Words:', 16, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(totalInWords, 42, y + 4, { maxWidth: 150 });

    // Terms & Conditions Notes if present
    if (notes) {
      y += 8;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes: ', 16, y);
      doc.setFont('helvetica', 'normal');
      doc.text(notes, 28, y, { maxWidth: 160 });
    }

    // Signatory
    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(signatoryName, 150, y);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signatory', 150, y + 4);

    // Bottom Disclaimer
    y += 10;
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('This is a computer generated invoice and does not require physical signatures.', 105, y, { align: 'center' });

    // Trigger download
    doc.save(`GST-Invoice-${invoiceNo}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      
      {/* Header Bar & Tab Switcher */}
      <div className="saas-card p-5 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                GST Tax Invoice Generator
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Generate, preview, and download compliant GST invoices with auto state-supply calculation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* View Toggle Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Invoice</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleGeneratePDF}
            className="saas-button-primary py-2 px-4 text-xs font-black shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Auto Supply Scheme Notice Pill */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            Supply Mode: <strong>{isIntraState ? 'Intra-State Supply (CGST + SGST)' : 'Inter-State Supply (IGST)'}</strong>
          </span>
        </div>
        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
          Place of Supply: {placeOfSupply} - {INDIAN_STATES.find(s => s.code === placeOfSupply)?.name}
        </span>
      </div>

      {/* TAB 1: FORM EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-6">
          
          {/* SECTION 1: Seller & Buyer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Vendor (Seller) Info Card */}
            <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-850">
                <span className="text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Seller (Your Business)</span>
                </span>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>{isSavedProfile ? 'Saved!' : 'Save as Default'}</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Company / Business Name</label>
                  <input
                    type="text"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="saas-input w-full font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Seller GSTIN</label>
                    <input
                      type="text"
                      value={sellerGstin}
                      onChange={(e) => handleSellerGstinChange(e.target.value.toUpperCase())}
                      className="saas-input w-full font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Seller State</label>
                    <select
                      value={sellerState}
                      onChange={(e) => setSellerState(e.target.value)}
                      className="saas-select w-full"
                    >
                      {INDIAN_STATES.map(s => (
                        <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Full Business Address</label>
                  <textarea
                    value={sellerAddress}
                    onChange={(e) => setSellerAddress(e.target.value)}
                    rows={2}
                    className="saas-input w-full resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Buyer (Client) Info Card */}
            <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-850">
                <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Billed To (Buyer / Client)</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Customer</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Client / Company Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="saas-input w-full font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Client GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={clientGstin}
                      onChange={(e) => handleClientGstinChange(e.target.value.toUpperCase())}
                      placeholder="URP if Unregistered"
                      className="saas-input w-full font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Place of Supply (State)</label>
                    <select
                      value={placeOfSupply}
                      onChange={(e) => setPlaceOfSupply(e.target.value)}
                      className="saas-select w-full"
                    >
                      {INDIAN_STATES.map(s => (
                        <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Client Billing Address</label>
                  <textarea
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    rows={2}
                    className="saas-input w-full resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* SECTION 2: Invoice Metadata & Dates */}
          <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-3.5">
            <span className="text-xs font-black uppercase text-zinc-400">Invoice Identifiers & Parameters</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="saas-input w-full font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="saas-input w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="saas-input w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">PO / Ref No.</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="saas-input w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Reverse Charge</label>
                <select
                  value={reverseCharge}
                  onChange={(e) => setReverseCharge(e.target.value as 'No' | 'Yes')}
                  className="saas-select w-full"
                >
                  <option value="No">No (Regular)</option>
                  <option value="Yes">Yes (RCM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Line Items Table */}
          <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-850">
              <div>
                <span className="text-xs font-black uppercase text-zinc-900 dark:text-white">Goods / Services Line Items</span>
                <p className="text-[10px] text-zinc-400">Add items with HSN/SAC code, quantity, and GST slab rates.</p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Quick Add:</span>
                <button
                  type="button"
                  onClick={() => handleAddPreset({ desc: 'Software Consulting', hsn: '998314', rate: 20000, gst: 18, unit: 'HRS' })}
                  className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition"
                >
                  + Software
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset({ desc: 'Web Design & Development', hsn: '998313', rate: 15000, gst: 18, unit: 'SET' })}
                  className="px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition"
                >
                  + Web Dev
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="saas-button-primary py-1 px-3 text-xs font-bold shrink-0 ml-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>
            </div>

            {/* Line Items Container */}
            <div className="space-y-3">
              {items.map((item, idx) => {
                const itemCalc = itemCalculations[idx];

                return (
                  <div 
                    key={item.id} 
                    className="p-3.5 rounded-2xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/80 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs">
                      
                      {/* Serial Number & Description */}
                      <div className="sm:col-span-5 space-y-1">
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">
                          Item #{idx + 1} Description
                        </label>
                        <input
                          type="text"
                          placeholder="Service / Product Name"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          className="saas-input w-full font-semibold"
                        />
                      </div>

                      {/* HSN/SAC */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">HSN / SAC</label>
                        <input
                          type="text"
                          placeholder="e.g. 9983"
                          value={item.hsn}
                          onChange={(e) => handleUpdateItem(item.id, 'hsn', e.target.value)}
                          className="saas-input w-full font-mono text-center"
                        />
                      </div>

                      {/* Qty & Unit */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">Qty & Unit</label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(item.id, 'qty', Math.max(1, parseFloat(e.target.value) || 1))}
                            className="saas-input w-16 text-center font-bold"
                          />
                          <select
                            value={item.unit}
                            onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                            className="saas-select text-[10px] w-20"
                          >
                            <option value="NOS">NOS</option>
                            <option value="PCS">PCS</option>
                            <option value="HRS">HRS</option>
                            <option value="DAYS">DAYS</option>
                            <option value="SET">SET</option>
                            <option value="KG">KG</option>
                            <option value="SQFT">SQFT</option>
                            <option value="MTR">MTR</option>
                            <option value="BOX">BOX</option>
                          </select>
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase">Unit Rate (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => handleUpdateItem(item.id, 'rate', Math.max(0, parseFloat(e.target.value) || 0))}
                          className="saas-input w-full font-mono"
                        />
                      </div>

                      {/* Delete Action */}
                      <div className="sm:col-span-1 flex justify-end items-end pt-4 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length <= 1}
                          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Secondary Row: Discount, GST Rate & Line Total */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/60 text-xs">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">Discount %:</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) => handleUpdateItem(item.id, 'discount', Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                            className="saas-input w-16 text-center py-1 text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase">GST Slab:</span>
                          <select
                            value={item.gstRate}
                            onChange={(e) => handleUpdateItem(item.id, 'gstRate', parseInt(e.target.value, 10))}
                            className="saas-select py-1 text-xs font-bold w-24"
                          >
                            <option value={0}>0% (Nil)</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-bold">
                        <span className="text-zinc-400">Taxable: ₹{itemCalc?.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        <span className="text-indigo-600 dark:text-indigo-400">
                          Total: ₹{itemCalc?.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: Payment, Terms & Notes Details */}
          <div className="saas-card p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
            <span className="text-xs font-black uppercase text-zinc-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
              <span>Bank Account, Payment Details & Signatory</span>
            </span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="saas-input w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">A/C Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="saas-input w-full font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  className="saas-input w-full font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">UPI VPA (QR Code)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. company@upi"
                  className="saas-input w-full font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-zinc-100 dark:border-zinc-850">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Authorized Signatory Name</label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="saas-input w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Customer Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="saas-input w-full"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Terms & Conditions</label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={1}
                  className="saas-input w-full resize-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Summary Calculation Bar */}
          <div className="saas-card p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1 max-w-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Amount in Words
              </span>
              <p className="text-xs font-extrabold text-zinc-900 dark:text-white leading-relaxed">
                {totalInWords}
              </p>
            </div>

            <div className="w-full md:w-80 space-y-2 text-xs divide-y divide-zinc-100 dark:divide-zinc-850">
              <div className="flex justify-between text-zinc-500 pb-1.5">
                <span>Gross Item Subtotal:</span>
                <span className="font-bold text-zinc-900 dark:text-white">₹{grossSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 py-1.5">
                  <span>Total Discount Saved:</span>
                  <span className="font-bold">-₹{totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-500 py-1.5">
                <span>Taxable Subtotal:</span>
                <span className="font-bold text-zinc-900 dark:text-white">₹{totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              {isIntraState ? (
                <>
                  <div className="flex justify-between text-zinc-500 py-1.5">
                    <span>Central GST (CGST):</span>
                    <span className="font-bold text-zinc-900 dark:text-white">₹{totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 py-1.5">
                    <span>State GST (SGST):</span>
                    <span className="font-bold text-zinc-900 dark:text-white">₹{totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-zinc-500 py-1.5">
                  <span>Integrated GST (IGST):</span>
                  <span className="font-bold text-zinc-900 dark:text-white">₹{totalIgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-black text-indigo-600 dark:text-indigo-400 pt-2">
                <span>Grand Total (INR):</span>
                <span className="text-base flex items-center">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: LIVE A4 PRINT & PDF PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          
          {/* Action Bar */}
          <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-900 p-3 rounded-2xl">
            <span className="text-xs font-bold text-zinc-500">Live WYSIWYG A4 Tax Invoice Preview</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={handleGeneratePDF}
                className="saas-button-primary py-1.5 px-3 text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Clean Printable A4 Sheet */}
          <div 
            ref={printAreaRef}
            className="w-full bg-white text-zinc-900 p-8 sm:p-10 rounded-2xl border border-zinc-300 shadow-2xl space-y-6 max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none"
            style={{ minHeight: '297mm' }}
          >
            {/* Invoice Top Header */}
            <div className="border-b-2 border-zinc-900 pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-950 uppercase">{sellerName}</h1>
                <p className="text-xs text-zinc-600 font-medium max-w-md mt-1">{sellerAddress}</p>
                <div className="text-xs font-bold text-zinc-800 mt-1">
                  <span>GSTIN: {sellerGstin}</span> • <span>State: {sellerState} - {INDIAN_STATES.find(s => s.code === sellerState)?.name}</span>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block px-3 py-1 rounded bg-zinc-950 text-white font-black text-xs tracking-wider uppercase">
                  TAX INVOICE
                </span>
                <div className="text-xs font-bold text-zinc-900">
                  <span>Invoice No: </span><span className="font-mono font-black">{invoiceNo}</span>
                </div>
                <div className="text-xs text-zinc-600">
                  <span>Date: </span><strong>{invoiceDate}</strong>
                </div>
                <div className="text-xs text-zinc-600">
                  <span>Due Date: </span><strong>{dueDate}</strong>
                </div>
              </div>
            </div>

            {/* Billed To Section */}
            <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Billed To (Buyer):</span>
                <div className="text-sm font-black text-zinc-900">{clientName}</div>
                <div className="text-zinc-600 mt-1">{clientAddress}</div>
                <div className="font-bold text-zinc-800 mt-1">GSTIN: {clientGstin || 'Unregistered (URP)'}</div>
              </div>

              <div className="text-right space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block mb-1">Place of Supply:</span>
                <div className="font-extrabold text-zinc-900">{placeOfSupply} - {INDIAN_STATES.find(s => s.code === placeOfSupply)?.name}</div>
                <div className="text-zinc-600">Supply Scheme: <strong>{isIntraState ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}</strong></div>
                {reverseCharge === 'Yes' && <div className="text-amber-700 font-bold">Reverse Charge (RCM): <strong>Yes</strong></div>}
                {poNumber && <div className="text-zinc-600">PO Ref: <strong>{poNumber}</strong></div>}
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-y-2 border-zinc-900 bg-zinc-100 text-zinc-900 font-black text-[10px] uppercase">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Description</th>
                  <th className="py-2.5 px-2 text-center">HSN/SAC</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Rate</th>
                  <th className="py-2.5 px-2 text-right">Taxable</th>
                  <th className="py-2.5 px-2 text-center">GST</th>
                  <th className="py-2.5 px-2 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {itemCalculations.map((item, idx) => (
                  <tr key={item.id} className="text-xs">
                    <td className="py-2.5 px-2 text-zinc-500 font-bold">{idx + 1}</td>
                    <td className="py-2.5 px-2 font-bold text-zinc-900">{item.description}</td>
                    <td className="py-2.5 px-2 text-center font-mono text-zinc-600">{item.hsn}</td>
                    <td className="py-2.5 px-2 text-center font-semibold">{item.qty} {item.unit}</td>
                    <td className="py-2.5 px-2 text-right font-mono">₹{item.rate.toFixed(2)}</td>
                    <td className="py-2.5 px-2 text-right font-mono">₹{item.taxable.toFixed(2)}</td>
                    <td className="py-2.5 px-2 text-center font-bold text-zinc-700">{item.gstRate}%</td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-zinc-950">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary & Bank Info */}
            <div className="border-t-2 border-zinc-900 pt-4 grid grid-cols-12 gap-6 text-xs">
              
              {/* Left Column: Bank Details & UPI QR */}
              <div className="col-span-7 space-y-3">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex justify-between items-center gap-4">
                  <div className="space-y-1 text-[11px]">
                    <span className="text-[10px] font-black uppercase text-zinc-500 block">Bank Account Details</span>
                    <div><strong>Bank:</strong> {bankName}</div>
                    <div><strong>A/C No:</strong> <span className="font-mono">{accountNumber}</span></div>
                    <div><strong>IFSC:</strong> <span className="font-mono">{ifscCode}</span></div>
                    <div><strong>UPI:</strong> <span className="font-mono">{upiId}</span></div>
                  </div>

                  {upiQrDataUrl && (
                    <div className="text-center shrink-0">
                      <img src={upiQrDataUrl} alt="UPI Payment QR" className="w-20 h-20 border border-zinc-200 rounded-lg p-0.5 bg-white" />
                      <span className="text-[9px] font-bold text-zinc-500 block mt-0.5">Scan to Pay</span>
                    </div>
                  )}
                </div>

                {/* Amount in words */}
                <div className="p-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-[11px]">
                  <span className="font-bold text-zinc-600">Total in Words: </span>
                  <strong className="text-zinc-950">{totalInWords}</strong>
                </div>
              </div>

              {/* Right Column: Tax Breakdown & Grand Total */}
              <div className="col-span-5 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono font-bold">₹{totalTaxable.toFixed(2)}</span>
                </div>

                {isIntraState ? (
                  <>
                    <div className="flex justify-between text-zinc-600">
                      <span>CGST (Central Tax):</span>
                      <span className="font-mono font-bold">₹{totalCgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>SGST (State Tax):</span>
                      <span className="font-mono font-bold">₹{totalSgst.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-zinc-600">
                    <span>IGST (Integrated Tax):</span>
                    <span className="font-mono font-bold">₹{totalIgst.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-black text-zinc-950 border-t-2 border-zinc-900 pt-2">
                  <span>Total Amount Due:</span>
                  <span className="text-base font-mono">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Footer Signatory */}
            <div className="pt-8 flex justify-between items-end text-xs border-t border-zinc-200">
              <div className="space-y-1 text-zinc-500 max-w-sm text-[10px]">
                <strong>Terms & Conditions:</strong>
                <p className="whitespace-pre-line">{terms}</p>
                {notes && <p className="italic text-zinc-400 mt-1">Note: {notes}</p>}
              </div>

              <div className="text-right space-y-8">
                <div className="text-xs font-bold text-zinc-900">{signatoryName}</div>
                <div className="text-[10px] text-zinc-500 border-t border-zinc-400 pt-1">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
