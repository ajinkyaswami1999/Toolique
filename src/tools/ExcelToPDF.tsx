import { useState } from 'react';
import { Upload, Download, CheckCircle2, AlertCircle, Loader2, Table } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as xlsx from 'xlsx';

export default function ExcelToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls') || uploadedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      setError(null);
      setFile(uploadedFile);
      setOutputBlob(null);
    } else {
      setError('Please select a valid Excel spreadsheet (.xlsx or .xls).');
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = xlsx.read(arrayBuffer, { type: 'array' });
      
      const doc = new jsPDF({
        orientation: 'l', // Landscape layout for tables
        unit: 'pt',
        format: 'a4',
      });

      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 36; // 0.5 inch margins

      let isFirstPage = true;

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        // Convert sheet to 2D array
        const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (rows.length === 0) return;

        if (!isFirstPage) {
          doc.addPage();
        }
        isFirstPage = false;

        // Draw Sheet Title
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(sheetName, margin, margin);
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);

        let cursorY = margin + 24;
        const rowHeight = 18;
        
        // Calculate dynamic column widths (fit to page)
        const maxCols = Math.max(...rows.map(r => r.length));
        const availableWidth = pageWidth - margin * 2;
        const colWidth = availableWidth / Math.max(maxCols, 1);

        rows.forEach((row) => {
          // Check if we need a new page for overflow rows
          if (cursorY + rowHeight > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
            
            // Redraw sheet name header on new page
            doc.setFont('Helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(`${sheetName} (Continued)`, margin, margin);
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8);
            cursorY += 16;
          }

          let cursorX = margin;

          for (let c = 0; c < maxCols; c++) {
            const cellValue = row[c] !== undefined ? String(row[c]) : '';
            
            // Draw cell boundary rect
            doc.setDrawColor(220, 225, 230); // light gray grid lines
            doc.rect(cursorX, cursorY, colWidth, rowHeight);

            // Clip cell text to colWidth
            const clippedText = doc.splitTextToSize(cellValue, colWidth - 6)[0] || '';

            // Draw text aligned within cell padding
            doc.text(clippedText, cursorX + 4, cursorY + 12);
            cursorX += colWidth;
          }

          cursorY += rowHeight;
        });
      });

      const pdfBlob = doc.output('blob');
      setOutputBlob(pdfBlob);
    } catch (err: any) {
      console.error(err);
      setError('An error occurred during Excel conversion. Verify sheet contents are readable.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputBlob || !file) return;
    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace(/\.xlsx|\.xls/g, '')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
      {/* File Upload */}
      <div className="md:col-span-7 space-y-6">
        <div className="saas-card p-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Select Excel Spreadsheet</h3>
          
          {!file ? (
            <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center hover:border-indigo-500/50 dark:hover:border-indigo-400/50 transition-colors">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 mx-auto text-zinc-400 dark:text-zinc-650 mb-3" />
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Click to upload or drag & drop spreadsheet</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Supports Excel spreadsheets (.xlsx, .xls)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                  <Table className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate pr-4">{file.name}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setFile(null); setOutputBlob(null); }}
                className="text-xs font-semibold text-red-500 hover:text-red-650 cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="md:col-span-5 space-y-6">
        <div className="saas-card p-6 text-center space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white text-left">Actions</h3>

          <button
            onClick={handleConvert}
            disabled={!file || isProcessing}
            className="w-full saas-button-primary py-3 flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                <span>Converting spreadsheet...</span>
              </>
            ) : (
              <span>Convert to PDF</span>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex gap-2.5 text-left">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {outputBlob && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-left space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold">Spreadsheet Converted!</span>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
