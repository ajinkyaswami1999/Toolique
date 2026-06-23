import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Plus, Trash2, Download, FileSpreadsheet, IndianRupee } from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  hsn: string;
  qty: number;
  rate: number;
  gstRate: number; // e.g. 18 for 18%
}

export default function GSTInvoiceGenerator() {
  const [sellerName, setSellerName] = useState('Acme Enterprise');
  const [sellerGstin, setSellerGstin] = useState('27AAAAA1111A1Z1');
  const [sellerAddress, setSellerAddress] = useState('123 Industrial Area, Mumbai, MH');
  
  const [clientName, setClientName] = useState('Global Retailers Ltd');
  const [clientGstin, setClientGstin] = useState('27BBBBB2222B2Z2');
  const [clientAddress, setClientAddress] = useState('456 Commerce Plaza, Pune, MH');

  const [invoiceNo, setInvoiceNo] = useState('INV-2026-001');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [taxType, setTaxType] = useState<'cgst-sgst' | 'igst'>('cgst-sgst');

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Consulting Service', hsn: '9983', qty: 1, rate: 10000, gstRate: 18 },
    { id: '2', description: 'Product Hardware A', hsn: '8471', qty: 5, rate: 2500, gstRate: 12 }
  ]);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      hsn: '',
      qty: 1,
      rate: 0,
      gstRate: 18
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
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

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  items.forEach(item => {
    const taxableValue = item.qty * item.rate;
    const tax = taxableValue * (item.gstRate / 100);
    if (taxType === 'cgst-sgst') {
      cgstTotal += tax / 2;
      sgstTotal += tax / 2;
    } else {
      igstTotal += tax;
    }
  });

  const totalTax = cgstTotal + sgstTotal + igstTotal;
  const grandTotal = subtotal + totalTax;

  const handleGeneratePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Font configuration
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59); // zinc-800
    doc.text('TAX INVOICE', 105, 20, { align: 'center' });

    // Dividers
    doc.setDrawColor(226, 232, 240); // zinc-200
    doc.line(15, 25, 195, 25);

    // Metadata details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice No:', 15, 32);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceNo, 38, 32);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 15, 37);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceDate, 38, 37);

    doc.setFont('helvetica', 'bold');
    doc.text('Tax Scheme:', 15, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(taxType === 'cgst-sgst' ? 'Intra-state (CGST + SGST)' : 'Inter-state (IGST)', 38, 42);

    // Billing Parties details side-by-side
    doc.line(15, 46, 195, 46);
    
    // Seller Info
    doc.setFont('helvetica', 'bold');
    doc.text('TRANSPORT / SELLER (From)', 15, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${sellerName}`, 15, 57);
    doc.text(`GSTIN: ${sellerGstin}`, 15, 62);
    doc.text(`Address: ${sellerAddress}`, 15, 67, { maxWidth: 80 });

    // Client Info
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO / BUYER (To)', 110, 52);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${clientName}`, 110, 57);
    doc.text(`GSTIN: ${clientGstin}`, 110, 62);
    doc.text(`Address: ${clientAddress}`, 110, 67, { maxWidth: 80 });

    // Items table Header
    let currentY = 82;
    doc.line(15, currentY, 195, currentY);
    currentY += 4;
    
    doc.setFont('helvetica', 'bold');
    doc.text('S.No', 15, currentY);
    doc.text('Item Description', 27, currentY);
    doc.text('HSN', 80, currentY);
    doc.text('Qty', 98, currentY);
    doc.text('Rate', 112, currentY);
    doc.text('Taxable', 132, currentY);
    doc.text('GST %', 155, currentY);
    doc.text('Total', 178, currentY);

    currentY += 2.5;
    doc.line(15, currentY, 195, currentY);
    currentY += 4.5;

    doc.setFont('helvetica', 'normal');
    items.forEach((item, index) => {
      const taxable = item.qty * item.rate;
      const tax = taxable * (item.gstRate / 100);
      const total = taxable + tax;

      doc.text(String(index + 1), 15, currentY);
      doc.text(item.description || 'N/A', 27, currentY, { maxWidth: 50 });
      doc.text(item.hsn || 'N/A', 80, currentY);
      doc.text(String(item.qty), 98, currentY);
      doc.text(item.rate.toFixed(2), 112, currentY);
      doc.text(taxable.toFixed(2), 132, currentY);
      doc.text(`${item.gstRate}%`, 155, currentY);
      doc.text(total.toFixed(2), 178, currentY);

      currentY += 7.5;
    });

    // Summary calculations
    doc.line(15, currentY, 195, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 135, currentY);
    doc.text(`Rs. ${subtotal.toFixed(2)}`, 172, currentY);
    currentY += 5;

    if (taxType === 'cgst-sgst') {
      doc.text('CGST (Central Tax):', 135, currentY);
      doc.text(`Rs. ${cgstTotal.toFixed(2)}`, 172, currentY);
      currentY += 5;

      doc.text('SGST (State Tax):', 135, currentY);
      doc.text(`Rs. ${sgstTotal.toFixed(2)}`, 172, currentY);
      currentY += 5;
    } else {
      doc.text('IGST (Integrated Tax):', 135, currentY);
      doc.text(`Rs. ${igstTotal.toFixed(2)}`, 172, currentY);
      currentY += 5;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', 135, currentY);
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, 172, currentY);

    // Footer
    currentY += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('This is a computer generated invoice and does not require signatures.', 105, currentY, { align: 'center' });

    // Trigger download
    doc.save(`invoice-${invoiceNo}.pdf`);
  };

  return (
    <div className="grid grid-cols-1 gap-6 text-left">
      <div className="saas-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
              <span>GST Tax Invoice Generator</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Generate compliant GST invoices in PDF format without storage.</p>
          </div>
          <button
            onClick={handleGeneratePDF}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Generate & Download Invoice</span>
          </button>
        </div>

        {/* Configurations Forms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Seller details */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl space-y-3.5">
            <span className="block text-[10px] text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider">Seller (Your Details)</span>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Vendor Name</label>
              <input type="text" value={sellerName} onChange={(e) => setSellerName(e.target.value)} className="saas-input w-full text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Seller GSTIN</label>
              <input type="text" value={sellerGstin} onChange={(e) => setSellerGstin(e.target.value)} className="saas-input w-full text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Seller Address</label>
              <textarea value={sellerAddress} onChange={(e) => setSellerAddress(e.target.value)} className="saas-input w-full text-xs h-16 resize-none" />
            </div>
          </div>

          {/* Client details */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl space-y-3.5">
            <span className="block text-[10px] text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider">Client (Buyer Details)</span>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Client Name</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="saas-input w-full text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Client GSTIN</label>
              <input type="text" value={clientGstin} onChange={(e) => setClientGstin(e.target.value)} className="saas-input w-full text-xs" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Client Address</label>
              <textarea value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="saas-input w-full text-xs h-16 resize-none" />
            </div>
          </div>

          {/* Metadata configurations */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="block text-[10px] text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider">Invoice Metadata</span>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Invoice Number</label>
                <input type="text" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} className="saas-input w-full text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Invoice Date</label>
                <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="saas-input w-full text-xs cursor-pointer" />
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">GST Tax Scheme Type</label>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value as 'cgst-sgst' | 'igst')}
                className="saas-select w-full text-xs cursor-pointer"
              >
                <option value="cgst-sgst">Same State (CGST + SGST)</option>
                <option value="igst">Other State (IGST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3.5 pt-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-150 dark:border-zinc-850">
            <span className="text-xs font-bold text-zinc-500 uppercase">Line Items</span>
            <button
              onClick={handleAddItem}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-650 dark:text-indigo-400 rounded-lg text-xs font-bold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item Row</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/80 rounded-xl">
                <div className="col-span-1 text-xs text-zinc-400 font-bold text-center">#{idx + 1}</div>
                
                <div className="col-span-3 space-y-1">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    className="saas-input w-full text-xs"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <input
                    type="text"
                    placeholder="HSN/SAC"
                    value={item.hsn}
                    onChange={(e) => handleUpdateItem(item.id, 'hsn', e.target.value)}
                    className="saas-input w-full text-xs font-mono"
                  />
                </div>

                <div className="col-span-1.5 space-y-1">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) => handleUpdateItem(item.id, 'qty', Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="saas-input w-full text-xs text-center"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <input
                    type="number"
                    placeholder="Unit Price"
                    value={item.rate}
                    onChange={(e) => handleUpdateItem(item.id, 'rate', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="saas-input w-full text-xs"
                  />
                </div>

                <div className="col-span-1.5 space-y-1">
                  <select
                    value={item.gstRate}
                    onChange={(e) => handleUpdateItem(item.id, 'gstRate', parseInt(e.target.value, 10))}
                    className="saas-select w-full text-xs cursor-pointer"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-rose-600 dark:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Summary Row */}
        <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold leading-normal">
            Tax summary uses basic CGST/SGST splitting for intra-state supplies, or single IGST allocation for inter-state runs.
          </div>
          
          <div className="w-full sm:w-80 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl space-y-2.5">
            <div className="flex justify-between text-xs text-zinc-550 dark:text-zinc-450">
              <span>Subtotal:</span>
              <span className="font-bold flex items-center"><IndianRupee className="w-3.5 h-3.5" />{subtotal.toLocaleString()}</span>
            </div>
            
            {taxType === 'cgst-sgst' ? (
              <>
                <div className="flex justify-between text-xs text-zinc-550 dark:text-zinc-450">
                  <span>CGST Total (Central):</span>
                  <span className="font-semibold flex items-center"><IndianRupee className="w-3.5 h-3.5" />{cgstTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-550 dark:text-zinc-450">
                  <span>SGST Total (State):</span>
                  <span className="font-semibold flex items-center"><IndianRupee className="w-3.5 h-3.5" />{sgstTotal.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-xs text-zinc-550 dark:text-zinc-450">
                <span>IGST Total (Integrated):</span>
                <span className="font-semibold flex items-center"><IndianRupee className="w-3.5 h-3.5" />{igstTotal.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black text-zinc-800 dark:text-zinc-100 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <span>Total Invoice Value:</span>
              <span className="flex items-center"><IndianRupee className="w-4 h-4" />{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
