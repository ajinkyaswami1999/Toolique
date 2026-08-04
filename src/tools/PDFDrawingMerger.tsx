import { useState } from 'react';
import { Copy, Check, Info, FileText, ArrowUp, ArrowDown, Trash2, Download, Plus } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

interface PDFSheet {
  id: string;
  name: string;
  size: string;
  pages: number;
  file?: File;
}

const MOCK_SHEETS: PDFSheet[] = [
  { id: 'sheet-1', name: 'G-101_Ground_Floor_Plan.pdf', size: '2.4 MB', pages: 1 },
  { id: 'sheet-2', name: 'A-201_Building_Elevations.pdf', size: '3.8 MB', pages: 2 },
  { id: 'sheet-3', name: 'E-401_Electrical_Lighting_Layout.pdf', size: '1.9 MB', pages: 1 }
];

export default function PDFDrawingMerger() {
  const [sheets, setSheets] = useState<PDFSheet[]>(MOCK_SHEETS);
  const [isMerging, setIsMerging] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newSheets: PDFSheet[] = Array.from(files).map((file) => ({
        id: Math.random().toString(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        pages: 1, // Assume 1 page until parsed
        file
      }));
      setSheets((prev) => [...prev, ...newSheets]);
    }
  };

  const moveSheet = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sheets.length - 1) return;

    const newSheets = [...sheets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap sheets
    const temp = newSheets[index];
    newSheets[index] = newSheets[targetIndex];
    newSheets[targetIndex] = temp;

    setSheets(newSheets);
  };

  const removeSheet = (id: string) => {
    setSheets((prev) => prev.filter((s) => s.id !== id));
  };

  // Real client-side PDF compile & merge logic
  const handleMergeAndDownload = async () => {
    if (sheets.length === 0) return;
    setIsMerging(true);

    try {
      // Create a new merged PDFDocument
      const mergedPdf = await PDFDocument.create();

      // Read and load each sheet
      for (const sheet of sheets) {
        if (sheet.file) {
          // Process real uploaded files
          const fileBytes = await sheet.file.arrayBuffer();
          const srcDoc = await PDFDocument.load(fileBytes);
          const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } else {
          // If it is a mock template file, generate a simple layout page in its place
          const srcDoc = await PDFDocument.create();
          const page = srcDoc.addPage([842, 595]); // Standard A3 Landscape
          
          // Add basic metadata label to mock PDF page
          page.drawText('TOOLIQUE CAD PDF DRAWING COMPILER', { x: 50, y: 500, size: 20 });
          page.drawText(`Sheet Component: ${sheet.name}`, { x: 50, y: 440, size: 14 });
          page.drawText(`Layout File Size: ${sheet.size}`, { x: 50, y: 410, size: 12 });
          
          const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
          copiedPages.forEach((p) => mergedPdf.addPage(p));
        }
      }

      // Save the compiled bytes
      const mergedPdfBytes = await mergedPdf.save();

      // Download trigger
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Compiled_Blueprint_Package.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Error compiling PDF Drawing package: ${err.message}`);
    } finally {
      setIsMerging(false);
    }
  };

  const copyReport = () => {
    const text = `Compiled PDF Blueprint Package Schedule
----------------------------------------
Total Sheets: ${sheets.length} pages
Compile Order:
${sheets.map((s, idx) => ` - Page ${idx + 1}: ${s.name} (${s.size})`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* File & Viewport Config Column */}
      <div className="lg:col-span-8 space-y-6">
        <div className="saas-card p-6 space-y-4">
          <h3 className="font-bold text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span>PDF Sheet Compilation Queue</span>
            </span>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-750 text-white text-[10px] font-bold cursor-pointer transition shadow-md">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Drawings</span>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </h3>

          <p className="text-xs text-zinc-400">
            Reorder the blueprint pages in the queue below. Page order in the list matches the final page order of the compiled PDF package.
          </p>

          {/* Blueprint sheet deck visualizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-4 bg-zinc-50 dark:bg-zinc-900/30">
            {sheets.map((sheet, idx) => (
              <div
                key={sheet.id}
                className="saas-card p-4 flex flex-col justify-between border-slate-700/60 bg-slate-900/10 hover:border-indigo-500/40 transition relative group"
              >
                {/* Index badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 font-mono text-[9px] font-black">
                  SHEET {idx + 1}
                </div>

                {/* Vector sheet wireframe mock */}
                <div className="w-full aspect-[4/3] border border-slate-800/60 rounded bg-zinc-950 flex flex-col justify-end p-2 mb-4 relative overflow-hidden select-none">
                  {/* Glowing blueprint lines */}
                  <div className="absolute inset-0 p-3 opacity-30">
                    <div className="w-full h-full border border-dashed border-indigo-500 flex flex-col justify-between p-2">
                      <div className="w-6 h-6 border border-indigo-500 rounded-full" />
                      <div className="h-2 w-12 bg-indigo-500" />
                    </div>
                  </div>

                  <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest truncate">
                    {sheet.name}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-zinc-400 font-bold font-mono">{sheet.size}</span>
                  
                  {/* Reordering controllers */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => moveSheet(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 text-zinc-450"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveSheet(idx, 'down')}
                      disabled={idx === sheets.length - 1}
                      className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 text-zinc-450"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeSheet(sheet.id)}
                      className="p-1 rounded hover:bg-rose-500/10 text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {sheets.length === 0 && (
              <div className="col-span-full py-16 text-center text-zinc-400 text-xs italic">
                Upload your blueprint files to start compiled document grouping.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compiler Action Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="saas-card p-6 flex flex-col justify-between h-full space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Compiler details</span>
              </span>
              <button
                onClick={copyReport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <span className="text-xs text-zinc-455">Compiled Package Size</span>
                <div className="text-3xl font-black mt-1 font-mono text-zinc-950 dark:text-white">
                  {sheets.length} <span className="text-sm font-semibold">Sheets</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleMergeAndDownload}
                disabled={sheets.length === 0 || isMerging}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isMerging ? 'Compiling PDF Package...' : 'Compile & Download Package'}</span>
              </button>

              {/* PDF Details summary */}
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 text-xs">
                <span className="text-[10px] text-zinc-555 font-black uppercase tracking-wider block">Document Checklist</span>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total PDF files in queue</span>
                  <span className="font-bold font-mono text-zinc-950 dark:text-white">{sheets.length}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-2.5">
                  <span className="text-zinc-450">Format Integrity</span>
                  <span className="font-bold text-emerald-555">Vector (PDF-lib)</span>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 text-[11px] text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                <p>
                  This PDF Compiler processes document structures in client-side memory. All text layers and vector line weights are fully preserved in the compiled output.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}